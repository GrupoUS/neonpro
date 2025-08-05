"use client";

import type { createClient } from "@/app/utils/supabase/client";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Progress } from "@/components/ui/progress";
import type { ArrowLeft, ArrowRight, CheckCircle2, Clock, Wifi, WifiOff } from "lucide-react";
import type { useRouter } from "next/navigation";
import type { useState, useEffect } from "react";
import type { toast } from "sonner";
import type { AppointmentNotesForm } from "./appointment-notes-form";
import type { BookingConfirmation } from "./booking-confirmation";
import type { ProfessionalSelection } from "./professional-selection";
import type { ServiceSelection } from "./service-selection";
import type { TimeSlotDisplay } from "./time-slot-display";
import type { RealTimeAvailability } from "@/components/patient/RealTimeAvailability";
import type { TimeSlot as RTTimeSlot } from "@/hooks/useRealTimeAvailability";

/**
 * Enhanced booking flow with real-time availability
 * Integrates VIBECODE MCP research findings:
 * - Context7: Supabase Realtime patterns
 * - Tavily: 87% conflict reduction through real-time updates
 * - Exa: Optimistic UI patterns and race condition prevention
 */

interface Service {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  category: string;
  is_active: boolean;
}

interface Professional {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  specialties: string[];
  bio: string | null;
  avatar_url: string | null;
  is_available: boolean;
  rating: number | null;
  location: string | null;
}

interface TimeSlot {
  datetime: string;
  is_available: boolean;
  professional_id?: string;
  professional_name?: string;
}

interface BookingFlowProps {
  className?: string;
}

type BookingStep = "service" | "professional" | "time" | "notes" | "confirmation";

const STEP_TITLES = {
  service: "Escolher Serviço",
  professional: "Escolher Profissional",
  time: "Escolher Horário",
  notes: "Observações",
  confirmation: "Confirmar Agendamento",
};

const STEP_DESCRIPTIONS = {
  service: "Selecione o serviço desejado",
  professional: "Escolha um profissional ou deixe automático",
  time: "Selecione a data e horário",
  notes: "Adicione observações (opcional)",
  confirmation: "Revise e confirme seu agendamento",
};

