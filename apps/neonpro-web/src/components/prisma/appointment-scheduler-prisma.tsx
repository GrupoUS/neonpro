"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  FileText,
  AlertTriangle,
  Save,
  X,
  CheckCircle,
} from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Validation schema for appointment creation
const appointmentSchema = z.object({
  clinic_id: z.string().uuid("Selecione uma clínica válida"),
  patient_id: z.string().uuid("Selecione um paciente"),
  provider_id: z.string().uuid("Selecione um profissional"),
  scheduled_at: z.string().min(1, "Data e hora são obrigatórias"),
  duration_minutes: z
    .number()
    .min(15, "Duração mínima de 15 minutos")
    .max(480, "Duração máxima de 8 horas"),
  appointment_type: z.string().min(1, "Tipo de consulta é obrigatório"),
  chief_complaint: z.string().optional(),
  notes: z.string().optional(),
});

type AppointmentData = z.infer<typeof appointmentSchema>;

interface AppointmentSchedulerProps {
  clinicId?: string;
  patientId?: string;
  providerId?: string;
  onSuccess?: (appointment: any) => void;
  onCancel?: () => void;
}

// Predefined appointment types for healthcare
const APPOINTMENT_TYPES = [
  { value: "consulta_inicial", label: "Consulta Inicial" },
  { value: "retorno", label: "Retorno" },
  { value: "emergencia", label: "Emergência" },
  { value: "procedimento", label: "Procedimento" },
  { value: "exame", label: "Exame" },
  { value: "cirurgia", label: "Cirurgia" },
  { value: "terapia", label: "Terapia" },
  { value: "avaliacao", label: "Avaliação" },
];

const DURATION_OPTIONS = [
  { value: 15, label: "15 minutos" },
  { value: 30, label: "30 minutos" },
  { value: 45, label: "45 minutos" },
  { value: 60, label: "1 hora" },
  { value: 90, label: "1h 30min" },
  { value: 120, label: "2 horas" },
];

