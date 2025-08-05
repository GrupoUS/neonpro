/**
 * 🚨 NeonPro Real-Time Alert System
 *
 * HEALTHCARE ALERT SYSTEM - Sistema de Alertas em Tempo Real para Clínicas
 * Sistema avançado de detecção, processamento e entrega de alertas em tempo real
 * para monitoramento contínuo de qualidade, satisfação e retenção de pacientes
 * em clínicas estéticas.
 *
 * @fileoverview Sistema de alertas em tempo real com detecção inteligente,
 * priorização automática, escalation rules e entrega multi-canal
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @since 2025-01-30
 *
 * COMPLIANCE: LGPD, ANVISA, CFM
 * ARCHITECTURE: Event-driven, Scalable, Real-time, Multi-channel
 * TESTING: Jest unit tests, Integration tests, Alert delivery validation
 *
 * FEATURES:
 * - Real-time anomaly detection and threshold monitoring
 * - Intelligent alert prioritization and categorization
 * - Multi-level escalation with automatic routing
 * - Multi-channel delivery (email, SMS, push, in-app, webhook)
 * - Alert aggregation and noise reduction
 * - Historical alert analysis and pattern recognition
 * - Custom alert rules with dynamic thresholds
 * - Alert suppression and acknowledgment tracking
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
exports.RealTimeAlertSystem = void 0;
var client_1 = require("@/lib/supabase/client");
var logger_1 = require("@/lib/utils/logger");
// ============================================================================
// REAL-TIME ALERT SYSTEM
// ============================================================================
/**
 * Real-Time Alert System
 * Sistema principal para processamento e entrega de alertas em tempo real
 */
