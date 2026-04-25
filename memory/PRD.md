# Celesta Glow - Product Requirements Document

## Original Problem Statement
Build a comprehensive multi-product e-commerce platform for anti-aging products ("Celesta Glow") with:
- 5 products: Anti-Aging Serum, Anti-Aging Night Cream, Under Eye Cream, SPF 50 Sunscreen, Gentle Cleanser
- Combo bundles, cart system, checkout with COD + Prepaid
- Admin panel with full product management, analytics, orders
- AI blog generation, employee portal, customer retention
- Meta Pixel, Google Ads tracking with per-product events

## Product Catalog
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

### April 25, 2026 — Multi-Product Transformation + Legacy Migration

**Phase 1: Backend Foundation**
- `products` collection with CRUD + 5 seeded products with real ingredient data
- `combos` collection with 3 seeded bundles
- `coupons` collection with create/validate/delete
- Cart validation endpoint, site settings, order model updated for multi-product

**Phase 2: Frontend New Pages**
- Homepage redesigned: flash sale timer, Complete Kit bundle (top), 5-product grid, combo deals, 3-step routine, clinical results, dermatologist section, FAQ
- ProductDetailPage: 4-image carousel, pricing, benefits, accordion, dermatologist reviews, customer reviews, before/after section, Complete Kit push, related products with Add to Cart, sticky mobile CTA, FAQ
- ShopPage: all products + combo bundles
- CartPage: items, payment method, coupons, upsell products, bundle push, trust badges
- CheckoutPage: address form, trust elements, savings highlight, delivery timeline
- AdminProducts: Products/Combos/Coupons/Site Settings tabs with full CRUD

**Phase 3: Legacy Migration (30+ files updated)**
- Navigation: Cart icon → /cart with count badge, Shop → /shop
- Footer: description updated to multi-product
- RecentPurchaseNotification: rotates all 5 products + combos
- WhatsAppButton: message updated to "anti-aging products"
- BlogList, BlogPost, LocationPage: CTAs → /shop, prices → "From ₹499"
- AboutPage: updated description to 5-product system
- ConsultationPage: recommendation → /shop
- OrderSuccessPage: shows actual order items, dynamic pixel data
- index.html: SEO meta tags updated (title, description, OG, Twitter)
- Backend emails: product references updated
- Delhivery: shipment description updated
- AI blog prompts: updated to reference complete range
- AdminLocationEditor: description updated
- Product images: 4 per product set via API

**Previous Sessions (preserved):**
- Employee portal with role-based access
- Purchase conversion tracking (Meta + Google Ads + backend)
- SEO trust pages (About, Contact, Refund, Shipping)
- Referral system, WhatsApp integration, AI blog generation

## Pending/Future Tasks

### P1 (High)
- Customer retention panel (15-day/30-day follow-up, reorder from admin)
- Pre-sale campaign mode (admin toggle transforms site pricing)
- Admin before/after image management per product
- Admin homepage section customization

### P2 (Medium)
- Real product images (user to upload their own via admin)
- Landing page funnels update for multi-product (LandingHero.js, LandingProductPage.js still have ₹699)
- metaPixel.js utility — make functions accept dynamic product data
- TrackingProvider.js — dynamic content_ids
- Old ProductPage.js cleanup (1615 lines, no longer routed but still in bundle)

### P3 (Low)
- Customer video testimonials
- Refactor server.py into modular routers
- WhatsApp automated triggers

## Architecture
```
/app
├── backend/
│   ├── routes/products.py (Product/Combo/Coupon CRUD + Cart)
│   ├── routes/ (landing_pages, consultation, admin, i18n)
│   ├── services/
│   └── server.py
└── frontend/src/
    ├── pages/Homepage.js (multi-product)
    ├── pages/ProductDetailPage.js (dynamic with reviews, FAQ)
    ├── pages/ShopPage.js, CartPage.js, CheckoutPage.js
    ├── pages/admin/AdminProducts.js
    ├── components/Navigation.js (cart badge)
    └── components/DermatologistSection.js
```

## Credentials
- Admin: `celestaglow2024`
- Employees: orderteam/VclhxCbJ, testadmin/TestPass123
