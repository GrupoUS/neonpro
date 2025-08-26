/**
 * NeonPro Healthcare Real-time System
 * Sistema completo de real-time updates com Supabase
 * Integração com TanStack Query e notifications sistema
 */

export type { HealthcareRealtimeConfig } from "./config";
// Configuration
export {
	COMPLIANCE_EVENT_TYPES,
	getEnvironmentConfig,
	getRealtimeConfig,
	HEALTHCARE_PRIORITIES,
	HEALTHCARE_REALTIME_CONFIG,
} from "./config";
export type {
	ChannelSubscription,
	ConnectionConfig,
	ConnectionStatus,
} from "./connection-manager";
// Connection Management
export {
	DEFAULT_CONFIG,
	destroyRealtimeManager,
	getRealtimeManager,
	SupabaseRealtimeManager,
} from "./connection-manager";
export type {
	RealtimeAppointmentPayload,
	UseRealtimeAppointmentsOptions,
	UseRealtimeAppointmentsReturn,
} from "./hooks/use-realtime-appointments";
export {
	useOptimisticAppointments,
	useRealtimeAppointments,
} from "./hooks/use-realtime-appointments";
export type {
	ComplianceEventType,
	RealtimeCompliancePayload,
	UseRealtimeComplianceOptions,
	UseRealtimeComplianceReturn,
} from "./hooks/use-realtime-compliance";
export { useRealtimeCompliance } from "./hooks/use-realtime-compliance";
export type {
	NotificationPriority,
	RealtimeNotificationPayload,
	UseRealtimeNotificationsOptions,
	UseRealtimeNotificationsReturn,
} from "./hooks/use-realtime-notifications";
export { useRealtimeNotifications } from "./hooks/use-realtime-notifications";
export type {
	RealtimePatientPayload,
	UseRealtimePatientsOptions,
	UseRealtimePatientsReturn,
} from "./hooks/use-realtime-patients";
// Enhanced React Hooks
export {
	useOptimisticPatients,
	useRealtimePatients,
} from "./hooks/use-realtime-patients";
// React Provider
export {
	RealtimeProvider,
	useHealthcareReady,
	useRealtimeContext,
	useRealtimeStatus,
} from "./providers/realtime-provider";

// Utility functions for healthcare real-time
export const RealtimeUtils = {
	/**
	 * Check if connection is healthy for healthcare operations
	 */
	isHealthcareReady: (connectionHealth: number): boolean => {
		return connectionHealth >= 80; // Healthcare requires high reliability
	},

	/**
	 * Determine if event requires immediate medical attention
	 */
	isMedicalUrgent: (eventType: string, priority?: string): boolean => {
		const urgentKeywords = [
			"emergency",
			"critical",
			"urgent",
			"breach",
			"violation",
		];
		return urgentKeywords.some(
			(keyword) =>
				eventType.toLowerCase().includes(keyword) ||
				priority?.toLowerCase().includes(keyword),
		);
	},

	/**
	 * Format healthcare notification message
	 */
	formatHealthcareMessage: (type: string, data: any): string => {
		const formatMap: Record<string, (data: any) => string> = {
			patient_update: (data) =>
				`Paciente ${data.name || data.id} foi atualizado`,
			appointment_change: (data) =>
				`Agendamento ${data.id} foi ${data.status === "cancelled" ? "cancelado" : "alterado"}`,
			emergency_alert: (data) => `EMERGÊNCIA: ${data.message}`,
			compliance_violation: (data) => `Violação de compliance: ${data.type}`,
			lgpd_event: (data) => `Evento LGPD: ${data.action} - ${data.description}`,
			anvisa_alert: (data) =>
				`Alerta ANVISA: ${data.category} - ${data.message}`,
		};

		return formatMap[type]?.(data) || `Evento: ${type}`;
	},

	/**
	 * Calculate healthcare priority score
	 */
	calculateHealthcarePriority: (
		eventType: string,
		severity: string,
		patientCritical = false,
	): number => {
		let score = 0;

		// Base score by severity
		switch (severity.toUpperCase()) {
			case "CRITICAL":
				score = 100;
				break;
			case "HIGH":
				score = 75;
				break;
			case "MEDIUM":
				score = 50;
				break;
			case "LOW":
				score = 25;
				break;
			default:
				score = 10;
		}

		// Boost for patient-critical events
		if (patientCritical) {
			score += 20;
		}

		// Boost for specific event types
		if (eventType.includes("emergency")) {
			score += 30;
		}
		if (eventType.includes("breach")) {
			score += 25;
		}
		if (eventType.includes("anvisa")) {
			score += 15;
		}

		return Math.min(100, score);
	},
};
