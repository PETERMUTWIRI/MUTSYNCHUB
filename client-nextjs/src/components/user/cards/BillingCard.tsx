'use client';

import React from 'react';
import { HiCreditCard } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { getBillingCardData } from '@/app/actions/billing-card';

const BillingCard: React.FC = () => {
  const router = useRouter();
  const { data, isLoading, error } = useQuery({
    queryKey: ['billing-card'],
    queryFn: getBillingCardData, // server-action → no prisma here
  });

  if (isLoading) return <div className="text-gray-300 text-base">Loading…</div>;
  if (error) return <div className="text-red-400 text-base">Failed to load billing.</div>;

  return (
    <motion.div
      className="rounded-xl shadow-xl bg-[#1E2A44] border border-[#2E7D7D]/30 p-6 flex flex-col items-start justify-start min-h-[200px] hover:shadow-2xl transition-all duration-300 cursor-pointer"
      whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(46, 125, 125, 0.5)' }}
      transition={{ type: 'spring', stiffness: 400 }}
      onClick={() => router.push('/billing')}
      aria-label="Open full billing dashboard"
    >
      <HiCreditCard className="text-[#2E7D7D] text-3xl mb-4" />
      <h3 className="text-white font-bold text-xl mb-3">Billing Summary</h3>

      {data?.alert && (
        <Alert className={`bg-[#2E7D7D]/20 border-[#2E7D7D] text-gray-100 mb-4 ${data.alert.urgency === 'high' ? 'border-red-500 bg-red-500/20' : ''}`}>
          <AlertTitle>{data.alert.urgency === 'high' ? 'Urgent' : 'Notice'}</AlertTitle>
          <AlertDescription>
            {data.alert.message}
            <Button variant="link" className="text-[#2E7D7D] pl-2" onClick={(e) => { e.stopPropagation(); router.push(data.alert!.actionUrl!); }}>Resolve →</Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="text-gray-300 text-base mb-2">Last Payment: <span className="text-white font-medium">{data?.lastInvoice}</span></div>
      <div className="text-gray-300 text-base mb-2">Remaining: <span className="text-white font-medium">{data?.nextPayment}</span></div>
      <div className="text-gray-300 text-base">Method: <span className="text-white font-medium">{data?.paymentMethod}</span></div>

      {/* mini progress bar */}
      <div className="w-full bg-[#2E7D7D]/20 h-2 rounded mt-4">
        <div className="bg-[#2E7D7D] h-2 rounded" style={{ width: `${Math.min((data?.usage.progress || 0) * 100, 100)}%` }} />
      </div>
    </motion.div>
  );
};

export default BillingCard;
