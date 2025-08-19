// Enhanced scheduling types for AI-powered scheduling
export type AppointmentSlot = {
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
};

export type SchedulingConstraints = {
  staffId: string;
  roomId?: string;
  equipmentIds?: string[];
  treatmentType: TreatmentType;
  patientId: string;
  preferredTimeSlots: TimeRange[];
  minBufferTime: number; // minutes between appointments
  maxTravelTime: number; // if patient has multiple treatments
};

export type TreatmentType = {
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
};

export type Staff = {
  id: string;
  name: string;
  specializations: string[];
  workingHours: WorkingHours;
  skillLevel: 1 | 2 | 3 | 4 | 5;
  efficiency: number; // AI-calculated efficiency score (0-1)
  patientSatisfactionScore: number; // 0-1
};

export type WorkingHours = {
  [key: string]: {
    start: string; // HH:mm format
    end: string;
    breaks: TimeRange[];
  };
};

export type TimeRange = {
  start: Date;
  end: Date;
};

export type Patient = {
  id: string;
  name: string;
  preferences: PatientPreferences;
  history: AppointmentHistory[];
  riskFactors: RiskFactor[];
  noShowProbability: number; // AI-calculated (0-1)
};

export type PatientPreferences = {
  preferredStaff?: string[];
  preferredTimeSlots: TimeRange[];
  treatmentSpacing: number; // preferred days between treatments
  reminderPreferences: ReminderPreference[];
};

export type ReminderPreference = {
  method: 'email' | 'sms' | 'push' | 'call';
  timing: number; // hours before appointment
};

export type AppointmentHistory = {
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
};

export type RiskFactor = {
  type: 'no_show' | 'late_arrival' | 'cancellation';
  weight: number; // 0-1
  description: string;
};

export type SchedulingRequest = {
  patientId: string;
  treatmentTypeId: string;
  preferredDate?: Date;
  preferredTimeRanges?: TimeRange[];
  staffPreference?: string[];
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  flexibilityWindow: number; // days the patient is flexible
};

export type SchedulingResult = {
  success: boolean;
  appointmentSlot?: AppointmentSlot;
  alternatives?: AppointmentSlot[];
  conflicts?: Conflict[];
  optimizationRecommendations?: OptimizationRecommendation[];
  confidenceScore: number; // AI confidence in the scheduling decision (0-1)
  estimatedWaitTime?: number; // minutes until appointment
};

export type Conflict = {
  type:
    | 'staff_unavailable'
    | 'room_occupied'
    | 'equipment_conflict'
    | 'patient_conflict';
  severity: 'low' | 'medium' | 'high';
  description: string;
  affectedResource: string;
  suggestedResolution?: string;
};

export type OptimizationRecommendation = {
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
};

export type SchedulingAnalytics = {
  utilizationRate: number; // percentage
  averageBookingTime: number; // seconds
  noShowRate: number; // percentage
  cancellationRate: number; // percentage
  patientSatisfactionScore: number; // 1-5
  revenueOptimization: number; // percentage above baseline
  timeSlotEfficiency: TimeSlotEfficiency[];
};

export type TimeSlotEfficiency = {
  timeRange: TimeRange;
  utilizationRate: number;
  demandScore: number;
  staffEfficiency: number;
  revenuePerHour: number;
};

export type AISchedulingConfig = {
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
};

// AI Scheduling Engine Types
export type SchedulingDecision = {
  appointmentId: string;
  confidence: number;
  reasoning: string[];
  alternatives: AlternativeSlot[];
  riskAssessment: RiskAssessment;
};

export type AlternativeSlot = {
  slot: AppointmentSlot;
  score: number;
  tradeoffs: string[];
};

export type RiskAssessment = {
  noShowRisk: number;
  overbookingRisk: number;
  patientSatisfactionRisk: number;
  mitigationStrategies: string[];
};

// Real-time optimization types
export type DynamicSchedulingEvent = {
  type:
    | 'cancellation'
    | 'no_show'
    | 'walk_in'
    | 'emergency'
    | 'staff_unavailable';
  timestamp: Date;
  affectedAppointments: string[];
  availableActions: SchedulingAction[];
};

export type SchedulingAction = {
  type:
    | 'reschedule'
    | 'reassign_staff'
    | 'change_room'
    | 'adjust_duration'
    | 'add_buffer';
  description: string;
  impact: ActionImpact;
  executionTime: number; // seconds to execute
};

export type ActionImpact = {
  efficiencyChange: number; // percentage
  patientSatisfactionChange: number;
  revenueImpact: number; // monetary
  affectedAppointments: number;
};
