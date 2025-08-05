"use strict";
/**
 * Types and interfaces for the Intelligent Conflict Resolution System
 * Handles scheduling conflicts, resource optimization, and automated resolution
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResolutionStrategy = exports.ConflictSeverity = exports.ConflictType = void 0;
var ConflictType;
(function (ConflictType) {
    ConflictType["TIME_OVERLAP"] = "time_overlap";
    ConflictType["STAFF_UNAVAILABLE"] = "staff_unavailable";
    ConflictType["ROOM_OCCUPIED"] = "room_occupied";
    ConflictType["EQUIPMENT_UNAVAILABLE"] = "equipment_unavailable";
    ConflictType["RESOURCE_OVERBOOKED"] = "resource_overbooked";
    ConflictType["SCHEDULE_VIOLATION"] = "schedule_violation";
    ConflictType["CAPACITY_EXCEEDED"] = "capacity_exceeded";
})(ConflictType || (exports.ConflictType = ConflictType = {}));
var ConflictSeverity;
(function (ConflictSeverity) {
    ConflictSeverity["LOW"] = "low";
    ConflictSeverity["MEDIUM"] = "medium";
    ConflictSeverity["HIGH"] = "high";
    ConflictSeverity["CRITICAL"] = "critical";
})(ConflictSeverity || (exports.ConflictSeverity = ConflictSeverity = {}));
// Resolution Strategy Types
var ResolutionStrategy;
(function (ResolutionStrategy) {
    ResolutionStrategy["RESCHEDULE_LATER"] = "reschedule_later";
    ResolutionStrategy["RESCHEDULE_EARLIER"] = "reschedule_earlier";
    ResolutionStrategy["CHANGE_STAFF"] = "change_staff";
    ResolutionStrategy["CHANGE_ROOM"] = "change_room";
    ResolutionStrategy["CHANGE_EQUIPMENT"] = "change_equipment";
    ResolutionStrategy["SPLIT_APPOINTMENT"] = "split_appointment";
    ResolutionStrategy["MERGE_APPOINTMENTS"] = "merge_appointments";
    ResolutionStrategy["EXTEND_HOURS"] = "extend_hours";
    ResolutionStrategy["DELEGATE_TO_ALTERNATIVE"] = "delegate_to_alternative";
    ResolutionStrategy["MANUAL_INTERVENTION"] = "manual_intervention";
})(ResolutionStrategy || (exports.ResolutionStrategy = ResolutionStrategy = {}));
