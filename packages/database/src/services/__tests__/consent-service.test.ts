import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ConsentService } from "../consent-service";
import type { Database } from "@neonpro/database";
import type { MedicalDataClassification } from "@neonpro/types";

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn(),
  rpc: vi.fn(),
};

// Mock database responses
const mockPatient = {
  id: "patient-123",
  clinic_id: "clinic-456",
  user_id: "user-123",
};

const mockConsentRecord = {
  id: "consent-123",
  patient_id: "patient-123",
  purpose: "telemedicine",
  status: "granted",
  data_types: ["general-medical"],
  session_id: "session-123",
  granted_at: new Date().toISOString(),
  expires_at: null,
  withdrawn_at: null,
  withdrawn_reason: null,
  version: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockAuditLog = {
  id: "audit-123",
  session_id: "session-123",
  event_type: "consent-given",
  timestamp: new Date().toISOString(),
  user_id: "user-123",
  user_role: "patient",
  data_classification: "general-medical",
  description: "User granted consent",
  ip_address: "192.168.1.1",
  user_agent: "Mozilla/5.0",
  clinic_id: "clinic-456",
  metadata: {},
  compliance_check: {
    isCompliant: true,
    violations: [],
    riskLevel: "low",
  },
};

describe("ConsentService", () => {
  let consentService: ConsentService;
  let mockFrom: any;
  let mockSelect: any;
  let mockInsert: any;
  let mockEq: any;
  let mockSingle: any;
  let mockUpdate: any;
  let mockDelete: any;
  let mockOrder: any;
  let mockContains: any;

  beforeEach(() => {
    // Setup mock chain
    mockContains = vi.fn().mockReturnThis();
    mockOrder = vi.fn().mockReturnThis();
    mockSingle = vi.fn();
    mockEq = vi.fn().mockReturnThis();
    mockSelect = vi.fn().mockReturnThis();
    mockInsert = vi.fn().mockReturnThis();
    mockUpdate = vi.fn().mockReturnThis();
    mockDelete = vi.fn().mockReturnThis();
    mockFrom = vi.fn().mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
      eq: mockEq,
      single: mockSingle,
      order: mockOrder,
      contains: mockContains,
    });

    mockSupabaseClient.from = mockFrom;
    mockSupabaseClient.rpc = vi.fn();

    // Setup default success responses
    mockSelect.eq = mockEq;
    mockInsert.select = mockSelect;
    mockInsert.single = mockSingle;
    mockEq.single = mockSingle;
    mockEq.order = mockOrder;
    mockEq.eq = mockEq;
    mockEq.contains = mockContains;
    mockContains.eq = mockEq;
    mockUpdate.eq = mockEq;
    mockDelete.eq = mockEq;

    consentService = new ConsentService(mockSupabaseClient as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("requestConsent", () => {
    it("should successfully request consent", async () => {
      // Mock patient lookup
      mockSingle.mockResolvedValueOnce({
        data: mockPatient,
        error: null,
      });

      // Mock consent record insert
      mockSingle.mockResolvedValueOnce({
        data: { id: "consent-123" },
        error: null,
      });

      const result = await consentService.requestConsent(
        "user-123",
        ["general-medical"] as MedicalDataClassification[],
        "telemedicine",
        "session-123",
      );

      expect(result).toBe(true);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("patients");
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("consent_records");
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          patient_id: "patient-123",
          clinic_id: "clinic-456",
          consent_type: "webrtc",
          purpose: "telemedicine",
          status: "pending",
          data_categories: ["general-medical"],
        }),
      );
    });

    it("should return false when patient not found", async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: "Patient not found" },
      });

      const result = await consentService.requestConsent(
        "invalid-user",
        ["general-medical"] as MedicalDataClassification[],
        "telemedicine",
        "session-123",
      );

      expect(result).toBe(false);
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it("should return false when insert fails", async () => {
      mockSingle.mockResolvedValueOnce({
        data: mockPatient,
        error: null,
      });

      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: "Insert failed" },
      });

      const result = await consentService.requestConsent(
        "user-123",
        ["general-medical"] as MedicalDataClassification[],
        "telemedicine",
        "session-123",
      );

      expect(result).toBe(false);
    });
  });

  describe("verifyConsent", () => {
    it("should verify valid consent", async () => {
      mockSingle.mockResolvedValueOnce({
        data: mockPatient,
        error: null,
      });

      mockSupabaseClient.rpc.mockResolvedValueOnce({
        data: true,
        error: null,
      });

      const result = await consentService.verifyConsent(
        "user-123",
        "general-medical",
        "session-123",
      );

      expect(result).toBe(true);
      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith(
        "validate_webrtc_consent",
        {
          p_patient_id: "patient-123",
          p_session_id: "session-123",
          p_data_types: ["general-medical"],
          p_clinic_id: "clinic-456",
        },
      );
    });

    it("should return false for invalid consent", async () => {
      mockSingle.mockResolvedValueOnce({
        data: mockPatient,
        error: null,
      });

      mockSupabaseClient.rpc.mockResolvedValueOnce({
        data: false,
        error: null,
      });

      const result = await consentService.verifyConsent(
        "user-123",
        "general-medical",
        "session-123",
      );

      expect(result).toBe(false);
    });

    it("should return false when patient not found", async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: "Patient not found" },
      });

      const result = await consentService.verifyConsent(
        "invalid-user",
        "general-medical",
        "session-123",
      );

      expect(result).toBe(false);
    });
  });

  describe("revokeConsent", () => {
    it("should successfully revoke consent", async () => {
      mockSingle.mockResolvedValueOnce({
        data: mockPatient,
        error: null,
      });

      mockUpdate.mockResolvedValueOnce({
        error: null,
      });

      mockSupabaseClient.rpc.mockResolvedValueOnce({
        data: "audit-123",
        error: null,
      });

      await expect(
        consentService.revokeConsent(
          "user-123",
          "general-medical",
          "session-123",
          "User request",
        ),
      ).resolves.not.toThrow();

      expect(mockSupabaseClient.from).toHaveBeenCalledWith("consent_records");
      expect(mockUpdate).toHaveBeenCalledWith({
        status: "withdrawn",
        withdrawn_at: expect.any(String),
        withdrawn_reason: "User request",
        updated_at: expect.any(String),
      });
    });

    it("should throw error when patient not found", async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: "Patient not found" },
      });

      await expect(
        consentService.revokeConsent(
          "invalid-user",
          "general-medical",
          "session-123",
        ),
      ).rejects.toThrow("Patient not found for user");
    });

    it("should throw error when update fails", async () => {
      mockSingle.mockResolvedValueOnce({
        data: mockPatient,
        error: null,
      });

      mockUpdate.mockResolvedValueOnce({
        error: { message: "Update failed" },
      });

      await expect(
        consentService.revokeConsent(
          "user-123",
          "general-medical",
          "session-123",
        ),
      ).rejects.toThrow("Failed to revoke consent: Update failed");
    });
  });

  describe("getConsentHistory", () => {
    it("should return consent history", async () => {
      mockSingle.mockResolvedValueOnce({
        data: mockPatient,
        error: null,
      });

      mockOrder.mockResolvedValueOnce({
        data: [mockAuditLog],
        error: null,
      });

      const result = await consentService.getConsentHistory("user-123");

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: "audit-123",
        sessionId: "session-123",
        eventType: "consent-given",
        userId: "user-123",
        userRole: "patient",
        dataClassification: "general-medical",
      });
    });

    it("should return empty array when patient not found", async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: "Patient not found" },
      });

      const result = await consentService.getConsentHistory("invalid-user");

      expect(result).toEqual([]);
    });

    it("should return empty array when query fails", async () => {
      mockSingle.mockResolvedValueOnce({
        data: mockPatient,
        error: null,
      });

      mockOrder.mockResolvedValueOnce({
        data: null,
        error: { message: "Query failed" },
      });

      const result = await consentService.getConsentHistory("user-123");

      expect(result).toEqual([]);
    });
  });

  describe("exportUserData", () => {
    it("should export user data successfully", async () => {
      mockSingle.mockResolvedValueOnce({
        data: mockPatient,
        error: null,
      });

      // Mock consent records query
      mockSelect.mockReturnValueOnce({
        eq: vi.fn().mockResolvedValueOnce({
          data: [mockConsentRecord],
          error: null,
        }),
      });

      // Mock audit logs queries
      mockSelect.mockReturnValueOnce({
        eq: vi.fn().mockResolvedValueOnce({
          data: [mockAuditLog],
          error: null,
        }),
      });

      mockSelect.mockReturnValueOnce({
        eq: vi.fn().mockResolvedValueOnce({
          data: [mockAuditLog],
          error: null,
        }),
      });

      const result = await consentService.exportUserData("user-123");

      expect(result).toMatchObject({
        exportDate: expect.any(String),
        patient: mockPatient,
        consentRecords: [mockConsentRecord],
        webrtcAuditLogs: [mockAuditLog],
        generalAuditLogs: [mockAuditLog],
        note: "This export contains all personal data processed by NeonPro according to LGPD requirements.",
      });
    });

    it("should throw error when patient not found", async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: "Patient not found" },
      });

      await expect(
        consentService.exportUserData("invalid-user"),
      ).rejects.toThrow("Patient not found for user");
    });
  });

  describe("deleteUserData", () => {
    it("should delete specific session data", async () => {
      mockSingle.mockResolvedValueOnce({
        data: mockPatient,
        error: null,
      });

      mockDelete.mockResolvedValueOnce({ error: null });
      mockDelete.mockResolvedValueOnce({ error: null });
      mockSupabaseClient.rpc.mockResolvedValueOnce({
        data: "audit-123",
        error: null,
      });

      await expect(
        consentService.deleteUserData("user-123", "session-123"),
      ).resolves.not.toThrow();

      expect(mockDelete).toHaveBeenCalledTimes(2); // consent_records and webrtc_audit_logs
      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith(
        "create_webrtc_audit_log",
        expect.any(Object),
      );
    });

    it("should delete all user data when no session specified", async () => {
      mockSingle.mockResolvedValueOnce({
        data: mockPatient,
        error: null,
      });

      mockDelete.mockResolvedValueOnce({ error: null });
      mockDelete.mockResolvedValueOnce({ error: null });
      mockSupabaseClient.rpc.mockResolvedValueOnce({
        data: "audit-123",
        error: null,
      });

      await expect(
        consentService.deleteUserData("user-123"),
      ).resolves.not.toThrow();

      expect(mockDelete).toHaveBeenCalledTimes(2);
    });

    it("should throw error when patient not found", async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: "Patient not found" },
      });

      await expect(
        consentService.deleteUserData("invalid-user"),
      ).rejects.toThrow("Patient not found for user");
    });
  });

  describe("grantConsent", () => {
    it("should grant consent successfully", async () => {
      mockUpdate.mockResolvedValueOnce({
        error: null,
      });

      const result = await consentService.grantConsent(
        "patient-123",
        "consent-123",
      );

      expect(result).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith({
        status: "granted",
        granted_at: expect.any(String),
        updated_at: expect.any(String),
      });
    });

    it("should return false when update fails", async () => {
      mockUpdate.mockResolvedValueOnce({
        error: { message: "Update failed" },
      });

      const result = await consentService.grantConsent(
        "patient-123",
        "consent-123",
      );

      expect(result).toBe(false);
    });
  });

  describe("getPendingConsents", () => {
    it("should return pending consents", async () => {
      mockSingle.mockResolvedValueOnce({
        data: { id: "patient-123" },
        error: null,
      });

      mockOrder.mockResolvedValueOnce({
        data: [mockConsentRecord],
        error: null,
      });

      const result = await consentService.getPendingConsents("user-123");

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: "consent-123",
        patientId: "patient-123",
        purpose: "telemedicine",
        status: "granted",
      });
    });

    it("should return empty array when patient not found", async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: "Patient not found" },
      });

      const result = await consentService.getPendingConsents("invalid-user");

      expect(result).toEqual([]);
    });

    it("should return empty array when query fails", async () => {
      mockSingle.mockResolvedValueOnce({
        data: { id: "patient-123" },
        error: null,
      });

      mockOrder.mockResolvedValueOnce({
        data: null,
        error: { message: "Query failed" },
      });

      const result = await consentService.getPendingConsents("user-123");

      expect(result).toEqual([]);
    });
  });

  describe("error handling", () => {
    it("should handle network errors gracefully", async () => {
      mockSingle.mockRejectedValueOnce(new Error("Network error"));

      const result = await consentService.verifyConsent(
        "user-123",
        "general-medical",
        "session-123",
      );

      expect(result).toBe(false);
    });

    it("should handle database errors gracefully", async () => {
      mockSingle.mockResolvedValueOnce({
        data: mockPatient,
        error: null,
      });

      mockSupabaseClient.rpc.mockRejectedValueOnce(
        new Error("Database connection failed"),
      );

      const result = await consentService.verifyConsent(
        "user-123",
        "general-medical",
        "session-123",
      );

      expect(result).toBe(false);
    });
  });
});
