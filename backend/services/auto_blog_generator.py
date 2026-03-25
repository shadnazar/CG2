"""
Auto Blog Generator Service - Automated SEO blog generation every 12 hours
Generates beauty news, celebrity topics, tips, current affairs - all conversion optimized
"""
import os
import json
import uuid
import re
import asyncio
from datetime import datetime, timezone
from typing import List
from emergentintegrations.llm.chat import LlmChat, UserMessage
from services.image_service import get_image_for_category, get_image_for_keywords

# Indian locations for SEO targeting
INDIAN_LOCATIONS = [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad",
    "Jaipur", "Lucknow", "Chandigarh", "Kochi", "Indore", "Bhopal", "Coimbatore", "Surat",
    "Nagpur", "Visakhapatnam", "Patna", "Vadodara", "Goa", "Mysore", "Mangalore", "Thiruvananthapuram",
    "Nashik", "Aurangabad", "Rajkot", "Varanasi", "Amritsar", "Noida", "Gurgaon", "Faridabad"
]

# Beauty blog categories for variety
BLOG_CATEGORIES = [
    {"type": "news", "description": "Latest beauty industry news, product launches, brand updates"},
    {"type": "celebrity", "description": "Celebrity skincare secrets, routines, and transformations"},
    {"type": "tips", "description": "Practical skincare tips and how-to guides"},
    {"type": "mistakes", "description": "Common skincare mistakes to avoid"},
    {"type": "trends", "description": "Current beauty trends in India"},
    {"type": "ingredients", "description": "Deep dives into skincare ingredients"},
    {"type": "seasonal", "description": "Seasonal skincare advice for Indian climate"},
    {"type": "age-specific", "description": "Age-specific skincare routines (30s, 40s, 50s)"},
    {"type": "diy", "description": "DIY skincare recipes and home remedies"},
    {"type": "science", "description": "Science behind anti-aging and skincare"},
    {"type": "regional", "description": "Regional skincare traditions and practices"},
    {"type": "comparison", "description": "Product comparisons and reviews"}
]


