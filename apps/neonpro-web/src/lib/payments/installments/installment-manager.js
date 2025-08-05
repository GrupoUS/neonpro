// NeonPro - Installment Management Service
// Story 6.1 - Task 3: Installment Management System
// Comprehensive payment plan and installment processing
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
exports.installmentManager = void 0;
exports.getInstallmentManager = getInstallmentManager;
var supabase_js_1 = require("@supabase/supabase-js");
var stripe_1 = require("stripe");
var logger_1 = require("@/lib/utils/logger");
var date_fns_1 = require("date-fns");
var supabase = (0, supabase_js_1.createClient)(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);
var stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});
var InstallmentManager = /** @class */ (() => {
  function InstallmentManager() {}
  // Create new payment plan
  InstallmentManager.prototype.createPaymentPlan = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var _a,
        customer,
        customerError,
        installmentAmount,
        adjustedTotal,
        paymentPlan,
        _b,
        createdPlan,
        planError,
        error_1;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 4, , 5]);
            return [
              4 /*yield*/,
              supabase
                .from("customers")
                .select("id, name, email")
                .eq("id", request.customer_id)
                .single(),
            ];
          case 1:
            (_a = _c.sent()), (customer = _a.data), (customerError = _a.error);
            if (customerError || !customer) {
              throw new Error("Customer not found");
            }
            installmentAmount =
              Math.round((request.total_amount / request.installment_count) * 100) / 100;
            adjustedTotal = installmentAmount * request.installment_count;
            paymentPlan = {
              customer_id: request.customer_id,
              total_amount: adjustedTotal,
              currency: request.currency || "BRL",
              installment_count: request.installment_count,
              installment_amount: installmentAmount,
              frequency: request.frequency,
              start_date: request.start_date,
              status: "active",
              description: request.description,
              metadata: __assign(__assign({}, request.metadata), {
                auto_charge: request.auto_charge || false,
                late_fee_percentage: request.late_fee_percentage || 0,
                grace_period_days: request.grace_period_days || 0,
                created_by: "system",
              }),
            };
            return [
              4 /*yield*/,
              supabase.from("payment_plans").insert(paymentPlan).select().single(),
            ];
          case 2:
            (_b = _c.sent()), (createdPlan = _b.data), (planError = _b.error);
            if (planError) {
              throw new Error("Failed to create payment plan: ".concat(planError.message));
            }
            // Generate installments
            return [4 /*yield*/, this.generateInstallments(createdPlan.id, request)];
          case 3:
            // Generate installments
            _c.sent();
            logger_1.logger.info(
              "Payment plan created: "
                .concat(createdPlan.id, " for customer: ")
                .concat(request.customer_id),
            );
            return [2 /*return*/, createdPlan];
          case 4:
            error_1 = _c.sent();
            logger_1.logger.error("Error creating payment plan:", error_1);
            throw error_1;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  // Generate installments for payment plan
  InstallmentManager.prototype.generateInstallments = function (paymentPlanId, request) {
    return __awaiter(this, void 0, void 0, function () {
      var installments, currentDate, i, installment, error, error_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            installments = [];
            currentDate = (0, date_fns_1.parseISO)(request.start_date);
            for (i = 1; i <= request.installment_count; i++) {
              installment = {
                payment_plan_id: paymentPlanId,
                installment_number: i,
                amount: Math.round((request.total_amount / request.installment_count) * 100) / 100,
                due_date: currentDate.toISOString(),
                status: "pending",
                metadata: {
                  auto_charge: request.auto_charge || false,
                  grace_period_days: request.grace_period_days || 0,
                },
              };
              installments.push(installment);
              // Calculate next due date based on frequency
              switch (request.frequency) {
                case "weekly":
                  currentDate = (0, date_fns_1.addDays)(currentDate, 7);
                  break;
                case "biweekly":
                  currentDate = (0, date_fns_1.addDays)(currentDate, 14);
                  break;
                case "monthly":
                  currentDate = (0, date_fns_1.addMonths)(currentDate, 1);
                  break;
                case "quarterly":
                  currentDate = (0, date_fns_1.addMonths)(currentDate, 3);
                  break;
              }
            }
            return [4 /*yield*/, supabase.from("installments").insert(installments)];
          case 1:
            error = _a.sent().error;
            if (error) {
              throw new Error("Failed to create installments: ".concat(error.message));
            }
            logger_1.logger.info(
              "Generated "
                .concat(installments.length, " installments for payment plan: ")
                .concat(paymentPlanId),
            );
            return [3 /*break*/, 3];
          case 2:
            error_2 = _a.sent();
            logger_1.logger.error("Error generating installments:", error_2);
            throw error_2;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // Process installment payment
  InstallmentManager.prototype.processInstallmentPayment = function (
    installmentId,
    paymentMethodId,
    metadata,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var _a,
        installment,
        installmentError,
        customer,
        totalAmount,
        lateFeePercentage,
        lateFee,
        paymentIntent,
        error_3;
      var _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 8, , 9]);
            return [
              4 /*yield*/,
              supabase
                .from("installments")
                .select(
                  "\n          *,\n          payment_plan:payment_plans(\n            *,\n            customer:customers(*)\n          )\n        ",
                )
                .eq("id", installmentId)
                .single(),
            ];
          case 1:
            (_a = _c.sent()), (installment = _a.data), (installmentError = _a.error);
            if (installmentError || !installment) {
              throw new Error("Installment not found");
            }
            if (installment.status !== "pending" && installment.status !== "overdue") {
              throw new Error("Installment is not payable");
            }
            customer = installment.payment_plan.customer;
            totalAmount = installment.amount;
            if (!(installment.status === "overdue")) return [3 /*break*/, 3];
            lateFeePercentage =
              ((_b = installment.payment_plan.metadata) === null || _b === void 0
                ? void 0
                : _b.late_fee_percentage) || 0;
            if (!(lateFeePercentage > 0)) return [3 /*break*/, 3];
            lateFee = Math.round(((installment.amount * lateFeePercentage) / 100) * 100) / 100;
            totalAmount += lateFee;
            // Update installment with late fee
            return [
              4 /*yield*/,
              supabase.from("installments").update({ late_fee: lateFee }).eq("id", installmentId),
            ];
          case 2:
            // Update installment with late fee
            _c.sent();
            _c.label = 3;
          case 3:
            return [
              4 /*yield*/,
              stripe.paymentIntents.create({
                amount: Math.round(totalAmount * 100), // Convert to cents
                currency: installment.payment_plan.currency.toLowerCase(),
                customer: customer.stripe_customer_id,
                payment_method: paymentMethodId,
                confirmation_method: paymentMethodId ? "automatic" : "manual",
                confirm: !!paymentMethodId,
                metadata: __assign(
                  {
                    installment_id: installmentId,
                    payment_plan_id: installment.payment_plan_id,
                    installment_number: installment.installment_number.toString(),
                  },
                  metadata,
                ),
                description: "Installment "
                  .concat(installment.installment_number, "/")
                  .concat(installment.payment_plan.installment_count, " - ")
                  .concat(installment.payment_plan.description || "Payment Plan"),
              }),
            ];
          case 4:
            paymentIntent = _c.sent();
            // Update installment with payment intent
            return [
              4 /*yield*/,
              supabase
                .from("installments")
                .update({
                  stripe_payment_intent_id: paymentIntent.id,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", installmentId),
            ];
          case 5:
            // Update installment with payment intent
            _c.sent();
            if (!(paymentIntent.status === "succeeded")) return [3 /*break*/, 7];
            return [4 /*yield*/, this.markInstallmentAsPaid(installmentId, paymentIntent.id)];
          case 6:
            _c.sent();
            _c.label = 7;
          case 7:
            logger_1.logger.info("Installment payment processed: ".concat(installmentId));
            return [
              2 /*return*/,
              {
                payment_intent: paymentIntent,
                installment: installment,
                total_amount: totalAmount,
              },
            ];
          case 8:
            error_3 = _c.sent();
            logger_1.logger.error("Error processing installment payment:", error_3);
            throw error_3;
          case 9:
            return [2 /*return*/];
        }
      });
    });
  };
  // Mark installment as paid
  InstallmentManager.prototype.markInstallmentAsPaid = function (
    installmentId,
    paymentIntentId,
    paymentMethod,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var installment, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            // Update installment status
            return [
              4 /*yield*/,
              supabase
                .from("installments")
                .update({
                  status: "paid",
                  paid_date: new Date().toISOString(),
                  stripe_payment_intent_id: paymentIntentId,
                  payment_method: paymentMethod,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", installmentId),
            ];
          case 1:
            // Update installment status
            _a.sent();
            return [
              4 /*yield*/,
              supabase
                .from("installments")
                .select("payment_plan_id")
                .eq("id", installmentId)
                .single(),
            ];
          case 2:
            installment = _a.sent().data;
            if (!installment) return [3 /*break*/, 4];
            return [4 /*yield*/, this.checkPaymentPlanCompletion(installment.payment_plan_id)];
          case 3:
            _a.sent();
            _a.label = 4;
          case 4:
            logger_1.logger.info("Installment marked as paid: ".concat(installmentId));
            return [3 /*break*/, 6];
          case 5:
            error_4 = _a.sent();
            logger_1.logger.error("Error marking installment as paid:", error_4);
            throw error_4;
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  // Check if payment plan is completed
  InstallmentManager.prototype.checkPaymentPlanCompletion = function (paymentPlanId) {
    return __awaiter(this, void 0, void 0, function () {
      var installments, error_5;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [
              4 /*yield*/,
              supabase.from("installments").select("status").eq("payment_plan_id", paymentPlanId),
            ];
          case 1:
            installments = _a.sent().data;
            if (!(installments && installments.every((inst) => inst.status === "paid")))
              return [3 /*break*/, 3];
            return [
              4 /*yield*/,
              supabase
                .from("payment_plans")
                .update({
                  status: "completed",
                  completed_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .eq("id", paymentPlanId),
            ];
          case 2:
            _a.sent();
            logger_1.logger.info("Payment plan completed: ".concat(paymentPlanId));
            _a.label = 3;
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_5 = _a.sent();
            logger_1.logger.error("Error checking payment plan completion:", error_5);
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  // Get overdue installments
  InstallmentManager.prototype.getOverdueInstallments = function () {
    return __awaiter(this, arguments, void 0, function (gracePeriodDays) {
      var cutoffDate, _a, overdueInstallments, error, error_6;
      if (gracePeriodDays === void 0) {
        gracePeriodDays = 0;
      }
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            cutoffDate = (0, date_fns_1.addDays)(new Date(), -gracePeriodDays).toISOString();
            return [
              4 /*yield*/,
              supabase
                .from("installments")
                .select(
                  "\n          *,\n          payment_plan:payment_plans(\n            *,\n            customer:customers(*)\n          )\n        ",
                )
                .eq("status", "pending")
                .lt("due_date", cutoffDate)
                .order("due_date", { ascending: true }),
            ];
          case 1:
            (_a = _b.sent()), (overdueInstallments = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to get overdue installments: ".concat(error.message));
            }
            return [2 /*return*/, overdueInstallments || []];
          case 2:
            error_6 = _b.sent();
            logger_1.logger.error("Error getting overdue installments:", error_6);
            throw error_6;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // Mark installments as overdue
  InstallmentManager.prototype.markInstallmentsAsOverdue = function () {
    return __awaiter(this, void 0, void 0, function () {
      var overdueInstallments, installmentIds, error, error_7;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, this.getOverdueInstallments()];
          case 1:
            overdueInstallments = _a.sent();
            if (overdueInstallments.length === 0) {
              return [2 /*return*/, 0];
            }
            installmentIds = overdueInstallments.map((inst) => inst.id);
            return [
              4 /*yield*/,
              supabase
                .from("installments")
                .update({
                  status: "overdue",
                  updated_at: new Date().toISOString(),
                })
                .in("id", installmentIds),
            ];
          case 2:
            error = _a.sent().error;
            if (error) {
              throw new Error("Failed to mark installments as overdue: ".concat(error.message));
            }
            logger_1.logger.info(
              "Marked ".concat(overdueInstallments.length, " installments as overdue"),
            );
            return [2 /*return*/, overdueInstallments.length];
          case 3:
            error_7 = _a.sent();
            logger_1.logger.error("Error marking installments as overdue:", error_7);
            throw error_7;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  // Modify payment plan
  InstallmentManager.prototype.modifyPaymentPlan = function (paymentPlanId, modifications) {
    return __awaiter(this, void 0, void 0, function () {
      var _a,
        currentPlan,
        planError,
        paidInstallments,
        paidCount,
        paidAmount,
        remainingAmount,
        remainingInstallments,
        newInstallmentAmount,
        lastPaidInstallment,
        nextDueDate,
        newInstallments,
        i,
        updatedPlan,
        _b,
        result,
        updateError,
        error_8;
      return __generator(this, (_c) => {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 8, , 9]);
            return [
              4 /*yield*/,
              supabase.from("payment_plans").select("*").eq("id", paymentPlanId).single(),
            ];
          case 1:
            (_a = _c.sent()), (currentPlan = _a.data), (planError = _a.error);
            if (planError || !currentPlan) {
              throw new Error("Payment plan not found");
            }
            if (currentPlan.status !== "active") {
              throw new Error("Can only modify active payment plans");
            }
            return [
              4 /*yield*/,
              supabase
                .from("installments")
                .select("id")
                .eq("payment_plan_id", paymentPlanId)
                .eq("status", "paid"),
            ];
          case 2:
            paidInstallments = _c.sent().data;
            paidCount =
              (paidInstallments === null || paidInstallments === void 0
                ? void 0
                : paidInstallments.length) || 0;
            if (
              !(
                modifications.installment_count &&
                modifications.installment_count !== currentPlan.installment_count
              )
            )
              return [3 /*break*/, 6];
            if (paidCount >= modifications.installment_count) {
              throw new Error("Cannot reduce installment count below paid installments");
            }
            // Cancel pending installments
            return [
              4 /*yield*/,
              supabase
                .from("installments")
                .update({ status: "cancelled" })
                .eq("payment_plan_id", paymentPlanId)
                .eq("status", "pending"),
            ];
          case 3:
            // Cancel pending installments
            _c.sent();
            paidAmount = paidCount * currentPlan.installment_amount;
            remainingAmount = currentPlan.total_amount - paidAmount;
            remainingInstallments = modifications.installment_count - paidCount;
            newInstallmentAmount =
              Math.round((remainingAmount / remainingInstallments) * 100) / 100;
            return [
              4 /*yield*/,
              supabase
                .from("installments")
                .select("due_date")
                .eq("payment_plan_id", paymentPlanId)
                .eq("status", "paid")
                .order("installment_number", { ascending: false })
                .limit(1)
                .single(),
            ];
          case 4:
            lastPaidInstallment = _c.sent().data;
            nextDueDate = lastPaidInstallment
              ? (0, date_fns_1.parseISO)(lastPaidInstallment.due_date)
              : (0, date_fns_1.parseISO)(currentPlan.start_date);
            // Add frequency interval to get next due date
            switch (modifications.frequency || currentPlan.frequency) {
              case "weekly":
                nextDueDate = (0, date_fns_1.addDays)(nextDueDate, 7);
                break;
              case "biweekly":
                nextDueDate = (0, date_fns_1.addDays)(nextDueDate, 14);
                break;
              case "monthly":
                nextDueDate = (0, date_fns_1.addMonths)(nextDueDate, 1);
                break;
              case "quarterly":
                nextDueDate = (0, date_fns_1.addMonths)(nextDueDate, 3);
                break;
            }
            newInstallments = [];
            for (i = paidCount + 1; i <= modifications.installment_count; i++) {
              newInstallments.push({
                payment_plan_id: paymentPlanId,
                installment_number: i,
                amount: newInstallmentAmount,
                due_date: nextDueDate.toISOString(),
                status: "pending",
                metadata: currentPlan.metadata,
              });
              // Calculate next due date
              switch (modifications.frequency || currentPlan.frequency) {
                case "weekly":
                  nextDueDate = (0, date_fns_1.addDays)(nextDueDate, 7);
                  break;
                case "biweekly":
                  nextDueDate = (0, date_fns_1.addDays)(nextDueDate, 14);
                  break;
                case "monthly":
                  nextDueDate = (0, date_fns_1.addMonths)(nextDueDate, 1);
                  break;
                case "quarterly":
                  nextDueDate = (0, date_fns_1.addMonths)(nextDueDate, 3);
                  break;
              }
            }
            return [4 /*yield*/, supabase.from("installments").insert(newInstallments)];
          case 5:
            _c.sent();
            _c.label = 6;
          case 6:
            updatedPlan = __assign(__assign(__assign({}, currentPlan), modifications), {
              metadata: __assign(
                __assign(__assign({}, currentPlan.metadata), modifications.metadata),
                { modified_at: new Date().toISOString() },
              ),
              updated_at: new Date().toISOString(),
            });
            return [
              4 /*yield*/,
              supabase
                .from("payment_plans")
                .update(updatedPlan)
                .eq("id", paymentPlanId)
                .select()
                .single(),
            ];
          case 7:
            (_b = _c.sent()), (result = _b.data), (updateError = _b.error);
            if (updateError) {
              throw new Error("Failed to update payment plan: ".concat(updateError.message));
            }
            logger_1.logger.info("Payment plan modified: ".concat(paymentPlanId));
            return [2 /*return*/, result];
          case 8:
            error_8 = _c.sent();
            logger_1.logger.error("Error modifying payment plan:", error_8);
            throw error_8;
          case 9:
            return [2 /*return*/];
        }
      });
    });
  };
  // Cancel payment plan
  InstallmentManager.prototype.cancelPaymentPlan = function (paymentPlanId, reason) {
    return __awaiter(this, void 0, void 0, function () {
      var error_9;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            // Update payment plan status
            return [
              4 /*yield*/,
              supabase
                .from("payment_plans")
                .update({
                  status: "cancelled",
                  cancelled_at: new Date().toISOString(),
                  metadata: {
                    cancellation_reason: reason || "Manual cancellation",
                  },
                  updated_at: new Date().toISOString(),
                })
                .eq("id", paymentPlanId),
            ];
          case 1:
            // Update payment plan status
            _a.sent();
            // Cancel pending installments
            return [
              4 /*yield*/,
              supabase
                .from("installments")
                .update({
                  status: "cancelled",
                  updated_at: new Date().toISOString(),
                })
                .eq("payment_plan_id", paymentPlanId)
                .in("status", ["pending", "overdue"]),
            ];
          case 2:
            // Cancel pending installments
            _a.sent();
            logger_1.logger.info("Payment plan cancelled: ".concat(paymentPlanId));
            return [3 /*break*/, 4];
          case 3:
            error_9 = _a.sent();
            logger_1.logger.error("Error cancelling payment plan:", error_9);
            throw error_9;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  // Get payment plan with installments
  InstallmentManager.prototype.getPaymentPlanDetails = function (paymentPlanId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, paymentPlan, error, error_10;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              supabase
                .from("payment_plans")
                .select(
                  "\n          *,\n          customer:customers(*),\n          installments(*)\n        ",
                )
                .eq("id", paymentPlanId)
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (paymentPlan = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to get payment plan: ".concat(error.message));
            }
            return [2 /*return*/, paymentPlan];
          case 2:
            error_10 = _b.sent();
            logger_1.logger.error("Error getting payment plan details:", error_10);
            throw error_10;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // Get customer payment history
  InstallmentManager.prototype.getCustomerPaymentHistory = function (customerId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, paymentPlans, error, error_11;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              supabase
                .from("payment_plans")
                .select("\n          *,\n          installments(*)\n        ")
                .eq("customer_id", customerId)
                .order("created_at", { ascending: false }),
            ];
          case 1:
            (_a = _b.sent()), (paymentPlans = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to get payment history: ".concat(error.message));
            }
            return [2 /*return*/, paymentPlans];
          case 2:
            error_11 = _b.sent();
            logger_1.logger.error("Error getting customer payment history:", error_11);
            throw error_11;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  return InstallmentManager;
})();
exports.installmentManager = new InstallmentManager();
// Factory function for getting the manager instance
function getInstallmentManager() {
  return exports.installmentManager;
}
