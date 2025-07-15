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
    <div className="w-full h-[420px] md:h-[520px] bg-gradient-to-br from-emerald-900 to-green-900 rounded-2xl shadow-2xl p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 32, right: 32, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2dd4bf" />
          <XAxis dataKey="name" stroke="#a7f3d0" />
          <YAxis stroke="#a7f3d0" />
          <Tooltip contentStyle={{ background: '#134e4a', border: 'none', color: '#a7f3d0' }} labelStyle={{ color: '#a7f3d0' }} />
          <Legend wrapperStyle={{ color: '#a7f3d0' }} />
          <Line type="monotone" dataKey="Enterprise" stroke="#34d399" strokeWidth={3} dot={{ r: 5, fill: '#34d399' }} />
          <Line type="monotone" dataKey="SaaS" stroke="#60a5fa" strokeWidth={3} dot={{ r: 5, fill: '#60a5fa' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
