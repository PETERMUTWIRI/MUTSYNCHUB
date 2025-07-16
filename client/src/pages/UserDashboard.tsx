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
    <div className="max-w-7xl mx-auto py-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10 relative">
        <h1 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-lg mb-4 md:mb-0 text-left">
          Overview
        </h1>
        <div className="flex items-center gap-4 absolute right-0 top-0 md:static md:ml-auto">
          <button
            className="relative rounded-full bg-blue-900 hover:bg-blue-800 p-3 shadow-lg focus:outline-none"
            title="Notifications"
            onClick={() => window.location.href = '/notifications'}
          >
            <HiBell className="text-white text-2xl" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button
            className="rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold px-6 py-2 shadow-xl hover:scale-105 transition-transform"
            onClick={handleUpgradeClick}
          >
            Upgrade
          </button>
        </div>
        <div className="rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 shadow-xl p-8 flex flex-col justify-center animate-fade-in max-w-xl w-full md:w-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
            Welcome back!
          </h2>
          <p className="text-gray-300 text-lg">
            Here's a summary of your account.
          </p>
        </div>
      </div>

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
        <UsageCard usage={42} quota={100} loading={false} error={false} />
        <RecentActivityCard lastLogin="2025-07-15" recent={["Login on 2025-07-15"]} loading={false} error={false} />
        <PlanCard planName="Pro" renewalDate="2025-08-01" loading={false} error={false} />
        <BillingCard lastInvoice="2025-07-01" nextPayment="99 on 2025-08-01" paymentMethod="Visa ****1234" loading={false} error={false} />
        <NotificationsCard unreadCount={3} latest="System Update on 2025-07-15" loading={false} error={false} />
        <SupportCard openTickets={1} loading={false} error={false} />
        <SecurityCard twoFAEnabled={true} sessions={0} apiKeys={0} loading={false} error={false} />
        <TeamCard members={["Alice", "Bob"]} loading={false} error={false} />
        <AnnouncementsCard updates={["New Feature on 2025-07-10"]} loading={false} error={false} />
      </div>
    </div>
  );
};

export default UserDashboard;
