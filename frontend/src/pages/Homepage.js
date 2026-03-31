import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Check, Star, ChevronRight, ChevronDown, ChevronUp, Clock, Users, ShieldCheck, Truck, Flame, MapPin } from 'lucide-react';
import DiscountPopup from '../components/DiscountPopup';
import { 
  trackViewContent, 
  trackCTAClick, 
  trackViewTestimonials, 
  trackFAQInteraction,
  trackExitIntent,
  trackTimeOnPage,
  trackPopupShown
} from '../utils/metaPixel';
import { trackPageVisit, trackTimeSpent, getSessionId, getVisitorId } from '../utils/userTracking';
import { getSharedStats, updateSharedStats, getCurrentLocation, rotateLocation } from '../utils/sharedStats';
import { initCustomerNotifications, startSocialProofNotifications } from '../utils/customerNotifications';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Pricing constants
const PREPAID_PRICE = 599;
const MRP = 1499;

// Age Regression Score Image for Homepage - Using the uploaded product image
const HERO_IMAGE = 'https://customer-assets.emergentagent.com/job_ae0c9586-b94c-4054-b869-8b9baeb452c6/artifacts/gwxje1nv_1F955957-C2EB-4ED0-A713-0B302C9B4892.jpeg';

// Bottle Product Image
const PRODUCT_IMAGE = 'https://customer-assets.emergentagent.com/job_ae0c9586-b94c-4054-b869-8b9baeb452c6/artifacts/gwxje1nv_1F955957-C2EB-4ED0-A713-0B302C9B4892.jpeg';

// Transformation Images - Before/While Using/After
const TRANSFORMATION_IMAGES = [
  {
    url: 'https://customer-assets.emergentagent.com/job_26148967-6968-4918-8b5d-0a2c0e5259b2/artifacts/v7ijo66v_e1038299-e6d4-495a-aeb8-d34f76107e22.jpeg',
    label: 'Priya, 34 - Delhi',
    testimonial: '"My skin looks 10 years younger!"'
  },
  {
    url: 'https://customer-assets.emergentagent.com/job_26148967-6968-4918-8b5d-0a2c0e5259b2/artifacts/hl39qfua_6d8c1ed3-65ac-4b5e-80c8-22a3f43c0981.jpeg',
    label: 'Rahul, 38 - Mumbai',
    testimonial: '"Fine lines reduced in just 4 weeks!"'
  }
];

