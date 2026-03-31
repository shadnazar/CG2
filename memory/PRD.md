# Celesta Glow E-Commerce Platform - PRD

## Original Problem Statement
Build an AI-driven e-commerce website for Celesta Glow anti-aging serum with:
- Full admin panel for content management
- AI-powered blog generation (SEO-optimized, location-targeted)
- Live visitor tracking & lead generation
- Online consultation system
- Meta Pixel deep integration
- Complete user behavior tracking

## User Personas
1. **Customers**: Women 25-50 seeking anti-aging solutions
2. **Admin**: Business owner managing content, orders, and analytics

## Core Requirements

### Implemented Features ✅

#### 1. E-Commerce Core
- Product page with pricing (₹599 prepaid, ₹1499 MRP)
- Razorpay payment integration
- COD option with advance payment
- Order confirmation emails

#### 2. Admin Panel (`/admin`)
- Secure login (password: celestaglow2024)
- Analytics dashboard (live visitors, page stats, leads)
- **Day-wise Visitor Analytics with date filters**
  - Preset filters: Last 7/14/30 days, 3/6 months, 1 year
  - Custom date picker
  - Shows Homepage, Product, Checkout visits per day
- **Page visit totals for Homepage, Product, Checkout**
- **Top Visitor Locations by state**
- **Password change functionality**
- Blog CRUD management
- Location management
- Order viewer
- AI Content Studio (manual blog generation)
- **Consultations management with phone numbers and face photos**
- **Quick Actions**: Direct links to Consultations and User Journey

#### 3. User Journey Tracking Dashboard (Mar 2026)
- **Cookie consent integrated into Discount Popup** - No separate banner
- **Unique Visitor ID**: Each user gets a unique tracking ID after accepting terms
- **Complete Behavior Tracking**:
  - Pages visited with timestamps
  - Time spent on each page
  - Actions taken (clicks, form fills, scroll)
  - Whether address was entered
  - Checkout funnel progression
- **Date Picker**: Filter visitors by specific date
- **Stats Dashboard**: Total visitors, new vs returning, checkout rate, avg time
- **Individual Journey View**: Expand any visitor to see their complete journey

#### 4. Legal Pages (Mar 2026)
- **Terms & Conditions** (`/terms`): Covers cookies, tracking, data usage, returns policy
- **Privacy Policy** (`/privacy`): Detailed cookie types, data collection, third-party services

#### 5. Auto Blog Cron Job (Staggered + Hourly Trending)
- **Staggered Schedule**:
  - 6 AM: 12 location-based blogs with state cycling
  - 12 PM: 6 topic blogs
  - 6 PM: 6 trending celebrity blogs (batch)
  - 12 AM: 6 mix blogs
- **HOURLY Trending Blogs** (NEW Mar 29, 2026):
  - Every 1 hour, generates 3 trending celebrity blogs
  - Fetches from Google News RSS (celebrity skincare, Bollywood, beauty trends)
  - AI connects trending news to skincare tips
- **Duplicate avoidance**: Skips states/topics used in last 30 days
- **Manual trigger**: Available via Admin AI Studio
- **Cron logs**: Stored in MongoDB `cron_logs` collection

#### 4. AI Content Engine
- GPT-4o powered blog generation
- Auto-generates 12 SEO blogs every 12 hours
- **1-Click Location Blogs generation (up to 12 states)**
- **1-Click Topic Blogs generation (up to 12 topics)**
- **Duplicate avoidance - cycles through states without repeating**
- Location-targeted content
- **Blog images from Unsplash/Pexels**

#### 5. CRO Features
- **Exit-Intent Popup**: Shows ₹100 extra discount when user tries to leave
- **Enhanced Sticky Add-to-Cart**: With FLASH SALE badge, countdown timer
- **Trust Badges Section**: 100% Genuine, Dermatologist Tested, Secure Payment, Free Delivery + Payment logos
- Phone capture popup (₹50 discount)
- Auto-applied discounts at checkout
- Auto-scrolling testimonials
- "Recently Purchased" social proof notifications
- **Free Skin Analysis CTA on homepage**

