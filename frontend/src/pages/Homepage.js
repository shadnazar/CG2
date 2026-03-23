import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Sparkles, Droplets, Shield, Leaf, ChevronRight, Star } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Premium images from Nano Banana generation
const IMAGES = {
  hero: 'https://static.prod-images.emergentagent.com/jobs/fc697aed-c4ed-4c4b-8eec-b51bdf774715/images/27894ae9ca30caf0fab852aa459f72223733d28b3a81b8979f89dd19fe6fe798.png',
  texture: 'https://static.prod-images.emergentagent.com/jobs/fc697aed-c4ed-4c4b-8eec-b51bdf774715/images/c474ac300332fd9283947cecdddd0257476c41137c0042fa659909b33b3a7836.png',
  lifestyle: 'https://static.prod-images.emergentagent.com/jobs/fc697aed-c4ed-4c4b-8eec-b51bdf774715/images/6a465034e43062f476193afe6aee476c21a704998eefa78c8353d03d44be2c37.png',
  ingredients: 'https://static.prod-images.emergentagent.com/jobs/fc697aed-c4ed-4c4b-8eec-b51bdf774715/images/708dc11f93faec6ad22c71f52babd707a4bff3db72b39c1f92b2ebfb9fd2761b.png',
};

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
    <div className="pb-28">
      {/* Hero Section - Premium */}
      <section className="relative min-h-[85vh] flex flex-col">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={IMAGES.texture}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/70 to-white" />
        </div>
        
        <div className="relative flex-1 flex flex-col justify-center px-7 pt-8 pb-12">
          {/* Premium Badge */}
          <div className="inline-flex items-center gap-2 mb-6" data-testid="hero-badge">
            <div className="w-8 h-[1px] bg-[#c9a962]" />
            <span className="text-xs tracking-[0.2em] uppercase text-[#5f7350] font-medium">
              Luxury Skincare
            </span>
          </div>

          <h1 
            className="text-premium-heading text-[2.5rem] leading-[1.1] font-semibold mb-5 animate-fade-in-up"
            data-testid="hero-title"
          >
            Timeless Beauty,<br />
            <span className="text-[#5f7350]">Naturally Yours</span>
          </h1>
          
          <p 
            className="text-premium-body text-base mb-8 max-w-[300px]"
            data-testid="hero-description"
          >
            Discover our age-defying serum crafted with rare botanicals and advanced peptides for visibly younger skin.
          </p>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 mb-8">
            <span className="text-3xl font-semibold text-[#1a2e1a]">₹399</span>
            <span className="text-lg text-[#96a883] line-through">₹1,499</span>
            <span className="text-xs font-medium text-white bg-[#c9a962] px-2 py-1 rounded-full">
              73% OFF
            </span>
          </div>
          
          <button
            onClick={() => navigate('/product/anti-aging-serum')}
            className="btn-premium text-white font-medium py-4 px-8 rounded-full w-fit"
            data-testid="hero-cta"
          >
            Shop the Collection
          </button>
        </div>
      </section>

      {/* Trust Indicators - Premium Horizontal Scroll */}
      <section className="border-y border-[#f3efe6] bg-[#fdfcfa]">
        <div className="trust-scroll">
          {[
            { icon: Shield, label: 'Dermatologist Approved' },
            { icon: Leaf, label: 'Organic Ingredients' },
            { icon: Sparkles, label: 'Cruelty Free' },
            { icon: Droplets, label: 'Paraben Free' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3" data-testid={`trust-badge-${i}`}>
              <div className="w-10 h-10 rounded-full bg-[#f6f7f4] flex items-center justify-center">
                <item.icon size={18} className="text-[#5f7350]" />
              </div>
              <span className="text-sm font-medium text-[#4a5a3f] whitespace-nowrap">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Lifestyle Image Section */}
      <section className="relative h-[400px] my-8 mx-6 rounded-3xl overflow-hidden">
        <img 
          src={IMAGES.lifestyle}
          alt="Woman enjoying skincare routine"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 image-overlay" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <p className="text-white/80 text-xs tracking-wider uppercase mb-2">The Ritual</p>
          <h3 className="text-white text-xl font-semibold mb-3">Elevate Your Daily Routine</h3>
          <p className="text-white/90 text-sm">Transform ordinary moments into luxurious self-care experiences.</p>
        </div>
      </section>

      {/* Benefits Section - Premium Cards */}
      <section className="px-6 py-12">
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.2em] uppercase text-[#c9a962] mb-3">The Science</p>
          <h2 className="text-premium-heading text-2xl font-semibold" data-testid="benefits-title">
            Visible Results in 4 Weeks
          </h2>
        </div>

        <div className="space-y-4">
          {[
            {
              icon: Droplets,
              title: 'Deep Hydration',
              desc: 'Hyaluronic acid penetrates 3 layers deep, locking in moisture for 72 hours.',
              stat: '94%',
              statLabel: 'felt hydrated'
            },
            {
              icon: Sparkles,
              title: 'Wrinkle Reduction',
              desc: 'Advanced retinol complex visibly smooths fine lines and wrinkles.',
              stat: '89%',
              statLabel: 'saw reduction'
            },
            {
              icon: Shield,
              title: 'Firm & Lift',
              desc: 'Peptide technology restores elasticity for a firmer, youthful appearance.',
              stat: '91%',
              statLabel: 'felt firmer'
            },
          ].map((benefit, i) => (
            <div 
              key={i} 
              className="card-premium p-6"
              data-testid={`benefit-card-${i}`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f6f7f4] to-[#e8ebe3] flex items-center justify-center flex-shrink-0">
                  <benefit.icon size={22} className="text-[#5f7350]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-premium-heading text-lg font-semibold mb-1">{benefit.title}</h3>
                  <p className="text-premium-body text-sm">{benefit.desc}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-semibold text-[#5f7350]">{benefit.stat}</p>
                  <p className="text-xs text-[#96a883]">{benefit.statLabel}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ingredients Showcase */}
      <section className="py-12 bg-[#fdfcfa]">
        <div className="px-6 mb-8">
          <p className="text-xs tracking-[0.2em] uppercase text-[#c9a962] mb-3">Premium Ingredients</p>
          <h2 className="text-premium-heading text-2xl font-semibold">Nature Meets Science</h2>
        </div>
        <div className="relative h-56 mb-6">
          <img 
            src={IMAGES.ingredients}
            alt="Premium botanical ingredients"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="px-6 grid grid-cols-3 gap-4">
          {['Retinol 0.5%', 'Hyaluronic Acid', 'Vitamin C'].map((item, i) => (
            <div key={i} className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-white border border-[#e8ebe3] flex items-center justify-center">
                <Leaf size={18} className="text-[#5f7350]" />
              </div>
              <p className="text-xs font-medium text-[#4a5a3f]">{item}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials - Premium */}
      <section className="px-6 py-12">
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.2em] uppercase text-[#c9a962] mb-3">Reviews</p>
          <h2 className="text-premium-heading text-2xl font-semibold" data-testid="testimonials-title">
            Loved by Thousands
          </h2>
        </div>

        <div className="space-y-4">
          {[
            {
              name: 'Priya S.',
              location: 'Mumbai',
              text: '"My skin has never looked this radiant. The fine lines around my eyes have visibly reduced. Absolutely worth every penny."',
              rating: 5,
              verified: true,
            },
            {
              name: 'Anjali M.',
              location: 'Bangalore',
              text: '"I was skeptical at first, but the results speak for themselves. My skin feels so luxurious and deeply nourished."',
              rating: 5,
              verified: true,
            },
          ].map((review, i) => (
            <div 
              key={i} 
              className="card-premium p-6"
              data-testid={`testimonial-${i}`}
            >
              <div className="flex gap-1 mb-4">
                {[...Array(review.rating)].map((_, j) => (
                  <Star key={j} size={14} className="fill-[#c9a962] text-[#c9a962]" />
                ))}
              </div>
              <p className="text-premium-body text-sm italic mb-5">{review.text}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e8ebe3] to-[#d4daca] flex items-center justify-center">
                    <span className="text-sm font-semibold text-[#5f7350]">{review.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1a2e1a]">{review.name}</p>
                    <p className="text-xs text-[#96a883]">{review.location}</p>
                  </div>
                </div>
                {review.verified && (
                  <span className="text-xs text-[#5f7350] bg-[#f6f7f4] px-2 py-1 rounded-full">
                    Verified
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA - Premium */}
      <section className="mx-6 mb-8 rounded-3xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#3d4935] to-[#1a2e1a]" />
        <div className="relative px-8 py-12 text-center">
          <p className="text-[#c9a962] text-xs tracking-[0.2em] uppercase mb-3">Limited Offer</p>
          <h2 className="text-white text-2xl font-semibold mb-3" data-testid="cta-title">
            Begin Your Journey to Radiance
          </h2>
          <p className="text-white/70 text-sm mb-8">Join 10,000+ women who transformed their skin</p>
          
          <button
            onClick={() => navigate('/product/anti-aging-serum')}
            className="btn-gold text-white font-medium py-4 px-10 rounded-full inline-flex items-center gap-2"
            data-testid="final-cta"
          >
            Shop Now — ₹399
            <ChevronRight size={18} />
          </button>
        </div>
      </section>
    </div>
  );
}

export default Homepage;
