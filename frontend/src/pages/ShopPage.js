import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Star, ShoppingCart, Sparkles, ChevronRight, Award, Zap, Package } from 'lucide-react';
import { addToCart, getCart, saveCart } from './Homepage';

const API = process.env.REACT_APP_BACKEND_URL;

function ShopPage() {
  const [products, setProducts] = useState([]);
  const [combos, setCombos] = useState([]);
  const [settings, setSettings] = useState({});
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const update = () => setCartCount(getCart().items.reduce((s, i) => s + (i.quantity || 1), 0));
    update();
    window.addEventListener('cartUpdated', update);
    return () => window.removeEventListener('cartUpdated', update);
  }, []);

  const handleAddCombo = (comboId) => {
    const cart = getCart();
    const existing = cart.items.find(i => i.combo_id === comboId);
    if (existing) existing.quantity += 1;
    else cart.items.push({ combo_id: comboId, quantity: 1 });
    saveCart(cart);
  };

  const completeKit = combos.find(c => c.combo_id === 'complete-anti-aging-kit');
  const otherCombos = combos.filter(c => c.combo_id !== 'complete-anti-aging-kit');

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50" data-testid="shop-page">
      {/* Nav cart icon handles cart count — no floating button */}

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-3">
            <Link to="/" className="hover:text-green-600">Home</Link><ChevronRight size={14} /><span className="text-gray-900">Shop</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">All Products</h1>
          <p className="text-gray-500 mt-1">Complete anti-aging range, clinically formulated for Indian skin</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {/* Compact Bundle on Shop Page */}
        {completeKit && (
          <div className="bg-white rounded-2xl shadow-md border border-amber-200/40 overflow-hidden mb-8">
            <div className="bg-amber-400 text-amber-900 py-1.5 px-4 text-center text-[10px] font-bold tracking-wider">BEST VALUE — SAVE {completeKit.discount_percent}% — ALL 5 PRODUCTS</div>
            <div className="p-4 flex items-start gap-3.5">
              <div className="w-20 h-20 bg-gradient-to-br from-green-50 to-amber-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                {settings.bundle_hero_image ? <img src={settings.bundle_hero_image} alt="Kit" className="w-16 h-16 object-contain" /> : <Package className="w-8 h-8 text-amber-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-black text-gray-900">{completeKit.name}</h3>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {completeKit.product_slugs?.map(slug => { const p = products.find(pr => pr.slug === slug); return p ? <span key={slug} className="text-[8px] bg-green-50 text-green-700 border border-green-200/60 px-1.5 py-0.5 rounded-full font-medium">{p.short_name}</span> : null; })}
                </div>
                <div className="flex items-center justify-between mt-2.5">
                  <div><span className="text-xl font-black text-gray-900">₹{completeKit.combo_prepaid_price?.toLocaleString()}</span><span className="text-xs text-gray-400 line-through ml-1.5">₹{completeKit.mrp_total?.toLocaleString()}</span></div>
                  <button onClick={() => handleAddCombo(completeKit.combo_id)} className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-green-700 flex items-center gap-1" data-testid="shop-add-kit"><ShoppingCart size={12} /> Add Kit</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All Products */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">Individual Products</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-10">
          {products.map(product => (
            <div key={product.slug} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-green-200 transition-all" data-testid={`shop-product-${product.slug}`}>
              {product.badge && (
                <div className={`text-[10px] sm:text-xs font-bold px-3 py-1 text-center ${product.badge === 'Bestseller' ? 'bg-amber-400 text-amber-900' : product.badge === 'New Launch' ? 'bg-rose-500 text-white' : 'bg-green-100 text-green-800'}`}>
                  {product.badge}
                </div>
              )}
              <Link to={`/product/${product.slug}`}>
                <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 sm:p-6 group-hover:scale-105 transition-transform">
                  {product.images?.[0] ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain" /> : (
                    <div className="text-center"><div className="w-12 h-12 mx-auto bg-green-100 rounded-xl flex items-center justify-center"><Sparkles className="w-6 h-6 text-green-600" /></div></div>
                  )}
                </div>
              </Link>
              <div className="p-2.5 sm:p-4">
                <Link to={`/product/${product.slug}`}><h3 className="font-semibold text-gray-900 text-xs sm:text-sm leading-tight mb-1 group-hover:text-green-700 line-clamp-2">{product.short_name}</h3></Link>
                <p className="text-[10px] sm:text-xs text-gray-500 mb-1.5 line-clamp-1">{product.key_ingredients}</p>
                <div className="flex items-center gap-1 mb-1.5">
                  <Star size={10} className="fill-amber-400 text-amber-400" /><span className="text-[10px] sm:text-xs font-medium">{product.rating}</span>
                </div>
                <div className="flex items-baseline gap-1.5 mb-2.5">
                  <span className="text-base sm:text-lg font-bold text-gray-900">₹{product.prepaid_price}</span>
                  <span className="text-[10px] sm:text-xs text-gray-400 line-through">₹{product.mrp}</span>
                </div>
                <button onClick={() => addToCart(product.slug)} className="w-full bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-semibold py-2 rounded-xl transition-colors" data-testid={`shop-add-${product.slug}`}>
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Other Combos */}
        {otherCombos.length > 0 && (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-4">More Combo Deals</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {otherCombos.map(combo => (
                <div key={combo.combo_id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
                  {combo.badge && <div className={`text-sm font-bold px-4 py-2 text-center ${combo.badge === 'Popular' ? 'bg-rose-500 text-white' : 'bg-green-600 text-white'}`}>{combo.badge} | Save {combo.discount_percent}%</div>}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{combo.name}</h3>
                    <p className="text-sm text-gray-500 mb-3">{combo.description}</p>
                    <div className="flex items-center justify-between">
                      <div><span className="text-gray-400 line-through text-sm">₹{combo.mrp_total?.toLocaleString()}</span><span className="text-2xl font-bold text-gray-900 ml-2">₹{combo.combo_prepaid_price?.toLocaleString()}</span></div>
                      <button onClick={() => handleAddCombo(combo.combo_id)} className="bg-green-600 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-green-700" data-testid={`shop-add-combo-${combo.combo_id}`}>Add to Cart</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ShopPage;
