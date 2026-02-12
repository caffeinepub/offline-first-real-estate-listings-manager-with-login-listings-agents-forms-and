import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useAgents, useSaveAgent, useSaveAttachment } from '../hooks/useLocalRepository';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function AgentListPage() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contact: '',
    workArea: ''
  });
  const [citizenshipFile, setCitizenshipFile] = useState<File | null>(null);

  const { data: agents = [], isLoading } = useAgents();
  const saveAgent = useSaveAgent();
  const saveAttachment = useSaveAttachment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const agentId = `agent-${Date.now()}`;
    
    try {
      let citizenshipId = '';
      if (citizenshipFile) {
        citizenshipId = `citizenship-${Date.now()}`;
        const blob = new Blob([await citizenshipFile.arrayBuffer()], { type: citizenshipFile.type });
        await saveAttachment.mutateAsync({
          id: citizenshipId,
          fileName: citizenshipFile.name,
          blob,
          recordId: agentId
        });
      }

      const agent = {
        id: agentId,
        ...formData,
        citizenshipId,
        createdAt: Date.now()
      };

      await saveAgent.mutateAsync(agent);
      toast.success('Agent saved successfully!');
      setFormData({ name: '', address: '', contact: '', workArea: '' });
      setCitizenshipFile(null);
      setShowForm(false);
    } catch (error) {
      toast.error('Failed to save agent');
      console.error(error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Button variant="ghost" onClick={() => navigate({ to: '/' })} className="mb-4 gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Button>

      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">Agent List</h2>
        <p className="text-muted-foreground">Manage your real estate agents</p>
      </div>

      {!showForm && (
        <Button onClick={() => setShowForm(true)} className="mb-6 gap-2">
          <Plus className="w-4 h-4" />
          Add New Agent
        </Button>
      )}

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Agent</CardTitle>
            <CardDescription>Enter agent details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

              <div className="space-y-2">
                <Label htmlFor="workArea">Work Area</Label>
                <Input
                  id="workArea"
                  placeholder="e.g., Downtown, Suburbs"
                  value={formData.workArea}
                  onChange={(e) => setFormData({ ...formData, workArea: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="citizenship">Citizenship Upload</Label>
                <Input
                  id="citizenship"
                  type="file"
                  onChange={(e) => setCitizenshipFile(e.target.files?.[0] || null)}
                  accept="image/*,.pdf"
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={saveAgent.isPending}>
                  {saveAgent.isPending ? 'Saving...' : 'Save Agent'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Agents</CardTitle>
          <CardDescription>View and manage your agents</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : agents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No agents yet. Add your first agent!
            </div>
          ) : (
            <div className="space-y-2">
              {agents.map(agent => (
                <Link key={agent.id} to="/agent/$agentId" params={{ agentId: agent.id }}>
                  <div className="p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{agent.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {agent.contact} • {agent.workArea || 'No work area specified'}
                        </p>
                      </div>
                      <Eye className="w-5 h-5 text-muted-foreground shrink-0" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
