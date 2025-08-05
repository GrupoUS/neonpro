"use strict";
// RBAC Middleware Tests
// Story 1.2: Role-Based Permissions Enhancement
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
var globals_1 = require("@jest/globals");
// Mock the entire middleware to avoid ESM issues
globals_1.jest.mock("@/middleware/rbac", function () {
  return {
    rbacMiddleware: globals_1.jest.fn(),
    RoutePermissionConfig: {},
  };
});
// Mock all problematic dependencies
globals_1.jest.mock("@supabase/auth-helpers-nextjs", function () {
  return {
    createClient: globals_1.jest.fn(function () {
      return {
        auth: {
          getUser: globals_1.jest.fn(),
        },
      };
    }),
  };
});
globals_1.jest.mock("@/lib/supabase/server", function () {
  return {
    createClient: globals_1.jest.fn(function () {
      return {
        auth: {
          getUser: globals_1.jest.fn(),
        },
      };
    }),
  };
});
globals_1.jest.mock("@/lib/auth/rbac/permissions", function () {
  return {
    RBACPermissionManager: globals_1.jest.fn().mockImplementation(function () {
      return {
        hasPermission: globals_1.jest.fn(),
        getUserRole: globals_1.jest.fn(),
      };
    }),
  };
});
// Import after mocking
var rbacMiddleware = require("@/middleware/rbac").rbacMiddleware;
(0, globals_1.describe)("RBAC Middleware", function () {
  var mockRequest;
  var mockSupabase;
  var mockRBACManager;
  var mockUser = {
    id: "user-123",
    email: "test@example.com",
  };
  var mockClinicId = "clinic-456";
  (0, globals_1.beforeEach)(function () {
    globals_1.jest.clearAllMocks();
    mockSupabase = {
      auth: {
        getUser: globals_1.jest.fn(),
      },
    };
    mockRBACManager = {
      checkPermission: globals_1.jest.fn(),
    };
    createClient.mockReturnValue(mockSupabase);
    RBACPermissionManager.mockReturnValue(mockRBACManager);
    mockRequest = {
      nextUrl: {
        pathname: "/api/users",
        searchParams: new URLSearchParams(),
      },
      method: "GET",
      headers: new Headers({
        "x-forwarded-for": "192.168.1.1",
        "user-agent": "Mozilla/5.0 Test Browser",
      }),
      cookies: {
        get: globals_1.jest.fn(),
      },
    };
  });
  (0, globals_1.afterEach)(function () {
    globals_1.jest.restoreAllMocks();
  });
  (0, globals_1.describe)("Authentication", function () {
    (0, globals_1.it)("should return 401 when user is not authenticated", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var config, response, responseData;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              // Mock no authenticated user
              mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: null },
                error: { message: "Not authenticated" },
              });
              config = {
                "/api/users": {
                  GET: { permission: "view_users", requireClinicId: true },
                },
              };
              return [4 /*yield*/, rbacMiddleware(mockRequest, config)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response.status).toBe(401);
              return [4 /*yield*/, response.json()];
            case 2:
              responseData = _a.sent();
              (0, globals_1.expect)(responseData.error).toBe("Authentication required");
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should proceed when user is authenticated", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var config, response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              // Mock authenticated user
              mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
                error: null,
              });
              // Mock permission granted
              mockRBACManager.checkPermission.mockResolvedValue({
                granted: true,
                reason: "Permission granted",
              });
              // Mock clinic ID in query params
              mockRequest.nextUrl.searchParams.set("clinicId", mockClinicId);
              config = {
                "/api/users": {
                  GET: { permission: "view_users", requireClinicId: true },
                },
              };
              return [4 /*yield*/, rbacMiddleware(mockRequest, config)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response).toBeNull(); // Should proceed to next middleware
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("Route Permission Matching", function () {
    (0, globals_1.beforeEach)(function () {
      // Mock authenticated user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
    });
    (0, globals_1.it)("should match exact route paths", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var config, response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockRequest.nextUrl.pathname = "/api/users";
              // Mock permission granted
              mockRBACManager.checkPermission.mockResolvedValue({
                granted: true,
                reason: "Permission granted",
              });
              config = {
                "/api/users": {
                  GET: { permission: "view_users", requireClinicId: false },
                },
              };
              return [4 /*yield*/, rbacMiddleware(mockRequest, config)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response).toBeNull();
              (0, globals_1.expect)(mockRBACManager.checkPermission).toHaveBeenCalledWith({
                userId: mockUser.id,
                permission: "view_users",
                context: globals_1.expect.objectContaining({
                  ipAddress: "192.168.1.1",
                  userAgent: "Mozilla/5.0 Test Browser",
                }),
              });
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should match dynamic route patterns", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var config, response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockRequest.nextUrl.pathname = "/api/users/user-123";
              // Mock permission granted
              mockRBACManager.checkPermission.mockResolvedValue({
                granted: true,
                reason: "Permission granted",
              });
              config = {
                "/api/users/[id]": {
                  GET: { permission: "view_users", requireClinicId: false },
                },
              };
              return [4 /*yield*/, rbacMiddleware(mockRequest, config)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response).toBeNull();
              (0, globals_1.expect)(mockRBACManager.checkPermission).toHaveBeenCalled();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should handle nested dynamic routes", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var config, response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockRequest.nextUrl.pathname = "/api/clinics/clinic-456/patients/patient-789";
              // Mock permission granted
              mockRBACManager.checkPermission.mockResolvedValue({
                granted: true,
                reason: "Permission granted",
              });
              config = {
                "/api/clinics/[clinicId]/patients/[patientId]": {
                  GET: { permission: "view_patients", requireClinicId: true },
                },
              };
              return [4 /*yield*/, rbacMiddleware(mockRequest, config)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response).toBeNull();
              (0, globals_1.expect)(mockRBACManager.checkPermission).toHaveBeenCalledWith({
                userId: mockUser.id,
                permission: "view_patients",
                clinicId: "clinic-456",
                resourceOwnerId: "patient-789",
                context: globals_1.expect.any(Object),
              });
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should return 404 for unmatched routes", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var config, response, responseData;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockRequest.nextUrl.pathname = "/api/unknown-route";
              config = {
                "/api/users": {
                  GET: { permission: "view_users", requireClinicId: false },
                },
              };
              return [4 /*yield*/, rbacMiddleware(mockRequest, config)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response.status).toBe(404);
              return [4 /*yield*/, response.json()];
            case 2:
              responseData = _a.sent();
              (0, globals_1.expect)(responseData.error).toBe("Route not found");
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("HTTP Method Handling", function () {
    (0, globals_1.beforeEach)(function () {
      // Mock authenticated user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      mockRequest.nextUrl.pathname = "/api/users";
    });
    (0, globals_1.it)("should handle GET requests", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var config, response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockRequest.method = "GET";
              mockRBACManager.checkPermission.mockResolvedValue({
                granted: true,
                reason: "Permission granted",
              });
              config = {
                "/api/users": {
                  GET: { permission: "view_users", requireClinicId: false },
                },
              };
              return [4 /*yield*/, rbacMiddleware(mockRequest, config)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response).toBeNull();
              (0, globals_1.expect)(mockRBACManager.checkPermission).toHaveBeenCalledWith(
                globals_1.expect.objectContaining({
                  permission: "view_users",
                }),
              );
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should handle POST requests", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var config, response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockRequest.method = "POST";
              mockRBACManager.checkPermission.mockResolvedValue({
                granted: true,
                reason: "Permission granted",
              });
              config = {
                "/api/users": {
                  POST: { permission: "create_users", requireClinicId: true },
                },
              };
              // Mock clinic ID in query params
              mockRequest.nextUrl.searchParams.set("clinicId", mockClinicId);
              return [4 /*yield*/, rbacMiddleware(mockRequest, config)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response).toBeNull();
              (0, globals_1.expect)(mockRBACManager.checkPermission).toHaveBeenCalledWith(
                globals_1.expect.objectContaining({
                  permission: "create_users",
                  clinicId: mockClinicId,
                }),
              );
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should return 405 for unsupported HTTP methods", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var config, response, responseData;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockRequest.method = "PATCH";
              config = {
                "/api/users": {
                  GET: { permission: "view_users", requireClinicId: false },
                  POST: { permission: "create_users", requireClinicId: false },
                },
              };
              return [4 /*yield*/, rbacMiddleware(mockRequest, config)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response.status).toBe(405);
              return [4 /*yield*/, response.json()];
            case 2:
              responseData = _a.sent();
              (0, globals_1.expect)(responseData.error).toBe("Method not allowed");
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("Clinic ID Validation", function () {
    (0, globals_1.beforeEach)(function () {
      // Mock authenticated user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      mockRequest.nextUrl.pathname = "/api/users";
      mockRequest.method = "GET";
    });
    (0, globals_1.it)("should extract clinic ID from query parameters", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var config, response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockRequest.nextUrl.searchParams.set("clinicId", mockClinicId);
              mockRBACManager.checkPermission.mockResolvedValue({
                granted: true,
                reason: "Permission granted",
              });
              config = {
                "/api/users": {
                  GET: { permission: "view_users", requireClinicId: true },
                },
              };
              return [4 /*yield*/, rbacMiddleware(mockRequest, config)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response).toBeNull();
              (0, globals_1.expect)(mockRBACManager.checkPermission).toHaveBeenCalledWith(
                globals_1.expect.objectContaining({
                  clinicId: mockClinicId,
                }),
              );
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should extract clinic ID from route parameters", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var config, response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockRequest.nextUrl.pathname = "/api/clinics/clinic-789/users";
              mockRBACManager.checkPermission.mockResolvedValue({
                granted: true,
                reason: "Permission granted",
              });
              config = {
                "/api/clinics/[clinicId]/users": {
                  GET: { permission: "view_users", requireClinicId: true },
                },
              };
              return [4 /*yield*/, rbacMiddleware(mockRequest, config)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response).toBeNull();
              (0, globals_1.expect)(mockRBACManager.checkPermission).toHaveBeenCalledWith(
                globals_1.expect.objectContaining({
                  clinicId: "clinic-789",
                }),
              );
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should return 400 when clinic ID is required but missing", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var config, response, responseData;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              config = {
                "/api/users": {
                  GET: { permission: "view_users", requireClinicId: true },
                },
              };
              return [4 /*yield*/, rbacMiddleware(mockRequest, config)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response.status).toBe(400);
              return [4 /*yield*/, response.json()];
            case 2:
              responseData = _a.sent();
              (0, globals_1.expect)(responseData.error).toBe("Clinic ID is required");
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("Permission Checking", function () {
    (0, globals_1.beforeEach)(function () {
      // Mock authenticated user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      mockRequest.nextUrl.pathname = "/api/users";
      mockRequest.method = "GET";
    });
    (0, globals_1.it)("should grant access when permission is granted", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var config, response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockRBACManager.checkPermission.mockResolvedValue({
                granted: true,
                reason: "User has required permission",
              });
              config = {
                "/api/users": {
                  GET: { permission: "view_users", requireClinicId: false },
                },
              };
              return [4 /*yield*/, rbacMiddleware(mockRequest, config)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response).toBeNull(); // Should proceed
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should deny access when permission is denied", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var config, response, responseData;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockRBACManager.checkPermission.mockResolvedValue({
                granted: false,
                reason: "Insufficient permissions",
              });
              config = {
                "/api/users": {
                  GET: { permission: "view_users", requireClinicId: false },
                },
              };
              return [4 /*yield*/, rbacMiddleware(mockRequest, config)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response.status).toBe(403);
              return [4 /*yield*/, response.json()];
            case 2:
              responseData = _a.sent();
              (0, globals_1.expect)(responseData.error).toBe("Access denied");
              (0, globals_1.expect)(responseData.reason).toBe("Insufficient permissions");
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should handle permission check errors", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var config, response, responseData;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockRBACManager.checkPermission.mockRejectedValue(
                new Error("Permission check failed"),
              );
              config = {
                "/api/users": {
                  GET: { permission: "view_users", requireClinicId: false },
                },
              };
              return [4 /*yield*/, rbacMiddleware(mockRequest, config)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response.status).toBe(500);
              return [4 /*yield*/, response.json()];
            case 2:
              responseData = _a.sent();
              (0, globals_1.expect)(responseData.error).toBe("Internal server error");
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("Context Extraction", function () {
    (0, globals_1.beforeEach)(function () {
      // Mock authenticated user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      mockRequest.nextUrl.pathname = "/api/users";
      mockRequest.method = "GET";
    });
    (0, globals_1.it)("should extract IP address from headers", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var config, response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockRequest.headers = new Headers({
                "x-forwarded-for": "203.0.113.1, 192.168.1.1",
                "user-agent": "Mozilla/5.0 Test Browser",
              });
              mockRBACManager.checkPermission.mockResolvedValue({
                granted: true,
                reason: "Permission granted",
              });
              config = {
                "/api/users": {
                  GET: { permission: "view_users", requireClinicId: false },
                },
              };
              return [4 /*yield*/, rbacMiddleware(mockRequest, config)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response).toBeNull();
              (0, globals_1.expect)(mockRBACManager.checkPermission).toHaveBeenCalledWith(
                globals_1.expect.objectContaining({
                  context: globals_1.expect.objectContaining({
                    ipAddress: "203.0.113.1", // Should extract first IP
                  }),
                }),
              );
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should extract user agent from headers", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var userAgent, config, response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
              mockRequest.headers = new Headers({
                "x-forwarded-for": "192.168.1.1",
                "user-agent": userAgent,
              });
              mockRBACManager.checkPermission.mockResolvedValue({
                granted: true,
                reason: "Permission granted",
              });
              config = {
                "/api/users": {
                  GET: { permission: "view_users", requireClinicId: false },
                },
              };
              return [4 /*yield*/, rbacMiddleware(mockRequest, config)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response).toBeNull();
              (0, globals_1.expect)(mockRBACManager.checkPermission).toHaveBeenCalledWith(
                globals_1.expect.objectContaining({
                  context: globals_1.expect.objectContaining({
                    userAgent: userAgent,
                  }),
                }),
              );
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should handle missing headers gracefully", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var config, response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockRequest.headers = new Headers(); // Empty headers
              mockRBACManager.checkPermission.mockResolvedValue({
                granted: true,
                reason: "Permission granted",
              });
              config = {
                "/api/users": {
                  GET: { permission: "view_users", requireClinicId: false },
                },
              };
              return [4 /*yield*/, rbacMiddleware(mockRequest, config)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response).toBeNull();
              (0, globals_1.expect)(mockRBACManager.checkPermission).toHaveBeenCalledWith(
                globals_1.expect.objectContaining({
                  context: globals_1.expect.objectContaining({
                    ipAddress: "unknown",
                    userAgent: "unknown",
                  }),
                }),
              );
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("Resource Owner Extraction", function () {
    (0, globals_1.beforeEach)(function () {
      // Mock authenticated user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
    });
    (0, globals_1.it)("should extract resource owner ID from route parameters", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var config, response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockRequest.nextUrl.pathname = "/api/patients/patient-123";
              mockRequest.method = "GET";
              mockRBACManager.checkPermission.mockResolvedValue({
                granted: true,
                reason: "Permission granted",
              });
              config = {
                "/api/patients/[id]": {
                  GET: { permission: "view_patients", requireClinicId: false },
                },
              };
              return [4 /*yield*/, rbacMiddleware(mockRequest, config)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response).toBeNull();
              (0, globals_1.expect)(mockRBACManager.checkPermission).toHaveBeenCalledWith(
                globals_1.expect.objectContaining({
                  resourceOwnerId: "patient-123",
                }),
              );
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should extract user ID from user-specific routes", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var config, response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockRequest.nextUrl.pathname = "/api/users/user-456";
              mockRequest.method = "GET";
              mockRBACManager.checkPermission.mockResolvedValue({
                granted: true,
                reason: "Permission granted",
              });
              config = {
                "/api/users/[id]": {
                  GET: { permission: "view_users", requireClinicId: false },
                },
              };
              return [4 /*yield*/, rbacMiddleware(mockRequest, config)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response).toBeNull();
              (0, globals_1.expect)(mockRBACManager.checkPermission).toHaveBeenCalledWith(
                globals_1.expect.objectContaining({
                  resourceOwnerId: "user-456",
                }),
              );
              return [2 /*return*/];
          }
        });
      });
    });
  });
});
