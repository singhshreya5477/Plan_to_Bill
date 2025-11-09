/**
 * API Service - Base configuration for all API calls
 */

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Makes an API request with proper error handling
 * @param {string} endpoint - API endpoint (e.g., '/auth/login')
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Response data
 */
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export const api = {
  // GET request
  get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),

  // POST request
  post: (endpoint, body) =>
    apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // PUT request
  put: (endpoint, body) =>
    apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  // PATCH request
  patch: (endpoint, body) =>
    apiRequest(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  // DELETE request
  delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),
};

export default api;
