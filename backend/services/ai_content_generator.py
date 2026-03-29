"""
AI Content Generator Service - For generating SEO-optimized blog content
"""
import os
import json
import uuid
import re
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage

# AI Content Generator Class
class AIContentGenerator:
    def __init__(self, db):
        self.db = db
        self.api_key = os.environ.get('EMERGENT_LLM_KEY')
        
    async def generate_blog_article(self, topic: str, keywords: list = None, target_audience: str = "Indian adults 28+"):
        """Generate a complete SEO-optimized blog article about anti-aging skincare"""
        
        if not self.api_key:
            raise ValueError("EMERGENT_LLM_KEY not configured")
        
        keywords_str = ", ".join(keywords) if keywords else "anti-aging, skincare, serum, wrinkles, fine lines"
        
        system_message = """You are an expert skincare and beauty content writer specializing in anti-aging products for the Indian market. 
        You write engaging, SEO-optimized blog articles that are informative yet accessible.
        Always include practical tips and relate content to Celesta Glow Anti-Aging Serum where appropriate.
        Write in a warm, professional tone that resonates with Indian readers."""
        
        prompt = f"""Write a comprehensive, SEO-optimized blog article about: {topic}

Target Audience: {target_audience}
Target Keywords: {keywords_str}

Please provide the response in the following JSON format:
{{
    "title": "Compelling SEO-friendly title (50-60 characters)",
    "meta_description": "Engaging meta description (150-160 characters)",
    "content": "Full HTML-formatted article content with h2, h3, p, ul, li tags. Include 800-1200 words.",
    "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
    "suggested_internal_links": ["related topic 1", "related topic 2"]
}}

Make the content:
1. Informative and backed by skincare science
2. Naturally incorporate the target keywords
3. Include practical tips and actionable advice
4. Reference how Celesta Glow can help (subtly, not pushy)
5. Optimized for Indian readers and climate considerations
6. Use proper HTML formatting for headings, paragraphs, and lists"""

        try:
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"blog-gen-{uuid.uuid4().hex[:8]}",
                system_message=system_message
            ).with_model("openai", "gpt-4o")
            
            user_message = UserMessage(text=prompt)
            response = await chat.send_message(user_message)
            
            # Parse JSON from response
            # Try to extract JSON from the response
            json_match = re.search(r'\{[\s\S]*\}', response)
            if json_match:
                article_data = json.loads(json_match.group())
            else:
                raise ValueError("Could not parse JSON from AI response")
            
            return {
                "success": True,
                "article": article_data,
                "generated_at": datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def generate_location_content(self, state: str, city: str = None):
        """Generate location-specific content for SEO pages"""
        
        if not self.api_key:
            raise ValueError("EMERGENT_LLM_KEY not configured")
        
        location = f"{city}, {state}" if city else state
        
        system_message = """You are a skincare expert who understands how different Indian climates and environments affect skin health.
        You create localized content that resonates with people from specific regions of India."""
        
        prompt = f"""Create location-specific skincare content for {location}, India.

Please provide the response in the following JSON format:
{{
    "title": "Anti-Aging Skincare in {location}",
    "description": "2-3 sentences about skincare needs specific to {location}",
    "climate": "Brief description of the local climate",
    "skin_issues": ["common skin issue 1", "common skin issue 2", "common skin issue 3"],
    "recommendations": "Personalized skincare advice for people in {location}",
    "local_tips": "1-2 tips specific to the local environment"
}}

Consider:
1. Local climate (humidity, pollution, sun exposure)
2. Common skin concerns in that region
3. How Celesta Glow's ingredients address local needs"""

        try:
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"location-gen-{uuid.uuid4().hex[:8]}",
                system_message=system_message
            ).with_model("openai", "gpt-4o")
            
            user_message = UserMessage(text=prompt)
            response = await chat.send_message(user_message)
            
            # Parse JSON from response
            json_match = re.search(r'\{[\s\S]*\}', response)
            if json_match:
                location_data = json.loads(json_match.group())
            else:
                raise ValueError("Could not parse JSON from AI response")
            
            return {
                "success": True,
                "content": location_data,
                "generated_at": datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def suggest_blog_topics(self, count: int = 5):
        """Generate blog topic suggestions based on trending skincare topics"""
        
        if not self.api_key:
            raise ValueError("EMERGENT_LLM_KEY not configured")
        
        from datetime import datetime
        current_month = datetime.now().strftime("%B %Y")
        current_day = datetime.now().strftime("%A")
        
        prompt = f"""Generate exactly {count} FRESH and TRENDING skincare blog topic titles for {current_day}, {current_month} in India.

Requirements:
- Target audience: Indian women aged 28-50
- Topics: anti-aging, skincare tips, celebrity beauty secrets, ingredient education
- Each title should be catchy, specific, and SEO-friendly (50-70 characters)
- Mix different types: celebrity secrets, DIY remedies, seasonal tips, ingredient guides, routines

IMPORTANT: Return ONLY a JSON array of topic title strings. Example:
["Celebrity Beauty Secret: How Deepika Maintains Youthful Skin", "5 Monsoon Skincare Mistakes That Age Your Skin Faster"]

Do NOT return objects or explanations - ONLY an array of {count} topic title strings."""

        try:
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"topics-gen-{uuid.uuid4().hex[:8]}",
                system_message="You return ONLY JSON arrays of strings. No objects, no explanations."
            ).with_model("openai", "gpt-4o")
            
            user_message = UserMessage(text=prompt)
            response = await chat.send_message(user_message)
            
            # Parse JSON array from response
            json_match = re.search(r'\[[\s\S]*?\]', response)
            if json_match:
                topics_raw = json.loads(json_match.group())
                
                # Extract simple strings from any complex structure
                topics = []
                for t in topics_raw:
                    if isinstance(t, str):
                        topics.append(t)
                    elif isinstance(t, dict):
                        # Extract title/topic from dict if AI returned complex structure
                        topics.append(t.get('topic', t.get('title', str(t))))
                
                return {
                    "success": True,
                    "topics": topics
                }
            else:
                raise ValueError("Could not parse JSON from AI response")
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
