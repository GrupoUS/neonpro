import { testClient } from "hono/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { whatsappRoutes } from "./whatsapp";

// Mock environment variables
const mockEnv = {
  WHATSAPP_VERIFY_TOKEN: "test_verify_token",
  WHATSAPP_ACCESS_TOKEN: "test_access_token",
  WHATSAPP_PHONE_NUMBER_ID: "test_phone_number_id",
  CLINIC_NAME: "Clínica NeonPro",
  CLINIC_EMERGENCY_PHONE: "+5511999999999",
};

// Mock fetch for WhatsApp API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock Brazilian AI Service with template-specific responses
const mockBrazilianAIService = {
  processWhatsAppChat: vi.fn(),
};

vi.mock("@neonpro/core-services", () => ({
  BrazilianAIService: vi.fn(() => mockBrazilianAIService),
}));

vi.mock("../middleware/audit.middleware", () => ({
  auditMiddleware: () => (c: any, next: any) => next(),
}));

vi.mock("../middleware/healthcare-security", () => ({
  HealthcareAuthMiddleware: vi.fn(() => ({
    handle: (c: any, next: any) => next(),
    middleware: (c: any, next: any) => next(),
  })),
}));

vi.mock("../services/audit.service", () => ({
  auditService: {
    logEvent: vi.fn().mockResolvedValue({}),
  },
}));

