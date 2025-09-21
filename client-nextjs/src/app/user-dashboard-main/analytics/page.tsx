// client-nextjs/src/app/user-dashboard-main/analytics/page.tsx
/* ------------------------------------------------------------------
 * 2040-Ready Enterprise-Analytics Dashboard
 * Isaac Newton mode – no magic strings, no leaks, no excuses.
 * ------------------------------------------------------------------ */

'use client';
// import React, { useState, useMemo } from 'react';
// import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input} from '@/components/ui/input';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Calendar, Bell, Download, Clock, Plus } from 'lucide-react';
// import { toast } from 'react-hot-toast';
// import { format, addDays } from 'date-fns';
import { useDrillDown } from '@/lib/useDrillDown';
import { getAnalyticsUsage } from '@/lib/analytics-usage';
import { createScheduledReport } from '@/app/actions/analytics-schedule';
import { Button} from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

import { useMemo, useState, useEffect } from 'react';
import {
  useQuery,
  useQueryClient,
  useMutation,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { useUser } from '@stackframe/stack';
import { useFlag } from '@/hooks/useFlag'; // central feature-flag service
import { useTranslation } from 'react-i18next'; // i18n ready
import { toast } from 'react-hot-toast';
import { format, addDays } from 'date-fns';


export default function AnalyticsPage() {
  const { t } = useTranslation();
  const user = useUser({ or: 'redirect' });
  const qc = useQueryClient();

  const org = useOrgProfile();
  const orgId = org.orgId;

  const { data: live } = useLiveData(orgId);
  const { data: trend } = useTrendData(orgId);
  const { data: usage } = useUsageQuota(orgId);
  const { data: schedules } = useSchedules(orgId);

  const aiEnabled = useFlag('analytics-ai'); // feature flag
  const exportEnabled = useFlag('analytics-export');

  /* ---------- mutations ---------- */
  const createSchedule = useMutation({
    mutationFn: (cron: string) => analyticsAPI.createSchedule(orgId, cron),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['analytics-schedules', orgId] }),
  });

  const exportReport = useMutation({
    mutationFn: (format: 'csv' | 'pdf') => analyticsAPI.export(orgId, format),
    onSuccess: ({ downloadUrl }) => window.open(downloadUrl, '_blank'),
  });

  /* ---------- local state ---------- */
  const [question, setQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<{ text: string; chart?: TrendPoint[] } | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [cron, setCron] = useState('0 8 * * MON');

  /* ---------- side effects ---------- */
  useEffect(() => {
    if (usage && usage.remaining <= 2 && usage.limit > 0)
      toast(t('analytics.quotaLow', { remaining: usage.remaining }));
  }, [usage, t]);

  /* ---------- handlers ---------- */
  const askAI = async () => {
    if (!question.trim() || !aiEnabled) return;
    const res = await fetch('/api/ai/interpret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgId, question, report: live }),
    });
    const json = await res.json();
    setAiAnswer(json);
  };

  /* ---------- render ---------- */
  return (
    <AnalyticsErrorBoundary>
      <div className="min-h-screen w-full bg-[#1E2A44] text-white font-inter">
        <header className="border-b border-[#2E7D7D]/30 bg-[#1E2A44]/80 backdrop-blur sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold">
              {t('analytics.title')} –{' '}
              <span className="text-teal-400">{org?.firstName || user.displayName}</span>
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-300">
                {t('analytics.role')}: <span className="font-semibold">{org.role}</span>
              </span>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-6 space-y-8">
          {/* Quota banner */}
          {usage && usage.limit > 0 && (
            <QuotaBanner usage={usage} t={t} />
          )}

          {/* KPI row */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard title={t('analytics.todaySales')} value={`KES ${live?.daily_sales ?? 0}`} />
            <KPICard title={t('analytics.itemsSold')} value={live?.daily_qty ?? 0} />
            <KPICard title={t('analytics.avgBasket')} value={`KES ${live?.avg_basket ?? 0}`} />
            <KPICard title={t('analytics.status')} value={live ? 'Online' : 'Offline'} statusColor={live ? '#10b981' : '#ef4444'} />
          </section>

          {/* Trend chart */}
          <TrendChart data={trend ?? []} t={t} />

          {/* AI Agent */}
          {aiEnabled && (
            <AIAgent question={question} setQuestion={setQuestion} answer={aiAnswer} onAsk={askAI} t={t} />
          )}

          {/* Scheduled reports */}
          <ScheduledReports
            schedules={schedules ?? []}
            onNew={() => setScheduleOpen(true)}
            t={t}
          />

          {/* Export */}
          {exportEnabled && (
            <div className="flex gap-2">
              <Button onClick={() => exportReport.mutate('csv')}>{t('analytics.exportCSV')}</Button>
              <Button onClick={() => exportReport.mutate('pdf')}>{t('analytics.exportPDF')}</Button>
            </div>
          )}

          {/* Schedule modal */}
          {scheduleOpen && (
            <ScheduleModal
              cron={cron}
              setCron={setCron}
              onSave={() => {
                createSchedule.mutate(cron);
                setScheduleOpen(false);
              }}
              onClose={() => setScheduleOpen(false)}
              t={t}
            />
          )}
        </main>
      </div>
    </AnalyticsErrorBoundary>
  );
}

