import React from 'react';

interface RecentActivityProps {
  count: number;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ count }) => {
  return (
    <div className="text-center">
      <div className="text-lg font-bold text-gray-200 mb-2">Recent Activity</div>
      <div className="text-4xl font-extrabold text-white mb-1">{count}</div>
      <div className="text-sm text-gray-400">New Activities</div>
    </div>
  );
};

export default RecentActivity;
