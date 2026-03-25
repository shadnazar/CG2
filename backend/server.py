from fastapi import FastAPI, APIRouter, HTTPException, Query, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import re
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
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
    return result


# ==================== ADMIN ANALYTICS ENDPOINTS ====================

def verify_admin_token(x_admin_token: str = Header(None)):
    """Verify admin token"""
    import hashlib
    ADMIN_PASSWORD_HASH = hashlib.sha256("celestaglow2024".encode()).hexdigest()
    if not x_admin_token:
        raise HTTPException(status_code=401, detail="Admin token required")
    if hashlib.sha256(x_admin_token.encode()).hexdigest() != ADMIN_PASSWORD_HASH:
        raise HTTPException(status_code=403, detail="Invalid admin token")
    return True


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
async def suggest_blog_topics(x_admin_token: str = Header(None), count: int = Query(5, ge=1, le=10)):
    """Get AI-suggested blog topics"""
    verify_admin_token(x_admin_token)
    
    result = await ai_content_generator.suggest_blog_topics(count=count)
    
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
    
    result = await auto_blog_generator.generate_location_blogs(states=request.states)
    return result


@api_router.post("/admin/ai/batch-topic-blogs")
async def batch_topic_blogs(request: BatchTopicBlogsRequest, x_admin_token: str = Header(None)):
    """Generate blogs for specific user-defined topics"""
    verify_admin_token(x_admin_token)
    
    result = await auto_blog_generator.generate_topic_blogs(topics=request.topics)
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