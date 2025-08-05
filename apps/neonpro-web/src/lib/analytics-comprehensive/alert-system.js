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
exports.AlertSystem = void 0;
var client_1 = require("@/lib/supabase/client");
/**
 * Advanced Alert and Notification System
 * Monitors performance metrics and triggers intelligent alerts
 */
var AlertSystem = /** @class */ (function () {
  function AlertSystem() {
    // Default alert templates
    this.DEFAULT_TEMPLATES = [
      {
        id: "efficiency_monitoring",
        name: "Efficiency Monitoring",
        category: "Performance",
        description: "Monitor appointment completion rates and time efficiency",
        isDefault: true,
        rules: [
          {
            name: "Low Appointment Completion Rate",
            metric: "appointmentCompletionRate",
            condition: "less_than",
            threshold: 85,
            severity: "high",
          },
          {
            name: "Poor Time Utilization",
            metric: "timeUtilizationRate",
            condition: "less_than",
            threshold: 70,
            severity: "medium",
          },
        ],
      },
      {
        id: "patient_satisfaction",
        name: "Patient Satisfaction",
        category: "Quality",
        description: "Monitor patient satisfaction and service quality",
        isDefault: true,
        rules: [
          {
            name: "Low Patient Satisfaction",
            metric: "patientSatisfactionScore",
            condition: "less_than",
            threshold: 3.5,
            severity: "high",
          },
          {
            name: "High Complication Rate",
            metric: "complicationRate",
            condition: "greater_than",
            threshold: 5,
            severity: "critical",
          },
        ],
      },
      {
        id: "resource_utilization",
        name: "Resource Utilization",
        category: "Operations",
        description: "Monitor staff and resource utilization",
        isDefault: true,
        rules: [
          {
            name: "Low Staff Utilization",
            metric: "staffUtilizationRate",
            condition: "less_than",
            threshold: 60,
            severity: "medium",
          },
          {
            name: "High Staff Utilization",
            metric: "staffUtilizationRate",
            condition: "greater_than",
            threshold: 90,
            severity: "high",
          },
        ],
      },
    ];
    this.supabase = (0, client_1.createClient)();
    this.alertRules = new Map();
    this.activeAlerts = new Map();
    this.notificationChannels = new Map();
    this.alertHistory = [];
    this.isMonitoring = false;
    this.initializeDefaultChannels();
    this.loadAlertRules();
  }
  /**
   * Start real-time monitoring
   */
  AlertSystem.prototype.startMonitoring = function () {
    return __awaiter(this, arguments, void 0, function (intervalMinutes) {
      var _this = this;
      if (intervalMinutes === void 0) {
        intervalMinutes = 5;
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (this.isMonitoring) {
              console.log("Monitoring already active");
              return [2 /*return*/];
            }
            this.isMonitoring = true;
            console.log(
              "Starting alert monitoring with ".concat(intervalMinutes, " minute intervals"),
            );
            // Initial check
            return [
              4 /*yield*/,
              this.checkAllAlerts(),
              // Set up periodic monitoring
            ];
          case 1:
            // Initial check
            _a.sent();
            // Set up periodic monitoring
            this.monitoringInterval = setInterval(
              function () {
                return __awaiter(_this, void 0, void 0, function () {
                  var error_1;
                  return __generator(this, function (_a) {
                    switch (_a.label) {
                      case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.checkAllAlerts()];
                      case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                      case 2:
                        error_1 = _a.sent();
                        console.error("Error during alert monitoring:", error_1);
                        return [3 /*break*/, 3];
                      case 3:
                        return [2 /*return*/];
                    }
                  });
                });
              },
              intervalMinutes * 60 * 1000,
            );
            // Set up real-time subscriptions for critical metrics
            this.setupRealtimeSubscriptions();
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Stop monitoring
   */
  AlertSystem.prototype.stopMonitoring = function () {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    this.isMonitoring = false;
    console.log("Alert monitoring stopped");
  };
  /**
   * Check all active alert rules
   */
  AlertSystem.prototype.checkAllAlerts = function () {
    return __awaiter(this, void 0, void 0, function () {
      var triggeredAlerts, endDate, startDate, _i, _a, _b, ruleId, rule, alert_1, error_2;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            triggeredAlerts = [];
            _c.label = 1;
          case 1:
            _c.trys.push([1, 7, , 8]);
            endDate = new Date();
            startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours
            (_i = 0), (_a = this.alertRules);
            _c.label = 2;
          case 2:
            if (!(_i < _a.length)) return [3 /*break*/, 6];
            (_b = _a[_i]), (ruleId = _b[0]), (rule = _b[1]);
            if (!rule.enabled) return [3 /*break*/, 5];
            return [4 /*yield*/, this.evaluateAlertRule(rule)];
          case 3:
            alert_1 = _c.sent();
            if (!alert_1) return [3 /*break*/, 5];
            triggeredAlerts.push(alert_1);
            return [4 /*yield*/, this.processAlert(alert_1, rule)];
          case 4:
            _c.sent();
            _c.label = 5;
          case 5:
            _i++;
            return [3 /*break*/, 2];
          case 6:
            return [2 /*return*/, triggeredAlerts];
          case 7:
            error_2 = _c.sent();
            console.error("Error checking alerts:", error_2);
            return [2 /*return*/, []];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Evaluate a specific alert rule
   */
  AlertSystem.prototype.evaluateAlertRule = function (rule) {
    return __awaiter(this, void 0, void 0, function () {
      var currentValue, isTriggered, alert_2, error_3;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            return [4 /*yield*/, this.getCurrentMetricValue(rule.metric)];
          case 1:
            currentValue = _b.sent();
            if (currentValue === null) return [2 /*return*/, null];
            isTriggered = this.evaluateCondition(currentValue, rule.condition, rule.threshold);
            if (!isTriggered)
              return [
                2 /*return*/,
                null,
                // Check cooldown period
              ];
            // Check cooldown period
            if (this.isInCooldown(rule.id))
              return [
                2 /*return*/,
                null,
                // Create alert
              ];
            _a = {
              id: "alert_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9)),
              type: this.getAlertType(rule.metric),
              severity: rule.severity,
              metric: rule.metric,
              currentValue: currentValue,
              threshold: typeof rule.threshold === "number" ? rule.threshold : rule.threshold.min,
            };
            return [4 /*yield*/, this.calculateMetricTrend(rule.metric)];
          case 2:
            alert_2 =
              ((_a.trend = _b.sent()),
              (_a.impact = this.calculateImpact(rule.metric, currentValue, rule.threshold)),
              (_a.recommendations = this.generateRecommendations(rule.metric, currentValue)),
              (_a.priority = this.calculatePriority(rule.severity, currentValue, rule.threshold)),
              _a);
            return [2 /*return*/, alert_2];
          case 3:
            error_3 = _b.sent();
            console.error("Error evaluating alert rule ".concat(rule.id, ":"), error_3);
            return [2 /*return*/, null];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Process triggered alert
   */
  AlertSystem.prototype.processAlert = function (alert, rule) {
    return __awaiter(this, void 0, void 0, function () {
      var historyEntry, _i, _a, action, error_4;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 6, , 7]);
            // Store alert
            this.activeAlerts.set(alert.id, alert);
            historyEntry = {
              id: "history_".concat(Date.now()),
              ruleId: rule.id,
              alertId: alert.id,
              triggeredAt: new Date(),
              status: "active",
              escalationLevel: 0,
              metadata: {
                metric: alert.metric,
                currentValue: alert.currentValue,
                threshold: alert.threshold,
              },
            };
            this.alertHistory.push(historyEntry);
            (_i = 0), (_a = rule.actions);
            _b.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 4];
            action = _a[_i];
            return [4 /*yield*/, this.executeAlertAction(action, alert, rule)];
          case 2:
            _b.sent();
            _b.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            // Store in database
            return [4 /*yield*/, this.storeAlert(alert, rule)];
          case 5:
            // Store in database
            _b.sent();
            console.log(
              "Alert triggered: "
                .concat(rule.name, " - ")
                .concat(alert.metric, ": ")
                .concat(alert.currentValue),
            );
            return [3 /*break*/, 7];
          case 6:
            error_4 = _b.sent();
            console.error("Error processing alert:", error_4);
            return [3 /*break*/, 7];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Execute alert action
   */
  AlertSystem.prototype.executeAlertAction = function (action, alert, rule) {
    return __awaiter(this, void 0, void 0, function () {
      var error_5;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            if (!action.delay) return [3 /*break*/, 1];
            setTimeout(
              function () {
                return _this.performAction(action, alert, rule);
              },
              action.delay * 60 * 1000,
            );
            return [3 /*break*/, 3];
          case 1:
            return [4 /*yield*/, this.performAction(action, alert, rule)];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_5 = _a.sent();
            console.error("Error executing alert action ".concat(action.type, ":"), error_5);
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Perform specific action
   */
  AlertSystem.prototype.performAction = function (action, alert, rule) {
    return __awaiter(this, void 0, void 0, function () {
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _a = action.type;
            switch (_a) {
              case "email":
                return [3 /*break*/, 1];
              case "sms":
                return [3 /*break*/, 3];
              case "push":
                return [3 /*break*/, 5];
              case "webhook":
                return [3 /*break*/, 7];
              case "auto_reschedule":
                return [3 /*break*/, 9];
              case "escalate":
                return [3 /*break*/, 11];
            }
            return [3 /*break*/, 13];
          case 1:
            return [4 /*yield*/, this.sendEmailNotification(alert, rule, action.config)];
          case 2:
            _b.sent();
            return [3 /*break*/, 14];
          case 3:
            return [4 /*yield*/, this.sendSMSNotification(alert, rule, action.config)];
          case 4:
            _b.sent();
            return [3 /*break*/, 14];
          case 5:
            return [4 /*yield*/, this.sendPushNotification(alert, rule, action.config)];
          case 6:
            _b.sent();
            return [3 /*break*/, 14];
          case 7:
            return [4 /*yield*/, this.sendWebhookNotification(alert, rule, action.config)];
          case 8:
            _b.sent();
            return [3 /*break*/, 14];
          case 9:
            return [4 /*yield*/, this.triggerAutoReschedule(alert, rule)];
          case 10:
            _b.sent();
            return [3 /*break*/, 14];
          case 11:
            return [4 /*yield*/, this.escalateAlert(alert, rule)];
          case 12:
            _b.sent();
            return [3 /*break*/, 14];
          case 13:
            console.warn("Unknown action type: ".concat(action.type));
            _b.label = 14;
          case 14:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Create alert rule
   */
  AlertSystem.prototype.createAlertRule = function (rule) {
    return __awaiter(this, void 0, void 0, function () {
      var newRule, error;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            newRule = __assign(__assign({}, rule), {
              id: "rule_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9)),
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            this.alertRules.set(newRule.id, newRule);
            return [4 /*yield*/, this.supabase.from("alert_rules").insert(newRule)];
          case 1:
            error = _a.sent().error;
            if (error) {
              console.error("Error storing alert rule:", error);
              throw error;
            }
            return [2 /*return*/, newRule];
        }
      });
    });
  };
  /**
   * Update alert rule
   */
  AlertSystem.prototype.updateAlertRule = function (ruleId, updates) {
    return __awaiter(this, void 0, void 0, function () {
      var existingRule, updatedRule, error;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            existingRule = this.alertRules.get(ruleId);
            if (!existingRule) return [2 /*return*/, null];
            updatedRule = __assign(__assign(__assign({}, existingRule), updates), {
              updatedAt: new Date(),
            });
            this.alertRules.set(ruleId, updatedRule);
            return [
              4 /*yield*/,
              this.supabase.from("alert_rules").update(updatedRule).eq("id", ruleId),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              console.error("Error updating alert rule:", error);
              throw error;
            }
            return [2 /*return*/, updatedRule];
        }
      });
    });
  };
  /**
   * Delete alert rule
   */
  AlertSystem.prototype.deleteAlertRule = function (ruleId) {
    return __awaiter(this, void 0, void 0, function () {
      var deleted, error;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            deleted = this.alertRules.delete(ruleId);
            if (!deleted) return [3 /*break*/, 2];
            return [4 /*yield*/, this.supabase.from("alert_rules").delete().eq("id", ruleId)];
          case 1:
            error = _a.sent().error;
            if (error) {
              console.error("Error deleting alert rule:", error);
              return [2 /*return*/, false];
            }
            _a.label = 2;
          case 2:
            return [2 /*return*/, deleted];
        }
      });
    });
  };
  /**
   * Acknowledge alert
   */
  AlertSystem.prototype.acknowledgeAlert = function (alertId, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var alert, historyEntry, error;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            alert = this.activeAlerts.get(alertId);
            if (!alert)
              return [
                2 /*return*/,
                false,
                // Update alert history
              ];
            historyEntry = this.alertHistory.find(function (h) {
              return h.alertId === alertId;
            });
            if (historyEntry) {
              historyEntry.status = "acknowledged";
              historyEntry.acknowledgedBy = userId;
              historyEntry.acknowledgedAt = new Date();
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("alert_history")
                .update({
                  status: "acknowledged",
                  acknowledged_by: userId,
                  acknowledged_at: new Date().toISOString(),
                })
                .eq("alert_id", alertId),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              console.error("Error acknowledging alert:", error);
              return [2 /*return*/, false];
            }
            return [2 /*return*/, true];
        }
      });
    });
  };
  /**
   * Resolve alert
   */
  AlertSystem.prototype.resolveAlert = function (alertId, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var alert, historyEntry, error;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            alert = this.activeAlerts.get(alertId);
            if (!alert)
              return [
                2 /*return*/,
                false,
                // Remove from active alerts
              ];
            // Remove from active alerts
            this.activeAlerts.delete(alertId);
            historyEntry = this.alertHistory.find(function (h) {
              return h.alertId === alertId;
            });
            if (historyEntry) {
              historyEntry.status = "resolved";
              historyEntry.resolvedAt = new Date();
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("alert_history")
                .update({
                  status: "resolved",
                  resolved_at: new Date().toISOString(),
                })
                .eq("alert_id", alertId),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              console.error("Error resolving alert:", error);
              return [2 /*return*/, false];
            }
            return [2 /*return*/, true];
        }
      });
    });
  };
  /**
   * Get alert dashboard data
   */
  AlertSystem.prototype.getAlertDashboard = function () {
    return __awaiter(this, void 0, void 0, function () {
      var activeAlerts,
        alertsByCategory,
        alertTrends,
        topAlertRules,
        resolutionMetrics,
        systemHealth;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            activeAlerts = Array.from(this.activeAlerts.values());
            alertsByCategory = this.calculateAlertsByCategory(activeAlerts);
            return [4 /*yield*/, this.calculateAlertTrends()];
          case 1:
            alertTrends = _a.sent();
            topAlertRules = this.calculateTopAlertRules();
            return [4 /*yield*/, this.calculateResolutionMetrics()];
          case 2:
            resolutionMetrics = _a.sent();
            return [4 /*yield*/, this.calculateSystemHealth()];
          case 3:
            systemHealth = _a.sent();
            return [
              2 /*return*/,
              {
                activeAlerts: activeAlerts,
                alertsByCategory: alertsByCategory,
                alertTrends: alertTrends,
                topAlertRules: topAlertRules,
                resolutionMetrics: resolutionMetrics,
                systemHealth: systemHealth,
              },
            ];
        }
      });
    });
  };
  // Helper methods
  AlertSystem.prototype.getCurrentMetricValue = function (metric) {
    return __awaiter(this, void 0, void 0, function () {
      var simulatedValues;
      return __generator(this, function (_a) {
        simulatedValues = {
          appointmentCompletionRate: 88,
          patientSatisfactionScore: 4.1,
          staffUtilizationRate: 75,
          timeUtilizationRate: 82,
          complicationRate: 3.2,
          revenuePerHour: 165,
        };
        return [2 /*return*/, simulatedValues[metric] || null];
      });
    });
  };
  AlertSystem.prototype.evaluateCondition = function (value, condition, threshold) {
    switch (condition) {
      case "greater_than":
        return typeof threshold === "number" && value > threshold;
      case "less_than":
        return typeof threshold === "number" && value < threshold;
      case "equals":
        return typeof threshold === "number" && value === threshold;
      case "not_equals":
        return typeof threshold === "number" && value !== threshold;
      case "between":
        return typeof threshold === "object" && value >= threshold.min && value <= threshold.max;
      case "outside_range":
        return typeof threshold === "object" && (value < threshold.min || value > threshold.max);
      default:
        return false;
    }
  };
  AlertSystem.prototype.isInCooldown = function (ruleId) {
    var rule = this.alertRules.get(ruleId);
    if (!rule) return false;
    var lastTrigger = this.alertHistory
      .filter(function (h) {
        return h.ruleId === ruleId;
      })
      .sort(function (a, b) {
        return b.triggeredAt.getTime() - a.triggeredAt.getTime();
      })[0];
    if (!lastTrigger) return false;
    var cooldownEnd = new Date(
      lastTrigger.triggeredAt.getTime() + rule.cooldownMinutes * 60 * 1000,
    );
    return new Date() < cooldownEnd;
  };
  AlertSystem.prototype.getAlertType = function (metric) {
    if (metric.includes("utilization") || metric.includes("efficiency")) return "efficiency";
    if (metric.includes("satisfaction") || metric.includes("quality")) return "satisfaction";
    if (metric.includes("revenue") || metric.includes("productivity")) return "productivity";
    return "utilization";
  };
  AlertSystem.prototype.calculateMetricTrend = function (metric) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Simplified trend calculation
        return [2 /*return*/, "stable"];
      });
    });
  };
  AlertSystem.prototype.calculateImpact = function (metric, currentValue, threshold) {
    var impacts = {
      appointmentCompletionRate: "Reduced patient satisfaction and revenue loss",
      patientSatisfactionScore: "Potential reputation damage and patient churn",
      staffUtilizationRate: "Inefficient resource allocation and increased costs",
      complicationRate: "Patient safety concerns and liability risks",
    };
    return impacts[metric] || "Performance degradation detected";
  };
  AlertSystem.prototype.generateRecommendations = function (metric, currentValue) {
    var recommendations = {
      appointmentCompletionRate: [
        "Review scheduling processes",
        "Implement automated reminders",
        "Analyze cancellation patterns",
      ],
      patientSatisfactionScore: [
        "Conduct patient feedback surveys",
        "Improve wait time management",
        "Enhance staff training programs",
      ],
      staffUtilizationRate: [
        "Optimize staff scheduling",
        "Balance workload distribution",
        "Consider staffing adjustments",
      ],
    };
    return (
      recommendations[metric] || [
        "Review current processes",
        "Implement monitoring",
        "Consider optimization",
      ]
    );
  };
  AlertSystem.prototype.calculatePriority = function (severity, currentValue, threshold) {
    var severityWeights = { low: 1, medium: 2, high: 3, critical: 4 };
    var baseWeight = severityWeights[severity] || 1;
    // Calculate deviation magnitude
    var thresholdValue = typeof threshold === "number" ? threshold : threshold.min;
    var deviation = Math.abs(currentValue - thresholdValue) / thresholdValue;
    return Math.min(10, baseWeight * (1 + deviation) * 2);
  };
  AlertSystem.prototype.calculateAlertsByCategory = function (alerts) {
    var _this = this;
    var categories = new Map();
    alerts.forEach(function (alert) {
      var category = alert.type;
      var existing = categories.get(category) || { count: 0, maxSeverity: "low" };
      existing.count++;
      if (_this.getSeverityWeight(alert.severity) > _this.getSeverityWeight(existing.maxSeverity)) {
        existing.maxSeverity = alert.severity;
      }
      categories.set(category, existing);
    });
    return Array.from(categories.entries()).map(function (_a) {
      var category = _a[0],
        data = _a[1];
      return {
        category: category,
        count: data.count,
        severity: data.maxSeverity,
      };
    });
  };
  AlertSystem.prototype.getSeverityWeight = function (severity) {
    var weights = { low: 1, medium: 2, high: 3, critical: 4 };
    return weights[severity] || 1;
  };
  AlertSystem.prototype.calculateAlertTrends = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Simplified implementation
        return [2 /*return*/, []];
      });
    });
  };
  AlertSystem.prototype.calculateTopAlertRules = function () {
    var _this = this;
    var ruleCounts = new Map();
    this.alertHistory.forEach(function (history) {
      var count = ruleCounts.get(history.ruleId) || 0;
      ruleCounts.set(history.ruleId, count + 1);
    });
    return Array.from(ruleCounts.entries())
      .map(function (_a) {
        var ruleId = _a[0],
          triggerCount = _a[1];
        var rule = _this.alertRules.get(ruleId);
        return {
          ruleId: ruleId,
          name: (rule === null || rule === void 0 ? void 0 : rule.name) || "Unknown Rule",
          triggerCount: triggerCount,
        };
      })
      .sort(function (a, b) {
        return b.triggerCount - a.triggerCount;
      })
      .slice(0, 10);
  };
  AlertSystem.prototype.calculateResolutionMetrics = function () {
    return __awaiter(this, void 0, void 0, function () {
      var resolvedAlerts, acknowledgedAlerts, resolutionTimes, averageResolutionTime;
      return __generator(this, function (_a) {
        resolvedAlerts = this.alertHistory.filter(function (h) {
          return h.status === "resolved";
        });
        acknowledgedAlerts = this.alertHistory.filter(function (h) {
          return h.acknowledgedAt;
        });
        resolutionTimes = resolvedAlerts
          .filter(function (h) {
            return h.resolvedAt;
          })
          .map(function (h) {
            return h.resolvedAt.getTime() - h.triggeredAt.getTime();
          });
        averageResolutionTime =
          resolutionTimes.length > 0
            ? resolutionTimes.reduce(function (sum, time) {
                return sum + time;
              }, 0) /
              resolutionTimes.length /
              (1000 * 60)
            : 0;
        return [
          2 /*return*/,
          {
            averageResolutionTime: averageResolutionTime,
            acknowledgmentRate:
              this.alertHistory.length > 0
                ? (acknowledgedAlerts.length / this.alertHistory.length) * 100
                : 0,
            escalationRate: 15, // Placeholder
            falsePositiveRate: 8, // Placeholder
          },
        ];
      });
    });
  };
  AlertSystem.prototype.calculateSystemHealth = function () {
    return __awaiter(this, void 0, void 0, function () {
      var criticalAlerts, highAlerts, overallStatus;
      return __generator(this, function (_a) {
        criticalAlerts = Array.from(this.activeAlerts.values()).filter(function (a) {
          return a.severity === "critical";
        });
        highAlerts = Array.from(this.activeAlerts.values()).filter(function (a) {
          return a.severity === "high";
        });
        overallStatus = "healthy";
        if (criticalAlerts.length > 0) {
          overallStatus = "critical";
        } else if (highAlerts.length > 2) {
          overallStatus = "warning";
        }
        return [
          2 /*return*/,
          {
            overallStatus: overallStatus,
            uptime: 99.8, // Placeholder
            responseTime: 150, // Placeholder
            errorRate: 0.5, // Placeholder
          },
        ];
      });
    });
  };
  AlertSystem.prototype.initializeDefaultChannels = function () {
    // Initialize default notification channels
    var emailChannel = {
      id: "default_email",
      type: "email",
      name: "Default Email",
      config: { smtp: "default" },
      enabled: true,
      priority: 1,
      retryAttempts: 3,
      retryDelay: 5,
    };
    this.notificationChannels.set(emailChannel.id, emailChannel);
  };
  AlertSystem.prototype.loadAlertRules = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, rules, error, error_6;
      var _this = this;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.supabase.from("alert_rules").select("*").eq("enabled", true)];
          case 1:
            (_a = _b.sent()), (rules = _a.data), (error = _a.error);
            if (error) {
              console.error("Error loading alert rules:", error);
              return [2 /*return*/];
            }
            rules === null || rules === void 0
              ? void 0
              : rules.forEach(function (rule) {
                  _this.alertRules.set(rule.id, rule);
                });
            return [3 /*break*/, 3];
          case 2:
            error_6 = _b.sent();
            console.error("Error loading alert rules:", error_6);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  AlertSystem.prototype.setupRealtimeSubscriptions = function () {
    var _this = this;
    // Set up real-time subscriptions for critical metrics
    this.supabase
      .channel("appointments")
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, function () {
        return _this.checkAllAlerts();
      })
      .subscribe();
  };
  AlertSystem.prototype.storeAlert = function (alert, rule) {
    return __awaiter(this, void 0, void 0, function () {
      var error;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("alerts").insert({
                id: alert.id,
                rule_id: rule.id,
                type: alert.type,
                severity: alert.severity,
                metric: alert.metric,
                current_value: alert.currentValue,
                threshold: alert.threshold,
                trend: alert.trend,
                impact: alert.impact,
                recommendations: alert.recommendations,
                priority: alert.priority,
                created_at: new Date().toISOString(),
              }),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              console.error("Error storing alert:", error);
            }
            return [2 /*return*/];
        }
      });
    });
  };
  // Notification methods (simplified implementations)
  AlertSystem.prototype.sendEmailNotification = function (alert, rule, config) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        console.log("Email notification sent for alert: ".concat(rule.name));
        return [2 /*return*/];
      });
    });
  };
  AlertSystem.prototype.sendSMSNotification = function (alert, rule, config) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        console.log("SMS notification sent for alert: ".concat(rule.name));
        return [2 /*return*/];
      });
    });
  };
  AlertSystem.prototype.sendPushNotification = function (alert, rule, config) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        console.log("Push notification sent for alert: ".concat(rule.name));
        return [2 /*return*/];
      });
    });
  };
  AlertSystem.prototype.sendWebhookNotification = function (alert, rule, config) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        console.log("Webhook notification sent for alert: ".concat(rule.name));
        return [2 /*return*/];
      });
    });
  };
  AlertSystem.prototype.triggerAutoReschedule = function (alert, rule) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        console.log("Auto-reschedule triggered for alert: ".concat(rule.name));
        return [2 /*return*/];
      });
    });
  };
  AlertSystem.prototype.escalateAlert = function (alert, rule) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        console.log("Alert escalated: ".concat(rule.name));
        return [2 /*return*/];
      });
    });
  };
  return AlertSystem;
})();
exports.AlertSystem = AlertSystem;
exports.default = AlertSystem;
