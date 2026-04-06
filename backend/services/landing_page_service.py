"""
Landing Page Service
Handles CRUD operations and AI content generation for problem-specific landing pages
"""
import os
from datetime import datetime, timezone
from typing import List, Optional, Dict
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from models.landing_page import (
    LandingPageContent, LandingPageCreate, LandingPageInDB,
    LANDING_PAGE_PROBLEMS, CATEGORY_NAMES
)

class LandingPageService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.landing_pages
        
    async def get_all_landing_pages(self, include_inactive: bool = False) -> List[dict]:
        """Get all landing pages"""
        query = {} if include_inactive else {"is_active": True}
        cursor = self.collection.find(query).sort("created_at", -1)
        pages = []
        async for page in cursor:
            page["id"] = str(page["_id"])
            del page["_id"]
            pages.append(page)
        return pages
    
    async def get_landing_page_by_slug(self, slug: str) -> Optional[dict]:
        """Get a landing page by its URL slug"""
        page = await self.collection.find_one({"problem_slug": slug, "is_active": True})
        if page:
            page["id"] = str(page["_id"])
            del page["_id"]
            # Increment view count
            await self.collection.update_one(
                {"problem_slug": slug},
                {"$inc": {"views": 1}}
            )
        return page
    
    async def get_landing_page_by_id(self, page_id: str) -> Optional[dict]:
        """Get a landing page by ID"""
        try:
            page = await self.collection.find_one({"_id": ObjectId(page_id)})
            if page:
                page["id"] = str(page["_id"])
                del page["_id"]
            return page
        except:
            return None
    
    async def create_landing_page(self, data: LandingPageCreate) -> dict:
        """Create a new landing page"""
        # Check if slug already exists
        existing = await self.collection.find_one({"problem_slug": data.problem_slug})
        if existing:
            raise ValueError(f"Landing page with slug '{data.problem_slug}' already exists")
        
        # Generate default content if not provided
        content = data.content or self._generate_default_content(data.problem_title, data.category)
        
        doc = {
            "problem_title": data.problem_title,
            "problem_slug": data.problem_slug,
            "category": data.category,
            "content": content.dict() if hasattr(content, 'dict') else content,
            "is_active": data.is_active,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
            "views": 0,
            "conversions": 0
        }
        
        result = await self.collection.insert_one(doc)
        doc["id"] = str(result.inserted_id)
        if "_id" in doc:
            del doc["_id"]
        return doc
    
    async def update_landing_page(self, page_id: str, data: dict) -> Optional[dict]:
        """Update a landing page"""
        try:
            update_data = {k: v for k, v in data.items() if v is not None}
            update_data["updated_at"] = datetime.now(timezone.utc)
            
            result = await self.collection.find_one_and_update(
                {"_id": ObjectId(page_id)},
                {"$set": update_data},
                return_document=True
            )
            if result:
                result["id"] = str(result["_id"])
                del result["_id"]
            return result
        except:
            return None
    
    async def delete_landing_page(self, page_id: str) -> bool:
        """Delete a landing page"""
        try:
            result = await self.collection.delete_one({"_id": ObjectId(page_id)})
            return result.deleted_count > 0
        except:
            return False
    
    async def record_conversion(self, slug: str) -> bool:
        """Record a conversion (purchase) from a landing page"""
        result = await self.collection.update_one(
            {"problem_slug": slug},
            {"$inc": {"conversions": 1}}
        )
        return result.modified_count > 0
    
    async def get_analytics(self) -> dict:
        """Get analytics for all landing pages"""
        pipeline = [
            {
                "$group": {
                    "_id": "$category",
                    "total_views": {"$sum": "$views"},
                    "total_conversions": {"$sum": "$conversions"},
                    "pages_count": {"$sum": 1}
                }
            }
        ]
        
        results = {}
        async for item in self.collection.aggregate(pipeline):
            category = item["_id"]
            results[category] = {
                "name": CATEGORY_NAMES.get(category, category),
                "views": item["total_views"],
                "conversions": item["total_conversions"],
                "pages": item["pages_count"],
                "conversion_rate": round((item["total_conversions"] / item["total_views"] * 100), 2) if item["total_views"] > 0 else 0
            }
        
        # Get top performing pages
        top_pages = await self.collection.find(
            {"views": {"$gt": 0}}
        ).sort("conversions", -1).limit(10).to_list(10)
        
        for page in top_pages:
            page["id"] = str(page["_id"])
            del page["_id"]
        
        return {
            "by_category": results,
            "top_pages": top_pages,
            "total_pages": await self.collection.count_documents({})
        }
    
    async def bulk_create_from_predefined(self, categories: List[str] = None) -> dict:
        """Bulk create landing pages from predefined problems"""
        categories = categories or list(LANDING_PAGE_PROBLEMS.keys())
        created = []
        skipped = []
        
        for category in categories:
            if category not in LANDING_PAGE_PROBLEMS:
                continue
                
            for problem in LANDING_PAGE_PROBLEMS[category]:
                # Check if already exists
                existing = await self.collection.find_one({"problem_slug": problem["slug"]})
                if existing:
                    skipped.append(problem["slug"])
                    continue
                
                try:
                    data = LandingPageCreate(
                        problem_title=problem["title"],
                        problem_slug=problem["slug"],
                        category=category,
                        is_active=True
                    )
                    await self.create_landing_page(data)
                    created.append(problem["slug"])
                except Exception as e:
                    skipped.append(f"{problem['slug']} (error: {str(e)})")
        
        return {
            "created": len(created),
            "skipped": len(skipped),
            "created_slugs": created,
            "skipped_slugs": skipped
        }
    
    def _generate_default_content(self, problem_title: str, category: str) -> dict:
        """Generate default content based on problem title"""
        # Extract key terms from title
        title_lower = problem_title.lower()
        
        # Default problem points based on category
        problem_points_map = {
            "early_aging": [
                "Fine lines appearing around eyes and forehead",
                "Skin losing its natural bounce and firmness",
                "Uneven skin tone and dullness",
                "Collagen breakdown starting earlier than expected"
            ],
            "wrinkles": [
                "Deep lines forming on forehead and around mouth",
                "Crow's feet becoming more prominent",
                "Expression lines staying even when relaxed",
                "Skin texture becoming rougher"
            ],
            "under_eye": [
                "Dark circles that makeup can't hide",
                "Puffiness that makes you look tired",
                "Hollow under-eye area adding years",
                "Fine lines around the eye area"
            ],
            "dry_skin": [
                "Skin feeling tight and uncomfortable",
                "Flaky patches appearing on face",
                "Makeup not sitting well on skin",
                "Loss of natural radiance and glow"
            ],
            "lifestyle": [
                "Visible effects of daily stress on skin",
                "Premature aging from environmental factors",
                "Skin looking tired despite rest",
                "Accelerated aging from modern lifestyle"
            ],
            "preventive": [
                "Early signs that need immediate attention",
                "Prevention is easier than correction",
                "Small changes can make big difference",
                "Acting now saves years of aging later"
            ],
            "results": [
                "Fast-acting formula for visible results",
                "Clinically proven ingredients",
                "See transformation in weeks, not months",
                "Real results from real customers"
            ],
            "psychological": [
                "First impressions matter more than we think",
                "Confidence affected by how we look",
                "Social situations becoming uncomfortable",
                "Photos revealing what mirrors hide"
            ]
        }
        
        solution_benefits = [
            "Reduces fine lines and wrinkles visibly",
            "Boosts collagen production naturally",
            "Restores skin's youthful glow",
            "Clinically proven 4-in-1 formula",
            "Safe for all Indian skin types",
            "Results visible in 2-4 weeks"
        ]
        
        return {
            "hero_headline": problem_title,
            "hero_subheadline": "India's #1 Anti-Aging Solution Is Here",
            "hero_problem_statement": f"If you're noticing {problem_title.lower().replace('?', '').replace('—', '-')}, you're not alone. Thousands of Indians face this every day.",
            "problem_title": "Sound Familiar?",
            "problem_points": problem_points_map.get(category, problem_points_map["early_aging"]),
            "solution_title": "The Science-Backed Solution",
            "solution_description": "Celesta Glow's 4-in-1 Anti-Aging Serum combines Retinol, Hyaluronic Acid, Niacinamide, and Vitamin E to target the root causes of aging.",
            "solution_benefits": solution_benefits,
            "testimonials": [],
            "cta_primary": "Get Your Solution Now",
            "cta_secondary": "Start Your Transformation Today",
            "meta_title": f"{problem_title} | Celesta Glow Anti-Aging Serum",
            "meta_description": f"{problem_title} Discover how Celesta Glow's clinically proven formula helps thousands of Indians reverse early aging. Free shipping. COD available.",
            "meta_keywords": ["anti-aging", "serum", "wrinkles", "fine lines", category.replace("_", " "), "celesta glow"]
        }
    
    def get_predefined_problems(self) -> dict:
        """Get all predefined problems organized by category"""
        return {
            "categories": CATEGORY_NAMES,
            "problems": LANDING_PAGE_PROBLEMS
        }
