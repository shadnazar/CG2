from fastapi import FastAPI, APIRouter, HTTPException, Query, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import re
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import razorpay
from pincode_data import get_state_from_pincode
from analytics_tracker import AnalyticsTracker
from routes import admin as admin_routes
from routes import i18n as i18n_routes
from routes import consultation as consultation_routes
from services.enhanced_analytics import EnhancedAnalyticsTracker, VisitorLeadTracker
from services.ai_content_generator import AIContentGenerator
from services.auto_blog_generator import AutoBlogGenerator
from services.image_service import get_image_for_category, get_image_for_keywords
from services.user_behavior_tracker import UserBehaviorTracker
from services.whatsapp_service import WhatsAppService
from services.trending_news_generator import TrendingNewsBlogGenerator


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]
analytics_tracker = AnalyticsTracker(db)

# Initialize enhanced analytics
enhanced_analytics = EnhancedAnalyticsTracker(db)
visitor_lead_tracker = VisitorLeadTracker(db)
ai_content_generator = AIContentGenerator(db)
auto_blog_generator = AutoBlogGenerator(db)
user_behavior_tracker = UserBehaviorTracker(db)
whatsapp_service = WhatsAppService(db)
trending_news_generator = TrendingNewsBlogGenerator(db)

# Initialize admin routes with database
admin_routes.set_db(db)

# Initialize consultation routes with database
consultation_routes.set_db(db)

razorpay_client = razorpay.Client(auth=(os.environ['RAZORPAY_KEY_ID'], os.environ['RAZORPAY_KEY_SECRET']))

app = FastAPI()
api_router = APIRouter(prefix="/api")


class OrderCreate(BaseModel):
    name: str
    phone: str
    house_number: str
    area: str
    pincode: str
    state: str
    payment_method: str
    amount: float
    email: Optional[str] = None


class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    order_id: str = Field(default_factory=lambda: f"CG{random.randint(100000, 999999)}")
    name: str
    phone: str
    house_number: str = ""
    area: str = ""
    pincode: str = ""
    state: str = ""
    address: Optional[str] = None
    payment_method: str
    amount: float
    email: Optional[str] = None
    delivery_timeline: str = ""
    status: str = "confirmed"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class RazorpayOrderCreate(BaseModel):
    amount: float


class RazorpayPaymentVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


def send_order_confirmation_email(order: Order):
    try:
        smtp_host = os.environ['SMTP_HOST']
        smtp_port = int(os.environ['SMTP_PORT'])
        smtp_user = os.environ['SMTP_USER']
        smtp_password = os.environ['SMTP_PASSWORD']
        business_email = os.environ['BUSINESS_EMAIL']
        
        full_address = f"{order.house_number}, {order.area}, {order.state} - {order.pincode}"
        
        # Send email to customer
        if order.email:
            msg_customer = MIMEMultipart('alternative')
            msg_customer['Subject'] = f'Order Confirmed - {order.order_id} | Celesta Glow'
            msg_customer['From'] = smtp_user
            msg_customer['To'] = order.email
            
            html_customer = f"""
            <html>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                  <div style="background: linear-gradient(135deg, #4C1D95, #6d28d9); color: white; padding: 30px; text-align: center; border-radius: 10px;">
                    <h1 style="margin: 0; font-size: 28px;">✨ Order Confirmed!</h1>
                    <p style="margin: 10px 0 0; font-size: 16px;">Thank you for choosing Celesta Glow</p>
                  </div>
                  
                  <div style="background: white; padding: 30px; margin-top: 20px; border-radius: 10px;">
                    <div style="background: #4C1D95; color: white; padding: 15px; text-align: center; border-radius: 8px; margin-bottom: 20px;">
                      <p style="margin: 0; font-size: 14px;">Your Order ID</p>
                      <h2 style="margin: 5px 0 0; font-size: 32px; letter-spacing: 2px;">{order.order_id}</h2>
                    </div>
                    
                    <h3 style="color: #4C1D95; margin-bottom: 15px;">📦 Order Details</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Product:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">Celesta Glow Anti-Aging Face Serum (30ml)</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Amount:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; color: #059669; font-weight: bold;">₹{order.amount}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Payment:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">{order.payment_method}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Delivery:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">{order.delivery_timeline}</td>
                      </tr>
                    </table>
                    
                    <h3 style="color: #4C1D95; margin-top: 25px; margin-bottom: 15px;">📍 Delivery Address</h3>
                    <p style="margin: 5px 0;"><strong>{order.name}</strong></p>
                    <p style="margin: 5px 0;">+91 {order.phone}</p>
                    <p style="margin: 5px 0;">{full_address}</p>
                    
                    <div style="background: #FFFBEB; border-left: 4px solid #F59E0B; padding: 15px; margin-top: 25px; border-radius: 5px;">
                      <p style="margin: 0; color: #92400E;">🌟 <strong>Your skin transformation journey begins!</strong> Start using Celesta Glow as soon as you receive it for best results.</p>
                    </div>
                  </div>
                  
                  <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
                    <p>Questions? Contact us at {smtp_user}</p>
                    <p style="margin-top: 10px;">&copy; 2025 Celesta Glow. All rights reserved.</p>
                  </div>
                </div>
              </body>
            </html>
            """
            
            part_customer = MIMEText(html_customer, 'html')
            msg_customer.attach(part_customer)
            
            with smtplib.SMTP(smtp_host, smtp_port) as server:
                server.starttls()
                server.login(smtp_user, smtp_password)
                server.send_message(msg_customer)
            
            logging.info(f"Customer confirmation email sent for order {order.order_id}")
        
        # Send email to business
        msg_business = MIMEMultipart('alternative')
        msg_business['Subject'] = f'New Order Received - {order.order_id}'
        msg_business['From'] = smtp_user
        msg_business['To'] = business_email
        
        html_business = f"""
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
              <div style="background: #4C1D95; color: white; padding: 20px; text-align: center; border-radius: 10px;">
                <h2 style="margin: 0;">🛒 New Order Received!</h2>
                <h1 style="margin: 10px 0; font-size: 36px; letter-spacing: 2px;">{order.order_id}</h1>
              </div>
              
              <div style="background: white; padding: 25px; margin-top: 20px; border-radius: 10px;">
                <h3 style="color: #4C1D95; margin-bottom: 15px;">Order Details</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                  <tr style="background: #f3f4f6;">
                    <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Order ID</td>
                    <td style="padding: 12px; border: 1px solid #e5e7eb;">{order.order_id}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Product</td>
                    <td style="padding: 12px; border: 1px solid #e5e7eb;">Celesta Glow Anti-Aging Face Serum (30ml)</td>
                  </tr>
                  <tr style="background: #f3f4f6;">
                    <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Amount</td>
                    <td style="padding: 12px; border: 1px solid #e5e7eb; color: #059669; font-weight: bold;">₹{order.amount}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Payment Method</td>
                    <td style="padding: 12px; border: 1px solid #e5e7eb;">{order.payment_method}</td>
                  </tr>
                  <tr style="background: #f3f4f6;">
                    <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Delivery Timeline</td>
                    <td style="padding: 12px; border: 1px solid #e5e7eb;">{order.delivery_timeline}</td>
                  </tr>
                </table>
                
                <h3 style="color: #4C1D95; margin-bottom: 15px;">Customer Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr style="background: #f3f4f6;">
                    <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Name</td>
                    <td style="padding: 12px; border: 1px solid #e5e7eb;">{order.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Phone</td>
                    <td style="padding: 12px; border: 1px solid #e5e7eb;">+91 {order.phone}</td>
                  </tr>
                  <tr style="background: #f3f4f6;">
                    <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Email</td>
                    <td style="padding: 12px; border: 1px solid #e5e7eb;">{order.email if order.email else 'Not provided'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Address</td>
                    <td style="padding: 12px; border: 1px solid #e5e7eb;">{full_address}</td>
                  </tr>
                </table>
                
                <div style="background: #FFFBEB; border-left: 4px solid #F59E0B; padding: 15px; margin-top: 20px; border-radius: 5px;">
                  <p style="margin: 0; color: #92400E;"><strong>⚠️ Action Required:</strong> Please process this order and arrange shipment.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
        """
        
        part_business = MIMEText(html_business, 'html')
        msg_business.attach(part_business)
        
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(msg_business)
        
        logging.info(f"Business notification email sent for order {order.order_id}")
    except Exception as e:
        logging.error(f"Failed to send email: {str(e)}")


