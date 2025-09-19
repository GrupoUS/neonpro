import { useMemo } from 'react';
import { BigCalendar } from '@/components/big-calendar';
import { type CalendarEvent, type EventColor } from '@/components/event-calendar/types';
import { type Appointment } from '@/integrations/supabase/types';

interface Experiment06CalendarIntegrationProps {
  appointments: Appointment[];
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
function mapAppointmentToCalendarEvent(appointment: Appointment): CalendarEvent {
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
  // Convert appointments to calendar events
  const calendarEvents = useMemo(() => {
    return appointments.map(mapAppointmentToCalendarEvent);
  }, [appointments]);

  // Handle event updates from the calendar
  const handleEventUpdate = (event: CalendarEvent, updates?: Partial<CalendarEvent>) => {
    onEventUpdate(event, updates);
  };

  // Handle event deletions from the calendar
  const handleEventDelete = (eventId: string) => {
    onEventDelete(eventId);
  };

  return (
    <div className={className}>
      <BigCalendar
        events={calendarEvents}
        onEventUpdate={handleEventUpdate}
        onEventDelete={handleEventDelete}
        onNewConsultation={onNewConsultation}
      />
    </div>
  );
}