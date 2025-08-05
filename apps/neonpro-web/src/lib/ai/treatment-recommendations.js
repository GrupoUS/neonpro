/**
 * AI-powered Treatment Recommendation Engine
 * Provides intelligent treatment suggestions based on patient profile and evidence-based medicine
 *
 * Features:
 * - Evidence-based treatment matching
 * - Success rate prediction for recommended treatments
 * - Treatment protocol optimization
 * - Alternative treatment ranking
 * - Combination therapy recommendations
 * - Integration with medical databases and guidelines
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
exports.AITreatmentRecommendationEngine = void 0;
/**
 * AI Treatment Recommendation Engine
 * Core system for intelligent treatment suggestions and optimization
 */
var AITreatmentRecommendationEngine = /** @class */ (() => {
  function AITreatmentRecommendationEngine() {
    this.treatmentDatabase = new Map();
    this.protocolDatabase = new Map();
    this.evidenceDatabase = new Map();
    this.successRateModels = new Map();
    this.initializeTreatmentDatabase();
    this.initializeProtocolDatabase();
    this.loadEvidenceDatabase();
    this.loadSuccessRateModels();
  }
  /**
   * Generate comprehensive treatment recommendations for a patient
   */
  AITreatmentRecommendationEngine.prototype.generateRecommendations = function (
    patient,
    riskAssessment,
    treatmentHistory,
    medicalHistory,
    treatmentGoals,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var patientProfile, candidateTreatments, scoredTreatments, recommendations, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            patientProfile = this.analyzePatientProfile(
              patient,
              riskAssessment,
              treatmentHistory,
              medicalHistory,
            );
            return [4 /*yield*/, this.identifyCandidateTreatments(treatmentGoals, patientProfile)];
          case 1:
            candidateTreatments = _a.sent();
            return [
              4 /*yield*/,
              this.scoreTreatments(candidateTreatments, patientProfile, riskAssessment),
            ];
          case 2:
            scoredTreatments = _a.sent();
            return [
              4 /*yield*/,
              this.generateDetailedRecommendations(
                scoredTreatments,
                patientProfile,
                riskAssessment,
              ),
            ];
          case 3:
            recommendations = _a.sent();
            // Sort by recommendation score
            return [
              2 /*return*/,
              recommendations.sort((a, b) => b.recommendation_score - a.recommendation_score),
            ];
          case 4:
            error_1 = _a.sent();
            console.error("Treatment recommendation generation failed:", error_1);
            throw new Error("Failed to generate treatment recommendations");
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get optimized treatment protocol for specific treatment
   */
  AITreatmentRecommendationEngine.prototype.getOptimizedProtocol = function (
    treatmentId,
    patient,
    riskAssessment,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var baseProtocol, customizations, suitabilityScore;
      return __generator(this, function (_a) {
        baseProtocol = this.protocolDatabase.get(treatmentId);
        if (!baseProtocol) {
          throw new Error("Protocol not found for treatment: ".concat(treatmentId));
        }
        customizations = this.generateProtocolCustomizations(baseProtocol, patient, riskAssessment);
        suitabilityScore = this.calculateProtocolSuitability(baseProtocol, patient, riskAssessment);
        return [
          2 /*return*/,
          __assign(__assign({}, baseProtocol), {
            patient_suitability_score: suitabilityScore,
            customizations: customizations,
          }),
        ];
      });
    });
  };
  /**
   * Recommend treatment combinations with synergy analysis
   */
  AITreatmentRecommendationEngine.prototype.recommendTreatmentCombinations = function (
    primaryTreatment,
    patient,
    riskAssessment,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var combinations,
        complementaryTreatments,
        _i,
        complementaryTreatments_1,
        complementary,
        combination;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            combinations = [];
            complementaryTreatments = this.getCompatibleTreatments(
              primaryTreatment,
              patient,
              riskAssessment,
            );
            (_i = 0), (complementaryTreatments_1 = complementaryTreatments);
            _a.label = 1;
          case 1:
            if (!(_i < complementaryTreatments_1.length)) return [3 /*break*/, 4];
            complementary = complementaryTreatments_1[_i];
            return [
              4 /*yield*/,
              this.analyzeTreatmentCombination(
                primaryTreatment,
                complementary,
                patient,
                riskAssessment,
              ),
            ];
          case 2:
            combination = _a.sent();
            if (combination.synergy_score > 0.6) {
              combinations.push(combination);
            }
            _a.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            return [2 /*return*/, combinations.sort((a, b) => b.synergy_score - a.synergy_score)];
        }
      });
    });
  };
  /**
   * Predict treatment success rate for specific patient
   */
  AITreatmentRecommendationEngine.prototype.predictTreatmentSuccess = function (
    treatmentId,
    patient,
    riskAssessment,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var model,
        features,
        baseRate,
        riskAdjustment,
        ageAdjustment,
        historyAdjustment,
        predictedRate;
      return __generator(this, function (_a) {
        model = this.successRateModels.get(treatmentId);
        if (!model) {
          // Use baseline success rate if no specific model
          return [2 /*return*/, this.getBaselineSuccessRate(treatmentId)];
        }
        features = this.extractPredictionFeatures(patient, riskAssessment);
        baseRate = this.getBaselineSuccessRate(treatmentId);
        riskAdjustment = this.calculateRiskAdjustment(riskAssessment);
        ageAdjustment = this.calculateAgeAdjustment(patient);
        historyAdjustment = this.calculateHistoryAdjustment(patient);
        predictedRate = baseRate * riskAdjustment * ageAdjustment * historyAdjustment;
        return [2 /*return*/, Math.min(Math.max(predictedRate, 0.1), 0.95)];
      });
    });
  };
  /**
   * Get evidence-based support for treatment recommendation
   */
  AITreatmentRecommendationEngine.prototype.getEvidenceSupport = function (treatmentId) {
    return this.evidenceDatabase.get(treatmentId) || [];
  };
  // Private helper methods
  AITreatmentRecommendationEngine.prototype.analyzePatientProfile = function (
    patient,
    riskAssessment,
    treatmentHistory,
    medicalHistory,
  ) {
    return {
      age: this.calculateAge(patient.birth_date),
      riskLevel: riskAssessment.risk_level,
      overallRiskScore: riskAssessment.overall_score,
      previousTreatments: treatmentHistory.map((t) => t.treatment_type),
      chronicConditions: medicalHistory.filter((m) => m.condition_type === "chronic"),
      allergies: patient.allergies || [],
      lifestyle: patient.lifestyle_factors,
      biometrics: patient.biometrics,
      treatmentPreferences: patient.treatment_preferences,
    };
  };
  AITreatmentRecommendationEngine.prototype.identifyCandidateTreatments = function (
    treatmentGoals,
    patientProfile,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var candidates, goalTreatmentMap, _i, treatmentGoals_1, goal, treatments, uniqueCandidates;
      return __generator(this, function (_a) {
        candidates = [];
        goalTreatmentMap = {
          anti_aging: ["botox", "dermal_fillers", "laser_resurfacing", "chemical_peel"],
          skin_rejuvenation: ["microneedling", "laser_therapy", "photofacial", "chemical_peel"],
          body_contouring: ["coolsculpting", "radiofrequency", "ultrasound_therapy"],
          acne_treatment: ["laser_therapy", "chemical_peel", "light_therapy"],
          wellness: ["iv_therapy", "vitamin_injections", "hormone_therapy"],
          preventive: ["skin_analysis", "nutritional_counseling", "lifestyle_coaching"],
        };
        for (_i = 0, treatmentGoals_1 = treatmentGoals; _i < treatmentGoals_1.length; _i++) {
          goal = treatmentGoals_1[_i];
          treatments = goalTreatmentMap[goal] || [];
          candidates.push.apply(candidates, treatments);
        }
        uniqueCandidates = __spreadArray([], new Set(candidates), true);
        return [2 /*return*/, this.filterByPatientSuitability(uniqueCandidates, patientProfile)];
      });
    });
  };
  AITreatmentRecommendationEngine.prototype.scoreTreatments = function (
    treatments,
    patientProfile,
    riskAssessment,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var scoredTreatments, _i, treatments_1, treatment, score;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            scoredTreatments = [];
            (_i = 0), (treatments_1 = treatments);
            _a.label = 1;
          case 1:
            if (!(_i < treatments_1.length)) return [3 /*break*/, 4];
            treatment = treatments_1[_i];
            return [
              4 /*yield*/,
              this.calculateTreatmentScore(treatment, patientProfile, riskAssessment),
            ];
          case 2:
            score = _a.sent();
            scoredTreatments.push({ treatment: treatment, score: score });
            _a.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            return [2 /*return*/, scoredTreatments];
        }
      });
    });
  };
  AITreatmentRecommendationEngine.prototype.calculateTreatmentScore = function (
    treatmentId,
    patientProfile,
    riskAssessment,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var score, successRate, riskCompatibility, evidenceQuality, preferenceMatch;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            score = 50;
            return [
              4 /*yield*/,
              this.predictTreatmentSuccess(treatmentId, patientProfile, riskAssessment),
            ];
          case 1:
            successRate = _a.sent();
            score += (successRate - 0.5) * 40;
            riskCompatibility = this.calculateRiskCompatibility(treatmentId, riskAssessment);
            score += (riskCompatibility - 0.5) * 30;
            evidenceQuality = this.calculateEvidenceQuality(treatmentId);
            score += (evidenceQuality - 0.5) * 20;
            preferenceMatch = this.calculatePreferenceMatch(treatmentId, patientProfile);
            score += (preferenceMatch - 0.5) * 10;
            return [2 /*return*/, Math.min(Math.max(score, 0), 100)];
        }
      });
    });
  };
  AITreatmentRecommendationEngine.prototype.generateDetailedRecommendations = function (
    scoredTreatments,
    patientProfile,
    riskAssessment,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var recommendations, _i, scoredTreatments_1, _a, treatment, score, recommendation;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            recommendations = [];
            (_i = 0), (scoredTreatments_1 = scoredTreatments);
            _b.label = 1;
          case 1:
            if (!(_i < scoredTreatments_1.length)) return [3 /*break*/, 4];
            (_a = scoredTreatments_1[_i]), (treatment = _a.treatment), (score = _a.score);
            if (!(score >= 60)) return [3 /*break*/, 3];
            return [
              4 /*yield*/,
              this.createDetailedRecommendation(treatment, score, patientProfile, riskAssessment),
            ];
          case 2:
            recommendation = _b.sent();
            recommendations.push(recommendation);
            _b.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            return [2 /*return*/, recommendations];
        }
      });
    });
  };
  AITreatmentRecommendationEngine.prototype.createDetailedRecommendation = function (
    treatmentId,
    score,
    patientProfile,
    riskAssessment,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var treatment, successProbability, expectedOutcomes, contraindications, prerequisites;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            treatment = this.treatmentDatabase.get(treatmentId);
            if (!treatment) {
              throw new Error("Treatment not found: ".concat(treatmentId));
            }
            return [
              4 /*yield*/,
              this.predictTreatmentSuccess(treatmentId, patientProfile, riskAssessment),
            ];
          case 1:
            successProbability = _a.sent();
            expectedOutcomes = this.generateExpectedOutcomes(
              treatmentId,
              patientProfile,
              successProbability,
            );
            contraindications = this.identifyContraindications(
              treatmentId,
              patientProfile,
              riskAssessment,
            );
            prerequisites = this.identifyPrerequisites(treatmentId, patientProfile, riskAssessment);
            return [
              2 /*return*/,
              {
                id: "rec_".concat(treatmentId, "_").concat(Date.now()),
                treatment_name: treatment.name,
                treatment_type: treatment.type,
                recommendation_score: score,
                success_probability: successProbability,
                evidence_level: this.getEvidenceLevel(treatmentId),
                rationale: this.generateRationale(treatmentId, patientProfile, score),
                expected_outcomes: expectedOutcomes,
                contraindications: contraindications,
                prerequisites: prerequisites,
                estimated_cost: treatment.base_cost || 0,
                estimated_duration: treatment.duration || "Variable",
                recovery_time: treatment.recovery_time || "Minimal",
                alternative_treatments: this.getAlternativeTreatments(treatmentId),
              },
            ];
        }
      });
    });
  };
  // Additional helper methods
  AITreatmentRecommendationEngine.prototype.calculateAge = (birthDate) => {
    var birth = new Date(birthDate);
    var today = new Date();
    var age = today.getFullYear() - birth.getFullYear();
    var monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };
  AITreatmentRecommendationEngine.prototype.filterByPatientSuitability = function (
    treatments,
    patientProfile,
  ) {
    return treatments.filter((treatment) => {
      // Basic suitability checks
      if (patientProfile.age < 18 && this.requiresAdultConsent(treatment)) {
        return false;
      }
      if (
        patientProfile.allergies.some((allergy) =>
          this.hasAllergyContraindication(treatment, allergy),
        )
      ) {
        return false;
      }
      return true;
    });
  };
  AITreatmentRecommendationEngine.prototype.calculateRiskCompatibility = function (
    treatmentId,
    riskAssessment,
  ) {
    var treatmentRiskProfile = this.getTreatmentRiskProfile(treatmentId);
    // Higher risk treatments get lower compatibility with high-risk patients
    if (riskAssessment.risk_level === "critical" && treatmentRiskProfile === "high") {
      return 0.2;
    }
    if (riskAssessment.risk_level === "high" && treatmentRiskProfile === "high") {
      return 0.4;
    }
    if (riskAssessment.risk_level === "moderate" && treatmentRiskProfile === "medium") {
      return 0.7;
    }
    return 0.8; // Good compatibility
  };
  AITreatmentRecommendationEngine.prototype.calculateEvidenceQuality = function (treatmentId) {
    var evidence = this.evidenceDatabase.get(treatmentId) || [];
    if (evidence.length === 0) return 0.3;
    var avgConfidence = evidence.reduce((sum, e) => sum + e.confidence_level, 0) / evidence.length;
    return avgConfidence;
  };
  AITreatmentRecommendationEngine.prototype.calculatePreferenceMatch = function (
    treatmentId,
    patientProfile,
  ) {
    var preferences = patientProfile.treatmentPreferences || {};
    // Simple preference matching logic
    if (preferences.invasiveness === "minimal" && this.isMinimallyInvasive(treatmentId)) {
      return 0.9;
    }
    if (preferences.downtime === "none" && this.hasNoDowntime(treatmentId)) {
      return 0.8;
    }
    return 0.6; // Neutral match
  };
  // Mock data initialization methods
  AITreatmentRecommendationEngine.prototype.initializeTreatmentDatabase = function () {
    // Initialize with sample treatments
    var treatments = [
      {
        id: "botox",
        name: "Botulinum Toxin Injection",
        type: "aesthetic",
        base_cost: 500,
        duration: "30 minutes",
        recovery_time: "None",
      },
      {
        id: "dermal_fillers",
        name: "Dermal Filler Treatment",
        type: "aesthetic",
        base_cost: 800,
        duration: "45 minutes",
        recovery_time: "1-2 days",
      },
      {
        id: "laser_resurfacing",
        name: "Laser Skin Resurfacing",
        type: "aesthetic",
        base_cost: 1200,
        duration: "60 minutes",
        recovery_time: "7-10 days",
      },
    ];
    treatments.forEach((treatment) => {
      this.treatmentDatabase.set(treatment.id, treatment);
    });
  };
  AITreatmentRecommendationEngine.prototype.initializeProtocolDatabase = () => {
    // Initialize with sample protocols
    console.log("Initializing treatment protocols...");
  };
  AITreatmentRecommendationEngine.prototype.loadEvidenceDatabase = () => {
    // Load evidence sources
    console.log("Loading evidence database...");
  };
  AITreatmentRecommendationEngine.prototype.loadSuccessRateModels = () => {
    // Load ML models for success rate prediction
    console.log("Loading success rate prediction models...");
  };
  // Additional utility methods would be implemented here...
  AITreatmentRecommendationEngine.prototype.getBaselineSuccessRate = (treatmentId) => {
    var rates = {
      botox: 0.92,
      dermal_fillers: 0.88,
      laser_resurfacing: 0.85,
      microneedling: 0.82,
      chemical_peel: 0.78,
    };
    return rates[treatmentId] || 0.75;
  };
  AITreatmentRecommendationEngine.prototype.calculateRiskAdjustment = (riskAssessment) => {
    var adjustments = {
      low: 1.05,
      moderate: 1.0,
      high: 0.9,
      critical: 0.75,
    };
    return adjustments[riskAssessment.risk_level];
  };
  AITreatmentRecommendationEngine.prototype.calculateAgeAdjustment = (patient) => {
    var age = patient.age;
    if (age < 25) return 1.02;
    if (age < 40) return 1.0;
    if (age < 60) return 0.98;
    return 0.95;
  };
  AITreatmentRecommendationEngine.prototype.calculateHistoryAdjustment = (patient) => {
    var previousTreatments = patient.previousTreatments || [];
    if (previousTreatments.length === 0) return 0.98; // Slight reduction for first-time
    if (previousTreatments.length > 5) return 1.05; // Bonus for experienced patients
    return 1.0;
  };
  AITreatmentRecommendationEngine.prototype.extractPredictionFeatures = (
    patient,
    riskAssessment,
  ) => ({
    age: patient.age,
    riskScore: riskAssessment.overall_score,
    chronicConditions: patient.chronicConditions.length,
    previousTreatments: patient.previousTreatments.length,
    lifestyle: patient.lifestyle,
  });
  // More utility methods...
  AITreatmentRecommendationEngine.prototype.requiresAdultConsent = (treatmentId) => {
    var adultOnlyTreatments = ["botox", "dermal_fillers", "laser_resurfacing"];
    return adultOnlyTreatments.includes(treatmentId);
  };
  AITreatmentRecommendationEngine.prototype.hasAllergyContraindication = (treatmentId, allergy) => {
    var contraindications = {
      botox: ["botulinum", "albumin"],
      dermal_fillers: ["hyaluronic", "lidocaine"],
      laser_resurfacing: ["photosensitivity"],
    };
    var treatmentContras = contraindications[treatmentId] || [];
    return treatmentContras.some((contra) => allergy.toLowerCase().includes(contra));
  };
  AITreatmentRecommendationEngine.prototype.getTreatmentRiskProfile = (treatmentId) => {
    var riskProfiles = {
      botox: "low",
      dermal_fillers: "low",
      laser_resurfacing: "medium",
      chemical_peel: "medium",
      surgical: "high",
    };
    return riskProfiles[treatmentId] || "medium";
  };
  AITreatmentRecommendationEngine.prototype.isMinimallyInvasive = (treatmentId) => {
    var minimallyInvasive = ["botox", "dermal_fillers", "microneedling", "chemical_peel"];
    return minimallyInvasive.includes(treatmentId);
  };
  AITreatmentRecommendationEngine.prototype.hasNoDowntime = (treatmentId) => {
    var noDowntime = ["botox", "microneedling", "light_therapy"];
    return noDowntime.includes(treatmentId);
  };
  AITreatmentRecommendationEngine.prototype.getEvidenceLevel = (treatmentId) => {
    var evidenceLevels = {
      botox: "A",
      dermal_fillers: "A",
      laser_resurfacing: "B",
      microneedling: "B",
      chemical_peel: "C",
    };
    return evidenceLevels[treatmentId] || "C";
  };
  AITreatmentRecommendationEngine.prototype.generateRationale = (
    treatmentId,
    patientProfile,
    score,
  ) =>
    "Based on patient profile analysis, this treatment shows ".concat(score, "% compatibility. ") +
    "Factors considered include age ("
      .concat(patientProfile.age, "), risk level (")
      .concat(patientProfile.riskLevel, "), ") +
    "and treatment history.";
  AITreatmentRecommendationEngine.prototype.generateExpectedOutcomes = (
    treatmentId,
    patientProfile,
    successProbability,
  ) => {
    // Generate expected outcomes based on treatment type
    return [
      {
        outcome_type: "improvement",
        description: "Visible improvement in target area",
        probability: successProbability,
        timeframe: "2-4 weeks",
        measurable_metrics: ["Patient satisfaction", "Clinical assessment"],
      },
    ];
  };
  AITreatmentRecommendationEngine.prototype.identifyContraindications = (
    treatmentId,
    patientProfile,
    riskAssessment,
  ) => {
    var contraindications = [];
    if (riskAssessment.risk_level === "critical") {
      contraindications.push("High-risk patient profile requires specialist consultation");
    }
    return contraindications;
  };
  AITreatmentRecommendationEngine.prototype.identifyPrerequisites = (
    treatmentId,
    patientProfile,
    riskAssessment,
  ) => {
    var prerequisites = [];
    if (patientProfile.age < 21) {
      prerequisites.push("Parental consent required");
    }
    if (riskAssessment.risk_level === "high") {
      prerequisites.push("Pre-treatment medical clearance");
    }
    return prerequisites;
  };
  AITreatmentRecommendationEngine.prototype.getAlternativeTreatments = (treatmentId) => {
    var alternatives = {
      botox: ["dermal_fillers", "microneedling"],
      dermal_fillers: ["botox", "laser_resurfacing"],
      laser_resurfacing: ["chemical_peel", "microneedling"],
    };
    return alternatives[treatmentId] || [];
  };
  AITreatmentRecommendationEngine.prototype.generateProtocolCustomizations = (
    protocol,
    patient,
    riskAssessment,
  ) => {
    // Generate protocol customizations based on patient factors
    return [];
  };
  AITreatmentRecommendationEngine.prototype.calculateProtocolSuitability = (
    protocol,
    patient,
    riskAssessment,
  ) => {
    // Calculate how suitable the protocol is for this patient
    return 0.85;
  };
  AITreatmentRecommendationEngine.prototype.getCompatibleTreatments = (
    primaryTreatment,
    patient,
    riskAssessment,
  ) => {
    // Return treatments compatible with the primary treatment
    return [];
  };
  AITreatmentRecommendationEngine.prototype.analyzeTreatmentCombination = function (
    primary,
    complementary,
    patient,
    riskAssessment,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Analyze synergy between treatments
        return [
          2 /*return*/,
          {
            primary_treatment: primary,
            complementary_treatments: [complementary],
            synergy_score: 0.7,
            combined_success_rate: 0.9,
            interaction_warnings: [],
            optimal_sequencing: [primary, complementary],
          },
        ];
      });
    });
  };
  return AITreatmentRecommendationEngine;
})();
exports.AITreatmentRecommendationEngine = AITreatmentRecommendationEngine;
exports.default = AITreatmentRecommendationEngine;
