import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { getCredentials, setCredentials } from '../auth/authStore';
import { useAuth } from '../auth/AuthProvider';
import { useStorageMode } from '../hooks/useStorageMode';
import { usePersistentStorage } from '../hooks/usePersistentStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { exportToExcel, importFromExcel } from '../utils/excelIo';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { mode, setMode } = useStorageMode();
  const { status, isRequesting, requestPersistence, isSupported, isPersisted } = usePersistentStorage();
  const [credentials, setCredentialsState] = useState(() => getCredentials());
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save the new credentials
    setCredentials(credentials);
    
    toast.success('Login credentials updated successfully! Logging out...');
    
    // Log out the user and redirect to login
    setTimeout(() => {
      logout();
      navigate({ to: '/login' });
    }, 1500);
  };

  const handleRequestPersistence = async () => {
    const granted = await requestPersistence();
    if (granted) {
      toast.success('Persistent storage granted! Your data will be protected from automatic cleanup.');
    } else {
      toast.error('Persistent storage request denied. Your browser may automatically clear data when storage is low.');
    }
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

  const getPersistenceStatusIcon = () => {
    switch (status) {
      case 'granted':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'denied':
        return <XCircle className="w-5 h-5 text-amber-600" />;
      case 'unsupported':
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
      default:
        return <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />;
    }
  };

  const getPersistenceStatusText = () => {
    switch (status) {
      case 'granted':
        return 'Persistent storage is enabled. Your data is protected from automatic cleanup.';
      case 'denied':
        return 'Persistent storage is not enabled. Your browser may clear data when storage is low.';
      case 'unsupported':
        return 'Persistent storage is not supported in your browser.';
      default:
        return 'Checking persistent storage status...';
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
            <CardDescription>Update your username and password. You will be logged out after saving.</CardDescription>
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
            <CardDescription>Choose where to store your data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="storage-mode">Storage Location</Label>
                <Select value={mode} onValueChange={(value: 'local' | 'canister') => setMode(value)}>
                  <SelectTrigger id="storage-mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">Local (Offline-first)</SelectItem>
                    <SelectItem value="canister">Canister (Cloud sync)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground">
                {mode === 'local' 
                  ? 'Data is stored locally in your browser. Works completely offline.'
                  : 'Data is synced to the Internet Computer. Requires internet connection.'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Persistent Storage</CardTitle>
            <CardDescription>Protect your data from automatic browser cleanup</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                {getPersistenceStatusIcon()}
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">
                    {status === 'granted' ? 'Protected' : status === 'denied' ? 'Not Protected' : status === 'unsupported' ? 'Not Available' : 'Checking...'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {getPersistenceStatusText()}
                  </p>
                </div>
              </div>

              {isSupported && !isPersisted && (
                <Button 
                  onClick={handleRequestPersistence} 
                  disabled={isRequesting}
                  className="w-full"
                >
                  {isRequesting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Requesting...
                    </>
                  ) : (
                    'Request Persistent Storage'
                  )}
                </Button>
              )}

              <div className="text-sm text-muted-foreground space-y-2">
                <p className="font-medium">What is persistent storage?</p>
                <p>
                  When enabled, your browser promises not to automatically delete your app data when storage space is low. 
                  This ensures your property listings, agents, and reminders remain safe even if you don't use the app for a while.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Import/Export</CardTitle>
            <CardDescription>Backup or restore your data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Export Data</h4>
                <div className="flex gap-2">
                  <Button onClick={handleExportJSON} variant="outline">
                    Export as JSON
                  </Button>
                  <Button onClick={handleExportCSV} variant="outline" disabled={isExporting}>
                    {isExporting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      'Export as CSV (Excel)'
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Import Data</h4>
                <div className="flex gap-2">
                  <div>
                    <Input
                      type="file"
                      accept=".json"
                      onChange={handleImportJSON}
                      disabled={isImporting}
                      className="hidden"
                      id="import-json"
                    />
                    <Label htmlFor="import-json">
                      <Button variant="outline" disabled={isImporting} asChild>
                        <span>
                          {isImporting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Importing...
                            </>
                          ) : (
                            'Import JSON'
                          )}
                        </span>
                      </Button>
                    </Label>
                  </div>
                  <div>
                    <Input
                      type="file"
                      accept=".csv"
                      onChange={handleImportCSV}
                      disabled={isImporting}
                      className="hidden"
                      id="import-csv"
                    />
                    <Label htmlFor="import-csv">
                      <Button variant="outline" disabled={isImporting} asChild>
                        <span>
                          {isImporting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Importing...
                            </>
                          ) : (
                            'Import CSV (Excel)'
                          )}
                        </span>
                      </Button>
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
