import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Search, ChevronRight } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      setLoading(true);
      axios.get(`${API}/search?q=${encodeURIComponent(query)}`)
        .then(res => { setResults(res.data); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [query]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#5f7350] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-6 py-10 pb-28 bg-[#fdfcfa] min-h-screen">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-full bg-[#f6f7f4] flex items-center justify-center">
          <Search size={20} className="text-[#5f7350]" />
        </div>
        <div>
          <h1 className="text-premium-heading text-xl font-semibold" data-testid="search-results-title">
            "{query}"
          </h1>
          <p className="text-[#96a883] text-sm">{results.length} result{results.length !== 1 ? 's' : ''} found</p>
        </div>
      </div>
      
      {results.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[#4a5a3f] mb-4">No articles found for your search.</p>
          <Link to="/blog" className="text-[#5f7350] font-medium">Browse all articles →</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((blog, i) => (
            <Link 
              key={blog.id || blog.slug} 
              to={`/blog/${blog.slug}`}
              className="block"
              data-testid={`search-result-${i}`}
            >
              <article className="card-premium p-5 transition-all hover:shadow-lg">
                <h2 className="text-premium-heading text-lg font-semibold mb-2">
                  {blog.title}
                </h2>
                <p className="text-premium-body text-sm line-clamp-2 mb-3">
                  {blog.content.substring(0, 150)}...
                </p>
                <div className="flex items-center gap-1 text-[#5f7350] text-sm font-medium">
                  Read More <ChevronRight size={16} />
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchResults;
