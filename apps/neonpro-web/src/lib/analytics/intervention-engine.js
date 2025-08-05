/**
 * Story 11.2: Proactive Intervention Engine
 * Automated intervention system for high-risk patients and no-show prevention
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
exports.interventionEngine = exports.InterventionEngine = exports.InterventionStatus = void 0;
exports.formatCost = formatCost;
exports.formatEffectiveness = formatEffectiveness;
exports.getInterventionStatusColor = getInterventionStatusColor;
exports.calculateROI = calculateROI;
// Intervention execution status
var InterventionStatus;
((InterventionStatus) => {
  InterventionStatus["SCHEDULED"] = "SCHEDULED";
  InterventionStatus["EXECUTED"] = "EXECUTED";
  InterventionStatus["FAILED"] = "FAILED";
  InterventionStatus["CANCELLED"] = "CANCELLED";
  InterventionStatus["PENDING_RESPONSE"] = "PENDING_RESPONSE";
})(InterventionStatus || (exports.InterventionStatus = InterventionStatus = {}));
// Main intervention engine class
var InterventionEngine = /** @class */ (() => {
  function InterventionEngine() {
    this.supabase = createClient(ComponentClient());
    this.interventionTypes = new Map();
    this.activeCampaigns = new Map();
    this.initializeInterventionTypes();
  }
  /**
   * Initialize predefined intervention types
   */
  InterventionEngine.prototype.initializeInterventionTypes = function () {
    var types = [
      {
        id: "sms_reminder_24h",
        name: "24-Hour SMS Reminder",
        category: "REMINDER",
        channel: "SMS",
        automationLevel: "FULLY_AUTOMATED",
        executionTime: "24h before",
        costPerExecution: 0.5,
        averageEffectiveness: 0.35,
        targetRiskLevel: ["LOW", "MEDIUM"],
        prerequisites: ["valid_phone_number"],
        contraindications: ["opted_out_sms"],
      },
      {
        id: "email_confirmation_48h",
        name: "48-Hour Email Confirmation",
        category: "CONFIRMATION",
        channel: "EMAIL",
        automationLevel: "FULLY_AUTOMATED",
        executionTime: "48h before",
        costPerExecution: 0.1,
        averageEffectiveness: 0.42,
        targetRiskLevel: ["MEDIUM", "HIGH"],
        prerequisites: ["valid_email"],
        contraindications: ["opted_out_email"],
      },
      {
        id: "phone_call_high_risk",
        name: "Personal Phone Call",
        category: "CONTACT",
        channel: "PHONE",
        automationLevel: "MANUAL",
        executionTime: "48h before",
        costPerExecution: 15.0,
        averageEffectiveness: 0.75,
        targetRiskLevel: ["HIGH", "CRITICAL"],
        prerequisites: ["valid_phone_number"],
        contraindications: ["do_not_call_list"],
      },
      {
        id: "loyalty_incentive",
        name: "Loyalty Points Incentive",
        category: "INCENTIVE",
        channel: "MULTIPLE",
        automationLevel: "SEMI_AUTOMATED",
        executionTime: "72h before",
        costPerExecution: 5.0,
        averageEffectiveness: 0.55,
        targetRiskLevel: ["HIGH", "CRITICAL"],
        prerequisites: ["enrolled_loyalty_program"],
        contraindications: ["recent_incentive_used"],
      },
      {
        id: "educational_content",
        name: "Health Education Content",
        category: "EDUCATION",
        channel: "EMAIL",
        automationLevel: "FULLY_AUTOMATED",
        executionTime: "1week before",
        costPerExecution: 0.25,
        averageEffectiveness: 0.28,
        targetRiskLevel: ["LOW", "MEDIUM", "HIGH"],
        prerequisites: ["valid_email"],
        contraindications: [],
      },
    ];
    types.forEach((type) => this.interventionTypes.set(type.id, type));
  };
  /**
   * Generate smart intervention recommendations for a patient
   */
  InterventionEngine.prototype.generateSmartRecommendations = function (
    prediction,
    riskProfile,
    appointmentData,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var recommendations,
        appointmentDate,
        now,
        timeToAppointment,
        patientConstraints,
        historicalEffectiveness,
        _i,
        _a,
        _b,
        typeId,
        interventionType,
        suitability,
        recommendation,
        error_1;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 7, , 8]);
            recommendations = [];
            appointmentDate = new Date(appointmentData.scheduled_date);
            now = new Date();
            timeToAppointment = appointmentDate.getTime() - now.getTime();
            return [4 /*yield*/, this.getPatientConstraints(prediction.patientId)];
          case 1:
            patientConstraints = _c.sent();
            return [4 /*yield*/, this.getHistoricalEffectiveness(prediction.patientId)];
          case 2:
            historicalEffectiveness = _c.sent();
            (_i = 0), (_a = this.interventionTypes);
            _c.label = 3;
          case 3:
            if (!(_i < _a.length)) return [3 /*break*/, 6];
            (_b = _a[_i]), (typeId = _b[0]), (interventionType = _b[1]);
            suitability = this.assessInterventionSuitability(
              interventionType,
              prediction,
              riskProfile,
              appointmentData,
              patientConstraints,
              timeToAppointment,
            );
            if (!suitability.suitable) return [3 /*break*/, 5];
            return [
              4 /*yield*/,
              this.createSmartRecommendation(
                interventionType,
                prediction,
                riskProfile,
                appointmentData,
                suitability,
                historicalEffectiveness[typeId] || interventionType.averageEffectiveness,
              ),
            ];
          case 4:
            recommendation = _c.sent();
            recommendations.push(recommendation);
            _c.label = 5;
          case 5:
            _i++;
            return [3 /*break*/, 3];
          case 6:
            // Sort by expected ROI and priority
            recommendations.sort((a, b) => {
              if (a.priority !== b.priority) {
                return b.priority - a.priority;
              }
              return b.expectedROI - a.expectedROI;
            });
            return [2 /*return*/, recommendations.slice(0, 5)]; // Return top 5 recommendations
          case 7:
            error_1 = _c.sent();
            console.error("Error generating smart recommendations:", error_1);
            throw new Error("Failed to generate intervention recommendations");
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Execute automated interventions for multiple patients
   */
  InterventionEngine.prototype.executeBatchInterventions = function (predictions, campaignId) {
    return __awaiter(this, void 0, void 0, function () {
      var executions, batchSize, _loop_1, i;
      var _this = this;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            executions = [];
            batchSize = 20;
            _loop_1 = function (i) {
              var batch, batchPromises, batchResults;
              return __generator(this, (_b) => {
                switch (_b.label) {
                  case 0:
                    batch = predictions.slice(i, i + batchSize);
                    batchPromises = batch.map((prediction) =>
                      _this.executePatientInterventions(prediction, campaignId),
                    );
                    return [4 /*yield*/, Promise.allSettled(batchPromises)];
                  case 1:
                    batchResults = _b.sent();
                    batchResults.forEach((result, index) => {
                      if (result.status === "fulfilled") {
                        executions.push.apply(executions, result.value);
                      } else {
                        console.error(
                          "Failed to execute interventions for prediction ".concat(
                            batch[index].appointmentId,
                            ":",
                          ),
                          result.reason,
                        );
                      }
                    });
                    return [2 /*return*/];
                }
              });
            };
            i = 0;
            _a.label = 1;
          case 1:
            if (!(i < predictions.length)) return [3 /*break*/, 4];
            return [5 /*yield**/, _loop_1(i)];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            i += batchSize;
            return [3 /*break*/, 1];
          case 4:
            return [2 /*return*/, executions];
        }
      });
    });
  };
  /**
   * Execute interventions for a single patient
   */
  InterventionEngine.prototype.executePatientInterventions = function (prediction, campaignId) {
    return __awaiter(this, void 0, void 0, function () {
      var executions,
        riskProfile,
        appointmentData,
        recommendations,
        _i,
        _a,
        recommendation,
        execution,
        error_2;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            executions = [];
            return [4 /*yield*/, this.getPatientRiskProfile(prediction.patientId)];
          case 1:
            riskProfile = _b.sent();
            return [4 /*yield*/, this.getAppointmentData(prediction.appointmentId)];
          case 2:
            appointmentData = _b.sent();
            return [
              4 /*yield*/,
              this.generateSmartRecommendations(prediction, riskProfile, appointmentData),
            ];
          case 3:
            recommendations = _b.sent();
            (_i = 0), (_a = recommendations.slice(0, 3));
            _b.label = 4;
          case 4:
            if (!(_i < _a.length)) return [3 /*break*/, 9];
            recommendation = _a[_i];
            _b.label = 5;
          case 5:
            _b.trys.push([5, 7, , 8]);
            return [
              4 /*yield*/,
              this.scheduleIntervention(recommendation, prediction, appointmentData, campaignId),
            ];
          case 6:
            execution = _b.sent();
            executions.push(execution);
            return [3 /*break*/, 8];
          case 7:
            error_2 = _b.sent();
            console.error(
              "Failed to schedule intervention ".concat(recommendation.interventionTypeId, ":"),
              error_2,
            );
            return [3 /*break*/, 8];
          case 8:
            _i++;
            return [3 /*break*/, 4];
          case 9:
            return [2 /*return*/, executions];
        }
      });
    });
  };
  /**
   * Schedule a specific intervention
   */
  InterventionEngine.prototype.scheduleIntervention = function (
    recommendation,
    prediction,
    appointmentData,
    campaignId,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var interventionType, execution;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            interventionType = this.interventionTypes.get(recommendation.interventionTypeId);
            if (!interventionType) {
              throw new Error(
                "Intervention type ".concat(recommendation.interventionTypeId, " not found"),
              );
            }
            execution = {
              id: this.generateExecutionId(),
              patientId: prediction.patientId,
              appointmentId: prediction.appointmentId,
              campaignId: campaignId,
              interventionTypeId: recommendation.interventionTypeId,
              scheduledAt: recommendation.executionTime,
              status: InterventionStatus.SCHEDULED,
              channel: interventionType.channel,
              message: recommendation.personalizedMessage,
              cost: recommendation.expectedCost,
              metadata: {
                riskScore: prediction.riskScore,
                confidence: prediction.confidence,
                expectedEffectiveness: recommendation.expectedEffectiveness,
                reasoning: recommendation.reasoning,
              },
            };
            // Save to database
            return [4 /*yield*/, this.saveInterventionExecution(execution)];
          case 1:
            // Save to database
            _a.sent();
            if (!(interventionType.automationLevel === "FULLY_AUTOMATED")) return [3 /*break*/, 3];
            return [4 /*yield*/, this.scheduleAutomatedExecution(execution)];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            return [2 /*return*/, execution];
        }
      });
    });
  };
  /**
   * Create intervention campaign
   */
  InterventionEngine.prototype.createCampaign = function (campaignConfig) {
    return __awaiter(this, void 0, void 0, function () {
      var campaign;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            campaign = __assign({ id: this.generateCampaignId() }, campaignConfig);
            this.activeCampaigns.set(campaign.id, campaign);
            return [4 /*yield*/, this.saveCampaign(campaign)];
          case 1:
            _a.sent();
            return [2 /*return*/, campaign];
        }
      });
    });
  };
  /**
   * Execute campaign for eligible patients
   */
  InterventionEngine.prototype.executeCampaign = function (campaignId) {
    return __awaiter(this, void 0, void 0, function () {
      var campaign, eligiblePredictions, executions, results;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            campaign = this.activeCampaigns.get(campaignId);
            if (!campaign) {
              throw new Error("Campaign ".concat(campaignId, " not found"));
            }
            return [4 /*yield*/, this.findEligiblePatients(campaign.targetCriteria)];
          case 1:
            eligiblePredictions = _a.sent();
            return [4 /*yield*/, this.executeBatchInterventions(eligiblePredictions, campaignId)];
          case 2:
            executions = _a.sent();
            return [4 /*yield*/, this.calculateCampaignResults(campaignId, executions)];
          case 3:
            results = _a.sent();
            // Update campaign with results
            campaign.results = results;
            return [4 /*yield*/, this.updateCampaign(campaign)];
          case 4:
            _a.sent();
            return [2 /*return*/, results];
        }
      });
    });
  };
  /**
   * Monitor intervention effectiveness in real-time
   */
  InterventionEngine.prototype.monitorInterventionEffectiveness = function () {
    return __awaiter(this, void 0, void 0, function () {
      var endDate, startDate, executions;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            endDate = new Date();
            startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
            return [4 /*yield*/, this.getExecutionHistory(startDate, endDate)];
          case 1:
            executions = _a.sent();
            return [
              2 /*return*/,
              this.calculateInterventionAnalytics(executions, startDate, endDate),
            ];
        }
      });
    });
  };
  /**
   * Update intervention outcome after appointment
   */
  InterventionEngine.prototype.updateInterventionOutcome = function (
    executionId,
    appointmentOutcome,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var execution, effectivenessScore;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.getExecution(executionId)];
          case 1:
            execution = _a.sent();
            if (!execution) return [2 /*return*/];
            effectivenessScore = this.calculateEffectivenessScore(execution, appointmentOutcome);
            execution.outcome = {
              appointmentKept: appointmentOutcome === "ATTENDED",
              rescheduled: appointmentOutcome === "RESCHEDULED",
              cancelled: appointmentOutcome === "CANCELLED",
              noShow: appointmentOutcome === "NO_SHOW",
              effectivenessScore: effectivenessScore,
            };
            return [4 /*yield*/, this.updateExecution(execution)];
          case 2:
            _a.sent();
            // Update intervention type effectiveness
            return [
              4 /*yield*/,
              this.updateInterventionTypeEffectiveness(
                execution.interventionTypeId,
                effectivenessScore,
              ),
            ];
          case 3:
            // Update intervention type effectiveness
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Optimize intervention strategies based on historical data
   */
  InterventionEngine.prototype.optimizeInterventionStrategies = function () {
    return __awaiter(this, void 0, void 0, function () {
      var analytics, recommendations, estimatedImpact, bestChannel, timingAnalysis, riskAnalysis;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.monitorInterventionEffectiveness()];
          case 1:
            analytics = _a.sent();
            recommendations = [];
            estimatedImpact = 0;
            bestChannel = Object.entries(analytics.channelEffectiveness).sort((_a, _b) => {
              var a = _a[1];
              var b = _b[1];
              return b - a;
            })[0];
            if (bestChannel && bestChannel[1] > 0.5) {
              recommendations.push(
                "Increase usage of "
                  .concat(bestChannel[0], " channel (")
                  .concat((bestChannel[1] * 100).toFixed(1), "% effective)"),
              );
              estimatedImpact += 0.15;
            }
            return [4 /*yield*/, this.analyzeOptimalTiming()];
          case 2:
            timingAnalysis = _a.sent();
            if (timingAnalysis.confidence > 0.7) {
              recommendations.push(
                "Adjust intervention timing to ".concat(timingAnalysis.optimalTiming),
              );
              estimatedImpact += 0.1;
            }
            riskAnalysis = Object.entries(analytics.riskLevelEffectiveness).sort((_a, _b) => {
              var a = _a[1];
              var b = _b[1];
              return b - a;
            });
            if (riskAnalysis.length > 0) {
              recommendations.push(
                "Focus interventions on ".concat(riskAnalysis[0][0], " risk patients for best ROI"),
              );
              estimatedImpact += 0.08;
            }
            return [
              2 /*return*/,
              {
                recommendations: recommendations,
                estimatedImpact: estimatedImpact,
                confidenceLevel: Math.min(analytics.totalInterventions / 1000, 1), // Confidence based on data volume
              },
            ];
        }
      });
    });
  };
  // Helper methods
  InterventionEngine.prototype.assessInterventionSuitability = function (
    interventionType,
    prediction,
    riskProfile,
    appointmentData,
    patientConstraints,
    timeToAppointment,
  ) {
    var reasons = [];
    var score = 0;
    // Check risk level compatibility
    if (interventionType.targetRiskLevel.includes(prediction.riskLevel)) {
      score += 25;
      reasons.push("Risk level match");
    }
    // Check timing feasibility
    var requiredTime = this.parseExecutionTime(interventionType.executionTime);
    if (timeToAppointment >= requiredTime) {
      score += 20;
      reasons.push("Sufficient time for execution");
    } else {
      score -= 30;
      reasons.push("Insufficient time for execution");
    }
    // Check prerequisites
    var prerequisitesMet = interventionType.prerequisites.every((req) =>
      this.checkPrerequisite(req, patientConstraints),
    );
    if (prerequisitesMet) {
      score += 20;
    } else {
      score -= 50;
      reasons.push("Prerequisites not met");
    }
    // Check contraindications
    var hasContraindications = interventionType.contraindications.some((contra) =>
      this.checkContraindication(contra, patientConstraints),
    );
    if (hasContraindications) {
      score -= 100;
      reasons.push("Contraindications present");
    }
    // Cost-effectiveness consideration
    var costEffectiveness =
      interventionType.averageEffectiveness / interventionType.costPerExecution;
    score += Math.min(costEffectiveness * 10, 20);
    return {
      suitable: score > 30,
      score: score,
      reasons: reasons,
    };
  };
  InterventionEngine.prototype.createSmartRecommendation = function (
    interventionType,
    prediction,
    riskProfile,
    appointmentData,
    suitability,
    historicalEffectiveness,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var appointmentDate,
        executionTime,
        personalizedMessage,
        expectedEffectiveness,
        appointmentValue,
        expectedSavings,
        expectedROI;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            appointmentDate = new Date(appointmentData.scheduled_date);
            executionTime = this.calculateExecutionTime(
              appointmentDate,
              interventionType.executionTime,
            );
            return [
              4 /*yield*/,
              this.generatePersonalizedMessage(interventionType, prediction, appointmentData),
            ];
          case 1:
            personalizedMessage = _b.sent();
            expectedEffectiveness =
              (interventionType.averageEffectiveness + historicalEffectiveness) / 2;
            return [4 /*yield*/, this.getAppointmentValue(appointmentData)];
          case 2:
            appointmentValue = _b.sent();
            expectedSavings = expectedEffectiveness * appointmentValue;
            expectedROI =
              (expectedSavings - interventionType.costPerExecution) /
              interventionType.costPerExecution;
            _a = {
              interventionTypeId: interventionType.id,
              priority: this.calculatePriority(
                prediction.riskScore,
                suitability.score,
                expectedROI,
              ),
              executionTime: executionTime,
              personalizedMessage: personalizedMessage,
              expectedCost: interventionType.costPerExecution,
              expectedEffectiveness: expectedEffectiveness,
              expectedROI: expectedROI,
              reasoning: [
                "Risk level: "
                  .concat(prediction.riskLevel, " (")
                  .concat(prediction.riskScore, "%)"),
                "Expected effectiveness: ".concat((expectedEffectiveness * 100).toFixed(1), "%"),
                "Expected ROI: ".concat((expectedROI * 100).toFixed(1), "%"),
              ],
            };
            return [4 /*yield*/, this.findAlternativeInterventions(interventionType)];
          case 3:
            return [
              2 /*return*/,
              ((_a.alternatives = _b.sent()),
              (_a.contraindications = interventionType.contraindications),
              _a),
            ];
        }
      });
    });
  };
  InterventionEngine.prototype.parseExecutionTime = (executionTime) => {
    // Convert execution time string to milliseconds
    var timeMap = {
      "2h before": 2 * 60 * 60 * 1000,
      "24h before": 24 * 60 * 60 * 1000,
      "48h before": 48 * 60 * 60 * 1000,
      "72h before": 72 * 60 * 60 * 1000,
      "1week before": 7 * 24 * 60 * 60 * 1000,
    };
    return timeMap[executionTime] || 24 * 60 * 60 * 1000;
  };
  InterventionEngine.prototype.calculateExecutionTime = function (appointmentDate, executionTime) {
    var timeOffset = this.parseExecutionTime(executionTime);
    return new Date(appointmentDate.getTime() - timeOffset);
  };
  InterventionEngine.prototype.calculatePriority = (riskScore, suitabilityScore, expectedROI) =>
    Math.round(((riskScore * 0.4 + suitabilityScore * 0.3 + expectedROI * 30) / 100) * 10);
  InterventionEngine.prototype.generatePersonalizedMessage = function (
    interventionType,
    prediction,
    appointmentData,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var patientName, appointmentDate, appointmentTime, templates;
      return __generator(this, (_a) => {
        patientName = appointmentData.patient_name || "Patient";
        appointmentDate = new Date(appointmentData.scheduled_date).toLocaleDateString();
        appointmentTime = new Date(appointmentData.scheduled_date).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        templates = {
          sms_reminder_24h: "Hi "
            .concat(patientName, "! Reminder: You have an appointment tomorrow (")
            .concat(appointmentDate, ") at ")
            .concat(
              appointmentTime,
              ". Reply CONFIRM to confirm or RESCHEDULE if you need to change it. Thank you!",
            ),
          email_confirmation_48h: "Dear "
            .concat(patientName, ", please confirm your upcoming appointment on ")
            .concat(appointmentDate, " at ")
            .concat(appointmentTime, ". Click here to confirm or reschedule if needed."),
          phone_call_high_risk: "Personal call script: Confirm appointment for "
            .concat(patientName, " on ")
            .concat(appointmentDate, " at ")
            .concat(appointmentTime, ". Address any concerns and offer flexible rescheduling."),
          loyalty_incentive: "Hi "
            .concat(patientName, "! Your appointment on ")
            .concat(
              appointmentDate,
              " is confirmed. Attend and earn 100 loyalty points! Questions? Reply or call us.",
            ),
          educational_content: "Dear "
            .concat(patientName, ", preparing for your ")
            .concat(
              appointmentData.type,
              " appointment? Here are some helpful tips and what to expect...",
            ),
        };
        return [
          2 /*return*/,
          templates[interventionType.id] ||
            "Reminder: Appointment on ".concat(appointmentDate, " at ").concat(appointmentTime),
        ];
      });
    });
  };
  InterventionEngine.prototype.calculateEffectivenessScore = function (execution, outcome) {
    var baseScore = outcome === "ATTENDED" ? 100 : 0;
    var responseBonus = execution.response ? 20 : 0;
    var timingBonus = this.calculateTimingBonus(execution);
    return Math.min(baseScore + responseBonus + timingBonus, 100);
  };
  InterventionEngine.prototype.calculateTimingBonus = (execution) => {
    if (!execution.executedAt) return 0;
    var timeDiff = Math.abs(execution.scheduledAt.getTime() - execution.executedAt.getTime());
    var hoursDiff = timeDiff / (1000 * 60 * 60);
    // Bonus for executing on time (within 1 hour of scheduled time)
    return hoursDiff <= 1 ? 10 : Math.max(10 - hoursDiff, 0);
  };
  InterventionEngine.prototype.calculateCampaignResults = function (campaignId, executions) {
    return __awaiter(this, void 0, void 0, function () {
      var totalCost, completedExecutions, attendedAppointments, noShowReduction;
      return __generator(this, (_a) => {
        totalCost = executions.reduce((sum, exec) => sum + exec.cost, 0);
        completedExecutions = executions.filter((exec) => exec.outcome);
        attendedAppointments = completedExecutions.filter((exec) => {
          var _a;
          return (_a = exec.outcome) === null || _a === void 0 ? void 0 : _a.appointmentKept;
        });
        noShowReduction =
          completedExecutions.length > 0
            ? (attendedAppointments.length / completedExecutions.length) * 100
            : 0;
        return [
          2 /*return*/,
          {
            totalParticipants: new Set(executions.map((exec) => exec.patientId)).size,
            interventionsExecuted: executions.length,
            costIncurred: totalCost,
            noShowReduction: noShowReduction,
            costPerPreventedNoShow:
              attendedAppointments.length > 0 ? totalCost / attendedAppointments.length : 0,
            patientSatisfactionScore: 85, // Placeholder
            completionRate:
              (executions.filter((exec) => exec.status === InterventionStatus.EXECUTED).length /
                executions.length) *
              100,
            responseRate:
              (executions.filter((exec) => exec.response).length / executions.length) * 100,
            effectivenessByRiskLevel: {},
            effectivenessByInterventionType: {},
          },
        ];
      });
    });
  };
  InterventionEngine.prototype.calculateInterventionAnalytics = (
    executions,
    startDate,
    endDate,
  ) => {
    var totalCost = executions.reduce((sum, exec) => sum + exec.cost, 0);
    var totalSavings = executions
      .filter((exec) => {
        var _a;
        return (_a = exec.outcome) === null || _a === void 0 ? void 0 : _a.appointmentKept;
      })
      .reduce((sum, exec) => sum + (exec.metadata.appointmentValue || 100), 0);
    return {
      period: { start: startDate, end: endDate },
      totalInterventions: executions.length,
      totalCost: totalCost,
      totalSavings: totalSavings,
      netROI: totalSavings > 0 ? ((totalSavings - totalCost) / totalCost) * 100 : 0,
      noShowReduction: 0, // Calculate based on historical comparison
      avgResponseTime: 120, // Placeholder
      campaignPerformance: {},
      channelEffectiveness: {},
      riskLevelEffectiveness: {},
      patientSatisfactionTrend: [85, 87, 88, 86, 89], // Placeholder
      predictedOptimizations: [],
    };
  };
  // Placeholder methods for database operations
  InterventionEngine.prototype.generateExecutionId = () =>
    "int_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
  InterventionEngine.prototype.generateCampaignId = () =>
    "camp_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
  InterventionEngine.prototype.getPatientConstraints = function (patientId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Fetch patient communication preferences, opt-outs, etc.
        return [
          2 /*return*/,
          {
            validPhoneNumber: true,
            validEmail: true,
            optedOutSms: false,
            optedOutEmail: false,
            doNotCallList: false,
            enrolledLoyaltyProgram: true,
            recentIncentiveUsed: false,
          },
        ];
      });
    });
  };
  InterventionEngine.prototype.getHistoricalEffectiveness = function (patientId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Get patient-specific intervention effectiveness
        return [2 /*return*/, {}];
      });
    });
  };
  InterventionEngine.prototype.getPatientRiskProfile = function (patientId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // This would integrate with the risk scoring engine
        throw new Error("Method not implemented");
      });
    });
  };
  InterventionEngine.prototype.getAppointmentData = function (appointmentId) {
    return __awaiter(this, void 0, void 0, function () {
      var data;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("appointments").select("*").eq("id", appointmentId).single(),
            ];
          case 1:
            data = _a.sent().data;
            return [2 /*return*/, data];
        }
      });
    });
  };
  InterventionEngine.prototype.getAppointmentValue = function (appointmentData) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Calculate the monetary value of the appointment
        return [2 /*return*/, appointmentData.estimated_value || 100];
      });
    });
  };
  InterventionEngine.prototype.checkPrerequisite = (prerequisite, constraints) => {
    var checks = {
      valid_phone_number: constraints.validPhoneNumber,
      valid_email: constraints.validEmail,
      enrolled_loyalty_program: constraints.enrolledLoyaltyProgram,
    };
    return checks[prerequisite] || false;
  };
  InterventionEngine.prototype.checkContraindication = (contraindication, constraints) => {
    var checks = {
      opted_out_sms: constraints.optedOutSms,
      opted_out_email: constraints.optedOutEmail,
      do_not_call_list: constraints.doNotCallList,
      recent_incentive_used: constraints.recentIncentiveUsed,
    };
    return checks[contraindication] || false;
  };
  InterventionEngine.prototype.findAlternativeInterventions = function (currentType) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [
          2 /*return*/,
          Array.from(this.interventionTypes.values())
            .filter((type) => type.category === currentType.category && type.id !== currentType.id)
            .map((type) => type.name),
        ];
      });
    });
  };
  InterventionEngine.prototype.analyzeOptimalTiming = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [
        2 /*return*/,
        { optimalTiming: "24h before", confidence: 0.8 },
      ]);
    });
  };
  InterventionEngine.prototype.findEligiblePatients = function (criteria) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Find patients matching campaign criteria
        return [2 /*return*/, []];
      });
    });
  };
  InterventionEngine.prototype.saveInterventionExecution = function (execution) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/]);
    });
  };
  InterventionEngine.prototype.scheduleAutomatedExecution = function (execution) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/]);
    });
  };
  InterventionEngine.prototype.saveCampaign = function (campaign) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/]);
    });
  };
  InterventionEngine.prototype.updateCampaign = function (campaign) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/]);
    });
  };
  InterventionEngine.prototype.getExecutionHistory = function (startDate, endDate) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Get execution history from database
        return [2 /*return*/, []];
      });
    });
  };
  InterventionEngine.prototype.getExecution = function (executionId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Get specific execution from database
        return [2 /*return*/, null];
      });
    });
  };
  InterventionEngine.prototype.updateExecution = function (execution) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/]);
    });
  };
  InterventionEngine.prototype.updateInterventionTypeEffectiveness = function (
    typeId,
    effectiveness,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/]);
    });
  };
  return InterventionEngine;
})();
exports.InterventionEngine = InterventionEngine;
// Export default instance
exports.interventionEngine = new InterventionEngine();
// Export utility functions
function formatCost(cost) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cost);
}
function formatEffectiveness(effectiveness) {
  return "".concat((effectiveness * 100).toFixed(1), "%");
}
function getInterventionStatusColor(status) {
  var _a;
  var colors =
    ((_a = {}),
    (_a[InterventionStatus.SCHEDULED] = "text-blue-600"),
    (_a[InterventionStatus.EXECUTED] = "text-green-600"),
    (_a[InterventionStatus.FAILED] = "text-red-600"),
    (_a[InterventionStatus.CANCELLED] = "text-gray-600"),
    (_a[InterventionStatus.PENDING_RESPONSE] = "text-yellow-600"),
    _a);
  return colors[status] || "text-gray-600";
}
function calculateROI(savings, cost) {
  return cost > 0 ? ((savings - cost) / cost) * 100 : 0;
}
