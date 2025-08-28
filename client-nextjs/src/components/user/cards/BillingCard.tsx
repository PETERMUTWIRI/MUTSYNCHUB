'use client';

import React from 'react';
import { HiCreditCard } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface BillingData {
  lastInvoice: string;
  nextPayment: string;
  paymentMethod: string;
  alert?: { message: string; urgency: 'low' | 'high'; actionUrl?: string };
}

const fetchBilling = async (): Promise<BillingData> => {
  const res = await fetch('/api/billing');
  if (!res.ok) throw new Error('Failed to fetch billing info');
  return res.json();
};

const BillingCard: React.FC = () => {
  const router = useRouter();
  const { data, isLoading, error } = useQuery({
    queryKey: ['billing'],
    queryFn: fetchBilling,
  });

  return (
    <motion.div
      className="rounded-xl shadow-xl bg-[#1E2A44] border border-[#2E7D7D]/30 p-6 flex flex-col items-start justify-start min-h-[200px] hover:shadow-2xl transition-all duration-300"
      whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(46, 125, 125, 0.5)' }}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      {isLoading ? (
        <div className="text-gray-300 font-inter text-base">Loading billing...</div>
      ) : error ? (
        <div className="text-red-400 font-inter text-base">Unable to load billing info.</div>
      ) : (
        <>
          <HiCreditCard className="text-[#2E7D7D] text-3xl mb-4" />
          <h3 className="text-white font-inter font-bold text-xl mb-3">Billing Summary</h3>
          {data?.alert && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 w-full"
            >
              <Alert
                className={`bg-[#2E7D7D]/20 border-[#2E7D7D] text-gray-100 ${
                  data.alert.urgency === 'high' ? 'border-red-500 bg-red-500/20' : ''
                }`}
              >
                <HiCreditCard className="h-5 w-5 text-[#2E7D7D]" />
                <AlertTitle className="font-inter text-base">
                  {data.alert.urgency === 'high' ? 'Urgent Billing Alert' : 'Billing Notice'}
                </AlertTitle>
                <AlertDescription className="font-inter text-sm">
                  {data.alert.message}
                  {data.alert.actionUrl && (
                    <Button
                      variant="link"
                      className="text-[#2E7D7D] pl-2"
                      onClick={() => {
                        if (data?.alert?.actionUrl) {
                          router.push(data.alert.actionUrl);
                        }
                      }}
                    >
                      Resolve Now →
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
          <div className="text-gray-300 font-inter text-base mb-2">Last Invoice: {data?.lastInvoice || 'N/A'}</div>
          <div className="text-gray-300 font-inter text-base mb-2">Next Payment: {data?.nextPayment || 'N/A'}</div>
          <div className="text-gray-300 font-inter text-base">Payment Method: {data?.paymentMethod || 'N/A'}</div>
        </>
      )}
    </motion.div>
  );
};

export default BillingCard;