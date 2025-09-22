'use client';

import { etiquettes } from '@/components/big-calendar';
import type {
  CalendarEvent,
  CalendarEventExtended,
  CalendarView,
  CreateEventData,
  EventFilterOptions,
  EventSearchOptions,
  UpdateEventData,
} from '@/components/event-calendar';
import { EventService } from '@/services/event.service';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { toast } from 'sonner';

interface CalendarContextType {
  // Date management
  currentDate: Date;
  setCurrentDate: (date: Date) => void;

  // Etiquette visibility management
  visibleColors: string[];
  toggleColorVisibility: (color: string) => void;
  isColorVisible: (color: string | undefined) => boolean;

  // Event management
  events: CalendarEventExtended[];
  loading: boolean;
  error: string | null;

  // Event CRUD operations
  createEvent: (event: CreateEventData) => Promise<void>;
  updateEvent: (event: UpdateEventData) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  refreshEvents: () => Promise<void>;

  // Event filtering and search
  filteredEvents: CalendarEventExtended[];
  searchEvents: (
    options: EventSearchOptions,
  ) => Promise<{ events: CalendarEventExtended[]; totalCount: number; hasMore: boolean }>;
  applyFilters: (filters: EventFilterOptions) => void;
  clearFilters: () => void;
  currentFilters: EventFilterOptions | null;

  // Calendar navigation
  currentView: CalendarView;
  setCurrentView: (view: CalendarView) => void;
  navigateToDate: (date: Date) => void;
  navigateToToday: () => void;
  navigatePrevious: () => void;
  navigateNext: () => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(
  undefined,
);

export function useCalendarContext() {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error(
      'useCalendarContext must be used within a CalendarProvider',
    );
  }
  return context;
}

interface CalendarProviderProps {
  children: ReactNode;
  initialEvents?: CalendarEventExtended[];
  defaultClinicId?: string;
}

