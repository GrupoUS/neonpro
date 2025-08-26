// AI Scheduling Types for NeonPro Aesthetic Clinic
// Enhanced types supporting AI-powered intelligent scheduling

// Temporary BaseEntity definition until @neonpro/core-services is available
interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

// TODO: Replace with import when @neonpro/core-services is properly built
// import type { BaseEntity } from '@neonpro/core-services';

// Core AI Scheduling Interfaces
export interface AISchedulingConfig {
  optimizationLevel: "basic" | "standard" | "advanced" | "enterprise";
  maxConcurrentBookings: number;
  bufferTimeMinutes: number;
  emergencySlotReservation: number;
  noShowPredictionThreshold: number;
  overbookingAllowed: boolean;
  maxOverbookingPercentage: number;
}

export interface TreatmentDuration {
  treatmentId: string;
  treatmentType: string;
  estimatedMinutes: number;
  minDuration: number;
  maxDuration: number;
  bufferTime: number;
  equipmentRequired: string[];
  staffRequired: string[];
  roomType: RoomType;
  complexity: "low" | "medium" | "high" | "critical";
}

export interface RoomType {
  id: string;
  name: string;
  capacity: number;
  equipment: string[];
  suitableFor: string[];
  availability: TimeSlot[];
}

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
  resourceId?: string;
  appointmentId?: string;
}

// AI-Enhanced Appointment Interface
export interface AIAppointment extends BaseEntity {
  patientId: string;
  treatmentId: string;
  staffId: string;
  roomId: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  estimatedDuration: number;
  actualDuration?: number;
  status: AppointmentStatus;
  priority: AppointmentPriority;

  // AI-specific fields
  aiScheduledAt: Date;
  confidenceScore: number;
  conflictResolution?: ConflictResolution;
  noShowPrediction: NoShowPrediction;
  optimizationMetrics: SchedulingMetrics;
  reschedulingHistory: ReschedulingEvent[];

  // Treatment-specific
  treatmentType: string;
  equipmentRequired: string[];
  preparationTime: number;
  cleanupTime: number;

  // Patient context
  patientPreferences: PatientPreferences;
  patientHistory: PatientHistory;

  // Compliance and notes
  notes?: string;
  specialRequirements?: string[];
  followUpRequired: boolean;
}

export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "checked_in"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show"
  | "rescheduled";

export type AppointmentPriority =
  | "low"
  | "normal"
  | "high"
  | "urgent"
  | "emergency";

// AI Prediction Interfaces
export interface NoShowPrediction {
  probability: number;
  confidence: number;
  factors: NoShowFactor[];
  riskLevel: "low" | "medium" | "high" | "critical";
  recommendedActions: string[];
  lastUpdated: Date;
}

export interface NoShowFactor {
  factor: string;
  weight: number;
  value: number;
  impact: "positive" | "negative" | "neutral";
}

// Conflict Detection and Resolution
export interface ConflictDetection {
  conflicts: SchedulingConflict[];
  resolutions: ConflictResolution[];
  autoResolvable: boolean;
  criticalLevel: number;
}

export interface SchedulingConflict {
  id: string;
  type: ConflictType;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  affectedAppointments: string[];
  affectedResources: string[];
  detectedAt: Date;
  autoResolvable: boolean;
}

export type ConflictType =
  | "double_booking"
  | "resource_unavailable"
  | "staff_conflict"
  | "room_conflict"
  | "equipment_conflict"
  | "treatment_sequence"
  | "patient_availability"
  | "business_hours";

export interface ConflictResolution {
  conflictId: string;
  resolutionType: ResolutionType;
  newScheduling: Partial<AIAppointment>;
  impact: ResolutionImpact;
  confidence: number;
  implementedAt?: Date;
  success?: boolean;
}

export type ResolutionType =
  | "reschedule"
  | "reassign_staff"
  | "reassign_room"
  | "adjust_duration"
  | "emergency_slot"
  | "patient_notification"
  | "manual_intervention";

export interface ResolutionImpact {
  patientsAffected: number;
  staffAffected: number;
  revenueImpact: number;
  patientSatisfactionImpact: number;
  operationalImpact: number;
}

