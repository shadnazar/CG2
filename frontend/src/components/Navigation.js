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
    { path: '/blog', label: 'Journal' },
  ];

  return (
    <>
      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-100">
        <div className="flex items-center justify-between px-5 h-14">
          {/* Menu Button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 -ml-2 btn-active"
            data-testid="menu-button"
            aria-label="Open menu"
          >
            <Menu size={22} className="text-slate-700" />
          </button>

          {/* Logo */}
          <Link 
            to="/" 
            className="font-heading font-semibold text-lg text-sky-600"
            data-testid="logo-link"
          >
            Celesta Glow
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 btn-active"
              data-testid="search-button"
              aria-label="Search"
            >
              <Search size={20} className="text-slate-700" />
            </button>
            <Link
              to="/product/anti-aging-serum"
              className="p-2 btn-active"
              data-testid="cart-button"
              aria-label="Shop"
            >
              <ShoppingBag size={20} className="text-slate-700" />
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/20" onClick={() => setIsMenuOpen(false)}>
          <div 
            className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl animate-fade-in-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <span className="font-heading font-semibold text-lg text-sky-600">Menu</span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 -mr-2 btn-active"
                data-testid="close-menu-button"
              >
                <X size={22} className="text-slate-700" />
              </button>
            </div>
            <nav className="p-5">
              <ul className="space-y-1">
                {navLinks.map(link => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`block py-3 px-4 rounded-xl text-base font-medium transition-colors ${
                        location.pathname === link.path
                          ? 'bg-sky-50 text-sky-600'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                      data-testid={`nav-link-${link.label.toLowerCase()}`}
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
          <div className="flex items-center gap-3 px-5 h-14 border-b border-slate-100">
            <button
              onClick={() => setIsSearchOpen(false)}
              className="p-2 -ml-2 btn-active"
              data-testid="close-search-button"
            >
              <X size={22} className="text-slate-700" />
            </button>
            <form onSubmit={handleSearch} className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search skincare tips..."
                className="w-full h-10 px-4 bg-slate-50 rounded-full text-base outline-none focus:ring-2 focus:ring-sky-200"
                autoFocus
                data-testid="search-input"
              />
            </form>
          </div>
          <div className="p-5">
            <p className="text-sm text-slate-500">Popular searches</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {['anti-aging', 'wrinkles', 'hydration', 'retinol'].map(term => (
                <button
                  key={term}
                  onClick={() => {
                    navigate(`/search?q=${term}`);
                    setIsSearchOpen(false);
                  }}
                  className="px-4 py-2 bg-slate-100 rounded-full text-sm text-slate-700 btn-active"
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
