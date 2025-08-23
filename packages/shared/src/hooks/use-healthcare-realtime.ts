/**
 * 🏥 Healthcare Real-time Hooks - NeonPro Healthcare
 * ==================================================
 *
 * Specialized React hooks for healthcare real-time subscriptions
 * with LGPD compliance and TanStack Query integration
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { useCallback } from "react";
import type { UseRealtimeQueryConfig } from "../types/realtime.types";
import { useRealtimeQuery } from "./use-realtime";

/**
 * Healthcare-specific patient real-time hook
 */
export function usePatientRealtime(
	supabaseClient: SupabaseClient,
	options: {
		patientId?: string;
		clinicId?: string;
		enabled?: boolean;
		onPatientUpdate?: (patient: any) => void;
	},
) {
	const filter = options.patientId
		? `id=eq.${options.patientId}`
		: options.clinicId
			? `clinic_id=eq.${options.clinicId}`
			: "";

	const config: UseRealtimeQueryConfig = {
		table: "patients",
		...(filter && { filter }),
		queryKey: ["patients", options.patientId, options.clinicId].filter(
			Boolean,
		) as string[],
		enabled: options.enabled ?? true,
		lgpdCompliance: true,
		auditLogging: true,
		...(options.onPatientUpdate && { onUpdate: options.onPatientUpdate }),
		queryOptions: {
			invalidateOnInsert: true,
			invalidateOnUpdate: true,
			invalidateOnDelete: true,
			backgroundRefetch: true,
		},
	};

	return useRealtimeQuery(supabaseClient, config);
}

/**
 * Healthcare-specific appointment real-time hook
 */
export function useAppointmentRealtime(
	supabaseClient: SupabaseClient,
	options: {
		appointmentId?: string;
		patientId?: string;
		professionalId?: string;
		clinicId?: string;
		dateRange?: { start: string; end: string };
		enabled?: boolean;
		onAppointmentUpdate?: (appointment: any) => void;
	},
) {
	const buildFilter = useCallback(() => {
		const filters = [];

		if (options.appointmentId) {
			filters.push(`id=eq.${options.appointmentId}`);
		}
		if (options.patientId) {
			filters.push(`patient_id=eq.${options.patientId}`);
		}
		if (options.professionalId) {
			filters.push(`professional_id=eq.${options.professionalId}`);
		}
		if (options.clinicId) {
			filters.push(`clinic_id=eq.${options.clinicId}`);
		}
		if (options.dateRange) {
			filters.push(`scheduled_at=gte.${options.dateRange.start}`);
			filters.push(`scheduled_at=lte.${options.dateRange.end}`);
		}

		return filters.join(",");
	}, [options]);

	const config: UseRealtimeQueryConfig = {
		table: "appointments",
		filter: buildFilter(),
		queryKey: [
			"appointments",
			options.appointmentId,
			options.patientId,
			options.professionalId,
		].filter(Boolean) as string[],
		enabled: options.enabled ?? true,
		lgpdCompliance: true,
		auditLogging: true,
		...(options.onAppointmentUpdate && {
			onUpdate: options.onAppointmentUpdate,
		}),
		queryOptions: {
			invalidateOnInsert: true,
			invalidateOnUpdate: true,
			invalidateOnDelete: true,
			backgroundRefetch: true,
		},
	};

	return useRealtimeQuery(supabaseClient, config);
}

/**
 * Healthcare-specific professional real-time hook
 */
