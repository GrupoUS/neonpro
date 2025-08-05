var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
var __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
var __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    var _ = {
        label: 0,
        sent: () => {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return (v) => step([n, v]);
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.createsuggestionEngine = exports.SuggestionEngine = exports.SuggestionType = void 0;
exports.generateResolutionSuggestions = generateResolutionSuggestions;
var client_1 = require("@/lib/supabase/client");
var logger_1 = require("@/lib/logger");
var conflict_detection_engine_1 = require("./conflict-detection-engine");
var SuggestionType;
((SuggestionType) => {
  SuggestionType["RESCHEDULE_APPOINTMENT"] = "reschedule_appointment";
  SuggestionType["REASSIGN_STAFF"] = "reassign_staff";
  SuggestionType["CHANGE_ROOM"] = "change_room";
  SuggestionType["SUBSTITUTE_EQUIPMENT"] = "substitute_equipment";
  SuggestionType["SPLIT_APPOINTMENT"] = "split_appointment";
  SuggestionType["MERGE_APPOINTMENTS"] = "merge_appointments";
  SuggestionType["ADJUST_DURATION"] = "adjust_duration";
  SuggestionType["ADD_BUFFER_TIME"] = "add_buffer_time";
  SuggestionType["OPTIMIZE_SCHEDULE"] = "optimize_schedule";
})(SuggestionType || (exports.SuggestionType = SuggestionType = {}));
/**
 * Engine de Sugestões Automatizadas
 * Gera sugestões inteligentes para resolução de conflitos
 */
var SuggestionEngine = /** @class */ (() => {
  function SuggestionEngine(config) {
    if (config === void 0) {
      config = {};
    }
    this.supabase = (0, client_1.createClient)();
    this.config = __assign(
      {
        enableAutoSuggestions: true,
        maxSuggestionsPerConflict: 5,
        prioritizePatientPreference: true,
        considerStaffPreferences: true,
        allowOvertimeScheduling: false,
        maxRescheduleDistance: 7,
        minConfidenceThreshold: 70,
        enableCostOptimization: true,
      },
      config,
    );
  }
  /**
   * Gera sugestões para resolver conflitos detectados
   */
  SuggestionEngine.prototype.generateSuggestions = function (
    conflictResult,
    appointmentData,
    clinicId,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var suggestions,
        _i,
        _a,
        conflict,
        conflictSuggestions,
        optimizationSuggestions,
        filteredSuggestions,
        error_1;
      var _this = this;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 6, , 7]);
            logger_1.logger.info("Generating resolution suggestions", {
              conflictCount: conflictResult.conflicts.length,
              severity: conflictResult.severity,
            });
            if (!conflictResult.hasConflicts) {
              return [2 /*return*/, []];
            }
            suggestions = [];
            (_i = 0), (_a = conflictResult.conflicts);
            _b.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 4];
            conflict = _a[_i];
            return [
              4 /*yield*/,
              this.generateSuggestionsForConflict(conflict, appointmentData, clinicId),
            ];
          case 2:
            conflictSuggestions = _b.sent();
            suggestions.push.apply(suggestions, conflictSuggestions);
            _b.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            return [
              4 /*yield*/,
              this.generateOptimizationSuggestions(conflictResult, appointmentData, clinicId),
            ];
          case 5:
            optimizationSuggestions = _b.sent();
            suggestions.push.apply(suggestions, optimizationSuggestions);
            filteredSuggestions = suggestions
              .filter((s) => s.confidence >= _this.config.minConfidenceThreshold)
              .sort((a, b) => {
                // Ordenar por prioridade e depois por confiança
                var priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                var priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
                if (priorityDiff !== 0) return priorityDiff;
                return b.confidence - a.confidence;
              })
              .slice(0, this.config.maxSuggestionsPerConflict * conflictResult.conflicts.length);
            logger_1.logger.info("Generated suggestions", {
              totalSuggestions: filteredSuggestions.length,
              autoApplicable: filteredSuggestions.filter((s) => s.autoApplicable).length,
            });
            return [2 /*return*/, filteredSuggestions];
          case 6:
            error_1 = _b.sent();
            logger_1.logger.error("Error generating suggestions", {
              error: error_1,
              conflictResult: conflictResult,
            });
            throw error_1;
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Gera sugestões específicas para um conflito
   */
  SuggestionEngine.prototype.generateSuggestionsForConflict = function (
    conflict,
    appointmentData,
    clinicId,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var suggestions, _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
      return __generator(this, function (_v) {
        switch (_v.label) {
          case 0:
            suggestions = [];
            _a = conflict.type;
            switch (_a) {
              case conflict_detection_engine_1.ConflictType.STAFF_DOUBLE_BOOKING:
                return [3 /*break*/, 1];
              case conflict_detection_engine_1.ConflictType.ROOM_OVERLAP:
                return [3 /*break*/, 3];
              case conflict_detection_engine_1.ConflictType.EQUIPMENT_UNAVAILABLE:
                return [3 /*break*/, 5];
              case conflict_detection_engine_1.ConflictType.STAFF_SKILL_MISMATCH:
                return [3 /*break*/, 7];
              case conflict_detection_engine_1.ConflictType.STAFF_BREAK_VIOLATION:
                return [3 /*break*/, 9];
              case conflict_detection_engine_1.ConflictType.EQUIPMENT_MAINTENANCE:
                return [3 /*break*/, 11];
            }
            return [3 /*break*/, 13];
          case 1:
            _c = (_b = suggestions.push).apply;
            _d = [suggestions];
            return [
              4 /*yield*/,
              this.generateStaffConflictSuggestions(conflict, appointmentData, clinicId),
            ];
          case 2:
            _c.apply(_b, _d.concat([_v.sent()]));
            return [3 /*break*/, 14];
          case 3:
            _f = (_e = suggestions.push).apply;
            _g = [suggestions];
            return [
              4 /*yield*/,
              this.generateRoomConflictSuggestions(conflict, appointmentData, clinicId),
            ];
          case 4:
            _f.apply(_e, _g.concat([_v.sent()]));
            return [3 /*break*/, 14];
          case 5:
            _j = (_h = suggestions.push).apply;
            _k = [suggestions];
            return [
              4 /*yield*/,
              this.generateEquipmentConflictSuggestions(conflict, appointmentData, clinicId),
            ];
          case 6:
            _j.apply(_h, _k.concat([_v.sent()]));
            return [3 /*break*/, 14];
          case 7:
            _m = (_l = suggestions.push).apply;
            _o = [suggestions];
            return [
              4 /*yield*/,
              this.generateSkillMismatchSuggestions(conflict, appointmentData, clinicId),
            ];
          case 8:
            _m.apply(_l, _o.concat([_v.sent()]));
            return [3 /*break*/, 14];
          case 9:
            _q = (_p = suggestions.push).apply;
            _r = [suggestions];
            return [
              4 /*yield*/,
              this.generateBreakViolationSuggestions(conflict, appointmentData, clinicId),
            ];
          case 10:
            _q.apply(_p, _r.concat([_v.sent()]));
            return [3 /*break*/, 14];
          case 11:
            _t = (_s = suggestions.push).apply;
            _u = [suggestions];
            return [
              4 /*yield*/,
              this.generateMaintenanceSuggestions(conflict, appointmentData, clinicId),
            ];
          case 12:
            _t.apply(_s, _u.concat([_v.sent()]));
            return [3 /*break*/, 14];
          case 13:
            logger_1.logger.warn("Unknown conflict type", { conflictType: conflict.type });
            _v.label = 14;
          case 14:
            return [2 /*return*/, suggestions];
        }
      });
    });
  };
  /**
   * Gera sugestões para conflitos de staff
   */
  SuggestionEngine.prototype.generateStaffConflictSuggestions = function (
    conflict,
    appointmentData,
    clinicId,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var suggestions, alternativeStaff, _i, _a, staff, availableSlots, _b, _c, slot, error_2;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            suggestions = [];
            _d.label = 1;
          case 1:
            _d.trys.push([1, 4, , 5]);
            return [
              4 /*yield*/,
              this.findAlternativeStaff(
                appointmentData.service_id,
                new Date(appointmentData.start_time),
                new Date(appointmentData.end_time),
                clinicId,
                appointmentData.staff_id,
              ),
            ];
          case 2:
            alternativeStaff = _d.sent();
            if (alternativeStaff.length > 0) {
              for (_i = 0, _a = alternativeStaff.slice(0, 3); _i < _a.length; _i++) {
                staff = _a[_i];
                suggestions.push({
                  id: "reassign_staff_".concat(staff.id, "_").concat(Date.now()),
                  type: SuggestionType.REASSIGN_STAFF,
                  priority: "high",
                  title: "Reassign to ".concat(staff.name),
                  description: "Assign appointment to ".concat(
                    staff.name,
                    " who is available at the requested time",
                  ),
                  impact: {
                    resolvedConflicts: 1,
                    affectedAppointments: [appointmentData.id],
                    resourceChanges: [
                      {
                        resourceId: staff.id,
                        resourceType: "staff",
                        changeType: "reassign",
                        from: appointmentData.staff_id,
                        to: staff.id,
                        reason: "Resolve staff double booking",
                      },
                    ],
                    timeChanges: [],
                    costImpact: 0,
                  },
                  implementation: {
                    steps: [
                      {
                        order: 1,
                        action: "update_appointment_staff",
                        description: "Update appointment staff from "
                          .concat(appointmentData.staff_id, " to ")
                          .concat(staff.id),
                        automated: true,
                        estimatedDuration: 1,
                        dependencies: [],
                      },
                      {
                        order: 2,
                        action: "notify_stakeholders",
                        description: "Notify patient and staff about the change",
                        automated: true,
                        estimatedDuration: 2,
                        dependencies: ["update_appointment_staff"],
                      },
                    ],
                    requiredApprovals: [],
                    automationLevel: "full-auto",
                    rollbackPlan: ["Revert staff assignment", "Notify stakeholders of reversion"],
                  },
                  estimatedTime: 3,
                  confidence: staff.confidence || 85,
                  autoApplicable: true,
                  conflictIds: [conflict.id],
                });
              }
            }
            return [
              4 /*yield*/,
              this.findAvailableTimeSlots(
                appointmentData.staff_id,
                appointmentData.service_id,
                new Date(appointmentData.start_time),
                clinicId,
                this.config.maxRescheduleDistance,
              ),
            ];
          case 3:
            availableSlots = _d.sent();
            if (availableSlots.length > 0) {
              for (_b = 0, _c = availableSlots.slice(0, 3); _b < _c.length; _b++) {
                slot = _c[_b];
                suggestions.push({
                  id: "reschedule_".concat(slot.start.getTime(), "_").concat(Date.now()),
                  type: SuggestionType.RESCHEDULE_APPOINTMENT,
                  priority: "medium",
                  title: "Reschedule to "
                    .concat(slot.start.toLocaleDateString(), " ")
                    .concat(slot.start.toLocaleTimeString()),
                  description: "Move appointment to available time slot",
                  impact: {
                    resolvedConflicts: 1,
                    affectedAppointments: [appointmentData.id],
                    resourceChanges: [],
                    timeChanges: [
                      {
                        appointmentId: appointmentData.id,
                        originalStart: new Date(appointmentData.start_time),
                        originalEnd: new Date(appointmentData.end_time),
                        suggestedStart: slot.start,
                        suggestedEnd: slot.end,
                        reason: "Resolve staff conflict",
                      },
                    ],
                    costImpact: 0,
                  },
                  implementation: {
                    steps: [
                      {
                        order: 1,
                        action: "update_appointment_time",
                        description: "Update appointment time to ".concat(slot.start.toISOString()),
                        automated: true,
                        estimatedDuration: 1,
                        dependencies: [],
                      },
                      {
                        order: 2,
                        action: "notify_patient",
                        description: "Notify patient about schedule change",
                        automated: true,
                        estimatedDuration: 2,
                        dependencies: ["update_appointment_time"],
                      },
                    ],
                    requiredApprovals: ["patient_consent"],
                    automationLevel: "semi-auto",
                    rollbackPlan: ["Revert to original time", "Notify patient of reversion"],
                  },
                  estimatedTime: 5,
                  confidence: slot.confidence || 80,
                  autoApplicable: false,
                  conflictIds: [conflict.id],
                });
              }
            }
            return [2 /*return*/, suggestions];
          case 4:
            error_2 = _d.sent();
            logger_1.logger.error("Error generating staff conflict suggestions", {
              error: error_2,
              conflict: conflict,
            });
            return [2 /*return*/, []];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Gera sugestões para conflitos de sala
   */
  SuggestionEngine.prototype.generateRoomConflictSuggestions = function (
    conflict,
    appointmentData,
    clinicId,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var suggestions, alternativeRooms, _i, _a, room, error_3;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            suggestions = [];
            _b.label = 1;
          case 1:
            _b.trys.push([1, 3, , 4]);
            return [
              4 /*yield*/,
              this.findAlternativeRooms(
                appointmentData.service_id,
                new Date(appointmentData.start_time),
                new Date(appointmentData.end_time),
                clinicId,
                appointmentData.room_id,
              ),
            ];
          case 2:
            alternativeRooms = _b.sent();
            if (alternativeRooms.length > 0) {
              for (_i = 0, _a = alternativeRooms.slice(0, 3); _i < _a.length; _i++) {
                room = _a[_i];
                suggestions.push({
                  id: "change_room_".concat(room.id, "_").concat(Date.now()),
                  type: SuggestionType.CHANGE_ROOM,
                  priority: "medium",
                  title: "Change to ".concat(room.name),
                  description: "Use ".concat(
                    room.name,
                    " which is available at the requested time",
                  ),
                  impact: {
                    resolvedConflicts: 1,
                    affectedAppointments: [appointmentData.id],
                    resourceChanges: [
                      {
                        resourceId: room.id,
                        resourceType: "room",
                        changeType: "reassign",
                        from: appointmentData.room_id,
                        to: room.id,
                        reason: "Resolve room conflict",
                      },
                    ],
                    timeChanges: [],
                    costImpact: 0,
                  },
                  implementation: {
                    steps: [
                      {
                        order: 1,
                        action: "update_appointment_room",
                        description: "Update appointment room to ".concat(room.name),
                        automated: true,
                        estimatedDuration: 1,
                        dependencies: [],
                      },
                      {
                        order: 2,
                        action: "notify_staff",
                        description: "Notify staff about room change",
                        automated: true,
                        estimatedDuration: 1,
                        dependencies: ["update_appointment_room"],
                      },
                    ],
                    requiredApprovals: [],
                    automationLevel: "full-auto",
                    rollbackPlan: ["Revert room assignment"],
                  },
                  estimatedTime: 2,
                  confidence: room.confidence || 90,
                  autoApplicable: true,
                  conflictIds: [conflict.id],
                });
              }
            }
            return [2 /*return*/, suggestions];
          case 3:
            error_3 = _b.sent();
            logger_1.logger.error("Error generating room conflict suggestions", {
              error: error_3,
              conflict: conflict,
            });
            return [2 /*return*/, []];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Gera sugestões para conflitos de equipamento
   */
  SuggestionEngine.prototype.generateEquipmentConflictSuggestions = function (
    conflict,
    appointmentData,
    clinicId,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var suggestions,
        requiredEquipment,
        _i,
        requiredEquipment_1,
        equipmentId,
        alternatives,
        _a,
        _b,
        equipment,
        error_4;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            suggestions = [];
            _c.label = 1;
          case 1:
            _c.trys.push([1, 6, , 7]);
            requiredEquipment = appointmentData.required_equipment || [];
            (_i = 0), (requiredEquipment_1 = requiredEquipment);
            _c.label = 2;
          case 2:
            if (!(_i < requiredEquipment_1.length)) return [3 /*break*/, 5];
            equipmentId = requiredEquipment_1[_i];
            return [
              4 /*yield*/,
              this.findAlternativeEquipment(
                equipmentId,
                new Date(appointmentData.start_time),
                new Date(appointmentData.end_time),
                clinicId,
              ),
            ];
          case 3:
            alternatives = _c.sent();
            if (alternatives.length > 0) {
              for (_a = 0, _b = alternatives.slice(0, 2); _a < _b.length; _a++) {
                equipment = _b[_a];
                suggestions.push({
                  id: "substitute_equipment_".concat(equipment.id, "_").concat(Date.now()),
                  type: SuggestionType.SUBSTITUTE_EQUIPMENT,
                  priority: "medium",
                  title: "Use ".concat(equipment.name, " instead"),
                  description: "Substitute with ".concat(equipment.name, " which is available"),
                  impact: {
                    resolvedConflicts: 1,
                    affectedAppointments: [appointmentData.id],
                    resourceChanges: [
                      {
                        resourceId: equipment.id,
                        resourceType: "equipment",
                        changeType: "substitute",
                        from: equipmentId,
                        to: equipment.id,
                        reason: "Equipment unavailable",
                      },
                    ],
                    timeChanges: [],
                    costImpact: 0,
                  },
                  implementation: {
                    steps: [
                      {
                        order: 1,
                        action: "update_required_equipment",
                        description: "Replace ".concat(equipmentId, " with ").concat(equipment.id),
                        automated: true,
                        estimatedDuration: 1,
                        dependencies: [],
                      },
                    ],
                    requiredApprovals: [],
                    automationLevel: "full-auto",
                    rollbackPlan: ["Revert equipment assignment"],
                  },
                  estimatedTime: 1,
                  confidence: equipment.confidence || 85,
                  autoApplicable: true,
                  conflictIds: [conflict.id],
                });
              }
            }
            _c.label = 4;
          case 4:
            _i++;
            return [3 /*break*/, 2];
          case 5:
            return [2 /*return*/, suggestions];
          case 6:
            error_4 = _c.sent();
            logger_1.logger.error("Error generating equipment conflict suggestions", {
              error: error_4,
              conflict: conflict,
            });
            return [2 /*return*/, []];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Gera sugestões para incompatibilidade de habilidades
   */
  SuggestionEngine.prototype.generateSkillMismatchSuggestions = function (
    conflict,
    appointmentData,
    clinicId,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var suggestions, qualifiedStaff, _i, _a, staff, error_5;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            suggestions = [];
            _b.label = 1;
          case 1:
            _b.trys.push([1, 3, , 4]);
            return [
              4 /*yield*/,
              this.findQualifiedStaff(
                appointmentData.service_id,
                new Date(appointmentData.start_time),
                new Date(appointmentData.end_time),
                clinicId,
              ),
            ];
          case 2:
            qualifiedStaff = _b.sent();
            if (qualifiedStaff.length > 0) {
              for (_i = 0, _a = qualifiedStaff.slice(0, 3); _i < _a.length; _i++) {
                staff = _a[_i];
                suggestions.push({
                  id: "assign_qualified_staff_".concat(staff.id, "_").concat(Date.now()),
                  type: SuggestionType.REASSIGN_STAFF,
                  priority: "high",
                  title: "Assign to qualified ".concat(staff.name),
                  description: "Assign to ".concat(staff.name, " who has the required specialties"),
                  impact: {
                    resolvedConflicts: 1,
                    affectedAppointments: [appointmentData.id],
                    resourceChanges: [
                      {
                        resourceId: staff.id,
                        resourceType: "staff",
                        changeType: "reassign",
                        from: appointmentData.staff_id,
                        to: staff.id,
                        reason: "Staff lacks required skills",
                      },
                    ],
                    timeChanges: [],
                    costImpact: 0,
                  },
                  implementation: {
                    steps: [
                      {
                        order: 1,
                        action: "update_appointment_staff",
                        description: "Assign appointment to qualified staff ".concat(staff.name),
                        automated: true,
                        estimatedDuration: 1,
                        dependencies: [],
                      },
                    ],
                    requiredApprovals: [],
                    automationLevel: "full-auto",
                    rollbackPlan: ["Revert staff assignment"],
                  },
                  estimatedTime: 1,
                  confidence: 95,
                  autoApplicable: true,
                  conflictIds: [conflict.id],
                });
              }
            }
            return [2 /*return*/, suggestions];
          case 3:
            error_5 = _b.sent();
            logger_1.logger.error("Error generating skill mismatch suggestions", {
              error: error_5,
              conflict: conflict,
            });
            return [2 /*return*/, []];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Gera sugestões para violações de break time
   */
  SuggestionEngine.prototype.generateBreakViolationSuggestions = function (
    conflict,
    appointmentData,
    clinicId,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var suggestions, availableSlots, _i, _a, slot, error_6;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            suggestions = [];
            _b.label = 1;
          case 1:
            _b.trys.push([1, 3, , 4]);
            return [
              4 /*yield*/,
              this.findSlotsOutsideBreakTime(
                appointmentData.staff_id,
                appointmentData.service_id,
                new Date(appointmentData.start_time),
                clinicId,
              ),
            ];
          case 2:
            availableSlots = _b.sent();
            if (availableSlots.length > 0) {
              for (_i = 0, _a = availableSlots.slice(0, 3); _i < _a.length; _i++) {
                slot = _a[_i];
                suggestions.push({
                  id: "reschedule_outside_break_"
                    .concat(slot.start.getTime(), "_")
                    .concat(Date.now()),
                  type: SuggestionType.RESCHEDULE_APPOINTMENT,
                  priority: "medium",
                  title: "Reschedule outside break time",
                  description: "Move to ".concat(
                    slot.start.toLocaleTimeString(),
                    " to avoid break conflict",
                  ),
                  impact: {
                    resolvedConflicts: 1,
                    affectedAppointments: [appointmentData.id],
                    resourceChanges: [],
                    timeChanges: [
                      {
                        appointmentId: appointmentData.id,
                        originalStart: new Date(appointmentData.start_time),
                        originalEnd: new Date(appointmentData.end_time),
                        suggestedStart: slot.start,
                        suggestedEnd: slot.end,
                        reason: "Avoid break time conflict",
                      },
                    ],
                    costImpact: 0,
                  },
                  implementation: {
                    steps: [
                      {
                        order: 1,
                        action: "update_appointment_time",
                        description: "Reschedule to ".concat(slot.start.toISOString()),
                        automated: true,
                        estimatedDuration: 1,
                        dependencies: [],
                      },
                    ],
                    requiredApprovals: ["patient_consent"],
                    automationLevel: "semi-auto",
                    rollbackPlan: ["Revert to original time"],
                  },
                  estimatedTime: 3,
                  confidence: 85,
                  autoApplicable: false,
                  conflictIds: [conflict.id],
                });
              }
            }
            return [2 /*return*/, suggestions];
          case 3:
            error_6 = _b.sent();
            logger_1.logger.error("Error generating break violation suggestions", {
              error: error_6,
              conflict: conflict,
            });
            return [2 /*return*/, []];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Gera sugestões para equipamentos em manutenção
   */
  SuggestionEngine.prototype.generateMaintenanceSuggestions = function (
    conflict,
    appointmentData,
    clinicId,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var suggestions, maintenanceEnd, suggestedStart, duration, suggestedEnd, error_7;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            suggestions = [];
            _b.label = 1;
          case 1:
            _b.trys.push([1, 3, , 4]);
            return [
              4 /*yield*/,
              this.getMaintenanceEndTime(
                (_a = conflict.affectedResources[0]) === null || _a === void 0 ? void 0 : _a.id,
                clinicId,
              ),
            ];
          case 2:
            maintenanceEnd = _b.sent();
            if (maintenanceEnd) {
              suggestedStart = new Date(maintenanceEnd.getTime() + 30 * 60 * 1000); // 30 min buffer
              duration =
                new Date(appointmentData.end_time).getTime() -
                new Date(appointmentData.start_time).getTime();
              suggestedEnd = new Date(suggestedStart.getTime() + duration);
              suggestions.push({
                id: "reschedule_after_maintenance_".concat(Date.now()),
                type: SuggestionType.RESCHEDULE_APPOINTMENT,
                priority: "low",
                title: "Reschedule after maintenance",
                description: "Schedule after equipment maintenance completes",
                impact: {
                  resolvedConflicts: 1,
                  affectedAppointments: [appointmentData.id],
                  resourceChanges: [],
                  timeChanges: [
                    {
                      appointmentId: appointmentData.id,
                      originalStart: new Date(appointmentData.start_time),
                      originalEnd: new Date(appointmentData.end_time),
                      suggestedStart: suggestedStart,
                      suggestedEnd: suggestedEnd,
                      reason: "Wait for maintenance completion",
                    },
                  ],
                  costImpact: 0,
                },
                implementation: {
                  steps: [
                    {
                      order: 1,
                      action: "update_appointment_time",
                      description: "Reschedule to ".concat(suggestedStart.toISOString()),
                      automated: true,
                      estimatedDuration: 1,
                      dependencies: [],
                    },
                  ],
                  requiredApprovals: ["patient_consent"],
                  automationLevel: "semi-auto",
                  rollbackPlan: ["Revert to original time"],
                },
                estimatedTime: 5,
                confidence: 70,
                autoApplicable: false,
                conflictIds: [conflict.id],
              });
            }
            return [2 /*return*/, suggestions];
          case 3:
            error_7 = _b.sent();
            logger_1.logger.error("Error generating maintenance suggestions", {
              error: error_7,
              conflict: conflict,
            });
            return [2 /*return*/, []];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Gera sugestões de otimização global
   */
  SuggestionEngine.prototype.generateOptimizationSuggestions = function (
    conflictResult,
    appointmentData,
    clinicId,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var suggestions;
      return __generator(this, (_a) => {
        suggestions = [];
        try {
          // Sugestão de otimização de agenda
          if (conflictResult.conflicts.length >= 3) {
            suggestions.push({
              id: "optimize_schedule_".concat(Date.now()),
              type: SuggestionType.OPTIMIZE_SCHEDULE,
              priority: "high",
              title: "Optimize entire schedule",
              description: "Reorganize multiple appointments for optimal resource utilization",
              impact: {
                resolvedConflicts: conflictResult.conflicts.length,
                affectedAppointments: conflictResult.conflicts.flatMap(
                  (c) => c.affectedAppointments,
                ),
                resourceChanges: [],
                timeChanges: [],
                costImpact: 0,
              },
              implementation: {
                steps: [
                  {
                    order: 1,
                    action: "analyze_schedule",
                    description: "Analyze current schedule for optimization opportunities",
                    automated: true,
                    estimatedDuration: 5,
                    dependencies: [],
                  },
                  {
                    order: 2,
                    action: "generate_optimized_schedule",
                    description: "Generate optimized schedule proposal",
                    automated: true,
                    estimatedDuration: 10,
                    dependencies: ["analyze_schedule"],
                  },
                  {
                    order: 3,
                    action: "apply_optimization",
                    description: "Apply optimized schedule",
                    automated: false,
                    estimatedDuration: 15,
                    dependencies: ["generate_optimized_schedule"],
                  },
                ],
                requiredApprovals: ["manager_approval", "affected_patients_consent"],
                automationLevel: "semi-auto",
                rollbackPlan: ["Revert to original schedule", "Notify all affected parties"],
              },
              estimatedTime: 30,
              confidence: 75,
              autoApplicable: false,
              conflictIds: conflictResult.conflicts.map((c) => c.id),
            });
          }
          return [2 /*return*/, suggestions];
        } catch (error) {
          logger_1.logger.error("Error generating optimization suggestions", {
            error: error,
            conflictResult: conflictResult,
          });
          return [2 /*return*/, []];
        }
        return [2 /*return*/];
      });
    });
  };
  // Métodos auxiliares para busca de recursos alternativos
  SuggestionEngine.prototype.findAlternativeStaff = function (
    serviceId,
    startTime,
    endTime,
    clinicId,
    excludeStaffId,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var query,
        _a,
        staffList,
        error,
        availableStaff,
        _loop_1,
        this_1,
        _i,
        staffList_1,
        staff,
        error_8;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 6, , 7]);
            query = this.supabase
              .from("staff")
              .select(
                "\n          id, name, specialties, hourly_rate,\n          staff_availability(*)\n        ",
              )
              .eq("clinic_id", clinicId)
              .eq("active", true);
            if (excludeStaffId) {
              query = query.neq("id", excludeStaffId);
            }
            return [4 /*yield*/, query];
          case 1:
            (_a = _b.sent()), (staffList = _a.data), (error = _a.error);
            if (error || !staffList) {
              logger_1.logger.error("Error fetching alternative staff", { error: error });
              return [2 /*return*/, []];
            }
            availableStaff = [];
            _loop_1 = function (staff) {
              var serviceData,
                requiredSpecialties,
                staffSpecialties_1,
                hasRequiredSkills,
                isAvailable;
              return __generator(this, (_c) => {
                switch (_c.label) {
                  case 0:
                    return [
                      4 /*yield*/,
                      this_1.supabase
                        .from("services")
                        .select("required_specialties")
                        .eq("id", serviceId)
                        .single(),
                    ];
                  case 1:
                    serviceData = _c.sent().data;
                    if (
                      serviceData === null || serviceData === void 0
                        ? void 0
                        : serviceData.required_specialties
                    ) {
                      requiredSpecialties = serviceData.required_specialties;
                      staffSpecialties_1 = staff.specialties || [];
                      hasRequiredSkills = requiredSpecialties.every((specialty) =>
                        staffSpecialties_1.includes(specialty),
                      );
                      if (!hasRequiredSkills) return [2 /*return*/, "continue"];
                    }
                    return [
                      4 /*yield*/,
                      this_1.checkStaffAvailability(staff.id, startTime, endTime, clinicId),
                    ];
                  case 2:
                    isAvailable = _c.sent();
                    if (isAvailable) {
                      availableStaff.push(
                        __assign(__assign({}, staff), {
                          confidence: 85, // Base confidence, pode ser ajustada
                        }),
                      );
                    }
                    return [2 /*return*/];
                }
              });
            };
            this_1 = this;
            (_i = 0), (staffList_1 = staffList);
            _b.label = 2;
          case 2:
            if (!(_i < staffList_1.length)) return [3 /*break*/, 5];
            staff = staffList_1[_i];
            return [5 /*yield**/, _loop_1(staff)];
          case 3:
            _b.sent();
            _b.label = 4;
          case 4:
            _i++;
            return [3 /*break*/, 2];
          case 5:
            return [2 /*return*/, availableStaff];
          case 6:
            error_8 = _b.sent();
            logger_1.logger.error("Error finding alternative staff", { error: error_8 });
            return [2 /*return*/, []];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  SuggestionEngine.prototype.findAlternativeRooms = function (
    serviceId,
    startTime,
    endTime,
    clinicId,
    excludeRoomId,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var query, _a, rooms, error, availableRooms, _i, rooms_1, room, isAvailable, error_9;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 6, , 7]);
            query = this.supabase
              .from("rooms")
              .select("*")
              .eq("clinic_id", clinicId)
              .eq("active", true);
            if (excludeRoomId) {
              query = query.neq("id", excludeRoomId);
            }
            return [4 /*yield*/, query];
          case 1:
            (_a = _b.sent()), (rooms = _a.data), (error = _a.error);
            if (error || !rooms) {
              logger_1.logger.error("Error fetching alternative rooms", { error: error });
              return [2 /*return*/, []];
            }
            availableRooms = [];
            (_i = 0), (rooms_1 = rooms);
            _b.label = 2;
          case 2:
            if (!(_i < rooms_1.length)) return [3 /*break*/, 5];
            room = rooms_1[_i];
            return [4 /*yield*/, this.checkRoomAvailability(room.id, startTime, endTime, clinicId)];
          case 3:
            isAvailable = _b.sent();
            if (isAvailable) {
              availableRooms.push(__assign(__assign({}, room), { confidence: 90 }));
            }
            _b.label = 4;
          case 4:
            _i++;
            return [3 /*break*/, 2];
          case 5:
            return [2 /*return*/, availableRooms];
          case 6:
            error_9 = _b.sent();
            logger_1.logger.error("Error finding alternative rooms", { error: error_9 });
            return [2 /*return*/, []];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  SuggestionEngine.prototype.findAlternativeEquipment = function (
    equipmentId,
    startTime,
    endTime,
    clinicId,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var originalEquipment,
        _a,
        similarEquipment,
        error,
        availableEquipment,
        _i,
        similarEquipment_1,
        equipment,
        isAvailable,
        error_10;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 7, , 8]);
            return [
              4 /*yield*/,
              this.supabase
                .from("equipment")
                .select("type, category")
                .eq("id", equipmentId)
                .single(),
            ];
          case 1:
            originalEquipment = _b.sent().data;
            if (!originalEquipment)
              return [
                2 /*return*/,
                [],
                // Buscar equipamentos similares
              ];
            return [
              4 /*yield*/,
              this.supabase
                .from("equipment")
                .select("*")
                .eq("clinic_id", clinicId)
                .eq("type", originalEquipment.type)
                .eq("active", true)
                .neq("id", equipmentId),
            ];
          case 2:
            (_a = _b.sent()), (similarEquipment = _a.data), (error = _a.error);
            if (error || !similarEquipment) {
              logger_1.logger.error("Error fetching alternative equipment", { error: error });
              return [2 /*return*/, []];
            }
            availableEquipment = [];
            (_i = 0), (similarEquipment_1 = similarEquipment);
            _b.label = 3;
          case 3:
            if (!(_i < similarEquipment_1.length)) return [3 /*break*/, 6];
            equipment = similarEquipment_1[_i];
            return [
              4 /*yield*/,
              this.checkEquipmentAvailability(equipment.id, startTime, endTime, clinicId),
            ];
          case 4:
            isAvailable = _b.sent();
            if (isAvailable) {
              availableEquipment.push(__assign(__assign({}, equipment), { confidence: 85 }));
            }
            _b.label = 5;
          case 5:
            _i++;
            return [3 /*break*/, 3];
          case 6:
            return [2 /*return*/, availableEquipment];
          case 7:
            error_10 = _b.sent();
            logger_1.logger.error("Error finding alternative equipment", { error: error_10 });
            return [2 /*return*/, []];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  // Métodos auxiliares de verificação de disponibilidade
  SuggestionEngine.prototype.checkStaffAvailability = function (
    staffId,
    startTime,
    endTime,
    clinicId,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var conflicts, error_11;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("appointments")
                .select("id")
                .eq("staff_id", staffId)
                .eq("clinic_id", clinicId)
                .neq("status", "cancelled")
                .or(
                  "and(start_time.lte."
                    .concat(endTime.toISOString(), ",end_time.gte.")
                    .concat(startTime.toISOString(), ")"),
                ),
            ];
          case 1:
            conflicts = _a.sent().data;
            return [2 /*return*/, !conflicts || conflicts.length === 0];
          case 2:
            error_11 = _a.sent();
            logger_1.logger.error("Error checking staff availability", { error: error_11 });
            return [2 /*return*/, false];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  SuggestionEngine.prototype.checkRoomAvailability = function (
    roomId,
    startTime,
    endTime,
    clinicId,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var conflicts, error_12;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("appointments")
                .select("id")
                .eq("room_id", roomId)
                .eq("clinic_id", clinicId)
                .neq("status", "cancelled")
                .or(
                  "and(start_time.lte."
                    .concat(endTime.toISOString(), ",end_time.gte.")
                    .concat(startTime.toISOString(), ")"),
                ),
            ];
          case 1:
            conflicts = _a.sent().data;
            return [2 /*return*/, !conflicts || conflicts.length === 0];
          case 2:
            error_12 = _a.sent();
            logger_1.logger.error("Error checking room availability", { error: error_12 });
            return [2 /*return*/, false];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  SuggestionEngine.prototype.checkEquipmentAvailability = function (
    equipmentId,
    startTime,
    endTime,
    clinicId,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var maintenance, conflicts, error_13;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              this.supabase
                .from("equipment_maintenance")
                .select("id")
                .eq("equipment_id", equipmentId)
                .eq("status", "active")
                .or(
                  "and(start_time.lte."
                    .concat(endTime.toISOString(), ",end_time.gte.")
                    .concat(startTime.toISOString(), ")"),
                ),
            ];
          case 1:
            maintenance = _a.sent().data;
            if (maintenance && maintenance.length > 0)
              return [
                2 /*return*/,
                false,
                // Verificar uso em outros agendamentos
              ];
            return [
              4 /*yield*/,
              this.supabase
                .from("appointments")
                .select("id")
                .eq("clinic_id", clinicId)
                .neq("status", "cancelled")
                .contains("required_equipment", [equipmentId])
                .or(
                  "and(start_time.lte."
                    .concat(endTime.toISOString(), ",end_time.gte.")
                    .concat(startTime.toISOString(), ")"),
                ),
            ];
          case 2:
            conflicts = _a.sent().data;
            return [2 /*return*/, !conflicts || conflicts.length === 0];
          case 3:
            error_13 = _a.sent();
            logger_1.logger.error("Error checking equipment availability", { error: error_13 });
            return [2 /*return*/, false];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  // Métodos auxiliares adicionais
  SuggestionEngine.prototype.findAvailableTimeSlots = function (
    staffId,
    serviceId,
    preferredDate,
    clinicId,
    maxDays,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var slots, day, checkDate, hour, slotStart, slotEnd, isAvailable;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            slots = [];
            day = 0;
            _a.label = 1;
          case 1:
            if (!(day <= maxDays)) return [3 /*break*/, 6];
            checkDate = new Date(preferredDate);
            checkDate.setDate(checkDate.getDate() + day);
            hour = 9;
            _a.label = 2;
          case 2:
            if (!(hour < 17)) return [3 /*break*/, 5];
            slotStart = new Date(checkDate);
            slotStart.setHours(hour, 0, 0, 0);
            slotEnd = new Date(slotStart);
            slotEnd.setHours(hour + 1, 0, 0, 0);
            return [
              4 /*yield*/,
              this.checkStaffAvailability(staffId, slotStart, slotEnd, clinicId),
            ];
          case 3:
            isAvailable = _a.sent();
            if (isAvailable) {
              slots.push({
                start: slotStart,
                end: slotEnd,
                confidence: day === 0 ? 90 : Math.max(70 - day * 5, 50),
              });
            }
            _a.label = 4;
          case 4:
            hour++;
            return [3 /*break*/, 2];
          case 5:
            day++;
            return [3 /*break*/, 1];
          case 6:
            return [2 /*return*/, slots.slice(0, 10)]; // Limitar a 10 slots
        }
      });
    });
  };
  SuggestionEngine.prototype.findQualifiedStaff = function (
    serviceId,
    startTime,
    endTime,
    clinicId,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, this.findAlternativeStaff(serviceId, startTime, endTime, clinicId)];
      });
    });
  };
  SuggestionEngine.prototype.findSlotsOutsideBreakTime = function (
    staffId,
    serviceId,
    preferredDate,
    clinicId,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementação similar ao findAvailableTimeSlots mas considerando break times
        return [
          2 /*return*/,
          this.findAvailableTimeSlots(staffId, serviceId, preferredDate, clinicId, 3),
        ];
      });
    });
  };
  SuggestionEngine.prototype.getMaintenanceEndTime = function (equipmentId, clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var maintenance, error_14;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("equipment_maintenance")
                .select("end_time")
                .eq("equipment_id", equipmentId)
                .eq("status", "active")
                .order("end_time", { ascending: false })
                .limit(1)
                .single(),
            ];
          case 1:
            maintenance = _a.sent().data;
            return [2 /*return*/, maintenance ? new Date(maintenance.end_time) : null];
          case 2:
            error_14 = _a.sent();
            logger_1.logger.error("Error getting maintenance end time", { error: error_14 });
            return [2 /*return*/, null];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Aplica uma sugestão automaticamente
   */
  SuggestionEngine.prototype.applySuggestion = function (
    suggestion,
    appointmentId,
    clinicId,
    userId,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var changes,
        _a,
        staffChange,
        error,
        roomChange,
        error,
        equipmentChange_1,
        appointment,
        currentEquipment,
        updatedEquipment,
        error,
        error_15;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 14, , 15]);
            if (!suggestion.autoApplicable) {
              return [
                2 /*return*/,
                {
                  success: false,
                  message: "This suggestion requires manual approval",
                  changes: [],
                },
              ];
            }
            changes = [];
            _a = suggestion.type;
            switch (_a) {
              case SuggestionType.REASSIGN_STAFF:
                return [3 /*break*/, 1];
              case SuggestionType.CHANGE_ROOM:
                return [3 /*break*/, 4];
              case SuggestionType.SUBSTITUTE_EQUIPMENT:
                return [3 /*break*/, 7];
            }
            return [3 /*break*/, 11];
          case 1:
            staffChange = suggestion.impact.resourceChanges.find((c) => c.resourceType === "staff");
            if (!staffChange) return [3 /*break*/, 3];
            return [
              4 /*yield*/,
              this.supabase
                .from("appointments")
                .update({ staff_id: staffChange.to })
                .eq("id", appointmentId),
            ];
          case 2:
            error = _b.sent().error;
            if (error) throw error;
            changes.push({
              type: "staff_reassignment",
              from: staffChange.from,
              to: staffChange.to,
            });
            _b.label = 3;
          case 3:
            return [3 /*break*/, 12];
          case 4:
            roomChange = suggestion.impact.resourceChanges.find((c) => c.resourceType === "room");
            if (!roomChange) return [3 /*break*/, 6];
            return [
              4 /*yield*/,
              this.supabase
                .from("appointments")
                .update({ room_id: roomChange.to })
                .eq("id", appointmentId),
            ];
          case 5:
            error = _b.sent().error;
            if (error) throw error;
            changes.push({ type: "room_change", from: roomChange.from, to: roomChange.to });
            _b.label = 6;
          case 6:
            return [3 /*break*/, 12];
          case 7:
            equipmentChange_1 = suggestion.impact.resourceChanges.find(
              (c) => c.resourceType === "equipment",
            );
            if (!equipmentChange_1) return [3 /*break*/, 10];
            return [
              4 /*yield*/,
              this.supabase
                .from("appointments")
                .select("required_equipment")
                .eq("id", appointmentId)
                .single(),
            ];
          case 8:
            appointment = _b.sent().data;
            if (!appointment) return [3 /*break*/, 10];
            currentEquipment = appointment.required_equipment || [];
            updatedEquipment = currentEquipment.map((eq) =>
              eq === equipmentChange_1.from ? equipmentChange_1.to : eq,
            );
            return [
              4 /*yield*/,
              this.supabase
                .from("appointments")
                .update({ required_equipment: updatedEquipment })
                .eq("id", appointmentId),
            ];
          case 9:
            error = _b.sent().error;
            if (error) throw error;
            changes.push({
              type: "equipment_substitution",
              from: equipmentChange_1.from,
              to: equipmentChange_1.to,
            });
            _b.label = 10;
          case 10:
            return [3 /*break*/, 12];
          case 11:
            return [
              2 /*return*/,
              {
                success: false,
                message: "Auto-application not implemented for suggestion type: ".concat(
                  suggestion.type,
                ),
                changes: [],
              },
            ];
          case 12:
            // Registrar aplicação da sugestão
            return [
              4 /*yield*/,
              this.supabase.from("conflict_resolution_log").insert({
                appointment_id: appointmentId,
                clinic_id: clinicId,
                suggestion_id: suggestion.id,
                suggestion_type: suggestion.type,
                applied_by: userId,
                applied_at: new Date().toISOString(),
                changes: changes,
                auto_applied: true,
              }),
            ];
          case 13:
            // Registrar aplicação da sugestão
            _b.sent();
            logger_1.logger.info("Suggestion applied successfully", {
              suggestionId: suggestion.id,
              appointmentId: appointmentId,
              changes: changes,
            });
            return [
              2 /*return*/,
              {
                success: true,
                message: "Suggestion applied successfully",
                changes: changes,
              },
            ];
          case 14:
            error_15 = _b.sent();
            logger_1.logger.error("Error applying suggestion", {
              error: error_15,
              suggestion: suggestion,
              appointmentId: appointmentId,
            });
            return [
              2 /*return*/,
              {
                success: false,
                message: "Error applying suggestion: ".concat(error_15.message),
                changes: [],
              },
            ];
          case 15:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Atualiza configuração do engine
   */
  SuggestionEngine.prototype.updateConfig = function (newConfig) {
    this.config = __assign(__assign({}, this.config), newConfig);
    logger_1.logger.info("Suggestion engine config updated", { config: this.config });
  };
  /**
   * Obtém configuração atual
   */
  SuggestionEngine.prototype.getConfig = function () {
    return __assign({}, this.config);
  };
  return SuggestionEngine;
})();
exports.SuggestionEngine = SuggestionEngine;
// Instância singleton
var createsuggestionEngine = () => new SuggestionEngine();
exports.createsuggestionEngine = createsuggestionEngine;
// Função utilitária
function generateResolutionSuggestions(conflictResult, appointmentData, clinicId, config) {
  return __awaiter(this, void 0, void 0, function () {
    var engine;
    return __generator(this, (_a) => {
      engine = config ? new SuggestionEngine(config) : suggestionEngine;
      return [2 /*return*/, engine.generateSuggestions(conflictResult, appointmentData, clinicId)];
    });
  });
}
exports.default = SuggestionEngine;
