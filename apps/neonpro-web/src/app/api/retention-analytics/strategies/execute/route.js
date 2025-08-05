"use strict";
// =====================================================================================
// STRATEGY EXECUTION API ENDPOINT
// Epic 7.4: Patient Retention Analytics + Predictions
// API endpoint for executing retention strategies
// =====================================================================================
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
exports.POST = POST;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var retention_analytics_service_1 = require("@/app/lib/services/retention-analytics-service");
var zod_1 = require("zod");
// =====================================================================================
// VALIDATION SCHEMAS
// =====================================================================================
var ExecuteStrategySchema = zod_1.z.object({
    strategyId: zod_1.z.string().uuid('Invalid strategy ID format'),
    clinicId: zod_1.z.string().uuid('Invalid clinic ID format'),
    patientIds: zod_1.z.array(zod_1.z.string().uuid()).min(1, 'At least one patient ID required'),
    executeImmediately: zod_1.z.boolean().default(false),
    scheduledAt: zod_1.z.string().optional(),
    dryRun: zod_1.z.boolean().default(false),
    notes: zod_1.z.string().optional(),
});
// =====================================================================================
// EXECUTE RETENTION STRATEGY
// =====================================================================================
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var body, validation, _a, strategyId_1, clinicId, patientIds, executeImmediately, scheduledAt, dryRun, notes, supabase, _b, user, authError, _c, userProfile, profileError, allowedRoles, retentionService, strategies, strategy_1, _d, validPatients_1, validationError, invalidIds, scheduledDate, now, simulation, executionResult, logError, error_1;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 9, , 10]);
                    return [4 /*yield*/, request.json()];
                case 1:
                    body = _e.sent();
                    validation = ExecuteStrategySchema.safeParse(body);
                    if (!validation.success) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                error: 'Invalid execution data',
                                details: validation.error.issues
                            }, { status: 400 })];
                    }
                    _a = validation.data, strategyId_1 = _a.strategyId, clinicId = _a.clinicId, patientIds = _a.patientIds, executeImmediately = _a.executeImmediately, scheduledAt = _a.scheduledAt, dryRun = _a.dryRun, notes = _a.notes;
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 2:
                    supabase = _e.sent();
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 3:
                    _b = _e.sent(), user = _b.data.user, authError = _b.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, supabase
                            .from('profiles')
                            .select('clinic_id, role')
                            .eq('id', user.id)
                            .single()];
                case 4:
                    _c = _e.sent(), userProfile = _c.data, profileError = _c.error;
                    if (profileError || !userProfile) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'User profile not found' }, { status: 403 })];
                    }
                    if (userProfile.clinic_id !== clinicId) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Access denied to clinic data' }, { status: 403 })];
                    }
                    allowedRoles = ['admin', 'manager', 'professional', 'analyst'];
                    if (!allowedRoles.includes(userProfile.role)) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Insufficient permissions to execute strategies' }, { status: 403 })];
                    }
                    retentionService = new retention_analytics_service_1.RetentionAnalyticsService();
                    return [4 /*yield*/, retentionService.getRetentionStrategies(clinicId)];
                case 5:
                    strategies = _e.sent();
                    strategy_1 = strategies.find(function (s) { return s.id === strategyId_1; });
                    if (!strategy_1) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Strategy not found or does not belong to clinic' }, { status: 404 })];
                    }
                    if (!strategy_1.is_active) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Cannot execute inactive strategy' }, { status: 400 })];
                    }
                    return [4 /*yield*/, supabase
                            .from('patients')
                            .select('id, name')
                            .eq('clinic_id', clinicId)
                            .in('id', patientIds)];
                case 6:
                    _d = _e.sent(), validPatients_1 = _d.data, validationError = _d.error;
                    if (validationError) {
                        throw new Error("Failed to validate patients: ".concat(validationError.message));
                    }
                    if (validPatients_1.length !== patientIds.length) {
                        invalidIds = patientIds.filter(function (id) {
                            return !validPatients_1.some(function (p) { return p.id === id; });
                        });
                        return [2 /*return*/, server_1.NextResponse.json({
                                error: 'Some patients do not belong to the specified clinic',
                                invalidPatientIds: invalidIds
                            }, { status: 400 })];
                    }
                    // Validate scheduled execution time if provided
                    if (scheduledAt && !executeImmediately) {
                        scheduledDate = new Date(scheduledAt);
                        now = new Date();
                        if (scheduledDate <= now) {
                            return [2 /*return*/, server_1.NextResponse.json({ error: 'Scheduled execution time must be in the future' }, { status: 400 })];
                        }
                    }
                    // Execute strategy (or simulate if dry run)
                    if (dryRun) {
                        simulation = {
                            strategy: {
                                id: strategy_1.id,
                                name: strategy_1.name,
                                type: strategy_1.strategy_type,
                                description: strategy_1.description
                            },
                            targets: validPatients_1.map(function (p) { return ({
                                patientId: p.id,
                                patientName: p.name,
                                actions: strategy_1.action_sequence.map(function (action) { return ({
                                    type: action.type,
                                    description: action.description || "".concat(action.type, " action"),
                                    channel: action.channel,
                                    estimated_execution_time: action.delay_minutes ? "".concat(action.delay_minutes, " minutes") : 'Immediate'
                                }); })
                            }); }),
                            execution_plan: {
                                total_patients: validPatients_1.length,
                                total_actions: strategy_1.action_sequence.length * validPatients_1.length,
                                estimated_duration: strategy_1.action_sequence.reduce(function (sum, action) {
                                    return sum + (action.delay_minutes || 0);
                                }, 0),
                                scheduled_for: scheduledAt || (executeImmediately ? 'Immediate' : 'Not scheduled'),
                                execution_type: 'Simulation (Dry Run)'
                            }
                        };
                        return [2 /*return*/, server_1.NextResponse.json({
                                success: true,
                                data: simulation,
                                message: 'Strategy execution simulated successfully',
                                isDryRun: true,
                                timestamp: new Date().toISOString()
                            })];
                    }
                    return [4 /*yield*/, retentionService.executeRetentionStrategy(strategyId_1, patientIds)];
                case 7:
                    executionResult = _e.sent();
                    return [4 /*yield*/, supabase
                            .from('retention_strategy_executions')
                            .insert({
                            strategy_id: strategyId_1,
                            clinic_id: clinicId,
                            executed_by: user.id,
                            patient_ids: patientIds,
                            execution_status: executionResult.success ? 'completed' : 'failed',
                            execution_results: executionResult,
                            notes: notes,
                            scheduled_at: scheduledAt ? new Date(scheduledAt) : null,
                            executed_at: executeImmediately ? new Date() : null,
                        })];
                case 8:
                    logError = (_e.sent()).error;
                    if (logError) {
                        console.error('Failed to log strategy execution:', logError);
                        // Don't fail the request for logging errors
                    }
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: {
                                execution: executionResult,
                                strategy: {
                                    id: strategy_1.id,
                                    name: strategy_1.name,
                                    type: strategy_1.strategy_type
                                },
                                targets: validPatients_1,
                                executionMetadata: {
                                    executed_by: user.id,
                                    executed_at: new Date().toISOString(),
                                    scheduled_at: scheduledAt,
                                    immediate: executeImmediately,
                                    notes: notes
                                }
                            },
                            message: "Strategy executed ".concat(executionResult.success ? 'successfully' : 'with errors', " for ").concat(validPatients_1.length, " patients"),
                            timestamp: new Date().toISOString()
                        })];
                case 9:
                    error_1 = _e.sent();
                    console.error('Error executing retention strategy:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({
                            error: 'Internal server error',
                            message: error_1 instanceof Error ? error_1.message : 'Unknown error'
                        }, { status: 500 })];
                case 10: return [2 /*return*/];
            }
        });
    });
}