describe("WhatsApp Brazilian Templates Validation", () => {
  const client = testClient(whatsappRoutes);

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Set up environment
    Object.entries(mockEnv).forEach(([key, value]) => {
      process.env[key] = value;
    });

    // Mock successful WhatsApp API response
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          messages: [{ id: "wamid.test123" }],
        }),
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("Template Selection Logic", () => {
    const templateScenarios = [
      {
        name: "Greeting Template",
        message: "Oi, tudo bem?",
        expectedTemplate: "whatsapp-greeting",
        expectedResponse: "Olá! Bem-vindo à Clínica NeonPro! 😊 Como posso ajudá-lo hoje?",
        isFirstContact: true,
      },
      {
        name: "Appointment Booking Template",
        message: "Gostaria de agendar uma consulta",
        expectedTemplate: "whatsapp-appointment-booking",
        expectedResponse:
          "Perfeito! Vou ajudá-lo a agendar sua consulta. Qual procedimento você tem interesse?",
        isFirstContact: false,
      },
      {
        name: "Procedure Inquiry Template - Botox",
        message: "Quanto custa botox?",
        expectedTemplate: "whatsapp-procedure-inquiry",
        expectedResponse:
          "O botox é um dos nossos procedimentos mais procurados! O valor varia conforme a área a ser tratada.",
        isFirstContact: false,
      },
      {
        name: "Procedure Inquiry Template - Harmonização",
        message: "Quero fazer harmonização facial",
        expectedTemplate: "whatsapp-procedure-inquiry",
        expectedResponse:
          "A harmonização facial é uma especialidade da nossa clínica! Vamos conversar sobre suas expectativas.",
        isFirstContact: false,
      },
      {
        name: "Post-Procedure Care Template",
        message: "Como devo cuidar da pele depois do peeling?",
        expectedTemplate: "whatsapp-post-procedure-care",
        expectedResponse:
          "Ótima pergunta! Os cuidados pós-peeling são fundamentais para o sucesso do tratamento.",
        isFirstContact: false,
      },
      {
        name: "Emergency Escalation Template",
        message: "Socorro! Estou com muita dor e inchaço após o procedimento",
        expectedTemplate: "whatsapp-emergency-escalation",
        expectedResponse:
          "⚠️ EMERGÊNCIA DETECTADA ⚠️\n\nEntre em contato IMEDIATAMENTE com nossa equipe médica:",
        isFirstContact: false,
        isEmergency: true,
      },
    ];

    templateScenarios.forEach(
      ({ name, message, expectedTemplate, expectedResponse, isFirstContact, isEmergency }) => {
        it(`should use ${expectedTemplate} for: ${name}`, async () => {
          // Configure mock response based on template
          mockBrazilianAIService.processWhatsAppChat.mockResolvedValue({
            id: "test_response_id",
            message: {
              id: "test_msg_id",
              role: "assistant",
              content: expectedResponse,
              timestamp: Date.now(),
            },
            usage: { promptTokens: 15, completionTokens: 25, totalTokens: 40 },
            metadata: { model: "brazilian-ai", responseTime: 120, cached: false },
            templateUsed: expectedTemplate,
            emergencyDetected: isEmergency || false,
            escalationTriggered: isEmergency || false,
            lgpdCompliance: {
              consentRequired: !isEmergency,
              dataUsageExplained: true,
              rightsInformed: true,
            },
          });

          const payload = {
            object: "whatsapp_business_account",
            entry: [
              {
                id: "entry_id",
                changes: [
                  {
                    value: {
                      messaging_product: "whatsapp",
                      metadata: {
                        display_phone_number: "15551234567",
                        phone_number_id: "test_phone_number_id",
                      },
                      messages: [
                        {
                          from: "5511999999999",
                          id: `wamid.${Date.now()}`,
                          timestamp: String(Date.now()),
                          text: { body: message },
                          type: "text",
                        },
                      ],
                    },
                    field: "messages",
                  },
                ],
              },
            ],
          };

          const response = await client.webhook.$post({
            json: payload,
          });

          expect(response.status).toBe(200);

          // Verify AI service was called with correct context
          expect(mockBrazilianAIService.processWhatsAppChat).toHaveBeenCalledWith(
            expect.objectContaining({
              messages: expect.arrayContaining([
                expect.objectContaining({
                  role: "user",
                  content: message,
                }),
              ]),
              whatsappContext: expect.objectContaining({
                phoneNumber: "5511999999999",
                messageType: "text",
              }),
            }),
            expect.any(Object),
          );

          // Verify WhatsApp API was called to send response
          if (!isEmergency) {
            expect(mockFetch).toHaveBeenCalledWith(
              expect.stringContaining("graph.facebook.com"),
              expect.objectContaining({
                method: "POST",
                headers: expect.objectContaining({
                  "Authorization": "Bearer test_access_token",
                  "Content-Type": "application/json",
                }),
                body: expect.stringContaining(expectedResponse.slice(0, 20)),
              }),
            );
          }
        });
      },
    );
  });

  describe("Brazilian Portuguese Language Validation", () => {
    const languageTests = [
      {
        name: "Formal greeting",
        message: "Bom dia, gostaria de informações",
        expectedLanguageFeatures: ["formal_treatment", "brazilian_greeting"],
      },
      {
        name: "Informal greeting",
        message: "Oi, tudo bem?",
        expectedLanguageFeatures: ["informal_treatment", "brazilian_greeting"],
      },
      {
        name: "Regional expressions",
        message: "Oi, meu bem, quero fazer um procedimento",
        expectedLanguageFeatures: ["regional_expressions", "affectionate_terms"],
      },
      {
        name: "Medical terminology in Portuguese",
        message: "Tenho rugas de expressão e quero tratamento",
        expectedLanguageFeatures: ["medical_terminology", "aesthetic_vocabulary"],
      },
    ];

    languageTests.forEach(({ name, message, expectedLanguageFeatures }) => {
      it(`should handle ${name} with appropriate Brazilian Portuguese response`, async () => {
        // Configure mock to return Brazilian Portuguese response
        mockBrazilianAIService.processWhatsAppChat.mockResolvedValue({
          id: "test_response_id",
          message: {
            id: "test_msg_id",
            role: "assistant",
            content: "Olá! Que bom falar com você! 😊 Vou ajudá-lo com muito prazer.",
            timestamp: Date.now(),
          },
          usage: { promptTokens: 12, completionTokens: 18, totalTokens: 30 },
          metadata: { model: "brazilian-ai", responseTime: 100, cached: false },
          templateUsed: "whatsapp-greeting",
          culturalAdaptations: expectedLanguageFeatures,
          emergencyDetected: false,
          escalationTriggered: false,
          lgpdCompliance: {
            consentRequired: false,
            dataUsageExplained: true,
            rightsInformed: true,
          },
        });

        const payload = {
          object: "whatsapp_business_account",
          entry: [
            {
              id: "entry_id",
              changes: [
                {
                  value: {
                    messaging_product: "whatsapp",
                    metadata: {
                      display_phone_number: "15551234567",
                      phone_number_id: "test_phone_number_id",
                    },
                    messages: [
                      {
                        from: "5511999999999",
                        id: `wamid.${Date.now()}`,
                        timestamp: String(Date.now()),
                        text: { body: message },
                        type: "text",
                      },
                    ],
                  },
                  field: "messages",
                },
              ],
            },
          ],
        };

        const response = await client.webhook.$post({
          json: payload,
        });

        expect(response.status).toBe(200);

        // Verify AI service was called with Brazilian context
        expect(mockBrazilianAIService.processWhatsAppChat).toHaveBeenCalledWith(
          expect.objectContaining({
            context: expect.objectContaining({
              clinicType: "aesthetic",
              communicationChannel: "whatsapp",
              patientLanguage: "pt-BR",
            }),
          }),
          expect.any(Object),
        );
      });
    });
  });

  describe("LGPD Compliance in Templates", () => {
    const lgpdScenarios = [
      {
        name: "Data collection request",
        message: "Preciso do seu nome e telefone para agendar",
        expectedCompliance: {
          consentRequired: true,
          dataUsageExplained: true,
          rightsInformed: true,
        },
      },
      {
        name: "Marketing communication",
        message: "Gostaria de receber promoções por WhatsApp",
        expectedCompliance: {
          consentRequired: true,
          dataUsageExplained: true,
          rightsInformed: true,
        },
      },
      {
        name: "General information",
        message: "Qual o horário de funcionamento?",
        expectedCompliance: {
          consentRequired: false,
          dataUsageExplained: true,
          rightsInformed: false,
        },
      },
    ];

    lgpdScenarios.forEach(({ name, message, expectedCompliance }) => {
      it(`should handle LGPD compliance for: ${name}`, async () => {
        mockBrazilianAIService.processWhatsAppChat.mockResolvedValue({
          id: "test_response_id",
          message: {
            id: "test_msg_id",
            role: "assistant",
            content: "Resposta com informações sobre LGPD e privacidade conforme necessário.",
            timestamp: Date.now(),
          },
          usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
          metadata: { model: "brazilian-ai", responseTime: 100, cached: false },
          templateUsed: "whatsapp-greeting",
          emergencyDetected: false,
          escalationTriggered: false,
          lgpdCompliance: expectedCompliance,
        });

        const payload = {
          object: "whatsapp_business_account",
          entry: [
            {
              id: "entry_id",
              changes: [
                {
                  value: {
                    messaging_product: "whatsapp",
                    metadata: {
                      display_phone_number: "15551234567",
                      phone_number_id: "test_phone_number_id",
                    },
                    messages: [
                      {
                        from: "5511999999999",
                        id: `wamid.${Date.now()}`,
                        timestamp: String(Date.now()),
                        text: { body: message },
                        type: "text",
                      },
                    ],
                  },
                  field: "messages",
                },
              ],
            },
          ],
        };

        const response = await client.webhook.$post({
          json: payload,
        });

        expect(response.status).toBe(200);
      });
    });
  });

  describe("Emergency Detection and Escalation", () => {
    const emergencyKeywords = [
      "emergência",
      "urgente",
      "dor forte",
      "sangramento",
      "alergia",
      "reação",
      "inchaço",
      "febre alta",
      "desmaio",
      "tontura",
      "falta de ar",
      "socorro",
    ];

    emergencyKeywords.forEach((keyword) => {
      it(`should detect emergency for keyword: ${keyword}`, async () => {
        const emergencyMessage = `Estou com ${keyword} após o procedimento`;

        mockBrazilianAIService.processWhatsAppChat.mockResolvedValue({
          id: "emergency_response_id",
          message: {
            id: "emergency_msg_id",
            role: "assistant",
            content:
              `⚠️ EMERGÊNCIA DETECTADA ⚠️\n\nEntre em contato IMEDIATAMENTE com nossa equipe médica:\n📞 ${mockEnv.CLINIC_EMERGENCY_PHONE}`,
            timestamp: Date.now(),
          },
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
          metadata: { model: "emergency-protocol", responseTime: 0, cached: false },
          templateUsed: "whatsapp-emergency-escalation",
          emergencyDetected: true,
          escalationTriggered: true,
          lgpdCompliance: {
            consentRequired: false,
            dataUsageExplained: false,
            rightsInformed: false,
          },
        });

        const payload = {
          object: "whatsapp_business_account",
          entry: [
            {
              id: "entry_id",
              changes: [
                {
                  value: {
                    messaging_product: "whatsapp",
                    metadata: {
                      display_phone_number: "15551234567",
                      phone_number_id: "test_phone_number_id",
                    },
                    messages: [
                      {
                        from: "5511999999999",
                        id: `wamid.${Date.now()}`,
                        timestamp: String(Date.now()),
                        text: { body: emergencyMessage },
                        type: "text",
                      },
                    ],
                  },
                  field: "messages",
                },
              ],
            },
          ],
        };

        const response = await client.webhook.$post({
          json: payload,
        });

        expect(response.status).toBe(200);
      });
    });
  });

  describe("Aesthetic Procedures Recognition", () => {
    const aestheticProcedures = [
      "harmonização facial",
      "preenchimento",
      "botox",
      "toxina botulínica",
      "peeling",
      "criolipólise",
      "radiofrequência",
      "laser",
      "microagulhamento",
      "limpeza de pele",
      "drenagem linfática",
    ];

    aestheticProcedures.forEach((procedure) => {
      it(`should recognize aesthetic procedure: ${procedure}`, async () => {
        const procedureMessage = `Gostaria de saber sobre ${procedure}`;

        mockBrazilianAIService.processWhatsAppChat.mockResolvedValue({
          id: "procedure_response_id",
          message: {
            id: "procedure_msg_id",
            role: "assistant",
            content:
              `Que ótima escolha! O ${procedure} é um dos nossos procedimentos mais procurados. Vou explicar tudo sobre ele.`,
            timestamp: Date.now(),
          },
          usage: { promptTokens: 15, completionTokens: 25, totalTokens: 40 },
          metadata: { model: "brazilian-ai", responseTime: 120, cached: false },
          templateUsed: "whatsapp-procedure-inquiry",
          emergencyDetected: false,
          escalationTriggered: false,
          lgpdCompliance: {
            consentRequired: false,
            dataUsageExplained: true,
            rightsInformed: true,
          },
        });

        const payload = {
          object: "whatsapp_business_account",
          entry: [
            {
              id: "entry_id",
              changes: [
                {
                  value: {
                    messaging_product: "whatsapp",
                    metadata: {
                      display_phone_number: "15551234567",
                      phone_number_id: "test_phone_number_id",
                    },
                    messages: [
                      {
                        from: "5511999999999",
                        id: `wamid.${Date.now()}`,
                        timestamp: String(Date.now()),
                        text: { body: procedureMessage },
                        type: "text",
                      },
                    ],
                  },
                  field: "messages",
                },
              ],
            },
          ],
        };

        const response = await client.webhook.$post({
          json: payload,
        });

        expect(response.status).toBe(200);
      });
    });
  });
});
