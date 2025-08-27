// Analytics Services - Phase 3.5: AI-Powered Healthcare Analytics & Predictive Intelligence
// Centralized export for all analytics services and utilities

// Core Analytics Services
export { aiAnalyticsService, default as AIAnalyticsService } from "./ai-analytics-service";
export {
  brazilianHealthcareIntelligenceService,
  default as BrazilianHealthcareIntelligenceService,
} from "./brazilian-healthcare-intelligence-service";
export {
  default as PredictivePatientService,
  predictivePatientService,
} from "./predictive-patient-service";
export {
  default as RealTimeMonitoringService,
  realTimeMonitoringService,
} from "./real-time-monitoring-service";

// Service Types
export type {
  AIAnalyticsService,
  BrazilianHealthcareIntelligenceService,
  PredictivePatientService,
  RealTimeMonitoringService,
} from "@/types/analytics";

// Re-export all analytics types for convenience
export * from "@/types/analytics";

// Utility functions for service orchestration
export const createAnalyticsOrchestrator = (clinicId: string) => {
  return {
    // Get comprehensive dashboard
    async getDashboard(type: "overview" | "detailed" | "executive" | "operational" = "overview") {
      return await aiAnalyticsService.getDashboardData(clinicId, type);
    },

    // Get patient intelligence
    async getPatientIntelligence(patientId: string) {
      return await predictivePatientService.generatePatientIntelligence(patientId, clinicId);
    },

    // Start real-time monitoring
    async startMonitoring() {
      return await realTimeMonitoringService.startMonitoring(clinicId);
    },

    // Get market intelligence
    async getMarketIntelligence(region: string) {
      return await brazilianHealthcareIntelligenceService.getHealthcareIntelligence(
        clinicId,
        region,
      );
    },

    // Stop all services
    stopAll() {
      realTimeMonitoringService.stopMonitoring();
      brazilianHealthcareIntelligenceService.stopAutoUpdates();
    },

    // Cleanup all resources
    destroy() {
      aiAnalyticsService.destroy();
      realTimeMonitoringService.destroy();
      brazilianHealthcareIntelligenceService.destroy();
    },
  };
};

// Export orchestrator type
export type AnalyticsOrchestrator = ReturnType<typeof createAnalyticsOrchestrator>;
