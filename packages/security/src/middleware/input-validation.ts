import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";

// Constants for byte conversions
const BYTES_PER_KB = 1024;

// ========================================
// VALIDATION CONSTANTS
// ========================================

// Name and Personal Information Limits
const MAX_NAME_LENGTH = 100;
const MIN_NAME_LENGTH = 2;
const MAX_EMAIL_LENGTH = 255;

// Address Validation Limits
const MIN_STREET_LENGTH = 5;
const MAX_STREET_LENGTH = 200;
const MIN_CITY_LENGTH = 2;
const MAX_CITY_LENGTH = 100;
const MIN_POSTAL_CODE_LENGTH = 3;
const MAX_POSTAL_CODE_LENGTH = 20;

// Phone Number Validation
const MIN_PHONE_LENGTH = 10;
const MAX_PHONE_LENGTH = 15;

// Appointment and Scheduling Limits
const MIN_APPOINTMENT_DURATION_MINUTES = 15;
const MAX_APPOINTMENT_DURATION_MINUTES = 240;
const MAX_NOTES_LENGTH = 1000;
const MAX_REASON_LENGTH = 500;

// Healthcare-specific Limits
const MAX_SYMPTOMS_LENGTH = 2000;
const MAX_TREATMENT_LENGTH = 2000;
const MAX_DIAGNOSIS_LENGTH = 500;
const MAX_MEDICATION_LENGTH = 200;
const MIN_AGE = 0;
const MAX_AGE = 150;

// Vital Signs Limits
const MIN_SYSTOLIC_BP = 50;
const MAX_SYSTOLIC_BP = 300;
const MIN_DIASTOLIC_BP = 30;
const MAX_DIASTOLIC_BP = 200;
const MIN_HEART_RATE = 30;
const MAX_HEART_RATE = 300;
const MIN_TEMPERATURE = 30; // Celsius
const MAX_TEMPERATURE = 45; // Celsius
const MIN_WEIGHT_KG = 1;
const MAX_WEIGHT_KG = 500;
const MIN_HEIGHT_CM = 30;
const MAX_HEIGHT_CM = 300;

// Professional and System Limits
const MIN_YEARS_EXPERIENCE = 0;
const MAX_YEARS_EXPERIENCE = 60;
const MIN_LICENSE_LENGTH = 5;
const MAX_LICENSE_LENGTH = 50;
const MAX_CREDENTIAL_LENGTH = 100;
const MAX_LANGUAGE_LENGTH = 50;
const MAX_SPECIALIZATION_LENGTH = 100;
const MIN_SPECIALIZATION_LENGTH = 2;
const MAX_RELATIONSHIP_LENGTH = 50;
const MIN_RELATIONSHIP_LENGTH = 2;
const MAX_STATE_LENGTH = 50;
const MIN_STATE_LENGTH = 2;
const MAX_COUNTRY_LENGTH = 100;
const MIN_COUNTRY_LENGTH = 2;
const MAX_INSURANCE_POLICY_LENGTH = 50;
const MAX_TIMEZONE_LENGTH = 50;

// Additional System Limits
const MAX_APPOINTMENT_TYPE_LENGTH = 100;
const MIN_APPOINTMENT_TYPE_LENGTH = 2;
const MAX_REMINDER_HOURS = 168; // 7 days
const MIN_REMINDER_HOURS = 1;
const MAX_DOSAGE_LENGTH = 100;
const MAX_FREQUENCY_LENGTH = 100;
const MAX_DURATION_LENGTH = 100;
const MAX_INSTRUCTIONS_LENGTH = MAX_NOTES_LENGTH;
const MAX_BIO_LENGTH = MAX_NOTES_LENGTH;
const MAX_PROFILE_IMAGE_URL_LENGTH = 500;

// Billing and Financial Limits
const MIN_AMOUNT = 0;
const MAX_AMOUNT = 999_999;
const CURRENCY_CODE_LENGTH = 3;
const MAX_INVOICE_NUMBER_LENGTH = 50;
const MAX_CLAIM_NUMBER_LENGTH = 50;
const MAX_AUTHORIZATION_CODE_LENGTH = 50;

// Communication and Notification Limits
const MIN_ACTION_LENGTH = 2;
const MAX_ACTION_LENGTH = 100;
const MIN_RESOURCE_TYPE_LENGTH = 2;
const MAX_RESOURCE_TYPE_LENGTH = 50;
const MAX_USER_AGENT_LENGTH = 500;
const MAX_COMPLIANCE_REQUIREMENT_LENGTH = 200;
const MIN_RETENTION_DAYS = 1;

