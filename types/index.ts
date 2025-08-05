// Type exports index
export * from "./auth";
export * from "./medical";
export * from "./ui";
export * from "./supabase";
export * from "./global";

// Re-export common types for convenience
export type {
  // Auth
  User,
  UserRole,
  AuthSession,
  SignInCredentials,
  SignUpCredentials,
  // Healthcare
  HealthcareProvider,
  ProviderType,
  SubscriptionPlan,
  SubscriptionStatus,
} from "./auth";

export type {
  // Medical
  Patient,
  Appointment,
  AppointmentType,
  AppointmentStatus,
  MedicalRecord,
  Doctor,
  VitalSigns,
  Diagnosis,
  LabResult,
} from "./medical";

export type {
  // UI
  BaseComponentProps,
  ButtonProps,
  CardProps,
  InputProps,
  SelectProps,
  DialogProps,
  // Common utilities
  ComponentVariant,
  ComponentSize,
  ComponentColor,
} from "./ui";
