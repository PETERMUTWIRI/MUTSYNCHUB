'use client';
import React, { useState, useEffect } from 'react';
import { useUser } from '@stackframe/stack';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Calendar, Bell, Download, UploadCloud } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useDrillDown } from '@/lib/useDrillDown';

export default function AnalyticsPage() {
  const user = useUser({ or: 'redirect' });
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');

  const { data: tenant } = useQuery({
    queryKey: ['tenant'],
    queryFn: () => fetch('/api/tenant/me').then((r) => r.json()),
  });
  
  const { data: live } = useQuery({
    queryKey: ['live', tenant?.id],
    queryFn: () => fetch(`/api/analytics/live?orgId=${tenant?.id}`).then((r) => r.json()),
    refetchInterval: 5000,
    enabled: !!tenant,
  });
  const drill = useDrillDown(live?.trend ?? []);
  const [drillInsight, setDrillInsight] = useState('');  
  const askAI = async () => {
    if (!aiQuestion.trim()) return;
    const res = await fetch('/api/ai/interpret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ report: live, question: aiQuestion }),
    });
    const j = await res.json();
    setAiAnswer(j.answer);
  };

  if (!tenant) return <div className="min-h-screen bg-[#1E2A44] grid place-items-center text-white">Loading…</div>;

  const industryColor = {
    retail: '#10b981',
    wholesale: '#3b82f6',
    supermarket: '#f59e0b',
    manufacturing: '#ef4444',
    healthcare: '#8b5cf6',
  }[tenant.industry] ?? '#10b981';

  return (
    <div className="min-h-screen w-full bg-[#1E2A44] text-white font-inter">
      <header className="border-b border-[#2E7D7D]/30 bg-[#1E2A44]/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Analytics – <span style={{ color: industryColor }}>{tenant.industry}</span></h1>
          <div className="flex items-center gap-4"><span className="text-sm text-gray-300">Tier: <span className="font-semibold">{tenant.tier}</span></span><Bell className="w-5 h-5 text-[#2E7D7D]" /></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-8">
        {/* Live KPIs */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard title="Today Sales" value={`KES ${live?.summary?.daily_sales ?? 0}`} color={industryColor} icon={<TrendingUp />} />
          <KPICard title="Items Sold" value={live?.summary?.daily_qty ?? 0} color={industryColor} icon={<BarChart3 />} />
          <KPICard title="Avg Basket" value={`KES ${live?.summary?.avg_basket ?? 0}`} color={industryColor} icon={<PieChartIcon />} />
          <KPICard title="Live Status" value={live ? 'Online' : 'Offline'} color={live ? '#10b981' : '#ef4444'} icon={<Calendar />} />
        </section>

        {/* AI Interpreter */}
        <Card className="bg-[#2E7D7D]/10 border border-[#2E7D7D]/30">
          <CardHeader><CardTitle className="text-lg text-gray-200">Ask AI Agent</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input placeholder="E.g. Why did profit drop today?" value={aiQuestion} onChange={(e) => setAiQuestion(e.target.value)} className="bg-[#1E2A44] border border-[#2E7D7D]/50 text-gray-200" />
              <Button onClick={askAI} className="bg-[#2E7D7D] hover:bg-[#2E7D7D]/80 text-white">Ask</Button>
            </div>
            {aiAnswer && <div className="text-sm text-gray-300 whitespace-pre-wrap">{aiAnswer}</div>}
          </CardContent>
        </Card>

        {/* Trends Chart */}
        <Card className="bg-[#2E7D7D]/10 border border-[#2E7D7D]/30">
          <CardHeader><CardTitle className="text-lg text-gray-200">7-Day Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={live?.trend ?? []}>
                <CartesianGrid stroke="#2E7D7D" strokeOpacity={0.3} />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1E2A44', border: '1px solid #2E7D7D' }} />
                <Line type="monotone" dataKey="sales" stroke={industryColor} name="Sales" />
                <Line type="monotone" dataKey="profit" stroke="#A3BFFA" name="Profit" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AI-Assisted Drill-Down */}
        <Card className="bg-[#2E7D7D]/10 border border-[#2E7D7D]/30">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-lg text-gray-200">Drill-Down (AI Assisted)</CardTitle>
            <div className="flex gap-2">
              {drill.stack.map((s, i) => (
                <span key={i} className="px-2 py-1 text-xs rounded bg-[#2E7D7D]/30 text-gray-200">
                  {s.key} = {String(s.value)}
                </span>
              ))}
              {drill.stack.length > 0 && (
                <Button size="sm" variant="outline" onClick={drill.pop} className="text-xs">← Back</Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {/* mini bar chart of filtered data */}
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={drill.filtered.slice(0, 20)} onClick={(e: any) => e && drill.drill({ key: e.activeLabel, value: e.activeLabel })}>
                <CartesianGrid stroke="#2E7D7D" strokeOpacity={0.3} />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1E2A44', border: '1px solid #2E7D7D' }} />
                <Bar dataKey="sales" fill={industryColor} cursor="pointer" />
              </BarChart>
            </ResponsiveContainer>

            {/* AI insight for current slice */}
            <div className="mt-4">
              <Button
                size="sm"
                onClick={async () => {
                  const res = await fetch('/api/ai/interpret', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ report: { filtered: drill.filtered }, question: `Why did ${drill.stack.map((s) => `${s.key}=${s.value}`).join(', ')} change?` }),
                  });
                  const j = await res.json();
                  setDrillInsight(j.answer);
                }}
                className="bg-[#2E7D7D] hover:bg-[#2E7D7D]/80 text-white"
              >
                Explain this slice
              </Button>
              {drillInsight && <p className="mt-2 text-sm text-gray-300">{drillInsight}</p>}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

const KPICard = ({ title, value, icon, color }: any) => (
  <motion.div whileHover={{ scale: 1.02 }} className="bg-[#2E7D7D]/10 rounded-xl shadow-lg p-6 border border-[#2E7D7D]/30">
    <div className="flex items-center justify-between">
      <div><p className="text-sm text-gray-300">{title}</p><p className="text-2xl font-bold" style={{ color }}>{value}</p></div>
      <div className="text-2xl" style={{ color }}>{icon}</div>
    </div>
  </motion.div>
);
