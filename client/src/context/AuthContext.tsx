import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/api';

export interface User {
  id: string;
  orgId: string;
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


  // Load user data from Supabase session
  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      const { data: { session } } = await import('@/lib/supabase').then(m => m.supabase.auth.getSession());
      const token = session?.access_token || null;
      setToken(token);
      if (token) {
        api.get('/auth/profile')
          .then(res => {
            if (!isMounted) return;
            setUser({
              ...res.data,
              token,
              orgId: res.data.orgId || res.data.organizationId || '',
              plan: res.data.plan || res.data.subscriptionTier || 'basic',
              role: (res.data.role || 'user').toUpperCase(),
            });
            localStorage.setItem('tenant_id', res.data.orgId || res.data.organizationId || '');
          })
          .catch(() => {
            if (!isMounted) return;
            setUser(null);
            setToken(null);
          })
          .finally(() => { if (isMounted) setLoading(false); });
      } else {
        setUser(null);
        setToken(null);
        setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, token, setToken, loading }}>
      {children}
    </AuthContext.Provider>
  );
};