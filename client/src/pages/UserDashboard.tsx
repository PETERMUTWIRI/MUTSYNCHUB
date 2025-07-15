import React, { useEffect, useState } from 'react';
import { HiChartPie, HiClipboardList, HiCreditCard } from 'react-icons/hi';
import UsageProgressBar from '../components/user/UsageProgressBar';
import RecentActivity from '../components/user/RecentActivity';
import PlanStatus from '../components/user/PlanStatus';
import BillingSummary from '../components/user/BillingSummary';
import { getDashboardSummary } from '../api/user';
import Spinner from '../components/ui/Spinner';

const UserDashboard: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardSummary()
      .then(response => {
        setSummary(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to fetch dashboard summary:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="max-w-5xl mx-auto py-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
        <h1 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-lg mb-4 md:mb-0 text-left">Dashboard</h1>
        <div className="rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 shadow-xl p-8 flex flex-col justify-center animate-fade-in max-w-xl w-full md:w-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">Welcome back!</h2>
          <p className="text-gray-300 text-lg">Here's a summary of your account.</p>
        </div>
      </div>

      <div className="mb-8">
        <UsageProgressBar usage={summary.usage.queries} limit={summary.usage.limit} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
        <div className="rounded-2xl shadow-2xl bg-gradient-to-br from-blue-800 to-indigo-900 p-6 md:p-10 transition-transform duration-200 hover:scale-105 cursor-pointer flex flex-col items-center justify-center min-h-[180px]">
          <HiChartPie className="text-cyan-400 text-4xl mb-2" />
          <RecentActivity count={summary.recentActivity.count} />
        </div>
        <div className="rounded-2xl shadow-2xl bg-gradient-to-br from-purple-800 to-indigo-900 p-6 md:p-10 transition-transform duration-200 hover:scale-105 cursor-pointer flex flex-col items-center justify-center min-h-[180px]">
          <HiClipboardList className="text-purple-300 text-4xl mb-2" />
.
          <PlanStatus planName={summary.plan.name} status={summary.plan.status} />
        </div>
        <div className="rounded-2xl shadow-2xl bg-gradient-to-br from-green-800 to-teal-900 p-6 md:p-10 transition-transform duration-200 hover:scale-105 cursor-pointer flex flex-col items-center justify-center min-h-[180px]">
          <HiCreditCard className="text-green-300 text-4xl mb-2" />
          <BillingSummary amount={summary.billing.amount} nextBillDate={summary.billing.nextBillDate} />
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
