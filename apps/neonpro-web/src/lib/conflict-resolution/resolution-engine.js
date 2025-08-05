"use strict";
/**
 * Intelligent Conflict Resolution Engine
 * Advanced system for generating and applying automated conflict resolutions
 */
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
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
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
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
      return function (v) {
        return step([n, v]);
      };
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
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictResolutionEngine = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var types_1 = require("./types");
var ConflictResolutionEngine = /** @class */ (function () {
  function ConflictResolutionEngine(
    supabaseUrl,
    supabaseKey,
    conflictDetector,
    config,
    constraints,
  ) {
    if (config === void 0) {
      config = {};
    }
    if (constraints === void 0) {
      constraints = {};
    }
    this.resolutionCache = new Map();
    this.const;
    supabase = (0, supabase_js_1.createClient)((supabaseUrl, supabaseKey));
    this.conflictDetector = conflictDetector;
    this.config = __assign(
      {
        prioritizePatientSatisfaction: true,
        prioritizeStaffWorkload: true,
        prioritizeResourceUtilization: true,
        prioritizeFinancialImpact: false,
        weights: {
          patientSatisfaction: 0.3,
          staffWorkload: 0.25,
          resourceUtilization: 0.2,
          operationalEfficiency: 0.15,
          financialImpact: 0.1,
        },
        constraints: {
          maxReschedulingDistance: 24,
          minStaffBreakTime: 15,
          maxDailyWorkHours: 8,
          requiredEquipmentAvailability: 0.95,
          maxRoomCapacityUtilization: 0.9,
          businessHours: { start: "08:00", end: "18:00" },
          excludedDays: ["sunday"],
        },
      },
      config,
    );
    this.constraints = __assign(
      {
        maxReschedulingDistance: 24,
        minStaffBreakTime: 15,
        maxDailyWorkHours: 8,
        requiredEquipmentAvailability: 0.95,
        maxRoomCapacityUtilization: 0.9,
        businessHours: { start: "08:00", end: "18:00" },
        excludedDays: ["sunday"],
      },
      constraints,
    );
  }
  /**
   * Generate resolution options for a conflict
   */
  ConflictResolutionEngine.prototype.generateResolutions = function (conflictId) {
    return __awaiter(this, void 0, void 0, function () {
      var conflict,
        appointments,
        resources,
        resolutions,
        rescheduleOptions,
        earlierOptions,
        resourceOptions,
        restructureOptions,
        alternativeOptions,
        evaluatedResolutions,
        rankedResolutions,
        error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 10, , 11]);
            // Check cache first
            if (this.resolutionCache.has(conflictId)) {
              return [2 /*return*/, this.resolutionCache.get(conflictId)];
            }
            return [4 /*yield*/, this.getConflictById(conflictId)];
          case 1:
            conflict = _a.sent();
            if (!conflict) {
              throw new Error("Conflict not found: ".concat(conflictId));
            }
            return [4 /*yield*/, this.getAppointmentsByIds(conflict.affectedAppointments)];
          case 2:
            appointments = _a.sent();
            return [4 /*yield*/, this.getAffectedResources(conflict)];
          case 3:
            resources = _a.sent();
            resolutions = [];
            return [
              4 /*yield*/,
              this.generateRescheduleOptions(conflict, appointments, resources, "later"),
            ];
          case 4:
            rescheduleOptions = _a.sent();
            resolutions.push.apply(resolutions, rescheduleOptions);
            return [
              4 /*yield*/,
              this.generateRescheduleOptions(conflict, appointments, resources, "earlier"),
            ];
          case 5:
            earlierOptions = _a.sent();
            resolutions.push.apply(resolutions, earlierOptions);
            return [
              4 /*yield*/,
              this.generateResourceChangeOptions(conflict, appointments, resources),
            ];
          case 6:
            resourceOptions = _a.sent();
            resolutions.push.apply(resolutions, resourceOptions);
            return [4 /*yield*/, this.generateRestructureOptions(conflict, appointments)];
          case 7:
            restructureOptions = _a.sent();
            resolutions.push.apply(resolutions, restructureOptions);
            return [
              4 /*yield*/,
              this.generateAlternativeOptions(conflict, appointments, resources),
            ];
          case 8:
            alternativeOptions = _a.sent();
            resolutions.push.apply(resolutions, alternativeOptions);
            return [4 /*yield*/, this.evaluateResolutions(resolutions, conflict)];
          case 9:
            evaluatedResolutions = _a.sent();
            rankedResolutions = this.rankResolutions(evaluatedResolutions);
            // Cache results
            this.resolutionCache.set(conflictId, rankedResolutions);
            return [2 /*return*/, rankedResolutions];
          case 10:
            error_1 = _a.sent();
            console.error("Error generating resolutions:", error_1);
            throw new Error("Resolution generation failed: ".concat(error_1.message));
          case 11:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Apply a resolution option
   */
  ConflictResolutionEngine.prototype.applyResolution = function (resolutionId) {
    return __awaiter(this, void 0, void 0, function () {
      var resolution, validation, result, notifications, impact, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 7, , 8]);
            return [4 /*yield*/, this.getResolutionById(resolutionId)];
          case 1:
            resolution = _a.sent();
            if (!resolution) {
              throw new Error("Resolution not found: ".concat(resolutionId));
            }
            return [4 /*yield*/, this.validateResolution(resolution)];
          case 2:
            validation = _a.sent();
            if (!validation.isValid) {
              return [
                2 /*return*/,
                {
                  success: false,
                  resolutionId: resolutionId,
                  appliedChanges: {},
                  impact: this.createEmptyImpact(),
                  notifications: [],
                  errors: validation.errors,
                },
              ];
            }
            return [4 /*yield*/, this.applyChangesInTransaction(resolution)];
          case 3:
            result = _a.sent();
            return [4 /*yield*/, this.generateNotifications(resolution, result)];
          case 4:
            notifications = _a.sent();
            return [4 /*yield*/, this.calculateActualImpact(resolution, result)];
          case 5:
            impact = _a.sent();
            // Log resolution application
            return [4 /*yield*/, this.logResolutionApplication(resolutionId, result, impact)];
          case 6:
            // Log resolution application
            _a.sent();
            // Clear related caches
            this.clearRelatedCaches(resolution);
            return [
              2 /*return*/,
              {
                success: true,
                resolutionId: resolutionId,
                appliedChanges: result.changes,
                impact: impact,
                notifications: notifications,
                warnings: result.warnings,
              },
            ];
          case 7:
            error_2 = _a.sent();
            console.error("Error applying resolution:", error_2);
            return [
              2 /*return*/,
              {
                success: false,
                resolutionId: resolutionId,
                appliedChanges: {},
                impact: this.createEmptyImpact(),
                notifications: [],
                errors: [error_2.message],
              },
            ];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Generate reschedule options
   */
  ConflictResolutionEngine.prototype.generateRescheduleOptions = function (
    conflict,
    appointments,
    resources,
    direction,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var options,
        _i,
        appointments_1,
        appointment,
        availableSlots,
        _a,
        _b,
        slot,
        proposedChanges,
        impact,
        confidence;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            options = [];
            (_i = 0), (appointments_1 = appointments);
            _c.label = 1;
          case 1:
            if (!(_i < appointments_1.length)) return [3 /*break*/, 7];
            appointment = appointments_1[_i];
            return [
              4 /*yield*/,
              this.findAvailableSlots(
                appointment,
                resources,
                direction,
                this.constraints.maxReschedulingDistance,
              ),
            ];
          case 2:
            availableSlots = _c.sent();
            (_a = 0), (_b = availableSlots.slice(0, 3));
            _c.label = 3;
          case 3:
            if (!(_a < _b.length)) return [3 /*break*/, 6];
            slot = _b[_a];
            proposedChanges = {
              appointments: [
                {
                  id: appointment.id,
                  changes: {
                    start_time: slot.start.toISOString(),
                    end_time: slot.end.toISOString(),
                  },
                },
              ],
            };
            return [4 /*yield*/, this.calculateResolutionImpact(proposedChanges, conflict)];
          case 4:
            impact = _c.sent();
            confidence = this.calculateConfidence(slot, appointment, resources);
            options.push({
              id: "reschedule_"
                .concat(direction, "_")
                .concat(appointment.id, "_")
                .concat(slot.start.getTime()),
              strategy:
                direction === "later"
                  ? types_1.ResolutionStrategy.RESCHEDULE_LATER
                  : types_1.ResolutionStrategy.RESCHEDULE_EARLIER,
              description: "Reschedule appointment "
                .concat(direction, " to ")
                .concat(slot.start.toLocaleString()),
              confidence: confidence,
              impact: impact,
              estimatedTime: this.calculateEstimatedTime(proposedChanges),
              cost: this.calculateCost(proposedChanges),
              feasibility: this.calculateFeasibility(proposedChanges, resources),
              proposedChanges: proposedChanges,
              pros: this.generatePros(types_1.ResolutionStrategy.RESCHEDULE_LATER, impact),
              cons: this.generateCons(types_1.ResolutionStrategy.RESCHEDULE_LATER, impact),
              metadata: {
                originalTime: {
                  start: appointment.start_time,
                  end: appointment.end_time,
                },
                newTime: {
                  start: slot.start.toISOString(),
                  end: slot.end.toISOString(),
                },
                timeShift:
                  Math.abs(new Date(appointment.start_time).getTime() - slot.start.getTime()) /
                  (1000 * 60 * 60),
                slot: slot,
              },
            });
            _c.label = 5;
          case 5:
            _a++;
            return [3 /*break*/, 3];
          case 6:
            _i++;
            return [3 /*break*/, 1];
          case 7:
            return [2 /*return*/, options];
        }
      });
    });
  };
  /**
   * Generate resource change options
   */
  ConflictResolutionEngine.prototype.generateResourceChangeOptions = function (
    conflict,
    appointments,
    resources,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var options, _loop_1, this_1, _i, appointments_2, appointment;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            options = [];
            _loop_1 = function (appointment) {
              var alternativeStaff,
                _b,
                _c,
                staff,
                proposedChanges,
                impact,
                alternativeRooms,
                _d,
                _e,
                room,
                proposedChanges,
                impact;
              return __generator(this, function (_f) {
                switch (_f.label) {
                  case 0:
                    if (!(appointment.staff_id && resources.staff)) return [3 /*break*/, 5];
                    return [
                      4 /*yield*/,
                      this_1.findAlternativeStaff(
                        appointment,
                        resources.staff,
                        new Date(appointment.start_time),
                        new Date(appointment.end_time),
                      ),
                    ];
                  case 1:
                    alternativeStaff = _f.sent();
                    (_b = 0), (_c = alternativeStaff.slice(0, 2));
                    _f.label = 2;
                  case 2:
                    if (!(_b < _c.length)) return [3 /*break*/, 5];
                    staff = _c[_b];
                    proposedChanges = {
                      staffAssignments: [
                        {
                          appointmentId: appointment.id,
                          oldStaffId: appointment.staff_id,
                          newStaffId: staff.id,
                        },
                      ],
                    };
                    return [
                      4 /*yield*/,
                      this_1.calculateResolutionImpact(proposedChanges, conflict),
                    ];
                  case 3:
                    impact = _f.sent();
                    options.push({
                      id: "change_staff_".concat(appointment.id, "_").concat(staff.id),
                      strategy: types_1.ResolutionStrategy.CHANGE_STAFF,
                      description: "Assign ".concat(staff.name, " instead of current staff"),
                      confidence: this_1.calculateStaffChangeConfidence(staff, appointment),
                      impact: impact,
                      estimatedTime: 5,
                      cost: this_1.calculateStaffChangeCost(staff, appointment),
                      feasibility: this_1.calculateStaffChangeFeasibility(staff, appointment),
                      proposedChanges: proposedChanges,
                      pros: this_1.generatePros(types_1.ResolutionStrategy.CHANGE_STAFF, impact),
                      cons: this_1.generateCons(types_1.ResolutionStrategy.CHANGE_STAFF, impact),
                      metadata: {
                        originalStaff: resources.staff.find(function (s) {
                          return s.id === appointment.staff_id;
                        }),
                        newStaff: staff,
                        appointment: appointment,
                      },
                    });
                    _f.label = 4;
                  case 4:
                    _b++;
                    return [3 /*break*/, 2];
                  case 5:
                    if (!(appointment.room_id && resources.rooms)) return [3 /*break*/, 10];
                    return [
                      4 /*yield*/,
                      this_1.findAlternativeRooms(
                        appointment,
                        resources.rooms,
                        new Date(appointment.start_time),
                        new Date(appointment.end_time),
                      ),
                    ];
                  case 6:
                    alternativeRooms = _f.sent();
                    (_d = 0), (_e = alternativeRooms.slice(0, 2));
                    _f.label = 7;
                  case 7:
                    if (!(_d < _e.length)) return [3 /*break*/, 10];
                    room = _e[_d];
                    proposedChanges = {
                      roomAssignments: [
                        {
                          appointmentId: appointment.id,
                          oldRoomId: appointment.room_id,
                          newRoomId: room.id,
                        },
                      ],
                    };
                    return [
                      4 /*yield*/,
                      this_1.calculateResolutionImpact(proposedChanges, conflict),
                    ];
                  case 8:
                    impact = _f.sent();
                    options.push({
                      id: "change_room_".concat(appointment.id, "_").concat(room.id),
                      strategy: types_1.ResolutionStrategy.CHANGE_ROOM,
                      description: "Move to ".concat(room.name, " instead of current room"),
                      confidence: this_1.calculateRoomChangeConfidence(room, appointment),
                      impact: impact,
                      estimatedTime: 10,
                      cost: this_1.calculateRoomChangeCost(room, appointment),
                      feasibility: this_1.calculateRoomChangeFeasibility(room, appointment),
                      proposedChanges: proposedChanges,
                      pros: this_1.generatePros(types_1.ResolutionStrategy.CHANGE_ROOM, impact),
                      cons: this_1.generateCons(types_1.ResolutionStrategy.CHANGE_ROOM, impact),
                      metadata: {
                        originalRoom: resources.rooms.find(function (r) {
                          return r.id === appointment.room_id;
                        }),
                        newRoom: room,
                        appointment: appointment,
                      },
                    });
                    _f.label = 9;
                  case 9:
                    _d++;
                    return [3 /*break*/, 7];
                  case 10:
                    return [2 /*return*/];
                }
              });
            };
            this_1 = this;
            (_i = 0), (appointments_2 = appointments);
            _a.label = 1;
          case 1:
            if (!(_i < appointments_2.length)) return [3 /*break*/, 4];
            appointment = appointments_2[_i];
            return [5 /*yield**/, _loop_1(appointment)];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            return [2 /*return*/, options];
        }
      });
    });
  };
  /**
   * Generate restructure options (split/merge)
   */
  ConflictResolutionEngine.prototype.generateRestructureOptions = function (
    conflict,
    appointments,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var options,
        _i,
        appointments_3,
        appointment,
        duration,
        durationMinutes,
        splitOptions,
        mergeOptions;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            options = [];
            (_i = 0), (appointments_3 = appointments);
            _a.label = 1;
          case 1:
            if (!(_i < appointments_3.length)) return [3 /*break*/, 4];
            appointment = appointments_3[_i];
            duration =
              new Date(appointment.end_time).getTime() - new Date(appointment.start_time).getTime();
            durationMinutes = duration / (1000 * 60);
            if (!(durationMinutes >= 60)) return [3 /*break*/, 3];
            return [4 /*yield*/, this.generateSplitOptions(appointment)];
          case 2:
            splitOptions = _a.sent();
            options.push.apply(options, splitOptions);
            _a.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            if (!(appointments.length >= 2)) return [3 /*break*/, 6];
            return [4 /*yield*/, this.generateMergeOptions(appointments)];
          case 5:
            mergeOptions = _a.sent();
            options.push.apply(options, mergeOptions);
            _a.label = 6;
          case 6:
            return [2 /*return*/, options];
        }
      });
    });
  };
  /**
   * Generate alternative options
   */
  ConflictResolutionEngine.prototype.generateAlternativeOptions = function (
    conflict,
    appointments,
    resources,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var options, extendHoursOption, delegateOptions;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            options = [];
            return [4 /*yield*/, this.generateExtendHoursOption(conflict, appointments)];
          case 1:
            extendHoursOption = _a.sent();
            if (extendHoursOption) {
              options.push(extendHoursOption);
            }
            return [4 /*yield*/, this.generateDelegateOptions(appointments, resources)];
          case 2:
            delegateOptions = _a.sent();
            options.push.apply(options, delegateOptions);
            // Manual intervention option (last resort)
            options.push({
              id: "manual_intervention_".concat(conflict.id),
              strategy: types_1.ResolutionStrategy.MANUAL_INTERVENTION,
              description: "Requires manual intervention by scheduling manager",
              confidence: 1.0,
              impact: this.createNeutralImpact(),
              estimatedTime: 30,
              cost: 0.8,
              feasibility: 1.0,
              proposedChanges: {},
              pros: ["Flexible solution", "Human oversight", "Custom resolution"],
              cons: ["Requires manual work", "Time consuming", "May delay resolution"],
              metadata: {
                conflict: conflict,
                appointments: appointments,
                requiresApproval: true,
              },
            });
            return [2 /*return*/, options];
        }
      });
    });
  }; /**
   * Evaluate resolution options
   */
  ConflictResolutionEngine.prototype.evaluateResolutions = function (resolutions, conflict) {
    return __awaiter(this, void 0, void 0, function () {
      var evaluatedResolutions,
        _i,
        resolutions_1,
        resolution,
        updatedImpact,
        overallScore,
        updatedFeasibility;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            evaluatedResolutions = [];
            (_i = 0), (resolutions_1 = resolutions);
            _a.label = 1;
          case 1:
            if (!(_i < resolutions_1.length)) return [3 /*break*/, 5];
            resolution = resolutions_1[_i];
            return [
              4 /*yield*/,
              this.calculateResolutionImpact(resolution.proposedChanges, conflict),
            ];
          case 2:
            updatedImpact = _a.sent();
            overallScore = this.calculateOverallScore(updatedImpact);
            return [4 /*yield*/, this.validateFeasibility(resolution)];
          case 3:
            updatedFeasibility = _a.sent();
            evaluatedResolutions.push(
              __assign(__assign({}, resolution), {
                impact: updatedImpact,
                feasibility: updatedFeasibility,
                metadata: __assign(__assign({}, resolution.metadata), {
                  overallScore: overallScore,
                  evaluatedAt: new Date().toISOString(),
                }),
              }),
            );
            _a.label = 4;
          case 4:
            _i++;
            return [3 /*break*/, 1];
          case 5:
            return [2 /*return*/, evaluatedResolutions];
        }
      });
    });
  };
  /**
   * Rank resolutions by overall score
   */
  ConflictResolutionEngine.prototype.rankResolutions = function (resolutions) {
    var _this = this;
    return resolutions.sort(function (a, b) {
      var scoreA = _this.calculateOverallScore(a.impact) * a.confidence * a.feasibility;
      var scoreB = _this.calculateOverallScore(b.impact) * b.confidence * b.feasibility;
      return scoreB - scoreA;
    });
  };
  /**
   * Calculate overall score based on weighted impact
   */
  ConflictResolutionEngine.prototype.calculateOverallScore = function (impact) {
    var weights = this.config.weights;
    return (
      impact.patientSatisfaction * weights.patientSatisfaction +
      impact.staffWorkload * weights.staffWorkload +
      impact.resourceUtilization * weights.resourceUtilization +
      impact.operationalEfficiency * weights.operationalEfficiency +
      impact.financialImpact * weights.financialImpact
    );
  };
  /**
   * Calculate resolution impact
   */
  ConflictResolutionEngine.prototype.calculateResolutionImpact = function (
    proposedChanges,
    conflict,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var patientSatisfaction,
        staffWorkload,
        resourceUtilization,
        operationalEfficiency,
        financialImpact,
        _i,
        _a,
        change,
        appointment,
        originalTime,
        newTime,
        timeDiff,
        _b,
        _c,
        assignment,
        newStaff,
        currentWorkload,
        _d,
        _e,
        assignment,
        newRoom,
        roomUtilization,
        overallScore;
      return __generator(this, function (_f) {
        switch (_f.label) {
          case 0:
            patientSatisfaction = 0;
            staffWorkload = 0;
            resourceUtilization = 0;
            operationalEfficiency = 0;
            financialImpact = 0;
            if (!proposedChanges.appointments) return [3 /*break*/, 4];
            (_i = 0), (_a = proposedChanges.appointments);
            _f.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 4];
            change = _a[_i];
            return [4 /*yield*/, this.getAppointmentById(change.id)];
          case 2:
            appointment = _f.sent();
            if (!appointment) return [3 /*break*/, 3];
            // Patient satisfaction impact
            if (change.changes.start_time) {
              originalTime = new Date(appointment.start_time);
              newTime = new Date(change.changes.start_time);
              timeDiff = Math.abs(newTime.getTime() - originalTime.getTime()) / (1000 * 60 * 60);
              // Less impact for smaller time changes
              patientSatisfaction -= Math.min(timeDiff / 24, 0.5);
            }
            // Operational efficiency
            operationalEfficiency += 0.1; // Resolving conflicts improves efficiency
            _f.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            if (!proposedChanges.staffAssignments) return [3 /*break*/, 9];
            (_b = 0), (_c = proposedChanges.staffAssignments);
            _f.label = 5;
          case 5:
            if (!(_b < _c.length)) return [3 /*break*/, 9];
            assignment = _c[_b];
            return [4 /*yield*/, this.getStaffById(assignment.newStaffId)];
          case 6:
            newStaff = _f.sent();
            if (!newStaff) return [3 /*break*/, 8];
            return [4 /*yield*/, this.getStaffCurrentWorkload(assignment.newStaffId)];
          case 7:
            currentWorkload = _f.sent();
            if (currentWorkload < 0.8) {
              staffWorkload += 0.1; // Positive impact if staff has capacity
            } else {
              staffWorkload -= 0.2; // Negative impact if staff is overloaded
            }
            // Resource utilization
            resourceUtilization += 0.05;
            _f.label = 8;
          case 8:
            _b++;
            return [3 /*break*/, 5];
          case 9:
            if (!proposedChanges.roomAssignments) return [3 /*break*/, 14];
            (_d = 0), (_e = proposedChanges.roomAssignments);
            _f.label = 10;
          case 10:
            if (!(_d < _e.length)) return [3 /*break*/, 14];
            assignment = _e[_d];
            return [4 /*yield*/, this.getRoomById(assignment.newRoomId)];
          case 11:
            newRoom = _f.sent();
            if (!newRoom) return [3 /*break*/, 13];
            return [4 /*yield*/, this.getRoomUtilization(assignment.newRoomId)];
          case 12:
            roomUtilization = _f.sent();
            if (roomUtilization < 0.8) {
              resourceUtilization += 0.1;
            }
            _f.label = 13;
          case 13:
            _d++;
            return [3 /*break*/, 10];
          case 14:
            // Financial impact calculation
            financialImpact = this.calculateFinancialImpact(proposedChanges);
            overallScore = this.calculateOverallScore({
              patientSatisfaction: patientSatisfaction,
              staffWorkload: staffWorkload,
              resourceUtilization: resourceUtilization,
              operationalEfficiency: operationalEfficiency,
              financialImpact: financialImpact,
              overallScore: 0,
            });
            return [
              2 /*return*/,
              {
                patientSatisfaction: Math.max(-1, Math.min(1, patientSatisfaction)),
                staffWorkload: Math.max(-1, Math.min(1, staffWorkload)),
                resourceUtilization: Math.max(-1, Math.min(1, resourceUtilization)),
                operationalEfficiency: Math.max(-1, Math.min(1, operationalEfficiency)),
                financialImpact: Math.max(-1, Math.min(1, financialImpact)),
                overallScore: overallScore,
              },
            ];
        }
      });
    });
  };
  /**
   * Apply changes in database transaction
   */
  ConflictResolutionEngine.prototype.applyChangesInTransaction = function (resolution) {
    return __awaiter(this, void 0, void 0, function () {
      var changes,
        appliedChanges,
        warnings,
        _a,
        data,
        error,
        _i,
        _b,
        change,
        updateError,
        _c,
        _d,
        assignment,
        updateError,
        _e,
        _f,
        assignment,
        updateError,
        _g,
        _h,
        assignment,
        insertError,
        deleteError,
        _j,
        _k,
        newApt,
        _l,
        insertedApt,
        insertError,
        _m,
        _o,
        aptId,
        updateError,
        commitError,
        error_3;
      return __generator(this, function (_p) {
        switch (_p.label) {
          case 0:
            changes = resolution.proposedChanges;
            appliedChanges = {};
            warnings = [];
            _p.label = 1;
          case 1:
            _p.trys.push([1, 30, , 32]);
            return [4 /*yield*/, this.supabase.rpc("begin_transaction")];
          case 2:
            (_a = _p.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            if (!changes.appointments) return [3 /*break*/, 6];
            appliedChanges.appointments = [];
            (_i = 0), (_b = changes.appointments);
            _p.label = 3;
          case 3:
            if (!(_i < _b.length)) return [3 /*break*/, 6];
            change = _b[_i];
            return [
              4 /*yield*/,
              this.supabase.from("appointments").update(change.changes).eq("id", change.id),
            ];
          case 4:
            updateError = _p.sent().error;
            if (updateError) {
              warnings.push(
                "Failed to update appointment ".concat(change.id, ": ").concat(updateError.message),
              );
            } else {
              appliedChanges.appointments.push(change);
            }
            _p.label = 5;
          case 5:
            _i++;
            return [3 /*break*/, 3];
          case 6:
            if (!changes.staffAssignments) return [3 /*break*/, 10];
            appliedChanges.staffAssignments = [];
            (_c = 0), (_d = changes.staffAssignments);
            _p.label = 7;
          case 7:
            if (!(_c < _d.length)) return [3 /*break*/, 10];
            assignment = _d[_c];
            return [
              4 /*yield*/,
              this.supabase
                .from("appointments")
                .update({ staff_id: assignment.newStaffId })
                .eq("id", assignment.appointmentId),
            ];
          case 8:
            updateError = _p.sent().error;
            if (updateError) {
              warnings.push(
                "Failed to update staff assignment for appointment "
                  .concat(assignment.appointmentId, ": ")
                  .concat(updateError.message),
              );
            } else {
              appliedChanges.staffAssignments.push(assignment);
            }
            _p.label = 9;
          case 9:
            _c++;
            return [3 /*break*/, 7];
          case 10:
            if (!changes.roomAssignments) return [3 /*break*/, 14];
            appliedChanges.roomAssignments = [];
            (_e = 0), (_f = changes.roomAssignments);
            _p.label = 11;
          case 11:
            if (!(_e < _f.length)) return [3 /*break*/, 14];
            assignment = _f[_e];
            return [
              4 /*yield*/,
              this.supabase
                .from("appointments")
                .update({ room_id: assignment.newRoomId })
                .eq("id", assignment.appointmentId),
            ];
          case 12:
            updateError = _p.sent().error;
            if (updateError) {
              warnings.push(
                "Failed to update room assignment for appointment "
                  .concat(assignment.appointmentId, ": ")
                  .concat(updateError.message),
              );
            } else {
              appliedChanges.roomAssignments.push(assignment);
            }
            _p.label = 13;
          case 13:
            _e++;
            return [3 /*break*/, 11];
          case 14:
            if (!changes.equipmentAssignments) return [3 /*break*/, 20];
            appliedChanges.equipmentAssignments = [];
            (_g = 0), (_h = changes.equipmentAssignments);
            _p.label = 15;
          case 15:
            if (!(_g < _h.length)) return [3 /*break*/, 20];
            assignment = _h[_g];
            if (!(assignment.action === "assign")) return [3 /*break*/, 17];
            return [
              4 /*yield*/,
              this.supabase.from("appointment_equipment").insert({
                appointment_id: assignment.appointmentId,
                equipment_id: assignment.equipmentId,
              }),
            ];
          case 16:
            insertError = _p.sent().error;
            if (insertError) {
              warnings.push(
                "Failed to assign equipment "
                  .concat(assignment.equipmentId, ": ")
                  .concat(insertError.message),
              );
            } else {
              appliedChanges.equipmentAssignments.push(assignment);
            }
            return [3 /*break*/, 19];
          case 17:
            if (!(assignment.action === "unassign")) return [3 /*break*/, 19];
            return [
              4 /*yield*/,
              this.supabase
                .from("appointment_equipment")
                .delete()
                .eq("appointment_id", assignment.appointmentId)
                .eq("equipment_id", assignment.equipmentId),
            ];
          case 18:
            deleteError = _p.sent().error;
            if (deleteError) {
              warnings.push(
                "Failed to unassign equipment "
                  .concat(assignment.equipmentId, ": ")
                  .concat(deleteError.message),
              );
            } else {
              appliedChanges.equipmentAssignments.push(assignment);
            }
            _p.label = 19;
          case 19:
            _g++;
            return [3 /*break*/, 15];
          case 20:
            if (!changes.newAppointments) return [3 /*break*/, 24];
            appliedChanges.newAppointments = [];
            (_j = 0), (_k = changes.newAppointments);
            _p.label = 21;
          case 21:
            if (!(_j < _k.length)) return [3 /*break*/, 24];
            newApt = _k[_j];
            return [
              4 /*yield*/,
              this.supabase.from("appointments").insert(newApt).select().single(),
            ];
          case 22:
            (_l = _p.sent()), (insertedApt = _l.data), (insertError = _l.error);
            if (insertError) {
              warnings.push("Failed to create new appointment: ".concat(insertError.message));
            } else {
              appliedChanges.newAppointments.push(insertedApt);
            }
            _p.label = 23;
          case 23:
            _j++;
            return [3 /*break*/, 21];
          case 24:
            if (!changes.cancelledAppointments) return [3 /*break*/, 28];
            appliedChanges.cancelledAppointments = [];
            (_m = 0), (_o = changes.cancelledAppointments);
            _p.label = 25;
          case 25:
            if (!(_m < _o.length)) return [3 /*break*/, 28];
            aptId = _o[_m];
            return [
              4 /*yield*/,
              this.supabase.from("appointments").update({ status: "cancelled" }).eq("id", aptId),
            ];
          case 26:
            updateError = _p.sent().error;
            if (updateError) {
              warnings.push(
                "Failed to cancel appointment ".concat(aptId, ": ").concat(updateError.message),
              );
            } else {
              appliedChanges.cancelledAppointments.push(aptId);
            }
            _p.label = 27;
          case 27:
            _m++;
            return [3 /*break*/, 25];
          case 28:
            return [4 /*yield*/, this.supabase.rpc("commit_transaction")];
          case 29:
            commitError = _p.sent().error;
            if (commitError) throw commitError;
            return [2 /*return*/, { changes: appliedChanges, warnings: warnings }];
          case 30:
            error_3 = _p.sent();
            // Rollback transaction
            return [4 /*yield*/, this.supabase.rpc("rollback_transaction")];
          case 31:
            // Rollback transaction
            _p.sent();
            throw error_3;
          case 32:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Validate resolution before applying
   */
  ConflictResolutionEngine.prototype.validateResolution = function (resolution) {
    return __awaiter(this, void 0, void 0, function () {
      var errors,
        _i,
        _a,
        change,
        appointment,
        _b,
        _c,
        assignment,
        staff,
        _d,
        _e,
        assignment,
        room,
        constraintErrors;
      return __generator(this, function (_f) {
        switch (_f.label) {
          case 0:
            errors = [];
            if (!resolution.proposedChanges.appointments) return [3 /*break*/, 4];
            (_i = 0), (_a = resolution.proposedChanges.appointments);
            _f.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 4];
            change = _a[_i];
            return [4 /*yield*/, this.getAppointmentById(change.id)];
          case 2:
            appointment = _f.sent();
            if (!appointment) {
              errors.push("Appointment ".concat(change.id, " no longer exists"));
            } else if (appointment.status !== "scheduled") {
              errors.push("Appointment ".concat(change.id, " is no longer scheduled"));
            }
            _f.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            if (!resolution.proposedChanges.staffAssignments) return [3 /*break*/, 8];
            (_b = 0), (_c = resolution.proposedChanges.staffAssignments);
            _f.label = 5;
          case 5:
            if (!(_b < _c.length)) return [3 /*break*/, 8];
            assignment = _c[_b];
            return [4 /*yield*/, this.getStaffById(assignment.newStaffId)];
          case 6:
            staff = _f.sent();
            if (!staff || !staff.active) {
              errors.push("Staff member ".concat(assignment.newStaffId, " is not available"));
            }
            _f.label = 7;
          case 7:
            _b++;
            return [3 /*break*/, 5];
          case 8:
            if (!resolution.proposedChanges.roomAssignments) return [3 /*break*/, 12];
            (_d = 0), (_e = resolution.proposedChanges.roomAssignments);
            _f.label = 9;
          case 9:
            if (!(_d < _e.length)) return [3 /*break*/, 12];
            assignment = _e[_d];
            return [4 /*yield*/, this.getRoomById(assignment.newRoomId)];
          case 10:
            room = _f.sent();
            if (!room || !room.active) {
              errors.push("Room ".concat(assignment.newRoomId, " is not available"));
            }
            _f.label = 11;
          case 11:
            _d++;
            return [3 /*break*/, 9];
          case 12:
            return [4 /*yield*/, this.validateBusinessConstraints(resolution)];
          case 13:
            constraintErrors = _f.sent();
            errors.push.apply(errors, constraintErrors);
            return [
              2 /*return*/,
              {
                isValid: errors.length === 0,
                errors: errors,
              },
            ];
        }
      });
    });
  };
  /**
   * Helper methods for finding alternatives
   */
  ConflictResolutionEngine.prototype.findAvailableSlots = function (
    appointment,
    resources,
    direction,
    maxHours,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var slots,
        duration,
        originalStart,
        searchStart,
        searchEnd,
        time,
        slotStart,
        slotEnd,
        isAvailable,
        score;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            slots = [];
            duration =
              new Date(appointment.end_time).getTime() - new Date(appointment.start_time).getTime();
            originalStart = new Date(appointment.start_time);
            searchStart =
              direction === "earlier"
                ? new Date(originalStart.getTime() - maxHours * 60 * 60 * 1000)
                : originalStart;
            searchEnd =
              direction === "later"
                ? new Date(originalStart.getTime() + maxHours * 60 * 60 * 1000)
                : originalStart;
            time = searchStart.getTime();
            _a.label = 1;
          case 1:
            if (!(time <= searchEnd.getTime())) return [3 /*break*/, 4];
            slotStart = new Date(time);
            slotEnd = new Date(time + duration);
            // Check if slot is within business hours
            if (!this.isWithinBusinessHours(slotStart, slotEnd)) return [3 /*break*/, 3];
            return [4 /*yield*/, this.isSlotAvailable(slotStart, slotEnd, appointment, resources)];
          case 2:
            isAvailable = _a.sent();
            if (!isAvailable) return [3 /*break*/, 3];
            score = this.calculateSlotScore(slotStart, originalStart, appointment);
            slots.push({ start: slotStart, end: slotEnd, score: score });
            _a.label = 3;
          case 3:
            time += 15 * 60 * 1000;
            return [3 /*break*/, 1];
          case 4:
            // Sort by score and return top options
            return [
              2 /*return*/,
              slots
                .sort(function (a, b) {
                  return b.score - a.score;
                })
                .slice(0, 5),
            ];
        }
      });
    });
  };
  ConflictResolutionEngine.prototype.findAlternativeStaff = function (
    appointment,
    allStaff,
    startTime,
    endTime,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var alternatives, _i, allStaff_1, staff, isAvailable, isQualified;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            alternatives = [];
            (_i = 0), (allStaff_1 = allStaff);
            _a.label = 1;
          case 1:
            if (!(_i < allStaff_1.length)) return [3 /*break*/, 5];
            staff = allStaff_1[_i];
            if (staff.id === appointment.staff_id) return [3 /*break*/, 4];
            if (!staff.active) return [3 /*break*/, 4];
            return [4 /*yield*/, this.isStaffAvailable(staff.id, startTime, endTime)];
          case 2:
            isAvailable = _a.sent();
            if (!isAvailable) return [3 /*break*/, 4];
            return [4 /*yield*/, this.isStaffQualified(staff, appointment)];
          case 3:
            isQualified = _a.sent();
            if (!isQualified) return [3 /*break*/, 4];
            alternatives.push(staff);
            _a.label = 4;
          case 4:
            _i++;
            return [3 /*break*/, 1];
          case 5:
            return [2 /*return*/, alternatives];
        }
      });
    });
  };
  ConflictResolutionEngine.prototype.findAlternativeRooms = function (
    appointment,
    allRooms,
    startTime,
    endTime,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var alternatives, _i, allRooms_1, room, isAvailable, isSuitable;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            alternatives = [];
            (_i = 0), (allRooms_1 = allRooms);
            _a.label = 1;
          case 1:
            if (!(_i < allRooms_1.length)) return [3 /*break*/, 5];
            room = allRooms_1[_i];
            if (room.id === appointment.room_id) return [3 /*break*/, 4];
            if (!room.active) return [3 /*break*/, 4];
            return [4 /*yield*/, this.isRoomAvailable(room.id, startTime, endTime)];
          case 2:
            isAvailable = _a.sent();
            if (!isAvailable) return [3 /*break*/, 4];
            return [4 /*yield*/, this.isRoomSuitable(room, appointment)];
          case 3:
            isSuitable = _a.sent();
            if (!isSuitable) return [3 /*break*/, 4];
            alternatives.push(room);
            _a.label = 4;
          case 4:
            _i++;
            return [3 /*break*/, 1];
          case 5:
            return [2 /*return*/, alternatives];
        }
      });
    });
  };
  /**
   * Utility methods
   */
  ConflictResolutionEngine.prototype.isWithinBusinessHours = function (start, end) {
    var businessStart = this.parseTime(this.constraints.businessHours.start);
    var businessEnd = this.parseTime(this.constraints.businessHours.end);
    var startTime = start.getHours() * 60 + start.getMinutes();
    var endTime = end.getHours() * 60 + end.getMinutes();
    return startTime >= businessStart && endTime <= businessEnd;
  };
  ConflictResolutionEngine.prototype.parseTime = function (timeStr) {
    var _a = timeStr.split(":").map(Number),
      hours = _a[0],
      minutes = _a[1];
    return hours * 60 + minutes;
  };
  ConflictResolutionEngine.prototype.calculateSlotScore = function (
    slotStart,
    originalStart,
    appointment,
  ) {
    var score = 1.0;
    // Prefer slots closer to original time
    var timeDiff = Math.abs(slotStart.getTime() - originalStart.getTime()) / (1000 * 60 * 60);
    score -= timeDiff * 0.1;
    // Prefer slots during preferred hours
    var hour = slotStart.getHours();
    if (hour >= 9 && hour <= 17) {
      score += 0.2;
    }
    // Prefer weekdays
    var dayOfWeek = slotStart.getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      score += 0.1;
    }
    return Math.max(0, score);
  };
  ConflictResolutionEngine.prototype.calculateConfidence = function (slot, appointment, resources) {
    // Base confidence
    var confidence = 0.8;
    // Adjust based on slot score
    confidence += slot.score * 0.2;
    // Adjust based on resource availability
    if (resources.staff && resources.rooms) {
      confidence += 0.1;
    }
    return Math.min(1.0, confidence);
  };
  ConflictResolutionEngine.prototype.calculateEstimatedTime = function (changes) {
    var time = 0;
    if (changes.appointments) time += changes.appointments.length * 2;
    if (changes.staffAssignments) time += changes.staffAssignments.length * 3;
    if (changes.roomAssignments) time += changes.roomAssignments.length * 5;
    if (changes.equipmentAssignments) time += changes.equipmentAssignments.length * 2;
    return Math.max(5, time);
  };
  ConflictResolutionEngine.prototype.calculateCost = function (changes) {
    var cost = 0.1; // Base cost
    if (changes.appointments) cost += changes.appointments.length * 0.1;
    if (changes.staffAssignments) cost += changes.staffAssignments.length * 0.2;
    if (changes.roomAssignments) cost += changes.roomAssignments.length * 0.15;
    return Math.min(1.0, cost);
  };
  ConflictResolutionEngine.prototype.calculateFeasibility = function (changes, resources) {
    // Base feasibility
    var feasibility = 0.9;
    // Reduce based on complexity
    var complexity = Object.keys(changes).length;
    feasibility -= complexity * 0.1;
    return Math.max(0.1, feasibility);
  };
  ConflictResolutionEngine.prototype.generatePros = function (strategy, impact) {
    var pros = [];
    if (impact.patientSatisfaction > 0) pros.push("Improves patient satisfaction");
    if (impact.staffWorkload > 0) pros.push("Balances staff workload");
    if (impact.resourceUtilization > 0) pros.push("Optimizes resource usage");
    if (impact.operationalEfficiency > 0) pros.push("Increases operational efficiency");
    switch (strategy) {
      case types_1.ResolutionStrategy.RESCHEDULE_LATER:
      case types_1.ResolutionStrategy.RESCHEDULE_EARLIER:
        pros.push("Maintains original resources", "Quick to implement");
        break;
      case types_1.ResolutionStrategy.CHANGE_STAFF:
        pros.push("Utilizes available staff", "Maintains original time");
        break;
      case types_1.ResolutionStrategy.CHANGE_ROOM:
        pros.push("Maintains original time", "May provide better facilities");
        break;
    }
    return pros;
  };
  ConflictResolutionEngine.prototype.generateCons = function (strategy, impact) {
    var cons = [];
    if (impact.patientSatisfaction < 0) cons.push("May reduce patient satisfaction");
    if (impact.staffWorkload < 0) cons.push("May increase staff workload");
    if (impact.resourceUtilization < 0) cons.push("May reduce resource efficiency");
    switch (strategy) {
      case types_1.ResolutionStrategy.RESCHEDULE_LATER:
      case types_1.ResolutionStrategy.RESCHEDULE_EARLIER:
        cons.push("Changes appointment time", "May inconvenience patient");
        break;
      case types_1.ResolutionStrategy.CHANGE_STAFF:
        cons.push("Different staff member", "May affect continuity of care");
        break;
      case types_1.ResolutionStrategy.CHANGE_ROOM:
        cons.push("Different location", "May require patient notification");
        break;
    }
    return cons;
  };
  ConflictResolutionEngine.prototype.createEmptyImpact = function () {
    return {
      patientSatisfaction: 0,
      staffWorkload: 0,
      resourceUtilization: 0,
      operationalEfficiency: 0,
      financialImpact: 0,
      overallScore: 0,
    };
  };
  ConflictResolutionEngine.prototype.createNeutralImpact = function () {
    return {
      patientSatisfaction: 0,
      staffWorkload: 0,
      resourceUtilization: 0,
      operationalEfficiency: 0.1,
      financialImpact: 0,
      overallScore: 0.1,
    };
  };
  // Placeholder methods for database operations
  ConflictResolutionEngine.prototype.getConflictById = function (conflictId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation would fetch from conflicts table
        return [2 /*return*/, null];
      });
    });
  };
  ConflictResolutionEngine.prototype.getResolutionById = function (resolutionId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation would fetch from resolutions table
        return [2 /*return*/, null];
      });
    });
  };
  ConflictResolutionEngine.prototype.getAppointmentsByIds = function (ids) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, this.supabase.from("appointments").select("*").in("id", ids)];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, data || []];
        }
      });
    });
  };
  ConflictResolutionEngine.prototype.getAppointmentById = function (id) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("appointments").select("*").eq("id", id).single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) return [2 /*return*/, null];
            return [2 /*return*/, data];
        }
      });
    });
  };
  ConflictResolutionEngine.prototype.getStaffById = function (id) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, this.supabase.from("staff").select("*").eq("id", id).single()];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) return [2 /*return*/, null];
            return [2 /*return*/, data];
        }
      });
    });
  };
  ConflictResolutionEngine.prototype.getRoomById = function (id) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, this.supabase.from("rooms").select("*").eq("id", id).single()];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) return [2 /*return*/, null];
            return [2 /*return*/, data];
        }
      });
    });
  };
  ConflictResolutionEngine.prototype.getAffectedResources = function (conflict) {
    return __awaiter(this, void 0, void 0, function () {
      var resources, data, data, data;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            resources = {};
            if (!conflict.affectedResources.staff) return [3 /*break*/, 2];
            return [
              4 /*yield*/,
              this.supabase.from("staff").select("*").in("id", conflict.affectedResources.staff),
            ];
          case 1:
            data = _a.sent().data;
            resources.staff = data || [];
            _a.label = 2;
          case 2:
            if (!conflict.affectedResources.rooms) return [3 /*break*/, 4];
            return [
              4 /*yield*/,
              this.supabase.from("rooms").select("*").in("id", conflict.affectedResources.rooms),
            ];
          case 3:
            data = _a.sent().data;
            resources.rooms = data || [];
            _a.label = 4;
          case 4:
            if (!conflict.affectedResources.equipment) return [3 /*break*/, 6];
            return [
              4 /*yield*/,
              this.supabase
                .from("equipment")
                .select("*")
                .in("id", conflict.affectedResources.equipment),
            ];
          case 5:
            data = _a.sent().data;
            resources.equipment = data || [];
            _a.label = 6;
          case 6:
            return [2 /*return*/, resources];
        }
      });
    });
  };
  // Additional placeholder methods
  ConflictResolutionEngine.prototype.isSlotAvailable = function (
    start,
    end,
    appointment,
    resources,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, true]; // Simplified implementation
      });
    });
  };
  ConflictResolutionEngine.prototype.isStaffAvailable = function (staffId, start, end) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, true]; // Simplified implementation
      });
    });
  };
  ConflictResolutionEngine.prototype.isRoomAvailable = function (roomId, start, end) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, true]; // Simplified implementation
      });
    });
  };
  ConflictResolutionEngine.prototype.isStaffQualified = function (staff, appointment) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, true]; // Simplified implementation
      });
    });
  };
  ConflictResolutionEngine.prototype.isRoomSuitable = function (room, appointment) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, true]; // Simplified implementation
      });
    });
  };
  ConflictResolutionEngine.prototype.getStaffCurrentWorkload = function (staffId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, 0.5]; // Simplified implementation
      });
    });
  };
  ConflictResolutionEngine.prototype.getRoomUtilization = function (roomId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, 0.6]; // Simplified implementation
      });
    });
  };
  ConflictResolutionEngine.prototype.calculateFinancialImpact = function (changes) {
    return 0; // Simplified implementation
  };
  ConflictResolutionEngine.prototype.validateFeasibility = function (resolution) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, resolution.feasibility]; // Simplified implementation
      });
    });
  };
  ConflictResolutionEngine.prototype.validateBusinessConstraints = function (resolution) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, []]; // Simplified implementation
      });
    });
  };
  ConflictResolutionEngine.prototype.generateNotifications = function (resolution, result) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, []]; // Simplified implementation
      });
    });
  };
  ConflictResolutionEngine.prototype.calculateActualImpact = function (resolution, result) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, resolution.impact]; // Simplified implementation
      });
    });
  };
  ConflictResolutionEngine.prototype.logResolutionApplication = function (
    resolutionId,
    result,
    impact,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  ConflictResolutionEngine.prototype.clearRelatedCaches = function (resolution) {
    this.resolutionCache.clear();
  };
  ConflictResolutionEngine.prototype.generateSplitOptions = function (appointment) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, []]; // Simplified implementation
      });
    });
  };
  ConflictResolutionEngine.prototype.generateMergeOptions = function (appointments) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, []]; // Simplified implementation
      });
    });
  };
  ConflictResolutionEngine.prototype.generateExtendHoursOption = function (conflict, appointments) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, null]; // Simplified implementation
      });
    });
  };
  ConflictResolutionEngine.prototype.generateDelegateOptions = function (appointments, resources) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, []]; // Simplified implementation
      });
    });
  };
  ConflictResolutionEngine.prototype.calculateStaffChangeConfidence = function (
    staff,
    appointment,
  ) {
    return 0.8; // Simplified implementation
  };
  ConflictResolutionEngine.prototype.calculateStaffChangeCost = function (staff, appointment) {
    return 0.2; // Simplified implementation
  };
  ConflictResolutionEngine.prototype.calculateStaffChangeFeasibility = function (
    staff,
    appointment,
  ) {
    return 0.9; // Simplified implementation
  };
  ConflictResolutionEngine.prototype.calculateRoomChangeConfidence = function (room, appointment) {
    return 0.8; // Simplified implementation
  };
  ConflictResolutionEngine.prototype.calculateRoomChangeCost = function (room, appointment) {
    return 0.15; // Simplified implementation
  };
  ConflictResolutionEngine.prototype.calculateRoomChangeFeasibility = function (room, appointment) {
    return 0.9; // Simplified implementation
  };
  /**
   * Clear all caches
   */
  ConflictResolutionEngine.prototype.clearCache = function () {
    this.resolutionCache.clear();
  };
  /**
   * Update configuration
   */
  ConflictResolutionEngine.prototype.updateConfig = function (config) {
    this.config = __assign(__assign({}, this.config), config);
    this.clearCache();
  };
  /**
   * Update constraints
   */
  ConflictResolutionEngine.prototype.updateConstraints = function (constraints) {
    this.constraints = __assign(__assign({}, this.constraints), constraints);
    this.clearCache();
  };
  return ConflictResolutionEngine;
})();
exports.ConflictResolutionEngine = ConflictResolutionEngine;
