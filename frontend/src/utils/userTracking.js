/**
 * User Behavior Tracking Utility
 * Tracks visitor behavior across the site with unique visitor ID
 */

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Get or create unique visitor ID
export const getVisitorId = () => {
  let visitorId = localStorage.getItem('visitorId');
  if (!visitorId) {
    visitorId = `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('visitorId', visitorId);
    localStorage.setItem('visitorFirstSeen', new Date().toISOString());
  }
  return visitorId;
};

// Get session ID (resets on browser close)
export const getSessionId = () => {
  let sessionId = sessionStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = `s_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('sessionId', sessionId);
    sessionStorage.setItem('sessionStart', new Date().toISOString());
  }
  return sessionId;
};

// Track page visit with detailed info
export const trackPageVisit = async (page, additionalData = {}) => {
  // Always track page visits for analytics - consent only affects detailed tracking
  const visitorId = getVisitorId();
  const sessionId = getSessionId();
  
  const trackingData = {
    visitor_id: visitorId,
    session_id: sessionId,
    page: page,
    timestamp: new Date().toISOString(),
    referrer: document.referrer || 'direct',
    user_agent: navigator.userAgent,
    screen_width: window.innerWidth,
    screen_height: window.innerHeight,
    ...additionalData
  };

  try {
    await fetch(`${API}/tracking/page-visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trackingData)
    });
  } catch (err) {
    console.log('Tracking error:', err);
  }
};

// Track time spent on page
export const trackTimeSpent = async (page, timeSpentSeconds) => {
  // Track time spent for all visitors
  const visitorId = getVisitorId();
  const sessionId = getSessionId();

  try {
    await fetch(`${API}/tracking/time-spent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitor_id: visitorId,
        session_id: sessionId,
        page: page,
        time_spent: timeSpentSeconds,
        timestamp: new Date().toISOString()
      })
    });
  } catch (err) {
    console.log('Tracking error:', err);
  }
};

// Track user action (click, scroll, form fill, etc.)
export const trackAction = async (action, details = {}) => {
  // Track all user actions for analytics
  const visitorId = getVisitorId();
  const sessionId = getSessionId();

  try {
    await fetch(`${API}/tracking/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitor_id: visitorId,
        session_id: sessionId,
        action: action,
        details: details,
        page: window.location.pathname,
        timestamp: new Date().toISOString()
      })
    });
  } catch (err) {
    console.log('Tracking error:', err);
  }
};

// Track form completion
export const trackFormComplete = async (formName, formData = {}) => {
  return trackAction('form_complete', {
    form_name: formName,
    has_address: !!formData.address || !!formData.house_number,
    has_phone: !!formData.phone,
    has_email: !!formData.email,
    has_name: !!formData.name
  });
};

// Track scroll depth
export const trackScrollDepth = async (page, depth) => {
  return trackAction('scroll', { page, depth_percent: depth });
};

// Track checkout step
export const trackCheckoutStep = async (step, data = {}) => {
  return trackAction('checkout_step', { step, ...data });
};

// Hook for tracking page with time spent
export const usePageTracking = (pageName) => {
  const startTime = Date.now();
  
  // Track page visit on mount
  trackPageVisit(pageName);
  
  // Return cleanup function to track time spent
  return () => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    trackTimeSpent(pageName, timeSpent);
  };
};

export default {
  getVisitorId,
  getSessionId,
  trackPageVisit,
  trackTimeSpent,
  trackAction,
  trackFormComplete,
  trackScrollDepth,
  trackCheckoutStep,
  usePageTracking
};
