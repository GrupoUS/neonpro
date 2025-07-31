/**
 * Types and interfaces for the Intelligent Conflict Resolution System
 * Handles scheduling conflicts, resource optimization, and automated resolution
 */

import { Database } from '@/types/supabase';

// Base types from database
type Appointment = Database['public']['Tables']['appointments']['Row'];
type Staff = Database['public']['Tables']['staff']['Row'];
type Room = Database['public']['Tables']['rooms']['Row'];
type Equipment = Database['public']['Tables']['equipment']['Row'];

// Conflict Detection Types
export interface ConflictDetectionConfig {
  enableTimeOverlapDetection: boolean;
  enableResourceConflictDetection: boolean;
  enableStaffConflictDetection: boolean;
  enableRoomConflictDetection: boolean;
  enableEquipmentConflictDetection: boolean;
  bufferTimeMinutes: number;
  maxLookaheadDays: number;
  conflictSeverityThreshold: ConflictSeverity;
}

export enum ConflictType {
  TIME_OVERLAP = 'time_overlap',
  STAFF_UNAVAILABLE = 'staff_unavailable',
  ROOM_OCCUPIED = 'room_occupied',
  EQUIPMENT_UNAVAILABLE = 'equipment_unavailable',
  RESOURCE_OVERBOOKED = 'resource_overbooked',
  SCHEDULE_VIOLATION = 'schedule_violation',
  CAPACITY_EXCEEDED = 'capacity_exceeded'
}

export enum ConflictSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface ConflictDetails {
  id: string;
  type: ConflictType;
  severity: ConflictSeverity;
  description: string;
  affectedAppointments: string[];
  affectedResources: {
    staff?: string[];
    rooms?: string[];
    equipment?: string[];
  };
  conflictTime: {
    start: Date;
    end: Date;
  };
  detectedAt: Date;
  metadata: Record<string, any>;
}

// Resolution Strategy Types
export enum ResolutionStrategy {
  RESCHEDULE_LATER = 'reschedule_later',
  RESCHEDULE_EARLIER = 'reschedule_earlier',
  CHANGE_STAFF = 'change_staff',
  CHANGE_ROOM = 'change_room',
  CHANGE_EQUIPMENT = 'change_equipment',
  SPLIT_APPOINTMENT = 'split_appointment',
  MERGE_APPOINTMENTS = 'merge_appointments',
  EXTEND_HOURS = 'extend_hours',
  DELEGATE_TO_ALTERNATIVE = 'delegate_to_alternative',
  MANUAL_INTERVENTION = 'manual_intervention'
}

export interface ResolutionOption {
  id: string;
  strategy: ResolutionStrategy;
  description: string;
  confidence: number; // 0-1
  impact: ResolutionImpact;
  estimatedTime: number; // minutes
  cost: number; // relative cost score
  feasibility: number; // 0-1
  proposedChanges: ProposedChanges;
  pros: string[];
  cons: string[];
  metadata: Record<string, any>;
}

export interface ResolutionImpact {
  patientSatisfaction: number; // -1 to 1
  staffWorkload: number; // -1 to 1
  resourceUtilization: number; // -1 to 1
  operationalEfficiency: number; // -1 to 1
  financialImpact: number; // -1 to 1
  overallScore: number; // -1 to 1
}

export interface ProposedChanges {
  appointments?: {
    id: string;
    changes: Partial<Appointment>;
  }[];
  staffAssignments?: {
    appointmentId: string;
    oldStaffId?: string;
    newStaffId: string;
  }[];
  roomAssignments?: {
    appointmentId: string;
    oldRoomId?: string;
    newRoomId: string;
  }[];
  equipmentAssignments?: {
    appointmentId: string;
    equipmentId: string;
    action: 'assign' | 'unassign' | 'replace';
  }[];
  newAppointments?: Partial<Appointment>[];
  cancelledAppointments?: string[];
}

