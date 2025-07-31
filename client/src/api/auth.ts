
import api from '../lib/api';

// Call this after successful Supabase signup/login
export const syncWithBackend = async () => {
  return api.post('/auth/sync');
};
