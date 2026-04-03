import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Star, Check, Truck, Shield, ChevronDown, ChevronUp, ChevronRight, ChevronLeft, Clock, Users, Flame, ShieldCheck, Award, Sparkles, TrendingUp, Gift, X, CreditCard, BadgeCheck, Verified, Phone } from 'lucide-react';
import DermatologistSection from '../components/DermatologistSection';
import { useTracking } from '../providers/TrackingProvider';
import { getSharedStats, updateSharedStats } from '../utils/sharedStats';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const RAZORPAY_KEY = process.env.REACT_APP_RAZORPAY_KEY;

const PREPAID_PRICE = 699;
const COD_PRICE = 699;  // Total COD price (₹49 advance + ₹650 at delivery)
const COD_ADVANCE = 49; // Booking amount for COD
const COD_BALANCE = 650; // Balance to pay at delivery
const MRP = 1499;
const DISCOUNT_AMOUNT = 50;
const EXIT_DISCOUNT_AMOUNT = 100;
const REFERRAL_DISCOUNT = 50; // Referred customer gets ₹50 off

// User uploaded bottle product image - with packaging
const PRODUCT_IMAGE = 'https://customer-assets.emergentagent.com/job_050b785b-bdfe-40d2-9088-b4c5bddc18c5/artifacts/f3fkk4tr_IMG_9115.png';

