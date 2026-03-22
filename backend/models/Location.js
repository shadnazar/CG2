const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  state: { type: String, required: true },
  city: String,
  slug: { type: String, required: true, unique: true },
  content: {
    title: String,
    description: String,
    climate: String,
    skinIssues: [String],
    recommendations: String
  },
  viewCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Location', locationSchema);