import { useState, useEffect } from 'react';
import { useSaveRecord } from '../hooks/useLocalRepository';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { CUSTOMER_CATEGORIES, mapNeedToCategory } from '../utils/customerCategory';

interface CustomerFormProps {
  onSuccess: () => void;
  initialData?: any;
}

export default function CustomerForm({ onSuccess, initialData }: CustomerFormProps) {
  const [priority, setPriority] = useState<string>(initialData?.priority || 'Less Priority');
  
  // Determine initial category: use stored customerCategory, or fallback to mapping from need
  const initialCategory = initialData?.customerCategory || 
    (initialData?.need ? mapNeedToCategory(initialData.need) : undefined) || 
    'Land';
  
  const [customerCategory, setCustomerCategory] = useState<string>(initialCategory);
  
  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || '',
    address: initialData?.address || '',
    contact: initialData?.contact || '',
    budget: initialData?.budget || '',
    area: initialData?.area || '',
    customRequirements: initialData?.customRequirements || ''
  });

  const saveRecord = useSaveRecord();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const record = {
      id: initialData?.id || `customer-${Date.now()}`,
      category: 'Customer',
      priority,
      customerCategory,
      ...formData,
      starred: initialData?.starred || false,
      createdAt: initialData?.createdAt || Date.now()
    };

    try {
      await saveRecord.mutateAsync(record);
      toast.success('Customer record saved successfully!');
      onSuccess();
    } catch (error) {
      toast.error('Failed to save customer record');
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer / Buyer Information</CardTitle>
        <CardDescription>Add customer or buyer details</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact">Contact *</Label>
              <Input
                id="contact"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority *</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Confirm Buyer">Confirm Buyer</SelectItem>
                <SelectItem value="Less Priority">Less Priority</SelectItem>
                <SelectItem value="Hawa">Hawa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerCategory">Category *</Label>
              <Select value={customerCategory} onValueChange={setCustomerCategory}>
                <SelectTrigger id="customerCategory">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CUSTOMER_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Budget</Label>
              <Input
                id="budget"
                placeholder="e.g., 50 Lakhs"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="area">Area</Label>
            <Input
              id="area"
              placeholder="e.g., 1200 sq ft"
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customRequirements">Custom Requirements / Notes</Label>
            <Textarea
              id="customRequirements"
              rows={4}
              value={formData.customRequirements}
              onChange={(e) => setFormData({ ...formData, customRequirements: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={saveRecord.isPending} className="flex-1">
              {saveRecord.isPending ? 'Saving...' : initialData ? 'Update Customer' : 'Save Customer'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
