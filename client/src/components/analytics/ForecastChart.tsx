import React from 'react';
import { Line } from 'react-chartjs-2';
import { ChartData, ChartOptions } from 'chart.js';

interface ForecastChartProps {
  data: ChartData<'line'>;
  options?: ChartOptions<'line'>;
  title?: string;
}

export default function ForecastChart({ data, options, title }: ForecastChartProps) {
  const defaultOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: { 
      legend: { display: true },
      tooltip: { mode: 'index', intersect: false },
    },
    interaction: { mode: 'nearest', axis: 'x', intersect: false },
    scales: {
      y: {
        ticks: {
          callback: value => {
            const num = Number(value);
            return num >= 1000 ? `${(num / 1000).toFixed(0)}k` : num;
          }
        },
        beginAtZero: true
      }
    }
  };

  const mergedOptions = { ...defaultOptions, ...options };

  return (
    <div className="bg-gradient-to-br from-teal-900/60 to-blue-900/80 rounded-2xl p-6 shadow">
      {title && <div className="text-white font-bold mb-2">{title}</div>}
      <Line data={data} options={mergedOptions} />
    </div>
  );
}
