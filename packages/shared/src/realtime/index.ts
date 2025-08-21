/**
 * NeonPro Healthcare Real-time System
 * Sistema completo de real-time updates com Supabase
 * Integração com TanStack Query e notifications sistema
 */

// Connection Management
export {
  SupabaseRealtimeManager,
  getRealtimeManager,
  destroyRealtimeManager,
  DEFAULT_CONFIG
} from './connection-manager';

export type {
  ConnectionConfig,
  ChannelSubscription,
  ConnectionStatus
} from './connection-manager';

// Enhanced React Hooks
export {
  useRealtimePatients,
  useOptimisticPatients
} from './hooks/use-realtime-patients';

export type {
  RealtimePatientPayload,
  UseRealtimePatientsOptions,
  UseRealtimePatientsReturn
} from './hooks/use-realtime-patients';

export {
  useRealtimeAppointments,
  useOptimisticAppointments  
} from './hooks/use-realtime-appointments';

export type {
  RealtimeAppointmentPayload,
  UseRealtimeAppointmentsOptions,
  UseRealtimeAppointmentsReturn
} from './hooks/use-realtime-appointments';

export {
  useRealtimeNotifications
} from './hooks/use-realtime-notifications';

export type {
  NotificationPriority,
  RealtimeNotificationPayload,
  UseRealtimeNotificationsOptions,
  UseRealtimeNotificationsReturn
} from './hooks/use-realtime-notifications';

export {
  useRealtimeCompliance,
  useComplianceAnalytics
} from './hooks/use-realtime-compliance';

export type {
  ComplianceEventType,
  RealtimeCompliancePayload,
  UseRealtimeComplianceOptions,
  UseRealtimeComplianceReturn
} from './hooks/use-realtime-compliance';

// React Provider
export {
  RealtimeProvider,
  useRealtimeContext,
  useHealthcareReady,
  useRealtimeStatus
} from './providers/realtime-provider';

// Configuration
export {
  getRealtimeConfig,
  getEnvironmentConfig,
  HEALTHCARE_REALTIME_CONFIG,
  HEALTHCARE_PRIORITIES,
  COMPLIANCE_EVENT_TYPES
} from './config';

export type {
  HealthcareRealtimeConfig
} from './config';

// Utility functions for healthcare real-time
export const RealtimeUtils = {
  /**
   * Check if connection is healthy for healthcare operations
   */
  isHealthcareReady: (connectionHealth: number): boolean => {
    return connectionHealth >= 80; // Healthcare requires high reliability
  },

  /**
   * Determine if event requires immediate medical attention
   */
  isMedicalUrgent: (eventType: string, priority?: string): boolean => {
    const urgentKeywords = ['emergency', 'critical', 'urgent', 'breach', 'violation'];
    return urgentKeywords.some(keyword => 
      eventType.toLowerCase().includes(keyword) || 
      priority?.toLowerCase().includes(keyword)
    );
  },

  /**
   * Format healthcare notification message
   */
  formatHealthcareMessage: (type: string, data: any): string => {
    const formatMap: Record<string, (data: any) => string> = {
      'patient_update': (data) => `Paciente ${data.name || data.id} foi atualizado`,
      'appointment_change': (data) => `Agendamento ${data.id} foi ${data.status === 'cancelled' ? 'cancelado' : 'alterado'}`,
      'emergency_alert': (data) => `EMERGÊNCIA: ${data.message}`,
      'compliance_violation': (data) => `Violação de compliance: ${data.type}`,
      'lgpd_event': (data) => `Evento LGPD: ${data.action} - ${data.description}`,
      'anvisa_alert': (data) => `Alerta ANVISA: ${data.category} - ${data.message}`
    };

    return formatMap[type]?.(data) || `Evento: ${type}`;
  },

  /**
   * Calculate healthcare priority score
   */
  calculateHealthcarePriority: (
    eventType: string,
    severity: string,
    patientCritical: boolean = false
  ): number => {
    let score = 0;
    
    // Base score by severity
    switch (severity.toUpperCase()) {
      case 'CRITICAL': score = 100; break;
      case 'HIGH': score = 75; break;
      case 'MEDIUM': score = 50; break;
      case 'LOW': score = 25; break;
      default: score = 10;
    }
    
    // Boost for patient-critical events
    if (patientCritical) score += 20;
    
    // Boost for specific event types
    if (eventType.includes('emergency')) score += 30;
    if (eventType.includes('breach')) score += 25;
    if (eventType.includes('anvisa')) score += 15;
    
    return Math.min(100, score);
  }
};