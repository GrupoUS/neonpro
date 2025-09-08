// Dashboard constants to avoid magic numbers
export const DASHBOARD_CONSTANTS = {
  // Array sizes and pagination
  SKELETON_ITEMS_PATIENTS: 5,
  SKELETON_ITEMS_APPOINTMENTS: 3,
  RECENT_PATIENTS_LIMIT: 5,
  TODAYS_APPOINTMENTS_LIMIT: 3,

  // Growth thresholds
  GROWTH_THRESHOLD: 0,

  // Decimal places
  PERCENTAGE_DECIMAL_PLACES: 1,

  // String positions
  FIRST_CHAR_INDEX: 0,

  // Array generation ranges
  PATIENT_SKELETON_RANGE: [1, 2, 3, 4, 5,] as const,
  APPOINTMENT_SKELETON_RANGE: [1, 2, 3,] as const,
} as const

// Type-safe array ranges for skeleton loading
export const PATIENT_SKELETON_INDEXES = Array.from(
  { length: DASHBOARD_CONSTANTS.SKELETON_ITEMS_PATIENTS, },
  (_, index,) => index + 1,
)

export const APPOINTMENT_SKELETON_INDEXES = Array.from(
  { length: DASHBOARD_CONSTANTS.SKELETON_ITEMS_APPOINTMENTS, },
  (_, index,) => index + 1,
)