class AutoBlogGenerator:
    def __init__(self, db):
        self.db = db
        self.api_key = os.environ.get('EMERGENT_LLM_KEY')
        
    def generate_slug(self, title: str) -> str:
        """Generate URL-friendly slug from title"""
        slug = title.lower()
        slug = re.sub(r'[^a-z0-9]+', '-', slug)
        slug = re.sub(r'^-|-$', '', slug)
        return slug[:80]  # Limit slug length
    
    async def get_trending_topics(self) -> List[dict]:
        """Get current trending beauty topics for blog generation"""
        if not self.api_key:
            raise ValueError("EMERGENT_LLM_KEY not configured")
        
        current_month = datetime.now().strftime("%B %Y")
        
        prompt = f"""Generate 12 unique, trending beauty and skincare blog topics for {current_month} in India.

Mix these categories: beauty news, celebrity skincare secrets, tips, common mistakes, trends, ingredients education, seasonal advice, DIY remedies, anti-aging science.

Each topic should:
1. Be highly searchable and SEO-friendly
2. Target Indian audience (mention Indian cities, climate, or preferences where relevant)
3. Be timely and relevant to current season/trends
4. Have potential to convert readers to anti-aging serum buyers

Return as JSON array:
[
    {{
        "title": "Compelling SEO title (50-60 chars)",
        "category": "news|celebrity|tips|mistakes|trends|ingredients|seasonal|diy|science",
        "target_location": "City name or 'India'",
        "keywords": ["keyword1", "keyword2", "keyword3"],
        "hook": "One line teaser to grab attention"
    }}
]

Make topics diverse - include celebrity news, practical tips, seasonal advice, and trending ingredients."""

        try:
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"topics-{uuid.uuid4().hex[:8]}",
                system_message="You are a beauty content strategist who understands Indian skincare trends and SEO."
            ).with_model("openai", "gpt-4o")
            
            response = await chat.send_message(UserMessage(text=prompt))
            
            json_match = re.search(r'\[[\s\S]*\]', response)
            if json_match:
                return json.loads(json_match.group())
            return []
        except Exception as e:
            print(f"Error getting trending topics: {e}")
            return []
    
    async def generate_single_blog(self, topic: dict) -> dict:
        """Generate a complete blog article from a topic"""
        if not self.api_key:
            raise ValueError("EMERGENT_LLM_KEY not configured")
        
        location_mention = f" (with focus on {topic.get('target_location', 'India')})" if topic.get('target_location') else ""
        keywords_str = ", ".join(topic.get('keywords', []))
        
        prompt = f"""Write a complete, SEO-optimized blog article.

Title: {topic['title']}{location_mention}
Category: {topic.get('category', 'tips')}
Target Keywords: {keywords_str}
Hook: {topic.get('hook', '')}

IMPORTANT WRITING GUIDELINES:
1. Write 800-1200 words in SIMPLE, conversational language
2. Write like you're talking to a friend - warm, friendly, relatable
3. Use short paragraphs (2-3 sentences max)
4. Use bullet points and numbered lists for easy reading
5. Include subheadings every 150-200 words
6. Use proper HTML formatting (h2, h3, p, ul, li, strong)
7. Avoid jargon - explain any technical terms simply
8. Include practical, actionable advice anyone can follow
9. Naturally mention how a good anti-aging serum can help
10. Add a subtle CTA for Celesta Glow serum
11. Make it feel like advice from a caring friend, not a textbook

Return as JSON:
{{
    "title": "Final SEO-optimized title (catchy, under 60 chars)",
    "meta_description": "150-160 character meta description that makes people want to read",
    "content": "Full HTML content - organized, easy to scan, human-friendly",
    "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
    "category": "{topic.get('category', 'tips')}",
    "read_time": "X min read",
    "image_prompt": "A detailed prompt to generate a relevant blog header image"
}}

Remember: Write like a helpful friend sharing beauty secrets, not like a corporate blog!"""

        try:
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"blog-{uuid.uuid4().hex[:8]}",
                system_message="""You are an expert beauty and skincare content writer for Indian audience.
                Your content is engaging, informative, and subtly promotes anti-aging skincare without being pushy.
                You write in a warm, relatable tone that resonates with Indian women aged 28-50."""
            ).with_model("openai", "gpt-4o")
            
            response = await chat.send_message(UserMessage(text=prompt))
            
            json_match = re.search(r'\{[\s\S]*\}', response)
            if json_match:
                return json.loads(json_match.group())
            return None
        except Exception as e:
            print(f"Error generating blog: {e}")
            return None
    
    async def generate_and_save_blogs(self, count: int = 12) -> dict:
        """Generate multiple blogs and save them to database"""
        results = {
            "success": True,
            "generated": 0,
            "failed": 0,
            "blogs": []
        }
        
        # Track used images to avoid duplicates
        used_images = []
        
        try:
            # Get trending topics
            topics = await self.get_trending_topics()
            if not topics:
                return {"success": False, "error": "Failed to get topics"}
            
            topics = topics[:count]  # Limit to requested count
            
            for topic in topics:
                try:
                    # Generate blog content
                    blog_data = await self.generate_single_blog(topic)
                    if not blog_data:
                        results["failed"] += 1
                        continue
                    
                    # Create slug
                    slug = self.generate_slug(blog_data.get('title', topic['title']))
                    
                    # Check for duplicate slug
                    existing = await self.db.blogs.find_one({"slug": slug})
                    if existing:
                        slug = f"{slug}-{uuid.uuid4().hex[:6]}"
                    
                    # Get relevant image for this blog
                    category = blog_data.get('category', topic.get('category', 'tips'))
                    keywords = blog_data.get('keywords', topic.get('keywords', []))
                    title = blog_data.get('title', topic['title'])
                    
                    # Try category-based image first, then keywords
                    image_url = get_image_for_category(category, used_images)
                    if not image_url:
                        image_url = get_image_for_keywords(keywords, title)
                    
                    used_images.append(image_url)
                    
                    # Save to database
                    now = datetime.now(timezone.utc).isoformat()
                    blog_doc = {
                        "id": str(uuid.uuid4()),
                        "title": blog_data.get('title', topic['title']),
                        "slug": slug,
                        "meta_description": blog_data.get('meta_description', ''),
                        "content": blog_data.get('content', ''),
                        "keywords": blog_data.get('keywords', topic.get('keywords', [])),
                        "category": blog_data.get('category', topic.get('category', 'tips')),
                        "read_time": blog_data.get('read_time', '5 min read'),
                        "status": "published",  # Auto-publish
                        "language": "en",
                        "view_count": 0,
                        "generated_by": "AI-Auto",
                        "target_location": topic.get('target_location', 'India'),
                        "image_url": image_url,  # Add image URL
                        "created_at": now,
                        "updated_at": now,
                        "published_at": now
                    }
                    
                    await self.db.blogs.insert_one(blog_doc)
                    results["generated"] += 1
                    results["blogs"].append({
                        "title": blog_doc["title"],
                        "slug": blog_doc["slug"],
                        "category": blog_doc["category"],
                        "image_url": image_url
                    })
                    
                    # Small delay between generations to avoid rate limits
                    await asyncio.sleep(1)
                    
                except Exception as e:
                    print(f"Error saving blog: {e}")
                    results["failed"] += 1
            
            # Log the generation
            await self.db.blog_generation_logs.insert_one({
                "id": str(uuid.uuid4()),
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "generated": results["generated"],
                "failed": results["failed"],
                "trigger": "auto"
            })
            
            return results
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def get_generation_history(self, limit: int = 10):
        """Get recent blog generation history"""
        logs = await self.db.blog_generation_logs.find({}, {"_id": 0}).sort("timestamp", -1).limit(limit).to_list(limit)
        return logs
