"use strict";
/**
 * Mobile API System Tests
 * Comprehensive test suite for mobile API functionality
 */
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
var globals_1 = require("@jest/globals");
var mobile_api_system_1 = require("../mobile-api-system");
// Mock Supabase
globals_1.jest.mock("@supabase/supabase-js", function () {
  return {
    createClient: globals_1.jest.fn(function () {
      return {
        from: globals_1.jest.fn(function () {
          return {
            select: globals_1.jest.fn().mockReturnThis(),
            insert: globals_1.jest.fn().mockReturnThis(),
            update: globals_1.jest.fn().mockReturnThis(),
            delete: globals_1.jest.fn().mockReturnThis(),
            eq: globals_1.jest.fn().mockReturnThis(),
            single: globals_1.jest.fn().mockResolvedValue({ data: null, error: null }),
          };
        }),
        auth: {
          signInWithPassword: globals_1.jest
            .fn()
            .mockResolvedValue({ data: { user: { id: "test" } }, error: null }),
          signOut: globals_1.jest.fn().mockResolvedValue({ error: null }),
          getSession: globals_1.jest
            .fn()
            .mockResolvedValue({ data: { session: { access_token: "test" } }, error: null }),
        },
      };
    }),
  };
});
// Mock fetch
global.fetch = globals_1.jest.fn();
(0, globals_1.describe)("MobileApiSystem", function () {
  var apiSystem;
  var mockConfig;
  (0, globals_1.beforeEach)(function () {
    mockConfig = {
      baseUrl: "https://api.test.com",
      timeout: 5000,
      retryAttempts: 3,
      retryDelay: 1000,
      compression: {
        enabled: true,
        algorithm: "gzip",
        level: 6,
      },
      security: {
        encryptionKey: "test-key",
        signatureValidation: true,
        rateLimiting: {
          enabled: true,
          maxRequests: 100,
          windowMs: 60000,
        },
      },
      supabaseUrl: "https://test.supabase.co",
      supabaseKey: "test-key",
    };
    apiSystem = new mobile_api_system_1.MobileApiSystem(mockConfig);
    globals_1.jest.clearAllMocks();
  });
  (0, globals_1.afterEach)(function () {
    return __awaiter(void 0, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, apiSystem.shutdown()];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  });
  (0, globals_1.describe)("Initialization", function () {
    (0, globals_1.it)("should initialize successfully", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                (0, globals_1.expect)(apiSystem.initialize()).resolves.not.toThrow(),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should handle initialization errors", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var invalidConfig, invalidApiSystem;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              invalidConfig = __assign(__assign({}, mockConfig), { supabaseUrl: "" });
              invalidApiSystem = new mobile_api_system_1.MobileApiSystem(invalidConfig);
              return [
                4 /*yield*/,
                (0, globals_1.expect)(invalidApiSystem.initialize()).rejects.toThrow(),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("Authentication", function () {
    (0, globals_1.beforeEach)(function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, apiSystem.initialize()];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should authenticate user successfully", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var credentials, result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              credentials = {
                email: "test@example.com",
                password: "password123",
              };
              return [4 /*yield*/, apiSystem.authenticate(credentials)];
            case 1:
              result = _a.sent();
              (0, globals_1.expect)(result.success).toBe(true);
              (0, globals_1.expect)(result.token).toBeDefined();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should handle authentication failure", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockSupabase, credentials, result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockSupabase = require("@supabase/supabase-js").createClient();
              mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
                data: { user: null },
                error: { message: "Invalid credentials" },
              });
              credentials = {
                email: "invalid@example.com",
                password: "wrongpassword",
              };
              return [4 /*yield*/, apiSystem.authenticate(credentials)];
            case 1:
              result = _a.sent();
              (0, globals_1.expect)(result.success).toBe(false);
              (0, globals_1.expect)(result.error).toBeDefined();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should refresh token successfully", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, apiSystem.refreshToken()];
            case 1:
              result = _a.sent();
              (0, globals_1.expect)(result.success).toBe(true);
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should logout successfully", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                (0, globals_1.expect)(apiSystem.logout()).resolves.not.toThrow(),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("API Requests", function () {
    (0, globals_1.beforeEach)(function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, apiSystem.initialize()];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should make successful GET request", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockResponse, request, response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockResponse = {
                ok: true,
                status: 200,
                headers: new Headers(),
                json: globals_1.jest.fn().mockResolvedValue({ data: "test" }),
              };
              global.fetch.mockResolvedValueOnce(mockResponse);
              request = {
                endpoint: "/test",
                method: "GET",
                headers: {},
                params: {},
                cache: { enabled: false },
              };
              return [4 /*yield*/, apiSystem.request(request)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response.success).toBe(true);
              (0, globals_1.expect)(response.data).toEqual({ data: "test" });
              (0, globals_1.expect)(response.status).toBe(200);
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should make successful POST request with data", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockResponse, request, response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockResponse = {
                ok: true,
                status: 201,
                headers: new Headers(),
                json: globals_1.jest.fn().mockResolvedValue({ id: 1, name: "Created" }),
              };
              global.fetch.mockResolvedValueOnce(mockResponse);
              request = {
                endpoint: "/create",
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: { name: "Test Item" },
                cache: { enabled: false },
              };
              return [4 /*yield*/, apiSystem.request(request)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response.success).toBe(true);
              (0, globals_1.expect)(response.data).toEqual({ id: 1, name: "Created" });
              (0, globals_1.expect)(response.status).toBe(201);
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should handle request timeout", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var request;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              global.fetch.mockImplementationOnce(function () {
                return new Promise(function (resolve) {
                  return setTimeout(resolve, 10000);
                });
              });
              request = {
                endpoint: "/slow",
                method: "GET",
                headers: {},
                timeout: 1000,
                cache: { enabled: false },
              };
              return [
                4 /*yield*/,
                (0, globals_1.expect)(apiSystem.request(request)).rejects.toThrow(),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should retry failed requests", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var request, response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              global.fetch
                .mockRejectedValueOnce(new Error("Network error"))
                .mockRejectedValueOnce(new Error("Network error"))
                .mockResolvedValueOnce({
                  ok: true,
                  status: 200,
                  headers: new Headers(),
                  json: globals_1.jest.fn().mockResolvedValue({ data: "success" }),
                });
              request = {
                endpoint: "/retry-test",
                method: "GET",
                headers: {},
                retryAttempts: 3,
                cache: { enabled: false },
              };
              return [4 /*yield*/, apiSystem.request(request)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response.success).toBe(true);
              (0, globals_1.expect)(global.fetch).toHaveBeenCalledTimes(3);
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should handle 4xx client errors without retry", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockResponse, request, response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockResponse = {
                ok: false,
                status: 400,
                headers: new Headers(),
                json: globals_1.jest.fn().mockResolvedValue({ error: "Bad Request" }),
              };
              global.fetch.mockResolvedValueOnce(mockResponse);
              request = {
                endpoint: "/bad-request",
                method: "GET",
                headers: {},
                retryAttempts: 3,
                cache: { enabled: false },
              };
              return [4 /*yield*/, apiSystem.request(request)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response.success).toBe(false);
              (0, globals_1.expect)(response.status).toBe(400);
              (0, globals_1.expect)(global.fetch).toHaveBeenCalledTimes(1); // No retry for 4xx
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("Data Compression", function () {
    (0, globals_1.beforeEach)(function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, apiSystem.initialize()];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should compress request data when enabled", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockResponse, largeData, request, fetchCall;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockResponse = {
                ok: true,
                status: 200,
                headers: new Headers(),
                json: globals_1.jest.fn().mockResolvedValue({ success: true }),
              };
              global.fetch.mockResolvedValueOnce(mockResponse);
              largeData = { data: "x".repeat(1000) };
              request = {
                endpoint: "/compress-test",
                method: "POST",
                headers: {},
                body: largeData,
                compression: {
                  enabled: true,
                  algorithm: "gzip",
                  level: 6,
                },
                cache: { enabled: false },
              };
              return [4 /*yield*/, apiSystem.request(request)];
            case 1:
              _a.sent();
              // Verify fetch was called with compressed data
              (0, globals_1.expect)(global.fetch).toHaveBeenCalled();
              fetchCall = global.fetch.mock.calls[0];
              (0, globals_1.expect)(fetchCall[1].headers["Content-Encoding"]).toBe("gzip");
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should decompress response data when compressed", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var compressedResponse, request, response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              compressedResponse = {
                ok: true,
                status: 200,
                headers: new Headers({ "Content-Encoding": "gzip" }),
                arrayBuffer: globals_1.jest.fn().mockResolvedValue(new ArrayBuffer(100)),
              };
              global.fetch.mockResolvedValueOnce(compressedResponse);
              request = {
                endpoint: "/decompress-test",
                method: "GET",
                headers: {},
                cache: { enabled: false },
              };
              return [4 /*yield*/, apiSystem.request(request)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response.success).toBe(true);
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("Network Optimization", function () {
    (0, globals_1.beforeEach)(function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, apiSystem.initialize()];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should optimize request for slow network", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockResponse, request, response, fetchCall;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockResponse = {
                ok: true,
                status: 200,
                headers: new Headers(),
                json: globals_1.jest.fn().mockResolvedValue({ data: "optimized" }),
              };
              global.fetch.mockResolvedValueOnce(mockResponse);
              request = {
                endpoint: "/optimize-test",
                method: "GET",
                headers: {},
                networkCondition: "slow",
                cache: { enabled: false },
              };
              return [4 /*yield*/, apiSystem.request(request)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response.success).toBe(true);
              fetchCall = global.fetch.mock.calls[0];
              (0, globals_1.expect)(fetchCall[1].timeout).toBeLessThan(mockConfig.timeout);
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should batch multiple requests efficiently", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockResponse, requests, responses;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockResponse = {
                ok: true,
                status: 200,
                headers: new Headers(),
                json: globals_1.jest.fn().mockResolvedValue({ results: [1, 2, 3] }),
              };
              global.fetch.mockResolvedValue(mockResponse);
              requests = [
                { endpoint: "/item/1", method: "GET", headers: {}, cache: { enabled: false } },
                { endpoint: "/item/2", method: "GET", headers: {}, cache: { enabled: false } },
                { endpoint: "/item/3", method: "GET", headers: {}, cache: { enabled: false } },
              ];
              return [4 /*yield*/, apiSystem.batchRequests(requests)];
            case 1:
              responses = _a.sent();
              (0, globals_1.expect)(responses).toHaveLength(3);
              (0, globals_1.expect)(
                responses.every(function (r) {
                  return r.success;
                }),
              ).toBe(true);
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("Security", function () {
    (0, globals_1.beforeEach)(function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, apiSystem.initialize()];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should validate request signatures when enabled", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockResponse, request, response, fetchCall;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockResponse = {
                ok: true,
                status: 200,
                headers: new Headers(),
                json: globals_1.jest.fn().mockResolvedValue({ data: "secure" }),
              };
              global.fetch.mockResolvedValueOnce(mockResponse);
              request = {
                endpoint: "/secure-test",
                method: "POST",
                headers: {},
                body: { sensitive: "data" },
                security: {
                  signatureValidation: true,
                  encryptPayload: true,
                },
                cache: { enabled: false },
              };
              return [4 /*yield*/, apiSystem.request(request)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response.success).toBe(true);
              fetchCall = global.fetch.mock.calls[0];
              (0, globals_1.expect)(fetchCall[1].headers["X-Signature"]).toBeDefined();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should encrypt sensitive data", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockResponse, sensitiveData, request, response, fetchCall, requestBody;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockResponse = {
                ok: true,
                status: 200,
                headers: new Headers(),
                json: globals_1.jest.fn().mockResolvedValue({ encrypted: true }),
              };
              global.fetch.mockResolvedValueOnce(mockResponse);
              sensitiveData = { password: "secret123", token: "abc123" };
              request = {
                endpoint: "/encrypt-test",
                method: "POST",
                headers: {},
                body: sensitiveData,
                security: {
                  encryptPayload: true,
                },
                cache: { enabled: false },
              };
              return [4 /*yield*/, apiSystem.request(request)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response.success).toBe(true);
              fetchCall = global.fetch.mock.calls[0];
              requestBody = JSON.parse(fetchCall[1].body);
              (0, globals_1.expect)(requestBody.password).not.toBe("secret123");
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("Rate Limiting", function () {
    (0, globals_1.beforeEach)(function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, apiSystem.initialize()];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should enforce rate limits", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockResponse, request, promises, results, rejected;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockResponse = {
                ok: true,
                status: 200,
                headers: new Headers(),
                json: globals_1.jest.fn().mockResolvedValue({ data: "success" }),
              };
              global.fetch.mockResolvedValue(mockResponse);
              request = {
                endpoint: "/rate-limit-test",
                method: "GET",
                headers: {},
                cache: { enabled: false },
              };
              promises = Array(mockConfig.security.rateLimiting.maxRequests + 10)
                .fill(null)
                .map(function () {
                  return apiSystem.request(request);
                });
              return [4 /*yield*/, Promise.allSettled(promises)];
            case 1:
              results = _a.sent();
              rejected = results.filter(function (r) {
                return r.status === "rejected";
              });
              (0, globals_1.expect)(rejected.length).toBeGreaterThan(0);
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("Health Check", function () {
    (0, globals_1.beforeEach)(function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, apiSystem.initialize()];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should return healthy status when system is working", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var health;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, apiSystem.healthCheck()];
            case 1:
              health = _a.sent();
              (0, globals_1.expect)(health.healthy).toBe(true);
              (0, globals_1.expect)(health.timestamp).toBeDefined();
              (0, globals_1.expect)(health.responseTime).toBeGreaterThan(0);
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should return unhealthy status when system has issues", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var health;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              // Simulate system issue
              global.fetch.mockRejectedValueOnce(new Error("System down"));
              return [4 /*yield*/, apiSystem.healthCheck()];
            case 1:
              health = _a.sent();
              (0, globals_1.expect)(health.healthy).toBe(false);
              (0, globals_1.expect)(health.error).toBeDefined();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("Performance Monitoring", function () {
    (0, globals_1.beforeEach)(function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, apiSystem.initialize()];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should track request metrics", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockResponse, request, metrics;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockResponse = {
                ok: true,
                status: 200,
                headers: new Headers(),
                json: globals_1.jest.fn().mockResolvedValue({ data: "test" }),
              };
              global.fetch.mockResolvedValue(mockResponse);
              request = {
                endpoint: "/metrics-test",
                method: "GET",
                headers: {},
                cache: { enabled: false },
              };
              return [4 /*yield*/, apiSystem.request(request)];
            case 1:
              _a.sent();
              metrics = apiSystem.getMetrics();
              (0, globals_1.expect)(metrics.totalRequests).toBeGreaterThan(0);
              (0, globals_1.expect)(metrics.averageResponseTime).toBeGreaterThan(0);
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should track error rates", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var request, error_1, metrics;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              global.fetch.mockRejectedValue(new Error("Test error"));
              request = {
                endpoint: "/error-test",
                method: "GET",
                headers: {},
                retryAttempts: 0,
                cache: { enabled: false },
              };
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, , 4]);
              return [4 /*yield*/, apiSystem.request(request)];
            case 2:
              _a.sent();
              return [3 /*break*/, 4];
            case 3:
              error_1 = _a.sent();
              return [3 /*break*/, 4];
            case 4:
              metrics = apiSystem.getMetrics();
              (0, globals_1.expect)(metrics.errorRate).toBeGreaterThan(0);
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("Edge Cases", function () {
    (0, globals_1.beforeEach)(function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, apiSystem.initialize()];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should handle empty response body", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockResponse, request, response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockResponse = {
                ok: true,
                status: 204,
                headers: new Headers(),
                text: globals_1.jest.fn().mockResolvedValue(""),
              };
              global.fetch.mockResolvedValueOnce(mockResponse);
              request = {
                endpoint: "/empty-response",
                method: "DELETE",
                headers: {},
                cache: { enabled: false },
              };
              return [4 /*yield*/, apiSystem.request(request)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response.success).toBe(true);
              (0, globals_1.expect)(response.status).toBe(204);
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should handle malformed JSON response", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockResponse, request, response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockResponse = {
                ok: true,
                status: 200,
                headers: new Headers({ "Content-Type": "application/json" }),
                json: globals_1.jest.fn().mockRejectedValue(new Error("Invalid JSON")),
              };
              global.fetch.mockResolvedValueOnce(mockResponse);
              request = {
                endpoint: "/malformed-json",
                method: "GET",
                headers: {},
                cache: { enabled: false },
              };
              return [4 /*yield*/, apiSystem.request(request)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response.success).toBe(false);
              (0, globals_1.expect)(response.error).toContain("Invalid JSON");
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should handle very large payloads", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockResponse, largePayload, request, response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockResponse = {
                ok: true,
                status: 200,
                headers: new Headers(),
                json: globals_1.jest.fn().mockResolvedValue({ success: true }),
              };
              global.fetch.mockResolvedValueOnce(mockResponse);
              largePayload = {
                data: "x".repeat(10 * 1024 * 1024), // 10MB
              };
              request = {
                endpoint: "/large-payload",
                method: "POST",
                headers: {},
                body: largePayload,
                compression: {
                  enabled: true,
                  algorithm: "gzip",
                  level: 9,
                },
                cache: { enabled: false },
              };
              return [4 /*yield*/, apiSystem.request(request)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response.success).toBe(true);
              return [2 /*return*/];
          }
        });
      });
    });
  });
});
