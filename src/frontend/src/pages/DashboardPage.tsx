import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { useRecords, useSaveRecord, useReminders, useSaveReminder, useDeleteReminder } from '../hooks/useLocalRepository';
import { searchRecords } from '../features/search/searchIndex';
import { computeMatches } from '../features/matching/matchEngine';
import { dismissMatch, isMatchDismissed } from '../features/matching/dismissedMatchesStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Star, Search, Plus, Bell, X, Eye } from 'lucide-react';
import { toast } from 'sonner';
import ReminderModal from '../components/ReminderModal';
import AddReminderDialog from '../components/AddReminderDialog';

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddReminder, setShowAddReminder] = useState(false);
  const { data: records = [], isLoading } = useRecords();
  const { data: reminders = [] } = useReminders();
  const saveRecord = useSaveRecord();
  const saveReminder = useSaveReminder();
  const deleteReminder = useDeleteReminder();

  const [dueReminder, setDueReminder] = useState<any>(null);

  // Check for due reminders
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().slice(0, 5);

      for (const reminder of reminders) {
        if (reminder.date === currentDate && reminder.time <= currentTime && !reminder.dismissed) {
          setDueReminder(reminder);
          saveReminder.mutate({ ...reminder, dismissed: true });
          break;
        }
      }
    };

    checkReminders();
    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [reminders]);

  const handleDismissReminder = () => {
    setDueReminder(null);
  };

  const handleDeleteReminder = async () => {
    if (dueReminder) {
      try {
        await deleteReminder.mutateAsync(dueReminder.id);
        setDueReminder(null);
        toast.success('Reminder deleted');
      } catch (error) {
        toast.error('Failed to delete reminder');
      }
    }
  };

  const handleAddReminder = async (reminderData: { note: string; date: string; time: string }) => {
    const reminder = {
      id: `reminder-${Date.now()}`,
      ...reminderData,
      dismissed: false,
      createdAt: Date.now()
    };

    try {
      await saveReminder.mutateAsync(reminder);
      toast.success('Reminder added successfully!');
    } catch (error) {
      toast.error('Failed to add reminder');
    }
  };

  const toggleStarred = async (record: any) => {
    try {
      await saveRecord.mutateAsync({
        ...record,
        starred: !record.starred
      });
    } catch (error) {
      toast.error('Failed to update starred status');
    }
  };

  const starredBuyers = records
    .filter(r => r.category === 'Customer' && r.starred)
    .slice(0, 20);

  const starredSellers = records
    .filter(r => r.category !== 'Customer' && r.starred)
    .slice(0, 20);

  const searchResults = searchQuery.trim() ? searchRecords(records, searchQuery) : [];

  // Compute matches
  const allMatches = computeMatches(records);
  const visibleMatches = allMatches.filter(m => !isMatchDismissed(m.id));

  const handleDismissMatch = (matchId: string) => {
    dismissMatch(matchId);
    toast.success('Match dismissed');
    // Force re-render by updating state
    setSearchQuery(searchQuery);
  };

  return (
    <div className="space-y-6">
      <ReminderModal
        open={!!dueReminder}
        reminder={dueReminder}
        onDismiss={handleDismissReminder}
        onDelete={handleDeleteReminder}
      />

      <AddReminderDialog
        open={showAddReminder}
        onOpenChange={setShowAddReminder}
        onSubmit={handleAddReminder}
      />

      <div>
        <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
        <p className="text-muted-foreground">Welcome to Vivid Design Tech BTM</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link to="/new-entry">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="w-5 h-5" />
                New Entry
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Add customer or property</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/customers">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Customer List</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">View all customers</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/sold">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Sold</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">View sold properties</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/deal">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Deal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Manage deals</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reminders</CardTitle>
          <CardDescription>Manage your reminders</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={() => setShowAddReminder(true)} className="w-full sm:w-auto">
            <Bell className="w-4 h-4 mr-2" />
            Add Reminder
          </Button>

          {reminders.length > 0 && (
            <div className="space-y-2">
              {reminders.map(reminder => (
                <div key={reminder.id} className="p-3 border rounded-lg flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{reminder.note}</p>
                    <p className="text-sm text-muted-foreground">
                      {reminder.date} at {reminder.time}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteReminder.mutate(reminder.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {visibleMatches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Matches</CardTitle>
            <CardDescription>
              {visibleMatches.length} potential buyer-property match{visibleMatches.length !== 1 ? 'es' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {visibleMatches.map(match => (
              <div key={match.id} className="p-4 border rounded-lg bg-accent/50">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">Match Score: {match.matchScore}</Badge>
                      {match.matchReasons.map((reason, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{reason}</Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDismissMatch(match.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">BUYER</p>
                    <Link to="/record/$recordId" params={{ recordId: match.buyerId }}>
                      <div className="p-2 border rounded hover:bg-background transition-colors">
                        <p className="font-semibold text-sm">{match.buyerName}</p>
                        <p className="text-xs text-muted-foreground">{match.buyerContact}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {match.buyerCategory} • Budget: {match.buyerBudget}
                        </p>
                      </div>
                    </Link>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">PROPERTY</p>
                    <Link to="/record/$recordId" params={{ recordId: match.propertyId }}>
                      <div className="p-2 border rounded hover:bg-background transition-colors">
                        <p className="font-semibold text-sm">{match.propertyTitle}</p>
                        <p className="text-xs text-muted-foreground">Owner: {match.propertyOwner}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {match.propertyCategory} • Price: {match.propertyPrice}
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
          <CardDescription>Search all records</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map(record => (
                <Link key={record.id} to="/record/$recordId" params={{ recordId: record.id }}>
                  <div className="p-3 border rounded-lg hover:bg-accent transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">
                        {record.ownerName || record.fullName || record.name || record.title || 'Untitled'}
                      </span>
                      <Badge variant="outline" className="shrink-0">{record.category}</Badge>
                      {record.starred && (
                        <Star className="w-4 h-4 fill-amber-500 text-amber-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {record.contact} • {record.address || record.location || 'No location'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top 20 Buyers (Starred)</CardTitle>
            <CardDescription>{starredBuyers.length} starred buyers</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-4 text-muted-foreground">Loading...</p>
            ) : starredBuyers.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">No starred buyers yet</p>
            ) : (
              <div className="space-y-2">
                {starredBuyers.map(buyer => (
                  <div key={buyer.id} className="p-3 border rounded-lg hover:bg-accent transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <Link to="/record/$recordId" params={{ recordId: buyer.id }} className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate">
                            {buyer.fullName || buyer.name || 'Untitled'}
                          </span>
                          {buyer.priority && (
                            <Badge variant="outline" className="shrink-0 text-xs">{buyer.priority}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {buyer.contact}
                        </p>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStarred(buyer)}
                      >
                        <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 20 Sellers (Starred)</CardTitle>
            <CardDescription>{starredSellers.length} starred properties</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-4 text-muted-foreground">Loading...</p>
            ) : starredSellers.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">No starred properties yet</p>
            ) : (
              <div className="space-y-2">
                {starredSellers.map(seller => (
                  <div key={seller.id} className="p-3 border rounded-lg hover:bg-accent transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <Link to="/record/$recordId" params={{ recordId: seller.id }} className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate">
                            {seller.ownerName || seller.title || 'Untitled'}
                          </span>
                          <Badge variant="outline" className="shrink-0 text-xs">{seller.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {seller.contact}
                        </p>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStarred(seller)}
                      >
                        <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
