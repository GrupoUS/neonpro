// Retention Analytics Types

export enum ChurnRiskLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum ChurnModelType {
  BASIC = "basic",
  ADVANCED = "advanced",
  ML_ENSEMBLE = "ml_ensemble",
}

export enum RetentionStrategyType {
  EMAIL_CAMPAIGN = "email_campaign",
  PHONE_OUTREACH = "phone_outreach",
  APPOINTMENT_REMINDER = "appointment_reminder",
  LOYALTY_PROGRAM = "loyalty_program",
  PERSONALIZED_OFFER = "personalized_offer",
}

export enum RetentionStrategyStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  PAUSED = "paused",
  COMPLETED = "completed",
  ARCHIVED = "archived",
}

export interface CreateRetentionStrategy {
  name: string;
  type: RetentionStrategyType;
  description?: string;
  target_risk_level: ChurnRiskLevel;
  clinic_id: string;
}

export const placeholder = true;
export default placeholder;
