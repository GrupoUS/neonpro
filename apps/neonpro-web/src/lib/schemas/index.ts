// Central export file for all medical schemas

// Medical schemas
export * from "./medical";
export * from "./patient";
export * from "./appointment";

// Re-export commonly used schemas with descriptive names
export {
  patientSchema as CreatePatientSchema,
  updatePatientSchema as UpdatePatientSchema,
  appointmentSchema as CreateAppointmentSchema,
  updateAppointmentSchema as UpdateAppointmentSchema,
  treatmentSchema as TreatmentSchema,
  financialDataSchema as FinancialDataSchema,
  consentSchema as LGPDConsentSchema,
  medicalAuditSchema as AuditLogSchema,
} from "./medical";

export {
  patientFiltersSchema as PatientListFiltersSchema,
  patientSearchSchema as PatientSearchSchema,
  appointmentFiltersSchema as AppointmentListFiltersSchema,
  availableTimesSchema as AvailableTimesSearchSchema,
} from "./patient";

// Utility function to validate data against any schema
export function validateData<T>(
  schema: any,
  data: unknown,
): { success: boolean; data?: T; errors?: string[] } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error: any) {
    const errors = error.errors?.map((err: any) => `${err.path.join(".")}: ${err.message}`) || [
      "Validation failed",
    ];
    return { success: false, errors };
  }
}

// Utility function for safe parsing with default values
export function safeParseWithDefaults<T>(schema: any, data: unknown, defaults: Partial<T> = {}): T {
  const result = schema.safeParse({ ...defaults, ...data });
  if (result.success) {
    return result.data;
  } else {
    console.warn("Schema validation failed, using defaults:", result.error.errors);
    return { ...defaults, ...data } as T;
  }
}

// Common validation patterns
export const commonPatterns = {
  // Brazilian CPF validation
  cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/,

  // Brazilian phone validation
  phone: /^\(\d{2}\)\s\d{4,5}-\d{4}$|^\d{10,11}$/,

  // Brazilian CEP validation
  zipCode: /^\d{5}-?\d{3}$/,

  // Time validation (HH:MM)
  time: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,

  // Brazilian state codes
  brazilianStates: [
    "AC",
    "AL",
    "AP",
    "AM",
    "BA",
    "CE",
    "DF",
    "ES",
    "GO",
    "MA",
    "MT",
    "MS",
    "MG",
    "PA",
    "PB",
    "PR",
    "PE",
    "PI",
    "RJ",
    "RN",
    "RS",
    "RO",
    "RR",
    "SC",
    "SP",
    "SE",
    "TO",
  ],
};

// Healthcare-specific validation helpers
export const healthcareValidators = {
  // Validate if patient is adult (18+)
  isAdult: (birthDate: string | Date): boolean => {
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1 >= 18;
    }
    return age >= 18;
  },

  // Validate appointment time is in business hours
  isBusinessHours: (time: string): boolean => {
    const [hours, minutes] = time.split(":").map(Number);
    const timeInMinutes = hours * 60 + minutes;
    const startTime = 8 * 60; // 08:00
    const endTime = 18 * 60; // 18:00

    return timeInMinutes >= startTime && timeInMinutes <= endTime;
  },

  // Validate appointment is not in the past
  isFutureDate: (date: string | Date): boolean => {
    const appointmentDate = new Date(date);
    const now = new Date();
    return appointmentDate > now;
  },

  // Validate treatment duration is reasonable
  isValidTreatmentDuration: (duration: number): boolean => {
    return duration >= 15 && duration <= 480; // 15 minutes to 8 hours
  },
};

// LGPD compliance helpers
export const lgpdHelpers = {
  // Generate consent record
  generateConsentRecord: (patientId: string, consentTypes: string[]) => ({
    patientId,
    consentTypes,
    consentDate: new Date(),
    ipAddress: "", // Should be filled by the calling code
    userAgent: "", // Should be filled by the calling code
    version: "1.0",
  }),

  // Check if consent is still valid
  isConsentValid: (consentDate: Date, validityPeriod: number = 365): boolean => {
    const daysSinceConsent = (Date.now() - consentDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceConsent <= validityPeriod;
  },

  // Generate audit log entry
  generateAuditLog: (userId: string, action: string, resourceType: string, resourceId: string) => ({
    userId,
    action,
    resourceType,
    resourceId,
    timestamp: new Date(),
    ipAddress: "", // Should be filled by the calling code
    userAgent: "", // Should be filled by the calling code
  }),
};
