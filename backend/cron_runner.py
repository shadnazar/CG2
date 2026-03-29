#!/usr/bin/env python3
"""
Background cron runner for blog generation
Staggered schedule: Location blogs at 6AM, Topic blogs at 12PM, Trending at 6PM
"""
import asyncio
import time
from datetime import datetime, timedelta
import subprocess
import sys
import os

def get_next_run():
    """Calculate next run time with staggered schedule"""
    now = datetime.now()
    
    # Staggered schedule:
    # 6:00 AM - Location blogs (12)
    # 12:00 PM - Topic blogs (6)
    # 6:00 PM - Trending blogs (6)
    # 12:00 AM - Mix blogs (6)
    
    times = [
        (6, "location"),
        (12, "topic"),
        (18, "trending"),
        (0, "mix")
    ]
    
    for hour, job_type in times:
        target = now.replace(hour=hour, minute=0, second=0, microsecond=0)
        if now < target:
            return target, job_type
    
    # Next day 6 AM
    return now.replace(hour=6, minute=0, second=0, microsecond=0) + timedelta(days=1), "location"

def run_blog_generation(job_type):
    """Execute blog generation based on job type"""
    print(f"[{datetime.now()}] Running {job_type} blog generation...")
    
    script = f'''
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
import sys
sys.path.insert(0, '/app/backend')

async def generate():
    client = AsyncIOMotorClient(os.environ.get('MONGO_URL'))
    db = client[os.environ.get('DB_NAME', 'serum_ecommerce')]
    
    from services.auto_blog_generator import AutoBlogGenerator
    generator = AutoBlogGenerator(db)
    
    job_type = "{job_type}"
    
    if job_type == "location":
        result = await generator.generate_location_blogs(count=12)
        print(f"Location blogs: {{result.get('generated', 0)}} generated")
    elif job_type == "topic":
        result = await generator.generate_topic_blogs(count=6)
        print(f"Topic blogs: {{result.get('generated', 0)}} generated")
    elif job_type == "trending":
        try:
            from services.trending_news_generator import TrendingNewsBlogGenerator
            trending = TrendingNewsBlogGenerator(db)
            result = await trending.generate_trending_blogs(count=3)
            print(f"Trending blogs: {{result.get('successful', 0)}} generated")
        except Exception as e:
            print(f"Trending generation failed: {{e}}")
    else:
        result = await generator.generate_location_blogs(count=6)
        print(f"Mix blogs: {{result.get('generated', 0)}} generated")
    
    # Log to database
    from datetime import datetime, timezone
    await db.cron_logs.insert_one({{
        "job": f"{{job_type}}_blog_generation",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "generated": result.get('generated', result.get('successful', 0)),
        "job_type": job_type
    }})

asyncio.run(generate())
'''
    
    result = subprocess.run(
        [sys.executable, "-c", script],
        capture_output=True,
        text=True,
        cwd="/app/backend",
        env={**os.environ}
    )
    print(result.stdout)
    if result.stderr:
        print(f"Errors: {result.stderr[:500]}")

def main():
    """Main loop - staggered blog generation"""
    print(f"[{datetime.now()}] Staggered Blog Cron Runner started")
    print("Schedule: 6AM (12 location), 12PM (6 topic), 6PM (trending), 12AM (6 mix)")
    
    while True:
        next_run, job_type = get_next_run()
        wait_seconds = (next_run - datetime.now()).total_seconds()
        
        if wait_seconds > 0:
            print(f"[{datetime.now()}] Next: {job_type} blogs at {next_run}")
            print(f"Sleeping for {wait_seconds/3600:.1f} hours...")
            time.sleep(min(wait_seconds, 1800))  # Wake up every 30 min to check
        
        # Check if it's time to run
        now = datetime.now()
        target_hours = [0, 6, 12, 18]
        if now.hour in target_hours and now.minute < 5:
            _, current_job = get_next_run()
            # Determine current job based on hour
            job_map = {6: "location", 12: "topic", 18: "trending", 0: "mix"}
            run_blog_generation(job_map.get(now.hour, "location"))
            time.sleep(300)  # Avoid re-running

if __name__ == "__main__":
    main()
