/**
 * Customer Notification System
 * Minimal, genuine social proof notifications + Admin Broadcasts
 */
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;

// Soft bell sound (gentle notification)
const NOTIFICATION_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

let audioElement = null;
let notificationContainer = null;
let isInitialized = false;
let currentNotification = null;
let dismissedBroadcasts = new Set();
let broadcastPollInterval = null;

export const initCustomerNotifications = () => {
  if (isInitialized || typeof window === 'undefined') return;
  
  audioElement = new Audio(NOTIFICATION_SOUND_URL);
  audioElement.volume = 0.2; // Soft bell
  audioElement.preload = 'auto';
  
  // Load dismissed broadcasts from localStorage
  try {
    const dismissed = localStorage.getItem('dismissedBroadcasts');
    if (dismissed) {
      dismissedBroadcasts = new Set(JSON.parse(dismissed));
    }
  } catch (e) {}
  
  // Minimal container - bottom left, small
  notificationContainer = document.createElement('div');
  notificationContainer.id = 'customer-notifications';
  notificationContainer.style.cssText = `
    position: fixed;
    bottom: 16px;
    left: 16px;
    z-index: 900;
    max-width: 280px;
    display: flex;
    flex-direction: column;
    gap: 8px;
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
      .broadcast-notif {
        animation: fadeSlide 0.3s ease-out;
        background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
        color: white;
        border-radius: 12px;
        padding: 12px 14px;
        box-shadow: 0 4px 12px rgba(34,197,94,0.3);
        cursor: pointer;
        position: relative;
      }
      .broadcast-notif:hover { transform: scale(1.02); transition: transform 0.2s; }
      .broadcast-notif .close-btn {
        position: absolute;
        top: 4px;
        right: 8px;
        font-size: 16px;
        opacity: 0.7;
        cursor: pointer;
      }
      .broadcast-notif .close-btn:hover { opacity: 1; }
    `;
    document.head.appendChild(style);
  }
  
  isInitialized = true;
  
  // Start polling for broadcast notifications
  checkBroadcastNotifications();
  broadcastPollInterval = setInterval(checkBroadcastNotifications, 30000); // Check every 30 seconds
};

export const playNotificationSound = () => {
  if (audioElement) {
    audioElement.currentTime = 0;
    audioElement.play().catch(() => {});
  }
};

export const showNotification = (message, options = {}) => {
  if (!notificationContainer) initCustomerNotifications();
  
  const { duration = 3500, playSound = true, type = 'social' } = options;
  
  // For social proof, remove previous
  if (type === 'social' && currentNotification?.parentNode) {
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
  if (type === 'social') currentNotification = notification;
  
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

// Admin Broadcast Notification
export const showBroadcastNotification = (broadcast) => {
  if (!notificationContainer) initCustomerNotifications();
  if (dismissedBroadcasts.has(broadcast.notification_id)) return;
  
  // Check if already showing this broadcast
  if (document.querySelector(`[data-broadcast-id="${broadcast.notification_id}"]`)) return;
  
  playNotificationSound();
  
  const notification = document.createElement('div');
  notification.className = 'broadcast-notif';
  notification.setAttribute('data-broadcast-id', broadcast.notification_id);
  
  notification.innerHTML = `
    <span class="close-btn">×</span>
    <div style="font-weight:600; font-size:13px; margin-bottom:4px;">${broadcast.title}</div>
    <div style="font-size:12px; opacity:0.95;">${broadcast.body}</div>
  `;
  
  const closeBtn = notification.querySelector('.close-btn');
  closeBtn.onclick = (e) => {
    e.stopPropagation();
    dismissBroadcast(broadcast.notification_id, notification);
  };
  
  notification.onclick = () => {
    if (broadcast.url && broadcast.url !== '/') {
      window.location.href = broadcast.url;
    }
    dismissBroadcast(broadcast.notification_id, notification);
  };
  
  notificationContainer.appendChild(notification);
  
  // Auto dismiss after 15 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.classList.add('hide');
      setTimeout(() => notification.parentNode?.removeChild(notification), 200);
    }
  }, 15000);
};

const dismissBroadcast = (notificationId, element) => {
  dismissedBroadcasts.add(notificationId);
  localStorage.setItem('dismissedBroadcasts', JSON.stringify([...dismissedBroadcasts]));
  
  if (element?.parentNode) {
    element.classList.add('hide');
    setTimeout(() => element.parentNode?.removeChild(element), 200);
  }
  
  // Notify backend (optional - for tracking)
  const visitorId = sessionStorage.getItem('visitor_id');
  if (visitorId) {
    axios.post(`${API}/api/notifications/dismiss-broadcast`, {
      visitor_id: visitorId,
      notification_id: notificationId
    }).catch(() => {});
  }
};

// Check for new broadcast notifications from admin
export const checkBroadcastNotifications = async () => {
  try {
    const res = await axios.get(`${API}/api/notifications/broadcast`);
    const broadcasts = res.data?.broadcasts || [];
    
    broadcasts.forEach(broadcast => {
      if (!dismissedBroadcasts.has(broadcast.notification_id)) {
        showBroadcastNotification(broadcast);
      }
    });
  } catch (e) {
    // Silent fail - not critical
  }
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

export const cleanup = () => {
  if (broadcastPollInterval) {
    clearInterval(broadcastPollInterval);
  }
};

export default { 
  initCustomerNotifications, 
  showNotification, 
  showPurchaseNotification, 
  startSocialProofNotifications,
  checkBroadcastNotifications,
  cleanup
};
