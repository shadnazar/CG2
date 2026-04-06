/**
 * Admin Authentication Utilities
 * Uses sessionStorage with localStorage fallback for backward compatibility
 */

// Get admin token from sessionStorage, with localStorage fallback
export const getAdminToken = () => {
  // First check sessionStorage (primary)
  const sessionToken = sessionStorage.getItem('adminToken');
  if (sessionToken) return sessionToken;
  
  // Backward compatibility: check localStorage and migrate
  const localToken = localStorage.getItem('adminToken');
  if (localToken) {
    // Migrate to sessionStorage
    sessionStorage.setItem('adminToken', localToken);
    localStorage.removeItem('adminToken');
    return localToken;
  }
  
  return null;
};

// Set admin token in sessionStorage
export const setAdminToken = (token) => {
  sessionStorage.setItem('adminToken', token);
  localStorage.removeItem('adminToken'); // Clean up any old localStorage token
};

// Clear admin token from both storages
export const clearAdminToken = () => {
  sessionStorage.removeItem('adminToken');
  localStorage.removeItem('adminToken');
};

// Check if admin is authenticated
export const isAdminAuthenticated = () => {
  const token = getAdminToken();
  return token && token.length > 0;
};

// Admin logout helper
export const adminLogout = async (navigate, apiUrl) => {
  try {
    await fetch(`${apiUrl}/admin/logout`, {
      method: 'POST',
      credentials: 'include'
    });
  } catch (e) {
    // Ignore errors during logout
  }
  clearAdminToken();
  if (navigate) {
    navigate('/admin');
  }
};
