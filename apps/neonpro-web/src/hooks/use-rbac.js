"use strict";
// RBAC React Hook for Frontend Permission Management
// Story 1.2: Role-Based Permissions Enhancement
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRBAC = useRBAC;
exports.usePermission = usePermission;
exports.useRoleGuard = useRoleGuard;
exports.usePermissionGuard = usePermissionGuard;
var react_1 = require("react");
var auth_helpers_react_1 = require("@supabase/auth-helpers-react");
var client_1 = require("@/lib/supabase/client");
var permissions_1 = require("@/lib/auth/rbac/permissions");
/**
 * Main RBAC Hook
 */
function useRBAC(options) {
    var _this = this;
    if (options === void 0) { options = {}; }
    var clinicId = options.clinicId, _a = options.cacheTimeout, cacheTimeout = _a === void 0 ? 5 * 60 * 1000 : _a, _b = options.autoRefresh, autoRefresh = _b === void 0 ? true : _b;
    var user = (0, auth_helpers_react_1.useUser)();
    var supabase = yield (0, client_1.createClient)();
    var _c = (0, react_1.useState)({
        userRole: null,
        permissions: [],
        roleDefinition: null,
        isLoading: true,
        error: null
    }), state = _c[0], setState = _c[1];
    var _d = (0, react_1.useState)({}), permissionCache = _d[0], setPermissionCache = _d[1];
    /**
     * Load user role and permissions
     */
    var loadUserRole = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, roleAssignment, roleError, _b, roleDef, roleDefError, permissions, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!(user === null || user === void 0 ? void 0 : user.id) || !clinicId) {
                        setState(function (prev) { return (__assign(__assign({}, prev), { isLoading: false, error: 'Missing user or clinic context' })); });
                        return [2 /*return*/];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 5, , 6]);
                    setState(function (prev) { return (__assign(__assign({}, prev), { isLoading: true, error: null })); });
                    return [4 /*yield*/, supabase
                            .from('user_role_assignments')
                            .select('*')
                            .eq('user_id', user.id)
                            .eq('clinic_id', clinicId)
                            .eq('is_active', true)
                            .single()];
                case 2:
                    _a = _c.sent(), roleAssignment = _a.data, roleError = _a.error;
                    if (roleError) {
                        throw new Error("Failed to load user role: ".concat(roleError.message));
                    }
                    if (!roleAssignment) {
                        setState(function (prev) { return (__assign(__assign({}, prev), { isLoading: false, error: 'No role assigned for this clinic' })); });
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, supabase
                            .from('role_definitions')
                            .select('*')
                            .eq('id', roleAssignment.role_id)
                            .single()];
                case 3:
                    _b = _c.sent(), roleDef = _b.data, roleDefError = _b.error;
                    if (roleDefError) {
                        throw new Error("Failed to load role definition: ".concat(roleDefError.message));
                    }
                    return [4 /*yield*/, permissions_1.rbacManager.getUserPermissions(user.id, clinicId)];
                case 4:
                    permissions = _c.sent();
                    setState({
                        userRole: roleDef.name,
                        permissions: permissions,
                        roleDefinition: roleDef,
                        isLoading: false,
                        error: null
                    });
                    // Clear permission cache when role changes
                    setPermissionCache({});
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _c.sent();
                    console.error('Error loading user role:', error_1);
                    setState(function (prev) { return (__assign(__assign({}, prev), { isLoading: false, error: error_1 instanceof Error ? error_1.message : 'Failed to load user role' })); });
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); }, [user === null || user === void 0 ? void 0 : user.id, clinicId, supabase]);
    /**
     * Check if user has specific permission
     */
    var hasPermission = (0, react_1.useCallback)(function (permission) { return __awaiter(_this, void 0, void 0, function () {
        var cacheKey, cached, result_1, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(user === null || user === void 0 ? void 0 : user.id) || !clinicId) {
                        return [2 /*return*/, false];
                    }
                    cacheKey = "".concat(user.id, "-").concat(clinicId, "-").concat(permission);
                    cached = permissionCache[cacheKey];
                    if (cached && Date.now() - cached.timestamp < cached.ttl) {
                        return [2 /*return*/, cached.result.granted];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, permissions_1.rbacManager.checkPermission({
                            userId: user.id,
                            permission: permission,
                            clinicId: clinicId
                        })];
                case 2:
                    result_1 = _a.sent();
                    // Update cache
                    setPermissionCache(function (prev) {
                        var _a;
                        return (__assign(__assign({}, prev), (_a = {}, _a[cacheKey] = {
                            result: result_1,
                            timestamp: Date.now(),
                            ttl: cacheTimeout
                        }, _a)));
                    });
                    return [2 /*return*/, result_1.granted];
                case 3:
                    error_2 = _a.sent();
                    console.error('Permission check error:', error_2);
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [user === null || user === void 0 ? void 0 : user.id, clinicId, permissionCache, cacheTimeout]);
    /**
     * Check multiple permissions at once
     */
    var hasPermissions = (0, react_1.useCallback)(function (permissions) { return __awaiter(_this, void 0, void 0, function () {
        var results, _i, permissions_2, permission, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    results = {};
                    _i = 0, permissions_2 = permissions;
                    _c.label = 1;
                case 1:
                    if (!(_i < permissions_2.length)) return [3 /*break*/, 4];
                    permission = permissions_2[_i];
                    _a = results;
                    _b = permission;
                    return [4 /*yield*/, hasPermission(permission)];
                case 2:
                    _a[_b] = _c.sent();
                    _c.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, results];
            }
        });
    }); }, [hasPermission]);
    /**
     * Check if user can manage another user
     */
    var canManageUser = (0, react_1.useCallback)(function (targetUserId) { return __awaiter(_this, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(user === null || user === void 0 ? void 0 : user.id) || !clinicId) {
                        return [2 /*return*/, false];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, permissions_1.rbacManager.canManageUser(user.id, targetUserId, clinicId)];
                case 2: return [2 /*return*/, _a.sent()];
                case 3:
                    error_3 = _a.sent();
                    console.error('Can manage user check error:', error_3);
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [user === null || user === void 0 ? void 0 : user.id, clinicId]);
    /**
     * Get role hierarchy level
     */
    var getHierarchyLevel = (0, react_1.useCallback)(function () {
        var _a;
        return ((_a = state.roleDefinition) === null || _a === void 0 ? void 0 : _a.hierarchy) || null;
    }, [state.roleDefinition]);
    /**
     * Check if user is in specific role
     */
    var isRole = (0, react_1.useCallback)(function (role) {
        return state.userRole === role;
    }, [state.userRole]);
    /**
     * Check if user is at least specific role level
     */
    var isAtLeastRole = (0, react_1.useCallback)(function (role) {
        if (!state.roleDefinition)
            return false;
        var roleHierarchy = {
            owner: 1,
            manager: 2,
            staff: 3,
            patient: 4
        };
        return state.roleDefinition.hierarchy <= roleHierarchy[role];
    }, [state.roleDefinition]);
    /**
     * Refresh permissions
     */
    var refreshPermissions = (0, react_1.useCallback)(function () {
        setPermissionCache({});
        loadUserRole();
    }, [loadUserRole]);
    /**
     * Clear permission cache
     */
    var clearCache = (0, react_1.useCallback)(function () {
        setPermissionCache({});
    }, []);
    // Load role on mount and when dependencies change
    (0, react_1.useEffect)(function () {
        loadUserRole();
    }, [loadUserRole]);
    // Auto refresh on role changes if enabled
    (0, react_1.useEffect)(function () {
        if (!autoRefresh || !(user === null || user === void 0 ? void 0 : user.id) || !clinicId)
            return;
        var channel = supabase
            .channel('role_changes')
            .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'user_role_assignments',
            filter: "user_id=eq.".concat(user.id)
        }, function () {
            console.log('Role assignment changed, refreshing permissions');
            refreshPermissions();
        })
            .subscribe();
        return function () {
            supabase.removeChannel(channel);
        };
    }, [user === null || user === void 0 ? void 0 : user.id, clinicId, autoRefresh, supabase, refreshPermissions]);
    // Memoized computed values
    var computedValues = (0, react_1.useMemo)(function () { return ({
        isOwner: state.userRole === 'owner',
        isManager: state.userRole === 'manager',
        isStaff: state.userRole === 'staff',
        isPatient: state.userRole === 'patient',
        isStaffOrAbove: state.roleDefinition ? state.roleDefinition.hierarchy <= 3 : false,
        isManagerOrAbove: state.roleDefinition ? state.roleDefinition.hierarchy <= 2 : false,
        hasAnyRole: state.userRole !== null
    }); }, [state.userRole, state.roleDefinition]);
    return __assign(__assign(__assign({}, state), computedValues), { 
        // Methods
        hasPermission: hasPermission, hasPermissions: hasPermissions, canManageUser: canManageUser, getHierarchyLevel: getHierarchyLevel, isRole: isRole, isAtLeastRole: isAtLeastRole, refreshPermissions: refreshPermissions, clearCache: clearCache, 
        // Utilities
        isReady: !state.isLoading && !state.error, cacheSize: Object.keys(permissionCache).length });
}
/**
 * Hook for checking specific permission
 */
