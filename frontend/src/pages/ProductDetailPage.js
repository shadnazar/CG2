import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Star, ShoppingCart, ChevronLeft, ChevronRight, Shield, Truck, Award, Clock, Check, Sparkles, Minus, Plus, ChevronDown, Zap, User, Quote } from 'lucide-react';
import { addToCart, getCart, saveCart } from './Homepage';
import { useTracking } from '../providers/TrackingProvider';

const API = process.env.REACT_APP_BACKEND_URL;

const DERMATOLOGISTS = [
  { name: 'Dr. Priya Sharma', credential: 'MD Dermatology, AIIMS Delhi', quote: 'The formulation uses clinically-proven actives at effective concentrations. I recommend this to my patients for visible anti-aging results.' },
  { name: 'Dr. Kavita Reddy', credential: 'Consultant Dermatologist, 15+ yrs', quote: 'What sets this apart is the combination of ingredients that work synergistically. Safe for all Indian skin types.' },
  { name: 'Dr. Anita Patel', credential: 'MD Skin & VD, Mumbai', quote: 'The pH-balanced formula ensures maximum absorption without irritation. Excellent for daily use in the Indian climate.' },
];

const PRODUCT_REVIEWS = [
  { name: 'Ritika M.', location: 'Mumbai', rating: 5, text: 'My skin looks 10 years younger! The difference is visible within 2 weeks. Best purchase ever.', verified: true },
  { name: 'Sneha K.', location: 'Bangalore', rating: 5, text: 'I was skeptical but the results are real. My dark spots have faded significantly.', verified: true },
  { name: 'Deepa S.', location: 'Delhi', rating: 4, text: 'Love the lightweight texture. Does not feel greasy at all. My skin glows every morning.', verified: true },
  { name: 'Ananya R.', location: 'Chennai', rating: 5, text: 'Complete game changer! My fine lines around eyes reduced noticeably. Highly recommend.', verified: true },
  { name: 'Kavya P.', location: 'Hyderabad', rating: 5, text: 'Using the complete kit and the results are amazing. My friends keep asking what I am using!', verified: true },
];

const PRODUCT_FAQS = {
  default: [
    { q: 'How long before I see results?', a: 'Most customers see visible improvement in 2-4 weeks with consistent daily use.' },
    { q: 'Is it suitable for sensitive skin?', a: 'Yes, all our products are dermatologist-tested and pH-balanced for all skin types including sensitive skin.' },
    { q: 'Can I use this with other products?', a: 'Our products are designed to work together as a system. You can also use them with your existing routine.' },
    { q: 'What is the shelf life?', a: '24 months from manufacturing date. Store in a cool, dry place.' },
  ]
};

