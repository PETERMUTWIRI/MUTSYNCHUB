import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ScheduleAnalytics from '../components/user/ScheduleAnalytics';
import QueryAnalytics from '../components/user/QueryAnalytics';
import { getUsageAnalytics, exportAnalytics } from '../api/user';
import Spinner from '../components/ui/Spinner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Analytics: React.FC = () => {
  const [usageData, setUsageData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsageAnalytics()
      .then(response => {
        setUsageData(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to fetch usage analytics:', error);
        setLoading(false);
      });
  }, []);

  const handleExport = (format: 'csv' | 'pdf') => {
    exportAnalytics(format)
      .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `analytics.${format}`);
        document.body.appendChild(link);
        link.click();
      })
      .catch(error => {
        console.error(`Failed to export analytics as ${format}:`, error);
      });
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="max-w-5xl mx-auto py-12">
      <h1 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-lg mb-8 text-left">Analytics</h1>

      <Card className="mb-8 bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Usage Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={usageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="queries" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ScheduleAnalytics />
        <QueryAnalytics />
      </div>

      <div className="mt-8 text-right">
        <Button variant="outline" onClick={() => handleExport('csv')}>Export as CSV</Button>
        <Button variant="outline" className="ml-4" onClick={() => handleExport('pdf')}>Export as PDF</Button>
      </div>
    </div>
  );
};

export default Analytics;