@api_router.get("/")
async def root():
    return {"message": "Celesta Glow API"}


@api_router.post("/create-razorpay-order")
async def create_razorpay_order(order_data: RazorpayOrderCreate):
    try:
        amount_in_paise = int(order_data.amount * 100)
        logging.info(f"Creating Razorpay order for amount: {amount_in_paise} paise")
        razorpay_order = razorpay_client.order.create({
            "amount": amount_in_paise,
            "currency": "INR",
            "payment_capture": 1
        })
        logging.info(f"Razorpay order created successfully: {razorpay_order}")
        return razorpay_order
    except Exception as e:
        logging.error(f"Razorpay order creation failed: {type(e).__name__} - {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/verify-payment")
async def verify_payment(payment_data: RazorpayPaymentVerify):
    try:
        razorpay_client.utility.verify_payment_signature({
            'razorpay_order_id': payment_data.razorpay_order_id,
            'razorpay_payment_id': payment_data.razorpay_payment_id,
            'razorpay_signature': payment_data.razorpay_signature
        })
        return {"verified": True}
    except Exception:
        raise HTTPException(status_code=400, detail="Payment verification failed")


@api_router.post("/orders", response_model=Order)
async def create_order(order_input: OrderCreate):
    order_obj = Order(**order_input.model_dump())
    
    if order_obj.payment_method == "COD":
        order_obj.delivery_timeline = "5-7 Business Days"
    else:
        order_obj.delivery_timeline = "Fast Delivery (2-3 Days)"
    
    doc = order_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.orders.insert_one(doc)
    
    send_order_confirmation_email(order_obj)
    
    return order_obj


@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str):
    order = await db.orders.find_one({"order_id": order_id}, {"_id": 0})
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if isinstance(order['created_at'], str):
        order['created_at'] = datetime.fromisoformat(order['created_at'])
    
    return order


