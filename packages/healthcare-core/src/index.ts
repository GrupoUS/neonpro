/**
 * @package Healthcare core services
 *
 * Healthcare business logic and workflows for NeonPro platform
 */

// Export domain value objects
export * from './value-objects';

// Export domain entities
export * from './entities';

// Export domain services
export * from './services';

// Export domain repositories
export * from './repositories';

// Export domain errors
export * from './errors';

// Export domain events
export * from './events';

// Export business workflows and processes
export * from './workflows';

// Export healthcare utilities
export * from './utils';

// Version info
export const HEALTHCARE_CORE_PACKAGE_VERSION = '1.0.0';