// Rate Limiting and Health Check Limits
const MIN_WINDOW_MS = 1000; // 1 second
const MAX_WINDOW_MS = 3_600_000; // 1 hour
const MIN_MAX_REQUESTS = 1;
const MAX_MAX_REQUESTS = 10_000;
const MIN_VERSION_LENGTH = 1;
const MAX_VERSION_LENGTH = 50;
const MAX_SERVICE_NAME_LENGTH = 100;
const MIN_RESPONSE_TIME = 0;

// Data Retention and Audit Limits
const MAX_RETENTION_PERIOD_DAYS = 3650; // 10 years
const MAX_AUDIT_DESCRIPTION_LENGTH = 1000;

// File and Upload Limits
const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_NAME_LENGTH = 255;
const ALLOWED_FILE_EXTENSIONS = ["pdf", "doc", "docx", "jpg", "jpeg", "png"];

// Password and Security Limits
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;
const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

// Pagination and Query Limits
const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 20;
const MAX_SEARCH_QUERY_LENGTH = 200;

// Communication Limits
const MAX_MESSAGE_LENGTH = 5000;
const MAX_SUBJECT_LENGTH = 200;

// ========================================
// VALIDATION SCHEMAS
// ========================================

// Basic validation schemas
export const emailSchema = z
  .string()
  .email("Invalid email format")
  .max(
    MAX_EMAIL_LENGTH,
    `Email must not exceed ${MAX_EMAIL_LENGTH} characters`,
  );

export const phoneSchema = z
  .string()
  .min(
    MIN_PHONE_LENGTH,
    `Phone must be at least ${MIN_PHONE_LENGTH} characters`,
  )
  .max(MAX_PHONE_LENGTH, `Phone must not exceed ${MAX_PHONE_LENGTH} characters`)
  .regex(/^\+?[\d\s\-().]+$/, "Invalid phone number format");

