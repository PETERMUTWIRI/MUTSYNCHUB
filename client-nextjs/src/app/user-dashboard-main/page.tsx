'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HiBell } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import dynamic from 'next/dynamic';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { ensureAndFetchUserProfile } from '@/app/api/get-user-role/action';

// Dynamic Imports
const UsageCard = dynamic(() => import('@/components/user/cards/UsageCard'), { ssr: false });
const PlanCard = dynamic(() => import('@/components/user/cards/PlanCard'), { ssr: false });
const BillingCard = dynamic(() => import('@/components/user/cards/BillingCard'), { ssr: false });
const NotificationsCard = dynamic(() => import('@/components/user/cards/NotificationsCard'), { ssr: false });
const SupportCard = dynamic(() => import('@/components/user/cards/SupportCard'), { ssr: false });
const TeamCard = dynamic(() => import('@/components/user/cards/TeamCard'), { ssr: false });
const AnnouncementsCard = dynamic(() => import('@/components/user/cards/AnnouncementsCard'), { ssr: false });
const UsageTrendsCard = dynamic(() => import('@/components/user/cards/UsageTrendsCard'), { ssr: false });
const AnomalyDetectionCard = dynamic(() => import('@/components/user/cards/AnomalyDetectionCard'), { ssr: false });
const ForecastCard = dynamic(() => import('@/components/user/cards/ForecastCard'), { ssr: false });
const UserInsightsCard = dynamic(() => import('@/components/user/cards/UserInsightsCard'), { ssr: false });
const AIChatButton = dynamic(() => import('@/components/user/AIChatButton'), { ssr: false });
const QueryAnalytics = dynamic(() => import('@/components/user/QueryAnalytics'), { ssr: false });
const ScheduleAnalytics = dynamic(() => import('@/components/user/ScheduleAnalytics'), { ssr: false });

const ResponsiveGridLayout = WidthProvider(Responsive);

// Default layouts for different user types
const defaultLayouts = {
  beginner: [
    { i: 'usage', x: 0, y: 0, w: 2, h: 2 },
    { i: 'plan', x: 2, y: 0, w: 2, h: 2 },
    { i: 'query', x: 0, y: 2, w: 4, h: 4 },
  ],
  power: [
    { i: 'usage', x: 0, y: 0, w: 2, h: 2 },
    { i: 'query', x: 2, y: 0, w: 4, h: 4 },
    { i: 'schedule', x: 0, y: 4, w: 4, h: 4 },
    { i: 'trends', x: 4, y: 0, w: 2, h: 2 },
    { i: 'anomaly', x: 4, y: 2, w: 2, h: 2 },
  ],
};