#### 6. Consultations (Skin Analysis)
- 6-question skin analysis funnel
- Optional 3-face photo upload
- Phone number capture (no OTP)
- Personalized recommendations based on answers
- PDF report generation
- Admin panel shows all consultations with photos and phone numbers

#### 7. Meta Pixel Integration (ID: 690863659974240)
- PageView tracking
- ViewContent on product/homepage
- AddToCart, InitiateCheckout, Purchase events
- Lead capture tracking
- AddToCart tracking
- InitiateCheckout tracking
- AddPaymentInfo tracking
- Purchase tracking
- Lead tracking (discount claimed)
- **Blog view tracking (NEW)**
- **Search tracking (NEW)**
- **CTA click tracking (NEW)**
- **FAQ interaction tracking (NEW)**
- **Custom events: TimeOnPage, ExitIntent, PopupShown, etc. (NEW)**

#### 6. Online Consultation System (NEW) ✅
- **Landing page** with language switcher (EN/HI/ML)
- **6-question flow**:
  - Q1: Age group
  - Q2: Skin type
  - Q3: Main concerns (max 2)
  - Q4: Sun exposure + Sunscreen usage
  - Q5: Lifestyle
  - Q6: Skincare usage
- **Face upload** (optional, 3 images: Front/Left/Right)
- **Image compression** for faster loading
- **Phone number input** (mandatory, no OTP)
- **Animated analyzing screen** with progress (0-100%)
- **Personalized result page**:
  - Aging Level (Low/Moderate/High)
  - Causes (based on answers)
  - Morning Routine
  - Night Routine (featuring Celesta Glow)
  - Important Rules
  - Diet Tips
  - Exercise Tips
  - Product Recommendation (highlighted)
  - **Uploaded photos display (NEW)**
- **PDF download** with full report
- **Admin panel integration**:
  - View all consultations
  - Full answers, causes, recommendations
  - Uploaded photos display
  - Analytics: completion rate, drop-off, aging distribution

## Tech Stack
- **Frontend**: React, Tailwind CSS, Lucide Icons, Shadcn/UI
- **Backend**: FastAPI, Motor (Async MongoDB)
- **Database**: MongoDB
- **Integrations**: 
  - emergentintegrations (GPT-4o)
  - Razorpay
  - SMTP (Gmail)
  - Meta Pixel
  - jsPDF (PDF generation)
  - **WhatsApp Cloud API (Meta Graph API v18.0)** - NEW

## Code Architecture
```
/app
├── backend/
│   ├── models/
│   │   ├── blog.py
│   │   ├── location.py
│   │   └── consultation.py (NEW)
│   ├── routes/
│   │   ├── admin.py
│   │   ├── i18n.py
│   │   └── consultation.py (NEW)
│   ├── services/
│   │   ├── ai_content_generator.py
│   │   ├── auto_blog_generator.py
│   │   ├── enhanced_analytics.py
│   │   ├── image_service.py (NEW)
│   │   ├── consultation_service.py (NEW)
│   │   └── whatsapp_service.py (NEW - Mar 2026)
│   └── server.py
└── frontend/
    └── src/
        ├── components/
        │   ├── DiscountPopup.js
        │   ├── Navigation.js (updated with Skin Analysis link)
        │   ├── RecentPurchaseNotification.js
        │   └── ScrollToTop.js
        ├── pages/
        │   ├── ConsultationPage.js (NEW)
        │   ├── BlogList.js (updated with images)
        │   ├── BlogPost.js (updated with hero image)
        │   ├── Homepage.js (updated with consultation CTA)
        │   └── admin/
        │       ├── AdminConsultations.js (NEW)
        │       └── AdminWhatsApp.js (NEW - Mar 2026)
        └── utils/
            └── metaPixel.js (NEW)
```

