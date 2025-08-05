/**
 * Treatment Plan Form Component
 * FHIR R4 compliant form for creating and editing treatment plans
 * Includes LGPD compliance and Brazilian healthcare validation
 *
 * Created: January 26, 2025
 * Story: 3.2 - Treatment & Procedure Documentation
 */

"use client";

import type { zodResolver } from "@hookform/resolvers/zod";
import type { format } from "date-fns";
import type { ptBR } from "date-fns/locale";
import type { ArrowLeft, CalendarIcon, Plus, Save, X } from "lucide-react";
import type { useEffect, useState } from "react";
import type { useForm } from "react-hook-form";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Calendar } from "@/components/ui/calendar";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import type { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Separator } from "@/components/ui/separator";
import type { Textarea } from "@/components/ui/textarea";
import type { useToast } from "@/hooks/use-toast";
import type { searchPatients } from "@/lib/supabase/patients";
import type { createTreatmentPlan, updateTreatmentPlan } from "@/lib/supabase/treatments";
import type { Patient } from "@/lib/types/fhir";
import type {
  CreateTreatmentPlanData,
  createTreatmentPlanSchema,
  TreatmentPlan,
  TreatmentPlanActivity,
  TreatmentPlanIntent,
  TreatmentPlanStatus,
} from "@/lib/types/treatment";
import type { cn } from "@/lib/utils";

interface TreatmentPlanFormProps {
  treatmentPlan?: TreatmentPlan;
  patientId?: string;
  onSuccess?: (treatmentPlan: TreatmentPlan) => void;
  onCancel?: () => void;
}

const statusOptions: { value: TreatmentPlanStatus; label: string }[] = [
  { value: "draft", label: "Rascunho" },
  { value: "active", label: "Ativo" },
  { value: "on-hold", label: "Em Pausa" },
  { value: "completed", label: "Concluído" },
  { value: "revoked", label: "Cancelado" },
];

const intentOptions: { value: TreatmentPlanIntent; label: string }[] = [
  { value: "proposal", label: "Proposta" },
  { value: "plan", label: "Plano" },
  { value: "order", label: "Ordem" },
  { value: "directive", label: "Diretiva" },
];

const commonActivities = [
  "Consulta inicial",
  "Avaliação estética",
  "Procedimento de limpeza de pele",
  "Aplicação de botox",
  "Preenchimento facial",
  "Peeling químico",
  "Tratamento a laser",
  "Massagem relaxante",
  "Drenagem linfática",
  "Consulta de retorno",
  "Avaliação de resultados",
];

