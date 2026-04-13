# Celesta Glow - Product Requirements Document

## Original Problem Statement
Build a comprehensive e-commerce platform for an anti-aging serum ("Celesta Glow") with:
- Full e-commerce functionality (product page, checkout, payments)
- Admin panel with analytics and order management
- AI-powered SEO blog generation
- User behavior tracking and analytics
- Meta Pixel and Google Analytics integration
- Conversion rate optimization features
- WhatsApp Cloud API for automated customer notifications

## Core Requirements
- **E-commerce**: Product display, Razorpay payments (COD & Prepaid), order tracking
- **Admin Panel**: Order management, visitor analytics, AI blog studio, user journey tracking, WhatsApp messaging
- **Marketing**: Meta Pixel tracking, Google Analytics, social proof notifications
- **Content**: AI-generated location and topic-based SEO blogs
- **Security**: sessionStorage-based admin tokens, httpOnly cookies, SHA-256 hashing

## Recent Updates (April 13, 2026)

### Session 4 - Employee Access & Customer Management - COMPLETED ✅

**New Features Implemented:**

1. **Employee Management System** (`/admin/employees`)
   - Create employee accounts with username/password
   - Auto-generate secure passwords or set custom
   - Role-based permissions: Orders, Customers, Blogs, AI Studio, Analytics, Landing Pages, Consultations
   - Toggle permissions by clicking permission badges
   - Update employee passwords
   - Delete/deactivate employees
   - Track last login

2. **Customer Section** (`/admin/customers`)
   - View all customers with order status
   - Stats: Total Customers, Purchased, Leads, Total Revenue
   - Customer details: Name, Phone, Email, Location (City/State)
   - Order history with status and amounts
   - Filter by: All, Purchased, Leads
   - Search by name, phone, or email
   - Click customer to see full details and delivery address

3. **Employee Login System**
   - Separate login endpoint for employees: `POST /api/employee/login`
   - Session token management
   - Permission-based API access

4. **COD Advance Price Update**
   - Changed from ₹49 to ₹29 across all pages
   - Updated ProductPage.js, LandingProductPage.js, and all related files
   - Added "FASTER DELIVERY (1-2 days)" messaging for prepaid orders

**Files Created:**
- `/app/backend/services/employee_service.py`
- `/app/backend/services/customer_service.py`
- `/app/frontend/src/pages/admin/AdminEmployees.js`
- `/app/frontend/src/pages/admin/AdminCustomers.js`

**Files Updated:**
- `/app/backend/server.py` - Added employee & customer API endpoints
- `/app/frontend/src/AppRouter.js` - Added new admin routes
- `/app/frontend/src/pages/admin/AdminDashboard.js` - Added sidebar links

**API Endpoints Added:**
- `POST /api/admin/employees` - Create employee
- `GET /api/admin/employees` - List all employees
- `POST /api/admin/employees/update-password` - Update password
- `POST /api/admin/employees/update-permissions` - Update permissions
- `DELETE /api/admin/employees/{username}` - Delete employee
- `POST /api/employee/login` - Employee login
- `GET /api/employee/verify` - Verify employee token
- `GET /api/admin/customers` - List all customers
- `GET /api/admin/customers/search` - Search customers
- `GET /api/admin/customers/{phone}` - Get customer by phone

## Recent Updates (April 10, 2026)

### Session 3 - SEO Trust & Google Trust Pages - COMPLETED ✅

**SEO Improvements Implemented:**
1. **Footer Component** - Site-wide footer with:
   - Trust badges row (Free Shipping, Secure Payment, COD Available, Fast Delivery)
   - Company info: Veegal Enterprises LLP with full address
   - Quick links: Home, Shop Now, Free Skin Analysis, Blog, About Us, Contact Us
   - Customer Support: Phone (+91 94461 25745), WhatsApp, Email
   - Legal links: Terms, Privacy, Refund Policy, Shipping Policy
   - Payment methods: Razorpay, UPI, Cards, COD

2. **New Trust Pages Created:**
   - `/about` - Company story, mission, values, why choose us
   - `/contact` - Contact form + WhatsApp/Phone/Email + Office address
   - `/refund-policy` - 30-day money back guarantee, eligibility, process
   - `/shipping-policy` - Free shipping, delivery timelines, order tracking

