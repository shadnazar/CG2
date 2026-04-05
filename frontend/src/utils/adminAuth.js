/**
 * Admin Authentication Utilities
 * Uses sessionStorage instead of localStorage for better security
 * - sessionStorage is cleared when browser closes
 * - Not accessible via XSS attacks on localStorage
 */

// Get admin token from sessionStorage
export const getAdminToken = () => sessionStorage.getItem('adminToken');

// Set admin token in sessionStorage
export const setAdminToken = (token) => sessionStorage.setItem('adminToken', token);

// Clear admin token (logout)
export const clearAdminToken = () => sessionStorage.removeItem('adminToken');

// Check if admin is authenticated
export const isAdminAuthenticated = () => {
  const token = getAdminToken();
  return token && token.length > 0;
};

// Admin logout helper
export const adminLogout = async (navigate, apiUrl) => {
  try {
    // Call backend logout endpoint to clear httpOnly cookie
    await fetch(`${apiUrl}/admin/logout`, {
      method: 'POST',
      credentials: 'include'
    });
  } catch (e) {
    console.log('Logout cleanup failed, continuing...');
  }
  clearAdminToken();
  if (navigate) {
    navigate('/admin');
  }
};
