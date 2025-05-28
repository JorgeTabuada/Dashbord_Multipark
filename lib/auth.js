// import { supabase } from './supabaseClient'; // This will be used when Supabase is configured

/**
 * Logs in a user with email and password.
 * For now, this is a placeholder and does not actually call Supabase.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<{ data: any, error: any }>} - An object containing data or error.
 */
export const loginUser = async (email, password) => {
  console.log('Attempting to log in user:', email); // Placeholder log

  // Placeholder logic for now:
  if (email && password) {
    // Simulate a successful login for demonstration if needed,
    // but the primary simulation is in pages/index.js for now.
    return { data: { user: { id: 'mock-user-id', email: email }, session: { access_token: 'mock-token'} }, error: null };
  } else {
    return { data: null, error: { message: 'Email and password are required.' } };
  }
};

/**
 * Logs out the current user.
 * Clears user-related data from localStorage and redirects to the login page.
 * @param {object} router - The Next.js router instance for redirection.
 * @returns {Promise<{ error: any }>} - An object containing an error if one occurred (currently always null).
 */
export const logoutUser = async (router) => {
  console.log('Logging out user...');

  // For Supabase: await supabase.auth.signOut();
  
  localStorage.removeItem('user_id');
  localStorage.removeItem('user_full_name');
  localStorage.removeItem('user_role');
  localStorage.removeItem('user_parque_id_principal');
  
  console.log('User data cleared from localStorage.');

  if (router) {
    router.push('/');
  } else {
    if (typeof window !== 'undefined') {
      window.location.pathname = '/';
    }
  }
  return { error: null }; // Placeholder return
};

/**
 * Checks for an active user session by looking for 'user_id' in localStorage.
 * @returns {object|null} - The user data object if session is active, otherwise null.
 */
export const checkUserSession = () => {
  if (typeof window === 'undefined') {
    // localStorage is not available on the server.
    // This function is intended for client-side session checks.
    return null; 
  }

  const userId = localStorage.getItem('user_id');
  
  if (userId) {
    console.log('Active session found for user_id:', userId);
    return {
      id: userId,
      fullName: localStorage.getItem('user_full_name'),
      role: localStorage.getItem('user_role'),
      parkId: localStorage.getItem('user_parque_id_principal'),
    };
  } else {
    console.log('No active session found.');
    return null;
  }
};

/**
 * Gets the current user from the session (simulated via localStorage).
 * DEPRECATED: Use checkUserSession for clarity in session checking.
 * This function is kept for compatibility if still used elsewhere but should be phased out.
 * @returns {Promise<any>} - The user object or null.
 */
export const getCurrentUser = async () => {
  console.warn('getCurrentUser is deprecated. Use checkUserSession for synchronous client-side checks.');
  if (typeof window !== 'undefined') {
    const userId = localStorage.getItem('user_id');
    if (userId) {
      return {
        id: userId,
        fullName: localStorage.getItem('user_full_name'),
        role: localStorage.getItem('user_role'),
        parkId: localStorage.getItem('user_parque_id_principal'),
      };
    }
  }
  return null;
};
