"use strict";
// NeonPro - Installment Processor
// Story 6.1 - Task 3: Installment Management System
// Service for processing installment payments and automation
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
exports.InstallmentProcessor = void 0;
exports.getInstallmentProcessor = getInstallmentProcessor;
var supabase_js_1 = require("@supabase/supabase-js");
var stripe_1 = require("stripe");
var date_fns_1 = require("date-fns");
var InstallmentProcessor = /** @class */ (function () {
  function InstallmentProcessor(config) {
    this.config = __assign(
      { retryAttempts: 3, lateFeePercentage: 2.0, gracePeriodDays: 3 },
      config,
    );
    this.supabase = (0, supabase_js_1.createClient)(config.supabaseUrl, config.supabaseKey);
    this.stripe = new stripe_1.default(config.stripeSecretKey, {
      apiVersion: "2023-10-16",
    });
  }
  /**
   * Process a single installment payment
   */
  InstallmentProcessor.prototype.processInstallmentPayment = function (
    installmentId,
    paymentMethodId,
    customerId,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var _a,
        installment,
        installmentError,
        customer,
        stripeCustomerId,
        lateFee,
        totalAmount,
        finalPaymentMethodId,
        defaultPaymentMethod,
        paymentIntent,
        updateError,
        error_1;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 10, , 11]);
            return [
              4 /*yield*/,
              this.supabase
                .from("installments")
                .select(
                  "\n          *,\n          payment_plans!inner(\n            id,\n            customer_id,\n            total_amount,\n            currency,\n            customers!inner(\n              id,\n              name,\n              email,\n              stripe_customer_id\n            )\n          )\n        ",
                )
                .eq("id", installmentId)
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (installment = _a.data), (installmentError = _a.error);
            if (installmentError || !installment) {
              throw new Error(
                "Installment not found: ".concat(
                  installmentError === null || installmentError === void 0
                    ? void 0
                    : installmentError.message,
                ),
              );
            }
            if (installment.status === "paid") {
              return [
                2 /*return*/,
                {
                  success: false,
                  installmentId: installmentId,
                  error: "Installment already paid",
                },
              ];
            }
            if (installment.status === "cancelled") {
              return [
                2 /*return*/,
                {
                  success: false,
                  installmentId: installmentId,
                  error: "Installment is cancelled",
                },
              ];
            }
            customer = installment.payment_plans.customers;
            stripeCustomerId = customerId || customer.stripe_customer_id;
            if (!stripeCustomerId) {
              throw new Error("No Stripe customer ID found");
            }
            return [4 /*yield*/, this.calculateLateFee(installment)];
          case 2:
            lateFee = _b.sent();
            totalAmount = installment.amount + lateFee;
            finalPaymentMethodId = paymentMethodId;
            if (!!finalPaymentMethodId) return [3 /*break*/, 4];
            return [4 /*yield*/, this.getDefaultPaymentMethod(stripeCustomerId)];
          case 3:
            defaultPaymentMethod = _b.sent();
            finalPaymentMethodId =
              defaultPaymentMethod === null || defaultPaymentMethod === void 0
                ? void 0
                : defaultPaymentMethod.id;
            _b.label = 4;
          case 4:
            if (!finalPaymentMethodId) {
              throw new Error("No payment method available");
            }
            return [
              4 /*yield*/,
              this.stripe.paymentIntents.create({
                amount: Math.round(totalAmount * 100), // Convert to cents
                currency: installment.payment_plans.currency.toLowerCase(),
                customer: stripeCustomerId,
                payment_method: finalPaymentMethodId,
                confirmation_method: "automatic",
                confirm: true,
                return_url: ""
                  .concat(process.env.NEXT_PUBLIC_APP_URL, "/payments/installments/")
                  .concat(installmentId, "/success"),
                metadata: {
                  installment_id: installmentId,
                  payment_plan_id: installment.payment_plan_id,
                  customer_id: customer.id,
                  installment_number: installment.installment_number.toString(),
                  late_fee: lateFee.toString(),
                },
              }),
            ];
          case 5:
            paymentIntent = _b.sent();
            return [
              4 /*yield*/,
              this.supabase
                .from("installments")
                .update({
                  stripe_payment_intent_id: paymentIntent.id,
                  late_fee: lateFee,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", installmentId),
            ];
          case 6:
            updateError = _b.sent().error;
            if (updateError) {
              throw new Error("Failed to update installment: ".concat(updateError.message));
            }
            if (!(paymentIntent.status === "succeeded")) return [3 /*break*/, 8];
            return [4 /*yield*/, this.markInstallmentAsPaid(installmentId, paymentIntent.id)];
          case 7:
            _b.sent();
            return [
              2 /*return*/,
              {
                success: true,
                installmentId: installmentId,
                paymentIntentId: paymentIntent.id,
                amount: installment.amount,
                lateFee: lateFee,
              },
            ];
          case 8:
            if (paymentIntent.status === "requires_action") {
              return [
                2 /*return*/,
                {
                  success: false,
                  installmentId: installmentId,
                  paymentIntentId: paymentIntent.id,
                  error: "Payment requires additional action",
                  amount: installment.amount,
                  lateFee: lateFee,
                },
              ];
            } else {
              throw new Error("Payment failed with status: ".concat(paymentIntent.status));
            }
            _b.label = 9;
          case 9:
            return [3 /*break*/, 11];
          case 10:
            error_1 = _b.sent();
            console.error("Error processing installment payment:", error_1);
            return [
              2 /*return*/,
              {
                success: false,
                installmentId: installmentId,
                error: error_1 instanceof Error ? error_1.message : "Unknown error",
              },
            ];
          case 11:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Process multiple installments in bulk
   */
  InstallmentProcessor.prototype.processBulkInstallments = function (installmentIds_1) {
    return __awaiter(this, arguments, void 0, function (installmentIds, options) {
      var _a,
        maxConcurrent,
        results,
        errors,
        totalAmount,
        totalLateFees,
        successful,
        failed,
        i,
        batch,
        batchPromises,
        batchResults;
      var _this = this;
      if (options === void 0) {
        options = {};
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            (_a = options.maxConcurrent), (maxConcurrent = _a === void 0 ? 5 : _a);
            results = [];
            errors = [];
            totalAmount = 0;
            totalLateFees = 0;
            successful = 0;
            failed = 0;
            i = 0;
            _b.label = 1;
          case 1:
            if (!(i < installmentIds.length)) return [3 /*break*/, 4];
            batch = installmentIds.slice(i, i + maxConcurrent);
            batchPromises = batch.map(function (installmentId) {
              return __awaiter(_this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                  switch (_a.label) {
                    case 0:
                      return [
                        4 /*yield*/,
                        this.processInstallmentPayment(
                          installmentId,
                          options.paymentMethodId,
                          options.customerId,
                        ),
                      ];
                    case 1:
                      result = _a.sent();
                      if (result.success) {
                        successful++;
                        if (result.amount) totalAmount += result.amount;
                        if (result.lateFee) totalLateFees += result.lateFee;
                      } else {
                        failed++;
                        if (result.error)
                          errors.push("".concat(installmentId, ": ").concat(result.error));
                      }
                      return [2 /*return*/, result];
                  }
                });
              });
            });
            return [4 /*yield*/, Promise.all(batchPromises)];
          case 2:
            batchResults = _b.sent();
            results.push.apply(results, batchResults);
            _b.label = 3;
          case 3:
            i += maxConcurrent;
            return [3 /*break*/, 1];
          case 4:
            return [
              2 /*return*/,
              {
                totalProcessed: installmentIds.length,
                successful: successful,
                failed: failed,
                results: results,
                summary: {
                  totalAmount: totalAmount,
                  totalLateFees: totalLateFees,
                  errors: errors,
                },
              },
            ];
        }
      });
    });
  };
  /**
   * Process overdue installments automatically
   */
  InstallmentProcessor.prototype.processOverdueInstallments = function () {
    return __awaiter(this, arguments, void 0, function (options) {
      var _a,
        maxDaysOverdue,
        _b,
        maxInstallments,
        _c,
        dryRun,
        _d,
        overdueInstallments,
        error,
        simulatedResults,
        installmentIds,
        error_2;
      if (options === void 0) {
        options = {};
      }
      return __generator(this, function (_e) {
        switch (_e.label) {
          case 0:
            (_a = options.maxDaysOverdue),
              (maxDaysOverdue = _a === void 0 ? 30 : _a),
              (_b = options.maxInstallments),
              (maxInstallments = _b === void 0 ? 100 : _b),
              (_c = options.dryRun),
              (dryRun = _c === void 0 ? false : _c);
            _e.label = 1;
          case 1:
            _e.trys.push([1, 4, , 5]);
            return [
              4 /*yield*/,
              this.supabase
                .from("overdue_installments_view")
                .select("*")
                .lte("days_overdue", maxDaysOverdue)
                .limit(maxInstallments),
            ];
          case 2:
            (_d = _e.sent()), (overdueInstallments = _d.data), (error = _d.error);
            if (error) {
              throw new Error("Failed to fetch overdue installments: ".concat(error.message));
            }
            if (!overdueInstallments || overdueInstallments.length === 0) {
              return [
                2 /*return*/,
                {
                  totalProcessed: 0,
                  successful: 0,
                  failed: 0,
                  results: [],
                  summary: {
                    totalAmount: 0,
                    totalLateFees: 0,
                    errors: [],
                  },
                },
              ];
            }
            if (dryRun) {
              simulatedResults = overdueInstallments.map(function (installment) {
                return {
                  success: true,
                  installmentId: installment.id,
                  amount: installment.amount,
                  lateFee: installment.late_fee || 0,
                };
              });
              return [
                2 /*return*/,
                {
                  totalProcessed: overdueInstallments.length,
                  successful: overdueInstallments.length,
                  failed: 0,
                  results: simulatedResults,
                  summary: {
                    totalAmount: overdueInstallments.reduce(function (sum, i) {
                      return sum + i.amount;
                    }, 0),
                    totalLateFees: overdueInstallments.reduce(function (sum, i) {
                      return sum + (i.late_fee || 0);
                    }, 0),
                    errors: [],
                  },
                },
              ];
            }
            installmentIds = overdueInstallments.map(function (i) {
              return i.id;
            });
            return [4 /*yield*/, this.processBulkInstallments(installmentIds)];
          case 3:
            return [2 /*return*/, _e.sent()];
          case 4:
            error_2 = _e.sent();
            console.error("Error processing overdue installments:", error_2);
            return [
              2 /*return*/,
              {
                totalProcessed: 0,
                successful: 0,
                failed: 1,
                results: [],
                summary: {
                  totalAmount: 0,
                  totalLateFees: 0,
                  errors: [error_2 instanceof Error ? error_2.message : "Unknown error"],
                },
              },
            ];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Mark installment as paid
   */
  InstallmentProcessor.prototype.markInstallmentAsPaid = function (
    installmentId,
    paymentIntentId,
    paymentMethod,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var error;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("installments")
                .update({
                  status: "paid",
                  paid_date: new Date().toISOString(),
                  payment_method: paymentMethod || "stripe",
                  stripe_payment_intent_id: paymentIntentId,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", installmentId),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              throw new Error("Failed to mark installment as paid: ".concat(error.message));
            }
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Calculate late fee for overdue installment
   */
  InstallmentProcessor.prototype.calculateLateFee = function (installment) {
    return __awaiter(this, void 0, void 0, function () {
      var dueDate, today, gracePeriod, lateFeeAmount;
      return __generator(this, function (_a) {
        dueDate = new Date(installment.due_date);
        today = new Date();
        gracePeriod = (0, date_fns_1.addDays)(dueDate, this.config.gracePeriodDays);
        // No late fee if within grace period
        if ((0, date_fns_1.isBefore)(today, gracePeriod)) {
          return [2 /*return*/, 0];
        }
        lateFeeAmount = installment.amount * (this.config.lateFeePercentage / 100);
        // Round to 2 decimal places
        return [2 /*return*/, Math.round(lateFeeAmount * 100) / 100];
      });
    });
  };
  /**
   * Get default payment method for customer
   */
  InstallmentProcessor.prototype.getDefaultPaymentMethod = function (customerId) {
    return __awaiter(this, void 0, void 0, function () {
      var customer, paymentMethods, pm, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, this.stripe.customers.retrieve(customerId)];
          case 1:
            customer = _a.sent();
            if (customer.deleted) {
              return [2 /*return*/, null];
            }
            return [
              4 /*yield*/,
              this.stripe.paymentMethods.list({
                customer: customerId,
                type: "card",
              }),
            ];
          case 2:
            paymentMethods = _a.sent();
            if (paymentMethods.data.length === 0) {
              return [2 /*return*/, null];
            }
            pm = paymentMethods.data[0];
            return [
              2 /*return*/,
              {
                id: pm.id,
                type: pm.type,
                card: pm.card
                  ? {
                      brand: pm.card.brand,
                      last4: pm.card.last4,
                      exp_month: pm.card.exp_month,
                      exp_year: pm.card.exp_year,
                    }
                  : undefined,
              },
            ];
          case 3:
            error_3 = _a.sent();
            console.error("Error getting default payment method:", error_3);
            return [2 /*return*/, null];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Update overdue installments status
   */
  InstallmentProcessor.prototype.updateOverdueStatus = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_4;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.supabase.rpc("mark_overdue_installments")];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to update overdue status: ".concat(error.message));
            }
            return [
              2 /*return*/,
              {
                updated: data || 0,
                errors: [],
              },
            ];
          case 2:
            error_4 = _b.sent();
            console.error("Error updating overdue status:", error_4);
            return [
              2 /*return*/,
              {
                updated: 0,
                errors: [error_4 instanceof Error ? error_4.message : "Unknown error"],
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get processing statistics
   */
  InstallmentProcessor.prototype.getProcessingStats = function (dateRange) {
    return __awaiter(this, void 0, void 0, function () {
      var query, _a, data, error, error_5;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            query = this.supabase
              .from("payment_performance_metrics")
              .select("*")
              .order("month", { ascending: false });
            if (dateRange) {
              query = query
                .gte("month", (0, date_fns_1.format)(dateRange.from, "yyyy-MM-dd"))
                .lte("month", (0, date_fns_1.format)(dateRange.to, "yyyy-MM-dd"));
            }
            return [4 /*yield*/, query.limit(12)];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to get processing stats: ".concat(error.message));
            }
            return [2 /*return*/, data || []];
          case 2:
            error_5 = _b.sent();
            console.error("Error getting processing stats:", error_5);
            throw error_5;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Retry failed payment
   */
  InstallmentProcessor.prototype.retryFailedPayment = function (installmentId, paymentMethodId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, installment, error, cancelError_1, error_6;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 7, , 8]);
            return [
              4 /*yield*/,
              this.supabase
                .from("installments")
                .select("*, payment_plans!inner(customers!inner(stripe_customer_id))")
                .eq("id", installmentId)
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (installment = _a.data), (error = _a.error);
            if (error || !installment) {
              throw new Error(
                "Installment not found: ".concat(
                  error === null || error === void 0 ? void 0 : error.message,
                ),
              );
            }
            if (installment.status === "paid") {
              return [
                2 /*return*/,
                {
                  success: false,
                  installmentId: installmentId,
                  error: "Installment already paid",
                },
              ];
            }
            if (!installment.stripe_payment_intent_id) return [3 /*break*/, 5];
            _b.label = 2;
          case 2:
            _b.trys.push([2, 4, , 5]);
            return [
              4 /*yield*/,
              this.stripe.paymentIntents.cancel(installment.stripe_payment_intent_id),
            ];
          case 3:
            _b.sent();
            return [3 /*break*/, 5];
          case 4:
            cancelError_1 = _b.sent();
            console.warn("Could not cancel previous payment intent:", cancelError_1);
            return [3 /*break*/, 5];
          case 5:
            return [
              4 /*yield*/,
              this.processInstallmentPayment(
                installmentId,
                paymentMethodId,
                installment.payment_plans.customers.stripe_customer_id,
              ),
            ];
          case 6:
            // Process the payment again
            return [2 /*return*/, _b.sent()];
          case 7:
            error_6 = _b.sent();
            console.error("Error retrying failed payment:", error_6);
            return [
              2 /*return*/,
              {
                success: false,
                installmentId: installmentId,
                error: error_6 instanceof Error ? error_6.message : "Unknown error",
              },
            ];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Handle Stripe webhook events
   */
  InstallmentProcessor.prototype.handleWebhookEvent = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, error_7;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 9, , 10]);
            _a = event.type;
            switch (_a) {
              case "payment_intent.succeeded":
                return [3 /*break*/, 1];
              case "payment_intent.payment_failed":
                return [3 /*break*/, 3];
              case "payment_intent.canceled":
                return [3 /*break*/, 5];
            }
            return [3 /*break*/, 7];
          case 1:
            return [4 /*yield*/, this.handlePaymentIntentSucceeded(event.data.object)];
          case 2:
            _b.sent();
            return [3 /*break*/, 8];
          case 3:
            return [4 /*yield*/, this.handlePaymentIntentFailed(event.data.object)];
          case 4:
            _b.sent();
            return [3 /*break*/, 8];
          case 5:
            return [4 /*yield*/, this.handlePaymentIntentCanceled(event.data.object)];
          case 6:
            _b.sent();
            return [3 /*break*/, 8];
          case 7:
            console.log("Unhandled event type: ".concat(event.type));
            _b.label = 8;
          case 8:
            return [3 /*break*/, 10];
          case 9:
            error_7 = _b.sent();
            console.error("Error handling webhook event:", error_7);
            throw error_7;
          case 10:
            return [2 /*return*/];
        }
      });
    });
  };
  InstallmentProcessor.prototype.handlePaymentIntentSucceeded = function (paymentIntent) {
    return __awaiter(this, void 0, void 0, function () {
      var installmentId;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            installmentId = paymentIntent.metadata.installment_id;
            if (!installmentId) return [3 /*break*/, 2];
            return [
              4 /*yield*/,
              this.markInstallmentAsPaid(installmentId, paymentIntent.id, "stripe"),
            ];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            return [2 /*return*/];
        }
      });
    });
  };
  InstallmentProcessor.prototype.handlePaymentIntentFailed = function (paymentIntent) {
    return __awaiter(this, void 0, void 0, function () {
      var installmentId, error;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            installmentId = paymentIntent.metadata.installment_id;
            if (!installmentId) return [3 /*break*/, 2];
            return [
              4 /*yield*/,
              this.supabase
                .from("installments")
                .update({
                  metadata: __assign(__assign({}, paymentIntent.metadata), {
                    last_payment_error:
                      ((_a = paymentIntent.last_payment_error) === null || _a === void 0
                        ? void 0
                        : _a.message) || "Payment failed",
                    failed_at: new Date().toISOString(),
                  }),
                  updated_at: new Date().toISOString(),
                })
                .eq("id", installmentId),
            ];
          case 1:
            error = _b.sent().error;
            if (error) {
              console.error("Error updating failed installment:", error);
            }
            _b.label = 2;
          case 2:
            return [2 /*return*/];
        }
      });
    });
  };
  InstallmentProcessor.prototype.handlePaymentIntentCanceled = function (paymentIntent) {
    return __awaiter(this, void 0, void 0, function () {
      var installmentId, error;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            installmentId = paymentIntent.metadata.installment_id;
            if (!installmentId) return [3 /*break*/, 2];
            return [
              4 /*yield*/,
              this.supabase
                .from("installments")
                .update({
                  stripe_payment_intent_id: null,
                  metadata: __assign(__assign({}, paymentIntent.metadata), {
                    canceled_at: new Date().toISOString(),
                  }),
                  updated_at: new Date().toISOString(),
                })
                .eq("id", installmentId),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              console.error("Error updating canceled installment:", error);
            }
            _a.label = 2;
          case 2:
            return [2 /*return*/];
        }
      });
    });
  };
  return InstallmentProcessor;
})();
exports.InstallmentProcessor = InstallmentProcessor;
// Export singleton instance
var installmentProcessorInstance = null;
function getInstallmentProcessor() {
  if (!installmentProcessorInstance) {
    installmentProcessorInstance = new InstallmentProcessor({
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      stripeSecretKey: process.env.STRIPE_SECRET_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    });
  }
  return installmentProcessorInstance;
}
exports.default = InstallmentProcessor;
