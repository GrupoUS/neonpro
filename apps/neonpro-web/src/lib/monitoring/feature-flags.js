/**
 * TASK-001: Foundation Setup & Baseline
 * Feature Flag Management System
 *
 * Provides safe rollout capability with gradual deployment, A/B testing,
 * and emergency rollback functionality for enhancement phases.
 */
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
exports.createfeatureFlagManager = void 0;
exports.useFeatureFlag = useFeatureFlag;
exports.checkFeatureFlagServer = checkFeatureFlagServer;
var client_1 = require("@/lib/supabase/client");
var server_1 = require("@/lib/supabase/server");
var react_1 = require("react");
var FeatureFlagManager = /** @class */ (() => {
  function FeatureFlagManager() {
    this.supabase = (0, client_1.createClient)();
    this.flagCache = new Map();
    this.cacheExpiry = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }
  /**
   * Check if a feature flag is enabled for the current user
   */
  FeatureFlagManager.prototype.isFeatureEnabled = function (flagName, userId, context) {
    return __awaiter(this, void 0, void 0, function () {
      var cachedFlag, flag, _a, data, error, error_1;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            cachedFlag = this.getCachedFlag(flagName);
            flag = cachedFlag;
            if (flag) return [3 /*break*/, 2];
            return [
              4 /*yield*/,
              this.supabase.from("feature_flags").select("*").eq("flag_name", flagName).single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error || !data) {
              return [
                2 /*return*/,
                {
                  flagName: flagName,
                  isEnabled: false,
                  reason: "not_found",
                },
              ];
            }
            flag = data;
            this.setCachedFlag(flagName, flag);
            _b.label = 2;
          case 2:
            // Evaluate flag
            return [2 /*return*/, this.evaluateFlag(flag, userId, context)];
          case 3:
            error_1 = _b.sent();
            console.error("Error evaluating feature flag ".concat(flagName, ":"), error_1);
            return [
              2 /*return*/,
              {
                flagName: flagName,
                isEnabled: false,
                reason: "not_found",
              },
            ];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Evaluate flag based on rules and context
   */
  FeatureFlagManager.prototype.evaluateFlag = function (flag, userId, context) {
    // If flag is globally disabled
    if (!flag.is_enabled) {
      return {
        flagName: flag.flag_name,
        isEnabled: false,
        reason: "disabled",
      };
    }
    // Check target audience rules
    if (flag.target_audience && userId) {
      var isTargeted = this.evaluateTargetAudience(flag.target_audience, userId, context);
      if (isTargeted !== null) {
        return {
          flagName: flag.flag_name,
          isEnabled: isTargeted,
          reason: "target_audience",
          metadata: { target_audience: flag.target_audience },
        };
      }
    }
    // Check percentage rollout
    if (flag.rollout_percentage < 100) {
      var isInRollout = this.evaluatePercentageRollout(
        flag.flag_name,
        flag.rollout_percentage,
        userId,
      );
      return {
        flagName: flag.flag_name,
        isEnabled: isInRollout,
        reason: "percentage_rollout",
        metadata: { rollout_percentage: flag.rollout_percentage },
      };
    }
    // Flag is fully enabled
    return {
      flagName: flag.flag_name,
      isEnabled: true,
      reason: "enabled",
    };
  };
  /**
   * Evaluate target audience rules
   */
  FeatureFlagManager.prototype.evaluateTargetAudience = (targetAudience, userId, context) => {
    // Check user ID targeting
    if (targetAudience.userIds && Array.isArray(targetAudience.userIds)) {
      return targetAudience.userIds.includes(userId);
    }
    // Check clinic ID targeting
    if (
      targetAudience.clinicIds &&
      (context === null || context === void 0 ? void 0 : context.clinicId)
    ) {
      return targetAudience.clinicIds.includes(context.clinicId);
    }
    // Check user role targeting
    if (
      targetAudience.userRoles &&
      (context === null || context === void 0 ? void 0 : context.userRole)
    ) {
      return targetAudience.userRoles.includes(context.userRole);
    }
    // Check custom conditions
    if (targetAudience.conditions && context) {
      for (var _i = 0, _a = Object.entries(targetAudience.conditions); _i < _a.length; _i++) {
        var _b = _a[_i],
          key = _b[0],
          value = _b[1];
        if (context[key] !== value) {
          return false;
        }
      }
      return true;
    }
    return null; // No targeting rules matched
  };
  /**
   * Evaluate percentage rollout using consistent hashing
   */
  FeatureFlagManager.prototype.evaluatePercentageRollout = function (flagName, percentage, userId) {
    if (percentage <= 0) return false;
    if (percentage >= 100) return true;
    // Use consistent hashing to determine if user is in rollout
    var hashInput = "".concat(flagName, "_").concat(userId || "anonymous");
    var hash = this.simpleHash(hashInput);
    var bucket = hash % 100;
    return bucket < percentage;
  };
  /**
   * Simple hash function for consistent rollout
   */
  FeatureFlagManager.prototype.simpleHash = (str) => {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      var char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  };
  /**
   * Create or update a feature flag
   */
  FeatureFlagManager.prototype.upsertFeatureFlag = function (flagName, config) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_2;
      var _b, _c;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            _d.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("feature_flags")
                .upsert(
                  {
                    flag_name: flagName,
                    is_enabled: (_b = config.isEnabled) !== null && _b !== void 0 ? _b : false,
                    rollout_percentage:
                      (_c = config.rolloutPercentage) !== null && _c !== void 0 ? _c : 0,
                    target_audience: config.targetAudience,
                    description: config.description,
                    updated_at: new Date().toISOString(),
                  },
                  {
                    onConflict: "flag_name",
                  },
                )
                .select()
                .single(),
            ];
          case 1:
            (_a = _d.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Error upserting feature flag:", error);
              return [2 /*return*/, null];
            }
            // Update cache
            this.setCachedFlag(flagName, data);
            return [2 /*return*/, data];
          case 2:
            error_2 = _d.sent();
            console.error("Error upserting feature flag:", error_2);
            return [2 /*return*/, null];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Gradually increase rollout percentage
   */
  FeatureFlagManager.prototype.gradualRollout = function (flagName_1, targetPercentage_1) {
    return __awaiter(
      this,
      arguments,
      void 0,
      function (flagName, targetPercentage, incrementStep, intervalMinutes) {
        var flag, currentPercentage, nextPercentage;
        var _this = this;
        if (incrementStep === void 0) {
          incrementStep = 10;
        }
        if (intervalMinutes === void 0) {
          intervalMinutes = 15;
        }
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, this.getFeatureFlag(flagName)];
            case 1:
              flag = _a.sent();
              if (!flag) {
                throw new Error("Feature flag ".concat(flagName, " not found"));
              }
              currentPercentage = flag.rollout_percentage;
              if (currentPercentage >= targetPercentage) {
                console.log("Flag ".concat(flagName, " already at or above target percentage"));
                return [2 /*return*/];
              }
              nextPercentage = Math.min(currentPercentage + incrementStep, targetPercentage);
              return [4 /*yield*/, this.updateFeatureFlagPercentage(flagName, nextPercentage)];
            case 2:
              _a.sent();
              console.log("Rolled out ".concat(flagName, " to ").concat(nextPercentage, "%"));
              // Schedule next increment if not at target
              if (nextPercentage < targetPercentage) {
                setTimeout(
                  () => {
                    _this.gradualRollout(
                      flagName,
                      targetPercentage,
                      incrementStep,
                      intervalMinutes,
                    );
                  },
                  intervalMinutes * 60 * 1000,
                );
              }
              return [2 /*return*/];
          }
        });
      },
    );
  };
  /**
   * Emergency rollback - disable feature flag immediately
   */
  FeatureFlagManager.prototype.emergencyRollback = function (flagName, reason) {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("feature_flags")
                .update({
                  is_enabled: false,
                  rollout_percentage: 0,
                  updated_at: new Date().toISOString(),
                })
                .eq("flag_name", flagName),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              console.error("Emergency rollback failed for ".concat(flagName, ":"), error);
              return [2 /*return*/, false];
            }
            // Clear cache to force immediate re-fetch
            this.clearCachedFlag(flagName);
            console.log(
              "Emergency rollback completed for ".concat(flagName),
              reason ? "Reason: ".concat(reason) : "",
            );
            return [2 /*return*/, true];
          case 2:
            error_3 = _a.sent();
            console.error("Emergency rollback error for ".concat(flagName, ":"), error_3);
            return [2 /*return*/, false];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get all feature flags
   */
  FeatureFlagManager.prototype.getAllFeatureFlags = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_4;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("feature_flags").select("*").order("flag_name"),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Error fetching feature flags:", error);
              return [2 /*return*/, []];
            }
            return [2 /*return*/, data || []];
          case 2:
            error_4 = _b.sent();
            console.error("Error fetching feature flags:", error_4);
            return [2 /*return*/, []];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get single feature flag
   */
  FeatureFlagManager.prototype.getFeatureFlag = function (flagName) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_5;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("feature_flags").select("*").eq("flag_name", flagName).single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error || !data) {
              return [2 /*return*/, null];
            }
            return [2 /*return*/, data];
          case 2:
            error_5 = _b.sent();
            console.error("Error fetching feature flag ".concat(flagName, ":"), error_5);
            return [2 /*return*/, null];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Update feature flag percentage
   */
  FeatureFlagManager.prototype.updateFeatureFlagPercentage = function (flagName, percentage) {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("feature_flags")
                .update({
                  rollout_percentage: Math.max(0, Math.min(100, percentage)),
                  updated_at: new Date().toISOString(),
                })
                .eq("flag_name", flagName),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              console.error("Error updating percentage for ".concat(flagName, ":"), error);
              return [2 /*return*/, false];
            }
            // Clear cache to force re-fetch
            this.clearCachedFlag(flagName);
            return [2 /*return*/, true];
          case 2:
            error_6 = _a.sent();
            console.error("Error updating percentage for ".concat(flagName, ":"), error_6);
            return [2 /*return*/, false];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Cache management methods
   */
  FeatureFlagManager.prototype.getCachedFlag = function (flagName) {
    var expiry = this.cacheExpiry.get(flagName);
    if (expiry && Date.now() > expiry) {
      this.clearCachedFlag(flagName);
      return null;
    }
    return this.flagCache.get(flagName) || null;
  };
  FeatureFlagManager.prototype.setCachedFlag = function (flagName, flag) {
    this.flagCache.set(flagName, flag);
    this.cacheExpiry.set(flagName, Date.now() + this.cacheTimeout);
  };
  FeatureFlagManager.prototype.clearCachedFlag = function (flagName) {
    this.flagCache.delete(flagName);
    this.cacheExpiry.delete(flagName);
  };
  /**
   * Clear all cached flags
   */
  FeatureFlagManager.prototype.clearCache = function () {
    this.flagCache.clear();
    this.cacheExpiry.clear();
  };
  return FeatureFlagManager;
})();
// Export singleton instance
var createfeatureFlagManager = () => new FeatureFlagManager();
exports.createfeatureFlagManager = createfeatureFlagManager;
//React Hook for feature flag usage
function useFeatureFlag(flagName, context) {
  var _a = (0, react_1.useState)({
      flagName: flagName,
      isEnabled: false,
      reason: "not_found",
    }),
    evaluation = _a[0],
    setEvaluation = _a[1];
  var _b = (0, react_1.useState)(true),
    loading = _b[0],
    setLoading = _b[1];
  (0, react_1.useEffect)(() => {
    var checkFlag = () =>
      __awaiter(this, void 0, void 0, function () {
        var userId, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              setLoading(true);
              userId = context === null || context === void 0 ? void 0 : context.userId;
              return [4 /*yield*/, featureFlagManager.isFeatureEnabled(flagName, userId, context)];
            case 1:
              result = _a.sent();
              setEvaluation(result);
              setLoading(false);
              return [2 /*return*/];
          }
        });
      });
    checkFlag();
  }, [flagName, context]);
  return {
    isEnabled: evaluation.isEnabled,
    evaluation: evaluation,
    loading: loading,
  };
}
// Server-side feature flag checking
function checkFeatureFlagServer(flagName, userId, context) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, manager;
    return __generator(this, (_a) => {
      supabase = (0, server_1.createClient)();
      manager = new FeatureFlagManager();
      // Override the client instance for server-side usage
      manager.supabase = supabase;
      return [2 /*return*/, manager.isFeatureEnabled(flagName, userId, context)];
    });
  });
}
