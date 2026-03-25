import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Search, ShoppingBag } from 'lucide-react';

function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/product/anti-aging-serum', label: 'Shop' },
    { path: '/blog', label: 'Beauty Tips' },
  ];

  return (
    <>
      {/* Main Header - Centered Logo */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Menu Button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 -ml-2 w-10"
            data-testid="menu-button"
            aria-label="Open menu"
          >
            <Menu size={24} className="text-gray-900" />
          </button>

          {/* Centered Logo */}
          <Link 
            to="/" 
            className="absolute left-1/2 transform -translate-x-1/2 text-center"
            data-testid="logo-link"
          >
            <span className="font-heading text-xl font-bold tracking-[0.15em] text-gray-900">CELESTA</span>
            <span className="block text-[10px] tracking-[0.4em] text-gray-500 -mt-0.5">G L O W</span>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-0">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2"
              data-testid="search-button"
              aria-label="Search"
            >
              <Search size={22} className="text-gray-900" />
            </button>
            <Link
              to="/product/anti-aging-serum"
              className="p-2"
              data-testid="cart-button"
              aria-label="Shop"
            >
              <ShoppingBag size={22} className="text-gray-900" />
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/30" onClick={() => setIsMenuOpen(false)}>
          <div 
            className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="text-center">
                <span className="font-heading text-lg font-bold tracking-[0.15em] text-gray-900">CELESTA</span>
                <span className="block text-[9px] tracking-[0.4em] text-gray-500 -mt-0.5">G L O W</span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 -mr-2"
                data-testid="close-menu-button"
              >
                <X size={24} className="text-gray-900" />
              </button>
            </div>
            
            <nav className="p-5">
              <ul className="space-y-1">
                {navLinks.map(link => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`block py-4 px-4 rounded-xl text-base font-medium transition-all ${
                        location.pathname === link.path
                          ? 'bg-green-50 text-green-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      data-testid={`nav-link-${link.label.toLowerCase().replace(' ', '-')}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            <button
              onClick={() => setIsSearchOpen(false)}
              className="p-2 -ml-2"
              data-testid="close-search-button"
            >
              <X size={24} className="text-gray-900" />
            </button>
            <form onSubmit={handleSearch} className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search skincare tips..."
                className="w-full h-12 px-4 bg-gray-50 rounded-full text-base outline-none focus:ring-2 focus:ring-green-200"
                autoFocus
                data-testid="search-input"
              />
            </form>
          </div>
          <div className="p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">Popular Searches</p>
            <div className="flex flex-wrap gap-2">
              {['anti-aging', 'retinol', 'wrinkles', 'fine lines'].map(term => (
                <button
                  key={term}
                  onClick={() => {
                    navigate(`/search?q=${term}`);
                    setIsSearchOpen(false);
                  }}
                  className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                  data-testid={`search-suggestion-${term}`}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navigation;
