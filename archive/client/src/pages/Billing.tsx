import { useEffect, useState } from 'react';
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  // Example plans, replace with API fetch if needed
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
    <div className="max-w-6xl mx-auto py-16 px-4">
      <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 mb-6 drop-shadow-lg text-left">Your Billing Journey</h1>
      <p className="text-lg text-gray-300 mb-12 max-w-2xl">Choose the perfect plan for your team and unlock powerful analytics, reporting, and support. Your growth story starts here.</p>

      {/* Plans Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
        {plans.map(p => (
          <Card key={p.id} className={`relative overflow-hidden border-0 shadow-2xl cursor-pointer transition-all duration-300 ${p.id === 'enterprise' ? 'ring-4 ring-pink-400' : 'hover:ring-2 hover:ring-blue-400'} bg-gradient-to-br from-gray-900/80 to-gray-800/90 backdrop-blur-lg`} onClick={() => { setSelectedPlan(p); setShowPaymentModal(true); }}>
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-500/30 via-purple-500/20 to-pink-400/20 blur-xl z-0" />
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                {p.id === 'free' && <span className="inline-block bg-blue-500 text-white text-xs px-2 py-1 rounded-full">Starter</span>}
                {p.id === 'pro' && <span className="inline-block bg-purple-500 text-white text-xs px-2 py-1 rounded-full">Popular</span>}
                {p.id === 'enterprise' && <span className="inline-block bg-pink-500 text-white text-xs px-2 py-1 rounded-full">Best Value</span>}
              </div>
              <CardTitle className="text-white text-3xl font-extrabold mb-2 flex items-center gap-2">
                {p.id === 'free' && <span>🟦</span>}
                {p.id === 'pro' && <span>🟪</span>}
                {p.id === 'enterprise' && <span>💎</span>}
                {p.name}
              </CardTitle>
              <div className="text-blue-300 font-semibold mb-2 text-sm uppercase tracking-wide">{p.category}</div>
              <div className="text-4xl font-extrabold text-white mb-2">{p.price === 0 ? 'Free' : `KSH ${p.price}/month`}</div>
              <div className="text-gray-200 mb-2 italic text-base">{p.description}</div>
            </CardHeader>
            <CardContent className="relative z-10">
              <ul className="space-y-2">
                {p.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-gray-100 text-base">
                    <span className="inline-block w-5 h-5 text-blue-400">{p.id === 'free' ? '🔹' : p.id === 'pro' ? '🔸' : '💡'}</span>
                    {f}
                  </li>
                ))}
              </ul>
            </CardContent>
            <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-400/10 blur-lg z-0" />
          </Card>
        ))}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-gradient-to-br from-gray-900/90 to-blue-900/80 rounded-2xl p-10 w-full max-w-md shadow-2xl border border-blue-500/30 relative">
            <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-r from-blue-500/30 via-purple-500/20 to-pink-400/20 blur-lg z-0" />
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-4 drop-shadow">Subscribe to {selectedPlan.name}</h2>
            <p className="text-gray-200 mb-4 text-lg">Unlock <span className="font-bold text-blue-300">{selectedPlan.category}</span> features for your team.</p>
            <div className="text-2xl font-bold text-white mb-4">{selectedPlan.price === 0 ? 'Free' : `KSH ${selectedPlan.price}/month`}</div>
            {/* Payment form fields here */}
            <input type="text" placeholder="Card Number" className="mb-3 w-full p-3 rounded-lg bg-gray-800/80 text-white border border-blue-500/30 focus:ring-2 focus:ring-blue-400" />
            <input type="text" placeholder="Expiry" className="mb-3 w-full p-3 rounded-lg bg-gray-800/80 text-white border border-blue-500/30 focus:ring-2 focus:ring-blue-400" />
            <input type="text" placeholder="CVC" className="mb-6 w-full p-3 rounded-lg bg-gray-800/80 text-white border border-blue-500/30 focus:ring-2 focus:ring-blue-400" />
            <Button className="w-full mb-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-lg py-2 rounded-lg shadow-lg">Pay & Subscribe</Button>
            <Button variant="outline" className="w-full" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Current Plan Section */}
      <Card className="mb-10 bg-gradient-to-br from-gray-900/80 to-gray-800/90 border-0 shadow-xl backdrop-blur-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white text-2xl font-bold flex items-center gap-2">Your Current Plan {plan && plan.name === 'Enterprise' && <span className="inline-block bg-pink-500 text-white text-xs px-2 py-1 rounded-full">Enterprise</span>}</CardTitle>
          <Button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold">Upgrade Plan</Button>
        </CardHeader>
        <CardContent>
          {plan ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white">
              <div>
                <p className="text-gray-400">Plan</p>
                <p className="text-xl font-bold flex items-center gap-2">{plan.name} {plan.name === 'Enterprise' && <span className="inline-block bg-pink-500 text-white text-xs px-2 py-1 rounded-full">Enterprise</span>}</p>
              </div>
              <div>
                <p className="text-gray-400">Price</p>
                <p className="text-xl font-bold">{plan.price === 0 ? 'Free' : `KSH ${plan.price}/month`}</p>
              </div>
              <div>
                <p className="text-gray-400">Next Invoice</p>
                <p className="text-xl font-bold">{plan.nextInvoice ? new Date(plan.nextInvoice).toLocaleDateString() : '-'}</p>
              </div>
            </div>
          ) : (
            <div className="text-gray-400">No plan information available.</div>
          )}
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
