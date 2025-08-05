/**
 * Financial Management System - Main Integration
 * Story 4.1: Automated Invoice Generation + Payment Tracking Implementation
 *
 * This module provides the main integration for the financial management system:
 * - Unified invoice generation and payment tracking
 * - Brazilian compliance (NFSe, PIX, Boleto)
 * - Multi-gateway payment processing
 * - Automated reconciliation and reporting
 * - LGPD-compliant financial data management
 * - Real-time financial analytics and insights
 */
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
exports.FinancialDashboardEngine =
  exports.createpredictiveAnalyticsEngine =
  exports.AutomatedAlertsEngine =
  exports.CashFlowEngine =
  exports.PaymentTracker =
  exports.AutomatedInvoiceGenerator =
  exports.FinancialManagementSystem =
    void 0;
var invoice_generator_1 = require("./invoice-generator");
Object.defineProperty(exports, "AutomatedInvoiceGenerator", {
  enumerable: true,
  get: () => invoice_generator_1.AutomatedInvoiceGenerator,
});
var payment_tracker_1 = require("./payment-tracker");
Object.defineProperty(exports, "PaymentTracker", {
  enumerable: true,
  get: () => payment_tracker_1.PaymentTracker,
});
var client_1 = require("@/lib/supabase/client");
var FinancialManagementSystem = /** @class */ (() => {
  function FinancialManagementSystem(config) {
    this.supabase = (0, client_1.createClient)();
    this.isInitialized = false;
    this.alerts = [];
    this.config = this.initializeConfig(config);
    this.invoiceGenerator = new invoice_generator_1.AutomatedInvoiceGenerator(
      this.config.invoiceGeneration,
    );
    this.paymentTracker = new payment_tracker_1.PaymentTracker(this.config.paymentTracking);
  }
  /**
   * Initialize the financial management system
   */
  FinancialManagementSystem.prototype.initialize = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 8, , 9]);
            console.log("Initializing Financial Management System...");
            // Initialize subsystems
            return [4 /*yield*/, this.invoiceGenerator.initialize()];
          case 1:
            // Initialize subsystems
            _a.sent();
            return [
              4 /*yield*/,
              this.paymentTracker.initialize(),
              // Setup integration workflows
            ];
          case 2:
            _a.sent();
            // Setup integration workflows
            return [
              4 /*yield*/,
              this.setupIntegrationWorkflows(),
              // Setup real-time monitoring
            ];
          case 3:
            // Setup integration workflows
            _a.sent();
            if (!this.config.analytics.realTimeMetrics) return [3 /*break*/, 5];
            return [4 /*yield*/, this.setupRealTimeMonitoring()];
          case 4:
            _a.sent();
            _a.label = 5;
          case 5:
            if (!this.config.compliance.brazilianTaxCompliance) return [3 /*break*/, 7];
            return [4 /*yield*/, this.setupComplianceMonitoring()];
          case 6:
            _a.sent();
            _a.label = 7;
          case 7:
            this.isInitialized = true;
            console.log("✅ Financial Management System initialized successfully");
            return [3 /*break*/, 9];
          case 8:
            error_1 = _a.sent();
            console.error("❌ Failed to initialize financial management system:", error_1);
            throw new Error("Financial management system initialization failed");
          case 9:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Create invoice and setup payment tracking
   */
  FinancialManagementSystem.prototype.createInvoiceWithPaymentTracking = function (invoiceData) {
    return __awaiter(this, void 0, void 0, function () {
      var invoice, invoices, paymentSetup, primaryPaymentMethod, payment, error_2;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 10, , 11]);
            if (!this.isInitialized) {
              throw new Error("Financial management system not initialized");
            }
            console.log("Creating invoice with payment tracking...");
            invoice = void 0;
            if (!invoiceData.appointmentId) return [3 /*break*/, 2];
            return [
              4 /*yield*/,
              this.invoiceGenerator.generateFromAppointment(invoiceData.appointmentId, {
                customServices: invoiceData.services,
                paymentMethod:
                  (_a = invoiceData.paymentMethods) === null || _a === void 0 ? void 0 : _a[0],
                dueDate: invoiceData.dueDate,
                generateNFSe: invoiceData.generateNFSe,
              }),
            ];
          case 1:
            invoice = _b.sent();
            return [3 /*break*/, 5];
          case 2:
            if (!invoiceData.treatmentId) return [3 /*break*/, 4];
            return [
              4 /*yield*/,
              this.invoiceGenerator.generateFromTreatment(invoiceData.treatmentId, {
                generateNFSe: invoiceData.generateNFSe,
              }),
            ];
          case 3:
            invoices = _b.sent();
            invoice = invoices[0]; // Take first invoice for single treatment
            return [3 /*break*/, 5];
          case 4:
            throw new Error("Either appointmentId or treatmentId must be provided");
          case 5:
            paymentSetup = undefined;
            if (!(invoiceData.autoSetupPayment && invoice.paymentMethods.length > 0))
              return [3 /*break*/, 8];
            primaryPaymentMethod = invoice.paymentMethods[0];
            return [
              4 /*yield*/,
              this.paymentTracker.createPayment({
                invoiceId: invoice.id,
                amount: invoice.totalAmount,
                method: primaryPaymentMethod.type,
                gateway: "manual", // Default to manual, can be changed based on method
                patientId: invoiceData.patientId,
                clinicId: invoiceData.clinicId,
                appointmentId: invoiceData.appointmentId,
                treatmentId: invoiceData.treatmentId,
              }),
              // Generate payment links
            ];
          case 6:
            payment = _b.sent();
            return [
              4 /*yield*/,
              this.paymentTracker.generatePaymentLink(payment.id, primaryPaymentMethod),
            ];
          case 7:
            // Generate payment links
            paymentSetup = _b.sent();
            _b.label = 8;
          case 8:
            // Create financial transaction record
            return [
              4 /*yield*/,
              this.createFinancialTransaction({
                type: "invoice",
                invoiceId: invoice.id,
                amount: invoice.totalAmount,
                currency: invoice.currency,
                status: "pending",
                description: "Invoice ".concat(invoice.number, " created"),
                metadata: {
                  patientId: invoiceData.patientId,
                  clinicId: invoiceData.clinicId,
                  appointmentId: invoiceData.appointmentId,
                  treatmentId: invoiceData.treatmentId,
                  createdBy: "system",
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
              }),
            ];
          case 9:
            // Create financial transaction record
            _b.sent();
            console.log("\u2705 Invoice ".concat(invoice.number, " created with payment tracking"));
            return [2 /*return*/, { invoice: invoice, paymentSetup: paymentSetup }];
          case 10:
            error_2 = _b.sent();
            console.error("❌ Invoice creation with payment tracking failed:", error_2);
            throw new Error("Invoice creation failed: ".concat(error_2.message));
          case 11:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Process payment and update invoice
   */
  FinancialManagementSystem.prototype.processPayment = function (paymentData) {
    return __awaiter(this, void 0, void 0, function () {
      var payment, invoice, totalPaid, fullyPaid, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 8, , 9]);
            console.log("Processing payment for invoice ".concat(paymentData.invoiceId));
            // Track payment
            return [
              4 /*yield*/,
              this.paymentTracker.trackPayment(paymentData.invoiceId, {
                amount: paymentData.amount,
                method: paymentData.method,
                transactionId: paymentData.transactionId,
                paidAt: new Date(),
                notes: paymentData.notes,
              }),
              // Get updated payment and invoice data
            ];
          case 1:
            // Track payment
            _a.sent();
            return [4 /*yield*/, this.getLatestPaymentForInvoice(paymentData.invoiceId)];
          case 2:
            payment = _a.sent();
            return [4 /*yield*/, this.getInvoiceData(paymentData.invoiceId)];
          case 3:
            invoice = _a.sent();
            if (!payment || !invoice) {
              throw new Error("Payment or invoice not found after processing");
            }
            return [4 /*yield*/, this.getTotalPaidAmount(paymentData.invoiceId)];
          case 4:
            totalPaid = _a.sent();
            fullyPaid = totalPaid >= invoice.totalAmount;
            // Create financial transaction record
            return [
              4 /*yield*/,
              this.createFinancialTransaction({
                type: "payment",
                invoiceId: paymentData.invoiceId,
                paymentId: payment.id,
                amount: paymentData.amount,
                currency: invoice.currency,
                status: "completed",
                description: "Payment received for invoice ".concat(invoice.number),
                metadata: {
                  patientId: payment.metadata.patientId,
                  clinicId: payment.metadata.clinicId,
                  appointmentId: payment.metadata.appointmentId,
                  treatmentId: payment.metadata.treatmentId,
                  createdBy: "system",
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  notes: paymentData.notes,
                },
              }),
              // Generate alerts if needed
            ];
          case 5:
            // Create financial transaction record
            _a.sent();
            if (!fullyPaid) return [3 /*break*/, 7];
            return [
              4 /*yield*/,
              this.generateAlert({
                type: "overdue_payment",
                severity: "low",
                title: "Invoice Fully Paid",
                description: "Invoice ".concat(invoice.number, " has been fully paid"),
                affectedEntities: {
                  invoiceIds: [invoice.id],
                  paymentIds: [payment.id],
                },
                actionRequired: false,
                suggestedActions: ["Update patient records", "Send payment confirmation"],
              }),
            ];
          case 6:
            _a.sent();
            _a.label = 7;
          case 7:
            console.log("\u2705 Payment processed for invoice ".concat(paymentData.invoiceId));
            return [2 /*return*/, { payment: payment, invoice: invoice, fullyPaid: fullyPaid }];
          case 8:
            error_3 = _a.sent();
            console.error("❌ Payment processing failed:", error_3);
            throw new Error("Payment processing failed: ".concat(error_3.message));
          case 9:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Generate comprehensive financial summary
   */
  FinancialManagementSystem.prototype.getFinancialSummary = function (filters) {
    return __awaiter(this, void 0, void 0, function () {
      var period,
        invoiceAnalytics,
        paymentAnalytics,
        revenue,
        payments,
        gatewayFees,
        expenses,
        profitability,
        trends,
        summary,
        error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            console.log("Generating financial summary...");
            period = {
              startDate:
                (filters === null || filters === void 0 ? void 0 : filters.startDate) ||
                new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              endDate:
                (filters === null || filters === void 0 ? void 0 : filters.endDate) || new Date(),
            };
            return [
              4 /*yield*/,
              this.invoiceGenerator.getInvoiceAnalytics({
                startDate: period.startDate,
                endDate: period.endDate,
                clinicId: filters === null || filters === void 0 ? void 0 : filters.clinicId,
              }),
              // Get payment analytics
            ];
          case 1:
            invoiceAnalytics = _a.sent();
            return [
              4 /*yield*/,
              this.paymentTracker.getPaymentAnalytics({
                startDate: period.startDate,
                endDate: period.endDate,
                clinicId: filters === null || filters === void 0 ? void 0 : filters.clinicId,
              }),
              // Calculate revenue metrics
            ];
          case 2:
            paymentAnalytics = _a.sent();
            revenue = {
              totalInvoiced: invoiceAnalytics.totalAmount,
              totalCollected: paymentAnalytics.summary.totalAmount,
              totalPending: invoiceAnalytics.pendingAmount,
              totalOverdue: invoiceAnalytics.overdueAmount,
              collectionRate:
                invoiceAnalytics.totalAmount > 0
                  ? (paymentAnalytics.summary.totalAmount / invoiceAnalytics.totalAmount) * 100
                  : 0,
            };
            payments = {
              totalPayments: paymentAnalytics.summary.totalPayments,
              averagePaymentTime: invoiceAnalytics.averagePaymentTime,
              paymentMethodDistribution: paymentAnalytics.byMethod,
              successRate: paymentAnalytics.summary.successRate * 100,
            };
            gatewayFees = Object.values(paymentAnalytics.byGateway).reduce(
              (sum, gateway) => sum + gateway.fees,
              0,
            );
            expenses = {
              gatewayFees: gatewayFees,
              processingFees: gatewayFees * 0.1, // Estimated processing fees
              taxesPaid: revenue.totalCollected * 0.05, // Estimated tax rate
              totalExpenses: gatewayFees + gatewayFees * 0.1 + revenue.totalCollected * 0.05,
            };
            profitability = {
              grossRevenue: revenue.totalCollected,
              netRevenue: revenue.totalCollected - expenses.totalExpenses,
              profitMargin:
                revenue.totalCollected > 0
                  ? ((revenue.totalCollected - expenses.totalExpenses) / revenue.totalCollected) *
                    100
                  : 0,
              roi:
                expenses.totalExpenses > 0
                  ? ((revenue.totalCollected - expenses.totalExpenses) / expenses.totalExpenses) *
                    100
                  : 0,
            };
            trends = {
              revenueGrowth: 0, // Would calculate based on previous period
              paymentVolumeGrowth: 0,
              collectionRateChange: 0,
              averageTransactionValue: revenue.totalCollected / Math.max(payments.totalPayments, 1),
            };
            summary = {
              period: period,
              revenue: revenue,
              payments: payments,
              expenses: expenses,
              profitability: profitability,
              trends: trends,
            };
            console.log("✅ Financial summary generated successfully");
            return [2 /*return*/, summary];
          case 3:
            error_4 = _a.sent();
            console.error("❌ Financial summary generation failed:", error_4);
            throw new Error("Financial summary generation failed: ".concat(error_4.message));
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Generate financial report
   */
  FinancialManagementSystem.prototype.generateFinancialReport = function (reportConfig) {
    return __awaiter(this, void 0, void 0, function () {
      var reportId, reportData, _a, report, _b, error_5;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 17, , 18]);
            console.log("Generating ".concat(reportConfig.type, " financial report..."));
            reportId = "report_"
              .concat(Date.now(), "_")
              .concat(Math.random().toString(36).substr(2, 9));
            reportData = void 0;
            _a = reportConfig.type;
            switch (_a) {
              case "revenue":
                return [3 /*break*/, 1];
              case "payments":
                return [3 /*break*/, 3];
              case "taxes":
                return [3 /*break*/, 5];
              case "reconciliation":
                return [3 /*break*/, 7];
              case "compliance":
                return [3 /*break*/, 9];
            }
            return [3 /*break*/, 11];
          case 1:
            return [4 /*yield*/, this.generateRevenueReportData(reportConfig)];
          case 2:
            reportData = _c.sent();
            return [3 /*break*/, 13];
          case 3:
            return [4 /*yield*/, this.generatePaymentsReportData(reportConfig)];
          case 4:
            reportData = _c.sent();
            return [3 /*break*/, 13];
          case 5:
            return [4 /*yield*/, this.generateTaxReportData(reportConfig)];
          case 6:
            reportData = _c.sent();
            return [3 /*break*/, 13];
          case 7:
            return [4 /*yield*/, this.generateReconciliationReportData(reportConfig)];
          case 8:
            reportData = _c.sent();
            return [3 /*break*/, 13];
          case 9:
            return [4 /*yield*/, this.generateComplianceReportData(reportConfig)];
          case 10:
            reportData = _c.sent();
            return [3 /*break*/, 13];
          case 11:
            return [4 /*yield*/, this.generateCustomReportData(reportConfig)];
          case 12:
            reportData = _c.sent();
            _c.label = 13;
          case 13:
            report = {
              id: reportId,
              type: reportConfig.type,
              title: reportConfig.title,
              description: reportConfig.description || "",
              period: reportConfig.period,
              filters: reportConfig.filters || {},
              data: reportData,
              generatedAt: new Date(),
              generatedBy: "system", // Would be actual user ID
              format: reportConfig.format,
            };
            // Store report
            return [
              4 /*yield*/,
              this.storeFinancialReport(report),
              // Generate file based on format
            ];
          case 14:
            // Store report
            _c.sent();
            if (!(reportConfig.format !== "json")) return [3 /*break*/, 16];
            _b = report;
            return [4 /*yield*/, this.generateReportFile(report, reportConfig.includeCharts)];
          case 15:
            _b.downloadUrl = _c.sent();
            _c.label = 16;
          case 16:
            console.log("\u2705 Financial report ".concat(reportId, " generated successfully"));
            return [2 /*return*/, report];
          case 17:
            error_5 = _c.sent();
            console.error("❌ Financial report generation failed:", error_5);
            throw new Error("Financial report generation failed: ".concat(error_5.message));
          case 18:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get financial alerts
   */
  FinancialManagementSystem.prototype.getFinancialAlerts = function (filters) {
    return __awaiter(this, void 0, void 0, function () {
      var query, alerts, error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            query = this.supabase
              .from("financial_alerts")
              .select("*")
              .order("created_at", { ascending: false });
            if (filters === null || filters === void 0 ? void 0 : filters.severity) {
              query = query.eq("severity", filters.severity);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.type) {
              query = query.eq("type", filters.type);
            }
            if (
              (filters === null || filters === void 0 ? void 0 : filters.resolved) !== undefined
            ) {
              if (filters.resolved) {
                query = query.not("resolved_at", "is", null);
              } else {
                query = query.is("resolved_at", null);
              }
            }
            return [4 /*yield*/, query];
          case 1:
            alerts = _a.sent().data;
            return [
              2 /*return*/,
              (alerts === null || alerts === void 0
                ? void 0
                : alerts.map(this.convertDbRecordToAlert)) || [],
            ];
          case 2:
            error_6 = _a.sent();
            console.error("❌ Failed to get financial alerts:", error_6);
            throw new Error("Failed to get financial alerts: ".concat(error_6.message));
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Resolve financial alert
   */
  FinancialManagementSystem.prototype.resolveAlert = function (alertId, resolvedBy, notes) {
    return __awaiter(this, void 0, void 0, function () {
      var error_7;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("financial_alerts")
                .update({
                  resolved_at: new Date().toISOString(),
                  resolved_by: resolvedBy,
                  resolution_notes: notes,
                })
                .eq("id", alertId),
            ];
          case 1:
            _a.sent();
            console.log("\u2705 Alert ".concat(alertId, " resolved successfully"));
            return [3 /*break*/, 3];
          case 2:
            error_7 = _a.sent();
            console.error("❌ Failed to resolve alert:", error_7);
            throw new Error("Failed to resolve alert: ".concat(error_7.message));
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get system status and health metrics
   */
  FinancialManagementSystem.prototype.getSystemStatus = function () {
    return __awaiter(this, void 0, void 0, function () {
      var components,
        today,
        startOfDay,
        _a,
        invoiceAnalytics,
        paymentAnalytics,
        alerts,
        metrics,
        status_1,
        error_8;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            components = {
              invoiceGeneration: "healthy",
              paymentTracking: "healthy",
              nfseIntegration: "healthy",
              paymentGateways: "healthy",
            };
            today = new Date();
            startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            return [
              4 /*yield*/,
              Promise.all([
                this.invoiceGenerator.getInvoiceAnalytics({ startDate: startOfDay }),
                this.paymentTracker.getPaymentAnalytics({ startDate: startOfDay }),
                this.getFinancialAlerts({ resolved: false }),
              ]),
            ];
          case 1:
            (_a = _b.sent()),
              (invoiceAnalytics = _a[0]),
              (paymentAnalytics = _a[1]),
              (alerts = _a[2]);
            metrics = {
              totalInvoices: invoiceAnalytics.totalInvoices,
              totalPayments: paymentAnalytics.summary.totalPayments,
              successRate: paymentAnalytics.summary.successRate * 100,
              averageProcessingTime: invoiceAnalytics.averagePaymentTime,
              pendingReconciliations: 0, // Would get from reconciliation system
              activeAlerts: alerts.length,
            };
            status_1 = "healthy";
            if (metrics.activeAlerts > 10 || metrics.successRate < 90) {
              status_1 = "warning";
            }
            if (metrics.successRate < 80 || Object.values(components).includes("error")) {
              status_1 = "error";
            }
            return [
              2 /*return*/,
              {
                status: status_1,
                components: components,
                metrics: metrics,
                lastUpdated: new Date(),
              },
            ];
          case 2:
            error_8 = _b.sent();
            console.error("❌ Failed to get system status:", error_8);
            return [
              2 /*return*/,
              {
                status: "error",
                components: {
                  invoiceGeneration: "error",
                  paymentTracking: "error",
                  nfseIntegration: "error",
                  paymentGateways: "error",
                },
                metrics: {
                  totalInvoices: 0,
                  totalPayments: 0,
                  successRate: 0,
                  averageProcessingTime: 0,
                  pendingReconciliations: 0,
                  activeAlerts: 0,
                },
                lastUpdated: new Date(),
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // Private helper methods
  FinancialManagementSystem.prototype.initializeConfig = (config) => {
    var defaultConfig = {
      invoiceGeneration: {},
      paymentTracking: {},
      integration: {
        autoLinkPayments: true,
        realTimeUpdates: true,
        crossValidation: true,
        auditTrail: true,
      },
      analytics: {
        enabled: true,
        realTimeMetrics: true,
        customReports: true,
        exportFormats: ["pdf", "excel", "csv", "json"],
      },
      compliance: {
        brazilianTaxCompliance: true,
        lgpdCompliant: true,
        dataEncryption: true,
        accessControl: true,
      },
    };
    return __assign(__assign({}, defaultConfig), config);
  };
  FinancialManagementSystem.prototype.setupIntegrationWorkflows = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        console.log("Setting up integration workflows...");
        if (this.config.integration.autoLinkPayments) {
          // Setup automatic payment-invoice linking
        }
        if (this.config.integration.crossValidation) {
          // Setup cross-validation between invoice and payment data
        }
        return [2 /*return*/];
      });
    });
  };
  FinancialManagementSystem.prototype.setupRealTimeMonitoring = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _this = this;
      return __generator(this, function (_a) {
        console.log("Setting up real-time monitoring...");
        // Setup real-time subscriptions for invoice and payment updates
        this.supabase
          .channel("financial_updates")
          .on("postgres_changes", { event: "*", schema: "public", table: "invoices" }, (payload) =>
            _this.handleInvoiceUpdate(payload),
          )
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "payment_records" },
            (payload) => _this.handlePaymentUpdate(payload),
          )
          .subscribe();
        return [2 /*return*/];
      });
    });
  };
  FinancialManagementSystem.prototype.setupComplianceMonitoring = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        console.log("Setting up compliance monitoring...");
        return [2 /*return*/];
      });
    });
  };
  FinancialManagementSystem.prototype.createFinancialTransaction = function (transaction) {
    return __awaiter(this, void 0, void 0, function () {
      var transactionId;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            transactionId = "transaction_"
              .concat(Date.now(), "_")
              .concat(Math.random().toString(36).substr(2, 9));
            return [
              4 /*yield*/,
              this.supabase.from("financial_transactions").insert({
                id: transactionId,
                type: transaction.type,
                invoice_id: transaction.invoiceId,
                payment_id: transaction.paymentId,
                amount: transaction.amount,
                currency: transaction.currency,
                status: transaction.status,
                description: transaction.description,
                patient_id: transaction.metadata.patientId,
                clinic_id: transaction.metadata.clinicId,
                appointment_id: transaction.metadata.appointmentId,
                treatment_id: transaction.metadata.treatmentId,
                created_by: transaction.metadata.createdBy,
                notes: transaction.metadata.notes,
              }),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  FinancialManagementSystem.prototype.generateAlert = function (alertData) {
    return __awaiter(this, void 0, void 0, function () {
      var alertId, alert;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            alertId = "alert_"
              .concat(Date.now(), "_")
              .concat(Math.random().toString(36).substr(2, 9));
            alert = __assign(__assign({ id: alertId }, alertData), { createdAt: new Date() });
            return [
              4 /*yield*/,
              this.supabase.from("financial_alerts").insert({
                id: alert.id,
                type: alert.type,
                severity: alert.severity,
                title: alert.title,
                description: alert.description,
                affected_entities: JSON.stringify(alert.affectedEntities),
                action_required: alert.actionRequired,
                suggested_actions: JSON.stringify(alert.suggestedActions),
                created_at: alert.createdAt.toISOString(),
              }),
            ];
          case 1:
            _a.sent();
            this.alerts.push(alert);
            return [2 /*return*/];
        }
      });
    });
  };
  FinancialManagementSystem.prototype.getLatestPaymentForInvoice = function (invoiceId) {
    return __awaiter(this, void 0, void 0, function () {
      var data;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("payment_records")
                .select("*")
                .eq("invoice_id", invoiceId)
                .order("created_at", { ascending: false })
                .limit(1)
                .single(),
            ];
          case 1:
            data = _a.sent().data;
            return [2 /*return*/, data ? this.convertDbRecordToPaymentRecord(data) : null];
        }
      });
    });
  };
  FinancialManagementSystem.prototype.getInvoiceData = function (invoiceId) {
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
            return [2 /*return*/, data ? this.convertDbRecordToInvoiceData(data) : null];
        }
      });
    });
  };
  FinancialManagementSystem.prototype.getTotalPaidAmount = function (invoiceId) {
    return __awaiter(this, void 0, void 0, function () {
      var payments;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("payment_records")
                .select("amount")
                .eq("invoice_id", invoiceId)
                .eq("status", "confirmed"),
            ];
          case 1:
            payments = _a.sent().data;
            return [
              2 /*return*/,
              (payments === null || payments === void 0
                ? void 0
                : payments.reduce((sum, payment) => sum + payment.amount, 0)) || 0,
            ];
        }
      });
    });
  };
  // Report generation methods
  FinancialManagementSystem.prototype.generateRevenueReportData = function (config) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Generate revenue report data
        return [2 /*return*/, { type: "revenue", data: "Revenue report data" }];
      });
    });
  };
  FinancialManagementSystem.prototype.generatePaymentsReportData = function (config) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Generate payments report data
        return [2 /*return*/, { type: "payments", data: "Payments report data" }];
      });
    });
  };
  FinancialManagementSystem.prototype.generateTaxReportData = function (config) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Generate tax report data
        return [2 /*return*/, { type: "taxes", data: "Tax report data" }];
      });
    });
  };
  FinancialManagementSystem.prototype.generateReconciliationReportData = function (config) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Generate reconciliation report data
        return [2 /*return*/, { type: "reconciliation", data: "Reconciliation report data" }];
      });
    });
  };
  FinancialManagementSystem.prototype.generateComplianceReportData = function (config) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Generate compliance report data
        return [2 /*return*/, { type: "compliance", data: "Compliance report data" }];
      });
    });
  };
  FinancialManagementSystem.prototype.generateCustomReportData = function (config) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Generate custom report data
        return [2 /*return*/, { type: "custom", data: "Custom report data" }];
      });
    });
  };
  FinancialManagementSystem.prototype.storeFinancialReport = function (report) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("financial_reports").insert({
                id: report.id,
                type: report.type,
                title: report.title,
                description: report.description,
                period_start: report.period.startDate.toISOString(),
                period_end: report.period.endDate.toISOString(),
                filters: JSON.stringify(report.filters),
                data: JSON.stringify(report.data),
                generated_at: report.generatedAt.toISOString(),
                generated_by: report.generatedBy,
                format: report.format,
                download_url: report.downloadUrl,
              }),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  FinancialManagementSystem.prototype.generateReportFile = function (report, includeCharts) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Generate report file based on format
        // This would integrate with a report generation service
        return [
          2 /*return*/,
          "https://reports.example.com/".concat(report.id, ".").concat(report.format),
        ];
      });
    });
  };
  // Event handlers
  FinancialManagementSystem.prototype.handleInvoiceUpdate = function (payload) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        console.log("Invoice update received:", payload);
        if (this.config.integration.realTimeUpdates) {
          // Handle real-time invoice updates
        }
        return [2 /*return*/];
      });
    });
  };
  FinancialManagementSystem.prototype.handlePaymentUpdate = function (payload) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        console.log("Payment update received:", payload);
        if (this.config.integration.realTimeUpdates) {
          // Handle real-time payment updates
        }
        return [2 /*return*/];
      });
    });
  };
  // Conversion methods
  FinancialManagementSystem.prototype.convertDbRecordToPaymentRecord = (data) => {
    // Convert database record to PaymentRecord
    // Implementation would match the PaymentTracker conversion method
    return {};
  };
  FinancialManagementSystem.prototype.convertDbRecordToInvoiceData = (data) => {
    // Convert database record to InvoiceData
    // Implementation would match the InvoiceGenerator conversion method
    return {};
  };
  FinancialManagementSystem.prototype.convertDbRecordToAlert = (data) => ({
    id: data.id,
    type: data.type,
    severity: data.severity,
    title: data.title,
    description: data.description,
    affectedEntities: JSON.parse(data.affected_entities || "{}"),
    actionRequired: data.action_required,
    suggestedActions: JSON.parse(data.suggested_actions || "[]"),
    createdAt: new Date(data.created_at),
    resolvedAt: data.resolved_at ? new Date(data.resolved_at) : undefined,
    resolvedBy: data.resolved_by,
  });
  return FinancialManagementSystem;
})();
exports.FinancialManagementSystem = FinancialManagementSystem;
// Story 4.2: Financial Analytics & Business Intelligence - Export new engines
var cash_flow_engine_1 = require("./cash-flow-engine");
Object.defineProperty(exports, "CashFlowEngine", {
  enumerable: true,
  get: () => cash_flow_engine_1.CashFlowEngine,
});
var automated_alerts_engine_1 = require("./automated-alerts-engine");
Object.defineProperty(exports, "AutomatedAlertsEngine", {
  enumerable: true,
  get: () => automated_alerts_engine_1.AutomatedAlertsEngine,
});
var predictive_analytics_engine_1 = require("./predictive-analytics-engine");
Object.defineProperty(exports, "createpredictiveAnalyticsEngine", {
  enumerable: true,
  get: () => predictive_analytics_engine_1.createpredictiveAnalyticsEngine,
});
var financial_dashboard_engine_1 = require("./financial-dashboard-engine");
Object.defineProperty(exports, "FinancialDashboardEngine", {
  enumerable: true,
  get: () => financial_dashboard_engine_1.FinancialDashboardEngine,
});
