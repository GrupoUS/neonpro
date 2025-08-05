"use strict";
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
exports.routeProtector =
  exports.healthCheck =
  exports.globalSubscriptionCache =
  exports.getPerformanceSummary =
  exports.getPerformanceMetrics =
  exports.getCacheStats =
  exports.clearSubscriptionCache =
  exports.cacheManager =
    void 0;
exports.subscriptionMiddleware = subscriptionMiddleware;
exports.validateUserAccess = validateUserAccess;
var ssr_1 = require("@supabase/ssr");
var server_1 = require("next/server");
var route_protection_1 = require("../lib/route-protection");
Object.defineProperty(exports, "routeProtector", {
  enumerable: true,
  get: function () {
    return route_protection_1.routeProtector;
  },
});
var subscription_cache_1 = require("../lib/subscription-cache");
Object.defineProperty(exports, "cacheManager", {
  enumerable: true,
  get: function () {
    return subscription_cache_1.cacheManager;
  },
});
Object.defineProperty(exports, "globalSubscriptionCache", {
  enumerable: true,
  get: function () {
    return subscription_cache_1.globalSubscriptionCache;
  },
});
var subscription_status_1 = require("../lib/subscription-status");
Object.defineProperty(exports, "clearSubscriptionCache", {
  enumerable: true,
  get: function () {
    return subscription_status_1.clearSubscriptionCache;
  },
});
Object.defineProperty(exports, "getCacheStats", {
  enumerable: true,
  get: function () {
    return subscription_status_1.getCacheStats;
  },
});
Object.defineProperty(exports, "getPerformanceMetrics", {
  enumerable: true,
  get: function () {
    return subscription_status_1.getPerformanceMetrics;
  },
});
Object.defineProperty(exports, "getPerformanceSummary", {
  enumerable: true,
  get: function () {
    return subscription_status_1.getPerformanceSummary;
  },
});
Object.defineProperty(exports, "healthCheck", {
  enumerable: true,
  get: function () {
    return subscription_status_1.healthCheck;
  },
});
/**
 * Enhanced subscription middleware with granular route protection
 * Integrates advanced route protection system for subscription-based access control
 */
