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
exports.DataRetentionAutomation = void 0;
var DataRetentionAutomation = /** @class */ (function () {
    function DataRetentionAutomation(supabase, complianceManager, config) {
        this.executionInterval = null;
        this.supabase = supabase;
        this.complianceManager = complianceManager;
        this.config = config;
    }
    /**
     * Start Automated Retention Processing
     */
    DataRetentionAutomation.prototype.startAutomatedRetention = function () {
        return __awaiter(this, arguments, void 0, function (checkIntervalHours) {
            var error_1;
            var _this = this;
            if (checkIntervalHours === void 0) { checkIntervalHours = 24; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (this.executionInterval) {
                            clearInterval(this.executionInterval);
                        }
                        // Initial retention check
                        return [4 /*yield*/, this.processRetentionSchedules()
                            // Set up automated processing
                        ];
                    case 1:
                        // Initial retention check
                        _a.sent();
                        // Set up automated processing
                        if (this.config.auto_execution_enabled) {
                            this.executionInterval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                                var error_2;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            _a.trys.push([0, 2, , 3]);
                                            return [4 /*yield*/, this.processRetentionSchedules()];
                                        case 1:
                                            _a.sent();
                                            return [3 /*break*/, 3];
                                        case 2:
                                            error_2 = _a.sent();
                                            console.error('Error in retention processing cycle:', error_2);
                                            return [3 /*break*/, 3];
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            }); }, checkIntervalHours * 60 * 60 * 1000);
                        }
                        console.log("Automated retention processing started (".concat(checkIntervalHours, "h intervals)"));
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Error starting automated retention:', error_1);
                        throw new Error("Failed to start automated retention: ".concat(error_1.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Stop Automated Retention Processing
     */
    DataRetentionAutomation.prototype.stopAutomatedRetention = function () {
        if (this.executionInterval) {
            clearInterval(this.executionInterval);
            this.executionInterval = null;
        }
        console.log('Automated retention processing stopped');
    };
    /**
     * Create Retention Policy
     */
    DataRetentionAutomation.prototype.createRetentionPolicy = function (policyData) {
        return __awaiter(this, void 0, void 0, function () {
            var validation, _a, policy, error, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.validateRetentionPolicy(policyData)];
                    case 1:
                        validation = _b.sent();
                        if (!validation.valid) {
                            throw new Error("Invalid retention policy: ".concat(validation.errors.join(', ')));
                        }
                        return [4 /*yield*/, this.supabase
                                .from('lgpd_retention_policies')
                                .insert(__assign(__assign({}, policyData), { created_at: new Date().toISOString(), updated_at: new Date().toISOString() }))
                                .select('id')
                                .single()];
                    case 2:
                        _a = _b.sent(), policy = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        // Log policy creation
                        return [4 /*yield*/, this.complianceManager.logAuditEvent({
                                event_type: 'retention_policy',
                                resource_type: 'retention_policy',
                                resource_id: policy.id,
                                action: 'policy_created',
                                details: {
                                    policy_name: policyData.name,
                                    data_category: policyData.data_category,
                                    retention_period_days: policyData.retention_period_days,
                                    auto_execution: policyData.auto_execution
                                }
                            })];
                    case 3:
                        // Log policy creation
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                policy_id: policy.id
                            }];
                    case 4:
                        error_3 = _b.sent();
                        console.error('Error creating retention policy:', error_3);
                        throw new Error("Failed to create retention policy: ".concat(error_3.message));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Schedule Retention Execution
     */
    DataRetentionAutomation.prototype.scheduleRetentionExecution = function (policyId, scheduledDate) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, policy, policyError, affectedRecords, executionDate, _b, schedule, scheduleError, error_4;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 7, , 8]);
                        return [4 /*yield*/, this.supabase
                                .from('lgpd_retention_policies')
                                .select('*')
                                .eq('id', policyId)
                                .eq('active', true)
                                .single()];
                    case 1:
                        _a = _c.sent(), policy = _a.data, policyError = _a.error;
                        if (policyError)
                            throw policyError;
                        if (!policy)
                            throw new Error('Retention policy not found or inactive');
                        return [4 /*yield*/, this.calculateAffectedRecords(policy)
                            // Determine execution date
                        ];
                    case 2:
                        affectedRecords = _c.sent();
                        executionDate = scheduledDate || this.calculateNextExecutionDate(policy);
                        return [4 /*yield*/, this.supabase
                                .from('lgpd_retention_schedules')
                                .insert({
                                policy_id: policyId,
                                scheduled_date: executionDate,
                                status: policy.requires_approval ? 'pending_approval' : 'scheduled',
                                affected_records: affectedRecords.count,
                                execution_method: policy.deletion_method,
                                approval_required: policy.requires_approval,
                                created_at: new Date().toISOString()
                            })
                                .select('id')
                                .single()];
                    case 3:
                        _b = _c.sent(), schedule = _b.data, scheduleError = _b.error;
                        if (scheduleError)
                            throw scheduleError;
                        if (!this.config.notification_enabled) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.sendRetentionNotification({
                                type: 'schedule_created',
                                policy_name: policy.name,
                                scheduled_date: executionDate,
                                affected_records: affectedRecords.count,
                                requires_approval: policy.requires_approval
                            })];
                    case 4:
                        _c.sent();
                        _c.label = 5;
                    case 5: 
                    // Log scheduling
                    return [4 /*yield*/, this.complianceManager.logAuditEvent({
                            event_type: 'retention_scheduling',
                            resource_type: 'retention_schedule',
                            resource_id: schedule.id,
                            action: 'retention_scheduled',
                            details: {
                                policy_id: policyId,
                                policy_name: policy.name,
                                scheduled_date: executionDate,
                                affected_records: affectedRecords.count,
                                requires_approval: policy.requires_approval
                            }
                        })];
                    case 6:
                        // Log scheduling
                        _c.sent();
                        return [2 /*return*/, {
                                success: true,
                                schedule_id: schedule.id,
                                affected_records: affectedRecords.count
                            }];
                    case 7:
                        error_4 = _c.sent();
                        console.error('Error scheduling retention execution:', error_4);
                        throw new Error("Failed to schedule retention execution: ".concat(error_4.message));
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Execute Retention Schedule
     */
    DataRetentionAutomation.prototype.executeRetentionSchedule = function (scheduleId_1) {
        return __awaiter(this, arguments, void 0, function (scheduleId, forceExecution) {
            var _a, schedule, scheduleError, canExecute, _b, execution, executionError, results, executionError_1, error_5;
            if (forceExecution === void 0) { forceExecution = false; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 15, , 16]);
                        return [4 /*yield*/, this.supabase
                                .from('lgpd_retention_schedules')
                                .select('*, lgpd_retention_policies(*)')
                                .eq('id', scheduleId)
                                .single()];
                    case 1:
                        _a = _c.sent(), schedule = _a.data, scheduleError = _a.error;
                        if (scheduleError)
                            throw scheduleError;
                        if (!schedule)
                            throw new Error('Retention schedule not found');
                        if (!!forceExecution) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.validateExecutionConditions(schedule)];
                    case 2:
                        canExecute = _c.sent();
                        if (!canExecute.valid) {
                            throw new Error("Cannot execute retention: ".concat(canExecute.reason));
                        }
                        _c.label = 3;
                    case 3: return [4 /*yield*/, this.supabase
                            .from('lgpd_retention_executions')
                            .insert({
                            schedule_id: scheduleId,
                            policy_id: schedule.policy_id,
                            execution_start: new Date().toISOString(),
                            status: 'running',
                            records_processed: 0,
                            records_deleted: 0,
                            records_anonymized: 0,
                            records_archived: 0,
                            errors: [],
                            execution_log: []
                        })
                            .select('id')
                            .single()];
                    case 4:
                        _b = _c.sent(), execution = _b.data, executionError = _b.error;
                        if (executionError)
                            throw executionError;
                        // Update schedule status
                        return [4 /*yield*/, this.supabase
                                .from('lgpd_retention_schedules')
                                .update({
                                status: 'executing',
                                execution_date: new Date().toISOString()
                            })
                                .eq('id', scheduleId)];
                    case 5:
                        // Update schedule status
                        _c.sent();
                        _c.label = 6;
                    case 6:
                        _c.trys.push([6, 11, , 14]);
                        return [4 /*yield*/, this.performRetentionExecution(execution.id, schedule.lgpd_retention_policies, schedule.affected_records)
                            // Update execution record with results
                        ];
                    case 7:
                        results = _c.sent();
                        // Update execution record with results
                        return [4 /*yield*/, this.supabase
                                .from('lgpd_retention_executions')
                                .update({
                                execution_end: new Date().toISOString(),
                                status: 'completed',
                                records_processed: results.records_processed,
                                records_deleted: results.records_deleted,
                                records_anonymized: results.records_anonymized,
                                records_archived: results.records_archived,
                                execution_log: results.execution_log,
                                verification_hash: results.verification_hash
                            })
                                .eq('id', execution.id)
                            // Update schedule status
                        ];
                    case 8:
                        // Update execution record with results
                        _c.sent();
                        // Update schedule status
                        return [4 /*yield*/, this.supabase
                                .from('lgpd_retention_schedules')
                                .update({ status: 'executed' })
                                .eq('id', scheduleId)
                            // Log successful execution
                        ];
                    case 9:
                        // Update schedule status
                        _c.sent();
                        // Log successful execution
                        return [4 /*yield*/, this.complianceManager.logAuditEvent({
                                event_type: 'retention_execution',
                                resource_type: 'retention_execution',
                                resource_id: execution.id,
                                action: 'retention_executed_successfully',
                                details: {
                                    schedule_id: scheduleId,
                                    policy_name: schedule.lgpd_retention_policies.name,
                                    records_processed: results.records_processed,
                                    records_deleted: results.records_deleted,
                                    records_anonymized: results.records_anonymized,
                                    records_archived: results.records_archived
                                }
                            })];
                    case 10:
                        // Log successful execution
                        _c.sent();
                        return [2 /*return*/, {
                                success: true,
                                execution_id: execution.id,
                                results: results
                            }];
                    case 11:
                        executionError_1 = _c.sent();
                        // Update execution record with error
                        return [4 /*yield*/, this.supabase
                                .from('lgpd_retention_executions')
                                .update({
                                execution_end: new Date().toISOString(),
                                status: 'failed',
                                errors: [{ error: executionError_1.message, timestamp: new Date().toISOString() }]
                            })
                                .eq('id', execution.id)
                            // Update schedule status
                        ];
                    case 12:
                        // Update execution record with error
                        _c.sent();
                        // Update schedule status
                        return [4 /*yield*/, this.supabase
                                .from('lgpd_retention_schedules')
                                .update({ status: 'failed' })
                                .eq('id', scheduleId)];
                    case 13:
                        // Update schedule status
                        _c.sent();
                        throw executionError_1;
                    case 14: return [3 /*break*/, 16];
                    case 15:
                        error_5 = _c.sent();
                        console.error('Error executing retention schedule:', error_5);
                        throw new Error("Failed to execute retention schedule: ".concat(error_5.message));
                    case 16: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Process All Pending Retention Schedules
     */
    DataRetentionAutomation.prototype.processRetentionSchedules = function () {
        return __awaiter(this, void 0, void 0, function () {
            var results, _a, pendingSchedules, error, _i, pendingSchedules_1, schedule, scheduleError_1, error_6;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 10, , 11]);
                        results = {
                            processed: 0,
                            executed: 0,
                            failed: 0,
                            skipped: 0
                        };
                        return [4 /*yield*/, this.supabase
                                .from('lgpd_retention_schedules')
                                .select('*, lgpd_retention_policies(*)')
                                .in('status', ['scheduled', 'approved'])
                                .lte('scheduled_date', new Date().toISOString())
                                .order('scheduled_date', { ascending: true })];
                    case 1:
                        _a = _c.sent(), pendingSchedules = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        if (!pendingSchedules || pendingSchedules.length === 0) {
                            console.log('No pending retention schedules found');
                            return [2 /*return*/, results];
                        }
                        console.log("Processing ".concat(pendingSchedules.length, " pending retention schedules"));
                        _i = 0, pendingSchedules_1 = pendingSchedules;
                        _c.label = 2;
                    case 2:
                        if (!(_i < pendingSchedules_1.length)) return [3 /*break*/, 8];
                        schedule = pendingSchedules_1[_i];
                        results.processed++;
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 5, , 7]);
                        // Check if within execution window
                        if (!this.isWithinExecutionWindow()) {
                            results.skipped++;
                            return [3 /*break*/, 7];
                        }
                        // Execute retention
                        return [4 /*yield*/, this.executeRetentionSchedule(schedule.id)];
                    case 4:
                        // Execute retention
                        _c.sent();
                        results.executed++;
                        console.log("Successfully executed retention schedule ".concat(schedule.id));
                        return [3 /*break*/, 7];
                    case 5:
                        scheduleError_1 = _c.sent();
                        results.failed++;
                        console.error("Failed to execute retention schedule ".concat(schedule.id, ":"), scheduleError_1);
                        // Log failure
                        return [4 /*yield*/, this.complianceManager.logAuditEvent({
                                event_type: 'retention_execution',
                                resource_type: 'retention_schedule',
                                resource_id: schedule.id,
                                action: 'retention_execution_failed',
                                details: {
                                    error: scheduleError_1.message,
                                    policy_name: (_b = schedule.lgpd_retention_policies) === null || _b === void 0 ? void 0 : _b.name
                                }
                            })];
                    case 6:
                        // Log failure
                        _c.sent();
                        return [3 /*break*/, 7];
                    case 7:
                        _i++;
                        return [3 /*break*/, 2];
                    case 8: 
                    // Log processing summary
                    return [4 /*yield*/, this.complianceManager.logAuditEvent({
                            event_type: 'retention_processing',
                            resource_type: 'retention_batch',
                            action: 'batch_processing_completed',
                            details: {
                                processed: results.processed,
                                executed: results.executed,
                                failed: results.failed,
                                skipped: results.skipped,
                                processing_timestamp: new Date().toISOString()
                            }
                        })];
                    case 9:
                        // Log processing summary
                        _c.sent();
                        return [2 /*return*/, results];
                    case 10:
                        error_6 = _c.sent();
                        console.error('Error processing retention schedules:', error_6);
                        throw new Error("Failed to process retention schedules: ".concat(error_6.message));
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get Retention Status Report
     */
    DataRetentionAutomation.prototype.getRetentionStatusReport = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, report, error, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .rpc('get_retention_status_report')];
                    case 1:
                        _a = _b.sent(), report = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, report];
                    case 2:
                        error_7 = _b.sent();
                        console.error('Error getting retention status report:', error_7);
                        throw new Error("Failed to get retention status report: ".concat(error_7.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Approve Retention Schedule
     */
    DataRetentionAutomation.prototype.approveRetentionSchedule = function (scheduleId, approvedBy, notes) {
        return __awaiter(this, void 0, void 0, function () {
            var error, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.supabase
                                .from('lgpd_retention_schedules')
                                .update({
                                status: 'approved',
                                approved_by: approvedBy,
                                approved_at: new Date().toISOString(),
                                approval_notes: notes
                            })
                                .eq('id', scheduleId)
                                .eq('status', 'pending_approval')];
                    case 1:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        // Log approval
                        return [4 /*yield*/, this.complianceManager.logAuditEvent({
                                event_type: 'retention_approval',
                                resource_type: 'retention_schedule',
                                resource_id: scheduleId,
                                action: 'retention_schedule_approved',
                                details: {
                                    approved_by: approvedBy,
                                    approval_notes: notes,
                                    approved_at: new Date().toISOString()
                                }
                            })];
                    case 2:
                        // Log approval
                        _a.sent();
                        return [2 /*return*/, { success: true }];
                    case 3:
                        error_8 = _a.sent();
                        console.error('Error approving retention schedule:', error_8);
                        throw new Error("Failed to approve retention schedule: ".concat(error_8.message));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Private helper methods
    DataRetentionAutomation.prototype.validateRetentionPolicy = function (policy) {
        return __awaiter(this, void 0, void 0, function () {
            var errors;
            return __generator(this, function (_a) {
                errors = [];
                if (!policy.name || policy.name.trim().length === 0) {
                    errors.push('Policy name is required');
                }
                if (!policy.data_category || policy.data_category.trim().length === 0) {
                    errors.push('Data category is required');
                }
                if (!policy.table_name || policy.table_name.trim().length === 0) {
                    errors.push('Table name is required');
                }
                if (!policy.retention_period_days || policy.retention_period_days <= 0) {
                    errors.push('Retention period must be greater than 0');
                }
                if (!policy.legal_basis || policy.legal_basis.trim().length === 0) {
                    errors.push('Legal basis is required');
                }
                if (!['hard_delete', 'soft_delete', 'anonymize', 'archive'].includes(policy.deletion_method)) {
                    errors.push('Invalid deletion method');
                }
                return [2 /*return*/, {
                        valid: errors.length === 0,
                        errors: errors
                    }];
            });
        });
    };
    DataRetentionAutomation.prototype.calculateAffectedRecords = function (policy) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, result, error, error_9;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .rpc('calculate_affected_records', {
                                table_name: policy.table_name,
                                retention_period_days: policy.retention_period_days,
                                data_category: policy.data_category
                            })];
                    case 1:
                        _a = _b.sent(), result = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, result];
                    case 2:
                        error_9 = _b.sent();
                        console.error('Error calculating affected records:', error_9);
                        return [2 /*return*/, { count: 0, sample: [] }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DataRetentionAutomation.prototype.calculateNextExecutionDate = function (policy) {
        var now = new Date();
        var executionDate = new Date(now);
        // Add grace period
        executionDate.setDate(executionDate.getDate() + policy.grace_period_days);
        // Ensure execution is within allowed window
        if (!this.isWithinExecutionWindow(executionDate)) {
            // Move to next allowed day
            while (!this.isWithinExecutionWindow(executionDate)) {
                executionDate.setDate(executionDate.getDate() + 1);
            }
            // Set to start of execution window
            executionDate.setHours(this.config.execution_window.start_hour, 0, 0, 0);
        }
        return executionDate.toISOString();
    };
    DataRetentionAutomation.prototype.validateExecutionConditions = function (schedule) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                // Check if schedule is approved (if approval required)
                if (schedule.approval_required && schedule.status !== 'approved') {
                    return [2 /*return*/, { valid: false, reason: 'Schedule requires approval' }];
                }
                // Check if within execution window
                if (!this.isWithinExecutionWindow()) {
                    return [2 /*return*/, { valid: false, reason: 'Outside execution window' }];
                }
                // Check if policy is still active
                if (!((_a = schedule.lgpd_retention_policies) === null || _a === void 0 ? void 0 : _a.active)) {
                    return [2 /*return*/, { valid: false, reason: 'Retention policy is inactive' }];
                }
                return [2 /*return*/, { valid: true }];
            });
        });
    };
    DataRetentionAutomation.prototype.isWithinExecutionWindow = function (date) {
        var checkDate = date || new Date();
        var hour = checkDate.getHours();
        var dayName = checkDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        var withinHours = hour >= this.config.execution_window.start_hour &&
            hour < this.config.execution_window.end_hour;
        var withinDays = this.config.execution_window.allowed_days.includes(dayName);
        return withinHours && withinDays;
    };
    DataRetentionAutomation.prototype.performRetentionExecution = function (executionId, policy, expectedRecords) {
        return __awaiter(this, void 0, void 0, function () {
            var executionLog, recordsProcessed, recordsDeleted, recordsAnonymized, recordsArchived, archiveResult, _a, deleteResult, softDeleteResult, anonymizeResult, archiveResult, verificationHash, error_10;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        executionLog = [];
                        recordsProcessed = 0;
                        recordsDeleted = 0;
                        recordsAnonymized = 0;
                        recordsArchived = 0;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 15, , 16]);
                        executionLog.push({
                            timestamp: new Date().toISOString(),
                            action: 'execution_started',
                            details: { policy_name: policy.name, expected_records: expectedRecords }
                        });
                        if (!this.config.backup_before_deletion) return [3 /*break*/, 3];
                        executionLog.push({
                            timestamp: new Date().toISOString(),
                            action: 'backup_started'
                        });
                        return [4 /*yield*/, this.createDataArchive(executionId, policy)];
                    case 2:
                        archiveResult = _b.sent();
                        recordsArchived = archiveResult.record_count;
                        executionLog.push({
                            timestamp: new Date().toISOString(),
                            action: 'backup_completed',
                            details: { records_archived: recordsArchived, archive_id: archiveResult.id }
                        });
                        _b.label = 3;
                    case 3:
                        _a = policy.deletion_method;
                        switch (_a) {
                            case 'hard_delete': return [3 /*break*/, 4];
                            case 'soft_delete': return [3 /*break*/, 6];
                            case 'anonymize': return [3 /*break*/, 8];
                            case 'archive': return [3 /*break*/, 10];
                        }
                        return [3 /*break*/, 13];
                    case 4: return [4 /*yield*/, this.performHardDelete(policy)];
                    case 5:
                        deleteResult = _b.sent();
                        recordsDeleted = deleteResult.deleted_count;
                        recordsProcessed = deleteResult.processed_count;
                        return [3 /*break*/, 13];
                    case 6: return [4 /*yield*/, this.performSoftDelete(policy)];
                    case 7:
                        softDeleteResult = _b.sent();
                        recordsDeleted = softDeleteResult.deleted_count;
                        recordsProcessed = softDeleteResult.processed_count;
                        return [3 /*break*/, 13];
                    case 8: return [4 /*yield*/, this.performAnonymization(policy)];
                    case 9:
                        anonymizeResult = _b.sent();
                        recordsAnonymized = anonymizeResult.anonymized_count;
                        recordsProcessed = anonymizeResult.processed_count;
                        return [3 /*break*/, 13];
                    case 10:
                        if (!!this.config.backup_before_deletion) return [3 /*break*/, 12];
                        return [4 /*yield*/, this.createDataArchive(executionId, policy)];
                    case 11:
                        archiveResult = _b.sent();
                        recordsArchived = archiveResult.record_count;
                        recordsProcessed = archiveResult.record_count;
                        _b.label = 12;
                    case 12: return [3 /*break*/, 13];
                    case 13:
                        executionLog.push({
                            timestamp: new Date().toISOString(),
                            action: 'execution_completed',
                            details: {
                                records_processed: recordsProcessed,
                                records_deleted: recordsDeleted,
                                records_anonymized: recordsAnonymized,
                                records_archived: recordsArchived
                            }
                        });
                        return [4 /*yield*/, this.generateVerificationHash({
                                execution_id: executionId,
                                policy_id: policy.id,
                                records_processed: recordsProcessed,
                                records_deleted: recordsDeleted,
                                records_anonymized: recordsAnonymized,
                                records_archived: recordsArchived,
                                execution_timestamp: new Date().toISOString()
                            })];
                    case 14:
                        verificationHash = _b.sent();
                        return [2 /*return*/, {
                                id: executionId,
                                schedule_id: '',
                                policy_id: policy.id,
                                execution_start: new Date().toISOString(),
                                execution_end: new Date().toISOString(),
                                status: 'completed',
                                records_processed: recordsProcessed,
                                records_deleted: recordsDeleted,
                                records_anonymized: recordsAnonymized,
                                records_archived: recordsArchived,
                                errors: [],
                                execution_log: executionLog,
                                verification_hash: verificationHash
                            }];
                    case 15:
                        error_10 = _b.sent();
                        executionLog.push({
                            timestamp: new Date().toISOString(),
                            action: 'execution_failed',
                            error: error_10.message
                        });
                        throw error_10;
                    case 16: return [2 /*return*/];
                }
            });
        });
    };
    DataRetentionAutomation.prototype.createDataArchive = function (executionId, policy) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, archive, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .rpc('create_data_archive', {
                            execution_id: executionId,
                            policy_id: policy.id,
                            table_name: policy.table_name,
                            retention_period_days: policy.retention_period_days
                        })];
                    case 1:
                        _a = _b.sent(), archive = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, archive];
                }
            });
        });
    };
    DataRetentionAutomation.prototype.performHardDelete = function (policy) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, result, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .rpc('perform_hard_delete', {
                            table_name: policy.table_name,
                            retention_period_days: policy.retention_period_days,
                            batch_size: this.config.batch_size
                        })];
                    case 1:
                        _a = _b.sent(), result = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, result];
                }
            });
        });
    };
    DataRetentionAutomation.prototype.performSoftDelete = function (policy) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, result, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .rpc('perform_soft_delete', {
                            table_name: policy.table_name,
                            retention_period_days: policy.retention_period_days,
                            batch_size: this.config.batch_size
                        })];
                    case 1:
                        _a = _b.sent(), result = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, result];
                }
            });
        });
    };
    DataRetentionAutomation.prototype.performAnonymization = function (policy) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, result, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .rpc('perform_anonymization', {
                            table_name: policy.table_name,
                            retention_period_days: policy.retention_period_days,
                            batch_size: this.config.batch_size
                        })];
                    case 1:
                        _a = _b.sent(), result = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, result];
                }
            });
        });
    };
    DataRetentionAutomation.prototype.generateVerificationHash = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var crypto, hash;
            return __generator(this, function (_a) {
                crypto = require('crypto');
                hash = crypto.createHash('sha256');
                hash.update(JSON.stringify(data));
                return [2 /*return*/, hash.digest('hex')];
            });
        });
    };
    DataRetentionAutomation.prototype.sendRetentionNotification = function (notification) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementation for retention notifications
                console.log('Retention notification sent:', notification.type);
                return [2 /*return*/];
            });
        });
    };
    return DataRetentionAutomation;
}());
exports.DataRetentionAutomation = DataRetentionAutomation;
