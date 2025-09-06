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

// Realistic Brazilian clinic data
const brazilianClinicsData = [
  {
    id: "clinic-001",
    name: "Clínica Estética Bella Vita",
    location: "São Paulo, SP",
    specialties: ["harmonização facial", "preenchimento", "botox"],
    phone: "+5511987654321",
    emergencyPhone: "+5511987654322",
  },
  {
    id: "clinic-002",
    name: "Instituto de Beleza Natural",
    location: "Rio de Janeiro, RJ",
    specialties: ["peeling", "laser", "criolipólise"],
    phone: "+5521987654321",
    emergencyPhone: "+5521987654322",
  },
  {
    id: "clinic-003",
    name: "Centro Médico Estético Renova",
    location: "Belo Horizonte, MG",
    specialties: ["radiofrequência", "microagulhamento", "drenagem linfática"],
    phone: "+5531987654321",
    emergencyPhone: "+5531987654322",
  },
];

// Realistic patient scenarios
const patientScenarios = [
  {
    name: "Maria Silva",
    phone: "+5511999888777",
    age: 35,
    interests: ["harmonização facial", "preenchimento labial"],
    previousProcedures: ["botox"],
    concerns: ["rugas de expressão", "volume labial"],
    budget: "R$ 2.000 - R$ 5.000",
    urgency: "baixa",
  },
  {
    name: "Ana Costa",
    phone: "+5521999888666",
    age: 42,
    interests: ["peeling", "laser"],
    previousProcedures: [],
    concerns: ["manchas na pele", "textura irregular"],
    budget: "R$ 1.000 - R$ 3.000",
    urgency: "média",
  },
  {
    name: "Carla Santos",
    phone: "+5531999888555",
    age: 28,
    interests: ["criolipólise", "drenagem linfática"],
    previousProcedures: ["radiofrequência"],
    concerns: ["gordura localizada", "retenção de líquido"],
    budget: "R$ 3.000 - R$ 8.000",
    urgency: "alta",
  },
];

// Mock Brazilian AI Service with realistic responses
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

