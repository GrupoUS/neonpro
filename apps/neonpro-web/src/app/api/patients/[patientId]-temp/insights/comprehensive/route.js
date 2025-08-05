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
// Story 3.2: API Endpoint - Comprehensive Patient Insights
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
      requestedInsights,
      treatmentContext,
      insightRequest,
      comprehensiveInsights,
      error_1;
    var _c;
    var params = _b.params;
    return __generator(this, function (_d) {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 4, , 5]);
          supabase = (0, auth_helpers_nextjs_1.createRouteHandlerClient)({
            cookies: headers_1.cookies,
          });
          return [4 /*yield*/, supabase.auth.getSession()];
        case 1:
          session = _d.sent().data.session;
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
          patient = _d.sent().data;
          if (!patient) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Patient not found" }, { status: 404 }),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          requestedInsights =
            ((_c = searchParams.get("insights")) === null || _c === void 0
              ? void 0
              : _c.split(",")) || [];
          treatmentContext = searchParams.get("context") || undefined;
          insightRequest = {
            patientId: params.patientId,
            requestedInsights: requestedInsights.length > 0 ? requestedInsights : undefined,
            treatmentContext: treatmentContext,
            timestamp: new Date(),
            requestId: "req_".concat(Date.now(), "_").concat(params.patientId),
          };
          return [4 /*yield*/, patientInsights.generateComprehensiveInsights(insightRequest)];
        case 3:
          comprehensiveInsights = _d.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: comprehensiveInsights,
            }),
          ];
        case 4:
          error_1 = _d.sent();
          console.error("Comprehensive insights API error:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "Failed to generate comprehensive insights" },
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
    var supabase, session, body, insightRequest, comprehensiveInsights, error_2;
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
            request.json(),
            // Create detailed insight request from body
          ];
        case 2:
          body = _c.sent();
          insightRequest = {
            patientId: params.patientId,
            requestedInsights: body.requestedInsights || [],
            treatmentContext: body.treatmentContext,
            treatmentId: body.treatmentId,
            customParameters: body.customParameters || {},
            feedbackData: body.feedbackData,
            timestamp: new Date(),
            requestId: body.requestId || "req_".concat(Date.now(), "_").concat(params.patientId),
          };
          return [4 /*yield*/, patientInsights.generateComprehensiveInsights(insightRequest)];
        case 3:
          comprehensiveInsights = _c.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: comprehensiveInsights,
              requestId: insightRequest.requestId,
            }),
          ];
        case 4:
          error_2 = _c.sent();
          console.error("Comprehensive insights POST API error:", error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "Failed to generate comprehensive insights" },
              { status: 500 },
            ),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
