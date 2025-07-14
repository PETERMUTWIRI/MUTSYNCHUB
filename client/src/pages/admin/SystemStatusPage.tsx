import React from 'react';

const SystemStatusPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto py-12">
      <h1 className="text-4xl font-bold text-white mb-8">System Status</h1>
      {/* The IncidentsList, MaintenanceList, and UptimeChart components will be rendered here by the router */}
    </div>
  );
};

export default SystemStatusPage;
