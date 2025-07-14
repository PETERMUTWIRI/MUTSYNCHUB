import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { name: 'Jan', Enterprise: 4000, SaaS: 2400 },
  { name: 'Feb', Enterprise: 3000, SaaS: 1398 },
  { name: 'Mar', Enterprise: 2000, SaaS: 9800 },
  { name: 'Apr', Enterprise: 2780, SaaS: 3908 },
  { name: 'May', Enterprise: 1890, SaaS: 4800 },
  { name: 'Jun', Enterprise: 2390, SaaS: 3800 },
  { name: 'Jul', Enterprise: 3490, SaaS: 4300 },
];

const RevenueChart: React.FC = () => {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="Enterprise" stroke="#8884d8" />
          <Line type="monotone" dataKey="SaaS" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
