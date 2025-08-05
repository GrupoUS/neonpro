"use client";

import type { useState, useEffect } from "react";
import type { useForm } from "react-hook-form";
import type { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import type {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Button } from "@/components/ui/button";
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
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Badge } from "@/components/ui/badge";
import type { Checkbox } from "@/components/ui/checkbox";
import type {
  Plus,
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  Loader2,
  Save,
} from "lucide-react";
import type { toast } from "sonner";
import type { format, addDays, addMinutes } from "date-fns";
import type { ptBR } from "date-fns/locale";

// Form validation schema
const createAppointmentSchema = z.object({
  patient_id: z.string().min(1, "Paciente é obrigatório"),
  professional_id: z.string().min(1, "Profissional é obrigatório"),
  service_type_id: z.string().min(1, "Tipo de serviço é obrigatório"),
  start_time: z.string().min(1, "Data e horário são obrigatórios"),
  status: z.enum(["scheduled", "confirmed"]).default("scheduled"),
  notes: z.string().optional(),
  internal_notes: z.string().optional(),
  send_confirmation: z.boolean().default(true),
  send_reminder: z.boolean().default(true),
});

type CreateAppointmentFormData = z.infer<typeof createAppointmentSchema>;

interface CreateAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateSuccess: () => void;
  defaultDate?: Date;
  defaultTime?: string;
  professionalId?: string;
}

interface Patient {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
}

interface Professional {
  id: string;
  full_name: string;
  specialization?: string;
}

interface ServiceType {
  id: string;
  name: string;
  duration_minutes: number;
  price?: number;
}

