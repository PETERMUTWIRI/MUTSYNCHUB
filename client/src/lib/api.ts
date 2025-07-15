
import axios from 'axios';
import { supabase } from './supabase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ||
    'https://turbo-zebra-69pq7r6g59g63qw9-5173-5000.app.github.dev/api', // <-- add /api
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
  // Only send Supabase JWT for /auth/exchange
  if (config.url?.includes('/auth/exchange')) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers['Authorization'] = `Bearer ${session.access_token}`;
    }
  } else {
    // For all other requests, use backend JWT from localStorage
    const backendJwt = localStorage.getItem('backend_jwt');
    if (backendJwt) {
      config.headers['Authorization'] = `Bearer ${backendJwt}`;
    }
  }

  const tenantId = localStorage.getItem('tenant_id');
  if (tenantId) {
    config.headers['X-Tenant-ID'] = tenantId;
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
      console.error('❌ Network or CORS error', error.message);
    }

    if (error.response?.status === 401) {
      supabase.auth.signOut();
      const redirectUrl = encodeURIComponent(window.location.href);
      window.location.href = `/login?redirect=${redirectUrl}`;
    }

    return Promise.reject(error);
  }
);

export default api;