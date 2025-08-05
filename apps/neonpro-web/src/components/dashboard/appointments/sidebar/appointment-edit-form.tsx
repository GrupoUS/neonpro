// components/dashboard/appointments/sidebar/appointment-edit-form.tsx
// Appointment edit form for sidebar
// Story 1.1 Task 5 - Appointment Details Modal/Sidebar

"use client";

import type { zodResolver } from "@hookform/resolvers/zod";
import type { format } from "date-fns";
import type { ptBR } from "date-fns/locale";
import type { AlertCircle, Loader2, Save } from "lucide-react";
import type { useEffect, useState } from "react";
import type { useForm } from "react-hook-form";
import type { toast } from "sonner";
import type { z } from "zod";
import type {
  AppointmentWithDetails,
  ConflictCheckResponse,
  UpdateAppointmentFormData,
  UpdateAppointmentResponse,
} from "@/app/lib/types/appointments";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  Form,
  FormControl,
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
import type { Separator } from "@/components/ui/separator";
import type { Textarea } from "@/components/ui/textarea";

// Form validation schema
const appointmentEditSchema = z.object({
  patient_id: z.string().min(1, "Paciente é obrigatório"),
  professional_id: z.string().min(1, "Profissional é obrigatório"),
  service_type_id: z.string().min(1, "Tipo de serviço é obrigatório"),
  start_time: z.string().min(1, "Data e horário são obrigatórios"),
  status: z.enum(["scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show"]),
  notes: z.string().optional(),
  internal_notes: z.string().optional(),
  change_reason: z.string().min(1, "Motivo da alteração é obrigatório"),
});

type AppointmentEditFormData = z.infer<typeof appointmentEditSchema>;
interface AppointmentEditFormProps {
  appointment: AppointmentWithDetails;
  onUpdate: (appointment: AppointmentWithDetails) => void;
  onCancel: () => void;
  isUpdating?: boolean;
}

