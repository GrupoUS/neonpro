"use strict";
/**
 * LGPD Consent Management System
 * Implements automated consent tracking and management for LGPD compliance
 *
 * Features:
 * - Granular consent tracking for all data types
 * - Consent versioning and historical tracking
 * - Automated consent withdrawal with immediate effect
 * - Consent analytics and reporting
 * - Consent re-confirmation workflows
 * - Consent inheritance for related accounts
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 */
var __extends =
  (this && this.__extends) ||
  (function () {
    var extendStatics = function (d, b) {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function (d, b) {
            d.__proto__ = b;
          }) ||
        function (d, b) {
          for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
        };
      return extendStatics(d, b);
    };
    return function (d, b) {
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
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
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
exports.consentManager =
  exports.ConsentValidator =
  exports.ConsentManager =
  exports.ConsentStatus =
  exports.LGPDLegalBasis =
  exports.LGPDProcessingPurpose =
  exports.LGPDDataType =
    void 0;
var events_1 = require("events");
// ============================================================================
// LGPD CONSENT TYPES & INTERFACES
// ============================================================================
/**
 * LGPD Data Types for Consent Management
 */
var LGPDDataType;
(function (LGPDDataType) {
  LGPDDataType["PERSONAL_DATA"] = "personal_data";
  LGPDDataType["SENSITIVE_DATA"] = "sensitive_data";
  LGPDDataType["BIOMETRIC_DATA"] = "biometric_data";
  LGPDDataType["HEALTH_DATA"] = "health_data";
  LGPDDataType["AUTHENTICATION_DATA"] = "authentication_data";
  LGPDDataType["SESSION_DATA"] = "session_data";
  LGPDDataType["BEHAVIORAL_DATA"] = "behavioral_data";
  LGPDDataType["COMMUNICATION_DATA"] = "communication_data";
  LGPDDataType["FINANCIAL_DATA"] = "financial_data";
  LGPDDataType["LOCATION_DATA"] = "location_data";
})(LGPDDataType || (exports.LGPDDataType = LGPDDataType = {}));
/**
 * LGPD Processing Purposes
 */
var LGPDProcessingPurpose;
(function (LGPDProcessingPurpose) {
  LGPDProcessingPurpose["AUTHENTICATION"] = "authentication";
  LGPDProcessingPurpose["AUTHORIZATION"] = "authorization";
  LGPDProcessingPurpose["SESSION_MANAGEMENT"] = "session_management";
  LGPDProcessingPurpose["SECURITY_MONITORING"] = "security_monitoring";
  LGPDProcessingPurpose["AUDIT_LOGGING"] = "audit_logging";
  LGPDProcessingPurpose["COMMUNICATION"] = "communication";
  LGPDProcessingPurpose["ANALYTICS"] = "analytics";
  LGPDProcessingPurpose["COMPLIANCE"] = "compliance";
  LGPDProcessingPurpose["LEGAL_OBLIGATION"] = "legal_obligation";
  LGPDProcessingPurpose["LEGITIMATE_INTEREST"] = "legitimate_interest";
})(LGPDProcessingPurpose || (exports.LGPDProcessingPurpose = LGPDProcessingPurpose = {}));
/**
 * LGPD Legal Basis for Processing
 */
var LGPDLegalBasis;
(function (LGPDLegalBasis) {
  LGPDLegalBasis["CONSENT"] = "consent";
  LGPDLegalBasis["CONTRACT"] = "contract";
  LGPDLegalBasis["LEGAL_OBLIGATION"] = "legal_obligation";
  LGPDLegalBasis["VITAL_INTERESTS"] = "vital_interests";
  LGPDLegalBasis["PUBLIC_INTEREST"] = "public_interest";
  LGPDLegalBasis["LEGITIMATE_INTERESTS"] = "legitimate_interests";
})(LGPDLegalBasis || (exports.LGPDLegalBasis = LGPDLegalBasis = {}));
/**
 * Consent Status Types
 */
var ConsentStatus;
(function (ConsentStatus) {
  ConsentStatus["GIVEN"] = "given";
  ConsentStatus["WITHDRAWN"] = "withdrawn";
  ConsentStatus["EXPIRED"] = "expired";
  ConsentStatus["PENDING"] = "pending";
  ConsentStatus["INVALID"] = "invalid";
})(ConsentStatus || (exports.ConsentStatus = ConsentStatus = {}));
// ============================================================================
// CONSENT MANAGEMENT SYSTEM
// ============================================================================
/**
 * LGPD Consent Management System
 *
 * Provides comprehensive consent management for LGPD compliance including:
 * - Granular consent tracking and management
 * - Automated consent lifecycle management
 * - Consent analytics and reporting
 * - Audit trail and compliance monitoring
 */
var ConsentManager = /** @class */ (function (_super) {
  __extends(ConsentManager, _super);
  function ConsentManager(config) {
    if (config === void 0) {
      config = {
        defaultExpiryDays: 365,
        renewalReminderDays: 30,
        cleanupIntervalHours: 24,
        analyticsIntervalHours: 6,
        auditEnabled: true,
        encryptionEnabled: true,
      };
    }
    var _this = _super.call(this) || this;
    _this.config = config;
    _this.consents = new Map();
    _this.configurations = new Map();
    _this.analytics = null;
    _this.isInitialized = false;
    _this.cleanupInterval = null;
    _this.analyticsInterval = null;
    _this.setMaxListeners(100);
    return _this;
  }
  /**
   * Initialize the consent management system
   */
  ConsentManager.prototype.initialize = function () {
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
            _a.trys.push([1, 5, , 6]);
            // Load default consent configurations
            return [4 /*yield*/, this.loadDefaultConfigurations()];
          case 2:
            // Load default consent configurations
            _a.sent();
            // Load existing consents
            return [4 /*yield*/, this.loadConsents()];
          case 3:
            // Load existing consents
            _a.sent();
            // Start cleanup and analytics intervals
            this.startCleanupInterval();
            this.startAnalyticsInterval();
            // Generate initial analytics
            return [4 /*yield*/, this.generateAnalytics()];
          case 4:
            // Generate initial analytics
            _a.sent();
            this.isInitialized = true;
            this.emit("consent:audit", {
              userId: "system",
              action: "consent_manager_initialized",
              details: { timestamp: new Date() },
            });
            return [3 /*break*/, 6];
          case 5:
            error_1 = _a.sent();
            throw new Error("Failed to initialize consent manager: ".concat(error_1));
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Process consent request
   */
  ConsentManager.prototype.processConsentRequest = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var results, _i, _a, consentData, consent, error_2;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            results = [];
            (_i = 0), (_a = request.consents);
            _b.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 6];
            consentData = _a[_i];
            _b.label = 2;
          case 2:
            _b.trys.push([2, 4, , 5]);
            return [
              4 /*yield*/,
              this.createConsentRecord({
                userId: request.userId,
                dataType: consentData.dataType,
                purpose: consentData.purpose,
                legalBasis: consentData.legalBasis,
                granted: consentData.granted,
                context: request.context,
                metadata: consentData.metadata,
              }),
            ];
          case 3:
            consent = _b.sent();
            results.push(consent);
            // Emit consent event
            this.emit("consent:given", {
              userId: request.userId,
              consent: consent,
            });
            // Audit log
            this.emit("consent:audit", {
              userId: request.userId,
              action: "consent_processed",
              details: {
                dataType: consentData.dataType,
                purpose: consentData.purpose,
                granted: consentData.granted,
                timestamp: new Date(),
              },
            });
            return [3 /*break*/, 5];
          case 4:
            error_2 = _b.sent();
            this.emit("consent:violation", {
              userId: request.userId,
              violation: "Failed to process consent: ".concat(error_2),
              severity: "high",
            });
            throw error_2;
          case 5:
            _i++;
            return [3 /*break*/, 1];
          case 6:
            return [2 /*return*/, results];
        }
      });
    });
  };
  /**
   * Withdraw consent
   */
  ConsentManager.prototype.withdrawConsent = function (userId, dataType, purpose, reason, context) {
    return __awaiter(this, void 0, void 0, function () {
      var consentKey, consent, auditEntry;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            consentKey = this.generateConsentKey(userId, dataType, purpose);
            consent = this.consents.get(consentKey);
            if (!consent) {
              throw new Error("Consent record not found");
            }
            if (consent.status === ConsentStatus.WITHDRAWN) {
              throw new Error("Consent already withdrawn");
            }
            // Update consent record
            consent.status = ConsentStatus.WITHDRAWN;
            consent.consentGiven = false;
            consent.withdrawalDate = new Date();
            consent.updatedAt = new Date();
            auditEntry = {
              id: this.generateId(),
              action: "withdrawn",
              timestamp: new Date(),
              reason: reason,
              ipAddress:
                (context === null || context === void 0 ? void 0 : context.ipAddress) || "unknown",
              userAgent:
                (context === null || context === void 0 ? void 0 : context.userAgent) || "unknown",
              metadata: {
                interface: context === null || context === void 0 ? void 0 : context.interface,
              },
            };
            consent.auditTrail.push(auditEntry);
            // Save consent
            return [4 /*yield*/, this.saveConsent(consent)];
          case 1:
            // Save consent
            _a.sent();
            // Emit events
            this.emit("consent:withdrawn", {
              userId: userId,
              consent: consent,
              reason: reason,
            });
            this.emit("consent:audit", {
              userId: userId,
              action: "consent_withdrawn",
              details: {
                dataType: dataType,
                purpose: purpose,
                reason: reason,
                timestamp: new Date(),
              },
            });
            return [2 /*return*/, consent];
        }
      });
    });
  };
  /**
   * Renew consent
   */
  ConsentManager.prototype.renewConsent = function (userId, dataType, purpose, context) {
    return __awaiter(this, void 0, void 0, function () {
      var consentKey, consent, config, auditEntry;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            consentKey = this.generateConsentKey(userId, dataType, purpose);
            consent = this.consents.get(consentKey);
            if (!consent) {
              throw new Error("Consent record not found");
            }
            // Update consent record
            consent.status = ConsentStatus.GIVEN;
            consent.consentGiven = true;
            consent.consentDate = new Date();
            consent.withdrawalDate = undefined;
            consent.renewalRequired = false;
            consent.updatedAt = new Date();
            config = this.configurations.get(this.generateConfigKey(dataType, purpose));
            if (config === null || config === void 0 ? void 0 : config.defaultExpiry) {
              consent.expiryDate = new Date(
                Date.now() + config.defaultExpiry * 24 * 60 * 60 * 1000,
              );
            }
            auditEntry = {
              id: this.generateId(),
              action: "renewed",
              timestamp: new Date(),
              ipAddress: context.ipAddress,
              userAgent: context.userAgent,
              metadata: { interface: context.interface },
            };
            consent.auditTrail.push(auditEntry);
            // Save consent
            return [4 /*yield*/, this.saveConsent(consent)];
          case 1:
            // Save consent
            _a.sent();
            // Emit events
            this.emit("consent:renewed", {
              userId: userId,
              consent: consent,
            });
            this.emit("consent:audit", {
              userId: userId,
              action: "consent_renewed",
              details: {
                dataType: dataType,
                purpose: purpose,
                timestamp: new Date(),
              },
            });
            return [2 /*return*/, consent];
        }
      });
    });
  };
  /**
   * Get user consents
   */
  ConsentManager.prototype.getUserConsents = function (userId) {
    return Array.from(this.consents.values())
      .filter(function (consent) {
        return consent.userId === userId;
      })
      .sort(function (a, b) {
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      });
  };
  /**
   * Check if user has valid consent
   */
  ConsentManager.prototype.hasValidConsent = function (userId, dataType, purpose) {
    var consentKey = this.generateConsentKey(userId, dataType, purpose);
    var consent = this.consents.get(consentKey);
    if (!consent) {
      return false;
    }
    return (
      consent.status === ConsentStatus.GIVEN &&
      consent.consentGiven &&
      (!consent.expiryDate || consent.expiryDate > new Date())
    );
  };
  /**
   * Get consents requiring renewal
   */
  ConsentManager.prototype.getConsentsRequiringRenewal = function (userId) {
    var renewalDate = new Date();
    renewalDate.setDate(renewalDate.getDate() + this.config.renewalReminderDays);
    return Array.from(this.consents.values()).filter(function (consent) {
      if (userId && consent.userId !== userId) {
        return false;
      }
      return (
        consent.status === ConsentStatus.GIVEN &&
        consent.expiryDate &&
        consent.expiryDate <= renewalDate &&
        !consent.renewalRequired
      );
    });
  };
  /**
   * Get consent analytics
   */
  ConsentManager.prototype.getAnalytics = function () {
    return this.analytics;
  };
  /**
   * Generate consent analytics
   */
  ConsentManager.prototype.generateAnalytics = function () {
    return __awaiter(this, void 0, void 0, function () {
      var consents,
        now,
        thirtyDaysAgo,
        totalConsents,
        activeConsents,
        withdrawnConsents,
        expiredConsents,
        consentsByType,
        consentsByPurpose,
        consentsByStatus,
        consentRate,
        withdrawalRate,
        renewalRate,
        expiringConsents,
        compliance;
      return __generator(this, function (_a) {
        consents = Array.from(this.consents.values());
        now = new Date();
        thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        totalConsents = consents.length;
        activeConsents = consents.filter(function (c) {
          return c.status === ConsentStatus.GIVEN;
        }).length;
        withdrawnConsents = consents.filter(function (c) {
          return c.status === ConsentStatus.WITHDRAWN;
        }).length;
        expiredConsents = consents.filter(function (c) {
          return c.status === ConsentStatus.EXPIRED;
        }).length;
        consentsByType = consents.reduce(function (acc, consent) {
          acc[consent.dataType] = (acc[consent.dataType] || 0) + 1;
          return acc;
        }, {});
        consentsByPurpose = consents.reduce(function (acc, consent) {
          acc[consent.purpose] = (acc[consent.purpose] || 0) + 1;
          return acc;
        }, {});
        consentsByStatus = consents.reduce(function (acc, consent) {
          acc[consent.status] = (acc[consent.status] || 0) + 1;
          return acc;
        }, {});
        consentRate = totalConsents > 0 ? (activeConsents / totalConsents) * 100 : 0;
        withdrawalRate = totalConsents > 0 ? (withdrawnConsents / totalConsents) * 100 : 0;
        renewalRate =
          totalConsents > 0
            ? (consents.filter(function (c) {
                return c.auditTrail.some(function (entry) {
                  return entry.action === "renewed";
                });
              }).length /
                totalConsents) *
              100
            : 0;
        expiringConsents = consents.filter(function (consent) {
          return (
            consent.expiryDate &&
            consent.expiryDate <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
          );
        }).length;
        compliance = this.assessCompliance(consents);
        this.analytics = {
          totalConsents: totalConsents,
          consentsByType: consentsByType,
          consentsByPurpose: consentsByPurpose,
          consentsByStatus: consentsByStatus,
          consentRate: consentRate,
          withdrawalRate: withdrawalRate,
          renewalRate: renewalRate,
          expiringConsents: expiringConsents,
          trends: {
            daily: {},
            weekly: {},
            monthly: {},
          },
          compliance: compliance,
        };
        this.emit("consent:analytics", { analytics: this.analytics });
        return [2 /*return*/];
      });
    });
  };
  /**
   * Assess compliance
   */
  ConsentManager.prototype.assessCompliance = function (consents) {
    var issues = [];
    var recommendations = [];
    var score = 100;
    // Check for expired consents
    var expiredConsents = consents.filter(function (c) {
      return c.expiryDate && c.expiryDate < new Date() && c.status === ConsentStatus.GIVEN;
    });
    if (expiredConsents.length > 0) {
      issues.push("".concat(expiredConsents.length, " expired consents still active"));
      recommendations.push("Update expired consents to expired status");
      score -= 10;
    }
    // Check for missing audit trails
    var missingAuditTrails = consents.filter(function (c) {
      return c.auditTrail.length === 0;
    });
    if (missingAuditTrails.length > 0) {
      issues.push("".concat(missingAuditTrails.length, " consents without audit trails"));
      recommendations.push("Ensure all consents have complete audit trails");
      score -= 15;
    }
    // Check consent renewal requirements
    var needingRenewal = this.getConsentsRequiringRenewal();
    if (needingRenewal.length > 0) {
      recommendations.push("".concat(needingRenewal.length, " consents require renewal reminders"));
    }
    return {
      score: Math.max(0, score),
      issues: issues,
      recommendations: recommendations,
    };
  };
  /**
   * Create consent record
   */
  ConsentManager.prototype.createConsentRecord = function (data) {
    return __awaiter(this, void 0, void 0, function () {
      var config, now, expiryDate, consent, consentKey;
      var _a, _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            config = this.configurations.get(this.generateConfigKey(data.dataType, data.purpose));
            now = new Date();
            expiryDate = (config === null || config === void 0 ? void 0 : config.defaultExpiry)
              ? new Date(now.getTime() + config.defaultExpiry * 24 * 60 * 60 * 1000)
              : undefined;
            consent = {
              id: this.generateId(),
              userId: data.userId,
              dataType: data.dataType,
              purpose: data.purpose,
              legalBasis: data.legalBasis,
              status: data.granted ? ConsentStatus.GIVEN : ConsentStatus.WITHDRAWN,
              version: "1.0",
              consentGiven: data.granted,
              consentDate: now,
              expiryDate: expiryDate,
              renewalRequired: false,
              metadata: __assign(
                {
                  ipAddress: data.context.ipAddress,
                  userAgent: data.context.userAgent,
                  consentMethod: "explicit",
                  consentInterface: data.context.interface,
                  dataRetentionPeriod:
                    config === null || config === void 0 ? void 0 : config.defaultExpiry,
                  thirdPartySharing:
                    (_a =
                      config === null || config === void 0 ? void 0 : config.thirdPartySharing) ===
                      null || _a === void 0
                      ? void 0
                      : _a.enabled,
                  automatedDecisionMaking:
                    (_b =
                      config === null || config === void 0
                        ? void 0
                        : config.automatedDecisionMaking) === null || _b === void 0
                      ? void 0
                      : _b.enabled,
                },
                data.metadata,
              ),
              auditTrail: [
                {
                  id: this.generateId(),
                  action: data.granted ? "given" : "withdrawn",
                  timestamp: now,
                  ipAddress: data.context.ipAddress,
                  userAgent: data.context.userAgent,
                  metadata: { interface: data.context.interface },
                },
              ],
              createdAt: now,
              updatedAt: now,
            };
            consentKey = this.generateConsentKey(data.userId, data.dataType, data.purpose);
            this.consents.set(consentKey, consent);
            // Save to persistent storage
            return [4 /*yield*/, this.saveConsent(consent)];
          case 1:
            // Save to persistent storage
            _c.sent();
            return [2 /*return*/, consent];
        }
      });
    });
  };
  /**
   * Load default consent configurations
   */
  ConsentManager.prototype.loadDefaultConfigurations = function () {
    return __awaiter(this, void 0, void 0, function () {
      var defaultConfigs, _i, defaultConfigs_1, config, configKey;
      return __generator(this, function (_a) {
        defaultConfigs = [
          {
            dataType: LGPDDataType.PERSONAL_DATA,
            purpose: LGPDProcessingPurpose.AUTHENTICATION,
            legalBasis: LGPDLegalBasis.CONSENT,
            required: true,
            defaultExpiry: 365,
            renewalPeriod: 30,
            description: {
              pt: "Dados pessoais para autenticação no sistema",
              en: "Personal data for system authentication",
            },
            dataUsage: {
              pt: "Utilizados para verificar sua identidade e permitir acesso ao sistema",
              en: "Used to verify your identity and allow system access",
            },
            consequences: {
              pt: "Sem estes dados, não será possível acessar o sistema",
              en: "Without this data, system access will not be possible",
            },
          },
          {
            dataType: LGPDDataType.BIOMETRIC_DATA,
            purpose: LGPDProcessingPurpose.AUTHENTICATION,
            legalBasis: LGPDLegalBasis.CONSENT,
            required: false,
            defaultExpiry: 180,
            renewalPeriod: 30,
            description: {
              pt: "Dados biométricos para autenticação multifator",
              en: "Biometric data for multi-factor authentication",
            },
            dataUsage: {
              pt: "Utilizados para autenticação biométrica adicional",
              en: "Used for additional biometric authentication",
            },
            consequences: {
              pt: "Sem estes dados, a autenticação biométrica não estará disponível",
              en: "Without this data, biometric authentication will not be available",
            },
          },
          {
            dataType: LGPDDataType.SESSION_DATA,
            purpose: LGPDProcessingPurpose.SESSION_MANAGEMENT,
            legalBasis: LGPDLegalBasis.LEGITIMATE_INTERESTS,
            required: true,
            defaultExpiry: 90,
            renewalPeriod: 15,
            description: {
              pt: "Dados de sessão para gerenciamento de acesso",
              en: "Session data for access management",
            },
            dataUsage: {
              pt: "Utilizados para manter sua sessão ativa e segura",
              en: "Used to maintain your active and secure session",
            },
            consequences: {
              pt: "Sem estes dados, será necessário fazer login frequentemente",
              en: "Without this data, frequent logins will be required",
            },
          },
          {
            dataType: LGPDDataType.BEHAVIORAL_DATA,
            purpose: LGPDProcessingPurpose.SECURITY_MONITORING,
            legalBasis: LGPDLegalBasis.LEGITIMATE_INTERESTS,
            required: false,
            defaultExpiry: 365,
            renewalPeriod: 60,
            description: {
              pt: "Dados comportamentais para monitoramento de segurança",
              en: "Behavioral data for security monitoring",
            },
            dataUsage: {
              pt: "Utilizados para detectar atividades suspeitas e proteger sua conta",
              en: "Used to detect suspicious activities and protect your account",
            },
            consequences: {
              pt: "Sem estes dados, a proteção contra atividades suspeitas será limitada",
              en: "Without this data, protection against suspicious activities will be limited",
            },
          },
        ];
        for (_i = 0, defaultConfigs_1 = defaultConfigs; _i < defaultConfigs_1.length; _i++) {
          config = defaultConfigs_1[_i];
          configKey = this.generateConfigKey(config.dataType, config.purpose);
          this.configurations.set(configKey, config);
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Load existing consents
   */
  ConsentManager.prototype.loadConsents = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  /**
   * Save consent to persistent storage
   */
  ConsentManager.prototype.saveConsent = function (consent) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  /**
   * Start cleanup interval
   */
  ConsentManager.prototype.startCleanupInterval = function () {
    var _this = this;
    this.cleanupInterval = setInterval(
      function () {
        return __awaiter(_this, void 0, void 0, function () {
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                return [4 /*yield*/, this.cleanupExpiredConsents()];
              case 1:
                _a.sent();
                return [2 /*return*/];
            }
          });
        });
      },
      this.config.cleanupIntervalHours * 60 * 60 * 1000,
    );
  };
  /**
   * Start analytics interval
   */
  ConsentManager.prototype.startAnalyticsInterval = function () {
    var _this = this;
    this.analyticsInterval = setInterval(
      function () {
        return __awaiter(_this, void 0, void 0, function () {
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                return [4 /*yield*/, this.generateAnalytics()];
              case 1:
                _a.sent();
                return [2 /*return*/];
            }
          });
        });
      },
      this.config.analyticsIntervalHours * 60 * 60 * 1000,
    );
  };
  /**
   * Cleanup expired consents
   */
  ConsentManager.prototype.cleanupExpiredConsents = function () {
    return __awaiter(this, void 0, void 0, function () {
      var now, expiredConsents, _i, _a, consent;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            now = new Date();
            expiredConsents = [];
            (_i = 0), (_a = this.consents.values());
            _b.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 4];
            consent = _a[_i];
            if (
              !(
                consent.expiryDate &&
                consent.expiryDate < now &&
                consent.status === ConsentStatus.GIVEN
              )
            )
              return [3 /*break*/, 3];
            consent.status = ConsentStatus.EXPIRED;
            consent.consentGiven = false;
            consent.updatedAt = now;
            // Add audit entry
            consent.auditTrail.push({
              id: this.generateId(),
              action: "expired",
              timestamp: now,
              ipAddress: "system",
              userAgent: "system",
              metadata: { automated: true },
            });
            expiredConsents.push(consent);
            return [4 /*yield*/, this.saveConsent(consent)];
          case 2:
            _b.sent();
            this.emit("consent:expired", {
              userId: consent.userId,
              consent: consent,
            });
            _b.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            if (expiredConsents.length > 0) {
              this.emit("consent:audit", {
                userId: "system",
                action: "expired_consents_cleanup",
                details: {
                  count: expiredConsents.length,
                  timestamp: now,
                },
              });
            }
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Generate consent key
   */
  ConsentManager.prototype.generateConsentKey = function (userId, dataType, purpose) {
    return "".concat(userId, ":").concat(dataType, ":").concat(purpose);
  };
  /**
   * Generate configuration key
   */
  ConsentManager.prototype.generateConfigKey = function (dataType, purpose) {
    return "".concat(dataType, ":").concat(purpose);
  };
  /**
   * Generate unique ID
   */
  ConsentManager.prototype.generateId = function () {
    return "consent_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
  };
  /**
   * Shutdown the consent manager
   */
  ConsentManager.prototype.shutdown = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        if (this.cleanupInterval) {
          clearInterval(this.cleanupInterval);
          this.cleanupInterval = null;
        }
        if (this.analyticsInterval) {
          clearInterval(this.analyticsInterval);
          this.analyticsInterval = null;
        }
        this.removeAllListeners();
        this.isInitialized = false;
        this.emit("consent:audit", {
          userId: "system",
          action: "consent_manager_shutdown",
          details: { timestamp: new Date() },
        });
        return [2 /*return*/];
      });
    });
  };
  /**
   * Health check
   */
  ConsentManager.prototype.getHealthStatus = function () {
    var issues = [];
    if (!this.isInitialized) {
      issues.push("Consent manager not initialized");
    }
    if (!this.cleanupInterval) {
      issues.push("Cleanup interval not running");
    }
    if (!this.analyticsInterval) {
      issues.push("Analytics interval not running");
    }
    var status = issues.length === 0 ? "healthy" : issues.length <= 2 ? "degraded" : "unhealthy";
    return {
      status: status,
      details: {
        initialized: this.isInitialized,
        totalConsents: this.consents.size,
        totalConfigurations: this.configurations.size,
        issues: issues,
        lastAnalytics: this.analytics ? new Date() : null,
      },
    };
  };
  return ConsentManager;
})(events_1.EventEmitter);
exports.ConsentManager = ConsentManager;
// ============================================================================
// CONSENT UTILITIES
// ============================================================================
/**
 * Consent validation utilities
 */
