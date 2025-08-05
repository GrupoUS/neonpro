"use strict";
/**
 * React Hook for RBAC Permissions Management
 * Story 1.2: Role-Based Access Control Implementation
 *
 * This hook provides permission checking and role management for React components
 */
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
exports.usePermissions = usePermissions;
exports.usePermission = usePermission;
exports.useRole = useRole;
var react_1 = require("react");
var auth_context_1 = require("@/contexts/auth-context");
var permissionCache = {};
var CACHE_TTL = 2 * 60 * 1000; // 2 minutes for frontend cache
/**
 * Role hierarchy for comparison
 */
var ROLE_HIERARCHY = {
  patient: 1,
  staff: 2,
  manager: 3,
  owner: 4,
};
/**
 * Feature permission mapping
 */
var FEATURE_PERMISSIONS = {
  patients: ["patients.read", "patients.manage"],
  appointments: ["appointments.read", "appointments.manage"],
  billing: ["billing.read", "billing.manage"],
  payments: ["payments.read", "payments.manage"],
  users: ["users.read", "users.manage"],
  clinic: ["clinic.read", "clinic.manage"],
  system: ["system.admin"],
  reports: ["reports.read", "reports.generate"],
  audit: ["audit.read"],
};
/**
 * Main permissions hook
 */
