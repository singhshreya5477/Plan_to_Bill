/**
 * Authentication API Service
 */
import api from './api';

export const authService = {
  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User data and token
   */
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    
    if (response.success && response.data.token) {
      // Store token in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  },

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Response data
   */
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response;
  },

  /**
   * Verify email with OTP
   * @param {string} email - User email
   * @param {string} otp - Verification OTP
   * @returns {Promise<Object>} User data and token
   */
  verifyEmail: async (email, otp) => {
    const response = await api.post('/auth/verify-email', { email, otp });
    
    if (response.success && response.data.token) {
      // Store token in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  },

  /**
   * Resend verification OTP
   * @param {string} email - User email
   * @returns {Promise<Object>} Response data
   */
  resendOTP: async (email) => {
    return await api.post('/auth/resend-otp', { email });
  },

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<Object>} Response data
   */
  forgotPassword: async (email) => {
    return await api.post('/auth/forgot-password', { email });
  },

  /**
   * Reset password with OTP
   * @param {string} email - User email
   * @param {string} otp - Reset OTP
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Response data
   */
  resetPassword: async (email, otp, newPassword) => {
    return await api.post('/auth/reset-password', { email, otp, newPassword });
  },

  /**
   * Logout user
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Get current user from localStorage
   * @returns {Object|null} User object or null
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} True if authenticated
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

export default authService;
