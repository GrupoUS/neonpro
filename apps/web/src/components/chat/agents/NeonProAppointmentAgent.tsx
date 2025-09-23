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

import React, { useState, useCallback, useEffect } from 'react';
import { useCopilotAction, useCopilotReadable, useCoAgent } from '@copilotkit/react-core';
import { useNeonProChat } from '../NeonProChatProvider';
import { NeonProMessage, NeonProAppointmentCard } from '../NeonProChatComponents';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Alert, AlertDescription } from '../../ui/alert';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Search, 
  Plus,
  Shield,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Target,
  Zap,
  Brain
} from 'lucide-react';
import { format, addDays, addHours, isAfter, isBefore, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Types
interface TimeSlot {
  id: string;
  start: Date;
  end: Date;
  professional: string;
  room: string;
  confidence: number;
  efficiency: number;
  noShowRisk: number;
  optimizationScore: number;
}

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  service: string;
  dateTime: Date;
  duration: number;
  professional: string;
  room: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
  revenue?: number;
}

interface Professional {
  id: string;
  name: string;
  specialty: string;
  availability: Array<{
    day: string;
    startTime: string;
    endTime: string;
  }>;
  performance: {
    completionRate: number;
    noShowRate: number;
    patientSatisfaction: number;
  };
}

interface AppointmentAgentState {
  currentOperation: 'idle' | 'searching_slots' | 'scheduling' | 'optimizing' | 'confirming';
  searchCriteria: {
    service: string;
    duration: number;
    preferredDates: Date[];
    preferredProfessionals: string[];
    urgency: 'low' | 'medium' | 'high' | 'urgent';
    patientId?: string;
  };
  availableSlots: TimeSlot[];
  selectedSlot?: TimeSlot;
  scheduledAppointments: Appointment[];
  optimization: {
    suggestions: string[];
    riskFactors: string[];
    recommendations: string[];
    efficiency: number;
  };
  professionals: Professional[];
  metrics: {
    totalSlots: number;
    optimalSlots: number;
    conflicts: number;
    utilization: number;
  };
}

interface AppointmentAgentProps {
  clinicId: string;
  onAppointmentScheduled?: (appointmentId: string) => void;
  onAppointmentAction?: (action: string, appointmentId: string) => void;
  onError?: (error: string) => void;
}

// Mock data
const mockProfessionals: Professional[] = [
  {
    id: '1',
    name: 'Dra. Ana Carolina Silva',
    specialty: 'Dermatologia Estética',
    availability: [
      { day: 'monday', startTime: '09:00', endTime: '18:00' },
      { day: 'wednesday', startTime: '09:00', endTime: '18:00' },
      { day: 'friday', startTime: '09:00', endTime: '17:00' }
    ],
    performance: {
      completionRate: 0.95,
      noShowRate: 0.08,
      patientSatisfaction: 4.8
    }
  },
  {
    id: '2',
    name: 'Dr. Carlos Eduardo Mendes',
    specialty: 'Cirurgia Plástica',
    availability: [
      { day: 'tuesday', startTime: '08:00', endTime: '17:00' },
      { day: 'thursday', startTime: '08:00', endTime: '17:00' },
      { day: 'saturday', startTime: '09:00', endTime: '13:00' }
    ],
    performance: {
      completionRate: 0.92,
      noShowRate: 0.12,
      patientSatisfaction: 4.6
    }
  }
];

const mockServices = [
  { name: 'Botox', duration: 30, baseRevenue: 800 },
  { name: 'Preenchimento Labial', duration: 45, baseRevenue: 1200 },
  { name: 'Fio de Sustentação', duration: 60, baseRevenue: 2500 },
  { name: 'Laser CO2', duration: 90, baseRevenue: 1800 },
  { name: 'Limpeza de Pele', duration: 60, baseRevenue: 300 },
  { name: 'Peeling Químico', duration: 45, baseRevenue: 600 }
];

