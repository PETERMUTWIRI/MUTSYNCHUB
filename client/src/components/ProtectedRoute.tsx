import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // or a spinner
  if (!user) return <Navigate to="/home" replace />;
  if (requiredRoles && !requiredRoles.includes(user.role)) {
    // Optionally redirect based on role
    if (user.role === 'ADMIN') return <Navigate to="/analytics" replace />;
    if (user.role === 'OWNER') return <Navigate to="/analytics" replace />;
    return <Navigate to="/home" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
