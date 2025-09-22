import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { AuditService } from "../audit-service";
import type { SupabaseClient } from "@supabase/supabase-js";

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn(),
  rpc: vi.fn(),
} as unknown as SupabaseClient;

// Mock chain methods
const mockSelect = vi.fn(
const mockInsert = vi.fn(
const mockUpdate = vi.fn(
const mockDelete = vi.fn(
const mockEq = vi.fn(
const mockOrder = vi.fn(
const mockLimit = vi.fn(
const mockSingle = vi.fn(
const mockRange = vi.fn(
const mockGte = vi.fn(
const mockLte = vi.fn(
const mockIlike = vi.fn(

// Mock data
const mockAuditLogData = {
  sessionId: "session-123",
  eventType: "video-call-start" as const,
  _userId: "user-123",
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
    vi.clearAllMocks(

    // Setup mock chain
    mockSupabaseClient.from = vi.fn().mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
    }

    mockSelect.mockReturnValue({
      eq: mockEq,
      order: mockOrder,
      limit: mockLimit,
      single: mockSingle,
      range: mockRange,
      gte: mockGte,
      lte: mockLte,
      ilike: mockIlike,
    }

    mockInsert.mockReturnValue({
      select: mockSelect,
      single: mockSingle,
    }

    mockEq.mockReturnValue({
      eq: mockEq,
      order: mockOrder,
      limit: mockLimit,
      single: mockSingle,
      range: mockRange,
      gte: mockGte,
      lte: mockLte,
      ilike: mockIlike,
    }

    mockOrder.mockReturnValue({
      eq: mockEq,
      order: mockOrder,
      limit: mockLimit,
      single: mockSingle,
      range: mockRange,
      gte: mockGte,
      lte: mockLte,
      ilike: mockIlike,
    }

    mockLimit.mockReturnValue({
      eq: mockEq,
      order: mockOrder,
      limit: mockLimit,
      single: mockSingle,
      range: mockRange,
      gte: mockGte,
      lte: mockLte,
      ilike: mockIlike,
    }

    mockRange.mockReturnValue({
      eq: mockEq,
      order: mockOrder,
      limit: mockLimit,
      single: mockSingle,
      range: mockRange,
      gte: mockGte,
      lte: mockLte,
      ilike: mockIlike,
    }

    mockGte.mockReturnValue({
      eq: mockEq,
      order: mockOrder,
      limit: mockLimit,
      single: mockSingle,
      range: mockRange,
      gte: mockGte,
      lte: mockLte,
      ilike: mockIlike,
    }

    mockLte.mockReturnValue({
      eq: mockEq,
      order: mockOrder,
      limit: mockLimit,
      single: mockSingle,
      range: mockRange,
      gte: mockGte,
      lte: mockLte,
      ilike: mockIlike,
    }

    mockIlike.mockReturnValue({
      eq: mockEq,
      order: mockOrder,
      limit: mockLimit,
      single: mockSingle,
      range: mockRange,
      gte: mockGte,
      lte: mockLte,
      ilike: mockIlike,
    }

    auditService = new AuditService(mockSupabaseClient
  }

  afterEach(() => {
    vi.clearAllMocks(
  }

  describe("createAuditLog", () => {
    it(_"should create audit log successfully",_async () => {
      mockSingle.mockResolvedValueOnce({
        data: { id: "audit-123" },
        error: null,
      }

      const result = await auditService.createAuditLog(mockAuditLogData

      expect(result).toBe("audit-123"
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("webrtc_audit_logs"
      expect(mockInsert).toHaveBeenCalledWith({
        session_id: "session-123",
        action: "video-call-start",
        user_id: "user-123",
        user_role: "patient",
        data_classification: "general-medical",
        metadata: { test: "data" },
      }
    }

    it(_"should throw error when insert fails",_async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: "Insert failed" },
      }

      await expect(
        auditService.createAuditLog(mockAuditLogData),
      ).rejects.toThrow("Failed to create audit log: Insert failed"
    }
  }

  describe("logSessionStart", () => {
    it(_"should log session start successfully",_async () => {
      mockSingle.mockResolvedValueOnce({
        data: { id: "audit-123" },
        error: null,
      }

      const result = await auditService.logSessionStart(
        "session-123",
        "user-123",
        "patient",
        "general-medical",
        { test: "metadata" },
      

      expect(result).toBe("audit-123"
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("webrtc_audit_logs"
    }
  }

  describe("logSessionEnd", () => {
    it(_"should log session end successfully",_async () => {
      mockSingle.mockResolvedValueOnce({
        data: { id: "audit-123" },
        error: null,
      }

      const result = await auditService.logSessionEnd(
        "session-123",
        "user-123",
        "patient",
        "general-medical",
        { duration: 300 },
      

      expect(result).toBe("audit-123"
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("webrtc_audit_logs"
    }
  }

  describe("logDataAccess", () => {
    it(_"should log data access successfully",_async () => {
      mockSingle.mockResolvedValueOnce({
        data: { id: "audit-123" },
        error: null,
      }

      const result = await auditService.logDataAccess(
        "session-123",
        "user-123",
        "patient",
        "general-medical",
        { accessType: "read" },
      

      expect(result).toBe("audit-123"
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("webrtc_audit_logs"
    }
  }

  describe("logConsentVerification", () => {
    it(_"should log consent verification successfully",_async () => {
      mockSingle.mockResolvedValueOnce({
        data: { id: "audit-123" },
        error: null,
      }

      const result = await auditService.logConsentVerification(
        "session-123",
        "user-123",
        "patient",
        "general-medical",
        { consentId: "consent-123", verified: true },
      

      expect(result).toBe("audit-123"
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("webrtc_audit_logs"
    }
  }

  describe("logSecurityEvent", () => {
    it(_"should log security event successfully",_async () => {
      mockSingle.mockResolvedValueOnce({
        data: { id: "audit-123" },
        error: null,
      }

      const result = await auditService.logSecurityEvent(
        "session-123",
        "user-123",
        "patient",
        "general-medical",
        { eventType: "unauthorized_access" },
      

      expect(result).toBe("audit-123"
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("webrtc_audit_logs"
    }
  }

  describe("getSessionAuditLogs", () => {
    it(_"should return session audit logs",_async () => {
      mockOrder.mockResolvedValueOnce({
        data: [mockAuditLog],
        error: null,
      }

      const result = await auditService.getSessionAuditLogs("session-123"

      expect(result).toHaveLength(1
      expect(result[0]).toMatchObject({
        id: "audit-123",
        sessionId: "session-123",
        eventType: "video-call-start",
        _userId: "user-123",
        userRole: "patient",
        dataClassification: "general-medical",
      }
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("webrtc_audit_logs"
    }

    it(_"should return empty array when no logs found",_async () => {
      mockOrder.mockResolvedValueOnce({
        data: [],
        error: null,
      }

      const result = await auditService.getSessionAuditLogs("session-123"

      expect(result).toEqual([]
    }

    it(_"should return empty array when query fails",_async () => {
      mockOrder.mockResolvedValueOnce({
        data: null,
        error: { message: "Query failed" },
      }

      const result = await auditService.getSessionAuditLogs("session-123"

      expect(result).toEqual([]
    }
  }

  describe("getUserAuditLogs", () => {
    it(_"should return user audit logs",_async () => {
      mockOrder.mockResolvedValueOnce({
        data: [mockAuditLog],
        error: null,
      }

      const result = await auditService.getUserAuditLogs("user-123"

      expect(result).toHaveLength(1
      expect(result[0]).toMatchObject({
        id: "audit-123",
        sessionId: "session-123",
        eventType: "video-call-start",
        _userId: "user-123",
        userRole: "patient",
        dataClassification: "general-medical",
      }
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("webrtc_audit_logs"
    }

    it(_"should return empty array when no logs found",_async () => {
      mockOrder.mockResolvedValueOnce({
        data: [],
        error: null,
      }

      const result = await auditService.getUserAuditLogs("user-123"

      expect(result).toEqual([]
    }

    it(_"should return empty array when query fails",_async () => {
      mockOrder.mockResolvedValueOnce({
        data: null,
        error: { message: "Query failed" },
      }

      const result = await auditService.getUserAuditLogs("user-123"

      expect(result).toEqual([]
    }
  }

  describe("getAuditLogsByDateRange", () => {
    it(_"should return audit logs within date range",_async () => {
      mockOrder.mockResolvedValueOnce({
        data: [mockAuditLog],
        error: null,
      }

      const startDate = new Date("2024-01-01"
      const endDate = new Date("2024-01-31"
      const result = await auditService.getAuditLogsByDateRange(
        startDate,
        endDate,
      

      expect(result).toHaveLength(1
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("webrtc_audit_logs"
    }

    it(_"should return empty array when no logs in range",_async () => {
      mockOrder.mockResolvedValueOnce({
        data: [],
        error: null,
      }

      const startDate = new Date("2024-01-01"
      const endDate = new Date("2024-01-31"
      const result = await auditService.getAuditLogsByDateRange(
        startDate,
        endDate,
      

      expect(result).toEqual([]
    }

    it(_"should return empty array when query fails",_async () => {
      mockOrder.mockResolvedValueOnce({
        data: null,
        error: { message: "Query failed" },
      }

      const startDate = new Date("2024-01-01"
      const endDate = new Date("2024-01-31"
      const result = await auditService.getAuditLogsByDateRange(
        startDate,
        endDate,
      

      expect(result).toEqual([]
    }
  }

  describe("getComplianceReport", () => {
    it(_"should return compliance report",_async () => {
      mockOrder.mockResolvedValueOnce({
        data: [mockAuditLog],
        error: null,
      }

      const startDate = new Date("2024-01-01"
      const endDate = new Date("2024-01-31"
      const result = await auditService.getComplianceReport(startDate, endDate

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
      }
    }

    it(_"should return empty report when no data",_async () => {
      mockOrder.mockResolvedValueOnce({
        data: [],
        error: null,
      }

      const startDate = new Date("2024-01-01"
      const endDate = new Date("2024-01-31"
      const result = await auditService.getComplianceReport(startDate, endDate

      expect(result.totalEvents).toBe(0
    }

    it(_"should return empty report when query fails",_async () => {
      mockOrder.mockResolvedValueOnce({
        data: null,
        error: { message: "Query failed" },
      }

      const startDate = new Date("2024-01-01"
      const endDate = new Date("2024-01-31"
      const result = await auditService.getComplianceReport(startDate, endDate

      expect(result.totalEvents).toBe(0
    }
  }

  describe("searchAuditLogs", () => {
    it(_"should search audit logs by criteria",_async () => {
      mockOrder.mockResolvedValueOnce({
        data: [mockAuditLog],
        error: null,
      }

      const result = await auditService.searchAuditLogs({
        _userId: "user-123",
        eventType: "video-call-start",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-01-31"),
      }

      expect(result).toHaveLength(1
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("webrtc_audit_logs"
    }

    it(_"should limit results when specified",_async () => {
      mockOrder.mockResolvedValueOnce({
        data: [mockAuditLog],
        error: null,
      }

      const result = await auditService.searchAuditLogs({
        _userId: "user-123",
        limit: 10,
      }

      expect(mockLimit).toHaveBeenCalledWith(10
    }

    it(_"should return empty array when no matches found",_async () => {
      mockOrder.mockResolvedValueOnce({
        data: [],
        error: null,
      }

      const result = await auditService.searchAuditLogs({
        _userId: "nonexistent-user",
      }

      expect(result).toEqual([]
    }

    it(_"should return empty array when query fails",_async () => {
      mockOrder.mockResolvedValueOnce({
        data: null,
        error: { message: "Query failed" },
      }

      const result = await auditService.searchAuditLogs({
        _userId: "user-123",
      }

      expect(result).toEqual([]
    }
  }

  describe("edge cases and error handling", () => {
    it(_"should handle malformed compliance check data",_async () => {
      mockOrder.mockResolvedValueOnce({
        data: [
          {
            ...mockAuditLog,
            metadata: null, // malformed metadata
          },
        ],
        error: null,
      }

      const startDate = new Date("2024-01-01"
      const endDate = new Date("2024-01-31"
      const result = await auditService.getComplianceReport(startDate, endDate

      expect(result.totalEvents).toBe(1
    }

    it(_"should handle large datasets efficiently",_async () => {
      const largeMockData = Array.from({ length: 1000 },(, i) => ({
        ...mockAuditLog,
        id: `audit-${i}`,
      })

      mockOrder.mockResolvedValueOnce({
        data: largeMockData,
        error: null,
      }

      const startDate = new Date("2024-01-01"
      const endDate = new Date("2024-01-31"
      const result = await auditService.getComplianceReport(startDate, endDate

      expect(result.totalEvents).toBe(1000
    }

    it(_"should handle network timeouts gracefully",_async () => {
      mockSupabaseClient.from = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockRejectedValueOnce(new Error("Request timeout")),
          }),
        }),
      }

      await expect(
        auditService.createAuditLog(mockAuditLogData),
      ).rejects.toThrow("Request timeout"
    }
  }
}