@api_router.get("/orders", response_model=List[Order])
async def get_all_orders():
    orders = await db.orders.find({}, {"_id": 0}).to_list(1000)
    
    for order in orders:
        if isinstance(order['created_at'], str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
    
    return orders


@api_router.get("/stats/recent-orders")
async def get_recent_orders_count():
    count = await db.orders.count_documents({})
    base_count = 30 + random.randint(0, 15)
    return {"count": base_count + count}


@api_router.post("/track")
async def track_page_visit(page: str, session_id: str = None):
    await analytics_tracker.track_visit(page, session_id)
    return {"status": "tracked"}


@api_router.get("/pincode/{pincode}/state")
async def get_state_by_pincode(pincode: str):
    state = get_state_from_pincode(pincode)
    return {"pincode": pincode, "state": state}


# ==================== BLOG API ROUTES ====================

class BlogCreate(BaseModel):
    title: str
    content: str
    meta_description: Optional[str] = None
    keywords: List[str] = []
    status: str = "published"


class BlogResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    title: str
    slug: str
    meta_description: Optional[str] = None
    content: str
    keywords: List[str] = []
    status: str = "published"
    view_count: int = 0
    generated_by: str = "Manual"
    created_at: str
    updated_at: str


def generate_slug(title: str) -> str:
    """Generate URL-friendly slug from title"""
    slug = title.lower()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = re.sub(r'^-|-$', '', slug)
    return slug


@api_router.get("/blogs")
async def get_blogs():
    """Get all published blog posts"""
    blogs = await db.blogs.find({"status": "published"}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return blogs


@api_router.get("/blogs/{slug}")
async def get_blog_by_slug(slug: str):
    """Get a single blog post by slug"""
    blog = await db.blogs.find_one({"slug": slug}, {"_id": 0})
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    # Increment view count
    await db.blogs.update_one({"slug": slug}, {"$inc": {"view_count": 1}})
    return blog


@api_router.post("/blogs")
async def create_blog(blog_data: BlogCreate):
    """Create a new blog post"""
    slug = generate_slug(blog_data.title)
    
    # Check if slug already exists
    existing = await db.blogs.find_one({"slug": slug})
    if existing:
        slug = f"{slug}-{random.randint(1000, 9999)}"
    
    now = datetime.now(timezone.utc).isoformat()
    blog_doc = {
        "id": str(uuid.uuid4()),
        "title": blog_data.title,
        "slug": slug,
        "meta_description": blog_data.meta_description,
        "content": blog_data.content,
        "keywords": blog_data.keywords,
        "status": blog_data.status,
        "view_count": 0,
        "generated_by": "Manual",
        "created_at": now,
        "updated_at": now
    }
    
    await db.blogs.insert_one(blog_doc)
    del blog_doc["_id"]
    return blog_doc


# ==================== SEARCH API ROUTE ====================

@api_router.get("/search")
async def search_content(q: str = Query(..., min_length=1)):
    """Search blog posts by keyword"""
    # Simple text search on title and content
    query = {
        "$or": [
            {"title": {"$regex": q, "$options": "i"}},
            {"content": {"$regex": q, "$options": "i"}},
            {"keywords": {"$in": [q.lower()]}}
        ],
        "status": "published"
    }
    
    blogs = await db.blogs.find(query, {"_id": 0}).to_list(20)
    return blogs


# ==================== LOCATION API ROUTES ====================

@api_router.get("/location/{state}")
async def get_location_state(state: str):
    """Get location page content for a state"""
    location = await db.locations.find_one({"state": {"$regex": f"^{state}$", "$options": "i"}}, {"_id": 0})
    
    if not location:
        # Return default content for the state
        return {
            "state": state.title(),
            "city": None,
            "content": {
                "title": f"Anti-Aging Skincare in {state.title()}",
                "description": f"Discover premium anti-aging solutions for {state.title()}. Celesta Glow is trusted by thousands.",
                "climate": "Varies by region",
                "skin_issues": ["wrinkles", "fine lines", "dryness"],
                "recommendations": "Use Celesta Glow daily for best results"
            }
        }
    
    return location


@api_router.get("/location/{state}/{city}")
async def get_location_city(state: str, city: str):
    """Get location page content for a specific city"""
    location = await db.locations.find_one({
        "state": {"$regex": f"^{state}$", "$options": "i"},
        "city": {"$regex": f"^{city}$", "$options": "i"}
    }, {"_id": 0})
    
    if not location:
        # Return default content for the city
        return {
            "state": state.title(),
            "city": city.title(),
            "content": {
                "title": f"Anti-Aging Skincare in {city.title()}, {state.title()}",
                "description": f"Get Celesta Glow Anti-Aging Serum delivered to {city.title()}. Free shipping available.",
                "climate": "Varies by season",
                "skin_issues": ["wrinkles", "fine lines", "pollution damage"],
                "recommendations": "Use Celesta Glow twice daily for optimal results"
            }
        }
    
    return location


# ==================== ENHANCED ANALYTICS ENDPOINTS ====================

class VisitorLeadCreate(BaseModel):
    phone: str
    session_id: str
    page: str


@api_router.post("/track-visit")
async def track_enhanced_page_visit(
    page: str = Query(...),
    session_id: str = Query(...),
    user_agent: Optional[str] = Query(None),
    referrer: Optional[str] = Query(None),
    ip_address: Optional[str] = Query(None)
):
    """Track a page visit with enhanced analytics including IP"""
    return await enhanced_analytics.track_page_visit(page, session_id, user_agent, referrer, ip_address)


@api_router.get("/live-visitors")
async def get_live_visitors(page: Optional[str] = None):
    """Get live visitors count"""
    if page:
        count = enhanced_analytics.get_live_visitors_count(page)
        return {"page": page, "live_visitors": count}
    
    by_page = enhanced_analytics.get_live_visitors_by_page()
    total = enhanced_analytics.get_live_visitors_count()
    return {"total_live_visitors": total, "by_page": by_page}


@api_router.post("/claim-discount")
async def claim_visitor_discount(lead: VisitorLeadCreate):
    """Claim ₹50 discount by providing phone number"""
    # Validate phone number
    phone = lead.phone.strip()
    if not re.match(r'^[6-9]\d{9}$', phone):
        raise HTTPException(status_code=400, detail="Invalid phone number")
    
    result = await visitor_lead_tracker.save_visitor_lead(
        phone=phone,
        session_id=lead.session_id,
        page=lead.page,
        discount_code="WELCOME50"
    )
    
    # Also update visitor profile with phone number for tracking
    if lead.session_id:
        # Get visitor_id from session
        visitor_profile = await db.visitor_profiles.find_one({"last_session": lead.session_id})
        if visitor_profile:
            await db.visitor_profiles.update_one(
                {"visitor_id": visitor_profile.get("visitor_id")},
                {"$set": {"phone": phone, "discount_claimed": True}}
            )
        else:
            # Try to find by recent activity
            recent_visit = await db.user_page_visits.find_one(
                {"session_id": lead.session_id},
                sort=[("timestamp", -1)]
            )
            if recent_visit and recent_visit.get("visitor_id"):
                await db.visitor_profiles.update_one(
                    {"visitor_id": recent_visit.get("visitor_id")},
                    {"$set": {"phone": phone, "discount_claimed": True}}
                )
    
    return result


# ==================== ADMIN ANALYTICS ENDPOINTS ====================

ADMIN_PASSWORD = "celestaglow2024"

def verify_admin_token(x_admin_token: str = Header(None)):
    """Verify admin token - accepts both plain password and hashed token"""
    if not x_admin_token:
        raise HTTPException(status_code=401, detail="Admin token required")
    
    # Accept plain password for simplicity
    if x_admin_token == ADMIN_PASSWORD:
        return True
    
    # Also check if it matches the token (for backward compatibility)
    import hashlib
    ADMIN_PASSWORD_HASH = hashlib.sha256(ADMIN_PASSWORD.encode()).hexdigest()
    if hashlib.sha256(x_admin_token.encode()).hexdigest() != ADMIN_PASSWORD_HASH:
        raise HTTPException(status_code=403, detail="Invalid admin token")
    return True


class AdminLoginRequest(BaseModel):
    password: str


@api_router.post("/admin/login")
async def admin_login(request: AdminLoginRequest):
    """Admin login endpoint"""
    if request.password == ADMIN_PASSWORD:
        return {"success": True, "token": ADMIN_PASSWORD}
    raise HTTPException(status_code=401, detail="Invalid password")


@api_router.get("/admin/analytics/live")
async def get_live_analytics(x_admin_token: str = Header(None)):
    """Get real-time analytics for admin dashboard"""
    verify_admin_token(x_admin_token)
    
    live_by_page = enhanced_analytics.get_live_visitors_by_page()
    total_live = enhanced_analytics.get_live_visitors_count()
    total_stats = await enhanced_analytics.get_total_stats()
    page_totals = await enhanced_analytics.get_page_visit_totals()
    top_locations = await enhanced_analytics.get_top_locations()
    
    return {
        "live_visitors": {
            "total": total_live,
            "by_page": live_by_page
        },
        "total_visits": total_stats.get("total_visits", 0),
        "page_totals": page_totals,
        "top_locations": top_locations,
        "last_updated": datetime.now(timezone.utc).isoformat()
    }


@api_router.get("/admin/analytics/pages")
async def get_page_analytics(
    x_admin_token: str = Header(None),
    days: int = Query(7, ge=1, le=90)
):
    """Get detailed page-wise analytics"""
    verify_admin_token(x_admin_token)
    
    analytics = await enhanced_analytics.get_page_analytics(days=days)
    hourly = await enhanced_analytics.get_hourly_distribution(days=days)
    
    return {
        "page_analytics": analytics,
        "hourly_distribution": hourly
    }


@api_router.get("/admin/analytics/daywise")
async def get_daywise_analytics(
    x_admin_token: str = Header(None),
    days: int = Query(7, ge=1, le=365),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    """Get day-wise visitor analytics with date filtering
    
    Returns visitors for Homepage, Product Page, and Checkout for each day.
    Supports preset days filter or custom date range.
    """
    verify_admin_token(x_admin_token)
    
    daywise_data = await enhanced_analytics.get_daywise_analytics(
        days=days, 
        start_date=start_date, 
        end_date=end_date
    )
    
    return daywise_data


@api_router.get("/admin/analytics/leads")
async def get_visitor_leads(x_admin_token: str = Header(None)):
    """Get all visitor leads (phone numbers)"""
    verify_admin_token(x_admin_token)
    
    leads = await visitor_lead_tracker.get_all_leads()
    stats = await visitor_lead_tracker.get_leads_stats()
    
    return {
        "leads": leads,
        "stats": stats
    }


# ==================== AI CONTENT GENERATION ENDPOINTS ====================

class BlogGenerateRequest(BaseModel):
    topic: str
    keywords: Optional[List[str]] = None
    target_audience: Optional[str] = "Indian adults 28+"


class LocationGenerateRequest(BaseModel):
    state: str
    city: Optional[str] = None


@api_router.post("/admin/ai/generate-blog")
async def generate_blog_with_ai(request: BlogGenerateRequest, x_admin_token: str = Header(None)):
    """Generate a blog article using AI (costs credits)"""
    verify_admin_token(x_admin_token)
    
    result = await ai_content_generator.generate_blog_article(
        topic=request.topic,
        keywords=request.keywords,
        target_audience=request.target_audience
    )
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result.get("error", "AI generation failed"))
    
    return result


@api_router.post("/admin/ai/generate-location")
async def generate_location_with_ai(request: LocationGenerateRequest, x_admin_token: str = Header(None)):
    """Generate location page content using AI (costs credits)"""
    verify_admin_token(x_admin_token)
    
    result = await ai_content_generator.generate_location_content(
        state=request.state,
        city=request.city
    )
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result.get("error", "AI generation failed"))
    
    return result


@api_router.get("/admin/ai/suggest-topics")
async def suggest_blog_topics(
    x_admin_token: str = Header(None), 
    count: int = Query(5, ge=1, le=10),
    format: str = Query("full", description="'full' for objects with description, 'simple' for title strings only")
):
    """Get AI-suggested blog topics
    
    Args:
        format: 'full' returns {topic, description, keywords}, 'simple' returns just topic titles
    """
    verify_admin_token(x_admin_token)
    
    result = await ai_content_generator.suggest_blog_topics(count=count, format=format)
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result.get("error", "AI generation failed"))
    
    return result


