"use strict";
// Report Automation & Export Engine
// Epic 5, Story 5.1, Task 6: Report Automation & Export
// Created: 2025-01-27
// Author: VoidBeast V4.0 (BMad Method Implementation)
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
exports.ReportAutomationEngine = void 0;
var client_1 = require("@/lib/supabase/client");
var ReportAutomationEngine = /** @class */ (function () {
    function ReportAutomationEngine() {
        this.supabase = (0, client_1.createClient)();
    }
    // =====================================================================================
    // AUTOMATED REPORT SCHEDULING
    // =====================================================================================
    /**
     * Create automated report schedule
     */
    ReportAutomationEngine.prototype.createReportSchedule = function (clinicId, schedule) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, scheduleData, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('report_schedules')
                            .insert({
                            clinic_id: clinicId,
                            report_type: schedule.reportType,
                            report_name: schedule.reportName,
                            frequency: schedule.frequency,
                            recipients: schedule.recipients,
                            parameters: schedule.parameters,
                            next_run_date: schedule.nextRunDate.toISOString(),
                            is_active: schedule.isActive,
                            created_by: schedule.createdBy,
                            format: schedule.format
                        })
                            .select('id')
                            .single()];
                    case 1:
                        _a = _b.sent(), scheduleData = _a.data, error = _a.error;
                        if (error)
                            throw new Error("Failed to create report schedule: ".concat(error.message));
                        return [2 /*return*/, scheduleData.id];
                }
            });
        });
    };
    /**
     * Get all report schedules for a clinic
     */
    ReportAutomationEngine.prototype.getReportSchedules = function (clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, schedules, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('report_schedules')
                            .select('*')
                            .eq('clinic_id', clinicId)
                            .order('next_run_date', { ascending: true })];
                    case 1:
                        _a = _b.sent(), schedules = _a.data, error = _a.error;
                        if (error)
                            throw new Error("Failed to fetch report schedules: ".concat(error.message));
                        return [2 /*return*/, schedules.map(function (schedule) { return ({
                                scheduleId: schedule.id,
                                reportType: schedule.report_type,
                                reportName: schedule.report_name,
                                frequency: schedule.frequency,
                                recipients: schedule.recipients,
                                parameters: schedule.parameters,
                                nextRunDate: new Date(schedule.next_run_date),
                                lastRunDate: schedule.last_run_date ? new Date(schedule.last_run_date) : undefined,
                                isActive: schedule.is_active,
                                createdBy: schedule.created_by,
                                format: schedule.format
                            }); })];
                }
            });
        });
    };
    /**
     * Process scheduled reports (called by cron job)
     */
    ReportAutomationEngine.prototype.processScheduledReports = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, dueReports, error, processed, failed, _i, dueReports_1, schedule, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('report_schedules')
                            .select('*')
                            .eq('is_active', true)
                            .lte('next_run_date', new Date().toISOString())];
                    case 1:
                        _a = _b.sent(), dueReports = _a.data, error = _a.error;
                        if (error)
                            throw new Error("Failed to fetch due reports: ".concat(error.message));
                        processed = 0;
                        failed = 0;
                        _i = 0, dueReports_1 = dueReports;
                        _b.label = 2;
                    case 2:
                        if (!(_i < dueReports_1.length)) return [3 /*break*/, 8];
                        schedule = dueReports_1[_i];
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 6, , 7]);
                        return [4 /*yield*/, this.generateAndDeliverReport(schedule)];
                    case 4:
                        _b.sent();
                        return [4 /*yield*/, this.updateNextRunDate(schedule.id, schedule.frequency)];
                    case 5:
                        _b.sent();
                        processed++;
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _b.sent();
                        console.error("Failed to process scheduled report ".concat(schedule.id, ":"), error_1);
                        failed++;
                        return [3 /*break*/, 7];
                    case 7:
                        _i++;
                        return [3 /*break*/, 2];
                    case 8: return [2 /*return*/, { processed: processed, failed: failed }];
                }
            });
        });
    };
    /**
     * Generate and deliver scheduled report
     */
    ReportAutomationEngine.prototype.generateAndDeliverReport = function (schedule) {
        return __awaiter(this, void 0, void 0, function () {
            var reportData, exportResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.generateReport(schedule.report_type, schedule.parameters)];
                    case 1:
                        reportData = _a.sent();
                        return [4 /*yield*/, this.exportReport(reportData, {
                                format: schedule.format,
                                includeCharts: true,
                                includeRawData: false,
                                compression: true,
                                branding: true
                            })];
                    case 2:
                        exportResult = _a.sent();
                        // Deliver to recipients
                        return [4 /*yield*/, this.deliverReport({
                                reportType: schedule.report_type,
                                recipients: schedule.recipients,
                                deliveryMethod: 'email',
                                filePath: exportResult.filePath,
                                status: 'pending'
                            })];
                    case 3:
                        // Deliver to recipients
                        _a.sent();
                        // Update last run date
                        return [4 /*yield*/, this.supabase
                                .from('report_schedules')
                                .update({ last_run_date: new Date().toISOString() })
                                .eq('id', schedule.id)];
                    case 4:
                        // Update last run date
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // =====================================================================================
    // REPORT TEMPLATES & CUSTOMIZATION
    // =====================================================================================
    /**
     * Create custom report template
     */
    ReportAutomationEngine.prototype.createReportTemplate = function (clinicId, template) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, templateData, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('report_templates')
                            .insert({
                            clinic_id: clinicId,
                            template_name: template.templateName,
                            report_type: template.reportType,
                            description: template.description,
                            parameters: template.parameters,
                            layout: template.layout,
                            styling: template.styling,
                            is_default: template.isDefault,
                            created_by: template.createdBy
                        })
                            .select('id')
                            .single()];
                    case 1:
                        _a = _b.sent(), templateData = _a.data, error = _a.error;
                        if (error)
                            throw new Error("Failed to create report template: ".concat(error.message));
                        return [2 /*return*/, templateData.id];
                }
            });
        });
    };
    /**
     * Get report templates
     */
    ReportAutomationEngine.prototype.getReportTemplates = function (clinicId, reportType) {
        return __awaiter(this, void 0, void 0, function () {
            var query, _a, templates, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        query = this.supabase
                            .from('report_templates')
                            .select('*')
                            .eq('clinic_id', clinicId);
                        if (reportType) {
                            query = query.eq('report_type', reportType);
                        }
                        return [4 /*yield*/, query.order('created_at', { ascending: false })];
                    case 1:
                        _a = _b.sent(), templates = _a.data, error = _a.error;
                        if (error)
                            throw new Error("Failed to fetch report templates: ".concat(error.message));
                        return [2 /*return*/, templates.map(function (template) { return ({
                                templateId: template.id,
                                templateName: template.template_name,
                                reportType: template.report_type,
                                description: template.description,
                                parameters: template.parameters,
                                layout: template.layout,
                                styling: template.styling,
                                isDefault: template.is_default,
                                createdBy: template.created_by,
                                createdAt: new Date(template.created_at)
                            }); })];
                }
            });
        });
    };
    // =====================================================================================
    // MULTI-FORMAT EXPORT ENGINE
    // =====================================================================================
    /**
     * Export report to multiple formats with professional formatting
     */
    ReportAutomationEngine.prototype.exportReport = function (reportData, options) {
        return __awaiter(this, void 0, void 0, function () {
            var exportResult, _a, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 15, , 16]);
                        exportResult = void 0;
                        _a = options.format;
                        switch (_a) {
                            case 'pdf': return [3 /*break*/, 1];
                            case 'excel': return [3 /*break*/, 3];
                            case 'csv': return [3 /*break*/, 5];
                            case 'json': return [3 /*break*/, 7];
                        }
                        return [3 /*break*/, 9];
                    case 1: return [4 /*yield*/, this.exportToPDF(reportData, options)];
                    case 2:
                        exportResult = _b.sent();
                        return [3 /*break*/, 10];
                    case 3: return [4 /*yield*/, this.exportToExcel(reportData, options)];
                    case 4:
                        exportResult = _b.sent();
                        return [3 /*break*/, 10];
                    case 5: return [4 /*yield*/, this.exportToCSV(reportData, options)];
                    case 6:
                        exportResult = _b.sent();
                        return [3 /*break*/, 10];
                    case 7: return [4 /*yield*/, this.exportToJSON(reportData, options)];
                    case 8:
                        exportResult = _b.sent();
                        return [3 /*break*/, 10];
                    case 9: throw new Error("Unsupported export format: ".concat(options.format));
                    case 10:
                        if (!options.compression) return [3 /*break*/, 12];
                        return [4 /*yield*/, this.compressFile(exportResult)];
                    case 11:
                        exportResult = _b.sent();
                        _b.label = 12;
                    case 12:
                        if (!options.password) return [3 /*break*/, 14];
                        return [4 /*yield*/, this.passwordProtectFile(exportResult, options.password)];
                    case 13:
                        exportResult = _b.sent();
                        _b.label = 14;
                    case 14: return [2 /*return*/, exportResult];
                    case 15:
                        error_2 = _b.sent();
                        throw new Error("Export failed: ".concat(error_2.message));
                    case 16: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Export to PDF with professional formatting
     */
    ReportAutomationEngine.prototype.exportToPDF = function (reportData, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, pdfResult, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase.rpc('generate_pdf_report', {
                            report_data: reportData,
                            include_charts: options.includeCharts,
                            watermark: options.watermark,
                            branding: options.branding
                        })];
                    case 1:
                        _a = _b.sent(), pdfResult = _a.data, error = _a.error;
                        if (error)
                            throw new Error("PDF generation failed: ".concat(error.message));
                        return [2 /*return*/, {
                                filePath: pdfResult.file_path,
                                fileSize: pdfResult.file_size,
                                downloadUrl: pdfResult.download_url
                            }];
                }
            });
        });
    };
    /**
     * Export to Excel with multiple sheets and formatting
     */
    ReportAutomationEngine.prototype.exportToExcel = function (reportData, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, excelResult, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase.rpc('generate_excel_report', {
                            report_data: reportData,
                            include_charts: options.includeCharts,
                            include_raw_data: options.includeRawData,
                            branding: options.branding
                        })];
                    case 1:
                        _a = _b.sent(), excelResult = _a.data, error = _a.error;
                        if (error)
                            throw new Error("Excel generation failed: ".concat(error.message));
                        return [2 /*return*/, {
                                filePath: excelResult.file_path,
                                fileSize: excelResult.file_size,
                                downloadUrl: excelResult.download_url
                            }];
                }
            });
        });
    };
    /**
     * Export to CSV with proper encoding
     */
    ReportAutomationEngine.prototype.exportToCSV = function (reportData, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, csvResult, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase.rpc('generate_csv_report', {
                            report_data: reportData,
                            include_raw_data: options.includeRawData
                        })];
                    case 1:
                        _a = _b.sent(), csvResult = _a.data, error = _a.error;
                        if (error)
                            throw new Error("CSV generation failed: ".concat(error.message));
                        return [2 /*return*/, {
                                filePath: csvResult.file_path,
                                fileSize: csvResult.file_size,
                                downloadUrl: csvResult.download_url
                            }];
                }
            });
        });
    };
    /**
     * Export to JSON format
     */
    ReportAutomationEngine.prototype.exportToJSON = function (reportData, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, jsonResult, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase.rpc('generate_json_report', {
                            report_data: reportData
                        })];
                    case 1:
                        _a = _b.sent(), jsonResult = _a.data, error = _a.error;
                        if (error)
                            throw new Error("JSON generation failed: ".concat(error.message));
                        return [2 /*return*/, {
                                filePath: jsonResult.file_path,
                                fileSize: jsonResult.file_size,
                                downloadUrl: jsonResult.download_url
                            }];
                }
            });
        });
    };
    // =====================================================================================
    // REPORT DELIVERY & DISTRIBUTION
    // =====================================================================================
    /**
     * Deliver report to recipients via email
     */
    ReportAutomationEngine.prototype.deliverReport = function (delivery) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, deliveryData, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('report_deliveries')
                            .insert({
                            report_type: delivery.reportType,
                            recipients: delivery.recipients,
                            delivery_method: delivery.deliveryMethod,
                            status: delivery.status,
                            file_path: delivery.filePath,
                            file_size: delivery.fileSize,
                            retry_count: 0
                        })
                            .select('id')
                            .single()];
                    case 1:
                        _a = _b.sent(), deliveryData = _a.data, error = _a.error;
                        if (error)
                            throw new Error("Failed to create report delivery: ".concat(error.message));
                        if (!(delivery.deliveryMethod === 'email')) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.sendReportEmail(deliveryData.id, delivery.recipients, delivery.filePath)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3: return [2 /*return*/, deliveryData.id];
                }
            });
        });
    };
    /**
     * Send report via email
     */
    ReportAutomationEngine.prototype.sendReportEmail = function (deliveryId, recipients, filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var error, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 5]);
                        return [4 /*yield*/, this.supabase.rpc('send_report_email', {
                                delivery_id: deliveryId,
                                recipients: recipients,
                                file_path: filePath
                            })];
                    case 1:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        // Update delivery status
                        return [4 /*yield*/, this.supabase
                                .from('report_deliveries')
                                .update({
                                status: 'delivered',
                                delivered_at: new Date().toISOString()
                            })
                                .eq('id', deliveryId)];
                    case 2:
                        // Update delivery status
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        error_3 = _a.sent();
                        // Update delivery status with error
                        return [4 /*yield*/, this.supabase
                                .from('report_deliveries')
                                .update({
                                status: 'failed',
                                error_message: error_3.message
                            })
                                .eq('id', deliveryId)];
                    case 4:
                        // Update delivery status with error
                        _a.sent();
                        throw error_3;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // =====================================================================================
    // REPORT ARCHIVE & HISTORICAL ACCESS
    // =====================================================================================
    /**
     * Archive generated report
     */
    ReportAutomationEngine.prototype.archiveReport = function (clinicId, archive) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, archiveData, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('report_archives')
                            .insert({
                            clinic_id: clinicId,
                            report_type: archive.reportType,
                            report_name: archive.reportName,
                            generated_date: archive.generatedDate.toISOString(),
                            file_path: archive.filePath,
                            file_size: archive.fileSize,
                            parameters: archive.parameters,
                            generated_by: archive.generatedBy,
                            retention_period: archive.retentionPeriod,
                            download_count: 0
                        })
                            .select('id')
                            .single()];
                    case 1:
                        _a = _b.sent(), archiveData = _a.data, error = _a.error;
                        if (error)
                            throw new Error("Failed to archive report: ".concat(error.message));
                        return [2 /*return*/, archiveData.id];
                }
            });
        });
    };
    /**
     * Get archived reports
     */
    ReportAutomationEngine.prototype.getArchivedReports = function (clinicId, reportType, dateRange) {
        return __awaiter(this, void 0, void 0, function () {
            var query, _a, archives, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        query = this.supabase
                            .from('report_archives')
                            .select('*')
                            .eq('clinic_id', clinicId);
                        if (reportType) {
                            query = query.eq('report_type', reportType);
                        }
                        if (dateRange) {
                            query = query
                                .gte('generated_date', dateRange.start.toISOString())
                                .lte('generated_date', dateRange.end.toISOString());
                        }
                        return [4 /*yield*/, query.order('generated_date', { ascending: false })];
                    case 1:
                        _a = _b.sent(), archives = _a.data, error = _a.error;
                        if (error)
                            throw new Error("Failed to fetch archived reports: ".concat(error.message));
                        return [2 /*return*/, archives.map(function (archive) { return ({
                                archiveId: archive.id,
                                reportType: archive.report_type,
                                reportName: archive.report_name,
                                generatedDate: new Date(archive.generated_date),
                                filePath: archive.file_path,
                                fileSize: archive.file_size,
                                parameters: archive.parameters,
                                generatedBy: archive.generated_by,
                                retentionPeriod: archive.retention_period,
                                downloadCount: archive.download_count,
                                lastAccessedAt: archive.last_accessed_at ? new Date(archive.last_accessed_at) : undefined
                            }); })];
                }
            });
        });
    };
    // =====================================================================================
    // UTILITY METHODS
    // =====================================================================================
    /**
     * Generate report based on type and parameters
     */
    ReportAutomationEngine.prototype.generateReport = function (reportType, parameters) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, reportData, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase.rpc('generate_report_data', {
                            report_type: reportType,
                            parameters: parameters
                        })];
                    case 1:
                        _a = _b.sent(), reportData = _a.data, error = _a.error;
                        if (error)
                            throw new Error("Report generation failed: ".concat(error.message));
                        return [2 /*return*/, reportData];
                }
            });
        });
    };
    /**
     * Update next run date for scheduled report
     */
    ReportAutomationEngine.prototype.updateNextRunDate = function (scheduleId, frequency) {
        return __awaiter(this, void 0, void 0, function () {
            var nextRunDate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        nextRunDate = this.calculateNextRunDate(new Date(), frequency);
                        return [4 /*yield*/, this.supabase
                                .from('report_schedules')
                                .update({ next_run_date: nextRunDate.toISOString() })
                                .eq('id', scheduleId)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Calculate next run date based on frequency
     */
    ReportAutomationEngine.prototype.calculateNextRunDate = function (currentDate, frequency) {
        var nextDate = new Date(currentDate);
        switch (frequency) {
            case 'daily':
                nextDate.setDate(nextDate.getDate() + 1);
                break;
            case 'weekly':
                nextDate.setDate(nextDate.getDate() + 7);
                break;
            case 'monthly':
                nextDate.setMonth(nextDate.getMonth() + 1);
                break;
            case 'quarterly':
                nextDate.setMonth(nextDate.getMonth() + 3);
                break;
            case 'annually':
                nextDate.setFullYear(nextDate.getFullYear() + 1);
                break;
        }
        return nextDate;
    };
    /**
     * Compress file for optimization
     */
    ReportAutomationEngine.prototype.compressFile = function (fileResult) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, compressedResult, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase.rpc('compress_file', {
                            file_path: fileResult.filePath
                        })];
                    case 1:
                        _a = _b.sent(), compressedResult = _a.data, error = _a.error;
                        if (error)
                            throw new Error("File compression failed: ".concat(error.message));
                        return [2 /*return*/, compressedResult];
                }
            });
        });
    };
    /**
     * Password protect file
     */
    ReportAutomationEngine.prototype.passwordProtectFile = function (fileResult, password) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, protectedResult, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase.rpc('password_protect_file', {
                            file_path: fileResult.filePath,
                            password: password
                        })];
                    case 1:
                        _a = _b.sent(), protectedResult = _a.data, error = _a.error;
                        if (error)
                            throw new Error("Password protection failed: ".concat(error.message));
                        return [2 /*return*/, protectedResult];
                }
            });
        });
    };
    return ReportAutomationEngine;
}());
exports.ReportAutomationEngine = ReportAutomationEngine;
