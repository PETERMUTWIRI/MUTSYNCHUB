import React from 'react';
import { HiCreditCard } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { useOverviewData } from '@/lib/useOverviewData';

const BillingCard: React.FC = () => {
  const { data, loading, error } = useOverviewData();

  if (loading) return <div className="bg-[#1E2A44] text-white p-6 rounded-xl shadow-lg">Loading billing...</div>;
  if (error) return <div className="bg-[#1E2A44] text-white p-6 rounded-xl shadow-lg">Unable to load billing info.</div>;
  const billing = data.billing;

  return (
    <motion.div
      className="rounded-xl shadow-xl bg-[#1E2A44] border border-[#2E7D7D]/30 p-6 flex flex-col items-start justify-start min-h-[200px] hover:shadow-2xl transition-all duration-300"
      whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(46, 125, 125, 0.5)' }}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      <HiCreditCard className="text-[#2E7D7D] text-3xl mb-4" />
      <h3 className="text-white font-inter font-bold text-xl mb-3">Billing Summary</h3>
      <div className="text-gray-300 font-inter text-base mb-2">Last Invoice: {billing?.lastInvoice || 'N/A'}</div>
      <div className="text-gray-300 font-inter text-base mb-2">Next Payment: {billing?.nextPayment || 'N/A'}</div>
      <div className="text-gray-300 font-inter text-base">Payment Method: {billing?.paymentMethod || 'N/A'}</div>
    </motion.div>
  );
};
export default BillingCard;