/**
 * Procedure Management Component
 * FHIR R4 compliant component for documenting medical/aesthetic procedures
 * Follows Brazilian healthcare standards and LGPD compliance
 *
 * Created: January 26, 2025
 * Story: 3.2 - Treatment & Procedure Documentation
 */

"use client";

import type { zodResolver } from "@hookform/resolvers/zod";
import type { format } from "date-fns";
import type { ptBR } from "date-fns/locale";
import type {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  FileText,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Trash,
  User,
} from "lucide-react";
import type { useEffect, useState } from "react";
import type { useForm } from "react-hook-form";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Textarea } from "@/components/ui/textarea";
import type { useToast } from "@/hooks/use-toast";
import type { searchPatients } from "@/lib/supabase/patients";
import type {
  createProcedure,
  deleteProcedure,
  searchProcedures,
  updateProcedure,
} from "@/lib/supabase/treatments";
import type { Patient } from "@/lib/types/fhir";
import type {
  CreateProcedureData,
  createProcedureSchema,
  Procedure,
  ProcedureSearchFilters,
  ProcedureStatus,
} from "@/lib/types/treatment";

interface ProcedureManagementProps {
  treatmentPlanId?: string;
  patientId?: string;
  onSelectProcedure?: (procedure: Procedure) => void;
}

const statusOptions: { value: ProcedureStatus; label: string; color: string }[] = [
  { value: "preparation", label: "Preparação", color: "bg-blue-100 text-blue-800" },
  { value: "in-progress", label: "Em Andamento", color: "bg-yellow-100 text-yellow-800" },
  { value: "on-hold", label: "Em Pausa", color: "bg-orange-100 text-orange-800" },
  { value: "stopped", label: "Interrompido", color: "bg-red-100 text-red-800" },
  { value: "completed", label: "Concluído", color: "bg-green-100 text-green-800" },
  { value: "entered-in-error", label: "Erro", color: "bg-gray-100 text-gray-600" },
  { value: "unknown", label: "Desconhecido", color: "bg-gray-100 text-gray-600" },
];

const commonProcedures = [
  "Limpeza de pele profunda",
  "Aplicação de toxina botulínica",
  "Preenchimento com ácido hialurônico",
  "Peeling químico superficial",
  "Peeling químico médio",
  "Microagulhamento",
  "Laser CO2 fracionado",
  "IPL (Luz Intensa Pulsada)",
  "Radiofrequência facial",
  "Drenagem linfática manual",
  "Massagem relaxante",
  "Hidrafacial",
  "Criolipólise",
  "Carboxiterapia",
  "Mesoterapia facial",
];

