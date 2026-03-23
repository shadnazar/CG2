import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Check, Star, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Actual Celesta Glow product image from your website
const PRODUCT_IMAGE = 'https://celestaglow.com/cdn/shop/files/IMG_0538.png?v=1771463966&width=1000';

function Homepage() {
  const navigate = useNavigate();
  const [expandedFaq, setExpandedFaq] = useState(null);

  useEffect(() => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    axios.post(`${API}/track?page=homepage&session_id=${sessionId}`).catch(() => {});
    
    if (window.fbq) {
      window.fbq('track', 'ViewContent', { content_name: 'Homepage' });
    }
  }, []);

  const testimonials = [
    { name: 'Priya', location: 'Mumbai, India', text: "This serum has transformed my skin! My Aging Issues has reduced significantly and I'm glowing naturally." },
    { name: 'Varun', location: 'Bangalore, India', text: "Amazing product! My Lines are fading and my skin feels so soft. Highly recommend for Indian skin tones." },
    { name: 'Kavya Prakash', location: 'Ahmedabad, India', text: "Best serum I've used! My skin looks brighter and Youthful. Worth every rupee!" },
    { name: 'Snehaj', location: 'Chennai, India', text: "I've been using this for 3 weeks and the results are incredible. My skin Looks more Younger now!" },
  ];

  const faqs = [
    { q: 'Can I use this serum daily?', a: 'Yes, our anti-aging serum is formulated for daily use. Apply it morning and evening after cleansing for best results.' },
    { q: 'Is this suitable for sensitive skin?', a: 'Our serum is dermatologically tested and formulated to be gentle. We recommend doing a patch test first.' },
    { q: 'How long until I see results?', a: 'Most users notice improved skin texture within 2-4 weeks. Visible reduction in fine lines typically appears after 6-8 weeks.' },
  ];

  return (
    <div className="pb-20">
      {/* Announcement Bar */}
      <div className="announcement-bar">
        New Launch 🎉 India's First All in One Multi Benefit Age Balance Serum ✨
      </div>

      {/* Hero Section */}
      <section className="px-5 pt-10 pb-8 text-center">
        <div className="badge-cg mb-6">
          <span className="w-2 h-2 bg-white rounded-full"></span>
          NO MORE SKIN PROBLEMS
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight" data-testid="hero-title">
          Unlock Your Perfect Skin With Celesta Glow
        </h1>
        
        <p className="text-gray-600 mb-8" data-testid="hero-description">
          Get personalized products for your Skin
        </p>
        
        <button
          onClick={() => navigate('/product/anti-aging-serum')}
          className="btn-cg-primary"
          data-testid="hero-cta"
        >
          Order Now
          <ChevronRight size={20} />
        </button>
      </section>

      {/* Product Image */}
      <section className="px-5 py-8">
        <div className="flex justify-center">
          <img 
            src={PRODUCT_IMAGE}
            alt="Celesta Glow Advanced Face Serum"
            className="w-64 h-auto"
            data-testid="hero-product-image"
          />
        </div>
      </section>

      {/* Introducing Section */}
      <section className="px-5 py-10">
        <p className="section-label">INTRODUCING</p>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Advanced Age Balance Multi Active Serum
        </h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          A thoughtfully balanced formula combining hydration, tone support, and renewal ingredients for consistent daily care.
        </p>
        
        <div className="space-y-4 mb-8">
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

      {/* Testimonials */}
      <section className="py-10">
        <div className="px-5 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">What Our Customers Say</h2>
        </div>
        
        <div className="flex gap-4 overflow-x-auto hide-scrollbar px-5 pb-4">
          {testimonials.map((t, i) => (
            <div key={i} className="testimonial-card min-w-[280px] flex-shrink-0" data-testid={`testimonial-${i}`}>
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={16} className="star-gold" />
                ))}
              </div>
              <p className="text-gray-700 text-sm mb-4 leading-relaxed">{t.text}</p>
              <div>
                <p className="font-semibold text-gray-900">{t.name}</p>
                <p className="text-gray-500 text-sm">{t.location}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Skin Changes */}
      <section className="px-5 py-10 bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
          Why Skin Changes Over Time
        </h2>
        <p className="text-gray-600 text-center mb-8">
          As skin matures, cellular renewal slows and environmental exposure accumulates.
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[
            { title: 'Fine Lines', desc: 'Collagen production decreases gradually' },
            { title: 'Uneven Tone', desc: 'Sun exposure creates pigmentation' },
            { title: 'Dullness', desc: 'Dead cells diminish natural radiance' },
            { title: 'Breakouts', desc: 'Hormonal shifts can trigger congestion' },
          ].map((item, i) => (
            <div key={i} className="card-cg text-center">
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
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
      <section className="px-5 py-10">
        <div className="text-center mb-8">
          <p className="text-sm text-gray-500 mb-2">India's First All in 1 Serum</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            4 Serums in <span className="text-green-500">One</span> Bottle
          </h2>
          <p className="text-gray-600 text-sm">
            Why buy 4 separate serums when you can get all benefits in one?
          </p>
          <div className="inline-block mt-3 px-4 py-2 bg-green-50 rounded-full">
            <span className="text-green-600 font-semibold">Save ₹1900+ Instantly</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {[
            { num: 1, label: 'Anti Aging', ingredient: 'Retinol', desc: 'Smooths skin texture and minimizes pores' },
            { num: 2, label: 'Skin Brightening', ingredient: 'Niacinamide', desc: 'Reduces dark spots and pigmentation' },
            { num: 3, label: 'Skin Protection', ingredient: 'Vitamin E', desc: 'Fights fine lines and protects from damage' },
            { num: 4, label: 'Deep Hydration', ingredient: 'Hyaluronic Acid', desc: 'Locks in moisture for plump skin' },
          ].map((item, i) => (
            <div key={i} className="ingredient-card" data-testid={`ingredient-${i}`}>
              <div className="ingredient-number">{item.num}</div>
              <p className="text-xs text-gray-500 mb-1">{item.label}</p>
              <h3 className="font-bold text-gray-900 mb-2">{item.ingredient}</h3>
              <p className="text-gray-500 text-xs">{item.desc}</p>
            </div>
          ))}
        </div>
        
        <button
          onClick={() => navigate('/product/anti-aging-serum')}
          className="btn-cg-primary w-full mt-8"
          data-testid="order-now-cta"
        >
          Order Now
          <ChevronRight size={20} />
        </button>
      </section>

      {/* How to Use */}
      <section className="px-5 py-10 bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Use & Who It's For</h2>
        
        <div className="mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">How to Use</h3>
          <div className="space-y-3">
            {[
              'Cleanse your face thoroughly with a gentle cleanser',
              'Apply 2–3 drops to face and neck, avoiding eye area',
              'Follow with your favorite moisturizer',
              'Use sunscreen during daytime (SPF 30 or higher)'
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <span className="text-gray-700 text-sm">{step}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Ideal For</h3>
          <div className="space-y-2">
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
      <section className="px-5 py-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h2>
        <p className="text-gray-500 text-sm mb-6">Everything you need to know about our anti-aging serum</p>
        
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="faq-item" data-testid={`faq-${i}`}>
              <button
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                className="faq-header"
              >
                <span>{faq.q}</span>
                {expandedFaq === i ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
              </button>
              {expandedFaq === i && (
                <div className="faq-content">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-5 py-10 text-center">
        <p className="text-gray-600 mb-6">
          Healthy skin is built through consistent care. Start your journey to radiant, youthful-looking skin today.
        </p>
        <button
          onClick={() => navigate('/product/anti-aging-serum')}
          className="btn-cg-dark"
          data-testid="final-cta"
        >
          Shop Now
        </button>
      </section>
    </div>
  );
}

export default Homepage;
