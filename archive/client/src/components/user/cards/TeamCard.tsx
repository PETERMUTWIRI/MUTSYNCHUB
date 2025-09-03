import React from 'react';
import { HiUserGroup } from 'react-icons/hi';
import { motion } from 'framer-motion';

const TeamCard: React.FC<{ members?: string[]; loading?: boolean; error?: boolean }> = ({ members = [], loading, error }) => {
  if (loading) return <div className="card skeleton">Loading team...</div>;
  if (error) return <div className="card error">Unable to load team info.</div>;
  return (
    <motion.div
      className="rounded-2xl shadow-lg bg-gradient-to-br from-blue-700/80 to-cyan-500/80 backdrop-blur-lg p-6 border border-cyan-400/30 flex flex-col items-center justify-center min-h-[160px] hover:shadow-2xl transition-all"
      whileHover={{ scale: 1.03, boxShadow: '0 0 24px #22d3ee' }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <HiUserGroup className="text-cyan-900 text-3xl mb-2" />
      <div className="font-bold text-lg text-white mb-1">Team</div>
      <div className="text-gray-300 mb-2">Members: {members.length}</div>
      <ul className="text-xs text-gray-200 list-disc pl-4">
        {members.length === 0 ? <li>No team members</li> : members.map((m, i) => <li key={i}>{m}</li>)}
      </ul>
      <button className="px-4 py-1 rounded bg-white text-cyan-900 font-bold mt-2 hover:bg-cyan-100 transition">Invite Member</button>
    </motion.div>
  );
};
export default TeamCard;
