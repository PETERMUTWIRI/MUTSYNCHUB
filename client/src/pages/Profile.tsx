import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getProfile, updateProfile, getTeamMembers, removeTeamMember, getNotificationSettings, updateNotificationSettings } from '../api/user';
import Spinner from '../components/ui/Spinner';

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProfile(), getTeamMembers(), getNotificationSettings()])
      .then(([profileRes, teamRes, notificationsRes]) => {
        setProfile(profileRes.data);
        setTeamMembers(teamRes.data);
        setNotificationSettings(notificationsRes.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to fetch profile data:', error);
        setLoading(false);
      });
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.id]: e.target.value });
  };

  const handleProfileSave = () => {
    updateProfile(profile);
  };

  const handleRemoveMember = (id: string) => {
    removeTeamMember(id).then(() => {
      setTeamMembers(teamMembers.filter(m => m.id !== id));
    });
  };

  const handleNotificationChange = (id: string, checked: boolean) => {
    const newSettings = { ...notificationSettings, [id]: checked };
    setNotificationSettings(newSettings);
    updateNotificationSettings(newSettings);
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="max-w-5xl mx-auto py-12">
      <h1 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-lg mb-8 text-left">Profile & Settings</h1>

      <Card className="mb-8 bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Edit Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">Name</Label>
              <Input id="name" value={profile.name} onChange={handleProfileChange} className="bg-gray-700 border-gray-600 text-white" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input id="email" type="email" value={profile.email} onChange={handleProfileChange} className="bg-gray-700 border-gray-600 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">New Password</Label>
            <Input id="password" type="password" className="bg-gray-700 border-gray-600 text-white" />
          </div>
          <Button onClick={handleProfileSave}>Save Changes</Button>
        </CardContent>
      </Card>

      <Card className="mb-8 bg-gray-800 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Organization/Team</CardTitle>
          <Button>Invite Member</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-white">Name</TableHead>
                <TableHead className="text-white">Email</TableHead>
                <TableHead className="text-white">Role</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembers.map(member => (
                <TableRow key={member.id}>
                  <TableCell className="text-gray-300">{member.name}</TableCell>
                  <TableCell className="text-gray-300">{member.email}</TableCell>
                  <TableCell className="text-gray-300">{member.role}</TableCell>
                  <TableCell>
                    <Button variant="destructive" size="sm" onClick={() => handleRemoveMember(member.id)}>
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="product-updates" className="text-white">Product Updates</Label>
            <Switch
              id="product-updates"
              checked={notificationSettings['product-updates']}
              onCheckedChange={checked => handleNotificationChange('product-updates', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="billing-updates" className="text-white">Billing Updates</Label>
            <Switch
              id="billing-updates"
              checked={notificationSettings['billing-updates']}
              onCheckedChange={checked => handleNotificationChange('billing-updates', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="support-updates" className="text-white">Support Updates</Label>
            <Switch
              id="support-updates"
              checked={notificationSettings['support-updates']}
              onCheckedChange={checked => handleNotificationChange('support-updates', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
