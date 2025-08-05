"use client";

import type {
  BookingResponse,
  CreateAppointmentFormData,
  Patient,
  Professional,
  ServiceType,
} from "@/app/lib/types/appointments";
import type { Button } from "@/components/ui/button";
import type { Calendar } from "@/components/ui/calendar";
import type {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Textarea } from "@/components/ui/textarea";
import type { cn } from "@/lib/utils";
import type { zodResolver } from "@hookform/resolvers/zod";
import type { format } from "date-fns";
import type { ptBR } from "date-fns/locale";
import type { AlertCircle, CalendarIcon, CheckCircle2, Clock, User } from "lucide-react";
import type { useRouter } from "next/navigation";
import type { useEffect, useState } from "react";
import type { useForm } from "react-hook-form";
import type { toast } from "sonner";
import type { z } from "zod";

// Form validation schema
const appointmentFormSchema = z.object({
  patient_id: z.string().min(1, "Selecione um paciente"),
  professional_id: z.string().min(1, "Selecione um profissional"),
  service_type_id: z.string().min(1, "Selecione um tipo de serviço"),
  appointment_date: z.date({
    required_error: "Selecione uma data",
  }),
  start_time: z.string().min(1, "Selecione um horário"),
  duration_minutes: z.number().min(15, "Duração mínima é 15 minutos"),
  notes: z.string().optional(),
  internal_notes: z.string().optional(),
});

type FormData = z.infer<typeof appointmentFormSchema>;

interface AppointmentFormProps {
  patients: Patient[];
  professionals: Professional[];
  serviceTypes: ServiceType[];
  onSuccess?: (appointmentId: string) => void;
  defaultValues?: Partial<FormData>;
}

