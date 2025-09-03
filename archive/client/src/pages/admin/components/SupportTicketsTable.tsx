import React, { useEffect, useState } from 'react';
import { getSupportTickets } from '../../../api/admin';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Button } from '../../../components/ui/button';
import RespondToTicketModal from './RespondToTicketModal';
import Spinner from '../../../components/ui/Spinner';
import { toast } from '../../../hooks/use-toast';

const SupportTicketsTable: React.FC = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const ticketsPerPage = 10;

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getSupportTickets();
        setTickets(response.data);
        if (response.data.length === 0) {
          toast({
            title: 'No Tickets',
            description: 'There are currently no support tickets.',
          });
        }
      } catch (error) {
        setError('Failed to load support tickets.');
        toast({
          title: 'Error',
          description: 'Failed to load support tickets.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const paginatedTickets = tickets.slice(
    (page - 1) * ticketsPerPage,
    page * ticketsPerPage
  );

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="flex flex-col">
      <h2 className="text-2xl font-bold text-yellow-200 mb-6">Support Tickets</h2>
      <div className="flex-1 overflow-x-auto bg-gradient-to-br from-yellow-700 to-orange-900 rounded-xl shadow-2xl p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTickets.length > 0 ? (
              paginatedTickets.map((ticket) => (
                <TableRow key={ticket.id} className="hover:bg-[#282A36] transition-colors">
                  <TableCell>{ticket.subject}</TableCell>
                  <TableCell>{ticket.userId}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-semibold 
                      ${ticket.status === 'Open' ? 'bg-yellow-500 text-black' : ticket.status === 'Closed' ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}`}>{ticket.status}</span>
                  </TableCell>
                  <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <RespondToTicketModal ticket={ticket} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                  <div className="flex flex-col items-center justify-center">
                    <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mb-2 text-gray-500"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>No support tickets found.</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-end items-center mt-6">
        <Button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          variant="outline"
        >
          Previous
        </Button>
        <span className="mx-4 text-gray-200">
          Page {page} of {Math.max(1, Math.ceil(tickets.length / ticketsPerPage))}
        </span>
        <Button
          onClick={() => handlePageChange(page + 1)}
          disabled={page * ticketsPerPage >= tickets.length}
          variant="outline"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default SupportTicketsTable;
