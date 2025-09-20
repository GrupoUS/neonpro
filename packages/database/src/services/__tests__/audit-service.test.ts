import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { AuditService } from "../audit-service";
import type { SupabaseClient } from "@supabase/supabase-js";

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn(),
  rpc: vi.fn(),
} as unknown as SupabaseClient;

// Mock chain methods
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();
const mockLimit = vi.fn();
const mockSingle = vi.fn();
const mockRange = vi.fn();
const mockGte = vi.fn();
const mockLte = vi.fn();
const mockIlike = vi.fn();

// Mock data
const mockAuditLogData = {
  sessionId: "session-123",
  eventType: "video-call-start" as const,
  userId: "user-123",
  userRole: "patient" as const,
  dataClassification: "general-medical" as const,
  metadata: { test: "data" },
};

const mockAuditLog = {
  id: "audit-123",
  session_id: "session-123",
  action: "video-call-start",
  user_id: "user-123",
  user_role: "patient",
  data_classification: "general-medical",
  metadata: { test: "data" },
  created_at: "2024-01-01T00:00:00Z",
};

describe("AuditService", () => {
  let auditService: AuditService;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock chain
    mockSupabaseClient.from = vi.fn().mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
    });

    mockSelect.mockReturnValue({
      eq: mockEq,
      order: mockOrder,
      limit: mockLimit,
      single: mockSingle,
      range: mockRange,
      gte: mockGte,
      lte: mockLte,
      ilike: mockIlike,
    });

    mockInsert.mockReturnValue({
      select: mockSelect,
      single: mockSingle,
    });

    mockEq.mockReturnValue({
      eq: mockEq,
      order: mockOrder,
      limit: mockLimit,
      single: mockSingle,
      range: mockRange,
      gte: mockGte,
      lte: mockLte,
      ilike: mockIlike,
    });

    mockOrder.mockReturnValue({
      eq: mockEq,
      order: mockOrder,
      limit: mockLimit,
      single: mockSingle,
      range: mockRange,
      gte: mockGte,
      lte: mockLte,
      ilike: mockIlike,
    });

    mockLimit.mockReturnValue({
      eq: mockEq,
      order: mockOrder,
      limit: mockLimit,
      single: mockSingle,
      range: mockRange,
      gte: mockGte,
      lte: mockLte,
      ilike: mockIlike,
    });

    mockRange.mockReturnValue({
      eq: mockEq,
      order: mockOrder,
      limit: mockLimit,
      single: mockSingle,
      range: mockRange,
      gte: mockGte,
      lte: mockLte,
      ilike: mockIlike,
    });

    mockGte.mockReturnValue({
      eq: mockEq,
      order: mockOrder,
      limit: mockLimit,
      single: mockSingle,
      range: mockRange,
      gte: mockGte,
      lte: mockLte,
      ilike: mockIlike,
    });

    mockLte.mockReturnValue({
      eq: mockEq,
      order: mockOrder,
      limit: mockLimit,
      single: mockSingle,
      range: mockRange,
      gte: mockGte,
      lte: mockLte,
      ilike: mockIlike,
    });

    mockIlike.mockReturnValue({
      eq: mockEq,
      order: mockOrder,
      limit: mockLimit,
      single: mockSingle,
      range: mockRange,
      gte: mockGte,
      lte: mockLte,
      ilike: mockIlike,
    });

    auditService = new AuditService(mockSupabaseClient);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("createAuditLog", () => {
    it("should create audit log successfully", async () => {
      mockSingle.mockResolvedValueOnce({
        data: { id: "audit-123" },
        error: null,
      });

      const result = await auditService.createAuditLog(mockAuditLogData);

      expect(result).toBe("audit-123");
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("webrtc_audit_logs");
      expect(mockInsert).toHaveBeenCalledWith({
        session_id: "session-123",
        action: "video-call-start",
        user_id: "user-123",
        user_role: "patient",
        data_classification: "general-medical",
        metadata: { test: "data" },
      });
    });

    it("should throw error when insert fails", async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: "Insert failed" },
      });

      await expect(
        auditService.createAuditLog(mockAuditLogData),
      ).rejects.toThrow("Failed to create audit log: Insert failed");
    });
  });

  describe("logSessionStart", () => {
    it("should log session start successfully", async () => {
      mockSingle.mockResolvedValueOnce({
        data: { id: "audit-123" },
        error: null,
      });

      const result = await auditService.logSessionStart(
        "session-123",
        "user-123",
        "patient",
        "general-medical",
        { test: "metadata" },
      );

      expect(result).toBe("audit-123");
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("webrtc_audit_logs");
    });
  });

  describe("logSessionEnd", () => {
    it("should log session end successfully", async () => {
      mockSingle.mockResolvedValueOnce({
        data: { id: "audit-123" },
        error: null,
      });

      const result = await auditService.logSessionEnd(
        "session-123",
        "user-123",
        "patient",
        "general-medical",
        { duration: 300 },
      );

      expect(result).toBe("audit-123");
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("webrtc_audit_logs");
    });
  });

  describe("logDataAccess", () => {
    it("should log data access successfully", async () => {
      mockSingle.mockResolvedValueOnce({
        data: { id: "audit-123" },
        error: null,
      });

      const result = await auditService.logDataAccess(
        "session-123",
        "user-123",
        "patient",
        "general-medical",
        { accessType: "read" },
      );

      expect(result).toBe("audit-123");
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("webrtc_audit_logs");
    });
  });

  describe("logConsentVerification", () => {
    it("should log consent verification successfully", async () => {
      mockSingle.mockResolvedValueOnce({
        data: { id: "audit-123" },
        error: null,
      });

      const result = await auditService.logConsentVerification(
        "session-123",
        "user-123",
        "patient",
        "general-medical",
        { consentId: "consent-123", verified: true },
      );

      expect(result).toBe("audit-123");
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("webrtc_audit_logs");
    });
  });

  describe("logSecurityEvent", () => {
    it("should log security event successfully", async () => {
      mockSingle.mockResolvedValueOnce({
        data: { id: "audit-123" },
        error: null,
      });

      const result = await auditService.logSecurityEvent(
        "session-123",
        "user-123",
        "patient",
        "general-medical",
        { eventType: "unauthorized_access" },
      );

      expect(result).toBe("audit-123");
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("webrtc_audit_logs");
    });
  });

  describe("getSessionAuditLogs", () => {
    it("should return session audit logs", async () => {
      mockOrder.mockResolvedValueOnce({
        data: [mockAuditLog],
        error: null,
      });

      const result = await auditService.getSessionAuditLogs("session-123");

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: "audit-123",
        sessionId: "session-123",
        eventType: "video-call-start",
        userId: "user-123",
        userRole: "patient",
        dataClassification: "general-medical",
      });
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("webrtc_audit_logs");
    });

    it("should return empty array when no logs found", async () => {
      mockOrder.mockResolvedValueOnce({
        data: [],
        error: null,
      });

      const result = await auditService.getSessionAuditLogs("session-123");

      expect(result).toEqual([]);
    });

    it("should return empty array when query fails", async () => {
      mockOrder.mockResolvedValueOnce({
        data: null,
        error: { message: "Query failed" },
      });

      const result = await auditService.getSessionAuditLogs("session-123");

      expect(result).toEqual([]);
    });
  });

  describe("getUserAuditLogs", () => {
    it("should return user audit logs", async () => {
      mockOrder.mockResolvedValueOnce({
        data: [mockAuditLog],
        error: null,
      });

      const result = await auditService.getUserAuditLogs("user-123");

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: "audit-123",
        sessionId: "session-123",
        eventType: "video-call-start",
        userId: "user-123",
        userRole: "patient",
        dataClassification: "general-medical",
      });
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("webrtc_audit_logs");
    });

    it("should return empty array when no logs found", async () => {
      mockOrder.mockResolvedValueOnce({
        data: [],
        error: null,
      });

      const result = await auditService.getUserAuditLogs("user-123");

      expect(result).toEqual([]);
    });

    it("should return empty array when query fails", async () => {
      mockOrder.mockResolvedValueOnce({
        data: null,
        error: { message: "Query failed" },
      });

      const result = await auditService.getUserAuditLogs("user-123");

      expect(result).toEqual([]);
    });
  });

  describe("getAuditLogsByDateRange", () => {
    it("should return audit logs within date range", async () => {
      mockOrder.mockResolvedValueOnce({
        data: [mockAuditLog],
        error: null,
      });

      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-01-31");
      const result = await auditService.getAuditLogsByDateRange(
        startDate,
        endDate,
      );

      expect(result).toHaveLength(1);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("webrtc_audit_logs");
    });

    it("should return empty array when no logs in range", async () => {
      mockOrder.mockResolvedValueOnce({
        data: [],
        error: null,
      });

      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-01-31");
      const result = await auditService.getAuditLogsByDateRange(
        startDate,
        endDate,
      );

      expect(result).toEqual([]);
    });

    it("should return empty array when query fails", async () => {
      mockOrder.mockResolvedValueOnce({
        data: null,
        error: { message: "Query failed" },
      });

      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-01-31");
      const result = await auditService.getAuditLogsByDateRange(
        startDate,
        endDate,
      );

      expect(result).toEqual([]);
    });
  });

  describe("getComplianceReport", () => {
    it("should return compliance report", async () => {
      mockOrder.mockResolvedValueOnce({
        data: [mockAuditLog],
        error: null,
      });

      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-01-31");
      const result = await auditService.getComplianceReport(startDate, endDate);

      expect(result).toMatchObject({
        reportDate: expect.any(String),
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
        totalEvents: 1,
        eventsByType: expect.any(Object),
        userActivity: expect.any(Object),
        dataClassifications: expect.any(Object),
      });
    });

    it("should return empty report when no data", async () => {
      mockOrder.mockResolvedValueOnce({
        data: [],
        error: null,
      });

      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-01-31");
      const result = await auditService.getComplianceReport(startDate, endDate);

      expect(result.totalEvents).toBe(0);
    });

    it("should return empty report when query fails", async () => {
      mockOrder.mockResolvedValueOnce({
        data: null,
        error: { message: "Query failed" },
      });

      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-01-31");
      const result = await auditService.getComplianceReport(startDate, endDate);

      expect(result.totalEvents).toBe(0);
    });
  });

  describe("searchAuditLogs", () => {
    it("should search audit logs by criteria", async () => {
      mockOrder.mockResolvedValueOnce({
        data: [mockAuditLog],
        error: null,
      });

      const result = await auditService.searchAuditLogs({
        userId: "user-123",
        eventType: "video-call-start",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-01-31"),
      });

      expect(result).toHaveLength(1);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("webrtc_audit_logs");
    });

    it("should limit results when specified", async () => {
      mockOrder.mockResolvedValueOnce({
        data: [mockAuditLog],
        error: null,
      });

      const result = await auditService.searchAuditLogs({
        userId: "user-123",
        limit: 10,
      });

      expect(mockLimit).toHaveBeenCalledWith(10);
    });

    it("should return empty array when no matches found", async () => {
      mockOrder.mockResolvedValueOnce({
        data: [],
        error: null,
      });

      const result = await auditService.searchAuditLogs({
        userId: "nonexistent-user",
      });

      expect(result).toEqual([]);
    });

    it("should return empty array when query fails", async () => {
      mockOrder.mockResolvedValueOnce({
        data: null,
        error: { message: "Query failed" },
      });

      const result = await auditService.searchAuditLogs({
        userId: "user-123",
      });

      expect(result).toEqual([]);
    });
  });

  describe("edge cases and error handling", () => {
    it("should handle malformed compliance check data", async () => {
      mockOrder.mockResolvedValueOnce({
        data: [
          {
            ...mockAuditLog,
            metadata: null, // malformed metadata
          },
        ],
        error: null,
      });

      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-01-31");
      const result = await auditService.getComplianceReport(startDate, endDate);

      expect(result.totalEvents).toBe(1);
    });

    it("should handle large datasets efficiently", async () => {
      const largeMockData = Array.from({ length: 1000 }, (_, i) => ({
        ...mockAuditLog,
        id: `audit-${i}`,
      }));

      mockOrder.mockResolvedValueOnce({
        data: largeMockData,
        error: null,
      });

      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-01-31");
      const result = await auditService.getComplianceReport(startDate, endDate);

      expect(result.totalEvents).toBe(1000);
    });

    it("should handle network timeouts gracefully", async () => {
      mockSupabaseClient.from = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockRejectedValueOnce(new Error("Request timeout")),
          }),
        }),
      });

      await expect(
        auditService.createAuditLog(mockAuditLogData),
      ).rejects.toThrow("Request timeout");
    });
  });
});