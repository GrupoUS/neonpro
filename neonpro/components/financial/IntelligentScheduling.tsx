/**
 * TASK-003: Business Logic Enhancement
 * AI-Powered Appointment Scheduling Component
 * 
 * Intelligent scheduling with conflict detection, resource optimization,
 * and automated time slot suggestions.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock, Users, AlertTriangle, CheckCircle, Brain } from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface TimeSlot {
  id: string;
  start: Date;
  end: Date;
  available: boolean;
  conflicts?: string[];
  aiScore?: number;
  reasons?: string[];
}

interface Professional {
  id: string;
  name: string;
  specialties: string[];
  workingHours: {
    start: string;
    end: string;
    days: number[];
  };
  currentLoad: number; // 0-100%
}

interface Patient {
  id: string;
  name: string;
  preferences: {
    preferredDays: number[];
    preferredTimes: string[];
    previousAppointments: Date[];
  };
}

interface Service {
  id: string;
  name: string;
  duration: number; // minutes
  preparationTime: number;
  cleanupTime: number;
  requiredResources: string[];
}

interface IntelligentSchedulingProps {
  patientId?: string;
  serviceId?: string;
  onAppointmentScheduled?: (appointmentId: string) => void;
}

export function IntelligentScheduling({
  patientId,
  serviceId,
  onAppointmentScheduled
}: IntelligentSchedulingProps) {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<TimeSlot[]>([]);
  const [conflicts, setConflicts] = useState<string[]>([]);
  
  const { toast } = useToast();

  // Mock data - In production, these would come from the database
  const professionals: Professional[] = [
    {
      id: 'prof_001',
      name: 'Dra. Marina Silva',
      specialties: ['Dermatologia', 'Estética'],
      workingHours: { start: '08:00', end: '18:00', days: [1, 2, 3, 4, 5] },
      currentLoad: 75
    },
    {
      id: 'prof_002',
      name: 'Dr. Carlos Santos',
      specialties: ['Cirurgia Plástica', 'Estética'],
      workingHours: { start: '09:00', end: '17:00', days: [2, 3, 4, 5, 6] },
      currentLoad: 60
    }
  ];

  const services: Service[] = [
    {
      id: 'srv_001',
      name: 'Consulta Dermatológica',
      duration: 30,
      preparationTime: 5,
      cleanupTime: 5,
      requiredResources: ['sala_consulta']
    },
    {
      id: 'srv_002',
      name: 'Botox Facial',
      duration: 60,
      preparationTime: 15,
      cleanupTime: 15,
      requiredResources: ['sala_procedimento', 'equipamento_botox']
    }
  ];

  // AI-powered time slot analysis
  const analyzeOptimalSlots = async () => {
    if (!selectedDate || !selectedProfessional || !selectedService) return;
    
    setIsAnalyzing(true);
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate time slots for the day
      const slots = generateTimeSlots(selectedDate, selectedProfessional, selectedService);
      
      // AI scoring based on multiple factors
      const scoredSlots = slots.map(slot => ({
        ...slot,
        aiScore: calculateAIScore(slot, selectedPatient, selectedProfessional, selectedService),
        reasons: generateReasons(slot, selectedPatient, selectedProfessional)
      }));
      
      // Sort by AI score and filter available slots
      const availableScored = scoredSlots
        .filter(slot => slot.available)
        .sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));
      
      setAvailableSlots(availableScored);
      setAiRecommendations(availableScored.slice(0, 3)); // Top 3 recommendations
      
      toast({
        title: "Análise Concluída",
        description: `${availableScored.length} slots disponíveis encontrados`,
      });
    } catch (error) {
      toast({
        title: "Erro na Análise",
        description: "Não foi possível analisar os horários",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate time slots for a given day
  const generateTimeSlots = (date: Date, professional: Professional, service: Service): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const dayOfWeek = date.getDay();
    
    if (!professional.workingHours.days.includes(dayOfWeek)) {
      return slots;
    }
    
    const [startHour, startMinute] = professional.workingHours.start.split(':').map(Number);
    const [endHour, endMinute] = professional.workingHours.end.split(':').map(Number);
    
    const totalDuration = service.duration + service.preparationTime + service.cleanupTime;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotStart = new Date(date);
        slotStart.setHours(hour, minute, 0, 0);
        
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + totalDuration);
        
        if (slotEnd.getHours() > endHour || 
           (slotEnd.getHours() === endHour && slotEnd.getMinutes() > endMinute)) {
          break;
        }
        
        // Check for conflicts (mock implementation)
        const hasConflict = Math.random() < 0.3; // 30% chance of conflict
        const conflicts = hasConflict ? ['Consulta já agendada'] : [];
        
        slots.push({
          id: `slot_${hour}_${minute}`,
          start: slotStart,
          end: slotEnd,
          available: !hasConflict,
          conflicts
        });
      }
    }
    
    return slots;
  };

  // Calculate AI score for time slot optimization
  const calculateAIScore = (
    slot: TimeSlot, 
    patient: Patient | null, 
    professional: Professional, 
    service: Service
  ): number => {
    let score = 50; // Base score
    
    // Time preference scoring
    const hour = slot.start.getHours();
    if (hour >= 9 && hour <= 11) score += 20; // Morning preference
    if (hour >= 14 && hour <= 16) score += 15; // Afternoon preference
    
    // Professional load balancing
    const loadPenalty = professional.currentLoad * 0.3;
    score -= loadPenalty;
    
    // Patient preference scoring
    if (patient?.preferences) {
      const dayOfWeek = slot.start.getDay();
      if (patient.preferences.preferredDays.includes(dayOfWeek)) {
        score += 15;
      }
      
      const timeString = format(slot.start, 'HH:mm');
      if (patient.preferences.preferredTimes.includes(timeString)) {
        score += 10;
      }
    }
    
    // Service-specific optimization
    if (service.name.includes('Cirurgia') && hour < 12) {
      score += 25; // Surgeries better in morning
    }
    
    return Math.max(0, Math.min(100, score));
  };

  // Generate reasons for AI recommendations
  const generateReasons = (
    slot: TimeSlot, 
    patient: Patient | null, 
    professional: Professional
  ): string[] => {
    const reasons = [];
    
    const hour = slot.start.getHours();
    if (hour >= 9 && hour <= 11) {
      reasons.push('Horário matinal ideal para concentração');
    }
    
    if (professional.currentLoad < 70) {
      reasons.push('Profissional com menor carga de trabalho');
    }
    
    if (patient?.preferences) {
      const dayOfWeek = slot.start.getDay();
      if (patient.preferences.preferredDays.includes(dayOfWeek)) {
        reasons.push('Corresponde às preferências do paciente');
      }
    }
    
    reasons.push('Sem conflitos de agenda identificados');
    
    return reasons;
  };

  // Detect and resolve scheduling conflicts
  const detectConflicts = async () => {
    if (!selectedSlot || !selectedProfessional || !selectedService) return;
    
    const detected = [];
    
    // Resource conflicts
    const resourceConflicts = checkResourceConflicts(selectedSlot, selectedService);
    detected.push(...resourceConflicts);
    
    // Professional availability
    const professionalConflicts = checkProfessionalConflicts(selectedSlot, selectedProfessional);
    detected.push(...professionalConflicts);
    
    // Patient conflicts
    if (selectedPatient) {
      const patientConflicts = checkPatientConflicts(selectedSlot, selectedPatient);
      detected.push(...patientConflicts);
    }
    
    setConflicts(detected);
    return detected;
  };

  const checkResourceConflicts = (slot: TimeSlot, service: Service): string[] => {
    // Mock implementation - in production, check against resource bookings
    const conflicts = [];
    if (service.requiredResources.includes('sala_procedimento') && Math.random() < 0.2) {
      conflicts.push('Sala de procedimento já reservada');
    }
    return conflicts;
  };

  const checkProfessionalConflicts = (slot: TimeSlot, professional: Professional): string[] => {
    // Mock implementation - in production, check against professional's schedule
    return [];
  };

  const checkPatientConflicts = (slot: TimeSlot, patient: Patient): string[] => {
    // Mock implementation - in production, check against patient's appointments
    return [];
  };

  // Schedule appointment with optimizations
  const scheduleAppointment = async () => {
    if (!selectedSlot || !selectedPatient || !selectedProfessional || !selectedService) {
      toast({
        title: "Dados Incompletos",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    // Final conflict check
    const detectedConflicts = await detectConflicts();
    if (detectedConflicts.length > 0) {
      toast({
        title: "Conflitos Detectados",
        description: "Resolva os conflitos antes de agendar",
        variant: "destructive",
      });
      return;
    }

    try {
      // Simulate appointment creation
      const appointmentData = {
        patientId: selectedPatient.id,
        professionalId: selectedProfessional.id,
        serviceId: selectedService.id,
        start: selectedSlot.start,
        end: selectedSlot.end,
        aiScore: selectedSlot.aiScore,
        scheduledAt: new Date().toISOString()
      };

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const appointmentId = `APP-${Date.now()}`;
      
      toast({
        title: "Agendamento Realizado",
        description: `Consulta agendada com sucesso - ${appointmentId}`,
      });
      
      onAppointmentScheduled?.(appointmentId);
      
    } catch (error) {
      toast({
        title: "Erro no Agendamento",
        description: "Não foi possível realizar o agendamento",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Agendamento Inteligente
          </CardTitle>
          <CardDescription>
            Sistema AI para otimização de horários e detecção de conflitos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selection Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Paciente</Label>
              <Select onValueChange={(value) => {
                const patient: Patient = {
                  id: value,
                  name: 'Maria Silva',
                  preferences: {
                    preferredDays: [1, 2, 4], // Mon, Tue, Thu
                    preferredTimes: ['09:00', '14:00'],
                    previousAppointments: []
                  }
                };
                setSelectedPatient(patient);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar paciente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient_1">Maria Silva</SelectItem>
                  <SelectItem value="patient_2">João Santos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Profissional</Label>
              <Select onValueChange={(value) => {
                const professional = professionals.find(p => p.id === value);
                setSelectedProfessional(professional || null);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar profissional" />
                </SelectTrigger>
                <SelectContent>
                  {professionals.map((prof) => (
                    <SelectItem key={prof.id} value={prof.id}>
                      <div className="flex items-center gap-2">
                        {prof.name}
                        <Badge variant={prof.currentLoad > 80 ? 'destructive' : 'secondary'}>
                          {prof.currentLoad}%
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Serviço</Label>
              <Select onValueChange={(value) => {
                const service = services.find(s => s.id === value);
                setSelectedService(service || null);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar serviço" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} ({service.duration}min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label>Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP", { locale: pt }) : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Analysis Button */}
          <Button 
            onClick={analyzeOptimalSlots}
            disabled={!selectedDate || !selectedProfessional || !selectedService || isAnalyzing}
            className="w-full"
          >
            <Brain className="mr-2 h-4 w-4" />
            {isAnalyzing ? 'Analisando Horários...' : 'Analisar Horários Disponíveis'}
          </Button>

          {/* AI Recommendations */}
          {aiRecommendations.length > 0 && (
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Recomendações AI
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aiRecommendations.map((slot) => (
                  <Card 
                    key={slot.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedSlot?.id === slot.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span className="font-medium">
                            {format(slot.start, 'HH:mm')} - {format(slot.end, 'HH:mm')}
                          </span>
                        </div>
                        <Badge variant="secondary">
                          {slot.aiScore}% Match
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        {slot.reasons?.map((reason, index) => (
                          <p key={index} className="text-xs text-gray-600">
                            • {reason}
                          </p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Available Slots Grid */}
          {availableSlots.length > 0 && (
            <div className="space-y-4">
              <Label>Todos os Horários Disponíveis</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot.id}
                    variant={selectedSlot?.id === slot.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSlot(slot)}
                    className="h-auto p-2 flex flex-col items-center"
                  >
                    <span className="text-sm font-medium">
                      {format(slot.start, 'HH:mm')}
                    </span>
                    {slot.aiScore && (
                      <Badge variant="secondary" className="text-xs mt-1">
                        {slot.aiScore}%
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Conflicts Alert */}
          {conflicts.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Conflitos Detectados</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  {conflicts.map((conflict, index) => (
                    <li key={index}>{conflict}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Schedule Button */}
          <Button 
            onClick={scheduleAppointment}
            disabled={!selectedSlot || conflicts.length > 0}
            className="w-full"
            size="lg"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Confirmar Agendamento
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}