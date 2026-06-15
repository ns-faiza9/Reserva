const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const mongoose = require('mongoose');
const Resource = require('../models/Resource');
const fallbackCatalog = require('../../../resource-api/MOCK_DATA.json');

const VECTOR_DIMENSIONS = 96;
let seededPromise = null;
let memoryResources = fallbackCatalog.map(normalizeResource);

function normalizeResource(resource) {
  return {
    id: Number(resource.id),
    name: String(resource.name || 'Untitled Resource'),
    type: String(resource.type || 'General'),
    location: String(resource.location || 'TBD'),
    capacity: Number(resource.capacity || 1),
    price_per_hour: Number(resource.price_per_hour || resource.pricePerHour || 0),
    image: resource.image || '',
    available: resource.available !== false,
    hasProjector: Boolean(resource.hasProjector),
    hasGpu: Boolean(resource.hasGpu),
    description: resource.description || '',
    searchScore: resource.searchScore
  };
}

function isMongoReady() {
  return mongoose.connection.readyState === 1;
}

function resourceQueryById(id) {
  const filters = [];
  const numericId = Number(id);
  if (Number.isInteger(numericId)) filters.push({ id: numericId });
  if (mongoose.Types.ObjectId.isValid(id)) filters.push({ _id: id });
  return filters.length > 0 ? { $or: filters } : { id: -1 };
}

function nextMemoryId() {
  return Math.max(0, ...memoryResources.map(resource => resource.id || 0)) + 1;
}

function saveToMemory(payload) {
  const resource = normalizeResource({
    ...payload,
    id: payload.id || nextMemoryId()
  });
  memoryResources = [...memoryResources, resource];
  return resource;
}

async function ensureSeeded() {
  if (!isMongoReady()) return;
  if (!seededPromise) {
    seededPromise = (async () => {
      const count = await Resource.estimatedDocumentCount();
      if (count === 0) {
        await Resource.insertMany(memoryResources, { ordered: false });
      }
    })().catch(error => {
      seededPromise = null;
      console.warn('MongoDB seed skipped:', error.message);
    });
  }
  await seededPromise;
}

async function listResources() {
  if (!isMongoReady()) return memoryResources;
  try {
    await ensureSeeded();
    const resources = await Resource.find().lean();
    return resources.map(normalizeResource);
  } catch (error) {
    console.warn('Using in-memory resources because MongoDB query failed:', error.message);
    return memoryResources;
  }
}

async function createResource(payload) {
  if (!isMongoReady()) return saveToMemory(payload);
  try {
    await ensureSeeded();
    const resource = new Resource(payload);
    if (!resource.id) {
      const last = await Resource.findOne().sort({ id: -1 });
      resource.id = last ? last.id + 1 : 1;
    }
    await resource.save();
    return normalizeResource(resource.toObject());
  } catch (error) {
    console.warn('Saving resource in memory because MongoDB write failed:', error.message);
    return saveToMemory(payload);
  }
}

async function updateResourceById(id, payload) {
  if (isMongoReady()) {
    try {
      await ensureSeeded();
      const resource = await Resource.findOneAndUpdate(
        resourceQueryById(id),
        { $set: payload },
        { new: true, runValidators: true }
      ).lean();
      if (resource) return normalizeResource(resource);
    } catch (error) {
      console.warn('Updating in memory because MongoDB update failed:', error.message);
    }
  }

  const numericId = Number(id);
  const index = memoryResources.findIndex(resource => resource.id === numericId);
  if (index === -1) return null;
  const updated = normalizeResource({ ...memoryResources[index], ...payload, id: numericId });
  memoryResources = memoryResources.map(resource => resource.id === numericId ? updated : resource);
  return updated;
}

async function deleteResourceById(id) {
  if (isMongoReady()) {
    try {
      await ensureSeeded();
      const resource = await Resource.findOneAndDelete(resourceQueryById(id)).lean();
      if (resource) return normalizeResource(resource);
    } catch (error) {
      console.warn('Deleting in memory because MongoDB delete failed:', error.message);
    }
  }

  const numericId = Number(id);
  const resource = memoryResources.find(item => item.id === numericId);
  if (!resource) return null;
  memoryResources = memoryResources.filter(item => item.id !== numericId);
  return resource;
}

async function findOrCreateCatalogResource(payload) {
  const catalogId = Number(payload.catalogId);
  if (isMongoReady()) {
    try {
      await ensureSeeded();
      let resource = await Resource.findOne({ id: catalogId });
      if (!resource) {
        resource = new Resource(normalizeResource({ ...payload, id: catalogId }));
        await resource.save();
      }
      return normalizeResource(resource.toObject());
    } catch (error) {
      console.warn('Resolving catalog resource in memory because MongoDB failed:', error.message);
    }
  }

  let resource = memoryResources.find(item => item.id === catalogId);
  if (!resource) {
    resource = saveToMemory({ ...payload, id: catalogId });
  }
  return resource;
}

