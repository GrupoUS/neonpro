"use strict";
// NeonPro - Individual Subscription API Routes
// Story 6.1 - Task 2: Recurring Payment System
// Individual subscription management endpoints
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
exports.DELETE = DELETE;
var server_1 = require("next/server");
var auth_helpers_nextjs_1 = require("@supabase/auth-helpers-nextjs");
var headers_1 = require("next/headers");
var subscription_manager_1 = require("@/lib/payments/recurring/subscription-manager");
var logger_1 = require("@/lib/utils/logger");
var zod_1 = require("zod");
// Validation Schemas
var updateSubscriptionSchema = zod_1.z.object({
  plan_id: zod_1.z.string().uuid().optional(),
  cancel_at_period_end: zod_1.z.boolean().optional(),
  metadata: zod_1.z.record(zod_1.z.any()).optional(),
  proration_behavior: zod_1.z.enum(["create_prorations", "none", "always_invoice"]).optional(),
});
var pauseSubscriptionSchema = zod_1.z.object({
  pause_collection: zod_1.z.object({
    behavior: zod_1.z.enum(["keep_as_draft", "mark_uncollectible", "void"]),
    resumes_at: zod_1.z.string().datetime().optional(),
  }),
});
// GET /api/subscriptions/[id] - Get subscription details
function GET(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var supabase,
      _c,
      user,
      authError,
      subscriptionId,
      _d,
      subscription,
      error,
      userProfile,
      isAdmin,
      isCustomerOwner,
      isSameOrganization,
      error_1;
    var params = _b.params;
    return __generator(this, function (_e) {
      switch (_e.label) {
        case 0:
          _e.trys.push([0, 4, , 5]);
          supabase = (0, auth_helpers_nextjs_1.createRouteHandlerClient)({
            cookies: headers_1.cookies,
          });
          return [4 /*yield*/, supabase.auth.getUser()];
        case 1:
          (_c = _e.sent()), (user = _c.data.user), (authError = _c.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          subscriptionId = params.id;
          if (!subscriptionId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Subscription ID is required" }, { status: 400 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("subscriptions")
              .select(
                "\n        *,\n        plan:subscription_plans(*),\n        customer:customers(*),\n        usage:subscription_usage(*),\n        billing_events:billing_events(\n          *,\n          payment_retry_logs(*)\n        )\n      ",
              )
              .eq("id", subscriptionId)
              .single(),
          ];
        case 2:
          (_d = _e.sent()), (subscription = _d.data), (error = _d.error);
          if (error || !subscription) {
            logger_1.logger.error(
              "Error fetching subscription ".concat(subscriptionId, ":"),
              error,
            );
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Subscription not found" }, { status: 404 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("user_profiles")
              .select("role, organization_id")
              .eq("user_id", user.id)
              .single(),
          ];
        case 3:
          userProfile = _e.sent().data;
          isAdmin = userProfile && ["admin", "owner"].includes(userProfile.role);
          isCustomerOwner = subscription.customer.user_id === user.id;
          isSameOrganization =
            subscription.customer.organization_id ===
            (userProfile === null || userProfile === void 0 ? void 0 : userProfile.organization_id);
          if (!isAdmin && !isCustomerOwner && !isSameOrganization) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Insufficient permissions" }, { status: 403 }),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              data: subscription,
            }),
          ];
        case 4:
          error_1 = _e.sent();
          logger_1.logger.error("Error in GET /api/subscriptions/".concat(params.id, ":"), error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
// PUT /api/subscriptions/[id] - Update subscription
function PUT(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var supabase,
      _c,
      user,
      authError,
      subscriptionId,
      body,
      validationResult,
      _d,
      subscription,
      fetchError,
      userProfile,
      isAdmin,
      isCustomerOwner,
      isSameOrganization,
      updatedSubscription,
      error_2;
    var params = _b.params;
    return __generator(this, function (_e) {
      switch (_e.label) {
        case 0:
          _e.trys.push([0, 6, , 7]);
          supabase = (0, auth_helpers_nextjs_1.createRouteHandlerClient)({
            cookies: headers_1.cookies,
          });
          return [4 /*yield*/, supabase.auth.getUser()];
        case 1:
          (_c = _e.sent()), (user = _c.data.user), (authError = _c.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          subscriptionId = params.id;
          return [4 /*yield*/, request.json()];
        case 2:
          body = _e.sent();
          validationResult = updateSubscriptionSchema.safeParse(body);
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
          return [
            4 /*yield*/,
            supabase
              .from("subscriptions")
              .select("\n        *,\n        customer:customers(*)\n      ")
              .eq("id", subscriptionId)
              .single(),
          ];
        case 3:
          (_d = _e.sent()), (subscription = _d.data), (fetchError = _d.error);
          if (fetchError || !subscription) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Subscription not found" }, { status: 404 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("user_profiles")
              .select("role, organization_id")
              .eq("user_id", user.id)
              .single(),
          ];
        case 4:
          userProfile = _e.sent().data;
          isAdmin = userProfile && ["admin", "owner"].includes(userProfile.role);
          isCustomerOwner = subscription.customer.user_id === user.id;
          isSameOrganization =
            subscription.customer.organization_id ===
            (userProfile === null || userProfile === void 0 ? void 0 : userProfile.organization_id);
          if (!isAdmin && !isCustomerOwner && !isSameOrganization) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Insufficient permissions" }, { status: 403 }),
            ];
          }
          return [
            4 /*yield*/,
            subscription_manager_1.subscriptionManager.updateSubscription(
              subscriptionId,
              validationResult.data,
            ),
          ];
        case 5:
          updatedSubscription = _e.sent();
          logger_1.logger.info(
            "Subscription updated: ".concat(subscriptionId, " by user: ").concat(user.id),
          );
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              data: updatedSubscription,
              message: "Subscription updated successfully",
            }),
          ];
        case 6:
          error_2 = _e.sent();
          logger_1.logger.error("Error in PUT /api/subscriptions/".concat(params.id, ":"), error_2);
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
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
// DELETE /api/subscriptions/[id] - Cancel subscription
function DELETE(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var supabase,
      _c,
      user,
      authError,
      subscriptionId,
      searchParams,
      immediate,
      _d,
      subscription,
      fetchError,
      userProfile,
      isAdmin,
      isCustomerOwner,
      isSameOrganization,
      canceledSubscription,
      error_3;
    var params = _b.params;
    return __generator(this, function (_e) {
      switch (_e.label) {
        case 0:
          _e.trys.push([0, 5, , 6]);
          supabase = (0, auth_helpers_nextjs_1.createRouteHandlerClient)({
            cookies: headers_1.cookies,
          });
          return [4 /*yield*/, supabase.auth.getUser()];
        case 1:
          (_c = _e.sent()), (user = _c.data.user), (authError = _c.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          subscriptionId = params.id;
          searchParams = new URL(request.url).searchParams;
          immediate = searchParams.get("immediate") === "true";
          return [
            4 /*yield*/,
            supabase
              .from("subscriptions")
              .select("\n        *,\n        customer:customers(*)\n      ")
              .eq("id", subscriptionId)
              .single(),
          ];
        case 2:
          (_d = _e.sent()), (subscription = _d.data), (fetchError = _d.error);
          if (fetchError || !subscription) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Subscription not found" }, { status: 404 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("user_profiles")
              .select("role, organization_id")
              .eq("user_id", user.id)
              .single(),
          ];
        case 3:
          userProfile = _e.sent().data;
          isAdmin = userProfile && ["admin", "owner"].includes(userProfile.role);
          isCustomerOwner = subscription.customer.user_id === user.id;
          isSameOrganization =
            subscription.customer.organization_id ===
            (userProfile === null || userProfile === void 0 ? void 0 : userProfile.organization_id);
          if (!isAdmin && !isCustomerOwner && !isSameOrganization) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Insufficient permissions" }, { status: 403 }),
            ];
          }
          return [
            4 /*yield*/,
            subscription_manager_1.subscriptionManager.cancelSubscription(
              subscriptionId,
              immediate,
            ),
          ];
        case 4:
          canceledSubscription = _e.sent();
          logger_1.logger.info(
            "Subscription canceled: "
              .concat(subscriptionId, " by user: ")
              .concat(user.id, ", immediate: ")
              .concat(immediate),
          );
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              data: canceledSubscription,
              message: immediate
                ? "Subscription canceled immediately"
                : "Subscription will be canceled at the end of the current period",
            }),
          ];
        case 5:
          error_3 = _e.sent();
          logger_1.logger.error(
            "Error in DELETE /api/subscriptions/".concat(params.id, ":"),
            error_3,
          );
          if (error_3 instanceof Error) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: error_3.message }, { status: 400 }),
            ];
          }
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