// Optimization Types
export interface OptimizationConfig {
  prioritizePatientSatisfaction: boolean;
  prioritizeStaffWorkload: boolean;
  prioritizeResourceUtilization: boolean;
  prioritizeFinancialImpact: boolean;
  weights: {
    patientSatisfaction: number;
    staffWorkload: number;
    resourceUtilization: number;
    operationalEfficiency: number;
    financialImpact: number;
  };
  constraints: OptimizationConstraints;
}

export interface OptimizationConstraints {
  maxReschedulingDistance: number; // hours
  minStaffBreakTime: number; // minutes
  maxDailyWorkHours: number;
  requiredEquipmentAvailability: number; // percentage
  maxRoomCapacityUtilization: number; // percentage
  businessHours: {
    start: string; // HH:mm
    end: string; // HH:mm
  };
  excludedDays: string[]; // ISO day names
}

// Workload Balancing Types
export interface WorkloadMetrics {
  staffId: string;
  currentLoad: number; // 0-1
  projectedLoad: number; // 0-1
  efficiency: number; // 0-1
  satisfaction: number; // 0-1
  specializations: string[];
  availability: AvailabilityWindow[];
  preferences: StaffPreferences;
}

export interface AvailabilityWindow {
  start: Date;
  end: Date;
  type: 'available' | 'preferred' | 'unavailable';
  reason?: string;
}

export interface StaffPreferences {
  preferredHours: {
    start: string;
    end: string;
  };
  preferredDays: string[];
  avoidedTasks: string[];
  preferredTasks: string[];
  maxConsecutiveHours: number;
  minBreakBetweenAppointments: number;
}

// Resource Management Types
export interface ResourceAvailability {
  resourceId: string;
  resourceType: 'staff' | 'room' | 'equipment';
  availability: AvailabilityWindow[];
  capacity: number;
  currentUtilization: number;
  maintenanceSchedule: MaintenanceWindow[];
  restrictions: ResourceRestrictions;
}

export interface MaintenanceWindow {
  start: Date;
  end: Date;
  type: 'scheduled' | 'emergency' | 'preventive';
  description: string;
  impact: 'partial' | 'full';
}

export interface ResourceRestrictions {
  requiredCertifications: string[];
  compatibleServices: string[];
  incompatibleServices: string[];
  maxConcurrentUsage: number;
  setupTime: number; // minutes
  cleanupTime: number; // minutes
}

// Dashboard and Analytics Types
export interface ConflictAnalytics {
  totalConflicts: number;
  conflictsByType: Record<ConflictType, number>;
  conflictsBySeverity: Record<ConflictSeverity, number>;
  resolutionRate: number;
  averageResolutionTime: number;
  patientSatisfactionImpact: number;
  costSavings: number;
  efficiencyGains: number;
  trendData: ConflictTrend[];
}

export interface ConflictTrend {
  date: string;
  conflicts: number;
  resolved: number;
  averageSeverity: number;
  resolutionTime: number;
}

export interface OptimizationDashboard {
  currentOptimizationScore: number;
  resourceUtilization: {
    staff: number;
    rooms: number;
    equipment: number;
  };
  workloadBalance: {
    balanced: number;
    overloaded: number;
    underutilized: number;
  };
  upcomingConflicts: ConflictDetails[];
  recommendedActions: RecommendedAction[];
  performanceMetrics: PerformanceMetrics;
}

export interface RecommendedAction {
  id: string;
  type: 'optimization' | 'prevention' | 'resolution';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  expectedImpact: string;
  estimatedEffort: string;
  deadline?: Date;
  metadata: Record<string, any>;
}

export interface PerformanceMetrics {
  scheduleEfficiency: number;
  resourceUtilization: number;
  conflictResolutionRate: number;
  patientSatisfaction: number;
  staffSatisfaction: number;
  operationalCost: number;
  revenueOptimization: number;
}

