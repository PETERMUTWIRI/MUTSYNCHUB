import React from 'react';

const AuditLogsPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto py-12">
      <h1 className="text-4xl font-bold text-white mb-8">Audit Logs</h1>
      {/* The AuditLogTable component will be rendered here by the router */}
    </div>
  );
};

export default AuditLogsPage;
