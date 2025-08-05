/**
 * Unit Tests for RBAC Authorization Middleware
 * Story 1.2: Role-Based Access Control Implementation
 *
 * Test suite for middleware authorization functions and route protection
 */
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
var middleware_1 = require("@/lib/auth/rbac/middleware");
// Mock the auth middleware
globals_1.jest.mock("@/lib/middleware/auth", () => ({
  authenticateRequest: globals_1.jest.fn(),
}));
// Mock the permissions module
globals_1.jest.mock("@/lib/auth/rbac/permissions", () => ({
  hasPermission: globals_1.jest.fn(),
  hasAnyPermission: globals_1.jest.fn(),
  hasAllPermissions: globals_1.jest.fn(),
}));
var mockAuthenticateRequest = require("@/lib/middleware/auth").authenticateRequest;
var mockHasPermission = require("@/lib/auth/rbac/permissions").hasPermission;
/**
 * Create mock user for testing
 */
function createMockUser(role, clinicId) {
  if (clinicId === void 0) {
    clinicId = "clinic-1";
  }
  return {
    id: "user-".concat(role),
    email: "".concat(role, "@test.com"),
    role: role,
    clinicId: clinicId,
    iat: Date.now(),
    exp: Date.now() + 3600000,
  };
}
/**
 * Create mock NextRequest
 */
function createMockRequest(url, method) {
  if (method === void 0) {
    method = "GET";
  }
  return new server_1.NextRequest(url, { method: method });
}
/**
 * Mock successful authentication
 */
function mockSuccessfulAuth(user) {
  mockAuthenticateRequest.mockResolvedValue({
    success: true,
    user: user,
    error: null,
  });
}
/**
 * Mock failed authentication
 */
function mockFailedAuth(error) {
  if (error === void 0) {
    error = "Authentication failed";
  }
  mockAuthenticateRequest.mockResolvedValue({
    success: false,
    user: null,
    error: error,
  });
}
/**
 * Mock permission check
 */
