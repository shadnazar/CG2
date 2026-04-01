import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import ScrollToTop from './components/ScrollToTop';
import WhatsAppButton from './components/WhatsAppButton';
import Homepage from './pages/Homepage';
import ProductPage from './pages/ProductPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import BlogList from './pages/BlogList';
import BlogPost from './pages/BlogPost';
import LocationPage from './pages/LocationPage';
import SearchResults from './pages/SearchResults';
import ConsultationPage from './pages/ConsultationPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import { initAllTracking } from './utils/userTracking';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBlogs from './pages/admin/AdminBlogs';
import AdminBlogEditor from './pages/admin/AdminBlogEditor';
import AdminLocations from './pages/admin/AdminLocations';
import AdminLocationEditor from './pages/admin/AdminLocationEditor';
import AdminOrders from './pages/admin/AdminOrders';
import AdminAIStudio from './pages/admin/AdminAIStudio';
import AdminConsultations from './pages/admin/AdminConsultations';
import AdminUserJourney from './pages/admin/AdminUserJourney';
import AdminWhatsApp from './pages/admin/AdminWhatsApp';
import AdminReferrals from './pages/admin/AdminReferrals';

// Layout component for public pages with navigation
function PublicLayout({ children }) {
  return (
    <div className="app-container">
      <Navigation />
      {children}
      <WhatsAppButton phoneNumber="919446125745" />
    </div>
  );
}

function App() {
  // Initialize all tracking (Google Analytics + DOM click tracking)
  useEffect(() => {
    initAllTracking();
    
    // Detect referral code from URL on any page load and store in sessionStorage
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      sessionStorage.setItem('referralCode', refCode);
      console.log('[Referral] Code detected in URL:', refCode);
    }
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Admin Routes (no navigation) */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/blogs" element={<AdminBlogs />} />
        <Route path="/admin/blogs/new" element={<AdminBlogEditor />} />
        <Route path="/admin/blogs/edit/:id" element={<AdminBlogEditor />} />
        <Route path="/admin/locations" element={<AdminLocations />} />
        <Route path="/admin/locations/new" element={<AdminLocationEditor />} />
        <Route path="/admin/locations/edit/:id" element={<AdminLocationEditor />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/ai-studio" element={<AdminAIStudio />} />
        <Route path="/admin/consultations" element={<AdminConsultations />} />
        <Route path="/admin/user-journey" element={<AdminUserJourney />} />
        <Route path="/admin/whatsapp" element={<AdminWhatsApp />} />
        <Route path="/admin/referrals" element={<AdminReferrals />} />
        
        {/* Consultation Route (no navigation - full screen experience) */}
        <Route path="/consultation" element={<ConsultationPage />} />
        
        {/* Legal Pages */}
        <Route path="/terms" element={<PublicLayout><TermsPage /></PublicLayout>} />
        <Route path="/privacy" element={<PublicLayout><PrivacyPage /></PublicLayout>} />
        
        {/* Public Routes (with navigation) */}
        <Route path="/" element={<PublicLayout><Homepage /></PublicLayout>} />
        <Route path="/product/:slug" element={<PublicLayout><ProductPage /></PublicLayout>} />
        <Route path="/order-success/:orderId" element={<PublicLayout><OrderSuccessPage /></PublicLayout>} />
        <Route path="/blog" element={<PublicLayout><BlogList /></PublicLayout>} />
        <Route path="/blog/:slug" element={<PublicLayout><BlogPost /></PublicLayout>} />
        <Route path="/search" element={<PublicLayout><SearchResults /></PublicLayout>} />
        <Route path="/:state/:city?" element={<PublicLayout><LocationPage /></PublicLayout>} />
      </Routes>
    </Router>
  );
}

export default App;
