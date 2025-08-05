"use strict";
// NeonPro - Subscriptions API Routes
// Story 6.1 - Task 2: Recurring Payment System
// Main subscription management endpoints
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
exports.DELETE = DELETE;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var subscription_manager_1 = require("@/lib/payments/recurring/subscription-manager");
var logger_1 = require("@/lib/utils/logger");
var zod_1 = require("zod");
// Validation Schemas
var createSubscriptionSchema = zod_1.z.object({
  customer_id: zod_1.z.string().uuid(),
  plan_id: zod_1.z.string().uuid(),
  payment_method_id: zod_1.z.string().optional(),
  trial_days: zod_1.z.number().min(0).max(365).optional(),
  metadata: zod_1.z.record(zod_1.z.any()).optional(),
  proration_behavior: zod_1.z.enum(["create_prorations", "none"]).optional(),
});
var updateSubscriptionSchema = zod_1.z.object({
  plan_id: zod_1.z.string().uuid().optional(),
  cancel_at_period_end: zod_1.z.boolean().optional(),
  metadata: zod_1.z.record(zod_1.z.any()).optional(),
  proration_behavior: zod_1.z.enum(["create_prorations", "none", "always_invoice"]).optional(),
});
// GET /api/subscriptions - List subscriptions
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      searchParams,
      customerId,
      status_1,
      planId,
      page,
      limit,
      query,
      _b,
      subscriptions,
      error,
      count,
      totalCount,
      error_1;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 5, , 6]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _c.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _c.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          customerId = searchParams.get("customer_id");
          status_1 = searchParams.get("status");
          planId = searchParams.get("plan_id");
          page = parseInt(searchParams.get("page") || "1");
          limit = parseInt(searchParams.get("limit") || "10");
          query = supabase
            .from("subscriptions")
            .select(
              "\n        *,\n        plan:subscription_plans(*),\n        customer:customers(*),\n        usage:subscription_usage(*)\n      ",
            )
            .order("created_at", { ascending: false })
            .range((page - 1) * limit, page * limit - 1);
          // Apply filters
          if (customerId) {
            query = query.eq("customer_id", customerId);
          }
          if (status_1) {
            query = query.eq("status", status_1);
          }
          if (planId) {
            query = query.eq("plan_id", planId);
          }
          return [4 /*yield*/, query];
        case 3:
          (_b = _c.sent()), (subscriptions = _b.data), (error = _b.error), (count = _b.count);
          if (error) {
            logger_1.logger.error("Error fetching subscriptions:", error);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to fetch subscriptions" },
                { status: 500 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("subscriptions").select("*", { count: "exact", head: true }),
          ];
        case 4:
          totalCount = _c.sent().count;
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              data: subscriptions,
              pagination: {
                page: page,
                limit: limit,
                total: totalCount || 0,
                pages: Math.ceil((totalCount || 0) / limit),
              },
            }),
          ];
        case 5:
          error_1 = _c.sent();
          logger_1.logger.error("Error in GET /api/subscriptions:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
// POST /api/subscriptions - Create new subscription
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      body,
      validationResult,
      subscriptionData,
      _b,
      customer,
      customerError,
      existingSubscriptions,
      subscription,
      error_2;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 7, , 8]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _c.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _c.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _c.sent();
          validationResult = createSubscriptionSchema.safeParse(body);
          if (!validationResult.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Invalid request data",
                  details: validationResult.error.errors,
                },
                { status: 400 },
              ),
            ];
          }
          subscriptionData = validationResult.data;
          return [
            4 /*yield*/,
            supabase.from("customers").select("*").eq("id", subscriptionData.customer_id).single(),
          ];
        case 4:
          (_b = _c.sent()), (customer = _b.data), (customerError = _b.error);
          if (customerError || !customer) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Customer not found" }, { status: 404 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("subscriptions")
              .select("*")
              .eq("customer_id", subscriptionData.customer_id)
              .in("status", ["active", "trialing"]),
          ];
        case 5:
          existingSubscriptions = _c.sent().data;
          if (existingSubscriptions && existingSubscriptions.length > 0) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Customer already has an active subscription" },
                { status: 409 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            subscription_manager_1.subscriptionManager.createSubscription(subscriptionData),
          ];
        case 6:
          subscription = _c.sent();
          logger_1.logger.info(
            "Subscription created: "
              .concat(subscription.id, " for customer: ")
              .concat(subscriptionData.customer_id),
          );
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                data: subscription,
                message: "Subscription created successfully",
              },
              { status: 201 },
            ),
          ];
        case 7:
          error_2 = _c.sent();
          logger_1.logger.error("Error in POST /api/subscriptions:", error_2);
          if (error_2 instanceof Error) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: error_2.message }, { status: 400 }),
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
// PUT /api/subscriptions - Bulk update subscriptions (admin only)
function PUT(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      userProfile,
      body,
      subscription_ids,
      updates,
      validationResult,
      results,
      errors,
      _i,
      subscription_ids_1,
      subscriptionId,
      updatedSubscription,
      error_3,
      error_4;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 11, , 12]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _b.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("user_profiles").select("role").eq("user_id", user.id).single(),
          ];
        case 3:
          userProfile = _b.sent().data;
          if (!userProfile || !["admin", "owner"].includes(userProfile.role)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Insufficient permissions" }, { status: 403 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 4:
          body = _b.sent();
          (subscription_ids = body.subscription_ids), (updates = body.updates);
          if (!Array.isArray(subscription_ids) || !updates) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Invalid request data" }, { status: 400 }),
            ];
          }
          validationResult = updateSubscriptionSchema.safeParse(updates);
          if (!validationResult.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Invalid update data",
                  details: validationResult.error.errors,
                },
                { status: 400 },
              ),
            ];
          }
          results = [];
          errors = [];
          (_i = 0), (subscription_ids_1 = subscription_ids);
          _b.label = 5;
        case 5:
          if (!(_i < subscription_ids_1.length)) return [3 /*break*/, 10];
          subscriptionId = subscription_ids_1[_i];
          _b.label = 6;
        case 6:
          _b.trys.push([6, 8, , 9]);
          return [
            4 /*yield*/,
            subscription_manager_1.subscriptionManager.updateSubscription(
              subscriptionId,
              validationResult.data,
            ),
          ];
        case 7:
          updatedSubscription = _b.sent();
          results.push(updatedSubscription);
          return [3 /*break*/, 9];
        case 8:
          error_3 = _b.sent();
          errors.push({
            subscription_id: subscriptionId,
            error: error_3 instanceof Error ? error_3.message : "Unknown error",
          });
          return [3 /*break*/, 9];
        case 9:
          _i++;
          return [3 /*break*/, 5];
        case 10:
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              data: results,
              errors: errors,
              message: "Updated "
                .concat(results.length, " subscriptions, ")
                .concat(errors.length, " errors"),
            }),
          ];
        case 11:
          error_4 = _b.sent();
          logger_1.logger.error("Error in PUT /api/subscriptions:", error_4);
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
// DELETE /api/subscriptions - Bulk cancel subscriptions (admin only)
function DELETE(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      userProfile,
      body,
      subscription_ids,
      _b,
      immediate,
      results,
      errors,
      _i,
      subscription_ids_2,
      subscriptionId,
      canceledSubscription,
      error_5,
      error_6;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 11, , 12]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _c.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _c.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("user_profiles").select("role").eq("user_id", user.id).single(),
          ];
        case 3:
          userProfile = _c.sent().data;
          if (!userProfile || !["admin", "owner"].includes(userProfile.role)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Insufficient permissions" }, { status: 403 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 4:
          body = _c.sent();
          (subscription_ids = body.subscription_ids),
            (_b = body.immediate),
            (immediate = _b === void 0 ? false : _b);
          if (!Array.isArray(subscription_ids)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Invalid request data" }, { status: 400 }),
            ];
          }
          results = [];
          errors = [];
          (_i = 0), (subscription_ids_2 = subscription_ids);
          _c.label = 5;
        case 5:
          if (!(_i < subscription_ids_2.length)) return [3 /*break*/, 10];
          subscriptionId = subscription_ids_2[_i];
          _c.label = 6;
        case 6:
          _c.trys.push([6, 8, , 9]);
          return [
            4 /*yield*/,
            subscription_manager_1.subscriptionManager.cancelSubscription(
              subscriptionId,
              immediate,
            ),
          ];
        case 7:
          canceledSubscription = _c.sent();
          results.push(canceledSubscription);
          return [3 /*break*/, 9];
        case 8:
          error_5 = _c.sent();
          errors.push({
            subscription_id: subscriptionId,
            error: error_5 instanceof Error ? error_5.message : "Unknown error",
          });
          return [3 /*break*/, 9];
        case 9:
          _i++;
          return [3 /*break*/, 5];
        case 10:
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              data: results,
              errors: errors,
              message: "Canceled "
                .concat(results.length, " subscriptions, ")
                .concat(errors.length, " errors"),
            }),
          ];
        case 11:
          error_6 = _c.sent();
          logger_1.logger.error("Error in DELETE /api/subscriptions:", error_6);
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
