/**
 * RBAC Permissions System for NeonPro
 * Story 1.2: Role-Based Access Control Implementation
 *
 * This module provides comprehensive permission checking and validation
 * for the NeonPro application with multi-tenant support.
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
exports.RBACPermissionManager = void 0;
exports.hasPermission = hasPermission;
exports.hasAnyPermission = hasAnyPermission;
exports.hasAllPermissions = hasAllPermissions;
exports.clearUserPermissionCache = clearUserPermissionCache;
exports.clearAllPermissionCache = clearAllPermissionCache;
exports.getPermissionCacheStats = getPermissionCacheStats;
var rbac_1 = require("@/types/rbac");
var client_1 = require("@/lib/supabase/client");
// Export the class-based manager interface
var rbac_manager_1 = require("./rbac-manager");
Object.defineProperty(exports, "RBACPermissionManager", {
  enumerable: true,
  get: () => rbac_manager_1.RBACPermissionManager,
});
/**
 * Permission validation cache for performance optimization
 */
var permissionCache = new Map();
var CACHE_TTL = 5 * 60 * 1000; // 5 minutes
/**
 * Clear expired cache entries
 */
function clearExpiredCache() {
  var now = Date.now();
  for (var _i = 0, _a = permissionCache.entries(); _i < _a.length; _i++) {
    var _b = _a[_i],
      key = _b[0],
      value = _b[1];
    if (now - value.timestamp > CACHE_TTL) {
      permissionCache.delete(key);
    }
  }
}
/**
 * Generate cache key for permission check
 */
function getCacheKey(check) {
  return ""
    .concat(check.userId, ":")
    .concat(check.permission, ":")
    .concat(check.clinicId, ":")
    .concat(check.resourceId || "global");
}
/**
 * Check if user has specific permission
 */
function hasPermission(user, permission, resourceId, context) {
  return __awaiter(this, void 0, void 0, function () {
    var check, cacheKey, cached, result;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          check = {
            userId: user.id,
            permission: permission,
            resourceId: resourceId,
            clinicId: user.clinicId || "",
            context: context,
          };
          cacheKey = getCacheKey(check);
          cached = permissionCache.get(cacheKey);
          if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return [2 /*return*/, cached.result];
          }
          // Clear expired cache entries periodically
          if (Math.random() < 0.1) {
            clearExpiredCache();
          }
          return [4 /*yield*/, validatePermission(check, user)];
        case 1:
          result = _a.sent();
          // Cache the result
          permissionCache.set(cacheKey, {
            result: result,
            timestamp: Date.now(),
          });
          return [2 /*return*/, result];
      }
    });
  });
}
/**
 * Core permission validation logic
 */
