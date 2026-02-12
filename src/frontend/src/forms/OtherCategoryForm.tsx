import { useState } from 'react';
import { useSaveRecord, useSaveAttachment } from '../hooks/useLocalRepository';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AttachmentPicker from '../components/AttachmentPicker';
import { toast } from 'sonner';

interface OtherCategoryFormProps {
  category: string;
  onSuccess: () => void;
}

export default function OtherCategoryForm({ category, onSuccess }: OtherCategoryFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    contact: '',
    location: '',
    price: '',
    notes: ''
  });
  const [attachments, setAttachments] = useState<Array<{ id: string; fileName: string; file: File }>>([]);

  const saveRecord = useSaveRecord();
  const saveAttachment = useSaveAttachment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const recordId = `${category.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    
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
        ...formData,
        attachmentIds,
        createdAt: Date.now()
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
        <CardTitle>{category}</CardTitle>
        <CardDescription>Add {category.toLowerCase()} property details</CardDescription>
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
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <AttachmentPicker attachments={attachments} onChange={setAttachments} />

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={saveRecord.isPending} className="flex-1">
              {saveRecord.isPending ? 'Saving...' : `Save ${category}`}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