// Event and Notification Types
export interface ConflictEvent {
  id: string;
  type: 'conflict_detected' | 'conflict_resolved' | 'optimization_completed';
  timestamp: Date;
  conflictId?: string;
  resolutionId?: string;
  data: Record<string, any>;
  severity: ConflictSeverity;
  affectedUsers: string[];
}

export interface NotificationConfig {
  enableRealTimeAlerts: boolean;
  enableEmailNotifications: boolean;
  enableSMSNotifications: boolean;
  enablePushNotifications: boolean;
  severityThreshold: ConflictSeverity;
  recipients: {
    managers: string[];
    staff: string[];
    patients: string[];
  };
  templates: NotificationTemplate[];
}

export interface NotificationTemplate {
  id: string;
  type: ConflictType;
  severity: ConflictSeverity;
  channel: 'email' | 'sms' | 'push' | 'in_app';
  template: string;
  variables: string[];
  delay: number; // minutes
}

// API and Integration Types
export interface ConflictResolutionAPI {
  detectConflicts(params: ConflictDetectionParams): Promise<ConflictDetails[]>;
  generateResolutions(conflictId: string): Promise<ResolutionOption[]>;
  applyResolution(resolutionId: string): Promise<ResolutionResult>;
  optimizeSchedule(params: OptimizationParams): Promise<OptimizationResult>;
  getAnalytics(params: AnalyticsParams): Promise<ConflictAnalytics>;
  getDashboard(): Promise<OptimizationDashboard>;
}

export interface ConflictDetectionParams {
  dateRange: {
    start: Date;
    end: Date;
  };
  includeTypes: ConflictType[];
  severityFilter: ConflictSeverity[];
  resourceFilter?: {
    staff?: string[];
    rooms?: string[];
    equipment?: string[];
  };
  config?: Partial<ConflictDetectionConfig>;
}

export interface OptimizationParams {
  scope: 'day' | 'week' | 'month';
  targetDate: Date;
  objectives: string[];
  constraints: Partial<OptimizationConstraints>;
  config: Partial<OptimizationConfig>;
}

export interface AnalyticsParams {
  dateRange: {
    start: Date;
    end: Date;
  };
  granularity: 'hour' | 'day' | 'week' | 'month';
  metrics: string[];
  filters?: Record<string, any>;
}

export interface ResolutionResult {
  success: boolean;
  resolutionId: string;
  appliedChanges: ProposedChanges;
  impact: ResolutionImpact;
  notifications: ConflictEvent[];
  errors?: string[];
  warnings?: string[];
}

export interface OptimizationResult {
  success: boolean;
  optimizationId: string;
  improvements: {
    conflictsResolved: number;
    efficiencyGain: number;
    costSavings: number;
    satisfactionImprovement: number;
  };
  appliedChanges: ProposedChanges;
  recommendations: RecommendedAction[];
  metrics: PerformanceMetrics;
}

// Machine Learning and Prediction Types
export interface ConflictPredictionModel {
  modelId: string;
  version: string;
  accuracy: number;
  lastTrained: Date;
  features: string[];
  predictions: ConflictPrediction[];
}

export interface ConflictPrediction {
  conflictId: string;
  probability: number;
  expectedTime: Date;
  type: ConflictType;
  severity: ConflictSeverity;
  confidence: number;
  preventionActions: RecommendedAction[];
}

export interface LearningData {
  historicalConflicts: ConflictDetails[];
  resolutionOutcomes: ResolutionResult[];
  patternAnalysis: PatternAnalysis;
  seasonalTrends: SeasonalTrend[];
}

export interface PatternAnalysis {
  commonConflictTimes: string[];
  frequentConflictTypes: ConflictType[];
  resourceBottlenecks: string[];
  staffWorkloadPatterns: Record<string, number[]>;
  seasonalVariations: Record<string, number>;
}

export interface SeasonalTrend {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  pattern: number[];
  confidence: number;
  description: string;
}

// Export main types
export type {
  Appointment,
  Staff,
  Room,
  Equipment
};