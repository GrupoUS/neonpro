// NeonPro AI Package - Main Export
// AI-First Healthcare Platform - Enhanced Service Layer

// Core Services
export {
	AIServiceFactory,
	AIServiceHealthChecker,
	EnhancedAIService,
	NoShowPredictionService,
	UniversalChatService,
} from "./services";

// Types and Interfaces
export type {
	// Core service types
	AIServiceConfig,
	// Configuration
	AIServiceConfiguration,
	// Error types
	AIServiceError,
	// API types
	APIResponse,
	// Prediction types
	AppointmentData,
	AppointmentStatus,
	// Service interfaces
	CacheService,
	// Chat types
	ChatMessage,
	ChatResponse,
	ChatSession,
	ClinicType,
	ComplianceError,
	ComplianceEvent,
	ComplianceLevel,
	ComplianceMetrics,
	ConsentRecord,
	ContactInfo,
	DatabaseService,
	FeatureFlag,
	HealthcareChatContext,
	Language,
	LoggerService,
	LogLevel,
	MedicalInfo,
	MetricsService,
	PaginatedResponse,
	PatientBehaviorData,
	PatientPreferences,
	// Patient types
	PatientProfile,
	PersonalInfo,
	PredictionAccuracy,
	PredictionResult,
	PreventionRecommendations,
	RiskFactors,
	ServiceMetrics,
	// Utility types
	ServiceStatus,
	UserRole,
	ValidationError,
} from "./types";
export { decryptSensitiveData, encryptSensitiveData } from "./utils/encryption";
export { formatBrazilianData } from "./utils/formatting";
// Utilities
export { validateHealthcareData } from "./utils/validation";

// Constants
export const AI_SERVICE_VERSION = "2.1.0";
export const SUPPORTED_LANGUAGES = ["pt-BR", "en"] as const;
export const COMPLIANCE_STANDARDS = ["lgpd", "anvisa", "cfm"] as const;

// Default configurations
export const DEFAULT_AI_CONFIG: Partial<AIServiceConfiguration> = {
	openai: {
		model: "gpt-4-turbo-preview",
		maxTokens: 1000,
		temperature: 0.7,
	},
	monitoring: {
		enabled: true,
		logLevel: "info",
	},
	compliance: {
		lgpd: {
			enabled: true,
			dataRetentionDays: 1095, // 3 years
			auditLogLevel: "detailed",
		},
		anvisa: {
			enabled: true,
		},
		cfm: {
			enabled: true,
			ethicsValidation: true,
		},
	},
	featureFlags: {
		enabled: true,
		refreshIntervalMs: 300_000, // 5 minutes
	},
};

// Service initialization helper
export async function initializeAIServices(config: AIServiceConfiguration) {
	try {
		// Initialize services with configuration
		const chatService = AIServiceFactory.getChatService();
		const predictionService = AIServiceFactory.getPredictionService();

		// Verify all services are healthy
		const healthChecks = await AIServiceHealthChecker.checkAllServices();
		const unhealthyServices = healthChecks.filter((check) => check.status !== "healthy");

		if (unhealthyServices.length > 0) {
			throw new Error(`Unhealthy services detected: ${unhealthyServices.map((s) => s.service).join(", ")}`);
		}

		return {
			success: true,
			services: {
				chat: chatService,
				prediction: predictionService,
			},
			healthChecks,
			version: AI_SERVICE_VERSION,
		};
	} catch (error) {
		return {
			success: false,
			error: error.message,
			version: AI_SERVICE_VERSION,
		};
	}
}

// Package metadata
export const packageInfo = {
	name: "@neonpro/ai",
	version: AI_SERVICE_VERSION,
	description: "AI-First Healthcare Platform - Enhanced Service Layer for NeonPro",
	author: "NeonPro Development Team",
	license: "Proprietary",
	features: [
		"Universal AI Chat System with Portuguese healthcare optimization",
		"ML-powered No-Show Prediction with Brazilian behavioral patterns",
		"Enhanced Service Base Class with compliance automation",
		"LGPD/ANVISA/CFM regulatory compliance automation",
		"Multi-layer caching with Redis integration",
		"Comprehensive audit trail and monitoring",
		"Feature flag infrastructure",
		"Healthcare-specific data validation and encryption",
	],
	compliance: COMPLIANCE_STANDARDS,
	languages: SUPPORTED_LANGUAGES,
} as const;
