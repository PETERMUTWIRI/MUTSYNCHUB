import React, { useEffect, useState } from 'react';
import { getAuditLogs } from '../../../api/admin';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import ViewLogDetailsModal from './ViewLogDetailsModal';
import { exportToCsv } from '../../../lib/utils';

const AuditLogTable: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const logsPerPage = 10;

  const handleExport = () => {
    exportToCsv(filteredLogs, 'audit-logs');
  };

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        const response = await getAuditLogs();
        setAuditLogs(response.data.data);
        setFilteredLogs(response.data.data);
      } catch (error) {
        console.error('Error fetching audit logs:', error);
      }
    };

    fetchAuditLogs();
  }, []);

  useEffect(() => {
    const lowercasedSearch = search.toLowerCase();
    const filtered = auditLogs.filter((log) =>
      log.action.toLowerCase().includes(lowercasedSearch) ||
      (log.userId && log.userId.toLowerCase().includes(lowercasedSearch))
    );
    setFilteredLogs(filtered);
    setPage(1);
  }, [search, auditLogs]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const paginatedLogs = filteredLogs.slice(
    (page - 1) * logsPerPage,
    page * logsPerPage
  );

  return (
    <div
      className="col-span-1 md:col-span-7 rounded-2xl shadow-xl flex flex-col"
      style={{
        background: '#1A1A2E',
        padding: 32,
      }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-200">Audit Logs</h2>
        <Button onClick={handleExport}>Export CSV</Button>
      </div>
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Search logs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="flex-1 overflow-y-auto bg-[#232347] rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Affected Resource</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLogs.length > 0 ? (
              paginatedLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{log.userId}</TableCell>
                  <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{log.resource}</TableCell>
                  <TableCell>{log.ipAddress}</TableCell>
                  <TableCell>
                    <ViewLogDetailsModal log={log} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No audit logs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-end items-center mt-4">
        <Button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          variant="outline"
        >
          Previous
        </Button>
        <span className="mx-4 text-gray-200">
          Page {page} of {Math.ceil(filteredLogs.length / logsPerPage)}
        </span>
        <Button
          onClick={() => handlePageChange(page + 1)}
          disabled={page * logsPerPage >= filteredLogs.length}
          variant="outline"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default AuditLogTable;
