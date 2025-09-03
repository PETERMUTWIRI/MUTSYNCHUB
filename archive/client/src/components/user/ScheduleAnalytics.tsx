import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getScheduledAnalytics, deleteScheduledAnalytics } from '../../api/user';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Spinner from '../ui/Spinner';

const ScheduleAnalytics: React.FC = () => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = () => {
    setLoading(true);
    getScheduledAnalytics()
      .then(response => {
        setSchedules(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to fetch scheduled analytics:', error);
        setLoading(false);
      });
  };

  const handleDelete = (id: string) => {
    deleteScheduledAnalytics(id)
      .then(() => {
        fetchSchedules();
      })
      .catch(error => {
        console.error('Failed to delete scheduled analytics:', error);
      });
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Schedule Analytics</CardTitle>
        <Button size="sm">New Schedule</Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Spinner />
        ) : (
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
