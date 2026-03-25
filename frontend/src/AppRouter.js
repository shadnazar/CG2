import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Homepage from './pages/Homepage';
import ProductPage from './pages/ProductPage';
import BlogList from './pages/BlogList';
import BlogPost from './pages/BlogPost';
import LocationPage from './pages/LocationPage';
import SearchResults from './pages/SearchResults';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBlogs from './pages/admin/AdminBlogs';
import AdminBlogEditor from './pages/admin/AdminBlogEditor';
import AdminLocations from './pages/admin/AdminLocations';
import AdminLocationEditor from './pages/admin/AdminLocationEditor';
import AdminOrders from './pages/admin/AdminOrders';
import AdminAIStudio from './pages/admin/AdminAIStudio';

// Layout component for public pages with navigation
function PublicLayout({ children }) {
  return (
    <div className="app-container">
      <Navigation />
      {children}
    </div>
  );
}

function App() {
  return (
    <Router>
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
        
        {/* Public Routes (with navigation) */}
        <Route path="/" element={<PublicLayout><Homepage /></PublicLayout>} />
        <Route path="/product/:slug" element={<PublicLayout><ProductPage /></PublicLayout>} />
        <Route path="/blog" element={<PublicLayout><BlogList /></PublicLayout>} />
        <Route path="/blog/:slug" element={<PublicLayout><BlogPost /></PublicLayout>} />
        <Route path="/search" element={<PublicLayout><SearchResults /></PublicLayout>} />
        <Route path="/:state/:city?" element={<PublicLayout><LocationPage /></PublicLayout>} />
      </Routes>
    </Router>
  );
}

export default App;
