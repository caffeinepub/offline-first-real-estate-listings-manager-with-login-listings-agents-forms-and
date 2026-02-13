import { useState } from 'react';
import { useSaveRecord, useSaveAttachment } from '../hooks/useLocalRepository';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AttachmentPicker from '../components/AttachmentPicker';
import { toast } from 'sonner';

interface OtherCategoryFormProps {
  category: string;
  onSuccess: () => void;
  initialData?: any;
}

export default function OtherCategoryForm({ category, onSuccess, initialData }: OtherCategoryFormProps) {
  const [status, setStatus] = useState<string>(initialData?.status || 'Available');
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    contact: initialData?.contact || '',
    location: initialData?.location || '',
    price: initialData?.price || '',
    notes: initialData?.notes || '',
    locationUrl: initialData?.locationUrl || ''
  });
  const [attachments, setAttachments] = useState<Array<{ id: string; fileName: string; file: File }>>([]);

  const saveRecord = useSaveRecord();
  const saveAttachment = useSaveAttachment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const recordId = initialData?.id || `${category.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    
    try {
      const attachmentIds = await Promise.all(
        attachments.map(async (att) => {
          const blob = new Blob([await att.file.arrayBuffer()], { type: att.file.type });
          await saveAttachment.mutateAsync({
            id: att.id,
            fileName: att.fileName,
            blob,
            recordId
          });
          return att.id;
        })
      );

      const record = {
        id: recordId,
        category,
        status,
        ...formData,
        attachmentIds: initialData?.attachmentIds 
          ? [...initialData.attachmentIds, ...attachmentIds]
          : attachmentIds,
        starred: initialData?.starred || false,
        createdAt: initialData?.createdAt || Date.now()
      };

      await saveRecord.mutateAsync(record);
      toast.success(`${category} record saved successfully!`);
      onSuccess();
    } catch (error) {
      toast.error(`Failed to save ${category} record`);
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{category}</CardTitle>
            <CardDescription>Add {category.toLowerCase()} property details</CardDescription>
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="Sold">Sold</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title / Name *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
            <Label htmlFor="location">Location / Address</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price / Budget</Label>
            <Input
              id="price"
              placeholder="e.g., 50 Lakhs"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="locationUrl">Location Map Link</Label>
            <Input
              id="locationUrl"
              type="url"
              placeholder="https://maps.google.com/..."
              value={formData.locationUrl}
              onChange={(e) => setFormData({ ...formData, locationUrl: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          {!initialData && <AttachmentPicker attachments={attachments} onChange={setAttachments} />}

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={saveRecord.isPending} className="flex-1">
              {saveRecord.isPending ? 'Saving...' : initialData ? `Update ${category}` : `Save ${category}`}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
