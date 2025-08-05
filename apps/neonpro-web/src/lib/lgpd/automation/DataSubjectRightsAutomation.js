"use strict";
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
exports.DataSubjectRightsAutomation = void 0;
var DataSubjectRightsAutomation = /** @class */ (function () {
    function DataSubjectRightsAutomation(supabase, complianceManager, config) {
        this.supabase = supabase;
        this.complianceManager = complianceManager;
        this.config = config;
    }
    /**
     * Automated Data Access Request Fulfillment (Art. 18, LGPD)
     */
    DataSubjectRightsAutomation.prototype.processDataAccessRequest = function (requestId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var verificationResult, _a, request, requestError, legalDeadline, timelineStatus, report, _b, reportRecord, reportError_1, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 9, , 11]);
                        if (!this.config.identity_verification_required) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.verifyUserIdentity(userId, requestId)];
                    case 1:
                        verificationResult = _c.sent();
                        if (!verificationResult.verified) {
                            throw new Error('Identity verification failed');
                        }
                        _c.label = 2;
                    case 2: return [4 /*yield*/, this.supabase
                            .from('lgpd_data_subject_requests')
                            .select('*')
                            .eq('id', requestId)
                            .single()];
                    case 3:
                        _a = _c.sent(), request = _a.data, requestError = _a.error;
                        if (requestError)
                            throw requestError;
                        legalDeadline = new Date(request.created_at);
                        legalDeadline.setDate(legalDeadline.getDate() + 30);
                        timelineStatus = new Date() <= legalDeadline ? 'within_deadline' : 'overdue';
                        // Update request status
                        return [4 /*yield*/, this.supabase
                                .from('lgpd_data_subject_requests')
                                .update({
                                status: 'in_progress',
                                processing_started_at: new Date().toISOString()
                            })
                                .eq('id', requestId)
                            // Generate comprehensive data access report
                        ];
                    case 4:
                        // Update request status
                        _c.sent();
                        return [4 /*yield*/, this.generateDataAccessReport(userId, requestId)
                            // Store report securely
                        ];
                    case 5:
                        report = _c.sent();
                        return [4 /*yield*/, this.supabase
                                .from('lgpd_access_reports')
                                .insert({
                                request_id: requestId,
                                user_id: userId,
                                report_data: report,
                                generated_at: new Date().toISOString(),
                                expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
                                access_count: 0
                            })
                                .select('id')
                                .single()];
                    case 6:
                        _b = _c.sent(), reportRecord = _b.data, reportError_1 = _b.error;
                        if (reportError_1)
                            throw reportError_1;
                        // Update request as completed
                        return [4 /*yield*/, this.supabase
                                .from('lgpd_data_subject_requests')
                                .update({
                                status: 'completed',
                                completed_at: new Date().toISOString(),
                                fulfillment_method: 'automated_report'
                            })
                                .eq('id', requestId)
                            // Log audit event
                        ];
                    case 7:
                        // Update request as completed
                        _c.sent();
                        // Log audit event
                        return [4 /*yield*/, this.complianceManager.logAuditEvent({
                                event_type: 'data_access',
                                user_id: userId,
                                resource_type: 'data_access_request',
                                resource_id: requestId,
                                action: 'automated_fulfillment_completed',
                                details: {
                                    report_id: reportRecord.id,
                                    timeline_status: timelineStatus,
                                    data_categories_count: report.data_categories.length,
                                    processing_activities_count: report.processing_activities.length
                                }
                            })];
                    case 8:
                        // Log audit event
                        _c.sent();
                        return [2 /*return*/, {
                                success: true,
                                report: report,
                                timeline_status: timeline_status
                            }];
                    case 9:
                        error_1 = _c.sent();
                        console.error('Error processing data access request:', error_1);
                        // Update request status to failed
                        return [4 /*yield*/, this.supabase
                                .from('lgpd_data_subject_requests')
                                .update({
                                status: 'rejected',
                                rejection_reason: error_1.message,
                                completed_at: new Date().toISOString()
                            })
                                .eq('id', requestId)];
                    case 10:
                        // Update request status to failed
                        _c.sent();
                        throw new Error("Failed to process data access request: ".concat(error_1.message));
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Automated Data Rectification
     */
    DataSubjectRightsAutomation.prototype.processDataRectificationRequest = function (requestId, userId, rectificationData) {
        return __awaiter(this, void 0, void 0, function () {
            var changesApplied, changeLog, verificationResult, _i, rectificationData_1, rectification, isValid, changeResult, rectError_1, requestStatus, request, legalDeadline, timelineStatus, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 15, , 16]);
                        changesApplied = 0;
                        changeLog = [];
                        if (!this.config.identity_verification_required) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.verifyUserIdentity(userId, requestId)];
                    case 1:
                        verificationResult = _a.sent();
                        if (!verificationResult.verified) {
                            throw new Error('Identity verification failed');
                        }
                        _a.label = 2;
                    case 2: 
                    // Update request status
                    return [4 /*yield*/, this.supabase
                            .from('lgpd_data_subject_requests')
                            .update({
                            status: 'in_progress',
                            processing_started_at: new Date().toISOString()
                        })
                            .eq('id', requestId)
                        // Process each rectification
                    ];
                    case 3:
                        // Update request status
                        _a.sent();
                        _i = 0, rectificationData_1 = rectificationData;
                        _a.label = 4;
                    case 4:
                        if (!(_i < rectificationData_1.length)) return [3 /*break*/, 10];
                        rectification = rectificationData_1[_i];
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 8, , 9]);
                        return [4 /*yield*/, this.validateRectificationRequest(userId, rectification.table, rectification.field, rectification.new_value)];
                    case 6:
                        isValid = _a.sent();
                        if (!isValid.valid) {
                            changeLog.push({
                                table: rectification.table,
                                field: rectification.field,
                                status: 'rejected',
                                reason: isValid.reason
                            });
                            return [3 /*break*/, 9];
                        }
                        return [4 /*yield*/, this.applyDataRectification(userId, rectification.table, rectification.field, rectification.current_value, rectification.new_value, rectification.justification)];
                    case 7:
                        changeResult = _a.sent();
                        if (changeResult.success) {
                            changesApplied++;
                            changeLog.push({
                                table: rectification.table,
                                field: rectification.field,
                                status: 'applied',
                                change_id: changeResult.change_id,
                                timestamp: new Date().toISOString()
                            });
                        }
                        return [3 /*break*/, 9];
                    case 8:
                        rectError_1 = _a.sent();
                        changeLog.push({
                            table: rectification.table,
                            field: rectification.field,
                            status: 'error',
                            error: rectError_1.message
                        });
                        return [3 /*break*/, 9];
                    case 9:
                        _i++;
                        return [3 /*break*/, 4];
                    case 10: 
                    // Store rectification log
                    return [4 /*yield*/, this.supabase
                            .from('lgpd_rectification_log')
                            .insert({
                            request_id: requestId,
                            user_id: userId,
                            changes_requested: rectificationData.length,
                            changes_applied: changesApplied,
                            change_log: changeLog,
                            completed_at: new Date().toISOString()
                        })
                        // Update request status
                    ];
                    case 11:
                        // Store rectification log
                        _a.sent();
                        requestStatus = changesApplied > 0 ? 'completed' : 'rejected';
                        return [4 /*yield*/, this.supabase
                                .from('lgpd_data_subject_requests')
                                .update({
                                status: requestStatus,
                                completed_at: new Date().toISOString(),
                                fulfillment_details: {
                                    changes_applied: changesApplied,
                                    total_requested: rectificationData.length,
                                    change_log: changeLog
                                }
                            })
                                .eq('id', requestId)
                            // Calculate timeline status
                        ];
                    case 12:
                        _a.sent();
                        return [4 /*yield*/, this.supabase
                                .from('lgpd_data_subject_requests')
                                .select('created_at')
                                .eq('id', requestId)
                                .single()];
                    case 13:
                        request = (_a.sent()).data;
                        legalDeadline = new Date(request.created_at);
                        legalDeadline.setDate(legalDeadline.getDate() + 30);
                        timelineStatus = new Date() <= legalDeadline ? 'within_deadline' : 'overdue';
                        // Log audit event
                        return [4 /*yield*/, this.complianceManager.logAuditEvent({
                                event_type: 'data_rectification',
                                user_id: userId,
                                resource_type: 'rectification_request',
                                resource_id: requestId,
                                action: 'automated_rectification_completed',
                                details: {
                                    changes_requested: rectificationData.length,
                                    changes_applied: changesApplied,
                                    timeline_status: timelineStatus
                                }
                            })];
                    case 14:
                        // Log audit event
                        _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                changes_applied: changesApplied,
                                timeline_status: timeline_status
                            }];
                    case 15:
                        error_2 = _a.sent();
                        console.error('Error processing rectification request:', error_2);
                        throw new Error("Failed to process rectification request: ".concat(error_2.message));
                    case 16: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Automated Data Erasure (Right to be Forgotten)
     */
    DataSubjectRightsAutomation.prototype.processDataErasureRequest = function (requestId, userId, erasureScope) {
        return __awaiter(this, void 0, void 0, function () {
            var verificationResult, erasureAnalysis, erasureResult, request, legalDeadline, timelineStatus, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 9, , 10]);
                        if (!this.config.identity_verification_required) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.verifyUserIdentity(userId, requestId)];
                    case 1:
                        verificationResult = _a.sent();
                        if (!verificationResult.verified) {
                            throw new Error('Identity verification failed');
                        }
                        _a.label = 2;
                    case 2: 
                    // Update request status
                    return [4 /*yield*/, this.supabase
                            .from('lgpd_data_subject_requests')
                            .update({
                            status: 'in_progress',
                            processing_started_at: new Date().toISOString()
                        })
                            .eq('id', requestId)
                        // Analyze data for erasure eligibility
                    ];
                    case 3:
                        // Update request status
                        _a.sent();
                        return [4 /*yield*/, this.analyzeDataForErasure(userId, erasureScope)
                            // Execute erasure with proper safeguards
                        ];
                    case 4:
                        erasureAnalysis = _a.sent();
                        return [4 /*yield*/, this.executeSecureDataErasure(userId, erasureAnalysis.eligible_for_erasure, requestId)
                            // Update request status
                        ];
                    case 5:
                        erasureResult = _a.sent();
                        // Update request status
                        return [4 /*yield*/, this.supabase
                                .from('lgpd_data_subject_requests')
                                .update({
                                status: 'completed',
                                completed_at: new Date().toISOString(),
                                fulfillment_details: {
                                    erased_records: erasureResult.erased_records,
                                    retained_records: erasureResult.retained_records,
                                    retention_reasons: erasureResult.retention_reasons
                                }
                            })
                                .eq('id', requestId)
                            // Calculate timeline status
                        ];
                    case 6:
                        // Update request status
                        _a.sent();
                        return [4 /*yield*/, this.supabase
                                .from('lgpd_data_subject_requests')
                                .select('created_at')
                                .eq('id', requestId)
                                .single()];
                    case 7:
                        request = (_a.sent()).data;
                        legalDeadline = new Date(request.created_at);
                        legalDeadline.setDate(legalDeadline.getDate() + 30);
                        timelineStatus = new Date() <= legalDeadline ? 'within_deadline' : 'overdue';
                        // Log audit event
                        return [4 /*yield*/, this.complianceManager.logAuditEvent({
                                event_type: 'data_erasure',
                                user_id: userId,
                                resource_type: 'erasure_request',
                                resource_id: requestId,
                                action: 'automated_erasure_completed',
                                details: {
                                    erased_records: erasureResult.erased_records,
                                    retained_records: erasureResult.retained_records,
                                    timeline_status: timelineStatus,
                                    complete_erasure: erasureScope.complete_erasure
                                }
                            })];
                    case 8:
                        // Log audit event
                        _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                erased_records: erasureResult.erased_records,
                                retained_records: erasureResult.retained_records,
                                timeline_status: timeline_status
                            }];
                    case 9:
                        error_3 = _a.sent();
                        console.error('Error processing erasure request:', error_3);
                        throw new Error("Failed to process erasure request: ".concat(error_3.message));
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Automated Data Portability
     */
    DataSubjectRightsAutomation.prototype.processDataPortabilityRequest = function (requestId, userId, exportFormat, deliveryMethod) {
        return __awaiter(this, void 0, void 0, function () {
            var verificationResult, portabilityPackage, downloadUrl, request, legalDeadline, timelineStatus, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 10, , 11]);
                        if (!this.config.identity_verification_required) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.verifyUserIdentity(userId, requestId)];
                    case 1:
                        verificationResult = _a.sent();
                        if (!verificationResult.verified) {
                            throw new Error('Identity verification failed');
                        }
                        _a.label = 2;
                    case 2: 
                    // Update request status
                    return [4 /*yield*/, this.supabase
                            .from('lgpd_data_subject_requests')
                            .update({
                            status: 'in_progress',
                            processing_started_at: new Date().toISOString()
                        })
                            .eq('id', requestId)
                        // Generate portable data package
                    ];
                    case 3:
                        // Update request status
                        _a.sent();
                        return [4 /*yield*/, this.generatePortableDataPackage(userId, requestId, exportFormat)
                            // Create secure download link
                        ];
                    case 4:
                        portabilityPackage = _a.sent();
                        return [4 /*yield*/, this.createSecureDownloadLink(portabilityPackage, deliveryMethod)
                            // Update package with download URL
                        ];
                    case 5:
                        downloadUrl = _a.sent();
                        // Update package with download URL
                        portabilityPackage.download_url = downloadUrl;
                        // Store portability record
                        return [4 /*yield*/, this.supabase
                                .from('lgpd_portability_packages')
                                .insert({
                                request_id: requestId,
                                user_id: userId,
                                format: exportFormat,
                                package_data: portabilityPackage,
                                download_url: downloadUrl,
                                created_at: new Date().toISOString(),
                                expires_at: portabilityPackage.expires_at,
                                download_count: 0
                            })
                            // Update request status
                        ];
                    case 6:
                        // Store portability record
                        _a.sent();
                        // Update request status
                        return [4 /*yield*/, this.supabase
                                .from('lgpd_data_subject_requests')
                                .update({
                                status: 'completed',
                                completed_at: new Date().toISOString(),
                                fulfillment_details: {
                                    format: exportFormat,
                                    delivery_method: deliveryMethod,
                                    package_size: JSON.stringify(portabilityPackage).length,
                                    sections_count: portabilityPackage.data_sections.length
                                }
                            })
                                .eq('id', requestId)
                            // Calculate timeline status
                        ];
                    case 7:
                        // Update request status
                        _a.sent();
                        return [4 /*yield*/, this.supabase
                                .from('lgpd_data_subject_requests')
                                .select('created_at')
                                .eq('id', requestId)
                                .single()];
                    case 8:
                        request = (_a.sent()).data;
                        legalDeadline = new Date(request.created_at);
                        legalDeadline.setDate(legalDeadline.getDate() + 30);
                        timelineStatus = new Date() <= legalDeadline ? 'within_deadline' : 'overdue';
                        // Log audit event
                        return [4 /*yield*/, this.complianceManager.logAuditEvent({
                                event_type: 'data_portability',
                                user_id: userId,
                                resource_type: 'portability_request',
                                resource_id: requestId,
                                action: 'automated_portability_completed',
                                details: {
                                    format: exportFormat,
                                    delivery_method: deliveryMethod,
                                    timeline_status: timelineStatus,
                                    package_size: JSON.stringify(portabilityPackage).length
                                }
                            })];
                    case 9:
                        // Log audit event
                        _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                package: portabilityPackage,
                                timeline_status: timeline_status
                            }];
                    case 10:
                        error_4 = _a.sent();
                        console.error('Error processing portability request:', error_4);
                        throw new Error("Failed to process portability request: ".concat(error_4.message));
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Monitor Legal Timeline Compliance
     */
    DataSubjectRightsAutomation.prototype.monitorLegalTimelineCompliance = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, timelineStats, error, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .rpc('monitor_legal_timeline_compliance')];
                    case 1:
                        _a = _b.sent(), timelineStats = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, timelineStats];
                    case 2:
                        error_5 = _b.sent();
                        console.error('Error monitoring timeline compliance:', error_5);
                        throw new Error("Failed to monitor timeline compliance: ".concat(error_5.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Private helper methods
    DataSubjectRightsAutomation.prototype.verifyUserIdentity = function (userId, requestId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementation for identity verification
                // This would integrate with your identity verification system
                return [2 /*return*/, { verified: true, method: 'automated' }];
            });
        });
    };
    DataSubjectRightsAutomation.prototype.generateDataAccessReport = function (userId, requestId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, reportData, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .rpc('generate_data_access_report', {
                            target_user_id: userId,
                            request_id: requestId
                        })];
                    case 1:
                        _a = _b.sent(), reportData = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, reportData];
                }
            });
        });
    };
    DataSubjectRightsAutomation.prototype.validateRectificationRequest = function (userId, table, field, newValue) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Validate rectification request
                // Check field constraints, data types, business rules, etc.
                return [2 /*return*/, { valid: true }];
            });
        });
    };
    DataSubjectRightsAutomation.prototype.applyDataRectification = function (userId, table, field, currentValue, newValue, justification) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, change, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('lgpd_data_changes')
                            .insert({
                            user_id: userId,
                            table_name: table,
                            field_name: field,
                            old_value: currentValue,
                            new_value: newValue,
                            change_reason: 'rectification_request',
                            justification: justification,
                            applied_at: new Date().toISOString()
                        })
                            .select('id')
                            .single()];
                    case 1:
                        _a = _b.sent(), change = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, { success: true, change_id: change.id }];
                }
            });
        });
    };
    DataSubjectRightsAutomation.prototype.analyzeDataForErasure = function (userId, erasureScope) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, analysis, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .rpc('analyze_data_for_erasure', {
                            target_user_id: userId,
                            erasure_scope: erasureScope
                        })];
                    case 1:
                        _a = _b.sent(), analysis = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, analysis];
                }
            });
        });
    };
    DataSubjectRightsAutomation.prototype.executeSecureDataErasure = function (userId, eligibleData, requestId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, result, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .rpc('execute_secure_data_erasure', {
                            target_user_id: userId,
                            eligible_data: eligibleData,
                            request_id: requestId
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
    DataSubjectRightsAutomation.prototype.generatePortableDataPackage = function (userId, requestId, format) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, packageData, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .rpc('generate_portable_data_package', {
                            target_user_id: userId,
                            request_id: requestId,
                            export_format: format
                        })];
                    case 1:
                        _a = _b.sent(), packageData = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, packageData];
                }
            });
        });
    };
    DataSubjectRightsAutomation.prototype.createSecureDownloadLink = function (packageData, deliveryMethod) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, link, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .rpc('create_secure_download_link', {
                            package_data: packageData,
                            delivery_method: deliveryMethod
                        })];
                    case 1:
                        _a = _b.sent(), link = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, link];
                }
            });
        });
    };
    return DataSubjectRightsAutomation;
}());
exports.DataSubjectRightsAutomation = DataSubjectRightsAutomation;
