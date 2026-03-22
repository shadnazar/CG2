import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      axios.get(`${API}/search?q=${encodeURIComponent(query)}`)
        .then(res => { setResults(res.data); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [query]);

  if (loading) return <div style={{ padding: '100px 20px', textAlign: 'center' }}>Searching...</div>;

  return (
    <div style={{ background: '#F8F9FA', minHeight: '100vh', padding: '60px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '12px', color: '#212529' }}>Search Results for "{query}"</h1>
        <p style={{ color: '#6C757D', marginBottom: '40px' }}>{results.length} results found</p>
        
        {results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontSize: '18px', color: '#495057' }}>Generating content for your search...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '24px' }}>
            {results.map(blog => (
              <Link key={blog._id} to={`/blog/${blog.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#212529', marginBottom: '12px' }}>{blog.title}</h3>
                  <p style={{ color: '#6C757D', fontSize: '14px' }}>{blog.content.substring(0, 150)}...</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchResults;