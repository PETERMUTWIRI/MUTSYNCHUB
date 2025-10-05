
// client-nextjs/src/app/user-dashboard-main/analytics/page.tsx
/* ------------------------------------------------------------------
 * 2040-Ready Enterprise-Analytics Dashboard  –  ISAAC NEWTON EDITION
 * ------------------------------------------------------------------ */
'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  useQuery,
  useQueryClient,
  useMutation,
} from '@tanstack/react-query';
import { useUser } from '@stackframe/stack';
import { useFlag } from '@/hooks/useFlag';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { format, addDays, startOfDay } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  Bell,
  Download,
  Clock,
  Plus,
  Sparkles,
  Zap,
  AlertTriangle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { LiveIndicator } from '@/components/data-source/live-indicator';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ProgressCircle } from '@/components/ui/progress-circle'; // fancy radial
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useDrillDown } from '@/lib/useDrillDown';
import { DataGateway } from '@/lib/websocket';
import { getAnalyticsContext } from '@/lib/analytics-context'; // fetches org + plan + usage + flags
import { createScheduledReport } from '@/app/actions/analytics-schedule';
import { enforceAnalyticsLimit } from '@/lib/billing';
import { createNotification } from '@/lib/notification';
import {useOrgProfile} from '@/hooks/useOrgProfile';
/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */
type Context = Awaited<ReturnType<typeof getAnalyticsContext>>;
type LiveSummary = { daily_sales: number; daily_qty: number; avg_basket: number; online: boolean };
type TrendPoint = { date: string; sales: number; qty: number };
type Schedule = { id: string; frequency: string; nextRun: string };