export default function AppointmentSchedulerPrisma({
  clinicId,
  patientId,
  providerId,
  onSuccess,
  onCancel,
}: AppointmentSchedulerProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);

  const form = useForm<AppointmentData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      clinic_id: clinicId || "",
      patient_id: patientId || "",
      provider_id: providerId || "",
      scheduled_at: "",
      duration_minutes: 30,
      appointment_type: "",
      chief_complaint: "",
      notes: "",
    },
  });

  // Load patients and providers when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load patients
        const patientsResponse = await fetch("/api/prisma/patients?limit=100");
        if (patientsResponse.ok) {
          const patientsData = await patientsResponse.json();
          setPatients(patientsData.patients || []);
        }

        // In a real implementation, you'd have a providers endpoint
        // For now, we'll simulate some providers
        setProviders([
          { id: "provider-1", full_name: "Dr. João Silva", professional_title: "Cardiologista" },
          { id: "provider-2", full_name: "Dra. Maria Santos", professional_title: "Pediatra" },
          { id: "provider-3", full_name: "Dr. Carlos Lima", professional_title: "Clínico Geral" },
        ]);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, []);

  // Check for conflicts when date/time or provider changes
  const checkConflicts = async (scheduledAt: string, providerId: string, duration: number) => {
    if (!scheduledAt || !providerId) return;

    try {
      const endTime = new Date(new Date(scheduledAt).getTime() + duration * 60000);

      const params = new URLSearchParams({
        provider_id: providerId,
        date_from: scheduledAt,
        date_to: endTime.toISOString(),
        status: "scheduled,confirmed",
      });

      const response = await fetch(`/api/prisma/appointments?${params}`);
      if (response.ok) {
        const data = await response.json();
        setConflicts(data.appointments || []);
      }
    } catch (error) {
      console.error("Error checking conflicts:", error);
    }
  };

  // Watch for changes in scheduling fields to check conflicts
  const watchScheduledAt = form.watch("scheduled_at");
  const watchProviderId = form.watch("provider_id");
  const watchDuration = form.watch("duration_minutes");

  useEffect(() => {
    if (watchScheduledAt && watchProviderId && watchDuration) {
      checkConflicts(watchScheduledAt, watchProviderId, watchDuration);
    }
  }, [watchScheduledAt, watchProviderId, watchDuration]);

  const onSubmit = async (data: AppointmentData) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Check for conflicts one more time before submitting
      if (conflicts.length > 0) {
        setSubmitError("Existem conflitos de horário. Por favor, escolha outro horário.");
        return;
      }

      // Convert scheduled_at to ISO string
      const scheduledDate = new Date(data.scheduled_at).toISOString();

      const appointmentData = {
        ...data,
        scheduled_at: scheduledDate,
      };

      const response = await fetch("/api/prisma/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appointmentData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 409 && result.conflicts) {
          setConflicts(result.conflicts);
          throw new Error("Conflito de horário detectado. Por favor, escolha outro horário.");
        }
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      toast({
        title: "Consulta agendada com sucesso!",
        description: `Consulta marcada para ${new Date(scheduledDate).toLocaleString("pt-BR")}.`,
      });

      if (onSuccess) {
        onSuccess(result.appointment);
      } else {
        router.push(`/agenda`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      setSubmitError(errorMessage);
      toast({
        title: "Erro ao agendar consulta",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  // Generate minimum date/time (current time + 30 minutes)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    return now.toISOString().slice(0, 16);
  };

  const selectedPatient = patients.find((p) => p.id === form.watch("patient_id"));
  const selectedProvider = providers.find((p) => p.id === form.watch("provider_id"));

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-6 w-6 text-blue-600" />
          Agendar Nova Consulta (Prisma)
          <Badge variant="outline" className="ml-2">
            Verificação de Conflitos
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Error Alert */}
            {submitError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            {/* Conflict Warning */}
            {conflicts.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Conflito de horário detectado!</strong>
                  <br />
                  Já existe(m) {conflicts.length} consulta(s) agendada(s) neste horário para este
                  profissional. Por favor, escolha outro horário.
                </AlertDescription>
              </Alert>
            )}

            {/* Patient and Provider Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5" />
                Paciente e Profissional
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Patient Selection */}
                <FormField
                  control={form.control}
                  name="patient_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paciente *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o paciente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {patients.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id}>
                              <div className="flex flex-col">
                                <span>{patient.full_name}</span>
                                <span className="text-xs text-gray-500">
                                  {patient.medical_record_number || patient.id.slice(0, 8)}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedPatient && (
                        <FormDescription>
                          Prontuário: {selectedPatient.medical_record_number || "Não definido"}
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Provider Selection */}
                <FormField
                  control={form.control}
                  name="provider_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profissional *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o profissional" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {providers.map((provider) => (
                            <SelectItem key={provider.id} value={provider.id}>
                              <div className="flex flex-col">
                                <span>{provider.full_name}</span>
                                <span className="text-xs text-gray-500">
                                  {provider.professional_title}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedProvider && (
                        <FormDescription>
                          Especialidade: {selectedProvider.professional_title}
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Scheduling Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Agendamento
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Date and Time */}
                <FormField
                  control={form.control}
                  name="scheduled_at"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data e Hora *</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" min={getMinDateTime()} {...field} />
                      </FormControl>
                      <FormDescription>Mínimo: 30 minutos a partir de agora</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Duration */}
                <FormField
                  control={form.control}
                  name="duration_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duração *</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DURATION_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value.toString()}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Appointment Type */}
                <FormField
                  control={form.control}
                  name="appointment_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Consulta *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {APPOINTMENT_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Clinical Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Informações Clínicas
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Chief Complaint */}
                <FormField
                  control={form.control}
                  name="chief_complaint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Queixa Principal</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Motivo da consulta ou principais sintomas..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Descreva brevemente o motivo da consulta</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Notes */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Observações adicionais, preparações necessárias, etc."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Informações adicionais sobre a consulta</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Summary Card */}
            {watchScheduledAt && selectedPatient && selectedProvider && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-green-800">Resumo da Consulta</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p>
                        <strong>Paciente:</strong> {selectedPatient.full_name}
                      </p>
                      <p>
                        <strong>Profissional:</strong> {selectedProvider.full_name}
                      </p>
                    </div>
                    <div>
                      <p>
                        <strong>Data:</strong> {new Date(watchScheduledAt).toLocaleString("pt-BR")}
                      </p>
                      <p>
                        <strong>Duração:</strong> {watchDuration} minutos
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex gap-4 pt-6 border-t">
              <Button
                type="submit"
                disabled={isSubmitting || conflicts.length > 0}
                className="flex-1 gap-2"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? "Agendando..." : "Agendar Consulta"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
