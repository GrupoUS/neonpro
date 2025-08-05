"use strict";
/**
 * Risk Alerts API Routes
 * Story 9.4: Real-time alert management for risk assessments
 *
 * Provides endpoints for:
 * - Creating and managing risk alerts
 * - Real-time alert notifications
 * - Alert acknowledgment and resolution
 * - Emergency protocol activation
 */
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
var risk_assessment_automation_1 = require("@/app/lib/services/risk-assessment-automation");
var risk_assessment_automation_2 = require("@/app/lib/validations/risk-assessment-automation");
var server_1 = require("next/server");
var riskAssessmentService = new risk_assessment_automation_1.RiskAssessmentService();
/**
 * GET /api/risk-assessment/alerts
 * Retrieve risk alerts with optional filtering
 */
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var searchParams,
      assessmentId,
      riskLevel,
      status_1,
      active,
      limit,
      offset,
      filters,
      alerts,
      error_1;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, , 3]);
          searchParams = new URL(request.url).searchParams;
          assessmentId = searchParams.get("assessmentId");
          riskLevel = searchParams.get("riskLevel");
          status_1 = searchParams.get("status");
          active = searchParams.get("active") === "true";
          limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")) : 50;
          offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")) : 0;
          filters = {};
          if (assessmentId) filters.assessment_id = assessmentId;
          if (riskLevel) filters.risk_level = riskLevel;
          if (status_1) filters.alert_status = status_1;
          if (active) filters.alert_status = "active";
          return [4 /*yield*/, riskAssessmentService.getAllAlerts(filters, limit, offset)];
        case 1:
          alerts = _a.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: alerts,
              pagination: {
                limit: limit,
                offset: offset,
                total: alerts.length,
              },
            }),
          ];
        case 2:
          error_1 = _a.sent();
          console.error("Error fetching alerts:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: false,
                error: "Failed to fetch alerts",
                details: error_1 instanceof Error ? error_1.message : "Unknown error",
              },
              { status: 500 },
            ),
          ];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * POST /api/risk-assessment/alerts
 * Create new risk alert
 */
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var body, validationResult, requestData, alert_1, error_2;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 3, , 4]);
          return [4 /*yield*/, request.json()];
        case 1:
          body = _a.sent();
          validationResult = risk_assessment_automation_2.AlertSchema.safeParse(body);
          if (!validationResult.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  success: false,
                  error: "Validation failed",
                  details: validationResult.error.flatten(),
                },
                { status: 400 },
              ),
            ];
          }
          requestData = validationResult.data;
          return [4 /*yield*/, riskAssessmentService.createAlert(requestData)];
        case 2:
          alert_1 = _a.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: true,
                data: alert_1,
                message: "Alert created successfully",
              },
              { status: 201 },
            ),
          ];
        case 3:
          error_2 = _a.sent();
          console.error("Error creating alert:", error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: false,
                error: "Failed to create alert",
                details: error_2 instanceof Error ? error_2.message : "Unknown error",
              },
              { status: 500 },
            ),
          ];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
