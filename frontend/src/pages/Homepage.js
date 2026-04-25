import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Star, ChevronRight, Shield, Truck, Award, Clock, Sparkles, ChevronDown, Zap, Check, Package, ArrowRight, RefreshCw, Heart } from 'lucide-react';
import axios from 'axios';
import { useTracking } from '../providers/TrackingProvider';
import DermatologistSection from '../components/DermatologistSection';

const API = process.env.REACT_APP_BACKEND_URL;

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

function Homepage() {
  const navigate = useNavigate();
  const { trackAction } = useTracking();
  const [products, setProducts] = useState([]);
  const [combos, setCombos] = useState([]);
  const [settings, setSettings] = useState({});
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [p, c, s] = await Promise.all([axios.get(`${API}/api/products`), axios.get(`${API}/api/combos`), axios.get(`${API}/api/site-settings`)]);
        setProducts(p.data); setCombos(c.data); setSettings(s.data);
      } catch {}
    })();
  }, []);

  const handleAddToCart = (slug) => {
    addToCart(slug); trackAction('add_to_cart', { product_slug: slug });
    if (window.fbq) { const p = products.find(pr => pr.slug === slug); window.fbq('track', 'AddToCart', { content_name: p?.name, content_ids: [slug], value: p?.prepaid_price, currency: 'INR' }); }
  };
  const handleAddCombo = (comboId) => { const cart = getCart(); const e = cart.items.find(i => i.combo_id === comboId); if (e) e.quantity += 1; else cart.items.push({ combo_id: comboId, quantity: 1 }); saveCart(cart); };

  const kit = combos.find(c => c.combo_id === 'complete-anti-aging-kit');
  const otherCombos = combos.filter(c => c.combo_id !== 'complete-anti-aging-kit');
  const faqs = [
    { q: "What makes Celesta Glow different?", a: "India's first complete 5-product anti-aging system. Each uses clinically-proven actives — Retinoid, Niacinamide, Caffeine, Vitamin C." },
    { q: "Suitable for all skin types?", a: "Yes. Dermatologist-tested, pH-balanced, non-comedogenic for every Indian skin type." },
    { q: "How soon will I see results?", a: "Most customers see visible improvement in 2-4 weeks with daily use of the Complete Kit." },
    { q: "Can I use these together?", a: "Designed as a system! Morning: Cleanser + Serum + Sunscreen. Night: Cleanser + Night Cream + Under Eye Cream." },
    { q: "Return policy?", a: "30-day money-back guarantee. Full refund, no questions asked." },
    { q: "COD available?", a: "Yes! COD with ₹29 advance. Prepaid gets faster 1-2 day delivery + better pricing." },
  ];

  return (
    <div className="min-h-screen bg-white" data-testid="homepage">
      {/* Brand Bar */}
      <div className="bg-green-700 text-green-50 text-center py-1.5 px-4">
        <p className="text-[10px] sm:text-xs tracking-wider font-medium">FREE SHIPPING | COD AVAILABLE | 30-DAY MONEY BACK | 50,000+ CUSTOMERS</p>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden" data-testid="hero-section">
        <div className="absolute inset-0 bg-gradient-to-br from-stone-50 via-green-50/20 to-white" />
        <div className="relative max-w-7xl mx-auto px-4 py-10 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-green-700 px-4 py-1.5 rounded-full text-xs font-semibold border border-green-200/60 shadow-sm mb-5">
                <Sparkles size={13} /> India's #1 Anti-Aging Brand
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-[1.1] tracking-tight mb-4" style={{hyphens:'none',wordBreak:'keep-all'}}>
                {settings.hero_title || "Complete Anti-Aging Solution"}
              </h1>
              <p className="text-sm sm:text-base text-gray-500 mb-7 max-w-md mx-auto lg:mx-0 leading-relaxed">
                {settings.hero_subtitle || "5 clinically formulated products to fight aging. Cleanse, treat, hydrate, protect and brighten."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link to="/shop" className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-7 py-3.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-green-200/50" data-testid="shop-now-btn">
                  Shop All Products <ChevronRight size={16} />
                </Link>
                <Link to="/consultation" className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-800 px-7 py-3.5 rounded-full text-sm font-bold border border-gray-200 shadow-sm">
                  Free Skin Analysis
                </Link>
              </div>
              {/* Trust Stats + Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mt-8">
                <div className="bg-green-50 border border-green-200/60 rounded-xl px-3.5 py-2 text-center">
                  <p className="text-lg font-black text-green-700">50K+</p><p className="text-[8px] text-green-600 font-semibold tracking-wider">CUSTOMERS</p>
                </div>
                <div className="bg-amber-50 border border-amber-200/60 rounded-xl px-3.5 py-2 text-center">
                  <p className="text-lg font-black text-amber-700">4.8</p><p className="text-[8px] text-amber-600 font-semibold tracking-wider">RATING</p>
                </div>
                <div className="bg-purple-50 border border-purple-200/60 rounded-xl px-3.5 py-2 text-center">
                  <p className="text-lg font-black text-purple-700">5</p><p className="text-[8px] text-purple-600 font-semibold tracking-wider">PRODUCTS</p>
                </div>
                <div className="bg-rose-50 border border-rose-200/60 rounded-xl px-3.5 py-2 text-center">
                  <p className="text-lg font-black text-rose-700">30</p><p className="text-[8px] text-rose-600 font-semibold tracking-wider">DAY RETURN</p>
                </div>
                <div className="bg-blue-50 border border-blue-200/60 rounded-xl px-3.5 py-2 text-center">
                  <p className="text-lg font-black text-blue-700">COD</p><p className="text-[8px] text-blue-600 font-semibold tracking-wider">AVAILABLE</p>
                </div>
              </div>
            </div>
            <div className="hidden lg:flex items-center justify-center">
              <div className="grid grid-cols-3 gap-3">
                {products.slice(0, 3).map(p => (
                  <Link to={`/product/${p.slug}`} key={p.slug} className="bg-white rounded-2xl p-4 shadow-md hover:shadow-xl transition-all border border-gray-50 text-center group">
                    <div className="w-24 h-24 mx-auto mb-2 bg-stone-50 rounded-xl flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                      {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-20 h-20 object-contain" /> : <Sparkles className="w-8 h-8 text-green-300" />}
                    </div>
                    <p className="text-xs font-bold text-gray-800">{p.short_name}</p>
                    <p className="text-sm font-black text-green-600">₹{p.prepaid_price}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Complete Kit — compact badge layout */}
      {kit && (
        <section className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 py-8 sm:py-12 border-y border-amber-100/60" data-testid="complete-kit-section">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-amber-200/40">
              <div className="bg-amber-400 text-amber-900 py-2 px-4 text-center text-xs font-bold tracking-wider">BEST VALUE — SAVE {kit.discount_percent}% — GET ALL 5 PRODUCTS</div>
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Compact image */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-green-50 to-amber-50 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {settings.bundle_hero_image ? <img src={settings.bundle_hero_image} alt="Kit" className="w-20 h-20 object-contain" /> : <Package className="w-10 h-10 text-amber-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-black text-gray-900 leading-tight">{kit.name}</h3>
                    {/* Inline product tags */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {kit.product_slugs?.map(slug => {
                        const p = products.find(pr => pr.slug === slug);
                        return p ? <span key={slug} className="text-[9px] bg-green-50 text-green-700 border border-green-200/60 px-2 py-0.5 rounded-full font-medium">{p.short_name}</span> : null;
                      })}
                    </div>
                    {/* Badges */}
                    <div className="flex gap-1.5 mt-2">
                      <span className="text-[8px] bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded font-bold border border-rose-100">FAST RESULTS</span>
                      <span className="text-[8px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded font-bold border border-purple-100">COMPLETE ROUTINE</span>
                      <span className="text-[8px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold border border-blue-100">FREE SHIPPING</span>
                    </div>
                  </div>
                </div>
                {/* Price + CTA */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div>
                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-black text-gray-900">₹{kit.combo_prepaid_price?.toLocaleString()}</span>
                      <span className="text-sm text-gray-400 line-through mb-0.5">₹{kit.mrp_total?.toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] text-green-600 font-bold">You save ₹{(kit.mrp_total - kit.combo_prepaid_price)?.toLocaleString()}</p>
                  </div>
                  <button onClick={() => handleAddCombo(kit.combo_id)} className="bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-3 rounded-2xl text-sm shadow-lg shadow-green-200/50 transition-all flex items-center gap-1.5" data-testid="add-complete-kit">
                    <ShoppingCart size={15} /> Add Kit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Volume Discount Banner */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 text-center">
        <p className="text-xs sm:text-sm font-bold">Add More, Save More! <span className="font-normal opacity-90">2 items = 5% OFF | 3 items = 10% OFF | 4+ items = 15% OFF</span></p>
      </div>

      {/* Products */}
      <section className="max-w-7xl mx-auto px-4 py-10 sm:py-14" data-testid="products-section">
        <div className="text-center mb-8">
          <p className="text-[10px] font-bold text-green-600 uppercase tracking-[0.2em] mb-1">Our Range</p>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">Shop Individual Products</h2>
          <div className="w-12 h-0.5 bg-green-500 mx-auto mt-3 rounded-full" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {products.map(product => (
            <div key={product.slug} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300" data-testid={`product-card-${product.slug}`}>
              {product.badge && <div className={`text-[9px] font-bold px-3 py-1 text-center tracking-wider ${product.badge === 'Bestseller' ? 'bg-amber-400 text-amber-900' : product.badge === 'New Launch' ? 'bg-rose-500 text-white' : 'bg-green-100 text-green-800'}`}>{product.badge.toUpperCase()}</div>}
              <Link to={`/product/${product.slug}`} className="block">
                <div className="aspect-square bg-gradient-to-br from-stone-50 to-gray-50 flex items-center justify-center p-4 group-hover:scale-105 transition-transform duration-300">
                  {product.images?.[0] ? <img src={product.images[0]} alt="" className="w-full h-full object-contain" /> : <Sparkles className="w-10 h-10 text-green-200" />}
                </div>
              </Link>
              <div className="p-3">
                <Link to={`/product/${product.slug}`}><h3 className="font-bold text-gray-900 text-xs leading-tight mb-0.5 group-hover:text-green-700 line-clamp-2 transition-colors">{product.short_name}</h3></Link>
                <p className="text-[9px] text-gray-400 mb-1.5 line-clamp-1">{product.key_ingredients}</p>
                <div className="flex items-center gap-1 mb-1.5"><Star size={10} className="fill-amber-400 text-amber-400" /><span className="text-[10px] font-semibold text-gray-700">{product.rating}</span></div>
                <div className="mb-2.5">
                  <div className="flex items-baseline gap-1.5"><span className="text-base font-black text-gray-900">₹{product.prepaid_price}</span><span className="text-[10px] text-gray-400 line-through">₹{product.mrp}</span></div>
                  <p className="text-[9px] text-green-600 font-semibold">Save ₹{product.mrp - product.prepaid_price}</p>
                </div>
                <button onClick={() => handleAddToCart(product.slug)} className="w-full bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold py-2 rounded-xl transition-colors flex items-center justify-center gap-1" data-testid={`add-to-cart-${product.slug}`}>
                  <ShoppingCart size={11} /> Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Combo Deals */}
      {otherCombos.length > 0 && (
        <section className="bg-stone-50 py-10 sm:py-14" data-testid="combos-section">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-6">
              <p className="text-[10px] font-bold text-green-600 uppercase tracking-[0.2em] mb-1">Bundle & Save</p>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">More Combo Deals</h2>
              <div className="w-12 h-0.5 bg-green-500 mx-auto mt-3 rounded-full" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {otherCombos.map(combo => (
                <div key={combo.combo_id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
                  <div className="aspect-[16/9] bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center relative">
                    <Package className="w-10 h-10 text-green-300" />
                    <span className="absolute top-3 right-3 bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">{combo.discount_percent}% OFF</span>
                    <span className="absolute top-3 left-3 bg-white/90 text-gray-700 text-[9px] font-bold px-2 py-0.5 rounded-full">{combo.product_slugs?.length} Products</span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-base font-bold text-gray-900">{combo.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{combo.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div><span className="text-lg font-black text-gray-900">₹{combo.combo_prepaid_price?.toLocaleString()}</span><span className="text-xs text-gray-400 line-through ml-1.5">₹{combo.mrp_total?.toLocaleString()}</span></div>
                      <button onClick={() => handleAddCombo(combo.combo_id)} className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-green-700 flex items-center gap-1"><ShoppingCart size={11} /> Add</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="max-w-4xl mx-auto px-4 py-10 sm:py-14">
        <div className="text-center mb-8">
          <p className="text-[10px] font-bold text-green-600 uppercase tracking-[0.2em] mb-1">Your Routine</p>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">Simple 3-Step System</h2>
          <div className="w-12 h-0.5 bg-green-500 mx-auto mt-3 rounded-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[{ s: '1', t: 'Cleanse', d: 'Gentle Cleanser removes impurities and protects your skin barrier.', time: 'Morning & Night' },
            { s: '2', t: 'Treat & Hydrate', d: 'Serum + Night Cream target wrinkles, dark spots, and fine lines.', time: 'Based on routine' },
            { s: '3', t: 'Protect', d: 'SPF 50 Sunscreen shields from UV damage, the #1 cause of aging.', time: 'Every morning' }
          ].map((item, i) => (
            <div key={i} className="text-center">
              <div className="w-14 h-14 bg-green-600 text-white text-lg font-black rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200/50">{item.s}</div>
              <h3 className="font-bold text-gray-900 text-base mb-1.5">{item.t}</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-2">{item.d}</p>
              <span className="text-[10px] text-green-600 font-semibold bg-green-50 px-3 py-1 rounded-full">{item.time}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Clinical Results */}
      <section className="bg-gradient-to-br from-green-900 via-green-800 to-teal-900 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-6">
            <p className="text-[10px] font-bold text-green-300 uppercase tracking-[0.2em]">Clinically Tested</p>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">Proven Results, Real Science</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[{ s: '94%', d: 'Reduced wrinkles' }, { s: '89%', d: 'Brighter skin tone' }, { s: '96%', d: 'Better hydration' }, { s: '91%', d: 'Firmer skin' }].map((r, i) => (
              <div key={i} className="text-center bg-white/10 backdrop-blur-sm rounded-2xl py-5 px-3 border border-white/10">
                <p className="text-3xl sm:text-4xl font-black text-green-300">{r.s}</p>
                <p className="text-[10px] text-green-200 mt-1.5">{r.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section className="max-w-7xl mx-auto px-4 py-10 sm:py-14">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">Why Choose Celesta Glow?</h2>
          <div className="w-12 h-0.5 bg-green-500 mx-auto mt-3 rounded-full" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[{ icon: Shield, t: 'Clinically Tested', d: 'Dermatologist approved' },
            { icon: Truck, t: 'Free Shipping', d: 'All India delivery' },
            { icon: Award, t: 'Made in India', d: 'CMISO 9001:2015' },
            { icon: RefreshCw, t: '30-Day Guarantee', d: 'Full money back' }
          ].map((item, i) => (
            <div key={i} className="text-center p-5 rounded-2xl bg-gradient-to-b from-white to-stone-50 border border-stone-100 shadow-sm">
              <div className="w-12 h-12 mx-auto mb-3 bg-green-50 rounded-xl flex items-center justify-center"><item.icon className="w-6 h-6 text-green-600" /></div>
              <h3 className="font-bold text-gray-900 text-sm mb-0.5">{item.t}</h3>
              <p className="text-[10px] text-gray-500">{item.d}</p>
            </div>
          ))}
        </div>
      </section>

      <DermatologistSection />

      {/* FAQ */}
      <section className="bg-gradient-to-b from-stone-50 to-white py-10 sm:py-14" data-testid="faq-section">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">Frequently Asked Questions</h2>
            <div className="w-12 h-0.5 bg-green-500 mx-auto mt-3 rounded-full" />
          </div>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className={`rounded-2xl overflow-hidden transition-all ${openFaq === i ? 'bg-green-50 border border-green-100' : 'bg-white border border-gray-100'}`}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left">
                  <span className="font-semibold text-gray-900 text-sm pr-4">{faq.q}</span>
                  <ChevronDown size={16} className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && <div className="px-4 pb-4 text-sm text-gray-600">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skin Analysis CTA */}
      <section className="bg-gradient-to-r from-purple-50 to-violet-50 py-8 border-y border-purple-100/60">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-xs font-bold text-purple-600 mb-1">Not sure which product is right for you?</p>
          <h3 className="text-lg font-bold text-gray-900 mb-3">Take Our Free Skin Analysis</h3>
          <Link to="/consultation" className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-purple-700 shadow-lg shadow-purple-200/50">
            Get Recommendation <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Coupon Banner */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 px-4 text-center">
        <p className="text-xs sm:text-sm font-bold">New User? Use code <span className="bg-white/20 px-2 py-0.5 rounded font-mono">WELCOME50</span> for ₹50 OFF your first order!</p>
      </div>

      {/* Final CTA */}
      <section className="bg-green-700 text-white py-10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-xl sm:text-2xl font-black mb-2">Start Your Anti-Aging Journey</h2>
          <p className="text-green-200 text-sm mb-6">Complete routine from ₹499. Free shipping. 30-day guarantee.</p>
          <Link to="/shop" className="inline-flex items-center gap-2 bg-white text-green-700 px-8 py-3.5 rounded-full font-bold text-sm hover:bg-green-50 shadow-lg">Shop Now <ChevronRight size={16} /></Link>
        </div>
      </section>
    </div>
  );
}

export default Homepage;
