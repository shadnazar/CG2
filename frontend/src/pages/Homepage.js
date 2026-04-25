import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Star, ChevronRight, Shield, Truck, Award, Clock, Sparkles, ChevronDown, Zap, Check, Users, FlaskConical, Timer, Package, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useTracking } from '../providers/TrackingProvider';
import DermatologistSection from '../components/DermatologistSection';

const API = process.env.REACT_APP_BACKEND_URL;

// Cart utilities
const getCart = () => JSON.parse(sessionStorage.getItem('cart') || '{"items":[]}');
const saveCart = (cart) => { sessionStorage.setItem('cart', JSON.stringify(cart)); window.dispatchEvent(new Event('cartUpdated')); };
const addToCart = (slug, quantity = 1) => {
  const cart = getCart();
  const existing = cart.items.find(i => i.product_slug === slug);
  if (existing) existing.quantity += quantity;
  else cart.items.push({ product_slug: slug, quantity });
  saveCart(cart);
};
export { getCart, saveCart, addToCart };

// Countdown Timer
function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const endTime = sessionStorage.getItem('saleEnd') || (() => {
      const end = Date.now() + 4 * 60 * 60 * 1000;
      sessionStorage.setItem('saleEnd', end);
      return end;
    })();
    const tick = () => {
      const diff = Math.max(0, Number(endTime) - Date.now());
      setTimeLeft({ hours: Math.floor(diff / 3600000), minutes: Math.floor((diff % 3600000) / 60000), seconds: Math.floor((diff % 60000) / 1000) });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);
  const pad = n => String(n).padStart(2, '0');
  return (
    <div className="flex items-center gap-1.5">
      <div className="bg-white/20 px-2 py-0.5 rounded text-sm font-bold">{pad(timeLeft.hours)}</div>:
      <div className="bg-white/20 px-2 py-0.5 rounded text-sm font-bold">{pad(timeLeft.minutes)}</div>:
      <div className="bg-white/20 px-2 py-0.5 rounded text-sm font-bold">{pad(timeLeft.seconds)}</div>
    </div>
  );
}

