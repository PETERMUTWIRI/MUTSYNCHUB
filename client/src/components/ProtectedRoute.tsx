import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRoles }) => {
  const { user, loading } = useAuth();
  const supabaseId = localStorage.getItem('supabase_id');

  if (loading) return null; // or a spinner
  if (!user) return <Navigate to="/home" replace />;
  // User check: user.supabaseId must match localStorage supabase_id
  if (supabaseId && user.supabaseId && user.supabaseId !== supabaseId) {
    return <Navigate to="/home" replace />;
  }
  if (requiredRoles && !requiredRoles.includes(user.role)) {
    // Strict role-based redirects
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'USER') return <Navigate to="/analytics" replace />;
    return <Navigate to="/home" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
