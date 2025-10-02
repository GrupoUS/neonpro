/**
 * Event Calendar Component
 * Main calendar component for healthcare scheduling
 */

export { default as CalendarHeader } from './CalendarHeader.ts'
export { default as DayView } from './DayView.ts'
export { default as EventCalendar } from './EventCalendar.ts'
export { default as EventForm } from './EventForm.ts'
export { default as EventModal } from './EventModal.ts'
export { default as MonthView } from './MonthView.ts'
export { default as WeekView } from './WeekView.ts'

// Utility exports
export * from './utils.ts'

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
} from '../../types/event-calendar.ts'
