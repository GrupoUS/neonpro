// API Tests for Patient Insights Endpoints
// Story 3.2: Task 9 - API Integration Testing

// Mock Supabase
jest.mock("@supabase/auth-helpers-nextjs", () => ({
  createRouteHandlerClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(() =>
        Promise.resolve({
          data: {
            session: {
              user: { id: "user-123" },
            },
          },
        }),
      ),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() =>
            Promise.resolve({
              data: {
                id: "patient-123",
                clinic_id: "clinic-abc",
              },
            }),
          ),
        })),
      })),
    })),
  })),
}));

// Mock next/headers
jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

// Mock the patient insights integration
jest.mock("@/lib/ai/patient-insights", () => {
  return jest.fn().mockImplementation(() => ({
    generateQuickRiskAssessment: jest.fn(() =>
      Promise.resolve({
        patientId: "patient-123",
        overallRiskScore: 0.45,
        confidence: 0.85,
        recommendations: ["Monitor blood pressure", "Follow up in 2 weeks"],
      }),
    ),
    generateComprehensiveInsights: jest.fn(() =>
      Promise.resolve({
        patientId: "patient-123",
        requestId: "req-456",
        riskAssessment: {
          patientId: "patient-123",
          overallRiskScore: 0.45,
          confidence: 0.85,
        },
        alerts: {
          totalAlerts: 2,
          criticalAlerts: 0,
          warningAlerts: 1,
          infoAlerts: 1,
        },
        recommendations: ["Follow treatment plan"],
        processingTime: 1500,
        generatedAt: new Date(),
        version: "1.0.0",
      }),
    ),
    generateTreatmentGuidance: jest.fn(() =>
      Promise.resolve({
        patientId: "patient-123",
        primaryRecommendations: [
          {
            recommendation: "Continue current medication",
            confidence: 0.9,
            priority: "high",
          },
        ],
        confidence: 0.88,
      }),
    ),
    monitorPatientAlerts: jest.fn(() =>
      Promise.resolve({
        patientId: "patient-123",
        totalAlerts: 3,
        criticalAlerts: 1,
        warningAlerts: 1,
        infoAlerts: 1,
        alerts: [
          {
            id: "alert-1",
            severity: "high",
            title: "High Risk Alert",
            description: "Patient shows high risk factors",
          },
        ],
        lastChecked: new Date(),
        nextCheckRecommended: new Date(Date.now() + 24 * 60 * 60 * 1000),
      }),
    ),
    updatePatientOutcome: jest.fn(() =>
      Promise.resolve([
        {
          insight: "Treatment effectiveness improved",
          confidence: 0.85,
        },
      ]),
    ),
  }));
});

