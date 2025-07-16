import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/api';
import { exchangeSupabaseJwt } from '@/lib/exchange';
import { decodeJwt } from '@/lib/jwtDecode';

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
      // Disabled exchangeSupabaseJwt for dashboard dev; fallback to localStorage only
      const backendJwt = localStorage.getItem('backend_jwt');
      if (backendJwt) {
        const decoded = decodeJwt(backendJwt);
        if (decoded) {
          setToken(backendJwt);
          setUser({
            id: decoded.sub || decoded.id || '',
            supabaseId: decoded.supabaseId || decoded.sub || '',
            orgId: decoded.tenant_id || decoded.orgId || decoded.organizationId || '',
            tenant_id: decoded.tenant_id || '',
            token: backendJwt,
            name: decoded.name || '',
            email: decoded.email || '',
            role: (decoded.role || 'user').toUpperCase(),
            plan: decoded.plan || decoded.subscriptionTier || 'basic',
          });
          localStorage.setItem('tenant_id', decoded.tenant_id || decoded.orgId || decoded.organizationId || '');
        } else {
          setUser(null);
          setToken(null);
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

