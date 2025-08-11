'use client';

import { useUser as useStackUser } from '@stackframe/stack';
import type { CurrentUser } from '@stackframe/stack'; // optional if available

type AnyStackUser = CurrentUser | Record<string, any> | undefined | null;

function extractClientMetadata(user: AnyStackUser): Record<string, any> | null {
  if (!user) return null;

  // Preferred (matches SDK types)
  if ('clientMetadata' in user && typeof (user as any).clientMetadata === 'object') {
    return (user as any).clientMetadata;
  }

  // Defensive: in case some service sets snake_case
  if ('client_metadata' in user && typeof (user as any).client_metadata === 'object') {
    return (user as any).client_metadata;
  }

  return null;
}

export function useNeonUser() {
  // stackUser will be `undefined` while loading (per SDK behavior)
  const stackUser = useStackUser() as AnyStackUser;

  const loading = stackUser === undefined;
  const isAuthenticated = !!stackUser && !!(stackUser as any).id;
  

  // 1) Check top-level role claim (if you add it server-side)
  const topRole = (stackUser as any)?.role ?? (stackUser as any)?.claims?.role ?? null;

  // 2) Else try clientMetadata (camelCase) OR client_metadata (snake_case)
  const clientMeta = extractClientMetadata(stackUser);
  const metaRole =
    clientMeta?.role ??
    (Array.isArray(clientMeta?.roles) ? clientMeta.roles[0] : undefined) ??
    null;

  const role = (topRole as string) ?? (metaRole as string | null);
  const isAdmin = role?.toLowerCase() === "admin";
  return {
    user: stackUser ?? null,
    role,
    loading,
    isAuthenticated,
    isAdmin
  };
}
