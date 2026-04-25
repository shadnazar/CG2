import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, Shield, Truck, ArrowLeft, Check, MapPin, Clock, Star, Award, Gift } from 'lucide-react';
import { getCart, saveCart, addToCart } from './Homepage';

const API = process.env.REACT_APP_BACKEND_URL;

function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartData: passedCartData, paymentMethod: passedMethod, coupon } = location.state || {};
  const [cartData, setCartData] = useState(passedCartData);
  const [paymentMethod, setPaymentMethod] = useState(passedMethod || 'prepaid');
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', house_number: '', area: '', pincode: '', state: '' });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!cartData) {
      // Re-validate cart
      const cart = getCart();
      if (!cart.items.length) { navigate('/cart'); return; }
      axios.post(`${API}/api/cart/validate`, { items: cart.items, payment_method: paymentMethod, coupon_code: coupon?.code })
        .then(res => setCartData(res.data))
        .catch(() => navigate('/cart'));
    }
  }, []);

  const handlePincodeChange = async (pincode) => {
    setFormData(prev => ({ ...prev, pincode }));
    if (pincode.length === 6) {
      try {
        const res = await axios.get(`${API}/api/pincode/${pincode}`);
        if (res.data.state) setFormData(prev => ({ ...prev, state: res.data.state }));
      } catch (e) {}
    }
  };

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = 'Required';
    if (!formData.phone.match(/^[6-9]\d{9}$/)) e.phone = 'Valid 10-digit phone required';
    if (!formData.house_number.trim()) e.house_number = 'Required';
    if (!formData.area.trim()) e.area = 'Required';
    if (!formData.pincode.match(/^\d{6}$/)) e.pincode = 'Valid 6-digit pincode required';
    if (!formData.state.trim()) e.state = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const placeOrder = async () => {
    if (!validate() || !cartData) return;
    setSubmitting(true);

    const orderPayload = {
      ...formData,
      payment_method: paymentMethod,
      amount: cartData.total,
      items: cartData.items,
      coupon_code: coupon?.code || null,
      coupon_discount: coupon?.discount || 0
    };

    try {
      if (paymentMethod === 'prepaid') {
        // Create Razorpay order
        const rzpOrder = await axios.post(`${API}/api/razorpay/create-order`, { amount: cartData.total });
        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_key',
          amount: rzpOrder.data.amount,
          currency: 'INR',
          name: 'Celesta Glow',
          description: `Order - ${cartData.item_count} items`,
          order_id: rzpOrder.data.id,
          handler: async (response) => {
            try {
              await axios.post(`${API}/api/razorpay/verify-payment`, response);
              const order = await axios.post(`${API}/api/orders`, orderPayload);
              saveCart({ items: [] });
              navigate(`/order-success/${order.data.order_id}`);
            } catch (err) { alert('Payment verification failed'); setSubmitting(false); }
          },
          prefill: { name: formData.name, contact: formData.phone, email: formData.email },
          theme: { color: '#059669' }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
        rzp.on('payment.failed', () => { alert('Payment failed. Try again.'); setSubmitting(false); });
      } else {
        // COD order
        const order = await axios.post(`${API}/api/orders`, orderPayload);
        saveCart({ items: [] });
        navigate(`/order-success/${order.data.order_id}`);
      }
    } catch (err) {
      alert('Order failed. Please try again.');
      setSubmitting(false);
    }
  };

  if (!cartData) return null;

  const InputField = ({ label, field, type = 'text', placeholder }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} value={formData[field]} onChange={e => field === 'pincode' ? handlePincodeChange(e.target.value) : setFormData(prev => ({ ...prev, [field]: e.target.value }))}
        placeholder={placeholder} className={`w-full px-3 py-2.5 border rounded-xl text-sm ${errors[field] ? 'border-red-400' : 'border-gray-200'} focus:ring-2 focus:ring-emerald-500 focus:border-transparent`} data-testid={`checkout-${field}`} />
      {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50" data-testid="checkout-page">
      {/* Trust Strip */}
      <div className="bg-emerald-800 text-white py-2 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-4 sm:gap-8 text-[10px] sm:text-xs">
          <span className="flex items-center gap-1"><Shield size={12} /> Secure Checkout</span>
          <span className="flex items-center gap-1"><Truck size={12} /> Free Shipping</span>
          <span className="flex items-center gap-1"><Star size={12} /> 50K+ Customers</span>
          <span className="flex items-center gap-1 hidden sm:flex"><Clock size={12} /> 30-Day Guarantee</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
        <div className="flex items-center gap-3 mb-4">
          <Link to="/cart" className="p-2 hover:bg-white rounded-xl"><ArrowLeft size={20} /></Link>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><MapPin size={18} /> Delivery Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InputField label="Full Name" field="name" placeholder="Enter your full name" />
                <InputField label="Phone Number" field="phone" type="tel" placeholder="10-digit number" />
                <div className="sm:col-span-2"><InputField label="Email (Optional)" field="email" type="email" placeholder="email@example.com" /></div>
                <div className="sm:col-span-2"><InputField label="House/Flat No." field="house_number" placeholder="House no, building, floor" /></div>
                <div className="sm:col-span-2"><InputField label="Area/Locality" field="area" placeholder="Street, area, landmark" /></div>
                <InputField label="Pincode" field="pincode" placeholder="6-digit pincode" />
                <InputField label="State" field="state" placeholder="State" />
              </div>
            </div>

            {/* Payment Summary for mobile */}
            <div className="lg:hidden bg-white rounded-2xl p-4 border border-gray-100">
              <div className="flex justify-between font-bold text-gray-900"><span>Total</span><span>₹{cartData.total?.toLocaleString()}</span></div>
              <p className="text-xs text-gray-500 mt-1">{cartData.item_count} items | {paymentMethod === 'prepaid' ? 'Prepaid' : 'COD (₹29 advance)'} | Free Shipping</p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-4 border border-gray-100 sticky top-4">
              <h2 className="font-bold text-gray-900 mb-3">Order Summary</h2>
              <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                {cartData.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate mr-2">{item.short_name || item.name} x{item.quantity}</span>
                    <span className="font-medium text-gray-900 flex-shrink-0">₹{item.line_total}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>₹{cartData.subtotal?.toLocaleString()}</span></div>
                {cartData.discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>-₹{cartData.discount}</span></div>}
                <div className="flex justify-between text-gray-500"><span>Shipping</span><span className="text-emerald-600">FREE</span></div>
                <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100"><span>Total</span><span>₹{cartData.total?.toLocaleString()}</span></div>
              </div>

              <button onClick={placeOrder} disabled={submitting} className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-bold py-3.5 rounded-xl mt-4 transition-colors" data-testid="place-order-btn">
                {submitting ? 'Processing...' : paymentMethod === 'prepaid' ? `Pay ₹${cartData.total?.toLocaleString()}` : `Place COD Order (₹29 advance)`}
              </button>

              <div className="flex items-center justify-center gap-3 mt-3 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Shield size={12} /> Secure</span>
                <span className="flex items-center gap-1"><Truck size={12} /> Free Ship</span>
                <span className="flex items-center gap-1"><Check size={12} /> 30-day Guarantee</span>
              </div>

              {/* Trust Section */}
              <div className="mt-4 bg-emerald-50 rounded-xl p-3">
                <p className="text-xs text-emerald-800 font-medium text-center mb-2">Trusted by 50,000+ Customers</p>
                <div className="flex justify-center gap-1">
                  {[1,2,3,4,5].map(i => <span key={i} className="text-amber-400 text-xs">&#9733;</span>)}
                  <span className="text-xs text-gray-600 ml-1">4.8/5 Average Rating</span>
                </div>
              </div>

              {/* Savings Highlight */}
              {cartData.savings > 0 && (
                <div className="mt-3 bg-rose-50 border border-rose-100 rounded-xl p-3 text-center">
                  <p className="text-sm font-bold text-rose-700">You're saving ₹{cartData.savings?.toLocaleString()} on this order!</p>
                  <p className="text-xs text-rose-500 mt-0.5">Free shipping included</p>
                </div>
              )}

              {/* Delivery Timeline */}
              <div className="mt-3 text-xs text-gray-500 text-center">
                {paymentMethod === 'prepaid' 
                  ? <p>Estimated delivery: <strong className="text-emerald-600">1-2 business days</strong></p>
                  : <p>Estimated delivery: <strong>5-7 business days</strong></p>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
