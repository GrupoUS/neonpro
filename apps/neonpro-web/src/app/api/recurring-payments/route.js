// NeonPro - Recurring Payments API Routes
// Story 6.1 - Task 2: Recurring Payment System
// Recurring payment processing endpoints
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
exports.PUT = PUT;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var recurring_payment_processor_1 = require("@/lib/payments/recurring/recurring-payment-processor");
var logger_1 = require("@/lib/utils/logger");
var zod_1 = require("zod");
// Validation Schemas
var processPaymentSchema = zod_1.z.object({
  subscription_id: zod_1.z.string().uuid(),
  amount: zod_1.z.number().min(0).optional(),
  force_process: zod_1.z.boolean().default(false),
  metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
var retryPaymentSchema = zod_1.z.object({
  billing_event_id: zod_1.z.string().uuid(),
  retry_attempt: zod_1.z.number().min(1).max(5).optional(),
  metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
var bulkProcessSchema = zod_1.z.object({
  subscription_ids: zod_1.z.array(zod_1.z.string().uuid()).max(100),
  force_process: zod_1.z.boolean().default(false),
  metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
// GET /api/recurring-payments - Get payment processing status
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      userProfile,
      searchParams,
      status_1,
      subscriptionId,
      customerId,
      page,
      limit,
      query,
      _b,
      billingEvents,
      error,
      summaryData,
      summary,
      totalCount,
      error_1;
    return __generator(this, (_c) => {
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
          searchParams = new URL(request.url).searchParams;
          status_1 = searchParams.get("status");
          subscriptionId = searchParams.get("subscription_id");
          customerId = searchParams.get("customer_id");
          page = parseInt(searchParams.get("page") || "1");
          limit = parseInt(searchParams.get("limit") || "20");
          query = supabase
            .from("billing_events")
            .select(
              "\n        *,\n        subscription:subscriptions(\n          id,\n          status,\n          customer:customers(*),\n          plan:subscription_plans(*)\n        ),\n        payment_retry_logs(*)\n      ",
            )
            .order("created_at", { ascending: false })
            .range((page - 1) * limit, page * limit - 1);
          // Apply filters
          if (status_1) {
            query = query.eq("status", status_1);
          }
          if (subscriptionId) {
            query = query.eq("subscription_id", subscriptionId);
          }
          if (customerId) {
            query = query.eq("subscription.customer_id", customerId);
          }
          return [4 /*yield*/, query];
        case 4:
          (_b = _c.sent()), (billingEvents = _b.data), (error = _b.error);
          if (error) {
            logger_1.logger.error("Error fetching billing events:", error);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to fetch billing events" },
                { status: 500 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("billing_events")
              .select("status, amount")
              .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
          ];
        case 5:
          summaryData = _c.sent().data;
          summary = {
            total_events:
              (summaryData === null || summaryData === void 0 ? void 0 : summaryData.length) || 0,
            successful_payments:
              (summaryData === null || summaryData === void 0
                ? void 0
                : summaryData.filter((e) => e.status === "paid").length) || 0,
            failed_payments:
              (summaryData === null || summaryData === void 0
                ? void 0
                : summaryData.filter((e) => e.status === "payment_failed").length) || 0,
            pending_payments:
              (summaryData === null || summaryData === void 0
                ? void 0
                : summaryData.filter((e) => e.status === "pending").length) || 0,
            total_amount:
              (summaryData === null || summaryData === void 0
                ? void 0
                : summaryData.reduce((sum, e) => sum + (e.amount || 0), 0)) || 0,
            success_rate: (
              summaryData === null || summaryData === void 0
                ? void 0
                : summaryData.length
            )
              ? (
                  (summaryData.filter((e) => e.status === "paid").length / summaryData.length) *
                  100
                ).toFixed(2)
              : "0",
          };
          return [
            4 /*yield*/,
            supabase.from("billing_events").select("*", { count: "exact", head: true }),
          ];
        case 6:
          totalCount = _c.sent().count;
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              data: billingEvents,
              summary: summary,
              pagination: {
                page: page,
                limit: limit,
                total: totalCount || 0,
                pages: Math.ceil((totalCount || 0) / limit),
              },
            }),
          ];
        case 7:
          error_1 = _c.sent();
          logger_1.logger.error("Error in GET /api/recurring-payments:", error_1);
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
// POST /api/recurring-payments - Process recurring payment
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      userProfile,
      body,
      validationResult,
      paymentData,
      _b,
      subscription,
      subscriptionError,
      result,
      error_2;
    return __generator(this, (_c) => {
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
          validationResult = processPaymentSchema.safeParse(body);
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
          paymentData = validationResult.data;
          return [
            4 /*yield*/,
            supabase
              .from("subscriptions")
              .select(
                "\n        *,\n        customer:customers(*),\n        plan:subscription_plans(*)\n      ",
              )
              .eq("id", paymentData.subscription_id)
              .single(),
          ];
        case 5:
          (_b = _c.sent()), (subscription = _b.data), (subscriptionError = _b.error);
          if (subscriptionError || !subscription) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Subscription not found" }, { status: 404 }),
            ];
          }
          if (!["active", "trialing"].includes(subscription.status)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Subscription is not active or trialing" },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            recurring_payment_processor_1.recurringPaymentProcessor.processSubscriptionPayment(
              paymentData.subscription_id,
              paymentData.amount,
              paymentData.force_process,
              paymentData.metadata,
            ),
          ];
        case 6:
          result = _c.sent();
          logger_1.logger.info(
            "Recurring payment processed for subscription: "
              .concat(paymentData.subscription_id, " by user: ")
              .concat(user.id),
          );
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                data: result,
                message: "Payment processed successfully",
              },
              { status: 201 },
            ),
          ];
        case 7:
          error_2 = _c.sent();
          logger_1.logger.error("Error in POST /api/recurring-payments:", error_2);
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
// PUT /api/recurring-payments - Bulk process payments
function PUT(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      userProfile,
      body,
      validationResult,
      _b,
      subscription_ids,
      force_process,
      metadata,
      results,
      errors,
      _i,
      subscription_ids_1,
      subscriptionId,
      result,
      error_3,
      error_4;
    return __generator(this, (_c) => {
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
          validationResult = bulkProcessSchema.safeParse(body);
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
          (_b = validationResult.data),
            (subscription_ids = _b.subscription_ids),
            (force_process = _b.force_process),
            (metadata = _b.metadata);
          results = [];
          errors = [];
          (_i = 0), (subscription_ids_1 = subscription_ids);
          _c.label = 5;
        case 5:
          if (!(_i < subscription_ids_1.length)) return [3 /*break*/, 10];
          subscriptionId = subscription_ids_1[_i];
          _c.label = 6;
        case 6:
          _c.trys.push([6, 8, , 9]);
          return [
            4 /*yield*/,
            recurring_payment_processor_1.recurringPaymentProcessor.processSubscriptionPayment(
              subscriptionId,
              undefined,
              force_process,
              metadata,
            ),
          ];
        case 7:
          result = _c.sent();
          results.push({
            subscription_id: subscriptionId,
            result: result,
          });
          return [3 /*break*/, 9];
        case 8:
          error_3 = _c.sent();
          errors.push({
            subscription_id: subscriptionId,
            error: error_3 instanceof Error ? error_3.message : "Unknown error",
          });
          return [3 /*break*/, 9];
        case 9:
          _i++;
          return [3 /*break*/, 5];
        case 10:
          logger_1.logger.info(
            "Bulk payment processing completed: "
              .concat(results.length, " successful, ")
              .concat(errors.length, " errors by user: ")
              .concat(user.id),
          );
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              data: results,
              errors: errors,
              summary: {
                total_processed: subscription_ids.length,
                successful: results.length,
                failed: errors.length,
                success_rate: ((results.length / subscription_ids.length) * 100).toFixed(2) + "%",
              },
              message: "Processed "
                .concat(results.length, " payments, ")
                .concat(errors.length, " errors"),
            }),
          ];
        case 11:
          error_4 = _c.sent();
          logger_1.logger.error("Error in PUT /api/recurring-payments:", error_4);
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
