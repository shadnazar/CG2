import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, Trash2, Minus, Plus, ChevronRight, Shield, Truck, Tag, ArrowLeft, Sparkles, Zap, Award, Check, Clock } from 'lucide-react';
import { getCart, saveCart } from './Homepage';
import { useTracking } from '../providers/TrackingProvider';

const API = process.env.REACT_APP_BACKEND_URL;

function CartPage() {
  const navigate = useNavigate();
  const { trackAction } = useTracking();
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('prepaid');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [upsellProducts, setUpsellProducts] = useState([]);
  const [combos, setCombos] = useState([]);

  const validateCart = useCallback(async () => {
    setLoading(true);
    const cart = getCart();
    if (!cart.items.length) { setCartData(null); setLoading(false); return; }
    try {
      const res = await axios.post(`${API}/api/cart/validate`, {
        items: cart.items,
        coupon_code: appliedCoupon?.code || null,
        payment_method: paymentMethod
      });
      setCartData(res.data);
      // Fetch upsell products and combos
      const [allProds, comboRes] = await Promise.all([
        axios.get(`${API}/api/products`),
        axios.get(`${API}/api/combos`)
      ]);
      const cartSlugs = cart.items.map(i => i.product_slug).filter(Boolean);
      const cartCombos = cart.items.map(i => i.combo_id).filter(Boolean);
      setUpsellProducts(allProds.data.filter(p => !cartSlugs.includes(p.slug)).slice(0, 3));
      setCombos(comboRes.data.filter(c => !cartCombos.includes(c.combo_id)));
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [paymentMethod, appliedCoupon]);

  useEffect(() => { validateCart(); }, [validateCart]);

  const updateQuantity = (index, delta) => {
    const cart = getCart();
    const item = cart.items[index];
    if (!item) return;
    item.quantity = Math.max(1, (item.quantity || 1) + delta);
    saveCart(cart);
    validateCart();
  };

  const removeItem = (index) => {
    const cart = getCart();
    cart.items.splice(index, 1);
    saveCart(cart);
    validateCart();
  };

  const addUpsellToCart = (slug) => {
    const cart = getCart();
    const existing = cart.items.find(i => i.product_slug === slug);
    if (existing) existing.quantity += 1;
    else cart.items.push({ product_slug: slug, quantity: 1 });
    saveCart(cart);
    trackAction('upsell_add_to_cart', { slug });
    validateCart();
  };

  const applyCoupon = async () => {
    setCouponError('');
    if (!couponCode.trim()) return;
    try {
      const res = await axios.post(`${API}/api/validate-coupon?code=${couponCode.trim()}&cart_total=${cartData?.subtotal || 0}`);
      setAppliedCoupon({ code: couponCode.trim().toUpperCase(), ...res.data });
    } catch (err) {
      setCouponError(err.response?.data?.detail || 'Invalid coupon');
      setAppliedCoupon(null);
    }
  };

  const proceedToCheckout = () => {
    if (!cartData?.items?.length) return;
    trackAction('initiate_checkout', { items: cartData.items.length, total: cartData.total });
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'InitiateCheckout', { value: cartData.total, currency: 'INR', num_items: cartData.item_count });
    }
    navigate('/checkout', { state: { cartData, paymentMethod, coupon: appliedCoupon } });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!cartData || !cartData.items?.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4" data-testid="empty-cart">
        <div className="text-center max-w-sm">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add some products to get started on your anti-aging journey.</p>
          <Link to="/shop" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-emerald-700 transition-colors">
            Shop Now <ChevronRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="cart-page">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/shop" className="p-2 hover:bg-white rounded-xl"><ArrowLeft size={20} /></Link>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Shopping Cart ({cartData.item_count} items)</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {cartData.items.map((item, index) => (
              <div key={index} className="bg-white rounded-2xl p-4 border border-gray-100 flex gap-4" data-testid={`cart-item-${index}`}>
                <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  {item.image ? <img src={item.image} alt="" className="w-full h-full object-contain p-2" /> : <Sparkles className="w-8 h-8 text-emerald-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                    {item.type === 'combo' ? item.name : item.short_name || item.name}
                  </h3>
                  {item.type === 'combo' && <p className="text-xs text-emerald-600 mt-0.5">{item.product_slugs?.length} products included</p>}
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-bold text-gray-900">₹{item.price}</span>
                    {item.mrp > item.price && <span className="text-xs text-gray-400 line-through">₹{item.mrp || item.mrp_total}</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button onClick={() => updateQuantity(index, -1)} className="p-1.5 hover:bg-gray-50"><Minus size={14} /></button>
                      <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(index, 1)} className="p-1.5 hover:bg-gray-50"><Plus size={14} /></button>
                    </div>
                    <button onClick={() => removeItem(index)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-gray-900">₹{item.line_total}</p>
                </div>
              </div>
            ))}

            {/* Upsell */}
            {upsellProducts.length > 0 && (
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                <div className="flex items-center gap-2 mb-3">
                  <Zap size={16} className="text-amber-600" />
                  <span className="font-bold text-amber-800 text-sm">Complete Your Routine — Add More & Save!</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {upsellProducts.map(p => (
                    <div key={p.slug} className="bg-white rounded-xl p-3 flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Sparkles size={16} className="text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xs text-gray-900 line-clamp-1">{p.short_name}</p>
                        <p className="text-xs text-gray-500">₹{paymentMethod === 'prepaid' ? p.prepaid_price : p.cod_price}</p>
                      </div>
                      <button onClick={() => addUpsellToCart(p.slug)} className="text-xs bg-emerald-600 text-white px-2 py-1 rounded-lg font-bold hover:bg-emerald-700 flex-shrink-0">
                        + Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bundle Deal Push */}
            {combos.length > 0 && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border-2 border-amber-200">
                <div className="flex items-center gap-2 mb-3">
                  <Award size={16} className="text-amber-600" />
                  <span className="font-bold text-amber-900 text-sm">Upgrade to a Bundle & Save Up to 51%!</span>
                </div>
                {combos.slice(0, 2).map(combo => (
                  <div key={combo.combo_id} className="bg-white rounded-xl p-3 mb-2 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{combo.name}</p>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="font-bold text-emerald-700">₹{combo.combo_prepaid_price?.toLocaleString()}</span>
                        <span className="text-xs text-gray-400 line-through">₹{combo.mrp_total?.toLocaleString()}</span>
                        <span className="text-xs font-bold text-rose-600">{combo.discount_percent}% OFF</span>
                      </div>
                    </div>
                    <button onClick={() => { const cart = getCart(); cart.items = [{ combo_id: combo.combo_id, quantity: 1 }]; saveCart(cart); validateCart(); }}
                      className="text-xs bg-amber-500 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-amber-600">
                      Switch to Bundle
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Trust Badges */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <div className="grid grid-cols-4 gap-3">
                {[{ icon: Shield, t: 'Secure Checkout', d: '256-bit SSL' }, { icon: Truck, t: 'Free Shipping', d: 'All India' }, { icon: Clock, t: '30-Day Return', d: 'Money back' }, { icon: Check, t: '50K+ Customers', d: 'Trusted brand' }].map((b, i) => (
                  <div key={i} className="text-center">
                    <b.icon size={18} className="mx-auto mb-1 text-emerald-600" />
                    <p className="text-[10px] font-semibold text-gray-700">{b.t}</p>
                    <p className="text-[9px] text-gray-400">{b.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            {/* Payment Method */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <p className="font-semibold text-gray-900 text-sm mb-3">Payment Method</p>
              <div className="space-y-2">
                <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'prepaid' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100'}`}>
                  <input type="radio" name="payment" checked={paymentMethod === 'prepaid'} onChange={() => setPaymentMethod('prepaid')} className="text-emerald-600" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-900">Prepaid (UPI/Card)</p>
                    <p className="text-xs text-emerald-600">Faster Delivery (1-2 days)</p>
                  </div>
                </label>
                <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100'}`}>
                  <input type="radio" name="payment" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="text-emerald-600" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-900">Cash on Delivery</p>
                    <p className="text-xs text-gray-500">₹29 advance | Pay rest on delivery</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Coupon */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <p className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2"><Tag size={16} /> Coupon Code</p>
              {appliedCoupon ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-emerald-700 text-sm">{appliedCoupon.code}</p>
                    <p className="text-xs text-emerald-600">-₹{appliedCoupon.discount} applied</p>
                  </div>
                  <button onClick={() => { setAppliedCoupon(null); setCouponCode(''); }} className="text-red-500 text-xs font-bold">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Enter code" className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm" />
                  <button onClick={applyCoupon} className="px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800">Apply</button>
                </div>
              )}
              {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
            </div>

            {/* Summary */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100" data-testid="order-summary">
              <p className="font-semibold text-gray-900 text-sm mb-3">Order Summary</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>MRP Total</span>
                  <span className="line-through">₹{cartData.mrp_total?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>₹{cartData.subtotal?.toLocaleString()}</span>
                </div>
                {cartData.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Coupon Discount</span>
                    <span>-₹{cartData.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-medium">FREE</span>
                </div>
                <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900 text-base">
                  <span>Total</span>
                  <span>₹{cartData.total?.toLocaleString()}</span>
                </div>
                {cartData.savings > 0 && (
                  <p className="text-center text-sm text-emerald-600 font-semibold bg-emerald-50 rounded-xl py-2">
                    You save ₹{cartData.savings?.toLocaleString()} on this order!
                  </p>
                )}
              </div>
            </div>

            <button onClick={proceedToCheckout} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl transition-colors text-base shadow-lg shadow-emerald-200" data-testid="proceed-checkout-btn">
              Proceed to Checkout
            </button>

            <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1"><Shield size={12} /> Secure</span>
              <span className="flex items-center gap-1"><Truck size={12} /> Free Shipping</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