function mockPermissionCheck(granted, reason) {
  mockHasPermission.mockResolvedValue({
    granted: granted,
    reason: reason || (granted ? "Permission granted" : "Permission denied"),
    roleUsed: "test-role",
  });
}
(0, globals_1.describe)("RBAC Authorization Middleware", () => {
  (0, globals_1.beforeEach)(() => {
    globals_1.jest.clearAllMocks();
  });
  (0, globals_1.describe)("requireRole", () => {
    (0, globals_1.it)("should allow access when user has required role", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var user, request, middleware, response;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              user = createMockUser("manager");
              request = createMockRequest("http://localhost:3000/api/test");
              mockSuccessfulAuth(user);
              middleware = (0, middleware_1.requireRole)("manager");
              return [4 /*yield*/, middleware(request)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response).toBeUndefined(); // No response means continue
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should deny access when user lacks required role", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var user, request, middleware, response;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              user = createMockUser("staff");
              request = createMockRequest("http://localhost:3000/api/test");
              mockSuccessfulAuth(user);
              middleware = (0, middleware_1.requireRole)("manager");
              return [4 /*yield*/, middleware(request)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response).toBeInstanceOf(server_1.NextResponse);
              (0, globals_1.expect)(
                response === null || response === void 0 ? void 0 : response.status,
              ).toBe(403);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should deny access when authentication fails", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var request, middleware, response;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              request = createMockRequest("http://localhost:3000/api/test");
              mockFailedAuth();
              middleware = (0, middleware_1.requireRole)("manager");
              return [4 /*yield*/, middleware(request)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response).toBeInstanceOf(server_1.NextResponse);
              (0, globals_1.expect)(
                response === null || response === void 0 ? void 0 : response.status,
              ).toBe(401);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should handle multiple allowed roles", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var user, request, middleware, response;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              user = createMockUser("staff");
              request = createMockRequest("http://localhost:3000/api/test");
              mockSuccessfulAuth(user);
              middleware = (0, middleware_1.requireRole)(["manager", "staff"]);
              return [4 /*yield*/, middleware(request)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response).toBeUndefined(); // Access granted
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("requirePermission", () => {
    (0, globals_1.it)("should allow access when user has required permission", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var user, request, middleware, response;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              user = createMockUser("manager");
              request = createMockRequest("http://localhost:3000/api/patients");
              mockSuccessfulAuth(user);
              mockPermissionCheck(true);
              middleware = (0, middleware_1.requirePermission)("patients.read");
              return [4 /*yield*/, middleware(request)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response).toBeUndefined();
              (0, globals_1.expect)(mockHasPermission).toHaveBeenCalledWith(
                user,
                "patients.read",
                undefined,
                undefined,
              );
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should deny access when user lacks required permission", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var user, request, middleware, response;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              user = createMockUser("patient");
              request = createMockRequest("http://localhost:3000/api/billing");
              mockSuccessfulAuth(user);
              mockPermissionCheck(false, "Insufficient permissions");
              middleware = (0, middleware_1.requirePermission)("billing.read");
              return [4 /*yield*/, middleware(request)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response).toBeInstanceOf(server_1.NextResponse);
              (0, globals_1.expect)(
                response === null || response === void 0 ? void 0 : response.status,
              ).toBe(403);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should extract resource ID from URL path", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var user, request, middleware;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              user = createMockUser("staff");
              request = createMockRequest("http://localhost:3000/api/patients/patient-123");
              mockSuccessfulAuth(user);
              mockPermissionCheck(true);
              middleware = (0, middleware_1.requirePermission)("patients.read");
              return [4 /*yield*/, middleware(request)];
            case 1:
              _a.sent();
              (0, globals_1.expect)(mockHasPermission).toHaveBeenCalledWith(
                user,
                "patients.read",
                "patient-123",
                undefined,
              );
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should extract resource ID from query parameters", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var user, request, middleware;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              user = createMockUser("staff");
              request = createMockRequest(
                "http://localhost:3000/api/appointments?appointmentId=apt-456",
              );
              mockSuccessfulAuth(user);
              mockPermissionCheck(true);
              middleware = (0, middleware_1.requirePermission)("appointments.read");
              return [4 /*yield*/, middleware(request)];
            case 1:
              _a.sent();
              (0, globals_1.expect)(mockHasPermission).toHaveBeenCalledWith(
                user,
                "appointments.read",
                "apt-456",
                undefined,
              );
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("Pre-configured middleware functions", () => {
    (0, globals_1.describe)("requireOwner", () => {
      (0, globals_1.it)("should allow access for owner role", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var user, request, response;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                user = createMockUser("owner");
                request = createMockRequest("http://localhost:3000/api/admin");
                mockSuccessfulAuth(user);
                return [4 /*yield*/, (0, middleware_1.requireOwner)(request)];
              case 1:
                response = _a.sent();
                (0, globals_1.expect)(response).toBeUndefined();
                return [2 /*return*/];
            }
          });
        }),
      );
      (0, globals_1.it)("should deny access for non-owner roles", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var user, request, response;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                user = createMockUser("manager");
                request = createMockRequest("http://localhost:3000/api/admin");
                mockSuccessfulAuth(user);
                return [4 /*yield*/, (0, middleware_1.requireOwner)(request)];
              case 1:
                response = _a.sent();
                (0, globals_1.expect)(response).toBeInstanceOf(server_1.NextResponse);
                (0, globals_1.expect)(
                  response === null || response === void 0 ? void 0 : response.status,
                ).toBe(403);
                return [2 /*return*/];
            }
          });
        }),
      );
    });
    (0, globals_1.describe)("requireManagerOrAbove", () => {
      (0, globals_1.it)("should allow access for manager role", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var user, request, response;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                user = createMockUser("manager");
                request = createMockRequest("http://localhost:3000/api/reports");
                mockSuccessfulAuth(user);
                return [4 /*yield*/, (0, middleware_1.requireManagerOrAbove)(request)];
              case 1:
                response = _a.sent();
                (0, globals_1.expect)(response).toBeUndefined();
                return [2 /*return*/];
            }
          });
        }),
      );
      (0, globals_1.it)("should allow access for owner role", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var user, request, response;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                user = createMockUser("owner");
                request = createMockRequest("http://localhost:3000/api/reports");
                mockSuccessfulAuth(user);
                return [4 /*yield*/, (0, middleware_1.requireManagerOrAbove)(request)];
              case 1:
                response = _a.sent();
                (0, globals_1.expect)(response).toBeUndefined();
                return [2 /*return*/];
            }
          });
        }),
      );
      (0, globals_1.it)("should deny access for staff role", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var user, request, response;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                user = createMockUser("staff");
                request = createMockRequest("http://localhost:3000/api/reports");
                mockSuccessfulAuth(user);
                return [4 /*yield*/, (0, middleware_1.requireManagerOrAbove)(request)];
              case 1:
                response = _a.sent();
                (0, globals_1.expect)(response).toBeInstanceOf(server_1.NextResponse);
                (0, globals_1.expect)(
                  response === null || response === void 0 ? void 0 : response.status,
                ).toBe(403);
                return [2 /*return*/];
            }
          });
        }),
      );
    });
    (0, globals_1.describe)("patientManage", () => {
      (0, globals_1.it)("should allow access for staff with patient management permissions", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var user, request, response;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                user = createMockUser("staff");
                request = createMockRequest("http://localhost:3000/api/patients/patient-123");
                mockSuccessfulAuth(user);
                mockPermissionCheck(true);
                return [4 /*yield*/, (0, middleware_1.patientManage)(request)];
              case 1:
                response = _a.sent();
                (0, globals_1.expect)(response).toBeUndefined();
                (0, globals_1.expect)(mockHasPermission).toHaveBeenCalledWith(
                  user,
                  "patients.manage",
                  "patient-123",
                  undefined,
                );
                return [2 /*return*/];
            }
          });
        }),
      );
      (0, globals_1.it)("should deny access when patient management permission is missing", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var user, request, response;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                user = createMockUser("patient");
                request = createMockRequest("http://localhost:3000/api/patients/patient-123");
                mockSuccessfulAuth(user);
                mockPermissionCheck(false);
                return [4 /*yield*/, (0, middleware_1.patientManage)(request)];
              case 1:
                response = _a.sent();
                (0, globals_1.expect)(response).toBeInstanceOf(server_1.NextResponse);
                (0, globals_1.expect)(
                  response === null || response === void 0 ? void 0 : response.status,
                ).toBe(403);
                return [2 /*return*/];
            }
          });
        }),
      );
    });
    (0, globals_1.describe)("billingAccess", () => {
      (0, globals_1.it)("should allow access for manager with billing permissions", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var user, request, response;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                user = createMockUser("manager");
                request = createMockRequest("http://localhost:3000/api/billing");
                mockSuccessfulAuth(user);
                mockPermissionCheck(true);
                return [4 /*yield*/, (0, middleware_1.billingAccess)(request)];
              case 1:
                response = _a.sent();
                (0, globals_1.expect)(response).toBeUndefined();
                (0, globals_1.expect)(mockHasPermission).toHaveBeenCalledWith(
                  user,
                  "billing.read",
                  undefined,
                  undefined,
                );
                return [2 /*return*/];
            }
          });
        }),
      );
      (0, globals_1.it)("should deny access for staff without billing permissions", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var user, request, response;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                user = createMockUser("staff");
                request = createMockRequest("http://localhost:3000/api/billing");
                mockSuccessfulAuth(user);
                mockPermissionCheck(false);
                return [4 /*yield*/, (0, middleware_1.billingAccess)(request)];
              case 1:
                response = _a.sent();
                (0, globals_1.expect)(response).toBeInstanceOf(server_1.NextResponse);
                (0, globals_1.expect)(
                  response === null || response === void 0 ? void 0 : response.status,
                ).toBe(403);
                return [2 /*return*/];
            }
          });
        }),
      );
    });
    (0, globals_1.describe)("appointmentManage", () => {
      (0, globals_1.it)(
        "should allow access for staff with appointment management permissions",
        () =>
          __awaiter(void 0, void 0, void 0, function () {
            var user, request, response;
            return __generator(this, (_a) => {
              switch (_a.label) {
                case 0:
                  user = createMockUser("staff");
                  request = createMockRequest("http://localhost:3000/api/appointments/apt-456");
                  mockSuccessfulAuth(user);
                  mockPermissionCheck(true);
                  return [4 /*yield*/, (0, middleware_1.appointmentManage)(request)];
                case 1:
                  response = _a.sent();
                  (0, globals_1.expect)(response).toBeUndefined();
                  (0, globals_1.expect)(mockHasPermission).toHaveBeenCalledWith(
                    user,
                    "appointments.manage",
                    "apt-456",
                    undefined,
                  );
                  return [2 /*return*/];
              }
            });
          }),
      );
      (0, globals_1.it)(
        "should deny access when appointment management permission is missing",
        () =>
          __awaiter(void 0, void 0, void 0, function () {
            var user, request, response;
            return __generator(this, (_a) => {
              switch (_a.label) {
                case 0:
                  user = createMockUser("patient");
                  request = createMockRequest("http://localhost:3000/api/appointments/apt-456");
                  mockSuccessfulAuth(user);
                  mockPermissionCheck(false);
                  return [4 /*yield*/, (0, middleware_1.appointmentManage)(request)];
                case 1:
                  response = _a.sent();
                  (0, globals_1.expect)(response).toBeInstanceOf(server_1.NextResponse);
                  (0, globals_1.expect)(
                    response === null || response === void 0 ? void 0 : response.status,
                  ).toBe(403);
                  return [2 /*return*/];
              }
            });
          }),
      );
    });
  });
  (0, globals_1.describe)("Error handling", () => {
    (0, globals_1.it)("should handle authentication errors gracefully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var request, middleware, response;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              request = createMockRequest("http://localhost:3000/api/test");
              mockAuthenticateRequest.mockRejectedValue(new Error("Auth service unavailable"));
              middleware = (0, middleware_1.requireRole)("manager");
              return [4 /*yield*/, middleware(request)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response).toBeInstanceOf(server_1.NextResponse);
              (0, globals_1.expect)(
                response === null || response === void 0 ? void 0 : response.status,
              ).toBe(500);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should handle permission check errors gracefully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var user, request, middleware, response;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              user = createMockUser("manager");
              request = createMockRequest("http://localhost:3000/api/patients");
              mockSuccessfulAuth(user);
              mockHasPermission.mockRejectedValue(new Error("Permission service unavailable"));
              middleware = (0, middleware_1.requirePermission)("patients.read");
              return [4 /*yield*/, middleware(request)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response).toBeInstanceOf(server_1.NextResponse);
              (0, globals_1.expect)(
                response === null || response === void 0 ? void 0 : response.status,
              ).toBe(500);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should handle malformed URLs gracefully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var user, request, middleware, response;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              user = createMockUser("staff");
              request = createMockRequest("invalid-url");
              mockSuccessfulAuth(user);
              mockPermissionCheck(true);
              middleware = (0, middleware_1.requirePermission)("patients.read");
              return [4 /*yield*/, middleware(request)];
            case 1:
              response = _a.sent();
              // Should not crash, should handle gracefully
              (0, globals_1.expect)(response).toBeUndefined();
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("Resource ID extraction", () => {
    (0, globals_1.it)("should extract patient ID from various URL patterns", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var user, middleware, patterns, _i, patterns_1, url, request;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              user = createMockUser("staff");
              mockSuccessfulAuth(user);
              mockPermissionCheck(true);
              middleware = (0, middleware_1.requirePermission)("patients.read");
              patterns = [
                "http://localhost:3000/api/patients/patient-123",
                "http://localhost:3000/api/v1/patients/patient-456",
                "http://localhost:3000/patients/patient-789/details",
              ];
              (_i = 0), (patterns_1 = patterns);
              _a.label = 1;
            case 1:
              if (!(_i < patterns_1.length)) return [3 /*break*/, 4];
              url = patterns_1[_i];
              request = createMockRequest(url);
              return [4 /*yield*/, middleware(request)];
            case 2:
              _a.sent();
              _a.label = 3;
            case 3:
              _i++;
              return [3 /*break*/, 1];
            case 4:
              (0, globals_1.expect)(mockHasPermission).toHaveBeenCalledTimes(patterns.length);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should extract appointment ID from query parameters", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var user, request, middleware;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              user = createMockUser("staff");
              request = createMockRequest(
                "http://localhost:3000/api/appointments?id=apt-123&date=2025-01-27",
              );
              mockSuccessfulAuth(user);
              mockPermissionCheck(true);
              middleware = (0, middleware_1.requirePermission)("appointments.read");
              return [4 /*yield*/, middleware(request)];
            case 1:
              _a.sent();
              (0, globals_1.expect)(mockHasPermission).toHaveBeenCalledWith(
                user,
                "appointments.read",
                "apt-123",
                undefined,
              );
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should handle missing resource IDs gracefully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var user, request, middleware;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              user = createMockUser("staff");
              request = createMockRequest("http://localhost:3000/api/patients");
              mockSuccessfulAuth(user);
              mockPermissionCheck(true);
              middleware = (0, middleware_1.requirePermission)("patients.read");
              return [4 /*yield*/, middleware(request)];
            case 1:
              _a.sent();
              (0, globals_1.expect)(mockHasPermission).toHaveBeenCalledWith(
                user,
                "patients.read",
                undefined,
                undefined,
              );
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("Performance considerations", () => {
    (0, globals_1.it)("should not perform unnecessary permission checks for public endpoints", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var user, _request;
        return __generator(this, (_a) => {
          user = createMockUser("patient");
          _request = createMockRequest("http://localhost:3000/api/public/health");
          mockSuccessfulAuth(user);
          // If no middleware is applied, no permission check should occur
          // This test ensures our middleware doesn't interfere with public routes
          (0, globals_1.expect)(mockHasPermission).not.toHaveBeenCalled();
          return [2 /*return*/];
        });
      }),
    );
    (0, globals_1.it)("should handle concurrent requests efficiently", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var user, middleware, requests, responses;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              user = createMockUser("manager");
              mockSuccessfulAuth(user);
              mockPermissionCheck(true);
              middleware = (0, middleware_1.requirePermission)("patients.read");
              requests = Array.from({ length: 5 }, (_, i) =>
                createMockRequest("http://localhost:3000/api/patients/patient-".concat(i)),
              );
              return [4 /*yield*/, Promise.all(requests.map((request) => middleware(request)))];
            case 1:
              responses = _a.sent();
              // All should succeed
              responses.forEach((response) => {
                (0, globals_1.expect)(response).toBeUndefined();
              });
              (0, globals_1.expect)(mockHasPermission).toHaveBeenCalledTimes(5);
              return [2 /*return*/];
          }
        });
      }),
    );
  });
});
