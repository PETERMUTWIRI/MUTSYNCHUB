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
      // Exchange Supabase JWT for backend JWT and user context
      const { exchangeSupabaseJwt } = await import('@/lib/exchange');
      const result = await exchangeSupabaseJwt();
      if (result && isMounted) {
        setToken(result.token);
        setUser({
          ...result.user,
          token: result.token,
          orgId: result.user.orgId || result.user.organizationId || '',
          plan: result.user.plan || result.user.subscriptionTier || 'basic',
          role: (result.user.role || 'user').toUpperCase(),
        });
        localStorage.setItem('tenant_id', result.user.orgId || result.user.organizationId || '');
      } else if (isMounted) {
        setUser(null);
        setToken(null);
      }
      if (isMounted) setLoading(false);
    })();
    return () => { isMounted = false; };
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, token, setToken, loading }}>
      {children}
    </AuthContext.Provider>
  );
};