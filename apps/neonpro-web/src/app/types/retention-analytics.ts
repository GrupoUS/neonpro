// Retention Analytics Types
// Generated for NeonPro - FASE 4

export enum ChurnRiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum ChurnModelType {
  BASIC = 'basic',
  ADVANCED = 'advanced',
  ML_ENHANCED = 'ml_enhanced'
}

export enum RetentionStrategyType {
  PROACTIVE = 'proactive',
  REACTIVE = 'reactive',
  PREDICTIVE = 'predictive'
}

export enum RetentionActionType {
  EMAIL = 'email',
  CALL = 'call',
  SMS = 'sms',
  PUSH_NOTIFICATION = 'push_notification'
}

export enum CommunicationChannel {
  EMAIL = 'email',
  PHONE = 'phone',
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
  IN_APP = 'in_app'
}

export enum InterventionPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum RetentionOutcome {
  SUCCESS = 'success',
  FAILED = 'failed',
  PENDING = 'pending',
  PARTIAL = 'partial'
}

export interface ChurnPrediction {
  patientId: string;
  riskLevel: ChurnRiskLevel;
  probability: number;
  factors: string[];
  recommendedActions: RetentionActionType[];
}

export interface RetentionMetrics {
  totalPatients: number;
  atRiskPatients: number;
  retentionRate: number;
  churnRate: number;
}
export enum RetentionStrategyStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}
