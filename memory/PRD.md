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
