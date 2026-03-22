import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function BlogPost() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/blogs/${slug}`)
      .then(res => { setBlog(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) return <div style={{ padding: '100px 20px', textAlign: 'center' }}>Loading...</div>;
  if (!blog) return <div style={{ padding: '100px 20px', textAlign: 'center' }}>Blog not found</div>;

  return (
    <div style={{ background: 'white', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 20px' }}>
        <Link to="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#0066CC', textDecoration: 'none', marginBottom: '32px' }}>
          <ArrowLeft size={20} /> Back to Blog
        </Link>
        
        <h1 style={{ fontSize: '40px', fontWeight: '700', lineHeight: '1.2', marginBottom: '24px', color: '#212529' }}>{blog.title}</h1>
        
        <div style={{ borderLeft: '4px solid #0066CC', paddingLeft: '24px', marginBottom: '40px', background: '#F8F9FA', padding: '24px', borderRadius: '8px' }}>
          <p style={{ fontSize: '16px', color: '#495057' }}>Looking for effective anti-aging solutions? Try our <Link to="/product/anti-aging-serum" style={{ color: '#0066CC', fontWeight: '600' }}>Celesta Glow Anti-Aging Serum</Link> - clinically proven formula.</p>
        </div>
        
        <div style={{ fontSize: '16px', lineHeight: '1.8', color: '#212529' }} dangerouslySetInnerHTML={{ __html: blog.content.replace(/\n/g, '<br/>') }} />
        
        <div style={{ marginTop: '60px', padding: '40px', background: '#E3F2FD', borderRadius: '12px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#212529' }}>Ready to Transform Your Skin?</h3>
          <p style={{ fontSize: '16px', color: '#495057', marginBottom: '24px' }}>Get started with Celesta Glow Anti-Aging Serum</p>
          <Link to="/product/anti-aging-serum" style={{ display: 'inline-block', padding: '14px 40px', background: '#0066CC', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>Shop Now - ₹399</Link>
        </div>
      </div>
    </div>
  );
}

export default BlogPost;