export default function UserDashboard() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPlans, setShowPlans] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'beginner' | 'power'>('beginner');
  const [layouts, setLayouts] = useState(defaultLayouts.beginner);
  const queryClient = useQueryClient();

  const plans = [
    { title: 'Starter', packages: ['Basic Analytics', 'Email Support'], price: 500 },
    { title: 'Pro', packages: ['Advanced Analytics', 'Priority Support', 'Team Access'], price: 2000 },
    { title: 'Enterprise', packages: ['Custom Integrations', 'Dedicated Manager', 'Unlimited Users'], price: 10000 },
  ];

  // Fetch user profile and layout
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const cachedSession = localStorage.getItem('userSession');
      if (cachedSession) {
        const parsed = JSON.parse(cachedSession);
        if (parsed.expiresAt && parsed.expiresAt > Date.now()) {
          return parsed;
        }
        localStorage.removeItem('userSession');
      }
      const profile = await ensureAndFetchUserProfile();
      localStorage.setItem('userSession', JSON.stringify({
        ...profile,
        expiresAt: Date.now() + 60 * 60 * 1000,
      }));
      return profile;
    },
  });

  const { data: savedLayout } = useQuery({
    queryKey: ['userLayout', orgId],
    queryFn: async () => {
      const res = await fetch(`/api/user/layouts?orgId=${orgId}`);
      if (!res.ok) throw new Error('Failed to fetch layout');
      return res.json();
    },
    enabled: !!orgId,
  });

  const saveLayoutMutation = useMutation({
    mutationFn: async (newLayout: any) => {
      const res = await fetch('/api/user/layouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId, layout: newLayout, mode: layoutMode }),
      });
      if (!res.ok) throw new Error('Failed to save layout');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userLayout'] }),
  });

  useEffect(() => {
    if (userProfile) {
      setRole(userProfile.role?.toLowerCase() || 'user');
      setOrgId(userProfile.orgId);
      setLayoutMode(userProfile.isTechnical ? 'power' : 'beginner');
      setLayouts(savedLayout || defaultLayouts[userProfile.isTechnical ? 'power' : 'beginner']);
      setLoading(false);
    }
  }, [userProfile, savedLayout]);

  useEffect(() => {
    if (!loading && role && role !== 'user' && role !== 'admin') {
      router.push('/unauthorized');
    }
  }, [role, loading, router]);

  const handleLayoutChange = (newLayout: any) => {
    setLayouts(newLayout);
    saveLayoutMutation.mutate(newLayout);
  };

  const handleUpgradeClick = () => setShowPlans(true);
  const handleClosePlans = () => setShowPlans(false);
  const handlePlanSelect = (plan: { title: string; packages: string[]; price: number }) => {
    router.push(`/payment?plan=${plan.title}`);
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-[#1E2A44] flex items-center justify-center w-full"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2E7D7D] mx-auto"></div>
          <p className="mt-4 text-gray-300 font-inter text-lg">Loading Dashboard...</p>
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
          <Button
            onClick={() => router.push('/')}
            className="mt-4 bg-[#2E7D7D] text-white px-6 py-2 rounded-lg hover:bg-[#2E7D7D]/80"
          >
            Return to Home
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="bg-[#1E2A44] text-gray-100 font-inter w-full min-h-screen">
      <header className="flex items-center justify-between px-8 py-4 bg-[#1E2A44] border-b border-[#2E7D7D]/30 shadow-lg w-full">
        <div className="flex items-center gap-4">
          <Input
            type="text"
            placeholder="Ask AI or search..."
            className="bg-[#2E7D7D]/20 border-[#2E7D7D] text-gray-100 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D7D] w-64"
          />
          <Select value={layoutMode} onValueChange={(value: 'beginner' | 'power') => setLayoutMode(value)}>
            <SelectTrigger className="bg-[#2E7D7D]/20 border-[#2E7D7D] text-gray-100">
              <SelectValue placeholder="Layout Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="power">Power User</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-6">
          <HiBell className="text-[#2E7D7D] text-xl animate-pulse" />
          <div className="w-8 h-8 rounded-full bg-[#2E7D7D] flex items-center justify-center text-white font-bold">
            {userProfile?.name?.[0] || 'U'}
          </div>
        </div>
      </header>

      {showPlans && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
        >
          <div className="bg-[#2E7D7D]/10 rounded-2xl shadow-2xl p-8 w-full max-w-md mx-auto relative border border-[#2E7D7D]/30">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 text-2xl" onClick={handleClosePlans}>
              &times;
            </button>
            <h2 className="text-3xl font-extrabold text-[#2E7D7D] mb-6 text-center">Choose Your Plan</h2>
            <div className="flex flex-col gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.title}
                  className="border border-[#2E7D7D]/30 rounded-xl p-6 flex flex-col gap-2 hover:shadow-xl hover:border-[#2E7D7D] transition-all cursor-pointer"
                  onClick={() => handlePlanSelect(plan)}
                >
                  <div className="text-2xl font-bold text-gray-100 mb-2">{plan.title}</div>
                  <ul className="mb-2">
                    {plan.packages.map((pkg) => (
                      <li key={pkg} className="text-gray-300 text-base">{pkg}</li>
                    ))}
                  </ul>
                  <div className="text-xl font-extrabold text-[#2E7D7D]">KES {plan.price.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <main className="p-6 max-w-7xl mx-auto w-full">
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: layouts }}
          breakpoints={{ lg: 1200, md: 996, sm: 768 }}
          cols={{ lg: 12, md: 10, sm: 6 }}
          rowHeight={100}
          onLayoutChange={handleLayoutChange}
          isDraggable
          isResizable
        >
          <div key="usage" className="bg-[#2E7D7D]/10 rounded-xl shadow-lg p-6 border border-[#2E7D7D]/30">
            <UsageCard />
          </div>
          <div key="plan" className="bg-[#2E7D7D]/10 rounded-xl shadow-lg p-6 border border-[#2E7D7D]/30">
            <PlanCard planName="Pro" renewalDate="2025-08-01" loading={false} error={false} handleUpgradeClick={handleUpgradeClick} />
          </div>
          <div key="billing" className="bg-[#2E7D7D]/10 rounded-xl shadow-lg p-6 border border-[#2E7D7D]/30">
            <BillingCard />
          </div>
          <div key="notifications" className="bg-[#2E7D7D]/10 rounded-xl shadow-lg p-6 border border-[#2E7D7D]/30">
            <NotificationsCard />
          </div>
          <div key="query" className="bg-[#2E7D7D]/10 rounded-xl shadow-lg p-6 border border-[#2E7D7D]/30">
            <QueryAnalytics />
          </div>
          <div key="schedule" className="bg-[#2E7D7D]/10 rounded-xl shadow-lg p-6 border border-[#2E7D7D]/30">
            <ScheduleAnalytics />
          </div>
          <div key="trends" className="bg-[#2E7D7D]/10 rounded-xl shadow-lg p-6 border border-[#2E7D7D]/30">
            <UsageTrendsCard />
          </div>
          <div key="anomaly" className="bg-[#2E7D7D]/10 rounded-xl shadow-lg p-6 border border-[#2E7D7D]/30">
            <AnomalyDetectionCard />
          </div>
          <div key="forecast" className="bg-[#2E7D7D]/10 rounded-xl shadow-lg p-6 border border-[#2E7D7D]/30">
            <ForecastCard />
          </div>
          <div key="insights" className="bg-[#2E7D7D]/10 rounded-xl shadow-lg p-6 border border-[#2E7D7D]/30">
            <UserInsightsCard />
          </div>
        </ResponsiveGridLayout>
      </main>
      <AIChatButton />
    </div>
  );
}