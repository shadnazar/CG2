import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Star, ChevronRight, Shield, Truck, Award, Clock, Sparkles, ChevronDown, Zap, Check, Package, ArrowRight, RefreshCw } from 'lucide-react';
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
  const handleAddCombo = (id) => { const cart = getCart(); const e = cart.items.find(i => i.combo_id === id); if (e) e.quantity += 1; else cart.items.push({ combo_id: id, quantity: 1 }); saveCart(cart); };

  const kit = combos.find(c => c.combo_id === 'complete-anti-aging-kit');
  const otherCombos = combos.filter(c => c.combo_id !== 'complete-anti-aging-kit');
  const faqs = [
    { q: "What makes Celesta Glow different?", a: "India's first complete 5-product anti-aging system with clinically-proven actives." },
    { q: "Suitable for all skin types?", a: "Yes. Dermatologist-tested, pH-balanced for every Indian skin type." },
    { q: "How soon will I see results?", a: "Most customers see visible improvement in 2-4 weeks with daily use." },
    { q: "Can I use these together?", a: "Designed as a system! Morning: Cleanser + Serum + Sunscreen. Night: Cleanser + Night Cream + Under Eye Cream." },
    { q: "Return policy?", a: "30-day money-back guarantee. Full refund, no questions asked." },
    { q: "Is COD available?", a: "Yes! COD with ₹29 advance. Prepaid gets faster delivery + better pricing." },
  ];

  return (
    <div className="min-h-screen bg-white" data-testid="homepage">
      {/* Brand Bar */}
      <div className="bg-green-700 text-green-50 text-center py-1.5 px-4">
        <p className="text-xs sm:text-xs tracking-wider font-medium">FREE SHIPPING | COD AVAILABLE | 30-DAY MONEY BACK | 50,000+ CUSTOMERS</p>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden" data-testid="hero-section">
        <div className="absolute inset-0 bg-gradient-to-br from-stone-50 via-green-50/20 to-white" />
        <div className="relative max-w-7xl mx-auto px-4 py-8 sm:py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-green-700 px-4 py-1.5 rounded-full text-xs font-semibold border border-green-200/60 shadow-sm mb-4">
                <Sparkles size={13} /> India's #1 Anti-Aging Brand
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-[1.1] tracking-tight mb-3" style={{hyphens:'none',wordBreak:'keep-all'}}>
                {settings.hero_title || "Complete Anti-Aging Solution"}
              </h1>
              <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto lg:mx-0 leading-relaxed">
                {settings.hero_subtitle || "5 clinically formulated products to fight aging. Cleanse, treat, hydrate, protect and brighten."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link to="/shop" className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-7 py-3.5 rounded-full text-sm font-bold shadow-lg shadow-green-200/50" data-testid="shop-now-btn">
                  Shop All Products <ChevronRight size={16} />
                </Link>
                <Link to="/consultation" className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-800 px-7 py-3.5 rounded-full text-sm font-bold border border-gray-200 shadow-sm">
                  Free Skin Analysis
                </Link>
              </div>
              {/* Trust — single line with COD */}
              <div className="flex items-center justify-center lg:justify-start gap-2 mt-6 flex-wrap">
                {[{ n: '50K+', d: 'Customers', bg: 'green' }, { n: '4.8', d: 'Rating', bg: 'amber' }, { n: '30-Day', d: 'Return', bg: 'rose' }, { n: 'COD', d: 'Available', bg: 'blue' }].map((s, i) => (
                  <div key={i} className={`bg-${s.bg}-50 border border-${s.bg}-200/60 rounded-xl px-3 py-1.5 text-center`}>
                    <p className={`text-sm font-black text-${s.bg}-700`}>{s.n}</p>
                    <p className={`text-xs text-${s.bg}-600 font-semibold tracking-wider`}>{s.d.toUpperCase()}</p>
                  </div>
                ))}
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

      {/* Complete Kit — LARGE layout on homepage */}
      {kit && (
        <section className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 py-8 sm:py-12 border-y border-amber-100/60" data-testid="complete-kit-section">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-4">
              <span className="inline-flex items-center gap-2 bg-amber-400 text-amber-900 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide"><Award size={13} /> BEST VALUE — SAVE {kit.discount_percent}%</span>
            </div>
            <div className="bg-white rounded-3xl shadow-lg p-5 sm:p-7 border border-amber-200/40">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
                <div className="aspect-[4/3] bg-gradient-to-br from-green-50 to-amber-50 rounded-2xl flex items-center justify-center overflow-hidden">
                  {settings.bundle_hero_image ? <img src={settings.bundle_hero_image} alt="Kit" className="w-full h-full object-contain p-3" /> : (
                    <div className="text-center"><Package className="w-16 h-16 mx-auto mb-2 text-amber-400" /><p className="text-sm font-bold text-gray-600">Complete Kit</p></div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">{kit.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{kit.description}</p>
                  <div className="space-y-1.5 mt-3 mb-4">
                    {kit.product_slugs?.map(slug => {
                      const p = products.find(pr => pr.slug === slug);
                      return p ? (
                        <div key={slug} className="flex items-center gap-2.5">
                          <div className="w-7 h-7 bg-stone-50 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-5 h-5 object-contain" /> : <Sparkles size={10} className="text-green-400" />}
                          </div>
                          <span className="text-sm text-gray-700 font-medium flex-1">{p.short_name}</span>
                          <span className="text-xs text-gray-400 line-through">₹{p.mrp}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                  <div className="bg-green-50 rounded-xl p-2.5 text-center border border-green-100 mb-3">
                    <p className="text-xs text-green-700 font-bold">You save ₹{(kit.mrp_total - kit.combo_prepaid_price)?.toLocaleString()}</p>
                  </div>
                  <div className="flex items-end gap-2 mb-3">
                    <span className="text-3xl font-black text-gray-900">₹{kit.combo_prepaid_price?.toLocaleString()}</span>
                    <span className="text-base text-gray-400 line-through mb-0.5">₹{kit.mrp_total?.toLocaleString()}</span>
                  </div>
                  <button onClick={() => handleAddCombo(kit.combo_id)} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-2xl text-sm shadow-lg shadow-green-200/50 flex items-center justify-center gap-1.5" data-testid="add-complete-kit">
                    <ShoppingCart size={15} /> Add Complete Kit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Volume Discount Banner */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-2.5 px-4 text-center">
        <p className="text-xs sm:text-xs font-bold">Add More, Save More! <span className="font-normal opacity-90">2 items = 5% OFF | 3 items = 10% OFF | 4+ items = 15% OFF</span></p>
      </div>

      {/* Products */}
      <section className="max-w-7xl mx-auto px-4 py-8 sm:py-12" data-testid="products-section">
        <div className="text-center mb-6">
          <p className="text-xs font-bold text-green-600 uppercase tracking-[0.2em] mb-1">Our Range</p>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">Shop Individual Products</h2>
          <div className="w-12 h-0.5 bg-green-500 mx-auto mt-2.5 rounded-full" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {products.map(product => {
            const orders = Math.floor(Math.random() * 40) + 30;
            const piecesLeft = Math.floor(Math.random() * 20) + 5;
            return (
            <div key={product.slug} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300" data-testid={`product-card-${product.slug}`}>
              {product.badge && <div className={`text-xs font-bold px-3 py-1 text-center tracking-wide ${product.badge === 'Bestseller' ? 'bg-amber-400 text-amber-900' : product.badge === 'New Launch' ? 'bg-rose-500 text-white' : 'bg-green-50 text-green-700'}`}>{product.badge.toUpperCase()}</div>}
              <Link to={`/product/${product.slug}`} className="block relative">
                <div className="aspect-square bg-stone-50 flex items-center justify-center p-4 group-hover:scale-105 transition-transform duration-300">
                  {product.images?.[0] ? <img src={product.images[0]} alt="" className="w-full h-full object-contain" /> : <Sparkles className="w-10 h-10 text-green-200" />}
                </div>
                {/* Live badges — medium size */}
                <div className="absolute bottom-2 left-2 right-2 flex justify-between">
                  <span className="text-xs bg-white/95 backdrop-blur-sm text-gray-700 px-2 py-1 rounded-lg font-semibold border border-gray-200 shadow-sm">{orders} sold today</span>
                  <span className="text-xs bg-rose-50 text-rose-700 px-2 py-1 rounded-lg font-semibold border border-rose-200 shadow-sm">{piecesLeft} left</span>
                </div>
              </Link>
              <div className="p-3">
                <Link to={`/product/${product.slug}`}><h3 className="font-bold text-gray-900 text-sm leading-tight mb-1 group-hover:text-green-700 line-clamp-2">{product.short_name}</h3></Link>
                <p className="text-xs text-gray-400 line-clamp-1 mb-1">{product.key_ingredients}</p>
                <p className="text-xs text-gray-400 mb-1.5">{product.size}</p>
                {/* Price */}
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xs text-gray-400 line-through">₹{product.mrp}</span>
                  <span className="text-lg font-black text-gray-900">₹{product.prepaid_price}</span>
                  <span className="text-xs font-bold text-green-600">{product.discount_percent}% Off</span>
                </div>
                {/* Coupon — orange theme */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg px-2 py-1.5 mb-2 flex items-center gap-1.5">
                  <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0"><Check size={9} className="text-white" /></div>
                  <p className="text-xs text-orange-800 font-semibold">Get for ₹{product.prepaid_price - 50} with <span className="font-bold font-mono">WELCOME50</span></p>
                </div>
                {/* Rating */}
                <div className="flex items-center gap-1.5 mb-2.5">
                  <div className="flex">{[1,2,3,4,5].map(i => <Star key={i} size={11} className={i <= Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />)}</div>
                  <span className="text-xs text-gray-500 font-medium">({product.reviews_count?.toLocaleString()})</span>
                </div>
                <button onClick={(e) => { e.preventDefault(); handleAddToCart(product.slug); }} className="w-full bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5" data-testid={`add-to-cart-${product.slug}`}>
                  <ShoppingCart size={14} /> Add to Cart
                </button>
              </div>
            </div>
            );
          })}
        </div>
      </section>

      {/* Other Combos */}
      {otherCombos.length > 0 && (
        <section className="bg-stone-50 py-8 sm:py-12" data-testid="combos-section">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-5">
              <p className="text-xs font-bold text-green-600 uppercase tracking-[0.2em] mb-1">Bundle & Save</p>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">More Deals</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {otherCombos.map(combo => (
                <div key={combo.combo_id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
                  <div className="aspect-[16/9] bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center relative">
                    <Package className="w-8 h-8 text-green-300" />
                    <span className="absolute top-2.5 right-2.5 bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{combo.discount_percent}% OFF</span>
                    <span className="absolute top-2.5 left-2.5 bg-white/90 text-gray-700 text-xs font-bold px-2 py-0.5 rounded-full">{combo.product_slugs?.length} Products</span>
                  </div>
                  <div className="p-3.5">
                    <h3 className="text-sm font-bold text-gray-900">{combo.name}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <div><span className="text-lg font-black text-gray-900">₹{combo.combo_prepaid_price?.toLocaleString()}</span><span className="text-xs text-gray-400 line-through ml-1">₹{combo.mrp_total?.toLocaleString()}</span></div>
                      <button onClick={() => handleAddCombo(combo.combo_id)} className="bg-green-600 text-white px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-green-700 flex items-center gap-1"><ShoppingCart size={10} /> Add</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-6"><h2 className="text-xl font-black text-gray-900">Simple 3-Step System</h2><div className="w-12 h-0.5 bg-green-500 mx-auto mt-2.5 rounded-full" /></div>
        <div className="grid grid-cols-3 gap-3 sm:gap-6">
          {[{ s: '1', t: 'Cleanse', d: 'Remove impurities', time: 'AM & PM' }, { s: '2', t: 'Treat', d: 'Target aging signs', time: 'Routine' }, { s: '3', t: 'Protect', d: 'Shield from UV', time: 'Morning' }].map((item, i) => (
            <div key={i} className="text-center">
              <div className="w-11 h-11 sm:w-14 sm:h-14 bg-green-600 text-white text-sm sm:text-lg font-black rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg shadow-green-200/50">{item.s}</div>
              <h3 className="font-bold text-gray-900 text-xs sm:text-base mb-0.5">{item.t}</h3>
              <p className="text-xs sm:text-xs text-gray-500">{item.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Clinical Results */}
      <section className="bg-gradient-to-br from-green-900 via-green-800 to-teal-900 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-lg sm:text-xl font-black text-white text-center mb-5">Clinically Proven Results</h2>
          <div className="grid grid-cols-4 gap-2">
            {[{ s: '94%', d: 'Less wrinkles' }, { s: '89%', d: 'Brighter tone' }, { s: '96%', d: 'Hydrated' }, { s: '91%', d: 'Firmer skin' }].map((r, i) => (
              <div key={i} className="text-center bg-white/10 backdrop-blur-sm rounded-xl py-3 px-2 border border-white/10">
                <p className="text-xl sm:text-3xl font-black text-green-300">{r.s}</p>
                <p className="text-xs sm:text-xs text-green-200 mt-1">{r.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <h2 className="text-lg sm:text-xl font-black text-gray-900 text-center mb-5">Why Celesta Glow?</h2>
        <div className="grid grid-cols-4 gap-2">
          {[{ icon: Shield, t: 'Lab Tested' }, { icon: Truck, t: 'Free Ship' }, { icon: Award, t: 'Certified' }, { icon: RefreshCw, t: '30-Day Return' }].map((item, i) => (
            <div key={i} className="text-center p-3 rounded-xl bg-stone-50 border border-stone-100">
              <item.icon size={20} className="mx-auto mb-1.5 text-green-600" />
              <p className="text-xs font-bold text-gray-800">{item.t}</p>
            </div>
          ))}
        </div>
      </section>

      <DermatologistSection />

      {/* FAQ */}
      <section className="bg-stone-50 py-8 sm:py-12" data-testid="faq-section">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-lg font-black text-gray-900 text-center mb-5">FAQ</h2>
          <div className="space-y-1.5">
            {faqs.map((faq, i) => (
              <div key={i} className={`rounded-xl overflow-hidden ${openFaq === i ? 'bg-green-50 border border-green-100' : 'bg-white border border-gray-100'}`}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-3.5 text-left">
                  <span className="font-semibold text-gray-900 text-sm pr-4">{faq.q}</span>
                  <ChevronDown size={16} className={`text-gray-400 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && <div className="px-3.5 pb-3.5 text-sm text-gray-600">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coupon — orange */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white py-2.5 px-4 text-center">
        <p className="text-xs font-bold">New User? Use <span className="bg-white/25 px-2 py-0.5 rounded font-mono mx-0.5">WELCOME50</span> for ₹50 OFF | This Month: <span className="bg-white/25 px-2 py-0.5 rounded font-mono mx-0.5">FEB25</span> for ₹25 OFF</p>
      </div>

      {/* CTA */}
      <section className="bg-green-700 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-lg sm:text-xl font-black mb-2">Start Your Anti-Aging Journey</h2>
          <p className="text-green-200 text-sm mb-5">From ₹499. Free shipping. 30-day guarantee.</p>
          <Link to="/shop" className="inline-flex items-center gap-2 bg-white text-green-700 px-7 py-3 rounded-full font-bold text-sm hover:bg-green-50 shadow-lg">Shop Now <ChevronRight size={16} /></Link>
        </div>
      </section>
    </div>
  );
}

export default Homepage;
