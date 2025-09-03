import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { name: 'Jan', uptime: 99.9 },
  { name: 'Feb', uptime: 99.8 },
  { name: 'Mar', uptime: 100 },
  { name: 'Apr', uptime: 99.9 },
  { name: 'May', uptime: 99.7 },
  { name: 'Jun', uptime: 99.9 },
  { name: 'Jul', uptime: 100 },
];

const UptimeChart: React.FC = () => {
  return (
    <div className="" style={{ width: '100%', height: 300 }}>
      <h2 className="text-lg font-bold text-emerald-200 mb-4">Uptime (%)</h2>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="uptime" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UptimeChart;
