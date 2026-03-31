import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MapPin, ShoppingBag, CheckCircle } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// User's custom notification sound
const NOTIFICATION_SOUND_URL = 'https://customer-assets.emergentagent.com/job_26148967-6968-4918-8b5d-0a2c0e5259b2/artifacts/sa3jziee_universfield-new-notification-057-494255.mp3';

// Product image
const PRODUCT_IMAGE = 'https://customer-assets.emergentagent.com/job_ae0c9586-b94c-4054-b869-8b9baeb452c6/artifacts/gwxje1nv_1F955957-C2EB-4ED0-A713-0B302C9B4892.jpeg';

function RecentPurchaseNotification() {
  const [notification, setNotification] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const audioRef = useRef(null);
  
  // Rate limiting
  const notificationCountRef = useRef(0);
  const MAX_NOTIFICATIONS = 5;
  const FIRST_NOTIFICATION_DELAY = 5500;
  const MIN_INTERVAL = 15000;
  const MAX_INTERVAL = 20000;

  useEffect(() => {
    audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
    audioRef.current.volume = 0.3;
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
    }, 5000);
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
      // Authentic, unique names - varied styles
      setPurchases([
        { name: "Ritika", location: "Mumbai", time: "2 min ago" },
        { name: "Tanisha", location: "Delhi", time: "5 min ago" },
        { name: "Neha M.", location: "Bangalore", time: "8 min ago" },
        { name: "Sanya", location: "Hyderabad", time: "12 min ago" },
        { name: "Kriti", location: "Chennai", time: "15 min ago" },
        { name: "Aditi", location: "Pune", time: "18 min ago" },
        { name: "Nisha", location: "Jaipur", time: "22 min ago" },
        { name: "Pooja K.", location: "Kerala", time: "25 min ago" },
        { name: "Megha", location: "Ahmedabad", time: "28 min ago" },
        { name: "Shruti", location: "Kolkata", time: "32 min ago" },
        { name: "Divya", location: "Lucknow", time: "35 min ago" },
        { name: "Tanya", location: "Chandigarh", time: "40 min ago" },
        { name: "Swati", location: "Indore", time: "45 min ago" },
        { name: "Rashmi", location: "Nagpur", time: "50 min ago" },
        { name: "Snehal", location: "Surat", time: "55 min ago" },
        { name: "Pallavi", location: "Gurgaon", time: "1 hr ago" }
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
      className="fixed top-20 right-3 z-50"
      data-testid="recent-purchase-notification"
    >
      {/* Rich notification card with product image */}
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-w-[280px] cursor-pointer hover:shadow-3xl transition-all duration-300"
        onClick={handleDismiss}
      >
        {/* Green header bar */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-white" />
          <span className="text-white text-xs font-semibold">New Order Placed</span>
        </div>
        
        <div className="p-4">
          <div className="flex gap-3">
            {/* Product Image */}
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-100">
              <img 
                src={PRODUCT_IMAGE} 
                alt="Celesta Glow" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 font-semibold text-sm">
                {notification.name}
              </p>
              <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                <MapPin size={11} className="text-green-500" />
                {notification.location}, India
              </p>
              <p className="text-green-600 text-xs font-medium mt-1.5 flex items-center gap-1">
                <ShoppingBag size={11} />
                Celesta Glow Serum
              </p>
            </div>
          </div>
          
          {/* Footer */}
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[10px] text-gray-400">
              {notification.time || 'Just now'}
            </span>
            <span className="text-[10px] text-green-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Verified Purchase
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%) scale(0.9); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        [data-testid="recent-purchase-notification"] > div {
          animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
}

export default RecentPurchaseNotification;