3. **Favicon & Branding:**
   - Converted Celesta Glow logo to favicon.ico, apple-touch-icon.png, logo192.png
   - Added proper favicon markup to index.html

4. **Enhanced SEO Meta Tags:**
   - Improved meta description with keywords
   - Added canonical URL
   - Added structured data (Organization + Product schema)
   - Updated Open Graph and Twitter cards
   - Added meta keywords, author, robots tags

5. **Contact Form API:**
   - Added `POST /api/contact` endpoint for form submissions
   - Stores submissions in `contact_submissions` collection

6. **Updated Existing Pages:**
   - Terms & Conditions - Added company address and correct phone number
   - Privacy Policy - Added company information section

**Files Created:**
- `/app/frontend/src/components/Footer.js`
- `/app/frontend/src/pages/ContactPage.js`
- `/app/frontend/src/pages/AboutPage.js`
- `/app/frontend/src/pages/RefundPolicyPage.js`
- `/app/frontend/src/pages/ShippingPolicyPage.js`
- `/app/frontend/public/favicon.ico`
- `/app/frontend/public/apple-touch-icon.png`
- `/app/frontend/public/logo192.png`

**Files Updated:**
- `/app/frontend/src/AppRouter.js` - Added new page routes
- `/app/frontend/src/layouts/PublicLayout.js` - Added Footer component
- `/app/frontend/public/index.html` - Favicon, SEO meta tags, structured data
- `/app/frontend/src/pages/TermsPage.js` - Company info update
- `/app/frontend/src/pages/PrivacyPage.js` - Company info update
- `/app/backend/server.py` - Added contact form endpoint

## Recent Updates (April 7, 2026)

### Session 2 - Admin Panel Fixes - COMPLETED ✅

**Issues Fixed:**
1. **Admin Referrals Data Not Loading** (P0)
   - **Root Cause (Backend):** Referral endpoints (`/api/admin/referrals/*`) were hardcoded to check for plain password `"celestaglow2024"` instead of using the shared `verify_admin_token()` function that accepts session tokens
   - **Root Cause (Frontend):** `fetchReferrals()` function used stale closure reference to `adminToken`
   - **Fix (Backend):** Updated all 5 referral endpoints in `server.py` to use `verify_admin_token()` for consistent auth
   - **Fix (Frontend):** Updated `fetchReferrals(token)` to accept token as parameter, ensuring fresh token is always used

2. **"Purchased" Section Missing from User Journey UI** (P1)
   - Added new "Purchased" stat card to AdminUserJourney.js stats grid (7 cards now)
   - Added "Purchased" step to Conversion Funnel visualization (5 steps now)
   - Added "Purchased" clickable stat card to AdminDashboard.js (links to User Journey)

3. **Meta Pixel Verification on Landing Pages** (P1)
   - Verified Meta Pixel is properly integrated via TrackingProvider
   - `LandingProductPage.js` correctly fires: trackPageVisit, trackViewContent, trackInitiateCheckout
   - `order_complete` action tracked for conversion analytics

**Files Updated:**
- `/app/backend/server.py` - Fixed 5 referral endpoints to use verify_admin_token()
- `/app/frontend/src/pages/admin/AdminReferrals.js` - Fixed token passing in fetchReferrals()
- `/app/frontend/src/pages/admin/AdminUserJourney.js` - Added "Purchased" stat card and funnel step
- `/app/frontend/src/pages/admin/AdminDashboard.js` - Added "Purchased" stat card (clickable)

### Session 1 - Admin Panel Navigation & Auth Bug Fixes - COMPLETED ✅

**Issues Fixed:**
1. **Admin Sidebar Navigation Broken** - Clicking Landing Pages/Consultations/User Journey only reloaded Dashboard
   - **Root Cause (Frontend):** AdminUserJourney.js referenced undefined variables `authLoading` and `isAuthenticated` without importing `useAdminAuth` hook
   - **Root Cause (Backend):** `landing_pages.py` and `consultation.py` had their own `verify_admin` functions that only accepted plain password, not session tokens
   - **Fix:** 
     - Frontend: Properly imported and used `useAdminAuth(navigate)` hook in AdminUserJourney.js and AdminLandingPages.js
     - Backend: Shared `admin_sessions` dict from server.py to landing_pages and consultation routes for proper session token validation