export function AppointmentForm({
  patients,
  professionals,
  serviceTypes,
  onSuccess,
  defaultValues,
}: AppointmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      appointment_date: defaultValues?.appointment_date || new Date(),
      start_time: defaultValues?.start_time || "",
      duration_minutes: 60,
      notes: defaultValues?.notes || "",
      internal_notes: defaultValues?.internal_notes || "",
      ...defaultValues,
    },
  });

  // Generate time slots (15-minute intervals)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Check for conflicts when professional, date, or time changes
  const checkConflicts = async (
    professionalId: string,
    date: Date,
    startTime: string,
    durationMinutes: number,
  ) => {
    try {
      const [hour, minute] = startTime.split(":").map(Number);
      const startDateTime = new Date(date);
      startDateTime.setHours(hour, minute, 0, 0);

      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + durationMinutes);

      const response = await fetch("/api/appointments/check-conflicts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professional_id: professionalId,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
        }),
      });

      const result = await response.json();

      if (result.has_conflict) {
        setConflicts(result.conflicting_appointments || []);
        return true;
      } else {
        setConflicts([]);
        return false;
      }
    } catch (error) {
      console.error("Error checking conflicts:", error);
      return false;
    }
  };

  // Load available slots for selected professional and date
  const loadAvailableSlots = async (professionalId: string, date: Date) => {
    try {
      const response = await fetch(
        `/api/appointments/available-slots?professional_id=${professionalId}&date=${format(
          date,
          "yyyy-MM-dd",
        )}`,
      );
      const result = await response.json();

      if (result.success) {
        const slots = result.data
          .map((slot: any) => format(new Date(slot.slot_start), "HH:mm"))
          .filter((slot: any, index: number, arr: any[]) => result.data[index].is_available);
        setAvailableSlots(slots);
      }
    } catch (error) {
      console.error("Error loading available slots:", error);
    }
  };

  // Watch for changes that require conflict checking
  const watchedProfessional = form.watch("professional_id");
  const watchedDate = form.watch("appointment_date");
  const watchedTime = form.watch("start_time");
  const watchedDuration = form.watch("duration_minutes");

  // Effect to check conflicts and load slots
  useEffect(() => {
    if (watchedProfessional && watchedDate) {
      loadAvailableSlots(watchedProfessional, watchedDate);

      if (watchedTime && watchedDuration) {
        checkConflicts(watchedProfessional, watchedDate, watchedTime, watchedDuration);
      }
    }
  }, [watchedProfessional, watchedDate, watchedTime, watchedDuration]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      // Check for conflicts one more time before submitting
      const hasConflict = await checkConflicts(
        data.professional_id,
        data.appointment_date,
        data.start_time,
        data.duration_minutes,
      );

      if (hasConflict) {
        toast.error("Conflito de horário detectado. Por favor, escolha outro horário.");
        setIsSubmitting(false);
        return;
      }

      // Prepare the appointment data
      const [hour, minute] = data.start_time.split(":").map(Number);
      const startDateTime = new Date(data.appointment_date);
      startDateTime.setHours(hour, minute, 0, 0);

      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + data.duration_minutes);

      const appointmentData: CreateAppointmentFormData = {
        patient_id: data.patient_id,
        professional_id: data.professional_id,
        service_type_id: data.service_type_id,
        start_time: startDateTime,
        end_time: endDateTime,
        notes: data.notes || undefined,
        internal_notes: data.internal_notes || undefined,
      };

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointmentData),
      });

      const result: BookingResponse = await response.json();

      if (result.success && result.appointment_id) {
        toast.success("Agendamento criado com sucesso!");

        if (onSuccess) {
          onSuccess(result.appointment_id);
        } else {
          router.push(`/dashboard/appointments`);
        }
      } else {
        toast.error(result.error_message || "Erro ao criar agendamento");
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error("Erro inesperado ao criar agendamento");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Patient Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Paciente</h3>
            </div>

            <FormField
              control={form.control}
              name="patient_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Selecionar Paciente</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha um paciente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{patient.full_name}</span>
                            {patient.phone && (
                              <span className="text-sm text-muted-foreground">{patient.phone}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Professional & Service Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Serviço & Profissional</h3>
            </div>

            <FormField
              control={form.control}
              name="service_type_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Serviço</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      const service = serviceTypes.find((s) => s.id === value);
                      if (service) {
                        form.setValue("duration_minutes", service.duration_minutes);
                      }
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha um serviço" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {serviceTypes.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          <div className="flex justify-between items-center w-full">
                            <span className="font-medium">{service.name}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              {service.duration_minutes}min
                            </span>
                          </div>
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
              name="professional_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profissional</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha um profissional" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {professionals.map((professional) => (
                        <SelectItem key={professional.id} value={professional.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{professional.full_name}</span>
                            {professional.specialization && (
                              <span className="text-sm text-muted-foreground">
                                {professional.specialization}
                              </span>
                            )}
                          </div>
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

        {/* Date & Time Selection */}
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="appointment_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data do Agendamento</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: ptBR })
                        ) : (
                          <span>Escolha uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
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
            name="start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha um horário" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {timeSlots.map((time) => {
                      const isAvailable = availableSlots.includes(time);
                      return (
                        <SelectItem
                          key={time}
                          value={time}
                          disabled={!isAvailable}
                          className={cn(!isAvailable && "opacity-50 cursor-not-allowed")}
                        >
                          <div className="flex items-center gap-2">
                            {isAvailable ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span>{time}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormDescription>
                  {availableSlots.length > 0
                    ? `${availableSlots.length} horários disponíveis`
                    : "Carregando horários disponíveis..."}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Conflict Warning */}
        {conflicts.length > 0 && (
          <div className="p-4 border border-red-200 rounded-md bg-red-50">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <h4 className="font-medium">Conflito de Horário Detectado</h4>
            </div>
            <p className="text-red-600 text-sm mt-1">
              O profissional já possui agendamento neste horário. Por favor, escolha outro horário
              disponível.
            </p>
          </div>
        )}

        {/* Notes */}
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações do Paciente</FormLabel>
                <FormControl>
                  <Textarea placeholder="Observações visíveis ao paciente..." {...field} rows={3} />
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
                  <Textarea placeholder="Observações internas da equipe..." {...field} rows={3} />
                </FormControl>
                <FormDescription>Visível apenas para a equipe</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || conflicts.length > 0}
            className="min-w-[150px]"
          >
            {isSubmitting ? "Agendando..." : "Criar Agendamento"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
