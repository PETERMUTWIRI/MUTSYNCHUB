import React from 'react';
import { Bar } from 'react-chartjs-2';
import type { ChartData, ChartOptions } from 'chart.js';

interface TopNBarChartProps {
  data: ChartData<'bar'>;
  title?: string;
}

const options: ChartOptions<'bar'> = {
  responsive: true,
  plugins: {
    legend: { display: false },
    // TODO: add title plugin, tooltip callbacks, etc.
  },
};

export default function TopNBarChart({ data, title }: TopNBarChartProps) {
  return (
    <div
      className="bg-gradient-to-br from-purple-900/60 to-indigo-900/80 rounded-2xl p-6 shadow"
      aria-label={title ?? 'Top N Bar Chart'}
    >
      {title && <div className="text-white font-bold mb-2">{title}</div>}
      <Bar data={data} options={options} />
    </div>
  );
}
