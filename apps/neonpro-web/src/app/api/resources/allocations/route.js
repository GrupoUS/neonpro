"use strict";
// =====================================================
// Resource Allocations API
// Story 2.4: Smart Resource Management - Allocations
// =====================================================
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
exports.POST = POST;
exports.PUT = PUT;
exports.DELETE = DELETE;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var resource_manager_1 = require("@/lib/resources/resource-manager");
// =====================================================
// GET /api/resources/allocations - List allocations
// =====================================================
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var searchParams, resourceId, startDate, endDate, supabase, _a, user, authError, resourceManager, allocations, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, , 5]);
                    searchParams = new URL(request.url).searchParams;
                    resourceId = searchParams.get('resource_id');
                    startDate = searchParams.get('start_date');
                    endDate = searchParams.get('end_date');
                    // Validate required parameters
                    if (!resourceId) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'resource_id is required' }, { status: 400 })];
                    }
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _b.sent();
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 2:
                    _a = _b.sent(), user = _a.data.user, authError = _a.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Authentication required' }, { status: 401 })];
                    }
                    resourceManager = new resource_manager_1.ResourceManager();
                    return [4 /*yield*/, resourceManager.getAllocations(resourceId, startDate || undefined, endDate || undefined)];
                case 3:
                    allocations = _b.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: allocations,
                            count: allocations.length
                        })];
                case 4:
                    error_1 = _b.sent();
                    console.error('Error fetching allocations:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({
                            error: 'Failed to fetch allocations',
                            details: error_1 instanceof Error ? error_1.message : 'Unknown error'
                        }, { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// =====================================================
// POST /api/resources/allocations - Create allocation
// =====================================================
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var body, resource_id, start_time, end_time, allocation_type, supabase, _a, user, authError, resourceManager, newAllocation, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, request.json()];
                case 1:
                    body = _b.sent();
                    resource_id = body.resource_id, start_time = body.start_time, end_time = body.end_time, allocation_type = body.allocation_type;
                    if (!resource_id || !start_time || !end_time || !allocation_type) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'resource_id, start_time, end_time, and allocation_type are required' }, { status: 400 })];
                    }
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 2:
                    supabase = _b.sent();
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 3:
                    _a = _b.sent(), user = _a.data.user, authError = _a.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Authentication required' }, { status: 401 })];
                    }
                    resourceManager = new resource_manager_1.ResourceManager();
                    return [4 /*yield*/, resourceManager.createAllocation(body, user.id)];
                case 4:
                    newAllocation = _b.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: newAllocation,
                            message: 'Allocation created successfully'
                        }, { status: 201 })];
                case 5:
                    error_2 = _b.sent();
                    console.error('Error creating allocation:', error_2);
                    // Handle specific conflict errors
                    if (error_2 instanceof Error && error_2.message.includes('conflict')) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                error: 'Resource conflict detected',
                                details: error_2.message,
                                code: 'RESOURCE_CONFLICT'
                            }, { status: 409 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({
                            error: 'Failed to create allocation',
                            details: error_2 instanceof Error ? error_2.message : 'Unknown error'
                        }, { status: 500 })];
                case 6: return [2 /*return*/];
            }
        });
    });
}
// =====================================================
// PUT /api/resources/allocations - Update allocation
// =====================================================
function PUT(request) {
    return __awaiter(this, void 0, void 0, function () {
        var body, id, status_1, supabase, _a, user, authError, resourceManager, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, request.json()];
                case 1:
                    body = _b.sent();
                    id = body.id, status_1 = body.status;
                    // Validate required fields
                    if (!id || !status_1) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Allocation id and status are required' }, { status: 400 })];
                    }
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 2:
                    supabase = _b.sent();
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 3:
                    _a = _b.sent(), user = _a.data.user, authError = _a.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Authentication required' }, { status: 401 })];
                    }
                    resourceManager = new resource_manager_1.ResourceManager();
                    return [4 /*yield*/, resourceManager.updateAllocationStatus(id, status_1)];
                case 4:
                    _b.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            message: 'Allocation status updated successfully'
                        })];
                case 5:
                    error_3 = _b.sent();
                    console.error('Error updating allocation:', error_3);
                    return [2 /*return*/, server_1.NextResponse.json({
                            error: 'Failed to update allocation',
                            details: error_3 instanceof Error ? error_3.message : 'Unknown error'
                        }, { status: 500 })];
                case 6: return [2 /*return*/];
            }
        });
    });
}
// =====================================================
// DELETE /api/resources/allocations - Cancel allocation
// =====================================================
function DELETE(request) {
    return __awaiter(this, void 0, void 0, function () {
        var searchParams, allocationId, supabase, _a, user, authError, resourceManager, error_4;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, , 5]);
                    searchParams = new URL(request.url).searchParams;
                    allocationId = searchParams.get('id');
                    // Validate required parameters
                    if (!allocationId) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Allocation id is required' }, { status: 400 })];
                    }
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _b.sent();
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 2:
                    _a = _b.sent(), user = _a.data.user, authError = _a.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Authentication required' }, { status: 401 })];
                    }
                    resourceManager = new resource_manager_1.ResourceManager();
                    return [4 /*yield*/, resourceManager.cancelAllocation(allocationId)];
                case 3:
                    _b.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            message: 'Allocation cancelled successfully'
                        })];
                case 4:
                    error_4 = _b.sent();
                    console.error('Error cancelling allocation:', error_4);
                    return [2 /*return*/, server_1.NextResponse.json({
                            error: 'Failed to cancel allocation',
                            details: error_4 instanceof Error ? error_4.message : 'Unknown error'
                        }, { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
