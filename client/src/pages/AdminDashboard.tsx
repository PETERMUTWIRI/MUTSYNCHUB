import React from "react";
import { Link } from "react-router-dom";
import DataSources from '../components/admin/DataSources';
import NLQueries from '../components/admin/NLQueries';
import Schedules from '../components/admin/Schedules';
import RevenuePanel from '../components/admin/RevenuePanel/RevenuePanel';

const AdminDashboard: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto py-12">
      <h1 className="text-4xl font-bold text-white mb-8">Admin Dashboard</h1>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        <div
          className="rounded-2xl shadow-xl"
          style={{ background: '#1A1A2E', padding: 32 }}
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
        <RevenuePanel />
        <div
          className="rounded-2xl shadow-xl"
          style={{ background: '#1A1A2E', padding: 32 }}
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
      <div className="grid grid-cols-1 md:grid-cols-7 gap-8 mt-8">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        <div
          className="rounded-2xl shadow-xl flex flex-col"
          style={{ background: '#1A1A2E', padding: 32 }}
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
        <div
          className="rounded-2xl shadow-xl flex flex-col"
          style={{ background: '#1A1A2E', padding: 32 }}
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
        <div
          className="rounded-2xl shadow-xl flex flex-col"
          style={{ background: '#1A1A2E', padding: 32 }}
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
    </div>
  );
};

export default AdminDashboard;
