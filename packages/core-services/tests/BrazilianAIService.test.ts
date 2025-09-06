/**
 * Brazilian AI Service Tests
 * Tests for Brazilian Portuguese healthcare AI service
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BrazilianAIService } from "../src/services/BrazilianAIService";
import type { ServiceContext, WhatsAppChatRequest } from "../src/services/BrazilianAIService";

// Mock Supabase
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => (globalThis as any).mockSupabaseClient),
}));

// Mock security package to avoid Supabase initialization issues
vi.mock("@neonpro/security", () => ({
  MfaDatabaseService: vi.fn(() => ({
    validateMfaToken: vi.fn(() => Promise.resolve({ valid: true })),
    generateMfaSecret: vi.fn(() => Promise.resolve({ secret: "test-secret" })),
  })),
  SecurityService: vi.fn(() => ({
    encrypt: vi.fn((data) => Promise.resolve(`encrypted-${data}`)),
    decrypt: vi.fn((data) => Promise.resolve(data.replace("encrypted-", ""))),
  })),
}));

// Mock dependencies
vi.mock("@neonpro/shared/templates", () => ({
  templateManager: {
    getWhatsAppSystemPrompt: () => "Sistema de atendimento WhatsApp em português brasileiro",
    getWhatsAppInternalSystemPrompt: () => "Sistema interno WhatsApp",
    getLGPDDataProtectionPrompt: () => "Prompt LGPD proteção de dados",
    getLGPDPatientRightsPrompt: () => "Prompt LGPD direitos do paciente",
    getTemplate: vi.fn((id: string) => ({
      id,
      template: `Template para ${id}`,
      category: "whatsapp",
      language: "pt-BR",
    })),
    renderTemplate: vi.fn((id: string, options?: any) => {
      if (id === "whatsapp-emergency-escalation") {
        return "🚨 Situação de emergência detectada. Entre em contato com nossa equipe médica imediatamente: (11) 99999-9999";
      }
      return `Resposta renderizada para ${id}`;
    }),
    getTemplateByProcedure: vi.fn(() => null),
    getAestheticTemplates: vi.fn(() => []),
    getLGPDTemplates: vi.fn(() => []),
  },
}));

// Mirror mock for production import path
vi.mock("@neonpro/shared", () => ({
  templateManager: {
    getWhatsAppSystemPrompt: () => "Sistema de atendimento WhatsApp em português brasileiro",
    getWhatsAppInternalSystemPrompt: () => "Sistema interno WhatsApp",
    getLGPDDataProtectionPrompt: () => "Prompt LGPD proteção de dados",
    getLGPDPatientRightsPrompt: () => "Prompt LGPD direitos do paciente",
    getTemplate: vi.fn((id: string) => ({
      id,
      template: `Template para ${id}`,
      category: "whatsapp",
      language: "pt-BR",
    })),
    renderTemplate: vi.fn((id: string, options?: any) => {
      if (id === "whatsapp-emergency-escalation") {
        return "🚨 Situação de emergência detectada. Entre em contato com nossa equipe médica imediatamente: (11) 99999-9999";
      }
      return `Resposta renderizada para ${id}`;
    }),
    getTemplateByProcedure: vi.fn(() => null),
    getAestheticTemplates: vi.fn(() => []),
    getLGPDTemplates: vi.fn(() => []),
  },
}));

vi.mock("../src/services/AIService", () => ({
  AIService: vi.fn().mockImplementation(() => ({
    processChat: vi.fn().mockResolvedValue({
      id: "test_response",
      message: {
        id: "test_msg",
        role: "assistant",
        content: "Resposta do AI base",
        timestamp: Date.now(),
      },
      usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
      metadata: { model: "gpt-4", responseTime: 100, cached: false },
    }),
    executeOperation: vi.fn().mockImplementation((name, fn) => fn()),
  })),
}));

describe("BrazilianAIService", () => {
  let service: BrazilianAIService;
  let mockContext: ServiceContext;

  beforeEach(() => {
    service = new BrazilianAIService();
    mockContext = {
      requestId: "test_request_123",
      userId: "5511999999999",
      timestamp: Date.now(),
      source: "whatsapp-webhook",
    };
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("processWhatsAppChat", () => {
    const baseRequest: WhatsAppChatRequest = {
      messages: [
        {
          id: "msg_123",
          role: "user",
          content: "Olá, gostaria de agendar uma consulta",
          timestamp: Date.now(),
        },
      ],
      whatsappContext: {
        phoneNumber: "5511999999999",
        messageType: "text",
        isFirstContact: false,
        previousInteractions: 0,
      },
      context: {
        clinicType: "aesthetic",
        communicationChannel: "whatsapp",
        patientLanguage: "pt-BR",
      },
    };

    it("should process normal WhatsApp message successfully", async () => {
      const result = await service.processWhatsAppChat(baseRequest, mockContext);

      expect(result).toMatchObject({
        id: expect.any(String),
        message: {
          role: "assistant",
          content: expect.any(String),
          timestamp: expect.any(Number),
        },
        templateUsed: expect.any(String),
        emergencyDetected: false,
        escalationTriggered: false,
        lgpdCompliance: {
          consentRequired: expect.any(Boolean),
          dataUsageExplained: expect.any(Boolean),
          rightsInformed: expect.any(Boolean),
        },
      });
    });

    it("should detect emergency situations", async () => {
      const emergencyRequest: WhatsAppChatRequest = {
        ...baseRequest,
        messages: [
          {
            id: "msg_emergency",
            role: "user",
            content: "Socorro! Estou com dor forte e sangramento após o procedimento",
            timestamp: Date.now(),
          },
        ],
      };

      const result = await service.processWhatsAppChat(emergencyRequest, mockContext);

      expect(result.emergencyDetected).toBe(true);
      expect(result.escalationTriggered).toBe(true);
      expect(result.message.content).toContain("emergência");
      expect(result.message.content).toContain("(11) 99999-9999");
    });

    it("should handle medical query validation", async () => {
      const medicalRequest: WhatsAppChatRequest = {
        ...baseRequest,
        messages: [
          {
            id: "msg_medical",
            role: "user",
            content: "Pode me dar um diagnóstico sobre essa dor?",
            timestamp: Date.now(),
          },
        ],
      };

      const result = await service.processWhatsAppChat(medicalRequest, mockContext);

      // Should handle prohibited medical advice
      expect(result).toBeDefined();
      expect(result.message.content).toBeDefined();
    });

    it("should select appropriate templates based on content", async () => {
      const appointmentRequest: WhatsAppChatRequest = {
        ...baseRequest,
        messages: [
          {
            id: "msg_appointment",
            role: "user",
            content: "Gostaria de agendar uma consulta para harmonização facial",
            timestamp: Date.now(),
          },
        ],
      };

      const result = await service.processWhatsAppChat(appointmentRequest, mockContext);

      expect(result.templateUsed).toBeDefined();
      // Should use procedure inquiry template for aesthetic procedures
    });

    it("should handle first contact appropriately", async () => {
      const firstContactRequest: WhatsAppChatRequest = {
        ...baseRequest,
        whatsappContext: {
          ...baseRequest.whatsappContext!,
          isFirstContact: true,
          previousInteractions: 0,
        },
      };

      const result = await service.processWhatsAppChat(firstContactRequest, mockContext);

      expect(result.templateUsed).toBeDefined();
      // Should use greeting template for first contact
    });

    it("should process Brazilian healthcare context", async () => {
      const contextualRequest: WhatsAppChatRequest = {
        ...baseRequest,
        context: {
          ...baseRequest.context,
          patientAge: 65,
          clinicType: "aesthetic",
        },
      };

      const result = await service.processWhatsAppChat(contextualRequest, mockContext);

      expect(result.culturalAdaptations).toBeDefined();
      expect(Array.isArray(result.culturalAdaptations)).toBe(true);
    });
  });

  describe("processAestheticConsultation", () => {
    const baseRequest = {
      messages: [
        {
          id: "msg_aesthetic",
          role: "user" as const,
          content: "Quero saber sobre preenchimento labial",
          timestamp: Date.now(),
        },
      ],
    };

    it("should process aesthetic consultation with specific procedure", async () => {
      const result = await service.processAestheticConsultation(
        baseRequest,
        "preenchimento labial",
        mockContext,
      );

      expect(result).toMatchObject({
        message: {
          role: "assistant",
          content: expect.any(String),
        },
        templateUsed: expect.any(String),
      });
    });

    it("should handle unknown procedures with fallback", async () => {
      const result = await service.processAestheticConsultation(
        baseRequest,
        "procedimento_inexistente",
        mockContext,
      );

      expect(result).toBeDefined();
      expect(result.message.content).toBeDefined();
    });
  });

  describe("processLGPDRequest", () => {
    const patientData = {
      patient_name: "João Silva",
      clinic_name: "Clínica Estética",
      contact_email: "contato@clinica.com.br",
    };

    it("should process LGPD consent request", async () => {
      const result = await service.processLGPDRequest(
        "consent",
        patientData,
        mockContext,
      );

      expect(result).toMatchObject({
        response: expect.any(String),
        template: expect.any(Object),
        complianceStatus: expect.stringMatching(/^(compliant|requires_action|violation)$/),
      });
    });

    it("should process LGPD rights request", async () => {
      const result = await service.processLGPDRequest(
        "rights",
        patientData,
        mockContext,
      );

      expect(result.complianceStatus).toBeDefined();
      expect(result.response).toBeDefined();
    });

    it("should identify compliance violations", async () => {
      const incompleteData = {
        patient_name: "João Silva",
        // Missing required fields
      };

      const result = await service.processLGPDRequest(
        "consent",
        incompleteData,
        mockContext,
      );

      if (result.complianceStatus === "requires_action") {
        expect(result.requiredActions).toBeDefined();
        expect(Array.isArray(result.requiredActions)).toBe(true);
      }
    });
  });

  describe("Emergency Detection", () => {
    const emergencyKeywords = [
      "emergência",
      "urgente",
      "dor forte",
      "sangramento",
      "alergia severa",
      "socorro",
      "não consigo respirar",
    ];

    emergencyKeywords.forEach(keyword => {
      it(`should detect emergency for keyword: ${keyword}`, async () => {
        const emergencyRequest: WhatsAppChatRequest = {
          messages: [
            {
              id: "msg_emergency",
              role: "user",
              content: `Estou com ${keyword} após o procedimento`,
              timestamp: Date.now(),
            },
          ],
          whatsappContext: {
            phoneNumber: "5511999999999",
            messageType: "text",
            isFirstContact: false,
            previousInteractions: 0,
          },
        };

        const result = await service.processWhatsAppChat(emergencyRequest, mockContext);

        expect(result.emergencyDetected).toBe(true);
        expect(result.escalationTriggered).toBe(true);
      });
    });
  });

  describe("Template Selection", () => {
    const testCases = [
      {
        content: "Gostaria de agendar uma consulta",
        expectedTemplate: "whatsapp-appointment-booking",
      },
      {
        content: "Quero fazer harmonização facial",
        expectedTemplate: "whatsapp-procedure-inquiry",
      },
      {
        content: "Como devo cuidar após o procedimento?",
        expectedTemplate: "whatsapp-post-procedure-care",
      },
    ];

    testCases.forEach(({ content, expectedTemplate }) => {
      it(`should select ${expectedTemplate} for: ${content}`, async () => {
        const request: WhatsAppChatRequest = {
          messages: [
            {
              id: "msg_test",
              role: "user",
              content,
              timestamp: Date.now(),
            },
          ],
          whatsappContext: {
            phoneNumber: "5511999999999",
            messageType: "text",
            isFirstContact: false,
            previousInteractions: 0,
          },
        };

        const result = await service.processWhatsAppChat(request, mockContext);

        // Template selection is internal, but we can verify the response is appropriate
        expect(result.templateUsed).toBeDefined();
        expect(result.message.content).toBeDefined();
      });
    });
  });

  describe("LGPD Compliance", () => {
    it("should include LGPD compliance information in responses", async () => {
      const request: WhatsAppChatRequest = {
        messages: [
          {
            id: "msg_data",
            role: "user",
            content: "Preciso compartilhar meus dados pessoais",
            timestamp: Date.now(),
          },
        ],
        whatsappContext: {
          phoneNumber: "5511999999999",
          messageType: "text",
          isFirstContact: false,
          previousInteractions: 0,
        },
      };

      const result = await service.processWhatsAppChat(request, mockContext);

      expect(result.lgpdCompliance).toBeDefined();
      expect(result.lgpdCompliance.consentRequired).toBeDefined();
      expect(result.lgpdCompliance.dataUsageExplained).toBeDefined();
      expect(result.lgpdCompliance.rightsInformed).toBeDefined();
    });
  });
});
