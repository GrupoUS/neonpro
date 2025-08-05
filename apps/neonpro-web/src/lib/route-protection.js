"use strict";
/**
 * Advanced Route Protection System
 *
 * This module provides granular route protection with subscription-based access control,
 * feature flags, and comprehensive audit logging for security compliance.
 *
 * @author NeonPro Development Team
 * @version 1.0.0
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
exports.routeProtector = exports.RouteProtector = void 0;
exports.getSubscriptionTier = getSubscriptionTier;
exports.getUserRole = getUserRole;
exports.calculateGracePeriodEnd = calculateGracePeriodEnd;
// Advanced route configuration
var ROUTE_PERMISSIONS = [
  // Public routes (no authentication required)
  {
    pattern: "^/$",
    name: "home",
    description: "Landing page",
    requiresAuth: false,
    requiresSubscription: false,
    auditLevel: "none",
  },
  {
    pattern: "^/(login|signup|forgot-password|reset-password)$",
    name: "auth",
    description: "Authentication pages",
    requiresAuth: false,
    requiresSubscription: false,
    auditLevel: "basic",
  },
  // Free tier routes (authentication required)
  {
    pattern: "^/dashboard/?$",
    name: "dashboard",
    description: "Main dashboard overview",
    requiresAuth: true,
    requiresSubscription: false,
    allowedRoles: ["patient", "staff", "doctor", "admin", "owner"],
    auditLevel: "basic",
  },
  {
    pattern: "^/dashboard/profile",
    name: "profile",
    description: "User profile management",
    requiresAuth: true,
    requiresSubscription: false,
    requiredPermissions: ["read"],
    auditLevel: "basic",
  },
  {
    pattern: "^/dashboard/settings/(account|notifications)$",
    name: "settings_basic",
    description: "Basic account settings",
    requiresAuth: true,
    requiresSubscription: false,
    requiredPermissions: ["read"],
    auditLevel: "basic",
  },
  // Subscription management (always accessible to manage billing)
  {
    pattern: "^/dashboard/(subscription|billing)",
    name: "billing",
    description: "Subscription and billing management",
    requiresAuth: true,
    requiresSubscription: false,
    allowedRoles: ["admin", "owner"],
    requiredPermissions: ["admin"],
    auditLevel: "detailed",
  },
  // Basic tier routes
  {
    pattern: "^/dashboard/patients",
    name: "patients",
    description: "Patient management system",
    requiresAuth: true,
    requiresSubscription: true,
    minimumTier: "basic",
    allowedRoles: ["staff", "doctor", "admin", "owner"],
    requiredPermissions: ["read"],
    allowGracePeriod: true,
    gracePeriodDays: 3,
    rateLimitRpm: 100,
    auditLevel: "detailed",
  },
  {
    pattern: "^/dashboard/appointments",
    name: "appointments",
    description: "Appointment scheduling system",
    requiresAuth: true,
    requiresSubscription: true,
    minimumTier: "basic",
    allowedRoles: ["staff", "doctor", "admin", "owner"],
    requiredPermissions: ["read"],
    allowGracePeriod: true,
    gracePeriodDays: 3,
    rateLimitRpm: 150,
    auditLevel: "detailed",
  },
  // Premium tier routes
  {
    pattern: "^/dashboard/treatments",
    name: "treatments",
    description: "Treatment and procedure management",
    requiresAuth: true,
    requiresSubscription: true,
    minimumTier: "premium",
    allowedRoles: ["doctor", "admin", "owner"],
    requiredPermissions: ["write"],
    allowGracePeriod: true,
    gracePeriodDays: 1,
    featureFlags: ["advanced_treatments"],
    rateLimitRpm: 80,
    auditLevel: "detailed",
  },
  {
    pattern: "^/dashboard/reports",
    name: "reports",
    description: "Analytics and reporting system",
    requiresAuth: true,
    requiresSubscription: true,
    minimumTier: "premium",
    allowedRoles: ["doctor", "admin", "owner"],
    requiredPermissions: ["read"],
    allowGracePeriod: false,
    featureFlags: ["advanced_reporting"],
    rateLimitRpm: 60,
    auditLevel: "detailed",
  },
  {
    pattern: "^/dashboard/inventory",
    name: "inventory",
    description: "Inventory and stock management",
    requiresAuth: true,
    requiresSubscription: true,
    minimumTier: "premium",
    allowedRoles: ["staff", "admin", "owner"],
    requiredPermissions: ["write"],
    allowGracePeriod: true,
    gracePeriodDays: 2,
    rateLimitRpm: 70,
    auditLevel: "detailed",
  },
  // Enterprise tier routes
  {
    pattern: "^/dashboard/(multi-clinic|franchise)",
    name: "multi_clinic",
    description: "Multi-clinic management system",
    requiresAuth: true,
    requiresSubscription: true,
    minimumTier: "enterprise",
    allowedRoles: ["admin", "owner"],
    requiredPermissions: ["admin"],
    allowGracePeriod: false,
    featureFlags: ["multi_clinic_support"],
    rateLimitRpm: 50,
    auditLevel: "detailed",
  },
  {
    pattern: "^/dashboard/analytics/(advanced|custom)",
    name: "advanced_analytics",
    description: "Advanced analytics and custom reports",
    requiresAuth: true,
    requiresSubscription: true,
    minimumTier: "enterprise",
    allowedRoles: ["admin", "owner"],
    requiredPermissions: ["admin"],
    allowGracePeriod: false,
    featureFlags: ["advanced_analytics", "custom_reports"],
    rateLimitRpm: 40,
    auditLevel: "detailed",
  },
  // Admin only routes
  {
    pattern: "^/dashboard/admin",
    name: "admin",
    description: "System administration panel",
    requiresAuth: true,
    requiresSubscription: true,
    minimumTier: "premium",
    allowedRoles: ["admin", "owner"],
    requiredPermissions: ["admin"],
    allowGracePeriod: false,
    rateLimitRpm: 30,
    auditLevel: "detailed",
  },
  {
    pattern: "^/dashboard/settings/(security|integrations|api)$",
    name: "admin_settings",
    description: "Advanced system settings",
    requiresAuth: true,
    requiresSubscription: true,
    minimumTier: "premium",
    allowedRoles: ["admin", "owner"],
    requiredPermissions: ["admin"],
    allowGracePeriod: false,
    rateLimitRpm: 25,
    auditLevel: "detailed",
  },
];
// Feature flags configuration
var FEATURE_FLAGS = {
  advanced_treatments: true,
  advanced_reporting: true,
  multi_clinic_support: true,
  advanced_analytics: true,
  custom_reports: true,
  ai_suggestions: false, // Feature in development
  mobile_app_sync: true,
  third_party_integrations: true,
};
// Subscription tier hierarchy
var TIER_HIERARCHY = {
  free: 0,
  basic: 1,
  premium: 2,
  enterprise: 3,
};
// Route protection class
var RouteProtector = /** @class */ (function () {
  function RouteProtector() {
    this.accessLogs = [];
    this.rateLimitCache = new Map();
  }
  /**
   * Check if user has access to a specific route
   */
  RouteProtector.prototype.checkAccess = function (req, context) {
    return __awaiter(this, void 0, void 0, function () {
      var startTime,
        route,
        method,
        permission,
        rateLimitResult,
        subscriptionResult,
        roleResult,
        featureResult,
        customResult,
        result,
        error_1,
        result;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            startTime = Date.now();
            route = req.nextUrl.pathname;
            method = req.method;
            _a.label = 1;
          case 1:
            _a.trys.push([1, 4, , 5]);
            permission = this.findRoutePermission(route);
            if (!permission) {
              return [
                2 /*return*/,
                this.createResult(false, "Route not found", "/dashboard", "ROUTE_NOT_FOUND"),
              ];
            }
            // Check authentication requirement
            if (permission.requiresAuth && !context.userId) {
              return [
                2 /*return*/,
                this.createResult(false, "Authentication required", "/login", "AUTH_REQUIRED"),
              ];
            }
            rateLimitResult = this.checkRateLimit(context.userId, permission);
            if (!rateLimitResult.allowed) {
              return [2 /*return*/, rateLimitResult];
            }
            // Check subscription requirement
            if (permission.requiresSubscription) {
              subscriptionResult = this.checkSubscription(context, permission);
              if (!subscriptionResult.allowed) {
                return [2 /*return*/, subscriptionResult];
              }
            }
            roleResult = this.checkRolePermissions(context, permission);
            if (!roleResult.allowed) {
              return [2 /*return*/, roleResult];
            }
            featureResult = this.checkFeatureFlags(context, permission);
            if (!featureResult.allowed) {
              return [2 /*return*/, featureResult];
            }
            if (!permission.customValidator) return [3 /*break*/, 3];
            return [4 /*yield*/, permission.customValidator(req, context)];
          case 2:
            customResult = _a.sent();
            if (!customResult.allowed) {
              return [2 /*return*/, customResult];
            }
            _a.label = 3;
          case 3:
            result = this.createResult(true, "Access granted", undefined, "ACCESS_GRANTED");
            // Log access if audit level requires it
            this.logAccess(req, context, permission, result, Date.now() - startTime);
            return [2 /*return*/, result];
          case 4:
            error_1 = _a.sent();
            result = this.createResult(
              false,
              "System error during access check",
              "/dashboard",
              "SYSTEM_ERROR",
            );
            this.logAccess(req, context, null, result, Date.now() - startTime);
            return [2 /*return*/, result];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Find matching route permission based on pattern matching
   */
  RouteProtector.prototype.findRoutePermission = function (route) {
    for (
      var _i = 0, ROUTE_PERMISSIONS_1 = ROUTE_PERMISSIONS;
      _i < ROUTE_PERMISSIONS_1.length;
      _i++
    ) {
      var permission = ROUTE_PERMISSIONS_1[_i];
      var regex = new RegExp(permission.pattern);
      if (regex.test(route)) {
        return permission;
      }
    }
    return null;
  };
  /**
   * Check subscription requirements
   */
  RouteProtector.prototype.checkSubscription = function (context, permission) {
    // Check minimum tier requirement
    if (permission.minimumTier) {
      var requiredLevel = TIER_HIERARCHY[permission.minimumTier];
      var currentLevel = TIER_HIERARCHY[context.subscriptionTier];
      if (currentLevel < requiredLevel) {
        return this.createResult(
          false,
          "Subscription tier ".concat(permission.minimumTier, " required"),
          "/dashboard/subscription",
          "TIER_REQUIRED",
        );
      }
    }
    // Check subscription status
    if (context.subscriptionStatus !== "active" && context.subscriptionStatus !== "trialing") {
      // Check grace period
      if (permission.allowGracePeriod && context.gracePeriodEndsAt) {
        var now = new Date();
        if (now <= context.gracePeriodEndsAt) {
          return this.createResult(
            true,
            "Access granted (grace period)",
            undefined,
            "GRACE_PERIOD",
          );
        }
      }
      return this.createResult(
        false,
        "Active subscription required",
        "/dashboard/subscription",
        "SUBSCRIPTION_REQUIRED",
      );
    }
    return this.createResult(true, "Subscription check passed", undefined, "SUBSCRIPTION_OK");
  };
  /**
   * Check role and permission requirements
   */
  RouteProtector.prototype.checkRolePermissions = function (context, permission) {
    // Check allowed roles
    if (permission.allowedRoles && !permission.allowedRoles.includes(context.userRole)) {
      return this.createResult(
        false,
        "Role ".concat(context.userRole, " not allowed for this resource"),
        "/dashboard",
        "ROLE_NOT_ALLOWED",
      );
    }
    // Check required permissions
    if (permission.requiredPermissions) {
      var hasRequiredPermissions = permission.requiredPermissions.every(function (required) {
        return context.permissions.includes(required);
      });
      if (!hasRequiredPermissions) {
        return this.createResult(
          false,
          "Insufficient permissions",
          "/dashboard",
          "INSUFFICIENT_PERMISSIONS",
        );
      }
    }
    return this.createResult(true, "Role check passed", undefined, "ROLE_OK");
  };
  /**
   * Check feature flag requirements
   */
  RouteProtector.prototype.checkFeatureFlags = function (context, permission) {
    if (!permission.featureFlags) {
      return this.createResult(true, "No feature flags required", undefined, "NO_FLAGS");
    }
    var missingFlags = permission.featureFlags.filter(function (flag) {
      var globalEnabled = FEATURE_FLAGS[flag];
      var userEnabled = context.featureFlags[flag];
      return !globalEnabled || !userEnabled;
    });
    if (missingFlags.length > 0) {
      return this.createResult(
        false,
        "Feature not available: ".concat(missingFlags.join(", ")),
        "/dashboard",
        "FEATURE_DISABLED",
      );
    }
    return this.createResult(true, "Feature flags check passed", undefined, "FLAGS_OK");
  };
  /**
   * Check rate limiting
   */
  RouteProtector.prototype.checkRateLimit = function (userId, permission) {
    if (!permission.rateLimitRpm) {
      return this.createResult(true, "No rate limit", undefined, "NO_RATE_LIMIT");
    }
    var key = "".concat(userId, ":").concat(permission.name);
    var now = Date.now();
    var windowMs = 60 * 1000; // 1 minute
    var rateLimitInfo = this.rateLimitCache.get(key);
    if (!rateLimitInfo || now >= rateLimitInfo.resetTime) {
      rateLimitInfo = { count: 1, resetTime: now + windowMs };
      this.rateLimitCache.set(key, rateLimitInfo);
      return this.createResult(true, "Rate limit OK", undefined, "RATE_LIMIT_OK");
    }
    if (rateLimitInfo.count >= permission.rateLimitRpm) {
      return this.createResult(false, "Rate limit exceeded", "/dashboard", "RATE_LIMIT_EXCEEDED");
    }
    rateLimitInfo.count++;
    return this.createResult(true, "Rate limit OK", undefined, "RATE_LIMIT_OK");
  };
  /**
   * Create validation result
   */
  RouteProtector.prototype.createResult = function (allowed, reason, redirectTo, errorCode) {
    return {
      allowed: allowed,
      reason: reason,
      redirectTo: redirectTo,
      errorCode: errorCode,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };
  };
  /**
   * Log access attempt
   */
  RouteProtector.prototype.logAccess = function (req, context, permission, result, duration) {
    if (!permission || permission.auditLevel === "none") return;
    var log = {
      userId: context.userId,
      route: req.nextUrl.pathname,
      method: req.method,
      allowed: result.allowed,
      reason: result.reason,
      timestamp: new Date(),
      userAgent: req.headers.get("user-agent") || undefined,
      ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined,
      duration: duration,
      metadata: __assign(
        {
          errorCode: result.errorCode,
          subscriptionTier: context.subscriptionTier,
          userRole: context.userRole,
        },
        permission.auditLevel === "detailed" && {
          subscriptionStatus: context.subscriptionStatus,
          clinicId: context.clinicId,
        },
      ),
    };
    this.accessLogs.push(log);
    // Keep only last 1000 logs to prevent memory leaks
    if (this.accessLogs.length > 1000) {
      this.accessLogs = this.accessLogs.slice(-1000);
    }
  };
  /**
   * Get access logs for audit purposes
   */
  RouteProtector.prototype.getAccessLogs = function (userId, limit) {
    if (limit === void 0) {
      limit = 100;
    }
    var logs = this.accessLogs;
    if (userId) {
      logs = logs.filter(function (log) {
        return log.userId === userId;
      });
    }
    return logs
      .sort(function (a, b) {
        return b.timestamp.getTime() - a.timestamp.getTime();
      })
      .slice(0, limit);
  };
  /**
   * Get route permissions configuration
   */
  RouteProtector.prototype.getRoutePermissions = function () {
    return ROUTE_PERMISSIONS;
  };
  /**
   * Update feature flags (for dynamic feature toggles)
   */
  RouteProtector.prototype.updateFeatureFlag = function (flag, enabled) {
    FEATURE_FLAGS[flag] = enabled;
  };
  /**
   * Get current feature flags state
   */
  RouteProtector.prototype.getFeatureFlags = function () {
    return __assign({}, FEATURE_FLAGS);
  };
  return RouteProtector;
})();
exports.RouteProtector = RouteProtector;
// Global route protector instance
exports.routeProtector = new RouteProtector();
// Utility functions
function getSubscriptionTier(tierString) {
  var validTiers = ["free", "basic", "premium", "enterprise"];
  return validTiers.includes(tierString) ? tierString : "free";
}
function getUserRole(roleString) {
  var validRoles = ["patient", "staff", "doctor", "admin", "owner"];
  return validRoles.includes(roleString) ? roleString : "patient";
}
function calculateGracePeriodEnd(expiresAt, graceDays) {
  if (graceDays === void 0) {
    graceDays = 3;
  }
  var gracePeriodEnd = new Date(expiresAt);
  gracePeriodEnd.setDate(gracePeriodEnd.getDate() + graceDays);
  return gracePeriodEnd;
}
