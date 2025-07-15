import React from 'react';

interface PlanStatusProps {
  planName: string;
  status: string;
}

const PlanStatus: React.FC<PlanStatusProps> = ({ planName, status }) => {
  return (
    <div className="text-center">
      <div className="text-lg font-bold text-gray-200 mb-2">Plan Status</div>
      <div className="text-4xl font-extrabold text-white mb-1">{planName}</div>
      <div className="text-sm text-gray-400">{status}</div>
    </div>
  );
};

export default PlanStatus;
