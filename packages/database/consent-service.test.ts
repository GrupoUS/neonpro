import { describe, it, expect, beforeEach, vi } from "vitest";
import { ConsentService } from "../src/services/consent-service";
import type { SupabaseClient } from "@supabase/supabase-js";

// Create comprehensive mock for Supabase query builder
const createSupabaseQueryBuilder = () => {
  const queryBuilder = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    order: vi.fn().mockReturnThis(),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  };

  // Make all methods chainable and return promises for terminal operations
  Object.keys(queryBuilder).forEach(key => {
    if (key === 'single') {
      queryBuilder[key] = vi.fn().mockResolvedValue({ data: null, error: null }
    } else if (key === 'rpc') {
      queryBuilder[key] = vi.fn().mockResolvedValue({ data: null, error: null }
    } else {
      queryBuilder[key] = vi.fn().mockReturnValue(queryBuilder
    }
  }

  return queryBuilder;
};

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
  rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
} as unknown as SupabaseClient;

describe("ConsentService", () => {
  let consentService: ConsentService;
  let queryBuilder: ReturnType<typeof createSupabaseQueryBuilder>;

  beforeEach(() => {
    vi.clearAllMocks(
    queryBuilder = createSupabaseQueryBuilder(
    (mockSupabase.from as any).mockReturnValue(queryBuilder
    consentService = new ConsentService(mockSupabase
  }

  describe("requestConsent", () => {
    it(_"should request consent successfully",_async () => {
      queryBuilder.insert.mockResolvedValueOnce({ data: { id: "consent-1" }, error: null }

      const result = await consentService.requestConsent(
        "patient-1",
        "session-1",
        "video_call",
        "clinic-1"
      

      expect(result).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith("consent_records"
      expect(queryBuilder.insert).toHaveBeenCalledWith({
        patient_id: "patient-1",
        session_id: "session-1",
        consent_type: "video_call",
        status: "pending",
        clinic_id: "clinic-1",
        requested_at: expect.any(String),
      }
    }

    it(_"should handle request consent error",_async () => {
      queryBuilder.insert.mockResolvedValueOnce({ data: null, error: new Error("DB error") }

      const result = await consentService.requestConsent(
        "patient-1",
        "session-1",
        "video_call",
        "clinic-1"
      

      expect(result).toBe(false);
    }
  }

  describe("verifyConsent", () => {
    it(_"should verify consent successfully",_async () => {
      queryBuilder.eq.mockReturnThis(
      queryBuilder.single.mockResolvedValueOnce({
        data: { status: "granted" },
        error: null,
      }

      const result = await consentService.verifyConsent("patient-1", "session-1"

      expect(result).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith("consent_records"
      expect(queryBuilder.eq).toHaveBeenCalledWith("patient_id", "patient-1"
      expect(queryBuilder.eq).toHaveBeenCalledWith("session_id", "session-1"
    }

    it(_"should return false for non-granted consent",_async () => {
      queryBuilder.single.mockResolvedValueOnce({
        data: { status: "pending" },
        error: null,
      }

      const result = await consentService.verifyConsent("patient-1", "session-1"

      expect(result).toBe(false);
    }
  }

  describe("revokeConsent", () => {
    it(_"should revoke consent successfully",_async () => {
      queryBuilder.update.mockResolvedValueOnce({ data: {}, error: null }

      const result = await consentService.revokeConsent("patient-1", "session-1"

      expect(result).toBe(true);
      expect(queryBuilder.update).toHaveBeenCalledWith({
        status: "revoked",
        revoked_at: expect.any(String),
        updated_at: expect.any(String),
      }
    }

    it(_"should handle revoke consent error",_async () => {
      queryBuilder.update.mockResolvedValueOnce({ data: null, error: new Error("DB error") }

      const result = await consentService.revokeConsent("patient-1", "session-1"

      expect(result).toBe(false);
    }
  }

  describe("getConsentHistory", () => {
    it(_"should get consent history successfully",_async () => {
      const mockHistory = [
        { id: "1", status: "granted", created_at: "2023-01-01" },
        { id: "2", status: "revoked", created_at: "2023-01-02" },
      ];
      
      queryBuilder.order.mockResolvedValueOnce({ data: mockHistory, error: null }

      const result = await consentService.getConsentHistory("patient-1"

      expect(result).toEqual(mockHistory
      expect(mockSupabase.from).toHaveBeenCalledWith("consent_records"
      expect(queryBuilder.eq).toHaveBeenCalledWith("patient_id", "patient-1"
      expect(queryBuilder.order).toHaveBeenCalledWith("created_at", { ascending: false }
    }

    it(_"should handle get consent history error",_async () => {
      queryBuilder.order.mockResolvedValueOnce({ data: null, error: new Error("DB error") }

      const result = await consentService.getConsentHistory("patient-1"

      expect(result).toEqual([]
    }
  }

  describe("grantConsent", () => {
    it(_"should grant consent successfully",_async () => {
      // Mock the chained calls: update().eq().eq()
      const secondEqMock = vi.fn().mockResolvedValue({ data: {}, error: null }
      const firstEqMock = vi.fn().mockReturnValue({ eq: secondEqMock }
      queryBuilder.update.mockReturnValue({ eq: firstEqMock }

      const result = await consentService.grantConsent("consent-1", "patient-1"

      expect(result).toBe(true);
      expect(queryBuilder.update).toHaveBeenCalledWith({
        status: "granted",
        granted_at: expect.any(String),
        updated_at: expect.any(String),
      }
      expect(firstEqMock).toHaveBeenCalledWith("id", "consent-1"
      expect(secondEqMock).toHaveBeenCalledWith("patient_id", "patient-1"
    }

    it(_"should handle grant consent error",_async () => {
      const secondEqMock = vi.fn().mockResolvedValue({ data: null, error: new Error("DB error") }
      const firstEqMock = vi.fn().mockReturnValue({ eq: secondEqMock }
      queryBuilder.update.mockReturnValue({ eq: firstEqMock }

      const result = await consentService.grantConsent("consent-1", "patient-1"

      expect(result).toBe(false);
    }
  }

  describe("getPendingConsents", () => {
    it(_"should get pending consents successfully",_async () => {
      const mockConsents = [
        { id: "1", status: "pending", created_at: "2023-01-01" },
        { id: "2", status: "pending", created_at: "2023-01-02" },
      ];
      
      queryBuilder.order.mockResolvedValueOnce({ data: mockConsents, error: null }

      const result = await consentService.getPendingConsents("patient-1"

      expect(result).toEqual(mockConsents
      expect(mockSupabase.from).toHaveBeenCalledWith("consent_records"
      expect(queryBuilder.eq).toHaveBeenCalledWith("patient_id", "patient-1"
      expect(queryBuilder.eq).toHaveBeenCalledWith("status", "pending"
      expect(queryBuilder.order).toHaveBeenCalledWith("created_at", { ascending: false }
    }

    it(_"should handle get pending consents error",_async () => {
      queryBuilder.order.mockResolvedValueOnce({ data: null, error: new Error("DB error") }

      const result = await consentService.getPendingConsents("patient-1"

      expect(result).toEqual([]
    }
  }

  describe("exportUserData", () => {
    it(_"should export user data successfully",_async () => {
      const mockPatient = { id: "patient-1", user_id: "user-1", name: "John Doe" };
      const mockConsentRecords = [{ id: "consent-1", status: "granted" }];
      const mockWebrtcLogs = [{ id: "log-1", event_type: "call_started" }];
      const mockAuditLogs = [{ id: "audit-1", action: "login" }];

      // Mock patients table query
      const patientsQueryBuilder = createSupabaseQueryBuilder(
      patientsQueryBuilder.single.mockResolvedValueOnce({ data: mockPatient, error: null }

      // Mock consent_records table query
      const consentQueryBuilder = createSupabaseQueryBuilder(
      consentQueryBuilder.eq.mockResolvedValueOnce({ data: mockConsentRecords, error: null }

      // Mock webrtc_audit_logs table query
      const webrtcQueryBuilder = createSupabaseQueryBuilder(
      webrtcQueryBuilder.eq.mockResolvedValueOnce({ data: mockWebrtcLogs, error: null }

      // Mock audit_logs table query
      const auditQueryBuilder = createSupabaseQueryBuilder(
      auditQueryBuilder.eq.mockResolvedValueOnce({ data: mockAuditLogs, error: null }

      // Setup from() to return appropriate query builder based on table
      (mockSupabase.from as any).mockImplementation((table: string) => {
        switch (table) {
          case "patients": return patientsQueryBuilder;
          case "consent_records": return consentQueryBuilder;
          case "webrtc_audit_logs": return webrtcQueryBuilder;
          case "audit_logs": return auditQueryBuilder;
          default: return queryBuilder;
        }
      }

      const result = await consentService.exportUserData("user-1"

      expect(result).toEqual({
        exportDate: expect.any(String),
        patient: mockPatient,
        consentRecords: mockConsentRecords,
        webrtcAuditLogs: mockWebrtcLogs,
        generalAuditLogs: mockAuditLogs,
        note: "This export contains all personal data processed by NeonPro according to LGPD requirements.",
      }

      expect(mockSupabase.from).toHaveBeenCalledWith("patients"
      expect(mockSupabase.from).toHaveBeenCalledWith("consent_records"
      expect(mockSupabase.from).toHaveBeenCalledWith("webrtc_audit_logs"
      expect(mockSupabase.from).toHaveBeenCalledWith("audit_logs"
    }

    it(_"should handle export user data error when patient not found",_async () => {
      const patientsQueryBuilder = createSupabaseQueryBuilder(
      patientsQueryBuilder.single.mockResolvedValueOnce({ data: null, error: new Error("Not found") }
      
      (mockSupabase.from as any).mockReturnValue(patientsQueryBuilder

      await expect(consentService.exportUserData("user-1")).rejects.toThrow("Patient not found for user"
    }
  }

  describe("deleteUserData", () => {
    it(_"should delete user data successfully",_async () => {
      const mockPatient = { id: "patient-1", clinic_id: "clinic-1" };

      // Mock patients table query
      const patientsQueryBuilder = createSupabaseQueryBuilder(
      patientsQueryBuilder.single.mockResolvedValueOnce({ data: mockPatient, error: null }

      // Mock delete operations
      const deleteQueryBuilder = createSupabaseQueryBuilder(
      deleteQueryBuilder.delete.mockReturnThis(
      deleteQueryBuilder.eq.mockResolvedValueOnce({ data: {}, error: null }

      // Setup from() to return appropriate query builder
      (mockSupabase.from as any).mockImplementation((table: string) => {
        if (table === "patients") return patientsQueryBuilder;
        return deleteQueryBuilder;
      }

      // Mock RPC call
      (mockSupabase.rpc as any).mockResolvedValueOnce({ data: null, error: null }

      await consentService.deleteUserData("user-1"

      expect(mockSupabase.from).toHaveBeenCalledWith("patients"
      expect(mockSupabase.from).toHaveBeenCalledWith("consent_records"
      expect(mockSupabase.from).toHaveBeenCalledWith("webrtc_audit_logs"
      expect(mockSupabase.rpc).toHaveBeenCalledWith("create_webrtc_audit_log", expect.any(Object)
    }

    it(_"should delete session-specific user data successfully",_async () => {
      const mockPatient = { id: "patient-1", clinic_id: "clinic-1" };

      // Mock patients table query
      const patientsQueryBuilder = createSupabaseQueryBuilder(
      patientsQueryBuilder.single.mockResolvedValueOnce({ data: mockPatient, error: null }

      // Mock delete operations with session-specific eq calls
      const deleteQueryBuilder = createSupabaseQueryBuilder(
      deleteQueryBuilder.delete.mockReturnThis(
      const secondEqMock = vi.fn().mockResolvedValue({ data: {}, error: null }
      const firstEqMock = vi.fn().mockReturnValue({ eq: secondEqMock }
      deleteQueryBuilder.eq.mockReturnValue(firstEqMock

      // Setup from() to return appropriate query builder
      (mockSupabase.from as any).mockImplementation((table: string) => {
        if (table === "patients") return patientsQueryBuilder;
        return deleteQueryBuilder;
      }

      // Mock RPC call
      (mockSupabase.rpc as any).mockResolvedValueOnce({ data: null, error: null }

      await consentService.deleteUserData("user-1", "session-1"

      expect(mockSupabase.from).toHaveBeenCalledWith("patients"
      expect(mockSupabase.from).toHaveBeenCalledWith("consent_records"
      expect(mockSupabase.from).toHaveBeenCalledWith("webrtc_audit_logs"
      expect(mockSupabase.rpc).toHaveBeenCalledWith("create_webrtc_audit_log", expect.any(Object)
    }

    it(_"should handle delete user data error when patient not found",_async () => {
      const patientsQueryBuilder = createSupabaseQueryBuilder(
      patientsQueryBuilder.single.mockResolvedValueOnce({ data: null, error: new Error("Not found") }
      
      (mockSupabase.from as any).mockReturnValue(patientsQueryBuilder

      await expect(consentService.deleteUserData("user-1")).rejects.toThrow("Patient not found for user"
    }
  }
}