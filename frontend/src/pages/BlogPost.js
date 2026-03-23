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
        <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="px-6 py-12 text-center">
        <h1 className="font-heading text-xl font-bold text-slate-900 mb-4">Article Not Found</h1>
        <Link to="/blog" className="text-sky-600 font-medium">← Back to Journal</Link>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="px-6 py-6 border-b border-slate-100">
        <Link 
          to="/blog" 
          className="inline-flex items-center gap-2 text-slate-500 text-sm mb-4"
          data-testid="back-to-blog"
        >
          <ArrowLeft size={16} /> Back to Journal
        </Link>
        
        <div className="flex items-center gap-2 text-slate-400 text-xs mb-3">
          <Clock size={14} />
          <span>{new Date(blog.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          <span>•</span>
          <span>5 min read</span>
        </div>
        
        <h1 className="font-heading text-2xl font-bold text-slate-900 leading-tight" data-testid="blog-post-title">
          {blog.title}
        </h1>
      </div>

      {/* Product CTA */}
      <div className="mx-6 mt-6 p-4 bg-sky-50 border border-sky-100 rounded-xl">
        <p className="text-sm text-slate-700">
          Looking for effective anti-aging solutions? Try our{' '}
          <Link to="/product/anti-aging-serum" className="text-sky-600 font-semibold">
            Celesta Glow Serum
          </Link>
          {' '}— clinically proven formula.
        </p>
      </div>

      {/* Content */}
      <div className="px-6 py-8">
        <div 
          className="prose prose-slate prose-sm max-w-none"
          style={{ lineHeight: '1.8' }}
          data-testid="blog-content"
        >
          {blog.content.split('\n').map((paragraph, i) => (
            paragraph.trim() && <p key={i} className="mb-4 text-slate-600">{paragraph}</p>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mx-6 p-6 bg-slate-900 rounded-2xl text-center">
        <h3 className="font-heading font-semibold text-white mb-2">Ready to Transform Your Skin?</h3>
        <p className="text-slate-400 text-sm mb-4">Join 10,000+ happy customers</p>
        <Link 
          to="/product/anti-aging-serum"
          className="inline-flex items-center gap-2 bg-sky-500 text-white font-semibold py-3 px-6 rounded-full btn-active"
          data-testid="blog-cta"
        >
          Shop Now — ₹399 <ChevronRight size={18} />
        </Link>
      </div>
    </div>
  );
}

export default BlogPost;
