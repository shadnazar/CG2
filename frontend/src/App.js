import { useState, useEffect } from 'react';
import '@/App.css';
import axios from 'axios';
import { ChevronLeft, ShieldCheck, Star, Sparkles, Truck, Clock, CheckCircle2, Package, AlertCircle, X, ChevronRight } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const RAZORPAY_KEY = process.env.REACT_APP_RAZORPAY_KEY;

const BEFORE_AFTER_IMAGES = [
  'https://customer-assets.emergentagent.com/job_3e020a22-98fc-4fee-b377-5bacdddf46ce/artifacts/o6yd8m0v_Female_image.jpg',
  'https://customer-assets.emergentagent.com/job_3e020a22-98fc-4fee-b377-5bacdddf46ce/artifacts/ut31n4je_E7B2E3A3-32BC-419A-8767-D5E76FE705DA.png'
];

const PRODUCT_IMAGES = [
  'https://customer-assets.emergentagent.com/job_3e020a22-98fc-4fee-b377-5bacdddf46ce/artifacts/ig243hne_IMG_9115.png',
  'https://customer-assets.emergentagent.com/job_3e020a22-98fc-4fee-b377-5bacdddf46ce/artifacts/bjk8ksay_IMG_9675.png',
  'https://customer-assets.emergentagent.com/job_3e020a22-98fc-4fee-b377-5bacdddf46ce/artifacts/g5vzgxym_IMG_9676.png',
  'https://customer-assets.emergentagent.com/job_3e020a22-98fc-4fee-b377-5bacdddf46ce/artifacts/hry8n67v_IMG_9677.png',
  'https://customer-assets.emergentagent.com/job_3e020a22-98fc-4fee-b377-5bacdddf46ce/artifacts/ak0hq7r8_IMG_9678.png'
];

