const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  location: { type: String, required: true },
  capacity: { type: Number, required: true },
  price_per_hour: { type: Number, default: 0 },
  image: { type: String, default: '' },
  available: { type: Boolean, default: true },
  hasProjector: { type: Boolean, default: false },
  hasGpu: { type: Boolean, default: false },
  description: { type: String },
  searchScore: { type: Number } // For semantic search results
}, { timestamps: true });

resourceSchema.index({ id: 1 });

module.exports = mongoose.model('Resource', resourceSchema);
