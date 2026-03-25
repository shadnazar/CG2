import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Check, Star, ChevronRight, ChevronDown, ChevronUp, Clock, Users, ShieldCheck, Truck, Flame } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// New Celesta Glow product image
const PRODUCT_IMAGE = 'https://customer-assets.emergentagent.com/job_fc697aed-c4ed-4c4b-8eec-b51bdf774715/artifacts/8mw94eq5_IMG_9115.png';

function Homepage() {
  const navigate = useNavigate();
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 47, seconds: 33 });
  const [viewingNow, setViewingNow] = useState(23);
  const [soldToday, setSoldToday] = useState(47);
  const [showExitPopup, setShowExitPopup] = useState(false);

  useEffect(() => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    axios.post(`${API}/track?page=homepage&session_id=${sessionId}`).catch(() => {});
    
    if (window.fbq) {
      window.fbq('track', 'ViewContent', { content_name: 'Homepage' });
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

    // Random viewers count
    const viewerInterval = setInterval(() => {
      setViewingNow(prev => Math.max(15, prev + Math.floor(Math.random() * 5) - 2));
    }, 5000);

    // Exit intent detection
    const handleMouseLeave = (e) => {
      if (e.clientY < 10 && !sessionStorage.getItem('exitPopupShown')) {
        setShowExitPopup(true);
        sessionStorage.setItem('exitPopupShown', 'true');
      }
    };
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearInterval(timer);
      clearInterval(viewerInterval);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // All 10 real testimonials from celestaglow.com
  const testimonials = [
    { name: 'Priya', location: 'Mumbai, India', text: "This serum has transformed my skin! My Aging Issues has reduced significantly and I'm glowing naturally." },
    { name: 'Varun', location: 'Bangalore, India', text: "Amazing product! My Lines are fading and my skin feels so soft. Highly recommend for Indian skin tones." },
    { name: 'Kavya Prakash', location: 'Ahmedabad, India', text: "Best serum I've used! My skin looks brighter and Youthful. Worth every rupee!" },
    { name: 'Snehaj', location: 'Chennai, India', text: "I've been using this for 3 weeks and the results are incredible. My skin Looks more Younger now!" },
    { name: 'Lakshmi', location: 'Delhi, India', text: "Finally found a serum that works! My Wrinkles acne scars are lightening and my skin feels nourished." },
    { name: 'Devapriya', location: 'Pune, India', text: "Love this serum! It absorbs quickly and doesn't feel greasy. My skin has never looked better." },
    { name: 'Divya Nair', location: 'Kochi, India', text: "This is a game changer! My melasma has reduced and I feel confident without makeup now." },
    { name: 'Aisha Khan', location: 'Hyderabad, India', text: "Excellent quality! My skin feels hydrated and the glow is real. Thank you Celesta Glow!" },
    { name: 'Neha Sharma', location: 'Jaipur, India', text: "So happy with this purchase! My skin texture has improved and the dark circles are fading too." },
    { name: 'Simran Singh', location: 'Chandigarh, India', text: "Perfect for sensitive skin! No irritation and visible results in just 2 weeks. Absolutely love it!" },
  ];

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
        New Launch 🎉 India's First All in One Multi Benefit Age Balance Serum ✨
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

      {/* Hero Section */}
      <section className="px-5 pt-8 pb-6 text-center">
        <div className="badge-cg mb-4">
          <span className="w-2 h-2 bg-white rounded-full"></span>
          NO MORE SKIN PROBLEMS
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight" data-testid="hero-title">
          Unlock Your Perfect Skin With Celesta Glow
        </h1>
        
        <p className="text-gray-600 mb-6" data-testid="hero-description">
          Get personalized products for your Skin
        </p>

        {/* Social Proof */}
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
        
        <button
          onClick={() => navigate('/product/anti-aging-serum')}
          className="btn-cg-primary"
          data-testid="hero-cta"
        >
          Order Now — ₹399
          <ChevronRight size={20} />
        </button>

        <p className="text-xs text-gray-500 mt-3">
          ✓ Free Delivery &nbsp; ✓ COD Available &nbsp; ✓ Easy Returns
        </p>
      </section>

      {/* Product Image */}
      <section className="px-5 py-6">
        <div className="flex justify-center">
          <img 
            src={PRODUCT_IMAGE}
            alt="Celesta Glow Advanced Face Serum"
            className="w-64 h-auto"
            data-testid="hero-product-image"
          />
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

      {/* Testimonials - Scrollable */}
      <section className="py-8">
        <div className="px-5 mb-4">
          <h2 className="text-2xl font-bold text-gray-900">What Our Customers Say</h2>
          <p className="text-gray-500 text-sm">2,340+ verified reviews</p>
        </div>
        
        <div className="flex gap-4 overflow-x-auto hide-scrollbar px-5 pb-4">
          {testimonials.map((t, i) => (
            <div key={i} className="testimonial-card min-w-[280px] flex-shrink-0" data-testid={`testimonial-${i}`}>
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
                  <p className="text-gray-500 text-xs">{t.location}</p>
                </div>
              </div>
            </div>
          ))}
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
          Order Now — ₹399
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
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
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
          Order Now — ₹399
          <ChevronRight size={20} />
        </button>
      </section>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 p-3 z-50 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-xs text-gray-500">Limited Time Offer</p>
            <p className="font-bold text-gray-900">₹399 <span className="text-sm text-gray-400 line-through">₹1499</span></p>
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
      `}</style>
    </div>
  );
}

export default Homepage;
