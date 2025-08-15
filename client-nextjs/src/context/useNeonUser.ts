'use client';

import { useUser } from '@stackframe/stack';

export function useNeonUser() {
  const user = useUser();

  const loading = user === undefined;
  const isAuthenticated = !!user && !!user.id;

  // Prefer camelCase per official SDK types
  const clientMetadata = user?.clientMetadata ?? null;

  // Example: extract role if you store it in clientMetadata
  const role =
    (user as any)?.role ??
    clientMetadata?.role ??
    (Array.isArray(clientMetadata?.roles) ? clientMetadata.roles[0] : undefined) ??
    null;

  const isAdmin = typeof role === 'string' && role.toLowerCase() === 'admin';

  return {
    user: user ?? null,
    role,
    loading,
    isAuthenticated,
    isAdmin,
    clientMetadata,
  };
}