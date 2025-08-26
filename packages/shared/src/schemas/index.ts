// Schema exports for NeonPro shared package
// All schemas organized by domain with no duplications

// Appointment schemas only
export {
  AppointmentBaseSchema,
  AppointmentQuerySchema,
  AppointmentStatusSchema,
  AppointmentTypeSchema,
  CreateAppointmentSchema,
  PrescriptionSchema,
  UpdateAppointmentSchema,
  VitalSignsSchema,
} from "./appointment.schema";
// Auth schemas only (no type exports to avoid conflicts)
export {
  LoginRequestSchema,
  LoginResponseSchema,
  RefreshTokenRequestSchema,
  RefreshTokenResponseSchema,
  RegisterRequestSchema,
  UserBaseSchema,
  UserPermissionSchema,
  UserRoleSchema,
} from "./auth.schema";

// Compliance schemas only
export {
  AuditActionSchema,
  AuditLogSchema,
  ComplianceQuerySchema,
  ConsentRecordSchema,
  DataCategorySchema,
  DataSubjectRequestSchema,
  LgpdLegalBasisSchema,
  SecurityIncidentSchema,
} from "./compliance.schema";

// Patient schemas only (note: AddressSchema renamed to avoid conflicts)
export {
  AddressSchema as PatientAddressSchema,
  CpfSchema,
  CreatePatientSchema,
  PatientBaseSchema,
  PatientGenderSchema,
  PatientQuerySchema,
  UpdatePatientSchema,
} from "./patient.schema";

// Professional schemas only
export {
  CreateProfessionalSchema,
  ProfessionalBaseSchema,
  ProfessionalQuerySchema,
  ProfessionalTypeSchema,
  SpecializationSchema,
  UpdateProfessionalSchema,
  WorkingHoursSchema,
} from "./professional.schema";

// Service schemas only
export {
  AnvisaRiskClassificationSchema,
  CreateServiceSchema,
  ServiceBaseSchema,
  ServiceCategorySchema,
  ServiceQuerySchema,
  ServiceTypeSchema,
  UpdateServiceSchema,
} from "./service.schema";
