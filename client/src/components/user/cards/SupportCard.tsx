import React from 'react';
import { HiQuestionMarkCircle } from 'react-icons/hi';

const SupportCard: React.FC<{ openTickets?: number; loading?: boolean; error?: boolean }> = ({ openTickets = 0, loading, error }) => {
  if (loading) return <div className="card skeleton">Loading support...</div>;
  if (error) return <div className="card error">Unable to load support info.</div>;
  return (
    <div className="card bg-gradient-to-br from-pink-500 to-red-400 shadow-xl rounded-2xl p-6 flex flex-col items-center justify-center min-h-[160px]">
      <HiQuestionMarkCircle className="text-pink-900 text-3xl mb-2" />
      <div className="font-bold text-lg text-white mb-1">Support</div>
      <div className="text-gray-300 mb-2">Open Tickets: {openTickets}</div>
      <button className="px-4 py-1 rounded bg-white text-pink-900 font-bold mt-2 hover:bg-pink-100 transition">Contact Support</button>
    </div>
  );
};
export default SupportCard;
