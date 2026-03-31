import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ShoppingBag, X, MapPin } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Soft pop sound (Instagram DM style)
const NOTIFICATION_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3';

function RecentPurchaseNotification() {
  const [notification, setNotification] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const audioRef = useRef(null);
  
  // Rate limiting
  const notificationCountRef = useRef(0);
  const sessionStartRef = useRef(Date.now());
  const MAX_NOTIFICATIONS = 5; // Max 5 notifications per 3-minute session
  const SESSION_WINDOW = 180000; // 3 minutes
  const NOTIFICATION_INTERVAL = 60000; // Show every 60 seconds (was 20)
  const FIRST_NOTIFICATION_DELAY = 45000; // First notification after 45 seconds (was 8)

  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
    audioRef.current.volume = 0.15; // Very soft
    
    // Fetch recent purchases
    fetchPurchases();
  }, []);

  const canShowNotification = () => {
    const now = Date.now();
    
    // Reset counter if session window expired
    if (now - sessionStartRef.current > SESSION_WINDOW) {
      sessionStartRef.current = now;
      notificationCountRef.current = 0;
    }
    
    // Check if we've exceeded max notifications
    if (notificationCountRef.current >= MAX_NOTIFICATIONS) {
      return false;
    }
    
    return true;
  };

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  useEffect(() => {
    if (purchases.length === 0 || dismissed) return;

    // Show notification every 60 seconds (more reasonable)
    const showInterval = setInterval(() => {
      if (!canShowNotification() || visible) return;
      
      const randomIndex = Math.floor(Math.random() * purchases.length);
      setNotification(purchases[randomIndex]);
      setVisible(true);
      notificationCountRef.current++;
      playSound();

      // Hide after 5 seconds
      setTimeout(() => {
        setVisible(false);
      }, 5000);
    }, NOTIFICATION_INTERVAL);

    // Show first notification after 45 seconds
    const initialTimer = setTimeout(() => {
      if (!canShowNotification() || dismissed) return;
      
      const randomIndex = Math.floor(Math.random() * purchases.length);
      setNotification(purchases[randomIndex]);
      setVisible(true);
      notificationCountRef.current++;
      playSound();
      setTimeout(() => setVisible(false), 5000);
    }, FIRST_NOTIFICATION_DELAY);

    return () => {
      clearInterval(showInterval);
      clearTimeout(initialTimer);
    };
  }, [purchases, dismissed, visible]);

  const fetchPurchases = async () => {
    try {
      const res = await axios.get(`${API}/recent-purchases`);
      setPurchases(res.data.purchases || []);
    } catch (err) {
      // Use diverse Indian names fallback
      setPurchases([
        { name: "Priya S.", location: "Mumbai" },
        { name: "Anita R.", location: "Hyderabad" },
        { name: "Kavya N.", location: "Kochi" },
        { name: "Sneha P.", location: "Ahmedabad" },
        { name: "Meera I.", location: "Chennai" },
        { name: "Deepika S.", location: "Delhi" },
        { name: "Aishwarya R.", location: "Bangalore" },
        { name: "Pooja G.", location: "Lucknow" },
        { name: "Ritu V.", location: "Jaipur" },
        { name: "Lakshmi M.", location: "Trivandrum" }
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
