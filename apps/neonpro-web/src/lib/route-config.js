"use strict";
/**
 * Route Configuration Management
 *
 * This module provides utilities for managing route configurations,
 * permissions, and feature flags in a centralized way.
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
exports.routeConfigManager =
  exports.RouteConfigManager =
  exports.DEFAULT_ROUTE_CONFIG =
  exports.ConfigValidator =
  exports.PREDEFINED_ROUTES =
  exports.createRoute =
  exports.RouteBuilder =
  exports.FEATURE_GROUPS =
  exports.PERMISSION_PRESETS =
  exports.RBAC_PRESETS =
  exports.ROUTE_PRESETS =
    void 0;
// Route configuration presets
exports.ROUTE_PRESETS = {
  PUBLIC: {
    requiresAuth: false,
    requiresSubscription: false,
    auditLevel: "none",
  },
  FREE_TIER: {
    requiresAuth: true,
    requiresSubscription: false,
    auditLevel: "basic",
  },
  BASIC_TIER: {
    requiresAuth: true,
    requiresSubscription: true,
    minimumTier: "basic",
    allowGracePeriod: true,
    gracePeriodDays: 3,
    auditLevel: "detailed",
  },
  PREMIUM_TIER: {
    requiresAuth: true,
    requiresSubscription: true,
    minimumTier: "premium",
    allowGracePeriod: true,
    gracePeriodDays: 1,
    auditLevel: "detailed",
  },
  ENTERPRISE_TIER: {
    requiresAuth: true,
    requiresSubscription: true,
    minimumTier: "enterprise",
    allowGracePeriod: false,
    auditLevel: "detailed",
  },
};
// Role-based access control presets
exports.RBAC_PRESETS = {
  PATIENT_ONLY: {
    allowedRoles: ["patient"],
  },
  STAFF_PLUS: {
    allowedRoles: ["staff", "doctor", "admin", "owner"],
  },
  DOCTOR_PLUS: {
    allowedRoles: ["doctor", "admin", "owner"],
  },
  ADMIN_ONLY: {
    allowedRoles: ["admin", "owner"],
  },
  OWNER_ONLY: {
    allowedRoles: ["owner"],
  },
};
// Permission level presets
exports.PERMISSION_PRESETS = {
  READ_ONLY: {
    requiredPermissions: ["read"],
  },
  READ_WRITE: {
    requiredPermissions: ["read", "write"],
  },
  ADMIN_ACCESS: {
    requiredPermissions: ["read", "write", "admin"],
  },
  OWNER_ACCESS: {
    requiredPermissions: ["read", "write", "admin", "owner"],
  },
};
// Feature flag groups
exports.FEATURE_GROUPS = {
  BASIC_FEATURES: ["mobile_app_sync"],
  PREMIUM_FEATURES: ["advanced_treatments", "advanced_reporting", "third_party_integrations"],
  ENTERPRISE_FEATURES: ["multi_clinic_support", "advanced_analytics", "custom_reports"],
  EXPERIMENTAL_FEATURES: ["ai_suggestions"],
};
// Route builder utility
var RouteBuilder = /** @class */ (function () {
  function RouteBuilder(pattern, name) {
    this.route = {};
    this.route.pattern = pattern;
    this.route.name = name;
  }
  RouteBuilder.prototype.description = function (desc) {
    this.route.description = desc;
    return this;
  };
  RouteBuilder.prototype.preset = function (preset) {
    Object.assign(this.route, exports.ROUTE_PRESETS[preset]);
    return this;
  };
  RouteBuilder.prototype.rbac = function (preset) {
    Object.assign(this.route, exports.RBAC_PRESETS[preset]);
    return this;
  };
  RouteBuilder.prototype.permissions = function (preset) {
    Object.assign(this.route, exports.PERMISSION_PRESETS[preset]);
    return this;
  };
  RouteBuilder.prototype.features = function (group) {
    this.route.featureFlags = exports.FEATURE_GROUPS[group];
    return this;
  };
  RouteBuilder.prototype.rateLimit = function (rpm) {
    this.route.rateLimitRpm = rpm;
    return this;
  };
  RouteBuilder.prototype.customGracePeriod = function (days) {
    this.route.gracePeriodDays = days;
    return this;
  };
  RouteBuilder.prototype.build = function () {
    if (!this.route.pattern || !this.route.name) {
      throw new Error("Pattern and name are required");
    }
    return __assign(
      { requiresAuth: false, requiresSubscription: false, auditLevel: "none" },
      this.route,
    );
  };
  return RouteBuilder;
})();
exports.RouteBuilder = RouteBuilder;
// Quick route creation helpers
var createRoute = function (pattern, name) {
  return new RouteBuilder(pattern, name);
};
exports.createRoute = createRoute;
// Predefined route configurations using the builder
exports.PREDEFINED_ROUTES = [
  // Public routes
  (0, exports.createRoute)("^/$", "home")
    .description("Landing page")
    .preset("PUBLIC")
    .build(),
  (0, exports.createRoute)("^/(login|signup|forgot-password|reset-password)$", "auth")
    .description("Authentication pages")
    .preset("PUBLIC")
    .build(),
  // Free tier routes
  (0, exports.createRoute)("^/dashboard/?$", "dashboard")
    .description("Main dashboard overview")
    .preset("FREE_TIER")
    .rbac("STAFF_PLUS")
    .build(),
  (0, exports.createRoute)("^/dashboard/profile", "profile")
    .description("User profile management")
    .preset("FREE_TIER")
    .permissions("READ_WRITE")
    .build(),
  (0, exports.createRoute)("^/dashboard/settings/(account|notifications)$", "settings_basic")
    .description("Basic account settings")
    .preset("FREE_TIER")
    .permissions("READ_WRITE")
    .build(),
  // Billing (always accessible)
  (0, exports.createRoute)("^/dashboard/(subscription|billing)", "billing")
    .description("Subscription and billing management")
    .preset("FREE_TIER")
    .rbac("ADMIN_ONLY")
    .permissions("ADMIN_ACCESS")
    .build(),
  // Basic tier routes
  (0, exports.createRoute)("^/dashboard/patients", "patients")
    .description("Patient management system")
    .preset("BASIC_TIER")
    .rbac("STAFF_PLUS")
    .permissions("READ_WRITE")
    .rateLimit(100)
    .build(),
  (0, exports.createRoute)("^/dashboard/appointments", "appointments")
    .description("Appointment scheduling system")
    .preset("BASIC_TIER")
    .rbac("STAFF_PLUS")
    .permissions("READ_WRITE")
    .rateLimit(150)
    .build(),
  // Premium tier routes
  (0, exports.createRoute)("^/dashboard/treatments", "treatments")
    .description("Treatment and procedure management")
    .preset("PREMIUM_TIER")
    .rbac("DOCTOR_PLUS")
    .permissions("READ_WRITE")
    .features("PREMIUM_FEATURES")
    .rateLimit(80)
    .build(),
  (0, exports.createRoute)("^/dashboard/reports", "reports")
    .description("Analytics and reporting system")
    .preset("PREMIUM_TIER")
    .rbac("DOCTOR_PLUS")
    .permissions("READ_ONLY")
    .features("PREMIUM_FEATURES")
    .rateLimit(60)
    .build(),
  (0, exports.createRoute)("^/dashboard/inventory", "inventory")
    .description("Inventory and stock management")
    .preset("PREMIUM_TIER")
    .rbac("STAFF_PLUS")
    .permissions("READ_WRITE")
    .customGracePeriod(2)
    .rateLimit(70)
    .build(),
  // Enterprise tier routes
  (0, exports.createRoute)("^/dashboard/(multi-clinic|franchise)", "multi_clinic")
    .description("Multi-clinic management system")
    .preset("ENTERPRISE_TIER")
    .rbac("ADMIN_ONLY")
    .permissions("ADMIN_ACCESS")
    .features("ENTERPRISE_FEATURES")
    .rateLimit(50)
    .build(),
  (0, exports.createRoute)("^/dashboard/analytics/(advanced|custom)", "advanced_analytics")
    .description("Advanced analytics and custom reports")
    .preset("ENTERPRISE_TIER")
    .rbac("ADMIN_ONLY")
    .permissions("ADMIN_ACCESS")
    .features("ENTERPRISE_FEATURES")
    .rateLimit(40)
    .build(),
  // Admin routes
  (0, exports.createRoute)("^/dashboard/admin", "admin")
    .description("System administration panel")
    .preset("PREMIUM_TIER")
    .rbac("ADMIN_ONLY")
    .permissions("ADMIN_ACCESS")
    .rateLimit(30)
    .build(),
  (0, exports.createRoute)("^/dashboard/settings/(security|integrations|api)$", "admin_settings")
    .description("Advanced system settings")
    .preset("PREMIUM_TIER")
    .rbac("ADMIN_ONLY")
    .permissions("ADMIN_ACCESS")
    .rateLimit(25)
    .build(),
];
exports.DEFAULT_ROUTE_CONFIG = exports.PREDEFINED_ROUTES;
// Configuration validation utilities
var ConfigValidator = /** @class */ (function () {
  function ConfigValidator() {}
  ConfigValidator.validateRoute = function (route) {
    var errors = [];
    if (!route.pattern) {
      errors.push("Pattern is required");
    }
    if (!route.name) {
      errors.push("Name is required");
    }
    if (!route.description) {
      errors.push("Description is required");
    }
    if (route.requiresSubscription && !route.minimumTier) {
      errors.push("Minimum tier is required when subscription is required");
    }
    if (route.allowGracePeriod && !route.gracePeriodDays) {
      errors.push("Grace period days required when grace period is allowed");
    }
    // Validate pattern as regex
    try {
      new RegExp(route.pattern);
    } catch (_a) {
      errors.push("Invalid regex pattern");
    }
    return {
      valid: errors.length === 0,
      errors: errors,
    };
  };
  ConfigValidator.validateAllRoutes = function (routes) {
    var _this = this;
    var errors = {};
    var hasErrors = false;
    routes.forEach(function (route, index) {
      var validation = _this.validateRoute(route);
      if (!validation.valid) {
        errors["route_".concat(index, "_").concat(route.name || "unnamed")] = validation.errors;
        hasErrors = true;
      }
    });
    // Check for duplicate patterns
    var patterns = new Set();
    routes.forEach(function (route, index) {
      if (patterns.has(route.pattern)) {
        if (!errors["route_".concat(index, "_").concat(route.name)]) {
          errors["route_".concat(index, "_").concat(route.name)] = [];
        }
        errors["route_".concat(index, "_").concat(route.name)].push("Duplicate pattern detected");
        hasErrors = true;
      }
      patterns.add(route.pattern);
    });
    return {
      valid: !hasErrors,
      errors: errors,
    };
  };
  return ConfigValidator;
})();
exports.ConfigValidator = ConfigValidator;
// Configuration management
var RouteConfigManager = /** @class */ (function () {
  function RouteConfigManager(initialRoutes) {
    if (initialRoutes === void 0) {
      initialRoutes = exports.PREDEFINED_ROUTES;
    }
    this.routes = [];
    this.routes = __spreadArray([], initialRoutes, true);
  }
  RouteConfigManager.prototype.addRoute = function (route) {
    var validation = ConfigValidator.validateRoute(route);
    if (!validation.valid) {
      throw new Error("Invalid route configuration: ".concat(validation.errors.join(", ")));
    }
    this.routes.push(route);
  };
  RouteConfigManager.prototype.removeRoute = function (name) {
    var index = this.routes.findIndex(function (route) {
      return route.name === name;
    });
    if (index !== -1) {
      this.routes.splice(index, 1);
      return true;
    }
    return false;
  };
  RouteConfigManager.prototype.updateRoute = function (name, updates) {
    var index = this.routes.findIndex(function (route) {
      return route.name === name;
    });
    if (index !== -1) {
      var updatedRoute = __assign(__assign({}, this.routes[index]), updates);
      var validation = ConfigValidator.validateRoute(updatedRoute);
      if (!validation.valid) {
        throw new Error("Invalid route update: ".concat(validation.errors.join(", ")));
      }
      this.routes[index] = updatedRoute;
      return true;
    }
    return false;
  };
  RouteConfigManager.prototype.getRoute = function (name) {
    return this.routes.find(function (route) {
      return route.name === name;
    });
  };
  RouteConfigManager.prototype.getAllRoutes = function () {
    return __spreadArray([], this.routes, true);
  };
  RouteConfigManager.prototype.validateAll = function () {
    return ConfigValidator.validateAllRoutes(this.routes);
  };
  return RouteConfigManager;
})();
exports.RouteConfigManager = RouteConfigManager;
// Global configuration instance
exports.routeConfigManager = new RouteConfigManager();
