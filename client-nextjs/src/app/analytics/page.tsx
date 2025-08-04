"use client";
import KPICard from '@/components/analytics/KPICard';
import TimeSeriesChart from '@/components/analytics/TimeSeriesChart';
import TopNBarChart from '@/components/analytics/TopNBarChart';
import ForecastChart from '@/components/analytics/ForecastChart';
import DonutChart from '@/components/analytics/DonutChart';
import EDASummary from '@/components/analytics/EDASummary';
import SankeyDiagram from '@/components/analytics/SankeyDiagram'; // Keep Sankey with Recharts
import TradingChart from '@/components/analytics/TradingChart';
import { useState } from 'react';

export default function AnalyticsPage() {
  // Synthetic demo data
  const kpi = { daily: 5.2, monthly: 12.8, yoy: 22.4 };

  // Time Series Data
  const trendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Sales',
        data: [12000, 13500, 12800, 14500, 16000, 15500, 17000],
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56,189,248,0.2)',
      },
      {
        label: 'Profit',
        data: [3200, 4100, 3900, 4700, 5200, 5100, 5900],
        borderColor: '#a78bfa',
        backgroundColor: 'rgba(167,139,250,0.2)',
      },
    ],
  };

  // Top Products Data
  const topNData = {
    labels: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'],
    datasets: [
      {
        label: 'Sales',
        data: [5200, 4800, 4300, 3900, 3700],
        backgroundColor: [
          '#38bdf8', '#a78bfa', '#f472b6', '#facc15', '#34d399'
        ],
      },
    ],
  };

  // Forecast Data
  const forecastData = {
    labels: ['Jul', 'Aug', 'Sep', 'Oct'],
    datasets: [
      {
        label: 'Forecast',
        data: [17000, 18000, 18500, 19000],
        borderColor: '#34d399',
      },
      {
        label: 'Lower Bound',
        data: [16500, 17500, 18000, 18500],
        borderColor: '#f87171',
        borderDash: [5,5],
      },
      {
        label: 'Upper Bound',
        data: [17500, 18500, 19000, 19500],
        borderColor: '#60a5fa',
        borderDash: [5,5],
      },
    ],
  };

  // Donut Chart Data
  const donutData = {
    labels: ['Card', 'Cash', 'Mpesa', 'Bank Transfer'],
    datasets: [
      {
        label: 'Payment Methods',
        data: [8200, 5400, 6100, 3200],
        backgroundColor: [
          '#38bdf8', '#a78bfa', '#f472b6', '#facc15'
        ],
      },
    ],
  };

  // EDA Summary
  const edaStats = { count: 12000, mean: 14000, std: 1800, nulls: 2 };

  // Sankey Data
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

  const [query, setQuery] = useState('');

  // Synthetic profit candlestick data for TradingChart (7 days)
  // Each candle: open, high, low, close, volume (profit in KSH)
  // time is UNIX timestamp (midnight for each day)
  const candleData = [
    { time: 1752960000, open: 5000, high: 5200, low: 4800, close: 5100, volume: 120 }, // Day 1
    { time: 1753046400, open: 5100, high: 5300, low: 5050, close: 5250, volume: 140 }, // Day 2
    { time: 1753132800, open: 5250, high: 5400, low: 5200, close: 5350, volume: 110 }, // Day 3
    { time: 1753219200, open: 5350, high: 5500, low: 5300, close: 5450, volume: 150 }, // Day 4
    { time: 1753305600, open: 5450, high: 5600, low: 5400, close: 5550, volume: 130 }, // Day 5
    { time: 1753392000, open: 5550, high: 5700, low: 5500, close: 5650, volume: 160 }, // Day 6
    { time: 1753478400, open: 5650, high: 5800, low: 5600, close: 5750, volume: 170 }, // Day 7
  ];

  // Simulate user plan (replace with real user plan from context/auth)
  const [userPlan, setUserPlan] = useState<'Free' | 'Pro' | 'Enterprise'>('Free'); // Change value for testing

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 p-8 font-inter">
      {/* Profit Candlestick Chart Card */}
      <section className="mb-8 w-full">
        <div className="w-full bg-gradient-to-br from-blue-900/80 to-purple-900/80 rounded-2xl shadow-2xl border border-blue-500/30 flex flex-col items-center justify-center" style={{ minHeight: '320px', height: '75%' }}>
          {/* Chart title and description moved above the chart */}
          <div className="w-full flex flex-col items-center justify-center pt-6">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2 drop-shadow-lg">Profit (KSH) Candlestick Chart</h2>
            <p className="text-lg text-blue-200 mb-4 font-medium">Visualize your daily profit trends. Each candle shows open, high, low, close, and volume for the day.</p>
          </div>
          {/* TradingChart with no blur for all users */}
          <div className="w-full">
            <TradingChart candles={candleData} blur={false} />
          </div>
        </div>
      </section>
      {/* KPI Cards */}
      <section className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-6">
        <KPICard label="Daily Growth" value={`${kpi.daily}%`} trend={kpi.daily > 0 ? 'up' : 'down'} />
        <KPICard label="Monthly Growth" value={`${kpi.monthly}%`} trend={kpi.monthly > 0 ? 'up' : 'down'} />
        <KPICard label="YoY Growth" value={`${kpi.yoy}%`} trend={kpi.yoy > 0 ? 'up' : 'down'} />
        <KPICard label="Active Customers" value={1200} trend="neutral" />
      </section>

      {/* Storytelling Visuals */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <TimeSeriesChart data={trendData} />
        <ForecastChart data={forecastData} title="Sales Forecast" />
        <TopNBarChart data={topNData} title="Top Products" />
        <DonutChart data={donutData} title="Sales Breakdown" />
      </section>

      {/* EDA Summary & Sankey */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <EDASummary stats={edaStats} />
        <SankeyDiagram data={sankeyData} title="Customer Funnel" />
      </section>

      {/* Ask AI & Scheduling */}
      <section className="mb-8">
        <div className="text-xl font-bold text-white mb-4">Ask About Your Data</div>
        <div className="flex gap-4">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="e.g. Show sales trends for Q2"
            className="bg-slate-800 text-white px-4 py-2 rounded-xl w-full"
          />
          <button className="bg-gradient-to-r from-teal-400 to-purple-600 text-white px-6 py-2 rounded-xl shadow hover:scale-105 transition">
            Ask AI
          </button>
        </div>
      </section>

      <section>
        <div className="text-xl font-bold text-white mb-4">Scheduled Analytics</div>
        <div className="text-slate-400">
          You have 2 active schedules. Next run:
          <span className="text-teal-400 font-bold"> 2025-07-20</span>
        </div>
        <div className="flex gap-4 mt-2">
          <button className="bg-gradient-to-r from-purple-600 to-teal-400 text-white px-6 py-2 rounded-2xl shadow-lg hover:scale-105 transition">
            Export PDF
          </button>
          <button className="bg-gradient-to-r from-indigo-600 to-blue-400 text-white px-6 py-2 rounded-2xl shadow-lg hover:scale-105 transition">
            Export CSV
          </button>
        </div>
      </section>
    </div>
  );
}
