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
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-5 py-8 pb-24">
      <h1 className="text-2xl font-bold text-gray-900 mb-2" data-testid="blog-title">
        Beauty Tips
      </h1>
      <p className="text-gray-500 text-sm mb-8">Expert skincare advice and tips</p>
      
      {blogs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No articles yet. Check back soon!</p>
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
              <article className="card-cg hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-3">
                  <Clock size={14} />
                  <span>{new Date(blog.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span>•</span>
                  <span>5 min read</span>
                </div>
                <h2 className="font-bold text-lg text-gray-900 mb-2 leading-tight">
                  {blog.title}
                </h2>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                  {blog.meta_description || blog.content.substring(0, 120)}...
                </p>
                <div className="flex items-center gap-1 text-green-500 text-sm font-medium">
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