function subscriptionMiddleware(req) {
  return __awaiter(this, void 0, void 0, function () {
    var startTime,
      pathname,
      supabase,
      _a,
      session,
      sessionError,
      routeContext,
      profile,
      subscription,
      accessResult,
      redirectUrl,
      response,
      processingTime,
      error_1,
      errorTime,
      errorUrl,
      response;
    var _b;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          startTime = Date.now();
          pathname = req.nextUrl.pathname;
          _c.label = 1;
        case 1:
          _c.trys.push([1, 9, , 10]);
          console.log("🔐 Enhanced Subscription Middleware: Processing request for:", pathname);
          supabase = (0, ssr_1.createServerClient)(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            {
              cookies: {
                get: function (name) {
                  var _a;
                  return (
                    ((_a = req.cookies.get(name)) === null || _a === void 0 ? void 0 : _a.value) ||
                    ""
                  );
                },
                set: function () {}, // Not needed for middleware
                remove: function () {}, // Not needed for middleware
              },
            },
          );
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          (_a = _c.sent()), (session = _a.data.session), (sessionError = _a.error);
          if (sessionError) {
            console.error("❌ Session error:", sessionError.message);
            return [2 /*return*/, server_1.NextResponse.redirect(new URL("/login", req.url))];
          }
          routeContext = null;
          if (!(session === null || session === void 0 ? void 0 : session.user))
            return [3 /*break*/, 6];
          return [
            4 /*yield*/,
            supabase
              .from("profiles")
              .select("\n          id, role, permissions, clinic_id, clinic_role\n        ")
              .eq("id", session.user.id)
              .single(),
            // Get subscription data separately
          ];
        case 3:
          profile = _c.sent().data;
          return [
            4 /*yield*/,
            supabase
              .from("subscriptions")
              .select(
                "\n          status, tier, current_period_end, \n          plan:subscription_plans(name, features)\n        ",
              )
              .eq("user_id", session.user.id)
              .order("created_at", { ascending: false })
              .limit(1)
              .single(),
            // Build comprehensive route context
          ];
        case 4:
          subscription = _c.sent().data;
          _b = {
            userId: session.user.id,
            userRole: (0, route_protection_1.getUserRole)(
              (profile === null || profile === void 0 ? void 0 : profile.role) || "patient",
            ),
            subscriptionTier: (0, route_protection_1.getSubscriptionTier)(
              (subscription === null || subscription === void 0 ? void 0 : subscription.tier) ||
                "free",
            ),
            subscriptionStatus:
              (subscription === null || subscription === void 0 ? void 0 : subscription.status) ||
              "inactive",
            subscriptionExpiresAt: (
              subscription === null || subscription === void 0
                ? void 0
                : subscription.current_period_end
            )
              ? new Date(subscription.current_period_end)
              : undefined,
            gracePeriodEndsAt: (
              subscription === null || subscription === void 0
                ? void 0
                : subscription.current_period_end
            )
              ? (0, route_protection_1.calculateGracePeriodEnd)(
                  new Date(subscription.current_period_end),
                  3,
                )
              : undefined,
            permissions: Array.isArray(
              profile === null || profile === void 0 ? void 0 : profile.permissions,
            )
              ? profile.permissions
              : ["read"],
          };
          return [4 /*yield*/, getUserFeatureFlags(session.user.id, supabase)];
        case 5:
          // Build comprehensive route context
          routeContext =
            ((_b.featureFlags = _c.sent()),
            (_b.clinicId = profile === null || profile === void 0 ? void 0 : profile.clinic_id),
            (_b.clinicRole = profile === null || profile === void 0 ? void 0 : profile.clinic_role),
            _b);
          console.log("👤 User context built:", {
            userId: routeContext.userId,
            role: routeContext.userRole,
            tier: routeContext.subscriptionTier,
            status: routeContext.subscriptionStatus,
          });
          _c.label = 6;
        case 6:
          if (!routeContext) return [3 /*break*/, 8];
          return [4 /*yield*/, route_protection_1.routeProtector.checkAccess(req, routeContext)];
        case 7:
          accessResult = _c.sent();
          if (!accessResult.allowed) {
            console.log("🚫 Access denied:", accessResult.reason, "Code:", accessResult.errorCode);
            // Create appropriate response based on error type
            if (accessResult.redirectTo) {
              redirectUrl = new URL(accessResult.redirectTo, req.url);
              // Add error context as query parameters for better UX
              if (accessResult.errorCode) {
                redirectUrl.searchParams.set("error", accessResult.errorCode);
              }
              if (accessResult.reason) {
                redirectUrl.searchParams.set("message", encodeURIComponent(accessResult.reason));
              }
              return [2 /*return*/, server_1.NextResponse.redirect(redirectUrl)];
            }
            // Return 403 for API routes or when no redirect is specified
            return [
              2 /*return*/,
              new server_1.NextResponse(
                JSON.stringify({
                  error: accessResult.errorCode || "ACCESS_DENIED",
                  message: accessResult.reason || "Access denied",
                  timestamp: new Date().toISOString(),
                }),
                {
                  status: 403,
                  headers: { "Content-Type": "application/json" },
                },
              ),
            ];
          }
          console.log("✅ Access granted:", accessResult.reason);
          _c.label = 8;
        case 8:
          response = server_1.NextResponse.next();
          processingTime = Date.now() - startTime;
          response.headers.set("x-subscription-check-time", processingTime.toString());
          response.headers.set("x-subscription-middleware-version", "2.0.0");
          if (routeContext) {
            response.headers.set("x-user-tier", routeContext.subscriptionTier);
            response.headers.set("x-user-role", routeContext.userRole);
          }
          console.log("\u26A1 Enhanced middleware completed in ".concat(processingTime, "ms"));
          return [2 /*return*/, response];
        case 9:
          error_1 = _c.sent();
          console.error("💥 Enhanced Subscription Middleware Error:", error_1);
          errorTime = Date.now() - startTime;
          errorUrl = new URL("/dashboard", req.url);
          errorUrl.searchParams.set("error", "MIDDLEWARE_ERROR");
          errorUrl.searchParams.set("message", "System error during access validation");
          response = server_1.NextResponse.redirect(errorUrl);
          response.headers.set("x-subscription-error-time", errorTime.toString());
          return [2 /*return*/, response];
        case 10:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Get user-specific feature flags from database or cache
 */
function getUserFeatureFlags(userId, supabase) {
  return __awaiter(this, void 0, void 0, function () {
    var data, flags_1, defaultFlags, error_2;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, , 3]);
          return [
            4 /*yield*/,
            supabase.from("user_feature_flags").select("flag_name, enabled").eq("user_id", userId),
          ];
        case 1:
          data = _a.sent().data;
          flags_1 = {};
          defaultFlags = {
            advanced_treatments: true,
            advanced_reporting: true,
            multi_clinic_support: false,
            advanced_analytics: true,
            custom_reports: true,
            ai_suggestions: false,
            mobile_app_sync: true,
            third_party_integrations: true,
          };
          // Apply defaults
          Object.assign(flags_1, defaultFlags);
          // Override with user-specific flags
          if (data) {
            data.forEach(function (flag) {
              flags_1[flag.flag_name] = flag.enabled;
            });
          }
          return [2 /*return*/, flags_1];
        case 2:
          error_2 = _a.sent();
          console.error("Error fetching feature flags:", error_2);
          // Return safe defaults on error
          return [
            2 /*return*/,
            {
              advanced_treatments: true,
              advanced_reporting: true,
              multi_clinic_support: false,
              advanced_analytics: false,
              custom_reports: false,
              ai_suggestions: false,
              mobile_app_sync: true,
              third_party_integrations: false,
            },
          ];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
// Utility functions for external use
function validateUserAccess(req, userId) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, profile, subscription, routeContext, result, error_3;
    var _a;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 5, , 6]);
          supabase = (0, ssr_1.createServerClient)(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            {
              cookies: {
                get: function (name) {
                  var _a;
                  return (
                    ((_a = req.cookies.get(name)) === null || _a === void 0 ? void 0 : _a.value) ||
                    ""
                  );
                },
                set: function () {},
                remove: function () {},
              },
            },
          );
          return [
            4 /*yield*/,
            supabase.from("profiles").select("role, permissions").eq("id", userId).single(),
          ];
        case 1:
          profile = _b.sent().data;
          return [
            4 /*yield*/,
            supabase
              .from("subscriptions")
              .select("status, tier")
              .eq("user_id", userId)
              .order("created_at", { ascending: false })
              .limit(1)
              .single(),
          ];
        case 2:
          subscription = _b.sent().data;
          _a = {
            userId: userId,
            userRole: (0, route_protection_1.getUserRole)(
              (profile === null || profile === void 0 ? void 0 : profile.role) || "patient",
            ),
            subscriptionTier: (0, route_protection_1.getSubscriptionTier)(
              (subscription === null || subscription === void 0 ? void 0 : subscription.tier) ||
                "free",
            ),
            subscriptionStatus:
              (subscription === null || subscription === void 0 ? void 0 : subscription.status) ||
              "inactive",
            permissions: Array.isArray(
              profile === null || profile === void 0 ? void 0 : profile.permissions,
            )
              ? profile.permissions
              : ["read"],
          };
          return [4 /*yield*/, getUserFeatureFlags(userId, supabase)];
        case 3:
          routeContext = ((_a.featureFlags = _b.sent()), _a);
          return [4 /*yield*/, route_protection_1.routeProtector.checkAccess(req, routeContext)];
        case 4:
          result = _b.sent();
          return [2 /*return*/, result.allowed];
        case 5:
          error_3 = _b.sent();
          console.error("Error validating user access:", error_3);
          return [2 /*return*/, false];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Real-time Integration
 *
 * The middleware now supports real-time subscription status updates through:
 * - WebSocket connections via SubscriptionRealtimeManager
 * - Client-side hooks (useSubscriptionStatus)
 * - Automatic UI synchronization
 * - Server-sent events for status changes
 *
 * To use real-time features in components:
 * 1. Import useSubscriptionStatus hook
 * 2. Component will auto-connect to real-time updates
 * 3. Status changes trigger automatic UI updates
 *
 * Example:
 * ```tsx
 * import { useSubscriptionStatus } from '@/hooks/use-subscription-status'
 *
 * function MyComponent() {
 *   const { status, isActive, refresh } = useSubscriptionStatus()
 *   return <div>Status: {status}</div>
 * }
 * ```
 *
 * For manual integration:
 * ```tsx
 * import { subscriptionRealtimeManager } from '@/lib/subscription-realtime'
 *
 * const unsubscribe = subscriptionRealtimeManager.subscribe(userId, (update) => {
 *   console.log('Subscription updated:', update)
 * })
 * ```
 */
// Real-time integration is handled by:
// - lib/subscription-realtime.ts (WebSocket management)
// - hooks/use-subscription-status.ts (React integration)
// - components/subscription/subscription-status-indicator.tsx (UI component)
