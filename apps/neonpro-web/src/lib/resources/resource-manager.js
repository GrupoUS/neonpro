"use strict";
// =====================================================
// NeonPro Resource Management Core Service
// Story 2.4: Smart Resource Management
// =====================================================
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
exports.ResourceManager = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var supabaseUrl = process.env.SUPABASE_URL || '';
var supabaseKey = process.env.SUPABASE_ANON_KEY || '';
// =====================================================
// Resource Manager Service
// =====================================================
var ResourceManager = /** @class */ (function () {
    function ResourceManager() {
        this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
    }
    // =====================================================
    // Resource Management
    // =====================================================
    ResourceManager.prototype.createResource = function (resourceData) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('resources')
                                .insert([resourceData])
                                .select()
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                    case 2:
                        error_1 = _b.sent();
                        console.error('Error creating resource:', error_1);
                        throw new Error('Failed to create resource');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ResourceManager.prototype.getResources = function (clinicId, filters) {
        return __awaiter(this, void 0, void 0, function () {
            var query, _a, data, error, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        query = this.supabase
                            .from('resources')
                            .select('*')
                            .eq('clinic_id', clinicId)
                            .order('type', { ascending: true })
                            .order('name', { ascending: true });
                        if (filters === null || filters === void 0 ? void 0 : filters.type) {
                            query = query.eq('type', filters.type);
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.status) {
                            query = query.eq('status', filters.status);
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.category) {
                            query = query.eq('category', filters.category);
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data || []];
                    case 2:
                        error_2 = _b.sent();
                        console.error('Error fetching resources:', error_2);
                        throw new Error('Failed to fetch resources');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ResourceManager.prototype.getResourceById = function (resourceId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('resources')
                                .select('*')
                                .eq('id', resourceId)
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                    case 2:
                        error_3 = _b.sent();
                        console.error('Error fetching resource:', error_3);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ResourceManager.prototype.updateResource = function (resourceId, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('resources')
                                .update(__assign(__assign({}, updates), { updated_at: new Date().toISOString() }))
                                .eq('id', resourceId)
                                .select()
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                    case 2:
                        error_4 = _b.sent();
                        console.error('Error updating resource:', error_4);
                        throw new Error('Failed to update resource');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ResourceManager.prototype.updateResourceStatus = function (resourceId, status) {
        return __awaiter(this, void 0, void 0, function () {
            var error, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('resources')
                                .update({
                                status: status,
                                updated_at: new Date().toISOString()
                            })
                                .eq('id', resourceId)];
                    case 1:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        console.error('Error updating resource status:', error_5);
                        throw new Error('Failed to update resource status');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ResourceManager.prototype.deleteResource = function (resourceId) {
        return __awaiter(this, void 0, void 0, function () {
            var error, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('resources')
                                .delete()
                                .eq('id', resourceId)];
                    case 1:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _a.sent();
                        console.error('Error deleting resource:', error_6);
                        throw new Error('Failed to delete resource');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // =====================================================
    // Resource Allocation Management
    // =====================================================
    ResourceManager.prototype.createAllocation = function (allocationData, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var conflicts, _a, data, error, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.detectConflicts(allocationData.resource_id, allocationData.start_time, allocationData.end_time)];
                    case 1:
                        conflicts = _b.sent();
                        if (conflicts.length > 0) {
                            throw new Error("Resource conflict detected. ".concat(conflicts.length, " overlapping allocations found."));
                        }
                        return [4 /*yield*/, this.supabase
                                .from('resource_allocations')
                                .insert([__assign(__assign({}, allocationData), { allocated_by: userId, status: 'pending', preparation_time: allocationData.preparation_time || 0, cleanup_time: allocationData.cleanup_time || 0 })])
                                .select()
                                .single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                    case 3:
                        error_7 = _b.sent();
                        console.error('Error creating allocation:', error_7);
                        throw error_7;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ResourceManager.prototype.getAllocations = function (resourceId, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var query, _a, data, error, error_8;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        query = this.supabase
                            .from('resource_allocations')
                            .select('*')
                            .eq('resource_id', resourceId)
                            .order('start_time', { ascending: true });
                        if (startDate) {
                            query = query.gte('start_time', startDate);
                        }
                        if (endDate) {
                            query = query.lte('end_time', endDate);
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data || []];
                    case 2:
                        error_8 = _b.sent();
                        console.error('Error fetching allocations:', error_8);
                        throw new Error('Failed to fetch allocations');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ResourceManager.prototype.updateAllocationStatus = function (allocationId, status) {
        return __awaiter(this, void 0, void 0, function () {
            var error, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('resource_allocations')
                                .update({
                                status: status,
                                updated_at: new Date().toISOString()
                            })
                                .eq('id', allocationId)];
                    case 1:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        return [3 /*break*/, 3];
                    case 2:
                        error_9 = _a.sent();
                        console.error('Error updating allocation status:', error_9);
                        throw new Error('Failed to update allocation status');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ResourceManager.prototype.cancelAllocation = function (allocationId) {
        return __awaiter(this, void 0, void 0, function () {
            var error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.updateAllocationStatus(allocationId, 'cancelled')];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_10 = _a.sent();
                        console.error('Error cancelling allocation:', error_10);
                        throw new Error('Failed to cancel allocation');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // =====================================================
    // Conflict Detection and Resolution
    // =====================================================
    ResourceManager.prototype.detectConflicts = function (resourceId, startTime, endTime, excludeAllocationId) {
        return __awaiter(this, void 0, void 0, function () {
            var query, _a, data, error, error_11;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        query = this.supabase
                            .from('resource_allocations')
                            .select('*')
                            .eq('resource_id', resourceId)
                            .neq('status', 'cancelled')
                            .neq('status', 'completed')
                            .lt('start_time', endTime)
                            .gt('end_time', startTime);
                        if (excludeAllocationId) {
                            query = query.neq('id', excludeAllocationId);
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data || []];
                    case 2:
                        error_11 = _b.sent();
                        console.error('Error detecting conflicts:', error_11);
                        throw new Error('Failed to detect conflicts');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ResourceManager.prototype.createConflict = function (conflictData, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_12;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('resource_conflicts')
                                .insert([__assign(__assign({}, conflictData), { created_by: userId, status: 'pending', impact_score: conflictData.impact_score || 1, revenue_impact: conflictData.revenue_impact || 0 })])
                                .select()
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                    case 2:
                        error_12 = _b.sent();
                        console.error('Error creating conflict:', error_12);
                        throw new Error('Failed to create conflict record');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ResourceManager.prototype.resolveConflict = function (conflictId, resolution, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var error, error_13;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('resource_conflicts')
                                .update({
                                status: 'resolved',
                                resolution_strategy: resolution.strategy,
                                resolution_details: resolution.details,
                                resolved_at: new Date().toISOString(),
                                resolved_by: userId,
                                updated_at: new Date().toISOString()
                            })
                                .eq('id', conflictId)];
                    case 1:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        return [3 /*break*/, 3];
                    case 2:
                        error_13 = _a.sent();
                        console.error('Error resolving conflict:', error_13);
                        throw new Error('Failed to resolve conflict');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // =====================================================
    // Resource Availability and Optimization
    // =====================================================
    ResourceManager.prototype.getAvailableResources = function (clinicId, startTime, endTime, resourceType, requirements) {
        return __awaiter(this, void 0, void 0, function () {
            var resources, availableResources, _i, resources_1, resource, conflicts, error_14;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.getResources(clinicId, {
                                type: resourceType,
                                status: 'available'
                            })];
                    case 1:
                        resources = _a.sent();
                        availableResources = [];
                        _i = 0, resources_1 = resources;
                        _a.label = 2;
                    case 2:
                        if (!(_i < resources_1.length)) return [3 /*break*/, 5];
                        resource = resources_1[_i];
                        return [4 /*yield*/, this.detectConflicts(resource.id, startTime, endTime)];
                    case 3:
                        conflicts = _a.sent();
                        if (conflicts.length === 0) {
                            // Check if resource meets requirements
                            if (!requirements || this.meetsRequirements(resource, requirements)) {
                                availableResources.push(resource);
                            }
                        }
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, availableResources];
                    case 6:
                        error_14 = _a.sent();
                        console.error('Error finding available resources:', error_14);
                        throw new Error('Failed to find available resources');
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    ResourceManager.prototype.meetsRequirements = function (resource, requirements) {
        // Simple requirement matching - can be extended based on needs
        if (requirements.category && resource.category !== requirements.category) {
            return false;
        }
        if (requirements.capacity && resource.capacity < requirements.capacity) {
            return false;
        }
        if (requirements.skills && resource.type === 'staff') {
            var resourceSkills_1 = resource.skills || [];
            var requiredSkills = requirements.skills;
            if (!requiredSkills.every(function (skill) { return resourceSkills_1.includes(skill); })) {
                return false;
            }
        }
        return true;
    };
    ResourceManager.prototype.suggestAlternativeResources = function (originalResourceId, startTime, endTime, requirements) {
        return __awaiter(this, void 0, void 0, function () {
            var originalResource, alternatives, error_15;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getResourceById(originalResourceId)];
                    case 1:
                        originalResource = _a.sent();
                        if (!originalResource) {
                            throw new Error('Original resource not found');
                        }
                        return [4 /*yield*/, this.getAvailableResources(originalResource.clinic_id, startTime, endTime, originalResource.type, requirements)];
                    case 2:
                        alternatives = _a.sent();
                        // Filter out the original resource
                        return [2 /*return*/, alternatives.filter(function (resource) { return resource.id !== originalResourceId; })];
                    case 3:
                        error_15 = _a.sent();
                        console.error('Error suggesting alternatives:', error_15);
                        throw new Error('Failed to suggest alternative resources');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ResourceManager.prototype.optimizeResourceAllocation = function (clinicId, date) {
        return __awaiter(this, void 0, void 0, function () {
            var resources, recommendations, totalUtilization, _i, resources_2, resource, allocations, totalMinutes, allocatedMinutes, utilization, actions, potentialSavings, maintenanceDate, today, daysUntilMaintenance, error_16;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.getResources(clinicId)];
                    case 1:
                        resources = _a.sent();
                        recommendations = [];
                        totalUtilization = 0;
                        _i = 0, resources_2 = resources;
                        _a.label = 2;
                    case 2:
                        if (!(_i < resources_2.length)) return [3 /*break*/, 5];
                        resource = resources_2[_i];
                        return [4 /*yield*/, this.getAllocations(resource.id, "".concat(date, "T00:00:00Z"), "".concat(date, "T23:59:59Z"))];
                    case 3:
                        allocations = _a.sent();
                        totalMinutes = 8 * 60;
                        allocatedMinutes = allocations.reduce(function (sum, allocation) {
                            var start = new Date(allocation.start_time);
                            var end = new Date(allocation.end_time);
                            return sum + (end.getTime() - start.getTime()) / (1000 * 60);
                        }, 0);
                        utilization = (allocatedMinutes / totalMinutes) * 100;
                        totalUtilization += utilization;
                        actions = [];
                        potentialSavings = 0;
                        if (utilization < 50) {
                            actions.push('Consider reducing operating hours or finding additional bookings');
                            potentialSavings += (resource.cost_per_hour || 0) * 2;
                        }
                        else if (utilization > 90) {
                            actions.push('Consider adding additional resources or extending hours');
                        }
                        if (resource.type === 'equipment' && resource.next_maintenance) {
                            maintenanceDate = new Date(resource.next_maintenance);
                            today = new Date(date);
                            daysUntilMaintenance = Math.ceil((maintenanceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                            if (daysUntilMaintenance <= 7) {
                                actions.push('Schedule maintenance soon to prevent downtime');
                            }
                        }
                        recommendations.push({
                            resource_id: resource.id,
                            current_utilization: Math.round(utilization),
                            recommended_actions: actions,
                            potential_savings: potentialSavings
                        });
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, {
                            recommendations: recommendations,
                            overall_efficiency: Math.round(totalUtilization / resources.length)
                        }];
                    case 6:
                        error_16 = _a.sent();
                        console.error('Error optimizing resource allocation:', error_16);
                        throw new Error('Failed to optimize resource allocation');
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    // =====================================================
    // Analytics and Reporting
    // =====================================================
    ResourceManager.prototype.getResourceUtilization = function (resourceId, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_17;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('resource_analytics')
                                .select('date, utilization_percentage, revenue_generated, appointment_count')
                                .eq('resource_id', resourceId)
                                .gte('date', startDate)
                                .lte('date', endDate)
                                .order('date', { ascending: true })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, (data === null || data === void 0 ? void 0 : data.map(function (item) { return ({
                                date: item.date,
                                utilization_percentage: item.utilization_percentage,
                                total_revenue: item.revenue_generated,
                                appointment_count: item.appointment_count
                            }); })) || []];
                    case 2:
                        error_17 = _b.sent();
                        console.error('Error fetching utilization data:', error_17);
                        throw new Error('Failed to fetch utilization data');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ResourceManager.prototype.getConflictHistory = function (resourceId_1) {
        return __awaiter(this, arguments, void 0, function (resourceId, limit) {
            var _a, data, error, error_18;
            if (limit === void 0) { limit = 50; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('resource_conflicts')
                                .select('*')
                                .eq('resource_id', resourceId)
                                .order('created_at', { ascending: false })
                                .limit(limit)];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data || []];
                    case 2:
                        error_18 = _b.sent();
                        console.error('Error fetching conflict history:', error_18);
                        throw new Error('Failed to fetch conflict history');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return ResourceManager;
}());
exports.ResourceManager = ResourceManager;
