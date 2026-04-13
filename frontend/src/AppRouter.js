import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import { TrackingProvider } from './providers/TrackingProvider';
import PublicLayout from './layouts/PublicLayout';

// Eagerly loaded pages (critical for first paint)
import Homepage from './pages/Homepage';
import ProductPage from './pages/ProductPage';

// Lazy loaded public pages (loaded on demand)
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'));
const BlogList = lazy(() => import('./pages/BlogList'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const LocationPage = lazy(() => import('./pages/LocationPage'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const ConsultationPage = lazy(() => import('./pages/ConsultationPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TrackOrder = lazy(() => import('./pages/TrackOrder'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const RefundPolicyPage = lazy(() => import('./pages/RefundPolicyPage'));
const ShippingPolicyPage = lazy(() => import('./pages/ShippingPolicyPage'));

// Lazy loaded admin pages (separate chunk, only loaded when visiting admin)
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminBlogs = lazy(() => import('./pages/admin/AdminBlogs'));
const AdminBlogEditor = lazy(() => import('./pages/admin/AdminBlogEditor'));
const AdminLocations = lazy(() => import('./pages/admin/AdminLocations'));
const AdminLocationEditor = lazy(() => import('./pages/admin/AdminLocationEditor'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminAIStudio = lazy(() => import('./pages/admin/AdminAIStudio'));
const AdminConsultations = lazy(() => import('./pages/admin/AdminConsultations'));
const AdminUserJourney = lazy(() => import('./pages/admin/AdminUserJourney'));
const AdminWhatsApp = lazy(() => import('./pages/admin/AdminWhatsApp'));
const AdminReferrals = lazy(() => import('./pages/admin/AdminReferrals'));
const AdminLandingPages = lazy(() => import('./pages/admin/AdminLandingPages'));
const AdminEmployees = lazy(() => import('./pages/admin/AdminEmployees'));
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers'));

// Employee Pages
const EmployeeLogin = lazy(() => import('./pages/employee/EmployeeLogin'));
const EmployeeDashboard = lazy(() => import('./pages/employee/EmployeeDashboard'));

// Landing Page Funnel (problem-specific)
const LandingPageFunnel = lazy(() => import('./pages/landing/LandingPageFunnel'));

// Legacy Landing Page (for backward compatibility with /lp/ URLs)
const LandingPage = lazy(() => import('./pages/LandingPage'));

// Loading spinner for lazy loaded pages
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-500 text-sm">Loading...</p>
    </div>
  </div>
);

// Admin layout wrapper (no tracking, minimal overhead)
const AdminLayout = ({ children }) => (
  <Suspense fallback={<PageLoader />}>
    {children}
  </Suspense>
);

function App() {
  useEffect(() => {
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
        {/* Admin Routes - No tracking provider, lazy loaded */}
        <Route path="/admin" element={<AdminLayout><AdminLogin /></AdminLayout>} />
        <Route path="/admin/dashboard" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
        <Route path="/admin/blogs" element={<AdminLayout><AdminBlogs /></AdminLayout>} />
        <Route path="/admin/blogs/new" element={<AdminLayout><AdminBlogEditor /></AdminLayout>} />
        <Route path="/admin/blogs/edit/:id" element={<AdminLayout><AdminBlogEditor /></AdminLayout>} />
        <Route path="/admin/locations" element={<AdminLayout><AdminLocations /></AdminLayout>} />
        <Route path="/admin/locations/new" element={<AdminLayout><AdminLocationEditor /></AdminLayout>} />
        <Route path="/admin/locations/edit/:id" element={<AdminLayout><AdminLocationEditor /></AdminLayout>} />
        <Route path="/admin/orders" element={<AdminLayout><AdminOrders /></AdminLayout>} />
        <Route path="/admin/ai-studio" element={<AdminLayout><AdminAIStudio /></AdminLayout>} />
        <Route path="/admin/consultations" element={<AdminLayout><AdminConsultations /></AdminLayout>} />
        <Route path="/admin/user-journey" element={<AdminLayout><AdminUserJourney /></AdminLayout>} />
        <Route path="/admin/whatsapp" element={<AdminLayout><AdminWhatsApp /></AdminLayout>} />
        <Route path="/admin/referrals" element={<AdminLayout><AdminReferrals /></AdminLayout>} />
        <Route path="/admin/landing-pages" element={<AdminLayout><AdminLandingPages /></AdminLayout>} />
        <Route path="/admin/employees" element={<AdminLayout><AdminEmployees /></AdminLayout>} />
        <Route path="/admin/customers" element={<AdminLayout><AdminCustomers /></AdminLayout>} />
        
        {/* Employee Routes */}
        <Route path="/employee/login" element={
          <Suspense fallback={<PageLoader />}><EmployeeLogin /></Suspense>
        } />
        <Route path="/employee/dashboard" element={
          <Suspense fallback={<PageLoader />}><EmployeeDashboard /></Suspense>
        } />
        <Route path="/employee/*" element={
          <Suspense fallback={<PageLoader />}><EmployeeDashboard /></Suspense>
        } />
        
        {/* Public Routes - With tracking provider */}
        <Route path="/*" element={
          <TrackingProvider>
            <Routes>
              {/* Consultation Route (full screen, no navigation) */}
              <Route path="/consultation" element={
                <Suspense fallback={<PageLoader />}>
                  <ConsultationPage />
                </Suspense>
              } />
              
              {/* Legal Pages */}
              <Route path="/terms" element={
                <PublicLayout>
                  <Suspense fallback={<PageLoader />}><TermsPage /></Suspense>
                </PublicLayout>
              } />
              <Route path="/privacy" element={
                <PublicLayout>
                  <Suspense fallback={<PageLoader />}><PrivacyPage /></Suspense>
                </PublicLayout>
              } />
              <Route path="/refund-policy" element={
                <PublicLayout>
                  <Suspense fallback={<PageLoader />}><RefundPolicyPage /></Suspense>
                </PublicLayout>
              } />
              <Route path="/shipping-policy" element={
                <PublicLayout>
                  <Suspense fallback={<PageLoader />}><ShippingPolicyPage /></Suspense>
                </PublicLayout>
              } />
              <Route path="/contact" element={
                <PublicLayout>
                  <Suspense fallback={<PageLoader />}><ContactPage /></Suspense>
                </PublicLayout>
              } />
              <Route path="/about" element={
                <PublicLayout>
                  <Suspense fallback={<PageLoader />}><AboutPage /></Suspense>
                </PublicLayout>
              } />
              
              {/* Legacy Landing Pages (backward compatibility with /lp/ URLs) */}
              <Route path="/lp/:slug" element={
                <Suspense fallback={<PageLoader />}>
                  <LandingPage />
                </Suspense>
              } />
              
              {/* Track Order Page */}
              <Route path="/track-order" element={
                <Suspense fallback={<PageLoader />}><TrackOrder /></Suspense>
              } />
              
              {/* Main Public Routes */}
              <Route path="/" element={<PublicLayout><Homepage /></PublicLayout>} />
              <Route path="/product/:slug" element={<PublicLayout><ProductPage /></PublicLayout>} />
              <Route path="/order-success/:orderId" element={
                <PublicLayout>
                  <Suspense fallback={<PageLoader />}><OrderSuccessPage /></Suspense>
                </PublicLayout>
              } />
              <Route path="/blog" element={
                <PublicLayout>
                  <Suspense fallback={<PageLoader />}><BlogList /></Suspense>
                </PublicLayout>
              } />
              <Route path="/blog/:slug" element={
                <PublicLayout>
                  <Suspense fallback={<PageLoader />}><BlogPost /></Suspense>
                </PublicLayout>
              } />
              <Route path="/search" element={
                <PublicLayout>
                  <Suspense fallback={<PageLoader />}><SearchResults /></Suspense>
                </PublicLayout>
              } />
              
              {/* Landing Page Funnels - Must be BEFORE /:state/:city to avoid conflicts */}
              {/* Problem-specific landing pages: /{slug}, /{slug}/product, /{slug}/order-success/:orderId */}
              <Route path="/:slug/*" element={
                <Suspense fallback={<PageLoader />}>
                  <LandingPageFunnel />
                </Suspense>
              } />
            </Routes>
          </TrackingProvider>
        } />
      </Routes>
    </Router>
  );
}

export default App;
