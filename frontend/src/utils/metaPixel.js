/**
 * Meta Pixel Deep Integration - Granular Conversion Events
 * Pixel ID: 690863659974240
 */

// Initialize Meta Pixel
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

// Track page views with custom parameters
export const trackPageView = (pageName, additionalParams = {}) => {
  if (!window.fbq) return;
  
  window.fbq('track', 'PageView', {
    page_name: pageName,
    ...additionalParams
  });
};

// ==================== CONVERSION EVENTS ====================

// Standard product data for all events
const PRODUCT_DATA = {
  content_name: 'Super Anti-Aging Serum',
  content_category: 'Skincare',
  content_ids: ['celestaglow_serum_001'],
  content_type: 'product'
};

// When user views product details
export const trackViewContent = (price = 599) => {
  if (!window.fbq) return;
  
  window.fbq('track', 'ViewContent', {
    ...PRODUCT_DATA,
    value: price,
    currency: 'INR'
  });
};

// When user adds product to cart / clicks buy button
export const trackAddToCart = (price = 599, quantity = 1) => {
  if (!window.fbq) return;
  
  window.fbq('track', 'AddToCart', {
    ...PRODUCT_DATA,
    value: price,
    currency: 'INR',
    num_items: quantity
  });
};

// When user starts checkout process (clicks Buy Now and lands on checkout)
export const trackInitiateCheckout = (price = 599) => {
  if (!window.fbq) return;
  
  window.fbq('track', 'InitiateCheckout', {
    content_category: 'Skincare',
    content_ids: ['celestaglow_serum_001'],
    num_items: 1,
    value: price,
    currency: 'INR'
  });
};

// When user adds payment info
export const trackAddPaymentInfo = (paymentMethod, price) => {
  if (!window.fbq) return;
  
  window.fbq('track', 'AddPaymentInfo', {
    ...PRODUCT_DATA,
    value: price,
    currency: 'INR',
    payment_method: paymentMethod
  });
};

// When purchase is completed - CRITICAL EVENT
export const trackPurchase = (orderId, amount, paymentMethod) => {
  if (!window.fbq) return;
  
  window.fbq('track', 'Purchase', {
    value: amount,
    currency: 'INR',
    content_name: 'Super Anti-Aging Serum',
    content_category: 'Skincare',
    content_ids: ['celestaglow_serum_001'],
    content_type: 'product',
    num_items: 1,
    order_id: orderId
  });
};

// ==================== LEAD GENERATION EVENTS ====================

// When user claims discount (provides phone number)
export const trackLead = (leadType = 'discount_claimed') => {
  if (!window.fbq) return;
  
  window.fbq('track', 'Lead', {
    content_name: 'Discount Lead',
    lead_type: leadType,
    value: 50, // Discount value
    currency: 'INR'
  });
};

// When user completes registration/lead form
export const trackCompleteRegistration = (registrationType) => {
  if (!window.fbq) return;
  
  window.fbq('track', 'CompleteRegistration', {
    content_name: registrationType || 'Newsletter Signup',
    status: 'completed'
  });
};

// ==================== ENGAGEMENT EVENTS ====================

// When user views blog content
export const trackBlogView = (blogTitle, blogCategory) => {
  if (!window.fbq) return;
  
  window.fbq('trackCustom', 'ViewBlogPost', {
    content_name: blogTitle,
    content_category: blogCategory,
    content_type: 'blog'
  });
};

// When user searches for content
export const trackSearch = (searchQuery) => {
  if (!window.fbq) return;
  
  window.fbq('track', 'Search', {
    search_string: searchQuery,
    content_type: 'blog'
  });
};

// When user scrolls to important section
export const trackScroll = (sectionName, scrollDepth) => {
  if (!window.fbq) return;
  
  window.fbq('trackCustom', 'ScrollDepth', {
    section: sectionName,
    depth: scrollDepth
  });
};

// When user clicks CTA button
export const trackCTAClick = (ctaName, ctaLocation) => {
  if (!window.fbq) return;
  
  window.fbq('trackCustom', 'CTAClick', {
    cta_name: ctaName,
    cta_location: ctaLocation
  });
};

// When user views testimonials
export const trackViewTestimonials = () => {
  if (!window.fbq) return;
  
  window.fbq('trackCustom', 'ViewTestimonials', {
    content_name: 'Customer Reviews',
    content_category: 'Social Proof'
  });
};

// When user interacts with FAQ
export const trackFAQInteraction = (faqQuestion) => {
  if (!window.fbq) return;
  
  window.fbq('trackCustom', 'FAQInteraction', {
    question: faqQuestion
  });
};

// When discount popup is shown
export const trackPopupShown = (popupType) => {
  if (!window.fbq) return;
  
  window.fbq('trackCustom', 'PopupShown', {
    popup_type: popupType
  });
};

// When discount popup is closed without action
export const trackPopupDismissed = (popupType) => {
  if (!window.fbq) return;
  
  window.fbq('trackCustom', 'PopupDismissed', {
    popup_type: popupType
  });
};

// Track time on page
export const trackTimeOnPage = (pageName, seconds) => {
  if (!window.fbq) return;
  
  window.fbq('trackCustom', 'TimeOnPage', {
    page_name: pageName,
    time_seconds: seconds
  });
};

// Track exit intent
export const trackExitIntent = (pageName) => {
  if (!window.fbq) return;
  
  window.fbq('trackCustom', 'ExitIntent', {
    page_name: pageName
  });
};

// Track address entry
export const trackAddressEntry = (stage) => {
  if (!window.fbq) return;
  
  window.fbq('trackCustom', 'AddressEntry', {
    stage: stage // 'started', 'partial', 'complete'
  });
};

// Track checkout step
export const trackCheckoutStepMeta = (stepNumber, stepName) => {
  if (!window.fbq) return;
  
  window.fbq('trackCustom', 'CheckoutStep', {
    step_number: stepNumber,
    step_name: stepName
  });
};

// Track payment method selection
export const trackPaymentMethodSelected = (method) => {
  if (!window.fbq) return;
  
  window.fbq('trackCustom', 'PaymentMethodSelected', {
    payment_method: method
  });
};

export default {
  initMetaPixel,
  trackPageView,
  trackViewContent,
  trackAddToCart,
  trackInitiateCheckout,
  trackAddPaymentInfo,
  trackPurchase,
  trackLead,
  trackCompleteRegistration,
  trackBlogView,
  trackSearch,
  trackScroll,
  trackCTAClick,
  trackViewTestimonials,
  trackFAQInteraction,
  trackPopupShown,
  trackPopupDismissed,
  trackTimeOnPage,
  trackExitIntent,
  trackAddressEntry,
  trackCheckoutStepMeta,
  trackPaymentMethodSelected
};
