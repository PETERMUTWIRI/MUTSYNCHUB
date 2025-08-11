"use client";

import React from 'react';
import DashboardSidebar from '@/components/user/DashboardSidebar';
import ProtectedRoute from './ProtectedRoute';
import { useNeonUser } from '@/context/useNeonUser';
import UserLayout from '@/components/UserLayout';

export default function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading } = useNeonUser();
  return (
    <ProtectedRoute>
      <UserLayout user={user}>
        {children}
      </UserLayout>
    </ProtectedRoute>
  );
}
