/**
 * Meta Pixel Conversion Tracking for Celestaglow.com
 * Pixel ID: 690863659974240
 * 
 * Implements: ViewContent, InitiateCheckout, Purchase events
 * No AddToCart event needed (direct Buy Now flow)
 */

// Initialize Meta Pixel (backup if not loaded in HTML)
export const initMetaPixel = () => {
  const PIXEL_ID = '690863659974240';
  
  // Avoid re-initialization
  if (window.fbq) return;
  
  // Facebook Pixel Code
  !function(f,b,e,v,n,t,s){
    if(f.fbq)return;
    n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];
    t=b.createElement(e);t.async=!0;
    t.src=v;
    s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)
  }(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
  
  window.fbq('init', PIXEL_ID);
  window.fbq('track', 'PageView');
};

// ==================== STANDARD CONVERSION EVENTS ====================

/**
 * ViewContent Event - Fire on Product Page
 * Trigger: When user views the product details page
 * 
 * @param {number} value - Product price (default 599.00)
 */
export const trackViewContent = (value = 599.00) => {
  if (!window.fbq) return;
  
  window.fbq('track', 'ViewContent', {
    content_name: 'Super Anti-Aging Serum',
    content_category: 'Skincare',
    content_ids: ['celestaglow_serum_001'],
    content_type: 'product',
    value: value,
    currency: 'INR'
  });
  
  console.log('[Meta Pixel] ViewContent fired - value:', value);
};

/**
 * InitiateCheckout Event - Fire on Checkout Page
 * Trigger: When user clicks "Buy Now" and lands on checkout/shipping details
 * 
 * @param {number} value - Cart value (default 599.00)
 */
export const trackInitiateCheckout = (value = 599.00) => {
  if (!window.fbq) return;
  
  window.fbq('track', 'InitiateCheckout', {
    content_category: 'Skincare',
    content_ids: ['celestaglow_serum_001'],
    num_items: 1,
    value: value,
    currency: 'INR'
  });
  
  console.log('[Meta Pixel] InitiateCheckout fired - value:', value);
};

/**
 * Purchase Event - Fire on Order Confirmation/Thank You Page
 * Trigger: When user successfully completes a purchase
 * 
 * @param {string} orderId - Unique order ID (REQUIRED for deduplication)
 * @param {number} value - Purchase amount (REQUIRED)
 */
export const trackPurchase = (orderId, value) => {
  if (!window.fbq) return;
  
  if (!orderId) {
    console.error('[Meta Pixel] Purchase event requires order_id');
    return;
  }
  
  window.fbq('track', 'Purchase', {
    value: value,
    currency: 'INR',
    content_name: 'Super Anti-Aging Serum',
    content_category: 'Skincare',
    content_ids: ['celestaglow_serum_001'],
    content_type: 'product',
    num_items: 1,
    order_id: orderId
  });
  
  console.log('[Meta Pixel] Purchase fired - order_id:', orderId, 'value:', value);
};

// ==================== ADDITIONAL TRACKING EVENTS ====================

/**
 * Lead Event - Fire when user provides contact info (discount popup)
 */
export const trackLead = (source = 'discount_popup') => {
  if (!window.fbq) return;
  
  window.fbq('track', 'Lead', {
    content_name: 'Super Anti-Aging Serum',
    content_category: 'Skincare',
    lead_source: source
  });
  
  console.log('[Meta Pixel] Lead fired - source:', source);
};

/**
 * CompleteRegistration Event - Fire on consultation form submission
 */
export const trackCompleteRegistration = (source = 'consultation') => {
  if (!window.fbq) return;
  
  window.fbq('track', 'CompleteRegistration', {
    content_name: 'Skin Consultation',
    status: 'completed',
    registration_source: source
  });
  
  console.log('[Meta Pixel] CompleteRegistration fired - source:', source);
};

/**
 * Search Event - Fire when user searches blogs
 */
export const trackSearch = (searchQuery) => {
  if (!window.fbq) return;
  
  window.fbq('track', 'Search', {
    search_string: searchQuery,
    content_category: 'Blog'
  });
};

/**
 * Contact Event - Fire when user contacts via WhatsApp
 */
