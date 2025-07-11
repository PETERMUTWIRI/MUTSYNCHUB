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

  if (loading) return <div>Loading NL Queries...</div>;
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">NL Query History</h2>
      <ul>
        {queries.map((q) => (
          <li key={q.id}>{q.query}</li>
        ))}
      </ul>
    </div>
  );
};

export default NLQueries;