function validatePermission(check, user) {
  return __awaiter(this, void 0, void 0, function () {
    var roleDefinition, hasRolePermission, resourceAccess, error_1;
    var _a;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 5, , 7]);
          roleDefinition = rbac_1.DEFAULT_ROLES[user.role];
          if (!roleDefinition) {
            return [
              2 /*return*/,
              {
                granted: false,
                reason: "Invalid user role",
                roleUsed: user.role,
              },
            ];
          }
          hasRolePermission = roleDefinition.permissions.includes(check.permission);
          if (!hasRolePermission) {
            return [
              2 /*return*/,
              {
                granted: false,
                reason: "Role '"
                  .concat(user.role, "' does not have permission '")
                  .concat(check.permission, "'"),
                roleUsed: user.role,
                hierarchyLevel: roleDefinition.hierarchy,
              },
            ];
          }
          // Check clinic-specific permissions if required
          if (check.clinicId && user.clinicId !== check.clinicId) {
            // Only admin and owner roles can access other clinics
            if (user.role !== "owner" && user.role !== "admin") {
              return [
                2 /*return*/,
                {
                  granted: false,
                  reason: "Access denied: Different clinic",
                  roleUsed: user.role,
                  hierarchyLevel: roleDefinition.hierarchy,
                },
              ];
            }
          }
          if (!check.resourceId) return [3 /*break*/, 2];
          return [4 /*yield*/, checkResourceAccess(check, user)];
        case 1:
          resourceAccess = _b.sent();
          if (!resourceAccess.granted) {
            return [2 /*return*/, resourceAccess];
          }
          _b.label = 2;
        case 2:
          // Log successful permission check for audit
          return [4 /*yield*/, logPermissionCheck(check, user, true)];
        case 3:
          // Log successful permission check for audit
          _b.sent();
          _a = {
            granted: true,
            roleUsed: user.role,
            hierarchyLevel: roleDefinition.hierarchy,
          };
          return [4 /*yield*/, generateAuditId()];
        case 4:
          return [2 /*return*/, ((_a.auditId = _b.sent()), _a)];
        case 5:
          error_1 = _b.sent();
          console.error("Permission validation error:", error_1);
          // Log failed permission check
          return [4 /*yield*/, logPermissionCheck(check, user, false)];
        case 6:
          // Log failed permission check
          _b.sent();
          return [
            2 /*return*/,
            {
              granted: false,
              reason: "Permission validation failed",
              roleUsed: user.role,
            },
          ];
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Check resource-specific access permissions
 */
function checkResourceAccess(check, user) {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          if (!(check.permission.startsWith("patients.") && check.resourceId))
            return [3 /*break*/, 2];
          return [4 /*yield*/, checkPatientAccess(check.resourceId, user)];
        case 1:
          return [2 /*return*/, _a.sent()];
        case 2:
          if (!(check.permission.startsWith("appointments.") && check.resourceId))
            return [3 /*break*/, 4];
          return [4 /*yield*/, checkAppointmentAccess(check.resourceId, user)];
        case 3:
          return [2 /*return*/, _a.sent()];
        case 4:
          if (
            !(check.permission.startsWith("billing.") || check.permission.startsWith("payments."))
          )
            return [3 /*break*/, 6];
          return [4 /*yield*/, checkFinancialAccess(user)];
        case 5:
          return [2 /*return*/, _a.sent()];
        case 6:
          // Default: allow access if role has permission
          return [2 /*return*/, { granted: true, roleUsed: user.role }];
      }
    });
  });
}
/**
 * Check patient-specific access
 */
function checkPatientAccess(patientId, user) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, patient, error_2;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 3, , 4]);
          return [4 /*yield*/, (0, client_1.createClient)()];
        case 1:
          supabase = _a.sent();
          return [
            4 /*yield*/,
            supabase.from("patients").select("clinic_id").eq("id", patientId).single(),
          ];
        case 2:
          patient = _a.sent().data;
          if (!patient) {
            return [
              2 /*return*/,
              {
                granted: false,
                reason: "Patient not found",
                roleUsed: user.role,
              },
            ];
          }
          if (patient.clinic_id !== user.clinicId && user.role !== "admin") {
            return [
              2 /*return*/,
              {
                granted: false,
                reason: "Patient belongs to different clinic",
                roleUsed: user.role,
              },
            ];
          }
          return [2 /*return*/, { granted: true, roleUsed: user.role }];
        case 3:
          error_2 = _a.sent();
          console.error("Patient access check failed:", error_2);
          return [
            2 /*return*/,
            {
              granted: false,
              reason: "Patient access validation failed",
              roleUsed: user.role,
            },
          ];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Check appointment-specific access
 */
function checkAppointmentAccess(appointmentId, user) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, appointment, error_3;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 3, , 4]);
          return [4 /*yield*/, (0, client_1.createClient)()];
        case 1:
          supabase = _a.sent();
          return [
            4 /*yield*/,
            supabase
              .from("appointments")
              .select("clinic_id, patient_id, staff_id")
              .eq("id", appointmentId)
              .single(),
          ];
        case 2:
          appointment = _a.sent().data;
          if (!appointment) {
            return [
              2 /*return*/,
              {
                granted: false,
                reason: "Appointment not found",
                roleUsed: user.role,
              },
            ];
          }
          if (appointment.clinic_id !== user.clinicId && user.role !== "admin") {
            return [
              2 /*return*/,
              {
                granted: false,
                reason: "Appointment belongs to different clinic",
                roleUsed: user.role,
              },
            ];
          }
          // Staff can only access their own appointments
          if (user.role === "staff" && appointment.staff_id !== user.id) {
            return [
              2 /*return*/,
              {
                granted: false,
                reason: "Staff can only access own appointments",
                roleUsed: user.role,
              },
            ];
          }
          return [2 /*return*/, { granted: true, roleUsed: user.role }];
        case 3:
          error_3 = _a.sent();
          console.error("Appointment access check failed:", error_3);
          return [
            2 /*return*/,
            {
              granted: false,
              reason: "Appointment access validation failed",
              roleUsed: user.role,
            },
          ];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Check financial data access
 */