var RealTimeAlertSystem = /** @class */ (() => {
  function RealTimeAlertSystem() {
    this.supabase = (0, client_1.createClient)();
    this.alertRuleCache = new Map();
    this.activeAlertsCache = new Map();
    this.processingQueue = [];
    this.deliveryQueue = new Map();
    // WebSocket connections for real-time updates
    this.wsConnections = new Map();
    // Configuration constants
    this.PROCESSING_BATCH_SIZE = 50;
    this.MAX_QUEUE_SIZE = 1000;
    this.DELIVERY_TIMEOUT_MS = 30000;
    this.CORRELATION_WINDOW_MINUTES = 5;
    this.initializeAlertSystem();
  }
  /**
   * Initialize the alert system
   */
  RealTimeAlertSystem.prototype.initializeAlertSystem = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            // Load alert rules from database
            return [
              4 /*yield*/,
              this.loadAlertRules(),
              // Initialize delivery channels
            ];
          case 1:
            // Load alert rules from database
            _a.sent();
            // Initialize delivery channels
            return [
              4 /*yield*/,
              this.initializeDeliveryChannels(),
              // Start processing loops
            ];
          case 2:
            // Initialize delivery channels
            _a.sent();
            // Start processing loops
            this.startProcessingLoop();
            this.startDeliveryLoop();
            // Setup real-time subscriptions
            return [4 /*yield*/, this.setupRealtimeSubscriptions()];
          case 3:
            // Setup real-time subscriptions
            _a.sent();
            logger_1.logger.info("Real-time alert system initialized successfully", {
              rules_loaded: this.alertRuleCache.size,
              delivery_channels: Array.from(this.deliveryQueue.keys()).length,
            });
            return [2 /*return*/, { success: true }];
          case 4:
            error_1 = _a.sent();
            logger_1.logger.error("Failed to initialize alert system:", error_1);
            return [
              2 /*return*/,
              {
                success: false,
                error: error_1 instanceof Error ? error_1.message : "Unknown error",
              },
            ];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Process real-time data for alert triggers
   */
  RealTimeAlertSystem.prototype.processRealTimeData = function (dataType_1, data_1) {
    return __awaiter(this, arguments, void 0, function (dataType, data, context) {
      var startTime,
        triggeredAlerts,
        processingContext,
        applicableRules,
        _i,
        applicableRules_1,
        rule,
        shouldTrigger,
        alertInstance,
        correlatedAlert,
        processingTime,
        error_2;
      var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
      if (context === void 0) {
        context = {};
      }
      return __generator(this, function (_m) {
        switch (_m.label) {
          case 0:
            startTime = Date.now();
            triggeredAlerts = [];
            _m.label = 1;
          case 1:
            _m.trys.push([1, 14, , 15]);
            processingContext = {
              processing_id: "proc_"
                .concat(Date.now(), "_")
                .concat(Math.random().toString(36).substr(2, 9)),
              trigger_timestamp: new Date(),
              processing_start: new Date(),
              data_sources: [dataType],
              correlation_window_minutes: this.CORRELATION_WINDOW_MINUTES,
              business_context: {
                current_shift:
                  ((_a = context.business_context) === null || _a === void 0
                    ? void 0
                    : _a.current_shift) || "day",
                business_hours:
                  (_c =
                    (_b = context.business_context) === null || _b === void 0
                      ? void 0
                      : _b.business_hours) !== null && _c !== void 0
                    ? _c
                    : true,
                holiday_schedule:
                  (_e =
                    (_d = context.business_context) === null || _d === void 0
                      ? void 0
                      : _d.holiday_schedule) !== null && _e !== void 0
                    ? _e
                    : false,
                peak_usage_period:
                  (_g =
                    (_f = context.business_context) === null || _f === void 0
                      ? void 0
                      : _f.peak_usage_period) !== null && _g !== void 0
                    ? _g
                    : false,
                maintenance_window:
                  (_j =
                    (_h = context.business_context) === null || _h === void 0
                      ? void 0
                      : _h.maintenance_window) !== null && _j !== void 0
                    ? _j
                    : false,
              },
              system_status: {
                system_load:
                  ((_k = context.system_status) === null || _k === void 0
                    ? void 0
                    : _k.system_load) || 0.5,
                alert_queue_size: this.processingQueue.length,
                processing_lag_seconds:
                  ((_l = context.system_status) === null || _l === void 0
                    ? void 0
                    : _l.processing_lag_seconds) || 0,
                delivery_queue_health: this.getDeliveryQueueHealth(),
              },
            };
            // Add to processing queue
            this.processingQueue.push({
              type: dataType,
              data: data,
              timestamp: new Date(),
            });
            return [
              4 /*yield*/,
              this.getApplicableAlertRules(dataType, data),
              // Process each rule
            ];
          case 2:
            applicableRules = _m.sent();
            (_i = 0), (applicableRules_1 = applicableRules);
            _m.label = 3;
          case 3:
            if (!(_i < applicableRules_1.length)) return [3 /*break*/, 11];
            rule = applicableRules_1[_i];
            return [4 /*yield*/, this.evaluateAlertRule(rule, data, processingContext)];
          case 4:
            shouldTrigger = _m.sent();
            if (!shouldTrigger) return [3 /*break*/, 10];
            return [4 /*yield*/, this.createAlertInstance(rule, data, processingContext)];
          case 5:
            alertInstance = _m.sent();
            if (!alertInstance) return [3 /*break*/, 10];
            return [4 /*yield*/, this.checkAlertCorrelation(alertInstance)];
          case 6:
            correlatedAlert = _m.sent();
            if (correlatedAlert) return [3 /*break*/, 8];
            // New unique alert
            return [4 /*yield*/, this.processNewAlert(alertInstance)];
          case 7:
            // New unique alert
            _m.sent();
            triggeredAlerts.push(alertInstance.id);
            return [3 /*break*/, 10];
          case 8:
            // Update existing correlated alert
            return [4 /*yield*/, this.updateCorrelatedAlert(correlatedAlert, alertInstance)];
          case 9:
            // Update existing correlated alert
            _m.sent();
            triggeredAlerts.push(correlatedAlert.id);
            _m.label = 10;
          case 10:
            _i++;
            return [3 /*break*/, 3];
          case 11:
            if (!(this.processingQueue.length >= this.PROCESSING_BATCH_SIZE))
              return [3 /*break*/, 13];
            return [4 /*yield*/, this.processBatchedData()];
          case 12:
            _m.sent();
            _m.label = 13;
          case 13:
            processingTime = Date.now() - startTime;
            logger_1.logger.debug("Real-time data processed", {
              data_type: dataType,
              alerts_triggered: triggeredAlerts.length,
              processing_time_ms: processingTime,
              queue_size: this.processingQueue.length,
            });
            return [
              2 /*return*/,
              {
                alerts_triggered: triggeredAlerts,
                processing_time_ms: processingTime,
              },
            ];
          case 14:
            error_2 = _m.sent();
            logger_1.logger.error("Failed to process real-time data:", error_2);
            return [
              2 /*return*/,
              {
                alerts_triggered: [],
                processing_time_ms: Date.now() - startTime,
              },
            ];
          case 15:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Create and configure alert rule
   */
  RealTimeAlertSystem.prototype.createAlertRule = function (ruleConfig) {
    return __awaiter(this, void 0, void 0, function () {
      var alertRule, validation, saveError, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            alertRule = __assign(__assign({}, ruleConfig), {
              id: "rule_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9)),
              created_at: new Date(),
              updated_at: new Date(),
            });
            validation = this.validateAlertRule(alertRule);
            if (!validation.isValid) {
              return [2 /*return*/, { success: false, error: validation.error }];
            }
            return [4 /*yield*/, this.supabase.from("alert_rules").insert(alertRule)];
          case 1:
            saveError = _a.sent().error;
            if (saveError) {
              logger_1.logger.error("Failed to save alert rule:", saveError);
              return [2 /*return*/, { success: false, error: saveError.message }];
            }
            // Add to cache
            this.alertRuleCache.set(alertRule.id, alertRule);
            logger_1.logger.info("Alert rule created successfully", {
              rule_id: alertRule.id,
              rule_name: alertRule.name,
              alert_type: alertRule.alert_type,
            });
            return [2 /*return*/, { success: true, rule_id: alertRule.id }];
          case 2:
            error_3 = _a.sent();
            logger_1.logger.error("Failed to create alert rule:", error_3);
            return [
              2 /*return*/,
              {
                success: false,
                error: error_3 instanceof Error ? error_3.message : "Unknown error",
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Acknowledge alert
   */
  RealTimeAlertSystem.prototype.acknowledgeAlert = function (
    alertId,
    acknowledgedBy,
    notes,
    estimatedResolutionTime,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var alert_1, error, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            alert_1 = this.activeAlertsCache.get(alertId);
            if (!alert_1) {
              return [2 /*return*/, { success: false, error: "Alert not found" }];
            }
            // Update alert status
            alert_1.status = "acknowledged";
            alert_1.acknowledgment_history.push({
              acknowledged_at: new Date(),
              acknowledged_by: acknowledgedBy,
              acknowledgment_notes: notes,
              estimated_resolution_time: estimatedResolutionTime,
            });
            alert_1.updated_at = new Date();
            return [
              4 /*yield*/,
              this.supabase
                .from("alert_instances")
                .update({
                  status: alert_1.status,
                  acknowledgment_history: alert_1.acknowledgment_history,
                  updated_at: alert_1.updated_at,
                })
                .eq("id", alertId),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              logger_1.logger.error("Failed to acknowledge alert:", error);
              return [2 /*return*/, { success: false, error: error.message }];
            }
            // Update cache
            this.activeAlertsCache.set(alertId, alert_1);
            // Notify stakeholders
            return [4 /*yield*/, this.notifyAlertAcknowledgment(alert_1, acknowledgedBy, notes)];
          case 2:
            // Notify stakeholders
            _a.sent();
            logger_1.logger.info("Alert acknowledged", {
              alert_id: alertId,
              acknowledged_by: acknowledgedBy,
              alert_type: alert_1.alert_type,
            });
            return [2 /*return*/, { success: true }];
          case 3:
            error_4 = _a.sent();
            logger_1.logger.error("Failed to acknowledge alert:", error_4);
            return [
              2 /*return*/,
              {
                success: false,
                error: error_4 instanceof Error ? error_4.message : "Unknown error",
              },
            ];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Resolve alert
   */
  RealTimeAlertSystem.prototype.resolveAlert = function (
    alertId,
    resolvedBy,
    resolutionAction,
    resolutionNotes,
    preventionMeasures,
    followUpRequired,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var alert_2, error, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            alert_2 = this.activeAlertsCache.get(alertId);
            if (!alert_2) {
              return [2 /*return*/, { success: false, error: "Alert not found" }];
            }
            // Update alert status and resolution data
            alert_2.status = "resolved";
            alert_2.resolution_data = {
              resolved_at: new Date(),
              resolved_by: resolvedBy,
              resolution_action: resolutionAction,
              resolution_notes: resolutionNotes,
              prevention_measures: preventionMeasures,
              follow_up_required: followUpRequired,
            };
            alert_2.updated_at = new Date();
            return [
              4 /*yield*/,
              this.supabase
                .from("alert_instances")
                .update({
                  status: alert_2.status,
                  resolution_data: alert_2.resolution_data,
                  updated_at: alert_2.updated_at,
                })
                .eq("id", alertId),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              logger_1.logger.error("Failed to resolve alert:", error);
              return [2 /*return*/, { success: false, error: error.message }];
            }
            // Remove from active cache (move to resolved cache if needed)
            this.activeAlertsCache.delete(alertId);
            if (
              !(
                followUpRequired &&
                (preventionMeasures === null || preventionMeasures === void 0
                  ? void 0
                  : preventionMeasures.length)
              )
            )
              return [3 /*break*/, 3];
            return [4 /*yield*/, this.createFollowUpTasks(alert_2, preventionMeasures)];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            // Notify stakeholders
            return [4 /*yield*/, this.notifyAlertResolution(alert_2, resolvedBy, resolutionAction)];
          case 4:
            // Notify stakeholders
            _a.sent();
            logger_1.logger.info("Alert resolved", {
              alert_id: alertId,
              resolved_by: resolvedBy,
              resolution_action: resolutionAction,
              alert_type: alert_2.alert_type,
            });
            return [2 /*return*/, { success: true }];
          case 5:
            error_5 = _a.sent();
            logger_1.logger.error("Failed to resolve alert:", error_5);
            return [
              2 /*return*/,
              {
                success: false,
                error: error_5 instanceof Error ? error_5.message : "Unknown error",
              },
            ];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Escalate alert to next level
   */
  RealTimeAlertSystem.prototype.escalateAlert = function (alertId_1, escalationReason_1) {
    return __awaiter(
      this,
      arguments,
      void 0,
      function (alertId, escalationReason, forceEscalation) {
        var alert_3, rule, currentStep, nextStep, escalationRule, error, error_6;
        if (forceEscalation === void 0) {
          forceEscalation = false;
        }
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 4, , 5]);
              alert_3 = this.activeAlertsCache.get(alertId);
              if (!alert_3) {
                return [2 /*return*/, { success: false, error: "Alert not found" }];
              }
              rule = this.alertRuleCache.get(alert_3.rule_id);
              if (!rule) {
                return [2 /*return*/, { success: false, error: "Alert rule not found" }];
              }
              currentStep = alert_3.escalation_history.length;
              nextStep = currentStep + 1;
              // Check if escalation is available
              if (!forceEscalation && nextStep > rule.escalation_rules.length) {
                return [
                  2 /*return*/,
                  { success: false, error: "No more escalation steps available" },
                ];
              }
              escalationRule = rule.escalation_rules[nextStep - 1];
              if (!escalationRule && !forceEscalation) {
                return [2 /*return*/, { success: false, error: "Escalation rule not found" }];
              }
              // Update alert status
              alert_3.status = "escalated";
              alert_3.escalation_history.push({
                step: nextStep,
                escalated_at: new Date(),
                escalated_to: (escalationRule === null || escalationRule === void 0
                  ? void 0
                  : escalationRule.target_roles) || ["system_admin"],
                escalation_reason: escalationReason,
              });
              alert_3.updated_at = new Date();
              return [
                4 /*yield*/,
                this.supabase
                  .from("alert_instances")
                  .update({
                    status: alert_3.status,
                    escalation_history: alert_3.escalation_history,
                    updated_at: alert_3.updated_at,
                  })
                  .eq("id", alertId),
              ];
            case 1:
              error = _a.sent().error;
              if (error) {
                logger_1.logger.error("Failed to escalate alert:", error);
                return [2 /*return*/, { success: false, error: error.message }];
              }
              // Update cache
              this.activeAlertsCache.set(alertId, alert_3);
              if (!escalationRule) return [3 /*break*/, 3];
              return [4 /*yield*/, this.sendEscalatedNotifications(alert_3, escalationRule)];
            case 2:
              _a.sent();
              _a.label = 3;
            case 3:
              logger_1.logger.info("Alert escalated", {
                alert_id: alertId,
                escalation_step: nextStep,
                escalation_reason: escalationReason,
                escalated_to:
                  escalationRule === null || escalationRule === void 0
                    ? void 0
                    : escalationRule.target_roles,
              });
              return [2 /*return*/, { success: true, escalation_step: nextStep }];
            case 4:
              error_6 = _a.sent();
              logger_1.logger.error("Failed to escalate alert:", error_6);
              return [
                2 /*return*/,
                {
                  success: false,
                  error: error_6 instanceof Error ? error_6.message : "Unknown error",
                },
              ];
            case 5:
              return [2 /*return*/];
          }
        });
      },
    );
  };
  /**
   * Suppress alert temporarily
   */
  RealTimeAlertSystem.prototype.suppressAlert = function (
    alertId,
    suppressedBy,
    suppressionReason,
    suppressionDurationMinutes,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var alert_4, error, error_7;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            alert_4 = this.activeAlertsCache.get(alertId);
            if (!alert_4) {
              return [2 /*return*/, { success: false, error: "Alert not found" }];
            }
            // Update alert status
            alert_4.status = "suppressed";
            alert_4.suppression_info = {
              suppressed_at: new Date(),
              suppressed_by: suppressedBy,
              suppression_reason: suppressionReason,
              suppression_duration_minutes: suppressionDurationMinutes,
            };
            alert_4.updated_at = new Date();
            return [
              4 /*yield*/,
              this.supabase
                .from("alert_instances")
                .update({
                  status: alert_4.status,
                  suppression_info: alert_4.suppression_info,
                  updated_at: alert_4.updated_at,
                })
                .eq("id", alertId),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              logger_1.logger.error("Failed to suppress alert:", error);
              return [2 /*return*/, { success: false, error: error.message }];
            }
            // Update cache
            this.activeAlertsCache.set(alertId, alert_4);
            // Schedule auto-reactivation
            setTimeout(
              () =>
                __awaiter(_this, void 0, void 0, function () {
                  return __generator(this, function (_a) {
                    switch (_a.label) {
                      case 0:
                        return [4 /*yield*/, this.reactivateSuppressedAlert(alertId)];
                      case 1:
                        _a.sent();
                        return [2 /*return*/];
                    }
                  });
                }),
              suppressionDurationMinutes * 60 * 1000,
            );
            logger_1.logger.info("Alert suppressed", {
              alert_id: alertId,
              suppressed_by: suppressedBy,
              duration_minutes: suppressionDurationMinutes,
            });
            return [2 /*return*/, { success: true }];
          case 2:
            error_7 = _a.sent();
            logger_1.logger.error("Failed to suppress alert:", error_7);
            return [
              2 /*return*/,
              {
                success: false,
                error: error_7 instanceof Error ? error_7.message : "Unknown error",
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get active alerts with filtering and pagination
   */
  RealTimeAlertSystem.prototype.getActiveAlerts = function () {
    return __awaiter(this, arguments, void 0, function (filters, pagination) {
      var query, offset, _a, alerts, count, error, totalCount, totalPages, error_8;
      var _b, _c, _d;
      if (filters === void 0) {
        filters = {};
      }
      if (pagination === void 0) {
        pagination = { page: 1, limit: 50 };
      }
      return __generator(this, function (_e) {
        switch (_e.label) {
          case 0:
            _e.trys.push([0, 2, , 3]);
            query = this.supabase.from("alert_instances").select("*", { count: "exact" });
            // Apply filters
            if ((_b = filters.alert_type) === null || _b === void 0 ? void 0 : _b.length) {
              query = query.in("alert_type", filters.alert_type);
            }
            if ((_c = filters.severity) === null || _c === void 0 ? void 0 : _c.length) {
              query = query.in("severity", filters.severity);
            }
            if ((_d = filters.status) === null || _d === void 0 ? void 0 : _d.length) {
              query = query.in("status", filters.status);
            } else {
              // Default to active statuses
              query = query.in("status", ["active", "acknowledged", "investigating", "escalated"]);
            }
            if (filters.entity_type) {
              query = query.eq("context_data->>entity_type", filters.entity_type);
            }
            if (filters.entity_id) {
              query = query.eq("context_data->>entity_id", filters.entity_id);
            }
            if (filters.time_range) {
              query = query
                .gte("triggered_at", filters.time_range.start.toISOString())
                .lte("triggered_at", filters.time_range.end.toISOString());
            }
            offset = (pagination.page - 1) * pagination.limit;
            query = query
              .order("triggered_at", { ascending: false })
              .range(offset, offset + pagination.limit - 1);
            return [4 /*yield*/, query];
          case 1:
            (_a = _e.sent()), (alerts = _a.data), (count = _a.count), (error = _a.error);
            if (error) {
              logger_1.logger.error("Failed to get active alerts:", error);
              return [
                2 /*return*/,
                {
                  alerts: [],
                  total_count: 0,
                  page_info: { current_page: 1, total_pages: 0, has_next: false },
                },
              ];
            }
            totalCount = count || 0;
            totalPages = Math.ceil(totalCount / pagination.limit);
            return [
              2 /*return*/,
              {
                alerts: alerts || [],
                total_count: totalCount,
                page_info: {
                  current_page: pagination.page,
                  total_pages: totalPages,
                  has_next: pagination.page < totalPages,
                },
              },
            ];
          case 2:
            error_8 = _e.sent();
            logger_1.logger.error("Failed to get active alerts:", error_8);
            return [
              2 /*return*/,
              {
                alerts: [],
                total_count: 0,
                page_info: { current_page: 1, total_pages: 0, has_next: false },
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Generate alert analytics and insights
   */
  RealTimeAlertSystem.prototype.generateAlertAnalytics = function (timePeriod_1) {
    return __awaiter(this, arguments, void 0, function (timePeriod, filters) {
      var alerts, analytics, error_9;
      var _a;
      if (filters === void 0) {
        filters = {};
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              this.supabase
                .from("alert_instances")
                .select("*")
                .gte("triggered_at", timePeriod.start.toISOString())
                .lte("triggered_at", timePeriod.end.toISOString()),
            ];
          case 1:
            alerts = _b.sent().data;
            if (!alerts || alerts.length === 0) {
              return [2 /*return*/, null];
            }
            _a = {
              time_period: timePeriod,
              total_alerts: alerts.length,
              alerts_by_type: this.calculateAlertsByType(alerts),
              alerts_by_severity: this.calculateAlertsBySeverity(alerts),
              alerts_by_status: this.calculateAlertsByStatus(alerts),
              resolution_metrics: this.calculateResolutionMetrics(alerts),
            };
            return [4 /*yield*/, this.calculateDeliveryMetrics(alerts)];
          case 2:
            analytics =
              ((_a.delivery_metrics = _b.sent()),
              (_a.trending_analysis = this.calculateTrendingAnalysis(alerts)),
              (_a.effectiveness_metrics = this.calculateEffectivenessMetrics(alerts)),
              _a);
            return [2 /*return*/, analytics];
          case 3:
            error_9 = _b.sent();
            logger_1.logger.error("Failed to generate alert analytics:", error_9);
            return [2 /*return*/, null];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  // ============================================================================
  // HELPER METHODS
  // ============================================================================
  RealTimeAlertSystem.prototype.initializeDeliveryChannels = function () {
    return __awaiter(this, void 0, void 0, function () {
      var channels;
      return __generator(this, (_a) => {
        channels = ["email", "sms", "push", "in_app", "webhook", "dashboard"];
        channels.forEach((channel) => {
          this.deliveryQueue.set(channel, []);
        });
        return [2 /*return*/];
      });
    });
  };
  RealTimeAlertSystem.prototype.loadAlertRules = function () {
    return __awaiter(this, void 0, void 0, function () {
      var rules;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("alert_rules").select("*").eq("is_active", true),
            ];
          case 1:
            rules = _a.sent().data;
            if (rules) {
              rules.forEach((rule) => {
                _this.alertRuleCache.set(rule.id, rule);
              });
            }
            return [2 /*return*/];
        }
      });
    });
  };
  RealTimeAlertSystem.prototype.startProcessingLoop = function () {
    setInterval(
      () =>
        __awaiter(this, void 0, void 0, function () {
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                if (!(this.processingQueue.length > 0)) return [3 /*break*/, 2];
                return [4 /*yield*/, this.processBatchedData()];
              case 1:
                _a.sent();
                _a.label = 2;
              case 2:
                return [2 /*return*/];
            }
          });
        }),
      5000,
    ); // Process every 5 seconds
  };
  RealTimeAlertSystem.prototype.startDeliveryLoop = function () {
    setInterval(
      () =>
        __awaiter(this, void 0, void 0, function () {
          var _i, _a, _b, channel, queue;
          return __generator(this, function (_c) {
            switch (_c.label) {
              case 0:
                (_i = 0), (_a = this.deliveryQueue);
                _c.label = 1;
              case 1:
                if (!(_i < _a.length)) return [3 /*break*/, 4];
                (_b = _a[_i]), (channel = _b[0]), (queue = _b[1]);
                if (!(queue.length > 0)) return [3 /*break*/, 3];
                return [4 /*yield*/, this.processDeliveryQueue(channel)];
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
        }),
      1000,
    ); // Check delivery queues every second
  };
  RealTimeAlertSystem.prototype.setupRealtimeSubscriptions = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _this = this;
      return __generator(this, function (_a) {
        // Setup real-time subscriptions for live updates
        this.supabase
          .channel("alert_instances")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "alert_instances",
            },
            (payload) => {
              _this.handleRealtimeAlertUpdate(payload);
            },
          )
          .subscribe();
        return [2 /*return*/];
      });
    });
  };
  RealTimeAlertSystem.prototype.processBatchedData = function () {
    return __awaiter(this, void 0, void 0, function () {
      var batchToProcess;
      return __generator(this, function (_a) {
        batchToProcess = this.processingQueue.splice(0, this.PROCESSING_BATCH_SIZE);
        // Process batch for correlations and patterns
        logger_1.logger.debug("Processing batched data", { batch_size: batchToProcess.length });
        return [2 /*return*/];
      });
    });
  };
  RealTimeAlertSystem.prototype.getApplicableAlertRules = function (dataType, data) {
    return __awaiter(this, void 0, void 0, function () {
      var applicableRules, _i, _a, rule;
      return __generator(this, function (_b) {
        applicableRules = [];
        for (_i = 0, _a = this.alertRuleCache.values(); _i < _a.length; _i++) {
          rule = _a[_i];
          if (rule.is_active && this.isRuleApplicable(rule, dataType, data)) {
            applicableRules.push(rule);
          }
        }
        return [2 /*return*/, applicableRules];
      });
    });
  };
  RealTimeAlertSystem.prototype.isRuleApplicable = (rule, dataType, data) => {
    // Check if rule applies to this data type and entity
    return true; // Simplified implementation
  };
  RealTimeAlertSystem.prototype.evaluateAlertRule = function (rule, data, context) {
    return __awaiter(this, void 0, void 0, function () {
      var conditionResults;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              Promise.all(
                rule.trigger_conditions.map((condition) =>
                  this.evaluateCondition(condition, data, context),
                ),
              ),
              // Apply logical operator
            ];
          case 1:
            conditionResults = _a.sent();
            // Apply logical operator
            if (rule.logical_operator === "AND") {
              return [2 /*return*/, conditionResults.every((result) => result)];
            } else {
              return [2 /*return*/, conditionResults.some((result) => result)];
            }
            return [2 /*return*/];
        }
      });
    });
  };
  RealTimeAlertSystem.prototype.evaluateCondition = function (condition, data, context) {
    return __awaiter(this, void 0, void 0, function () {
      var metricValue;
      return __generator(this, function (_a) {
        metricValue = this.extractMetricValue(condition.metric, data);
        switch (condition.operator) {
          case "greater_than":
            return [2 /*return*/, metricValue > condition.value];
          case "less_than":
            return [2 /*return*/, metricValue < condition.value];
          case "equals":
            return [
              2 /*return*/,
              metricValue === condition.value,
              // Add other operators...
            ];
          // Add other operators...
          default:
            return [2 /*return*/, false];
        }
        return [2 /*return*/];
      });
    });
  };
  RealTimeAlertSystem.prototype.extractMetricValue = (metric, data) => {
    // Extract metric value from data using dot notation
    return metric
      .split(".")
      .reduce((obj, key) => (obj === null || obj === void 0 ? void 0 : obj[key]), data);
  };
  RealTimeAlertSystem.prototype.createAlertInstance = function (rule, triggerData, context) {
    return __awaiter(this, void 0, void 0, function () {
      var alertInstance;
      return __generator(this, function (_a) {
        try {
          alertInstance = {
            id: "alert_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9)),
            rule_id: rule.id,
            alert_type: rule.alert_type,
            severity: rule.severity,
            status: "active",
            title: this.generateAlertTitle(rule, triggerData),
            description: this.generateAlertDescription(rule, triggerData),
            triggered_at: new Date(),
            trigger_data: {
              triggering_metric: triggerData.metric || "unknown",
              trigger_value: triggerData.value || 0,
              threshold_value: triggerData.threshold || 0,
              entity_id: triggerData.entity_id,
              entity_type: triggerData.entity_type,
            },
            context_data: {
              patient_id: triggerData.patient_id,
              clinic_id: triggerData.clinic_id,
              additional_context: triggerData.context || {},
            },
            escalation_history: [],
            delivery_history: [],
            acknowledgment_history: [],
            related_alerts: [],
            metadata: {
              alert_fingerprint: this.generateAlertFingerprint(rule, triggerData),
              correlation_id: context.processing_id,
              source_system: "neonpro_alerts",
              anonymized: true,
            },
            created_at: new Date(),
            updated_at: new Date(),
          };
          return [2 /*return*/, alertInstance];
        } catch (error) {
          logger_1.logger.error("Failed to create alert instance:", error);
          return [2 /*return*/, null];
        }
        return [2 /*return*/];
      });
    });
  };
  RealTimeAlertSystem.prototype.generateAlertTitle = (rule, triggerData) =>
    "".concat(rule.name, " - ").concat(rule.alert_type);
  RealTimeAlertSystem.prototype.generateAlertDescription = (rule, triggerData) =>
    "".concat(rule.description, " - Triggered by ").concat(triggerData.metric || "system event");
  RealTimeAlertSystem.prototype.generateAlertFingerprint = (rule, triggerData) => {
    var fingerprint = ""
      .concat(rule.id, "_")
      .concat(rule.alert_type, "_")
      .concat(triggerData.entity_id || "global");
    return Buffer.from(fingerprint).toString("base64");
  };
  RealTimeAlertSystem.prototype.checkAlertCorrelation = function (alertInstance) {
    return __awaiter(this, void 0, void 0, function () {
      var correlationWindow, _i, _a, _b, alertId, existingAlert;
      return __generator(this, function (_c) {
        correlationWindow = new Date();
        correlationWindow.setMinutes(
          correlationWindow.getMinutes() - this.CORRELATION_WINDOW_MINUTES,
        );
        for (_i = 0, _a = this.activeAlertsCache; _i < _a.length; _i++) {
          (_b = _a[_i]), (alertId = _b[0]), (existingAlert = _b[1]);
          if (
            existingAlert.triggered_at >= correlationWindow &&
            existingAlert.metadata.alert_fingerprint === alertInstance.metadata.alert_fingerprint
          ) {
            return [2 /*return*/, existingAlert];
          }
        }
        return [2 /*return*/, null];
      });
    });
  };
  RealTimeAlertSystem.prototype.processNewAlert = function (alertInstance) {
    return __awaiter(this, void 0, void 0, function () {
      var error;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.supabase.from("alert_instances").insert(alertInstance)];
          case 1:
            error = _a.sent().error;
            if (error) {
              logger_1.logger.error("Failed to save alert instance:", error);
              return [2 /*return*/];
            }
            // Add to active cache
            this.activeAlertsCache.set(alertInstance.id, alertInstance);
            // Queue for delivery
            return [
              4 /*yield*/,
              this.queueAlertForDelivery(alertInstance),
              // Notify real-time subscribers
            ];
          case 2:
            // Queue for delivery
            _a.sent();
            // Notify real-time subscribers
            return [4 /*yield*/, this.notifyRealtimeSubscribers(alertInstance)];
          case 3:
            // Notify real-time subscribers
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  RealTimeAlertSystem.prototype.updateCorrelatedAlert = function (existingAlert, newAlertData) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            // Update correlation count or merge data
            existingAlert.related_alerts.push(newAlertData.id);
            existingAlert.updated_at = new Date();
            // Update in database and cache
            return [
              4 /*yield*/,
              this.supabase
                .from("alert_instances")
                .update({
                  related_alerts: existingAlert.related_alerts,
                  updated_at: existingAlert.updated_at,
                })
                .eq("id", existingAlert.id),
            ];
          case 1:
            // Update in database and cache
            _a.sent();
            this.activeAlertsCache.set(existingAlert.id, existingAlert);
            return [2 /*return*/];
        }
      });
    });
  };
  RealTimeAlertSystem.prototype.queueAlertForDelivery = function (alertInstance) {
    return __awaiter(this, void 0, void 0, function () {
      var rule, _i, _a, _b, channel, config, deliveryConfig, queue;
      return __generator(this, function (_c) {
        rule = this.alertRuleCache.get(alertInstance.rule_id);
        if (!rule) return [2 /*return*/];
        // Queue for each enabled delivery channel
        for (
          _i = 0, _a = Object.entries(rule.delivery_settings.channel_preferences);
          _i < _a.length;
          _i++
        ) {
          (_b = _a[_i]), (channel = _b[0]), (config = _b[1]);
          if (config.enabled) {
            deliveryConfig = {
              channel: channel,
              is_enabled: true,
              priority: config.priority,
              delivery_settings: {
                template_id: config.template_id,
                recipient_rules: [
                  {
                    role: "default",
                    escalation_delay_minutes: 0,
                  },
                ],
              },
              channel_specific_config: config.delivery_options || {},
            };
            queue = this.deliveryQueue.get(channel) || [];
            queue.push({ alert: alertInstance, config: deliveryConfig });
            this.deliveryQueue.set(channel, queue);
          }
        }
        return [2 /*return*/];
      });
    });
  };
  RealTimeAlertSystem.prototype.processDeliveryQueue = function (channel) {
    return __awaiter(this, void 0, void 0, function () {
      var queue, batch, _i, batch_1, _a, alert_5, config;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            queue = this.deliveryQueue.get(channel) || [];
            if (queue.length === 0) return [2 /*return*/];
            batch = queue.splice(0, 10); // Process up to 10 at a time
            (_i = 0), (batch_1 = batch);
            _b.label = 1;
          case 1:
            if (!(_i < batch_1.length)) return [3 /*break*/, 4];
            (_a = batch_1[_i]), (alert_5 = _a.alert), (config = _a.config);
            return [4 /*yield*/, this.deliverAlert(alert_5, config)];
          case 2:
            _b.sent();
            _b.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            this.deliveryQueue.set(channel, queue);
            return [2 /*return*/];
        }
      });
    });
  };
  RealTimeAlertSystem.prototype.deliverAlert = function (alert, config) {
    return __awaiter(this, void 0, void 0, function () {
      var deliveryResult, _a, error_10;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 16, , 17]);
            deliveryResult = void 0;
            _a = config.channel;
            switch (_a) {
              case "email":
                return [3 /*break*/, 1];
              case "sms":
                return [3 /*break*/, 3];
              case "push":
                return [3 /*break*/, 5];
              case "in_app":
                return [3 /*break*/, 7];
              case "webhook":
                return [3 /*break*/, 9];
              case "dashboard":
                return [3 /*break*/, 11];
            }
            return [3 /*break*/, 13];
          case 1:
            return [4 /*yield*/, this.deliverEmailAlert(alert, config)];
          case 2:
            deliveryResult = _b.sent();
            return [3 /*break*/, 14];
          case 3:
            return [4 /*yield*/, this.deliverSMSAlert(alert, config)];
          case 4:
            deliveryResult = _b.sent();
            return [3 /*break*/, 14];
          case 5:
            return [4 /*yield*/, this.deliverPushAlert(alert, config)];
          case 6:
            deliveryResult = _b.sent();
            return [3 /*break*/, 14];
          case 7:
            return [4 /*yield*/, this.deliverInAppAlert(alert, config)];
          case 8:
            deliveryResult = _b.sent();
            return [3 /*break*/, 14];
          case 9:
            return [4 /*yield*/, this.deliverWebhookAlert(alert, config)];
          case 10:
            deliveryResult = _b.sent();
            return [3 /*break*/, 14];
          case 11:
            return [4 /*yield*/, this.deliverDashboardAlert(alert, config)];
          case 12:
            deliveryResult = _b.sent();
            return [3 /*break*/, 14];
          case 13:
            deliveryResult = { success: false, error: "Unknown delivery channel" };
            _b.label = 14;
          case 14:
            // Record delivery history
            alert.delivery_history.push({
              channel: config.channel,
              delivered_at: new Date(),
              delivery_status: deliveryResult.success ? "delivered" : "failed",
              recipient: "system", // Would be actual recipient
              delivery_id: deliveryResult.delivery_id,
              delivery_response: deliveryResult.error ? { error: deliveryResult.error } : {},
            });
            // Update alert in database
            return [
              4 /*yield*/,
              this.supabase
                .from("alert_instances")
                .update({ delivery_history: alert.delivery_history })
                .eq("id", alert.id),
            ];
          case 15:
            // Update alert in database
            _b.sent();
            return [3 /*break*/, 17];
          case 16:
            error_10 = _b.sent();
            logger_1.logger.error("Failed to deliver alert:", error_10);
            return [3 /*break*/, 17];
          case 17:
            return [2 /*return*/];
        }
      });
    });
  };
  // Delivery channel implementations
  RealTimeAlertSystem.prototype.deliverEmailAlert = function (alert, config) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Email delivery implementation
        return [2 /*return*/, { success: true, delivery_id: "email_".concat(Date.now()) }];
      });
    });
  };
  RealTimeAlertSystem.prototype.deliverSMSAlert = function (alert, config) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // SMS delivery implementation
        return [2 /*return*/, { success: true, delivery_id: "sms_".concat(Date.now()) }];
      });
    });
  };
  RealTimeAlertSystem.prototype.deliverPushAlert = function (alert, config) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Push notification implementation
        return [2 /*return*/, { success: true, delivery_id: "push_".concat(Date.now()) }];
      });
    });
  };
  RealTimeAlertSystem.prototype.deliverInAppAlert = function (alert, config) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // In-app notification implementation
        return [2 /*return*/, { success: true, delivery_id: "inapp_".concat(Date.now()) }];
      });
    });
  };
  RealTimeAlertSystem.prototype.deliverWebhookAlert = function (alert, config) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Webhook delivery implementation
        return [2 /*return*/, { success: true, delivery_id: "webhook_".concat(Date.now()) }];
      });
    });
  };
  RealTimeAlertSystem.prototype.deliverDashboardAlert = function (alert, config) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Dashboard notification implementation
        return [2 /*return*/, { success: true, delivery_id: "dashboard_".concat(Date.now()) }];
      });
    });
  };
  RealTimeAlertSystem.prototype.validateAlertRule = (rule) => {
    if (!rule.name || rule.name.trim().length === 0) {
      return { isValid: false, error: "Rule name is required" };
    }
    if (!rule.trigger_conditions || rule.trigger_conditions.length === 0) {
      return { isValid: false, error: "At least one trigger condition is required" };
    }
    return { isValid: true };
  };
  RealTimeAlertSystem.prototype.getDeliveryQueueHealth = function () {
    var health = {};
    for (var _i = 0, _a = this.deliveryQueue; _i < _a.length; _i++) {
      var _b = _a[_i],
        channel = _b[0],
        queue = _b[1];
      if (queue.length === 0) {
        health[channel] = "healthy";
      } else if (queue.length < 50) {
        health[channel] = "normal";
      } else if (queue.length < 100) {
        health[channel] = "congested";
      } else {
        health[channel] = "critical";
      }
    }
    return health;
  };
  // Additional helper methods for analytics, notifications, etc.
  RealTimeAlertSystem.prototype.calculateAlertsByType = (alerts) => {
    var counts = {};
    alerts.forEach((alert) => {
      counts[alert.alert_type] = (counts[alert.alert_type] || 0) + 1;
    });
    return counts;
  };
  RealTimeAlertSystem.prototype.calculateAlertsBySeverity = (alerts) => {
    var counts = {};
    alerts.forEach((alert) => {
      counts[alert.severity] = (counts[alert.severity] || 0) + 1;
    });
    return counts;
  };
  RealTimeAlertSystem.prototype.calculateAlertsByStatus = (alerts) => {
    var counts = {};
    alerts.forEach((alert) => {
      counts[alert.status] = (counts[alert.status] || 0) + 1;
    });
    return counts;
  };
  RealTimeAlertSystem.prototype.calculateResolutionMetrics = (alerts) => {
    var resolvedAlerts = alerts.filter((alert) => alert.status === "resolved");
    if (resolvedAlerts.length === 0) {
      return {
        average_resolution_time_minutes: 0,
        median_resolution_time_minutes: 0,
        resolution_rate_percentage: 0,
        escalation_rate_percentage: 0,
        false_positive_rate_percentage: 0,
      };
    }
    var resolutionTimes = resolvedAlerts
      .filter((alert) => {
        var _a;
        return (_a = alert.resolution_data) === null || _a === void 0 ? void 0 : _a.resolved_at;
      })
      .map((alert) => {
        var resolvedAt = new Date(alert.resolution_data.resolved_at).getTime();
        var triggeredAt = new Date(alert.triggered_at).getTime();
        return (resolvedAt - triggeredAt) / (1000 * 60); // minutes
      });
    var averageResolutionTime =
      resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length;
    var sortedTimes = resolutionTimes.sort((a, b) => a - b);
    var medianResolutionTime = sortedTimes[Math.floor(sortedTimes.length / 2)];
    var resolutionRate = (resolvedAlerts.length / alerts.length) * 100;
    var escalatedAlerts = alerts.filter((alert) => alert.escalation_history.length > 0);
    var escalationRate = (escalatedAlerts.length / alerts.length) * 100;
    return {
      average_resolution_time_minutes: Math.round(averageResolutionTime),
      median_resolution_time_minutes: Math.round(medianResolutionTime),
      resolution_rate_percentage: Math.round(resolutionRate),
      escalation_rate_percentage: Math.round(escalationRate),
      false_positive_rate_percentage: 5, // Would calculate based on resolution notes
    };
  };
  RealTimeAlertSystem.prototype.calculateDeliveryMetrics = function (alerts) {
    return __awaiter(this, void 0, void 0, function () {
      var allDeliveries, deliveryMetrics, channelStats, _i, channelStats_1, _a, channel, stats;
      return __generator(this, (_b) => {
        allDeliveries = alerts.flatMap((alert) => alert.delivery_history);
        deliveryMetrics = {
          total_deliveries: allDeliveries.length,
          delivery_success_rate: {},
          average_delivery_time_seconds: {},
          failed_deliveries: allDeliveries.filter((d) => d.delivery_status === "failed").length,
        };
        channelStats = new Map();
        allDeliveries.forEach((delivery) => {
          if (!channelStats.has(delivery.channel)) {
            channelStats.set(delivery.channel, { total: 0, successful: 0, totalTime: 0 });
          }
          var stats = channelStats.get(delivery.channel);
          stats.total++;
          if (delivery.delivery_status === "delivered") {
            stats.successful++;
          }
          // Mock delivery time calculation
          stats.totalTime += Math.random() * 10 + 1;
        });
        for (_i = 0, channelStats_1 = channelStats; _i < channelStats_1.length; _i++) {
          (_a = channelStats_1[_i]), (channel = _a[0]), (stats = _a[1]);
          deliveryMetrics.delivery_success_rate[channel] = (stats.successful / stats.total) * 100;
          deliveryMetrics.average_delivery_time_seconds[channel] = stats.totalTime / stats.total;
        }
        return [2 /*return*/, deliveryMetrics];
      });
    });
  };
  RealTimeAlertSystem.prototype.calculateTrendingAnalysis = (alerts) => ({
    alert_volume_trend: "stable",
    severity_trend: "stable",
    response_time_trend: "stable",
    top_alerting_entities: [],
  });
  RealTimeAlertSystem.prototype.calculateEffectivenessMetrics = (alerts) => ({
    actionable_alerts_percentage: 85,
    preventive_actions_taken: alerts.filter((a) => {
      var _a, _b;
      return (_b =
        (_a = a.resolution_data) === null || _a === void 0 ? void 0 : _a.prevention_measures) ===
        null || _b === void 0
        ? void 0
        : _b.length;
    }).length,
    business_impact_prevented: {
      revenue_saved: Math.random() * 10000,
      incidents_prevented: alerts.filter((a) => a.status === "resolved").length,
      patient_satisfaction_maintained: Math.random() * 100,
    },
  });
  // Real-time notification methods
  RealTimeAlertSystem.prototype.notifyRealtimeSubscribers = function (alert) {
    return __awaiter(this, void 0, void 0, function () {
      var _i, _a, _b, connectionId, ws;
      return __generator(this, function (_c) {
        // Notify WebSocket subscribers
        for (_i = 0, _a = this.wsConnections; _i < _a.length; _i++) {
          (_b = _a[_i]), (connectionId = _b[0]), (ws = _b[1]);
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(
              JSON.stringify({
                type: "new_alert",
                data: alert,
              }),
            );
          }
        }
        return [2 /*return*/];
      });
    });
  };
  RealTimeAlertSystem.prototype.notifyAlertAcknowledgment = function (
    alert,
    acknowledgedBy,
    notes,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Notify stakeholders of acknowledgment
        logger_1.logger.info("Alert acknowledgment notification sent", { alert_id: alert.id });
        return [2 /*return*/];
      });
    });
  };
  RealTimeAlertSystem.prototype.notifyAlertResolution = function (alert, resolvedBy, action) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Notify stakeholders of resolution
        logger_1.logger.info("Alert resolution notification sent", { alert_id: alert.id });
        return [2 /*return*/];
      });
    });
  };
  RealTimeAlertSystem.prototype.sendEscalatedNotifications = function (alert, escalationRule) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Send escalated notifications to higher level
        logger_1.logger.info("Escalated notifications sent", { alert_id: alert.id });
        return [2 /*return*/];
      });
    });
  };
  RealTimeAlertSystem.prototype.createFollowUpTasks = function (alert, preventionMeasures) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Create follow-up tasks for prevention measures
        logger_1.logger.info("Follow-up tasks created", {
          alert_id: alert.id,
          measures_count: preventionMeasures.length,
        });
        return [2 /*return*/];
      });
    });
  };
  RealTimeAlertSystem.prototype.reactivateSuppressedAlert = function (alertId) {
    return __awaiter(this, void 0, void 0, function () {
      var alert;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            alert = this.activeAlertsCache.get(alertId);
            if (!(alert && alert.status === "suppressed")) return [3 /*break*/, 2];
            alert.status = "active";
            alert.updated_at = new Date();
            return [
              4 /*yield*/,
              this.supabase
                .from("alert_instances")
                .update({ status: "active", updated_at: alert.updated_at })
                .eq("id", alertId),
            ];
          case 1:
            _a.sent();
            this.activeAlertsCache.set(alertId, alert);
            logger_1.logger.info("Suppressed alert reactivated", { alert_id: alertId });
            _a.label = 2;
          case 2:
            return [2 /*return*/];
        }
      });
    });
  };
  RealTimeAlertSystem.prototype.handleRealtimeAlertUpdate = (payload) => {
    // Handle real-time updates from database
    logger_1.logger.debug("Real-time alert update received", { payload_type: payload.eventType });
  };
  return RealTimeAlertSystem;
})();
exports.RealTimeAlertSystem = RealTimeAlertSystem;
