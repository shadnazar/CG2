# Celesta Glow - Product Requirements Document

## Original Problem Statement
Build a comprehensive e-commerce platform for an anti-aging serum ("Celesta Glow") with:
- Full e-commerce functionality (product page, checkout, payments)
- Admin panel with analytics and order management
- AI-powered SEO blog generation
- User behavior tracking and analytics
- Meta Pixel and Google Analytics integration
- Conversion rate optimization features

## Core Requirements
- **E-commerce**: Product display, Razorpay payments (COD & Prepaid), order tracking
- **Admin Panel**: Order management, visitor analytics, AI blog studio, user journey tracking
- **Marketing**: Meta Pixel tracking, Google Analytics, social proof notifications
- **Content**: AI-generated location and topic-based SEO blogs

## Current Pricing (Updated April 1, 2026)
- **Prepaid Price**: ₹699 (was ₹599)
- **COD Price**: ₹799 (was ₹699)
- **MRP**: ₹1,499
- **Discount**: 53% OFF (was 60%)

## Referral Program (Updated April 1, 2026)
- **Referred Customer Gets**: ₹50 discount (was ₹100)
- **Referrer Gets**: ₹100 cashback after delivery (was ₹200 immediately)
- **Social Proof**: Dynamic counter showing referrers and earnings (updates daily +2-3 referrers)

### Complete Referral Flow:
1. **Customer A orders** → Gets unique referral link (`celestaglow.com?ref=CODE`)
2. **Referral link stored** in order document (MongoDB)
3. **Order Success Page** displays referral link with Copy & WhatsApp share buttons
4. **Customer B uses referral link** → ₹50 discount auto-applied at checkout
5. **Admin marks order as Delivered** → ₹100 cashback becomes "ready to pay"
6. **Admin clicks "Pay"** → Cashback marked as paid

### Admin Referrals Dashboard Features:
- View all referrers with their referral links
- Track clicks, purchases, earnings
- See pending vs paid earnings
- Click eye icon to view referred orders
- Process individual order cashback payments

## What's Been Implemented

### April 4, 2026 - Security & Code Quality Fixes
**Critical Security Fixes Applied:**
1. **Hardcoded Secrets** - Admin password moved to environment variable (`ADMIN_PASSWORD`)
2. **Weak Cryptography** - MD5 replaced with SHA-256 in `referral_service.py`
3. **Insecure Random** - `random` module replaced with `secrets` in server.py and image_service.py
4. **XSS Vulnerabilities** - Added DOMPurify sanitization to:
   - `BlogPost.js` - Blog content rendering
   - `AdminAIStudio.js` - AI-generated content preview
   - `customerNotifications.js` - Notification messages
5. **Empty Catch Blocks** - Added development-mode logging for debugging

**COD & Discount Fixes:**
- COD ₹1 bug fixed - Always charges ₹49 advance
- Instant discount update on checkout
- Order Success page shows correct COD breakdown
- Delhivery integration configured with auto-shipment creation

### April 1, 2026 - P0 Bug Fixes (Session 3)
- **Tracking API 404 Errors FIXED**: Added missing `/api/track-action` and `/api/track-batch` endpoints
  - `TrackingProvider.js` was calling these endpoints but they didn't exist in backend
  - Now properly stores events in `tracking_events` collection
  - Updates `visitor_profiles` with action history
- **Welcome Notification Verified WORKING**: Green welcome notification displays correctly for new users
- **User Tracking Not Updating FIXED**: 
  - Root cause: `TrackingProvider.js` only called `/api/track-visit` (enhanced_analytics → page_visits collection)
  - But Admin User Journey reads from `user_page_visits` collection (populated by `/api/tracking/page-visit`)
  - Fix: Updated `TrackingProvider.js` to ALSO call `/api/tracking/page-visit` with full visitor data
  - Now all page visits tracked in: `page_visits`, `user_page_visits`, and `tracking_events` collections
  - Verified: 558 total page visits, 148 visitor profiles, 31 unique visitors today

### April 1, 2026 - Performance Optimization (Session 2)
- **TrackingProvider**: Centralized tracking (Meta Pixel, GA, User Behavior) - reduces code duplication
- **PublicLayout**: Shared components (Notifications, Popups, WhatsApp button) - renders once
- **Lazy Loading**: Admin pages and heavy components load on demand - faster initial load
- **Notification Fix**: Order notifications now properly cycle after welcome notification
- **Code Cleanup**: Removed duplicate tracking imports from individual pages

