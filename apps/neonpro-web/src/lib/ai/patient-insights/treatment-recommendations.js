"use strict";
// AI-Powered Treatment Recommendation System
// Story 3.2: Task 2 - Treatment Recommendation System
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
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreatmentRecommendationEngine = void 0;
var client_1 = require("@/lib/supabase/client");
var TreatmentRecommendationEngine = /** @class */ (function () {
  function TreatmentRecommendationEngine() {
    this.supabase = (0, client_1.createClient)();
    this.evidenceDatabase = new Map();
    this.initializeEvidenceDatabase();
  }
  TreatmentRecommendationEngine.prototype.generateRecommendations = function (
    patientId,
    riskAssessment,
    treatmentGoal,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var startTime,
        patientData,
        availableTreatments,
        recommendations,
        _i,
        availableTreatments_1,
        treatment,
        recommendation,
        rankedRecommendations,
        safeRecommendations,
        error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            startTime = Date.now();
            _a.label = 1;
          case 1:
            _a.trys.push([1, 8, , 9]);
            return [
              4 /*yield*/,
              this.getPatientTreatmentHistory(patientId),
              // 2. Get available treatments for clinic specialty
            ];
          case 2:
            patientData = _a.sent();
            return [
              4 /*yield*/,
              this.getAvailableTreatments(),
              // 3. Analyze each treatment for suitability
            ];
          case 3:
            availableTreatments = _a.sent();
            recommendations = [];
            (_i = 0), (availableTreatments_1 = availableTreatments);
            _a.label = 4;
          case 4:
            if (!(_i < availableTreatments_1.length)) return [3 /*break*/, 7];
            treatment = availableTreatments_1[_i];
            return [
              4 /*yield*/,
              this.analyzeTreatment(treatment, patientData, riskAssessment, treatmentGoal),
            ];
          case 5:
            recommendation = _a.sent();
            if (recommendation) {
              recommendations.push(recommendation);
            }
            _a.label = 6;
          case 6:
            _i++;
            return [3 /*break*/, 4];
          case 7:
            rankedRecommendations = this.rankRecommendations(recommendations);
            safeRecommendations = this.filterContraindications(
              rankedRecommendations,
              riskAssessment,
            );
            return [
              2 /*return*/,
              {
                success: true,
                data: safeRecommendations,
                processingTime: Date.now() - startTime,
              },
            ];
          case 8:
            error_1 = _a.sent();
            console.error("Treatment recommendation error:", error_1);
            return [
              2 /*return*/,
              {
                success: false,
                error: error_1 instanceof Error ? error_1.message : "Unknown error",
                processingTime: Date.now() - startTime,
              },
            ];
          case 9:
            return [2 /*return*/];
        }
      });
    });
  };
  TreatmentRecommendationEngine.prototype.getPatientTreatmentHistory = function (patientId) {
    return __awaiter(this, void 0, void 0, function () {
      var data;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("patients")
                .select(
                  "\n        *,\n        treatments (*),\n        treatment_outcomes (*),\n        medical_history (*),\n        preferences (*)\n      ",
                )
                .eq("id", patientId)
                .single(),
            ];
          case 1:
            data = _a.sent().data;
            return [2 /*return*/, data];
        }
      });
    });
  };
  TreatmentRecommendationEngine.prototype.getAvailableTreatments = function () {
    return __awaiter(this, void 0, void 0, function () {
      var data;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("treatment_types").select("*").eq("active", true),
            ];
          case 1:
            data = _a.sent().data;
            return [2 /*return*/, data || []];
        }
      });
    });
  };
  TreatmentRecommendationEngine.prototype.analyzeTreatment = function (
    treatment,
    patientData,
    riskAssessment,
    treatmentGoal,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var successProbability,
        riskLevel,
        contraindications,
        evidenceLevel,
        estimatedCost,
        estimatedDuration,
        reasoning;
      return __generator(this, function (_a) {
        // 1. Check basic eligibility
        if (!this.isPatientEligible(treatment, patientData)) {
          return [2 /*return*/, null];
        }
        successProbability = this.calculateSuccessProbability(
          treatment,
          patientData,
          riskAssessment,
        );
        riskLevel = this.assessTreatmentRisk(treatment, riskAssessment);
        contraindications = this.checkContraindications(treatment, patientData, riskAssessment);
        evidenceLevel = this.getEvidenceLevel(treatment, treatmentGoal);
        estimatedCost = this.calculateEstimatedCost(treatment, patientData);
        estimatedDuration = this.calculateEstimatedDuration(treatment, patientData);
        reasoning = this.generateRecommendationReasoning(
          treatment,
          successProbability,
          riskLevel,
          evidenceLevel,
        );
        return [
          2 /*return*/,
          {
            treatmentId: treatment.id,
            treatmentName: treatment.name,
            category:
              contraindications.length > 0
                ? "contraindicated"
                : successProbability > 0.7
                  ? "primary"
                  : "alternative",
            successProbability: successProbability,
            riskLevel: riskLevel,
            evidenceLevel: evidenceLevel,
            contraindications: contraindications,
            prerequisites: this.getPrerequisites(treatment, patientData),
            expectedOutcome: this.getExpectedOutcome(treatment, successProbability),
            estimatedDuration: estimatedDuration,
            estimatedCost: estimatedCost,
            reasoning: reasoning,
          },
        ];
      });
    });
  };
  TreatmentRecommendationEngine.prototype.isPatientEligible = function (treatment, patientData) {
    // Age restrictions
    var age = this.calculateAge(patientData.date_of_birth);
    if (treatment.min_age && age < treatment.min_age) return false;
    if (treatment.max_age && age > treatment.max_age) return false;
    // Gender restrictions
    if (treatment.gender_restriction && treatment.gender_restriction !== patientData.gender) {
      return false;
    }
    // Pregnancy restrictions
    if (treatment.pregnancy_safe === false && patientData.is_pregnant) {
      return false;
    }
    return true;
  };
  TreatmentRecommendationEngine.prototype.calculateSuccessProbability = function (
    treatment,
    patientData,
    riskAssessment,
  ) {
    var _a;
    // Base success rate from clinical data
    var baseRate = treatment.base_success_rate || 0.75;
    // Adjust for patient age
    var age = this.calculateAge(patientData.date_of_birth);
    if (age > 65) baseRate *= 0.9;
    if (age > 75) baseRate *= 0.85;
    // Adjust for overall risk score
    var riskFactor = 1 - riskAssessment.overallRiskScore / 200; // Max 50% reduction
    baseRate *= riskFactor;
    // Adjust for previous treatment outcomes
    if (((_a = patientData.treatments) === null || _a === void 0 ? void 0 : _a.length) > 0) {
      var successfulTreatments = patientData.treatments.filter(function (t) {
        return t.outcome === "successful";
      }).length;
      var successRate = successfulTreatments / patientData.treatments.length;
      baseRate = (baseRate + successRate) / 2; // Average with historical success
    }
    // Adjust for specific risk factors
    var medicalRisks = riskAssessment.riskFactors.filter(function (rf) {
      return rf.category === "medical";
    });
    var riskReduction = medicalRisks.reduce(function (reduction, risk) {
      return reduction + risk.weight * 0.1; // Max 10% reduction per risk factor
    }, 0);
    baseRate *= 1 - Math.min(0.4, riskReduction); // Max 40% total reduction
    return Math.max(0.1, Math.min(0.95, baseRate));
  };
  TreatmentRecommendationEngine.prototype.assessTreatmentRisk = function (
    treatment,
    riskAssessment,
  ) {
    var riskScore = treatment.base_risk_score || 1; // 1-4 scale
    // Increase risk based on patient risk factors
    var highRiskFactors = riskAssessment.riskFactors.filter(function (rf) {
      return rf.severity === "high" || rf.severity === "critical";
    });
    riskScore += highRiskFactors.length * 0.5;
    // Treatment-specific risk adjustments
    if (treatment.invasiveness === "high") riskScore += 1;
    if (treatment.anesthesia_required) riskScore += 0.5;
    if (treatment.recovery_time > 30) riskScore += 0.5;
    if (riskScore <= 1.5) return "low";
    if (riskScore <= 2.5) return "medium";
    return "high";
  };
  TreatmentRecommendationEngine.prototype.checkContraindications = function (
    treatment,
    patientData,
    riskAssessment,
  ) {
    var _a, _b, _c;
    var contraindications = [];
    // Medical condition contraindications
    var medicalConditions =
      ((_a = patientData.medical_history) === null || _a === void 0
        ? void 0
        : _a.map(function (mh) {
            return mh.condition_type;
          })) || [];
    if (treatment.contraindicated_conditions) {
      for (var _i = 0, _d = treatment.contraindicated_conditions; _i < _d.length; _i++) {
        var condition = _d[_i];
        if (medicalConditions.includes(condition)) {
          contraindications.push("Contraindicated with ".concat(condition));
        }
      }
    }
    // Medication contraindications
    var medications =
      ((_b = patientData.medications) === null || _b === void 0
        ? void 0
        : _b.map(function (m) {
            return m.medication_name.toLowerCase();
          })) || [];
    if (treatment.contraindicated_medications) {
      var _loop_1 = function (medication) {
        if (
          medications.some(function (m) {
            return m.includes(medication.toLowerCase());
          })
        ) {
          contraindications.push("Contraindicated with ".concat(medication));
        }
      };
      for (var _e = 0, _f = treatment.contraindicated_medications; _e < _f.length; _e++) {
        var medication = _f[_e];
        _loop_1(medication);
      }
    }
    // Allergy contraindications
    var allergens =
      ((_c = patientData.allergies) === null || _c === void 0
        ? void 0
        : _c.map(function (a) {
            return a.allergen.toLowerCase();
          })) || [];
    if (treatment.potential_allergens) {
      for (var _g = 0, _h = treatment.potential_allergens; _g < _h.length; _g++) {
        var allergen = _h[_g];
        if (allergens.includes(allergen.toLowerCase())) {
          contraindications.push("Allergy to ".concat(allergen));
        }
      }
    }
    // Critical risk factor contraindications
    var criticalRisks = riskAssessment.riskFactors.filter(function (rf) {
      return rf.severity === "critical";
    });
    if (criticalRisks.length > 0 && treatment.invasiveness === "high") {
      contraindications.push("Critical risk factors present for invasive procedure");
    }
    return contraindications;
  };
  TreatmentRecommendationEngine.prototype.getEvidenceLevel = function (treatment, treatmentGoal) {
    var evidence =
      this.evidenceDatabase.get(treatment.id) || this.evidenceDatabase.get(treatment.category);
    if (!evidence) return "weak";
    // Check for goal-specific evidence
    if (treatmentGoal && evidence.goalSpecificStudies[treatmentGoal]) {
      return evidence.goalSpecificStudies[treatmentGoal].evidenceLevel;
    }
    return evidence.overallEvidenceLevel;
  };
  TreatmentRecommendationEngine.prototype.calculateEstimatedCost = function (
    treatment,
    patientData,
  ) {
    var _a;
    var baseCost = treatment.base_cost || 0;
    // Adjust for complexity factors
    var age = this.calculateAge(patientData.date_of_birth);
    if (age > 65) baseCost *= 1.2; // 20% increase for elderly patients
    // Adjust for medical conditions that may complicate treatment
    var complicatingConditions =
      ((_a = patientData.medical_history) === null || _a === void 0
        ? void 0
        : _a.filter(function (mh) {
            return ["diabetes", "heart_disease", "kidney_disease"].includes(mh.condition_type);
          })) || [];
    baseCost *= 1 + complicatingConditions.length * 0.1;
    return Math.round(baseCost);
  };
  TreatmentRecommendationEngine.prototype.calculateEstimatedDuration = function (
    treatment,
    patientData,
  ) {
    var _a;
    var baseDuration = treatment.typical_duration || 30; // minutes
    // Adjust for patient factors
    var age = this.calculateAge(patientData.date_of_birth);
    if (age > 65) baseDuration *= 1.3;
    // Adjust for complexity
    var medicalConditions =
      ((_a = patientData.medical_history) === null || _a === void 0 ? void 0 : _a.length) || 0;
    baseDuration *= 1 + medicalConditions * 0.05;
    if (baseDuration < 60) {
      return "".concat(Math.round(baseDuration), " minutes");
    } else if (baseDuration < 120) {
      return "".concat(Math.round((baseDuration / 60) * 10) / 10, " hours");
    } else {
      return "".concat(Math.round(baseDuration / 60), " hours");
    }
  };
  TreatmentRecommendationEngine.prototype.getPrerequisites = function (treatment, patientData) {
    var _a, _b;
    var prerequisites = [];
    // Standard prerequisites from treatment definition
    if (treatment.prerequisites) {
      prerequisites.push.apply(prerequisites, treatment.prerequisites);
    }
    // Age-based prerequisites
    var age = this.calculateAge(patientData.date_of_birth);
    if (age > 65) {
      prerequisites.push("Cardiac clearance");
      prerequisites.push("Extended pre-operative assessment");
    }
    // Medical condition-based prerequisites
    var medicalConditions =
      ((_a = patientData.medical_history) === null || _a === void 0
        ? void 0
        : _a.map(function (mh) {
            return mh.condition_type;
          })) || [];
    if (medicalConditions.includes("diabetes")) {
      prerequisites.push("Blood glucose optimization");
    }
    if (medicalConditions.includes("hypertension")) {
      prerequisites.push("Blood pressure control");
    }
    if (medicalConditions.includes("heart_disease")) {
      prerequisites.push("Cardiologist clearance");
    }
    // Medication-based prerequisites
    var medications =
      ((_b = patientData.medications) === null || _b === void 0
        ? void 0
        : _b.map(function (m) {
            return m.medication_name.toLowerCase();
          })) || [];
    if (
      medications.some(function (m) {
        return m.includes("warfarin") || m.includes("anticoagulant");
      })
    ) {
      prerequisites.push("Anticoagulation management");
    }
    return __spreadArray([], new Set(prerequisites), true); // Remove duplicates
  };
  TreatmentRecommendationEngine.prototype.getExpectedOutcome = function (
    treatment,
    successProbability,
  ) {
    var baseOutcome = treatment.expected_outcome || "Improvement in treated area";
    if (successProbability > 0.8) {
      return "Excellent ".concat(baseOutcome.toLowerCase());
    } else if (successProbability > 0.6) {
      return "Good ".concat(baseOutcome.toLowerCase());
    } else {
      return "Moderate ".concat(baseOutcome.toLowerCase());
    }
  };
  TreatmentRecommendationEngine.prototype.generateRecommendationReasoning = function (
    treatment,
    successProbability,
    riskLevel,
    evidenceLevel,
  ) {
    var reasons = [];
    // Success probability reasoning
    if (successProbability > 0.8) {
      reasons.push("High success probability based on patient profile");
    } else if (successProbability > 0.6) {
      reasons.push("Good success probability with current patient factors");
    } else {
      reasons.push("Moderate success probability due to risk factors");
    }
    // Risk level reasoning
    if (riskLevel === "low") {
      reasons.push("Low risk profile for this treatment");
    } else if (riskLevel === "medium") {
      reasons.push("Moderate risk requiring standard precautions");
    } else {
      reasons.push("Higher risk requiring careful monitoring");
    }
    // Evidence level reasoning
    if (evidenceLevel === "very_strong" || evidenceLevel === "strong") {
      reasons.push("Strong clinical evidence supports this treatment");
    } else if (evidenceLevel === "moderate") {
      reasons.push("Moderate evidence base for this indication");
    } else {
      reasons.push("Limited evidence available for this specific case");
    }
    return reasons.join(". ") + ".";
  };
  TreatmentRecommendationEngine.prototype.rankRecommendations = function (recommendations) {
    return recommendations.sort(function (a, b) {
      // Primary sort by category (primary > alternative > contraindicated)
      var categoryWeight = { primary: 3, alternative: 2, contraindicated: 1 };
      var categoryDiff = categoryWeight[b.category] - categoryWeight[a.category];
      if (categoryDiff !== 0) return categoryDiff;
      // Secondary sort by success probability
      var successDiff = b.successProbability - a.successProbability;
      if (Math.abs(successDiff) > 0.1) return successDiff;
      // Tertiary sort by risk level (lower risk first)
      var riskWeight = { low: 3, medium: 2, high: 1 };
      var riskDiff = riskWeight[b.riskLevel] - riskWeight[a.riskLevel];
      if (riskDiff !== 0) return riskDiff;
      // Final sort by evidence level
      var evidenceWeight = { very_strong: 4, strong: 3, moderate: 2, weak: 1 };
      return evidenceWeight[b.evidenceLevel] - evidenceWeight[a.evidenceLevel];
    });
  };
  TreatmentRecommendationEngine.prototype.filterContraindications = function (
    recommendations,
    riskAssessment,
  ) {
    // Filter out contraindicated treatments unless specifically requested
    return recommendations.filter(function (rec) {
      return rec.category !== "contraindicated";
    });
  };
  TreatmentRecommendationEngine.prototype.calculateAge = function (birthDate) {
    var today = new Date();
    var birth = new Date(birthDate);
    var age = today.getFullYear() - birth.getFullYear();
    var monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };
  TreatmentRecommendationEngine.prototype.initializeEvidenceDatabase = function () {
    // Initialize with common aesthetic treatments evidence
    this.evidenceDatabase.set("botox", {
      overallEvidenceLevel: "very_strong",
      goalSpecificStudies: {
        wrinkle_reduction: { evidenceLevel: "very_strong", studyCount: 200 },
        migraine_treatment: { evidenceLevel: "strong", studyCount: 50 },
        hyperhidrosis: { evidenceLevel: "strong", studyCount: 30 },
      },
    });
    this.evidenceDatabase.set("dermal_fillers", {
      overallEvidenceLevel: "strong",
      goalSpecificStudies: {
        volume_restoration: { evidenceLevel: "strong", studyCount: 150 },
        lip_enhancement: { evidenceLevel: "moderate", studyCount: 80 },
        scar_treatment: { evidenceLevel: "moderate", studyCount: 40 },
      },
    });
    this.evidenceDatabase.set("laser_therapy", {
      overallEvidenceLevel: "strong",
      goalSpecificStudies: {
        hair_removal: { evidenceLevel: "very_strong", studyCount: 300 },
        skin_resurfacing: { evidenceLevel: "strong", studyCount: 120 },
        pigmentation: { evidenceLevel: "moderate", studyCount: 60 },
      },
    });
    this.evidenceDatabase.set("chemical_peels", {
      overallEvidenceLevel: "moderate",
      goalSpecificStudies: {
        acne_treatment: { evidenceLevel: "strong", studyCount: 100 },
        anti_aging: { evidenceLevel: "moderate", studyCount: 70 },
        melasma: { evidenceLevel: "moderate", studyCount: 30 },
      },
    });
  };
  return TreatmentRecommendationEngine;
})();
exports.TreatmentRecommendationEngine = TreatmentRecommendationEngine;
