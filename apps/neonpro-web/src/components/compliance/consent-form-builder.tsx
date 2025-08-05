"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  GripVertical,
  Type,
  CheckSquare,
  Circle,
  Calendar,
  FileText,
  Image,
  Signature,
  Save,
  Eye,
  Copy,
  Upload,
  Download,
} from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useToast } from "@/hooks/use-toast";

interface FormField {
  id: string;
  type: "text" | "textarea" | "select" | "checkbox" | "radio" | "date" | "signature" | "file";
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  order: number;
}

interface ConsentFormTemplate {
  id?: string;
  title: string;
  description: string;
  version: string;
  form_type: "treatment" | "photography" | "data_processing" | "research" | "general";
  clinic_id: string;
  fields: FormField[];
  legal_text: string;
  footer_text: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface FormBuilderProps {
  clinicId: string;
  templateId?: string;
  onSave?: (template: ConsentFormTemplate) => void;
}

const FIELD_TYPES = [
  { value: "text", label: "Text Input", icon: Type },
  { value: "textarea", label: "Text Area", icon: FileText },
  { value: "select", label: "Dropdown", icon: Circle },
  { value: "checkbox", label: "Checkbox", icon: CheckSquare },
  { value: "radio", label: "Radio Buttons", icon: Circle },
  { value: "date", label: "Date Picker", icon: Calendar },
  { value: "signature", label: "Digital Signature", icon: Signature },
  { value: "file", label: "File Upload", icon: Upload },
];

export default function ConsentFormBuilder({ clinicId, templateId, onSave }: FormBuilderProps) {
  const [template, setTemplate] = useState<ConsentFormTemplate>({
    title: "",
    description: "",
    version: "1.0",
    form_type: "general",
    clinic_id: clinicId,
    fields: [],
    legal_text: "",
    footer_text: "",
    is_active: false,
  });
  const [draggedField, setDraggedField] = useState<FormField | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const supabase = createClientComponentClient();
  const { toast } = useToast();

  useEffect(() => {
    if (templateId) {
      loadTemplate();
    }
  }, [templateId]);

  const loadTemplate = async () => {
    if (!templateId) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("consent_forms")
        .select("*")
        .eq("id", templateId)
        .single();

      if (error) {
        console.error("Error loading template:", error);
        toast({
          title: "Error",
          description: "Failed to load form template",
          variant: "destructive",
        });
        return;
      }

      setTemplate(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const addField = (type: FormField["type"]) => {
    const newField: FormField = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      label: `New ${type} field`,
      required: false,
      order: template.fields.length,
      ...(type === "select" || type === "radio" ? { options: ["Option 1", "Option 2"] } : {}),
    };

    setTemplate((prev) => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setTemplate((prev) => ({
      ...prev,
      fields: prev.fields.map((field) => (field.id === fieldId ? { ...field, ...updates } : field)),
    }));
  };

  const removeField = (fieldId: string) => {
    setTemplate((prev) => ({
      ...prev,
      fields: prev.fields.filter((field) => field.id !== fieldId),
    }));
  };

  const reorderFields = (dragIndex: number, hoverIndex: number) => {
    const draggedField = template.fields[dragIndex];
    const newFields = [...template.fields];
    newFields.splice(dragIndex, 1);
    newFields.splice(hoverIndex, 0, draggedField);

    setTemplate((prev) => ({
      ...prev,
      fields: newFields.map((field, index) => ({ ...field, order: index })),
    }));
  };

  const saveTemplate = async () => {
    if (!template.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a title for the form",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      const templateData = {
        ...template,
        fields: template.fields,
        updated_at: new Date().toISOString(),
      };

      let result;
      if (templateId) {
        result = await supabase
          .from("consent_forms")
          .update(templateData)
          .eq("id", templateId)
          .select()
          .single();
      } else {
        result = await supabase.from("consent_forms").insert(templateData).select().single();
      }

      if (result.error) {
        console.error("Error saving template:", result.error);
        toast({
          title: "Error",
          description: "Failed to save form template",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Form template saved successfully",
        variant: "default",
      });

      if (onSave) {
        onSave(result.data);
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const duplicateTemplate = () => {
    setTemplate((prev) => ({
      ...prev,
      id: undefined,
      title: `${prev.title} (Copy)`,
      version: "1.0",
      is_active: false,
    }));
  };

  const renderField = (field: FormField, isPreview: boolean = false) => {
    const FieldIcon = FIELD_TYPES.find((type) => type.value === field.type)?.icon || Type;

    if (isPreview) {
      return (
        <div key={field.id} className="space-y-2">
          <Label className="flex items-center gap-2">
            <FieldIcon className="h-4 w-4" />
            {field.label}
            {field.required && <span className="text-red-500">*</span>}
          </Label>
          {field.type === "text" && <Input placeholder={field.placeholder} disabled />}
          {field.type === "textarea" && <Textarea placeholder={field.placeholder} disabled />}
          {field.type === "select" && (
            <Select disabled>
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option, index) => (
                  <SelectItem key={index} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {field.type === "checkbox" && (
            <div className="flex items-center space-x-2">
              <input type="checkbox" disabled />
              <Label>{field.placeholder || "Checkbox option"}</Label>
            </div>
          )}
          {field.type === "radio" && (
            <div className="space-y-2">
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input type="radio" name={field.id} disabled />
                  <Label>{option}</Label>
                </div>
              ))}
            </div>
          )}
          {field.type === "date" && <Input type="date" disabled />}
          {field.type === "signature" && (
            <div className="border-2 border-dashed border-gray-300 p-8 text-center">
              <Signature className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">Digital signature area</p>
            </div>
          )}
          {field.type === "file" && (
            <div className="border-2 border-dashed border-gray-300 p-4 text-center">
              <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">File upload area</p>
            </div>
          )}
        </div>
      );
    }

    return (
      <Card key={field.id} className="p-4">
        <div className="flex items-start gap-4">
          <GripVertical className="h-5 w-5 text-gray-400 mt-1 cursor-move" />
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <FieldIcon className="h-4 w-4" />
              <Badge variant="outline">{field.type}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeField(field.id)}
                className="ml-auto text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor={`label-${field.id}`}>Field Label</Label>
                <Input
                  id={`label-${field.id}`}
                  value={field.label}
                  onChange={(e) => updateField(field.id, { label: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor={`placeholder-${field.id}`}>Placeholder</Label>
                <Input
                  id={`placeholder-${field.id}`}
                  value={field.placeholder || ""}
                  onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                />
              </div>
            </div>

            {(field.type === "select" || field.type === "radio") && (
              <div>
                <Label>Options</Label>
                <div className="space-y-2">
                  {field.options?.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(field.options || [])];
                          newOptions[index] = e.target.value;
                          updateField(field.id, { options: newOptions });
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newOptions = field.options?.filter((_, i) => i !== index);
                          updateField(field.id, { options: newOptions });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newOptions = [
                        ...(field.options || []),
                        `Option ${(field.options?.length || 0) + 1}`,
                      ];
                      updateField(field.id, { options: newOptions });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id={`required-${field.id}`}
                checked={field.required}
                onCheckedChange={(checked) => updateField(field.id, { required: checked })}
              />
              <Label htmlFor={`required-${field.id}`}>Required field</Label>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Form Builder</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (previewMode) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{template.title}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </div>
              <Button onClick={() => setPreviewMode(false)}>Exit Preview</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {template.fields.map((field) => renderField(field, true))}

            {template.legal_text && (
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-2">Legal Information</h3>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {template.legal_text}
                </div>
              </div>
            )}

            {template.footer_text && (
              <div className="border-t pt-4">
                <div className="text-sm text-muted-foreground">{template.footer_text}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Form Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Consent Form Builder
          </CardTitle>
          <CardDescription>
            Create and customize consent forms with drag-and-drop field builder
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="title">Form Title</Label>
              <Input
                id="title"
                value={template.title}
                onChange={(e) => setTemplate((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Enter form title"
              />
            </div>
            <div>
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                value={template.version}
                onChange={(e) => setTemplate((prev) => ({ ...prev, version: e.target.value }))}
                placeholder="1.0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={template.description}
              onChange={(e) => setTemplate((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the purpose of this form"
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="form-type">Form Type</Label>
              <Select
                value={template.form_type}
                onValueChange={(value: any) =>
                  setTemplate((prev) => ({ ...prev, form_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select form type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="treatment">Treatment Consent</SelectItem>
                  <SelectItem value="photography">Photography Consent</SelectItem>
                  <SelectItem value="data_processing">Data Processing</SelectItem>
                  <SelectItem value="research">Research Participation</SelectItem>
                  <SelectItem value="general">General Consent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Switch
                id="is-active"
                checked={template.is_active}
                onCheckedChange={(checked) =>
                  setTemplate((prev) => ({ ...prev, is_active: checked }))
                }
              />
              <Label htmlFor="is-active">Active template</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Field Palette */}
      <Card>
        <CardHeader>
          <CardTitle>Field Types</CardTitle>
          <CardDescription>Drag fields to add them to your form</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-4 lg:grid-cols-8">
            {FIELD_TYPES.map((fieldType) => {
              const Icon = fieldType.icon;
              return (
                <Button
                  key={fieldType.value}
                  variant="outline"
                  onClick={() => addField(fieldType.value as FormField["type"])}
                  className="h-auto p-3 flex flex-col items-center gap-2"
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs">{fieldType.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Form Fields */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Form Fields ({template.fields.length})</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPreviewMode(true)}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline" onClick={duplicateTemplate}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {template.fields.length === 0 ? (
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                No fields added yet. Use the field types above to start building your form.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {template.fields.sort((a, b) => a.order - b.order).map((field) => renderField(field))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legal Text */}
      <Card>
        <CardHeader>
          <CardTitle>Legal Information</CardTitle>
          <CardDescription>Add legal text and disclaimers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="legal-text">Legal Text</Label>
            <Textarea
              id="legal-text"
              value={template.legal_text}
              onChange={(e) => setTemplate((prev) => ({ ...prev, legal_text: e.target.value }))}
              placeholder="Enter legal disclaimers, terms, and conditions..."
              rows={6}
            />
          </div>
          <div>
            <Label htmlFor="footer-text">Footer Text</Label>
            <Textarea
              id="footer-text"
              value={template.footer_text}
              onChange={(e) => setTemplate((prev) => ({ ...prev, footer_text: e.target.value }))}
              placeholder="Footer information, contact details, etc."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={saveTemplate} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Template"}
        </Button>
        <Button variant="outline" onClick={() => setPreviewMode(true)}>
          <Eye className="h-4 w-4 mr-2" />
          Preview Form
        </Button>
      </div>
    </div>
  );
}
