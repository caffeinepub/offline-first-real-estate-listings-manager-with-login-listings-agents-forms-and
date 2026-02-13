import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Maximize2, X } from 'lucide-react';

interface AttachmentPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string;
  fileUrl: string;
  fileType: string;
}

export default function AttachmentPreviewModal({
  open,
  onOpenChange,
  fileName,
  fileUrl,
  fileType
}: AttachmentPreviewModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.click();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const renderPreview = () => {
    if (fileType.startsWith('image/')) {
      return (
        <img
          src={fileUrl}
          alt={fileName}
          className="max-w-full max-h-full object-contain"
        />
      );
    } else if (fileType.startsWith('video/')) {
      return (
        <video
          src={fileUrl}
          controls
          className="max-w-full max-h-full"
        >
          Your browser does not support the video tag.
        </video>
      );
    } else if (fileType === 'application/pdf') {
      return (
        <iframe
          src={fileUrl}
          className="w-full h-full min-h-[500px]"
          title={fileName}
        />
      );
    } else {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">Preview not available for this file type</p>
          <Button onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download File
          </Button>
        </div>
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={isFullscreen ? 'max-w-[95vw] max-h-[95vh] w-full h-full' : 'max-w-4xl max-h-[90vh]'}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="truncate pr-4">{fileName}</DialogTitle>
            <div className="flex gap-2 shrink-0">
              <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
                <Maximize2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleDownload}>
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className={`flex items-center justify-center ${isFullscreen ? 'h-[calc(100%-4rem)]' : 'min-h-[400px]'} overflow-auto`}>
          {renderPreview()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