2. **User Journey White Screen** - Page rendered blank
   - **Root Cause:** Missing `useAdminAuth` hook import causing undefined variable errors in useEffect
   - **Fix:** Added proper hook import and usage

**Files Updated:**
- `/app/frontend/src/pages/admin/AdminUserJourney.js` - Added useAdminAuth hook
- `/app/frontend/src/pages/admin/AdminLandingPages.js` - Added useAdminAuth hook for consistency
- `/app/backend/routes/landing_pages.py` - Added set_admin_sessions() and session token validation
- `/app/backend/routes/consultation.py` - Added set_admin_sessions() and session token validation
- `/app/backend/server.py` - Added calls to share admin_sessions with sub-routes

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

### April 6, 2026 - Complete Landing Page Funnel Overhaul
**Landing Pages Now Match Main Website Design EXACTLY - DONE:**

1. **LandingHero.js** - Complete rewrite to match Homepage.js design:
   - Same announcement bar, flash sale countdown, urgency banners
   - Problem statement badge, dynamic headline, key benefits
   - Social proof (viewing now, sold today), location-based trust
   - TransformationShowcase component, DermatologistSection
   - Testimonials carousel, 4-in-1 serum section, FAQs
   - Sticky bottom CTA

2. **LandingProductPage.js** - Complete rewrite to match ProductPage.js design:
   - Flash sale countdown, live stats
   - Product image with 53% OFF badge
   - Rating stars, price section with savings
   - "Why #1" section, Clinical Results (94%, 89%, 96%)
   - Powerful Ingredients section, Trust badges
   - Product details accordion, Money back guarantee
   - Complete checkout flow with Prepaid/COD options

3. **URL Structure**: Changed from `/lp/{slug}` to `/{slug}` 
   - Landing hero: `/{slug}`
   - Product page: `/{slug}/product`
   - Order success: `/{slug}/order-success/{orderId}`

4. **Dynamic Product Names** - All include "Anti-Aging":
   - early_aging → "Celesta Glow Anti-Aging Youth Revival Serum"
   - wrinkles → "Celesta Glow Anti-Aging Wrinkle Repair Serum"
   - under_eye → "Celesta Glow Anti-Aging Eye Revitalizer Serum"
   - dry_skin → "Celesta Glow Anti-Aging Hydra-Glow Serum"
   - lifestyle → "Celesta Glow Anti-Aging Urban Shield Serum"
   - preventive → "Celesta Glow Anti-Aging Prevention Serum"
   - results → "Celesta Glow Anti-Aging Fast-Action Serum"
   - psychological → "Celesta Glow Anti-Aging Confidence Serum"

5. **Mobile-First Design**: Tested at 414x896 viewport

### April 6, 2026 - Problem-Specific Landing Pages Enhancement (Earlier)
**Dynamic Product Name Generation (P0) - DONE:**
1. **Backend Enhancement** (`/app/backend/services/landing_page_service.py`)
   - Added `_generate_dynamic_product_name()` method
   - Each category generates unique product names:
     - early_aging → "Celesta Glow Youth Revival Serum"
     - wrinkles → "Celesta Glow Anti-Wrinkle Serum"  
     - under_eye → "Celesta Glow Eye Revitalizer Serum"
     - dry_skin → "Celesta Glow Hydra-Glow Serum"
     - lifestyle → "Celesta Glow Urban Shield Serum"
     - preventive → "Celesta Glow Prevention Plus Serum"
     - results → "Celesta Glow Fast-Action Serum"
     - psychological → "Celesta Glow Confidence Boost Serum"
   - Each has unique tagline and description

2. **Model Update** (`/app/backend/models/landing_page.py`)
   - Added `product_name`, `product_tagline`, `product_description` fields to LandingPageContent

3. **Frontend Update** (`/app/frontend/src/pages/LandingPage.js`)
   - Now displays dynamic product name in purple badge
   - Shows dynamic tagline below product name
   - Solution section shows dynamic product description

