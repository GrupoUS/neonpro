/**
 * Enhanced React Hook para Real-time Compliance Updates
 * Monitoramento LGPD e ANVISA em tempo real para healthcare brasileiro
 * Sistema crítico para auditoria e compliance automático
 */

import type { Database } from "@neonpro/db";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { getRealtimeManager } from "../connection-manager";

// Use available compliance-related tables
type AuditLogRow = Database["public"]["Tables"]["healthcare_audit_logs"]["Row"];

// Compliance log is based on healthcare audit log structure
type ComplianceLog = AuditLogRow;

export type ComplianceEventType = {
	LGPD_CONSENT_GRANTED: "lgpd_consent_granted";
	LGPD_CONSENT_REVOKED: "lgpd_consent_revoked";
	LGPD_DATA_ACCESS: "lgpd_data_access";
	LGPD_DATA_DELETION: "lgpd_data_deletion";
	ANVISA_AUDIT_START: "anvisa_audit_start";
	ANVISA_COMPLIANCE_CHECK: "anvisa_compliance_check";
	ANVISA_VIOLATION: "anvisa_violation";
	DATA_BREACH_DETECTED: "data_breach_detected";
	UNAUTHORIZED_ACCESS: "unauthorized_access";
};

export type RealtimeCompliancePayload = {
	eventType: "INSERT" | "UPDATE" | "DELETE";
	complianceType: keyof ComplianceEventType;
	new?: ComplianceLog;
	old?: ComplianceLog;
	severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
	requiresAction: boolean;
};

export type UseRealtimeComplianceOptions = {
	tenantId: string;
	complianceType?: keyof ComplianceEventType;
	enabled?: boolean;
	enableAuditLog?: boolean;
	onComplianceEvent?: (payload: RealtimeCompliancePayload) => void;
	onCriticalViolation?: (payload: RealtimeCompliancePayload) => void;
	onError?: (error: Error) => void;
};

export type UseRealtimeComplianceReturn = {
	isConnected: boolean;
	connectionHealth: number;
	totalEvents: number;
	criticalEvents: number;
	lastEvent: ComplianceLog | null;
	complianceScore: number; // 0-100
	subscribe: () => void;
	unsubscribe: () => void;
	generateComplianceReport: () => Promise<any>;
	triggerManualAudit: () => void;
}; /**
 * MANDATORY Real-time Compliance Hook
 * Sistema crítico para monitoramento LGPD e ANVISA em healthcare brasileiro
 */
