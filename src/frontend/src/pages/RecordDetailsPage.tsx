import { useParams, useNavigate, Link } from '@tanstack/react-router';
import { useRecord, useDeleteRecord } from '../hooks/useLocalRepository';
import { useAttachment } from '../hooks/useLocalRepository';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, ExternalLink, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function RecordDetailsPage() {
  const { recordId } = useParams({ from: '/layout/record/$recordId' });
  const navigate = useNavigate();
  const { data: record, isLoading } = useRecord(recordId);
  const deleteRecord = useDeleteRecord();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    
    try {
      await deleteRecord.mutateAsync(recordId);
      toast.success('Record deleted successfully');
      navigate({ to: '/' });
    } catch (error) {
      toast.error('Failed to delete record');
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!record) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Record not found</p>
        <Link to="/">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Button variant="ghost" onClick={() => navigate({ to: '/' })} className="mb-4 gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-2xl">
                  {record.ownerName || record.fullName || record.name || record.title || 'Untitled'}
                </CardTitle>
                <Badge>{record.category}</Badge>
                {record.status && (
                  <Badge 
                    variant="outline"
                    className={record.status === 'Sold' ? 'border-red-500 text-red-600' : 'border-green-500 text-green-600'}
                  >
                    {record.status}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Created {new Date(record.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Button variant="destructive" size="icon" onClick={handleDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            {record.contact && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Contact</p>
                <p className="text-base">{record.contact}</p>
              </div>
            )}
            {(record.address || record.location) && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Location</p>
                <p className="text-base">{record.address || record.location}</p>
              </div>
            )}
            {record.price && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Price</p>
                <p className="text-base font-semibold text-amber-600 dark:text-amber-500">{record.price}</p>
              </div>
            )}
            {record.budget && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Budget</p>
                <p className="text-base">{record.budget}</p>
              </div>
            )}
            {record.need && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Need</p>
                <p className="text-base">{record.need}</p>
              </div>
            )}
            {record.area && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Area</p>
                <p className="text-base">{record.area}</p>
              </div>
            )}
            {record.landArea && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Land Area</p>
                <p className="text-base">{record.landArea}</p>
              </div>
            )}
            {record.facing && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Facing</p>
                <p className="text-base">{record.facing}</p>
              </div>
            )}
            {record.roadInfo && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Road</p>
                <p className="text-base">{record.roadInfo}</p>
              </div>
            )}
            {record.mukhSize && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mukh Size</p>
                <p className="text-base">{record.mukhSize}</p>
              </div>
            )}
            {record.lambai && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lambai</p>
                <p className="text-base">{record.lambai}</p>
              </div>
            )}
            {record.nagarpalika && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nagarpalika</p>
                <p className="text-base">{record.nagarpalika}</p>
              </div>
            )}
            {record.builtYear && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Built Year</p>
                <p className="text-base">{record.builtYear}</p>
              </div>
            )}
            {record.totalFloor && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Floor</p>
                <p className="text-base">{record.totalFloor}</p>
              </div>
            )}
            {record.rooms && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rooms</p>
                <p className="text-base">{record.rooms}</p>
              </div>
            )}
            {record.totalLandArea && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Land Area</p>
                <p className="text-base">{record.totalLandArea}</p>
              </div>
            )}
            {record.naksaPass && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Naksa Pass</p>
                <p className="text-base">{record.naksaPass}</p>
              </div>
            )}
          </div>

          {(record.notes || record.customRequirements) && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Notes</p>
              <p className="text-base whitespace-pre-wrap">{record.notes || record.customRequirements}</p>
            </div>
          )}

          {record.locationUrl && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Location Map</p>
              <a
                href={record.locationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400"
              >
                Open in Google Maps
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}

          {record.attachmentIds && record.attachmentIds.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Attachments</p>
              <div className="space-y-2">
                {record.attachmentIds.map((attId: string) => (
                  <AttachmentItem key={attId} attachmentId={attId} />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AttachmentItem({ attachmentId }: { attachmentId: string }) {
  const { data: attachment } = useAttachment(attachmentId);

  if (!attachment) return null;

  const handleDownload = () => {
    const url = URL.createObjectURL(attachment.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = attachment.fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <span className="text-sm truncate flex-1">{attachment.fileName}</span>
      <Button variant="ghost" size="sm" onClick={handleDownload} className="gap-2 shrink-0">
        <Download className="w-4 h-4" />
        Download
      </Button>
    </div>
  );
}
