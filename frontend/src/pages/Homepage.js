import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Star, ChevronRight, Shield, Truck, Award, Clock, Sparkles, ChevronDown, Zap, Check, Package, ArrowRight, Leaf } from 'lucide-react';
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
    const fetchData = async () => {
      try {
        const [p, c, s] = await Promise.all([axios.get(`${API}/api/products`), axios.get(`${API}/api/combos`), axios.get(`${API}/api/site-settings`)]);
        setProducts(p.data); setCombos(c.data); setSettings(s.data);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  const handleAddToCart = (slug) => {
    addToCart(slug);
    trackAction('add_to_cart', { product_slug: slug });
    if (window.fbq) { const p = products.find(pr => pr.slug === slug); window.fbq('track', 'AddToCart', { content_name: p?.name, content_ids: [slug], value: p?.prepaid_price, currency: 'INR' }); }
  };

  const handleAddCombo = (comboId) => {
    const cart = getCart();
    const existing = cart.items.find(i => i.combo_id === comboId);
    if (existing) existing.quantity += 1;
    else cart.items.push({ combo_id: comboId, quantity: 1 });
    saveCart(cart);
    trackAction('add_combo_to_cart', { combo_id: comboId });
  };

  const kit = combos.find(c => c.combo_id === 'complete-anti-aging-kit');
  const otherCombos = combos.filter(c => c.combo_id !== 'complete-anti-aging-kit');

  const faqs = [
    { q: "What makes Celesta Glow different?", a: "India's first complete 5-product anti-aging system. Each product uses clinically-proven actives like Retinoid, Niacinamide, Caffeine, and Vitamin C." },
    { q: "Suitable for all skin types?", a: "Yes. All products are dermatologist-tested, pH-balanced, and non-comedogenic for every Indian skin type." },
    { q: "How soon will I see results?", a: "Most customers report visible improvement in 2-4 weeks. For best results, use the Complete Kit daily." },
    { q: "Can I use these together?", a: "They're designed as a system! Morning: Cleanser, Serum, Sunscreen. Night: Cleanser, Night Cream, Under Eye Cream." },
    { q: "What is the return policy?", a: "30-day money-back guarantee. Full refund, no questions asked." },
    { q: "Is COD available?", a: "Yes. COD with ₹29 advance. Prepaid gets faster 1-2 day delivery." },
  ];

  return (
    <div className="min-h-screen bg-white" data-testid="homepage">
      {/* Brand Bar */}
      <div className="bg-emerald-800 text-emerald-100 text-center py-1.5 px-4">
        <p className="text-[10px] sm:text-xs tracking-wider font-medium">FREE SHIPPING | COD AVAILABLE | 30-DAY MONEY BACK | TRUSTED BY 50,000+</p>
      </div>

      {/* Hero — animated gradient bg */}
      <section className="relative overflow-hidden" data-testid="hero-section">
        <div className="absolute inset-0 bg-gradient-to-br from-stone-50 via-emerald-50/30 to-teal-50/20" />
        <div className="relative max-w-7xl mx-auto px-4 py-10 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-emerald-700 px-4 py-1.5 rounded-full text-xs font-semibold border border-emerald-200/60 shadow-sm mb-5">
                <Sparkles size={13} /> India's #1 Anti-Aging Brand
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-[1.1] tracking-tight mb-4" style={{hyphens:'none',wordBreak:'keep-all'}}>
                {settings.hero_title || "Complete Anti-Aging Solution"}
              </h1>
              <p className="text-sm sm:text-base text-gray-500 mb-7 max-w-md mx-auto lg:mx-0 leading-relaxed" style={{hyphens:'none'}}>
                {settings.hero_subtitle || "5 clinically formulated products designed exclusively to fight aging. Cleanse, treat, hydrate, protect and brighten."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link to="/shop" className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-7 py-3.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-emerald-200/50" data-testid="shop-now-btn">
                  Shop All Products <ChevronRight size={16} />
                </Link>
                <Link to="/consultation" className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-800 px-7 py-3.5 rounded-full text-sm font-bold transition-all border border-gray-200 shadow-sm">
                  Free Skin Analysis
                </Link>
              </div>
              {/* Stats with card backgrounds */}
              <div className="flex items-center justify-center lg:justify-start gap-3 mt-8">
                {[{ n: '50K+', d: 'Customers' }, { n: '4.8', d: 'Rating' }, { n: '5', d: 'Products' }].map((s, i) => (
                  <div key={i} className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-xl px-4 py-2.5 text-center shadow-sm">
                    <p className="text-lg font-black text-gray-900">{s.n}</p>
                    <p className="text-[9px] text-gray-500 font-medium tracking-wider uppercase">{s.d}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Desktop product showcase */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="grid grid-cols-3 gap-3">
                {products.slice(0, 3).map(p => (
                  <Link to={`/product/${p.slug}`} key={p.slug} className="bg-white rounded-2xl p-4 shadow-md hover:shadow-xl transition-all border border-gray-50 text-center group">
                    <div className="w-24 h-24 mx-auto mb-2 bg-stone-50 rounded-xl flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                      {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-20 h-20 object-contain" /> : <Sparkles className="w-8 h-8 text-emerald-300" />}
                    </div>
                    <p className="text-xs font-bold text-gray-800">{p.short_name}</p>
                    <p className="text-sm font-black text-emerald-600 mt-0.5">₹{p.prepaid_price}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Complete Kit — primary CTA */}
      {kit && (
        <section className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 py-10 sm:py-14 border-y border-amber-100/60" data-testid="complete-kit-section">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-5">
              <span className="inline-flex items-center gap-2 bg-amber-400 text-amber-900 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide mb-3"><Award size={13} /> BEST VALUE — SAVE {kit.discount_percent}%</span>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">{kit.name}</h2>
            </div>
            <div className="bg-white rounded-3xl shadow-lg p-5 sm:p-7 border border-amber-200/40">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
                <div className="aspect-[4/3] bg-gradient-to-br from-emerald-50 to-amber-50 rounded-2xl flex items-center justify-center overflow-hidden">
                  {settings.bundle_hero_image ? <img src={settings.bundle_hero_image} alt="Complete Kit" className="w-full h-full object-contain p-3" /> : (
                    <div className="text-center p-4"><div className="w-16 h-16 mx-auto mb-2 bg-amber-100 rounded-2xl flex items-center justify-center"><Package className="w-8 h-8 text-amber-600" /></div><p className="text-sm font-bold text-gray-700">5 Products</p></div>
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-amber-700 uppercase tracking-[0.15em] mb-2">What You Get</p>
                  <div className="space-y-2 mb-5">
                    {kit.product_slugs?.map(slug => {
                      const p = products.find(pr => pr.slug === slug);
                      return p ? (
                        <div key={slug} className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-stone-50 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-6 h-6 object-contain" /> : <Sparkles size={12} className="text-emerald-400" />}
                          </div>
                          <span className="text-sm text-gray-700 font-medium flex-1">{p.short_name}</span>
                          <span className="text-xs text-gray-400 line-through">₹{p.mrp}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-3 mb-4 text-center border border-emerald-100">
                    <p className="text-xs text-emerald-700 font-bold">You save ₹{(kit.mrp_total - kit.combo_prepaid_price)?.toLocaleString()}</p>
                  </div>
                  <div className="flex items-end gap-2 mb-4">
                    <span className="text-3xl font-black text-gray-900">₹{kit.combo_prepaid_price?.toLocaleString()}</span>
                    <span className="text-base text-gray-400 line-through mb-0.5">₹{kit.mrp_total?.toLocaleString()}</span>
                  </div>
                  <button onClick={() => handleAddCombo(kit.combo_id)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl text-sm shadow-lg shadow-emerald-200/50 transition-all" data-testid="add-complete-kit">
                    Add Complete Kit to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 py-10 sm:py-14" data-testid="products-section">
        <div className="text-center mb-8">
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em] mb-1">Our Range</p>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">Shop Individual Products</h2>
          <div className="w-12 h-0.5 bg-emerald-500 mx-auto mt-3 rounded-full" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {products.map(product => (
            <div key={product.slug} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300" data-testid={`product-card-${product.slug}`}>
              {product.badge && (
                <div className={`text-[9px] font-bold px-3 py-1 text-center tracking-wider ${product.badge === 'Bestseller' ? 'bg-amber-400 text-amber-900' : product.badge === 'New Launch' ? 'bg-rose-500 text-white' : 'bg-emerald-100 text-emerald-800'}`}>{product.badge.toUpperCase()}</div>
              )}
              <Link to={`/product/${product.slug}`} className="block">
                <div className="aspect-square bg-gradient-to-br from-stone-50 to-gray-50 flex items-center justify-center p-4 group-hover:scale-105 transition-transform duration-300">
                  {product.images?.[0] ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain" /> : (
                    <Sparkles className="w-10 h-10 text-emerald-200" />
                  )}
                </div>
              </Link>
              <div className="p-3">
                <Link to={`/product/${product.slug}`}><h3 className="font-bold text-gray-900 text-xs leading-tight mb-0.5 group-hover:text-emerald-700 line-clamp-2 transition-colors">{product.short_name}</h3></Link>
                <p className="text-[9px] text-gray-400 mb-1.5 line-clamp-1">{product.key_ingredients}</p>
                <div className="flex items-center gap-1 mb-1.5">
                  <Star size={10} className="fill-amber-400 text-amber-400" /><span className="text-[10px] font-semibold text-gray-700">{product.rating}</span>
                </div>
                <div className="mb-2.5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base font-black text-gray-900">₹{product.prepaid_price}</span>
                    <span className="text-[10px] text-gray-400 line-through">₹{product.mrp}</span>
                  </div>
                  <p className="text-[9px] text-emerald-600 font-semibold">Save ₹{product.mrp - product.prepaid_price}</p>
                </div>
                <button onClick={() => handleAddToCart(product.slug)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold py-2 rounded-xl transition-colors flex items-center justify-center gap-1" data-testid={`add-to-cart-${product.slug}`}>
                  <ShoppingCart size={11} /> Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Other Combos — compact with 16:9 images */}
      {otherCombos.length > 0 && (
        <section className="bg-stone-50 py-10 sm:py-14" data-testid="combos-section">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-6">
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em] mb-1">Bundle & Save</p>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">More Combo Deals</h2>
              <div className="w-12 h-0.5 bg-emerald-500 mx-auto mt-3 rounded-full" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {otherCombos.map(combo => (
                <div key={combo.combo_id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all" data-testid={`combo-card-${combo.combo_id}`}>
                  <div className="aspect-[16/9] bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center relative">
                    {settings[`combo_image_${combo.combo_id}`] ? <img src={settings[`combo_image_${combo.combo_id}`]} alt="" className="w-full h-full object-cover" /> : (
                      <div className="text-center"><Package className="w-10 h-10 mx-auto mb-1 text-emerald-300" /><p className="text-[10px] text-gray-400">{combo.name}</p></div>
                    )}
                    <span className="absolute top-3 right-3 bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">{combo.discount_percent}% OFF</span>
                    <span className="absolute top-3 left-3 bg-white/90 text-gray-700 text-[9px] font-bold px-2 py-0.5 rounded-full">{combo.product_slugs?.length} Products</span>
                  </div>
                  <div className="p-4">
                    {combo.badge && <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">{combo.badge}</span>}
                    <h3 className="text-base font-bold text-gray-900 mt-1.5">{combo.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{combo.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <span className="text-lg font-black text-gray-900">₹{combo.combo_prepaid_price?.toLocaleString()}</span>
                        <span className="text-xs text-gray-400 line-through ml-1.5">₹{combo.mrp_total?.toLocaleString()}</span>
                      </div>
                      <button onClick={() => handleAddCombo(combo.combo_id)} className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-emerald-700 flex items-center gap-1 transition-colors" data-testid={`add-combo-${combo.combo_id}`}><ShoppingCart size={11} /> Add</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works — Timeline */}
      <section className="max-w-4xl mx-auto px-4 py-10 sm:py-14">
        <div className="text-center mb-8">
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em] mb-1">Your Routine</p>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">Simple 3-Step System</h2>
          <div className="w-12 h-0.5 bg-emerald-500 mx-auto mt-3 rounded-full" />
        </div>
        <div className="relative">
          {/* Timeline line */}
          <div className="hidden sm:block absolute left-0 right-0 top-8 h-0.5 bg-emerald-100" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[{ step: '1', title: 'Cleanse', desc: 'Start with Gentle Cleanser to remove impurities and protect your skin barrier.', time: 'Morning & Night' },
              { step: '2', title: 'Treat & Hydrate', desc: 'Apply Serum + Night Cream to target wrinkles, dark spots, and fine lines.', time: 'Based on routine' },
              { step: '3', title: 'Protect', desc: 'Finish with SPF 50 Sunscreen to shield from UV damage, the #1 cause of aging.', time: 'Every morning' }
            ].map((item, i) => (
              <div key={i} className="text-center relative">
                <div className="w-14 h-14 bg-emerald-600 text-white text-lg font-black rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200/50 relative z-10">{item.step}</div>
                <h3 className="font-bold text-gray-900 text-base mb-1.5">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-2">{item.desc}</p>
                <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-3 py-1 rounded-full">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clinical Results — gradient with glow numbers */}
      <section className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-6">
            <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-[0.2em] mb-1">Clinically Tested</p>
            <h2 className="text-xl sm:text-2xl font-black text-white">Proven Results, Real Science</h2>
            <p className="text-xs text-emerald-300 mt-2">Based on clinical study with 500+ participants</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[{ s: '94%', d: 'Reduced wrinkles in 4 weeks' }, { s: '89%', d: 'Brighter, even skin tone' }, { s: '96%', d: 'Improved skin hydration' }, { s: '91%', d: 'Firmer, younger skin' }].map((r, i) => (
              <div key={i} className="text-center bg-white/10 backdrop-blur-sm rounded-2xl py-5 px-3 border border-white/10">
                <p className="text-3xl sm:text-4xl font-black text-emerald-300">{r.s}</p>
                <p className="text-[10px] text-emerald-200 mt-1.5 leading-tight">{r.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section className="max-w-7xl mx-auto px-4 py-10 sm:py-14">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">Why Choose Celesta Glow?</h2>
          <div className="w-12 h-0.5 bg-emerald-500 mx-auto mt-3 rounded-full" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[{ icon: Shield, title: 'Clinically Tested', desc: 'Dermatologist approved', color: 'emerald' },
            { icon: Truck, title: 'Free Shipping', desc: 'All India delivery', color: 'blue' },
            { icon: Award, title: 'Made in India', desc: 'CMISO 9001:2015', color: 'amber' },
            { icon: Clock, title: '30-Day Guarantee', desc: 'Full money back', color: 'purple' }
          ].map((item, i) => (
            <div key={i} className="text-center p-5 rounded-2xl bg-gradient-to-b from-white to-stone-50 border border-stone-100 shadow-sm hover:shadow-md transition-all">
              <div className={`w-12 h-12 mx-auto mb-3 bg-${item.color}-50 rounded-xl flex items-center justify-center`}>
                <item.icon className={`w-6 h-6 text-${item.color}-600`} />
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-0.5">{item.title}</h3>
              <p className="text-[10px] text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Dermatologist */}
      <DermatologistSection />

      {/* FAQ — gradient bg */}
      <section className="bg-gradient-to-b from-stone-50 to-white py-10 sm:py-14" data-testid="faq-section">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">Frequently Asked Questions</h2>
            <div className="w-12 h-0.5 bg-emerald-500 mx-auto mt-3 rounded-full" />
          </div>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className={`rounded-2xl overflow-hidden transition-all ${openFaq === i ? 'bg-emerald-50 border border-emerald-100 shadow-sm' : 'bg-white border border-gray-100'}`}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left">
                  <span className="font-semibold text-gray-900 text-sm pr-4">{faq.q}</span>
                  <ChevronDown size={16} className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">{faq.a}</div>}
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
          <Link to="/consultation" className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200/50">
            Get Personalized Recommendation <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-emerald-700 text-white py-10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-xl sm:text-2xl font-black mb-2">Start Your Anti-Aging Journey</h2>
          <p className="text-emerald-200 text-sm mb-6">Complete routine from ₹499. Free shipping. 30-day guarantee.</p>
          <Link to="/shop" className="inline-flex items-center gap-2 bg-white text-emerald-700 px-8 py-3.5 rounded-full font-bold text-sm hover:bg-emerald-50 transition-colors shadow-lg">
            Shop Now <ChevronRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Homepage;
