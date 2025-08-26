'use client';

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HiChartPie, HiClipboardList, HiCreditCard, HiBell } from 'react-icons/hi';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ensureAndFetchUserProfile } from '@/app/api/get-user-role/action';

// Dynamically import large components
const UsageCard = dynamic(() => import('@/components/user/cards/UsageCard'), { ssr: false });
const RecentActivityCard = dynamic(() => import('@/components/user/cards/RecentActivityCard'), { ssr: false });
const PlanCard = dynamic(() => import('@/components/user/cards/PlanCard'), { ssr: false });
const BillingCard = dynamic(() => import('@/components/user/cards/BillingCard'), { ssr: false });
const NotificationsCard = dynamic(() => import('@/components/user/cards/NotificationsCard'), { ssr: false });
const SupportCard = dynamic(() => import('@/components/user/cards/SupportCard'), { ssr: false });
const SecurityCard = dynamic(() => import('@/components/user/cards/SecurityCard'), { ssr: false });
const TeamCard = dynamic(() => import('@/components/user/cards/TeamCard'), { ssr: false });
const AnnouncementsCard = dynamic(() => import('@/components/user/cards/AnnouncementsCard'), { ssr: false });
const UsageTrendsCard = dynamic(() => import('@/components/user/cards/UsageTrendsCard'), { ssr: false });
const AnomalyDetectionCard = dynamic(() => import('@/components/user/cards/AnomalyDetectionCard'), { ssr: false });
const ForecastCard = dynamic(() => import('@/components/user/cards/ForecastCard'), { ssr: false });
const UserInsightsCard = dynamic(() => import('@/components/user/cards/UserInsightsCard'), { ssr: false });
const AIChatButton = dynamic(() => import('@/components/user/AIChatButton'), { ssr: false });

