"use strict";
// NeonPro - Recurring Payment Processor
// Story 6.1 - Task 2: Recurring Payment System
// Automated billing and payment retry logic
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
exports.recurringPaymentProcessor = exports.RecurringPaymentProcessor = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var stripe_1 = require("stripe");
var date_fns_1 = require("date-fns");
var logger_1 = require("@/lib/utils/logger");
var notification_service_1 = require("@/lib/notifications/notification-service");
var subscription_manager_1 = require("./subscription-manager");
var payment_processor_1 = require("../payment-processor");
// Main Recurring Payment Processor Class
var RecurringPaymentProcessor = /** @class */ (function () {
  function RecurringPaymentProcessor(config) {
    this.supabase = (0, supabase_js_1.createClient)(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
    this.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });
    this.paymentProcessor = new payment_processor_1.PaymentProcessor();
    this.config = __assign(
      {
        max_retry_attempts: 4,
        retry_intervals_hours: [24, 72, 168, 336],
        dunning_management: {
          grace_period_days: 3,
          suspension_after_days: 7,
          cancellation_after_days: 30,
        },
        notification_settings: {
          payment_failed: true,
          payment_retry: true,
          payment_success: true,
          subscription_suspended: true,
          subscription_canceled: true,
        },
      },
      config,
    );
  }
  // Main Billing Cycle Processing
  RecurringPaymentProcessor.prototype.processBillingCycle = function () {
    return __awaiter(this, void 0, void 0, function () {
      var result,
        dueSubscriptions,
        _i,
        dueSubscriptions_1,
        subscription,
        paymentResult,
        error_1,
        errorMessage,
        error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            logger_1.logger.info("Starting billing cycle processing...");
            result = {
              processed_subscriptions: 0,
              successful_payments: 0,
              failed_payments: 0,
              retry_scheduled: 0,
              errors: [],
            };
            _a.label = 1;
          case 1:
            _a.trys.push([1, 17, , 18]);
            return [4 /*yield*/, this.getSubscriptionsDueForBilling()];
          case 2:
            dueSubscriptions = _a.sent();
            result.processed_subscriptions = dueSubscriptions.length;
            logger_1.logger.info(
              "Found ".concat(dueSubscriptions.length, " subscriptions due for billing"),
            );
            (_i = 0), (dueSubscriptions_1 = dueSubscriptions);
            _a.label = 3;
          case 3:
            if (!(_i < dueSubscriptions_1.length)) return [3 /*break*/, 14];
            subscription = dueSubscriptions_1[_i];
            _a.label = 4;
          case 4:
            _a.trys.push([4, 12, , 13]);
            return [4 /*yield*/, this.processSubscriptionPayment(subscription.id)];
          case 5:
            paymentResult = _a.sent();
            if (!paymentResult.success) return [3 /*break*/, 7];
            result.successful_payments++;
            return [4 /*yield*/, this.handleSuccessfulPayment(subscription.id, paymentResult)];
          case 6:
            _a.sent();
            return [3 /*break*/, 11];
          case 7:
            result.failed_payments++;
            if (!paymentResult.requires_retry) return [3 /*break*/, 9];
            result.retry_scheduled++;
            return [4 /*yield*/, this.schedulePaymentRetry(subscription.id, paymentResult)];
          case 8:
            _a.sent();
            return [3 /*break*/, 11];
          case 9:
            return [4 /*yield*/, this.handleFinalPaymentFailure(subscription.id, paymentResult)];
          case 10:
            _a.sent();
            _a.label = 11;
          case 11:
            return [3 /*break*/, 13];
          case 12:
            error_1 = _a.sent();
            errorMessage = "Error processing subscription "
              .concat(subscription.id, ": ")
              .concat(error_1);
            logger_1.logger.error(errorMessage);
            result.errors.push(errorMessage);
            return [3 /*break*/, 13];
          case 13:
            _i++;
            return [3 /*break*/, 3];
          case 14:
            // Process scheduled retries
            return [4 /*yield*/, this.processScheduledRetries(result)];
          case 15:
            // Process scheduled retries
            _a.sent();
            // Update subscription statuses based on payment failures
            return [4 /*yield*/, this.updateSubscriptionStatuses()];
          case 16:
            // Update subscription statuses based on payment failures
            _a.sent();
            logger_1.logger.info("Billing cycle processing completed", result);
            return [2 /*return*/, result];
          case 17:
            error_2 = _a.sent();
            logger_1.logger.error("Error in billing cycle processing:", error_2);
            result.errors.push("Billing cycle error: ".concat(error_2));
            return [2 /*return*/, result];
          case 18:
            return [2 /*return*/];
        }
      });
    });
  };
  // Process individual subscription payment
  RecurringPaymentProcessor.prototype.processSubscriptionPayment = function (subscriptionId) {
    return __awaiter(this, void 0, void 0, function () {
      var subscription, plan, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 6, , 7]);
            return [
              4 /*yield*/,
              subscription_manager_1.subscriptionManager.getSubscription(subscriptionId),
            ];
          case 1:
            subscription = _a.sent();
            if (!subscription) {
              throw new Error("Subscription not found");
            }
            return [
              4 /*yield*/,
              subscription_manager_1.subscriptionManager.getSubscriptionPlan(subscription.plan_id),
            ];
          case 2:
            plan = _a.sent();
            if (!plan) {
              throw new Error("Subscription plan not found");
            }
            if (!!subscription.stripe_subscription_id) return [3 /*break*/, 4];
            return [4 /*yield*/, this.processManualPayment(subscription, plan)];
          case 3:
            return [2 /*return*/, _a.sent()];
          case 4:
            return [4 /*yield*/, this.processStripePayment(subscription, plan)];
          case 5:
            // Process Stripe payment
            return [2 /*return*/, _a.sent()];
          case 6:
            error_3 = _a.sent();
            logger_1.logger.error(
              "Error processing payment for subscription ".concat(subscriptionId, ":"),
              error_3,
            );
            return [
              2 /*return*/,
              {
                success: false,
                error_message: error_3 instanceof Error ? error_3.message : "Unknown error",
                requires_retry: true,
              },
            ];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  // Process Stripe-based payment
  RecurringPaymentProcessor.prototype.processStripePayment = function (subscription, plan) {
    return __awaiter(this, void 0, void 0, function () {
      var stripeSubscription, latestInvoice, paymentIntent, customer, updatedPaymentIntent, error_4;
      var _a, _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 7, , 8]);
            return [
              4 /*yield*/,
              this.stripe.subscriptions.retrieve(subscription.stripe_subscription_id, {
                expand: ["latest_invoice", "latest_invoice.payment_intent"],
              }),
            ];
          case 1:
            stripeSubscription = _c.sent();
            latestInvoice = stripeSubscription.latest_invoice;
            if (!latestInvoice) {
              throw new Error("No invoice found for subscription");
            }
            // Check if payment is already successful
            if (latestInvoice.status === "paid") {
              return [
                2 /*return*/,
                {
                  success: true,
                  payment_intent_id: latestInvoice.payment_intent,
                },
              ];
            }
            if (!(latestInvoice.status === "open")) return [3 /*break*/, 6];
            paymentIntent = latestInvoice.payment_intent;
            if (!(paymentIntent && paymentIntent.status === "requires_payment_method"))
              return [3 /*break*/, 4];
            return [4 /*yield*/, this.stripe.customers.retrieve(stripeSubscription.customer)];
          case 2:
            customer = _c.sent();
            if (
              !((_a = customer.invoice_settings) === null || _a === void 0
                ? void 0
                : _a.default_payment_method)
            )
              return [3 /*break*/, 4];
            return [
              4 /*yield*/,
              this.stripe.paymentIntents.confirm(paymentIntent.id, {
                payment_method: customer.invoice_settings.default_payment_method,
              }),
            ];
          case 3:
            _c.sent();
            _c.label = 4;
          case 4:
            return [4 /*yield*/, this.stripe.paymentIntents.retrieve(paymentIntent.id)];
          case 5:
            updatedPaymentIntent = _c.sent();
            if (updatedPaymentIntent.status === "succeeded") {
              return [
                2 /*return*/,
                {
                  success: true,
                  payment_intent_id: updatedPaymentIntent.id,
                },
              ];
            } else {
              return [
                2 /*return*/,
                {
                  success: false,
                  payment_intent_id: updatedPaymentIntent.id,
                  error_message:
                    ((_b = updatedPaymentIntent.last_payment_error) === null || _b === void 0
                      ? void 0
                      : _b.message) || "Payment failed",
                  requires_retry: this.shouldRetryPayment(updatedPaymentIntent.last_payment_error),
                },
              ];
            }
            _c.label = 6;
          case 6:
            return [
              2 /*return*/,
              {
                success: false,
                error_message: "Invoice status: ".concat(latestInvoice.status),
                requires_retry: true,
              },
            ];
          case 7:
            error_4 = _c.sent();
            logger_1.logger.error("Error processing Stripe payment:", error_4);
            return [
              2 /*return*/,
              {
                success: false,
                error_message: error_4 instanceof Error ? error_4.message : "Stripe payment error",
                requires_retry: true,
              },
            ];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  // Process manual payment (non-Stripe)
  RecurringPaymentProcessor.prototype.processManualPayment = function (subscription, plan) {
    return __awaiter(this, void 0, void 0, function () {
      var customer, defaultPaymentMethod, paymentResult, error_5;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              this.supabase
                .from("customers")
                .select("\n          *,\n          payment_methods(*)\n        ")
                .eq("id", subscription.customer_id)
                .single(),
            ];
          case 1:
            customer = _b.sent().data;
            if (
              !customer ||
              !((_a = customer.payment_methods) === null || _a === void 0 ? void 0 : _a.length)
            ) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error_message: "No payment method available",
                  requires_retry: false,
                },
              ];
            }
            defaultPaymentMethod =
              customer.payment_methods.find(function (pm) {
                return pm.is_default;
              }) || customer.payment_methods[0];
            return [
              4 /*yield*/,
              this.paymentProcessor.processPayment({
                amount: plan.price * 100, // Convert to cents
                currency: plan.currency,
                customer_id: subscription.customer_id,
                payment_method_id: defaultPaymentMethod.id,
                description: "Subscription payment for ".concat(plan.name),
                metadata: {
                  subscription_id: subscription.id,
                  plan_id: plan.id,
                  billing_cycle: plan.billing_cycle,
                },
              }),
            ];
          case 2:
            paymentResult = _b.sent();
            if (paymentResult.success) {
              return [
                2 /*return*/,
                {
                  success: true,
                  payment_intent_id: paymentResult.transaction_id,
                },
              ];
            } else {
              return [
                2 /*return*/,
                {
                  success: false,
                  error_message: paymentResult.error_message,
                  requires_retry: this.shouldRetryPaymentError(paymentResult.error_code),
                },
              ];
            }
            return [3 /*break*/, 4];
          case 3:
            error_5 = _b.sent();
            logger_1.logger.error("Error processing manual payment:", error_5);
            return [
              2 /*return*/,
              {
                success: false,
                error_message: error_5 instanceof Error ? error_5.message : "Manual payment error",
                requires_retry: true,
              },
            ];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  // Payment Retry Management
  RecurringPaymentProcessor.prototype.schedulePaymentRetry = function (
    subscriptionId,
    paymentResult,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var existingRetries, currentAttempt, nextAttempt, retryHours, nextRetryDate, error_6;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 7, , 8]);
            return [
              4 /*yield*/,
              this.supabase
                .from("payment_retry_log")
                .select("*")
                .eq("subscription_id", subscriptionId)
                .eq("payment_intent_id", paymentResult.payment_intent_id || "manual")
                .order("attempt_count", { ascending: false })
                .limit(1),
            ];
          case 1:
            existingRetries = _b.sent().data;
            currentAttempt =
              ((_a =
                existingRetries === null || existingRetries === void 0
                  ? void 0
                  : existingRetries[0]) === null || _a === void 0
                ? void 0
                : _a.attempt_count) || 0;
            nextAttempt = currentAttempt + 1;
            if (!(nextAttempt > this.config.max_retry_attempts)) return [3 /*break*/, 3];
            return [4 /*yield*/, this.handleFinalPaymentFailure(subscriptionId, paymentResult)];
          case 2:
            _b.sent();
            return [2 /*return*/];
          case 3:
            retryHours =
              this.config.retry_intervals_hours[nextAttempt - 1] ||
              this.config.retry_intervals_hours[this.config.retry_intervals_hours.length - 1];
            nextRetryDate = (0, date_fns_1.addHours)(new Date(), retryHours);
            // Schedule retry
            return [
              4 /*yield*/,
              this.supabase.from("payment_retry_log").insert({
                subscription_id: subscriptionId,
                payment_intent_id: paymentResult.payment_intent_id || "manual",
                attempt_count: nextAttempt,
                retry_date: nextRetryDate.toISOString(),
                status: "scheduled",
                error_message: paymentResult.error_message,
              }),
            ];
          case 4:
            // Schedule retry
            _b.sent();
            if (!this.config.notification_settings.payment_retry) return [3 /*break*/, 6];
            return [
              4 /*yield*/,
              this.sendPaymentRetryNotification(subscriptionId, nextAttempt, nextRetryDate),
            ];
          case 5:
            _b.sent();
            _b.label = 6;
          case 6:
            logger_1.logger.info(
              "Payment retry scheduled for subscription "
                .concat(subscriptionId, ", attempt ")
                .concat(nextAttempt),
            );
            return [3 /*break*/, 8];
          case 7:
            error_6 = _b.sent();
            logger_1.logger.error("Error scheduling payment retry:", error_6);
            return [3 /*break*/, 8];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  RecurringPaymentProcessor.prototype.processScheduledRetries = function (result) {
    return __awaiter(this, void 0, void 0, function () {
      var dueRetries, _i, dueRetries_1, retry, paymentResult, error_7, errorMessage, error_8;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 18, , 19]);
            return [
              4 /*yield*/,
              this.supabase
                .from("payment_retry_log")
                .select("*")
                .eq("status", "scheduled")
                .lte("retry_date", new Date().toISOString()),
            ];
          case 1:
            dueRetries = _a.sent().data;
            if (!(dueRetries === null || dueRetries === void 0 ? void 0 : dueRetries.length)) {
              return [2 /*return*/];
            }
            logger_1.logger.info(
              "Processing ".concat(dueRetries.length, " scheduled payment retries"),
            );
            (_i = 0), (dueRetries_1 = dueRetries);
            _a.label = 2;
          case 2:
            if (!(_i < dueRetries_1.length)) return [3 /*break*/, 17];
            retry = dueRetries_1[_i];
            _a.label = 3;
          case 3:
            _a.trys.push([3, 14, , 16]);
            // Mark as processing
            return [
              4 /*yield*/,
              this.supabase
                .from("payment_retry_log")
                .update({ status: "processing" })
                .eq("id", retry.id),
            ];
          case 4:
            // Mark as processing
            _a.sent();
            return [4 /*yield*/, this.processSubscriptionPayment(retry.subscription_id)];
          case 5:
            paymentResult = _a.sent();
            if (!paymentResult.success) return [3 /*break*/, 8];
            // Mark retry as completed
            return [
              4 /*yield*/,
              this.supabase
                .from("payment_retry_log")
                .update({
                  status: "completed",
                  processed_at: new Date().toISOString(),
                })
                .eq("id", retry.id),
            ];
          case 6:
            // Mark retry as completed
            _a.sent();
            result.successful_payments++;
            return [
              4 /*yield*/,
              this.handleSuccessfulPayment(retry.subscription_id, paymentResult),
            ];
          case 7:
            _a.sent();
            return [3 /*break*/, 13];
          case 8:
            // Mark retry as failed
            return [
              4 /*yield*/,
              this.supabase
                .from("payment_retry_log")
                .update({
                  status: "failed",
                  error_message: paymentResult.error_message,
                  processed_at: new Date().toISOString(),
                })
                .eq("id", retry.id),
            ];
          case 9:
            // Mark retry as failed
            _a.sent();
            result.failed_payments++;
            if (!paymentResult.requires_retry) return [3 /*break*/, 11];
            return [4 /*yield*/, this.schedulePaymentRetry(retry.subscription_id, paymentResult)];
          case 10:
            _a.sent();
            result.retry_scheduled++;
            return [3 /*break*/, 13];
          case 11:
            return [
              4 /*yield*/,
              this.handleFinalPaymentFailure(retry.subscription_id, paymentResult),
            ];
          case 12:
            _a.sent();
            _a.label = 13;
          case 13:
            return [3 /*break*/, 16];
          case 14:
            error_7 = _a.sent();
            errorMessage = "Error processing retry ".concat(retry.id, ": ").concat(error_7);
            logger_1.logger.error(errorMessage);
            result.errors.push(errorMessage);
            // Mark retry as failed
            return [
              4 /*yield*/,
              this.supabase
                .from("payment_retry_log")
                .update({
                  status: "failed",
                  error_message: error_7 instanceof Error ? error_7.message : "Unknown error",
                  processed_at: new Date().toISOString(),
                })
                .eq("id", retry.id),
            ];
          case 15:
            // Mark retry as failed
            _a.sent();
            return [3 /*break*/, 16];
          case 16:
            _i++;
            return [3 /*break*/, 2];
          case 17:
            return [3 /*break*/, 19];
          case 18:
            error_8 = _a.sent();
            logger_1.logger.error("Error processing scheduled retries:", error_8);
            return [3 /*break*/, 19];
          case 19:
            return [2 /*return*/];
        }
      });
    });
  };
  // Success and Failure Handlers
  RecurringPaymentProcessor.prototype.handleSuccessfulPayment = function (
    subscriptionId,
    paymentResult,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var subscription, plan, nextPeriodStart, nextPeriodEnd, error_9;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 8, , 9]);
            return [
              4 /*yield*/,
              subscription_manager_1.subscriptionManager.getSubscription(subscriptionId),
            ];
          case 1:
            subscription = _a.sent();
            if (!subscription) return [2 /*return*/];
            return [
              4 /*yield*/,
              subscription_manager_1.subscriptionManager.getSubscriptionPlan(subscription.plan_id),
            ];
          case 2:
            plan = _a.sent();
            if (!plan) return [2 /*return*/];
            nextPeriodStart = new Date(subscription.current_period_end);
            nextPeriodEnd = this.calculateNextBillingDate(nextPeriodStart, plan.billing_cycle);
            return [
              4 /*yield*/,
              this.supabase
                .from("subscriptions")
                .update({
                  status: "active",
                  current_period_start: nextPeriodStart.toISOString(),
                  current_period_end: nextPeriodEnd.toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .eq("id", subscriptionId),
            ];
          case 3:
            _a.sent();
            // Create payment record
            return [
              4 /*yield*/,
              this.createPaymentRecord(subscriptionId, paymentResult, "completed"),
            ];
          case 4:
            // Create payment record
            _a.sent();
            // Reset usage tracking for new period
            return [
              4 /*yield*/,
              this.resetUsageTracking(subscriptionId, nextPeriodStart, nextPeriodEnd),
            ];
          case 5:
            // Reset usage tracking for new period
            _a.sent();
            if (!this.config.notification_settings.payment_success) return [3 /*break*/, 7];
            return [4 /*yield*/, this.sendPaymentSuccessNotification(subscriptionId, plan.price)];
          case 6:
            _a.sent();
            _a.label = 7;
          case 7:
            logger_1.logger.info(
              "Successful payment processed for subscription ".concat(subscriptionId),
            );
            return [3 /*break*/, 9];
          case 8:
            error_9 = _a.sent();
            logger_1.logger.error("Error handling successful payment:", error_9);
            return [3 /*break*/, 9];
          case 9:
            return [2 /*return*/];
        }
      });
    });
  };
  RecurringPaymentProcessor.prototype.handleFinalPaymentFailure = function (
    subscriptionId,
    paymentResult,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var error_10;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            // Update subscription status to past_due
            return [
              4 /*yield*/,
              this.supabase
                .from("subscriptions")
                .update({
                  status: "past_due",
                  updated_at: new Date().toISOString(),
                })
                .eq("id", subscriptionId),
            ];
          case 1:
            // Update subscription status to past_due
            _a.sent();
            // Create failed payment record
            return [4 /*yield*/, this.createPaymentRecord(subscriptionId, paymentResult, "failed")];
          case 2:
            // Create failed payment record
            _a.sent();
            if (!this.config.notification_settings.payment_failed) return [3 /*break*/, 4];
            return [
              4 /*yield*/,
              this.sendPaymentFailureNotification(subscriptionId, paymentResult.error_message),
            ];
          case 3:
            _a.sent();
            _a.label = 4;
          case 4:
            logger_1.logger.info(
              "Final payment failure handled for subscription ".concat(subscriptionId),
            );
            return [3 /*break*/, 6];
          case 5:
            error_10 = _a.sent();
            logger_1.logger.error("Error handling final payment failure:", error_10);
            return [3 /*break*/, 6];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  // Subscription Status Management
  RecurringPaymentProcessor.prototype.updateSubscriptionStatuses = function () {
    return __awaiter(this, void 0, void 0, function () {
      var now,
        gracePeriodDate,
        suspensionDate,
        cancellationDate,
        subscriptionsToCancel,
        _i,
        _a,
        subscription,
        subscriptionsToSuspend,
        _b,
        _c,
        subscription,
        error_11;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            _d.trys.push([0, 13, , 14]);
            now = new Date();
            gracePeriodDate = new Date(
              now.getTime() -
                this.config.dunning_management.grace_period_days * 24 * 60 * 60 * 1000,
            );
            suspensionDate = new Date(
              now.getTime() -
                this.config.dunning_management.suspension_after_days * 24 * 60 * 60 * 1000,
            );
            cancellationDate = new Date(
              now.getTime() -
                this.config.dunning_management.cancellation_after_days * 24 * 60 * 60 * 1000,
            );
            return [
              4 /*yield*/,
              this.supabase
                .from("subscriptions")
                .select("*")
                .eq("status", "past_due")
                .lt("current_period_end", cancellationDate.toISOString()),
            ];
          case 1:
            subscriptionsToCancel = _d.sent().data;
            (_i = 0), (_a = subscriptionsToCancel || []);
            _d.label = 2;
          case 2:
            if (!(_i < _a.length)) return [3 /*break*/, 6];
            subscription = _a[_i];
            return [
              4 /*yield*/,
              subscription_manager_1.subscriptionManager.cancelSubscription(subscription.id, true),
            ];
          case 3:
            _d.sent();
            if (!this.config.notification_settings.subscription_canceled) return [3 /*break*/, 5];
            return [4 /*yield*/, this.sendSubscriptionCanceledNotification(subscription.id)];
          case 4:
            _d.sent();
            _d.label = 5;
          case 5:
            _i++;
            return [3 /*break*/, 2];
          case 6:
            return [
              4 /*yield*/,
              this.supabase
                .from("subscriptions")
                .select("*")
                .eq("status", "past_due")
                .lt("current_period_end", suspensionDate.toISOString())
                .gte("current_period_end", cancellationDate.toISOString()),
            ];
          case 7:
            subscriptionsToSuspend = _d.sent().data;
            (_b = 0), (_c = subscriptionsToSuspend || []);
            _d.label = 8;
          case 8:
            if (!(_b < _c.length)) return [3 /*break*/, 12];
            subscription = _c[_b];
            return [
              4 /*yield*/,
              this.supabase
                .from("subscriptions")
                .update({
                  status: "unpaid",
                  updated_at: new Date().toISOString(),
                })
                .eq("id", subscription.id),
            ];
          case 9:
            _d.sent();
            if (!this.config.notification_settings.subscription_suspended) return [3 /*break*/, 11];
            return [4 /*yield*/, this.sendSubscriptionSuspendedNotification(subscription.id)];
          case 10:
            _d.sent();
            _d.label = 11;
          case 11:
            _b++;
            return [3 /*break*/, 8];
          case 12:
            logger_1.logger.info("Subscription statuses updated based on dunning management rules");
            return [3 /*break*/, 14];
          case 13:
            error_11 = _d.sent();
            logger_1.logger.error("Error updating subscription statuses:", error_11);
            return [3 /*break*/, 14];
          case 14:
            return [2 /*return*/];
        }
      });
    });
  };
  // Helper Methods
  RecurringPaymentProcessor.prototype.getSubscriptionsDueForBilling = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_12;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("subscriptions")
                .select(
                  "\n          *,\n          plan:subscription_plans(*),\n          customer:customers(*)\n        ",
                )
                .in("status", ["active", "trialing"])
                .lte("current_period_end", new Date().toISOString()),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              logger_1.logger.error("Error fetching subscriptions due for billing:", error);
              return [2 /*return*/, []];
            }
            return [2 /*return*/, data || []];
          case 2:
            error_12 = _b.sent();
            logger_1.logger.error("Error in getSubscriptionsDueForBilling:", error_12);
            return [2 /*return*/, []];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  RecurringPaymentProcessor.prototype.calculateNextBillingDate = function (
    startDate,
    billingCycle,
  ) {
    switch (billingCycle) {
      case "monthly":
        return new Date(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate());
      case "quarterly":
        return new Date(startDate.getFullYear(), startDate.getMonth() + 3, startDate.getDate());
      case "annual":
        return new Date(startDate.getFullYear() + 1, startDate.getMonth(), startDate.getDate());
      default:
        throw new Error("Invalid billing cycle: ".concat(billingCycle));
    }
  };
  RecurringPaymentProcessor.prototype.shouldRetryPayment = function (error) {
    if (!error) return true;
    var nonRetryableCodes = [
      "card_declined",
      "expired_card",
      "incorrect_cvc",
      "processing_error",
      "card_not_supported",
    ];
    return !nonRetryableCodes.includes(error.code || "");
  };
  RecurringPaymentProcessor.prototype.shouldRetryPaymentError = function (errorCode) {
    if (!errorCode) return true;
    var nonRetryableCodes = ["insufficient_funds", "card_declined", "expired_card", "invalid_card"];
    return !nonRetryableCodes.includes(errorCode);
  };
  RecurringPaymentProcessor.prototype.createPaymentRecord = function (
    subscriptionId,
    paymentResult,
    status,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var subscription, plan, error_13;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [
              4 /*yield*/,
              subscription_manager_1.subscriptionManager.getSubscription(subscriptionId),
            ];
          case 1:
            subscription = _a.sent();
            return [
              4 /*yield*/,
              subscription_manager_1.subscriptionManager.getSubscriptionPlan(
                subscription === null || subscription === void 0 ? void 0 : subscription.plan_id,
              ),
            ];
          case 2:
            plan = _a.sent();
            if (!subscription || !plan) return [2 /*return*/];
            return [
              4 /*yield*/,
              this.supabase.from("payments").insert({
                customer_id: subscription.customer_id,
                amount: plan.price * 100, // Convert to cents
                currency: plan.currency,
                status: status,
                payment_method: "subscription",
                transaction_id: paymentResult.payment_intent_id,
                metadata: {
                  subscription_id: subscriptionId,
                  plan_id: plan.id,
                  billing_cycle: plan.billing_cycle,
                },
              }),
            ];
          case 3:
            _a.sent();
            return [3 /*break*/, 5];
          case 4:
            error_13 = _a.sent();
            logger_1.logger.error("Error creating payment record:", error_13);
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  RecurringPaymentProcessor.prototype.resetUsageTracking = function (
    subscriptionId,
    periodStart,
    periodEnd,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var currentUsage, _i, _a, usage, error_14;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 6, , 7]);
            return [
              4 /*yield*/,
              this.supabase
                .from("subscription_usage")
                .select("*")
                .eq("subscription_id", subscriptionId),
            ];
          case 1:
            currentUsage = _b.sent().data;
            (_i = 0), (_a = currentUsage || []);
            _b.label = 2;
          case 2:
            if (!(_i < _a.length)) return [3 /*break*/, 5];
            usage = _a[_i];
            return [
              4 /*yield*/,
              this.supabase.from("subscription_usage").insert({
                subscription_id: subscriptionId,
                usage_type: usage.usage_type,
                usage_count: 0,
                usage_limit: usage.usage_limit,
                period_start: periodStart.toISOString(),
                period_end: periodEnd.toISOString(),
              }),
            ];
          case 3:
            _b.sent();
            _b.label = 4;
          case 4:
            _i++;
            return [3 /*break*/, 2];
          case 5:
            return [3 /*break*/, 7];
          case 6:
            error_14 = _b.sent();
            logger_1.logger.error("Error resetting usage tracking:", error_14);
            return [3 /*break*/, 7];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  // Notification Methods
  RecurringPaymentProcessor.prototype.sendPaymentRetryNotification = function (
    subscriptionId,
    attemptNumber,
    nextRetryDate,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var subscription, error_15;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              subscription_manager_1.subscriptionManager.getSubscription(subscriptionId),
            ];
          case 1:
            subscription = _b.sent();
            if (!subscription) return [2 /*return*/];
            return [
              4 /*yield*/,
              (0, notification_service_1.sendNotification)({
                type: "payment_retry_scheduled",
                recipient_id: subscription.customer_id,
                data: {
                  subscription_id: subscriptionId,
                  attempt_number: attemptNumber,
                  next_retry_date: (0, date_fns_1.format)(nextRetryDate, "PPP"),
                  plan_name: (_a = subscription.plan) === null || _a === void 0 ? void 0 : _a.name,
                },
              }),
            ];
          case 2:
            _b.sent();
            return [3 /*break*/, 4];
          case 3:
            error_15 = _b.sent();
            logger_1.logger.error("Error sending payment retry notification:", error_15);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  RecurringPaymentProcessor.prototype.sendPaymentSuccessNotification = function (
    subscriptionId,
    amount,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var subscription, error_16;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              subscription_manager_1.subscriptionManager.getSubscription(subscriptionId),
            ];
          case 1:
            subscription = _b.sent();
            if (!subscription) return [2 /*return*/];
            return [
              4 /*yield*/,
              (0, notification_service_1.sendNotification)({
                type: "payment_success",
                recipient_id: subscription.customer_id,
                data: {
                  subscription_id: subscriptionId,
                  amount: amount,
                  plan_name: (_a = subscription.plan) === null || _a === void 0 ? void 0 : _a.name,
                  next_billing_date: (0, date_fns_1.format)(
                    new Date(subscription.current_period_end),
                    "PPP",
                  ),
                },
              }),
            ];
          case 2:
            _b.sent();
            return [3 /*break*/, 4];
          case 3:
            error_16 = _b.sent();
            logger_1.logger.error("Error sending payment success notification:", error_16);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  RecurringPaymentProcessor.prototype.sendPaymentFailureNotification = function (
    subscriptionId,
    errorMessage,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var subscription, error_17;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              subscription_manager_1.subscriptionManager.getSubscription(subscriptionId),
            ];
          case 1:
            subscription = _b.sent();
            if (!subscription) return [2 /*return*/];
            return [
              4 /*yield*/,
              (0, notification_service_1.sendNotification)({
                type: "payment_failed",
                recipient_id: subscription.customer_id,
                data: {
                  subscription_id: subscriptionId,
                  error_message: errorMessage,
                  plan_name: (_a = subscription.plan) === null || _a === void 0 ? void 0 : _a.name,
                },
              }),
            ];
          case 2:
            _b.sent();
            return [3 /*break*/, 4];
          case 3:
            error_17 = _b.sent();
            logger_1.logger.error("Error sending payment failure notification:", error_17);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  RecurringPaymentProcessor.prototype.sendSubscriptionSuspendedNotification = function (
    subscriptionId,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var subscription, error_18;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              subscription_manager_1.subscriptionManager.getSubscription(subscriptionId),
            ];
          case 1:
            subscription = _b.sent();
            if (!subscription) return [2 /*return*/];
            return [
              4 /*yield*/,
              (0, notification_service_1.sendNotification)({
                type: "subscription_suspended",
                recipient_id: subscription.customer_id,
                data: {
                  subscription_id: subscriptionId,
                  plan_name: (_a = subscription.plan) === null || _a === void 0 ? void 0 : _a.name,
                },
              }),
            ];
          case 2:
            _b.sent();
            return [3 /*break*/, 4];
          case 3:
            error_18 = _b.sent();
            logger_1.logger.error("Error sending subscription suspended notification:", error_18);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  RecurringPaymentProcessor.prototype.sendSubscriptionCanceledNotification = function (
    subscriptionId,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var subscription, error_19;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              subscription_manager_1.subscriptionManager.getSubscription(subscriptionId),
            ];
          case 1:
            subscription = _b.sent();
            if (!subscription) return [2 /*return*/];
            return [
              4 /*yield*/,
              (0, notification_service_1.sendNotification)({
                type: "subscription_canceled",
                recipient_id: subscription.customer_id,
                data: {
                  subscription_id: subscriptionId,
                  plan_name: (_a = subscription.plan) === null || _a === void 0 ? void 0 : _a.name,
                },
              }),
            ];
          case 2:
            _b.sent();
            return [3 /*break*/, 4];
          case 3:
            error_19 = _b.sent();
            logger_1.logger.error("Error sending subscription canceled notification:", error_19);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  return RecurringPaymentProcessor;
})();
exports.RecurringPaymentProcessor = RecurringPaymentProcessor;
// Export singleton instance
exports.recurringPaymentProcessor = new RecurringPaymentProcessor();
