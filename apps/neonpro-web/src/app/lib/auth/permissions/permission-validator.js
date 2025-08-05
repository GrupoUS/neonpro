"use strict";
/**
 * Permission Validation System
 *
 * Comprehensive role-based access control (RBAC) and permission validation
 * system for NeonPro healthcare application with granular permission management.
 *
 * Features:
 * - Role-based access control (RBAC) with hierarchical roles
 * - Resource-level permission validation
 * - Dynamic permission evaluation
 * - Permission caching for performance
 * - Audit logging for permission checks
 * - Healthcare-specific role definitions
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.createpermissionValidator = exports.Permission = exports.ResourceType = exports.SystemRole = void 0;
exports.hasPermission = hasPermission;
exports.requirePermission = requirePermission;
exports.checkMultiplePermissions = checkMultiplePermissions;
exports.getUserRoles = getUserRoles;
exports.updateUserRoles = updateUserRoles;
var client_1 = require("@/lib/supabase/client");
var security_audit_logger_1 = require("../audit/security-audit-logger");
// System roles with hierarchical permissions
var SystemRole;
(function (SystemRole) {
    SystemRole["SUPER_ADMIN"] = "super_admin";
    SystemRole["ADMIN"] = "admin";
    SystemRole["MANAGER"] = "manager";
    SystemRole["DOCTOR"] = "doctor";
    SystemRole["NURSE"] = "nurse";
    SystemRole["RECEPTIONIST"] = "receptionist";
    SystemRole["TECHNICIAN"] = "technician";
    SystemRole["PATIENT"] = "patient";
    SystemRole["GUEST"] = "guest"; // Limited access
})(SystemRole || (exports.SystemRole = SystemRole = {}));
// Resource types in the system
var ResourceType;
(function (ResourceType) {
    ResourceType["USER"] = "user";
    ResourceType["PATIENT"] = "patient";
    ResourceType["APPOINTMENT"] = "appointment";
    ResourceType["MEDICAL_RECORD"] = "medical_record";
    ResourceType["PRESCRIPTION"] = "prescription";
    ResourceType["BILLING"] = "billing";
    ResourceType["REPORT"] = "report";
    ResourceType["SYSTEM_CONFIG"] = "system_config";
    ResourceType["AUDIT_LOG"] = "audit_log";
    ResourceType["SUBSCRIPTION"] = "subscription";
    ResourceType["CLINIC"] = "clinic";
    ResourceType["DEPARTMENT"] = "department";
})(ResourceType || (exports.ResourceType = ResourceType = {}));
// Actions that can be performed on resources
var Permission;
(function (Permission) {
    Permission["CREATE"] = "create";
    Permission["READ"] = "read";
    Permission["UPDATE"] = "update";
    Permission["DELETE"] = "delete";
    Permission["LIST"] = "list";
    Permission["EXPORT"] = "export";
    Permission["APPROVE"] = "approve";
    Permission["REJECT"] = "reject";
    Permission["ASSIGN"] = "assign";
    Permission["UNASSIGN"] = "unassign";
    Permission["MANAGE"] = "manage";
    Permission["ADMIN"] = "admin";
})(Permission || (exports.Permission = Permission = {}));
// Role hierarchy (higher roles inherit permissions from lower roles)
var ROLE_HIERARCHY = (_a = {},
    _a[SystemRole.SUPER_ADMIN] = 9,
    _a[SystemRole.ADMIN] = 8,
    _a[SystemRole.MANAGER] = 7,
    _a[SystemRole.DOCTOR] = 6,
    _a[SystemRole.NURSE] = 5,
    _a[SystemRole.TECHNICIAN] = 4,
    _a[SystemRole.RECEPTIONIST] = 3,
    _a[SystemRole.PATIENT] = 2,
    _a[SystemRole.GUEST] = 1,
    _a);
// Default permission matrix for healthcare roles
var DEFAULT_PERMISSIONS = [
    // Super Admin - Full system access
    {
        role: SystemRole.SUPER_ADMIN,
        resource: ResourceType.USER,
        actions: [Permission.CREATE, Permission.READ, Permission.UPDATE, Permission.DELETE, Permission.LIST, Permission.MANAGE],
        scope: 'system'
    },
    {
        role: SystemRole.SUPER_ADMIN,
        resource: ResourceType.SYSTEM_CONFIG,
        actions: [Permission.CREATE, Permission.READ, Permission.UPDATE, Permission.DELETE, Permission.MANAGE],
        scope: 'system'
    },
    {
        role: SystemRole.SUPER_ADMIN,
        resource: ResourceType.AUDIT_LOG,
        actions: [Permission.READ, Permission.LIST, Permission.EXPORT],
        scope: 'system'
    },
    // Admin - Clinic administration
    {
        role: SystemRole.ADMIN,
        resource: ResourceType.USER,
        actions: [Permission.CREATE, Permission.READ, Permission.UPDATE, Permission.LIST, Permission.MANAGE],
        scope: 'clinic'
    },
    {
        role: SystemRole.ADMIN,
        resource: ResourceType.PATIENT,
        actions: [Permission.CREATE, Permission.READ, Permission.UPDATE, Permission.DELETE, Permission.LIST],
        scope: 'clinic'
    },
    {
        role: SystemRole.ADMIN,
        resource: ResourceType.APPOINTMENT,
        actions: [Permission.CREATE, Permission.READ, Permission.UPDATE, Permission.DELETE, Permission.LIST],
        scope: 'clinic'
    },
    {
        role: SystemRole.ADMIN,
        resource: ResourceType.BILLING,
        actions: [Permission.CREATE, Permission.READ, Permission.UPDATE, Permission.LIST, Permission.EXPORT],
        scope: 'clinic'
    },
    {
        role: SystemRole.ADMIN,
        resource: ResourceType.REPORT,
        actions: [Permission.READ, Permission.LIST, Permission.EXPORT],
        scope: 'clinic'
    },
    // Manager - Operational management
    {
        role: SystemRole.MANAGER,
        resource: ResourceType.APPOINTMENT,
        actions: [Permission.CREATE, Permission.READ, Permission.UPDATE, Permission.LIST, Permission.ASSIGN],
        scope: 'department'
    },
    {
        role: SystemRole.MANAGER,
        resource: ResourceType.PATIENT,
        actions: [Permission.READ, Permission.UPDATE, Permission.LIST],
        scope: 'department'
    },
    {
        role: SystemRole.MANAGER,
        resource: ResourceType.REPORT,
        actions: [Permission.READ, Permission.LIST],
        scope: 'department'
    },
    // Doctor - Medical professionals
    {
        role: SystemRole.DOCTOR,
        resource: ResourceType.PATIENT,
        actions: [Permission.READ, Permission.UPDATE, Permission.LIST],
        scope: 'own',
        conditions: ['assigned_patients_only']
    },
    {
        role: SystemRole.DOCTOR,
        resource: ResourceType.MEDICAL_RECORD,
        actions: [Permission.CREATE, Permission.READ, Permission.UPDATE],
        scope: 'own',
        conditions: ['assigned_patients_only']
    },
    {
        role: SystemRole.DOCTOR,
        resource: ResourceType.PRESCRIPTION,
        actions: [Permission.CREATE, Permission.READ, Permission.UPDATE],
        scope: 'own',
        conditions: ['assigned_patients_only']
    },
    {
        role: SystemRole.DOCTOR,
        resource: ResourceType.APPOINTMENT,
        actions: [Permission.READ, Permission.UPDATE, Permission.LIST],
        scope: 'own',
        conditions: ['assigned_appointments_only']
    },
    // Nurse - Nursing staff
    {
        role: SystemRole.NURSE,
        resource: ResourceType.PATIENT,
        actions: [Permission.READ, Permission.UPDATE, Permission.LIST],
        scope: 'department',
        conditions: ['basic_patient_info_only']
    },
    {
        role: SystemRole.NURSE,
        resource: ResourceType.APPOINTMENT,
        actions: [Permission.READ, Permission.UPDATE, Permission.LIST],
        scope: 'department'
    },
    {
        role: SystemRole.NURSE,
        resource: ResourceType.MEDICAL_RECORD,
        actions: [Permission.READ, Permission.UPDATE],
        scope: 'department',
        conditions: ['nursing_notes_only']
    },
    // Receptionist - Front desk operations
    {
        role: SystemRole.RECEPTIONIST,
        resource: ResourceType.APPOINTMENT,
        actions: [Permission.CREATE, Permission.READ, Permission.UPDATE, Permission.LIST],
        scope: 'clinic'
    },
    {
        role: SystemRole.RECEPTIONIST,
        resource: ResourceType.PATIENT,
        actions: [Permission.CREATE, Permission.READ, Permission.UPDATE, Permission.LIST],
        scope: 'clinic',
        conditions: ['contact_info_only']
    },
    {
        role: SystemRole.RECEPTIONIST,
        resource: ResourceType.BILLING,
        actions: [Permission.READ, Permission.LIST],
        scope: 'clinic',
        conditions: ['payment_status_only']
    },
    // Technician - Technical/lab staff
    {
        role: SystemRole.TECHNICIAN,
        resource: ResourceType.PATIENT,
        actions: [Permission.READ, Permission.LIST],
        scope: 'department',
        conditions: ['basic_patient_info_only']
    },
    {
        role: SystemRole.TECHNICIAN,
        resource: ResourceType.MEDICAL_RECORD,
        actions: [Permission.READ, Permission.UPDATE],
        scope: 'department',
        conditions: ['lab_results_only']
    },
    // Patient - Self-service access
    {
        role: SystemRole.PATIENT,
        resource: ResourceType.PATIENT,
        actions: [Permission.READ, Permission.UPDATE],
        scope: 'own',
        conditions: ['own_data_only']
    },
    {
        role: SystemRole.PATIENT,
        resource: ResourceType.APPOINTMENT,
        actions: [Permission.CREATE, Permission.READ, Permission.LIST],
        scope: 'own',
        conditions: ['own_appointments_only']
    },
    {
        role: SystemRole.PATIENT,
        resource: ResourceType.MEDICAL_RECORD,
        actions: [Permission.READ],
        scope: 'own',
        conditions: ['own_records_only', 'non_sensitive_only']
    },
    // Guest - Very limited access
    {
        role: SystemRole.GUEST,
        resource: ResourceType.APPOINTMENT,
        actions: [Permission.CREATE],
        scope: 'clinic',
        conditions: ['booking_only']
    }
];
var PermissionValidationSystem = /** @class */ (function () {
    function PermissionValidationSystem() {
        this.supabase = (0, client_1.createClient)();
        this.permissionCache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }
    /**
     * Check if user has permission to perform action on resource
     */
    PermissionValidationSystem.prototype.checkPermission = function (check) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, cached, userPermissions, result, error_1, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 6]);
                        cacheKey = this.generateCacheKey(check);
                        cached = this.permissionCache.get(cacheKey);
                        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
                            return [2 /*return*/, cached];
                        }
                        return [4 /*yield*/, this.getUserPermissions(check.userId)];
                    case 1:
                        userPermissions = _a.sent();
                        return [4 /*yield*/, this.evaluatePermission(check, userPermissions)
                            // Cache result
                        ];
                    case 2:
                        result = _a.sent();
                        // Cache result
                        this.permissionCache.set(cacheKey, result);
                        // Log permission check for audit
                        return [4 /*yield*/, this.logPermissionCheck(check, result)];
                    case 3:
                        // Log permission check for audit
                        _a.sent();
                        return [2 /*return*/, result];
                    case 4:
                        error_1 = _a.sent();
                        console.error('Error checking permission:', error_1);
                        result = {
                            allowed: false,
                            reason: 'Error during permission check',
                            timestamp: Date.now()
                        };
                        return [4 /*yield*/, this.logPermissionCheck(check, result)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, result];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check multiple permissions at once
     */
    PermissionValidationSystem.prototype.checkMultiplePermissions = function (checks) {
        return __awaiter(this, void 0, void 0, function () {
            var results;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all(checks.map(function (check) { return _this.checkPermission(check); }))];
                    case 1:
                        results = _a.sent();
                        return [2 /*return*/, results];
                }
            });
        });
    };
    /**
     * Get user's effective permissions
     */
    PermissionValidationSystem.prototype.getUserPermissions = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var stored, permissions, defaultPermissions;
            return __generator(this, function (_a) {
                try {
                    stored = localStorage.getItem("user_permissions_".concat(userId));
                    if (stored) {
                        permissions = JSON.parse(stored);
                        if (Date.now() - permissions.lastUpdated < this.cacheTimeout) {
                            return [2 /*return*/, permissions];
                        }
                    }
                    defaultPermissions = {
                        userId: userId,
                        roles: [SystemRole.PATIENT], // Default role
                        customPermissions: [],
                        isActive: true,
                        lastUpdated: Date.now()
                    };
                    // Cache permissions
                    localStorage.setItem("user_permissions_".concat(userId), JSON.stringify(defaultPermissions));
                    return [2 /*return*/, defaultPermissions];
                }
                catch (error) {
                    console.error('Error getting user permissions:', error);
                    throw new Error('Failed to retrieve user permissions');
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Update user roles
     */
    PermissionValidationSystem.prototype.updateUserRoles = function (userId, roles) {
        return __awaiter(this, void 0, void 0, function () {
            var currentPermissions, updatedPermissions, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getUserPermissions(userId)];
                    case 1:
                        currentPermissions = _a.sent();
                        updatedPermissions = __assign(__assign({}, currentPermissions), { roles: roles, lastUpdated: Date.now() });
                        // Store updated permissions
                        localStorage.setItem("user_permissions_".concat(userId), JSON.stringify(updatedPermissions));
                        // Clear cache for this user
                        this.clearUserPermissionCache(userId);
                        // Log role change
                        return [4 /*yield*/, security_audit_logger_1.securityAuditLogger.logEvent(security_audit_logger_1.AuditEventType.ROLE_CHANGE, {
                                previousRoles: currentPermissions.roles,
                                newRoles: roles,
                                changedBy: 'system' // In production, track who made the change
                            }, userId)];
                    case 2:
                        // Log role change
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        console.error('Error updating user roles:', error_2);
                        throw new Error('Failed to update user roles');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Add custom permission for user
     */
    PermissionValidationSystem.prototype.addCustomPermission = function (userId, permission) {
        return __awaiter(this, void 0, void 0, function () {
            var currentPermissions, updatedPermissions, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getUserPermissions(userId)];
                    case 1:
                        currentPermissions = _a.sent();
                        updatedPermissions = __assign(__assign({}, currentPermissions), { customPermissions: __spreadArray(__spreadArray([], currentPermissions.customPermissions, true), [permission], false), lastUpdated: Date.now() });
                        localStorage.setItem("user_permissions_".concat(userId), JSON.stringify(updatedPermissions));
                        this.clearUserPermissionCache(userId);
                        return [4 /*yield*/, security_audit_logger_1.securityAuditLogger.logEvent(security_audit_logger_1.AuditEventType.ROLE_CHANGE, {
                                action: 'custom_permission_added',
                                resource: permission.resource,
                                actions: permission.actions
                            }, userId)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _a.sent();
                        console.error('Error adding custom permission:', error_3);
                        throw new Error('Failed to add custom permission');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get permissions for role
     */
    PermissionValidationSystem.prototype.getRolePermissions = function (role) {
        return DEFAULT_PERMISSIONS.filter(function (p) { return p.role === role; });
    };
    /**
     * Check if role has higher privilege than another role
     */
    PermissionValidationSystem.prototype.isHigherRole = function (role1, role2) {
        return ROLE_HIERARCHY[role1] > ROLE_HIERARCHY[role2];
    };
    /**
     * Get all available roles
     */
    PermissionValidationSystem.prototype.getAvailableRoles = function () {
        return Object.values(SystemRole);
    };
    /**
     * Get permission requirements for resource action
     */
    PermissionValidationSystem.prototype.getPermissionRequirements = function (resource, action) {
        return DEFAULT_PERMISSIONS.filter(function (p) {
            return p.resource === resource && p.actions.includes(action);
        });
    };
    // Private methods
    PermissionValidationSystem.prototype.evaluatePermission = function (check, userPermissions) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, role, rolePermissions, _b, rolePermissions_1, permission, conditionResult, _c, _d, permission;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (!userPermissions.isActive) {
                            return [2 /*return*/, {
                                    allowed: false,
                                    reason: 'User account is inactive',
                                    timestamp: Date.now()
                                }];
                        }
                        _i = 0, _a = userPermissions.roles;
                        _e.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 7];
                        role = _a[_i];
                        rolePermissions = this.getRolePermissions(role);
                        _b = 0, rolePermissions_1 = rolePermissions;
                        _e.label = 2;
                    case 2:
                        if (!(_b < rolePermissions_1.length)) return [3 /*break*/, 6];
                        permission = rolePermissions_1[_b];
                        if (!this.matchesPermission(check, permission)) return [3 /*break*/, 5];
                        if (!permission.conditions) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.evaluateConditions(check, permission.conditions, userPermissions)];
                    case 3:
                        conditionResult = _e.sent();
                        if (!conditionResult.allowed) {
                            return [3 /*break*/, 5];
                        }
                        _e.label = 4;
                    case 4: return [2 /*return*/, {
                            allowed: true,
                            reason: "Granted by role: ".concat(role),
                            role: role,
                            conditions: permission.conditions,
                            timestamp: Date.now()
                        }];
                    case 5:
                        _b++;
                        return [3 /*break*/, 2];
                    case 6:
                        _i++;
                        return [3 /*break*/, 1];
                    case 7:
                        // Check custom permissions
                        for (_c = 0, _d = userPermissions.customPermissions; _c < _d.length; _c++) {
                            permission = _d[_c];
                            if (this.matchesPermission(check, permission)) {
                                return [2 /*return*/, {
                                        allowed: true,
                                        reason: 'Granted by custom permission',
                                        conditions: permission.conditions,
                                        timestamp: Date.now()
                                    }];
                            }
                        }
                        return [2 /*return*/, {
                                allowed: false,
                                reason: 'No matching permission found',
                                timestamp: Date.now()
                            }];
                }
            });
        });
    };
    PermissionValidationSystem.prototype.matchesPermission = function (check, permission) {
        return (permission.resource === check.resource &&
            permission.actions.includes(check.action));
    };
    PermissionValidationSystem.prototype.evaluateConditions = function (check, conditions, userPermissions) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, conditions_1, condition;
            return __generator(this, function (_a) {
                // Implement condition evaluation logic
                for (_i = 0, conditions_1 = conditions; _i < conditions_1.length; _i++) {
                    condition = conditions_1[_i];
                    switch (condition) {
                        case 'own_data_only':
                            if (check.resourceId !== check.userId) {
                                return [2 /*return*/, { allowed: false, reason: 'Can only access own data' }];
                            }
                            break;
                        case 'assigned_patients_only':
                            // In production, check if patient is assigned to this doctor
                            break;
                        case 'department_only':
                            // Check if resource belongs to user's department
                            break;
                        case 'clinic_only':
                            // Check if resource belongs to user's clinic
                            break;
                        default:
                            console.warn('Unknown condition:', condition);
                    }
                }
                return [2 /*return*/, { allowed: true, reason: 'All conditions met' }];
            });
        });
    };
    PermissionValidationSystem.prototype.generateCacheKey = function (check) {
        return "".concat(check.userId, ":").concat(check.resource, ":").concat(check.action, ":").concat(check.resourceId || 'none');
    };
    PermissionValidationSystem.prototype.clearUserPermissionCache = function (userId) {
        var _this = this;
        var keysToDelete = [];
        this.permissionCache.forEach(function (_, key) {
            if (key.startsWith("".concat(userId, ":"))) {
                keysToDelete.push(key);
            }
        });
        keysToDelete.forEach(function (key) { return _this.permissionCache.delete(key); });
    };
    PermissionValidationSystem.prototype.logPermissionCheck = function (check, result) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!result.allowed) return [3 /*break*/, 2];
                        return [4 /*yield*/, security_audit_logger_1.securityAuditLogger.logPermissionDenied(check.userId, check.resource, check.action)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    return PermissionValidationSystem;
}());
// Export singleton instance
var createpermissionValidator = function () { return new PermissionValidationSystem(); };
exports.createpermissionValidator = createpermissionValidator;
// Export convenience functions
function hasPermission(userId, resource, action, resourceId) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, permissionValidator.checkPermission({
                        userId: userId,
                        resource: resource,
                        action: action,
                        resourceId: resourceId
                    })];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result.allowed];
            }
        });
    });
}
function requirePermission(userId, resource, action, resourceId) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, permissionValidator.checkPermission({
                        userId: userId,
                        resource: resource,
                        action: action,
                        resourceId: resourceId
                    })];
                case 1:
                    result = _a.sent();
                    if (!result.allowed) {
                        throw new Error("Permission denied: ".concat(result.reason));
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function checkMultiplePermissions(userId, checks) {
    return __awaiter(this, void 0, void 0, function () {
        var permissionChecks, results;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    permissionChecks = checks.map(function (check) { return (__assign({ userId: userId }, check)); });
                    return [4 /*yield*/, permissionValidator.checkMultiplePermissions(permissionChecks)];
                case 1:
                    results = _a.sent();
                    return [2 /*return*/, results.map(function (result) { return result.allowed; })];
            }
        });
    });
}
function getUserRoles(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var permissions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, permissionValidator.getUserPermissions(userId)];
                case 1:
                    permissions = _a.sent();
                    return [2 /*return*/, permissions.roles];
            }
        });
    });
}
function updateUserRoles(userId, roles) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, permissionValidator.updateUserRoles(userId, roles)];
        });
    });
}
