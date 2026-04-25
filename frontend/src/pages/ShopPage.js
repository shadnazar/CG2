import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Star, ShoppingCart, Sparkles, Filter, ChevronRight } from 'lucide-react';
import { addToCart, getCart, saveCart } from './Homepage';

const API = process.env.REACT_APP_BACKEND_URL;

function ShopPage() {
  const [products, setProducts] = useState([]);
  const [combos, setCombos] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, comboRes] = await Promise.all([
          axios.get(`${API}/api/products`),
          axios.get(`${API}/api/combos`)
        ]);
        setProducts(prodRes.data);
        setCombos(comboRes.data);
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

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50" data-testid="shop-page">
      {/* Cart Floating */}
      {cartCount > 0 && (
        <Link to="/cart" className="fixed bottom-4 right-4 z-50 bg-emerald-600 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2">
          <ShoppingCart size={20} /><span className="font-bold">{cartCount}</span><span className="text-sm">View Cart</span>
        </Link>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Link to="/" className="hover:text-emerald-600">Home</Link><ChevronRight size={14} /><span className="text-gray-900">Shop</span>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
          <p className="text-gray-500 mt-1">Complete anti-aging range — clinically formulated for Indian skin</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Products */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
          {products.map(product => (
            <div key={product.slug} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-emerald-200 transition-all" data-testid={`shop-product-${product.slug}`}>
              {product.badge && (
                <div className={`text-xs font-bold px-3 py-1 text-center ${product.badge === 'Bestseller' ? 'bg-amber-400 text-amber-900' : product.badge === 'New Launch' ? 'bg-rose-500 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                  {product.badge}
                </div>
              )}
              <Link to={`/product/${product.slug}`}>
                <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6 group-hover:scale-105 transition-transform">
                  {product.images?.[0] ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain" /> : (
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-2 bg-emerald-100 rounded-2xl flex items-center justify-center"><Sparkles className="w-8 h-8 text-emerald-600" /></div>
                      <p className="text-xs text-gray-400">{product.short_name}</p>
                    </div>
                  )}
                </div>
              </Link>
              <div className="p-3 sm:p-4">
                <Link to={`/product/${product.slug}`}>
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1 group-hover:text-emerald-700 line-clamp-2">{product.short_name}</h3>
                </Link>
                <p className="text-xs text-gray-500 mb-2">{product.key_ingredients}</p>
                <div className="flex items-center gap-1 mb-2">
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  <span className="text-xs font-medium">{product.rating}</span>
                  <span className="text-xs text-gray-400">({product.reviews_count?.toLocaleString()})</span>
                </div>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-lg font-bold text-gray-900">₹{product.prepaid_price}</span>
                  <span className="text-xs text-gray-400 line-through">₹{product.mrp}</span>
                  <span className="text-xs font-bold text-emerald-600">{product.discount_percent}% OFF</span>
                </div>
                <button onClick={() => addToCart(product.slug)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2 rounded-xl transition-colors" data-testid={`shop-add-${product.slug}`}>
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Combos */}
        {combos.length > 0 && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Combo Bundles — Save More</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {combos.map(combo => (
                <div key={combo.combo_id} className={`bg-white rounded-2xl border-2 overflow-hidden hover:shadow-xl transition-all ${combo.badge === 'Best Value' ? 'border-amber-400' : 'border-gray-100'}`}>
                  {combo.badge && (
                    <div className={`text-sm font-bold px-4 py-2 text-center ${combo.badge === 'Best Value' ? 'bg-amber-400 text-amber-900' : combo.badge === 'Popular' ? 'bg-rose-500 text-white' : 'bg-emerald-600 text-white'}`}>
                      {combo.badge} — Save {combo.discount_percent}%
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{combo.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{combo.description}</p>
                    <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                      <div>
                        <span className="text-gray-400 line-through text-sm">₹{combo.mrp_total?.toLocaleString()}</span>
                        <span className="text-2xl font-bold text-gray-900 ml-2">₹{combo.combo_prepaid_price?.toLocaleString()}</span>
                      </div>
                      <Link to="/cart" onClick={() => {
                        const cart = getCart();
                        if (!cart.items.find(i => i.combo_id === combo.combo_id)) {
                          cart.items.push({ combo_id: combo.combo_id, quantity: 1 });
                          saveCart(cart);
                        }
                      }} className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-emerald-700">
                        Add Bundle
                      </Link>
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
