import React from "react";
// Import your logo and icons here
// import Logo from "../assets/images/mutsynchub-logo.png";
// import { ... } from "lucide-react";
import DataSources from '../components/admin/DataSources';
import NLQueries from '../components/admin/NLQueries';
import Schedules from '../components/admin/Schedules';
import { Button } from '../components/ui/button';

const amber = "#FFA500";
const sidebarBg = "#232347";
const cardBg = "#1A1A2E";
const mainGradient = "bg-gradient-to-b from-[#321F61] to-[#1F224D]";

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex bg-[#F6F8F9]">
      {/* Sidebar remains unchanged, handled by UserLayout */}
      <div className="flex-1 min-h-screen">
        {/* Header: navbar with search, notification, profile, chat */}
        <header className="flex items-center justify-between px-10 py-6 bg-white shadow-sm sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <span className="text-sm text-gray-500">Overview of key metrics and data insights</span>
          </div>
          <div className="flex items-center gap-4">
            <input className="bg-gray-100 rounded-lg px-4 py-2 text-gray-700 placeholder:text-gray-400 w-64 focus:outline-none border border-gray-300" placeholder="Search server..." />
            <button className="relative">
              <span className="material-icons text-gray-500">notifications</span>
              <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full px-1">3</span>
            </button>
            <button className="bg-gray-100 rounded-full h-10 w-10 flex items-center justify-center">
              <span className="material-icons text-gray-500">person</span>
            </button>
            <button className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-semibold">Chat with AI</button>
          </div>
        </header>
        {/* Main grid layout */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-10">
          {/* Left column: main cards */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Update card */}
            <div className="bg-white rounded-xl shadow p-6 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-green-700 mb-1">Update</div>
                <div className="text-lg font-bold text-gray-900">New: Data analysis completed for your query</div>
                <a href="#" className="text-sm text-green-700 hover:underline">See Analytics →</a>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-icons text-green-500">check_circle</span>
              </div>
            </div>
            {/* Metrics cards row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow p-6 flex flex-col items-start">
                <div className="text-xs text-gray-500 mb-1">Total Users</div>
                <div className="text-2xl font-bold text-gray-900">12,340</div>
                <div className="text-xs text-green-600 mt-1">+8.3% since last month</div>
              </div>
              <div className="bg-white rounded-xl shadow p-6 flex flex-col items-start">
                <div className="text-xs text-gray-500 mb-1">Active Users</div>
                <div className="text-2xl font-bold text-gray-900">3,210</div>
                <div className="text-xs text-red-600 mt-1">-2.1% since month</div>
              </div>
              <div className="bg-white rounded-xl shadow p-6 flex flex-col items-start">
                <div className="text-xs text-gray-500 mb-1">Usage</div>
                <div className="text-2xl font-bold text-gray-900">225</div>
                <div className="text-xs text-green-600 mt-1">9% Month</div>
              </div>
              <div className="bg-white rounded-xl shadow p-6 flex flex-col items-start">
                <div className="text-xs text-gray-500 mb-1">Query Performance</div>
                <div className="text-2xl font-bold text-gray-900">18</div>
                <div className="text-xs text-green-600 mt-1">Completed</div>
              </div>
            </div>
            {/* Analytics Data Table */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-lg font-bold text-gray-900">Analytics Data</div>
                <Button variant="outline" className="text-green-700 border-green-200">View All</Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-gray-500">User Activity</div>
                  <div className="text-sm text-gray-900">5:39 PM</div>
                  <div className="text-xs text-green-600">Completed</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Query Trends</div>
                  <div className="text-sm text-gray-900">Pending</div>
                  <div className="text-xs text-yellow-600">Pending</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Engagement</div>
                  <div className="text-sm text-gray-900">12:44 AM</div>
                  <div className="text-xs text-green-600">Completed</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Retention Analysis</div>
                  <div className="text-sm text-gray-900">Completed</div>
                  <div className="text-xs text-green-600">Completed</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Custom Report</div>
                  <div className="text-sm text-gray-900">1:15 AM</div>
                  <div className="text-xs text-green-600">Completed</div>
                </div>
              </div>
            </div>
            {/* Usage and Query Duration Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow p-6 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-lg font-bold text-gray-900">Usage</div>
                  <Button variant="outline" className="text-green-700 border-green-200">Augsize Plan</Button>
                </div>
                <div className="flex items-center gap-2">
                  {/* Usage chart placeholder */}
                  <div className="h-24 w-full bg-green-100 rounded-lg" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow p-6 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-lg font-bold text-gray-900">Query Duration</div>
                  <Button variant="outline" className="text-green-700 border-green-200">Completed</Button>
                </div>
                <div className="flex items-center gap-2">
                  {/* Query duration chart placeholder */}
                  <div className="h-24 w-full bg-blue-100 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
          {/* Right column: Tenant Usage and Upgrade Plan */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
              <div className="text-lg font-bold text-gray-900 mb-2">Tenant Usage</div>
              <div className="text-3xl font-extrabold text-green-700 mb-1">65,328</div>
              <div className="text-xs text-gray-500 mb-2">65% usage</div>
              <div className="text-xs text-gray-400 mb-2">Here are some ideas on how to increase usage.</div>
              <Button variant="outline" className="text-green-700 border-green-200">Query History →</Button>
            </div>
            <div className="bg-green-100 rounded-xl shadow p-6 flex flex-col items-center">
              <div className="text-lg font-bold text-green-700 mb-2">Upgrade your analytics to gain deeper insights</div>
              <Button className="bg-green-700 text-white px-4 py-2 rounded-lg font-semibold mt-2">Upgrade Plan →</Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
