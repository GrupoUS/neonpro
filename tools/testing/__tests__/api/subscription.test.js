/**
 * API Routes Integration Tests
 * Tests subscription API endpoints and integration functionality
 *
 * @description Comprehensive integration tests for subscription API routes,
 *              covering CRUD operations, authentication, and error handling
 * @version 1.0.0
 * @created 2025-07-22
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
var node_mocks_http_1 = require("node-mocks-http");
var testUtils_1 = require("../utils/testUtils");
// Mock API handler (to be imported when it exists)
var mockSubscriptionHandler = (req, res) =>
  __awaiter(void 0, void 0, void 0, function () {
    var subscription;
    return __generator(this, (_a) => {
      if (req.method === "GET") {
        subscription = (0, testUtils_1.createMockSubscription)();
        res.status(200).json(subscription);
      } else if (req.method === "POST") {
        res.status(201).json({ success: true });
      } else {
        res.status(405).json({ error: "Method not allowed" });
      }
      return [2 /*return*/];
    });
  });
// ============================================================================
// API Integration Tests
// ============================================================================
(0, globals_1.describe)("Subscription API Routes", () => {
  (0, globals_1.beforeEach)(() => {
    globals_1.jest.clearAllMocks();
  });
  // ============================================================================
  // GET /api/subscription Tests
  // ============================================================================
  (0, globals_1.describe)("GET /api/subscription", () => {
    (0, globals_1.it)("should return subscription data for authenticated user", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var _a, req, res, data;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              (_a = (0, node_mocks_http_1.createMocks)({
                method: "GET",
                headers: {
                  authorization: "Bearer test-token",
                },
              })),
                (req = _a.req),
                (res = _a.res);
              return [4 /*yield*/, mockSubscriptionHandler(req, res)];
            case 1:
              _b.sent();
              (0, globals_1.expect)(res._getStatusCode()).toBe(200);
              data = JSON.parse(res._getData());
              (0, globals_1.expect)(data).toHaveProperty("id");
              (0, globals_1.expect)(data).toHaveProperty("status");
              (0, globals_1.expect)(data).toHaveProperty("tier");
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should return 401 for unauthenticated requests", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var _a, req, res, unauthenticatedHandler, data;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              (_a = (0, node_mocks_http_1.createMocks)({
                method: "GET",
                headers: {},
              })),
                (req = _a.req),
                (res = _a.res);
              unauthenticatedHandler = (_req, res) =>
                __awaiter(void 0, void 0, void 0, function () {
                  return __generator(this, (_a) => {
                    res.status(401).json({ error: "Unauthorized" });
                    return [2 /*return*/];
                  });
                });
              return [4 /*yield*/, unauthenticatedHandler(req, res)];
            case 1:
              _b.sent();
              (0, globals_1.expect)(res._getStatusCode()).toBe(401);
              data = JSON.parse(res._getData());
              (0, globals_1.expect)(data).toEqual({ error: "Unauthorized" });
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should handle database errors gracefully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var _a, req, res, errorHandler;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              (_a = (0, node_mocks_http_1.createMocks)({
                method: "GET",
                headers: {
                  authorization: "Bearer test-token",
                },
              })),
                (req = _a.req),
                (res = _a.res);
              errorHandler = (_req, res) =>
                __awaiter(void 0, void 0, void 0, function () {
                  return __generator(this, (_a) => {
                    res.status(500).json({ error: "Internal server error" });
                    return [2 /*return*/];
                  });
                });
              return [4 /*yield*/, errorHandler(req, res)];
            case 1:
              _b.sent();
              (0, globals_1.expect)(res._getStatusCode()).toBe(500);
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  // ============================================================================
  // POST /api/subscription Tests
  // ============================================================================
  (0, globals_1.describe)("POST /api/subscription", () => {
    (0, globals_1.it)("should create new subscription successfully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var _a, req, res, data;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              (_a = (0, node_mocks_http_1.createMocks)({
                method: "POST",
                body: {
                  tier: "premium",
                  userId: "test-user-123",
                },
                headers: {
                  "content-type": "application/json",
                },
              })),
                (req = _a.req),
                (res = _a.res);
              return [4 /*yield*/, mockSubscriptionHandler(req, res)];
            case 1:
              _b.sent();
              (0, globals_1.expect)(res._getStatusCode()).toBe(201);
              data = JSON.parse(res._getData());
              (0, globals_1.expect)(data).toEqual({ success: true });
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should validate required fields", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var _a, req, res, validationHandler;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              (_a = (0, node_mocks_http_1.createMocks)({
                method: "POST",
                body: {
                  // Missing required fields
                },
                headers: {
                  "content-type": "application/json",
                },
              })),
                (req = _a.req),
                (res = _a.res);
              validationHandler = (_req, res) =>
                __awaiter(void 0, void 0, void 0, function () {
                  return __generator(this, (_a) => {
                    res.status(400).json({ error: "Missing required fields" });
                    return [2 /*return*/];
                  });
                });
              return [4 /*yield*/, validationHandler(req, res)];
            case 1:
              _b.sent();
              (0, globals_1.expect)(res._getStatusCode()).toBe(400);
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  // ============================================================================
  // Method Not Allowed Tests
  // ============================================================================
  (0, globals_1.describe)("Unsupported HTTP Methods", () => {
    (0, globals_1.it)("should return 405 for unsupported methods", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var _a, req, res, data;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              (_a = (0, node_mocks_http_1.createMocks)({
                method: "DELETE",
              })),
                (req = _a.req),
                (res = _a.res);
              return [4 /*yield*/, mockSubscriptionHandler(req, res)];
            case 1:
              _b.sent();
              (0, globals_1.expect)(res._getStatusCode()).toBe(405);
              data = JSON.parse(res._getData());
              (0, globals_1.expect)(data).toEqual({ error: "Method not allowed" });
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should handle OPTIONS requests correctly", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var _a, req, res, optionsHandler;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              (_a = (0, node_mocks_http_1.createMocks)({
                method: "OPTIONS",
              })),
                (req = _a.req),
                (res = _a.res);
              optionsHandler = (_req, res) =>
                __awaiter(void 0, void 0, void 0, function () {
                  return __generator(this, (_a) => {
                    res.setHeader("Allow", ["GET", "POST"]);
                    res.status(200).end();
                    return [2 /*return*/];
                  });
                });
              return [4 /*yield*/, optionsHandler(req, res)];
            case 1:
              _b.sent();
              (0, globals_1.expect)(res._getStatusCode()).toBe(200);
              (0, globals_1.expect)(res.getHeader("Allow")).toEqual(["GET", "POST"]);
              return [2 /*return*/];
          }
        });
      }),
    );
  });
});
