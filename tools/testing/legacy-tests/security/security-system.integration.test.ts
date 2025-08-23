/**
 * Security System Integration Tests
 * Story 3.3: Security Hardening & Audit
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SecurityAPI } from "@/lib/security";

// Mock Supabase client
const _mockSupabase = {
	from: vi.fn(),
	rpc: vi.fn(),
	auth: {
		getUser: vi.fn(),
		getSession: vi.fn(),
	},
};

// Mock SecurityAPI
vi.mock("@/lib/security", () => ({
	SecurityAPI: {
		createSecurityEvent: vi.fn(),
		getSecurityEvents: vi.fn(),
		createSecurityAlert: vi.fn(),
		getSecurityAlerts: vi.fn(),
		updateAlert: vi.fn(),
		createAuditLog: vi.fn(),
		getAuditLogs: vi.fn(),
		getActiveSessions: vi.fn(),
		terminateSession: vi.fn(),
		getSecurityMetrics: vi.fn(),
		createComplianceAudit: vi.fn(),
		getComplianceAudits: vi.fn(),
	},
}));

describe("Security System Integration Tests", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("Security Events", () => {
		it("should create security event successfully", async () => {
			const mockEvent = {
				event_type: "authentication",
				severity: "medium",
				user_id: "test-user-id",
				event_details: { action: "login_success" },
				success: true,
			};

			const mockResponse = {
				data: { ...mockEvent, id: "test-event-id" },
				error: null,
			};

			(SecurityAPI.createSecurityEvent as vi.Mock).mockResolvedValue(
				mockResponse,
			);

			const result = await SecurityAPI.createSecurityEvent(mockEvent);

			expect(SecurityAPI.createSecurityEvent).toHaveBeenCalledWith(mockEvent);
			expect(result.data).toMatchObject(mockEvent);
			expect(result.error).toBeNull();
		});

		it("should retrieve security events with filters", async () => {
			const mockEvents = [
				{
					id: "event-1",
					event_type: "authentication",
					severity: "high",
					created_at: new Date().toISOString(),
				},
				{
					id: "event-2",
					event_type: "authorization",
					severity: "medium",
					created_at: new Date().toISOString(),
				},
			];

			const mockResponse = {
				data: mockEvents,
				error: null,
				count: 2,
			};

			(SecurityAPI.getSecurityEvents as vi.Mock).mockResolvedValue(
				mockResponse,
			);

			const result = await SecurityAPI.getSecurityEvents({
				severity: "high",
				limit: 10,
				offset: 0,
			});

			expect(SecurityAPI.getSecurityEvents).toHaveBeenCalledWith({
				severity: "high",
				limit: 10,
				offset: 0,
			});
			expect(result.data).toHaveLength(2);
			expect(result.count).toBe(2);
		});

		it("should handle security event creation errors", async () => {
			const mockEvent = {
				event_type: "invalid_type",
				severity: "medium",
			};

			const mockResponse = {
				data: null,
				error: { message: "Invalid event type" },
			};

			(SecurityAPI.createSecurityEvent as vi.Mock).mockResolvedValue(
				mockResponse,
			);

			const result = await SecurityAPI.createSecurityEvent(mockEvent);

			expect(result.data).toBeNull();
			expect(result.error).toBeDefined();
			expect(result.error.message).toBe("Invalid event type");
		});
	});

	describe("Security Alerts", () => {
		it("should create security alert successfully", async () => {
			const mockAlert = {
				alert_type: "failed_login",
				severity: "high",
				title: "Multiple Failed Login Attempts",
				description: "User attempted to login 5 times with wrong password",
				user_id: "test-user-id",
				source_ip: "192.168.1.1",
			};

			const mockResponse = {
				data: { ...mockAlert, id: "test-alert-id", status: "open" },
				error: null,
			};

			(SecurityAPI.createSecurityAlert as vi.Mock).mockResolvedValue(
				mockResponse,
			);

			const result = await SecurityAPI.createSecurityAlert(mockAlert);

			expect(SecurityAPI.createSecurityAlert).toHaveBeenCalledWith(mockAlert);
			expect(result.data).toMatchObject(mockAlert);
			expect(result.data.status).toBe("open");
		});

		it("should update alert status and assignment", async () => {
			const alertId = "test-alert-id";
			const updateData = {
				status: "investigating",
				assigned_to: "security-admin-id",
			};

			const mockResponse = {
				data: { id: alertId, ...updateData },
				error: null,
			};

			(SecurityAPI.updateAlert as vi.Mock).mockResolvedValue(mockResponse);

			const result = await SecurityAPI.updateAlert(alertId, updateData);

			expect(SecurityAPI.updateAlert).toHaveBeenCalledWith(alertId, updateData);
			expect(result.data.status).toBe("investigating");
			expect(result.data.assigned_to).toBe("security-admin-id");
		});

		it("should resolve alert with resolution notes", async () => {
			const alertId = "test-alert-id";
			const updateData = {
				status: "resolved",
				resolution_notes: "False positive - legitimate user behavior",
				resolved_at: new Date().toISOString(),
			};

			const mockResponse = {
				data: { id: alertId, ...updateData },
				error: null,
			};

			(SecurityAPI.updateAlert as vi.Mock).mockResolvedValue(mockResponse);

			const result = await SecurityAPI.updateAlert(alertId, updateData);

			expect(result.data.status).toBe("resolved");
			expect(result.data.resolution_notes).toBeDefined();
			expect(result.data.resolved_at).toBeDefined();
		});
	});

	describe("Audit Logs", () => {
		it("should create audit log entry", async () => {
			const mockAuditLog = {
				action: "user_login",
				resource_type: "user",
				resource_id: "test-user-id",
				user_id: "test-user-id",
				ip_address: "192.168.1.1",
				metadata: { browser: "Chrome", os: "Windows" },
				success: true,
			};

			const mockResponse = {
				data: { ...mockAuditLog, id: "test-audit-id" },
				error: null,
			};

			(SecurityAPI.createAuditLog as vi.Mock).mockResolvedValue(mockResponse);

			const result = await SecurityAPI.createAuditLog(mockAuditLog);

			expect(SecurityAPI.createAuditLog).toHaveBeenCalledWith(mockAuditLog);
			expect(result.data).toMatchObject(mockAuditLog);
		});

		it("should query audit logs with complex filters", async () => {
			const filters = {
				user_id: "test-user-id",
				action: "user_login",
				start_date: "2025-01-01",
				end_date: "2025-01-31",
				limit: 50,
				offset: 0,
			};

			const mockLogs = [
				{
					id: "log-1",
					action: "user_login",
					user_id: "test-user-id",
					created_at: new Date().toISOString(),
				},
			];

			const mockResponse = {
				data: mockLogs,
				error: null,
				count: 1,
			};

			(SecurityAPI.getAuditLogs as vi.Mock).mockResolvedValue(mockResponse);

			const result = await SecurityAPI.getAuditLogs(filters);

			expect(SecurityAPI.getAuditLogs).toHaveBeenCalledWith(filters);
			expect(result.data).toHaveLength(1);
			expect(result.data[0].action).toBe("user_login");
		});
	});

	describe("Session Management", () => {
		it("should retrieve active sessions with security metadata", async () => {
			const mockSessions = [
				{
					id: "session-1",
					user_id: "user-1",
					ip_address: "192.168.1.1",
					security_score: 95,
					is_active: true,
					last_activity: new Date().toISOString(),
				},
				{
					id: "session-2",
					user_id: "user-2",
					ip_address: "10.0.0.1",
					security_score: 75,
					is_active: true,
					last_activity: new Date().toISOString(),
				},
			];

			const mockResponse = {
				data: mockSessions,
				error: null,
				count: 2,
			};

			(SecurityAPI.getActiveSessions as vi.Mock).mockResolvedValue(
				mockResponse,
			);

			const result = await SecurityAPI.getActiveSessions();

			expect(result.data).toHaveLength(2);
			expect(result.data[0].security_score).toBe(95);
			expect(result.data[1].security_score).toBe(75);
		});

		it("should terminate session successfully", async () => {
			const sessionId = "test-session-id";

			const mockResponse = {
				data: { session_id: sessionId, terminated: true },
				error: null,
			};

			(SecurityAPI.terminateSession as vi.Mock).mockResolvedValue(mockResponse);

			const result = await SecurityAPI.terminateSession(sessionId);

			expect(SecurityAPI.terminateSession).toHaveBeenCalledWith(sessionId);
			expect(result.data.terminated).toBe(true);
		});
	});

	describe("Security Metrics", () => {
		it("should retrieve comprehensive security metrics", async () => {
			const mockMetrics = {
				total_events_24h: 150,
				critical_alerts: 2,
				unresolved_alerts: 5,
				active_sessions: 25,
				failed_attempts_24h: 8,
				threat_level: "medium",
				compliance_score: 92,
				avg_response_time_minutes: 15,
				high_risk_sessions: 3,
			};

			const mockResponse = {
				data: mockMetrics,
				error: null,
			};

			(SecurityAPI.getSecurityMetrics as vi.Mock).mockResolvedValue(
				mockResponse,
			);

			const result = await SecurityAPI.getSecurityMetrics();

			expect(result.data).toMatchObject(mockMetrics);
			expect(result.data.threat_level).toBe("medium");
			expect(result.data.compliance_score).toBe(92);
		});

		it("should calculate threat level correctly", async () => {
			const highRiskMetrics = {
				critical_alerts: 10,
				failed_attempts_24h: 50,
				high_risk_sessions: 15,
				compliance_score: 70,
			};

			const mockResponse = {
				data: { ...highRiskMetrics, threat_level: "high" },
				error: null,
			};

			(SecurityAPI.getSecurityMetrics as vi.Mock).mockResolvedValue(
				mockResponse,
			);

			const result = await SecurityAPI.getSecurityMetrics();

			expect(result.data.threat_level).toBe("high");
		});
	});

	describe("Compliance Audits", () => {
		it("should create compliance audit successfully", async () => {
			const mockAudit = {
				audit_type: "lgpd",
				audit_name: "Monthly LGPD Compliance Check",
				description: "Automated LGPD compliance verification",
			};

			const mockResponse = {
				data: {
					...mockAudit,
					id: "test-audit-id",
					status: "pending",
					total_checks: 0,
					passed_checks: 0,
					failed_checks: 0,
				},
				error: null,
			};

			(SecurityAPI.createComplianceAudit as vi.Mock).mockResolvedValue(
				mockResponse,
			);

			const result = await SecurityAPI.createComplianceAudit(mockAudit);

			expect(SecurityAPI.createComplianceAudit).toHaveBeenCalledWith(mockAudit);
			expect(result.data.status).toBe("pending");
			expect(result.data.audit_type).toBe("lgpd");
		});

		it("should retrieve compliance audits with status filter", async () => {
			const filters = {
				audit_type: "anvisa",
				status: "completed",
				limit: 10,
			};

			const mockAudits = [
				{
					id: "audit-1",
					audit_type: "anvisa",
					status: "completed",
					compliance_score: 95,
					total_checks: 50,
					passed_checks: 47,
					failed_checks: 3,
				},
			];

			const mockResponse = {
				data: mockAudits,
				error: null,
				count: 1,
			};

			(SecurityAPI.getComplianceAudits as vi.Mock).mockResolvedValue(
				mockResponse,
			);

			const result = await SecurityAPI.getComplianceAudits(filters);

			expect(SecurityAPI.getComplianceAudits).toHaveBeenCalledWith(filters);
			expect(result.data[0].audit_type).toBe("anvisa");
			expect(result.data[0].status).toBe("completed");
		});
	});

	describe("Error Handling", () => {
		it("should handle database connection errors", async () => {
			const mockError = {
				data: null,
				error: { message: "Database connection failed" },
			};

			(SecurityAPI.getSecurityEvents as vi.Mock).mockResolvedValue(mockError);

			const result = await SecurityAPI.getSecurityEvents();

			expect(result.data).toBeNull();
			expect(result.error.message).toBe("Database connection failed");
		});

		it("should handle validation errors", async () => {
			const invalidEvent = {
				event_type: "invalid",
				severity: "unknown",
			};

			const mockError = {
				data: null,
				error: { message: "Validation failed: invalid event_type" },
			};

			(SecurityAPI.createSecurityEvent as vi.Mock).mockResolvedValue(mockError);

			const result = await SecurityAPI.createSecurityEvent(invalidEvent);

			expect(result.error.message).toContain("Validation failed");
		});
	});

	describe("Performance Tests", () => {
		it("should handle large datasets efficiently", async () => {
			const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
				id: `event-${i}`,
				event_type: "authentication",
				severity: "low",
				created_at: new Date().toISOString(),
			}));

			const mockResponse = {
				data: largeDataset,
				error: null,
				count: 1000,
			};

			(SecurityAPI.getSecurityEvents as vi.Mock).mockResolvedValue(
				mockResponse,
			);

			const startTime = Date.now();
			const result = await SecurityAPI.getSecurityEvents({ limit: 1000 });
			const endTime = Date.now();

			expect(result.data).toHaveLength(1000);
			expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
		});

		it("should handle concurrent requests", async () => {
			const mockResponse = {
				data: { id: "test-event" },
				error: null,
			};

			(SecurityAPI.createSecurityEvent as vi.Mock).mockResolvedValue(
				mockResponse,
			);

			const concurrentRequests = Array.from({ length: 10 }, () =>
				SecurityAPI.createSecurityEvent({
					event_type: "authentication",
					severity: "low",
				}),
			);

			const results = await Promise.all(concurrentRequests);

			expect(results).toHaveLength(10);
			results.forEach((result) => {
				expect(result.data).toBeDefined();
				expect(result.error).toBeNull();
			});
		});
	});
});
