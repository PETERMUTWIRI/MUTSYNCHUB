import React from 'react';

const maintenances = [
  { id: 1, title: 'Database Upgrade', date: '2025-08-01' },
  { id: 2, title: 'Server Migration', date: '2025-08-15' },
];

const MaintenanceList: React.FC = () => {
  return (
    <div className="">
      <h2 className="text-lg font-bold text-cyan-200 mb-4">Scheduled Maintenance</h2>
      <ul>
        {maintenances.map((maintenance) => (
          <li key={maintenance.id} className="flex justify-between items-center py-2">
            <span>{maintenance.title}</span>
            <span>{maintenance.date}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MaintenanceList;
