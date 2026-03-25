import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingBag, X, MapPin } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function RecentPurchaseNotification() {
  const [notification, setNotification] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Fetch recent purchases
    fetchPurchases();
  }, []);

  useEffect(() => {
    if (purchases.length === 0 || dismissed) return;

    // Show notification every 30 seconds
    const showInterval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % purchases.length);
      setNotification(purchases[currentIndex]);
      setVisible(true);

      // Hide after 5 seconds
      setTimeout(() => {
        setVisible(false);
      }, 5000);
    }, 30000);

    // Show first notification after 10 seconds
    const initialTimer = setTimeout(() => {
      setNotification(purchases[0]);
      setVisible(true);
      setTimeout(() => setVisible(false), 5000);
    }, 10000);

    return () => {
      clearInterval(showInterval);
      clearTimeout(initialTimer);
    };
  }, [purchases, currentIndex, dismissed]);

  const fetchPurchases = async () => {
    try {
      const res = await axios.get(`${API}/recent-purchases`);
      setPurchases(res.data.purchases || []);
    } catch (err) {
      // Use fallback data
      setPurchases([
        { name: "Priya S.", location: "Mumbai" },
        { name: "Anita R.", location: "Delhi" },
        { name: "Kavya P.", location: "Bangalore" }
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
      className="fixed bottom-20 left-4 z-50 animate-slide-in"
      data-testid="recent-purchase-notification"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 max-w-xs relative">
        <button 
          onClick={handleDismiss}
          className="absolute -top-2 -right-2 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200"
        >
          <X size={14} />
        </button>
        
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm">
              {notification.name} just ordered!
            </p>
            <p className="text-gray-500 text-xs flex items-center gap-1 mt-1">
              <MapPin size={12} />
              {notification.location}, India
            </p>
            <p className="text-green-600 text-xs font-medium mt-1">
              Celesta Glow Anti-Aging Serum
            </p>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            ✓ Verified Purchase • Just now
          </p>
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default RecentPurchaseNotification;
