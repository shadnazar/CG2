import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, Truck, Star, CheckCircle2, ArrowRight } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Homepage() {
  const navigate = useNavigate();
  const [recentOrders, setRecentOrders] = useState(30);

  useEffect(() => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    axios.post(`${API}/track?page=homepage&session_id=${sessionId}`).catch(err => console.log(err));
    
    if (window.fbq) {
      window.fbq('track', 'ViewContent', {
        content_name: 'Homepage',
        content_category: 'Homepage'
      });
    }

    const fetchRecentOrders = async () => {
      try {
        const response = await axios.get(`${API}/stats/recent-orders`);
        setRecentOrders(response.data.count);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };
    fetchRecentOrders();
  }, []);

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section" style={{ background: 'linear-gradient(135deg, #F8F9FA 0%, #E3F2FD 100%)', padding: '80px 20px' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '60px', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-block', padding: '6px 16px', background: '#E3F2FD', borderRadius: '50px', fontSize: '14px', color: '#0066CC', fontWeight: '600', marginBottom: '20px' }}>
                Dermatologist-Inspired Formula
              </div>
              <h1 style={{ fontSize: '48px', fontWeight: '700', lineHeight: '1.2', marginBottom: '20px', color: '#212529' }}>
                Reduce Wrinkles & Look Younger Naturally
              </h1>
              <p style={{ fontSize: '18px', color: '#495057', marginBottom: '32px', lineHeight: '1.6' }}>
                Clinically-tested anti-aging serum with proven ingredients. Trusted by thousands across India.
              </p>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                <button
                  onClick={() => navigate('/product/anti-aging-serum')}
                  style={{ padding: '16px 40px', background: '#0066CC', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,102,204,0.2)' }}
                  data-testid="shop-now-button"
                >
                  Shop Now - ₹399
                </button>
                <button
                  onClick={() => navigate('/blog')}
                  style={{ padding: '16px 40px', background: 'white', color: '#0066CC', border: '2px solid #0066CC', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Learn More
                </button>
              </div>
              <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Star size={20} fill="#FFC107" color="#FFC107" />
                  <span style={{ fontSize: '14px', color: '#495057' }}><strong>4.8/5</strong> Rating</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={20} color="#28A745" />
                  <span style={{ fontSize: '14px', color: '#495057' }}><strong>{recentOrders}+</strong> Orders</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Truck size={20} color="#28A745" />
                  <span style={{ fontSize: '14px', color: '#495057' }}><strong>Free</strong> Shipping</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
                <img
                  src="https://customer-assets.emergentagent.com/job_3e020a22-98fc-4fee-b377-5bacdddf46ce/artifacts/ig243hne_IMG_9115.png"
                  alt="Celesta Glow Anti-Aging Serum"
                  style={{ width: '100%', maxWidth: '400px', height: 'auto' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section style={{ background: 'white', padding: '24px 20px', borderBottom: '1px solid #E9ECEF' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '24px' }}>
            <div style={{ textAlign: 'center' }}>
              <ShieldCheck size={32} color="#0066CC" style={{ marginBottom: '8px' }} />
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#212529' }}>Dermatologist Tested</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <CheckCircle2 size={32} color="#28A745" style={{ marginBottom: '8px' }} />
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#212529' }}>Clinically Proven</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Truck size={32} color="#0066CC" style={{ marginBottom: '8px' }} />
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#212529' }}>Free Delivery</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Star size={32} fill="#FFC107" color="#FFC107" style={{ marginBottom: '8px' }} />
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#212529' }}>10,000+ Happy Users</p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Highlight */}
      <section style={{ padding: '80px 20px', background: '#F8F9FA' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px', color: '#212529' }}>Our Signature Product</h2>
          <p style={{ fontSize: '18px', color: '#495057', marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px' }}>Celesta Glow Anti-Aging Face Serum - Reduce wrinkles, boost collagen, and restore youthful glow</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', marginBottom: '40px' }}>
            <div style={{ background: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>✨</div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px', color: '#212529' }}>Reduces Wrinkles</h3>
              <p style={{ fontSize: '14px', color: '#6C757D' }}>Visible reduction in fine lines and wrinkles within 4-6 weeks</p>
            </div>
            <div style={{ background: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>💧</div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px', color: '#212529' }}>Deep Hydration</h3>
              <p style={{ fontSize: '14px', color: '#6C757D' }}>Hyaluronic acid provides lasting moisture and plumpness</p>
            </div>
            <div style={{ background: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>🌟</div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px', color: '#212529' }}>Boosts Collagen</h3>
              <p style={{ fontSize: '14px', color: '#6C757D' }}>Retinol stimulates collagen production for firmer skin</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/product/anti-aging-serum')}
            style={{ padding: '16px 48px', background: '#0066CC', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            Shop Anti-Aging Serum
            <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Social Proof */}
      <section style={{ padding: '80px 20px' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '48px', textAlign: 'center', color: '#212529' }}>Trusted by Thousands</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '32px' }}>
            <div style={{ background: '#F8F9FA', padding: '32px', borderRadius: '12px', border: '1px solid #E9ECEF' }}>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#FFC107" color="#FFC107" />)}
              </div>
              <p style={{ fontSize: '16px', color: '#495057', marginBottom: '16px', lineHeight: '1.6' }}>"Visible results in just 3 weeks! My skin looks brighter and fine lines are fading. Best serum I've used."</p>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#212529' }}>- Priya S., Mumbai</p>
            </div>
            <div style={{ background: '#F8F9FA', padding: '32px', borderRadius: '12px', border: '1px solid #E9ECEF' }}>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#FFC107" color="#FFC107" />)}
              </div>
              <p style={{ fontSize: '16px', color: '#495057', marginBottom: '16px', lineHeight: '1.6' }}>"My skin feels so much smoother and hydrated. The dark spots are lighter too. Highly recommend!"</p>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#212529' }}>- Anjali M., Bangalore</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ background: 'linear-gradient(135deg, #0066CC 0%, #004C99 100%)', padding: '80px 20px', color: 'white', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '40px', fontWeight: '700', marginBottom: '16px', color: 'white' }}>Start Your Anti-Aging Journey Today</h2>
          <p style={{ fontSize: '18px', marginBottom: '32px', opacity: '0.9' }}>Join thousands of satisfied customers. Special offer: ₹399 only</p>
          <button
            onClick={() => navigate('/product/anti-aging-serum')}
            style={{ padding: '16px 48px', background: 'white', color: '#0066CC', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: '600', cursor: 'pointer' }}
          >
            Shop Now - Limited Time Offer
          </button>
        </div>
      </section>
    </div>
  );
}

export default Homepage;