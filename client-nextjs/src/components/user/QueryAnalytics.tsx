import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Spinner from '../ui/Spinner';
import { Input } from '../ui/input';

const QueryAnalytics: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/analytics/query-history');
      if (!res.ok) throw new Error('Failed to fetch query history');
      const data = await res.json();
      setHistory(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRunQuery = async () => {
    setError(null);
    try {
      const res = await fetch('/api/analytics/run-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (!res.ok) throw new Error('Failed to run query');
      await res.json();
      setQuery('');
      fetchHistory();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Query Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex mb-4">
          <Input
            placeholder="Enter your query..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            disabled={loading}
            className="bg-gray-700 border-gray-600 text-white"
          />
          <Button size="sm" onClick={handleRunQuery} disabled={loading || !query.trim()} className="ml-2">
            Run Query
          </Button>
        </div>
        {loading ? <Spinner /> : error ? <div className="text-red-400">{error}</div> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-white">Query</TableHead>
                <TableHead className="text-white">Date</TableHead>
                <TableHead className="text-white">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell className="text-gray-300">{item.query}</TableCell>
                  <TableCell className="text-gray-300">{new Date(item.date).toLocaleString()}</TableCell>
                  <TableCell className="text-gray-300">{item.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default QueryAnalytics;
