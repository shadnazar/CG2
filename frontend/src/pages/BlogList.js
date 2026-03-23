import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Clock, ChevronRight } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/blogs`)
      .then(res => { setBlogs(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-6 py-8 pb-24">
      <h1 className="font-heading text-2xl font-bold text-slate-900 mb-2" data-testid="blog-title">
        Skincare Journal
      </h1>
      <p className="text-slate-500 text-sm mb-8">Expert tips for healthy, youthful skin</p>
      
      {blogs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500">No articles yet. Check back soon!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {blogs.map((blog, i) => (
            <Link 
              key={blog.id || blog.slug} 
              to={`/blog/${blog.slug}`} 
              className="block"
              data-testid={`blog-card-${i}`}
            >
              <article className="bg-white border border-slate-100 rounded-2xl p-5 transition-all hover:shadow-md">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-3">
                  <Clock size={14} />
                  <span>{new Date(blog.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span>•</span>
                  <span>5 min read</span>
                </div>
                <h2 className="font-heading font-semibold text-lg text-slate-900 mb-2 leading-tight">
                  {blog.title}
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-4">
                  {blog.meta_description || blog.content.substring(0, 120)}...
                </p>
                <div className="flex items-center gap-1 text-sky-600 text-sm font-medium">
                  Read Article <ChevronRight size={16} />
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default BlogList;
