import { useParams, useNavigate, Link } from '@tanstack/react-router';
import { useAgent, useDeleteAgent, useAttachment } from '../hooks/useLocalRepository';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AgentDetailsPage() {
  const { agentId } = useParams({ from: '/layout/agent/$agentId' });
  const navigate = useNavigate();
  const { data: agent, isLoading } = useAgent(agentId);
  const deleteAgent = useDeleteAgent();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this agent?')) return;
    
    try {
      await deleteAgent.mutateAsync(agentId);
      toast.success('Agent deleted successfully');
      navigate({ to: '/agents' });
    } catch (error) {
      toast.error('Failed to delete agent');
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!agent) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Agent not found</p>
        <Link to="/agents">
          <Button variant="outline">Back to Agent List</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Button variant="ghost" onClick={() => navigate({ to: '/agents' })} className="mb-4 gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Agent List
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{agent.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Added {new Date(agent.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Button variant="destructive" size="icon" onClick={handleDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Contact</p>
              <p className="text-base">{agent.contact}</p>
            </div>
            {agent.address && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Address</p>
                <p className="text-base">{agent.address}</p>
              </div>
            )}
            {agent.workArea && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Work Area</p>
                <p className="text-base">{agent.workArea}</p>
              </div>
            )}
          </div>

          {agent.citizenshipId && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Citizenship Document</p>
              <CitizenshipDownload citizenshipId={agent.citizenshipId} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CitizenshipDownload({ citizenshipId }: { citizenshipId: string }) {
  const { data: attachment } = useAttachment(citizenshipId);

  if (!attachment) return <p className="text-sm text-muted-foreground">No document uploaded</p>;

  const handleDownload = () => {
    const url = URL.createObjectURL(attachment.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = attachment.fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg max-w-md">
      <span className="text-sm truncate flex-1">{attachment.fileName}</span>
      <Button variant="ghost" size="sm" onClick={handleDownload} className="gap-2 shrink-0">
        <Download className="w-4 h-4" />
        Download
      </Button>
    </div>
  );
}
