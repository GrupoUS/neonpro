import { describe, it, expect, beforeEach, vi } from "vitest";
import { ConsentService } from "../consent-service";
import type { Database } from "../../types/supabase";
import type { MedicalDataClassification } from "../../types/consent";

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn(),
  rpc: vi.fn(),
};

describe("ConsentService", () => {
  let consentService: ConsentService;

  beforeEach(() => {
    vi.clearAllMocks();
    consentService = new ConsentService(
      mockSupabaseClient as any as Database["public"]
    );
  });

  describe("requestConsent", () => {
    it("should successfully request consent", async () => {
      // Mock patient lookup chain
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: "patient-123", clinic_id: "clinic-456" },
              error: null,
            }),
          }),
        }),
      });

      // Mock consent record insertion chain
      mockSupabaseClient.from.mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: "consent-123" },
              error: null,
            }),
          }),
        }),
      });

      const result = await consentService.requestConsent(
        "user-123",
        ["general-medical"],
        "telemedicine",
        "session-456"
      );

      expect(result).toBe(true);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("patients");
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("consent_records");
    });

    it("should return false when patient not found", async () => {
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Patient not found" },
            }),
          }),
        }),
      });

      const result = await consentService.requestConsent(
        "invalid-user",
        ["general-medical"],
        "telemedicine"
      );

      expect(result).toBe(false);
    });

    it("should return false when insert fails", async () => {
      // Mock patient lookup success
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: "patient-123", clinic_id: "clinic-456" },
              error: null,
            }),
          }),
        }),
      });

      // Mock consent record insertion failure
      mockSupabaseClient.from.mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Insert failed" },
            }),
          }),
        }),
      });

      const result = await consentService.requestConsent(
        "user-123",
        ["general-medical"],
        "telemedicine"
      );

      expect(result).toBe(false);
    });
  });

  describe("verifyConsent", () => {
    it("should verify valid consent", async () => {
      // Mock patient lookup
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: "patient-123", clinic_id: "clinic-456" },
              error: null,
            }),
          }),
        }),
      });

      // Mock RPC call
      mockSupabaseClient.rpc.mockResolvedValueOnce({
        data: true,
        error: null,
      });

      const result = await consentService.verifyConsent(
        "user-123",
        "general-medical",
        "telemedicine"
      );

      expect(result).toBe(true);
      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith(
        "validate_webrtc_consent",
        {
          p_patient_id: "patient-123",
          p_session_id: "telemedicine",
          p_data_types: ["general-medical"],
          p_clinic_id: "clinic-456",
        }
      );
    });

    it("should return false for invalid consent", async () => {
      // Mock patient lookup
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: "patient-123", clinic_id: "clinic-456" },
              error: null,
            }),
          }),
        }),
      });

      // Mock RPC call returning false
      mockSupabaseClient.rpc.mockResolvedValueOnce({
        data: false,
        error: null,
      });

      const result = await consentService.verifyConsent(
        "user-123",
        "general-medical",
        "telemedicine"
      );

      expect(result).toBe(false);
    });

    it("should return false when patient not found", async () => {
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Patient not found" },
            }),
          }),
        }),
      });

      const result = await consentService.verifyConsent(
        "invalid-user",
        "general-medical",
        "telemedicine"
      );

      expect(result).toBe(false);
    });

    it("should return false when RPC call fails", async () => {
      // Mock patient lookup
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: "patient-123", clinic_id: "clinic-456" },
              error: null,
            }),
          }),
        }),
      });

      // Mock RPC call failure - return proper structure with error
      mockSupabaseClient.rpc.mockResolvedValueOnce({
        data: null,
        error: { message: "RPC failed" },
      });

      const result = await consentService.verifyConsent(
        "user-123",
        "general-medical",
        "telemedicine"
      );

      expect(result).toBe(false);
    });
  });

  describe("revokeConsent", () => {
    it("should successfully revoke consent", async () => {
      // Mock patient lookup
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: "patient-123", clinic_id: "clinic-456" },
              error: null,
            }),
          }),
        }),
      });

      // Mock update operation with proper chain: update().eq().contains().eq()
      const mockEq2 = vi.fn().mockResolvedValue({
        data: [{ id: "consent-123" }],
        error: null,
      });
      const mockContains = vi.fn().mockReturnValue({
        eq: mockEq2,
      });
      const mockEq1 = vi.fn().mockReturnValue({
        contains: mockContains,
      });
      const mockUpdate = vi.fn().mockReturnValue({
        eq: mockEq1,
      });

      mockSupabaseClient.from.mockReturnValueOnce({
        update: mockUpdate,
      });

      // Mock RPC call for audit log
      mockSupabaseClient.rpc.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      // revokeConsent signature: (userId, dataType, sessionId, reason?)
      await expect(
        consentService.revokeConsent(
          "user-123",
          "general-medical",
          "session-456",
          "User requested"
        )
      ).resolves.toBeUndefined();
    });

    it("should throw error when patient not found", async () => {
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Patient not found" },
            }),
          }),
        }),
      });

      await expect(
        consentService.revokeConsent("invalid-user", "general-medical", "session-456")
      ).rejects.toThrow("Patient not found for user");
    });

    it("should throw error when update fails", async () => {
      // Mock patient lookup success
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: "patient-123", clinic_id: "clinic-456" },
              error: null,
            }),
          }),
        }),
      });

      // Mock update failure with proper chain
      const mockEq2 = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "Update failed" },
      });
      const mockContains = vi.fn().mockReturnValue({
        eq: mockEq2,
      });
      const mockEq1 = vi.fn().mockReturnValue({
        contains: mockContains,
      });
      const mockUpdate = vi.fn().mockReturnValue({
        eq: mockEq1,
      });

      mockSupabaseClient.from.mockReturnValueOnce({
        update: mockUpdate,
      });

      await expect(
        consentService.revokeConsent("user-123", "general-medical", "session-456")
      ).rejects.toThrow("Failed to revoke consent");
    });
  });

  describe("getConsentHistory", () => {
    it("should return consent history", async () => {
      // Mock patient lookup
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: "patient-123" },
              error: null,
            }),
          }),
        }),
      });

      // Mock consent history query
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [
                {
                  id: "consent-123",
                  status: "active",
                  data_types: ["general-medical"],
                  purpose: "telemedicine",
                  created_at: "2024-01-01T00:00:00Z",
                },
              ],
              error: null,
            }),
          }),
        }),
      });

      const result = await consentService.getConsentHistory("user-123");

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("consent-123");
    });

    it("should throw error when patient not found", async () => {
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Patient not found" },
            }),
          }),
        }),
      });

      await expect(
        consentService.getConsentHistory("invalid-user")
      ).rejects.toThrow("Patient not found");
    });

    it("should throw error when query fails", async () => {
      // Mock patient lookup success
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: "patient-123" },
              error: null,
            }),
          }),
        }),
      });

      // Mock query failure
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Query failed" },
            }),
          }),
        }),
      });

      await expect(
        consentService.getConsentHistory("user-123")
      ).rejects.toThrow("Failed to get consent history");
    });
  });

  describe("exportUserData", () => {
    it("should export user data", async () => {
      // Mock patient lookup
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: "patient-123" },
              error: null,
            }),
          }),
        }),
      });

      // Mock consent data query
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [
                {
                  id: "consent-123",
                  status: "active",
                  data_types: ["general-medical"],
                  purpose: "telemedicine",
                  created_at: "2024-01-01T00:00:00Z",
                },
              ],
              error: null,
            }),
          }),
        }),
      });

      const result = await consentService.exportUserData("user-123");

      expect(result).toHaveProperty("consents");
      expect(result.consents).toHaveLength(1);
    });

    it("should throw error when patient not found", async () => {
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Patient not found" },
            }),
          }),
        }),
      });

      await expect(
        consentService.exportUserData("invalid-user")
      ).rejects.toThrow("Patient not found");
    });

    it("should throw error when query fails", async () => {
      // Mock patient lookup success
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: "patient-123" },
              error: null,
            }),
          }),
        }),
      });

      // Mock query failure
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Query failed" },
            }),
          }),
        }),
      });

      await expect(
        consentService.exportUserData("user-123")
      ).rejects.toThrow("Failed to export user data");
    });
  });

  describe("deleteUserData", () => {
    it("should delete user data", async () => {
      // Mock patient lookup
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: "patient-123" },
              error: null,
            }),
          }),
        }),
      });

      // Mock delete operation
      mockSupabaseClient.from.mockReturnValueOnce({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      });

      const result = await consentService.deleteUserData("user-123");

      expect(result).toBe(true);
    });

    it("should throw error when patient not found", async () => {
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Patient not found" },
            }),
          }),
        }),
      });

      await expect(
        consentService.deleteUserData("invalid-user")
      ).rejects.toThrow("Patient not found");
    });

    it("should throw error when delete fails", async () => {
      // Mock patient lookup success
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: "patient-123" },
              error: null,
            }),
          }),
        }),
      });

      // Mock delete failure
      mockSupabaseClient.from.mockReturnValueOnce({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "Delete failed" },
          }),
        }),
      });

      await expect(
        consentService.deleteUserData("user-123")
      ).rejects.toThrow("Failed to delete user data");
    });
  });

  describe("grantConsent", () => {
    it("should grant consent successfully", async () => {
      // Mock update operation - grantConsent doesn't look up patient first
      mockSupabaseClient.from.mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [{ id: "consent-123" }],
              error: null,
            }),
          }),
        }),
      });

      const result = await consentService.grantConsent(
        "patient-123",
        "consent-123"
      );

      expect(result).toBe(true);
    });

    it("should return false when update fails", async () => {
      // Mock update failure
      mockSupabaseClient.from.mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Update failed" },
            }),
          }),
        }),
      });

      const result = await consentService.grantConsent(
        "patient-123",
        "consent-123"
      );

      expect(result).toBe(false);
    });

    it("should return false on exception", async () => {
      // Mock exception
      mockSupabaseClient.from.mockImplementationOnce(() => {
        throw new Error("Network error");
      });

      const result = await consentService.grantConsent(
        "patient-123",
        "consent-123"
      );

      expect(result).toBe(false);
    });
  });

  describe("getPendingConsents", () => {
    it("should return pending consents", async () => {
      // Mock patient lookup
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: "patient-123" },
              error: null,
            }),
          }),
        }),
      });

      // Mock pending consents query - need to chain .eq() twice
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [
                  {
                    id: "consent-123",
                    status: "pending",
                    data_types: ["general-medical"],
                    purpose: "telemedicine",
                    created_at: "2024-01-01T00:00:00Z",
                  },
                ],
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await consentService.getPendingConsents("user-123");

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe("pending");
    });

    it("should return empty array when patient not found", async () => {
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Patient not found" },
            }),
          }),
        }),
      });

      const result = await consentService.getPendingConsents("invalid-user");

      expect(result).toEqual([]);
    });

    it("should return empty array when query fails", async () => {
      // Mock patient lookup success
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: "patient-123" },
              error: null,
            }),
          }),
        }),
      });

      // Mock query failure - need to chain .eq() twice
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: null,
                error: { message: "Query failed" },
              }),
            }),
          }),
        }),
      });

      const result = await consentService.getPendingConsents("user-123");

      expect(result).toEqual([]);
    });
  });

  describe("error handling", () => {
    it("should handle network errors gracefully", async () => {
      // Mock network error - need to reject the promise, not throw
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockRejectedValue(new Error("Network error")),
          }),
        }),
      });

      const result = await consentService.verifyConsent(
        "user-123",
        "general-medical",
        "telemedicine"
      );

      expect(result).toBe(false);
    });
  });
});