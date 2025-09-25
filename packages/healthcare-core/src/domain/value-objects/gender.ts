/**
 * Gender enum following Brazilian healthcare standards
 */
export enum Gender {
  MALE = 'M',
  FEMALE = 'F',
  OTHER = 'O',
  NOT_INFORMED = 'N',
}

/**
 * Patient status enum
 */
export enum PatientStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  DECEASED = 'deceased',
}

/**
 * LGPD legal basis enum
 */
export enum LegalBasis {
  CONSENT = 'consent',
  CONTRACT = 'contract',
  LEGAL_OBLIGATION = 'legal_obligation',
  VITAL_INTERESTS = 'vital_interests',
  PUBLIC_TASK = 'public_task',
  LEGITIMATE_INTERESTS = 'legitimate_interests',
}

/**
 * Blood type enum
 */
export enum BloodType {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Contact method preferences
 */
export enum ContactMethod {
  PHONE = 'phone',
  EMAIL = 'email',
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
  MAIL = 'mail',
}