import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, Check, Truck, Shield, ChevronDown, ChevronUp, Leaf } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const RAZORPAY_KEY = process.env.REACT_APP_RAZORPAY_KEY;

const PREPAID_PRICE = 399;
const COD_PRICE = 450;
const COD_ADVANCE = 49;
const MRP = 1499;

// Premium product image
const PRODUCT_IMAGE = 'https://static.prod-images.emergentagent.com/jobs/fc697aed-c4ed-4c4b-8eec-b51bdf774715/images/27894ae9ca30caf0fab852aa459f72223733d28b3a81b8979f89dd19fe6fe798.png';

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

    const handleScroll = () => setShowStickyBar(window.scrollY > 200);
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
        theme: { color: '#5f7350' },
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
        {/* Product Image - Premium */}
        <div className="relative bg-gradient-to-b from-[#fdfcfa] to-white">
          <div className="aspect-square flex items-center justify-center p-8">
            <img
              src={PRODUCT_IMAGE}
              alt="Celesta Glow Anti-Aging Serum"
              className="w-full max-w-[280px] object-contain animate-float"
              data-testid="product-image"
            />
          </div>
          {/* Premium Badge */}
          <div className="absolute top-4 left-4 bg-[#1a2e1a] text-white text-xs px-3 py-1.5 rounded-full">
            Bestseller
          </div>
        </div>

        {/* Product Info - Premium */}
        <div className="px-6 py-8">
          {/* Tag */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-[1px] bg-[#c9a962]" />
            <p className="text-xs tracking-[0.15em] uppercase text-[#5f7350]" data-testid="product-tag">
              Anti-Aging Serum • 30ml
            </p>
          </div>

          <h1 className="text-premium-heading text-2xl font-semibold mb-4" data-testid="product-title">
            Celesta Glow Face Serum
          </h1>
          
          {/* Rating */}
          <div className="flex items-center gap-3 mb-6" data-testid="product-rating">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className="fill-[#c9a962] text-[#c9a962]" />
              ))}
            </div>
            <span className="text-sm text-[#96a883]">4.8 (2,340 reviews)</span>
          </div>

          {/* Price - Premium */}
          <div className="card-premium p-5 mb-6" data-testid="product-price">
            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-semibold text-[#1a2e1a]">₹{PREPAID_PRICE}</span>
              <span className="text-lg text-[#b5c0a5] line-through">₹{MRP}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-medium text-white bg-[#c9a962] px-2 py-1 rounded">
                SAVE {Math.round((1 - PREPAID_PRICE/MRP) * 100)}%
              </span>
              <span className="text-xs text-[#5f7350]">Limited time offer</span>
            </div>
          </div>

          {/* Key Benefits - Premium */}
          <div className="space-y-4 mb-8">
            {[
              'Reduces fine lines & wrinkles in 4 weeks',
              '72-hour deep hydration with Hyaluronic Acid',
              'Boosts collagen naturally with Retinol',
            ].map((benefit, i) => (
              <div key={i} className="flex items-start gap-3" data-testid={`product-benefit-${i}`}>
                <div className="w-5 h-5 rounded-full bg-[#f6f7f4] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={12} className="text-[#5f7350]" />
                </div>
                <span className="text-premium-body text-sm">{benefit}</span>
              </div>
            ))}
          </div>

          {/* Trust Badges - Premium */}
          <div className="flex gap-6 py-5 border-y border-[#f3efe6] mb-8">
            {[
              { icon: Truck, label: 'Free Delivery' },
              { icon: Shield, label: 'Genuine Product' },
              { icon: Leaf, label: 'Organic' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-[#4a5a3f]">
                <item.icon size={16} className="text-[#5f7350]" />
                <span className="text-xs font-medium">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Buy Button - Premium */}
          <button
            onClick={() => setStep('checkout')}
            className="btn-premium w-full text-white font-medium py-4 rounded-full"
            data-testid="buy-now-button"
          >
            Buy Now — ₹{PREPAID_PRICE}
          </button>

          {/* Accordion Details - Premium */}
          <div className="mt-10 space-y-3">
            {[
              { title: 'Key Ingredients', content: 'Retinol (0.5%) for cell renewal, Hyaluronic Acid (2%) for deep hydration, Niacinamide (5%) for skin barrier, Vitamin E for protection, Premium Peptide Complex for firmness.' },
              { title: 'How to Use', content: 'Apply 2-3 drops on clean face every evening. Gently massage in upward circular motions. Allow to absorb for 2 minutes. Follow with your favorite moisturizer.' },
              { title: 'Clinical Results', content: '94% experienced improved hydration. 89% saw reduction in fine lines. 91% reported firmer skin. Results based on 8-week clinical study with 200 participants.' },
            ].map((section, i) => (
              <div key={i} className="border border-[#f3efe6] rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpandedSection(expandedSection === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left bg-[#fdfcfa]"
                  data-testid={`accordion-${i}`}
                >
                  <span className="font-medium text-[#1a2e1a]">{section.title}</span>
                  {expandedSection === i 
                    ? <ChevronUp size={18} className="text-[#96a883]" /> 
                    : <ChevronDown size={18} className="text-[#96a883]" />
                  }
                </button>
                {expandedSection === i && (
                  <div className="px-5 pb-5 bg-white">
                    <p className="text-premium-body text-sm">{section.content}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sticky Bottom Bar - Premium */}
        {showStickyBar && (
          <div className="sticky-bottom-bar">
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-xs text-[#96a883]">Price</p>
                <p className="text-lg font-semibold text-[#1a2e1a]">₹{PREPAID_PRICE}</p>
              </div>
              <button
                onClick={() => setStep('checkout')}
                className="btn-premium text-white font-medium py-3 px-8 rounded-full"
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

  // Checkout Form - Premium
  if (step === 'checkout') {
    return (
      <div className="pb-8 bg-[#fdfcfa] min-h-screen">
        <div className="px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <p className="text-xs tracking-[0.15em] uppercase text-[#c9a962] mb-2">Checkout</p>
            <h1 className="text-premium-heading text-2xl font-semibold" data-testid="checkout-title">
              Complete Your Order
            </h1>
          </div>

          {/* Order Summary Mini */}
          <div className="card-premium p-4 mb-8 flex items-center gap-4">
            <img src={PRODUCT_IMAGE} alt="Product" className="w-16 h-16 object-contain" />
            <div className="flex-1">
              <p className="text-sm font-medium text-[#1a2e1a]">Celesta Glow Serum</p>
              <p className="text-xs text-[#96a883]">30ml • Anti-Aging</p>
            </div>
            <p className="font-semibold text-[#5f7350]">₹{paymentMethod === 'prepaid' ? PREPAID_PRICE : COD_PRICE}</p>
          </div>

          <div className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-[#4a5a3f] mb-2">Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => { setFormData(prev => ({ ...prev, name: e.target.value })); setErrors(prev => ({ ...prev, name: '' })); }}
                placeholder="Enter your name"
                className={`input-premium ${errors.name ? 'border-red-300 bg-red-50' : ''}`}
                data-testid="name-input"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-[#4a5a3f] mb-2">Phone Number *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => { setFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })); setErrors(prev => ({ ...prev, phone: '' })); }}
                placeholder="10-digit mobile number"
                className={`input-premium ${errors.phone ? 'border-red-300 bg-red-50' : ''}`}
                data-testid="phone-input"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#4a5a3f] mb-2">Email (Optional)</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="For order updates"
                className="input-premium"
                data-testid="email-input"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-[#4a5a3f] mb-2">House/Flat No. *</label>
              <input
                type="text"
                value={formData.house_number}
                onChange={(e) => { setFormData(prev => ({ ...prev, house_number: e.target.value })); setErrors(prev => ({ ...prev, house_number: '' })); }}
                placeholder="House no., Building"
                className={`input-premium ${errors.house_number ? 'border-red-300 bg-red-50' : ''}`}
                data-testid="house-input"
              />
              {errors.house_number && <p className="text-red-500 text-xs mt-1">{errors.house_number}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4a5a3f] mb-2">Area/Locality *</label>
              <input
                type="text"
                value={formData.area}
                onChange={(e) => { setFormData(prev => ({ ...prev, area: e.target.value })); setErrors(prev => ({ ...prev, area: '' })); }}
                placeholder="Street, Colony, Area"
                className={`input-premium ${errors.area ? 'border-red-300 bg-red-50' : ''}`}
                data-testid="area-input"
              />
              {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#4a5a3f] mb-2">Pincode *</label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => handlePincodeChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit"
                  className={`input-premium ${errors.pincode ? 'border-red-300 bg-red-50' : ''}`}
                  data-testid="pincode-input"
                />
                {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4a5a3f] mb-2">State</label>
                <input
                  type="text"
                  value={formData.state}
                  readOnly
                  placeholder="Auto-detect"
                  className="input-premium bg-[#f6f7f4]"
                  data-testid="state-input"
                />
              </div>
            </div>
          </div>

          {/* Payment Method - Premium */}
          <div className="mt-10">
            <p className="text-xs tracking-[0.15em] uppercase text-[#c9a962] mb-4">Payment Method</p>
            
            <div className="space-y-3">
              <div 
                onClick={() => setPaymentMethod('prepaid')}
                className={`selection-premium ${paymentMethod === 'prepaid' ? 'active' : ''}`}
                data-testid="prepaid-option"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'prepaid' ? 'border-[#5f7350]' : 'border-[#d4daca]'}`}>
                    {paymentMethod === 'prepaid' && <div className="w-2.5 h-2.5 rounded-full bg-[#5f7350]" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[#1a2e1a]">Pay Online — ₹{PREPAID_PRICE}</p>
                    <p className="text-sm text-[#5f7350]">Save ₹{COD_PRICE - PREPAID_PRICE} + Fast Delivery</p>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => setPaymentMethod('cod')}
                className={`selection-premium ${paymentMethod === 'cod' ? 'active' : ''}`}
                data-testid="cod-option"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-[#5f7350]' : 'border-[#d4daca]'}`}>
                    {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-[#5f7350]" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[#1a2e1a]">Cash on Delivery — ₹{COD_PRICE}</p>
                    <p className="text-sm text-[#96a883]">Pay ₹{COD_ADVANCE} now + ₹{COD_PRICE - COD_ADVANCE} on delivery</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handlePayment}
            disabled={loading}
            className={`w-full mt-10 py-4 rounded-full font-medium transition-all ${loading ? 'bg-[#d4daca] text-[#96a883]' : 'btn-premium text-white'}`}
            data-testid="place-order-button"
          >
            {loading ? 'Processing...' : `Pay ₹${paymentMethod === 'prepaid' ? PREPAID_PRICE : COD_ADVANCE} & Place Order`}
          </button>

          <button
            onClick={() => setStep('product')}
            className="w-full mt-4 py-3 text-[#96a883] text-sm"
            data-testid="back-button"
          >
            ← Back to Product
          </button>
        </div>
      </div>
    );
  }

  // Order Confirmation - Premium
  if (step === 'confirmation' && orderConfirmed) {
    return (
      <div className="px-6 py-10 min-h-screen bg-[#fdfcfa]">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-[#e8ebe3] to-[#d4daca] rounded-full flex items-center justify-center mx-auto mb-5">
            <Check size={36} className="text-[#5f7350]" />
          </div>
          <h1 className="text-premium-heading text-2xl font-semibold mb-2" data-testid="confirmation-title">
            Order Confirmed
          </h1>
          <p className="text-[#96a883]">Thank you for choosing Celesta Glow</p>
        </div>

        <div className="card-premium p-6 text-center mb-8" data-testid="order-id-card">
          <p className="text-xs text-[#96a883] mb-2">Order ID</p>
          <p className="text-2xl font-bold text-[#5f7350] tracking-wider">{orderConfirmed.order_id}</p>
        </div>

        <div className="space-y-4">
          <div className="card-premium p-5">
            <p className="text-xs text-[#c9a962] tracking-wider uppercase mb-4">Order Details</p>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#96a883]">Product</span>
                <span className="text-[#1a2e1a] font-medium">Celesta Glow Serum</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#96a883]">Amount</span>
                <span className="text-[#5f7350] font-semibold">₹{orderConfirmed.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#96a883]">Payment</span>
                <span className="text-[#1a2e1a]">{orderConfirmed.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#96a883]">Delivery</span>
                <span className="text-[#1a2e1a]">{orderConfirmed.delivery_timeline}</span>
              </div>
            </div>
          </div>

          <div className="card-premium p-5">
            <p className="text-xs text-[#c9a962] tracking-wider uppercase mb-4">Delivery Address</p>
            <p className="text-sm text-[#4a5a3f] leading-relaxed">
              {orderConfirmed.name}<br />
              +91 {orderConfirmed.phone}<br />
              {orderConfirmed.house_number}, {orderConfirmed.area}<br />
              {orderConfirmed.state} - {orderConfirmed.pincode}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="btn-premium w-full mt-10 text-white font-medium py-4 rounded-full"
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
