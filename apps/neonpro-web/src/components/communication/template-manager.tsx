"use client";

import React, { useState } from "react";
import type {
  Mail,
  MessageSquare,
  Smartphone,
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  Save,
  X,
} from "lucide-react";
import type { Button } from "@/components/ui/button";
import type { Input } from "@/components/ui/input";
import type { Textarea } from "@/components/ui/textarea";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Badge } from "@/components/ui/badge";
import type { Separator } from "@/components/ui/separator";
import type {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Label } from "@/components/ui/label";
import type { CommunicationTemplate } from "@/types/communication";
import type { createClient } from "@/lib/supabase/client";
import type { useToast } from "@/hooks/use-toast";
import type { cn } from "@/lib/utils";

export interface TemplateManagerProps {
  templates: CommunicationTemplate[];
  onTemplateUpdate: (template: CommunicationTemplate) => void;
  onTemplateDelete: (templateId: string) => void;
  className?: string;
}

interface TemplateFormData {
  name: string;
  type: "email" | "sms" | "push";
  category: string;
  subject?: string;
  content: string;
  variables: string[];
  is_active: boolean;
}

const TEMPLATE_TYPES = [
  { value: "email", label: "Email", icon: <Mail className="w-4 h-4" /> },
  { value: "sms", label: "SMS", icon: <Smartphone className="w-4 h-4" /> },
  { value: "push", label: "Push", icon: <MessageSquare className="w-4 h-4" /> },
];

const TEMPLATE_CATEGORIES = [
  "appointment_reminder",
  "appointment_confirmation",
  "treatment_followup",
  "payment_reminder",
  "results_available",
  "welcome",
  "birthday",
  "marketing",
  "emergency",
];

const AVAILABLE_VARIABLES = [
  "{{patient_name}}",
  "{{appointment_date}}",
  "{{appointment_time}}",
  "{{doctor_name}}",
  "{{clinic_name}}",
  "{{treatment_name}}",
  "{{payment_amount}}",
  "{{payment_due_date}}",
  "{{result_type}}",
  "{{emergency_contact}}",
];

