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

## What's Been Implemented

### March 31, 2026
- **Notification System Overhaul**
  - Moved notifications to top-right (away from buy buttons)
  - Max 5 notifications per 3-minute session
  - First notification after 45 seconds, then every 60 seconds
  - Soft Instagram/Messenger DM-like sound
  - Removed duplicate notification system

- **User Journey Analytics**
  - Pagination: 50 users per page, supports 1000+ total
  - "First Seen" date visible in visitor list
  - Day-wise filtering working correctly

- **UI Polish**
  - Removed unnecessary hyphens ("Anti Aging", "30 Day Money Back")
  - Added FREE shipping/tax breakdown in checkout
  - Broadcast notifications working (admin can send site-wide alerts)

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
│   ├── models/
│   ├── routes/
│   ├── services/
│   │   ├── ai_content_generator.py
│   │   ├── auto_blog_generator.py
│   │   ├── user_behavior_tracker.py
│   ├── cron_runner.py (Background - 2hr cycle)
│   └── server.py
└── frontend/
    ├── public/sw.js (Service Worker)
    └── src/
        ├── components/
        │   ├── RecentPurchaseNotification.js (Social proof - rate limited)
        │   ├── DiscountPopup.js
        ├── pages/
        │   ├── admin/
        │   ├── Homepage.js
        │   ├── ProductPage.js
        │   ├── OrderSuccessPage.js
        └── utils/
            ├── customerNotifications.js (Admin broadcasts only)
            ├── metaPixel.js
            ├── userTracking.js
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
- **OpenAI GPT-4o** - Emergent LLM Key (blog generation)
- **Razorpay** - Live payments configured
- **Meta Pixel** - ID: 690863659974240
- **Google Analytics** - ID: G-LSJCVKB8BP
- **WhatsApp Cloud API** - Credentials ready, integration pending

## Credentials
- Admin Password: `celestaglow2024`
- Production URL: https://celestaglow.com
- Preview URL: https://serum-ecommerce-ai.preview.emergentagent.com

## Important Notes
- Background cron (`cron_runner.py`) runs continuously - don't spawn duplicates
- User sees Production site, agent works on Preview - remind to DEPLOY
