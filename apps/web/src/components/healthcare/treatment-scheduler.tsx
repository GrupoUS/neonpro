import * as React from 'react'
import { format, addDays, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { cn } from '@/lib/utils.ts'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { AccessibilityInput } from '@/components/ui/accessibility-input'
import { AccessibilityButton } from '@/components/ui/accessibility-button'
import { HealthcareFormGroup } from '@/components/ui/healthcare-form-group'

import type { 
  PatientData, 
  AestheticTreatment, 
  TreatmentSession,
  HealthcareContext 
} from '@/types/healthcare'

interface TreatmentSchedulerProps {
  patient?: PatientData
  treatments: AestheticTreatment[]
  availableSlots: TreatmentTimeSlot[]
  onSchedule: (session: TreatmentSession) => void
  onCancel?: (sessionId: string) => void
  className?: string
  healthcareContext?: HealthcareContext
}

interface TreatmentTimeSlot {
  id: string
  start: Date
  end: Date
  professional: string
  available: boolean
  treatmentTypes: string[]
}

interface SchedulerState {
  selectedDate: Date
  selectedSlot?: TreatmentTimeSlot
  selectedTreatment?: AestheticTreatment
  patientNotes: string
  specialRequirements: string
}

export const TreatmentScheduler: React.FC<TreatmentSchedulerProps> = ({
  patient,
  treatments,
  availableSlots,
  onSchedule,
  onCancel,
  className,
  healthcareContext = 'aesthetic'
}) => {
  const [state, setState] = React.useState<SchedulerState>({
    selectedDate: new Date(),
    patientNotes: '',
    specialRequirements: ''
  })

  // Filter slots for selected date
  const slotsForDate = availableSlots.filter(slot => 
    isSameDay(slot.start, state.selectedDate)
  )

  // Generate next 7 days
  const next7Days = Array.from({ length: 7 }, (_, i) => 
    addDays(new Date(), i)
  )

  const handleDateSelect = (date: Date) => {
    setState(prev => ({ ...prev, selectedDate: date, selectedSlot: undefined }))
  }

  const handleSlotSelect = (slot: TreatmentTimeSlot) => {
    if (slot.available) {
      setState(prev => ({ ...prev, selectedSlot: slot }))
    }
  }

  const handleTreatmentSelect = (treatment: AestheticTreatment) => {
    setState(prev => ({ ...prev, selectedTreatment: treatment }))
  }

  const handleSchedule = () => {
    if (state.selectedSlot && state.selectedTreatment && patient) {
      const session: TreatmentSession = {
        id: `session-${Date.now()}`,
        patientId: patient.personalInfo.cpf,
        patientName: patient.personalInfo.fullName,
        treatmentId: state.selectedTreatment.id,
        treatmentName: state.selectedTreatment.name,
        scheduledStart: state.selectedSlot.start.toISOString(),
        scheduledEnd: state.selectedSlot.end.toISOString(),
        professional: state.selectedSlot.professional,
        status: 'scheduled',
        notes: state.patientNotes,
        specialRequirements: state.specialRequirements,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      onSchedule(session)
      
      // Reset form
      setState(prev => ({ 
        ...prev, 
        selectedSlot: undefined, 
        selectedTreatment: undefined,
        patientNotes: '',
        specialRequirements: ''
      }))
    }
  }

  const formatTime = (date: Date) => {
    return format(date, 'HH:mm', { locale: ptBR })
  }

  const formatDate = (date: Date) => {
    return format(date, "EEEE, d 'de' MMMM", { locale: ptBR })
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Patient Information */}
      {patient && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Paciente Selecionado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium">{patient.personalInfo.fullName}</p>
                <p className="text-sm text-muted-foreground">
                  CPF: {patient.personalInfo.cpf}
                </p>
                <p className="text-sm text-muted-foreground">
                  Telefone: {patient.personalInfo.phone}
                </p>
              </div>
              <div>
                <p className="font-medium">Histórico de Tratamentos</p>
                <p className="text-sm text-muted-foreground">
                  {patient.medicalHistory.aestheticTreatments.length} tratamentos anteriores
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Date Selection */}
      <HealthcareFormGroup
        label="Selecione a Data"
        healthcareContext={healthcareContext}
      >
        <div className="flex gap-2 overflow-x-auto pb-2">
          {next7Days.map((date) => (
            <Button
              key={date.toISOString()}
              variant={isSameDay(date, state.selectedDate) ? 'default' : 'outline'}
              onClick={() => handleDateSelect(date)}
              className={cn(
                'flex-shrink-0 flex-col h-auto py-3',
                isSameDay(date, new Date()) && 'border-blue-500'
              )}
              aria-label={`Selecionar data ${formatDate(date)}`}
            >
              <span className="text-xs font-medium">
                {format(date, 'EEE', { locale: ptBR })}
              </span>
              <span className="text-lg font-bold">
                {format(date, 'd', { locale: ptBR })}
              </span>
              <span className="text-xs">
                {format(date, 'MMM', { locale: ptBR })}
              </span>
            </Button>
          ))}
        </div>
      </HealthcareFormGroup>

      {/* Treatment Selection */}
      <HealthcareFormGroup
        label="Selecione o Tratamento"
        healthcareContext={healthcareContext}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {treatments.map((treatment) => (
            <Card 
              key={treatment.id}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md',
                state.selectedTreatment?.id === treatment.id && 'ring-2 ring-blue-500'
              )}
              onClick={() => handleTreatmentSelect(treatment)}
            >
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-sm">{treatment.name}</h3>
                    <Badge variant={treatment.requiresMedicalSupervision ? 'default' : 'secondary'}>
                      {treatment.duration}min
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {treatment.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-green-600">
                      R$ {treatment.price.toFixed(2)}
                    </span>
                    <Badge 
                      variant={treatment.category === 'facial' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {treatment.category}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </HealthcareFormGroup>

      {/* Time Slot Selection */}
      <HealthcareFormGroup
        label="Horários Disponíveis"
        healthcareContext={healthcareContext}
      >
        {slotsForDate.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {slotsForDate.map((slot) => (
              <Card
                key={slot.id}
                className={cn(
                  'cursor-pointer transition-all',
                  !slot.available && 'opacity-50 cursor-not-allowed',
                  state.selectedSlot?.id === slot.id && 'ring-2 ring-blue-500'
                )}
                onClick={() => slot.available && handleSlotSelect(slot)}
              >
                <CardContent className="p-3">
                  <div className="text-center space-y-1">
                    <div className="font-medium text-sm">
                      {formatTime(slot.start)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {slot.professional}
                    </div>
                    <Badge 
                      variant={slot.available ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {slot.available ? 'Disponível' : 'Indisponível'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Não há horários disponíveis para esta data.
          </div>
        )}
      </HealthcareFormGroup>

      {/* Additional Information */}
      {(state.selectedSlot || state.selectedTreatment) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AccessibilityInput
            label="Observações do Paciente"
            placeholder="Informações relevantes sobre o tratamento..."
            value={state.patientNotes}
            onChange={(e) => setState(prev => ({ ...prev, patientNotes: e.target.value }))}
            healthcareContext="personal"
            multiline
            rows={3}
          />
          
          <AccessibilityInput
            label="Requisitos Especiais"
            placeholder="Alergias, condições médicas, etc..."
            value={state.specialRequirements}
            onChange={(e) => setState(prev => ({ ...prev, specialRequirements: e.target.value }))}
            healthcareContext="medical"
            multiline
            rows={3}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <AccessibilityButton
          onClick={handleSchedule}
          disabled={!state.selectedSlot || !state.selectedTreatment || !patient}
          healthcareContext={healthcareContext}
          className="flex-1"
        >
          Agendar Tratamento
        </AccessibilityButton>
        
        {onCancel && (
          <AccessibilityButton
            variant="outline"
            onClick={() => onCancel?.('')}
            healthcareContext={healthcareContext}
          >
            Cancelar
          </AccessibilityButton>
        )}
      </div>

      {/* Summary */}
      {state.selectedSlot && state.selectedTreatment && patient && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-medium text-blue-900 mb-3">Resumo do Agendamento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Paciente:</strong> {patient.personalInfo.fullName}</p>
                <p><strong>Tratamento:</strong> {state.selectedTreatment.name}</p>
                <p><strong>Duração:</strong> {state.selectedTreatment.duration} minutos</p>
              </div>
              <div>
                <p><strong>Data:</strong> {formatDate(state.selectedSlot.start)}</p>
                <p><strong>Horário:</strong> {formatTime(state.selectedSlot.start)}</p>
                <p><strong>Profissional:</strong> {state.selectedSlot.professional}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-blue-700 font-medium">
                Valor: R$ {state.selectedTreatment.price.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

TreatmentScheduler.displayName = 'TreatmentScheduler'