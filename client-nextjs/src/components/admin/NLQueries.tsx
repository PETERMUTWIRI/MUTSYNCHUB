import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getQueryHistory } from '@/api/analytics';

const NLQueries: React.FC = () => {
  const { user, token } = useAuth();
  const [queries, setQueries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !token) return;
    setLoading(true);
    getQueryHistory(user.orgId, token)
      .then((res) => setQueries(res.data))
      .catch(() => setQueries([]))
      .finally(() => setLoading(false));
  }, [user, token]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center w-full h-full animate-pulse">
      <span className="text-lg font-semibold text-gray-300 mb-2">Loading NL Queries...</span>
    </div>
  );
  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <h2 className="text-lg font-bold text-gray-200 mb-2">NL Queries</h2>
      <div className="text-4xl font-extrabold text-white mb-1">{queries.length}</div>
      <div className="text-sm text-gray-400">Total Queries</div>
    </div>
  );
};

export default NLQueries;
