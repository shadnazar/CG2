import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, Check, Truck, Shield, ChevronDown, ChevronUp, ChevronRight, Clock, Users, Flame, ShieldCheck, Award, Sparkles, TrendingUp } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const RAZORPAY_KEY = process.env.REACT_APP_RAZORPAY_KEY;

const PREPAID_PRICE = 599;
const COD_PRICE = 699;
const COD_ADVANCE = 99;
const MRP = 1499;

// New product image provided by user
const PRODUCT_IMAGE = 'https://customer-assets.emergentagent.com/job_fc697aed-c4ed-4c4b-8eec-b51bdf774715/artifacts/8mw94eq5_IMG_9115.png';

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
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 47, seconds: 33 });
  const [viewingNow, setViewingNow] = useState(18);
  const [stockLeft, setStockLeft] = useState(7);

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

    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; minutes = 59; seconds = 59; }
        return { hours, minutes, seconds };
      });
    }, 1000);

    // Random viewers
    const viewerInterval = setInterval(() => {
      setViewingNow(prev => Math.max(12, prev + Math.floor(Math.random() * 5) - 2));
    }, 4000);

    return () => { clearInterval(timer); clearInterval(viewerInterval); };
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
      <div className="pb-28">
        {/* Urgency Banner */}
        <div className="bg-red-500 text-white py-2 px-4 flex items-center justify-center gap-2 text-sm">
          <Flame size={16} className="animate-pulse" />
          <span className="font-semibold">FLASH SALE:</span>
          <div className="flex gap-1 font-mono font-bold">
            <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">{String(timeLeft.hours).padStart(2, '0')}</span>:
            <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">{String(timeLeft.minutes).padStart(2, '0')}</span>:
            <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">{String(timeLeft.seconds).padStart(2, '0')}</span>
          </div>
        </div>

        {/* Product Image - New Image */}
        <div className="bg-gradient-to-b from-gray-50 to-white py-6 flex justify-center relative">
          <img
            src={PRODUCT_IMAGE}
            alt="Celesta Glow Advanced Face Serum"
            className="w-72 h-auto"
            data-testid="product-image"
          />
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            60% OFF
          </div>
        </div>

        {/* Social Proof Banner */}
        <div className="flex justify-center gap-4 py-3 bg-yellow-50 border-y border-yellow-100 text-sm">
          <div className="flex items-center gap-1 text-orange-600">
            <Users size={14} />
            <span><strong>{viewingNow}</strong> viewing</span>
          </div>
          <div className="flex items-center gap-1 text-red-600">
            <Clock size={14} />
            <span>Only <strong>{stockLeft}</strong> left!</span>
          </div>
        </div>

        {/* Product Info */}
        <div className="px-5 py-5">
          <p className="text-xs text-gray-500 mb-1">CELESTA GLOW</p>
          <h1 className="text-xl font-bold text-gray-900 mb-2" data-testid="product-title">
            Super Anti-Aging Serum
          </h1>
          <p className="text-sm text-gray-600 mb-3">India's First 4-in-1 Age Balance Formula</p>
          
          {/* Rating */}
          <div className="flex items-center gap-2 mb-4" data-testid="product-rating">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className="star-gold" />
              ))}
            </div>
            <span className="text-gray-500 text-sm">4.8 (2,340 reviews)</span>
          </div>

          {/* Price Card */}
          <div className="card-cg mb-5" data-testid="product-price">
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-3xl font-bold text-green-600">₹{PREPAID_PRICE}</span>
              <span className="text-lg text-gray-400 line-through">₹{MRP}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white bg-red-500 px-2 py-1 rounded">
                SAVE ₹{MRP - PREPAID_PRICE}
              </span>
              <span className="text-xs text-red-600 font-medium">Limited Time Only!</span>
            </div>
          </div>

          {/* Age Regression Score - NEW */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5 mb-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600 font-medium mb-1">DERMATOLOGIST APPROVED</p>
                <p className="text-4xl font-bold text-green-600">95</p>
                <p className="text-sm text-gray-600">Age Regression Score</p>
              </div>
              <div className="text-right">
                <Award size={40} className="text-green-500 mb-2" />
                <p className="text-xs text-gray-500">Clinically Tested</p>
              </div>
            </div>
          </div>

          {/* Why Best for Anti-Aging - NEW */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Sparkles size={18} className="text-green-500" />
              Why We're #1 for Anti-Aging
            </h3>
            <div className="space-y-2.5">
              {[
                { text: 'Reduces wrinkles by 47% in 4 weeks', highlight: '47%' },
                { text: 'Boosts collagen production by 89%', highlight: '89%' },
                { text: 'Improves skin elasticity in 14 days', highlight: '14 days' },
                { text: '10,000+ happy customers across India', highlight: '10,000+' },
              ].map((benefit, i) => (
                <div key={i} className="check-item" data-testid={`product-benefit-${i}`}>
                  <div className="check-icon">
                    <Check size={12} />
                  </div>
                  <span className="text-gray-700 text-sm">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Results - NEW */}
          <div className="bg-gray-900 text-white rounded-2xl p-5 mb-5">
            <p className="text-xs text-green-400 font-medium mb-2">CLINICAL STUDY RESULTS</p>
            <h3 className="text-lg font-bold mb-4">Proven Anti-Aging Results</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-2xl font-bold text-green-400">94%</p>
                <p className="text-xs text-gray-400">Reduced Fine Lines</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">89%</p>
                <p className="text-xs text-gray-400">Firmer Skin</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">96%</p>
                <p className="text-xs text-gray-400">More Radiant</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">*Based on 8-week clinical trial with 200 participants</p>
          </div>

          {/* Powerful Ingredients - NEW */}
          <div className="mb-5">
            <h3 className="font-bold text-gray-900 mb-3">Powerful Anti-Aging Ingredients</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: '0.3% Retinol', benefit: 'Reduces wrinkles', color: 'bg-purple-50 border-purple-200' },
                { name: 'Hyaluronic Acid', benefit: '72hr hydration', color: 'bg-blue-50 border-blue-200' },
                { name: 'Niacinamide', benefit: 'Brightens skin', color: 'bg-yellow-50 border-yellow-200' },
                { name: 'Vitamin E', benefit: 'Protects & heals', color: 'bg-orange-50 border-orange-200' },
              ].map((item, i) => (
                <div key={i} className={`p-3 rounded-xl border ${item.color}`}>
                  <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                  <p className="text-xs text-gray-600">{item.benefit}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex gap-3 py-4 border-y border-gray-100 mb-5">
            {[
              { icon: Truck, label: 'Free Delivery' },
              { icon: ShieldCheck, label: 'Genuine' },
              { icon: Clock, label: '2-3 Days' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 text-gray-600">
                <item.icon size={16} className="text-green-500" />
                <span className="text-xs">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Buy Button */}
          <button
            onClick={() => setStep('checkout')}
            className="btn-cg-primary w-full py-4"
            data-testid="buy-now-button"
          >
            Order Now — ₹{PREPAID_PRICE}
            <ChevronRight size={20} />
          </button>

          <p className="text-center text-xs text-gray-500 mt-2">
            ✓ COD Available &nbsp; ✓ Easy Returns &nbsp; ✓ Secure Payment
          </p>

          {/* Money Back Guarantee */}
          <div className="mt-5 p-4 bg-green-50 border border-green-100 rounded-xl text-center">
            <p className="text-green-700 font-semibold text-sm">💯 100% Money Back Guarantee</p>
            <p className="text-green-600 text-xs mt-1">Not satisfied? Get full refund within 7 days</p>
          </div>

          {/* Expert Endorsement - NEW */}
          <div className="mt-5 p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-700 font-bold">DR</span>
              </div>
              <div>
                <p className="text-sm text-gray-700 italic">"Celesta Glow contains the gold standard of anti-aging ingredients. I recommend it to all my patients looking for effective, gentle anti-aging care."</p>
                <p className="text-xs text-gray-600 mt-2 font-medium">— Dr. Priya Sharma, Dermatologist</p>
              </div>
            </div>
          </div>

          {/* Why Choose Us - NEW */}
          <div className="mt-6 p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
            <h3 className="font-bold text-gray-900 mb-4 text-center">Why 10,000+ Choose Celesta Glow</h3>
            <div className="space-y-3">
              {[
                { icon: TrendingUp, title: 'Visible Results', desc: 'See younger skin in just 2-4 weeks' },
                { icon: Shield, title: 'Safe Formula', desc: 'Dermatologist tested, no harsh chemicals' },
                { icon: Award, title: 'Award Winning', desc: "India's #1 rated anti-aging serum" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-white p-3 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <item.icon size={18} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                    <p className="text-xs text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Accordion Details */}
          <div className="mt-6 space-y-2">
            {[
              { title: 'Key Ingredients', content: '0.3% Retinol for cell renewal, Niacinamide for brightening, Hyaluronic Acid for deep hydration, Vitamin E for protection against environmental damage.' },
              { title: 'How to Use', content: 'Cleanse face, apply 2-3 drops to face and neck avoiding eye area, follow with moisturizer. Use sunscreen during daytime. For retinol beginners, start 2-3 times per week.' },
              { title: 'Clinical Results', content: '94% saw improved hydration. 89% noticed reduced fine lines. 91% reported brighter, more youthful skin. Results from 8-week clinical study with 200 participants.' },
            ].map((section, i) => (
              <div key={i} className="faq-item">
                <button
                  onClick={() => setExpandedSection(expandedSection === i ? null : i)}
                  className="faq-header"
                  data-testid={`accordion-${i}`}
                >
                  <span className="text-sm">{section.title}</span>
                  {expandedSection === i 
                    ? <ChevronUp size={18} className="text-gray-400" /> 
                    : <ChevronDown size={18} className="text-gray-400" />
                  }
                </button>
                {expandedSection === i && (
                  <div className="faq-content text-xs">{section.content}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sticky Bottom CTA */}
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 p-3 z-50 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-xs text-red-500 font-medium">Only {stockLeft} left at this price!</p>
              <p className="font-bold text-gray-900">₹{PREPAID_PRICE} <span className="text-sm text-gray-400 line-through">₹{MRP}</span></p>
            </div>
            <button
              onClick={() => setStep('checkout')}
              className="btn-cg-primary py-3 px-5"
              data-testid="sticky-buy-button"
            >
              Buy Now <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Checkout Form
  if (step === 'checkout') {
    return (
      <div className="pb-8 bg-gray-50 min-h-screen">
        {/* Progress Indicator */}
        <div className="bg-white px-5 py-3 border-b border-gray-100">
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs">✓</span>
            <span className="text-gray-400">—</span>
            <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs">2</span>
            <span className="text-gray-400">—</span>
            <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs">3</span>
          </div>
          <p className="text-center text-xs text-gray-500 mt-1">Step 2: Shipping Details</p>
        </div>

        <div className="px-5 py-5">
          <h1 className="text-xl font-bold text-gray-900 mb-1" data-testid="checkout-title">
            Complete Your Order
          </h1>
          <p className="text-gray-500 text-sm mb-5">Fast & secure checkout</p>

          {/* Order Summary Mini */}
          <div className="card-cg mb-5 flex items-center gap-3 p-4">
            <img src={PRODUCT_IMAGE} alt="Product" className="w-14 h-14 object-contain" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">Super Anti-Aging Serum</p>
              <p className="text-gray-500 text-xs">30ml • 4-in-1 Formula</p>
            </div>
            <p className="font-bold text-green-600">₹{paymentMethod === 'prepaid' ? PREPAID_PRICE : COD_PRICE}</p>
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number *</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email (Optional)</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">House/Flat No. *</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Area/Locality *</label>
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Pincode *</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
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
          <div className="mt-6">
            <p className="font-semibold text-gray-900 mb-3">Payment Method</p>
            
            <div className="space-y-2">
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
                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${paymentMethod === 'prepaid' ? 'border-green-500' : 'border-gray-300'}`}>
                  {paymentMethod === 'prepaid' && <div className="w-2.5 h-2.5 rounded-full bg-green-500" />}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">Pay Online — ₹{PREPAID_PRICE}</p>
                  <p className="text-green-600 text-xs">💰 Save ₹{COD_PRICE - PREPAID_PRICE} + Fast Delivery</p>
                </div>
                <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded">BEST</span>
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
                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-green-500' : 'border-gray-300'}`}>
                  {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-green-500" />}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">Cash on Delivery — ₹{COD_PRICE}</p>
                  <p className="text-gray-500 text-xs">Pay ₹{COD_ADVANCE} now + ₹{COD_PRICE - COD_ADVANCE} on delivery</p>
                </div>
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">53% OFF</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handlePayment}
            disabled={loading}
            className={`w-full mt-6 py-4 rounded-full font-semibold transition-all ${loading ? 'bg-gray-300 text-gray-500' : 'btn-cg-primary'}`}
            data-testid="place-order-button"
          >
            {loading ? 'Processing...' : `Pay ₹${paymentMethod === 'prepaid' ? PREPAID_PRICE : COD_ADVANCE} & Place Order`}
          </button>

          {/* Trust Signals */}
          <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500">
            <span>🔒 Secure Checkout</span>
            <span>✓ 100% Genuine</span>
          </div>

          <button
            onClick={() => setStep('product')}
            className="w-full mt-3 py-2 text-gray-500 text-sm"
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
      <div className="px-5 py-8 min-h-screen">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1" data-testid="confirmation-title">
            Order Confirmed! 🎉
          </h1>
          <p className="text-gray-500">Thank you for choosing Celesta Glow</p>
        </div>

        <div className="card-cg text-center mb-5" data-testid="order-id-card">
          <p className="text-gray-500 text-sm mb-1">Order ID</p>
          <p className="text-2xl font-bold text-green-500 tracking-wider">{orderConfirmed.order_id}</p>
        </div>

        <div className="space-y-4">
          <div className="card-cg">
            <p className="font-semibold text-gray-900 mb-3">Order Details</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Product</span>
                <span className="text-gray-900 font-medium">Super Anti-Aging Serum</span>
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
            <p className="font-semibold text-gray-900 mb-3">Delivery Address</p>
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
          className="btn-cg-dark w-full mt-6"
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
