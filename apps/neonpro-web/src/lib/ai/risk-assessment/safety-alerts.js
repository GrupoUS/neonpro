/**
 * Safety Alerts System
 * Story 3.2: AI-powered Risk Assessment + Insights Implementation
 *
 * This module implements comprehensive safety alerts and monitoring:
 * - Real-time risk monitoring and alerts
 * - Automated safety protocol activation
 * - Emergency response coordination
 * - Compliance violation detection
 * - Predictive safety warnings
 * - Multi-channel alert distribution
 * - Brazilian healthcare safety standards compliance
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
var __spreadArray =
  (this && this.__spreadArray) ||
  ((to, from, pack) => {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafetyAlertsSystem = void 0;
var client_1 = require("@/lib/supabase/client");
var SafetyAlertsSystem = /** @class */ (() => {
  function SafetyAlertsSystem(config) {
    this.supabase = (0, client_1.createClient)();
    this.alertRules = new Map();
    this.activeAlerts = new Map();
    this.alertHistory = [];
    this.isMonitoring = false;
    this.config = this.initializeConfig(config);
    this.loadAlertRules();
    this.loadActiveAlerts();
    if (this.config.monitoring.realTimeEnabled) {
      this.startRealTimeMonitoring();
    }
  }
  /**
   * Create and process a safety alert
   */
  SafetyAlertsSystem.prototype.createAlert = function (
    type,
    severity,
    title,
    message,
    details,
    options,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var alertId, now, alert_1, error_1;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 4, , 5]);
            alertId = this.generateAlertId();
            now = new Date();
            _a = {
              id: alertId,
              type: type,
              severity: severity,
              priority:
                (options === null || options === void 0 ? void 0 : options.priority) ||
                this.determinePriority(severity),
              status: "active",
              title: title,
              message: message,
              details: details,
              metadata: {
                source: "safety_alerts_system",
                timestamp: now,
                expiresAt: (options === null || options === void 0 ? void 0 : options.expiresIn)
                  ? new Date(now.getTime() + options.expiresIn * 60000)
                  : undefined,
                escalationTime: (
                  options === null || options === void 0
                    ? void 0
                    : options.escalateIn
                )
                  ? new Date(now.getTime() + options.escalateIn * 60000)
                  : undefined,
              },
              channels:
                (options === null || options === void 0 ? void 0 : options.channels) ||
                this.getDefaultChannels(severity),
            };
            return [
              4 /*yield*/,
              this.determineRecipients(
                type,
                severity,
                options === null || options === void 0 ? void 0 : options.recipients,
              ),
            ];
          case 1:
            alert_1 =
              ((_a.recipients = _b.sent()),
              (_a.compliance = this.determineComplianceRequirements(type, severity)),
              _a);
            // Store alert
            this.activeAlerts.set(alertId, alert_1);
            return [
              4 /*yield*/,
              this.storeAlert(alert_1),
              // Process alert
            ];
          case 2:
            _b.sent();
            // Process alert
            return [4 /*yield*/, this.processAlert(alert_1)];
          case 3:
            // Process alert
            _b.sent();
            console.log(
              "Safety alert created: "
                .concat(alertId, " - ")
                .concat(title, " (")
                .concat(severity, ")"),
            );
            return [2 /*return*/, alert_1];
          case 4:
            error_1 = _b.sent();
            console.error("Error creating safety alert:", error_1);
            throw new Error("Failed to create safety alert");
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Process risk assessment and generate alerts
   */
  SafetyAlertsSystem.prototype.processRiskAssessment = function (
    patientId,
    treatmentId,
    riskResult,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var alerts, _i, _a, criticalAlert, alert_2, alert_3, contraindications, alert_4, error_2;
      var _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            alerts = [];
            _c.label = 1;
          case 1:
            _c.trys.push([1, 10, , 11]);
            if (!(riskResult.criticalAlerts && riskResult.criticalAlerts.length > 0))
              return [3 /*break*/, 5];
            (_i = 0), (_a = riskResult.criticalAlerts);
            _c.label = 2;
          case 2:
            if (!(_i < _a.length)) return [3 /*break*/, 5];
            criticalAlert = _a[_i];
            return [
              4 /*yield*/,
              this.createAlert(
                criticalAlert.type,
                criticalAlert.severity,
                "Critical Risk Alert: ".concat(criticalAlert.type),
                criticalAlert.message,
                {
                  patientId: patientId,
                  treatmentId: treatmentId,
                  riskScore: riskResult.overallRisk.score,
                  riskFactors: [criticalAlert.message],
                  requiredActions:
                    criticalAlert.action === "block"
                      ? ["Treatment blocked pending review"]
                      : ["Immediate review required"],
                  timeframe: criticalAlert.severity === "critical" ? "Immediate" : "15 minutes",
                  consequences: ["Patient safety risk", "Potential complications"],
                },
                {
                  priority: "critical",
                  escalateIn: criticalAlert.severity === "critical" ? 5 : 15,
                },
              ),
            ];
          case 3:
            alert_2 = _c.sent();
            alerts.push(alert_2);
            _c.label = 4;
          case 4:
            _i++;
            return [3 /*break*/, 2];
          case 5:
            if (
              !(
                riskResult.overallRisk.severity === "high" ||
                riskResult.overallRisk.severity === "critical"
              )
            )
              return [3 /*break*/, 7];
            return [
              4 /*yield*/,
              this.createAlert(
                "high_risk",
                riskResult.overallRisk.severity === "critical" ? "critical" : "urgent",
                "High Risk Patient Alert",
                "Patient "
                  .concat(patientId, " has ")
                  .concat(riskResult.overallRisk.severity, " risk level (")
                  .concat(riskResult.overallRisk.score, "/100)"),
                {
                  patientId: patientId,
                  treatmentId: treatmentId,
                  riskScore: riskResult.overallRisk.score,
                  riskFactors: this.extractRiskFactors(riskResult.categoryRisks),
                  recommendations: riskResult.recommendations.preOperative,
                  requiredActions: ["Enhanced monitoring", "Specialist consultation"],
                  timeframe: "Before procedure",
                  consequences: ["Increased complication risk", "Extended recovery time"],
                },
                {
                  priority: riskResult.overallRisk.severity === "critical" ? "critical" : "high",
                },
              ),
            ];
          case 6:
            alert_3 = _c.sent();
            alerts.push(alert_3);
            _c.label = 7;
          case 7:
            contraindications =
              (_b = riskResult.criticalAlerts) === null || _b === void 0
                ? void 0
                : _b.filter((alert) => alert.type === "contraindication");
            if (!(contraindications && contraindications.length > 0)) return [3 /*break*/, 9];
            return [
              4 /*yield*/,
              this.createAlert(
                "contraindication",
                "critical",
                "Contraindication Detected",
                "Treatment contraindications have been identified",
                {
                  patientId: patientId,
                  treatmentId: treatmentId,
                  riskFactors: contraindications.map((c) => c.message),
                  requiredActions: ["Treatment blocked", "Physician review required"],
                  timeframe: "Immediate",
                  consequences: ["Treatment cannot proceed", "Alternative treatment required"],
                },
                {
                  priority: "critical",
                  escalateIn: 0, // Immediate escalation
                },
              ),
            ];
          case 8:
            alert_4 = _c.sent();
            alerts.push(alert_4);
            _c.label = 9;
          case 9:
            return [2 /*return*/, alerts];
          case 10:
            error_2 = _c.sent();
            console.error("Error processing risk assessment alerts:", error_2);
            return [2 /*return*/, alerts];
          case 11:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Monitor patient vitals and generate alerts
   */
  SafetyAlertsSystem.prototype.monitorPatientVitals = function (patientId, vitals) {
    return __awaiter(this, void 0, void 0, function () {
      var alerts,
        severity,
        alert_5,
        _a,
        systolic,
        diastolic,
        severity,
        alert_6,
        severity,
        alert_7,
        error_3;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            alerts = [];
            _b.label = 1;
          case 1:
            _b.trys.push([1, 8, , 9]);
            if (!vitals.heartRate) return [3 /*break*/, 3];
            if (!(vitals.heartRate > 120 || vitals.heartRate < 50)) return [3 /*break*/, 3];
            severity = vitals.heartRate > 150 || vitals.heartRate < 40 ? "critical" : "urgent";
            return [
              4 /*yield*/,
              this.createAlert(
                "critical_risk",
                severity,
                "Abnormal Heart Rate",
                "Heart rate: ".concat(vitals.heartRate, " bpm"),
                {
                  patientId: patientId,
                  riskFactors: ["Heart rate: ".concat(vitals.heartRate, " bpm")],
                  requiredActions: ["Immediate assessment", "Cardiac monitoring"],
                  timeframe: "Immediate",
                  consequences: ["Cardiac complications", "Hemodynamic instability"],
                },
                { priority: "critical", escalateIn: 2 },
              ),
            ];
          case 2:
            alert_5 = _b.sent();
            alerts.push(alert_5);
            _b.label = 3;
          case 3:
            if (!vitals.bloodPressure) return [3 /*break*/, 5];
            (_a = vitals.bloodPressure), (systolic = _a.systolic), (diastolic = _a.diastolic);
            if (!(systolic > 180 || systolic < 90 || diastolic > 110 || diastolic < 60))
              return [3 /*break*/, 5];
            severity =
              systolic > 200 || systolic < 80 || diastolic > 120 || diastolic < 50
                ? "critical"
                : "urgent";
            return [
              4 /*yield*/,
              this.createAlert(
                "critical_risk",
                severity,
                "Abnormal Blood Pressure",
                "Blood pressure: ".concat(systolic, "/").concat(diastolic, " mmHg"),
                {
                  patientId: patientId,
                  riskFactors: [
                    "Blood pressure: ".concat(systolic, "/").concat(diastolic, " mmHg"),
                  ],
                  requiredActions: ["Blood pressure management", "Cardiovascular assessment"],
                  timeframe: "Immediate",
                  consequences: ["Cardiovascular complications", "Stroke risk"],
                },
                { priority: "critical", escalateIn: 2 },
              ),
            ];
          case 4:
            alert_6 = _b.sent();
            alerts.push(alert_6);
            _b.label = 5;
          case 5:
            if (!(vitals.oxygenSaturation && vitals.oxygenSaturation < 95)) return [3 /*break*/, 7];
            severity = vitals.oxygenSaturation < 90 ? "critical" : "urgent";
            return [
              4 /*yield*/,
              this.createAlert(
                "critical_risk",
                severity,
                "Low Oxygen Saturation",
                "Oxygen saturation: ".concat(vitals.oxygenSaturation, "%"),
                {
                  patientId: patientId,
                  riskFactors: ["Oxygen saturation: ".concat(vitals.oxygenSaturation, "%")],
                  requiredActions: ["Oxygen therapy", "Respiratory assessment"],
                  timeframe: "Immediate",
                  consequences: ["Hypoxia", "Respiratory failure"],
                },
                { priority: "critical", escalateIn: 1 },
              ),
            ];
          case 6:
            alert_7 = _b.sent();
            alerts.push(alert_7);
            _b.label = 7;
          case 7:
            return [2 /*return*/, alerts];
          case 8:
            error_3 = _b.sent();
            console.error("Error monitoring patient vitals:", error_3);
            return [2 /*return*/, alerts];
          case 9:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Check for drug interactions
   */
  SafetyAlertsSystem.prototype.checkDrugInteractions = function (
    patientId,
    medications,
    newMedication,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var alerts, interactions, _i, interactions_1, interaction, severity, alert_8, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            alerts = [];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 7, , 8]);
            return [
              4 /*yield*/,
              this.supabase
                .from("drug_interactions")
                .select("*")
                .or(
                  "drug1.in.(".concat(medications.join(","), "),drug2.eq.").concat(newMedication),
                ),
            ];
          case 2:
            interactions = _a.sent().data;
            if (!(interactions && interactions.length > 0)) return [3 /*break*/, 6];
            (_i = 0), (interactions_1 = interactions);
            _a.label = 3;
          case 3:
            if (!(_i < interactions_1.length)) return [3 /*break*/, 6];
            interaction = interactions_1[_i];
            severity = this.mapInteractionSeverity(interaction.severity);
            return [
              4 /*yield*/,
              this.createAlert(
                "drug_interaction",
                severity,
                "Drug Interaction Alert",
                "Interaction between ".concat(interaction.drug1, " and ").concat(interaction.drug2),
                {
                  patientId: patientId,
                  riskFactors: [interaction.description],
                  requiredActions: ["Review medication", "Consider alternatives"],
                  timeframe: severity === "critical" ? "Immediate" : "30 minutes",
                  consequences: [interaction.consequences],
                },
                {
                  priority: severity === "critical" ? "critical" : "high",
                  escalateIn: severity === "critical" ? 5 : 30,
                },
              ),
            ];
          case 4:
            alert_8 = _a.sent();
            alerts.push(alert_8);
            _a.label = 5;
          case 5:
            _i++;
            return [3 /*break*/, 3];
          case 6:
            return [2 /*return*/, alerts];
          case 7:
            error_4 = _a.sent();
            console.error("Error checking drug interactions:", error_4);
            return [2 /*return*/, alerts];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Monitor equipment status
   */
  SafetyAlertsSystem.prototype.monitorEquipmentStatus = function (equipmentId, status) {
    return __awaiter(this, void 0, void 0, function () {
      var alerts, alert_9, alert_10, alert_11, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            alerts = [];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 8, , 9]);
            if (status.operational) return [3 /*break*/, 3];
            return [
              4 /*yield*/,
              this.createAlert(
                "equipment_failure",
                "critical",
                "Equipment Failure",
                "Equipment ".concat(equipmentId, " is not operational"),
                {
                  equipmentId: equipmentId,
                  riskFactors: __spreadArray(["Equipment failure"], status.errorCodes || [], true),
                  requiredActions: [
                    "Stop using equipment",
                    "Technical support",
                    "Use backup equipment",
                  ],
                  timeframe: "Immediate",
                  consequences: ["Treatment delay", "Patient safety risk"],
                },
                { priority: "critical", escalateIn: 0 },
              ),
            ];
          case 2:
            alert_9 = _a.sent();
            alerts.push(alert_9);
            _a.label = 3;
          case 3:
            if (!(status.calibrationStatus === "expired")) return [3 /*break*/, 5];
            return [
              4 /*yield*/,
              this.createAlert(
                "equipment_failure",
                "urgent",
                "Equipment Calibration Expired",
                "Equipment ".concat(equipmentId, " calibration has expired"),
                {
                  equipmentId: equipmentId,
                  riskFactors: ["Expired calibration"],
                  requiredActions: ["Recalibrate equipment", "Verify accuracy"],
                  timeframe: "Before next use",
                  consequences: ["Inaccurate readings", "Treatment errors"],
                },
                { priority: "high", escalateIn: 60 },
              ),
            ];
          case 4:
            alert_10 = _a.sent();
            alerts.push(alert_10);
            _a.label = 5;
          case 5:
            if (!(status.nextMaintenance && status.nextMaintenance < new Date()))
              return [3 /*break*/, 7];
            return [
              4 /*yield*/,
              this.createAlert(
                "equipment_failure",
                "warning",
                "Equipment Maintenance Overdue",
                "Equipment ".concat(equipmentId, " maintenance is overdue"),
                {
                  equipmentId: equipmentId,
                  riskFactors: ["Overdue maintenance"],
                  requiredActions: ["Schedule maintenance", "Inspect equipment"],
                  timeframe: "24 hours",
                  consequences: ["Equipment failure risk", "Reduced reliability"],
                },
                { priority: "medium", escalateIn: 1440 }, // 24 hours
              ),
            ];
          case 6:
            alert_11 = _a.sent();
            alerts.push(alert_11);
            _a.label = 7;
          case 7:
            return [2 /*return*/, alerts];
          case 8:
            error_5 = _a.sent();
            console.error("Error monitoring equipment status:", error_5);
            return [2 /*return*/, alerts];
          case 9:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Acknowledge an alert
   */
  SafetyAlertsSystem.prototype.acknowledgeAlert = function (alertId, userId, notes) {
    return __awaiter(this, void 0, void 0, function () {
      var alert_12, error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            alert_12 = this.activeAlerts.get(alertId);
            if (!alert_12) {
              throw new Error("Alert not found");
            }
            // Update alert status
            alert_12.status = "acknowledged";
            alert_12.metadata.acknowledgedBy = userId;
            alert_12.metadata.acknowledgedAt = new Date();
            // Update recipients
            alert_12.recipients.forEach((recipient) => {
              if (recipient.userId === userId) {
                recipient.acknowledged = true;
                recipient.acknowledgedAt = new Date();
              }
            });
            // Update in database
            return [4 /*yield*/, this.updateAlert(alert_12)];
          case 1:
            // Update in database
            _a.sent();
            console.log("Alert ".concat(alertId, " acknowledged by ").concat(userId));
            return [2 /*return*/, true];
          case 2:
            error_6 = _a.sent();
            console.error("Error acknowledging alert:", error_6);
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
  SafetyAlertsSystem.prototype.resolveAlert = function (alertId, userId, resolution, notes) {
    return __awaiter(this, void 0, void 0, function () {
      var alert_13, error_7;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            alert_13 = this.activeAlerts.get(alertId);
            if (!alert_13) {
              throw new Error("Alert not found");
            }
            // Update alert status
            alert_13.status = "resolved";
            alert_13.metadata.resolvedBy = userId;
            alert_13.metadata.resolvedAt = new Date();
            // Move to history
            this.alertHistory.push(alert_13);
            this.activeAlerts.delete(alertId);
            // Update in database
            return [4 /*yield*/, this.updateAlert(alert_13)];
          case 1:
            // Update in database
            _a.sent();
            console.log(
              "Alert ".concat(alertId, " resolved by ").concat(userId, ": ").concat(resolution),
            );
            return [2 /*return*/, true];
          case 2:
            error_7 = _a.sent();
            console.error("Error resolving alert:", error_7);
            return [2 /*return*/, false];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Escalate an alert
   */
  SafetyAlertsSystem.prototype.escalateAlert = function (alertId, escalationLevel, reason) {
    return __awaiter(this, void 0, void 0, function () {
      var alert_14, rule, escalationRule, _i, _a, escalateTo, _b, _c, channel, error_8;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            _d.trys.push([0, 3, , 4]);
            alert_14 = this.activeAlerts.get(alertId);
            if (!alert_14) {
              throw new Error("Alert not found");
            }
            rule = this.alertRules.get(alert_14.type);
            if (!rule || !rule.escalationRules[escalationLevel]) {
              throw new Error("Escalation rule not found");
            }
            escalationRule = rule.escalationRules[escalationLevel];
            // Update alert status
            alert_14.status = "escalated";
            alert_14.metadata.escalatedTo = escalationRule.escalateTo;
            // Add new recipients
            for (_i = 0, _a = escalationRule.escalateTo; _i < _a.length; _i++) {
              escalateTo = _a[_i];
              for (_b = 0, _c = escalationRule.channels; _b < _c.length; _b++) {
                channel = _c[_b];
                alert_14.recipients.push({
                  userId: escalateTo,
                  role: "escalation",
                  channel: channel,
                  delivered: false,
                  acknowledged: false,
                });
              }
            }
            // Send escalation notifications
            return [
              4 /*yield*/,
              this.sendAlertNotifications(alert_14, escalationRule.channels),
              // Update in database
            ];
          case 1:
            // Send escalation notifications
            _d.sent();
            // Update in database
            return [4 /*yield*/, this.updateAlert(alert_14)];
          case 2:
            // Update in database
            _d.sent();
            console.log("Alert ".concat(alertId, " escalated to level ").concat(escalationLevel));
            return [2 /*return*/, true];
          case 3:
            error_8 = _d.sent();
            console.error("Error escalating alert:", error_8);
            return [2 /*return*/, false];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get active alerts
   */
  SafetyAlertsSystem.prototype.getActiveAlerts = function (filters) {
    var alerts = Array.from(this.activeAlerts.values());
    if (filters) {
      if (filters.type) alerts = alerts.filter((a) => a.type === filters.type);
      if (filters.severity) alerts = alerts.filter((a) => a.severity === filters.severity);
      if (filters.priority) alerts = alerts.filter((a) => a.priority === filters.priority);
      if (filters.patientId)
        alerts = alerts.filter((a) => a.details.patientId === filters.patientId);
      if (filters.treatmentId)
        alerts = alerts.filter((a) => a.details.treatmentId === filters.treatmentId);
    }
    return alerts.sort((a, b) => {
      // Sort by priority and timestamp
      var priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      var aPriority = priorityOrder[a.priority];
      var bPriority = priorityOrder[b.priority];
      if (aPriority !== bPriority) return bPriority - aPriority;
      return b.metadata.timestamp.getTime() - a.metadata.timestamp.getTime();
    });
  };
  /**
   * Get alert statistics
   */
  SafetyAlertsSystem.prototype.getAlertStatistics = function (timeframe) {
    return __awaiter(this, void 0, void 0, function () {
      var query, alerts, stats_1, resolvedAlerts, escalatedAlerts, responseTimes, error_9;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            query = this.supabase.from("safety_alerts").select("*");
            if (timeframe) {
              query = query
                .gte("created_at", timeframe.start.toISOString())
                .lte("created_at", timeframe.end.toISOString());
            }
            return [4 /*yield*/, query];
          case 1:
            alerts = _a.sent().data;
            if (!alerts) {
              return [2 /*return*/, this.getEmptyStatistics()];
            }
            stats_1 = {
              total: alerts.length,
              byType: {},
              bySeverity: {},
              byStatus: {},
              responseTime: { average: 0, median: 0, percentile95: 0 },
              escalationRate: 0,
              resolutionRate: 0,
              falsePositiveRate: 0,
            };
            // Calculate statistics
            alerts.forEach((alert) => {
              stats_1.byType[alert.type] = (stats_1.byType[alert.type] || 0) + 1;
              stats_1.bySeverity[alert.severity] = (stats_1.bySeverity[alert.severity] || 0) + 1;
              stats_1.byStatus[alert.status] = (stats_1.byStatus[alert.status] || 0) + 1;
            });
            resolvedAlerts = alerts.filter((a) => a.status === "resolved");
            escalatedAlerts = alerts.filter((a) => a.status === "escalated");
            stats_1.resolutionRate = alerts.length > 0 ? resolvedAlerts.length / alerts.length : 0;
            stats_1.escalationRate = alerts.length > 0 ? escalatedAlerts.length / alerts.length : 0;
            responseTimes = resolvedAlerts
              .filter((a) => a.acknowledged_at && a.created_at)
              .map((a) => new Date(a.acknowledged_at).getTime() - new Date(a.created_at).getTime())
              .map((ms) => ms / 60000); // Convert to minutes
            if (responseTimes.length > 0) {
              stats_1.responseTime.average =
                responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
              responseTimes.sort((a, b) => a - b);
              stats_1.responseTime.median = responseTimes[Math.floor(responseTimes.length / 2)];
              stats_1.responseTime.percentile95 =
                responseTimes[Math.floor(responseTimes.length * 0.95)];
            }
            return [2 /*return*/, stats_1];
          case 2:
            error_9 = _a.sent();
            console.error("Error getting alert statistics:", error_9);
            return [2 /*return*/, this.getEmptyStatistics()];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Start real-time monitoring
   */
  SafetyAlertsSystem.prototype.startRealTimeMonitoring = function () {
    if (this.isMonitoring) return;
    this.isMonitoring = true;
    console.log("Starting real-time safety monitoring");
    // Set up Supabase real-time subscriptions
    this.setupRealtimeSubscriptions();
    // Set up periodic monitoring
    if (this.config.monitoring.batchProcessing) {
      this.monitoringInterval = setInterval(
        () => this.performPeriodicChecks(),
        this.config.monitoring.intervalMinutes * 60000,
      );
    }
  };
  /**
   * Stop real-time monitoring
   */
  SafetyAlertsSystem.prototype.stopRealTimeMonitoring = function () {
    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    console.log("Stopped real-time safety monitoring");
  };
  /**
   * Setup Supabase real-time subscriptions
   */
  SafetyAlertsSystem.prototype.setupRealtimeSubscriptions = function () {
    // Subscribe to patient vitals changes
    this.supabase
      .channel("patient_vitals")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "patient_vitals" },
        (payload) => this.handleVitalsUpdate(payload.new),
      )
      .subscribe();
    // Subscribe to equipment status changes
    this.supabase
      .channel("equipment_status")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "equipment" },
        (payload) => this.handleEquipmentUpdate(payload.new),
      )
      .subscribe();
    // Subscribe to treatment updates
    this.supabase
      .channel("treatments")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "treatments" },
        (payload) => this.handleTreatmentUpdate(payload.new),
      )
      .subscribe();
  };
  /**
   * Handle vitals update from real-time subscription
   */
  SafetyAlertsSystem.prototype.handleVitalsUpdate = function (vitals) {
    return __awaiter(this, void 0, void 0, function () {
      var error_10;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.monitorPatientVitals(vitals.patient_id, {
                heartRate: vitals.heart_rate,
                bloodPressure: vitals.blood_pressure
                  ? JSON.parse(vitals.blood_pressure)
                  : undefined,
                oxygenSaturation: vitals.oxygen_saturation,
                temperature: vitals.temperature,
                respiratoryRate: vitals.respiratory_rate,
              }),
            ];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_10 = _a.sent();
            console.error("Error handling vitals update:", error_10);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Handle equipment update from real-time subscription
   */
  SafetyAlertsSystem.prototype.handleEquipmentUpdate = function (equipment) {
    return __awaiter(this, void 0, void 0, function () {
      var error_11;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.monitorEquipmentStatus(equipment.id, {
                operational: equipment.operational,
                lastMaintenance: equipment.last_maintenance
                  ? new Date(equipment.last_maintenance)
                  : undefined,
                nextMaintenance: equipment.next_maintenance
                  ? new Date(equipment.next_maintenance)
                  : undefined,
                errorCodes: equipment.error_codes ? JSON.parse(equipment.error_codes) : undefined,
                calibrationStatus: equipment.calibration_status,
              }),
            ];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_11 = _a.sent();
            console.error("Error handling equipment update:", error_11);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Handle treatment update from real-time subscription
   */
  SafetyAlertsSystem.prototype.handleTreatmentUpdate = function (treatment) {
    return __awaiter(this, void 0, void 0, function () {
      var error_12;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            if (!(treatment.status === "emergency" || treatment.status === "complication"))
              return [3 /*break*/, 2];
            return [
              4 /*yield*/,
              this.createAlert(
                "emergency_protocol",
                "critical",
                "Treatment Emergency",
                "Treatment ".concat(treatment.id, " status changed to ").concat(treatment.status),
                {
                  patientId: treatment.patient_id,
                  treatmentId: treatment.id,
                  riskFactors: [treatment.status],
                  requiredActions: ["Emergency response", "Immediate assessment"],
                  timeframe: "Immediate",
                  consequences: ["Patient safety risk"],
                },
                { priority: "critical", escalateIn: 0 },
              ),
            ];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            return [3 /*break*/, 4];
          case 3:
            error_12 = _a.sent();
            console.error("Error handling treatment update:", error_12);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Perform periodic safety checks
   */
  SafetyAlertsSystem.prototype.performPeriodicChecks = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_13;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            console.log("Performing periodic safety checks");
            // Check for expired alerts
            return [
              4 /*yield*/,
              this.checkExpiredAlerts(),
              // Check for escalation timeouts
            ];
          case 1:
            // Check for expired alerts
            _a.sent();
            // Check for escalation timeouts
            return [
              4 /*yield*/,
              this.checkEscalationTimeouts(),
              // Check compliance requirements
            ];
          case 2:
            // Check for escalation timeouts
            _a.sent();
            // Check compliance requirements
            return [
              4 /*yield*/,
              this.checkComplianceRequirements(),
              // Update alert statistics
            ];
          case 3:
            // Check compliance requirements
            _a.sent();
            // Update alert statistics
            return [4 /*yield*/, this.updateAlertStatistics()];
          case 4:
            // Update alert statistics
            _a.sent();
            return [3 /*break*/, 6];
          case 5:
            error_13 = _a.sent();
            console.error("Error in periodic safety checks:", error_13);
            return [3 /*break*/, 6];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Check for expired alerts
   */
  SafetyAlertsSystem.prototype.checkExpiredAlerts = function () {
    return __awaiter(this, void 0, void 0, function () {
      var now, _i, _a, _b, alertId, alert_15;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            now = new Date();
            (_i = 0), (_a = this.activeAlerts);
            _c.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 4];
            (_b = _a[_i]), (alertId = _b[0]), (alert_15 = _b[1]);
            if (!(alert_15.metadata.expiresAt && alert_15.metadata.expiresAt < now))
              return [3 /*break*/, 3];
            return [4 /*yield*/, this.resolveAlert(alertId, "system", "Alert expired")];
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
  /**
   * Check for escalation timeouts
   */
  SafetyAlertsSystem.prototype.checkEscalationTimeouts = function () {
    return __awaiter(this, void 0, void 0, function () {
      var now, _i, _a, _b, alertId, alert_16, rule;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            now = new Date();
            (_i = 0), (_a = this.activeAlerts);
            _c.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 4];
            (_b = _a[_i]), (alertId = _b[0]), (alert_16 = _b[1]);
            if (
              !(
                alert_16.metadata.escalationTime &&
                alert_16.metadata.escalationTime < now &&
                alert_16.status === "active"
              )
            )
              return [3 /*break*/, 3];
            rule = this.alertRules.get(alert_16.type);
            if (!(rule && rule.escalationRules.length > 0)) return [3 /*break*/, 3];
            return [4 /*yield*/, this.escalateAlert(alertId, 0, "Escalation timeout")];
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
  /**
   * Check compliance requirements
   */
  SafetyAlertsSystem.prototype.checkComplianceRequirements = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _i, _a, _b, alertId, alert_17;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            (_i = 0), (_a = this.activeAlerts);
            _c.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 4];
            (_b = _a[_i]), (alertId = _b[0]), (alert_17 = _b[1]);
            if (!(alert_17.compliance.cfmRequired || alert_17.compliance.anvisaRequired))
              return [3 /*break*/, 3];
            // Generate compliance report if not already done
            return [4 /*yield*/, this.generateComplianceReport(alert_17)];
          case 2:
            // Generate compliance report if not already done
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
  /**
   * Generate compliance report
   */
  SafetyAlertsSystem.prototype.generateComplianceReport = function (alert) {
    return __awaiter(this, void 0, void 0, function () {
      var report, error_14;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            report = {
              alertId: alert.id,
              type: alert.type,
              severity: alert.severity,
              patientId: alert.details.patientId,
              treatmentId: alert.details.treatmentId,
              timestamp: alert.metadata.timestamp,
              description: alert.message,
              actions_taken: alert.details.requiredActions,
              outcome: alert.status,
              cfm_compliance: alert.compliance.cfmRequired,
              anvisa_compliance: alert.compliance.anvisaRequired,
              generated_at: new Date(),
            };
            return [4 /*yield*/, this.supabase.from("compliance_reports").insert(report)];
          case 1:
            _a.sent();
            console.log("Compliance report generated for alert ".concat(alert.id));
            return [3 /*break*/, 3];
          case 2:
            error_14 = _a.sent();
            console.error("Error generating compliance report:", error_14);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Helper methods
   */
  SafetyAlertsSystem.prototype.generateAlertId = () =>
    "alert_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
  SafetyAlertsSystem.prototype.determinePriority = (severity) => {
    var priorityMap = {
      emergency: "critical",
      critical: "critical",
      urgent: "high",
      warning: "medium",
      info: "low",
    };
    return priorityMap[severity];
  };
  SafetyAlertsSystem.prototype.getDefaultChannels = (severity) => {
    if (severity === "emergency" || severity === "critical") {
      return ["dashboard", "email", "sms", "push", "emergency"];
    }
    if (severity === "urgent") {
      return ["dashboard", "email", "push"];
    }
    return ["dashboard", "email"];
  };
  SafetyAlertsSystem.prototype.determineRecipients = function (type, severity, customRecipients) {
    return __awaiter(this, void 0, void 0, function () {
      var recipients, defaultRecipients;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            recipients = [];
            if (!customRecipients) return [3 /*break*/, 1];
            customRecipients.forEach((userId) => {
              recipients.push({
                userId: userId,
                role: "custom",
                channel: "dashboard",
                delivered: false,
                acknowledged: false,
              });
            });
            return [3 /*break*/, 3];
          case 1:
            return [4 /*yield*/, this.getDefaultRecipients(type, severity)];
          case 2:
            defaultRecipients = _a.sent();
            recipients.push.apply(recipients, defaultRecipients);
            _a.label = 3;
          case 3:
            return [2 /*return*/, recipients];
        }
      });
    });
  };
  SafetyAlertsSystem.prototype.getDefaultRecipients = function (type, severity) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // This would query the database for default recipients based on roles
        // For now, return empty array
        return [2 /*return*/, []];
      });
    });
  };
  SafetyAlertsSystem.prototype.determineComplianceRequirements = (type, severity) => ({
    cfmRequired: severity === "critical" || severity === "emergency",
    anvisaRequired: type === "equipment_failure" || severity === "emergency",
    ethicsRequired: type === "contraindication" || severity === "critical",
    documentationRequired: true,
    reportingRequired: severity === "critical" || severity === "emergency",
  });
  SafetyAlertsSystem.prototype.extractRiskFactors = (categoryRisks) =>
    categoryRisks
      .filter((risk) => risk.severity === "high" || risk.severity === "critical")
      .flatMap((risk) => risk.factors);
  SafetyAlertsSystem.prototype.mapInteractionSeverity = (severity) => {
    var severityMap = {
      major: "critical",
      moderate: "urgent",
      minor: "warning",
      contraindicated: "critical",
    };
    return severityMap[severity] || "warning";
  };
  SafetyAlertsSystem.prototype.processAlert = function (alert) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            // Send notifications
            return [
              4 /*yield*/,
              this.sendAlertNotifications(alert, alert.channels),
              // Apply alert rules
            ];
          case 1:
            // Send notifications
            _a.sent();
            // Apply alert rules
            return [
              4 /*yield*/,
              this.applyAlertRules(alert),
              // Log alert
            ];
          case 2:
            // Apply alert rules
            _a.sent();
            // Log alert
            console.log("Processing alert: ".concat(alert.id, " - ").concat(alert.title));
            return [2 /*return*/];
        }
      });
    });
  };
  SafetyAlertsSystem.prototype.sendAlertNotifications = function (alert, channels) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementation would send notifications via various channels
        console.log(
          "Sending alert notifications for "
            .concat(alert.id, " via channels: ")
            .concat(channels.join(", ")),
        );
        return [2 /*return*/];
      });
    });
  };
  SafetyAlertsSystem.prototype.applyAlertRules = function (alert) {
    return __awaiter(this, void 0, void 0, function () {
      var rule, _i, _a, action, _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            rule = this.alertRules.get(alert.type);
            if (!rule) return [2 /*return*/];
            (_i = 0), (_a = rule.actions);
            _c.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 8];
            action = _a[_i];
            _b = action.type;
            switch (_b) {
              case "block":
                return [3 /*break*/, 2];
              case "require_approval":
                return [3 /*break*/, 3];
              case "escalate":
                return [3 /*break*/, 4];
              case "log":
                return [3 /*break*/, 6];
            }
            return [3 /*break*/, 7];
          case 2:
            // Block the treatment or action
            return [3 /*break*/, 7];
          case 3:
            // Require approval before proceeding
            return [3 /*break*/, 7];
          case 4:
            // Immediate escalation
            return [4 /*yield*/, this.escalateAlert(alert.id, 0, "Rule-based escalation")];
          case 5:
            // Immediate escalation
            _c.sent();
            return [3 /*break*/, 7];
          case 6:
            // Additional logging
            console.log("Rule action: ".concat(action.type, " for alert ").concat(alert.id));
            return [3 /*break*/, 7];
          case 7:
            _i++;
            return [3 /*break*/, 1];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  SafetyAlertsSystem.prototype.storeAlert = function (alert) {
    return __awaiter(this, void 0, void 0, function () {
      var error_15;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("safety_alerts").insert({
                id: alert.id,
                type: alert.type,
                severity: alert.severity,
                priority: alert.priority,
                status: alert.status,
                title: alert.title,
                message: alert.message,
                details: JSON.stringify(alert.details),
                metadata: JSON.stringify(alert.metadata),
                channels: JSON.stringify(alert.channels),
                recipients: JSON.stringify(alert.recipients),
                compliance: JSON.stringify(alert.compliance),
                created_at: alert.metadata.timestamp.toISOString(),
              }),
            ];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_15 = _a.sent();
            console.error("Error storing alert:", error_15);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  SafetyAlertsSystem.prototype.updateAlert = function (alert) {
    return __awaiter(this, void 0, void 0, function () {
      var error_16;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("safety_alerts")
                .update({
                  status: alert.status,
                  metadata: JSON.stringify(alert.metadata),
                  recipients: JSON.stringify(alert.recipients),
                  updated_at: new Date().toISOString(),
                })
                .eq("id", alert.id),
            ];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_16 = _a.sent();
            console.error("Error updating alert:", error_16);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  SafetyAlertsSystem.prototype.loadAlertRules = function () {
    return __awaiter(this, void 0, void 0, function () {
      var rules, error_17;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.supabase.from("alert_rules").select("*").eq("enabled", true)];
          case 1:
            rules = _a.sent().data;
            if (rules) {
              rules.forEach((rule) => {
                _this.alertRules.set(rule.type, {
                  id: rule.id,
                  name: rule.name,
                  description: rule.description,
                  type: rule.type,
                  severity: rule.severity,
                  priority: rule.priority,
                  conditions: JSON.parse(rule.conditions || "[]"),
                  actions: JSON.parse(rule.actions || "[]"),
                  channels: JSON.parse(rule.channels || "[]"),
                  recipients: JSON.parse(rule.recipients || "[]"),
                  enabled: rule.enabled,
                  escalationRules: JSON.parse(rule.escalation_rules || "[]"),
                  compliance: JSON.parse(rule.compliance || "{}"),
                });
              });
            }
            return [3 /*break*/, 3];
          case 2:
            error_17 = _a.sent();
            console.error("Error loading alert rules:", error_17);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  SafetyAlertsSystem.prototype.loadActiveAlerts = function () {
    return __awaiter(this, void 0, void 0, function () {
      var alerts, error_18;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("safety_alerts")
                .select("*")
                .in("status", ["active", "acknowledged", "escalated"]),
            ];
          case 1:
            alerts = _a.sent().data;
            if (alerts) {
              alerts.forEach((alertData) => {
                var alert = {
                  id: alertData.id,
                  type: alertData.type,
                  severity: alertData.severity,
                  priority: alertData.priority,
                  status: alertData.status,
                  title: alertData.title,
                  message: alertData.message,
                  details: JSON.parse(alertData.details || "{}"),
                  metadata: JSON.parse(alertData.metadata || "{}"),
                  channels: JSON.parse(alertData.channels || "[]"),
                  recipients: JSON.parse(alertData.recipients || "[]"),
                  compliance: JSON.parse(alertData.compliance || "{}"),
                };
                _this.activeAlerts.set(alert.id, alert);
              });
            }
            return [3 /*break*/, 3];
          case 2:
            error_18 = _a.sent();
            console.error("Error loading active alerts:", error_18);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  SafetyAlertsSystem.prototype.initializeConfig = (config) => {
    var defaultConfig = {
      enabled: true,
      channels: {
        dashboard: { enabled: true },
        email: { enabled: true },
        sms: { enabled: true },
        push: { enabled: true },
        emergency: { enabled: true },
      },
      escalation: {
        enabled: true,
        timeouts: {
          info: 60,
          warning: 30,
          urgent: 15,
          critical: 5,
          emergency: 0,
        },
        maxEscalations: 3,
      },
      compliance: {
        cfmReporting: true,
        anvisaReporting: true,
        ethicsReporting: true,
        automaticDocumentation: true,
      },
      monitoring: {
        realTimeEnabled: true,
        batchProcessing: true,
        intervalMinutes: 5,
      },
    };
    return __assign(__assign({}, defaultConfig), config);
  };
  SafetyAlertsSystem.prototype.getEmptyStatistics = () => ({
    total: 0,
    byType: {},
    bySeverity: {},
    byStatus: {},
    responseTime: { average: 0, median: 0, percentile95: 0 },
    escalationRate: 0,
    resolutionRate: 0,
    falsePositiveRate: 0,
  });
  SafetyAlertsSystem.prototype.updateAlertStatistics = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/]);
    });
  };
  return SafetyAlertsSystem;
})();
exports.SafetyAlertsSystem = SafetyAlertsSystem;
