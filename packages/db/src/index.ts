/**
 * NeonPro Healthcare Database Package
 * Modern Supabase integration with Next.js 15 App Router
 * Healthcare compliance: LGPD + ANVISA + CFM
 */

// Legacy Prisma client export (during transition)
export * from '@prisma/client';

// Healthcare authentication exports
export {
  getSession,
  getUser,
  requireHealthcareProfessional,
  requireUser,
  signOut,
} from './auth';
// Modern Supabase client exports
export { createClient, createServerClient } from './client';
// TypeScript definitions exports
export type {
  Appointment,
  AppointmentInsert,
  AppointmentUpdate,
  Clinic,
  Database,
  HealthcareAuditLog,
  HealthcareProfessional,
  HealthcareProfessionalInsert,
  HealthcareProfessionalUpdate,
  Notification,
  NotificationInsert,
  NotificationUpdate,
  Patient,
  PatientInsert,
  PatientUpdate,
} from './types';