export const trackContact = (method = 'whatsapp') => {
  if (!window.fbq) return;
  
  window.fbq('track', 'Contact', {
    contact_method: method
  });
  
  console.log('[Meta Pixel] Contact fired - method:', method);
};

// ==================== CTA TRACKING ====================

/**
 * Track CTA button clicks as custom events
 */
export const trackCTAClick = (ctaName, location) => {
  if (!window.fbq) return;
  
  window.fbq('trackCustom', 'CTAClick', {
    cta_name: ctaName,
    page_location: location,
    content_name: 'Super Anti-Aging Serum'
  });
};

/**
 * Track form step completion
 */
export const trackFormStep = (stepName, stepNumber) => {
  if (!window.fbq) return;
  
  window.fbq('trackCustom', 'FormStep', {
    step_name: stepName,
    step_number: stepNumber
  });
};

/**
 * Track exit intent popup shown
 */
export const trackExitIntent = () => {
  if (!window.fbq) return;
  
  window.fbq('trackCustom', 'ExitIntentShown', {
    content_name: 'Super Anti-Aging Serum',
    offer: '₹100 OFF'
  });
};

// ==================== PAGE VIEW TRACKING ====================

/**
 * Track specific page views with custom parameters
 */
export const trackPageView = (pageName, additionalParams = {}) => {
  if (!window.fbq) return;
  
  window.fbq('track', 'PageView', {
    page_name: pageName,
    ...additionalParams
  });
};

// ==================== LEGACY EXPORTS (for backward compatibility) ====================

// AddToCart not needed for direct Buy Now flow, but keeping for any edge cases
export const trackAddToCart = (price = 599, quantity = 1) => {
  // No-op - direct Buy Now flow doesn't need AddToCart
  console.log('[Meta Pixel] AddToCart skipped - using direct Buy Now flow');
};

// AddPaymentInfo can be useful
export const trackAddPaymentInfo = (paymentMethod, price) => {
  if (!window.fbq) return;
  
  window.fbq('track', 'AddPaymentInfo', {
    content_name: 'Super Anti-Aging Serum',
    content_category: 'Skincare',
    content_ids: ['celestaglow_serum_001'],
    value: price,
    currency: 'INR',
    payment_method: paymentMethod
  });
  
  console.log('[Meta Pixel] AddPaymentInfo fired - method:', paymentMethod);
};

// Legacy tracking functions for backward compatibility
export const trackPopupDismissed = (popupType) => {
  if (!window.fbq) return;
  window.fbq('trackCustom', 'PopupDismissed', { popup_type: popupType });
};

export const trackBlogViewPixel = (blogTitle, blogCategory) => {
  if (!window.fbq) return;
  window.fbq('track', 'ViewContent', {
    content_name: blogTitle,
    content_category: blogCategory || 'Blog',
    content_type: 'article'
  });
};

// Alias for backward compatibility
export const trackBlogView = trackBlogViewPixel;

export const trackPopupShown = (popupType) => {
  if (!window.fbq) return;
  window.fbq('trackCustom', 'PopupShown', { popup_type: popupType });
};

export const trackViewTestimonials = () => {
  if (!window.fbq) return;
  window.fbq('trackCustom', 'ViewTestimonials', { content_name: 'Customer Testimonials' });
};

export const trackTimeOnPage = (pageName, seconds) => {
  if (!window.fbq) return;
  window.fbq('trackCustom', 'TimeOnPage', { page_name: pageName, time_seconds: seconds });
};

export const trackFAQInteraction = (question) => {
  if (!window.fbq) return;
  window.fbq('trackCustom', 'FAQInteraction', { question: question });
};

// Export all functions
export default {
  initMetaPixel,
  trackViewContent,
  trackInitiateCheckout,
  trackPurchase,
  trackLead,
  trackCompleteRegistration,
  trackSearch,
  trackContact,
  trackCTAClick,
  trackFormStep,
  trackExitIntent,
  trackPageView,
  trackAddToCart,
  trackAddPaymentInfo,
  trackPopupDismissed,
  trackBlogViewPixel,
  trackPopupShown,
  trackViewTestimonials,
  trackTimeOnPage,
  trackFAQInteraction
};
