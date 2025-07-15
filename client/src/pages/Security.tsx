import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
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
    <div className="max-w-5xl mx-auto py-12">
      <h1 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-lg mb-8 text-left">Security</h1>

      <Card className="mb-8 bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Two-Factor Authentication (2FA)</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-gray-300">Enable 2FA to add an extra layer of security to your account.</p>
          <Switch checked={settings['2fa_enabled']} onCheckedChange={handle2FAChange} />
        </CardContent>
      </Card>

      <Card className="mb-8 bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Session Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-white">Device</TableHead>
                <TableHead className="text-white">Last Seen</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map(session => (
                <TableRow key={session.id}>
                  <TableCell className="text-gray-300">{session.device}</TableCell>
                  <TableCell className="text-gray-300">{new Date(session.lastSeen).toLocaleString()}</TableCell>
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

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">API Keys</CardTitle>
          <Button onClick={handleCreateApiKey}>Generate New Key</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-white">Key</TableHead>
                <TableHead className="text-white">Created</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map(key => (
                <TableRow key={key.id}>
                  <TableCell className="text-gray-300">{key.value}</TableCell>
                  <TableCell className="text-gray-300">{new Date(key.createdAt).toLocaleDateString()}</TableCell>
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
    </div>
  );
};

export default Security;
