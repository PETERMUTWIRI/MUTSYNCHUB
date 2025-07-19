import React from 'react';
import { Doughnut } from 'react-chartjs-2';

interface DonutChartProps {
  data: any; 
  title?: string;
}

export default function DonutChart({ data, title }: DonutChartProps) {
  return (
    <div className="bg-gradient-to-br from-pink-900/60 to-red-900/80 rounded-2xl p-6 shadow">
      {title && <div className="text-white font-bold mb-2">{title}</div>}
      <Doughnut 
        data={data} 
        options={{ 
          responsive: true, 
          plugins: { legend: { display: true } } 
        }} 
      />
    </div>
  );
}