interface AvailableSlot {
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export function CreateAppointmentDialog({
  open,
  onOpenChange,
  onCreateSuccess,
  defaultDate,
  defaultTime,
  professionalId,
}: CreateAppointmentDialogProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [services, setServices] = useState<ServiceType[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [conflictError, setConflictError] = useState<string>("");
  const [checkingConflict, setCheckingConflict] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const form = useForm<CreateAppointmentFormData>({
    resolver: zodResolver(createAppointmentSchema),
    defaultValues: {
      patient_id: "",
      professional_id: professionalId || "",
      service_type_id: "",
      start_time: "",
      status: "scheduled",
      notes: "",
      internal_notes: "",
      send_confirmation: true,
      send_reminder: true,
    },
  });

  // Set default values when dialog opens
  useEffect(() => {
    if (open) {
      const defaultDateTime =
        defaultDate && defaultTime ? `${format(defaultDate, "yyyy-MM-dd")}T${defaultTime}` : "";

      form.reset({
        patient_id: "",
        professional_id: professionalId || "",
        service_type_id: "",
        start_time: defaultDateTime,
        status: "scheduled",
        notes: "",
        internal_notes: "",
        send_confirmation: true,
        send_reminder: true,
      });

      if (defaultDate) {
        setSelectedDate(format(defaultDate, "yyyy-MM-dd"));
      }
    }
  }, [open, defaultDate, defaultTime, professionalId, form]);

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

  // Load available slots when professional, date, or service changes
  useEffect(() => {
    const professionalId = form.watch("professional_id");
    const serviceId = form.watch("service_type_id");

    if (selectedDate && professionalId && serviceId) {
      loadAvailableSlots(selectedDate, professionalId, serviceId);
    }
  }, [selectedDate, form.watch("professional_id"), form.watch("service_type_id")]);

  const loadAvailableSlots = async (date: string, professionalId: string, serviceId: string) => {
    try {
      setLoadingSlots(true);

      const response = await fetch(
        `/api/appointments/available-slots?` +
          new URLSearchParams({
            professional_id: professionalId,
            service_type_id: serviceId,
            date: date,
          }),
      );

      const data = await response.json();

      if (response.ok) {
        setAvailableSlots(data.available_slots || []);
      }
    } catch (error) {
      console.error("Error loading available slots:", error);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Check for conflicts when time changes
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
  }, [watchedValues, services]);

  // Handle date selection for slot loading
  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    form.setValue("start_time", "");
  };

  // Handle slot selection
  const handleSlotSelect = (slot: AvailableSlot) => {
    if (!slot.is_available) return;

    const dateTimeValue = format(new Date(slot.start_time), "yyyy-MM-dd'T'HH:mm");
    form.setValue("start_time", dateTimeValue);
  };

  // Handle form submission
  const onSubmit = async (data: CreateAppointmentFormData) => {
    if (conflictError) {
      toast.error("Resolva os conflitos antes de continuar");
      return;
    }

    try {
      setIsCreating(true);

      const selectedService = services.find((s) => s.id === data.service_type_id);
      if (!selectedService) {
        toast.error("Serviço não encontrado");
        return;
      }

      const startTime = new Date(data.start_time);
      const endTime = new Date(startTime.getTime() + selectedService.duration_minutes * 60000);

      const appointmentData = {
        patient_id: data.patient_id,
        professional_id: data.professional_id,
        service_type_id: data.service_type_id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: data.status,
        notes: data.notes,
        internal_notes: data.internal_notes,
        send_confirmation: data.send_confirmation,
        send_reminder: data.send_reminder,
      };

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointmentData),
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

        throw new Error(result.error_message || "Erro ao criar agendamento");
      }

      onCreateSuccess();
      onOpenChange(false);
      toast.success("Agendamento criado com sucesso!");
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error("Erro ao criar agendamento");
    } finally {
      setIsCreating(false);
    }
  };

  const getMinDateTime = () => {
    return format(new Date(), "yyyy-MM-dd'T'HH:mm");
  };

  const getMaxDate = () => {
    return format(addDays(new Date(), 90), "yyyy-MM-dd");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Novo Agendamento
          </DialogTitle>
          <DialogDescription>
            Crie um novo agendamento preenchendo todos os campos obrigatórios
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Conflict Alert */}
            {(conflictError || checkingConflict) && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {checkingConflict ? "Verificando conflitos..." : conflictError}
                </AlertDescription>
              </Alert>
            )}

            {/* Patient and Professional Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              {patient.full_name}
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o profissional" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {professionals.map((professional) => (
                          <SelectItem key={professional.id} value={professional.id}>
                            <div>
                              <div className="font-medium">{professional.full_name}</div>
                              {professional.specialization && (
                                <div className="text-xs text-muted-foreground">
                                  {professional.specialization}
                                </div>
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
                          <div className="flex items-center justify-between w-full">
                            <span>{service.name}</span>
                            <div className="flex items-center gap-2 ml-4">
                              <Badge variant="secondary" className="text-xs">
                                {Math.floor(service.duration_minutes / 60)}h
                                {service.duration_minutes % 60}min
                              </Badge>
                              {service.price && (
                                <Badge variant="outline" className="text-xs">
                                  R$ {service.price.toFixed(2)}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date Selection for Available Slots */}
            <div className="space-y-3">
              <FormLabel>Selecione uma data</FormLabel>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                min={format(new Date(), "yyyy-MM-dd")}
                max={getMaxDate()}
              />
            </div>

            {/* Available Slots */}
            {selectedDate && form.watch("professional_id") && form.watch("service_type_id") && (
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
                          form.watch("start_time") ===
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
                          form.watch("start_time") ===
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

            {/* Manual Date/Time Selection */}
            <FormField
              control={form.control}
              name="start_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ou digite data e horário manualmente</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      min={getMinDateTime()}
                      max={format(addDays(new Date(), 90), "yyyy-MM-dd'T'23:59")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status and Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Inicial</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="scheduled">Agendado</SelectItem>
                        <SelectItem value="confirmed">Confirmado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="send_confirmation"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Enviar confirmação</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="send_reminder"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Enviar lembrete</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

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
                disabled={isCreating}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  isCreating || !!conflictError || checkingConflict || !form.watch("start_time")
                }
              >
                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Criar Agendamento
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
