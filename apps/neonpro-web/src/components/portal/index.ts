// Portal Components Index
// Story 1.3, Task 2: Main export file for all patient portal components
// Created: Centralized exports for patient portal UI components

export { default as AppointmentBookingWizard } from "./appointment-booking-wizard";
export { default as AppointmentNotes } from "./appointment-notes";
export { default as BookingConfirmation } from "./booking-confirmation";

// Type Definitions
export type { BreadcrumbItem } from "./patient-breadcrumbs"; // Appointment Booking Components
export { PatientBreadcrumbs } from "./patient-breadcrumbs";
export { PatientNavigation } from "./patient-navigation";
// Layout Components
export { PatientPortalLayout } from "./patient-portal-layout";
export { default as ProfessionalSelection } from "./professional-selection";
export { default as ServiceSelection } from "./service-selection";
export { default as TimeSlotPicker } from "./time-slot-picker";
