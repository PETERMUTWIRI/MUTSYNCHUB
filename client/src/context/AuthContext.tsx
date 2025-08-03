import React from 'react';
import { StackAuthProvider } from '@stack-auth/react';
import { stackAuth } from '@/lib/stack-auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <StackAuthProvider client={stackAuth}>
      {children}
    </StackAuthProvider>
  );
};
