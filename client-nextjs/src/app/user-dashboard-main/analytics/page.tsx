'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

// Dynamic imports for chart components
const KPICard = dynamic(() => import('@/components/analytics/KPICard'), { ssr: false });
const TimeSeriesChart = dynamic(() => import('@/components/analytics/TimeSeriesChart'), { ssr: false });
const TopNBarChart = dynamic(() => import('@/components/analytics/TopNBarChart'), { ssr: false });
const ForecastChart = dynamic(() => import('@/components/analytics/ForecastChart'), { ssr: false });
const DonutChart = dynamic(() => import('@/components/analytics/DonutChart'), { ssr: false });
const EDASummary = dynamic(() => import('@/components/analytics/EDASummary'), { ssr: false });
const SankeyDiagram = dynamic(() => import('@/components/analytics/SankeyDiagram'), { ssr: false });
const TradingChart = dynamic(() => import('@/components/analytics/TradingChart'), { ssr: false });

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#1E2A44] flex items-center justify-center text-white">
          <div className="text-center bg-[#2E7D7D]/10 rounded-xl p-8 border border-[#2E7D7D]/30">
            <p className="text-red-400 font-inter text-lg">Failed to load analytics</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-[#2E7D7D] text-white px-6 py-2 rounded-lg hover:bg-[#2E7D7D]/80"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function AnalyticsPage() {
  const user = useUser({ or: 'redirect' });
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [userPlan] = useState<'Free' | 'Pro' | 'Enterprise'>('Free');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Synthetic demo data (unchanged)
  const kpi = { daily: 5.2, monthly: 12.8, yoy: 22.4 };
  const trendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Sales',
        data: [12000, 13500, 12800, 14500, 16000, 15500, 17000],
        borderColor: '#A3BFFA',
        backgroundColor: 'rgba(163,191,250,0.2)',
      },
      {
        label: 'Profit',
        data: [3200, 4100, 3900, 4700, 5200, 5100, 5900],
        borderColor: '#4B5EAA',
        backgroundColor: 'rgba(75,94,170,0.2)',
      },
    ],
  };
  const topNData = {
    labels: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'],
    datasets: [
      {
        label: 'Sales',
        data: [5200, 4800, 4300, 3900, 3700],
        backgroundColor: ['#A3BFFA', '#4B5EAA', '#2E7D7D', '#6B7280', '#9CA3AF'],
      },
    ],
  };
  const forecastData = {
    labels: ['Jul', 'Aug', 'Sep', 'Oct'],
    datasets: [
      {
        label: 'Forecast',
        data: [17000, 18000, 18500, 19000],
        borderColor: '#2E7D7D',
      },
      {
        label: 'Lower Bound',
        data: [16500, 17500, 18000, 18500],
        borderColor: '#F87171',
        borderDash: [5, 5],
      },
      {
        label: 'Upper Bound',
        data: [17500, 18500, 19000, 19500],
        borderColor: '#60A5FA',
        borderDash: [5, 5],
      },
    ],
  };
  const donutData = {
    labels: ['Card', 'Cash', 'Mpesa', 'Bank Transfer'],
    datasets: [
      {
        label: 'Payment Methods',
        data: [8200, 5400, 6100, 3200],
        backgroundColor: ['#A3BFFA', '#4B5EAA', '#2E7D7D', '#6B7280'],
      },
    ],
  };
  const edaStats = { count: 12000, mean: 14000, std: 1800, nulls: 2 };
  const sankeyData = {
    nodes: [
      { id: 'Start', name: 'Start' },
      { id: 'Browse', name: 'Browse' },
      { id: 'Add to Cart', name: 'Add to Cart' },
      { id: 'Checkout', name: 'Checkout' },
      { id: 'Purchase', name: 'Purchase' },
    ],
    links: [
      { source: 'Start', target: 'Browse', value: 1000 },
      { source: 'Browse', target: 'Add to Cart', value: 700 },
      { source: 'Add to Cart', target: 'Checkout', value: 500 },
      { source: 'Checkout', target: 'Purchase', value: 400 },
    ],
  };
  const candleData = [
    { time: 1752960000, open: 5000, high: 5200, low: 4800, close: 5100, volume: 120 },
    { time: 1753046400, open: 5100, high: 5300, low: 5050, close: 5250, volume: 140 },
    { time: 1753132800, open: 5250, high: 5400, low: 5200, close: 5350, volume: 110 },
    { time: 1753219200, open: 5350, high: 5500, low: 5300, close: 5450, volume: 150 },
    { time: 1753305600, open: 5450, high: 5600, low: 5400, close: 5550, volume: 130 },
    { time: 1753392000, open: 5550, high: 5700, low: 5500, close: 5650, volume: 160 },
    { time: 1753478400, open: 5650, high: 5800, low: 5600, close: 5750, volume: 170 },
  ];

  useEffect(() => {
    // Simulate data fetching or validation
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-[#1E2A44] flex items-center justify-center w-full"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2E7D7D] mx-auto"></div>
          <p className="mt-4 text-gray-300 font-inter text-lg">Loading Analytics...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-[#1E2A44] flex items-center justify-center w-full"
      >
        <div className="text-center bg-[#2E7D7D]/10 rounded-xl p-8 border border-[#2E7D7D]/30">
          <p className="text-red-400 font-inter text-lg">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 bg-[#2E7D7D] text-white px-6 py-2 rounded-lg hover:bg-[#2E7D7D]/80"
          >
            Return to Home
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen w-full bg-[#1E2A44] p-6 font-inter text-white">
        {/* Profit Candlestick Chart Card */}
        <section className="mb-8 w-full">
          <div className="w-full bg-[#2E7D7D]/10 rounded-xl shadow-lg border border-[#2E7D7D]/30 p-6 flex flex-col items-center justify-center" style={{ minHeight: '400px' }}>
            <h2 className="text-2xl font-bold mb-4">Profit (KSH) Candlestick Chart</h2>
            <p className="text-sm text-gray-300 mb-6">Visualize your daily profit trends. Each candle shows open, high, low, close, and volume for the day.</p>
            <TradingChart candles={candleData} blur={userPlan === 'Free'} />
          </div>
        </section>

        {/* KPI Cards */}
        <section className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard label="Daily Growth" value={`${kpi.daily}%`} trend={kpi.daily > 0 ? 'up' : 'down'} />
          <KPICard label="Monthly Growth" value={`${kpi.monthly}%`} trend={kpi.monthly > 0 ? 'up' : 'down'} />
          <KPICard label="YoY Growth" value={`${kpi.yoy}%`} trend={kpi.yoy > 0 ? 'up' : 'down'} />
          <KPICard label="Active Customers" value={1200} trend="neutral" />
        </section>

        {/* Storytelling Visuals */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-[#2E7D7D]/10 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Sales & Profit Trends</h3>
            <TimeSeriesChart data={trendData} />
          </div>
          <div className="bg-[#2E7D7D]/10 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Sales Forecast</h3>
            <ForecastChart data={forecastData} title="Sales Forecast" />
          </div>
          <div className="bg-[#2E7D7D]/10 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Top Products</h3>
            <TopNBarChart data={topNData} title="Top Products" />
          </div>
          <div className="bg-[#2E7D7D]/10 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Sales Breakdown</h3>
            <DonutChart data={donutData} title="Sales Breakdown" />
          </div>
        </section>

        {/* EDA Summary & Sankey */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-[#2E7D7D]/10 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">EDA Summary</h3>
            <EDASummary stats={edaStats} />
          </div>
          <div className="bg-[#2E7D7D]/10 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Customer Funnel</h3>
            <SankeyDiagram data={sankeyData} title="Customer Funnel" />
          </div>
        </section>

        {/* Ask AI & Scheduling */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Ask About Your Data</h3>
          <div className="flex gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Show sales trends for Q2"
              className="bg-[#2E7D7D]/20 text-white px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#2E7D7D]"
            />
            <button className="bg-[#2E7D7D] text-white px-4 py-2 rounded-lg shadow hover:bg-[#2E7D7D]/80 transition-colors">
              Ask AI
            </button>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-4">Scheduled Analytics</h3>
          <div className="text-gray-400 mb-4">
            You have 2 active schedules. Next run: <span className="text-[#2E7D7D] font-medium">2025-07-20</span>
          </div>
          <div className="flex gap-4">
            <button className="bg-[#2E7D7D] text-white px-4 py-2 rounded-lg shadow hover:bg-[#2E7D7D]/80 transition-colors">
              Export PDF
            </button>
            <button className="bg-[#2E7D7D] text-white px-4 py-2 rounded-lg shadow hover:bg-[#2E7D7D]/80 transition-colors">
              Export CSV
            </button>
          </div>
        </section>
      </div>
    </ErrorBoundary>
  );
}