# ==================== AUTO BLOG GENERATION ENDPOINTS ====================

class AutoGenerateBlogsRequest(BaseModel):
    count: int = 12


class BatchLocationBlogsRequest(BaseModel):
    states: List[str]


class BatchTopicBlogsRequest(BaseModel):
    topics: List[str]


@api_router.post("/admin/ai/auto-generate-blogs")
async def auto_generate_blogs(request: AutoGenerateBlogsRequest, x_admin_token: str = Header(None)):
    """Auto-generate multiple SEO blogs (12 by default)"""
    verify_admin_token(x_admin_token)
    
    result = await auto_blog_generator.generate_and_save_blogs(count=request.count)
    return result


@api_router.post("/admin/ai/batch-location-blogs")
async def batch_location_blogs(request: BatchLocationBlogsRequest, x_admin_token: str = Header(None)):
    """Generate blogs targeting specific Indian states"""
    verify_admin_token(x_admin_token)
    
    # When user manually selects states, force=True to allow regeneration
    result = await auto_blog_generator.generate_location_blogs(states=request.states, force=True)
    return result


@api_router.post("/admin/ai/batch-topic-blogs")
async def batch_topic_blogs(request: BatchTopicBlogsRequest, x_admin_token: str = Header(None)):
    """Generate blogs for specific user-defined topics"""
    verify_admin_token(x_admin_token)
    
    # When user manually enters topics, force=True to allow regeneration
    result = await auto_blog_generator.generate_topic_blogs(topics=request.topics, force=True)
    return result


@api_router.get("/admin/ai/generation-history")
async def get_blog_generation_history(x_admin_token: str = Header(None)):
    """Get blog generation history"""
    verify_admin_token(x_admin_token)
    
    history = await auto_blog_generator.get_generation_history()
    return {"history": history}


@api_router.post("/admin/blogs/backfill-images")
async def backfill_blog_images(x_admin_token: str = Header(None)):
    """Backfill images for blogs that don't have them"""
    verify_admin_token(x_admin_token)
    
    # Find blogs without images
    blogs_without_images = await db.blogs.find(
        {"$or": [{"image_url": {"$exists": False}}, {"image_url": None}, {"image_url": ""}]},
        {"_id": 0}
    ).to_list(100)
    
    updated = 0
    used_images = []
    
    for blog in blogs_without_images:
        category = blog.get("category", "tips")
        keywords = blog.get("keywords", [])
        title = blog.get("title", "")
        
        # Get appropriate image
        image_url = get_image_for_category(category, used_images)
        if not image_url:
            image_url = get_image_for_keywords(keywords, title)
        
        used_images.append(image_url)
        
        # Update blog with image
        await db.blogs.update_one(
            {"id": blog.get("id"), "slug": blog.get("slug")},
            {"$set": {"image_url": image_url}}
        )
        updated += 1
    
    return {
        "success": True,
        "updated_count": updated,
        "message": f"Added images to {updated} blogs"
    }


# ==================== DISCOUNT VALIDATION ENDPOINT ====================

@api_router.get("/validate-discount")
async def validate_discount_code(phone: str = Query(...)):
    """Validate if a phone number has a valid discount"""
    # Check if phone has claimed discount
    lead = await db.visitor_leads.find_one({"phone": phone}, {"_id": 0})
    
    if lead and not lead.get("converted"):
        return {
            "valid": True,
            "discount_code": lead.get("discount_code", "WELCOME50"),
            "discount_amount": lead.get("discount_amount", 50),
            "message": "Discount applied!"
        }
    elif lead and lead.get("converted"):
        return {
            "valid": False,
            "message": "Discount already used"
        }
    else:
        return {
            "valid": False,
            "message": "No discount found for this number"
        }


# ==================== RECENT PURCHASES FOR SOCIAL PROOF ====================

@api_router.get("/recent-purchases")
async def get_recent_purchases():
    """Get recent purchases for social proof notifications"""
    # Get recent orders (last 24 hours, anonymized)
    from datetime import timedelta
    cutoff = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
    
    orders = await db.orders.find(
        {"created_at": {"$gte": cutoff}},
        {"_id": 0, "name": 1, "state": 1, "created_at": 1}
    ).sort("created_at", -1).limit(10).to_list(10)
    
    # Anonymize names (first name + initial)
    purchases = []
    for order in orders:
        name = order.get("name", "Someone")
        name_parts = name.split()
        if len(name_parts) > 1:
            display_name = f"{name_parts[0]} {name_parts[1][0]}."
        else:
            display_name = name_parts[0] if name_parts else "Someone"
        
        purchases.append({
            "name": display_name,
            "location": order.get("state", "India"),
            "time_ago": order.get("created_at")
        })
    
    # If no recent orders, return sample data
    if not purchases:
        sample_names = [
            {"name": "Priya S.", "location": "Mumbai"},
            {"name": "Anita R.", "location": "Delhi"},
            {"name": "Kavya P.", "location": "Bangalore"},
            {"name": "Neha K.", "location": "Chennai"},
            {"name": "Divya M.", "location": "Hyderabad"}
        ]
        purchases = sample_names[:3]
    
    return {"purchases": purchases}


# ==================== USER BEHAVIOR TRACKING ====================

class TrackingData(BaseModel):
    visitor_id: str
    session_id: str
    page: Optional[str] = None
    action: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    timestamp: Optional[str] = None
    referrer: Optional[str] = None
    user_agent: Optional[str] = None
    screen_width: Optional[int] = None
    screen_height: Optional[int] = None
    time_spent: Optional[int] = None


@api_router.post("/tracking/page-visit")
async def track_user_page_visit(data: TrackingData):
    """Track user page visit with behavior data"""
    return await user_behavior_tracker.track_page_visit(data.model_dump())