**Admin Dashboard UI Enhancement (P1) - DONE:**
1. **Scrollable Sidebar**
   - Converted fixed sidebar to flexbox layout with overflow-y-auto
   - Settings and Sign Out fixed at bottom
   - All nav items accessible via scrolling

2. **Landing Pages in Quick Actions**
   - Added "Landing Pages" shortcut with pink styling
   - Placed after "AI Content Studio" in Quick Actions grid

3. **Sidebar Reorganization**
   - "Landing Pages" moved after "AI Studio" in sidebar
   - Proper visual separation from Settings section

### April 6, 2026 - P2 Code Cleanup Complete
**Component Extraction & Code Organization:**

1. **Product Components** (`/components/product/`)
   - `ProductHero.jsx` (267 lines) - Image gallery, info header, age score, benefits
   - `ProductSections.jsx` (304 lines) - Trust badges, FAQ accordion, endorsements
   - `CheckoutComponents.jsx` (354 lines) - Price display, payment selector, form fields
   - `index.js` - Centralized exports

2. **Admin Components** (`/components/admin/`)
   - `AIStudioComponents.jsx` (431 lines) - Auto/location/topic generation, cron status
   - `CommonComponents.js` - Shared admin UI elements
   - `index.js` - Centralized exports

3. **Consultation Components** (`/components/consultation/`)
   - `ConsultationComponents.jsx` (425 lines) - Landing, questions, upload, results
   - `index.js` - Centralized exports

**Total: 1,781 lines extracted into reusable components**
**Original files preserved for stability - gradual integration ready**

### April 6, 2026 - P0/P1 Security & Integration Fixes
**All P0 and P1 Tasks Completed:**

1. **React Hook Dependencies Fix (P0)** - DONE
   - Fixed `calculateFunnelData` useCallback missing dependency array in AdminUserJourney.js
   - All eslint checks pass

2. **WhatsApp Cloud API Integration (P1)** - DONE & VERIFIED
   - WhatsApp service already implemented at `/app/backend/services/whatsapp_service.py`
   - Credentials configured in backend/.env:
     - WHATSAPP_PHONE_NUMBER_ID=782109748323556
     - WHATSAPP_BUSINESS_ACCOUNT_ID=1109104574684503
     - WHATSAPP_API_TOKEN configured
   - Admin endpoints available:
     - POST /api/admin/whatsapp/send - Send custom message
     - POST /api/admin/whatsapp/send-bulk - Bulk messaging
     - POST /api/admin/whatsapp/notify-order - Order confirmation
     - POST /api/admin/whatsapp/notify-consultation - Consultation results
     - GET /api/admin/whatsapp/logs - Message logs
   - Admin WhatsApp page functional with stats, templates, and message sending

3. **Sensitive Data in localStorage (P1)** - DONE
   - Migrated all admin pages from localStorage to sessionStorage
   - Added httpOnly cookie support for session tokens
   - Created `/app/frontend/src/utils/adminAuth.js` utility
   - Session tokens generated using SHA-256 hashing
   - Tokens expire after 24 hours
   - Files updated:
     - AdminLogin.js, AdminDashboard.js, AdminUserJourney.js
     - AdminOrders.js, AdminBlogs.js, AdminAIStudio.js
     - AdminWhatsApp.js, AdminConsultations.js, AdminLocations.js
     - AdminLocationEditor.js, AdminBlogEditor.js

**Test Results:** 100% pass rate (15/15 backend tests, all frontend features working)
**All Critical Issues Resolved:**

1. **XSS Protection** - Verified DOMPurify sanitization in place:
   - customerNotifications.js ✅
   - AdminAIStudio.js ✅
   - BlogPost.js ✅

2. **Index Key Issues** - ALL FIXED (0 remaining)
   - All pages and components now use unique IDs

3. **React Performance** - LanguageContext.js optimized:
   - Added useMemo for context value
   - Added useCallback for changeLanguage and t functions
   - Prevents unnecessary re-renders

4. **Python Test Assertions** - Fixed comparison patterns:
   - Changed `== True` to `is True` in all test files

**Verification:** Homepage and Admin Dashboard both working correctly

