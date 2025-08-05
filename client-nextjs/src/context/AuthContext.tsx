"use client";

import { StackProvider, StackClientApp } from '@stackframe/stack';
import React from 'react';

const stackClientApp = new StackClientApp({
  projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID!,
  publishableKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY!,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <StackProvider app={stackClientApp}>
      {children}
    </StackProvider>
  );
};