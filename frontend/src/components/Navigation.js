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
      {/* Main Header - Premium */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-[#f3efe6]">
        <div className="flex items-center justify-between px-5 h-16">
          {/* Menu Button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 -ml-2 transition-opacity hover:opacity-70"
            data-testid="menu-button"
            aria-label="Open menu"
          >
            <Menu size={22} className="text-[#4a5a3f]" />
          </button>

          {/* Logo - Premium */}
          <Link 
            to="/" 
            className="font-heading font-semibold text-lg tracking-tight"
            style={{ color: '#1a2e1a' }}
            data-testid="logo-link"
          >
            <span className="text-[#5f7350]">Celesta</span> Glow
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 transition-opacity hover:opacity-70"
              data-testid="search-button"
              aria-label="Search"
            >
              <Search size={20} className="text-[#4a5a3f]" />
            </button>
            <Link
              to="/product/anti-aging-serum"
              className="p-2 transition-opacity hover:opacity-70"
              data-testid="cart-button"
              aria-label="Shop"
            >
              <ShoppingBag size={20} className="text-[#4a5a3f]" />
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay - Premium */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/30" onClick={() => setIsMenuOpen(false)}>
          <div 
            className="absolute left-0 top-0 bottom-0 w-80 bg-[#fdfcfa] shadow-2xl"
            onClick={e => e.stopPropagation()}
            style={{ animation: 'slideIn 0.3s ease-out' }}
          >
            <div className="flex items-center justify-between p-6 border-b border-[#f3efe6]">
              <span className="font-heading font-semibold text-lg text-[#1a2e1a]">Menu</span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 -mr-2 transition-opacity hover:opacity-70"
                data-testid="close-menu-button"
              >
                <X size={22} className="text-[#4a5a3f]" />
              </button>
            </div>
            
            <nav className="p-6">
              <ul className="space-y-2">
                {navLinks.map(link => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`block py-4 px-5 rounded-xl text-base font-medium transition-all ${
                        location.pathname === link.path
                          ? 'bg-[#e8ebe3] text-[#5f7350]'
                          : 'text-[#4a5a3f] hover:bg-[#f6f7f4]'
                      }`}
                      data-testid={`nav-link-${link.label.toLowerCase()}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Menu Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-[#f3efe6]">
              <p className="text-xs text-[#96a883] text-center">
                Luxury Skincare Since 2024
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search Overlay - Premium */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-[#fdfcfa]">
          <div className="flex items-center gap-4 px-5 h-16 border-b border-[#f3efe6]">
            <button
              onClick={() => setIsSearchOpen(false)}
              className="p-2 -ml-2 transition-opacity hover:opacity-70"
              data-testid="close-search-button"
            >
              <X size={22} className="text-[#4a5a3f]" />
            </button>
            <form onSubmit={handleSearch} className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search skincare tips..."
                className="w-full h-12 px-5 bg-[#f6f7f4] rounded-full text-base outline-none focus:ring-2 focus:ring-[#d4daca] text-[#1a2e1a] placeholder-[#96a883]"
                autoFocus
                data-testid="search-input"
              />
            </form>
          </div>
          <div className="p-6">
            <p className="text-xs text-[#96a883] uppercase tracking-wider mb-4">Popular Searches</p>
            <div className="flex flex-wrap gap-3">
              {['anti-aging', 'wrinkles', 'hydration', 'retinol'].map(term => (
                <button
                  key={term}
                  onClick={() => {
                    navigate(`/search?q=${term}`);
                    setIsSearchOpen(false);
                  }}
                  className="px-5 py-2.5 bg-white border border-[#e8ebe3] rounded-full text-sm text-[#4a5a3f] transition-all hover:bg-[#f6f7f4] hover:border-[#d4daca]"
                  data-testid={`search-suggestion-${term}`}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}

export default Navigation;
