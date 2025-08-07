"use client";

import { StackProvider, StackClientApp } from '@stackframe/stack';
import React from 'react';

export const stackClientApp = new StackClientApp({
  projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID!,
  publishableClientKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY!,
  tokenStore: "cookie",
  
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <StackProvider app={stackClientApp}>
      {children}
    </StackProvider>
  );
};