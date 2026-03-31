import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ShoppingBag, X, MapPin } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Messenger-style notification sound
const NOTIFICATION_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3';

function RecentPurchaseNotification() {
  const [notification, setNotification] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const audioRef = useRef(null);
  
  // Rate limiting - Updated as per user request
  const notificationCountRef = useRef(0);
  const MAX_NOTIFICATIONS = 5; // Max 4-6 notifications per session (using 5)
  const FIRST_NOTIFICATION_DELAY = 5500; // First notification after 5-6 seconds
  const MIN_INTERVAL = 15000; // 15 seconds minimum
  const MAX_INTERVAL = 20000; // 20 seconds maximum

  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
    audioRef.current.volume = 0.18; // Soft messenger sound
    
    // Fetch recent purchases
    fetchPurchases();
  }, []);

  const canShowNotification = () => {
    return notificationCountRef.current < MAX_NOTIFICATIONS;
  };

  const getRandomInterval = () => {
    // Random interval between 15-20 seconds
    return MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL);
  };

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  const showNextNotification = () => {
    if (!canShowNotification() || dismissed || purchases.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * purchases.length);
    setNotification(purchases[randomIndex]);
    setVisible(true);
    notificationCountRef.current++;
    playSound();

    // Hide after 4 seconds
    setTimeout(() => {
      setVisible(false);
      
      // Schedule next notification if we haven't hit the limit
      if (canShowNotification() && !dismissed) {
        setTimeout(showNextNotification, getRandomInterval());
      }
    }, 4000);
  };

  useEffect(() => {
    if (purchases.length === 0 || dismissed) return;

    // Show first notification after 5-6 seconds
    const initialTimer = setTimeout(() => {
      showNextNotification();
    }, FIRST_NOTIFICATION_DELAY);

    return () => {
      clearTimeout(initialTimer);
    };
  }, [purchases, dismissed]);

  const fetchPurchases = async () => {
    try {
      const res = await axios.get(`${API}/recent-purchases`);
      setPurchases(res.data.purchases || []);
    } catch (err) {
      // Diverse Indian names (shortened for privacy feel)
      setPurchases([
        { name: "Priya S.", location: "Mumbai" },
        { name: "Anita R.", location: "Hyderabad" },
        { name: "Kavya N.", location: "Kerala" },
        { name: "Sneha P.", location: "Ahmedabad" },
        { name: "Meera I.", location: "Chennai" },
        { name: "Deepika S.", location: "Delhi" },
        { name: "Aishwarya R.", location: "Bangalore" },
        { name: "Pooja G.", location: "Lucknow" },
        { name: "Ritu V.", location: "Jaipur" },
        { name: "Lakshmi M.", location: "Trivandrum" },
        { name: "Anjali D.", location: "Pune" },
        { name: "Nandini P.", location: "Coimbatore" }
      ]);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    sessionStorage.setItem('purchaseNotifDismissed', 'true');
  };

  // Check if already dismissed this session
  useEffect(() => {
    if (sessionStorage.getItem('purchaseNotifDismissed')) {
      setDismissed(true);
    }
  }, []);

  if (!visible || !notification || dismissed) return null;

  return (
    <div 
      className="fixed top-20 right-4 z-50 animate-slide-in"
      data-testid="recent-purchase-notification"
    >
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 max-w-[240px] relative">
        <button 
          onClick={handleDismiss}
          className="absolute top-2 right-2 w-5 h-5 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100"
        >
          <X size={12} />
        </button>
        
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-4 h-4 text-green-600" />
          </div>
          <div className="flex-1 min-w-0 pr-4">
            <p className="font-medium text-gray-900 text-xs">
              {notification.name} just ordered
            </p>
            <p className="text-gray-500 text-[10px] flex items-center gap-0.5 mt-0.5">
              <MapPin size={10} />
              {notification.location}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.25s ease-out;
        }
      `}</style>
    </div>
  );
}

export default RecentPurchaseNotification;
