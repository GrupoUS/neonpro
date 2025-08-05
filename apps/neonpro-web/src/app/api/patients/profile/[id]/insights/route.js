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
exports.POST = POST;
var server_1 = require("@/app/utils/supabase/server");
var patient_insights_1 = require("@/lib/ai/patient-insights");
var profile_manager_1 = require("@/lib/patients/profile-manager");
var server_2 = require("next/server");
// Initialize services
var profileManager = new profile_manager_1.ProfileManager();
var patientInsights = new patient_insights_1.PatientInsights();
/**
 * GET /api/patients/profile/[id]/insights - Get patient insights
 */
function GET(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var supabase,
      _c,
      user,
      authError,
      id,
      profile,
      searchParams,
      insightType,
      insights,
      _d,
      error_1;
    var params = _b.params;
    return __generator(this, function (_e) {
      switch (_e.label) {
        case 0:
          _e.trys.push([0, 17, , 18]);
          supabase = (0, server_1.createClient)();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 1:
          (_c = _e.sent()), (user = _c.data.user), (authError = _c.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, params];
        case 2:
          id = _e.sent().id;
          return [4 /*yield*/, profileManager.getPatientProfile(id)];
        case 3:
          profile = _e.sent();
          if (!profile) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Patient profile not found" }, { status: 404 }),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          insightType = searchParams.get("type");
          insights = void 0;
          _d = insightType;
          switch (_d) {
            case "clinical":
              return [3 /*break*/, 4];
            case "personalization":
              return [3 /*break*/, 6];
            case "risk":
              return [3 /*break*/, 8];
            case "care":
              return [3 /*break*/, 10];
            case "trending":
              return [3 /*break*/, 12];
          }
          return [3 /*break*/, 14];
        case 4:
          return [4 /*yield*/, patientInsights.generateClinicalInsights(profile)];
        case 5:
          insights = _e.sent();
          return [3 /*break*/, 16];
        case 6:
          return [4 /*yield*/, patientInsights.generatePersonalizationInsights(profile)];
        case 7:
          insights = _e.sent();
          return [3 /*break*/, 16];
        case 8:
          return [4 /*yield*/, patientInsights.generateRiskAssessment(profile)];
        case 9:
          insights = _e.sent();
          return [3 /*break*/, 16];
        case 10:
          return [4 /*yield*/, patientInsights.generateCareRecommendations(profile)];
        case 11:
          insights = _e.sent();
          return [3 /*break*/, 16];
        case 12:
          return [4 /*yield*/, patientInsights.getTrendingInsights(id)];
        case 13:
          insights = _e.sent();
          return [3 /*break*/, 16];
        case 14:
          return [4 /*yield*/, patientInsights.generateComprehensiveInsights(profile)];
        case 15:
          insights = _e.sent();
          _e.label = 16;
        case 16:
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              insights: insights,
              patient_id: id,
              type: insightType || "comprehensive",
              generated_at: new Date().toISOString(),
              message: "Patient insights retrieved successfully",
            }),
          ];
        case 17:
          error_1 = _e.sent();
          console.error("Error retrieving patient insights:", error_1);
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 18:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * POST /api/patients/profile/[id]/insights - Regenerate insights
 */
function POST(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var supabase, _c, user, authError, id, profile, insights, updated, error_2;
    var params = _b.params;
    return __generator(this, function (_d) {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 6, , 7]);
          supabase = (0, server_1.createClient)();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 1:
          (_c = _d.sent()), (user = _c.data.user), (authError = _c.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, params];
        case 2:
          id = _d.sent().id;
          return [4 /*yield*/, profileManager.getPatientProfile(id)];
        case 3:
          profile = _d.sent();
          if (!profile) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Patient profile not found" }, { status: 404 }),
            ];
          }
          return [4 /*yield*/, patientInsights.generateComprehensiveInsights(profile)];
        case 4:
          insights = _d.sent();
          return [4 /*yield*/, patientInsights.updateInsights(id, insights)];
        case 5:
          updated = _d.sent();
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              insights: updated,
              patient_id: id,
              regenerated_at: new Date().toISOString(),
              message: "Patient insights regenerated successfully",
            }),
          ];
        case 6:
          error_2 = _d.sent();
          console.error("Error regenerating patient insights:", error_2);
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
