// app/api/automated-analysis/route.ts
// Main API endpoints for Story 10.1: Automated Before/After Analysis
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
var __rest =
  (this && this.__rest) ||
  ((s, e) => {
    var t = {};
    for (var p in s) if (Object.hasOwn(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
          t[p[i]] = s[p[i]];
      }
    return t;
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
exports.PUT = PUT;
exports.DELETE = DELETE;
var automated_before_after_analysis_1 = require("@/app/lib/services/automated-before-after-analysis");
var automated_before_after_analysis_2 = require("@/app/lib/validations/automated-before-after-analysis");
var server_1 = require("@/lib/supabase/server");
var server_2 = require("next/server");
// GET /api/automated-analysis - Get analysis sessions with filters
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, user, searchParams, filters, validatedFilters, sessions, error_1;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 4, undefined, 5]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _a.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          user = _a.sent().data.user;
          if (!user) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          searchParams = request.nextUrl.searchParams;
          filters = {
            patient_id: searchParams.get("patient_id") || undefined,
            treatment_type: searchParams.get("treatment_type") || undefined,
            analysis_type: searchParams.get("analysis_type") || undefined,
            status: searchParams.get("status") || undefined,
            date_from: searchParams.get("date_from") || undefined,
            date_to: searchParams.get("date_to") || undefined,
            accuracy_min: searchParams.get("accuracy_min")
              ? Number(searchParams.get("accuracy_min"))
              : undefined,
            created_by: searchParams.get("created_by") || undefined,
          };
          validatedFilters =
            automated_before_after_analysis_2.validationSchemas.analysisSessionFilters.parse(
              filters,
            );
          return [
            4 /*yield*/,
            (0,
            automated_before_after_analysis_1.createautomatedBeforeAfterAnalysisService)().getAnalysisSessions(
              validatedFilters,
            ),
          ];
        case 3:
          sessions = _a.sent();
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              success: true,
              data: sessions,
              count: sessions.length,
            }),
          ];
        case 4:
          error_1 = _a.sent();
          console.error("Error fetching analysis sessions:", error_1);
          return [
            2 /*return*/,
            server_2.NextResponse.json(
              {
                error: "Failed to fetch analysis sessions",
                details: error_1 instanceof Error ? error_1.message : "Unknown error",
              },
              { status: 500 },
            ),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
// POST /api/automated-analysis - Create new analysis session
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, user, body, validatedData, session, error_2;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 5, undefined, 6]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _a.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          user = _a.sent().data.user;
          if (!user) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _a.sent();
          validatedData =
            automated_before_after_analysis_2.validationSchemas.createAnalysisSession.parse(body);
          return [
            4 /*yield*/,
            (0,
            automated_before_after_analysis_1.createautomatedBeforeAfterAnalysisService)().createAnalysisSession(
              validatedData,
            ),
          ];
        case 4:
          session = _a.sent();
          return [
            2 /*return*/,
            server_2.NextResponse.json(
              {
                success: true,
                data: session,
                message: "Analysis session created successfully",
              },
              { status: 201 },
            ),
          ];
        case 5:
          error_2 = _a.sent();
          console.error("Error creating analysis session:", error_2);
          return [
            2 /*return*/,
            server_2.NextResponse.json(
              {
                error: "Failed to create analysis session",
                details: error_2 instanceof Error ? error_2.message : "Unknown error",
              },
              { status: 500 },
            ),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
// PUT /api/automated-analysis - Update analysis session
function PUT(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, user, body, id, updates, validatedUpdates, updatedSession, error_3;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 5, undefined, 6]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _a.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          user = _a.sent().data.user;
          if (!user) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _a.sent();
          (id = body.id), (updates = __rest(body, ["id"]));
          if (!id) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Session ID is required" }, { status: 400 }),
            ];
          }
          validatedUpdates =
            automated_before_after_analysis_2.validationSchemas.updateAnalysisSession.parse(
              updates,
            );
          return [
            4 /*yield*/,
            (0,
            automated_before_after_analysis_1.createautomatedBeforeAfterAnalysisService)().updateAnalysisSession(
              id,
              validatedUpdates,
            ),
          ];
        case 4:
          updatedSession = _a.sent();
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              success: true,
              data: updatedSession,
              message: "Analysis session updated successfully",
            }),
          ];
        case 5:
          error_3 = _a.sent();
          console.error("Error updating analysis session:", error_3);
          return [
            2 /*return*/,
            server_2.NextResponse.json(
              {
                error: "Failed to update analysis session",
                details: error_3 instanceof Error ? error_3.message : "Unknown error",
              },
              { status: 500 },
            ),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
// DELETE /api/automated-analysis - Delete analysis session
function DELETE(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, user, searchParams, id, error_4;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 4, undefined, 5]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _a.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          user = _a.sent().data.user;
          if (!user) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          searchParams = request.nextUrl.searchParams;
          id = searchParams.get("id");
          if (!id) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Session ID is required" }, { status: 400 }),
            ];
          }
          return [
            4 /*yield*/,
            (0,
            automated_before_after_analysis_1.createautomatedBeforeAfterAnalysisService)().deleteAnalysisSession(
              id,
            ),
          ];
        case 3:
          _a.sent();
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              success: true,
              message: "Analysis session deleted successfully",
            }),
          ];
        case 4:
          error_4 = _a.sent();
          console.error("Error deleting analysis session:", error_4);
          return [
            2 /*return*/,
            server_2.NextResponse.json(
              {
                error: "Failed to delete analysis session",
                details: error_4 instanceof Error ? error_4.message : "Unknown error",
              },
              { status: 500 },
            ),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