export const NeonProAppointmentAgent: React.FC<AppointmentAgentProps> = ({
  clinicId,
  onAppointmentScheduled,
  onAppointmentAction,
  onError
}) => {
  const { config } = useNeonProChat();

  // Initialize agent state
  const initialState: AppointmentAgentState = {
    currentOperation: 'idle',
    searchCriteria: {
      service: '',
      duration: 30,
      preferredDates: [],
      preferredProfessionals: [],
      urgency: 'medium'
    },
    availableSlots: [],
    scheduledAppointments: [],
    optimization: {
      suggestions: [],
      riskFactors: [],
      recommendations: [],
      efficiency: 0
    },
    professionals: mockProfessionals,
    metrics: {
      totalSlots: 0,
      optimalSlots: 0,
      conflicts: 0,
      utilization: 0
    }
  };

  const { state, setState } = useCoAgent<AppointmentAgentState>({
    name: 'appointment-agent',
    initialState
  });

  // Provide context to CopilotKit
  useCopilotReadable({
    description: 'Current appointment scheduling state and context',
    value: {
      currentOperation: state.currentOperation,
      availableSlotsCount: state.availableSlots.length,
      selectedSlot: state.selectedSlot,
      searchCriteria: state.searchCriteria,
      optimization: state.optimization,
      metrics: state.metrics
    }
  }, [state]);

  // Find available time slots action
  useCopilotAction({
    name: 'find_available_slots',
    description: 'Find optimal time slots for appointment scheduling',
    parameters: [
      { name: 'service', type: 'string', description: 'Service type', required: true },
      { name: 'duration', type: 'number', description: 'Duration in minutes', required: true },
      { name: 'preferredDates', type: 'string[]', description: 'Preferred date ranges (YYYY-MM-DD)', required: false },
      { name: 'preferredProfessionals', type: 'string[]', description: 'Preferred professional names', required: false },
      { name: 'urgency', type: 'string', description: 'Priority level (low, medium, high, urgent)', required: false },
    ],
    handler: async (
      service: string,
      duration: number,
      preferredDates: string[] = [],
      preferredProfessionals: string[] = [],
      urgency: string = 'medium'
    ) => {
      try {
        setState(prev => ({
          ...prev,
          currentOperation: 'searching_slots',
          searchCriteria: {
            ...prev.searchCriteria,
            service,
            duration,
            preferredDates: preferredDates.map(d => new Date(d)),
            preferredProfessionals,
            urgency: urgency as 'low' | 'medium' | 'high' | 'urgent'
          }
        }));

        // Simulate search delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Generate available slots with AI optimization
        const slots = generateOptimalSlots(
          service,
          duration,
          preferredDates.map(d => new Date(d)),
          preferredProfessionals
        );

        const optimization = generateOptimizationInsights(slots, service, urgency);

        setState(prev => ({
          ...prev,
          currentOperation: 'idle',
          availableSlots: slots,
          optimization,
          metrics: calculateMetrics(slots)
        }));

        return `Found ${slots.length} optimal time slots for ${service}`;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to find available slots';
        onError?.(errorMessage);
        setState(prev => ({ ...prev, currentOperation: 'idle' }));
        throw error;
      }
    }
  });

  // Schedule appointment action
  useCopilotAction({
    name: 'schedule_appointment',
    description: 'Schedule an appointment in the selected time slot',
    parameters: [
      { name: 'patientId', type: 'string', description: 'Patient ID', required: true },
      { name: 'patientName', type: 'string', description: 'Patient name', required: true },
      { name: 'slotId', type: 'string', description: 'Selected time slot ID', required: true },
      { name: 'notes', type: 'string', description: 'Additional notes', required: false },
    ],
    handler: async (patientId: string, patientName: string, slotId: string, notes?: string) => {
      try {
        setState(prev => ({ ...prev, currentOperation: 'scheduling' }));

        const selectedSlot = state.availableSlots.find(slot => slot.id === slotId);
        if (!selectedSlot) {
          throw new Error('Selected slot not found');
        }

        // Simulate scheduling delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Create appointment
        const newAppointment: Appointment = {
          id: `apt-${Date.now()}`,
          patientId,
          patientName,
          service: state.searchCriteria.service,
          dateTime: selectedSlot.start,
          duration: state.searchCriteria.duration,
          professional: selectedSlot.professional,
          room: selectedSlot.room,
          status: 'scheduled',
          priority: state.searchCriteria.urgency,
          notes,
          revenue: calculateRevenue(state.searchCriteria.service)
        };

        setState(prev => ({
          ...prev,
          currentOperation: 'idle',
          scheduledAppointments: [...prev.scheduledAppointments, newAppointment],
          selectedSlot: undefined
        }));

        onAppointmentScheduled?.(newAppointment.id);
        return `Appointment scheduled successfully for ${patientName} on ${format(selectedSlot.start, 'PPP', { locale: ptBR })}`;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to schedule appointment';
        onError?.(errorMessage);
        setState(prev => ({ ...prev, currentOperation: 'idle' }));
        throw error;
      }
    }
  });

  // Optimize schedule action
  useCopilotAction({
    name: 'optimize_schedule',
    description: 'AI-powered schedule optimization for better resource utilization',
    parameters: [
      { name: 'dateRange', type: 'string', description: 'Date range to optimize (YYYY-MM-DD to YYYY-MM-DD)', required: true },
      { name: 'objective', type: 'string', description: 'Optimization objective (efficiency, revenue, satisfaction)', required: false },
    ],
    handler: async (dateRange: string, objective: string = 'efficiency') => {
      try {
        setState(prev => ({ ...prev, currentOperation: 'optimizing' }));

        // Simulate optimization delay
        await new Promise(resolve => setTimeout(resolve, 3000));

        const optimization = generateAdvancedOptimization(objective);

        setState(prev => ({
          ...prev,
          currentOperation: 'idle',
          optimization: {
            ...prev.optimization,
            ...optimization
          }
        }));

        return `Schedule optimized successfully for ${objective}`;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to optimize schedule';
        onError?.(errorMessage);
        setState(prev => ({ ...prev, currentOperation: 'idle' }));
        throw error;
      }
    }
  });

  // Handle slot selection
  const handleSlotSelect = useCallback((slot: TimeSlot) => {
    setState(prev => ({
      ...prev,
      selectedSlot: slot,
      currentOperation: 'confirming'
    }));
  }, []);

  // Generate optimal time slots (mock implementation)
  const generateOptimalSlots = (
    service: string,
    duration: number,
    preferredDates: Date[],
    preferredProfessionals: string[]
  ): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const serviceInfo = mockServices.find(s => s.name.toLowerCase().includes(service.toLowerCase()));
    const actualDuration = serviceInfo?.duration || duration;

    // Generate slots for the next 7 days
    const startDate = preferredDates.length > 0 ? 
      new Date(Math.min(...preferredDates.map(d => d.getTime()))) : 
      new Date();

    for (let day = 0; day < 7; day++) {
      const currentDate = addDays(startDate, day);
      
      mockProfessionals.forEach(professional => {
        if (preferredProfessionals.length > 0 && !preferredProfessionals.includes(professional.name)) {
          return;
        }

        // Generate slots during working hours
        for (let hour = 9; hour < 18; hour++) {
          for (let minute = 0; minute < 60; minute += 30) {
            const slotStart = new Date(currentDate);
            slotStart.setHours(hour, minute, 0, 0);
            const slotEnd = new Date(slotStart.getTime() + actualDuration * 60000);

            // Skip if in the past
            if (isBefore(slotEnd, new Date())) continue;

            // Calculate optimization metrics
            const confidence = Math.random() * 0.4 + 0.6; // 60-100%
            const efficiency = Math.random() * 0.3 + 0.7; // 70-100%
            const noShowRisk = Math.random() * 0.2; // 0-20%
            const optimizationScore = (confidence + efficiency - noShowRisk) / 2;

            slots.push({
              id: `slot-${slots.length}`,
              start: slotStart,
              end: slotEnd,
              professional: professional.name,
              room: `Sala ${(slots.length % 5) + 1}`,
              confidence,
              efficiency,
              noShowRisk,
              optimizationScore
            });
          }
        }
      });
    }

    // Sort by optimization score and return top 20
    return slots
      .sort((a, b) => b.optimizationScore - a.optimizationScore)
      .slice(0, 20);
  };

  // Generate optimization insights
  const generateOptimizationInsights = (slots: TimeSlot[], service: string, urgency: string) => {
    const avgConfidence = slots.reduce((sum, slot) => sum + slot.confidence, 0) / slots.length;
    const avgEfficiency = slots.reduce((sum, slot) => sum + slot.efficiency, 0) / slots.length;
    const avgNoShowRisk = slots.reduce((sum, slot) => sum + slot.noShowRisk, 0) / slots.length;

    const suggestions = [
      urgency === 'urgent' ? 'Prioritize slots within 24 hours for urgent cases' : undefined,
      avgNoShowRisk > 0.15 ? 'Consider confirmation calls for high-risk slots' : undefined,
      avgEfficiency < 0.8 ? 'Optimize resource allocation for better efficiency' : undefined,
      'Morning slots show 15% higher attendance rates',
      'Mid-week appointments have optimal professional availability'
    ].filter(Boolean) as string[];

    const riskFactors = slots
      .filter(slot => slot.noShowRisk > 0.15)
      .map(slot => `${format(slot.start, 'HH:mm')} - ${slot.noShowRisk > 0.2 ? 'Alto risco' : 'Médio risco'} de não comparecimento`);

    const recommendations = [
      'Envie lembretes 24h antes via WhatsApp',
      'Considere horários vespertinos para maior taxa de comparecimento',
      'Agrupe procedimentos similares para otimizar tempo do profissional',
      'Mantenha 10% de buffer entre agendamentos para atrasos'
    ];

    return {
      suggestions,
      riskFactors,
      recommendations,
      efficiency: avgEfficiency
    };
  };

  // Calculate metrics
  const calculateMetrics = (slots: TimeSlot[]) => {
    const optimalSlots = slots.filter(slot => slot.optimizationScore > 0.8);
    const conflicts = Math.floor(slots.length * 0.1); // Mock conflicts
    const utilization = (optimalSlots.length / slots.length) * 100;

    return {
      totalSlots: slots.length,
      optimalSlots: optimalSlots.length,
      conflicts,
      utilization
    };
  };

  // Calculate revenue
  const calculateRevenue = (service: string) => {
    const serviceInfo = mockServices.find(s => s.name.toLowerCase().includes(service.toLowerCase()));
    return serviceInfo?.baseRevenue || 500;
  };

  // Generate advanced optimization
  const generateAdvancedOptimization = (objective: string) => {
    const baseSuggestions = [
      'Redistribuir agendamentos para melhor utilização de recursos',
      'Identificar padrões de não comparecimento e ajustar estratégias',
      'Otimizar intervalos entre procedimentos para reduzir tempo ocioso'
    ];

    const specificRecommendations = {
      efficiency: [
        'Agrupar procedimentos por tipo para reduzir setup time',
        'Alocar profissionais conforme especialidade e demanda',
        'Implementar sistema de triagem para melhor direcionamento'
      ],
      revenue: [
        'Priorizar procedimentos de maior valor em horários de pico',
        'Otimizar mix de serviços para maximizar receita por hora',
        'Identificar oportunidades para upsell de serviços complementares'
      ],
      satisfaction: [
        'Oferecer horários preferenciais para pacientes fiéis',
        'Reduzir tempo de espera entre check-in e procedimento',
        'Personalizar experiência baseada no histórico do paciente'
      ]
    };

    return {
      suggestions: baseSuggestions,
      riskFactors: [
        'Alta demanda nos finais de semana pode causar sobrecarga',
        'Distribuição desigual de procedimentos entre profissionais',
        'Picos de demanda em horários específicos do dia'
      ],
      recommendations: specificRecommendations[objective as keyof typeof specificRecommendations] || specificRecommendations.efficiency,
      efficiency: Math.random() * 0.3 + 0.7
    };
  };

  // Get status icon
  const getStatusIcon = () => {
    switch (state.currentOperation) {
      case 'searching_slots': return <Search className="h-4 w-4 text-blue-500" />;
      case 'scheduling': return <Calendar className="h-4 w-4 text-yellow-500" />;
      case 'optimizing': return <Brain className="h-4 w-4 text-purple-500" />;
      case 'confirming': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Assistente de Agendamento Inteligente
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {getStatusIcon()}
            <span>
              {state.currentOperation === 'idle' && 'Pronto para otimizar agendamentos'}
              {state.currentOperation === 'searching_slots' && 'Buscando horários otimizados...'}
              {state.currentOperation === 'scheduling' && 'Agendando consulta...'}
              {state.currentOperation === 'optimizing' && 'Otimizando agenda com IA...'}
              {state.currentOperation === 'confirming' && 'Confirmando agendamento'}
            </span>
          </div>
        </CardHeader>
      </Card>

      {/* Metrics Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Métricas de Otimização
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{state.metrics.totalSlots}</div>
              <div className="text-sm text-gray-600">Total de Slots</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{state.metrics.optimalSlots}</div>
              <div className="text-sm text-gray-600">Slots Ótimos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{state.metrics.conflicts}</div>
              <div className="text-sm text-gray-600">Conflitos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{state.metrics.utilization.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Utilização</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Insights */}
      {state.optimization.suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Insights de Otimização
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-green-700 mb-2">Sugestões de IA</h4>
              <ul className="space-y-1">
                {state.optimization.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm text-green-600">• {suggestion}</li>
                ))}
              </ul>
            </div>

            {state.optimization.riskFactors.length > 0 && (
              <div>
                <h4 className="font-medium text-yellow-700 mb-2">Fatores de Risco</h4>
                <ul className="space-y-1">
                  {state.optimization.riskFactors.map((factor, index) => (
                    <li key={index} className="text-sm text-yellow-600">⚠️ {factor}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h4 className="font-medium text-blue-700 mb-2">Recomendações</h4>
              <ul className="space-y-1">
                {state.optimization.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-blue-600">• {rec}</li>
                ))}
              </ul>
            </div>

            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-purple-700">Eficiência Atual</span>
                <span className="text-lg font-bold text-purple-700">
                  {(state.optimization.efficiency * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Slots */}
      {state.availableSlots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Horários Otimizados Disponíveis</CardTitle>
            <p className="text-sm text-gray-600">
              {state.searchCriteria.service} • {state.searchCriteria.duration} minutos
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {state.availableSlots.slice(0, 12).map((slot) => (
                <div
                  key={slot.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    state.selectedSlot?.id === slot.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                  onClick={() => handleSlotSelect(slot)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-lg font-medium text-gray-900">
                      {format(slot.start, 'HH:mm')}
                    </span>
                    <div className="text-right">
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        slot.optimizationScore > 0.8
                          ? 'bg-green-100 text-green-800'
                          : slot.optimizationScore > 0.6
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {(slot.optimizationScore * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    {format(slot.start, 'EEE, d MMM', { locale: ptBR })}
                  </div>
                  
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>👨‍⚕️ {slot.professional.split(' ')[0]}</div>
                    <div>📍 {slot.room}</div>
                    <div>⚡ {slot.noShowRisk < 0.1 ? 'Baixo risco' : slot.noShowRisk < 0.2 ? 'Médio risco' : 'Alto risco'}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scheduled Appointments */}
      {state.scheduledAppointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Agendamentos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {state.scheduledAppointments.slice(-5).map((appointment) => (
                <NeonProAppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onAction={(action) => onAppointmentAction?.(action, appointment.id)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Slot Confirmation */}
      {state.selectedSlot && (
        <Card className="border-blue-500 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900">Confirmar Agendamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Data:</span>
                    <div>{format(state.selectedSlot.start, 'PPP', { locale: ptBR })}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Horário:</span>
                    <div>{format(state.selectedSlot.start, 'HH:mm')}</div>
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
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setState(prev => ({ ...prev, selectedSlot: undefined }))}
                >
                  Cancelar
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => {
                    // This would trigger the schedule_appointment action
                    setState(prev => ({ ...prev, currentOperation: 'scheduling' }));
                  }}
                >
                  Confirmar Agendamento
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NeonProAppointmentAgent;