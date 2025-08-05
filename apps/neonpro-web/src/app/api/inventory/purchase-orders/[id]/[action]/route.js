"use strict";
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
exports.POST = POST;
// Purchase Order Approval API Endpoint
// POST /api/inventory/purchase-orders/[id]/approve - Approve purchase order
// POST /api/inventory/purchase-orders/[id]/reject - Reject purchase order
var server_1 = require("@/app/utils/supabase/server");
var server_2 = require("next/server");
var zod_1 = require("zod");
var approvalActionSchema = zod_1.z.object({
    action: zod_1.z.enum(['approve', 'reject']),
    notes: zod_1.z.string().optional(),
    approved_by: zod_1.z.string().min(1, 'Approver ID is required'),
    approval_level: zod_1.z.number().min(1).max(3).optional().default(1) // Support multi-level approval
});
function POST(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var supabase, user, body, validatedData, _c, existingPO, fetchError, canApprove, newStatus, approvalNotes, requiredApprovalLevel, _d, updatedPO, updateError, logError, error_1;
        var params = _b.params;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 12, , 13]);
                    return [4 /*yield*/, (0, server_1.createClient)()];
                case 1:
                    supabase = _e.sent();
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 2:
                    user = (_e.sent()).data.user;
                    if (!user) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, request.json()];
                case 3:
                    body = _e.sent();
                    validatedData = approvalActionSchema.parse(__assign(__assign({}, body), { action: params.action }));
                    return [4 /*yield*/, supabase
                            .from('purchase_orders')
                            .select('id, status, total_amount, clinic_id, created_by')
                            .eq('id', params.id)
                            .single()];
                case 4:
                    _c = _e.sent(), existingPO = _c.data, fetchError = _c.error;
                    if (fetchError) {
                        if (fetchError.code === 'PGRST116') {
                            return [2 /*return*/, server_2.NextResponse.json({ error: 'Purchase order not found' }, { status: 404 })];
                        }
                        return [2 /*return*/, server_2.NextResponse.json({ error: 'Failed to fetch purchase order' }, { status: 500 })];
                    }
                    // Check if PO is in pending_approval status
                    if (existingPO.status !== 'pending_approval') {
                        return [2 /*return*/, server_2.NextResponse.json({
                                error: "Purchase order must be in pending_approval status. Current status: ".concat(existingPO.status)
                            }, { status: 400 })];
                    }
                    return [4 /*yield*/, checkApprovalPermissions(supabase, user.id, existingPO.total_amount, existingPO.clinic_id, validatedData.approval_level)];
                case 5:
                    canApprove = _e.sent();
                    if (!canApprove.allowed) {
                        return [2 /*return*/, server_2.NextResponse.json({
                                error: canApprove.reason || 'Insufficient permissions to approve this purchase order'
                            }, { status: 403 })];
                    }
                    newStatus = existingPO.status;
                    approvalNotes = validatedData.notes || '';
                    if (validatedData.action === 'approve') {
                        requiredApprovalLevel = getRequiredApprovalLevel(existingPO.total_amount);
                        if (validatedData.approval_level >= requiredApprovalLevel) {
                            newStatus = 'approved';
                            approvalNotes = "Approved by ".concat(user.email, " (Level ").concat(validatedData.approval_level, "). ").concat(approvalNotes);
                        }
                        else {
                            // Still needs higher level approval
                            newStatus = 'pending_approval';
                            approvalNotes = "Level ".concat(validatedData.approval_level, " approval by ").concat(user.email, ". Pending Level ").concat(validatedData.approval_level + 1, " approval. ").concat(approvalNotes);
                        }
                    }
                    else {
                        newStatus = 'draft';
                        approvalNotes = "Rejected by ".concat(user.email, " (Level ").concat(validatedData.approval_level, "). ").concat(approvalNotes);
                    }
                    return [4 /*yield*/, supabase
                            .from('purchase_orders')
                            .update({
                            status: newStatus,
                            notes: approvalNotes,
                            updated_at: new Date().toISOString()
                        })
                            .eq('id', params.id)
                            .select()
                            .single()];
                case 6:
                    _d = _e.sent(), updatedPO = _d.data, updateError = _d.error;
                    if (updateError) {
                        console.error('Error updating purchase order:', updateError);
                        return [2 /*return*/, server_2.NextResponse.json({ error: 'Failed to update purchase order' }, { status: 500 })];
                    }
                    return [4 /*yield*/, supabase
                            .from('purchase_order_approvals')
                            .insert({
                            purchase_order_id: params.id,
                            action: validatedData.action,
                            approved_by: user.id,
                            approval_level: validatedData.approval_level,
                            notes: validatedData.notes,
                            created_at: new Date().toISOString()
                        })];
                case 7:
                    logError = (_e.sent()).error;
                    if (logError) {
                        console.error('Error logging approval action:', logError);
                        // Don't fail the request, just log the error
                    }
                    if (!(newStatus === 'approved')) return [3 /*break*/, 9];
                    return [4 /*yield*/, sendApprovalNotification(supabase, updatedPO, 'approved')];
                case 8:
                    _e.sent();
                    return [3 /*break*/, 11];
                case 9:
                    if (!(validatedData.action === 'reject')) return [3 /*break*/, 11];
                    return [4 /*yield*/, sendApprovalNotification(supabase, updatedPO, 'rejected')];
                case 10:
                    _e.sent();
                    _e.label = 11;
                case 11: return [2 /*return*/, server_2.NextResponse.json({
                        purchase_order: updatedPO,
                        approval_action: {
                            action: validatedData.action,
                            level: validatedData.approval_level,
                            approved_by: user.email,
                            timestamp: new Date().toISOString(),
                            final_approval: newStatus === 'approved'
                        },
                        message: "Purchase order ".concat(validatedData.action, "d successfully")
                    })];
                case 12:
                    error_1 = _e.sent();
                    if (error_1 instanceof zod_1.z.ZodError) {
                        return [2 /*return*/, server_2.NextResponse.json({
                                error: 'Validation error',
                                details: error_1.errors
                            }, { status: 400 })];
                    }
                    console.error('Error in purchase order approval:', error_1);
                    return [2 /*return*/, server_2.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 13: return [2 /*return*/];
            }
        });
    });
}
// Helper function to check approval permissions
function checkApprovalPermissions(supabase, userId, amount, clinicId, approvalLevel) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, userProfile, error, clinicPermission, approvalThresholds, threshold, userRole, error_2;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, supabase
                            .from('profiles')
                            .select("\n        id,\n        role,\n        permissions,\n        clinic_permissions (\n          clinic_id,\n          role,\n          permissions\n        )\n      ")
                            .eq('id', userId)
                            .single()];
                case 1:
                    _a = _c.sent(), userProfile = _a.data, error = _a.error;
                    if (error || !userProfile) {
                        return [2 /*return*/, { allowed: false, reason: 'User profile not found' }];
                    }
                    clinicPermission = (_b = userProfile.clinic_permissions) === null || _b === void 0 ? void 0 : _b.find(function (cp) { return cp.clinic_id === clinicId; });
                    if (!clinicPermission) {
                        return [2 /*return*/, { allowed: false, reason: 'No permissions for this clinic' }];
                    }
                    approvalThresholds = {
                        1: { maxAmount: 1000, requiredRole: ['manager', 'admin'] },
                        2: { maxAmount: 5000, requiredRole: ['admin', 'director'] },
                        3: { maxAmount: Infinity, requiredRole: ['director', 'owner'] }
                    };
                    threshold = approvalThresholds[approvalLevel];
                    if (!threshold) {
                        return [2 /*return*/, { allowed: false, reason: 'Invalid approval level' }];
                    }
                    // Check amount threshold
                    if (amount > threshold.maxAmount) {
                        return [2 /*return*/, {
                                allowed: false,
                                reason: "Amount exceeds limit for approval level ".concat(approvalLevel)
                            }];
                    }
                    userRole = clinicPermission.role || userProfile.role;
                    if (!threshold.requiredRole.includes(userRole)) {
                        return [2 /*return*/, {
                                allowed: false,
                                reason: "Insufficient role permissions. Required: ".concat(threshold.requiredRole.join(' or '))
                            }];
                    }
                    return [2 /*return*/, { allowed: true }];
                case 2:
                    error_2 = _c.sent();
                    console.error('Error checking approval permissions:', error_2);
                    return [2 /*return*/, { allowed: false, reason: 'Error checking permissions' }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Helper function to determine required approval level based on amount
function getRequiredApprovalLevel(amount) {
    if (amount <= 1000)
        return 1;
    if (amount <= 5000)
        return 2;
    return 3;
}
// Helper function to send approval notifications
function sendApprovalNotification(supabase, purchaseOrder, action) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, creator, error, notification, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, supabase
                            .from('profiles')
                            .select('email, name')
                            .eq('id', purchaseOrder.created_by)
                            .single()];
                case 1:
                    _a = _b.sent(), creator = _a.data, error = _a.error;
                    if (error || !creator)
                        return [2 /*return*/];
                    notification = {
                        recipient_id: purchaseOrder.created_by,
                        title: "Purchase Order ".concat(action.charAt(0).toUpperCase() + action.slice(1)),
                        message: "Purchase Order ".concat(purchaseOrder.order_number, " has been ").concat(action),
                        type: action === 'approved' ? 'purchase_order_approved' : 'purchase_order_rejected',
                        reference_id: purchaseOrder.id,
                        data: {
                            order_number: purchaseOrder.order_number,
                            total_amount: purchaseOrder.total_amount,
                            action: action
                        },
                        created_at: new Date().toISOString()
                    };
                    return [4 /*yield*/, supabase.from('notifications').insert(notification)];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _b.sent();
                    console.error('Error sending approval notification:', error_3);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
