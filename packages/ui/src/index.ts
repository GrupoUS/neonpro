// Basic Components

export type {
  AccessibilityControlsProps,
  AccessibilityPreferences,
} from './components/AccessibilityControls';
export { AccessibilityControls } from './components/AccessibilityControls';
export { Alert, AlertDescription, AlertTitle } from './components/Alert';
export type {
  AppointmentCalendarProps,
  CalendarTimeSlot,
  CalendarView,
} from './components/AppointmentCalendar';
export { AppointmentCalendar } from './components/AppointmentCalendar';
export type {
  AppointmentCardProps,
  AppointmentData,
} from './components/AppointmentCard';
export { AppointmentCard } from './components/AppointmentCard';
export type {
  AuditEvent,
  AuditEventType,
  AuditSeverity,
  AuditTrailViewerProps,
} from './components/AuditTrailViewer';
export { AuditTrailViewer } from './components/AuditTrailViewer';
export type { AuthLayoutProps } from './components/AuthLayout';
export { AuthLayout } from './components/AuthLayout';
export type { AvatarProps } from './components/Avatar';
export { Avatar, AvatarFallback, AvatarImage } from './components/Avatar';
export type { BadgeProps } from './components/Badge';
export { Badge } from './components/Badge';
// UI Components
export {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './components/Breadcrumb';
export type { ButtonProps } from './components/Button';
export { Button } from './components/Button';
export { Checkbox } from './components/Checkbox';
// Story 1.1 Complete: Healthcare Frontend Components (8 NEW COMPONENTS)
// Phase 4: Compliance & Accessibility
export type {
  ComplianceCheck,
  ComplianceStatusWidgetProps,
} from './components/ComplianceStatusWidget';
export { ComplianceStatusWidget } from './components/ComplianceStatusWidget';
export type { DashboardLayoutProps } from './components/DashboardLayout';
// Layout Components
export { DashboardLayout } from './components/DashboardLayout';
export type {
  DashboardSidebarProps,
  SidebarItem,
  UserProfile,
} from './components/DashboardSidebar';
export { DashboardSidebar } from './components/DashboardSidebar';
export type { DatePickerProps } from './components/DatePicker';
export { DatePicker } from './components/DatePicker';
export type {
  EmergencyAccessLevel,
  EmergencyAccessPanelProps,
  EmergencyAccessReason,
  EmergencyAccessRequest,
} from './components/EmergencyAccessPanel';
export { EmergencyAccessPanel } from './components/EmergencyAccessPanel';
export type { FormFieldProps } from './components/FormField';
export { FormField } from './components/FormField';
// Phase 5: Real-time & Loading States
export type {
  HealthcareLoadingStatesProps,
  LoadingContext,
  LoadingStage,
  LoadingStep,
} from './components/HealthcareLoadingStates';
export {
  defaultSteps,
  HealthcareLoadingStates,
} from './components/HealthcareLoadingStates';
export type { HealthRecordViewerProps } from './components/HealthRecordViewer';
export { HealthRecordViewer } from './components/HealthRecordViewer';
export type { InputProps } from './components/Input';
export { Input } from './components/Input';
export type {
  ConnectionStatus,
  OfflineCapability,
  OfflineData,
  OfflineIndicatorProps,
  SystemHealth,
} from './components/OfflineIndicator';
export { OfflineIndicator } from './components/OfflineIndicator';
export type { PatientCardProps, PatientData } from './components/PatientCard';
export { PatientCard } from './components/PatientCard';
export type {
  PatientDetailLayoutProps,
  PatientTab,
} from './components/PatientDetailLayout';
export { PatientDetailLayout } from './components/PatientDetailLayout';
export type {
  PatientTableAction,
  PatientTableColumn,
  PatientTableProps,
  PatientTableSort,
  PatientTableViewMode,
} from './components/PatientTable';
// Complex Components
export { PatientTable } from './components/PatientTable';
export { Popover, PopoverContent, PopoverTrigger } from './components/Popover';
export { ProcedureForm } from './components/ProcedureForm';
export type { ProgressBarProps } from './components/ProgressBar';
// Supporting Components
export { ProgressBar } from './components/ProgressBar';
export type {
  CapabilityStatus,
  FeatureCapability,
  FeatureLevel,
  ProgressiveEnhancementProps,
} from './components/ProgressiveEnhancement';
export {
  ProgressiveEnhancement,
  useFeatureDetection,
  useNetworkStatus,
} from './components/ProgressiveEnhancement';
export type {
  NotificationAction,
  NotificationPriority,
  NotificationType,
  RealTimeNotification,
  RealTimeNotificationsProps,
} from './components/RealTimeNotifications';
export { RealTimeNotifications } from './components/RealTimeNotifications';
export type { SearchBoxProps } from './components/SearchBox';
// Composite Components
export { SearchBox } from './components/SearchBox';
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './components/Select';
export { Tabs, TabsContent, TabsList, TabsTrigger } from './components/Tabs';
export type { TextareaProps } from './components/Textarea';
export { Textarea } from './components/Textarea';
export type { TimePickerProps } from './components/TimePicker';
export { TimePicker } from './components/TimePicker';
export type { ToastActionElement, ToastProps } from './components/Toast';
export { Toast, ToastAction, ToastClose } from './components/Toast';
// Healthcare Specialized Components
export { TreatmentCard } from './components/TreatmentCard';

// Hooks
export { useLayout } from './hooks/useLayout';
// Types
export type * from './types';
// Utilities
export { cn } from './utils/cn';
export { formatters } from './utils/formatters';
