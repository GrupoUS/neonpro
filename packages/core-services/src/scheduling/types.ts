// Enhanced scheduling types for AI-powered scheduling
export interface AppointmentSlot {
  id: string;
  start: Date;
  end: Date;
  duration: number; // minutes
  isAvailable: boolean;
  staffId: string;
  roomId?: string;
  equipmentIds?: string[];
  treatmentTypeId: string;
  conflictScore: number; // AI-calculated conflict probability (0-1)
  optimizationScore: number; // AI-calculated optimization score (0-1)
}

export interface SchedulingConstraints {
  staffId: string;
  roomId?: string;
  equipmentIds?: string[];
  treatmentType: TreatmentType;
  patientId: string;
  preferredTimeSlots: TimeRange[];
  minBufferTime: number; // minutes between appointments
  maxTravelTime: number; // if patient has multiple treatments
}

export interface TreatmentType {
  id: string;
  name: string;
  category: 'botox' | 'fillers' | 'laser' | 'skincare' | 'consultation';
  duration: number; // base duration in minutes
  bufferTime: number; // cleanup/prep time in minutes
  requiredEquipment: string[];
  staffSpecializations: string[];
  complexityLevel: 1 | 2 | 3 | 4 | 5;
  averageDuration?: number; // AI-calculated average from historical data
  durationVariance?: number; // AI-calculated variance
}

export interface Staff {
  id: string;
  name: string;
  specializations: string[];
  workingHours: WorkingHours;
  skillLevel: 1 | 2 | 3 | 4 | 5;
  efficiency: number; // AI-calculated efficiency score (0-1)
  patientSatisfactionScore: number; // 0-1
}

export interface WorkingHours {
  [key: string]: {
    start: string; // HH:mm format
    end: string;
    breaks: TimeRange[];
  };
}

export interface TimeRange {
  start: Date;
  end: Date;
}

export interface Patient {
  id: string;
  name: string;
  preferences: PatientPreferences;
  history: AppointmentHistory[];
  riskFactors: RiskFactor[];
  noShowProbability: number; // AI-calculated (0-1)
}

export interface PatientPreferences {
  preferredStaff?: string[];
  preferredTimeSlots: TimeRange[];
  treatmentSpacing: number; // preferred days between treatments
  reminderPreferences: ReminderPreference[];
}

export interface ReminderPreference {
  method: 'email' | 'sms' | 'push' | 'call';
  timing: number; // hours before appointment
}

export interface AppointmentHistory {
  id: string;
  date: Date;
  treatmentType: string;
  staffId: string;
  duration: number;
  noShow: boolean;
  cancellation?: {
    date: Date;
    reason: string;
    hoursAdvance: number;
  };
  satisfaction?: number; // 1-5
}

export interface RiskFactor {
  type: 'no_show' | 'late_arrival' | 'cancellation';
  weight: number; // 0-1
  description: string;
}

export interface SchedulingRequest {
  patientId: string;
  treatmentTypeId: string;
  preferredDate?: Date;
  preferredTimeRanges?: TimeRange[];
  staffPreference?: string[];
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  flexibilityWindow: number; // days the patient is flexible
}

export interface SchedulingResult {
  success: boolean;
  appointmentSlot?: AppointmentSlot;
  alternatives?: AppointmentSlot[];
  conflicts?: Conflict[];
  optimizationRecommendations?: OptimizationRecommendation[];
  confidenceScore: number; // AI confidence in the scheduling decision (0-1)
  estimatedWaitTime?: number; // minutes until appointment
}

export interface Conflict {
  type:
    | 'staff_unavailable'
    | 'room_occupied'
    | 'equipment_conflict'
    | 'patient_conflict';
  severity: 'low' | 'medium' | 'high';
  description: string;
  affectedResource: string;
  suggestedResolution?: string;
}

export interface OptimizationRecommendation {
  type:
    | 'time_adjustment'
    | 'staff_change'
    | 'room_change'
    | 'treatment_grouping';
  impact:
    | 'efficiency'
    | 'patient_satisfaction'
    | 'revenue'
    | 'resource_utilization';
  description: string;
  expectedImprovement: number; // percentage improvement
}

export interface SchedulingAnalytics {
  utilizationRate: number; // percentage
  averageBookingTime: number; // seconds
  noShowRate: number; // percentage
  cancellationRate: number; // percentage
  patientSatisfactionScore: number; // 1-5
  revenueOptimization: number; // percentage above baseline
  timeSlotEfficiency: TimeSlotEfficiency[];
}

export interface TimeSlotEfficiency {
  timeRange: TimeRange;
  utilizationRate: number;
  demandScore: number;
  staffEfficiency: number;
  revenuePerHour: number;
}

export interface AISchedulingConfig {
  optimizationGoals: {
    patientSatisfaction: number; // weight 0-1
    staffUtilization: number;
    revenueMaximization: number;
    timeEfficiency: number;
  };
  constraints: {
    maxBookingLookAhead: number; // days
    minAdvanceBooking: number; // hours
    emergencySlotReservation: number; // percentage of slots to keep free
  };
  aiModels: {
    noShowPrediction: boolean;
    durationPrediction: boolean;
    demandForecasting: boolean;
    resourceOptimization: boolean;
  };
}

// AI Scheduling Engine Types
export interface SchedulingDecision {
  appointmentId: string;
  confidence: number;
  reasoning: string[];
  alternatives: AlternativeSlot[];
  riskAssessment: RiskAssessment;
}

export interface AlternativeSlot {
  slot: AppointmentSlot;
  score: number;
  tradeoffs: string[];
}

export interface RiskAssessment {
  noShowRisk: number;
  overbookingRisk: number;
  patientSatisfactionRisk: number;
  mitigationStrategies: string[];
}

// Real-time optimization types
export interface DynamicSchedulingEvent {
  type:
    | 'cancellation'
    | 'no_show'
    | 'walk_in'
    | 'emergency'
    | 'staff_unavailable';
  timestamp: Date;
  affectedAppointments: string[];
  availableActions: SchedulingAction[];
}

export interface SchedulingAction {
  type:
    | 'reschedule'
    | 'reassign_staff'
    | 'change_room'
    | 'adjust_duration'
    | 'add_buffer';
  description: string;
  impact: ActionImpact;
  executionTime: number; // seconds to execute
}

export interface ActionImpact {
  efficiencyChange: number; // percentage
  patientSatisfactionChange: number;
  revenueImpact: number; // monetary
  affectedAppointments: number;
}
