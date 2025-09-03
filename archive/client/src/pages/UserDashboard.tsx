import React, { useEffect, useState } from 'react';
import { HiChartPie, HiClipboardList, HiCreditCard } from 'react-icons/hi';
import UsageCard from '../components/user/cards/UsageCard';
import RecentActivityCard from '../components/user/cards/RecentActivityCard';
import PlanCard from '../components/user/cards/PlanCard';
import BillingCard from '../components/user/cards/BillingCard';
import NotificationsCard from '../components/user/cards/NotificationsCard';
import SupportCard from '../components/user/cards/SupportCard';
import SecurityCard from '../components/user/cards/SecurityCard';
import TeamCard from '../components/user/cards/TeamCard';
import AnnouncementsCard from '../components/user/cards/AnnouncementsCard';
import UsageTrendsCard from '../components/user/cards/UsageTrendsCard';
import AnomalyDetectionCard from '../components/user/cards/AnomalyDetectionCard';
import ForecastCard from '../components/user/cards/ForecastCard';
import UserInsightsCard from '../components/user/cards/UserInsightsCard';
import AIChatButton from '../components/user/AIChatButton';

import Spinner from '../components/ui/Spinner';
import { HiBell } from 'react-icons/hi';

const UserDashboard: React.FC = () => {
  const [showPlans, setShowPlans] = useState(false);
  const plans = [
    {
      title: 'Starter',
      packages: ['Basic Analytics', 'Email Support'],
      price: 500,
    },
    {
      title: 'Pro',
      packages: ['Advanced Analytics', 'Priority Support', 'Team Access'],
      price: 2000,
    },
    {
      title: 'Enterprise',
      packages: ['Custom Integrations', 'Dedicated Manager', 'Unlimited Users'],
      price: 10000,
    },
  ];

  const handleUpgradeClick = () => setShowPlans(true);
  const handleClosePlans = () => setShowPlans(false);
  interface Plan {
    title: string;
    packages: string[];
    price: number;
  }

  interface PlanSelectEvent {
    plan: Plan;
  }

  const handlePlanSelect = (plan: Plan): void => {
    // Redirect to payment page (stub)
    window.location.href = `/payment?plan=${plan.title}`;
  };

  return (
    <>
      {/* Sidebar is handled by UserLayout */}
      {/* Top Bar */}
        <header className="flex items-center justify-between px-8 py-4 bg-gradient-to-r from-indigo-900/80 to-slate-900/80 shadow-lg rounded-b-2xl mb-6">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Ask AI or search..."
              className="bg-transparent border-b border-indigo-700 text-white px-2 py-1 focus:outline-none w-64"
            />
          </div>
          <div className="flex items-center gap-6">
            <HiBell className="text-indigo-300 text-xl animate-pulse" />
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-teal-400 flex items-center justify-center text-white font-bold">U</div>
          </div>
        </header>

        {/* Plans Modal */}
        {showPlans && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-auto relative animate-fade-in">
              <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl" onClick={handleClosePlans}>&times;</button>
              <h2 className="text-3xl font-extrabold text-blue-900 mb-6 text-center">Choose Your Plan</h2>
              <div className="flex flex-col gap-6">
                {plans.map(plan => (
                  <div key={plan.title} className="border border-blue-200 rounded-xl p-6 flex flex-col gap-2 hover:shadow-xl hover:border-blue-400 transition-all cursor-pointer" onClick={() => handlePlanSelect(plan)}>
                    <div className="text-2xl font-bold text-blue-900 mb-2">{plan.title}</div>
                    <ul className="mb-2">
                      {plan.packages.map(pkg => (
                        <li key={pkg} className="text-gray-700 text-base">{pkg}</li>
                      ))}
                    </ul>
                    <div className="text-xl font-extrabold text-green-700">KES {plan.price.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* KPI Cards & Main Grid */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 md:p-10">
          {/* Left column: main cards */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Update card */}
            <div className="bg-gradient-to-r from-indigo-900/80 to-slate-900/80 rounded-xl shadow p-6 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-blue-200 mb-1">Update</div>
                <div className="text-lg font-bold text-white">New: Data analysis completed for your query</div>
                <a href="#" className="text-sm text-blue-200 hover:underline">See Analytics →</a>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-icons text-blue-200">check_circle</span>
              </div>
            </div>
            {/* Metrics cards row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <UsageCard usage={42} quota={100} loading={false} error={false} />
              <PlanCard planName="Pro" renewalDate="2025-08-01" loading={false} error={false} />
              <BillingCard lastInvoice="2025-07-01" nextPayment="99 on 2025-08-01" paymentMethod="Visa ****1234" loading={false} error={false} />
              <NotificationsCard unreadCount={3} latest="System Update on 2025-07-15" loading={false} error={false} />
            </div>
        {/* No Announcements row here - removed as per instructions */}
        {/* Recent Activity Card - moved up below metrics cards */}
        <div className="w-full mt-6">
          <div className="min-h-[180px] flex flex-col h-full">
            <RecentActivityCard lastLogin="2025-07-15" recent={["Login on 2025-07-15"]} loading={false} error={false} />
          </div>
        </div>
        {/* Team & Insights container below Recent Activity, 2-column grid to match Usage & Security height */}
        <div className="w-full mt-6">
          <div className="bg-gradient-to-r from-indigo-900/80 to-slate-900/80 rounded-xl shadow p-6 flex flex-col gap-4 min-h-[380px]">
            <div className="text-lg font-bold text-white mb-2">Team & Insights</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SupportCard openTickets={1} loading={false} error={false} />
              <TeamCard members={["Alice", "Bob"]} loading={false} error={false} />
              <UserInsightsCard />
              <AnnouncementsCard updates={["New Feature on 2025-07-10"]} loading={false} error={false} />
            </div>
          </div>
        </div>
        {/* AI Analytics row (UserInsightsCard moved to new container) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        </div>
          </div>
          {/* Right column: Plan & Usage, Upgrade Plan moved up below Usage & Security */}
          <div className="flex flex-col gap-6 h-full justify-start">
            {/* Usage and Security container - moved up */}
            <div className="bg-gradient-to-r from-indigo-900/80 to-slate-900/80 rounded-xl shadow p-6 flex flex-col gap-4 min-h-[380px] w-full">
              <div className="text-lg font-bold text-white mb-2">Usage and Security</div>
              <div className="grid grid-cols-1 gap-4">
                <UsageTrendsCard />
                <AnomalyDetectionCard />
                <ForecastCard />
                <div className="bg-slate-800 rounded-lg p-2">
                  <SecurityCard twoFAEnabled={true} sessions={0} apiKeys={0} loading={false} error={false} />
                </div>
              </div>
            </div>
            {/* Tenant Usage card - now below Usage and Security */}
            <div className="bg-gradient-to-r from-indigo-900/80 to-slate-900/80 rounded-xl shadow p-6 flex flex-col items-center min-h-[180px] justify-center">
              <div className="text-lg font-bold text-white mb-2">Tenant Usage</div>
              <div className="text-3xl font-extrabold text-blue-200 mb-1">65,328</div>
              <div className="text-xs text-blue-100 mb-2">65% usage</div>
              <div className="text-xs text-blue-100 mb-2">Here are some ideas on how to increase usage.</div>
              <button className="text-blue-200 border-blue-300 border px-3 py-1 rounded-lg font-semibold">Query History →</button>
            </div>
          </div>
        </main>
        <AIChatButton />
    </>
  );
};

export default UserDashboard;
