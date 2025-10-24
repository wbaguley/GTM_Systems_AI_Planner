import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, ExternalLink, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function PlatformsDynamic() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<number | null>(null);
  const [viewingRecord, setViewingRecord] = useState<any | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const utils = trpc.useUtils();

  // Get Platforms module
  const { data: modules = [] } = trpc.modules.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const platformsModule = modules.find(m => m.name === "Platforms");
  const moduleId = platformsModule?.id;

  // Get module fields
  const { data: fields = [] } = trpc.modules.getFields.useQuery(
    { moduleId: moduleId! },
    { enabled: !!moduleId }
  );

  // Get module records (platforms)
  const { data: records = [], isLoading } = trpc.modules.listRecords.useQuery(
    { moduleId: moduleId! },
    { enabled: !!moduleId }
  );

  const createMutation = trpc.modules.createRecord.useMutation({
    onSuccess: () => {
      utils.modules.listRecords.invalidate();
      setDialogOpen(false);
      setFormData({});
      toast.success("Platform created successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create platform");
    },
  });

  const updateMutation = trpc.modules.updateRecord.useMutation({
    onSuccess: () => {
      utils.modules.listRecords.invalidate();
      setDialogOpen(false);
      setEditingRecordId(null);
      setFormData({});
      toast.success("Platform updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update platform");
    },
  });

  const deleteMutation = trpc.modules.deleteRecord.useMutation({
    onSuccess: () => {
      utils.modules.listRecords.invalidate();
      toast.success("Platform deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete platform");
    },
  });

  // Initialize form data when fields are loaded
  useEffect(() => {
    if (fields.length > 0 && !editingRecordId) {
      const initialData: Record<string, any> = {};
      fields.forEach(field => {
        if (field.fieldType === "checkbox") {
          initialData[field.fieldKey] = false;
        } else if (field.fieldType === "number" || field.fieldType === "currency") {
          initialData[field.fieldKey] = 0;
        } else {
          initialData[field.fieldKey] = field.defaultValue || "";
        }
      });
      setFormData(initialData);
    }
  }, [fields, editingRecordId]);

  const handleEdit = (record: any) => {
    setEditingRecordId(record.id);
    setFormData(record.data || {});
    setDialogOpen(true);
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate({ id });
    }
  };

  const handleSubmit = () => {
    if (!moduleId) return;

    // Validate required fields
    const requiredFields = fields.filter(f => f.isRequired);
    for (const field of requiredFields) {
      if (!formData[field.fieldKey]) {
        toast.error(`${field.label} is required`);
        return;
      }
    }

    if (editingRecordId) {
      updateMutation.mutate({
        id: editingRecordId,
        data: formData,
      });
    } else {
      createMutation.mutate({
        moduleId,
        data: formData,
      });
    }
  };

  const renderField = (field: any) => {
    const value = formData[field.fieldKey] || "";

    const handleChange = (newValue: any) => {
      setFormData(prev => ({ ...prev, [field.fieldKey]: newValue }));
    };

    switch (field.fieldType) {
      case "text":
      case "email":
      case "url":
      case "phone":
        return (
          <Input
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder || field.label}
          />
        );

      case "longtext":
        return (
          <Textarea
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder || field.label}
            rows={3}
          />
        );

      case "number":
      case "currency":
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleChange(parseFloat(e.target.value) || 0)}
            placeholder={field.placeholder || "0"}
          />
        );

      case "date":
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
          />
        );

      case "datetime":
        return (
          <Input
            type="datetime-local"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
          />
        );

      case "checkbox":
        return (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value === true || value === "true"}
              onChange={(e) => handleChange(e.target.checked)}
            />
            <span className="text-sm">{field.placeholder || field.label}</span>
          </div>
        );

      case "select":
        const options = Array.isArray(field.options) ? field.options : [];
        return (
          <Select value={value} onValueChange={handleChange}>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option: string, idx: number) => (
                <SelectItem key={idx} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder || field.label}
          />
        );
    }
  };

  // Filter records based on search
  const filteredRecords = records.filter(record => {
    if (!searchQuery) return true;
    const platformName = record.data?.platform || "";
    return platformName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (authLoading || !moduleId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Tech Stack</h1>
          <p className="text-muted-foreground mt-2">
            Manage your technology platforms and subscriptions
          </p>
        </div>
        <Button onClick={() => {
          setEditingRecordId(null);
          setFormData({});
          setDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Platform
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search platforms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Platforms Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading platforms...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No platforms yet</h3>
            <p className="text-muted-foreground mb-6">
              Get started by adding your first platform to track.
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Platform
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecords.map((record: any) => {
            const data = record.data || {};
            const status = data.status || "Active";
            const statusColor = 
              status === "Active" ? "bg-green-100 text-green-800" :
              status === "Inactive" ? "bg-gray-100 text-gray-800" :
              "bg-red-100 text-red-800";

            return (
              <Card 
                key={record.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  setViewingRecord(record);
                  setViewDialogOpen(true);
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {data.logoUrl && (
                        <img
                          src={data.logoUrl}
                          alt={data.platform}
                          className="w-10 h-10 object-contain rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{data.platform}</CardTitle>
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mt-1 ${statusColor}`}>
                          {status}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(record);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(record.id, data.platform);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {data.useCase && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {data.useCase}
                    </p>
                  )}
                  {data.website && (
                    <a
                      href={data.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      Visit Website
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRecordId ? "Edit Platform" : "Add New Platform"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {fields.map((field) => (
              <div
                key={field.id}
                className={field.columnSpan === 3 ? "col-span-2" : field.columnSpan === 1 ? "col-span-1" : "col-span-2"}
              >
                <Label htmlFor={field.fieldKey}>
                  {field.label}
                  {field.isRequired && <span className="text-destructive ml-1">*</span>}
                </Label>
                {field.helpText && (
                  <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>
                )}
                <div className="mt-2">
                  {renderField(field)}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : editingRecordId
                ? "Update"
                : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {viewingRecord?.data?.logoUrl && (
                <img
                  src={viewingRecord.data.logoUrl}
                  alt={viewingRecord.data.platform}
                  className="w-10 h-10 object-contain rounded"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
              {viewingRecord?.data?.platform || "Platform Details"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            {fields.map((field) => {
              const value = viewingRecord?.data?.[field.fieldKey];
              if (!value && value !== 0 && value !== false) return null;
              
              return (
                <div key={field.id} className="border-b pb-4 last:border-0">
                  <Label className="text-sm font-semibold text-muted-foreground">
                    {field.label}
                  </Label>
                  <div className="mt-2 text-base">
                    {field.fieldType === "url" ? (
                      <a
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        {value}
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : field.fieldType === "checkbox" ? (
                      <span>{value === "true" || value === true ? "✓ Yes" : "✗ No"}</span>
                    ) : field.fieldType === "date" ? (
                      <span>{new Date(value).toLocaleDateString()}</span>
                    ) : field.fieldType === "currency" ? (
                      <span>${parseFloat(value).toLocaleString()}</span>
                    ) : field.fieldType === "longtext" ? (
                      <p className="whitespace-pre-wrap">{value}</p>
                    ) : (
                      <span>{value}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setViewDialogOpen(false);
                handleEdit(viewingRecord);
              }}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

