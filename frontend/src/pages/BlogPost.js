import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Clock, ChevronRight } from 'lucide-react';

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#5f7350] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="px-6 py-16 text-center">
        <h1 className="text-premium-heading text-xl font-semibold mb-4">Article Not Found</h1>
        <Link to="/blog" className="text-[#5f7350] font-medium">← Back to Journal</Link>
      </div>
    );
  }

  return (
    <div className="pb-28 bg-white">
      {/* Header */}
      <div className="px-6 py-8 border-b border-[#f3efe6] bg-[#fdfcfa]">
        <Link 
          to="/blog" 
          className="inline-flex items-center gap-2 text-[#96a883] text-sm mb-6"
          data-testid="back-to-blog"
        >
          <ArrowLeft size={16} /> Back to Journal
        </Link>
        
        <div className="flex items-center gap-2 text-[#96a883] text-xs mb-4">
          <Clock size={14} />
          <span>{new Date(blog.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          <span>•</span>
          <span>5 min read</span>
        </div>
        
        <h1 className="text-premium-heading text-2xl font-semibold leading-tight" data-testid="blog-post-title">
          {blog.title}
        </h1>
      </div>

      {/* Product CTA */}
      <div className="mx-6 mt-8 p-5 bg-gradient-to-r from-[#f6f7f4] to-[#e8ebe3] border border-[#d4daca] rounded-2xl">
        <p className="text-sm text-[#4a5a3f]">
          Looking for effective anti-aging solutions? Try our{' '}
          <Link to="/product/anti-aging-serum" className="text-[#5f7350] font-semibold">
            Celesta Glow Serum
          </Link>
          {' '}— clinically proven formula.
        </p>
      </div>

      {/* Content */}
      <div className="px-6 py-10">
        <div data-testid="blog-content">
          {blog.content.split('\n').map((paragraph, i) => (
            paragraph.trim() && (
              <p key={i} className="text-premium-body text-base mb-5 leading-relaxed">
                {paragraph}
              </p>
            )
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mx-6 p-8 bg-gradient-to-br from-[#3d4935] to-[#1a2e1a] rounded-3xl text-center">
        <p className="text-[#c9a962] text-xs tracking-wider uppercase mb-3">Discover</p>
        <h3 className="text-white text-xl font-semibold mb-3">Ready to Transform Your Skin?</h3>
        <p className="text-white/70 text-sm mb-6">Join 10,000+ happy customers</p>
        <Link 
          to="/product/anti-aging-serum"
          className="inline-flex items-center gap-2 bg-[#c9a962] text-white font-medium py-3 px-8 rounded-full transition-transform hover:scale-105"
          data-testid="blog-cta"
        >
          Shop Now — ₹399 <ChevronRight size={18} />
        </Link>
      </div>
    </div>
  );
}

export default BlogPost;
