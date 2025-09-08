// Constants for compliance automation
export const COMPLIANCE_STANDARDS = {
  MINIMUM_SCORE: 9.9,
  CONSTITUTIONAL_THRESHOLD: 9.9,
} as const

export const MAGIC_NUMBERS = {
  HUNDRED: 100,
  NEGATIVE_ONE: -1,
  ONE: 1,
  TWO: 2,
  ZERO: 0,
  TWENTY_FOUR_HOURS: 24,
  SIXTY_MINUTES: 60,
  SIXTY_SECONDS: 60,
  MILLISECONDS_IN_SECOND: 1000,
  THIRTY_DAYS: 30,
  HTTP_INTERNAL_ERROR: 500,
  HTTP_UNAUTHORIZED: 401,
} as const

export const COMPLIANCE_AREAS = ['lgpd', 'anvisa', 'cfm', 'all',] as const

export const AUTOMATION_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ERROR: 'error',
} as const
