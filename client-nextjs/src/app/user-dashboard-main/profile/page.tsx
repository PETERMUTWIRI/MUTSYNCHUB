"use client";
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Switch from '@/components/ui/Switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getProfile, updateProfile, getTeamMembers, removeTeamMember, getNotificationSettings, updateNotificationSettings } from '@/lib/user';
import Spinner from '@/components/ui/Spinner';

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: '' });
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

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

  const handleProfileSave = async () => {
    try {
      await updateProfile(profile);
      setProfileSuccess('Profile updated successfully!');
      setProfileError('');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err) {
      setProfileError('Failed to update profile.');
      setProfileSuccess('');
    }
  };

  const handleRemoveMember = async (id: string) => {
    try {
      await removeTeamMember(id);
      setTeamMembers(teamMembers.filter(m => m.id !== id));
      setInviteSuccess('Member removed successfully.');
      setTimeout(() => setInviteSuccess(''), 3000);
    } catch {
      setInviteError('Failed to remove member.');
      setTimeout(() => setInviteError(''), 3000);
    }
  };
  const handleInviteChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setInviteForm({ ...inviteForm, [e.target.name]: e.target.value });
    setInviteError('');
    setInviteSuccess('');
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!inviteForm.name || !inviteForm.email || !inviteForm.role) {
      setInviteError('All fields are required.');
      return;
    }
    if (!inviteForm.email.match(/^[^@]+@[^@]+\.[^@]+$/)) {
      setInviteError('Please enter a valid email address.');
      return;
    }
    try {
      // Simulate API call (replace with real invite API)
      setTeamMembers([...teamMembers, { ...inviteForm, id: Date.now().toString() }]);
      setInviteSuccess('Member invited successfully!');
      setInviteError('');
      setInviteForm({ name: '', email: '', role: '' });
      setShowInviteModal(false);
      setTimeout(() => setInviteSuccess(''), 3000);
    } catch {
      setInviteError('Failed to invite member.');
      setTimeout(() => setInviteError(''), 3000);
    }
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
      <h1 className="text-4xl font-extrabold text-blue-400 tracking-tight drop-shadow-lg mb-8 text-left">Profile & Settings</h1>

      <Card className="mb-8 bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-blue-300">Edit Profile</CardTitle>
          <p className="text-sm text-gray-300 mt-2">Update your personal details and password. Changes are saved securely.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {profileSuccess && <div className="text-green-400 text-sm mb-2">{profileSuccess}</div>}
          {profileError && <div className="text-red-400 text-sm mb-2">{profileError}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-blue-400">Name</Label>
              <Input id="name" value={profile?.name || ''} onChange={handleProfileChange} className="bg-gray-700 border-gray-600 text-white" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-blue-400">Email</Label>
              <Input id="email" type="email" value={profile?.email || ''} onChange={handleProfileChange} className="bg-gray-700 border-gray-600 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-blue-400">New Password</Label>
            <Input id="password" type="password" className="bg-gray-700 border-gray-600 text-white" />
          </div>
          <Button onClick={handleProfileSave}>Save Changes</Button>
        </CardContent>
      </Card>

      <Card className="mb-8 bg-gray-800 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
          <CardTitle className="text-blue-300">Organization/Team</CardTitle>
          <p className="text-sm text-gray-300 mt-2">Manage your team members. Invite new members and assign roles. Remove members as needed.</p>
          </div>
          <Button onClick={() => setShowInviteModal(true)}>Invite Member</Button>
        </CardHeader>
        <CardContent>
          {inviteSuccess && <div className="text-green-400 text-sm mb-2">{inviteSuccess}</div>}
          {inviteError && <div className="text-red-400 text-sm mb-2">{inviteError}</div>}
      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-md shadow-2xl border border-blue-500/30 relative">
            <h2 className="text-xl font-bold text-white mb-4">Invite New Member</h2>
            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <Label htmlFor="invite-name" className="text-white">Name</Label>
                <Input id="invite-name" name="name" value={inviteForm.name} onChange={handleInviteChange} className="bg-gray-700 border-gray-600 text-white" required />
              </div>
              <div>
                <Label htmlFor="invite-email" className="text-white">Email</Label>
                <Input id="invite-email" name="email" type="email" value={inviteForm.email} onChange={handleInviteChange} className="bg-gray-700 border-gray-600 text-white" required />
              </div>
              <div>
                <Label htmlFor="invite-role" className="text-white">Role</Label>
                <select id="invite-role" name="role" value={inviteForm.role} onChange={handleInviteChange} className="bg-gray-700 border-gray-600 text-white w-full p-2 rounded-lg" required>
                  <option value="">Select role</option>
                  <option value="Admin">Admin</option>
                  <option value="Member">Member</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>
              {inviteError && <div className="text-red-400 text-sm mb-2">{inviteError}</div>}
              <div className="flex gap-2">
                <Button type="submit" className="w-full bg-blue-600 text-white font-bold">Invite</Button>
                <Button variant="outline" className="w-full" type="button" onClick={() => setShowInviteModal(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-blue-400">Name</TableHead>
                <TableHead className="text-blue-400">Email</TableHead>
                <TableHead className="text-blue-400">Role</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembers.map(member => (
                <TableRow key={member.id}>
                  <TableCell className="text-gray-200">{member.name}</TableCell>
                  <TableCell className="text-gray-200">{member.email}</TableCell>
                  <TableCell className="text-gray-200">{member.role}</TableCell>
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
          <CardTitle className="text-blue-300">Notification Preferences</CardTitle>
          <p className="text-sm text-gray-300 mt-2">Choose which updates you want to receive. Toggle notifications for product, billing, and support.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="product-updates" className="text-blue-400">Product Updates</Label>
            <Switch
              id="product-updates"
              checked={notificationSettings?.['product-updates'] || false}
              onCheckedChange={(checked: boolean) => handleNotificationChange('product-updates', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="billing-updates" className="text-blue-400">Billing Updates</Label>
            <Switch
              id="billing-updates"
              checked={notificationSettings?.['billing-updates'] || false}
              onCheckedChange={(checked: boolean) => handleNotificationChange('billing-updates', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="support-updates" className="text-blue-400">Support Updates</Label>
            <Switch
              id="support-updates"
              checked={notificationSettings?.['support-updates'] || false}
              onCheckedChange={(checked: boolean) => handleNotificationChange('support-updates', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
