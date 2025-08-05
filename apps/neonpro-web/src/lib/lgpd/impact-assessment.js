/**
 * LGPD Impact Assessment System
 * Implements automated Data Protection Impact Assessment (DPIA) for LGPD compliance
 *
 * Features:
 * - Automated risk assessment and scoring
 * - Privacy impact evaluation
 * - Compliance gap analysis
 * - Mitigation recommendations
 * - Stakeholder consultation management
 * - Assessment reporting and documentation
 * - Continuous monitoring and updates
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 */
var __extends =
  (this && this.__extends) ||
  (() => {
    var extendStatics = (d, b) => {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          ((d, b) => {
            d.__proto__ = b;
          })) ||
        ((d, b) => {
          for (var p in b) if (Object.hasOwn(b, p)) d[p] = b[p];
        });
      return extendStatics(d, b);
    };
    return (d, b) => {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __());
    };
  })();
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
exports.impactAssessmentManager =
  exports.ImpactAssessmentManager =
  exports.AssessmentStatus =
  exports.RiskLikelihood =
  exports.RiskSeverity =
  exports.RiskCategory =
    void 0;
var events_1 = require("events");
// ============================================================================
// IMPACT ASSESSMENT TYPES & INTERFACES
// ============================================================================
/**
 * Risk Categories for LGPD Assessment
 */
var RiskCategory;
((RiskCategory) => {
  RiskCategory["DATA_BREACH"] = "data_breach";
  RiskCategory["UNAUTHORIZED_ACCESS"] = "unauthorized_access";
  RiskCategory["DATA_LOSS"] = "data_loss";
  RiskCategory["PRIVACY_VIOLATION"] = "privacy_violation";
  RiskCategory["CONSENT_ISSUES"] = "consent_issues";
  RiskCategory["THIRD_PARTY_SHARING"] = "third_party_sharing";
  RiskCategory["CROSS_BORDER_TRANSFER"] = "cross_border_transfer";
  RiskCategory["AUTOMATED_DECISION"] = "automated_decision";
  RiskCategory["PROFILING"] = "profiling";
  RiskCategory["SURVEILLANCE"] = "surveillance";
  RiskCategory["DISCRIMINATION"] = "discrimination";
  RiskCategory["REPUTATION_DAMAGE"] = "reputation_damage";
})(RiskCategory || (exports.RiskCategory = RiskCategory = {}));
/**
 * Risk Severity Levels
 */
var RiskSeverity;
((RiskSeverity) => {
  RiskSeverity["VERY_LOW"] = "very_low";
  RiskSeverity["LOW"] = "low";
  RiskSeverity["MEDIUM"] = "medium";
  RiskSeverity["HIGH"] = "high";
  RiskSeverity["VERY_HIGH"] = "very_high";
  RiskSeverity["CRITICAL"] = "critical";
})(RiskSeverity || (exports.RiskSeverity = RiskSeverity = {}));
/**
 * Risk Likelihood
 */
var RiskLikelihood;
((RiskLikelihood) => {
  RiskLikelihood["VERY_UNLIKELY"] = "very_unlikely";
  RiskLikelihood["UNLIKELY"] = "unlikely";
  RiskLikelihood["POSSIBLE"] = "possible";
  RiskLikelihood["LIKELY"] = "likely";
  RiskLikelihood["VERY_LIKELY"] = "very_likely";
  RiskLikelihood["CERTAIN"] = "certain";
})(RiskLikelihood || (exports.RiskLikelihood = RiskLikelihood = {}));
/**
 * Assessment Status
 */
var AssessmentStatus;
((AssessmentStatus) => {
  AssessmentStatus["DRAFT"] = "draft";
  AssessmentStatus["IN_REVIEW"] = "in_review";
  AssessmentStatus["STAKEHOLDER_CONSULTATION"] = "stakeholder_consultation";
  AssessmentStatus["APPROVED"] = "approved";
  AssessmentStatus["REJECTED"] = "rejected";
  AssessmentStatus["REQUIRES_UPDATE"] = "requires_update";
  AssessmentStatus["ARCHIVED"] = "archived";
})(AssessmentStatus || (exports.AssessmentStatus = AssessmentStatus = {}));
// ============================================================================
// IMPACT ASSESSMENT SYSTEM
// ============================================================================
/**
 * Impact Assessment Manager
 *
 * Implements automated LGPD impact assessment including:
 * - Risk identification and evaluation
 * - Compliance gap analysis
 * - Stakeholder consultation management
 * - Mitigation planning and tracking
 * - Assessment reporting and approval workflow
 */
