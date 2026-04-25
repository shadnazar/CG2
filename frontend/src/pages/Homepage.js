import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Star, ChevronRight, Shield, Truck, Award, Clock, Sparkles, ChevronLeft, ChevronDown, Users, Zap } from 'lucide-react';
import axios from 'axios';
import { useTracking } from '../providers/TrackingProvider';

const API = process.env.REACT_APP_BACKEND_URL;

// Cart utility
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
  const [cartCount, setCartCount] = useState(0);

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
    const updateCount = () => {
      const cart = getCart();
      setCartCount(cart.items.reduce((sum, i) => sum + (i.quantity || 1), 0));
    };
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

  const handleAddComboToCart = (comboId) => {
    const cart = getCart();
    const existing = cart.items.find(i => i.combo_id === comboId);
    if (existing) existing.quantity += 1;
    else cart.items.push({ combo_id: comboId, quantity: 1 });
    saveCart(cart);
    trackAction('add_combo_to_cart', { combo_id: comboId });
  };

  const bestseller = products.find(p => p.badge === 'Bestseller') || products[0];

  return (
    <div className="min-h-screen bg-white" data-testid="homepage">
      {/* Announcement Bar */}
      <div className="bg-gradient-to-r from-emerald-700 to-green-600 text-white text-center py-2 px-4">
        <p className="text-xs sm:text-sm font-medium tracking-wide">
          FREE SHIPPING on all orders | Complete Anti-Aging Solution | Trusted by 50,000+ customers
        </p>
      </div>

      {/* Sticky Cart */}
      {cartCount > 0 && (
        <Link to="/cart" className="fixed bottom-4 right-4 z-50 bg-emerald-600 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 hover:bg-emerald-700 transition-all" data-testid="floating-cart-btn">
          <ShoppingCart size={20} />
          <span className="font-bold">{cartCount}</span>
          <span className="text-sm">View Cart</span>
        </Link>
      )}

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-stone-50 via-white to-emerald-50 overflow-hidden" data-testid="hero-section">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:py-20">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Sparkles size={14} />
              India's #1 Anti-Aging Brand
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4">
              {settings.hero_title || "Complete Anti-Aging Solution"}
            </h1>
            <p className="text-base sm:text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              {settings.hero_subtitle || "5 clinically-formulated products designed exclusively to fight aging. Cleanse, treat, hydrate, protect & brighten."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/shop" className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-full text-base font-semibold transition-all shadow-lg shadow-emerald-200" data-testid="shop-now-btn">
                Shop All Products <ChevronRight size={18} />
              </Link>
              <Link to="/consultation" className="inline-flex items-center justify-center gap-2 border-2 border-gray-300 hover:border-emerald-500 text-gray-700 px-8 py-3.5 rounded-full text-base font-semibold transition-all">
                Free Skin Analysis
              </Link>
            </div>
            {/* Trust Stats */}
            <div className="flex items-center justify-center gap-6 sm:gap-10 mt-10">
              <div className="text-center"><p className="text-2xl font-bold text-gray-900">50K+</p><p className="text-xs text-gray-500">Happy Customers</p></div>
              <div className="w-px h-10 bg-gray-200" />
              <div className="text-center"><p className="text-2xl font-bold text-gray-900">4.8</p><p className="text-xs text-gray-500">Average Rating</p></div>
              <div className="w-px h-10 bg-gray-200" />
              <div className="text-center"><p className="text-2xl font-bold text-gray-900">5</p><p className="text-xs text-gray-500">Products</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 py-14" data-testid="products-section">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Our Anti-Aging Range</h2>
          <p className="text-gray-500 mt-2">Clinically formulated. Dermatologist approved. Made in India.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {products.map(product => (
            <div key={product.slug} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-emerald-200 transition-all duration-300" data-testid={`product-card-${product.slug}`}>
              {/* Badge */}
              {product.badge && (
                <div className={`text-xs font-bold px-3 py-1 text-center ${product.badge === 'Bestseller' ? 'bg-amber-400 text-amber-900' : product.badge === 'New Launch' ? 'bg-rose-500 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                  {product.badge}
                </div>
              )}
              {/* Image placeholder */}
              <Link to={`/product/${product.slug}`} className="block">
                <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6 group-hover:scale-105 transition-transform">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-2 bg-emerald-100 rounded-2xl flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-emerald-600" />
                      </div>
                      <p className="text-xs text-gray-400 font-medium">{product.short_name}</p>
                    </div>
                  )}
                </div>
              </Link>
              <div className="p-3 sm:p-4">
                <Link to={`/product/${product.slug}`}>
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1 group-hover:text-emerald-700 transition-colors line-clamp-2">{product.short_name}</h3>
                </Link>
                <p className="text-xs text-gray-500 mb-2">{product.key_ingredients}</p>
                <div className="flex items-center gap-1 mb-2">
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  <span className="text-xs font-medium text-gray-700">{product.rating}</span>
                  <span className="text-xs text-gray-400">({product.reviews_count?.toLocaleString()})</span>
                </div>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-lg font-bold text-gray-900">₹{product.prepaid_price}</span>
                  <span className="text-xs text-gray-400 line-through">₹{product.mrp}</span>
                  <span className="text-xs font-bold text-emerald-600">{product.discount_percent}% OFF</span>
                </div>
                <button
                  onClick={() => handleAddToCart(product.slug)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2 rounded-xl transition-colors"
                  data-testid={`add-to-cart-${product.slug}`}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Combo Deals */}
      <section className="bg-gradient-to-br from-stone-50 to-emerald-50 py-14" data-testid="combos-section">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-1.5 rounded-full text-sm font-bold mb-3">
              <Zap size={14} /> SAVE MORE WITH BUNDLES
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Combo Deals</h2>
            <p className="text-gray-500 mt-2">Build your complete anti-aging routine and save up to 51%</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {combos.map(combo => (
              <div key={combo.combo_id} className={`bg-white rounded-2xl border-2 overflow-hidden hover:shadow-xl transition-all ${combo.badge === 'Best Value' ? 'border-amber-400 ring-2 ring-amber-100' : 'border-gray-100'}`} data-testid={`combo-card-${combo.combo_id}`}>
                {combo.badge && (
                  <div className={`text-sm font-bold px-4 py-2 text-center ${combo.badge === 'Best Value' ? 'bg-amber-400 text-amber-900' : combo.badge === 'Popular' ? 'bg-rose-500 text-white' : 'bg-emerald-600 text-white'}`}>
                    {combo.badge} — Save {combo.discount_percent}%
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{combo.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">{combo.description}</p>
                  <div className="space-y-2 mb-4">
                    {combo.product_slugs?.map(slug => {
                      const p = products.find(pr => pr.slug === slug);
                      return p ? (
                        <div key={slug} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-gray-700">{p.short_name}</span>
                          <span className="text-gray-400 ml-auto">₹{p.mrp}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-500">Total MRP</span>
                      <span className="text-sm text-gray-400 line-through">₹{combo.mrp_total?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-bold text-emerald-700">Combo Price</span>
                      <span className="text-2xl font-bold text-gray-900">₹{combo.combo_prepaid_price?.toLocaleString()}</span>
                    </div>
                    <button
                      onClick={() => handleAddComboToCart(combo.combo_id)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-colors"
                      data-testid={`add-combo-${combo.combo_id}`}
                    >
                      Add Bundle to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Celesta Glow */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Why Choose Celesta Glow?</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Shield, title: 'Clinically Tested', desc: 'Dermatologist approved formulas' },
            { icon: Truck, title: 'Free Shipping', desc: 'On all orders across India' },
            { icon: Award, title: 'Made in India', desc: 'CMISO 9001:2015 Certified' },
            { icon: Clock, title: '30-Day Guarantee', desc: 'Full money-back promise' },
          ].map((item, i) => (
            <div key={i} className="text-center p-5 rounded-2xl border border-gray-100 hover:border-emerald-200 transition-colors">
              <div className="w-12 h-12 mx-auto mb-3 bg-emerald-50 rounded-xl flex items-center justify-center">
                <item.icon className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{item.title}</h3>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick CTA */}
      <section className="bg-emerald-700 text-white py-12">
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
