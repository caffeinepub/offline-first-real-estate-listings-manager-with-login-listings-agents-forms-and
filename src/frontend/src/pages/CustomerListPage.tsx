import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useRecords, useSaveRecord } from '../hooks/useLocalRepository';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Star, Search, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { getDisplayCategory } from '../utils/customerCategory';

export default function CustomerListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: records = [], isLoading } = useRecords();
  const saveRecord = useSaveRecord();

  const customers = records.filter(r => r.category === 'Customer');

  const filteredCustomers = searchQuery.trim()
    ? customers.filter(c => {
        const query = searchQuery.toLowerCase();
        return (
          (c.fullName && c.fullName.toLowerCase().includes(query)) ||
          (c.name && c.name.toLowerCase().includes(query)) ||
          (c.contact && c.contact.toLowerCase().includes(query)) ||
          (c.address && c.address.toLowerCase().includes(query))
        );
      })
    : customers;

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Customer List</h2>
        <p className="text-muted-foreground">All customer and buyer records</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customers</CardTitle>
          <CardDescription>
            {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'No matching customers found' : 'No customers yet'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredCustomers.map(customer => (
                <div key={customer.id} className="p-4 border rounded-lg hover:bg-accent transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <Link to="/record/$recordId" params={{ recordId: customer.id }} className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">
                          {customer.fullName || customer.name || 'Untitled'}
                        </h3>
                        {customer.starred && (
                          <Star className="w-4 h-4 fill-amber-500 text-amber-500 shrink-0" />
                        )}
                        {customer.priority && (
                          <Badge variant="outline" className="shrink-0">{customer.priority}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {customer.contact} • {customer.address || 'No address'}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Category: {getDisplayCategory(customer)} • Budget: {customer.budget || 'N/A'}
                      </p>
                    </Link>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStarred(customer)}
                      >
                        <Star className={`w-4 h-4 ${customer.starred ? 'fill-amber-500 text-amber-500' : ''}`} />
                      </Button>
                      <Link to="/record/$recordId" params={{ recordId: customer.id }}>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
