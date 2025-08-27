import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '../ui/input';
import Spinner from '../ui/Spinner';

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
    <motion.div
      className="bg-[#1E2A44] rounded-xl shadow-xl p-6 min-h-[200px]"
      whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(46, 125, 125, 0.5)' }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card className="bg-transparent border-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-inter text-gray-200">Query Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex mb-4">
            <Input
              placeholder="Enter your query..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
              className="bg-[#1E2A44] border-[#2E7D7D] text-gray-200 font-inter text-base focus:ring-[#2E7D7D]"
            />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                onClick={handleRunQuery}
                disabled={loading || !query.trim()}
                className="ml-2 bg-[#2E7D7D] hover:bg-[#2E7D7D]/80 text-white font-inter text-base"
              >
                Run Query
              </Button>
            </motion.div>
          </div>
          {loading ? (
            <Spinner />
          ) : error ? (
            <div className="text-red-400 font-inter text-base">{error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-[#2E7D7D]">
                  <TableHead className="text-gray-200 font-inter text-base">Query</TableHead>
                  <TableHead className="text-gray-200 font-inter text-base">Date</TableHead>
                  <TableHead className="text-gray-200 font-inter text-base">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((item, idx) => (
                  <TableRow key={idx} className="border-[#2E7D7D]">
                    <TableCell className="text-gray-300 font-inter text-base">{item.query}</TableCell>
                    <TableCell className="text-gray-300 font-inter text-base">
                      {new Date(item.date).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-gray-300 font-inter text-base">{item.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QueryAnalytics;