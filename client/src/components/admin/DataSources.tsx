import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';

const DataSources: React.FC = () => {
  const { user, token } = useAuth();
  const [dataSources, setDataSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !token) return;
    setLoading(true);
    api.get(`/api/data-sources/${user.orgId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => setDataSources(res.data))
      .catch(() => setDataSources([]))
      .finally(() => setLoading(false));
  }, [user, token]);

  if (loading) return <div>Loading Data Sources...</div>;
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Data Sources</h2>
      <ul>
        {dataSources.map((ds) => (
          <li key={ds.id}>{ds.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default DataSources;
