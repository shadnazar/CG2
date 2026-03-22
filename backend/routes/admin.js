const express = require('express');
const router = express.Router();

router.post('/admin/bulk-generate', async (req, res) => {
  try {
    const keywords = [
      'anti aging serum benefits',
      'reduce wrinkles naturally',
      'best retinol serum india',
      'hyaluronic acid for skin',
      'niacinamide benefits',
      'collagen boosting skincare',
      'dark spots removal',
      'skin hydration tips',
      'anti aging routine',
      'vitamin e for skin'
    ];

    const { generateBlogContent } = require('../services/aiContentGenerator');
    const results = [];

    for (const keyword of keywords) {
      const blog = await generateBlogContent(keyword);
      results.push(blog);
    }

    res.json({ generated: results.length, blogs: results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;