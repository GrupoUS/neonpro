"use strict";
/**
 * Permission Guard Component for RBAC
 * Story 1.2: Role-Based Access Control Implementation
 *
 * This component provides declarative permission-based access control for React components
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
exports.PermissionLink =
  exports.PermissionButton =
  exports.ConditionalRender =
  exports.FeatureGuard =
  exports.RoleGuard =
  exports.PermissionGuard =
    void 0;
var react_1 = require("react");
var usePermissions_1 = require("@/hooks/usePermissions");
var alert_1 = require("@/components/ui/alert");
var skeleton_1 = require("@/components/ui/skeleton");
var lucide_react_1 = require("lucide-react");
/**
 * Default loading component
 */
var DefaultLoading = function () {
  return (
    <div className="space-y-2">
      <skeleton_1.Skeleton className="h-4 w-full" />
      <skeleton_1.Skeleton className="h-4 w-3/4" />
      <skeleton_1.Skeleton className="h-4 w-1/2" />
    </div>
  );
};
/**
 * Default access denied component
 */
var DefaultAccessDenied = function (_a) {
  var message = _a.message;
  return (
    <alert_1.Alert variant="destructive" className="border-red-200 bg-red-50">
      <lucide_react_1.ShieldAlert className="h-4 w-4" />
      <alert_1.AlertDescription>
        {message || "You do not have permission to access this content."}
      </alert_1.AlertDescription>
    </alert_1.Alert>
  );
};
/**
 * Permission Guard Component
 */