function ProductPage() {
  const navigate = useNavigate();
  const { trackPageVisit, trackViewContent, trackInitiateCheckout, trackPurchase, trackAction, getVisitorId, getSessionId } = useTracking();
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
  const [viewingNow, setViewingNow] = useState(() => getSharedStats().viewingNow);
  const [soldToday, setSoldToday] = useState(() => getSharedStats().soldToday);
  const [stockLeft, setStockLeft] = useState(7);
  const pageStartTime = useRef(Date.now());
  
  // Discount state
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(DISCOUNT_AMOUNT);
  
  // Referral state
  const [referralCode, setReferralCode] = useState(null);
  const [referralDiscount, setReferralDiscount] = useState(0);
  const [referralData, setReferralData] = useState(null);
  
  // Exit-Intent Popup state
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [exitPopupShown, setExitPopupShown] = useState(false);

  // Check for referral code in URL or sessionStorage on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref') || sessionStorage.getItem('referralCode');
    if (refCode) {
      validateReferralCode(refCode);
    }
  }, []);

  const validateReferralCode = async (code) => {
    try {
      const res = await axios.post(`${API}/referral/validate?referral_code=${code}`);
      if (res.data.valid) {
        setReferralCode(code);
        setReferralDiscount(REFERRAL_DISCOUNT); // Fixed ₹50 discount for referred customer
        setReferralData(res.data.referral);
        // Store in sessionStorage so it persists across page navigation
        sessionStorage.setItem('referralCode', code);
        sessionStorage.setItem('referralValidated', 'true');
        console.log('[Referral] Code validated and discount applied:', code);
        // Also track the click
        axios.post(`${API}/referral/track-click?referral_code=${code}&visitor_id=${getVisitorId()}`).catch(() => {});
      }
    } catch (err) {
      console.log('Invalid referral code');
      sessionStorage.removeItem('referralCode');
      sessionStorage.removeItem('referralValidated');
    }
  };

  // Track checkout visits when step changes
  useEffect(() => {
    if (step === 'checkout') {
      // Track checkout page visit
      trackPageVisit('checkout');
      
      // Track action for user journey
      trackAction('view_checkout', { step: 'checkout_started' });
      
      // Track with InitiateCheckout pixel
      trackInitiateCheckout(PREPAID_PRICE);
    }
  }, [step, trackPageVisit, trackAction, trackInitiateCheckout]);

  // Track address entry when user starts filling address fields
  const handleAddressFieldChange = (field, value, setter) => {
    setter(value);
    
    // Track when user starts entering address (first time)
    if (value.length === 1 && ['house_number', 'area', 'pincode'].includes(field)) {
      trackAction('address_entry_started', { field, has_address: true });
      
      // Also track to Meta Pixel
      if (window.fbq) {
        window.fbq('trackCustom', 'AddressEntryStarted', { field });
      }
    }
    
    // Track when address is substantially filled
    if (field === 'pincode' && value.length === 6) {
      trackAction('address_complete', { has_address: true, address_entered: true });
      
      // Meta Pixel custom event
      if (window.fbq) {
        window.fbq('trackCustom', 'AddressComplete', { pincode: value });
      }
    }
  };

  useEffect(() => {
    // Track page visit (deduplicated in provider)
    trackPageVisit('product');
    
    // Meta Pixel - ViewContent
    trackViewContent('Super Anti-Aging Serum', PREPAID_PRICE);

    // Check if user has claimed discount
    checkDiscountStatus();

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

    // Sync viewers count with shared stats
    const viewerInterval = setInterval(() => {
      const stats = getSharedStats();
      setViewingNow(stats.viewingNow);
      setSoldToday(stats.soldToday);
    }, 2000);

    // Exit-Intent Detection (Desktop)
    const handleMouseLeave = (e) => {
      // Detect if mouse is leaving through the top of the page
      if (e.clientY <= 0 && !exitPopupShown && !localStorage.getItem('exitPopupShown')) {
        setShowExitPopup(true);
        setExitPopupShown(true);
        localStorage.setItem('exitPopupShown', 'true');
        trackAction('exit_intent', { page: 'product' });
      }
    };

    // Add exit-intent listener
    document.addEventListener('mouseleave', handleMouseLeave);

    // Track time on page when leaving
    return () => { 
      const timeOnPage = Math.round((Date.now() - pageStartTime.current) / 1000);
      trackAction('time_on_page', { page: 'product', seconds: timeOnPage });
      clearInterval(timer); 
      clearInterval(viewerInterval);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [exitPopupShown, trackPageVisit, trackViewContent, trackAction]);

  // DOM-level Click Listener for InitiateCheckout - EVENT DELEGATION PATTERN
  // Uses capture phase (true) to ensure event fires before any other handlers
  useEffect(() => {
    function handleInitiateCheckoutClick(e) {
      if (e.target && (e.target.innerText.includes('Buy Now') || e.target.innerText.includes('Order Now'))) {
        if (typeof fbq === 'function') {
          fbq('track', 'InitiateCheckout', { value: 699, currency: 'INR' });
          console.log('[Meta Pixel DOM] InitiateCheckout fired on button click');
        }
      }
    }

    // Add listener with capture phase (true) for maximum reliability
    document.addEventListener('click', handleInitiateCheckoutClick, true);

    return () => {
      document.removeEventListener('click', handleInitiateCheckoutClick, true);
    };
  }, []);

  // Check if user has a discount - Auto apply if claimed
  const checkDiscountStatus = async () => {
    // Check localStorage for claimed discount - AUTO APPLY
    // Priority: Exit discount (₹100) > Regular discount (₹50)
    const exitDiscountClaimed = localStorage.getItem('exitDiscountClaimed');
    const regularDiscountClaimed = localStorage.getItem('discountClaimed');
    
    if (exitDiscountClaimed) {
      setHasDiscount(true);
      setDiscountApplied(true);
      setDiscountAmount(EXIT_DISCOUNT_AMOUNT); // ₹100
    } else if (regularDiscountClaimed) {
      setHasDiscount(true);
      setDiscountApplied(true);
      setDiscountAmount(DISCOUNT_AMOUNT); // ₹50
    }
  };

  // Calculate prices with discount - ALWAYS apply if has discount
  const getFinalPrepaidPrice = () => {
    let price = PREPAID_PRICE;
    if (hasDiscount) {
      price -= discountAmount;
    }
    // Apply referral discount (₹100)
    if (referralDiscount > 0) {
      price -= referralDiscount;
    }
    return Math.max(price, 0);
  };

  const getFinalCodPrice = () => {
    let price = COD_PRICE;
    if (hasDiscount) {
      price -= discountAmount;
    }
    // Apply referral discount (₹100)
    if (referralDiscount > 0) {
      price -= referralDiscount;
    }
    return Math.max(price, 0);
  };

  // Get total discount amount for display
  const getTotalDiscount = () => {
    let discount = 0;
    if (hasDiscount) discount += discountAmount;
    if (referralDiscount > 0) discount += referralDiscount;
    return discount;
  };

  // Check for discount when phone entered (for users who didn't use popup)
  const checkPhoneDiscount = async (phone) => {
    if (phone.length === 10) {
      try {
        const res = await axios.get(`${API}/validate-discount?phone=${phone}`);
        if (res.data.valid) {
          setHasDiscount(true);
          setDiscountApplied(true);
        }
      } catch (err) {
        // Silent fail
      }
    }
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

    // Calculate final amount with discount (use dynamic discount amount)
    const baseAmount = paymentMethod === 'prepaid' ? PREPAID_PRICE : COD_ADVANCE;
    const amount = discountApplied ? Math.max(baseAmount - discountAmount, 0) : baseAmount;
    
    // Track InitiateCheckout
    trackInitiateCheckout(paymentMethod === 'prepaid' ? getFinalPrepaidPrice() : getFinalCodPrice());
    
    try {
      const loaded = await loadRazorpay();
      if (!loaded) { alert('Failed to load payment gateway.'); setLoading(false); return; }

      const orderResponse = await axios.post(`${API}/create-razorpay-order`, { amount: amount > 0 ? amount : 1 });
      
      // Track AddPaymentInfo
      trackAction('add_payment_info', { payment_method: paymentMethod, amount: amount });
      
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

            const finalPrice = paymentMethod === 'prepaid' ? getFinalPrepaidPrice() : getFinalCodPrice();
            const order = await axios.post(`${API}/orders`, {
              ...formData,
              payment_method: paymentMethod === 'prepaid' ? 'Prepaid' : 'COD (Advance Paid)',
              amount: finalPrice,
              discount_applied: discountApplied ? discountAmount : 0,
              referral_code: referralCode || null,
              referral_discount: referralDiscount || 0
            });
            
            // REDIRECT to Order Success Page - Meta Pixel will fire Purchase there
            // This creates a real URL change that Meta can track properly
            navigate(`/order-success/${order.data.order_id}`);
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

        {/* Back Button */}
        <div className="px-4 py-3 border-b border-gray-100">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors">
            <ChevronLeft size={20} />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
        </div>

        {/* Product Image - Bottle Image - Larger Size */}
        <div className="bg-gradient-to-b from-gray-50 to-white py-8 flex justify-center relative">
          <img
            src={PRODUCT_IMAGE}
            alt="Celesta Glow Advanced Face Serum"
            className="w-80 h-auto max-w-full"
            data-testid="product-image"
          />
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            53% OFF
          </div>
        </div>

        {/* Social Proof Banner */}
        <div className="flex justify-center gap-4 py-3 bg-yellow-50 border-y border-yellow-100 text-sm">
          <div className="flex items-center gap-1 text-orange-600">
            <Users size={14} />
            <span><strong>{viewingNow}</strong> viewing</span>
          </div>
          <div className="flex items-center gap-1 text-green-600">
            <Flame size={14} />
            <span><strong>{soldToday}</strong> sold today</span>
          </div>
          <div className="flex items-center gap-1 text-red-600">
            <Clock size={14} />
            <span>Only <strong>{stockLeft}</strong> left!</span>
          </div>
        </div>
        
        {/* Referral Discount Banner - Shows when referral code is applied */}
        {referralDiscount > 0 && (
          <div className="mx-4 mt-3 p-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl shadow-lg" data-testid="referral-discount-banner">
            <div className="flex items-center gap-2">
              <Gift size={20} />
              <div>
                <p className="font-bold text-sm">🎉 Friend's Referral Applied!</p>
                <p className="text-xs opacity-90">You're saving extra ₹{REFERRAL_DISCOUNT} on this order</p>
              </div>
            </div>
          </div>
        )}

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

          {/* Powerful Ingredients - ENHANCED VISUAL */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </span>
              Powerful Active Ingredients
            </h3>
            <div className="space-y-3">
              {[
                { 
                  name: '0.3% Retinol', 
                  benefit: 'Gold standard for wrinkle reduction', 
                  detail: 'Clinically proven to boost collagen',
                  gradient: 'from-purple-500 to-indigo-600',
                  bgGradient: 'from-purple-50 to-indigo-50',
                  icon: '✨'
                },
                { 
                  name: 'Hyaluronic Acid', 
                  benefit: '72-hour deep hydration', 
                  detail: 'Holds 1000x its weight in water',
                  gradient: 'from-blue-500 to-cyan-500',
                  bgGradient: 'from-blue-50 to-cyan-50',
                  icon: '💧'
                },
                { 
                  name: '5% Niacinamide', 
                  benefit: 'Brightens & evens skin tone', 
                  detail: 'Minimizes pores & dark spots',
                  gradient: 'from-amber-500 to-orange-500',
                  bgGradient: 'from-amber-50 to-orange-50',
                  icon: '☀️'
                },
                { 
                  name: 'Vitamin E Complex', 
                  benefit: 'Protects against damage', 
                  detail: 'Powerful antioxidant shield',
                  gradient: 'from-green-500 to-emerald-500',
                  bgGradient: 'from-green-50 to-emerald-50',
                  icon: '🛡️'
                },
              ].map((item, i) => (
                <div key={i} className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${item.bgGradient} border border-gray-100`}>
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white text-xl shadow-lg`}>
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-700 font-medium">{item.benefit}</p>
                        <p className="text-xs text-gray-500 mt-1">{item.detail}</p>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                        <Check size={14} className="text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dermatologist Recommendations - After Active Ingredients */}
          <DermatologistSection />

          {/* Trust Badges - ENHANCED */}
          <div className="grid grid-cols-3 gap-2 py-5 border-y border-gray-100 mb-5">
            {[
              { icon: Truck, label: 'Free Delivery', sublabel: 'All India' },
              { icon: ShieldCheck, label: '100% Genuine', sublabel: 'Authentic' },
              { icon: Clock, label: 'Fast Shipping', sublabel: '2-3 Days' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-1">
                  <item.icon size={18} className="text-green-600" />
                </div>
                <p className="text-xs font-semibold text-gray-900">{item.label}</p>
                <p className="text-[10px] text-gray-500">{item.sublabel}</p>
              </div>
            ))}
          </div>

          {/* Buy Button */}
          <button
            onClick={() => {
              trackAction('cta_click', { button: 'buy_now_main', page: 'product_page' });
              
              // CRITICAL: Fire InitiateCheckout on BUTTON CLICK (not page render)
              trackInitiateCheckout(PREPAID_PRICE);
              
              // Direct fbq call for InitiateCheckout - fires immediately on click
              if (typeof window !== 'undefined' && window.fbq) {
                window.fbq('track', 'InitiateCheckout', {
                  content_category: 'Skincare',
                  content_ids: ['celestaglow_serum_001'],
                  num_items: 1,
                  value: PREPAID_PRICE,
                  currency: 'INR'
                });
                console.log('[Meta Pixel] InitiateCheckout fired on Buy Now click');
              }
              
              setStep('checkout');
            }}
            className="btn-cg-primary w-full py-4"
            data-testid="buy-now-button"
          >
            Order Now  ₹{PREPAID_PRICE}
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

          {/* Why Choose Us - ENHANCED */}
          <div className="mt-6 p-5 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl">
            <h3 className="font-bold mb-4 text-center flex items-center justify-center gap-2 text-white">
              <Award className="text-green-400" size={20} />
              <span className="text-white">Why 10,000+ Choose Celesta Glow</span>
            </h3>
            <div className="space-y-3">
              {[
                { icon: TrendingUp, title: 'Visible Results', desc: 'See younger skin in just 2-4 weeks', stat: '94%' },
                { icon: Shield, title: 'Safe Formula', desc: 'Dermatologist tested, no harsh chemicals', stat: '100%' },
                { icon: Award, title: 'Award Winning', desc: "India's #1 rated anti-aging serum", stat: '#1' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/15 backdrop-blur p-3 rounded-xl">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <item.icon size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white text-sm">{item.title}</p>
                    <p className="text-xs text-gray-200">{item.desc}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-400">{item.stat}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Accordion Details - ENHANCED VISUAL */}
          <div className="mt-6 space-y-3">
            <h3 className="font-bold text-gray-900 mb-2">Product Details</h3>
            {[
              { 
                title: '🧪 Key Ingredients', 
                content: '0.3% Retinol for cell renewal, Niacinamide for brightening, Hyaluronic Acid for deep hydration, Vitamin E for protection against environmental damage.',
                highlight: '4-in-1 Formula'
              },
              { 
                title: '📝 How to Use', 
                content: 'Cleanse face, apply 2-3 drops to face and neck avoiding eye area, follow with moisturizer. Use sunscreen during daytime. For retinol beginners, start 2-3 times per week.',
                highlight: 'Night Use Only'
              },
              { 
                title: '📊 Clinical Results', 
                content: '94% saw improved hydration. 89% noticed reduced fine lines. 91% reported brighter, more youthful skin. Results from 8-week clinical study with 200 participants.',
                highlight: '8-Week Study'
              },
              { 
                title: '📦 What\'s Included', 
                content: '30ml Premium Anti-Aging Serum in airless pump bottle, detailed usage guide, satisfaction guarantee card. Package includes protective box for safe delivery.',
                highlight: '30ml Bottle'
              },
            ].map((section, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <button
                  onClick={() => {
                    setExpandedSection(expandedSection === i ? null : i);
                    trackAction('faq_interaction', { section: section.title });
                  }}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  data-testid={`accordion-${i}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-900">{section.title}</span>
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      {section.highlight}
                    </span>
                  </div>
                  {expandedSection === i 
                    ? <ChevronUp size={18} className="text-green-500" /> 
                    : <ChevronDown size={18} className="text-gray-400" />
                  }
                </button>
                {expandedSection === i && (
                  <div className="px-4 pb-4 pt-0">
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-600 leading-relaxed">{section.content}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Final Trust Section */}
          <div className="mt-6 text-center pb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <p className="text-sm text-gray-600">Rated 4.8/5 by 2,340+ customers</p>
            <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-500">
              <span>✓ FDA Approved</span>
              <span>✓ Cruelty Free</span>
              <span>✓ Made in India</span>
            </div>
          </div>
        </div>

      {/* Trust Badges Section */}
      <div className="px-4 pb-32">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-4 mb-20">
            <p className="text-center text-xs font-semibold text-green-700 mb-3">TRUSTED BY 10,000+ CUSTOMERS</p>
            <div className="grid grid-cols-4 gap-2">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-1">
                  <BadgeCheck className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-[10px] text-gray-600">100% Genuine</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-1">
                  <Verified className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-[10px] text-gray-600">Dermatologist Tested</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-1">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-[10px] text-gray-600">Secure Payment</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-1">
                  <Truck className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-[10px] text-gray-600">Free Delivery</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 mt-3 pt-3 border-t border-green-100">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/200px-UPI-Logo-vector.svg.png" alt="UPI" className="h-5 opacity-70" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png" alt="Mastercard" className="h-5 opacity-70" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png" alt="Visa" className="h-4 opacity-70" />
            </div>
          </div>
        </div>

        {/* Enhanced Sticky Bottom CTA */}
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t-2 border-green-500 p-3 z-50 shadow-2xl" data-testid="sticky-bottom-cta">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded font-bold animate-pulse">FLASH SALE</span>
                <span className="text-[10px] text-red-600 font-medium">Ends in {String(timeLeft.hours).padStart(2,'0')}:{String(timeLeft.minutes).padStart(2,'0')}:{String(timeLeft.seconds).padStart(2,'0')}</span>
              </div>
              <p className="font-bold text-gray-900 text-lg">₹{PREPAID_PRICE} <span className="text-sm text-gray-400 line-through">₹{MRP}</span></p>
            </div>
            <button
              onClick={() => {
                trackAction('cta_click', { button: 'buy_now_sticky', page: 'product_page_sticky' });
                
                // CRITICAL: Fire InitiateCheckout on BUTTON CLICK (not page render)
                trackInitiateCheckout(PREPAID_PRICE);
                
                // Direct fbq call for InitiateCheckout - fires immediately on click
                if (typeof window !== 'undefined' && window.fbq) {
                  window.fbq('track', 'InitiateCheckout', {
                    content_category: 'Skincare',
                    content_ids: ['celestaglow_serum_001'],
                    num_items: 1,
                    value: PREPAID_PRICE,
                    currency: 'INR'
                  });
                  console.log('[Meta Pixel] InitiateCheckout fired on Sticky Buy click');
                }
                
                setStep('checkout');
              }}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              data-testid="sticky-buy-button"
            >
              Buy Now <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Exit-Intent Popup */}
        {showExitPopup && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4" data-testid="exit-popup">
            <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl animate-bounce-in">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-500 to-orange-500 p-5 text-white text-center relative">
                <button 
                  onClick={() => setShowExitPopup(false)}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30"
                >
                  <X size={18} />
                </button>
                <p className="text-sm font-medium opacity-90 mb-1">WAIT! Don't Leave Yet!</p>
                <p className="text-2xl font-bold">Extra ₹100 OFF</p>
                <p className="text-sm opacity-90">Just for you!</p>
              </div>
              
              {/* Content */}
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <img src={PRODUCT_IMAGE} alt="Product" className="w-16 h-16 object-contain" />
                  <div>
                    <p className="font-semibold text-gray-900">Super Anti-Aging Serum</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-green-600">₹{PREPAID_PRICE - 100}</span>
                      <span className="text-sm text-gray-400 line-through">₹{MRP}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
                  <div className="flex items-center gap-2 text-yellow-700">
                    <Clock size={16} />
                    <span className="text-sm font-medium">Offer expires in 10 minutes!</span>
                  </div>
                </div>
                
                <button
                  onClick={async () => {
                    setShowExitPopup(false);
                    // Save exit discount to localStorage
                    localStorage.setItem('exitDiscountClaimed', 'true');
                    setHasDiscount(true);
                    setDiscountApplied(true);
                    setDiscountAmount(EXIT_DISCOUNT_AMOUNT);
                    trackAction('cta_click', { button: 'exit_popup_buy', page: 'exit_popup' });
                    // Track the discount claim
                    trackAction('exit_discount_claimed', { amount: EXIT_DISCOUNT_AMOUNT });
                    
                    // CRITICAL: Fire InitiateCheckout on BUTTON CLICK (not page render)
                    const discountedPrice = PREPAID_PRICE - EXIT_DISCOUNT_AMOUNT;
                    trackInitiateCheckout(discountedPrice);
                    
                    // Direct fbq call for InitiateCheckout - fires immediately on click
                    if (typeof window !== 'undefined' && window.fbq) {
                      window.fbq('track', 'InitiateCheckout', {
                        content_category: 'Skincare',
                        content_ids: ['celestaglow_serum_001'],
                        num_items: 1,
                        value: discountedPrice,
                        currency: 'INR'
                      });
                      console.log('[Meta Pixel] InitiateCheckout fired on Exit Popup Buy click');
                    }
                    
                    // Also track to backend
                    try {
                      const visitorId = getVisitorId();
                      await axios.post(`${API}/tracking/discount-claimed`, {
                        visitor_id: visitorId,
                        discount_type: 'exit',
                        amount: EXIT_DISCOUNT_AMOUNT
                      });
                    } catch (err) {
                      console.log('Tracking error:', err);
                    }
                    
                    setStep('checkout');
                  }}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
                  data-testid="exit-popup-buy-btn"
                >
                  Claim ₹100 OFF & Buy Now
                </button>
                
                <button
                  onClick={() => setShowExitPopup(false)}
                  className="w-full text-gray-500 text-sm mt-3 hover:text-gray-700"
                >
                  No thanks, I'll pay full price
                </button>
              </div>
            </div>
          </div>
        )}
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
            <div className="text-right">
              {discountApplied && (
                <p className="text-xs text-gray-400 line-through">₹{paymentMethod === 'prepaid' ? PREPAID_PRICE : COD_PRICE}</p>
              )}
              <p className="font-bold text-green-600">₹{paymentMethod === 'prepaid' ? getFinalPrepaidPrice() : getFinalCodPrice()}</p>
            </div>
          </div>

          {/* Discount Applied Banner - More Prominent */}
          {hasDiscount && (
            <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <Gift className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-green-800 font-bold text-base">🎉 ₹{discountAmount} Discount Applied!</p>
                  <p className="text-green-600 text-sm">{discountAmount === EXIT_DISCOUNT_AMOUNT ? 'Special exit offer activated!' : 'Your exclusive welcome offer is active'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Savings Summary Box */}
          <div className="mb-5 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="font-bold text-gray-900 mb-2">💰 Your Savings Today</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">MRP</span>
                <span className="text-gray-400 line-through">₹{MRP}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Festive Discount (53%)</span>
                <span>-₹{MRP - PREPAID_PRICE}</span>
              </div>
              {hasDiscount && (
                <div className="flex justify-between text-green-600">
                  <span>Welcome Offer</span>
                  <span>-₹{DISCOUNT_AMOUNT}</span>
                </div>
              )}
              <div className="flex justify-between text-green-600">
                <span>Free Delivery</span>
                <span>FREE</span>
              </div>
              <div className="border-t border-yellow-300 pt-2 mt-2 flex justify-between font-bold">
                <span className="text-gray-900">Total Savings</span>
                <span className="text-green-600">₹{MRP - getFinalPrepaidPrice()} ({Math.round((1 - getFinalPrepaidPrice()/MRP) * 100)}% OFF)</span>
              </div>
            </div>
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
                onChange={(e) => { 
                  const phone = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setFormData(prev => ({ ...prev, phone })); 
                  setErrors(prev => ({ ...prev, phone: '' }));
                  // Auto-check discount when phone is entered
                  if (phone.length === 10) {
                    checkPhoneDiscount(phone);
                  }
                }}
                placeholder="10-digit mobile number"
                className={`input-cg ${errors.phone ? 'border-red-300 bg-red-50' : ''}`}
                data-testid="phone-input"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              {!discountApplied && hasDiscount && (
                <p className="text-green-600 text-xs mt-1">💰 You have a ₹50 discount waiting!</p>
              )}
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
                onChange={(e) => { 
                  handleAddressFieldChange('house_number', e.target.value, (v) => setFormData(prev => ({ ...prev, house_number: v }))); 
                  setErrors(prev => ({ ...prev, house_number: '' })); 
                }}
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
                onChange={(e) => { 
                  handleAddressFieldChange('area', e.target.value, (v) => setFormData(prev => ({ ...prev, area: v }))); 
                  setErrors(prev => ({ ...prev, area: '' })); 
                }}
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
                  onChange={(e) => {
                    const pincode = e.target.value.replace(/\D/g, '').slice(0, 6);
                    handleAddressFieldChange('pincode', pincode, () => {});
                    handlePincodeChange(pincode);
                  }}
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
            
            {/* Referral Discount Banner */}
            {referralDiscount > 0 && (
              <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-xl">
                <div className="flex items-center gap-2 text-purple-700">
                  <Gift size={18} />
                  <span className="font-semibold">Referral Discount Applied!</span>
                </div>
                <p className="text-sm text-purple-600 mt-1">You're saving extra ₹{REFERRAL_DISCOUNT} from your friend's referral</p>
              </div>
            )}
            
            {/* Price Breakdown */}
            <div className="mb-4 p-3 bg-gray-50 rounded-xl text-sm space-y-1.5">
              <div className="flex justify-between text-gray-600">
                <span>Product Price</span>
                <span className="line-through text-gray-400">₹1,499</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Sale Discount</span>
                <span>- ₹{1499 - PREPAID_PRICE}</span>
              </div>
              {discountApplied && (
                <div className="flex justify-between text-green-600">
                  <span>Promo Discount</span>
                  <span>- ₹{discountAmount}</span>
                </div>
              )}
              {referralDiscount > 0 && (
                <div className="flex justify-between text-purple-600">
                  <span>Referral Discount</span>
                  <span>- ₹{referralDiscount}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">FREE</span>
              </div>
              <div className="h-px bg-gray-200 my-2"></div>
              <div className="flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <span className="text-green-600">₹{paymentMethod === 'prepaid' ? getFinalPrepaidPrice() : getFinalCodPrice()}</span>
              </div>
              {getTotalDiscount() > 0 && (
                <p className="text-xs text-green-600 text-center mt-1">You're saving ₹{MRP - getFinalPrepaidPrice()} on this order!</p>
              )}
            </div>
            
            {/* Referral Earnings Social Proof - Dynamic based on days */}
            {(() => {
              // Base date: March 25, 2026 (recent launch for realistic numbers)
              const launchDate = new Date('2026-03-25');
              const today = new Date();
              const daysSinceLaunch = Math.max(0, Math.floor((today - launchDate) / (1000 * 60 * 60 * 24)));
              
              // Start with base of 12 referrers, add 2-3 per day (average 2.5)
              const baseReferrers = 12;
              const dailyReferrerGrowth = 2.5;
              const totalReferrers = Math.floor(baseReferrers + (daysSinceLaunch * dailyReferrerGrowth));
              
              // Each referrer earns ₹100, so total amount = referrers * 100
              const totalEarnings = totalReferrers * 100;
              
              // Format earnings for display (e.g., 2,300)
              const formattedEarnings = totalEarnings.toLocaleString('en-IN');
              
              return (
                <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg">💰</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-purple-800 font-semibold text-sm">Customers earning cashback!</p>
                      <p className="text-purple-600 text-xs">₹{formattedEarnings}+ earned via referrals</p>
                    </div>
                    <div className="text-right">
                      <p className="text-purple-700 font-bold text-lg">{totalReferrers}+</p>
                      <p className="text-purple-500 text-[10px]">Referrers</p>
                    </div>
                  </div>
                </div>
              );
            })()}
            
            {/* Referral Offer Banner - Show to ALL checkout users */}
            <div className="mb-4 p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white">
              <div className="flex items-center gap-2 mb-2">
                <Gift size={20} />
                <span className="font-bold">Share & Earn ₹100!</span>
              </div>
              <p className="text-sm opacity-95 mb-2">
                Give your friends ₹50 off → Get ₹100 cashback after their delivery
              </p>
              <p className="text-xs opacity-80">
                After your order, you'll receive your unique referral link via email
              </p>
            </div>
            
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
                  <p className="font-semibold text-gray-900 text-sm">
                    Pay Online  {discountApplied && <span className="line-through text-gray-400">₹{PREPAID_PRICE}</span>} ₹{getFinalPrepaidPrice()}
                  </p>
                  <p className="text-green-600 text-xs">💰 {discountApplied ? 'Extra ₹50 discount applied!' : `Save ₹${COD_PRICE - PREPAID_PRICE} + Fast Delivery`}</p>
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
                  <p className="font-semibold text-gray-900 text-sm">
                    Cash on Delivery  {discountApplied && <span className="line-through text-gray-400">₹{COD_PRICE}</span>} ₹{getFinalCodPrice()}
                  </p>
                  <p className="text-gray-500 text-xs">Pay ₹{Math.max(COD_ADVANCE - (discountApplied ? discountAmount : 0), 49)} now + ₹{getFinalCodPrice() - Math.max(COD_ADVANCE - (discountApplied ? discountAmount : 0), 49)} on delivery</p>
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
            {loading ? 'Processing...' : `Pay ₹${paymentMethod === 'prepaid' ? getFinalPrepaidPrice() : Math.max(COD_ADVANCE - (discountApplied ? discountAmount : 0), 49)} & Place Order`}
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

  return null;
}

export default ProductPage;
