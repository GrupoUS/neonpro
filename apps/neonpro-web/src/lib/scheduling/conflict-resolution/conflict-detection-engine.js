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
exports.createconflictDetectionEngine = exports.ConflictDetectionEngine = exports.ConflictType = void 0;
exports.detectConflicts = detectConflicts;
var client_1 = require("@/lib/supabase/client");
var logger_1 = require("@/lib/logger");
var ConflictType;
(function (ConflictType) {
    ConflictType["STAFF_DOUBLE_BOOKING"] = "staff_double_booking";
    ConflictType["ROOM_OVERLAP"] = "room_overlap";
    ConflictType["EQUIPMENT_UNAVAILABLE"] = "equipment_unavailable";
    ConflictType["STAFF_SKILL_MISMATCH"] = "staff_skill_mismatch";
    ConflictType["ROOM_CAPACITY_EXCEEDED"] = "room_capacity_exceeded";
    ConflictType["EQUIPMENT_MAINTENANCE"] = "equipment_maintenance";
    ConflictType["STAFF_BREAK_VIOLATION"] = "staff_break_violation";
    ConflictType["OVERTIME_VIOLATION"] = "overtime_violation";
})(ConflictType || (exports.ConflictType = ConflictType = {}));
/**
 * Core Conflict Detection Engine
 * Detecta conflitos de agendamento em tempo real
 */
