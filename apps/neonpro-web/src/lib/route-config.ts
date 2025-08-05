/**
 * Route Configuration Management
 *
 * This module provides utilities for managing route configurations,
 * permissions, and feature flags in a centralized way.
 *
 * @author NeonPro Development Team
 * @version 1.0.0
 */

import type {
  type RoutePermission,
  type SubscriptionTier,
  type UserRole,
} from "./route-protection";

// Route configuration presets
export const ROUTE_PRESETS = {
  PUBLIC: {
    requiresAuth: false,
    requiresSubscription: false,
    auditLevel: "none" as const,
  },
  FREE_TIER: {
    requiresAuth: true,
    requiresSubscription: false,
    auditLevel: "basic" as const,
  },
  BASIC_TIER: {
    requiresAuth: true,
    requiresSubscription: true,
    minimumTier: "basic" as SubscriptionTier,
    allowGracePeriod: true,
    gracePeriodDays: 3,
    auditLevel: "detailed" as const,
  },
  PREMIUM_TIER: {
    requiresAuth: true,
    requiresSubscription: true,
    minimumTier: "premium" as SubscriptionTier,
    allowGracePeriod: true,
    gracePeriodDays: 1,
    auditLevel: "detailed" as const,
  },
  ENTERPRISE_TIER: {
    requiresAuth: true,
    requiresSubscription: true,
    minimumTier: "enterprise" as SubscriptionTier,
    allowGracePeriod: false,
    auditLevel: "detailed" as const,
  },
};

// Role-based access control presets
export const RBAC_PRESETS = {
  PATIENT_ONLY: {
    allowedRoles: ["patient"] as UserRole[],
  },
  STAFF_PLUS: {
    allowedRoles: ["staff", "doctor", "admin", "owner"] as UserRole[],
  },
  DOCTOR_PLUS: {
    allowedRoles: ["doctor", "admin", "owner"] as UserRole[],
  },
  ADMIN_ONLY: {
    allowedRoles: ["admin", "owner"] as UserRole[],
  },
  OWNER_ONLY: {
    allowedRoles: ["owner"] as UserRole[],
  },
};

