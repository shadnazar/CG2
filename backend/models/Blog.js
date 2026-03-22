const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  metaDescription: String,
  content: { type: String, required: true },
  sections: {
    introduction: String,
    problem: String,
    causes: String,
    solutions: String,
    routine: String,
    ingredients: String,
    faqs: Array
  },
  keywords: [String],
  relatedProducts: [String],
  internalLinks: [{ title: String, url: String }],
  status: { type: String, default: 'published', enum: ['draft', 'published'] },
  viewCount: { type: Number, default: 0 },
  generatedBy: { type: String, default: 'AI' }
}, { timestamps: true });

blogSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Blog', blogSchema);