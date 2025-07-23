// =============================================
// NeonPro Integrated Calendar View Component
// Story 1.2: Task 6 - Calendar visualization integration
// Research-based implementation with react-big-calendar + alternative slots
// =============================================

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Calendar, dayjsLocalizer, View, NavigateAction } from 'react-big-calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarIcon, Clock, Star, Zap, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Import our enhanced alternative slots system
import { useAlternativeSlots, AlternativeSlot, AlternativeSlotsRequest } from '@/hooks/appointments/use-alternative-slots';
import AlternativeSlotsDisplay from './alternative-slots-display';

// Initialize dayjs plugins for performance (research-based)
dayjs.extend(duration);

// Create the localizer with dayjs (performance optimized)
const localizer = dayjsLocalizer(dayjs);

// Enhanced event interface for calendar integration
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: {
    professionalId: string;
    professionalName: string;
    serviceId: string;
    serviceName: string;
    patientId: string;
    patientName: string;
  };
  // Alternative slot integration
  isAlternativeSlot?: boolean;
  alternativeScore?: number;
  alternativeReasons?: string[];
}

// Enhanced slot info interface
interface EnhancedSlotInfo {
  start: Date;
  end: Date;
  slots: Date[];
  action: 'select' | 'click' | 'doubleClick';
  resourceId?: string;
  bounds?: {
    x: number;
    y: number;
    top: number;
    right: number;
    left: number;
    bottom: number;
  };
  // Research-based enhancements
  suggested?: boolean;
  alternativeScore?: number;
}interface IntegratedCalendarViewProps {
  // Core calendar props
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onSlotSelect?: (slotInfo: EnhancedSlotInfo) => void;
  view?: View;
  date?: Date;
  
  // Professional and service context
  selectedProfessionalId?: string;
  selectedServiceId?: string;
  
  // Alternative slots integration
  enableAlternativeSlots?: boolean;
  conflictDetection?: boolean;
  
  // Research-based UI enhancements
  showPerformanceMetrics?: boolean;
  mobileOptimized?: boolean;
  className?: string;
}

