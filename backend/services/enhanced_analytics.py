"""
Enhanced Analytics Tracker - Real-time visitor tracking with page-wise analytics
"""
from datetime import datetime, timezone, timedelta
from typing import Optional
import uuid


class EnhancedAnalyticsTracker:
    def __init__(self, db):
        self.db = db
        # In-memory cache for live visitors (cleared after 5 minutes of inactivity)
        self.live_visitors = {}
    
    async def track_page_visit(self, page: str, session_id: str, user_agent: str = None, referrer: str = None):
        """Track a page visit with detailed information"""
        now = datetime.now(timezone.utc)
        
        # Update live visitors cache
        self.live_visitors[session_id] = {
            "page": page,
            "last_seen": now,
            "user_agent": user_agent
        }
        
        # Clean up stale sessions (older than 5 minutes)
        cutoff = now - timedelta(minutes=5)
        self.live_visitors = {
            k: v for k, v in self.live_visitors.items() 
            if v["last_seen"] > cutoff
        }
        
        # Store in database for historical tracking
        visit_doc = {
            "id": str(uuid.uuid4()),
            "session_id": session_id,
            "page": page,
            "user_agent": user_agent,
            "referrer": referrer,
            "timestamp": now.isoformat(),
            "date": now.strftime("%Y-%m-%d"),
            "hour": now.hour
        }
        
        await self.db.page_visits.insert_one(visit_doc)
        
        # Update page stats
        await self.db.page_stats.update_one(
            {"page": page, "date": now.strftime("%Y-%m-%d")},
            {
                "$inc": {"visits": 1},
                "$setOnInsert": {"page": page, "date": now.strftime("%Y-%m-%d")}
            },
            upsert=True
        )
        
        # Update total stats
        await self.db.total_stats.update_one(
            {"type": "global"},
            {
                "$inc": {"total_visits": 1},
                "$set": {"last_updated": now.isoformat()}
            },
            upsert=True
        )
        
        return {"tracked": True, "session_id": session_id}
    
    def get_live_visitors_count(self, page: str = None):
        """Get count of live visitors (active in last 5 minutes)"""
        now = datetime.now(timezone.utc)
        cutoff = now - timedelta(minutes=5)
        
        # Clean up stale sessions
        self.live_visitors = {
            k: v for k, v in self.live_visitors.items() 
            if v["last_seen"] > cutoff
        }
        
        if page:
            return len([v for v in self.live_visitors.values() if v["page"] == page])
        return len(self.live_visitors)
    
    def get_live_visitors_by_page(self):
        """Get live visitors count grouped by page"""
        now = datetime.now(timezone.utc)
        cutoff = now - timedelta(minutes=5)
        
        # Clean up stale sessions
        self.live_visitors = {
            k: v for k, v in self.live_visitors.items() 
            if v["last_seen"] > cutoff
        }
        
        page_counts = {}
        for visitor in self.live_visitors.values():
            page = visitor["page"]
            page_counts[page] = page_counts.get(page, 0) + 1
        
        return page_counts
    
    async def get_page_analytics(self, page: str = None, days: int = 7):
        """Get detailed page analytics"""
        end_date = datetime.now(timezone.utc)
        start_date = end_date - timedelta(days=days)
        
        query = {"date": {"$gte": start_date.strftime("%Y-%m-%d")}}
        if page:
            query["page"] = page
        
        stats = await self.db.page_stats.find(query, {"_id": 0}).to_list(1000)
        
        # Aggregate by page
        page_totals = {}
        daily_data = {}
        
        for stat in stats:
            pg = stat["page"]
            date = stat["date"]
            visits = stat.get("visits", 0)
            
            if pg not in page_totals:
                page_totals[pg] = 0
            page_totals[pg] += visits
            
            if date not in daily_data:
                daily_data[date] = {}
            daily_data[date][pg] = visits
        
        return {
            "page_totals": page_totals,
            "daily_data": daily_data,
            "period_days": days
        }
    
    async def get_total_stats(self):
        """Get total site statistics"""
        stats = await self.db.total_stats.find_one({"type": "global"}, {"_id": 0})
        return stats or {"total_visits": 0}
    
    async def get_hourly_distribution(self, page: str = None, days: int = 7):
        """Get visitor distribution by hour"""
        end_date = datetime.now(timezone.utc)
        start_date = end_date - timedelta(days=days)
        
        query = {"timestamp": {"$gte": start_date.isoformat()}}
        if page:
            query["page"] = page
        
        visits = await self.db.page_visits.find(query, {"_id": 0, "hour": 1}).to_list(10000)
        
        hourly = {i: 0 for i in range(24)}
        for visit in visits:
            hour = visit.get("hour", 0)
            hourly[hour] += 1
        
        return hourly


class VisitorLeadTracker:
    """Track visitor phone numbers for discount offers"""
    
    def __init__(self, db):
        self.db = db
    
    async def save_visitor_lead(self, phone: str, session_id: str, page: str, discount_code: str = "WELCOME50"):
        """Save a visitor's phone number when they claim discount"""
        now = datetime.now(timezone.utc)
        
        # Check if phone already exists
        existing = await self.db.visitor_leads.find_one({"phone": phone})
        if existing:
            return {"success": False, "message": "Phone number already registered", "already_claimed": True}
        
        lead_doc = {
            "id": str(uuid.uuid4()),
            "phone": phone,
            "session_id": session_id,
            "page": page,
            "discount_code": discount_code,
            "discount_amount": 50,
            "claimed_at": now.isoformat(),
            "date": now.strftime("%Y-%m-%d"),
            "converted": False,
            "conversion_order_id": None
        }
        
        await self.db.visitor_leads.insert_one(lead_doc)
        
        return {
            "success": True,
            "discount_code": discount_code,
            "discount_amount": 50,
            "message": "Discount unlocked!"
        }
    
    async def get_all_leads(self, limit: int = 500):
        """Get all visitor leads for admin panel"""
        leads = await self.db.visitor_leads.find({}, {"_id": 0}).sort("claimed_at", -1).limit(limit).to_list(limit)
        return leads
    
    async def get_leads_stats(self):
        """Get visitor leads statistics"""
        total = await self.db.visitor_leads.count_documents({})
        converted = await self.db.visitor_leads.count_documents({"converted": True})
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        today_leads = await self.db.visitor_leads.count_documents({"date": today})
        
        return {
            "total_leads": total,
            "converted_leads": converted,
            "conversion_rate": round((converted / total * 100) if total > 0 else 0, 1),
            "today_leads": today_leads
        }
    
    async def mark_converted(self, phone: str, order_id: str):
        """Mark a lead as converted when they place an order"""
        await self.db.visitor_leads.update_one(
            {"phone": phone},
            {"$set": {"converted": True, "conversion_order_id": order_id}}
        )
