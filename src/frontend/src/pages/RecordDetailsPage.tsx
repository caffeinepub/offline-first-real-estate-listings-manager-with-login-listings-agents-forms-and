import { useState } from 'react';
import { useParams, useNavigate, Link } from '@tanstack/react-router';
import { useRecord, useDeleteRecord, useAttachment, useSaveRecord, useRecords } from '../hooks/useLocalRepository';
import { getAttachment } from '../storage/localDb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, ExternalLink, Trash2, Star, Edit, Eye } from 'lucide-react';
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
import AttachmentPreviewModal from '../components/AttachmentPreviewModal';
import CustomerForm from '../forms/CustomerForm';
import CommercialLandForm from '../forms/CommercialLandForm';
import HouseForm from '../forms/HouseForm';
import OtherCategoryForm from '../forms/OtherCategoryForm';
import { getDisplayCategory, mapCustomerCategoryToPropertyType } from '../utils/customerCategory';

export default function RecordDetailsPage() {
  const { recordId } = useParams({ from: '/layout/record/$recordId' });
  const navigate = useNavigate();
  const { data: record, isLoading } = useRecord(recordId);
  const { data: allRecords = [] } = useRecords();
  const deleteRecord = useDeleteRecord();
  const saveRecord = useSaveRecord();
  const [isEditing, setIsEditing] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<{ fileName: string; fileUrl: string; fileType: string } | null>(null);

  const toggleStarred = async () => {
    if (!record) return;
    try {
      await saveRecord.mutateAsync({
        ...record,
        starred: !record.starred
      });
      toast.success(record.starred ? 'Removed from starred' : 'Added to starred');
    } catch (error) {
      toast.error('Failed to update starred status');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteRecord.mutateAsync(recordId);
      toast.success('Record deleted successfully');
      navigate({ to: '/' });
    } catch (error) {
      toast.error('Failed to delete record');
    }
  };

  const handlePreview = async (attachmentId: string, fileName: string) => {
    try {
      const attachment = await getAttachment(attachmentId);
      if (attachment) {
        const fileUrl = URL.createObjectURL(attachment.blob);
        setPreviewAttachment({
          fileName,
          fileUrl,
          fileType: attachment.blob.type
        });
      }
    } catch (error) {
      toast.error('Failed to load attachment');
    }
  };

  const handleDownload = async (attachmentId: string, fileName: string) => {
    try {
      const attachment = await getAttachment(attachmentId);
      if (attachment) {
        const url = URL.createObjectURL(attachment.blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      toast.error('Failed to download attachment');
    }
  };

  // Compute matching properties for Customer records
  const matchingProperties = record?.category === 'Customer' 
    ? (() => {
        const customerCategory = record.customerCategory || (record.need ? getDisplayCategory(record) : undefined);
        const matchingTypes = mapCustomerCategoryToPropertyType(customerCategory as any);
        
        return allRecords.filter(r => {
          // Exclude customers and sold properties
          if (r.category === 'Customer') return false;
          if (r.status === 'Sold') return false;
          
          // Match by category
          return matchingTypes.includes(r.category);
        });
      })()
    : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Record not found</p>
        <Link to="/">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  if (isEditing) {
    const handleEditSuccess = () => {
      setIsEditing(false);
      toast.success('Record updated successfully');
    };

    if (record.category === 'Customer') {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => setIsEditing(false)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-2xl font-bold">Edit Customer</h2>
          </div>
          <CustomerForm onSuccess={handleEditSuccess} initialData={record} />
        </div>
      );
    } else if (record.category === 'Commercial Land') {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => setIsEditing(false)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-2xl font-bold">Edit Commercial Land</h2>
          </div>
          <CommercialLandForm onSuccess={handleEditSuccess} initialData={record} />
        </div>
      );
    } else if (record.category === 'House') {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => setIsEditing(false)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-2xl font-bold">Edit House</h2>
          </div>
          <HouseForm onSuccess={handleEditSuccess} initialData={record} />
        </div>
      );
    } else {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => setIsEditing(false)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-2xl font-bold">Edit {record.category}</h2>
          </div>
          <OtherCategoryForm category={record.category} onSuccess={handleEditSuccess} initialData={record} />
        </div>
      );
    }
  }

  const displayName = record.ownerName || record.fullName || record.name || record.title || 'Untitled Record';

  return (
    <div className="space-y-6">
      <AttachmentPreviewModal
        open={!!previewAttachment}
        onOpenChange={(open) => !open && setPreviewAttachment(null)}
        fileName={previewAttachment?.fileName || ''}
        fileUrl={previewAttachment?.fileUrl || ''}
        fileType={previewAttachment?.fileType || ''}
      />

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold">{displayName}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge>{record.category}</Badge>
              {record.status && (
                <Badge 
                  variant="outline"
                  className={record.status === 'Sold' ? 'border-red-500 text-red-600' : 'border-green-500 text-green-600'}
                >
                  {record.status}
                </Badge>
              )}
              {record.starred && (
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={toggleStarred}>
            <Star className={`w-4 h-4 ${record.starred ? 'fill-amber-500 text-amber-500' : ''}`} />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setIsEditing(true)}>
            <Edit className="w-4 h-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Record</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this record? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {record.category === 'Customer' ? (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{record.fullName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contact</p>
                  <p className="font-medium">{record.contact || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{record.address || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{getDisplayCategory(record)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="font-medium">{record.budget || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Area</p>
                  <p className="font-medium">{record.area || 'N/A'}</p>
                </div>
                {record.priority && (
                  <div>
                    <p className="text-sm text-muted-foreground">Priority</p>
                    <Badge variant="outline">{record.priority}</Badge>
                  </div>
                )}
                {record.customRequirements && (
                  <div>
                    <p className="text-sm text-muted-foreground">Custom Requirements</p>
                    <p className="font-medium whitespace-pre-wrap">{record.customRequirements}</p>
                  </div>
                )}
              </>
            ) : record.category === 'Commercial Land' ? (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Owner Name</p>
                  <p className="font-medium">{record.ownerName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contact</p>
                  <p className="font-medium">{record.contact || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{record.address || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Land Area</p>
                  <p className="font-medium">{record.landArea || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-medium">{record.price || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Facing</p>
                  <p className="font-medium">{record.facing || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Road Info</p>
                  <p className="font-medium">{record.roadInfo || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nagarpalika</p>
                  <p className="font-medium">{record.nagarpalika || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mukh Size</p>
                  <p className="font-medium">{record.mukhSize || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lambai</p>
                  <p className="font-medium">{record.lambai || 'N/A'}</p>
                </div>
                {record.locationUrl && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Location</p>
                    <a 
                      href={record.locationUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      View on Map <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                {record.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="font-medium whitespace-pre-wrap">{record.notes}</p>
                  </div>
                )}
              </>
            ) : record.category === 'House' ? (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Owner Name</p>
                  <p className="font-medium">{record.ownerName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contact</p>
                  <p className="font-medium">{record.contact || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{record.location || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Built Year</p>
                  <p className="font-medium">{record.builtYear || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Floor</p>
                  <p className="font-medium">{record.totalFloor || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rooms</p>
                  <p className="font-medium">{record.rooms || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Land Area</p>
                  <p className="font-medium">{record.totalLandArea || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Naksa Pass</p>
                  <p className="font-medium">{record.naksaPass || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-medium">{record.price || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Facing</p>
                  <p className="font-medium">{record.facing || 'N/A'}</p>
                </div>
                {record.locationUrl && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Location</p>
                    <a 
                      href={record.locationUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      View on Map <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                {record.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="font-medium whitespace-pre-wrap">{record.notes}</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Title</p>
                  <p className="font-medium">{record.title || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contact</p>
                  <p className="font-medium">{record.contact || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{record.location || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-medium">{record.price || 'N/A'}</p>
                </div>
                {record.locationUrl && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Location</p>
                    <a 
                      href={record.locationUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      View on Map <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                {record.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="font-medium whitespace-pre-wrap">{record.notes}</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {record.attachments && record.attachments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Attachments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {record.attachments.map((att: any) => (
                  <div key={att.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm truncate flex-1">{att.fileName}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreview(att.id, att.fileName)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(att.id, att.fileName)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {record.category === 'Customer' && matchingProperties.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Matching Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {matchingProperties.map(property => (
                <Link 
                  key={property.id} 
                  to="/record/$recordId" 
                  params={{ recordId: property.id }}
                  className="block p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">
                          {property.ownerName || property.title || 'Untitled'}
                        </h3>
                        <Badge variant="outline">{property.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {property.contact} • {property.address || property.location || 'No location'}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Price: {property.price || 'N/A'}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
