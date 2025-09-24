/**
 * Main Event Calendar Component
 */

import React, { useCallback, useState } from 'react';
import type {
  CalendarComponentProps,
  CalendarEvent,
  CalendarFilters,
  CalendarState,
  CalendarView,
  TimeSlot,
} from '../../types/event-calendar';
import { CalendarHeader } from './CalendarHeader';
import { DayView } from './DayView';
import { EventForm } from './EventForm';
import { EventModal } from './EventModal';
import { MonthView } from './MonthView';
import { formatCalendarDate } from './utils';
import { WeekView } from './WeekView';

export function EventCalendar({
  events,
  view: initialView,
  filters: initialFilters = {},
  onEventClick,
  onDateChange,
  onViewChange,
  onFiltersChange,
  onEventCreate,
  onEventUpdate,
  onEventDelete,
  isLoading = false,
  workingHours = { start: 8, end: 18 },
  intervalMinutes = 15,
}: CalendarComponentProps) {
  // State management
  const [state, setState] = useState<CalendarState>(() => ({
    currentDate: new Date(),
    currentView: initialView || { type: 'week', date: new Date() },
    selectedEvent: undefined,
    isCreatingEvent: false,
    filters: initialFilters,
    isLoading,
  }));

  // Actions
  const setDate = useCallback((date: Date) => {
    setState(prev => ({ ...prev, currentDate: date }));
    onDateChange?.(date);
  }, [onDateChange]);

  const setView = useCallback((view: CalendarView) => {
    setState(prev => ({ ...prev, currentView: view }));
    onViewChange?.(view);
  }, [onViewChange]);

  const setSelectedEvent = useCallback((event?: CalendarEvent) => {
    setState(prev => ({ ...prev, selectedEvent: event }));
  }, []);

  const setFilters = useCallback((newFilters: Partial<CalendarFilters>) => {
    const updatedFilters = { ...state.filters, ...newFilters };
    setState(prev => ({ ...prev, filters: updatedFilters }));
    onFiltersChange?.(updatedFilters);
  }, [state.filters, onFiltersChange]);

  const startCreatingEvent = useCallback((date?: Date, timeSlot?: TimeSlot) => {
    setState(prev => ({
      ...prev,
      isCreatingEvent: true,
      selectedEvent: date
        ? {
          id: '',
          title: '',
          start: timeSlot?.start || date,
          end: timeSlot?.end || new Date(date.getTime() + 60 * 60 * 1000),
          type: 'appointment',
          clinicId: '',
          status: 'scheduled',
        }
        : undefined,
    }));
  }, []);

  const stopCreatingEvent = useCallback(() => {
    setState(prev => ({ ...prev, isCreatingEvent: false, selectedEvent: undefined }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  // Event handlers
  const handleEventClick = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    onEventClick?.(event);
  }, [onEventClick]);

  const handleDateClick = useCallback((date: Date, timeSlot?: TimeSlot) => {
    if (onEventCreate) {
      startCreatingEvent(date, timeSlot);
    }
  }, [onEventCreate, startCreatingEvent]);

  const handleEventSave = useCallback(async (eventData: Omit<CalendarEvent, 'id'>) => {
    try {
      if (state.selectedEvent?.id) {
        await onEventUpdate?.({ ...(eventData as any), id: state.selectedEvent.id } as any);
      } else {
        await onEventCreate?.(eventData as any);
      }
      stopCreatingEvent();
      setSelectedEvent(undefined);
    } catch (error) {
      console.error('Failed to save event:', error);
    }
  }, [state.selectedEvent, onEventCreate, onEventUpdate, stopCreatingEvent, setSelectedEvent]);

  const handleEventDelete = useCallback(async (eventId: string) => {
    try {
      await onEventDelete?.(eventId);
      setSelectedEvent(undefined);
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  }, [onEventDelete, setSelectedEvent]);

  // Render current view
  const renderCurrentView = () => {
    const filteredEvents = events.filter(event => {
      // Apply filters
      if (state.filters.type && !state.filters.type.includes(event.type)) return false;
      if (state.filters.status && !state.filters.status.includes(event.status)) return false;
      if (state.filters.professionalId && event.professionalId !== state.filters.professionalId) {
        return false;
      }
      if (state.filters.patientId && event.patientId !== state.filters.patientId) return false;
      if (state.filters.searchQuery) {
        const query = state.filters.searchQuery.toLowerCase();
        const searchText = `${event.title} ${event.patientName || ''} ${event.notes || ''}`
          .toLowerCase();
        if (!searchText.includes(query)) return false;
      }
      return true;
    });

    const commonProps = {
      events: filteredEvents,
      filters: state.filters,
      onEventClick: handleEventClick,
      workingHours,
      intervalMinutes,
    };

    switch (state.currentView.type) {
      case 'day':
        return (
          <DayView
            {...commonProps}
            date={state.currentDate}
            onTimeSlotClick={handleDateClick}
          />
        );
      case 'week':
        return (
          <WeekView
            {...commonProps}
            date={state.currentDate}
            onDateClick={handleDateClick}
          />
        );
      case 'month':
        return (
          <MonthView
            {...commonProps}
            date={state.currentDate}
            onDateClick={handleDateClick}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className='calendar-container w-full h-full flex flex-col bg-white'>
      {/* Header */}
      <CalendarHeader
        currentDate={state.currentDate}
        view={state.currentView}
        onViewChange={setView}
        onDateChange={setDate}
        onTodayClick={() => setDate(new Date())}
      />

      {/* Main Content */}
      <div className='calendar-content flex-1 overflow-hidden'>
        {state.isLoading
          ? (
            <div className='flex items-center justify-center h-full'>
              <div className='text-gray-500'>Carregando calendário...</div>
            </div>
          )
          : (
            renderCurrentView()
          )}
      </div>

      {/* Event Modal */}
      {state.selectedEvent && !state.isCreatingEvent && (
        <EventModal
          event={state.selectedEvent}
          isOpen={!!state.selectedEvent}
          onClose={() => setSelectedEvent(undefined)}
          onEdit={event => {
            setSelectedEvent(event);
            setState(prev => ({ ...prev, isCreatingEvent: true }));
          }}
          onDelete={handleEventDelete}
          canEdit={true}
          canDelete={true}
        />
      )}

      {/* Event Form */}
      {(state.isCreatingEvent || state.selectedEvent) && (
        <EventForm
          event={state.selectedEvent}
          startDate={state.selectedEvent?.start}
          timeSlot={state.selectedEvent
            ? {
              start: state.selectedEvent.start,
              end: state.selectedEvent.end,
              available: true,
            }
            : undefined}
          onSave={handleEventSave}
          onCancel={() => {
            stopCreatingEvent();
            setSelectedEvent(undefined);
          }}
          isLoading={state.isLoading}
        />
      )}
    </div>
  );
}

export default EventCalendar;
