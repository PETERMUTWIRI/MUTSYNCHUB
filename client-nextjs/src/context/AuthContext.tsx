"use client";

import { StackProvider, StackClientApp } from '@stackframe/react';
import { useRouter }from 'next/navigation';
import React from 'react';

const stackClientApp = new StackClientApp({
  projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID!,
  publishableKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY!,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();

  return (
    <StackProvider app={stackClientApp} router={router}>
      {children}
    </StackProvider>
  );
};