export default function UserDashboard() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPlans, setShowPlans] = useState(false);
  const plans = [
    { title: 'Starter', packages: ['Basic Analytics', 'Email Support'], price: 500 },
    { title: 'Pro', packages: ['Advanced Analytics', 'Priority Support', 'Team Access'], price: 2000 },
    { title: 'Enterprise', packages: ['Custom Integrations', 'Dedicated Manager', 'Unlimited Users'], price: 10000 },
  ];

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const cachedSession = localStorage.getItem('userSession');
        if (cachedSession) {
          const parsed = JSON.parse(cachedSession);
          if (parsed.expiresAt && parsed.expiresAt > Date.now()) {
            setRole(parsed.role?.toLowerCase() || 'user');
            setOrgId(parsed.orgId || null);
            setLoading(false);
            return;
          }
          localStorage.removeItem('userSession');
        }

        const { role, orgId } = await ensureAndFetchUserProfile();
        const fetchedRole = role.toLowerCase() || 'user';
        setRole(fetchedRole);
        setOrgId(orgId);
        localStorage.setItem('userSession', JSON.stringify({
          role: fetchedRole,
          orgId,
          expiresAt: Date.now() + 60 * 60 * 1000,
        }));
      } catch (err) {
        console.error('UserDashboard: Failed to fetch role', err);
        setError('Failed to load user role');
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, []);

  useEffect(() => {
    if (!loading && role && role !== 'user' && role !== 'admin') {
      router.push('/unauthorized');
    }
  }, [role, loading, router]);

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
        className="min-h-screen bg-slate-950 flex items-center justify-center w-full"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="mt-4 text-gray-300 font-sans text-lg">Loading Dashboard...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-slate-950 flex items-center justify-center w-full"
      >
        <div className="text-center bg-gray-800 rounded-lg p-8 border border-gray-700">
          <p className="text-red-400 font-sans text-lg">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 bg-cyan-600 text-white hover:bg-cyan-700 px-6 py-2 rounded-lg font-sans"
          >
            Return to Home
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="bg-slate-950 text-gray-100 font-sans w-full">
      <header className="flex items-center justify-between px-8 py-4 bg-gray-900 border-b border-gray-800 shadow-lg w-full">
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Ask AI or search..."
            className="bg-gray-800 border border-gray-700 text-gray-100 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600 w-64"
          />
        </div>
        <div className="flex items-center gap-6">
          <HiBell className="text-cyan-400 text-xl animate-pulse" />
          <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold">
            {/* Fallback to 'U' if user is not available */}
            {'U'}
          </div>
        </div>
      </header>

      {showPlans && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
        >
          <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md mx-auto relative border border-gray-700">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 text-2xl" onClick={handleClosePlans}>
              &times;
            </button>
            <h2 className="text-3xl font-extrabold text-cyan-400 mb-6 text-center">Choose Your Plan</h2>
            <div className="flex flex-col gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.title}
                  className="border border-gray-700 rounded-xl p-6 flex flex-col gap-2 hover:shadow-xl hover:border-cyan-600 transition-all cursor-pointer"
                  onClick={() => handlePlanSelect(plan)}
                >
                  <div className="text-2xl font-bold text-gray-100 mb-2">{plan.title}</div>
                  <ul className="mb-2">
                    {plan.packages.map((pkg) => (
                      <li key={pkg} className="text-gray-300 text-base">{pkg}</li>
                    ))}
                  </ul>
                  <div className="text-xl font-extrabold text-cyan-400">KES {plan.price.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 md:p-10 max-w-7xl mx-auto w-full">
        <div className="lg:col-span-2 flex flex-col gap-6 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800 rounded-xl shadow p-6 flex items-center justify-between border border-gray-700 w-full"
          >
            <div>
              <div className="text-xs font-semibold text-cyan-400 mb-1">Update</div>
              <div className="text-lg font-bold text-gray-100">New: Data analysis completed for your query</div>
              <a href="#" className="text-sm text-cyan-400 hover:underline">See Analytics →</a>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-icons text-cyan-400">check_circle</span>
            </div>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
            <UsageCard usage={42} quota={100} loading={false} error={false} />
            <PlanCard planName="Pro" renewalDate="2025-08-01" loading={false} error={false} handleUpgradeClick={handleUpgradeClick} />
            <BillingCard lastInvoice="2025-07-01" nextPayment="99 on 2025-08-01" paymentMethod="Visa ****1234" loading={false} error={false} />
            <NotificationsCard unreadCount={3} latest="System Update on 2025-07-15" loading={false} error={false} />
          </div>
          <div className="w-full mt-6">
            <RecentActivityCard lastLogin="2025-07-15" recent={['Login on 2025-07-15']} loading={false} error={false} />
          </div>
          <div className="w-full mt-6">
            <div className="bg-gray-800 rounded-xl shadow p-6 flex flex-col gap-4 min-h-[380px] border border-gray-700 w-full">
              <div className="text-lg font-bold text-gray-100 mb-2">Team & Insights</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <SupportCard openTickets={1} loading={false} error={false} />
                <TeamCard members={['Alice', 'Bob']} loading={false} error={false} />
                <UserInsightsCard />
                <AnnouncementsCard updates={['New Feature on 2025-07-10']} loading={false} error={false} />
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-6 h-full justify-start w-full">
          <div className="bg-gray-800 rounded-xl shadow p-6 flex flex-col gap-4 min-h-[380px] border border-gray-700 w-full">
            <div className="text-lg font-bold text-gray-100 mb-2">Usage and Security</div>
            <div className="grid grid-cols-1 gap-4 w-full">
              <UsageTrendsCard />
              <AnomalyDetectionCard />
              <ForecastCard />
              <div className="bg-gray-900 rounded-lg p-2 border border-gray-700 w-full">
                <SecurityCard twoFAEnabled={true} sessions={0} apiKeys={0} loading={false} error={false} />
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl shadow p-6 flex flex-col items-center min-h-[180px] justify-center border border-gray-700 w-full">
            <div className="text-lg font-bold text-gray-100 mb-2">Tenant Usage</div>
            <div className="text-3xl font-extrabold text-cyan-400 mb-1">65,328</div>
            <div className="text-xs text-gray-300 mb-2">65% usage</div>
            <div className="text-xs text-gray-300 mb-2">Here are some ideas on how to increase usage.</div>
            <button className="text-cyan-400 border-cyan-600 border px-3 py-1 rounded-lg font-semibold hover:bg-cyan-600 hover:text-white">
              Query History →
            </button>
          </div>
        </div>
      </main>
      <AIChatButton />
    </div>
  );
}