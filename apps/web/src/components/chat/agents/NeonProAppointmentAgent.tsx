/**
 * NeonPro Appointment Scheduling Agent Component
 *
 * Specialized AI agent for intelligent appointment scheduling with optimization
 * Features:
 * - Real-time availability management
 * - AI-powered scheduling optimization
 * - No-show prediction and prevention
 * - Resource allocation optimization
 * - Portuguese healthcare workflows
 */

import React, { useCallback } from 'react'
import { Button } from '@/components/ui/button.ts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.ts'
import { NeonProAppointmentCard } from '../NeonProChatComponents.ts'
import { useNeonProChat } from '../NeonProChatProvider.ts'

interface AppointmentSlot {
  id: string
  datetime: string
  available: boolean
  professional: string
  room: string
  duration: number
}

interface AppointmentRequest {
  patientId: string
  patientName: string
  patientPhone: string
  procedureId: string
  preferredDateTime?: string
  preferredProfessional?: string
  urgencyLevel: 'low' | 'medium' | 'high'
  notes?: string
}

interface SchedulingMetrics {
  predictedNoShowRisk: number
  availabilityScore: number
  professionalMatch: number
  timePreferenceMatch: number
  overallScore: number
}

interface AppointmentAgentState {
  currentRequest?: AppointmentRequest
  availableSlots: AppointmentSlot[]
  selectedSlot?: AppointmentSlot
  showConfirmation: boolean
  loading: boolean
  error?: string
  currentOperation: 'idle' | 'searching' | 'scheduling' | 'confirming'
  metrics?: SchedulingMetrics
}

interface ProcedureOption {
  id: string
  name: string
  duration: number
  baseRevenue: number
}

interface AppointmentAgentProps {
  clinicId: string
  onAppointmentScheduled?: (appointmentId: string) => void
  onAppointmentAction?: (action: string, appointmentId: string) => void
  onError?: (error: string) => void
}

// Mock data for demonstration
const mockProcedures: ProcedureOption[] = [
  { id: 'botox', name: 'Botox', duration: 30, baseRevenue: 800 },
  { id: 'hyaluronic', name: 'Preenchimento', duration: 45, baseRevenue: 1200 },
  { id: 'laser', name: 'Laser CO2', duration: 90, baseRevenue: 1800 },
  { id: 'cleaning', name: 'Limpeza de Pele', duration: 60, baseRevenue: 300 },
  { id: 'peeling', name: 'Peeling Químico', duration: 45, baseRevenue: 600 },
]

