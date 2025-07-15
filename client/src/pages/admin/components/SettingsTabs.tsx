import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { updateSettings } from '../../../api/admin';
import { useToast } from '../../../hooks/use-toast';
import { Checkbox } from '../../../components/ui/checkbox';

const SettingsTabs: React.FC = () => {
  const { toast } = useToast();
  const [generalSettings, setGeneralSettings] = React.useState({
    appName: '',
    logo: '',
    primaryColor: '',
    timezone: '',
  });

  const handleGeneralSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGeneralSettings({
      ...generalSettings,
      [e.target.id]: e.target.value,
    });
  };

  const handleGeneralSettingsSave = async () => {
    try {
      await updateSettings(generalSettings);
      toast({
        title: 'Settings saved',
        description: 'Your general settings have been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error saving settings',
        description: 'An error occurred while saving your settings.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Tabs defaultValue="general">
      <TabsList className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-xl shadow mb-6">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="authentication">Authentication</TabsTrigger>
        <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="general">
        <div className="rounded-2xl shadow-2xl bg-gradient-to-br from-blue-800 to-indigo-900 p-8">
          <h2 className="text-lg font-bold text-cyan-200 mb-4">General Settings</h2>
          <div className="grid gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="appName" className="text-right">
                App Name
              </Label>
              <Input id="appName" className="col-span-3" value={generalSettings.appName} onChange={handleGeneralSettingsChange} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="logo" className="text-right">
                Logo
              </Label>
              <Input id="logo" type="file" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="primaryColor" className="text-right">
                Primary Color
              </Label>
              <Input id="primaryColor" type="color" className="col-span-3" value={generalSettings.primaryColor} onChange={handleGeneralSettingsChange} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="timezone" className="text-right">
                Timezone
              </Label>
              <Input id="timezone" className="col-span-3" value={generalSettings.timezone} onChange={handleGeneralSettingsChange} />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleGeneralSettingsSave}>Save</Button>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="authentication">
        <div className="rounded-2xl shadow-2xl bg-gradient-to-br from-purple-800 to-indigo-900 p-8">
          <h2 className="text-lg font-bold text-purple-200 mb-4">Authentication Settings</h2>
          <div className="grid gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="passwordPolicy" className="text-right">
                Password Policy
              </Label>
              <Input id="passwordPolicy" className="col-span-3" />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="2fa" />
              <Label htmlFor="2fa">Enable Two-Factor Authentication</Label>
            </div>
            <div className="flex justify-end">
              <Button>Save</Button>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="roles">
        <div className="rounded-2xl shadow-2xl bg-gradient-to-br from-fuchsia-800 to-indigo-900 p-8">
          <h2 className="text-lg font-bold text-fuchsia-200 mb-4">Roles & Permissions</h2>
          {/* Roles and permissions table will go here */}
          <div className="flex justify-end">
            <Button>Save</Button>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="billing">
        <div className="rounded-2xl shadow-2xl bg-gradient-to-br from-emerald-800 to-green-900 p-8">
          <h2 className="text-lg font-bold text-emerald-200 mb-4">Billing Settings</h2>
          <div className="grid gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="defaultCurrency" className="text-right">
                Default Currency
              </Label>
              <Input id="defaultCurrency" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="billingEmail" className="text-right">
                Billing Email
              </Label>
              <Input id="billingEmail" type="email" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="taxSettings" className="text-right">
                Tax Settings
              </Label>
              <Input id="taxSettings" className="col-span-3" />
            </div>
            <div className="flex justify-end">
              <Button>Save</Button>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="notifications">
        <div className="rounded-2xl shadow-2xl bg-gradient-to-br from-yellow-700 to-orange-900 p-8">
          <h2 className="text-lg font-bold text-yellow-200 mb-4">Notifications Settings</h2>
          <div className="grid gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="emailTemplates" className="text-right">
                Email Templates
              </Label>
              <Input id="emailTemplates" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="webhookUrls" className="text-right">
                Webhook URLs
              </Label>
              <Input id="webhookUrls" className="col-span-3" />
            </div>
            <div className="flex justify-end">
              <Button>Save</Button>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default SettingsTabs;
