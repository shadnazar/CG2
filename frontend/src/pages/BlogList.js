import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Clock, Eye, ChevronRight, Search, TrendingUp, Sparkles,
  Star, Filter, ArrowRight, MapPin, Globe
} from 'lucide-react';
import { trackSearch, trackCTAClick } from '../utils/metaPixel';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Category colors and icons
const CATEGORY_STYLES = {
  news: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'News' },
  celebrity: { bg: 'bg-pink-100', text: 'text-pink-700', label: 'Celebrity' },
  tips: { bg: 'bg-green-100', text: 'text-green-700', label: 'Tips' },
  mistakes: { bg: 'bg-red-100', text: 'text-red-700', label: 'Mistakes' },
  trends: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Trends' },
  ingredients: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Ingredients' },
  seasonal: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Seasonal' },
  diy: { bg: 'bg-teal-100', text: 'text-teal-700', label: 'DIY' },
  science: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Science' },
  default: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Beauty' }
};

// Indian cities for location targeting
const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 
  'Ahmedabad', 'Jaipur', 'Lucknow', 'Chandigarh', 'Kochi', 'Indore', 'Bhopal',
  'Noida', 'Gurgaon', 'Thane', 'Navi Mumbai', 'Ghaziabad', 'Faridabad'
];

function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [featuredBlog, setFeaturedBlog] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [localBlogs, setLocalBlogs] = useState([]);

  useEffect(() => {
    fetchBlogs();
    detectUserLocation();
    
    // Track page view
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    axios.post(`${API}/track-visit?page=blog&session_id=${sessionId}`).catch(() => {});
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await axios.get(`${API}/blogs`);
      const publishedBlogs = res.data.filter(b => b.status === 'published');
      
      // Set featured blog (most recent or most viewed)
      if (publishedBlogs.length > 0) {
        const featured = publishedBlogs.reduce((prev, current) => 
          (current.view_count || 0) > (prev.view_count || 0) ? current : prev
        );
        setFeaturedBlog(featured);
      }
      
      setBlogs(publishedBlogs);
    } catch (err) {
      console.error('Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  // Detect user location
  const detectUserLocation = async () => {
    // Try to get rough location from timezone/IP
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Default to a random Indian city for demo
    const randomCity = INDIAN_CITIES[Math.floor(Math.random() * INDIAN_CITIES.length)];
    setUserLocation(randomCity);
  };

  // Filter blogs by location
  useEffect(() => {
    if (userLocation && blogs.length > 0) {
      const locationBlogs = blogs.filter(blog => {
        const title = (blog.title || '').toLowerCase();
        const content = (blog.content || '').toLowerCase();
        const location = (blog.target_location || '').toLowerCase();
        const userLoc = userLocation.toLowerCase();
        
        return title.includes(userLoc) || content.includes(userLoc) || location.includes(userLoc);
      });
      setLocalBlogs(locationBlogs);
    }
  }, [userLocation, blogs]);

  const filteredBlogs = blogs.filter(blog => {
    // Search in title, meta_description, content, keywords, category, and tags
    const searchLower = searchQuery.toLowerCase().trim();
    const matchesSearch = !searchLower || 
      (blog.title || '').toLowerCase().includes(searchLower) ||
      (blog.meta_description || '').toLowerCase().includes(searchLower) ||
      (blog.content || '').toLowerCase().includes(searchLower) ||
      (blog.keywords || '').toLowerCase().includes(searchLower) ||
      (blog.category || '').toLowerCase().includes(searchLower) ||
      (blog.location_target || '').toLowerCase().includes(searchLower) ||
      (blog.tags || []).some(tag => tag.toLowerCase().includes(searchLower));
    
    const matchesCategory = selectedCategory === 'all' || 
      (blog.category || '').toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(blogs.map(b => b.category).filter(Boolean))];

  const getCategoryStyle = (category) => CATEGORY_STYLES[category] || CATEGORY_STYLES.default;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12 lg:py-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm mb-4">
              <Sparkles size={16} />
              <span>Your Daily Dose of Beauty</span>
            </div>
            <h1 className="text-3xl lg:text-5xl font-bold mb-4">
              Beauty & Skincare News
            </h1>
            <p className="text-green-100 text-lg max-w-2xl mx-auto mb-8">
              Latest trends, celebrity secrets, expert tips, and science-backed skincare advice for radiant Indian skin
            </p>
            
            {/* Search Bar */}
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  // Track search when user types more than 2 characters
                  if (e.target.value.length > 2) {
                    trackSearch(e.target.value);
                  }
                }}
                placeholder="Search beauty tips, trends, celebrity secrets..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl text-gray-900 placeholder-gray-500 focus:ring-4 focus:ring-green-300 outline-none"
                data-testid="blog-search"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-2 py-4 overflow-x-auto no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat === 'all' ? 'All Topics' : getCategoryStyle(cat).label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Location-Based Section */}
        {userLocation && localBlogs.length > 0 && selectedCategory === 'all' && !searchQuery && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="text-blue-500" size={20} />
              <span className="font-semibold text-gray-900">Trending in {userLocation}</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">For You</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {localBlogs.slice(0, 2).map((blog) => (
                <Link
                  key={blog.id || blog.slug}
                  to={`/blog/${blog.slug}`}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 hover:shadow-lg transition-all group border border-blue-100"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Globe size={14} className="text-blue-500" />
                    <span className="text-xs text-blue-600 font-medium">{userLocation} Special</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {blog.title}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                    {blog.meta_description}
                  </p>
                  <span className="text-blue-500 text-sm font-medium">Read Now →</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Featured Article */}
        {featuredBlog && selectedCategory === 'all' && !searchQuery && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="text-green-500" size={20} />
              <span className="font-semibold text-gray-900">Featured Article</span>
            </div>
            <Link 
              to={`/blog/${featuredBlog.slug}`}
              className="block bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow group"
              data-testid="featured-blog"
            >
              <div className="lg:flex">
                <div className="lg:w-1/2 h-64 lg:h-80 bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center relative overflow-hidden">
                  {featuredBlog.image_url ? (
                    <img 
                      src={featuredBlog.image_url} 
                      alt={featuredBlog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        e.target.parentElement.querySelector('.fallback-icon')?.classList.remove('hidden');
                      }}
                    />
                  ) : (
                    <Sparkles className="w-24 h-24 text-white/30" />
                  )}
                  <Sparkles className="fallback-icon hidden w-24 h-24 text-white/30 absolute" />
                </div>
                <div className="lg:w-1/2 p-6 lg:p-8">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryStyle(featuredBlog.category).bg} ${getCategoryStyle(featuredBlog.category).text}`}>
                      {getCategoryStyle(featuredBlog.category).label}
                    </span>
                    <span className="text-gray-400 text-sm">{formatDate(featuredBlog.published_at || featuredBlog.created_at)}</span>
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">
                    {featuredBlog.title}
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {featuredBlog.meta_description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {featuredBlog.read_time || '5 min read'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye size={14} />
                        {featuredBlog.view_count || 0} views
                      </span>
                    </div>
                    <span className="text-green-500 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read More <ArrowRight size={16} />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Blog Grid */}
        {filteredBlogs.length === 0 ? (
          <div className="text-center py-16">
            <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-500">Try adjusting your search or browse all topics</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs
              .filter(b => featuredBlog ? b.id !== featuredBlog.id : true)
              .map((blog) => (
                <Link
                  key={blog.id || blog.slug}
                  to={`/blog/${blog.slug}`}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group"
                  data-testid={`blog-card-${blog.slug}`}
                >
                  {/* Card Image */}
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
                    {blog.image_url ? (
                      <img 
                        src={blog.image_url} 
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          e.target.parentElement.querySelector('.fallback-icon')?.classList.remove('hidden');
                        }}
                      />
                    ) : (
                      <Sparkles className="w-12 h-12 text-gray-300" />
                    )}
                    <Sparkles className="fallback-icon hidden w-12 h-12 text-gray-300 absolute" />
                    <div className="absolute top-3 left-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryStyle(blog.category).bg} ${getCategoryStyle(blog.category).text}`}>
                        {getCategoryStyle(blog.category).label}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                      {blog.title}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                      {blog.meta_description}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3 text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {blog.read_time || '5 min'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye size={12} />
                          {blog.view_count || 0}
                        </span>
                      </div>
                      <span className="text-green-500 font-medium">
                        Read →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-8 lg:p-12 text-center text-white">
          <h2 className="text-2xl lg:text-3xl font-bold mb-4">
            Ready to Transform Your Skin?
          </h2>
          <p className="text-green-100 mb-6 max-w-xl mx-auto">
            Try Celesta Glow Advanced Anti-Aging Serum with Retinol, Niacinamide, Vitamin E & Hyaluronic Acid
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/product/anti-aging-serum"
              className="inline-flex items-center gap-2 bg-white text-green-600 px-8 py-4 rounded-full font-bold hover:bg-green-50 transition-colors"
              data-testid="blog-cta"
              onClick={() => trackCTAClick('shop_now_blog', 'blog_page_cta')}
            >
              Shop Now — ₹599 <ChevronRight size={20} />
            </Link>
            <div className="flex items-center gap-1 text-green-200">
              <Star size={16} fill="currentColor" />
              <span className="text-sm">4.8 rating from 2,340+ reviews</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

export default BlogList;
