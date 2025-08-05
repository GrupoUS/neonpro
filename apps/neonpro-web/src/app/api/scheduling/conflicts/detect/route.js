/**
 * Conflict Detection API Route
 * Story 2.2: Intelligent conflict detection and resolution
 *
 * POST /api/scheduling/conflicts/detect
 * Detects scheduling conflicts for a proposed appointment
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
var auth_helpers_nextjs_1 = require("@supabase/auth-helpers-nextjs");
var headers_1 = require("next/headers");
var conflict_resolution_1 = require("@/lib/scheduling/conflict-resolution");
var audit_logger_1 = require("@/lib/auth/audit/audit-logger");
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var auditLogger,
      supabase,
      _a,
      session,
      sessionError,
      body,
      startDate,
      endDate,
      conflictService,
      result,
      error_1;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          auditLogger = new audit_logger_1.AuditLogger();
          _b.label = 1;
        case 1:
          _b.trys.push([1, 6, , 8]);
          supabase = (0, auth_helpers_nextjs_1.createRouteHandlerClient)({
            cookies: headers_1.cookies,
          });
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          (_a = _b.sent()), (session = _a.data.session), (sessionError = _a.error);
          if (sessionError || !session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _b.sent();
          // Validate required fields
          if (
            !body.appointmentStart ||
            !body.appointmentEnd ||
            !body.professionalId ||
            !body.treatmentType
          ) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error:
                    "Missing required fields: appointmentStart, appointmentEnd, professionalId, treatmentType",
                },
                { status: 400 },
              ),
            ];
          }
          startDate = new Date(body.appointmentStart);
          endDate = new Date(body.appointmentEnd);
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Invalid date format. Use ISO 8601 format." },
                { status: 400 },
              ),
            ];
          }
          if (startDate >= endDate) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Start time must be before end time" },
                { status: 400 },
              ),
            ];
          }
          conflictService = new conflict_resolution_1.ConflictDetectionService();
          return [
            4 /*yield*/,
            conflictService.detectConflicts(
              startDate,
              endDate,
              body.professionalId,
              body.treatmentType,
              body.roomId,
              body.equipmentIds,
            ),
          ];
        case 4:
          result = _b.sent();
          // Log the conflict detection
          return [
            4 /*yield*/,
            auditLogger.logActivity(
              "conflict_detection_api",
              "Conflict detection performed for ".concat(body.treatmentType, " appointment"),
              {
                userId: session.user.id,
                professionalId: body.professionalId,
                treatmentType: body.treatmentType,
                conflictCount: result.conflicts.length,
                processingTimeMs: result.processingTimeMs,
                hasConflicts: result.hasConflicts,
              },
            ),
          ];
        case 5:
          // Log the conflict detection
          _b.sent();
          // Return results
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: result,
              metadata: {
                processingTime: result.processingTimeMs,
                timestamp: new Date().toISOString(),
                apiVersion: "2.2.0",
              },
            }),
          ];
        case 6:
          error_1 = _b.sent();
          console.error("Conflict detection error:", error_1);
          return [4 /*yield*/, auditLogger.logError("Conflict detection API failed", error_1)];
        case 7:
          _b.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Internal server error during conflict detection",
                details: process.env.NODE_ENV === "development" ? error_1 : undefined,
              },
              { status: 500 },
            ),
          ];
        case 8:
          return [2 /*return*/];
      }
    });
  });
}
// Options handler for CORS
function OPTIONS(request) {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, (_a) => [
      2 /*return*/,
      new server_1.NextResponse(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }),
    ]);
  });
}
