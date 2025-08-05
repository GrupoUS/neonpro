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
exports.ResourceOptimizer = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var types_1 = require("./types");
/**
 * Resource Optimizer for intelligent resource allocation and workload balancing
 */
var ResourceOptimizer = /** @class */ (function () {
    function ResourceOptimizer(supabaseUrl, supabaseKey, config, constraints) {
        this.optimizationCache = new Map();
        this.metricsCache = new Map();
        this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
        this.config = config;
        this.constraints = constraints;
    }
    /**
     * Optimize resource allocation for a given time period
     */
    ResourceOptimizer.prototype.optimizeResources = function (startDate_1, endDate_1) {
        return __awaiter(this, arguments, void 0, function (startDate, endDate, strategy) {
            var cacheKey, currentMetrics, workloadAnalysis, recommendations, expectedImprovements, optimization, error_1;
            if (strategy === void 0) { strategy = types_1.OptimizationStrategy.BALANCED; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cacheKey = "".concat(startDate.toISOString(), "-").concat(endDate.toISOString(), "-").concat(strategy);
                        if (this.optimizationCache.has(cacheKey)) {
                            return [2 /*return*/, this.optimizationCache.get(cacheKey)];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, this.calculateResourceMetrics(startDate, endDate)];
                    case 2:
                        currentMetrics = _a.sent();
                        return [4 /*yield*/, this.analyzeWorkloadDistribution(startDate, endDate)];
                    case 3:
                        workloadAnalysis = _a.sent();
                        return [4 /*yield*/, this.generateOptimizationRecommendations(currentMetrics, workloadAnalysis, strategy)];
                    case 4:
                        recommendations = _a.sent();
                        return [4 /*yield*/, this.calculateExpectedImprovements(currentMetrics, recommendations)];
                    case 5:
                        expectedImprovements = _a.sent();
                        optimization = {
                            id: this.generateOptimizationId(),
                            period: { start: startDate, end: endDate },
                            strategy: strategy,
                            currentMetrics: currentMetrics,
                            recommendations: recommendations,
                            expectedImprovements: expectedImprovements,
                            confidence: this.calculateOptimizationConfidence(recommendations),
                            estimatedImplementationTime: this.calculateImplementationTime(recommendations),
                            createdAt: new Date(),
                            status: 'pending'
                        };
                        this.optimizationCache.set(cacheKey, optimization);
                        return [2 /*return*/, optimization];
                    case 6:
                        error_1 = _a.sent();
                        console.error('Error optimizing resources:', error_1);
                        throw error_1;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Balance workload across staff members
     */
    ResourceOptimizer.prototype.balanceWorkload = function (startDate_1, endDate_1) {
        return __awaiter(this, arguments, void 0, function (startDate, endDate, targetUtilization) {
            var staffWorkloads, imbalances, balancingActions, expectedBalance, error_2;
            if (targetUtilization === void 0) { targetUtilization = 0.8; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.calculateStaffWorkloads(startDate, endDate)];
                    case 1:
                        staffWorkloads = _a.sent();
                        imbalances = this.identifyWorkloadImbalances(staffWorkloads, targetUtilization);
                        return [4 /*yield*/, this.generateBalancingActions(imbalances, startDate, endDate)];
                    case 2:
                        balancingActions = _a.sent();
                        expectedBalance = this.calculateExpectedBalance(staffWorkloads, balancingActions);
                        return [2 /*return*/, {
                                id: this.generateBalancingId(),
                                period: { start: startDate, end: endDate },
                                currentWorkloads: staffWorkloads,
                                targetUtilization: targetUtilization,
                                imbalances: imbalances,
                                balancingActions: balancingActions,
                                expectedBalance: expectedBalance,
                                confidence: this.calculateBalancingConfidence(balancingActions),
                                estimatedTime: this.calculateBalancingTime(balancingActions),
                                createdAt: new Date()
                            }];
                    case 3:
                        error_2 = _a.sent();
                        console.error('Error balancing workload:', error_2);
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Apply optimization recommendations
     */
    ResourceOptimizer.prototype.applyOptimization = function (optimizationId) {
        return __awaiter(this, void 0, void 0, function () {
            var optimization, validation, appliedChanges, actualImpact, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 8]);
                        return [4 /*yield*/, this.getOptimizationById(optimizationId)];
                    case 1:
                        optimization = _a.sent();
                        if (!optimization) {
                            throw new Error("Optimization ".concat(optimizationId, " not found"));
                        }
                        return [4 /*yield*/, this.validateOptimization(optimization)];
                    case 2:
                        validation = _a.sent();
                        if (!validation.isValid) {
                            throw new Error("Optimization is no longer valid: ".concat(validation.errors.join(', ')));
                        }
                        return [4 /*yield*/, this.applyRecommendations(optimization.recommendations)];
                    case 3:
                        appliedChanges = _a.sent();
                        return [4 /*yield*/, this.measureActualImpact(optimization, appliedChanges)];
                    case 4:
                        actualImpact = _a.sent();
                        // Update optimization status
                        return [4 /*yield*/, this.updateOptimizationStatus(optimizationId, 'completed')];
                    case 5:
                        // Update optimization status
                        _a.sent();
                        // Clear related caches
                        this.clearRelatedCaches(optimization);
                        return [2 /*return*/, {
                                optimizationId: optimizationId,
                                appliedChanges: appliedChanges,
                                actualImpact: actualImpact,
                                success: true,
                                appliedAt: new Date()
                            }];
                    case 6:
                        error_3 = _a.sent();
                        console.error('Error applying optimization:', error_3);
                        return [4 /*yield*/, this.updateOptimizationStatus(optimizationId, 'failed')];
                    case 7:
                        _a.sent();
                        throw error_3;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Calculate resource metrics for a time period
     */
    ResourceOptimizer.prototype.calculateResourceMetrics = function (startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, appointments, staffUtilization, roomUtilization, equipmentUtilization, efficiency, patientSatisfaction, metrics;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cacheKey = "metrics-".concat(startDate.toISOString(), "-").concat(endDate.toISOString());
                        if (this.metricsCache.has(cacheKey)) {
                            return [2 /*return*/, this.metricsCache.get(cacheKey)];
                        }
                        return [4 /*yield*/, this.getAppointmentsInPeriod(startDate, endDate)];
                    case 1:
                        appointments = _a.sent();
                        return [4 /*yield*/, this.calculateStaffUtilization(appointments, startDate, endDate)];
                    case 2:
                        staffUtilization = _a.sent();
                        return [4 /*yield*/, this.calculateRoomUtilization(appointments, startDate, endDate)];
                    case 3:
                        roomUtilization = _a.sent();
                        return [4 /*yield*/, this.calculateEquipmentUtilization(appointments, startDate, endDate)];
                    case 4:
                        equipmentUtilization = _a.sent();
                        return [4 /*yield*/, this.calculateEfficiencyMetrics(appointments)];
                    case 5:
                        efficiency = _a.sent();
                        return [4 /*yield*/, this.calculatePatientSatisfactionMetrics(appointments)];
                    case 6:
                        patientSatisfaction = _a.sent();
                        metrics = {
                            period: { start: startDate, end: endDate },
                            staffUtilization: staffUtilization,
                            roomUtilization: roomUtilization,
                            equipmentUtilization: equipmentUtilization,
                            efficiency: efficiency,
                            patientSatisfaction: patientSatisfaction,
                            overallScore: this.calculateOverallScore({
                                staffUtilization: staffUtilization,
                                roomUtilization: roomUtilization,
                                equipmentUtilization: equipmentUtilization,
                                efficiency: efficiency,
                                patientSatisfaction: patientSatisfaction
                            }),
                            calculatedAt: new Date()
                        };
                        this.metricsCache.set(cacheKey, metrics);
                        return [2 /*return*/, metrics];
                }
            });
        });
    };
    /**
     * Analyze workload distribution across staff
     */
    ResourceOptimizer.prototype.analyzeWorkloadDistribution = function (startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var staff, workloadBalances, _i, staff_1, staffMember, appointments, totalHours, availableHours, utilization, efficiency, satisfaction;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAllActiveStaff()];
                    case 1:
                        staff = _a.sent();
                        workloadBalances = [];
                        _i = 0, staff_1 = staff;
                        _a.label = 2;
                    case 2:
                        if (!(_i < staff_1.length)) return [3 /*break*/, 7];
                        staffMember = staff_1[_i];
                        return [4 /*yield*/, this.getStaffAppointments(staffMember.id, startDate, endDate)];
                    case 3:
                        appointments = _a.sent();
                        totalHours = this.calculateTotalWorkHours(appointments);
                        availableHours = this.calculateAvailableHours(staffMember, startDate, endDate);
                        utilization = availableHours > 0 ? totalHours / availableHours : 0;
                        return [4 /*yield*/, this.calculateStaffEfficiency(staffMember.id, appointments)];
                    case 4:
                        efficiency = _a.sent();
                        return [4 /*yield*/, this.getStaffSatisfactionScore(staffMember.id)];
                    case 5:
                        satisfaction = _a.sent();
                        workloadBalances.push({
                            staffId: staffMember.id,
                            staffName: staffMember.name,
                            currentUtilization: utilization,
                            targetUtilization: this.constraints.maxStaffUtilization,
                            efficiency: efficiency,
                            satisfaction: satisfaction,
                            totalHours: totalHours,
                            availableHours: availableHours,
                            appointmentCount: appointments.length,
                            isOverloaded: utilization > this.constraints.maxStaffUtilization,
                            isUnderutilized: utilization < this.constraints.minStaffUtilization
                        });
                        _a.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 2];
                    case 7: return [2 /*return*/, workloadBalances];
                }
            });
        });
    };
    /**
     * Generate optimization recommendations
     */
    ResourceOptimizer.prototype.generateOptimizationRecommendations = function (metrics, workloadAnalysis, strategy) {
        return __awaiter(this, void 0, void 0, function () {
            var recommendations, staffRecommendations, roomRecommendations, equipmentRecommendations, scheduleRecommendations;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        recommendations = [];
                        return [4 /*yield*/, this.generateStaffOptimizations(workloadAnalysis, strategy)];
                    case 1:
                        staffRecommendations = _a.sent();
                        recommendations.push.apply(recommendations, staffRecommendations);
                        return [4 /*yield*/, this.generateRoomOptimizations(metrics.roomUtilization, strategy)];
                    case 2:
                        roomRecommendations = _a.sent();
                        recommendations.push.apply(recommendations, roomRecommendations);
                        return [4 /*yield*/, this.generateEquipmentOptimizations(metrics.equipmentUtilization, strategy)];
                    case 3:
                        equipmentRecommendations = _a.sent();
                        recommendations.push.apply(recommendations, equipmentRecommendations);
                        return [4 /*yield*/, this.generateScheduleOptimizations(metrics, strategy)];
                    case 4:
                        scheduleRecommendations = _a.sent();
                        recommendations.push.apply(recommendations, scheduleRecommendations);
                        return [2 /*return*/, this.prioritizeRecommendations(recommendations, strategy)];
                }
            });
        });
    };
    /**
     * Generate staff optimization recommendations
     */
    ResourceOptimizer.prototype.generateStaffOptimizations = function (workloadAnalysis, strategy) {
        return __awaiter(this, void 0, void 0, function () {
            var recommendations, overloadedStaff, underutilizedStaff, _loop_1, this_1, _i, overloadedStaff_1, overloaded, highDemandPeriods, _a, highDemandPeriods_1, period;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        recommendations = [];
                        overloadedStaff = workloadAnalysis.filter(function (w) { return w.isOverloaded; });
                        underutilizedStaff = workloadAnalysis.filter(function (w) { return w.isUnderutilized; });
                        _loop_1 = function (overloaded) {
                            // Recommend redistributing appointments
                            var redistributionTargets = underutilizedStaff
                                .filter(function (u) { return u.staffId !== overloaded.staffId; })
                                .sort(function (a, b) { return a.currentUtilization - b.currentUtilization; })
                                .slice(0, 3);
                            if (redistributionTargets.length > 0) {
                                recommendations.push({
                                    id: this_1.generateAllocationId(),
                                    type: 'staff_redistribution',
                                    resourceType: 'staff',
                                    sourceId: overloaded.staffId,
                                    targetIds: redistributionTargets.map(function (t) { return t.staffId; }),
                                    action: 'redistribute_appointments',
                                    priority: this_1.calculatePriority(overloaded.currentUtilization, strategy),
                                    expectedImpact: {
                                        utilizationImprovement: 0.2,
                                        efficiencyGain: 0.15,
                                        satisfactionImprovement: 0.1
                                    },
                                    estimatedTime: 30,
                                    confidence: 0.8,
                                    description: "Redistribute ".concat(Math.ceil((overloaded.currentUtilization - overloaded.targetUtilization) * overloaded.availableHours), " hours from ").concat(overloaded.staffName, " to less utilized staff"),
                                    metadata: {
                                        currentUtilization: overloaded.currentUtilization,
                                        targetUtilization: overloaded.targetUtilization,
                                        redistributionTargets: redistributionTargets.map(function (t) { return ({
                                            id: t.staffId,
                                            name: t.staffName,
                                            currentUtilization: t.currentUtilization
                                        }); })
                                    }
                                });
                            }
                        };
                        this_1 = this;
                        for (_i = 0, overloadedStaff_1 = overloadedStaff; _i < overloadedStaff_1.length; _i++) {
                            overloaded = overloadedStaff_1[_i];
                            _loop_1(overloaded);
                        }
                        return [4 /*yield*/, this.identifyHighDemandPeriods()];
                    case 1:
                        highDemandPeriods = _b.sent();
                        for (_a = 0, highDemandPeriods_1 = highDemandPeriods; _a < highDemandPeriods_1.length; _a++) {
                            period = highDemandPeriods_1[_a];
                            recommendations.push({
                                id: this.generateAllocationId(),
                                type: 'staff_augmentation',
                                resourceType: 'staff',
                                sourceId: '',
                                targetIds: [],
                                action: 'add_temporary_staff',
                                priority: this.calculatePriority(period.demandLevel, strategy),
                                expectedImpact: {
                                    utilizationImprovement: 0.3,
                                    efficiencyGain: 0.2,
                                    satisfactionImprovement: 0.25
                                },
                                estimatedTime: 60,
                                confidence: 0.7,
                                description: "Add temporary staff during high-demand period: ".concat(period.description),
                                metadata: {
                                    period: period.timeRange,
                                    demandLevel: period.demandLevel,
                                    suggestedStaffCount: period.suggestedAdditionalStaff
                                }
                            });
                        }
                        return [2 /*return*/, recommendations];
                }
            });
        });
    };
    /**
     * Generate room optimization recommendations
     */
    ResourceOptimizer.prototype.generateRoomOptimizations = function (roomUtilization, strategy) {
        return __awaiter(this, void 0, void 0, function () {
            var recommendations, rooms, _i, rooms_1, room, utilization;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        recommendations = [];
                        return [4 /*yield*/, this.getAllActiveRooms()];
                    case 1:
                        rooms = _a.sent();
                        _i = 0, rooms_1 = rooms;
                        _a.label = 2;
                    case 2:
                        if (!(_i < rooms_1.length)) return [3 /*break*/, 5];
                        room = rooms_1[_i];
                        return [4 /*yield*/, this.getRoomUtilizationRate(room.id)];
                    case 3:
                        utilization = _a.sent();
                        if (utilization < this.constraints.minRoomUtilization) {
                            // Recommend consolidating appointments
                            recommendations.push({
                                id: this.generateAllocationId(),
                                type: 'room_consolidation',
                                resourceType: 'room',
                                sourceId: room.id,
                                targetIds: [],
                                action: 'consolidate_appointments',
                                priority: this.calculatePriority(1 - utilization, strategy),
                                expectedImpact: {
                                    utilizationImprovement: 0.25,
                                    efficiencyGain: 0.15,
                                    satisfactionImprovement: 0.05
                                },
                                estimatedTime: 45,
                                confidence: 0.75,
                                description: "Consolidate appointments in ".concat(room.name, " (").concat(Math.round(utilization * 100), "% utilization) to optimize room usage"),
                                metadata: {
                                    currentUtilization: utilization,
                                    targetUtilization: this.constraints.minRoomUtilization,
                                    roomCapacity: room.capacity
                                }
                            });
                        }
                        else if (utilization > this.constraints.maxRoomUtilization) {
                            // Recommend expanding capacity or redistributing
                            recommendations.push({
                                id: this.generateAllocationId(),
                                type: 'room_expansion',
                                resourceType: 'room',
                                sourceId: room.id,
                                targetIds: [],
                                action: 'redistribute_or_expand',
                                priority: this.calculatePriority(utilization, strategy),
                                expectedImpact: {
                                    utilizationImprovement: 0.2,
                                    efficiencyGain: 0.1,
                                    satisfactionImprovement: 0.15
                                },
                                estimatedTime: 60,
                                confidence: 0.7,
                                description: "Address overcapacity in ".concat(room.name, " (").concat(Math.round(utilization * 100), "% utilization)"),
                                metadata: {
                                    currentUtilization: utilization,
                                    maxUtilization: this.constraints.maxRoomUtilization,
                                    suggestedActions: ['redistribute_appointments', 'extend_hours', 'add_parallel_room']
                                }
                            });
                        }
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, recommendations];
                }
            });
        });
    };
    /**
     * Generate equipment optimization recommendations
     */
    ResourceOptimizer.prototype.generateEquipmentOptimizations = function (equipmentUtilization, strategy) {
        return __awaiter(this, void 0, void 0, function () {
            var recommendations, equipment, _i, equipment_1, item, utilization, maintenanceSchedule;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        recommendations = [];
                        return [4 /*yield*/, this.getAllActiveEquipment()];
                    case 1:
                        equipment = _a.sent();
                        _i = 0, equipment_1 = equipment;
                        _a.label = 2;
                    case 2:
                        if (!(_i < equipment_1.length)) return [3 /*break*/, 6];
                        item = equipment_1[_i];
                        return [4 /*yield*/, this.getEquipmentUtilizationRate(item.id)];
                    case 3:
                        utilization = _a.sent();
                        return [4 /*yield*/, this.getEquipmentMaintenanceSchedule(item.id)];
                    case 4:
                        maintenanceSchedule = _a.sent();
                        // Check for maintenance conflicts
                        if (maintenanceSchedule.hasConflicts) {
                            recommendations.push({
                                id: this.generateAllocationId(),
                                type: 'equipment_maintenance',
                                resourceType: 'equipment',
                                sourceId: item.id,
                                targetIds: [],
                                action: 'reschedule_maintenance',
                                priority: this.calculatePriority(maintenanceSchedule.conflictSeverity, strategy),
                                expectedImpact: {
                                    utilizationImprovement: 0.15,
                                    efficiencyGain: 0.2,
                                    satisfactionImprovement: 0.1
                                },
                                estimatedTime: 30,
                                confidence: 0.85,
                                description: "Reschedule maintenance for ".concat(item.name, " to avoid appointment conflicts"),
                                metadata: {
                                    maintenanceConflicts: maintenanceSchedule.conflicts,
                                    suggestedMaintenanceSlots: maintenanceSchedule.alternativeSlots
                                }
                            });
                        }
                        // Check for underutilization
                        if (utilization < this.constraints.minEquipmentUtilization) {
                            recommendations.push({
                                id: this.generateAllocationId(),
                                type: 'equipment_optimization',
                                resourceType: 'equipment',
                                sourceId: item.id,
                                targetIds: [],
                                action: 'increase_utilization',
                                priority: this.calculatePriority(1 - utilization, strategy),
                                expectedImpact: {
                                    utilizationImprovement: 0.3,
                                    efficiencyGain: 0.15,
                                    satisfactionImprovement: 0.05
                                },
                                estimatedTime: 45,
                                confidence: 0.7,
                                description: "Increase utilization of ".concat(item.name, " (currently ").concat(Math.round(utilization * 100), "%)"),
                                metadata: {
                                    currentUtilization: utilization,
                                    targetUtilization: this.constraints.minEquipmentUtilization,
                                    suggestedActions: ['schedule_more_appointments', 'cross_train_staff', 'marketing_push']
                                }
                            });
                        }
                        _a.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 2];
                    case 6: return [2 /*return*/, recommendations];
                }
            });
        });
    };
    /**
     * Generate schedule optimization recommendations
     */
    ResourceOptimizer.prototype.generateScheduleOptimizations = function (metrics, strategy) {
        return __awaiter(this, void 0, void 0, function () {
            var recommendations, patterns, peakPeriods, lowPeriods, bufferAnalysis;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        recommendations = [];
                        return [4 /*yield*/, this.analyzeAppointmentPatterns()];
                    case 1:
                        patterns = _a.sent();
                        peakPeriods = patterns.filter(function (p) { return p.demandLevel > 0.8; });
                        lowPeriods = patterns.filter(function (p) { return p.demandLevel < 0.3; });
                        // Recommend schedule adjustments
                        if (peakPeriods.length > 0 && lowPeriods.length > 0) {
                            recommendations.push({
                                id: this.generateAllocationId(),
                                type: 'schedule_balancing',
                                resourceType: 'schedule',
                                sourceId: '',
                                targetIds: [],
                                action: 'redistribute_appointments',
                                priority: this.calculatePriority(0.8, strategy),
                                expectedImpact: {
                                    utilizationImprovement: 0.25,
                                    efficiencyGain: 0.2,
                                    satisfactionImprovement: 0.15
                                },
                                estimatedTime: 90,
                                confidence: 0.75,
                                description: 'Redistribute appointments from peak periods to low-demand periods',
                                metadata: {
                                    peakPeriods: peakPeriods.map(function (p) { return p.timeRange; }),
                                    lowPeriods: lowPeriods.map(function (p) { return p.timeRange; }),
                                    redistributionOpportunities: this.calculateRedistributionOpportunities(peakPeriods, lowPeriods)
                                }
                            });
                        }
                        return [4 /*yield*/, this.analyzeBufferTimes()];
                    case 2:
                        bufferAnalysis = _a.sent();
                        if (bufferAnalysis.hasOptimizationOpportunity) {
                            recommendations.push({
                                id: this.generateAllocationId(),
                                type: 'buffer_optimization',
                                resourceType: 'schedule',
                                sourceId: '',
                                targetIds: [],
                                action: 'optimize_buffer_times',
                                priority: this.calculatePriority(bufferAnalysis.optimizationPotential, strategy),
                                expectedImpact: {
                                    utilizationImprovement: 0.15,
                                    efficiencyGain: 0.25,
                                    satisfactionImprovement: 0.1
                                },
                                estimatedTime: 60,
                                confidence: 0.8,
                                description: 'Optimize buffer times between appointments to improve efficiency',
                                metadata: {
                                    currentAverageBuffer: bufferAnalysis.currentAverageBuffer,
                                    recommendedBuffer: bufferAnalysis.recommendedBuffer,
                                    potentialTimeGain: bufferAnalysis.potentialTimeGain
                                }
                            });
                        }
                        return [2 /*return*/, recommendations];
                }
            });
        });
    };
    /**
     * Prioritize recommendations based on strategy
     */
    ResourceOptimizer.prototype.prioritizeRecommendations = function (recommendations, strategy) {
        return recommendations.sort(function (a, b) {
            var scoreA = a.priority;
            var scoreB = b.priority;
            // Adjust scores based on strategy
            switch (strategy) {
                case types_1.OptimizationStrategy.EFFICIENCY_FOCUSED:
                    scoreA += a.expectedImpact.efficiencyGain * 2;
                    scoreB += b.expectedImpact.efficiencyGain * 2;
                    break;
                case types_1.OptimizationStrategy.PATIENT_SATISFACTION:
                    scoreA += a.expectedImpact.satisfactionImprovement * 2;
                    scoreB += b.expectedImpact.satisfactionImprovement * 2;
                    break;
                case types_1.OptimizationStrategy.COST_OPTIMIZATION:
                    scoreA += (1 - a.estimatedTime / 120) * 0.5; // Prefer faster implementations
                    scoreB += (1 - b.estimatedTime / 120) * 0.5;
                    break;
                case types_1.OptimizationStrategy.BALANCED:
                default:
                    // Use base priority
                    break;
            }
            // Factor in confidence
            scoreA *= a.confidence;
            scoreB *= b.confidence;
            return scoreB - scoreA;
        });
    };
    /**
     * Calculate expected improvements from recommendations
     */
    ResourceOptimizer.prototype.calculateExpectedImprovements = function (currentMetrics, recommendations) {
        return __awaiter(this, void 0, void 0, function () {
            var utilizationImprovement, efficiencyGain, satisfactionImprovement, _i, recommendations_1, rec, improvedMetrics;
            return __generator(this, function (_a) {
                utilizationImprovement = 0;
                efficiencyGain = 0;
                satisfactionImprovement = 0;
                for (_i = 0, recommendations_1 = recommendations; _i < recommendations_1.length; _i++) {
                    rec = recommendations_1[_i];
                    utilizationImprovement += rec.expectedImpact.utilizationImprovement * rec.confidence;
                    efficiencyGain += rec.expectedImpact.efficiencyGain * rec.confidence;
                    satisfactionImprovement += rec.expectedImpact.satisfactionImprovement * rec.confidence;
                }
                improvedMetrics = __assign(__assign({}, currentMetrics), { staffUtilization: __assign(__assign({}, currentMetrics.staffUtilization), { average: Math.min(1.0, currentMetrics.staffUtilization.average + utilizationImprovement) }), efficiency: __assign(__assign({}, currentMetrics.efficiency), { overall: Math.min(1.0, currentMetrics.efficiency.overall + efficiencyGain) }), patientSatisfaction: __assign(__assign({}, currentMetrics.patientSatisfaction), { overall: Math.min(1.0, currentMetrics.patientSatisfaction.overall + satisfactionImprovement) }) });
                improvedMetrics.overallScore = this.calculateOverallScore(improvedMetrics);
                return [2 /*return*/, improvedMetrics];
            });
        });
    };
    /**
     * Calculate optimization confidence
     */
    ResourceOptimizer.prototype.calculateOptimizationConfidence = function (recommendations) {
        if (recommendations.length === 0)
            return 0;
        var avgConfidence = recommendations.reduce(function (sum, rec) { return sum + rec.confidence; }, 0) / recommendations.length;
        var complexityPenalty = Math.min(0.2, recommendations.length * 0.02);
        return Math.max(0.1, avgConfidence - complexityPenalty);
    };
    /**
     * Calculate implementation time
     */
    ResourceOptimizer.prototype.calculateImplementationTime = function (recommendations) {
        return recommendations.reduce(function (total, rec) { return total + rec.estimatedTime; }, 0);
    };
    // Utility methods
    ResourceOptimizer.prototype.generateOptimizationId = function () {
        return "opt_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
    };
    ResourceOptimizer.prototype.generateBalancingId = function () {
        return "bal_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
    };
    ResourceOptimizer.prototype.generateAllocationId = function () {
        return "alloc_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
    };
    ResourceOptimizer.prototype.calculatePriority = function (value, strategy) {
        var priority = value;
        switch (strategy) {
            case types_1.OptimizationStrategy.EFFICIENCY_FOCUSED:
                priority *= 1.2;
                break;
            case types_1.OptimizationStrategy.PATIENT_SATISFACTION:
                priority *= 1.1;
                break;
            case types_1.OptimizationStrategy.COST_OPTIMIZATION:
                priority *= 0.9;
                break;
        }
        return Math.min(1.0, priority);
    };
    ResourceOptimizer.prototype.calculateOverallScore = function (metrics) {
        var _a, _b, _c, _d;
        var weights = this.config.weights;
        return ((((_a = metrics.staffUtilization) === null || _a === void 0 ? void 0 : _a.average) || 0) * weights.staffWorkload +
            (((_b = metrics.roomUtilization) === null || _b === void 0 ? void 0 : _b.average) || 0) * weights.resourceUtilization +
            (((_c = metrics.efficiency) === null || _c === void 0 ? void 0 : _c.overall) || 0) * weights.operationalEfficiency +
            (((_d = metrics.patientSatisfaction) === null || _d === void 0 ? void 0 : _d.overall) || 0) * weights.patientSatisfaction);
    };
    // Placeholder methods for database operations and calculations
    ResourceOptimizer.prototype.getAppointmentsInPeriod = function (startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('appointments')
                            .select('*')
                            .gte('start_time', startDate.toISOString())
                            .lte('end_time', endDate.toISOString())];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data || []];
                }
            });
        });
    };
    ResourceOptimizer.prototype.getAllActiveStaff = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('staff')
                            .select('*')
                            .eq('active', true)];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data || []];
                }
            });
        });
    };
    ResourceOptimizer.prototype.getAllActiveRooms = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('rooms')
                            .select('*')
                            .eq('active', true)];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data || []];
                }
            });
        });
    };
    ResourceOptimizer.prototype.getAllActiveEquipment = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('equipment')
                            .select('*')
                            .eq('active', true)];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data || []];
                }
            });
        });
    };
    // Simplified implementations for complex calculations
    ResourceOptimizer.prototype.calculateStaffUtilization = function (appointments, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, { average: 0.75, min: 0.4, max: 0.95, distribution: {} }];
            });
        });
    };
    ResourceOptimizer.prototype.calculateRoomUtilization = function (appointments, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, { average: 0.68, min: 0.3, max: 0.9, distribution: {} }];
            });
        });
    };
    ResourceOptimizer.prototype.calculateEquipmentUtilization = function (appointments, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, { average: 0.72, min: 0.2, max: 0.95, distribution: {} }];
            });
        });
    };
    ResourceOptimizer.prototype.calculateEfficiencyMetrics = function (appointments) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, { overall: 0.8, timeUtilization: 0.85, resourceUtilization: 0.75 }];
            });
        });
    };
    ResourceOptimizer.prototype.calculatePatientSatisfactionMetrics = function (appointments) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, { overall: 0.88, waitTime: 0.82, serviceQuality: 0.92 }];
            });
        });
    };
    ResourceOptimizer.prototype.getStaffAppointments = function (staffId, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('appointments')
                            .select('*')
                            .eq('staff_id', staffId)
                            .gte('start_time', startDate.toISOString())
                            .lte('end_time', endDate.toISOString())];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data || []];
                }
            });
        });
    };
    ResourceOptimizer.prototype.calculateTotalWorkHours = function (appointments) {
        return appointments.reduce(function (total, apt) {
            var start = new Date(apt.start_time);
            var end = new Date(apt.end_time);
            return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        }, 0);
    };
    ResourceOptimizer.prototype.calculateAvailableHours = function (staff, startDate, endDate) {
        // Simplified calculation - would need to account for working hours, days off, etc.
        var days = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
        return days * 8; // Assuming 8 hours per day
    };
    ResourceOptimizer.prototype.calculateStaffEfficiency = function (staffId, appointments) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, 0.85]; // Simplified implementation
            });
        });
    };
    ResourceOptimizer.prototype.getStaffSatisfactionScore = function (staffId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, 0.8]; // Simplified implementation
            });
        });
    };
    ResourceOptimizer.prototype.identifyWorkloadImbalances = function (workloads, targetUtilization) {
        return workloads.filter(function (w) {
            return w.currentUtilization > targetUtilization + 0.1 ||
                w.currentUtilization < targetUtilization - 0.2;
        });
    };
    ResourceOptimizer.prototype.generateBalancingActions = function (imbalances, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, []]; // Simplified implementation
            });
        });
    };
    ResourceOptimizer.prototype.calculateExpectedBalance = function (workloads, actions) {
        return workloads; // Simplified implementation
    };
    ResourceOptimizer.prototype.calculateBalancingConfidence = function (actions) {
        return 0.8; // Simplified implementation
    };
    ResourceOptimizer.prototype.calculateBalancingTime = function (actions) {
        return actions.length * 15; // Simplified implementation
    };
    ResourceOptimizer.prototype.getRoomUtilizationRate = function (roomId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, 0.7]; // Simplified implementation
            });
        });
    };
    ResourceOptimizer.prototype.getEquipmentUtilizationRate = function (equipmentId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, 0.65]; // Simplified implementation
            });
        });
    };
    ResourceOptimizer.prototype.getEquipmentMaintenanceSchedule = function (equipmentId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, { hasConflicts: false, conflicts: [], alternativeSlots: [], conflictSeverity: 0 }];
            });
        });
    };
    ResourceOptimizer.prototype.identifyHighDemandPeriods = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, []]; // Simplified implementation
            });
        });
    };
    ResourceOptimizer.prototype.analyzeAppointmentPatterns = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, []]; // Simplified implementation
            });
        });
    };
    ResourceOptimizer.prototype.analyzeBufferTimes = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, {
                        hasOptimizationOpportunity: false,
                        optimizationPotential: 0,
                        currentAverageBuffer: 15,
                        recommendedBuffer: 10,
                        potentialTimeGain: 30
                    }];
            });
        });
    };
    ResourceOptimizer.prototype.calculateRedistributionOpportunities = function (peakPeriods, lowPeriods) {
        return {}; // Simplified implementation
    };
    ResourceOptimizer.prototype.getOptimizationById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, null]; // Would fetch from database
            });
        });
    };
    ResourceOptimizer.prototype.validateOptimization = function (optimization) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, { isValid: true, errors: [] }];
            });
        });
    };
    ResourceOptimizer.prototype.applyRecommendations = function (recommendations) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, {}]; // Simplified implementation
            });
        });
    };
    ResourceOptimizer.prototype.measureActualImpact = function (optimization, appliedChanges) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, optimization.expectedImprovements]; // Simplified implementation
            });
        });
    };
    ResourceOptimizer.prototype.updateOptimizationStatus = function (id, status) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    ResourceOptimizer.prototype.clearRelatedCaches = function (optimization) {
        this.optimizationCache.clear();
        this.metricsCache.clear();
    };
    /**
     * Clear all caches
     */
    ResourceOptimizer.prototype.clearCache = function () {
        this.optimizationCache.clear();
        this.metricsCache.clear();
    };
    /**
     * Update configuration
     */
    ResourceOptimizer.prototype.updateConfig = function (config) {
        this.config = __assign(__assign({}, this.config), config);
        this.clearCache();
    };
    /**
     * Update constraints
     */
    ResourceOptimizer.prototype.updateConstraints = function (constraints) {
        this.constraints = __assign(__assign({}, this.constraints), constraints);
        this.clearCache();
    };
    return ResourceOptimizer;
}());
exports.ResourceOptimizer = ResourceOptimizer;
