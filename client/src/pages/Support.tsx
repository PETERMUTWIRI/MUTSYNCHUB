import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getSupportTickets, createSupportTicket } from '../api/user';
import Spinner from '../components/ui/Spinner';

const Support: React.FC = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = () => {
    setLoading(true);
    getSupportTickets()
      .then(response => {
        setTickets(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to fetch support tickets:', error);
        setLoading(false);
      });
  };

  const handleSubmitTicket = () => {
    setSubmitError('');
    setSubmitSuccess('');
    if (!subject.trim() || !description.trim()) {
      setSubmitError('Please fill in both subject and description.');
      return;
    }
    createSupportTicket({ subject, description })
      .then(() => {
        setSubject('');
        setDescription('');
        setSubmitSuccess('Support ticket submitted successfully!');
        setSubmitError('');
        fetchTickets();
        setTimeout(() => setSubmitSuccess(''), 3000);
      })
      .catch(error => {
        setSubmitError('Failed to create support ticket.');
        setSubmitSuccess('');
      });
  };

  return (
    <div className="max-w-5xl mx-auto py-12">
      <div id="support-center"></div>
      <div id="help-center"></div>
      <div id="contact"></div>
      <div id="community"></div>
      <div id="system-status"></div>
      <h1 className="text-4xl font-extrabold text-blue-400 tracking-tight mb-8 text-left">Support & Help</h1>

      <Card className="mb-8 bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-blue-300">Submit a Support Ticket</CardTitle>
          <p className="text-sm text-gray-300 mt-2">Need help? Submit a ticket and our support team will get back to you promptly. Please provide as much detail as possible.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {submitSuccess && <div className="text-green-400 text-sm mb-2">{submitSuccess}</div>}
          {submitError && <div className="text-red-400 text-sm mb-2">{submitError}</div>}
          <div className="space-y-2">
            <Input
              id="subject"
              placeholder="Subject"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <div className="space-y-2">
            <Textarea
              id="description"
              placeholder="Describe your issue..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <Button onClick={handleSubmitTicket}>Submit Ticket</Button>
        </CardContent>
      </Card>

      <Card className="mb-8 bg-gray-800 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
          <CardTitle className="text-blue-300">My Support Tickets</CardTitle>
          <p className="text-sm text-gray-300 mt-2">Track your submitted tickets and their status. Click 'View' for more details or updates.</p>
          </div>
          <Button variant="outline" onClick={fetchTickets} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Spinner />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-blue-400">Ticket ID</TableHead>
                  <TableHead className="text-blue-400">Subject</TableHead>
                  <TableHead className="text-blue-400">Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map(ticket => (
                  <TableRow key={ticket.id}>
                    <TableCell className="text-gray-200">#{ticket.id}</TableCell>
                    <TableCell className="text-gray-200">{ticket.subject}</TableCell>
                    <TableCell className={ticket.status === 'Open' ? 'text-yellow-400' : 'text-green-400'}>{ticket.status}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-blue-300">Knowledge Base</CardTitle>
          <p className="text-sm text-gray-300 mt-2">Find answers to common questions and guides. Search or browse articles below.</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Input placeholder="Search for articles..." className="bg-gray-700 border-gray-600 text-white" />
          </div>
          <div className="mt-4 space-y-2">
            <a href="#" className="block text-blue-400 hover:underline">How to upgrade your plan</a>
            <a href="#" className="block text-blue-400 hover:underline">Understanding your invoice</a>
            <a href="#" className="block text-blue-400 hover:underline">How to invite team members</a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Support;