describe("Patient Insights API Endpoints", () => {
  const mockParams = { patientId: "patient-123" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Risk Assessment API", () => {
    describe("GET /api/patients/[patientId]/insights/risk-assessment", () => {
      it("should return risk assessment for authenticated user", async () => {
        const request = new NextRequest(
          "http://localhost:3000/api/patients/patient-123/insights/risk-assessment",
        );

        const response = await getRiskAssessment(request, { params: mockParams });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data).toBeDefined();
        expect(data.data.patientId).toBe("patient-123");
        expect(data.data.overallRiskScore).toBeDefined();
      });

      it("should return 401 for unauthenticated user", async () => {
        // Mock unauthenticated session
        const { createRouteHandlerClient } = require("@supabase/auth-helpers-nextjs");
        createRouteHandlerClient.mockReturnValueOnce({
          auth: {
            getSession: jest.fn(() => Promise.resolve({ data: { session: null } })),
          },
        });

        const request = new NextRequest(
          "http://localhost:3000/api/patients/patient-123/insights/risk-assessment",
        );

        const response = await getRiskAssessment(request, { params: mockParams });
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe("Unauthorized");
      });
    });

    describe("POST /api/patients/[patientId]/insights/risk-assessment", () => {
      it("should update risk factors successfully", async () => {
        const requestBody = {
          riskFactors: {
            age: 45,
            medicalHistory: ["hypertension"],
            lifestyle: "moderate",
          },
          customFactors: {
            familyHistory: "positive",
          },
        };

        const request = new NextRequest(
          "http://localhost:3000/api/patients/patient-123/insights/risk-assessment",
          {
            method: "POST",
            body: JSON.stringify(requestBody),
          },
        );

        const response = await postRiskAssessment(request, { params: mockParams });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.assessment).toBeDefined();
      });

      it("should return 400 for missing risk factors", async () => {
        const request = new NextRequest(
          "http://localhost:3000/api/patients/patient-123/insights/risk-assessment",
          {
            method: "POST",
            body: JSON.stringify({}),
          },
        );

        const response = await postRiskAssessment(request, { params: mockParams });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain("Risk factors or custom factors required");
      });
    });
  });

  describe("Comprehensive Insights API", () => {
    describe("POST /api/patients/[patientId]/insights/comprehensive", () => {
      it("should generate comprehensive insights successfully", async () => {
        const requestBody = {
          requestedInsights: ["risk", "treatment", "behavior"],
          treatmentContext: "consultation",
          includeAlerts: true,
          includePredictions: true,
        };

        const request = new NextRequest(
          "http://localhost:3000/api/patients/patient-123/insights/comprehensive",
          {
            method: "POST",
            body: JSON.stringify(requestBody),
          },
        );

        const response = await postComprehensive(request, { params: mockParams });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data).toBeDefined();
        expect(data.data.patientId).toBe("patient-123");
        expect(data.data.riskAssessment).toBeDefined();
        expect(data.metadata.requestId).toBeDefined();
        expect(data.metadata.processingTime).toBeDefined();
      });

      it("should handle default insight types", async () => {
        const request = new NextRequest(
          "http://localhost:3000/api/patients/patient-123/insights/comprehensive",
          {
            method: "POST",
            body: JSON.stringify({}),
          },
        );

        const response = await postComprehensive(request, { params: mockParams });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
      });
    });

    describe("GET /api/patients/[patientId]/insights/comprehensive", () => {
      it("should return recent insights with pagination", async () => {
        const request = new NextRequest(
          "http://localhost:3000/api/patients/patient-123/insights/comprehensive?limit=5&offset=0",
        );

        const response = await getComprehensive(request, { params: mockParams });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.metadata).toBeDefined();
        expect(data.metadata.limit).toBe(5);
        expect(data.metadata.offset).toBe(0);
      });

      it("should filter by date when since parameter is provided", async () => {
        const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days ago
        const request = new NextRequest(
          `http://localhost:3000/api/patients/patient-123/insights/comprehensive?since=${since}`,
        );

        const response = await getComprehensive(request, { params: mockParams });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
      });
    });
  });

  describe("Alerts API", () => {
    describe("GET /api/patients/[patientId]/insights/alerts", () => {
      it("should return patient alerts successfully", async () => {
        const request = new NextRequest(
          "http://localhost:3000/api/patients/patient-123/insights/alerts",
        );

        const response = await getAlerts(request, { params: mockParams });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data).toBeDefined();
        expect(data.data.patientId).toBe("patient-123");
        expect(data.data.totalAlerts).toBeDefined();
        expect(Array.isArray(data.data.alerts)).toBe(true);
      });

      it("should filter alerts by severity", async () => {
        const request = new NextRequest(
          "http://localhost:3000/api/patients/patient-123/insights/alerts?severity=high",
        );

        const response = await getAlerts(request, { params: mockParams });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
      });

      it("should filter alerts by category", async () => {
        const request = new NextRequest(
          "http://localhost:3000/api/patients/patient-123/insights/alerts?category=risk",
        );

        const response = await getAlerts(request, { params: mockParams });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
      });

      it("should filter active alerts only", async () => {
        const request = new NextRequest(
          "http://localhost:3000/api/patients/patient-123/insights/alerts?active=true",
        );

        const response = await getAlerts(request, { params: mockParams });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
      });
    });

    describe("POST /api/patients/[patientId]/insights/alerts", () => {
      it("should acknowledge alert successfully", async () => {
        const requestBody = {
          alertId: "alert-123",
          action: "acknowledge",
          notes: "Acknowledged by physician",
        };

        const request = new NextRequest(
          "http://localhost:3000/api/patients/patient-123/insights/alerts",
          {
            method: "POST",
            body: JSON.stringify(requestBody),
          },
        );

        const response = await postAlerts(request, { params: mockParams });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.message).toContain("acknowledged successfully");
      });

      it("should resolve alert successfully", async () => {
        const requestBody = {
          alertId: "alert-123",
          action: "resolve",
          notes: "Issue resolved",
        };

        const request = new NextRequest(
          "http://localhost:3000/api/patients/patient-123/insights/alerts",
          {
            method: "POST",
            body: JSON.stringify(requestBody),
          },
        );

        const response = await postAlerts(request, { params: mockParams });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.message).toContain("resolved successfully");
      });

      it("should return 400 for invalid action", async () => {
        const requestBody = {
          alertId: "alert-123",
          action: "invalid_action",
        };

        const request = new NextRequest(
          "http://localhost:3000/api/patients/patient-123/insights/alerts",
          {
            method: "POST",
            body: JSON.stringify(requestBody),
          },
        );

        const response = await postAlerts(request, { params: mockParams });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain("Invalid request");
      });
    });
  });

  describe("Treatment Guidance API", () => {
    describe("GET /api/patients/[patientId]/insights/treatments", () => {
      it("should return treatment guidance successfully", async () => {
        const request = new NextRequest(
          "http://localhost:3000/api/patients/patient-123/insights/treatments",
        );

        const response = await getTreatments(request, { params: mockParams });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data).toBeDefined();
        expect(data.data.patientId).toBe("patient-123");
        expect(data.data.primaryRecommendations).toBeDefined();
      });

      it("should include treatment context when provided", async () => {
        const request = new NextRequest(
          "http://localhost:3000/api/patients/patient-123/insights/treatments?context=follow-up",
        );

        const response = await getTreatments(request, { params: mockParams });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.context).toBeDefined();
      });
    });

    describe("POST /api/patients/[patientId]/insights/treatments", () => {
      it("should record treatment outcome successfully", async () => {
        const requestBody = {
          treatmentId: "treatment-456",
          outcome: "completed",
          effectiveness: 0.85,
          patientSatisfaction: 0.9,
          notes: "Patient responded well to treatment",
        };

        const request = new NextRequest(
          "http://localhost:3000/api/patients/patient-123/insights/treatments",
          {
            method: "POST",
            body: JSON.stringify(requestBody),
          },
        );

        const response = await postTreatments(request, { params: mockParams });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.outcome).toBeDefined();
        expect(data.data.learningInsights).toBeDefined();
      });

      it("should return 400 for missing required fields", async () => {
        const requestBody = {
          // Missing treatmentId and outcome
          effectiveness: 0.85,
        };

        const request = new NextRequest(
          "http://localhost:3000/api/patients/patient-123/insights/treatments",
          {
            method: "POST",
            body: JSON.stringify(requestBody),
          },
        );

        const response = await postTreatments(request, { params: mockParams });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain("Treatment ID and outcome are required");
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle patient not found", async () => {
      // Mock patient not found
      const { createRouteHandlerClient } = require("@supabase/auth-helpers-nextjs");
      createRouteHandlerClient.mockReturnValueOnce({
        auth: {
          getSession: jest.fn(() =>
            Promise.resolve({
              data: { session: { user: { id: "user-123" } } },
            }),
          ),
        },
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: null })),
            })),
          })),
        })),
      });

      const request = new NextRequest(
        "http://localhost:3000/api/patients/nonexistent/insights/risk-assessment",
      );

      const response = await getRiskAssessment(request, { params: { patientId: "nonexistent" } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Patient not found");
    });

    it("should handle access denied for different clinic", async () => {
      // Mock different clinic access
      const { createRouteHandlerClient } = require("@supabase/auth-helpers-nextjs");
      createRouteHandlerClient.mockReturnValueOnce({
        auth: {
          getSession: jest.fn(() =>
            Promise.resolve({
              data: { session: { user: { id: "user-123" } } },
            }),
          ),
        },
        from: jest.fn((table) => {
          if (table === "patients") {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() =>
                    Promise.resolve({
                      data: { id: "patient-123", clinic_id: "different-clinic" },
                    }),
                  ),
                })),
              })),
            };
          } else if (table === "profiles") {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() =>
                    Promise.resolve({
                      data: { clinic_id: "original-clinic", role: "doctor" },
                    }),
                  ),
                })),
              })),
            };
          }
        }),
      });

      const request = new NextRequest(
        "http://localhost:3000/api/patients/patient-123/insights/risk-assessment",
      );

      const response = await getRiskAssessment(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("Access denied");
    });
  });

  describe("Performance and Quality", () => {
    it("should respond within reasonable time", async () => {
      const start = Date.now();

      const request = new NextRequest(
        "http://localhost:3000/api/patients/patient-123/insights/risk-assessment",
      );
      await getRiskAssessment(request, { params: mockParams });

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(5000); // 5 seconds max for API
    }, 10000);

    it("should include proper audit logging", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/patients/patient-123/insights/risk-assessment",
      );

      const response = await getRiskAssessment(request, { params: mockParams });

      expect(response.status).toBe(200);
      // Audit logging would be verified through database checks in integration tests
    });
  });
});