var ConsentValidator = /** @class */ (function () {
  function ConsentValidator() {}
  /**
   * Validate consent request
   */
  ConsentValidator.validateConsentRequest = function (request) {
    var errors = [];
    if (!request.userId) {
      errors.push("User ID is required");
    }
    if (!request.consents || request.consents.length === 0) {
      errors.push("At least one consent is required");
    }
    if (!request.context) {
      errors.push("Context is required");
    } else {
      if (!request.context.ipAddress) {
        errors.push("IP address is required in context");
      }
      if (!request.context.userAgent) {
        errors.push("User agent is required in context");
      }
    }
    for (var _i = 0, _a = request.consents || []; _i < _a.length; _i++) {
      var consent = _a[_i];
      if (!Object.values(LGPDDataType).includes(consent.dataType)) {
        errors.push("Invalid data type: ".concat(consent.dataType));
      }
      if (!Object.values(LGPDProcessingPurpose).includes(consent.purpose)) {
        errors.push("Invalid purpose: ".concat(consent.purpose));
      }
      if (!Object.values(LGPDLegalBasis).includes(consent.legalBasis)) {
        errors.push("Invalid legal basis: ".concat(consent.legalBasis));
      }
    }
    return {
      valid: errors.length === 0,
      errors: errors,
    };
  };
  /**
   * Validate consent record
   */
  ConsentValidator.validateConsentRecord = function (consent) {
    var errors = [];
    if (!consent.id) {
      errors.push("Consent ID is required");
    }
    if (!consent.userId) {
      errors.push("User ID is required");
    }
    if (!Object.values(LGPDDataType).includes(consent.dataType)) {
      errors.push("Invalid data type: ".concat(consent.dataType));
    }
    if (!Object.values(LGPDProcessingPurpose).includes(consent.purpose)) {
      errors.push("Invalid purpose: ".concat(consent.purpose));
    }
    if (!Object.values(LGPDLegalBasis).includes(consent.legalBasis)) {
      errors.push("Invalid legal basis: ".concat(consent.legalBasis));
    }
    if (!Object.values(ConsentStatus).includes(consent.status)) {
      errors.push("Invalid status: ".concat(consent.status));
    }
    if (consent.expiryDate && consent.expiryDate <= consent.consentDate) {
      errors.push("Expiry date must be after consent date");
    }
    if (!consent.auditTrail || consent.auditTrail.length === 0) {
      errors.push("Audit trail is required");
    }
    return {
      valid: errors.length === 0,
      errors: errors,
    };
  };
  return ConsentValidator;
})();
exports.ConsentValidator = ConsentValidator;
/**
 * Default consent manager instance
 */
exports.consentManager = new ConsentManager();
