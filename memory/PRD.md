# Celesta Glow PRD

## Latest: April 25, 2026

### Sizing & Badge Fixes
- All text/badges resized to medium (not too small, not too big)
- Product cards: name text-sm, price text-lg, badge text-[10px], coupon text-[10px]
- "X sold today" + "X left" badges medium size with proper contrast
- Orange coupon theme (not green) — differentiated from brand color

### Auto Monthly Coupons
- Backend auto-generates 3 monthly coupons on startup: MONTH_CODE (₹25), MONTH_GLOW (₹30), NEXT_EARLY (₹20)
- WELCOME50 auto-created if not exists
- Admin can also manually create coupons

### Active Coupons
- WELCOME50: ₹50 off (min ₹499) — permanent new user
- FEB25: ₹25 off — auto monthly
- FEBGLOW: ₹30 off — auto monthly
- MAREARLY: ₹20 off — auto monthly
- GLOW10: 10% off (min ₹999) — manual
- NEWUSER: ₹100 off (min ₹1499) — manual

### Checkout
- COD ₹0 advance, "Save more with Prepaid" nudge
- Tappable volume discount tiers
- Taxes: ₹0 (Included), Shipping: FREE
- Total savings gradient banner

## Credentials
- Admin: celestaglow2024
- Employees: orderteam/VclhxCbJ, testadmin/TestPass123

## Pending
- Upload real product photos
- Delete old ProductPage.js
