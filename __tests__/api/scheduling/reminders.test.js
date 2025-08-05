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
var server_1 = require("next/server");
var route_1 = require("@/app/api/scheduling/reminders/route");
// Mock dependencies
globals_1.jest.mock("@/app/utils/supabase/server");
globals_1.jest.mock("@/lib/communication/scheduling-templates");
globals_1.jest.mock("@/lib/communication/scheduling-workflow");
globals_1.jest.mock("@/lib/communication/communication-service");
var mockSupabase = {
  auth: {
    getUser: globals_1.jest.fn(),
  },
  from: globals_1.jest.fn(() => ({
    select: globals_1.jest.fn(() => ({
      eq: globals_1.jest.fn(() => ({
        single: globals_1.jest.fn(),
        order: globals_1.jest.fn(() => ({
          limit: globals_1.jest.fn(),
        })),
      })),
      insert: globals_1.jest.fn(() => ({
        select: globals_1.jest.fn(),
      })),
      gte: globals_1.jest.fn(() => ({
        lte: globals_1.jest.fn(() => ({
          order: globals_1.jest.fn(),
        })),
      })),
    })),
  })),
};
var mockCreateClient = globals_1.jest.fn(() => Promise.resolve(mockSupabase));
(0, globals_1.beforeEach)(() => {
  globals_1.jest.clearAllMocks();
  require("@/app/utils/supabase/server").createClient = mockCreateClient;
});
(0, globals_1.describe)("/api/scheduling/reminders", () => {
  var mockUser = {
    id: "350e8400-e29b-41d4-a716-446655440000",
    email: "test@example.com",
  };
  var mockAppointment = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    patient_id: "patient-123",
    clinic_id: "450e8400-e29b-41d4-a716-446655440000",
    date: "2024-01-15T10:00:00Z",
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
      id: "450e8400-e29b-41d4-a716-446655440000",
      name: "Clínica Beleza",
      phone: "+5511888888888",
    },
  };
  (0, globals_1.describe)("POST /api/scheduling/reminders", () => {
    (0, globals_1.it)("should schedule reminders using workflow by default", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockWorkflows, mockWorkflowModule, request, response, data;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              // Setup mocks
              mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
                error: null,
              });
              mockSupabase.from.mockReturnValue({
                select: globals_1.jest.fn().mockReturnValue({
                  eq: globals_1.jest.fn().mockReturnValue({
                    single: globals_1.jest.fn().mockResolvedValue({
                      data: mockAppointment,
                      error: null,
                    }),
                  }),
                }),
              });
              mockWorkflows = [
                {
                  id: "workflow-123",
                  workflowType: "reminder",
                  scheduledAt: new Date(),
                  status: "scheduled",
                  metadata: { timing: "24h" },
                },
              ];
              mockWorkflowModule = require("@/lib/communication/scheduling-workflow");
              mockWorkflowModule.schedulingCommunicationWorkflow = {
                initializeWorkflows: globals_1.jest.fn().mockResolvedValue(mockWorkflows),
              };
              request = new server_1.NextRequest("http://localhost:3000/api/scheduling/reminders", {
                method: "POST",
                body: JSON.stringify({
                  appointmentId: "550e8400-e29b-41d4-a716-446655440000",
                  reminderTypes: ["24h", "2h"],
                  channels: ["whatsapp", "sms"],
                  useWorkflow: true,
                }),
              });
              return [4 /*yield*/, (0, route_1.POST)(request)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              (0, globals_1.expect)(response.status).toBe(200);
              (0, globals_1.expect)(data.success).toBe(true);
              (0, globals_1.expect)(data.method).toBe("workflow");
              (0, globals_1.expect)(data.workflows).toHaveLength(1);
              (0, globals_1.expect)(
                mockWorkflowModule.schedulingCommunicationWorkflow.initializeWorkflows,
              ).toHaveBeenCalledWith(
                "550e8400-e29b-41d4-a716-446655440000",
                globals_1.expect.objectContaining({
                  reminderSettings: globals_1.expect.objectContaining({
                    enabled24h: true,
                    enabled2h: true,
                    channels: ["whatsapp", "sms"],
                  }),
                }),
              );
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should handle immediate reminders", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockCommunicationService,
          mockCommModule,
          mockTemplateEngine,
          mockTemplateModule,
          request,
          response,
          data;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              // Setup mocks
              mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
                error: null,
              });
              mockSupabase.from.mockReturnValue({
                select: globals_1.jest.fn().mockReturnValue({
                  eq: globals_1.jest.fn().mockReturnValue({
                    single: globals_1.jest.fn().mockResolvedValue({
                      data: mockAppointment,
                      error: null,
                    }),
                    gte: globals_1.jest.fn().mockReturnValue({
                      single: globals_1.jest.fn().mockResolvedValue({
                        data: null,
                        error: null,
                      }),
                    }),
                  }),
                }),
                insert: globals_1.jest.fn().mockResolvedValue({
                  data: [{ id: "reminder-123" }],
                  error: null,
                }),
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
              mockTemplateEngine = {
                selectBestTemplate: globals_1.jest.fn().mockReturnValue({
                  id: "template-123",
                  type: "reminder",
                }),
                renderTemplate: globals_1.jest
                  .fn()
                  .mockResolvedValue("Lembrete: Sua consulta é amanhã às 10:00"),
              };
              mockTemplateModule = require("@/lib/communication/scheduling-templates");
              mockTemplateModule.schedulingTemplateEngine = mockTemplateEngine;
              request = new server_1.NextRequest("http://localhost:3000/api/scheduling/reminders", {
                method: "POST",
                body: JSON.stringify({
                  appointmentId: "550e8400-e29b-41d4-a716-446655440000",
                  immediate: true,
                  channel: "whatsapp",
                  force: false,
                }),
              });
              return [4 /*yield*/, (0, route_1.POST)(request)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              (0, globals_1.expect)(response.status).toBe(200);
              (0, globals_1.expect)(data.success).toBe(true);
              (0, globals_1.expect)(data.method).toBe("immediate");
              (0, globals_1.expect)(data.messageId).toBe("msg-123");
              (0, globals_1.expect)(mockCommunicationService.sendMessage).toHaveBeenCalled();
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should prevent duplicate immediate reminders", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockRecentReminder, request, response, data;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              // Setup mocks
              mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
                error: null,
              });
              mockRecentReminder = {
                id: "reminder-456",
                appointment_id: "550e8400-e29b-41d4-a716-446655440000",
                reminder_type: "immediate",
                sent_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
              };
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
                } else if (table === "appointment_reminders") {
                  return {
                    select: globals_1.jest.fn().mockReturnValue({
                      eq: globals_1.jest.fn().mockReturnValue({
                        eq: globals_1.jest.fn().mockReturnValue({
                          gte: globals_1.jest.fn().mockReturnValue({
                            single: globals_1.jest.fn().mockResolvedValue({
                              data: mockRecentReminder,
                              error: null,
                            }),
                          }),
                        }),
                      }),
                    }),
                  };
                }
              });
              request = new server_1.NextRequest("http://localhost:3000/api/scheduling/reminders", {
                method: "POST",
                body: JSON.stringify({
                  appointmentId: "550e8400-e29b-41d4-a716-446655440000",
                  immediate: true,
                  channel: "whatsapp",
                  force: false,
                }),
              });
              return [4 /*yield*/, (0, route_1.POST)(request)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              (0, globals_1.expect)(response.status).toBe(409);
              (0, globals_1.expect)(data.error).toContain("already sent recently");
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should handle authentication errors", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var request, response, data;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: null },
                error: new Error("Unauthorized"),
              });
              request = new server_1.NextRequest("http://localhost:3000/api/scheduling/reminders", {
                method: "POST",
                body: JSON.stringify({
                  appointmentId: "550e8400-e29b-41d4-a716-446655440000",
                  reminderTypes: ["24h"],
                  channels: ["whatsapp"],
                }),
              });
              return [4 /*yield*/, (0, route_1.POST)(request)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              (0, globals_1.expect)(response.status).toBe(401);
              (0, globals_1.expect)(data.error).toBe("Unauthorized");
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should validate request schema", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var request, response, data;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
                error: null,
              });
              request = new server_1.NextRequest("http://localhost:3000/api/scheduling/reminders", {
                method: "POST",
                body: JSON.stringify({
                  appointmentId: "invalid-uuid",
                  reminderTypes: ["invalid-type"],
                  channels: ["invalid-channel"],
                }),
              });
              return [4 /*yield*/, (0, route_1.POST)(request)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              (0, globals_1.expect)(response.status).toBe(400);
              (0, globals_1.expect)(data.error).toBe("Invalid request data");
              (0, globals_1.expect)(data.details).toBeDefined();
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should handle appointment not found", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var request, response, data;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
                error: null,
              });
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
              request = new server_1.NextRequest("http://localhost:3000/api/scheduling/reminders", {
                method: "POST",
                body: JSON.stringify({
                  appointmentId: "550e8400-e29b-41d4-a716-446655440000",
                  reminderTypes: ["24h"],
                  channels: ["whatsapp"],
                }),
              });
              return [4 /*yield*/, (0, route_1.POST)(request)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              (0, globals_1.expect)(response.status).toBe(404);
              (0, globals_1.expect)(data.error).toBe("Appointment not found");
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("GET /api/scheduling/reminders", () => {
    (0, globals_1.it)("should fetch reminders with filters", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockReminders, request, response, data;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
                error: null,
              });
              mockReminders = [
                {
                  id: "reminder-1",
                  appointment_id: "550e8400-e29b-41d4-a716-446655440000",
                  reminder_type: "24h",
                  status: "sent",
                  scheduled_time: "2024-01-14T10:00:00Z",
                },
                {
                  id: "reminder-2",
                  appointment_id: "550e8400-e29b-41d4-a716-446655440000",
                  reminder_type: "2h",
                  status: "scheduled",
                  scheduled_time: "2024-01-15T08:00:00Z",
                },
              ];
              mockSupabase.from.mockReturnValue({
                select: globals_1.jest.fn().mockReturnValue({
                  eq: globals_1.jest.fn().mockReturnValue({
                    order: globals_1.jest.fn().mockResolvedValue({
                      data: mockReminders,
                      error: null,
                    }),
                  }),
                }),
              });
              request = new server_1.NextRequest(
                "http://localhost:3000/api/scheduling/reminders?appointmentId=550e8400-e29b-41d4-a716-446655440000",
              );
              return [4 /*yield*/, (0, route_1.GET)(request)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              (0, globals_1.expect)(response.status).toBe(200);
              (0, globals_1.expect)(data.success).toBe(true);
              (0, globals_1.expect)(data.reminders).toHaveLength(2);
              (0, globals_1.expect)(data.count.reminders).toBe(2);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should fetch workflow information when workflowId provided", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockWorkflow, mockWorkflowModule, request, response, data;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
                error: null,
              });
              mockWorkflow = {
                id: "workflow-123",
                workflowType: "reminder",
                status: "scheduled",
                steps: [{ id: "step-1", type: "send_message", status: "pending" }],
              };
              mockWorkflowModule = require("@/lib/communication/scheduling-workflow");
              mockWorkflowModule.schedulingCommunicationWorkflow = {
                getWorkflow: globals_1.jest.fn().mockResolvedValue(mockWorkflow),
              };
              request = new server_1.NextRequest(
                "http://localhost:3000/api/scheduling/reminders?workflowId=workflow-123",
              );
              return [4 /*yield*/, (0, route_1.GET)(request)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              (0, globals_1.expect)(response.status).toBe(200);
              (0, globals_1.expect)(data.success).toBe(true);
              (0, globals_1.expect)(data.workflow).toEqual(mockWorkflow);
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("PUT /api/scheduling/reminders (bulk)", () => {
    (0, globals_1.it)("should schedule bulk reminders for all appointments on date", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockAppointments, mockWorkflowModule, request, response, data;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
                error: null,
              });
              mockAppointments = [
                { id: "550e8400-e29b-41d4-a716-446655440001" },
                { id: "550e8400-e29b-41d4-a716-446655440002" },
                { id: "550e8400-e29b-41d4-a716-446655440003" },
              ];
              mockSupabase.from.mockImplementation((table) => {
                if (table === "appointments") {
                  return {
                    select: globals_1.jest.fn().mockReturnValue({
                      eq: globals_1.jest.fn().mockReturnValue({
                        gte: globals_1.jest.fn().mockReturnValue({
                          lte: globals_1.jest.fn().mockReturnValue({
                            eq: globals_1.jest.fn().mockResolvedValue({
                              data: mockAppointments,
                              error: null,
                            }),
                          }),
                        }),
                      }),
                    }),
                  };
                }
                return mockSupabase.from();
              });
              mockWorkflowModule = require("@/lib/communication/scheduling-workflow");
              mockWorkflowModule.schedulingCommunicationWorkflow = {
                initializeWorkflows: globals_1.jest
                  .fn()
                  .mockResolvedValue([{ id: "workflow-1", workflowType: "reminder" }]),
              };
              request = new server_1.NextRequest("http://localhost:3000/api/scheduling/reminders", {
                method: "PUT",
                body: JSON.stringify({
                  date: "2024-01-15",
                  clinicId: "450e8400-e29b-41d4-a716-446655440000",
                  reminderType: "24h",
                  channels: ["whatsapp"],
                  useWorkflow: true,
                }),
              });
              return [4 /*yield*/, (0, route_1.PUT)(request)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              (0, globals_1.expect)(response.status).toBe(200);
              (0, globals_1.expect)(data.success).toBe(true);
              (0, globals_1.expect)(data.processed).toBe(3);
              (0, globals_1.expect)(data.successful).toBe(3);
              (0, globals_1.expect)(data.failed).toBe(0);
              (0, globals_1.expect)(
                mockWorkflowModule.schedulingCommunicationWorkflow.initializeWorkflows,
              ).toHaveBeenCalledTimes(3);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should handle no appointments found", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var request, response, data;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
                error: null,
              });
              mockSupabase.from.mockReturnValue({
                select: globals_1.jest.fn().mockReturnValue({
                  eq: globals_1.jest.fn().mockReturnValue({
                    gte: globals_1.jest.fn().mockReturnValue({
                      lte: globals_1.jest.fn().mockReturnValue({
                        eq: globals_1.jest.fn().mockResolvedValue({
                          data: [],
                          error: null,
                        }),
                      }),
                    }),
                  }),
                }),
              });
              request = new server_1.NextRequest("http://localhost:3000/api/scheduling/reminders", {
                method: "PUT",
                body: JSON.stringify({
                  date: "2024-01-15",
                  clinicId: "450e8400-e29b-41d4-a716-446655440000",
                  reminderType: "24h",
                  channels: ["whatsapp"],
                }),
              });
              return [4 /*yield*/, (0, route_1.PUT)(request)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              (0, globals_1.expect)(response.status).toBe(200);
              (0, globals_1.expect)(data.success).toBe(true);
              (0, globals_1.expect)(data.processed).toBe(0);
              (0, globals_1.expect)(data.message).toContain("No appointments found");
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("Error handling", () => {
    (0, globals_1.it)("should handle database errors gracefully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var request, response, data;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
                error: null,
              });
              mockSupabase.from.mockReturnValue({
                select: globals_1.jest.fn().mockReturnValue({
                  eq: globals_1.jest.fn().mockReturnValue({
                    single: globals_1.jest
                      .fn()
                      .mockRejectedValue(new Error("Database connection failed")),
                  }),
                }),
              });
              request = new server_1.NextRequest("http://localhost:3000/api/scheduling/reminders", {
                method: "POST",
                body: JSON.stringify({
                  appointmentId: "550e8400-e29b-41d4-a716-446655440000",
                  reminderTypes: ["24h"],
                  channels: ["whatsapp"],
                }),
              });
              return [4 /*yield*/, (0, route_1.POST)(request)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              (0, globals_1.expect)(response.status).toBe(500);
              (0, globals_1.expect)(data.error).toBe("Internal server error");
              return [2 /*return*/];
          }
        });
      }),
    );
  });
});
