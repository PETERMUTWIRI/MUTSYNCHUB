import React, { useEffect, useState } from 'react';
import { runQuery, getQueryHistory } from '../api/analytics';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';

type QueryHistoryItem = {
  id?: string | number;
  name: string;
  description?: string;
};

const amber = "#FFA500";
const sidebarBg = "#232347";
const cardBg = "#1A1A2E";
const mainGradient = "bg-gradient-to-b from-[#321F61] to-[#1F224D]";

const AnalyticsDashboardLanding: React.FC = () => {
  const { user, loading } = useAuth();
  const token = user?.token || '';
  const orgId = user?.orgId || '';

  const [query, setQuery] = useState('');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [queryLoading, setQueryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch query history on mount
    if (orgId && token) {
    getQueryHistory(orgId, token)
      .then((res: { data: QueryHistoryItem[] }) => setHistory(res.data))
      .catch(() => setHistory([]));
    }
  }, [orgId, token]);

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    setQueryLoading(true);
    setError(null);
    try {
      const res = await runQuery({ query, orgId }, token);
      setQueryResult(res.data);
    } catch (err: any) {
      setError('Failed to run query.');
    } finally {
      setQueryLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-lg text-gray-500">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
          <h2 className="text-3xl font-extrabold mb-2 text-blue-800">Sign in Required</h2>
          <p className="mb-6 text-gray-600">Please log in or sign up to access the Analytics Engine.</p>
          <div className="flex flex-col gap-4">
            {/* Import and use the SSOLogin component for SSO options */}
            {require('../components/ui/SSOLogin').default()}
            <span className="text-gray-400 text-xs my-2">or</span>
            <a href="#" onClick={() => window.dispatchEvent(new CustomEvent('open-login-dialog'))} className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 rounded-lg shadow px-6">Login / Sign Up</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex bg-[#F6F8F9]">
      {/* Sidebar remains unchanged */}
      {/* ...existing sidebar code... */}
      <div className="flex-1 ml-[220px] min-h-screen">
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
            {/* Announcements & Upgrade Plan row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Announcements card (reuse Usage or create new) */}
              <div className="bg-white rounded-xl shadow p-6 flex flex-col justify-between min-h-[180px]">
                <div className="text-lg font-bold text-gray-900 mb-2">Announcements</div>
                <div className="text-sm text-gray-700 mb-2">New Feature: Advanced Analytics now available!</div>
                <div className="text-xs text-gray-400">July 2025</div>
              </div>
              {/* Upgrade Plan card horizontally aligned */}
              <div className="bg-green-100 rounded-xl shadow p-6 flex flex-col items-center justify-center min-h-[180px]">
                <div className="text-lg font-bold text-green-700 mb-2 text-center">Upgrade your analytics to gain deeper insights</div>
                <Button className="bg-green-700 text-white px-4 py-2 rounded-lg font-semibold mt-2">Upgrade Plan →</Button>
              </div>
            </div>
            {/* Usage and Query Duration Cards fill gap */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow p-6 flex flex-col justify-between min-h-[180px]">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-lg font-bold text-gray-900">Usage</div>
                  <Button variant="outline" className="text-green-700 border-green-200">Augsize Plan</Button>
                </div>
                <div className="flex-1 flex items-center gap-2">
                  {/* Usage chart placeholder */}
                  <div className="h-24 w-full bg-green-100 rounded-lg" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow p-6 flex flex-col justify-between min-h-[180px]">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-lg font-bold text-gray-900">Query Duration</div>
                  <Button variant="outline" className="text-green-700 border-green-200">Completed</Button>
                </div>
                <div className="flex-1 flex items-center gap-2">
                  {/* Query duration chart placeholder */}
                  <div className="h-24 w-full bg-blue-100 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
          {/* Right column: Tenant Usage only */}
          <div className="flex flex-col gap-6 justify-between h-full">
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center min-h-[180px] justify-center">
              <div className="text-lg font-bold text-gray-900 mb-2">Tenant Usage</div>
              <div className="text-3xl font-extrabold text-green-700 mb-1">65,328</div>
              <div className="text-xs text-gray-500 mb-2">65% usage</div>
              <div className="text-xs text-gray-400 mb-2">Here are some ideas on how to increase usage.</div>
              <Button variant="outline" className="text-green-700 border-green-200">Query History →</Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AnalyticsDashboardLanding;
