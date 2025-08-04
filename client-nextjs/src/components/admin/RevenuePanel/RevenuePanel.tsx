import React, { useEffect, useState } from 'react';
import { getRevenue } from '../../../api/admin';

const RevenuePanel: React.FC = () => {
  const [revenue, setRevenue] = useState<any>({ total: 0, byOrg: [] });

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const response = await getRevenue();
        setRevenue(response.data);
      } catch (error) {
        console.error('Error fetching revenue:', error);
      }
    };

    fetchRevenue();
  }, []);

  return (
    <div
      className="rounded-2xl shadow-xl"
      style={{ background: '#1A1A2E', padding: 32 }}
    >
      <div className="text-lg font-bold text-gray-200 mb-2">
        Revenue This Month
      </div>
      <div className="text-4xl font-extrabold text-white mb-1">
        ${revenue.total.toLocaleString()}
      </div>
      <div className="text-sm text-gray-400">Enterprise & SaaS Plans</div>
      <div className="text-xs text-green-400 mt-2">
        +8% since last month
      </div>
    </div>
  );
};

export default RevenuePanel;
