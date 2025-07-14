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
            <Link to="/admin" className="rounded-lg px-4 py-2 font-semibold text-gray-200 hover:bg-[#282A36]">
              Dashboard
            </Link>
            <Link to="/admin/users" className="rounded-lg px-4 py-2 font-semibold text-gray-200 hover:bg-[#282A36]">
              User Management
            </Link>
            <Link to="/admin/audit-logs" className="rounded-lg px-4 py-2 font-semibold text-gray-200 hover:bg-[#282A36]">
              Audit Logs
            </Link>
            <Link to="/admin/revenue" className="rounded-lg px-4 py-2 font-semibold text-gray-200 hover:bg-[#282A36]">
              Revenue
            </Link>
            <Link to="/admin/system-status" className="rounded-lg px-4 py-2 font-semibold text-gray-200 hover:bg-[#282A36]">
              System Status
            </Link>
            <Link to="/admin/settings" className="rounded-lg px-4 py-2 font-semibold text-gray-200 hover:bg-[#282A36]">
              System Settings
            </Link>
            <Link to="/admin/support" className="rounded-lg px-4 py-2 font-semibold text-gray-200 hover:bg-[#282A36]">
              Support
            </Link>
            <Link to="/admin/notifications" className="rounded-lg px-4 py-2 font-semibold text-gray-200 hover:bg-[#282A36]">
              Notifications
            </Link>
          </nav>
        </div>
      </aside>
      {/* Main Content */}
      <div className="flex-1 ml-[260px] min-h-screen bg-gradient-to-b from-[#321F61] to-[#1F224D] transition-all duration-300">
        <main className="max-w-5xl mx-auto py-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
