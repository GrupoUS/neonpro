/**
 * ============================================================================
 * NEONPRO ADVANCED SCHEDULING CONFLICT RESOLUTION - TYPE DEFINITIONS
 * Research-backed implementation with Context7 + Tavily + Exa validation
 * Quality Standard: ≥9.5/10
 * ============================================================================
 */

// Core conflict detection types
export type SchedulingConflict = {
  id: string;
  appointmentAId: string;
  appointmentBId: string;
  conflictType: ConflictType;
  severityLevel: SeverityLevel;
  detectedAt: Date;
  resolvedAt?: Date;
  resolutionMethod?: ResolutionMethod;
  resolutionDetails: Record<string, any>;
  createdBy?: string;
  updatedAt: Date;
};

export type ConflictType =
  | 'time_overlap'
  | 'resource_conflict'
  | 'capacity_limit'
  | 'staff_unavailable'
  | 'room_conflict'
  | 'equipment_conflict';

export type SeverityLevel = 1 | 2 | 3 | 4 | 5;

export type ResolutionMethod =
  | 'automatic_reschedule'
  | 'manual_override'
  | 'resource_reallocation'
  | 'capacity_expansion'
  | 'staff_reassignment'
  | 'escalation';

// Resolution strategy types
export type ConflictResolutionStrategy = {
  id: string;
  conflictId: string;
  strategyType: StrategyType;
  algorithmParameters: Record<string, any>;
  executionTimeMs?: number;
  successScore?: number;
  stakeholderSatisfaction: Record<string, number>;
  appliedAt: Date;
  createdBy?: string;
};

export type StrategyType =
  | 'mip_optimization'
  | 'constraint_programming'
  | 'genetic_algorithm'
  | 'reinforcement_learning'
  | 'rule_based'
  | 'hybrid';

