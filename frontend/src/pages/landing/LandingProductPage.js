/**
 * LandingProductPage.js
 * Product page within landing page funnel - has ALL features from main ProductPage
 * URL: /{slug}/product
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Star, Check, Truck, Shield, ChevronDown, ChevronUp, ChevronRight, ChevronLeft, Clock, Users, Flame, ShieldCheck, Award, Sparkles, TrendingUp, Gift, X, CreditCard, BadgeCheck, Phone, ArrowLeft } from 'lucide-react';
import DermatologistSection from '../../components/DermatologistSection';
import { useTracking } from '../../providers/TrackingProvider';
import { useLandingPage } from './LandingPageContext';
import { getSharedStats, updateSharedStats } from '../../utils/sharedStats';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const RAZORPAY_KEY = process.env.REACT_APP_RAZORPAY_KEY;

const PREPAID_PRICE = 699;
const COD_PRICE = 749;
const COD_ADVANCE = 49;
const COD_BALANCE = 700;
const MRP = 1499;
const DISCOUNT_AMOUNT = 50;
const EXIT_DISCOUNT_AMOUNT = 100;
const REFERRAL_DISCOUNT = 50;

const PRODUCT_IMAGE = 'https://customer-assets.emergentagent.com/job_050b785b-bdfe-40d2-9088-b4c5bddc18c5/artifacts/f3fkk4tr_IMG_9115.png';

// FAQ data
const FAQ_DATA = [
  { q: "How long until I see results?", a: "Most customers see visible improvement in 2-4 weeks with consistent use." },
  { q: "Is it safe for sensitive skin?", a: "Yes! Our formula is dermatologist-tested and suitable for all Indian skin types." },
  { q: "How do I use it?", a: "Apply 3-4 drops on clean skin every night before moisturizer." },
  { q: "What's your return policy?", a: "We offer a 30-day money-back guarantee if you're not satisfied." },
];

// Reviews data
const REVIEWS = [
  { name: "Priya M.", location: "Mumbai", rating: 5, text: "Saw visible results in just 2 weeks! My fine lines have reduced significantly.", verified: true },
  { name: "Anita S.", location: "Delhi", rating: 5, text: "Finally found something that actually works. My skin feels so smooth!", verified: true },
  { name: "Rekha K.", location: "Bangalore", rating: 5, text: "Best anti-aging product I've tried. Everyone asks about my skincare secret!", verified: true },
];

function LandingProductPage() {
  const navigate = useNavigate();
  const { trackPageVisit, trackViewContent, trackInitiateCheckout, trackAction, getVisitorId, getSessionId } = useTracking();
  const { slug, pageData, loading: pageLoading, error: pageError, productName, productTagline, productDescription, getHeroUrl, getCheckoutUrl } = useLandingPage();
  
  const [step, setStep] = useState('product');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', house_number: '', area: '', pincode: '', state: '' });
  const [errors, setErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('prepaid');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 47, seconds: 33 });
  const [viewingNow, setViewingNow] = useState(() => getSharedStats().viewingNow);
  const [soldToday, setSoldToday] = useState(() => getSharedStats().soldToday);
  
  // Discount state
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(DISCOUNT_AMOUNT);
  
  // Referral state
  const [referralCode, setReferralCode] = useState(null);
  const [referralDiscount, setReferralDiscount] = useState(0);
  
  const pageStartTime = useRef(Date.now());

  // Check referral code
  useEffect(() => {
    const refCode = new URLSearchParams(window.location.search).get('ref') || sessionStorage.getItem('referralCode');
    if (refCode) validateReferralCode(refCode);
  }, []);

  const validateReferralCode = async (code) => {
    try {
      const res = await axios.post(`${API}/referral/validate?referral_code=${code}`);
      if (res.data.valid) {
        setReferralCode(code);
        setReferralDiscount(REFERRAL_DISCOUNT);
        sessionStorage.setItem('referralCode', code);
      }
    } catch (err) {
      sessionStorage.removeItem('referralCode');
    }
  };

  // Track page visits
  useEffect(() => {
    trackPageVisit(`landing_${slug}_product`);
    trackViewContent(productName, PREPAID_PRICE);
    checkDiscountStatus();

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

    const viewerInterval = setInterval(() => {
      const stats = getSharedStats();
      setViewingNow(stats.viewingNow);
      setSoldToday(stats.soldToday);
    }, 2000);

    return () => { 
      clearInterval(timer);
      clearInterval(viewerInterval);
    };
  }, [slug, productName, trackPageVisit, trackViewContent]);

  // Track checkout step
  useEffect(() => {
    if (step === 'checkout') {
      trackPageVisit(`landing_${slug}_checkout`);
      trackAction('view_checkout', { step: 'checkout_started', from_landing: slug });
      trackInitiateCheckout(PREPAID_PRICE);
    }
  }, [step, slug, trackPageVisit, trackAction, trackInitiateCheckout]);

  const checkDiscountStatus = () => {
    const exitDiscountClaimed = localStorage.getItem('exitDiscountClaimed');
    const regularDiscountClaimed = localStorage.getItem('discountClaimed');
    
    if (exitDiscountClaimed) {
      setHasDiscount(true);
      setDiscountApplied(true);
      setDiscountAmount(EXIT_DISCOUNT_AMOUNT);
    } else if (regularDiscountClaimed) {
      setHasDiscount(true);
      setDiscountApplied(true);
      setDiscountAmount(DISCOUNT_AMOUNT);
    }
  };

  const getFinalPrepaidPrice = () => {
    let price = PREPAID_PRICE;
    if (hasDiscount) price -= discountAmount;
    if (referralDiscount > 0) price -= referralDiscount;
    return Math.max(price, 0);
  };

  const getFinalCodPrice = () => {
    let price = COD_PRICE;
    if (hasDiscount) price -= discountAmount;
    if (referralDiscount > 0) price -= referralDiscount;
    return Math.max(price, 0);
  };

  const getTotalDiscount = () => {
    let discount = 0;
    if (hasDiscount) discount += discountAmount;
    if (referralDiscount > 0) discount += referralDiscount;
    return discount;
  };

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

    let amountToCharge = paymentMethod === 'prepaid' ? getFinalPrepaidPrice() : COD_ADVANCE;
    trackInitiateCheckout(paymentMethod === 'prepaid' ? getFinalPrepaidPrice() : getFinalCodPrice());
    
    try {
      const loaded = await loadRazorpay();
      if (!loaded) { alert('Failed to load payment gateway.'); setLoading(false); return; }

      const orderResponse = await axios.post(`${API}/create-razorpay-order`, { amount: amountToCharge });
      
      const options = {
        key: RAZORPAY_KEY,
        amount: orderResponse.data.amount,
        currency: 'INR',
        name: 'Celesta Glow',
        description: paymentMethod === 'prepaid' ? productName : 'COD Advance',
        order_id: orderResponse.data.id,
        handler: async function (response) {
          try {
            await axios.post(`${API}/verify-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            const finalPrice = paymentMethod === 'prepaid' ? getFinalPrepaidPrice() : getFinalCodPrice();
            const order = await axios.post(`${API}/orders`, {
              ...formData,
              payment_method: paymentMethod === 'prepaid' ? 'Prepaid' : 'COD (Advance Paid)',
              amount: finalPrice,
              discount_applied: discountApplied ? discountAmount : 0,
              referral_code: referralCode || null,
              referral_discount: referralDiscount || 0,
              landing_page_slug: slug // Track which landing page
            });
            
            // Track conversion for landing page
            trackAction('landing_conversion', { slug, order_id: order.data.order_id });
            
            // Record conversion in backend
            axios.post(`${API}/landing-pages/public/${slug}/convert`).catch(() => {});
            
            // Navigate to order success within landing page funnel
            navigate(`/${slug}/order-success/${order.data.order_id}`);
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

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <Link to="/" className="text-purple-600 underline">Go to Homepage</Link>
        </div>
      </div>
    );
  }

  // CHECKOUT VIEW
  if (step === 'checkout') {
    return (
      <div className="min-h-screen bg-gray-50 pb-8">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-30 px-4 py-3">
          <div className="max-w-lg mx-auto flex items-center gap-3">
            <button onClick={() => setStep('product')} className="p-2 -ml-2 text-gray-600">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="font-bold text-gray-900">Secure Checkout</h1>
              <p className="text-xs text-gray-500">{productName}</p>
            </div>
          </div>
        </div>

        <div className="max-w-lg mx-auto p-4 space-y-4">
          {/* Order Summary */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex gap-4">
              <img src={PRODUCT_IMAGE} alt={productName} className="w-20 h-20 object-contain rounded-xl bg-gray-50" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{productName}</h3>
                <p className="text-sm text-gray-500">{productTagline}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-lg font-bold text-green-600">₹{paymentMethod === 'prepaid' ? getFinalPrepaidPrice() : getFinalCodPrice()}</span>
                  <span className="text-sm text-gray-400 line-through">₹{MRP}</span>
                </div>
              </div>
            </div>
            
            {/* Discount Applied */}
            {getTotalDiscount() > 0 && (
              <div className="mt-3 pt-3 border-t border-dashed flex items-center justify-between text-green-600 text-sm font-medium">
                <span className="flex items-center gap-1"><Gift size={16} /> Discount Applied</span>
                <span>-₹{getTotalDiscount()}</span>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Payment Method</h3>
            <div className="space-y-2">
              <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'prepaid' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                <input type="radio" name="payment" checked={paymentMethod === 'prepaid'} onChange={() => setPaymentMethod('prepaid')} className="sr-only" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Pay Online ₹{getFinalPrepaidPrice()}</p>
                  <p className="text-xs text-gray-500">UPI, Cards, Net Banking</p>
                </div>
                {paymentMethod === 'prepaid' && <Check className="text-green-500" size={24} />}
              </label>
              
              <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="sr-only" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Cash on Delivery ₹{getFinalCodPrice()}</p>
                  <p className="text-xs text-gray-500">Pay ₹{COD_ADVANCE} now, ₹{getFinalCodPrice() - COD_ADVANCE} at delivery</p>
                </div>
                {paymentMethod === 'cod' && <Check className="text-green-500" size={24} />}
              </label>
            </div>
          </div>

          {/* Delivery Address Form */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Delivery Address</h3>
            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border ${errors.name ? 'border-red-500' : 'border-gray-200'} focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              
              <div>
                <div className="flex">
                  <span className="px-4 py-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-500">+91</span>
                  <input
                    type="tel"
                    placeholder="Phone Number *"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                    className={`flex-1 px-4 py-3 rounded-r-xl border ${errors.phone ? 'border-red-500' : 'border-gray-200'} focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none`}
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
              
              <input
                type="email"
                placeholder="Email (Optional)"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
              />
              
              <div>
                <input
                  type="text"
                  placeholder="House/Flat/Building No. *"
                  value={formData.house_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, house_number: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border ${errors.house_number ? 'border-red-500' : 'border-gray-200'} focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none`}
                />
                {errors.house_number && <p className="text-red-500 text-xs mt-1">{errors.house_number}</p>}
              </div>
              
              <div>
                <input
                  type="text"
                  placeholder="Area/Locality/Street *"
                  value={formData.area}
                  onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border ${errors.area ? 'border-red-500' : 'border-gray-200'} focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none`}
                />
                {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    placeholder="Pincode *"
                    value={formData.pincode}
                    onChange={(e) => handlePincodeChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.pincode ? 'border-red-500' : 'border-gray-200'} focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none`}
                  />
                  {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                </div>
                <input
                  type="text"
                  placeholder="State"
                  value={formData.state}
                  readOnly
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Shield size={16} /> Secure Payment</span>
            <span className="flex items-center gap-1"><Truck size={16} /> Free Shipping</span>
          </div>

          {/* Pay Button */}
          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 text-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              paymentMethod === 'prepaid' 
                ? `Pay ₹${getFinalPrepaidPrice()} Now` 
                : `Pay ₹${COD_ADVANCE} Now (₹${getFinalCodPrice() - COD_ADVANCE} at delivery)`
            )}
          </button>
        </div>
      </div>
    );
  }

  // PRODUCT VIEW
  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Back to Landing */}
      <div className="bg-white border-b sticky top-0 z-30 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => navigate(getHeroUrl())} className="p-2 -ml-2 text-gray-600">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="font-bold text-gray-900">{productName}</h1>
            <p className="text-xs text-gray-500">{productTagline}</p>
          </div>
        </div>
      </div>

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

      {/* Live Stats */}
      <div className="bg-orange-50 border-b border-orange-100 px-4 py-2 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-orange-600" />
          <span className="text-orange-800"><b>{viewingNow}</b> viewing now</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-green-600" />
          <span className="text-green-800"><b>{soldToday}</b> sold today</span>
        </div>
      </div>

      {/* Product Image */}
      <div className="p-4">
        <div className="relative aspect-square max-w-sm mx-auto rounded-2xl overflow-hidden bg-gradient-to-b from-purple-50 to-white">
          <img src={PRODUCT_IMAGE} alt={productName} className="w-full h-full object-contain" />
          <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
            53% OFF
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="px-4 space-y-4">
        {/* Title & Rating */}
        <div>
          <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium mb-2">
            {productTagline}
          </span>
          <h1 className="text-2xl font-bold text-gray-900">{productName}</h1>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex">
              {[1,2,3,4,5].map(i => <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />)}
            </div>
            <span className="text-sm text-gray-600">4.9 (2,847 reviews)</span>
          </div>
        </div>

        {/* Price */}
        <div className="bg-green-50 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl font-bold text-green-600">₹{getFinalPrepaidPrice()}</span>
            <span className="text-xl text-gray-400 line-through">₹{MRP}</span>
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">SAVE ₹{MRP - getFinalPrepaidPrice()}</span>
          </div>
          {getTotalDiscount() > 0 && (
            <div className="flex items-center gap-2 text-green-700 text-sm">
              <Gift size={16} />
              <span>₹{getTotalDiscount()} discount applied!</span>
            </div>
          )}
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <span className="flex items-center gap-1"><Truck size={16} className="text-green-600" /> Free Delivery</span>
            <span className="flex items-center gap-1"><Clock size={16} className="text-green-600" /> 2-3 Days</span>
          </div>
        </div>

        {/* Key Benefits */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Sparkles, text: "0.3% Retinol", sub: "Anti-wrinkle" },
            { icon: Shield, text: "Hyaluronic Acid", sub: "Deep hydration" },
            { icon: Award, text: "5% Niacinamide", sub: "Brightening" },
            { icon: ShieldCheck, text: "Vitamin E", sub: "Protection" },
          ].map((item, idx) => (
            <div key={idx} className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
              <item.icon size={24} className="text-purple-600" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">{item.text}</p>
                <p className="text-xs text-gray-500">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Product Description */}
        <div className="bg-purple-50 rounded-2xl p-4">
          <h3 className="font-semibold text-gray-900 mb-2">About This Product</h3>
          <p className="text-gray-700 text-sm leading-relaxed">{productDescription}</p>
        </div>

        {/* FAQs */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Frequently Asked Questions</h3>
          <div className="space-y-2">
            {FAQ_DATA.map((faq, idx) => (
              <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left"
                >
                  <span className="font-medium text-gray-900">{faq.q}</span>
                  {expandedFaq === idx ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {expandedFaq === idx && (
                  <div className="px-4 pb-3 text-gray-600 text-sm">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Customer Reviews</h3>
          <div className="space-y-3">
            {REVIEWS.map((review, idx) => (
              <div key={idx} className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 font-bold">
                    {review.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm flex items-center gap-1">
                      {review.name}
                      {review.verified && <BadgeCheck size={14} className="text-green-500" />}
                    </p>
                    <p className="text-xs text-gray-500">{review.location}</p>
                  </div>
                  <div className="ml-auto flex">
                    {[...Array(review.rating)].map((_, i) => <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />)}
                  </div>
                </div>
                <p className="text-gray-700 text-sm">"{review.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Buy Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-green-500 p-3 z-50 shadow-2xl">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="flex-1">
            <p className="font-bold text-gray-900 text-lg">₹{getFinalPrepaidPrice()} <span className="text-sm text-gray-400 line-through">₹{MRP}</span></p>
            <p className="text-xs text-green-600">Free Shipping • COD Available</p>
          </div>
          <button
            onClick={() => setStep('checkout')}
            className="py-3 px-8 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl text-lg shadow-lg"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default LandingProductPage;
