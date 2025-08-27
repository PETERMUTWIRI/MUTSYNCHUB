import React, { useEffect, useState } from 'react';
import { useOverviewData } from '@/lib/useOverviewData';

const BillingSummary: React.FC = () => {
  const { data, loading, error } = useOverviewData();

  if (loading) return <div className="text-center text-gray-400">Loading...</div>;
  if (error) return <div className="text-center text-red-400">{error}</div>;

  return (
    <div className="text-center bg-[#1E2A44] p-6 rounded-xl shadow-xl border border-[#2E7D7D]/30">
      <div className="text-lg font-inter font-bold text-[#2E7D7D] mb-2">Billing Summary</div>
      <div className="text-4xl font-inter font-extrabold text-white mb-1">${data?.billing?.lastInvoice ? '100.00' : 'N/A'}</div> {/* Placeholder */}
      <div className="text-sm font-inter text-gray-300">Next bill on {data?.billing?.nextPayment || 'N/A'}</div>
    </div>
  );
};

export default BillingSummary;