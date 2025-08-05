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
exports.createalertSystem =
  exports.AlertSystem =
  exports.AlertNotificationSchema =
  exports.AlertInstanceSchema =
  exports.AlertRuleSchema =
  exports.AlertTypeSchema =
  exports.AlertStatusSchema =
  exports.AlertSeveritySchema =
    void 0;
var zod_1 = require("zod");
var client_1 = require("@/lib/supabase/client");
var logger_1 = require("@/lib/logger");
var kpi_calculation_service_1 = require("./kpi-calculation-service");
// Alert Types and Schemas
exports.AlertSeveritySchema = zod_1.z.enum(["low", "medium", "high", "critical"]);
exports.AlertStatusSchema = zod_1.z.enum(["active", "acknowledged", "resolved", "dismissed"]);
exports.AlertTypeSchema = zod_1.z.enum([
  "kpi_threshold",
  "trend_anomaly",
  "system_health",
  "business_rule",
]);
exports.AlertRuleSchema = zod_1.z.object({
  id: zod_1.z.string().uuid(),
  clinicId: zod_1.z.string().uuid(),
  name: zod_1.z.string().min(1).max(255),
  description: zod_1.z.string().max(1000).optional(),
  type: exports.AlertTypeSchema,
  severity: exports.AlertSeveritySchema,
  isActive: zod_1.z.boolean().default(true),
  conditions: zod_1.z.object({
    kpiId: zod_1.z.string().uuid().optional(),
    operator: zod_1.z.enum([">", "<", ">=", "<=", "==", "!=", "between"]),
    threshold: zod_1.z.number(),
    secondaryThreshold: zod_1.z.number().optional(), // for 'between' operator
    timeWindow: zod_1.z.number().min(1).default(60), // minutes
    consecutiveViolations: zod_1.z.number().min(1).default(1),
  }),
  actions: zod_1.z.object({
    sendEmail: zod_1.z.boolean().default(false),
    sendSMS: zod_1.z.boolean().default(false),
    sendPushNotification: zod_1.z.boolean().default(true),
    createTicket: zod_1.z.boolean().default(false),
    emailRecipients: zod_1.z.array(zod_1.z.string().email()).optional(),
    smsRecipients: zod_1.z.array(zod_1.z.string()).optional(),
  }),
  schedule: zod_1.z
    .object({
      enabled: zod_1.z.boolean().default(true),
      timezone: zod_1.z.string().default("America/Sao_Paulo"),
      workingHours: zod_1.z
        .object({
          start: zod_1.z.string().regex(/^\d{2}:\d{2}$/),
          end: zod_1.z.string().regex(/^\d{2}:\d{2}$/),
        })
        .optional(),
      workingDays: zod_1.z.array(zod_1.z.number().min(0).max(6)).optional(), // 0 = Sunday
      excludeHolidays: zod_1.z.boolean().default(false),
    })
    .optional(),
  createdAt: zod_1.z.string().datetime(),
  updatedAt: zod_1.z.string().datetime(),
});
exports.AlertInstanceSchema = zod_1.z.object({
  id: zod_1.z.string().uuid(),
  ruleId: zod_1.z.string().uuid(),
  clinicId: zod_1.z.string().uuid(),
  title: zod_1.z.string().min(1).max(255),
  message: zod_1.z.string().max(2000),
  severity: exports.AlertSeveritySchema,
  status: exports.AlertStatusSchema,
  data: zod_1.z.record(zod_1.z.any()),
  triggeredAt: zod_1.z.string().datetime(),
  acknowledgedAt: zod_1.z.string().datetime().optional(),
  acknowledgedBy: zod_1.z.string().uuid().optional(),
  resolvedAt: zod_1.z.string().datetime().optional(),
  resolvedBy: zod_1.z.string().uuid().optional(),
  dismissedAt: zod_1.z.string().datetime().optional(),
  dismissedBy: zod_1.z.string().uuid().optional(),
  metadata: zod_1.z
    .object({
      kpiValue: zod_1.z.number().optional(),
      threshold: zod_1.z.number().optional(),
      previousValue: zod_1.z.number().optional(),
      violationCount: zod_1.z.number().default(1),
      autoResolved: zod_1.z.boolean().default(false),
    })
    .optional(),
});
exports.AlertNotificationSchema = zod_1.z.object({
  id: zod_1.z.string().uuid(),
  alertId: zod_1.z.string().uuid(),
  clinicId: zod_1.z.string().uuid(),
  type: zod_1.z.enum(["email", "sms", "push", "webhook"]),
  recipient: zod_1.z.string(),
  status: zod_1.z.enum(["pending", "sent", "delivered", "failed"]),
  sentAt: zod_1.z.string().datetime().optional(),
  deliveredAt: zod_1.z.string().datetime().optional(),
  errorMessage: zod_1.z.string().optional(),
  retryCount: zod_1.z.number().default(0),
  maxRetries: zod_1.z.number().default(3),
});
// Alert System Service
var AlertSystem = /** @class */ (function () {
  function AlertSystem() {
    this.supabase = (0, client_1.createClient)();
    this.evaluationTimers = new Map();
    this.EVALUATION_INTERVAL = 60000; // 1 minute
    this.isRunning = false;
  }
  /**
   * Start the alert system
   */
  AlertSystem.prototype.start = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (this.isRunning) {
              return [2 /*return*/];
            }
            this.isRunning = true;
            logger_1.logger.info("Starting Alert System...");
            // Load and start monitoring all active alert rules
            return [4 /*yield*/, this.loadAndStartAlertRules()];
          case 1:
            // Load and start monitoring all active alert rules
            _a.sent();
            // Start periodic cleanup of old alerts
            this.startPeriodicCleanup();
            logger_1.logger.info("Alert System started successfully");
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Stop the alert system
   */
  AlertSystem.prototype.stop = function () {
    if (!this.isRunning) {
      return;
    }
    this.isRunning = false;
    logger_1.logger.info("Stopping Alert System...");
    // Clear all timers
    for (var _i = 0, _a = this.evaluationTimers.values(); _i < _a.length; _i++) {
      var timer = _a[_i];
      clearInterval(timer);
    }
    this.evaluationTimers.clear();
    logger_1.logger.info("Alert System stopped");
  };
  /**
   * Create a new alert rule
   */
  AlertSystem.prototype.createAlertRule = function (rule) {
    return __awaiter(this, void 0, void 0, function () {
      var ruleId, now, _a, data, error, newRule, error_1;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            ruleId = crypto.randomUUID();
            now = new Date().toISOString();
            return [
              4 /*yield*/,
              this.supabase
                .from("alert_rules")
                .insert({
                  id: ruleId,
                  clinic_id: rule.clinicId,
                  name: rule.name,
                  description: rule.description,
                  type: rule.type,
                  severity: rule.severity,
                  is_active: rule.isActive,
                  conditions: rule.conditions,
                  actions: rule.actions,
                  schedule: rule.schedule,
                  created_at: now,
                  updated_at: now,
                })
                .select()
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              logger_1.logger.error("Error creating alert rule:", error);
              return [2 /*return*/, null];
            }
            newRule = {
              id: data.id,
              clinicId: data.clinic_id,
              name: data.name,
              description: data.description,
              type: data.type,
              severity: data.severity,
              isActive: data.is_active,
              conditions: data.conditions,
              actions: data.actions,
              schedule: data.schedule,
              createdAt: data.created_at,
              updatedAt: data.updated_at,
            };
            // Start monitoring the new rule
            if (newRule.isActive) {
              this.startRuleEvaluation(newRule);
            }
            return [2 /*return*/, newRule];
          case 2:
            error_1 = _b.sent();
            logger_1.logger.error("Error creating alert rule:", error_1);
            return [2 /*return*/, null];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Update an alert rule
   */
  AlertSystem.prototype.updateAlertRule = function (ruleId, updates) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, updatedRule, error_2;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("alert_rules")
                .update({
                  name: updates.name,
                  description: updates.description,
                  type: updates.type,
                  severity: updates.severity,
                  is_active: updates.isActive,
                  conditions: updates.conditions,
                  actions: updates.actions,
                  schedule: updates.schedule,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", ruleId)
                .select()
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              logger_1.logger.error("Error updating alert rule:", error);
              return [2 /*return*/, null];
            }
            updatedRule = {
              id: data.id,
              clinicId: data.clinic_id,
              name: data.name,
              description: data.description,
              type: data.type,
              severity: data.severity,
              isActive: data.is_active,
              conditions: data.conditions,
              actions: data.actions,
              schedule: data.schedule,
              createdAt: data.created_at,
              updatedAt: data.updated_at,
            };
            // Restart rule evaluation
            this.stopRuleEvaluation(ruleId);
            if (updatedRule.isActive) {
              this.startRuleEvaluation(updatedRule);
            }
            return [2 /*return*/, updatedRule];
          case 2:
            error_2 = _b.sent();
            logger_1.logger.error("Error updating alert rule:", error_2);
            return [2 /*return*/, null];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Delete an alert rule
   */
  AlertSystem.prototype.deleteAlertRule = function (ruleId) {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            // Stop evaluation
            this.stopRuleEvaluation(ruleId);
            return [4 /*yield*/, this.supabase.from("alert_rules").delete().eq("id", ruleId)];
          case 1:
            error = _a.sent().error;
            if (error) {
              logger_1.logger.error("Error deleting alert rule:", error);
              return [2 /*return*/, false];
            }
            return [2 /*return*/, true];
          case 2:
            error_3 = _a.sent();
            logger_1.logger.error("Error deleting alert rule:", error_3);
            return [2 /*return*/, false];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get active alerts for a clinic
   */
  AlertSystem.prototype.getActiveAlerts = function (clinicId_1) {
    return __awaiter(this, arguments, void 0, function (clinicId, limit) {
      var _a, data, error, error_4;
      if (limit === void 0) {
        limit = 50;
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("alert_instances")
                .select("*")
                .eq("clinic_id", clinicId)
                .eq("status", "active")
                .order("triggered_at", { ascending: false })
                .limit(limit),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              logger_1.logger.error("Error fetching active alerts:", error);
              return [2 /*return*/, []];
            }
            return [
              2 /*return*/,
              data.map(function (alert) {
                return {
                  id: alert.id,
                  ruleId: alert.rule_id,
                  clinicId: alert.clinic_id,
                  title: alert.title,
                  message: alert.message,
                  severity: alert.severity,
                  status: alert.status,
                  data: alert.data,
                  triggeredAt: alert.triggered_at,
                  acknowledgedAt: alert.acknowledged_at,
                  acknowledgedBy: alert.acknowledged_by,
                  resolvedAt: alert.resolved_at,
                  resolvedBy: alert.resolved_by,
                  dismissedAt: alert.dismissed_at,
                  dismissedBy: alert.dismissed_by,
                  metadata: alert.metadata,
                };
              }),
            ];
          case 2:
            error_4 = _b.sent();
            logger_1.logger.error("Error getting active alerts:", error_4);
            return [2 /*return*/, []];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Acknowledge an alert
   */
  AlertSystem.prototype.acknowledgeAlert = function (alertId, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("alert_instances")
                .update({
                  status: "acknowledged",
                  acknowledged_at: new Date().toISOString(),
                  acknowledged_by: userId,
                })
                .eq("id", alertId),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              logger_1.logger.error("Error acknowledging alert:", error);
              return [2 /*return*/, false];
            }
            return [2 /*return*/, true];
          case 2:
            error_5 = _a.sent();
            logger_1.logger.error("Error acknowledging alert:", error_5);
            return [2 /*return*/, false];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Resolve an alert
   */
  AlertSystem.prototype.resolveAlert = function (alertId, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("alert_instances")
                .update({
                  status: "resolved",
                  resolved_at: new Date().toISOString(),
                  resolved_by: userId,
                })
                .eq("id", alertId),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              logger_1.logger.error("Error resolving alert:", error);
              return [2 /*return*/, false];
            }
            return [2 /*return*/, true];
          case 2:
            error_6 = _a.sent();
            logger_1.logger.error("Error resolving alert:", error_6);
            return [2 /*return*/, false];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Dismiss an alert
   */
  AlertSystem.prototype.dismissAlert = function (alertId, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_7;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("alert_instances")
                .update({
                  status: "dismissed",
                  dismissed_at: new Date().toISOString(),
                  dismissed_by: userId,
                })
                .eq("id", alertId),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              logger_1.logger.error("Error dismissing alert:", error);
              return [2 /*return*/, false];
            }
            return [2 /*return*/, true];
          case 2:
            error_7 = _a.sent();
            logger_1.logger.error("Error dismissing alert:", error_7);
            return [2 /*return*/, false];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Load and start monitoring all active alert rules
   */
  AlertSystem.prototype.loadAndStartAlertRules = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, rules, error, _i, rules_1, ruleData, rule, error_8;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("alert_rules").select("*").eq("is_active", true),
            ];
          case 1:
            (_a = _b.sent()), (rules = _a.data), (error = _a.error);
            if (error) {
              logger_1.logger.error("Error loading alert rules:", error);
              return [2 /*return*/];
            }
            for (_i = 0, rules_1 = rules; _i < rules_1.length; _i++) {
              ruleData = rules_1[_i];
              rule = {
                id: ruleData.id,
                clinicId: ruleData.clinic_id,
                name: ruleData.name,
                description: ruleData.description,
                type: ruleData.type,
                severity: ruleData.severity,
                isActive: ruleData.is_active,
                conditions: ruleData.conditions,
                actions: ruleData.actions,
                schedule: ruleData.schedule,
                createdAt: ruleData.created_at,
                updatedAt: ruleData.updated_at,
              };
              this.startRuleEvaluation(rule);
            }
            logger_1.logger.info("Started monitoring ".concat(rules.length, " alert rules"));
            return [3 /*break*/, 3];
          case 2:
            error_8 = _b.sent();
            logger_1.logger.error("Error loading alert rules:", error_8);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Start evaluation for a specific rule
   */
  AlertSystem.prototype.startRuleEvaluation = function (rule) {
    var _this = this;
    if (this.evaluationTimers.has(rule.id)) {
      return; // Already running
    }
    var timer = setInterval(function () {
      return __awaiter(_this, void 0, void 0, function () {
        var error_9;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 2, , 3]);
              return [4 /*yield*/, this.evaluateRule(rule)];
            case 1:
              _a.sent();
              return [3 /*break*/, 3];
            case 2:
              error_9 = _a.sent();
              logger_1.logger.error("Error evaluating rule ".concat(rule.id, ":"), error_9);
              return [3 /*break*/, 3];
            case 3:
              return [2 /*return*/];
          }
        });
      });
    }, this.EVALUATION_INTERVAL);
    this.evaluationTimers.set(rule.id, timer);
  };
  /**
   * Stop evaluation for a specific rule
   */
  AlertSystem.prototype.stopRuleEvaluation = function (ruleId) {
    var timer = this.evaluationTimers.get(ruleId);
    if (timer) {
      clearInterval(timer);
      this.evaluationTimers.delete(ruleId);
    }
  };
  /**
   * Evaluate a single alert rule
   */
  AlertSystem.prototype.evaluateRule = function (rule) {
    return __awaiter(this, void 0, void 0, function () {
      var kpiResults, targetKPI, isViolated, existingAlert, error_10;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 10, , 11]);
            // Check if we should evaluate based on schedule
            if (!this.shouldEvaluateNow(rule)) {
              return [2 /*return*/];
            }
            return [
              4 /*yield*/,
              (0, kpi_calculation_service_1.createkpiCalculationService)().calculateClinicKPIs(
                rule.clinicId,
              ),
            ];
          case 1:
            kpiResults = _a.sent();
            targetKPI = kpiResults.find(function (kpi) {
              return kpi.kpi.id === rule.conditions.kpiId;
            });
            if (!targetKPI) {
              return [2 /*return*/]; // KPI not found
            }
            isViolated = this.evaluateCondition(targetKPI.currentValue, rule.conditions);
            if (!isViolated) return [3 /*break*/, 7];
            return [4 /*yield*/, this.getExistingActiveAlert(rule.id)];
          case 2:
            existingAlert = _a.sent();
            if (!existingAlert) return [3 /*break*/, 4];
            // Update violation count
            return [4 /*yield*/, this.updateViolationCount(existingAlert.id)];
          case 3:
            // Update violation count
            _a.sent();
            return [3 /*break*/, 6];
          case 4:
            // Create new alert
            return [4 /*yield*/, this.createAlert(rule, targetKPI)];
          case 5:
            // Create new alert
            _a.sent();
            _a.label = 6;
          case 6:
            return [3 /*break*/, 9];
          case 7:
            // Check if we should auto-resolve existing alerts
            return [4 /*yield*/, this.autoResolveAlerts(rule.id)];
          case 8:
            // Check if we should auto-resolve existing alerts
            _a.sent();
            _a.label = 9;
          case 9:
            return [3 /*break*/, 11];
          case 10:
            error_10 = _a.sent();
            logger_1.logger.error("Error evaluating rule ".concat(rule.id, ":"), error_10);
            return [3 /*break*/, 11];
          case 11:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Check if rule should be evaluated now based on schedule
   */
  AlertSystem.prototype.shouldEvaluateNow = function (rule) {
    var _a;
    if (!((_a = rule.schedule) === null || _a === void 0 ? void 0 : _a.enabled)) {
      return true;
    }
    var now = new Date();
    var schedule = rule.schedule;
    // Check working hours
    if (schedule.workingHours) {
      var currentTime = now.toTimeString().slice(0, 5);
      if (currentTime < schedule.workingHours.start || currentTime > schedule.workingHours.end) {
        return false;
      }
    }
    // Check working days
    if (schedule.workingDays && schedule.workingDays.length > 0) {
      var currentDay = now.getDay();
      if (!schedule.workingDays.includes(currentDay)) {
        return false;
      }
    }
    return true;
  };
  /**
   * Evaluate if a condition is violated
   */
  AlertSystem.prototype.evaluateCondition = function (value, conditions) {
    var operator = conditions.operator,
      threshold = conditions.threshold,
      secondaryThreshold = conditions.secondaryThreshold;
    switch (operator) {
      case ">":
        return value > threshold;
      case "<":
        return value < threshold;
      case ">=":
        return value >= threshold;
      case "<=":
        return value <= threshold;
      case "==":
        return value === threshold;
      case "!=":
        return value !== threshold;
      case "between":
        return (
          secondaryThreshold !== undefined && value >= threshold && value <= secondaryThreshold
        );
      default:
        return false;
    }
  };
  /**
   * Get existing active alert for a rule
   */
  AlertSystem.prototype.getExistingActiveAlert = function (ruleId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_11;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("alert_instances")
                .select("*")
                .eq("rule_id", ruleId)
                .eq("status", "active")
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error || !data) {
              return [2 /*return*/, null];
            }
            return [
              2 /*return*/,
              {
                id: data.id,
                ruleId: data.rule_id,
                clinicId: data.clinic_id,
                title: data.title,
                message: data.message,
                severity: data.severity,
                status: data.status,
                data: data.data,
                triggeredAt: data.triggered_at,
                acknowledgedAt: data.acknowledged_at,
                acknowledgedBy: data.acknowledged_by,
                resolvedAt: data.resolved_at,
                resolvedBy: data.resolved_by,
                dismissedAt: data.dismissed_at,
                dismissedBy: data.dismissed_by,
                metadata: data.metadata,
              },
            ];
          case 2:
            error_11 = _b.sent();
            return [2 /*return*/, null];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Create a new alert instance
   */
  AlertSystem.prototype.createAlert = function (rule, kpiResult) {
    return __awaiter(this, void 0, void 0, function () {
      var alertId, now, alert_1, error, error_12;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            alertId = crypto.randomUUID();
            now = new Date().toISOString();
            alert_1 = {
              id: alertId,
              ruleId: rule.id,
              clinicId: rule.clinicId,
              title: "".concat(rule.name, " - Limite Excedido"),
              message: this.generateAlertMessage(rule, kpiResult),
              severity: rule.severity,
              status: "active",
              data: {
                kpiId: kpiResult.kpi.id,
                kpiName: kpiResult.kpi.name,
                currentValue: kpiResult.currentValue,
                threshold: rule.conditions.threshold,
                operator: rule.conditions.operator,
              },
              triggeredAt: now,
              metadata: {
                kpiValue: kpiResult.currentValue,
                threshold: rule.conditions.threshold,
                previousValue: kpiResult.previousValue,
                violationCount: 1,
                autoResolved: false,
              },
            };
            return [
              4 /*yield*/,
              this.supabase.from("alert_instances").insert({
                id: alert_1.id,
                rule_id: alert_1.ruleId,
                clinic_id: alert_1.clinicId,
                title: alert_1.title,
                message: alert_1.message,
                severity: alert_1.severity,
                status: alert_1.status,
                data: alert_1.data,
                triggered_at: alert_1.triggeredAt,
                metadata: alert_1.metadata,
              }),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              logger_1.logger.error("Error creating alert:", error);
              return [2 /*return*/];
            }
            // Send notifications
            return [4 /*yield*/, this.sendAlertNotifications(alert_1, rule)];
          case 2:
            // Send notifications
            _a.sent();
            logger_1.logger.info("Alert created: ".concat(alert_1.title));
            return [3 /*break*/, 4];
          case 3:
            error_12 = _a.sent();
            logger_1.logger.error("Error creating alert:", error_12);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Generate alert message
   */
  AlertSystem.prototype.generateAlertMessage = function (rule, kpiResult) {
    var kpiName = kpiResult.kpi.name;
    var currentValue = kpiResult.formattedValue;
    var threshold = rule.conditions.threshold;
    var operator = rule.conditions.operator;
    return (
      'O KPI "'
        .concat(kpiName, '" est\u00E1 com valor ')
        .concat(currentValue, ", que ")
        .concat(operator, " ")
        .concat(threshold, ". ") + "Verifique os dados e tome as a\u00E7\u00F5es necess\u00E1rias."
    );
  };
  /**
   * Update violation count for existing alert
   */
  AlertSystem.prototype.updateViolationCount = function (alertId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, metadata, newViolationCount, error_13;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              this.supabase.from("alert_instances").select("metadata").eq("id", alertId).single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error || !data) {
              return [2 /*return*/];
            }
            metadata = data.metadata || {};
            newViolationCount = (metadata.violationCount || 1) + 1;
            return [
              4 /*yield*/,
              this.supabase
                .from("alert_instances")
                .update({
                  metadata: __assign(__assign({}, metadata), { violationCount: newViolationCount }),
                })
                .eq("id", alertId),
            ];
          case 2:
            _b.sent();
            return [3 /*break*/, 4];
          case 3:
            error_13 = _b.sent();
            logger_1.logger.error("Error updating violation count:", error_13);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Auto-resolve alerts when condition is no longer violated
   */
  AlertSystem.prototype.autoResolveAlerts = function (ruleId) {
    return __awaiter(this, void 0, void 0, function () {
      var error_14;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("alert_instances")
                .update({
                  status: "resolved",
                  resolved_at: new Date().toISOString(),
                  metadata: {
                    autoResolved: true,
                  },
                })
                .eq("rule_id", ruleId)
                .eq("status", "active"),
            ];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_14 = _a.sent();
            logger_1.logger.error("Error auto-resolving alerts:", error_14);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Send alert notifications
   */
  AlertSystem.prototype.sendAlertNotifications = function (alert, rule) {
    return __awaiter(this, void 0, void 0, function () {
      var actions, _i, _a, email, _b, _c, phone, error_15;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            _d.trys.push([0, 11, , 12]);
            actions = rule.actions;
            if (!(actions.sendEmail && actions.emailRecipients)) return [3 /*break*/, 4];
            (_i = 0), (_a = actions.emailRecipients);
            _d.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 4];
            email = _a[_i];
            return [4 /*yield*/, this.sendEmailNotification(alert, email)];
          case 2:
            _d.sent();
            _d.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            if (!(actions.sendSMS && actions.smsRecipients)) return [3 /*break*/, 8];
            (_b = 0), (_c = actions.smsRecipients);
            _d.label = 5;
          case 5:
            if (!(_b < _c.length)) return [3 /*break*/, 8];
            phone = _c[_b];
            return [4 /*yield*/, this.sendSMSNotification(alert, phone)];
          case 6:
            _d.sent();
            _d.label = 7;
          case 7:
            _b++;
            return [3 /*break*/, 5];
          case 8:
            if (!actions.sendPushNotification) return [3 /*break*/, 10];
            return [4 /*yield*/, this.sendPushNotification(alert)];
          case 9:
            _d.sent();
            _d.label = 10;
          case 10:
            return [3 /*break*/, 12];
          case 11:
            error_15 = _d.sent();
            logger_1.logger.error("Error sending alert notifications:", error_15);
            return [3 /*break*/, 12];
          case 12:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Send email notification
   */
  AlertSystem.prototype.sendEmailNotification = function (alert, email) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation would depend on email service (SendGrid, AWS SES, etc.)
        logger_1.logger.info(
          "Sending email notification to ".concat(email, " for alert ").concat(alert.id),
        );
        return [2 /*return*/];
      });
    });
  };
  /**
   * Send SMS notification
   */
  AlertSystem.prototype.sendSMSNotification = function (alert, phone) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation would depend on SMS service (Twilio, AWS SNS, etc.)
        logger_1.logger.info(
          "Sending SMS notification to ".concat(phone, " for alert ").concat(alert.id),
        );
        return [2 /*return*/];
      });
    });
  };
  /**
   * Send push notification
   */
  AlertSystem.prototype.sendPushNotification = function (alert) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation would depend on push service (Firebase, OneSignal, etc.)
        logger_1.logger.info("Sending push notification for alert ".concat(alert.id));
        return [2 /*return*/];
      });
    });
  };
  /**
   * Start periodic cleanup of old alerts
   */
  AlertSystem.prototype.startPeriodicCleanup = function () {
    var _this = this;
    setInterval(
      function () {
        return __awaiter(_this, void 0, void 0, function () {
          var error_16;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, this.cleanupOldAlerts()];
              case 1:
                _a.sent();
                return [3 /*break*/, 3];
              case 2:
                error_16 = _a.sent();
                logger_1.logger.error("Error during periodic cleanup:", error_16);
                return [3 /*break*/, 3];
              case 3:
                return [2 /*return*/];
            }
          });
        });
      },
      24 * 60 * 60 * 1000,
    ); // Daily cleanup
  };
  /**
   * Cleanup old resolved/dismissed alerts
   */
  AlertSystem.prototype.cleanupOldAlerts = function () {
    return __awaiter(this, void 0, void 0, function () {
      var thirtyDaysAgo, error_17;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return [
              4 /*yield*/,
              this.supabase
                .from("alert_instances")
                .delete()
                .in("status", ["resolved", "dismissed"])
                .lt("triggered_at", thirtyDaysAgo.toISOString()),
            ];
          case 1:
            _a.sent();
            logger_1.logger.info("Completed periodic cleanup of old alerts");
            return [3 /*break*/, 3];
          case 2:
            error_17 = _a.sent();
            logger_1.logger.error("Error cleaning up old alerts:", error_17);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get alert statistics for dashboard
   */
  AlertSystem.prototype.getAlertStatistics = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, stats, error_18;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("alert_instances")
                .select("severity, status")
                .eq("clinic_id", clinicId)
                .gte("triggered_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              logger_1.logger.error("Error fetching alert statistics:", error);
              return [
                2 /*return*/,
                { total: 0, active: 0, critical: 0, high: 0, medium: 0, low: 0 },
              ];
            }
            stats = {
              total: data.length,
              active: data.filter(function (a) {
                return a.status === "active";
              }).length,
              critical: data.filter(function (a) {
                return a.severity === "critical";
              }).length,
              high: data.filter(function (a) {
                return a.severity === "high";
              }).length,
              medium: data.filter(function (a) {
                return a.severity === "medium";
              }).length,
              low: data.filter(function (a) {
                return a.severity === "low";
              }).length,
            };
            return [2 /*return*/, stats];
          case 2:
            error_18 = _b.sent();
            logger_1.logger.error("Error getting alert statistics:", error_18);
            return [2 /*return*/, { total: 0, active: 0, critical: 0, high: 0, medium: 0, low: 0 }];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  return AlertSystem;
})();
exports.AlertSystem = AlertSystem;
// Export singleton instance
var createalertSystem = function () {
  return new AlertSystem();
};
exports.createalertSystem = createalertSystem;
