"use strict";
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
var globals_1 = require("@jest/globals");
var permissions_1 = require("@/lib/auth/rbac/permissions");
// Mock Supabase client
globals_1.jest.mock('@/lib/supabase/client', function () { return ({
    createClient: globals_1.jest.fn(function () { return ({
        from: globals_1.jest.fn(function () { return ({
            select: globals_1.jest.fn(function () { return ({
                eq: globals_1.jest.fn(function () { return ({
                    single: globals_1.jest.fn(),
                    order: globals_1.jest.fn(function () { return ({ data: [], error: null }); })
                }); }),
                order: globals_1.jest.fn(function () { return ({ data: [], error: null }); })
            }); }),
            insert: globals_1.jest.fn(function () { return ({
                select: globals_1.jest.fn(function () { return ({ data: [], error: null }); })
            }); }),
            update: globals_1.jest.fn(function () { return ({
                eq: globals_1.jest.fn(function () { return ({ data: [], error: null }); })
            }); }),
            delete: globals_1.jest.fn(function () { return ({
                eq: globals_1.jest.fn(function () { return ({ data: [], error: null }); })
            }); })
        }); })
    }); })
}); });
(0, globals_1.describe)('RBACPermissionManager', function () {
    var rbacManager;
    var mockSupabase;
    var mockUserId = 'user-123';
    var mockClinicId = 'clinic-456';
    var mockRoleId = 'role-789';
    var mockOwnerRole = {
        id: 'role-owner',
        name: 'owner',
        display_name: 'Owner',
        permissions: ['*'],
        hierarchy: 1,
        is_system_role: true,
        clinic_id: mockClinicId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    var mockManagerRole = {
        id: 'role-manager',
        name: 'manager',
        display_name: 'Manager',
        permissions: ['patients.read', 'appointments.manage', 'billing.manage'],
        hierarchy: 2,
        is_system_role: true,
        clinic_id: mockClinicId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    var mockStaffRole = {
        id: 'role-staff',
        name: 'staff',
        display_name: 'Staff',
        permissions: ['patients.read', 'appointments.manage'],
        hierarchy: 3,
        is_system_role: true,
        clinic_id: mockClinicId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    (0, globals_1.beforeEach)(function () {
        globals_1.jest.clearAllMocks();
        mockSupabase = {
            from: globals_1.jest.fn(function () { return ({
                select: globals_1.jest.fn(function () { return ({
                    eq: globals_1.jest.fn(function () { return ({
                        single: globals_1.jest.fn(),
                        order: globals_1.jest.fn(function () { return ({ data: [], error: null }); })
                    }); }),
                    order: globals_1.jest.fn(function () { return ({ data: [], error: null }); })
                }); }),
                insert: globals_1.jest.fn(function () { return ({
                    select: globals_1.jest.fn(function () { return ({ data: [], error: null }); })
                }); }),
                update: globals_1.jest.fn(function () { return ({
                    eq: globals_1.jest.fn(function () { return ({ data: [], error: null }); })
                }); }),
                delete: globals_1.jest.fn(function () { return ({
                    eq: globals_1.jest.fn(function () { return ({ data: [], error: null }); })
                }); })
            }); })
        };
        rbacManager = new permissions_1.RBACPermissionManager(mockSupabase);
    });
    (0, globals_1.afterEach)(function () {
        globals_1.jest.restoreAllMocks();
    });
    (0, globals_1.describe)('getUserRole', function () {
        (0, globals_1.it)('should retrieve user role assignment correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockRoleAssignment, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockRoleAssignment = {
                            id: 'assignment-123',
                            user_id: mockUserId,
                            role_id: mockRoleId,
                            clinic_id: mockClinicId,
                            is_active: true,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            role: mockOwnerRole
                        };
                        mockSupabase.from.mockReturnValue({
                            select: globals_1.jest.fn().mockReturnValue({
                                eq: globals_1.jest.fn().mockReturnValue({
                                    eq: globals_1.jest.fn().mockReturnValue({
                                        eq: globals_1.jest.fn().mockReturnValue({
                                            single: globals_1.jest.fn().mockResolvedValue({
                                                data: mockRoleAssignment,
                                                error: null
                                            })
                                        })
                                    })
                                })
                            })
                        });
                        return [4 /*yield*/, rbacManager.getUserRole(mockUserId, mockClinicId)];
                    case 1:
                        result = _a.sent();
                        (0, globals_1.expect)(result).toEqual(mockRoleAssignment);
                        (0, globals_1.expect)(mockSupabase.from).toHaveBeenCalledWith('user_roles');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, globals_1.describe)('hasPermission', function () {
        (0, globals_1.it)('should grant permission when user has required permission', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockRoleAssignment, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockRoleAssignment = {
                            id: 'assignment-123',
                            user_id: mockUserId,
                            role_id: mockRoleId,
                            clinic_id: mockClinicId,
                            is_active: true,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            role: mockManagerRole
                        };
                        mockSupabase.from.mockReturnValue({
                            select: globals_1.jest.fn().mockReturnValue({
                                eq: globals_1.jest.fn().mockReturnValue({
                                    eq: globals_1.jest.fn().mockReturnValue({
                                        eq: globals_1.jest.fn().mockReturnValue({
                                            single: globals_1.jest.fn().mockResolvedValue({
                                                data: mockRoleAssignment,
                                                error: null
                                            })
                                        })
                                    })
                                })
                            })
                        });
                        return [4 /*yield*/, rbacManager.hasPermission(mockUserId, 'patients.read', mockClinicId)];
                    case 1:
                        result = _a.sent();
                        (0, globals_1.expect)(result.granted).toBe(true);
                        (0, globals_1.expect)(result.role).toBe('manager');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.it)('should deny permission when user lacks required permission', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockRoleAssignment, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockRoleAssignment = {
                            id: 'assignment-123',
                            user_id: mockUserId,
                            role_id: mockRoleId,
                            clinic_id: mockClinicId,
                            is_active: true,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            role: mockStaffRole
                        };
                        mockSupabase.from.mockReturnValue({
                            select: globals_1.jest.fn().mockReturnValue({
                                eq: globals_1.jest.fn().mockReturnValue({
                                    eq: globals_1.jest.fn().mockReturnValue({
                                        eq: globals_1.jest.fn().mockReturnValue({
                                            single: globals_1.jest.fn().mockResolvedValue({
                                                data: mockRoleAssignment,
                                                error: null
                                            })
                                        })
                                    })
                                })
                            })
                        });
                        return [4 /*yield*/, rbacManager.hasPermission(mockUserId, 'billing.manage', mockClinicId)];
                    case 1:
                        result = _a.sent();
                        (0, globals_1.expect)(result.granted).toBe(false);
                        (0, globals_1.expect)(result.role).toBe('staff');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, globals_1.describe)('canManageUser', function () {
        (0, globals_1.it)('should allow higher hierarchy user to manage lower hierarchy user', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockManagerAssignment, mockStaffAssignment, canManage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockManagerAssignment = {
                            id: 'assignment-manager',
                            user_id: mockUserId,
                            role_id: mockManagerRole.id,
                            clinic_id: mockClinicId,
                            is_active: true,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            role: mockManagerRole
                        };
                        mockStaffAssignment = {
                            id: 'assignment-staff',
                            user_id: 'target-user',
                            role_id: mockStaffRole.id,
                            clinic_id: mockClinicId,
                            is_active: true,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            role: mockStaffRole
                        };
                        // Mock current user (manager) and target user (staff)
                        mockSupabase.from
                            .mockReturnValueOnce({
                            select: globals_1.jest.fn().mockReturnValue({
                                eq: globals_1.jest.fn().mockReturnValue({
                                    eq: globals_1.jest.fn().mockReturnValue({
                                        eq: globals_1.jest.fn().mockReturnValue({
                                            single: globals_1.jest.fn().mockResolvedValue({
                                                data: mockManagerAssignment,
                                                error: null
                                            })
                                        })
                                    })
                                })
                            })
                        })
                            .mockReturnValueOnce({
                            select: globals_1.jest.fn().mockReturnValue({
                                eq: globals_1.jest.fn().mockReturnValue({
                                    eq: globals_1.jest.fn().mockReturnValue({
                                        eq: globals_1.jest.fn().mockReturnValue({
                                            single: globals_1.jest.fn().mockResolvedValue({
                                                data: mockStaffAssignment,
                                                error: null
                                            })
                                        })
                                    })
                                })
                            })
                        });
                        return [4 /*yield*/, rbacManager.canManageUser(mockUserId, 'target-user', mockClinicId)];
                    case 1:
                        canManage = _a.sent();
                        (0, globals_1.expect)(canManage).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.it)('should not allow lower hierarchy user to manage higher hierarchy user', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockStaffAssignment, mockManagerAssignment, canManage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockStaffAssignment = {
                            id: 'assignment-staff',
                            user_id: mockUserId,
                            role_id: mockStaffRole.id,
                            clinic_id: mockClinicId,
                            is_active: true,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            role: mockStaffRole
                        };
                        mockManagerAssignment = {
                            id: 'assignment-manager',
                            user_id: 'target-user',
                            role_id: mockManagerRole.id,
                            clinic_id: mockClinicId,
                            is_active: true,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            role: mockManagerRole
                        };
                        mockSupabase.from
                            .mockReturnValueOnce({
                            select: globals_1.jest.fn().mockReturnValue({
                                eq: globals_1.jest.fn().mockReturnValue({
                                    eq: globals_1.jest.fn().mockReturnValue({
                                        eq: globals_1.jest.fn().mockReturnValue({
                                            single: globals_1.jest.fn().mockResolvedValue({
                                                data: mockStaffAssignment,
                                                error: null
                                            })
                                        })
                                    })
                                })
                            })
                        })
                            .mockReturnValueOnce({
                            select: globals_1.jest.fn().mockReturnValue({
                                eq: globals_1.jest.fn().mockReturnValue({
                                    eq: globals_1.jest.fn().mockReturnValue({
                                        eq: globals_1.jest.fn().mockReturnValue({
                                            single: globals_1.jest.fn().mockResolvedValue({
                                                data: mockManagerAssignment,
                                                error: null
                                            })
                                        })
                                    })
                                })
                            })
                        });
                        return [4 /*yield*/, rbacManager.canManageUser(mockUserId, 'target-user', mockClinicId)];
                    case 1:
                        canManage = _a.sent();
                        (0, globals_1.expect)(canManage).toBe(false);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, globals_1.describe)('Role Management', function () {
        (0, globals_1.it)('should create role assignment successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var newAssignment, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        newAssignment = {
                            user_id: mockUserId,
                            role_id: mockRoleId,
                            clinic_id: mockClinicId,
                            is_active: true
                        };
                        mockSupabase.from.mockReturnValue({
                            insert: globals_1.jest.fn().mockReturnValue({
                                select: globals_1.jest.fn().mockResolvedValue({
                                    data: [__assign(__assign({}, newAssignment), { id: 'new-assignment-123' })],
                                    error: null
                                })
                            })
                        });
                        return [4 /*yield*/, rbacManager.assignRole(mockUserId, mockRoleId, mockClinicId, mockUserId)];
                    case 1:
                        result = _a.sent();
                        (0, globals_1.expect)(result).toBeTruthy();
                        (0, globals_1.expect)(mockSupabase.from).toHaveBeenCalledWith('user_roles');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.it)('should remove role assignment successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSupabase.from.mockReturnValue({
                            update: globals_1.jest.fn().mockReturnValue({
                                eq: globals_1.jest.fn().mockReturnValue({
                                    eq: globals_1.jest.fn().mockReturnValue({
                                        eq: globals_1.jest.fn().mockResolvedValue({
                                            data: [],
                                            error: null
                                        })
                                    })
                                })
                            })
                        });
                        return [4 /*yield*/, rbacManager.removeRole(mockUserId, mockClinicId, mockUserId)];
                    case 1:
                        result = _a.sent();
                        (0, globals_1.expect)(result).toBe(true);
                        (0, globals_1.expect)(mockSupabase.from).toHaveBeenCalledWith('user_roles');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, globals_1.describe)('Permission Checks with Resource Access', function () {
        (0, globals_1.it)('should handle resource-specific permission checks', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockRoleAssignment, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockRoleAssignment = {
                            id: 'assignment-123',
                            user_id: mockUserId,
                            role_id: mockRoleId,
                            clinic_id: mockClinicId,
                            is_active: true,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            role: mockManagerRole
                        };
                        mockSupabase.from.mockReturnValue({
                            select: globals_1.jest.fn().mockReturnValue({
                                eq: globals_1.jest.fn().mockReturnValue({
                                    eq: globals_1.jest.fn().mockReturnValue({
                                        eq: globals_1.jest.fn().mockReturnValue({
                                            single: globals_1.jest.fn().mockResolvedValue({
                                                data: mockRoleAssignment,
                                                error: null
                                            })
                                        })
                                    })
                                })
                            })
                        });
                        return [4 /*yield*/, rbacManager.hasPermission(mockUserId, 'patients.read', mockClinicId, 'patient-123')];
                    case 1:
                        result = _a.sent();
                        (0, globals_1.expect)(result.granted).toBe(true);
                        (0, globals_1.expect)(result.resourceId).toBe('patient-123');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, globals_1.describe)('Error Handling', function () {
        (0, globals_1.it)('should handle database errors gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSupabase.from.mockReturnValue({
                            select: globals_1.jest.fn().mockReturnValue({
                                eq: globals_1.jest.fn().mockReturnValue({
                                    eq: globals_1.jest.fn().mockReturnValue({
                                        eq: globals_1.jest.fn().mockReturnValue({
                                            single: globals_1.jest.fn().mockResolvedValue({
                                                data: null,
                                                error: { message: 'Database connection error' }
                                            })
                                        })
                                    })
                                })
                            })
                        });
                        return [4 /*yield*/, rbacManager.hasPermission(mockUserId, 'patients.read', mockClinicId)];
                    case 1:
                        result = _a.sent();
                        (0, globals_1.expect)(result.granted).toBe(false);
                        (0, globals_1.expect)(result.error).toBeDefined();
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.it)('should handle missing role assignments', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSupabase.from.mockReturnValue({
                            select: globals_1.jest.fn().mockReturnValue({
                                eq: globals_1.jest.fn().mockReturnValue({
                                    eq: globals_1.jest.fn().mockReturnValue({
                                        eq: globals_1.jest.fn().mockReturnValue({
                                            single: globals_1.jest.fn().mockResolvedValue({
                                                data: null,
                                                error: null
                                            })
                                        })
                                    })
                                })
                            })
                        });
                        return [4 /*yield*/, rbacManager.hasPermission(mockUserId, 'patients.read', mockClinicId)];
                    case 1:
                        result = _a.sent();
                        (0, globals_1.expect)(result.granted).toBe(false);
                        (0, globals_1.expect)(result.role).toBeUndefined();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, globals_1.describe)('Performance and Caching', function () {
        (0, globals_1.it)('should implement permission caching for repeated checks', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockRoleAssignment;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockRoleAssignment = {
                            id: 'assignment-123',
                            user_id: mockUserId,
                            role_id: mockRoleId,
                            clinic_id: mockClinicId,
                            is_active: true,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            role: mockManagerRole
                        };
                        mockSupabase.from.mockReturnValue({
                            select: globals_1.jest.fn().mockReturnValue({
                                eq: globals_1.jest.fn().mockReturnValue({
                                    eq: globals_1.jest.fn().mockReturnValue({
                                        eq: globals_1.jest.fn().mockReturnValue({
                                            single: globals_1.jest.fn().mockResolvedValue({
                                                data: mockRoleAssignment,
                                                error: null
                                            })
                                        })
                                    })
                                })
                            })
                        });
                        // First call
                        return [4 /*yield*/, rbacManager.hasPermission(mockUserId, 'patients.read', mockClinicId)];
                    case 1:
                        // First call
                        _a.sent();
                        // Second call should use cache
                        return [4 /*yield*/, rbacManager.hasPermission(mockUserId, 'patients.read', mockClinicId)];
                    case 2:
                        // Second call should use cache
                        _a.sent();
                        // Should only call database once due to caching
                        (0, globals_1.expect)(mockSupabase.from).toHaveBeenCalledTimes(1);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
