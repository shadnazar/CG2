import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, Check, Truck, Shield, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const RAZORPAY_KEY = process.env.REACT_APP_RAZORPAY_KEY;

const PREPAID_PRICE = 399;
const COD_PRICE = 450;
const COD_ADVANCE = 49;
const MRP = 1499;

// Actual Celesta Glow product image
const PRODUCT_IMAGE = 'https://celestaglow.com/cdn/shop/files/IMG_0538.png?v=1771463966&width=1000';

function ProductPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState('product');
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
        content_name: 'Celesta Glow Advanced Face Serum',
        value: PREPAID_PRICE,
        currency: 'INR'
      });
    }
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
    setErrors(prev => ({ ...prev, pincode: '' }));
    if (pincode.length === 6) {
      try {
        const response = await axios.get(`${API}/pincode/${pincode}/state`);
        if (response.data.state) setFormData(prev => ({ ...prev, state: response.data.state }));
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
        description: paymentMethod === 'prepaid' ? 'Advanced Face Serum' : 'COD Advance',
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
        theme: { color: '#22C55E' },
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
      <div className="pb-24">
        {/* Announcement Bar */}
        <div className="announcement-bar">
          🎉 Limited Time Offer - Save {Math.round((1 - PREPAID_PRICE/MRP) * 100)}% Today!
        </div>

        {/* Product Image */}
        <div className="bg-gray-50 py-8 flex justify-center">
          <img
            src={PRODUCT_IMAGE}
            alt="Celesta Glow Advanced Face Serum"
            className="w-64 h-auto"
            data-testid="product-image"
          />
        </div>

        {/* Product Info */}
        <div className="px-5 py-6">
          <p className="text-sm text-gray-500 mb-1">CELESTA GLOW</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-3" data-testid="product-title">
            Advanced Age Balance Multi Active Serum
          </h1>
          
          {/* Rating */}
          <div className="flex items-center gap-2 mb-4" data-testid="product-rating">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className="star-gold" />
              ))}
            </div>
            <span className="text-gray-500 text-sm">4.8 (2,340 reviews)</span>
          </div>

          {/* Price */}
          <div className="card-cg mb-6" data-testid="product-price">
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-3xl font-bold text-gray-900">₹{PREPAID_PRICE}</span>
              <span className="text-lg text-gray-400 line-through">₹{MRP}</span>
            </div>
            <div className="inline-block px-3 py-1 bg-green-100 rounded-full">
              <span className="text-green-600 text-sm font-semibold">
                SAVE {Math.round((1 - PREPAID_PRICE/MRP) * 100)}% - Limited Time
              </span>
            </div>
          </div>

          {/* Key Benefits */}
          <div className="space-y-3 mb-6">
            {[
              'Supports fine lines reduction',
              'Improves uneven tone',
              'Maintains hydration balance',
              'Lightweight for daily use'
            ].map((benefit, i) => (
              <div key={i} className="check-item" data-testid={`product-benefit-${i}`}>
                <div className="check-icon">
                  <Check size={14} />
                </div>
                <span className="text-gray-700 text-sm">{benefit}</span>
              </div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="flex gap-4 py-4 border-y border-gray-100 mb-6">
            <div className="flex items-center gap-2 text-gray-600">
              <Truck size={18} className="text-green-500" />
              <span className="text-xs">Free Delivery</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Shield size={18} className="text-green-500" />
              <span className="text-xs">Dermatologist Tested</span>
            </div>
          </div>

          {/* Buy Button */}
          <button
            onClick={() => setStep('checkout')}
            className="btn-cg-primary w-full"
            data-testid="buy-now-button"
          >
            Order Now — ₹{PREPAID_PRICE}
            <ChevronRight size={20} />
          </button>

          {/* Accordion Details */}
          <div className="mt-8 space-y-3">
            {[
              { title: 'Key Ingredients', content: '0.3% Retinol for cell renewal, Niacinamide for brightening, Hyaluronic Acid for hydration, Vitamin E for protection.' },
              { title: 'How to Use', content: 'Cleanse face, apply 2-3 drops to face and neck avoiding eye area, follow with moisturizer. Use sunscreen during daytime.' },
              { title: 'Clinical Results', content: '94% saw improved hydration. 89% noticed reduced fine lines. 91% reported brighter skin. Results from 8-week clinical study.' },
            ].map((section, i) => (
              <div key={i} className="faq-item">
                <button
                  onClick={() => setExpandedSection(expandedSection === i ? null : i)}
                  className="faq-header"
                  data-testid={`accordion-${i}`}
                >
                  <span>{section.title}</span>
                  {expandedSection === i 
                    ? <ChevronUp size={20} className="text-gray-400" /> 
                    : <ChevronDown size={20} className="text-gray-400" />
                  }
                </button>
                {expandedSection === i && (
                  <div className="faq-content">{section.content}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Checkout Form
  if (step === 'checkout') {
    return (
      <div className="pb-8 bg-gray-50 min-h-screen">
        <div className="px-5 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2" data-testid="checkout-title">
            Complete Your Order
          </h1>
          <p className="text-gray-500 text-sm mb-6">Celesta Glow Advanced Face Serum</p>

          {/* Order Summary Mini */}
          <div className="card-cg mb-6 flex items-center gap-4">
            <img src={PRODUCT_IMAGE} alt="Product" className="w-16 h-16 object-contain" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">Advanced Age Balance Serum</p>
              <p className="text-gray-500 text-xs">30ml • Multi Active</p>
            </div>
            <p className="font-bold text-green-500">₹{paymentMethod === 'prepaid' ? PREPAID_PRICE : COD_PRICE}</p>
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => { setFormData(prev => ({ ...prev, name: e.target.value })); setErrors(prev => ({ ...prev, name: '' })); }}
                placeholder="Enter your name"
                className={`input-cg ${errors.name ? 'border-red-300 bg-red-50' : ''}`}
                data-testid="name-input"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => { setFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })); setErrors(prev => ({ ...prev, phone: '' })); }}
                placeholder="10-digit mobile number"
                className={`input-cg ${errors.phone ? 'border-red-300 bg-red-50' : ''}`}
                data-testid="phone-input"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email (Optional)</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="For order updates"
                className="input-cg"
                data-testid="email-input"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">House/Flat No. *</label>
              <input
                type="text"
                value={formData.house_number}
                onChange={(e) => { setFormData(prev => ({ ...prev, house_number: e.target.value })); setErrors(prev => ({ ...prev, house_number: '' })); }}
                placeholder="House no., Building"
                className={`input-cg ${errors.house_number ? 'border-red-300 bg-red-50' : ''}`}
                data-testid="house-input"
              />
              {errors.house_number && <p className="text-red-500 text-xs mt-1">{errors.house_number}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Area/Locality *</label>
              <input
                type="text"
                value={formData.area}
                onChange={(e) => { setFormData(prev => ({ ...prev, area: e.target.value })); setErrors(prev => ({ ...prev, area: '' })); }}
                placeholder="Street, Colony, Area"
                className={`input-cg ${errors.area ? 'border-red-300 bg-red-50' : ''}`}
                data-testid="area-input"
              />
              {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => handlePincodeChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit"
                  className={`input-cg ${errors.pincode ? 'border-red-300 bg-red-50' : ''}`}
                  data-testid="pincode-input"
                />
                {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <input
                  type="text"
                  value={formData.state}
                  readOnly
                  placeholder="Auto-detect"
                  className="input-cg bg-gray-100"
                  data-testid="state-input"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mt-8">
            <p className="font-semibold text-gray-900 mb-4">Payment Method</p>
            
            <div className="space-y-3">
              <label 
                className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'prepaid' ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'}`}
                data-testid="prepaid-option"
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'prepaid'}
                  onChange={() => setPaymentMethod('prepaid')}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${paymentMethod === 'prepaid' ? 'border-green-500' : 'border-gray-300'}`}>
                  {paymentMethod === 'prepaid' && <div className="w-2.5 h-2.5 rounded-full bg-green-500" />}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Pay Online — ₹{PREPAID_PRICE}</p>
                  <p className="text-green-600 text-sm">Save ₹{COD_PRICE - PREPAID_PRICE} + Fast Delivery</p>
                </div>
              </label>

              <label 
                className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'}`}
                data-testid="cod-option"
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-green-500' : 'border-gray-300'}`}>
                  {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-green-500" />}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Cash on Delivery — ₹{COD_PRICE}</p>
                  <p className="text-gray-500 text-sm">Pay ₹{COD_ADVANCE} now + ₹{COD_PRICE - COD_ADVANCE} on delivery</p>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handlePayment}
            disabled={loading}
            className={`w-full mt-8 py-4 rounded-full font-semibold transition-all ${loading ? 'bg-gray-300 text-gray-500' : 'btn-cg-primary'}`}
            data-testid="place-order-button"
          >
            {loading ? 'Processing...' : `Pay ₹${paymentMethod === 'prepaid' ? PREPAID_PRICE : COD_ADVANCE} & Place Order`}
          </button>

          <button
            onClick={() => setStep('product')}
            className="w-full mt-3 py-3 text-gray-500 text-sm"
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
      <div className="px-5 py-10 min-h-screen">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2" data-testid="confirmation-title">
            Order Confirmed!
          </h1>
          <p className="text-gray-500">Thank you for choosing Celesta Glow</p>
        </div>

        <div className="card-cg text-center mb-6" data-testid="order-id-card">
          <p className="text-gray-500 text-sm mb-2">Order ID</p>
          <p className="text-2xl font-bold text-green-500 tracking-wider">{orderConfirmed.order_id}</p>
        </div>

        <div className="space-y-4">
          <div className="card-cg">
            <p className="font-semibold text-gray-900 mb-4">Order Details</p>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Product</span>
                <span className="text-gray-900 font-medium">Advanced Age Balance Serum</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount</span>
                <span className="text-green-500 font-bold">₹{orderConfirmed.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment</span>
                <span className="text-gray-900">{orderConfirmed.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery</span>
                <span className="text-gray-900">{orderConfirmed.delivery_timeline}</span>
              </div>
            </div>
          </div>

          <div className="card-cg">
            <p className="font-semibold text-gray-900 mb-4">Delivery Address</p>
            <p className="text-gray-600 text-sm">
              {orderConfirmed.name}<br />
              +91 {orderConfirmed.phone}<br />
              {orderConfirmed.house_number}, {orderConfirmed.area}<br />
              {orderConfirmed.state} - {orderConfirmed.pincode}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="btn-cg-dark w-full mt-8"
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
