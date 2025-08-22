'use client';

import DashboardSidebar from '@/components/user/DashboardSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import UserLayout from '@/components/UserLayout';

export default function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="user">
      <UserLayout>
        <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800">
          <DashboardSidebar />
          <main className="flex-1 p-8">{children}</main>
        </div>
      </UserLayout>
    </ProtectedRoute>
  );
}