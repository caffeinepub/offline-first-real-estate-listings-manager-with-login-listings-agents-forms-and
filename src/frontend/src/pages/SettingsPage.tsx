import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { getCredentials, setCredentials } from '../auth/authStore';
import { useStorageMode } from '../hooks/useStorageMode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { mode, setMode } = useStorageMode();
  const [credentials, setCredentialsState] = useState(() => getCredentials());

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setCredentials(credentials);
    toast.success('Login credentials updated successfully! Please log in again with new credentials.');
  };

  const handleExport = async () => {
    try {
      const { getAllRecords, getAllAgents } = await import('../storage/localDb');
      const records = await getAllRecords();
      const agents = await getAllAgents();
      
      const data = {
        records,
        agents,
        exportedAt: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `real-estate-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data');
      console.error(error);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      const { saveRecord, saveAgent } = await import('../storage/localDb');
      
      if (data.records) {
        for (const record of data.records) {
          await saveRecord(record);
        }
      }
      
      if (data.agents) {
        for (const agent of data.agents) {
          await saveAgent(agent);
        }
      }
      
      toast.success('Data imported successfully!');
      window.location.reload();
    } catch (error) {
      toast.error('Failed to import data. Please check the file format.');
      console.error(error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Button variant="ghost" onClick={() => navigate({ to: '/' })} className="mb-4 gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Button>

      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">Settings</h2>
        <p className="text-muted-foreground">Manage your application settings</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Login Credentials</CardTitle>
            <CardDescription>Update your username and password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveCredentials} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={credentials.username}
                  onChange={(e) => setCredentialsState({ ...credentials, username: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentialsState({ ...credentials, password: e.target.value })}
                  required
                />
              </div>
              <Button type="submit">Save Credentials</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Storage Mode</CardTitle>
            <CardDescription>
              Choose where to store your data. Local mode works offline and stores data in your browser.
              Canister mode stores data on the Internet Computer blockchain.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Current Mode</Label>
              <Select value={mode} onValueChange={(value: 'local' | 'canister') => setMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local (Offline)</SelectItem>
                  <SelectItem value="canister">Canister (Blockchain)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">
              Current mode: <span className="font-medium">{mode === 'local' ? 'Local (Offline)' : 'Canister (Blockchain)'}</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Import / Export Data</CardTitle>
            <CardDescription>
              Export your data to a file or import previously exported data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Button onClick={handleExport} variant="outline">
                Export Data
              </Button>
              <div>
                <Input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                  id="import-file"
                />
                <Button variant="outline" onClick={() => document.getElementById('import-file')?.click()}>
                  Import Data
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Export creates a JSON file that can be opened in Excel or imported back into the app.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
