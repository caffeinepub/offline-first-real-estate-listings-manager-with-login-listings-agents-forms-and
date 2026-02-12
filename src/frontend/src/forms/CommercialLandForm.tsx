import { useState } from 'react';
import { useSaveRecord, useSaveAttachment } from '../hooks/useLocalRepository';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AttachmentPicker from '../components/AttachmentPicker';
import { toast } from 'sonner';

interface CommercialLandFormProps {
  onSuccess: () => void;
}

export default function CommercialLandForm({ onSuccess }: CommercialLandFormProps) {
  const [formData, setFormData] = useState({
    ownerName: '',
    contact: '',
    address: '',
    landArea: '',
    price: '',
    facing: '',
    roadInfo: '',
    mukhSize: '',
    lambai: '',
    nagarpalika: '',
    notes: '',
    locationUrl: ''
  });
  const [attachments, setAttachments] = useState<Array<{ id: string; fileName: string; file: File }>>([]);

  const saveRecord = useSaveRecord();
  const saveAttachment = useSaveAttachment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const recordId = `commercial-${Date.now()}`;
    
    try {
      // Save attachments
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
        category: 'Commercial Land',
        propertyType: 'Commercial Land',
        ...formData,
        attachmentIds,
        createdAt: Date.now()
      };

      await saveRecord.mutateAsync(record);
      toast.success('Commercial land record saved successfully!');
      onSuccess();
    } catch (error) {
      toast.error('Failed to save commercial land record');
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Commercial Land</CardTitle>
        <CardDescription>Add commercial land property details</CardDescription>
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
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="landArea">Land Area</Label>
              <Input
                id="landArea"
                placeholder="e.g., 5000 sq ft"
                value={formData.landArea}
                onChange={(e) => setFormData({ ...formData, landArea: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Negotiable Price</Label>
              <Input
                id="price"
                placeholder="e.g., 1 Crore"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="facing">Facing</Label>
              <Input
                id="facing"
                placeholder="e.g., North"
                value={formData.facing}
                onChange={(e) => setFormData({ ...formData, facing: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roadInfo">Road</Label>
              <Input
                id="roadInfo"
                placeholder="e.g., 20 feet"
                value={formData.roadInfo}
                onChange={(e) => setFormData({ ...formData, roadInfo: e.target.value })}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mukhSize">Mukh Size</Label>
              <Input
                id="mukhSize"
                value={formData.mukhSize}
                onChange={(e) => setFormData({ ...formData, mukhSize: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lambai">Lambai</Label>
              <Input
                id="lambai"
                value={formData.lambai}
                onChange={(e) => setFormData({ ...formData, lambai: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nagarpalika">Nagarpalika</Label>
              <Input
                id="nagarpalika"
                value={formData.nagarpalika}
                onChange={(e) => setFormData({ ...formData, nagarpalika: e.target.value })}
              />
            </div>
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
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <AttachmentPicker attachments={attachments} onChange={setAttachments} />

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={saveRecord.isPending} className="flex-1">
              {saveRecord.isPending ? 'Saving...' : 'Save Commercial Land'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
