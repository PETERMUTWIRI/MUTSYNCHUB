import axios from 'axios';
import { stackAuth } from './stack-auth';

const api = axios.create({
  baseURL: '/api', // Use Vite proxy for all API calls
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

// Request Interceptor to add the auth token
api.interceptors.request.use(async (config) => {
  const session = await stackAuth.getSession();
  if (session?.token) {
    config.headers['Authorization'] = `Bearer ${session.token}`;
  }

  // Debug
  console.log('🚀 Axios Request Headers:', config.headers);

  return config;
}, error => Promise.reject(error));


// Response Interceptor to handle 401 errors
api.interceptors.response.use(
  response => response,
  error => {
    if (!error.response) {
      // Only log network/CORS errors, do not redirect
      console.error('❌ Network or CORS error', error.message);
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      stackAuth.signOut();
      // Prevent redirect loop if already on /login
      if (!window.location.pathname.startsWith('/login')) {
        const redirectUrl = encodeURIComponent(window.location.href);
        window.location.href = `/login?redirect=${redirectUrl}`;
      }
    }

    return Promise.reject(error);
  }
);

export default api;