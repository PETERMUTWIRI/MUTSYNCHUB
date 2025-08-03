import { StackProvider, StackTheme } from '@stackframe/react';
import { stackAuth } from '@/lib/stack-auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <StackProvider app={stackAuth}>
      <StackTheme>
        {children}
      </StackTheme>
    </StackProvider>
  );
};
