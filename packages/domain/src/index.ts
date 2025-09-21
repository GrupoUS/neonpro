// Value Objects
export * from './value-objects/gender.js';
export * from './value-objects/address.js';
export * from './value-objects/contact.js';
export * from './value-objects/healthcare.js';
export * from './value-objects/lgpd.js';

// Domain Entities
export * from './entities/patient.js';
export * from './entities/appointment.js';
export * from './entities/consent.js';

// Repository Interfaces
export * from './repositories/patient-repository.js';
export * from './repositories/appointment-repository.js';
export * from './repositories/consent-repository.js';

// Domain Services
export * from './services/consent-service.js';

// Domain Errors
export * from './errors/domain-errors.js';

// Domain Events
export * from './events/domain-events.js';