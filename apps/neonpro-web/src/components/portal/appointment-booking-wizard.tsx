'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Check, ArrowLeft, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/app/lib/i18n/use-translation';
import type { 
  BookingWizardState, 
  BookingStep, 
  Service, 
  Professional, 
  AvailableTimeSlot,
  BookingResponse 
} from '@/app/types/appointments';

// Step components (to be imported)
import ServiceSelection from './service-selection';
import ProfessionalSelection from './professional-selection'; 
import TimeSlotPicker from './time-slot-picker';
import AppointmentNotes from './appointment-notes';
import BookingConfirmation from './booking-confirmation';

// Import real-time availability components
import { RealTimeAvailability } from '@/components/dashboard/real-time-availability';
import { BookingConflictPrevention } from '@/components/dashboard/booking-conflict-prevention';
import { useAvailabilityManager } from '@/hooks/use-availability-manager';
import type { TimeSlot } from '@/hooks/use-realtime-availability';

interface AppointmentBookingWizardProps {
  patientId: string;
  onBookingComplete?: (booking: BookingResponse) => void;
  className?: string;
}

export default function AppointmentBookingWizard({
  patientId,
  onBookingComplete,
  className = ''
}: AppointmentBookingWizardProps) {
  const { t } = useTranslation();
  
  // Wizard state management
  const [state, setState] = useState<BookingWizardState>({
    currentStep: 1,
    selectedService: undefined,
    selectedProfessional: undefined,
    selectedTimeSlot: undefined,
    patientNotes: '',
    isLoading: false,
    error: undefined
  });

  // Real-time availability manager
  const availabilityManager = useAvailabilityManager();
  const [selectedRealtimeSlot, setSelectedRealtimeSlot] = useState<TimeSlot | null>(null);

  // Define booking steps
  const steps: BookingStep[] = useMemo(() => [
    {
      id: 1,
      title: t('booking.steps.service.title'),
      description: t('booking.steps.service.description'),
      isCompleted: !!state.selectedService,
      isActive: state.currentStep === 1
    },
    {
      id: 2, 
      title: t('booking.steps.professional.title'),
      description: t('booking.steps.professional.description'),
      isCompleted: !!state.selectedProfessional,
      isActive: state.currentStep === 2
    },
    {
      id: 3,
      title: t('booking.steps.time.title'), 
      description: t('booking.steps.time.description'),
      isCompleted: !!state.selectedTimeSlot,
      isActive: state.currentStep === 3
    },
    {
      id: 4,
      title: t('booking.steps.notes.title'),
      description: t('booking.steps.notes.description'), 
      isCompleted: state.patientNotes.length >= 0,
      isActive: state.currentStep === 4
    },
    {
      id: 5,
      title: t('booking.steps.confirmation.title'),
      description: t('booking.steps.confirmation.description'),
      isCompleted: false,
      isActive: state.currentStep === 5
    }
  ], [state, t]);

  // Calculate progress percentage
  const progressPercentage = useMemo(() => {
    const completedSteps = steps.filter(step => step.isCompleted).length;
    return (completedSteps / steps.length) * 100;
  }, [steps]);

  // Navigation functions
  const goToNextStep = useCallback(() => {
    if (state.currentStep < steps.length) {
      setState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
    }
  }, [state.currentStep, steps.length]);

  const goToPreviousStep = useCallback(() => {
    if (state.currentStep > 1) {
      setState(prev => ({ ...prev, currentStep: prev.currentStep - 1 }));
    }
  }, [state.currentStep]);

  // Selection handlers
  const handleServiceSelection = useCallback((service: Service) => {
    setState(prev => ({ 
      ...prev, 
      selectedService: service,
      selectedProfessional: undefined, // Reset dependent selections
      selectedTimeSlot: undefined,
      error: undefined
    }));
    goToNextStep();
  }, [goToNextStep]);

  const handleProfessionalSelection = useCallback((professional: Professional) => {
    setState(prev => ({ 
      ...prev, 
      selectedProfessional: professional,
      selectedTimeSlot: undefined, // Reset dependent selections
      error: undefined
    }));
    goToNextStep();
  }, [goToNextStep]);

  const handleTimeSlotSelection = useCallback((timeSlot: AvailableTimeSlot) => {
    setState(prev => ({ 
      ...prev, 
      selectedTimeSlot: timeSlot,
      error: undefined
    }));
    goToNextStep();
  }, [goToNextStep]);

  const handleNotesChange = useCallback((notes: string) => {
    setState(prev => ({ ...prev, patientNotes: notes }));
  }, []);

  // Data validation utility
  const validateBookingData = useCallback((bookingData: any): string | null => {
    if (!bookingData.patient_id) return 'ID do paciente é obrigatório';
    if (!bookingData.professional_id) return 'Profissional é obrigatório';
    if (!bookingData.service_type_id) return 'Tipo de serviço é obrigatório';
    if (!bookingData.start_time) return 'Horário de início é obrigatório';
    if (!bookingData.end_time) return 'Horário de término é obrigatório';
    
    // Validate that end_time is after start_time
    if (new Date(bookingData.start_time) >= new Date(bookingData.end_time)) {
      return 'Horário de término deve ser após o início';
    }
    
    return null; // No validation errors
  }, []);

  // Booking submission - Real API implementation
  // This function handles the complete booking flow with proper error handling,
  // validation, timeout handling, and authentication
  const handleBookingSubmit = useCallback(async () => {
    if (!state.selectedService || !state.selectedProfessional || !state.selectedTimeSlot) {
      setState(prev => ({ ...prev, error: t('booking.errors.incomplete') }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      // Calculate end time based on service duration
      const startTime = new Date(state.selectedTimeSlot.start_time);
      const endTime = new Date(startTime.getTime() + (state.selectedService.duration_minutes * 60 * 1000));

      // Prepare booking data according to API requirements
      const bookingData = {
        patient_id: patientId,
        professional_id: state.selectedProfessional.id,
        service_type_id: state.selectedService.id,
        start_time: startTime,
        end_time: endTime,
        notes: state.patientNotes || null,
        internal_notes: null
      };

      // Validate booking data before sending
      const validationError = validateBookingData(bookingData);
      if (validationError) {
        setState(prev => ({ ...prev, error: validationError }));
        return;
      }

      // Make API call to create appointment
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(bookingData),
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      if (!response.ok) {
        // Handle HTTP errors
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 401) {
          throw new Error(t('booking.errors.unauthorized') || 'Não autorizado');
        } else if (response.status === 409) {
          throw new Error(errorData.error_message || t('booking.errors.conflict') || 'Conflito de horário');
        } else if (response.status === 400) {
          throw new Error(errorData.error_message || t('booking.errors.validation') || 'Dados inválidos');
        } else {
          throw new Error(errorData.error_message || t('booking.errors.network') || 'Erro de rede');
        }
      }

      const result = await response.json();

      if (result.success) {
        // Success - pass appointment_id as confirmation_code for compatibility
        // The API returns appointment_id which we map to confirmation_code for UI consistency
        const successResponse: BookingResponse = {
          success: true,
          confirmation_code: result.appointment_id || 'N/A',
          appointment: result.appointment
        };
        
        onBookingComplete?.(successResponse);
      } else {
        // API returned success: false
        setState(prev => ({ 
          ...prev, 
          error: result.error_message || result.error_details || t('booking.errors.generic') 
        }));
      }
    } catch (error) {
      console.error('Booking submission error:', error);
      
      // Handle different error types
      let errorMessage: string;
      
      if (error instanceof DOMException && error.name === 'TimeoutError') {
        errorMessage = t('booking.errors.timeout') || 'Tempo limite excedido. Tente novamente.';
      } else if (error instanceof DOMException && error.name === 'AbortError') {
        errorMessage = t('booking.errors.aborted') || 'Operação cancelada.';
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = t('booking.errors.network') || 'Erro de conexão. Verifique sua internet.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = t('booking.errors.generic') || 'Erro inesperado ao agendar';
      }
      
      setState(prev => ({ ...prev, error: errorMessage }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state, patientId, onBookingComplete, t, validateBookingData]);

  // Check if current step can proceed
  const canProceed = useMemo(() => {
    switch (state.currentStep) {
      case 1: return !!state.selectedService;
      case 2: return !!state.selectedProfessional;
      case 3: return !!state.selectedTimeSlot;
      case 4: return true; // Notes are optional
      case 5: return false; // Final step
      default: return false;
    }
  }, [state]);

  return (
    <div className={`w-full max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Progress Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="text-lg font-medium">{t('booking.wizard.title')}</span>
            <Badge variant="outline" className="text-xs">
              {t('booking.wizard.step', { current: state.currentStep, total: steps.length })}
            </Badge>
          </CardTitle>
          <div className="space-y-2">
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {steps[state.currentStep - 1]?.description}
            </p>
          </div>
        </CardHeader>
      </Card>      {/* Error Alert */}
      {state.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-[400px]"
            >
              {state.currentStep === 1 && (
                <ServiceSelection
                  selectedService={state.selectedService}
                  onServiceSelect={handleServiceSelection}
                  isLoading={state.isLoading}
                />
              )}

              {state.currentStep === 2 && (
                <ProfessionalSelection
                  serviceId={state.selectedService?.id}
                  selectedProfessional={state.selectedProfessional}
                  onProfessionalSelect={handleProfessionalSelection}
                  isLoading={state.isLoading}
                />
              )}

              {state.currentStep === 3 && (
                <TimeSlotPicker
                  serviceId={state.selectedService?.id}
                  professionalId={state.selectedProfessional?.id}
                  selectedTimeSlot={state.selectedTimeSlot}
                  onTimeSlotSelect={handleTimeSlotSelection}
                  isLoading={state.isLoading}
                  patientId={patientId}
                />
              )}

              {state.currentStep === 4 && (
                <AppointmentNotes
                  notes={state.patientNotes}
                  onNotesChange={handleNotesChange}
                  maxLength={1000}
                  serviceInstructions={state.selectedService?.preparation_instructions}
                />
              )}

              {state.currentStep === 5 && (
                <BookingConfirmation
                  service={state.selectedService}
                  professional={state.selectedProfessional}
                  timeSlot={state.selectedTimeSlot}
                  notes={state.patientNotes}
                  onConfirm={handleBookingSubmit}
                  isLoading={state.isLoading}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Navigation Footer */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={goToPreviousStep}
              disabled={state.currentStep === 1 || state.isLoading}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('common.previous')}
            </Button>

            <div className="flex items-center gap-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    step.isCompleted
                      ? 'bg-green-500'
                      : step.isActive
                      ? 'bg-blue-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  title={step.title}
                />
              ))}
            </div>

            <Button
              onClick={state.currentStep === steps.length ? undefined : goToNextStep}
              disabled={!canProceed || state.isLoading}
              className="flex items-center gap-2"
            >
              {state.currentStep === steps.length ? (
                <Check className="h-4 w-4" />
              ) : (
                <>
                  {t('common.next')}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Sidebar for Mobile */}
      <div className="md:hidden">
        {(state.selectedService || state.selectedProfessional || state.selectedTimeSlot) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('booking.summary.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {state.selectedService && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('booking.summary.service')}</span>
                  <span className="font-medium">{state.selectedService.name}</span>
                </div>
              )}
              
              {state.selectedProfessional && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('booking.summary.professional')}</span>
                  <span className="font-medium">{state.selectedProfessional.name}</span>
                </div>
              )}
              
              {state.selectedTimeSlot && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('booking.summary.time')}</span>
                  <span className="font-medium">
                    {new Date(state.selectedTimeSlot.start_time).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
