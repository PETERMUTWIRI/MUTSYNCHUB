import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 
          'https://humble-goggles-v65jg96wwqjwfwrg-5000.app.github.dev', // No /api at end
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

// Request Interceptor
api.interceptors.request.use(config => {
  // Read token from cookie
  const token = document.cookie.split('; ').find(row => row.startsWith('jwt_token='))?.split('=')[1];
  const tenantId = localStorage.getItem('tenant_id');

  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  if (tenantId) {
    config.headers = config.headers || {};
    config.headers['X-Tenant-ID'] = tenantId;
  }

  return config;
}, error => {
  console.error('Request Error:', error);
  return Promise.reject(error);
});

// Response Interceptor
api.interceptors.response.use(
  response => response,
  error => {
    // Enhanced CORS Error Handling
    if (!error.response) {
      const isCorsError = error.message === 'Network Error';
      const isTimeout = error.code === 'ECONNABORTED';
      
      if (isCorsError) {
        console.error(
          '🛑 CORS Error Detected\n' +
          `Frontend: ${window.location.origin}\n` +
          `Backend: ${import.meta.env.VITE_API_BASE_URL}\n` +
          'Verify:\n' +
          '1. Backend is running\n' +
          '2. Origins match exactly\n' +
          '3. No HTTPS mixed content'
        );
      }
      
      error.isCorsError = isCorsError;
      error.isTimeout = isTimeout;
    }

    // Handle specific error codes
    switch (error.response?.status) {
      case 401:
        handleUnauthorized();
        break;
      case 403:
        error.message = 'Access forbidden. Check your permissions.';
        break;
      case 429:
        error.message = 'Too many requests. Please wait.';
        break;
    }

    return Promise.reject(error);
  }
);

// Helper Functions
function handleUnauthorized() {
  localStorage.removeItem('jwt_token');
  const redirectUrl = encodeURIComponent(window.location.pathname + window.location.search);
  window.location.assign(`/login?redirect=${redirectUrl}`);
}

export default api;