function usePermission(permission, clinicId) {
    var _a = (0, react_1.useState)(null), hasAccess = _a[0], setHasAccess = _a[1];
    var _b = (0, react_1.useState)(true), isChecking = _b[0], setIsChecking = _b[1];
    var user = (0, auth_helpers_react_1.useUser)();
    (0, react_1.useEffect)(function () {
        function checkPermission() {
            return __awaiter(this, void 0, void 0, function () {
                var result, error_4;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(user === null || user === void 0 ? void 0 : user.id) || !clinicId) {
                                setHasAccess(false);
                                setIsChecking(false);
                                return [2 /*return*/];
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, 4, 5]);
                            setIsChecking(true);
                            return [4 /*yield*/, permissions_1.rbacManager.checkPermission({
                                    userId: user.id,
                                    permission: permission,
                                    clinicId: clinicId
                                })];
                        case 2:
                            result = _a.sent();
                            setHasAccess(result.granted);
                            return [3 /*break*/, 5];
                        case 3:
                            error_4 = _a.sent();
                            console.error('Permission check error:', error_4);
                            setHasAccess(false);
                            return [3 /*break*/, 5];
                        case 4:
                            setIsChecking(false);
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        }
        checkPermission();
    }, [user === null || user === void 0 ? void 0 : user.id, permission, clinicId]);
    return {
        hasAccess: hasAccess,
        isChecking: isChecking,
        isReady: !isChecking
    };
}
/**
 * Hook for role-based conditional rendering
 */
