import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // browser sends cookie
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

// No need for request interceptor to add token: cookie handles it

// Response interceptor for 401
api.interceptors.response.use(
  response => response,
  error => {
    if (!error.response) {
      console.error('❌ Network or CORS error', error.message);
      return Promise.reject(error);
    }
    if (error.response?.status === 401) {
      console.log('🔐 Unauthorized, consider logout or redirect');
      // optional: redirect or reload
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.href)}`;
    }
    return Promise.reject(error);
  }
);

export default api;
