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
    createSupportTicket({ subject, description })
      .then(() => {
        setSubject('');
        setDescription('');
        fetchTickets();
      })
      .catch(error => {
        console.error('Failed to create support ticket:', error);
      });
  };

  return (
    <div className="max-w-5xl mx-auto py-12">
      <h1 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-lg mb-8 text-left">Support & Help</h1>

      <Card className="mb-8 bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Submit a Support Ticket</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
        <CardHeader>
          <CardTitle className="text-white">My Support Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Spinner />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-white">Ticket ID</TableHead>
                  <TableHead className="text-white">Subject</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map(ticket => (
                  <TableRow key={ticket.id}>
                    <TableCell className="text-gray-300">#{ticket.id}</TableCell>
                    <TableCell className="text-gray-300">{ticket.subject}</TableCell>
                    <TableCell className={ticket.status === 'Open' ? 'text-yellow-400' : 'text-green-400'}>
                      {ticket.status}
                    </TableCell>
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
          <CardTitle className="text-white">Knowledge Base</CardTitle>
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
