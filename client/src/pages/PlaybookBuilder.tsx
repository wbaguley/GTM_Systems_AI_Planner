import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Plus, BookOpen, Workflow, Clock, Archive, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

export default function PlaybookBuilder() {
  const [, setLocation] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPlaybook, setNewPlaybook] = useState({
    title: "",
    description: "",
    type: "playbook" as "playbook" | "cadence" | "workflow",
    category: "",
  });

  const { data: playbooks, isLoading, refetch } = trpc.playbook.list.useQuery();
  const createMutation = trpc.playbook.create.useMutation();
  const deleteMutation = trpc.playbook.delete.useMutation();

  const handleCreate = async () => {
    try {
      const result = await createMutation.mutateAsync(newPlaybook);
      setIsCreateDialogOpen(false);
      setNewPlaybook({ title: "", description: "", type: "playbook", category: "" });
      refetch();
      setLocation(`/playbook-builder/${result.id}`);
    } catch (error) {
      console.error("Error creating playbook:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this playbook?")) {
      try {
        await deleteMutation.mutateAsync({ id });
        refetch();
      } catch (error) {
        console.error("Error deleting playbook:", error);
      }
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "playbook":
        return <BookOpen className="h-5 w-5" />;
      case "cadence":
        return <Clock className="h-5 w-5" />;
      case "workflow":
        return <Workflow className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading playbooks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Playbook Builder</h1>
          <p className="text-muted-foreground mt-1">
            Create visual workflows, cadences, and implementation playbooks
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Playbook
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Playbook</DialogTitle>
              <DialogDescription>
                Start building a new workflow, cadence, or implementation guide
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newPlaybook.title}
                  onChange={(e) =>
                    setNewPlaybook({ ...newPlaybook, title: e.target.value })
                  }
                  placeholder="e.g., Client Onboarding Process"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newPlaybook.description}
                  onChange={(e) =>
                    setNewPlaybook({ ...newPlaybook, description: e.target.value })
                  }
                  placeholder="Brief description of this playbook..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={newPlaybook.type}
                  onValueChange={(value: any) =>
                    setNewPlaybook({ ...newPlaybook, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="playbook">Playbook</SelectItem>
                    <SelectItem value="cadence">Cadence</SelectItem>
                    <SelectItem value="workflow">Workflow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="category">Category (Optional)</Label>
                <Select
                  value={newPlaybook.category}
                  onValueChange={(value) =>
                    setNewPlaybook({ ...newPlaybook, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="onboarding">Onboarding</SelectItem>
                    <SelectItem value="implementation">Implementation</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!newPlaybook.title || createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create Playbook"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Playbooks Grid */}
      {playbooks && playbooks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playbooks.map((playbook) => (
            <Card
              key={playbook.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setLocation(`/playbook-builder/${playbook.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(playbook.type)}
                    <CardTitle className="text-lg">{playbook.title}</CardTitle>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                      playbook.status
                    )}`}
                  >
                    {playbook.status}
                  </span>
                </div>
                <CardDescription className="line-clamp-2">
                  {playbook.description || "No description"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    <span className="capitalize">{playbook.type}</span>
                    {playbook.category && (
                      <>
                        <span>•</span>
                        <span className="capitalize">{playbook.category}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(`/playbook-builder/${playbook.id}`);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(playbook.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Workflow className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No playbooks yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Create your first playbook to start building visual workflows and
              implementation guides
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Playbook
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

