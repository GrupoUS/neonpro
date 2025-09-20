// Type definitions for database services

// Re-export audit types
export type * from './audit.types.js';

// Basic data interfaces
export interface PatientData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: any;
  emergencyContact?: any;
  medicalHistory?: any;
  createdAt: string;
  updatedAt: string;
}

export interface ClinicData {
  id: string;
  name: string;
  address: any;
  phone: string;
  email: string;
  specialties: string[];
  workingHours: any;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentData {
  id: string;
  patientId: string;
  clinicId: string;
  scheduledDate: string;
  status: string;
  type: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalRecordData {
  id: string;
  patientId: string;
  type: string;
  content: any;
  date: string;
  doctorId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationData {
  id: string;
  recipientId: string;
  type: string;
  title: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsData {
  id: string;
  type: string;
  data: any;
  date: string;
  metadata?: any;
  createdAt: string;
}

export interface ComplianceData {
  id: string;
  type: string;
  status: string;
  details: any;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationData {
  id: string;
  provider: string;
  type: string;
  status: string;
  config: any;
  createdAt: string;
  updatedAt: string;
}

export interface BackupData {
  id: string;
  type: string;
  status: string;
  size?: number;
  createdAt: string;
  expiresAt?: string;
}

export interface SecurityData {
  id: string;
  type: string;
  status: string;
  details: any;
  createdAt: string;
}

export interface AuditLogData {
  id: string;
  userId: string;
  action: string;
  resource: string;
  details: any;
  createdAt: string;
}

export interface CacheData {
  key: string;
  value: any;
  expiresAt?: string;
  createdAt: string;
}

export interface RateLimitData {
  key: string;
  count: number;
  resetAt: string;
  createdAt: string;
}

export interface ReportData {
  id: string;
  type: string;
  status: string;
  data: any;
  createdAt: string;
}

export interface MonitoringData {
  id: string;
  metric: string;
  value: number;
  timestamp: string;
  metadata?: any;
}