function useRoleGuard(allowedRoles, clinicId) {
    var _a = useRBAC({ clinicId: clinicId }), userRole = _a.userRole, isLoading = _a.isLoading;
    var isAllowed = (0, react_1.useMemo)(function () {
        if (!userRole)
            return false;
        return allowedRoles.includes(userRole);
    }, [userRole, allowedRoles]);
    return {
        isAllowed: isAllowed,
        isLoading: isLoading,
        userRole: userRole
    };
}
/**
 * Hook for permission-based conditional rendering
 */
function usePermissionGuard(requiredPermissions, clinicId) {
    var _a = (0, react_1.useState)({}), permissions = _a[0], setPermissions = _a[1];
    var _b = (0, react_1.useState)(true), isLoading = _b[0], setIsLoading = _b[1];
    var user = (0, auth_helpers_react_1.useUser)();
    (0, react_1.useEffect)(function () {
        function checkPermissions() {
            return __awaiter(this, void 0, void 0, function () {
                var results, _i, requiredPermissions_1, permission, result, error_5;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(user === null || user === void 0 ? void 0 : user.id) || !clinicId) {
                                setIsLoading(false);
                                return [2 /*return*/];
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 6, 7, 8]);
                            results = {};
                            _i = 0, requiredPermissions_1 = requiredPermissions;
                            _a.label = 2;
                        case 2:
                            if (!(_i < requiredPermissions_1.length)) return [3 /*break*/, 5];
                            permission = requiredPermissions_1[_i];
                            return [4 /*yield*/, permissions_1.rbacManager.checkPermission({
                                    userId: user.id,
                                    permission: permission,
                                    clinicId: clinicId
                                })];
                        case 3:
                            result = _a.sent();
                            results[permission] = result.granted;
                            _a.label = 4;
                        case 4:
                            _i++;
                            return [3 /*break*/, 2];
                        case 5:
                            setPermissions(results);
                            return [3 /*break*/, 8];
                        case 6:
                            error_5 = _a.sent();
                            console.error('Permission guard error:', error_5);
                            return [3 /*break*/, 8];
                        case 7:
                            setIsLoading(false);
                            return [7 /*endfinally*/];
                        case 8: return [2 /*return*/];
                    }
                });
            });
        }
        checkPermissions();
    }, [user === null || user === void 0 ? void 0 : user.id, clinicId, requiredPermissions]);
    var hasAllPermissions = (0, react_1.useMemo)(function () {
        return requiredPermissions.every(function (permission) { return permissions[permission]; });
    }, [requiredPermissions, permissions]);
    var hasAnyPermission = (0, react_1.useMemo)(function () {
        return requiredPermissions.some(function (permission) { return permissions[permission]; });
    }, [requiredPermissions, permissions]);
    return {
        permissions: permissions,
        hasAllPermissions: hasAllPermissions,
        hasAnyPermission: hasAnyPermission,
        isLoading: isLoading
    };
}
