import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, Check, Truck, Shield, ChevronDown, ChevronUp } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const RAZORPAY_KEY = process.env.REACT_APP_RAZORPAY_KEY;

const PREPAID_PRICE = 399;
const COD_PRICE = 450;
const COD_ADVANCE = 49;
const MRP = 1499;

function ProductPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState('product');
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', house_number: '', area: '', pincode: '', state: ''
  });
  const [errors, setErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('prepaid');
  const [orderConfirmed, setOrderConfirmed] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    axios.post(`${API}/track?page=product&session_id=${sessionId}`).catch(() => {});
    
    if (window.fbq) {
      window.fbq('track', 'ViewContent', {
        content_name: 'Celesta Glow Anti-Aging Serum',
        value: PREPAID_PRICE,
        currency: 'INR'
      });
    }

    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.match(/^[6-9]\d{9}$/)) newErrors.phone = 'Enter valid 10-digit number';
    if (!formData.house_number.trim()) newErrors.house_number = 'Required';
    if (!formData.area.trim()) newErrors.area = 'Required';
    if (!formData.pincode.match(/^\d{6}$/)) newErrors.pincode = 'Enter 6-digit pincode';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePincodeChange = async (pincode) => {
    setFormData(prev => ({ ...prev, pincode }));
    if (pincode.length === 6) {
      try {
        const response = await axios.get(`${API}/pincode/${pincode}/state`);
        if (response.data.state) {
          setFormData(prev => ({ ...prev, state: response.data.state }));
        }
      } catch (error) {}
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!validateForm()) return;
    setLoading(true);

    const amount = paymentMethod === 'prepaid' ? PREPAID_PRICE : COD_ADVANCE;
    
    try {
      const loaded = await loadRazorpay();
      if (!loaded) { alert('Failed to load payment gateway.'); setLoading(false); return; }

      const orderResponse = await axios.post(`${API}/create-razorpay-order`, { amount });
      
      const options = {
        key: RAZORPAY_KEY,
        amount: orderResponse.data.amount,
        currency: 'INR',
        name: 'Celesta Glow',
        description: paymentMethod === 'prepaid' ? 'Anti-Aging Serum' : 'COD Advance',
        order_id: orderResponse.data.id,
        handler: async function (response) {
          try {
            await axios.post(`${API}/verify-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            const order = await axios.post(`${API}/orders`, {
              ...formData,
              payment_method: paymentMethod === 'prepaid' ? 'Prepaid' : 'COD (Advance Paid)',
              amount: paymentMethod === 'prepaid' ? PREPAID_PRICE : COD_PRICE
            });
            
            setOrderConfirmed(order.data);
            setStep('confirmation');
            
            if (window.fbq) {
              window.fbq('track', 'Purchase', { value: paymentMethod === 'prepaid' ? PREPAID_PRICE : COD_PRICE, currency: 'INR' });
            }
          } catch (error) {
            alert('Order creation failed. Please contact support.');
          }
          setLoading(false);
        },
        prefill: { name: formData.name, contact: formData.phone, email: formData.email },
        theme: { color: '#0ea5e9' },
        modal: { ondismiss: () => setLoading(false) }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      alert('Payment failed. Please try again.');
      setLoading(false);
    }
  };

  // Product View
  if (step === 'product') {
    return (
      <div className="pb-28">
        {/* Product Image */}
        <div className="aspect-square bg-slate-50 flex items-center justify-center">
          <img
            src="https://customer-assets.emergentagent.com/job_3e020a22-98fc-4fee-b377-5bacdddf46ce/artifacts/ig243hne_IMG_9115.png"
            alt="Celesta Glow Anti-Aging Serum"
            className="w-4/5 max-w-xs object-contain"
            data-testid="product-image"
          />
        </div>

        {/* Product Info */}
        <div className="px-6 py-6">
          <p className="text-sky-600 text-sm font-medium mb-2" data-testid="product-tag">Anti-Aging Serum • 30ml</p>
          <h1 className="font-heading text-2xl font-bold text-slate-900 mb-3" data-testid="product-title">
            Celesta Glow Face Serum
          </h1>
          
          {/* Rating */}
          <div className="flex items-center gap-2 mb-4" data-testid="product-rating">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-slate-500 text-sm">4.8 (2,340 reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6" data-testid="product-price">
            <span className="text-3xl font-bold text-slate-900">₹{PREPAID_PRICE}</span>
            <span className="text-lg text-slate-400 line-through">₹{MRP}</span>
            <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              {Math.round((1 - PREPAID_PRICE/MRP) * 100)}% OFF
            </span>
          </div>

          {/* Key Benefits */}
          <div className="space-y-3 mb-6">
            {[
              'Reduces fine lines & wrinkles in 4 weeks',
              'Deep hydration with Hyaluronic Acid',
              'Boosts collagen with Retinol',
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-3" data-testid={`product-benefit-${i}`}>
                <Check size={18} className="text-emerald-500 flex-shrink-0" />
                <span className="text-slate-600 text-sm">{benefit}</span>
              </div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="flex gap-4 py-4 border-y border-slate-100 mb-6">
            <div className="flex items-center gap-2 text-slate-600">
              <Truck size={18} className="text-sky-500" />
              <span className="text-xs">Free Delivery</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Shield size={18} className="text-sky-500" />
              <span className="text-xs">Genuine Product</span>
            </div>
          </div>

          {/* Buy Button */}
          <button
            onClick={() => setStep('checkout')}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-4 rounded-full shadow-lg shadow-sky-500/25 transition-all btn-active"
            data-testid="buy-now-button"
          >
            Buy Now — ₹{PREPAID_PRICE}
          </button>

          {/* Accordion Details */}
          <div className="mt-8 space-y-2">
            {[
              { title: 'Key Ingredients', content: 'Retinol (0.5%), Hyaluronic Acid (2%), Niacinamide (5%), Vitamin E, Peptide Complex' },
              { title: 'How to Use', content: 'Apply 2-3 drops on clean face every night. Gently massage in upward motions. Follow with moisturizer.' },
              { title: 'Clinical Results', content: '94% saw reduced fine lines in 4 weeks. 89% reported improved hydration. Dermatologist tested.' },
            ].map((section, i) => (
              <div key={i} className="border border-slate-100 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedSection(expandedSection === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left"
                  data-testid={`accordion-${i}`}
                >
                  <span className="font-medium text-slate-900">{section.title}</span>
                  {expandedSection === i ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                </button>
                {expandedSection === i && (
                  <div className="px-4 pb-4 text-sm text-slate-600 leading-relaxed">
                    {section.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sticky Bottom Bar */}
        {showStickyBar && (
          <div className="sticky-bottom-bar">
            <div className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-xs text-slate-500">Price</p>
                <p className="font-bold text-slate-900">₹{PREPAID_PRICE}</p>
              </div>
              <button
                onClick={() => setStep('checkout')}
                className="bg-sky-500 text-white font-semibold py-3 px-8 rounded-full btn-active"
                data-testid="sticky-buy-button"
              >
                Buy Now
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Checkout Form
  if (step === 'checkout') {
    return (
      <div className="pb-8">
        <div className="px-6 py-6">
          <h1 className="font-heading text-2xl font-bold text-slate-900 mb-2" data-testid="checkout-title">Checkout</h1>
          <p className="text-slate-500 text-sm mb-6">Complete your order</p>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your name"
                className={`w-full h-12 px-4 rounded-xl border ${errors.name ? 'border-red-300 bg-red-50' : 'border-slate-200'} text-base outline-none focus:ring-2 focus:ring-sky-200`}
                data-testid="name-input"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                placeholder="10-digit mobile number"
                className={`w-full h-12 px-4 rounded-xl border ${errors.phone ? 'border-red-300 bg-red-50' : 'border-slate-200'} text-base outline-none focus:ring-2 focus:ring-sky-200`}
                data-testid="phone-input"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email (Optional)</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="For order updates"
                className="w-full h-12 px-4 rounded-xl border border-slate-200 text-base outline-none focus:ring-2 focus:ring-sky-200"
                data-testid="email-input"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">House/Flat No. *</label>
              <input
                type="text"
                value={formData.house_number}
                onChange={(e) => setFormData(prev => ({ ...prev, house_number: e.target.value }))}
                placeholder="House no., Building"
                className={`w-full h-12 px-4 rounded-xl border ${errors.house_number ? 'border-red-300 bg-red-50' : 'border-slate-200'} text-base outline-none focus:ring-2 focus:ring-sky-200`}
                data-testid="house-input"
              />
              {errors.house_number && <p className="text-red-500 text-xs mt-1">{errors.house_number}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Area/Locality *</label>
              <input
                type="text"
                value={formData.area}
                onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                placeholder="Street, Colony, Area"
                className={`w-full h-12 px-4 rounded-xl border ${errors.area ? 'border-red-300 bg-red-50' : 'border-slate-200'} text-base outline-none focus:ring-2 focus:ring-sky-200`}
                data-testid="area-input"
              />
              {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Pincode *</label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => handlePincodeChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit"
                  className={`w-full h-12 px-4 rounded-xl border ${errors.pincode ? 'border-red-300 bg-red-50' : 'border-slate-200'} text-base outline-none focus:ring-2 focus:ring-sky-200`}
                  data-testid="pincode-input"
                />
                {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">State</label>
                <input
                  type="text"
                  value={formData.state}
                  readOnly
                  placeholder="Auto-detect"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-base"
                  data-testid="state-input"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mt-8">
            <h2 className="font-heading font-semibold text-slate-900 mb-4">Payment Method</h2>
            
            <div className="space-y-3">
              <label 
                className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'prepaid' ? 'border-sky-500 bg-sky-50' : 'border-slate-200'}`}
                data-testid="prepaid-option"
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'prepaid'}
                  onChange={() => setPaymentMethod('prepaid')}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${paymentMethod === 'prepaid' ? 'border-sky-500' : 'border-slate-300'}`}>
                  {paymentMethod === 'prepaid' && <div className="w-3 h-3 rounded-full bg-sky-500" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">Pay Online — ₹{PREPAID_PRICE}</p>
                  <p className="text-emerald-600 text-sm">Save ₹{COD_PRICE - PREPAID_PRICE} + Fast Delivery</p>
                </div>
              </label>

              <label 
                className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-sky-500 bg-sky-50' : 'border-slate-200'}`}
                data-testid="cod-option"
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-sky-500' : 'border-slate-300'}`}>
                  {paymentMethod === 'cod' && <div className="w-3 h-3 rounded-full bg-sky-500" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">Cash on Delivery — ₹{COD_PRICE}</p>
                  <p className="text-slate-500 text-sm">Pay ₹{COD_ADVANCE} now + ₹{COD_PRICE - COD_ADVANCE} on delivery</p>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handlePayment}
            disabled={loading}
            className={`w-full mt-8 py-4 rounded-full font-semibold transition-all btn-active ${loading ? 'bg-slate-300 text-slate-500' : 'bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/25'}`}
            data-testid="place-order-button"
          >
            {loading ? 'Processing...' : `Pay ₹${paymentMethod === 'prepaid' ? PREPAID_PRICE : COD_ADVANCE} & Place Order`}
          </button>

          <button
            onClick={() => setStep('product')}
            className="w-full mt-3 py-3 text-slate-500 text-sm"
            data-testid="back-button"
          >
            ← Back to Product
          </button>
        </div>
      </div>
    );
  }

  // Order Confirmation
  if (step === 'confirmation' && orderConfirmed) {
    return (
      <div className="px-6 py-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-emerald-600" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-slate-900 mb-2" data-testid="confirmation-title">Order Confirmed!</h1>
          <p className="text-slate-500">Thank you for your purchase</p>
        </div>

        <div className="bg-sky-500 text-white rounded-2xl p-6 text-center mb-6" data-testid="order-id-card">
          <p className="text-sky-100 text-sm mb-1">Order ID</p>
          <p className="text-2xl font-bold tracking-wider">{orderConfirmed.order_id}</p>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-50 rounded-xl p-4">
            <h3 className="font-medium text-slate-900 mb-3">Order Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Product</span>
                <span className="text-slate-900">Celesta Glow Serum</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount</span>
                <span className="text-emerald-600 font-semibold">₹{orderConfirmed.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment</span>
                <span className="text-slate-900">{orderConfirmed.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Delivery</span>
                <span className="text-slate-900">{orderConfirmed.delivery_timeline}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4">
            <h3 className="font-medium text-slate-900 mb-3">Delivery Address</h3>
            <p className="text-sm text-slate-600">
              {orderConfirmed.name}<br />
              +91 {orderConfirmed.phone}<br />
              {orderConfirmed.house_number}, {orderConfirmed.area}<br />
              {orderConfirmed.state} - {orderConfirmed.pincode}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full mt-8 bg-sky-500 hover:bg-sky-600 text-white font-semibold py-4 rounded-full btn-active"
          data-testid="continue-shopping-button"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return null;
}

export default ProductPage;
