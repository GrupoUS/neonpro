// =====================================================================================
// PROTOCOL MANAGEMENT COMPONENT
// Epic 7.3: Component for managing treatment protocols
// =====================================================================================

"use client";

import {
  useCreateProtocol,
  useDeleteProtocol,
  useProtocols,
  useUpdateProtocol,
} from "@/app/hooks/use-treatment-followups";
import type {
  FollowupScheduleItem,
  FollowupType,
  Priority,
  TreatmentProtocol,
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
  ClipboardListIcon,
  EditIcon,
  FilterIcon,
  MinusIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

// =====================================================================================
// VALIDATION SCHEMA
// =====================================================================================

const scheduleItemSchema = z.object({
  type: z.enum([
    "post_treatment",
    "progress_check", 
    "satisfaction",
    "maintenance",
    "care_instructions",
    "warning_check"
  ]),
  days: z.number().min(0, "Dias não pode ser negativo").max(365, "Máximo 365 dias"),
  hours: z.number().min(0, "Horas não pode ser negativo").max(23, "Máximo 23 horas"),
  priority: z.enum(["low", "normal", "high", "urgent"]),
  required: z.boolean().optional(),
  conditions: z.array(z.string()).optional(),
});

const protocolFormSchema = z.object({
  treatment_type: z.string().min(1, "Tipo de tratamento é obrigatório"),
  protocol_name: z.string().min(1, "Nome do protocolo é obrigatório").max(100, "Máximo 100 caracteres"),
  description: z.string().optional(),
  followup_schedule: z.array(scheduleItemSchema).min(1, "Pelo menos um follow-up é obrigatório"),
  care_instructions: z.string().optional(),
  warning_signs: z.string().optional(),
  expected_results: z.string().optional(),
  next_appointment_suggestion: z.number().min(1, "Sugestão deve ser pelo menos 1 dia").max(365, "Máximo 365 dias"),
  active: z.boolean(),
});

type ProtocolFormData = z.infer<typeof protocolFormSchema>;

// =====================================================================================
// INTERFACES
// =====================================================================================

interface ProtocolManagementProps {
  clinicId: string;
}

interface ProtocolDialogProps {
  protocol?: TreatmentProtocol;
  onSave: (data: ProtocolFormData) => void;
  isLoading: boolean;
  trigger: React.ReactNode;
}

// =====================================================================================
// MAIN COMPONENT
// =====================================================================================

export default function ProtocolManagement({ clinicId }: ProtocolManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTreatmentType, setFilterTreatmentType] = useState<string>("");

  // Queries
  const { data: protocols, isLoading } = useProtocols(clinicId);
  const createProtocolMutation = useCreateProtocol();
  const updateProtocolMutation = useUpdateProtocol();
  const deleteProtocolMutation = useDeleteProtocol();

  // Filter protocols
  const filteredProtocols = protocols?.filter((protocol) => {
    const matchesSearch = protocol.protocol_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         protocol.treatment_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (protocol.description && protocol.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTreatmentType = !filterTreatmentType || protocol.treatment_type === filterTreatmentType;

    return matchesSearch && matchesTreatmentType;
  }) || [];

  // Get unique treatment types
  const treatmentTypes = Array.from(new Set(protocols?.map(p => p.treatment_type) || []));

  // Event handlers
  const handleCreateProtocol = (data: ProtocolFormData) => {
    createProtocolMutation.mutate({
      ...data,
      clinic_id: clinicId,
      created_by: "current-user", // TODO: Get from auth context
    });
  };

  const handleUpdateProtocol = (protocol: TreatmentProtocol) => (data: ProtocolFormData) => {
    updateProtocolMutation.mutate({
      id: protocol.id,
      ...data,
    });
  };

  const handleDeleteProtocol = (protocol: TreatmentProtocol) => {
    if (confirm(`Tem certeza que deseja excluir o protocolo "${protocol.protocol_name}"?`)) {
      deleteProtocolMutation.mutate(protocol.id);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilterTreatmentType("");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ClipboardListIcon className="h-5 w-5" />
              Protocolos de Tratamento
            </CardTitle>
          </div>
          <ProtocolDialog
            onSave={handleCreateProtocol}
            isLoading={createProtocolMutation.isPending}
            trigger={
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                Novo Protocolo
              </Button>
            }
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search and Filters */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar protocolos..."
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

          <Button variant="outline" onClick={clearFilters}>
            <FilterIcon className="h-4 w-4 mr-2" />
            Limpar Filtros
          </Button>
        </div>

        {/* Protocols Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Protocolo</TableHead>
                <TableHead>Tratamento</TableHead>
                <TableHead>Follow-ups</TableHead>
                <TableHead>Próximo Agendamento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Carregando protocolos...
                  </TableCell>
                </TableRow>
              ) : filteredProtocols.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Nenhum protocolo encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredProtocols.map((protocol) => (
                  <TableRow key={protocol.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{protocol.protocol_name}</div>
                        {protocol.description && (
                          <div className="text-sm text-gray-500 truncate max-w-[200px]">
                            {protocol.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{protocol.treatment_type}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {protocol.followup_schedule.slice(0, 3).map((item, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {getFollowupTypeLabel(item.type)}
                          </Badge>
                        ))}
                        {protocol.followup_schedule.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{protocol.followup_schedule.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {protocol.next_appointment_suggestion} dias
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={protocol.active ? "default" : "secondary"}>
                        {protocol.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <ProtocolDialog
                          protocol={protocol}
                          onSave={handleUpdateProtocol(protocol)}
                          isLoading={updateProtocolMutation.isPending}
                          trigger={
                            <Button variant="outline" size="sm">
                              <EditIcon className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteProtocol(protocol)}
                          disabled={deleteProtocolMutation.isPending}
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
          Exibindo {filteredProtocols.length} de {protocols?.length || 0} protocolos
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================================================
// PROTOCOL DIALOG COMPONENT
// =====================================================================================

function ProtocolDialog({ protocol, onSave, isLoading, trigger }: ProtocolDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<ProtocolFormData>({
    resolver: zodResolver(protocolFormSchema),
    defaultValues: {
      treatment_type: protocol?.treatment_type || "",
      protocol_name: protocol?.protocol_name || "",
      description: protocol?.description || "",
      followup_schedule: protocol?.followup_schedule || [{
        type: "post_treatment",
        days: 1,
        hours: 0,
        priority: "normal",
        required: true,
      }],
      care_instructions: protocol?.care_instructions || "",
      warning_signs: protocol?.warning_signs || "",
      expected_results: protocol?.expected_results || "",
      next_appointment_suggestion: protocol?.next_appointment_suggestion || 30,
      active: protocol?.active !== undefined ? protocol.active : true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "followup_schedule",
  });

  const handleSubmit = (data: ProtocolFormData) => {
    onSave(data);
    if (!isLoading) {
      setOpen(false);
      form.reset();
    }
  };

  const addFollowupItem = () => {
    append({
      type: "progress_check",
      days: 7,
      hours: 0,
      priority: "normal",
      required: false,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {protocol ? "Editar Protocolo" : "Novo Protocolo"}
          </DialogTitle>
          <DialogDescription>
            Configure um protocolo de follow-ups para um tipo de tratamento
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid gap-4 md:grid-cols-2">
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

              <FormField
                control={form.control}
                name="protocol_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Protocolo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Protocolo Limpeza Facial Padrão" {...field} />
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
                    <Textarea placeholder="Descrição do protocolo..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Follow-up Schedule */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <FormLabel className="text-base">Cronograma de Follow-ups</FormLabel>
                  <p className="text-sm text-gray-500">Configure quando e como os follow-ups serão enviados</p>
                </div>
                <Button type="button" variant="outline" onClick={addFollowupItem}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Adicionar Follow-up
                </Button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <Card key={field.id} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Follow-up #{index + 1}</h4>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <MinusIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <FormField
                        control={form.control}
                        name={`followup_schedule.${index}.type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="post_treatment">Pós-Tratamento</SelectItem>
                                <SelectItem value="progress_check">Verificação</SelectItem>
                                <SelectItem value="satisfaction">Satisfação</SelectItem>
                                <SelectItem value="maintenance">Manutenção</SelectItem>
                                <SelectItem value="care_instructions">Instruções</SelectItem>
                                <SelectItem value="warning_check">Alerta</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`followup_schedule.${index}.days`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dias</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`followup_schedule.${index}.hours`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Horas</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0" 
                                max="23"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`followup_schedule.${index}.priority`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prioridade</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Baixa</SelectItem>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="high">Alta</SelectItem>
                                <SelectItem value="urgent">Urgente</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="mt-4">
                      <FormField
                        control={form.control}
                        name={`followup_schedule.${index}.required`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Follow-up obrigatório</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Additional Information */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="care_instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instruções de Cuidado</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Instruções para o paciente..."
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="warning_signs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sinais de Alerta</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Sinais que requerem atenção..."
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="expected_results"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resultados Esperados</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva os resultados esperados..."
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="next_appointment_suggestion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sugestão Próximo Agendamento (dias)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        max="365"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                      />
                    </FormControl>
                    <FormDescription>
                      Após quantos dias sugerir novo agendamento
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                      <FormLabel>Protocolo Ativo</FormLabel>
                      <FormDescription>
                        Se o protocolo está disponível para uso
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
                {isLoading ? "Salvando..." : "Salvar Protocolo"}
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

function getPriorityLabel(priority: Priority): string {
  const labels: Record<Priority, string> = {
    low: "Baixa",
    normal: "Normal",
    high: "Alta",
    urgent: "Urgente",
  };
  return labels[priority];
}