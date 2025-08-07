import { useUser } from '@stackframe/stack';

/**
 * Custom hook to get Neon Auth user and role from StackProvider context.
 * Returns: { user, isAuthenticated, isAdmin, isLoading, role }
 */
export function useNeonUser() {
  // Get the user from the Stack context
  const user = useUser();
  const isLoading = user === undefined;
  const isAuthenticated = !!user && !!user.id;
  // Try to extract role from client_metadata (set by backend on JWT)
  let role: string | undefined = undefined;
  if (user && user.clientMetadata) {
    if (typeof user.clientMetadata === 'object') {
      if ('role' in user.clientMetadata && typeof user.clientMetadata.role === 'string') {
        role = user.clientMetadata.role;
      } else if ('roles' in user.clientMetadata && Array.isArray(user.clientMetadata.roles)) {
        role = user.clientMetadata.roles[0];
      }
    }
  }
  const isAdmin = role === 'admin' || role === 'superadmin';
  return { user, isAuthenticated, isAdmin, isLoading, role };
}
