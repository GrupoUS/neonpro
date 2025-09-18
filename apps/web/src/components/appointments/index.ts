/**
 * Enhanced Appointment Components - Export Module
 *
 * T041: Create Appointment Scheduling Components
 *
 * Features:
 * - AppointmentBooking: Calendar with event slots and real-time scheduling
 * - AppointmentManagement: Real-time appointment management interface
 * - NoShowRiskDisplay: AI-powered no-show risk visualization and interventions
 * - ReminderManagement: Multi-channel reminder scheduling and management
 * - Integration with tRPC hooks from T037-T039
 * - LGPD compliance with audit logging
 * - Mobile-first Brazilian healthcare design
 * - AI-powered no-show risk prediction
 * - Multi-channel reminder management
 */

// Main Components
export { AppointmentBooking } from './AppointmentBooking';
export { AppointmentManagement } from './AppointmentManagement';

// T041: Phase 3.5 New Components
export { NoShowRiskDisplay } from './NoShowRiskDisplay';
export { ReminderManagement } from './ReminderManagement';

// Types and Utilities (to be created)
export type { AppointmentFormData, TimeSlot } from './types';
export { appointmentUtils, formatAppointmentTime, getNoShowRiskColor } from './utils';

// Re-export hooks for convenience
export {
  useAppointmentAnalytics,
  useAppointmentAvailability,
  useAppointmentNoShowRisk,
  useAppointmentRealTimeUpdates,
  useAppointmentsList,
  useCreateAppointment,
  useSendAppointmentReminder,
  useUpdateAppointmentStatus,
} from '@/hooks/use-appointments';

/**
 * Usage Examples:
 *
 * // Basic appointment booking
 * import { AppointmentBooking } from '@/components/appointments';
 *
 * <AppointmentBooking
 *   professionalId="prof-123"
 *   onBookingComplete={(appointment) => console.log('Booked:', appointment)}
 * />
 *
 * // Appointment management dashboard
 * import { AppointmentManagement } from '@/components/appointments';
 *
 * <AppointmentManagement
 *   view="today"
 *   professionalId="prof-123"
 * />
 *
 * // No-show risk display with interventions
 * import { NoShowRiskDisplay } from '@/components/appointments';
 *
 * <NoShowRiskDisplay
 *   appointmentId="apt-123"
 *   patientId="pat-456"
 *   patientName="João Silva"
 *   scheduledFor={new Date()}
 *   showInterventions={true}
 * />
 *
 * // Reminder management system
 * import { ReminderManagement } from '@/components/appointments';
 *
 * <ReminderManagement
 *   appointmentId="apt-123"
 *   patientId="pat-456"
 *   patientName="João Silva"
 *   scheduledFor={new Date()}
 *   mode="manage"
 * />
 *
 * // With tRPC hooks
 * import { useAppointmentsList } from '@/components/appointments';
 *
 * const { data: appointments } = useAppointmentsList({
 *   includeNoShowRisk: true
 * });
 */

export default {
  AppointmentBooking,
  AppointmentManagement,
  NoShowRiskDisplay,
  ReminderManagement,
};
