// Constants for NeonPro Aesthetic Clinic SaaS

// Appointment durations (in minutes)
export const APPOINTMENT_DURATIONS = {
  CONSULTATION: 30,
  BOTOX: 45,
  DERMAL_FILLER: 60,
  LASER_HAIR_REMOVAL: 60,
  CHEMICAL_PEEL: 45,
  MICRONEEDLING: 90,
  HYDRAFACIAL: 75,
  LASER_RESURFACING: 120,
  BODY_CONTOURING: 90,
} as const

// Business hours
export const BUSINESS_HOURS = {
  MONDAY: { start: '09:00', end: '18:00', },
  TUESDAY: { start: '09:00', end: '18:00', },
  WEDNESDAY: { start: '09:00', end: '18:00', },
  THURSDAY: { start: '09:00', end: '18:00', },
  FRIDAY: { start: '09:00', end: '18:00', },
  SATURDAY: { start: '09:00', end: '16:00', },
  SUNDAY: { start: '10:00', end: '14:00', },
} as const

// Reminder timing (in hours before appointment)
export const REMINDER_TIMING = {
  FIRST_REMINDER: 24,
  SECOND_REMINDER: 2,
  FOLLOW_UP: 24, // hours after treatment
} as const

// Inventory thresholds
export const INVENTORY_THRESHOLDS = {
  LOW_STOCK_PERCENTAGE: 20,
  CRITICAL_STOCK_PERCENTAGE: 10,
  EXPIRY_WARNING_DAYS: 30,
} as const

// Billing constants
export const BILLING_CONSTANTS = {
  PAYMENT_DUE_DAYS: 30,
  LATE_FEE_PERCENTAGE: 5,
  DISCOUNT_MAX_PERCENTAGE: 20,
} as const

// Treatment areas for aesthetic procedures
export const TREATMENT_AREAS = {
  FACE: [
    'forehead',
    'glabella',
    'crow_feet',
    'cheeks',
    'lips',
    'chin',
    'jawline',
  ],
  BODY: ['arms', 'legs', 'bikini', 'underarms', 'back', 'chest', 'abdomen',],
  SKIN: ['acne_scars', 'pigmentation', 'wrinkles', 'sun_damage', 'texture',],
} as const
