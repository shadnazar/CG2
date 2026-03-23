import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Truck, Shield, ChevronRight, Leaf } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Premium lifestyle image
const LIFESTYLE_IMAGE = 'https://static.prod-images.emergentagent.com/jobs/fc697aed-c4ed-4c4b-8eec-b51bdf774715/images/6a465034e43062f476193afe6aee476c21a704998eefa78c8353d03d44be2c37.png';

function LocationPage() {
  const { state, city } = useParams();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = city ? `${API}/location/${state}/${city}` : `${API}/location/${state}`;
    axios.get(url)
      .then(res => { setContent(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [state, city]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#5f7350] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const location = city ? `${city}, ${state}` : state;
  const locationTitle = location.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

  return (
    <div className="pb-28 bg-white">
      {/* Hero */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={LIFESTYLE_IMAGE}
          alt="Premium skincare"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a2e1a]/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-2 text-[#c9a962] text-xs font-medium mb-2">
            <MapPin size={14} />
            <span data-testid="location-tag">{locationTitle}</span>
          </div>
          <h1 className="text-white text-2xl font-semibold" data-testid="location-title">
            Premium Skincare in {locationTitle}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-10">
        <p className="text-premium-body text-base mb-8">
          Discover premium anti-aging solutions tailored for {locationTitle}'s unique climate. Celesta Glow is trusted by thousands of customers in your area for visibly younger, radiant skin.
        </p>

        {/* Benefits */}
        <div className="space-y-3 mb-10">
          {[
            { icon: Shield, text: 'Clinically tested for Indian skin types' },
            { icon: Truck, text: `Free delivery across ${locationTitle}` },
            { icon: Leaf, text: 'Premium organic ingredients' },
          ].map((item, i) => (
            <div 
              key={i} 
              className="flex items-center gap-4 p-4 card-premium"
              data-testid={`location-benefit-${i}`}
            >
              <div className="w-10 h-10 rounded-full bg-[#f6f7f4] flex items-center justify-center flex-shrink-0">
                <item.icon size={18} className="text-[#5f7350]" />
              </div>
              <span className="text-[#4a5a3f] text-sm font-medium">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mx-6 p-8 bg-gradient-to-br from-[#5f7350] to-[#3d4935] rounded-3xl text-center">
        <p className="text-[#c9a962] text-xs tracking-wider uppercase mb-3">Exclusive Offer</p>
        <h3 className="text-white text-xl font-semibold mb-2">
          Start Your Anti-Aging Journey
        </h3>
        <p className="text-white/70 text-sm mb-6">
          Special offer for {locationTitle} customers
        </p>
        <Link 
          to="/product/anti-aging-serum"
          className="inline-flex items-center gap-2 bg-white text-[#5f7350] font-semibold py-3 px-8 rounded-full transition-transform hover:scale-105"
          data-testid="location-cta"
        >
          Order Now — ₹399 <ChevronRight size={18} />
        </Link>
      </div>
    </div>
  );
}

export default LocationPage;