function usePermissions() {
  var _this = this;
  var _a = (0, auth_context_1.useAuth)(),
    user = _a.user,
    authLoading = _a.isLoading;
  var _b = (0, react_1.useState)(false),
    isLoading = _b[0],
    setIsLoading = _b[1];
  var _c = (0, react_1.useState)(null),
    error = _c[0],
    setError = _c[1];
  var _d = (0, react_1.useState)([]),
    userPermissions = _d[0],
    setUserPermissions = _d[1];
  /**
   * Get user's role
   */
  var role = (0, react_1.useMemo)(
    function () {
      return (user === null || user === void 0 ? void 0 : user.role) || null;
    },
    [user === null || user === void 0 ? void 0 : user.role],
  );
  /**
   * Get user's permissions based on role
   */
  var permissions = (0, react_1.useMemo)(
    function () {
      if (!role || !user) return [];
      // Import DEFAULT_ROLES from types (would need to be imported)
      // For now, we'll define basic permissions here
      var rolePermissions = {
        patient: ["patients.read"],
        staff: ["patients.read", "patients.manage", "appointments.read", "appointments.manage"],
        manager: [
          "patients.read",
          "patients.manage",
          "appointments.read",
          "appointments.manage",
          "billing.read",
          "billing.manage",
          "payments.read",
          "payments.manage",
          "users.read",
          "users.manage",
          "reports.read",
          "reports.generate",
        ],
        owner: [
          "patients.read",
          "patients.manage",
          "appointments.read",
          "appointments.manage",
          "billing.read",
          "billing.manage",
          "payments.read",
          "payments.manage",
          "users.read",
          "users.manage",
          "clinic.read",
          "clinic.manage",
          "reports.read",
          "reports.generate",
          "audit.read",
        ],
      };
      return rolePermissions[role] || [];
    },
    [role, user],
  );
  /**
   * Generate cache key
   */
  var getCacheKey = (0, react_1.useCallback)(
    function (permission, resourceId) {
      return ""
        .concat(user === null || user === void 0 ? void 0 : user.id, ":")
        .concat(permission, ":")
        .concat(resourceId || "global", ":")
        .concat(user === null || user === void 0 ? void 0 : user.clinicId);
    },
    [
      user === null || user === void 0 ? void 0 : user.id,
      user === null || user === void 0 ? void 0 : user.clinicId,
    ],
  );
  /**
   * Clear expired cache entries
   */
  var clearExpiredCache = (0, react_1.useCallback)(function () {
    var now = Date.now();
    Object.keys(permissionCache).forEach(function (key) {
      if (now - permissionCache[key].timestamp > CACHE_TTL) {
        delete permissionCache[key];
      }
    });
  }, []);
  /**
   * Check if user has specific permission
   */
  var hasPermission = (0, react_1.useCallback)(
    function (permission, resourceId) {
      return __awaiter(_this, void 0, void 0, function () {
        var cacheKey, cached, hasRolePermission, result_1, result, errorMessage;
        return __generator(this, function (_a) {
          if (!user || !role) return [2 /*return*/, false];
          cacheKey = getCacheKey(permission, resourceId);
          cached = permissionCache[cacheKey];
          if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return [2 /*return*/, cached.result.granted];
          }
          try {
            setError(null);
            hasRolePermission = permissions.includes(permission);
            if (!hasRolePermission) {
              result_1 = {
                granted: false,
                reason: "Role '"
                  .concat(role, "' does not have permission '")
                  .concat(permission, "'"),
                roleUsed: role,
              };
              permissionCache[cacheKey] = {
                result: result_1,
                timestamp: Date.now(),
              };
              return [2 /*return*/, false];
            }
            result = {
              granted: true,
              roleUsed: role,
            };
            permissionCache[cacheKey] = {
              result: result,
              timestamp: Date.now(),
            };
            return [2 /*return*/, true];
          } catch (err) {
            errorMessage = err instanceof Error ? err.message : "Permission check failed";
            setError(errorMessage);
            console.error("Permission check error:", err);
            return [2 /*return*/, false];
          }
          return [2 /*return*/];
        });
      });
    },
    [user, role, permissions, getCacheKey],
  );
  /**
   * Check if user has any of the specified permissions
   */
  var hasAnyPermission = (0, react_1.useCallback)(
    function (permissionList, resourceId) {
      return __awaiter(_this, void 0, void 0, function () {
        var _i, permissionList_1, permission;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              (_i = 0), (permissionList_1 = permissionList);
              _a.label = 1;
            case 1:
              if (!(_i < permissionList_1.length)) return [3 /*break*/, 4];
              permission = permissionList_1[_i];
              return [4 /*yield*/, hasPermission(permission, resourceId)];
            case 2:
              if (_a.sent()) {
                return [2 /*return*/, true];
              }
              _a.label = 3;
            case 3:
              _i++;
              return [3 /*break*/, 1];
            case 4:
              return [2 /*return*/, false];
          }
        });
      });
    },
    [hasPermission],
  );
  /**
   * Check if user has all specified permissions
   */
  var hasAllPermissions = (0, react_1.useCallback)(
    function (permissionList, resourceId) {
      return __awaiter(_this, void 0, void 0, function () {
        var _i, permissionList_2, permission;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              (_i = 0), (permissionList_2 = permissionList);
              _a.label = 1;
            case 1:
              if (!(_i < permissionList_2.length)) return [3 /*break*/, 4];
              permission = permissionList_2[_i];
              return [4 /*yield*/, hasPermission(permission, resourceId)];
            case 2:
              if (!_a.sent()) {
                return [2 /*return*/, false];
              }
              _a.label = 3;
            case 3:
              _i++;
              return [3 /*break*/, 1];
            case 4:
              return [2 /*return*/, true];
          }
        });
      });
    },
    [hasPermission],
  );
  /**
   * Check if user has specific role
   */
  var hasRole = (0, react_1.useCallback)(
    function (targetRole) {
      return role === targetRole;
    },
    [role],
  );
  /**
   * Check if user has minimum role level
   */
  var hasMinimumRole = (0, react_1.useCallback)(
    function (minimumRole) {
      if (!role) return false;
      return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minimumRole];
    },
    [role],
  );
  /**
   * Check if user can access a feature
   */
  var canAccess = (0, react_1.useCallback)(
    function (feature) {
      var featurePermissions = FEATURE_PERMISSIONS[feature];
      if (!featurePermissions) return false;
      return featurePermissions.some(function (permission) {
        return permissions.includes(permission);
      });
    },
    [permissions],
  );
  /**
   * Check if user can manage a resource
   */
  var canManage = (0, react_1.useCallback)(
    function (resource) {
      var managePermission = "".concat(resource, ".manage");
      return permissions.includes(managePermission);
    },
    [permissions],
  );
  /**
   * Check if user can view a resource
   */
  var canView = (0, react_1.useCallback)(
    function (resource) {
      var readPermission = "".concat(resource, ".read");
      var managePermission = "".concat(resource, ".manage");
      return permissions.includes(readPermission) || permissions.includes(managePermission);
    },
    [permissions],
  );
  /**
   * Clear permission cache
   */
  var clearCache = (0, react_1.useCallback)(
    function () {
      Object.keys(permissionCache).forEach(function (key) {
        if (key.startsWith("".concat(user === null || user === void 0 ? void 0 : user.id, ":"))) {
          delete permissionCache[key];
        }
      });
    },
    [user === null || user === void 0 ? void 0 : user.id],
  );
  /**
   * Refresh user permissions
   */
  var refreshPermissions = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var err_1, errorMessage;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (!user) return [2 /*return*/];
              setIsLoading(true);
              setError(null);
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, 4, 5]);
              // Clear cache for this user
              clearCache();
              // In a real implementation, this would fetch fresh permissions from the backend
              // For now, we'll just clear the cache and let the next permission check refresh
              // Simulate API call delay
              return [
                4 /*yield*/,
                new Promise(function (resolve) {
                  return setTimeout(resolve, 100);
                }),
              ];
            case 2:
              // In a real implementation, this would fetch fresh permissions from the backend
              // For now, we'll just clear the cache and let the next permission check refresh
              // Simulate API call delay
              _a.sent();
              return [3 /*break*/, 5];
            case 3:
              err_1 = _a.sent();
              errorMessage =
                err_1 instanceof Error ? err_1.message : "Failed to refresh permissions";
              setError(errorMessage);
              console.error("Permission refresh error:", err_1);
              return [3 /*break*/, 5];
            case 4:
              setIsLoading(false);
              return [7 /*endfinally*/];
            case 5:
              return [2 /*return*/];
          }
        });
      });
    },
    [user, clearCache],
  );
  /**
   * Clear expired cache entries periodically
   */
  (0, react_1.useEffect)(
    function () {
      var interval = setInterval(clearExpiredCache, 60000); // Every minute
      return function () {
        return clearInterval(interval);
      };
    },
    [clearExpiredCache],
  );
  /**
   * Clear cache when user changes
   */
  (0, react_1.useEffect)(
    function () {
      if (user) {
        clearCache();
      }
    },
    [user === null || user === void 0 ? void 0 : user.id, clearCache],
  );
  return {
    hasPermission: hasPermission,
    hasAnyPermission: hasAnyPermission,
    hasAllPermissions: hasAllPermissions,
    hasRole: hasRole,
    hasMinimumRole: hasMinimumRole,
    permissions: permissions,
    role: role,
    isLoading: authLoading || isLoading,
    error: error,
    canAccess: canAccess,
    canManage: canManage,
    canView: canView,
    clearCache: clearCache,
    refreshPermissions: refreshPermissions,
  };
}
/**
 * Hook for checking specific permission (simplified)
 */
