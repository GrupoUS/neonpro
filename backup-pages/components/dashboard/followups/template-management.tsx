// =====================================================================================
// TEMPLATE MANAGEMENT COMPONENT
// Epic 7.3: Component for managing follow-up message templates
// =====================================================================================

"use client";

import {
  useCreateTemplate,
  useDeleteTemplate,
  useTemplates,
  useUpdateTemplate,
} from "@/app/hooks/use-treatment-followups";
import type {
  CommunicationMethod,
  FollowupTemplate,
  FollowupType,
  ResponseType,
} from "@/app/types/treatment-followups";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  EditIcon,
  FilterIcon,
  MessageSquareIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// =====================================================================================
// VALIDATION SCHEMA
// =====================================================================================

const templateFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Máximo 100 caracteres"),
  description: z.string().optional(),
  treatment_type: z.string().min(1, "Tipo de tratamento é obrigatório"),
  followup_type: z.enum([
    "post_treatment",
    "progress_check", 
    "satisfaction",
    "maintenance",
    "care_instructions",
    "warning_check"
  ]),
  timing_days: z.number().min(0, "Dias não pode ser negativo").max(365, "Máximo 365 dias"),
  timing_hours: z.number().min(0, "Horas não pode ser negativo").max(23, "Máximo 23 horas"),
  message_content: z.string().min(1, "Mensagem é obrigatória").max(2000, "Máximo 2000 caracteres"),
  communication_method: z.enum(["sms", "email", "whatsapp", "call", "in_person"]),
  requires_response: z.boolean(),
  response_type: z.enum([
    "satisfaction_rating",
    "yes_no", 
    "text",
    "photo",
    "scale_1_10",
    "multiple_choice"
  ]).optional(),
  active: z.boolean(),
});

type TemplateFormData = z.infer<typeof templateFormSchema>;

// =====================================================================================
// INTERFACES
// =====================================================================================

interface TemplateManagementProps {
  clinicId: string;
}

interface TemplateDialogProps {
  template?: FollowupTemplate;
  onSave: (data: TemplateFormData) => void;
  isLoading: boolean;
  trigger: React.ReactNode;
}

// =====================================================================================
// MAIN COMPONENT
// =====================================================================================

export default function TemplateManagement({ clinicId }: TemplateManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTreatmentType, setFilterTreatmentType] = useState<string>("");
  const [filterFollowupType, setFilterFollowupType] = useState<FollowupType | "">("");
  const [filterCommunicationMethod, setFilterCommunicationMethod] = useState<CommunicationMethod | "">("");

  // Queries
  const { data: templates, isLoading } = useTemplates(clinicId);
  const createTemplateMutation = useCreateTemplate();
  const updateTemplateMutation = useUpdateTemplate();
  const deleteTemplateMutation = useDeleteTemplate();

  // Filter templates
  const filteredTemplates = templates?.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.treatment_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.message_content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTreatmentType = !filterTreatmentType || template.treatment_type === filterTreatmentType;
    const matchesFollowupType = !filterFollowupType || template.followup_type === filterFollowupType;
    const matchesCommunicationMethod = !filterCommunicationMethod || template.communication_method === filterCommunicationMethod;

    return matchesSearch && matchesTreatmentType && matchesFollowupType && matchesCommunicationMethod;
  }) || [];

  // Get unique treatment types
  const treatmentTypes = Array.from(new Set(templates?.map(t => t.treatment_type) || []));

  // Event handlers
  const handleCreateTemplate = (data: TemplateFormData) => {
    createTemplateMutation.mutate({
      ...data,
      clinic_id: clinicId,
      created_by: "current-user", // TODO: Get from auth context
    });
  };

  const handleUpdateTemplate = (template: FollowupTemplate) => (data: TemplateFormData) => {
    updateTemplateMutation.mutate({
      id: template.id,
      ...data,
    });
  };

  const handleDeleteTemplate = (template: FollowupTemplate) => {
    if (confirm(`Tem certeza que deseja excluir o template "${template.name}"?`)) {
      deleteTemplateMutation.mutate(template.id);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilterTreatmentType("");
    setFilterFollowupType("");
    setFilterCommunicationMethod("");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquareIcon className="h-5 w-5" />
              Templates de Mensagem
            </CardTitle>
          </div>
          <TemplateDialog
            onSave={handleCreateTemplate}
            isLoading={createTemplateMutation.isPending}
            trigger={
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                Novo Template
              </Button>
            }
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search and Filters */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterTreatmentType} onValueChange={setFilterTreatmentType}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo de Tratamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os Tratamentos</SelectItem>
              {treatmentTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterFollowupType} onValueChange={(value) => setFilterFollowupType(value as FollowupType | "")}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo de Follow-up" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os Tipos</SelectItem>
              <SelectItem value="post_treatment">Pós-Tratamento</SelectItem>
              <SelectItem value="progress_check">Verificação de Progresso</SelectItem>
              <SelectItem value="satisfaction">Satisfação</SelectItem>
              <SelectItem value="maintenance">Manutenção</SelectItem>
              <SelectItem value="care_instructions">Instruções de Cuidado</SelectItem>
              <SelectItem value="warning_check">Verificação de Alerta</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterCommunicationMethod} onValueChange={(value) => setFilterCommunicationMethod(value as CommunicationMethod | "")}>
            <SelectTrigger>
              <SelectValue placeholder="Método de Comunicação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os Métodos</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="call">Ligação</SelectItem>
              <SelectItem value="in_person">Presencial</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={clearFilters}>
            <FilterIcon className="h-4 w-4 mr-2" />
            Limpar Filtros
          </Button>
        </div>

        {/* Templates Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tratamento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Timing</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Carregando templates...
                  </TableCell>
                </TableRow>
              ) : filteredTemplates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Nenhum template encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{template.name}</div>
                        {template.description && (
                          <div className="text-sm text-gray-500 truncate max-w-[200px]">
                            {template.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{template.treatment_type}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getFollowupTypeLabel(template.followup_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {template.timing_days > 0 && `${template.timing_days}d `}
                        {template.timing_hours > 0 && `${template.timing_hours}h`}
                        {template.timing_days === 0 && template.timing_hours === 0 && "Imediato"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getCommunicationMethodLabel(template.communication_method)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={template.active ? "default" : "secondary"}>
                        {template.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <TemplateDialog
                          template={template}
                          onSave={handleUpdateTemplate(template)}
                          isLoading={updateTemplateMutation.isPending}
                          trigger={
                            <Button variant="outline" size="sm">
                              <EditIcon className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTemplate(template)}
                          disabled={deleteTemplateMutation.isPending}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Results Summary */}
        <div className="text-sm text-gray-500">
          Exibindo {filteredTemplates.length} de {templates?.length || 0} templates
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================================================
// TEMPLATE DIALOG COMPONENT
// =====================================================================================