function Homepage() {
  const navigate = useNavigate();
  const { trackAction } = useTracking();
  const [products, setProducts] = useState([]);
  const [combos, setCombos] = useState([]);
  const [settings, setSettings] = useState({});
  const [cartCount, setCartCount] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, comboRes, settRes] = await Promise.all([
          axios.get(`${API}/api/products`),
          axios.get(`${API}/api/combos`),
          axios.get(`${API}/api/site-settings`)
        ]);
        setProducts(prodRes.data);
        setCombos(comboRes.data);
        setSettings(settRes.data);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const updateCount = () => setCartCount(getCart().items.reduce((sum, i) => sum + (i.quantity || 1), 0));
    updateCount();
    window.addEventListener('cartUpdated', updateCount);
    return () => window.removeEventListener('cartUpdated', updateCount);
  }, []);

  const handleAddToCart = (slug) => {
    addToCart(slug);
    trackAction('add_to_cart', { product_slug: slug });
    if (typeof window !== 'undefined' && window.fbq) {
      const p = products.find(pr => pr.slug === slug);
      window.fbq('track', 'AddToCart', { content_name: p?.name, content_ids: [slug], content_type: 'product', value: p?.prepaid_price, currency: 'INR' });
    }
  };

  const handleAddCombo = (comboId) => {
    const cart = getCart();
    const existing = cart.items.find(i => i.combo_id === comboId);
    if (existing) existing.quantity += 1;
    else cart.items.push({ combo_id: comboId, quantity: 1 });
    saveCart(cart);
    trackAction('add_combo_to_cart', { combo_id: comboId });
  };

  const completeKit = combos.find(c => c.combo_id === 'complete-anti-aging-kit');
  const otherCombos = combos.filter(c => c.combo_id !== 'complete-anti-aging-kit');

  const faqs = [
    { q: "What makes Celesta Glow different from other anti-aging brands?", a: "Celesta Glow is India's first complete anti-aging system with 5 products working together. Each product is clinically formulated with active ingredients like Retinoid, Niacinamide, Caffeine, and Alpha Arbutin — targeting aging from every angle." },
    { q: "Is it suitable for all skin types?", a: "Yes! All our products are dermatologist-tested and formulated for all Indian skin types — oily, dry, combination, and sensitive. We use pH-balanced, non-comedogenic formulas." },
    { q: "How long before I see results?", a: "Most customers see visible improvement in 2-4 weeks with daily use. For best results, we recommend using the Complete Anti-Aging Kit for the full routine." },
    { q: "Can I use these products together?", a: "Absolutely — they're designed to work as a system! Morning: Cleanser → Serum → Sunscreen. Night: Cleanser → Night Cream → Under Eye Cream." },
    { q: "What is your return policy?", a: "We offer a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund — no questions asked." },
    { q: "Is Cash on Delivery available?", a: "Yes! COD is available with a small ₹29 advance. Prepaid orders get faster delivery (1-2 days) and better pricing." },
  ];

  return (
    <div className="min-h-screen bg-white" data-testid="homepage">
      {/* Brand Message Bar */}
      <div className="bg-emerald-800 text-white text-center py-1.5 px-4">
        <p className="text-[11px] sm:text-xs tracking-wide">FREE SHIPPING All India | COD Available | 30 Day Money Back Guarantee | Trusted by 50,000+</p>
      </div>

      {/* Floating Cart */}
      {cartCount > 0 && (
        <Link to="/cart" className="fixed bottom-4 right-4 z-50 bg-emerald-600 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 hover:bg-emerald-700 transition-all" data-testid="floating-cart-btn">
          <ShoppingCart size={20} /><span className="font-bold">{cartCount}</span><span className="text-sm">View Cart</span>
        </Link>
      )}

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-stone-50 via-white to-emerald-50 overflow-hidden" data-testid="hero-section">
        <div className="max-w-7xl mx-auto px-4 py-10 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-1.5 rounded-full text-sm font-medium mb-5">
                <Sparkles size={14} /> India's #1 Anti-Aging Brand
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4" style={{hyphens: 'none', wordBreak: 'keep-all', overflowWrap: 'normal'}}>
                {settings.hero_title || "India's #1 Complete Anti\u2011Aging Solution"}
              </h1>
              <p className="text-base text-gray-600 mb-6 max-w-lg mx-auto lg:mx-0" style={{hyphens: 'none'}}>
                {settings.hero_subtitle || "5 clinically formulated products designed exclusively to fight aging. Cleanse, treat, hydrate, protect and brighten."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link to="/shop" className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-7 py-3 rounded-full text-base font-semibold transition-all shadow-lg shadow-emerald-200" data-testid="shop-now-btn">
                  Shop All Products <ChevronRight size={18} />
                </Link>
                <Link to="/consultation" className="inline-flex items-center justify-center gap-2 border-2 border-gray-300 hover:border-emerald-500 text-gray-700 px-7 py-3 rounded-full text-base font-semibold transition-all">
                  Free Skin Analysis
                </Link>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-6 mt-8">
                <div className="text-center"><p className="text-xl font-bold text-gray-900">50K+</p><p className="text-xs text-gray-500">Happy Customers</p></div>
                <div className="w-px h-8 bg-gray-200" />
                <div className="text-center"><p className="text-xl font-bold text-gray-900">4.8</p><p className="text-xs text-gray-500">Average Rating</p></div>
                <div className="w-px h-8 bg-gray-200" />
                <div className="text-center"><p className="text-xl font-bold text-gray-900">5</p><p className="text-xs text-gray-500">Products</p></div>
              </div>
            </div>
            {/* Right side - Product showcase on desktop */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="grid grid-cols-3 gap-3">
                {products.slice(0, 3).map(p => (
                  <Link to={`/product/${p.slug}`} key={p.slug} className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 text-center">
                    <div className="w-20 h-20 mx-auto mb-2 bg-emerald-50 rounded-xl flex items-center justify-center">
                      {p.images?.[0] ? <img src={p.images[0]} alt={p.short_name} className="w-16 h-16 object-contain" /> : <Sparkles className="w-8 h-8 text-emerald-500" />}
                    </div>
                    <p className="text-xs font-semibold text-gray-900">{p.short_name}</p>
                    <p className="text-sm font-bold text-emerald-600">₹{p.prepaid_price}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Complete Kit Bundle — PRIMARY SELLING POINT */}
      {completeKit && (
        <section className="bg-gradient-to-br from-amber-50 to-orange-50 py-10 sm:py-14 border-y border-amber-100" data-testid="complete-kit-section">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-2 bg-amber-400 text-amber-900 px-4 py-1.5 rounded-full text-sm font-bold mb-3"><Award size={14} /> BEST VALUE — SAVE 51%</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{completeKit.name}</h2>
              <p className="text-gray-600 mt-2">{completeKit.description}</p>
            </div>
            <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border-2 border-amber-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                {/* Single Hero Image — admin updatable */}
                <div className="aspect-square sm:aspect-[4/3] bg-gradient-to-br from-emerald-50 to-amber-50 rounded-2xl flex items-center justify-center overflow-hidden">
                  {settings.bundle_hero_image ? (
                    <img src={settings.bundle_hero_image} alt="Complete Anti-Aging Kit" className="w-full h-full object-contain p-4" />
                  ) : (
                    <div className="text-center p-6">
                      <div className="w-20 h-20 mx-auto mb-3 bg-amber-100 rounded-2xl flex items-center justify-center"><Package className="w-10 h-10 text-amber-600" /></div>
                      <p className="text-sm font-semibold text-gray-700">Complete Anti-Aging Kit</p>
                      <p className="text-xs text-gray-400 mt-1">5 Products Bundle</p>
                    </div>
                  )}
                </div>
                {/* Product List + Pricing */}
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-3">What You Get:</h3>
                  <div className="space-y-2 mb-5">
                    {completeKit.product_slugs?.map(slug => {
                      const p = products.find(pr => pr.slug === slug);
                      return p ? (
                        <div key={slug} className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700 flex-1">{p.short_name}</span>
                          <span className="text-sm text-gray-400 line-through">₹{p.mrp}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-baseline gap-3 mb-1">
                      <span className="text-3xl font-bold text-gray-900">₹{completeKit.combo_prepaid_price?.toLocaleString()}</span>
                      <span className="text-lg text-gray-400 line-through">₹{completeKit.mrp_total?.toLocaleString()}</span>
                      <span className="text-sm font-bold text-white bg-rose-500 px-3 py-1 rounded-full">{completeKit.discount_percent}% OFF</span>
                    </div>
                    <p className="text-sm text-emerald-700 mb-4">Save ₹{(completeKit.mrp_total - completeKit.combo_prepaid_price)?.toLocaleString()} | Free Shipping</p>
                    <button onClick={() => handleAddCombo(completeKit.combo_id)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-full transition-colors text-base shadow-lg" data-testid="add-complete-kit">
                      Add Complete Kit to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* All Products Grid */}
      <section className="max-w-7xl mx-auto px-4 py-10 sm:py-14" data-testid="products-section">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Shop Individual Products</h2>
          <p className="text-gray-500 mt-2">Clinically formulated. Dermatologist approved. Made in India.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {products.map(product => (
            <div key={product.slug} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-emerald-200 transition-all" data-testid={`product-card-${product.slug}`}>
              {product.badge && (
                <div className={`text-[10px] sm:text-xs font-bold px-3 py-1 text-center ${product.badge === 'Bestseller' ? 'bg-amber-400 text-amber-900' : product.badge === 'New Launch' ? 'bg-rose-500 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                  {product.badge}
                </div>
              )}
              <Link to={`/product/${product.slug}`} className="block">
                <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 sm:p-6 group-hover:scale-105 transition-transform">
                  {product.images?.[0] ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain" /> : (
                    <div className="text-center"><div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 bg-emerald-100 rounded-2xl flex items-center justify-center"><Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" /></div><p className="text-[10px] sm:text-xs text-gray-400 font-medium">{product.short_name}</p></div>
                  )}
                </div>
              </Link>
              <div className="p-2.5 sm:p-4">
                <Link to={`/product/${product.slug}`}><h3 className="font-semibold text-gray-900 text-xs sm:text-sm leading-tight mb-1 group-hover:text-emerald-700 line-clamp-2">{product.short_name}</h3></Link>
                <p className="text-[10px] sm:text-xs text-gray-500 mb-1.5 line-clamp-1">{product.key_ingredients}</p>
                <div className="flex items-center gap-1 mb-1.5">
                  <Star size={10} className="fill-amber-400 text-amber-400" /><span className="text-[10px] sm:text-xs font-medium">{product.rating}</span><span className="text-[10px] text-gray-400">({product.reviews_count?.toLocaleString()})</span>
                </div>
                <div className="flex items-baseline gap-1.5 mb-2.5">
                  <span className="text-base sm:text-lg font-bold text-gray-900">₹{product.prepaid_price}</span>
                  <span className="text-[10px] sm:text-xs text-gray-400 line-through">₹{product.mrp}</span>
                  <span className="text-[10px] font-bold text-emerald-600">{product.discount_percent}%</span>
                </div>
                <button onClick={() => handleAddToCart(product.slug)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold py-2 rounded-xl transition-colors" data-testid={`add-to-cart-${product.slug}`}>
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Other Combo Deals */}
      {otherCombos.length > 0 && (
        <section className="bg-gray-50 py-10 sm:py-14" data-testid="combos-section">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">More Combo Deals</h2>
              <p className="text-gray-500 mt-2">Build your routine and save more</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {otherCombos.map(combo => (
                <div key={combo.combo_id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all" data-testid={`combo-card-${combo.combo_id}`}>
                  {combo.badge && <div className={`text-sm font-bold px-4 py-2 text-center ${combo.badge === 'Popular' ? 'bg-rose-500 text-white' : 'bg-emerald-600 text-white'}`}>{combo.badge} — Save {combo.discount_percent}%</div>}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{combo.name}</h3>
                    <p className="text-sm text-gray-500 mb-3">{combo.description}</p>
                    <div className="flex items-center justify-between">
                      <div><span className="text-gray-400 line-through text-sm">₹{combo.mrp_total?.toLocaleString()}</span><span className="text-2xl font-bold text-gray-900 ml-2">₹{combo.combo_prepaid_price?.toLocaleString()}</span></div>
                      <button onClick={() => handleAddCombo(combo.combo_id)} className="bg-emerald-600 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-emerald-700" data-testid={`add-combo-${combo.combo_id}`}>Add to Cart</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works — 3-Step Routine */}
      <section className="max-w-7xl mx-auto px-4 py-10 sm:py-14">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Your Complete Anti-Aging Routine</h2>
          <p className="text-gray-500 mt-2">Simple 3-step system for younger-looking skin</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { step: '1', title: 'Cleanse', desc: 'Start with our Gentle Cleanser to remove impurities while protecting your skin barrier.', time: 'Morning & Night', icon: '🧴' },
            { step: '2', title: 'Treat & Hydrate', desc: 'Apply Serum + Night Cream to target wrinkles, dark spots, and fine lines with active ingredients.', time: 'Based on routine', icon: '✨' },
            { step: '3', title: 'Protect', desc: 'Finish with SPF 50 Sunscreen to shield from UV damage — the #1 cause of premature aging.', time: 'Every morning', icon: '🛡️' },
          ].map((item, i) => (
            <div key={i} className="relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-emerald-200 transition-colors text-center">
              <div className="text-3xl mb-3">{item.icon}</div>
              <div className="w-8 h-8 bg-emerald-600 text-white text-sm font-bold rounded-full flex items-center justify-center mx-auto mb-3">
                {item.step}
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 mb-2">{item.desc}</p>
              <span className="text-xs text-emerald-600 font-medium">{item.time}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Clinical Results */}
      <section className="bg-emerald-900 text-white py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold">Clinically Proven Results</h2>
            <p className="text-emerald-300 mt-2">Based on clinical studies with 500+ participants</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { stat: '94%', desc: 'Saw reduced wrinkles in 4 weeks' },
              { stat: '89%', desc: 'Reported brighter, even skin tone' },
              { stat: '96%', desc: 'Experienced improved hydration' },
              { stat: '91%', desc: 'Noticed firmer, younger-looking skin' },
            ].map((item, i) => (
              <div key={i} className="text-center p-5 rounded-2xl bg-white/10 backdrop-blur">
                <p className="text-3xl sm:text-4xl font-bold text-emerald-300">{item.stat}</p>
                <p className="text-sm text-emerald-100 mt-2">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Celesta Glow */}
      <section className="max-w-7xl mx-auto px-4 py-10 sm:py-14">
        <div className="text-center mb-8"><h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Why Choose Celesta Glow?</h2></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Shield, title: 'Clinically Tested', desc: 'Dermatologist approved formulas' },
            { icon: Truck, title: 'Free Shipping', desc: 'On all orders across India' },
            { icon: Award, title: 'Made in India', desc: 'CMISO 9001:2015 Certified' },
            { icon: Clock, title: '30-Day Guarantee', desc: 'Full money-back promise' },
          ].map((item, i) => (
            <div key={i} className="text-center p-5 rounded-2xl border border-gray-100 hover:border-emerald-200 transition-colors">
              <div className="w-12 h-12 mx-auto mb-3 bg-emerald-50 rounded-xl flex items-center justify-center"><item.icon className="w-6 h-6 text-emerald-600" /></div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{item.title}</h3>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Dermatologist Section */}
      <DermatologistSection />

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-4 py-10 sm:py-14" data-testid="faq-section">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left">
                <span className="font-medium text-gray-900 text-sm pr-4">{faq.q}</span>
                <ChevronDown size={18} className={`text-gray-400 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">{faq.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-emerald-700 text-white py-10 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Start Your Anti-Aging Journey Today</h2>
          <p className="text-emerald-100 mb-6">Complete routine starting at just ₹499. Free shipping. 30-day money-back guarantee.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/shop" className="inline-flex items-center justify-center gap-2 bg-white text-emerald-700 px-8 py-3 rounded-full font-bold hover:bg-emerald-50 transition-colors">
              Shop Now <ChevronRight size={18} />
            </Link>
            <Link to="/consultation" className="inline-flex items-center justify-center gap-2 border-2 border-emerald-400 text-white px-8 py-3 rounded-full font-bold hover:bg-emerald-600 transition-colors">
              Free Skin Analysis
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Homepage;
