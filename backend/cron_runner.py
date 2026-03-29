#!/usr/bin/env python3
"""
Background cron runner for blog generation
- Main blogs: Staggered schedule (6AM location, 12PM topic, 6PM trending, 12AM mix)
- Trending blogs: Every 1 hour (separate loop)
"""
import asyncio
import time
from datetime import datetime, timedelta
import subprocess
import sys
import os
import threading

# Track last hourly trending run to avoid duplicates
last_hourly_trending = None

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
    """Main loop - staggered blog generation + hourly trending"""
    print(f"[{datetime.now()}] Staggered Blog Cron Runner started")
    print("Schedule: 6AM (12 location), 12PM (6 topic), 6PM (trending), 12AM (6 mix)")
    print("PLUS: Hourly trending celebrity blogs (every 1 hour)")
    
    global last_hourly_trending
    last_hourly_trending = datetime.now()
    
    while True:
        now = datetime.now()
        
        # ============ HOURLY TRENDING BLOGS ============
        # Check if 1 hour has passed since last trending run
        if last_hourly_trending is None or (now - last_hourly_trending).total_seconds() >= 3600:
            print(f"[{now}] Running HOURLY trending blog generation...")
            try:
                run_blog_generation("trending")
                last_hourly_trending = now
                print(f"[{now}] Hourly trending complete. Next in 1 hour.")
            except Exception as e:
                print(f"[{now}] Hourly trending error: {e}")
        
        # ============ MAIN STAGGERED SCHEDULE ============
        next_run, job_type = get_next_run()
        target_hours = [0, 6, 12, 18]
        
        # Check if it's time for a main scheduled job
        if now.hour in target_hours and now.minute < 5:
            # Determine current job based on hour
            job_map = {6: "location", 12: "topic", 18: "trending", 0: "mix"}
            scheduled_job = job_map.get(now.hour, "location")
            print(f"[{now}] Running SCHEDULED {scheduled_job} blog generation...")
            run_blog_generation(scheduled_job)
            time.sleep(300)  # Avoid re-running scheduled job
        
        # Sleep for 5 minutes between checks (to catch hourly trigger)
        print(f"[{now}] Next hourly trending in: {max(0, 3600 - (now - last_hourly_trending).total_seconds()):.0f}s")
        time.sleep(300)  # Check every 5 minutes

if __name__ == "__main__":
    main()
