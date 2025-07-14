import React from "react";
import { Link } from 'react-router-dom';
import DataSources from '../components/admin/DataSources';
import NLQueries from '../components/admin/NLQueries';
import RevenuePanel from '../components/admin/RevenuePanel/RevenuePanel';
import Schedules from '../components/admin/Schedules';
import { useAuth } from '../hooks/useAuth';


const amber = "#FFA500";
const sidebarBg = "#232347";
const cardBg = "#1A1A2E";
const mainGradient = "bg-gradient-to-b from-[#321F61] to-[#1F224D]";

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen w-full flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-[220px] flex flex-col justify-between bg-[#232347] shadow-lg z-30">
        <div>
          <div className="flex items-center gap-3 px-6 py-8">
            {/* <img src={Logo} alt="MutSyncHub Logo" className="h-10 w-10" /> */}
            <span className="text-2xl font-extrabold text-white tracking-wide">
              MH{" "}
              <span className="text-[var(--accent-amber,#FFA500)]">Admin</span>
            </span>
          </div>
          <nav className="flex flex-col gap-2 mt-6 px-2">
            <Link to="/admin" className="rounded-lg px-4 py-2 font-semibold text-white bg-[var(--accent-amber,#FFA500)]">Dashboard</Link>
            <Link to="/admin/users" className="rounded-lg px-4 py-2 font-semibold text-gray-200 hover:bg-[#282A36]">User Management</Link>
            <Link to="/admin/audit-logs" className="rounded-lg px-4 py-2 font-semibold text-gray-200 hover:bg-[#282A36]">Audit Logs</Link>
            <Link to="/admin/revenue" className="rounded-lg px-4 py-2 font-semibold text-gray-200 hover:bg-[#282A36]">Revenue</Link>
            <Link to="/admin/system-status" className="rounded-lg px-4 py-2 font-semibold text-gray-200 hover:bg-[#282A36]">System Status</Link>
            <Link to="/admin/support" className="rounded-lg px-4 py-2 font-semibold text-gray-200 hover:bg-[#282A36]">Support</Link>
            <Link to="/admin/notifications" className="rounded-lg px-4 py-2 font-semibold text-gray-200 hover:bg-[#282A36]">Notifications</Link>
          </nav>
        </div>
        <div className="px-6 py-6 border-t border-[#282A36] flex items-center gap-3">
          {/* Admin avatar and info */}
          <div className="h-10 w-10 rounded-full bg-gray-600" />
          <div>
            <div className="text-white font-semibold">{user?.name || 'Admin'}</div>
            <div className="text-xs text-gray-400">User ID: {user?.supabaseId || 'N/A'}</div>
            <div className="text-xs text-gray-400">Tenant: {user?.tenant_id || user?.orgId || 'N/A'}</div>
            <div className="text-xs text-gray-400">Role: {user?.role || 'ADMIN'}</div>
          </div>
        </div>
      </aside>
      {/* Main Content */}
      <div
        className={`flex-1 ml-[220px] min-h-screen ${mainGradient} transition-all duration-300`}
      >
        {/* Header */}
        <header
          className="fixed left-[220px] right-0 top-0 h-[76px] flex items-center px-12 bg-transparent z-20"
          style={{ backdropFilter: "blur(8px)" }}
        >
          <div className="flex-1 flex items-center gap-4">
            <h1 className="text-3xl font-bold text-white mr-8">
              Admin Dashboard
            </h1>
            {/* Date Range Picker */}
            <div className="bg-[#232347] rounded-lg px-4 py-2 text-gray-200 text-sm font-medium ml-2">
              Jan 2025 - May 2025
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Search bar, notifications, help, AI chat icons */}
            <input
              className="bg-[#232347] rounded-lg px-4 py-2 text-gray-100 placeholder:text-gray-400 w-64 focus:outline-none"
              placeholder="Search users, logs, revenue..."
            />
            {/* ...icons... */}
          </div>
        </header>
        {/* Main Grid */}
        <main className="pt-[100px] pb-12 px-12 w-full min-h-screen flex flex-col gap-8">
          {/* Row 0: Feature Components */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-1 md:col-span-1">
              <DataSources />
            </div>
            <div className="col-span-1 md:col-span-1">
              <NLQueries />
            </div>
            <div className="col-span-1 md:col-span-1">
              <Schedules />
            </div>
          </div>
          {/* Row 1: 3 summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Total Users */}
            <div
              className="rounded-2xl shadow-xl"
              style={{ background: cardBg, padding: 32 }}
            >
              <div className="text-lg font-bold text-gray-200 mb-2">
                Total Users
              </div>
              <div className="text-4xl font-extrabold text-white mb-1">
                2,340
              </div>
              <div className="text-sm text-gray-400">Active Accounts</div>
              <div className="text-xs text-green-400 mt-2">
                +5% since last month
              </div>
            </div>
            {/* Card 2: Revenue This Month */}
            <RevenuePanel />
            {/* Card 3: System Status */}
            <div
              className="rounded-2xl shadow-xl"
              style={{ background: cardBg, padding: 32 }}
            >
              <div className="text-lg font-bold text-gray-200 mb-2">
                System Status
              </div>
              <div className="text-4xl font-extrabold text-green-400 mb-1">
                All Systems Operational
              </div>
              <div className="text-sm text-gray-400">No major incidents</div>
              <div className="text-xs text-green-400 mt-2">100% uptime</div>
            </div>
          </div>
          {/* Row 2: 2 cards (large + small) */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-8">
            {/* Card 4: User Management (large) */}
            <div
              className="col-span-1 md:col-span-5 rounded-2xl shadow-xl flex flex-col"
              style={{
                background: '#1A1A2E',
                padding: 32,
                minHeight: 340,
              }}
            >
              <div className="text-lg font-bold text-gray-200 mb-2">
                User Management
              </div>
              <div
                className="flex-1 overflow-y-auto bg-[#232347] rounded-lg p-4 text-gray-300 mb-4"
                style={{ minHeight: 120 }}
              >
                <div className="text-gray-400">
                  Navigate to the User Management page to view and manage users.
                </div>
              </div>
              <Link
                to="/admin/users"
                className="text-sm text-[var(--accent-amber,#FFA500)] hover:underline font-semibold mt-auto"
              >
                Manage All Users
              </Link>
            </div>
            {/* Card 5: Recent Audit Logs (small) */}
            <div
              className="col-span-1 md:col-span-2 rounded-2xl shadow-xl flex flex-col"
              style={{
                background: '#1A1A2E',
                padding: 32,
                minHeight: 340,
              }}
            >
              <div className="text-lg font-bold text-gray-200 mb-2">
                Recent Audit Logs
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="text-gray-400">
                  Navigate to the Audit Logs page to view all logs.
                </div>
              </div>
              <Link
                to="/admin/audit-logs"
                className="text-sm text-[var(--accent-amber,#FFA500)] hover:underline font-semibold mt-4"
              >
                View All Logs
              </Link>
            </div>
          </div>
          {/* Row 3: 3 management/alert cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 6: Revenue Breakdown */}
            <div
              className="rounded-2xl shadow-xl flex flex-col"
              style={{ background: cardBg, padding: 32 }}
            >
              <div className="text-lg font-bold text-gray-200 mb-2">
                Revenue Breakdown
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 py-2">
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                  <div className="flex-1 text-gray-100">Enterprise</div>
                  <div className="text-xs text-gray-400">$12,000</div>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <div className="h-3 w-3 rounded-full bg-blue-400" />
                  <div className="flex-1 text-gray-100">SaaS</div>
                  <div className="text-xs text-gray-400">$6,900</div>
                </div>
              </div>
              <Link
                to="/admin/revenue"
                className="text-sm text-[var(--accent-amber,#FFA500)] hover:underline font-semibold mt-4"
              >
                View Revenue Details
              </Link>
            </div>
            {/* Card 7: System Alerts */}
            <div
              className="rounded-2xl shadow-xl flex flex-col"
              style={{ background: cardBg, padding: 32 }}
            >
              <div className="text-lg font-bold text-gray-200 mb-2">
                System Alerts
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="flex items-center gap-3 py-2">
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                  <div className="flex-1 text-gray-100">No incidents reported</div>
                  <div className="text-xs text-gray-400">2h ago</div>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="flex-1 text-gray-100">Scheduled maintenance</div>
                  <div className="text-xs text-gray-400">1d ago</div>
                </div>
              </div>
              <Link
                to="/admin/system-status"
                className="text-sm text-[var(--accent-amber,#FFA500)] hover:underline font-semibold mt-4"
              >
                View System Status
              </Link>
            </div>
            {/* Card 8: Admin Controls */}
            <div
              className="rounded-2xl shadow-xl flex flex-col"
              style={{ background: cardBg, padding: 32 }}
            >
              <div className="text-lg font-bold text-gray-200 mb-2">
                Admin Controls
              </div>
              <div className="flex-1">
                <button className="w-full rounded-lg bg-[#232347] px-4 py-2 text-white font-semibold mb-2 hover:bg-[#282A36]">
                  Invite Admin
                </button>
                <button className="w-full rounded-lg bg-[#232347] px-4 py-2 text-white font-semibold mb-2 hover:bg-[#282A36]">
                  Manage Roles
                </button>
                <button className="w-full rounded-lg bg-[#232347] px-4 py-2 text-white font-semibold hover:bg-[#282A36]">
                  System Settings
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
