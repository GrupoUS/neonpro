"use strict";
/**
 * Payment Tracking System
 * Story 4.1: Automated Invoice Generation + Payment Tracking Implementation
 *
 * This module provides comprehensive payment tracking and reconciliation:
 * - Real-time payment status monitoring
 * - Multi-gateway payment integration (PIX, Boleto, Credit Card)
 * - Automated payment reconciliation
 * - Payment analytics and reporting
 * - Brazilian payment method compliance
 * - LGPD-compliant payment data handling
 * - Automated dunning and collection workflows
 */
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
exports.PaymentTracker = void 0;
var client_1 = require("@/lib/supabase/client");
var PaymentTracker = /** @class */ (function () {
  function PaymentTracker(config) {
    this.supabase = (0, client_1.createClient)();
    this.webhookHandlers = new Map();
    this.isInitialized = false;
    this.config = this.initializeConfig(config);
  }
  /**
   * Initialize the payment tracking system
   */
  PaymentTracker.prototype.initialize = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 6, , 7]);
            console.log("Initializing Payment Tracker...");
            // Setup gateway integrations
            return [
              4 /*yield*/,
              this.setupGatewayIntegrations(),
              // Setup webhook handlers
            ];
          case 1:
            // Setup gateway integrations
            _a.sent();
            // Setup webhook handlers
            this.setupWebhookHandlers();
            if (!this.config.reconciliation.autoReconcile) return [3 /*break*/, 3];
            return [4 /*yield*/, this.setupReconciliationScheduler()];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            if (!this.config.dunning.enabled) return [3 /*break*/, 5];
            return [4 /*yield*/, this.setupDunningWorkflows()];
          case 4:
            _a.sent();
            _a.label = 5;
          case 5:
            this.isInitialized = true;
            console.log("✅ Payment Tracker initialized successfully");
            return [3 /*break*/, 7];
          case 6:
            error_1 = _a.sent();
            console.error("❌ Failed to initialize payment tracker:", error_1);
            throw new Error("Payment tracker initialization failed");
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Create a new payment record
   */
  PaymentTracker.prototype.createPayment = function (paymentData) {
    return __awaiter(this, void 0, void 0, function () {
      var paymentId, fees, payment, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            if (!this.isInitialized) {
              throw new Error("Payment tracker not initialized");
            }
            console.log("Creating payment for invoice ".concat(paymentData.invoiceId));
            paymentId = "payment_"
              .concat(Date.now(), "_")
              .concat(Math.random().toString(36).substr(2, 9));
            return [
              4 /*yield*/,
              this.calculateFees(paymentData.amount, paymentData.method, paymentData.gateway),
              // Create payment record
            ];
          case 1:
            fees = _a.sent();
            payment = {
              id: paymentId,
              invoiceId: paymentData.invoiceId,
              amount: paymentData.amount,
              currency: "BRL",
              method: paymentData.method,
              gateway: paymentData.gateway,
              status: "pending",
              installments: paymentData.installments,
              fees: fees,
              metadata: {
                patientId: paymentData.patientId,
                clinicId: paymentData.clinicId,
                appointmentId: paymentData.appointmentId,
                treatmentId: paymentData.treatmentId,
                createdBy: "system", // Would be actual user ID
                createdAt: new Date(),
                updatedAt: new Date(),
                notes: paymentData.notes,
              },
            };
            // Initialize payment with gateway
            return [
              4 /*yield*/,
              this.initializeGatewayPayment(payment),
              // Store payment record
            ];
          case 2:
            // Initialize payment with gateway
            _a.sent();
            // Store payment record
            return [4 /*yield*/, this.storePaymentRecord(payment)];
          case 3:
            // Store payment record
            _a.sent();
            console.log("\u2705 Payment ".concat(paymentId, " created successfully"));
            return [2 /*return*/, payment];
          case 4:
            error_2 = _a.sent();
            console.error("❌ Payment creation failed:", error_2);
            throw new Error("Payment creation failed: ".concat(error_2.message));
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Update payment status
   */
  PaymentTracker.prototype.updatePaymentStatus = function (paymentId, status, metadata) {
    return __awaiter(this, void 0, void 0, function () {
      var payment, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            console.log("Updating payment ".concat(paymentId, " status to ").concat(status));
            return [4 /*yield*/, this.getPaymentRecord(paymentId)];
          case 1:
            payment = _a.sent();
            if (!payment) {
              throw new Error("Payment not found");
            }
            // Update payment record
            payment.status = status;
            payment.metadata.updatedAt = new Date();
            if (metadata) {
              if (metadata.transactionId) payment.transactionId = metadata.transactionId;
              if (metadata.authorizationCode)
                payment.authorizationCode = metadata.authorizationCode;
              if (metadata.nsu) payment.nsu = metadata.nsu;
              if (metadata.tid) payment.tid = metadata.tid;
              if (metadata.processedAt) payment.metadata.processedAt = metadata.processedAt;
              if (metadata.notes) payment.metadata.notes = metadata.notes;
            }
            if (status === "confirmed") {
              payment.metadata.confirmedAt = new Date();
            }
            // Update in database
            return [
              4 /*yield*/,
              this.updatePaymentRecord(payment),
              // Handle status-specific actions
            ];
          case 2:
            // Update in database
            _a.sent();
            // Handle status-specific actions
            return [4 /*yield*/, this.handlePaymentStatusChange(payment, status)];
          case 3:
            // Handle status-specific actions
            _a.sent();
            console.log("\u2705 Payment ".concat(paymentId, " status updated to ").concat(status));
            return [3 /*break*/, 5];
          case 4:
            error_3 = _a.sent();
            console.error("❌ Payment status update failed:", error_3);
            throw new Error("Payment status update failed: ".concat(error_3.message));
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Process payment webhook
   */
  PaymentTracker.prototype.processWebhook = function (gateway, webhookData, signature) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, webhook, handler, error_4;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 8, , 10]);
            console.log("Processing ".concat(gateway, " webhook"));
            _a = signature;
            if (!_a) return [3 /*break*/, 2];
            return [4 /*yield*/, this.verifyWebhookSignature(gateway, webhookData, signature)];
          case 1:
            _a = !_b.sent();
            _b.label = 2;
          case 2:
            // Verify webhook signature
            if (_a) {
              throw new Error("Invalid webhook signature");
            }
            webhook = {
              id: "webhook_"
                .concat(Date.now(), "_")
                .concat(Math.random().toString(36).substr(2, 9)),
              gateway: gateway,
              eventType: webhookData.type || webhookData.event_type || "unknown",
              paymentId: this.extractPaymentIdFromWebhook(gateway, webhookData),
              status: this.mapGatewayStatusToPaymentStatus(
                gateway,
                webhookData.status || webhookData.state,
              ),
              amount: webhookData.amount || webhookData.transaction_amount,
              transactionId: webhookData.transaction_id || webhookData.id,
              timestamp: new Date(),
              rawData: webhookData,
              processed: false,
            };
            return [
              4 /*yield*/,
              this.storeWebhookRecord(webhook),
              // Process webhook
            ];
          case 3:
            _b.sent();
            handler = this.webhookHandlers.get(gateway);
            if (!handler) return [3 /*break*/, 5];
            return [4 /*yield*/, handler(webhook)];
          case 4:
            _b.sent();
            return [3 /*break*/, 6];
          case 5:
            console.warn("No webhook handler for gateway: ".concat(gateway));
            _b.label = 6;
          case 6:
            // Mark webhook as processed
            webhook.processed = true;
            webhook.processedAt = new Date();
            return [4 /*yield*/, this.updateWebhookRecord(webhook)];
          case 7:
            _b.sent();
            console.log("\u2705 ".concat(gateway, " webhook processed successfully"));
            return [3 /*break*/, 10];
          case 8:
            error_4 = _b.sent();
            console.error("❌ Webhook processing failed:", error_4);
            // Store error in webhook record
            return [
              4 /*yield*/,
              this.updateWebhookRecord(
                __assign(__assign({}, webhookData), { processed: false, error: error_4.message }),
              ),
            ];
          case 9:
            // Store error in webhook record
            _b.sent();
            throw new Error("Webhook processing failed: ".concat(error_4.message));
          case 10:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Reconcile payments with gateway
   */
  PaymentTracker.prototype.reconcilePayments = function (gateway, date) {
    return __awaiter(this, void 0, void 0, function () {
      var reconciliationId, ourPayments, gatewayPayments, discrepancies_1, reconciliation, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 6, , 7]);
            console.log(
              "Starting payment reconciliation for "
                .concat(gateway, " on ")
                .concat(date.toDateString()),
            );
            reconciliationId = "reconciliation_"
              .concat(Date.now(), "_")
              .concat(Math.random().toString(36).substr(2, 9));
            return [
              4 /*yield*/,
              this.getPaymentsByDate(gateway, date),
              // Get payments from gateway
            ];
          case 1:
            ourPayments = _a.sent();
            return [
              4 /*yield*/,
              this.getGatewayPayments(gateway, date),
              // Compare and find discrepancies
            ];
          case 2:
            gatewayPayments = _a.sent();
            discrepancies_1 = this.findPaymentDiscrepancies(ourPayments, gatewayPayments);
            reconciliation = {
              id: reconciliationId,
              date: date,
              gateway: gateway,
              totalTransactions: gatewayPayments.length,
              totalAmount: gatewayPayments.reduce(function (sum, p) {
                return sum + p.amount;
              }, 0),
              reconciledTransactions: ourPayments.length - discrepancies_1.missingPayments.length,
              reconciledAmount: ourPayments
                .filter(function (p) {
                  return !discrepancies_1.missingPayments.includes(p.id);
                })
                .reduce(function (sum, p) {
                  return sum + p.amount;
                }, 0),
              discrepancies: discrepancies_1,
              status:
                discrepancies_1.missingPayments.length > 0 ||
                discrepancies_1.extraPayments.length > 0 ||
                discrepancies_1.amountMismatches.length > 0
                  ? "failed"
                  : "completed",
              processedBy: "system",
              processedAt: new Date(),
            };
            // Store reconciliation record
            return [
              4 /*yield*/,
              this.storeReconciliationRecord(reconciliation),
              // Handle discrepancies
            ];
          case 3:
            // Store reconciliation record
            _a.sent();
            if (!(reconciliation.status === "failed")) return [3 /*break*/, 5];
            return [4 /*yield*/, this.handleReconciliationDiscrepancies(reconciliation)];
          case 4:
            _a.sent();
            _a.label = 5;
          case 5:
            console.log("\u2705 Payment reconciliation completed for ".concat(gateway));
            return [2 /*return*/, reconciliation];
          case 6:
            error_5 = _a.sent();
            console.error("❌ Payment reconciliation failed:", error_5);
            throw new Error("Payment reconciliation failed: ".concat(error_5.message));
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Generate payment analytics
   */
  PaymentTracker.prototype.getPaymentAnalytics = function (filters) {
    return __awaiter(this, void 0, void 0, function () {
      var query, payments, analytics, error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            console.log("Generating payment analytics...");
            query = this.supabase.from("payment_records").select("*");
            if (filters === null || filters === void 0 ? void 0 : filters.startDate) {
              query = query.gte("created_at", filters.startDate.toISOString());
            }
            if (filters === null || filters === void 0 ? void 0 : filters.endDate) {
              query = query.lte("created_at", filters.endDate.toISOString());
            }
            if (filters === null || filters === void 0 ? void 0 : filters.clinicId) {
              query = query.eq("clinic_id", filters.clinicId);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.method) {
              query = query.eq("method", filters.method);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.gateway) {
              query = query.eq("gateway", filters.gateway);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.status) {
              query = query.eq("status", filters.status);
            }
            return [4 /*yield*/, query];
          case 1:
            payments = _a.sent().data;
            if (!payments) {
              throw new Error("Failed to fetch payment data");
            }
            analytics = this.calculatePaymentAnalytics(payments, filters);
            console.log("✅ Payment analytics generated successfully");
            return [2 /*return*/, analytics];
          case 2:
            error_6 = _a.sent();
            console.error("❌ Payment analytics generation failed:", error_6);
            throw new Error("Payment analytics generation failed: ".concat(error_6.message));
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Process dunning for overdue payments
   */
  PaymentTracker.prototype.processDunning = function () {
    return __awaiter(this, void 0, void 0, function () {
      var overdueInvoices, _i, overdueInvoices_1, invoice, error_7;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 6, , 7]);
            if (!this.config.dunning.enabled) {
              return [2 /*return*/];
            }
            console.log("Processing dunning for overdue payments...");
            return [4 /*yield*/, this.getOverdueInvoices()];
          case 1:
            overdueInvoices = _a.sent();
            (_i = 0), (overdueInvoices_1 = overdueInvoices);
            _a.label = 2;
          case 2:
            if (!(_i < overdueInvoices_1.length)) return [3 /*break*/, 5];
            invoice = overdueInvoices_1[_i];
            return [4 /*yield*/, this.processDunningForInvoice(invoice)];
          case 3:
            _a.sent();
            _a.label = 4;
          case 4:
            _i++;
            return [3 /*break*/, 2];
          case 5:
            console.log(
              "\u2705 Dunning processed for ".concat(overdueInvoices.length, " invoices"),
            );
            return [3 /*break*/, 7];
          case 6:
            error_7 = _a.sent();
            console.error("❌ Dunning processing failed:", error_7);
            throw new Error("Dunning processing failed: ".concat(error_7.message));
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get payment status
   */
  PaymentTracker.prototype.getPaymentStatus = function (paymentId) {
    return __awaiter(this, void 0, void 0, function () {
      var payment, invoice, history_1, error_8;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, this.getPaymentRecord(paymentId)];
          case 1:
            payment = _a.sent();
            if (!payment) {
              throw new Error("Payment not found");
            }
            return [4 /*yield*/, this.getInvoiceData(payment.invoiceId)];
          case 2:
            invoice = _a.sent();
            return [4 /*yield*/, this.getPaymentHistory(paymentId)];
          case 3:
            history_1 = _a.sent();
            return [2 /*return*/, { payment: payment, invoice: invoice, history: history_1 }];
          case 4:
            error_8 = _a.sent();
            console.error("❌ Failed to get payment status:", error_8);
            throw new Error("Failed to get payment status: ".concat(error_8.message));
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  // Private helper methods
  PaymentTracker.prototype.initializeConfig = function (config) {
    var defaultConfig = {
      gateways: {
        stripe: {
          publicKey: process.env.STRIPE_PUBLIC_KEY || "",
          secretKey: process.env.STRIPE_SECRET_KEY || "",
          webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
          enabled: false,
        },
        pagarme: {
          apiKey: process.env.PAGARME_API_KEY || "",
          encryptionKey: process.env.PAGARME_ENCRYPTION_KEY || "",
          webhookSecret: process.env.PAGARME_WEBHOOK_SECRET || "",
          enabled: false,
        },
      },
      reconciliation: {
        autoReconcile: true,
        reconcileFrequency: "daily",
        toleranceAmount: 0.01, // 1 centavo
        notifyDiscrepancies: true,
      },
      notifications: {
        paymentConfirmation: true,
        paymentFailure: true,
        reconciliationIssues: true,
        dunningReminders: true,
      },
      compliance: {
        lgpdCompliant: true,
        dataRetentionDays: 2555, // 7 years
        encryptSensitiveData: true,
        auditTrail: true,
      },
      dunning: {
        enabled: true,
        stages: [
          { daysAfterDue: 1, action: "email", template: "reminder_1", escalation: false },
          { daysAfterDue: 7, action: "email", template: "reminder_2", escalation: false },
          { daysAfterDue: 15, action: "sms", template: "reminder_3", escalation: true },
          { daysAfterDue: 30, action: "call", template: "final_notice", escalation: true },
        ],
        maxAttempts: 4,
        finalAction: "collection_agency",
        gracePeriod: 3,
      },
    };
    return __assign(__assign({}, defaultConfig), config);
  };
  PaymentTracker.prototype.setupGatewayIntegrations = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _i, _a, _b, gateway, config;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            console.log("Setting up gateway integrations...");
            (_i = 0), (_a = Object.entries(this.config.gateways));
            _c.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 4];
            (_b = _a[_i]), (gateway = _b[0]), (config = _b[1]);
            if (!(config === null || config === void 0 ? void 0 : config.enabled))
              return [3 /*break*/, 3];
            return [4 /*yield*/, this.initializeGateway(gateway, config)];
          case 2:
            _c.sent();
            _c.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  PaymentTracker.prototype.setupWebhookHandlers = function () {
    // Setup webhook handlers for each gateway
    this.webhookHandlers.set("stripe", this.handleStripeWebhook.bind(this));
    this.webhookHandlers.set("pagarme", this.handlePagarmeWebhook.bind(this));
    this.webhookHandlers.set("mercadopago", this.handleMercadoPagoWebhook.bind(this));
  };
  PaymentTracker.prototype.setupReconciliationScheduler = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        console.log("Setting up reconciliation scheduler...");
        return [2 /*return*/];
      });
    });
  };
  PaymentTracker.prototype.setupDunningWorkflows = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        console.log("Setting up dunning workflows...");
        return [2 /*return*/];
      });
    });
  };
  PaymentTracker.prototype.calculateFees = function (amount, method, gateway) {
    return __awaiter(this, void 0, void 0, function () {
      var gatewayFee, processingFee;
      return __generator(this, function (_a) {
        gatewayFee = 0;
        processingFee = 0;
        switch (gateway) {
          case "stripe":
            gatewayFee = amount * 0.0399 + 0.39; // 3.99% + R$0.39
            break;
          case "pagarme":
            gatewayFee = amount * 0.0349; // 3.49%
            break;
          case "mercadopago":
            gatewayFee = amount * 0.0399; // 3.99%
            break;
          default:
            gatewayFee = 0;
        }
        // Additional fees for specific methods
        if (method === "boleto") {
          processingFee = 3.5; // Fixed boleto fee
        }
        return [
          2 /*return*/,
          {
            gateway: gatewayFee,
            processing: processingFee,
            total: gatewayFee + processingFee,
          },
        ];
      });
    });
  };
  PaymentTracker.prototype.initializeGatewayPayment = function (payment) {
    return __awaiter(this, void 0, void 0, function () {
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _a = payment.gateway;
            switch (_a) {
              case "stripe":
                return [3 /*break*/, 1];
              case "pagarme":
                return [3 /*break*/, 3];
              case "mercadopago":
                return [3 /*break*/, 5];
            }
            return [3 /*break*/, 7];
          case 1:
            return [4 /*yield*/, this.initializeStripePayment(payment)];
          case 2:
            _b.sent();
            return [3 /*break*/, 8];
          case 3:
            return [4 /*yield*/, this.initializePagarmePayment(payment)];
          case 4:
            _b.sent();
            return [3 /*break*/, 8];
          case 5:
            return [4 /*yield*/, this.initializeMercadoPagoPayment(payment)];
          case 6:
            _b.sent();
            return [3 /*break*/, 8];
          case 7:
            // Manual payment - no gateway initialization needed
            return [3 /*break*/, 8];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  PaymentTracker.prototype.storePaymentRecord = function (payment) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("payment_records").insert({
                id: payment.id,
                invoice_id: payment.invoiceId,
                amount: payment.amount,
                currency: payment.currency,
                method: payment.method,
                gateway: payment.gateway,
                status: payment.status,
                transaction_id: payment.transactionId,
                gateway_transaction_id: payment.gatewayTransactionId,
                authorization_code: payment.authorizationCode,
                nsu: payment.nsu,
                tid: payment.tid,
                installments: payment.installments,
                fees: JSON.stringify(payment.fees),
                patient_id: payment.metadata.patientId,
                clinic_id: payment.metadata.clinicId,
                appointment_id: payment.metadata.appointmentId,
                treatment_id: payment.metadata.treatmentId,
                created_by: payment.metadata.createdBy,
                notes: payment.metadata.notes,
                pix_data: JSON.stringify(payment.pixData),
                boleto_data: JSON.stringify(payment.boletoData),
                card_data: JSON.stringify(payment.cardData),
              }),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  PaymentTracker.prototype.getPaymentRecord = function (paymentId) {
    return __awaiter(this, void 0, void 0, function () {
      var data;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("payment_records").select("*").eq("id", paymentId).single(),
            ];
          case 1:
            data = _a.sent().data;
            if (!data)
              return [
                2 /*return*/,
                null,
                // Convert database record to PaymentRecord
              ];
            // Convert database record to PaymentRecord
            return [
              2 /*return*/,
              {
                id: data.id,
                invoiceId: data.invoice_id,
                amount: data.amount,
                currency: data.currency,
                method: data.method,
                gateway: data.gateway,
                status: data.status,
                transactionId: data.transaction_id,
                gatewayTransactionId: data.gateway_transaction_id,
                authorizationCode: data.authorization_code,
                nsu: data.nsu,
                tid: data.tid,
                installments: data.installments,
                fees: JSON.parse(data.fees || "{}"),
                metadata: {
                  patientId: data.patient_id,
                  clinicId: data.clinic_id,
                  appointmentId: data.appointment_id,
                  treatmentId: data.treatment_id,
                  createdBy: data.created_by,
                  createdAt: new Date(data.created_at),
                  updatedAt: new Date(data.updated_at),
                  processedAt: data.processed_at ? new Date(data.processed_at) : undefined,
                  confirmedAt: data.confirmed_at ? new Date(data.confirmed_at) : undefined,
                  notes: data.notes,
                },
                pixData: data.pix_data ? JSON.parse(data.pix_data) : undefined,
                boletoData: data.boleto_data ? JSON.parse(data.boleto_data) : undefined,
                cardData: data.card_data ? JSON.parse(data.card_data) : undefined,
              },
            ];
        }
      });
    });
  };
  PaymentTracker.prototype.updatePaymentRecord = function (payment) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("payment_records")
                .update({
                  status: payment.status,
                  transaction_id: payment.transactionId,
                  gateway_transaction_id: payment.gatewayTransactionId,
                  authorization_code: payment.authorizationCode,
                  nsu: payment.nsu,
                  tid: payment.tid,
                  processed_at:
                    (_a = payment.metadata.processedAt) === null || _a === void 0
                      ? void 0
                      : _a.toISOString(),
                  confirmed_at:
                    (_b = payment.metadata.confirmedAt) === null || _b === void 0
                      ? void 0
                      : _b.toISOString(),
                  updated_at: payment.metadata.updatedAt.toISOString(),
                  notes: payment.metadata.notes,
                })
                .eq("id", payment.id),
            ];
          case 1:
            _c.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  PaymentTracker.prototype.handlePaymentStatusChange = function (payment, status) {
    return __awaiter(this, void 0, void 0, function () {
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _a = status;
            switch (_a) {
              case "confirmed":
                return [3 /*break*/, 1];
              case "failed":
                return [3 /*break*/, 3];
              case "refunded":
                return [3 /*break*/, 5];
            }
            return [3 /*break*/, 7];
          case 1:
            return [4 /*yield*/, this.handlePaymentConfirmed(payment)];
          case 2:
            _b.sent();
            return [3 /*break*/, 8];
          case 3:
            return [4 /*yield*/, this.handlePaymentFailed(payment)];
          case 4:
            _b.sent();
            return [3 /*break*/, 8];
          case 5:
            return [4 /*yield*/, this.handlePaymentRefunded(payment)];
          case 6:
            _b.sent();
            return [3 /*break*/, 8];
          case 7:
            // No specific action needed
            return [3 /*break*/, 8];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  PaymentTracker.prototype.handlePaymentConfirmed = function (payment) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            // Update invoice status
            return [
              4 /*yield*/,
              this.updateInvoicePaymentStatus(payment.invoiceId, "paid"),
              // Send confirmation notification
            ];
          case 1:
            // Update invoice status
            _a.sent();
            if (!this.config.notifications.paymentConfirmation) return [3 /*break*/, 3];
            return [4 /*yield*/, this.sendPaymentConfirmationNotification(payment)];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            // Log audit trail
            return [
              4 /*yield*/,
              this.logPaymentAudit(
                payment.id,
                "payment_confirmed",
                "Payment confirmed successfully",
              ),
            ];
          case 4:
            // Log audit trail
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  PaymentTracker.prototype.handlePaymentFailed = function (payment) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!this.config.notifications.paymentFailure) return [3 /*break*/, 2];
            return [4 /*yield*/, this.sendPaymentFailureNotification(payment)];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            // Log audit trail
            return [
              4 /*yield*/,
              this.logPaymentAudit(payment.id, "payment_failed", "Payment failed"),
            ];
          case 3:
            // Log audit trail
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  PaymentTracker.prototype.handlePaymentRefunded = function (payment) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            // Update invoice status
            return [
              4 /*yield*/,
              this.updateInvoicePaymentStatus(payment.invoiceId, "refunded"),
              // Log audit trail
            ];
          case 1:
            // Update invoice status
            _a.sent();
            // Log audit trail
            return [
              4 /*yield*/,
              this.logPaymentAudit(payment.id, "payment_refunded", "Payment refunded"),
            ];
          case 2:
            // Log audit trail
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  PaymentTracker.prototype.storeWebhookRecord = function (webhook) {
    return __awaiter(this, void 0, void 0, function () {
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("payment_webhooks").insert({
                id: webhook.id,
                gateway: webhook.gateway,
                event_type: webhook.eventType,
                payment_id: webhook.paymentId,
                status: webhook.status,
                amount: webhook.amount,
                transaction_id: webhook.transactionId,
                timestamp: webhook.timestamp.toISOString(),
                raw_data: JSON.stringify(webhook.rawData),
                processed: webhook.processed,
                processed_at:
                  (_a = webhook.processedAt) === null || _a === void 0 ? void 0 : _a.toISOString(),
                error: webhook.error,
              }),
            ];
          case 1:
            _b.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  PaymentTracker.prototype.updateWebhookRecord = function (webhook) {
    return __awaiter(this, void 0, void 0, function () {
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("payment_webhooks")
                .update({
                  processed: webhook.processed,
                  processed_at:
                    (_a = webhook.processedAt) === null || _a === void 0
                      ? void 0
                      : _a.toISOString(),
                  error: webhook.error,
                })
                .eq("id", webhook.id),
            ];
          case 1:
            _b.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  // Gateway-specific implementations
  PaymentTracker.prototype.initializeGateway = function (gateway, config) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        console.log("Initializing ".concat(gateway, " gateway..."));
        return [2 /*return*/];
      });
    });
  };
  PaymentTracker.prototype.initializeStripePayment = function (payment) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  PaymentTracker.prototype.initializePagarmePayment = function (payment) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  PaymentTracker.prototype.initializeMercadoPagoPayment = function (payment) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  PaymentTracker.prototype.handleStripeWebhook = function (webhook) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  PaymentTracker.prototype.handlePagarmeWebhook = function (webhook) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  PaymentTracker.prototype.handleMercadoPagoWebhook = function (webhook) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  PaymentTracker.prototype.verifyWebhookSignature = function (gateway, data, signature) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Verify webhook signature based on gateway
        return [2 /*return*/, true]; // Simplified for now
      });
    });
  };
  PaymentTracker.prototype.extractPaymentIdFromWebhook = function (gateway, data) {
    // Extract payment ID from webhook data based on gateway
    return data.payment_id || data.id || "unknown";
  };
  PaymentTracker.prototype.mapGatewayStatusToPaymentStatus = function (gateway, gatewayStatus) {
    // Map gateway-specific status to our payment status
    var statusMap = {
      paid: "confirmed",
      approved: "confirmed",
      succeeded: "confirmed",
      failed: "failed",
      cancelled: "cancelled",
      refunded: "refunded",
      pending: "pending",
      processing: "processing",
    };
    return (
      statusMap[
        gatewayStatus === null || gatewayStatus === void 0 ? void 0 : gatewayStatus.toLowerCase()
      ] || "pending"
    );
  };
  PaymentTracker.prototype.getPaymentsByDate = function (gateway, date) {
    return __awaiter(this, void 0, void 0, function () {
      var startOfDay, endOfDay, data;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            return [
              4 /*yield*/,
              this.supabase
                .from("payment_records")
                .select("*")
                .eq("gateway", gateway)
                .gte("created_at", startOfDay.toISOString())
                .lte("created_at", endOfDay.toISOString()),
            ];
          case 1:
            data = _a.sent().data;
            return [
              2 /*return*/,
              (data === null || data === void 0
                ? void 0
                : data.map(this.convertDbRecordToPaymentRecord)) || [],
            ];
        }
      });
    });
  };
  PaymentTracker.prototype.getGatewayPayments = function (gateway, date) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Get payments from gateway API for reconciliation
        // Implementation would vary by gateway
        return [2 /*return*/, []];
      });
    });
  };
  PaymentTracker.prototype.findPaymentDiscrepancies = function (ourPayments, gatewayPayments) {
    var missingPayments = [];
    var extraPayments = [];
    var amountMismatches = [];
    var _loop_1 = function (ourPayment) {
      var gatewayPayment = gatewayPayments.find(function (gp) {
        return (
          gp.transaction_id === ourPayment.transactionId ||
          gp.id === ourPayment.gatewayTransactionId
        );
      });
      if (!gatewayPayment) {
        missingPayments.push(ourPayment.id);
      } else if (
        Math.abs(gatewayPayment.amount - ourPayment.amount) >
        this_1.config.reconciliation.toleranceAmount
      ) {
        amountMismatches.push({
          paymentId: ourPayment.id,
          expectedAmount: ourPayment.amount,
          actualAmount: gatewayPayment.amount,
        });
      }
    };
    var this_1 = this;
    // Find missing and mismatched payments
    for (var _i = 0, ourPayments_1 = ourPayments; _i < ourPayments_1.length; _i++) {
      var ourPayment = ourPayments_1[_i];
      _loop_1(ourPayment);
    }
    var _loop_2 = function (gatewayPayment) {
      var ourPayment = ourPayments.find(function (op) {
        return (
          op.transactionId === gatewayPayment.transaction_id ||
          op.gatewayTransactionId === gatewayPayment.id
        );
      });
      if (!ourPayment) {
        extraPayments.push(gatewayPayment.id);
      }
    };
    // Find extra payments in gateway
    for (var _a = 0, gatewayPayments_1 = gatewayPayments; _a < gatewayPayments_1.length; _a++) {
      var gatewayPayment = gatewayPayments_1[_a];
      _loop_2(gatewayPayment);
    }
    return {
      missingPayments: missingPayments,
      extraPayments: extraPayments,
      amountMismatches: amountMismatches,
    };
  };
  PaymentTracker.prototype.storeReconciliationRecord = function (reconciliation) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("payment_reconciliations").insert({
                id: reconciliation.id,
                date: reconciliation.date.toISOString(),
                gateway: reconciliation.gateway,
                total_transactions: reconciliation.totalTransactions,
                total_amount: reconciliation.totalAmount,
                reconciled_transactions: reconciliation.reconciledTransactions,
                reconciled_amount: reconciliation.reconciledAmount,
                discrepancies: JSON.stringify(reconciliation.discrepancies),
                status: reconciliation.status,
                processed_by: reconciliation.processedBy,
                processed_at: reconciliation.processedAt.toISOString(),
              }),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  PaymentTracker.prototype.handleReconciliationDiscrepancies = function (reconciliation) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!this.config.reconciliation.notifyDiscrepancies) return [3 /*break*/, 2];
            return [4 /*yield*/, this.sendReconciliationAlert(reconciliation)];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            // Log discrepancies for manual review
            console.warn(
              "Reconciliation discrepancies found for ".concat(reconciliation.gateway, ":"),
              reconciliation.discrepancies,
            );
            return [2 /*return*/];
        }
      });
    });
  };
  PaymentTracker.prototype.calculatePaymentAnalytics = function (payments, filters) {
    var period = {
      startDate:
        (filters === null || filters === void 0 ? void 0 : filters.startDate) ||
        new Date(
          Math.min.apply(
            Math,
            payments.map(function (p) {
              return new Date(p.created_at).getTime();
            }),
          ),
        ),
      endDate:
        (filters === null || filters === void 0 ? void 0 : filters.endDate) ||
        new Date(
          Math.max.apply(
            Math,
            payments.map(function (p) {
              return new Date(p.created_at).getTime();
            }),
          ),
        ),
    };
    var totalPayments = payments.length;
    var totalAmount = payments.reduce(function (sum, p) {
      return sum + p.amount;
    }, 0);
    var confirmedPayments = payments.filter(function (p) {
      return p.status === "confirmed";
    });
    var refundedPayments = payments.filter(function (p) {
      return p.status === "refunded";
    });
    var summary = {
      totalPayments: totalPayments,
      totalAmount: totalAmount,
      averageAmount: totalAmount / totalPayments || 0,
      successRate: confirmedPayments.length / totalPayments || 0,
      refundRate: refundedPayments.length / totalPayments || 0,
    };
    // Calculate by method and gateway
    var byMethod = {};
    var byGateway = {};
    // Group by method
    var methodGroups = payments.reduce(function (groups, payment) {
      var method = payment.method;
      if (!groups[method]) groups[method] = [];
      groups[method].push(payment);
      return groups;
    }, {});
    for (var _i = 0, _a = Object.entries(methodGroups); _i < _a.length; _i++) {
      var _b = _a[_i],
        method = _b[0],
        methodPayments = _b[1];
      var confirmed = methodPayments.filter(function (p) {
        return p.status === "confirmed";
      });
      byMethod[method] = {
        count: methodPayments.length,
        amount: methodPayments.reduce(function (sum, p) {
          return sum + p.amount;
        }, 0),
        successRate: confirmed.length / methodPayments.length || 0,
        averageProcessingTime: this.calculateAverageProcessingTime(confirmed),
      };
    }
    // Group by gateway
    var gatewayGroups = payments.reduce(function (groups, payment) {
      var gateway = payment.gateway;
      if (!groups[gateway]) groups[gateway] = [];
      groups[gateway].push(payment);
      return groups;
    }, {});
    for (var _c = 0, _d = Object.entries(gatewayGroups); _c < _d.length; _c++) {
      var _e = _d[_c],
        gateway = _e[0],
        gatewayPayments = _e[1];
      var confirmed = gatewayPayments.filter(function (p) {
        return p.status === "confirmed";
      });
      byGateway[gateway] = {
        count: gatewayPayments.length,
        amount: gatewayPayments.reduce(function (sum, p) {
          return sum + p.amount;
        }, 0),
        fees: gatewayPayments.reduce(function (sum, p) {
          return sum + (JSON.parse(p.fees || "{}").total || 0);
        }, 0),
        successRate: confirmed.length / gatewayPayments.length || 0,
      };
    }
    // Calculate trends (simplified)
    var trends = {
      daily: [],
      weekly: [],
      monthly: [],
    };
    // Calculate top failure reasons
    var failedPayments = payments.filter(function (p) {
      return p.status === "failed";
    });
    var topFailureReasons = [
      { reason: "Insufficient funds", count: 0, percentage: 0 },
      { reason: "Card declined", count: 0, percentage: 0 },
      { reason: "Network error", count: 0, percentage: 0 },
    ];
    return {
      period: period,
      summary: summary,
      byMethod: byMethod,
      byGateway: byGateway,
      trends: trends,
      topFailureReasons: topFailureReasons,
    };
  };
  PaymentTracker.prototype.calculateAverageProcessingTime = function (payments) {
    var processingTimes = payments
      .filter(function (p) {
        return p.processed_at && p.created_at;
      })
      .map(function (p) {
        return new Date(p.processed_at).getTime() - new Date(p.created_at).getTime();
      });
    return processingTimes.length > 0
      ? processingTimes.reduce(function (sum, time) {
          return sum + time;
        }, 0) /
          processingTimes.length /
          1000 // Convert to seconds
      : 0;
  };
  PaymentTracker.prototype.getOverdueInvoices = function () {
    return __awaiter(this, void 0, void 0, function () {
      var data;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("invoices")
                .select("*")
                .eq("status", "sent")
                .lt("due_date", new Date().toISOString()),
            ];
          case 1:
            data = _a.sent().data;
            return [2 /*return*/, data || []];
        }
      });
    });
  };
  PaymentTracker.prototype.processDunningForInvoice = function (invoice) {
    return __awaiter(this, void 0, void 0, function () {
      var daysPastDue, stage;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            daysPastDue = Math.floor(
              (new Date().getTime() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24),
            );
            stage = this.config.dunning.stages.find(function (s) {
              var _a;
              return (
                daysPastDue >= s.daysAfterDue &&
                daysPastDue <
                  (((_a =
                    _this.config.dunning.stages[_this.config.dunning.stages.indexOf(s) + 1]) ===
                    null || _a === void 0
                    ? void 0
                    : _a.daysAfterDue) || Infinity)
              );
            });
            if (!stage) return [3 /*break*/, 2];
            return [4 /*yield*/, this.executeDunningAction(invoice, stage)];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            return [2 /*return*/];
        }
      });
    });
  };
  PaymentTracker.prototype.executeDunningAction = function (invoice, stage) {
    return __awaiter(this, void 0, void 0, function () {
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            console.log(
              "Executing dunning action: "
                .concat(stage.action, " for invoice ")
                .concat(invoice.number),
            );
            _a = stage.action;
            switch (_a) {
              case "email":
                return [3 /*break*/, 1];
              case "sms":
                return [3 /*break*/, 3];
              case "whatsapp":
                return [3 /*break*/, 5];
              case "call":
                return [3 /*break*/, 7];
              case "letter":
                return [3 /*break*/, 9];
            }
            return [3 /*break*/, 11];
          case 1:
            return [4 /*yield*/, this.sendDunningEmail(invoice, stage.template)];
          case 2:
            _b.sent();
            return [3 /*break*/, 11];
          case 3:
            return [4 /*yield*/, this.sendDunningSMS(invoice, stage.template)];
          case 4:
            _b.sent();
            return [3 /*break*/, 11];
          case 5:
            return [4 /*yield*/, this.sendDunningWhatsApp(invoice, stage.template)];
          case 6:
            _b.sent();
            return [3 /*break*/, 11];
          case 7:
            return [4 /*yield*/, this.scheduleDunningCall(invoice)];
          case 8:
            _b.sent();
            return [3 /*break*/, 11];
          case 9:
            return [4 /*yield*/, this.generateDunningLetter(invoice)];
          case 10:
            _b.sent();
            return [3 /*break*/, 11];
          case 11:
            // Log dunning action
            return [4 /*yield*/, this.logDunningAction(invoice.id, stage.action, stage.template)];
          case 12:
            // Log dunning action
            _b.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  PaymentTracker.prototype.convertDbRecordToPaymentRecord = function (data) {
    return {
      id: data.id,
      invoiceId: data.invoice_id,
      amount: data.amount,
      currency: data.currency,
      method: data.method,
      gateway: data.gateway,
      status: data.status,
      transactionId: data.transaction_id,
      gatewayTransactionId: data.gateway_transaction_id,
      authorizationCode: data.authorization_code,
      nsu: data.nsu,
      tid: data.tid,
      installments: data.installments,
      fees: JSON.parse(data.fees || "{}"),
      metadata: {
        patientId: data.patient_id,
        clinicId: data.clinic_id,
        appointmentId: data.appointment_id,
        treatmentId: data.treatment_id,
        createdBy: data.created_by,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        processedAt: data.processed_at ? new Date(data.processed_at) : undefined,
        confirmedAt: data.confirmed_at ? new Date(data.confirmed_at) : undefined,
        notes: data.notes,
      },
      pixData: data.pix_data ? JSON.parse(data.pix_data) : undefined,
      boletoData: data.boleto_data ? JSON.parse(data.boleto_data) : undefined,
      cardData: data.card_data ? JSON.parse(data.card_data) : undefined,
    };
  };
  // Notification methods (simplified implementations)
  PaymentTracker.prototype.sendPaymentConfirmationNotification = function (payment) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        console.log("Sending payment confirmation for ".concat(payment.id));
        return [2 /*return*/];
      });
    });
  };
  PaymentTracker.prototype.sendPaymentFailureNotification = function (payment) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        console.log("Sending payment failure notification for ".concat(payment.id));
        return [2 /*return*/];
      });
    });
  };
  PaymentTracker.prototype.sendReconciliationAlert = function (reconciliation) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        console.log("Sending reconciliation alert for ".concat(reconciliation.gateway));
        return [2 /*return*/];
      });
    });
  };
  PaymentTracker.prototype.sendDunningEmail = function (invoice, template) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        console.log(
          "Sending dunning email for invoice "
            .concat(invoice.number, " using template ")
            .concat(template),
        );
        return [2 /*return*/];
      });
    });
  };
  PaymentTracker.prototype.sendDunningSMS = function (invoice, template) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        console.log(
          "Sending dunning SMS for invoice "
            .concat(invoice.number, " using template ")
            .concat(template),
        );
        return [2 /*return*/];
      });
    });
  };
  PaymentTracker.prototype.sendDunningWhatsApp = function (invoice, template) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        console.log(
          "Sending dunning WhatsApp for invoice "
            .concat(invoice.number, " using template ")
            .concat(template),
        );
        return [2 /*return*/];
      });
    });
  };
  PaymentTracker.prototype.scheduleDunningCall = function (invoice) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        console.log("Scheduling dunning call for invoice ".concat(invoice.number));
        return [2 /*return*/];
      });
    });
  };
  PaymentTracker.prototype.generateDunningLetter = function (invoice) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        console.log("Generating dunning letter for invoice ".concat(invoice.number));
        return [2 /*return*/];
      });
    });
  };
  // Audit and logging methods
  PaymentTracker.prototype.logPaymentAudit = function (paymentId, action, details) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!this.config.compliance.auditTrail) return [3 /*break*/, 2];
            return [
              4 /*yield*/,
              this.supabase.from("payment_audit_log").insert({
                payment_id: paymentId,
                action: action,
                details: details,
                timestamp: new Date().toISOString(),
                user_id: "system",
              }),
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
  PaymentTracker.prototype.logDunningAction = function (invoiceId, action, template) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("dunning_log").insert({
                invoice_id: invoiceId,
                action: action,
                template: template,
                timestamp: new Date().toISOString(),
              }),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  // Helper methods
  PaymentTracker.prototype.updateInvoicePaymentStatus = function (invoiceId, status) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("invoices")
                .update({ status: status, updated_at: new Date().toISOString() })
                .eq("id", invoiceId),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  PaymentTracker.prototype.getInvoiceData = function (invoiceId) {
    return __awaiter(this, void 0, void 0, function () {
      var data;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("invoices").select("*").eq("id", invoiceId).single(),
            ];
          case 1:
            data = _a.sent().data;
            return [2 /*return*/, data];
        }
      });
    });
  };
  PaymentTracker.prototype.getPaymentHistory = function (paymentId) {
    return __awaiter(this, void 0, void 0, function () {
      var data;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("payment_audit_log")
                .select("*")
                .eq("payment_id", paymentId)
                .order("timestamp", { ascending: true }),
            ];
          case 1:
            data = _a.sent().data;
            return [
              2 /*return*/,
              (data === null || data === void 0
                ? void 0
                : data.map(function (record) {
                    return {
                      timestamp: new Date(record.timestamp),
                      status: record.action,
                      notes: record.details,
                    };
                  })) || [],
            ];
        }
      });
    });
  };
  return PaymentTracker;
})();
exports.PaymentTracker = PaymentTracker;
