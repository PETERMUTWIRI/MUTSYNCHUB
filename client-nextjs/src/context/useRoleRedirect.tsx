// src/hooks/useRoleRedirect.tsx
'use client';

import { useUser } from '@stackframe/stack';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function useRoleRedirect() {
  const user = useUser();
  const userLoading = false; // Adjust this if useUser provides a loading state elsewhere
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleRoleBasedRedirect() {
      if (userLoading) {
        return; // Wait for user loading to complete
      }
      if (!user || isRedirecting) {
        console.log('useRoleRedirect: No user or already redirecting', { user, isRedirecting });
        setRole(null);
        setLoading(false);
        if (!user && pathname !== '/sign-in' && pathname !== '/auth/callback') {
          router.replace('/sign-in');
        }
        return;
      }

      try {
        setIsRedirecting(true);
        const res = await fetch('/api/get-user-role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        });
        const { role, error } = await res.json();
        if (!res.ok) {
          throw new Error(error || 'Failed to fetch role');
        }
        console.log('useRoleRedirect: Fetched role:', role);
        setRole(role);

        if (!role && pathname !== '/sign-in') {
          router.replace('/sign-in');
        } else if (pathname !== '/admin-dashboard' && pathname !== '/user-dashboard-main') {
          const roleLower = role?.toLowerCase();
          if (roleLower === 'admin') {
            router.replace('/admin-dashboard');
          } else if (roleLower === 'user') {
            router.replace('/user-dashboard-main');
          } else {
            console.warn('useRoleRedirect: Invalid role:', roleLower);
            router.replace('/sign-in');
          }
        }
      } catch (err: any) {
        console.error('useRoleRedirect Error:', err.message);
        setError(err.message);
        setRole(null);
        if (pathname !== '/sign-in' && pathname !== '/auth/callback') {
          router.replace('/sign-in');
        }
      } finally {
        setIsRedirecting(false);
        setLoading(false);
      }
    }

    // Add a small delay for /auth/callback to ensure useUser updates
    if (pathname === '/auth/callback') {
      const timer = setTimeout(handleRoleBasedRedirect, 500);
      return () => clearTimeout(timer);
    } else {
      handleRoleBasedRedirect();
    }
  }, [user, userLoading, router, pathname, isRedirecting]);

  return {
    user: user || null,
    role,
    isRedirecting,
    loading,
    error,
    isAuthenticated: !!user && !!role,
    isAdmin: role?.toLowerCase() === 'admin',
  };
}