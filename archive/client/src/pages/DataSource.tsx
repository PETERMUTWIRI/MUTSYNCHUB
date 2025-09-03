import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

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
  // Schedule modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<ScheduleFeature | null>(null);
  const [selectedFrequency, setSelectedFrequency] = useState<string>('');
  const [interval, setInterval] = useState<string>('');

  // Data source modal state
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

  // Backend interaction for connecting/importing data sources
  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Replace with real API endpoint and error handling
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
      // For file upload, use FormData
      if (importSource === 'local' && importFile) {
        const formData = new FormData();
        formData.append('file', importFile);
        formData.append('source', importSource);
        // Example fetch for file upload
        await fetch(url, { method: 'POST', body: formData });
        setModalType(null);
        alert('File imported!');
        return;
      }
    }
    // Example fetch for API/DB (replace with your API logic)
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setModalType(null);
    alert('Connection/Import submitted!');
  };

  // Modal for connecting/importing data sources
  const renderModal = () => {
    if (!modalType) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
        <div className="bg-gradient-to-br from-gray-900/90 to-blue-900/80 rounded-2xl p-8 w-full max-w-md shadow-2xl border border-blue-500/30 relative">
          <button className="absolute top-3 right-4 text-white text-2xl" onClick={() => setModalType(null)}>&times;</button>
          {modalType === 'API' && (
            <form onSubmit={handleConnect}>
              <h2 className="text-2xl font-bold text-white mb-4">Connect API</h2>
              <label className="block text-gray-300 mb-2">API URL</label>
              <input type="text" className="mb-4 w-full p-3 rounded-lg bg-gray-800/80 text-white border border-blue-500/30" value={apiUrl} onChange={e => setApiUrl(e.target.value)} required />
              <label className="block text-gray-300 mb-2">API Key (optional)</label>
              <input type="text" className="mb-4 w-full p-3 rounded-lg bg-gray-800/80 text-white border border-blue-500/30" value={apiKey} onChange={e => setApiKey(e.target.value)} />
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-lg py-2 rounded-lg shadow-lg">Connect</Button>
            </form>
          )}
          {modalType === 'DATABASE' && (
            <form onSubmit={handleConnect}>
              <h2 className="text-2xl font-bold text-white mb-4">Connect Database</h2>
              <label className="block text-gray-300 mb-2">Host</label>
              <input type="text" className="mb-2 w-full p-3 rounded-lg bg-gray-800/80 text-white border border-blue-500/30" value={dbHost} onChange={e => setDbHost(e.target.value)} required />
              <label className="block text-gray-300 mb-2">Port</label>
              <input type="text" className="mb-2 w-full p-3 rounded-lg bg-gray-800/80 text-white border border-blue-500/30" value={dbPort} onChange={e => setDbPort(e.target.value)} required />
              <label className="block text-gray-300 mb-2">Username</label>
              <input type="text" className="mb-2 w-full p-3 rounded-lg bg-gray-800/80 text-white border border-blue-500/30" value={dbUser} onChange={e => setDbUser(e.target.value)} required />
              <label className="block text-gray-300 mb-2">Password</label>
              <input type="password" className="mb-2 w-full p-3 rounded-lg bg-gray-800/80 text-white border border-blue-500/30" value={dbPass} onChange={e => setDbPass(e.target.value)} required />
              <label className="block text-gray-300 mb-2">Database Name</label>
              <input type="text" className="mb-4 w-full p-3 rounded-lg bg-gray-800/80 text-white border border-blue-500/30" value={dbName} onChange={e => setDbName(e.target.value)} required />
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-lg py-2 rounded-lg shadow-lg">Connect</Button>
            </form>
          )}
          {modalType === 'FILE_IMPORT' && (
            <form onSubmit={handleConnect}>
              <h2 className="text-2xl font-bold text-white mb-4">Import Data</h2>
              <label className="block text-gray-300 mb-2">Import Source</label>
              <select className="mb-4 w-full p-3 rounded-lg bg-gray-800/80 text-white border border-blue-500/30" value={importSource} onChange={e => setImportSource(e.target.value)}>
                <option value="local">Local Storage</option>
                <option value="gdrive">Google Drive</option>
                <option value="onedrive">OneDrive</option>
                <option value="dropbox">Dropbox</option>
              </select>
              {importSource === 'local' && (
                <input type="file" className="mb-4 w-full text-white" onChange={e => setImportFile(e.target.files?.[0] || null)} required />
              )}
              {/* For cloud sources, you would add OAuth or picker logic here */}
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-lg py-2 rounded-lg shadow-lg">Import</Button>
            </form>
          )}
          {/* Placeholder for other types */}
          {modalType !== 'API' && modalType !== 'DATABASE' && modalType !== 'FILE_IMPORT' && (
            <div className="text-white">Coming soon...</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto py-16 px-4">
      {renderModal()}
      <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 mb-8 drop-shadow-lg text-left">Data Sources & Analytics Scheduling</h1>
      <p className="text-lg text-gray-300 mb-10 max-w-2xl">Connect your data and automate analytics with flexible scheduling. Supported integrations and scheduling options are shown below.</p>

      {/* Data Source Types */}
      <div className="mb-14">
        <h2 className="text-2xl font-bold text-blue-300 mb-6">Supported Data Source Types</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {dataSourceTypes.map(type => (
            <Card key={type.id} className="bg-gradient-to-br from-gray-900/80 to-gray-800/90 border-0 shadow-xl backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white text-xl font-bold flex items-center gap-2">{type.icon} {type.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-base mb-4">{type.description}</p>
                {(type.id === 'API' || type.id === 'DATABASE' || type.id === 'FILE_IMPORT') && (
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold mt-2" onClick={() => setModalType(type.id)}>
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
        <h2 className="text-2xl font-bold text-purple-300 mb-6">Schedule Analytics Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {scheduleFeatures.map(f => (
            <Card key={f.plan} className="bg-gradient-to-br from-purple-900/80 to-blue-800/90 border-0 shadow-xl backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white text-xl font-bold">{f.plan} Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-2">Allowed Frequencies:</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {f.frequencies.map(freq => (
                    <span key={freq} className="inline-block bg-blue-500 text-white text-xs px-2 py-1 rounded-full">{freq}</span>
                  ))}
                </div>
                <p className="text-gray-300">Max Schedules: <span className="font-bold text-white">{f.limit}</span></p>
                <Button className="mt-4 w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold" onClick={() => handleScheduleClick(f)}>Schedule Analysis</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Schedule Modal */}
      {showModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-gradient-to-br from-gray-900/90 to-blue-900/80 rounded-2xl p-10 w-full max-w-md shadow-2xl border border-blue-500/30 relative">
            <h2 className="text-2xl font-bold text-white mb-4">Schedule Analysis ({selectedPlan.plan} Plan)</h2>
            <form onSubmit={handleSubmit}>
              <label className="block text-gray-300 mb-2">Frequency</label>
              <select
                className="mb-4 w-full p-3 rounded-lg bg-gray-800/80 text-white border border-blue-500/30"
                value={selectedFrequency}
                onChange={e => setSelectedFrequency(e.target.value)}
                required
              >
                <option value="" disabled>Select frequency</option>
                {selectedPlan.frequencies.map((freq: string) => (
                  <option key={freq} value={freq}>{freq}</option>
                ))}
              </select>
              {selectedFrequency === 'custom' && (
                <>
                  <label className="block text-gray-300 mb-2">Interval (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    className="mb-4 w-full p-3 rounded-lg bg-gray-800/80 text-white border border-blue-500/30"
                    value={interval}
                    onChange={e => setInterval(e.target.value)}
                    required
                  />
                </>
              )}
              <Button type="submit" className="w-full mb-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-lg py-2 rounded-lg shadow-lg">Confirm Schedule</Button>
              <Button variant="outline" className="w-full" onClick={() => setShowModal(false)} type="button">Cancel</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataSource;
