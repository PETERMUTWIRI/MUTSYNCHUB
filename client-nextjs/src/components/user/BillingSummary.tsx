import React, { useEffect, useState } from 'react';

const BillingSummary: React.FC = () => {
  const [amount, setAmount] = useState<number | null>(null);
  const [nextBillDate, setNextBillDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBilling = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/billing/summary');
        if (!res.ok) throw new Error('Failed to fetch billing summary');
        const data = await res.json();
        setAmount(data.amount);
        setNextBillDate(data.nextBillDate);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBilling();
  }, []);

  if (loading) return <div className="text-center text-gray-400">Loading...</div>;
  if (error) return <div className="text-center text-red-400">{error}</div>;
  return (
    <div className="text-center">
      <div className="text-lg font-bold text-gray-200 mb-2">Billing Summary</div>
      <div className="text-4xl font-extrabold text-white mb-1">${amount}</div>
      <div className="text-sm text-gray-400">Next bill on {nextBillDate}</div>
    </div>
  );
};

export default BillingSummary;
