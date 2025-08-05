var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
var __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
var __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    var _ = {
        label: 0,
        sent: () => {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g.throw = verb(1)),
      (g.return = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return (v) => step([n, v]);
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y.return
                  : op[0]
                    ? y.throw || ((t = y.return) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  });
Object.defineProperty(exports, "__esModule", { value: true });
var globals_1 = require("@jest/globals");
var scheduling_workflow_1 = require("@/lib/communication/scheduling-workflow");
// Mock dependencies
globals_1.jest.mock("@/app/utils/supabase/server");
globals_1.jest.mock("@/lib/communication/communication-service");
globals_1.jest.mock("@/lib/communication/no-show-predictor");
globals_1.jest.mock("@/lib/communication/scheduling-templates");
var mockSupabase = {
  from: globals_1.jest.fn(() => ({
    select: globals_1.jest.fn(() => ({
      eq: globals_1.jest.fn(() => ({
        single: globals_1.jest.fn(),
        order: globals_1.jest.fn(),
        limit: globals_1.jest.fn(),
      })),
      insert: globals_1.jest.fn(),
      update: globals_1.jest.fn(() => ({
        eq: globals_1.jest.fn(),
      })),
      neq: globals_1.jest.fn(() => ({
        order: globals_1.jest.fn(() => ({
          limit: globals_1.jest.fn(() => ({
            single: globals_1.jest.fn(),
          })),
        })),
      })),
    })),
  })),
};
var mockCreateClient = globals_1.jest.fn(() => mockSupabase);
(0, globals_1.beforeEach)(() => {
  globals_1.jest.clearAllMocks();
  require("@/app/utils/supabase/server").createClient = mockCreateClient;
});
(0, globals_1.describe)("SchedulingCommunicationWorkflow", () => {
  var workflow;
  var mockAppointment = {
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
  (0, globals_1.beforeEach)(() => {
    workflow = new scheduling_workflow_1.SchedulingCommunicationWorkflow();
  });
  (0, globals_1.describe)("initializeWorkflows", () => {
    (0, globals_1.it)("should create reminder workflows based on configuration", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockPredictor,
          mockPredictorModule,
          config,
          workflows,
          reminderWorkflows,
          reminder24h,
          confirmationWorkflow;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              // Mock appointment data
              mockSupabase.from.mockImplementation((table) => {
                if (table === "appointments") {
                  return {
                    select: globals_1.jest.fn().mockReturnValue({
                      eq: globals_1.jest.fn().mockReturnValue({
                        single: globals_1.jest.fn().mockResolvedValue({
                          data: mockAppointment,
                          error: null,
                        }),
                      }),
                    }),
                  };
                } else if (table === "clinic_workflow_configs") {
                  return {
                    select: globals_1.jest.fn().mockReturnValue({
                      eq: globals_1.jest.fn().mockReturnValue({
                        single: globals_1.jest.fn().mockResolvedValue({
                          data: null,
                          error: null,
                        }),
                      }),
                    }),
                  };
                } else if (table === "communication_workflows") {
                  return {
                    insert: globals_1.jest.fn().mockResolvedValue({
                      data: null,
                      error: null,
                    }),
                  };
                }
              });
              mockPredictor = {
                predict: globals_1.jest.fn().mockResolvedValue({
                  probability: 0.3,
                  factors: ["historical_attendance"],
                }),
              };
              mockPredictorModule = require("@/lib/communication/no-show-predictor");
              mockPredictorModule.NoShowPredictor = globals_1.jest.fn(() => mockPredictor);
              config = {
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
              return [4 /*yield*/, workflow.initializeWorkflows("appointment-123", config)];
            case 1:
              workflows = _a.sent();
              (0, globals_1.expect)(workflows).toHaveLength(3); // 2 reminders + 1 confirmation
              reminderWorkflows = workflows.filter((w) => w.workflowType === "reminder");
              (0, globals_1.expect)(reminderWorkflows).toHaveLength(2);
              reminder24h = reminderWorkflows.find((w) => w.metadata.timing === "24h");
              (0, globals_1.expect)(reminder24h).toBeDefined();
              (0, globals_1.expect)(
                reminder24h === null || reminder24h === void 0 ? void 0 : reminder24h.steps,
              ).toHaveLength(2); // send + wait
              (0, globals_1.expect)(
                reminder24h === null || reminder24h === void 0 ? void 0 : reminder24h.scheduledAt,
              ).toBeInstanceOf(Date);
              confirmationWorkflow = workflows.find((w) => w.workflowType === "confirmation");
              (0, globals_1.expect)(confirmationWorkflow).toBeDefined();
              (0, globals_1.expect)(
                confirmationWorkflow === null || confirmationWorkflow === void 0
                  ? void 0
                  : confirmationWorkflow.steps,
              ).toHaveLength(3); // predict + send + wait
              (0, globals_1.expect)(
                confirmationWorkflow === null || confirmationWorkflow === void 0
                  ? void 0
                  : confirmationWorkflow.metadata.confirmationToken,
              ).toBeDefined();
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should create no-show prevention workflow for high-risk appointments", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockPredictor, config, workflows, noShowWorkflow;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              // Mock appointment data
              mockSupabase.from.mockImplementation((table) => {
                if (table === "appointments") {
                  return {
                    select: globals_1.jest.fn().mockReturnValue({
                      eq: globals_1.jest.fn().mockReturnValue({
                        single: globals_1.jest.fn().mockResolvedValue({
                          data: mockAppointment,
                          error: null,
                        }),
                      }),
                    }),
                  };
                } else if (table === "clinic_workflow_configs") {
                  return {
                    select: globals_1.jest.fn().mockReturnValue({
                      eq: globals_1.jest.fn().mockReturnValue({
                        single: globals_1.jest.fn().mockResolvedValue({
                          data: null,
                          error: null,
                        }),
                      }),
                    }),
                  };
                } else if (table === "communication_workflows") {
                  return {
                    insert: globals_1.jest.fn().mockResolvedValue({
                      data: null,
                      error: null,
                    }),
                  };
                }
              });
              mockPredictor = {
                predict: globals_1.jest.fn().mockResolvedValue({
                  probability: 0.8, // High risk
                  factors: ["multiple_no_shows", "late_booking"],
                  riskLevel: "high",
                  interventionRecommended: true,
                }),
              };
              // Replace the noShowPredictor instance in the workflow
              workflow.noShowPredictor = mockPredictor;
              config = {
                noShowPrevention: {
                  enabled: true,
                  probabilityThreshold: 0.7,
                  interventionTiming: "4h",
                  specialHandling: true,
                },
              };
              return [4 /*yield*/, workflow.initializeWorkflows("appointment-123", config)];
            case 1:
              workflows = _a.sent();
              noShowWorkflow = workflows.find((w) => w.workflowType === "no_show_prevention");
              (0, globals_1.expect)(noShowWorkflow).toBeDefined();
              (0, globals_1.expect)(
                noShowWorkflow === null || noShowWorkflow === void 0
                  ? void 0
                  : noShowWorkflow.steps,
              ).toHaveLength(3); // send + wait + escalate
              (0, globals_1.expect)(
                noShowWorkflow === null || noShowWorkflow === void 0
                  ? void 0
                  : noShowWorkflow.metadata.noShowPrediction.probability,
              ).toBe(0.8);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should skip workflows for past appointments", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var pastAppointment, config, workflows;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              pastAppointment = __assign(__assign({}, mockAppointment), {
                date: "2023-01-15T10:00:00Z", // Past date
              });
              mockSupabase.from.mockImplementation((table) => {
                if (table === "appointments") {
                  return {
                    select: globals_1.jest.fn().mockReturnValue({
                      eq: globals_1.jest.fn().mockReturnValue({
                        single: globals_1.jest.fn().mockResolvedValue({
                          data: pastAppointment,
                          error: null,
                        }),
                      }),
                    }),
                  };
                } else if (table === "clinic_workflow_configs") {
                  return {
                    select: globals_1.jest.fn().mockReturnValue({
                      eq: globals_1.jest.fn().mockReturnValue({
                        single: globals_1.jest.fn().mockResolvedValue({
                          data: null,
                          error: null,
                        }),
                      }),
                    }),
                  };
                }
              });
              config = {
                reminderSettings: {
                  enabled24h: true,
                  enabled2h: true,
                  enabled30m: true,
                  channels: ["whatsapp"],
                  preferredChannel: "whatsapp",
                },
              };
              return [4 /*yield*/, workflow.initializeWorkflows("appointment-123", config)];
            case 1:
              workflows = _a.sent();
              (0, globals_1.expect)(workflows).toHaveLength(0);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should return empty array when workflows disabled", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var workflows;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSupabase.from.mockImplementation((table) => {
                if (table === "appointments") {
                  return {
                    select: globals_1.jest.fn().mockReturnValue({
                      eq: globals_1.jest.fn().mockReturnValue({
                        single: globals_1.jest.fn().mockResolvedValue({
                          data: mockAppointment,
                          error: null,
                        }),
                      }),
                    }),
                  };
                } else if (table === "clinic_workflow_configs") {
                  return {
                    select: globals_1.jest.fn().mockReturnValue({
                      eq: globals_1.jest.fn().mockReturnValue({
                        single: globals_1.jest.fn().mockResolvedValue({
                          data: { config: { enabled: false } },
                          error: null,
                        }),
                      }),
                    }),
                  };
                }
              });
              return [4 /*yield*/, workflow.initializeWorkflows("appointment-123")];
            case 1:
              workflows = _a.sent();
              (0, globals_1.expect)(workflows).toHaveLength(0);
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("executeWorkflow", () => {
    (0, globals_1.it)("should execute workflow steps in sequence", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockWorkflow,
          mockCommunicationService,
          mockCommModule,
          mockTemplate,
          mockTemplateEngine,
          mockTemplateModule,
          results;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockWorkflow = {
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
                    select: globals_1.jest.fn().mockReturnValue({
                      eq: globals_1.jest.fn().mockReturnValue({
                        single: globals_1.jest.fn().mockResolvedValue({
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
                    update: globals_1.jest.fn().mockReturnValue({
                      eq: globals_1.jest.fn().mockResolvedValue({
                        data: null,
                        error: null,
                      }),
                    }),
                  };
                } else if (table === "appointments") {
                  return {
                    select: globals_1.jest.fn().mockReturnValue({
                      eq: globals_1.jest.fn().mockReturnValue({
                        single: globals_1.jest.fn().mockResolvedValue({
                          data: mockAppointment,
                          error: null,
                        }),
                      }),
                    }),
                  };
                } else if (table === "appointment_confirmations") {
                  return {
                    select: globals_1.jest.fn().mockReturnValue({
                      eq: globals_1.jest.fn().mockReturnValue({
                        neq: globals_1.jest.fn().mockReturnValue({
                          order: globals_1.jest.fn().mockReturnValue({
                            limit: globals_1.jest.fn().mockReturnValue({
                              single: globals_1.jest.fn().mockResolvedValue({
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
              mockCommunicationService = {
                sendMessage: globals_1.jest.fn().mockResolvedValue({
                  success: true,
                  messageId: "msg-123",
                  cost: 0.05,
                }),
              };
              mockCommModule = require("@/lib/communication/communication-service");
              mockCommModule.CommunicationService = globals_1.jest.fn(
                () => mockCommunicationService,
              );
              // Apply mock directly to workflow instance
              workflow.communicationService = mockCommunicationService;
              mockTemplate = {
                id: "template-123",
                type: "reminder",
              };
              mockTemplateEngine = {
                selectBestTemplate: globals_1.jest.fn().mockReturnValue(mockTemplate),
                renderTemplate: globals_1.jest
                  .fn()
                  .mockResolvedValue("Lembrete: Sua consulta é amanhã às 10:00"),
              };
              mockTemplateModule = require("@/lib/communication/scheduling-templates");
              mockTemplateModule.schedulingTemplateEngine = mockTemplateEngine;
              return [4 /*yield*/, workflow.executeWorkflow("workflow-123")];
            case 1:
              results = _a.sent();
              (0, globals_1.expect)(results.messagesSent).toBe(1);
              (0, globals_1.expect)(results.messagesDelivered).toBe(1);
              (0, globals_1.expect)(results.cost).toBe(0.05);
              (0, globals_1.expect)(mockCommunicationService.sendMessage).toHaveBeenCalledWith({
                patientId: "patient-123",
                clinicId: "clinic-123",
                appointmentId: "appointment-123",
                messageType: "reminder",
                templateId: "reminder_2h_all_services",
                channel: "whatsapp",
                variables: globals_1.expect.objectContaining({
                  patientName: "João Silva",
                  serviceName: "Consulta Dermatológica",
                  professionalName: "Dr. Maria Santos",
                  clinicName: "Clínica Beleza",
                }),
                customContent: globals_1.expect.objectContaining({
                  text: globals_1.expect.stringContaining("João Silva"),
                  buttons: globals_1.expect.any(Array),
                }),
              });
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should handle workflow not found", () =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSupabase.from.mockReturnValue({
                select: globals_1.jest.fn().mockReturnValue({
                  eq: globals_1.jest.fn().mockReturnValue({
                    single: globals_1.jest.fn().mockResolvedValue({
                      data: null,
                      error: new Error("Not found"),
                    }),
                  }),
                }),
              });
              return [
                4 /*yield*/,
                (0, globals_1.expect)(
                  workflow.executeWorkflow("nonexistent-workflow"),
                ).rejects.toThrow("Workflow not found or not schedulable"),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
  });
});
