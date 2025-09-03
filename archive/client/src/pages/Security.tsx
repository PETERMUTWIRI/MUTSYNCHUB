import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Switch  from '../components/ui/Switch';
import { getSecuritySettings, enable2FA, disable2FA, getSessions, revokeSession, getApiKeys, createApiKey, revokeApiKey } from '../api/user';
import Spinner from '../components/ui/Spinner';

const Security: React.FC = () => {
  const [settings, setSettings] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSecuritySettings(), getSessions(), getApiKeys()])
      .then(([settingsRes, sessionsRes, apiKeysRes]) => {
        setSettings(settingsRes.data);
        setSessions(sessionsRes.data);
        setApiKeys(apiKeysRes.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to fetch security data:', error);
        setLoading(false);
      });
  }, []);

  const handle2FAChange = (enabled: boolean) => {
    const action = enabled ? enable2FA : disable2FA;
    action().then(() => {
      setSettings({ ...settings, '2fa_enabled': enabled });
    });
  };

  const handleRevokeSession = (id: string) => {
    revokeSession(id).then(() => {
      setSessions(sessions.filter(s => s.id !== id));
    });
  };

  const handleCreateApiKey = () => {
    createApiKey('New Key').then(response => {
      setApiKeys([...apiKeys, response.data]);
    });
  };

  const handleRevokeApiKey = (id: string) => {
    revokeApiKey(id).then(() => {
      setApiKeys(apiKeys.filter(k => k.id !== id));
    });
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="max-w-7xl mx-auto py-12">
      <h1 className="text-4xl font-extrabold text-blue-400 tracking-tight drop-shadow-lg mb-8 text-left">Security Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* 2FA Card */}
        <Card className="bg-gray-800 border-gray-700 w-full">
          <CardHeader>
            <CardTitle className="text-blue-300">Two-Factor Authentication (2FA)</CardTitle>
            <p className="text-sm text-gray-300 mt-2">Add an extra layer of protection to your account. Toggle to enable or disable 2FA.</p>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-gray-200">Status: {settings && settings['2fa_enabled'] ? 'Enabled' : 'Disabled'}</span>
            <Switch checked={!!settings && !!settings['2fa_enabled']} onCheckedChange={handle2FAChange} disabled={!settings} />
          </CardContent>
        </Card>

        {/* Password Change Card */}
        <Card className="bg-gray-800 border-gray-700 w-full">
          <CardHeader>
            <CardTitle className="text-blue-300">Change Password</CardTitle>
            <p className="text-sm text-gray-300 mt-2">Update your password regularly to keep your account secure.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <input type="password" placeholder="Current Password" className="bg-gray-700 border-gray-600 text-white rounded-lg w-full p-2" />
            <input type="password" placeholder="New Password" className="bg-gray-700 border-gray-600 text-white rounded-lg w-full p-2" />
            <input type="password" placeholder="Confirm New Password" className="bg-gray-700 border-gray-600 text-white rounded-lg w-full p-2" />
            <Button className="w-full" onClick={() => alert('Password change backend integration needed.')}>Change Password</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Device Management Card */}
        <Card className="bg-gray-800 border-gray-700 w-full">
          <CardHeader>
            <CardTitle className="text-blue-300">Device Management</CardTitle>
            <p className="text-sm text-gray-300 mt-2">View and manage devices that have accessed your account.</p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-blue-400">Device</TableHead>
                  <TableHead className="text-blue-400">Last Seen</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map(session => (
                  <TableRow key={session.id}>
                    <TableCell className="text-gray-200">{session.device}</TableCell>
                    <TableCell className="text-gray-200">{new Date(session.lastSeen).toLocaleString()}</TableCell>
                    <TableCell>
                      <Button variant="destructive" size="sm" onClick={() => handleRevokeSession(session.id)}>
                        Revoke
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Login Alerts Card */}
        <Card className="bg-gray-800 border-gray-700 w-full">
          <CardHeader>
            <CardTitle className="text-blue-300">Login Alerts</CardTitle>
            <p className="text-sm text-gray-300 mt-2">Get notified when your account is accessed from a new device or location.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Switch checked={settings && settings['login_alerts']} onCheckedChange={() => alert('Login alerts backend integration needed.')} disabled={!settings} />
            <span className="text-gray-200">Enable login alerts</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* API Keys Card */}
        <Card className="bg-gray-800 border-gray-700 w-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-blue-300">API Keys</CardTitle>
            <Button onClick={handleCreateApiKey}>Generate New Key</Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-blue-400">Key</TableHead>
                  <TableHead className="text-blue-400">Created</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map(key => (
                  <TableRow key={key.id}>
                    <TableCell className="text-gray-200">{key.value}</TableCell>
                    <TableCell className="text-gray-200">{new Date(key.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="destructive" size="sm" onClick={() => handleRevokeApiKey(key.id)}>
                        Revoke
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Export Logs Card */}
        <Card className="bg-gray-800 border-gray-700 w-full">
          <CardHeader>
            <CardTitle className="text-blue-300">Export Security Logs</CardTitle>
            <p className="text-sm text-gray-300 mt-2">Download a record of recent security events for auditing.</p>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => alert('Export logs backend integration needed.')}>Export Logs</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Security;
