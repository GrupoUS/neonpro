// Type exports index

// Re-export common types for convenience
export type {
  AuthSession,
  // Healthcare
  HealthcareProvider,
  ProviderType,
  SignInCredentials,
  SignUpCredentials,
  SubscriptionPlan,
  SubscriptionStatus,
  // Auth
  User,
  UserRole,
} from "./auth";
export * from "./auth";
export * from "./global";
export type {
  Appointment,
  AppointmentStatus,
  AppointmentType,
  Diagnosis,
  Doctor,
  LabResult,
  MedicalRecord,
  // Medical
  Patient,
  VitalSigns,
} from "./medical";
export * from "./medical";
export * from "./supabase";
export type {
  // UI
  BaseComponentProps,
  ButtonProps,
  CardProps,
  ComponentColor,
  ComponentSize,
  // Common utilities
  ComponentVariant,
  DialogProps,
  InputProps,
  SelectProps,
} from "./ui";
export * from "./ui";
