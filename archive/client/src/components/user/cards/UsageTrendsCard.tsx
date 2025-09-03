import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import { motion } from 'framer-motion';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const data = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Usage',
      data: [120, 190, 170, 220, 260, 210, 250],
      borderColor: 'rgba(59,130,246,1)', // Tailwind blue-500
      backgroundColor: 'rgba(59,130,246,0.2)',
      tension: 0.4,
      pointBackgroundColor: 'rgba(16,185,129,1)', // Tailwind teal-500
      pointBorderColor: 'rgba(59,130,246,1)',
      fill: true,
    },
    {
      label: 'AI Forecast',
      data: [130, 200, 180, 230, 270, 220, 260],
      borderColor: 'rgba(139,92,246,1)', // Tailwind purple-500
      backgroundColor: 'rgba(139,92,246,0.1)',
      borderDash: [5, 5],
      tension: 0.4,
      pointBackgroundColor: 'rgba(139,92,246,1)',
      pointBorderColor: 'rgba(139,92,246,1)',
      fill: false,
    },
  ],
};

const options = {
  responsive: true,
  plugins: {
    legend: {
      labels: { color: '#fff', font: { size: 14 } },
    },
    tooltip: {
      enabled: true,
      backgroundColor: '#1e293b',
      titleColor: '#fff',
      bodyColor: '#fff',
    },
  },
  scales: {
    x: { ticks: { color: '#c7d2fe' }, grid: { color: '#334155' } },
    y: { ticks: { color: '#c7d2fe' }, grid: { color: '#334155' } },
  },
};

export default function UsageTrendsCard() {
  return (
    <motion.div
      className="rounded-2xl shadow-lg bg-gradient-to-br from-indigo-800/60 to-slate-900/80 backdrop-blur-lg p-6 border border-indigo-700/30"
      whileHover={{ scale: 1.03, boxShadow: '0 0 24px #4f46e5' }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="text-teal-400 text-lg font-semibold mb-2">Usage Trends</div>
      <Line data={data} options={options} />
      <div className="mt-4 text-xs text-slate-400">AI Forecast line shows predicted usage for the week.</div>
    </motion.div>
  );
}
