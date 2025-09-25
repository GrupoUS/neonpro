/**
 * Event Calendar Component
 * Main calendar component for healthcare scheduling
 */

export { default as CalendarHeader } from './CalendarHeader.js'
export { default as DayView } from './DayView.js'
export { default as EventCalendar } from './EventCalendar.js'
export { default as EventForm } from './EventForm.js'
export { default as EventModal } from './EventModal.js'
export { default as MonthView } from './MonthView.js'
export { default as WeekView } from './WeekView.js'

// Utility exports
export * from './utils.js'

// Type exports
export type {
  CalendarAccessibilityProps,
  CalendarActions,
  CalendarAnalytics,
  CalendarApiParams,
  CalendarApiResponse,
  CalendarComponentProps,
  CalendarFiltersProps,
  CalendarHeaderProps,
  CalendarNavigationProps,
  CalendarReportParams,
  CalendarState,
  CalendarTheme,
  CalendarUpdateMessage,
  DayViewProps,
  DraggedEvent,
  DropTarget,
  EventDialogProps,
  EventFormData,
  EventFormErrors,
  EventFormProps,
  EventModalProps,
  ExternalCalendarIntegration,
  MonthViewProps,
  ResponsiveCalendarProps,
  SyncResult,
  WeekViewProps,
} from '../../types/event-calendar.js'