export function useProfessionalRealtime(
	supabaseClient: SupabaseClient,
	options: {
		professionalId?: string;
		clinicId?: string;
		specialty?: string;
		enabled?: boolean;
		onProfessionalUpdate?: (professional: any) => void;
	},
) {
	const buildFilter = useCallback(() => {
		const filters = [];

		if (options.professionalId) {
			filters.push(`id=eq.${options.professionalId}`);
		}
		if (options.clinicId) {
			filters.push(`clinic_id=eq.${options.clinicId}`);
		}
		if (options.specialty) {
			filters.push(`specialty=eq.${options.specialty}`);
		}

		return filters.join(",");
	}, [options]);

	const config: UseRealtimeQueryConfig = {
		table: "professionals",
		filter: buildFilter(),
		queryKey: [
			"professionals",
			options.professionalId,
			options.clinicId,
		].filter(Boolean) as string[],
		enabled: options.enabled ?? true,
		lgpdCompliance: true,
		auditLogging: true,
		...(options.onProfessionalUpdate && {
			onUpdate: options.onProfessionalUpdate,
		}),
		queryOptions: {
			invalidateOnInsert: true,
			invalidateOnUpdate: true,
			invalidateOnDelete: true,
			backgroundRefetch: true,
		},
	};

	return useRealtimeQuery(supabaseClient, config);
}

/**
 * Real-time dashboard metrics hook
 * Monitors key healthcare metrics for live dashboard updates
 */
export function useDashboardRealtime(
	supabaseClient: SupabaseClient,
	options: {
		clinicId?: string;
		enabled?: boolean;
		onMetricsUpdate?: (metrics: any) => void;
	},
) {
	// Listen to multiple tables for dashboard metrics
	const appointmentsRealtime = useAppointmentRealtime(supabaseClient, {
		...(options.clinicId && { clinicId: options.clinicId }),
		...(options.enabled !== undefined && { enabled: options.enabled }),
		...(options.onMetricsUpdate && {
			onAppointmentUpdate: options.onMetricsUpdate,
		}),
	});

	const patientsRealtime = usePatientRealtime(supabaseClient, {
		...(options.clinicId && { clinicId: options.clinicId }),
		...(options.enabled !== undefined && { enabled: options.enabled }),
		...(options.onMetricsUpdate && {
			onPatientUpdate: options.onMetricsUpdate,
		}),
	});

	const professionalsRealtime = useProfessionalRealtime(supabaseClient, {
		...(options.clinicId && { clinicId: options.clinicId }),
		...(options.enabled !== undefined && { enabled: options.enabled }),
		...(options.onMetricsUpdate && {
			onProfessionalUpdate: options.onMetricsUpdate,
		}),
	});

	return {
		appointments: appointmentsRealtime,
		patients: patientsRealtime,
		professionals: professionalsRealtime,
		isConnected:
			appointmentsRealtime.isConnected ||
			patientsRealtime.isConnected ||
			professionalsRealtime.isConnected,
		errors: [
			appointmentsRealtime.error,
			patientsRealtime.error,
			professionalsRealtime.error,
		].filter(Boolean),
	};
}

/**
 * Real-time audit log hook for compliance monitoring
 */
export function useAuditRealtime(
	supabaseClient: SupabaseClient,
	options: {
		table?: string;
		userId?: string;
		action?: string;
		enabled?: boolean;
		onAuditUpdate?: (audit: any) => void;
	},
) {
	const buildFilter = useCallback(() => {
		const filters = [];

		if (options.table) {
			filters.push(`table_name=eq.${options.table}`);
		}
		if (options.userId) {
			filters.push(`user_id=eq.${options.userId}`);
		}
		if (options.action) {
			filters.push(`action=eq.${options.action}`);
		}

		return filters.join(",");
	}, [options]);

	const config: UseRealtimeQueryConfig = {
		table: "audit_logs",
		event: "INSERT", // Only listen to new audit entries
		filter: buildFilter(),
		queryKey: [
			"audit_logs",
			options.table,
			options.userId,
			options.action,
		].filter(Boolean) as string[],
		enabled: options.enabled ?? true,
		lgpdCompliance: true,
		auditLogging: false, // Don't audit the audit logs
		...(options.onAuditUpdate && { onInsert: options.onAuditUpdate }),
		queryOptions: {
			invalidateOnInsert: true,
			invalidateOnUpdate: false,
			invalidateOnDelete: false,
			backgroundRefetch: true,
		},
	};

	return useRealtimeQuery(supabaseClient, config);
}
