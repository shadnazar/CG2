const OpenAI = require('openai');
const Blog = require('../models/Blog');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'mock-key'
});

function generateSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function generateBlogContent(keyword) {
  try {
    const prompt = `Write a comprehensive SEO blog post about "${keyword}" for an anti-aging skincare brand.

Format:
1. Title (SEO-optimized)
2. Meta Description (150 chars)
3. Introduction (hook the reader)
4. Problem (what issue does this solve?)
5. Causes (why does this happen?)
6. Solutions (how to fix it)
7. Skincare Routine (step-by-step)
8. Key Ingredients (explain each)
9. FAQs (5 common questions)
10. Conclusion with CTA

Tone: Professional, trustworthy, conversational
Length: 1200-1500 words
Include: product mentions for "Celesta Glow Anti-Aging Serum"`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    });

    const generatedContent = completion.choices[0].message.content;
    const title = extractTitle(generatedContent);
    const slug = generateSlug(title);

    const blog = await Blog.create({
      title,
      slug,
      content: generatedContent,
      keywords: [keyword],
      status: 'published',
      generatedBy: 'AI'
    });

    return blog;
  } catch (error) {
    console.error('AI generation error:', error);
    return createFallbackBlog(keyword);
  }
}

function extractTitle(content) {
  const match = content.match(/^#\s+(.+)$/m) || content.match(/^(.+)$/m);
  return match ? match[1].trim() : 'Anti-Aging Tips';
}

function createFallbackBlog(keyword) {
  const title = `${keyword} - Complete Guide`;
  return Blog.create({
    title,
    slug: generateSlug(title),
    content: `Complete guide about ${keyword} for anti-aging skincare.`,
    keywords: [keyword],
    status: 'published'
  });
}

module.exports = { generateBlogContent };