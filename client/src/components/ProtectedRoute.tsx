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
  // Always redirect to /admin after login for visual testing
  if (window.location.pathname !== '/admin') {
    return <Navigate to="/admin" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
