export type CalendarView = "month" | "week" | "day" | "agenda";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  color?: EventColor;
  label?: string;
  location?: string;
}

export interface CalendarEventExtended extends CalendarEvent {
  status?: string;
  priority?: number;
  patientId?: string;
  professionalId?: string;
  serviceTypeId?: string;
  clinicId?: string;
  notes?: string;
  internalNotes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type EventColor = "blue" | "orange" | "violet" | "rose" | "emerald" | "sky";

// Export types from event service for convenience
export type {
  EventFilterOptions,
  EventSearchOptions,
  CreateEventData,
  UpdateEventData,
  EventValidationResult,
} from "@/services/event.service";
