import React from 'react';
import { HiCreditCard } from 'react-icons/hi';
import { motion } from 'framer-motion';

const BillingCard: React.FC<{ lastInvoice?: string; nextPayment?: string; paymentMethod?: string; loading?: boolean; error?: boolean }> = ({ lastInvoice, nextPayment, paymentMethod, loading, error }) => {
  if (loading) return <div className="card skeleton">Loading billing...</div>;
  if (error) return <div className="card error">Unable to load billing info.</div>;
  return (
    <motion.div
      className="rounded-2xl shadow-lg bg-gradient-to-br from-green-800/70 to-teal-900/80 backdrop-blur-lg p-6 border border-green-700/30 flex flex-col items-center justify-center min-h-[160px] hover:shadow-2xl transition-all"
      whileHover={{ scale: 1.03, boxShadow: '0 0 24px #14b8a6' }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <HiCreditCard className="text-green-300 text-3xl mb-2" />
      <div className="font-bold text-lg text-white mb-1">Billing Summary</div>
      <div className="text-gray-300 mb-2">Last Invoice: {lastInvoice || 'N/A'}</div>
      <div className="text-xs text-gray-400 mb-2">Next Payment: {nextPayment || 'N/A'}</div>
      <div className="text-xs text-gray-400">Payment Method: {paymentMethod || 'N/A'}</div>
    </motion.div>
  );
};
export default BillingCard;
