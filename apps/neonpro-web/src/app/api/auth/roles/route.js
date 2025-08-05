"use strict";
/**
 * API Route: Role Management Endpoint
 * Story 1.2: Role-Based Access Control Implementation
 *
 * Provides REST API for role management operations
 * Requires owner/manager permissions for role modifications
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
exports.GET = GET;
exports.PUT = PUT;
exports.OPTIONS = OPTIONS;
var server_1 = require("next/server");
var auth_1 = require("@/lib/middleware/auth");
var permissions_1 = require("@/lib/auth/rbac/permissions");
var server_2 = require("@/lib/supabase/server");
var zod_1 = require("zod");
/**
 * Request validation schemas
 */
var UpdateRoleSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid(),
    newRole: zod_1.z.enum(['owner', 'manager', 'staff', 'patient']),
    reason: zod_1.z.string().optional()
});
var GetUserRolesSchema = zod_1.z.object({
    clinicId: zod_1.z.string().uuid().optional(),
    role: zod_1.z.enum(['owner', 'manager', 'staff', 'patient']).optional(),
    limit: zod_1.z.number().min(1).max(100).default(50),
    offset: zod_1.z.number().min(0).default(0)
});
/**
 * GET /api/auth/roles
 *
 * Get users and their roles (with filtering)
 * Requires manager+ permissions
 */
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var authResult, permissionCheck, url, queryParams, validationResult, _a, clinicId, role, limit, offset, supabase, query, _b, users, error, count, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, (0, auth_1.authenticateRequest)(request)];
                case 1:
                    authResult = _c.sent();
                    if (!authResult.success || !authResult.user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Authentication required' }, { status: 401 })];
                    }
                    return [4 /*yield*/, (0, permissions_1.hasPermission)(authResult.user, 'users:read')];
                case 2:
                    permissionCheck = _c.sent();
                    if (!permissionCheck.granted) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                error: 'Insufficient permissions',
                                reason: 'Manager or owner role required to view user roles'
                            }, { status: 403 })];
                    }
                    url = new URL(request.url);
                    queryParams = {
                        clinicId: url.searchParams.get('clinicId') || undefined,
                        role: url.searchParams.get('role') || undefined,
                        limit: parseInt(url.searchParams.get('limit') || '50'),
                        offset: parseInt(url.searchParams.get('offset') || '0')
                    };
                    validationResult = GetUserRolesSchema.safeParse(queryParams);
                    if (!validationResult.success) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                error: 'Invalid query parameters',
                                details: validationResult.error.errors
                            }, { status: 400 })];
                    }
                    _a = validationResult.data, clinicId = _a.clinicId, role = _a.role, limit = _a.limit, offset = _a.offset;
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 3:
                    supabase = _c.sent();
                    query = supabase
                        .from('users')
                        .select("\n        id,\n        email,\n        full_name,\n        role,\n        clinic_id,\n        created_at,\n        updated_at,\n        last_login,\n        is_active\n      ")
                        .range(offset, offset + limit - 1)
                        .order('created_at', { ascending: false });
                    // Apply filters
                    if (clinicId) {
                        query = query.eq('clinic_id', clinicId);
                    }
                    if (role) {
                        query = query.eq('role', role);
                    }
                    // For non-owners, restrict to same clinic
                    if (authResult.user.role !== 'owner' && authResult.user.clinicId) {
                        query = query.eq('clinic_id', authResult.user.clinicId);
                    }
                    return [4 /*yield*/, query];
                case 4:
                    _b = _c.sent(), users = _b.data, error = _b.error, count = _b.count;
                    if (error) {
                        console.error('Database error fetching users:', error);
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({
                            users: users || [],
                            pagination: {
                                limit: limit,
                                offset: offset,
                                total: count || 0
                            },
                            timestamp: new Date().toISOString()
                        })];
                case 5:
                    error_1 = _c.sent();
                    console.error('Role management GET error:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 6: return [2 /*return*/];
            }
        });
    });
}
/**
 * PUT /api/auth/roles
 *
 * Update user role
 * Requires owner permissions or manager permissions (with restrictions)
 */
