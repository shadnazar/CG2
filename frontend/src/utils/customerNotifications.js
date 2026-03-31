/**
 * Customer Notification System
 * Shows social proof notifications with sound to website visitors
 */

// Notification sound URL (soft notification chime)
const NOTIFICATION_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3';

let audioElement = null;
let notificationContainer = null;
let isInitialized = false;

// Initialize the notification system
export const initCustomerNotifications = () => {
  if (isInitialized || typeof window === 'undefined') return;
  
  // Create audio element
  audioElement = new Audio(NOTIFICATION_SOUND_URL);
  audioElement.volume = 0.4;
  audioElement.preload = 'auto';
  
  // Create notification container
  notificationContainer = document.createElement('div');
  notificationContainer.id = 'customer-notifications';
  notificationContainer.style.cssText = `
    position: fixed;
    bottom: 100px;
    left: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 320px;
  `;
  document.body.appendChild(notificationContainer);
  
  isInitialized = true;
  console.log('[CustomerNotif] Initialized');
};

// Play notification sound
export const playNotificationSound = () => {
  if (audioElement) {
    audioElement.currentTime = 0;
    audioElement.play().catch(err => {
      // Autoplay might be blocked until user interaction
      console.log('[CustomerNotif] Sound blocked (needs user interaction)');
    });
  }
};

// Show a notification toast
export const showNotification = (message, options = {}) => {
  if (!notificationContainer) {
    initCustomerNotifications();
  }
  
  const {
    type = 'purchase', // purchase, discount, visitor
    duration = 5000,
    playSound = true,
    icon = '🛒'
  } = options;
  
  // Play sound
  if (playSound) {
    playNotificationSound();
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'customer-notification';
  notification.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 12px 16px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    gap: 12px;
    animation: slideIn 0.4s ease-out;
    border-left: 4px solid ${type === 'purchase' ? '#22c55e' : type === 'discount' ? '#f59e0b' : '#3b82f6'};
    cursor: pointer;
    transition: transform 0.2s, opacity 0.2s;
  `;
  
  notification.innerHTML = `
    <span style="font-size: 24px;">${icon}</span>
    <div style="flex: 1;">
      <p style="margin: 0; font-size: 14px; color: #1f2937; font-weight: 500;">${message}</p>
      <p style="margin: 2px 0 0 0; font-size: 11px; color: #6b7280;">Just now</p>
    </div>
    <button style="background: none; border: none; color: #9ca3af; cursor: pointer; padding: 4px;">✕</button>
  `;
  
  // Close button
  notification.querySelector('button').addEventListener('click', (e) => {
    e.stopPropagation();
    removeNotification(notification);
  });
  
  // Click to dismiss
  notification.addEventListener('click', () => {
    removeNotification(notification);
  });
  
  // Add animation keyframes if not already added
  if (!document.getElementById('customer-notif-styles')) {
    const style = document.createElement('style');
    style.id = 'customer-notif-styles';
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(-100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(-100%); opacity: 0; }
      }
      .customer-notification:hover {
        transform: scale(1.02);
      }
    `;
    document.head.appendChild(style);
  }
  
  notificationContainer.appendChild(notification);
  
  // Auto remove after duration
  setTimeout(() => {
    removeNotification(notification);
  }, duration);
  
  return notification;
};

// Remove notification with animation
const removeNotification = (notification) => {
  if (!notification || !notification.parentNode) return;
  
  notification.style.animation = 'slideOut 0.3s ease-in forwards';
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 300);
};

// Show "Someone just purchased" notification
export const showPurchaseNotification = (location = 'India') => {
  const messages = [
    `Someone from ${location} just ordered!`,
    `New order from ${location}! 🎉`,
    `${location} customer just purchased!`,
    `Another happy customer from ${location}!`
  ];
  const message = messages[Math.floor(Math.random() * messages.length)];
  
  showNotification(message, {
    type: 'purchase',
    icon: '🛒',
    playSound: true,
    duration: 6000
  });
};

// Show discount/offer notification
export const showDiscountNotification = (message) => {
  showNotification(message, {
    type: 'discount',
    icon: '🎁',
    playSound: true,
    duration: 7000
  });
};

// Show admin push notification
export const showAdminNotification = (title, body) => {
  showNotification(`${title}: ${body}`, {
    type: 'visitor',
    icon: '📢',
    playSound: true,
    duration: 8000
  });
};

// Random social proof notifications
const INDIAN_LOCATIONS = [
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad',
  'Pune', 'Kolkata', 'Jaipur', 'Ahmedabad', 'Lucknow',
  'Kerala', 'Gujarat', 'Chandigarh', 'Goa', 'Indore'
];

export const startSocialProofNotifications = (intervalMs = 45000) => {
  // First notification after 15 seconds
  setTimeout(() => {
    const location = INDIAN_LOCATIONS[Math.floor(Math.random() * INDIAN_LOCATIONS.length)];
    showPurchaseNotification(location);
  }, 15000);
  
  // Then every intervalMs (default 45 seconds)
  setInterval(() => {
    const location = INDIAN_LOCATIONS[Math.floor(Math.random() * INDIAN_LOCATIONS.length)];
    showPurchaseNotification(location);
  }, intervalMs);
};

export default {
  initCustomerNotifications,
  playNotificationSound,
  showNotification,
  showPurchaseNotification,
  showDiscountNotification,
  showAdminNotification,
  startSocialProofNotifications
};
