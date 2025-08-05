// Trial Management Engine - STORY-SUB-002 Task 3
// Core engine for AI-powered trial management and conversion optimization
// Created: 2025-01-22
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
          step(generator.throw(value));
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
      (g.throw = verb(1)),
      (g.return = verb(2)),
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
                  ? y.return
                  : op[0]
                    ? y.throw || ((t = y.return) && t.call(y), 0)
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
exports.TrialManagementEngine = void 0;
var server_1 = require("@/lib/supabase/server");
var analytics_1 = require("../analytics");
var TrialManagementEngine = /** @class */ (() => {
  function TrialManagementEngine() {
    this.supabase = (0, server_1.createClient)();
    this.analytics = analytics_1.Analytics;
  }
  // ========================================================================
  // TRIAL LIFECYCLE MANAGEMENT
  // ========================================================================
  TrialManagementEngine.prototype.createTrial = function (_userId_1) {
    return __awaiter(this, arguments, void 0, function (userId, signupSource) {
      var now, endDate, _a, trialData, error;
      if (signupSource === void 0) {
        signupSource = "website";
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            now = new Date();
            endDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days trial
            return [
              4 /*yield*/,
              this.supabase
                .from("trial_analytics")
                .insert({
                  user_id: userId,
                  trial_status: "signup",
                  start_date: now.toISOString(),
                  end_date: endDate.toISOString(),
                  signup_source: signupSource,
                  metadata: {
                    signupSource: signupSource,
                    initialFeatures: [],
                    onboardingProgress: 0,
                    totalSessions: 0,
                    averageSessionDuration: 0,
                    featuresUsed: [],
                    supportInteractions: 0,
                  },
                })
                .select()
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (trialData = _a.data), (error = _a.error);
            if (error) throw new Error("Failed to create trial: ".concat(error.message));
            // Initialize user journey tracking
            return [4 /*yield*/, this.initializeUserJourney(trialData.id, userId)];
          case 2:
            // Initialize user journey tracking
            _b.sent();
            return [2 /*return*/, this.mapDatabaseToTrial(trialData)];
        }
      });
    });
  };
  TrialManagementEngine.prototype.updateTrialStage = function (_trialId_1, _newStage_1) {
    return __awaiter(this, arguments, void 0, function (trialId, newStage, trigger) {
      var _a,
        currentTrial,
        fetchError,
        journey,
        conversionProbability,
        _b,
        updatedTrial,
        updateError;
      if (trigger === void 0) {
        trigger = "manual";
      }
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("trial_analytics").select("*").eq("id", trialId).single(),
            ];
          case 1:
            (_a = _c.sent()), (currentTrial = _a.data), (fetchError = _a.error);
            if (fetchError) throw new Error("Trial not found: ".concat(fetchError.message));
            return [4 /*yield*/, this.getUserJourney(trialId)];
          case 2:
            journey = _c.sent();
            return [
              4 /*yield*/,
              this.calculateConversionProbability(this.mapDatabaseToTrial(currentTrial), journey),
              // Update trial in database
            ];
          case 3:
            conversionProbability = _c.sent();
            return [
              4 /*yield*/,
              this.supabase
                .from("trial_analytics")
                .update({
                  trial_status: newStage,
                  conversion_probability: conversionProbability,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", trialId)
                .select()
                .single(),
            ];
          case 4:
            (_b = _c.sent()), (updatedTrial = _b.data), (updateError = _b.error);
            if (updateError)
              throw new Error("Failed to update trial: ".concat(updateError.message));
            // Log stage transition
            return [
              4 /*yield*/,
              this.logStageTransition(trialId, currentTrial.trial_status, newStage, trigger),
              // Trigger appropriate campaign if needed
            ];
          case 5:
            // Log stage transition
            _c.sent();
            // Trigger appropriate campaign if needed
            return [4 /*yield*/, this.triggerAutomatedCampaign(updatedTrial, newStage)];
          case 6:
            // Trigger appropriate campaign if needed
            _c.sent();
            return [2 /*return*/, this.mapDatabaseToTrial(updatedTrial)];
        }
      });
    });
  };
  TrialManagementEngine.prototype.getTrial = function (trialId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("trial_analytics").select("*").eq("id", trialId).single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) return [2 /*return*/, null];
            return [2 /*return*/, this.mapDatabaseToTrial(data)];
        }
      });
    });
  };
  TrialManagementEngine.prototype.getUserActiveTrial = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("trial_analytics")
                .select("*")
                .eq("user_id", userId)
                .in("trial_status", ["signup", "onboarding", "active", "at_risk", "converting"])
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error || !data) return [2 /*return*/, null];
            return [2 /*return*/, this.mapDatabaseToTrial(data)];
        }
      });
    });
  }; // ========================================================================
  // AI CONVERSION PREDICTION & OPTIMIZATION
  // ========================================================================
  TrialManagementEngine.prototype.predictConversion = function (trialId) {
    return __awaiter(this, void 0, void 0, function () {
      var trial, journey, factors, probability, confidence, recommendations, optimalStrategy;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.getTrial(trialId)];
          case 1:
            trial = _a.sent();
            if (!trial) throw new Error("Trial not found");
            return [4 /*yield*/, this.getUserJourney(trialId)];
          case 2:
            journey = _a.sent();
            return [
              4 /*yield*/,
              this.calculateConversionFactors(trial, journey),
              // AI-powered probability calculation based on multiple factors
            ];
          case 3:
            factors = _a.sent();
            return [4 /*yield*/, this.calculateConversionProbability(trial, journey)];
          case 4:
            probability = _a.sent();
            confidence = this.calculatePredictionConfidence(factors);
            return [4 /*yield*/, this.generateConversionRecommendations(trial, factors)];
          case 5:
            recommendations = _a.sent();
            optimalStrategy = this.determineOptimalStrategy(trial, factors);
            return [
              2 /*return*/,
              {
                trialId: trialId,
                userId: trial.userId,
                probability: probability,
                confidence: confidence,
                factors: factors,
                recommendations: recommendations,
                optimalStrategy: optimalStrategy,
                timeToConversion: this.estimateTimeToConversion(probability, trial.daysRemaining),
                predictedRevenue: probability * 99, // Assuming $99 subscription
                riskLevel: this.assessRiskLevel(probability, trial.daysRemaining),
              },
            ];
        }
      });
    });
  };
  TrialManagementEngine.prototype.calculateConversionProbability = function (trial, journey) {
    return __awaiter(this, void 0, void 0, function () {
      var factors,
        probability,
        engagementScore,
        timeUrgency,
        featureAdoption,
        supportInteraction,
        emailEngagement,
        collaborativeBoost;
      var _a, _b, _c, _d;
      return __generator(this, function (_e) {
        switch (_e.label) {
          case 0:
            return [4 /*yield*/, this.calculateConversionFactors(trial, journey)];
          case 1:
            factors = _e.sent();
            probability = 0.1; // base probability
            engagementScore =
              ((_a = factors.find((f) => f.name === "engagement")) === null || _a === void 0
                ? void 0
                : _a.value) || 0;
            probability += (engagementScore / 100) * 0.4;
            timeUrgency = Math.max(0, 1 - trial.daysRemaining / 14);
            probability += timeUrgency * 0.2;
            featureAdoption =
              ((_b = factors.find((f) => f.name === "feature_adoption")) === null || _b === void 0
                ? void 0
                : _b.value) || 0;
            probability += (featureAdoption / 100) * 0.25;
            supportInteraction =
              ((_c = factors.find((f) => f.name === "support_interaction")) === null ||
              _c === void 0
                ? void 0
                : _c.value) || 0;
            probability += (supportInteraction / 100) * 0.1;
            emailEngagement =
              ((_d = factors.find((f) => f.name === "email_engagement")) === null || _d === void 0
                ? void 0
                : _d.value) || 0;
            probability += (emailEngagement / 100) * 0.05;
            return [4 /*yield*/, this.getCollaborativeFilteringBoost(trial.userId)];
          case 2:
            collaborativeBoost = _e.sent();
            probability = Math.min(probability * (1 + collaborativeBoost), 0.95);
            return [2 /*return*/, Math.max(0.01, Math.min(probability, 0.95))];
        }
      });
    });
  };
  TrialManagementEngine.prototype.calculateConversionFactors = function (trial, journey) {
    return __awaiter(this, void 0, void 0, function () {
      var factors,
        engagementEvents,
        engagementScore,
        uniqueFeatures,
        featureAdoptionScore,
        timeUrgency,
        supportEvents,
        supportScore,
        emailEvents,
        emailScore;
      return __generator(this, (_a) => {
        factors = [];
        engagementEvents = journey.events.filter((e) => e.type === "feature_usage");
        engagementScore = Math.min(engagementEvents.length * 10, 100);
        factors.push({
          name: "engagement",
          weight: 0.4,
          value: engagementScore,
          impact: engagementScore > 60 ? "positive" : engagementScore > 30 ? "neutral" : "negative",
          description: "User has ".concat(engagementEvents.length, " feature usage events"),
        });
        uniqueFeatures = new Set(
          journey.events.filter((e) => e.type === "feature_usage").map((e) => e.data.featureId),
        ).size;
        featureAdoptionScore = Math.min(uniqueFeatures * 20, 100);
        factors.push({
          name: "feature_adoption",
          weight: 0.25,
          value: featureAdoptionScore,
          impact: uniqueFeatures >= 3 ? "positive" : uniqueFeatures >= 2 ? "neutral" : "negative",
          description: "User has adopted ".concat(uniqueFeatures, " unique features"),
        });
        timeUrgency = ((14 - trial.daysRemaining) / 14) * 100;
        factors.push({
          name: "time_urgency",
          weight: 0.2,
          value: timeUrgency,
          impact:
            trial.daysRemaining <= 3
              ? "positive"
              : trial.daysRemaining <= 7
                ? "neutral"
                : "negative",
          description: "".concat(trial.daysRemaining, " days remaining in trial"),
        });
        supportEvents = journey.events.filter((e) => e.type === "support_contact");
        supportScore = Math.min(supportEvents.length * 25, 100);
        factors.push({
          name: "support_interaction",
          weight: 0.1,
          value: supportScore,
          impact: supportEvents.length > 0 ? "positive" : "neutral",
          description: "".concat(supportEvents.length, " support interactions"),
        });
        emailEvents = journey.events.filter((e) => e.type === "email_interaction");
        emailScore = Math.min(emailEvents.length * 15, 100);
        factors.push({
          name: "email_engagement",
          weight: 0.05,
          value: emailScore,
          impact:
            emailEvents.length >= 2 ? "positive" : emailEvents.length >= 1 ? "neutral" : "negative",
          description: "".concat(emailEvents.length, " email interactions"),
        });
        return [2 /*return*/, factors];
      });
    });
  };
  TrialManagementEngine.prototype.generateConversionRecommendations = function (trial, factors) {
    return __awaiter(this, void 0, void 0, function () {
      var recommendations, engagementFactor, featureFactor, timeFactor;
      return __generator(this, (_a) => {
        recommendations = [];
        engagementFactor = factors.find((f) => f.name === "engagement");
        featureFactor = factors.find((f) => f.name === "feature_adoption");
        timeFactor = factors.find((f) => f.name === "time_urgency");
        // Low engagement recommendations
        if (engagementFactor && engagementFactor.value < 40) {
          recommendations.push({
            action: "Send personalized onboarding email sequence",
            priority: "high",
            expectedImpact: 25,
            effort: "low",
            timeline: "Immediate",
            reasoning: "Low engagement score indicates user needs guidance",
          });
          recommendations.push({
            action: "Schedule a personal demo call",
            priority: "medium",
            expectedImpact: 35,
            effort: "high",
            timeline: "1-2 days",
            reasoning: "Personal touch can significantly boost engagement",
          });
        }
        // Feature adoption recommendations
        if (featureFactor && featureFactor.value < 60) {
          recommendations.push({
            action: "Highlight unused premium features",
            priority: "high",
            expectedImpact: 20,
            effort: "low",
            timeline: "Immediate",
            reasoning: "User has not explored key value-driving features",
          });
          recommendations.push({
            action: "Create personalized feature tour",
            priority: "medium",
            expectedImpact: 30,
            effort: "medium",
            timeline: "1 day",
            reasoning: "Guided experience increases feature adoption",
          });
        }
        // Time urgency recommendations
        if (timeFactor && trial.daysRemaining <= 3) {
          recommendations.push({
            action: "Offer limited-time discount (20% off)",
            priority: "high",
            expectedImpact: 40,
            effort: "low",
            timeline: "Immediate",
            reasoning: "Time pressure combined with incentive drives conversions",
          });
          recommendations.push({
            action: "Send urgency reminder with success stories",
            priority: "high",
            expectedImpact: 25,
            effort: "low",
            timeline: "Immediate",
            reasoning: "Social proof with urgency is highly effective",
          });
        }
        // High-value user recommendations
        if (trial.conversionProbability > 0.7) {
          recommendations.push({
            action: "Direct sales call to close the deal",
            priority: "high",
            expectedImpact: 50,
            effort: "high",
            timeline: "1 day",
            reasoning: "High conversion probability warrants direct sales intervention",
          });
        }
        return [
          2 /*return*/,
          recommendations.sort((a, b) => {
            var priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          }),
        ];
      });
    });
  };
  TrialManagementEngine.prototype.determineOptimalStrategy = (trial, factors) => {
    var _a, _b;
    var engagementValue =
      ((_a = factors.find((f) => f.name === "engagement")) === null || _a === void 0
        ? void 0
        : _a.value) || 0;
    var featureValue =
      ((_b = factors.find((f) => f.name === "feature_adoption")) === null || _b === void 0
        ? void 0
        : _b.value) || 0;
    var timeUrgency = trial.daysRemaining <= 3;
    if (timeUrgency && trial.conversionProbability > 0.5) {
      return "urgency_reminder";
    } else if (engagementValue < 30) {
      return "engagement_boost";
    } else if (featureValue < 40) {
      return "feature_highlight";
    } else if (trial.conversionProbability > 0.7) {
      return "demo_scheduling";
    } else {
      return "discount_offer";
    }
  };
  TrialManagementEngine.prototype.calculatePredictionConfidence = function (factors) {
    // Confidence based on data availability and factor consistency
    var totalDataPoints = factors.reduce((sum, f) => sum + f.value, 0);
    var consistencyScore = this.calculateFactorConsistency(factors);
    var confidence = 0.6; // base confidence
    confidence += (totalDataPoints / 500) * 0.3; // more data = higher confidence
    confidence += consistencyScore * 0.1; // consistent factors = higher confidence
    return Math.min(confidence, 0.95);
  };
  TrialManagementEngine.prototype.calculateFactorConsistency = (factors) => {
    var positiveFactors = factors.filter((f) => f.impact === "positive").length;
    var negativeFactors = factors.filter((f) => f.impact === "negative").length;
    var _neutralFactors = factors.filter((f) => f.impact === "neutral").length;
    // Higher consistency when factors point in same direction
    if (positiveFactors >= negativeFactors * 2) return 1.0;
    if (negativeFactors >= positiveFactors * 2) return 0.8;
    return 0.6; // mixed signals = lower consistency
  };
  TrialManagementEngine.prototype.estimateTimeToConversion = (probability, daysRemaining) => {
    if (probability > 0.8) return Math.min(2, daysRemaining);
    if (probability > 0.6) return Math.min(5, daysRemaining);
    if (probability > 0.4) return Math.min(8, daysRemaining);
    return daysRemaining;
  };
  TrialManagementEngine.prototype.assessRiskLevel = (probability, daysRemaining) => {
    if (probability > 0.7) return "low";
    if (probability > 0.4 && daysRemaining > 3) return "medium";
    return "high";
  };
  TrialManagementEngine.prototype.getCollaborativeFilteringBoost = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var similarUsers, avgConversionRate;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.rpc("get_similar_trial_users", { target_user_id: userId }),
            ];
          case 1:
            similarUsers = _a.sent().data;
            if (!similarUsers || similarUsers.length === 0) return [2 /*return*/, 0];
            avgConversionRate =
              similarUsers.reduce((sum, user) => sum + (user.converted ? 1 : 0), 0) /
              similarUsers.length;
            return [2 /*return*/, Math.min(avgConversionRate * 0.2, 0.1)]; // max 10% boost
        }
      });
    });
  }; // ========================================================================
  // USER JOURNEY TRACKING
  // ========================================================================
  TrialManagementEngine.prototype.trackEvent = function (_trialId_1, _eventType_1, _data_1) {
    return __awaiter(this, arguments, void 0, function (trialId, eventType, data, source) {
      var event;
      if (source === void 0) {
        source = "webapp";
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            event = {
              type: eventType,
              timestamp: new Date(),
              data: data,
              score: this.calculateEventScore(eventType, data),
              source: source,
            };
            // Store event in database
            return [
              4 /*yield*/,
              this.supabase
                .from("customer_lifecycle_events")
                .insert({
                  trial_id: trialId,
                  event_type: eventType,
                  event_data: data,
                  score: event.score,
                  source: source,
                  created_at: event.timestamp.toISOString(),
                }),
              // Update trial engagement score
            ];
          case 1:
            // Store event in database
            _a.sent();
            // Update trial engagement score
            return [
              4 /*yield*/,
              this.updateTrialEngagement(trialId),
              // Check for stage transitions
            ];
          case 2:
            // Update trial engagement score
            _a.sent();
            // Check for stage transitions
            return [4 /*yield*/, this.checkStageTransitions(trialId)];
          case 3:
            // Check for stage transitions
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  TrialManagementEngine.prototype.calculateEventScore = (eventType, data) => {
    var scoreMap = {
      feature_usage: 10,
      page_view: 1,
      email_interaction: 5,
      support_contact: 15,
      upgrade_attempt: 25,
    };
    var baseScore = scoreMap[eventType] || 1;
    // Boost score for key features
    if (eventType === "feature_usage" && data.featureId) {
      var keyFeatures = ["dashboard", "reports", "integrations", "automation"];
      if (keyFeatures.includes(data.featureId)) baseScore *= 1.5;
    }
    // Boost score for long session duration
    if (data.sessionDuration && data.sessionDuration > 300) {
      // 5 minutes
      baseScore *= 1.2;
    }
    return Math.min(baseScore, 50); // cap at 50 points per event
  };
  TrialManagementEngine.prototype.updateTrialEngagement = function (trialId) {
    return __awaiter(this, void 0, void 0, function () {
      var events, now, totalScore, weightSum, engagementScore;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("customer_lifecycle_events")
                .select("score, created_at")
                .eq("trial_id", trialId)
                .order("created_at", { ascending: false })
                .limit(50),
            ]; // last 50 events
          case 1:
            events = _a.sent().data; // last 50 events
            if (!events || events.length === 0) return [2 /*return*/];
            now = Date.now();
            totalScore = 0;
            weightSum = 0;
            events.forEach((event) => {
              var ageHours = (now - new Date(event.created_at).getTime()) / (1000 * 60 * 60);
              var weight = Math.exp(-ageHours / 24); // exponential decay over 24 hours
              totalScore += event.score * weight;
              weightSum += weight;
            });
            engagementScore = Math.min(weightSum > 0 ? totalScore / weightSum : 0, 100);
            // Update trial with new engagement score
            return [
              4 /*yield*/,
              this.supabase
                .from("trial_analytics")
                .update({
                  engagement_score: engagementScore,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", trialId),
            ];
          case 2:
            // Update trial with new engagement score
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  TrialManagementEngine.prototype.checkStageTransitions = function (trialId) {
    return __awaiter(this, void 0, void 0, function () {
      var trial, journey, newStage;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.getTrial(trialId)];
          case 1:
            trial = _a.sent();
            if (!trial) return [2 /*return*/];
            return [4 /*yield*/, this.getUserJourney(trialId)];
          case 2:
            journey = _a.sent();
            newStage = this.determineTrialStage(trial, journey);
            if (!(newStage !== trial.status)) return [3 /*break*/, 4];
            return [4 /*yield*/, this.updateTrialStage(trialId, newStage, "automated")];
          case 3:
            _a.sent();
            _a.label = 4;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  TrialManagementEngine.prototype.determineTrialStage = (trial, journey) => {
    var eventCount = journey.events.length;
    var featureUsageEvents = journey.events.filter((e) => e.type === "feature_usage").length;
    var uniqueFeatures = new Set(
      journey.events.filter((e) => e.type === "feature_usage").map((e) => e.data.featureId),
    ).size;
    // Stage determination logic
    if (trial.status === "signup" && eventCount >= 3) {
      return "onboarding";
    }
    if (trial.status === "onboarding" && (featureUsageEvents >= 5 || uniqueFeatures >= 2)) {
      return "active";
    }
    if (trial.status === "active") {
      if (trial.conversionProbability >= 0.7) {
        return "converting";
      } else if (trial.daysRemaining <= 3 && trial.conversionProbability < 0.3) {
        return "at_risk";
      }
    }
    if (trial.daysRemaining <= 0 && trial.status !== "converted") {
      return "expired";
    }
    return trial.status;
  };
  TrialManagementEngine.prototype.getUserJourney = function (trialId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, events, error, trial, mappedEvents, milestones, progressScore;
      var _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("customer_lifecycle_events")
                .select("*")
                .eq("trial_id", trialId)
                .order("created_at", { ascending: true }),
            ];
          case 1:
            (_a = _c.sent()), (events = _a.data), (error = _a.error);
            if (error) throw new Error("Failed to get journey: ".concat(error.message));
            return [4 /*yield*/, this.getTrial(trialId)];
          case 2:
            trial = _c.sent();
            if (!trial) throw new Error("Trial not found");
            mappedEvents =
              (events === null || events === void 0
                ? void 0
                : events.map((event) => ({
                    id: event.id,
                    type: event.event_type,
                    timestamp: new Date(event.created_at),
                    data: event.event_data || {},
                    score: event.score || 0,
                    source: event.source || "unknown",
                  }))) || [];
            milestones = this.generateJourneyMilestones(mappedEvents);
            progressScore = this.calculateProgressScore(mappedEvents, milestones);
            _b = {
              userId: trial.userId,
              trialId: trialId,
              events: mappedEvents,
              milestones: milestones,
              currentStage: trial.status,
              progressScore: progressScore,
            };
            return [4 /*yield*/, this.getStageHistory(trialId)];
          case 3:
            return [2 /*return*/, ((_b.stageHistory = _c.sent()), _b)];
        }
      });
    });
  }; // ========================================================================
  // UTILITY METHODS
  // ========================================================================
  TrialManagementEngine.prototype.initializeUserJourney = function (trialId, _userId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            // Create initial signup event
            return [
              4 /*yield*/,
              this.trackEvent(
                trialId,
                "page_view",
                {
                  page: "signup_complete",
                  source: "trial_creation",
                },
                "system",
              ),
            ];
          case 1:
            // Create initial signup event
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  TrialManagementEngine.prototype.logStageTransition = function (
    trialId,
    fromStage,
    toStage,
    trigger,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("trial_stage_transitions").insert({
                trial_id: trialId,
                from_stage: fromStage,
                to_stage: toStage,
                trigger: trigger,
                created_at: new Date().toISOString(),
              }),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  TrialManagementEngine.prototype.triggerAutomatedCampaign = function (trial, newStage) {
    return __awaiter(this, void 0, void 0, function () {
      var campaignTriggers, campaignType;
      return __generator(this, (_a) => {
        campaignTriggers = {
          onboarding: "welcome_sequence",
          active: "feature_highlight",
          at_risk: "urgency_reminder",
          converting: "sales_assist",
        };
        campaignType = campaignTriggers[newStage];
        if (campaignType) {
          // In production, this would trigger campaign management system
          console.log("Triggering ".concat(campaignType, " campaign for trial ").concat(trial.id));
        }
        return [2 /*return*/];
      });
    });
  };
  TrialManagementEngine.prototype.generateJourneyMilestones = (events) => {
    var _a, _b, _c, _d;
    var milestones = [
      {
        name: "First Login",
        description: "User logged in for the first time",
        completed: events.some((e) => e.type === "page_view" && e.data.page === "dashboard"),
        completedAt:
          (_a = events.find((e) => e.type === "page_view" && e.data.page === "dashboard")) ===
            null || _a === void 0
            ? void 0
            : _a.timestamp,
        importance: 0.8,
        category: "onboarding",
      },
      {
        name: "First Feature Used",
        description: "User used their first core feature",
        completed: events.some((e) => e.type === "feature_usage"),
        completedAt:
          (_b = events.find((e) => e.type === "feature_usage")) === null || _b === void 0
            ? void 0
            : _b.timestamp,
        importance: 0.9,
        category: "engagement",
      },
      {
        name: "Multiple Features Explored",
        description: "User explored 3+ different features",
        completed:
          new Set(events.filter((e) => e.type === "feature_usage").map((e) => e.data.featureId))
            .size >= 3,
        completedAt:
          events.filter((e) => e.type === "feature_usage").length >= 3
            ? (_c = events.filter((e) => e.type === "feature_usage")[2]) === null || _c === void 0
              ? void 0
              : _c.timestamp
            : undefined,
        importance: 0.95,
        category: "value_realization",
      },
      {
        name: "Support Interaction",
        description: "User contacted support for help",
        completed: events.some((e) => e.type === "support_contact"),
        completedAt:
          (_d = events.find((e) => e.type === "support_contact")) === null || _d === void 0
            ? void 0
            : _d.timestamp,
        importance: 0.7,
        category: "engagement",
      },
    ];
    return milestones;
  };
  TrialManagementEngine.prototype.calculateProgressScore = (_events, milestones) => {
    var completedMilestones = milestones.filter((m) => m.completed);
    var totalImportance = milestones.reduce((sum, m) => sum + m.importance, 0);
    var completedImportance = completedMilestones.reduce((sum, m) => sum + m.importance, 0);
    return totalImportance > 0 ? (completedImportance / totalImportance) * 100 : 0;
  };
  TrialManagementEngine.prototype.getStageHistory = function (trialId) {
    return __awaiter(this, void 0, void 0, function () {
      var transitions;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("trial_stage_transitions")
                .select("*")
                .eq("trial_id", trialId)
                .order("created_at", { ascending: true }),
            ];
          case 1:
            transitions = _a.sent().data;
            return [
              2 /*return*/,
              (transitions === null || transitions === void 0
                ? void 0
                : transitions.map((t) => ({
                    fromStage: t.from_stage,
                    toStage: t.to_stage,
                    timestamp: new Date(t.created_at),
                    trigger: t.trigger,
                    automated: t.trigger === "automated",
                    conversionProbabilityChange: 0, // Would be calculated from historical data
                  }))) || [],
            ];
        }
      });
    });
  };
  TrialManagementEngine.prototype.mapDatabaseToTrial = (data) => ({
    id: data.id,
    userId: data.user_id,
    status: data.trial_status,
    startDate: new Date(data.start_date),
    endDate: new Date(data.end_date),
    daysRemaining: Math.max(
      0,
      Math.ceil((new Date(data.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    ),
    conversionProbability: data.conversion_probability || 0.1,
    engagementScore: data.engagement_score || 0,
    userSegment: data.user_segment || "casual_user",
    currentStrategy: data.current_strategy || "engagement_boost",
    metadata: data.metadata || {},
  });
  return TrialManagementEngine;
})();
exports.TrialManagementEngine = TrialManagementEngine;
