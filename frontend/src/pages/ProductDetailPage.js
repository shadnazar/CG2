import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Star, ChevronLeft, ChevronRight, Shield, Truck, Award, Clock, Check, Sparkles, Minus, Plus, ChevronDown, Zap, User, FlaskConical, Package } from 'lucide-react';
import { addToCart, getCart, saveCart } from './Homepage';
import { useTracking } from '../providers/TrackingProvider';

const API = process.env.REACT_APP_BACKEND_URL;

const REVIEWS = [
  { name: 'Ritika M.', loc: 'Mumbai', r: 5, t: 'My skin looks 10 years younger! The difference is visible within 2 weeks.', v: true },
  { name: 'Sneha K.', loc: 'Bangalore', r: 5, t: 'I was skeptical but the results are real. Dark spots faded significantly.', v: true },
  { name: 'Deepa S.', loc: 'Delhi', r: 4, t: 'Love the lightweight texture. Not greasy. My skin glows every morning.', v: true },
  { name: 'Ananya R.', loc: 'Chennai', r: 5, t: 'Complete game changer for fine lines. Friends keep asking my secret!', v: true },
];

const FAQS = [
  { q: 'How long before I see results?', a: 'Most customers see visible improvement in 2-4 weeks with consistent daily use.' },
  { q: 'Is it suitable for sensitive skin?', a: 'Yes. Dermatologist-tested, pH-balanced for all skin types including sensitive skin.' },
  { q: 'Can I use this with other products?', a: 'Our products are designed to work together. You can also use them with your existing routine.' },
  { q: 'What is the shelf life?', a: '24 months from manufacturing. Store in a cool, dry place.' },
];

