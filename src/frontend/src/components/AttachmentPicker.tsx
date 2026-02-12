import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, File } from 'lucide-react';

interface Attachment {
  id: string;
  fileName: string;
  file: File;
}

interface AttachmentPickerProps {
  attachments: Attachment[];
  onChange: (attachments: Attachment[]) => void;
}

export default function AttachmentPicker({ attachments, onChange }: AttachmentPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newAttachments = files.map(file => ({
      id: `att-${Date.now()}-${Math.random()}`,
      fileName: file.name,
      file
    }));
    onChange([...attachments, ...newAttachments]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = (id: string) => {
    onChange(attachments.filter(att => att.id !== id));
  };

  const handleRename = (id: string, newName: string) => {
    onChange(attachments.map(att => att.id === id ? { ...att, fileName: newName } : att));
  };

  return (
    <div className="space-y-3">
      <Label>Attachments (Images, Videos, Documents)</Label>
      
      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        className="w-full gap-2"
      >
        <Upload className="w-4 h-4" />
        Add Files
      </Button>
      
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*,video/*,.pdf,.doc,.docx"
      />

      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map(att => (
            <div key={att.id} className="flex items-center gap-2 p-2 border rounded-lg">
              <File className="w-4 h-4 text-muted-foreground shrink-0" />
              <Input
                value={att.fileName}
                onChange={(e) => handleRename(att.id, e.target.value)}
                className="flex-1 h-8"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(att.id)}
                className="shrink-0 h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
