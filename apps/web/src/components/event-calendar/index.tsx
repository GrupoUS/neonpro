/**
 * Event Calendar Component
 * Main calendar component for healthcare scheduling
 */

export { default as EventCalendar } from './EventCalendar';
export { default as EventModal } from './EventModal';
export { default as EventForm } from './EventForm';
export { default as CalendarHeader } from './CalendarHeader';
export { default as DayView } from './DayView';
export { default as WeekView } from './WeekView';
export { default as MonthView } from './MonthView';

// Utility exports
export * from './utils';

// Type exports
export type {
  CalendarComponentProps,
  CalendarState,
  CalendarActions,
  EventFormProps,
  EventFormData,
  EventFormErrors,
  DraggedEvent,
  DropTarget,
  DayViewProps,
  WeekViewProps,
  MonthViewProps,
  CalendarHeaderProps,
  CalendarNavigationProps,
  CalendarFiltersProps,
  EventModalProps,
  EventDialogProps,
  ResponsiveCalendarProps,
  CalendarAccessibilityProps,
  CalendarTheme,
  CalendarApiResponse,
  CalendarApiParams,
  CalendarUpdateMessage,
  CalendarAnalytics,
  CalendarReportParams,
  ExternalCalendarIntegration,
  SyncResult,
} from '../../types/event-calendar';