import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, ShoppingCart } from 'lucide-react';

function Navigation() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <nav style={{ background: 'white', borderBottom: '1px solid #E9ECEF', position: 'sticky', top: 0, zIndex: 1000 }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ fontSize: '24px', fontWeight: '700', color: '#0066CC', textDecoration: 'none' }}>
            Celesta Glow
          </Link>

          <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: '500px', margin: '0 40px', display: 'flex' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search skincare tips, routines..."
                style={{ width: '100%', padding: '10px 40px 10px 16px', border: '1px solid #DEE2E6', borderRadius: '8px', fontSize: '14px' }}
              />
              <button type="submit" style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
                <Search size={20} color="#6C757D" />
              </button>
            </div>
          </form>

          <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
            <Link to="/" style={{ color: '#495057', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Home</Link>
            <Link to="/product/anti-aging-serum" style={{ color: '#495057', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Products</Link>
            <Link to="/blog" style={{ color: '#495057', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Blog</Link>
            <button style={{ background: '#0066CC', color: 'white', padding: '8px 20px', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Buy Now</button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;