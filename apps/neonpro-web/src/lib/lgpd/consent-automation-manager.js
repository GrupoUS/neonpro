"use strict";
/**
 * LGPD Consent Automation Manager
 * Story 1.5: LGPD Compliance Automation
 *
 * This module provides comprehensive automated consent management for LGPD compliance
 * throughout the authentication system with granular permission tracking.
 */
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
exports.createconsentAutomationManager =
  exports.ConsentAutomationManager =
  exports.LGPDPurpose =
  exports.LGPDDataType =
    void 0;
var client_1 = require("@/lib/supabase/client");
var security_audit_logger_1 = require("@/lib/auth/security-audit-logger");
var logger_1 = require("@/lib/logger");
/**
 * LGPD Data Types for consent management
 */
var LGPDDataType;
(function (LGPDDataType) {
  LGPDDataType["AUTHENTICATION"] = "authentication";
  LGPDDataType["PROFILE"] = "profile";
  LGPDDataType["MEDICAL_RECORDS"] = "medical_records";
  LGPDDataType["FINANCIAL"] = "financial";
  LGPDDataType["COMMUNICATION"] = "communication";
  LGPDDataType["ANALYTICS"] = "analytics";
  LGPDDataType["MARKETING"] = "marketing";
  LGPDDataType["THIRD_PARTY_SHARING"] = "third_party_sharing";
})(LGPDDataType || (exports.LGPDDataType = LGPDDataType = {}));
/**
 * LGPD Processing Purposes
 */
var LGPDPurpose;
(function (LGPDPurpose) {
  LGPDPurpose["SERVICE_PROVISION"] = "service_provision";
  LGPDPurpose["LEGAL_OBLIGATION"] = "legal_obligation";
  LGPDPurpose["LEGITIMATE_INTEREST"] = "legitimate_interest";
  LGPDPurpose["CONSENT"] = "consent";
  LGPDPurpose["VITAL_INTEREST"] = "vital_interest";
  LGPDPurpose["PUBLIC_INTEREST"] = "public_interest";
  LGPDPurpose["CONTRACT_PERFORMANCE"] = "contract_performance";
})(LGPDPurpose || (exports.LGPDPurpose = LGPDPurpose = {}));
/**
 * LGPD Consent Automation Manager
 */
