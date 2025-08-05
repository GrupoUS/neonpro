import { type Static, Type } from "@sinclair/typebox";

// Base patient information schema (LGPD compliant)
export const PatientBaseSchema = Type.Object({
  name: Type.String({
    minLength: 2,
    maxLength: 100,
    description: "Full name of the patient",
  }),
  dateOfBirth: Type.String({
    format: "date",
    description: "Date of birth in YYYY-MM-DD format",
  }),
  gender: Type.Union(
    [
      Type.Literal("male"),
      Type.Literal("female"),
      Type.Literal("other"),
      Type.Literal("prefer_not_to_say"),
    ],
    { description: "Patient gender identity" },
  ),
  email: Type.Optional(
    Type.String({
      format: "email",
      description: "Contact email address",
    }),
  ),
  phone: Type.Optional(
    Type.String({
      pattern: "^\\+?[1-9]\\d{1,14}$",
      description: "Phone number in international format",
    }),
  ),
  cpf: Type.Optional(
    Type.String({
      pattern: "^\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}$",
      description: "Brazilian CPF number",
    }),
  ),
  rg: Type.Optional(
    Type.String({
      minLength: 5,
      maxLength: 20,
      description: "Brazilian RG number",
    }),
  ),
});

// Address schema
export const AddressSchema = Type.Object({
  street: Type.String({ minLength: 5, maxLength: 200 }),
  number: Type.String({ maxLength: 10 }),
  complement: Type.Optional(Type.String({ maxLength: 100 })),
  neighborhood: Type.String({ minLength: 2, maxLength: 100 }),
  city: Type.String({ minLength: 2, maxLength: 100 }),
  state: Type.String({ minLength: 2, maxLength: 2 }),
  zipCode: Type.String({
    pattern: "^\\d{5}-?\\d{3}$",
    description: "Brazilian CEP format",
  }),
  country: Type.String({ default: "BR" }),
}); // Emergency contact schema
export const EmergencyContactSchema = Type.Object({
  name: Type.String({ minLength: 2, maxLength: 100 }),
  phone: Type.String({ pattern: "^\\+?[1-9]\\d{1,14}$" }),
  relationship: Type.String({
    enum: ["spouse", "parent", "child", "sibling", "friend", "other"],
    description: "Relationship to patient",
  }),
  email: Type.Optional(Type.String({ format: "email" })),
});

// Insurance information schema
export const InsuranceInfoSchema = Type.Object({
  provider: Type.String({ minLength: 2, maxLength: 100 }),
  policyNumber: Type.String({ minLength: 3, maxLength: 50 }),
  groupNumber: Type.Optional(Type.String({ maxLength: 50 })),
  validUntil: Type.Optional(Type.String({ format: "date" })),
  planType: Type.Union([
    Type.Literal("basic"),
    Type.Literal("premium"),
    Type.Literal("executive"),
    Type.Literal("family"),
  ]),
});

// Medical record number schema (auto-generated, ANS compliant)
export const MedicalRecordSchema = Type.Object({
  number: Type.String({
    pattern: "^[A-Z]{2}\\d{8}$",
    description: "Medical record number (ANS format)",
  }),
  issuedDate: Type.String({ format: "date-time" }),
  issuedBy: Type.String({ description: "Healthcare professional or system" }),
}); // Complete patient creation schema
export const CreatePatientSchema = Type.Object({
  ...PatientBaseSchema.properties,
  address: Type.Optional(AddressSchema),
  emergencyContact: Type.Optional(EmergencyContactSchema),
  insuranceInfo: Type.Optional(InsuranceInfoSchema),
});

// Patient update schema (all fields optional except tenant validation)
export const UpdatePatientSchema = Type.Partial(CreatePatientSchema);

// Patient response schema (includes system fields)
export const PatientResponseSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
  ...CreatePatientSchema.properties,
  medicalRecordNumber: Type.String(),
  tenantId: Type.String({ format: "uuid" }),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
  isActive: Type.Boolean({ default: true }),
  lgpdConsent: Type.Object({
    dataProcessing: Type.Boolean(),
    marketing: Type.Boolean(),
    dataSharing: Type.Boolean(),
    consentDate: Type.String({ format: "date-time" }),
    consentVersion: Type.String(),
  }),
}); // Patient list query parameters
export const PatientQuerySchema = Type.Object({
  page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 20 })),
  search: Type.Optional(
    Type.String({
      minLength: 2,
      description: "Search by name, email, or medical record number",
    }),
  ),
  status: Type.Optional(
    Type.Union([Type.Literal("active"), Type.Literal("inactive"), Type.Literal("all")], {
      default: "active",
    }),
  ),
  sortBy: Type.Optional(
    Type.Union(
      [
        Type.Literal("name"),
        Type.Literal("createdAt"),
        Type.Literal("updatedAt"),
        Type.Literal("dateOfBirth"),
      ],
      { default: "createdAt" },
    ),
  ),
  sortOrder: Type.Optional(
    Type.Union([Type.Literal("asc"), Type.Literal("desc")], { default: "desc" }),
  ),
});

// Patient list response schema
export const PatientListResponseSchema = Type.Object({
  patients: Type.Array(PatientResponseSchema),
  pagination: Type.Object({
    page: Type.Integer(),
    limit: Type.Integer(),
    total: Type.Integer(),
    totalPages: Type.Integer(),
    hasNext: Type.Boolean(),
    hasPrev: Type.Boolean(),
  }),
}); // LGPD data export schema
export const PatientDataExportSchema = Type.Object({
  patient: PatientResponseSchema,
  medicalHistory: Type.Array(
    Type.Object({
      id: Type.String({ format: "uuid" }),
      date: Type.String({ format: "date-time" }),
      description: Type.String(),
      providerId: Type.String({ format: "uuid" }),
      providerName: Type.String(),
    }),
  ),
  appointments: Type.Array(
    Type.Object({
      id: Type.String({ format: "uuid" }),
      date: Type.String({ format: "date-time" }),
      type: Type.String(),
      status: Type.String(),
      providerId: Type.String({ format: "uuid" }),
      providerName: Type.String(),
    }),
  ),
  exportMetadata: Type.Object({
    exportedAt: Type.String({ format: "date-time" }),
    exportedBy: Type.String({ format: "uuid" }),
    dataRetentionUntil: Type.String({ format: "date-time" }),
    lgpdCompliance: Type.Boolean({ default: true }),
  }),
});

// Type exports for use in route handlers
export type CreatePatient = Static<typeof CreatePatientSchema>;
export type UpdatePatient = Static<typeof UpdatePatientSchema>;
export type PatientResponse = Static<typeof PatientResponseSchema>;
export type PatientQuery = Static<typeof PatientQuerySchema>;
export type PatientListResponse = Static<typeof PatientListResponseSchema>;
export type PatientDataExport = Static<typeof PatientDataExportSchema>;
