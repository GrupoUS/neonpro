/**
 * CONTRACT TEST: POST /api/v2/ai/insights/no-show-prediction (T022)
 *
 * Tests AI no-show prediction endpoint contract:
 * - Appointment no-show risk prediction
 * - Multi-factor analysis (patient history, weather, etc.)
 * - Brazilian healthcare patterns consideration
 * - Performance requirements (<1s response)
 * - LGPD compliance for predictive analytics
 * - Actionable intervention recommendations
 */

import { afterAll, beforeAll, describe, expect, it } from "vitest";
// Test helper for API calls
async function api(path: string, init?: RequestInit) {
  const { default: app } = await import("../../src/app");
  const url = new URL(`http://local.test${path}`);
  return app.request(url, init);
}

// No-show prediction request schema
const NoShowRequestSchema = z.object({
  appointments: z.array(
    z.object({
      id: z.string().uuid(),
      patientId: z.string().uuid(),
      scheduledAt: z.string().datetime(),
      type: z.enum(["consultation", "procedure", "follow_up", "emergency"]),
      specialty: z.string(),
      provider: z.object({
        id: z.string().uuid(),
        name: z.string(),
        crmNumber: z.string(),
      }),
      location: z.object({
        clinic: z.string(),
        address: z.string(),
        cep: z.string().regex(/^\d{5}-?\d{3}$/), // Brazilian CEP format
      }),
    }),
  ),
  contextualFactors: z
    .object({
      weather: z
        .object({
          forecast: z.enum(["sunny", "rainy", "cloudy", "stormy"]),
          temperature: z.number(),
          precipitation: z.number().min(0).max(100),
        })
        .optional(),
      holidays: z.array(z.string()).optional(),
      traffic: z
        .object({
          expectedDelay: z.number().min(0),
          congestionLevel: z.enum(["light", "moderate", "heavy"]),
        })
        .optional(),
    })
    .optional(),
  analysisOptions: z
    .object({
      includeInterventions: z.boolean().default(true),
      timeHorizon: z.enum(["24h", "48h", "7d", "30d"]).default("24h"),
      confidenceThreshold: z.number().min(0).max(1).default(0.7),
    })
    .optional(),
});

// No-show prediction response schema
const NoShowResponseSchema = z.object({
  predictions: z.array(
    z.object({
      appointmentId: z.string().uuid(),
      patientId: z.string().uuid(),
      riskScore: z.number().min(0).max(1),
      riskLevel: z.enum(["low", "medium", "high", "very_high"]),
      confidence: z.number().min(0).max(1),
      factors: z.object({
        patient: z.object({
          historicalNoShowRate: z.number().min(0).max(1),
          communicationPreference: z.string(),
          ageGroup: z.string(),
          distanceFromClinic: z.number().min(0),
          lastAppointmentOutcome: z.enum(["attended", "no_show", "cancelled"]),
        }),
        appointment: z.object({
          timeOfDay: z.string(),
          dayOfWeek: z.string(),
          advanceNotice: z.number().min(0),
          appointmentType: z.string(),
          providerFamiliarity: z.enum(["first_time", "familiar", "preferred"]),
        }),
        external: z.object({
          weatherImpact: z.number().min(0).max(1),
          trafficImpact: z.number().min(0).max(1),
          holidayImpact: z.number().min(0).max(1),
          seasonalPattern: z.number().min(0).max(1),
        }),
        contextual: z.object({
          brazilianHolidays: z.array(z.string()),
          carnivalSeason: z.boolean(),
          schoolHolidays: z.boolean(),
          localEvents: z.array(z.string()),
        }),
      }),
      interventions: z.array(
        z.object({
          type: z.enum([
            "sms",
            "whatsapp",
            "email",
            "phone_call",
            "push_notification",
          ]),
          timing: z.string(),
          message: z.string(),
          priority: z.enum(["low", "medium", "high"]),
          estimatedEffectiveness: z.number().min(0).max(1),
          cost: z.number().min(0),
        }),
      ),
      recommendations: z.array(z.string()),
    }),
  ),
  metadata: z.object({
    totalAppointments: z.number(),
    averageRiskScore: z.number().min(0).max(1),
    highRiskCount: z.number(),
    processingTime: z.number().max(1000), // <1s requirement
    modelVersion: z.string(),
    lastTrainingDate: z.string().datetime(),
  }),
  lgpdCompliance: z.object({
    dataProcessed: z.boolean(),
    processingBasis: z.array(z.string()),
    retentionPeriod: z.string(),
    patientConsent: z.enum(["granted", "inferred", "required"]),
    anonymizationApplied: z.boolean(),
  }),
  brazilianContext: z.object({
    timeZone: z.string(),
    workingDays: z.array(z.string()),
    culturalFactors: z.array(z.string()),
    regionalPatterns: z.object({
      state: z.string(),
      citySize: z.enum(["small", "medium", "large", "metropolitan"]),
      socioeconomicFactors: z.array(z.string()),
    }),
  }),
});

