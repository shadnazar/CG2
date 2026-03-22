import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, ArrowRight } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/blogs`)
      .then(res => { setBlogs(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '100px 20px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ background: '#F8F9FA', minHeight: '100vh', padding: '60px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '40px', fontWeight: '700', marginBottom: '16px', color: '#212529' }}>Skincare Blog</h1>
        <p style={{ fontSize: '18px', color: '#495057', marginBottom: '48px' }}>Expert tips and guides for anti-aging skincare</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
          {blogs.map(blog => (
            <Link key={blog._id} to={`/blog/${blog.slug}`} style={{ textDecoration: 'none' }}>
              <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', transition: 'transform 0.2s' }}>
                <div style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#6C757D', fontSize: '14px' }}>
                    <Calendar size={16} />
                    <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#212529', marginBottom: '12px' }}>{blog.title}</h3>
                  <p style={{ color: '#6C757D', fontSize: '14px', lineHeight: '1.6' }}>{blog.metaDescription || blog.content.substring(0, 120)}...</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', color: '#0066CC', fontWeight: '600', fontSize: '14px' }}>
                    Read More <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BlogList;