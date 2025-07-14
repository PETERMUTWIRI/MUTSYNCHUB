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

const SupportTicketsTable: React.FC = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const ticketsPerPage = 10;

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await getSupportTickets();
        setTickets(response.data);
      } catch (error) {
        console.error('Error fetching support tickets:', error);
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

  return (
    <div
      className="col-span-1 md:col-span-7 rounded-2xl shadow-xl flex flex-col"
      style={{
        background: '#1A1A2E',
        padding: 32,
      }}
    >
      <h2 className="text-lg font-bold text-gray-200 mb-4">Support Tickets</h2>
      <div className="flex-1 overflow-y-auto bg-[#232347] rounded-lg">
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
                <TableRow key={ticket.id}>
                  <TableCell>{ticket.subject}</TableCell>
                  <TableCell>{ticket.userId}</TableCell>
                  <TableCell>{ticket.status}</TableCell>
                  <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <RespondToTicketModal ticket={ticket} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No support tickets found.
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
          Page {page} of {Math.ceil(tickets.length / ticketsPerPage)}
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