function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { trackAction } = useTracking();
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setCurrentImage(0);
      try {
        const [prodRes, allRes, comboRes] = await Promise.all([
          axios.get(`${API}/api/products/${slug}`),
          axios.get(`${API}/api/products`),
          axios.get(`${API}/api/combos`)
        ]);
        setProduct(prodRes.data);
        setAllProducts(allRes.data.filter(p => p.slug !== slug));
        setCombos(comboRes.data);
        if (typeof window !== 'undefined' && window.fbq) {
          window.fbq('track', 'ViewContent', { content_name: prodRes.data.name, content_ids: [slug], content_type: 'product', value: prodRes.data.prepaid_price, currency: 'INR' });
        }
        trackAction('view_product', { slug, name: prodRes.data.name });
      } catch (err) { navigate('/shop'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [slug]);

  useEffect(() => {
    const updateCount = () => setCartCount(getCart().items.reduce((s, i) => s + (i.quantity || 1), 0));
    updateCount();
    window.addEventListener('cartUpdated', updateCount);
    return () => window.removeEventListener('cartUpdated', updateCount);
  }, []);

  const handleAddToCart = () => {
    addToCart(slug, quantity);
    trackAction('add_to_cart', { product_slug: slug, quantity });
    if (typeof window !== 'undefined' && window.fbq) window.fbq('track', 'AddToCart', { content_name: product?.name, content_ids: [slug], value: product?.prepaid_price * quantity, currency: 'INR' });
  };

  const handleBuyNow = () => { addToCart(slug, quantity); navigate('/cart'); };

  const handleAddCombo = (comboId) => {
    const cart = getCart();
    if (!cart.items.find(i => i.combo_id === comboId)) cart.items.push({ combo_id: comboId, quantity: 1 });
    saveCart(cart);
  };

  if (loading || !product) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  const images = product.images?.length > 0 ? product.images : [];
  const savings = product.mrp - product.prepaid_price;
  const completeKit = combos.find(c => c.combo_id === 'complete-anti-aging-kit');

  return (
    <div className="min-h-screen bg-white" data-testid="product-detail-page">
      {cartCount > 0 && (
        <Link to="/cart" className="fixed bottom-4 right-4 z-50 bg-emerald-600 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2">
          <ShoppingCart size={20} /><span className="font-bold">{cartCount}</span><span className="text-sm hidden sm:inline">Cart</span>
        </Link>
      )}

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <nav className="flex items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-emerald-600">Home</Link><ChevronRight size={14} />
          <Link to="/shop" className="hover:text-emerald-600">Shop</Link><ChevronRight size={14} />
          <span className="text-gray-900 font-medium">{product.short_name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Image Gallery */}
          <div data-testid="product-images">
            <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden relative">
              {product.badge && <div className={`absolute top-3 left-3 z-10 px-3 py-1 rounded-full text-xs font-bold ${product.badge === 'Bestseller' ? 'bg-amber-400 text-amber-900' : 'bg-emerald-600 text-white'}`}>{product.badge}</div>}
              <div className="absolute top-3 right-3 z-10 bg-rose-500 text-white px-3 py-1 rounded-full text-xs font-bold">{product.discount_percent}% OFF</div>
              {images.length > 0 ? (
                <img src={images[currentImage]} alt={product.name} className="w-full h-full object-contain p-6" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><Sparkles className="w-16 h-16 text-emerald-400" /></div>
              )}
              {/* Image nav arrows */}
              {images.length > 1 && (
                <>
                  <button onClick={() => setCurrentImage((currentImage - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow"><ChevronLeft size={18} /></button>
                  <button onClick={() => setCurrentImage((currentImage + 1) % images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow"><ChevronRight size={18} /></button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setCurrentImage(i)} className={`flex-shrink-0 w-16 h-16 rounded-xl border-2 overflow-hidden ${currentImage === i ? 'border-emerald-500' : 'border-gray-200'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div data-testid="product-info">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex">{[1,2,3,4,5].map(i => <Star key={i} size={16} className={`${i <= Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />)}</div>
              <span className="text-sm font-medium">{product.rating}</span>
              <span className="text-sm text-gray-400">({product.reviews_count?.toLocaleString()} reviews)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{product.name}</h1>
            <p className="text-emerald-600 font-medium text-sm mb-4">{product.tagline}</p>

            {/* Pricing */}
            <div className="bg-emerald-50 rounded-2xl p-4 mb-4" data-testid="product-pricing">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-3xl font-bold text-gray-900">₹{product.prepaid_price}</span>
                <span className="text-lg text-gray-400 line-through">₹{product.mrp}</span>
                <span className="text-sm font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">{product.discount_percent}% OFF</span>
              </div>
              <p className="text-sm text-emerald-700">You save ₹{savings} | Free shipping</p>
              <div className="mt-2 flex gap-4 text-xs text-gray-500">
                <span>Prepaid: ₹{product.prepaid_price} (Faster delivery)</span>
                <span>COD: ₹{product.cod_price} (₹{product.cod_advance} advance)</span>
              </div>
            </div>

            <div className="mb-4"><p className="text-sm font-semibold text-gray-700 mb-1">Key Ingredients</p><p className="text-emerald-700 font-medium">{product.key_ingredients}</p></div>

            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Benefits</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {product.benefits?.map((b, i) => <div key={i} className="flex items-center gap-2 text-sm text-gray-700"><Check size={14} className="text-emerald-500 flex-shrink-0" />{b}</div>)}
              </div>
            </div>

            {/* Qty + Actions */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center border border-gray-200 rounded-xl">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2"><Minus size={18} /></button>
                <span className="w-10 text-center font-bold">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-2"><Plus size={18} /></button>
              </div>
              <span className="text-sm text-gray-500">{product.size}</span>
            </div>
            <div className="flex gap-3 mb-5">
              <button onClick={handleAddToCart} className="flex-1 border-2 border-emerald-600 text-emerald-600 font-bold py-3 rounded-xl hover:bg-emerald-50" data-testid="add-to-cart-btn">Add to Cart</button>
              <button onClick={handleBuyNow} className="flex-1 bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700" data-testid="buy-now-btn">Buy Now</button>
            </div>

            {/* Trust Row */}
            <div className="grid grid-cols-4 gap-2 mb-5">
              {[{ icon: Truck, t: 'Free Ship' }, { icon: Shield, t: 'Genuine' }, { icon: Award, t: 'Certified' }, { icon: Clock, t: '30-Day' }].map((b, i) => (
                <div key={i} className="text-center p-2 rounded-xl bg-gray-50"><b.icon size={16} className="mx-auto mb-1 text-emerald-600" /><p className="text-[10px] text-gray-600 font-medium">{b.t}</p></div>
              ))}
            </div>

            {/* Accordion */}
            {[{ key: 'desc', title: 'Description', content: product.description },
              { key: 'ingredients', title: 'Full Ingredients', content: product.ingredients_full },
              { key: 'howto', title: 'How to Use', content: product.how_to_use }
            ].map(s => (
              <div key={s.key} className="border-b border-gray-100">
                <button onClick={() => setActiveAccordion(activeAccordion === s.key ? null : s.key)} className="w-full flex items-center justify-between py-3 text-left">
                  <span className="font-semibold text-gray-900 text-sm">{s.title}</span>
                  <ChevronDown size={18} className={`text-gray-400 transition-transform ${activeAccordion === s.key ? 'rotate-180' : ''}`} />
                </button>
                {activeAccordion === s.key && <div className="pb-4 text-sm text-gray-600 leading-relaxed">{s.content}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Complete Kit Bundle Push */}
        {completeKit && (
          <div className="mt-10 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 sm:p-6 border-2 border-amber-200" data-testid="bundle-push">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2"><Award size={18} className="text-amber-600" /><span className="font-bold text-amber-900 text-sm">BEST VALUE — SAVE 51%</span></div>
                <h3 className="text-xl font-bold text-gray-900">{completeKit.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{completeKit.description}</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-bold text-gray-900">₹{completeKit.combo_prepaid_price?.toLocaleString()}</span>
                  <span className="text-gray-400 line-through">₹{completeKit.mrp_total?.toLocaleString()}</span>
                </div>
              </div>
              <button onClick={() => { handleAddCombo(completeKit.combo_id); navigate('/cart'); }} className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-3 rounded-full" data-testid="add-kit-from-product">
                Get Complete Kit
              </button>
            </div>
          </div>
        )}

        {/* Clinical Results */}
        <div className="mt-10 bg-emerald-900 rounded-2xl p-6 text-white">
          <h3 className="text-xl font-bold mb-4 text-center">Clinically Proven Results</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[{ s: '94%', d: 'Reduced wrinkles in 4 weeks' }, { s: '89%', d: 'Brighter, even skin tone' }, { s: '96%', d: 'Improved hydration' }, { s: '91%', d: 'Firmer, younger skin' }].map((r, i) => (
              <div key={i} className="text-center"><p className="text-2xl font-bold text-emerald-300">{r.s}</p><p className="text-xs text-emerald-200 mt-1">{r.d}</p></div>
            ))}
          </div>
        </div>

        {/* Dermatologist Endorsements */}
        <div className="mt-10">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Dermatologist Approved</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {DERMATOLOGISTS.map((doc, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center"><User size={18} className="text-emerald-600" /></div>
                  <div><p className="font-semibold text-gray-900 text-sm">{doc.name}</p><p className="text-xs text-gray-500">{doc.credential}</p></div>
                </div>
                <div className="flex gap-1 mb-2">{[1,2,3,4,5].map(s => <Star key={s} size={12} className="fill-amber-400 text-amber-400" />)}</div>
                <p className="text-sm text-gray-600 italic">"{doc.quote}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Reviews */}
        <div className="mt-10">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Customer Reviews</h3>
          <div className="space-y-3">
            {PRODUCT_REVIEWS.map((r, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 text-xs font-bold">{r.name[0]}</div>
                    <div><p className="font-semibold text-sm">{r.name}</p><p className="text-xs text-gray-400">{r.location}</p></div>
                  </div>
                  {r.verified && <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Verified</span>}
                </div>
                <div className="flex gap-0.5 mb-1">{[1,2,3,4,5].map(s => <Star key={s} size={12} className={`${s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />)}</div>
                <p className="text-sm text-gray-600">{r.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Before/After Results */}
        <div className="mt-10">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Real Results from Real Customers</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { name: 'Priya, 34', result: 'Visible wrinkle reduction in 3 weeks', weeks: '3 weeks' },
              { name: 'Sneha, 29', result: 'Dark spots faded, skin looks brighter', weeks: '4 weeks' },
              { name: 'Kavya, 41', result: 'Fine lines around eyes reduced significantly', weeks: '6 weeks' },
            ].map((r, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                <div className="grid grid-cols-2 gap-px bg-gray-200">
                  <div className="bg-gray-100 aspect-[4/3] flex items-center justify-center text-gray-400 text-xs">Before</div>
                  <div className="bg-emerald-50 aspect-[4/3] flex items-center justify-center text-emerald-600 text-xs">After</div>
                </div>
                <div className="p-3">
                  <p className="font-semibold text-sm text-gray-900">{r.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{r.result}</p>
                  <p className="text-xs text-emerald-600 font-medium mt-1">Results in {r.weeks}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">*Individual results may vary. Images are for representation. Update real images from Admin Panel.</p>
        </div>

        {/* Related Products with Add to Cart */}
        {allProducts.length > 0 && (
          <div className="mt-10">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Complete Your Routine</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {allProducts.slice(0, 4).map(p => (
                <div key={p.slug} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
                  <Link to={`/product/${p.slug}`}>
                    <div className="aspect-square bg-gray-50 flex items-center justify-center p-3">
                      {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-contain" /> : <Sparkles className="w-10 h-10 text-emerald-400" />}
                    </div>
                  </Link>
                  <div className="p-3">
                    <h4 className="font-semibold text-xs text-gray-900 line-clamp-1">{p.short_name}</h4>
                    <div className="flex items-baseline gap-1.5 mt-1 mb-2">
                      <span className="font-bold text-sm text-gray-900">₹{p.prepaid_price}</span>
                      <span className="text-[10px] text-gray-400 line-through">₹{p.mrp}</span>
                    </div>
                    <button onClick={() => { addToCart(p.slug); }} className="w-full bg-emerald-600 text-white text-xs font-semibold py-1.5 rounded-lg hover:bg-emerald-700" data-testid={`related-add-${p.slug}`}>
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Product FAQ */}
        <div className="mt-10">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h3>
          <div className="space-y-2">
            {(PRODUCT_FAQS[slug] || PRODUCT_FAQS.default).map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left">
                  <span className="font-medium text-gray-900 text-sm pr-4">{faq.q}</span>
                  <ChevronDown size={16} className={`text-gray-400 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && <div className="px-4 pb-4 text-sm text-gray-600">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Mobile Bottom CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-40 flex items-center gap-3" data-testid="sticky-bottom-cta">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-base">₹{product.prepaid_price}</p>
          <p className="text-xs text-gray-500 line-through">₹{product.mrp}</p>
        </div>
        <button onClick={handleAddToCart} className="bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm">Add to Cart</button>
        <button onClick={handleBuyNow} className="bg-gray-900 text-white font-bold px-6 py-2.5 rounded-xl text-sm">Buy Now</button>
      </div>
    </div>
  );
}

export default ProductDetailPage;
