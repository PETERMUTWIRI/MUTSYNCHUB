import React from 'react';
import { HiUserGroup } from 'react-icons/hi';

const TeamCard: React.FC<{ members?: string[]; loading?: boolean; error?: boolean }> = ({ members = [], loading, error }) => {
  if (loading) return <div className="card skeleton">Loading team...</div>;
  if (error) return <div className="card error">Unable to load team info.</div>;
  return (
    <div className="card bg-gradient-to-br from-blue-700 to-cyan-500 shadow-xl rounded-2xl p-6 flex flex-col items-center justify-center min-h-[160px]">
      <HiUserGroup className="text-cyan-900 text-3xl mb-2" />
      <div className="font-bold text-lg text-white mb-1">Team</div>
      <div className="text-gray-300 mb-2">Members: {members.length}</div>
      <ul className="text-xs text-gray-200 list-disc pl-4">
        {members.length === 0 ? <li>No team members</li> : members.map((m, i) => <li key={i}>{m}</li>)}
      </ul>
      <button className="px-4 py-1 rounded bg-white text-cyan-900 font-bold mt-2 hover:bg-cyan-100 transition">Invite Member</button>
    </div>
  );
};
export default TeamCard;