function TemplateDialog({ template, onSave, isLoading, trigger }: TemplateDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: template?.name || "",
      description: template?.description || "",
      treatment_type: template?.treatment_type || "",
      followup_type: template?.followup_type || "post_treatment",
      timing_days: template?.timing_days || 1,
      timing_hours: template?.timing_hours || 0,
      message_content: template?.message_content || "",
      communication_method: template?.communication_method || "whatsapp",
      requires_response: template?.requires_response || false,
      response_type: template?.response_type,
      active: template?.active !== undefined ? template.active : true,
    },
  });

  const watchRequiresResponse = form.watch("requires_response");

  const handleSubmit = (data: TemplateFormData) => {
    onSave(data);
    if (!isLoading) {
      setOpen(false);
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? "Editar Template" : "Novo Template"}
          </DialogTitle>
          <DialogDescription>
            Configure um template de mensagem para follow-ups automáticos
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Template</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Follow-up Limpeza Facial" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="treatment_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Tratamento</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Limpeza Facial" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Descrição do template..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="followup_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Follow-up</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="post_treatment">Pós-Tratamento</SelectItem>
                        <SelectItem value="progress_check">Verificação de Progresso</SelectItem>
                        <SelectItem value="satisfaction">Satisfação</SelectItem>
                        <SelectItem value="maintenance">Manutenção</SelectItem>
                        <SelectItem value="care_instructions">Instruções de Cuidado</SelectItem>
                        <SelectItem value="warning_check">Verificação de Alerta</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="communication_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de Comunicação</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o método" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="call">Ligação</SelectItem>
                        <SelectItem value="in_person">Presencial</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="timing_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timing - Dias</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max="365"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Após quantos dias enviar o follow-up
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timing_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timing - Horas</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max="23"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Horas adicionais ao timing
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="message_content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conteúdo da Mensagem</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Digite a mensagem do follow-up..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Use variáveis como {"{nome}"}, {"{tratamento}"}, {"{data}"} para personalização
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="requires_response"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Requer Resposta</FormLabel>
                      <FormDescription>
                        Se o follow-up precisa de resposta do paciente
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {watchRequiresResponse && (
                <FormField
                  control={form.control}
                  name="response_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Resposta</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="satisfaction_rating">Avaliação de Satisfação</SelectItem>
                          <SelectItem value="yes_no">Sim/Não</SelectItem>
                          <SelectItem value="text">Texto Livre</SelectItem>
                          <SelectItem value="photo">Foto</SelectItem>
                          <SelectItem value="scale_1_10">Escala 1-10</SelectItem>
                          <SelectItem value="multiple_choice">Múltipla Escolha</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Template Ativo</FormLabel>
                      <FormDescription>
                        Se o template está disponível para uso
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : "Salvar Template"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// =====================================================================================
// UTILITY FUNCTIONS
// =====================================================================================

function getFollowupTypeLabel(type: FollowupType): string {
  const labels: Record<FollowupType, string> = {
    post_treatment: "Pós-Tratamento",
    progress_check: "Verificação",
    satisfaction: "Satisfação",
    maintenance: "Manutenção",
    care_instructions: "Instruções",
    warning_check: "Alerta",
  };
  return labels[type];
}

function getCommunicationMethodLabel(method: CommunicationMethod): string {
  const labels: Record<CommunicationMethod, string> = {
    sms: "SMS",
    email: "Email",
    whatsapp: "WhatsApp",
    call: "Ligação",
    in_person: "Presencial",
  };
  return labels[method];
}