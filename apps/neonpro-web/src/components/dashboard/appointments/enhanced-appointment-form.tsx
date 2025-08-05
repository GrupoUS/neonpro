"use client";

// =============================================
// NeonPro Enhanced Appointment Form with Conflict Prevention
// Story 1.2: Client-side conflict prevention integration
// =============================================

import type { zodResolver } from "@hookform/resolvers/zod";
import type { addMinutes, format, parseISO } from "date-fns";
import type { ptBR } from "date-fns/locale";
import type {
  AlertCircle,
  ArrowRight,
  Calendar,
  CalendarDays,
  CheckCircle,
  Clock,
  Loader2,
  User,
} from "lucide-react";
import type { useEffect, useState } from "react";
import type { Controller, useForm } from "react-hook-form";
import type { toast } from "sonner";
import type { z } from "zod";
import type { AlternativeSlot } from "@/app/lib/types/conflict-prevention";
import AlternativeSlotsDisplay from "@/components/dashboard/appointments/alternative-slots-display";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { withErrorBoundary } from "@/components/ui/error-boundary";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Textarea } from "@/components/ui/textarea";
import type { useAlternativeSlots } from "@/hooks/appointments/use-alternative-slots";
import type { useConflictPrevention } from "@/hooks/appointments/use-conflict-prevention";

