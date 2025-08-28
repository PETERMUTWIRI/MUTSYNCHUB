'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { HiTrendingUp } from 'react-icons/hi';

interface TrendData {
  trend: number;
  dataPoints: { date: string; value: number }[];
}

const syntheticData: TrendData = {
  trend: 0.12,
  dataPoints: [
    { date: '2025-07-22', value: 120 },
    { date: '2025-07-23', value: 135 },
    { date: '2025-07-24', value: 145 },
    { date: '2025-07-25', value: 160 },
    { date: '2025-07-26', value: 175 },
    { date: '2025-07-27', value: 190 },
    { date: '2025-07-28', value: 210 },
  ],
};

const UsageTrendsCard: React.FC = () => {
  const router = useRouter();
  const trendData = syntheticData; // Use synthetic data until endpoint is implemented
  const showAlert = trendData.trend > 0.1;

  return (
    <motion.div
      className="rounded-xl shadow-xl bg-[#1E2A44] border border-[#2E7D7D]/30 p-6 flex flex-col items-start justify-start min-h-[200px] hover:shadow-2xl transition-all duration-300"
      whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(46, 125, 125, 0.5)' }}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <HiTrendingUp className="text-[#2E7D7D] text-2xl" />
        <span className="text-white font-inter font-semibold text-lg">Usage Trends</span>
      </div>
      {showAlert && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 w-full"
        >
          <Alert className="bg-[#2E7D7D]/20 border-[#2E7D7D] text-gray-100">
            <HiTrendingUp className="h-5 w-5 text-[#2E7D7D]" />
            <AlertTitle className="font-inter text-base">High Usage Growth</AlertTitle>
            <AlertDescription className="font-inter text-sm">
              Your usage has increased by {Math.round(trendData.trend * 100)}% daily. Upgrade to handle more queries!
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
      <div className="text-gray-300 font-inter text-base">
        Trend: {trendData?.trend ? `${Math.round(trendData.trend * 100)}% daily` : 'No data'}
      </div>
      <div className="text-gray-300 font-inter text-base">
        Last 7 days: {trendData?.dataPoints?.length || 0} queries
      </div>
    </motion.div>
  );
};

export default UsageTrendsCard;