function usePermission(permission, resourceId) {
  var _this = this;
  var _a = usePermissions(),
    hasPermission = _a.hasPermission,
    isLoading = _a.isLoading,
    error = _a.error;
  var _b = (0, react_1.useState)(false),
    allowed = _b[0],
    setAllowed = _b[1];
  var _c = (0, react_1.useState)(true),
    checking = _c[0],
    setChecking = _c[1];
  (0, react_1.useEffect)(
    function () {
      var mounted = true;
      var checkPermission = function () {
        return __awaiter(_this, void 0, void 0, function () {
          var result, err_2;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                if (isLoading) return [2 /*return*/];
                setChecking(true);
                _a.label = 1;
              case 1:
                _a.trys.push([1, 3, 4, 5]);
                return [4 /*yield*/, hasPermission(permission, resourceId)];
              case 2:
                result = _a.sent();
                if (mounted) {
                  setAllowed(result);
                }
                return [3 /*break*/, 5];
              case 3:
                err_2 = _a.sent();
                console.error("Permission check failed:", err_2);
                if (mounted) {
                  setAllowed(false);
                }
                return [3 /*break*/, 5];
              case 4:
                if (mounted) {
                  setChecking(false);
                }
                return [7 /*endfinally*/];
              case 5:
                return [2 /*return*/];
            }
          });
        });
      };
      checkPermission();
      return function () {
        mounted = false;
      };
    },
    [hasPermission, permission, resourceId, isLoading],
  );
  return {
    allowed: allowed,
    isLoading: isLoading || checking,
    error: error,
  };
}
/**
 * Hook for role-based access
 */
function useRole() {
  var _a = usePermissions(),
    role = _a.role,
    hasRole = _a.hasRole,
    hasMinimumRole = _a.hasMinimumRole,
    isLoading = _a.isLoading,
    error = _a.error;
  return {
    role: role,
    hasRole: hasRole,
    hasMinimumRole: hasMinimumRole,
    isOwner: hasRole("owner"),
    isManager: hasMinimumRole("manager"),
    isStaff: hasMinimumRole("staff"),
    isPatient: hasRole("patient"),
    isLoading: isLoading,
    error: error,
  };
}
