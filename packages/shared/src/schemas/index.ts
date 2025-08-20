// Auth schemas and types

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
export * from './auth.schema';
// Re-export commonly used base schemas
export {
  // Appointment
  AppointmentBaseSchema,
  AppointmentQuerySchema,
  AppointmentStatusSchema,
  AuditActionSchema,
  // Compliance
  AuditLogSchema,
  ComplianceQuerySchema,
  ConsentRecordSchema,
  CreateAppointmentSchema,
  CreatePatientSchema,
  CreateProfessionalSchema,
  CreateServiceSchema,
  DataCategorySchema,
  DataSubjectRequestSchema,
  LoginRequestSchema,
  LoginResponseSchema,
  // Patient
  PatientBaseSchema,
  PatientQuerySchema,
  // Professional
  ProfessionalBaseSchema,
  ProfessionalQuerySchema,
  RegisterRequestSchema,
  // Service
  ServiceBaseSchema,
  ServiceCategorySchema,
  ServiceQuerySchema,
  SpecializationSchema,
  UpdateAppointmentSchema,
  UpdatePatientSchema,
  UpdateProfessionalSchema,
  UpdateServiceSchema,
  UserBaseSchema,
  UserPermissionSchema,
  // Auth
  UserRoleSchema,
} from './auth.schema';
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
