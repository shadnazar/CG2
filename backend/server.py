from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
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


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

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
    except:
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


@api_router.get("/pincode/{pincode}/state")
async def get_state_by_pincode(pincode: str):
    state = get_state_from_pincode(pincode)
    return {"pincode": pincode, "state": state}


app.include_router(api_router)

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