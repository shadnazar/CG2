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
        <div className="w-8 h-8 border-2 border-[#5f7350] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-6 py-10 pb-28 bg-[#fdfcfa] min-h-screen">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-[1px] bg-[#c9a962]" />
          <p className="text-xs tracking-[0.2em] uppercase text-[#5f7350]">Our Journal</p>
        </div>
        <h1 className="text-premium-heading text-2xl font-semibold" data-testid="blog-title">
          Skincare Insights
        </h1>
        <p className="text-premium-body text-sm mt-2">Expert tips for radiant, youthful skin</p>
      </div>
      
      {blogs.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[#96a883]">No articles yet. Check back soon!</p>
        </div>
      ) : (
        <div className="space-y-5">
          {blogs.map((blog, i) => (
            <Link 
              key={blog.id || blog.slug} 
              to={`/blog/${blog.slug}`} 
              className="block"
              data-testid={`blog-card-${i}`}
            >
              <article className="card-premium p-6 transition-all hover:shadow-lg">
                <div className="flex items-center gap-2 text-[#96a883] text-xs mb-4">
                  <Clock size={14} />
                  <span>{new Date(blog.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span>•</span>
                  <span>5 min read</span>
                </div>
                <h2 className="text-premium-heading text-lg font-semibold mb-3 leading-tight">
                  {blog.title}
                </h2>
                <p className="text-premium-body text-sm line-clamp-2 mb-4">
                  {blog.meta_description || blog.content.substring(0, 120)}...
                </p>
                <div className="flex items-center gap-1 text-[#5f7350] text-sm font-medium">
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
