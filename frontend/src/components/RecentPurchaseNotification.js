import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MapPin } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// User's custom notification sound
const NOTIFICATION_SOUND_URL = 'https://customer-assets.emergentagent.com/job_26148967-6968-4918-8b5d-0a2c0e5259b2/artifacts/sa3jziee_universfield-new-notification-057-494255.mp3';

function RecentPurchaseNotification() {
  const [notification, setNotification] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const audioRef = useRef(null);
  
  // Rate limiting
  const notificationCountRef = useRef(0);
  const MAX_NOTIFICATIONS = 5;
  const FIRST_NOTIFICATION_DELAY = 5500; // 5-6 seconds
  const MIN_INTERVAL = 15000; // 15 seconds
  const MAX_INTERVAL = 20000; // 20 seconds

  useEffect(() => {
    audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
    audioRef.current.volume = 0.25;
    fetchPurchases();
  }, []);

  const canShowNotification = () => notificationCountRef.current < MAX_NOTIFICATIONS;

  const getRandomInterval = () => MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL);

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

    setTimeout(() => {
      setVisible(false);
      if (canShowNotification() && !dismissed) {
        setTimeout(showNextNotification, getRandomInterval());
      }
    }, 4000);
  };

  useEffect(() => {
    if (purchases.length === 0 || dismissed) return;
    const initialTimer = setTimeout(showNextNotification, FIRST_NOTIFICATION_DELAY);
    return () => clearTimeout(initialTimer);
  }, [purchases, dismissed]);

  const fetchPurchases = async () => {
    try {
      const res = await axios.get(`${API}/recent-purchases`);
      setPurchases(res.data.purchases || []);
    } catch (err) {
      // Authentic Indian names - real sounding, varied
      setPurchases([
        { name: "Ritika", location: "Mumbai" },
        { name: "Tanisha", location: "Delhi" },
        { name: "Neha M.", location: "Bangalore" },
        { name: "Sanya", location: "Hyderabad" },
        { name: "Kriti", location: "Chennai" },
        { name: "Aditi", location: "Pune" },
        { name: "Nisha", location: "Jaipur" },
        { name: "Pooja K.", location: "Kerala" },
        { name: "Megha", location: "Ahmedabad" },
        { name: "Shruti", location: "Kolkata" },
        { name: "Divya", location: "Lucknow" },
        { name: "Anjali", location: "Chandigarh" },
        { name: "Tanya", location: "Indore" },
        { name: "Swati", location: "Coimbatore" },
        { name: "Rashmi", location: "Nagpur" },
        { name: "Manisha", location: "Surat" },
        { name: "Snehal", location: "Thane" },
        { name: "Pallavi", location: "Gurgaon" }
      ]);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    sessionStorage.setItem('purchaseNotifDismissed', 'true');
  };

  useEffect(() => {
    if (sessionStorage.getItem('purchaseNotifDismissed')) {
      setDismissed(true);
    }
  }, []);

  if (!visible || !notification || dismissed) return null;

  return (
    <div 
      className="fixed top-24 right-4 z-50"
      data-testid="recent-purchase-notification"
      onClick={handleDismiss}
    >
      {/* Clean, minimal notification */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 px-4 py-3 max-w-[220px] cursor-pointer hover:scale-[1.02] transition-transform">
        <div className="flex items-center gap-3">
          {/* Green dot indicator */}
          <div className="relative">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping opacity-75"></div>
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-gray-900 text-sm font-medium truncate">
              {notification.name} ordered
            </p>
            <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
              <MapPin size={10} className="text-gray-400" />
              {notification.location}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%) scale(0.9); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        [data-testid="recent-purchase-notification"] > div {
          animation: slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
}

export default RecentPurchaseNotification;
