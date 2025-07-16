import React from 'react';
import { HiSpeakerphone } from 'react-icons/hi';

const AnnouncementsCard: React.FC<{ updates?: string[]; loading?: boolean; error?: boolean }> = ({ updates = [], loading, error }) => {
  if (loading) return <div className="card skeleton">Loading announcements...</div>;
  if (error) return <div className="card error">Unable to load announcements.</div>;
  return (
    <div className="card bg-gradient-to-br from-indigo-700 to-pink-400 shadow-xl rounded-2xl p-6 flex flex-col items-center justify-center min-h-[160px]">
      <HiSpeakerphone className="text-pink-900 text-3xl mb-2" />
      <div className="font-bold text-lg text-white mb-1">Announcements</div>
      <ul className="text-xs text-gray-200 list-disc pl-4">
        {updates.length === 0 ? <li>No announcements</li> : updates.map((u, i) => <li key={i}>{u}</li>)}
      </ul>
    </div>
  );
};
export default AnnouncementsCard;
