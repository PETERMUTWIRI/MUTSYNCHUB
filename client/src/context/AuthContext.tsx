import React, { createContext, useContext, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';
import { syncWithBackend } from '@/api/auth';

export interface User {
  id: string;
  supabaseId?: string;
  orgId: string;
  tenant_id?: string;
  token: string;
  name: string;
  email: string;
  role: string;
  plan: string;
}

export interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  token: string | null;
  setToken: (token: string | null) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  token: null,
  setToken: () => {},
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user data from backend JWT in localStorage
  useEffect(() => {
    setLoading(true);
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        setToken(session.access_token);
        try {
          // Call backend to sync and get user business data (from new Supabase context)
          const res = await syncWithBackend();
          if (res?.data?.user) {
            setUser(res.data.user);
            if (res.data.user.tenant_id || res.data.user.orgId) {
              localStorage.setItem('tenant_id', res.data.user.tenant_id || res.data.user.orgId);
            }
          } else {
            setUser(null);
          }
        } catch (err) {
          setUser(null);
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, token, setToken, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

