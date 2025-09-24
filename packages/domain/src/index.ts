// Value Objects
export * from './value-objects/address'
export * from './value-objects/contact'
export * from './value-objects/gender'
export * from './value-objects/healthcare'
export type {
  AuditLogEntry as LGPDAuditLogEntry,
  AuditTrail,
  LGPDConsent,
} from './value-objects/lgpd'
export { anonymizePatientData } from './value-objects/lgpd'

// Domain Entities
export * from './entities/appointment'
export * from './entities/consent'
export * from './entities/patient'

// Repository Interfaces
export * from './repositories/appointment-repository'
export type {
  ComplianceReport as ConsentComplianceReport,
  ConsentFilters,
  ConsentQueryRepository,
  ConsentRepository,
  ConsentStatistics,
} from './repositories/consent-repository'
export * from './repositories/patient-repository'

// Domain Services
export * from './services/audit-service'
export * from './services/consent-service'
export * from './services/medical-license-service'

// Domain Errors
export * from './errors/domain-errors'

// Domain Events
export * from './events/domain-events'
