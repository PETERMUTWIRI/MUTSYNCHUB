import React from "react";
// Import your logo and icons here
// import Logo from "../assets/images/mutsynchub-logo.png";
// import { ... } from "lucide-react";

const amber = "#FFA500";
const sidebarBg = "#232347";
const cardBg = "#1A1A2E";
const mainGradient = "bg-gradient-to-b from-[#321F61] to-[#1F224D]";

const AdminDashboard: React.FC = () => {
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
            {/* Admin nav items: Dashboard, Users, Audit Logs, Revenue, System Status */}
            <a
              href="#"
              className="rounded-lg px-4 py-2 font-semibold text-white bg-[var(--accent-amber,#FFA500)]"
            >
              Dashboard
            </a>
            <a
              href="#"
              className="rounded-lg px-4 py-2 font-semibold text-gray-200 hover:bg-[#282A36]"
            >
              User Management
            </a>
            <a
              href="#"
              className="rounded-lg px-4 py-2 font-semibold text-gray-200 hover:bg-[#282A36]"
            >
              Audit Logs
            </a>
            <a
              href="#"
              className="rounded-lg px-4 py-2 font-semibold text-gray-200 hover:bg-[#282A36]"
            >
              Revenue
            </a>
            <a
              href="#"
              className="rounded-lg px-4 py-2 font-semibold text-gray-200 hover:bg-[#282A36]"
            >
              System Status
            </a>
          </nav>
        </div>
        <div className="px-6 py-6 border-t border-[#282A36] flex items-center gap-3">
          {/* Admin avatar and info */}
          <div className="h-10 w-10 rounded-full bg-gray-600" />
          <div>
            <div className="text-white font-semibold">Jane Admin</div>
            <div className="text-xs text-gray-400">Administrator</div>
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
            <div
              className="rounded-2xl shadow-xl"
              style={{ background: cardBg, padding: 32 }}
            >
              <div className="text-lg font-bold text-gray-200 mb-2">
                Revenue This Month
              </div>
              <div className="text-4xl font-extrabold text-white mb-1">
                $18,900
              </div>
              <div className="text-sm text-gray-400">Enterprise & SaaS Plans</div>
              <div className="text-xs text-green-400 mt-2">
                +8% since last month
              </div>
            </div>
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
                background: cardBg,
                padding: 32,
                minHeight: 340,
              }}
            >
              <div className="text-lg font-bold text-gray-200 mb-2">
                User Management
              </div>
              <input
                className="w-full rounded-lg bg-[#232347] px-4 py-3 text-gray-100 placeholder:text-gray-400 mb-4 focus:outline-none"
                placeholder="Search or add users..."
              />
              <div
                className="flex-1 overflow-y-auto bg-[#232347] rounded-lg p-4 text-gray-300 mb-4"
                style={{ minHeight: 120 }}
              >
                {/* List of users or management actions */}
                <div className="text-gray-400">
                  No users selected. Use search to find users.
                </div>
              </div>
              <a
                href="#"
                className="text-sm text-[var(--accent-amber,#FFA500)] hover:underline font-semibold mt-auto"
              >
                Manage All Users
              </a>
            </div>
            {/* Card 5: Recent Audit Logs (small) */}
            <div
              className="col-span-1 md:col-span-2 rounded-2xl shadow-xl flex flex-col"
              style={{
                background: cardBg,
                padding: 32,
                minHeight: 340,
              }}
            >
              <div className="text-lg font-bold text-gray-200 mb-2">
                Recent Audit Logs
              </div>
              <div className="flex-1 overflow-y-auto">
                {/* List of recent audit logs */}
                <div className="flex items-center gap-3 py-2">
                  <div className="h-3 w-3 rounded-full bg-blue-400" />
                  <div className="flex-1 text-gray-100">
                    User 'jdoe' updated permissions
                  </div>
                  <div className="text-xs text-gray-400">5:30 PM</div>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="flex-1 text-gray-100">Plan upgraded: Enterprise</div>
                  <div className="text-xs text-gray-400">4:00 PM</div>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="flex-1 text-gray-100">Failed login attempt</div>
                  <div className="text-xs text-gray-400">Yesterday</div>
                </div>
              </div>
              <a
                href="#"
                className="text-sm text-[var(--accent-amber,#FFA500)] hover:underline font-semibold mt-4"
              >
                View All Logs
              </a>
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
              <a
                href="#"
                className="text-sm text-[var(--accent-amber,#FFA500)] hover:underline font-semibold mt-4"
              >
                View Revenue Details
              </a>
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
              <a
                href="#"
                className="text-sm text-[var(--accent-amber,#FFA500)] hover:underline font-semibold mt-4"
              >
                View System Status
              </a>
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
