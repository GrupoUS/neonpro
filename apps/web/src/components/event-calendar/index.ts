'use client';

// Component exports
export { AgendaView } from './agenda-view';
export { CalendarProvider, useCalendarContext } from './calendar-context';
export { CalendarDndProvider, useCalendarDnd } from './calendar-dnd-context';
export { DayView } from './day-view';
export { DraggableEvent } from './draggable-event';
export { DroppableCell } from './droppable-cell';
export { EventCalendar } from './event-calendar';
export { EventDialog } from './event-dialog';
export { EventFilterPanel } from './event-filter-panel';
export { EventItem } from './event-item';
export { EventSearchBar } from './event-search-bar';
export { EventsPopup } from './events-popup';
export { MonthView } from './month-view';
export { WeekView } from './week-view';

// Constants and utility exports
export * from './constants';
export * from './utils';

// Hook exports
export * from './hooks/use-current-time-indicator';
export * from './hooks/use-event-actions';
export * from './hooks/use-event-filters';
export * from './hooks/use-event-search';
export * from './hooks/use-event-visibility';

// Type exports
export type { CalendarEvent, CalendarEventExtended, CalendarView, EventColor } from './types';

// Service exports
export { EventService } from '@/services/event.service';
export type {
  CalendarEventExtended as Event,
  CreateEventData,
  EventFilterOptions,
  EventSearchOptions,
  EventValidationResult,
  UpdateEventData,
} from '@/services/event.service';