### April 5, 2026 - Code Quality Improvements (Safe Fixes)
**Index Key Fixes - All Critical Pages Fixed:**
- AdminAIStudio.js: 7 instances fixed (blogs, history, news, topics)
- AdminUserJourney.js: 3 instances fixed (dropoff points, actions, visits)
- ConsultationPage.js: 8 instances fixed (badges, stars, photos, routines)
- LocationPage.js: 1 instance fixed

**Remaining (Non-Critical):**
- 9 index keys in reusable component files (ProductUIComponents, SharedComponents, etc.)

**Verification:** Admin dashboard, Consultation page tested and working correctly.

### April 5, 2026 - Critical Bug Fixes
**Admin Dashboard White Screen - FIXED:**
- Root cause: Broken key references from previous sed replacements (`item?.title` when `item` doesn't exist)
- Fixed AdminDashboard.js: `loc.location` for locations, `blog.slug` for blogs
- Fixed AdminConsultations.js: Proper key references for stats and photos
- Fixed AdminReferrals.js: `ref.referral_code` and `order.order_id`
- Fixed AdminWhatsApp.js: `log.id` for message logs

**WhatsApp Number - FIXED:**
- TrackOrder.js had wrong number `919876543210` → Changed to `919446125745`
- All WhatsApp links now use correct number

### April 4, 2026 - Additional Code Quality Fixes (Round 2)
**Critical Security Fixes:**
1. **Test Files Hardcoded Secrets** - All test files now use `os.environ.get("ADMIN_PASSWORD")`
2. **ai_skin_analyzer.py** - Replaced `random` module with `secrets` for secure randomization
3. **userTracking.js** - Wrapped 14 console.log statements in `isDev` conditional

**Index Key Fixes (20+ more):**
- Homepage.js: ingredients, steps, audience list, FAQs all use unique IDs
- TrackOrder.js: orders use `order_id`, scans use datetime-based keys

**Performance Improvements:**
- Console statements only execute in development mode
- Proper memoization of static data arrays with unique IDs

### April 4, 2026 - Performance & Code Quality Improvements
**Refactoring & Performance:**
1. **Created Reusable Product Components** (`/components/product/`):
   - `ProductHero.js` - Memoized hero section with price, rating, benefits
   - `IngredientsList.js` - Memoized ingredients display with unique keys
   - `TrustBadges.js` - Memoized trust badges and verified reviews
   - `ReviewsSection.js` - Memoized customer reviews
   - `FAQSection.js` - Memoized FAQ accordion with proper state management

2. **Created Admin Common Components** (`/components/admin/CommonComponents.js`):
   - `StatCard`, `StatsGrid` - Reusable dashboard stats
   - `LoadingSpinner`, `EmptyState` - Common UI patterns
   - `TabNav`, `DataTable` - Navigation and data display

3. **Fixed 50+ Index Key Issues** across:
   - `ProductPage.js` - All array maps now use unique IDs
   - `Homepage.js` - All lists use semantic keys
   - `AdminDashboard.js`, `AdminConsultations.js`, `AdminReferrals.js`, `AdminWhatsApp.js`

**Security Fixes Applied:**
- Hardcoded secrets → Environment variables
- MD5 → SHA-256 for hashing
- `random` → `secrets` module
- XSS protection via DOMPurify
- Empty catch blocks → Dev-mode logging

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

### P2 (Medium Priority)
- Split oversized components (ProductPage.js 1494 lines, ConsultationPage.js 1237 lines, AdminAIStudio.js 1310 lines)
- Customer video testimonials collection system

### P3 (Low Priority)
- Customer referral program enhancements

## 3rd Party Integrations
- **OpenAI GPT-4o** - Emergent LLM Key
- **Razorpay** - Live payments configured
- **Meta Pixel** - ID: 690863659974240
- **Google Analytics** - ID: G-LSJCVKB8BP
- **WhatsApp Cloud API** - INTEGRATED & WORKING
  - Phone Number ID: 782109748323556
  - Business Account ID: 1109104574684503
- **Delhivery** - Shipping integration with auto-shipment creation

## Credentials
- Admin Password: `celestaglow2024`
- Production URL: https://celestaglow.com
- Preview URL: https://serum-ecommerce-ai.preview.emergentagent.com
