import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getCurrentPlan, getInvoices, getPaymentMethods, deletePaymentMethod } from '../api/user';
import Spinner from '../components/ui/Spinner';

const Billing: React.FC = () => {
  const [plan, setPlan] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCurrentPlan(), getInvoices(), getPaymentMethods()])
      .then(([planRes, invoicesRes, paymentMethodsRes]) => {
        setPlan(planRes.data);
        setInvoices(invoicesRes.data);
        setPaymentMethods(paymentMethodsRes.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to fetch billing data:', error);
        setLoading(false);
      });
  }, []);

  const handleDeletePaymentMethod = (id: string) => {
    deletePaymentMethod(id)
      .then(() => {
        setPaymentMethods(paymentMethods.filter(pm => pm.id !== id));
      })
      .catch(error => {
        console.error('Failed to delete payment method:', error);
      });
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="max-w-5xl mx-auto py-12">
      <h1 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-lg mb-8 text-left">Billing & Payments</h1>

      <Card className="mb-8 bg-gray-800 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Current Plan</CardTitle>
          <Button>Upgrade Plan</Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white">
            <div>
              <p className="text-gray-400">Plan</p>
              <p className="text-xl font-bold">{plan.name}</p>
            </div>
            <div>
              <p className="text-gray-400">Price</p>
              <p className="text-xl font-bold">${plan.price}/month</p>
            </div>
            <div>
              <p className="text-gray-400">Next Invoice</p>
              <p className="text-xl font-bold">{new Date(plan.nextInvoice).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8 bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-white">Date</TableHead>
                <TableHead className="text-white">Amount</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map(invoice => (
                <TableRow key={invoice.id}>
                  <TableCell className="text-gray-300">{new Date(invoice.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-gray-300">${invoice.amount.toFixed(2)}</TableCell>
                  <TableCell className={invoice.status === 'Paid' ? 'text-green-400' : 'text-yellow-400'}>
                    {invoice.status}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">Download</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Payment Methods</CardTitle>
          <Button>Add Method</Button>
        </CardHeader>
        <CardContent>
          {paymentMethods.map(pm => (
            <div key={pm.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <p className="text-white">{pm.cardType} ending in {pm.last4}</p>
              <Button variant="destructive" size="sm" onClick={() => handleDeletePaymentMethod(pm.id)}>
                Remove
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default Billing;
