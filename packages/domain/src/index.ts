// Value Objects
export * from "./value-objects/gender";
export * from "./value-objects/address";
export * from "./value-objects/contact";
export * from "./value-objects/healthcare";
export * from "./value-objects/lgpd";

// Domain Entities
export * from "./entities/patient";
export * from "./entities/appointment";
export * from "./entities/consent";

// Repository Interfaces
export * from "./repositories/patient-repository";
export * from "./repositories/appointment-repository";
export * from "./repositories/consent-repository";

// Domain Services
export * from "./services/consent-service";

// Domain Errors
export * from "./errors/domain-errors";

// Domain Events
export * from "./events/domain-events";
