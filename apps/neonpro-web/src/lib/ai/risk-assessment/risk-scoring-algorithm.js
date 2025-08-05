/**
 * Risk Scoring Algorithm
 * Story 3.2: AI-powered Risk Assessment + Insights Implementation
 *
 * This module implements advanced risk scoring algorithms:
 * - Multi-dimensional risk scoring with weighted factors
 * - Dynamic risk thresholds based on treatment type
 * - Real-time risk score updates
 * - Risk trend analysis and prediction
 * - Comparative risk assessment
 * - Brazilian healthcare compliance scoring
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
exports.RiskScoringAlgorithm = void 0;
var client_1 = require("@/lib/supabase/client");
var RiskScoringAlgorithm = /** @class */ (() => {
  function RiskScoringAlgorithm(config) {
    this.supabase = (0, client_1.createClient)();
    this.riskFactors = new Map();
    this.historicalData = new Map();
    this.populationStats = null;
    this.config = this.initializeConfig(config);
    this.loadRiskFactors();
    this.loadPopulationStats();
  }
  /**
   * Calculate comprehensive risk score
   */
  RiskScoringAlgorithm.prototype.calculateRiskScore = function (patientId, treatmentId, inputData) {
    return __awaiter(this, void 0, void 0, function () {
      var components,
        totalScore,
        normalizedScore,
        riskLevel,
        confidence,
        breakdown,
        trends,
        benchmarks,
        recommendations,
        result,
        error_1;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 5, , 6]);
            console.log(
              "Calculating risk score for patient "
                .concat(patientId, ", treatment ")
                .concat(treatmentId),
            );
            return [
              4 /*yield*/,
              this.calculateComponents(patientId, treatmentId, inputData),
              // Step 2: Apply weights and calculate total score
            ];
          case 1:
            components = _b.sent();
            totalScore = this.calculateTotalScore(components);
            normalizedScore = this.normalizeScore(
              totalScore,
              (_a = inputData.treatmentData) === null || _a === void 0 ? void 0 : _a.type,
            );
            riskLevel = this.determineRiskLevel(normalizedScore);
            confidence = this.calculateConfidence(components, inputData);
            breakdown = this.generateBreakdown(components);
            return [
              4 /*yield*/,
              this.analyzeTrends(patientId, normalizedScore),
              // Step 8: Calculate benchmarks
            ];
          case 2:
            trends = _b.sent();
            return [
              4 /*yield*/,
              this.calculateBenchmarks(inputData, normalizedScore),
              // Step 9: Generate recommendations
            ];
          case 3:
            benchmarks = _b.sent();
            recommendations = this.generateRecommendations(components, riskLevel, trends);
            result = {
              totalScore: totalScore,
              normalizedScore: normalizedScore,
              riskLevel: riskLevel,
              confidence: confidence,
              components: components,
              breakdown: breakdown,
              trends: trends,
              benchmarks: benchmarks,
              recommendations: recommendations,
            };
            // Store for trend analysis
            return [4 /*yield*/, this.storeRiskScore(patientId, result)];
          case 4:
            // Store for trend analysis
            _b.sent();
            console.log(
              "Risk score calculated: ".concat(normalizedScore, " (").concat(riskLevel, ")"),
            );
            return [2 /*return*/, result];
          case 5:
            error_1 = _b.sent();
            console.error("Error calculating risk score:", error_1);
            throw new Error("Failed to calculate risk score");
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Calculate component scores
   */
  RiskScoringAlgorithm.prototype.calculateComponents = function (
    patientId,
    treatmentId,
    inputData,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var components, historicalData;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            components = {
              patientFactors: {
                demographic: 0,
                medical: 0,
                lifestyle: 0,
                medication: 0,
              },
              treatmentFactors: {
                complexity: 0,
                invasiveness: 0,
                duration: 0,
                anesthesia: 0,
              },
              environmentalFactors: {
                facility: 0,
                staff: 0,
                equipment: 0,
                emergency: 0,
              },
              historicalFactors: {
                previousOutcomes: 0,
                complications: 0,
                recovery: 0,
                adherence: 0,
              },
            };
            // Calculate patient factors
            components.patientFactors.demographic = this.calculateDemographicScore(
              inputData.patientData,
            );
            components.patientFactors.medical = this.calculateMedicalScore(inputData.patientData);
            components.patientFactors.lifestyle = this.calculateLifestyleScore(
              inputData.patientData,
            );
            components.patientFactors.medication = this.calculateMedicationScore(
              inputData.patientData,
            );
            // Calculate treatment factors
            components.treatmentFactors.complexity = this.calculateComplexityScore(
              inputData.treatmentData,
            );
            components.treatmentFactors.invasiveness = this.calculateInvasivenessScore(
              inputData.treatmentData,
            );
            components.treatmentFactors.duration = this.calculateDurationScore(
              inputData.treatmentData,
            );
            components.treatmentFactors.anesthesia = this.calculateAnesthesiaScore(
              inputData.treatmentData,
            );
            // Calculate environmental factors
            components.environmentalFactors.facility = this.calculateFacilityScore(
              inputData.environmentalFactors,
            );
            components.environmentalFactors.staff = this.calculateStaffScore(
              inputData.environmentalFactors,
            );
            components.environmentalFactors.equipment = this.calculateEquipmentScore(
              inputData.environmentalFactors,
            );
            components.environmentalFactors.emergency = this.calculateEmergencyScore(
              inputData.environmentalFactors,
            );
            return [4 /*yield*/, this.getHistoricalData(patientId)];
          case 1:
            historicalData = _a.sent();
            components.historicalFactors.previousOutcomes =
              this.calculateOutcomesScore(historicalData);
            components.historicalFactors.complications =
              this.calculateComplicationsScore(historicalData);
            components.historicalFactors.recovery = this.calculateRecoveryScore(historicalData);
            components.historicalFactors.adherence = this.calculateAdherenceScore(historicalData);
            return [2 /*return*/, components];
        }
      });
    });
  };
  /**
   * Calculate demographic risk score
   */
  RiskScoringAlgorithm.prototype.calculateDemographicScore = (patientData) => {
    var score = 0;
    // Age factor
    var age = patientData.age;
    if (age < 1)
      score += 20; // Neonatal
    else if (age < 5)
      score += 15; // Pediatric
    else if (age < 18)
      score += 5; // Adolescent
    else if (age < 65)
      score += 0; // Adult
    else if (age < 75)
      score += 10; // Elderly
    else if (age < 85)
      score += 20; // Very elderly
    else score += 30; // Extreme elderly
    // BMI factor
    var bmi = patientData.bmi;
    if (bmi < 16)
      score += 25; // Severely underweight
    else if (bmi < 18.5)
      score += 15; // Underweight
    else if (bmi < 25)
      score += 0; // Normal
    else if (bmi < 30)
      score += 5; // Overweight
    else if (bmi < 35)
      score += 15; // Obese Class I
    else if (bmi < 40)
      score += 25; // Obese Class II
    else score += 35; // Obese Class III
    // Gender-specific factors
    if (patientData.gender === "female") {
      // Pregnancy considerations would be added here
      // For now, no additional risk
    }
    return Math.min(100, score);
  };
  /**
   * Calculate medical history risk score
   */
  RiskScoringAlgorithm.prototype.calculateMedicalScore = (patientData) => {
    var score = 0;
    var conditions = patientData.medicalHistory || [];
    // High-risk conditions
    var highRiskConditions = [
      "heart_disease",
      "diabetes",
      "kidney_disease",
      "liver_disease",
      "cancer",
      "autoimmune_disease",
      "bleeding_disorder",
    ];
    // Medium-risk conditions
    var mediumRiskConditions = [
      "hypertension",
      "asthma",
      "depression",
      "anxiety",
      "arthritis",
      "osteoporosis",
    ];
    conditions.forEach((condition) => {
      var conditionLower = condition.toLowerCase();
      if (highRiskConditions.some((risk) => conditionLower.includes(risk))) {
        score += 20;
      } else if (mediumRiskConditions.some((risk) => conditionLower.includes(risk))) {
        score += 10;
      } else {
        score += 5; // Other conditions
      }
    });
    // Family history factor
    var familyHistory = patientData.familyHistory || [];
    familyHistory.forEach((condition) => {
      if (highRiskConditions.some((risk) => condition.toLowerCase().includes(risk))) {
        score += 5;
      }
    });
    return Math.min(100, score);
  };
  /**
   * Calculate lifestyle risk score
   */
  RiskScoringAlgorithm.prototype.calculateLifestyleScore = (patientData) => {
    var score = 0;
    var lifestyle = patientData.lifestyle || {};
    // Smoking
    if (lifestyle.smoking) {
      score += 25;
    }
    // Alcohol consumption
    switch (lifestyle.alcohol) {
      case "heavy":
        score += 20;
        break;
      case "moderate":
        score += 10;
        break;
      case "occasional":
        score += 5;
        break;
      case "none":
        score += 0;
        break;
    }
    // Exercise level
    switch (lifestyle.exercise) {
      case "sedentary":
        score += 15;
        break;
      case "light":
        score += 10;
        break;
      case "moderate":
        score += 5;
        break;
      case "active":
        score += 0;
        break;
    }
    // Diet quality
    switch (lifestyle.diet) {
      case "poor":
        score += 15;
        break;
      case "average":
        score += 10;
        break;
      case "good":
        score += 5;
        break;
      case "excellent":
        score += 0;
        break;
    }
    return Math.min(100, score);
  };
  /**
   * Calculate medication risk score
   */
  RiskScoringAlgorithm.prototype.calculateMedicationScore = (patientData) => {
    var score = 0;
    var medications = patientData.medications || [];
    // High-risk medications
    var highRiskMeds = [
      "warfarin",
      "heparin",
      "chemotherapy",
      "immunosuppressants",
      "steroids",
      "insulin",
    ];
    // Medium-risk medications
    var mediumRiskMeds = [
      "aspirin",
      "nsaids",
      "antidepressants",
      "antipsychotics",
      "beta_blockers",
      "ace_inhibitors",
    ];
    medications.forEach((medication) => {
      var medLower = medication.toLowerCase();
      if (highRiskMeds.some((risk) => medLower.includes(risk))) {
        score += 15;
      } else if (mediumRiskMeds.some((risk) => medLower.includes(risk))) {
        score += 8;
      } else {
        score += 3; // Other medications
      }
    });
    // Polypharmacy (multiple medications)
    if (medications.length > 5) {
      score += 10;
    } else if (medications.length > 10) {
      score += 20;
    }
    // Drug allergies
    var allergies = patientData.allergies || [];
    score += allergies.length * 5;
    return Math.min(100, score);
  };
  /**
   * Calculate treatment complexity score
   */
  RiskScoringAlgorithm.prototype.calculateComplexityScore = (treatmentData) => {
    var _a;
    var score = 0;
    // Base complexity by treatment type
    var complexityMap = {
      consultation: 5,
      cleaning: 10,
      filling: 15,
      extraction: 25,
      root_canal: 35,
      crown: 30,
      implant: 45,
      surgery: 60,
      orthodontics: 20,
    };
    var treatmentType =
      ((_a = treatmentData.type) === null || _a === void 0 ? void 0 : _a.toLowerCase()) ||
      "consultation";
    score += complexityMap[treatmentType] || 20;
    // Duration factor
    var duration = treatmentData.duration || 30;
    if (duration > 180)
      score += 20; // >3 hours
    else if (duration > 120)
      score += 15; // 2-3 hours
    else if (duration > 60)
      score += 10; // 1-2 hours
    else if (duration > 30) score += 5; // 30min-1hour
    // Equipment complexity
    var equipment = treatmentData.equipmentRequired || [];
    score += equipment.length * 3;
    return Math.min(100, score);
  };
  /**
   * Calculate invasiveness score
   */
  RiskScoringAlgorithm.prototype.calculateInvasivenessScore = (treatmentData) => {
    var invasivenessMap = {
      non_invasive: 5,
      minimally_invasive: 20,
      invasive: 40,
      surgical: 60,
    };
    return invasivenessMap[treatmentData.invasiveness] || 20;
  };
  /**
   * Calculate duration score
   */
  RiskScoringAlgorithm.prototype.calculateDurationScore = (treatmentData) => {
    var duration = treatmentData.duration || 30;
    if (duration > 240) return 40; // >4 hours
    if (duration > 180) return 30; // 3-4 hours
    if (duration > 120) return 20; // 2-3 hours
    if (duration > 60) return 10; // 1-2 hours
    return 5; // <1 hour
  };
  /**
   * Calculate anesthesia score
   */
  RiskScoringAlgorithm.prototype.calculateAnesthesiaScore = (treatmentData) => {
    if (!treatmentData.anesthesiaRequired) return 0;
    var anesthesiaMap = {
      local: 10,
      regional: 25,
      general: 40,
    };
    return anesthesiaMap[treatmentData.anesthesiaType] || 15;
  };
  /**
   * Calculate facility score
   */
  RiskScoringAlgorithm.prototype.calculateFacilityScore = (environmentalFactors) => {
    var score = 0;
    // Facility type
    var facilityMap = {
      hospital: 5,
      surgical_center: 10,
      clinic: 15,
    };
    score += facilityMap[environmentalFactors.facilityType] || 10;
    // Emergency capability
    if (!environmentalFactors.emergencyCapability) {
      score += 15;
    }
    return score;
  };
  /**
   * Calculate staff experience score
   */
  RiskScoringAlgorithm.prototype.calculateStaffScore = (environmentalFactors) => {
    var experienceMap = {
      expert: 5,
      experienced: 10,
      junior: 20,
    };
    return experienceMap[environmentalFactors.staffExperience] || 15;
  };
  /**
   * Calculate equipment quality score
   */
  RiskScoringAlgorithm.prototype.calculateEquipmentScore = (environmentalFactors) => {
    var qualityMap = {
      advanced: 5,
      standard: 10,
      basic: 20,
    };
    return qualityMap[environmentalFactors.equipmentQuality] || 15;
  };
  /**
   * Calculate emergency preparedness score
   */
  RiskScoringAlgorithm.prototype.calculateEmergencyScore = (environmentalFactors) => {
    var score = 0;
    if (!environmentalFactors.emergencyCapability) {
      score += 20;
    }
    // Distance to hospital (if clinic)
    if (environmentalFactors.facilityType === "clinic") {
      score += 10;
    }
    return score;
  };
  /**
   * Get historical data for patient
   */
  RiskScoringAlgorithm.prototype.getHistoricalData = function (patientId) {
    return __awaiter(this, void 0, void 0, function () {
      var data, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("treatment_outcomes")
                .select("*")
                .eq("patient_id", patientId)
                .order("created_at", { ascending: false })
                .limit(10),
            ];
          case 1:
            data = _a.sent().data;
            return [2 /*return*/, data || []];
          case 2:
            error_2 = _a.sent();
            console.error("Error fetching historical data:", error_2);
            return [2 /*return*/, []];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Calculate previous outcomes score
   */
  RiskScoringAlgorithm.prototype.calculateOutcomesScore = (historicalData) => {
    if (historicalData.length === 0) return 0;
    var complications = historicalData.filter(
      (record) => record.outcome === "complication" || record.outcome === "failure",
    );
    var complicationRate = complications.length / historicalData.length;
    return Math.round(complicationRate * 50); // Max 50 points
  };
  /**
   * Calculate complications score
   */
  RiskScoringAlgorithm.prototype.calculateComplicationsScore = (historicalData) => {
    if (historicalData.length === 0) return 0;
    var score = 0;
    historicalData.forEach((record) => {
      var complications = JSON.parse(record.complications || "[]");
      score += complications.length * 5;
    });
    return Math.min(50, score);
  };
  /**
   * Calculate recovery patterns score
   */
  RiskScoringAlgorithm.prototype.calculateRecoveryScore = (historicalData) => {
    if (historicalData.length === 0) return 0;
    var slowRecoveries = historicalData.filter(
      (record) => record.recovery_time > record.expected_recovery_time * 1.5,
    );
    var slowRecoveryRate = slowRecoveries.length / historicalData.length;
    return Math.round(slowRecoveryRate * 30); // Max 30 points
  };
  /**
   * Calculate treatment adherence score
   */
  RiskScoringAlgorithm.prototype.calculateAdherenceScore = (historicalData) => {
    if (historicalData.length === 0) return 0;
    var poorAdherence = historicalData.filter(
      (record) => record.adherence_score < 0.7, // Less than 70% adherence
    );
    var poorAdherenceRate = poorAdherence.length / historicalData.length;
    return Math.round(poorAdherenceRate * 20); // Max 20 points
  };
  /**
   * Calculate total weighted score
   */
  RiskScoringAlgorithm.prototype.calculateTotalScore = function (components) {
    var weights = this.config.weights;
    var patientScore =
      (components.patientFactors.demographic +
        components.patientFactors.medical +
        components.patientFactors.lifestyle +
        components.patientFactors.medication) /
      4;
    var treatmentScore =
      (components.treatmentFactors.complexity +
        components.treatmentFactors.invasiveness +
        components.treatmentFactors.duration +
        components.treatmentFactors.anesthesia) /
      4;
    var environmentalScore =
      (components.environmentalFactors.facility +
        components.environmentalFactors.staff +
        components.environmentalFactors.equipment +
        components.environmentalFactors.emergency) /
      4;
    var historicalScore =
      (components.historicalFactors.previousOutcomes +
        components.historicalFactors.complications +
        components.historicalFactors.recovery +
        components.historicalFactors.adherence) /
      4;
    return (
      patientScore * weights.patientFactors +
      treatmentScore * weights.treatmentFactors +
      environmentalScore * weights.environmentalFactors +
      historicalScore * weights.historicalFactors
    );
  };
  /**
   * Normalize score to 0-100 range
   */
  RiskScoringAlgorithm.prototype.normalizeScore = function (totalScore, treatmentType) {
    // Apply treatment-specific adjustments
    var adjustedScore = totalScore;
    if (treatmentType && this.config.adjustments.treatmentMultiplier[treatmentType]) {
      adjustedScore *= this.config.adjustments.treatmentMultiplier[treatmentType];
    }
    // Normalize to 0-100
    return Math.min(100, Math.max(0, Math.round(adjustedScore)));
  };
  /**
   * Determine risk level from score
   */
  RiskScoringAlgorithm.prototype.determineRiskLevel = function (score) {
    var thresholds = this.config.thresholds;
    if (score >= thresholds.high) return "critical";
    if (score >= thresholds.moderate) return "high";
    if (score >= thresholds.low) return "moderate";
    if (score >= thresholds.minimal) return "low";
    return "minimal";
  };
  /**
   * Calculate confidence in the score
   */
  RiskScoringAlgorithm.prototype.calculateConfidence = (components, inputData) => {
    var _a, _b, _c;
    var confidence = 100;
    // Reduce confidence for missing data
    if (
      !((_a = inputData.patientData.medicalHistory) === null || _a === void 0 ? void 0 : _a.length)
    )
      confidence -= 10;
    if (!((_b = inputData.patientData.medications) === null || _b === void 0 ? void 0 : _b.length))
      confidence -= 5;
    if (
      !((_c = inputData.patientData.familyHistory) === null || _c === void 0 ? void 0 : _c.length)
    )
      confidence -= 5;
    // Reduce confidence for incomplete lifestyle data
    var lifestyle = inputData.patientData.lifestyle || {};
    if (!lifestyle.smoking && !lifestyle.alcohol && !lifestyle.exercise) {
      confidence -= 15;
    }
    // Reduce confidence for missing historical data
    var totalHistorical = Object.values(components.historicalFactors).reduce(
      (sum, score) => sum + score,
      0,
    );
    if (totalHistorical === 0) confidence -= 20;
    return Math.max(0, confidence);
  };
  /**
   * Generate score breakdown
   */
  RiskScoringAlgorithm.prototype.generateBreakdown = function (components) {
    var breakdown = [];
    var weights = this.config.weights;
    // Patient factors
    var patientTotal =
      Object.values(components.patientFactors).reduce((sum, score) => sum + score, 0) / 4;
    breakdown.push({
      category: "Patient Factors",
      score: Math.round(patientTotal),
      weight: weights.patientFactors,
      contribution: Math.round(patientTotal * weights.patientFactors),
      factors: ["Demographics", "Medical History", "Lifestyle", "Medications"],
    });
    // Treatment factors
    var treatmentTotal =
      Object.values(components.treatmentFactors).reduce((sum, score) => sum + score, 0) / 4;
    breakdown.push({
      category: "Treatment Factors",
      score: Math.round(treatmentTotal),
      weight: weights.treatmentFactors,
      contribution: Math.round(treatmentTotal * weights.treatmentFactors),
      factors: ["Complexity", "Invasiveness", "Duration", "Anesthesia"],
    });
    // Environmental factors
    var environmentalTotal =
      Object.values(components.environmentalFactors).reduce((sum, score) => sum + score, 0) / 4;
    breakdown.push({
      category: "Environmental Factors",
      score: Math.round(environmentalTotal),
      weight: weights.environmentalFactors,
      contribution: Math.round(environmentalTotal * weights.environmentalFactors),
      factors: ["Facility", "Staff", "Equipment", "Emergency Preparedness"],
    });
    // Historical factors
    var historicalTotal =
      Object.values(components.historicalFactors).reduce((sum, score) => sum + score, 0) / 4;
    breakdown.push({
      category: "Historical Factors",
      score: Math.round(historicalTotal),
      weight: weights.historicalFactors,
      contribution: Math.round(historicalTotal * weights.historicalFactors),
      factors: ["Previous Outcomes", "Complications", "Recovery", "Adherence"],
    });
    return breakdown;
  };
  /**
   * Analyze risk trends
   */
  RiskScoringAlgorithm.prototype.analyzeTrends = function (patientId, currentScore) {
    return __awaiter(this, void 0, void 0, function () {
      var historicalScores, scores, trend, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("risk_scores")
                .select("score, created_at")
                .eq("patient_id", patientId)
                .order("created_at", { ascending: false })
                .limit(5),
            ];
          case 1:
            historicalScores = _a.sent().data;
            if (!historicalScores || historicalScores.length < 2) {
              return [
                2 /*return*/,
                {
                  direction: "stable",
                  velocity: 0,
                  prediction: currentScore,
                },
              ];
            }
            scores = __spreadArray(
              [currentScore],
              historicalScores.map((h) => h.score),
              true,
            );
            trend = this.calculateTrend(scores);
            return [
              2 /*return*/,
              {
                direction: trend > 5 ? "worsening" : trend < -5 ? "improving" : "stable",
                velocity: Math.abs(trend),
                prediction: Math.max(0, Math.min(100, currentScore + trend)),
              },
            ];
          case 2:
            error_3 = _a.sent();
            console.error("Error analyzing trends:", error_3);
            return [
              2 /*return*/,
              {
                direction: "stable",
                velocity: 0,
                prediction: currentScore,
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Calculate trend from score array
   */
  RiskScoringAlgorithm.prototype.calculateTrend = (scores) => {
    if (scores.length < 2) return 0;
    var trend = 0;
    for (var i = 1; i < scores.length; i++) {
      trend += scores[i - 1] - scores[i];
    }
    return trend / (scores.length - 1);
  };
  /**
   * Calculate benchmark comparisons
   */
  RiskScoringAlgorithm.prototype.calculateBenchmarks = function (inputData, currentScore) {
    return __awaiter(this, void 0, void 0, function () {
      var populationAverage,
        ageGroup,
        ageGroupAverage,
        treatmentType,
        treatmentTypeAverage,
        facilityType,
        facilityAverage;
      var _a, _b, _c, _d, _e, _f, _g;
      return __generator(this, function (_h) {
        try {
          populationAverage =
            ((_a = this.populationStats) === null || _a === void 0 ? void 0 : _a.averageScore) ||
            25;
          ageGroup = this.getAgeGroup(inputData.patientData.age);
          ageGroupAverage =
            ((_c =
              (_b = this.populationStats) === null || _b === void 0 ? void 0 : _b.ageGroups) ===
              null || _c === void 0
              ? void 0
              : _c[ageGroup]) || 25;
          treatmentType = inputData.treatmentData.type;
          treatmentTypeAverage =
            ((_e =
              (_d = this.populationStats) === null || _d === void 0
                ? void 0
                : _d.treatmentTypes) === null || _e === void 0
              ? void 0
              : _e[treatmentType]) || 25;
          facilityType = inputData.environmentalFactors.facilityType;
          facilityAverage =
            ((_g =
              (_f = this.populationStats) === null || _f === void 0 ? void 0 : _f.facilityTypes) ===
              null || _g === void 0
              ? void 0
              : _g[facilityType]) || 25;
          return [
            2 /*return*/,
            {
              populationAverage: populationAverage,
              ageGroupAverage: ageGroupAverage,
              treatmentTypeAverage: treatmentTypeAverage,
              facilityAverage: facilityAverage,
            },
          ];
        } catch (error) {
          console.error("Error calculating benchmarks:", error);
          return [
            2 /*return*/,
            {
              populationAverage: 25,
              ageGroupAverage: 25,
              treatmentTypeAverage: 25,
              facilityAverage: 25,
            },
          ];
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Get age group for benchmarking
   */
  RiskScoringAlgorithm.prototype.getAgeGroup = (age) => {
    if (age < 18) return "pediatric";
    if (age < 35) return "young_adult";
    if (age < 50) return "middle_aged";
    if (age < 65) return "mature";
    if (age < 80) return "elderly";
    return "very_elderly";
  };
  /**
   * Generate recommendations based on score and trends
   */
  RiskScoringAlgorithm.prototype.generateRecommendations = (components, riskLevel, trends) => {
    var recommendations = {
      immediate: [],
      shortTerm: [],
      longTerm: [],
      monitoring: [],
    };
    // Risk level based recommendations
    if (riskLevel === "critical" || riskLevel === "high") {
      recommendations.immediate.push("Comprehensive pre-operative assessment required");
      recommendations.immediate.push("Specialist consultation recommended");
      recommendations.monitoring.push("Continuous monitoring during procedure");
      recommendations.monitoring.push("Extended post-operative observation");
    }
    if (riskLevel === "moderate") {
      recommendations.immediate.push("Enhanced pre-operative preparation");
      recommendations.monitoring.push("Standard monitoring with additional precautions");
    }
    // Trend-based recommendations
    if (trends.direction === "worsening") {
      recommendations.shortTerm.push("Address factors contributing to increasing risk");
      recommendations.monitoring.push("More frequent risk assessments");
    }
    // Component-specific recommendations
    var patientTotal =
      Object.values(components.patientFactors).reduce((sum, score) => sum + score, 0) / 4;
    if (patientTotal > 40) {
      recommendations.longTerm.push("Lifestyle modification counseling");
      recommendations.longTerm.push("Chronic disease management optimization");
    }
    var treatmentTotal =
      Object.values(components.treatmentFactors).reduce((sum, score) => sum + score, 0) / 4;
    if (treatmentTotal > 40) {
      recommendations.immediate.push("Consider less invasive alternatives");
      recommendations.immediate.push("Staged treatment approach evaluation");
    }
    return recommendations;
  };
  /**
   * Store risk score for trend analysis
   */
  RiskScoringAlgorithm.prototype.storeRiskScore = function (patientId, result) {
    return __awaiter(this, void 0, void 0, function () {
      var error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("risk_scores").insert({
                patient_id: patientId,
                score: result.normalizedScore,
                risk_level: result.riskLevel,
                confidence: result.confidence,
                components: JSON.stringify(result.components),
                breakdown: JSON.stringify(result.breakdown),
                trends: JSON.stringify(result.trends),
                benchmarks: JSON.stringify(result.benchmarks),
                created_at: new Date().toISOString(),
              }),
            ];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_4 = _a.sent();
            console.error("Error storing risk score:", error_4);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Initialize scoring configuration
   */
  RiskScoringAlgorithm.prototype.initializeConfig = (config) => {
    var defaultConfig = {
      weights: {
        patientFactors: 0.4,
        treatmentFactors: 0.3,
        environmentalFactors: 0.2,
        historicalFactors: 0.1,
      },
      thresholds: {
        minimal: 10,
        low: 25,
        moderate: 50,
        high: 75,
      },
      adjustments: {
        ageMultiplier: {
          pediatric: 1.2,
          elderly: 1.3,
          very_elderly: 1.5,
        },
        treatmentMultiplier: {
          surgery: 1.4,
          implant: 1.3,
          extraction: 1.1,
          consultation: 0.8,
        },
        facilityMultiplier: {
          clinic: 1.2,
          surgical_center: 1.0,
          hospital: 0.9,
        },
      },
      compliance: {
        cfmWeight: 0.3,
        anvisaWeight: 0.4,
        ethicsWeight: 0.3,
      },
    };
    return __assign(__assign({}, defaultConfig), config);
  };
  /**
   * Load risk factors from database
   */
  RiskScoringAlgorithm.prototype.loadRiskFactors = function () {
    return __awaiter(this, void 0, void 0, function () {
      var factors, error_5;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.supabase.from("risk_factors").select("*")];
          case 1:
            factors = _a.sent().data;
            if (factors) {
              factors.forEach((factor) => {
                _this.riskFactors.set(factor.id, {
                  id: factor.id,
                  name: factor.name,
                  category: factor.category,
                  subcategory: factor.subcategory,
                  weight: factor.weight,
                  scoreFunction: _this.createScoreFunction(factor.score_function),
                  description: factor.description,
                  evidenceLevel: factor.evidence_level,
                  sources: JSON.parse(factor.sources || "[]"),
                  lastUpdated: new Date(factor.updated_at),
                });
              });
            }
            return [3 /*break*/, 3];
          case 2:
            error_5 = _a.sent();
            console.error("Error loading risk factors:", error_5);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Load population statistics
   */
  RiskScoringAlgorithm.prototype.loadPopulationStats = function () {
    return __awaiter(this, void 0, void 0, function () {
      var stats, error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.supabase.from("population_statistics").select("*").single()];
          case 1:
            stats = _a.sent().data;
            if (stats) {
              this.populationStats = {
                averageScore: stats.average_score,
                ageGroups: JSON.parse(stats.age_groups || "{}"),
                treatmentTypes: JSON.parse(stats.treatment_types || "{}"),
                facilityTypes: JSON.parse(stats.facility_types || "{}"),
              };
            }
            return [3 /*break*/, 3];
          case 2:
            error_6 = _a.sent();
            console.error("Error loading population stats:", error_6);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Create score function from string definition
   */
  RiskScoringAlgorithm.prototype.createScoreFunction = (functionDef) => {
    // This would parse and create a function from the database definition
    // For now, return a simple function
    return (value, context) => {
      if (typeof value === "number") return Math.min(100, Math.max(0, value));
      if (typeof value === "boolean") return value ? 20 : 0;
      return 10; // Default score
    };
  };
  /**
   * Update configuration
   */
  RiskScoringAlgorithm.prototype.updateConfig = function (newConfig) {
    this.config = __assign(__assign({}, this.config), newConfig);
  };
  /**
   * Get current configuration
   */
  RiskScoringAlgorithm.prototype.getConfig = function () {
    return __assign({}, this.config);
  };
  /**
   * Get risk factor definitions
   */
  RiskScoringAlgorithm.prototype.getRiskFactors = function () {
    return new Map(this.riskFactors);
  };
  return RiskScoringAlgorithm;
})();
exports.RiskScoringAlgorithm = RiskScoringAlgorithm;