function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { trackAction } = useTracking();
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const [openSection, setOpenSection] = useState('desc');
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true); setImgIdx(0);
      try {
        const [p, all, c] = await Promise.all([
          axios.get(`${API}/api/products/${slug}`), axios.get(`${API}/api/products`), axios.get(`${API}/api/combos`)
        ]);
        setProduct(p.data); setAllProducts(all.data.filter(x => x.slug !== slug)); setCombos(c.data);
        if (window.fbq) window.fbq('track', 'ViewContent', { content_name: p.data.name, content_ids: [slug], content_type: 'product', value: p.data.prepaid_price, currency: 'INR' });
        trackAction('view_product', { slug });
      } catch { navigate('/shop'); }
      setLoading(false);
    };
    fetch();
  }, [slug]);

  const doAdd = () => { addToCart(slug, qty); trackAction('add_to_cart', { product_slug: slug, quantity: qty }); if (window.fbq) window.fbq('track', 'AddToCart', { content_name: product?.name, content_ids: [slug], value: product?.prepaid_price * qty, currency: 'INR' }); };
  const doBuy = () => { addToCart(slug, qty); navigate('/cart'); };
  const addCombo = (id) => { const c = getCart(); if (!c.items.find(i => i.combo_id === id)) c.items.push({ combo_id: id, quantity: 1 }); saveCart(c); navigate('/cart'); };

  if (loading || !product) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  const imgs = product.images?.length > 0 ? product.images : [];
  const kit = combos.find(c => c.combo_id === 'complete-anti-aging-kit');

  return (
    <div className="min-h-screen bg-white" data-testid="product-detail-page">
      {/* Urgency Bar — only on product pages */}
      <div className="bg-rose-600 text-white py-1.5 px-4 text-center">
        <p className="text-[11px] sm:text-xs font-medium">Limited Time Offer | Up to {product.discount_percent}% OFF | Free Shipping</p>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-2">
        <nav className="flex items-center gap-1.5 text-xs text-gray-400">
          <Link to="/" className="hover:text-emerald-600">Home</Link><ChevronRight size={12} />
          <Link to="/shop" className="hover:text-emerald-600">Shop</Link><ChevronRight size={12} />
          <span className="text-gray-700">{product.short_name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-24 lg:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          {/* Image Gallery */}
          <div>
            <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden relative">
              {product.badge && <div className={`absolute top-3 left-3 z-10 px-3 py-1 rounded-full text-[10px] font-bold ${product.badge === 'Bestseller' ? 'bg-amber-400 text-amber-900' : 'bg-emerald-600 text-white'}`}>{product.badge}</div>}
              <div className="absolute top-3 right-3 z-10 bg-rose-500 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold">{product.discount_percent}% OFF</div>
              {imgs.length > 0 ? (
                <img src={imgs[imgIdx]} alt={product.name} className="w-full h-full object-contain p-4" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><Sparkles className="w-16 h-16 text-emerald-300" /></div>
              )}
              {imgs.length > 1 && (
                <>
                  <button onClick={() => setImgIdx((imgIdx - 1 + imgs.length) % imgs.length)} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm"><ChevronLeft size={16} /></button>
                  <button onClick={() => setImgIdx((imgIdx + 1) % imgs.length)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm"><ChevronRight size={16} /></button>
                </>
              )}
            </div>
            {imgs.length > 1 && (
              <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                {imgs.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)} className={`flex-shrink-0 w-14 h-14 rounded-lg border-2 overflow-hidden transition-all ${imgIdx === i ? 'border-emerald-500 shadow-sm' : 'border-gray-100 opacity-60'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {/* Rating */}
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="flex">{[1,2,3,4,5].map(i => <Star key={i} size={14} className={i <= Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />)}</div>
              <span className="text-xs font-semibold text-gray-700">{product.rating}</span>
              <span className="text-xs text-gray-400">({product.reviews_count?.toLocaleString()} reviews)</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">{product.name}</h1>
            <p className="text-emerald-600 font-medium text-xs mt-1">{product.tagline} | {product.size}</p>

            {/* Pricing Card */}
            <div className="mt-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100" data-testid="product-pricing">
              <div className="flex items-end gap-3">
                <span className="text-3xl font-extrabold text-gray-900">₹{product.prepaid_price}</span>
                <span className="text-base text-gray-400 line-through mb-0.5">₹{product.mrp}</span>
                <span className="text-xs font-bold text-white bg-rose-500 px-2 py-0.5 rounded mb-1">SAVE ₹{product.mrp - product.prepaid_price}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="bg-white rounded-lg p-2.5 border border-emerald-200">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Prepaid</p>
                  <p className="text-base font-bold text-emerald-700">₹{product.prepaid_price}</p>
                  <p className="text-[10px] text-emerald-600 font-medium">Faster Delivery 1-2 days</p>
                </div>
                <div className="bg-white rounded-lg p-2.5 border border-gray-200">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Cash on Delivery</p>
                  <p className="text-base font-bold text-gray-900">₹{product.cod_price}</p>
                  <p className="text-[10px] text-gray-500">₹{product.cod_advance} advance only</p>
                </div>
              </div>
            </div>

            {/* Key Ingredients — styled */}
            <div className="mt-4 bg-purple-50 rounded-xl p-4 border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <FlaskConical size={16} className="text-purple-600" />
                <p className="text-xs font-bold text-purple-800 uppercase tracking-wider">Key Ingredients</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {product.key_ingredients?.split('+').map((ing, i) => (
                  <span key={i} className="bg-white text-purple-700 text-xs font-medium px-3 py-1.5 rounded-full border border-purple-200">{ing.trim()}</span>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div className="mt-4">
              <p className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">Benefits</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {product.benefits?.map((b, i) => (
                  <div key={i} className="flex items-start gap-2 bg-gray-50 rounded-lg px-3 py-2">
                    <Check size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{b}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Qty + Actions */}
            <div className="mt-4 flex items-center gap-3">
              <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2"><Minus size={16} /></button>
                <span className="w-8 text-center font-bold text-sm">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="px-3 py-2"><Plus size={16} /></button>
              </div>
            </div>
            <div className="mt-3 flex gap-2.5">
              <button onClick={doAdd} className="flex-1 border-2 border-emerald-600 text-emerald-600 font-bold py-3 rounded-xl hover:bg-emerald-50 text-sm transition-colors" data-testid="add-to-cart-btn">Add to Cart</button>
              <button onClick={doBuy} className="flex-1 bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 text-sm transition-colors" data-testid="buy-now-btn">Buy Now</button>
            </div>

            {/* Trust Row */}
            <div className="mt-4 grid grid-cols-4 gap-1.5">
              {[{ icon: Truck, t: 'Free Shipping' }, { icon: Shield, t: 'Genuine Product' }, { icon: Award, t: 'Lab Certified' }, { icon: Clock, t: '30-Day Return' }].map((b, i) => (
                <div key={i} className="text-center bg-gray-50 rounded-lg py-2 px-1">
                  <b.icon size={16} className="mx-auto mb-0.5 text-emerald-600" />
                  <p className="text-[9px] font-medium text-gray-600 leading-tight">{b.t}</p>
                </div>
              ))}
            </div>

            {/* Description / Ingredients / How to Use */}
            <div className="mt-5 border-t border-gray-100 pt-4">
              {[{ key: 'desc', title: 'Description', content: product.description },
                { key: 'ing', title: 'Full Ingredients', content: product.ingredients_full },
                { key: 'how', title: 'How to Use', content: product.how_to_use }
              ].map(s => (
                <div key={s.key} className="border-b border-gray-50">
                  <button onClick={() => setOpenSection(openSection === s.key ? null : s.key)} className="w-full flex items-center justify-between py-3">
                    <span className="font-semibold text-gray-900 text-sm">{s.title}</span>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${openSection === s.key ? 'rotate-180' : ''}`} />
                  </button>
                  {openSection === s.key && (
                    <div className="pb-3 text-sm text-gray-600 leading-relaxed">{s.content}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Complete Kit Push */}
        {kit && (
          <div className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 sm:p-5 border border-amber-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1"><Award size={16} className="text-amber-600" /><span className="text-xs font-bold text-amber-800">BEST VALUE</span></div>
                <h3 className="text-lg font-bold text-gray-900">{kit.name}</h3>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-bold text-gray-900">₹{kit.combo_prepaid_price?.toLocaleString()}</span>
                  <span className="text-sm text-gray-400 line-through">₹{kit.mrp_total?.toLocaleString()}</span>
                  <span className="text-xs font-bold text-rose-600">{kit.discount_percent}% OFF</span>
                </div>
              </div>
              <button onClick={() => addCombo(kit.combo_id)} className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm" data-testid="add-kit-from-product">Get Complete Kit</button>
            </div>
          </div>
        )}

        {/* Clinical Stats */}
        <div className="mt-8 bg-emerald-900 rounded-2xl p-5 text-white">
          <h3 className="text-base font-bold mb-3 text-center">Clinically Proven Results</h3>
          <div className="grid grid-cols-4 gap-2">
            {[{ s: '94%', d: 'Reduced wrinkles' }, { s: '89%', d: 'Brighter tone' }, { s: '96%', d: 'Better hydration' }, { s: '91%', d: 'Firmer skin' }].map((r, i) => (
              <div key={i} className="text-center"><p className="text-xl sm:text-2xl font-bold text-emerald-300">{r.s}</p><p className="text-[9px] text-emerald-200 mt-0.5">{r.d}</p></div>
            ))}
          </div>
        </div>

        {/* Dermatologist */}
        <div className="mt-8">
          <h3 className="text-base font-bold text-gray-900 mb-3">Dermatologist Approved</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[{ n: 'Dr. Priya Sharma', c: 'MD Dermatology, AIIMS', q: 'Clinically-proven actives at effective concentrations. I recommend this to my patients.' },
              { n: 'Dr. Kavita Reddy', c: '15+ Years Experience', q: 'Ingredients work synergistically. Safe for all Indian skin types.' },
              { n: 'Dr. Anita Patel', c: 'MD Skin & VD', q: 'pH-balanced formula ensures maximum absorption without irritation.' }
            ].map((d, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3.5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 text-xs font-bold">{d.n[4]}</div>
                  <div><p className="font-semibold text-gray-900 text-xs">{d.n}</p><p className="text-[10px] text-gray-500">{d.c}</p></div>
                </div>
                <div className="flex gap-0.5 mb-1.5">{[1,2,3,4,5].map(s => <Star key={s} size={10} className="fill-amber-400 text-amber-400" />)}</div>
                <p className="text-xs text-gray-600 italic leading-relaxed">"{d.q}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Reviews */}
        <div className="mt-8">
          <h3 className="text-base font-bold text-gray-900 mb-3">Customer Reviews</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {REVIEWS.map((r, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 text-[10px] font-bold">{r.name[0]}</div>
                    <div><p className="font-semibold text-xs text-gray-900">{r.name}</p><p className="text-[9px] text-gray-400">{r.loc}</p></div>
                  </div>
                  {r.v && <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium">Verified</span>}
                </div>
                <div className="flex gap-0.5 mb-1">{[1,2,3,4,5].map(s => <Star key={s} size={10} className={s <= r.r ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />)}</div>
                <p className="text-xs text-gray-600 leading-relaxed">{r.t}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Related Products with Add to Cart */}
        {allProducts.length > 0 && (
          <div className="mt-8">
            <h3 className="text-base font-bold text-gray-900 mb-3">Complete Your Routine</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {allProducts.slice(0, 4).map(p => (
                <div key={p.slug} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                  <Link to={`/product/${p.slug}`}>
                    <div className="aspect-square bg-gray-50 flex items-center justify-center p-2">
                      {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-contain" /> : <Sparkles className="w-8 h-8 text-emerald-300" />}
                    </div>
                  </Link>
                  <div className="p-2.5">
                    <p className="font-semibold text-[10px] text-gray-900 line-clamp-1">{p.short_name}</p>
                    <div className="flex items-baseline gap-1 mt-0.5 mb-1.5">
                      <span className="font-bold text-sm text-gray-900">₹{p.prepaid_price}</span>
                      <span className="text-[9px] text-gray-400 line-through">₹{p.mrp}</span>
                    </div>
                    <button onClick={() => addToCart(p.slug)} className="w-full bg-emerald-600 text-white text-[10px] font-semibold py-1.5 rounded-lg hover:bg-emerald-700" data-testid={`related-add-${p.slug}`}>Add to Cart</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ */}
        <div className="mt-8">
          <h3 className="text-base font-bold text-gray-900 mb-3">Frequently Asked Questions</h3>
          <div className="space-y-1.5">
            {FAQS.map((f, i) => (
              <div key={i} className="bg-gray-50 rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-3.5 text-left">
                  <span className="font-medium text-gray-900 text-sm pr-3">{f.q}</span>
                  <ChevronDown size={16} className={`text-gray-400 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && <div className="px-3.5 pb-3.5 text-sm text-gray-600">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Mobile Bottom CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2.5 z-40 flex items-center gap-2 shadow-lg" data-testid="sticky-bottom-cta">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900">₹{product.prepaid_price} <span className="text-xs text-gray-400 line-through font-normal">₹{product.mrp}</span></p>
        </div>
        <button onClick={doAdd} className="bg-white border-2 border-emerald-600 text-emerald-600 font-bold px-4 py-2 rounded-lg text-xs">Add</button>
        <button onClick={doBuy} className="bg-emerald-600 text-white font-bold px-5 py-2 rounded-lg text-xs">Buy Now</button>
      </div>
    </div>
  );
}

export default ProductDetailPage;
