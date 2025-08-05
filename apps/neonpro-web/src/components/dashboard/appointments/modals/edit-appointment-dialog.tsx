"use client";

import type { zodResolver } from "@hookform/resolvers/zod";
import type { format } from "date-fns";
import type { ptBR } from "date-fns/locale";
import type { AlertCircle, Loader2, Save } from "lucide-react";
import type { useEffect, useState } from "react";
import type { useForm } from "react-hook-form";
import type { toast } from "sonner";
import type { z } from "zod";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Button } from "@/components/ui/button";
import type {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { Input } from "@/components/ui/input";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Textarea } from "@/components/ui/textarea";
import type { Appointment } from "@/hooks/use-appointments-manager";

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

interface EditAppointmentDialogProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updatedAppointment: Appointment) => void;
}

export function EditAppointmentDialog({
  appointment,
  open,
  onOpenChange,
  onUpdate,
}: EditAppointmentDialogProps) {
  const [patients, setPatients] = useState<Array<{ id: string; full_name: string }>>([]);
  const [professionals, setProfessionals] = useState<Array<{ id: string; full_name: string }>>([]);
  const [services, setServices] = useState<
    Array<{ id: string; name: string; duration_minutes: number }>
  >([]);
  const [conflictError, setConflictError] = useState<string>("");
  const [checkingConflict, setCheckingConflict] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const form = useForm<AppointmentEditFormData>({
    resolver: zodResolver(appointmentEditSchema),
    defaultValues: {
      patient_id: "",
      professional_id: "",
      service_type_id: "",
      start_time: "",
      status: "scheduled",
      notes: "",
      internal_notes: "",
      change_reason: "",
    },
  });

  // Reset form when appointment changes
  useEffect(() => {
    if (appointment && open) {
      form.reset({
        patient_id: appointment.patient_id,
        professional_id: appointment.professional_id,
        service_type_id: appointment.service_type_id,
        start_time: format(new Date(appointment.start_time), "yyyy-MM-dd'T'HH:mm"),
        status: appointment.status,
        notes: appointment.notes || "",
        internal_notes: appointment.internal_notes || "",
        change_reason: "",
      });
    }
  }, [appointment, open, form]);

  // Load reference data
  useEffect(() => {
    if (!open) return;

    const loadReferenceData = async () => {
      try {
        const [patientsRes, professionalsRes, servicesRes] = await Promise.all([
          fetch("/api/patients"),
          fetch("/api/professionals"),
          fetch("/api/service-types"),
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
  }, [open]);

  // Check for conflicts when time or professional changes
  const checkConflicts = async (professionalId: string, startTime: string, serviceId: string) => {
    if (!professionalId || !startTime || !serviceId || !appointment) return;

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

      const data = await response.json();

      if (data.has_conflict && data.conflicting_appointments?.length) {
        const conflicts = data.conflicting_appointments
          .map(
            (c: any) =>
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
    if (professionalId && startTime && serviceId && services.length > 0) {
      const timer = setTimeout(() => {
        checkConflicts(professionalId, startTime, serviceId);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [watchedValues, services, appointment]);

  // Handle form submission
  const onSubmit = async (data: AppointmentEditFormData) => {
    if (conflictError) {
      toast.error("Resolva os conflitos antes de continuar");
      return;
    }

    if (!appointment) return;

    try {
      setIsUpdating(true);

      const selectedService = services.find((s) => s.id === data.service_type_id);
      if (!selectedService) {
        toast.error("Serviço não encontrado");
        return;
      }

      const startTime = new Date(data.start_time);
      const endTime = new Date(startTime.getTime() + selectedService.duration_minutes * 60000);

      const updateData = {
        patient_id: data.patient_id,
        professional_id: data.professional_id,
        service_type_id: data.service_type_id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
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

      const result = await response.json();

      if (!response.ok) {
        if (result.conflicts?.length) {
          const conflicts = result.conflicts
            .map(
              (c: any) =>
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
        onOpenChange(false);
        toast.success("Agendamento atualizado com sucesso!");
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast.error("Erro ao atualizar agendamento");
    } finally {
      setIsUpdating(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Agendamento</DialogTitle>
          <DialogDescription>
            Modifique os detalhes do agendamento. Todos os campos são obrigatórios.
          </DialogDescription>
        </DialogHeader>

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Patient Selection */}
              <FormField
                control={form.control}
                name="patient_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paciente</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
              />

              {/* Professional Selection */}
              <FormField
                control={form.control}
                name="professional_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profissional</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                    <Select onValueChange={field.onChange} value={field.value}>
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
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
            </div>

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

            {/* Change Reason */}
            <FormField
              control={form.control}
              name="change_reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo da Alteração</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descreva o motivo da alteração..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isUpdating}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isUpdating || !!conflictError || checkingConflict}>
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Salvar Alterações
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
