import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import {
  Type,
  AlignLeft,
  Hash,
  Percent,
  DollarSign,
  CheckSquare,
  Link as LinkIcon,
  Mail,
  Phone,
  Calendar,
  Clock,
  List,
  ListChecks,
  FileText,
  Image as ImageIcon,
  GripVertical,
  Trash2,
  Plus,
  Save,
  Eye,
  Settings as SettingsIcon,
  ArrowLeft,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

const FIELD_TYPES = [
  { type: "text", label: "Single Line Text", icon: Type },
  { type: "longtext", label: "Multi-Line Text", icon: AlignLeft },
  { type: "number", label: "Number", icon: Hash },
  { type: "percentage", label: "Percentage", icon: Percent },
  { type: "currency", label: "Currency", icon: DollarSign },
  { type: "checkbox", label: "Checkbox", icon: CheckSquare },
  { type: "url", label: "URL", icon: LinkIcon },
  { type: "email", label: "Email", icon: Mail },
  { type: "phone", label: "Phone", icon: Phone },
  { type: "date", label: "Date", icon: Calendar },
  { type: "datetime", label: "Date & Time", icon: Clock },
  { type: "select", label: "Dropdown", icon: List },
  { type: "multiselect", label: "Multi-Select", icon: ListChecks },
  { type: "file", label: "File Upload", icon: FileText },
  { type: "image", label: "Image Upload", icon: ImageIcon },
];

type FieldType = typeof FIELD_TYPES[number]["type"];

interface Field {
  id: number;
  fieldKey: string;
  label: string;
  fieldType: FieldType;
  placeholder?: string;
  helpText?: string;
  isRequired: boolean;
  isUnique: boolean;
  defaultValue?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
  displayOrder: number;
  sectionId?: number;
  columnSpan: number;
  isSystem: boolean;
}

export default function FormDesigner() {
  const [, params] = useRoute("/module-builder/:id/design");
  const moduleId = params?.id ? parseInt(params.id) : null;
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const { data: module } = trpc.modules.get.useQuery(
    { id: moduleId! },
    { enabled: !!moduleId && isAuthenticated }
  );

  const { data: fetchedFields = [], refetch: refetchFields } = trpc.modules.getFields.useQuery(
    { moduleId: moduleId! },
    { enabled: !!moduleId && isAuthenticated }
  );

  useEffect(() => {
    if (fetchedFields.length > 0) {
      setFields(fetchedFields as Field[]);
    }
  }, [fetchedFields]);

  const createFieldMutation = trpc.modules.createField.useMutation({
    onSuccess: () => {
      refetchFields();
      toast.success("Field added successfully");
    },
  });

  const updateFieldMutation = trpc.modules.updateField.useMutation({
    onSuccess: () => {
      refetchFields();
      toast.success("Field updated successfully");
    },
  });

  const deleteFieldMutation = trpc.modules.deleteField.useMutation({
    onSuccess: () => {
      refetchFields();
      setSelectedField(null);
      toast.success("Field deleted successfully");
    },
  });

  const reorderFieldsMutation = trpc.modules.reorderFields.useMutation({
    onSuccess: () => {
      toast.success("Fields reordered successfully");
    },
  });

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;

    // Adding new field from sidebar
    if (source.droppableId === "field-types" && destination.droppableId === "form-canvas") {
      const fieldType = FIELD_TYPES[source.index];
      const newField = {
        moduleId: moduleId!,
        fieldKey: `field_${Date.now()}`,
        label: fieldType.label,
        fieldType: fieldType.type as any,
        placeholder: "",
        helpText: "",
        isRequired: false,
        isUnique: false,
        displayOrder: fields.length,
        columnSpan: 2,
      };
      createFieldMutation.mutate(newField);
    }

    // Reordering existing fields
    if (source.droppableId === "form-canvas" && destination.droppableId === "form-canvas") {
      const reorderedFields = Array.from(fields);
      const [removed] = reorderedFields.splice(source.index, 1);
      reorderedFields.splice(destination.index, 0, removed);

      const updates = reorderedFields.map((field, index) => ({
        id: field.id,
        displayOrder: index,
      }));

      setFields(reorderedFields);
      reorderFieldsMutation.mutate({ updates });
    }
  };

  const handleFieldUpdate = (updates: Partial<Field>) => {
    if (!selectedField) return;
    updateFieldMutation.mutate({
      id: selectedField.id,
      ...updates,
    });
    setSelectedField({ ...selectedField, ...updates });
  };

  const handleDeleteField = (fieldId: number) => {
    if (confirm("Are you sure you want to delete this field?")) {
      deleteFieldMutation.mutate({ id: fieldId });
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !moduleId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground">Please log in to access the form designer.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-background px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/module-builder">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">{module?.name} - Form Designer</h1>
            <p className="text-sm text-muted-foreground">
              Drag fields from the left to build your form
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={previewMode ? "default" : "outline"}
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? (
              <>
                <SettingsIcon className="h-4 w-4 mr-2" />
                Edit Mode
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </>
            )}
          </Button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Field Types */}
          {!previewMode && (
            <div className="w-64 border-r bg-muted/30 p-4 overflow-y-auto">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Fields
              </h3>
              <Droppable droppableId="field-types" isDropDisabled={true}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                    {FIELD_TYPES.map((fieldType, index) => (
                      <Draggable
                        key={fieldType.type}
                        draggableId={fieldType.type}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <>
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-3 bg-background border rounded-lg cursor-move hover:shadow-md transition-shadow flex items-center gap-2 ${
                                snapshot.isDragging ? "shadow-lg" : ""
                              }`}
                            >
                              <fieldType.icon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{fieldType.label}</span>
                            </div>
                            {snapshot.isDragging && (
                              <div className="p-3 bg-background border rounded-lg flex items-center gap-2 opacity-50">
                                <fieldType.icon className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">{fieldType.label}</span>
                              </div>
                            )}
                          </>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          )}

          {/* Center Canvas */}
          <div className="flex-1 overflow-y-auto p-8 bg-muted/10">
            <div className="max-w-4xl mx-auto">
              <Card className="p-8">
                <Droppable droppableId="form-canvas">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[400px] space-y-4 ${
                        snapshot.isDraggingOver ? "bg-primary/5 rounded-lg" : ""
                      }`}
                    >
                      {fields.length === 0 ? (
                        <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
                          <div className="text-center">
                            <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">
                              Drag fields from the left sidebar to start building your form
                            </p>
                          </div>
                        </div>
                      ) : (
                        fields.map((field, index) => (
                          <Draggable
                            key={field.id}
                            draggableId={`field-${field.id}`}
                            index={index}
                            isDragDisabled={previewMode}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`group relative p-4 border rounded-lg bg-background ${
                                  snapshot.isDragging ? "shadow-lg" : ""
                                } ${
                                  selectedField?.id === field.id ? "ring-2 ring-primary" : ""
                                } ${previewMode ? "" : "hover:border-primary cursor-pointer"}`}
                                onClick={() => !previewMode && setSelectedField(field)}
                              >
                                {!previewMode && (
                                  <div
                                    {...provided.dragHandleProps}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                )}
                                <div className={previewMode ? "" : "ml-6"}>
                                  <Label className="flex items-center gap-2">
                                    {field.label}
                                    {field.isRequired && <span className="text-destructive">*</span>}
                                  </Label>
                                  {field.helpText && (
                                    <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>
                                  )}
                                  <div className="mt-2">
                                    {(field.fieldType === "text" ||
                                      field.fieldType === "email" ||
                                      field.fieldType === "url" ||
                                      field.fieldType === "phone") && (
                                      <Input placeholder={field.placeholder || field.label} disabled={!previewMode} />
                                    )}
                                    {field.fieldType === "longtext" && (
                                      <Textarea placeholder={field.placeholder || field.label} disabled={!previewMode} rows={3} />
                                    )}
                                    {(field.fieldType === "number" ||
                                      field.fieldType === "percentage" ||
                                      field.fieldType === "currency") && (
                                      <Input type="number" placeholder={field.placeholder || "0"} disabled={!previewMode} />
                                    )}
                                    {field.fieldType === "checkbox" && (
                                      <div className="flex items-center gap-2">
                                        <input type="checkbox" disabled={!previewMode} />
                                        <span className="text-sm">{field.placeholder || "Check this box"}</span>
                                      </div>
                                    )}
                                    {field.fieldType === "date" && (
                                      <Input type="date" disabled={!previewMode} />
                                    )}
                                    {field.fieldType === "datetime" && (
                                      <Input type="datetime-local" disabled={!previewMode} />
                                    )}
                                    {(field.fieldType === "select" || field.fieldType === "multiselect") && (
                                      <Select disabled={!previewMode}>
                                        <SelectTrigger>
                                          <SelectValue placeholder={field.placeholder || "Select an option"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {field.options?.map((option, idx) => (
                                            <SelectItem key={idx} value={option}>
                                              {option}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </Card>
            </div>
          </div>

          {/* Right Sidebar - Field Properties */}
          {!previewMode && selectedField && (
            <div className="w-80 border-l bg-background p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold">Field Properties</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteField(selectedField.id)}
                  disabled={selectedField.isSystem}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="field-label">Field Label</Label>
                  <Input
                    id="field-label"
                    value={selectedField.label}
                    onChange={(e) => handleFieldUpdate({ label: e.target.value })}
                    disabled={selectedField.isSystem}
                  />
                </div>

                <div>
                  <Label htmlFor="field-key">Field Key</Label>
                  <Input
                    id="field-key"
                    value={selectedField.fieldKey}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Used internally to store data
                  </p>
                </div>

                <div>
                  <Label htmlFor="field-placeholder">Placeholder</Label>
                  <Input
                    id="field-placeholder"
                    value={selectedField.placeholder || ""}
                    onChange={(e) => handleFieldUpdate({ placeholder: e.target.value })}
                    placeholder="Enter placeholder text"
                  />
                </div>

                <div>
                  <Label htmlFor="field-help">Help Text</Label>
                  <Textarea
                    id="field-help"
                    value={selectedField.helpText || ""}
                    onChange={(e) => handleFieldUpdate({ helpText: e.target.value })}
                    placeholder="Additional information for users"
                    rows={2}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <Label htmlFor="field-required">Required Field</Label>
                  <Switch
                    id="field-required"
                    checked={selectedField.isRequired}
                    onCheckedChange={(checked) => handleFieldUpdate({ isRequired: checked })}
                    disabled={selectedField.isSystem}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="field-unique">Unique Values</Label>
                  <Switch
                    id="field-unique"
                    checked={selectedField.isUnique}
                    onCheckedChange={(checked) => handleFieldUpdate({ isUnique: checked })}
                    disabled={selectedField.isSystem}
                  />
                </div>

                {(selectedField.fieldType === "select" || selectedField.fieldType === "multiselect") && (
                  <>
                    <Separator />
                    <div>
                      <Label>Options</Label>
                      <p className="text-xs text-muted-foreground mb-2">
                        Enter one option per line
                      </p>
                      <Textarea
                        value={selectedField.options?.join("\n") || ""}
                        onChange={(e) =>
                          handleFieldUpdate({
                            options: e.target.value.split("\n").filter((o) => o.trim()),
                          })
                        }
                        placeholder="Option 1&#10;Option 2&#10;Option 3"
                        rows={5}
                      />
                    </div>
                  </>
                )}

                <Separator />

                <div>
                  <Label htmlFor="column-span">Column Width</Label>
                  <Select
                    value={selectedField.columnSpan.toString()}
                    onValueChange={(value) => handleFieldUpdate({ columnSpan: parseInt(value) })}
                  >
                    <SelectTrigger id="column-span">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1/3 Width</SelectItem>
                      <SelectItem value="2">2/3 Width (Default)</SelectItem>
                      <SelectItem value="3">Full Width</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>
      </DragDropContext>
    </div>
  );
}

