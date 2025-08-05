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
exports.GET = GET;
exports.PUT = PUT;
var server_1 = require("@/lib/supabase/server");
var server_2 = require("next/server");
/**
 * Generate AI Patient Insights
 * Provides AI-powered analysis and recommendations for patient care
 */
function GET(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var supabase,
      patientId,
      _c,
      session,
      sessionError,
      userRole,
      PatientInsights,
      insightsEngine,
      insights,
      error_1;
    var params = _b.params;
    return __generator(this, function (_d) {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 7, , 8]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _d.sent();
          return [4 /*yield*/, params];
        case 2:
          patientId = _d.sent().id;
          return [4 /*yield*/, supabase.auth.getSession()];
        case 3:
          (_c = _d.sent()), (session = _c.data.session), (sessionError = _c.error);
          if (sessionError || !session) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("user_roles").select("role").eq("user_id", session.user.id).single(),
          ];
        case 4:
          userRole = _d.sent().data;
          if (!userRole || !["admin", "doctor", "nurse"].includes(userRole.role)) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Insufficient permissions" }, { status: 403 }),
            ];
          }
          return [
            4 /*yield*/,
            Promise.resolve().then(function () {
              return require("@/lib/ai/patient-insights");
            }),
          ];
        case 5:
          PatientInsights = _d.sent().default;
          insightsEngine = new PatientInsights();
          return [4 /*yield*/, insightsEngine.generatePatientInsights(patientId)];
        case 6:
          insights = _d.sent();
          if (!insights) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Failed to generate patient insights" },
                { status: 500 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              insights: insights,
              message: "Patient insights generated successfully",
            }),
          ];
        case 7:
          error_1 = _d.sent();
          console.error("Error in GET /api/patients/[id]/insights:", error_1);
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 8:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Update Risk Assessment
 * Updates patient risk assessment manually
 */
function PUT(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var supabase,
      patientId,
      body,
      _c,
      session,
      sessionError,
      userRole,
      risk_score,
      risk_level,
      notes,
      _d,
      updatedProfile,
      updateError,
      error_2;
    var params = _b.params;
    return __generator(this, function (_e) {
      switch (_e.label) {
        case 0:
          _e.trys.push([0, 5, , 6]);
          supabase = createRouteHandlerClient({ cookies: cookies });
          patientId = params.id;
          return [4 /*yield*/, request.json()];
        case 1:
          body = _e.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          (_c = _e.sent()), (session = _c.data.session), (sessionError = _c.error);
          if (sessionError || !session) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("user_roles").select("role").eq("user_id", session.user.id).single(),
          ];
        case 3:
          userRole = _e.sent().data;
          if (!userRole || !["admin", "doctor"].includes(userRole.role)) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Insufficient permissions" }, { status: 403 }),
            ];
          }
          (risk_score = body.risk_score), (risk_level = body.risk_level), (notes = body.notes);
          return [
            4 /*yield*/,
            supabase
              .from("patient_profiles_extended")
              .update({
                risk_score: risk_score,
                risk_level: risk_level,
                risk_assessment_notes: notes,
                last_assessment_date: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq("patient_id", patientId)
              .select()
              .single(),
          ];
        case 4:
          (_d = _e.sent()), (updatedProfile = _d.data), (updateError = _d.error);
          if (updateError) {
            console.error("Error updating risk assessment:", updateError);
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Failed to update risk assessment" },
                { status: 500 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              profile: updatedProfile,
              message: "Risk assessment updated successfully",
            }),
          ];
        case 5:
          error_2 = _e.sent();
          console.error("Error in PUT /api/patients/[id]/insights:", error_2);
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
