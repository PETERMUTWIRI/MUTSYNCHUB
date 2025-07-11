import { supabase } from './supabase';
import api from './api';

/**
 * Exchange Supabase JWT for backend JWT and user context
 */
export async function exchangeSupabaseJwt(): Promise<{ token: string; user: any } | null> {
  // 1. Get Supabase session
  const { data: { session } } = await supabase.auth.getSession();
  const supabaseToken = session?.access_token;
  if (!supabaseToken) return null;

  // 2. Call backend /auth/exchange
  const res = await api.post('/auth/exchange', { token: supabaseToken });
  if (res.data?.token && res.data?.user) {
    return { token: res.data.token, user: res.data.user };
  }
  return null;
}