var ConsentAutomationManager = /** @class */ (function () {
  function ConsentAutomationManager() {
    this.currentVersion = "1.0.0";
    this.supabase = (0, client_1.createClient)();
    this.auditLogger = new security_audit_logger_1.SecurityAuditLogger();
  }
  /**
   * Collect consent from user with comprehensive tracking
   */
  ConsentAutomationManager.prototype.collectConsent = function (request, ipAddress, userAgent) {
    return __awaiter(this, void 0, void 0, function () {
      var consentRecords,
        timestamp,
        expiresAt,
        _i,
        _a,
        dataType,
        _b,
        _c,
        purpose,
        consentRecord,
        _d,
        data,
        error,
        error_1;
      return __generator(this, function (_e) {
        switch (_e.label) {
          case 0:
            _e.trys.push([0, 8, , 9]);
            consentRecords = [];
            timestamp = new Date();
            expiresAt = request.expirationDays
              ? new Date(timestamp.getTime() + request.expirationDays * 24 * 60 * 60 * 1000)
              : undefined;
            (_i = 0), (_a = request.dataTypes);
            _e.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 7];
            dataType = _a[_i];
            (_b = 0), (_c = request.purposes);
            _e.label = 2;
          case 2:
            if (!(_b < _c.length)) return [3 /*break*/, 6];
            purpose = _c[_b];
            consentRecord = {
              userId: request.userId,
              clinicId: request.clinicId,
              dataType: dataType,
              purpose: purpose,
              consentGiven: true,
              consentVersion: request.version,
              consentText: request.consentText,
              legalBasis: this.getLegalBasisForPurpose(purpose),
              expiresAt: expiresAt,
              createdAt: timestamp,
              updatedAt: timestamp,
              ipAddress: ipAddress,
              userAgent: userAgent,
              metadata: request.metadata,
            };
            return [
              4 /*yield*/,
              this.supabase.from("lgpd_consent_records").insert(consentRecord).select().single(),
            ];
          case 3:
            (_d = _e.sent()), (data = _d.data), (error = _d.error);
            if (error) {
              logger_1.logger.error("Error creating consent record:", error);
              throw new Error("Failed to create consent record: ".concat(error.message));
            }
            consentRecords.push(data);
            // Log consent collection for audit
            return [
              4 /*yield*/,
              this.auditLogger.logSecurityEvent({
                userId: request.userId,
                action: "consent_collected",
                resource: "lgpd_consent",
                details: {
                  dataType: dataType,
                  purpose: purpose,
                  version: request.version,
                  expiresAt:
                    expiresAt === null || expiresAt === void 0 ? void 0 : expiresAt.toISOString(),
                },
                ipAddress: ipAddress,
                userAgent: userAgent,
                severity: "info",
              }),
            ];
          case 4:
            // Log consent collection for audit
            _e.sent();
            _e.label = 5;
          case 5:
            _b++;
            return [3 /*break*/, 2];
          case 6:
            _i++;
            return [3 /*break*/, 1];
          case 7:
            logger_1.logger.info(
              "Collected "
                .concat(consentRecords.length, " consent records for user ")
                .concat(request.userId),
            );
            return [2 /*return*/, consentRecords];
          case 8:
            error_1 = _e.sent();
            logger_1.logger.error("Error in collectConsent:", error_1);
            throw error_1;
          case 9:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Withdraw consent with immediate effect
   */
  ConsentAutomationManager.prototype.withdrawConsent = function (
    userId,
    clinicId,
    dataType,
    purpose,
    reason,
    ipAddress,
    userAgent,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var withdrawnAt, _a, data, error, error_2;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 4, , 5]);
            withdrawnAt = new Date();
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_consent_records")
                .update({
                  consentGiven: false,
                  withdrawnAt: withdrawnAt,
                  updatedAt: withdrawnAt,
                  metadata: { withdrawalReason: reason },
                })
                .eq("userId", userId)
                .eq("clinicId", clinicId)
                .eq("dataType", dataType)
                .eq("purpose", purpose)
                .eq("consentGiven", true)
                .is("withdrawnAt", null)
                .select(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              logger_1.logger.error("Error withdrawing consent:", error);
              throw new Error("Failed to withdraw consent: ".concat(error.message));
            }
            if (!data || data.length === 0) {
              logger_1.logger.warn(
                "No active consent found for withdrawal: "
                  .concat(userId, ", ")
                  .concat(dataType, ", ")
                  .concat(purpose),
              );
              return [2 /*return*/, false];
            }
            // Log consent withdrawal for audit
            return [
              4 /*yield*/,
              this.auditLogger.logSecurityEvent({
                userId: userId,
                action: "consent_withdrawn",
                resource: "lgpd_consent",
                details: {
                  dataType: dataType,
                  purpose: purpose,
                  reason: reason,
                  recordsAffected: data.length,
                },
                ipAddress: ipAddress,
                userAgent: userAgent,
                severity: "info",
              }),
            ];
          case 2:
            // Log consent withdrawal for audit
            _b.sent();
            // Trigger data processing stop for withdrawn consent
            return [
              4 /*yield*/,
              this.triggerDataProcessingStop(userId, clinicId, dataType, purpose),
            ];
          case 3:
            // Trigger data processing stop for withdrawn consent
            _b.sent();
            logger_1.logger.info(
              "Consent withdrawn for user "
                .concat(userId, ": ")
                .concat(dataType, "/")
                .concat(purpose),
            );
            return [2 /*return*/, true];
          case 4:
            error_2 = _b.sent();
            logger_1.logger.error("Error in withdrawConsent:", error_2);
            throw error_2;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Check if user has valid consent for specific data processing
   */
  ConsentAutomationManager.prototype.hasValidConsent = function (
    userId,
    clinicId,
    dataType,
    purpose,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_3;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_consent_records")
                .select("*")
                .eq("userId", userId)
                .eq("clinicId", clinicId)
                .eq("dataType", dataType)
                .eq("purpose", purpose)
                .eq("consentGiven", true)
                .is("withdrawnAt", null)
                .or("expiresAt.is.null,expiresAt.gt.".concat(new Date().toISOString()))
                .order("createdAt", { ascending: false })
                .limit(1),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              logger_1.logger.error("Error checking consent:", error);
              return [2 /*return*/, false];
            }
            return [2 /*return*/, data && data.length > 0];
          case 2:
            error_3 = _b.sent();
            logger_1.logger.error("Error in hasValidConsent:", error_3);
            return [2 /*return*/, false];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get all consents for a user
   */
  ConsentAutomationManager.prototype.getUserConsents = function (userId_1, clinicId_1) {
    return __awaiter(this, arguments, void 0, function (userId, clinicId, activeOnly) {
      var query, _a, data, error, error_4;
      if (activeOnly === void 0) {
        activeOnly = false;
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            query = this.supabase
              .from("lgpd_consent_records")
              .select("*")
              .eq("userId", userId)
              .eq("clinicId", clinicId);
            if (activeOnly) {
              query = query
                .eq("consentGiven", true)
                .is("withdrawnAt", null)
                .or("expiresAt.is.null,expiresAt.gt.".concat(new Date().toISOString()));
            }
            return [4 /*yield*/, query.order("createdAt", { ascending: false })];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              logger_1.logger.error("Error fetching user consents:", error);
              throw new Error("Failed to fetch user consents: ".concat(error.message));
            }
            return [2 /*return*/, data || []];
          case 2:
            error_4 = _b.sent();
            logger_1.logger.error("Error in getUserConsents:", error_4);
            throw error_4;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Update consent version and re-collect if needed
   */
  ConsentAutomationManager.prototype.updateConsentVersion = function (
    userId_1,
    clinicId_1,
    newVersion_1,
    newConsentText_1,
  ) {
    return __awaiter(
      this,
      arguments,
      void 0,
      function (userId, clinicId, newVersion, newConsentText, forceRecollection) {
        var currentConsents,
          requiresRecollection,
          _i,
          currentConsents_1,
          consent,
          _a,
          currentConsents_2,
          consent,
          error_5;
        if (forceRecollection === void 0) {
          forceRecollection = false;
        }
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              _b.trys.push([0, 12, , 13]);
              return [4 /*yield*/, this.getUserConsents(userId, clinicId, true)];
            case 1:
              currentConsents = _b.sent();
              if (currentConsents.length === 0) {
                logger_1.logger.info(
                  "No active consents found for user ".concat(userId, " to update"),
                );
                return [2 /*return*/, true];
              }
              requiresRecollection =
                forceRecollection ||
                this.versionRequiresRecollection(currentConsents[0].consentVersion, newVersion);
              if (!requiresRecollection) return [3 /*break*/, 7];
              (_i = 0), (currentConsents_1 = currentConsents);
              _b.label = 2;
            case 2:
              if (!(_i < currentConsents_1.length)) return [3 /*break*/, 5];
              consent = currentConsents_1[_i];
              return [
                4 /*yield*/,
                this.supabase
                  .from("lgpd_consent_records")
                  .update({
                    consentGiven: false,
                    updatedAt: new Date(),
                    metadata: __assign(__assign({}, consent.metadata), {
                      versionUpdateRequired: true,
                      newVersion: newVersion,
                      requiresRecollection: true,
                    }),
                  })
                  .eq("id", consent.id),
              ];
            case 3:
              _b.sent();
              _b.label = 4;
            case 4:
              _i++;
              return [3 /*break*/, 2];
            case 5:
              // Log version update requirement
              return [
                4 /*yield*/,
                this.auditLogger.logSecurityEvent({
                  userId: userId,
                  action: "consent_version_update_required",
                  resource: "lgpd_consent",
                  details: {
                    oldVersion: currentConsents[0].consentVersion,
                    newVersion: newVersion,
                    consentsAffected: currentConsents.length,
                  },
                  severity: "info",
                }),
              ];
            case 6:
              // Log version update requirement
              _b.sent();
              return [2 /*return*/, false]; // Indicates re-collection needed
            case 7:
              (_a = 0), (currentConsents_2 = currentConsents);
              _b.label = 8;
            case 8:
              if (!(_a < currentConsents_2.length)) return [3 /*break*/, 11];
              consent = currentConsents_2[_a];
              return [
                4 /*yield*/,
                this.supabase
                  .from("lgpd_consent_records")
                  .update({
                    consentVersion: newVersion,
                    consentText: newConsentText,
                    updatedAt: new Date(),
                  })
                  .eq("id", consent.id),
              ];
            case 9:
              _b.sent();
              _b.label = 10;
            case 10:
              _a++;
              return [3 /*break*/, 8];
            case 11:
              logger_1.logger.info(
                "Updated consent version for user ".concat(userId, " to ").concat(newVersion),
              );
              return [2 /*return*/, true];
            case 12:
              error_5 = _b.sent();
              logger_1.logger.error("Error in updateConsentVersion:", error_5);
              throw error_5;
            case 13:
              return [2 /*return*/];
          }
        });
      },
    );
  };
  /**
   * Get consent analytics for clinic
   */
  ConsentAutomationManager.prototype.getConsentAnalytics = function (clinicId, startDate, endDate) {
    return __awaiter(this, void 0, void 0, function () {
      var query,
        _a,
        allConsents,
        error,
        now_1,
        activeConsents_1,
        withdrawnConsents,
        expiredConsents,
        consentsByDataType_1,
        consentsByPurpose_1,
        thirtyDaysAgo_1,
        recentWithdrawals,
        thirtyDaysFromNow_1,
        expiringConsents,
        error_6;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            query = this.supabase.from("lgpd_consent_records").select("*").eq("clinicId", clinicId);
            if (startDate) {
              query = query.gte("createdAt", startDate.toISOString());
            }
            if (endDate) {
              query = query.lte("createdAt", endDate.toISOString());
            }
            return [4 /*yield*/, query];
          case 1:
            (_a = _b.sent()), (allConsents = _a.data), (error = _a.error);
            if (error) {
              logger_1.logger.error("Error fetching consent analytics:", error);
              throw new Error("Failed to fetch consent analytics: ".concat(error.message));
            }
            now_1 = new Date();
            activeConsents_1 =
              (allConsents === null || allConsents === void 0
                ? void 0
                : allConsents.filter(function (c) {
                    return (
                      c.consentGiven &&
                      !c.withdrawnAt &&
                      (!c.expiresAt || new Date(c.expiresAt) > now_1)
                    );
                  })) || [];
            withdrawnConsents =
              (allConsents === null || allConsents === void 0
                ? void 0
                : allConsents.filter(function (c) {
                    return c.withdrawnAt;
                  })) || [];
            expiredConsents =
              (allConsents === null || allConsents === void 0
                ? void 0
                : allConsents.filter(function (c) {
                    return c.expiresAt && new Date(c.expiresAt) <= now_1;
                  })) || [];
            consentsByDataType_1 = {};
            Object.values(LGPDDataType).forEach(function (type) {
              consentsByDataType_1[type] = activeConsents_1.filter(function (c) {
                return c.dataType === type;
              }).length;
            });
            consentsByPurpose_1 = {};
            Object.values(LGPDPurpose).forEach(function (purpose) {
              consentsByPurpose_1[purpose] = activeConsents_1.filter(function (c) {
                return c.purpose === purpose;
              }).length;
            });
            thirtyDaysAgo_1 = new Date(now_1.getTime() - 30 * 24 * 60 * 60 * 1000);
            recentWithdrawals = withdrawnConsents
              .filter(function (c) {
                return c.withdrawnAt && new Date(c.withdrawnAt) > thirtyDaysAgo_1;
              })
              .slice(0, 10);
            thirtyDaysFromNow_1 = new Date(now_1.getTime() + 30 * 24 * 60 * 60 * 1000);
            expiringConsents = activeConsents_1
              .filter(function (c) {
                return c.expiresAt && new Date(c.expiresAt) <= thirtyDaysFromNow_1;
              })
              .slice(0, 10);
            return [
              2 /*return*/,
              {
                totalConsents:
                  (allConsents === null || allConsents === void 0 ? void 0 : allConsents.length) ||
                  0,
                activeConsents: activeConsents_1.length,
                withdrawnConsents: withdrawnConsents.length,
                expiredConsents: expiredConsents.length,
                consentsByDataType: consentsByDataType_1,
                consentsByPurpose: consentsByPurpose_1,
                recentWithdrawals: recentWithdrawals,
                expiringConsents: expiringConsents,
              },
            ];
          case 2:
            error_6 = _b.sent();
            logger_1.logger.error("Error in getConsentAnalytics:", error_6);
            throw error_6;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Clean up expired consents
   */
  ConsentAutomationManager.prototype.cleanupExpiredConsents = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var query, _a, data, error, cleanedCount, error_7;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 4, , 5]);
            query = this.supabase
              .from("lgpd_consent_records")
              .update({
                consentGiven: false,
                updatedAt: new Date(),
                metadata: { expiredAutomatically: true },
              })
              .lt("expiresAt", new Date().toISOString())
              .eq("consentGiven", true)
              .is("withdrawnAt", null);
            if (clinicId) {
              query = query.eq("clinicId", clinicId);
            }
            return [4 /*yield*/, query.select()];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              logger_1.logger.error("Error cleaning up expired consents:", error);
              throw new Error("Failed to cleanup expired consents: ".concat(error.message));
            }
            cleanedCount = (data === null || data === void 0 ? void 0 : data.length) || 0;
            if (!(cleanedCount > 0)) return [3 /*break*/, 3];
            logger_1.logger.info("Cleaned up ".concat(cleanedCount, " expired consents"));
            // Log cleanup for audit
            return [
              4 /*yield*/,
              this.auditLogger.logSecurityEvent({
                userId: "system",
                action: "consent_cleanup_expired",
                resource: "lgpd_consent",
                details: {
                  cleanedCount: cleanedCount,
                  clinicId: clinicId || "all",
                },
                severity: "info",
              }),
            ];
          case 2:
            // Log cleanup for audit
            _b.sent();
            _b.label = 3;
          case 3:
            return [2 /*return*/, cleanedCount];
          case 4:
            error_7 = _b.sent();
            logger_1.logger.error("Error in cleanupExpiredConsents:", error_7);
            throw error_7;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get legal basis for processing purpose
   */
  ConsentAutomationManager.prototype.getLegalBasisForPurpose = function (purpose) {
    var _a;
    var legalBasisMap =
      ((_a = {}),
      (_a[LGPDPurpose.SERVICE_PROVISION] = "Art. 7º, V - execução de contrato"),
      (_a[LGPDPurpose.LEGAL_OBLIGATION] = "Art. 7º, II - cumprimento de obrigação legal"),
      (_a[LGPDPurpose.LEGITIMATE_INTEREST] = "Art. 7º, IX - interesse legítimo"),
      (_a[LGPDPurpose.CONSENT] = "Art. 7º, I - consentimento"),
      (_a[LGPDPurpose.VITAL_INTEREST] = "Art. 7º, IV - proteção da vida"),
      (_a[LGPDPurpose.PUBLIC_INTEREST] = "Art. 7º, III - interesse público"),
      (_a[LGPDPurpose.CONTRACT_PERFORMANCE] = "Art. 7º, V - execução de contrato"),
      _a);
    return legalBasisMap[purpose] || "Art. 7º, I - consentimento";
  };
  /**
   * Check if version change requires consent re-collection
   */
  ConsentAutomationManager.prototype.versionRequiresRecollection = function (
    oldVersion,
    newVersion,
  ) {
    // Simple version comparison - in production, implement semantic versioning
    var oldParts = oldVersion.split(".").map(Number);
    var newParts = newVersion.split(".").map(Number);
    // Major version change requires re-collection
    if (newParts[0] > oldParts[0]) {
      return true;
    }
    // Minor version change with significant changes requires re-collection
    if (newParts[0] === oldParts[0] && newParts[1] > oldParts[1]) {
      return true;
    }
    return false;
  };
  /**
   * Trigger data processing stop for withdrawn consent
   */
  ConsentAutomationManager.prototype.triggerDataProcessingStop = function (
    userId,
    clinicId,
    dataType,
    purpose,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var error_8;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            // This would integrate with other systems to stop data processing
            // For now, we'll log the requirement
            return [
              4 /*yield*/,
              this.auditLogger.logSecurityEvent({
                userId: userId,
                action: "data_processing_stop_required",
                resource: "lgpd_compliance",
                details: {
                  dataType: dataType,
                  purpose: purpose,
                  clinicId: clinicId,
                  stopReason: "consent_withdrawn",
                },
                severity: "warning",
              }),
            ];
          case 1:
            // This would integrate with other systems to stop data processing
            // For now, we'll log the requirement
            _a.sent();
            logger_1.logger.info(
              "Data processing stop triggered for "
                .concat(userId, ": ")
                .concat(dataType, "/")
                .concat(purpose),
            );
            return [3 /*break*/, 3];
          case 2:
            error_8 = _a.sent();
            logger_1.logger.error("Error triggering data processing stop:", error_8);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  return ConsentAutomationManager;
})();
exports.ConsentAutomationManager = ConsentAutomationManager;
// Export singleton instance
var createconsentAutomationManager = function () {
  return new ConsentAutomationManager();
};
exports.createconsentAutomationManager = createconsentAutomationManager;