export function useRealtimeCompliance(options: UseRealtimeComplianceOptions): UseRealtimeComplianceReturn {
	const {
		tenantId,
		complianceType,
		enabled = true,
		enableAuditLog = true,
		onComplianceEvent,
		onCriticalViolation,
		onError,
	} = options;

	const queryClient = useQueryClient();
	const [isConnected, setIsConnected] = useState(false);
	const [connectionHealth, setConnectionHealth] = useState(0);
	const [totalEvents, setTotalEvents] = useState(0);
	const [criticalEvents, setCriticalEvents] = useState(0);
	const [lastEvent, setLastEvent] = useState<ComplianceLog | null>(null);
	const [complianceScore, setComplianceScore] = useState(100);
	const [unsubscribeFn, setUnsubscribeFn] = useState<(() => void) | null>(null);

	/**
	 * Handle realtime compliance changes
	 */
	const handleComplianceChange = useCallback(
		(payload: any) => {
			try {
				// Determine compliance type and severity
				const complianceType = determineComplianceType(payload);
				const severity = determineSeverity(payload);
				const requiresAction = severity === "HIGH" || severity === "CRITICAL";

				const realtimePayload: RealtimeCompliancePayload = {
					eventType: payload.eventType,
					complianceType,
					new: payload.new as ComplianceLog,
					old: payload.old as ComplianceLog,
					severity,
					requiresAction,
				};

				// Update metrics
				setTotalEvents((prev) => prev + 1);
				setLastEvent(realtimePayload.new || null);

				// Track critical events
				if (severity === "CRITICAL") {
					setCriticalEvents((prev) => prev + 1);

					// Trigger critical violation callback
					if (onCriticalViolation) {
						onCriticalViolation(realtimePayload);
					}
				}

				// Update compliance score
				updateComplianceScore(realtimePayload);

				// Update TanStack Query cache
				updateComplianceCache(realtimePayload);

				// Generate audit log if enabled
				if (enableAuditLog) {
					generateAuditEntry(realtimePayload);
				}

				// Call user callback
				if (onComplianceEvent) {
					onComplianceEvent(realtimePayload);
				}
			} catch (error) {
				if (onError) {
					onError(error as Error);
				}
			}
		},
		[
			onComplianceEvent,
			onCriticalViolation,
			onError,
			enableAuditLog,
			determineComplianceType,
			determineSeverity,
			generateAuditEntry, // Update TanStack Query cache
			updateComplianceCache, // Update compliance score
			updateComplianceScore,
		]
	); /**
	 * Determine compliance type based on payload
	 */
	const determineComplianceType = useCallback((payload: any): keyof ComplianceEventType => {
		const eventData = payload.new || payload.old;

		if (!eventData) {
			return "LGPD_DATA_ACCESS";
		}

		// Map based on action categories
		if (eventData.action?.includes("consent")) {
			return eventData.action === "consent_granted" ? "LGPD_CONSENT_GRANTED" : "LGPD_CONSENT_REVOKED";
		}

		if (eventData.action?.includes("deletion") || eventData.action?.includes("delete")) {
			return "LGPD_DATA_DELETION";
		}

		if (eventData.action?.includes("anvisa")) {
			const metadata = (eventData.metadata as Record<string, any>) || {};
			if (metadata.severity === "CRITICAL") {
				return "ANVISA_VIOLATION";
			}
			return "ANVISA_COMPLIANCE_CHECK";
		}

		if (eventData.action?.includes("breach") || eventData.action?.includes("vazamento")) {
			return "DATA_BREACH_DETECTED";
		}

		if (eventData.action?.includes("unauthorized") || eventData.action?.includes("nao_autorizado")) {
			return "UNAUTHORIZED_ACCESS";
		}

		return "LGPD_DATA_ACCESS";
	}, []);

	/**
	 * Determine severity level based on compliance event
	 */
	const determineSeverity = useCallback((payload: any): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" => {
		const eventData = payload.new || payload.old;
		const eventType = payload.eventType;

		// Critical severity scenarios
		if (
			eventData?.action?.includes("breach") ||
			eventData?.action?.includes("unauthorized") ||
			eventData?.action?.includes("violation") ||
			eventData?.action?.includes("vazamento") ||
			eventData?.action?.includes("nao_autorizado")
		) {
			return "CRITICAL";
		}

		// High severity for consent revocations and deletions
		if (
			eventType === "DELETE" ||
			eventData?.action?.includes("consent_revoked") ||
			eventData?.action?.includes("deletion")
		) {
			return "HIGH";
		}

		// Medium severity for ANVISA compliance checks
		if (eventData?.action?.includes("anvisa")) {
			return "MEDIUM";
		}

		// Low severity for routine LGPD access logs
		return "LOW";
	}, []);

	/**
	 * Update compliance score based on events
	 */
	const updateComplianceScore = useCallback((payload: RealtimeCompliancePayload) => {
		const { severity, complianceType } = payload;

		setComplianceScore((prev) => {
			let scoreDelta = 0;

			// Score penalties based on severity
			switch (severity) {
				case "CRITICAL":
					scoreDelta = -15; // Major penalty for critical issues
					break;
				case "HIGH":
					scoreDelta = -8;
					break;
				case "MEDIUM":
					scoreDelta = -3;
					break;
				case "LOW":
					scoreDelta = -1;
					break;
			}

			// Additional penalties for specific violations
			if (complianceType === "DATA_BREACH_DETECTED") {
				scoreDelta -= 20;
			}
			if (complianceType === "UNAUTHORIZED_ACCESS") {
				scoreDelta -= 10;
			}

			// Positive adjustments for good compliance actions
			if (complianceType === "LGPD_CONSENT_GRANTED") {
				scoreDelta = 1; // Small positive for consent
			}

			// Ensure score stays within bounds
			const newScore = Math.max(0, Math.min(100, prev + scoreDelta));

			return newScore;
		});
	}, []); /**
	 * Update TanStack Query cache para compliance
	 */
	const updateComplianceCache = useCallback(
		(payload: RealtimeCompliancePayload) => {
			const { eventType, new: newData, old: oldData } = payload;

			// Update compliance logs cache
			queryClient.setQueryData(["compliance-logs", tenantId], (oldCache: ComplianceLog[] | undefined) => {
				if (!oldCache) {
					return oldCache;
				}

				switch (eventType) {
					case "INSERT":
						if (newData && newData.clinic_id === tenantId) {
							return [newData, ...oldCache].slice(0, 1000); // Keep only last 1000 events
						}
						return oldCache;

					case "UPDATE":
						if (newData) {
							return oldCache.map((log) => (log.id === newData.id ? newData : log));
						}
						return oldCache;

					case "DELETE":
						if (oldData) {
							return oldCache.filter((log) => log.id !== oldData.id);
						}
						return oldCache;

					default:
						return oldCache;
				}
			});

			// Update compliance statistics
			queryClient.invalidateQueries({
				queryKey: ["compliance-stats", tenantId],
			});
			queryClient.invalidateQueries({
				queryKey: ["compliance-score", tenantId],
			});
			queryClient.invalidateQueries({ queryKey: ["audit-trail", tenantId] });
		},
		[queryClient, tenantId]
	);

	/**
	 * Generate audit entry for compliance event
	 */
	const generateAuditEntry = useCallback(
		(payload: RealtimeCompliancePayload) => {
			const auditEntry = {
				id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
				tenant_id: tenantId,
				event_type: payload.complianceType,
				severity: payload.severity,
				requires_action: payload.requiresAction,
				payload_data: JSON.stringify(payload),
				created_at: new Date().toISOString(),
				processed: false,
			};

			// Add to audit cache
			queryClient.setQueryData(["audit-trail", tenantId], (oldCache: any[] | undefined) => {
				if (!oldCache) {
					return [auditEntry];
				}
				return [auditEntry, ...oldCache].slice(0, 5000); // Keep audit trail manageable
			});

			// Log critical events to console for immediate visibility
			if (payload.severity === "CRITICAL") {
			}
		},
		[queryClient, tenantId]
	);

	/**
	 * Subscribe to realtime compliance updates
	 */
	const subscribe = useCallback(() => {
		if (!enabled || unsubscribeFn) {
			return;
		}

		const realtimeManager = getRealtimeManager();

		// Build filter for tenant-specific compliance logs
		let filter = `tenant_id=eq.${tenantId}`;
		if (complianceType) {
			filter += `,event_type=like.%${complianceType}%`;
		}

		const unsubscribe = realtimeManager.subscribe(
			`compliance-logs:${filter}`,
			{
				table: "healthcare_audit_logs",
				filter,
			},
			handleComplianceChange
		);

		setUnsubscribeFn(() => unsubscribe);
	}, [enabled, tenantId, complianceType, handleComplianceChange, unsubscribeFn]); /**
	 * Unsubscribe from realtime compliance updates
	 */
	const unsubscribe = useCallback(() => {
		if (unsubscribeFn) {
			unsubscribeFn();
			setUnsubscribeFn(null);
		}
	}, [unsubscribeFn]);

	/**
	 * Generate compliance report
	 */
	const generateComplianceReport = useCallback(async (): Promise<any> => {
		const logs = (queryClient.getQueryData(["compliance-logs", tenantId]) as ComplianceLog[]) || [];
		const auditTrail = (queryClient.getQueryData(["audit-trail", tenantId]) as any[]) || [];

		// Analyze compliance data
		const report = {
			generatedAt: new Date().toISOString(),
			tenantId,
			period: {
				start: logs.at(-1)?.timestamp || new Date().toISOString(),
				end: new Date().toISOString(),
			},
			summary: {
				totalEvents,
				criticalEvents,
				complianceScore,
				lastEventDate: lastEvent?.timestamp,
			},
			eventBreakdown: {
				lgpdEvents: logs.filter((log) => log.action?.includes("lgpd")).length,
				anvisaEvents: logs.filter((log) => log.action?.includes("anvisa")).length,
				breachEvents: logs.filter((log) => log.action?.includes("breach")).length,
				unauthorizedAccess: logs.filter((log) => log.action?.includes("unauthorized")).length,
			},
			severityBreakdown: {
				critical: logs.filter((log) => (log.metadata as any)?.severity === "CRITICAL").length,
				high: logs.filter((log) => (log.metadata as any)?.severity === "HIGH").length,
				medium: logs.filter((log) => (log.metadata as any)?.severity === "MEDIUM").length,
				low: logs.filter((log) => (log.metadata as any)?.severity === "LOW").length,
			},
			actionableItems: auditTrail.filter((item) => item.requires_action && !item.processed),
			recommendations: generateRecommendations(logs, complianceScore),
		};

		return report;
	}, [queryClient, tenantId, totalEvents, criticalEvents, complianceScore, lastEvent, generateRecommendations]);

	/**
	 * Generate compliance recommendations
	 */
	const generateRecommendations = useCallback((logs: ComplianceLog[], score: number): string[] => {
		const recommendations: string[] = [];

		if (score < 50) {
			recommendations.push("URGENTE: Score de compliance crítico. Implementar ações corretivas imediatas.");
		} else if (score < 70) {
			recommendations.push("Score de compliance baixo. Revisar processos de segurança.");
		}

		const criticalCount = logs.filter((log) => {
			const metadata = (log.metadata as Record<string, any>) || {};
			return metadata.severity === "CRITICAL";
		}).length;
		if (criticalCount > 0) {
			recommendations.push(`${criticalCount} eventos críticos detectados. Investigação imediata necessária.`);
		}

		const breachCount = logs.filter(
			(log) => log.action?.includes("breach") || log.action?.includes("vazamento")
		).length;
		if (breachCount > 0) {
			recommendations.push("Vazamentos de dados detectados. Notificar ANPD conforme LGPD Art. 48.");
		}

		const unauthorizedCount = logs.filter(
			(log) => log.action?.includes("unauthorized") || log.action?.includes("nao_autorizado")
		).length;
		if (unauthorizedCount > 5) {
			recommendations.push("Múltiplos acessos não autorizados. Revisar controles de segurança.");
		}

		if (recommendations.length === 0) {
			recommendations.push("Compliance em bom estado. Manter monitoramento contínuo.");
		}

		return recommendations;
	}, []);

	/**
	 * Trigger manual audit
	 */
	const triggerManualAudit = useCallback(() => {
		const auditEvent: ComplianceLog = {
			id: `manual_audit_${Date.now()}`,
			user_id: tenantId, // Using tenantId as user_id for manual audits
			action: "manual_audit_triggered",
			resource_type: "compliance_system",
			resource_id: null,
			metadata: {
				triggeredAt: new Date().toISOString(),
				triggeredBy: "manual_request",
				complianceScore,
				totalEvents,
				criticalEvents,
				severity: "MEDIUM", // Store severity in metadata since it's not in schema
			},
			ip_address: "127.0.0.1", // Default for system-triggered events
			user_agent: "NeonPro-Compliance-System",
			clinic_id: tenantId,
			timestamp: new Date().toISOString(),
		};

		// Add manual audit to cache
		queryClient.setQueryData(["compliance-logs", tenantId], (oldCache: ComplianceLog[] | undefined) => {
			if (!oldCache) {
				return [auditEvent];
			}
			return [auditEvent, ...oldCache];
		});
	}, [queryClient, tenantId, complianceScore, totalEvents, criticalEvents]); /**
	 * Monitor connection status and auto-subscribe
	 */
	useEffect(() => {
		if (!enabled) {
			return;
		}

		const realtimeManager = getRealtimeManager();

		const unsubscribeStatus = realtimeManager.onStatusChange((status) => {
			setIsConnected(status.isConnected);
			setConnectionHealth(status.healthScore);
		});

		// Auto-subscribe if enabled
		if (enabled) {
			subscribe();
		}

		// Cleanup on unmount
		return () => {
			unsubscribe();
			unsubscribeStatus();
		};
	}, [enabled, subscribe, unsubscribe]);

	return {
		isConnected,
		connectionHealth,
		totalEvents,
		criticalEvents,
		lastEvent,
		complianceScore,
		subscribe,
		unsubscribe,
		generateComplianceReport,
		triggerManualAudit,
	};
}

