# Celesta Glow PRD

## Latest Update: April 26, 2026

### Premium Combo Deal Redesign + Cart Sound + Shop Polish (Apr 26)
- **Complete Anti-Aging Kit** redesigned with luxurious dark gradient card on both Homepage and Shop page:
  - Dark layered backdrop (emerald-900 + amber radial accents)
  - "BEST SELLER · LIMITED STOCK" pulsing status bar
  - Save badge + −% OFF chip overlays
  - "WHAT'S INSIDE" eyebrow with product mini-tiles
  - Big bold price + "₹/day for 60 days" framing
  - Gold "ADD COMPLETE KIT" CTA with shadow + arrow animation
  - Trust footer (Free shipping · 30-day return · COD)
- **Shop Page** fully redesigned:
  - Polished hero: "CURATED COLLECTION" eyebrow, italic accent on brand name, top-right trust mini-icons
  - Filter chips: All / Bestsellers / New Launch / Coming Soon (pill toggles)
  - Improved product card grid (5-col xl, 4-col lg, hover-lift)
  - More Combo Deals section: image-first cards with badges + savings highlight
  - Stable per-product social-proof counts (`useMemo`, no jumping on filter change)
- **Cart Sound** added globally (`/utils/cartSound.js`):
  - 2-tone chime (G5 → C6) via Web Audio API — no audio asset bundled
  - Plays on every `addToCart()` and `addComboToCart()` call (products, combos, preorders)
  - Plays from Homepage, ShopPage, ProductDetailPage, CheckoutPage tier upgrades
  - Auto-resumes suspended AudioContext (browser autoplay policy)
  - User-toggleable via `localStorage.cg_sound_enabled`

### Header & Layout Cleanup (Apr 26)
- **Desktop logo** now single-line: `CELESTA` (black) + `GLOW` (emerald-700)
- **Hero Carousel** banners: removed all overlay text/CTA — image-only, full slide is clickable Link to /shop
- **Homepage feature image** (right side, lg+): removed "Complete Skin Renewal System" / "Discover the Range" overlay; image now in clean rounded card with shadow + ring
- **Footer** address layout reverted: address sits under "Sold & Marketed By:" heading
- Fixed global `:where(h1-h6)` rule — no longer hard-codes dark color, lets utility classes win on dark backgrounds

### Earlier in this build cycle
- Tablet/Desktop responsive overhaul (removed mobile-locked `max-w-md`)
- Multi-banner Hero Carousel + Admin manager
- Complete TBL (To Be Launched) / Preorder system (products + combos), launch date May 21 2026
- Homepage loading optimization (preconnects, fetchpriority, shimmer skeleton)
- Expanded detailed Homepage FAQs (12 entries, 400-700 chars each)
- Admin tablet login fix (no iOS zoom)

### Cart / Checkout
- Cart Coupon — No reload (3 coupons + manual entry, instant Apply)
- Checkout Quantity Tiers — No reload (2/3/4+ items API update)
- Auto Monthly Coupons (3/month + WELCOME50 always live)

### Text Hierarchy
- Product name: text-base, Price: text-xl, Badges/ratings: text-xs, Buttons: text-sm

## Pending / Backlog

### P1
- Apply detailed FAQ pattern to Shop, Product Detail, About, Skin Analysis pages (extract `FAQSection.js`)
- End-to-end flow verification: cart coupon, COD ₹50, pincode autodetect, email validation
- Order Success page Meta Pixel + Google Ads conversion ID wiring (need actual IDs from user)
- Multi-product email confirmation template (currently single-product legacy)
- Polish About page, Blog page, Skin Analysis flow

### P2 — Admin Image Manager rollout
- Before/After image uploads in admin
- Blog featured image upload
- Landing page image upload
- Real product photos

### P3 — Growth Features
- Customer referral program (₹50 / referral)
- Wishlist functionality
- Stock-out / Waitlist signup
- Customer video testimonials (record/upload from PDP)
- Subscribe & Save (monthly auto-reorder + extra discount)

## Credentials
- Admin: password `celestaglow2024` at `/admin`
- Employees: `orderteam`/`VclhxCbJ`, `testadmin`/`TestPass123` at `/employee/login`

## Architecture
- React (frontend) + FastAPI (backend) + MongoDB
- Cart utilities centralized in `/pages/Homepage.js` exports
- Cart sound utility in `/utils/cartSound.js`
- Premium Combo Deal layout shared between Homepage and ShopPage (consider extracting `<CompleteKitCard />` later)
