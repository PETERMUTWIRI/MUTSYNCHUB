'use client';

import { ProfileCompletionBanner } from '@/components/profile-completion-banner';
import { useUser } from '@stackframe/stack';
import { Suspense, useState } from 'react';
import dynamic from 'next/dynamic';
import { Toaster } from 'react-hot-toast';
import { AiOutlineMenu } from 'react-icons/ai'; // hamburger

const DashboardSidebar = dynamic(() => import('@/components/user/DashboardSidebar'));

export default function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = useUser({ or: 'redirect' });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen w-full bg-[#1E2A44] text-white font-inter">
      {/* Sidebar */}
  <DashboardSidebar onToggle={setSidebarOpen} />

      {/* Main area – CSS grid auto-resizes when sidebar collapses */}
      <main className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Banner inside main → respects sidebar width */}
        <ProfileCompletionBanner />

        {/* Top bar with hamburger */}
        <div className="flex items-center justify-between p-4 border-b border-[#2E7D7D]/30">
          <button onClick={() => setSidebarOpen((s) => !s)} className="lg:hidden text-teal-400 hover:text-white">
            <AiOutlineMenu className="w-6 h-6" />
          </button>
          <div className="flex-1" />
          <span className="text-sm text-gray-300">Hello, {user.displayName || 'User'}</span>
        </div>

        {/* Page content */}
        <div className="flex-1 p-8 w-full max-w-7xl mx-auto">
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2E7D7D]"></div></div>}>
            {children}
          </Suspense>
        </div>
      </main>

      <Toaster position="top-right" />
    </div>
  );
}