/**
 * Hook para compliance dashboard analytics
 * Fornece métricas agregadas para dashboards de compliance
 */
export function useComplianceAnalytics(tenantId: string) {
	const queryClient = useQueryClient();

	const getComplianceMetrics = useCallback(() => {
		const logs = (queryClient.getQueryData(["compliance-logs", tenantId]) as ComplianceLog[]) || [];

		const today = new Date();
		const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
		const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

		const recentLogs = logs.filter((log) => new Date(log.timestamp) >= lastWeek);
		const monthlyLogs = logs.filter((log) => new Date(log.timestamp) >= lastMonth);

		return {
			weekly: {
				totalEvents: recentLogs.length,
				criticalEvents: recentLogs.filter((log) => {
					const metadata = (log.metadata as Record<string, any>) || {};
					return metadata.severity === "CRITICAL";
				}).length,
				lgpdEvents: recentLogs.filter((log) => {
					const metadata = (log.metadata as Record<string, any>) || {};
					return metadata.event_type?.includes("lgpd") || log.action?.includes("lgpd");
				}).length,
				anvisaEvents: recentLogs.filter((log) => {
					const metadata = (log.metadata as Record<string, any>) || {};
					return metadata.event_type?.includes("anvisa") || log.action?.includes("anvisa");
				}).length,
			},
			monthly: {
				totalEvents: monthlyLogs.length,
				criticalEvents: monthlyLogs.filter((log) => {
					const metadata = (log.metadata as Record<string, any>) || {};
					return metadata.severity === "CRITICAL";
				}).length,
				trend: calculateTrend(monthlyLogs),
				avgDailyCritical:
					monthlyLogs.filter((log) => {
						const metadata = (log.metadata as Record<string, any>) || {};
						return metadata.severity === "CRITICAL";
					}).length / 30,
			},
			compliance: {
				lgpdCompliance: calculateLGPDCompliance(logs),
				anvisaCompliance: calculateANVISACompliance(logs),
				overallScore: calculateOverallScore(logs),
			},
		};
	}, [
		queryClient,
		tenantId,
		calculateANVISACompliance,
		calculateLGPDCompliance,
		calculateOverallScore,
		calculateTrend,
	]);

	const calculateTrend = useCallback((logs: ComplianceLog[]): "improving" | "stable" | "declining" => {
		if (logs.length < 10) {
			return "stable";
		}

		const half = Math.floor(logs.length / 2);
		const firstHalf = logs.slice(0, half);
		const secondHalf = logs.slice(half);

		const firstCritical = firstHalf.filter((log) => {
			const metadata = (log.metadata as Record<string, any>) || {};
			return metadata.severity === "CRITICAL";
		}).length;
		const secondCritical = secondHalf.filter((log) => {
			const metadata = (log.metadata as Record<string, any>) || {};
			return metadata.severity === "CRITICAL";
		}).length;

		if (secondCritical < firstCritical * 0.8) {
			return "improving";
		}
		if (secondCritical > firstCritical * 1.2) {
			return "declining";
		}
		return "stable";
	}, []);

	const calculateLGPDCompliance = useCallback((logs: ComplianceLog[]): number => {
		const lgpdLogs = logs.filter((log) => {
			const metadata = (log.metadata as Record<string, any>) || {};
			return metadata.event_type?.includes("lgpd") || log.action?.includes("lgpd");
		});
		if (lgpdLogs.length === 0) {
			return 100;
		}

		const violations = lgpdLogs.filter((log) => {
			const metadata = (log.metadata as Record<string, any>) || {};
			return metadata.severity === "HIGH" || metadata.severity === "CRITICAL";
		}).length;
		return Math.max(0, 100 - (violations / lgpdLogs.length) * 50);
	}, []);

	const calculateANVISACompliance = useCallback((logs: ComplianceLog[]): number => {
		const anvisaLogs = logs.filter((log) => {
			const metadata = (log.metadata as Record<string, any>) || {};
			return metadata.event_type?.includes("anvisa") || log.action?.includes("anvisa");
		});
		if (anvisaLogs.length === 0) {
			return 100;
		}

		const violations = anvisaLogs.filter((log) => {
			const metadata = (log.metadata as Record<string, any>) || {};
			return metadata.severity === "HIGH" || metadata.severity === "CRITICAL";
		}).length;
		return Math.max(0, 100 - (violations / anvisaLogs.length) * 60);
	}, []);

	const calculateOverallScore = useCallback((logs: ComplianceLog[]): number => {
		if (logs.length === 0) {
			return 100;
		}

		const criticalPenalty =
			logs.filter((log) => {
				const metadata = (log.metadata as Record<string, any>) || {};
				return metadata.severity === "CRITICAL";
			}).length * 15;
		const highPenalty =
			logs.filter((log) => {
				const metadata = (log.metadata as Record<string, any>) || {};
				return metadata.severity === "HIGH";
			}).length * 8;
		const mediumPenalty =
			logs.filter((log) => {
				const metadata = (log.metadata as Record<string, any>) || {};
				return metadata.severity === "MEDIUM";
			}).length * 3;

		return Math.max(0, 100 - criticalPenalty - highPenalty - mediumPenalty);
	}, []);

	return {
		getComplianceMetrics,
	};
}
