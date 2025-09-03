import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getQueryHistory, runAdHocQuery } from '../../api/user';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Spinner from '../ui/Spinner';
import { Input } from '../ui/input';

const QueryAnalytics: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = () => {
    setLoading(true);
    getQueryHistory()
      .then(response => {
        setHistory(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to fetch query history:', error);
        setLoading(false);
      });
  };

  const handleRunQuery = () => {
    runAdHocQuery({ query })
      .then(() => {
        setQuery('');
        fetchHistory();
      })
      .catch(error => {
        console.error('Failed to run query:', error);
      });
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
            className="bg-gray-700 border-gray-600 text-white"
          />
          <Button onClick={handleRunQuery} className="ml-2">
            Run Query
          </Button>
        </div>
        {loading ? (
          <Spinner />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-white">Query</TableHead>
                <TableHead className="text-white">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="text-gray-300">{item.query}</TableCell>
                  <TableCell className="text-gray-300">{new Date(item.createdAt).toLocaleString()}</TableCell>
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