@api_router.post("/tracking/time-spent")
async def track_user_time_spent(data: TrackingData):
    """Track time spent on page"""
    return await user_behavior_tracker.track_time_spent(data.model_dump())


@api_router.post("/tracking/action")
async def track_user_action(data: TrackingData):
    """Track user action (click, scroll, form fill)"""
    return await user_behavior_tracker.track_action(data.model_dump())


@api_router.post("/tracking/update-location")
async def update_visitor_location(data: dict):
    """Update visitor profile with browser geolocation and reverse geocode to actual place"""
    import httpx
    
    visitor_id = data.get("visitor_id")
    location = data.get("location")
    
    if visitor_id and location:
        lat = location.get("latitude")
        lng = location.get("longitude")
        
        # Reverse geocode to get actual place name
        place_info = {}
        if lat and lng:
            try:
                async with httpx.AsyncClient(timeout=5.0) as client:
                    # Use OpenStreetMap Nominatim API (free, no key needed)
                    url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lng}&zoom=10&addressdetails=1"
                    response = await client.get(url, headers={"User-Agent": "CelestaGlow/1.0"})
                    if response.status_code == 200:
                        geo_data = response.json()
                        address = geo_data.get("address", {})
                        place_info = {
                            "city": address.get("city") or address.get("town") or address.get("village") or address.get("suburb", ""),
                            "district": address.get("state_district") or address.get("county", ""),
                            "state": address.get("state", ""),
                            "country": address.get("country", "India"),
                            "pincode": address.get("postcode", ""),
                            "display_name": geo_data.get("display_name", "")[:100]
                        }
            except Exception as e:
                logging.warning(f"Reverse geocode failed: {e}")
        
        await db.visitor_profiles.update_one(
            {"visitor_id": visitor_id},
            {
                "$set": {
                    "browser_location": location,
                    "location_place": place_info,
                    "location_updated_at": datetime.now(timezone.utc).isoformat()
                }
            },
            upsert=True
        )
    return {"updated": True, "place": place_info if 'place_info' in dir() else {}}


