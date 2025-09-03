import React from 'react';
import { StackProvider } from '@stackframe/react';
import { stackClientApp } from '@/lib/stack-auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <StackProvider app={stackClientApp}>
      {children}
    </StackProvider>
  );
};