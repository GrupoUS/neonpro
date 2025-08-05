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
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
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
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
exports.PUT = PUT;
exports.DELETE = DELETE;
var server_1 = require("next/server");
var csrf_protection_1 = require("@/lib/security/csrf-protection");
var auth_1 = require("@/lib/auth");
/**
 * CSRF Token API Route
 * Handles CSRF token generation and validation
 */
var csrfProtection = new csrf_protection_1.CSRFProtection();
/**
 * POST /api/security/csrf-token
 * Generate a new CSRF token for the session
 */
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var authResult, body, sessionId, token, error_1;
    var _a;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 4, , 5]);
          return [4 /*yield*/, (0, auth_1.requireAuth)(request)];
        case 1:
          authResult = _b.sent();
          if (!authResult.authenticated) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Authentication required" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 2:
          body = _b.sent();
          sessionId = body.sessionId;
          if (!sessionId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Session ID is required" }, { status: 400 }),
            ];
          }
          return [
            4 /*yield*/,
            csrfProtection.generateToken(
              sessionId,
              request.headers.get("user-agent") || "",
              ((_a = request.headers.get("x-forwarded-for")) === null || _a === void 0
                ? void 0
                : _a.split(",")[0]) ||
                request.headers.get("x-real-ip") ||
                request.ip ||
                "unknown",
            ),
          ];
        case 3:
          token = _b.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              token: token,
              expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
              sessionId: sessionId,
            }),
          ];
        case 4:
          error_1 = _b.sent();
          console.error("CSRF token generation error:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Failed to generate CSRF token" }, { status: 500 }),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * PUT /api/security/csrf-token
 * Validate a CSRF token
 */
function PUT(request) {
  return __awaiter(this, void 0, void 0, function () {
    var body, token, sessionId, isValid, error_2;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 3, , 4]);
          return [4 /*yield*/, request.json()];
        case 1:
          body = _a.sent();
          (token = body.token), (sessionId = body.sessionId);
          if (!token || !sessionId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Token and session ID are required" },
                { status: 400 },
              ),
            ];
          }
          return [4 /*yield*/, csrfProtection.validateToken(token, sessionId)];
        case 2:
          isValid = _a.sent();
          if (!isValid) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 }),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              valid: true,
              message: "CSRF token is valid",
            }),
          ];
        case 3:
          error_2 = _a.sent();
          console.error("CSRF token validation error:", error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Failed to validate CSRF token" }, { status: 500 }),
          ];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * DELETE /api/security/csrf-token
 * Invalidate CSRF tokens for a session
 */
function DELETE(request) {
  return __awaiter(this, void 0, void 0, function () {
    var authResult, searchParams, sessionId, error_3;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 3, , 4]);
          return [4 /*yield*/, (0, auth_1.requireAuth)(request)];
        case 1:
          authResult = _a.sent();
          if (!authResult.authenticated) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Authentication required" }, { status: 401 }),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          sessionId = searchParams.get("sessionId");
          if (!sessionId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Session ID is required" }, { status: 400 }),
            ];
          }
          // Invalidate tokens for the session
          return [4 /*yield*/, csrfProtection.invalidateSessionTokens(sessionId)];
        case 2:
          // Invalidate tokens for the session
          _a.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              message: "CSRF tokens invalidated successfully",
            }),
          ];
        case 3:
          error_3 = _a.sent();
          console.error("CSRF token invalidation error:", error_3);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "Failed to invalidate CSRF tokens" },
              { status: 500 },
            ),
          ];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
