"""
Landing Page Routes
API endpoints for managing problem-specific landing pages
"""
from fastapi import APIRouter, HTTPException, Depends, Header
from typing import List, Optional
import os

from models.landing_page import LandingPageCreate, LandingPageContent
from services.landing_page_service import LandingPageService

router = APIRouter(prefix="/landing-pages", tags=["Landing Pages"])

# Will be set by server.py
landing_page_service: LandingPageService = None
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'celestaglow2024')

def set_landing_page_service(service: LandingPageService):
    global landing_page_service
    landing_page_service = service

def verify_admin(x_admin_token: str = Header(None)):
    """Verify admin token"""
    if not x_admin_token or x_admin_token != ADMIN_PASSWORD:
        raise HTTPException(status_code=403, detail="Invalid admin token")
    return True

# ==================
# PUBLIC ROUTES
# ==================

@router.get("/public/{slug}")
async def get_public_landing_page(slug: str):
    """Get a landing page by slug (public access)"""
    page = await landing_page_service.get_landing_page_by_slug(slug)
    if not page:
        raise HTTPException(status_code=404, detail="Landing page not found")
    return page

# ==================
# ADMIN ROUTES
# ==================

@router.get("/admin/all")
async def get_all_landing_pages(
    include_inactive: bool = False,
    admin: bool = Depends(verify_admin)
):
    """Get all landing pages (admin)"""
    return await landing_page_service.get_all_landing_pages(include_inactive)

@router.get("/admin/predefined")
async def get_predefined_problems(admin: bool = Depends(verify_admin)):
    """Get all predefined problems by category"""
    return landing_page_service.get_predefined_problems()

@router.get("/admin/analytics")
async def get_landing_page_analytics(admin: bool = Depends(verify_admin)):
    """Get analytics for all landing pages"""
    return await landing_page_service.get_analytics()

@router.get("/admin/{page_id}")
async def get_landing_page_by_id(
    page_id: str,
    admin: bool = Depends(verify_admin)
):
    """Get a specific landing page by ID"""
    page = await landing_page_service.get_landing_page_by_id(page_id)
    if not page:
        raise HTTPException(status_code=404, detail="Landing page not found")
    return page

@router.post("/admin/create")
async def create_landing_page(
    data: LandingPageCreate,
    admin: bool = Depends(verify_admin)
):
    """Create a new landing page"""
    try:
        return await landing_page_service.create_landing_page(data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/admin/bulk-create")
async def bulk_create_landing_pages(
    categories: List[str] = None,
    admin: bool = Depends(verify_admin)
):
    """Bulk create landing pages from predefined problems"""
    return await landing_page_service.bulk_create_from_predefined(categories)

@router.put("/admin/{page_id}")
async def update_landing_page(
    page_id: str,
    data: dict,
    admin: bool = Depends(verify_admin)
):
    """Update a landing page"""
    result = await landing_page_service.update_landing_page(page_id, data)
    if not result:
        raise HTTPException(status_code=404, detail="Landing page not found")
    return result

@router.delete("/admin/{page_id}")
async def delete_landing_page(
    page_id: str,
    admin: bool = Depends(verify_admin)
):
    """Delete a landing page"""
    success = await landing_page_service.delete_landing_page(page_id)
    if not success:
        raise HTTPException(status_code=404, detail="Landing page not found")
    return {"success": True, "message": "Landing page deleted"}

@router.post("/admin/{page_id}/toggle")
async def toggle_landing_page(
    page_id: str,
    admin: bool = Depends(verify_admin)
):
    """Toggle landing page active status"""
    page = await landing_page_service.get_landing_page_by_id(page_id)
    if not page:
        raise HTTPException(status_code=404, detail="Landing page not found")
    
    new_status = not page.get("is_active", True)
    await landing_page_service.update_landing_page(page_id, {"is_active": new_status})
    return {"success": True, "is_active": new_status}

@router.post("/track-conversion/{slug}")
async def track_conversion(slug: str):
    """Track a conversion from a landing page"""
    success = await landing_page_service.record_conversion(slug)
    return {"success": success}
