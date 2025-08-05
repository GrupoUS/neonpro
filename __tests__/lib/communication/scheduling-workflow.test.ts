import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import {
  SchedulingCommunicationWorkflow,
  WorkflowConfig,
  WorkflowExecution,
} from "@/lib/communication/scheduling-workflow";

// Mock dependencies
jest.mock("@/app/utils/supabase/server");
jest.mock("@/lib/communication/communication-service");
jest.mock("@/lib/communication/no-show-predictor");
jest.mock("@/lib/communication/scheduling-templates");

const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
        order: jest.fn(),
        limit: jest.fn(),
      })),
      insert: jest.fn(),
      update: jest.fn(() => ({
        eq: jest.fn(),
      })),
      neq: jest.fn(() => ({
        order: jest.fn(() => ({
          limit: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
      })),
    })),
  })),
};

const mockCreateClient = jest.fn(() => mockSupabase);

beforeEach(() => {
  jest.clearAllMocks();
  require("@/app/utils/supabase/server").createClient = mockCreateClient;
});

describe("SchedulingCommunicationWorkflow", () => {
  let workflow: SchedulingCommunicationWorkflow;

  const mockAppointment = {
    id: "appointment-123",
    patient_id: "patient-123",
    clinic_id: "clinic-123",
    date: "2025-12-15T10:00:00Z",
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

  beforeEach(() => {
    workflow = new SchedulingCommunicationWorkflow();
  });

  describe("initializeWorkflows", () => {
    it("should create reminder workflows based on configuration", async () => {
      // Mock appointment data
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
        } else if (table === "clinic_workflow_configs") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: null,
                }),
              }),
            }),
          };
        } else if (table === "communication_workflows") {
          return {
            insert: jest.fn().mockResolvedValue({
              data: null,
              error: null,
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

      const config: Partial<WorkflowConfig> = {
        reminderSettings: {
          enabled24h: true,
          enabled2h: true,
          enabled30m: false,
          channels: ["whatsapp", "sms"],
          preferredChannel: "whatsapp",
        },
        confirmationSettings: {
          enableConfirmationRequests: true,
          sendTime: "09:00",
          timeoutHours: 24,
          escalationChannels: ["sms"],
        },
      };

      const workflows = await workflow.initializeWorkflows("appointment-123", config);

      expect(workflows).toHaveLength(3); // 2 reminders + 1 confirmation

      // Verify reminder workflows
      const reminderWorkflows = workflows.filter((w) => w.workflowType === "reminder");
      expect(reminderWorkflows).toHaveLength(2);

      const reminder24h = reminderWorkflows.find((w) => w.metadata.timing === "24h");
      expect(reminder24h).toBeDefined();
      expect(reminder24h?.steps).toHaveLength(2); // send + wait
      expect(reminder24h?.scheduledAt).toBeInstanceOf(Date);

      // Verify confirmation workflow
      const confirmationWorkflow = workflows.find((w) => w.workflowType === "confirmation");
      expect(confirmationWorkflow).toBeDefined();
      expect(confirmationWorkflow?.steps).toHaveLength(3); // predict + send + wait
      expect(confirmationWorkflow?.metadata.confirmationToken).toBeDefined();
    });

    it("should create no-show prevention workflow for high-risk appointments", async () => {
      // Mock appointment data
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
        } else if (table === "clinic_workflow_configs") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: null,
                }),
              }),
            }),
          };
        } else if (table === "communication_workflows") {
          return {
            insert: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          };
        }
      });

      // Mock high no-show probability by replacing the instance method
      const mockPredictor = {
        predict: jest.fn().mockResolvedValue({
          probability: 0.8, // High risk
          factors: ["multiple_no_shows", "late_booking"],
          riskLevel: "high",
          interventionRecommended: true,
        }),
      };

      // Replace the noShowPredictor instance in the workflow
      workflow.noShowPredictor = mockPredictor;

      const config: Partial<WorkflowConfig> = {
        noShowPrevention: {
          enabled: true,
          probabilityThreshold: 0.7,
          interventionTiming: "4h",
          specialHandling: true,
        },
      };

      const workflows = await workflow.initializeWorkflows("appointment-123", config);

      const noShowWorkflow = workflows.find((w) => w.workflowType === "no_show_prevention");
      expect(noShowWorkflow).toBeDefined();
      expect(noShowWorkflow?.steps).toHaveLength(3); // send + wait + escalate
      expect(noShowWorkflow?.metadata.noShowPrediction.probability).toBe(0.8);
    });

    it("should skip workflows for past appointments", async () => {
      const pastAppointment = {
        ...mockAppointment,
        date: "2023-01-15T10:00:00Z", // Past date
      };

      mockSupabase.from.mockImplementation((table) => {
        if (table === "appointments") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: pastAppointment,
                  error: null,
                }),
              }),
            }),
          };
        } else if (table === "clinic_workflow_configs") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: null,
                }),
              }),
            }),
          };
        }
      });

      const config: Partial<WorkflowConfig> = {
        reminderSettings: {
          enabled24h: true,
          enabled2h: true,
          enabled30m: true,
          channels: ["whatsapp"],
          preferredChannel: "whatsapp",
        },
      };

      const workflows = await workflow.initializeWorkflows("appointment-123", config);

      expect(workflows).toHaveLength(0);
    });

    it("should return empty array when workflows disabled", async () => {
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
        } else if (table === "clinic_workflow_configs") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { config: { enabled: false } },
                  error: null,
                }),
              }),
            }),
          };
        }
      });

      const workflows = await workflow.initializeWorkflows("appointment-123");

      expect(workflows).toHaveLength(0);
    });
  });

  describe("executeWorkflow", () => {
    it("should execute workflow steps in sequence", async () => {
      const mockWorkflow: WorkflowExecution = {
        id: "workflow-123",
        appointmentId: "appointment-123",
        patientId: "patient-123",
        clinicId: "clinic-123",
        workflowType: "reminder",
        status: "scheduled",
        scheduledAt: new Date(),
        steps: [
          {
            id: "step-1",
            type: "send_message",
            status: "pending",
            scheduledAt: new Date(),
            input: {
              templateType: "reminder",
              channel: "whatsapp",
              timing: "24h",
            },
            output: null,
          },
          {
            id: "step-2",
            type: "wait_response",
            status: "pending",
            scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
            input: { timeoutHours: 2 },
            output: null,
          },
        ],
        results: {
          messagesSent: 0,
          messagesDelivered: 0,
          responseReceived: false,
          noShowPrevented: false,
          waitlistFilled: false,
          cost: 0,
          effectiveness: 0,
        },
        metadata: {
          timing: "24h",
          templateType: "reminder",
        },
      };

      // Mock workflow retrieval and update
      mockSupabase.from.mockImplementation((table) => {
        if (table === "communication_workflows") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: {
                    id: mockWorkflow.id,
                    appointment_id: mockWorkflow.appointmentId,
                    patient_id: mockWorkflow.patientId,
                    clinic_id: mockWorkflow.clinicId,
                    workflow_type: mockWorkflow.workflowType,
                    status: mockWorkflow.status,
                    scheduled_at: mockWorkflow.scheduledAt.toISOString(),
                    steps: mockWorkflow.steps,
                    results: mockWorkflow.results,
                    metadata: mockWorkflow.metadata,
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
                  order: jest.fn().mockReturnValue({
                    limit: jest.fn().mockReturnValue({
                      single: jest.fn().mockResolvedValue({
                        data: null,
                        error: null,
                      }),
                    }),
                  }),
                }),
              }),
            }),
          };
        }
      });

      // Mock communication service
      const mockCommunicationService = {
        sendMessage: jest.fn().mockResolvedValue({
          success: true,
          messageId: "msg-123",
          cost: 0.05,
        }),
      };
      const mockCommModule = require("@/lib/communication/communication-service");
      mockCommModule.CommunicationService = jest.fn(() => mockCommunicationService);

      // Apply mock directly to workflow instance
      workflow.communicationService = mockCommunicationService;

      // Mock template engine
      const mockTemplate = {
        id: "template-123",
        type: "reminder",
      };
      const mockTemplateEngine = {
        selectBestTemplate: jest.fn().mockReturnValue(mockTemplate),
        renderTemplate: jest.fn().mockResolvedValue("Lembrete: Sua consulta é amanhã às 10:00"),
      };
      const mockTemplateModule = require("@/lib/communication/scheduling-templates");
      mockTemplateModule.schedulingTemplateEngine = mockTemplateEngine;

      const results = await workflow.executeWorkflow("workflow-123");

      expect(results.messagesSent).toBe(1);
      expect(results.messagesDelivered).toBe(1);
      expect(results.cost).toBe(0.05);
      expect(mockCommunicationService.sendMessage).toHaveBeenCalledWith({
        patientId: "patient-123",
        clinicId: "clinic-123",
        appointmentId: "appointment-123",
        messageType: "reminder",
        templateId: "reminder_2h_all_services",
        channel: "whatsapp",
        variables: expect.objectContaining({
          patientName: "João Silva",
          serviceName: "Consulta Dermatológica",
          professionalName: "Dr. Maria Santos",
          clinicName: "Clínica Beleza",
        }),
        customContent: expect.objectContaining({
          text: expect.stringContaining("João Silva"),
          buttons: expect.any(Array),
        }),
      });
    });

    it("should handle workflow not found", async () => {
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

      await expect(workflow.executeWorkflow("nonexistent-workflow")).rejects.toThrow(
        "Workflow not found or not schedulable",
      );
    });
  });
});