## API Endpoints

### Consultation APIs (NEW)
- `GET /api/consultation/questions?lang=en` - Get questions
- `GET /api/consultation/labels?lang=en` - Get labels
- `POST /api/consultation/submit` - Submit consultation
- `GET /api/consultation/{id}` - Get consultation by ID
- `POST /api/consultation/{id}/pdf-downloaded` - Mark PDF downloaded
- `POST /api/consultation/track-event` - Track funnel events
- `GET /api/consultation/admin/all` - Get all consultations (admin)
- `GET /api/consultation/admin/stats` - Get consultation stats (admin)

### Blog APIs
- `POST /api/admin/blogs/backfill-images` - Add images to existing blogs (NEW)

## Admin Panel Access
- **URL**: `https://antiaging.celestaglow.com/admin` (production) or `/admin` on preview
- **Password**: `celestaglow2024`

## Completed Work (This Session - December 25, 2025)

### December 25, 2025
1. **Blog Images Feature** ✅
   - Created image_service.py with category-based image mapping
   - Updated auto_blog_generator.py to include images
   - Added backfill endpoint for existing blogs
   - Updated BlogList.js and BlogPost.js to display images
   - All 7 blogs now have images

2. **Meta Pixel Deep Integration** ✅
   - Created metaPixel.js utility with 20+ tracking functions
   - Integrated across Homepage, ProductPage, BlogList, BlogPost
   - Added to DiscountPopup for Lead tracking
   - Pixel ID: 690863659974240

3. **Online Consultation System** ✅
   - Complete 6-question flow
   - Multi-language support (EN/HI/ML)
   - Face upload with compression
   - Animated analyzing screen (0-100%)
   - Personalized results with all sections
   - PDF download
   - Admin panel with full data + analytics
   - Uploaded images shown on result + admin

4. **Product Page Visual Enhancement** ✅
   - **Enhanced Ingredients Section**: 
     - Gradient icon cards (purple/blue/amber/green)
     - Detailed descriptions for each ingredient
     - Green checkmark indicators
   - **"Why 10,000+ Choose Celesta Glow" Section**:
     - Dark gradient background
     - Stats: 94% Visible Results, 100% Safe Formula, #1 Award Winning
   - **Improved Accordion**:
     - 4 sections with emoji icons
     - Highlight badges (4-in-1 Formula, Night Use Only, 8-Week Study, 30ml Bottle)
   - **Trust Section at Bottom**:
     - 5-star rating with customer count
     - FDA Approved, Cruelty Free, Made in India badges

5. **Comprehensive Testing** ✅
   - All pages verified for conversion optimization
   - 100% frontend pass rate
   - Meta Pixel working on all pages
   - Admin panel fully functional

## Backlog / Future Tasks (P1)
1. A/B Testing Framework
2. ~~WhatsApp integration for order updates~~ ✅ COMPLETED (Mar 2026)
3. Referral program
4. Customer video testimonials collection system

## Completed Work - March 2026

### March 31, 2026
1. **Meta Pixel Implementation - COMPLETE** ✅
   - Pixel ID: 690863659974240
   - **ViewContent**: Fires on product page with value: 599, content_ids: ['celestaglow_serum_001']
   - **InitiateCheckout**: Fires when user clicks Buy Now and sees checkout form
   - **Purchase**: Fires on order confirmation with order_id for deduplication
   - No AddToCart event (direct Buy Now flow as specified)
   - All events use exact format from Meta Pixel Implementation Guide

2. **Admin Login Fix** ✅
   - Added `/api/admin/login` endpoint
   - Fixed token verification to accept plain password
   - Password: celestaglow2024

3. **Blog Search Fix** ✅
   - Fixed search to handle "anti aging" → "anti-aging" variants
   - Fixed keywords array handling (was causing TypeError)
   - Shows "No articles found" instead of blank page

4. **Location-Based Blogs** ✅
   - Detects user location from localStorage/geolocation
   - Reverse geocodes coordinates to city/state
   - Shows blogs from user's state or nearby states

