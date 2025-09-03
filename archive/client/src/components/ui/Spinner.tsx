import React from 'react';

const Spinner: React.FC = () => (
  <div className="flex items-center justify-center w-full h-full py-16">
  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--accent-amber)] border-opacity-80"></div>
    <span className="ml-6 text-xl font-semibold text-white tracking-wide drop-shadow-lg">Loading...</span>
  </div>
);

export default Spinner;
