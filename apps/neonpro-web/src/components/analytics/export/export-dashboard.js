// Analytics Export Dashboard Component - STORY-SUB-002 Task 7
// Created: 2025-01-22
// Comprehensive export interface with real-time progress tracking
'use client';
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportDashboard = ExportDashboard;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var progress_1 = require("@/components/ui/progress");
var tabs_1 = require("@/components/ui/tabs");
var select_1 = require("@/components/ui/select");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var checkbox_1 = require("@/components/ui/checkbox");
var calendar_1 = require("@/components/ui/calendar");
var popover_1 = require("@/components/ui/popover");
var separator_1 = require("@/components/ui/separator");
var scroll_area_1 = require("@/components/ui/scroll-area");
var lucide_react_1 = require("lucide-react");
var date_fns_1 = require("date-fns");
var utils_1 = require("@/lib/utils");
var sonner_1 = require("sonner");
// ============================================================================
// MAIN COMPONENT
// ============================================================================
function ExportDashboard(_a) {
    var _this = this;
    var _b, _c, _d;
    var className = _a.className, _e = _a.defaultDateRange, defaultDateRange = _e === void 0 ? {
        startDate: (0, date_fns_1.subDays)(new Date(), 30),
        endDate: new Date()
    } : _e, onExportComplete = _a.onExportComplete, onExportError = _a.onExportError;
    // State management
    var _f = (0, react_1.useState)('create'), activeTab = _f[0], setActiveTab = _f[1];
    var _g = (0, react_1.useState)(false), isLoading = _g[0], setIsLoading = _g[1];
    var _h = (0, react_1.useState)([]), activeExports = _h[0], setActiveExports = _h[1];
    var _j = (0, react_1.useState)([]), exportHistory = _j[0], setExportHistory = _j[1];
    // Form state
    var _k = (0, react_1.useState)({
        format: 'pdf',
        reportType: 'comprehensive',
        dateRange: defaultDateRange,
        filters: {},
        includeSummary: true,
        customization: {
            title: 'Analytics Report',
            subtitle: 'Generated by NeonPro Analytics',
            branding: {
                primaryColor: '#1f2937',
                secondaryColor: '#6b7280',
                fontFamily: 'Inter'
            }
        },
        pdfOptions: {
            orientation: 'portrait',
            pageSize: 'A4',
            margins: { top: 20, right: 20, bottom: 20, left: 20 },
            styling: {
                fontFamily: 'helvetica',
                fontSize: 12,
                primaryColor: '#1f2937',
                secondaryColor: '#6b7280'
            },
            header: {
                text: 'NeonPro Analytics Report',
                fontSize: 16,
                alignment: 'center'
            },
            footer: {
                includePageNumbers: true,
                includeTimestamp: true
            }
        },
        excelOptions: {
            worksheets: {
                summary: true,
                revenue: true,
                conversion: true,
                cohorts: true,
                forecasts: true,
                rawData: false
            },
            formatting: {
                autoWidth: true,
                freezeHeaders: true,
                alternatingRows: true,
                numberFormat: '#,##0.00'
            }
        },
        csvOptions: {
            delimiter: ',',
            encoding: 'utf8',
            includeHeaders: true,
            compression: 'none'
        },
        notifyOnComplete: false
    }), formData = _k[0], setFormData = _k[1];
    // ========================================================================
    // EFFECTS
    // ========================================================================
    (0, react_1.useEffect)(function () {
        loadExportHistory();
        var interval = setInterval(pollActiveExports, 2000);
        return function () { return clearInterval(interval); };
    }, []);
    // ========================================================================
    // API FUNCTIONS
    // ========================================================================
    var createExport = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var exportRequest, response, errorData, result, newExport_1, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setIsLoading(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 6, 7, 8]);
                    exportRequest = {
                        config: {
                            format: formData.format,
                            reportType: formData.reportType,
                            dateRange: formData.dateRange,
                            filters: formData.filters,
                            includeSummary: formData.includeSummary,
                            customization: formData.customization
                        },
                        pdfOptions: formData.pdfOptions,
                        excelOptions: formData.excelOptions,
                        csvOptions: formData.csvOptions,
                        notifyOnComplete: formData.notifyOnComplete,
                        email: formData.notifyOnComplete ? formData.email : undefined
                    };
                    return [4 /*yield*/, fetch('/api/analytics/export', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(exportRequest)
                        })];
                case 2:
                    response = _b.sent();
                    if (!!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    errorData = _b.sent();
                    throw new Error(((_a = errorData.error) === null || _a === void 0 ? void 0 : _a.message) || 'Export request failed');
                case 4: return [4 /*yield*/, response.json()
                    // Add to active exports
                ];
                case 5:
                    result = _b.sent();
                    newExport_1 = {
                        id: result.id,
                        config: exportRequest.config,
                        status: 'pending',
                        createdAt: new Date()
                    };
                    setActiveExports(function (prev) { return __spreadArray([newExport_1], prev, true); });
                    setActiveTab('history');
                    sonner_1.toast.success('Export request created successfully', {
                        description: "Estimated completion time: ".concat(result.estimatedCompletionTime, " seconds")
                    });
                    return [3 /*break*/, 8];
                case 6:
                    error_1 = _b.sent();
                    console.error('Export creation failed:', error_1);
                    sonner_1.toast.error('Failed to create export', {
                        description: error_1 instanceof Error ? error_1.message : 'Unknown error occurred'
                    });
                    onExportError === null || onExportError === void 0 ? void 0 : onExportError(error_1);
                    return [3 /*break*/, 8];
                case 7:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); }, [formData, onExportError]);
    var pollActiveExports = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var pendingExports, statusPromises, statuses_1, error_2;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (activeExports.length === 0)
                        return [2 /*return*/];
                    pendingExports = activeExports.filter(function (exp) {
                        return exp.status === 'pending' || exp.status === 'processing';
                    });
                    if (pendingExports.length === 0)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    statusPromises = pendingExports.map(function (exp) { return __awaiter(_this, void 0, void 0, function () {
                        var response;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, fetch("/api/analytics/export/".concat(exp.id))];
                                case 1:
                                    response = _a.sent();
                                    if (!response.ok) return [3 /*break*/, 3];
                                    return [4 /*yield*/, response.json()];
                                case 2: return [2 /*return*/, _a.sent()];
                                case 3: return [2 /*return*/, null];
                            }
                        });
                    }); });
                    return [4 /*yield*/, Promise.all(statusPromises)];
                case 2:
                    statuses_1 = _a.sent();
                    setActiveExports(function (prev) { return prev.map(function (exp) {
                        var _a;
                        var statusIndex = pendingExports.findIndex(function (pending) { return pending.id === exp.id; });
                        if (statusIndex >= 0 && statuses_1[statusIndex]) {
                            var status_1 = statuses_1[statusIndex];
                            var updatedExport = __assign(__assign({}, exp), { status: status_1.status, progress: status_1.progress, downloadUrl: status_1.downloadUrl, fileName: status_1.fileName, fileSize: status_1.fileSize, completedAt: status_1.completedAt ? new Date(status_1.completedAt) : undefined, error: status_1.error });
                            // Notify on completion
                            if (status_1.status === 'completed' && exp.status !== 'completed') {
                                sonner_1.toast.success('Export completed successfully', {
                                    description: "".concat(status_1.fileName, " is ready for download")
                                });
                                onExportComplete === null || onExportComplete === void 0 ? void 0 : onExportComplete(status_1);
                            }
                            else if (status_1.status === 'failed' && exp.status !== 'failed') {
                                sonner_1.toast.error('Export failed', {
                                    description: ((_a = status_1.error) === null || _a === void 0 ? void 0 : _a.message) || 'Unknown error occurred'
                                });
                            }
                            return updatedExport;
                        }
                        return exp;
                    }); });
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error('Failed to poll export status:', error_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [activeExports, onExportComplete]);
    var loadExportHistory = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var cached, history_1;
        return __generator(this, function (_a) {
            try {
                cached = localStorage.getItem('export-history');
                if (cached) {
                    history_1 = JSON.parse(cached);
                    setExportHistory(history_1.map(function (item) { return (__assign(__assign({}, item), { createdAt: new Date(item.createdAt), completedAt: item.completedAt ? new Date(item.completedAt) : undefined })); }));
                }
            }
            catch (error) {
                console.error('Failed to load export history:', error);
            }
            return [2 /*return*/];
        });
    }); }, []);
    var cancelExport = (0, react_1.useCallback)(function (exportId) { return __awaiter(_this, void 0, void 0, function () {
        var response, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetch("/api/analytics/export/".concat(exportId), {
                            method: 'DELETE'
                        })];
                case 1:
                    response = _a.sent();
                    if (response.ok) {
                        setActiveExports(function (prev) { return prev.map(function (exp) {
                            return exp.id === exportId ? __assign(__assign({}, exp), { status: 'cancelled' }) : exp;
                        }); });
                        sonner_1.toast.success('Export cancelled successfully');
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    console.error('Failed to cancel export:', error_3);
                    sonner_1.toast.error('Failed to cancel export');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, []);
    var downloadExport = (0, react_1.useCallback)(function (exportItem) { return __awaiter(_this, void 0, void 0, function () {
        var link;
        return __generator(this, function (_a) {
            if (!exportItem.downloadUrl)
                return [2 /*return*/];
            try {
                link = document.createElement('a');
                link.href = exportItem.downloadUrl;
                link.download = exportItem.fileName || 'export';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                sonner_1.toast.success('Download started');
            }
            catch (error) {
                console.error('Download failed:', error);
                sonner_1.toast.error('Failed to download file');
            }
            return [2 /*return*/];
        });
    }); }, []);
    // ========================================================================
    // FORM HANDLERS
    // ========================================================================
    var updateFormData = (0, react_1.useCallback)(function (updates) {
        setFormData(function (prev) { return (__assign(__assign({}, prev), updates)); });
    }, []);
    var updateNestedFormData = (0, react_1.useCallback)(function (path, value) {
        setFormData(function (prev) {
            var newData = __assign({}, prev);
            var keys = path.split('.');
            var current = newData;
            for (var i = 0; i < keys.length - 1; i++) {
                if (!(keys[i] in current)) {
                    current[keys[i]] = {};
                }
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return newData;
        });
    }, []);
    // ========================================================================
    // RENDER HELPERS
    // ========================================================================
    var getFormatIcon = function (format) {
        switch (format) {
            case 'pdf': return <lucide_react_1.FileText className="h-4 w-4"/>;
            case 'excel': return <lucide_react_1.FileSpreadsheet className="h-4 w-4"/>;
            case 'csv': return <lucide_react_1.FileText className="h-4 w-4"/>;
            case 'json': return <lucide_react_1.FileText className="h-4 w-4"/>;
            default: return <lucide_react_1.FileText className="h-4 w-4"/>;
        }
    };
    var getReportTypeIcon = function (reportType) {
        switch (reportType) {
            case 'revenue': return <lucide_react_1.DollarSign className="h-4 w-4"/>;
            case 'conversion': return <lucide_react_1.Target className="h-4 w-4"/>;
            case 'trial': return <lucide_react_1.Zap className="h-4 w-4"/>;
            case 'cohort': return <lucide_react_1.Users className="h-4 w-4"/>;
            case 'forecast': return <lucide_react_1.TrendingUp className="h-4 w-4"/>;
            case 'comprehensive': return <lucide_react_1.BarChart3 className="h-4 w-4"/>;
            default: return <lucide_react_1.BarChart3 className="h-4 w-4"/>;
        }
    };
    var getStatusIcon = function (status) {
        switch (status) {
            case 'pending': return <lucide_react_1.Clock className="h-4 w-4 text-yellow-500"/>;
            case 'processing': return <lucide_react_1.Loader2 className="h-4 w-4 text-blue-500 animate-spin"/>;
            case 'completed': return <lucide_react_1.CheckCircle className="h-4 w-4 text-green-500"/>;
            case 'failed': return <lucide_react_1.XCircle className="h-4 w-4 text-red-500"/>;
            case 'cancelled': return <lucide_react_1.AlertCircle className="h-4 w-4 text-gray-500"/>;
            default: return <lucide_react_1.Clock className="h-4 w-4"/>;
        }
    };
    var getStatusBadgeVariant = function (status) {
        switch (status) {
            case 'pending': return 'secondary';
            case 'processing': return 'default';
            case 'completed': return 'default';
            case 'failed': return 'destructive';
            case 'cancelled': return 'outline';
            default: return 'secondary';
        }
    };
    var formatFileSize = function (bytes) {
        if (!bytes)
            return 'Unknown';
        var sizes = ['Bytes', 'KB', 'MB', 'GB'];
        var i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };
    var formatDuration = function (ms) {
        if (!ms)
            return 'Unknown';
        var seconds = Math.floor(ms / 1000);
        var minutes = Math.floor(seconds / 60);
        var hours = Math.floor(minutes / 60);
        if (hours > 0)
            return "".concat(hours, "h ").concat(minutes % 60, "m");
        if (minutes > 0)
            return "".concat(minutes, "m ").concat(seconds % 60, "s");
        return "".concat(seconds, "s");
    };
    // ========================================================================
    // RENDER
    // ========================================================================
    return (<div className={(0, utils_1.cn)('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics Export</h2>
          <p className="text-muted-foreground">
            Export your analytics data in multiple formats with customizable options
          </p>
        </div>
        <div className="flex items-center gap-2">
          <badge_1.Badge variant="outline" className="text-xs">
            {activeExports.filter(function (exp) { return exp.status === 'processing'; }).length} Processing
          </badge_1.Badge>
          <badge_1.Badge variant="outline" className="text-xs">
            {activeExports.filter(function (exp) { return exp.status === 'completed'; }).length} Completed
          </badge_1.Badge>
        </div>
      </div>

      {/* Main Content */}
      <tabs_1.Tabs value={activeTab} onValueChange={function (value) { return setActiveTab(value); }}>
        <tabs_1.TabsList className="grid w-full grid-cols-2">
          <tabs_1.TabsTrigger value="create" className="flex items-center gap-2">
            <lucide_react_1.Download className="h-4 w-4"/>
            Create Export
          </tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="history" className="flex items-center gap-2">
            <lucide_react_1.Clock className="h-4 w-4"/>
            Export History
          </tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        {/* Create Export Tab */}
        <tabs_1.TabsContent value="create" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Export Configuration */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Configuration */}
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="flex items-center gap-2">
                    <lucide_react_1.Settings className="h-5 w-5"/>
                    Export Configuration
                  </card_1.CardTitle>
                  <card_1.CardDescription>
                    Configure the basic settings for your export
                  </card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Format Selection */}
                    <div className="space-y-2">
                      <label_1.Label htmlFor="format">Export Format</label_1.Label>
                      <select_1.Select value={formData.format} onValueChange={function (value) { return updateFormData({ format: value }); }}>
                        <select_1.SelectTrigger>
                          <select_1.SelectValue placeholder="Select format"/>
                        </select_1.SelectTrigger>
                        <select_1.SelectContent>
                          <select_1.SelectItem value="pdf">
                            <div className="flex items-center gap-2">
                              <lucide_react_1.FileText className="h-4 w-4"/>
                              PDF Report
                            </div>
                          </select_1.SelectItem>
                          <select_1.SelectItem value="excel">
                            <div className="flex items-center gap-2">
                              <lucide_react_1.FileSpreadsheet className="h-4 w-4"/>
                              Excel Workbook
                            </div>
                          </select_1.SelectItem>
                          <select_1.SelectItem value="csv">
                            <div className="flex items-center gap-2">
                              <lucide_react_1.FileText className="h-4 w-4"/>
                              CSV Data
                            </div>
                          </select_1.SelectItem>
                          <select_1.SelectItem value="json">
                            <div className="flex items-center gap-2">
                              <lucide_react_1.FileText className="h-4 w-4"/>
                              JSON Data
                            </div>
                          </select_1.SelectItem>
                        </select_1.SelectContent>
                      </select_1.Select>
                    </div>

                    {/* Report Type Selection */}
                    <div className="space-y-2">
                      <label_1.Label htmlFor="reportType">Report Type</label_1.Label>
                      <select_1.Select value={formData.reportType} onValueChange={function (value) { return updateFormData({ reportType: value }); }}>
                        <select_1.SelectTrigger>
                          <select_1.SelectValue placeholder="Select report type"/>
                        </select_1.SelectTrigger>
                        <select_1.SelectContent>
                          <select_1.SelectItem value="revenue">
                            <div className="flex items-center gap-2">
                              <lucide_react_1.DollarSign className="h-4 w-4"/>
                              Revenue Analytics
                            </div>
                          </select_1.SelectItem>
                          <select_1.SelectItem value="conversion">
                            <div className="flex items-center gap-2">
                              <lucide_react_1.Target className="h-4 w-4"/>
                              Conversion Metrics
                            </div>
                          </select_1.SelectItem>
                          <select_1.SelectItem value="trial">
                            <div className="flex items-center gap-2">
                              <lucide_react_1.Zap className="h-4 w-4"/>
                              Trial Analytics
                            </div>
                          </select_1.SelectItem>
                          <select_1.SelectItem value="cohort">
                            <div className="flex items-center gap-2">
                              <lucide_react_1.Users className="h-4 w-4"/>
                              Cohort Analysis
                            </div>
                          </select_1.SelectItem>
                          <select_1.SelectItem value="forecast">
                            <div className="flex items-center gap-2">
                              <lucide_react_1.TrendingUp className="h-4 w-4"/>
                              Revenue Forecasts
                            </div>
                          </select_1.SelectItem>
                          <select_1.SelectItem value="comprehensive">
                            <div className="flex items-center gap-2">
                              <lucide_react_1.BarChart3 className="h-4 w-4"/>
                              Comprehensive Report
                            </div>
                          </select_1.SelectItem>
                        </select_1.SelectContent>
                      </select_1.Select>
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="space-y-2">
                    <label_1.Label>Date Range</label_1.Label>
                    <div className="grid gap-2 md:grid-cols-2">
                      <popover_1.Popover>
                        <popover_1.PopoverTrigger asChild>
                          <button_1.Button variant="outline" className={(0, utils_1.cn)('justify-start text-left font-normal', !formData.dateRange.startDate && 'text-muted-foreground')}>
                            <lucide_react_1.Calendar className="mr-2 h-4 w-4"/>
                            {formData.dateRange.startDate ? ((0, date_fns_1.format)(formData.dateRange.startDate, 'PPP')) : (<span>Pick start date</span>)}
                          </button_1.Button>
                        </popover_1.PopoverTrigger>
                        <popover_1.PopoverContent className="w-auto p-0">
                          <calendar_1.Calendar mode="single" selected={formData.dateRange.startDate} onSelect={function (date) { return date && updateNestedFormData('dateRange.startDate', date); }} initialFocus/>
                        </popover_1.PopoverContent>
                      </popover_1.Popover>
                      
                      <popover_1.Popover>
                        <popover_1.PopoverTrigger asChild>
                          <button_1.Button variant="outline" className={(0, utils_1.cn)('justify-start text-left font-normal', !formData.dateRange.endDate && 'text-muted-foreground')}>
                            <lucide_react_1.Calendar className="mr-2 h-4 w-4"/>
                            {formData.dateRange.endDate ? ((0, date_fns_1.format)(formData.dateRange.endDate, 'PPP')) : (<span>Pick end date</span>)}
                          </button_1.Button>
                        </popover_1.PopoverTrigger>
                        <popover_1.PopoverContent className="w-auto p-0">
                          <calendar_1.Calendar mode="single" selected={formData.dateRange.endDate} onSelect={function (date) { return date && updateNestedFormData('dateRange.endDate', date); }} initialFocus/>
                        </popover_1.PopoverContent>
                      </popover_1.Popover>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <checkbox_1.Checkbox id="includeSummary" checked={formData.includeSummary} onCheckedChange={function (checked) { return updateFormData({ includeSummary: !!checked }); }}/>
                      <label_1.Label htmlFor="includeSummary">Include executive summary</label_1.Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <checkbox_1.Checkbox id="notifyOnComplete" checked={formData.notifyOnComplete} onCheckedChange={function (checked) { return updateFormData({ notifyOnComplete: !!checked }); }}/>
                      <label_1.Label htmlFor="notifyOnComplete">Email notification when complete</label_1.Label>
                    </div>
                    
                    {formData.notifyOnComplete && (<div className="space-y-2">
                        <label_1.Label htmlFor="email">Email Address</label_1.Label>
                        <input_1.Input id="email" type="email" placeholder="your@email.com" value={formData.email || ''} onChange={function (e) { return updateFormData({ email: e.target.value }); }}/>
                      </div>)}
                  </div>
                </card_1.CardContent>
              </card_1.Card>

              {/* Customization */}
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="flex items-center gap-2">
                    <lucide_react_1.FileImage className="h-5 w-5"/>
                    Customization
                  </card_1.CardTitle>
                  <card_1.CardDescription>
                    Customize the appearance and branding of your export
                  </card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label_1.Label htmlFor="title">Report Title</label_1.Label>
                      <input_1.Input id="title" placeholder="Analytics Report" value={formData.customization.title || ''} onChange={function (e) { return updateNestedFormData('customization.title', e.target.value); }}/>
                    </div>
                    
                    <div className="space-y-2">
                      <label_1.Label htmlFor="subtitle">Report Subtitle</label_1.Label>
                      <input_1.Input id="subtitle" placeholder="Generated by NeonPro Analytics" value={formData.customization.subtitle || ''} onChange={function (e) { return updateNestedFormData('customization.subtitle', e.target.value); }}/>
                    </div>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <label_1.Label htmlFor="primaryColor">Primary Color</label_1.Label>
                      <input_1.Input id="primaryColor" type="color" value={((_b = formData.customization.branding) === null || _b === void 0 ? void 0 : _b.primaryColor) || '#1f2937'} onChange={function (e) { return updateNestedFormData('customization.branding.primaryColor', e.target.value); }}/>
                    </div>
                    
                    <div className="space-y-2">
                      <label_1.Label htmlFor="secondaryColor">Secondary Color</label_1.Label>
                      <input_1.Input id="secondaryColor" type="color" value={((_c = formData.customization.branding) === null || _c === void 0 ? void 0 : _c.secondaryColor) || '#6b7280'} onChange={function (e) { return updateNestedFormData('customization.branding.secondaryColor', e.target.value); }}/>
                    </div>
                    
                    <div className="space-y-2">
                      <label_1.Label htmlFor="fontFamily">Font Family</label_1.Label>
                      <select_1.Select value={((_d = formData.customization.branding) === null || _d === void 0 ? void 0 : _d.fontFamily) || 'Inter'} onValueChange={function (value) { return updateNestedFormData('customization.branding.fontFamily', value); }}>
                        <select_1.SelectTrigger>
                          <select_1.SelectValue />
                        </select_1.SelectTrigger>
                        <select_1.SelectContent>
                          <select_1.SelectItem value="Inter">Inter</select_1.SelectItem>
                          <select_1.SelectItem value="Roboto">Roboto</select_1.SelectItem>
                          <select_1.SelectItem value="Open Sans">Open Sans</select_1.SelectItem>
                          <select_1.SelectItem value="Lato">Lato</select_1.SelectItem>
                          <select_1.SelectItem value="Montserrat">Montserrat</select_1.SelectItem>
                        </select_1.SelectContent>
                      </select_1.Select>
                    </div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            </div>

            {/* Preview and Actions */}
            <div className="space-y-6">
              {/* Export Preview */}
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="flex items-center gap-2">
                    <lucide_react_1.Eye className="h-5 w-5"/>
                    Export Preview
                  </card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      {getFormatIcon(formData.format)}
                      <span className="font-medium">{formData.format.toUpperCase()}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {getReportTypeIcon(formData.reportType)}
                      <span>{formData.reportType.charAt(0).toUpperCase() + formData.reportType.slice(1)} Report</span>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      {(0, date_fns_1.format)(formData.dateRange.startDate, 'MMM d, yyyy')} - {(0, date_fns_1.format)(formData.dateRange.endDate, 'MMM d, yyyy')}
                    </div>
                  </div>
                  
                  <separator_1.Separator />
                  
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div>Title: {formData.customization.title || 'Analytics Report'}</div>
                    <div>Subtitle: {formData.customization.subtitle || 'Generated by NeonPro Analytics'}</div>
                    <div>Summary: {formData.includeSummary ? 'Included' : 'Not included'}</div>
                    <div>Notification: {formData.notifyOnComplete ? 'Enabled' : 'Disabled'}</div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>

              {/* Actions */}
              <card_1.Card>
                <card_1.CardContent className="pt-6">
                  <button_1.Button onClick={createExport} disabled={isLoading} className="w-full" size="lg">
                    {isLoading ? (<>
                        <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                        Creating Export...
                      </>) : (<>
                        <lucide_react_1.Download className="mr-2 h-4 w-4"/>
                        Create Export
                      </>)}
                  </button_1.Button>
                </card_1.CardContent>
              </card_1.Card>

              {/* Quick Actions */}
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="text-sm">Quick Actions</card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent className="space-y-2">
                  <button_1.Button variant="outline" size="sm" className="w-full justify-start" onClick={function () {
            updateFormData({
                format: 'pdf',
                reportType: 'comprehensive',
                dateRange: {
                    startDate: (0, date_fns_1.subDays)(new Date(), 30),
                    endDate: new Date()
                }
            });
        }}>
                    <lucide_react_1.FileText className="mr-2 h-4 w-4"/>
                    Monthly PDF Report
                  </button_1.Button>
                  
                  <button_1.Button variant="outline" size="sm" className="w-full justify-start" onClick={function () {
            updateFormData({
                format: 'excel',
                reportType: 'revenue',
                dateRange: {
                    startDate: (0, date_fns_1.subDays)(new Date(), 90),
                    endDate: new Date()
                }
            });
        }}>
                    <lucide_react_1.FileSpreadsheet className="mr-2 h-4 w-4"/>
                    Quarterly Excel
                  </button_1.Button>
                  
                  <button_1.Button variant="outline" size="sm" className="w-full justify-start" onClick={function () {
            updateFormData({
                format: 'csv',
                reportType: 'cohort',
                dateRange: {
                    startDate: (0, date_fns_1.subDays)(new Date(), 7),
                    endDate: new Date()
                }
            });
        }}>
                    <lucide_react_1.FileText className="mr-2 h-4 w-4"/>
                    Weekly CSV Data
                  </button_1.Button>
                </card_1.CardContent>
              </card_1.Card>
            </div>
          </div>
        </tabs_1.TabsContent>

        {/* Export History Tab */}
        <tabs_1.TabsContent value="history" className="space-y-6">
          {/* Active Exports */}
          {activeExports.length > 0 && (<card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.Loader2 className="h-5 w-5"/>
                  Active Exports
                </card_1.CardTitle>
                <card_1.CardDescription>
                  Currently processing exports
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <scroll_area_1.ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {activeExports.map(function (exportItem) { return (<div key={exportItem.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getFormatIcon(exportItem.config.format)}
                          <div>
                            <div className="font-medium">
                              {exportItem.config.reportType.charAt(0).toUpperCase() + exportItem.config.reportType.slice(1)} Report
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {exportItem.config.format.toUpperCase()} • {(0, date_fns_1.format)(exportItem.createdAt, 'MMM d, HH:mm')}
                            </div>
                            {exportItem.progress && exportItem.status === 'processing' && (<div className="mt-2 space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span>{exportItem.progress.currentStep}</span>
                                  <span>{exportItem.progress.percentage}%</span>
                                </div>
                                <progress_1.Progress value={exportItem.progress.percentage} className="h-1"/>
                                {exportItem.progress.estimatedTimeRemaining && (<div className="text-xs text-muted-foreground">
                                    ~{formatDuration(exportItem.progress.estimatedTimeRemaining)} remaining
                                  </div>)}
                              </div>)}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <badge_1.Badge variant={getStatusBadgeVariant(exportItem.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(exportItem.status)}
                              {exportItem.status}
                            </div>
                          </badge_1.Badge>
                          
                          {exportItem.status === 'completed' && exportItem.downloadUrl && (<button_1.Button size="sm" onClick={function () { return downloadExport(exportItem); }}>
                              <lucide_react_1.Download className="h-4 w-4"/>
                            </button_1.Button>)}
                          
                          {(exportItem.status === 'pending' || exportItem.status === 'processing') && (<button_1.Button size="sm" variant="outline" onClick={function () { return cancelExport(exportItem.id); }}>
                              <lucide_react_1.Trash2 className="h-4 w-4"/>
                            </button_1.Button>)}
                        </div>
                      </div>); })}
                  </div>
                </scroll_area_1.ScrollArea>
              </card_1.CardContent>
            </card_1.Card>)}

          {/* Export History */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Clock className="h-5 w-5"/>
                Export History
              </card_1.CardTitle>
              <card_1.CardDescription>
                Previous exports and downloads
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              {exportHistory.length === 0 ? (<div className="text-center py-8 text-muted-foreground">
                  <lucide_react_1.FileText className="h-12 w-12 mx-auto mb-4 opacity-50"/>
                  <p>No export history yet</p>
                  <p className="text-sm">Create your first export to see it here</p>
                </div>) : (<scroll_area_1.ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {exportHistory.map(function (exportItem) { return (<div key={exportItem.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getFormatIcon(exportItem.config.format)}
                          <div>
                            <div className="font-medium">
                              {exportItem.fileName || "".concat(exportItem.config.reportType, "-export")}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {exportItem.config.format.toUpperCase()} • {formatFileSize(exportItem.fileSize)} • {(0, date_fns_1.format)(exportItem.createdAt, 'MMM d, yyyy HH:mm')}
                            </div>
                            {exportItem.completedAt && (<div className="text-xs text-muted-foreground">
                                Completed in {formatDuration(exportItem.completedAt.getTime() - exportItem.createdAt.getTime())}
                              </div>)}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <badge_1.Badge variant={getStatusBadgeVariant(exportItem.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(exportItem.status)}
                              {exportItem.status}
                            </div>
                          </badge_1.Badge>
                          
                          {exportItem.status === 'completed' && exportItem.downloadUrl && (<button_1.Button size="sm" variant="outline" onClick={function () { return downloadExport(exportItem); }}>
                              <lucide_react_1.Download className="h-4 w-4"/>
                            </button_1.Button>)}
                        </div>
                      </div>); })}
                  </div>
                </scroll_area_1.ScrollArea>)}
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>);
}
exports.default = ExportDashboard;