const REVIEWS = [
  { name: 'Shahana', initial: 'S', concern: 'Dull skin', text: 'My skin feels healthier every week. Perfect for Indian climate. Lightweight but effective!' },
  { name: 'Priya Sharma', initial: 'P', concern: 'Dark spots', text: 'Dark spots are fading beautifully! Visible results in just 3 weeks. Love this serum!' },
  { name: 'Ananya Reddy', initial: 'A', concern: 'Pimples & Acne', text: 'My acne marks are clearing up so well. Non-greasy formula is perfect for oily skin.' },
  { name: 'Meera Kapoor', initial: 'M', concern: 'Fine lines', text: 'Fine lines around my eyes are less visible now. My skin looks plumper and younger!' },
  { name: 'Divya Singh', initial: 'D', concern: 'Uneven tone', text: 'Finally found a serum that works! My skin tone is more even and I get compliments daily.' },
  { name: 'Riya Patel', initial: 'R', concern: 'Dullness', text: 'Instant glow after application! My skin has never looked this radiant. Best purchase!' }
];

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    houseNumber: '',
    area: '',
    pincode: '',
    state: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('PREPAID');
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showCODWarning, setShowCODWarning] = useState(false);
  const [showBackPrompt, setShowBackPrompt] = useState(false);
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [showSurpriseDiscount, setShowSurpriseDiscount] = useState(false);
  const [specialPrice, setSpecialPrice] = useState(599);
  const [timeLeft, setTimeLeft] = useState(240);
  const [recentOrders, setRecentOrders] = useState(30);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    axios.post(`${API}/track?page=product&session_id=${sessionId}`).catch(err => console.log(err));
    
    const surpriseTimer = setTimeout(() => {
      setShowSurpriseDiscount(true);
    }, 3000);
    
    return () => clearTimeout(surpriseTimer);
  }, []);

  useEffect(() => {
    const handleMouseLeave = (e) => {
      if (currentStep === 1 && e.clientY <= 0 && !showExitIntent) {
        setShowExitIntent(true);
      }
    };
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [currentStep, showExitIntent]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 240));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        const response = await axios.get(`${API}/stats/recent-orders`);
        setRecentOrders(response.data.count);
      } catch (error) {
        console.error('Failed to fetch recent orders:', error);
      }
    };
    fetchRecentOrders();
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFormChange = async (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === 'pincode' && value.length === 6) {
      try {
        const response = await axios.get(`${API}/pincode/${value}/state`);
        if (response.data.state) {
          setFormData(prev => ({ ...prev, state: response.data.state }));
        }
      } catch (error) {
        console.error('Failed to fetch state:', error);
      }
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      alert('Please enter your name');
      return false;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      alert('Please enter a valid 10-digit phone number');
      return false;
    }
    if (!formData.houseNumber.trim()) {
      alert('Please enter your house/flat number');
      return false;
    }
    if (!formData.area.trim()) {
      alert('Please enter your area/locality');
      return false;
    }
    if (!formData.pincode.trim() || formData.pincode.length !== 6) {
      alert('Please enter a valid 6-digit PIN code');
      return false;
    }
    return true;
  };

  const handleBuyNow = () => {
    setCurrentStep(2);
    axios.post(`${API}/track?page=checkout&session_id=${sessionId}`).catch(err => console.log(err));
  };

  const handleContinueToPayment = () => {
    if (validateForm()) {
      setCurrentStep(3);
      axios.post(`${API}/track?page=payment&session_id=${sessionId}`).catch(err => console.log(err));
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    const res = await loadRazorpay();
    if (!res) {
      alert('Razorpay SDK failed to load');
      return;
    }

    try {
      const orderResponse = await axios.post(`${API}/create-razorpay-order`, {
        amount: specialPrice
      });

      const options = {
        key: RAZORPAY_KEY,
        amount: orderResponse.data.amount,
        currency: orderResponse.data.currency,
        name: 'Celesta Glow',
        description: 'Anti-Aging Face Serum',
        order_id: orderResponse.data.id,
        handler: async function (response) {
          try {
            await axios.post(`${API}/verify-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            await createOrder('PREPAID', specialPrice);
          } catch (error) {
            alert('Payment verification failed');
          }
        },
        prefill: {
          name: formData.name,
          contact: formData.phone,
          email: formData.email || 'customer@celestaglow.com'
        },
        theme: {
          color: '#4C1D95'
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error('Razorpay order creation failed:', error);
      alert('Failed to initiate payment');
    }
  };

  const createOrder = async (method, amount) => {
    try {
      const response = await axios.post(`${API}/orders`, {
        name: formData.name,
        phone: formData.phone,
        house_number: formData.houseNumber,
        area: formData.area,
        pincode: formData.pincode,
        state: formData.state,
        email: formData.email,
        payment_method: method,
        amount: amount
      });
      setOrderDetails(response.data);
      setCurrentStep(4);
    } catch (error) {
      console.error('Order creation failed:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  const handlePlaceOrder = async () => {
    if (paymentMethod === 'COD') {
      setShowCODWarning(true);
    } else {
      setLoading(true);
      await handleRazorpayPayment();
      setLoading(false);
    }
  };

  const confirmCOD = async () => {
    setShowCODWarning(false);
    setLoading(true);
    await createOrder('COD', 1199);
    setLoading(false);
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setShowBackPrompt(true);
    } else if (currentStep > 1 && currentStep < 4) {
      setCurrentStep(currentStep - 1);
    }
  };

  const confirmBack = () => {
    setShowBackPrompt(false);
    setCurrentStep(1);
  };

  return (
    <div className="App">
      <div className="app-container">
        {currentStep > 1 && currentStep < 4 && (
          <div className="sticky-header">
            <button
              data-testid="back-button"
              onClick={handleBack}
              className="flex items-center text-gray-700 hover:text-[#4C1D95] transition-colors"
            >
              <ChevronLeft size={24} />
              <span className="ml-1 font-medium">Back</span>
            </button>
            <div className="flex gap-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`h-2 w-8 rounded-full transition-all ${
                    step <= currentStep - 1 ? 'bg-[#4C1D95]' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <ProductPage
            onBuyNow={handleBuyNow}
            currentImageIndex={currentImageIndex}
            setCurrentImageIndex={setCurrentImageIndex}
            timeLeft={timeLeft}
            formatTime={formatTime}
            recentOrders={recentOrders}
          />
        )}
        {currentStep === 2 && (
          <CheckoutPage
            formData={formData}
            handleFormChange={handleFormChange}
            handleContinue={handleContinueToPayment}
          />
        )}
        {currentStep === 3 && (
          <PaymentPage
            formData={formData}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            handlePlaceOrder={handlePlaceOrder}
            loading={loading}
          />
        )}
        {currentStep === 4 && <ConfirmationPage orderDetails={orderDetails} />}
      </div>

      {showCODWarning && (
        <CODWarningModal
          onClose={() => setShowCODWarning(false)}
          onConfirm={confirmCOD}
          onSwitchToPrepaid={() => {
            setShowCODWarning(false);
            setPaymentMethod('PREPAID');
          }}
        />
      )}

      {showBackPrompt && (
        <BackPromptModal
          onClose={() => setShowBackPrompt(false)}
          onConfirm={confirmBack}
        />
      )}

      {showSurpriseDiscount && (
        <SurpriseDiscountModal
          onClose={() => setShowSurpriseDiscount(false)}
          specialPrice={specialPrice}
        />
      )}

      {showExitIntent && (
        <ExitIntentModal
          onClose={() => setShowExitIntent(false)}
          onStay={() => {
            setShowExitIntent(false);
            document.getElementById('root').scrollIntoView({ behavior: 'smooth' });
          }}
        />
      )}
    </div>
  );
}

function ProductPage({ onBuyNow, currentImageIndex, setCurrentImageIndex, timeLeft, formatTime, recentOrders }) {
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [currentBeforeAfterIndex, setCurrentBeforeAfterIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReviewIndex((prev) => (prev + 1) % REVIEWS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBeforeAfterIndex((prev) => (prev + 1) % BEFORE_AFTER_IMAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const nextReview = () => {
    setCurrentReviewIndex((prev) => (prev + 1) % REVIEWS.length);
  };

  const prevReview = () => {
    setCurrentReviewIndex((prev) => (prev - 1 + REVIEWS.length) % REVIEWS.length);
  };

  return (
    <div className="animate-fade-in">
      <div className="relative">
        <img
          src={PRODUCT_IMAGES[currentImageIndex]}
          alt="Celesta Glow Serum"
          className="w-full h-[400px] object-cover"
        />
        <div className="absolute top-4 right-4 bg-[#F59E0B] text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg animate-pulse">
          40% OFF
        </div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {PRODUCT_IMAGES.map((_, idx) => (
            <button
              key={idx}
              data-testid={`image-dot-${idx}`}
              onClick={() => setCurrentImageIndex(idx)}
              className={`h-2 w-2 rounded-full transition-all ${
                idx === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="p-6 pb-32">
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-3 rounded-xl mb-4 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <Clock size={20} />
            <span className="font-semibold">Offer ends in:</span>
          </div>
          <div className="text-2xl font-bold" data-testid="countdown-timer">{formatTime(timeLeft)}</div>
        </div>

        <div className="bg-green-50 border border-green-200 p-3 rounded-xl mb-4 flex items-center gap-2">
          <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold animate-bounce">
            {recentOrders}
          </div>
          <span className="text-green-800 text-sm font-medium">
            <strong>{recentOrders} people</strong> ordered in the last 24 hours!
          </span>
        </div>

        <div className="bg-red-50 border border-red-200 p-3 rounded-xl mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={20} color="#DC2626" />
            <span className="text-red-800 text-sm font-bold">Only 7 units left in stock!</span>
          </div>
          <Package size={20} color="#DC2626" />
        </div>

        <div className="mb-6">
          <h1 className="text-4xl font-bold text-[#1E293B] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Celesta Glow
          </h1>
          <p className="text-lg text-[#475569] font-medium">Advanced Anti-Aging Face Serum</p>
          <div className="flex items-center gap-2 mt-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="#F59E0B" color="#F59E0B" />
              ))}
            </div>
            <span className="text-sm text-[#94A3B8]">4.67/5 (300 reviews)</span>
          </div>
        </div>

        <div className="bg-[#FFFBEB] border-2 border-[#F59E0B] rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={20} color="#F59E0B" />
            <span className="font-bold text-[#1E293B]">Special Flash Sale - TODAY ONLY!</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#4C1D95]">₹599</span>
            <span className="text-xl text-[#94A3B8] line-through">₹1,499</span>
            <span className="text-sm bg-[#DC2626] text-white px-2 py-1 rounded-full font-semibold animate-pulse">60% OFF</span>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Complete Skin Solution
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '✨', text: 'Reduces Fine Lines', color: '#4C1D95', bg: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&q=80' },
              { icon: '💧', text: 'Deep Hydration', color: '#059669', bg: 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=400&q=80' },
              { icon: '🌟', text: 'Fades Dark Spots', color: '#F59E0B', bg: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&q=80' },
              { icon: '✨', text: 'Fights Dullness', color: '#DC2626', bg: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&q=80' },
              { icon: '🎯', text: 'Clears Pimples', color: '#4C1D95', bg: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=400&q=80' },
              { icon: '💎', text: 'Boosts Collagen', color: '#059669', bg: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&q=80' }
            ].map((benefit, idx) => (
              <div 
                key={idx} 
                data-testid={`benefit-${idx}`} 
                className="benefit-card relative overflow-hidden"
                style={{
                  backgroundImage: `linear-gradient(rgba(255,255,255,0.95), rgba(255,255,255,0.95)), url(${benefit.bg})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="text-3xl mb-2">{benefit.icon}</div>
                <p className="text-sm font-medium text-[#1E293B] relative z-10">{benefit.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            Clinically Proven Ingredients
          </h3>
          <div className="space-y-2">
            {['0.3% Retinol', 'Niacinamide', 'Hyaluronic Acid', 'Vitamin E'].map((ingredient, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <CheckCircle2 size={18} color="#059669" />
                <span className="text-[#475569]">{ingredient}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            Real Results, Real People
          </h3>
          <div className="relative overflow-hidden rounded-2xl">
            <img
              src={BEFORE_AFTER_IMAGES[currentBeforeAfterIndex]}
              alt="Before and After Results"
              className="w-full h-auto transition-opacity duration-500"
              data-testid="before-after-slider"
            />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {BEFORE_AFTER_IMAGES.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 w-2 rounded-full transition-all ${
                    idx === currentBeforeAfterIndex ? 'bg-white w-6' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-sm text-center text-[#475569] mt-2 italic">Visible transformation in 4-6 weeks</p>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            Loved by 10,000+ Customers
          </h3>
          <div className="relative">
            <div className="testimonial-card overflow-hidden" data-testid="review-carousel">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-[#4C1D95] rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {REVIEWS[currentReviewIndex].initial}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#1E293B]">{REVIEWS[currentReviewIndex].name}</p>
                  <p className="text-xs text-[#94A3B8]">{REVIEWS[currentReviewIndex].concern}</p>
                  <div className="flex mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} fill="#F59E0B" color="#F59E0B" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-[#475569] italic">"{REVIEWS[currentReviewIndex].text}"</p>
            </div>
            <div className="flex justify-center gap-2 mt-3">
              <button
                onClick={prevReview}
                className="p-2 rounded-full bg-[#4C1D95] text-white hover:bg-[#3b1676] transition-colors"
                data-testid="prev-review"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex items-center gap-1">
                {REVIEWS.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 w-2 rounded-full transition-all ${
                      idx === currentReviewIndex ? 'bg-[#4C1D95] w-6' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={nextReview}
                className="p-2 rounded-full bg-[#4C1D95] text-white hover:bg-[#3b1676] transition-colors"
                data-testid="next-review"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mb-6">
          {[
            { icon: <ShieldCheck size={20} />, text: 'Dermatologist Tested' },
            { icon: <Package size={20} />, text: 'Made in India' }
          ].map((badge, idx) => (
            <div key={idx} className="flex items-center gap-2 text-[#4C1D95]">
              {badge.icon}
              <span className="text-sm font-medium">{badge.text}</span>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl p-4 mb-6 text-center">
          <p className="text-lg font-bold mb-1">🚚 FREE Shipping All Over India!</p>
          <p className="text-sm opacity-90">No hidden charges • Track your order 24/7</p>
        </div>

        <div className="bg-gradient-to-br from-[#FFFBEB] to-[#FEF3C7] border-2 border-[#F59E0B] rounded-2xl p-5 mb-6">
          <div className="flex items-start gap-3 mb-3">
            <CheckCircle2 size={32} color="#059669" className="flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-[#1E293B] mb-1">100% Money-Back Guarantee</h3>
              <p className="text-sm text-[#475569]">
                Not satisfied with results in 30 days? Get a <strong>full refund</strong>, no questions asked. We're that confident!
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            Common Questions Answered
          </h3>
          <div className="space-y-3">
            {[
              { q: 'How long until I see results?', a: 'Most customers see visible improvement in 4-6 weeks with consistent use.' },
              { q: 'Is it safe for sensitive skin?', a: 'Yes! Dermatologist-tested and suitable for all skin types including sensitive skin.' },
              { q: 'Can I use it with other products?', a: 'Absolutely! Use morning and night after cleansing. Follow with moisturizer and sunscreen.' }
            ].map((faq, idx) => (
              <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <p className="font-semibold text-[#1E293B] mb-1 text-sm">Q: {faq.q}</p>
                <p className="text-xs text-[#475569]">A: {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 mb-6 flex-wrap">
          <div className="flex items-center gap-2">
            <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Logo_UPI.svg" alt="UPI" className="h-6" />
          </div>
          <div className="flex items-center gap-2">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-5" />
          </div>
          <div className="flex items-center gap-2">
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={24} color="#059669" />
            <span className="text-xs text-[#475569]">SSL Secure</span>
          </div>
        </div>
      </div>

      <div className="sticky-cta">
        <button
          data-testid="buy-now-button"
          onClick={onBuyNow}
          className="btn-primary"
        >
          Buy Now - Get 40% OFF
        </button>
      </div>
    </div>
  );
}

function CheckoutPage({ formData, handleFormChange, handleContinue }) {
  const [currentBeforeAfterIndex, setCurrentBeforeAfterIndex] = useState(0);
  const [detectedArea, setDetectedArea] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBeforeAfterIndex((prev) => (prev + 1) % BEFORE_AFTER_IMAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 animate-slide-up">
      <div className="mb-4">
        <div className="relative overflow-hidden rounded-xl shadow-lg mb-3">
          <img
            src={BEFORE_AFTER_IMAGES[currentBeforeAfterIndex]}
            alt="Before and After Results"
            className="w-full h-auto transition-opacity duration-500"
            data-testid="checkout-before-after-slider"
          />
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2">
            {BEFORE_AFTER_IMAGES.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 w-2 rounded-full transition-all ${
                  idx === currentBeforeAfterIndex ? 'bg-white w-6' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
        <p className="text-xs text-center text-[#475569] mb-4 italic">Real results from real customers</p>
      </div>

      <div className="mb-3">
        <h2 className="text-2xl font-bold text-[#1E293B] mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
          Quick Delivery Setup
        </h2>
        <p className="text-sm text-[#475569]">Just 3 simple steps to complete</p>
      </div>

      <div className="bg-green-50 border-2 border-green-500 p-3 rounded-xl mb-4 text-center">
        <p className="text-green-800 font-bold text-sm">🚚 FREE Shipping + Expected Delivery: {new Date(Date.now() + (2 * 24 * 60 * 60 * 1000)).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</p>
      </div>

      <div className="bg-gradient-to-r from-[#4C1D95] to-[#6d28d9] text-white p-3 rounded-2xl mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={18} />
          <span className="font-bold text-sm">FLASH SALE: ₹900 OFF Today!</span>
        </div>
        <p className="text-xs opacity-90">Original ₹1,499 → Now just ₹599 with online payment</p>
      </div>

      <div className="space-y-3 mb-6">
        <div>
          <label className="block text-xs font-medium text-[#475569] mb-1">Full Name *</label>
          <input
            data-testid="name-input"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleFormChange}
            placeholder="Enter your name"
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#475569] mb-1">Phone Number *</label>
          <div className="flex gap-2">
            <div className="input-field text-center" style={{ width: '55px', padding: '12px 8px' }}>+91</div>
            <input
              data-testid="phone-input"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleFormChange}
              placeholder="10-digit number"
              className="input-field"
              maxLength="10"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#475569] mb-1">Email (Optional for updates)</label>
          <input
            data-testid="email-input"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleFormChange}
            placeholder="your@email.com"
            className="input-field"
          />
        </div>

        <div className="bg-gray-50 p-3 rounded-xl">
          <p className="text-xs font-semibold text-[#1E293B] mb-2">Delivery Address</p>
          
          <div className="space-y-2">
            <input
              data-testid="house-input"
              type="text"
              name="houseNumber"
              value={formData.houseNumber}
              onChange={handleFormChange}
              placeholder="House/Flat No."
              className="input-field"
              style={{ padding: '10px 12px' }}
              required
            />
            
            <input
              data-testid="area-input"
              type="text"
              name="area"
              value={formData.area}
              onChange={handleFormChange}
              placeholder="Area, Locality, City"
              className="input-field"
              style={{ padding: '10px 12px' }}
              required
            />
            
            <input
              data-testid="pincode-input"
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleFormChange}
              placeholder="PIN Code (6 digits)"
              className="input-field"
              style={{ padding: '10px 12px' }}
              maxLength="6"
              required
            />
            
            {formData.state && (
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-sm mb-1">
                  <CheckCircle2 size={16} color="#059669" />
                  <span className="font-semibold text-green-800">Delivery Location Confirmed</span>
                </div>
                {formData.area && (
                  <p className="text-xs text-green-700 ml-6">Area: {formData.area}</p>
                )}
                <p className="text-xs text-green-700 ml-6">State: {formData.state}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        data-testid="continue-button"
        onClick={handleContinue}
        className="btn-primary"
      >
        Continue to Payment
      </button>

      <div className="flex items-center justify-center gap-2 mt-3 text-xs text-[#94A3B8]">
        <ShieldCheck size={14} color="#059669" />
        <span>Your information is 100% secure and encrypted</span>
      </div>
    </div>
  );
}

function PaymentPage({ formData, paymentMethod, setPaymentMethod, handlePlaceOrder, loading }) {
  const prepaidPrice = 599;
  const codPrice = 1199;
  
  return (
    <div className="p-6 animate-slide-up">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-[#1E293B] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
          Choose Payment Method
        </h2>
        <p className="text-[#475569]">Select your preferred payment option</p>
      </div>

      <div className="bg-[#FFFBEB] border-2 border-[#F59E0B] rounded-xl p-3 mb-4 text-center">
        <p className="text-[#92400E] font-bold text-sm">⚡ Pay Online & Get for just ₹{prepaidPrice}!</p>
      </div>

      <div className="flex items-center justify-center gap-4 mb-4">
        <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Logo_UPI.svg" alt="UPI" className="h-8 opacity-70" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-6 opacity-70" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-8 opacity-70" />
        <img src="https://seeklogo.com/images/R/rupay-logo-4421B0973F-seeklogo.com.png" alt="RuPay" className="h-6 opacity-70" />
      </div>

      <div className="space-y-4 mb-6">
        <div
          data-testid="prepaid-option"
          onClick={() => setPaymentMethod('PREPAID')}
          className={`payment-option ${paymentMethod === 'PREPAID' ? 'selected' : ''}`}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <input
                  type="radio"
                  checked={paymentMethod === 'PREPAID'}
                  onChange={() => setPaymentMethod('PREPAID')}
                  className="w-5 h-5"
                />
                <span className="font-bold text-lg text-[#1E293B]">Pay Online</span>
                <span className="bg-[#059669] text-white text-xs px-2 py-1 rounded-full font-semibold">SAVE ₹300</span>
              </div>
              <p className="text-sm text-[#475569] ml-7">UPI, Cards, Netbanking via Razorpay</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[#059669]">₹{prepaidPrice}</p>
              <p className="text-sm text-[#94A3B8] line-through">₹{codPrice}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[#059669] ml-7">
            <Truck size={18} />
            <span className="text-sm font-medium">Fast Delivery (2-3 Days)</span>
          </div>
        </div>

        <div
          data-testid="cod-option"
          onClick={() => setPaymentMethod('COD')}
          className={`payment-option ${paymentMethod === 'COD' ? 'selected' : ''}`}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <input
                  type="radio"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="w-5 h-5"
                />
                <span className="font-bold text-lg text-[#1E293B]">Cash on Delivery</span>
              </div>
              <p className="text-sm text-[#475569] ml-7">Pay when you receive</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[#4C1D95]">₹{codPrice}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[#F59E0B] ml-7">
            <Clock size={18} />
            <span className="text-sm font-medium">Delivery in 5-7 Business Days</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-2xl p-4 mb-6">
        <h3 className="font-semibold text-[#1E293B] mb-3">Order Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[#475569]">Product Price</span>
            <span className="font-medium">₹1,499</span>
          </div>
          <div className="flex justify-between text-[#059669]">
            <span>Launch Discount (40%)</span>
            <span className="font-medium">- ₹600</span>
          </div>
          {paymentMethod === 'PREPAID' && (
            <div className="flex justify-between text-[#059669]">
              <span>Prepaid Discount</span>
              <span className="font-medium">- ₹300</span>
            </div>
          )}
          <div className="border-t pt-2 flex justify-between font-bold text-lg">
            <span>Total Amount</span>
            <span className="text-[#4C1D95]">₹{paymentMethod === 'COD' ? codPrice : prepaidPrice}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 justify-center mb-4 text-sm text-[#475569]">
        <ShieldCheck size={18} color="#059669" />
        <span>Secure checkout powered by Razorpay</span>
      </div>

      <div className="bg-gray-50 rounded-xl p-3 mb-4 text-center">
        <p className="text-xs text-[#475569] mb-1">🔒 256-bit SSL encrypted • 100% secure payment</p>
        <p className="text-xs text-[#94A3B8]">Your payment information is never stored</p>
      </div>

      <button
        data-testid="place-order-button"
        onClick={handlePlaceOrder}
        disabled={loading}
        className="btn-primary"
      >
        {loading ? 'Processing...' : `Place Order - ₹${paymentMethod === 'COD' ? codPrice : prepaidPrice}`}
      </button>

      <div className="flex items-center justify-center gap-4 mt-3">
        <div className="flex items-center gap-1">
          <CheckCircle2 size={14} color="#059669" />
          <span className="text-xs text-[#475569]">Money-back guarantee</span>
        </div>
        <div className="flex items-center gap-1">
          <Truck size={14} color="#059669" />
          <span className="text-xs text-[#475569]">Free shipping</span>
        </div>
      </div>
    </div>
  );
}

function SurpriseDiscountModal({ onClose, specialPrice }) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in" data-testid="surprise-discount-modal">
      <div className="bg-gradient-to-br from-[#4C1D95] via-[#6d28d9] to-[#F59E0B] p-1 rounded-3xl max-w-md w-full animate-slide-up">
        <div className="bg-white rounded-3xl p-6">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
          
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">🎁</div>
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#4C1D95] to-[#F59E0B] bg-clip-text text-transparent" style={{ fontFamily: 'Playfair Display, serif' }}>
              SURPRISE GIFT!
            </h2>
            <p className="text-lg text-[#475569] mb-4">
              You've been selected for our <strong>SPECIAL FLASH SALE!</strong>
            </p>
            
            <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl p-6 mb-4 shadow-2xl">
              <p className="text-sm mb-2 opacity-90">Original Price</p>
              <p className="text-3xl line-through opacity-75 mb-2">₹1,499</p>
              <div className="h-1 w-full bg-white/30 mb-3"></div>
              <p className="text-sm mb-2">YOUR SPECIAL PRICE TODAY</p>
              <p className="text-6xl font-bold mb-2">₹{specialPrice}</p>
              <div className="bg-white/20 rounded-lg p-3 mt-3">
                <p className="text-lg font-bold">Save ₹{1499 - specialPrice} (60% OFF!)</p>
              </div>
            </div>
            
            <div className="bg-[#FFFBEB] border-2 border-[#F59E0B] rounded-xl p-4 mb-4">
              <p className="text-sm text-[#92400E] font-bold mb-2">
                ⚡ This offer expires in 10 minutes!
              </p>
              <p className="text-xs text-[#78350F]">
                Don't miss this limited-time price. Once you close this, regular price applies.
              </p>
            </div>
            
            <button
              onClick={onClose}
              className="btn-primary text-xl py-4"
              data-testid="claim-surprise-discount"
            >
              🎉 CLAIM MY ₹{specialPrice} OFFER NOW!
            </button>
            
            <p className="text-xs text-[#94A3B8] mt-3">Limited to first-time visitors only</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExitIntentModal({ onClose, onStay }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" data-testid="exit-intent-modal">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-slide-up">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={40} color="white" />
          </div>
          <h3 className="text-2xl font-bold text-[#1E293B] mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            ⚠️ WAIT! Don't Risk Aging Skin
          </h3>
          <p className="text-[#DC2626] font-semibold mb-2 text-lg">
            Every day without proper skincare ages your skin faster!
          </p>
          <p className="text-[#475569] mb-4">
            Fine lines, dark spots, and wrinkles become PERMANENT without treatment. Don't let your skin suffer!
          </p>
          
          <div className="bg-[#FEF2F2] border-2 border-[#DC2626] rounded-xl p-4 mb-4">
            <p className="text-sm text-[#DC2626] font-semibold mb-2">
              ⏰ Without Anti-Aging Care:
            </p>
            <ul className="text-xs text-left text-[#7F1D1D] space-y-1">
              <li>✗ Deep wrinkles form permanently</li>
              <li>✗ Dark spots multiply and darken</li>
              <li>✗ Skin loses elasticity & sags</li>
              <li>✗ Dullness becomes irreversible</li>
            </ul>
          </div>

          <div className="bg-[#ECFDF5] border-2 border-[#059669] rounded-xl p-4">
            <p className="text-sm text-[#059669] font-semibold mb-2">
              ✅ Start Today & Get:
            </p>
            <ul className="text-xs text-left text-[#065F46] space-y-1">
              <li>✓ Visible results in 4-6 weeks</li>
              <li>✓ 40% OFF - Save ₹600 TODAY</li>
              <li>✓ 10,000+ happy customers</li>
              <li>✓ 99% see glowing, youthful skin</li>
            </ul>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={onStay}
            className="btn-primary"
            data-testid="exit-stay-button"
          >
            Protect My Skin Now - Get 40% OFF!
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 text-[#94A3B8] text-sm hover:text-[#64748B] transition-colors"
            data-testid="exit-leave-button"
          >
            No thanks, I'll risk aging skin
          </button>
        </div>
      </div>
    </div>
  );
}

function BackPromptModal({ onClose, onConfirm }) {
  const motivationalMessages = [
    {
      title: "You're Almost There! ✨",
      message: "Just one more step to unlock glowing, youthful skin!",
      stat: "99% of customers see visible results in 4-6 weeks"
    },
    {
      title: "Don't Miss Out! 🌟",
      message: "Your skin transformation journey is about to begin!",
      stat: "92% of customers report smoother, hydrated skin"
    },
    {
      title: "So Close to Radiance! 💫",
      message: "Complete your order now and join thousands of happy customers!",
      stat: "10,000+ customers already loving their glowing skin"
    }
  ];

  const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" data-testid="back-prompt-modal">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-slide-up">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-[#4C1D95] to-[#F59E0B] rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles size={40} color="white" />
          </div>
          <h3 className="text-2xl font-bold text-[#1E293B] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            {randomMessage.title}
          </h3>
          <p className="text-[#475569] mb-4">{randomMessage.message}</p>
          
          <div className="bg-[#FFFBEB] border-2 border-[#F59E0B] rounded-xl p-4 mb-4">
            <p className="text-sm text-[#92400E] font-semibold">
              ✨ {randomMessage.stat}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={onClose}
            className="btn-primary"
            data-testid="stay-and-complete-button"
          >
            Yes, Complete My Order!
          </button>
          <button
            onClick={onConfirm}
            className="w-full py-3 text-[#475569] font-medium hover:bg-gray-50 rounded-full transition-colors border border-gray-200"
            data-testid="go-back-button"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

function CODWarningModal({ onClose, onConfirm, onSwitchToPrepaid }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" data-testid="cod-warning-modal">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-slide-up">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#F59E0B] rounded-full p-3">
              <AlertCircle size={24} color="white" />
            </div>
            <h3 className="text-xl font-bold text-[#1E293B]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Wait! Save ₹600 More
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-[#FFFBEB] border-l-4 border-[#F59E0B] p-4 rounded-lg mb-4">
            <p className="text-[#92400E] font-medium mb-2">
              You're choosing Cash on Delivery (COD) at ₹1,199
            </p>
            <p className="text-sm text-[#78350F]">
              But you can get it for just <strong>₹599</strong> with online payment!
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 rounded-full p-1 mt-0.5">
                <CheckCircle2 size={16} color="#059669" />
              </div>
              <div>
                <p className="font-semibold text-[#1E293B]">Save ₹600 instantly</p>
                <p className="text-sm text-[#475569]">Pay ₹599 instead of ₹1,199</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-green-100 rounded-full p-1 mt-0.5">
                <Truck size={16} color="#059669" />
              </div>
              <div>
                <p className="font-semibold text-[#1E293B]">Faster Delivery</p>
                <p className="text-sm text-[#475569]">Get it in 2-3 days vs 5-7 days</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            data-testid="switch-to-prepaid-button"
            onClick={onSwitchToPrepaid}
            className="btn-primary"
          >
            Yes, Pay Online & Save ₹600!
          </button>
          <button
            data-testid="confirm-cod-button"
            onClick={onConfirm}
            className="w-full py-3 text-[#4C1D95] font-medium hover:bg-gray-50 rounded-full transition-colors border border-gray-200"
          >
            No, Continue with COD
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmationPage({ orderDetails }) {
  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-screen animate-fade-in">
      <div className="text-center mb-8">
        <div className="w-24 h-24 bg-[#059669] rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
          <CheckCircle2 size={48} color="white" />
        </div>
        <h2 className="text-3xl font-bold text-[#1E293B] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
          Order Confirmed!
        </h2>
        <p className="text-[#475569]">Thank you for your purchase</p>
      </div>

      <div className="bg-gradient-to-br from-[#4C1D95] to-[#6d28d9] text-white rounded-2xl p-6 w-full mb-6">
        <div className="text-center mb-4">
          <p className="text-sm opacity-90 mb-1">Your Order ID</p>
          <p data-testid="order-id" className="text-3xl font-bold tracking-wider">{orderDetails?.order_id}</p>
        </div>
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3">
            {orderDetails?.payment_method === 'COD' ? <Clock size={20} /> : <Truck size={20} />}
            <span className="font-semibold">Delivery Timeline</span>
          </div>
          <p data-testid="delivery-timeline" className="text-lg">{orderDetails?.delivery_timeline}</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-2xl p-6 w-full mb-6">
        <h3 className="font-semibold text-[#1E293B] mb-4">Delivery Details</h3>
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-[#94A3B8] text-xs mb-1">Name</p>
            <p className="text-[#1E293B] font-medium">{orderDetails?.name}</p>
          </div>
          <div>
            <p className="text-[#94A3B8] text-xs mb-1">Phone</p>
            <p className="text-[#1E293B] font-medium">+91 {orderDetails?.phone}</p>
          </div>
          <div>
            <p className="text-[#94A3B8] text-xs mb-1">Address</p>
            <p className="text-[#1E293B] font-medium">
              {orderDetails?.house_number}, {orderDetails?.area}, {orderDetails?.state} - {orderDetails?.pincode}
            </p>
          </div>
          <div>
            <p className="text-[#94A3B8] text-xs mb-1">Payment Method</p>
            <p className="text-[#1E293B] font-medium">{orderDetails?.payment_method}</p>
          </div>
          <div className="pt-3 border-t">
            <p className="text-[#94A3B8] text-xs mb-1">Amount Paid</p>
            <p className="text-[#4C1D95] font-bold text-xl">₹{orderDetails?.amount}</p>
          </div>
        </div>
      </div>

      <div className="bg-[#FFFBEB] border border-[#F59E0B]/20 rounded-2xl p-4 w-full">
        <p className="text-sm text-[#475569] text-center">
          📧 Order confirmation has been sent to your email
        </p>
      </div>
    </div>
  );
}

export default App;