export function CalendarProvider({
  children,
  initialEvents = [],
  defaultClinicId,
}: CalendarProviderProps) {
  // State for date and color management
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<CalendarView>('month');

  // Initialize visibleColors based on the isActive property in etiquettes
  const [visibleColors, setVisibleColors] = useState<string[]>(() => {
    return etiquettes
      .filter(etiquette => etiquette.isActive)
      .map(etiquette => etiquette.color);
  });

  // Event management state
  const [events, setEvents] = useState<CalendarEventExtended[]>(initialEvents);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<EventFilterOptions | null>(null);
  const [filteredEvents, setFilteredEvents] = useState<CalendarEventExtended[]>(initialEvents);

  // Load events for current date range
  const loadEventsForCurrentView = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let startDate: Date;
      let endDate: Date;

      switch (currentView) {
        case 'day':
          startDate = new Date(currentDate);
          endDate = new Date(currentDate);
          endDate.setDate(endDate.getDate() + 1);
          break;
        case 'week':
          startDate = new Date(currentDate);
          startDate.setDate(startDate.getDate() - startDate.getDay()); // Start of week
          endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 7); // End of week
          break;
        case 'month':
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
          endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
          break;
        case 'agenda':
          startDate = new Date(currentDate);
          endDate = new Date(currentDate);
          endDate.setDate(endDate.getDate() + 30); // Show 30 days in agenda
          break;
        default:
          startDate = new Date(currentDate);
          endDate = new Date(currentDate);
          endDate.setDate(endDate.getDate() + 7);
      }

      // Apply clinic filter if available
      const filters: EventFilterOptions = {
        dateRange: { start: startDate, end: endDate },
      };

      if (defaultClinicId) {
        filters.clinicId = [defaultClinicId];
      }

      // Apply current filters if any
      if (currentFilters) {
        Object.assign(filters, currentFilters);
      }

      const fetchedEvents = await EventService.getEvents(filters);
      setEvents(fetchedEvents);
      setFilteredEvents(fetchedEvents);
    } catch (_error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load events';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentDate, currentView, defaultClinicId, currentFilters]);

  // Auto-refresh events when date or view changes
  useEffect(() => {
    loadEventsForCurrentView();
  }, [loadEventsForCurrentView]);

  // Toggle visibility of a color
  const toggleColorVisibility = useCallback((_color: any) => {
    setVisibleColors(prev => {
      if (prev.includes(color)) {
        return prev.filter(c => c !== color);
      } else {
        return [...prev, color];
      }
    });
  }, []);

  // Check if a color is visible
  const isColorVisible = useCallback((color: string | undefined) => {
    if (!color) return true; // Events without a color are always visible
    return visibleColors.includes(color);
  }, [visibleColors]);

  // Event CRUD operations
  const createEvent = useCallback(async (_eventData: any) => {
    setLoading(true);
    setError(null);

    try {
      // Apply clinic ID if not provided
      const finalEventData = {
        ...eventData,
        clinicId: eventData.clinicId || defaultClinicId,
      };

      const newEvent = await EventService.createEvent(finalEventData);

      setEvents(prev => [...prev, newEvent]);

      // Apply filters to new event
      if (currentFilters) {
        // For simplicity, just refresh the filtered events
        loadEventsForCurrentView();
      } else {
        setFilteredEvents(prev => [...prev, newEvent]);
      }

      toast.success(`Event "${newEvent.title}" created successfully`);
    } catch (_error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create event';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [defaultClinicId, currentFilters, loadEventsForCurrentView]);

  const updateEvent = useCallback(async (_eventData: any) => {
    setLoading(true);
    setError(null);

    try {
      const updatedEvent = await EventService.updateEvent(eventData);

      setEvents(prev => prev.map(event => event.id === eventData.id ? updatedEvent : event));

      // Update filtered events
      setFilteredEvents(prev =>
        prev.map(event => event.id === eventData.id ? updatedEvent : event)
      );

      toast.success(`Event "${updatedEvent.title}" updated successfully`);
    } catch (_error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update event';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteEvent = useCallback(async (_id: any) => {
    setLoading(true);
    setError(null);

    try {
      const eventToDelete = events.find(e => e.id === id);

      await EventService.deleteEvent(id);

      setEvents(prev => prev.filter(event => event.id !== id));
      setFilteredEvents(prev => prev.filter(event => event.id !== id));

      if (eventToDelete) {
        toast.success(`Event "${eventToDelete.title}" deleted successfully`);
      }
    } catch (_error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete event';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [events]);

  const refreshEvents = useCallback(async () => {
    await loadEventsForCurrentView();
  }, [loadEventsForCurrentView]);

  // Event filtering and search
  const applyFilters = useCallback((_filters: any) => {
    setCurrentFilters(filters);
    // The actual filtering will happen in the loadEventsForCurrentView effect
  }, []);

  const clearFilters = useCallback(() => {
    setCurrentFilters(null);
  }, []);

  const searchEvents = useCallback(async (_options: any) => {
    try {
      const result = await EventService.searchEvents(options);
      return result;
    } catch (_error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search events';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Calendar navigation
  const navigateToDate = useCallback((_date: any) => {
    setCurrentDate(date);
  }, []);

  const navigateToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const navigatePrevious = useCallback(() => {
    const newDate = new Date(currentDate);
    switch (currentView) {
      case 'day':
        newDate.setDate(newDate.getDate() - 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case 'agenda':
        newDate.setDate(newDate.getDate() - 7);
        break;
    }
    setCurrentDate(newDate);
  }, [currentDate, currentView]);

  const navigateNext = useCallback(() => {
    const newDate = new Date(currentDate);
    switch (currentView) {
      case 'day':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case 'agenda':
        newDate.setDate(newDate.getDate() + 7);
        break;
    }
    setCurrentDate(newDate);
  }, [currentDate, currentView]);

  const value = {
    // Date management
    currentDate,
    setCurrentDate,

    // Etiquette visibility management
    visibleColors,
    toggleColorVisibility,
    isColorVisible,

    // Event management
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    refreshEvents,

    // Event filtering and search
    filteredEvents,
    searchEvents,
    applyFilters,
    clearFilters,
    currentFilters,

    // Calendar navigation
    currentView,
    setCurrentView,
    navigateToDate,
    navigateToToday,
    navigatePrevious,
    navigateNext,
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
}
