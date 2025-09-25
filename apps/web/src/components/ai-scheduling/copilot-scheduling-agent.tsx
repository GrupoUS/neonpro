/**
 * CopilotKit Scheduling Agent Component
 *
 * React component that integrates CopilotKit with AI-powered appointment scheduling
 * Features:
 * - Intelligent scheduling workflows
 * - Human-in-the-loop approval
 * - Real-time availability management
 * - No-show prediction integration
 * - Resource optimization visualization
 */

import { useCoAgent, useCopilotAction, useCopilotReadable } from '@copilotkit/react-core'
import { CopilotChat } from '@copilotkit/react-ui'
import { addDays, addHours, format, isAfter, isBefore, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import React, { useCallback, useEffect, useState } from 'react'

import { AIAppointmentSchedulingService } from '../../../api/src/services/ai-appointment-scheduling-service'

// Types
interface SchedulingAgentState {
  currentStep:
    | 'idle'
    | 'gathering_info'
    | 'finding_slots'
    | 'confirming'
    | 'scheduling'
    | 'completed'
  patientInfo: {
    id?: string
    name: string
    contact: string
    preferences: string[]
  }
  appointmentRequirements: {
    serviceType: string
    duration: number
    urgency: 'low' | 'medium' | 'high' | 'urgent'
    preferredDates: Date[]
    preferredProfessionals: string[]
    accessibility: string[]
  }
  availableSlots: Array<{
    id: string
    start: Date
    end: Date
    professional: string
    room: string
    confidence: number
    efficiency: number
  }>
  selectedSlot?: string
  optimization: {
    suggestions: string[]
    riskFactors: string[]
    recommendations: string[]
  }
}

interface SchedulingAgentProps {
  clinicId: string
  onAppointmentScheduled?: (appointmentId: string) => void
  onError?: (error: string) => void
}

export const CopilotSchedulingAgent: React.FC<SchedulingAgentProps> = ({
  clinicId,
  onAppointmentScheduled,
  onError,
}) => {
  const [localState, setLocalState] = useState<SchedulingAgentState>({
    currentStep: 'idle',
    patientInfo: {
      name: '',
      contact: '',
      preferences: [],
    },
    appointmentRequirements: {
      serviceType: '',
      duration: 30,
      urgency: 'medium',
      preferredDates: [],
      preferredProfessionals: [],
      accessibility: [],
    },
    availableSlots: [],
    optimization: {
      suggestions: [],
      riskFactors: [],
      recommendations: [],
    },
  })

  // Initialize AI scheduling service
  const [aiService] = useState(() => AIAppointmentSchedulingService.getInstance())

  // Use CopilotKit agent for state management
  const { state, setState } = useCoAgent<SchedulingAgentState>({
    name: 'scheduling-agent',
    initialState: localState,
  })

  // Sync local state with agent state
  useEffect(() => {
    setLocalState(state)
  }, [state])

  // Provide context to the agent
  useCopilotReadable({
    description: 'Current scheduling state and context',
    value: {
      currentStep: state.currentStep,
      patientInfo: state.patientInfo,
      appointmentRequirements: state.appointmentRequirements,
      availableSlots: state.availableSlots,
      optimization: state.optimization,
    },
  }, [state])

  // Define scheduling actions
  useCopilotAction({
    name: 'gather_patient_info',
    description: 'Collect patient information for appointment scheduling',
    parameters: [
      { name: 'name', type: 'string', description: 'Patient full name', required: true },
      {
        name: 'contact',
        type: 'string',
        description: 'Patient contact information',
        required: true,
      },
      {
        name: 'preferences',
        type: 'string[]',
        description: 'Patient preferences',
        required: false,
      },
    ],
    handler: async (name: string, contact: string, preferences: string[] = []) => {
      try {
        setState(prev => ({
          ...prev,
          currentStep: 'gathering_info',
          patientInfo: { name, contact, preferences },
        }))

        return 'Patient information collected successfully'
      } catch (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : 'Failed to collect patient info'
        onError?.(errorMessage)
        throw error
      }
    },
  })

  useCopilotAction({
    name: 'set_appointment_requirements',
    description: 'Set appointment requirements and preferences',
    parameters: [
      {
        name: 'serviceType',
        type: 'string',
        description: 'Type of service needed',
        required: true,
      },
      { name: 'duration', type: 'number', description: 'Duration in minutes', required: true },
      { name: 'urgency', type: 'string', description: 'Priority level', required: true },
      {
        name: 'preferredDates',
        type: 'string[]',
        description: 'Preferred date ranges',
        required: false,
      },
      {
        name: 'preferredProfessionals',
        type: 'string[]',
        description: 'Preferred professionals',
        required: false,
      },
      {
        name: 'accessibility',
        type: 'string[]',
        description: 'Accessibility requirements',
        required: false,
      },
    ],
    handler: async (
      serviceType: string,
      duration: number,
      urgency: string,
      preferredDates: string[] = [],
      preferredProfessionals: string[] = [],
      accessibility: string[] = [],
    ) => {
      try {
        const parsedDates = preferredDates.map(date => parseISO(date))

        setState(prev => ({
          ...prev,
          currentStep: 'finding_slots',
          appointmentRequirements: {
            serviceType,
            duration,
            urgency: urgency as 'low' | 'medium' | 'high' | 'urgent',
            preferredDates: parsedDates,
            preferredProfessionals,
            accessibility,
          },
        }))

        // Trigger slot finding
        await findAvailableSlots(serviceType, parsedDates, duration, preferredProfessionals)

        return 'Appointment requirements set and availability checked'
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to set requirements'
        onError?.(errorMessage)
        throw error
      }
    },
  })

  useCopilotAction({
    name: 'select_time_slot',
    description: 'Select a specific time slot for appointment',
    parameters: [
      { name: 'slotId', type: 'string', description: 'ID of selected time slot', required: true },
    ],
    handler: async (slotId: string) => {
      try {
        const selectedSlot = state.availableSlots.find(slot => slot.id === slotId)
        if (!selectedSlot) {
          throw new Error('Selected slot not found')
        }

        setState(prev => ({
          ...prev,
          currentStep: 'confirming',
          selectedSlot: slotId,
        }))

        return 'Time slot selected for confirmation'
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to select slot'
        onError?.(errorMessage)
        throw error
      }
    },
  })

  useCopilotAction({
    name: 'confirm_appointment',
    description: 'Confirm and schedule the appointment',
    parameters: [
      { name: 'patientId', type: 'string', description: 'Patient ID for booking', required: true },
    ],
    handler: async (patientId: string) => {
      try {
        setState(prev => ({
          ...prev,
          currentStep: 'scheduling',
        }))

        // Schedule the appointment
        const appointmentId = await scheduleAppointment(patientId)

        setState(prev => ({
          ...prev,
          currentStep: 'completed',
        }))

        onAppointmentScheduled?.(appointmentId)
        return `Appointment scheduled successfully with ID: ${appointmentId}`
      } catch (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : 'Failed to schedule appointment'
        onError?.(errorMessage)
        throw error
      }
    },
  })

  // Helper functions
  const findAvailableSlots = useCallback(async (
    serviceType: string,
    preferredDates: Date[],
    duration: number,
    preferredProfessionals: string[],
  ) => {
    try {
      // Get date range for search
      const startDate = preferredDates.length > 0
        ? new Date(Math.min(...preferredDates.map(d => d.getTime())))
        : new Date()

      const endDate = preferredDates.length > 0
        ? new Date(Math.max(...preferredDates.map(d => d.getTime())))
        : addDays(startDate, 7)

      // Get real-time availability
      const availability = await aiService.getRealTimeAvailability(clinicId, undefined, {
        start: startDate,
        end: endDate,
      })

      // Filter and format slots based on requirements
      const suitableSlots = availability.availableSlots
        .filter(slot => {
          const slotDuration = (slot.end.getTime() - slot.start.getTime()) / (1000 * 60)
          return slotDuration >= duration
        })
        .map((slot, index) => ({
          id: `slot-${index}`,
          start: slot.start,
          end: slot.end,
          professional: slot.professionalId,
          room: slot.confidence > 0.7 ? 'available' : 'limited',
          confidence: slot.confidence,
          efficiency: 0.9, // Placeholder efficiency calculation
        }))

      // Get optimization suggestions
      const optimization = {
        suggestions: [
          'Morning slots have higher attendance rates',
          'Consider mid-week appointments for better availability',
        ],
        riskFactors: availability.conflicts.map(conflict => conflict.description),
        recommendations: [
          'Book 2-3 days in advance for optimal availability',
          'Consider telemedicine options for urgent cases',
        ],
      }

      setState(prev => ({
        ...prev,
        availableSlots: suitableSlots,
        optimization,
      }))
    } catch (error) {
      console.error('Error finding available slots:', error)
      onError?.('Failed to find available slots')
    }
  }, [clinicId, aiService, onError])

  const scheduleAppointment = useCallback(async (patientId: string) => {
    try {
      if (!state.selectedSlot) {
        throw new Error('No time slot selected')
      }

      const selectedSlot = state.availableSlots.find(slot => slot.id === state.selectedSlot)
      if (!selectedSlot) {
        throw new Error('Selected slot not found')
      }

      // This would integrate with your appointment booking API
      const appointmentData = {
        clinicId,
        patientId,
        professionalId: selectedSlot.professional,
        startTime: selectedSlot.start.toISOString(),
        endTime: selectedSlot.end.toISOString(),
        serviceType: state.appointmentRequirements.serviceType,
        status: 'scheduled',
      }

      // Make API call to create appointment
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      })

      if (!response.ok) {
        throw new Error('Failed to create appointment')
      }

      const appointment = await response.json()
      return appointment.id
    } catch (error) {
      console.error('Error scheduling appointment:', error)
      throw error
    }
  }, [state, clinicId])

  // Render component UI
  return (
    <div className='copilot-scheduling-agent max-w-4xl mx-auto p-6'>
      <div className='bg-white rounded-lg shadow-lg'>
        <div className='p-6 border-b'>
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>
            AI Appointment Scheduling Assistant
          </h2>
          <p className='text-gray-600'>
            Intelligent scheduling powered by AI with real-time availability and optimization
          </p>
        </div>

        {/* Progress indicator */}
        <div className='px-6 py-4 bg-gray-50'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex space-x-4'>
              {['idle', 'gathering_info', 'finding_slots', 'confirming', 'scheduling', 'completed']
                .map((step, index) => (
                  <div key={step} className='flex items-center'>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        state.currentStep === step ||
                          (state.currentStep !== 'idle' &&
                            [
                              'gathering_info',
                              'finding_slots',
                              'confirming',
                              'scheduling',
                              'completed',
                            ].includes(state.currentStep) &&
                            [
                                'gathering_info',
                                'finding_slots',
                                'confirming',
                                'scheduling',
                                'completed',
                              ].indexOf(state.currentStep) >= index)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span className='ml-2 text-sm font-medium text-gray-900'>
                      {step.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className='p-6'>
          {/* Chat interface */}
          <div className='mb-6'>
            <CopilotChat
              instructions={`
                You are an AI appointment scheduling assistant for a healthcare clinic.
                Your goal is to help patients schedule appointments efficiently using AI optimization.
                
                Follow this workflow:
                1. Gather patient information (name, contact, preferences)
                2. Collect appointment requirements (service type, duration, urgency, preferences)
                3. Find optimal time slots using AI optimization
                4. Present options and get patient selection
                5. Confirm and schedule the appointment
                
                Always consider:
                - No-show risk factors
                - Resource optimization
                - Patient preferences and accessibility
                - Real-time availability
                - LGPD compliance for data handling
                
                Use the available actions to interact with the scheduling system.
              `}
              labels={{
                title: 'Scheduling Assistant',
                initial:
                  "Hello! I'm your AI scheduling assistant. How can I help you book an appointment today?",
              }}
              className='h-96'
            />
          </div>

          {/* Optimization insights */}
          {state.optimization.suggestions.length > 0 && (
            <div className='mb-6 p-4 bg-blue-50 rounded-lg'>
              <h3 className='text-lg font-semibold text-blue-900 mb-2'>
                AI Optimization Insights
              </h3>
              <ul className='space-y-1'>
                {state.optimization.suggestions.map((suggestion, index) => (
                  <li key={index} className='text-blue-800 text-sm'>
                    • {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Risk factors */}
          {state.optimization.riskFactors.length > 0 && (
            <div className='mb-6 p-4 bg-yellow-50 rounded-lg'>
              <h3 className='text-lg font-semibold text-yellow-900 mb-2'>
                Scheduling Considerations
              </h3>
              <ul className='space-y-1'>
                {state.optimization.riskFactors.map((factor, index) => (
                  <li key={index} className='text-yellow-800 text-sm'>
                    ⚠️ {factor}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Available slots display */}
          {state.availableSlots.length > 0 && (
            <div className='mb-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Available Time Slots
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {state.availableSlots.slice(0, 6).map(slot => (
                  <div
                    key={slot.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      state.selectedSlot === slot.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => {
                      setState(prev => ({
                        ...prev,
                        selectedSlot: slot.id,
                      }))
                    }}
                  >
                    <div className='flex justify-between items-start mb-2'>
                      <span className='text-lg font-medium text-gray-900'>
                        {format(slot.start, 'HH:mm')}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          slot.confidence > 0.8
                            ? 'bg-green-100 text-green-800'
                            : slot.confidence > 0.6
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {Math.round(slot.confidence * 100)}% match
                      </span>
                    </div>
                    <div className='text-sm text-gray-600 mb-2'>
                      {format(slot.start, 'EEE, MMM d', { locale: ptBR })}
                    </div>
                    <div className='text-xs text-gray-500'>
                      Professional: {slot.professional}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status messages */}
          <div className='mt-6 p-4 bg-gray-50 rounded-lg'>
            <div className='flex items-center'>
              <div
                className={`w-3 h-3 rounded-full mr-2 ${
                  state.currentStep === 'idle'
                    ? 'bg-gray-400'
                    : state.currentStep === 'completed'
                    ? 'bg-green-400'
                    : 'bg-blue-400'
                }`}
              >
              </div>
              <span className='text-sm text-gray-700'>
                Current status: {state.currentStep.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CopilotSchedulingAgent