var ConflictDetectionEngine = /** @class */ (function () {
    function ConflictDetectionEngine(config) {
        if (config === void 0) { config = {}; }
        this.supabase = (0, client_1.createClient)();
        this.config = __assign({ enableRealTimeDetection: true, checkStaffAvailability: true, checkRoomAvailability: true, checkEquipmentAvailability: true, validateSkillMatching: true, enforceBreakTimes: true, maxOvertimeHours: 8, bufferTimeMinutes: 15 }, config);
    }
    /**
     * Detecta conflitos para um novo agendamento
     */
    ConflictDetectionEngine.prototype.detectConflictsForNewAppointment = function (appointmentData, clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            var conflicts, affectedResources, startTime, endTime, staffConflicts, roomConflicts, equipmentConflicts, skillConflicts, breakConflicts, severity, suggestedActions, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 11, , 12]);
                        logger_1.logger.info('Starting conflict detection for new appointment', {
                            appointmentData: appointmentData,
                            clinicId: clinicId
                        });
                        conflicts = [];
                        affectedResources = [];
                        // Validar dados obrigatórios
                        if (!appointmentData.start_time || !appointmentData.end_time) {
                            throw new Error('Start time and end time are required');
                        }
                        startTime = new Date(appointmentData.start_time);
                        endTime = new Date(appointmentData.end_time);
                        if (!(this.config.checkStaffAvailability && appointmentData.staff_id)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.detectStaffConflicts(appointmentData.staff_id, startTime, endTime, clinicId, appointmentData.id)];
                    case 1:
                        staffConflicts = _a.sent();
                        conflicts.push.apply(conflicts, staffConflicts.conflicts);
                        affectedResources.push.apply(affectedResources, staffConflicts.resources);
                        _a.label = 2;
                    case 2:
                        if (!(this.config.checkRoomAvailability && appointmentData.room_id)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.detectRoomConflicts(appointmentData.room_id, startTime, endTime, clinicId, appointmentData.id)];
                    case 3:
                        roomConflicts = _a.sent();
                        conflicts.push.apply(conflicts, roomConflicts.conflicts);
                        affectedResources.push.apply(affectedResources, roomConflicts.resources);
                        _a.label = 4;
                    case 4:
                        if (!(this.config.checkEquipmentAvailability && appointmentData.required_equipment)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.detectEquipmentConflicts(appointmentData.required_equipment, startTime, endTime, clinicId, appointmentData.id)];
                    case 5:
                        equipmentConflicts = _a.sent();
                        conflicts.push.apply(conflicts, equipmentConflicts.conflicts);
                        affectedResources.push.apply(affectedResources, equipmentConflicts.resources);
                        _a.label = 6;
                    case 6:
                        if (!(this.config.validateSkillMatching && appointmentData.staff_id && appointmentData.service_id)) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.detectSkillMismatch(appointmentData.staff_id, appointmentData.service_id, clinicId)];
                    case 7:
                        skillConflicts = _a.sent();
                        conflicts.push.apply(conflicts, skillConflicts);
                        _a.label = 8;
                    case 8:
                        if (!(this.config.enforceBreakTimes && appointmentData.staff_id)) return [3 /*break*/, 10];
                        return [4 /*yield*/, this.detectBreakTimeViolations(appointmentData.staff_id, startTime, endTime, clinicId)];
                    case 9:
                        breakConflicts = _a.sent();
                        conflicts.push.apply(conflicts, breakConflicts);
                        _a.label = 10;
                    case 10:
                        severity = this.calculateOverallSeverity(conflicts);
                        suggestedActions = this.generateSuggestedActions(conflicts);
                        result = {
                            hasConflicts: conflicts.length > 0,
                            conflicts: conflicts,
                            severity: severity,
                            affectedResources: affectedResources,
                            suggestedActions: suggestedActions
                        };
                        // Log do resultado
                        logger_1.logger.info('Conflict detection completed', {
                            hasConflicts: result.hasConflicts,
                            conflictCount: conflicts.length,
                            severity: result.severity
                        });
                        return [2 /*return*/, result];
                    case 11:
                        error_1 = _a.sent();
                        logger_1.logger.error('Error in conflict detection', { error: error_1, appointmentData: appointmentData, clinicId: clinicId });
                        throw error_1;
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Detecta conflitos de staff (double booking, overtime, etc.)
     */
    ConflictDetectionEngine.prototype.detectStaffConflicts = function (staffId, startTime, endTime, clinicId, excludeAppointmentId) {
        return __awaiter(this, void 0, void 0, function () {
            var conflicts, resources, query, _a, conflictingAppointments, error, staffData, staffName, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        conflicts = [];
                        resources = [];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 5, , 6]);
                        query = this.supabase
                            .from('appointments')
                            .select("\n          id, start_time, end_time, service_id,\n          staff:staff_id(id, name, specialties),\n          service:service_id(name, duration_minutes)\n        ")
                            .eq('staff_id', staffId)
                            .eq('clinic_id', clinicId)
                            .neq('status', 'cancelled')
                            .or("and(start_time.lte.".concat(endTime.toISOString(), ",end_time.gte.").concat(startTime.toISOString(), ")"));
                        if (excludeAppointmentId) {
                            query = query.neq('id', excludeAppointmentId);
                        }
                        return [4 /*yield*/, query];
                    case 2:
                        _a = _b.sent(), conflictingAppointments = _a.data, error = _a.error;
                        if (error) {
                            logger_1.logger.error('Error fetching staff conflicts', { error: error, staffId: staffId });
                            throw error;
                        }
                        if (!(conflictingAppointments && conflictingAppointments.length > 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.supabase
                                .from('staff')
                                .select('id, name, specialties')
                                .eq('id', staffId)
                                .single()];
                    case 3:
                        staffData = (_b.sent()).data;
                        staffName = (staffData === null || staffData === void 0 ? void 0 : staffData.name) || 'Unknown Staff';
                        conflicts.push({
                            id: "staff_conflict_".concat(staffId, "_").concat(Date.now()),
                            type: ConflictType.STAFF_DOUBLE_BOOKING,
                            severity: 'high',
                            description: "Staff member ".concat(staffName, " has conflicting appointments"),
                            affectedAppointments: conflictingAppointments.map(function (apt) { return apt.id; }),
                            affectedResources: [{
                                    id: staffId,
                                    type: 'staff',
                                    name: staffName,
                                    conflictReason: 'Double booking detected'
                                }],
                            detectedAt: new Date(),
                            autoResolvable: true
                        });
                        resources.push({
                            id: staffId,
                            type: 'staff',
                            name: staffName,
                            conflictReason: 'Double booking detected',
                            availability: conflictingAppointments.map(function (apt) { return ({
                                start: new Date(apt.start_time),
                                end: new Date(apt.end_time),
                                available: false,
                                reason: 'Existing appointment'
                            }); })
                        });
                        _b.label = 4;
                    case 4: return [2 /*return*/, { conflicts: conflicts, resources: resources }];
                    case 5:
                        error_2 = _b.sent();
                        logger_1.logger.error('Error detecting staff conflicts', { error: error_2, staffId: staffId });
                        throw error_2;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Detecta conflitos de sala
     */
    ConflictDetectionEngine.prototype.detectRoomConflicts = function (roomId, startTime, endTime, clinicId, excludeAppointmentId) {
        return __awaiter(this, void 0, void 0, function () {
            var conflicts, resources, query, _a, conflictingAppointments, error, roomData, roomName, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        conflicts = [];
                        resources = [];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 5, , 6]);
                        query = this.supabase
                            .from('appointments')
                            .select("\n          id, start_time, end_time,\n          room:room_id(id, name, capacity)\n        ")
                            .eq('room_id', roomId)
                            .eq('clinic_id', clinicId)
                            .neq('status', 'cancelled')
                            .or("and(start_time.lte.".concat(endTime.toISOString(), ",end_time.gte.").concat(startTime.toISOString(), ")"));
                        if (excludeAppointmentId) {
                            query = query.neq('id', excludeAppointmentId);
                        }
                        return [4 /*yield*/, query];
                    case 2:
                        _a = _b.sent(), conflictingAppointments = _a.data, error = _a.error;
                        if (error) {
                            logger_1.logger.error('Error fetching room conflicts', { error: error, roomId: roomId });
                            throw error;
                        }
                        if (!(conflictingAppointments && conflictingAppointments.length > 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.supabase
                                .from('rooms')
                                .select('id, name, capacity')
                                .eq('id', roomId)
                                .single()];
                    case 3:
                        roomData = (_b.sent()).data;
                        roomName = (roomData === null || roomData === void 0 ? void 0 : roomData.name) || 'Unknown Room';
                        conflicts.push({
                            id: "room_conflict_".concat(roomId, "_").concat(Date.now()),
                            type: ConflictType.ROOM_OVERLAP,
                            severity: 'medium',
                            description: "Room ".concat(roomName, " is already booked"),
                            affectedAppointments: conflictingAppointments.map(function (apt) { return apt.id; }),
                            affectedResources: [{
                                    id: roomId,
                                    type: 'room',
                                    name: roomName,
                                    conflictReason: 'Room overlap detected'
                                }],
                            detectedAt: new Date(),
                            autoResolvable: true
                        });
                        resources.push({
                            id: roomId,
                            type: 'room',
                            name: roomName,
                            conflictReason: 'Room overlap detected',
                            availability: conflictingAppointments.map(function (apt) { return ({
                                start: new Date(apt.start_time),
                                end: new Date(apt.end_time),
                                available: false,
                                reason: 'Room occupied'
                            }); })
                        });
                        _b.label = 4;
                    case 4: return [2 /*return*/, { conflicts: conflicts, resources: resources }];
                    case 5:
                        error_3 = _b.sent();
                        logger_1.logger.error('Error detecting room conflicts', { error: error_3, roomId: roomId });
                        throw error_3;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Detecta conflitos de equipamentos
     */
    ConflictDetectionEngine.prototype.detectEquipmentConflicts = function (equipmentIds, startTime, endTime, clinicId, excludeAppointmentId) {
        return __awaiter(this, void 0, void 0, function () {
            var conflicts, resources, _i, equipmentIds_1, equipmentId, maintenanceData, equipmentData, equipmentName, query, _a, conflictingAppointments, error, equipmentData, equipmentName, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        conflicts = [];
                        resources = [];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 10, , 11]);
                        _i = 0, equipmentIds_1 = equipmentIds;
                        _b.label = 2;
                    case 2:
                        if (!(_i < equipmentIds_1.length)) return [3 /*break*/, 9];
                        equipmentId = equipmentIds_1[_i];
                        return [4 /*yield*/, this.supabase
                                .from('equipment_maintenance')
                                .select('*')
                                .eq('equipment_id', equipmentId)
                                .or("and(start_time.lte.".concat(endTime.toISOString(), ",end_time.gte.").concat(startTime.toISOString(), ")"))
                                .eq('status', 'active')];
                    case 3:
                        maintenanceData = (_b.sent()).data;
                        if (!(maintenanceData && maintenanceData.length > 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.supabase
                                .from('equipment')
                                .select('id, name')
                                .eq('id', equipmentId)
                                .single()];
                    case 4:
                        equipmentData = (_b.sent()).data;
                        equipmentName = (equipmentData === null || equipmentData === void 0 ? void 0 : equipmentData.name) || 'Unknown Equipment';
                        conflicts.push({
                            id: "equipment_maintenance_".concat(equipmentId, "_").concat(Date.now()),
                            type: ConflictType.EQUIPMENT_MAINTENANCE,
                            severity: 'high',
                            description: "Equipment ".concat(equipmentName, " is under maintenance"),
                            affectedAppointments: [],
                            affectedResources: [{
                                    id: equipmentId,
                                    type: 'equipment',
                                    name: equipmentName,
                                    conflictReason: 'Equipment under maintenance'
                                }],
                            detectedAt: new Date(),
                            autoResolvable: false
                        });
                        _b.label = 5;
                    case 5:
                        query = this.supabase
                            .from('appointments')
                            .select("\n            id, start_time, end_time, required_equipment,\n            equipment:required_equipment(id, name)\n          ")
                            .eq('clinic_id', clinicId)
                            .neq('status', 'cancelled')
                            .contains('required_equipment', [equipmentId])
                            .or("and(start_time.lte.".concat(endTime.toISOString(), ",end_time.gte.").concat(startTime.toISOString(), ")"));
                        if (excludeAppointmentId) {
                            query = query.neq('id', excludeAppointmentId);
                        }
                        return [4 /*yield*/, query];
                    case 6:
                        _a = _b.sent(), conflictingAppointments = _a.data, error = _a.error;
                        if (error) {
                            logger_1.logger.error('Error fetching equipment conflicts', { error: error, equipmentId: equipmentId });
                            return [3 /*break*/, 8];
                        }
                        if (!(conflictingAppointments && conflictingAppointments.length > 0)) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.supabase
                                .from('equipment')
                                .select('id, name')
                                .eq('id', equipmentId)
                                .single()];
                    case 7:
                        equipmentData = (_b.sent()).data;
                        equipmentName = (equipmentData === null || equipmentData === void 0 ? void 0 : equipmentData.name) || 'Unknown Equipment';
                        conflicts.push({
                            id: "equipment_conflict_".concat(equipmentId, "_").concat(Date.now()),
                            type: ConflictType.EQUIPMENT_UNAVAILABLE,
                            severity: 'medium',
                            description: "Equipment ".concat(equipmentName, " is already in use"),
                            affectedAppointments: conflictingAppointments.map(function (apt) { return apt.id; }),
                            affectedResources: [{
                                    id: equipmentId,
                                    type: 'equipment',
                                    name: equipmentName,
                                    conflictReason: 'Equipment already in use'
                                }],
                            detectedAt: new Date(),
                            autoResolvable: true
                        });
                        resources.push({
                            id: equipmentId,
                            type: 'equipment',
                            name: equipmentName,
                            conflictReason: 'Equipment already in use',
                            availability: conflictingAppointments.map(function (apt) { return ({
                                start: new Date(apt.start_time),
                                end: new Date(apt.end_time),
                                available: false,
                                reason: 'Equipment in use'
                            }); })
                        });
                        _b.label = 8;
                    case 8:
                        _i++;
                        return [3 /*break*/, 2];
                    case 9: return [2 /*return*/, { conflicts: conflicts, resources: resources }];
                    case 10:
                        error_4 = _b.sent();
                        logger_1.logger.error('Error detecting equipment conflicts', { error: error_4, equipmentIds: equipmentIds });
                        throw error_4;
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Detecta incompatibilidade de habilidades
     */
    ConflictDetectionEngine.prototype.detectSkillMismatch = function (staffId, serviceId, clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            var conflicts, staffData, serviceData, staffSpecialties_1, requiredSpecialties, missingSpecialties, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        conflicts = [];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.supabase
                                .from('staff')
                                .select('id, name, specialties')
                                .eq('id', staffId)
                                .single()
                            // Buscar requisitos do serviço
                        ];
                    case 2:
                        staffData = (_a.sent()).data;
                        return [4 /*yield*/, this.supabase
                                .from('services')
                                .select('id, name, required_specialties')
                                .eq('id', serviceId)
                                .single()];
                    case 3:
                        serviceData = (_a.sent()).data;
                        if (staffData && serviceData) {
                            staffSpecialties_1 = staffData.specialties || [];
                            requiredSpecialties = serviceData.required_specialties || [];
                            missingSpecialties = requiredSpecialties.filter(function (specialty) { return !staffSpecialties_1.includes(specialty); });
                            if (missingSpecialties.length > 0) {
                                conflicts.push({
                                    id: "skill_mismatch_".concat(staffId, "_").concat(serviceId, "_").concat(Date.now()),
                                    type: ConflictType.STAFF_SKILL_MISMATCH,
                                    severity: 'high',
                                    description: "Staff ".concat(staffData.name, " lacks required specialties: ").concat(missingSpecialties.join(', ')),
                                    affectedAppointments: [],
                                    affectedResources: [{
                                            id: staffId,
                                            type: 'staff',
                                            name: staffData.name,
                                            conflictReason: "Missing specialties: ".concat(missingSpecialties.join(', '))
                                        }],
                                    detectedAt: new Date(),
                                    autoResolvable: true
                                });
                            }
                        }
                        return [2 /*return*/, conflicts];
                    case 4:
                        error_5 = _a.sent();
                        logger_1.logger.error('Error detecting skill mismatch', { error: error_5, staffId: staffId, serviceId: serviceId });
                        return [2 /*return*/, []];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Detecta violações de break time
     */
    ConflictDetectionEngine.prototype.detectBreakTimeViolations = function (staffId, startTime, endTime, clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            var conflicts, breakTimes, _i, breakTimes_1, breakTime, breakStart, breakEnd, staffData, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        conflicts = [];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, , 8]);
                        return [4 /*yield*/, this.supabase
                                .from('staff_break_times')
                                .select('*')
                                .eq('staff_id', staffId)
                                .eq('clinic_id', clinicId)];
                    case 2:
                        breakTimes = (_a.sent()).data;
                        if (!breakTimes) return [3 /*break*/, 6];
                        _i = 0, breakTimes_1 = breakTimes;
                        _a.label = 3;
                    case 3:
                        if (!(_i < breakTimes_1.length)) return [3 /*break*/, 6];
                        breakTime = breakTimes_1[_i];
                        breakStart = new Date(breakTime.start_time);
                        breakEnd = new Date(breakTime.end_time);
                        if (!(startTime < breakEnd && endTime > breakStart)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.supabase
                                .from('staff')
                                .select('name')
                                .eq('id', staffId)
                                .single()];
                    case 4:
                        staffData = (_a.sent()).data;
                        conflicts.push({
                            id: "break_violation_".concat(staffId, "_").concat(Date.now()),
                            type: ConflictType.STAFF_BREAK_VIOLATION,
                            severity: 'medium',
                            description: "Appointment conflicts with ".concat((staffData === null || staffData === void 0 ? void 0 : staffData.name) || 'staff', " break time"),
                            affectedAppointments: [],
                            affectedResources: [{
                                    id: staffId,
                                    type: 'staff',
                                    name: (staffData === null || staffData === void 0 ? void 0 : staffData.name) || 'Unknown Staff',
                                    conflictReason: 'Conflicts with break time'
                                }],
                            detectedAt: new Date(),
                            autoResolvable: true
                        });
                        _a.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6: return [2 /*return*/, conflicts];
                    case 7:
                        error_6 = _a.sent();
                        logger_1.logger.error('Error detecting break time violations', { error: error_6, staffId: staffId });
                        return [2 /*return*/, []];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Calcula severidade geral dos conflitos
     */
    ConflictDetectionEngine.prototype.calculateOverallSeverity = function (conflicts) {
        if (conflicts.length === 0)
            return 'low';
        var severityScores = {
            low: 1,
            medium: 2,
            high: 3,
            critical: 4
        };
        var maxSeverity = Math.max.apply(Math, conflicts.map(function (c) { return severityScores[c.severity]; }));
        var criticalCount = conflicts.filter(function (c) { return c.severity === 'critical'; }).length;
        var highCount = conflicts.filter(function (c) { return c.severity === 'high'; }).length;
        if (criticalCount > 0 || highCount >= 3)
            return 'critical';
        if (maxSeverity >= 3)
            return 'high';
        if (maxSeverity >= 2)
            return 'medium';
        return 'low';
    };
    /**
     * Gera ações sugeridas baseadas nos conflitos
     */
    ConflictDetectionEngine.prototype.generateSuggestedActions = function (conflicts) {
        var actions = [];
        var conflictTypes = new Set(conflicts.map(function (c) { return c.type; }));
        if (conflictTypes.has(ConflictType.STAFF_DOUBLE_BOOKING)) {
            actions.push('Reassign staff member to available time slot');
            actions.push('Find alternative qualified staff member');
        }
        if (conflictTypes.has(ConflictType.ROOM_OVERLAP)) {
            actions.push('Assign alternative room');
            actions.push('Reschedule to available time slot');
        }
        if (conflictTypes.has(ConflictType.EQUIPMENT_UNAVAILABLE)) {
            actions.push('Use alternative equipment if available');
            actions.push('Reschedule when equipment is available');
        }
        if (conflictTypes.has(ConflictType.STAFF_SKILL_MISMATCH)) {
            actions.push('Assign qualified staff member');
            actions.push('Provide additional training if needed');
        }
        if (conflictTypes.has(ConflictType.EQUIPMENT_MAINTENANCE)) {
            actions.push('Wait for maintenance completion');
            actions.push('Use backup equipment if available');
        }
        if (conflictTypes.has(ConflictType.STAFF_BREAK_VIOLATION)) {
            actions.push('Reschedule outside break time');
            actions.push('Adjust break schedule if possible');
        }
        return actions;
    };
    /**
     * Detecta conflitos para múltiplos agendamentos
     */
    ConflictDetectionEngine.prototype.detectBatchConflicts = function (appointments, clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            var results, _i, appointments_1, appointment, result, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        results = [];
                        _i = 0, appointments_1 = appointments;
                        _a.label = 1;
                    case 1:
                        if (!(_i < appointments_1.length)) return [3 /*break*/, 6];
                        appointment = appointments_1[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.detectConflictsForNewAppointment(appointment, clinicId)];
                    case 3:
                        result = _a.sent();
                        results.push(result);
                        return [3 /*break*/, 5];
                    case 4:
                        error_7 = _a.sent();
                        logger_1.logger.error('Error in batch conflict detection', { error: error_7, appointment: appointment });
                        results.push({
                            hasConflicts: true,
                            conflicts: [{
                                    id: "error_".concat(Date.now()),
                                    type: ConflictType.STAFF_DOUBLE_BOOKING,
                                    severity: 'critical',
                                    description: 'Error during conflict detection',
                                    affectedAppointments: [],
                                    affectedResources: [],
                                    detectedAt: new Date(),
                                    autoResolvable: false
                                }],
                            severity: 'critical',
                            affectedResources: [],
                            suggestedActions: ['Review appointment data and try again']
                        });
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/, results];
                }
            });
        });
    };
    /**
     * Atualiza configuração do engine
     */
    ConflictDetectionEngine.prototype.updateConfig = function (newConfig) {
        this.config = __assign(__assign({}, this.config), newConfig);
        logger_1.logger.info('Conflict detection config updated', { config: this.config });
    };
    /**
     * Obtém configuração atual
     */
    ConflictDetectionEngine.prototype.getConfig = function () {
        return __assign({}, this.config);
    };
    return ConflictDetectionEngine;
}());
exports.ConflictDetectionEngine = ConflictDetectionEngine;
// Instância singleton para uso global
var createconflictDetectionEngine = function () { return new ConflictDetectionEngine(); };
exports.createconflictDetectionEngine = createconflictDetectionEngine;
// Função utilitária para detecção rápida
function detectConflicts(appointmentData, clinicId, config) {
    return __awaiter(this, void 0, void 0, function () {
        var engine;
        return __generator(this, function (_a) {
            engine = config ? new ConflictDetectionEngine(config) : conflictDetectionEngine;
            return [2 /*return*/, engine.detectConflictsForNewAppointment(appointmentData, clinicId)];
        });
    });
}
exports.default = ConflictDetectionEngine;
