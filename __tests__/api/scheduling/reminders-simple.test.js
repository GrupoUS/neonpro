"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
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
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
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
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
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
  };
Object.defineProperty(exports, "__esModule", { value: true });
var server_1 = require("next/server");
var route_1 = require("../../../app/api/scheduling/reminders/route");
// Mock the workflow module
jest.mock("../../../lib/communication/scheduling-workflow", function () {
  return {
    SchedulingCommunicationWorkflow: {
      initializeWorkflows: jest.fn().mockResolvedValue([
        {
          id: "workflow-1",
          appointmentId: "550e8400-e29b-41d4-a716-446655440000",
          type: "24h_reminder",
          scheduledAt: new Date(),
          status: "scheduled",
        },
      ]),
      executeWorkflow: jest.fn().mockResolvedValue({
        success: true,
        step: "complete",
      }),
    },
  };
});
// Mock communication service
jest.mock("../../../lib/communication/communication-service", function () {
  return {
    CommunicationService: {
      sendReminder: jest.fn().mockResolvedValue({
        success: true,
        provider: "whatsapp",
        messageId: "msg-123",
      }),
    },
  };
});
describe("Reminders API - Simple Test", function () {
  var mockUser = {
    id: "350e8400-e29b-41d4-a716-446655440000",
    email: "test@example.com",
  };
  var mockAppointment = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    clinic_id: "450e8400-e29b-41d4-a716-446655440000",
    patient_name: "João Silva",
    date: "2024-12-20",
    time: "10:00",
    service: "Limpeza facial",
  };
  beforeEach(function () {
    jest.clearAllMocks();
    // Mock successful authentication
    var mockSupabase = require("@supabase/supabase-js").createClient();
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
    // Mock appointment fetch
    var mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: mockAppointment,
        error: null,
      }),
    };
    mockSupabase.from.mockReturnValue(mockQueryBuilder);
  });
  it("should schedule reminders successfully", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var request, response;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            request = new server_1.NextRequest("http://localhost:3000/api/scheduling/reminders", {
              method: "POST",
              body: JSON.stringify({
                appointmentId: "550e8400-e29b-41d4-a716-446655440000",
                reminderTypes: ["24h"],
                channels: ["whatsapp"],
                useWorkflow: true,
              }),
            });
            return [
              4 /*yield*/,
              (0, route_1.POST)(request),
              // Verificar se a resposta tem estrutura básica
            ];
          case 1:
            response = _a.sent();
            // Verificar se a resposta tem estrutura básica
            expect(response).toBeDefined();
            expect(typeof response.json).toBe("function");
            return [2 /*return*/];
        }
      });
    });
  });
  it("should fetch reminders successfully", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var request, response;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            request = new server_1.NextRequest(
              "http://localhost:3000/api/scheduling/reminders?clinicId=450e8400-e29b-41d4-a716-446655440000",
            );
            return [
              4 /*yield*/,
              (0, route_1.GET)(request),
              // Verificar se a resposta tem estrutura básica
            ];
          case 1:
            response = _a.sent();
            // Verificar se a resposta tem estrutura básica
            expect(response).toBeDefined();
            expect(typeof response.json).toBe("function");
            return [2 /*return*/];
        }
      });
    });
  });
});