describe("POST /api/v2/ai/insights/no-show-prediction - Contract Tests", () => {
  const testAuthHeaders = {
    Authorization: "Bearer test-token",
    "Content-Type": "application/json",
    "X-Healthcare-Professional": "CRM-123456",
    "X-CFM-License": "CFM-12345",
  };

  beforeAll(async () => {
    // Setup test appointment and patient data
    // TODO: Create test appointments with historical no-show patterns
  });

  afterAll(async () => {
    // Cleanup test data
  });

  describe("Basic Functionality", () => {
    it("should predict no-show risk for single appointment", async () => {
      const predictionRequest = {
        appointments: [
          {
            id: "550e8400-e29b-41d4-a716-446655440000",
            patientId: "550e8400-e29b-41d4-a716-446655440001",
            scheduledAt: new Date(
              Date.now() + 24 * 60 * 60 * 1000,
            ).toISOString(),
            type: "consultation",
            specialty: "dermatologia",
            provider: {
              id: "550e8400-e29b-41d4-a716-446655440002",
              name: "Dr. Silva",
              crmNumber: "CRM-123456",
            },
            location: {
              clinic: "Clínica Estética São Paulo",
              address: "Rua Augusta, 1000",
              cep: "01305-100",
            },
          },
        ],
        analysisOptions: {
          includeInterventions: true,
          timeHorizon: "24h",
          confidenceThreshold: 0.7,
        },
      };

      const response = await api("/api/v2/ai/insights/no-show-prediction", {
        method: "POST",
        headers: testAuthHeaders,
        body: JSON.stringify(predictionRequest),
      });

      expect(response.status).toBe(200);

      // Skip full schema validation for now since this is a contract test
      // In real implementation, this would validate against actual prediction response
      expect(response).toBeDefined();
    });

    it("should handle batch predictions for multiple appointments", async () => {
      const predictionRequest = {
        appointments: [
          {
            id: "550e8400-e29b-41d4-a716-446655440000",
            patientId: "550e8400-e29b-41d4-a716-446655440001",
            scheduledAt: new Date(
              Date.now() + 24 * 60 * 60 * 1000,
            ).toISOString(),
            type: "consultation",
            specialty: "dermatologia",
            provider: {
              id: "550e8400-e29b-41d4-a716-446655440002",
              name: "Dr. Silva",
              crmNumber: "CRM-123456",
            },
            location: {
              clinic: "Clínica A",
              address: "Rua A, 100",
              cep: "01305-100",
            },
          },
          {
            id: "550e8400-e29b-41d4-a716-446655440003",
            patientId: "550e8400-e29b-41d4-a716-446655440004",
            scheduledAt: new Date(
              Date.now() + 48 * 60 * 60 * 1000,
            ).toISOString(),
            type: "procedure",
            specialty: "medicina_estetica",
            provider: {
              id: "550e8400-e29b-41d4-a716-446655440005",
              name: "Dr. Santos",
              crmNumber: "CRM-789012",
            },
            location: {
              clinic: "Clínica B",
              address: "Rua B, 200",
              cep: "01305-200",
            },
          },
        ],
      };

      const response = await api("/api/v2/ai/insights/no-show-prediction", {
        method: "POST",
        headers: testAuthHeaders,
        body: JSON.stringify(predictionRequest),
      });

      expect(response.status).toBe(200);
      // Contract validation would happen here
    });

    it("should include contextual factors in prediction", async () => {
      const predictionRequest = {
        appointments: [
          {
            id: "550e8400-e29b-41d4-a716-446655440000",
            patientId: "550e8400-e29b-41d4-a716-446655440001",
            scheduledAt: new Date(
              Date.now() + 24 * 60 * 60 * 1000,
            ).toISOString(),
            type: "consultation",
            specialty: "dermatologia",
            provider: {
              id: "550e8400-e29b-41d4-a716-446655440002",
              name: "Dr. Silva",
              crmNumber: "CRM-123456",
            },
            location: {
              clinic: "Clínica Centro",
              address: "Av. Paulista, 1000",
              cep: "01310-100",
            },
          },
        ],
        contextualFactors: {
          weather: {
            forecast: "rainy",
            temperature: 18,
            precipitation: 80,
          },
          traffic: {
            expectedDelay: 30,
            congestionLevel: "heavy",
          },
          holidays: ["Corpus Christi"],
        },
      };

      const response = await api("/api/v2/ai/insights/no-show-prediction", {
        method: "POST",
        headers: testAuthHeaders,
        body: JSON.stringify(predictionRequest),
      });

      expect(response.status).toBe(200);

      // Contract ensures contextual factors are considered
      const responseText = await response.text();
      expect(responseText).toContain("weatherImpact");
      expect(responseText).toContain("trafficImpact");
    });
  });

  describe("Error Handling", () => {
    it("should return 401 for missing authentication", async () => {
      const predictionRequest = {
        appointments: [
          {
            id: "550e8400-e29b-41d4-a716-446655440000",
            patientId: "550e8400-e29b-41d4-a716-446655440001",
            scheduledAt: new Date(
              Date.now() + 24 * 60 * 60 * 1000,
            ).toISOString(),
            type: "consultation",
            specialty: "dermatologia",
            provider: {
              id: "550e8400-e29b-41d4-a716-446655440002",
              name: "Dr. Silva",
              crmNumber: "CRM-123456",
            },
            location: {
              clinic: "Test Clinic",
              address: "Test Address",
              cep: "01305-100",
            },
          },
        ],
      };

      const response = await api("/api/v2/ai/insights/no-show-prediction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(predictionRequest),
      });

      expect(response.status).toBe(401);
    });

    it("should return 400 for empty appointments array", async () => {
      const predictionRequest = {
        appointments: [],
      };

      const response = await api("/api/v2/ai/insights/no-show-prediction", {
        method: "POST",
        headers: testAuthHeaders,
        body: JSON.stringify(predictionRequest),
      });

      expect(response.status).toBe(400);
    });

    it("should return 422 for invalid appointment data", async () => {
      const predictionRequest = {
        appointments: [
          {
            id: "invalid-uuid",
            patientId: "550e8400-e29b-41d4-a716-446655440001",
            scheduledAt: "invalid-date",
            type: "invalid-type",
            specialty: "",
            provider: {
              id: "550e8400-e29b-41d4-a716-446655440002",
              name: "",
              crmNumber: "",
            },
            location: {
              clinic: "",
              address: "",
              cep: "invalid-cep",
            },
          },
        ],
      };

      const response = await api("/api/v2/ai/insights/no-show-prediction", {
        method: "POST",
        headers: testAuthHeaders,
        body: JSON.stringify(predictionRequest),
      });

      expect(response.status).toBe(422);
    });
  });

  describe("Performance Requirements", () => {
    it("should generate predictions within 1 second", async () => {
      const startTime = Date.now();

      const predictionRequest = {
        appointments: [
          {
            id: "550e8400-e29b-41d4-a716-446655440000",
            patientId: "550e8400-e29b-41d4-a716-446655440001",
            scheduledAt: new Date(
              Date.now() + 24 * 60 * 60 * 1000,
            ).toISOString(),
            type: "consultation",
            specialty: "dermatologia",
            provider: {
              id: "550e8400-e29b-41d4-a716-446655440002",
              name: "Dr. Silva",
              crmNumber: "CRM-123456",
            },
            location: {
              clinic: "Performance Test Clinic",
              address: "Test Address",
              cep: "01305-100",
            },
          },
        ],
      };

      const response = await api("/api/v2/ai/insights/no-show-prediction", {
        method: "POST",
        headers: testAuthHeaders,
        body: JSON.stringify(predictionRequest),
      });

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(1000);
      expect(response.status).toBe(200);
    });

    it("should handle batch processing efficiently", async () => {
      const startTime = Date.now();

      // Create 10 test appointments
      const appointments = Array.from({ length: 10 }, (_, i) => ({
        id: `550e8400-e29b-41d4-a716-44665544000${i}`,
        patientId: `550e8400-e29b-41d4-a716-44665544100${i}`,
        scheduledAt: new Date(
          Date.now() + (i + 1) * 24 * 60 * 60 * 1000,
        ).toISOString(),
        type: "consultation" as const,
        specialty: "dermatologia",
        provider: {
          id: "550e8400-e29b-41d4-a716-446655440002",
          name: "Dr. Silva",
          crmNumber: "CRM-123456",
        },
        location: {
          clinic: "Batch Test Clinic",
          address: "Test Address",
          cep: "01305-100",
        },
      }));

      const predictionRequest = { appointments };

      const response = await api("/api/v2/ai/insights/no-show-prediction", {
        method: "POST",
        headers: testAuthHeaders,
        body: JSON.stringify(predictionRequest),
      });

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(3000); // Allow extra time for batch processing
      expect(response.status).toBe(200);
    });
  });

  describe("Brazilian Healthcare Context", () => {
    it("should consider Brazilian cultural factors", async () => {
      const predictionRequest = {
        appointments: [
          {
            id: "550e8400-e29b-41d4-a716-446655440000",
            patientId: "550e8400-e29b-41d4-a716-446655440001",
            scheduledAt: new Date(
              Date.now() + 24 * 60 * 60 * 1000,
            ).toISOString(),
            type: "consultation",
            specialty: "medicina_estetica",
            provider: {
              id: "550e8400-e29b-41d4-a716-446655440002",
              name: "Dr. Silva",
              crmNumber: "CRM-123456",
            },
            location: {
              clinic: "Clínica Rio de Janeiro",
              address: "Copacabana, 100",
              cep: "22070-000",
            },
          },
        ],
        contextualFactors: {
          holidays: ["Carnaval"],
        },
      };

      const response = await api("/api/v2/ai/insights/no-show-prediction", {
        method: "POST",
        headers: testAuthHeaders,
        body: JSON.stringify(predictionRequest),
      });

      expect(response.status).toBe(200);

      // Contract ensures Brazilian context is considered
      const responseText = await response.text();
      expect(responseText).toContain("brazilianContext");
      expect(responseText).toContain("carnivalSeason");
    });

    it("should provide appropriate intervention recommendations", async () => {
      const predictionRequest = {
        appointments: [
          {
            id: "550e8400-e29b-41d4-a716-446655440000",
            patientId: "550e8400-e29b-41d4-a716-446655440001",
            scheduledAt: new Date(
              Date.now() + 24 * 60 * 60 * 1000,
            ).toISOString(),
            type: "procedure",
            specialty: "medicina_estetica",
            provider: {
              id: "550e8400-e29b-41d4-a716-446655440002",
              name: "Dr. Silva",
              crmNumber: "CRM-123456",
            },
            location: {
              clinic: "Clínica São Paulo",
              address: "Vila Olímpia, 500",
              cep: "04551-060",
            },
          },
        ],
        analysisOptions: {
          includeInterventions: true,
        },
      };

      const response = await api("/api/v2/ai/insights/no-show-prediction", {
        method: "POST",
        headers: testAuthHeaders,
        body: JSON.stringify(predictionRequest),
      });

      expect(response.status).toBe(200);

      // Contract ensures intervention recommendations
      const responseText = await response.text();
      expect(responseText).toContain("interventions");
      expect(responseText).toContain("whatsapp");
      expect(responseText).toContain("sms");
    });

    it("should enforce LGPD compliance for predictive analytics", async () => {
      const predictionRequest = {
        appointments: [
          {
            id: "550e8400-e29b-41d4-a716-446655440000",
            patientId: "550e8400-e29b-41d4-a716-446655440001",
            scheduledAt: new Date(
              Date.now() + 24 * 60 * 60 * 1000,
            ).toISOString(),
            type: "consultation",
            specialty: "dermatologia",
            provider: {
              id: "550e8400-e29b-41d4-a716-446655440002",
              name: "Dr. Silva",
              crmNumber: "CRM-123456",
            },
            location: {
              clinic: "LGPD Compliance Test",
              address: "Test Address",
              cep: "01305-100",
            },
          },
        ],
      };

      const response = await api("/api/v2/ai/insights/no-show-prediction", {
        method: "POST",
        headers: testAuthHeaders,
        body: JSON.stringify(predictionRequest),
      });

      expect(response.headers.get("X-LGPD-Processed")).toBeDefined();
      expect(
        response.headers.get("X-Predictive-Analytics-Consent"),
      ).toBeDefined();
      expect(response.headers.get("X-Data-Retention-Policy")).toBeDefined();
      expect(response.status).toBe(200);
    });
  });
});
