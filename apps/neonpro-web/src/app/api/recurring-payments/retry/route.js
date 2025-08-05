"use strict";
// NeonPro - Payment Retry API Routes
// Story 6.1 - Task 2: Recurring Payment System
// Payment retry processing endpoints
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
exports.POST = POST;
exports.PUT = PUT;
exports.GET = GET;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var recurring_payment_processor_1 = require("@/lib/payments/recurring/recurring-payment-processor");
var logger_1 = require("@/lib/utils/logger");
var zod_1 = require("zod");
// Validation Schemas
var retryPaymentSchema = zod_1.z.object({
  billing_event_id: zod_1.z.string().uuid(),
  retry_attempt: zod_1.z.number().min(1).max(5).optional(),
  metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
var bulkRetrySchema = zod_1.z.object({
  billing_event_ids: zod_1.z.array(zod_1.z.string().uuid()).max(50),
  max_retry_attempt: zod_1.z.number().min(1).max(5).default(3),
  metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
// POST /api/recurring-payments/retry - Retry failed payment
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      userProfile,
      body,
      validationResult,
      _b,
      billing_event_id,
      retry_attempt,
      metadata,
      _c,
      billingEvent,
      billingError,
      retryCount,
      maxRetries,
      result,
      error_1;
    var _d, _e, _f;
    return __generator(this, function (_g) {
      switch (_g.label) {
        case 0:
          _g.trys.push([0, 7, , 8]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _g.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _g.sent()), (user = _a.data.user), (authError = _a.error);
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
          userProfile = _g.sent().data;
          if (!userProfile || !["admin", "owner"].includes(userProfile.role)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Insufficient permissions" }, { status: 403 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 4:
          body = _g.sent();
          validationResult = retryPaymentSchema.safeParse(body);
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
            (billing_event_id = _b.billing_event_id),
            (retry_attempt = _b.retry_attempt),
            (metadata = _b.metadata);
          return [
            4 /*yield*/,
            supabase
              .from("billing_events")
              .select(
                "\n        *,\n        subscription:subscriptions(\n          id,\n          status,\n          customer:customers(*),\n          plan:subscription_plans(*)\n        ),\n        payment_retry_logs(*)\n      ",
              )
              .eq("id", billing_event_id)
              .single(),
          ];
        case 5:
          (_c = _g.sent()), (billingEvent = _c.data), (billingError = _c.error);
          if (billingError || !billingEvent) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Billing event not found" }, { status: 404 }),
            ];
          }
          if (billingEvent.status !== "payment_failed") {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Billing event is not in a retryable state" },
                { status: 400 },
              ),
            ];
          }
          retryCount =
            ((_d = billingEvent.payment_retry_logs) === null || _d === void 0
              ? void 0
              : _d.length) || 0;
          maxRetries =
            ((_f =
              (_e = billingEvent.subscription) === null || _e === void 0 ? void 0 : _e.plan) ===
              null || _f === void 0
              ? void 0
              : _f.max_retry_attempts) || 3;
          if (retryCount >= maxRetries) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Maximum retry attempts exceeded" },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            recurring_payment_processor_1.recurringPaymentProcessor.retryFailedPayment(
              billing_event_id,
              retry_attempt || retryCount + 1,
              metadata,
            ),
          ];
        case 6:
          result = _g.sent();
          logger_1.logger.info(
            "Payment retry processed for billing event: "
              .concat(billing_event_id, " by user: ")
              .concat(user.id),
          );
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                data: result,
                message: "Payment retry processed successfully",
              },
              { status: 200 },
            ),
          ];
        case 7:
          error_1 = _g.sent();
          logger_1.logger.error("Error in POST /api/recurring-payments/retry:", error_1);
          if (error_1 instanceof Error) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: error_1.message }, { status: 400 }),
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
// PUT /api/recurring-payments/retry - Bulk retry failed payments
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
      billing_event_ids,
      max_retry_attempt,
      metadata,
      results,
      errors,
      _i,
      billing_event_ids_1,
      billingEventId,
      billingEvent,
      retryCount,
      maxRetries,
      result,
      error_2,
      error_3;
    var _c, _d, _e;
    return __generator(this, function (_f) {
      switch (_f.label) {
        case 0:
          _f.trys.push([0, 12, , 13]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _f.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _f.sent()), (user = _a.data.user), (authError = _a.error);
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
          userProfile = _f.sent().data;
          if (!userProfile || !["admin", "owner"].includes(userProfile.role)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Insufficient permissions" }, { status: 403 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 4:
          body = _f.sent();
          validationResult = bulkRetrySchema.safeParse(body);
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
            (billing_event_ids = _b.billing_event_ids),
            (max_retry_attempt = _b.max_retry_attempt),
            (metadata = _b.metadata);
          results = [];
          errors = [];
          (_i = 0), (billing_event_ids_1 = billing_event_ids);
          _f.label = 5;
        case 5:
          if (!(_i < billing_event_ids_1.length)) return [3 /*break*/, 11];
          billingEventId = billing_event_ids_1[_i];
          _f.label = 6;
        case 6:
          _f.trys.push([6, 9, , 10]);
          return [
            4 /*yield*/,
            supabase
              .from("billing_events")
              .select(
                "\n            *,\n            subscription:subscriptions(\n              id,\n              plan:subscription_plans(max_retry_attempts)\n            ),\n            payment_retry_logs(*)\n          ",
              )
              .eq("id", billingEventId)
              .single(),
          ];
        case 7:
          billingEvent = _f.sent().data;
          if (!billingEvent || billingEvent.status !== "payment_failed") {
            errors.push({
              billing_event_id: billingEventId,
              error: "Billing event not found or not retryable",
            });
            return [3 /*break*/, 10];
          }
          retryCount =
            ((_c = billingEvent.payment_retry_logs) === null || _c === void 0
              ? void 0
              : _c.length) || 0;
          maxRetries =
            ((_e =
              (_d = billingEvent.subscription) === null || _d === void 0 ? void 0 : _d.plan) ===
              null || _e === void 0
              ? void 0
              : _e.max_retry_attempts) || 3;
          if (retryCount >= Math.min(maxRetries, max_retry_attempt)) {
            errors.push({
              billing_event_id: billingEventId,
              error: "Maximum retry attempts exceeded",
            });
            return [3 /*break*/, 10];
          }
          return [
            4 /*yield*/,
            recurring_payment_processor_1.recurringPaymentProcessor.retryFailedPayment(
              billingEventId,
              retryCount + 1,
              metadata,
            ),
          ];
        case 8:
          result = _f.sent();
          results.push({
            billing_event_id: billingEventId,
            result: result,
          });
          return [3 /*break*/, 10];
        case 9:
          error_2 = _f.sent();
          errors.push({
            billing_event_id: billingEventId,
            error: error_2 instanceof Error ? error_2.message : "Unknown error",
          });
          return [3 /*break*/, 10];
        case 10:
          _i++;
          return [3 /*break*/, 5];
        case 11:
          logger_1.logger.info(
            "Bulk payment retry completed: "
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
                total_processed: billing_event_ids.length,
                successful: results.length,
                failed: errors.length,
                success_rate: ((results.length / billing_event_ids.length) * 100).toFixed(2) + "%",
              },
              message: "Processed "
                .concat(results.length, " retries, ")
                .concat(errors.length, " errors"),
            }),
          ];
        case 12:
          error_3 = _f.sent();
          logger_1.logger.error("Error in PUT /api/recurring-payments/retry:", error_3);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 13:
          return [2 /*return*/];
      }
    });
  });
}
// GET /api/recurring-payments/retry - Get retry statistics
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      userProfile,
      searchParams,
      days,
      startDate,
      retryLogs,
      totalRetries,
      successfulRetries,
      failedRetries,
      pendingRetries,
      retryAttemptStats,
      retryablePayments,
      eligibleForRetry,
      error_4;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 6, , 7]);
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
          searchParams = new URL(request.url).searchParams;
          days = parseInt(searchParams.get("days") || "30");
          startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
          return [
            4 /*yield*/,
            supabase
              .from("payment_retry_logs")
              .select(
                "\n        *,\n        billing_event:billing_events(\n          id,\n          amount,\n          status,\n          subscription:subscriptions(\n            id,\n            customer:customers(name, email)\n          )\n        )\n      ",
              )
              .gte("created_at", startDate)
              .order("created_at", { ascending: false }),
          ];
        case 4:
          retryLogs = _b.sent().data;
          totalRetries =
            (retryLogs === null || retryLogs === void 0 ? void 0 : retryLogs.length) || 0;
          successfulRetries =
            (retryLogs === null || retryLogs === void 0
              ? void 0
              : retryLogs.filter(function (log) {
                  return log.status === "success";
                }).length) || 0;
          failedRetries =
            (retryLogs === null || retryLogs === void 0
              ? void 0
              : retryLogs.filter(function (log) {
                  return log.status === "failed";
                }).length) || 0;
          pendingRetries =
            (retryLogs === null || retryLogs === void 0
              ? void 0
              : retryLogs.filter(function (log) {
                  return log.status === "pending";
                }).length) || 0;
          retryAttemptStats =
            (retryLogs === null || retryLogs === void 0
              ? void 0
              : retryLogs.reduce(function (acc, log) {
                  var attempt = log.retry_attempt;
                  if (!acc[attempt]) {
                    acc[attempt] = { total: 0, successful: 0, failed: 0 };
                  }
                  acc[attempt].total++;
                  if (log.status === "success") acc[attempt].successful++;
                  if (log.status === "failed") acc[attempt].failed++;
                  return acc;
                }, {})) || {};
          return [
            4 /*yield*/,
            supabase
              .from("billing_events")
              .select(
                "\n        id,\n        amount,\n        created_at,\n        subscription:subscriptions(\n          id,\n          customer:customers(name, email),\n          plan:subscription_plans(max_retry_attempts)\n        ),\n        payment_retry_logs(retry_attempt)\n      ",
              )
              .eq("status", "payment_failed")
              .gte("created_at", startDate),
          ];
        case 5:
          retryablePayments = _b.sent().data;
          eligibleForRetry =
            (retryablePayments === null || retryablePayments === void 0
              ? void 0
              : retryablePayments.filter(function (payment) {
                  var _a, _b, _c;
                  var retryCount =
                    ((_a = payment.payment_retry_logs) === null || _a === void 0
                      ? void 0
                      : _a.length) || 0;
                  var maxRetries =
                    ((_c =
                      (_b = payment.subscription) === null || _b === void 0 ? void 0 : _b.plan) ===
                      null || _c === void 0
                      ? void 0
                      : _c.max_retry_attempts) || 3;
                  return retryCount < maxRetries;
                })) || [];
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              data: {
                retry_statistics: {
                  total_retries: totalRetries,
                  successful_retries: successfulRetries,
                  failed_retries: failedRetries,
                  pending_retries: pendingRetries,
                  success_rate:
                    totalRetries > 0
                      ? ((successfulRetries / totalRetries) * 100).toFixed(2) + "%"
                      : "0%",
                },
                retry_attempt_breakdown: retryAttemptStats,
                eligible_for_retry: {
                  count: eligibleForRetry.length,
                  total_amount: eligibleForRetry.reduce(function (sum, payment) {
                    return sum + (payment.amount || 0);
                  }, 0),
                  payments: eligibleForRetry.slice(0, 20), // Limit to first 20 for performance
                },
                recent_retry_logs:
                  retryLogs === null || retryLogs === void 0 ? void 0 : retryLogs.slice(0, 50), // Limit to recent 50 logs
              },
              message: "Retry statistics retrieved successfully",
            }),
          ];
        case 6:
          error_4 = _b.sent();
          logger_1.logger.error("Error in GET /api/recurring-payments/retry:", error_4);
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
