import React from 'react';
import { HiLockClosed } from 'react-icons/hi';
import { motion } from 'framer-motion';

const SecurityCard: React.FC<{ twoFAEnabled?: boolean; sessions?: number; apiKeys?: number; loading?: boolean; error?: boolean }> = ({ twoFAEnabled, sessions = 0, apiKeys = 0, loading, error }) => {
  if (loading) return <div className="card skeleton">Loading security...</div>;
  if (error) return <div className="card error">Unable to load security info.</div>;
  return (
    <motion.div
      className="rounded-2xl shadow-lg bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg p-6 border border-gray-700/30 flex flex-col items-center justify-center min-h-[160px] hover:shadow-2xl transition-all"
      whileHover={{ scale: 1.03, boxShadow: '0 0 24px #a3a3a3' }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <HiLockClosed className="text-gray-300 text-3xl mb-2" />
      <div className="font-bold text-lg text-white mb-1">Security</div>
      <div className="text-gray-300 mb-2">2FA: {twoFAEnabled ? 'Enabled' : 'Disabled'}</div>
      <div className="text-xs text-gray-400 mb-2">Sessions: {sessions}</div>
      <div className="text-xs text-gray-400">API Keys: {apiKeys}</div>
    </motion.div>
  );
};
export default SecurityCard;
