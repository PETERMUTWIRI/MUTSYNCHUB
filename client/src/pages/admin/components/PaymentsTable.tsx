import React, { useEffect, useState } from 'react';
import { Input } from '../../../components/ui/input';
import { getInvoices } from '../../../api/admin';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Button } from '../../../components/ui/button';
import Spinner from '../../../components/ui/Spinner';
import { toast } from '../../../hooks/use-toast';

const PaymentsTable: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [totalPayments, setTotalPayments] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const paymentsPerPage = 10;

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getInvoices({
          page,
          pageSize: paymentsPerPage,
          search,
        });
        setPayments(response.data.items || []);
        setTotalPayments(response.data.total || 0);
        if ((response.data.items || []).length === 0) {
          toast({
            title: 'No Payments',
            description: 'There are currently no payments.',
          });
        }
      } catch (error) {
        setError('Failed to load payments.');
        toast({
          title: 'Error',
          description: 'Failed to load payments.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [page, search]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
        <h2 className="text-2xl font-bold text-cyan-200 flex items-center gap-2">User Payments</h2>
        <Input
          placeholder="Search payments..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="max-w-xs"
        />
      </div>
      <div className="flex-1 overflow-x-auto bg-gradient-to-br from-blue-800 to-indigo-900 rounded-xl shadow-2xl p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length > 0 ? (
              payments.map((payment) => (
                <TableRow key={payment.id} className="hover:bg-[#282A36] transition-colors">
                  <TableCell>{payment.userId}</TableCell>
                  <TableCell>{payment.plan}</TableCell>
                  <TableCell>${payment.amount.toLocaleString()}</TableCell>
                  <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{payment.paymentMethod}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-semibold 
                      ${payment.status === 'Paid' ? 'bg-green-600 text-white' : payment.status === 'Pending' ? 'bg-yellow-500 text-black' : 'bg-gray-600 text-white'}`}>{payment.status}</span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                  <div className="flex flex-col items-center justify-center">
                    <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mb-2 text-gray-500"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>No payments found.</span>
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
          Page {page} of {Math.max(1, Math.ceil(totalPayments / paymentsPerPage))}
        </span>
        <Button
          onClick={() => handlePageChange(page + 1)}
          disabled={page * paymentsPerPage >= totalPayments}
          variant="outline"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default PaymentsTable;