var PermissionGuard = function (_a) {
  var children = _a.children,
    requiredRole = _a.requiredRole,
    _b = _a.requiredPermissions,
    requiredPermissions = _b === void 0 ? [] : _b,
    _c = _a.anyPermissions,
    anyPermissions = _c === void 0 ? [] : _c,
    resourceId = _a.resourceId,
    fallback = _a.fallback,
    loadingComponent = _a.loadingComponent,
    _d = _a.showAccessDenied,
    showAccessDenied = _d === void 0 ? true : _d,
    accessDeniedMessage = _a.accessDeniedMessage,
    _e = _a.asFragment,
    asFragment = _e === void 0 ? false : _e,
    customCheck = _a.customCheck;
  var _f = (0, usePermissions_1.usePermissions)(),
    hasPermission = _f.hasPermission,
    hasAnyPermission = _f.hasAnyPermission,
    hasAllPermissions = _f.hasAllPermissions,
    hasMinimumRole = _f.hasMinimumRole,
    permissionsLoading = _f.isLoading,
    permissionsError = _f.error;
  var _g = (0, usePermissions_1.useRole)(),
    role = _g.role,
    roleLoading = _g.isLoading;
  var _h = (0, react_1.useState)(false),
    hasAccess = _h[0],
    setHasAccess = _h[1];
  var _j = (0, react_1.useState)(true),
    isChecking = _j[0],
    setIsChecking = _j[1];
  var _k = (0, react_1.useState)(null),
    checkError = _k[0],
    setCheckError = _k[1];
  /**
   * Check all access conditions
   */
  var checkAccess = function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var hasRequired, hasAny, customResult, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 7, , 8]);
            // Check role requirement
            if (requiredRole && !hasMinimumRole(requiredRole)) {
              return [2 /*return*/, false];
            }
            if (!(requiredPermissions.length > 0)) return [3 /*break*/, 2];
            return [4 /*yield*/, hasAllPermissions(requiredPermissions, resourceId)];
          case 1:
            hasRequired = _a.sent();
            if (!hasRequired) {
              return [2 /*return*/, false];
            }
            _a.label = 2;
          case 2:
            if (!(anyPermissions.length > 0)) return [3 /*break*/, 4];
            return [4 /*yield*/, hasAnyPermission(anyPermissions, resourceId)];
          case 3:
            hasAny = _a.sent();
            if (!hasAny) {
              return [2 /*return*/, false];
            }
            _a.label = 4;
          case 4:
            if (!customCheck) return [3 /*break*/, 6];
            return [4 /*yield*/, customCheck()];
          case 5:
            customResult = _a.sent();
            if (!customResult) {
              return [2 /*return*/, false];
            }
            _a.label = 6;
          case 6:
            return [2 /*return*/, true];
          case 7:
            error_1 = _a.sent();
            console.error("Permission check failed:", error_1);
            setCheckError(error_1 instanceof Error ? error_1.message : "Permission check failed");
            return [2 /*return*/, false];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Effect to check permissions when dependencies change
   */
  (0, react_1.useEffect)(
    function () {
      var mounted = true;
      var performCheck = function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var access, error_2;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                if (permissionsLoading || roleLoading) {
                  return [2 /*return*/];
                }
                setIsChecking(true);
                setCheckError(null);
                _a.label = 1;
              case 1:
                _a.trys.push([1, 3, 4, 5]);
                return [4 /*yield*/, checkAccess()];
              case 2:
                access = _a.sent();
                if (mounted) {
                  setHasAccess(access);
                }
                return [3 /*break*/, 5];
              case 3:
                error_2 = _a.sent();
                console.error("Access check error:", error_2);
                if (mounted) {
                  setHasAccess(false);
                  setCheckError(error_2 instanceof Error ? error_2.message : "Access check failed");
                }
                return [3 /*break*/, 5];
              case 4:
                if (mounted) {
                  setIsChecking(false);
                }
                return [7 /*endfinally*/];
              case 5:
                return [2 /*return*/];
            }
          });
        });
      };
      performCheck();
      return function () {
        mounted = false;
      };
    },
    [
      permissionsLoading,
      roleLoading,
      role,
      requiredRole,
      requiredPermissions,
      anyPermissions,
      resourceId,
      customCheck,
    ],
  );
  /**
   * Show loading state
   */
  if (permissionsLoading || roleLoading || isChecking) {
    var LoadingComponent = loadingComponent || <DefaultLoading />;
    return asFragment ? <>{LoadingComponent}</> : <div>{LoadingComponent}</div>;
  }
  /**
   * Show error state
   */
  if (permissionsError || checkError) {
    var errorMessage = permissionsError || checkError;
    var ErrorComponent = (
      <alert_1.Alert variant="destructive">
        <lucide_react_1.ShieldAlert className="h-4 w-4" />
        <alert_1.AlertDescription>Permission check failed: {errorMessage}</alert_1.AlertDescription>
      </alert_1.Alert>
    );
    return asFragment ? <>{ErrorComponent}</> : <div>{ErrorComponent}</div>;
  }
  /**
   * Show access denied state
   */
  if (!hasAccess) {
    if (fallback) {
      return asFragment ? <>{fallback}</> : <div>{fallback}</div>;
    }
    if (showAccessDenied) {
      var AccessDeniedComponent = <DefaultAccessDenied message={accessDeniedMessage} />;
      return asFragment ? <>{AccessDeniedComponent}</> : <div>{AccessDeniedComponent}</div>;
    }
    return null;
  }
  /**
   * Render children if access is granted
   */
  return asFragment ? <>{children}</> : <div>{children}</div>;
};
exports.PermissionGuard = PermissionGuard;
var RoleGuard = function (_a) {
  var children = _a.children,
    allowedRoles = _a.allowedRoles,
    fallback = _a.fallback,
    _b = _a.showAccessDenied,
    showAccessDenied = _b === void 0 ? true : _b;
  var role = (0, usePermissions_1.useRole)().role;
  if (!role || !allowedRoles.includes(role)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    if (showAccessDenied) {
      return (
        <DefaultAccessDenied message={"Access restricted to: ".concat(allowedRoles.join(", "))} />
      );
    }
    return null;
  }
  return <>{children}</>;
};
exports.RoleGuard = RoleGuard;
var FeatureGuard = function (_a) {
  var children = _a.children,
    feature = _a.feature,
    _b = _a.action,
    action = _b === void 0 ? "read" : _b,
    fallback = _a.fallback,
    _c = _a.showAccessDenied,
    showAccessDenied = _c === void 0 ? true : _c;
  var _d = (0, usePermissions_1.usePermissions)(),
    canView = _d.canView,
    canManage = _d.canManage;
  var hasFeatureAccess = action === "manage" ? canManage(feature) : canView(feature);
  if (!hasFeatureAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }
    if (showAccessDenied) {
      return (
        <DefaultAccessDenied
          message={"You don't have ".concat(action, " access to ").concat(feature)}
        />
      );
    }
    return null;
  }
  return <>{children}</>;
};
exports.FeatureGuard = FeatureGuard;
var ConditionalRender = function (_a) {
  var condition = _a.condition,
    children = _a.children,
    fallback = _a.fallback;
  return condition ? <>{children}</> : <>{fallback || null}</>;
};
exports.ConditionalRender = ConditionalRender;
var PermissionButton = function (_a) {
  var _b = _a.requiredPermissions,
    requiredPermissions = _b === void 0 ? [] : _b,
    _c = _a.anyPermissions,
    anyPermissions = _c === void 0 ? [] : _c,
    requiredRole = _a.requiredRole,
    resourceId = _a.resourceId,
    children = _a.children,
    disabledFallback = _a.disabledFallback,
    disabled = _a.disabled,
    buttonProps = __rest(_a, [
      "requiredPermissions",
      "anyPermissions",
      "requiredRole",
      "resourceId",
      "children",
      "disabledFallback",
      "disabled",
    ]);
  return (
    <exports.PermissionGuard
      requiredPermissions={requiredPermissions}
      anyPermissions={anyPermissions}
      requiredRole={requiredRole}
      resourceId={resourceId}
      showAccessDenied={false}
      fallback={disabledFallback}
      asFragment
    >
      <button {...buttonProps} disabled={disabled}>
        {children}
      </button>
    </exports.PermissionGuard>
  );
};
exports.PermissionButton = PermissionButton;
var PermissionLink = function (_a) {
  var _b = _a.requiredPermissions,
    requiredPermissions = _b === void 0 ? [] : _b,
    _c = _a.anyPermissions,
    anyPermissions = _c === void 0 ? [] : _c,
    requiredRole = _a.requiredRole,
    resourceId = _a.resourceId,
    children = _a.children,
    disabledFallback = _a.disabledFallback,
    linkProps = __rest(_a, [
      "requiredPermissions",
      "anyPermissions",
      "requiredRole",
      "resourceId",
      "children",
      "disabledFallback",
    ]);
  return (
    <exports.PermissionGuard
      requiredPermissions={requiredPermissions}
      anyPermissions={anyPermissions}
      requiredRole={requiredRole}
      resourceId={resourceId}
      showAccessDenied={false}
      fallback={disabledFallback}
      asFragment
    >
      <a {...linkProps}>{children}</a>
    </exports.PermissionGuard>
  );
};
exports.PermissionLink = PermissionLink;
exports.default = exports.PermissionGuard;
