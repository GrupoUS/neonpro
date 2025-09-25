// Domain Module Exports

// Value Objects
export type { ConsentStatus as LGPDConsentStatus } from './value-objects/lgpd.js'
export type { DataSubjectRequest as LGPDDataSubjectRequest } from './value-objects/lgpd.js'
export * from './value-objects/gender.js'
export * from './value-objects/address.js'
export * from './value-objects/healthcare.js'

// Domain Entities
export type { ConsentStatus as EntityConsentStatus } from './entities/consent.js'
export * from './entities/patient.js'
export {
  AppointmentStatus,
  AppointmentPriority,
  AppointmentType
} from './entities/appointment.js'

// Repository Interfaces
export * from './repositories/index.js'

// Domain Services
// Services directory is empty - exports removed

// Domain Errors
export * from './errors/index.js'

// Domain Events
export * from './events/index.js'