import React, { useState, useEffect, lazy, Suspense } from 'react';
import Navigation from '../components/Navigation';
import WhatsAppButton from '../components/WhatsAppButton';
import { useTracking } from '../providers/TrackingProvider';

// Lazy load heavy components that aren't immediately visible
const RecentPurchaseNotification = lazy(() => import('../components/RecentPurchaseNotification'));
const DiscountPopup = lazy(() => import('../components/DiscountPopup'));
const CookieConsent = lazy(() => import('../components/CookieConsent'));

// Simple loading fallback (empty, so no flash)
const EmptyFallback = () => null;

function PublicLayout({ children }) {
  const [showDiscountPopup, setShowDiscountPopup] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { trackAction } = useTracking();
  
  useEffect(() => {
    // Show discount popup after 5 seconds if not already claimed
    const discountTimer = setTimeout(() => {
      if (!localStorage.getItem('discountClaimed') && !sessionStorage.getItem('discountPopupShown')) {
        setShowDiscountPopup(true);
        sessionStorage.setItem('discountPopupShown', 'true');
        trackAction('popup_shown', { popup_type: 'discount_popup' });
      }
    }, 5000);
    
    // Enable notifications after 2 seconds (gives page time to load)
    const notifTimer = setTimeout(() => {
      setShowNotifications(true);
    }, 2000);
    
    return () => {
      clearTimeout(discountTimer);
      clearTimeout(notifTimer);
    };
  }, [trackAction]);
  
  const handleClaimDiscount = (code) => {
    localStorage.setItem('discountClaimed', 'true');
    localStorage.setItem('claimedDiscountCode', code);
    setShowDiscountPopup(false);
    trackAction('discount_claimed', { code });
  };
  
  return (
    <div className="app-container min-h-screen">
      {/* Navigation - always visible */}
      <Navigation />
      
      {/* Main content */}
      <main>
        {children}
      </main>
      
      {/* WhatsApp floating button - always visible */}
      <WhatsAppButton phoneNumber="919446125745" />
      
      {/* Lazy loaded components */}
      <Suspense fallback={<EmptyFallback />}>
        {/* Notifications - only on product-related pages */}
        {showNotifications && <RecentPurchaseNotification />}
        
        {/* Discount Popup */}
        {showDiscountPopup && (
          <DiscountPopup
            onClaim={handleClaimDiscount}
            onClose={() => setShowDiscountPopup(false)}
          />
        )}
        
        {/* Cookie Consent - handled internally */}
        <CookieConsent />
      </Suspense>
    </div>
  );
}

export default PublicLayout;
