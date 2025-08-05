/**
 * Auth Utilities and Helper Functions
 * Production-ready utilities for Clerk integration
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
exports.HealthcarePermissions = exports.HealthcareRoles = void 0;
exports.getAuth = getAuth;
exports.requireAuth = requireAuth;
exports.hasPermission = hasPermission;
exports.hasRole = hasRole;
exports.requirePermission = requirePermission;
exports.requireRole = requireRole;
exports.getUserMetadata = getUserMetadata;
exports.isProtectedRoute = isProtectedRoute;
exports.isPublicRoute = isPublicRoute;
var server_1 = require("@clerk/nextjs/server");
var navigation_1 = require("next/navigation");
var clerk_config_1 = require("./clerk-config");
var simple_session_manager_1 = require("./simple-session-manager");
/**
 * Server-side authentication check
 * Use in Server Components and API routes
 */
function getAuth() {
  return __awaiter(this, void 0, void 0, function () {
    var _a, userId, sessionId, user, error_1;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 3, , 4]);
          (_a = (0, server_1.auth)()), (userId = _a.userId), (sessionId = _a.sessionId);
          if (!userId || !sessionId) {
            return [2 /*return*/, { isAuthenticated: false }];
          }
          return [4 /*yield*/, (0, server_1.currentUser)()];
        case 1:
          user = _b.sent();
          // Update session activity
          return [
            4 /*yield*/,
            simple_session_manager_1.sessionManager.updateSessionActivity(sessionId),
          ];
        case 2:
          // Update session activity
          _b.sent();
          return [
            2 /*return*/,
            {
              isAuthenticated: true,
              userId: userId,
              sessionId: sessionId,
              user: user,
            },
          ];
        case 3:
          error_1 = _b.sent();
          console.error("Auth check failed:", error_1);
          return [
            2 /*return*/,
            {
              isAuthenticated: false,
              error: "Authentication check failed",
            },
          ];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Require authentication for a page/route
 * Redirects to sign-in if not authenticated
 */
function requireAuth() {
  return __awaiter(this, void 0, void 0, function () {
    var authResult;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          return [4 /*yield*/, getAuth()];
        case 1:
          authResult = _a.sent();
          if (!authResult.isAuthenticated) {
            (0, navigation_1.redirect)("/sign-in");
          }
          return [2 /*return*/, authResult];
      }
    });
  });
}
/**
 * Check if user has specific permission
 */
function hasPermission(permission) {
  return __awaiter(this, void 0, void 0, function () {
    var sessionId;
    return __generator(this, (_a) => {
      try {
        sessionId = (0, server_1.auth)().sessionId;
        if (!sessionId) return [2 /*return*/, false];
        return [
          2 /*return*/,
          simple_session_manager_1.sessionManager.hasPermission(sessionId, permission),
        ];
      } catch (_b) {
        return [2 /*return*/, false];
      }
      return [2 /*return*/];
    });
  });
}
/**
 * Check if user has specific role
 */
function hasRole(role) {
  return __awaiter(this, void 0, void 0, function () {
    var sessionId;
    return __generator(this, (_a) => {
      try {
        sessionId = (0, server_1.auth)().sessionId;
        if (!sessionId) return [2 /*return*/, false];
        return [2 /*return*/, simple_session_manager_1.sessionManager.hasRole(sessionId, role)];
      } catch (_b) {
        return [2 /*return*/, false];
      }
      return [2 /*return*/];
    });
  });
}
/**
 * Require specific permission
 * Redirects to unauthorized page if permission not found
 */
function requirePermission(permission_1) {
  return __awaiter(this, arguments, void 0, function (permission, unauthorizedUrl) {
    var authResult;
    if (unauthorizedUrl === void 0) {
      unauthorizedUrl = "/unauthorized";
    }
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          return [4 /*yield*/, requireAuth()];
        case 1:
          authResult = _a.sent();
          return [4 /*yield*/, hasPermission(permission)];
        case 2:
          if (!_a.sent()) {
            (0, navigation_1.redirect)(unauthorizedUrl);
          }
          return [2 /*return*/, authResult];
      }
    });
  });
}
/**
 * Require specific role
 * Redirects to unauthorized page if role not found
 */
function requireRole(role_1) {
  return __awaiter(this, arguments, void 0, function (role, unauthorizedUrl) {
    var authResult;
    if (unauthorizedUrl === void 0) {
      unauthorizedUrl = "/unauthorized";
    }
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          return [4 /*yield*/, requireAuth()];
        case 1:
          authResult = _a.sent();
          return [4 /*yield*/, hasRole(role)];
        case 2:
          if (!_a.sent()) {
            (0, navigation_1.redirect)(unauthorizedUrl);
          }
          return [2 /*return*/, authResult];
      }
    });
  });
}
/**
 * Get user metadata safely
 */
function getUserMetadata() {
  return __awaiter(this, void 0, void 0, function () {
    var user, error_2;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, , 3]);
          return [4 /*yield*/, (0, server_1.currentUser)()];
        case 1:
          user = _a.sent();
          return [
            2 /*return*/,
            {
              publicMetadata:
                (user === null || user === void 0 ? void 0 : user.publicMetadata) || {},
              privateMetadata:
                (user === null || user === void 0 ? void 0 : user.privateMetadata) || {},
              unsafeMetadata:
                (user === null || user === void 0 ? void 0 : user.unsafeMetadata) || {},
            },
          ];
        case 2:
          error_2 = _a.sent();
          console.error("Failed to get user metadata:", error_2);
          return [
            2 /*return*/,
            {
              publicMetadata: {},
              privateMetadata: {},
              unsafeMetadata: {},
            },
          ];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Check if route is protected
 */
function isProtectedRoute(pathname) {
  return clerk_config_1.clerkConfig.protectedRoutes.some((route) => pathname.startsWith(route));
}
/**
 * Check if route is public
 */
function isPublicRoute(pathname) {
  return clerk_config_1.clerkConfig.publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );
}
/**
 * Healthcare-specific role definitions
 */
exports.HealthcareRoles = {
  ADMIN: "admin",
  DOCTOR: "doctor",
  NURSE: "nurse",
  RECEPTIONIST: "receptionist",
  PATIENT: "patient",
  TECHNICIAN: "technician",
};
/**
 * Healthcare-specific permission definitions
 */
exports.HealthcarePermissions = {
  // Patient management
  VIEW_PATIENTS: "view_patients",
  CREATE_PATIENTS: "create_patients",
  EDIT_PATIENTS: "edit_patients",
  DELETE_PATIENTS: "delete_patients",
  // Appointment management
  VIEW_APPOINTMENTS: "view_appointments",
  CREATE_APPOINTMENTS: "create_appointments",
  EDIT_APPOINTMENTS: "edit_appointments",
  DELETE_APPOINTMENTS: "delete_appointments",
  // Medical records
  VIEW_MEDICAL_RECORDS: "view_medical_records",
  CREATE_MEDICAL_RECORDS: "create_medical_records",
  EDIT_MEDICAL_RECORDS: "edit_medical_records",
  // Admin functions
  MANAGE_USERS: "manage_users",
  VIEW_REPORTS: "view_reports",
  SYSTEM_CONFIG: "system_config",
  // Emergency access
  EMERGENCY_ACCESS: "emergency_access",
};