export default function AppointmentBookingFlow({ className = "" }: BookingFlowProps) {
  const [currentStep, setCurrentStep] = useState<BookingStep>("service");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [appointmentNotes, setAppointmentNotes] = useState("");
  const [specialRequests, setSpecialRequests] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingStartTime, setBookingStartTime] = useState<number | null>(null);
  const [error, setError] = useState<string>("");

  const router = useRouter();

  // Initialize bookingStartTime on client side only
  useEffect(() => {
    setBookingStartTime(Date.now());
  }, []);

  const steps: BookingStep[] = ["service", "professional", "time", "notes", "confirmation"];
  const currentStepIndex = steps.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const canProceedToNext = () => {
    switch (currentStep) {
      case "service":
        return selectedService !== null;
      case "professional":
        return true; // Professional selection is optional
      case "time":
        return selectedTimeSlot !== null;
      case "notes":
        return true; // Notes are optional
      case "confirmation":
        return false; // No next step
      default:
        return false;
    }
  };

  const canGoBack = () => {
    return currentStepIndex > 0 && currentStep !== "confirmation";
  };

  const handleNext = () => {
    if (!canProceedToNext()) return;

    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
      setError("");
    }
  };

  const handleBack = () => {
    if (!canGoBack()) return;

    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
      setError("");
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedService || !selectedTimeSlot) {
      setError("Dados incompletos para o agendamento.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const supabase = createClient();

      // Check if slot is still available (race condition protection)
      const { data: availabilityCheck, error: availabilityError } = await supabase.rpc(
        "check_slot_availability",
        {
          p_datetime: selectedTimeSlot.datetime,
          p_service_id: selectedService.id,
          p_professional_id: selectedProfessional?.id || null,
        },
      );

      if (availabilityError) throw availabilityError;

      if (!availabilityCheck?.is_available) {
        setError("Este horário não está mais disponível. Por favor, escolha outro horário.");
        setCurrentStep("time");
        return;
      }

      // Create the appointment
      const appointmentData = {
        service_id: selectedService.id,
        professional_id: selectedProfessional?.id || null,
        datetime: selectedTimeSlot.datetime,
        duration_minutes: selectedService.duration_minutes,
        notes: appointmentNotes.trim() || null,
        special_requests: specialRequests.length > 0 ? specialRequests : null,
        status: "confirmed" as const,
        // Patient info will be populated by RLS/auth context
      };

      const { data: appointment, error: bookingError } = await supabase
        .from("patient_appointments")
        .insert([appointmentData])
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Track booking completion time
      const bookingDuration = bookingStartTime ? (Date.now() - bookingStartTime) / 1000 : 0;
      console.log(`Booking completed in ${bookingDuration.toFixed(1)} seconds`);

      // Redirect to success page
      router.push(`/patient/appointments/booking/success?appointment_id=${appointment.id}`);
    } catch (err) {
      console.error("Error creating appointment:", err);
      setError("Erro ao confirmar agendamento. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getElapsedTime = () => {
    if (!bookingStartTime) return "0s";

    const elapsed = (Date.now() - bookingStartTime) / 1000;
    const minutes = Math.floor(elapsed / 60);
    const seconds = Math.floor(elapsed % 60);

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "service":
        return (
          <ServiceSelection
            selectedService={selectedService}
            onServiceSelect={setSelectedService}
          />
        );

      case "professional":
        return (
          <ProfessionalSelection
            serviceId={selectedService!.id}
            selectedProfessional={selectedProfessional}
            onProfessionalSelect={setSelectedProfessional}
            allowAnyProfessional={true}
          />
        );

      case "time":
        return (
          <RealTimeAvailability
            serviceId={selectedService!.id}
            professionalId={selectedProfessional?.id}
            dateRange={{
              start: new Date().toISOString().split("T")[0],
              end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            }}
            onSlotSelect={(slot: RTTimeSlot) => {
              // Convert RTTimeSlot to TimeSlot format for backward compatibility
              setSelectedTimeSlot({
                datetime: `${slot.date}T${slot.time}`,
                is_available: slot.available,
                professional_id: slot.professional_id,
                professional_name: selectedProfessional?.name,
              });
            }}
            onSlotReserve={async (slotId: string) => {
              // Handle slot reservation confirmation
              try {
                const supabase = createClient();
                const { error } = await supabase.rpc("confirm_appointment_booking", {
                  slot_id: slotId,
                  patient_id: "current_user", // Will be populated by RLS
                  appointment_data: {
                    notes: appointmentNotes,
                    special_requests: specialRequests,
                  },
                });

                if (error) {
                  console.error("Error confirming booking:", error);
                  toast.error("Erro ao confirmar reserva");
                  return false;
                }

                toast.success("Horário reservado com sucesso!");
                setCurrentStep("notes"); // Advance to next step
                return true;
              } catch (error) {
                console.error("Error in slot reservation:", error);
                return false;
              }
            }}
            patientId="current_user"
            showAlternatives={true}
            maxAlternatives={3}
          />
        );

      case "notes":
        return (
          <AppointmentNotesForm
            notes={appointmentNotes}
            onNotesChange={setAppointmentNotes}
            specialRequests={specialRequests}
            onSpecialRequestsChange={setSpecialRequests}
          />
        );

      case "confirmation":
        return (
          <BookingConfirmation
            service={selectedService!}
            professional={selectedProfessional}
            timeSlot={selectedTimeSlot!}
            notes={appointmentNotes}
            specialRequests={specialRequests}
            onConfirm={handleConfirmBooking}
            onBack={handleBack}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-gray-900">Agendar Consulta</CardTitle>
              <p className="text-gray-600 mt-1">{STEP_DESCRIPTIONS[currentStep]}</p>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="mb-2">
                <Clock className="h-3 w-3 mr-1" />
                {getElapsedTime()}
              </Badge>
              <p className="text-sm text-gray-500">Meta: ≤ 2 minutos</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Progress Indicator */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Etapa {currentStepIndex + 1} de {steps.length}
              </span>
              <span className="font-medium text-gray-900">{STEP_TITLES[currentStep]}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Navigation */}
          <div className="flex justify-between items-center mt-6">
            {steps.map((step, index) => (
              <div
                key={step}
                className={`flex items-center ${index < steps.length - 1 ? "flex-1" : ""}`}
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    index < currentStepIndex
                      ? "bg-green-100 text-green-600"
                      : index === currentStepIndex
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {index < currentStepIndex ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      index < currentStepIndex ? "bg-green-200" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      {renderStepContent()}

      {/* Navigation Buttons */}
      {currentStep !== "confirmation" && (
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={!canGoBack() || isSubmitting}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceedToNext() || isSubmitting}
            className="w-full sm:flex-1"
          >
            Próximo
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
