import { useState } from 'react';
import { useSaveRecord } from '../hooks/useLocalRepository';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface CustomerFormProps {
  onSuccess: () => void;
}

export default function CustomerForm({ onSuccess }: CustomerFormProps) {
  const [status, setStatus] = useState<'Available' | 'Sold'>('Available');
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    contact: '',
    need: '',
    budget: '',
    area: '',
    customRequirements: ''
  });

  const saveRecord = useSaveRecord();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const record = {
      id: `customer-${Date.now()}`,
      category: 'Customer',
      status,
      ...formData,
      createdAt: Date.now()
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

  const bgColor = status === 'Sold' ? 'bg-red-50 dark:bg-red-950/20' : 'bg-green-50 dark:bg-green-950/20';
  const borderColor = status === 'Sold' ? 'border-red-200 dark:border-red-800' : 'border-green-200 dark:border-green-800';

  return (
    <Card className={`${bgColor} ${borderColor}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Customer / Buyer Information</CardTitle>
            <CardDescription>Add customer or buyer details</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={status === 'Available' ? 'default' : 'outline'}
              onClick={() => setStatus('Available')}
              className={status === 'Available' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              Available
            </Button>
            <Button
              type="button"
              variant={status === 'Sold' ? 'default' : 'outline'}
              onClick={() => setStatus('Sold')}
              className={status === 'Sold' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              Sold
            </Button>
          </div>
        </div>
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

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="need">Need</Label>
              <Input
                id="need"
                placeholder="e.g., 2BHK Flat"
                value={formData.need}
                onChange={(e) => setFormData({ ...formData, need: e.target.value })}
              />
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
              {saveRecord.isPending ? 'Saving...' : 'Save Customer'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
