import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Plus, Settings, Trash2, Eye } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function ModuleBuilder() {
  const { isAuthenticated, loading } = useAuth();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newModule, setNewModule] = useState({
    name: "",
    singularName: "",
    pluralName: "",
    icon: "",
    description: "",
  });

  const { data: modules = [], refetch } = trpc.modules.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createMutation = trpc.modules.create.useMutation({
    onSuccess: () => {
      toast.success("Module created successfully");
      refetch();
      setCreateDialogOpen(false);
      setNewModule({
        name: "",
        singularName: "",
        pluralName: "",
        icon: "",
        description: "",
      });
    },
    onError: (error) => {
      toast.error(`Failed to create module: ${error.message}`);
    },
  });

  const deleteMutation = trpc.modules.delete.useMutation({
    onSuccess: () => {
      toast.success("Module deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete module: ${error.message}`);
    },
  });

  const handleCreate = () => {
    if (!newModule.name || !newModule.singularName || !newModule.pluralName) {
      toast.error("Please fill in all required fields");
      return;
    }
    createMutation.mutate(newModule);
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete the "${name}" module? This will delete all associated data.`)) {
      deleteMutation.mutate({ id });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-muted-foreground mb-4">Please log in to access the module builder.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Module Builder</h1>
          <p className="text-muted-foreground mt-2">
            Create custom modules and design their forms visually
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Module
        </Button>
      </div>

      {modules.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No modules yet</h3>
            <p className="text-muted-foreground mb-6">
              Get started by creating your first custom module. You can create modules for contacts, deals, projects, or any other data you need to track.
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Module
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <Card key={module.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{module.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {module.singularName} / {module.pluralName}
                  </p>
                </div>
                {!module.isSystem && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(module.id, module.name)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
              
              {module.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {module.description}
                </p>
              )}

              <div className="flex gap-2">
                <Link href={`/module-builder/${module.id}/design`}>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Settings className="h-4 w-4 mr-2" />
                    Design Form
                  </Button>
                </Link>
                <Link href={`/module/${module.id}`}>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-2" />
                    View Data
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Module Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Module</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="name">Module Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Contacts, Deals, Projects"
                value={newModule.name}
                onChange={(e) => setNewModule({ ...newModule, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="singularName">Singular Name *</Label>
                <Input
                  id="singularName"
                  placeholder="e.g., Contact"
                  value={newModule.singularName}
                  onChange={(e) => setNewModule({ ...newModule, singularName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="pluralName">Plural Name *</Label>
                <Input
                  id="pluralName"
                  placeholder="e.g., Contacts"
                  value={newModule.pluralName}
                  onChange={(e) => setNewModule({ ...newModule, pluralName: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="icon">Icon (Lucide icon name)</Label>
              <Input
                id="icon"
                placeholder="e.g., Users, Briefcase, FolderKanban"
                value={newModule.icon}
                onChange={(e) => setNewModule({ ...newModule, icon: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What is this module for?"
                value={newModule.description}
                onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Module"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