export default function AppointmentEditForm({
  appointment,
  onUpdate,
  onCancel,
  isUpdating = false,
}: AppointmentEditFormProps) {
  const [patients, setPatients] = useState<Array<{ id: string; full_name: string }>>([]);
  const [professionals, setProfessionals] = useState<Array<{ id: string; full_name: string }>>([]);
  const [services, setServices] = useState<
    Array<{ id: string; name: string; duration_minutes: number }>
  >([]);
  const [conflictError, setConflictError] = useState<string>("");
  const [checkingConflict, setCheckingConflict] = useState(false);

  const form = useForm<AppointmentEditFormData>({
    resolver: zodResolver(appointmentEditSchema),
    defaultValues: {
      patient_id: appointment.patient_id,
      professional_id: appointment.professional_id,
      service_type_id: appointment.service_type_id,
      start_time: format(new Date(appointment.start_time), "yyyy-MM-dd'T'HH:mm"),
      status: appointment.status,
      notes: appointment.notes || "",
      internal_notes: appointment.internal_notes || "",
      change_reason: "",
    },
  });

  // Load reference data
  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        // Load patients, professionals, and services
        const [patientsRes, professionalsRes, servicesRes] = await Promise.all([
          fetch("/api/patients"),
          fetch("/api/professionals"),
          fetch("/api/services"),
        ]);

        if (patientsRes.ok) {
          const patientsData = await patientsRes.json();
          setPatients(patientsData.data || []);
        }

        if (professionalsRes.ok) {
          const professionalsData = await professionalsRes.json();
          setProfessionals(professionalsData.data || []);
        }

        if (servicesRes.ok) {
          const servicesData = await servicesRes.json();
          setServices(servicesData.data || []);
        }
      } catch (error) {
        console.error("Error loading reference data:", error);
        toast.error("Erro ao carregar dados de referência");
      }
    };

    loadReferenceData();
  }, []); // Check for conflicts when time or professional changes
  const checkConflicts = async (professionalId: string, startTime: string, serviceId: string) => {
    if (!professionalId || !startTime || !serviceId) return;

    try {
      setCheckingConflict(true);
      setConflictError("");

      const selectedService = services.find((s) => s.id === serviceId);
      if (!selectedService) return;

      const endTime = new Date(
        new Date(startTime).getTime() + selectedService.duration_minutes * 60000,
      ).toISOString();

      const response = await fetch("/api/appointments/check-conflicts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professional_id: professionalId,
          start_time: startTime,
          end_time: endTime,
          exclude_appointment_id: appointment.id,
        }),
      });

      const data: ConflictCheckResponse = await response.json();

      if (data.has_conflict && data.conflicting_appointments?.length) {
        const conflicts = data.conflicting_appointments
          .map(
            (c) =>
              `${c.patient_name} (${format(new Date(c.start_time), "HH:mm", { locale: ptBR })})`,
          )
          .join(", ");
        setConflictError(`Conflito detectado com: ${conflicts}`);
      }
    } catch (error) {
      console.error("Error checking conflicts:", error);
    } finally {
      setCheckingConflict(false);
    }
  };

  // Watch form changes for conflict checking
  const watchedValues = form.watch(["professional_id", "start_time", "service_type_id"]);

  useEffect(() => {
    const [professionalId, startTime, serviceId] = watchedValues;
    if (professionalId && startTime && serviceId) {
      // Debounce conflict check
      const timer = setTimeout(() => {
        checkConflicts(professionalId, startTime, serviceId);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [watchedValues]); // Handle form submission
  const onSubmit = async (data: AppointmentEditFormData) => {
    if (conflictError) {
      toast.error("Resolva os conflitos antes de continuar");
      return;
    }

    try {
      const selectedService = services.find((s) => s.id === data.service_type_id);
      if (!selectedService) {
        toast.error("Serviço não encontrado");
        return;
      }

      const startTime = new Date(data.start_time);
      const endTime = new Date(startTime.getTime() + selectedService.duration_minutes * 60000);

      const updateData: UpdateAppointmentFormData = {
        patient_id: data.patient_id,
        professional_id: data.professional_id,
        service_type_id: data.service_type_id,
        start_time: startTime,
        end_time: endTime,
        status: data.status,
        notes: data.notes,
        internal_notes: data.internal_notes,
        change_reason: data.change_reason,
      };

      const response = await fetch(`/api/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const result: UpdateAppointmentResponse = await response.json();

      if (!response.ok || !result.success) {
        if (result.conflicts?.length) {
          const conflicts = result.conflicts
            .map(
              (c) =>
                `${c.patient_name} (${format(new Date(c.start_time), "HH:mm", { locale: ptBR })})`,
            )
            .join(", ");
          setConflictError(`Conflito detectado: ${conflicts}`);
          return;
        }

        throw new Error(result.error_message || "Erro ao atualizar agendamento");
      }

      if (result.data) {
        onUpdate(result.data);
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast.error("Erro ao atualizar agendamento");
    }
  };
  const statusOptions = [
    { value: "scheduled", label: "Agendado" },
    { value: "confirmed", label: "Confirmado" },
    { value: "in_progress", label: "Em Andamento" },
    { value: "completed", label: "Concluído" },
    { value: "cancelled", label: "Cancelado" },
    { value: "no_show", label: "Não Compareceu" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Editar Agendamento</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Conflict Alert */}
              {(conflictError || checkingConflict) && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {checkingConflict ? "Verificando conflitos..." : conflictError}
                  </AlertDescription>
                </Alert>
              )}
              {/* Patient Selection */}
              <FormField
                control={form.control}
                name="patient_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paciente</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o paciente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />{" "}
              {/* Professional Selection */}
              <FormField
                control={form.control}
                name="professional_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profissional</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o profissional" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {professionals.map((professional) => (
                          <SelectItem key={professional.id} value={professional.id}>
                            {professional.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Service Selection */}
              <FormField
                control={form.control}
                name="service_type_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serviço</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o serviço" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name} ({Math.floor(service.duration_minutes / 60)}h
                            {service.duration_minutes % 60}min)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />{" "}
              {/* Date and Time */}
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data e Horário</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Change Reason */}
              <FormField
                control={form.control}
                name="change_reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivo da Alteração *</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descreva o motivo da alteração..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />{" "}
              <Separator />
              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações do Cliente</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Observações visíveis ao cliente..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="internal_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações Internas</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Observações internas da equipe..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isUpdating || !!conflictError || checkingConflict}
                  className="flex-1"
                >
                  {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </Button>
                <Button type="button" variant="outline" onClick={onCancel} disabled={isUpdating}>
                  Cancelar
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