/* ------------------------------------------------------------------
 * 6. Sub-components – kept pure, testable
 * ------------------------------------------------------------------ */
const QuotaBanner = ({ usage, t }: { usage: UsageQuota; t: TFunction }) => (
  <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg p-4">
    <p className="text-sm text-gray-300">
      {t('analytics.usage')}: {usage.used} / {usage.limit}
    </p>
    <progress value={(usage.used / usage.limit) * 100} max={100} className="w-full" />
  </div>
);

const KPICard = ({ title, value, statusColor }: { title: string; value: string | number; statusColor?: string }) => (
  <div className="bg-[#2E7D7D]/10 rounded-xl p-6 border border-[#2E7D7D]/30">
    <p className="text-sm text-gray-300">{title}</p>
    <p className="text-2xl font-bold" style={{ color: statusColor }}>{value}</p>
  </div>
);

const TrendChart = ({ data, t }: { data: TrendPoint[]; t: TFunction }) => (
  <div className="bg-[#2E7D7D]/10 rounded-xl p-6 border border-[#2E7D7D]/30">
    <h2 className="text-lg mb-4">{t('analytics.trendTitle')}</h2>
    {/* Recharts or any chart lib */}
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid stroke="#2E7D7D" strokeOpacity={0.3} />
        <XAxis dataKey="date" stroke="#9ca3af" />
        <YAxis stroke="#9ca3af" />
        <Tooltip contentStyle={{ backgroundColor: '#1E2A44', border: '1px solid #2E7D7D' }} />
        <Bar dataKey="sales" fill="#2E7D7D" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

const AIAgent = ({ question, setQuestion, answer, onAsk, t }: any) => (
  <div className="bg-[#2E7D7D]/10 rounded-xl p-6 border border-[#2E7D7D]/30">
    <h2 className="text-lg mb-4">{t('analytics.aiTitle')}</h2>
    <div className="flex gap-2 mb-4">
      <Input
        placeholder={t('analytics.aiPlaceholder')}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="bg-[#1E2A44] border border-[#2E7D7D]/50 text-gray-200"
      />
      <Button onClick={onAsk} className="bg-[#2E7D7D] hover:bg-[#2E7D7D]/80 text-white">
        {t('analytics.ask')}
      </Button>
    </div>
    {answer && <p className="text-sm text-gray-300">{answer.text}</p>}
  </div>
);

const ScheduledReports = ({ schedules, onNew, t }: any) => (
  <div className="bg-[#2E7D7D]/10 rounded-xl p-6 border border-[#2E7D7D]/30">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg">{t('analytics.scheduledReports')}</h2>
      <Button onClick={onNew} className="bg-[#2E7D7D] hover:bg-[#2E7D7D]/80 text-white">
        <Plus className="w-4 h-4 mr-1" /> {t('analytics.new')}
      </Button>
    </div>
    {schedules.length ? (
      schedules.map((s: ScheduledReport) => (
        <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-[#1E2A44] border border-[#2E7D7D]/30 mb-2">
          <div>
            <p className="font-medium text-gray-200">Every {s.frequency}</p>
            <p className="text-xs text-gray-400">Next: {format(new Date(s.nextRun), 'PPp')}</p>
          </div>
          <Clock className="w-4 h-4 text-[#2E7D7D]" />
        </div>
      ))
    ) : (
      <p className="text-sm text-gray-400">{t('analytics.noSchedules')}</p>
    )}
  </div>
);

const ScheduleModal = ({ cron, setCron, onSave, onClose, t }: any) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
    <div className="bg-[#1E2A44] border border-[#2E7D7D]/30 rounded-lg p-6 w-full max-w-md">
      <h3 className="text-lg mb-4">{t('analytics.scheduleModalTitle')}</h3>
      <Input
        value={cron}
        onChange={(e) => setCron(e.target.value)}
        placeholder="0 8 * * MON"
        className="mb-4 bg-[#1E2A44] border border-[#2E7D7D]/50 text-gray-200"
      />
      <div className="flex gap-2">
        <Button onClick={onSave} className="bg-[#2E7D7D] hover:bg-[#2E7D7D]/80 text-white">
          {t('analytics.save')}
        </Button>
        <Button variant="outline" onClick={onClose}>
          {t('analytics.cancel')}
        </Button>
      </div>
    </div>
  </div>
);

/* ------------------------------------------------------------------
 * 7. Storybook meta (optional)
 * ------------------------------------------------------------------ */
export const meta = {
  title: 'Enterprise/AnalyticsPage',
  component: AnalyticsPage,
};