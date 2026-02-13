import { useState } from 'react';
import { useRecords, useDeals, useSaveDeal, useDeleteDeal } from '../hooks/useLocalRepository';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function DealPage() {
  const { data: records = [] } = useRecords();
  const { data: deals = [], isLoading } = useDeals();
  const saveDeal = useSaveDeal();
  const deleteDealMutation = useDeleteDeal();

  const [formData, setFormData] = useState({
    propertyId: '',
    buyerId: '',
    status: 'Deal Open' as 'Deal Closed' | 'Deal Open',
    finalDealAmount: '',
    agreedDate: '',
    bainaAmount: '',
    passDate: '',
    agreedCommission: ''
  });

  const properties = records.filter(r => r.category !== 'Customer');
  const buyers = records.filter(r => r.category === 'Customer');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.propertyId || !formData.buyerId) {
      toast.error('Please select both property and buyer');
      return;
    }

    try {
      await saveDeal.mutateAsync({
        id: `deal-${Date.now()}`,
        ...formData,
        createdAt: Date.now()
      });
      setFormData({
        propertyId: '',
        buyerId: '',
        status: 'Deal Open',
        finalDealAmount: '',
        agreedDate: '',
        bainaAmount: '',
        passDate: '',
        agreedCommission: ''
      });
      toast.success('Deal saved successfully!');
    } catch (error) {
      toast.error('Failed to save deal');
    }
  };

  const handleDelete = async (dealId: string) => {
    try {
      await deleteDealMutation.mutateAsync(dealId);
      toast.success('Deal deleted successfully');
    } catch (error) {
      toast.error('Failed to delete deal');
    }
  };

  const getRecordName = (recordId: string) => {
    const record = records.find(r => r.id === recordId);
    if (!record) return 'Unknown';
    return record.ownerName || record.fullName || record.name || record.title || 'Untitled';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold flex items-center gap-2">
          <Briefcase className="w-8 h-8" />
          Deal Management
        </h2>
        <p className="text-muted-foreground">Create and manage property deals</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Deal</CardTitle>
          <CardDescription>Record a new property deal with buyer information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="propertyId">Property *</Label>
                <Select value={formData.propertyId} onValueChange={(value) => setFormData({ ...formData, propertyId: value })}>
                  <SelectTrigger id="propertyId">
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map(property => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.ownerName || property.title || property.name || 'Untitled'} ({property.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="buyerId">Buyer *</Label>
                <Select value={formData.buyerId} onValueChange={(value) => setFormData({ ...formData, buyerId: value })}>
                  <SelectTrigger id="buyerId">
                    <SelectValue placeholder="Select buyer" />
                  </SelectTrigger>
                  <SelectContent>
                    {buyers.map(buyer => (
                      <SelectItem key={buyer.id} value={buyer.id}>
                        {buyer.fullName || buyer.name || 'Untitled'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Deal Open">Deal Open</SelectItem>
                  <SelectItem value="Deal Closed">Deal Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="finalDealAmount">Final Deal Amount *</Label>
                <Input
                  id="finalDealAmount"
                  placeholder="e.g., 50 Lakhs"
                  value={formData.finalDealAmount}
                  onChange={(e) => setFormData({ ...formData, finalDealAmount: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agreedDate">Agreed Date *</Label>
                <Input
                  id="agreedDate"
                  type="date"
                  value={formData.agreedDate}
                  onChange={(e) => setFormData({ ...formData, agreedDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bainaAmount">Baina Amount *</Label>
                <Input
                  id="bainaAmount"
                  placeholder="e.g., 5 Lakhs"
                  value={formData.bainaAmount}
                  onChange={(e) => setFormData({ ...formData, bainaAmount: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passDate">Pass Date *</Label>
                <Input
                  id="passDate"
                  type="date"
                  value={formData.passDate}
                  onChange={(e) => setFormData({ ...formData, passDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="agreedCommission">Agreed Commission (Percentage/Amount) *</Label>
              <Input
                id="agreedCommission"
                placeholder="e.g., 2% or 1 Lakh"
                value={formData.agreedCommission}
                onChange={(e) => setFormData({ ...formData, agreedCommission: e.target.value })}
                required
              />
            </div>

            <Button type="submit" disabled={saveDeal.isPending} className="w-full">
              {saveDeal.isPending ? 'Saving...' : 'Save Deal'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saved Deals</CardTitle>
          <CardDescription>
            {deals.length} deal{deals.length !== 1 ? 's' : ''} recorded
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : deals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No deals yet</div>
          ) : (
            <div className="space-y-3">
              {deals.map(deal => (
                <div key={deal.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{getRecordName(deal.propertyId)}</h3>
                        <Badge variant={deal.status === 'Deal Closed' ? 'default' : 'outline'}>
                          {deal.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Buyer: {getRecordName(deal.buyerId)}
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Deal</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this deal? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(deal.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Final Amount:</span>{' '}
                      <span className="font-medium">{deal.finalDealAmount}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Agreed Date:</span>{' '}
                      <span className="font-medium">{deal.agreedDate}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Baina Amount:</span>{' '}
                      <span className="font-medium">{deal.bainaAmount}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Pass Date:</span>{' '}
                      <span className="font-medium">{deal.passDate}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-muted-foreground">Commission:</span>{' '}
                      <span className="font-medium">{deal.agreedCommission}</span>
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
