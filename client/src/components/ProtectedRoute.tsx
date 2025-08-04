
import { StackHandler } from '@stackframe/react';
import { useLocation } from 'react-router-dom';
import { stackClientApp } from '@/lib/stack-auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  // StackHandler will handle auth and show sign-in if needed
  return (
    <>
      <StackHandler app={stackClientApp} location={location.pathname} fullPage={false} />
      {children}
    </>
  );
};

export default ProtectedRoute;
