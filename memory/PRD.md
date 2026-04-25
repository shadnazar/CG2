# Celesta Glow - Product Requirements Document

## Original Problem Statement
Multi-product anti-aging e-commerce platform with 5 products, combo bundles, cart/checkout, admin product management, customer retention, pre-sale campaigns, and complete admin customization.

## Product Catalog
| Product | MRP | Prepaid | COD |
|---------|-----|---------|-----|
| Anti-Aging Serum | ₹1,699 | ₹999 | ₹1,099 |
| Anti-Aging Night Cream | ₹1,499 | ₹899 | ₹999 |
| Under Eye Cream | ₹899 | ₹549 | ₹649 |
| SPF 50 Sunscreen | ₹799 | ₹499 | ₹599 |
| Gentle Cleanser | ₹799 | ₹499 | ₹599 |
| Complete Kit (5-in-1) | ₹5,695 | ₹2,799 | ₹3,099 |

## Implemented Features

### April 25, 2026 — Session 3: Polish + Retention + Admin
- Brand message bar before timer (FREE SHIPPING | COD | 30-Day Guarantee)
- Timer design cleaned up (single row, no double layer)
- Removed unwanted hyphens from title text (non-breaking hyphens)
- Bundle kit shows single hero image (admin updatable) + product list text
- Customer Retention panel: 15-day/30-day follow-up, call/WhatsApp, notes (interested/not interested/reorder/callback)
- Before/After image management API (CRUD per product)
- Pre-sale campaign mode with configurable price in admin
- Bundle hero image field in site settings
- Landing page prices updated (₹699→₹999, MRP ₹1499→₹1699)
- Consultation recommendation updated to Complete Kit
- ConsultationComponents updated to recommend Complete Kit

### April 25, 2026 — Session 2: Legacy Migration (30+ files)
- ALL single-product references updated across Navigation, Footer, Notifications, Blogs, About, Consultation, OrderSuccess, SEO, emails, shipping, AI prompts

### April 25, 2026 — Session 1: Multi-Product Foundation
- Backend: products, combos, coupons, cart validation, site settings
- Frontend: Homepage, ProductDetailPage, ShopPage, CartPage, CheckoutPage, AdminProducts
- 5 products with 4 images each, 3 combo bundles

### Previous Sessions (preserved)
- Employee portal, referral system, blog AI, WhatsApp, analytics, tracking

## Admin Customization Points
- Products: name, price (MRP/prepaid/COD/advance), images, badge, description, visibility
- Combos: name, price, products, badge
- Coupons: code, discount type/value, min order, max uses, expiry
- Site Settings: hero title/subtitle, hero banner image, bundle hero image, COD advance amount, pre-sale toggle/title/badge/price
- Before/After: upload image pairs per product
- Retention: 15/30-day follow-up with notes

## Pending Tasks
### P1
- Real product photos (admin can upload via Products > Edit > Images)
- metaPixel.js and TrackingProvider.js — make dynamic per product
- Old ProductPage.js cleanup (dead code, 1615 lines)

### P2
- Admin homepage section ordering/visibility
- Admin customer review management
- Admin notification settings
- Desktop 2-column hero with product showcase

### P3
- WhatsApp automated triggers
- Customer video testimonials
- server.py modular refactoring

## Credentials
- Admin: celestaglow2024
- Employees: orderteam/VclhxCbJ, testadmin/TestPass123
