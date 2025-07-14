import React from 'react';
import SendNotificationForm from './components/SendNotificationForm';
import SentNotificationsList from './components/SentNotificationsList';

const NotificationsPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-[220px] flex flex-col justify-between bg-[#232347] shadow-lg z-30">
        <div>
          <div className="flex items-center gap-3 px-6 py-8">
            <span className="text-2xl font-extrabold text-white tracking-wide">
              MH <span className="text-[var(--accent-amber,#FFA500)]">Admin</span>
            </span>
          </div>
          <nav className="flex flex-col gap-2 mt-6 px-2">
            <a href="/admin" className="rounded-lg px-4 py-2 font-semibold text-gray-200 hover:bg-[#282A36]">
              Dashboard
            </a>
            <a href="/admin/users" className="rounded-lg px-4 py-2 font-semibold text-gray-200 hover:bg-[#282A36]">
              User Management
            </a>
            <a href="/admin/audit-logs" className="rounded-lg px-4 py-2 font-semibold text-gray-200 hover:bg-[#282A36]">
              Audit Logs
            </a>
            <a href="/admin/revenue" className="rounded-lg px-4 py-2 font-semibold text-gray-200 hover:bg-[#282A36]">
              Revenue
            </a>
            <a href="/admin/system-status" className="rounded-lg px-4 py-2 font-semibold text-gray-200 hover:bg-[#282A36]">
              System Status
            </a>
            <a href="/admin/settings" className="rounded-lg px-4 py-2 font-semibold text-gray-200 hover:bg-[#282A36]">
              System Settings
            </a>
            <a href="/admin/support" className="rounded-lg px-4 py-2 font-semibold text-gray-200 hover:bg-[#282A36]">
              Support
            </a>
            <a href="/admin/notifications" className="rounded-lg px-4 py-2 font-semibold text-white bg-[var(--accent-amber,#FFA500)]">
              Notifications
            </a>
          </nav>
        </div>
      </aside>
      {/* Main Content */}
      <div className="flex-1 ml-[220px] min-h-screen bg-gradient-to-b from-[#321F61] to-[#1F224D] transition-all duration-300">
        {/* Header */}
        <header
          className="fixed left-[220px] right-0 top-0 h-[76px] flex items-center px-12 bg-transparent z-20"
          style={{ backdropFilter: 'blur(8px)' }}
        >
          <div className="flex-1 flex items-center gap-4">
            <h1 className="text-3xl font-bold text-white mr-8">
              Notifications
            </h1>
          </div>
        </header>
        {/* Main Grid */}
        <main className="pt-[100px] pb-12 px-12 w-full min-h-screen flex flex-col gap-8">
          <SendNotificationForm />
          <SentNotificationsList />
        </main>
      </div>
    </div>
  );
};

export default NotificationsPage;
