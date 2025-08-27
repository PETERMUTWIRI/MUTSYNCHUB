'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { HiExclamationCircle } from 'react-icons/hi';

interface PlanData {
  planName: string;
  status: string;
  recommendedPlan?: { name: string; benefits: string[] }; // Suggested upgrade
}

const fetchPlanStatus = async (): Promise<PlanData> => {
  const res = await fetch('/api/plan/status');
  if (!res.ok) throw new Error('Failed to fetch plan status');
  return res.json();
};

const PlanStatus: React.FC = () => {
  const router = useRouter();
  const { data, isLoading, error } = useQuery({
    queryKey: ['planStatus'],
    queryFn: fetchPlanStatus,
  });

  const getAlertMessage = () => {
    if (!data?.recommendedPlan) return null;
    const { name, benefits } = data.recommendedPlan;
    return (
      <>
        Unlock more power with the {name} plan! Benefits include:
        <ul className="list-disc pl-4">
          {benefits.map((benefit, index) => (
            <li key={index} className="text-sm">{benefit}</li>
          ))}
        </ul>
      </>
    );
  };

  return (
    <motion.div
      className="bg-[#1E2A44] rounded-xl shadow-xl p-6 min-h-[200px] flex flex-col justify-center items-center"
      whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(46, 125, 125, 0.5)' }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {isLoading ? (
        <div className="text-center text-gray-300 font-inter text-base">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-400 font-inter text-base">{error.message}</div>
      ) : (
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-200 font-inter mb-2">Plan Status</h2>
          <div className="text-lg font-extrabold text-white font-inter mb-1">{data?.planName}</div>
          <div className="text-base text-gray-300 font-inter mb-4">{data?.status}</div>
          {data?.recommendedPlan && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <Alert className="bg-[#2E7D7D]/20 border-[#2E7D7D] text-gray-100">
                <HiExclamationCircle className="h-5 w-5 text-[#2E7D7D]" />
                <AlertTitle className="font-inter text-base">Plan Recommendation</AlertTitle>
                <AlertDescription className="font-inter text-sm">
                  {getAlertMessage()}
                  <Button
                    variant="link"
                    className="text-[#2E7D7D] pl-2"
                    onClick={() => router.push(`/payment?plan=${data.recommendedPlan?.name}`)}
                  >
                    Explore {data.recommendedPlan.name} Plan →
                  </Button>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default PlanStatus;