/* ------------------------------------------------------------------ */
/* Service layer (thin)                                               */
/* ------------------------------------------------------------------ */
const analyticsAPI = {
  live: (orgId: string) =>
    fetch(`${process.env.NEXT_PUBLIC_ANALYTICS_URL}/live?orgId=${orgId}`)
      .then((r) => r.json())
      .then((j) => j as LiveSummary),
  trend: (orgId: string) =>
    fetch(`${process.env.NEXT_PUBLIC_ANALYTICS_URL}/trend?orgId=${orgId}`)
      .then((r) => r.json())
      .then((j) => j as TrendPoint[]),
  schedules: (orgId: string) =>
    fetch(`${process.env.NEXT_PUBLIC_ANALYTICS_URL}/schedules?orgId=${orgId}`)
      .then((r) => r.json())
      .then((j) => j as Schedule[]),
  export: (orgId: string, format: 'csv' | 'pdf') =>
    fetch(`${process.env.NEXT_PUBLIC_ANALYTICS_URL}/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgId, format }),
    }).then((r) => r.json()) as Promise<{ downloadUrl: string }>,
  ai: (orgId: string, question: string, report: LiveSummary) =>
    fetch(`${process.env.NEXT_PUBLIC_ANALYTICS_URL}/ai/interpret`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgId, question, report }),
    }).then((r) => r.json()) as Promise<{ text: string; chart?: any }>,
};

/* ------------------------------------------------------------------ */
/* Hooks                                                              */
/* ------------------------------------------------------------------ */
function useLiveData(orgId: string) {
  return useQuery({
    queryKey: ['analytics-live', orgId],
    queryFn: () => analyticsAPI.live(orgId),
    refetchInterval: 5000,
    enabled: !!orgId,
  });
}

function useTrendData(orgId: string) {
  return useQuery({
    queryKey: ['analytics-trend', orgId],
    queryFn: () => analyticsAPI.trend(orgId),
    enabled: !!orgId,
  });
}

function useSchedules(orgId: string) {
  return useQuery({
    queryKey: ['analytics-schedules', orgId],
    queryFn: () => analyticsAPI.schedules(orgId),
    enabled: !!orgId,
  });
}

/* ------------------------------------------------------------------ */
/* Newton says: let there be life
/* ------------------------------------------------------------------ */
export default function AnalyticsPage() {
  const { t } = useTranslation();
  const user = useUser({ or: 'redirect' });
  const qc = useQueryClient();

  /* --------- context (org + plan + usage + flags) --------- */
  const { data: ctx } = useOrgProfile(); 
  const orgId = ctx?.orgId ?? '';
  const { data: flags } = useQuery({
    queryKey: ['flags', ctx?.orgId],
    queryFn: () =>
      fetch(`${process.env.NEXT_PUBLIC_ANALYTICS_URL}/flags`)
        .then((r) => r.json()) as Promise<Array<{ key: string; enabled: boolean }>>,
    enabled: !!ctx?.orgId,
  });
 

  const aiEnabled = flags?.find((f) => f.key === 'analytics-ai')?.enabled ?? false;
  const exportEnabled = flags?.find((f) => f.key === 'analytics-export')?.enabled ?? false;
  const liveTileEnabled = flags?.find((f) => f.key === 'analytics-live-tile')?.enabled ?? true;
   
  /* --------- live data --------- */
  const { data: live } = useLiveData(orgId);
  const { data: trend } = useTrendData(orgId);
  const { data: schedules } = useSchedules(orgId);

  /* --------- mutations --------- */
  const exportMut = useMutation({
    mutationFn: (format: 'csv' | 'pdf') => analyticsAPI.export(orgId, format),
    onSuccess: ({ downloadUrl }) => window.open(downloadUrl, '_blank'),
    onError: () => toast.error('Export failed'),
  });

  const createScheduleMut = useMutation({
    mutationFn: async (cron: string) => {
      await enforceAnalyticsLimit(orgId, 'Analytics-Schedule');
      return createScheduledReport(orgId, cron);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['analytics-schedules', orgId] });
      toast.success('Scheduled report created');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  /* --------- local state --------- */
  const [question, setQuestion] = useState('');
  const [aiReply, setAiReply] = useState<{ text: string; chart?: any } | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [cron, setCron] = useState('0 8 * * MON');
  const [drillInsight, setDrillInsight] = useState<string>('');

  /* --------- drill-down --------- */
  const drill = useDrillDown(trend ?? []);

  /* --------- websocket live tile --------- */
  /* --------- websocket live tile --------- */
  useEffect(() => {
    if (!liveTileEnabled || !orgId) return;

    import('@/lib/websocket').then(({ DataGateway }) => {
      const socket = DataGateway.connect(orgId);

      socket.on('analytics:live', (payload: LiveSummary) => {
        qc.setQueryData(['analytics-live', orgId], payload);
      });

      socket.on('connect', () => console.log('[ws] analytics live'));
      socket.on('disconnect', () => console.warn('[ws] analytics offline – polling'));
    });

    return () => {
      DataGateway.disconnect?.(orgId);
    };
  }, [orgId, liveTileEnabled, qc]);

  /* --------- AI agent --------- */
  const askAI = async () => {
    if (!question.trim() || !aiEnabled || !live) return;
    toast.promise(
      analyticsAPI.ai(orgId, question, live).then(setAiReply),
      { loading: 'Thinking…', success: 'Answer ready', error: 'AI failed' }
    );
  };

  /* --------- side effects --------- */
  useEffect(() => {
    if (!ctx?.usage) return;
    if (ctx.usage.remaining <= 2 && ctx.usage.limit > 0) {
      toast(`⚠️  Only ${ctx.usage.remaining} exports left this month.`, { icon: '🔔', duration: 6000 });
      createNotification(orgId, {
        title: 'Quota low',
        message: `You have ${ctx.usage.remaining} exports remaining.`,
        type: 'WARNING',
      });
    }
  }, [ctx?.usage, orgId]);

  /* --------- render --------- */
  if (!ctx) return <Skeleton />;

  const industryColor = (ctx?.plan?.features as any[])?.find((f: any) => f.name === 'Industry-Color')?.value ?? '#10b981';

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0B1120] to-[#1E2A44] text-white font-inter">
      {/* ------- header ------- */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-20 bg-black/30 backdrop-blur-xl border border-white/10 rounded-b-2xl px-6 py-4"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
              {t('analytics.title')}
            </h1>
            <p className="text-sm text-gray-400">
              {ctx?.firstName || user.displayName} • {ctx?.plan?.name ?? ''} plan
            </p>
          </div>
          <div className="flex items-center gap-3">
            <LiveIndicator live={!!live?.online} />
            <Bell className="w-5 h-5 text-teal-400 cursor-pointer" onClick={() => toast('Notifications centre coming soon')} />
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-10">
        {/* ------- quota radial ------- */}
        {ctx?.usage?.limit && ctx.usage.limit > 0 && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center gap-6">
              <ProgressCircle
                value={(ctx.usage.used / ctx.usage.limit) * 100}
                size={80}
                strokeWidth={8}
                color={ctx.usage.remaining <= 2 ? '#f59e0b' : '#10b981'}
              />
              <div>
                <p className="text-sm text-gray-300">{t('analytics.usage')}</p>
                <p className="text-xl font-semibold">
                  {ctx.usage.used} / {ctx.usage.limit}
                </p>
                {ctx.usage.remaining <= 2 && (
                  <p className="text-xs text-amber-400 mt-1">Upgrade to unlock unlimited exports</p>
                )}
              </div>
              <div className="ml-auto">
                <Button
                  onClick={() => toast('Billing centre opening…')}
                  className="bg-gradient-to-r from-teal-500 to-cyan-400 text-white"
                >
                  Upgrade
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ------- KPI cards ------- */}
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <KPICard
            icon={<TrendingUp />}
            title={t('analytics.todaySales')}
            value={`KES ${live?.daily_sales ?? 0}`}
            color={industryColor}
          />
          <KPICard
            icon={<BarChart3 />}
            title={t('analytics.itemsSold')}
            value={live?.daily_qty ?? 0}
            color={industryColor}
          />
          <KPICard
            icon={<PieChartIcon />}
            title={t('analytics.avgBasket')}
            value={`KES ${live?.avg_basket ?? 0}`}
            color={industryColor}
          />
          <KPICard
            icon={<Zap />}
            title={t('analytics.status')}
            value={live?.online ? 'Online' : 'Offline'}
            color={live?.online ? '#10b981' : '#ef4444'}
            pulse={live?.online}
          />
        </motion.section>

        {/* ------- trend + drill ------- */}
        <Tabs defaultValue="trend" className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <TabsList className="bg-black/20 border border-white/10">
            <TabsTrigger value="trend">Trend</TabsTrigger>
            <TabsTrigger value="pie">Distribution</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>
          <TabsContent value="trend">
            <TrendChart data={drill.filtered} color={industryColor} onDrill={drill.drill} onBack={drill.pop} stack={drill.stack} />
          </TabsContent>
          <TabsContent value="pie">
            <AnalyticsPieChart data={trend ?? []} color={industryColor} />
          </TabsContent>
          <TabsContent value="insights">
            <InsightPanel orgId={orgId} live={live} trend={trend} />
          </TabsContent>
        </Tabs>

        {/* ------- AI Agent ------- */}
        {aiEnabled && (
          <AIAgent
            question={question}
            setQuestion={setQuestion}
            reply={aiReply}
            onAsk={askAI}
            firstName={ctx?.firstName}
            planName={ctx?.plan?.name ?? ''}
          />
        )}

        {/* ------- Scheduled Reports ------- */}
        <ScheduledReports
          schedules={schedules ?? []}
          onNew={() => setShowScheduleModal(true)}
          limit={ctx?.usage?.limit ?? 0} 
          used={schedules?.length ?? 0}
        />

        {/* ------- Export buttons ------- */}
        {exportEnabled && (
          <div className="flex gap-3">
            <Button
              onClick={() => exportMut.mutate('csv')}
              className="bg-gradient-to-r from-teal-500 to-cyan-400 text-white"
            >
              <Download className="w-4 h-4 mr-2" /> CSV
            </Button>
            <Button
              onClick={() => exportMut.mutate('pdf')}
              className="bg-gradient-to-r from-teal-500 to-cyan-400 text-white"
            >
              <Download className="w-4 h-4 mr-2" /> PDF
            </Button>
          </div>
        )}

        {/* ------- Schedule modal ------- */}
        <AnimatePresence>
          {showScheduleModal && (
            <ScheduleModal
              cron={cron}
              setCron={setCron}
              onSave={() => {
                createScheduleMut.mutate(cron);
                setShowScheduleModal(false);
              }}
              onClose={() => setShowScheduleModal(false)}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-components (typed)                                             */
/* ------------------------------------------------------------------ */
const KPICard = ({
  icon,
  title,
  value,
  color,
  pulse,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  color?: string;
  pulse?: boolean;
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-lg"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className={`text-2xl font-bold ${pulse ? 'animate-pulse' : ''}`} style={{ color }}>
          {value}
        </p>
      </div>
      <div className="text-2xl" style={{ color }}>
        {icon}
      </div>
    </div>
  </motion.div>
);

const TrendChart = ({
  data,
  color,
  onDrill,
  onBack,
  stack,
}: {
  data: TrendPoint[];
  color: string;
  onDrill: (slice: { key: string; value: string | number }) => void;
  onBack: () => void;
  stack: { key: string; value: string | number }[];
}) => (
  <div>
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold">7-Day Trend</h3>
      {stack.length > 0 && (
        <Button onClick={onBack} size="sm" variant="outline">
          ← Back
        </Button>
      )}
    </div>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} onClick={(e) => e && onDrill({ key: 'date', value: e.activeLabel ?? '' })}>
        <CartesianGrid stroke="#2E7D7D" strokeOpacity={0.3} />
        <XAxis dataKey="date" stroke="#9ca3af" />
        <YAxis stroke="#9ca3af" />
        <Tooltip contentStyle={{ backgroundColor: '#1E2A44', border: '1px solid #2E7D7D' }} />
        <Bar dataKey="sales" fill={color} cursor="pointer" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

const AnalyticsPieChart = ({ data, color }: { data: TrendPoint[]; color: string }) => {
  const pieData = useMemo(() => {
    if (!Array.isArray(data)) return [];          // ← add this
    const total = data.reduce((s, d) => s + d.sales, 0);
    return data.map((d) => ({
      name: d.date,
      value: d.sales,
      percent: total ? ((d.sales / total) * 100).toFixed(1) : '0.0',
    }));
  }, [data]);

  if (!pieData.length) return <p className="text-sm text-gray-400">No data for pie chart</p>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={pieData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          fill={color}
          label={(e) => `${e.name}: ${e.percent}%`}
        >
          {pieData.map((_, i) => (
            <Cell
              key={`cell-${i}`}
              fill={`${color}${Math.round((i / pieData.length) * 255)
                .toString(16)
                .padStart(2, '0')}`}
            />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};

const InsightPanel = ({ orgId, live, trend }: { orgId: string; live: LiveSummary | undefined; trend: TrendPoint[] | undefined }) => {
  const { data: insight } = useQuery({
    queryKey: ['analytics-insight', orgId],
    queryFn: () =>
      fetch(`${process.env.NEXT_PUBLIC_ANALYTICS_URL}/ai/insight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId, live, trend }),
      }).then((r) => r.json()) as Promise<{ text: string }>,
    enabled: !!live && !!trend,
  });
  return (
    <div className="bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-xl p-4 border border-teal-500/30">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-5 h-5 text-teal-400" />
        <p className="text-sm font-semibold text-teal-300">Newton Insight</p>
      </div>
      <p className="text-sm text-gray-300">{insight?.text ?? 'Thinking…'}</p>
    </div>
  );
};

