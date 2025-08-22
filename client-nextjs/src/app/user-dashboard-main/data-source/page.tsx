'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProtectedRoute from '@/components/ProtectedRoute';

const dataSourceTypes = [
  { id: 'POS_SYSTEM', name: 'POS System', description: 'Connect your Point-of-Sale system for real-time sales data.', icon: '🛒' },
  { id: 'ERP', name: 'ERP', description: 'Integrate with your ERP for business process automation.', icon: '🏢' },
  { id: 'DATABASE', name: 'Database', description: 'Link any SQL/NoSQL database for analytics.', icon: '🗄️' },
  { id: 'API', name: 'API', description: 'Pull data from any RESTful API.', icon: '🔗' },
  { id: 'FILE_IMPORT', name: 'File Import', description: 'Upload CSV, Excel, or other files.', icon: '📄' },
  { id: 'CUSTOM', name: 'Custom', description: 'Custom integrations for unique needs.', icon: '⚙️' },
];

const scheduleFeatures = [
  { plan: 'Free', frequencies: ['weekly'], limit: 2 },
  { plan: 'Pro', frequencies: ['daily', 'weekly'], limit: 20 },
  { plan: 'Enterprise', frequencies: ['hourly', 'daily', 'weekly', 'monthly', 'custom'], limit: 100 },
];

type ScheduleFeature = {
  plan: string;
  frequencies: string[];
  limit: number;
};

