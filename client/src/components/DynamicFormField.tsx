import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface DynamicFormFieldProps {
  field: CustomField;
  value: string | null | undefined;
  onChange: (fieldKey: string, value: string | null) => void;
}

export function DynamicFormField({ field, value, onChange }: DynamicFormFieldProps) {
  const handleChange = (newValue: string | boolean | null) => {
    if (typeof newValue === "boolean") {
      onChange(field.fieldKey, newValue ? "true" : "false");
    } else {
      onChange(field.fieldKey, newValue);
    }
  };

  const renderField = () => {
    switch (field.fieldType) {
      case "text":
      case "url":
      case "phone":
        return (
          <Input
            id={field.fieldKey}
            type={field.fieldType === "url" ? "url" : field.fieldType === "phone" ? "tel" : "text"}
            value={value || ""}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder || ""}
            required={field.required === 1}
          />
        );

      case "longtext":
        return (
          <Textarea
            id={field.fieldKey}
            value={value || ""}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder || ""}
            required={field.required === 1}
            rows={4}
          />
        );

      case "number":
      case "percentage":
        return (
          <div className="relative">
            <Input
              id={field.fieldKey}
              type="number"
              value={value || ""}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={field.placeholder || ""}
              required={field.required === 1}
              step="any"
            />
            {field.fieldType === "percentage" && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                %
              </span>
            )}
          </div>
        );

      case "date":
        return (
          <Input
            id={field.fieldKey}
            type="date"
            value={value || ""}
            onChange={(e) => handleChange(e.target.value)}
            required={field.required === 1}
          />
        );

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.fieldKey}
              checked={value === "true"}
              onCheckedChange={(checked) => handleChange(checked)}
            />
            <Label htmlFor={field.fieldKey} className="text-sm font-normal cursor-pointer">
              {field.placeholder || field.label}
            </Label>
          </div>
        );

      case "select":
        const options = field.options ? JSON.parse(field.options) : [];
        return (
          <Select value={value || ""} onValueChange={handleChange}>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      default:
        return (
          <Input
            id={field.fieldKey}
            value={value || ""}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder || ""}
            required={field.required === 1}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={field.fieldKey}>
        {field.label}
        {field.required === 1 && <span className="text-destructive ml-1">*</span>}
      </Label>
      {renderField()}
    </div>
  );
}