export const NeonProAppointmentAgent: React.FC<AppointmentAgentProps> = ({
  clinicId: _clinicId,
  onAppointmentScheduled,
  onAppointmentAction,
  onError,
}) => {
  const { config: _config } = useNeonProChat()

  // Initialize agent state
  const initialState: AppointmentAgentState = {
    availableSlots: [],
    showConfirmation: false,
    loading: false,
    currentOperation: 'idle'
  }

  const [state, setState] = React.useState<AppointmentAgentState>(initialState)

  // Simulated intelligent scheduling function
  const generateOptimalSlots = useCallback((request: AppointmentRequest): AppointmentSlot[] => {
    // This would normally call the AI scheduling service
    const mockSlots: AppointmentSlot[] = [
      {
        id: '1',
        datetime: '2024-03-20T10:00:00',
        available: true,
        professional: 'Dr. Marina Santos',
        room: 'Sala 1',
        duration: 60
      },
      {
        id: '2', 
        datetime: '2024-03-20T14:30:00',
        available: true,
        professional: 'Dr. Carlos Silva', 
        room: 'Sala 2',
        duration: 60
      },
      {
        id: '3',
        datetime: '2024-03-21T09:00:00',
        available: true,
        professional: 'Dr. Marina Santos',
        room: 'Sala 1', 
        duration: 60
      }
    ]

    // Simulate AI optimization
    return mockSlots.sort((a, b) => {
      // Sort by availability, professional preference, etc
      return new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
    })
  }, [])

  const handleScheduleRequest = useCallback((request: AppointmentRequest) => {
    setState(prev => ({ ...prev, loading: true, currentOperation: 'searching' }))
    
    // Simulate API call
    setTimeout(() => {
      const slots = generateOptimalSlots(request)
      setState(prev => ({
        ...prev,
        currentRequest: request,
        availableSlots: slots,
        loading: false,
        currentOperation: 'idle'
      }))
    }, 1500)
  }, [generateOptimalSlots])

  const handleSlotSelection = useCallback((slot: AppointmentSlot) => {
    setState(prev => ({ ...prev, selectedSlot: slot, showConfirmation: true }))
  }, [])

  const handleConfirmAppointment = useCallback(() => {
    if (!state.selectedSlot || !state.currentRequest) return

    setState(prev => ({ ...prev, loading: true, currentOperation: 'scheduling' }))

    // Simulate scheduling API call
    setTimeout(() => {
      const appointmentId = `apt_${Date.now()}`
      
      setState(prev => ({
        ...prev,
        loading: false,
        showConfirmation: false,
        selectedSlot: undefined,
        currentRequest: undefined,
        availableSlots: [],
        currentOperation: 'idle'
      }))

      onAppointmentScheduled?.(appointmentId)
      onAppointmentAction?.('schedule_confirmed', appointmentId)
    }, 1000)
  }, [state.selectedSlot, state.currentRequest, onAppointmentScheduled, onAppointmentAction])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🤖 Agente de Agendamento NeonPro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600">
            Olá! Sou o agente especializado em agendamentos inteligentes. 
            Posso ajudar a encontrar o melhor horário considerando suas preferências,
            disponibilidade dos profissionais e otimização da agenda.
          </div>

          {state.loading && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              {state.currentOperation === 'searching' && 'Buscando horários disponíveis...'}
              {state.currentOperation === 'scheduling' && 'Confirmando agendamento...'}
            </div>
          )}

          {/* Quick scheduling form */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Procedimento</label>
              <select className="w-full mt-1 p-2 border rounded">
                <option value="">Selecione um procedimento</option>
                {mockProcedures.map(proc => (
                  <option key={proc.id} value={proc.id}>
                    {proc.name} - {proc.duration}min - R$ {proc.baseRevenue}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium">Nome do Paciente</label>
                <input 
                  type="text" 
                  className="w-full mt-1 p-2 border rounded"
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Telefone</label>
                <input 
                  type="tel" 
                  className="w-full mt-1 p-2 border rounded"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <Button 
              className="w-full"
              onClick={() => {
                const request: AppointmentRequest = {
                  patientId: 'temp_id',
                  patientName: 'Paciente Teste',
                  patientPhone: '(11) 99999-9999',
                  procedureId: 'botox',
                  urgencyLevel: 'medium'
                }
                handleScheduleRequest(request)
              }}
              disabled={state.loading}
            >
              🔍 Buscar Horários Disponíveis
            </Button>
          </div>

          {/* Available slots */}
          {state.availableSlots.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Horários Disponíveis (otimizados por IA)</h4>
              {state.availableSlots.map(slot => (
                <div 
                  key={slot.id}
                  className="border rounded p-3 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSlotSelection(slot)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">
                        {new Date(slot.datetime).toLocaleString('pt-BR')}
                      </div>
                      <div className="text-sm text-gray-600">
                        {slot.professional} • {slot.room}
                      </div>
                    </div>
                    <Button size="sm">
                      Selecionar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Confirmation dialog */}
          {state.showConfirmation && state.selectedSlot && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2">Confirmar Agendamento</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Data/Hora:</span>
                    <div>{new Date(state.selectedSlot.datetime).toLocaleString('pt-BR')}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Profissional:</span>
                    <div>{state.selectedSlot.professional}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Sala:</span>
                    <div>{state.selectedSlot.room}</div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setState(prev => ({ ...prev, selectedSlot: undefined, showConfirmation: false }))}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleConfirmAppointment}
                    disabled={state.loading}
                  >
                    Confirmar Agendamento
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* AI Insights */}
      <NeonProAppointmentCard 
        appointment={{
          id: 'demo-appointment',
          patientName: 'Demo Patient',
          service: 'AI Scheduling Demo',
          dateTime: new Date(),
          status: 'scheduled',
          professional: 'AI Agent'
        }}
      />
    </div>
  )
}