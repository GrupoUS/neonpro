/**
 * Shared Services Module
 * Provides centralized access to all services used across the application
 */

import { AIChatService } from './ai-chat-service';
import { ComprehensiveAuditService } from './audit-service';
import { LGPDService } from './lgpd-service';
import { PatientService } from './patient-service';

// Service interface for type safety
export interface ServiceInterface {
  aiChatService: AIChatService;
  auditService: ComprehensiveAuditService;
  lgpdService: LGPDService;
  patientService: PatientService;
}

// Services instance - will be injected during testing or use real services in production
let services: ServiceInterface | null = null;

// Function to set services (used by tests)
export const setServices = (injectedServices: ServiceInterface) => {
  services = injectedServices;
};

// Default services for production
export const getServices = (): ServiceInterface => {
  if (services) return services;

  // Use real service instances in production
  return {
    aiChatService: new AIChatService(),
    auditService: new ComprehensiveAuditService(),
    lgpdService: new LGPDService(),
    patientService: new PatientService(),
  };
};

// Export individual services for direct access if needed
export { AIChatService, ComprehensiveAuditService, LGPDService, PatientService };