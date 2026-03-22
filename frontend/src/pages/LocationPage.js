import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function LocationPage() {
  const { state, city } = useParams();
  const [content, setContent] = useState(null);

  useEffect(() => {
    axios.get(`${API}/location/${state}/${city || ''}`)
      .then(res => setContent(res.data))
      .catch(err => console.log(err));
  }, [state, city]);

  const location = city || state;
  const title = `Anti-Aging Serum in ${location} | Celesta Glow`;

  return (
    <div style={{ background: 'white', minHeight: '100vh', padding: '60px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '40px', fontWeight: '700', marginBottom: '24px', color: '#212529' }}>{title}</h1>
        <p style={{ fontSize: '18px', color: '#495057', lineHeight: '1.8', marginBottom: '40px' }}>Discover the best anti-aging solutions tailored for {location}'s climate. Our Celesta Glow Anti-Aging Serum is trusted by thousands across India.</p>
        
        <div style={{ background: '#F8F9FA', padding: '40px', borderRadius: '12px', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '20px', color: '#212529' }}>Why Choose Celesta Glow in {location}?</h2>
          <ul style={{ fontSize: '16px', lineHeight: '1.8', color: '#495057' }}>
            <li>Clinically tested for Indian skin types</li>
            <li>Free delivery across {location}</li>
            <li>COD available</li>
            <li>Trusted by 10,000+ customers</li>
          </ul>
        </div>
        
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'linear-gradient(135deg, #0066CC 0%, #004C99 100%)', borderRadius: '12px', color: 'white' }}>
          <h3 style={{ fontSize: '32px', fontWeight: '600', marginBottom: '16px', color: 'white' }}>Start Your Anti-Aging Journey</h3>
          <p style={{ fontSize: '18px', marginBottom: '32px', opacity: 0.9 }}>Special offer for {location} customers</p>
          <button style={{ padding: '16px 48px', background: 'white', color: '#0066CC', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: '600', cursor: 'pointer' }}>Order Now - ₹399</button>
        </div>
      </div>
    </div>
  );
}

export default LocationPage;