// Transformation Showcase Component - Premium Design with Animation
function TransformationShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % TRANSFORMATION_IMAGES.length);
        setIsAnimating(false);
      }, 500);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const current = TRANSFORMATION_IMAGES[currentIndex];

  return (
    <section className="px-5 py-8" data-testid="transformation-showcase">
      <div className="text-center mb-4">
        <p className="text-xs font-semibold text-green-600 tracking-wider uppercase">Proven Results</p>
        <h3 className="text-xl font-bold text-gray-900">Real Transformations, Real People</h3>
        <p className="text-sm text-gray-500 mt-1">Men & Women seeing visible results</p>
      </div>
      
      {/* Premium Fixed Height Container */}
      <div 
        className="relative mx-auto overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200"
        style={{ height: '420px', maxWidth: '350px' }}
      >
        {/* Image with Fade Animation */}
        <div 
          className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
            isAnimating ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <img
            src={current.url}
            alt={`Transformation result - ${current.label}`}
            className="w-full h-full object-contain"
            style={{ maxHeight: '420px' }}
          />
        </div>
        
        {/* Premium Bottom Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
          <p className="text-white font-semibold text-sm">{current.label}</p>
          <p className="text-white/90 text-xs italic">{current.testimonial}</p>
        </div>
        
        {/* Dots Indicator */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
          {TRANSFORMATION_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setIsAnimating(true);
                setTimeout(() => {
                  setCurrentIndex(i);
                  setIsAnimating(false);
                }, 300);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentIndex ? 'bg-white w-6' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
        
        {/* Premium Badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
          <span className="text-xs font-semibold text-green-600">✓ Verified Results</span>
        </div>
      </div>
      
      {/* Trust Text Below */}
      <p className="text-center text-xs text-gray-500 mt-3">
        Results may vary. Consistent use recommended for best results.
      </p>
    </section>
  );
}

function Homepage() {
  const navigate = useNavigate();
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 47, seconds: 33 });
  const [viewingNow, setViewingNow] = useState(() => getSharedStats().viewingNow);
  const [soldToday, setSoldToday] = useState(() => getSharedStats().soldToday);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [showDiscountPopup, setShowDiscountPopup] = useState(false);
  const [userLocation, setUserLocation] = useState(() => getCurrentLocation());
  const [sessionId, setSessionId] = useState('');
  const pageStartTime = useRef(Date.now());
  const testimonialsTracked = useRef(false);

  useEffect(() => {
    // Use consistent session ID from sessionStorage
    const currentSessionId = getSessionId();
    setSessionId(currentSessionId);
    
    // Track page visit with enhanced analytics (uses visitor ID for proper deduplication)
    trackPageVisit('homepage');
    
    // Also track with old endpoint for backward compatibility (live visitors)
    axios.post(`${API}/track-visit?page=homepage&session_id=${currentSessionId}`).catch(() => {});
    
    // Meta Pixel tracking - ViewContent for homepage
    trackViewContent('Celesta Glow Homepage', PREPAID_PRICE);

    // Show discount popup after 5 seconds if not already claimed
    const discountTimer = setTimeout(() => {
      if (!localStorage.getItem('discountClaimed') && !sessionStorage.getItem('discountPopupShown')) {
        setShowDiscountPopup(true);
        sessionStorage.setItem('discountPopupShown', 'true');
        trackPopupShown('discount_popup');
      }
    }, 5000);

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
      const delta = Math.floor(Math.random() * 5) - 2;
      const stats = getSharedStats();
      const newValue = Math.max(15, Math.min(50, stats.viewingNow + delta));
      updateSharedStats({ viewingNow: newValue });
      setViewingNow(newValue);
    }, 5000);

    // Auto-rotate location every 4 seconds (faster)
    const locationInterval = setInterval(() => {
      const newLocation = rotateLocation();
      setUserLocation(newLocation);
    }, 4000);

    // Initialize customer notifications with social proof
    initCustomerNotifications();
    startSocialProofNotifications(50000); // Show "Someone just purchased" every 50 seconds

    // Exit intent detection with pixel tracking
    const handleMouseLeave = (e) => {
      if (e.clientY < 10 && !sessionStorage.getItem('exitPopupShown')) {
        setShowExitPopup(true);
        sessionStorage.setItem('exitPopupShown', 'true');
        trackExitIntent('homepage');
      }
    };
    document.addEventListener('mouseleave', handleMouseLeave);

    // Track testimonials section view
    const handleScroll = () => {
      const testimonialsSection = document.querySelector('.testimonial-scroll-container');
      if (testimonialsSection && !testimonialsTracked.current) {
        const rect = testimonialsSection.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          trackViewTestimonials();
          testimonialsTracked.current = true;
        }
      }
    };
    window.addEventListener('scroll', handleScroll);

    // Track time on page when leaving
    return () => {
      const timeOnPage = Math.round((Date.now() - pageStartTime.current) / 1000);
      trackTimeOnPage('homepage', timeOnPage);
      clearTimeout(discountTimer);
      clearInterval(timer);
      clearInterval(viewerInterval);
      clearInterval(locationInterval);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // All 10 real testimonials from celestaglow.com - Inclusive of Men & Women
  const testimonials = [
    { name: 'Priya', location: 'Mumbai, India', text: "This serum has transformed my skin! My fine lines have reduced significantly and I'm glowing naturally." },
    { name: 'Varun', location: 'Bangalore, India', text: "Amazing product! My forehead lines are fading and my skin feels so smooth. Highly recommend for men too." },
    { name: 'Kavya Prakash', location: 'Ahmedabad, India', text: "Best serum I've used! My skin looks brighter and more youthful. Worth every rupee!" },
    { name: 'Rajesh Kumar', location: 'Delhi, India', text: "As a 42-year-old man, I was skeptical. But after 3 weeks, my crow's feet are visibly reduced. Game changer!" },
    { name: 'Lakshmi', location: 'Chennai, India', text: "Finally found a serum that works! My wrinkles and dark spots are lightening beautifully." },
    { name: 'Amit Shah', location: 'Pune, India', text: "My wife recommended this. Now we both use it! My skin feels firmer and looks 5 years younger." },
    { name: 'Divya Nair', location: 'Kochi, India', text: "This is a game changer! My melasma has reduced and I feel confident without makeup now." },
    { name: 'Aisha Khan', location: 'Hyderabad, India', text: "Excellent quality! My skin feels hydrated and the glow is real. Thank you Celesta Glow!" },
    { name: 'Neha Sharma', location: 'Jaipur, India', text: "So happy with this purchase! My skin texture has improved and the dark circles are fading too." },
    { name: 'Simran Singh', location: 'Chandigarh, India', text: "Perfect for sensitive skin! No irritation and visible results in just 2 weeks. Absolutely love it!" },
  ];

  // 24 High-Converting Headline Variations - Randomized for each visitor
  const headlineVariations = [
    { main: "Reverse", highlight: "10 Years", rest: "of Aging in Just 4 Weeks" },
    { main: "Erase", highlight: "Wrinkles", rest: "& Look Years Younger Naturally" },
    { main: "Turn Back", highlight: "Time", rest: "on Your Skin in 28 Days" },
    { main: "Unlock Your", highlight: "Youthful Glow", rest: "Starting Tonight" },
    { main: "Say Goodbye to", highlight: "Fine Lines", rest: "Forever" },
    { main: "Wake Up", highlight: "10 Years Younger", rest: "Every Morning" },
    { main: "The Secret to", highlight: "Ageless Skin", rest: "Finally Revealed" },
    { main: "Transform Your Skin", highlight: "Overnight", rest: "Guaranteed Results" },
    { main: "Reclaim Your", highlight: "20s Skin", rest: "at Any Age" },
    { main: "Defy", highlight: "Aging", rest: "Like Bollywood Stars Do" },
    { main: "Your", highlight: "Wrinkles", rest: "Don't Stand a Chance" },
    { main: "Look", highlight: "5 to 10 Years Younger", rest: "in Just Weeks" },
    { main: "The", highlight: "Anti Aging Secret", rest: "50,000+ Indians Swear By" },
    { main: "Finally:", highlight: "Firm, Tight Skin", rest: "Without Surgery" },
    { main: "Stop Aging", highlight: "in Its Tracks", rest: "Starting Today" },
    { main: "Discover Your", highlight: "Fountain of Youth", rest: "in a Bottle" },
    { main: "Age is Just a Number", highlight: "Prove It", rest: "with Your Skin" },
    { main: "From Tired to", highlight: "Radiant", rest: "in 14 Days" },
    { main: "Your Best Skin", highlight: "at 50", rest: "Starts Here" },
    { main: "Clinically Proven to", highlight: "Reduce Wrinkles 87%", rest: "" },
    { main: "The", highlight: "One Serum", rest: "That Actually Works" },
    { main: "Younger Looking Skin", highlight: "Guaranteed", rest: "or Money Back" },
    { main: "Why Look", highlight: "Your Age", rest: "When You Don't Have To?" },
    { main: "India's #1", highlight: "Anti Aging", rest: "Solution is Here" },
  ];

  // Get random headline (stays same for session)
  const [selectedHeadline] = useState(() => {
    const stored = sessionStorage.getItem('selectedHeadlineIndex');
    if (stored) {
      return headlineVariations[parseInt(stored) % headlineVariations.length];
    }
    const randomIndex = Math.floor(Math.random() * headlineVariations.length);
    sessionStorage.setItem('selectedHeadlineIndex', randomIndex.toString());
    return headlineVariations[randomIndex];
  });

  const faqs = [
    { q: 'Can I use this serum daily?', a: 'Yes, our anti-aging serum is formulated for daily use. Apply it morning and evening after cleansing for best results. Consistent use helps maintain skin health and supports visible improvements over time.' },
    { q: 'Is this suitable for sensitive skin?', a: 'Our serum is dermatologically tested and formulated to be gentle. However, if you have very sensitive skin or specific concerns, we recommend doing a patch test first or consulting with a dermatologist before regular use.' },
    { q: 'How long until I see results?', a: 'Most users notice improved skin texture and hydration within 2-4 weeks of consistent use. Visible reduction in fine lines and enhanced radiance typically appear after 6-8 weeks. Results vary based on individual skin type and condition.' },
    { q: 'Is this serum suitable for both men and women?', a: 'Absolutely. Our anti-aging serum is designed for all skin types and genders. The active ingredients work effectively regardless of gender, addressing common signs of aging and supporting healthy, radiant skin for everyone.' },
    { q: 'Can I layer this with other skincare products?', a: 'Yes, this serum layers well with other products. Apply it after cleansing and toning, but before heavier creams or oils. Allow it to absorb for a minute before applying your moisturizer or sunscreen for optimal results.' },
  ];

  return (
    <div className="pb-24">
      {/* Exit Intent Popup */}
      {showExitPopup && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-5">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center relative animate-bounce-in">
            <button 
              onClick={() => setShowExitPopup(false)}
              className="absolute top-3 right-3 text-gray-400 text-xl"
            >×</button>
            <div className="text-4xl mb-3">🎁</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Wait! Don't Leave Empty Handed</h3>
            <p className="text-gray-600 text-sm mb-4">Get an EXTRA ₹50 OFF on your first order!</p>
            <div className="bg-yellow-100 text-yellow-800 font-bold py-2 px-4 rounded-lg mb-4">
              Use Code: GLOW50
            </div>
            <button
              onClick={() => { setShowExitPopup(false); navigate('/product/anti-aging-serum'); }}
              className="btn-cg-primary w-full"
            >
              Claim My Discount <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Announcement Bar */}
      <div className="announcement-bar">
        🧬 Clinically Proven Anti Aging Formula | Trusted by 50,000+ Women Across India ✨
      </div>

      {/* Urgency Banner */}
      <div className="bg-red-500 text-white py-2 px-4 flex items-center justify-center gap-3 text-sm">
        <Flame size={16} className="animate-pulse" />
        <span className="font-semibold">FLASH SALE ENDS IN:</span>
        <div className="flex gap-1 font-mono font-bold">
          <span className="bg-white/20 px-2 py-0.5 rounded">{String(timeLeft.hours).padStart(2, '0')}</span>:
          <span className="bg-white/20 px-2 py-0.5 rounded">{String(timeLeft.minutes).padStart(2, '0')}</span>:
          <span className="bg-white/20 px-2 py-0.5 rounded">{String(timeLeft.seconds).padStart(2, '0')}</span>
        </div>
      </div>

      {/* Hero Section - Anti-Aging Focused */}
      <section className="px-5 pt-8 pb-6 text-center">
        {/* Problem Statement Badge */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 px-4 py-2 rounded-full mb-4 text-sm font-semibold border border-amber-200">
          <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
          TIRED OF LOOKING OLDER THAN YOU FEEL?
        </div>
        
        {/* Main Headline - Dynamic Random Variation */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight" data-testid="hero-title">
          {selectedHeadline.main} <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">{selectedHeadline.highlight}</span>{selectedHeadline.rest ? <><br/>{selectedHeadline.rest}</> : null}
        </h1>
        
        {/* Sub-headline - Solution Focused, Inclusive */}
        <p className="text-gray-600 mb-4 text-lg" data-testid="hero-description">
          India's #1 Premium Anti Aging Serum for <strong>Wrinkles, Fine Lines & Dull Skin</strong>
        </p>

        {/* Key Benefits - Quick Trust Builders */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-5 text-xs">
          <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-medium flex items-center gap-1">
            <Check size={14} /> Reduces Wrinkles 87%
          </span>
          <span className="bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full font-medium flex items-center gap-1">
            <Check size={14} /> Firms Sagging Skin
          </span>
          <span className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-medium flex items-center gap-1">
            <Check size={14} /> Visible in 14 Days
          </span>
        </div>

        {/* Social Proof - Time Based */}
        <div className="flex items-center justify-center gap-4 mb-6 text-sm">
          <div className="flex items-center gap-1 text-orange-600">
            <Users size={16} />
            <span><strong>{viewingNow}</strong> viewing now</span>
          </div>
          <div className="flex items-center gap-1 text-green-600">
            <ShieldCheck size={16} />
            <span><strong>{soldToday}</strong> sold today</span>
          </div>
        </div>
        
        {/* CTA Button */}
        <button
          onClick={() => navigate('/product/anti-aging-serum')}
          className="btn-cg-primary"
          data-testid="hero-cta"
        >
          Start My Anti Aging Journey  ₹{PREPAID_PRICE}
          <ChevronRight size={20} />
        </button>

        {/* Trust Elements */}
        <p className="text-xs text-gray-500 mt-3">
          ✓ Free Delivery &nbsp; ✓ COD Available &nbsp; ✓ 30 Day Money Back Guarantee
        </p>

        {/* Age-Specific Social Proof */}
        <div className="mt-5 mx-auto max-w-xs bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3" data-testid="location-social-proof">
          <div className="flex items-center justify-center gap-2">
            <MapPin size={16} className="text-green-600" />
            <p className="text-sm text-gray-700">
              <span className="font-bold text-green-600">{userLocation.customerCount.toLocaleString()}+</span> customers in <span className="font-semibold">{userLocation.state}</span> trust Celesta Glow
            </p>
          </div>
        </div>

        {/* Gender Inclusive Trust Badge */}
        <div className="mt-4 inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-sm text-gray-700">
          <span>👨‍💼👩‍💼</span>
          <span>Trusted by <strong>Men & Women</strong> ages 25-55</span>
        </div>

        {/* Free Consultation CTA */}
        <div className="mt-6 mx-auto max-w-sm">
          <button
            onClick={() => {
              trackCTAClick('consultation_hero', 'homepage');
              navigate('/consultation');
            }}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
            data-testid="consultation-cta"
          >
            🔬 Get Free Personalized Skin Analysis
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">AI-Powered</span>
          </button>
          <p className="text-xs text-gray-500 mt-2">Know your exact skin age & get customized routine</p>
        </div>
      </section>

      {/* Product Image - Age Regression Score */}
      <section className="px-5 py-6">
        <div className="flex justify-center">
          <img 
            src={HERO_IMAGE}
            alt="Celesta Glow - 95 Age Regression Score"
            className="w-80 h-auto max-w-full"
            data-testid="hero-product-image"
          />
        </div>
      </section>

      {/* Aging Problem Awareness Section */}
      <section className="px-5 py-6 bg-gradient-to-b from-amber-50 to-white">
        <div className="text-center mb-6">
          <p className="text-xs font-semibold text-amber-600 tracking-wider uppercase mb-2">Do You Relate?</p>
          <h2 className="text-xl font-bold text-gray-900">Signs of Aging You Can't Ignore</h2>
        </div>
        
        <div className="space-y-3 max-w-sm mx-auto">
          {[
            { problem: 'Fine lines around eyes & forehead', emoji: '👁️' },
            { problem: 'Dull, tired-looking skin', emoji: '😔' },
            { problem: 'Sagging & loss of firmness', emoji: '📉' },
            { problem: 'Dark spots & uneven skin tone', emoji: '🔵' },
            { problem: 'Dry, dehydrated skin', emoji: '🏜️' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-amber-100 shadow-sm">
              <span className="text-2xl">{item.emoji}</span>
              <span className="text-gray-700 font-medium">{item.problem}</span>
              <Check className="ml-auto text-red-500 w-5 h-5" />
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200 text-center">
          <p className="text-green-800 font-semibold mb-1">Good News!</p>
          <p className="text-sm text-green-700">Celesta Glow targets ALL these concerns with our advanced multi-peptide formula</p>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="px-5 py-4">
        <div className="flex justify-around">
          {[
            { icon: ShieldCheck, label: 'Dermatologist Tested' },
            { icon: Truck, label: 'Free Delivery' },
            { icon: Clock, label: '2-3 Day Delivery' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <item.icon size={18} className="text-green-600" />
              </div>
              <span className="text-xs text-gray-600 text-center">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Real Results Showcase - Fixed Height Frame */}
      <TransformationShowcase />

      {/* Introducing Section */}
      <section className="px-5 py-8">
        <p className="section-label">INTRODUCING</p>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Advanced Age Balance Multi Active Serum
        </h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          A thoughtfully balanced formula combining hydration, tone support, and renewal ingredients for consistent daily care.
        </p>
        
        <div className="space-y-3 mb-6">
          {[
            'Supports smoother texture',
            'Helps improve uneven tone',
            'Maintains hydration balance',
            'Suitable for daily use'
          ].map((item, i) => (
            <div key={i} className="check-item" data-testid={`benefit-${i}`}>
              <div className="check-icon">
                <Check size={14} />
              </div>
              <span className="text-gray-700">{item}</span>
            </div>
          ))}
        </div>
        
        <button
          onClick={() => navigate('/product/anti-aging-serum')}
          className="btn-cg-dark w-full"
          data-testid="shop-now-cta"
        >
          Shop Now
        </button>
      </section>

      {/* Testimonials - Auto-scrolling Carousel */}
      <section className="py-8 overflow-hidden">
        <div className="px-5 mb-4">
          <h2 className="text-2xl font-bold text-gray-900">What Our Customers Say</h2>
          <p className="text-gray-500 text-sm">2,340+ verified reviews</p>
        </div>
        
        {/* Auto-scrolling container */}
        <div className="testimonial-scroll-container">
          <div className="testimonial-scroll-track">
            {/* First set of testimonials */}
            {testimonials.map((t, i) => (
              <div key={`a-${i}`} className="testimonial-card min-w-[280px] flex-shrink-0 mx-2" data-testid={`testimonial-${i}`}>
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={16} className="star-gold" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm mb-4 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-semibold">{t.name[0]}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{t.name}</p>
                    <p className="text-gray-500 text-xs flex items-center gap-1">
                      <Check size={12} className="text-green-500" /> Verified Buyer • {t.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {testimonials.map((t, i) => (
              <div key={`b-${i}`} className="testimonial-card min-w-[280px] flex-shrink-0 mx-2">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={16} className="star-gold" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm mb-4 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-semibold">{t.name[0]}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{t.name}</p>
                    <p className="text-gray-500 text-xs flex items-center gap-1">
                      <Check size={12} className="text-green-500" /> Verified Buyer • {t.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Skin Changes */}
      <section className="px-5 py-8 bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">
          Why Skin Changes Over Time
        </h2>
        <p className="text-gray-600 text-center text-sm mb-6">
          As skin matures, cellular renewal slows and environmental exposure accumulates.
        </p>
        
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { title: 'Fine Lines', desc: 'Collagen production decreases gradually' },
            { title: 'Uneven Tone', desc: 'Sun exposure creates pigmentation' },
            { title: 'Dullness', desc: 'Dead cells diminish natural radiance' },
            { title: 'Breakouts', desc: 'Hormonal shifts can trigger congestion' },
          ].map((item, i) => (
            <div key={i} className="card-cg text-center p-4">
              <h3 className="font-semibold text-gray-900 mb-1 text-sm">{item.title}</h3>
              <p className="text-gray-500 text-xs">{item.desc}</p>
            </div>
          ))}
        </div>
        
        <div className="quote-card">
          <p className="text-gray-700 text-sm italic">
            "Effective skincare isn't about aggressive intervention. It's about consistent, balanced support that works with your skin's natural processes."
          </p>
        </div>
      </section>

      {/* 4 Serums in One */}
      <section className="px-5 py-8">
        <div className="text-center mb-6">
          <p className="text-xs text-gray-500 mb-1">India's First All in 1 Serum</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            4 Serums in <span className="text-green-500">One</span> Bottle
          </h2>
          <p className="text-gray-600 text-sm">
            Why buy 4 separate serums when you can get all benefits in one?
          </p>
          <div className="inline-block mt-2 px-3 py-1.5 bg-green-50 rounded-full">
            <span className="text-green-600 font-semibold text-sm">Save ₹1900+ Instantly</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {[
            { num: 1, label: 'Anti Aging', ingredient: 'Retinol', desc: 'Smooths skin texture and minimizes pores' },
            { num: 2, label: 'Skin Brightening', ingredient: 'Niacinamide', desc: 'Reduces dark spots and pigmentation' },
            { num: 3, label: 'Skin Protection', ingredient: 'Vitamin E', desc: 'Fights fine lines and protects from damage' },
            { num: 4, label: 'Deep Hydration', ingredient: 'Hyaluronic Acid', desc: 'Locks in moisture for plump skin' },
          ].map((item, i) => (
            <div key={i} className="ingredient-card" data-testid={`ingredient-${i}`}>
              <div className="ingredient-number">{item.num}</div>
              <p className="text-xs text-gray-500 mb-0.5">{item.label}</p>
              <h3 className="font-bold text-gray-900 mb-1 text-sm">{item.ingredient}</h3>
              <p className="text-gray-500 text-xs">{item.desc}</p>
            </div>
          ))}
        </div>
        
        <button
          onClick={() => navigate('/product/anti-aging-serum')}
          className="btn-cg-primary w-full mt-6"
          data-testid="order-now-cta"
        >
          Order Now  ₹{PREPAID_PRICE}
          <ChevronRight size={20} />
        </button>
      </section>

      {/* How to Use */}
      <section className="px-5 py-8 bg-gray-50">
        <h2 className="text-xl font-bold text-gray-900 mb-5">How to Use & Who It's For</h2>
        
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">How to Use</h3>
          <div className="space-y-2">
            {[
              'Cleanse your face thoroughly with a gentle cleanser',
              'Apply 2–3 drops to face and neck, avoiding eye area',
              'Follow with your favorite moisturizer',
              'Use sunscreen during daytime (SPF 30 or higher)'
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <span className="text-gray-700 text-sm">{step}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3 italic">
            For retinol beginners: Start with 2–3 times per week, then gradually increase.
          </p>
        </div>
        
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Ideal For</h3>
          <div className="space-y-1.5">
            {[
              'Ages 28+ looking to maintain youthful skin',
              'Uneven skin tone and texture concerns',
              'Fine lines and early signs of aging',
              'Those seeking simplified, effective routines'
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-700 text-sm">
                <span className="text-green-500">•</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-5 py-8">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Frequently Asked Questions</h2>
        <p className="text-gray-500 text-sm mb-5">Everything you need to know about our serum</p>
        
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="faq-item" data-testid={`faq-${i}`}>
              <button
                onClick={() => {
                  setExpandedFaq(expandedFaq === i ? null : i);
                  if (expandedFaq !== i) {
                    trackFAQInteraction(faq.q);
                  }
                }}
                className="faq-header"
              >
                <span className="text-sm">{faq.q}</span>
                {expandedFaq === i ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
              </button>
              {expandedFaq === i && (
                <div className="faq-content text-xs">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-5 py-8 text-center">
        <p className="text-gray-600 text-sm mb-4">
          Healthy skin is built through consistent care. Start your journey to radiant, youthful-looking skin today.
        </p>
        <button
          onClick={() => navigate('/product/anti-aging-serum')}
          className="btn-cg-primary"
          data-testid="final-cta"
        >
          Order Now  ₹{PREPAID_PRICE}
          <ChevronRight size={20} />
        </button>
      </section>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 p-3 z-50 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-xs text-gray-500">Limited Time Offer</p>
            <p className="font-bold text-gray-900">₹{PREPAID_PRICE} <span className="text-sm text-gray-400 line-through">₹{MRP}</span> <span className="text-xs text-green-600 font-medium">60% OFF</span></p>
          </div>
          <button
            onClick={() => navigate('/product/anti-aging-serum')}
            className="btn-cg-primary py-3 px-6"
          >
            Order Now <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce-in {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in { animation: bounce-in 0.3s ease-out; }
        
        /* Auto-scrolling testimonials */
        .testimonial-scroll-container {
          overflow: hidden;
          width: 100%;
        }
        .testimonial-scroll-track {
          display: flex;
          animation: scroll-testimonials 30s linear infinite;
          width: max-content;
        }
        .testimonial-scroll-track:hover {
          animation-play-state: paused;
        }
        @keyframes scroll-testimonials {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      {/* ₹50 Discount Popup */}
      {showDiscountPopup && (
        <DiscountPopup 
          sessionId={sessionId}
          currentPage="homepage"
          onClose={() => setShowDiscountPopup(false)}
        />
      )}
    </div>
  );
}

export default Homepage;
