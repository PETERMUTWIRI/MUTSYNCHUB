'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@stackframe/stack';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const user = useUser({ or: 'redirect' } as any);
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check cached user data with expiration
  useEffect(() => {
    const cachedUserData = localStorage.getItem('userSession');
    if (cachedUserData) {
      const parsedData = JSON.parse(cachedUserData);
      // Check if cache is still valid
      if (parsedData.expiresAt && parsedData.expiresAt > Date.now()) {
        setRole(parsedData.role?.toLowerCase());
        setLoading(false);
      } else {
        // Clear expired cache
        localStorage.removeItem('userSession');
      }
    }
  }, []);

  // Fetch user role from backend
  useEffect(() => {
    let mounted = true;

    async function fetchUserData() {
      if (!user || !mounted) return;

      try {
        console.log('ProtectedRoute: Attempting to get accessToken');
        const { accessToken } = await user.getAuthJson();
        console.log('ProtectedRoute: Access token retrieved:', accessToken ? 'Present' : 'Missing');
        const fetchUrl = '/api/users/me';
        const res = await fetch(fetchUrl, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'x-stack-access-token': accessToken ?? '',
            'Authorization': `Bearer ${accessToken ?? ''}`,
            'Accept': 'application/json',
          },
        });
        const responseText = await res.text();
        console.debug('ProtectedRoute:', fetchUrl, 'status=', res.status, 'response=', responseText);
        if (!mounted) return;
        if (!res.ok) {
          throw new Error(`Backend error ${res.status}: ${responseText}`);
        }
        const ct = res.headers.get('content-type') || '';
        const json = ct.includes('application/json') ? JSON.parse(responseText) : responseText;

        const fetchedRole = json?.role?.toLowerCase();
        if (mounted) {
          setRole(fetchedRole);
          // Cache user data with expiration
          localStorage.setItem('userSession', JSON.stringify({
            role: fetchedRole,
            expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour
          }));
        }
      } catch (err: any) {
        console.error('ProtectedRoute Error:', err.message, err.stack);
        if (mounted) setError(err.message || String(err));
        localStorage.removeItem('userSession');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (user && !role) {
      fetchUserData();
    }

    return () => {
      mounted = false;
    };
  }, [user, role]);

  // Role-based access control
  useEffect(() => {
    if (loading || !user || !role) return;
    if (requiredRole && role !== requiredRole) {
      if (role === 'admin') router.replace('/admin-dashboard');
      else if (role === 'user') router.replace('/user-dashboard-main');
      else router.replace('/');
    }
  }, [user, loading, role, requiredRole, router]);

  if (loading) return <div className="text-center text-gray-400">Loading...</div>;
  if (error) return <div className="text-center text-red-400">{error}</div>;

  return <>{children}</>;
}