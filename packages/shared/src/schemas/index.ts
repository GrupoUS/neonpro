// Schema exports for NeonPro shared package
// All schemas organized by domain with no duplications

// Auth schemas and types
export * from './auth.schema';
export {
  LoginRequestSchema,
  LoginResponseSchema,
  RegisterRequestSchema,
  UserBaseSchema,
  UserPermissionSchema,
  UserRoleSchema,
} from './auth.schema';

// Appointment schemas and types
export * from './appointment.schema';
export {
  AppointmentBaseSchema,
  AppointmentQuerySchema,
  AppointmentStatusSchema,
  AppointmentTypeSchema,
  CreateAppointmentSchema,
  PrescriptionSchema,
  UpdateAppointmentSchema,
  VitalSignsSchema,
} from './appointment.schema';

// Compliance schemas and types
export * from './compliance.schema';
export {
  AuditActionSchema,
  AuditLogSchema,
  ComplianceQuerySchema,
  ConsentRecordSchema,
  DataCategorySchema,
  DataSubjectRequestSchema,
  LgpdLegalBasisSchema,
  SecurityIncidentSchema,
} from './compliance.schema';

// Patient schemas and types
export * from './patient.schema';
export {
  AddressSchema as PatientAddressSchema,
  CpfSchema,
  CreatePatientSchema,
  PatientBaseSchema,
  PatientGenderSchema,
  PatientQuerySchema,
  UpdatePatientSchema,
} from './patient.schema';

// Professional schemas and types
export * from './professional.schema';
export {
  CreateProfessionalSchema,
  ProfessionalBaseSchema,
  ProfessionalQuerySchema,
  ProfessionalTypeSchema,
  SpecializationSchema,
  UpdateProfessionalSchema,
  WorkingHoursSchema,
} from './professional.schema';

// Service schemas and types
export * from './service.schema';
export {
  AnvisaRiskClassificationSchema,
  CreateServiceSchema,
  ServiceBaseSchema,
  ServiceCategorySchema,
  ServiceQuerySchema,
  ServiceTypeSchema,
  UpdateServiceSchema,
} from './service.schema';