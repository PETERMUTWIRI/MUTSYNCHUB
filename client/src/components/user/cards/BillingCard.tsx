import React from 'react';
import { HiCreditCard } from 'react-icons/hi';

const BillingCard: React.FC<{ lastInvoice?: string; nextPayment?: string; paymentMethod?: string; loading?: boolean; error?: boolean }> = ({ lastInvoice, nextPayment, paymentMethod, loading, error }) => {
  if (loading) return <div className="card skeleton">Loading billing...</div>;
  if (error) return <div className="card error">Unable to load billing info.</div>;
  return (
    <div className="card bg-gradient-to-br from-green-800 to-teal-900 shadow-xl rounded-2xl p-6 flex flex-col items-center justify-center min-h-[160px]">
      <HiCreditCard className="text-green-300 text-3xl mb-2" />
      <div className="font-bold text-lg text-white mb-1">Billing Summary</div>
      <div className="text-gray-300 mb-2">Last Invoice: {lastInvoice || 'N/A'}</div>
      <div className="text-xs text-gray-400 mb-2">Next Payment: {nextPayment || 'N/A'}</div>
      <div className="text-xs text-gray-400">Payment Method: {paymentMethod || 'N/A'}</div>
    </div>
  );
};
export default BillingCard;
