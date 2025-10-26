import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, Loader2, MessageSquare, Download, Trash2, PenLine } from "lucide-react";
import { toast } from "sonner";

import { ScrollArea } from "@/components/ui/scroll-area";

export default function SopGenerator() {
  const [mode, setMode] = useState<'upload' | 'describe'>('describe');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [sopTitle, setSopTitle] = useState("");
  const [currentSopId, setCurrentSopId] = useState<number | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  
  const { data: sops, isLoading, refetch } = trpc.sop.list.useQuery();
  const { data: currentSop, refetch: refetchSop } = trpc.sop.get.useQuery(
    { id: currentSopId! },
    { enabled: !!currentSopId }
  );
  
  const generateFromDescriptionMutation = trpc.sop.generateFromDescription.useMutation({
    onSuccess: (data) => {
      toast.success("SOP generated successfully!");
      setDescription("");
      setSopTitle("");
      setIsUploading(false);
      setCurrentSopId(data.sopId);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to generate SOP: ${error.message}`);
      setIsUploading(false);
    },
  });
  
  const uploadMutation = trpc.sop.uploadAndGenerate.useMutation({
    onSuccess: (data) => {
      toast.success("SOP generated successfully!");
      setSelectedFile(null);
      setIsUploading(false);
      setCurrentSopId(data.sopId);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to generate SOP: ${error.message}`);
      setIsUploading(false);
    },
  });
  
  const chatMutation = trpc.sop.chat.useMutation({
    onSuccess: () => {
      toast.success("SOP updated!");
      setChatMessage("");
      setIsChatting(false);
      refetchSop();
    },
    onError: (error) => {
      toast.error(`Failed to update SOP: ${error.message}`);
      setIsChatting(false);
    },
  });
  
  const deleteMutation = trpc.sop.delete.useMutation({
    onSuccess: () => {
      toast.success("SOP deleted");
      setCurrentSopId(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete SOP: ${error.message}`);
    },
  });
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (16MB limit)
      if (file.size > 16 * 1024 * 1024) {
        toast.error("File size must be less than 16MB");
        return;
      }
      setSelectedFile(file);
    }
  };
  
  const handleGenerateFromDescription = async () => {
    if (!description.trim()) {
      toast.error("Please provide a description");
      return;
    }
    
    setIsUploading(true);
    await generateFromDescriptionMutation.mutateAsync({
      description: description.trim(),
      title: sopTitle.trim() || undefined,
    });
  };
  
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const base64Data = base64.split(',')[1]; // Remove data:mime;base64, prefix
        
        await uploadMutation.mutateAsync({
          fileName: selectedFile.name,
          fileData: base64Data,
          mimeType: selectedFile.type,
        });
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error("Upload error:", error);
      setIsUploading(false);
    }
  };
  
  const handleChat = async () => {
    if (!chatMessage.trim() || !currentSopId) return;
    
    setIsChatting(true);
    await chatMutation.mutateAsync({
      sopId: currentSopId,
      message: chatMessage,
    });
  };
  
  const handleDelete = async (sopId: number) => {
    if (confirm("Are you sure you want to delete this SOP?")) {
      await deleteMutation.mutateAsync({ id: sopId });
    }
  };
  
  const downloadSop = (sop: { title: string; content: string }) => {
    const blob = new Blob([sop.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sop.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">SOP Generator</h1>
        <p className="text-muted-foreground">
          Describe your process or upload documents to generate structured Standard Operating Procedures with AI
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create SOP Section */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Create SOP</CardTitle>
              <CardDescription>
                Describe what you need or upload a document
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mode Toggle */}
              <div className="flex gap-2 p-1 bg-muted rounded-lg">
                <Button
                  variant={mode === 'describe' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setMode('describe')}
                  className="flex-1"
                >
                  <PenLine className="mr-2 h-4 w-4" />
                  Describe
                </Button>
                <Button
                  variant={mode === 'upload' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setMode('upload')}
                  className="flex-1"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
              </div>
              
              {/* Describe Mode */}
              {mode === 'describe' && (
                <>
                  <div>
                    <Label htmlFor="sop-title">SOP Title (Optional)</Label>
                    <Input
                      id="sop-title"
                      placeholder="e.g., Customer Onboarding Process"
                      value={sopTitle}
                      onChange={(e) => setSopTitle(e.target.value)}
                      disabled={isUploading}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="sop-description">Description</Label>
                    <Textarea
                      id="sop-description"
                      placeholder="Describe the process or procedure you want to document. Include key steps, roles, and any important details..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={isUploading}
                      className="min-h-[200px]"
                    />
                  </div>
                  
                  <Button
                    onClick={handleGenerateFromDescription}
                    disabled={!description.trim() || isUploading}
                    className="w-full"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating SOP...
                      </>
                    ) : (
                      <>
                        <PenLine className="mr-2 h-4 w-4" />
                        Generate SOP
                      </>
                    )}
                  </Button>
                </>
              )}
              
              {/* Upload Mode */}
              {mode === 'upload' && (
                <>
                  <div>
                    <Label htmlFor="file-upload">Select File</Label>
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx"
                      onChange={handleFileSelect}
                      disabled={isUploading}
                    />
                    {selectedFile && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </p>
                    )}
                  </div>
                  
                  <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || isUploading}
                    className="w-full"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating SOP...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload & Generate SOP
                      </>
                    )}
                  </Button>
                  
                  <p className="text-xs text-muted-foreground">
                    Max file size: 16MB. Supported: PDF, images, Word docs
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          
          {/* SOP Library */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Your SOPs</CardTitle>
              <CardDescription>
                {sops?.length || 0} SOPs created
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : sops && sops.length > 0 ? (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {sops.map((sop) => (
                      <div
                        key={sop.id}
                        className={`p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                          currentSopId === sop.id ? 'bg-accent border-primary' : ''
                        }`}
                        onClick={() => setCurrentSopId(sop.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm line-clamp-1">{sop.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(sop.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(sop.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No SOPs yet</p>
                  <p className="text-sm">Upload a document to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* SOP Viewer & Editor */}
        <div className="lg:col-span-2">
          {currentSop ? (
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{currentSop.title}</CardTitle>
                    <CardDescription>
                      Last updated: {new Date(currentSop.updatedAt).toLocaleString()}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadSop(currentSop)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* SOP Content */}
                <div className="border rounded-lg p-4 bg-muted/30">
                  <ScrollArea className="h-[400px]">
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <pre className="whitespace-pre-wrap font-sans">{currentSop.content}</pre>
                    </div>
                  </ScrollArea>
                </div>
                
                {/* Chat Interface */}
                <div className="space-y-2">
                  <Label htmlFor="chat-message">Refine with AI</Label>
                  <div className="flex gap-2">
                    <Textarea
                      id="chat-message"
                      placeholder="Ask AI to modify the SOP... (e.g., 'Add a quality checklist section' or 'Make it more concise')"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      disabled={isChatting}
                      className="min-h-[80px]"
                    />
                  </div>
                  <Button
                    onClick={handleChat}
                    disabled={!chatMessage.trim() || isChatting}
                    className="w-full"
                  >
                    {isChatting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating SOP...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Send to AI
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-16">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No SOP Selected</h3>
                <p className="text-muted-foreground">
                  Upload a document or select an existing SOP from the library
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

