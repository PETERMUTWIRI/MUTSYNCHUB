import React, { useEffect, useState } from 'react';

const RecentActivity: React.FC = () => {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivity = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/activity/recent');
        if (!res.ok) throw new Error('Failed to fetch recent activity');
        const data = await res.json();
        setCount(data.count);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, []);

  if (loading) return <div className="text-center text-gray-400">Loading...</div>;
  if (error) return <div className="text-center text-red-400">{error}</div>;
  return (
    <div className="text-center">
      <div className="text-lg font-bold text-gray-200 mb-2">Recent Activity</div>
      <div className="text-4xl font-extrabold text-white mb-1">{count}</div>
      <div className="text-sm text-gray-400">New Activities</div>
    </div>
  );
};

export default RecentActivity;
