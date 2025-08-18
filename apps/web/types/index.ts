/**
 * Central export for all TypeScript types used in NeonPro
 *
 * @description Barrel export que centraliza todos os tipos para
 * facilitar importação em componentes e hooks.
 */

export * from './analytics';
// API Types
export * from './api';
export * from './appointments';
// Auth Types
export * from './auth';
export * from './billing';
// Common Types
export * from './common';
export * from './consultations';
// Database Types
export * from './database';
export * from './financial';
// Re-export commonly used types for convenience
export type {
  Appointment,
  AppointmentsFilters,
  AppointmentsHook,
  // Extended types with relationships
  AppointmentWithDetails,
  // Combined hook types
  DashboardData,
  // Hook types
  DashboardMetrics,
  FinancialHook,
  FinancialOverview,
  // Summary types
  FinancialSummary,
  FinancialTransaction,
  MonthlyRevenue,
  // Database base types
  Patient,
  // Filter and pagination types
  PatientsFilters,
  PatientsHook,
  PaymentMethodStats,
  RevenueByService,
  Service,
  ServiceCategory,
  ServicesHook,
  ServiceWithStats,
  StaffAvailability,
  StaffHook,
  StaffMember,
  StaffMemberWithStats,
} from './hooks';
// Hook Types - Novos tipos para os hooks dinâmicos
export * from './hooks';
export * from './notifications';
// Domain Types
export * from './patients';
export * from './professionals';
export * from './reports';
export * from './supabase';
