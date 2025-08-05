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
exports.ConsentAutomationManager = void 0;
var ConsentAutomationManager = /** @class */ (() => {
  function ConsentAutomationManager(supabase, complianceManager, config) {
    this.supabase = supabase;
    this.complianceManager = complianceManager;
    this.config = config;
  }
  /**
   * Automated Consent Collection with Granular Tracking
   */
  ConsentAutomationManager.prototype.collectConsentWithTracking = function (
    userId,
    purposeId,
    granted,
    metadata,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, consent, consentError, _b, tracking, trackingError, error_1;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 10, , 11]);
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_user_consents")
                .upsert(
                  {
                    user_id: userId,
                    purpose_id: purposeId,
                    granted: granted,
                    ip_address: metadata.ip_address,
                    user_agent: metadata.user_agent,
                    legal_basis: metadata.legal_basis,
                    expires_at: metadata.retention_period
                      ? new Date(
                          Date.now() + this.parseRetentionPeriod(metadata.retention_period),
                        ).toISOString()
                      : null,
                    collection_method: metadata.collection_method,
                    data_categories: metadata.data_categories,
                    processing_activities: metadata.processing_activities,
                    updated_at: new Date().toISOString(),
                  },
                  {
                    onConflict: "user_id,purpose_id",
                  },
                )
                .select("id")
                .single(),
            ];
          case 1:
            (_a = _c.sent()), (consent = _a.data), (consentError = _a.error);
            if (consentError) throw consentError;
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_consent_tracking")
                .insert({
                  consent_id: consent.id,
                  user_id: userId,
                  purpose_id: purposeId,
                  action: granted ? "consent_given" : "consent_withdrawn",
                  previous_status: null, // Will be updated by trigger
                  new_status: granted,
                  change_reason: "user_action",
                  ip_address: metadata.ip_address,
                  user_agent: metadata.user_agent,
                  collection_context: {
                    method: metadata.collection_method,
                    data_categories: metadata.data_categories,
                    processing_activities: metadata.processing_activities,
                    legal_basis: metadata.legal_basis,
                  },
                })
                .select("id")
                .single(),
            ];
          case 2:
            (_b = _c.sent()), (tracking = _b.data), (trackingError = _b.error);
            if (trackingError) throw trackingError;
            if (!(this.config.auto_renewal_enabled && granted && metadata.retention_period))
              return [3 /*break*/, 4];
            return [
              4 /*yield*/,
              this.scheduleConsentRenewal(userId, purposeId, metadata.retention_period),
            ];
          case 3:
            _c.sent();
            _c.label = 4;
          case 4:
            if (!this.config.consent_analytics_enabled) return [3 /*break*/, 6];
            return [4 /*yield*/, this.updateConsentAnalytics(userId, purposeId, granted)];
          case 5:
            _c.sent();
            _c.label = 6;
          case 6:
            if (!this.config.third_party_sync_enabled) return [3 /*break*/, 8];
            return [
              4 /*yield*/,
              this.syncConsentWithThirdParties(userId, purposeId, granted, metadata),
            ];
          case 7:
            _c.sent();
            _c.label = 8;
          case 8:
            // Log audit event
            return [
              4 /*yield*/,
              this.complianceManager.logAuditEvent({
                event_type: granted ? "consent_given" : "consent_withdrawn",
                user_id: userId,
                resource_type: "consent",
                resource_id: consent.id,
                action: "consent_"
                  .concat(granted ? "granted" : "withdrawn", "_for_")
                  .concat(purposeId),
                details: {
                  purpose_id: purposeId,
                  collection_method: metadata.collection_method,
                  legal_basis: metadata.legal_basis,
                  data_categories: metadata.data_categories,
                },
                ip_address: metadata.ip_address,
                user_agent: metadata.user_agent,
              }),
            ];
          case 9:
            // Log audit event
            _c.sent();
            return [
              2 /*return*/,
              {
                success: true,
                consent_id: consent.id,
                tracking_id: tracking.id,
              },
            ];
          case 10:
            error_1 = _c.sent();
            console.error("Error in automated consent collection:", error_1);
            throw new Error("Failed to collect consent with tracking: ".concat(error_1.message));
          case 11:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Automated Consent Renewal System
   */
  ConsentAutomationManager.prototype.scheduleConsentRenewal = function (
    userId,
    purposeId,
    retentionPeriod,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var expiryDate, renewalDate, _a, renewalTask, error, error_2;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            expiryDate = new Date(Date.now() + this.parseRetentionPeriod(retentionPeriod));
            renewalDate = new Date(
              expiryDate.getTime() - this.config.renewal_notice_days * 24 * 60 * 60 * 1000,
            );
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_consent_renewals")
                .insert({
                  user_id: userId,
                  purpose_id: purposeId,
                  current_expiry: expiryDate.toISOString(),
                  renewal_due: renewalDate.toISOString(),
                  notification_sent: false,
                  renewal_completed: false,
                })
                .select("id")
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (renewalTask = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, renewalTask.id];
          case 2:
            error_2 = _b.sent();
            console.error("Error scheduling consent renewal:", error_2);
            throw new Error("Failed to schedule consent renewal: ".concat(error_2.message));
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Process Pending Consent Renewals
   */
  ConsentAutomationManager.prototype.processPendingRenewals = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a,
        pendingRenewals,
        error,
        processed,
        notificationsSent,
        renewalsCompleted,
        errors,
        _i,
        _b,
        renewal,
        gracePeriodEnd,
        renewalError_1,
        error_3;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 13, , 14]);
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_consent_renewals")
                .select(
                  "\n          *,\n          lgpd_user_consents!inner(\n            user_id,\n            purpose_id,\n            granted\n          )\n        ",
                )
                .eq("renewal_completed", false)
                .lte("renewal_due", new Date().toISOString()),
            ];
          case 1:
            (_a = _c.sent()), (pendingRenewals = _a.data), (error = _a.error);
            if (error) throw error;
            processed = 0;
            notificationsSent = 0;
            renewalsCompleted = 0;
            errors = [];
            (_i = 0), (_b = pendingRenewals || []);
            _c.label = 2;
          case 2:
            if (!(_i < _b.length)) return [3 /*break*/, 12];
            renewal = _b[_i];
            _c.label = 3;
          case 3:
            _c.trys.push([3, 10, , 11]);
            processed++;
            if (renewal.notification_sent) return [3 /*break*/, 6];
            return [4 /*yield*/, this.sendConsentRenewalNotification(renewal)];
          case 4:
            _c.sent();
            notificationsSent++;
            // Update notification status
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_consent_renewals")
                .update({ notification_sent: true })
                .eq("id", renewal.id),
            ];
          case 5:
            // Update notification status
            _c.sent();
            _c.label = 6;
          case 6:
            gracePeriodEnd = new Date(
              new Date(renewal.renewal_due).getTime() +
                this.config.withdrawal_grace_period_hours * 60 * 60 * 1000,
            );
            if (!(new Date() > gracePeriodEnd)) return [3 /*break*/, 9];
            // Auto-withdraw consent if no response
            return [4 /*yield*/, this.autoWithdrawExpiredConsent(renewal)];
          case 7:
            // Auto-withdraw consent if no response
            _c.sent();
            renewalsCompleted++;
            // Mark renewal as completed
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_consent_renewals")
                .update({ renewal_completed: true })
                .eq("id", renewal.id),
            ];
          case 8:
            // Mark renewal as completed
            _c.sent();
            _c.label = 9;
          case 9:
            return [3 /*break*/, 11];
          case 10:
            renewalError_1 = _c.sent();
            errors.push("Renewal ".concat(renewal.id, ": ").concat(renewalError_1.message));
            return [3 /*break*/, 11];
          case 11:
            _i++;
            return [3 /*break*/, 2];
          case 12:
            return [
              2 /*return*/,
              {
                processed: processed,
                notifications_sent: notificationsSent,
                renewals_completed: renewalsCompleted,
                errors: errors,
              },
            ];
          case 13:
            error_3 = _c.sent();
            console.error("Error processing pending renewals:", error_3);
            throw new Error("Failed to process pending renewals: ".concat(error_3.message));
          case 14:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Automated Consent Withdrawal with Grace Period
   */
  ConsentAutomationManager.prototype.processConsentWithdrawal = function (
    userId,
    purposeId,
    withdrawalReason,
    metadata,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var effectiveDate, consentError, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 8, , 9]);
            effectiveDate = metadata.immediate
              ? new Date()
              : new Date(Date.now() + this.config.withdrawal_grace_period_hours * 60 * 60 * 1000);
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_user_consents")
                .update({
                  granted: false,
                  withdrawal_date: new Date().toISOString(),
                  withdrawal_reason: withdrawalReason,
                  effective_withdrawal_date: effectiveDate.toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .eq("user_id", userId)
                .eq("purpose_id", purposeId),
            ];
          case 1:
            consentError = _a.sent().error;
            if (consentError) throw consentError;
            // Create tracking record
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_consent_tracking")
                .insert({
                  user_id: userId,
                  purpose_id: purposeId,
                  action: "consent_withdrawn",
                  new_status: false,
                  change_reason: "user_action",
                  withdrawal_reason: withdrawalReason,
                  effective_date: effectiveDate.toISOString(),
                  ip_address: metadata.ip_address,
                  user_agent: metadata.user_agent,
                }),
              // Schedule data processing cessation if not immediate
            ];
          case 2:
            // Create tracking record
            _a.sent();
            if (metadata.immediate) return [3 /*break*/, 4];
            return [
              4 /*yield*/,
              this.scheduleDataProcessingCessation(userId, purposeId, effectiveDate),
            ];
          case 3:
            _a.sent();
            return [3 /*break*/, 6];
          case 4:
            return [4 /*yield*/, this.immediateDataProcessingCessation(userId, purposeId)];
          case 5:
            _a.sent();
            _a.label = 6;
          case 6:
            // Log audit event
            return [
              4 /*yield*/,
              this.complianceManager.logAuditEvent({
                event_type: "consent_withdrawn",
                user_id: userId,
                resource_type: "consent",
                resource_id: purposeId,
                action: "consent_withdrawn_".concat(metadata.immediate ? "immediate" : "scheduled"),
                details: {
                  purpose_id: purposeId,
                  withdrawal_reason: withdrawalReason,
                  effective_date: effectiveDate.toISOString(),
                  immediate: metadata.immediate,
                },
                ip_address: metadata.ip_address,
                user_agent: metadata.user_agent,
              }),
            ];
          case 7:
            // Log audit event
            _a.sent();
            return [
              2 /*return*/,
              {
                success: true,
                effective_date: effectiveDate.toISOString(),
                grace_period_end: metadata.immediate ? undefined : effectiveDate.toISOString(),
              },
            ];
          case 8:
            error_4 = _a.sent();
            console.error("Error processing consent withdrawal:", error_4);
            throw new Error("Failed to process consent withdrawal: ".concat(error_4.message));
          case 9:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Generate Consent Analytics
   */
  ConsentAutomationManager.prototype.generateConsentAnalytics = function (dateRange) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, analytics, error, error_5;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.rpc("generate_consent_analytics", {
                start_date: dateRange.start,
                end_date: dateRange.end,
              }),
            ];
          case 1:
            (_a = _b.sent()), (analytics = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, analytics];
          case 2:
            error_5 = _b.sent();
            console.error("Error generating consent analytics:", error_5);
            throw new Error("Failed to generate consent analytics: ".concat(error_5.message));
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Automated Consent Inheritance for Related Accounts
   */
  ConsentAutomationManager.prototype.processConsentInheritance = function (
    parentUserId,
    childUserIds,
    inheritanceRules,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var inheritedConsents,
        errors,
        _a,
        parentConsents,
        parentError,
        _i,
        childUserIds_1,
        childUserId,
        _b,
        _c,
        parentConsent,
        shouldInherit,
        inheritError_1,
        error_6;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            _d.trys.push([0, 11, , 12]);
            inheritedConsents = 0;
            errors = [];
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_user_consents")
                .select("*")
                .eq("user_id", parentUserId)
                .eq("granted", true),
            ];
          case 1:
            (_a = _d.sent()), (parentConsents = _a.data), (parentError = _a.error);
            if (parentError) throw parentError;
            (_i = 0), (childUserIds_1 = childUserIds);
            _d.label = 2;
          case 2:
            if (!(_i < childUserIds_1.length)) return [3 /*break*/, 10];
            childUserId = childUserIds_1[_i];
            (_b = 0), (_c = parentConsents || []);
            _d.label = 3;
          case 3:
            if (!(_b < _c.length)) return [3 /*break*/, 9];
            parentConsent = _c[_b];
            _d.label = 4;
          case 4:
            _d.trys.push([4, 7, , 8]);
            shouldInherit = this.shouldInheritConsent(parentConsent.purpose, inheritanceRules);
            if (!shouldInherit) return [3 /*break*/, 6];
            return [
              4 /*yield*/,
              this.collectConsentWithTracking(childUserId, parentConsent.purpose_id, true, {
                collection_method: "inheritance",
                data_categories: parentConsent.data_categories || [],
                processing_activities: parentConsent.processing_activities || [],
                legal_basis: "inherited_consent",
                retention_period: parentConsent.retention_period,
              }),
            ];
          case 5:
            _d.sent();
            inheritedConsents++;
            _d.label = 6;
          case 6:
            return [3 /*break*/, 8];
          case 7:
            inheritError_1 = _d.sent();
            errors.push(
              "Child "
                .concat(childUserId, ", Purpose ")
                .concat(parentConsent.purpose_id, ": ")
                .concat(inheritError_1.message),
            );
            return [3 /*break*/, 8];
          case 8:
            _b++;
            return [3 /*break*/, 3];
          case 9:
            _i++;
            return [3 /*break*/, 2];
          case 10:
            return [
              2 /*return*/,
              {
                success: true,
                inherited_consents: inheritedConsents,
                errors: errors,
              },
            ];
          case 11:
            error_6 = _d.sent();
            console.error("Error processing consent inheritance:", error_6);
            throw new Error("Failed to process consent inheritance: ".concat(error_6.message));
          case 12:
            return [2 /*return*/];
        }
      });
    });
  };
  // Private helper methods
  ConsentAutomationManager.prototype.parseRetentionPeriod = (period) => {
    // Parse retention period string (e.g., "1 year", "6 months", "30 days")
    var match = period.match(/(\d+)\s*(year|month|day)s?/i);
    if (!match) return 365 * 24 * 60 * 60 * 1000; // Default 1 year
    var amount = match[1],
      unit = match[2];
    var multipliers = {
      day: 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      year: 365 * 24 * 60 * 60 * 1000,
    };
    return parseInt(amount) * multipliers[unit.toLowerCase()];
  };
  ConsentAutomationManager.prototype.sendConsentRenewalNotification = function (renewal) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementation for sending renewal notifications
        // This would integrate with your notification system
        console.log(
          "Sending renewal notification for user "
            .concat(renewal.user_id, ", purpose ")
            .concat(renewal.purpose_id),
        );
        return [2 /*return*/];
      });
    });
  };
  ConsentAutomationManager.prototype.autoWithdrawExpiredConsent = function (renewal) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.processConsentWithdrawal(
                renewal.user_id,
                renewal.purpose_id,
                "automatic_expiry",
                { immediate: true },
              ),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  ConsentAutomationManager.prototype.scheduleDataProcessingCessation = function (
    userId,
    purposeId,
    effectiveDate,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            // Schedule data processing to stop at effective date
            return [
              4 /*yield*/,
              this.supabase.from("lgpd_data_processing_schedule").insert({
                user_id: userId,
                purpose_id: purposeId,
                action: "cessation",
                scheduled_for: effectiveDate.toISOString(),
              }),
            ];
          case 1:
            // Schedule data processing to stop at effective date
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  ConsentAutomationManager.prototype.immediateDataProcessingCessation = function (
    userId,
    purposeId,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            // Immediately stop data processing for this purpose
            return [
              4 /*yield*/,
              this.supabase.from("lgpd_data_processing_log").insert({
                user_id: userId,
                purpose_id: purposeId,
                action: "immediate_cessation",
                executed_at: new Date().toISOString(),
              }),
            ];
          case 1:
            // Immediately stop data processing for this purpose
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  ConsentAutomationManager.prototype.updateConsentAnalytics = function (
    userId,
    purposeId,
    granted,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            // Update real-time consent analytics
            return [
              4 /*yield*/,
              this.supabase.rpc("update_consent_analytics", {
                user_id: userId,
                purpose_id: purposeId,
                consent_granted: granted,
              }),
            ];
          case 1:
            // Update real-time consent analytics
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  ConsentAutomationManager.prototype.syncConsentWithThirdParties = function (
    userId,
    purposeId,
    granted,
    metadata,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Sync consent status with third-party systems
        console.log(
          "Syncing consent with third parties for user "
            .concat(userId, ", purpose ")
            .concat(purposeId, ": ")
            .concat(granted),
        );
        return [2 /*return*/];
      });
    });
  };
  ConsentAutomationManager.prototype.shouldInheritConsent = (purpose, rules) => {
    var purposeRuleMap = {
      essential: rules.inherit_essential,
      analytics: rules.inherit_analytics,
      marketing: rules.inherit_marketing,
      communication: rules.inherit_communication,
    };
    return purposeRuleMap[purpose] || false;
  };
  return ConsentAutomationManager;
})();
exports.ConsentAutomationManager = ConsentAutomationManager;
