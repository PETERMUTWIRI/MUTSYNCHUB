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

  if (loading) return <div>Loading Schedules...</div>;
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Schedules</h2>
      <ul>
        {schedules.map((s) => (
          <li key={s.id}>{s.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Schedules;