export function ProcedureManagement({
  treatmentPlanId,
  patientId,
  onSelectProcedure,
}: ProcedureManagementProps) {
  const { toast } = useToast();

  // State management
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState<ProcedureSearchFilters>({
    treatment_plan_id: treatmentPlanId,
    patient_id: patientId,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(null);

  const perPage = 10;

  // Form setup
  const form = useForm<CreateProcedureData>({
    resolver: zodResolver(createProcedureSchema),
    defaultValues: {
      treatment_plan_id: treatmentPlanId || "",
      patient_id: patientId || "",
      code: "",
      display: "",
      status: "preparation",
      performed_date_time: "",
      performer_id: "",
      location: "",
      reason_code: "",
      reason_display: "",
      outcome: "",
      notes: "",
    },
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
    loadPatients();
  }, []);

  // Reload procedures when filters change
  useEffect(() => {
    loadProcedures();
  }, [filters, currentPage, searchText]);

  const loadData = async () => {
    await loadProcedures();
  };

  const loadProcedures = async () => {
    try {
      setLoading(true);
      const searchFilters = {
        ...filters,
        search_text: searchText || undefined,
      };

      const response = await searchProcedures(searchFilters, currentPage, perPage);
      setProcedures(response.procedures);
      setTotalCount(response.total_count);
    } catch (error) {
      console.error("Erro ao carregar procedimentos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os procedimentos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const response = await searchPatients({}, 1, 100);
      setPatients(response.patients);
    } catch (error) {
      console.error("Erro ao carregar pacientes:", error);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (key: keyof ProcedureSearchFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1);
  };

  const openCreateDialog = () => {
    setEditingProcedure(null);
    form.reset({
      treatment_plan_id: treatmentPlanId || "",
      patient_id: patientId || "",
      code: "",
      display: "",
      status: "preparation",
      performed_date_time: "",
      performer_id: "",
      location: "",
      reason_code: "",
      reason_display: "",
      outcome: "",
      notes: "",
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (procedure: Procedure) => {
    setEditingProcedure(procedure);
    form.reset({
      treatment_plan_id: procedure.treatment_plan_id,
      patient_id: procedure.patient_id,
      code: procedure.code,
      display: procedure.display,
      status: procedure.status,
      performed_date_time: procedure.performed_date_time || "",
      performer_id: procedure.performer_id || "",
      location: procedure.location || "",
      reason_code: procedure.reason_code || "",
      reason_display: procedure.reason_display || "",
      outcome: procedure.outcome || "",
      notes: procedure.notes || "",
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: CreateProcedureData) => {
    try {
      if (editingProcedure) {
        await updateProcedure(editingProcedure.id, data);
        toast({
          title: "Sucesso",
          description: "Procedimento atualizado com sucesso.",
        });
      } else {
        await createProcedure(data);
        toast({
          title: "Sucesso",
          description: "Procedimento criado com sucesso.",
        });
      }

      setIsDialogOpen(false);
      loadProcedures();
    } catch (error) {
      console.error("Erro ao salvar procedimento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o procedimento.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProcedure = async (procedure: Procedure) => {
    try {
      await deleteProcedure(procedure.id);
      toast({
        title: "Sucesso",
        description: "Procedimento excluído com sucesso.",
      });
      loadProcedures();
    } catch (error) {
      console.error("Erro ao excluir procedimento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o procedimento.",
        variant: "destructive",
      });
    }
  };

  const selectCommonProcedure = (procedureName: string) => {
    form.setValue("display", procedureName);
    form.setValue("code", procedureName.toLowerCase().replace(/\s+/g, "-"));
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const getStatusOption = (status: ProcedureStatus) => {
    return statusOptions.find((option) => option.value === status);
  };

  const totalPages = Math.ceil(totalCount / perPage);

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Procedimentos</h1>
          <p className="text-muted-foreground">
            Documentação de procedimentos seguindo padrões HL7 FHIR R4
          </p>
        </div>

        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Procedimento
        </Button>
      </div>
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar procedimentos..."
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          {!patientId && (
            <Select
              value={filters.patient_id || "all"}
              onValueChange={(value) =>
                handleFilterChange("patient_id", value === "all" ? undefined : value)
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Todos os pacientes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os pacientes</SelectItem>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.given_name?.[0]} {patient.family_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select
            value={filters.status?.[0] || "all"}
            onValueChange={(value) =>
              handleFilterChange("status", value === "all" ? undefined : [value as ProcedureStatus])
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>{" "}
      {/* Procedures Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Procedimentos</CardTitle>
          <CardDescription>Histórico de procedimentos realizados e agendados</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Carregando...</div>
            </div>
          ) : procedures.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Nenhum procedimento encontrado</h3>
                <p className="text-muted-foreground">Comece documentando um novo procedimento.</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Procedimento</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Realizada</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {procedures.map((procedure) => {
                  const statusOption = getStatusOption(procedure.status);
                  return (
                    <TableRow
                      key={procedure.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onSelectProcedure?.(procedure)}
                    >
                      <TableCell>
                        <div className="font-medium">{procedure.display}</div>
                        {procedure.reason_display && (
                          <div className="text-sm text-muted-foreground">
                            Motivo: {procedure.reason_display}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {/* @ts-ignore - patient relation from Supabase */}
                          {procedure.patient?.given_name?.[0]} {procedure.patient?.family_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        {statusOption && (
                          <Badge className={statusOption.color}>{statusOption.label}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {procedure.performed_date_time ? (
                          formatDateTime(procedure.performed_date_time)
                        ) : (
                          <span className="text-muted-foreground">Não realizado</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {procedure.location || <span className="text-muted-foreground">-</span>}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectProcedure?.(procedure);
                              }}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              Ver detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditDialog(procedure);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProcedure(procedure);
                              }}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {(currentPage - 1) * perPage + 1} a{" "}
                {Math.min(currentPage * perPage, totalCount)} de {totalCount} resultados
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <div className="text-sm">
                  Página {currentPage} de {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Create/Edit Procedure Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProcedure ? "Editar Procedimento" : "Novo Procedimento"}
            </DialogTitle>
            <DialogDescription>
              Documente um procedimento seguindo padrões HL7 FHIR R4
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Common Procedures Quick Selection */}
              <div className="space-y-3">
                <Label>Procedimentos Comuns</Label>
                <div className="flex flex-wrap gap-2">
                  {commonProcedures.map((procedure) => (
                    <Badge
                      key={procedure}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => selectCommonProcedure(procedure)}
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      {procedure}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="display"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Procedimento *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Limpeza de pele profunda" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código do Procedimento</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: limpeza-pele-profunda" {...field} />
                      </FormControl>
                      <FormDescription>Código interno para identificação</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Patient and Treatment Plan */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {!patientId && (
                  <FormField
                    control={form.control}
                    name="patient_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Paciente *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um paciente" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {patients.map((patient) => (
                              <SelectItem key={patient.id} value={patient.id}>
                                {patient.given_name?.[0]} {patient.family_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Date, Time and Location */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="performed_date_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data e Hora da Realização</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormDescription>Quando o procedimento foi ou será realizado</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Local</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Sala 1, Consultório principal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Reason */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="reason_display"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motivo/Indicação</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Pele oleosa com cravos" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="outcome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resultado</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Procedimento realizado com sucesso" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Adicione observações sobre o procedimento, reações do paciente, cuidados pós-procedimento..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Inclua informações importantes sobre a execução do procedimento
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Form Actions */}
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingProcedure ? "Atualizar" : "Criar"} Procedimento
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
