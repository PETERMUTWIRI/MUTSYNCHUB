
'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import UserLayout from '@/components/UserLayout';
import DashboardSidebar from '@/components/user/DashboardSidebar';
import { motion } from 'framer-motion';

export default function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="user">
      <UserLayout>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex min-h-screen w-full bg-slate-950 text-gray-100 font-sans"
        >
          <DashboardSidebar />
          <main className="flex-1 p-8">{children}</main>
        </motion.div>
      </UserLayout>
    </ProtectedRoute>
  );
}
