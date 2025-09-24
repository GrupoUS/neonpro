// Simplified data protection constants for aesthetic clinics
// Focus on basic client data protection, not medical compliance

export const AESTHETIC_PURPOSES = {
  // Basic purposes for aesthetic clinic operations
  CONSULTATION: 'consultation',
  TREATMENT: 'treatment',
  APPOINTMENT_SCHEDULING: 'appointment_scheduling',
  BILLING_AND_PAYMENT: 'billing_and_payment',
  COMMUNICATION: 'communication',
  MARKETING: 'marketing',
} as const

export const CLIENT_DATA_CATEGORIES = {
  // Basic client data categories
  BASIC_INFO: 'basic_info', // Name, age, etc
  CONTACT_INFO: 'contact_info', // Phone, email, address
  TREATMENT_INFO: 'treatment_info', // Treatment history, preferences
  BILLING_INFO: 'billing_info', // Payment data
  PHOTOS: 'photos', // Before/after photos
  PREFERENCES: 'preferences', // Communication preferences
} as const

export type AestheticPurpose = (typeof AESTHETIC_PURPOSES)[keyof typeof AESTHETIC_PURPOSES]
export type ClientDataCategory =
  (typeof CLIENT_DATA_CATEGORIES)[keyof typeof CLIENT_DATA_CATEGORIES]
