"use strict";
/**
 * RBAC Permission Manager Class
 * Story 1.2: Role-Based Access Control Implementation
 *
 * This class provides a manager interface for the RBAC system,
 * wrapping the functional permissions API in a class-based interface.
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RBACPermissionManager = void 0;
var client_1 = require("@/lib/supabase/client");
var RBACPermissionManager = /** @class */ (function () {
    function RBACPermissionManager(supabaseClient) {
        this.permissionCache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this.supabase = supabaseClient || (0, client_1.createClient)();
    }
    /**
     * Get user role assignment with clinic context
     */
    RBACPermissionManager.prototype.getUserRole = function (userId, clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, cached, _a, userRole, error, result, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        cacheKey = "getUserRole:".concat(userId, ":").concat(clinicId);
                        cached = this.permissionCache.get(cacheKey);
                        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
                            return [2 /*return*/, cached.data];
                        }
                        return [4 /*yield*/, this.supabase
                                .from('user_roles')
                                .select("\n          *,\n          role:roles(*)\n        ")
                                .eq('user_id', userId)
                                .eq('clinic_id', clinicId)
                                .eq('is_active', true)
                                .single()];
                    case 1:
                        _a = _b.sent(), userRole = _a.data, error = _a.error;
                        if (error) {
                            console.error('Error fetching user role:', error);
                            // Throw error to propagate it up to hasPermission
                            throw error;
                        }
                        result = userRole || null;
                        this.permissionCache.set(cacheKey, { data: result, timestamp: Date.now() });
                        return [2 /*return*/, result];
                    case 2:
                        error_1 = _b.sent();
                        console.error('Error in getUserRole:', error_1);
                        // Re-throw the error to be handled by calling function
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check if user has specific permission
     */
    RBACPermissionManager.prototype.hasPermission = function (userId, permission, clinicId, resourceId) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, cached, roleAssignment, result_1, role, result_2, hasPermission, result, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        cacheKey = "hasPermission:".concat(userId, ":").concat(permission, ":").concat(clinicId, ":").concat(resourceId || '');
                        cached = this.permissionCache.get(cacheKey);
                        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
                            return [2 /*return*/, cached.data];
                        }
                        return [4 /*yield*/, this.getUserRole(userId, clinicId)];
                    case 1:
                        roleAssignment = _a.sent();
                        if (!roleAssignment || !roleAssignment.role) {
                            result_1 = { granted: false };
                            this.permissionCache.set(cacheKey, { data: result_1, timestamp: Date.now() });
                            return [2 /*return*/, result_1];
                        }
                        role = roleAssignment.role;
                        // Check if role has wildcard permission
                        if (role.permissions.includes('*')) {
                            result_2 = {
                                granted: true,
                                role: role.name,
                                resourceId: resourceId
                            };
                            this.permissionCache.set(cacheKey, { data: result_2, timestamp: Date.now() });
                            return [2 /*return*/, result_2];
                        }
                        hasPermission = role.permissions.includes(permission);
                        result = {
                            granted: hasPermission,
                            role: role.name,
                            resourceId: resourceId
                        };
                        this.permissionCache.set(cacheKey, { data: result, timestamp: Date.now() });
                        return [2 /*return*/, result];
                    case 2:
                        error_2 = _a.sent();
                        console.error('Error in hasPermission:', error_2);
                        return [2 /*return*/, { granted: false, error: error_2.message }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check if user can manage another user (hierarchy validation)
     */
    RBACPermissionManager.prototype.canManageUser = function (managerId, targetUserId, clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            var managerRole, targetRole, managerHierarchy, targetHierarchy, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getUserRole(managerId, clinicId)];
                    case 1:
                        managerRole = _a.sent();
                        return [4 /*yield*/, this.getUserRole(targetUserId, clinicId)];
                    case 2:
                        targetRole = _a.sent();
                        if (!(managerRole === null || managerRole === void 0 ? void 0 : managerRole.role) || !(targetRole === null || targetRole === void 0 ? void 0 : targetRole.role)) {
                            return [2 /*return*/, false];
                        }
                        managerHierarchy = managerRole.role.hierarchy;
                        targetHierarchy = targetRole.role.hierarchy;
                        // Lower hierarchy number = higher privilege (1 = owner, 2 = manager, 3 = staff)
                        return [2 /*return*/, managerHierarchy < targetHierarchy];
                    case 3:
                        error_3 = _a.sent();
                        console.error('Error in canManageUser:', error_3);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Assign role to user
     */
    RBACPermissionManager.prototype.assignRole = function (userId, roleId, clinicId, assignedBy) {
        return __awaiter(this, void 0, void 0, function () {
            var error, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('user_roles')
                                .insert({
                                user_id: userId,
                                role_id: roleId,
                                clinic_id: clinicId,
                                assigned_by: assignedBy,
                                is_active: true,
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString()
                            })];
                    case 1:
                        error = (_a.sent()).error;
                        return [2 /*return*/, !error];
                    case 2:
                        error_4 = _a.sent();
                        console.error('Error in assignRole:', error_4);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Remove role from user
     */
    RBACPermissionManager.prototype.removeRole = function (userId, clinicId, removedBy) {
        return __awaiter(this, void 0, void 0, function () {
            var error, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('user_roles')
                                .update({
                                is_active: false,
                                updated_at: new Date().toISOString(),
                                updated_by: removedBy
                            })
                                .eq('user_id', userId)
                                .eq('clinic_id', clinicId)
                                .eq('is_active', true)];
                    case 1:
                        error = (_a.sent()).error;
                        return [2 /*return*/, !error];
                    case 2:
                        error_5 = _a.sent();
                        console.error('Error in removeRole:', error_5);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Clear permission cache for user
     */
    RBACPermissionManager.prototype.clearUserCache = function (userId) {
        // Implementation depends on caching strategy
        console.log("Clearing cache for user: ".concat(userId));
    };
    /**
     * Clear all permission caches
     */
    RBACPermissionManager.prototype.clearAllCaches = function () {
        // Implementation depends on caching strategy
        console.log('Clearing all permission caches');
    };
    return RBACPermissionManager;
}());
exports.RBACPermissionManager = RBACPermissionManager;