var ImpactAssessmentManager = /** @class */ ((_super) => {
  __extends(ImpactAssessmentManager, _super);
  function ImpactAssessmentManager(config) {
    if (config === void 0) {
      config = {
        defaultRiskThreshold: RiskSeverity.MEDIUM,
        autoRiskCalculation: true,
        mandatoryConsultation: true,
        reviewFrequencyMonths: 12,
        approvalWorkflowEnabled: true,
        notificationEnabled: true,
      };
    }
    var _this = _super.call(this) || this;
    _this.config = config;
    _this.assessments = new Map();
    _this.templates = new Map();
    _this.isInitialized = false;
    _this.reviewCheckInterval = null;
    _this.setMaxListeners(50);
    return _this;
  }
  /**
   * Initialize the impact assessment system
   */
  ImpactAssessmentManager.prototype.initialize = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (this.isInitialized) {
              return [2 /*return*/];
            }
            _a.label = 1;
          case 1:
            _a.trys.push([1, 4, , 5]);
            // Load templates and assessments
            return [4 /*yield*/, this.loadTemplates()];
          case 2:
            // Load templates and assessments
            _a.sent();
            return [4 /*yield*/, this.loadAssessments()];
          case 3:
            _a.sent();
            // Start review monitoring
            this.startReviewMonitoring();
            this.isInitialized = true;
            this.logActivity("system", "assessment_initialized", {
              templatesLoaded: this.templates.size,
              assessmentsLoaded: this.assessments.size,
            });
            return [3 /*break*/, 5];
          case 4:
            error_1 = _a.sent();
            throw new Error("Failed to initialize impact assessment system: ".concat(error_1));
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Create new impact assessment
   */
  ImpactAssessmentManager.prototype.createAssessment = function (assessmentData, templateId) {
    return __awaiter(this, void 0, void 0, function () {
      var assessment, template, _a, _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            if (this.isInitialized) return [3 /*break*/, 2];
            return [4 /*yield*/, this.initialize()];
          case 1:
            _c.sent();
            _c.label = 2;
          case 2:
            assessment = __assign(__assign({}, assessmentData), {
              id: this.generateId("assessment"),
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            // Apply template if provided
            if (templateId) {
              template = this.templates.get(templateId);
              if (template) {
                assessment = this.applyTemplate(assessment, template);
              }
            }
            if (!this.config.autoRiskCalculation) return [3 /*break*/, 4];
            _a = assessment;
            return [4 /*yield*/, this.performRiskAnalysis(assessment.scope.processingContext)];
          case 3:
            _a.riskAnalysis = _c.sent();
            _c.label = 4;
          case 4:
            // Perform compliance analysis
            _b = assessment;
            return [
              4 /*yield*/,
              this.performComplianceAnalysis(assessment.scope.processingContext),
            ];
          case 5:
            // Perform compliance analysis
            _b.complianceAnalysis = _c.sent();
            // Validate assessment
            this.validateAssessment(assessment);
            this.assessments.set(assessment.id, assessment);
            return [4 /*yield*/, this.saveAssessment(assessment)];
          case 6:
            _c.sent();
            this.emit("assessment:created", { assessment: assessment });
            this.logActivity("user", "assessment_created", {
              assessmentId: assessment.id,
              name: assessment.name,
              overallRisk: assessment.riskAnalysis.overallRiskLevel,
              compliance: assessment.complianceAnalysis.overallCompliance,
              createdBy: assessment.createdBy,
            });
            return [2 /*return*/, assessment];
        }
      });
    });
  };
  /**
   * Perform automated risk analysis
   */
  ImpactAssessmentManager.prototype.performRiskAnalysis = function (context) {
    return __awaiter(this, void 0, void 0, function () {
      var risks, _i, _a, category, risk, overallRiskLevel, acceptableRiskThreshold, riskAcceptable;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            risks = [];
            (_i = 0), (_a = Object.values(RiskCategory));
            _b.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 4];
            category = _a[_i];
            return [4 /*yield*/, this.assessRisk(category, context)];
          case 2:
            risk = _b.sent();
            if (risk) {
              risks.push(risk);
            }
            _b.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            overallRiskLevel = this.calculateOverallRisk(risks);
            acceptableRiskThreshold = this.config.defaultRiskThreshold;
            riskAcceptable = this.isRiskAcceptable(overallRiskLevel, acceptableRiskThreshold);
            return [
              2 /*return*/,
              {
                methodology: "Automated LGPD Risk Assessment v1.0",
                risks: risks,
                overallRiskLevel: overallRiskLevel,
                acceptableRiskThreshold: acceptableRiskThreshold,
                riskAcceptable: riskAcceptable,
              },
            ];
        }
      });
    });
  };
  /**
   * Assess individual risk
   */
  ImpactAssessmentManager.prototype.assessRisk = function (category, context) {
    return __awaiter(this, void 0, void 0, function () {
      var riskFactors, likelihood, impact, overallRisk, existingControls, mitigationMeasures;
      return __generator(this, function (_a) {
        riskFactors = this.calculateRiskFactors(context);
        likelihood = this.assessRiskLikelihood(category, context, riskFactors);
        impact = this.assessRiskImpact(category, context, riskFactors);
        // Skip very low risks
        if (likelihood === RiskLikelihood.VERY_UNLIKELY && impact === RiskSeverity.VERY_LOW) {
          return [2 /*return*/, null];
        }
        overallRisk = this.calculateRiskLevel(likelihood, impact);
        existingControls = this.identifyExistingControls(category, context);
        mitigationMeasures = this.recommendMitigationMeasures(
          category,
          overallRisk,
          existingControls,
        );
        return [
          2 /*return*/,
          {
            id: this.generateId("risk"),
            category: category,
            description: this.getRiskDescription(category),
            likelihood: likelihood,
            impact: impact,
            overallRisk: overallRisk,
            factors: riskFactors,
            existingControls: existingControls,
            mitigationMeasures: mitigationMeasures,
            assessedBy: "Automated Risk Assessment",
            assessedAt: new Date(),
            reviewDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000), // 6 months
          },
        ];
      });
    });
  };
  /**
   * Calculate risk factors
   */
  ImpactAssessmentManager.prototype.calculateRiskFactors = (context) => {
    // Data volume assessment
    var totalVolume = context.dataTypes.reduce((sum, dt) => {
      var volumeScore = { low: 1, medium: 2, high: 3, very_high: 4 }[dt.volume];
      return sum + volumeScore;
    }, 0);
    var dataVolume = Math.min(5, Math.ceil(totalVolume / context.dataTypes.length));
    // Data sensitivity assessment
    var sensitiveDataCount = context.dataTypes.filter((dt) => dt.sensitive).length;
    var dataSensitivity = Math.min(
      5,
      Math.ceil((sensitiveDataCount / context.dataTypes.length) * 5),
    );
    // Vulnerable subjects assessment
    var vulnerableSubjects = 1;
    if (context.stakeholders.dataSubjects.vulnerable) vulnerableSubjects += 2;
    if (context.stakeholders.dataSubjects.children) vulnerableSubjects += 2;
    vulnerableSubjects = Math.min(5, vulnerableSubjects);
    // Technical complexity assessment
    var techMeasures = Object.values(context.technicalMeasures).filter(Boolean).length;
    var maxTechMeasures = Object.keys(context.technicalMeasures).length;
    var technicalComplexity = Math.max(1, 6 - Math.ceil((techMeasures / maxTechMeasures) * 5));
    // Organizational maturity assessment
    var orgMeasures = Object.values(context.organizationalMeasures).filter(Boolean).length;
    var maxOrgMeasures = Object.keys(context.organizationalMeasures).length;
    var organizationalMaturity = Math.max(1, 6 - Math.ceil((orgMeasures / maxOrgMeasures) * 5));
    return {
      dataVolume: dataVolume,
      dataSensitivity: dataSensitivity,
      vulnerableSubjects: vulnerableSubjects,
      technicalComplexity: technicalComplexity,
      organizationalMaturity: organizationalMaturity,
    };
  };
  /**
   * Assess risk likelihood
   */
  ImpactAssessmentManager.prototype.assessRiskLikelihood = (category, context, factors) => {
    var _a;
    var score = 0;
    // Base likelihood by category
    var baseLikelihood =
      ((_a = {}),
      (_a[RiskCategory.DATA_BREACH] = 2),
      (_a[RiskCategory.UNAUTHORIZED_ACCESS] = 3),
      (_a[RiskCategory.DATA_LOSS] = 2),
      (_a[RiskCategory.PRIVACY_VIOLATION] = 3),
      (_a[RiskCategory.CONSENT_ISSUES] = 4),
      (_a[RiskCategory.THIRD_PARTY_SHARING] = 3),
      (_a[RiskCategory.CROSS_BORDER_TRANSFER] = 2),
      (_a[RiskCategory.AUTOMATED_DECISION] = 3),
      (_a[RiskCategory.PROFILING] = 3),
      (_a[RiskCategory.SURVEILLANCE] = 2),
      (_a[RiskCategory.DISCRIMINATION] = 2),
      (_a[RiskCategory.REPUTATION_DAMAGE] = 3),
      _a);
    score = baseLikelihood[category] || 2;
    // Adjust based on risk factors
    score += Math.floor((factors.technicalComplexity + factors.organizationalMaturity) / 2) - 2;
    // Adjust for external processors
    if (context.stakeholders.processors.external.length > 0) {
      score += 1;
    }
    // Adjust for data volume and sensitivity
    if (factors.dataVolume >= 4 || factors.dataSensitivity >= 4) {
      score += 1;
    }
    // Convert score to likelihood
    if (score <= 1) return RiskLikelihood.VERY_UNLIKELY;
    if (score <= 2) return RiskLikelihood.UNLIKELY;
    if (score <= 3) return RiskLikelihood.POSSIBLE;
    if (score <= 4) return RiskLikelihood.LIKELY;
    if (score <= 5) return RiskLikelihood.VERY_LIKELY;
    return RiskLikelihood.CERTAIN;
  };
  /**
   * Assess risk impact
   */
  ImpactAssessmentManager.prototype.assessRiskImpact = (category, context, factors) => {
    var _a;
    var score = 0;
    // Base impact by category
    var baseImpact =
      ((_a = {}),
      (_a[RiskCategory.DATA_BREACH] = 4),
      (_a[RiskCategory.UNAUTHORIZED_ACCESS] = 3),
      (_a[RiskCategory.DATA_LOSS] = 4),
      (_a[RiskCategory.PRIVACY_VIOLATION] = 3),
      (_a[RiskCategory.CONSENT_ISSUES] = 2),
      (_a[RiskCategory.THIRD_PARTY_SHARING] = 3),
      (_a[RiskCategory.CROSS_BORDER_TRANSFER] = 3),
      (_a[RiskCategory.AUTOMATED_DECISION] = 4),
      (_a[RiskCategory.PROFILING] = 3),
      (_a[RiskCategory.SURVEILLANCE] = 4),
      (_a[RiskCategory.DISCRIMINATION] = 5),
      (_a[RiskCategory.REPUTATION_DAMAGE] = 4),
      _a);
    score = baseImpact[category] || 3;
    // Adjust for vulnerable subjects
    score += factors.vulnerableSubjects - 2;
    // Adjust for data sensitivity
    score += factors.dataSensitivity - 2;
    // Adjust for data volume
    if (factors.dataVolume >= 4) {
      score += 1;
    }
    // Adjust for estimated subject count
    if (context.stakeholders.dataSubjects.estimatedCount > 10000) {
      score += 1;
    }
    // Convert score to severity
    if (score <= 1) return RiskSeverity.VERY_LOW;
    if (score <= 2) return RiskSeverity.LOW;
    if (score <= 3) return RiskSeverity.MEDIUM;
    if (score <= 4) return RiskSeverity.HIGH;
    if (score <= 5) return RiskSeverity.VERY_HIGH;
    return RiskSeverity.CRITICAL;
  };
  /**
   * Calculate overall risk level
   */
  ImpactAssessmentManager.prototype.calculateRiskLevel = (likelihood, impact) => {
    var _a, _b;
    var likelihoodScore = ((_a = {}),
    (_a[RiskLikelihood.VERY_UNLIKELY] = 1),
    (_a[RiskLikelihood.UNLIKELY] = 2),
    (_a[RiskLikelihood.POSSIBLE] = 3),
    (_a[RiskLikelihood.LIKELY] = 4),
    (_a[RiskLikelihood.VERY_LIKELY] = 5),
    (_a[RiskLikelihood.CERTAIN] = 6),
    _a)[likelihood];
    var impactScore = ((_b = {}),
    (_b[RiskSeverity.VERY_LOW] = 1),
    (_b[RiskSeverity.LOW] = 2),
    (_b[RiskSeverity.MEDIUM] = 3),
    (_b[RiskSeverity.HIGH] = 4),
    (_b[RiskSeverity.VERY_HIGH] = 5),
    (_b[RiskSeverity.CRITICAL] = 6),
    _b)[impact];
    var riskScore = likelihoodScore * impactScore;
    if (riskScore <= 4) return RiskSeverity.VERY_LOW;
    if (riskScore <= 8) return RiskSeverity.LOW;
    if (riskScore <= 15) return RiskSeverity.MEDIUM;
    if (riskScore <= 20) return RiskSeverity.HIGH;
    if (riskScore <= 25) return RiskSeverity.VERY_HIGH;
    return RiskSeverity.CRITICAL;
  };
  /**
   * Calculate overall risk from multiple risks
   */
  ImpactAssessmentManager.prototype.calculateOverallRisk = (risks) => {
    if (risks.length === 0) return RiskSeverity.VERY_LOW;
    var riskScores = risks.map((risk) => {
      var _a;
      var scores =
        ((_a = {}),
        (_a[RiskSeverity.VERY_LOW] = 1),
        (_a[RiskSeverity.LOW] = 2),
        (_a[RiskSeverity.MEDIUM] = 3),
        (_a[RiskSeverity.HIGH] = 4),
        (_a[RiskSeverity.VERY_HIGH] = 5),
        (_a[RiskSeverity.CRITICAL] = 6),
        _a);
      return scores[risk.overallRisk];
    });
    // Use highest risk as overall risk
    var maxScore = Math.max.apply(Math, riskScores);
    var severityMap = {
      1: RiskSeverity.VERY_LOW,
      2: RiskSeverity.LOW,
      3: RiskSeverity.MEDIUM,
      4: RiskSeverity.HIGH,
      5: RiskSeverity.VERY_HIGH,
      6: RiskSeverity.CRITICAL,
    };
    return severityMap[maxScore] || RiskSeverity.MEDIUM;
  };
  /**
   * Check if risk is acceptable
   */
  ImpactAssessmentManager.prototype.isRiskAcceptable = (riskLevel, threshold) => {
    var _a;
    var scores =
      ((_a = {}),
      (_a[RiskSeverity.VERY_LOW] = 1),
      (_a[RiskSeverity.LOW] = 2),
      (_a[RiskSeverity.MEDIUM] = 3),
      (_a[RiskSeverity.HIGH] = 4),
      (_a[RiskSeverity.VERY_HIGH] = 5),
      (_a[RiskSeverity.CRITICAL] = 6),
      _a);
    return scores[riskLevel] <= scores[threshold];
  };
  /**
   * Identify existing controls
   */
  ImpactAssessmentManager.prototype.identifyExistingControls = (category, context) => {
    var technical = [];
    var organizational = [];
    // Technical controls
    if (context.technicalMeasures.encryption) technical.push("Data encryption");
    if (context.technicalMeasures.pseudonymization) technical.push("Data pseudonymization");
    if (context.technicalMeasures.anonymization) technical.push("Data anonymization");
    if (context.technicalMeasures.accessControls) technical.push("Access controls");
    if (context.technicalMeasures.auditLogging) technical.push("Audit logging");
    if (context.technicalMeasures.backupSecurity) technical.push("Backup security");
    if (context.technicalMeasures.networkSecurity) technical.push("Network security");
    // Organizational controls
    if (context.organizationalMeasures.training) organizational.push("Staff training");
    if (context.organizationalMeasures.accessManagement) organizational.push("Access management");
    if (context.organizationalMeasures.incidentResponse) organizational.push("Incident response");
    if (context.organizationalMeasures.vendorManagement) organizational.push("Vendor management");
    if (context.organizationalMeasures.dataGovernance) organizational.push("Data governance");
    organizational.push.apply(organizational, context.organizationalMeasures.policies);
    // Assess effectiveness
    var totalControls = technical.length + organizational.length;
    var maxControls = 15; // Approximate maximum
    var effectiveness;
    if (totalControls < maxControls * 0.3) effectiveness = "low";
    else if (totalControls < maxControls * 0.7) effectiveness = "medium";
    else effectiveness = "high";
    return {
      technical: technical,
      organizational: organizational,
      effectiveness: effectiveness,
    };
  };
  /**
   * Recommend mitigation measures
   */
  ImpactAssessmentManager.prototype.recommendMitigationMeasures = function (
    category,
    riskLevel,
    existingControls,
  ) {
    var recommended = [];
    // Category-specific recommendations
    var categoryRecommendations = this.getCategoryRecommendations(category);
    for (
      var _i = 0, categoryRecommendations_1 = categoryRecommendations;
      _i < categoryRecommendations_1.length;
      _i++
    ) {
      var rec = categoryRecommendations_1[_i];
      // Skip if control already exists
      if (
        existingControls.technical.includes(rec.measure) ||
        existingControls.organizational.includes(rec.measure)
      ) {
        continue;
      }
      recommended.push(rec);
    }
    // Risk-level specific recommendations
    if (
      riskLevel === RiskSeverity.HIGH ||
      riskLevel === RiskSeverity.VERY_HIGH ||
      riskLevel === RiskSeverity.CRITICAL
    ) {
      recommended.push({
        measure: "Enhanced monitoring and alerting",
        priority: "high",
        effort: "medium",
        cost: "medium",
        timeline: "3 months",
        responsible: "IT Security Team",
      });
    }
    // Calculate residual risk
    var residualRisk = this.calculateResidualRisk(riskLevel, recommended.length);
    return {
      recommended: recommended,
      residualRisk: residualRisk,
    };
  };
  /**
   * Get category-specific recommendations
   */
  ImpactAssessmentManager.prototype.getCategoryRecommendations = (category) => {
    var _a;
    var recommendations =
      ((_a = {}),
      (_a[RiskCategory.DATA_BREACH] = [
        {
          measure: "Implement end-to-end encryption",
          priority: "high",
          effort: "high",
          cost: "medium",
          timeline: "6 months",
          responsible: "IT Security Team",
        },
        {
          measure: "Deploy intrusion detection system",
          priority: "high",
          effort: "medium",
          cost: "high",
          timeline: "4 months",
          responsible: "IT Security Team",
        },
      ]),
      (_a[RiskCategory.UNAUTHORIZED_ACCESS] = [
        {
          measure: "Implement multi-factor authentication",
          priority: "high",
          effort: "medium",
          cost: "low",
          timeline: "2 months",
          responsible: "IT Team",
        },
        {
          measure: "Regular access reviews",
          priority: "medium",
          effort: "low",
          cost: "low",
          timeline: "1 month",
          responsible: "HR Team",
        },
      ]),
      (_a[RiskCategory.CONSENT_ISSUES] = [
        {
          measure: "Implement consent management platform",
          priority: "high",
          effort: "high",
          cost: "medium",
          timeline: "4 months",
          responsible: "Legal Team",
        },
        {
          measure: "Regular consent audits",
          priority: "medium",
          effort: "medium",
          cost: "low",
          timeline: "2 months",
          responsible: "Compliance Team",
        },
      ]),
      // Add more categories as needed
      (_a[RiskCategory.DATA_LOSS] = []),
      (_a[RiskCategory.PRIVACY_VIOLATION] = []),
      (_a[RiskCategory.THIRD_PARTY_SHARING] = []),
      (_a[RiskCategory.CROSS_BORDER_TRANSFER] = []),
      (_a[RiskCategory.AUTOMATED_DECISION] = []),
      (_a[RiskCategory.PROFILING] = []),
      (_a[RiskCategory.SURVEILLANCE] = []),
      (_a[RiskCategory.DISCRIMINATION] = []),
      (_a[RiskCategory.REPUTATION_DAMAGE] = []),
      _a);
    return recommendations[category] || [];
  };
  /**
   * Calculate residual risk
   */
  ImpactAssessmentManager.prototype.calculateResidualRisk = (originalRisk, mitigationCount) => {
    var _a;
    var riskScores =
      ((_a = {}),
      (_a[RiskSeverity.VERY_LOW] = 1),
      (_a[RiskSeverity.LOW] = 2),
      (_a[RiskSeverity.MEDIUM] = 3),
      (_a[RiskSeverity.HIGH] = 4),
      (_a[RiskSeverity.VERY_HIGH] = 5),
      (_a[RiskSeverity.CRITICAL] = 6),
      _a);
    var score = riskScores[originalRisk];
    // Reduce risk based on mitigation measures
    var reduction = Math.min(3, Math.floor(mitigationCount / 2));
    score = Math.max(1, score - reduction);
    var severityMap = {
      1: RiskSeverity.VERY_LOW,
      2: RiskSeverity.LOW,
      3: RiskSeverity.MEDIUM,
      4: RiskSeverity.HIGH,
      5: RiskSeverity.VERY_HIGH,
      6: RiskSeverity.CRITICAL,
    };
    return severityMap[score] || RiskSeverity.LOW;
  };
  /**
   * Perform compliance analysis
   */
  ImpactAssessmentManager.prototype.performComplianceAnalysis = function (context) {
    return __awaiter(this, void 0, void 0, function () {
      var gaps,
        lgpdRequirements,
        _i,
        lgpdRequirements_1,
        requirement,
        gap,
        criticalGaps,
        totalRequirements,
        compliantRequirements,
        overallCompliance;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            gaps = [];
            lgpdRequirements = this.getLGPDRequirements();
            (_i = 0), (lgpdRequirements_1 = lgpdRequirements);
            _a.label = 1;
          case 1:
            if (!(_i < lgpdRequirements_1.length)) return [3 /*break*/, 4];
            requirement = lgpdRequirements_1[_i];
            return [4 /*yield*/, this.assessComplianceGap(requirement, context)];
          case 2:
            gap = _a.sent();
            if (gap) {
              gaps.push(gap);
            }
            _a.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            criticalGaps = gaps.filter((g) => g.gapSeverity === "critical").length;
            totalRequirements = lgpdRequirements.length;
            compliantRequirements = totalRequirements - gaps.length;
            overallCompliance = (compliantRequirements / totalRequirements) * 100;
            return [
              2 /*return*/,
              {
                framework: "LGPD",
                gaps: gaps,
                overallCompliance: overallCompliance,
                criticalGaps: criticalGaps,
              },
            ];
        }
      });
    });
  };
  /**
   * Get LGPD requirements for assessment
   */
  ImpactAssessmentManager.prototype.getLGPDRequirements = () => [
    {
      article: "Art. 6",
      requirement: "Legal basis for processing",
      description: "Processing must have a valid legal basis",
    },
    {
      article: "Art. 8",
      requirement: "Consent requirements",
      description: "Consent must be free, informed, and unambiguous",
    },
    {
      article: "Art. 9",
      requirement: "Data subject rights",
      description: "Mechanisms to exercise data subject rights",
    },
    {
      article: "Art. 46",
      requirement: "Security measures",
      description: "Appropriate technical and organizational measures",
    },
    {
      article: "Art. 48",
      requirement: "Incident notification",
      description: "Data breach notification procedures",
    },
    // Add more requirements as needed
  ];
  /**
   * Assess compliance gap
   */
  ImpactAssessmentManager.prototype.assessComplianceGap = function (requirement, context) {
    return __awaiter(this, void 0, void 0, function () {
      var currentState, gap;
      return __generator(this, function (_a) {
        currentState = this.assessCurrentCompliance(requirement, context);
        if (currentState.compliant) {
          return [2 /*return*/, null]; // No gap
        }
        gap = {
          id: this.generateId("gap"),
          article: requirement.article,
          requirement: requirement.requirement,
          description: requirement.description,
          currentState: currentState.description,
          requiredState: "Fully compliant with LGPD requirements",
          gapSeverity: currentState.severity,
          remediation: {
            actions: currentState.actions,
            estimatedCompletion: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
          },
          identifiedBy: "Automated Compliance Assessment",
          identifiedAt: new Date(),
        };
        return [2 /*return*/, gap];
      });
    });
  };
  /**
   * Assess current compliance state
   */
  ImpactAssessmentManager.prototype.assessCurrentCompliance = (requirement, context) => {
    // Simplified assessment logic
    switch (requirement.article) {
      case "Art. 6":
        return {
          compliant: !!context.legalBasis,
          description: context.legalBasis ? "Legal basis documented" : "No legal basis documented",
          severity: context.legalBasis ? "low" : "critical",
          actions: context.legalBasis
            ? []
            : [
                {
                  action: "Document legal basis for processing",
                  priority: "critical",
                  effort: "low",
                  cost: "low",
                  timeline: "1 week",
                  responsible: "Legal Team",
                  dependencies: [],
                },
              ],
        };
      case "Art. 46": {
        var hasBasicSecurity =
          context.technicalMeasures.encryption && context.technicalMeasures.accessControls;
        return {
          compliant: hasBasicSecurity,
          description: hasBasicSecurity
            ? "Basic security measures in place"
            : "Insufficient security measures",
          severity: hasBasicSecurity ? "low" : "high",
          actions: hasBasicSecurity
            ? []
            : [
                {
                  action: "Implement encryption and access controls",
                  priority: "high",
                  effort: "high",
                  cost: "medium",
                  timeline: "3 months",
                  responsible: "IT Security Team",
                  dependencies: ["Budget approval"],
                },
              ],
        };
      }
      default:
        return {
          compliant: false,
          description: "Compliance assessment needed",
          severity: "medium",
          actions: [
            {
              action: "Perform detailed compliance assessment",
              priority: "medium",
              effort: "medium",
              cost: "low",
              timeline: "2 weeks",
              responsible: "Compliance Team",
              dependencies: [],
            },
          ],
        };
    }
  };
  /**
   * Apply template to assessment
   */
  ImpactAssessmentManager.prototype.applyTemplate = (assessment, template) => {
    // Apply template defaults
    assessment.riskAnalysis.acceptableRiskThreshold = template.defaults.riskThreshold;
    assessment.scope.nextReviewDate = new Date(
      Date.now() + template.defaults.reviewFrequency * 30 * 24 * 60 * 60 * 1000,
    );
    // Set up workflow
    assessment.workflow.reviewers = template.defaults.requiredApprovers.map((approver) => ({
      role: approver,
      name: "",
      status: "pending",
    }));
    // Set consultation requirement
    assessment.stakeholderConsultation.required = template.defaults.consultationRequired;
    return assessment;
  };
  /**
   * Get risk description
   */
  ImpactAssessmentManager.prototype.getRiskDescription = (category) => {
    var _a;
    var descriptions =
      ((_a = {}),
      (_a[RiskCategory.DATA_BREACH] =
        "Risk of unauthorized access to personal data due to security vulnerabilities"),
      (_a[RiskCategory.UNAUTHORIZED_ACCESS] =
        "Risk of unauthorized individuals gaining access to personal data"),
      (_a[RiskCategory.DATA_LOSS] =
        "Risk of permanent loss of personal data due to technical failures or human error"),
      (_a[RiskCategory.PRIVACY_VIOLATION] =
        "Risk of violating individual privacy rights through inappropriate data use"),
      (_a[RiskCategory.CONSENT_ISSUES] = "Risk of processing personal data without proper consent"),
      (_a[RiskCategory.THIRD_PARTY_SHARING] =
        "Risk associated with sharing personal data with third parties"),
      (_a[RiskCategory.CROSS_BORDER_TRANSFER] =
        "Risk of transferring personal data to countries without adequate protection"),
      (_a[RiskCategory.AUTOMATED_DECISION] =
        "Risk of automated decision-making affecting individuals"),
      (_a[RiskCategory.PROFILING] = "Risk of creating detailed profiles of individuals"),
      (_a[RiskCategory.SURVEILLANCE] =
        "Risk of excessive monitoring or surveillance of individuals"),
      (_a[RiskCategory.DISCRIMINATION] = "Risk of discriminatory treatment based on personal data"),
      (_a[RiskCategory.REPUTATION_DAMAGE] =
        "Risk of damage to individual reputation due to data misuse"),
      _a);
    return descriptions[category] || "Risk requiring assessment";
  };
  /**
   * Validate assessment
   */
  ImpactAssessmentManager.prototype.validateAssessment = (assessment) => {
    if (!assessment.name || assessment.name.trim().length === 0) {
      throw new Error("Assessment name is required");
    }
    if (!assessment.scope.processingContext) {
      throw new Error("Processing context is required");
    }
    if (!assessment.createdBy || assessment.createdBy.trim().length === 0) {
      throw new Error("Assessment creator is required");
    }
  };
  /**
   * Start review monitoring
   */
  ImpactAssessmentManager.prototype.startReviewMonitoring = function () {
    this.reviewCheckInterval = setInterval(
      () =>
        __awaiter(this, void 0, void 0, function () {
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                return [4 /*yield*/, this.checkDueReviews()];
              case 1:
                _a.sent();
                return [2 /*return*/];
            }
          });
        }),
      24 * 60 * 60 * 1000,
    ); // Daily check
  };
  /**
   * Check for due reviews
   */
  ImpactAssessmentManager.prototype.checkDueReviews = function () {
    return __awaiter(this, void 0, void 0, function () {
      var now, _i, _a, assessment;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            now = new Date();
            (_i = 0), (_a = this.assessments.values());
            _b.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 4];
            assessment = _a[_i];
            if (
              !(
                assessment.scope.nextReviewDate <= now &&
                assessment.status === AssessmentStatus.APPROVED
              )
            )
              return [3 /*break*/, 3];
            assessment.status = AssessmentStatus.REQUIRES_UPDATE;
            return [4 /*yield*/, this.saveAssessment(assessment)];
          case 2:
            _b.sent();
            this.emit("review:due", { assessment: assessment });
            this.logActivity("system", "review_due", {
              assessmentId: assessment.id,
              name: assessment.name,
              nextReviewDate: assessment.scope.nextReviewDate,
            });
            _b.label = 3;
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
   * Get assessments with filtering
   */
  ImpactAssessmentManager.prototype.getAssessments = function (filters) {
    var assessments = Array.from(this.assessments.values());
    if (filters) {
      if (filters.status) {
        assessments = assessments.filter((a) => a.status === filters.status);
      }
      if (filters.riskLevel) {
        assessments = assessments.filter(
          (a) => a.riskAnalysis.overallRiskLevel === filters.riskLevel,
        );
      }
      if (filters.dateRange) {
        assessments = assessments.filter(
          (a) => a.createdAt >= filters.dateRange.start && a.createdAt <= filters.dateRange.end,
        );
      }
    }
    return assessments.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  };
  /**
   * Generate ID
   */
  ImpactAssessmentManager.prototype.generateId = (prefix) =>
    "".concat(prefix, "_").concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
  /**
   * Load templates
   */
  ImpactAssessmentManager.prototype.loadTemplates = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/]);
    });
  };
  /**
   * Load assessments
   */
  ImpactAssessmentManager.prototype.loadAssessments = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/]);
    });
  };
  /**
   * Save assessment
   */
  ImpactAssessmentManager.prototype.saveAssessment = function (assessment) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/]);
    });
  };
  /**
   * Log activity
   */
  ImpactAssessmentManager.prototype.logActivity = (actor, action, details) => {
    // In a real implementation, this would log to audit trail
    console.log("[ImpactAssessment] ".concat(actor, " - ").concat(action, ":"), details);
  };
  /**
   * Shutdown the system
   */
  ImpactAssessmentManager.prototype.shutdown = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        if (this.reviewCheckInterval) {
          clearInterval(this.reviewCheckInterval);
          this.reviewCheckInterval = null;
        }
        this.removeAllListeners();
        this.isInitialized = false;
        this.logActivity("system", "assessment_shutdown", {
          timestamp: new Date(),
        });
        return [2 /*return*/];
      });
    });
  };
  /**
   * Health check
   */
  ImpactAssessmentManager.prototype.getHealthStatus = function () {
    var issues = [];
    if (!this.isInitialized) {
      issues.push("Impact assessment system not initialized");
    }
    if (!this.reviewCheckInterval) {
      issues.push("Review monitoring not running");
    }
    var dueReviews = Array.from(this.assessments.values()).filter(
      (a) => a.scope.nextReviewDate <= new Date() && a.status === AssessmentStatus.APPROVED,
    );
    if (dueReviews.length > 0) {
      issues.push("".concat(dueReviews.length, " assessments require review"));
    }
    var status = issues.length === 0 ? "healthy" : issues.length <= 2 ? "degraded" : "unhealthy";
    return {
      status: status,
      details: {
        initialized: this.isInitialized,
        assessmentsCount: this.assessments.size,
        templatesCount: this.templates.size,
        dueReviews: dueReviews.length,
        autoRiskCalculation: this.config.autoRiskCalculation,
        issues: issues,
      },
    };
  };
  return ImpactAssessmentManager;
})(events_1.EventEmitter);
exports.ImpactAssessmentManager = ImpactAssessmentManager;
/**
 * Default impact assessment manager instance
 */
exports.impactAssessmentManager = new ImpactAssessmentManager();