@api_router.post("/tracking/blog-view")
async def track_blog_view(data: dict):
    """Track blog view and increment view counter"""
    blog_slug = data.get("blog_slug")
    visitor_id = data.get("visitor_id")
    
    if blog_slug:
        # Increment blog view count
        await db.blogs.update_one(
            {"slug": blog_slug},
            {"$inc": {"views": 1, "view_count": 1}}
        )
        
        # Log the view
        await db.blog_views.insert_one({
            "blog_slug": blog_slug,
            "blog_title": data.get("blog_title", ""),
            "visitor_id": visitor_id,
            "session_id": data.get("session_id"),
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        # Update visitor profile with blogs viewed
        if visitor_id:
            await db.visitor_profiles.update_one(
                {"visitor_id": visitor_id},
                {
                    "$addToSet": {"blogs_viewed": blog_slug},
                    "$inc": {"total_blog_views": 1}
                }
            )
    
    return {"tracked": True}


@api_router.post("/tracking/discount-claimed")
async def track_discount_claimed(data: dict):
    """Track when a visitor claims a discount"""
    visitor_id = data.get("visitor_id")
    discount_type = data.get("discount_type", "regular")  # "regular" (₹50) or "exit" (₹100)
    discount_amount = data.get("amount", 50)
    phone = data.get("phone", "")
    
    if visitor_id:
        update_data = {
            "$set": {
                "discount_claimed": True,
                "discount_type": discount_type,
                "discount_amount": discount_amount,
                "discount_claimed_at": datetime.now(timezone.utc).isoformat()
            }
        }
        
        if phone:
            update_data["$set"]["phone"] = phone
        
        await db.visitor_profiles.update_one(
            {"visitor_id": visitor_id},
            update_data,
            upsert=True
        )
    
    return {"tracked": True}


@api_router.get("/admin/blog-stats")
async def get_blog_stats(x_admin_token: str = Header(None)):
    """Get blog statistics for admin dashboard"""
    verify_admin_token(x_admin_token)
    
    total_blogs = await db.blogs.count_documents({})
    
    # Today's blogs
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    today_blogs = await db.blogs.count_documents({"created_at": {"$regex": f"^{today}"}})
    
    # Total views
    pipeline = [
        {"$group": {"_id": None, "total_views": {"$sum": {"$ifNull": ["$views", 0]}}}}
    ]
    views_result = await db.blogs.aggregate(pipeline).to_list(1)
    total_views = views_result[0]["total_views"] if views_result else 0
    
    # Today's views
    today_views = await db.blog_views.count_documents({"timestamp": {"$regex": f"^{today}"}})
    
    # Top blogs by views
    top_blogs = await db.blogs.find(
        {"views": {"$gt": 0}},
        {"_id": 0, "title": 1, "slug": 1, "views": 1, "category": 1}
    ).sort("views", -1).limit(5).to_list(5)
    
    # Recent blogs
    recent_blogs = await db.blogs.find(
        {},
        {"_id": 0, "title": 1, "slug": 1, "created_at": 1, "views": 1, "is_trending": 1}
    ).sort("created_at", -1).limit(10).to_list(10)
    
    # Trending blogs count
    trending_count = await db.blogs.count_documents({"is_trending": True})
    
    return {
        "total_blogs": total_blogs,
        "today_blogs": today_blogs,
        "total_views": total_views,
        "today_views": today_views,
        "top_blogs": top_blogs,
        "recent_blogs": recent_blogs,
        "trending_count": trending_count
    }


@api_router.get("/admin/user-tracking/visitors")
async def get_tracked_visitors(
    x_admin_token: str = Header(None),
    date: Optional[str] = Query(None),
    days: int = Query(7, ge=1, le=365)
):
    """Get all tracked visitors"""
    verify_admin_token(x_admin_token)
    
    if date:
        visitors = await user_behavior_tracker.get_visitors_by_date(date)
    else:
        visitors = await user_behavior_tracker.get_all_visitors(days=days)
    
    return {"visitors": visitors}


@api_router.get("/admin/user-tracking/visitor/{visitor_id}")
async def get_visitor_journey(
    visitor_id: str,
    x_admin_token: str = Header(None)
):
    """Get complete journey of a specific visitor"""
    verify_admin_token(x_admin_token)
    
    journey = await user_behavior_tracker.get_visitor_journey(visitor_id)
    return journey


@api_router.get("/admin/user-tracking/stats")
async def get_user_tracking_stats(
    x_admin_token: str = Header(None),
    days: int = Query(7, ge=1, le=365),
    date: Optional[str] = Query(None, description="Single date in YYYY-MM-DD format")
):
    """Get user tracking statistics - supports both days range and single date"""
    verify_admin_token(x_admin_token)
    
    stats = await user_behavior_tracker.get_visitor_stats(days=days, date=date)
    return stats


@api_router.post("/admin/cron/trigger-blog-generation")
async def trigger_blog_generation(
    x_admin_token: str = Header(None),
    blog_type: str = Query("auto", description="Type: auto, location, or topic")
):
    """Manually trigger blog generation (for testing cron)"""
    verify_admin_token(x_admin_token)
    
    if blog_type == "location":
        result = await auto_blog_generator.generate_location_blogs(states=None, count=12)
    elif blog_type == "topic":
        # Generate with sample topics
        topics = [
            "Best anti-aging ingredients for Indian skin",
            "How to reduce wrinkles naturally",
            "Night skincare routine for 30+",
            "Benefits of retinol serum"
        ]
        result = await auto_blog_generator.generate_topic_blogs(topics=topics, count=12)
    else:
        result = await auto_blog_generator.generate_and_save_blogs(count=12)
    
    # Log the manual trigger
    await db.cron_logs.insert_one({
        "job": "manual_blog_generation",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "blog_type": blog_type,
        "generated": result.get("generated", 0),
        "failed": result.get("failed", 0),
        "triggered_by": "admin"
    })
    
    return result


@api_router.get("/admin/cron/logs")
async def get_cron_logs(
    x_admin_token: str = Header(None),
    limit: int = Query(20, ge=1, le=100)
):
    """Get recent cron job logs"""
    verify_admin_token(x_admin_token)
    
    logs = await db.cron_logs.find(
        {}, 
        {"_id": 0}
    ).sort("timestamp", -1).limit(limit).to_list(limit)
    
    return {"logs": logs}


@api_router.get("/admin/cron/status")
async def get_cron_status(x_admin_token: str = Header(None)):
    """Get cron job status and next run time"""
    verify_admin_token(x_admin_token)
    
    # Get last generation log
    last_log = await db.cron_logs.find_one(
        {"job": {"$in": ["auto_blog_generation", "manual_blog_generation", "trending_blog_generation"]}},
        {"_id": 0},
        sort=[("timestamp", -1)]
    )
    
    # Calculate next run times based on staggered schedule:
    # 6 AM - Location blogs (12)
    # 12 PM - Topic blogs (6)
    # 6 PM - Trending blogs (6)
    # 12 AM - Mix blogs (6)
    # PLUS: Hourly trending blogs
    now = datetime.now(timezone.utc)
    
    scheduled_hours = [0, 6, 12, 18]  # 12AM, 6AM, 12PM, 6PM
    next_scheduled = None
    
    for hour in scheduled_hours:
        target = now.replace(hour=hour, minute=0, second=0, microsecond=0)
        if now.hour < hour:
            next_scheduled = target
            break
    
    if not next_scheduled:
        # Next day 12 AM
        next_scheduled = now.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1)
    
    time_until_scheduled = (next_scheduled - now).total_seconds()
    
    # Next hourly trending (runs every hour)
    next_hourly = now.replace(minute=0, second=0, microsecond=0) + timedelta(hours=1)
    time_until_hourly = (next_hourly - now).total_seconds()
    
    # Use the sooner of the two
    if time_until_hourly < time_until_scheduled:
        next_run = next_hourly
        time_until_next = time_until_hourly
        next_type = "Hourly Trending"
    else:
        next_run = next_scheduled
        time_until_next = time_until_scheduled
        job_map = {0: "Mix Blogs", 6: "Location Blogs", 12: "Topic Blogs", 18: "Trending Batch"}
        next_type = job_map.get(next_scheduled.hour, "Auto Blogs")
    
    # Get today's blog count
    today_str = now.strftime("%Y-%m-%d")
    today_blogs = await db.blogs.count_documents({"created_at": {"$regex": f"^{today_str}"}})
    total_blogs = await db.blogs.count_documents({})
    trending_blogs = await db.blogs.count_documents({"is_trending": True})
    
    return {
        "cron_active": True,
        "schedule": "Staggered (6AM/12PM/6PM/12AM) + Hourly Trending",
        "next_run": next_run.isoformat() if next_run else None,
        "next_run_type": next_type,
        "time_until_next_seconds": int(time_until_next),
        "time_until_next_formatted": f"{int(time_until_next // 3600)}h {int((time_until_next % 3600) // 60)}m",
        "last_run": last_log.get("timestamp") if last_log else None,
        "last_run_generated": last_log.get("generated", 0) if last_log else 0,
        "today_blogs_generated": today_blogs,
        "total_blogs": total_blogs,
        "trending_blogs": trending_blogs,
        "blogs_per_run": 12
    }


# ==================== TRENDING NEWS BLOG ENDPOINTS ====================

@api_router.get("/admin/ai/trending-news")
async def get_trending_news(x_admin_token: str = Header(None), feed_type: str = Query("celebrity_india")):
    """Fetch current trending news for preview"""
    verify_admin_token(x_admin_token)
    
    news = await trending_news_generator.fetch_trending_news(feed_type, limit=10)
    return {"news": news, "feed_type": feed_type}


@api_router.post("/admin/ai/generate-trending-blogs")
async def generate_trending_blogs(x_admin_token: str = Header(None), count: int = Query(3, ge=1, le=5)):
    """Generate blogs from trending news"""
    verify_admin_token(x_admin_token)
    
    result = await trending_news_generator.generate_trending_blogs(count=count)
    
    # Log the generation
    await db.cron_logs.insert_one({
        "job": "trending_blog_generation",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "generated": result.get("successful", 0),
        "failed": result.get("failed", 0),
        "triggered_by": "admin"
    })
    
    return result


@api_router.get("/admin/ai/trending-stats")
async def get_trending_blog_stats(x_admin_token: str = Header(None)):
    """Get trending blog statistics"""
    verify_admin_token(x_admin_token)
    
    stats = await trending_news_generator.get_trending_stats()
    return stats


# ==================== WHATSAPP API ENDPOINTS ====================

class WhatsAppSendRequest(BaseModel):
    phone: str
    message: str
    category: Optional[str] = "promotional"


class WhatsAppBulkRequest(BaseModel):
    phones: List[str]
    message: str
    category: Optional[str] = "promotional"


class WhatsAppOrderNotifyRequest(BaseModel):
    order_id: str


class WhatsAppConsultationNotifyRequest(BaseModel):
    consultation_id: str
    recommendations: Optional[str] = None


@api_router.post("/admin/whatsapp/send")
async def send_whatsapp_message(request: WhatsAppSendRequest, x_admin_token: str = Header(None)):
    """Send a custom WhatsApp message to a customer"""
    verify_admin_token(x_admin_token)
    
    result = await whatsapp_service.send_custom_message(
        phone_number=request.phone,
        message=request.message,
        message_category=request.category
    )
    
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Failed to send message"))
    
    return result


@api_router.post("/admin/whatsapp/send-bulk")
async def send_bulk_whatsapp(request: WhatsAppBulkRequest, x_admin_token: str = Header(None)):
    """Send WhatsApp message to multiple recipients"""
    verify_admin_token(x_admin_token)
    
    result = await whatsapp_service.send_bulk_messages(
        phone_numbers=request.phones,
        message=request.message,
        message_category=request.category
    )
    
    return result


@api_router.post("/admin/whatsapp/notify-order")
async def send_order_whatsapp_notification(request: WhatsAppOrderNotifyRequest, x_admin_token: str = Header(None)):
    """Send order confirmation via WhatsApp"""
    verify_admin_token(x_admin_token)
    
    # Get order details
    order = await db.orders.find_one({"order_id": request.order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    result = await whatsapp_service.send_order_confirmation(
        phone_number=order.get("phone"),
        order_id=order.get("order_id"),
        customer_name=order.get("name"),
        amount=order.get("amount"),
        payment_method=order.get("payment_method"),
        delivery_timeline=order.get("delivery_timeline", "3-5 Business Days")
    )
    
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Failed to send WhatsApp notification"))
    
    return result


@api_router.post("/admin/whatsapp/notify-consultation")
async def send_consultation_whatsapp_notification(request: WhatsAppConsultationNotifyRequest, x_admin_token: str = Header(None)):
    """Send consultation results via WhatsApp"""
    verify_admin_token(x_admin_token)
    
    # Get consultation details
    consultation = await db.consultations.find_one({"consultation_id": request.consultation_id}, {"_id": 0})
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")
    
    # Build recommendations text
    recommendations = request.recommendations or "Based on your skin analysis, we recommend using Celesta Glow Anti-Aging Serum twice daily - morning and night after cleansing. For best results, follow with a moisturizer and SPF during the day."
    
    result = await whatsapp_service.send_consultation_result(
        phone_number=consultation.get("phone"),
        customer_name=consultation.get("name"),
        consultation_id=consultation.get("consultation_id"),
        skin_type=consultation.get("skin_type", "Normal"),
        concerns=consultation.get("concerns", []),
        recommendations=recommendations
    )
    
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Failed to send WhatsApp notification"))
    
    return result


@api_router.get("/admin/whatsapp/logs")
async def get_whatsapp_logs(
    x_admin_token: str = Header(None),
    limit: int = Query(50, ge=1, le=200),
    status: Optional[str] = Query(None)
):
    """Get WhatsApp message logs"""
    verify_admin_token(x_admin_token)
    
    logs = await whatsapp_service.get_message_logs(limit=limit, status=status)
    return {"logs": logs}


@api_router.get("/admin/whatsapp/stats")
async def get_whatsapp_stats(x_admin_token: str = Header(None)):
    """Get WhatsApp messaging statistics"""
    verify_admin_token(x_admin_token)
    
    stats = await whatsapp_service.get_stats()
    return stats


@api_router.post("/admin/whatsapp/test")
async def test_whatsapp_connection(x_admin_token: str = Header(None), phone: str = Query(...)):
    """Test WhatsApp API connection by sending a test message"""
    verify_admin_token(x_admin_token)
    
    result = await whatsapp_service.send_text_message(
        phone_number=phone,
        message="This is a test message from Celesta Glow Admin Panel. WhatsApp integration is working! ✅"
    )
    
    return result


app.include_router(api_router)
app.include_router(admin_routes.router, prefix="/api")
app.include_router(i18n_routes.router, prefix="/api")
app.include_router(consultation_routes.router, prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()