// Optimization and Analytics
export interface SchedulingMetrics {
  utilizationRate: number;
  efficiency: number;
  patientWaitTime: number;
  staffProductivity: number;
  roomUtilization: number;
  overbookingRate: number;
  cancellationRate: number;
  noShowRate: number;
  revenueOptimization: number;
}

export interface SchedulingOptimization {
  originalMetrics: SchedulingMetrics;
  optimizedMetrics: SchedulingMetrics;
  improvements: OptimizationImprovement[];
  timeToImplement: number;
  confidenceLevel: number;
}

export interface OptimizationImprovement {
  metric: keyof SchedulingMetrics;
  improvement: number;
  impact: string;
  implementation: string[];
}

// Patient and Staff Interfaces
export interface PatientPreferences {
  preferredTimes: TimePreference[];
  preferredStaff: string[];
  preferredRooms: string[];
  avoidTimes: TimePreference[];
  communicationMethod: "sms" | "email" | "phone" | "app";
  reminderPreferences: ReminderPreference[];
  specialNeeds: string[];
}

export interface TimePreference {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format
  endTime: string;
  preference: "preferred" | "acceptable" | "avoid";
}

export interface ReminderPreference {
  type: "sms" | "email" | "phone" | "app";
  timing: number; // hours before appointment
  enabled: boolean;
}

export interface PatientHistory {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowCount: number;
  averageTreatmentDuration: number;
  preferredTimeSlots: TimeSlot[];
  treatmentHistory: TreatmentHistoryItem[];
  punctualityScore: number;
  satisfactionScore: number;
}

export interface TreatmentHistoryItem {
  treatmentId: string;
  date: Date;
  duration: number;
  outcome: string;
  notes?: string;
}

export interface StaffAvailability {
  staffId: string;
  date: Date;
  shifts: WorkShift[];
  skills: string[];
  maxConcurrentPatients: number;
  breakTimes: TimeSlot[];
  unavailableTimes: TimeSlot[];
}

export interface WorkShift {
  start: Date;
  end: Date;
  type: "regular" | "overtime" | "on_call";
  maxAppointments: number;
}

// Rescheduling and Events
export interface ReschedulingEvent {
  id: string;
  originalAppointment: Partial<AIAppointment>;
  newAppointment: Partial<AIAppointment>;
  reason: ReschedulingReason;
  initiatedBy: "patient" | "staff" | "system" | "ai";
  timestamp: Date;
  impact: ResolutionImpact;
}

export type ReschedulingReason =
  | "patient_request"
  | "staff_unavailable"
  | "equipment_maintenance"
  | "emergency"
  | "optimization"
  | "no_show"
  | "cancellation";

// AI Scheduling Request and Response
export interface SchedulingRequest {
  patientId: string;
  treatmentId: string;
  preferredDates: Date[];
  preferredTimes: TimePreference[];
  urgency: AppointmentPriority;
  specialRequirements?: string[];
  flexibilityLevel: "none" | "low" | "medium" | "high";
  maxWaitDays: number;
}

export interface SchedulingResponse {
  success: boolean;
  appointmentId?: string;
  scheduledAppointment?: AIAppointment;
  alternatives: AlternativeSlot[];
  conflicts: SchedulingConflict[];
  optimizationApplied: boolean;
  confidenceScore: number;
  processingTime: number;
  recommendations: string[];
}

export interface AlternativeSlot {
  slot: TimeSlot;
  staffId: string;
  roomId: string;
  score: number;
  pros: string[];
  cons: string[];
}

// Performance and Analytics
export interface PerformanceMetrics {
  averageSchedulingTime: number;
  appointmentsPerDay: number;
  systemUtilization: number;
  errorRate: number;
  userSatisfaction: number;
  aiAccuracy: number;
  conflictResolutionRate: number;
  noShowReduction: number;
}

export interface AISchedulingAudit {
  timestamp: Date;
  action: string;
  userId: string;
  appointmentId: string;
  changes: Record<string, any>;
  aiDecision: boolean;
  confidence: number;
  outcome: "success" | "failure" | "partial";
}

// Export types for external use
// Types are already exported individually above
