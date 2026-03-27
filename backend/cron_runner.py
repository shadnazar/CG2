#!/usr/bin/env python3
"""
Background cron runner for blog generation
Runs every 12 hours (at 6 AM and 6 PM IST)
"""
import asyncio
import time
from datetime import datetime, timedelta
import subprocess
import sys

def get_next_run_time():
    """Calculate next run time (6 AM or 6 PM IST)"""
    now = datetime.now()
    
    # Target times: 6:00 and 18:00
    today_6am = now.replace(hour=6, minute=0, second=0, microsecond=0)
    today_6pm = now.replace(hour=18, minute=0, second=0, microsecond=0)
    
    if now < today_6am:
        return today_6am
    elif now < today_6pm:
        return today_6pm
    else:
        # Next day 6 AM
        return today_6am + timedelta(days=1)

def run_blog_cron():
    """Execute the blog generation cron job"""
    print(f"[{datetime.now()}] Running blog generation cron...")
    result = subprocess.run(
        [sys.executable, "/app/backend/blog_cron.py"],
        capture_output=True,
        text=True,
        cwd="/app/backend"
    )
    print(result.stdout)
    if result.stderr:
        print(f"Errors: {result.stderr}")

def main():
    """Main loop - runs blog generation every 12 hours"""
    print(f"[{datetime.now()}] Blog Cron Runner started")
    print("Schedule: Every 12 hours (6 AM and 6 PM)")
    
    while True:
        next_run = get_next_run_time()
        wait_seconds = (next_run - datetime.now()).total_seconds()
        
        if wait_seconds > 0:
            print(f"[{datetime.now()}] Next blog generation at: {next_run}")
            print(f"Sleeping for {wait_seconds/3600:.1f} hours...")
            time.sleep(min(wait_seconds, 3600))  # Wake up every hour to check
        
        # Check if it's time to run
        now = datetime.now()
        if now.hour in [6, 18] and now.minute < 5:
            run_blog_cron()
            # Sleep for 5 minutes to avoid running multiple times
            time.sleep(300)

if __name__ == "__main__":
    main()
