import React, { useEffect, useState } from 'react';
import { runQuery, getQueryHistory } from '../api/analytics';
import { useAuth } from '../hooks/useAuth';

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
    <div className="min-h-screen w-full flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-[220px] flex flex-col justify-between bg-[#232347] shadow-lg z-30">
        <div>
          <div className="flex items-center gap-3 px-6 py-8">
            {/* <img src={Logo} alt="MutSyncHub Logo" className="h-10 w-10" /> */}
            <span className="text-2xl font-extrabold text-white tracking-wide">MH <span className="text-[var(--accent-amber,#FFA500)]">Analytics</span></span>
          </div>
          <nav className="flex flex-col gap-2 mt-6 px-2">
            <a href="#" className="rounded-lg px-4 py-2 font-semibold text-white bg-[var(--accent-amber,#FFA500)]">Analytics Home</a>
            <a href="#" className="rounded-lg px-4 py-2 font-semibold text-gray-200 hover:bg-[#282A36]">NL Queries</a>
            <a href="#" className="rounded-lg px-4 py-2 font-semibold text-gray-200 hover:bg-[#282A36]">Data Sources</a>
            <a href="#" className="rounded-lg px-4 py-2 font-semibold text-gray-200 hover:bg-[#282A36]">Reports</a>
            <a href="#" className="rounded-lg px-4 py-2 font-semibold text-gray-200 hover:bg-[#282A36]">Schedules</a>
          </nav>
        </div>
        <div className="px-6 py-6 border-t border-[#282A36] flex items-center gap-3">
          {/* Analytics avatar and info */}
          <div className="h-10 w-10 rounded-full bg-blue-600" />
          <div>
            <div className="text-white font-semibold">Alex Analyst</div>
            <div className="text-xs text-gray-400">Analytics Lead</div>
          </div>
        </div>
      </aside>
      {/* Main Content */}
      <div className={`flex-1 ml-[220px] min-h-screen ${mainGradient} transition-all duration-300`}>
        {/* Header */}
        <header className="fixed left-[220px] right-0 top-0 h-[76px] flex items-center px-12 bg-transparent z-20" style={{backdropFilter: 'blur(8px)'}}>
          <div className="flex-1 flex items-center gap-4">
            <h1 className="text-3xl font-bold text-white mr-8">Analytics Dashboard</h1>
            <div className="bg-[#232347] rounded-lg px-4 py-2 text-gray-200 text-sm font-medium ml-2">Jan 2025 - May 2025</div>
          </div>
          <div className="flex items-center gap-4">
            <input className="bg-[#232347] rounded-lg px-4 py-2 text-gray-100 placeholder:text-gray-400 w-64 focus:outline-none" placeholder="Search analytics, queries..." />
          </div>
        </header>
        {/* Main Grid */}
        <main className="pt-[100px] pb-12 px-12 w-full min-h-screen flex flex-col gap-8">
          {/* Row 1: 3 summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Analytics Runs */}
            <div className="rounded-2xl shadow-xl" style={{background: cardBg, padding: 32}}>
              <div className="text-lg font-bold text-gray-200 mb-2">Analytics Runs</div>
              <div className="text-4xl font-extrabold text-white mb-1">128</div>
              <div className="text-sm text-gray-400">This Month</div>
              <div className="text-xs text-green-400 mt-2">+12% since last month</div>
            </div>
            {/* Card 2: NL Queries */}
            <div className="rounded-2xl shadow-xl" style={{background: cardBg, padding: 32}}>
              <div className="text-lg font-bold text-gray-200 mb-2">NL Queries</div>
              <div className="text-4xl font-extrabold text-white mb-1">54</div>
              <div className="text-sm text-gray-400">Natural Language</div>
              <div className="text-xs text-green-400 mt-2">+9% since last month</div>
            </div>
            {/* Card 3: Data Sources */}
            <div className="rounded-2xl shadow-xl" style={{background: cardBg, padding: 32}}>
              <div className="text-lg font-bold text-gray-200 mb-2">Data Sources</div>
              <div className="text-4xl font-extrabold text-white mb-1">7</div>
              <div className="text-sm text-gray-400">Connected</div>
              <div className="text-xs text-green-400 mt-2">+1 new this month</div>
            </div>
          </div>
          {/* Row 2: NL Query Input & History */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-8">
            {/* Card 4: NL Query Input (large) */}
            <div className="col-span-1 md:col-span-5 rounded-2xl shadow-xl flex flex-col" style={{background: cardBg, padding: 32, minHeight: 340}}>
              <div className="text-lg font-bold text-gray-200 mb-2">Ask a Question (NL Query)</div>
              <form onSubmit={handleQuery} className="flex gap-2 mb-4">
                <input
                  className="flex-1 rounded-lg bg-[#232347] px-4 py-3 text-gray-100 placeholder:text-gray-400 focus:outline-none"
                  placeholder="Ask a question about your data..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  disabled={queryLoading}
                />
                <button type="submit" className="bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold" disabled={queryLoading || !query}>
                  {queryLoading ? 'Running...' : 'Run Query'}
                </button>
              </form>
              {error && <div className="text-red-500 mb-2">{error}</div>}
              {queryResult && (
                <div className="flex-1 overflow-y-auto bg-[#232347] rounded-lg p-4 text-gray-300 mb-4" style={{minHeight: 120}}>
                  <div className="text-gray-400">No query run yet. Enter a question above.</div>
                </div>
              )}
            </div>
            {/* Card 5: Query History (small) */}
            <div className="col-span-1 md:col-span-2 rounded-2xl shadow-xl flex flex-col" style={{background: cardBg, padding: 32, minHeight: 340}}>
              <div className="text-lg font-bold text-gray-200 mb-2">Query History</div>
              <div className="flex-1 overflow-y-auto">
                <div className="flex items-center gap-3 py-2">
                  <div className="h-3 w-3 rounded-full bg-blue-400" />
                  <div className="flex-1 text-gray-100">"Show revenue by month"</div>
                  <div className="text-xs text-gray-400">2:10 PM</div>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                  <div className="flex-1 text-gray-100">"Top 10 users by API usage"</div>
                  <div className="text-xs text-gray-400">Yesterday</div>
                </div>
              </div>
              <a href="#" className="text-sm text-[var(--accent-amber,#FFA500)] hover:underline font-semibold mt-4">View All History</a>
            </div>
          </div>
          {/* Row 3: Analytics Reports, Schedules, Alerts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 6: Analytics Reports */}
            <div className="rounded-2xl shadow-xl flex flex-col" style={{background: cardBg, padding: 32}}>
              <div className="text-lg font-bold text-gray-200 mb-2">Analytics Reports</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 py-2">
                  <div className="h-3 w-3 rounded-full bg-purple-400" />
                  <div className="flex-1 text-gray-100">Monthly Usage Report</div>
                  <div className="text-xs text-gray-400">Ready</div>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <div className="h-3 w-3 rounded-full bg-blue-400" />
                  <div className="flex-1 text-gray-100">API Performance</div>
                  <div className="text-xs text-gray-400">Ready</div>
                </div>
              </div>
              <a href="#" className="text-sm text-[var(--accent-amber,#FFA500)] hover:underline font-semibold mt-4">View All Reports</a>
            </div>
            {/* Card 7: Schedules */}
            <div className="rounded-2xl shadow-xl flex flex-col" style={{background: cardBg, padding: 32}}>
              <div className="text-lg font-bold text-gray-200 mb-2">Schedules</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 py-2">
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                  <div className="flex-1 text-gray-100">Daily ETL</div>
                  <div className="text-xs text-gray-400">Active</div>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="flex-1 text-gray-100">Weekly Summary</div>
                  <div className="text-xs text-gray-400">Paused</div>
                </div>
              </div>
              <a href="#" className="text-sm text-[var(--accent-amber,#FFA500)] hover:underline font-semibold mt-4">Manage Schedules</a>
            </div>
            {/* Card 8: Analytics Alerts */}
            <div className="rounded-2xl shadow-xl flex flex-col" style={{background: cardBg, padding: 32}}>
              <div className="text-lg font-bold text-gray-200 mb-2">Analytics Alerts</div>
              <div className="flex-1 overflow-y-auto">
                <div className="flex items-center gap-3 py-2">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="flex-1 text-gray-100">ETL Failure</div>
                  <div className="text-xs text-gray-400">Today</div>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                  <div className="flex-1 text-gray-100">All systems normal</div>
                  <div className="text-xs text-gray-400">2h ago</div>
                </div>
              </div>
              <a href="#" className="text-sm text-[var(--accent-amber,#FFA500)] hover:underline font-semibold mt-4">View All Alerts</a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AnalyticsDashboardLanding;
