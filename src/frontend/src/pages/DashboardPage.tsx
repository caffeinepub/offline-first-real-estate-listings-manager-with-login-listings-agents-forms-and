import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useRecords } from '../hooks/useLocalRepository';
import { searchRecords } from '../features/search/searchIndex';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Users, Eye } from 'lucide-react';

const PROPERTY_TYPES = [
  'All',
  'Commercial Land',
  'House',
  'Agriculture Land',
  'Flat',
  'Shops',
  'Rental',
  'Custom'
];

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const { data: records = [], isLoading } = useRecords();

  const filteredRecords = searchRecords(records, searchQuery).filter(
    record => selectedType === 'All' || record.category === selectedType
  );

  const buyers = records.filter(r => r.category === 'Customer' && r.need).slice(0, 20);
  const sellers = records.filter(r => r.category !== 'Customer' || !r.need).slice(0, 20);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">Manage your property listings</p>
        </div>
        <div className="flex gap-2">
          <Link to="/new-entry">
            <Button className="gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700">
              <Plus className="w-4 h-4" />
              New Entry
            </Button>
          </Link>
          <Link to="/agents">
            <Button variant="outline" className="gap-2">
              <Users className="w-4 h-4" />
              Agent List
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Properties</CardTitle>
          <CardDescription>Find properties by name, contact, address, or type</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_TYPES.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery || selectedType !== 'All' ? 'No matching properties found' : 'No properties yet. Create your first entry!'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredRecords.map(record => (
                <Link key={record.id} to="/record/$recordId" params={{ recordId: record.id }}>
                  <div className="p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">
                            {record.ownerName || record.fullName || record.name || record.title || 'Untitled'}
                          </h3>
                          <Badge variant="outline" className="shrink-0">{record.category}</Badge>
                          {record.status && (
                            <Badge 
                              variant="outline" 
                              className={record.status === 'Sold' ? 'border-red-500 text-red-600' : 'border-green-500 text-green-600'}
                            >
                              {record.status}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {record.contact} • {record.address || record.location || 'No location'}
                        </p>
                        {record.price && (
                          <p className="text-sm font-medium text-amber-600 dark:text-amber-500 mt-1">
                            {record.price}
                          </p>
                        )}
                      </div>
                      <Eye className="w-5 h-5 text-muted-foreground shrink-0" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top 20 Buyers</CardTitle>
            <CardDescription>Priority buyer contacts</CardDescription>
          </CardHeader>
          <CardContent>
            {buyers.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">No buyers yet</p>
            ) : (
              <div className="space-y-2">
                {buyers.map(buyer => (
                  <Link key={buyer.id} to="/record/$recordId" params={{ recordId: buyer.id }}>
                    <div className="p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{buyer.fullName || buyer.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {buyer.need || 'N/A'} • {buyer.budget || 'N/A'}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" className="shrink-0">
                          View
                        </Button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 20 Sellers</CardTitle>
            <CardDescription>Priority seller properties</CardDescription>
          </CardHeader>
          <CardContent>
            {sellers.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">No sellers yet</p>
            ) : (
              <div className="space-y-2">
                {sellers.map(seller => (
                  <Link key={seller.id} to="/record/$recordId" params={{ recordId: seller.id }}>
                    <div className="p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {seller.ownerName || seller.title || seller.name}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {seller.category} • {seller.price || 'N/A'}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" className="shrink-0">
                          View
                        </Button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
