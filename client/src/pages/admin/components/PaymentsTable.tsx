import React, { useEffect, useState } from 'react';
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

const PaymentsTable: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const paymentsPerPage = 10;

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await getInvoices();
        setPayments(response.data);
      } catch (error) {
        console.error('Error fetching payments:', error);
      }
    };

    fetchPayments();
  }, []);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const paginatedPayments = payments.slice(
    (page - 1) * paymentsPerPage,
    page * paymentsPerPage
  );

  return (
    <div
      className="col-span-1 md:col-span-7 rounded-2xl shadow-xl flex flex-col"
      style={{
        background: '#1A1A2E',
        padding: 32,
      }}
    >
      <h2 className="text-lg font-bold text-gray-200 mb-4">User Payments</h2>
      <div className="flex-1 overflow-y-auto bg-[#232347] rounded-lg">
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
            {paginatedPayments.length > 0 ? (
              paginatedPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.userId}</TableCell>
                  <TableCell>{payment.plan}</TableCell>
                  <TableCell>${payment.amount.toLocaleString()}</TableCell>
                  <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{payment.paymentMethod}</TableCell>
                  <TableCell>{payment.status}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No payments found.
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
          Page {page} of {Math.ceil(payments.length / paymentsPerPage)}
        </span>
        <Button
          onClick={() => handlePageChange(page + 1)}
          disabled={page * paymentsPerPage >= payments.length}
          variant="outline"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default PaymentsTable;
