// Stock Alerts Acknowledge API - Enhanced with QA Best Practices
// Implementation of Story 11.4: Alert Acknowledgment with Service Layer
// Following Senior Developer patterns and audit trail
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
exports.OPTIONS = OPTIONS;
var server_1 = require("next/server");
var stock_alert_service_1 = require("@/app/lib/services/stock-alert.service");
var stock_1 = require("@/app/lib/types/stock");
var zod_1 = require("zod");
// ============================================================================
// VALIDATION SCHEMAS (QA Enhancement)
// ============================================================================
var AcknowledgeAlertRequestSchema = zod_1.z.object({
  alertId: zod_1.z.string().uuid(),
  note: zod_1.z.string().optional(),
});
// ============================================================================
// UTILITY FUNCTIONS (DRY Principle - Imported from main alerts route)
// ============================================================================
function getClinicIdFromSession() {
  return __awaiter(this, void 0, void 0, function () {
    var createClient, supabase, _a, session, sessionError, userId, _b, profile, profileError;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          return [4 /*yield*/, Promise.resolve().then(() => require("@/lib/supabase/server"))];
        case 1:
          createClient = _c.sent().createClient;
          return [4 /*yield*/, createClient()];
        case 2:
          supabase = _c.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 3:
          (_a = _c.sent()), (session = _a.data.session), (sessionError = _a.error);
          if (sessionError || !session) {
            throw new stock_1.StockAlertError("Authentication required", "UNAUTHORIZED", {
              sessionError:
                sessionError === null || sessionError === void 0 ? void 0 : sessionError.message,
            });
          }
          userId = session.user.id;
          return [
            4 /*yield*/,
            supabase.from("profiles").select("clinic_id").eq("id", userId).single(),
          ];
        case 4:
          (_b = _c.sent()), (profile = _b.data), (profileError = _b.error);
          if (
            profileError ||
            !(profile === null || profile === void 0 ? void 0 : profile.clinic_id)
          ) {
            throw new stock_1.StockAlertError(
              "User profile not found or no clinic associated",
              "PROFILE_NOT_FOUND",
              {
                userId: userId,
                profileError:
                  profileError === null || profileError === void 0 ? void 0 : profileError.message,
              },
            );
          }
          return [2 /*return*/, { clinicId: profile.clinic_id, userId: userId }];
      }
    });
  });
}
function handleError(error) {
  console.error("Stock Alerts Acknowledge API Error:", {
    error: error instanceof Error ? error.message : "Unknown error",
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
  });
  if (error instanceof stock_1.StockAlertError) {
    var statusCode = getStatusCodeForError(error.code);
    return server_1.NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          context: error.context,
          timestamp: new Date().toISOString(),
        },
      },
      { status: statusCode },
    );
  }
  if (error instanceof zod_1.z.ZodError) {
    return server_1.NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request data",
          details: error.errors,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 400 },
    );
  }
  return server_1.NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
        timestamp: new Date().toISOString(),
      },
    },
    { status: 500 },
  );
}
function getStatusCodeForError(errorCode) {
  var statusMap = {
    UNAUTHORIZED: 401,
    PROFILE_NOT_FOUND: 401,
    VALIDATION_ERROR: 400,
    ALERT_NOT_FOUND: 404,
    ACKNOWLEDGE_FAILED: 500,
    INTERNAL_ERROR: 500,
  };
  return statusMap[errorCode] || 500;
}
// ============================================================================
// API ENDPOINTS (QA Enhancement: Using service layer)
// ============================================================================
/**
 * POST /api/stock/alerts/acknowledge
 * Acknowledges an alert using service layer with proper audit trail
 * Enhanced with performance monitoring and event sourcing
 */
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var startTime,
      body,
      validatedRequest,
      _a,
      clinicId,
      userId,
      alertService,
      acknowledgedAlert,
      duration,
      error_1;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          startTime = Date.now();
          _b.label = 1;
        case 1:
          _b.trys.push([1, 6, , 7]);
          return [4 /*yield*/, request.json()];
        case 2:
          body = _b.sent();
          validatedRequest = AcknowledgeAlertRequestSchema.parse(body);
          return [
            4 /*yield*/,
            getClinicIdFromSession(),
            // Create service instance (using dependency injection pattern)
          ];
        case 3:
          (_a = _b.sent()), (clinicId = _a.clinicId), (userId = _a.userId);
          return [
            4 /*yield*/,
            (0, stock_alert_service_1.createStockAlertService)(clinicId),
            // Acknowledge alert using service layer (QA Best Practice)
          ];
        case 4:
          alertService = _b.sent();
          return [
            4 /*yield*/,
            alertService.acknowledgeAlert(validatedRequest, userId),
            // Performance monitoring
          ];
        case 5:
          acknowledgedAlert = _b.sent();
          duration = Date.now() - startTime;
          console.log("POST /api/stock/alerts/acknowledge completed in ".concat(duration, "ms"), {
            alertId: validatedRequest.alertId,
            userId: userId,
            clinicId: clinicId,
          });
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: {
                alert: acknowledgedAlert,
                message: "Alert acknowledged successfully",
                action: {
                  type: "acknowledged",
                  performedBy: userId,
                  performedAt: new Date().toISOString(),
                  note: validatedRequest.note,
                },
                metadata: {
                  duration: "".concat(duration, "ms"),
                  timestamp: new Date().toISOString(),
                },
              },
            }),
          ];
        case 6:
          error_1 = _b.sent();
          return [2 /*return*/, handleError(error_1)];
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
// ============================================================================
// OPTIONS - CORS support (Enhanced with security headers)
// ============================================================================
function OPTIONS() {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, (_a) => [
      2 /*return*/,
      new server_1.NextResponse(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin":
            process.env.NODE_ENV === "production" ? "https://neonpro.app" : "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400",
        },
      }),
    ]);
  });
}
