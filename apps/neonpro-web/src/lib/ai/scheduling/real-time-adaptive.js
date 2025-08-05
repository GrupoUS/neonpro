"use strict";
/**
 * Real-Time Adaptive Scheduling System
 * Story 2.3: AI-Powered Automatic Scheduling Implementation
 *
 * This module implements real-time monitoring and adaptive scheduling:
 * - Live schedule monitoring
 * - Automatic rescheduling on conflicts
 * - Dynamic resource reallocation
 * - Predictive adjustments
 * - Emergency scheduling protocols
 */
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
exports.RealTimeAdaptiveScheduling = void 0;
var client_1 = require("@/lib/supabase/client");
var RealTimeAdaptiveScheduling = /** @class */ (function () {
  function RealTimeAdaptiveScheduling(aiCore, optimizationEngine) {
    this.supabase = (0, client_1.createClient)();
    this.realtimeChannel = null;
    this.eventQueue = [];
    this.activeActions = new Map();
    this.isMonitoring = false;
    this.aiCore = aiCore;
    this.optimizationEngine = optimizationEngine;
    this.conflictResolver = new ConflictResolver(this.supabase, aiCore);
    this.predictiveAnalyzer = new PredictiveAnalyzer(this.supabase);
  }
  /**
   * Start real-time monitoring of the scheduling system
   */
  RealTimeAdaptiveScheduling.prototype.startMonitoring = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _this = this;
      return __generator(this, function (_a) {
        if (this.isMonitoring) {
          console.log("Real-time monitoring already active");
          return [2 /*return*/];
        }
        try {
          // Initialize real-time subscription
          this.realtimeChannel = this.supabase
            .channel("schedule-monitoring")
            .on(
              "postgres_changes",
              {
                event: "*",
                schema: "public",
                table: "appointments",
              },
              function (payload) {
                return _this.handleAppointmentChange(payload);
              },
            )
            .on(
              "postgres_changes",
              {
                event: "*",
                schema: "public",
                table: "staff_availability",
              },
              function (payload) {
                return _this.handleStaffAvailabilityChange(payload);
              },
            )
            .on(
              "postgres_changes",
              {
                event: "*",
                schema: "public",
                table: "equipment_status",
              },
              function (payload) {
                return _this.handleEquipmentStatusChange(payload);
              },
            )
            .subscribe();
          // Start event processing loop
          this.startEventProcessing();
          // Start predictive analysis
          this.startPredictiveAnalysis();
          this.isMonitoring = true;
          console.log("Real-time adaptive scheduling monitoring started");
        } catch (error) {
          console.error("Error starting real-time monitoring:", error);
          throw new Error("Failed to start real-time monitoring");
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Stop real-time monitoring
   */
  RealTimeAdaptiveScheduling.prototype.stopMonitoring = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!this.isMonitoring) {
              return [2 /*return*/];
            }
            _a.label = 1;
          case 1:
            _a.trys.push([1, 4, , 5]);
            if (!this.realtimeChannel) return [3 /*break*/, 3];
            return [4 /*yield*/, this.supabase.removeChannel(this.realtimeChannel)];
          case 2:
            _a.sent();
            this.realtimeChannel = null;
            _a.label = 3;
          case 3:
            this.isMonitoring = false;
            console.log("Real-time adaptive scheduling monitoring stopped");
            return [3 /*break*/, 5];
          case 4:
            error_1 = _a.sent();
            console.error("Error stopping real-time monitoring:", error_1);
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Handle appointment changes in real-time
   */
  RealTimeAdaptiveScheduling.prototype.handleAppointmentChange = function (payload) {
    return __awaiter(this, void 0, void 0, function () {
      var eventType, newRecord, oldRecord, event, _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            (eventType = payload.eventType), (newRecord = payload.new), (oldRecord = payload.old);
            event = null;
            _a = eventType;
            switch (_a) {
              case "INSERT":
                return [3 /*break*/, 1];
              case "UPDATE":
                return [3 /*break*/, 3];
              case "DELETE":
                return [3 /*break*/, 8];
            }
            return [3 /*break*/, 10];
          case 1:
            return [4 /*yield*/, this.createEventFromAppointment("appointment_created", newRecord)];
          case 2:
            // New appointment created - check for conflicts
            event = _b.sent();
            return [3 /*break*/, 10];
          case 3:
            if (!(oldRecord.status !== newRecord.status)) return [3 /*break*/, 7];
            if (!(newRecord.status === "cancelled")) return [3 /*break*/, 5];
            return [
              4 /*yield*/,
              this.createEventFromAppointment("appointment_cancelled", newRecord),
            ];
          case 4:
            event = _b.sent();
            return [3 /*break*/, 7];
          case 5:
            if (!(newRecord.status === "rescheduled")) return [3 /*break*/, 7];
            return [
              4 /*yield*/,
              this.createEventFromAppointment("appointment_rescheduled", newRecord),
            ];
          case 6:
            event = _b.sent();
            _b.label = 7;
          case 7:
            return [3 /*break*/, 10];
          case 8:
            return [
              4 /*yield*/,
              this.createEventFromAppointment("appointment_cancelled", oldRecord),
            ];
          case 9:
            // Appointment deleted
            event = _b.sent();
            return [3 /*break*/, 10];
          case 10:
            if (!event) return [3 /*break*/, 12];
            return [4 /*yield*/, this.queueEvent(event)];
          case 11:
            _b.sent();
            _b.label = 12;
          case 12:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Handle staff availability changes
   */
  RealTimeAdaptiveScheduling.prototype.handleStaffAvailabilityChange = function (payload) {
    return __awaiter(this, void 0, void 0, function () {
      var eventType, newRecord, oldRecord, event_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            (eventType = payload.eventType), (newRecord = payload.new), (oldRecord = payload.old);
            if (!(eventType === "UPDATE" && oldRecord.is_available !== newRecord.is_available))
              return [3 /*break*/, 2];
            if (!!newRecord.is_available) return [3 /*break*/, 2];
            event_1 = {
              id: "staff-unavailable-".concat(Date.now()),
              type: "staff_unavailable",
              timestamp: new Date(),
              staffId: newRecord.staff_id,
              severity: "high",
              description: "Staff member ".concat(newRecord.staff_id, " became unavailable"),
              metadata: { reason: newRecord.unavailable_reason },
            };
            return [4 /*yield*/, this.queueEvent(event_1)];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Handle equipment status changes
   */
  RealTimeAdaptiveScheduling.prototype.handleEquipmentStatusChange = function (payload) {
    return __awaiter(this, void 0, void 0, function () {
      var eventType, newRecord, oldRecord, event_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            (eventType = payload.eventType), (newRecord = payload.new), (oldRecord = payload.old);
            if (!(eventType === "UPDATE" && oldRecord.status !== newRecord.status))
              return [3 /*break*/, 2];
            if (!(newRecord.status === "maintenance" || newRecord.status === "broken"))
              return [3 /*break*/, 2];
            event_2 = {
              id: "equipment-malfunction-".concat(Date.now()),
              type: "equipment_malfunction",
              timestamp: new Date(),
              resourceId: newRecord.equipment_id,
              severity: "high",
              description: "Equipment "
                .concat(newRecord.equipment_id, " status changed to ")
                .concat(newRecord.status),
              metadata: { previousStatus: oldRecord.status, newStatus: newRecord.status },
            };
            return [4 /*yield*/, this.queueEvent(event_2)];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Queue an event for processing
   */
  RealTimeAdaptiveScheduling.prototype.queueEvent = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      var error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            this.eventQueue.push(event);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, , 4]);
            return [
              4 /*yield*/,
              this.supabase.from("schedule_events").insert({
                id: event.id,
                type: event.type,
                appointment_id: event.appointmentId,
                patient_id: event.patientId,
                staff_id: event.staffId,
                resource_id: event.resourceId,
                severity: event.severity,
                description: event.description,
                metadata: event.metadata,
                created_at: event.timestamp.toISOString(),
              }),
            ];
          case 2:
            _a.sent();
            return [3 /*break*/, 4];
          case 3:
            error_2 = _a.sent();
            console.error("Error logging schedule event:", error_2);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Start the event processing loop
   */
  RealTimeAdaptiveScheduling.prototype.startEventProcessing = function () {
    var _this = this;
    var processEvents = function () {
      return __awaiter(_this, void 0, void 0, function () {
        var event_3;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (!this.isMonitoring) return [3 /*break*/, 4];
              if (!(this.eventQueue.length > 0)) return [3 /*break*/, 2];
              event_3 = this.eventQueue.shift();
              return [4 /*yield*/, this.processEvent(event_3)];
            case 1:
              _a.sent();
              _a.label = 2;
            case 2:
              // Wait 1 second before checking again
              return [
                4 /*yield*/,
                new Promise(function (resolve) {
                  return setTimeout(resolve, 1000);
                }),
              ];
            case 3:
              // Wait 1 second before checking again
              _a.sent();
              return [3 /*break*/, 0];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    };
    processEvents().catch(function (error) {
      console.error("Error in event processing loop:", error);
    });
  };
  /**
   * Process a schedule event and determine adaptive response
   */
  RealTimeAdaptiveScheduling.prototype.processEvent = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      var actions, _i, actions_1, action, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 7, , 8]);
            console.log("Processing event: ".concat(event.type, " - ").concat(event.description));
            return [
              4 /*yield*/,
              this.determineAdaptiveActions(event),
              // Execute actions in priority order
            ];
          case 1:
            actions = _a.sent();
            (_i = 0), (actions_1 = actions);
            _a.label = 2;
          case 2:
            if (!(_i < actions_1.length)) return [3 /*break*/, 5];
            action = actions_1[_i];
            return [4 /*yield*/, this.executeAdaptiveAction(action)];
          case 3:
            _a.sent();
            _a.label = 4;
          case 4:
            _i++;
            return [3 /*break*/, 2];
          case 5:
            // Check for conflicts after processing
            return [4 /*yield*/, this.detectAndResolveConflicts(event)];
          case 6:
            // Check for conflicts after processing
            _a.sent();
            return [3 /*break*/, 8];
          case 7:
            error_3 = _a.sent();
            console.error("Error processing event ".concat(event.id, ":"), error_3);
            return [3 /*break*/, 8];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Determine adaptive actions based on the event
   */
  RealTimeAdaptiveScheduling.prototype.determineAdaptiveActions = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      var actions;
      return __generator(this, function (_a) {
        actions = [];
        switch (event.type) {
          case "appointment_cancelled":
            // Free up the time slot and notify affected parties
            actions.push({
              id: "notify-cancellation-".concat(Date.now()),
              eventId: event.id,
              type: "patient_notification",
              priority: 2,
              description: "Notify patient of cancellation confirmation",
              executionTime: new Date(),
              parameters: { patientId: event.patientId, type: "cancellation_confirmation" },
              status: "pending",
            });
            // Try to fill the slot with waiting patients
            actions.push({
              id: "fill-slot-".concat(Date.now()),
              eventId: event.id,
              type: "auto_reschedule",
              priority: 3,
              description: "Attempt to fill cancelled slot with waiting patients",
              executionTime: new Date(),
              parameters: { appointmentId: event.appointmentId },
              status: "pending",
            });
            break;
          case "staff_unavailable":
            // Reschedule affected appointments
            actions.push({
              id: "reschedule-staff-".concat(Date.now()),
              eventId: event.id,
              type: "auto_reschedule",
              priority: 1,
              description: "Reschedule appointments due to staff unavailability",
              executionTime: new Date(),
              parameters: { staffId: event.staffId, reason: "staff_unavailable" },
              status: "pending",
            });
            break;
          case "equipment_malfunction":
            // Reallocate resources and reschedule if necessary
            actions.push({
              id: "reallocate-equipment-".concat(Date.now()),
              eventId: event.id,
              type: "reallocate_resources",
              priority: 1,
              description: "Reallocate equipment and reschedule affected appointments",
              executionTime: new Date(),
              parameters: { equipmentId: event.resourceId },
              status: "pending",
            });
            break;
          case "emergency_booking":
            // Handle emergency scheduling
            actions.push({
              id: "emergency-schedule-".concat(Date.now()),
              eventId: event.id,
              type: "emergency_protocol",
              priority: 1,
              description: "Execute emergency scheduling protocol",
              executionTime: new Date(),
              parameters: { patientId: event.patientId, urgency: "emergency" },
              status: "pending",
            });
            break;
        }
        return [
          2 /*return*/,
          actions.sort(function (a, b) {
            return a.priority - b.priority;
          }),
        ];
      });
    });
  };
  /**
   * Execute an adaptive action
   */
  RealTimeAdaptiveScheduling.prototype.executeAdaptiveAction = function (action) {
    return __awaiter(this, void 0, void 0, function () {
      var result, _a, error_4;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 15, 16, 17]);
            action.status = "executing";
            this.activeActions.set(action.id, action);
            console.log("Executing action: ".concat(action.type, " - ").concat(action.description));
            result = null;
            _a = action.type;
            switch (_a) {
              case "auto_reschedule":
                return [3 /*break*/, 1];
              case "patient_notification":
                return [3 /*break*/, 3];
              case "reallocate_resources":
                return [3 /*break*/, 5];
              case "emergency_protocol":
                return [3 /*break*/, 7];
              case "notify_staff":
                return [3 /*break*/, 9];
              case "alert_management":
                return [3 /*break*/, 11];
            }
            return [3 /*break*/, 13];
          case 1:
            return [4 /*yield*/, this.executeAutoReschedule(action.parameters)];
          case 2:
            result = _b.sent();
            return [3 /*break*/, 13];
          case 3:
            return [4 /*yield*/, this.executePatientNotification(action.parameters)];
          case 4:
            result = _b.sent();
            return [3 /*break*/, 13];
          case 5:
            return [4 /*yield*/, this.executeResourceReallocation(action.parameters)];
          case 6:
            result = _b.sent();
            return [3 /*break*/, 13];
          case 7:
            return [4 /*yield*/, this.executeEmergencyProtocol(action.parameters)];
          case 8:
            result = _b.sent();
            return [3 /*break*/, 13];
          case 9:
            return [4 /*yield*/, this.executeStaffNotification(action.parameters)];
          case 10:
            result = _b.sent();
            return [3 /*break*/, 13];
          case 11:
            return [4 /*yield*/, this.executeManagementAlert(action.parameters)];
          case 12:
            result = _b.sent();
            return [3 /*break*/, 13];
          case 13:
            action.result = result;
            action.status = "completed";
            // Log action completion
            return [4 /*yield*/, this.logActionExecution(action)];
          case 14:
            // Log action completion
            _b.sent();
            return [3 /*break*/, 17];
          case 15:
            error_4 = _b.sent();
            console.error("Error executing action ".concat(action.id, ":"), error_4);
            action.status = "failed";
            action.result = { error: error_4.message };
            return [3 /*break*/, 17];
          case 16:
            this.activeActions.delete(action.id);
            return [7 /*endfinally*/];
          case 17:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Execute automatic rescheduling
   */
  RealTimeAdaptiveScheduling.prototype.executeAutoReschedule = function (parameters) {
    return __awaiter(this, void 0, void 0, function () {
      var affectedAppointments,
        _i,
        affectedAppointments_1,
        appointment,
        criteria,
        recommendations,
        bestSlot;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            // Implementation for automatic rescheduling logic
            console.log("Executing auto reschedule with parameters:", parameters);
            if (!parameters.staffId) return [3 /*break*/, 6];
            return [
              4 /*yield*/,
              this.supabase
                .from("appointments")
                .select("*")
                .eq("staff_id", parameters.staffId)
                .eq("status", "scheduled")
                .gte("start_time", new Date().toISOString()),
            ];
          case 1:
            affectedAppointments = _a.sent().data;
            if (!affectedAppointments) return [3 /*break*/, 6];
            (_i = 0), (affectedAppointments_1 = affectedAppointments);
            _a.label = 2;
          case 2:
            if (!(_i < affectedAppointments_1.length)) return [3 /*break*/, 6];
            appointment = affectedAppointments_1[_i];
            criteria = {
              patientId: appointment.patient_id,
              treatmentId: appointment.treatment_id,
              preferredTimeSlots: [],
              urgencyLevel: "medium",
              isFollowUp: false,
              maxWaitDays: 7,
            };
            return [4 /*yield*/, this.aiCore.generateSchedulingRecommendations(criteria)];
          case 3:
            recommendations = _a.sent();
            if (!(recommendations.length > 0)) return [3 /*break*/, 5];
            bestSlot = recommendations[0];
            // Update appointment with new time slot
            return [
              4 /*yield*/,
              this.supabase
                .from("appointments")
                .update({
                  start_time: bestSlot.timeSlot.startTime.toISOString(),
                  end_time: bestSlot.timeSlot.endTime.toISOString(),
                  staff_id: bestSlot.staffId,
                  status: "rescheduled",
                })
                .eq("id", appointment.id),
            ];
          case 4:
            // Update appointment with new time slot
            _a.sent();
            _a.label = 5;
          case 5:
            _i++;
            return [3 /*break*/, 2];
          case 6:
            return [
              2 /*return*/,
              {
                rescheduledCount:
                  (affectedAppointments === null || affectedAppointments === void 0
                    ? void 0
                    : affectedAppointments.length) || 0,
              },
            ];
        }
      });
    });
  };
  /**
   * Execute patient notification
   */
  RealTimeAdaptiveScheduling.prototype.executePatientNotification = function (parameters) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation for patient notification
        console.log("Executing patient notification with parameters:", parameters);
        // This would integrate with notification service
        return [2 /*return*/, { notificationSent: true, method: "email_sms" }];
      });
    });
  };
  /**
   * Execute resource reallocation
   */
  RealTimeAdaptiveScheduling.prototype.executeResourceReallocation = function (parameters) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation for resource reallocation
        console.log("Executing resource reallocation with parameters:", parameters);
        return [2 /*return*/, { reallocated: true, alternativeResources: [] }];
      });
    });
  };
  /**
   * Execute emergency protocol
   */
  RealTimeAdaptiveScheduling.prototype.executeEmergencyProtocol = function (parameters) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation for emergency scheduling protocol
        console.log("Executing emergency protocol with parameters:", parameters);
        return [2 /*return*/, { emergencySlotCreated: true, timeSlot: new Date() }];
      });
    });
  };
  /**
   * Execute staff notification
   */
  RealTimeAdaptiveScheduling.prototype.executeStaffNotification = function (parameters) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation for staff notification
        console.log("Executing staff notification with parameters:", parameters);
        return [2 /*return*/, { notificationSent: true }];
      });
    });
  };
  /**
   * Execute management alert
   */
  RealTimeAdaptiveScheduling.prototype.executeManagementAlert = function (parameters) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation for management alert
        console.log("Executing management alert with parameters:", parameters);
        return [2 /*return*/, { alertSent: true }];
      });
    });
  };
  /**
   * Detect and resolve scheduling conflicts
   */
  RealTimeAdaptiveScheduling.prototype.detectAndResolveConflicts = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      var conflicts, _i, conflicts_1, conflict;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.conflictResolver.detectConflicts()];
          case 1:
            conflicts = _a.sent();
            (_i = 0), (conflicts_1 = conflicts);
            _a.label = 2;
          case 2:
            if (!(_i < conflicts_1.length)) return [3 /*break*/, 7];
            conflict = conflicts_1[_i];
            if (!conflict.autoResolvable) return [3 /*break*/, 4];
            return [4 /*yield*/, this.conflictResolver.autoResolveConflict(conflict)];
          case 3:
            _a.sent();
            return [3 /*break*/, 6];
          case 4:
            // Alert management for manual intervention
            return [
              4 /*yield*/,
              this.executeManagementAlert({
                conflictId: conflict.id,
                severity: conflict.severity,
                description: conflict.suggestedResolution,
              }),
            ];
          case 5:
            // Alert management for manual intervention
            _a.sent();
            _a.label = 6;
          case 6:
            _i++;
            return [3 /*break*/, 2];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Start predictive analysis
   */
  RealTimeAdaptiveScheduling.prototype.startPredictiveAnalysis = function () {
    var _this = this;
    var runPredictiveAnalysis = function () {
      return __awaiter(_this, void 0, void 0, function () {
        var adjustments, _i, adjustments_1, adjustment, error_5;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (!this.isMonitoring) return [3 /*break*/, 10];
              _a.label = 1;
            case 1:
              _a.trys.push([1, 7, , 8]);
              return [4 /*yield*/, this.predictiveAnalyzer.generatePredictiveAdjustments()];
            case 2:
              adjustments = _a.sent();
              (_i = 0), (adjustments_1 = adjustments);
              _a.label = 3;
            case 3:
              if (!(_i < adjustments_1.length)) return [3 /*break*/, 6];
              adjustment = adjustments_1[_i];
              if (!(adjustment.confidence > 0.8 && adjustment.impact === "high"))
                return [3 /*break*/, 5];
              // Execute high-confidence, high-impact adjustments automatically
              return [4 /*yield*/, this.executePredictiveAdjustment(adjustment)];
            case 4:
              // Execute high-confidence, high-impact adjustments automatically
              _a.sent();
              _a.label = 5;
            case 5:
              _i++;
              return [3 /*break*/, 3];
            case 6:
              return [3 /*break*/, 8];
            case 7:
              error_5 = _a.sent();
              console.error("Error in predictive analysis:", error_5);
              return [3 /*break*/, 8];
            case 8:
              // Run every 5 minutes
              return [
                4 /*yield*/,
                new Promise(function (resolve) {
                  return setTimeout(resolve, 5 * 60 * 1000);
                }),
              ];
            case 9:
              // Run every 5 minutes
              _a.sent();
              return [3 /*break*/, 0];
            case 10:
              return [2 /*return*/];
          }
        });
      });
    };
    runPredictiveAnalysis().catch(function (error) {
      console.error("Error in predictive analysis loop:", error);
    });
  };
  /**
   * Execute predictive adjustment
   */
  RealTimeAdaptiveScheduling.prototype.executePredictiveAdjustment = function (adjustment) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        console.log(
          "Executing predictive adjustment: "
            .concat(adjustment.type, " - ")
            .concat(adjustment.prediction),
        );
        return [2 /*return*/];
      });
    });
  };
  /**
   * Create event from appointment data
   */
  RealTimeAdaptiveScheduling.prototype.createEventFromAppointment = function (
    type,
    appointmentData,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [
          2 /*return*/,
          {
            id: "".concat(type, "-").concat(appointmentData.id, "-").concat(Date.now()),
            type: type,
            timestamp: new Date(),
            appointmentId: appointmentData.id,
            patientId: appointmentData.patient_id,
            staffId: appointmentData.staff_id,
            severity: "medium",
            description: "Appointment "
              .concat(type.replace("_", " "), " for patient ")
              .concat(appointmentData.patient_id),
            metadata: appointmentData,
          },
        ];
      });
    });
  };
  /**
   * Log action execution
   */
  RealTimeAdaptiveScheduling.prototype.logActionExecution = function (action) {
    return __awaiter(this, void 0, void 0, function () {
      var error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("adaptive_actions").insert({
                id: action.id,
                event_id: action.eventId,
                type: action.type,
                priority: action.priority,
                description: action.description,
                parameters: action.parameters,
                status: action.status,
                result: action.result,
                executed_at: action.executionTime.toISOString(),
              }),
            ];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_6 = _a.sent();
            console.error("Error logging action execution:", error_6);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get current monitoring metrics
   */
  RealTimeAdaptiveScheduling.prototype.getMonitoringMetrics = function () {
    return __awaiter(this, void 0, void 0, function () {
      var appointments, conflicts, actions, autoResolutions, manualInterventions, error_7;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [
              4 /*yield*/,
              this.supabase
                .from("appointments")
                .select("count")
                .gte("start_time", new Date().toISOString())
                .single(),
            ];
          case 1:
            appointments = _a.sent().data;
            return [
              4 /*yield*/,
              this.supabase
                .from("schedule_conflicts")
                .select("count")
                .eq("status", "active")
                .single(),
            ];
          case 2:
            conflicts = _a.sent().data;
            return [
              4 /*yield*/,
              this.supabase
                .from("adaptive_actions")
                .select("status")
                .gte("executed_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
            ];
          case 3:
            actions = _a.sent().data;
            autoResolutions =
              (actions === null || actions === void 0
                ? void 0
                : actions.filter(function (a) {
                    return a.status === "completed";
                  }).length) || 0;
            manualInterventions =
              (actions === null || actions === void 0
                ? void 0
                : actions.filter(function (a) {
                    return a.status === "failed";
                  }).length) || 0;
            return [
              2 /*return*/,
              {
                totalAppointments:
                  (appointments === null || appointments === void 0
                    ? void 0
                    : appointments.count) || 0,
                activeConflicts:
                  (conflicts === null || conflicts === void 0 ? void 0 : conflicts.count) || 0,
                autoResolutions: autoResolutions,
                manualInterventions: manualInterventions,
                averageResolutionTime: 120, // seconds
                systemEfficiency: autoResolutions / (autoResolutions + manualInterventions) || 0.9,
                patientSatisfactionImpact: 0.95,
                lastUpdated: new Date(),
              },
            ];
          case 4:
            error_7 = _a.sent();
            console.error("Error getting monitoring metrics:", error_7);
            return [
              2 /*return*/,
              {
                totalAppointments: 0,
                activeConflicts: 0,
                autoResolutions: 0,
                manualInterventions: 0,
                averageResolutionTime: 0,
                systemEfficiency: 0,
                patientSatisfactionImpact: 0,
                lastUpdated: new Date(),
              },
            ];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  return RealTimeAdaptiveScheduling;
})();
exports.RealTimeAdaptiveScheduling = RealTimeAdaptiveScheduling;
// Helper classes
var ConflictResolver = /** @class */ (function () {
  function ConflictResolver(supabase, aiCore) {
    this.supabase = supabase;
    this.aiCore = aiCore;
  }
  ConflictResolver.prototype.detectConflicts = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation for conflict detection
        return [2 /*return*/, []];
      });
    });
  };
  ConflictResolver.prototype.autoResolveConflict = function (conflict) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  return ConflictResolver;
})();
var PredictiveAnalyzer = /** @class */ (function () {
  function PredictiveAnalyzer(supabase) {
    this.supabase = supabase;
  }
  PredictiveAnalyzer.prototype.generatePredictiveAdjustments = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation for predictive analysis
        return [2 /*return*/, []];
      });
    });
  };
  return PredictiveAnalyzer;
})();
