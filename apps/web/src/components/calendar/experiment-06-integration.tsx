import { useMemo, useState } from 'react';
import { EventCalendar } from '@/components/event-calendar/event-calendar';
import { useCalendarContext } from '@/components/event-calendar/calendar-context';
import { type CalendarEvent, type EventColor } from '@/components/event-calendar/types';
import { type CalendarAppointment } from '@/services/appointments.service';

interface Experiment06CalendarIntegrationProps {
  appointments: CalendarAppointment[];
  onEventUpdate: (event: CalendarEvent, updates?: Partial<CalendarEvent>) => void;
  onEventDelete: (eventId: string) => void;
  onNewConsultation?: () => void;
  className?: string;
}

// Map appointment status/colors to experiment-06 colors
function mapAppointmentColorToEventColor(color: string | undefined): EventColor {
  const colorMap: Record<string, EventColor> = {
    '#3b82f6': 'blue',
    '#f59e0b': 'orange', 
    '#8b5cf6': 'violet',
    '#f43f5e': 'rose',
    '#10b981': 'emerald',
    '#f97316': 'orange',
    blue: 'blue',
    yellow: 'orange',
    purple: 'violet', 
    red: 'rose',
    green: 'emerald',
    orange: 'orange',
  };
  
  return colorMap[color || 'blue'] || 'blue';
}

// Convert appointments to calendar events
function mapAppointmentToCalendarEvent(appointment: CalendarAppointment): CalendarEvent {
  return {
    id: appointment.id,
    title: appointment.title || 'Consulta',
    description: appointment.description,
    start: new Date(appointment.start),
    end: new Date(appointment.end),
    color: mapAppointmentColorToEventColor(appointment.color),
    location: appointment.location,
    allDay: appointment.allDay || false,
  };
}

export function Experiment06CalendarIntegration({
  appointments,
  onEventUpdate,
  onEventDelete,
  onNewConsultation,
  className
}: Experiment06CalendarIntegrationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convert appointments to calendar events
  const calendarEvents = useMemo(() => {
    try {
      return appointments.map(mapAppointmentToCalendarEvent);
    } catch (err) {
      setError('Erro ao converter agendamentos para eventos do calendário');
      console.error('Error mapping appointments to calendar events:', err);
      return [];
    }
  }, [appointments]);

  // Handle event updates from the calendar
  const handleEventUpdate = (event: CalendarEvent, updates?: Partial<CalendarEvent>) => {
    setIsLoading(true);
    try {
      onEventUpdate(event, updates);
    } catch (err) {
      setError('Erro ao atualizar evento');
      console.error('Error updating event:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle event deletions from the calendar
  const handleEventDelete = (eventId: string) => {
    setIsLoading(true);
    try {
      onEventDelete(eventId);
    } catch (err) {
      setError('Erro ao excluir evento');
      console.error('Error deleting event:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className={`p-4 border border-red-200 rounded-md bg-red-50 ${className}`}>
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  const { isColorVisible } = useCalendarContext();

  // Filter events based on visible colors
  const visibleEvents = useMemo(() => {
    return calendarEvents.filter((event) => isColorVisible(event.color));
  }, [calendarEvents, isColorVisible]);

  return (
    <div className={className}>
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
      <EventCalendar
        events={visibleEvents}
        onEventUpdate={handleEventUpdate}
        onEventDelete={handleEventDelete}
        onEventAdd={onNewConsultation ? () => {
          if (onNewConsultation) {
            const newEvent: CalendarEvent = {
              id: '',
              title: 'Nova Consulta',
              start: new Date(),
              end: new Date(Date.now() + 60 * 60 * 1000),
              color: 'blue'
            };
            onNewConsultation();
          }
        } : undefined}
        className="relative"
        initialView="week"
      />
    </div>
  );
}