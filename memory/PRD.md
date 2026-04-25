# Celesta Glow - PRD

## Product Catalog
| Product | MRP | Prepaid | COD | Sort |
|---------|-----|---------|-----|------|
| Gentle Cleanser | ₹799 | ₹499 | ₹599 | 1 |
| Anti-Aging Serum | ₹1,699 | ₹999 | ₹1,099 | 2 |
| Anti-Aging Night Cream | ₹1,499 | ₹899 | ₹999 | 3 |
| Under Eye Cream | ₹899 | ₹549 | ₹649 | 4 |
| SPF 50 Sunscreen | ₹799 | ₹499 | ₹599 | 5 |
| Complete Kit (5-in-1) | ₹5,695 | ₹2,799 | ₹3,099 | - |

## Implemented (April 25, 2026)

### Session 4: UI Polish + Cart + Tracking + Admin
- Removed timer from homepage (only brand bar)
- Product order: Cleanser → Serum → Night Cream → Under Eye → Sunscreen
- ShopPage: Bundle first with single hero image, then products, then combos
- CartPage: Product images, bundle push, "Add More Products" with images, trust badges, payment, coupon
- CheckoutPage: Trust strip bar, savings highlight, delivery timeline
- MetaPixel.js: ALL functions now accept dynamic product data (name, IDs, price)
- TrackingProvider.js: Dynamic content_ids
- Landing pages: Prices updated (₹699→₹999, MRP ₹1499→₹1699)
- ConsultationPage: Recommends Complete Kit (not just serum)
- Admin Retention panel: 15/30-day follow-up, call/WhatsApp, notes
- Before/After image management API
- Pre-sale campaign with price field
- Bundle hero image in site settings
- All remaining legacy "serum" references cleaned

### Previous Sessions
- Multi-product foundation (5 products, 3 combos, cart, checkout)
- Legacy migration (30+ files)
- Employee portal, referral, blog AI, WhatsApp, analytics

## Admin Customization
- Products: name, price, images, badge, description, visibility, sort order
- Combos: price, products, badge
- Coupons: create/validate/delete
- Site Settings: hero text, bundle hero image, COD advance, pre-sale toggle/price
- Before/After: image pairs per product
- Retention: 15/30-day follow-up

## Pending
### P1
- Upload real product photos (admin can via Products > Edit)
- Upload bundle hero image (admin via Site Settings)

### P2
- Admin review management
- Homepage section visibility toggles
- Old ProductPage.js cleanup
- Desktop-optimized 2-column layouts

### P3
- WhatsApp triggers, video testimonials, server.py refactoring

## Credentials
- Admin: celestaglow2024
- Employees: orderteam/VclhxCbJ, testadmin/TestPass123
