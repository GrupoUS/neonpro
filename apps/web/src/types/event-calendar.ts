/**
 * Event Calendar Types
 * Type definitions for the event calendar component
 */

import {
  CalendarEvent,
  CalendarFilters,
  CalendarView,
  TimeSlot,
} from '../components/event-calendar/utils'

// Re-export utility types for convenience
export type { CalendarEvent, CalendarFilters, CalendarView, TimeSlot }

// Component-specific types
export interface CalendarComponentProps {
  events: CalendarEvent[]
  view: CalendarView
  filters?: CalendarFilters
  onEventClick?: (event: CalendarEvent) => void
  onDateChange?: (date: Date) => void
  onViewChange?: (view: CalendarView) => void
  onFiltersChange?: (filters: CalendarFilters) => void
  onEventCreate?: (date: Date, timeSlot?: TimeSlot) => void
  onEventUpdate?: (event: CalendarEvent) => void
  onEventDelete?: (eventId: string) => void
  isLoading?: boolean
  workingHours?: {
    start: number
    end: number
  }
  intervalMinutes?: number
}

export interface CalendarState {
  currentDate: Date
  currentView: CalendarView
  selectedEvent?: CalendarEvent
  isCreatingEvent: boolean
  filters: CalendarFilters
  isLoading: boolean
}

export interface CalendarActions {
  setDate: (date: Date) => void
  setView: (viewType: 'day' | 'week' | 'month') => void
  setSelectedEvent: (event?: CalendarEvent) => void
  setFilters: (filters: Partial<CalendarFilters>) => void
  startCreatingEvent: (date?: Date, timeSlot?: TimeSlot) => void
  stopCreatingEvent: () => void
  setLoading: (loading: boolean) => void
}

export interface EventFormProps {
  event?: CalendarEvent
  startDate?: Date
  timeSlot?: TimeSlot
  onSave: (event: Omit<CalendarEvent, 'id'>) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  availableProfessionals?: Array<{
    id: string
    name: string
    specialty?: string
  }>
}

export interface EventFormData {
  title: string
  type: CalendarEvent['type']
  start: Date
  end: Date
  patientId?: string
  patientName?: string
  professionalId?: string
  professionalName?: string
  notes?: string
  reminder: boolean
  reminderTime?: number
}

export interface EventFormErrors {
  [key: string]: string
}

// Drag and Drop types
export interface DraggedEvent {
  event: CalendarEvent
  originalStart: Date
}

export interface DropTarget {
  date: Date
  timeSlot?: TimeSlot
}

// View-specific types
export interface DayViewProps {
  date: Date
  events: CalendarEvent[]
  filters: CalendarFilters
  onEventClick: (event: CalendarEvent) => void
  onTimeSlotClick: (date: Date, timeSlot: TimeSlot) => void
  workingHours: { start: number; end: number }
  intervalMinutes: number
}

export interface WeekViewProps {
  date: Date
  events: CalendarEvent[]
  filters: CalendarFilters
  onEventClick: (event: CalendarEvent) => void
  onDateClick: (date: Date) => void
  workingHours: { start: number; end: number }
}

export interface MonthViewProps {
  date: Date
  events: CalendarEvent[]
  filters: CalendarFilters
  onEventClick: (event: CalendarEvent) => void
  onDateClick: (date: Date) => void
}

// Calendar header and navigation types
export interface CalendarHeaderProps {
  currentDate: Date
  view: CalendarView
  onViewChange: (view: CalendarView) => void
  onDateChange: (date: Date) => void
  onTodayClick: () => void
}

export interface CalendarNavigationProps {
  currentDate: Date
  onPrevious: () => void
  onNext: () => void
  onToday: () => void
}

// Filter and search types
export interface CalendarFiltersProps {
  filters: CalendarFilters
  onFiltersChange: (filters: Partial<CalendarFilters>) => void
  availableTypes: CalendarEvent['type'][]
  availableStatuses: CalendarEvent['status'][]
  availableProfessionals?: Array<{ id: string; name: string }>
}

// Event modal and dialog types
export interface EventModalProps {
  event?: CalendarEvent
  isOpen: boolean
  onClose: () => void
  onEdit: (event: CalendarEvent) => void
  onDelete: (eventId: string) => void
  canEdit: boolean
  canDelete: boolean
}

export interface EventDialogProps {
  event?: CalendarEvent
  startDate?: Date
  timeSlot?: TimeSlot
  isOpen: boolean
  onClose: () => void
  onSave: (event: Omit<CalendarEvent, 'id'>) => Promise<void>
  isLoading?: boolean
}

// Responsive design types
export interface ResponsiveCalendarProps {
  isMobile: boolean
  isTablet: boolean
  calendarProps: CalendarComponentProps
}

// Accessibility types
export interface CalendarAccessibilityProps {
  eventLabel: (event: CalendarEvent) => string
  dateLabel: (date: Date) => string
  viewLabel: (view: CalendarView) => string
  navigationLabels: {
    previous: string
    next: string
    today: string
  }
}

// Theme and styling types
export interface CalendarTheme {
  colors: {
    primary: string
    secondary: string
    background: string
    text: string
    border: string
    event: {
      appointment: string
      consultation: string
      procedure: string
      follow_up: string
      blocker: string
    }
    status: {
      scheduled: string
      confirmed: string
      in_progress: string
      completed: string
      cancelled: string
      no_show: string
    }
  }
  fonts: {
    primary: string
    secondary: string
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
}

// API response types
export interface CalendarApiResponse {
  events: CalendarEvent[]
  pagination?: {
    page: number
    limit: number
    total: number
  }
}

export interface CalendarApiParams {
  clinicId: string
  startDate: Date
  endDate: Date
  filters?: CalendarFilters
}

// Real-time updates types
export interface CalendarUpdateMessage {
  type: 'event_created' | 'event_updated' | 'event_deleted' | 'event_status_changed'
  event: CalendarEvent
  timestamp: Date
}

// Analytics and reporting types
export interface CalendarAnalytics {
  totalEvents: number
  eventsByType: Record<CalendarEvent['type'], number>
  eventsByStatus: Record<CalendarEvent['status'], number>
  averageDuration: number
  utilizationRate: number
  noShowRate: number
  cancellationRate: number
}

export interface CalendarReportParams {
  clinicId: string
  startDate: Date
  endDate: Date
  professionalId?: string
}

// Integration types
export interface ExternalCalendarIntegration {
  id: string
  name: string
  type: 'google' | 'outlook' | 'apple'
  isConnected: boolean
  lastSync?: Date
  syncEvents: boolean
}

export interface SyncResult {
  success: boolean
  syncedEvents: number
  failedEvents: number
  errors?: string[]
  lastSync: Date
}
