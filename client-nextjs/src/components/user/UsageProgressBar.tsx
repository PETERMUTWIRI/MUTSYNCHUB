'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { HiExclamationCircle } from 'react-icons/hi';

interface UsageData {
  usage: number;
  limit: number;
  trend: number; // Usage growth rate (e.g., 0.1 for 10% daily increase)
  predictedDaysLeft: number; // Estimated days until limit reached
}

const fetchUsage = async (): Promise<UsageData> => {
  const res = await fetch('/api/usage');
  if (!res.ok) throw new Error('Failed to fetch usage');
  return res.json();
};

const UsageProgressBar: React.FC = () => {
  const router = useRouter();
  const { data, isLoading, error } = useQuery({
    queryKey: ['usage'],
    queryFn: fetchUsage,
  });

  const percentage = data && data.limit > 0 ? (data.usage / data.limit) * 100 : 0;
  const showAlert = data && (percentage > 80 || data.predictedDaysLeft < 7);

  const getAlertMessage = () => {
    if (!data) return '';
    if (percentage > 80) {
      return `You're at ${Math.round(percentage)}% of your usage limit! Upgrade to avoid disruptions.`;
    }
    if (data.predictedDaysLeft < 7) {
      return `Based on your ${Math.round(data.trend * 100)}% daily usage growth, you'll hit your limit in ~${data.predictedDaysLeft} days. Upgrade now!`;
    }
    return '';
  };

  return (
    <motion.div
      className="bg-[#1E2A44] rounded-xl shadow-xl p-6 min-h-[200px]"
      whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(46, 125, 125, 0.5)' }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {isLoading ? (
        <div className="text-center text-gray-300 font-inter text-base">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-400 font-inter text-base">{error.message}</div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-200 font-inter">Usage</h2>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                variant="outline"
                className="border-[#2E7D7D] text-[#2E7D7D] hover:bg-[#2E7D7D]/20 font-inter text-base"
                onClick={() => router.push('/payment')}
              >
                Upgrade Plan
              </Button>
            </motion.div>
          </div>
          {showAlert && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <Alert className="bg-[#2E7D7D]/20 border-[#2E7D7D] text-gray-100">
                <HiExclamationCircle className="h-5 w-5 text-[#2E7D7D]" />
                <AlertTitle className="font-inter text-base">Usage Alert</AlertTitle>
                <AlertDescription className="font-inter text-sm">
                  {getAlertMessage()}
                  <Button
                    variant="link"
                    className="text-[#2E7D7D] pl-2"
                    onClick={() => router.push('/payment')}
                  >
                    Upgrade Now →
                  </Button>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
          <div className="w-full bg-gray-700 rounded-full h-4">
            <motion.div
              className="bg-[#2E7D7D] h-4 rounded-full"
              style={{ width: `${percentage}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5 }}
            ></motion.div>
          </div>
          <div className="flex justify-between text-base text-gray-300 font-inter mt-2">
            <span>{data?.usage} / {data?.limit}</span>
            <span>{Math.round(100 - percentage)}% remaining</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default UsageProgressBar;