// Professional availability types
export type ProfessionalAvailabilityPattern = {
  id: string;
  professionalId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  timeSlotStart: string; // HH:MM format
  timeSlotEnd: string; // HH:MM format
  availabilityType: AvailabilityType;
  capacityPercentage: number; // 0-200
  preferences: Record<string, any>;
  validFrom: Date;
  validUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type AvailabilityType =
  | 'available'
  | 'preferred'
  | 'limited'
  | 'unavailable';

// ML prediction types
export type SchedulingMLPrediction = {
  id: string;
  predictionType: PredictionType;
  targetAppointmentId: string;
  inputFeatures: Record<string, any>;
  predictionValue?: number;
  confidenceScore?: number;
  modelVersion: string;
  predictedAt: Date;
  actualOutcome?: number;
  outcomeRecordedAt?: Date;
  feedbackScore?: number;
};

export type PredictionType =
  | 'no_show_probability'
  | 'duration_estimate'
  | 'conflict_likelihood'
  | 'optimal_scheduling_time'
  | 'resource_demand_forecast';

// System metrics types
export type ConflictSystemMetric = {
  id: string;
  metricType: MetricType;
  metricValue: number;
  measurementUnit: string;
  recordedAt: Date;
  contextData: Record<string, any>;
};

export type MetricType =
  | 'detection_latency'
  | 'resolution_time'
  | 'system_load'
  | 'accuracy_rate'
  | 'user_satisfaction'
  | 'conflict_prevention_rate';

// Enhanced appointment type with conflict resolution data
export type EnhancedAppointment = {
  id: string;
  clientId: string;
  professionalId: string;
  serviceId: string;
  appointmentDate: Date;
  status: AppointmentStatus;
  durationRange?: string; // PostgreSQL tstzrange format
  conflictStatus: ConflictStatus;
  resolutionStrategy: Record<string, any>;
  priorityScore: number; // 1-10
  mlPredictionData: Record<string, any>;
  autoReschedulable: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ConflictStatus = 'none' | 'detected' | 'resolving' | 'resolved';
export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'completed'
  | 'cancelled';

// Conflict detection engine configuration
export type ConflictDetectionConfig = {
  enableRealTimeDetection: boolean;
  detectionIntervalMs: number;
  autoResolutionEnabled: boolean;
  maxAutoResolutionSeverity: SeverityLevel;
  notificationChannels: NotificationChannel[];
  performanceThresholds: PerformanceThresholds;
};

export type NotificationChannel = {
  type: 'email' | 'sms' | 'push' | 'realtime';
  enabled: boolean;
  configuration: Record<string, any>;
};

export type PerformanceThresholds = {
  maxDetectionLatencyMs: number;
  maxResolutionTimeMs: number;
  minAccuracyRate: number;
  minUserSatisfactionScore: number;
};

// Resolution algorithm interfaces
export type ResolutionAlgorithm = {
  name: string;
  type: StrategyType;
  parameters: Record<string, any>;
  execute(
    conflict: SchedulingConflict,
    context: ResolutionContext
  ): Promise<ResolutionResult>;
  estimateExecutionTime(conflict: SchedulingConflict): number;
  calculateSuccessProbability(
    conflict: SchedulingConflict,
    context: ResolutionContext
  ): number;
};

export type ResolutionContext = {
  availableAppointments: EnhancedAppointment[];
  professionalAvailability: ProfessionalAvailabilityPattern[];
  systemConstraints: SystemConstraints;
  stakeholderPreferences: StakeholderPreferences;
  historicalData: HistoricalResolutionData;
};

export type ResolutionResult = {
  success: boolean;
  resolutionMethod: ResolutionMethod;
  proposedChanges: AppointmentChange[];
  confidenceScore: number;
  estimatedSatisfaction: StakeholderSatisfaction;
  executionTimeMs: number;
  explanation: string;
  alternatives?: ResolutionResult[];
};

export type AppointmentChange = {
  appointmentId: string;
  changeType: 'reschedule' | 'reassign' | 'cancel' | 'modify';
  originalValue: any;
  proposedValue: any;
  impact: ChangeImpact;
};

export type ChangeImpact = {
  stakeholder: 'patient' | 'professional' | 'clinic';
  severity: SeverityLevel;
  description: string;
  compensationRequired?: string;
};

export type StakeholderSatisfaction = {
  patient: number; // 0-1
  professional: number; // 0-1
  clinic: number; // 0-1
  overall: number; // 0-1
};

export type SystemConstraints = {
  businessHours: TimeRange[];
  minimumNoticeHours: number;
  maximumReschedulingAttempts: number;
  resourceCapacityLimits: ResourceCapacity[];
  professionalWorkingHours: Map<string, TimeRange[]>;
};

export type TimeRange = {
  start: string; // HH:MM format
  end: string; // HH:MM format
  dayOfWeek?: number; // 0-6, optional for recurring patterns
};

export type ResourceCapacity = {
  resourceId: string;
  resourceType: 'room' | 'equipment' | 'professional';
  maxConcurrentUsage: number;
  availabilitySchedule: TimeRange[];
};

export type StakeholderPreferences = {
  patientPreferences: Map<string, PatientPreference>;
  professionalPreferences: Map<string, ProfessionalPreference>;
  clinicPolicies: ClinicPolicy[];
};

export type PatientPreference = {
  patientId: string;
  preferredTimeSlots: TimeRange[];
  avoidedTimeSlots: TimeRange[];
  maxReschedulingTolerance: number; // hours
  communicationPreferences: string[];
  flexibilityScore: number; // 0-1
};

export type ProfessionalPreference = {
  professionalId: string;
  preferredWorkingHours: TimeRange[];
  minimumBreakTime: number; // minutes
  maxConsecutiveAppointments: number;
  specialtyPreferences: string[];
  workloadBalancingWeight: number; // 0-1
};

export type ClinicPolicy = {
  policyType: string;
  rules: PolicyRule[];
  priority: number;
  enforcement: 'strict' | 'flexible' | 'advisory';
};

export type PolicyRule = {
  condition: string;
  action: string;
  parameters: Record<string, any>;
};

export type HistoricalResolutionData = {
  previousResolutions: ConflictResolutionStrategy[];
  successRates: Map<StrategyType, number>;
  averageExecutionTimes: Map<StrategyType, number>;
  stakeholderFeedback: ResolutionFeedback[];
};

export type ResolutionFeedback = {
  resolutionId: string;
  stakeholder: string;
  satisfactionScore: number; // 0-1
  feedback: string;
  suggestions: string[];
  recordedAt: Date;
};

// Real-time event types
export type ConflictDetectionEvent = {
  type: 'conflict_detected' | 'conflict_resolved' | 'resolution_failed';
  conflictId: string;
  appointmentIds: string[];
  timestamp: Date;
  metadata: Record<string, any>;
};

export type RealtimeNotification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  severity: SeverityLevel;
  targetUsers: string[];
  actionRequired: boolean;
  actions?: NotificationAction[];
  createdAt: Date;
  expiresAt?: Date;
};

export type NotificationType =
  | 'conflict_alert'
  | 'resolution_suggestion'
  | 'escalation_required'
  | 'system_performance'
  | 'maintenance_notice';

export type NotificationAction = {
  id: string;
  label: string;
  actionType: 'approve' | 'reject' | 'modify' | 'escalate' | 'view_details';
  parameters?: Record<string, any>;
};

// API response types
export type ConflictDetectionResponse = {
  conflicts: SchedulingConflict[];
  totalCount: number;
  detectionLatencyMs: number;
  systemStatus: SystemStatus;
  recommendations: ResolutionRecommendation[];
};

export type ResolutionRecommendation = {
  conflictId: string;
  recommendedStrategy: StrategyType;
  confidenceScore: number;
  estimatedExecutionTime: number;
  expectedSatisfaction: StakeholderSatisfaction;
  reasoning: string;
};

export type SystemStatus = {
  isHealthy: boolean;
  activeConflicts: number;
  averageDetectionLatency: number;
  averageResolutionTime: number;
  systemLoad: number; // 0-1
  lastMaintenanceAt: Date;
};

// Error types
export class ConflictDetectionError extends Error {
  constructor(
    message: string,
    public readonly conflictId?: string,
    public readonly errorCode?: string,
    public readonly details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ConflictDetectionError';
  }
}

export class ResolutionExecutionError extends Error {
  constructor(
    message: string,
    public readonly strategyType: StrategyType,
    public readonly conflictId: string,
    public readonly executionTimeMs?: number,
    public readonly details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ResolutionExecutionError';
  }
}

// Validation schemas (for runtime type checking)
export const ConflictTypeSchema = [
  'time_overlap',
  'resource_conflict',
  'capacity_limit',
  'staff_unavailable',
  'room_conflict',
  'equipment_conflict',
] as const;

export const StrategyTypeSchema = [
  'mip_optimization',
  'constraint_programming',
  'genetic_algorithm',
  'reinforcement_learning',
  'rule_based',
  'hybrid',
] as const;

export const SeverityLevelSchema = [1, 2, 3, 4, 5] as const;

// Utility types for advanced TypeScript features
export type ConflictTypeKeys = keyof typeof ConflictTypeSchema;
export type StrategyTypeKeys = keyof typeof StrategyTypeSchema;

// Generic helper types
export type WithTimestamps<T> = T & {
  createdAt: Date;
  updatedAt: Date;
};

export type WithOptionalId<T> = Omit<T, 'id'> & {
  id?: string;
};

export type DatabaseRecord<T> = T & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};
