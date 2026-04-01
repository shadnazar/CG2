import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, ShoppingBag, CheckCircle, Sparkles, X, Star } from 'lucide-react';

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

// Configuration
const MAX_NOTIFICATIONS = 5;
const FIRST_DELAY = 5000;
const MIN_INTERVAL = 15000;
const MAX_INTERVAL = 20000;
const DISPLAY_DURATION = 6000;

function RecentPurchaseNotification() {
  const [notification, setNotification] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const usedNamesRef = useRef([]);
  const audioRef = useRef(null);
  const notificationCountRef = useRef(0);
  const timeoutRef = useRef(null);
  const dismissedRef = useRef(false);
  const isNewUserRef = useRef(false);
  
  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
    audioRef.current.volume = 0.3;
    
    // Check if new user
    if (!localStorage.getItem('celestaVisitor')) {
      isNewUserRef.current = true;
      localStorage.setItem('celestaVisitor', 'true');
    }
    
    // Check if dismissed this session
    if (sessionStorage.getItem('notifDismissed')) {
      dismissedRef.current = true;
    }
    
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const playSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, []);

  const getUniqueName = useCallback(() => {
    const availableNames = ALL_NAMES.filter(name => !usedNamesRef.current.includes(name));
    if (availableNames.length === 0) {
      usedNamesRef.current = [];
      return ALL_NAMES[Math.floor(Math.random() * ALL_NAMES.length)];
    }
    const selectedName = availableNames[Math.floor(Math.random() * availableNames.length)];
    usedNamesRef.current.push(selectedName);
    return selectedName;
  }, []);

  const getRandomLocation = useCallback(() => {
    return ALL_LOCATIONS[Math.floor(Math.random() * ALL_LOCATIONS.length)];
  }, []);

  // Show order notification
  const showOrder = useCallback(() => {
    if (dismissedRef.current || notificationCountRef.current >= MAX_NOTIFICATIONS) return;
    
    const newNotif = {
      type: 'order',
      name: getUniqueName(),
      location: getRandomLocation(),
      id: Date.now()
    };
    
    setNotification(newNotif);
    setIsVisible(true);
    notificationCountRef.current++;
    playSound();
    
    // Schedule hide and next
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      setNotification(null);
      
      // Schedule next if not max
      if (!dismissedRef.current && notificationCountRef.current < MAX_NOTIFICATIONS) {
        const nextDelay = MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL);
        timeoutRef.current = setTimeout(showOrder, nextDelay);
      }
    }, DISPLAY_DURATION);
  }, [getUniqueName, getRandomLocation, playSound]);

  // Show welcome notification
  const showWelcome = useCallback(() => {
    if (dismissedRef.current) return;
    
    setNotification({ type: 'welcome', id: Date.now() });
    setIsVisible(true);
    notificationCountRef.current++;
    playSound();
    sessionStorage.setItem('welcomeShown', 'true');
    
    // Hide welcome, then show orders
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      setNotification(null);
      
      // Start order notifications after 3 seconds
      if (!dismissedRef.current) {
        timeoutRef.current = setTimeout(showOrder, 3000);
      }
    }, DISPLAY_DURATION);
  }, [playSound, showOrder]);

  // Start notification sequence
  useEffect(() => {
    if (dismissedRef.current) return;
    
    const startTimer = setTimeout(() => {
      if (isNewUserRef.current && !sessionStorage.getItem('welcomeShown')) {
        showWelcome();
      } else {
        showOrder();
      }
    }, FIRST_DELAY);
    
    return () => clearTimeout(startTimer);
  }, [showWelcome, showOrder]);

  const handleDismiss = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
    setNotification(null);
    dismissedRef.current = true;
    sessionStorage.setItem('notifDismissed', 'true');
  }, []);

  // Don't render if not visible
  if (!isVisible || !notification) {
    return null;
  }

  // Welcome Notification
  if (notification.type === 'welcome') {
    return (
      <div 
        key={notification.id}
        className="fixed top-20 right-4 z-[9999] animate-slide-in"
        data-testid="welcome-notification"
      >
        <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl shadow-2xl overflow-hidden w-[300px] text-white relative border border-green-400/30">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer"></div>
          
          <button 
            onClick={handleDismiss}
            className="absolute top-3 right-3 w-7 h-7 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all hover:scale-110 z-10"
            data-testid="close-notification-btn"
          >
            <X size={16} className="text-white" />
          </button>
          
          <div className="p-5 pr-12">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-bold text-base">Welcome to Celesta Glow!</span>
            </div>
            <p className="text-sm opacity-95 leading-relaxed">
              India's #1 Anti-Aging Serum trusted by 50,000+ women. Discover your younger-looking skin today!
            </p>
            <div className="mt-4 pt-3 border-t border-white/20 flex items-center gap-3 text-xs opacity-90">
              <span className="flex items-center gap-1">
                <CheckCircle size={12} /> Clinically Proven
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle size={12} /> Free Delivery
              </span>
            </div>
          </div>
        </div>
        
        <style>{`
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(100px) scale(0.9); }
            to { opacity: 1; transform: translateX(0) scale(1); }
          }
          @keyframes shimmer {
            to { transform: translateX(200%); }
          }
          .animate-slide-in { animation: slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .animate-shimmer { animation: shimmer 2s infinite; }
        `}</style>
      </div>
    );
  }

  // Order Notification
  return (
    <div 
      key={notification.id}
      className="fixed top-20 right-4 z-[9999] animate-slide-in"
      data-testid="recent-purchase-notification"
    >
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-[300px] relative border border-gray-200">
        <button 
          onClick={handleDismiss}
          className="absolute top-2.5 right-3 w-6 h-6 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all hover:scale-110 z-10"
          data-testid="close-notification-btn"
        >
          <X size={14} className="text-white" />
        </button>
        
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2.5 pr-10 flex items-center gap-2">
          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
          <span className="text-white text-sm font-semibold">New Order Placed</span>
        </div>
        
        <div className="p-4">
          <div className="flex gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-100 p-1">
              <img 
                src={PRODUCT_IMAGE} 
                alt="Celesta Glow Serum" 
                className="w-full h-full object-contain"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 font-bold text-base truncate">
                {notification.name}
              </p>
              <p className="text-gray-500 text-sm flex items-center gap-1.5 mt-1">
                <MapPin size={14} className="text-green-500 flex-shrink-0" />
                <span className="truncate">{notification.location}</span>
              </p>
              <p className="text-green-600 text-sm font-medium mt-2 flex items-center gap-1.5">
                <ShoppingBag size={14} />
                Celesta Glow Serum
              </p>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={11} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-[10px] text-gray-400">Just now</span>
            </div>
            <span className="text-[10px] text-green-600 font-medium flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Verified
            </span>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100px) scale(0.9); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        .animate-slide-in { animation: slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}

export default RecentPurchaseNotification;
