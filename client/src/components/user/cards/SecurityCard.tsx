import React from 'react';
import { HiLockClosed } from 'react-icons/hi';

const SecurityCard: React.FC<{ twoFAEnabled?: boolean; sessions?: number; apiKeys?: number; loading?: boolean; error?: boolean }> = ({ twoFAEnabled, sessions = 0, apiKeys = 0, loading, error }) => {
  if (loading) return <div className="card skeleton">Loading security...</div>;
  if (error) return <div className="card error">Unable to load security info.</div>;
  return (
    <div className="card bg-gradient-to-br from-gray-800 to-gray-900 shadow-xl rounded-2xl p-6 flex flex-col items-center justify-center min-h-[160px]">
      <HiLockClosed className="text-gray-300 text-3xl mb-2" />
      <div className="font-bold text-lg text-white mb-1">Security</div>
      <div className="text-gray-300 mb-2">2FA: {twoFAEnabled ? 'Enabled' : 'Disabled'}</div>
      <div className="text-xs text-gray-400 mb-2">Sessions: {sessions}</div>
      <div className="text-xs text-gray-400">API Keys: {apiKeys}</div>
    </div>
  );
};
export default SecurityCard;
