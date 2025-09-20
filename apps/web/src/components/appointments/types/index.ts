/**
 * Appointment Component Types
 *
 * TypeScript definitions for appointment scheduling components
 * with Brazilian healthcare compliance and tRPC integration
 */

export interface TimeSlot {
  time: string;
  available: boolean;
  duration: number;
  appointmentId?: string;
  patientName?: string;
  serviceName?: string;
  riskLevel?: 'low' | 'medium' | 'high';
}

export interface AppointmentFormData {
  patientId: string;
  professionalId: string;
  serviceId: string;
  date: Date;
  time: string;
  duration: number;
  notes?: string;
  reminderPreferences: {
    whatsapp: boolean;
    sms: boolean;
    email: boolean;
    push: boolean;
  };
}

export interface NoShowRisk {
  level: 'low' | 'medium' | 'high';
  score: number;
  factors: string[];
  interventions: string[];
  lastUpdated: Date;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  professionalId: string;
  professionalName: string;
  serviceId: string;
  serviceName: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  status:
    | 'scheduled'
    | 'confirmed'
    | 'completed'
    | 'cancelled'
    | 'no-show'
    | 'rescheduled';
  type: 'in-person' | 'telemedicine' | 'hybrid';
  notes?: string;
  noShowRisk?: NoShowRisk;
  reminderPreferences: {
    whatsapp: boolean;
    sms: boolean;
    email: boolean;
    push: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AppointmentAnalytics {
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  noShow: number;
  rescheduled: number;
  averageDuration: number;
  completionRate: number;
  noShowRate: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
}

export interface AppointmentAvailability {
  date: Date;
  professionalId: string;
  availableSlots: TimeSlot[];
  blockedSlots: {
    start: string;
    end: string;
    reason: string;
  }[];
  workingHours: {
    start: string;
    end: string;
  };
}

export interface ReminderChannel {
  type: 'whatsapp' | 'sms' | 'email' | 'push';
  enabled: boolean;
  timing: number; // hours before appointment
  template: string;
}

export interface AppointmentFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: string[];
  professionalId?: string;
  patientId?: string;
  riskLevel?: ('low' | 'medium' | 'high')[];
  type?: ('in-person' | 'telemedicine' | 'hybrid')[];
  serviceId?: string;
}

export interface AppointmentListOptions {
  page?: number;
  limit?: number;
  filters?: AppointmentFilters;
  sortBy?: 'startTime' | 'patientName' | 'status' | 'riskScore';
  sortOrder?: 'asc' | 'desc';
  includeNoShowRisk?: boolean;
  includeAnalytics?: boolean;
}

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no-show'
  | 'rescheduled';
export type AppointmentType = 'in-person' | 'telemedicine' | 'hybrid';
export type RiskLevel = 'low' | 'medium' | 'high';
export type ReminderChannelType = 'whatsapp' | 'sms' | 'email' | 'push';
