#!/usr/bin/env python3
"""
Cron job script for auto-generating blogs every 12 hours
Run with: python blog_cron.py
Schedule with crontab: 0 */12 * * * cd /app/backend && python blog_cron.py
"""
import asyncio
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

# Load environment
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from services.auto_blog_generator import AutoBlogGenerator


async def run_blog_generation():
    """Run the automated blog generation"""
    print(f"[{__import__('datetime').datetime.now()}] Starting auto blog generation...")
    
    # Connect to MongoDB
    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME')
    
    if not mongo_url or not db_name:
        print("Error: MONGO_URL or DB_NAME not set")
        return
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Initialize generator
    generator = AutoBlogGenerator(db)
    
    # Generate 12 blogs
    result = await generator.generate_and_save_blogs(count=12)
    
    if result.get("success"):
        print(f"✅ Generated {result['generated']} blogs, {result['failed']} failed")
        for blog in result.get("blogs", []):
            print(f"   - {blog['title']} [{blog['category']}]")
    else:
        print(f"❌ Generation failed: {result.get('error')}")
    
    client.close()
    print(f"[{__import__('datetime').datetime.now()}] Blog generation complete")


if __name__ == "__main__":
    asyncio.run(run_blog_generation())