function PUT(request) {
    return __awaiter(this, void 0, void 0, function () {
        var authResult, requestBody, error_2, validationResult, _a, userId, newRole, reason, currentUser, permissionCheck, supabase, _b, targetUser, fetchError, roleHierarchy, currentUserLevel, targetUserLevel, newRoleLevel, updateError, auditLog, error_3;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 11, , 12]);
                    return [4 /*yield*/, (0, auth_1.authenticateRequest)(request)];
                case 1:
                    authResult = _c.sent();
                    if (!authResult.success || !authResult.user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Authentication required' }, { status: 401 })];
                    }
                    requestBody = void 0;
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, request.json()];
                case 3:
                    requestBody = _c.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_2 = _c.sent();
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })];
                case 5:
                    validationResult = UpdateRoleSchema.safeParse(requestBody);
                    if (!validationResult.success) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                error: 'Invalid request format',
                                details: validationResult.error.errors
                            }, { status: 400 })];
                    }
                    _a = validationResult.data, userId = _a.userId, newRole = _a.newRole, reason = _a.reason;
                    currentUser = authResult.user;
                    return [4 /*yield*/, (0, permissions_1.hasPermission)(currentUser, 'users:update')];
                case 6:
                    permissionCheck = _c.sent();
                    if (!permissionCheck.granted) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                error: 'Insufficient permissions',
                                reason: 'Manager or owner role required to update user roles'
                            }, { status: 403 })];
                    }
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 7:
                    supabase = _c.sent();
                    return [4 /*yield*/, supabase
                            .from('users')
                            .select('id, email, role, clinic_id, full_name')
                            .eq('id', userId)
                            .single()];
                case 8:
                    _b = _c.sent(), targetUser = _b.data, fetchError = _b.error;
                    if (fetchError || !targetUser) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'User not found' }, { status: 404 })];
                    }
                    roleHierarchy = {
                        'patient': 1,
                        'staff': 2,
                        'manager': 3,
                        'owner': 4
                    };
                    currentUserLevel = roleHierarchy[currentUser.role] || 0;
                    targetUserLevel = roleHierarchy[targetUser.role] || 0;
                    newRoleLevel = roleHierarchy[newRole] || 0;
                    // Validation rules:
                    // 1. Can't modify users with equal or higher role (except owners)
                    // 2. Can't assign roles equal or higher than your own (except owners)
                    // 3. Managers can only modify users in their clinic
                    if (currentUser.role !== 'owner') {
                        // Rule 1: Can't modify equal or higher role users
                        if (targetUserLevel >= currentUserLevel) {
                            return [2 /*return*/, server_1.NextResponse.json({
                                    error: 'Insufficient permissions',
                                    reason: 'Cannot modify users with equal or higher role'
                                }, { status: 403 })];
                        }
                        // Rule 2: Can't assign equal or higher roles
                        if (newRoleLevel >= currentUserLevel) {
                            return [2 /*return*/, server_1.NextResponse.json({
                                    error: 'Insufficient permissions',
                                    reason: 'Cannot assign roles equal or higher than your own'
                                }, { status: 403 })];
                        }
                        // Rule 3: Managers can only modify users in their clinic
                        if (currentUser.role === 'manager' && targetUser.clinic_id !== currentUser.clinicId) {
                            return [2 /*return*/, server_1.NextResponse.json({
                                    error: 'Insufficient permissions',
                                    reason: 'Can only modify users within your clinic'
                                }, { status: 403 })];
                        }
                    }
                    // Prevent self-demotion for owners (safety check)
                    if (currentUser.id === userId && currentUser.role === 'owner' && newRole !== 'owner') {
                        return [2 /*return*/, server_1.NextResponse.json({
                                error: 'Invalid operation',
                                reason: 'Owners cannot demote themselves. Transfer ownership first.'
                            }, { status: 400 })];
                    }
                    return [4 /*yield*/, supabase
                            .from('users')
                            .update({
                            role: newRole,
                            updated_at: new Date().toISOString()
                        })
                            .eq('id', userId)];
                case 9:
                    updateError = (_c.sent()).error;
                    if (updateError) {
                        console.error('Database error updating user role:', updateError);
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to update user role' }, { status: 500 })];
                    }
                    auditLog = {
                        user_id: currentUser.id,
                        action: 'role_change',
                        resource_type: 'user',
                        resource_id: userId,
                        permission_checked: 'users:update',
                        granted: true,
                        metadata: {
                            target_user_email: targetUser.email,
                            old_role: targetUser.role,
                            new_role: newRole,
                            reason: reason || 'No reason provided',
                            performed_by: currentUser.email
                        },
                        created_at: new Date().toISOString()
                    };
                    return [4 /*yield*/, supabase
                            .from('permission_audit_log')
                            .insert(auditLog)];
                case 10:
                    _c.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            message: 'User role updated successfully',
                            data: {
                                userId: userId,
                                oldRole: targetUser.role,
                                newRole: newRole,
                                updatedBy: currentUser.email,
                                timestamp: new Date().toISOString()
                            }
                        })];
                case 11:
                    error_3 = _c.sent();
                    console.error('Role management PUT error:', error_3);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 12: return [2 /*return*/];
            }
        });
    });
}
/**
 * OPTIONS handler for CORS preflight requests
 */
function OPTIONS(request) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new server_1.NextResponse(null, {
                    status: 200,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                        'Access-Control-Max-Age': '86400'
                    }
                })];
        });
    });
}
