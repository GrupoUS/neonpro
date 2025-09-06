/**
 * WhatsApp API Client Tests
 * Tests for WhatsApp Business API integration in @neonpro/shared
 */

import { beforeEach, describe, expect, it, type MockedFunction, vi } from "vitest";
import { createApiClient } from "../api-client";
import type {
  SendWhatsappMessageRequest,
  WhatsappConversationFilters,
  WhatsappMessageFilters,
} from "../types/whatsapp.types";

// Mock fetch globally
global.fetch = vi.fn() as unknown as typeof fetch;

describe("WhatsApp API Client", () => {
  let apiClient: ReturnType<typeof createApiClient>;
  const mockFetch = global.fetch as unknown as MockedFunction<typeof fetch>;

  beforeEach(() => {
    vi.clearAllMocks();
    apiClient = createApiClient({
      baseUrl: "https://api.test.com",
      enableAuditLogging: false,
    });

    // Mock token manager
    apiClient.auth.setTokens("mock-access-token", "mock-refresh-token", 3600, {
      id: "test-user",
      email: "test@example.com",
      role: "admin",
    });
  });

  describe("sendMessage", () => {
    it("should send WhatsApp message successfully", async () => {
      const mockResponse = {
        success: true,
        data: { messageId: "msg_123", status: "sent" },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const params: SendWhatsappMessageRequest = {
        to: "5511999999999",
        message: "Hello from NeonPro!",
        type: "text",
        clinicId: "clinic_123",
        patientId: "patient_456",
        messageType: "general",
      };

      const result = await apiClient.whatsapp.sendMessage(params);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.test.com/api/v1/whatsapp/send",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: "Bearer mock-access-token",
          }),
          body: JSON.stringify(params),
        }),
      );

      expect(result).toEqual(mockResponse);
    });

    it("should throw error on failed request", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      const params: SendWhatsappMessageRequest = {
        to: "5511999999999",
        message: "Hello from NeonPro!",
        type: "text",
        clinicId: "clinic_123",
        messageType: "general",
      };

      await expect(apiClient.whatsapp.sendMessage(params)).rejects.toThrow(
        "HTTP 400: Failed to send WhatsApp message",
      );
    });
  });

  describe("getMessages", () => {
    it("should get WhatsApp messages successfully", async () => {
      const mockResponse = {
        success: true,
        data: {
          messages: [
            {
              id: "msg_1",
              phoneNumber: "5511999999999",
              content: "Hello!",
              direction: "inbound",
              status: "read",
              timestamp: new Date().toISOString(),
            },
          ],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const params: WhatsappMessageFilters = {
        clinicId: "clinic_123",
        phoneNumber: "5511999999999",
        page: 1,
        limit: 10,
      };

      const result = await apiClient.whatsapp.getMessages(params);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/whatsapp/messages?"),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer mock-access-token",
          }),
        }),
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe("getConversations", () => {
    it("should get WhatsApp conversations successfully", async () => {
      const mockResponse = {
        success: true,
        data: {
          conversations: [
            {
              id: "conv_1",
              phoneNumber: "5511999999999",
              contactName: "João Silva",
              status: "active",
              messageCount: 5,
              unreadCount: 2,
              lastMessageAt: new Date().toISOString(),
            },
          ],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const params: WhatsappConversationFilters = {
        clinicId: "clinic_123",
        status: "active",
        page: 1,
        limit: 10,
      };

      const result = await apiClient.whatsapp.getConversations(params);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/whatsapp/conversations?"),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer mock-access-token",
          }),
        }),
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe("getConfig", () => {
    it("should get WhatsApp configuration successfully", async () => {
      const mockResponse = {
        success: true,
        data: {
          clinicId: "clinic_123",
          autoReply: true,
          autoReplyMessage: "Obrigado por entrar em contato!",
          isActive: true,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiClient.whatsapp.getConfig("clinic_123");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.test.com/api/v1/whatsapp/config/clinic_123",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer mock-access-token",
          }),
        }),
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe("checkHealth", () => {
    it("should check WhatsApp health successfully", async () => {
      const mockResponse = {
        success: true,
        data: {
          status: "healthy",
          timestamp: new Date().toISOString(),
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiClient.whatsapp.checkHealth();

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.test.com/api/v1/whatsapp/health",
      );

      expect(result).toEqual(mockResponse);
    });
  });
});
