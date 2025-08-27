'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Spinner from '@/components/ui/Spinner';

interface Schedule {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  source: string; // e.g., 'POS', 'ERP'
  lastRun: string;
  nextRun: string;
  reportId?: string; // Links to generated report
}

const fetchSchedules = async (filter: { source: string; frequency: string }) => {
  const res = await fetch(`/api/analytics/schedules?source=${filter.source}&frequency=${filter.frequency}`);
  if (!res.ok) throw new Error('Failed to fetch schedules');
  return res.json();
};

const deleteSchedule = async (id: string) => {
  const res = await fetch(`/api/analytics/schedules/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete schedule');
  return res.json();
};

const runSchedule = async (id: string) => {
  const res = await fetch(`/api/analytics/schedules/${id}/run`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to run schedule');
  return res.json();
};

const ScheduleAnalytics: React.FC = () => {
  const [filter, setFilter] = useState({ source: 'all', frequency: 'all' });
  const [search, setSearch] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const queryClient = useQueryClient();

  const { data: schedules = [], isLoading, error } = useQuery({
    queryKey: ['schedules', filter],
    queryFn: () => fetchSchedules(filter),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSchedule,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['schedules'] }),
  });

  const runMutation = useMutation({
    mutationFn: runSchedule,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['schedules'] }),
  });

  // Mock run history for visualization (replace with API data)
  const runHistory = selectedSchedule
    ? [
        { date: '2025-07-01', duration: 120 },
        { date: '2025-07-02', duration: 150 },
        { date: '2025-07-03', duration: 130 },
      ]
    : [];

  const filteredSchedules = schedules.filter((s: Schedule) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDrillDown = (schedule: Schedule) => {
    setSelectedSchedule(schedule); // Show run history or report details
  };

  return (
    <motion.div
      className="bg-[#1E2A44] rounded-xl shadow-xl p-6 min-h-[200px]"
      whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(46, 125, 125, 0.5)' }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card className="bg-transparent border-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-inter text-gray-200">Scheduled Analytics</CardTitle>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="sm"
              className="bg-[#2E7D7D] hover:bg-[#2E7D7D]/80 text-white font-inter text-base"
              onClick={() => alert('Navigate to create schedule')} // Replace with Next.js navigation
            >
              New Schedule
            </Button>
          </motion.div>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex space-x-4 mb-4">
            <Select
              value={filter.source}
              onValueChange={(value) => setFilter({ ...filter, source: value })}
            >
              <SelectTrigger className="bg-[#1E2A44] border-[#2E7D7D] text-gray-200">
                <SelectValue placeholder="Data Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="pos">POS</SelectItem>
                <SelectItem value="erp">ERP</SelectItem>
                <SelectItem value="cloud">Cloud DB</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filter.frequency}
              onValueChange={(value) => setFilter({ ...filter, frequency: value })}
            >
              <SelectTrigger className="bg-[#1E2A44] border-[#2E7D7D] text-gray-200">
                <SelectValue placeholder="Frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Frequencies</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Search schedules..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#1E2A44] border-[#2E7D7D] text-gray-200 font-inter text-base"
            />
          </div>

          {/* Schedule Table */}
          {isLoading ? (
            <Spinner />
          ) : error ? (
            <div className="text-red-400 font-inter text-base">{error.message}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-[#2E7D7D]">
                  <TableHead className="text-gray-200 font-inter text-base">Name</TableHead>
                  <TableHead className="text-gray-200 font-inter text-base">Source</TableHead>
                  <TableHead className="text-gray-200 font-inter text-base">Frequency</TableHead>
                  <TableHead className="text-gray-200 font-inter text-base">Last Run</TableHead>
                  <TableHead className="text-gray-200 font-inter text-base">Next Run</TableHead>
                  <TableHead className="text-gray-200 font-inter text-base">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchedules.map((schedule: Schedule) => (
                  <TableRow
                    key={schedule.id}
                    className="border-[#2E7D7D] cursor-pointer hover:bg-[#2E7D7D]/20"
                    onClick={() => handleDrillDown(schedule)}
                  >
                    <TableCell className="text-gray-300 font-inter text-base">{schedule.name}</TableCell>
                    <TableCell className="text-gray-300 font-inter text-base">{schedule.source}</TableCell>
                    <TableCell className="text-gray-300 font-inter text-base">{schedule.frequency}</TableCell>
                    <TableCell className="text-gray-300 font-inter text-base">
                      {new Date(schedule.lastRun).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-gray-300 font-inter text-base">
                      {new Date(schedule.nextRun).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            size="sm"
                            onClick={() => runMutation.mutate(schedule.id)}
                            className="bg-[#2E7D7D] hover:bg-[#2E7D7D]/80 text-white font-inter text-base"
                          >
                            Run Now
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteMutation.mutate(schedule.id)}
                            className="bg-red-600 hover:bg-red-600/80 text-white font-inter text-base"
                          >
                            Delete
                          </Button>
                        </motion.div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Drill-Down: Run History or Report Preview */}
          {selectedSchedule && (
            <div className="mt-4 p-4 bg-[#1E2A44] rounded-xl">
              <h3 className="text-lg font-inter text-gray-200">Details: {selectedSchedule.name}</h3>
              <p className="text-base font-inter text-gray-300">Source: {selectedSchedule.source}</p>
              <p className="text-base font-inter text-gray-300">Report ID: {selectedSchedule.reportId || 'N/A'}</p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={runHistory}>
                  <CartesianGrid stroke="#2E7D7D" strokeOpacity={0.3} />
                  <XAxis dataKey="date" stroke="#text-gray-300" />
                  <YAxis stroke="#text-gray-300" />
                  <Tooltip contentStyle={{ background: '#1E2A44', border: '1px solid #2E7D7D' }} />
                  <Line type="monotone" dataKey="duration" stroke="#2E7D7D" name="Run Duration (s)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ScheduleAnalytics;