import React, { useEffect, useState } from 'react';

const PlanStatus: React.FC = () => {
  const [planName, setPlanName] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlan = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/plan/status');
        if (!res.ok) throw new Error('Failed to fetch plan status');
        const data = await res.json();
        setPlanName(data.planName);
        setStatus(data.status);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, []);

  if (loading) return <div className="text-center text-gray-400">Loading...</div>;
  if (error) return <div className="text-center text-red-400">{error}</div>;
  return (
    <div className="text-center">
      <div className="text-lg font-bold text-gray-200 mb-2">Plan Status</div>
      <div className="text-4xl font-extrabold text-white mb-1">{planName}</div>
      <div className="text-sm text-gray-400">{status}</div>
    </div>
  );
};

export default PlanStatus;
