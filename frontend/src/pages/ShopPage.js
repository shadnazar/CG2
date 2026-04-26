import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Star, ShoppingCart, Sparkles, ChevronRight, Award, Zap, Package, Check, Clock } from 'lucide-react';
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
        {/* Bundle — bigger on shop */}
        {completeKit && (
          <div className="bg-white rounded-2xl shadow-md border border-amber-200/40 overflow-hidden mb-8">
            <div className="bg-amber-400 text-amber-900 py-2 px-4 text-center text-sm font-bold tracking-wide">BEST VALUE — SAVE {completeKit.discount_percent}% — ALL 5 PRODUCTS</div>
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-28 h-28 bg-gradient-to-br from-green-50 to-amber-50 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {settings.bundle_hero_image ? <img src={settings.bundle_hero_image} alt="Kit" className="w-24 h-24 object-contain" /> : <Package className="w-12 h-12 text-amber-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-black text-gray-900">{completeKit.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{completeKit.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {completeKit.product_slugs?.map(slug => { const p = products.find(pr => pr.slug === slug); return p ? <span key={slug} className="text-xs bg-green-50 text-green-700 border border-green-200/60 px-2 py-1 rounded-full font-medium">{p.short_name}</span> : null; })}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-black text-gray-900">₹{completeKit.combo_prepaid_price?.toLocaleString()}</span>
                    <span className="text-sm text-gray-400 line-through mb-0.5">₹{completeKit.mrp_total?.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-green-600 font-bold">Save ₹{(completeKit.mrp_total - completeKit.combo_prepaid_price)?.toLocaleString()}</p>
                </div>
                <button onClick={() => handleAddCombo(completeKit.combo_id)} className="bg-green-600 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-green-700 flex items-center gap-2" data-testid="shop-add-kit"><ShoppingCart size={16} /> Add Kit</button>
              </div>
            </div>
          </div>
        )}

        {/* All Products */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">Individual Products</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-10">
          {products.map(product => {
            const orders = Math.floor(Math.random() * 40) + 30;
            const piecesLeft = Math.floor(Math.random() * 20) + 5;
            const viewing = Math.floor(Math.random() * 20) + 8;
            return (
            <div key={product.slug} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all relative" data-testid={`shop-product-${product.slug}`}>
              {/* TBL Banner overlay (takes precedence over normal badge) */}
              {product.is_to_be_launched ? (
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-3 py-1.5 text-center tracking-wide flex items-center justify-center gap-1.5">
                  <Clock size={12} />
                  {product.days_to_launch != null ? `LAUNCHING IN ${product.days_to_launch} DAY${product.days_to_launch === 1 ? '' : 'S'}` : 'COMING SOON'}
                </div>
              ) : product.badge ? (
                <div className={`text-xs font-bold px-3 py-1.5 text-center tracking-wide ${product.badge === 'Bestseller' ? 'bg-amber-400 text-amber-900' : product.badge === 'New Launch' ? 'bg-rose-500 text-white' : 'bg-green-50 text-green-700'}`}>{product.badge.toUpperCase()}</div>
              ) : null}
              <Link to={`/product/${product.slug}`}>
                <div className="aspect-square bg-stone-50 flex items-center justify-center p-4 group-hover:scale-105 transition-transform relative">
                  {product.images?.[0] ? <img src={product.images[0]} alt="" className="w-full h-full object-contain" /> : <Sparkles className="w-10 h-10 text-green-200" />}
                </div>
              </Link>
              {/* Live activity strip — neat row BELOW image */}
              {!product.is_to_be_launched && (
                <div className="bg-amber-50 border-y border-amber-100 px-2 py-1.5 flex items-center justify-around text-[10px] font-semibold gap-1">
                  <span className="text-amber-700 flex items-center gap-0.5"><Sparkles size={10} className="text-amber-500" /> {viewing} viewing</span>
                  <span className="text-green-700 flex items-center gap-0.5"><Check size={10} className="text-green-500" /> {orders} sold</span>
                  <span className="text-rose-700 flex items-center gap-0.5">{piecesLeft} left</span>
                </div>
              )}
              <div className="p-3.5">
                <Link to={`/product/${product.slug}`}><h3 className="font-bold text-gray-900 text-base leading-snug mb-1 group-hover:text-green-700 line-clamp-2">{product.short_name}</h3></Link>
                <p className="text-xs text-gray-400 mb-1">{product.key_ingredients}</p>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-sm text-gray-400 line-through">₹{product.mrp}</span>
                  <span className="text-xl font-black text-gray-900">₹{product.prepaid_price}</span>
                  <span className="text-xs font-bold text-green-600">{product.discount_percent}% Off</span>
                </div>
                {!product.is_to_be_launched && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg px-2.5 py-2 mb-2.5 flex items-center gap-2">
                    <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0"><Check size={10} className="text-white" /></div>
                    <p className="text-xs text-orange-800 font-semibold">₹{product.prepaid_price - 50} with <span className="font-mono font-bold">WELCOME50</span></p>
                  </div>
                )}
                <div className="flex items-center gap-1.5 mb-3">
                  <div className="flex">{[1,2,3,4,5].map(i => <Star key={i} size={13} className={i <= Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />)}</div>
                  <span className="text-xs text-gray-500">({product.reviews_count?.toLocaleString()})</span>
                </div>
                {product.is_to_be_launched ? (
                  product.preorder_enabled ? (
                    <button onClick={() => { addToCart(product.slug); axios.post(`${API}/api/products/${product.slug}/preorder-count`).catch(()=>{}); }} className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-2" data-testid={`shop-preorder-${product.slug}`}>
                      <Clock size={16} /> Preorder Now
                    </button>
                  ) : (
                    <button disabled className="w-full bg-gray-200 text-gray-500 text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
                      <Clock size={16} /> Coming Soon
                    </button>
                  )
                ) : (
                  <button onClick={() => addToCart(product.slug)} className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-2" data-testid={`shop-add-${product.slug}`}>
                    <ShoppingCart size={16} /> Add to Cart
                  </button>
                )}
              </div>
            </div>
            );
          })}
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
