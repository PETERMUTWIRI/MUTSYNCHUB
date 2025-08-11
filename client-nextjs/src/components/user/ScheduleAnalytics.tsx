import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Spinner from '../ui/Spinner';

const ScheduleAnalytics: React.FC = () => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/analytics/schedules');
      if (!res.ok) throw new Error('Failed to fetch scheduled analytics');
      const data = await res.json();
      setSchedules(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/analytics/schedules/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete scheduled analytics');
      fetchSchedules();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Schedule Analytics</CardTitle>
        <Button size="sm">New Schedule</Button>
      </CardHeader>
      <CardContent>
        {loading ? <Spinner /> : error ? <div className="text-red-400">{error}</div> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-white">Name</TableHead>
                <TableHead className="text-white">Frequency</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map(schedule => (
                <TableRow key={schedule.id}>
                  <TableCell className="text-gray-300">{schedule.name}</TableCell>
                  <TableCell className="text-gray-300">{schedule.frequency}</TableCell>
                  <TableCell>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(schedule.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ScheduleAnalytics;