5. **Exit Intent ₹100 Discount** ✅
   - Saves to localStorage when claimed
   - Auto-applies at checkout
   - trackExitIntent() fires when popup shown

### March 29, 2026
1. **Fixed Blog Generation API** ✅
   - Root cause: `emergentintegrations` library API changed from `chat()` to `LlmChat` class
   - Fixed `/app/backend/services/trending_news_generator.py` - Updated to new LlmChat API
   - Fixed `/app/backend/services/ai_skin_analyzer.py` - Updated to new LlmChat API with image support
   - Fixed `/app/backend/services/auto_blog_generator.py` - Added `force=True` for manual triggers
   - All blog types (Location, Topic, Trending) now generating successfully

2. **Load Trending Topics Feature** ✅
   - Added dynamic AI-powered topic suggestions
   - "Load Trending Topics" button now fetches fresh, timely topics using GPT-4o
   - Topics are based on current day/month and trending skincare topics in India
   - Returns simple topic title strings (not complex objects)

3. **Updated Timer Display** ✅
   - Timer now shows next run type (Hourly Trending, Location Blogs, etc.)
   - Schedule displays: "Staggered (6AM/12PM/6PM/12AM) + Hourly Trending"

4. **Exit Intent ₹100 Discount** ✅
   - Exit popup ₹100 discount now saves to localStorage
   - Discount automatically applies at checkout
   - Discount amount correctly reflected (₹100 vs ₹50 welcome offer)
   - Banner shows discount type: "Special exit offer" or "Welcome offer"

5. **Enhanced Customer Profiles** ✅
   - Location tracking with reverse geocoding (lat/long → City, State, Pincode)
   - Phone number tracking from discount claims
   - Discount claimed status (type: regular/exit, amount)
   - Visitor cards show location badge, phone badge, discount badge
   - Expanded profile shows full customer details

6. **Tracking Improvements** ✅
   - New `/api/tracking/discount-claimed` endpoint
   - Location reverse geocoding using OpenStreetMap Nominatim API
   - Discount tracking for both ₹50 welcome and ₹100 exit offers

### March 27, 2026
1. **Homepage Image Fix** ✅
   - Replaced broken celestaglow.com CDN image with uploaded customer-assets image
   - New hero image showing Before/While Using/After transformation

2. **WhatsApp Cloud API Integration** ✅
   - **Backend Service** (`/app/backend/services/whatsapp_service.py`):
     - Meta Graph API v18.0 integration
     - Phone number formatting for India (+91)
     - Order confirmation messages
     - Consultation result messages
     - Custom message sending
     - Bulk messaging support
     - Message logging to MongoDB
   - **API Endpoints**:
     - `POST /api/admin/whatsapp/send` - Send custom message
     - `POST /api/admin/whatsapp/send-bulk` - Bulk messaging
     - `POST /api/admin/whatsapp/notify-order` - Order confirmation
     - `POST /api/admin/whatsapp/notify-consultation` - Consultation results
     - `GET /api/admin/whatsapp/logs` - Message logs
     - `GET /api/admin/whatsapp/stats` - Statistics
     - `POST /api/admin/whatsapp/test` - Test connection
   - **Admin Panel** (`/admin/whatsapp`):
     - Stats dashboard (total, sent, failed, success rate, today)
     - Send custom message form with templates
     - Test connection feature
     - Order notifications tab
     - Consultation notifications tab
     - Message logs tab
   - **WhatsApp Credentials** (in `/app/backend/.env`):
     - Phone Number ID: 782109748323556
     - Business Account ID: 1109104574684503
     - API Token: Configured

## Credentials
- **Admin Password**: celestaglow2024
- **Meta Pixel ID**: 690863659974240
- **Razorpay/SMTP**: In /app/backend/.env
- **WhatsApp API**: In /app/backend/.env (Phone Number ID: 782109748323556)
