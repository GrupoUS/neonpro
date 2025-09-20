"use client";

// Component exports
export { AgendaView } from "./agenda-view";
export { CalendarProvider, useCalendarContext } from "./calendar-context";
export { DayView } from "./day-view";
export { DraggableEvent } from "./draggable-event";
export { DroppableCell } from "./droppable-cell";
export { EventDialog } from "./event-dialog";
export { EventFilterPanel } from "./event-filter-panel";
export { EventItem } from "./event-item";
export { EventsPopup } from "./events-popup";
export { EventCalendar } from "./event-calendar";
export { EventSearchBar } from "./event-search-bar";
export { MonthView } from "./month-view";
export { WeekView } from "./week-view";
export { CalendarDndProvider, useCalendarDnd } from "./calendar-dnd-context";

// Constants and utility exports
export * from "./constants";
export * from "./utils";

// Hook exports
export * from "./hooks/use-current-time-indicator";
export * from "./hooks/use-event-actions";
export * from "./hooks/use-event-filters";
export * from "./hooks/use-event-search";
export * from "./hooks/use-event-visibility";

// Type exports
export type { 
  CalendarEvent, 
  CalendarEventExtended,
  CalendarView, 
  EventColor 
} from "./types";

// Service exports
export { EventService } from "@/services/event.service";
export type {
  EventFilterOptions,
  EventSearchOptions,
  CreateEventData,
  UpdateEventData,
  EventValidationResult,
  CalendarEventExtended as Event,
} from "@/services/event.service";
