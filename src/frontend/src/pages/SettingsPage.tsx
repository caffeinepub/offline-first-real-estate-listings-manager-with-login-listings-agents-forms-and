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
import { exportToExcel, importFromExcel } from '../utils/excelIo';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { mode, setMode } = useStorageMode();
  const [credentials, setCredentialsState] = useState(() => getCredentials());
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setCredentials(credentials);
    toast.success('Login credentials updated successfully! Please log in again with new credentials.');
  };

  const handleExportJSON = async () => {
    try {
      const { getAllRecords, getAllAgents, getAllReminders, getAllDeals } = await import('../storage/localDb');
      const records = await getAllRecords();
      const agents = await getAllAgents();
      const reminders = await getAllReminders();
      const deals = await getAllDeals();
      
      const data = {
        records,
        agents,
        reminders,
        deals,
        exportedAt: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `real-estate-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Data exported to JSON successfully!');
    } catch (error) {
      toast.error('Failed to export data');
      console.error(error);
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const { getAllRecords, getAllAgents, getAllReminders, getAllDeals } = await import('../storage/localDb');
      const records = await getAllRecords();
      const agents = await getAllAgents();
      const reminders = await getAllReminders();
      const deals = await getAllDeals();
      
      await exportToExcel({ records, agents, reminders, deals });
      toast.success('Data exported to CSV successfully! You can open this file in Excel.');
    } catch (error) {
      toast.error('Failed to export to CSV');
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      const { saveRecord, saveAgent, saveReminder, saveDeal } = await import('../storage/localDb');
      
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

      if (data.reminders) {
        for (const reminder of data.reminders) {
          await saveReminder(reminder);
        }
      }

      if (data.deals) {
        for (const deal of data.deals) {
          await saveDeal(deal);
        }
      }
      
      toast.success('Data imported from JSON successfully!');
      window.location.reload();
    } catch (error) {
      toast.error('Failed to import JSON data. Please check the file format.');
      console.error(error);
    } finally {
      setIsImporting(false);
      e.target.value = '';
    }
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const data = await importFromExcel(file);
      
      const { saveRecord, saveAgent, saveReminder, saveDeal } = await import('../storage/localDb');
      
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

      if (data.reminders) {
        for (const reminder of data.reminders) {
          await saveReminder(reminder);
        }
      }

      if (data.deals) {
        for (const deal of data.deals) {
          await saveDeal(deal);
        }
      }
      
      toast.success('Data imported from CSV successfully!');
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || 'Failed to import CSV data. Please check the file format.');
      console.error(error);
    } finally {
      setIsImporting(false);
      e.target.value = '';
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
              Export your data to CSV (Excel-compatible) or JSON, or import previously exported data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium mb-2">Export</h4>
                <div className="flex gap-3">
                  <Button onClick={handleExportCSV} variant="outline" disabled={isExporting}>
                    {isExporting ? 'Exporting...' : 'Export to CSV (Excel)'}
                  </Button>
                  <Button onClick={handleExportJSON} variant="outline">
                    Export to JSON
                  </Button>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Import</h4>
                <div className="flex gap-3">
                  <div>
                    <Input
                      type="file"
                      accept=".csv"
                      onChange={handleImportCSV}
                      className="hidden"
                      id="import-csv-file"
                      disabled={isImporting}
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => document.getElementById('import-csv-file')?.click()}
                      disabled={isImporting}
                    >
                      {isImporting ? 'Importing...' : 'Import from CSV'}
                    </Button>
                  </div>
                  <div>
                    <Input
                      type="file"
                      accept=".json"
                      onChange={handleImportJSON}
                      className="hidden"
                      id="import-json-file"
                      disabled={isImporting}
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => document.getElementById('import-json-file')?.click()}
                      disabled={isImporting}
                    >
                      {isImporting ? 'Importing...' : 'Import from JSON'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              CSV files can be opened in Excel and contain records, agents, reminders, and deals in separate sections. All data is stored locally in your browser.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
