import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useRecords } from '../hooks/useLocalRepository';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Eye, DollarSign } from 'lucide-react';

export default function SoldListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: records = [], isLoading } = useRecords();

  const soldProperties = records.filter(r => r.category !== 'Customer' && r.status === 'Sold');

  const filteredSold = searchQuery.trim()
    ? soldProperties.filter(p => {
        const query = searchQuery.toLowerCase();
        return (
          (p.ownerName && p.ownerName.toLowerCase().includes(query)) ||
          (p.title && p.title.toLowerCase().includes(query)) ||
          (p.contact && p.contact.toLowerCase().includes(query)) ||
          (p.address && p.address.toLowerCase().includes(query)) ||
          (p.location && p.location.toLowerCase().includes(query))
        );
      })
    : soldProperties;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold flex items-center gap-2">
          <DollarSign className="w-8 h-8" />
          Sold Properties
        </h2>
        <p className="text-muted-foreground">All properties marked as sold</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sold Properties</CardTitle>
          <CardDescription>
            {filteredSold.length} sold propert{filteredSold.length !== 1 ? 'ies' : 'y'} found
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search sold properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredSold.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'No matching sold properties found' : 'No sold properties yet'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredSold.map(property => (
                <Link key={property.id} to="/record/$recordId" params={{ recordId: property.id }}>
                  <div className="p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">
                            {property.ownerName || property.title || property.name || 'Untitled'}
                          </h3>
                          <Badge variant="outline" className="shrink-0">{property.category}</Badge>
                          <Badge variant="outline" className="border-red-500 text-red-600 shrink-0">
                            Sold
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {property.contact} • {property.address || property.location || 'No location'}
                        </p>
                        {property.price && (
                          <p className="text-sm font-medium text-amber-600 dark:text-amber-500 mt-1">
                            Final Price: {property.price}
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
    </div>
  );
}