function checkFinancialAccess(user) {
  return __awaiter(this, void 0, void 0, function () {
    var allowedRoles;
    return __generator(this, (_a) => {
      allowedRoles = ["owner", "manager", "admin"];
      if (!allowedRoles.includes(user.role)) {
        return [
          2 /*return*/,
          {
            granted: false,
            reason: "Insufficient role for financial data access",
            roleUsed: user.role,
          },
        ];
      }
      return [2 /*return*/, { granted: true, roleUsed: user.role }];
    });
  });
}
/**
 * Log permission check for audit trail
 */
function logPermissionCheck(check, user, granted) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, error_4;
    var _a, _b;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 3, , 4]);
          return [4 /*yield*/, (0, client_1.createClient)()];
        case 1:
          supabase = _c.sent();
          return [
            4 /*yield*/,
            supabase.from("permission_audit_log").insert({
              user_id: check.userId,
              action: "permission_check",
              permission: check.permission,
              resource_id: check.resourceId,
              clinic_id: check.clinicId,
              granted: granted,
              role_used: user.role,
              ip_address:
                ((_a = check.context) === null || _a === void 0 ? void 0 : _a.ipAddress) ||
                "unknown",
              user_agent:
                ((_b = check.context) === null || _b === void 0 ? void 0 : _b.userAgent) ||
                "unknown",
              timestamp: new Date().toISOString(),
              metadata: check.context,
            }),
          ];
        case 2:
          _c.sent();
          return [3 /*break*/, 4];
        case 3:
          error_4 = _c.sent();
          console.error("Failed to log permission check:", error_4);
          return [3 /*break*/, 4];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Generate unique audit ID
 */
function generateAuditId() {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, (_a) => [
      2 /*return*/,
      "audit_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9)),
    ]);
  });
}
/**
 * Check if user has any of the specified permissions
 */
function hasAnyPermission(user, permissions, resourceId, context) {
  return __awaiter(this, void 0, void 0, function () {
    var _i, permissions_1, permission, result;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          (_i = 0), (permissions_1 = permissions);
          _a.label = 1;
        case 1:
          if (!(_i < permissions_1.length)) return [3 /*break*/, 4];
          permission = permissions_1[_i];
          return [4 /*yield*/, hasPermission(user, permission, resourceId, context)];
        case 2:
          result = _a.sent();
          if (result.granted) {
            return [2 /*return*/, result];
          }
          _a.label = 3;
        case 3:
          _i++;
          return [3 /*break*/, 1];
        case 4:
          return [
            2 /*return*/,
            {
              granted: false,
              reason: "User does not have any of the required permissions: ".concat(
                permissions.join(", "),
              ),
              roleUsed: user.role,
            },
          ];
      }
    });
  });
}
/**
 * Check if user has all specified permissions
 */
function hasAllPermissions(user, permissions, resourceId, context) {
  return __awaiter(this, void 0, void 0, function () {
    var _i, permissions_2, permission, result;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          (_i = 0), (permissions_2 = permissions);
          _a.label = 1;
        case 1:
          if (!(_i < permissions_2.length)) return [3 /*break*/, 4];
          permission = permissions_2[_i];
          return [4 /*yield*/, hasPermission(user, permission, resourceId, context)];
        case 2:
          result = _a.sent();
          if (!result.granted) {
            return [
              2 /*return*/,
              {
                granted: false,
                reason: "Missing required permission: ".concat(permission),
                roleUsed: user.role,
              },
            ];
          }
          _a.label = 3;
        case 3:
          _i++;
          return [3 /*break*/, 1];
        case 4:
          return [
            2 /*return*/,
            {
              granted: true,
              roleUsed: user.role,
            },
          ];
      }
    });
  });
}
/**
 * Clear permission cache for specific user
 */
function clearUserPermissionCache(userId) {
  for (var _i = 0, _a = permissionCache.entries(); _i < _a.length; _i++) {
    var key = _a[_i][0];
    if (key.startsWith("".concat(userId, ":"))) {
      permissionCache.delete(key);
    }
  }
}
/**
 * Clear all permission cache
 */
function clearAllPermissionCache() {
  permissionCache.clear();
}
/**
 * Get permission cache statistics
 */
function getPermissionCacheStats() {
  return {
    size: permissionCache.size,
    hitRate: 0, // TODO: Implement hit rate tracking
    entries: permissionCache.size,
  };
}
