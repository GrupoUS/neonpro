// Healthcare-specific constants and configurations

const PATIENT_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  BLOCKED: "blocked",
} as const;

const APPOINTMENT_STATUS = {
  SCHEDULED: "scheduled",
  CONFIRMED: "confirmed",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "no-show",
} as const;

const APPOINTMENT_TYPE = {
  CONSULTATION: "consultation",
  PROCEDURE: "procedure",
  FOLLOW_UP: "follow-up",
  EMERGENCY: "emergency",
} as const;

const URGENCY_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
} as const;

// Status variants mapping for Badge component
const STATUS_VARIANTS = {
  [PATIENT_STATUS.ACTIVE]: "confirmed",
  [PATIENT_STATUS.INACTIVE]: "pending",
  [PATIENT_STATUS.BLOCKED]: "cancelled",
  [APPOINTMENT_STATUS.SCHEDULED]: "pending",
  [APPOINTMENT_STATUS.CONFIRMED]: "confirmed",
  [APPOINTMENT_STATUS.IN_PROGRESS]: "processing",
  [APPOINTMENT_STATUS.COMPLETED]: "confirmed",
  [APPOINTMENT_STATUS.CANCELLED]: "cancelled",
  [APPOINTMENT_STATUS.NO_SHOW]: "cancelled",
} as const; // Brazilian healthcare compliance constants
const LGPD_CONSTANTS = {
  DATA_RETENTION_YEARS: 5,
  CONSENT_RENEWAL_MONTHS: 24,
  BREACH_NOTIFICATION_HOURS: 72,
} as const;

// ANVISA compliance constants
const ANVISA_CONSTANTS = {
  ADVERSE_EVENT_REPORTING_HOURS: 24,
  PRODUCT_REGISTRATION_REQUIRED: true,
} as const;

export {
  PATIENT_STATUS,
  APPOINTMENT_STATUS,
  APPOINTMENT_TYPE,
  URGENCY_LEVELS,
  STATUS_VARIANTS,
  LGPD_CONSTANTS,
  ANVISA_CONSTANTS,
};