**Technical Improvements:**
- `/app/frontend/src/providers/TrackingProvider.js` - Single source of truth for all tracking
- `/app/frontend/src/layouts/PublicLayout.js` - Shared components don't re-mount on navigation
- `/app/frontend/src/AppRouter.js` - React.lazy() for admin and heavy pages
- `/app/backend/server.py` - Added `/api/track-action` and `/api/track-batch` endpoints

**Test Results:** Backend 95% (18/19), Frontend 100%

### April 1, 2026 - Complete Referral System
- **Order Success Page**: Shows full referral link with copy/share buttons
- **Admin Referrals Dashboard**: 
  - Displays referral links (not just codes)
  - View details modal with all referred orders
  - "Pay ₹100" button for each delivered order
  - Track paid vs pending earnings
- **Delivery Cashback Flow**:
  - When order marked "Delivered", cashback status → "ready_to_pay"
  - Admin can process individual payments
  - Earnings tracked in referrer's account
- **Notification Close Button**: Added X button to dismiss notifications immediately
- **Dynamic Referrer Count**: Updated to 2-3 per day growth

### April 1, 2026 - Pricing & Referral Update
- **Price Changes:**
  - Prepaid: ₹599 → ₹699
  - COD: ₹699 → ₹799
  - Discount badge: 60% → 53% OFF
  
- **Referral System Updates:**
  - Customer discount: ₹100 → ₹50
  - Referrer cashback: ₹200 → ₹100 (paid after delivery)
  - Added dynamic social proof on checkout: "₹X,XXX+ withdrawn this week"
  - Referrer count increases by 3-4 per day automatically

- **Updated Across All Pages:**
  - ProductPage.js
  - Homepage.js
  - ConsultationPage.js
  - LocationPage.js
  - BlogList.js, BlogPost.js
  - OrderSuccessPage.js
  - AdminReferrals.js
  - Meta Pixel tracking values
  - Email templates

### March 31, 2026 - Session 2
- **Notification System Optimized:**
  - First notification after 5-6 seconds
  - Then every 15-20 seconds
  - Max 5 notifications per session
  - Messenger-style soft sound
  - Top-right position

- **Dermatologist Section Added:**
  - 16 expert dermatologists with unique names
  - Professional credentials and specialties
  - Expert quotes about ingredients
  - Futuristic carousel design
  - Added to Homepage and Product Page

### March 31, 2026 - Session 1
- **Notification System Overhaul (Initial)**
- **User Journey Analytics** - Pagination, First Seen dates
- **UI Polish** - Removed hyphens, FREE shipping display
- **Broadcast notifications working**

### Previous Implementations
- Meta Pixel `Purchase` event on `/order-success/:orderId` page
- DOM-level click tracking for `InitiateCheckout`
- 24 randomized conversion headlines on Homepage
- Service Worker for push notifications
- Admin notification sound for new orders
- Background cron for auto-blog generation (2hr cycle)
- Order status management (Shipped/Delivered) with email triggers
- Exit-intent popup, sticky add-to-cart, trust badges

## Architecture
```
/app
├── backend/
│   ├── services/
│   ├── cron_runner.py (Background - 2hr cycle)
│   └── server.py
└── frontend/
    └── src/
        ├── components/
        │   ├── DermatologistSection.js (NEW)
        │   ├── RecentPurchaseNotification.js (Updated timing)
        ├── pages/
        │   ├── Homepage.js (Added Dermatologist Section)
        │   ├── ProductPage.js (Added Dermatologist Section)
        └── utils/
            ├── customerNotifications.js (Admin broadcasts only)
```

## Pending/Future Tasks

### P0 (High Priority)
- WhatsApp Cloud API integration (credentials in backend/.env)

### P2 (Medium Priority)
- Customer referral program
- Customer video testimonials collection

### P3 (Low Priority)
- Refactor ProductPage.js (approaching 1200 lines)
- Refactor ConsultationPage.js

## 3rd Party Integrations
- **OpenAI GPT-4o** - Emergent LLM Key
- **Razorpay** - Live payments configured
- **Meta Pixel** - ID: 690863659974240
- **Google Analytics** - ID: G-LSJCVKB8BP
- **WhatsApp Cloud API** - Credentials ready, integration pending

## Credentials
- Admin Password: `celestaglow2024`
- Production URL: https://celestaglow.com
- Preview URL: https://serum-ecommerce-ai.preview.emergentagent.com
