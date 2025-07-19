import React from 'react';
import { Line } from 'react-chartjs-2';
import type { ChartData } from 'chart.js';

interface TimeSeriesChartProps {
  data: ChartData<'line'>;
  anomalies?: { x: string | number }[];
}

export default function TimeSeriesChart({ data, anomalies }: TimeSeriesChartProps) {
  return (
    <div
      className="bg-gradient-to-br from-indigo-900/60 to-slate-900/80 rounded-2xl p-6 shadow"
      aria-label="Time series chart with anomalies"
    >
      <Line
        key={JSON.stringify(data)}
        data={data}
        options={{
          responsive: true,
          plugins: {
            legend: { display: true },
            // TODO: Add title or tooltip customization here
          },
        }}
      />
      {(anomalies?.length ?? 0) > 0 && (
        <div className="mt-2 text-xs text-orange-400">
          Anomalies detected at: {anomalies!.map(a => a.x).join(', ')}
        </div>
      )}
    </div>
  );
}