export const nameSchema = z
  .string()
  .min(MIN_NAME_LENGTH, `Name must be at least ${MIN_NAME_LENGTH} characters`)
  .max(MAX_NAME_LENGTH, `Name must not exceed ${MAX_NAME_LENGTH} characters`)
  .regex(
    /^[a-zA-ZÀ-ÿ\u00F1\u00D1\s\-.']+$/u,
    "Name contains invalid characters",
  );

// Address validation schema
export const addressSchema = z.object({
  street: z
    .string()
    .min(
      MIN_STREET_LENGTH,
      `Street must be at least ${MIN_STREET_LENGTH} characters`,
    )
    .max(
      MAX_STREET_LENGTH,
      `Street must not exceed ${MAX_STREET_LENGTH} characters`,
    ),
  city: z
    .string()
    .min(MIN_CITY_LENGTH, `City must be at least ${MIN_CITY_LENGTH} characters`)
    .max(MAX_CITY_LENGTH, `City must not exceed ${MAX_CITY_LENGTH} characters`),
  state: z
    .string()
    .min(
      MIN_STATE_LENGTH,
      `State must be at least ${MIN_STATE_LENGTH} characters`,
    )
    .max(
      MAX_STATE_LENGTH,
      `State must not exceed ${MAX_STATE_LENGTH} characters`,
    ),
  postalCode: z
    .string()
    .min(
      MIN_POSTAL_CODE_LENGTH,
      `Postal code must be at least ${MIN_POSTAL_CODE_LENGTH} characters`,
    )
    .max(
      MAX_POSTAL_CODE_LENGTH,
      `Postal code must not exceed ${MAX_POSTAL_CODE_LENGTH} characters`,
    ),
  country: z
    .string()
    .min(
      MIN_COUNTRY_LENGTH,
      `Country must be at least ${MIN_COUNTRY_LENGTH} characters`,
    )
    .max(
      MAX_COUNTRY_LENGTH,
      `Country must not exceed ${MAX_COUNTRY_LENGTH} characters`,
    ),
});

// Password validation schema
export const passwordSchema = z
  .string()
  .min(
    MIN_PASSWORD_LENGTH,
    `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
  )
  .max(
    MAX_PASSWORD_LENGTH,
    `Password must not exceed ${MAX_PASSWORD_LENGTH} characters`,
  )
  .regex(
    PASSWORD_COMPLEXITY_REGEX,
    "Password must contain at least one lowercase letter, uppercase letter, number, and special character",
  );

// Patient registration schema
export const patientRegistrationSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  dateOfBirth: z.string().datetime("Invalid date format"),
  address: addressSchema,
  emergencyContact: z.object({
    name: nameSchema,
    phone: phoneSchema,
    relationship: z
      .string()
      .min(
        MIN_RELATIONSHIP_LENGTH,
        `Relationship must be at least ${MIN_RELATIONSHIP_LENGTH} characters`,
      )
      .max(
        MAX_RELATIONSHIP_LENGTH,
        `Relationship must not exceed ${MAX_RELATIONSHIP_LENGTH} characters`,
      ),
  }),
  medicalHistory: z
    .string()
    .max(
      MAX_SYMPTOMS_LENGTH,
      `Medical history must not exceed ${MAX_SYMPTOMS_LENGTH} characters`,
    )
    .optional(),
  allergies: z
    .string()
    .max(
      MAX_MEDICATION_LENGTH,
      `Allergies must not exceed ${MAX_MEDICATION_LENGTH} characters`,
    )
    .optional(),
  currentMedications: z
    .string()
    .max(
      MAX_MEDICATION_LENGTH,
      `Current medications must not exceed ${MAX_MEDICATION_LENGTH} characters`,
    )
    .optional(),
  insuranceProvider: z
    .string()
    .max(
      MAX_NAME_LENGTH,
      `Insurance provider must not exceed ${MAX_NAME_LENGTH} characters`,
    )
    .optional(),
  insurancePolicyNumber: z
    .string()
    .max(
      MAX_INSURANCE_POLICY_LENGTH,
      `Insurance policy number must not exceed ${MAX_INSURANCE_POLICY_LENGTH} characters`,
    )
    .optional(),
  lgpdConsent: z
    .boolean()
    .refine((val) => val === true, "LGPD consent is required"),
  consentTimestamp: z.string().datetime("Invalid consent timestamp format"),
}); // Appointment scheduling schema
export const appointmentSchema = z.object({
  patientId: z.string().uuid("Invalid patient ID format"),
  providerId: z.string().uuid("Invalid provider ID format"),
  appointmentType: z
    .string()
    .min(
      MIN_APPOINTMENT_TYPE_LENGTH,
      `Appointment type must be at least ${MIN_APPOINTMENT_TYPE_LENGTH} characters`,
    )
    .max(
      MAX_APPOINTMENT_TYPE_LENGTH,
      `Appointment type must not exceed ${MAX_APPOINTMENT_TYPE_LENGTH} characters`,
    ),
  scheduledDateTime: z.string().datetime("Invalid appointment date format"),
  duration: z
    .number()
    .min(
      MIN_APPOINTMENT_DURATION_MINUTES,
      `Duration must be at least ${MIN_APPOINTMENT_DURATION_MINUTES} minutes`,
    )
    .max(
      MAX_APPOINTMENT_DURATION_MINUTES,
      `Duration must not exceed ${MAX_APPOINTMENT_DURATION_MINUTES} minutes`,
    ),
  reason: z
    .string()
    .max(
      MAX_REASON_LENGTH,
      `Reason must not exceed ${MAX_REASON_LENGTH} characters`,
    )
    .optional(),
  notes: z
    .string()
    .max(
      MAX_NOTES_LENGTH,
      `Notes must not exceed ${MAX_NOTES_LENGTH} characters`,
    )
    .optional(),
  isVirtual: z.boolean().default(false),
  reminderSettings: z
    .object({
      email: z.boolean().default(true),
      sms: z.boolean().default(false),
      hoursBeforeReminder: z
        .number()
        .min(
          MIN_REMINDER_HOURS,
          `Reminder must be at least ${MIN_REMINDER_HOURS} hour before`,
        )
        .max(
          MAX_REMINDER_HOURS,
          `Reminder must not exceed ${MAX_REMINDER_HOURS} hours (7 days)`,
        ),
    })
    .optional(),
});

// Medical record schema
export const medicalRecordSchema = z.object({
  patientId: z.string().uuid("Invalid patient ID format"),
  providerId: z.string().uuid("Invalid provider ID format"),
  appointmentId: z.string().uuid("Invalid appointment ID format").optional(),
  visitDate: z.string().datetime("Invalid visit date format"),
  chiefComplaint: z
    .string()
    .max(
      MAX_SYMPTOMS_LENGTH,
      `Chief complaint must not exceed ${MAX_SYMPTOMS_LENGTH} characters`,
    ),
  symptoms: z
    .string()
    .max(
      MAX_SYMPTOMS_LENGTH,
      `Symptoms must not exceed ${MAX_SYMPTOMS_LENGTH} characters`,
    )
    .optional(),
  diagnosis: z
    .string()
    .max(
      MAX_DIAGNOSIS_LENGTH,
      `Diagnosis must not exceed ${MAX_DIAGNOSIS_LENGTH} characters`,
    )
    .optional(),
  treatment: z
    .string()
    .max(
      MAX_TREATMENT_LENGTH,
      `Treatment must not exceed ${MAX_TREATMENT_LENGTH} characters`,
    )
    .optional(),
  prescriptions: z
    .array(
      z.object({
        medication: z
          .string()
          .max(
            MAX_MEDICATION_LENGTH,
            `Medication name must not exceed ${MAX_MEDICATION_LENGTH} characters`,
          ),
        dosage: z
          .string()
          .max(
            MAX_DOSAGE_LENGTH,
            `Dosage must not exceed ${MAX_DOSAGE_LENGTH} characters`,
          ),
        frequency: z
          .string()
          .max(
            MAX_FREQUENCY_LENGTH,
            `Frequency must not exceed ${MAX_FREQUENCY_LENGTH} characters`,
          ),
        duration: z
          .string()
          .max(
            MAX_DURATION_LENGTH,
            `Duration must not exceed ${MAX_DURATION_LENGTH} characters`,
          ),
        instructions: z
          .string()
          .max(
            MAX_INSTRUCTIONS_LENGTH,
            `Instructions must not exceed ${MAX_INSTRUCTIONS_LENGTH} characters`,
          )
          .optional(),
      }),
    )
    .optional(),
  followUpRequired: z.boolean().default(false),
  followUpDate: z.string().datetime("Invalid follow-up date format").optional(),
  notes: z
    .string()
    .max(
      MAX_NOTES_LENGTH,
      `Notes must not exceed ${MAX_NOTES_LENGTH} characters`,
    )
    .optional(),
  vitalSigns: z
    .object({
      bloodPressureSystolic: z
        .number()
        .min(MIN_SYSTOLIC_BP, `Systolic BP must be at least ${MIN_SYSTOLIC_BP}`)
        .max(MAX_SYSTOLIC_BP, `Systolic BP must not exceed ${MAX_SYSTOLIC_BP}`)
        .optional(),
      bloodPressureDiastolic: z
        .number()
        .min(
          MIN_DIASTOLIC_BP,
          `Diastolic BP must be at least ${MIN_DIASTOLIC_BP}`,
        )
        .max(
          MAX_DIASTOLIC_BP,
          `Diastolic BP must not exceed ${MAX_DIASTOLIC_BP}`,
        )
        .optional(),
      heartRate: z
        .number()
        .min(MIN_HEART_RATE, `Heart rate must be at least ${MIN_HEART_RATE}`)
        .max(MAX_HEART_RATE, `Heart rate must not exceed ${MAX_HEART_RATE}`)
        .optional(),
      temperature: z
        .number()
        .min(
          MIN_TEMPERATURE,
          `Temperature must be at least ${MIN_TEMPERATURE}°C`,
        )
        .max(
          MAX_TEMPERATURE,
          `Temperature must not exceed ${MAX_TEMPERATURE}°C`,
        )
        .optional(),
      weight: z
        .number()
        .min(MIN_WEIGHT_KG, `Weight must be at least ${MIN_WEIGHT_KG} kg`)
        .max(MAX_WEIGHT_KG, `Weight must not exceed ${MAX_WEIGHT_KG} kg`)
        .optional(),
      height: z
        .number()
        .min(MIN_HEIGHT_CM, `Height must be at least ${MIN_HEIGHT_CM} cm`)
        .max(MAX_HEIGHT_CM, `Height must not exceed ${MAX_HEIGHT_CM} cm`)
        .optional(),
    })
    .optional(),
});
// User profile update schema
export const userProfileUpdateSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  address: addressSchema.optional(),
  dateOfBirth: z.string().datetime("Invalid date format").optional(),
  preferredLanguage: z.enum(["en", "pt", "es"]).optional(),
  timezone: z
    .string()
    .max(
      MAX_TIMEZONE_LENGTH,
      `Timezone must not exceed ${MAX_TIMEZONE_LENGTH} characters`,
    )
    .optional(),
  communicationPreferences: z
    .object({
      emailNotifications: z.boolean().default(true),
      smsNotifications: z.boolean().default(false),
      marketingEmails: z.boolean().default(false),
      appointmentReminders: z.boolean().default(true),
    })
    .optional(),
});

// Provider registration schema
export const providerRegistrationSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  specialization: z
    .string()
    .min(
      MIN_SPECIALIZATION_LENGTH,
      `Specialization must be at least ${MIN_SPECIALIZATION_LENGTH} characters`,
    )
    .max(
      MAX_SPECIALIZATION_LENGTH,
      `Specialization must not exceed ${MAX_SPECIALIZATION_LENGTH} characters`,
    ),
  licenseNumber: z
    .string()
    .min(
      MIN_LICENSE_LENGTH,
      `License number must be at least ${MIN_LICENSE_LENGTH} characters`,
    )
    .max(
      MAX_LICENSE_LENGTH,
      `License number must not exceed ${MAX_LICENSE_LENGTH} characters`,
    ),
  credentials: z
    .array(
      z
        .string()
        .max(
          MAX_CREDENTIAL_LENGTH,
          `Credential must not exceed ${MAX_CREDENTIAL_LENGTH} characters`,
        ),
    )
    .optional(),
  yearsOfExperience: z
    .number()
    .min(
      MIN_YEARS_EXPERIENCE,
      `Years of experience must be at least ${MIN_YEARS_EXPERIENCE}`,
    )
    .max(
      MAX_YEARS_EXPERIENCE,
      `Years of experience must not exceed ${MAX_YEARS_EXPERIENCE}`,
    ),
  languages: z
    .array(
      z
        .string()
        .max(
          MAX_LANGUAGE_LENGTH,
          `Language must not exceed ${MAX_LANGUAGE_LENGTH} characters`,
        ),
    )
    .optional(),
  availability: z
    .object({
      monday: z
        .object({
          start: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
          end: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
        })
        .optional(),
      tuesday: z
        .object({
          start: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
          end: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
        })
        .optional(),
      wednesday: z
        .object({
          start: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
          end: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
        })
        .optional(),
      thursday: z
        .object({
          start: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
          end: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
        })
        .optional(),
      friday: z
        .object({
          start: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
          end: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
        })
        .optional(),
      saturday: z
        .object({
          start: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
          end: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
        })
        .optional(),
      sunday: z
        .object({
          start: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
          end: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
        })
        .optional(),
    })
    .optional(),
  profileImage: z
    .string()
    .url("Invalid profile image URL")
    .max(
      MAX_PROFILE_IMAGE_URL_LENGTH,
      `Profile image URL must not exceed ${MAX_PROFILE_IMAGE_URL_LENGTH} characters`,
    )
    .optional(),
  bio: z
    .string()
    .max(MAX_BIO_LENGTH, `Bio must not exceed ${MAX_BIO_LENGTH} characters`)
    .optional(),
});

// File upload schema
export const fileUploadSchema = z.object({
  fileName: z
    .string()
    .min(1, "File name is required")
    .max(
      MAX_FILE_NAME_LENGTH,
      `File name must not exceed ${MAX_FILE_NAME_LENGTH} characters`,
    ),
  fileSize: z
    .number()
    .max(
      MAX_FILE_SIZE_MB * BYTES_PER_KB * BYTES_PER_KB,
      `File size must not exceed ${MAX_FILE_SIZE_MB}MB`,
    ),
  fileType: z
    .string()
    .refine(
      (type) => ALLOWED_FILE_EXTENSIONS.some((ext) => type.toLowerCase().includes(ext)),
      `File type must be one of: ${ALLOWED_FILE_EXTENSIONS.join(", ")}`,
    ),
  patientId: z.string().uuid("Invalid patient ID format").optional(),
  appointmentId: z.string().uuid("Invalid appointment ID format").optional(),
  category: z.enum([
    "medical_record",
    "lab_result",
    "imaging",
    "insurance",
    "identification",
    "other",
  ]),
  description: z
    .string()
    .max(
      MAX_NOTES_LENGTH,
      `Description must not exceed ${MAX_NOTES_LENGTH} characters`,
    )
    .optional(),
}); // Message/communication schema
export const messageSchema = z.object({
  recipientId: z.string().uuid("Invalid recipient ID format"),
  subject: z
    .string()
    .min(1, "Subject is required")
    .max(
      MAX_SUBJECT_LENGTH,
      `Subject must not exceed ${MAX_SUBJECT_LENGTH} characters`,
    ),
  content: z
    .string()
    .min(1, "Message content is required")
    .max(
      MAX_MESSAGE_LENGTH,
      `Message must not exceed ${MAX_MESSAGE_LENGTH} characters`,
    ),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  messageType: z
    .enum(["general", "appointment", "medical", "billing", "system"])
    .default("general"),
  attachments: z.array(z.string().uuid("Invalid attachment ID")).optional(),
  isEncrypted: z.boolean().default(true),
});

// Search and pagination schema
export const searchSchema = z.object({
  query: z
    .string()
    .max(
      MAX_SEARCH_QUERY_LENGTH,
      `Search query must not exceed ${MAX_SEARCH_QUERY_LENGTH} characters`,
    )
    .optional(),
  filters: z.record(z.string()).optional(),
  sortBy: z
    .string()
    .max(
      MAX_LANGUAGE_LENGTH,
      `Sort field must not exceed ${MAX_LANGUAGE_LENGTH} characters`,
    )
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  page: z.number().min(1, "Page must be at least 1").default(1),
  pageSize: z
    .number()
    .min(1, "Page size must be at least 1")
    .max(MAX_PAGE_SIZE, `Page size must not exceed ${MAX_PAGE_SIZE}`)
    .default(DEFAULT_PAGE_SIZE),
  includeInactive: z.boolean().default(false),
});

// Audit log schema
export const auditLogSchema = z.object({
  action: z
    .string()
    .min(
      MIN_ACTION_LENGTH,
      `Action must be at least ${MIN_ACTION_LENGTH} characters`,
    )
    .max(
      MAX_ACTION_LENGTH,
      `Action must not exceed ${MAX_ACTION_LENGTH} characters`,
    ),
  resourceType: z
    .string()
    .min(
      MIN_RESOURCE_TYPE_LENGTH,
      `Resource type must be at least ${MIN_RESOURCE_TYPE_LENGTH} characters`,
    )
    .max(
      MAX_RESOURCE_TYPE_LENGTH,
      `Resource type must not exceed ${MAX_RESOURCE_TYPE_LENGTH} characters`,
    ),
  resourceId: z.string().uuid("Invalid resource ID format").optional(),
  userId: z.string().uuid("Invalid user ID format"),
  tenantId: z.string().uuid("Invalid tenant ID format"),
  ipAddress: z.string().ip("Invalid IP address format").optional(),
  userAgent: z
    .string()
    .max(
      MAX_USER_AGENT_LENGTH,
      `User agent must not exceed ${MAX_USER_AGENT_LENGTH} characters`,
    )
    .optional(),
  description: z
    .string()
    .max(
      MAX_AUDIT_DESCRIPTION_LENGTH,
      `Description must not exceed ${MAX_AUDIT_DESCRIPTION_LENGTH} characters`,
    )
    .optional(),
  metadata: z.record(z.<unknown>()).optional(),
  severity: z.enum(["info", "warning", "error", "critical"]).default("info"),
  timestamp: z.string().datetime("Invalid timestamp format"),
});

// Data retention policy schema
export const dataRetentionPolicySchema = z.object({
  resourceType: z
    .string()
    .min(
      MIN_RESOURCE_TYPE_LENGTH,
      `Resource type must be at least ${MIN_RESOURCE_TYPE_LENGTH} characters`,
    )
    .max(
      MAX_RESOURCE_TYPE_LENGTH,
      `Resource type must not exceed ${MAX_RESOURCE_TYPE_LENGTH} characters`,
    ),
  retentionPeriodDays: z
    .number()
    .min(
      MIN_RETENTION_DAYS,
      `Retention period must be at least ${MIN_RETENTION_DAYS} day`,
    )
    .max(
      MAX_RETENTION_PERIOD_DAYS,
      `Retention period must not exceed ${MAX_RETENTION_PERIOD_DAYS} days`,
    ),
  isActive: z.boolean().default(true),
  autoDeleteEnabled: z.boolean().default(false),
  backupRequired: z.boolean().default(true),
  complianceRequirement: z
    .string()
    .max(
      MAX_COMPLIANCE_REQUIREMENT_LENGTH,
      `Compliance requirement must not exceed ${MAX_COMPLIANCE_REQUIREMENT_LENGTH} characters`,
    )
    .optional(),
}); // Billing and payment schema
export const billingSchema = z.object({
  patientId: z.string().uuid("Invalid patient ID format"),
  appointmentId: z.string().uuid("Invalid appointment ID format").optional(),
  amount: z
    .number()
    .min(MIN_AMOUNT, `Amount must be at least ${MIN_AMOUNT}`)
    .max(MAX_AMOUNT, `Amount must not exceed ${MAX_AMOUNT.toLocaleString()}`),
  currency: z
    .string()
    .length(
      CURRENCY_CODE_LENGTH,
      `Currency must be ${CURRENCY_CODE_LENGTH} characters`,
    )
    .default("USD"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(
      MAX_NOTES_LENGTH,
      `Description must not exceed ${MAX_NOTES_LENGTH} characters`,
    ),
  invoiceNumber: z
    .string()
    .max(
      MAX_INVOICE_NUMBER_LENGTH,
      `Invoice number must not exceed ${MAX_INVOICE_NUMBER_LENGTH} characters`,
    )
    .optional(),
  dueDate: z.string().datetime("Invalid due date format").optional(),
  status: z
    .enum(["pending", "paid", "overdue", "cancelled"])
    .default("pending"),
  paymentMethod: z
    .enum(["cash", "credit_card", "debit_card", "bank_transfer", "insurance"])
    .optional(),
  insuranceClaim: z
    .object({
      claimNumber: z
        .string()
        .max(
          MAX_CLAIM_NUMBER_LENGTH,
          `Claim number must not exceed ${MAX_CLAIM_NUMBER_LENGTH} characters`,
        ),
      insuranceProvider: z
        .string()
        .max(
          MAX_NAME_LENGTH,
          `Insurance provider must not exceed ${MAX_NAME_LENGTH} characters`,
        ),
      authorizationCode: z
        .string()
        .max(
          MAX_AUTHORIZATION_CODE_LENGTH,
          `Authorization code must not exceed ${MAX_AUTHORIZATION_CODE_LENGTH} characters`,
        )
        .optional(),
      copayAmount: z
        .number()
        .min(MIN_AMOUNT, `Copay amount must be at least ${MIN_AMOUNT}`)
        .optional(),
    })
    .optional(),
});

// Notification preferences schema
export const notificationPreferencesSchema = z.object({
  email: z.object({
    enabled: z.boolean().default(true),
    appointmentReminders: z.boolean().default(true),
    appointmentConfirmations: z.boolean().default(true),
    labResults: z.boolean().default(true),
    billing: z.boolean().default(true),
    marketing: z.boolean().default(false),
  }),
  sms: z.object({
    enabled: z.boolean().default(false),
    appointmentReminders: z.boolean().default(false),
    appointmentConfirmations: z.boolean().default(false),
    emergencyAlerts: z.boolean().default(false),
  }),
  push: z.object({
    enabled: z.boolean().default(true),
    appointmentReminders: z.boolean().default(true),
    messages: z.boolean().default(true),
    systemUpdates: z.boolean().default(false),
  }),
  frequency: z.object({
    reminderHours: z
      .array(z.number().min(MIN_REMINDER_HOURS).max(MAX_REMINDER_HOURS))
      .default([24, 2]),
    digestFrequency: z
      .enum(["immediate", "daily", "weekly", "never"])
      .default("daily"),
  }),
});

// ========================================
// VALIDATION MIDDLEWARE FUNCTIONS
// ========================================

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: z.ZodError;
}

export function validateInput<T>(
  schema: z.ZodSchema<T>,
  input: unknown,
): ValidationResult<T> {
  try {
    const validatedData = schema.parse(input);
    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", "),
        errors: error,
      };
    }
    return {
      success: false,
      error: "Validation failed",
    };
  }
}
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>,
): Promise<{ data?: T; error?: NextResponse; }> {
  try {
    const body = await request.json();
    const validation = validateInput(schema, body);

    if (!validation.success) {
      return {
        error: NextResponse.json(
          {
            success: false,
            error: "Validation failed",
            details: validation.error,
          },
          { status: 400 },
        ),
      };
    }

    return { data: validation.data };
  } catch {
    return {
      error: NextResponse.json(
        {
          success: false,
          error: "Invalid JSON format",
        },
        { status: 400 },
      ),
    };
  }
}

export function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>,
): ValidationResult<T> {
  const params: Record<string, unknown> = {};

  for (const [key, value] of searchParams.entries()) {
    // Try to parse numbers
    if (/^\d+$/.test(value)) {
      params[key] = Number.parseInt(value, 10);
    } // Try to parse booleans
    else if (value === "true" || value === "false") {
      params[key] = value === "true";
    } // Keep as string
    else {
      params[key] = value;
    }
  }

  return validateInput(schema, params);
}

// Security-focused validation helpers
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replaceAll(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
    .replaceAll(/javascript:/gi, "") // Remove javascript: protocol
    .replaceAll(/on\w+\s*=/gi, ""); // Remove event handlers
};

export const validateUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const validateTenantAccess = (
  tenantId: string,
  userTenantIds: string[],
): boolean => {
  return userTenantIds.includes(tenantId);
};

// Rate limiting validation
export const rateLimitSchema = z.object({
  windowMs: z.number().min(MIN_WINDOW_MS).max(MAX_WINDOW_MS), // 1 second to 1 hour
  maxRequests: z.number().min(MIN_MAX_REQUESTS).max(MAX_MAX_REQUESTS),
  skipSuccessfulRequests: z.boolean().default(false),
  skipFailedRequests: z.boolean().default(false),
});

// Health check schema
export const healthCheckSchema = z.object({
  timestamp: z.string().datetime(),
  version: z.string().min(MIN_VERSION_LENGTH).max(MAX_VERSION_LENGTH),
  environment: z.enum(["development", "staging", "production"]),
  database: z.object({
    connected: z.boolean(),
    responseTime: z.number().min(MIN_RESPONSE_TIME),
  }),
  cache: z
    .object({
      connected: z.boolean(),
      responseTime: z.number().min(MIN_RESPONSE_TIME),
    })
    .optional(),
  externalServices: z
    .array(
      z.object({
        name: z.string().max(MAX_SERVICE_NAME_LENGTH),
        status: z.enum(["healthy", "degraded", "unhealthy"]),
        responseTime: z.number().min(MIN_RESPONSE_TIME),
      }),
    )
    .optional(),
});

// Export all validation constants for use in other modules
export {
  ALLOWED_FILE_EXTENSIONS,
  CURRENCY_CODE_LENGTH,
  DEFAULT_PAGE_SIZE,
  MAX_ACTION_LENGTH,
  MAX_AGE,
  MAX_AMOUNT,
  MAX_APPOINTMENT_DURATION_MINUTES,
  MAX_APPOINTMENT_TYPE_LENGTH,
  MAX_AUDIT_DESCRIPTION_LENGTH,
  MAX_AUTHORIZATION_CODE_LENGTH,
  MAX_BIO_LENGTH,
  MAX_CITY_LENGTH,
  MAX_CLAIM_NUMBER_LENGTH,
  MAX_COMPLIANCE_REQUIREMENT_LENGTH,
  MAX_COUNTRY_LENGTH,
  MAX_CREDENTIAL_LENGTH,
  MAX_DIAGNOSIS_LENGTH,
  MAX_DIASTOLIC_BP,
  // Additional System Limits
  MAX_DOSAGE_LENGTH,
  MAX_DURATION_LENGTH,
  MAX_EMAIL_LENGTH,
  MAX_FILE_NAME_LENGTH,
  // File and Upload Limits
  MAX_FILE_SIZE_MB,
  MAX_FREQUENCY_LENGTH,
  MAX_HEART_RATE,
  MAX_HEIGHT_CM,
  MAX_INSTRUCTIONS_LENGTH,
  MAX_INSURANCE_POLICY_LENGTH,
  MAX_INVOICE_NUMBER_LENGTH,
  MAX_LANGUAGE_LENGTH,
  MAX_LICENSE_LENGTH,
  MAX_MAX_REQUESTS,
  MAX_MEDICATION_LENGTH,
  // Communication Limits
  MAX_MESSAGE_LENGTH,
  // Name and Personal Information Limits
  MAX_NAME_LENGTH,
  MAX_NOTES_LENGTH,
  // Pagination and Query Limits
  MAX_PAGE_SIZE,
  MAX_PASSWORD_LENGTH,
  MAX_PHONE_LENGTH,
  MAX_POSTAL_CODE_LENGTH,
  MAX_PROFILE_IMAGE_URL_LENGTH,
  MAX_REASON_LENGTH,
  MAX_RELATIONSHIP_LENGTH,
  MAX_REMINDER_HOURS,
  MAX_RESOURCE_TYPE_LENGTH,
  // Data Retention and Audit Limits
  MAX_RETENTION_PERIOD_DAYS,
  MAX_SEARCH_QUERY_LENGTH,
  MAX_SERVICE_NAME_LENGTH,
  MAX_SPECIALIZATION_LENGTH,
  MAX_STATE_LENGTH,
  MAX_STREET_LENGTH,
  MAX_SUBJECT_LENGTH,
  // Healthcare-specific Limits
  MAX_SYMPTOMS_LENGTH,
  MAX_SYSTOLIC_BP,
  MAX_TEMPERATURE,
  MAX_TIMEZONE_LENGTH,
  MAX_TREATMENT_LENGTH,
  MAX_USER_AGENT_LENGTH,
  MAX_VERSION_LENGTH,
  MAX_WEIGHT_KG,
  MAX_WINDOW_MS,
  MAX_YEARS_EXPERIENCE,
  // Communication and Notification Limits
  MIN_ACTION_LENGTH,
  MIN_AGE,
  // Billing and Financial Limits
  MIN_AMOUNT,
  // Appointment and Scheduling Limits
  MIN_APPOINTMENT_DURATION_MINUTES,
  MIN_APPOINTMENT_TYPE_LENGTH,
  MIN_CITY_LENGTH,
  MIN_COUNTRY_LENGTH,
  MIN_DIASTOLIC_BP,
  MIN_HEART_RATE,
  MIN_HEIGHT_CM,
  MIN_LICENSE_LENGTH,
  MIN_MAX_REQUESTS,
  MIN_NAME_LENGTH,
  // Password and Security Limits
  MIN_PASSWORD_LENGTH,
  // Phone Number Validation
  MIN_PHONE_LENGTH,
  MIN_POSTAL_CODE_LENGTH,
  MIN_RELATIONSHIP_LENGTH,
  MIN_REMINDER_HOURS,
  MIN_RESOURCE_TYPE_LENGTH,
  MIN_RESPONSE_TIME,
  MIN_RETENTION_DAYS,
  MIN_SPECIALIZATION_LENGTH,
  MIN_STATE_LENGTH,
  // Address Validation Limits
  MIN_STREET_LENGTH,
  // Vital Signs Limits
  MIN_SYSTOLIC_BP,
  MIN_TEMPERATURE,
  MIN_VERSION_LENGTH,
  MIN_WEIGHT_KG,
  // Rate Limiting and Health Check Limits
  MIN_WINDOW_MS,
  // Professional and System Limits
  MIN_YEARS_EXPERIENCE,
  PASSWORD_COMPLEXITY_REGEX,
};
