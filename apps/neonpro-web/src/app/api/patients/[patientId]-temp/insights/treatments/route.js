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
// Story 3.2: API Endpoint - Treatment Recommendations
var server_1 = require("next/server");
var auth_helpers_nextjs_1 = require("@supabase/auth-helpers-nextjs");
var headers_1 = require("next/headers");
var patient_insights_1 = require("@/lib/ai/patient-insights");
var patientInsights = new patient_insights_1.PatientInsightsIntegration();
function GET(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var supabase,
      session,
      patient,
      searchParams,
      treatmentContext,
      treatmentRecommendations,
      error_1;
    var params = _b.params;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 4, , 5]);
          supabase = (0, auth_helpers_nextjs_1.createRouteHandlerClient)({
            cookies: headers_1.cookies,
          });
          return [4 /*yield*/, supabase.auth.getSession()];
        case 1:
          session = _c.sent().data.session;
          if (!session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("patients").select("id").eq("id", params.patientId).single(),
          ];
        case 2:
          patient = _c.sent().data;
          if (!patient) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Patient not found" }, { status: 404 }),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          treatmentContext = searchParams.get("context") || undefined;
          return [
            4 /*yield*/,
            patientInsights.generateTreatmentGuidance(params.patientId, treatmentContext),
          ];
        case 3:
          treatmentRecommendations = _c.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: treatmentRecommendations,
            }),
          ];
        case 4:
          error_1 = _c.sent();
          console.error("Treatment recommendations API error:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "Failed to generate treatment recommendations" },
              { status: 500 },
            ),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
function POST(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var supabase,
      session,
      body,
      treatmentContext,
      _c,
      includeAlternatives,
      _d,
      includeRiskAssessment,
      _e,
      outcomeData,
      treatmentRecommendations,
      response,
      riskAssessment,
      learningInsights,
      error_2;
    var params = _b.params;
    return __generator(this, function (_f) {
      switch (_f.label) {
        case 0:
          _f.trys.push([0, 8, , 9]);
          supabase = (0, auth_helpers_nextjs_1.createRouteHandlerClient)({
            cookies: headers_1.cookies,
          });
          return [4 /*yield*/, supabase.auth.getSession()];
        case 1:
          session = _f.sent().data.session;
          if (!session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 2:
          body = _f.sent();
          (treatmentContext = body.treatmentContext),
            (_c = body.includeAlternatives),
            (includeAlternatives = _c === void 0 ? true : _c),
            (_d = body.includeRiskAssessment),
            (includeRiskAssessment = _d === void 0 ? true : _d),
            (_e = body.outcomeData),
            (outcomeData = _e === void 0 ? null : _e);
          return [
            4 /*yield*/,
            patientInsights.generateTreatmentGuidance(params.patientId, treatmentContext),
          ];
        case 3:
          treatmentRecommendations = _f.sent();
          response = { treatmentRecommendations: treatmentRecommendations };
          if (!includeRiskAssessment) return [3 /*break*/, 5];
          return [4 /*yield*/, patientInsights.generateQuickRiskAssessment(params.patientId)];
        case 4:
          riskAssessment = _f.sent();
          response.riskAssessment = riskAssessment;
          _f.label = 5;
        case 5:
          if (!(outcomeData && outcomeData.treatmentId)) return [3 /*break*/, 7];
          return [
            4 /*yield*/,
            patientInsights.updatePatientOutcome(
              params.patientId,
              outcomeData.treatmentId,
              outcomeData,
            ),
          ];
        case 6:
          learningInsights = _f.sent();
          response.learningInsights = learningInsights;
          _f.label = 7;
        case 7:
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: response,
            }),
          ];
        case 8:
          error_2 = _f.sent();
          console.error("Treatment recommendations POST API error:", error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "Failed to generate comprehensive treatment recommendations" },
              { status: 500 },
            ),
          ];
        case 9:
          return [2 /*return*/];
      }
    });
  });
}
