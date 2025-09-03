import React from 'react';
import { Button } from '@/components/ui/button';

interface UsageProgressBarProps {
  usage: number;
  limit: number;
}

const UsageProgressBar: React.FC<UsageProgressBarProps> = ({ usage, limit }) => {
  const percentage = limit > 0 ? (usage / limit) * 100 : 0;

  return (
    <div className="rounded-2xl shadow-2xl bg-gradient-to-br from-gray-800 to-gray-900 p-6">
      <div className="flex items-center justify-between mb-2">
        <div className="text-lg font-bold text-white">Usage</div>
        <Button size="sm" variant="outline">Upgrade Plan</Button>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-4">
        <div
          className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-sm text-gray-400 mt-2">
        <span>{usage} / {limit}</span>
        <span>{Math.round(100 - percentage)}% remaining</span>
      </div>
    </div>
  );
};

export default UsageProgressBar;
