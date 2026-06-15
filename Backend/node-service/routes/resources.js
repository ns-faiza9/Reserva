const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Resource = require('../models/Resource');

const VECTOR_DIMENSIONS = 96;
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
    const resources = await Resource.find();
    res.json(resources);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// GET categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Resource.distinct('type');
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
    
    const resources = await Resource.find();
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
    const resources = await Resource.find({ available: true });
    resources.sort((a, b) => (b.capacity || 0) - (a.capacity || 0));
    res.json(resources.slice(0, 5));
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// POST from catalog
router.post('/from-catalog', async (req, res) => {
  try {
    const { catalogId, name, type, location, capacity } = req.body;
    let resource = await Resource.findOne({ id: catalogId });
    if (!resource) {
      resource = new Resource({
        id: catalogId,
        name,
        type,
        location,
        capacity,
        available: true
      });
      await resource.save();
    }
    res.json(resource);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// POST resource
router.post('/', async (req, res) => {
  try {
    const resource = new Resource(req.body);
    if (!resource.id) {
       const last = await Resource.findOne().sort({ id: -1 });
       resource.id = last ? last.id + 1 : 1;
    }
    await resource.save();
    res.json(resource);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// PUT resource
router.put('/:id', async (req, res) => {
  try {
    const resource = await Resource.findOneAndUpdate(
      { $or: [{ id: req.params.id }, { _id: req.params.id }] },
      { $set: req.body },
      { new: true }
    );
    if (!resource) return res.status(404).json({ detail: 'Resource not found' });
    res.json({ status: 'updated', resource });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// DELETE resource
router.delete('/:id', async (req, res) => {
  try {
    const resource = await Resource.findOneAndDelete({ $or: [{ id: req.params.id }, { _id: req.params.id }] });
    if (!resource) return res.status(404).json({ detail: 'Resource not found' });
    res.json({ status: 'deleted' });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

module.exports = router;
