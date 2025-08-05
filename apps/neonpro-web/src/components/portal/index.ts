// Portal Components Index
// Story 1.3, Task 2: Main export file for all patient portal components
// Created: Centralized exports for patient portal UI components

// Layout Components
export { PatientPortalLayout } from "./patient-portal-layout";
export { PatientNavigation } from "./patient-navigation";
export { PatientBreadcrumbs } from "./patient-breadcrumbs";

// Type Definitions
export type { BreadcrumbItem } from "./patient-breadcrumbs"; // Appointment Booking Components
export { default as AppointmentBookingWizard } from "./appointment-booking-wizard";
export { default as ServiceSelection } from "./service-selection";
export { default as ProfessionalSelection } from "./professional-selection";
export { default as TimeSlotPicker } from "./time-slot-picker";
export { default as AppointmentNotes } from "./appointment-notes";
export { default as BookingConfirmation } from "./booking-confirmation";
