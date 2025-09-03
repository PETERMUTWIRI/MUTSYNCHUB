import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getSchedules } from '@/api/analytics';

const Schedules: React.FC = () => {
  const { user, token } = useAuth();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !token) return;
    setLoading(true);
    getSchedules(user.orgId, token)
      .then((res) => setSchedules(res.data))
      .catch(() => setSchedules([]))
      .finally(() => setLoading(false));
  }, [user, token]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center w-full h-full animate-pulse">
      <span className="text-lg font-semibold text-gray-300 mb-2">Loading Schedules...</span>
    </div>
  );
  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <h2 className="text-lg font-bold text-gray-200 mb-2">Schedules</h2>
      <div className="text-4xl font-extrabold text-white mb-1">{schedules.length}</div>
      <div className="text-sm text-gray-400">Total Schedules</div>
    </div>
  );
};

export default Schedules;
