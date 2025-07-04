import React from "react";
// Import your logo and icons here
// import Logo from "../assets/images/mutsynchub-logo.png";
// import { ... } from "lucide-react";

const amber = "#FFA500";
const sidebarBg = "#232347";
const cardBg = "#1A1A2E";
const mainGradient = "bg-gradient-to-b from-[#321F61] to-[#1F224D]";

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-[220px] flex flex-col justify-between bg-[#232347] shadow-lg z-30">
        <div>
          <div className="flex items-center gap-3 px-6 py-8">
            {/* <img src={Logo} alt="MutSyncHub Logo" className="h-10 w-10" /> */}
            <span className="text-2xl font-extrabold text-white tracking-wide">MH <span className="text-[var(--accent-amber,#FFA500)]">MutSyncHub</span></span>
          </div>
          <nav className="flex flex-col gap-2 mt-6 px-2">
            {/* Map nav items here, highlight Dashboard in amber */}
            {/* ... */}
          </nav>
        </div>
        <div className="px-6 py-6 border-t border-[#282A36] flex items-center gap-3">
          {/* User avatar and info */}
          <div className="h-10 w-10 rounded-full bg-gray-600" />
          <div>
            <div className="text-white font-semibold">John Doe</div>
            <div className="text-xs text-gray-400">Business User</div>
          </div>
        </div>
      </aside>
      {/* Main Content */}
      <div className={`flex-1 ml-[220px] min-h-screen ${mainGradient} transition-all duration-300`}>
        {/* Header */}
        <header className="fixed left-[220px] right-0 top-0 h-[76px] flex items-center px-12 bg-transparent z-20" style={{backdropFilter: 'blur(8px)'}}>
          <div className="flex-1 flex items-center gap-4">
            <h1 className="text-3xl font-bold text-white mr-8">Dashboard</h1>
            {/* Date Range Picker */}
            <div className="bg-[#232347] rounded-lg px-4 py-2 text-gray-200 text-sm font-medium ml-2">Jan 2025 - May 2025</div>
          </div>
          <div className="flex items-center gap-4">
            {/* Search bar, notifications, help, AI chat icons */}
            <input className="bg-[#232347] rounded-lg px-4 py-2 text-gray-100 placeholder:text-gray-400 w-64 focus:outline-none" placeholder="Search for reports, data, users..." />
            {/* ...icons... */}
          </div>
        </header>
        {/* Main Grid */}
        <main className="pt-[100px] pb-12 px-12 w-full min-h-screen flex flex-col gap-8">
          {/* Row 1: 3 summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Total Analytics Runs */}
            <div className="rounded-2xl shadow-xl" style={{background: cardBg, padding: 32}}>
              <div className="text-lg font-bold text-gray-200 mb-2">Total Analytics Runs</div>
              <div className="text-4xl font-extrabold text-white mb-1">1,245</div>
              <div className="text-sm text-gray-400">Schedules Completed This Month</div>
              <div className="text-xs text-green-400 mt-2">+12% since last month</div>
            </div>
            {/* Card 2: NL Queries Processed */}
            <div className="rounded-2xl shadow-xl" style={{background: cardBg, padding: 32}}>
              <div className="text-lg font-bold text-gray-200 mb-2">NL Queries Processed</div>
              <div className="text-4xl font-extrabold text-white mb-1">876</div>
              <div className="text-sm text-gray-400">Insights Delivered</div>
              <div className="w-full h-2 bg-gray-700 rounded-full mt-2">
                <div className="h-2 rounded-full" style={{width: '70%', background: amber}} />
              </div>
              <div className="text-xs text-gray-400 mt-1">70% of 1000 limit</div>
            </div>
            {/* Card 3: Active Data Sources */}
            <div className="rounded-2xl shadow-xl" style={{background: cardBg, padding: 32}}>
              <div className="text-lg font-bold text-gray-200 mb-2">Active Data Sources</div>
              <div className="text-4xl font-extrabold text-white mb-1">8</div>
              <div className="text-sm text-gray-400">Integrations Live</div>
              <div className="text-xs text-green-400 mt-2">All Operational</div>
            </div>
          </div>
          {/* Row 2: 2 cards (large + small) */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-8">
            {/* Card 4: Natural Language Analytics (large) */}
            <div className="col-span-1 md:col-span-5 rounded-2xl shadow-xl flex flex-col" style={{background: cardBg, padding: 32, minHeight: 340}}>
              <div className="text-lg font-bold text-gray-200 mb-2">Natural Language Analytics</div>
              <input className="w-full rounded-lg bg-[#232347] px-4 py-3 text-gray-100 placeholder:text-gray-400 mb-4 focus:outline-none" placeholder="Ask your data anything..." />
              <div className="flex-1 overflow-y-auto bg-[#232347] rounded-lg p-4 text-gray-300 mb-4" style={{minHeight: 120}}>
                {/* Results/summary area */}
                <div className="text-gray-400">No queries yet. Try asking a question!</div>
              </div>
              <a href="#" className="text-sm text-[var(--accent-amber,#FFA500)] hover:underline font-semibold mt-auto">View Query History</a>
            </div>
            {/* Card 5: Recent Analytics Schedule Activity (small) */}
            <div className="col-span-1 md:col-span-2 rounded-2xl shadow-xl flex flex-col" style={{background: cardBg, padding: 32, minHeight: 340}}>
              <div className="text-lg font-bold text-gray-200 mb-2">Recent Analytics Schedule Activity</div>
              <div className="flex-1 overflow-y-auto">
                {/* List of recent schedules */}
                <div className="flex items-center gap-3 py-2">
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                  <div className="flex-1 text-gray-100">Sales Forecast (Weekly)</div>
                  <div className="text-xs text-gray-400">5:30 PM</div>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="flex-1 text-gray-100">Inventory Sync (Daily)</div>
                  <div className="text-xs text-gray-400">4:00 PM</div>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="flex-1 text-gray-100">Revenue Report (Monthly)</div>
                  <div className="text-xs text-gray-400">Yesterday</div>
                </div>
              </div>
              <a href="#" className="text-sm text-[var(--accent-amber,#FFA500)] hover:underline font-semibold mt-4">Manage All Schedules</a>
            </div>
          </div>
          {/* Row 3: 3 management/alert cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 6: Data Source Health Overview */}
            <div className="rounded-2xl shadow-xl flex flex-col" style={{background: cardBg, padding: 32}}>
              <div className="text-lg font-bold text-gray-200 mb-2">Data Source Health Overview</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 py-2">
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                  <div className="flex-1 text-gray-100">Salesforce CRM</div>
                  <div className="text-xs text-gray-400">Active</div>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="flex-1 text-gray-100">Marketing DB</div>
                  <div className="text-xs text-gray-400">Syncing</div>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <div className="h-3 w-3 rounded-full bg-gray-400" />
                  <div className="flex-1 text-gray-100">POS Data Stream</div>
                  <div className="text-xs text-gray-400">Inactive</div>
                </div>
              </div>
              <a href="#" className="text-sm text-[var(--accent-amber,#FFA500)] hover:underline font-semibold mt-4">Manage Data Sources</a>
            </div>
            {/* Card 7: Your Current Plan & Usage */}
            <div className="rounded-2xl shadow-xl flex flex-col" style={{background: cardBg, padding: 32}}>
              <div className="text-lg font-bold text-gray-200 mb-2">Your Current Plan & Usage</div>
              <div className="text-2xl font-extrabold text-white mb-2">Enterprise Plan</div>
              <div className="mb-2">
                <div className="flex justify-between text-xs text-gray-400 mb-1"><span>Queries Used</span><span>700/1000</span></div>
                <div className="w-full h-2 bg-gray-700 rounded-full mb-2"><div className="h-2 rounded-full" style={{width: '70%', background: amber}} /></div>
                <div className="flex justify-between text-xs text-gray-400 mb-1"><span>Schedules</span><span>15/20</span></div>
                <div className="w-full h-2 bg-gray-700 rounded-full mb-2"><div className="h-2 rounded-full" style={{width: '75%', background: amber}} /></div>
                <div className="flex justify-between text-xs text-gray-400 mb-1"><span>Integrations</span><span>8/Unlimited</span></div>
                <div className="w-full h-2 bg-gray-700 rounded-full mb-2"><div className="h-2 rounded-full" style={{width: '100%', background: amber}} /></div>
              </div>
              <button className="mt-auto rounded-full px-6 py-2 font-bold text-white bg-[var(--accent-amber,#FFA500)] hover:bg-amber-500 transition">Upgrade / Manage Plan</button>
            </div>
            {/* Card 8: Notifications & System Alerts */}
            <div className="rounded-2xl shadow-xl flex flex-col" style={{background: cardBg, padding: 32}}>
              <div className="text-lg font-bold text-gray-200 mb-2">Notifications & System Alerts</div>
              <div className="flex-1 overflow-y-auto">
                <div className="flex items-center gap-3 py-2">
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                  <div className="flex-1 text-gray-100">Analytics schedule 'Q3 Report' completed successfully</div>
                  <div className="text-xs text-gray-400">2h ago</div>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="flex-1 text-gray-100">Payment method update required</div>
                  <div className="text-xs text-gray-400">1d ago</div>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <div className="h-3 w-3 rounded-full bg-blue-400" />
                  <div className="flex-1 text-gray-100">New integration added: SAP</div>
                  <div className="text-xs text-gray-400">3d ago</div>
                </div>
              </div>
              <a href="#" className="text-sm text-[var(--accent-amber,#FFA500)] hover:underline font-semibold mt-4">View All Notifications</a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
