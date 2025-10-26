import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Upload, Trash2, Download, FileIcon } from "lucide-react";
import { toast } from "sonner";

interface PlatformDocumentsProps {
  platformId: number;
}

export function PlatformDocuments({ platformId }: PlatformDocumentsProps) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "other" as "sop" | "contract" | "guide" | "other",
    file: null as File | null,
  });

  const utils = trpc.useUtils();
  const { data: documents, isLoading } = trpc.platformDocuments.getDocuments.useQuery({ platformId });
  
  const uploadMutation = trpc.platformDocuments.uploadDocument.useMutation({
    onSuccess: () => {
      toast.success("Document uploaded successfully");
      utils.platformDocuments.getDocuments.invalidate({ platformId });
      setIsUploadOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  const deleteMutation = trpc.platformDocuments.deleteDocument.useMutation({
    onSuccess: () => {
      toast.success("Document deleted");
      utils.platformDocuments.getDocuments.invalidate({ platformId });
    },
    onError: (error) => {
      toast.error(`Delete failed: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "other",
      file: null,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, file, name: formData.name || file.name });
    }
  };

  const handleUpload = async () => {
    if (!formData.file) {
      toast.error("Please select a file");
      return;
    }

    setUploading(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(",")[1];
        
        await uploadMutation.mutateAsync({
          platformId,
          name: formData.name,
          description: formData.description,
          category: formData.category,
          fileData: base64Data,
          fileName: formData.file!.name,
          mimeType: formData.file!.type,
        });
        
        setUploading(false);
      };
      reader.readAsDataURL(formData.file);
    } catch (error) {
      setUploading(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      sop: "SOP",
      contract: "Contract",
      guide: "Guide",
      other: "Other",
    };
    return labels[category] || category;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Documents</CardTitle>
            <CardDescription>SOPs, contracts, and other files related to this platform</CardDescription>
          </div>
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogDescription>Add a document for this platform</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file">File</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                  />
                </div>
                <div>
                  <Label htmlFor="name">Document Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter document name"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sop">SOP</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="guide">Guide</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Add a description..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpload} disabled={uploading || !formData.file}>
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading documents...</p>
        ) : documents && documents.length > 0 ? (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent"
              >
                <div className="flex items-center gap-3 flex-1">
                  <FileIcon className="h-8 w-8 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{doc.name}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary">
                        {getCategoryLabel(doc.category)}
                      </span>
                    </div>
                    {doc.description && (
                      <p className="text-sm text-muted-foreground">{doc.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(doc.fileSize)} • {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(doc.fileUrl, "_blank")}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this document?")) {
                        deleteMutation.mutate({ documentId: doc.id });
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No documents uploaded yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