const AIAgent = ({
  question,
  setQuestion,
  reply,
  onAsk,
  firstName,
  planName,
}: {
  question: string;
  setQuestion: (q: string) => void;
  reply: { text: string; chart?: any } | null;
  onAsk: () => void;
  firstName?: string | null;
  planName: string;
}) => {
  const greeting = firstName ? `Hi ${firstName}` : 'Hello';
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-500/30"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-purple-300">AI Assistant</h3>
        <span className="text-xs text-purple-400 bg-purple-900/50 px-2 py-1 rounded-full">{planName}</span>
      </div>
      <p className="text-sm text-gray-300 mb-4">
        {greeting}, ask me anything about your data – trends, forecasts, or why yesterday dipped.
      </p>
      <div className="flex gap-2 mb-4">
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="E.g. Why did profit dip yesterday?"
          className="bg-black/30 border-purple-500/50 text-white"
          onKeyDown={(e) => e.key === 'Enter' && onAsk()}
        />
        <Button onClick={onAsk} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          Ask
        </Button>
      </div>
      <AnimatePresence>
        {reply && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-sm text-gray-200 bg-black/20 rounded-lg p-4"
          >
            {reply.text}
            {reply.chart && (
              <ResponsiveContainer width="100%" height={200} className="mt-4">
                <LineChart data={reply.chart}>
                  <CartesianGrid stroke="#444" />
                  <XAxis dataKey="label" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1E2A44', border: '1px solid #666' }} />
                  <Line type="monotone" dataKey="value" stroke="#A3BFFA" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ScheduledReports = ({
  schedules,
  onNew,
  limit,
  used,
}: {
  schedules: Schedule[];
  onNew: () => void;
  limit: number;
  used: number;
}) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold">Scheduled Reports</h3>
      <Button onClick={onNew} className="bg-gradient-to-r from-teal-500 to-cyan-400 text-white">
        <Plus className="w-4 h-4 mr-2" /> New
      </Button>
    </div>
    {schedules.length ? (
      <div className="space-y-3">
        {schedules.map((s) => (
          <div key={s.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <div>
              <p className="font-medium">Every {s.frequency}</p>
              <p className="text-xs text-gray-400">Next: {format(new Date(s.nextRun), 'PPp')}</p>
            </div>
            <Clock className="w-4 h-4 text-teal-400" />
          </div>
        ))}
      </div>
    ) : (
      <p className="text-sm text-gray-400">No schedules yet – create one above.</p>
    )}
    {limit > 0 && (
      <p className="text-xs text-gray-500 mt-4">
        {limit - used} of {limit} schedules remaining this month.
      </p>
    )}
  </div>
);

const ScheduleModal = ({
  cron,
  setCron,
  onSave,
  onClose,
}: {
  cron: string;
  setCron: (c: string) => void;
  onSave: () => void;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="bg-[#1E2A44] border border-white/10 rounded-2xl p-6 w-full max-w-md"
    >
      <h3 className="text-lg font-semibold mb-4">Create Scheduled Report</h3>
      <Input
        value={cron}
        onChange={(e) => setCron(e.target.value)}
        placeholder="0 8 * * MON"
        className="mb-4 bg-black/30 border-white/20"
      />
      <div className="flex gap-3">
        <Button onClick={onSave} className="bg-gradient-to-r from-teal-500 to-cyan-400 text-white">
          Save
        </Button>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </motion.div>
  </div>
);

const Skeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-[#0B1120] to-[#1E2A44] flex items-center justify-center">
    <div className="text-gray-400">Loading analytics…</div>
  </div>
);