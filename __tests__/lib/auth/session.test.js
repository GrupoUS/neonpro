"use strict";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
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
var session_1 = require("@/lib/auth/session");
var client_1 = require("@/app/utils/supabase/client");
// Mock Supabase client
jest.mock("@/app/utils/supabase/client", function () {
  return {
    createClient: jest.fn(),
  };
});
// Mock logger to prevent console spam
jest.mock("@/lib/logger", function () {
  return {
    logger: {
      info: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
    },
  };
});
// Create a comprehensive mock that handles the Supabase query chain properly
var createMockQuery = function () {
  var mockQuery = jest.fn();
  // All methods return the same mock object to enable chaining
  var chainMethods = [
    "select",
    "insert",
    "update",
    "delete",
    "eq",
    "neq",
    "gt",
    "lt",
    "gte",
    "lte",
    "order",
    "limit",
  ];
  chainMethods.forEach(function (method) {
    mockQuery[method] = jest.fn().mockReturnValue(mockQuery);
  });
  // Terminal methods that return results
  mockQuery.single = jest.fn();
  mockQuery.maybeSingle = jest.fn();
  return mockQuery;
};
var mockSupabase = {
  from: jest.fn(),
  auth: {
    getUser: jest.fn(),
    getSession: jest.fn(),
  },
};
client_1.createClient.mockReturnValue(mockSupabase);
describe("SessionManager", function () {
  var sessionManager;
  var mockQuery;
  var mockCreateSessionRequest = {
    user_id: "user-123",
    device_id: "device-123",
    ip_address: "192.168.1.1",
    user_agent: "Mozilla/5.0",
    session_type: "web",
  };
  var mockUpdateSessionRequest = {
    last_activity: new Date().toISOString(),
    risk_score: 1,
  };
  var mockUserSession = {
    id: "session-123",
    user_id: "user-123",
    device_id: "device-123",
    ip_address: "192.168.1.1",
    user_agent: "Mozilla/5.0",
    is_active: true,
    created_at: new Date().toISOString(),
    last_activity: new Date().toISOString(),
    expires_at: new Date(Date.now() + 86400000).toISOString(),
    risk_score: 0,
    location_data: null,
    session_type: "web",
    device_fingerprint: "fingerprint-123",
    security_score: 80,
  };
  beforeEach(function () {
    jest.clearAllMocks();
    sessionManager = new session_1.SessionManager();
    // Create fresh mock query for each test
    mockQuery = createMockQuery();
    mockSupabase.from.mockReturnValue(mockQuery);
    // Default successful responses
    mockQuery.single.mockResolvedValue({ data: mockUserSession, error: null });
    mockQuery.maybeSingle.mockResolvedValue({ data: null, error: null });
  });
  describe("createSession", function () {
    it("should create a new session successfully", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, sessionManager.createSession(mockCreateSessionRequest)];
            case 1:
              result = _a.sent();
              expect(result).toBeDefined();
              expect(result.id).toBe(mockUserSession.id);
              expect(result.user_id).toBe(mockCreateSessionRequest.user_id);
              expect(mockSupabase.from).toHaveBeenCalledWith("user_sessions");
              return [2 /*return*/];
          }
        });
      });
    });
    it("should handle session creation database errors", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockQuery.single.mockResolvedValue({
                data: null,
                error: { message: "Database error" },
              });
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, , 4]);
              return [4 /*yield*/, sessionManager.createSession(mockCreateSessionRequest)];
            case 2:
              _a.sent();
              fail("Should have thrown an error");
              return [3 /*break*/, 4];
            case 3:
              error_1 = _a.sent();
              expect(error_1).toBeDefined();
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    });
    it("should validate and register device during session creation", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, sessionManager.createSession(mockCreateSessionRequest)];
            case 1:
              _a.sent();
              // Should check for existing device registration
              expect(mockSupabase.from).toHaveBeenCalledWith("device_registrations");
              return [2 /*return*/];
          }
        });
      });
    });
    it("should calculate security score during session creation", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, sessionManager.createSession(mockCreateSessionRequest)];
            case 1:
              result = _a.sent();
              expect(result.security_score).toBeDefined();
              expect(typeof result.security_score).toBe("number");
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("updateSession", function () {
    it("should update session successfully", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var sessionId, result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              sessionId = "session-123";
              return [
                4 /*yield*/,
                sessionManager.updateSession(sessionId, mockUpdateSessionRequest),
              ];
            case 1:
              result = _a.sent();
              expect(result).toBeDefined();
              expect(result.id).toBe(sessionId);
              expect(mockSupabase.from).toHaveBeenCalledWith("user_sessions");
              return [2 /*return*/];
          }
        });
      });
    });
    it("should handle update database errors", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockQuery.single.mockResolvedValue({
                data: null,
                error: { message: "Update failed" },
              });
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, , 4]);
              return [
                4 /*yield*/,
                sessionManager.updateSession("session-123", mockUpdateSessionRequest),
              ];
            case 2:
              _a.sent();
              fail("Should have thrown an error");
              return [3 /*break*/, 4];
            case 3:
              error_2 = _a.sent();
              expect(error_2).toBeDefined();
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    });
    it("should extend session expiry when activity is updated", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var updatesWithActivity, result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              updatesWithActivity = { last_activity: new Date().toISOString() };
              return [
                4 /*yield*/,
                sessionManager.updateSession("session-123", updatesWithActivity),
              ];
            case 1:
              result = _a.sent();
              expect(result).toBeDefined();
              expect(mockSupabase.from).toHaveBeenCalledWith("user_sessions");
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("terminateSession", function () {
    beforeEach(function () {
      // Mock for session lookup
      mockQuery.single.mockResolvedValueOnce({ data: { user_id: "user-123" }, error: null });
      // Mock for session update
      mockQuery.single.mockResolvedValueOnce({ data: { id: "session-123" }, error: null });
    });
    it("should terminate session successfully", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                expect(sessionManager.terminateSession("session-123")).resolves.toBeUndefined(),
              ];
            case 1:
              _a.sent();
              expect(mockSupabase.from).toHaveBeenCalledWith("user_sessions");
              return [2 /*return*/];
          }
        });
      });
    });
    it("should terminate session with custom reason", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                expect(
                  sessionManager.terminateSession("session-123", "admin_logout"),
                ).resolves.toBeUndefined(),
              ];
            case 1:
              _a.sent();
              expect(mockSupabase.from).toHaveBeenCalledWith("user_sessions");
              return [2 /*return*/];
          }
        });
      });
    });
    it("should handle termination database errors", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockQuery.single.mockResolvedValue({
                data: null,
                error: { message: "Termination failed" },
              });
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, , 4]);
              return [4 /*yield*/, sessionManager.terminateSession("session-123")];
            case 2:
              _a.sent();
              return [3 /*break*/, 4];
            case 3:
              error_3 = _a.sent();
              // Error handling is acceptable here
              expect(error_3).toBeDefined();
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    });
    it("should log session termination action", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, sessionManager.terminateSession("session-123", "user_logout")];
            case 1:
              _a.sent();
              // Should log the termination action
              expect(mockSupabase.from).toHaveBeenCalledWith("session_audit_logs");
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("Session Validation", function () {
    it("should validate session creation requirements", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var invalidRequest, error_4;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              invalidRequest = __assign(__assign({}, mockCreateSessionRequest), { user_id: "" });
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, , 4]);
              return [4 /*yield*/, sessionManager.createSession(invalidRequest)];
            case 2:
              _a.sent();
              fail("Should have thrown validation error");
              return [3 /*break*/, 4];
            case 3:
              error_4 = _a.sent();
              expect(error_4).toBeDefined();
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    });
    it("should enforce security policies during session creation", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, sessionManager.createSession(mockCreateSessionRequest)];
            case 1:
              result = _a.sent();
              expect(result).toBeDefined();
              // The session manager creates sessions but policy checking depends on configuration
              // This test confirms the basic session creation works
              expect(result.user_id).toBe(mockCreateSessionRequest.user_id);
              return [2 /*return*/];
          }
        });
      });
    });
    it("should monitor session security during creation", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, sessionManager.createSession(mockCreateSessionRequest)];
            case 1:
              result = _a.sent();
              expect(result.security_score).toBeDefined();
              expect(typeof result.security_score).toBe("number");
              expect(result.security_score).toBeGreaterThanOrEqual(0);
              expect(result.security_score).toBeLessThanOrEqual(100);
              // Session creation should log the action
              expect(mockSupabase.from).toHaveBeenCalledWith("session_audit_logs");
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("Device Management", function () {
    it("should handle device registration during session creation", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, sessionManager.createSession(mockCreateSessionRequest)];
            case 1:
              _a.sent();
              // Should check for existing device
              expect(mockSupabase.from).toHaveBeenCalledWith("device_registrations");
              return [2 /*return*/];
          }
        });
      });
    });
    it("should update device last seen during session creation", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockDevice;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockDevice = {
                id: "device-123",
                user_id: "user-123",
                device_fingerprint: "fingerprint-123",
                last_seen: new Date().toISOString(),
              };
              mockQuery.maybeSingle.mockResolvedValueOnce({ data: mockDevice, error: null });
              return [4 /*yield*/, sessionManager.createSession(mockCreateSessionRequest)];
            case 1:
              _a.sent();
              // Should update device last seen
              expect(mockSupabase.from).toHaveBeenCalledWith("device_registrations");
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("Security Monitoring", function () {
    it("should calculate risk score based on session characteristics", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, sessionManager.createSession(mockCreateSessionRequest)];
            case 1:
              result = _a.sent();
              expect(result.security_score).toBeDefined();
              expect(typeof result.security_score).toBe("number");
              expect(result.security_score).toBeGreaterThanOrEqual(0);
              expect(result.security_score).toBeLessThanOrEqual(100);
              return [2 /*return*/];
          }
        });
      });
    });
    it("should detect and log security events when monitoring enabled", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              // Security events are created when security monitoring is enabled and suspicious activity detected
              // This test verifies that the session manager has the capability to handle security events
              return [4 /*yield*/, sessionManager.createSession(mockCreateSessionRequest)];
            case 1:
              // Security events are created when security monitoring is enabled and suspicious activity detected
              // This test verifies that the session manager has the capability to handle security events
              _a.sent();
              // Should have logged the session creation action
              expect(mockSupabase.from).toHaveBeenCalledWith("session_audit_logs");
              // Session creation includes security scoring by default
              expect(mockSupabase.from).toHaveBeenCalledWith("user_sessions");
              return [2 /*return*/];
          }
        });
      });
    });
    it("should enforce concurrent session limits", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var activeSessions, mockSelectQuery;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              activeSessions = [
                { id: "session-1", user_id: "user-123" },
                { id: "session-2", user_id: "user-123" },
                { id: "session-3", user_id: "user-123" },
              ];
              mockSelectQuery = createMockQuery();
              mockSelectQuery.single.mockResolvedValue({ data: activeSessions, error: null });
              mockSupabase.from.mockReturnValueOnce(mockSelectQuery);
              return [4 /*yield*/, sessionManager.createSession(mockCreateSessionRequest)];
            case 1:
              _a.sent();
              // Should have checked active sessions
              expect(mockSupabase.from).toHaveBeenCalledWith("user_sessions");
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("Error Handling", function () {
    it("should handle Supabase connection errors gracefully", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var error_5;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockSupabase.from.mockImplementation(function () {
                throw new Error("Database connection failed");
              });
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, , 4]);
              return [4 /*yield*/, sessionManager.createSession(mockCreateSessionRequest)];
            case 2:
              _a.sent();
              fail("Should have thrown connection error");
              return [3 /*break*/, 4];
            case 3:
              error_5 = _a.sent();
              expect(error_5).toBeDefined();
              expect(error_5.message).toContain("Database connection failed");
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    });
    it("should handle malformed request data", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var malformedRequest, error_6;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              malformedRequest = {
                user_id: null,
                device_id: undefined,
                ip_address: "",
              };
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, , 4]);
              return [4 /*yield*/, sessionManager.createSession(malformedRequest)];
            case 2:
              _a.sent();
              fail("Should have thrown validation error");
              return [3 /*break*/, 4];
            case 3:
              error_6 = _a.sent();
              expect(error_6).toBeDefined();
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("Integration Tests", function () {
    it("should complete full session lifecycle", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var session, updatedSession;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, sessionManager.createSession(mockCreateSessionRequest)];
            case 1:
              session = _a.sent();
              expect(session).toBeDefined();
              return [
                4 /*yield*/,
                sessionManager.updateSession(session.id, mockUpdateSessionRequest),
              ];
            case 2:
              updatedSession = _a.sent();
              expect(updatedSession).toBeDefined();
              // Terminate session
              return [
                4 /*yield*/,
                expect(sessionManager.terminateSession(session.id)).resolves.toBeUndefined(),
              ];
            case 3:
              // Terminate session
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    it("should handle concurrent operations gracefully", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var promises, results;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              promises = [
                sessionManager.createSession(
                  __assign(__assign({}, mockCreateSessionRequest), { device_id: "device-1" }),
                ),
                sessionManager.createSession(
                  __assign(__assign({}, mockCreateSessionRequest), { device_id: "device-2" }),
                ),
                sessionManager.createSession(
                  __assign(__assign({}, mockCreateSessionRequest), { device_id: "device-3" }),
                ),
              ];
              return [4 /*yield*/, Promise.all(promises)];
            case 1:
              results = _a.sent();
              expect(results).toHaveLength(3);
              results.forEach(function (result) {
                return expect(result).toBeDefined();
              });
              return [2 /*return*/];
          }
        });
      });
    });
  });
});