export default function IntegratedCalendarView({
  events,
  onEventClick,
  onSlotSelect,
  view = 'week',
  date = new Date(),
  selectedProfessionalId,
  selectedServiceId,
  enableAlternativeSlots = true,
  conflictDetection = true,
  showPerformanceMetrics = false,
  mobileOptimized = true,
  className,
}: IntegratedCalendarViewProps) {
  // State management with performance optimization
  const [currentView, setCurrentView] = useState<View>(view);
  const [currentDate, setCurrentDate] = useState<Date>(date);
  const [selectedSlot, setSelectedSlot] = useState<EnhancedSlotInfo | null>(null);
  const [showAlternativesDialog, setShowAlternativesDialog] = useState(false);
  const [conflictingEvent, setConflictingEvent] = useState<CalendarEvent | null>(null);

  // Alternative slots integration
  const alternativeSlots = useAlternativeSlots();

  // Performance-optimized event processing (research-based)
  const processedEvents = useMemo(() => {
    return events.map(event => ({
      ...event,
      // Enhanced rendering for alternative slots
      style: event.isAlternativeSlot ? {
        backgroundColor: '#10b981', // Green for alternatives
        borderColor: '#059669',
        opacity: 0.8,
      } : undefined,
    }));
  }, [events]);

  // Conflict detection with real-time validation
  const detectConflict = useCallback((slotInfo: EnhancedSlotInfo): CalendarEvent | null => {
    if (!conflictDetection) return null;
    
    const { start, end } = slotInfo;
    
    return events.find(event => {
      const eventStart = dayjs(event.start);
      const eventEnd = dayjs(event.end);
      const slotStart = dayjs(start);
      const slotEnd = dayjs(end);
      
      // Check for overlap using dayjs optimization
      return (slotStart.isBefore(eventEnd) && slotEnd.isAfter(eventStart)) ||
             (slotStart.isSameOrAfter(eventStart) && slotStart.isBefore(eventEnd)) ||
             (slotEnd.isAfter(eventStart) && slotEnd.isSameOrBefore(eventEnd));
    }) || null;
  }, [events, conflictDetection]);  // Enhanced slot selection with conflict handling
  const handleSlotSelect = useCallback(async (slotInfo: any) => {
    const enhancedSlotInfo: EnhancedSlotInfo = {
      ...slotInfo,
      suggested: false,
      alternativeScore: 0,
    };

    // Detect conflicts immediately
    const conflict = detectConflict(enhancedSlotInfo);
    
    if (conflict) {
      // Handle conflict - show alternative suggestions
      setConflictingEvent(conflict);
      setSelectedSlot(enhancedSlotInfo);
      
      if (enableAlternativeSlots && selectedProfessionalId && selectedServiceId) {
        // Request alternative slots using our enhanced system
        const alternativeRequest: AlternativeSlotsRequest = {
          professional_id: selectedProfessionalId,
          service_type_id: selectedServiceId,
          preferred_start_time: dayjs(slotInfo.start).format('YYYY-MM-DD HH:mm:ss'),
          duration_minutes: dayjs(slotInfo.end).diff(dayjs(slotInfo.start), 'minutes'),
          search_window_days: 7,
          max_suggestions: 5,
        };
        
        await alternativeSlots.getSuggestions(alternativeRequest);
        setShowAlternativesDialog(true);
      }
    } else {
      // No conflict - proceed with selection
      setSelectedSlot(enhancedSlotInfo);
      onSlotSelect?.(enhancedSlotInfo);
    }
  }, [detectConflict, enableAlternativeSlots, selectedProfessionalId, selectedServiceId, alternativeSlots, onSlotSelect]);

  // Enhanced event styling with research-based visual indicators
  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    let backgroundColor = '#3174ad'; // Default blue
    let borderColor = '#265985';
    let color = 'white';
    
    if (event.isAlternativeSlot) {
      // Alternative slot styling (research-based colors)
      backgroundColor = event.alternativeScore && event.alternativeScore > 80 ? '#10b981' : '#f59e0b';
      borderColor = event.alternativeScore && event.alternativeScore > 80 ? '#059669' : '#d97706';
    }
    
    if (event.resource?.professionalId === selectedProfessionalId) {
      // Highlight selected professional's events
      backgroundColor = '#8b5cf6';
      borderColor = '#7c3aed';
    }
    
    return {
      style: {
        backgroundColor,
        borderColor,
        color,
        border: `2px solid ${borderColor}`,
        borderRadius: '6px',
        fontSize: '0.875rem',
        fontWeight: '500',
      }
    };
  }, [selectedProfessionalId]);

  // Research-based mobile optimization
  const mobileProps = useMemo(() => {
    if (!mobileOptimized) return {};
    
    return {
      popup: true,
      popupOffset: { x: 10, y: 10 },
      step: 30, // 30-minute increments for mobile
      timeslots: 2, // Show 2 time slots per hour
      showMultiDayTimes: false,
    };
  }, [mobileOptimized]);

  // Custom components for enhanced UX
  const components = useMemo(() => ({
    // Custom event component with alternative slot indicators
    event: ({ event }: { event: CalendarEvent }) => (
      <div className="flex items-center gap-1 truncate">
        {event.isAlternativeSlot && (
          <Star className="h-3 w-3 text-yellow-400 flex-shrink-0" />
        )}
        <span className="truncate text-sm">{event.title}</span>
        {event.alternativeScore && event.alternativeScore > 80 && (
          <Zap className="h-3 w-3 text-green-400 flex-shrink-0" />
        )}
      </div>
    ),
  }), []);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Performance metrics display (research-based) */}
      {showPerformanceMetrics && alternativeSlots.performanceMetrics && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Calendar Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Load Time</p>
                <p className="font-medium">{alternativeSlots.performanceMetrics.searchTime.toFixed(0)}ms</p>
              </div>
              <div>
                <p className="text-muted-foreground">Algorithm Efficiency</p>
                <p className="font-medium">
                  {(alternativeSlots.performanceMetrics.algorithm_efficiency * 100).toFixed(0)}%
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Available Slots</p>
                <p className="font-medium">{alternativeSlots.performanceMetrics.totalOptions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}      {/* Main Calendar with Enhanced Integration */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Agenda Integrada
            {conflictDetection && (
              <Badge variant="secondary" className="text-xs">
                Detecção de Conflitos Ativa
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Visualização completa com sugestões alternativas integradas
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[600px] p-4">
            <Calendar
              localizer={localizer}
              events={processedEvents}
              startAccessor="start"
              endAccessor="end"
              titleAccessor="title"
              view={currentView}
              date={currentDate}
              onView={setCurrentView}
              onNavigate={setCurrentDate}
              onSelectEvent={(event) => onEventClick?.(event as CalendarEvent)}
              onSelectSlot={handleSlotSelect}
              eventPropGetter={eventStyleGetter}
              components={components}
              selectable
              popup
              step={15}
              timeslots={4}
              min={dayjs().hour(6).minute(0).toDate()}  // 6:00 AM
              max={dayjs().hour(22).minute(0).toDate()} // 10:00 PM
              formats={{
                timeGutterFormat: 'HH:mm',
                eventTimeRangeFormat: ({ start, end }) => 
                  `${dayjs(start).format('HH:mm')} - ${dayjs(end).format('HH:mm')}`,
                agendaTimeFormat: 'HH:mm',
                agendaDateFormat: 'DD/MM/YYYY',
              }}
              messages={{
                allDay: 'Dia Todo',
                previous: 'Anterior',
                next: 'Próximo',
                today: 'Hoje',
                month: 'Mês',
                week: 'Semana', 
                day: 'Dia',
                agenda: 'Agenda',
                date: 'Data',
                time: 'Hora',
                event: 'Agendamento',
                noEventsInRange: 'Nenhum agendamento neste período.',
                showMore: (total) => `+${total} mais`,
              }}
              {...mobileProps}
            />
          </div>
        </CardContent>
      </Card>

      {/* Alternative Slots Dialog with Enhanced Integration */}
      <Dialog open={showAlternativesDialog} onOpenChange={setShowAlternativesDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Conflito Detectado - Horários Alternativos
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="alternatives" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="conflict">Detalhes do Conflito</TabsTrigger>
              <TabsTrigger value="alternatives">Sugestões Alternativas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="conflict" className="space-y-4">
              {conflictingEvent && (
                <Card className="border-red-200 bg-red-50/50">
                  <CardHeader>
                    <CardTitle className="text-red-700 text-lg">Agendamento Conflitante</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-red-600" />
                        <span className="font-medium">{conflictingEvent.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-red-600" />
                        <span>
                          {dayjs(conflictingEvent.start).format('DD/MM/YYYY HH:mm')} - 
                          {dayjs(conflictingEvent.end).format('HH:mm')}
                        </span>
                      </div>
                      {conflictingEvent.resource && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-red-600 font-medium">Profissional:</p>
                            <p>{conflictingEvent.resource.professionalName}</p>
                          </div>
                          <div>
                            <p className="text-red-600 font-medium">Serviço:</p>
                            <p>{conflictingEvent.resource.serviceName}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {selectedSlot && (
                <Card className="border-blue-200 bg-blue-50/50">
                  <CardHeader>
                    <CardTitle className="text-blue-700 text-lg">Horário Solicitado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span>
                        {dayjs(selectedSlot.start).format('DD/MM/YYYY HH:mm')} - 
                        {dayjs(selectedSlot.end).format('HH:mm')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="alternatives">
              <AlternativeSlotsDisplay
                alternativeSlots={alternativeSlots}
                onSelectSlot={(slot) => {
                  // Convert alternative slot to calendar event
                  const alternativeEvent: CalendarEvent = {
                    id: `alt-${slot.start_time}`,
                    title: `Alternativa Sugerida (Score: ${slot.score})`,
                    start: new Date(slot.start_time),
                    end: new Date(slot.end_time),
                    isAlternativeSlot: true,
                    alternativeScore: slot.score,
                    alternativeReasons: slot.reasons,
                  };
                  
                  onEventClick?.(alternativeEvent);
                  setShowAlternativesDialog(false);
                }}
                showPerformanceMetrics={showPerformanceMetrics}
                showBookingProbability={true}
                enableRealtimeFiltering={true}
              />
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => setShowAlternativesDialog(false)}
            >
              Cancelar
            </Button>
            <Button onClick={() => {
              // Handle force booking despite conflict
              if (selectedSlot) {
                onSlotSelect?.(selectedSlot);
                setShowAlternativesDialog(false);
              }
            }}>
              Forçar Agendamento
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}