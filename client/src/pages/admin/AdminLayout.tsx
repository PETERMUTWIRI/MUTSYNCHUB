import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-[260px] flex flex-col justify-between bg-[#232347] shadow-lg z-30">
        <div>
          <div className="flex items-center gap-3 px-6 py-8">
            <span className="text-2xl font-extrabold text-white tracking-wide">
              MH <span className="text-[var(--accent-amber,#FFA500)]">Admin</span>
            </span>
          </div>
          <nav className="flex flex-col gap-2 mt-6 px-2">
            <Link to="/admin" className="rounded-lg px-4 py-2 font-semibold text-gray-200 hover:bg-[#282A36]">Dashboard</Link>
            <Link to="/admin/users" className="rounded-lg px-4 py-2 font-semibold text-gray-200 hover:bg-[#282A36]">User Management</Link>
            <Link to="/admin/audit-logs" className="rounded-lg px-4 py-2 font-semibold text-gray-200 hover:bg-[#282A36]">Audit Logs</Link>
            <Link to="/admin/revenue" className="rounded-lg px-4 py-2 font-semibold text-gray-200 hover:bg-[#282A36]">Revenue</Link>
            <Link to="/admin/system-status" className="rounded-lg px-4 py-2 font-semibold text-gray-200 hover:bg-[#282A36]">System Status</Link>
            <Link to="/admin/settings" className="rounded-lg px-4 py-2 font-semibold text-gray-200 hover:bg-[#282A36]">System Settings</Link>
            <Link to="/admin/support" className="rounded-lg px-4 py-2 font-semibold text-gray-200 hover:bg-[#282A36]">Support</Link>
            <Link to="/admin/notifications" className="rounded-lg px-4 py-2 font-semibold text-gray-200 hover:bg-[#282A36]">Notifications</Link>
          </nav>
        </div>
      </aside>
      {/* Main Content */}
      <div className="flex-1 ml-[260px] min-h-screen bg-gradient-to-b from-[#321F61] to-[#1F224D] transition-all duration-300 flex flex-col items-center justify-start">
        {/* Header */}
        <header
          className="fixed left-[260px] right-0 top-0 h-[90px] flex items-center px-16 bg-transparent z-20"
          style={{ backdropFilter: 'blur(8px)' }}
        >
          <div className="flex-1 flex items-center gap-4">
            <h1 className="text-4xl font-extrabold text-white mr-8 tracking-wide">
              Admin Dashboard
            </h1>
          </div>
        </header>
        {/* Main Grid */}
        <main className="pt-[110px] pb-16 px-16 w-full max-w-5xl min-h-screen flex flex-col gap-12 items-center justify-start">
          <React.Suspense fallback={<div className="w-full flex justify-center items-center h-40"><span className="text-lg text-white animate-pulse">Loading...</span></div>}>
            <Outlet />
          </React.Suspense>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
