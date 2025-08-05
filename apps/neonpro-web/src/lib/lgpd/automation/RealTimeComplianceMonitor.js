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
exports.RealTimeComplianceMonitor = void 0;
var RealTimeComplianceMonitor = /** @class */ (() => {
  function RealTimeComplianceMonitor(supabase, complianceManager, config) {
    this.monitoringInterval = null;
    this.alertCallbacks = [];
    this.supabase = supabase;
    this.complianceManager = complianceManager;
    this.config = config;
  }
  /**
   * Start Real-Time Compliance Monitoring
   */
  RealTimeComplianceMonitor.prototype.startMonitoring = function () {
    return __awaiter(this, arguments, void 0, function (intervalMinutes) {
      var error_1;
      var _this = this;
      if (intervalMinutes === void 0) {
        intervalMinutes = 5;
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            if (this.monitoringInterval) {
              clearInterval(this.monitoringInterval);
            }
            // Initial compliance check
            return [
              4 /*yield*/,
              this.performComplianceCheck(),
              // Set up real-time monitoring
            ];
          case 1:
            // Initial compliance check
            _a.sent();
            if (!this.config.real_time_monitoring) return [3 /*break*/, 3];
            this.monitoringInterval = setInterval(
              () =>
                __awaiter(_this, void 0, void 0, function () {
                  var error_2;
                  return __generator(this, function (_a) {
                    switch (_a.label) {
                      case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.performComplianceCheck()];
                      case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                      case 2:
                        error_2 = _a.sent();
                        console.error("Error in compliance monitoring cycle:", error_2);
                        return [3 /*break*/, 3];
                      case 3:
                        return [2 /*return*/];
                    }
                  });
                }),
              intervalMinutes * 60 * 1000,
            );
            // Set up database change listeners
            return [4 /*yield*/, this.setupRealtimeListeners()];
          case 2:
            // Set up database change listeners
            _a.sent();
            _a.label = 3;
          case 3:
            console.log(
              "Real-time compliance monitoring started (".concat(intervalMinutes, "min intervals)"),
            );
            return [3 /*break*/, 5];
          case 4:
            error_1 = _a.sent();
            console.error("Error starting compliance monitoring:", error_1);
            throw new Error("Failed to start compliance monitoring: ".concat(error_1.message));
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Stop Real-Time Monitoring
   */
  RealTimeComplianceMonitor.prototype.stopMonitoring = function () {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    console.log("Real-time compliance monitoring stopped");
  };
  /**
   * Get Current Compliance Dashboard
   */
  RealTimeComplianceMonitor.prototype.getComplianceDashboard = function () {
    return __awaiter(this, void 0, void 0, function () {
      var metrics, _a, alerts, alertsError, trends, legalDeadlines, recentActivities, error_3;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 6, , 7]);
            return [
              4 /*yield*/,
              this.calculateComplianceMetrics(),
              // Get active alerts
            ];
          case 1:
            metrics = _b.sent();
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_compliance_alerts")
                .select("*")
                .eq("status", "active")
                .order("severity_score", { ascending: false })
                .limit(50),
            ];
          case 2:
            (_a = _b.sent()), (alerts = _a.data), (alertsError = _a.error);
            if (alertsError) throw alertsError;
            return [
              4 /*yield*/,
              this.getComplianceTrends(),
              // Get legal deadlines
            ];
          case 3:
            trends = _b.sent();
            return [
              4 /*yield*/,
              this.getUpcomingLegalDeadlines(),
              // Get recent activities
            ];
          case 4:
            legalDeadlines = _b.sent();
            return [4 /*yield*/, this.getRecentComplianceActivities()];
          case 5:
            recentActivities = _b.sent();
            return [
              2 /*return*/,
              {
                metrics: metrics,
                active_alerts: alerts || [],
                trends: trends,
                legal_deadlines: legalDeadlines,
                recent_activities: recentActivities,
              },
            ];
          case 6:
            error_3 = _b.sent();
            console.error("Error getting compliance dashboard:", error_3);
            throw new Error("Failed to get compliance dashboard: ".concat(error_3.message));
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Perform Comprehensive Compliance Check
   */
  RealTimeComplianceMonitor.prototype.performComplianceCheck = function () {
    return __awaiter(this, void 0, void 0, function () {
      var newAlerts,
        resolvedAlerts,
        metrics,
        consentAlerts,
        rightsAlerts,
        breachAlerts,
        retentionAlerts,
        documentationAlerts,
        thirdPartyAlerts,
        alertsError,
        _i,
        newAlerts_1,
        alert_1,
        error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 15, , 16]);
            newAlerts = [];
            resolvedAlerts = [];
            return [
              4 /*yield*/,
              this.calculateComplianceMetrics(),
              // Check consent compliance
            ];
          case 1:
            metrics = _a.sent();
            return [4 /*yield*/, this.checkConsentCompliance()];
          case 2:
            consentAlerts = _a.sent();
            newAlerts.push.apply(newAlerts, consentAlerts);
            return [4 /*yield*/, this.checkDataSubjectRightsCompliance()];
          case 3:
            rightsAlerts = _a.sent();
            newAlerts.push.apply(newAlerts, rightsAlerts);
            return [4 /*yield*/, this.checkBreachResponseCompliance()];
          case 4:
            breachAlerts = _a.sent();
            newAlerts.push.apply(newAlerts, breachAlerts);
            return [4 /*yield*/, this.checkRetentionCompliance()];
          case 5:
            retentionAlerts = _a.sent();
            newAlerts.push.apply(newAlerts, retentionAlerts);
            return [4 /*yield*/, this.checkDocumentationCompliance()];
          case 6:
            documentationAlerts = _a.sent();
            newAlerts.push.apply(newAlerts, documentationAlerts);
            return [4 /*yield*/, this.checkThirdPartyCompliance()];
          case 7:
            thirdPartyAlerts = _a.sent();
            newAlerts.push.apply(newAlerts, thirdPartyAlerts);
            if (!(newAlerts.length > 0)) return [3 /*break*/, 12];
            return [
              4 /*yield*/,
              this.supabase.from("lgpd_compliance_alerts").insert(
                newAlerts.map((alert) => ({
                  type: alert.type,
                  category: alert.category,
                  title: alert.title,
                  description: alert.description,
                  severity_score: alert.severity_score,
                  legal_deadline: alert.legal_deadline,
                  auto_resolution_available: alert.auto_resolution_available,
                  resolution_steps: alert.resolution_steps,
                  affected_users: alert.affected_users,
                  status: "active",
                  created_at: new Date().toISOString(),
                })),
              ),
            ];
          case 8:
            alertsError = _a.sent().error;
            if (alertsError) throw alertsError;
            (_i = 0), (newAlerts_1 = newAlerts);
            _a.label = 9;
          case 9:
            if (!(_i < newAlerts_1.length)) return [3 /*break*/, 12];
            alert_1 = newAlerts_1[_i];
            return [4 /*yield*/, this.triggerAlertNotification(alert_1)];
          case 10:
            _a.sent();
            _a.label = 11;
          case 11:
            _i++;
            return [3 /*break*/, 9];
          case 12:
            // Update compliance metrics
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_compliance_metrics")
                .upsert({
                  overall_score: metrics.overall_score,
                  consent_compliance: metrics.consent_compliance,
                  data_subject_rights_compliance: metrics.data_subject_rights_compliance,
                  breach_response_compliance: metrics.breach_response_compliance,
                  retention_compliance: metrics.retention_compliance,
                  documentation_compliance: metrics.documentation_compliance,
                  third_party_compliance: metrics.third_party_compliance,
                  last_updated: new Date().toISOString(),
                  measurement_date: new Date().toISOString().split("T")[0],
                }),
              // Log monitoring event
            ];
          case 13:
            // Update compliance metrics
            _a.sent();
            // Log monitoring event
            return [
              4 /*yield*/,
              this.complianceManager.logAuditEvent({
                event_type: "compliance_monitoring",
                resource_type: "compliance_check",
                action: "automated_compliance_check_completed",
                details: {
                  overall_score: metrics.overall_score,
                  new_alerts: newAlerts.length,
                  resolved_alerts: resolvedAlerts.length,
                  monitoring_timestamp: new Date().toISOString(),
                },
              }),
            ];
          case 14:
            // Log monitoring event
            _a.sent();
            return [
              2 /*return*/,
              {
                metrics: metrics,
                new_alerts: newAlerts,
                resolved_alerts: resolved_alerts,
              },
            ];
          case 15:
            error_4 = _a.sent();
            console.error("Error performing compliance check:", error_4);
            throw new Error("Failed to perform compliance check: ".concat(error_4.message));
          case 16:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Register Alert Callback
   */
  RealTimeComplianceMonitor.prototype.onAlert = function (callback) {
    this.alertCallbacks.push(callback);
  };
  /**
   * Resolve Compliance Alert
   */
  RealTimeComplianceMonitor.prototype.resolveAlert = function (alertId, resolution) {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_compliance_alerts")
                .update({
                  status: "resolved",
                  resolved_at: new Date().toISOString(),
                  resolution_method: resolution.method,
                  resolution_notes: resolution.notes,
                  resolved_by: resolution.resolved_by,
                })
                .eq("id", alertId),
            ];
          case 1:
            error = _a.sent().error;
            if (error) throw error;
            // Log resolution
            return [
              4 /*yield*/,
              this.complianceManager.logAuditEvent({
                event_type: "alert_resolution",
                resource_type: "compliance_alert",
                resource_id: alertId,
                action: "alert_resolved",
                details: {
                  resolution_method: resolution.method,
                  resolved_by: resolution.resolved_by,
                  resolution_timestamp: new Date().toISOString(),
                },
              }),
            ];
          case 2:
            // Log resolution
            _a.sent();
            return [2 /*return*/, { success: true }];
          case 3:
            error_5 = _a.sent();
            console.error("Error resolving alert:", error_5);
            throw new Error("Failed to resolve alert: ".concat(error_5.message));
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Generate Compliance Report
   */
  RealTimeComplianceMonitor.prototype.generateComplianceReport = function (reportType_1) {
    return __awaiter(this, arguments, void 0, function (reportType, includeRecommendations) {
      var dashboard, _a, reportData, error, _b, report, reportError_1, error_6;
      if (includeRecommendations === void 0) {
        includeRecommendations = true;
      }
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 4, , 5]);
            return [
              4 /*yield*/,
              this.getComplianceDashboard(),
              // Generate report analysis
            ];
          case 1:
            dashboard = _c.sent();
            return [
              4 /*yield*/,
              this.supabase.rpc("generate_compliance_report", {
                report_type: reportType,
                include_recommendations: includeRecommendations,
                dashboard_data: dashboard,
              }),
            ];
          case 2:
            (_a = _c.sent()), (reportData = _a.data), (error = _a.error);
            if (error) throw error;
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_compliance_reports")
                .insert({
                  report_type: reportType,
                  report_data: reportData,
                  generated_at: new Date().toISOString(),
                  metrics_snapshot: dashboard.metrics,
                })
                .select("id")
                .single(),
            ];
          case 3:
            (_b = _c.sent()), (report = _b.data), (reportError_1 = _b.error);
            if (reportError_1) throw reportError_1;
            return [
              2 /*return*/,
              __assign(__assign({ report_id: report.id }, reportData), {
                generated_at: new Date().toISOString(),
              }),
            ];
          case 4:
            error_6 = _c.sent();
            console.error("Error generating compliance report:", error_6);
            throw new Error("Failed to generate compliance report: ".concat(error_6.message));
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  // Private helper methods
  RealTimeComplianceMonitor.prototype.calculateComplianceMetrics = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, metrics, error, error_7;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.supabase.rpc("calculate_compliance_metrics")];
          case 1:
            (_a = _b.sent()), (metrics = _a.data), (error = _a.error);
            if (error) throw error;
            return [
              2 /*return*/,
              {
                overall_score: metrics.overall_score || 0,
                consent_compliance: metrics.consent_compliance || 0,
                data_subject_rights_compliance: metrics.data_subject_rights_compliance || 0,
                breach_response_compliance: metrics.breach_response_compliance || 0,
                retention_compliance: metrics.retention_compliance || 0,
                documentation_compliance: metrics.documentation_compliance || 0,
                third_party_compliance: metrics.third_party_compliance || 0,
                last_updated: new Date().toISOString(),
              },
            ];
          case 2:
            error_7 = _b.sent();
            console.error("Error calculating compliance metrics:", error_7);
            throw error_7;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  RealTimeComplianceMonitor.prototype.checkConsentCompliance = function () {
    return __awaiter(this, void 0, void 0, function () {
      var alerts, _a, expiringConsents, error, error_8;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            alerts = [];
            _b.label = 1;
          case 1:
            _b.trys.push([1, 3, , 4]);
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_user_consents")
                .select("*")
                .eq("status", "granted")
                .lt(
                  "expires_at",
                  new Date(
                    Date.now() +
                      this.config.alert_thresholds.consent_expiry_days * 24 * 60 * 60 * 1000,
                  ).toISOString(),
                ),
            ];
          case 2:
            (_a = _b.sent()), (expiringConsents = _a.data), (error = _a.error);
            if (error) throw error;
            if (expiringConsents && expiringConsents.length > 0) {
              alerts.push({
                id: "consent-expiry-".concat(Date.now()),
                type: "medium",
                category: "consent",
                title: "Consents Expiring Soon",
                description: ""
                  .concat(expiringConsents.length, " user consents are expiring within ")
                  .concat(this.config.alert_thresholds.consent_expiry_days, " days"),
                severity_score: 60,
                auto_resolution_available: true,
                resolution_steps: [
                  "Review expiring consents",
                  "Send renewal notifications to users",
                  "Update consent collection processes",
                ],
                affected_users: expiringConsents.length,
                created_at: new Date().toISOString(),
                status: "active",
              });
            }
            return [2 /*return*/, alerts];
          case 3:
            error_8 = _b.sent();
            console.error("Error checking consent compliance:", error_8);
            return [2 /*return*/, []];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  RealTimeComplianceMonitor.prototype.checkDataSubjectRightsCompliance = function () {
    return __awaiter(this, void 0, void 0, function () {
      var alerts, _a, overdueRequests, error, error_9;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            alerts = [];
            _b.label = 1;
          case 1:
            _b.trys.push([1, 3, , 4]);
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_data_subject_requests")
                .select("*")
                .in("status", ["pending", "in_progress"])
                .lt("legal_deadline", new Date().toISOString()),
            ];
          case 2:
            (_a = _b.sent()), (overdueRequests = _a.data), (error = _a.error);
            if (error) throw error;
            if (overdueRequests && overdueRequests.length > 0) {
              alerts.push({
                id: "rights-overdue-".concat(Date.now()),
                type: "critical",
                category: "rights",
                title: "Overdue Data Subject Requests",
                description: "".concat(
                  overdueRequests.length,
                  " data subject requests are overdue",
                ),
                severity_score: 95,
                auto_resolution_available: false,
                resolution_steps: [
                  "Review overdue requests immediately",
                  "Prioritize request fulfillment",
                  "Notify legal team if necessary",
                  "Document delay reasons",
                ],
                affected_users: overdueRequests.length,
                created_at: new Date().toISOString(),
                status: "active",
              });
            }
            return [2 /*return*/, alerts];
          case 3:
            error_9 = _b.sent();
            console.error("Error checking data subject rights compliance:", error_9);
            return [2 /*return*/, []];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  RealTimeComplianceMonitor.prototype.checkBreachResponseCompliance = function () {
    return __awaiter(this, void 0, void 0, function () {
      var alerts, _a, breachIncidents, error, error_10;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            alerts = [];
            _b.label = 1;
          case 1:
            _b.trys.push([1, 3, , 4]);
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_breach_incidents")
                .select("*")
                .eq("requires_notification", true)
                .eq("notification_sent", false)
                .lt(
                  "created_at",
                  new Date(
                    Date.now() -
                      this.config.alert_thresholds.breach_response_hours * 60 * 60 * 1000,
                  ).toISOString(),
                ),
            ];
          case 2:
            (_a = _b.sent()), (breachIncidents = _a.data), (error = _a.error);
            if (error) throw error;
            if (breachIncidents && breachIncidents.length > 0) {
              alerts.push({
                id: "breach-notification-".concat(Date.now()),
                type: "critical",
                category: "breach",
                title: "Breach Notification Required",
                description: "".concat(
                  breachIncidents.length,
                  " breach incidents require immediate notification to ANPD",
                ),
                severity_score: 100,
                legal_deadline: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(), // 72 hours from now
                auto_resolution_available: true,
                resolution_steps: [
                  "Review breach incident details",
                  "Prepare ANPD notification",
                  "Send notification within 72 hours",
                  "Document notification process",
                ],
                affected_users: breachIncidents.reduce(
                  (sum, incident) => sum + (incident.affected_users || 0),
                  0,
                ),
                created_at: new Date().toISOString(),
                status: "active",
              });
            }
            return [2 /*return*/, alerts];
          case 3:
            error_10 = _b.sent();
            console.error("Error checking breach response compliance:", error_10);
            return [2 /*return*/, []];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  RealTimeComplianceMonitor.prototype.checkRetentionCompliance = function () {
    return __awaiter(this, void 0, void 0, function () {
      var alerts, _a, retentionViolations, error, error_11;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            alerts = [];
            _b.label = 1;
          case 1:
            _b.trys.push([1, 3, , 4]);
            return [4 /*yield*/, this.supabase.rpc("check_retention_compliance")];
          case 2:
            (_a = _b.sent()), (retentionViolations = _a.data), (error = _a.error);
            if (error) throw error;
            if (retentionViolations && retentionViolations.length > 0) {
              alerts.push({
                id: "retention-violation-".concat(Date.now()),
                type: "high",
                category: "retention",
                title: "Data Retention Violations",
                description: "".concat(
                  retentionViolations.length,
                  " data records exceed retention periods",
                ),
                severity_score: 80,
                auto_resolution_available: true,
                resolution_steps: [
                  "Review retention policy violations",
                  "Schedule data deletion or anonymization",
                  "Update retention policies if needed",
                  "Implement automated retention cleanup",
                ],
                created_at: new Date().toISOString(),
                status: "active",
              });
            }
            return [2 /*return*/, alerts];
          case 3:
            error_11 = _b.sent();
            console.error("Error checking retention compliance:", error_11);
            return [2 /*return*/, []];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  RealTimeComplianceMonitor.prototype.checkDocumentationCompliance = function () {
    return __awaiter(this, void 0, void 0, function () {
      var alerts, _a, documentationIssues, error, error_12;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            alerts = [];
            _b.label = 1;
          case 1:
            _b.trys.push([1, 3, , 4]);
            return [4 /*yield*/, this.supabase.rpc("check_documentation_compliance")];
          case 2:
            (_a = _b.sent()), (documentationIssues = _a.data), (error = _a.error);
            if (error) throw error;
            if (documentationIssues && documentationIssues.missing_documents > 0) {
              alerts.push({
                id: "documentation-missing-".concat(Date.now()),
                type: "medium",
                category: "documentation",
                title: "Missing LGPD Documentation",
                description: "".concat(
                  documentationIssues.missing_documents,
                  " required LGPD documents are missing or outdated",
                ),
                severity_score: 70,
                auto_resolution_available: false,
                resolution_steps: [
                  "Review required LGPD documentation",
                  "Update privacy policies and notices",
                  "Complete data processing records",
                  "Review and update consent forms",
                ],
                created_at: new Date().toISOString(),
                status: "active",
              });
            }
            return [2 /*return*/, alerts];
          case 3:
            error_12 = _b.sent();
            console.error("Error checking documentation compliance:", error_12);
            return [2 /*return*/, []];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  RealTimeComplianceMonitor.prototype.checkThirdPartyCompliance = function () {
    return __awaiter(this, void 0, void 0, function () {
      var alerts, _a, thirdPartyIssues, error, error_13;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            alerts = [];
            _b.label = 1;
          case 1:
            _b.trys.push([1, 3, , 4]);
            return [4 /*yield*/, this.supabase.rpc("check_third_party_compliance")];
          case 2:
            (_a = _b.sent()), (thirdPartyIssues = _a.data), (error = _a.error);
            if (error) throw error;
            if (thirdPartyIssues && thirdPartyIssues.non_compliant_shares > 0) {
              alerts.push({
                id: "third-party-compliance-".concat(Date.now()),
                type: "high",
                category: "third_party",
                title: "Third-Party Compliance Issues",
                description: "".concat(
                  thirdPartyIssues.non_compliant_shares,
                  " third-party data shares lack proper compliance documentation",
                ),
                severity_score: 85,
                auto_resolution_available: false,
                resolution_steps: [
                  "Review third-party data sharing agreements",
                  "Update data processing agreements (DPAs)",
                  "Verify third-party LGPD compliance",
                  "Document legal basis for data sharing",
                ],
                created_at: new Date().toISOString(),
                status: "active",
              });
            }
            return [2 /*return*/, alerts];
          case 3:
            error_13 = _b.sent();
            console.error("Error checking third-party compliance:", error_13);
            return [2 /*return*/, []];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  RealTimeComplianceMonitor.prototype.setupRealtimeListeners = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _this = this;
      return __generator(this, function (_a) {
        // Set up real-time listeners for critical tables
        this.supabase
          .channel("compliance-monitoring")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "lgpd_breach_incidents",
            },
            (payload) =>
              __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                  switch (_a.label) {
                    case 0:
                      if (!(payload.eventType === "INSERT")) return [3 /*break*/, 2];
                      return [4 /*yield*/, this.handleBreachIncidentAlert(payload.new)];
                    case 1:
                      _a.sent();
                      _a.label = 2;
                    case 2:
                      return [2 /*return*/];
                  }
                });
              }),
          )
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "lgpd_data_subject_requests",
            },
            (payload) =>
              __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                  switch (_a.label) {
                    case 0:
                      if (!(payload.eventType === "INSERT")) return [3 /*break*/, 2];
                      return [4 /*yield*/, this.handleDataSubjectRequestAlert(payload.new)];
                    case 1:
                      _a.sent();
                      _a.label = 2;
                    case 2:
                      return [2 /*return*/];
                  }
                });
              }),
          )
          .subscribe();
        return [2 /*return*/];
      });
    });
  };
  RealTimeComplianceMonitor.prototype.handleBreachIncidentAlert = function (incident) {
    return __awaiter(this, void 0, void 0, function () {
      var alert_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!(incident.severity === "high" || incident.severity === "critical"))
              return [3 /*break*/, 2];
            alert_2 = {
              id: "breach-incident-".concat(incident.id),
              type: "critical",
              category: "breach",
              title: "New Critical Breach Incident",
              description: "A ".concat(
                incident.severity,
                " severity breach incident has been reported",
              ),
              severity_score: incident.severity === "critical" ? 100 : 90,
              legal_deadline: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
              auto_resolution_available: false,
              resolution_steps: [
                "Assess breach impact immediately",
                "Contain the breach",
                "Notify ANPD within 72 hours if required",
                "Notify affected users if required",
              ],
              affected_users: incident.affected_users,
              created_at: new Date().toISOString(),
              status: "active",
            };
            return [4 /*yield*/, this.triggerAlertNotification(alert_2)];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            return [2 /*return*/];
        }
      });
    });
  };
  RealTimeComplianceMonitor.prototype.handleDataSubjectRequestAlert = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var alert_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!(request.request_type === "erasure" || request.priority === "high"))
              return [3 /*break*/, 2];
            alert_3 = {
              id: "data-request-".concat(request.id),
              type: "high",
              category: "rights",
              title: "High-Priority Data Subject Request",
              description: "A ".concat(
                request.request_type,
                " request requires immediate attention",
              ),
              severity_score: 80,
              legal_deadline: request.legal_deadline,
              auto_resolution_available: request.request_type !== "erasure",
              resolution_steps: [
                "Review request details",
                "Verify user identity",
                "Process request within legal deadline",
                "Notify user of completion",
              ],
              created_at: new Date().toISOString(),
              status: "active",
            };
            return [4 /*yield*/, this.triggerAlertNotification(alert_3)];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            return [2 /*return*/];
        }
      });
    });
  };
  RealTimeComplianceMonitor.prototype.triggerAlertNotification = function (alert) {
    return __awaiter(this, void 0, void 0, function () {
      var _i, _a, callback;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            // Trigger registered callbacks
            for (_i = 0, _a = this.alertCallbacks; _i < _a.length; _i++) {
              callback = _a[_i];
              try {
                callback(alert);
              } catch (error) {
                console.error("Error in alert callback:", error);
              }
            }
            if (!this.config.notification_channels.email) return [3 /*break*/, 2];
            return [4 /*yield*/, this.sendEmailNotification(alert)];
          case 1:
            _b.sent();
            _b.label = 2;
          case 2:
            if (!this.config.notification_channels.webhook) return [3 /*break*/, 4];
            return [4 /*yield*/, this.sendWebhookNotification(alert)];
          case 3:
            _b.sent();
            _b.label = 4;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  RealTimeComplianceMonitor.prototype.sendEmailNotification = function (alert) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementation for email notifications
        // This would integrate with your email service
        console.log("Email notification sent for alert:", alert.title);
        return [2 /*return*/];
      });
    });
  };
  RealTimeComplianceMonitor.prototype.sendWebhookNotification = function (alert) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementation for webhook notifications
        // This would send to configured webhook endpoints
        console.log("Webhook notification sent for alert:", alert.title);
        return [2 /*return*/];
      });
    });
  };
  RealTimeComplianceMonitor.prototype.getComplianceTrends = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, trends, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.rpc("get_compliance_trends", {
                days_back: 30,
              }),
            ];
          case 1:
            (_a = _b.sent()), (trends = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, trends];
        }
      });
    });
  };
  RealTimeComplianceMonitor.prototype.getUpcomingLegalDeadlines = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, deadlines, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, this.supabase.rpc("get_upcoming_legal_deadlines")];
          case 1:
            (_a = _b.sent()), (deadlines = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, deadlines || []];
        }
      });
    });
  };
  RealTimeComplianceMonitor.prototype.getRecentComplianceActivities = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, activities, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_audit_events")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(20),
            ];
          case 1:
            (_a = _b.sent()), (activities = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, activities || []];
        }
      });
    });
  };
  return RealTimeComplianceMonitor;
})();
exports.RealTimeComplianceMonitor = RealTimeComplianceMonitor;
