import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { NextRequest } from "next/server";
import { POST, GET, PUT, DELETE } from "@/app/api/scheduling/confirmations/route";

// Mock dependencies
jest.mock("@/app/utils/supabase/server");
jest.mock("@/lib/communication/scheduling-templates");
jest.mock("@/lib/communication/scheduling-workflow");
jest.mock("@/lib/communication/communication-service");
jest.mock("@/lib/communication/no-show-predictor");

const mockSupabase = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
        neq: jest.fn(() => ({
          single: jest.fn(),
        })),
        order: jest.fn(),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(),
        select: jest.fn(),
      })),
      gte: jest.fn(() => ({
        lte: jest.fn(() => ({
          order: jest.fn(),
        })),
      })),
    })),
  })),
};

const mockCreateClient = jest.fn(() => Promise.resolve(mockSupabase));

beforeEach(() => {
  jest.clearAllMocks();
  require("@/app/utils/supabase/server").createClient = mockCreateClient;
});

describe("/api/scheduling/confirmations", () => {
  const mockUser = {
    id: "user-123",
    email: "test@example.com",
  };

  const mockAppointment = {
    id: "appointment-123",
    patient_id: "patient-123",
    clinic_id: "clinic-123",
    date: "2024-01-15T10:00:00Z",
    status: "scheduled",
    patients: {
      id: "patient-123",
      name: "João Silva",
      phone: "+5511999999999",
      email: "joao@example.com",
    },
    professionals: {
      id: "prof-123",
      name: "Dr. Maria Santos",
    },
    services: {
      id: "service-123",
      name: "Consulta Dermatológica",
      category: "dermatology",
    },
    clinics: {
      id: "clinic-123",
      name: "Clínica Beleza",
      phone: "+5511888888888",
    },
  };

  const mockConfirmation = {
    id: "confirmation-123",
    appointment_id: "appointment-123",
    patient_id: "patient-123",
    clinic_id: "clinic-123",
    confirmation_token: "token-123",
    status: "pending",
    send_at: "2024-01-14T09:00:00Z",
    expires_at: "2024-01-15T09:00:00Z",
    timeout_hours: 24,
    channels: ["whatsapp"],
    appointments: mockAppointment,
    patients: mockAppointment.patients,
    clinics: mockAppointment.clinics,
  };

  describe("POST /api/scheduling/confirmations", () => {
    it("should create confirmation request using workflow by default", async () => {
      // Setup mocks
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockImplementation((table) => {
        if (table === "appointments") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockAppointment,
                  error: null,
                }),
              }),
            }),
          };
        } else if (table === "appointment_confirmations") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                neq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: null,
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
      });

      // Mock workflow
      const mockWorkflows = [
        {
          id: "workflow-123",
          workflowType: "confirmation",
          scheduledAt: new Date("2024-01-14T09:00:00Z"),
          status: "scheduled",
          metadata: { confirmationToken: "token-123" },
          steps: [
            { id: "step-1", type: "predict_no_show" },
            { id: "step-2", type: "send_message" },
            { id: "step-3", type: "wait_response" },
          ],
        },
      ];

      const mockWorkflowModule = require("@/lib/communication/scheduling-workflow");
      mockWorkflowModule.schedulingCommunicationWorkflow = {
        initializeWorkflows: jest.fn().mockResolvedValue(mockWorkflows),
      };

      const request = new NextRequest("http://localhost:3000/api/scheduling/confirmations", {
        method: "POST",
        body: JSON.stringify({
          appointmentId: "appointment-123",
          sendTime: "09:00",
          timeoutHours: 24,
          channels: ["whatsapp"],
          useWorkflow: true,
          useNoShowPrediction: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.method).toBe("workflow");
      expect(data.workflowId).toBe("workflow-123");
      expect(data.confirmationToken).toBe("token-123");
      expect(data.steps).toBe(3);
      expect(
        mockWorkflowModule.schedulingCommunicationWorkflow.initializeWorkflows,
      ).toHaveBeenCalledWith(
        "appointment-123",
        expect.objectContaining({
          confirmationSettings: expect.objectContaining({
            enableConfirmationRequests: true,
            sendTime: "09:00",
            timeoutHours: 24,
          }),
          noShowPrevention: expect.objectContaining({
            enabled: true,
            probabilityThreshold: 0.6,
          }),
        }),
      );
    });

    it("should create legacy confirmation when workflow disabled", async () => {
      // Setup mocks
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockImplementation((table) => {
        if (table === "appointments") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockAppointment,
                  error: null,
                }),
              }),
            }),
          };
        } else if (table === "appointment_confirmations") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                neq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: null,
                    error: null,
                  }),
                }),
              }),
            }),
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockConfirmation,
                  error: null,
                }),
              }),
            }),
          };
        }
      });

      // Mock no-show predictor
      const mockPredictor = {
        predict: jest.fn().mockResolvedValue({
          probability: 0.3,
          factors: ["historical_attendance"],
        }),
      };

      const mockPredictorModule = require("@/lib/communication/no-show-predictor");
      mockPredictorModule.NoShowPredictor = jest.fn(() => mockPredictor);

      const request = new NextRequest("http://localhost:3000/api/scheduling/confirmations", {
        method: "POST",
        body: JSON.stringify({
          appointmentId: "appointment-123",
          sendTime: "09:00",
          timeoutHours: 24,
          channels: ["whatsapp"],
          useWorkflow: false,
          useNoShowPrediction: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.method).toBe("legacy");
      expect(data.confirmation).toEqual(mockConfirmation);
      expect(data.confirmationToken).toBeDefined();
      expect(mockPredictor.predict).toHaveBeenCalledWith("appointment-123");
    });

    it("should prevent duplicate confirmation requests", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockImplementation((table) => {
        if (table === "appointments") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockAppointment,
                  error: null,
                }),
              }),
            }),
          };
        } else if (table === "appointment_confirmations") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                neq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: mockConfirmation,
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
      });

      const request = new NextRequest("http://localhost:3000/api/scheduling/confirmations", {
        method: "POST",
        body: JSON.stringify({
          appointmentId: "appointment-123",
          useWorkflow: false,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toContain("already exists");
      expect(data.existing).toEqual(mockConfirmation);
    });

    it("should handle appointment not found", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: new Error("Not found"),
            }),
          }),
        }),
      });

      const request = new NextRequest("http://localhost:3000/api/scheduling/confirmations", {
        method: "POST",
        body: JSON.stringify({
          appointmentId: "appointment-123",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Appointment not found");
    });
  });

  describe("PUT /api/scheduling/confirmations", () => {
    it("should handle patient confirmation response", async () => {
      const confirmedConfirmation = {
        ...mockConfirmation,
        expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
      };

      mockSupabase.from.mockImplementation((table) => {
        if (table === "appointment_confirmations") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: confirmedConfirmation,
                  error: null,
                }),
              }),
            }),
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            }),
          };
        } else if (table === "appointments") {
          return {
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            }),
          };
        }
      });

      // Mock communication service for clinic notification
      const mockCommunicationService = {
        sendMessage: jest.fn().mockResolvedValue({
          success: true,
          messageId: "msg-123",
        }),
      };

      const mockCommModule = require("@/lib/communication/communication-service");
      mockCommModule.CommunicationService = jest.fn(() => mockCommunicationService);

      const request = new NextRequest("http://localhost:3000/api/scheduling/confirmations", {
        method: "PUT",
        body: JSON.stringify({
          confirmationToken: "token-123",
          response: "confirmed",
          notes: "Paciente confirmou presença",
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.response).toBe("confirmed");
      expect(data.appointmentId).toBe("appointment-123");
      expect(data.nextSteps).toEqual(expect.arrayContaining(["Sua consulta está confirmada"]));
    });

    it("should handle reschedule requests", async () => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === "appointment_confirmations") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: {
                    ...mockConfirmation,
                    expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
                  },
                  error: null,
                }),
              }),
            }),
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            }),
          };
        } else if (table === "appointments") {
          return {
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            }),
          };
        }
      });

      const request = new NextRequest("http://localhost:3000/api/scheduling/confirmations", {
        method: "PUT",
        body: JSON.stringify({
          confirmationToken: "token-123",
          response: "reschedule",
          rescheduleDate: "2024-01-20",
          rescheduleTime: "14:00",
          notes: "Preciso reagendar para outro dia",
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.response).toBe("reschedule");
      expect(data.nextSteps).toEqual(
        expect.arrayContaining(["Solicitação de reagendamento enviada"]),
      );
    });

    it("should reject expired confirmation tokens", async () => {
      const expiredConfirmation = {
        ...mockConfirmation,
        expires_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: expiredConfirmation,
              error: null,
            }),
          }),
        }),
      });

      const request = new NextRequest("http://localhost:3000/api/scheduling/confirmations", {
        method: "PUT",
        body: JSON.stringify({
          confirmationToken: "token-123",
          response: "confirmed",
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(410);
      expect(data.error).toContain("expired");
    });

    it("should reject duplicate responses", async () => {
      const respondedConfirmation = {
        ...mockConfirmation,
        status: "confirmed",
        expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: respondedConfirmation,
              error: null,
            }),
          }),
        }),
      });

      const request = new NextRequest("http://localhost:3000/api/scheduling/confirmations", {
        method: "PUT",
        body: JSON.stringify({
          confirmationToken: "token-123",
          response: "confirmed",
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toContain("Already responded");
      expect(data.currentResponse).toBe("confirmed");
    });

    it("should handle invalid confirmation tokens", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: new Error("Not found"),
            }),
          }),
        }),
      });

      const request = new NextRequest("http://localhost:3000/api/scheduling/confirmations", {
        method: "PUT",
        body: JSON.stringify({
          confirmationToken: "invalid-token",
          response: "confirmed",
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Invalid confirmation token");
    });
  });

  describe("GET /api/scheduling/confirmations", () => {
    it("should fetch confirmations with filters for authenticated users", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockConfirmations = [
        {
          ...mockConfirmation,
          id: "confirmation-1",
          status: "pending",
          expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          ...mockConfirmation,
          id: "confirmation-2",
          status: "confirmed",
          expires_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockConfirmations,
              error: null,
            }),
          }),
        }),
      });

      const request = new NextRequest(
        "http://localhost:3000/api/scheduling/confirmations?clinicId=clinic-123&status=pending",
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.confirmations).toHaveLength(2);
      expect(data.count).toBe(2);
      expect(data.summary).toEqual({
        pending: 1,
        confirmed: 1,
        cancelled: 0,
        reschedule: 0,
        expired: 1,
      });
      expect(data.confirmations[0]).toHaveProperty("expired", false);
      expect(data.confirmations[1]).toHaveProperty("expired", true);
    });

    it("should fetch single confirmation by token (public endpoint)", async () => {
      const publicConfirmation = {
        ...mockConfirmation,
        expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: publicConfirmation,
              error: null,
            }),
          }),
        }),
      });

      const request = new NextRequest(
        "http://localhost:3000/api/scheduling/confirmations?token=token-123",
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.confirmation.id).toBe("confirmation-123");
      expect(data.confirmation.expired).toBe(false);
      expect(data.confirmation.appointments).toBeDefined();
      expect(data.confirmation.patients).toBeDefined();
    });

    it("should handle invalid tokens gracefully", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: new Error("Not found"),
            }),
          }),
        }),
      });

      const request = new NextRequest(
        "http://localhost:3000/api/scheduling/confirmations?token=invalid-token",
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Invalid confirmation token");
    });
  });

  describe("DELETE /api/scheduling/confirmations", () => {
    it("should expire confirmation by ID", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue({
              data: [mockConfirmation],
              error: null,
            }),
          }),
        }),
      });

      const request = new NextRequest(
        "http://localhost:3000/api/scheduling/confirmations?id=confirmation-123",
        {
          method: "DELETE",
        },
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.expired).toBe(1);
      expect(data.message).toContain("Expired 1 confirmation");
    });

    it("should expire confirmations by appointment ID", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue({
              data: [mockConfirmation],
              error: null,
            }),
          }),
        }),
      });

      const request = new NextRequest(
        "http://localhost:3000/api/scheduling/confirmations?appointmentId=appointment-123",
        {
          method: "DELETE",
        },
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.expired).toBe(1);
    });

    it("should require either confirmationId or appointmentId", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const request = new NextRequest("http://localhost:3000/api/scheduling/confirmations", {
        method: "DELETE",
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("required");
    });
  });

  describe("Error handling", () => {
    it("should handle authentication errors", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error("Unauthorized"),
      });

      const request = new NextRequest("http://localhost:3000/api/scheduling/confirmations", {
        method: "POST",
        body: JSON.stringify({
          appointmentId: "appointment-123",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should validate request schemas", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const request = new NextRequest("http://localhost:3000/api/scheduling/confirmations", {
        method: "POST",
        body: JSON.stringify({
          appointmentId: "invalid-uuid",
          sendTime: "invalid-time",
          timeoutHours: "not-a-number",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid request data");
      expect(data.details).toBeDefined();
    });

    it("should handle database errors gracefully", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockRejectedValue(new Error("Database connection failed")),
          }),
        }),
      });

      const request = new NextRequest("http://localhost:3000/api/scheduling/confirmations", {
        method: "POST",
        body: JSON.stringify({
          appointmentId: "appointment-123",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });
  });
});
