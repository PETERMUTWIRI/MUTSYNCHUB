'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getCurrentPlan, getInvoices, getPaymentMethods, deletePaymentMethod } from '@/lib/user';
import Spinner from '@/components/ui/Spinner';
import ProtectedRoute from '@/components/ProtectedRoute';

const Billing: React.FC = () => {
  const [plan, setPlan] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      description: 'Basic access for individuals and small teams.',
      price: 0,
      currency: 'KSH',
      features: [
        'Monthly queries to the agent: 15',
        'Number of scheduled reports: 2 (weekly)',
        'Basic analytics dashboard',
      ],
      category: 'Basic',
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'For growing teams and businesses.',
      price: 3000,
      currency: 'KSH',
      features: [
        'Monthly queries to the agent: 500',
        'Number of scheduled reports: 20 (daily, weekly)',
        'Advanced analytics dashboard',
        'Faster support response',
      ],
      category: 'Professional',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Custom solutions for large organizations.',
      price: 10000,
      currency: 'KSH',
      features: [
        'Monthly queries to the agent: 5000',
        'Number of scheduled reports: 100 (hourly, daily, weekly, monthly, custom)',
        'Full analytics suite',
        '24/7 support',
        'Integrate with your stack',
      ],
      category: 'Enterprise',
    },
  ];

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
    <ProtectedRoute requiredRole="user">
      <div className="max-w-7xl mx-auto py-10 px-6 bg-[#1E2A44] text-white font-inter">
        <h1 className="text-3xl font-bold mb-6">Your Billing Journey</h1>
        <p className="text-base text-gray-400 mb-12 max-w-3xl">Choose the perfect plan for your team and unlock powerful analytics, reporting, and support. Your growth story starts here.</p>

        {/* Plans Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((p) => (
            <Card
              key={p.id}
              className={`border-0 shadow-lg bg-[#2E7D7D]/10 hover:bg-[#2E7D7D]/20 transition-colors duration-300 rounded-xl p-6 ${p.id === 'enterprise' ? 'ring-2 ring-[#2E7D7D]' : ''}`}
              onClick={() => { setSelectedPlan(p); setShowPaymentModal(true); }}
            >
              <CardHeader>
                <div className="flex items-center gap-2 mb-4">
                  {p.id === 'free' && <span className="bg-[#2E7D7D]/40 text-white text-xs px-2 py-1 rounded-full">Starter</span>}
                  {p.id === 'pro' && <span className="bg-[#2E7D7D]/40 text-white text-xs px-2 py-1 rounded-full">Popular</span>}
                  {p.id === 'enterprise' && <span className="bg-[#2E7D7D]/40 text-white text-xs px-2 py-1 rounded-full">Best Value</span>}
                </div>
                <CardTitle className="text-2xl font-semibold mb-2">{p.name}</CardTitle>
                <div className="text-gray-500 text-sm uppercase tracking-wide mb-2">{p.category}</div>
                <div className="text-3xl font-bold mb-2">{p.price === 0 ? 'Free' : `KSH ${p.price}/month`}</div>
                <p className="text-gray-300 text-base mb-4 italic">{p.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-gray-200 text-base">
                      <span className="text-[#2E7D7D]">•</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment Modal */}
        {showPaymentModal && selectedPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
            <div className="bg-[#1E2A44] rounded-xl p-8 w-full max-w-md shadow-lg border border-[#2E7D7D]/30">
              <h2 className="text-2xl font-bold text-white mb-4">Subscribe to {selectedPlan.name}</h2>
              <p className="text-gray-400 mb-4 text-base">Unlock <span className="font-medium text-[#2E7D7D]">{selectedPlan.category}</span> features for your team.</p>
              <div className="text-xl font-bold text-white mb-4">{selectedPlan.price === 0 ? 'Free' : `KSH ${selectedPlan.price}/month`}</div>
              <input type="text" placeholder="Card Number" className="mb-3 w-full p-3 rounded-lg bg-[#2E7D7D]/10 text-white border border-[#2E7D7D]/30 focus:ring-2 focus:ring-[#2E7D7D]" />
              <input type="text" placeholder="Expiry" className="mb-3 w-full p-3 rounded-lg bg-[#2E7D7D]/10 text-white border border-[#2E7D7D]/30 focus:ring-2 focus:ring-[#2E7D7D]" />
              <input type="text" placeholder="CVC" className="mb-6 w-full p-3 rounded-lg bg-[#2E7D7D]/10 text-white border border-[#2E7D7D]/30 focus:ring-2 focus:ring-[#2E7D7D]" />
              <Button className="w-full mb-2 bg-[#2E7D7D] text-white font-medium py-2 rounded-lg hover:bg-[#2E7D7D]/80 transition-colors">
                Pay & Subscribe
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setShowPaymentModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Current Plan Section */}
        <Card className="mb-8 bg-[#2E7D7D]/10 border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-semibold text-white">Your Current Plan</CardTitle>
            <Button className="bg-[#2E7D7D] text-white font-medium hover:bg-[#2E7D7D]/80 transition-colors">Upgrade Plan</Button>
          </CardHeader>
          <CardContent>
            {plan ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white">
                <div>
                  <p className="text-gray-500">Plan</p>
                  <p className="text-lg font-medium">{plan.name} {plan.name === 'Enterprise' && <span className="bg-[#2E7D7D]/40 text-white text-xs px-2 py-1 rounded-full">Enterprise</span>}</p>
                </div>
                <div>
                  <p className="text-gray-500">Price</p>
                  <p className="text-lg font-medium">{plan.price === 0 ? 'Free' : `KSH ${plan.price}/month`}</p>
                </div>
                <div>
                  <p className="text-gray-500">Next Invoice</p>
                  <p className="text-lg font-medium">{plan.nextInvoice ? new Date(plan.nextInvoice).toLocaleDateString() : '-'}</p>
                </div>
              </div>
            ) : (
              <div className="text-gray-500">No plan information available.</div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-8 bg-[#2E7D7D]/10 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-white">Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-300">Date</TableHead>
                  <TableHead className="text-gray-300">Amount</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="text-gray-400">{new Date(invoice.date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-gray-400">{`KSH ${invoice.amount.toFixed(2)}`}</TableCell>
                    <TableCell className={invoice.status === 'Paid' ? 'text-green-400' : 'text-yellow-400'}>
                      {invoice.status}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" className="text-[#2E7D7D] border-[#2E7D7D]">
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-[#2E7D7D]/10 border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-semibold text-white">Payment Methods</CardTitle>
            <Button className="bg-[#2E7D7D] text-white font-medium hover:bg-[#2E7D7D]/80 transition-colors">
              Add Method
            </Button>
          </CardHeader>
          <CardContent>
            {paymentMethods.map((pm) => (
              <div key={pm.id} className="flex items-center justify-between p-4 bg-[#2E7D7D]/20 rounded-lg mb-4">
                <p className="text-white">{pm.cardType} ending in {pm.last4}</p>
                <Button variant="destructive" size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => handleDeletePaymentMethod(pm.id)}>
                  Remove
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
};

export default Billing;