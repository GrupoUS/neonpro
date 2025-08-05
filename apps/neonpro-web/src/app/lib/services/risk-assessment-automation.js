/**
 * Risk Assessment Automation Service
 * Story 9.4: Comprehensive automated risk assessment with medical validation
 *
 * This service provides comprehensive risk assessment automation with medical validation,
 * including automated risk scoring, human-in-the-loop medical oversight, risk mitigation
 * strategies, and real-time alert management.
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
exports.RiskAssessmentService = void 0;
var server_1 = require("@/lib/supabase/server");
var RiskAssessmentService = /** @class */ (() => {
  function RiskAssessmentService() {}
  RiskAssessmentService.prototype.getSupabase = function () {
    return __awaiter(this, void 0, void 0, function () {
      var supabase;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _a.sent();
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 2:
            return [2 /*return*/, _a.sent()];
        }
      });
    });
  };
  /**
   * Risk Assessment Engine
   */
  // Calculate comprehensive risk score
  RiskAssessmentService.prototype.calculateRiskScore = (factors, context) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    var totalScore = 0;
    var factorCount = 0;
    // Medical risk scoring (weight: 0.4)
    if (factors.medical) {
      var medicalScore = 0;
      if (
        (_a = factors.medical.chronic_conditions) === null || _a === void 0 ? void 0 : _a.length
      ) {
        medicalScore += Math.min(factors.medical.chronic_conditions.length * 10, 40);
      }
      if ((_b = factors.medical.allergies) === null || _b === void 0 ? void 0 : _b.length) {
        medicalScore += Math.min(factors.medical.allergies.length * 5, 20);
      }
      if ((_c = factors.medical.contraindications) === null || _c === void 0 ? void 0 : _c.length) {
        medicalScore += Math.min(factors.medical.contraindications.length * 15, 50);
      }
      if (
        (_d = factors.medical.previous_complications) === null || _d === void 0 ? void 0 : _d.length
      ) {
        medicalScore += Math.min(factors.medical.previous_complications.length * 8, 30);
      }
      totalScore += Math.min(medicalScore, 100) * 0.4;
      factorCount++;
    }
    // Procedural risk scoring (weight: 0.3)
    if (factors.procedural) {
      var proceduralScore = 0;
      if (factors.procedural.procedure_complexity) {
        proceduralScore += factors.procedural.procedure_complexity * 8;
      }
      if (factors.procedural.anesthesia_risk) {
        proceduralScore += factors.procedural.anesthesia_risk * 10;
      }
      if (
        (_e = factors.procedural.equipment_factors) === null || _e === void 0 ? void 0 : _e.length
      ) {
        proceduralScore += Math.min(factors.procedural.equipment_factors.length * 5, 25);
      }
      if (
        (_f = factors.procedural.technique_risks) === null || _f === void 0 ? void 0 : _f.length
      ) {
        proceduralScore += Math.min(factors.procedural.technique_risks.length * 7, 35);
      }
      totalScore += Math.min(proceduralScore, 100) * 0.3;
      factorCount++;
    }
    // Patient-specific risk scoring (weight: 0.2)
    if (factors.patient_specific) {
      var patientScore = 0;
      if (factors.patient_specific.age_factor) {
        patientScore += factors.patient_specific.age_factor * 6;
      }
      if (factors.patient_specific.bmi_factor) {
        patientScore += factors.patient_specific.bmi_factor * 5;
      }
      if (factors.patient_specific.smoking_status) {
        patientScore += 15;
      }
      if (factors.patient_specific.pregnancy_status) {
        patientScore += 20;
      }
      if (
        (_g = factors.patient_specific.mobility_limitations) === null || _g === void 0
          ? void 0
          : _g.length
      ) {
        patientScore += Math.min(factors.patient_specific.mobility_limitations.length * 8, 25);
      }
      totalScore += Math.min(patientScore, 100) * 0.2;
      factorCount++;
    }
    // Environmental risk scoring (weight: 0.1)
    if (factors.environmental) {
      var environmentalScore = 0;
      if (factors.environmental.staff_experience) {
        environmentalScore += (10 - factors.environmental.staff_experience) * 8;
      }
      if (factors.environmental.emergency_preparedness) {
        environmentalScore += (10 - factors.environmental.emergency_preparedness) * 10;
      }
      if (
        (_h = factors.environmental.equipment_status) === null || _h === void 0 ? void 0 : _h.length
      ) {
        environmentalScore += Math.min(factors.environmental.equipment_status.length * 10, 30);
      }
      totalScore += Math.min(environmentalScore, 100) * 0.1;
      factorCount++;
    }
    // Context adjustments
    if (context.emergency_type) {
      totalScore *= 1.3; // Emergency situations increase risk
    }
    if (context.procedure_id && context.treatment_type) {
      totalScore *= 1.1; // Active procedures increase risk
    }
    return Math.min(Math.round(totalScore), 100);
  };
  // Determine risk level from score
  RiskAssessmentService.prototype.determineRiskLevel = (score) => {
    if (score >= 80) return "critical";
    if (score >= 60) return "high";
    if (score >= 30) return "moderate";
    return "low";
  };
  // Generate risk categories breakdown
  RiskAssessmentService.prototype.generateRiskCategories = function (factors) {
    var _a, _b, _c;
    var categories = {
      medical: { score: 0, factors: [], severity: "low" },
      procedural: { score: 0, factors: [], severity: "low" },
      patient_specific: { score: 0, factors: [], severity: "low" },
      environmental: { score: 0, factors: [], severity: "low" },
    };
    // Medical category
    if (factors.medical) {
      var score = 0;
      var medicalFactors = [];
      if (
        (_a = factors.medical.chronic_conditions) === null || _a === void 0 ? void 0 : _a.length
      ) {
        score += factors.medical.chronic_conditions.length * 10;
        medicalFactors.push(
          "".concat(factors.medical.chronic_conditions.length, " chronic conditions"),
        );
      }
      if ((_b = factors.medical.allergies) === null || _b === void 0 ? void 0 : _b.length) {
        score += factors.medical.allergies.length * 5;
        medicalFactors.push("".concat(factors.medical.allergies.length, " allergies"));
      }
      if ((_c = factors.medical.contraindications) === null || _c === void 0 ? void 0 : _c.length) {
        score += factors.medical.contraindications.length * 15;
        medicalFactors.push(
          "".concat(factors.medical.contraindications.length, " contraindications"),
        );
      }
      categories.medical = {
        score: Math.min(score, 100),
        factors: medicalFactors,
        severity: this.determineRiskLevel(score),
      };
    }
    return categories;
  };
  // Check if validation is required
  RiskAssessmentService.prototype.requiresValidation = (assessment) =>
    assessment.risk_level === "critical" ||
    assessment.risk_level === "high" ||
    (assessment.risk_score && assessment.risk_score > 70) ||
    assessment.assessment_type === "emergency";
  /**
   * CRUD Operations for Risk Assessments
   */
  RiskAssessmentService.prototype.createRiskAssessment = function (data) {
    return __awaiter(this, void 0, void 0, function () {
      var riskScore, riskLevel, riskCategories, assessmentData, _a, assessment, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            riskScore = this.calculateRiskScore(
              data.risk_factors || {},
              data.assessment_context || {},
            );
            riskLevel = this.determineRiskLevel(riskScore);
            riskCategories = this.generateRiskCategories(data.risk_factors || {});
            assessmentData = {
              patient_id: data.patient_id,
              risk_factors: data.risk_factors || {},
              risk_score: riskScore,
              risk_level: riskLevel,
              risk_categories: riskCategories,
              assessment_type: data.assessment_type,
              assessment_method: data.assessment_method || "automated",
              assessment_context: data.assessment_context || {},
              medical_history_factors: data.medical_history_factors || {},
              current_conditions: data.current_conditions || {},
              contraindications: {},
              risk_multipliers: {},
              assessment_date: new Date().toISOString(),
              last_updated: new Date().toISOString(),
              validation_status: "pending",
              validation_required: this.requiresValidation({
                risk_level: riskLevel,
                risk_score: riskScore,
                assessment_type: data.assessment_type,
              }),
            };
            return [
              4 /*yield*/,
              supabase.from("risk_assessments").insert(assessmentData).select().single(),
            ];
          case 1:
            (_a = _b.sent()), (assessment = _a.data), (error = _a.error);
            if (error) throw new Error("Failed to create risk assessment: ".concat(error.message));
            if (!(riskLevel === "critical" || riskLevel === "high")) return [3 /*break*/, 3];
            return [
              4 /*yield*/,
              this.createAlert({
                patient_id: data.patient_id,
                assessment_id: assessment.id,
                alert_type: riskLevel === "critical" ? "immediate" : "warning",
                risk_category: "medical",
                severity_level: riskLevel === "critical" ? "critical" : "high",
                alert_title: "".concat(riskLevel.toUpperCase(), " Risk Assessment Alert"),
                alert_message: "Patient has been assessed with "
                  .concat(riskLevel, " risk (score: ")
                  .concat(riskScore, "). Medical validation required."),
                alert_details: { risk_score: riskScore, risk_categories: riskCategories },
                recommended_actions: {
                  immediate:
                    riskLevel === "critical"
                      ? ["Immediate medical review", "Emergency protocols"]
                      : ["Medical review", "Risk mitigation planning"],
                },
              }),
            ];
          case 2:
            _b.sent();
            _b.label = 3;
          case 3:
            return [2 /*return*/, assessment];
        }
      });
    });
  };
  RiskAssessmentService.prototype.getRiskAssessment = function (id) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase.from("risk_assessments").select("*").eq("id", id).single(),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) return [2 /*return*/, null];
            return [2 /*return*/, data];
        }
      });
    });
  };
  RiskAssessmentService.prototype.getAllRiskAssessments = function () {
    return __awaiter(this, arguments, void 0, function (filters, limit, offset) {
      var query, _a, data, error;
      if (filters === void 0) {
        filters = {};
      }
      if (limit === void 0) {
        limit = 50;
      }
      if (offset === void 0) {
        offset = 0;
      }
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            query = supabase
              .from("risk_assessments")
              .select("*")
              .order("created_at", { ascending: false })
              .range(offset, offset + limit - 1);
            // Apply filters
            Object.entries(filters).forEach((_a) => {
              var key = _a[0],
                value = _a[1];
              if (value !== null && value !== undefined) {
                query = query.eq(key, value);
              }
            });
            return [4 /*yield*/, query];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw new Error("Failed to fetch risk assessments: ".concat(error.message));
            return [2 /*return*/, data || []];
        }
      });
    });
  };
  RiskAssessmentService.prototype.createAlert = function (data) {
    return __awaiter(this, void 0, void 0, function () {
      var alertData, _a, alert, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            alertData = __assign(__assign({}, data), {
              alert_details: data.alert_details || {},
              recommended_actions: data.recommended_actions || {},
              alert_status: "active",
              escalation_level: 0,
              escalation_path: {},
              emergency_protocol_triggered: false,
            });
            return [4 /*yield*/, supabase.from("risk_alerts").insert(alertData).select().single()];
          case 1:
            (_a = _b.sent()), (alert = _a.data), (error = _a.error);
            if (error) throw new Error("Failed to create alert: ".concat(error.message));
            return [2 /*return*/, alert];
        }
      });
    });
  };
  RiskAssessmentService.prototype.getAllValidations = function () {
    return __awaiter(this, arguments, void 0, function (filters, limit, offset) {
      var query, _a, data, error;
      if (filters === void 0) {
        filters = {};
      }
      if (limit === void 0) {
        limit = 50;
      }
      if (offset === void 0) {
        offset = 0;
      }
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            query = supabase
              .from("risk_validations")
              .select("*")
              .order("created_at", { ascending: false })
              .range(offset, offset + limit - 1);
            // Apply filters
            Object.entries(filters).forEach((_a) => {
              var key = _a[0],
                value = _a[1];
              if (value !== null && value !== undefined) {
                query = query.eq(key, value);
              }
            });
            return [4 /*yield*/, query];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw new Error("Failed to fetch validations: ".concat(error.message));
            return [2 /*return*/, data || []];
        }
      });
    });
  };
  RiskAssessmentService.prototype.getAllAlerts = function () {
    return __awaiter(this, arguments, void 0, function (filters, limit, offset) {
      var query, _a, data, error;
      if (filters === void 0) {
        filters = {};
      }
      if (limit === void 0) {
        limit = 50;
      }
      if (offset === void 0) {
        offset = 0;
      }
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            query = supabase
              .from("risk_alerts")
              .select("*")
              .order("created_at", { ascending: false })
              .range(offset, offset + limit - 1);
            // Apply filters
            Object.entries(filters).forEach((_a) => {
              var key = _a[0],
                value = _a[1];
              if (value !== null && value !== undefined) {
                query = query.eq(key, value);
              }
            });
            return [4 /*yield*/, query];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw new Error("Failed to fetch alerts: ".concat(error.message));
            return [2 /*return*/, data || []];
        }
      });
    });
  };
  RiskAssessmentService.prototype.updateRiskAssessment = function (id, updates) {
    return __awaiter(this, void 0, void 0, function () {
      var updateData, currentAssessment, newScore, newLevel, _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            updateData = __assign({}, updates);
            if (!updates.risk_factors) return [3 /*break*/, 2];
            return [4 /*yield*/, this.getRiskAssessment(id)];
          case 1:
            currentAssessment = _b.sent();
            if (currentAssessment) {
              newScore = this.calculateRiskScore(
                updates.risk_factors,
                currentAssessment.assessment_context,
              );
              newLevel = this.determineRiskLevel(newScore);
              updateData.risk_score = newScore;
              updateData.risk_level = newLevel;
              updateData.risk_categories = this.generateRiskCategories(updates.risk_factors);
              updateData.validation_required = this.requiresValidation(
                __assign(__assign({}, currentAssessment), {
                  risk_level: newLevel,
                  risk_score: newScore,
                }),
              );
            }
            _b.label = 2;
          case 2:
            updateData.last_updated = new Date().toISOString();
            return [
              4 /*yield*/,
              supabase.from("risk_assessments").update(updateData).eq("id", id).select().single(),
            ];
          case 3:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw new Error("Failed to update risk assessment: ".concat(error.message));
            return [2 /*return*/, data];
        }
      });
    });
  };
  RiskAssessmentService.prototype.deleteRiskAssessment = function (id) {
    return __awaiter(this, void 0, void 0, function () {
      var error;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, supabase.from("risk_assessments").delete().eq("id", id)];
          case 1:
            error = _a.sent().error;
            if (error) throw new Error("Failed to delete risk assessment: ".concat(error.message));
            return [2 /*return*/];
        }
      });
    });
  };
  RiskAssessmentService.prototype.getPatientRiskAssessments = function (patientId_1) {
    return __awaiter(this, arguments, void 0, function (patientId, limit) {
      var supabase, _a, data, error;
      if (limit === void 0) {
        limit = 10;
      }
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("risk_assessments")
                .select("*")
                .eq("patient_id", patientId)
                .order("assessment_date", { ascending: false })
                .limit(limit),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error)
              throw new Error("Failed to get patient risk assessments: ".concat(error.message));
            return [2 /*return*/, data || []];
        }
      });
    });
  };
  /**
   * Medical Validation Operations
   */
  RiskAssessmentService.prototype.createValidation = function (data) {
    return __awaiter(this, void 0, void 0, function () {
      var validationData, _a, validation, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            validationData = __assign(__assign({}, data), {
              validation_date: new Date().toISOString(),
              validator_credentials: data.validator_credentials || {},
              requires_second_opinion: data.requires_second_opinion || false,
            });
            return [
              4 /*yield*/,
              supabase.from("risk_validations").insert(validationData).select().single(),
            ];
          case 1:
            (_a = _b.sent()), (validation = _a.data), (error = _a.error);
            if (error) throw new Error("Failed to create validation: ".concat(error.message));
            // Update assessment validation status
            return [
              4 /*yield*/,
              this.updateRiskAssessment(data.assessment_id, {
                validation_status:
                  data.validation_decision === "approved"
                    ? "validated"
                    : data.validation_decision === "rejected"
                      ? "rejected"
                      : "requires_review",
              }),
            ];
          case 2:
            // Update assessment validation status
            _b.sent();
            return [2 /*return*/, validation];
        }
      });
    });
  };
  RiskAssessmentService.prototype.getValidationsForAssessment = function (assessmentId) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("risk_validations")
                .select("*")
                .eq("assessment_id", assessmentId)
                .order("validation_date", { ascending: false }),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw new Error("Failed to get validations: ".concat(error.message));
            return [2 /*return*/, data || []];
        }
      });
    });
  };
  /**
   * Risk Mitigation Operations
   */
  RiskAssessmentService.prototype.createMitigation = function (data) {
    return __awaiter(this, void 0, void 0, function () {
      var mitigationData, _a, mitigation, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            mitigationData = __assign(__assign({}, data), {
              mitigation_details: data.mitigation_details || {},
              implementation_status: "planned",
            });
            return [
              4 /*yield*/,
              supabase.from("risk_mitigations").insert(mitigationData).select().single(),
            ];
          case 1:
            (_a = _b.sent()), (mitigation = _a.data), (error = _a.error);
            if (error) throw new Error("Failed to create mitigation: ".concat(error.message));
            return [2 /*return*/, mitigation];
        }
      });
    });
  };
  RiskAssessmentService.prototype.updateMitigationStatus = function (id, status) {
    return __awaiter(this, void 0, void 0, function () {
      var error;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              supabase
                .from("risk_mitigations")
                .update({
                  implementation_status: status,
                  implementation_date: status === "active" ? new Date().toISOString() : undefined,
                })
                .eq("id", id),
            ];
          case 1:
            error = _a.sent().error;
            if (error)
              throw new Error("Failed to update mitigation status: ".concat(error.message));
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Alert Management Operations
   */
  RiskAssessmentService.prototype.acknowledgeAlert = function (id, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var error;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              supabase
                .from("risk_alerts")
                .update({
                  alert_status: "acknowledged",
                  acknowledged_by: userId,
                  acknowledged_at: new Date().toISOString(),
                })
                .eq("id", id),
            ];
          case 1:
            error = _a.sent().error;
            if (error) throw new Error("Failed to acknowledge alert: ".concat(error.message));
            return [2 /*return*/];
        }
      });
    });
  };
  RiskAssessmentService.prototype.resolveAlert = function (id, userId, notes) {
    return __awaiter(this, void 0, void 0, function () {
      var error;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              supabase
                .from("risk_alerts")
                .update({
                  alert_status: "resolved",
                  resolved_by: userId,
                  resolved_at: new Date().toISOString(),
                  resolution_notes: notes,
                })
                .eq("id", id),
            ];
          case 1:
            error = _a.sent().error;
            if (error) throw new Error("Failed to resolve alert: ".concat(error.message));
            return [2 /*return*/];
        }
      });
    });
  };
  RiskAssessmentService.prototype.escalateAlert = function (id) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, alert, fetchError, newEscalationLevel, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase.from("risk_alerts").select("escalation_level").eq("id", id).single(),
            ];
          case 2:
            (_a = _b.sent()), (alert = _a.data), (fetchError = _a.error);
            if (fetchError) throw new Error("Failed to fetch alert: ".concat(fetchError.message));
            newEscalationLevel = Math.min((alert.escalation_level || 0) + 1, 5);
            return [
              4 /*yield*/,
              supabase
                .from("risk_alerts")
                .update({
                  alert_status: "escalated",
                  escalation_level: newEscalationLevel,
                })
                .eq("id", id),
            ];
          case 3:
            error = _b.sent().error;
            if (error) throw new Error("Failed to escalate alert: ".concat(error.message));
            return [2 /*return*/];
        }
      });
    });
  };
  RiskAssessmentService.prototype.getActiveAlerts = function () {
    return __awaiter(this, arguments, void 0, function (limit) {
      var supabase, _a, data, error;
      if (limit === void 0) {
        limit = 50;
      }
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("risk_alerts")
                .select("*")
                .eq("alert_status", "active")
                .order("created_at", { ascending: false })
                .limit(limit),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw new Error("Failed to get active alerts: ".concat(error.message));
            return [2 /*return*/, data || []];
        }
      });
    });
  };
  /**
   * Dashboard and Analytics
   */
  RiskAssessmentService.prototype.getDashboardData = function () {
    return __awaiter(this, void 0, void 0, function () {
      var totalAssessments, highRiskPatients, pendingValidations, activeAlerts, recentAssessments;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              supabase.from("risk_assessments").select("*", { count: "exact", head: true }),
            ];
          case 1:
            totalAssessments = _a.sent().count;
            return [
              4 /*yield*/,
              supabase
                .from("risk_assessments")
                .select("*", { count: "exact", head: true })
                .in("risk_level", ["high", "critical"]),
            ];
          case 2:
            highRiskPatients = _a.sent().count;
            return [
              4 /*yield*/,
              supabase
                .from("risk_assessments")
                .select("*", { count: "exact", head: true })
                .eq("validation_status", "pending"),
            ];
          case 3:
            pendingValidations = _a.sent().count;
            return [
              4 /*yield*/,
              supabase
                .from("risk_alerts")
                .select("*", { count: "exact", head: true })
                .eq("alert_status", "active"),
            ];
          case 4:
            activeAlerts = _a.sent().count;
            return [
              4 /*yield*/,
              supabase
                .from("risk_assessments")
                .select("*")
                .order("assessment_date", { ascending: false })
                .limit(10),
            ];
          case 5:
            recentAssessments = _a.sent().data;
            return [
              2 /*return*/,
              {
                totalAssessments: totalAssessments || 0,
                highRiskPatients: highRiskPatients || 0,
                pendingValidations: pendingValidations || 0,
                activeAlerts: activeAlerts || 0,
                recentAssessments: recentAssessments || [],
                alertsByCategory: {
                  medical: 0,
                  procedural: 0,
                  patient_specific: 0,
                  environmental: 0,
                },
                riskTrends: [],
                validationMetrics: {
                  totalValidations: 0,
                  averageValidationTime: 0,
                  validationAccuracy: 0,
                },
              },
            ];
        }
      });
    });
  };
  /**
   * Risk Threshold Management
   */
  RiskAssessmentService.prototype.getRiskThresholds = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var query, _a, data, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            query = supabase.from("risk_thresholds").select("*").eq("is_active", true);
            if (clinicId) {
              query = query.or("clinic_id.eq.".concat(clinicId, ",clinic_id.is.null"));
            } else {
              query = query.is("clinic_id", null);
            }
            return [4 /*yield*/, query.order("risk_category")];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw new Error("Failed to get risk thresholds: ".concat(error.message));
            return [2 /*return*/, data || []];
        }
      });
    });
  };
  RiskAssessmentService.prototype.updateRiskThreshold = function (id, updates) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase.from("risk_thresholds").update(updates).eq("id", id).select().single(),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw new Error("Failed to update risk threshold: ".concat(error.message));
            return [2 /*return*/, data];
        }
      });
    });
  };
  return RiskAssessmentService;
})();
exports.RiskAssessmentService = RiskAssessmentService;
