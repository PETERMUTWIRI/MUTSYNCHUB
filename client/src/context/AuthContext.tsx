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

  useEffect(() => {
    // Try to load token from localStorage (or cookie, etc.)
    const storedToken = token || localStorage.getItem('jwt_token');
    if (storedToken) {
      setToken(storedToken);
      // Fetch user profile from backend
      api.get('/auth/profile')
        .then(res => {
          setUser({
            ...res.data,
            token: storedToken,
            orgId: res.data.orgId || res.data.organizationId || '',
            plan: res.data.plan || res.data.subscriptionTier || 'basic',
            role: (res.data.role || 'user').toUpperCase(),
          });
          // Persist tenant_id for multi-tenancy
          localStorage.setItem('tenant_id', res.data.orgId || res.data.organizationId || '');
        })
        .catch(() => setUser(null))
        .finally(() => setLoading(false));
  // Sync token to localStorage when it changes
  useEffect(() => {
    if (token) localStorage.setItem('jwt_token', token);
    else localStorage.removeItem('jwt_token');
  }, [token]);
    } else {
      setLoading(false);
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, setUser, token, setToken, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
