"use strict";
/**
 * ============================================================================
 * NEONPRO ADVANCED SCHEDULING CONFLICT RESOLUTION - TYPE DEFINITIONS
 * Research-backed implementation with Context7 + Tavily + Exa validation
 * Quality Standard: ≥9.5/10
 * ============================================================================
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeverityLevelSchema = exports.StrategyTypeSchema = exports.ConflictTypeSchema = exports.ResolutionExecutionError = exports.ConflictDetectionError = void 0;
// Error types
var ConflictDetectionError = /** @class */ (function (_super) {
    __extends(ConflictDetectionError, _super);
    function ConflictDetectionError(message, conflictId, errorCode, details) {
        var _this = _super.call(this, message) || this;
        _this.conflictId = conflictId;
        _this.errorCode = errorCode;
        _this.details = details;
        _this.name = 'ConflictDetectionError';
        return _this;
    }
    return ConflictDetectionError;
}(Error));
exports.ConflictDetectionError = ConflictDetectionError;
var ResolutionExecutionError = /** @class */ (function (_super) {
    __extends(ResolutionExecutionError, _super);
    function ResolutionExecutionError(message, strategyType, conflictId, executionTimeMs, details) {
        var _this = _super.call(this, message) || this;
        _this.strategyType = strategyType;
        _this.conflictId = conflictId;
        _this.executionTimeMs = executionTimeMs;
        _this.details = details;
        _this.name = 'ResolutionExecutionError';
        return _this;
    }
    return ResolutionExecutionError;
}(Error));
exports.ResolutionExecutionError = ResolutionExecutionError;
// Validation schemas (for runtime type checking)
exports.ConflictTypeSchema = [
    'time_overlap',
    'resource_conflict',
    'capacity_limit',
    'staff_unavailable',
    'room_conflict',
    'equipment_conflict'
];
exports.StrategyTypeSchema = [
    'mip_optimization',
    'constraint_programming',
    'genetic_algorithm',
    'reinforcement_learning',
    'rule_based',
    'hybrid'
];
exports.SeverityLevelSchema = [1, 2, 3, 4, 5];
