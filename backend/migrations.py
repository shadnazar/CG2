"""
Idempotent migrations that run on startup.
- Sets TBL (To Be Launched) status on products
- Adds sample product images
- Initializes banner_carousel in site_settings
- Auto-flips TBL products whose launch_date has passed
"""
import logging
from datetime import datetime, timezone, timedelta

# Default sample images sourced from the vision expert (Pexels/Unsplash CDN — public)
PRODUCT_IMAGE_MAP = {
    "anti-aging-serum": [
        "https://images.unsplash.com/photo-1575257950302-bf479291b409?auto=format&fit=crop&w=1000&q=80",
    ],
    "anti-aging-cream": [
        "https://images.pexels.com/photos/10221858/pexels-photo-10221858.jpeg?auto=compress&cs=tinysrgb&w=1000",
    ],
    "under-eye-cream": [
        "https://images.unsplash.com/photo-1654967102743-53295f5a7142?auto=format&fit=crop&w=1000&q=80",
    ],
    "sunscreen": [
        "https://images.pexels.com/photos/11753640/pexels-photo-11753640.jpeg?auto=compress&cs=tinysrgb&w=1000",
    ],
    "cleanser": [
        "https://images.unsplash.com/photo-1612705166160-97d3b2e8e212?auto=format&fit=crop&w=1000&q=80",
    ],
}

DEFAULT_BANNERS = [
    {
        "id": "banner-1",
        "image": "https://images.unsplash.com/photo-1581182815808-b6eb627a8798?auto=format&fit=crop&w=1920&q=80",
        "title": "Clinically Proven Anti-Aging",
        "subtitle": "Visible results in 4 weeks",
        "cta_text": "Shop Now",
        "cta_link": "/shop",
        "sort_order": 1,
    },
    {
        "id": "banner-2",
        "image": "https://images.pexels.com/photos/3762871/pexels-photo-3762871.jpeg?auto=compress&cs=tinysrgb&w=1920",
        "title": "Glow That Speaks",
        "subtitle": "Dermatologist tested · Cruelty free",
        "cta_text": "Explore Range",
        "cta_link": "/shop",
        "sort_order": 2,
    },
    {
        "id": "banner-3",
        "image": "https://images.pexels.com/photos/5468629/pexels-photo-5468629.jpeg?auto=compress&cs=tinysrgb&w=1920",
        "title": "Free Skin Analysis",
        "subtitle": "Personalized routine in 60 seconds",
        "cta_text": "Get Started",
        "cta_link": "/consultation",
        "sort_order": 3,
    },
]

# Only the anti-aging serum stays live; everything else is TBL with a 25-day countdown
LIVE_PRODUCT_SLUGS = {"anti-aging-serum"}


async def migrate_products_tbl_and_images(db):
    """Set TBL status, launch dates, sample images on products. Idempotent — only adds missing data."""
    now = datetime.now(timezone.utc)
    default_launch = (now + timedelta(days=25)).isoformat()

    products = await db.products.find({}, {"_id": 0}).to_list(200)
    updated = 0
    for p in products:
        slug = p.get("slug")
        update = {}

        # TBL fields — only set if missing (idempotent)
        if "is_to_be_launched" not in p:
            update["is_to_be_launched"] = slug not in LIVE_PRODUCT_SLUGS
        if "launch_date" not in p:
            update["launch_date"] = None if slug in LIVE_PRODUCT_SLUGS else default_launch
        if "preorder_enabled" not in p:
            # Default: preorder enabled for all TBL products
            update["preorder_enabled"] = slug not in LIVE_PRODUCT_SLUGS
        if "preorder_count" not in p:
            update["preorder_count"] = 0

        # Sample images — only set if currently empty
        if not p.get("images") and slug in PRODUCT_IMAGE_MAP:
            update["images"] = PRODUCT_IMAGE_MAP[slug]

        # Auto-flip TBL → launched if launch_date passed
        existing_launched = p.get("is_to_be_launched")
        existing_date = p.get("launch_date")
        if existing_launched and existing_date:
            try:
                ld = datetime.fromisoformat(existing_date.replace("Z", "+00:00"))
                if ld <= now:
                    update["is_to_be_launched"] = False
                    update["launch_date"] = None
            except Exception:
                pass

        if update:
            update["updated_at"] = now.isoformat()
            await db.products.update_one({"slug": slug}, {"$set": update})
            updated += 1

    if updated:
        logging.info(f"[migration] TBL/images updated for {updated} products")
    return updated


async def migrate_banner_carousel(db):
    """Ensure site_settings has a banner_carousel array. Idempotent."""
    settings = await db.site_settings.find_one({"_id": "main"}, {"_id": 0})
    if settings and isinstance(settings.get("banner_carousel"), list) and len(settings["banner_carousel"]) > 0:
        return 0  # Already set up

    await db.site_settings.update_one(
        {"_id": "main"},
        {"$set": {
            "banner_carousel": DEFAULT_BANNERS,
            "carousel_autoplay_ms": 2000,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }},
        upsert=True
    )
    logging.info(f"[migration] Initialized banner_carousel with {len(DEFAULT_BANNERS)} banners")
    return len(DEFAULT_BANNERS)


async def auto_flip_launched_products(db):
    """On every read-heavy startup, flip TBL → launched for any product whose launch_date passed."""
    now = datetime.now(timezone.utc)
    cursor = db.products.find(
        {"is_to_be_launched": True, "launch_date": {"$ne": None, "$exists": True}},
        {"_id": 0, "slug": 1, "launch_date": 1}
    )
    flipped = 0
    async for p in cursor:
        try:
            ld = datetime.fromisoformat(str(p.get("launch_date", "")).replace("Z", "+00:00"))
            if ld <= now:
                await db.products.update_one(
                    {"slug": p["slug"]},
                    {"$set": {
                        "is_to_be_launched": False,
                        "launch_date": None,
                        "updated_at": now.isoformat()
                    }}
                )
                flipped += 1
        except Exception:
            continue
    if flipped:
        logging.info(f"[migration] Auto-flipped {flipped} TBL products to launched")
    return flipped


async def run_all_migrations(db):
    """Run all migrations on startup. Safe to run repeatedly."""
    try:
        await migrate_products_tbl_and_images(db)
        await migrate_banner_carousel(db)
        await auto_flip_launched_products(db)
        logging.info("[migration] All migrations completed successfully")
    except Exception as e:
        logging.error(f"[migration] Failed: {e}", exc_info=True)
