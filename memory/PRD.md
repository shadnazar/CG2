# Celesta Glow - Product Requirements Document

## Original Problem Statement
Build a comprehensive multi-product e-commerce platform for anti-aging products ("Celesta Glow") with:
- 5 products: Anti-Aging Serum, Anti-Aging Night Cream, Under Eye Cream, SPF 50 Sunscreen, Gentle Cleanser
- Combo bundles for multi-product deals
- Cart & checkout system with COD + Prepaid support
- Admin panel with product management, analytics, order management
- AI-powered SEO blog generation
- User behavior tracking and analytics
- Meta Pixel, Google Ads tracking with AddToCart, ViewContent, Purchase events
- Employee portal with role-based access
- Customer retention system, coupon codes, pre-sale mode

## Product Catalog (MRP Prices)
| Product | MRP | Prepaid | COD | Badge |
|---------|-----|---------|-----|-------|
| Anti-Aging Serum | ₹1,699 | ₹999 | ₹1,099 | Bestseller |
| Anti-Aging Night Cream | ₹1,499 | ₹899 | ₹999 | New Launch |
| Under Eye Cream | ₹899 | ₹549 | ₹649 | New Launch |
| SPF 50 Sunscreen | ₹799 | ₹499 | ₹599 | Daily Essential |
| Gentle Cleanser | ₹799 | ₹499 | ₹599 | Daily Essential |

## Combo Bundles
1. Complete Anti-Aging Kit (all 5) — ₹2,799 prepaid (51% OFF)
2. Day & Night Power Duo — ₹1,199 prepaid (48% OFF)
3. Glow Essentials Trio — ₹1,699 prepaid (48% OFF)

## What's Been Implemented

### April 25, 2026 — Multi-Product Transformation (Phase 1+2)
**Backend:**
- `products` collection with full CRUD (POST/PUT/DELETE /api/admin/products)
- `combos` collection with CRUD (POST/PUT/DELETE /api/admin/combos)
- `coupons` collection with create/validate/delete
- Cart validation endpoint (POST /api/cart/validate)
- Site settings (hero title, COD advance, pre-sale toggle)
- Product seed on startup (5 products, 3 combos)
- Updated order model to support multi-product items

**Frontend:**
- Homepage redesigned for multi-product (hero, 5 products grid, combo deals, trust section)
- ProductDetailPage (dynamic /product/:slug with image gallery, pricing, benefits, accordion)
- ShopPage (/shop with all products + combos)
- CartPage (/cart with items, payment method, coupons, upselling, order summary)
- CheckoutPage (/checkout with address form, Razorpay integration)
- Admin Product Management (/admin/products with tabs: Products, Combos, Coupons, Site Settings)

**Tracking:**
- Meta Pixel: AddToCart fires on product add, ViewContent on product page, Purchase on order success
- Google Ads: Conversion tracking on purchase
- Backend: order_complete action tracked to visitor_profiles

### April 13, 2026 — Employee Portal + Purchase Tracking Fix
- Fixed Employee pages (Blogs, Analytics, Landing Pages, Consultations)
- Added back buttons to all employee pages
- Fixed EmployeeAnalytics using wrong API endpoint
- Fixed backend crash (employee_sessions declaration order)
- Fixed missing purchase conversion tracking in OrderSuccessPage
- Added Google Ads conversion to OrderSuccessPage and LandingOrderSuccess
- All 13 tests PASSED

### Previous Sessions
- Employee Management System, Customer Section, COD ₹29 pricing
- SEO Trust Pages (About, Contact, Refund Policy, Shipping Policy)
- Admin fixes, User Journey analytics, referral system
- Landing page funnels, blog system, WhatsApp integration

## Current Pricing
- COD Advance: ₹29 (configurable from admin)
- Prepaid gets "Faster Delivery (1-2 days)" messaging
- Free shipping on all orders

## Architecture
```
/app
├── backend/
│   ├── routes/
│   │   ├── products.py (Product/Combo/Coupon CRUD + Cart validation)
│   │   ├── landing_pages.py, consultation.py, admin.py
│   ├── services/
│   ├── server.py
└── frontend/
    └── src/
        ├── pages/
        │   ├── Homepage.js (multi-product)
        │   ├── ProductDetailPage.js (dynamic)
        │   ├── ShopPage.js, CartPage.js, CheckoutPage.js
        │   ├── admin/AdminProducts.js
        │   ├── admin/ (Dashboard, Orders, Blogs, etc.)
        │   ├── employee/ (Dashboard, Login, Orders, etc.)
```

## Pending/Future Tasks

### P2 (Medium)
- Customer retention panel (15-day/30-day follow-up with reorder)
- Pre-sale campaign mode (full site transformation)
- Admin image upload for products (currently URL-based)
- Before/after result images management

### P3 (Low)
- WhatsApp Cloud API automated triggers (paused)
- Customer referral program enhancements
- Refactor server.py into modular routers
- Customer video testimonials

## 3rd Party Integrations
- OpenAI GPT-4o — Emergent LLM Key
- Razorpay — Live payments
- Meta Pixel — ID: 690863659974240
- Google Ads — AW-16928253164
- WhatsApp Cloud API — Integrated
- Delhivery — Shipping

## Credentials
- Admin Password: `celestaglow2024`
- Employee: orderteam/VclhxCbJ, testadmin/TestPass123
