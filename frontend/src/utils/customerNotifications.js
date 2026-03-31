/**
 * Customer Notification System
 * Minimal, genuine social proof notifications
 */

// Soft bell sound
const NOTIFICATION_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2870/2870-preview.mp3';

let audioElement = null;
let notificationContainer = null;
let isInitialized = false;
let currentNotification = null;

export const initCustomerNotifications = () => {
  if (isInitialized || typeof window === 'undefined') return;
  
  audioElement = new Audio(NOTIFICATION_SOUND_URL);
  audioElement.volume = 0.15; // Very soft
  audioElement.preload = 'auto';
  
  // Minimal container - bottom left, very small
  notificationContainer = document.createElement('div');
  notificationContainer.id = 'customer-notifications';
  notificationContainer.style.cssText = `
    position: fixed;
    bottom: 16px;
    left: 16px;
    z-index: 900;
    max-width: 240px;
  `;
  document.body.appendChild(notificationContainer);
  
  if (!document.getElementById('notif-styles')) {
    const style = document.createElement('style');
    style.id = 'notif-styles';
    style.textContent = `
      @keyframes fadeSlide { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
      .mini-notif { animation: fadeSlide 0.3s ease-out; }
      .mini-notif.hide { animation: fadeOut 0.2s ease-in forwards; }
    `;
    document.head.appendChild(style);
  }
  
  isInitialized = true;
};

export const playNotificationSound = () => {
  if (audioElement) {
    audioElement.currentTime = 0;
    audioElement.play().catch(() => {});
  }
};

export const showNotification = (message, options = {}) => {
  if (!notificationContainer) initCustomerNotifications();
  
  const { duration = 3500, playSound = true } = options;
  
  if (currentNotification?.parentNode) {
    currentNotification.parentNode.removeChild(currentNotification);
  }
  
  if (playSound) playNotificationSound();
  
  const notification = document.createElement('div');
  notification.className = 'mini-notif';
  notification.style.cssText = `
    background: rgba(255,255,255,0.95);
    backdrop-filter: blur(8px);
    border-radius: 8px;
    padding: 8px 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #374151;
    cursor: pointer;
    border: 1px solid rgba(34,197,94,0.2);
  `;
  
  notification.innerHTML = `<span style="color:#22c55e;">●</span> ${message}`;
  notification.onclick = () => removeNotification(notification);
  
  notificationContainer.appendChild(notification);
  currentNotification = notification;
  
  setTimeout(() => removeNotification(notification), duration);
};

const removeNotification = (n) => {
  if (!n?.parentNode) return;
  n.classList.add('hide');
  setTimeout(() => n.parentNode?.removeChild(n), 200);
  if (currentNotification === n) currentNotification = null;
};

export const showPurchaseNotification = (location) => {
  showNotification(`Order from ${location}`, { duration: 3000 });
};

const LOCATIONS = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune', 'Hyderabad', 'Kolkata', 'Jaipur', 'Kerala', 'Ahmedabad'];

export const startSocialProofNotifications = (intervalMs = 75000) => {
  // First after 30 seconds, then every 75 seconds (more natural)
  setTimeout(() => {
    showPurchaseNotification(LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)]);
  }, 30000);
  
  setInterval(() => {
    showPurchaseNotification(LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)]);
  }, intervalMs);
};

export default { initCustomerNotifications, showNotification, showPurchaseNotification, startSocialProofNotifications };
