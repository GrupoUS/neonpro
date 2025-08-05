"use strict";
/**
 * Intelligent Conflict Detection Engine
 * Advanced system for detecting scheduling conflicts, resource conflicts, and optimization opportunities
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictDetectionEngine = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var types_1 = require("./types");
var ConflictDetectionEngine = /** @class */ (function () {
    function ConflictDetectionEngine(supabaseUrl, supabaseKey, config) {
        if (config === void 0) { config = {}; }
        this.cache = new Map();
        this.patterns = null;
        this.const;
        supabase = (0, supabase_js_1.createClient)((supabaseUrl, supabaseKey));
        this.config = __assign({ enableTimeOverlapDetection: true, enableResourceConflictDetection: true, enableStaffConflictDetection: true, enableRoomConflictDetection: true, enableEquipmentConflictDetection: true, bufferTimeMinutes: 15, maxLookaheadDays: 30, conflictSeverityThreshold: types_1.ConflictSeverity.MEDIUM }, config);
    }
    /**
     * Main conflict detection method
     */
    ConflictDetectionEngine.prototype.detectConflicts = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var conflicts, cacheKey, appointments, _a, staff, rooms, equipment, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, filteredConflicts, error_1;
            return __generator(this, function (_s) {
                switch (_s.label) {
                    case 0:
                        _s.trys.push([0, 13, , 14]);
                        conflicts = [];
                        cacheKey = this.generateCacheKey('conflicts', params);
                        // Check cache first
                        if (this.cache.has(cacheKey)) {
                            return [2 /*return*/, this.cache.get(cacheKey)];
                        }
                        return [4 /*yield*/, this.getAppointmentsInRange(params.dateRange.start, params.dateRange.end)];
                    case 1:
                        appointments = _s.sent();
                        return [4 /*yield*/, Promise.all([
                                this.getStaff(),
                                this.getRooms(),
                                this.getEquipment()
                            ])];
                    case 2:
                        _a = _s.sent(), staff = _a[0], rooms = _a[1], equipment = _a[2];
                        if (!this.config.enableTimeOverlapDetection) return [3 /*break*/, 4];
                        _c = (_b = conflicts.push).apply;
                        _d = [conflicts];
                        return [4 /*yield*/, this.detectTimeOverlapConflicts(appointments)];
                    case 3:
                        _c.apply(_b, _d.concat([_s.sent()]));
                        _s.label = 4;
                    case 4:
                        if (!this.config.enableStaffConflictDetection) return [3 /*break*/, 6];
                        _f = (_e = conflicts.push).apply;
                        _g = [conflicts];
                        return [4 /*yield*/, this.detectStaffConflicts(appointments, staff)];
                    case 5:
                        _f.apply(_e, _g.concat([_s.sent()]));
                        _s.label = 6;
                    case 6:
                        if (!this.config.enableRoomConflictDetection) return [3 /*break*/, 8];
                        _j = (_h = conflicts.push).apply;
                        _k = [conflicts];
                        return [4 /*yield*/, this.detectRoomConflicts(appointments, rooms)];
                    case 7:
                        _j.apply(_h, _k.concat([_s.sent()]));
                        _s.label = 8;
                    case 8:
                        if (!this.config.enableEquipmentConflictDetection) return [3 /*break*/, 10];
                        _m = (_l = conflicts.push).apply;
                        _o = [conflicts];
                        return [4 /*yield*/, this.detectEquipmentConflicts(appointments, equipment)];
                    case 9:
                        _m.apply(_l, _o.concat([_s.sent()]));
                        _s.label = 10;
                    case 10:
                        if (!this.config.enableResourceConflictDetection) return [3 /*break*/, 12];
                        _q = (_p = conflicts.push).apply;
                        _r = [conflicts];
                        return [4 /*yield*/, this.detectResourceOverbooking(appointments, staff, rooms, equipment)];
                    case 11:
                        _q.apply(_p, _r.concat([_s.sent()]));
                        _s.label = 12;
                    case 12:
                        filteredConflicts = this.filterConflicts(conflicts, params);
                        // Cache results
                        this.cache.set(cacheKey, filteredConflicts);
                        return [2 /*return*/, filteredConflicts];
                    case 13:
                        error_1 = _s.sent();
                        console.error('Error detecting conflicts:', error_1);
                        throw new Error("Conflict detection failed: ".concat(error_1.message));
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Detect time overlap conflicts between appointments
     */
    ConflictDetectionEngine.prototype.detectTimeOverlapConflicts = function (appointments) {
        return __awaiter(this, void 0, void 0, function () {
            var conflicts, sortedAppointments, i, current, next, currentEnd, nextStart, bufferTime, overlapMinutes;
            return __generator(this, function (_a) {
                conflicts = [];
                sortedAppointments = appointments.sort(function (a, b) {
                    return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
                });
                for (i = 0; i < sortedAppointments.length - 1; i++) {
                    current = sortedAppointments[i];
                    next = sortedAppointments[i + 1];
                    currentEnd = new Date(current.end_time);
                    nextStart = new Date(next.start_time);
                    bufferTime = this.config.bufferTimeMinutes * 60 * 1000;
                    // Check for overlap or insufficient buffer time
                    if (currentEnd.getTime() + bufferTime > nextStart.getTime()) {
                        overlapMinutes = Math.ceil((currentEnd.getTime() + bufferTime - nextStart.getTime()) / (1000 * 60));
                        conflicts.push({
                            id: "overlap_".concat(current.id, "_").concat(next.id),
                            type: types_1.ConflictType.TIME_OVERLAP,
                            severity: this.calculateOverlapSeverity(overlapMinutes),
                            description: "Appointment overlap detected: ".concat(overlapMinutes, " minutes"),
                            affectedAppointments: [current.id, next.id],
                            affectedResources: {
                                staff: [current.staff_id, next.staff_id].filter(Boolean),
                                rooms: [current.room_id, next.room_id].filter(Boolean)
                            },
                            conflictTime: {
                                start: new Date(current.start_time),
                                end: new Date(next.end_time)
                            },
                            detectedAt: new Date(),
                            metadata: {
                                overlapMinutes: overlapMinutes,
                                bufferTimeRequired: this.config.bufferTimeMinutes,
                                currentAppointment: current,
                                nextAppointment: next
                            }
                        });
                    }
                }
                return [2 /*return*/, conflicts];
            });
        });
    };
    /**
     * Detect staff conflicts and overloading
     */
    ConflictDetectionEngine.prototype.detectStaffConflicts = function (appointments, staff) {
        return __awaiter(this, void 0, void 0, function () {
            var conflicts, staffMap, staffAppointments, _i, staffAppointments_1, _a, staffId, staffApts, staffMember, sortedApts, i, current, next, workloadMetrics;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        conflicts = [];
                        staffMap = new Map(staff.map(function (s) { return [s.id, s]; }));
                        staffAppointments = new Map();
                        appointments.forEach(function (apt) {
                            if (apt.staff_id) {
                                if (!staffAppointments.has(apt.staff_id)) {
                                    staffAppointments.set(apt.staff_id, []);
                                }
                                staffAppointments.get(apt.staff_id).push(apt);
                            }
                        });
                        _i = 0, staffAppointments_1 = staffAppointments;
                        _b.label = 1;
                    case 1:
                        if (!(_i < staffAppointments_1.length)) return [3 /*break*/, 4];
                        _a = staffAppointments_1[_i], staffId = _a[0], staffApts = _a[1];
                        staffMember = staffMap.get(staffId);
                        if (!staffMember)
                            return [3 /*break*/, 3];
                        sortedApts = staffApts.sort(function (a, b) {
                            return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
                        });
                        // Check for double booking
                        for (i = 0; i < sortedApts.length - 1; i++) {
                            current = sortedApts[i];
                            next = sortedApts[i + 1];
                            if (new Date(current.end_time) > new Date(next.start_time)) {
                                conflicts.push({
                                    id: "staff_conflict_".concat(staffId, "_").concat(current.id, "_").concat(next.id),
                                    type: types_1.ConflictType.STAFF_UNAVAILABLE,
                                    severity: types_1.ConflictSeverity.HIGH,
                                    description: "Staff member ".concat(staffMember.name, " double-booked"),
                                    affectedAppointments: [current.id, next.id],
                                    affectedResources: { staff: [staffId] },
                                    conflictTime: {
                                        start: new Date(next.start_time),
                                        end: new Date(current.end_time)
                                    },
                                    detectedAt: new Date(),
                                    metadata: {
                                        staffMember: staffMember,
                                        conflictingAppointments: [current, next]
                                    }
                                });
                            }
                        }
                        return [4 /*yield*/, this.calculateStaffWorkload(staffId, staffApts)];
                    case 2:
                        workloadMetrics = _b.sent();
                        if (workloadMetrics.currentLoad > 0.9) {
                            conflicts.push({
                                id: "staff_overload_".concat(staffId),
                                type: types_1.ConflictType.RESOURCE_OVERBOOKED,
                                severity: types_1.ConflictSeverity.MEDIUM,
                                description: "Staff member ".concat(staffMember.name, " overloaded (").concat(Math.round(workloadMetrics.currentLoad * 100), "%)"),
                                affectedAppointments: staffApts.map(function (apt) { return apt.id; }),
                                affectedResources: { staff: [staffId] },
                                conflictTime: {
                                    start: new Date(Math.min.apply(Math, staffApts.map(function (apt) { return new Date(apt.start_time).getTime(); }))),
                                    end: new Date(Math.max.apply(Math, staffApts.map(function (apt) { return new Date(apt.end_time).getTime(); })))
                                },
                                detectedAt: new Date(),
                                metadata: {
                                    workloadMetrics: workloadMetrics,
                                    staffMember: staffMember
                                }
                            });
                        }
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, conflicts];
                }
            });
        });
    }; /**
     * Detect room conflicts and capacity issues
     */
    ConflictDetectionEngine.prototype.detectRoomConflicts = function (appointments, rooms) {
        return __awaiter(this, void 0, void 0, function () {
            var conflicts, roomMap, roomAppointments, _i, roomAppointments_1, _a, roomId, roomApts, room, sortedApts, i, current, next, maxCapacity, simultaneousAppointments, _b, simultaneousAppointments_1, group;
            return __generator(this, function (_c) {
                conflicts = [];
                roomMap = new Map(rooms.map(function (r) { return [r.id, r]; }));
                roomAppointments = new Map();
                appointments.forEach(function (apt) {
                    if (apt.room_id) {
                        if (!roomAppointments.has(apt.room_id)) {
                            roomAppointments.set(apt.room_id, []);
                        }
                        roomAppointments.get(apt.room_id).push(apt);
                    }
                });
                // Check each room for conflicts
                for (_i = 0, roomAppointments_1 = roomAppointments; _i < roomAppointments_1.length; _i++) {
                    _a = roomAppointments_1[_i], roomId = _a[0], roomApts = _a[1];
                    room = roomMap.get(roomId);
                    if (!room)
                        continue;
                    sortedApts = roomApts.sort(function (a, b) {
                        return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
                    });
                    // Check for overlapping appointments
                    for (i = 0; i < sortedApts.length - 1; i++) {
                        current = sortedApts[i];
                        next = sortedApts[i + 1];
                        if (new Date(current.end_time) > new Date(next.start_time)) {
                            conflicts.push({
                                id: "room_conflict_".concat(roomId, "_").concat(current.id, "_").concat(next.id),
                                type: types_1.ConflictType.ROOM_OCCUPIED,
                                severity: types_1.ConflictSeverity.HIGH,
                                description: "Room ".concat(room.name, " double-booked"),
                                affectedAppointments: [current.id, next.id],
                                affectedResources: { rooms: [roomId] },
                                conflictTime: {
                                    start: new Date(next.start_time),
                                    end: new Date(current.end_time)
                                },
                                detectedAt: new Date(),
                                metadata: {
                                    room: room,
                                    conflictingAppointments: [current, next]
                                }
                            });
                        }
                    }
                    maxCapacity = room.capacity || 1;
                    simultaneousAppointments = this.findSimultaneousAppointments(roomApts);
                    for (_b = 0, simultaneousAppointments_1 = simultaneousAppointments; _b < simultaneousAppointments_1.length; _b++) {
                        group = simultaneousAppointments_1[_b];
                        if (group.length > maxCapacity) {
                            conflicts.push({
                                id: "room_capacity_".concat(roomId, "_").concat(Date.now()),
                                type: types_1.ConflictType.CAPACITY_EXCEEDED,
                                severity: types_1.ConflictSeverity.MEDIUM,
                                description: "Room ".concat(room.name, " capacity exceeded (").concat(group.length, "/").concat(maxCapacity, ")"),
                                affectedAppointments: group.map(function (apt) { return apt.id; }),
                                affectedResources: { rooms: [roomId] },
                                conflictTime: {
                                    start: new Date(Math.min.apply(Math, group.map(function (apt) { return new Date(apt.start_time).getTime(); }))),
                                    end: new Date(Math.max.apply(Math, group.map(function (apt) { return new Date(apt.end_time).getTime(); })))
                                },
                                detectedAt: new Date(),
                                metadata: {
                                    room: room,
                                    capacity: maxCapacity,
                                    actualUsage: group.length,
                                    appointments: group
                                }
                            });
                        }
                    }
                }
                return [2 /*return*/, conflicts];
            });
        });
    };
    /**
     * Detect equipment conflicts and availability issues
     */
    ConflictDetectionEngine.prototype.detectEquipmentConflicts = function (appointments, equipment) {
        return __awaiter(this, void 0, void 0, function () {
            var conflicts, equipmentMap, equipmentAssignments, equipmentAppointments, _loop_1, _i, equipmentAssignments_1, assignment, _a, equipmentAppointments_1, _b, equipmentId, assignments, equipmentItem, sortedAssignments, i, current, next, currentEnd, nextStart, setupTime, cleanupTime, requiredGap, maintenanceSchedule, _loop_2, _c, maintenanceSchedule_1, maintenance;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        conflicts = [];
                        equipmentMap = new Map(equipment.map(function (e) { return [e.id, e]; }));
                        return [4 /*yield*/, this.getEquipmentAssignments(appointments.map(function (apt) { return apt.id; }))];
                    case 1:
                        equipmentAssignments = _d.sent();
                        equipmentAppointments = new Map();
                        _loop_1 = function (assignment) {
                            var appointment = appointments.find(function (apt) { return apt.id === assignment.appointment_id; });
                            if (!appointment)
                                return "continue";
                            if (!equipmentAppointments.has(assignment.equipment_id)) {
                                equipmentAppointments.set(assignment.equipment_id, []);
                            }
                            equipmentAppointments.get(assignment.equipment_id).push({ appointment: appointment, assignment: assignment });
                        };
                        for (_i = 0, equipmentAssignments_1 = equipmentAssignments; _i < equipmentAssignments_1.length; _i++) {
                            assignment = equipmentAssignments_1[_i];
                            _loop_1(assignment);
                        }
                        _a = 0, equipmentAppointments_1 = equipmentAppointments;
                        _d.label = 2;
                    case 2:
                        if (!(_a < equipmentAppointments_1.length)) return [3 /*break*/, 5];
                        _b = equipmentAppointments_1[_a], equipmentId = _b[0], assignments = _b[1];
                        equipmentItem = equipmentMap.get(equipmentId);
                        if (!equipmentItem)
                            return [3 /*break*/, 4];
                        sortedAssignments = assignments.sort(function (a, b) {
                            return new Date(a.appointment.start_time).getTime() - new Date(b.appointment.start_time).getTime();
                        });
                        // Check for overlapping usage
                        for (i = 0; i < sortedAssignments.length - 1; i++) {
                            current = sortedAssignments[i];
                            next = sortedAssignments[i + 1];
                            currentEnd = new Date(current.appointment.end_time);
                            nextStart = new Date(next.appointment.start_time);
                            setupTime = equipmentItem.setup_time_minutes || 0;
                            cleanupTime = equipmentItem.cleanup_time_minutes || 0;
                            requiredGap = (setupTime + cleanupTime) * 60 * 1000;
                            if (currentEnd.getTime() + requiredGap > nextStart.getTime()) {
                                conflicts.push({
                                    id: "equipment_conflict_".concat(equipmentId, "_").concat(current.appointment.id, "_").concat(next.appointment.id),
                                    type: types_1.ConflictType.EQUIPMENT_UNAVAILABLE,
                                    severity: types_1.ConflictSeverity.HIGH,
                                    description: "Equipment ".concat(equipmentItem.name, " scheduling conflict"),
                                    affectedAppointments: [current.appointment.id, next.appointment.id],
                                    affectedResources: { equipment: [equipmentId] },
                                    conflictTime: {
                                        start: nextStart,
                                        end: new Date(currentEnd.getTime() + requiredGap)
                                    },
                                    detectedAt: new Date(),
                                    metadata: {
                                        equipment: equipmentItem,
                                        setupTime: setupTime,
                                        cleanupTime: cleanupTime,
                                        requiredGap: requiredGap / (1000 * 60),
                                        conflictingAppointments: [current.appointment, next.appointment]
                                    }
                                });
                            }
                        }
                        return [4 /*yield*/, this.getEquipmentMaintenance(equipmentId)];
                    case 3:
                        maintenanceSchedule = _d.sent();
                        _loop_2 = function (maintenance) {
                            var conflictingAssignments = assignments.filter(function (_a) {
                                var appointment = _a.appointment;
                                var aptStart = new Date(appointment.start_time);
                                var aptEnd = new Date(appointment.end_time);
                                var maintStart = new Date(maintenance.start_time);
                                var maintEnd = new Date(maintenance.end_time);
                                return (aptStart < maintEnd && aptEnd > maintStart);
                            });
                            if (conflictingAssignments.length > 0) {
                                conflicts.push({
                                    id: "equipment_maintenance_".concat(equipmentId, "_").concat(maintenance.id),
                                    type: types_1.ConflictType.EQUIPMENT_UNAVAILABLE,
                                    severity: types_1.ConflictSeverity.CRITICAL,
                                    description: "Equipment ".concat(equipmentItem.name, " scheduled for maintenance"),
                                    affectedAppointments: conflictingAssignments.map(function (_a) {
                                        var appointment = _a.appointment;
                                        return appointment.id;
                                    }),
                                    affectedResources: { equipment: [equipmentId] },
                                    conflictTime: {
                                        start: new Date(maintenance.start_time),
                                        end: new Date(maintenance.end_time)
                                    },
                                    detectedAt: new Date(),
                                    metadata: {
                                        equipment: equipmentItem,
                                        maintenance: maintenance,
                                        conflictingAppointments: conflictingAssignments.map(function (_a) {
                                            var appointment = _a.appointment;
                                            return appointment;
                                        })
                                    }
                                });
                            }
                        };
                        for (_c = 0, maintenanceSchedule_1 = maintenanceSchedule; _c < maintenanceSchedule_1.length; _c++) {
                            maintenance = maintenanceSchedule_1[_c];
                            _loop_2(maintenance);
                        }
                        _d.label = 4;
                    case 4:
                        _a++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, conflicts];
                }
            });
        });
    };
    /**
     * Detect resource overbooking across all resource types
     */
    ConflictDetectionEngine.prototype.detectResourceOverbooking = function (appointments, staff, rooms, equipment) {
        return __awaiter(this, void 0, void 0, function () {
            var conflicts, utilizationAnalysis, _i, utilizationAnalysis_1, analysis;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        conflicts = [];
                        return [4 /*yield*/, this.analyzeResourceUtilization(appointments, staff, rooms, equipment)];
                    case 1:
                        utilizationAnalysis = _b.sent();
                        // Check for critical utilization levels
                        for (_i = 0, utilizationAnalysis_1 = utilizationAnalysis; _i < utilizationAnalysis_1.length; _i++) {
                            analysis = utilizationAnalysis_1[_i];
                            if (analysis.utilizationRate > 0.95) {
                                conflicts.push({
                                    id: "resource_overbook_".concat(analysis.resourceType, "_").concat(analysis.resourceId),
                                    type: types_1.ConflictType.RESOURCE_OVERBOOKED,
                                    severity: types_1.ConflictSeverity.HIGH,
                                    description: "".concat(analysis.resourceType, " ").concat(analysis.resourceName, " critically overbooked (").concat(Math.round(analysis.utilizationRate * 100), "%)"),
                                    affectedAppointments: analysis.affectedAppointments,
                                    affectedResources: (_a = {},
                                        _a[analysis.resourceType] = [analysis.resourceId],
                                        _a),
                                    conflictTime: {
                                        start: analysis.periodStart,
                                        end: analysis.periodEnd
                                    },
                                    detectedAt: new Date(),
                                    metadata: {
                                        utilizationRate: analysis.utilizationRate,
                                        capacity: analysis.capacity,
                                        demand: analysis.demand,
                                        recommendations: analysis.recommendations
                                    }
                                });
                            }
                        }
                        return [2 /*return*/, conflicts];
                }
            });
        });
    };
    /**
     * Calculate staff workload metrics
     */
    ConflictDetectionEngine.prototype.calculateStaffWorkload = function (staffId, appointments) {
        return __awaiter(this, void 0, void 0, function () {
            var staff, totalWorkMinutes, workingHoursPerDay, daysInPeriod, maxPossibleMinutes, currentLoad, efficiency, satisfaction, availability, preferences;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getStaffById(staffId)];
                    case 1:
                        staff = _a.sent();
                        if (!staff) {
                            throw new Error("Staff member not found: ".concat(staffId));
                        }
                        totalWorkMinutes = appointments.reduce(function (total, apt) {
                            var duration = new Date(apt.end_time).getTime() - new Date(apt.start_time).getTime();
                            return total + (duration / (1000 * 60));
                        }, 0);
                        workingHoursPerDay = 8 * 60;
                        daysInPeriod = this.calculateDaysInPeriod(appointments);
                        maxPossibleMinutes = workingHoursPerDay * daysInPeriod;
                        currentLoad = Math.min(totalWorkMinutes / maxPossibleMinutes, 1);
                        return [4 /*yield*/, this.calculateStaffEfficiency(staffId)];
                    case 2:
                        efficiency = _a.sent();
                        return [4 /*yield*/, this.getStaffSatisfactionScore(staffId)];
                    case 3:
                        satisfaction = _a.sent();
                        return [4 /*yield*/, this.getStaffAvailability(staffId)];
                    case 4:
                        availability = _a.sent();
                        return [4 /*yield*/, this.getStaffPreferences(staffId)];
                    case 5:
                        preferences = _a.sent();
                        return [2 /*return*/, {
                                staffId: staffId,
                                currentLoad: currentLoad,
                                projectedLoad: currentLoad * 1.1, // Simple projection
                                efficiency: efficiency,
                                satisfaction: satisfaction,
                                specializations: staff.specializations || [],
                                availability: availability,
                                preferences: preferences
                            }];
                }
            });
        });
    };
    /**
     * Helper methods
     */
    ConflictDetectionEngine.prototype.calculateOverlapSeverity = function (overlapMinutes) {
        if (overlapMinutes > 60)
            return types_1.ConflictSeverity.CRITICAL;
        if (overlapMinutes > 30)
            return types_1.ConflictSeverity.HIGH;
        if (overlapMinutes > 15)
            return types_1.ConflictSeverity.MEDIUM;
        return types_1.ConflictSeverity.LOW;
    };
    ConflictDetectionEngine.prototype.findSimultaneousAppointments = function (appointments) {
        var groups = [];
        var processed = new Set();
        for (var _i = 0, appointments_1 = appointments; _i < appointments_1.length; _i++) {
            var apt = appointments_1[_i];
            if (processed.has(apt.id))
                continue;
            var group = [apt];
            processed.add(apt.id);
            var aptStart = new Date(apt.start_time);
            var aptEnd = new Date(apt.end_time);
            for (var _a = 0, appointments_2 = appointments; _a < appointments_2.length; _a++) {
                var other = appointments_2[_a];
                if (processed.has(other.id))
                    continue;
                var otherStart = new Date(other.start_time);
                var otherEnd = new Date(other.end_time);
                // Check for overlap
                if (aptStart < otherEnd && aptEnd > otherStart) {
                    group.push(other);
                    processed.add(other.id);
                }
            }
            if (group.length > 1) {
                groups.push(group);
            }
        }
        return groups;
    };
    ConflictDetectionEngine.prototype.filterConflicts = function (conflicts, params) {
        return conflicts.filter(function (conflict) {
            // Filter by type
            if (params.includeTypes && !params.includeTypes.includes(conflict.type)) {
                return false;
            }
            // Filter by severity
            if (params.severityFilter && !params.severityFilter.includes(conflict.severity)) {
                return false;
            }
            // Filter by resources
            if (params.resourceFilter) {
                var _a = params.resourceFilter, staff_1 = _a.staff, rooms_1 = _a.rooms, equipment_1 = _a.equipment;
                if (staff_1 && conflict.affectedResources.staff) {
                    var hasMatchingStaff = conflict.affectedResources.staff.some(function (id) { return staff_1.includes(id); });
                    if (!hasMatchingStaff)
                        return false;
                }
                if (rooms_1 && conflict.affectedResources.rooms) {
                    var hasMatchingRoom = conflict.affectedResources.rooms.some(function (id) { return rooms_1.includes(id); });
                    if (!hasMatchingRoom)
                        return false;
                }
                if (equipment_1 && conflict.affectedResources.equipment) {
                    var hasMatchingEquipment = conflict.affectedResources.equipment.some(function (id) { return equipment_1.includes(id); });
                    if (!hasMatchingEquipment)
                        return false;
                }
            }
            return true;
        });
    };
    ConflictDetectionEngine.prototype.generateCacheKey = function (prefix, params) {
        return "".concat(prefix, "_").concat(JSON.stringify(params));
    };
    /**
     * Database query methods
     */
    ConflictDetectionEngine.prototype.getAppointmentsInRange = function (start, end) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('appointments')
                            .select('*')
                            .gte('start_time', start.toISOString())
                            .lte('end_time', end.toISOString())
                            .eq('status', 'scheduled')];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data || []];
                }
            });
        });
    };
    ConflictDetectionEngine.prototype.getStaff = function () {
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
    ConflictDetectionEngine.prototype.getRooms = function () {
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
    ConflictDetectionEngine.prototype.getEquipment = function () {
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
    ConflictDetectionEngine.prototype.getStaffById = function (staffId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('staff')
                            .select('*')
                            .eq('id', staffId)
                            .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            return [2 /*return*/, null];
                        return [2 /*return*/, data];
                }
            });
        });
    };
    ConflictDetectionEngine.prototype.getEquipmentAssignments = function (appointmentIds) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('appointment_equipment')
                            .select('*')
                            .in('appointment_id', appointmentIds)];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data || []];
                }
            });
        });
    };
    ConflictDetectionEngine.prototype.getEquipmentMaintenance = function (equipmentId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('equipment_maintenance')
                            .select('*')
                            .eq('equipment_id', equipmentId)
                            .gte('end_time', new Date().toISOString())];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data || []];
                }
            });
        });
    };
    // Placeholder methods for advanced features
    ConflictDetectionEngine.prototype.analyzeResourceUtilization = function (appointments, staff, rooms, equipment) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementation for resource utilization analysis
                return [2 /*return*/, []];
            });
        });
    };
    ConflictDetectionEngine.prototype.calculateDaysInPeriod = function (appointments) {
        if (appointments.length === 0)
            return 1;
        var dates = appointments.map(function (apt) { return new Date(apt.start_time).toDateString(); });
        var uniqueDates = new Set(dates);
        return uniqueDates.size;
    };
    ConflictDetectionEngine.prototype.calculateStaffEfficiency = function (staffId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Placeholder for efficiency calculation
                return [2 /*return*/, 0.8];
            });
        });
    };
    ConflictDetectionEngine.prototype.getStaffSatisfactionScore = function (staffId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Placeholder for satisfaction score
                return [2 /*return*/, 0.7];
            });
        });
    };
    ConflictDetectionEngine.prototype.getStaffAvailability = function (staffId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Placeholder for availability windows
                return [2 /*return*/, []];
            });
        });
    };
    ConflictDetectionEngine.prototype.getStaffPreferences = function (staffId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Placeholder for staff preferences
                return [2 /*return*/, {
                        preferredHours: { start: '09:00', end: '17:00' },
                        preferredDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
                        avoidedTasks: [],
                        preferredTasks: [],
                        maxConsecutiveHours: 8,
                        minBreakBetweenAppointments: 15
                    }];
            });
        });
    };
    /**
     * Clear cache
     */
    ConflictDetectionEngine.prototype.clearCache = function () {
        this.cache.clear();
    };
    /**
     * Update configuration
     */
    ConflictDetectionEngine.prototype.updateConfig = function (config) {
        this.config = __assign(__assign({}, this.config), config);
        this.clearCache();
    };
    return ConflictDetectionEngine;
}());
exports.ConflictDetectionEngine = ConflictDetectionEngine;
