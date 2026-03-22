const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const Location = require('../models/Location');
const { generateBlogContent } = require('../services/aiContentGenerator');

// Get all blogs
router.get('/blogs', async (req, res) => {
  try {
    const blogs = await Blog.find({ status: 'published' }).sort({ createdAt: -1 }).limit(50);
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single blog
router.get('/blogs/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, status: 'published' });
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search blogs
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    let blogs = await Blog.find({
      $text: { $search: q },
      status: 'published'
    }).limit(10);

    // If no blogs found, trigger AI generation
    if (blogs.length === 0) {
      const newBlog = await generateBlogContent(q);
      blogs = [newBlog];
    }

    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate blog (admin)
router.post('/admin/generate-blog', async (req, res) => {
  try {
    const { keyword } = req.body;
    const blog = await generateBlogContent(keyword);
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get location page data
router.get('/location/:state/:city?', async (req, res) => {
  try {
    const { state, city } = req.params;
    let location = await Location.findOne({ state, city: city || null });
    
    if (!location) {
      location = await Location.create({
        state,
        city: city || null,
        content: generateLocationContent(state, city)
      });
    }
    
    res.json(location);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function generateLocationContent(state, city) {
  const location = city || state;
  return {
    title: `Anti-Aging Solutions in ${location}`,
    description: `Best anti-aging serum and skincare routine for ${location} climate`,
    content: `Discover effective anti-aging solutions tailored for ${location}.`
  };
}

module.exports = router;