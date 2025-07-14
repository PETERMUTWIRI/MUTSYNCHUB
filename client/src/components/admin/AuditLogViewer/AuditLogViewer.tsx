import React, { useEffect, useState } from 'react';
import { getAuditLogs } from '../../../api/admin';

const AuditLogViewer: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        const response = await getAuditLogs();
        setAuditLogs(response.data);
      } catch (error) {
        console.error('Error fetching audit logs:', error);
      }
    };

    fetchAuditLogs();
  }, []);

  return (
    <div
      className="col-span-1 md:col-span-2 rounded-2xl shadow-xl flex flex-col"
      style={{
        background: '#1A1A2E',
        padding: 32,
        minHeight: 340,
      }}
    >
      <div className="text-lg font-bold text-gray-200 mb-2">
        Recent Audit Logs
      </div>
      <div className="flex-1 overflow-y-auto">
        {auditLogs.map((log) => (
          <div key={log.id} className="flex items-center gap-3 py-2">
            <div className="h-3 w-3 rounded-full bg-blue-400" />
            <div className="flex-1 text-gray-100">
              {log.action} by {log.userId}
            </div>
            <div className="text-xs text-gray-400">
              {new Date(log.createdAt).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
      <a
        href="#"
        className="text-sm text-[var(--accent-amber,#FFA500)] hover:underline font-semibold mt-4"
      >
        View All Logs
      </a>
    </div>
  );
};

export default AuditLogViewer;
