import React from 'react';
import { Badge } from '../../../components/ui/badge';

const incidents = [
  { id: 1, title: 'API Latency Issues', status: 'Investigating', level: 'yellow' },
  { id: 2, title: 'Dashboard Unresponsive', status: 'Resolved', level: 'green' },
  { id: 3, title: 'Payment Gateway Down', status: 'Resolved', level: 'green' },
];

const IncidentsList: React.FC = () => {
  return (
    <div className="rounded-2xl shadow-xl bg-[#1A1A2E] p-8">
      <h2 className="text-lg font-bold text-gray-200 mb-4">Incidents</h2>
      <ul>
        {incidents.map((incident) => (
          <li key={incident.id} className="flex justify-between items-center py-2">
            <span>{incident.title}</span>
            <Badge className={`bg-${incident.level}-500`}>{incident.status}</Badge>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IncidentsList;