// Form validation schema
const appointmentFormSchema = z.object({
  patient_id: z.string().min(1, "Selecione um paciente"),
  professional_id: z.string().min(1, "Selecione um profissional"),
  service_type_id: z.string().min(1, "Selecione um serviço"),
  start_time: z.string().min(1, "Selecione data e horário"),
  end_time: z.string().min(1, "Horário de fim é obrigatório"),
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentFormSchema>;

interface EnhancedAppointmentFormProps {
  clinicId: string;
  editingAppointment?: any; // Appointment being edited (if any)
  onSave: (data: AppointmentFormData) => Promise<void>;
  onCancel: () => void;
}

export function EnhancedAppointmentForm({
  clinicId,
  editingAppointment,
  onSave,
  onCancel,
}: EnhancedAppointmentFormProps) {
  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patients, setPatients] = useState<Array<{ id: string; name: string }>>([]);
  const [professionals, setProfessionals] = useState<Array<{ id: string; name: string }>>([]);
  const [services, setServices] = useState<Array<{ id: string; name: string; duration: number }>>(
    [],
  );
  const [estimatedDuration, setEstimatedDuration] = useState(60); // minutes

  // Conflict prevention integration
  const {
    isValidating,
    conflicts,
    warnings,
    alternativeSlots,
    isAvailable,
    hasErrors,
    hasWarnings,
    validateSlot,
    clearValidation,
    getSuggestedSlots,
  } = useConflictPrevention({
    debounceMs: 500,
    enableRealTime: true,
  });

  // Alternative slots suggestion hook
  const alternativeSlots = useAlternativeSlots();

  // Form setup
  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      patient_id: editingAppointment?.patient_id || "",
      professional_id: editingAppointment?.professional_id || "",
      service_type_id: editingAppointment?.service_type_id || "",
      start_time: editingAppointment?.start_time || "",
      end_time: editingAppointment?.end_time || "",
      notes: editingAppointment?.notes || "",
    },
  });

  // Load data on mount
  useEffect(() => {
    Promise.all([loadPatients(), loadProfessionals(), loadServices()]);
  }, [clinicId]);

  // Auto-calculate end time when start time or service changes
  useEffect(() => {
    const startTime = form.watch("start_time");
    const serviceId = form.watch("service_type_id");

    if (startTime && serviceId) {
      const service = services.find((s) => s.id === serviceId);
      if (service) {
        setEstimatedDuration(service.duration);
        const endTime = addMinutes(parseISO(startTime), service.duration).toISOString();
        form.setValue("end_time", endTime);

        // Trigger validation for new time slot
        triggerValidation();
      }
    }
  }, [form.watch("start_time"), form.watch("service_type_id"), services]);

  const loadPatients = async () => {
    try {
      const response = await fetch(`/api/clinic/${clinicId}/patients`);
      if (response.ok) {
        const data = await response.json();
        setPatients(data.map((p: any) => ({ id: p.id, name: p.name })));
      }
    } catch (error) {
      console.error("Error loading patients:", error);
    }
  };

  const loadProfessionals = async () => {
    try {
      const response = await fetch(`/api/clinic/${clinicId}/professionals`);
      if (response.ok) {
        const data = await response.json();
        setProfessionals(data.map((p: any) => ({ id: p.id, name: p.name })));
      }
    } catch (error) {
      console.error("Error loading professionals:", error);
    }
  };

  const loadServices = async () => {
    try {
      const response = await fetch(`/api/clinic/${clinicId}/services`);
      if (response.ok) {
        const data = await response.json();
        setServices(
          data.map((s: any) => ({
            id: s.id,
            name: s.name,
            duration: s.duration_minutes || 60,
          })),
        );
      }
    } catch (error) {
      console.error("Error loading services:", error);
    }
  };

  const triggerValidation = async () => {
    const values = form.getValues();

    if (values.professional_id && values.service_type_id && values.start_time && values.end_time) {
      try {
        await validateSlot({
          professional_id: values.professional_id,
          service_type_id: values.service_type_id,
          start_time: values.start_time,
          end_time: values.end_time,
          exclude_appointment_id: editingAppointment?.id,
        });
      } catch (error) {
        console.error("Validation error:", error);
      }
    }
  };

  const applyAlternativeSlot = (slot: AlternativeSlot) => {
    form.setValue("start_time", slot.start_time);
    form.setValue("end_time", slot.end_time);
    clearValidation();
    // This will trigger validation through the useEffect
  };

  // Function to get alternative suggestions when conflicts occur
  const getAlternativeSuggestions = async () => {
    const formData = form.getValues();

    if (!formData.professional_id || !formData.service_type_id || !formData.start_time) {
      toast.error("Complete os campos obrigatórios antes de buscar alternativas");
      return;
    }

    const service = services.find((s) => s.id === formData.service_type_id);
    if (!service) {
      toast.error("Serviço não encontrado");
      return;
    }

    try {
      await alternativeSlots.getSuggestions({
        professional_id: formData.professional_id,
        service_type_id: formData.service_type_id,
        preferred_start_time: formData.start_time,
        duration_minutes: service.duration,
        search_window_days: 7,
        max_suggestions: 5,
        exclude_appointment_id: editingAppointment?.id,
      });
    } catch (error) {
      console.error("Error getting alternative suggestions:", error);
    }
  };

  const handleSubmit = async (data: AppointmentFormData) => {
    // Final validation before submission
    if (hasErrors) {
      toast.error("Existem conflitos que impedem o agendamento. Por favor, resolva-os primeiro.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(data);
      toast.success(editingAppointment ? "Agendamento atualizado!" : "Agendamento criado!");
    } catch (error) {
      console.error("Error saving appointment:", error);
      toast.error("Erro ao salvar agendamento");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTime = (dateTime: string): string => {
    try {
      return format(parseISO(dateTime), "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch {
      return dateTime;
    }
  };

  const getValidationStatusIcon = () => {
    if (isValidating) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
    }
    if (hasErrors) {
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
    if (isAvailable) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    return null;
  };

  const suggestedSlots = getSuggestedSlots(3);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {editingAppointment ? "Editar Agendamento" : "Novo Agendamento"}
          {getValidationStatusIcon()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Patient Selection */}
          <div>
            <Label htmlFor="patient">Paciente *</Label>
            <Controller
              name="patient_id"
              control={form.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {patient.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.patient_id && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.patient_id.message}
              </p>
            )}
          </div>

          {/* Professional Selection */}
          <div>
            <Label htmlFor="professional">Profissional *</Label>
            <Controller
              name="professional_id"
              control={form.control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    clearValidation();
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um profissional" />
                  </SelectTrigger>
                  <SelectContent>
                    {professionals.map((professional) => (
                      <SelectItem key={professional.id} value={professional.id}>
                        {professional.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.professional_id && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.professional_id.message}
              </p>
            )}
          </div>

          {/* Service Selection */}
          <div>
            <Label htmlFor="service">Serviço *</Label>
            <Controller
              name="service_type_id"
              control={form.control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    clearValidation();
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        <div className="flex items-center justify-between w-full">
                          {service.name}
                          <Badge variant="secondary" className="ml-2">
                            {service.duration}min
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.service_type_id && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.service_type_id.message}
              </p>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_time">Data e Horário *</Label>
              <Controller
                name="start_time"
                control={form.control}
                render={({ field }) => (
                  <Input
                    type="datetime-local"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      clearValidation();
                    }}
                    className={hasErrors ? "border-red-500" : isAvailable ? "border-green-500" : ""}
                  />
                )}
              />
              {form.formState.errors.start_time && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.start_time.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="duration">Duração Estimada</Label>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{estimatedDuration} minutos</span>
                {isValidating && <Badge variant="secondary">Validando...</Badge>}
              </div>
            </div>
          </div>

          {/* Conflict Display */}
          {(hasErrors || hasWarnings) && (
            <div className="space-y-3">
              {conflicts
                .filter((c) => c.severity === "error")
                .map((conflict, index) => (
                  <Alert key={index} className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-700">
                      <strong>Conflito:</strong> {conflict.message}
                    </AlertDescription>
                  </Alert>
                ))}

              {warnings.map((warning, index) => (
                <Alert key={index} className="border-amber-200 bg-amber-50">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-700">
                    <strong>Aviso:</strong> {warning.message}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {/* Enhanced Alternative Slots Suggestions */}
          {hasErrors && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-blue-900 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Buscar Horários Alternativos
                </h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={getAlternativeSuggestions}
                  disabled={alternativeSlots.isLoading}
                >
                  {alternativeSlots.isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Buscar Alternativas
                </Button>
              </div>

              <AlternativeSlotsDisplay
                alternativeSlots={alternativeSlots}
                onSelectSlot={(slot) => {
                  applyAlternativeSlot(slot);
                  alternativeSlots.selectSuggestion(slot);
                }}
                compact={true}
                maxDisplaySlots={3}
              />
            </div>
          )}

          {/* Basic Alternative Slots Suggestions (Legacy) */}
          {hasErrors && suggestedSlots.length > 0 && !alternativeSlots.suggestions.length && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <h4 className="font-medium text-blue-900 flex items-center gap-2 mb-3">
                  <CalendarDays className="h-4 w-4" />
                  Horários Alternativos Sugeridos
                </h4>
                <div className="space-y-2">
                  {suggestedSlots.map((slot, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => applyAlternativeSlot(slot)}
                      className="w-full justify-between text-sm"
                    >
                      <span>{formatDateTime(slot.start_time)}</span>
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-blue-700 mt-2">
                  Clique em um horário para aplicar automaticamente
                </p>
              </CardContent>
            </Card>
          )}

          {/* Success State */}
          {isAvailable && !hasErrors && !hasWarnings && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Horário disponível! O agendamento pode ser realizado sem conflitos.
              </AlertDescription>
            </Alert>
          )}

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Observações</Label>
            <Controller
              name="notes"
              control={form.control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder="Observações adicionais sobre o agendamento..."
                  rows={3}
                />
              )}
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting || hasErrors} className="flex-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {editingAppointment ? "Atualizando..." : "Criando..."}
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  {editingAppointment ? "Atualizar" : "Criar"} Agendamento
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Export with Error Boundary protection for critical appointment functionality
export default withErrorBoundary(EnhancedAppointmentForm, {
  onError: (error, errorInfo) => {
    console.error("Critical error in appointment form:", error, errorInfo);
    // TODO: Send to monitoring service in production
  },
  showDetails: process.env.NODE_ENV === "development",
});
