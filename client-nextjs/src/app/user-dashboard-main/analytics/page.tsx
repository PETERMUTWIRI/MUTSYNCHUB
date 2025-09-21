'use client';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, Input } from '@/components/ui';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Calendar, Bell } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AnalyticsPage() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const { data: tenant } = useQuery({ queryKey: ['tenant'], queryFn: () => fetch('/api/tenant/me').then((r) => r.json()) });
  const { data: live } = useQuery({ queryKey: ['live', tenant?.id], queryFn: () => fetch(`/api/analytics/live?orgId=${tenant?.id}`).then((r) => r.json()), refetchInterval: 5000, enabled: !!tenant });

  const askAI = async () => {
    if (!question.trim()) return;
    const res = await fetch('/api/ai/interpret', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ report: live, question }) });
    const j = await res.json();
    setAnswer(j.answer);
  };

  if (!tenant) return <div className="min-h-screen bg-[#1E2A44] grid place-items-center text-white">Loading…</div>;
  const color = { retail: '#10b981', wholesale: '#3b82f6', supermarket: '#f59e0b', manufacturing: '#ef4444', healthcare: '#8b5cf6' }[tenant.industry] ?? '#10b981';

  return (
    <div className="min-h-screen w-full bg-[#1E2A44] text-white font-inter">
      <header className="border-b border-[#2E7D7D]/30 bg-[#1E2A44]/80 backdrop-blur sticky top-0 z-10"><div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between"><h1 className="text-xl font-bold">Analytics – <span style={{ color }}>{tenant.industry}</span></h1><div className="flex items-center gap-4"><span className="text-sm text-gray-300">Tier: <span className="font-semibold">{tenant.tier}</span></span><Bell className="w-5 h-5 text-[#2E7D7D]" /></div></div></header>
      <main className="max-w-7xl mx-auto px-6 py-6 space-y-8">
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#2E7D7D]/10 rounded-xl shadow-lg p-6 border border-[#2E7D7D]/30"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-300">Today Sales</p><p className="text-2xl font-bold" style={{ color }}>KES {live?.summary?.daily_sales ?? 0}</p></div><TrendingUp className="text-2xl" style={{ color }} /></div></div>
          <div className="bg-[#2E7D7D]/10 rounded-xl shadow-lg p-6 border border-[#2E7D7D]/30"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-300">Items Sold</p><p className="text-2xl font-bold" style={{ color }}>{live?.summary?.daily_qty ?? 0}</p></div><BarChart3 className="text-2xl" style={{ color }} /></div></div>
          <div className="bg-[#2E7D7D]/10 rounded-xl shadow-lg p-6 border border-[#2E7D7D]/30"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-300">Avg Basket</p><p className="text-2xl font-bold" style={{ color }}>KES {live?.summary?.avg_basket ?? 0}</p></div><PieChartIcon className="text-2xl" style={{ color }} /></div></div>
          <div className="bg-[#2E7D7D]/10 rounded-xl shadow-lg p-6 border border-[#2E7D7D]/30"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-300">Live Status</p><p className="text-2xl font-bold" style={{ color: live ? '#10b981' : '#ef4444' }}>{live ? 'Online' : 'Offline'}</p></div><Calendar className="text-2xl" style={{ color: live ? '#10b981' : '#ef4444' }} /></div></div>
        </section>
        <Card className="bg-[#2E7D7D]/10 border border-[#2E7D7D]/30"><CardHeader><CardTitle className="text-lg text-gray-200">7-Day Trend</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={300}><LineChart data={live?.trend ?? []}><CartesianGrid stroke="#2E7D7D" strokeOpacity={0.3} /><XAxis dataKey="date" stroke="#9ca3af" /><YAxis stroke="#9ca3af" /><Tooltip contentStyle={{ backgroundColor: '#1E2A44', border: '1px solid #2E7D7D' }} /><Line type="monotone" dataKey="sales" stroke={color} name="Sales" /><Line type="monotone" dataKey="profit" stroke="#A3BFFA" name="Profit" /></LineChart></ResponsiveContainer></CardContent></Card>
        <Card className="bg-[#2E7D7D]/10 border border-[#2E7D7D]/30"><CardHeader><CardTitle className="text-lg text-gray-200">Ask AI Agent</CardTitle></CardHeader><CardContent><div className="flex gap-2 mb-4"><Input placeholder="E.g. Why did profit drop today?" value={question} onChange={(e) => setQuestion(e.target.value)} className="bg-[#1E2A44] border border-[#2E7D7D]/50 text-gray-200" /><Button onClick={askAI} className="bg-[#2E7D7D] hover:bg-[#2E7D7D]/80 text-white">Ask</Button></div>{answer && <div className="text-sm text-gray-300 whitespace-pre-wrap">{answer}</div>}</CardContent></Card>
      </main>
    </div>
  );
}
