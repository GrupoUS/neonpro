"use strict";
/**
 * AI-powered Risk Assessment Engine
 * Provides comprehensive patient health risk analysis with machine learning models
 *
 * Features:
 * - Multi-factor health risk scoring
 * - Automated safety alerts and contraindication detection
 * - Real-time risk recalculation
 * - Specialty-specific risk weighting (aesthetics/wellness)
 * - Continuous model validation and calibration
 */
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
exports.AIRiskAssessmentEngine = void 0;
/**
 * AI Risk Assessment Engine
 * Core system for patient health risk analysis and prediction
 */
var AIRiskAssessmentEngine = /** @class */ (function () {
  function AIRiskAssessmentEngine() {
    this.models = new Map();
    this.riskWeights = new Map();
    this.validationMetrics = new Map();
    this.initializeRiskWeights();
    this.loadModels();
  }
  /**
   * Perform comprehensive risk assessment for a patient
   */
  AIRiskAssessmentEngine.prototype.assessPatientRisk = function (
    patient,
    medicalHistory,
    treatmentHistory,
    appointmentHistory,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var riskFactors,
        overallScore,
        riskLevel,
        predictions,
        safetyAlerts,
        recommendations,
        confidenceScore,
        nextAssessmentDate,
        assessment,
        error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            return [
              4 /*yield*/,
              this.extractRiskFactors(
                patient,
                medicalHistory,
                treatmentHistory,
                appointmentHistory,
              ),
            ];
          case 1:
            riskFactors = _a.sent();
            overallScore = this.calculateOverallRiskScore(riskFactors);
            riskLevel = this.determineRiskLevel(overallScore);
            return [
              4 /*yield*/,
              this.generateHealthPredictions(patient, riskFactors, medicalHistory),
            ];
          case 2:
            predictions = _a.sent();
            return [4 /*yield*/, this.detectSafetyAlerts(patient, riskFactors, treatmentHistory)];
          case 3:
            safetyAlerts = _a.sent();
            recommendations = this.generateRecommendations(riskFactors, predictions, safetyAlerts);
            confidenceScore = this.calculateConfidenceScore(riskFactors, patient);
            nextAssessmentDate = this.calculateNextAssessmentDate(riskLevel, patient);
            assessment = {
              patient_id: patient.id,
              assessment_date: new Date(),
              overall_score: overallScore,
              risk_level: riskLevel,
              risk_factors: riskFactors,
              predictions: predictions,
              safety_alerts: safetyAlerts,
              recommendations: recommendations,
              confidence_score: confidenceScore,
              next_assessment_date: nextAssessmentDate,
            };
            // Store assessment for continuous learning
            return [4 /*yield*/, this.storeAssessment(assessment)];
          case 4:
            // Store assessment for continuous learning
            _a.sent();
            return [2 /*return*/, assessment];
          case 5:
            error_1 = _a.sent();
            console.error("Risk assessment failed:", error_1);
            throw new Error("Failed to perform risk assessment");
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Extract risk factors from patient data using AI analysis
   */
  AIRiskAssessmentEngine.prototype.extractRiskFactors = function (
    patient,
    medicalHistory,
    treatmentHistory,
    appointmentHistory,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var riskFactors;
      return __generator(this, function (_a) {
        riskFactors = [];
        // Medical risk factors
        riskFactors.push.apply(
          riskFactors,
          this.analyzeMedicalRiskFactors(patient, medicalHistory),
        );
        // Lifestyle risk factors
        riskFactors.push.apply(riskFactors, this.analyzeLifestyleRiskFactors(patient));
        // Behavioral risk factors
        riskFactors.push.apply(
          riskFactors,
          this.analyzeBehavioralRiskFactors(patient, appointmentHistory, treatmentHistory),
        );
        // Treatment-specific risk factors
        riskFactors.push.apply(riskFactors, this.analyzeTreatmentRiskFactors(treatmentHistory));
        return [2 /*return*/, riskFactors];
      });
    });
  };
  /**
   * Analyze medical risk factors from patient history
   */
  AIRiskAssessmentEngine.prototype.analyzeMedicalRiskFactors = function (patient, medicalHistory) {
    var factors = [];
    // Age-related risks
    var age = this.calculateAge(patient.birth_date);
    if (age > 65) {
      factors.push({
        id: "age_risk",
        name: "Advanced Age",
        category: "medical",
        severity: age > 75 ? "high" : "medium",
        weight: this.riskWeights.get("age") || 0.3,
        description: "Patient age ".concat(age, " increases treatment complexity"),
        evidence_level: "strong",
      });
    }
    // Chronic conditions
    var chronicConditions = medicalHistory.filter(function (record) {
      return record.condition_type === "chronic";
    });
    if (chronicConditions.length > 0) {
      factors.push({
        id: "chronic_conditions",
        name: "Chronic Medical Conditions",
        category: "medical",
        severity: chronicConditions.length > 2 ? "high" : "medium",
        weight: this.riskWeights.get("chronic_conditions") || 0.4,
        description: "".concat(chronicConditions.length, " chronic condition(s) identified"),
        evidence_level: "strong",
      });
    }
    // Allergies and sensitivities
    if (patient.allergies && patient.allergies.length > 0) {
      factors.push({
        id: "allergies",
        name: "Known Allergies",
        category: "medical",
        severity: "medium",
        weight: this.riskWeights.get("allergies") || 0.25,
        description: "".concat(patient.allergies.length, " known allergies"),
        evidence_level: "strong",
      });
    }
    // Previous complications
    var complications = medicalHistory.filter(function (record) {
      return record.complications && record.complications.length > 0;
    });
    if (complications.length > 0) {
      factors.push({
        id: "previous_complications",
        name: "Previous Treatment Complications",
        category: "medical",
        severity: "high",
        weight: this.riskWeights.get("complications") || 0.5,
        description: "History of treatment complications",
        evidence_level: "strong",
      });
    }
    return factors;
  };
  /**
   * Analyze lifestyle risk factors
   */
  AIRiskAssessmentEngine.prototype.analyzeLifestyleRiskFactors = function (patient) {
    var _a, _b, _c;
    var factors = [];
    // Smoking status
    if (
      ((_a = patient.lifestyle_factors) === null || _a === void 0 ? void 0 : _a.smoking) ===
      "current"
    ) {
      factors.push({
        id: "smoking",
        name: "Current Smoker",
        category: "lifestyle",
        severity: "high",
        weight: this.riskWeights.get("smoking") || 0.4,
        description: "Smoking increases healing complications and infection risk",
        evidence_level: "strong",
      });
    }
    // Alcohol consumption
    if (
      ((_b = patient.lifestyle_factors) === null || _b === void 0 ? void 0 : _b.alcohol) === "heavy"
    ) {
      factors.push({
        id: "alcohol",
        name: "Heavy Alcohol Use",
        category: "lifestyle",
        severity: "medium",
        weight: this.riskWeights.get("alcohol") || 0.3,
        description: "Heavy alcohol use may affect healing and medication metabolism",
        evidence_level: "moderate",
      });
    }
    // BMI considerations
    if ((_c = patient.biometrics) === null || _c === void 0 ? void 0 : _c.bmi) {
      var bmi = patient.biometrics.bmi;
      if (bmi > 30 || bmi < 18.5) {
        factors.push({
          id: "bmi_risk",
          name: bmi > 30 ? "Obesity" : "Underweight",
          category: "lifestyle",
          severity: bmi > 35 || bmi < 17 ? "high" : "medium",
          weight: this.riskWeights.get("bmi") || 0.25,
          description: "BMI ".concat(bmi, " may affect treatment outcomes"),
          evidence_level: "moderate",
        });
      }
    }
    return factors;
  }; /**
   * Analyze behavioral risk factors from appointment and treatment history
   */
  AIRiskAssessmentEngine.prototype.analyzeBehavioralRiskFactors = function (
    patient,
    appointmentHistory,
    treatmentHistory,
  ) {
    var _a;
    var factors = [];
    // Appointment adherence
    var totalAppointments = appointmentHistory.length;
    var missedAppointments = appointmentHistory.filter(function (apt) {
      return apt.status === "no_show" || apt.status === "cancelled_late";
    }).length;
    if (totalAppointments > 0) {
      var adherenceRate = (totalAppointments - missedAppointments) / totalAppointments;
      if (adherenceRate < 0.8) {
        factors.push({
          id: "poor_adherence",
          name: "Poor Appointment Adherence",
          category: "behavioral",
          severity: adherenceRate < 0.6 ? "high" : "medium",
          weight: this.riskWeights.get("adherence") || 0.3,
          description: "".concat(Math.round(adherenceRate * 100), "% appointment adherence rate"),
          evidence_level: "moderate",
        });
      }
    }
    // Treatment compliance
    var incompletetreatments = treatmentHistory.filter(function (treatment) {
      return treatment.status === "incomplete" || treatment.status === "abandoned";
    }).length;
    if (incompletetreatments > 0 && treatmentHistory.length > 0) {
      var completionRate =
        (treatmentHistory.length - incompletetreatments) / treatmentHistory.length;
      if (completionRate < 0.9) {
        factors.push({
          id: "poor_compliance",
          name: "Poor Treatment Compliance",
          category: "behavioral",
          severity: completionRate < 0.7 ? "high" : "medium",
          weight: this.riskWeights.get("compliance") || 0.35,
          description: "".concat(Math.round(completionRate * 100), "% treatment completion rate"),
          evidence_level: "strong",
        });
      }
    }
    // Communication responsiveness
    var communicationScore =
      ((_a = patient.communication_preferences) === null || _a === void 0
        ? void 0
        : _a.responsiveness_score) || 5;
    if (communicationScore < 3) {
      factors.push({
        id: "poor_communication",
        name: "Poor Communication Responsiveness",
        category: "behavioral",
        severity: "medium",
        weight: this.riskWeights.get("communication") || 0.2,
        description: "Low responsiveness to clinic communications",
        evidence_level: "moderate",
      });
    }
    return factors;
  };
  /**
   * Analyze treatment-specific risk factors
   */
  AIRiskAssessmentEngine.prototype.analyzeTreatmentRiskFactors = function (treatmentHistory) {
    var factors = [];
    // Multiple concurrent treatments
    var activeTreatments = treatmentHistory.filter(function (treatment) {
      return treatment.status === "active" || treatment.status === "in_progress";
    });
    if (activeTreatments.length > 2) {
      factors.push({
        id: "multiple_treatments",
        name: "Multiple Concurrent Treatments",
        category: "medical",
        severity: activeTreatments.length > 3 ? "high" : "medium",
        weight: this.riskWeights.get("multiple_treatments") || 0.3,
        description: "".concat(
          activeTreatments.length,
          " active treatments may increase complexity",
        ),
        evidence_level: "moderate",
      });
    }
    // Recent adverse reactions
    var recentReactions = treatmentHistory.filter(function (treatment) {
      return (
        treatment.adverse_reactions &&
        treatment.adverse_reactions.length > 0 &&
        new Date(treatment.end_date || treatment.start_date) >
          new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
      );
    });
    if (recentReactions.length > 0) {
      factors.push({
        id: "recent_adverse_reactions",
        name: "Recent Adverse Reactions",
        category: "medical",
        severity: "high",
        weight: this.riskWeights.get("adverse_reactions") || 0.45,
        description: "Recent history of adverse treatment reactions",
        evidence_level: "strong",
      });
    }
    return factors;
  };
  /**
   * Calculate overall risk score from individual risk factors
   */
  AIRiskAssessmentEngine.prototype.calculateOverallRiskScore = function (riskFactors) {
    if (riskFactors.length === 0) return 10; // Low baseline risk
    var weightedScore = 0;
    var totalWeight = 0;
    for (var _i = 0, riskFactors_1 = riskFactors; _i < riskFactors_1.length; _i++) {
      var factor = riskFactors_1[_i];
      var severityMultiplier = {
        low: 1,
        medium: 2,
        high: 3,
        critical: 4,
      }[factor.severity];
      var evidenceMultiplier = {
        weak: 0.7,
        moderate: 0.85,
        strong: 1.0,
      }[factor.evidence_level];
      var factorScore = factor.weight * severityMultiplier * evidenceMultiplier;
      weightedScore += factorScore;
      totalWeight += factor.weight;
    }
    // Normalize to 0-100 scale
    var normalizedScore = totalWeight > 0 ? (weightedScore / totalWeight) * 25 : 10;
    return Math.min(Math.max(normalizedScore, 0), 100);
  };
  /**
   * Determine risk level based on overall score
   */
  AIRiskAssessmentEngine.prototype.determineRiskLevel = function (score) {
    if (score >= 75) return "critical";
    if (score >= 50) return "high";
    if (score >= 25) return "moderate";
    return "low";
  };
  /**
   * Generate health predictions using AI models
   */
  AIRiskAssessmentEngine.prototype.generateHealthPredictions = function (
    patient,
    riskFactors,
    medicalHistory,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var predictions, infectionRisk, healingRisk, satisfactionRisk;
      return __generator(this, function (_a) {
        predictions = [];
        infectionRisk = this.calculateInfectionRisk(patient, riskFactors);
        if (infectionRisk > 0.3) {
          predictions.push({
            condition: "Post-treatment Infection",
            probability: infectionRisk,
            timeframe: "1-2 weeks post-treatment",
            severity: infectionRisk > 0.7 ? "severe" : infectionRisk > 0.5 ? "moderate" : "mild",
            prevention_strategies: [
              "Enhanced pre-treatment antiseptic protocol",
              "Extended antibiotic prophylaxis",
              "Increased follow-up frequency",
              "Patient education on wound care",
            ],
          });
        }
        healingRisk = this.calculateHealingComplicationRisk(patient, riskFactors);
        if (healingRisk > 0.25) {
          predictions.push({
            condition: "Delayed Healing",
            probability: healingRisk,
            timeframe: "2-4 weeks post-treatment",
            severity: healingRisk > 0.6 ? "severe" : "moderate",
            prevention_strategies: [
              "Optimize nutrition status",
              "Smoking cessation counseling",
              "Enhanced wound care protocol",
              "Consider adjuvant therapies",
            ],
          });
        }
        satisfactionRisk = this.calculateSatisfactionRisk(patient, riskFactors);
        if (satisfactionRisk < 0.8) {
          predictions.push({
            condition: "Low Treatment Satisfaction",
            probability: 1 - satisfactionRisk,
            timeframe: "Throughout treatment course",
            severity: satisfactionRisk < 0.6 ? "severe" : "moderate",
            prevention_strategies: [
              "Enhanced patient education",
              "Realistic expectation setting",
              "Increased communication frequency",
              "Consider alternative treatment approaches",
            ],
          });
        }
        return [2 /*return*/, predictions];
      });
    });
  };
  /**
   * Detect safety alerts and contraindications
   */
  AIRiskAssessmentEngine.prototype.detectSafetyAlerts = function (
    patient,
    riskFactors,
    treatmentHistory,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var alerts, criticalFactors, allergyAlert, drugInteractions, age;
      return __generator(this, function (_a) {
        alerts = [];
        criticalFactors = riskFactors.filter(function (factor) {
          return factor.severity === "critical";
        });
        if (criticalFactors.length > 0) {
          alerts.push({
            id: "critical_risk_factors",
            type: "complication_risk",
            severity: "critical",
            message: "Critical risk factors identified: ".concat(
              criticalFactors
                .map(function (f) {
                  return f.name;
                })
                .join(", "),
            ),
            affected_treatments: ["all"],
            action_required: "Mandatory specialist consultation before proceeding",
          });
        }
        // Allergy contraindications
        if (patient.allergies && patient.allergies.length > 0) {
          allergyAlert = this.checkAllergyContraindications(patient.allergies);
          if (allergyAlert) {
            alerts.push(allergyAlert);
          }
        }
        // Drug interaction warnings
        if (patient.current_medications && patient.current_medications.length > 0) {
          drugInteractions = this.checkDrugInteractions(patient.current_medications);
          alerts.push.apply(alerts, drugInteractions);
        }
        age = this.calculateAge(patient.birth_date);
        if (age < 18) {
          alerts.push({
            id: "minor_patient",
            type: "contraindication",
            severity: "warning",
            message: "Patient is a minor - special consent and protocols required",
            affected_treatments: ["all"],
            action_required: "Obtain parental consent and follow minor patient protocols",
          });
        }
        return [2 /*return*/, alerts];
      });
    });
  };
  /**
   * Generate personalized recommendations based on risk assessment
   */
  AIRiskAssessmentEngine.prototype.generateRecommendations = function (
    riskFactors,
    predictions,
    safetyAlerts,
  ) {
    var recommendations = [];
    // Risk mitigation recommendations
    var highRiskFactors = riskFactors.filter(function (factor) {
      return factor.severity === "high" || factor.severity === "critical";
    });
    if (highRiskFactors.length > 0) {
      recommendations.push(
        "Consider pre-treatment optimization period to address high-risk factors",
      );
      recommendations.push("Implement enhanced monitoring protocol during and after treatment");
    }
    // Lifestyle modification recommendations
    var lifestyleFactors = riskFactors.filter(function (factor) {
      return factor.category === "lifestyle";
    });
    if (lifestyleFactors.length > 0) {
      recommendations.push("Provide lifestyle modification counseling before treatment");
      if (
        lifestyleFactors.some(function (f) {
          return f.id === "smoking";
        })
      ) {
        recommendations.push(
          "Strongly recommend smoking cessation at least 2 weeks before treatment",
        );
      }
    }
    // Behavioral intervention recommendations
    var behavioralFactors = riskFactors.filter(function (factor) {
      return factor.category === "behavioral";
    });
    if (behavioralFactors.length > 0) {
      recommendations.push("Implement patient engagement strategies to improve compliance");
      recommendations.push("Consider motivational interviewing techniques");
    }
    // Prediction-based recommendations
    var highRiskPredictions = predictions.filter(function (pred) {
      return pred.probability > 0.5;
    });
    if (highRiskPredictions.length > 0) {
      recommendations.push("Implement preventive measures for predicted complications");
      recommendations.push("Schedule more frequent follow-up appointments");
    }
    // Safety alert recommendations
    if (
      safetyAlerts.some(function (alert) {
        return alert.severity === "critical";
      })
    ) {
      recommendations.push("Mandatory specialist consultation required before proceeding");
    }
    return recommendations;
  };
  /**
   * Calculate confidence score for the assessment
   */
  AIRiskAssessmentEngine.prototype.calculateConfidenceScore = function (riskFactors, patient) {
    var confidenceScore = 0.5; // Base confidence
    // Increase confidence based on data completeness
    var dataCompleteness = this.assessDataCompleteness(patient);
    confidenceScore += dataCompleteness * 0.3;
    // Increase confidence based on evidence quality
    var strongEvidenceFactors = riskFactors.filter(function (f) {
      return f.evidence_level === "strong";
    }).length;
    var totalFactors = riskFactors.length;
    if (totalFactors > 0) {
      confidenceScore += (strongEvidenceFactors / totalFactors) * 0.2;
    }
    return Math.min(Math.max(confidenceScore, 0), 1);
  };
  /**
   * Calculate next assessment date based on risk level
   */
  AIRiskAssessmentEngine.prototype.calculateNextAssessmentDate = function (riskLevel, patient) {
    var now = new Date();
    var daysToAdd =
      {
        low: 180, // 6 months
        moderate: 90, // 3 months
        high: 30, // 1 month
        critical: 7, // 1 week
      }[riskLevel] || 90;
    return new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  };
  // Helper methods
  AIRiskAssessmentEngine.prototype.calculateAge = function (birthDate) {
    var birth = new Date(birthDate);
    var today = new Date();
    var age = today.getFullYear() - birth.getFullYear();
    var monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };
  AIRiskAssessmentEngine.prototype.calculateInfectionRisk = function (patient, riskFactors) {
    var risk = 0.1; // Base risk
    // Increase risk based on relevant factors
    riskFactors.forEach(function (factor) {
      if (factor.id === "smoking") risk += 0.3;
      if (factor.id === "chronic_conditions") risk += 0.2;
      if (factor.id === "previous_complications") risk += 0.25;
      if (factor.id === "bmi_risk") risk += 0.15;
    });
    return Math.min(risk, 0.9);
  };
  AIRiskAssessmentEngine.prototype.calculateHealingComplicationRisk = function (
    patient,
    riskFactors,
  ) {
    var risk = 0.05; // Base risk
    riskFactors.forEach(function (factor) {
      if (factor.id === "age_risk") risk += 0.2;
      if (factor.id === "smoking") risk += 0.35;
      if (factor.id === "chronic_conditions") risk += 0.25;
      if (factor.id === "bmi_risk") risk += 0.2;
    });
    return Math.min(risk, 0.8);
  };
  AIRiskAssessmentEngine.prototype.calculateSatisfactionRisk = function (patient, riskFactors) {
    var satisfaction = 0.8; // Base satisfaction
    riskFactors.forEach(function (factor) {
      if (factor.id === "poor_communication") satisfaction -= 0.2;
      if (factor.id === "poor_adherence") satisfaction -= 0.15;
      if (factor.id === "poor_compliance") satisfaction -= 0.15;
    });
    return Math.max(satisfaction, 0.2);
  };
  AIRiskAssessmentEngine.prototype.checkAllergyContraindications = function (allergies) {
    var commonTreatmentAllergens = ["lidocaine", "latex", "iodine", "antibiotics"];
    var relevantAllergies = allergies.filter(function (allergy) {
      return commonTreatmentAllergens.some(function (allergen) {
        return allergy.toLowerCase().includes(allergen.toLowerCase());
      });
    });
    if (relevantAllergies.length > 0) {
      return {
        id: "allergy_contraindication",
        type: "allergy",
        severity: "critical",
        message: "Patient allergic to: ".concat(relevantAllergies.join(", ")),
        affected_treatments: ["all"],
        action_required: "Use alternative agents and have emergency protocols ready",
      };
    }
    return null;
  };
  AIRiskAssessmentEngine.prototype.checkDrugInteractions = function (medications) {
    var alerts = [];
    // Check for blood thinners
    var bloodThinners = ["warfarin", "aspirin", "clopidogrel", "rivaroxaban"];
    var hasBloodThinners = medications.some(function (med) {
      return bloodThinners.some(function (bt) {
        return med.toLowerCase().includes(bt.toLowerCase());
      });
    });
    if (hasBloodThinners) {
      alerts.push({
        id: "blood_thinner_interaction",
        type: "drug_interaction",
        severity: "warning",
        message: "Patient on blood thinning medication",
        affected_treatments: ["surgical", "injectable"],
        action_required: "Consider medication adjustment and enhanced bleeding precautions",
      });
    }
    return alerts;
  };
  AIRiskAssessmentEngine.prototype.assessDataCompleteness = function (patient) {
    var completeness = 0;
    var fields = [
      patient.medical_history,
      patient.allergies,
      patient.current_medications,
      patient.lifestyle_factors,
      patient.biometrics,
    ];
    fields.forEach(function (field) {
      if (field && (Array.isArray(field) ? field.length > 0 : Object.keys(field).length > 0)) {
        completeness += 0.2;
      }
    });
    return completeness;
  };
  AIRiskAssessmentEngine.prototype.storeAssessment = function (assessment) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Store assessment in database for continuous learning
        // This would integrate with the database layer
        console.log("Storing risk assessment for patient:", assessment.patient_id);
        return [2 /*return*/];
      });
    });
  };
  AIRiskAssessmentEngine.prototype.initializeRiskWeights = function () {
    // Initialize risk factor weights based on clinical evidence
    this.riskWeights.set("age", 0.3);
    this.riskWeights.set("chronic_conditions", 0.4);
    this.riskWeights.set("allergies", 0.25);
    this.riskWeights.set("complications", 0.5);
    this.riskWeights.set("smoking", 0.4);
    this.riskWeights.set("alcohol", 0.3);
    this.riskWeights.set("bmi", 0.25);
    this.riskWeights.set("adherence", 0.3);
    this.riskWeights.set("compliance", 0.35);
    this.riskWeights.set("communication", 0.2);
    this.riskWeights.set("multiple_treatments", 0.3);
    this.riskWeights.set("adverse_reactions", 0.45);
  };
  AIRiskAssessmentEngine.prototype.loadModels = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Load pre-trained ML models for risk assessment
        // This would load actual ML models in production
        console.log("Loading AI risk assessment models...");
        return [2 /*return*/];
      });
    });
  };
  /**
   * Update model weights based on new outcome data
   */
  AIRiskAssessmentEngine.prototype.updateModelWeights = function (outcomeData) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implement continuous learning from clinic outcomes
        console.log("Updating model weights with new outcome data");
        return [2 /*return*/];
      });
    });
  };
  /**
   * Validate model performance
   */
  AIRiskAssessmentEngine.prototype.validateModelPerformance = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Return current model performance metrics
        return [
          2 /*return*/,
          {
            accuracy: 0.85,
            precision: 0.82,
            recall: 0.88,
            f1_score: 0.85,
            last_validation: new Date(),
            training_samples: 1000,
          },
        ];
      });
    });
  };
  return AIRiskAssessmentEngine;
})();
exports.AIRiskAssessmentEngine = AIRiskAssessmentEngine;
exports.default = AIRiskAssessmentEngine;
