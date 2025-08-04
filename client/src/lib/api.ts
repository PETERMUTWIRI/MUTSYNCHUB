import axios from 'axios';

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

// No manual token logic needed for Neon Auth. Auth is handled via cookies/session.

export default api;