export function TreatmentPlanForm({
  treatmentPlan,
  patientId: initialPatientId,
  onSuccess,
  onCancel,
}: TreatmentPlanFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activities, setActivities] = useState<TreatmentPlanActivity[]>(
    treatmentPlan?.activities || [],
  );

  // Form setup
  const form = useForm<CreateTreatmentPlanData>({
    resolver: zodResolver(createTreatmentPlanSchema),
    defaultValues: {
      patient_id: treatmentPlan?.patient_id || initialPatientId || "",
      title: treatmentPlan?.title || "",
      description: treatmentPlan?.description || "",
      status: treatmentPlan?.status || "draft",
      intent: treatmentPlan?.intent || "plan",
      period_start: treatmentPlan?.period_start || "",
      period_end: treatmentPlan?.period_end || "",
      goals: treatmentPlan?.goals || [],
    },
  });

  // Load patients on mount
  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const response = await searchPatients({}, 1, 100);
      setPatients(response.patients);
    } catch (error) {
      console.error("Erro ao carregar pacientes:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de pacientes.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: CreateTreatmentPlanData) => {
    try {
      setLoading(true);

      const treatmentPlanData = {
        ...data,
        activities,
      };

      let result: TreatmentPlan;

      if (treatmentPlan) {
        result = await updateTreatmentPlan(treatmentPlan.id, treatmentPlanData);
        toast({
          title: "Sucesso",
          description: "Plano de tratamento atualizado com sucesso.",
        });
      } else {
        result = await createTreatmentPlan(treatmentPlanData);
        toast({
          title: "Sucesso",
          description: "Plano de tratamento criado com sucesso.",
        });
      }

      onSuccess?.(result);
    } catch (error) {
      console.error("Erro ao salvar plano de tratamento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o plano de tratamento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addActivity = (activityName: string) => {
    const newActivity: TreatmentPlanActivity = {
      id: crypto.randomUUID(),
      title: activityName,
      description: "",
      status: "not-started",
      scheduled_date: "",
    };
    setActivities((prev) => [...prev, newActivity]);
  };

  const updateActivity = (id: string, updates: Partial<TreatmentPlanActivity>) => {
    setActivities((prev) =>
      prev.map((activity) => (activity.id === id ? { ...activity, ...updates } : activity)),
    );
  };

  const removeActivity = (id: string) => {
    setActivities((prev) => prev.filter((activity) => activity.id !== id));
  };

  const addGoal = () => {
    const currentGoals = form.getValues("goals");
    form.setValue("goals", [...currentGoals, ""]);
  };

  const updateGoal = (index: number, value: string) => {
    const currentGoals = form.getValues("goals");
    const newGoals = [...currentGoals];
    newGoals[index] = value;
    form.setValue("goals", newGoals);
  };

  const removeGoal = (index: number) => {
    const currentGoals = form.getValues("goals");
    form.setValue(
      "goals",
      currentGoals.filter((_, i) => i !== index),
    );
  };

  const selectedPatient = patients.find((p) => p.id === form.watch("patient_id"));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">
            {treatmentPlan ? "Editar Plano de Tratamento" : "Novo Plano de Tratamento"}
          </h2>
          <p className="text-muted-foreground">
            Crie um plano de tratamento seguindo padrões HL7 FHIR R4
          </p>
        </div>

        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Patient Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Paciente</CardTitle>
              <CardDescription>Selecione o paciente para este plano de tratamento</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="patient_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paciente *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!!initialPatientId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um paciente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.given_name?.[0]} {patient.family_name}
                            {patient.email && (
                              <span className="text-muted-foreground ml-2">({patient.email})</span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedPatient && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium">Paciente Selecionado</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedPatient.given_name?.[0]} {selectedPatient.family_name}
                  </p>
                  {selectedPatient.email && (
                    <p className="text-sm text-muted-foreground">{selectedPatient.email}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>Defina o título, descrição e configurações do plano</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Tratamento estético facial completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva detalhadamente o plano de tratamento..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Inclua objetivos, métodos e expectativas do tratamento
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

                <FormField
                  control={form.control}
                  name="intent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Intenção *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {intentOptions.map((option) => (
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
            </CardContent>
          </Card>{" "}
          {/* Period/Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Período de Tratamento</CardTitle>
              <CardDescription>Defina o período de duração do tratamento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="period_start"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Início</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), "dd/MM/yyyy", { locale: ptBR })
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => field.onChange(date?.toISOString().split("T")[0])}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="period_end"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Término (Opcional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), "dd/MM/yyyy", { locale: ptBR })
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => field.onChange(date?.toISOString().split("T")[0])}
                            disabled={(date) => {
                              const startDate = form.getValues("period_start");
                              return startDate ? date < new Date(startDate) : date < new Date();
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Deixe em branco para tratamento de duração indefinida
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          {/* Treatment Goals */}
          <Card>
            <CardHeader>
              <CardTitle>Objetivos do Tratamento</CardTitle>
              <CardDescription>
                Defina os objetivos e metas específicas deste tratamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {form.watch("goals").map((goal, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Ex: Reduzir rugas de expressão na região frontal"
                      value={goal}
                      onChange={(e) => updateGoal(index, e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeGoal(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addGoal} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Objetivo
              </Button>
            </CardContent>
          </Card>
          {/* Activities Management */}
          <Card>
            <CardHeader>
              <CardTitle>Atividades do Tratamento</CardTitle>
              <CardDescription>
                Adicione e configure as atividades que fazem parte deste plano
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Add Common Activities */}
              <div>
                <Label className="text-sm font-medium">Atividades Comuns</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {commonActivities.map((activity) => (
                    <Badge
                      key={activity}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => addActivity(activity)}
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      {activity}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Current Activities */}
              {activities.length > 0 && (
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Atividades Adicionadas</Label>
                  {activities.map((activity, index) => (
                    <Card key={activity.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Input
                            placeholder="Nome da atividade"
                            value={activity.title}
                            onChange={(e) => updateActivity(activity.id, { title: e.target.value })}
                            className="font-medium"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeActivity(activity.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <Textarea
                          placeholder="Descrição da atividade (opcional)"
                          value={activity.description}
                          onChange={(e) =>
                            updateActivity(activity.id, { description: e.target.value })
                          }
                          rows={2}
                        />

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <div>
                            <Label className="text-sm">Status</Label>
                            <Select
                              value={activity.status}
                              onValueChange={(value) =>
                                updateActivity(activity.id, { status: value as any })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="not-started">Não iniciado</SelectItem>
                                <SelectItem value="in-progress">Em andamento</SelectItem>
                                <SelectItem value="on-hold">Em pausa</SelectItem>
                                <SelectItem value="completed">Concluído</SelectItem>
                                <SelectItem value="cancelled">Cancelado</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-sm">Data Agendada (Opcional)</Label>
                            <Input
                              type="date"
                              value={activity.scheduled_date}
                              onChange={(e) =>
                                updateActivity(activity.id, { scheduled_date: e.target.value })
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Add Custom Activity */}
              <Button
                type="button"
                variant="outline"
                onClick={() => addActivity("Nova atividade")}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Atividade Personalizada
              </Button>
            </CardContent>
          </Card>
          {/* Form Actions */}
          <div className="flex justify-end space-x-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {treatmentPlan ? "Atualizar" : "Criar"} Plano
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