const DataSource: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<ScheduleFeature | null>(null);
  const [selectedFrequency, setSelectedFrequency] = useState<string>('');
  const [interval, setInterval] = useState<string>('');

  const [modalType, setModalType] = useState<string | null>(null);
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [dbHost, setDbHost] = useState('');
  const [dbPort, setDbPort] = useState('');
  const [dbUser, setDbUser] = useState('');
  const [dbPass, setDbPass] = useState('');
  const [dbName, setDbName] = useState('');
  const [importSource, setImportSource] = useState('local');
  const [importFile, setImportFile] = useState<File | null>(null);

  const handleScheduleClick = (plan: ScheduleFeature) => {
    setSelectedPlan(plan);
    setSelectedFrequency('');
    setInterval('');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPlan) return;
    // TODO: Call backend API to schedule analysis
    setShowModal(false);
    alert(`Scheduled analysis for ${selectedPlan.plan} plan with frequency ${selectedFrequency}${selectedFrequency === 'custom' ? ` (interval: ${interval} min)` : ''}`);
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    let payload = {};
    let url = '';
    if (modalType === 'API') {
      url = '/api/data-sources/api';
      payload = { url: apiUrl, apiKey };
    } else if (modalType === 'DATABASE') {
      url = '/api/data-sources/database';
      payload = { host: dbHost, port: dbPort, user: dbUser, pass: dbPass, dbName };
    } else if (modalType === 'FILE_IMPORT') {
      url = '/api/data-sources/import';
      payload = { source: importSource };
      if (importSource === 'local' && importFile) {
        const formData = new FormData();
        formData.append('file', importFile);
        formData.append('source', importSource);
        await fetch(url, { method: 'POST', body: formData });
        setModalType(null);
        alert('File imported!');
        return;
      }
    }
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setModalType(null);
    alert('Connection/Import submitted!');
  };

  const renderModal = () => {
    if (!modalType) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
        <div className="bg-[#1E2A44] rounded-xl p-6 w-full max-w-md shadow-lg border border-[#2E7D7D]/30">
          <button className="absolute top-3 right-4 text-white text-xl" onClick={() => setModalType(null)}>&times;</button>
          {modalType === 'API' && (
            <form onSubmit={handleConnect}>
              <h2 className="text-xl font-semibold text-white mb-4">Connect API</h2>
              <label className="block text-gray-500 mb-2">API URL</label>
              <input type="text" className="mb-3 w-full p-3 rounded-lg bg-[#2E7D7D]/10 text-white border border-[#2E7D7D]/30 focus:ring-2 focus:ring-[#2E7D7D]" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} required />
              <label className="block text-gray-500 mb-2">API Key (optional)</label>
              <input type="text" className="mb-6 w-full p-3 rounded-lg bg-[#2E7D7D]/10 text-white border border-[#2E7D7D]/30 focus:ring-2 focus:ring-[#2E7D7D]" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
              <Button type="submit" className="w-full bg-[#2E7D7D] text-white font-medium py-2 rounded-lg hover:bg-[#2E7D7D]/80 transition-colors">
                Connect
              </Button>
            </form>
          )}
          {modalType === 'DATABASE' && (
            <form onSubmit={handleConnect}>
              <h2 className="text-xl font-semibold text-white mb-4">Connect Database</h2>
              <label className="block text-gray-500 mb-2">Host</label>
              <input type="text" className="mb-2 w-full p-3 rounded-lg bg-[#2E7D7D]/10 text-white border border-[#2E7D7D]/30 focus:ring-2 focus:ring-[#2E7D7D]" value={dbHost} onChange={(e) => setDbHost(e.target.value)} required />
              <label className="block text-gray-500 mb-2">Port</label>
              <input type="text" className="mb-2 w-full p-3 rounded-lg bg-[#2E7D7D]/10 text-white border border-[#2E7D7D]/30 focus:ring-2 focus:ring-[#2E7D7D]" value={dbPort} onChange={(e) => setDbPort(e.target.value)} required />
              <label className="block text-gray-500 mb-2">Username</label>
              <input type="text" className="mb-2 w-full p-3 rounded-lg bg-[#2E7D7D]/10 text-white border border-[#2E7D7D]/30 focus:ring-2 focus:ring-[#2E7D7D]" value={dbUser} onChange={(e) => setDbUser(e.target.value)} required />
              <label className="block text-gray-500 mb-2">Password</label>
              <input type="password" className="mb-2 w-full p-3 rounded-lg bg-[#2E7D7D]/10 text-white border border-[#2E7D7D]/30 focus:ring-2 focus:ring-[#2E7D7D]" value={dbPass} onChange={(e) => setDbPass(e.target.value)} required />
              <label className="block text-gray-500 mb-2">Database Name</label>
              <input type="text" className="mb-6 w-full p-3 rounded-lg bg-[#2E7D7D]/10 text-white border border-[#2E7D7D]/30 focus:ring-2 focus:ring-[#2E7D7D]" value={dbName} onChange={(e) => setDbName(e.target.value)} required />
              <Button type="submit" className="w-full bg-[#2E7D7D] text-white font-medium py-2 rounded-lg hover:bg-[#2E7D7D]/80 transition-colors">
                Connect
              </Button>
            </form>
          )}
          {modalType === 'FILE_IMPORT' && (
            <form onSubmit={handleConnect}>
              <h2 className="text-xl font-semibold text-white mb-4">Import Data</h2>
              <label className="block text-gray-500 mb-2">Import Source</label>
              <select className="mb-4 w-full p-3 rounded-lg bg-[#2E7D7D]/10 text-white border border-[#2E7D7D]/30 focus:ring-2 focus:ring-[#2E7D7D]" value={importSource} onChange={(e) => setImportSource(e.target.value)}>
                <option value="local">Local Storage</option>
                <option value="gdrive">Google Drive</option>
                <option value="onedrive">OneDrive</option>
                <option value="dropbox">Dropbox</option>
              </select>
              {importSource === 'local' && (
                <input type="file" className="mb-6 w-full text-white" onChange={(e) => setImportFile(e.target.files?.[0] || null)} required />
              )}
              <Button type="submit" className="w-full bg-[#2E7D7D] text-white font-medium py-2 rounded-lg hover:bg-[#2E7D7D]/80 transition-colors">
                Import
              </Button>
            </form>
          )}
          {modalType !== 'API' && modalType !== 'DATABASE' && modalType !== 'FILE_IMPORT' && (
            <div className="text-gray-400">Coming soon...</div>
          )}
        </div>
      </div>
      );
    };

  return (
    <ProtectedRoute requiredRole="user">
      <div className="max-w-7xl mx-auto py-10 px-6 bg-[#1E2A44] text-white font-inter">
        <h1 className="text-3xl font-bold mb-6">Data Sources & Analytics Scheduling</h1>
        <p className="text-base text-gray-400 mb-12 max-w-3xl">Connect your data and automate analytics with flexible scheduling. Supported integrations and scheduling options are shown below.</p>

        {/* Data Source Types */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-[#2E7D7D] mb-6">Supported Data Source Types</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dataSourceTypes.map((type) => (
              <Card key={type.id} className="bg-[#2E7D7D]/10 border-0 shadow-lg rounded-xl p-6 hover:bg-[#2E7D7D]/20 transition-colors duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">{type.icon} {type.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-base mb-4">{type.description}</p>
                  {(type.id === 'API' || type.id === 'DATABASE' || type.id === 'FILE_IMPORT') && (
                    <Button className="w-full bg-[#2E7D7D] text-white font-medium mt-2 hover:bg-[#2E7D7D]/80 transition-colors" onClick={() => setModalType(type.id)}>
                      {type.id === 'FILE_IMPORT' ? 'Import' : 'Connect'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Schedule Analytics Features */}
        <div>
          <h2 className="text-xl font-semibold text-[#2E7D7D] mb-6">Schedule Analytics Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {scheduleFeatures.map((f) => (
              <Card key={f.plan} className="bg-[#2E7D7D]/10 border-0 shadow-lg rounded-xl p-6 hover:bg-[#2E7D7D]/20 transition-colors duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">{f.plan} Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-2">Allowed Frequencies:</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {f.frequencies.map((freq) => (
                      <span key={freq} className="inline-block bg-[#2E7D7D]/40 text-white text-xs px-2 py-1 rounded-full">{freq}</span>
                    ))}
                  </div>
                  <p className="text-gray-300">Max Schedules: <span className="font-medium text-white">{f.limit}</span></p>
                  <Button className="mt-4 w-full bg-[#2E7D7D] text-white font-medium hover:bg-[#2E7D7D]/80 transition-colors" onClick={() => handleScheduleClick(f)}>
                    Schedule Analysis
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Schedule Modal */}
        {showModal && selectedPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
            <div className="bg-[#1E2A44] rounded-xl p-6 w-full max-w-md shadow-lg border border-[#2E7D7D]/30">
              <h2 className="text-xl font-semibold text-white mb-4">Schedule Analysis ({selectedPlan.plan} Plan)</h2>
              <form onSubmit={handleSubmit}>
                <label className="block text-gray-500 mb-2">Frequency</label>
                <select
                  className="mb-4 w-full p-3 rounded-lg bg-[#2E7D7D]/10 text-white border border-[#2E7D7D]/30 focus:ring-2 focus:ring-[#2E7D7D]"
                  value={selectedFrequency}
                  onChange={(e) => setSelectedFrequency(e.target.value)}
                  required
                >
                  <option value="" disabled>Select frequency</option>
                  {selectedPlan.frequencies.map((freq: string) => (
                    <option key={freq} value={freq}>{freq}</option>
                  ))}
                </select>
                {selectedFrequency === 'custom' && (
                  <>
                    <label className="block text-gray-500 mb-2">Interval (minutes)</label>
                    <input
                      type="number"
                      min="1"
                      className="mb-4 w-full p-3 rounded-lg bg-[#2E7D7D]/10 text-white border border-[#2E7D7D]/30 focus:ring-2 focus:ring-[#2E7D7D]"
                      value={interval}
                      onChange={(e) => setInterval(e.target.value)}
                      required
                    />
                  </>
                )}
                <Button type="submit" className="w-full mb-2 bg-[#2E7D7D] text-white font-medium py-2 rounded-lg hover:bg-[#2E7D7D]/80 transition-colors">
                  Confirm Schedule
                </Button>
                <Button variant="outline" className="w-full" onClick={() => setShowModal(false)} type="button">
                  Cancel
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default DataSource;