import React, { useState, useEffect, useRef } from 'react';
import { MapPin, ShoppingBag, CheckCircle, Sparkles } from 'lucide-react';

// User's custom notification sound
const NOTIFICATION_SOUND_URL = 'https://customer-assets.emergentagent.com/job_26148967-6968-4918-8b5d-0a2c0e5259b2/artifacts/sa3jziee_universfield-new-notification-057-494255.mp3';

// Product image
const PRODUCT_IMAGE = 'https://customer-assets.emergentagent.com/job_26148967-6968-4918-8b5d-0a2c0e5259b2/artifacts/ccpjeqd2_IMG_9115.png';

// 50+ unique authentic names
const ALL_NAMES = [
  "Ritika", "Tanisha", "Neha", "Sanya", "Kriti", "Aditi", "Nisha", "Pooja",
  "Megha", "Shruti", "Divya", "Tanya", "Swati", "Rashmi", "Snehal", "Pallavi",
  "Prerna", "Ishita", "Aanya", "Riya", "Kiara", "Anushka", "Mira", "Saanvi",
  "Avni", "Diya", "Kavya", "Myra", "Zara", "Aisha", "Navya", "Shanaya",
  "Anika", "Ira", "Pari", "Ahana", "Trisha", "Vanya", "Reena", "Komal",
  "Jiya", "Sana", "Preeti", "Radhika", "Simran", "Kajal", "Shweta", "Sonam",
  "Mansi", "Garima", "Deepa", "Richa", "Archana", "Bhavna", "Chandni", "Damini"
];

// All Indian cities
const ALL_LOCATIONS = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata",
  "Jaipur", "Ahmedabad", "Lucknow", "Kerala", "Chandigarh", "Indore", "Nagpur",
  "Surat", "Gurgaon", "Noida", "Thane", "Vadodara", "Coimbatore", "Bhopal",
  "Visakhapatnam", "Patna", "Ludhiana", "Agra", "Nashik", "Rajkot", "Varanasi"
];

function RecentPurchaseNotification() {
  const [notification, setNotification] = useState(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [usedNames, setUsedNames] = useState([]);
  const audioRef = useRef(null);
  
  const notificationCountRef = useRef(0);
  const MAX_NOTIFICATIONS = 5;
  const FIRST_DELAY = 5000; // 5 seconds for first notification
  const MIN_INTERVAL = 15000;
  const MAX_INTERVAL = 20000;

  useEffect(() => {
    audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
    audioRef.current.volume = 0.3;
    
    // Check if new user using localStorage (persists across sessions)
    const hasVisitedBefore = localStorage.getItem('celestaVisitor');
    if (!hasVisitedBefore) {
      setIsNewUser(true);
      localStorage.setItem('celestaVisitor', 'true');
    }
  }, []);

  const canShowNotification = () => notificationCountRef.current < MAX_NOTIFICATIONS;
  const getRandomInterval = () => MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  // Get unique name
  const getUniqueName = () => {
    const availableNames = ALL_NAMES.filter(name => !usedNames.includes(name));
    if (availableNames.length === 0) {
      setUsedNames([]);
      return ALL_NAMES[Math.floor(Math.random() * ALL_NAMES.length)];
    }
    const selectedName = availableNames[Math.floor(Math.random() * availableNames.length)];
    setUsedNames(prev => [...prev, selectedName]);
    return selectedName;
  };

  const getRandomLocation = () => ALL_LOCATIONS[Math.floor(Math.random() * ALL_LOCATIONS.length)];

  // Start notifications
  useEffect(() => {
    if (dismissed) return;
    if (sessionStorage.getItem('notifDismissed')) {
      setDismissed(true);
      return;
    }

    const startNotifications = () => {
      // For new users, show welcome first
      if (isNewUser && !sessionStorage.getItem('welcomeShown')) {
        setNotification({ type: 'welcome' });
        setVisible(true);
        notificationCountRef.current++;
        playSound();
        sessionStorage.setItem('welcomeShown', 'true');
        
        setTimeout(() => {
          setVisible(false);
          setTimeout(showOrderNotification, 3000);
        }, 5000);
      } else {
        // Returning user - directly show order notifications
        showOrderNotification();
      }
    };

    const timer = setTimeout(startNotifications, FIRST_DELAY);
    return () => clearTimeout(timer);
  }, [dismissed, isNewUser]);

  const showOrderNotification = () => {
    if (!canShowNotification() || dismissed) return;
    
    setNotification({
      type: 'order',
      name: getUniqueName(),
      location: getRandomLocation()
    });
    setVisible(true);
    notificationCountRef.current++;
    playSound();

    setTimeout(() => {
      setVisible(false);
      if (canShowNotification() && !dismissed) {
        setTimeout(showOrderNotification, getRandomInterval());
      }
    }, 5000);
  };

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    sessionStorage.setItem('notifDismissed', 'true');
  };

  if (!visible || !notification || dismissed) return null;

  // Welcome Notification (only for new users)
  if (notification.type === 'welcome') {
    return (
      <div 
        className="fixed top-20 right-3 z-50"
        data-testid="welcome-notification"
        onClick={handleDismiss}
      >
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-2xl overflow-hidden max-w-[280px] cursor-pointer hover:scale-[1.02] transition-all duration-300 text-white">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5" />
              <span className="font-bold text-sm">Welcome to Celesta Glow!</span>
            </div>
            <p className="text-sm opacity-95 leading-relaxed">
              India's #1 Anti-Aging Serum trusted by 50,000+ women. Discover your younger-looking skin today!
            </p>
            <div className="mt-3 pt-3 border-t border-white/20 text-xs opacity-80">
              ✨ Clinically Proven • Free Delivery • 30-Day Guarantee
            </div>
          </div>
        </div>
        <style>{`
          @keyframes slideIn { from { opacity: 0; transform: translateX(100%) scale(0.9); } to { opacity: 1; transform: translateX(0) scale(1); } }
          [data-testid="welcome-notification"] > div { animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        `}</style>
      </div>
    );
  }

  // Order Notification - Clean, simple, no numbers
  return (
    <div 
      className="fixed top-20 right-3 z-50"
      data-testid="recent-purchase-notification"
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-w-[280px] cursor-pointer hover:scale-[1.02] transition-all duration-300"
        onClick={handleDismiss}
      >
        {/* Simple green header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-white" />
          <span className="text-white text-xs font-semibold">New Order Placed</span>
        </div>
        
        <div className="p-4">
          <div className="flex gap-3">
            {/* Product Image */}
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-white border border-gray-100">
              <img 
                src={PRODUCT_IMAGE} 
                alt="Celesta Glow" 
                className="w-full h-full object-contain"
              />
            </div>
            
            {/* Content - Simple, authentic */}
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 font-semibold text-sm">
                {notification.name}
              </p>
              <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                <MapPin size={11} className="text-green-500" />
                {notification.location}
              </p>
              <p className="text-green-600 text-xs font-medium mt-1.5 flex items-center gap-1">
                <ShoppingBag size={11} />
                Celesta Glow Serum
              </p>
            </div>
          </div>
          
          {/* Footer */}
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[10px] text-gray-400">Just now</span>
            <span className="text-[10px] text-green-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Verified Purchase
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateX(100%) scale(0.9); } to { opacity: 1; transform: translateX(0) scale(1); } }
        [data-testid="recent-purchase-notification"] > div { animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
}

export default RecentPurchaseNotification;
