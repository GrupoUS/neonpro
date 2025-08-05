// RETENTION-CAMPAIGNS INTEGRATION API ENDPOINT
// Epic 7.4: Patient Retention Analytics + Predictions - Task 5
// API endpoint for integrating retention interventions with CRM campaigns
// =====================================================================================
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
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
exports.GET = GET;
exports.POST = POST;
exports.PATCH = PATCH;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var zod_1 = require("zod");
// =====================================================================================
// VALIDATION SCHEMAS
// =====================================================================================
var CreateRetentionCampaignSchema = zod_1.z.object({
  clinicId: zod_1.z.string().uuid("Invalid clinic ID format"),
  name: zod_1.z.string().min(1, "Campaign name is required"),
  description: zod_1.z.string().optional(),
  targetSegments: zod_1.z.array(zod_1.z.string()).min(1, "At least one target segment required"),
  triggerConditions: zod_1.z.object({
    churnProbabilityThreshold: zod_1.z.number().min(0).max(1),
    daysSinceLastVisit: zod_1.z.number().min(1),
    minimumLTV: zod_1.z.number().min(0).optional(),
    riskLevel: zod_1.z.enum(["low", "medium", "high"]),
  }),
  interventionStrategy: zod_1.z.object({
    type: zod_1.z.enum(["email", "sms", "phone_call", "in_app", "multi_channel"]),
    template: zod_1.z.string().min(1, "Template is required"),
    scheduling: zod_1.z.object({
      immediate: zod_1.z.boolean().default(false),
      delayHours: zod_1.z.number().min(0).optional(),
      maxRetries: zod_1.z.number().min(1).max(5).default(3),
      retryIntervalHours: zod_1.z.number().min(1).default(24),
    }),
    personalization: zod_1.z.object({
      includeName: zod_1.z.boolean().default(true),
      includeLastService: zod_1.z.boolean().default(true),
      includeSpecialOffer: zod_1.z.boolean().default(false),
      customVariables: zod_1.z.record(zod_1.z.string()).optional(),
    }),
  }),
  measurementCriteria: zod_1.z.object({
    successMetrics: zod_1.z.array(
      zod_1.z.enum(["return_visit", "booking_scheduled", "payment_made", "engagement_rate"]),
    ),
    trackingPeriodDays: zod_1.z.number().min(1).max(365).default(30),
    abtestEnabled: zod_1.z.boolean().default(false),
    abtestSplitPercentage: zod_1.z.number().min(10).max(90).optional(),
  }),
  isActive: zod_1.z.boolean().default(true),
});
var UpdateCampaignMetricsSchema = zod_1.z.object({
  campaignId: zod_1.z.string().uuid(),
  metrics: zod_1.z.object({
    sent: zod_1.z.number().min(0).optional(),
    delivered: zod_1.z.number().min(0).optional(),
    opened: zod_1.z.number().min(0).optional(),
    clicked: zod_1.z.number().min(0).optional(),
    conversions: zod_1.z.number().min(0).optional(),
    revenue: zod_1.z.number().min(0).optional(),
    costs: zod_1.z.number().min(0).optional(),
  }),
  timestamp: zod_1.z.string().datetime().optional(),
});
// =====================================================================================
// GET RETENTION CAMPAIGNS
// =====================================================================================
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var searchParams,
      clinicId,
      status_1,
      segment,
      supabase,
      query,
      _a,
      campaigns,
      error,
      enrichedCampaigns,
      error_1;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 3, , 4]);
          searchParams = new URL(request.url).searchParams;
          clinicId = searchParams.get("clinic_id");
          status_1 = searchParams.get("status");
          segment = searchParams.get("segment");
          if (!clinicId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Clinic ID is required" }, { status: 400 }),
            ];
          }
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _b.sent();
          query = supabase
            .from("retention_campaigns")
            .select(
              "\n        *,\n        campaign_metrics:retention_campaign_metrics(*),\n        executions:retention_campaign_executions(\n          count\n        )\n      ",
            )
            .eq("clinic_id", clinicId)
            .order("created_at", { ascending: false });
          // Apply filters
          if (status_1) {
            query = query.eq("status", status_1);
          }
          if (segment) {
            query = query.contains("target_segments", [segment]);
          }
          return [4 /*yield*/, query];
        case 2:
          (_a = _b.sent()), (campaigns = _a.data), (error = _a.error);
          if (error) {
            throw new Error("Failed to fetch retention campaigns: ".concat(error.message));
          }
          enrichedCampaigns = campaigns.map((campaign) => {
            var _a, _b;
            var metrics = campaign.campaign_metrics[0] || {};
            var executions =
              ((_a = campaign.executions[0]) === null || _a === void 0 ? void 0 : _a.count) || 0;
            return __assign(__assign({}, campaign), {
              performance: {
                deliveryRate: metrics.sent > 0 ? (metrics.delivered / metrics.sent) * 100 : 0,
                openRate: metrics.delivered > 0 ? (metrics.opened / metrics.delivered) * 100 : 0,
                clickRate: metrics.opened > 0 ? (metrics.clicked / metrics.opened) * 100 : 0,
                conversionRate: metrics.sent > 0 ? (metrics.conversions / metrics.sent) * 100 : 0,
                roi:
                  metrics.costs > 0 ? ((metrics.revenue - metrics.costs) / metrics.costs) * 100 : 0,
                totalExecutions: executions,
              },
              lastExecuted:
                ((_b = campaign.executions[0]) === null || _b === void 0
                  ? void 0
                  : _b.executed_at) || null,
            });
          });
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: enrichedCampaigns,
              total: enrichedCampaigns.length,
            }),
          ];
        case 3:
          error_1 = _b.sent();
          console.error("GET /api/retention-analytics/campaigns error:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: false,
                error: "Failed to fetch retention campaigns",
                message: error_1 instanceof Error ? error_1.message : "Unknown error",
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
// =====================================================================================
// CREATE RETENTION CAMPAIGN
// =====================================================================================
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var body,
      validation,
      data,
      supabase,
      _a,
      clinic,
      clinicError,
      _b,
      campaign,
      campaignError,
      metricsError,
      error_2;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 6, , 7]);
          return [4 /*yield*/, request.json()];
        case 1:
          body = _c.sent();
          validation = CreateRetentionCampaignSchema.safeParse(body);
          if (!validation.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Invalid campaign data",
                  details: validation.error.issues,
                },
                { status: 400 },
              ),
            ];
          }
          data = validation.data;
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 2:
          supabase = _c.sent();
          return [
            4 /*yield*/,
            supabase.from("clinics").select("id, name").eq("id", data.clinicId).single(),
          ];
        case 3:
          (_a = _c.sent()), (clinic = _a.data), (clinicError = _a.error);
          if (clinicError || !clinic) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Clinic not found or access denied" },
                { status: 404 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("retention_campaigns")
              .insert({
                clinic_id: data.clinicId,
                name: data.name,
                description: data.description,
                target_segments: data.targetSegments,
                trigger_conditions: data.triggerConditions,
                intervention_strategy: data.interventionStrategy,
                measurement_criteria: data.measurementCriteria,
                is_active: data.isActive,
                status: "draft",
                created_at: new Date().toISOString(),
              })
              .select()
              .single(),
          ];
        case 4:
          (_b = _c.sent()), (campaign = _b.data), (campaignError = _b.error);
          if (campaignError) {
            throw new Error("Failed to create retention campaign: ".concat(campaignError.message));
          }
          return [
            4 /*yield*/,
            supabase.from("retention_campaign_metrics").insert({
              campaign_id: campaign.id,
              clinic_id: data.clinicId,
              sent: 0,
              delivered: 0,
              opened: 0,
              clicked: 0,
              conversions: 0,
              revenue: 0,
              costs: 0,
              created_at: new Date().toISOString(),
            }),
          ];
        case 5:
          metricsError = _c.sent().error;
          if (metricsError) {
            console.error("Failed to initialize campaign metrics:", metricsError);
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: true,
                data: campaign,
                message: "Retention campaign created successfully",
              },
              { status: 201 },
            ),
          ];
        case 6:
          error_2 = _c.sent();
          console.error("POST /api/retention-analytics/campaigns error:", error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: false,
                error: "Failed to create retention campaign",
                message: error_2 instanceof Error ? error_2.message : "Unknown error",
              },
              { status: 500 },
            ),
          ];
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
// =====================================================================================
// UPDATE CAMPAIGN METRICS
// =====================================================================================
function PATCH(request) {
  return __awaiter(this, void 0, void 0, function () {
    var body,
      validation,
      _a,
      campaignId,
      metrics,
      timestamp,
      supabase,
      _b,
      updatedMetrics,
      error,
      error_3;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 4, , 5]);
          return [4 /*yield*/, request.json()];
        case 1:
          body = _c.sent();
          validation = UpdateCampaignMetricsSchema.safeParse(body);
          if (!validation.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Invalid metrics data",
                  details: validation.error.issues,
                },
                { status: 400 },
              ),
            ];
          }
          (_a = validation.data),
            (campaignId = _a.campaignId),
            (metrics = _a.metrics),
            (timestamp = _a.timestamp);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 2:
          supabase = _c.sent();
          return [
            4 /*yield*/,
            supabase
              .from("retention_campaign_metrics")
              .update(
                __assign(__assign({}, metrics), {
                  updated_at: timestamp || new Date().toISOString(),
                }),
              )
              .eq("campaign_id", campaignId)
              .select()
              .single(),
          ];
        case 3:
          (_b = _c.sent()), (updatedMetrics = _b.data), (error = _b.error);
          if (error) {
            throw new Error("Failed to update campaign metrics: ".concat(error.message));
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: updatedMetrics,
              message: "Campaign metrics updated successfully",
            }),
          ];
        case 4:
          error_3 = _c.sent();
          console.error("PATCH /api/retention-analytics/campaigns error:", error_3);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: false,
                error: "Failed to update campaign metrics",
                message: error_3 instanceof Error ? error_3.message : "Unknown error",
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
