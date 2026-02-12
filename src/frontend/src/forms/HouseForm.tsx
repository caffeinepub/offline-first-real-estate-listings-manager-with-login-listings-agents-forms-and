import { useState } from 'react';
import { useSaveRecord, useSaveAttachment } from '../hooks/useLocalRepository';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AttachmentPicker from '../components/AttachmentPicker';
import { toast } from 'sonner';

interface HouseFormProps {
  onSuccess: () => void;
}

export default function HouseForm({ onSuccess }: HouseFormProps) {
  const [formData, setFormData] = useState({
    ownerName: '',
    contact: '',
    location: '',
    builtYear: '',
    totalFloor: '',
    rooms: '',
    totalLandArea: '',
    naksaPass: '',
    price: '',
    facing: '',
    notes: ''
  });
  const [attachments, setAttachments] = useState<Array<{ id: string; fileName: string; file: File }>>([]);

  const saveRecord = useSaveRecord();
  const saveAttachment = useSaveAttachment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const recordId = `house-${Date.now()}`;
    
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
        category: 'House',
        ...formData,
        attachmentIds,
        createdAt: Date.now()
      };

      await saveRecord.mutateAsync(record);
      toast.success('House record saved successfully!');
      onSuccess();
    } catch (error) {
      toast.error('Failed to save house record');
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>House</CardTitle>
        <CardDescription>Add residential house details</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ownerName">Owner Name *</Label>
              <Input
                id="ownerName"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
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
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="builtYear">Built Year</Label>
              <Input
                id="builtYear"
                placeholder="e.g., 2020"
                value={formData.builtYear}
                onChange={(e) => setFormData({ ...formData, builtYear: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalFloor">Total Floor</Label>
              <Input
                id="totalFloor"
                placeholder="e.g., 3"
                value={formData.totalFloor}
                onChange={(e) => setFormData({ ...formData, totalFloor: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rooms">Rooms</Label>
              <Input
                id="rooms"
                placeholder="e.g., 4BHK"
                value={formData.rooms}
                onChange={(e) => setFormData({ ...formData, rooms: e.target.value })}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalLandArea">Total Land Area</Label>
              <Input
                id="totalLandArea"
                placeholder="e.g., 2000 sq ft"
                value={formData.totalLandArea}
                onChange={(e) => setFormData({ ...formData, totalLandArea: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="naksaPass">Naksa Pass</Label>
              <Input
                id="naksaPass"
                placeholder="e.g., Yes/No"
                value={formData.naksaPass}
                onChange={(e) => setFormData({ ...formData, naksaPass: e.target.value })}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                placeholder="e.g., 75 Lakhs"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facing">Facing</Label>
              <Input
                id="facing"
                placeholder="e.g., East"
                value={formData.facing}
                onChange={(e) => setFormData({ ...formData, facing: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <AttachmentPicker attachments={attachments} onChange={setAttachments} />

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={saveRecord.isPending} className="flex-1">
              {saveRecord.isPending ? 'Saving...' : 'Save House'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
