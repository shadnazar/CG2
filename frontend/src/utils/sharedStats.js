/**
 * Shared state for live stats (viewers, sold today, location)
 * Synced across Homepage and Product page via localStorage
 */

// Indian states with approximate customer counts
const INDIAN_STATES = [
  { state: 'Delhi', customerCount: 2200 },
  { state: 'Mumbai', customerCount: 3100 },
  { state: 'Bangalore', customerCount: 2800 },
  { state: 'Chennai', customerCount: 1900 },
  { state: 'Hyderabad', customerCount: 2100 },
  { state: 'Kolkata', customerCount: 1700 },
  { state: 'Pune', customerCount: 1500 },
  { state: 'Ahmedabad', customerCount: 1200 },
  { state: 'Jaipur', customerCount: 900 },
  { state: 'Lucknow', customerCount: 800 },
  { state: 'Kerala', customerCount: 1400 },
  { state: 'Gujarat', customerCount: 1100 },
  { state: 'Chandigarh', customerCount: 600 },
  { state: 'Goa', customerCount: 400 },
  { state: 'Indore', customerCount: 500 },
];

// Get or initialize shared stats
export const getSharedStats = () => {
  const stored = sessionStorage.getItem('sharedStats');
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Initialize with default values
  const initial = {
    viewingNow: 23,
    soldToday: 47,
    locationIndex: 0,
    lastUpdate: Date.now()
  };
  sessionStorage.setItem('sharedStats', JSON.stringify(initial));
  return initial;
};

// Update shared stats
export const updateSharedStats = (updates) => {
  const current = getSharedStats();
  const updated = { ...current, ...updates, lastUpdate: Date.now() };
  sessionStorage.setItem('sharedStats', JSON.stringify(updated));
  return updated;
};

// Get current location (rotates through states)
export const getCurrentLocation = () => {
  const stats = getSharedStats();
  return INDIAN_STATES[stats.locationIndex % INDIAN_STATES.length];
};

// Rotate to next location
export const rotateLocation = () => {
  const stats = getSharedStats();
  const newIndex = (stats.locationIndex + 1) % INDIAN_STATES.length;
  updateSharedStats({ locationIndex: newIndex });
  return INDIAN_STATES[newIndex];
};

// Update viewing count (synced)
export const updateViewingNow = (delta) => {
  const stats = getSharedStats();
  const newValue = Math.max(15, Math.min(50, stats.viewingNow + delta));
  updateSharedStats({ viewingNow: newValue });
  return newValue;
};

// Get all states for reference
export const getAllStates = () => INDIAN_STATES;

export default {
  getSharedStats,
  updateSharedStats,
  getCurrentLocation,
  rotateLocation,
  updateViewingNow,
  getAllStates
};