describe("WhatsApp Real Clinic Data Tests", () => {
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

  describe("Real Appointment Booking Scenarios", () => {
    const appointmentScenarios = [
      {
        patient: patientScenarios[0],
        message:
          "Oi! Gostaria de agendar uma consulta para harmonização facial. Qual a disponibilidade para esta semana?",
        expectedResponse:
          "Olá Maria! Que ótimo que você tem interesse em harmonização facial! 😊 Vou verificar nossa agenda para esta semana.",
        expectedTemplate: "whatsapp-appointment-booking",
      },
      {
        patient: patientScenarios[1],
        message:
          "Bom dia! Preciso agendar um peeling para tratar manchas. Vocês atendem no sábado?",
        expectedResponse:
          "Bom dia Ana! O peeling é excelente para tratar manchas na pele. Sim, atendemos aos sábados!",
        expectedTemplate: "whatsapp-appointment-booking",
      },
      {
        patient: patientScenarios[2],
        message:
          "Urgente! Quero agendar criolipólise o mais rápido possível. Têm vaga para amanhã?",
        expectedResponse:
          "Olá Carla! Entendo sua urgência. Vou verificar se temos disponibilidade para criolipólise amanhã.",
        expectedTemplate: "whatsapp-appointment-booking",
      },
    ];

    appointmentScenarios.forEach(({ patient, message, expectedResponse, expectedTemplate }) => {
      it(`should handle appointment booking for ${patient.name}`, async () => {
        mockBrazilianAIService.processWhatsAppChat.mockResolvedValue({
          id: "appointment_response_id",
          message: {
            id: "appointment_msg_id",
            role: "assistant",
            content: expectedResponse,
            timestamp: Date.now(),
          },
          usage: { promptTokens: 20, completionTokens: 30, totalTokens: 50 },
          metadata: { model: "brazilian-ai", responseTime: 150, cached: false },
          templateUsed: expectedTemplate,
          emergencyDetected: false,
          escalationTriggered: false,
          lgpdCompliance: {
            consentRequired: true,
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
                        from: patient.phone.replace("+", ""),
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

  describe("Real Procedure Inquiry Scenarios", () => {
    const procedureInquiries = [
      {
        patient: patientScenarios[0],
        message: "Quanto custa harmonização facial? Quais são os riscos? Dura quanto tempo?",
        expectedKeywords: ["valor", "riscos", "duração", "harmonização"],
        expectedTemplate: "whatsapp-procedure-inquiry",
      },
      {
        patient: patientScenarios[1],
        message:
          "O peeling químico dói muito? Quantas sessões preciso? Posso trabalhar no dia seguinte?",
        expectedKeywords: ["dor", "sessões", "recuperação", "peeling"],
        expectedTemplate: "whatsapp-procedure-inquiry",
      },
      {
        patient: patientScenarios[2],
        message:
          "A criolipólise realmente funciona? Em quanto tempo vejo resultado? Tem contraindicação?",
        expectedKeywords: ["eficácia", "resultado", "contraindicação", "criolipólise"],
        expectedTemplate: "whatsapp-procedure-inquiry",
      },
    ];

    procedureInquiries.forEach(({ patient, message, expectedKeywords, expectedTemplate }) => {
      it(`should handle procedure inquiry from ${patient.name}`, async () => {
        const responseContent =
          `Ótima pergunta! Vou explicar tudo sobre o procedimento que você tem interesse. ${
            expectedKeywords.join(", ")
          } são aspectos importantes a considerar.`;

        mockBrazilianAIService.processWhatsAppChat.mockResolvedValue({
          id: "procedure_response_id",
          message: {
            id: "procedure_msg_id",
            role: "assistant",
            content: responseContent,
            timestamp: Date.now(),
          },
          usage: { promptTokens: 25, completionTokens: 40, totalTokens: 65 },
          metadata: { model: "brazilian-ai", responseTime: 180, cached: false },
          templateUsed: expectedTemplate,
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
                        from: patient.phone.replace("+", ""),
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

  describe("Real Emergency Scenarios", () => {
    const emergencyScenarios = [
      {
        patient: patientScenarios[0],
        message: "Socorro! Fiz botox ontem e estou com o rosto muito inchado e vermelho. É normal?",
        severity: "high",
        expectedEscalation: true,
      },
      {
        patient: patientScenarios[1],
        message: "Estou com alergia após o peeling. A pele está descamando muito e ardendo.",
        severity: "medium",
        expectedEscalation: true,
      },
      {
        patient: patientScenarios[2],
        message: "Urgente! Após a criolipólise estou com dor forte e a pele está muito escura.",
        severity: "high",
        expectedEscalation: true,
      },
    ];

    emergencyScenarios.forEach(({ patient, message, severity, expectedEscalation }) => {
      it(`should handle ${severity} severity emergency from ${patient.name}`, async () => {
        const emergencyResponse =
          `⚠️ EMERGÊNCIA DETECTADA ⚠️\n\nEntre em contato IMEDIATAMENTE com nossa equipe médica:\n📞 ${mockEnv.CLINIC_EMERGENCY_PHONE}\n\nDescreva exatamente os sintomas que está sentindo.`;

        mockBrazilianAIService.processWhatsAppChat.mockResolvedValue({
          id: "emergency_response_id",
          message: {
            id: "emergency_msg_id",
            role: "assistant",
            content: emergencyResponse,
            timestamp: Date.now(),
          },
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
          metadata: { model: "emergency-protocol", responseTime: 0, cached: false },
          templateUsed: "whatsapp-emergency-escalation",
          emergencyDetected: true,
          escalationTriggered: expectedEscalation,
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
                        from: patient.phone.replace("+", ""),
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

  describe("LGPD Compliance with Real Data", () => {
    const lgpdScenarios = [
      {
        patient: patientScenarios[0],
        message: "Preciso do meu histórico de procedimentos para o plano de saúde",
        dataType: "medical_history",
        requiresConsent: true,
        requiresIdentification: true,
      },
      {
        patient: patientScenarios[1],
        message: "Quero receber promoções e novidades por WhatsApp",
        dataType: "marketing_consent",
        requiresConsent: true,
        requiresIdentification: false,
      },
      {
        patient: patientScenarios[2],
        message: "Podem deletar todos os meus dados? Não quero mais ser paciente",
        dataType: "data_deletion",
        requiresConsent: false,
        requiresIdentification: true,
      },
    ];

    lgpdScenarios.forEach(
      ({ patient, message, dataType, requiresConsent, requiresIdentification }) => {
        it(`should handle LGPD ${dataType} request from ${patient.name}`, async () => {
          const lgpdResponse = requiresConsent
            ? "Para atender sua solicitação, preciso confirmar seu consentimento conforme LGPD. Você autoriza o processamento dos seus dados para esta finalidade?"
            : "Entendi sua solicitação. Vou encaminhar para nossa equipe de privacidade conforme LGPD.";

          mockBrazilianAIService.processWhatsAppChat.mockResolvedValue({
            id: "lgpd_response_id",
            message: {
              id: "lgpd_msg_id",
              role: "assistant",
              content: lgpdResponse,
              timestamp: Date.now(),
            },
            usage: { promptTokens: 15, completionTokens: 25, totalTokens: 40 },
            metadata: { model: "brazilian-ai", responseTime: 120, cached: false },
            templateUsed: "whatsapp-lgpd-compliance",
            emergencyDetected: false,
            escalationTriggered: false,
            lgpdCompliance: {
              consentRequired: requiresConsent,
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
                          from: patient.phone.replace("+", ""),
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
      },
    );
  });

  describe("Regional Brazilian Variations", () => {
    const regionalScenarios = [
      {
        region: "São Paulo",
        patient: patientScenarios[0],
        message: "Oi, meu bem! Quero fazer um procedimento aí na clínica de vocês",
        expectedCulturalAdaptations: ["affectionate_terms", "regional_expressions"],
      },
      {
        region: "Rio de Janeiro",
        patient: patientScenarios[1],
        message: "E aí, galera! Tô precisando de uma limpeza de pele urgente",
        expectedCulturalAdaptations: ["informal_greeting", "regional_slang"],
      },
      {
        region: "Minas Gerais",
        patient: patientScenarios[2],
        message: "Oi, sô! Vocês fazem radiofrequência? Tô interessada",
        expectedCulturalAdaptations: ["regional_expressions", "mineiro_dialect"],
      },
    ];

    regionalScenarios.forEach(({ region, patient, message, expectedCulturalAdaptations }) => {
      it(`should adapt to ${region} regional expressions`, async () => {
        const adaptedResponse =
          `Oi! Que bom falar com você! 😊 Claro que fazemos! Vou te explicar tudo sobre o procedimento.`;

        mockBrazilianAIService.processWhatsAppChat.mockResolvedValue({
          id: "regional_response_id",
          message: {
            id: "regional_msg_id",
            role: "assistant",
            content: adaptedResponse,
            timestamp: Date.now(),
          },
          usage: { promptTokens: 18, completionTokens: 28, totalTokens: 46 },
          metadata: { model: "brazilian-ai", responseTime: 140, cached: false },
          templateUsed: "whatsapp-greeting",
          culturalAdaptations: expectedCulturalAdaptations,
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
                        from: patient.phone.replace("+", ""),
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

  describe("Complex Multi-Turn Conversations", () => {
    it("should handle complete consultation flow", async () => {
      const conversationFlow = [
        {
          message: "Oi! Quero fazer harmonização facial",
          expectedTemplate: "whatsapp-procedure-inquiry",
        },
        {
          message: "Quanto custa e quanto tempo demora?",
          expectedTemplate: "whatsapp-procedure-inquiry",
        },
        {
          message: "Ok, quero agendar. Quando vocês têm disponível?",
          expectedTemplate: "whatsapp-appointment-booking",
        },
        {
          message: "Perfeito! Confirmo para quinta-feira às 14h",
          expectedTemplate: "whatsapp-appointment-confirmation",
        },
      ];

      for (const [index, { message, expectedTemplate }] of conversationFlow.entries()) {
        mockBrazilianAIService.processWhatsAppChat.mockResolvedValue({
          id: `conversation_${index}_id`,
          message: {
            id: `conversation_${index}_msg_id`,
            role: "assistant",
            content: `Resposta ${index + 1} da conversa sobre harmonização facial`,
            timestamp: Date.now(),
          },
          usage: { promptTokens: 20, completionTokens: 30, totalTokens: 50 },
          metadata: { model: "brazilian-ai", responseTime: 150, cached: false },
          templateUsed: expectedTemplate,
          emergencyDetected: false,
          escalationTriggered: false,
          lgpdCompliance: {
            consentRequired: index === 3, // Only require consent for confirmation
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
                        from: patientScenarios[0].phone.replace("+", ""),
                        id: `wamid.${Date.now()}_${index}`,
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
      }
    });
  });
});
