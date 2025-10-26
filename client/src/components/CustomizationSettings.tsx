import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, GripVertical, Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useState } from "react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface CustomField {
  id: number;
  fieldKey: string;
  label: string;
  fieldType: string;
  placeholder?: string | null;
  required: number;
  options?: string | null;
  displayOrder: number;
}

type FieldType = "text" | "longtext" | "number" | "percentage" | "checkbox" | "url" | "phone" | "date" | "select";

interface FieldFormData {
  fieldKey: string;
  label: string;
  fieldType: FieldType;
  placeholder: string;
  required: boolean;
  options: string[];
}

function SortableFieldItem({ field, onEdit, onDelete }: {
  field: CustomField;
  onEdit: (field: CustomField) => void;
  onDelete: (id: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border"
    >
      <button
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>
      
      <div className="flex-1">
        <div className="font-medium">{field.label}</div>
        <div className="text-sm text-muted-foreground">
          Type: {field.fieldType} • Key: {field.fieldKey}
          {field.required === 1 && " • Required"}
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(field)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(field.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function CustomizationSettings() {
  const { theme, toggleTheme } = useTheme();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [formData, setFormData] = useState<FieldFormData>({
    fieldKey: "",
    label: "",
    fieldType: "text" as FieldType,
    placeholder: "",
    required: false,
    options: [],
  });
  const [optionsText, setOptionsText] = useState("");

  const utils = trpc.useUtils();
  const { data: fields = [], isLoading } = trpc.customFields.list.useQuery();

  const createMutation = trpc.customFields.create.useMutation({
    onSuccess: () => {
      toast.success("Field created successfully");
      utils.customFields.list.invalidate();
      closeDialog();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create field");
    },
  });

  const updateMutation = trpc.customFields.update.useMutation({
    onSuccess: () => {
      toast.success("Field updated successfully");
      utils.customFields.list.invalidate();
      closeDialog();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update field");
    },
  });

  const deleteMutation = trpc.customFields.delete.useMutation({
    onSuccess: () => {
      toast.success("Field deleted successfully");
      utils.customFields.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete field");
    },
  });

  const reorderMutation = trpc.customFields.reorder.useMutation({
    onSuccess: () => {
      utils.customFields.list.invalidate();
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);

      const newOrder = arrayMove(fields, oldIndex, newIndex);
      reorderMutation.mutate({
        fieldIds: newOrder.map((f) => f.id),
      });
    }
  };

  const openDialog = (field?: CustomField) => {
    if (field) {
      setEditingField(field);
      setFormData({
        fieldKey: field.fieldKey,
        label: field.label,
        fieldType: field.fieldType as FieldType,
        placeholder: field.placeholder || "",
        required: field.required === 1,
        options: field.options ? JSON.parse(field.options) : [],
      });
      setOptionsText(field.options ? JSON.parse(field.options).join("\n") : "");
    } else {
      setEditingField(null);
      setFormData({
        fieldKey: "",
        label: "",
        fieldType: "text" as FieldType,
        placeholder: "",
        required: false,
        options: [],
      });
      setOptionsText("");
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingField(null);
  };

  const handleSubmit = () => {
    if (!formData.label.trim()) {
      toast.error("Please enter a field label");
      return;
    }

    if (!formData.fieldKey.trim()) {
      toast.error("Please enter a field key");
      return;
    }

    const options = formData.fieldType === "select"
      ? optionsText.split("\n").filter((o) => o.trim())
      : undefined;

    if (editingField) {
      updateMutation.mutate({
        id: editingField.id,
        ...formData,
        options,
      });
    } else {
      createMutation.mutate({
        ...formData,
        options,
        displayOrder: fields.length,
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this field? All associated data will be lost.")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <>
      {/* Theme Toggle Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize the look and feel of your workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="theme-toggle" className="text-base font-medium flex items-center gap-2">
                {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                Theme
              </Label>
              <p className="text-sm text-muted-foreground">
                {theme === "dark" ? "Dark mode is enabled" : "Light mode is enabled"}
              </p>
            </div>
            <Switch
              id="theme-toggle"
              checked={theme === "dark"}
              onCheckedChange={toggleTheme}
            />
          </div>
        </CardContent>
      </Card>

      {/* Custom Fields Card */}
      <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Custom Fields</CardTitle>
            <CardDescription>
              Configure custom fields for your platform forms. Drag to reorder.
            </CardDescription>
          </div>
          <Button onClick={() => openDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Field
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading fields...</div>
        ) : fields.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No custom fields yet. Click "Add Field" to create one.
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={fields.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {fields.map((field) => (
                  <SortableFieldItem
                    key={field.id}
                    field={field}
                    onEdit={openDialog}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingField ? "Edit Field" : "Add New Field"}</DialogTitle>
              <DialogDescription>
                Configure the field properties and type
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="label">Field Label *</Label>
                  <Input
                    id="label"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="e.g., Monthly Cost"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fieldKey">Field Key *</Label>
                  <Input
                    id="fieldKey"
                    value={formData.fieldKey}
                    onChange={(e) => setFormData({ ...formData, fieldKey: e.target.value })}
                    placeholder="e.g., monthly_cost"
                    disabled={!!editingField}
                  />
                  <p className="text-xs text-muted-foreground">
                    Unique identifier (cannot be changed after creation)
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fieldType">Field Type</Label>
                <Select
                  value={formData.fieldType}
                  onValueChange={(value: FieldType) => setFormData({ ...formData, fieldType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Short Text</SelectItem>
                    <SelectItem value="longtext">Long Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="checkbox">Checkbox</SelectItem>
                    <SelectItem value="url">URL</SelectItem>
                    <SelectItem value="phone">Phone Number</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="select">Dropdown/Select</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="placeholder">Placeholder Text</Label>
                <Input
                  id="placeholder"
                  value={formData.placeholder}
                  onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
                  placeholder="e.g., Enter monthly cost"
                />
              </div>

              {formData.fieldType === "select" && (
                <div className="space-y-2">
                  <Label htmlFor="options">Dropdown Options (one per line)</Label>
                  <Textarea
                    id="options"
                    value={optionsText}
                    onChange={(e) => setOptionsText(e.target.value)}
                    placeholder="Option 1&#10;Option 2&#10;Option 3"
                    rows={5}
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="required"
                  checked={formData.required}
                  onCheckedChange={(checked) => setFormData({ ...formData, required: checked })}
                />
                <Label htmlFor="required">Required field</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingField ? "Update" : "Create"} Field
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
    </>
  );
}

