"use strict";
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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthcareRBAC = exports.userRoleSchema = exports.roleSchema = exports.permissionSchema = exports.AccessContext = exports.Permission = exports.Role = void 0;
var zod_1 = require("zod");
/**
 * Role-Based Access Control (RBAC) for Healthcare
 * Implements fine-grained permissions for medical data access
 * - Role hierarchy with inheritance
 * - Time-based permissions
 * - Patient-specific access controls
 * - Audit trail for all access decisions
 */
// Healthcare roles with hierarchy
var Role;
(function (Role) {
    // Administrative roles
    Role["SUPER_ADMIN"] = "super_admin";
    Role["CLINIC_ADMIN"] = "clinic_admin";
    Role["IT_ADMIN"] = "it_admin";
    // Medical staff
    Role["CHIEF_DOCTOR"] = "chief_doctor";
    Role["DOCTOR"] = "doctor";
    Role["SPECIALIST"] = "specialist";
    Role["RESIDENT"] = "resident";
    // Nursing staff
    Role["HEAD_NURSE"] = "head_nurse";
    Role["NURSE"] = "nurse";
    Role["NURSING_ASSISTANT"] = "nursing_assistant";
    // Support staff
    Role["RECEPTIONIST"] = "receptionist";
    Role["BILLING_CLERK"] = "billing_clerk";
    Role["LAB_TECHNICIAN"] = "lab_technician";
    // External
    Role["PATIENT"] = "patient";
    Role["GUARDIAN"] = "guardian";
    Role["INSURANCE_REVIEWER"] = "insurance_reviewer";
    // System
    Role["SYSTEM"] = "system";
    Role["API_CLIENT"] = "api_client";
})(Role || (exports.Role = Role = {}));
// Granular permissions
var Permission;
(function (Permission) {
    // Patient data permissions
    Permission["READ_PATIENT_BASIC"] = "read_patient_basic";
    Permission["READ_PATIENT_FULL"] = "read_patient_full";
    Permission["WRITE_PATIENT_BASIC"] = "write_patient_basic";
    Permission["WRITE_PATIENT_FULL"] = "write_patient_full";
    Permission["DELETE_PATIENT"] = "delete_patient";
    // Medical records
    Permission["READ_MEDICAL_RECORDS"] = "read_medical_records";
    Permission["WRITE_MEDICAL_RECORDS"] = "write_medical_records";
    Permission["DELETE_MEDICAL_RECORDS"] = "delete_medical_records";
    Permission["SIGN_MEDICAL_RECORDS"] = "sign_medical_records";
    // Appointments
    Permission["READ_APPOINTMENTS"] = "read_appointments";
    Permission["CREATE_APPOINTMENTS"] = "create_appointments";
    Permission["MODIFY_APPOINTMENTS"] = "modify_appointments";
    Permission["CANCEL_APPOINTMENTS"] = "cancel_appointments";
    // Financial
    Permission["READ_BILLING"] = "read_billing";
    Permission["WRITE_BILLING"] = "write_billing";
    Permission["PROCESS_PAYMENTS"] = "process_payments";
    Permission["REFUND_PAYMENTS"] = "refund_payments";
    // Prescriptions
    Permission["READ_PRESCRIPTIONS"] = "read_prescriptions";
    Permission["WRITE_PRESCRIPTIONS"] = "write_prescriptions";
    Permission["APPROVE_PRESCRIPTIONS"] = "approve_prescriptions";
    // Lab results
    Permission["READ_LAB_RESULTS"] = "read_lab_results";
    Permission["WRITE_LAB_RESULTS"] = "write_lab_results";
    Permission["APPROVE_LAB_RESULTS"] = "approve_lab_results";
    // Administrative
    Permission["MANAGE_USERS"] = "manage_users";
    Permission["MANAGE_ROLES"] = "manage_roles";
    Permission["VIEW_AUDIT_LOGS"] = "view_audit_logs";
    Permission["SYSTEM_SETTINGS"] = "system_settings";
    // Reports
    Permission["GENERATE_REPORTS"] = "generate_reports";
    Permission["EXPORT_DATA"] = "export_data";
    // Emergency
    Permission["EMERGENCY_ACCESS"] = "emergency_access";
    Permission["BREAK_GLASS"] = "break_glass";
})(Permission || (exports.Permission = Permission = {}));
// Access context for fine-grained control
var AccessContext;
(function (AccessContext) {
    AccessContext["NORMAL"] = "normal";
    AccessContext["EMERGENCY"] = "emergency";
    AccessContext["AUDIT"] = "audit";
    AccessContext["EXPORT"] = "export";
    AccessContext["RESEARCH"] = "research";
})(AccessContext || (exports.AccessContext = AccessContext = {}));
// Permission schema
exports.permissionSchema = zod_1.z.object({
    permission: zod_1.z.nativeEnum(Permission),
    granted: zod_1.z.boolean(),
    conditions: zod_1.z.array(zod_1.z.object({
        type: zod_1.z.enum(['time', 'location', 'patient', 'department', 'resource']),
        condition: zod_1.z.string(),
        value: zod_1.z.any()
    })).default([]),
    expiresAt: zod_1.z.date().optional(),
    grantedBy: zod_1.z.string().uuid().optional(),
    grantedAt: zod_1.z.date().default(function () { return new Date(); })
});
// Role definition schema
exports.roleSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    name: zod_1.z.nativeEnum(Role),
    displayName: zod_1.z.string(),
    description: zod_1.z.string(),
    // Role hierarchy
    parentRoles: zod_1.z.array(zod_1.z.nativeEnum(Role)).default([]),
    inheritPermissions: zod_1.z.boolean().default(true),
    // Default permissions
    permissions: zod_1.z.array(exports.permissionSchema).default([]),
    // Constraints
    maxSessionDuration: zod_1.z.number().optional(), // minutes
    requiresMFA: zod_1.z.boolean().default(false),
    ipRestrictions: zod_1.z.array(zod_1.z.string()).default([]),
    timeRestrictions: zod_1.z.object({
        allowedDays: zod_1.z.array(zod_1.z.number()).default([0, 1, 2, 3, 4, 5, 6]), // 0 = Sunday
        startTime: zod_1.z.string().optional(), // HH:MM
        endTime: zod_1.z.string().optional() // HH:MM
    }).optional(),
    // Metadata
    isActive: zod_1.z.boolean().default(true),
    createdAt: zod_1.z.date().default(function () { return new Date(); }),
    updatedAt: zod_1.z.date().default(function () { return new Date(); })
});
// User role assignment schema
exports.userRoleSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid(),
    roleId: zod_1.z.string().uuid(),
    role: zod_1.z.nativeEnum(Role),
    // Assignment details
    assignedBy: zod_1.z.string().uuid(),
    assignedAt: zod_1.z.date().default(function () { return new Date(); }),
    expiresAt: zod_1.z.date().optional(),
    // Additional permissions (beyond role)
    additionalPermissions: zod_1.z.array(exports.permissionSchema).default([]),
    // Restrictions (overrides role permissions)
    restrictions: zod_1.z.object({
        allowedPatients: zod_1.z.array(zod_1.z.string().uuid()).optional(),
        allowedDepartments: zod_1.z.array(zod_1.z.string()).optional(),
        maxRecordsPerDay: zod_1.z.number().optional(),
        requiresApproval: zod_1.z.boolean().default(false)
    }).optional(),
    isActive: zod_1.z.boolean().default(true)
});
var HealthcareRBAC = /** @class */ (function () {
    function HealthcareRBAC() {
    }
    /**
     * Check if user has permission for specific action
     */
    HealthcareRBAC.hasPermission = function (userId_1, permission_1) {
        return __awaiter(this, arguments, void 0, function (userId, permission, context, resourceId) {
            var userRoles, _i, userRoles_1, userRole, hasPermission, error_1;
            if (context === void 0) { context = AccessContext.NORMAL; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 8, , 9]);
                        return [4 /*yield*/, this.getUserRoles(userId)];
                    case 1:
                        userRoles = _a.sent();
                        if (userRoles.length === 0) {
                            return [2 /*return*/, { granted: false, reason: 'No roles assigned' }];
                        }
                        _i = 0, userRoles_1 = userRoles;
                        _a.label = 2;
                    case 2:
                        if (!(_i < userRoles_1.length)) return [3 /*break*/, 6];
                        userRole = userRoles_1[_i];
                        return [4 /*yield*/, this.checkRolePermission(userRole, permission, context, resourceId)];
                    case 3:
                        hasPermission = _a.sent();
                        if (!hasPermission.granted) return [3 /*break*/, 5];
                        // Log access decision for audit
                        return [4 /*yield*/, this.logAccessDecision(userId, permission, context, true, hasPermission.reason)];
                    case 4:
                        // Log access decision for audit
                        _a.sent();
                        return [2 /*return*/, {
                                granted: true,
                                conditions: hasPermission.conditions,
                                auditRequired: this.requiresAudit(permission)
                            }];
                    case 5:
                        _i++;
                        return [3 /*break*/, 2];
                    case 6: 
                    // Permission denied
                    return [4 /*yield*/, this.logAccessDecision(userId, permission, context, false, 'Permission denied')];
                    case 7:
                        // Permission denied
                        _a.sent();
                        return [2 /*return*/, { granted: false, reason: 'Insufficient permissions' }];
                    case 8:
                        error_1 = _a.sent();
                        console.error('Permission check failed:', error_1);
                        return [2 /*return*/, { granted: false, reason: 'Permission check failed' }];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Emergency access override (break glass)
     */
    HealthcareRBAC.emergencyAccess = function (userId, permission, patientId, justification, approver) {
        return __awaiter(this, void 0, void 0, function () {
            var canBreakGlass, emergencyToken, expiresAt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.hasPermission(userId, Permission.BREAK_GLASS, AccessContext.EMERGENCY)];
                    case 1:
                        canBreakGlass = _a.sent();
                        if (!canBreakGlass.granted) {
                            return [2 /*return*/, { granted: false }];
                        }
                        emergencyToken = crypto.randomUUID();
                        expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000) // 4 hours
                        ;
                        // Store emergency access record
                        return [4 /*yield*/, this.storeEmergencyAccess({
                                token: emergencyToken,
                                userId: userId,
                                permission: permission,
                                patientId: patientId,
                                justification: justification,
                                approver: approver,
                                expiresAt: expiresAt,
                                createdAt: new Date()
                            })
                            // Log emergency access
                        ];
                    case 2:
                        // Store emergency access record
                        _a.sent();
                        // Log emergency access
                        return [4 /*yield*/, this.logAccessDecision(userId, permission, AccessContext.EMERGENCY, true, "Emergency access: ".concat(justification))
                            // Alert security team
                        ];
                    case 3:
                        // Log emergency access
                        _a.sent();
                        // Alert security team
                        return [4 /*yield*/, this.alertEmergencyAccess(userId, permission, patientId, justification)];
                    case 4:
                        // Alert security team
                        _a.sent();
                        return [2 /*return*/, {
                                granted: true,
                                emergencyToken: emergencyToken,
                                expiresAt: expiresAt
                            }];
                }
            });
        });
    };
    /**
     * Assign role to user
     */
    HealthcareRBAC.assignRole = function (userId, role, assignedBy, expiresAt, restrictions) {
        return __awaiter(this, void 0, void 0, function () {
            var userRole, canAssign;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userRole = {
                            userId: userId,
                            roleId: crypto.randomUUID(),
                            role: role,
                            assignedBy: assignedBy,
                            expiresAt: expiresAt,
                            restrictions: restrictions,
                            assignedAt: new Date(),
                            additionalPermissions: [],
                            isActive: true
                        };
                        return [4 /*yield*/, this.canAssignRole(assignedBy, role)];
                    case 1:
                        canAssign = _a.sent();
                        if (!canAssign) {
                            throw new Error('Insufficient permissions to assign role');
                        }
                        // Store user role
                        return [4 /*yield*/, this.storeUserRole(userRole)
                            // Log role assignment
                        ];
                    case 2:
                        // Store user role
                        _a.sent();
                        // Log role assignment
                        return [4 /*yield*/, this.logRoleChange(userId, 'assigned', role, assignedBy)];
                    case 3:
                        // Log role assignment
                        _a.sent();
                        return [2 /*return*/, userRole];
                }
            });
        });
    };
    /**
     * Revoke role from user
     */
    HealthcareRBAC.revokeRole = function (userId, role, revokedBy, reason) {
        return __awaiter(this, void 0, void 0, function () {
            var canRevoke;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.canRevokeRole(revokedBy, role)];
                    case 1:
                        canRevoke = _a.sent();
                        if (!canRevoke) {
                            throw new Error('Insufficient permissions to revoke role');
                        }
                        // Deactivate user role
                        return [4 /*yield*/, this.deactivateUserRole(userId, role)
                            // Log role revocation
                        ];
                    case 2:
                        // Deactivate user role
                        _a.sent();
                        // Log role revocation
                        return [4 /*yield*/, this.logRoleChange(userId, 'revoked', role, revokedBy, reason)];
                    case 3:
                        // Log role revocation
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get effective permissions for user
     */
    HealthcareRBAC.getUserPermissions = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var userRoles, permissions, restrictions, expiringRoles, _i, userRoles_2, userRole, rolePermissions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getUserRoles(userId)];
                    case 1:
                        userRoles = _a.sent();
                        permissions = new Set();
                        restrictions = [];
                        expiringRoles = [];
                        _i = 0, userRoles_2 = userRoles;
                        _a.label = 2;
                    case 2:
                        if (!(_i < userRoles_2.length)) return [3 /*break*/, 5];
                        userRole = userRoles_2[_i];
                        return [4 /*yield*/, this.getRolePermissions(userRole.role)];
                    case 3:
                        rolePermissions = _a.sent();
                        rolePermissions.forEach(function (p) { return permissions.add(p); });
                        // Add additional permissions
                        userRole.additionalPermissions.forEach(function (perm) {
                            if (perm.granted)
                                permissions.add(perm.permission);
                        });
                        // Collect restrictions
                        if (userRole.restrictions) {
                            restrictions.push(userRole.restrictions);
                        }
                        // Check for expiring roles
                        if (userRole.expiresAt && userRole.expiresAt <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) {
                            expiringRoles.push({ role: userRole.role, expiresAt: userRole.expiresAt });
                        }
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, {
                            roles: userRoles.map(function (ur) { return ur.role; }),
                            permissions: Array.from(permissions),
                            restrictions: restrictions,
                            expiringRoles: expiringRoles
                        }];
                }
            });
        });
    };
    /**
     * Generate access control report for compliance
     */
    HealthcareRBAC.generateAccessReport = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // TODO: Generate comprehensive access control report
                return [2 /*return*/, {
                        totalAccessAttempts: 0,
                        grantedAccess: 0,
                        deniedAccess: 0,
                        emergencyAccess: 0,
                        accessByRole: {},
                        accessByPermission: {},
                        securityAlerts: 0,
                        complianceIssues: []
                    }];
            });
        });
    };
    // Private helper methods
    HealthcareRBAC.getUserRoles = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // TODO: Query database for user roles
                return [2 /*return*/, []];
            });
        });
    };
    HealthcareRBAC.checkRolePermission = function (userRole, permission, context, resourceId) {
        return __awaiter(this, void 0, void 0, function () {
            var roleDefinition, rolePermissions, now, timeValid, restrictionValid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getRoleDefinition(userRole.role)];
                    case 1:
                        roleDefinition = _a.sent();
                        if (!roleDefinition) {
                            return [2 /*return*/, { granted: false, reason: 'Role not found' }];
                        }
                        return [4 /*yield*/, this.getRolePermissions(userRole.role)];
                    case 2:
                        rolePermissions = _a.sent();
                        if (!rolePermissions.includes(permission)) {
                            return [2 /*return*/, { granted: false, reason: 'Permission not in role' }];
                        }
                        // Check time restrictions
                        if (roleDefinition.timeRestrictions) {
                            now = new Date();
                            timeValid = this.checkTimeRestrictions(now, roleDefinition.timeRestrictions);
                            if (!timeValid) {
                                return [2 /*return*/, { granted: false, reason: 'Outside allowed time' }];
                            }
                        }
                        // Check user-specific restrictions
                        if (userRole.restrictions) {
                            restrictionValid = this.checkUserRestrictions(userRole.restrictions, resourceId);
                            if (!restrictionValid) {
                                return [2 /*return*/, { granted: false, reason: 'User restriction violated' }];
                            }
                        }
                        return [2 /*return*/, { granted: true, reason: 'Permission granted' }];
                }
            });
        });
    };
    HealthcareRBAC.getRoleDefinition = function (role) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // TODO: Get role definition from database
                return [2 /*return*/, null];
            });
        });
    };
    HealthcareRBAC.getRolePermissions = function (role) {
        return __awaiter(this, void 0, void 0, function () {
            var permissions, directPermissions, parentRoles, _i, parentRoles_1, parentRole, parentPermissions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        permissions = new Set();
                        directPermissions = this.ROLE_PERMISSIONS[role] || [];
                        directPermissions.forEach(function (p) { return permissions.add(p); });
                        parentRoles = this.getParentRoles(role);
                        _i = 0, parentRoles_1 = parentRoles;
                        _a.label = 1;
                    case 1:
                        if (!(_i < parentRoles_1.length)) return [3 /*break*/, 4];
                        parentRole = parentRoles_1[_i];
                        return [4 /*yield*/, this.getRolePermissions(parentRole)];
                    case 2:
                        parentPermissions = _a.sent();
                        parentPermissions.forEach(function (p) { return permissions.add(p); });
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, Array.from(permissions)];
                }
            });
        });
    };
    HealthcareRBAC.getParentRoles = function (role) {
        // Find parent roles in hierarchy
        for (var _i = 0, _a = Object.entries(this.ROLE_HIERARCHY); _i < _a.length; _i++) {
            var _b = _a[_i], parentRole = _b[0], childRoles = _b[1];
            if (childRoles.includes(role)) {
                return __spreadArray([parentRole], this.getParentRoles(parentRole), true);
            }
        }
        return [];
    };
    HealthcareRBAC.checkTimeRestrictions = function (now, restrictions) {
        // Check day of week
        var dayOfWeek = now.getDay();
        if (!restrictions.allowedDays.includes(dayOfWeek)) {
            return false;
        }
        // Check time of day
        if (restrictions.startTime && restrictions.endTime) {
            var currentTime = now.getHours() * 60 + now.getMinutes();
            var _a = restrictions.startTime.split(':').map(Number), startHour = _a[0], startMin = _a[1];
            var _b = restrictions.endTime.split(':').map(Number), endHour = _b[0], endMin = _b[1];
            var startTime = startHour * 60 + startMin;
            var endTime = endHour * 60 + endMin;
            if (currentTime < startTime || currentTime > endTime) {
                return false;
            }
        }
        return true;
    };
    HealthcareRBAC.checkUserRestrictions = function (restrictions, resourceId) {
        // Check patient restrictions
        if (restrictions.allowedPatients && resourceId) {
            return restrictions.allowedPatients.includes(resourceId);
        }
        // Add more restriction checks as needed
        return true;
    };
    HealthcareRBAC.requiresAudit = function (permission) {
        var auditRequiredPermissions = [
            Permission.READ_MEDICAL_RECORDS,
            Permission.WRITE_MEDICAL_RECORDS,
            Permission.DELETE_PATIENT,
            Permission.EMERGENCY_ACCESS,
            Permission.EXPORT_DATA
        ];
        return auditRequiredPermissions.includes(permission);
    };
    HealthcareRBAC.canAssignRole = function (assignerId, role) {
        return __awaiter(this, void 0, void 0, function () {
            var canManageUsers;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.hasPermission(assignerId, Permission.MANAGE_USERS)];
                    case 1:
                        canManageUsers = _a.sent();
                        return [2 /*return*/, canManageUsers.granted];
                }
            });
        });
    };
    HealthcareRBAC.canRevokeRole = function (revokerId, role) {
        return __awaiter(this, void 0, void 0, function () {
            var canManageUsers;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.hasPermission(revokerId, Permission.MANAGE_USERS)];
                    case 1:
                        canManageUsers = _a.sent();
                        return [2 /*return*/, canManageUsers.granted];
                }
            });
        });
    };
    // Storage and logging methods (to be implemented)
    HealthcareRBAC.storeUserRole = function (userRole) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log('User role stored:', userRole);
                return [2 /*return*/];
            });
        });
    };
    HealthcareRBAC.deactivateUserRole = function (userId, role) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log('User role deactivated:', { userId: userId, role: role });
                return [2 /*return*/];
            });
        });
    };
    HealthcareRBAC.storeEmergencyAccess = function (access) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log('Emergency access stored:', access);
                return [2 /*return*/];
            });
        });
    };
    HealthcareRBAC.logAccessDecision = function (userId, permission, context, granted, reason) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log('Access decision logged:', { userId: userId, permission: permission, context: context, granted: granted, reason: reason });
                return [2 /*return*/];
            });
        });
    };
    HealthcareRBAC.logRoleChange = function (userId, action, role, changedBy, reason) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log('Role change logged:', { userId: userId, action: action, role: role, changedBy: changedBy, reason: reason });
                return [2 /*return*/];
            });
        });
    };
    HealthcareRBAC.alertEmergencyAccess = function (userId, permission, patientId, justification) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log('Emergency access alert:', { userId: userId, permission: permission, patientId: patientId, justification: justification });
                return [2 /*return*/];
            });
        });
    };
    // Role hierarchy definition (parent -> children)
    HealthcareRBAC.ROLE_HIERARCHY = (_a = {},
        _a[Role.SUPER_ADMIN] = [Role.CLINIC_ADMIN, Role.IT_ADMIN],
        _a[Role.CLINIC_ADMIN] = [Role.CHIEF_DOCTOR, Role.HEAD_NURSE, Role.BILLING_CLERK],
        _a[Role.CHIEF_DOCTOR] = [Role.DOCTOR, Role.SPECIALIST],
        _a[Role.DOCTOR] = [Role.RESIDENT],
        _a[Role.HEAD_NURSE] = [Role.NURSE],
        _a[Role.NURSE] = [Role.NURSING_ASSISTANT],
        _a[Role.SPECIALIST] = [],
        _a[Role.RESIDENT] = [],
        _a[Role.NURSING_ASSISTANT] = [],
        _a[Role.RECEPTIONIST] = [],
        _a[Role.BILLING_CLERK] = [],
        _a[Role.LAB_TECHNICIAN] = [],
        _a[Role.PATIENT] = [],
        _a[Role.GUARDIAN] = [],
        _a[Role.INSURANCE_REVIEWER] = [],
        _a[Role.SYSTEM] = [],
        _a[Role.API_CLIENT] = [],
        _a[Role.IT_ADMIN] = [],
        _a);
    // Default permissions for each role
    HealthcareRBAC.ROLE_PERMISSIONS = (_b = {},
        _b[Role.SUPER_ADMIN] = [
            Permission.MANAGE_USERS,
            Permission.MANAGE_ROLES,
            Permission.VIEW_AUDIT_LOGS,
            Permission.SYSTEM_SETTINGS,
            Permission.EMERGENCY_ACCESS
        ],
        _b[Role.CLINIC_ADMIN] = [
            Permission.READ_PATIENT_FULL,
            Permission.WRITE_PATIENT_BASIC,
            Permission.READ_APPOINTMENTS,
            Permission.MODIFY_APPOINTMENTS,
            Permission.READ_BILLING,
            Permission.WRITE_BILLING,
            Permission.GENERATE_REPORTS,
            Permission.MANAGE_USERS
        ],
        _b[Role.DOCTOR] = [
            Permission.READ_PATIENT_FULL,
            Permission.WRITE_PATIENT_FULL,
            Permission.READ_MEDICAL_RECORDS,
            Permission.WRITE_MEDICAL_RECORDS,
            Permission.SIGN_MEDICAL_RECORDS,
            Permission.READ_PRESCRIPTIONS,
            Permission.WRITE_PRESCRIPTIONS,
            Permission.READ_LAB_RESULTS,
            Permission.READ_APPOINTMENTS,
            Permission.MODIFY_APPOINTMENTS,
            Permission.EMERGENCY_ACCESS
        ],
        _b[Role.NURSE] = [
            Permission.READ_PATIENT_BASIC,
            Permission.WRITE_PATIENT_BASIC,
            Permission.READ_MEDICAL_RECORDS,
            Permission.READ_APPOINTMENTS,
            Permission.CREATE_APPOINTMENTS,
            Permission.READ_PRESCRIPTIONS
        ],
        _b[Role.RECEPTIONIST] = [
            Permission.READ_PATIENT_BASIC,
            Permission.WRITE_PATIENT_BASIC,
            Permission.READ_APPOINTMENTS,
            Permission.CREATE_APPOINTMENTS,
            Permission.MODIFY_APPOINTMENTS,
            Permission.READ_BILLING
        ],
        _b[Role.PATIENT] = [
            Permission.READ_PATIENT_BASIC, // Own data only
            Permission.READ_MEDICAL_RECORDS, // Own records only
            Permission.READ_APPOINTMENTS, // Own appointments only
            Permission.CREATE_APPOINTMENTS
        ],
        _b);
    return HealthcareRBAC;
}());
exports.HealthcareRBAC = HealthcareRBAC;