export function TemplateManager({
  templates,
  onTemplateUpdate,
  onTemplateDelete,
  className,
}: TemplateManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<CommunicationTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<CommunicationTemplate | null>(null);
  const [formData, setFormData] = useState<TemplateFormData>({
    name: "",
    type: "email",
    category: "appointment_reminder",
    subject: "",
    content: "",
    variables: [],
    is_active: true,
  });
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();
  const supabase = createClient();

  // Abrir editor de template
  const openEditor = (template?: CommunicationTemplate) => {
    if (template) {
      setSelectedTemplate(template);
      setFormData({
        name: template.name,
        type: template.type as "email" | "sms" | "push",
        category: template.category,
        subject: template.subject || "",
        content: template.content,
        variables: template.variables || [],
        is_active: template.is_active,
      });
    } else {
      setSelectedTemplate(null);
      setFormData({
        name: "",
        type: "email",
        category: "appointment_reminder",
        subject: "",
        content: "",
        variables: [],
        is_active: true,
      });
    }
    setIsEditing(true);
  };

  // Fechar editor
  const closeEditor = () => {
    setIsEditing(false);
    setSelectedTemplate(null);
    setFormData({
      name: "",
      type: "email",
      category: "appointment_reminder",
      subject: "",
      content: "",
      variables: [],
      is_active: true,
    });
  };

  // Salvar template
  const saveTemplate = async () => {
    setLoading(true);

    try {
      // Extrair variáveis do conteúdo
      const variableMatches = formData.content.match(/\{\{[^}]+\}\}/g) || [];
      const extractedVariables = [...new Set(variableMatches)];

      const templateData = {
        ...formData,
        variables: extractedVariables,
        clinic_id: "clinic-id", // TODO: Obter do contexto
        updated_at: new Date().toISOString(),
      };

      let response;

      if (selectedTemplate) {
        // Atualizar template existente
        response = await supabase
          .from("communication_templates")
          .update(templateData)
          .eq("id", selectedTemplate.id)
          .select()
          .single();
      } else {
        // Criar novo template
        response = await supabase
          .from("communication_templates")
          .insert({
            ...templateData,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();
      }

      if (response.error) throw response.error;

      onTemplateUpdate(response.data);
      closeEditor();

      toast({
        title: selectedTemplate ? "Template atualizado" : "Template criado",
        description: "Template salvo com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar template",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Deletar template
  const deleteTemplate = async (templateId: string) => {
    setLoading(true);

    try {
      const { error } = await supabase
        .from("communication_templates")
        .delete()
        .eq("id", templateId);

      if (error) throw error;

      onTemplateDelete(templateId);

      toast({
        title: "Template deletado",
        description: "Template removido com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao deletar template",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Duplicar template
  const duplicateTemplate = (template: CommunicationTemplate) => {
    openEditor({
      ...template,
      id: "",
      name: `${template.name} (Cópia)`,
      created_at: "",
      updated_at: "",
    } as CommunicationTemplate);
  };

  // Renderizar preview do template
  const renderPreview = (template: CommunicationTemplate) => {
    const sampleData = {
      "{{patient_name}}": "João Silva",
      "{{appointment_date}}": "15/03/2024",
      "{{appointment_time}}": "14:30",
      "{{doctor_name}}": "Dra. Maria Santos",
      "{{clinic_name}}": "NeonPro Clinic",
      "{{treatment_name}}": "Limpeza de Pele",
      "{{payment_amount}}": "R$ 250,00",
      "{{payment_due_date}}": "20/03/2024",
      "{{result_type}}": "Exame de Sangue",
      "{{emergency_contact}}": "(11) 99999-9999",
    };

    let previewContent = template.content;
    Object.entries(sampleData).forEach(([variable, value]) => {
      previewContent = previewContent.replace(new RegExp(variable, "g"), value);
    });

    return previewContent;
  };

  // Inserir variável no conteúdo
  const insertVariable = (variable: string) => {
    const textarea = document.getElementById("template-content") as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent =
        formData.content.substring(0, start) + variable + formData.content.substring(end);
      setFormData((prev) => ({ ...prev, content: newContent }));

      // Refocar e posicionar cursor
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Templates de Comunicação</h2>
          <p className="text-muted-foreground">
            Gerencie templates para emails, SMS e notificações push
          </p>
        </div>
        <Button onClick={() => openEditor()}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Template
        </Button>
      </div>

      {/* Lista de templates */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    {TEMPLATE_TYPES.find((t) => t.value === template.type)?.icon}
                    <Badge variant="outline">
                      {TEMPLATE_TYPES.find((t) => t.value === template.type)?.label}
                    </Badge>
                    <Badge variant={template.is_active ? "default" : "secondary"}>
                      {template.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Categoria: {template.category.replace("_", " ")}
                </p>

                {template.subject && (
                  <div>
                    <Label className="text-xs">Assunto:</Label>
                    <p className="text-sm truncate">{template.subject}</p>
                  </div>
                )}

                <div>
                  <Label className="text-xs">Conteúdo:</Label>
                  <p className="text-sm text-muted-foreground line-clamp-3">{template.content}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => setPreviewTemplate(template)}>
                      <Eye className="w-3 h-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Preview - {template.name}</DialogTitle>
                      <DialogDescription>Visualização com dados de exemplo</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {template.subject && (
                        <div>
                          <Label>Assunto:</Label>
                          <p className="font-medium">{template.subject}</p>
                        </div>
                      )}
                      <div>
                        <Label>Conteúdo:</Label>
                        <div className="mt-2 p-4 bg-muted rounded-lg whitespace-pre-wrap">
                          {renderPreview(template)}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button variant="ghost" size="sm" onClick={() => openEditor(template)}>
                  <Edit className="w-3 h-3" />
                </Button>

                <Button variant="ghost" size="sm" onClick={() => duplicateTemplate(template)}>
                  <Copy className="w-3 h-3" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteTemplate(template.id)}
                  disabled={loading}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Editor de template */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTemplate ? "Editar Template" : "Novo Template"}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-6">
            {/* Formulário */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="template-name">Nome do Template</Label>
                <Input
                  id="template-name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Lembrete de Consulta"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="template-type">Tipo</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: "email" | "sms" | "push") =>
                      setFormData((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEMPLATE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            {type.icon}
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="template-category">Categoria</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEMPLATE_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.type === "email" && (
                <div>
                  <Label htmlFor="template-subject">Assunto</Label>
                  <Input
                    id="template-subject"
                    value={formData.subject}
                    onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                    placeholder="Ex: Lembrete: Consulta agendada para {{appointment_date}}"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="template-content">Conteúdo</Label>
                <Textarea
                  id="template-content"
                  value={formData.content}
                  onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Digite o conteúdo do template..."
                  rows={8}
                />
              </div>

              <div>
                <Label>Variáveis Disponíveis</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {AVAILABLE_VARIABLES.map((variable) => (
                    <Button
                      key={variable}
                      variant="outline"
                      size="sm"
                      onClick={() => insertVariable(variable)}
                      type="button"
                    >
                      {variable}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-4">
              <div>
                <Label>Preview</Label>
                <div className="mt-2 p-4 bg-muted rounded-lg min-h-[200px]">
                  {formData.subject && (
                    <div className="mb-4">
                      <strong>Assunto:</strong>
                      <p>{formData.subject}</p>
                    </div>
                  )}
                  <div>
                    <strong>Conteúdo:</strong>
                    <div className="mt-2 whitespace-pre-wrap">
                      {formData.content || "Digite o conteúdo para ver o preview..."}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeEditor}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={saveTemplate}
              disabled={loading || !formData.name || !formData.content}
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Salvando..." : "Salvar Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
