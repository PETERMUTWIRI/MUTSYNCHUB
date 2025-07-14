import React from 'react';
import AuditLogTable from './components/AuditLogTable';

const AuditLogsPage: React.FC = () => {
  return (
    <>
      <h1 className="text-3xl font-bold text-white mb-8">Audit Logs</h1>
      <AuditLogTable />
    </>
  );
};

export default AuditLogsPage;
