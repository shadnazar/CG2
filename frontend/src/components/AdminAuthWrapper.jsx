/**
 * AdminAuthWrapper.jsx
 * Wraps admin routes to ensure authentication before rendering
 */
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAdminToken } from '../utils/adminAuth';

const AdminAuthWrapper = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = getAdminToken();
      
      if (token) {
        setIsAuthenticated(true);
        setIsChecking(false);
      } else {
        // No token, redirect to login
        setIsAuthenticated(false);
        setIsChecking(false);
        // Don't redirect if already on login page
        if (location.pathname !== '/admin') {
          navigate('/admin', { replace: true });
        }
      }
    };

    checkAuth();
  }, [location.pathname, navigate]);

  // Show loading while checking
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // If not authenticated and not on login page, don't render
  if (!isAuthenticated && location.pathname !== '/admin') {
    return null;
  }

  return children;
};

export default AdminAuthWrapper;
