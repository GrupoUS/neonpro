/**
 * Event Calendar Component
 * Main calendar component for healthcare scheduling
 */

export { default as CalendarHeader } from './CalendarHeader';
export { default as DayView } from './DayView';
export { default as EventCalendar } from './EventCalendar';
export { default as EventForm } from './EventForm';
export { default as EventModal } from './EventModal';
export { default as MonthView } from './MonthView';
export { default as WeekView } from './WeekView';

// Utility exports
export * from './utils';

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
} from '../../types/event-calendar';
