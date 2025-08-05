/**
 * Permission Validation System
 * Comprehensive role-based access control with fine-grained permissions
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
exports.permissionValidator = void 0;
var client_1 = require("@/lib/supabase/client");
var security_audit_logger_1 = require("./security-audit-logger");
var performance_tracker_1 = require("./performance-tracker");
var PermissionValidator = /** @class */ (() => {
  function PermissionValidator() {
    this.permissionCache = new Map();
    this.cacheExpiry = new Map();
    this.CACHE_TTL = 300000; // 5 minutes
  }
  PermissionValidator.getInstance = () => {
    if (!PermissionValidator.instance) {
      PermissionValidator.instance = new PermissionValidator();
    }
    return PermissionValidator.instance;
  };
  /**
   * Check if user has permission for a specific action
   */
  PermissionValidator.prototype.checkPermission = function (context, resource, action) {
    return __awaiter(this, void 0, void 0, function () {
      var startTime,
        userPermissions,
        matchedPermission,
        result_1,
        conditionResult,
        result_2,
        elevationCheck,
        result,
        error_1,
        result;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            startTime = Date.now();
            _a.label = 1;
          case 1:
            _a.trys.push([1, 10, , 12]);
            return [4 /*yield*/, this.getUserPermissions(context.userId)];
          case 2:
            userPermissions = _a.sent();
            matchedPermission = this.findMatchingPermission(
              userPermissions.effectivePermissions,
              resource,
              action,
            );
            if (matchedPermission) return [3 /*break*/, 4];
            result_1 = {
              granted: false,
              reason: "No permission found for ".concat(action, " on ").concat(resource),
            };
            return [4 /*yield*/, this.logPermissionCheck(context, resource, action, result_1)];
          case 3:
            _a.sent();
            return [2 /*return*/, result_1];
          case 4:
            return [
              4 /*yield*/,
              this.evaluateConditions(matchedPermission.conditions || [], context),
            ];
          case 5:
            conditionResult = _a.sent();
            if (conditionResult.passed) return [3 /*break*/, 7];
            result_2 = {
              granted: false,
              reason: "Permission conditions not met: ".concat(conditionResult.reason),
              matchedPermission: matchedPermission,
              appliedConditions: matchedPermission.conditions,
            };
            return [4 /*yield*/, this.logPermissionCheck(context, resource, action, result_2)];
          case 6:
            _a.sent();
            return [2 /*return*/, result_2];
          case 7:
            return [4 /*yield*/, this.checkElevationRequirements(matchedPermission, context)];
          case 8:
            elevationCheck = _a.sent();
            result = {
              granted: true,
              reason: "Permission granted",
              matchedPermission: matchedPermission,
              appliedConditions: matchedPermission.conditions,
              requiresElevation: elevationCheck.required,
              elevationReason: elevationCheck.reason,
            };
            return [4 /*yield*/, this.logPermissionCheck(context, resource, action, result)];
          case 9:
            _a.sent();
            performance_tracker_1.performanceTracker.recordMetric(
              "permission_check",
              Date.now() - startTime,
            );
            return [2 /*return*/, result];
          case 10:
            error_1 = _a.sent();
            console.error("Permission check failed:", error_1);
            result = {
              granted: false,
              reason: "Permission check failed due to system error",
            };
            return [4 /*yield*/, this.logPermissionCheck(context, resource, action, result)];
          case 11:
            _a.sent();
            return [2 /*return*/, result];
          case 12:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Check multiple permissions at once
   */
  PermissionValidator.prototype.checkMultiplePermissions = function (context, checks) {
    return __awaiter(this, void 0, void 0, function () {
      var results, _i, checks_1, check, key, _a, _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            results = {};
            (_i = 0), (checks_1 = checks);
            _c.label = 1;
          case 1:
            if (!(_i < checks_1.length)) return [3 /*break*/, 4];
            check = checks_1[_i];
            key = "".concat(check.resource, ":").concat(check.action);
            _a = results;
            _b = key;
            return [4 /*yield*/, this.checkPermission(context, check.resource, check.action)];
          case 2:
            _a[_b] = _c.sent();
            _c.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            return [2 /*return*/, results];
        }
      });
    });
  };
  /**
   * Get user's effective permissions
   */
  PermissionValidator.prototype.getUserPermissions = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var cached,
        cacheExpiry,
        startTime,
        supabase,
        userRoles,
        directPermissions,
        roles,
        clinicPermissions,
        allPermissions,
        _i,
        userRoles_1,
        userRole,
        role,
        rolePermissions,
        _a,
        _b,
        rp,
        processedRole,
        directPerms,
        _c,
        directPermissions_1,
        dp,
        effectivePermissions,
        userPermissions,
        error_2;
      var _d;
      return __generator(this, function (_e) {
        switch (_e.label) {
          case 0:
            cached = this.permissionCache.get(userId);
            cacheExpiry = this.cacheExpiry.get(userId);
            if (cached && cacheExpiry && Date.now() < cacheExpiry) {
              return [2 /*return*/, cached];
            }
            startTime = Date.now();
            _e.label = 1;
          case 1:
            _e.trys.push([1, 5, , 6]);
            return [4 /*yield*/, (0, client_1.createClient)()];
          case 2:
            supabase = _e.sent();
            return [
              4 /*yield*/,
              supabase
                .from("user_roles")
                .select(
                  "\n          role_id,\n          clinic_id,\n          roles (\n            id,\n            name,\n            description,\n            is_system_role,\n            role_permissions (\n              permission_id,\n              permissions (\n                id,\n                name,\n                resource,\n                action,\n                conditions,\n                description\n              )\n            )\n          )\n        ",
                )
                .eq("user_id", userId)
                .eq("is_active", true),
            ];
          case 3:
            userRoles = _e.sent().data;
            return [
              4 /*yield*/,
              supabase
                .from("user_permissions")
                .select(
                  "\n          permission_id,\n          clinic_id,\n          permissions (\n            id,\n            name,\n            resource,\n            action,\n            conditions,\n            description\n          )\n        ",
                )
                .eq("user_id", userId)
                .eq("is_active", true),
            ];
          case 4:
            directPermissions = _e.sent().data;
            roles = [];
            clinicPermissions = {};
            allPermissions = [];
            // Process roles
            if (userRoles) {
              for (_i = 0, userRoles_1 = userRoles; _i < userRoles_1.length; _i++) {
                userRole = userRoles_1[_i];
                role = userRole.roles;
                if (!role) continue;
                rolePermissions = [];
                if (role.role_permissions) {
                  for (_a = 0, _b = role.role_permissions; _a < _b.length; _a++) {
                    rp = _b[_a];
                    if (rp.permissions) {
                      rolePermissions.push(rp.permissions);
                    }
                  }
                }
                processedRole = {
                  id: role.id,
                  name: role.name,
                  description: role.description,
                  permissions: rolePermissions,
                  isSystemRole: role.is_system_role,
                  clinicId: userRole.clinic_id,
                };
                roles.push(processedRole);
                allPermissions.push.apply(allPermissions, rolePermissions);
                // Group by clinic
                if (userRole.clinic_id) {
                  if (!clinicPermissions[userRole.clinic_id]) {
                    clinicPermissions[userRole.clinic_id] = [];
                  }
                  (_d = clinicPermissions[userRole.clinic_id]).push.apply(_d, rolePermissions);
                }
              }
            }
            directPerms = [];
            if (directPermissions) {
              for (
                _c = 0, directPermissions_1 = directPermissions;
                _c < directPermissions_1.length;
                _c++
              ) {
                dp = directPermissions_1[_c];
                if (dp.permissions) {
                  directPerms.push(dp.permissions);
                  allPermissions.push(dp.permissions);
                  // Group by clinic
                  if (dp.clinic_id) {
                    if (!clinicPermissions[dp.clinic_id]) {
                      clinicPermissions[dp.clinic_id] = [];
                    }
                    clinicPermissions[dp.clinic_id].push(dp.permissions);
                  }
                }
              }
            }
            effectivePermissions = this.deduplicatePermissions(allPermissions);
            userPermissions = {
              userId: userId,
              roles: roles,
              directPermissions: directPerms,
              clinicPermissions: clinicPermissions,
              effectivePermissions: effectivePermissions,
            };
            // Cache the result
            this.permissionCache.set(userId, userPermissions);
            this.cacheExpiry.set(userId, Date.now() + this.CACHE_TTL);
            performance_tracker_1.performanceTracker.recordMetric(
              "user_permissions_load",
              Date.now() - startTime,
            );
            return [2 /*return*/, userPermissions];
          case 5:
            error_2 = _e.sent();
            console.error("Failed to load user permissions:", error_2);
            // Return empty permissions on error
            return [
              2 /*return*/,
              {
                userId: userId,
                roles: [],
                directPermissions: [],
                clinicPermissions: {},
                effectivePermissions: [],
              },
            ];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Assign role to user
   */
  PermissionValidator.prototype.assignRole = function (userId, roleId, clinicId, assignedBy) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, error, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, (0, client_1.createClient)()];
          case 1:
            supabase = _a.sent();
            return [
              4 /*yield*/,
              supabase.from("user_roles").insert({
                user_id: userId,
                role_id: roleId,
                clinic_id: clinicId,
                assigned_by: assignedBy,
                assigned_at: new Date().toISOString(),
                is_active: true,
              }),
            ];
          case 2:
            error = _a.sent().error;
            if (error) {
              console.error("Role assignment failed:", error);
              return [2 /*return*/, false];
            }
            // Clear cache
            this.clearUserCache(userId);
            // Log security event
            return [
              4 /*yield*/,
              security_audit_logger_1.securityAuditLogger.logSecurityEvent(
                "permission_granted",
                "Role ".concat(roleId, " assigned to user ").concat(userId),
                {
                  role_id: roleId,
                  clinic_id: clinicId,
                  assigned_by: assignedBy,
                },
                {
                  userId: userId,
                  severity: "info",
                  complianceFlags: ["lgpd_relevant"],
                },
              ),
            ];
          case 3:
            // Log security event
            _a.sent();
            return [2 /*return*/, true];
          case 4:
            error_3 = _a.sent();
            console.error("Role assignment error:", error_3);
            return [2 /*return*/, false];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Remove role from user
   */
  PermissionValidator.prototype.removeRole = function (userId, roleId, clinicId, removedBy) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, query, error, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, (0, client_1.createClient)()];
          case 1:
            supabase = _a.sent();
            query = supabase
              .from("user_roles")
              .update({
                is_active: false,
                removed_by: removedBy,
                removed_at: new Date().toISOString(),
              })
              .eq("user_id", userId)
              .eq("role_id", roleId);
            if (clinicId) {
              query = query.eq("clinic_id", clinicId);
            }
            return [4 /*yield*/, query];
          case 2:
            error = _a.sent().error;
            if (error) {
              console.error("Role removal failed:", error);
              return [2 /*return*/, false];
            }
            // Clear cache
            this.clearUserCache(userId);
            // Log security event
            return [
              4 /*yield*/,
              security_audit_logger_1.securityAuditLogger.logSecurityEvent(
                "permission_denied",
                "Role ".concat(roleId, " removed from user ").concat(userId),
                {
                  role_id: roleId,
                  clinic_id: clinicId,
                  removed_by: removedBy,
                },
                {
                  userId: userId,
                  severity: "info",
                  complianceFlags: ["lgpd_relevant"],
                },
              ),
            ];
          case 3:
            // Log security event
            _a.sent();
            return [2 /*return*/, true];
          case 4:
            error_4 = _a.sent();
            console.error("Role removal error:", error_4);
            return [2 /*return*/, false];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Grant direct permission to user
   */
  PermissionValidator.prototype.grantPermission = function (
    userId,
    permissionId,
    clinicId,
    grantedBy,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, error, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, (0, client_1.createClient)()];
          case 1:
            supabase = _a.sent();
            return [
              4 /*yield*/,
              supabase.from("user_permissions").insert({
                user_id: userId,
                permission_id: permissionId,
                clinic_id: clinicId,
                granted_by: grantedBy,
                granted_at: new Date().toISOString(),
                is_active: true,
              }),
            ];
          case 2:
            error = _a.sent().error;
            if (error) {
              console.error("Permission grant failed:", error);
              return [2 /*return*/, false];
            }
            // Clear cache
            this.clearUserCache(userId);
            // Log security event
            return [
              4 /*yield*/,
              security_audit_logger_1.securityAuditLogger.logSecurityEvent(
                "permission_granted",
                "Permission ".concat(permissionId, " granted to user ").concat(userId),
                {
                  permission_id: permissionId,
                  clinic_id: clinicId,
                  granted_by: grantedBy,
                },
                {
                  userId: userId,
                  severity: "info",
                  complianceFlags: ["lgpd_relevant"],
                },
              ),
            ];
          case 3:
            // Log security event
            _a.sent();
            return [2 /*return*/, true];
          case 4:
            error_5 = _a.sent();
            console.error("Permission grant error:", error_5);
            return [2 /*return*/, false];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Revoke direct permission from user
   */
  PermissionValidator.prototype.revokePermission = function (
    userId,
    permissionId,
    clinicId,
    revokedBy,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, query, error, error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, (0, client_1.createClient)()];
          case 1:
            supabase = _a.sent();
            query = supabase
              .from("user_permissions")
              .update({
                is_active: false,
                revoked_by: revokedBy,
                revoked_at: new Date().toISOString(),
              })
              .eq("user_id", userId)
              .eq("permission_id", permissionId);
            if (clinicId) {
              query = query.eq("clinic_id", clinicId);
            }
            return [4 /*yield*/, query];
          case 2:
            error = _a.sent().error;
            if (error) {
              console.error("Permission revocation failed:", error);
              return [2 /*return*/, false];
            }
            // Clear cache
            this.clearUserCache(userId);
            // Log security event
            return [
              4 /*yield*/,
              security_audit_logger_1.securityAuditLogger.logSecurityEvent(
                "permission_denied",
                "Permission ".concat(permissionId, " revoked from user ").concat(userId),
                {
                  permission_id: permissionId,
                  clinic_id: clinicId,
                  revoked_by: revokedBy,
                },
                {
                  userId: userId,
                  severity: "info",
                  complianceFlags: ["lgpd_relevant"],
                },
              ),
            ];
          case 3:
            // Log security event
            _a.sent();
            return [2 /*return*/, true];
          case 4:
            error_6 = _a.sent();
            console.error("Permission revocation error:", error_6);
            return [2 /*return*/, false];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Private helper methods
   */
  PermissionValidator.prototype.findMatchingPermission = (permissions, resource, action) =>
    permissions.find(
      (permission) => permission.resource === resource && permission.action === action,
    );
  PermissionValidator.prototype.evaluateConditions = function (conditions, context) {
    return __awaiter(this, void 0, void 0, function () {
      var _i, conditions_1, condition, result;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            (_i = 0), (conditions_1 = conditions);
            _a.label = 1;
          case 1:
            if (!(_i < conditions_1.length)) return [3 /*break*/, 4];
            condition = conditions_1[_i];
            return [4 /*yield*/, this.evaluateCondition(condition, context)];
          case 2:
            result = _a.sent();
            if (!result.passed) {
              return [2 /*return*/, result];
            }
            _a.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            return [2 /*return*/, { passed: true }];
        }
      });
    });
  };
  PermissionValidator.prototype.evaluateCondition = function (condition, context) {
    return __awaiter(this, void 0, void 0, function () {
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _a = condition.type;
            switch (_a) {
              case "time":
                return [3 /*break*/, 1];
              case "location":
                return [3 /*break*/, 2];
              case "resource_owner":
                return [3 /*break*/, 3];
              case "clinic_member":
                return [3 /*break*/, 5];
              case "custom":
                return [3 /*break*/, 7];
            }
            return [3 /*break*/, 9];
          case 1:
            return [2 /*return*/, this.evaluateTimeCondition(condition, context)];
          case 2:
            return [2 /*return*/, this.evaluateLocationCondition(condition, context)];
          case 3:
            return [4 /*yield*/, this.evaluateResourceOwnerCondition(condition, context)];
          case 4:
            return [2 /*return*/, _b.sent()];
          case 5:
            return [4 /*yield*/, this.evaluateClinicMemberCondition(condition, context)];
          case 6:
            return [2 /*return*/, _b.sent()];
          case 7:
            return [4 /*yield*/, this.evaluateCustomCondition(condition, context)];
          case 8:
            return [2 /*return*/, _b.sent()];
          case 9:
            return [2 /*return*/, { passed: true }];
        }
      });
    });
  };
  PermissionValidator.prototype.evaluateTimeCondition = (condition, context) => {
    var currentTime = new Date(context.timestamp);
    var currentHour = currentTime.getHours();
    switch (condition.operator) {
      case "greater_than":
        return {
          passed: currentHour > condition.value,
          reason:
            currentHour <= condition.value
              ? "Current time ".concat(currentHour, " is not after ").concat(condition.value)
              : undefined,
        };
      case "less_than":
        return {
          passed: currentHour < condition.value,
          reason:
            currentHour >= condition.value
              ? "Current time ".concat(currentHour, " is not before ").concat(condition.value)
              : undefined,
        };
      default:
        return { passed: true };
    }
  };
  PermissionValidator.prototype.evaluateLocationCondition = (condition, context) => {
    // IP-based location checking (simplified)
    var userIP = context.ipAddress;
    switch (condition.operator) {
      case "in": {
        var allowedIPs = Array.isArray(condition.value) ? condition.value : [condition.value];
        return {
          passed: allowedIPs.includes(userIP),
          reason: !allowedIPs.includes(userIP)
            ? "IP ".concat(userIP, " not in allowed list")
            : undefined,
        };
      }
      default:
        return { passed: true };
    }
  };
  PermissionValidator.prototype.evaluateResourceOwnerCondition = function (condition, context) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, data, isOwner, error_7;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            if (!context.resourceId || !context.resourceType) {
              return [
                2 /*return*/,
                { passed: false, reason: "Resource information required for ownership check" },
              ];
            }
            _a.label = 1;
          case 1:
            _a.trys.push([1, 4, , 5]);
            return [4 /*yield*/, (0, client_1.createClient)()];
          case 2:
            supabase = _a.sent();
            return [
              4 /*yield*/,
              supabase
                .from(context.resourceType)
                .select("created_by, user_id, owner_id")
                .eq("id", context.resourceId)
                .single(),
            ];
          case 3:
            data = _a.sent().data;
            if (!data) {
              return [2 /*return*/, { passed: false, reason: "Resource not found" }];
            }
            isOwner =
              data.created_by === context.userId ||
              data.user_id === context.userId ||
              data.owner_id === context.userId;
            return [
              2 /*return*/,
              {
                passed: isOwner,
                reason: !isOwner ? "User is not the resource owner" : undefined,
              },
            ];
          case 4:
            error_7 = _a.sent();
            return [2 /*return*/, { passed: false, reason: "Failed to check resource ownership" }];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  PermissionValidator.prototype.evaluateClinicMemberCondition = function (condition, context) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, data, error_8;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            if (!context.clinicId) {
              return [2 /*return*/, { passed: false, reason: "Clinic context required" }];
            }
            _a.label = 1;
          case 1:
            _a.trys.push([1, 4, , 5]);
            return [4 /*yield*/, (0, client_1.createClient)()];
          case 2:
            supabase = _a.sent();
            return [
              4 /*yield*/,
              supabase
                .from("clinic_members")
                .select("id")
                .eq("user_id", context.userId)
                .eq("clinic_id", context.clinicId)
                .eq("is_active", true)
                .single(),
            ];
          case 3:
            data = _a.sent().data;
            return [
              2 /*return*/,
              {
                passed: !!data,
                reason: !data ? "User is not a member of this clinic" : undefined,
              },
            ];
          case 4:
            error_8 = _a.sent();
            return [2 /*return*/, { passed: false, reason: "Failed to check clinic membership" }];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  PermissionValidator.prototype.evaluateCustomCondition = function (condition, context) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Custom condition evaluation logic
        // This can be extended based on specific business requirements
        return [2 /*return*/, { passed: true }];
      });
    });
  };
  PermissionValidator.prototype.checkElevationRequirements = function (permission, context) {
    return __awaiter(this, void 0, void 0, function () {
      var sensitiveActions, sensitiveResources;
      return __generator(this, (_a) => {
        sensitiveActions = ["delete", "export", "manage"];
        sensitiveResources = ["user", "clinic", "financial_data", "medical_records"];
        if (
          sensitiveActions.includes(permission.action) ||
          sensitiveResources.includes(permission.resource)
        ) {
          return [
            2 /*return*/,
            {
              required: true,
              reason: "Sensitive operation requires additional authentication",
            },
          ];
        }
        return [2 /*return*/, { required: false }];
      });
    });
  };
  PermissionValidator.prototype.deduplicatePermissions = (permissions) => {
    var seen = new Set();
    return permissions.filter((permission) => {
      var key = "".concat(permission.resource, ":").concat(permission.action);
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  };
  PermissionValidator.prototype.logPermissionCheck = function (context, resource, action, result) {
    return __awaiter(this, void 0, void 0, function () {
      var eventType;
      var _a;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            eventType = result.granted ? "permission_granted" : "permission_denied";
            return [
              4 /*yield*/,
              security_audit_logger_1.securityAuditLogger.logSecurityEvent(
                eventType,
                "Permission check: "
                  .concat(action, " on ")
                  .concat(resource, " - ")
                  .concat(result.granted ? "granted" : "denied"),
                {
                  resource: resource,
                  action: action,
                  granted: result.granted,
                  reason: result.reason,
                  matched_permission:
                    (_a = result.matchedPermission) === null || _a === void 0 ? void 0 : _a.id,
                  requires_elevation: result.requiresElevation,
                },
                {
                  userId: context.userId,
                  sessionId: context.sessionId,
                  ipAddress: context.ipAddress,
                  userAgent: context.userAgent,
                  severity: result.granted ? "info" : "warning",
                  complianceFlags: ["lgpd_relevant"],
                },
              ),
            ];
          case 1:
            _b.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  PermissionValidator.prototype.clearUserCache = function (userId) {
    this.permissionCache.delete(userId);
    this.cacheExpiry.delete(userId);
  };
  /**
   * Clear all cached permissions
   */
  PermissionValidator.prototype.clearAllCache = function () {
    this.permissionCache.clear();
    this.cacheExpiry.clear();
  };
  return PermissionValidator;
})();
exports.permissionValidator = PermissionValidator.getInstance();