const SEMANTIC_SYNONYMS = {
  meeting: ["meeting", "conference", "boardroom", "room", "discussion", "seminar"],
  meetings: ["meeting", "conference", "boardroom", "room"],
  room: ["room", "space", "venue", "hall", "suite"],
  rooms: ["room", "space", "venue", "hall", "suite"],
  projector: ["projector", "presentation", "display", "screen", "conference"],
  presentation: ["projector", "presentation", "display", "screen"],
  lab: ["lab", "laboratory", "computer", "systems", "workstation"],
  laboratory: ["lab", "laboratory", "computer", "systems"],
  gpu: ["gpu", "graphics", "cuda", "lab", "workstation", "systems"],
  systems: ["systems", "computer", "workstation", "lab"],
  equipment: ["equipment", "device", "hardware", "gear"],
  available: ["available", "free", "open"],
  free: ["available", "free", "open"],
  hall: ["hall", "auditorium", "conference", "venue"],
};

function tokenize(text) {
  const matches = (text || '').toLowerCase().match(/[a-z0-9]+/g);
  return matches || [];
}

function expandTokens(text) {
  const expanded = [];
  for (const token of tokenize(text)) {
    expanded.push(token);
    const synonyms = SEMANTIC_SYNONYMS[token] || [];
    expanded.push(...synonyms);
  }
  return expanded;
}

function hashedEmbedding(text) {
  const vector = new Array(VECTOR_DIMENSIONS).fill(0.0);
  for (const token of expandTokens(text)) {
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const index = parseInt(hash.substring(0, 8), 16) % VECTOR_DIMENSIONS;
    vector[index] += 1.0;
  }
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) return vector;
  return vector.map(val => val / magnitude);
}

function cosineSimilarity(left, right) {
  return left.reduce((sum, val, idx) => sum + val * (right[idx] || 0), 0);
}

function resourceSearchText(resource) {
  const fields = [
    resource.name || '',
    resource.type || '',
    resource.location || '',
    resource.description || ''
  ];
  if (resource.hasProjector) fields.push("projector presentation screen display meeting conference");
  if (resource.hasGpu) fields.push("gpu graphics cuda lab computer systems workstation");
  if (resource.available) fields.push("available free open");
  return fields.join(' ');
}

// GET all resources
router.get('/', async (req, res) => {
  try {
    const resources = await listResources();
    res.json(resources);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// GET categories
router.get('/categories', async (req, res) => {
  try {
    const resources = await listResources();
    const categories = [...new Set(resources.map(resource => resource.type))];
    res.json(categories.sort());
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// GET search
router.get('/search', async (req, res) => {
  try {
    const { q, availableOnly } = req.query;
    if (!q) return res.json([]);
    
    const resources = await listResources();
    const queryEmbedding = hashedEmbedding(q);
    
    let scoredResources = resources.map(resource => {
      if (availableOnly === 'true' && !resource.available) return null;
      const text = resourceSearchText(resource);
      const embedding = hashedEmbedding(text);
      const score = cosineSimilarity(queryEmbedding, embedding);
      const data = resource.toObject();
      data.searchScore = parseFloat(score.toFixed(4));
      return data;
    }).filter(r => r !== null);
    
    const regex = new RegExp(q, 'i');
    scoredResources.sort((a, b) => {
      if (b.searchScore !== a.searchScore) return b.searchScore - a.searchScore;
      const aRegex = regex.test(a.name) || regex.test(a.type);
      const bRegex = regex.test(b.name) || regex.test(b.type);
      return (bRegex ? 1 : 0) - (aRegex ? 1 : 0);
    });
    
    res.json(scoredResources.slice(0, 25));
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// GET recommendations
router.get('/recommendations', async (req, res) => {
  try {
    const resources = (await listResources()).filter(resource => resource.available);
    resources.sort((a, b) => (b.capacity || 0) - (a.capacity || 0));
    res.json(resources.slice(0, 5));
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// POST from catalog
router.post('/from-catalog', async (req, res) => {
  try {
    const resource = await findOrCreateCatalogResource(req.body);
    res.json(resource);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// POST resource
router.post('/', async (req, res) => {
  try {
    const resource = await createResource(req.body);
    res.json(resource);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// PUT resource
router.put('/:id', async (req, res) => {
  try {
    const resource = await updateResourceById(req.params.id, req.body);
    if (!resource) return res.status(404).json({ detail: 'Resource not found' });
    res.json({ status: 'updated', resource });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// DELETE resource
router.delete('/:id', async (req, res) => {
  try {
    const resource = await deleteResourceById(req.params.id);
    if (!resource) return res.status(404).json({ detail: 'Resource not found' });
    res.json({ status: 'deleted' });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

module.exports = router;
