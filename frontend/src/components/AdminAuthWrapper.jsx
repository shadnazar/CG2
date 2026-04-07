/**
 * AdminAuthWrapper.jsx
 * Wraps admin routes to ensure authentication before rendering
 */
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAdminToken } from '../utils/adminAuth';

const AdminAuthWrapper = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getAdminToken());
  const [isChecking, setIsChecking] = useState(true);
  const checkCount = useRef(0);

  useEffect(() => {
    const checkAuth = () => {
      const token = getAdminToken();
      
      if (token) {
        setIsAuthenticated(true);
        setIsChecking(false);
        checkCount.current = 0;
      } else {
        // No token found - but let's retry a couple times
        // in case sessionStorage is still being written
        checkCount.current += 1;
        
        if (checkCount.current <= 3) {
          // Retry after a short delay
          setTimeout(checkAuth, 100);
          return;
        }
        
        // After retries, redirect to login
        setIsAuthenticated(false);
        setIsChecking(false);
        navigate('/admin', { replace: true });
      }
    };

    // Reset and check on every route change
    setIsChecking(true);
    checkCount.current = 0;
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

  // If not authenticated, don't render (redirect already happened)
  if (!isAuthenticated) {
    return null;
  }

  return children;
};

export default AdminAuthWrapper;
