
import axios from 'axios';
import { supabase } from './supabase';

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


// Request Interceptor using Supabase session
api.interceptors.request.use(async (config) => {
  // Send Supabase JWT for /api/auth/sync
  if (config.url?.includes('/auth/sync')) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers['Authorization'] = `Bearer ${session.access_token}`;
    }
  }



  // Debug
  console.log('🚀 Axios Request Headers:', config.headers);

  return config;
}, error => Promise.reject(error));


// Response Interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (!error.response) {
      // Only log network/CORS errors, do not redirect
      console.error('❌ Network or CORS error', error.message);
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      supabase.auth.signOut();
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