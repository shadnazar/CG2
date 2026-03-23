import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Truck, Shield, ChevronRight } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

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
        <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const location = city ? `${city}, ${state}` : state;
  const locationTitle = location.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

  return (
    <div className="pb-24">
      {/* Hero */}
      <div className="px-6 py-10 bg-gradient-to-b from-sky-50 to-white">
        <div className="flex items-center gap-2 text-sky-600 text-sm font-medium mb-3">
          <MapPin size={16} />
          <span data-testid="location-tag">{locationTitle}</span>
        </div>
        <h1 className="font-heading text-2xl font-bold text-slate-900 mb-4" data-testid="location-title">
          Anti-Aging Skincare in {locationTitle}
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          Discover premium anti-aging solutions tailored for {locationTitle}'s climate. Celesta Glow is trusted by thousands of customers in your area.
        </p>
      </div>

      {/* Benefits */}
      <div className="px-6 py-8">
        <h2 className="font-heading font-semibold text-lg text-slate-900 mb-4">
          Why Choose Celesta Glow in {locationTitle}?
        </h2>
        <div className="space-y-3">
          {[
            { icon: Shield, text: 'Clinically tested for Indian skin types' },
            { icon: Truck, text: `Free delivery across ${locationTitle}` },
            { icon: MapPin, text: 'Cash on Delivery available' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl" data-testid={`location-benefit-${i}`}>
              <item.icon size={20} className="text-sky-500 flex-shrink-0" />
              <span className="text-slate-700 text-sm">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mx-6 p-6 bg-sky-500 rounded-2xl text-center">
        <h3 className="font-heading font-semibold text-white text-lg mb-2">
          Start Your Anti-Aging Journey
        </h3>
        <p className="text-sky-100 text-sm mb-4">
          Special offer for {locationTitle} customers
        </p>
        <Link 
          to="/product/anti-aging-serum"
          className="inline-flex items-center gap-2 bg-white text-sky-600 font-semibold py-3 px-6 rounded-full btn-active"
          data-testid="location-cta"
        >
          Order Now — ₹399 <ChevronRight size={18} />
        </Link>
      </div>
    </div>
  );
}

export default LocationPage;
