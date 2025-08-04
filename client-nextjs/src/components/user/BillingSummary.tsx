import React from 'react';

interface BillingSummaryProps {
  amount: number;
  nextBillDate: string;
}

const BillingSummary: React.FC<BillingSummaryProps> = ({ amount, nextBillDate }) => {
  return (
    <div className="text-center">
      <div className="text-lg font-bold text-gray-200 mb-2">Billing Summary</div>
      <div className="text-4xl font-extrabold text-white mb-1">${amount}</div>
      <div className="text-sm text-gray-400">Next bill on {nextBillDate}</div>
    </div>
  );
};

export default BillingSummary;