// Permission level presets
export const PERMISSION_PRESETS = {
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
export const FEATURE_GROUPS = {
  BASIC_FEATURES: ["mobile_app_sync"],
  PREMIUM_FEATURES: ["advanced_treatments", "advanced_reporting", "third_party_integrations"],
  ENTERPRISE_FEATURES: ["multi_clinic_support", "advanced_analytics", "custom_reports"],
  EXPERIMENTAL_FEATURES: ["ai_suggestions"],
};

// Route builder utility
export class RouteBuilder {
  private route: Partial<RoutePermission> = {};

  constructor(pattern: string, name: string) {
    this.route.pattern = pattern;
    this.route.name = name;
  }

  description(desc: string): RouteBuilder {
    this.route.description = desc;
    return this;
  }

  preset(preset: keyof typeof ROUTE_PRESETS): RouteBuilder {
    Object.assign(this.route, ROUTE_PRESETS[preset]);
    return this;
  }

  rbac(preset: keyof typeof RBAC_PRESETS): RouteBuilder {
    Object.assign(this.route, RBAC_PRESETS[preset]);
    return this;
  }

  permissions(preset: keyof typeof PERMISSION_PRESETS): RouteBuilder {
    Object.assign(this.route, PERMISSION_PRESETS[preset]);
    return this;
  }

  features(group: keyof typeof FEATURE_GROUPS): RouteBuilder {
    this.route.featureFlags = FEATURE_GROUPS[group];
    return this;
  }

  rateLimit(rpm: number): RouteBuilder {
    this.route.rateLimitRpm = rpm;
    return this;
  }

  customGracePeriod(days: number): RouteBuilder {
    this.route.gracePeriodDays = days;
    return this;
  }

  build(): RoutePermission {
    if (!this.route.pattern || !this.route.name) {
      throw new Error("Pattern and name are required");
    }

    return {
      requiresAuth: false,
      requiresSubscription: false,
      auditLevel: "none",
      ...this.route,
    } as RoutePermission;
  }
}

// Quick route creation helpers
export const createRoute = (pattern: string, name: string) => new RouteBuilder(pattern, name);

// Predefined route configurations using the builder
export const PREDEFINED_ROUTES: RoutePermission[] = [
  // Public routes
  createRoute("^/$", "home")
    .description("Landing page")
    .preset("PUBLIC")
    .build(),

  createRoute("^/(login|signup|forgot-password|reset-password)$", "auth")
    .description("Authentication pages")
    .preset("PUBLIC")
    .build(),

  // Free tier routes
  createRoute("^/dashboard/?$", "dashboard")
    .description("Main dashboard overview")
    .preset("FREE_TIER")
    .rbac("STAFF_PLUS")
    .build(),

  createRoute("^/dashboard/profile", "profile")
    .description("User profile management")
    .preset("FREE_TIER")
    .permissions("READ_WRITE")
    .build(),

  createRoute("^/dashboard/settings/(account|notifications)$", "settings_basic")
    .description("Basic account settings")
    .preset("FREE_TIER")
    .permissions("READ_WRITE")
    .build(),

  // Billing (always accessible)
  createRoute("^/dashboard/(subscription|billing)", "billing")
    .description("Subscription and billing management")
    .preset("FREE_TIER")
    .rbac("ADMIN_ONLY")
    .permissions("ADMIN_ACCESS")
    .build(),

  // Basic tier routes
  createRoute("^/dashboard/patients", "patients")
    .description("Patient management system")
    .preset("BASIC_TIER")
    .rbac("STAFF_PLUS")
    .permissions("READ_WRITE")
    .rateLimit(100)
    .build(),

  createRoute("^/dashboard/appointments", "appointments")
    .description("Appointment scheduling system")
    .preset("BASIC_TIER")
    .rbac("STAFF_PLUS")
    .permissions("READ_WRITE")
    .rateLimit(150)
    .build(),

  // Premium tier routes
  createRoute("^/dashboard/treatments", "treatments")
    .description("Treatment and procedure management")
    .preset("PREMIUM_TIER")
    .rbac("DOCTOR_PLUS")
    .permissions("READ_WRITE")
    .features("PREMIUM_FEATURES")
    .rateLimit(80)
    .build(),

  createRoute("^/dashboard/reports", "reports")
    .description("Analytics and reporting system")
    .preset("PREMIUM_TIER")
    .rbac("DOCTOR_PLUS")
    .permissions("READ_ONLY")
    .features("PREMIUM_FEATURES")
    .rateLimit(60)
    .build(),

  createRoute("^/dashboard/inventory", "inventory")
    .description("Inventory and stock management")
    .preset("PREMIUM_TIER")
    .rbac("STAFF_PLUS")
    .permissions("READ_WRITE")
    .customGracePeriod(2)
    .rateLimit(70)
    .build(),

  // Enterprise tier routes
  createRoute("^/dashboard/(multi-clinic|franchise)", "multi_clinic")
    .description("Multi-clinic management system")
    .preset("ENTERPRISE_TIER")
    .rbac("ADMIN_ONLY")
    .permissions("ADMIN_ACCESS")
    .features("ENTERPRISE_FEATURES")
    .rateLimit(50)
    .build(),

  createRoute("^/dashboard/analytics/(advanced|custom)", "advanced_analytics")
    .description("Advanced analytics and custom reports")
    .preset("ENTERPRISE_TIER")
    .rbac("ADMIN_ONLY")
    .permissions("ADMIN_ACCESS")
    .features("ENTERPRISE_FEATURES")
    .rateLimit(40)
    .build(),

  // Admin routes
  createRoute("^/dashboard/admin", "admin")
    .description("System administration panel")
    .preset("PREMIUM_TIER")
    .rbac("ADMIN_ONLY")
    .permissions("ADMIN_ACCESS")
    .rateLimit(30)
    .build(),

  createRoute("^/dashboard/settings/(security|integrations|api)$", "admin_settings")
    .description("Advanced system settings")
    .preset("PREMIUM_TIER")
    .rbac("ADMIN_ONLY")
    .permissions("ADMIN_ACCESS")
    .rateLimit(25)
    .build(),
];

// Configuration validation utilities
export class ConfigValidator {
  static validateRoute(route: RoutePermission): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

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
    } catch {
      errors.push("Invalid regex pattern");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static validateAllRoutes(routes: RoutePermission[]): {
    valid: boolean;
    errors: Record<string, string[]>;
  } {
    const errors: Record<string, string[]> = {};
    let hasErrors = false;

    routes.forEach((route, index) => {
      const validation = this.validateRoute(route);
      if (!validation.valid) {
        errors[`route_${index}_${route.name || "unnamed"}`] = validation.errors;
        hasErrors = true;
      }
    });

    // Check for duplicate patterns
    const patterns = new Set<string>();
    routes.forEach((route, index) => {
      if (patterns.has(route.pattern)) {
        if (!errors[`route_${index}_${route.name}`]) {
          errors[`route_${index}_${route.name}`] = [];
        }
        errors[`route_${index}_${route.name}`].push("Duplicate pattern detected");
        hasErrors = true;
      }
      patterns.add(route.pattern);
    });

    return {
      valid: !hasErrors,
      errors,
    };
  }
}

// Export utilities
export { PREDEFINED_ROUTES as DEFAULT_ROUTE_CONFIG };

// Configuration management
export class RouteConfigManager {
  private routes: RoutePermission[] = [];

  constructor(initialRoutes: RoutePermission[] = PREDEFINED_ROUTES) {
    this.routes = [...initialRoutes];
  }

  addRoute(route: RoutePermission): void {
    const validation = ConfigValidator.validateRoute(route);
    if (!validation.valid) {
      throw new Error(`Invalid route configuration: ${validation.errors.join(", ")}`);
    }
    this.routes.push(route);
  }

  removeRoute(name: string): boolean {
    const index = this.routes.findIndex((route) => route.name === name);
    if (index !== -1) {
      this.routes.splice(index, 1);
      return true;
    }
    return false;
  }

  updateRoute(name: string, updates: Partial<RoutePermission>): boolean {
    const index = this.routes.findIndex((route) => route.name === name);
    if (index !== -1) {
      const updatedRoute = { ...this.routes[index], ...updates };
      const validation = ConfigValidator.validateRoute(updatedRoute);
      if (!validation.valid) {
        throw new Error(`Invalid route update: ${validation.errors.join(", ")}`);
      }
      this.routes[index] = updatedRoute;
      return true;
    }
    return false;
  }

  getRoute(name: string): RoutePermission | undefined {
    return this.routes.find((route) => route.name === name);
  }

  getAllRoutes(): RoutePermission[] {
    return [...this.routes];
  }

  validateAll(): { valid: boolean; errors: Record<string, string[]> } {
    return ConfigValidator.validateAllRoutes(this.routes);
  }
}

// Global configuration instance
export const routeConfigManager = new RouteConfigManager();
