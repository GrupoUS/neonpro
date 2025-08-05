/**
 * Compliance and Rules Engine for AI Scheduling
 * Story 2.3: AI-Powered Automatic Scheduling Implementation
 *
 * This module implements comprehensive compliance and business rules:
 * - Healthcare regulations compliance
 * - Business policy enforcement
 * - Treatment protocol validation
 * - Staff certification requirements
 * - Patient safety protocols
 * - Brazilian healthcare regulations (CFM, ANVISA)
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
exports.ComplianceRulesEngine = void 0;
var client_1 = require("@/lib/supabase/client");
var ComplianceRulesEngine = /** @class */ (() => {
  function ComplianceRulesEngine() {
    this.supabase = (0, client_1.createClient)();
    this.rules = new Map();
    this.brazilianRegulations = [];
    this.ruleCache = new Map();
    this.initializeBrazilianRegulations();
    this.loadComplianceRules();
  }
  /**
   * Validate scheduling recommendation against all compliance rules
   */
  ComplianceRulesEngine.prototype.validateCompliance = function (recommendation_1, criteria_1) {
    return __awaiter(this, arguments, void 0, function (recommendation, criteria, context) {
      var violations,
        warnings,
        requiredApprovals,
        suggestedModifications,
        validationContext,
        _i,
        _a,
        rule,
        ruleResult,
        complianceScore,
        result,
        cacheKey,
        error_1;
      if (context === void 0) {
        context = {};
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 7, , 8]);
            violations = [];
            warnings = [];
            requiredApprovals = [];
            suggestedModifications = [];
            return [
              4 /*yield*/,
              this.buildValidationContext(recommendation, criteria, context),
              // Validate against each active rule
            ];
          case 1:
            validationContext = _b.sent();
            (_i = 0), (_a = this.rules.values());
            _b.label = 2;
          case 2:
            if (!(_i < _a.length)) return [3 /*break*/, 5];
            rule = _a[_i];
            if (rule.status !== "active") return [3 /*break*/, 4];
            return [4 /*yield*/, this.validateRule(rule, validationContext)];
          case 3:
            ruleResult = _b.sent();
            if (ruleResult.violations.length > 0) {
              violations.push.apply(violations, ruleResult.violations);
            }
            if (ruleResult.warnings.length > 0) {
              warnings.push.apply(warnings, ruleResult.warnings);
            }
            if (ruleResult.requiredApprovals.length > 0) {
              requiredApprovals.push.apply(requiredApprovals, ruleResult.requiredApprovals);
            }
            if (ruleResult.suggestedModifications.length > 0) {
              suggestedModifications.push.apply(
                suggestedModifications,
                ruleResult.suggestedModifications,
              );
            }
            _b.label = 4;
          case 4:
            _i++;
            return [3 /*break*/, 2];
          case 5:
            complianceScore = this.calculateComplianceScore(
              violations,
              warnings,
              requiredApprovals,
            );
            result = {
              isCompliant:
                violations.filter((v) => v.severity === "critical" || v.severity === "error")
                  .length === 0,
              violations: violations,
              warnings: warnings,
              requiredApprovals: requiredApprovals,
              suggestedModifications: suggestedModifications,
              complianceScore: complianceScore,
            };
            cacheKey = this.generateCacheKey(recommendation, criteria);
            this.ruleCache.set(cacheKey, result);
            // Log compliance validation
            return [4 /*yield*/, this.logComplianceValidation(recommendation, criteria, result)];
          case 6:
            // Log compliance validation
            _b.sent();
            return [2 /*return*/, result];
          case 7:
            error_1 = _b.sent();
            console.error("Error validating compliance:", error_1);
            throw new Error("Failed to validate compliance");
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Validate a specific rule against the context
   */
  ComplianceRulesEngine.prototype.validateRule = function (rule, context) {
    return __awaiter(this, void 0, void 0, function () {
      var violations,
        warnings,
        requiredApprovals,
        suggestedModifications,
        conditionsMet,
        _i,
        _a,
        action;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            violations = [];
            warnings = [];
            requiredApprovals = [];
            suggestedModifications = [];
            return [4 /*yield*/, this.evaluateRuleConditions(rule.conditions, context)];
          case 1:
            conditionsMet = _b.sent();
            if (conditionsMet) {
              // Rule applies, execute actions
              for (_i = 0, _a = rule.actions; _i < _a.length; _i++) {
                action = _a[_i];
                switch (action.type) {
                  case "block":
                    violations.push({
                      ruleId: rule.id,
                      ruleName: rule.name,
                      severity: rule.severity,
                      description: action.description,
                      field: action.parameters.field || "general",
                      currentValue: context[action.parameters.field],
                      expectedValue: action.parameters.expectedValue,
                      regulation: rule.regulation,
                      canBeOverridden: rule.exceptions.length > 0,
                      overrideRequirements: rule.exceptions.map((e) => e.description),
                    });
                    break;
                  case "warn":
                    warnings.push({
                      ruleId: rule.id,
                      ruleName: rule.name,
                      description: action.description,
                      recommendation: action.parameters.recommendation || "",
                      impact: action.parameters.impact || "medium",
                    });
                    break;
                  case "require_approval":
                    requiredApprovals.push({
                      ruleId: rule.id,
                      approvalType: action.parameters.approvalType,
                      requiredRoles: action.parameters.requiredRoles || [],
                      reason: action.description,
                      urgency: action.parameters.urgency || "medium",
                    });
                    break;
                  case "modify":
                    suggestedModifications.push({
                      field: action.parameters.field,
                      currentValue: context[action.parameters.field],
                      suggestedValue: action.parameters.suggestedValue,
                      reason: action.description,
                      impact: action.parameters.impact || "Improves compliance",
                    });
                    break;
                }
              }
            }
            return [
              2 /*return*/,
              {
                violations: violations,
                warnings: warnings,
                requiredApprovals: requiredApprovals,
                suggestedModifications: suggestedModifications,
              },
            ];
        }
      });
    });
  };
  /**
   * Evaluate rule conditions against context
   */
  ComplianceRulesEngine.prototype.evaluateRuleConditions = function (conditions, context) {
    return __awaiter(this, void 0, void 0, function () {
      var result, currentLogicalOperator, i, condition, conditionResult;
      return __generator(this, function (_a) {
        if (conditions.length === 0) return [2 /*return*/, true];
        result = true;
        currentLogicalOperator = "AND";
        for (i = 0; i < conditions.length; i++) {
          condition = conditions[i];
          conditionResult = this.evaluateCondition(condition, context);
          if (i === 0) {
            result = conditionResult;
          } else {
            if (currentLogicalOperator === "AND") {
              result = result && conditionResult;
            } else {
              result = result || conditionResult;
            }
          }
          // Set logical operator for next iteration
          if (condition.logicalOperator) {
            currentLogicalOperator = condition.logicalOperator;
          }
        }
        return [2 /*return*/, result];
      });
    });
  };
  /**
   * Evaluate a single condition
   */
  ComplianceRulesEngine.prototype.evaluateCondition = function (condition, context) {
    var fieldValue = this.getNestedValue(context, condition.field);
    var conditionValue = condition.value;
    switch (condition.operator) {
      case "equals":
        return fieldValue === conditionValue;
      case "not_equals":
        return fieldValue !== conditionValue;
      case "greater_than":
        return Number(fieldValue) > Number(conditionValue);
      case "less_than":
        return Number(fieldValue) < Number(conditionValue);
      case "contains":
        return String(fieldValue).includes(String(conditionValue));
      case "in":
        return Array.isArray(conditionValue) && conditionValue.includes(fieldValue);
      case "not_in":
        return Array.isArray(conditionValue) && !conditionValue.includes(fieldValue);
      default:
        return false;
    }
  };
  /**
   * Get nested value from object using dot notation
   */
  ComplianceRulesEngine.prototype.getNestedValue = (obj, path) =>
    path
      .split(".")
      .reduce(
        (current, key) => (current === null || current === void 0 ? void 0 : current[key]),
        obj,
      );
  /**
   * Build validation context with all necessary data
   */
  ComplianceRulesEngine.prototype.buildValidationContext = function (
    recommendation,
    criteria,
    additionalContext,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var patient, treatment, staff, equipmentRequirements, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            return [
              4 /*yield*/,
              this.supabase
                .from("patients")
                .select("*")
                .eq("id", criteria.patientId)
                .single(),
              // Load treatment data
            ];
          case 1:
            patient = _a.sent().data;
            return [
              4 /*yield*/,
              this.supabase
                .from("treatments")
                .select("*")
                .eq("id", criteria.treatmentId)
                .single(),
              // Load staff data
            ];
          case 2:
            treatment = _a.sent().data;
            return [
              4 /*yield*/,
              this.supabase
                .from("staff")
                .select(
                  "\n          *,\n          staff_certifications(*),\n          staff_specializations(*)\n        ",
                )
                .eq("id", recommendation.staffId)
                .single(),
              // Load equipment requirements
            ];
          case 3:
            staff = _a.sent().data;
            return [
              4 /*yield*/,
              this.supabase
                .from("treatment_equipment_requirements")
                .select("\n          *,\n          equipment(*)\n        ")
                .eq("treatment_id", criteria.treatmentId),
            ];
          case 4:
            equipmentRequirements = _a.sent().data;
            return [
              2 /*return*/,
              __assign(
                {
                  recommendation: recommendation,
                  criteria: criteria,
                  patient: patient,
                  treatment: treatment,
                  staff: staff,
                  equipmentRequirements: equipmentRequirements,
                  timeSlot: recommendation.timeSlot,
                  dayOfWeek: recommendation.timeSlot.startTime.getDay(),
                  hourOfDay: recommendation.timeSlot.startTime.getHours(),
                  appointmentDuration:
                    (treatment === null || treatment === void 0
                      ? void 0
                      : treatment.duration_minutes) || 60,
                  patientAge: patient ? this.calculateAge(patient.birth_date) : 0,
                  isMinor: patient ? this.calculateAge(patient.birth_date) < 18 : false,
                  isEmergency: criteria.urgencyLevel === "urgent",
                  isFollowUp: criteria.isFollowUp,
                },
                additionalContext,
              ),
            ];
          case 5:
            error_2 = _a.sent();
            console.error("Error building validation context:", error_2);
            return [
              2 /*return*/,
              __assign({ recommendation: recommendation, criteria: criteria }, additionalContext),
            ];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Calculate age from birth date
   */
  ComplianceRulesEngine.prototype.calculateAge = (birthDate) => {
    var today = new Date();
    var birth = new Date(birthDate);
    var age = today.getFullYear() - birth.getFullYear();
    var monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };
  /**
   * Calculate compliance score
   */
  ComplianceRulesEngine.prototype.calculateComplianceScore = (
    violations,
    warnings,
    requiredApprovals,
  ) => {
    var score = 100;
    // Deduct points for violations
    violations.forEach((violation) => {
      switch (violation.severity) {
        case "critical":
          score -= 25;
          break;
        case "error":
          score -= 15;
          break;
        case "warning":
          score -= 5;
          break;
        case "info":
          score -= 1;
          break;
      }
    });
    // Deduct points for warnings
    warnings.forEach((warning) => {
      switch (warning.impact) {
        case "high":
          score -= 10;
          break;
        case "medium":
          score -= 5;
          break;
        case "low":
          score -= 2;
          break;
      }
    });
    // Deduct points for required approvals
    requiredApprovals.forEach((approval) => {
      switch (approval.urgency) {
        case "urgent":
          score -= 15;
          break;
        case "high":
          score -= 10;
          break;
        case "medium":
          score -= 5;
          break;
        case "low":
          score -= 2;
          break;
      }
    });
    return Math.max(0, score);
  };
  /**
   * Initialize Brazilian healthcare regulations
   */
  ComplianceRulesEngine.prototype.initializeBrazilianRegulations = function () {
    this.brazilianRegulations = [
      {
        cfmResolution: "CFM 2.314/2022",
        anvisaRegulation: "RDC 63/2011",
        description: "Telemedicine and digital health regulations",
        applicableScenarios: ["telemedicine", "digital_consultation"],
        complianceRequirements: [
          "Patient consent for digital consultation",
          "Secure communication platform",
          "Digital signature validation",
        ],
      },
      {
        cfmResolution: "CFM 1.821/2007",
        anvisaRegulation: "RDC 50/2002",
        description: "Medical record and patient privacy",
        applicableScenarios: ["all_appointments"],
        complianceRequirements: [
          "Patient data encryption",
          "Access control and audit logs",
          "Data retention policies",
        ],
      },
      {
        cfmResolution: "CFM 2.217/2018",
        anvisaRegulation: "RDC 36/2013",
        description: "Medical ethics and professional conduct",
        applicableScenarios: ["all_appointments"],
        complianceRequirements: [
          "Professional licensing validation",
          "Continuing education requirements",
          "Ethical conduct monitoring",
        ],
      },
    ];
  };
  /**
   * Load compliance rules from database
   */
  ComplianceRulesEngine.prototype.loadComplianceRules = function () {
    return __awaiter(this, void 0, void 0, function () {
      var rules, error_3;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 6]);
            return [
              4 /*yield*/,
              this.supabase
                .from("compliance_rules")
                .select(
                  "\n          *,\n          rule_conditions(*),\n          rule_actions(*),\n          rule_exceptions(*)\n        ",
                )
                .eq("status", "active"),
            ];
          case 1:
            rules = _a.sent().data;
            if (rules) {
              rules.forEach((rule) => {
                _this.rules.set(rule.id, {
                  id: rule.id,
                  name: rule.name,
                  type: rule.type,
                  severity: rule.severity,
                  status: rule.status,
                  description: rule.description,
                  regulation: rule.regulation,
                  conditions: rule.rule_conditions || [],
                  actions: rule.rule_actions || [],
                  exceptions: rule.rule_exceptions || [],
                  priority: rule.priority,
                  createdAt: new Date(rule.created_at),
                  updatedAt: new Date(rule.updated_at),
                  createdBy: rule.created_by,
                });
              });
            }
            if (!(this.rules.size === 0)) return [3 /*break*/, 3];
            return [4 /*yield*/, this.createDefaultRules()];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            return [3 /*break*/, 6];
          case 4:
            error_3 = _a.sent();
            console.error("Error loading compliance rules:", error_3);
            return [4 /*yield*/, this.createDefaultRules()];
          case 5:
            _a.sent();
            return [3 /*break*/, 6];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Create default compliance rules
   */
  ComplianceRulesEngine.prototype.createDefaultRules = function () {
    return __awaiter(this, void 0, void 0, function () {
      var defaultRules;
      return __generator(this, (_a) => {
        defaultRules = [
          {
            id: "minor-patient-guardian-consent",
            name: "Minor Patient Guardian Consent",
            type: "patient_safety",
            severity: "critical",
            status: "active",
            description: "Patients under 18 require guardian consent",
            regulation: "CFM 2.217/2018 - Medical Ethics",
            conditions: [
              {
                id: "age-check",
                field: "patientAge",
                operator: "less_than",
                value: 18,
              },
            ],
            actions: [
              {
                id: "require-guardian-consent",
                type: "require_approval",
                description: "Guardian consent required for minor patient",
                parameters: {
                  approvalType: "guardian_consent",
                  requiredRoles: ["guardian", "legal_representative"],
                  urgency: "high",
                },
              },
            ],
            exceptions: [],
            priority: 1,
          },
          {
            id: "staff-certification-validation",
            name: "Staff Certification Validation",
            type: "staff_certification",
            severity: "error",
            status: "active",
            description: "Staff must have valid certification for treatment",
            regulation: "CFM 2.217/2018 - Professional Licensing",
            conditions: [
              {
                id: "certification-check",
                field: "staff.certifications",
                operator: "contains",
                value: "treatment.required_certification",
              },
            ],
            actions: [
              {
                id: "block-uncertified-staff",
                type: "block",
                description: "Staff member lacks required certification",
                parameters: {
                  field: "staffId",
                  expectedValue: "certified_staff_member",
                },
              },
            ],
            exceptions: [
              {
                id: "emergency-exception",
                condition: "isEmergency === true",
                description: "Emergency situations allow temporary assignment",
                approvalRequired: true,
                approverRoles: ["medical_director", "chief_of_staff"],
              },
            ],
            priority: 2,
          },
          {
            id: "equipment-availability-check",
            name: "Equipment Availability Check",
            type: "equipment_requirement",
            severity: "error",
            status: "active",
            description: "Required equipment must be available and functional",
            regulation: "ANVISA RDC 50/2002 - Equipment Standards",
            conditions: [
              {
                id: "equipment-required",
                field: "equipmentRequirements.length",
                operator: "greater_than",
                value: 0,
              },
            ],
            actions: [
              {
                id: "validate-equipment",
                type: "block",
                description: "Required equipment not available or not functional",
                parameters: {
                  field: "equipment",
                  expectedValue: "available_and_functional",
                },
              },
            ],
            exceptions: [],
            priority: 3,
          },
          {
            id: "working-hours-compliance",
            name: "Working Hours Compliance",
            type: "time_constraint",
            severity: "warning",
            status: "active",
            description: "Appointments should be scheduled during regular working hours",
            regulation: "Internal Policy - Working Hours",
            conditions: [
              {
                id: "hour-check",
                field: "hourOfDay",
                operator: "less_than",
                value: 8,
                logicalOperator: "OR",
              },
              {
                id: "hour-check-2",
                field: "hourOfDay",
                operator: "greater_than",
                value: 18,
              },
            ],
            actions: [
              {
                id: "warn-outside-hours",
                type: "warn",
                description: "Appointment scheduled outside regular working hours",
                parameters: {
                  recommendation: "Consider scheduling during regular hours (8 AM - 6 PM)",
                  impact: "medium",
                },
              },
            ],
            exceptions: [
              {
                id: "emergency-hours",
                condition: "isEmergency === true",
                description: "Emergency appointments can be scheduled anytime",
                approvalRequired: false,
                approverRoles: [],
              },
            ],
            priority: 4,
          },
        ];
        // Add default rules to the rules map
        defaultRules.forEach((rule) => {
          if (rule.id) {
            this.rules.set(
              rule.id,
              __assign(__assign({}, rule), {
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: "system",
              }),
            );
          }
        });
        return [2 /*return*/];
      });
    });
  };
  /**
   * Generate cache key for validation result
   */
  ComplianceRulesEngine.prototype.generateCacheKey = (recommendation, criteria) =>
    ""
      .concat(criteria.patientId, "-")
      .concat(criteria.treatmentId, "-")
      .concat(recommendation.staffId, "-")
      .concat(recommendation.timeSlot.startTime.getTime());
  /**
   * Log compliance validation for audit purposes
   */
  ComplianceRulesEngine.prototype.logComplianceValidation = function (
    recommendation,
    criteria,
    result,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("compliance_validations").insert({
                patient_id: criteria.patientId,
                treatment_id: criteria.treatmentId,
                staff_id: recommendation.staffId,
                time_slot: recommendation.timeSlot.startTime.toISOString(),
                is_compliant: result.isCompliant,
                compliance_score: result.complianceScore,
                violations_count: result.violations.length,
                warnings_count: result.warnings.length,
                approvals_required: result.requiredApprovals.length,
                validation_result: JSON.stringify(result),
                created_at: new Date().toISOString(),
              }),
            ];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_4 = _a.sent();
            console.error("Error logging compliance validation:", error_4);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Add new compliance rule
   */
  ComplianceRulesEngine.prototype.addComplianceRule = function (rule) {
    return __awaiter(this, void 0, void 0, function () {
      var ruleId, newRule, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            ruleId = "rule-".concat(Date.now());
            newRule = __assign(__assign({}, rule), {
              id: ruleId,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            // Save to database
            return [
              4 /*yield*/,
              this.supabase
                .from("compliance_rules")
                .insert({
                  id: newRule.id,
                  name: newRule.name,
                  type: newRule.type,
                  severity: newRule.severity,
                  status: newRule.status,
                  description: newRule.description,
                  regulation: newRule.regulation,
                  priority: newRule.priority,
                  created_by: newRule.createdBy,
                  created_at: newRule.createdAt.toISOString(),
                  updated_at: newRule.updatedAt.toISOString(),
                }),
              // Add to memory
            ];
          case 1:
            // Save to database
            _a.sent();
            // Add to memory
            this.rules.set(ruleId, newRule);
            return [2 /*return*/, ruleId];
          case 2:
            error_5 = _a.sent();
            console.error("Error adding compliance rule:", error_5);
            throw new Error("Failed to add compliance rule");
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Update compliance rule
   */
  ComplianceRulesEngine.prototype.updateComplianceRule = function (ruleId, updates) {
    return __awaiter(this, void 0, void 0, function () {
      var existingRule, updatedRule, error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            existingRule = this.rules.get(ruleId);
            if (!existingRule) {
              throw new Error("Rule not found");
            }
            updatedRule = __assign(__assign(__assign({}, existingRule), updates), {
              updatedAt: new Date(),
            });
            // Update in database
            return [
              4 /*yield*/,
              this.supabase
                .from("compliance_rules")
                .update({
                  name: updatedRule.name,
                  type: updatedRule.type,
                  severity: updatedRule.severity,
                  status: updatedRule.status,
                  description: updatedRule.description,
                  regulation: updatedRule.regulation,
                  priority: updatedRule.priority,
                  updated_at: updatedRule.updatedAt.toISOString(),
                })
                .eq("id", ruleId),
              // Update in memory
            ];
          case 1:
            // Update in database
            _a.sent();
            // Update in memory
            this.rules.set(ruleId, updatedRule);
            return [3 /*break*/, 3];
          case 2:
            error_6 = _a.sent();
            console.error("Error updating compliance rule:", error_6);
            throw new Error("Failed to update compliance rule");
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get all compliance rules
   */
  ComplianceRulesEngine.prototype.getComplianceRules = function () {
    return Array.from(this.rules.values());
  };
  /**
   * Get Brazilian healthcare regulations
   */
  ComplianceRulesEngine.prototype.getBrazilianRegulations = function () {
    return this.brazilianRegulations;
  };
  return ComplianceRulesEngine;
})();
exports.ComplianceRulesEngine = ComplianceRulesEngine;
