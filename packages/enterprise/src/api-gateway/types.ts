/**
 * Healthcare API Gateway Types
 * Type definitions for healthcare microservices gateway
 */

export interface AuthContext {
  clinicId: string;
  userId: string;
  userType: string;
}

export interface MicroserviceRoute {
  service: string;
  endpoint: string;
  circuitBreakerKey: string;
  healthcareContext: string;
  complianceLevel: string;
}

export interface HealthcareMetadata {
  clinicId: string;
  complianceLevel: string;
  processingTime: number;
}

export interface ErrorLogData {
  data: unknown;
  level: string;
  service: string;
  timestamp: string;
}
