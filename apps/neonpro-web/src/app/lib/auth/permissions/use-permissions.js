"use strict";
/**
 * React Hook for Permission Management
 *
 * Provides permission checking, role management, and access control
 * functionality for React components in the NeonPro application.
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
var __rest =
  (this && this.__rest) ||
  function (s, e) {
    var t = {};
    for (var p in s)
      if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
          t[p[i]] = s[p[i]];
      }
    return t;
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePermissions = usePermissions;
exports.usePermissionCheck = usePermissionCheck;
exports.useMultiplePermissions = useMultiplePermissions;
exports.useRoleAccess = useRoleAccess;
exports.withPermissionCheck = withPermissionCheck;
exports.useAdminAccess = useAdminAccess;
exports.useMedicalAccess = useMedicalAccess;
var react_1 = require("react");
var permission_validator_1 = require("./permission-validator");
function usePermissions(userId) {
  var _this = this;
  var _a = (0, react_1.useState)(null),
    userPermissions = _a[0],
    setUserPermissions = _a[1];
  var _b = (0, react_1.useState)(true),
    isLoading = _b[0],
    setIsLoading = _b[1];
  var _c = (0, react_1.useState)(),
    error = _c[0],
    setError = _c[1];
  // Load user permissions
  var loadPermissions = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var permissions, err_1;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (!userId) return [2 /*return*/];
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, 4, 5]);
              setIsLoading(true);
              setError(undefined);
              return [
                4 /*yield*/,
                permission_validator_1.permissionValidator.getUserPermissions(userId),
              ];
            case 2:
              permissions = _a.sent();
              setUserPermissions(permissions);
              return [3 /*break*/, 5];
            case 3:
              err_1 = _a.sent();
              console.error("Error loading permissions:", err_1);
              setError("Falha ao carregar permissões do usuário");
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
    [userId],
  );
  // Check permission
  var checkPermission = (0, react_1.useCallback)(
    function (resource, action, resourceId) {
      return __awaiter(_this, void 0, void 0, function () {
        var err_2;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (!userId) return [2 /*return*/, false];
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, , 4]);
              return [
                4 /*yield*/,
                (0, permission_validator_1.hasPermission)(userId, resource, action, resourceId),
              ];
            case 2:
              return [2 /*return*/, _a.sent()];
            case 3:
              err_2 = _a.sent();
              console.error("Error checking permission:", err_2);
              return [2 /*return*/, false];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    },
    [userId],
  );
  // Check if user has specific role
  var hasRole = (0, react_1.useCallback)(
    function (role) {
      return (
        (userPermissions === null || userPermissions === void 0
          ? void 0
          : userPermissions.roles.includes(role)) || false
      );
    },
    [userPermissions],
  );
  // Check if user has any of the specified roles
  var hasAnyRole = (0, react_1.useCallback)(
    function (roles) {
      if (!userPermissions) return false;
      return roles.some(function (role) {
        return userPermissions.roles.includes(role);
      });
    },
    [userPermissions],
  );
  // Check if user has higher role than target
  var hasHigherRole = (0, react_1.useCallback)(
    function (targetRole) {
      if (!userPermissions) return false;
      return userPermissions.roles.some(function (userRole) {
        return permission_validator_1.permissionValidator.isHigherRole(userRole, targetRole);
      });
    },
    [userPermissions],
  );
  // Alias for checkPermission for better readability
  var canAccess = checkPermission;
  // Refresh permissions
  var refresh = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, loadPermissions()];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    },
    [loadPermissions],
  );
  // Get user roles
  var roles = (0, react_1.useMemo)(
    function () {
      return (
        (userPermissions === null || userPermissions === void 0 ? void 0 : userPermissions.roles) ||
        []
      );
    },
    [userPermissions],
  );
  // Load permissions on mount and when userId changes
  (0, react_1.useEffect)(
    function () {
      loadPermissions();
    },
    [loadPermissions],
  );
  return {
    userPermissions: userPermissions,
    roles: roles,
    isLoading: isLoading,
    error: error,
    checkPermission: checkPermission,
    hasRole: hasRole,
    hasAnyRole: hasAnyRole,
    hasHigherRole: hasHigherRole,
    canAccess: canAccess,
    refresh: refresh,
  };
}
// Hook for checking specific permissions with automatic refresh
function usePermissionCheck(userId, resource, action, resourceId) {
  var _this = this;
  var _a = (0, react_1.useState)(null),
    result = _a[0],
    setResult = _a[1];
  var _b = (0, react_1.useState)(true),
    isLoading = _b[0],
    setIsLoading = _b[1];
  var checkPermission = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var permissionResult, err_3;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (!userId) return [2 /*return*/];
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, 4, 5]);
              setIsLoading(true);
              return [
                4 /*yield*/,
                permission_validator_1.permissionValidator.checkPermission({
                  userId: userId,
                  resource: resource,
                  action: action,
                  resourceId: resourceId,
                }),
              ];
            case 2:
              permissionResult = _a.sent();
              setResult(permissionResult);
              return [3 /*break*/, 5];
            case 3:
              err_3 = _a.sent();
              console.error("Error checking permission:", err_3);
              setResult({
                allowed: false,
                reason: "Error checking permission",
                timestamp: Date.now(),
              });
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
    [userId, resource, action, resourceId],
  );
  (0, react_1.useEffect)(
    function () {
      checkPermission();
    },
    [checkPermission],
  );
  return {
    allowed: (result === null || result === void 0 ? void 0 : result.allowed) || false,
    reason: result === null || result === void 0 ? void 0 : result.reason,
    role: result === null || result === void 0 ? void 0 : result.role,
    conditions: result === null || result === void 0 ? void 0 : result.conditions,
    isLoading: isLoading,
    refresh: checkPermission,
  };
}
// Hook for checking multiple permissions
function useMultiplePermissions(userId, permissions) {
  var _this = this;
  var _a = (0, react_1.useState)({}),
    results = _a[0],
    setResults = _a[1];
  var _b = (0, react_1.useState)(true),
    isLoading = _b[0],
    setIsLoading = _b[1];
  var checkPermissions = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var permissionResults_1, resultMap_1, err_4, errorResults_1;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (!userId || permissions.length === 0) return [2 /*return*/];
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, 4, 5]);
              setIsLoading(true);
              return [
                4 /*yield*/,
                (0, permission_validator_1.checkMultiplePermissions)(userId, permissions),
              ];
            case 2:
              permissionResults_1 = _a.sent();
              resultMap_1 = {};
              permissions.forEach(function (permission, index) {
                var key =
                  permission.key ||
                  ""
                    .concat(permission.resource, ":")
                    .concat(permission.action, ":")
                    .concat(permission.resourceId || "none");
                resultMap_1[key] = permissionResults_1[index];
              });
              setResults(resultMap_1);
              return [3 /*break*/, 5];
            case 3:
              err_4 = _a.sent();
              console.error("Error checking multiple permissions:", err_4);
              errorResults_1 = {};
              permissions.forEach(function (permission) {
                var key =
                  permission.key ||
                  ""
                    .concat(permission.resource, ":")
                    .concat(permission.action, ":")
                    .concat(permission.resourceId || "none");
                errorResults_1[key] = false;
              });
              setResults(errorResults_1);
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
    [userId, permissions],
  );
  (0, react_1.useEffect)(
    function () {
      checkPermissions();
    },
    [checkPermissions],
  );
  return {
    results: results,
    isLoading: isLoading,
    refresh: checkPermissions,
    can: function (key) {
      return results[key] || false;
    },
  };
}
// Hook for role-based component rendering
function useRoleAccess(userId, allowedRoles) {
  var _a = usePermissions(userId),
    roles = _a.roles,
    isLoading = _a.isLoading;
  var hasAccess = (0, react_1.useMemo)(
    function () {
      if (isLoading || !roles.length) return false;
      return allowedRoles.some(function (role) {
        return roles.includes(role);
      });
    },
    [roles, allowedRoles, isLoading],
  );
  return {
    hasAccess: hasAccess,
    roles: roles,
    isLoading: isLoading,
  };
}
// HOC for permission-based component protection
function withPermissionCheck(Component, resource, action, fallback) {
  return function PermissionProtectedComponent(props) {
    var userId = props.userId,
      resourceId = props.resourceId,
      componentProps = __rest(props, ["userId", "resourceId"]);
    var _a = usePermissionCheck(userId, resource, action, resourceId),
      allowed = _a.allowed,
      isLoading = _a.isLoading;
    if (isLoading) {
      return Verificando;
      permissões;
      /;;>div;
    }
    if (!allowed) {
      if (fallback) {
        var FallbackComponent = fallback;
        return /;;>;
      }
      return Acesso;
      negado < /;;>div;
    }
    return __assign({}, componentProps) /  >
        ;
  };
}
// Hook for admin access checking
function useAdminAccess(userId) {
  var _a = usePermissions(userId),
    roles = _a.roles,
    isLoading = _a.isLoading;
  var isAdmin = (0, react_1.useMemo)(
    function () {
      return (
        roles.includes(permission_validator_1.SystemRole.ADMIN) ||
        roles.includes(permission_validator_1.SystemRole.SUPER_ADMIN)
      );
    },
    [roles],
  );
  var isSuperAdmin = (0, react_1.useMemo)(
    function () {
      return roles.includes(permission_validator_1.SystemRole.SUPER_ADMIN);
    },
    [roles],
  );
  return {
    isAdmin: isAdmin,
    isSuperAdmin: isSuperAdmin,
    isLoading: isLoading,
    roles: roles,
  };
}
// Hook for medical staff access
function useMedicalAccess(userId) {
  var _a = usePermissions(userId),
    roles = _a.roles,
    isLoading = _a.isLoading;
  var isMedicalStaff = (0, react_1.useMemo)(
    function () {
      return roles.some(function (role) {
        return [
          permission_validator_1.SystemRole.DOCTOR,
          permission_validator_1.SystemRole.NURSE,
          permission_validator_1.SystemRole.TECHNICIAN,
        ].includes(role);
      });
    },
    [roles],
  );
  var isDoctor = (0, react_1.useMemo)(
    function () {
      return roles.includes(permission_validator_1.SystemRole.DOCTOR);
    },
    [roles],
  );
  var isNurse = (0, react_1.useMemo)(
    function () {
      return roles.includes(permission_validator_1.SystemRole.NURSE);
    },
    [roles],
  );
  return {
    isMedicalStaff: isMedicalStaff,
    isDoctor: isDoctor,
    isNurse: isNurse,
    isLoading: isLoading,
    roles: roles,
  };
}
