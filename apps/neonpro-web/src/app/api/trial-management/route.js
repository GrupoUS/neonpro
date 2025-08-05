"use strict";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
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
exports.PUT = PUT;
var server_1 = require("next/server");
var supabase_js_1 = require("@supabase/supabase-js");
var zod_1 = require("zod");
// Initialize Supabase client
var supabase = (0, supabase_js_1.createClient)(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);
// Validation schemas
var trialCreationSchema = zod_1.z.object({
  user_id: zod_1.z.string(),
  trial_type: zod_1.z.enum(["free", "pro", "enterprise"]),
  duration_days: zod_1.z.number().min(1).max(365).default(14),
  features: zod_1.z.array(zod_1.z.string()).optional(),
  campaign_id: zod_1.z.string().optional(),
  utm_source: zod_1.z.string().optional(),
  utm_medium: zod_1.z.string().optional(),
  utm_campaign: zod_1.z.string().optional(),
});
var trialUpdateSchema = zod_1.z.object({
  trial_id: zod_1.z.string(),
  status: zod_1.z.enum(["active", "expired", "converted", "cancelled"]).optional(),
  extended_days: zod_1.z.number().min(0).max(90).optional(),
  conversion_data: zod_1.z
    .object({
      subscription_tier: zod_1.z.string(),
      payment_method: zod_1.z.string(),
      amount: zod_1.z.number(),
    })
    .optional(),
});
var campaignSchema = zod_1.z.object({
  name: zod_1.z.string().min(1),
  description: zod_1.z.string().optional(),
  trial_type: zod_1.z.enum(["free", "pro", "enterprise"]),
  duration_days: zod_1.z.number().min(1).max(365),
  target_audience: zod_1.z
    .object({
      demographics: zod_1.z.record(zod_1.z.any()).optional(),
      interests: zod_1.z.array(zod_1.z.string()).optional(),
      behavior: zod_1.z.record(zod_1.z.any()).optional(),
    })
    .optional(),
  ai_optimization: zod_1.z
    .object({
      enabled: zod_1.z.boolean().default(true),
      optimization_goals: zod_1.z
        .array(zod_1.z.enum(["conversion_rate", "trial_length", "engagement"]))
        .optional(),
      ml_model_version: zod_1.z.string().optional(),
    })
    .optional(),
  start_date: zod_1.z.string(),
  end_date: zod_1.z.string().optional(),
  budget: zod_1.z.number().min(0).optional(),
});
/**
 * GET /api/trial-management - Retrieve trial data
 */
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var userId, userRole, searchParams, action, targetUserId, status_1, campaignId, _a, error_1;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 11, , 12]);
          userId = request.headers.get("x-user-id");
          userRole = request.headers.get("x-user-role");
          if (!userId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Authentication required" }, { status: 401 }),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          action = searchParams.get("action") || "trials";
          targetUserId = searchParams.get("userId");
          status_1 = searchParams.get("status");
          campaignId = searchParams.get("campaignId");
          // Permission check - users can only see their own trials unless admin
          if (targetUserId && targetUserId !== userId && userRole !== "admin") {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Insufficient permissions" }, { status: 403 }),
            ];
          }
          _a = action;
          switch (_a) {
            case "trials":
              return [3 /*break*/, 1];
            case "campaigns":
              return [3 /*break*/, 3];
            case "analytics":
              return [3 /*break*/, 5];
            case "ai-insights":
              return [3 /*break*/, 7];
          }
          return [3 /*break*/, 9];
        case 1:
          return [4 /*yield*/, getTrials(targetUserId || userId, status_1, campaignId)];
        case 2:
          return [2 /*return*/, _b.sent()];
        case 3:
          if (userRole !== "admin") {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Admin access required" }, { status: 403 }),
            ];
          }
          return [4 /*yield*/, getCampaigns()];
        case 4:
          return [2 /*return*/, _b.sent()];
        case 5:
          return [4 /*yield*/, getTrialAnalytics(targetUserId || userId, userRole)];
        case 6:
          return [2 /*return*/, _b.sent()];
        case 7:
          if (userRole !== "admin") {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Admin access required" }, { status: 403 }),
            ];
          }
          return [4 /*yield*/, getAIInsights()];
        case 8:
          return [2 /*return*/, _b.sent()];
        case 9:
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Invalid action parameter" }, { status: 400 }),
          ];
        case 10:
          return [3 /*break*/, 12];
        case 11:
          error_1 = _b.sent();
          console.error("Trial management GET error:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 12:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * POST /api/trial-management - Create trials or campaigns
 */
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var userId, userRole, body, action, _a, error_2;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 10, , 11]);
          userId = request.headers.get("x-user-id");
          userRole = request.headers.get("x-user-role");
          if (!userId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Authentication required" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 1:
          body = _b.sent();
          action = body.action || "create-trial";
          _a = action;
          switch (_a) {
            case "create-trial":
              return [3 /*break*/, 2];
            case "create-campaign":
              return [3 /*break*/, 4];
            case "ai-optimize":
              return [3 /*break*/, 6];
          }
          return [3 /*break*/, 8];
        case 2:
          return [4 /*yield*/, createTrial(body, userId, userRole)];
        case 3:
          return [2 /*return*/, _b.sent()];
        case 4:
          if (userRole !== "admin") {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Admin access required" }, { status: 403 }),
            ];
          }
          return [4 /*yield*/, createCampaign(body, userId)];
        case 5:
          return [2 /*return*/, _b.sent()];
        case 6:
          if (userRole !== "admin") {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Admin access required" }, { status: 403 }),
            ];
          }
          return [4 /*yield*/, triggerAIOptimization(body, userId)];
        case 7:
          return [2 /*return*/, _b.sent()];
        case 8:
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Invalid action parameter" }, { status: 400 }),
          ];
        case 9:
          return [3 /*break*/, 11];
        case 10:
          error_2 = _b.sent();
          console.error("Trial management POST error:", error_2);
          if (error_2 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Invalid request data",
                  details: error_2.errors,
                },
                { status: 400 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 11:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * PUT /api/trial-management - Update trials
 */
function PUT(request) {
  return __awaiter(this, void 0, void 0, function () {
    var userId,
      userRole,
      body,
      validatedUpdate,
      _a,
      trial,
      trialError,
      updateData,
      currentTrial,
      newEndDate,
      _b,
      data,
      error,
      error_3;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 7, , 8]);
          userId = request.headers.get("x-user-id");
          userRole = request.headers.get("x-user-role");
          if (!userId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Authentication required" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 1:
          body = _c.sent();
          validatedUpdate = trialUpdateSchema.parse(body);
          return [
            4 /*yield*/,
            supabase.from("trials").select("user_id").eq("id", validatedUpdate.trial_id).single(),
          ];
        case 2:
          (_a = _c.sent()), (trial = _a.data), (trialError = _a.error);
          if (trialError || !trial) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Trial not found" }, { status: 404 }),
            ];
          }
          if (trial.user_id !== userId && userRole !== "admin") {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Insufficient permissions" }, { status: 403 }),
            ];
          }
          updateData = {};
          if (validatedUpdate.status) {
            updateData.status = validatedUpdate.status;
            updateData.updated_at = new Date().toISOString();
            if (validatedUpdate.status === "converted" && validatedUpdate.conversion_data) {
              updateData.conversion_data = validatedUpdate.conversion_data;
              updateData.converted_at = new Date().toISOString();
            }
          }
          if (!validatedUpdate.extended_days) return [3 /*break*/, 4];
          return [
            4 /*yield*/,
            supabase.from("trials").select("end_date").eq("id", validatedUpdate.trial_id).single(),
          ];
        case 3:
          currentTrial = _c.sent().data;
          if (currentTrial) {
            newEndDate = new Date(currentTrial.end_date);
            newEndDate.setDate(newEndDate.getDate() + validatedUpdate.extended_days);
            updateData.end_date = newEndDate.toISOString();
            updateData.extended_days = validatedUpdate.extended_days;
          }
          _c.label = 4;
        case 4:
          return [
            4 /*yield*/,
            supabase
              .from("trials")
              .update(updateData)
              .eq("id", validatedUpdate.trial_id)
              .select()
              .single(),
          ];
        case 5:
          (_b = _c.sent()), (data = _b.data), (error = _b.error);
          if (error) {
            console.error("Trial update error:", error);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Failed to update trial" }, { status: 500 }),
            ];
          }
          // Track analytics event
          return [
            4 /*yield*/,
            supabase.from("analytics_events").insert({
              event_type: "trial_updated",
              user_id: userId,
              properties: {
                trial_id: validatedUpdate.trial_id,
                updates: updateData,
              },
            }),
          ];
        case 6:
          // Track analytics event
          _c.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: data,
              message: "Trial updated successfully",
            }),
          ];
        case 7:
          error_3 = _c.sent();
          console.error("Trial update API error:", error_3);
          if (error_3 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Invalid update data",
                  details: error_3.errors,
                },
                { status: 400 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 8:
          return [2 /*return*/];
      }
    });
  });
}
// Helper functions
function getTrials(userId, status, campaignId) {
  return __awaiter(this, void 0, void 0, function () {
    var query, _a, data, error;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          query = supabase
            .from("trials")
            .select(
              "\n      *,\n      campaigns(name, description),\n      users(email, created_at)\n    ",
            )
            .eq("user_id", userId)
            .order("created_at", { ascending: false });
          if (status) {
            query = query.eq("status", status);
          }
          if (campaignId) {
            query = query.eq("campaign_id", campaignId);
          }
          return [4 /*yield*/, query];
        case 1:
          (_a = _b.sent()), (data = _a.data), (error = _a.error);
          if (error) throw error;
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: data,
              count: (data === null || data === void 0 ? void 0 : data.length) || 0,
            }),
          ];
      }
    });
  });
}
function getCampaigns() {
  return __awaiter(this, void 0, void 0, function () {
    var _a, data, error;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          return [
            4 /*yield*/,
            supabase
              .from("campaigns")
              .select("\n      *,\n      trials(count)\n    ")
              .order("created_at", { ascending: false }),
          ];
        case 1:
          (_a = _b.sent()), (data = _a.data), (error = _a.error);
          if (error) throw error;
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: data,
            }),
          ];
      }
    });
  });
}
function getTrialAnalytics(userId, userRole) {
  return __awaiter(this, void 0, void 0, function () {
    var _a, data, error;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          return [
            4 /*yield*/,
            supabase.rpc("get_trial_analytics_detailed", {
              user_id: userRole === "admin" ? null : userId,
            }),
          ];
        case 1:
          (_a = _b.sent()), (data = _a.data), (error = _a.error);
          if (error) throw error;
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: data,
            }),
          ];
      }
    });
  });
}
function getAIInsights() {
  return __awaiter(this, void 0, void 0, function () {
    var _a, data, error;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          return [4 /*yield*/, supabase.rpc("get_ai_trial_insights")];
        case 1:
          (_a = _b.sent()), (data = _a.data), (error = _a.error);
          if (error) throw error;
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: data,
            }),
          ];
      }
    });
  });
}
function createTrial(body, userId, userRole) {
  return __awaiter(this, void 0, void 0, function () {
    var validatedTrial, existingTrial, startDate, endDate, _a, data, error;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          validatedTrial = trialCreationSchema.parse(body);
          // Users can only create trials for themselves unless admin
          if (validatedTrial.user_id !== userId && userRole !== "admin") {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Cannot create trial for other users" },
                { status: 403 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("trials")
              .select("id")
              .eq("user_id", validatedTrial.user_id)
              .eq("status", "active")
              .single(),
          ];
        case 1:
          existingTrial = _b.sent().data;
          if (existingTrial) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "User already has an active trial" },
                { status: 409 },
              ),
            ];
          }
          startDate = new Date();
          endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + validatedTrial.duration_days);
          return [
            4 /*yield*/,
            supabase
              .from("trials")
              .insert({
                user_id: validatedTrial.user_id,
                trial_type: validatedTrial.trial_type,
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
                duration_days: validatedTrial.duration_days,
                features: validatedTrial.features || [],
                campaign_id: validatedTrial.campaign_id,
                utm_data: {
                  source: validatedTrial.utm_source,
                  medium: validatedTrial.utm_medium,
                  campaign: validatedTrial.utm_campaign,
                },
                status: "active",
                created_by: userId,
              })
              .select()
              .single(),
          ];
        case 2:
          (_a = _b.sent()), (data = _a.data), (error = _a.error);
          if (error) {
            console.error("Trial creation error:", error);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Failed to create trial" }, { status: 500 }),
            ];
          }
          // Track analytics event
          return [
            4 /*yield*/,
            supabase.from("analytics_events").insert({
              event_type: "trial_created",
              user_id: validatedTrial.user_id,
              properties: {
                trial_id: data.id,
                trial_type: validatedTrial.trial_type,
                duration_days: validatedTrial.duration_days,
                campaign_id: validatedTrial.campaign_id,
              },
            }),
          ];
        case 3:
          // Track analytics event
          _b.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: data,
              message: "Trial created successfully",
            }),
          ];
      }
    });
  });
}
function createCampaign(body, userId) {
  return __awaiter(this, void 0, void 0, function () {
    var validatedCampaign, _a, data, error;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          validatedCampaign = campaignSchema.parse(body);
          return [
            4 /*yield*/,
            supabase
              .from("campaigns")
              .insert(
                __assign(__assign({}, validatedCampaign), { created_by: userId, status: "active" }),
              )
              .select()
              .single(),
          ];
        case 1:
          (_a = _b.sent()), (data = _a.data), (error = _a.error);
          if (error) {
            console.error("Campaign creation error:", error);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Failed to create campaign" }, { status: 500 }),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: data,
              message: "Campaign created successfully",
            }),
          ];
      }
    });
  });
}
function triggerAIOptimization(body, userId) {
  return __awaiter(this, void 0, void 0, function () {
    var campaign_id, optimization_type, _a, data, error;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          (campaign_id = body.campaign_id), (optimization_type = body.optimization_type);
          return [
            4 /*yield*/,
            supabase
              .from("ai_optimization_jobs")
              .insert({
                campaign_id: campaign_id,
                optimization_type: optimization_type,
                status: "queued",
                created_by: userId,
              })
              .select()
              .single(),
          ];
        case 1:
          (_a = _b.sent()), (data = _a.data), (error = _a.error);
          if (error) {
            console.error("AI optimization trigger error:", error);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to trigger AI optimization" },
                { status: 500 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: data,
              message: "AI optimization job queued successfully",
            }),
          ];
      }
    });
  });
}
