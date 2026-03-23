import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Shield, Leaf, Sparkles, Droplets, ChevronRight, Star } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function Homepage() {
  const navigate = useNavigate();

  useEffect(() => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    axios.post(`${API}/track?page=homepage&session_id=${sessionId}`).catch(() => {});
    
    if (window.fbq) {
      window.fbq('track', 'ViewContent', { content_name: 'Homepage', content_category: 'Homepage' });
    }
  }, []);

  return (
    <div className="pb-24">
      {/* Hero Section */}
      <section className="relative px-6 pt-10 pb-12">
        {/* Background texture */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/6496467/pexels-photo-6496467.jpeg?auto=compress&cs=tinysrgb&w=800)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/95 to-white" />
        
        <div className="relative">
          <p className="text-sky-600 text-sm font-medium tracking-wide uppercase mb-3" data-testid="hero-tag">
            Clinically Proven Formula
          </p>
          <h1 className="font-heading text-3xl font-bold text-slate-900 leading-tight mb-4" data-testid="hero-title">
            Reduce Fine Lines in Just 4 Weeks
          </h1>
          <p className="text-slate-600 text-base leading-relaxed mb-8" data-testid="hero-description">
            Dermatologist-tested anti-aging serum with Retinol & Hyaluronic Acid. Trusted by 10,000+ women across India.
          </p>
          
          <button
            onClick={() => navigate('/product/anti-aging-serum')}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-4 px-6 rounded-full shadow-lg shadow-sky-500/25 transition-all btn-active"
            data-testid="hero-cta"
          >
            Shop Now — ₹399
          </button>
        </div>
      </section>

      {/* Trust Bar - Horizontal Scroll */}
      <section className="border-y border-slate-100 bg-slate-50/50">
        <div className="trust-scroll">
          {[
            { icon: Shield, label: 'Dermatologist Tested' },
            { icon: Leaf, label: 'Paraben Free' },
            { icon: Sparkles, label: 'Cruelty Free' },
            { icon: Droplets, label: 'Hypoallergenic' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-slate-600" data-testid={`trust-badge-${i}`}>
              <item.icon size={18} className="text-sky-500" />
              <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-6 py-12">
        <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-2" data-testid="benefits-title">
          The Science of Youthful Skin
        </h2>
        <p className="text-slate-500 text-sm mb-8">Proven ingredients, visible results</p>

        <div className="space-y-4">
          {[
            {
              icon: Droplets,
              title: 'Deep Hydration',
              desc: 'Hyaluronic acid locks in moisture for 24 hours',
              color: 'bg-blue-50 text-blue-600',
            },
            {
              icon: Sparkles,
              title: 'Reduces Wrinkles',
              desc: 'Retinol stimulates collagen production naturally',
              color: 'bg-amber-50 text-amber-600',
            },
            {
              icon: Shield,
              title: 'Firms & Lifts',
              desc: 'Peptides restore skin elasticity and firmness',
              color: 'bg-emerald-50 text-emerald-600',
            },
          ].map((benefit, i) => (
            <div 
              key={i} 
              className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm"
              data-testid={`benefit-card-${i}`}
            >
              <div className={`p-3 rounded-xl ${benefit.color}`}>
                <benefit.icon size={22} />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-slate-900 mb-1">{benefit.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{benefit.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="px-6 py-12 bg-slate-50">
        <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-2" data-testid="testimonials-title">
          Loved by Thousands
        </h2>
        <p className="text-slate-500 text-sm mb-8">Real results from real customers</p>

        <div className="space-y-4">
          {[
            {
              name: 'Priya S.',
              location: 'Mumbai',
              text: 'Visible results in just 3 weeks! My skin looks brighter and fine lines are fading.',
              rating: 5,
            },
            {
              name: 'Anjali M.',
              location: 'Bangalore',
              text: 'My skin feels so much smoother and hydrated. The dark spots are lighter too.',
              rating: 5,
            },
          ].map((review, i) => (
            <div 
              key={i} 
              className="p-5 bg-white rounded-2xl border border-slate-100"
              data-testid={`testimonial-${i}`}
            >
              <div className="flex gap-1 mb-3">
                {[...Array(review.rating)].map((_, j) => (
                  <Star key={j} size={16} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-700 text-sm leading-relaxed mb-4">"{review.text}"</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center">
                  <span className="text-sky-600 font-semibold text-sm">{review.name[0]}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{review.name}</p>
                  <p className="text-xs text-slate-500">{review.location} • Verified Purchase</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-12">
        <div className="text-center">
          <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-3" data-testid="cta-title">
            Start Your Skin Journey
          </h2>
          <p className="text-slate-500 text-sm mb-6">Join 10,000+ happy customers today</p>
          
          <button
            onClick={() => navigate('/product/anti-aging-serum')}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-4 px-6 rounded-full shadow-lg shadow-sky-500/25 transition-all btn-active flex items-center justify-center gap-2"
            data-testid="final-cta"
          >
            Explore Our Serum
            <ChevronRight size={20} />
          </button>
        </div>
      </section>
    </div>
  );
}

export default Homepage;
