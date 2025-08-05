"use client";

import type { zodResolver } from "@hookform/resolvers/zod";
import type { addDays, differenceInMinutes, format } from "date-fns";
import type { ptBR } from "date-fns/locale";
import type { AlertCircle, Calendar, CheckCircle, Clock, Loader2 } from "lucide-react";
import type { useEffect, useState } from "react";
import type { useForm } from "react-hook-form";
import type { toast } from "sonner";
import type { z } from "zod";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import type { Textarea } from "@/components/ui/textarea";
import type { Appointment } from "@/hooks/use-appointments-manager";

// Form validation schema
const rescheduleSchema = z.object({
  new_start_time: z.string().min(1, "Nova data e horário são obrigatórios"),
  reschedule_reason: z.string().min(1, "Motivo do reagendamento é obrigatório"),
  notify_patient: z.boolean().default(true),
});

type RescheduleFormData = z.infer<typeof rescheduleSchema>;

interface RescheduleAppointmentDialogProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReschedule: (appointmentId: string, newStartTime: string, reason: string) => Promise<void>;
}

interface AvailableSlot {
  start_time: string;
  end_time: string;
  is_available: boolean;
  conflicts?: string[];
}

export function RescheduleAppointmentDialog({
  appointment,
  open,
  onOpenChange,
  onReschedule,
}: RescheduleAppointmentDialogProps) {
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [conflictError, setConflictError] = useState<string>("");
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const form = useForm<RescheduleFormData>({
    resolver: zodResolver(rescheduleSchema),
    defaultValues: {
      new_start_time: "",
      reschedule_reason: "",
      notify_patient: true,
    },
  });

  // Reset form when appointment changes
  useEffect(() => {
    if (appointment && open) {
      form.reset({
        new_start_time: "",
        reschedule_reason: "",
        notify_patient: true,
      });
      setSelectedDate("");
      setAvailableSlots([]);
      setConflictError("");
    }
  }, [appointment, open, form]);

  // Load available slots when date is selected
  useEffect(() => {
    if (selectedDate && appointment) {
      loadAvailableSlots(selectedDate);
    }
  }, [selectedDate, appointment]);

  const loadAvailableSlots = async (date: string) => {
    if (!appointment) return;

    try {
      setLoadingSlots(true);

      const response = await fetch(
        `/api/appointments/available-slots?` +
          new URLSearchParams({
            professional_id: appointment.professional_id,
            service_type_id: appointment.service_type_id,
            date: date,
            exclude_appointment_id: appointment.id,
          }),
      );

      const data = await response.json();

      if (response.ok) {
        setAvailableSlots(data.available_slots || []);
      } else {
        toast.error("Erro ao carregar horários disponíveis");
      }
    } catch (error) {
      console.error("Error loading available slots:", error);
      toast.error("Erro ao carregar horários disponíveis");
    } finally {
      setLoadingSlots(false);
    }
  };

  // Check for conflicts when time changes
  const checkConflicts = async (newStartTime: string) => {
    if (!appointment || !newStartTime) return;

    try {
      setConflictError("");

      // Calculate service duration and end time
      const startTime = new Date(newStartTime);
      const serviceDuration = appointment.service ? appointment.service.duration_minutes : 60;
      const endTime = new Date(startTime.getTime() + serviceDuration * 60000);

      const response = await fetch("/api/appointments/check-conflicts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professional_id: appointment.professional_id,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
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
    }
  };

  // Handle date selection
  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    form.setValue("new_start_time", "");
  };

  // Handle slot selection
  const handleSlotSelect = (slot: AvailableSlot) => {
    if (!slot.is_available) return;

    const dateTimeValue = format(new Date(slot.start_time), "yyyy-MM-dd'T'HH:mm");
    form.setValue("new_start_time", dateTimeValue);
    checkConflicts(slot.start_time);
  };

  // Handle form submission
  const onSubmit = async (data: RescheduleFormData) => {
    if (conflictError) {
      toast.error("Resolva os conflitos antes de continuar");
      return;
    }

    if (!appointment) return;

    try {
      setIsRescheduling(true);

      await onReschedule(
        appointment.id,
        new Date(data.new_start_time).toISOString(),
        data.reschedule_reason,
      );

      onOpenChange(false);
      toast.success("Agendamento reagendado com sucesso!");
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      toast.error("Erro ao reagendar agendamento");
    } finally {
      setIsRescheduling(false);
    }
  };

  const getMinDate = () => {
    // Allow rescheduling from tomorrow onwards
    return format(addDays(new Date(), 1), "yyyy-MM-dd");
  };

  const getMaxDate = () => {
    // Allow rescheduling up to 3 months ahead
    return format(addDays(new Date(), 90), "yyyy-MM-dd");
  };

  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Reagendar Agendamento
          </DialogTitle>
          <DialogDescription>
            Selecione uma nova data e horário para o agendamento de {appointment.patient?.full_name}
          </DialogDescription>
        </DialogHeader>

        {/* Current Appointment Info */}
        <Card className="bg-muted/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Agendamento Atual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {format(new Date(appointment.start_time), "dd 'de' MMMM, yyyy", { locale: ptBR })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {format(new Date(appointment.start_time), "HH:mm", { locale: ptBR })} -
                {appointment.end_time &&
                  format(new Date(appointment.end_time), "HH:mm", { locale: ptBR })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {appointment.service?.name || "Serviço não especificado"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Conflict Alert */}
            {conflictError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{conflictError}</AlertDescription>
              </Alert>
            )}

            {/* Date Selection */}
            <div className="space-y-3">
              <FormLabel>Selecione uma nova data</FormLabel>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                min={getMinDate()}
                max={getMaxDate()}
                className="w-full"
              />
            </div>

            {/* Available Slots */}
            {selectedDate && (
              <div className="space-y-3">
                <FormLabel>
                  Horários disponíveis para{" "}
                  {format(new Date(selectedDate), "dd 'de' MMMM", { locale: ptBR })}
                </FormLabel>

                {loadingSlots ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Carregando horários...</span>
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-40 overflow-y-auto">
                    {availableSlots.map((slot, index) => (
                      <Button
                        key={index}
                        type="button"
                        variant={
                          form.watch("new_start_time") ===
                          format(new Date(slot.start_time), "yyyy-MM-dd'T'HH:mm")
                            ? "default"
                            : slot.is_available
                              ? "outline"
                              : "secondary"
                        }
                        size="sm"
                        disabled={!slot.is_available}
                        onClick={() => handleSlotSelect(slot)}
                        className="relative"
                      >
                        {format(new Date(slot.start_time), "HH:mm")}
                        {slot.is_available &&
                          form.watch("new_start_time") ===
                            format(new Date(slot.start_time), "yyyy-MM-dd'T'HH:mm") && (
                            <CheckCircle className="h-3 w-3 absolute -top-1 -right-1" />
                          )}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum horário disponível para esta data</p>
                  </div>
                )}
              </div>
            )}

            {/* Manual Time Selection (fallback) */}
            <FormField
              control={form.control}
              name="new_start_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ou digite data e horário manualmente</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      min={format(addDays(new Date(), 1), "yyyy-MM-dd'T'HH:mm")}
                      max={format(addDays(new Date(), 90), "yyyy-MM-dd'T'23:59")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reschedule Reason */}
            <FormField
              control={form.control}
              name="reschedule_reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo do Reagendamento</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descreva o motivo do reagendamento..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isRescheduling}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isRescheduling || !!conflictError || !form.watch("new_start_time")}
              >
                {isRescheduling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Calendar className="mr-2 h-4 w-4" />
                Reagendar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
