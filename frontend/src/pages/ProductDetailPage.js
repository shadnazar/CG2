import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Star, ShoppingCart, ChevronLeft, ChevronRight, Shield, Truck, Award, Clock, Check, Sparkles, Minus, Plus, ChevronDown } from 'lucide-react';
import { addToCart, getCart } from './Homepage';
import { useTracking } from '../providers/TrackingProvider';

const API = process.env.REACT_APP_BACKEND_URL;

function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { trackAction } = useTracking();
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prodRes, allRes] = await Promise.all([
          axios.get(`${API}/api/products/${slug}`),
          axios.get(`${API}/api/products`)
        ]);
        setProduct(prodRes.data);
        setAllProducts(allRes.data.filter(p => p.slug !== slug));
        
        if (typeof window !== 'undefined' && window.fbq) {
          window.fbq('track', 'ViewContent', {
            content_name: prodRes.data.name,
            content_ids: [slug],
            content_type: 'product',
            value: prodRes.data.prepaid_price,
            currency: 'INR'
          });
        }
        trackAction('view_product', { slug, name: prodRes.data.name });
      } catch (err) {
        console.error(err);
        navigate('/shop');
      } finally { setLoading(false); }
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
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'AddToCart', { content_name: product?.name, content_ids: [slug], content_type: 'product', value: product?.prepaid_price * quantity, currency: 'INR' });
    }
  };

  const handleBuyNow = () => {
    addToCart(slug, quantity);
    trackAction('buy_now', { product_slug: slug, quantity });
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'InitiateCheckout', { content_name: product?.name, value: product?.prepaid_price * quantity, currency: 'INR' });
    }
    navigate('/cart');
  };

  if (loading || !product) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  const images = product.images?.length > 0 ? product.images : [];
  const savings = product.mrp - product.prepaid_price;

  return (
    <div className="min-h-screen bg-white" data-testid="product-detail-page">
      {/* Floating Cart */}
      {cartCount > 0 && (
        <Link to="/cart" className="fixed bottom-4 right-4 z-50 bg-emerald-600 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 hover:bg-emerald-700 transition-all">
          <ShoppingCart size={20} /><span className="font-bold">{cartCount}</span>
        </Link>
      )}

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <nav className="flex items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-emerald-600">Home</Link>
          <ChevronRight size={14} />
          <Link to="/shop" className="hover:text-emerald-600">Shop</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium">{product.short_name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div data-testid="product-images">
            <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden relative">
              {product.badge && (
                <div className={`absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-xs font-bold ${product.badge === 'Bestseller' ? 'bg-amber-400 text-amber-900' : 'bg-emerald-600 text-white'}`}>
                  {product.badge}
                </div>
              )}
              <div className="absolute top-4 right-4 z-10 bg-rose-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                {product.discount_percent}% OFF
              </div>
              {images.length > 0 ? (
                <img src={images[currentImage]} alt={product.name} className="w-full h-full object-contain p-8" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-4 bg-emerald-100 rounded-3xl flex items-center justify-center">
                      <Sparkles className="w-12 h-12 text-emerald-600" />
                    </div>
                    <p className="text-gray-400 font-medium">{product.short_name}</p>
                  </div>
                </div>
              )}
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto">
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
              <div className="flex">
                {[1,2,3,4,5].map(i => <Star key={i} size={16} className={`${i <= Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />)}
              </div>
              <span className="text-sm font-medium text-gray-700">{product.rating}</span>
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
                <span>Prepaid: ₹{product.prepaid_price}</span>
                <span>COD: ₹{product.cod_price} (₹{product.cod_advance} advance)</span>
              </div>
            </div>

            {/* Key Ingredients */}
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Key Ingredients</p>
              <p className="text-emerald-700 font-medium">{product.key_ingredients}</p>
            </div>

            {/* Benefits */}
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Benefits</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.benefits?.map((b, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check size={14} className="text-emerald-500 flex-shrink-0" />
                    {b}
                  </div>
                ))}
              </div>
            </div>

            {/* Quantity + Actions */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center border border-gray-200 rounded-xl">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-gray-50"><Minus size={18} /></button>
                <span className="w-10 text-center font-bold">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:bg-gray-50"><Plus size={18} /></button>
              </div>
              <span className="text-sm text-gray-500">{product.size}</span>
            </div>

            <div className="flex gap-3 mb-6">
              <button onClick={handleAddToCart} className="flex-1 border-2 border-emerald-600 text-emerald-600 font-bold py-3 rounded-xl hover:bg-emerald-50 transition-colors" data-testid="add-to-cart-btn">
                Add to Cart
              </button>
              <button onClick={handleBuyNow} className="flex-1 bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors" data-testid="buy-now-btn">
                Buy Now
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {[
                { icon: Truck, text: 'Free Ship' },
                { icon: Shield, text: 'Genuine' },
                { icon: Award, text: 'Certified' },
                { icon: Clock, text: '30-Day' },
              ].map((b, i) => (
                <div key={i} className="text-center p-2 rounded-xl bg-gray-50">
                  <b.icon size={18} className="mx-auto mb-1 text-emerald-600" />
                  <p className="text-xs text-gray-600 font-medium">{b.text}</p>
                </div>
              ))}
            </div>

            {/* Accordion */}
            {[
              { key: 'desc', title: 'Description', content: product.description },
              { key: 'ingredients', title: 'Full Ingredients', content: product.ingredients_full },
              { key: 'howto', title: 'How to Use', content: product.how_to_use },
            ].map(section => (
              <div key={section.key} className="border-b border-gray-100">
                <button onClick={() => setActiveAccordion(activeAccordion === section.key ? null : section.key)} className="w-full flex items-center justify-between py-3 text-left">
                  <span className="font-semibold text-gray-900 text-sm">{section.title}</span>
                  <ChevronDown size={18} className={`text-gray-400 transition-transform ${activeAccordion === section.key ? 'rotate-180' : ''}`} />
                </button>
                {activeAccordion === section.key && (
                  <div className="pb-4 text-sm text-gray-600 leading-relaxed">{section.content}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Related Products */}
        {allProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Complete Your Routine</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {allProducts.slice(0, 4).map(p => (
                <Link to={`/product/${p.slug}`} key={p.slug} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
                  <div className="aspect-square bg-gray-50 flex items-center justify-center p-4">
                    {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-contain" /> : (
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center"><Sparkles className="w-6 h-6 text-emerald-600" /></div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">{p.short_name}</h3>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-bold text-gray-900">₹{p.prepaid_price}</span>
                      <span className="text-xs text-gray-400 line-through">₹{p.mrp}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetailPage;
