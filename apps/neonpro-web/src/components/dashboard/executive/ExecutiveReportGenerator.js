"use strict";
/**
 * Executive Report Generator Component
 *
 * Advanced report generation system for executive dashboard with
 * customizable templates, automated scheduling, and multiple export formats.
 * Implements Story 7.1 reporting requirements.
 */
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
exports.ExecutiveReportGenerator = void 0;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var ui_1 = require("@/components/ui");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/dashboard/utils");
// ============================================================================
// MAIN COMPONENT
// ============================================================================
var ExecutiveReportGenerator = function (_a) {
    // ============================================================================
    // STATE MANAGEMENT
    // ============================================================================
    var _b, _c;
    var clinicId = _a.clinicId, userId = _a.userId, kpis = _a.kpis, alerts = _a.alerts, summary = _a.summary, onReportGenerated = _a.onReportGenerated, onScheduleCreated = _a.onScheduleCreated, className = _a.className;
    var _d = (0, react_1.useState)('generate'), activeTab = _d[0], setActiveTab = _d[1];
    var _e = (0, react_1.useState)(false), isGenerating = _e[0], setIsGenerating = _e[1];
    var _f = (0, react_1.useState)(0), generationProgress = _f[0], setGenerationProgress = _f[1];
    var _g = (0, react_1.useState)([]), generatedReports = _g[0], setGeneratedReports = _g[1];
    var _h = (0, react_1.useState)([]), reportSchedules = _h[0], setReportSchedules = _h[1];
    var _j = (0, react_1.useState)([]), reportTemplates = _j[0], setReportTemplates = _j[1];
    // Generation configuration state
    var _k = (0, react_1.useState)({
        template: null,
        format: 'pdf',
        dateRange: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            end: new Date()
        },
        includeKPIs: [],
        includeCharts: true,
        includeAlerts: true,
        includeSummary: true,
        includeRecommendations: true,
        customSections: [],
        branding: {
            logo: '',
            colors: {
                primary: '#2563eb',
                secondary: '#64748b',
                accent: '#059669'
            },
            fonts: {
                heading: 'Inter',
                body: 'Inter'
            },
            footer: '© 2024 NeonPro Healthcare. All rights reserved.'
        },
        recipients: []
    }), config = _k[0], setConfig = _k[1];
    // Dialog states
    var _l = (0, react_1.useState)(false), showTemplateDialog = _l[0], setShowTemplateDialog = _l[1];
    var _m = (0, react_1.useState)(false), showScheduleDialog = _m[0], setShowScheduleDialog = _m[1];
    var _o = (0, react_1.useState)(false), showPreviewDialog = _o[0], setShowPreviewDialog = _o[1];
    var _p = (0, react_1.useState)(null), selectedReport = _p[0], setSelectedReport = _p[1];
    // Form states
    var _q = (0, react_1.useState)({}), templateForm = _q[0], setTemplateForm = _q[1];
    var _r = (0, react_1.useState)({}), scheduleForm = _r[0], setScheduleForm = _r[1];
    // ============================================================================
    // EFFECTS
    // ============================================================================
    (0, react_1.useEffect)(function () {
        loadReportTemplates();
        loadReportSchedules();
        loadReportHistory();
    }, [clinicId]);
    (0, react_1.useEffect)(function () {
        if (reportTemplates.length > 0 && !config.template) {
            setConfig(function (prev) { return (__assign(__assign({}, prev), { template: reportTemplates.find(function (t) { return t.category === 'executive'; }) || reportTemplates[0] })); });
        }
    }, [reportTemplates]);
    // ============================================================================
    // DATA LOADING
    // ============================================================================
    var loadReportTemplates = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var templates;
        return __generator(this, function (_a) {
            try {
                templates = [
                    {
                        id: 'exec-summary',
                        name: 'Executive Summary',
                        description: 'Comprehensive executive dashboard summary with key metrics and insights',
                        category: 'executive',
                        sections: [
                            { id: 'summary', title: 'Executive Summary', type: 'summary', required: true, order: 1, config: {} },
                            { id: 'kpis', title: 'Key Performance Indicators', type: 'kpis', required: true, order: 2, config: {} },
                            { id: 'charts', title: 'Performance Charts', type: 'charts', required: false, order: 3, config: {} },
                            { id: 'alerts', title: 'Active Alerts', type: 'alerts', required: false, order: 4, config: {} },
                            { id: 'recommendations', title: 'Recommendations', type: 'recommendations', required: false, order: 5, config: {} }
                        ],
                        defaultFormat: 'pdf',
                        isCustom: false,
                        createdBy: 'system',
                        createdAt: new Date()
                    },
                    {
                        id: 'financial-report',
                        name: 'Financial Performance Report',
                        description: 'Detailed financial analysis with revenue, costs, and profitability metrics',
                        category: 'financial',
                        sections: [
                            { id: 'financial-summary', title: 'Financial Summary', type: 'summary', required: true, order: 1, config: {} },
                            { id: 'revenue-kpis', title: 'Revenue Metrics', type: 'kpis', required: true, order: 2, config: { category: 'financial' } },
                            { id: 'financial-charts', title: 'Financial Charts', type: 'charts', required: true, order: 3, config: {} }
                        ],
                        defaultFormat: 'excel',
                        isCustom: false,
                        createdBy: 'system',
                        createdAt: new Date()
                    },
                    {
                        id: 'operational-report',
                        name: 'Operational Efficiency Report',
                        description: 'Operational metrics including utilization, productivity, and efficiency',
                        category: 'operational',
                        sections: [
                            { id: 'operational-summary', title: 'Operational Overview', type: 'summary', required: true, order: 1, config: {} },
                            { id: 'operational-kpis', title: 'Operational KPIs', type: 'kpis', required: true, order: 2, config: { category: 'operational' } },
                            { id: 'efficiency-charts', title: 'Efficiency Trends', type: 'charts', required: false, order: 3, config: {} }
                        ],
                        defaultFormat: 'pdf',
                        isCustom: false,
                        createdBy: 'system',
                        createdAt: new Date()
                    }
                ];
                setReportTemplates(templates);
            }
            catch (error) {
                console.error('Failed to load report templates:', error);
            }
            return [2 /*return*/];
        });
    }); }, []);
    var loadReportSchedules = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var schedules;
        return __generator(this, function (_a) {
            try {
                schedules = [
                    {
                        id: 'weekly-exec',
                        name: 'Weekly Executive Summary',
                        frequency: 'weekly',
                        template: 'exec-summary',
                        recipients: ['ceo@clinic.com', 'cfo@clinic.com'],
                        enabled: true
                    },
                    {
                        id: 'monthly-financial',
                        name: 'Monthly Financial Report',
                        frequency: 'monthly',
                        template: 'financial-report',
                        recipients: ['finance@clinic.com'],
                        enabled: true
                    }
                ];
                setReportSchedules(schedules);
            }
            catch (error) {
                console.error('Failed to load report schedules:', error);
            }
            return [2 /*return*/];
        });
    }); }, []);
    var loadReportHistory = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var reports;
        return __generator(this, function (_a) {
            try {
                reports = [
                    {
                        id: 'report-1',
                        name: 'Executive Summary - December 2024',
                        template: reportTemplates[0],
                        format: 'pdf',
                        data: {},
                        generatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                        size: 2.5 * 1024 * 1024, // 2.5 MB
                        downloadUrl: '/reports/exec-summary-dec-2024.pdf',
                        status: 'completed'
                    },
                    {
                        id: 'report-2',
                        name: 'Financial Report - November 2024',
                        template: reportTemplates[1],
                        format: 'excel',
                        data: {},
                        generatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                        size: 1.8 * 1024 * 1024, // 1.8 MB
                        downloadUrl: '/reports/financial-nov-2024.xlsx',
                        status: 'completed'
                    }
                ];
                setGeneratedReports(reports);
            }
            catch (error) {
                console.error('Failed to load report history:', error);
            }
            return [2 /*return*/];
        });
    }); }, [reportTemplates]);
    // ============================================================================
    // REPORT GENERATION
    // ============================================================================
    var generateReport = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var progressSteps, _i, progressSteps_1, _a, step, progress, newReport_1, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!config.template) {
                        alert('Please select a report template');
                        return [2 /*return*/];
                    }
                    setIsGenerating(true);
                    setGenerationProgress(0);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 8, 9, 10]);
                    progressSteps = [
                        { step: 'Collecting data...', progress: 20 },
                        { step: 'Processing KPIs...', progress: 40 },
                        { step: 'Generating charts...', progress: 60 },
                        { step: 'Formatting report...', progress: 80 },
                        { step: 'Finalizing...', progress: 100 }
                    ];
                    _i = 0, progressSteps_1 = progressSteps;
                    _b.label = 2;
                case 2:
                    if (!(_i < progressSteps_1.length)) return [3 /*break*/, 5];
                    _a = progressSteps_1[_i], step = _a.step, progress = _a.progress;
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                case 3:
                    _b.sent();
                    setGenerationProgress(progress);
                    _b.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    newReport_1 = {
                        id: "report-".concat(Date.now()),
                        name: "".concat(config.template.name, " - ").concat(utils_1.formatters.date(new Date())),
                        template: config.template,
                        format: config.format,
                        data: {
                            kpis: config.includeKPIs.length > 0
                                ? kpis.filter(function (kpi) { return config.includeKPIs.includes(kpi.id); })
                                : kpis,
                            alerts: config.includeAlerts ? alerts : [],
                            summary: config.includeSummary ? summary : null,
                            dateRange: config.dateRange,
                            customSections: config.customSections
                        },
                        generatedAt: new Date(),
                        size: Math.random() * 3 * 1024 * 1024, // Random size between 0-3MB
                        downloadUrl: "/reports/".concat(config.template.id, "-").concat(Date.now(), ".").concat(config.format),
                        status: 'completed'
                    };
                    setGeneratedReports(function (prev) { return __spreadArray([newReport_1], prev, true); });
                    onReportGenerated === null || onReportGenerated === void 0 ? void 0 : onReportGenerated(newReport_1);
                    if (!(config.recipients.length > 0)) return [3 /*break*/, 7];
                    return [4 /*yield*/, sendReportEmail(newReport_1, config.recipients)];
                case 6:
                    _b.sent();
                    _b.label = 7;
                case 7: return [3 /*break*/, 10];
                case 8:
                    error_1 = _b.sent();
                    console.error('Failed to generate report:', error_1);
                    alert('Failed to generate report. Please try again.');
                    return [3 /*break*/, 10];
                case 9:
                    setIsGenerating(false);
                    setGenerationProgress(0);
                    return [7 /*endfinally*/];
                case 10: return [2 /*return*/];
            }
        });
    }); }, [config, kpis, alerts, summary, onReportGenerated]);
    var sendReportEmail = function (report, recipients) { return __awaiter(void 0, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    // Mock email sending - in real implementation, this would call an API
                    console.log("Sending report ".concat(report.name, " to:"), recipients);
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error('Failed to send report email:', error_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // ============================================================================
    // TEMPLATE MANAGEMENT
    // ============================================================================
    var createTemplate = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var newTemplate_1;
        return __generator(this, function (_a) {
            if (!templateForm.name || !templateForm.description) {
                alert('Please fill in all required fields');
                return [2 /*return*/];
            }
            try {
                newTemplate_1 = {
                    id: "template-".concat(Date.now()),
                    name: templateForm.name,
                    description: templateForm.description,
                    category: templateForm.category || 'executive',
                    sections: templateForm.sections || [],
                    defaultFormat: templateForm.defaultFormat || 'pdf',
                    isCustom: true,
                    createdBy: userId,
                    createdAt: new Date()
                };
                setReportTemplates(function (prev) { return __spreadArray(__spreadArray([], prev, true), [newTemplate_1], false); });
                setTemplateForm({});
                setShowTemplateDialog(false);
            }
            catch (error) {
                console.error('Failed to create template:', error);
                alert('Failed to create template. Please try again.');
            }
            return [2 /*return*/];
        });
    }); }, [templateForm, userId]);
    // ============================================================================
    // SCHEDULE MANAGEMENT
    // ============================================================================
    var createSchedule = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var newSchedule_1;
        return __generator(this, function (_a) {
            if (!scheduleForm.name || !scheduleForm.template || !scheduleForm.frequency) {
                alert('Please fill in all required fields');
                return [2 /*return*/];
            }
            try {
                newSchedule_1 = {
                    id: "schedule-".concat(Date.now()),
                    name: scheduleForm.name,
                    frequency: scheduleForm.frequency,
                    template: scheduleForm.template,
                    recipients: scheduleForm.recipients || [],
                    enabled: scheduleForm.enabled !== false
                };
                setReportSchedules(function (prev) { return __spreadArray(__spreadArray([], prev, true), [newSchedule_1], false); });
                setScheduleForm({});
                setShowScheduleDialog(false);
                onScheduleCreated === null || onScheduleCreated === void 0 ? void 0 : onScheduleCreated(newSchedule_1);
            }
            catch (error) {
                console.error('Failed to create schedule:', error);
                alert('Failed to create schedule. Please try again.');
            }
            return [2 /*return*/];
        });
    }); }, [scheduleForm, onScheduleCreated]);
    var toggleSchedule = (0, react_1.useCallback)(function (scheduleId) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                setReportSchedules(function (prev) {
                    return prev.map(function (schedule) {
                        return schedule.id === scheduleId
                            ? __assign(__assign({}, schedule), { enabled: !schedule.enabled }) : schedule;
                    });
                });
            }
            catch (error) {
                console.error('Failed to toggle schedule:', error);
            }
            return [2 /*return*/];
        });
    }); }, []);
    // ============================================================================
    // UTILITY FUNCTIONS
    // ============================================================================
    var formatFileSize = function (bytes) {
        if (bytes === 0)
            return '0 Bytes';
        var k = 1024;
        var sizes = ['Bytes', 'KB', 'MB', 'GB'];
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    var getStatusIcon = function (status) {
        switch (status) {
            case 'completed':
                return <lucide_react_1.CheckCircle className="h-4 w-4 text-green-500"/>;
            case 'failed':
                return <lucide_react_1.XCircle className="h-4 w-4 text-red-500"/>;
            case 'generating':
                return <lucide_react_1.RefreshCw className="h-4 w-4 text-blue-500 animate-spin"/>;
            default:
                return <lucide_react_1.Clock className="h-4 w-4 text-gray-500"/>;
        }
    };
    var getFrequencyBadge = function (frequency) {
        var colors = {
            daily: 'bg-blue-100 text-blue-800',
            weekly: 'bg-green-100 text-green-800',
            monthly: 'bg-purple-100 text-purple-800',
            quarterly: 'bg-orange-100 text-orange-800'
        };
        return (<ui_1.Badge className={colors[frequency] || 'bg-gray-100 text-gray-800'}>
        {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
      </ui_1.Badge>);
    };
    // ============================================================================
    // MEMOIZED VALUES
    // ============================================================================
    var availableKPIs = (0, react_1.useMemo)(function () {
        return kpis.map(function (kpi) { return ({
            id: kpi.id,
            name: kpi.name,
            category: kpi.category
        }); });
    }, [kpis]);
    var filteredTemplates = (0, react_1.useMemo)(function () {
        return reportTemplates.filter(function (template) {
            return template.category === 'executive' || template.isCustom;
        });
    }, [reportTemplates]);
    // ============================================================================
    // RENDER
    // ============================================================================
    return (<div className={"space-y-6 ".concat(className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Report Generator</h2>
          <p className="text-muted-foreground">
            Generate comprehensive executive reports with customizable templates and automated scheduling.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <ui_1.Button onClick={generateReport} disabled={isGenerating || !config.template} className="bg-blue-600 hover:bg-blue-700">
            {isGenerating ? (<>
                <lucide_react_1.RefreshCw className="mr-2 h-4 w-4 animate-spin"/>
                Generating...
              </>) : (<>
                <lucide_react_1.FileText className="mr-2 h-4 w-4"/>
                Generate Report
              </>)}
          </ui_1.Button>
        </div>
      </div>

      {/* Generation Progress */}
      {isGenerating && (<card_1.Card>
          <card_1.CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Generating report...</span>
                <span>{generationProgress}%</span>
              </div>
              <ui_1.Progress value={generationProgress} className="w-full"/>
            </div>
          </card_1.CardContent>
        </card_1.Card>)}

      <ui_1.Tabs value={activeTab} onValueChange={function (value) { return setActiveTab(value); }}>
        <ui_1.TabsList className="grid w-full grid-cols-4">
          <ui_1.TabsTrigger value="generate">Generate</ui_1.TabsTrigger>
          <ui_1.TabsTrigger value="templates">Templates</ui_1.TabsTrigger>
          <ui_1.TabsTrigger value="schedules">Schedules</ui_1.TabsTrigger>
          <ui_1.TabsTrigger value="history">History</ui_1.TabsTrigger>
        </ui_1.TabsList>

        {/* Generate Tab */}
        <ui_1.TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuration Panel */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Report Configuration</card_1.CardTitle>
                <card_1.CardDescription>
                  Configure your report settings and content options.
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                {/* Template Selection */}
                <div className="space-y-2">
                  <ui_1.Label>Report Template</ui_1.Label>
                  <ui_1.Select value={((_b = config.template) === null || _b === void 0 ? void 0 : _b.id) || ''} onValueChange={function (value) {
            var template = reportTemplates.find(function (t) { return t.id === value; });
            if (template) {
                setConfig(function (prev) { return (__assign(__assign({}, prev), { template: template })); });
            }
        }}>
                    <ui_1.SelectTrigger>
                      <ui_1.SelectValue placeholder="Select a template"/>
                    </ui_1.SelectTrigger>
                    <ui_1.SelectContent>
                      {filteredTemplates.map(function (template) { return (<ui_1.SelectItem key={template.id} value={template.id}>
                          <div className="flex items-center space-x-2">
                            <span>{template.name}</span>
                            {template.isCustom && (<ui_1.Badge variant="outline" className="text-xs">
                                Custom
                              </ui_1.Badge>)}
                          </div>
                        </ui_1.SelectItem>); })}
                    </ui_1.SelectContent>
                  </ui_1.Select>
                </div>

                {/* Format Selection */}
                <div className="space-y-2">
                  <ui_1.Label>Export Format</ui_1.Label>
                  <ui_1.Select value={config.format} onValueChange={function (value) {
            return setConfig(function (prev) { return (__assign(__assign({}, prev), { format: value })); });
        }}>
                    <ui_1.SelectTrigger>
                      <ui_1.SelectValue />
                    </ui_1.SelectTrigger>
                    <ui_1.SelectContent>
                      <ui_1.SelectItem value="pdf">PDF Document</ui_1.SelectItem>
                      <ui_1.SelectItem value="excel">Excel Spreadsheet</ui_1.SelectItem>
                      <ui_1.SelectItem value="word">Word Document</ui_1.SelectItem>
                      <ui_1.SelectItem value="powerpoint">PowerPoint Presentation</ui_1.SelectItem>
                    </ui_1.SelectContent>
                  </ui_1.Select>
                </div>

                {/* Date Range */}
                <div className="space-y-2">
                  <ui_1.Label>Date Range</ui_1.Label>
                  <div className="grid grid-cols-2 gap-2">
                    <ui_1.Input type="date" value={config.dateRange.start.toISOString().split('T')[0]} onChange={function (e) {
            var date = new Date(e.target.value);
            setConfig(function (prev) { return (__assign(__assign({}, prev), { dateRange: __assign(__assign({}, prev.dateRange), { start: date }) })); });
        }}/>
                    <ui_1.Input type="date" value={config.dateRange.end.toISOString().split('T')[0]} onChange={function (e) {
            var date = new Date(e.target.value);
            setConfig(function (prev) { return (__assign(__assign({}, prev), { dateRange: __assign(__assign({}, prev.dateRange), { end: date }) })); });
        }}/>
                  </div>
                </div>

                {/* Content Options */}
                <div className="space-y-3">
                  <ui_1.Label>Content Options</ui_1.Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <ui_1.Label htmlFor="include-charts" className="text-sm font-normal">
                        Include Charts
                      </ui_1.Label>
                      <ui_1.Switch id="include-charts" checked={config.includeCharts} onCheckedChange={function (checked) {
            return setConfig(function (prev) { return (__assign(__assign({}, prev), { includeCharts: checked })); });
        }}/>
                    </div>
                    <div className="flex items-center justify-between">
                      <ui_1.Label htmlFor="include-alerts" className="text-sm font-normal">
                        Include Alerts
                      </ui_1.Label>
                      <ui_1.Switch id="include-alerts" checked={config.includeAlerts} onCheckedChange={function (checked) {
            return setConfig(function (prev) { return (__assign(__assign({}, prev), { includeAlerts: checked })); });
        }}/>
                    </div>
                    <div className="flex items-center justify-between">
                      <ui_1.Label htmlFor="include-summary" className="text-sm font-normal">
                        Include Executive Summary
                      </ui_1.Label>
                      <ui_1.Switch id="include-summary" checked={config.includeSummary} onCheckedChange={function (checked) {
            return setConfig(function (prev) { return (__assign(__assign({}, prev), { includeSummary: checked })); });
        }}/>
                    </div>
                    <div className="flex items-center justify-between">
                      <ui_1.Label htmlFor="include-recommendations" className="text-sm font-normal">
                        Include Recommendations
                      </ui_1.Label>
                      <ui_1.Switch id="include-recommendations" checked={config.includeRecommendations} onCheckedChange={function (checked) {
            return setConfig(function (prev) { return (__assign(__assign({}, prev), { includeRecommendations: checked })); });
        }}/>
                    </div>
                  </div>
                </div>

                {/* Email Recipients */}
                <div className="space-y-2">
                  <ui_1.Label>Email Recipients (Optional)</ui_1.Label>
                  <ui_1.Textarea placeholder="Enter email addresses separated by commas" value={config.recipients.join(', ')} onChange={function (e) {
            var emails = e.target.value
                .split(',')
                .map(function (email) { return email.trim(); })
                .filter(function (email) { return email.length > 0; });
            setConfig(function (prev) { return (__assign(__assign({}, prev), { recipients: emails })); });
        }} rows={2}/>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            {/* Preview Panel */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Report Preview</card_1.CardTitle>
                <card_1.CardDescription>
                  Preview of the selected template and configuration.
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                {config.template ? (<div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <h3 className="font-semibold">{config.template.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {config.template.description}
                      </p>
                      <div className="mt-3 space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Sections:</span>
                          <ul className="mt-1 space-y-1">
                            {config.template.sections.map(function (section) { return (<li key={section.id} className="flex items-center space-x-2">
                                <lucide_react_1.CheckCircle className="h-3 w-3 text-green-500"/>
                                <span className="text-xs">{section.title}</span>
                                {section.required && (<ui_1.Badge variant="outline" className="text-xs">
                                    Required
                                  </ui_1.Badge>)}
                              </li>); })}
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Format:</span>
                        <p className="text-muted-foreground">{config.format.toUpperCase()}</p>
                      </div>
                      <div>
                        <span className="font-medium">Period:</span>
                        <p className="text-muted-foreground">
                          {utils_1.formatters.dateRange(config.dateRange)}
                        </p>
                      </div>
                    </div>

                    {config.recipients.length > 0 && (<div className="text-sm">
                        <span className="font-medium">Recipients:</span>
                        <p className="text-muted-foreground">
                          {config.recipients.length} recipient(s)
                        </p>
                      </div>)}
                  </div>) : (<div className="text-center py-8 text-muted-foreground">
                    <lucide_react_1.FileText className="h-12 w-12 mx-auto mb-4 opacity-50"/>
                    <p>Select a template to see preview</p>
                  </div>)}
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </ui_1.TabsContent>

        {/* Templates Tab */}
        <ui_1.TabsContent value="templates" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Report Templates</h3>
              <p className="text-sm text-muted-foreground">
                Manage and customize report templates for different use cases.
              </p>
            </div>
            <ui_1.Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
              <ui_1.DialogTrigger asChild>
                <ui_1.Button>
                  <lucide_react_1.Plus className="mr-2 h-4 w-4"/>
                  Create Template
                </ui_1.Button>
              </ui_1.DialogTrigger>
              <ui_1.DialogContent className="max-w-2xl">
                <ui_1.DialogHeader>
                  <ui_1.DialogTitle>Create Report Template</ui_1.DialogTitle>
                  <ui_1.DialogDescription>
                    Create a custom report template with your preferred sections and layout.
                  </ui_1.DialogDescription>
                </ui_1.DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <ui_1.Label>Template Name</ui_1.Label>
                      <ui_1.Input placeholder="Enter template name" value={templateForm.name || ''} onChange={function (e) {
            return setTemplateForm(function (prev) { return (__assign(__assign({}, prev), { name: e.target.value })); });
        }}/>
                    </div>
                    <div className="space-y-2">
                      <ui_1.Label>Category</ui_1.Label>
                      <ui_1.Select value={templateForm.category || 'executive'} onValueChange={function (value) {
            return setTemplateForm(function (prev) { return (__assign(__assign({}, prev), { category: value })); });
        }}>
                        <ui_1.SelectTrigger>
                          <ui_1.SelectValue />
                        </ui_1.SelectTrigger>
                        <ui_1.SelectContent>
                          <ui_1.SelectItem value="executive">Executive</ui_1.SelectItem>
                          <ui_1.SelectItem value="financial">Financial</ui_1.SelectItem>
                          <ui_1.SelectItem value="operational">Operational</ui_1.SelectItem>
                          <ui_1.SelectItem value="clinical">Clinical</ui_1.SelectItem>
                        </ui_1.SelectContent>
                      </ui_1.Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <ui_1.Label>Description</ui_1.Label>
                    <ui_1.Textarea placeholder="Describe the purpose and content of this template" value={templateForm.description || ''} onChange={function (e) {
            return setTemplateForm(function (prev) { return (__assign(__assign({}, prev), { description: e.target.value })); });
        }} rows={3}/>
                  </div>
                </div>
                <ui_1.DialogFooter>
                  <ui_1.Button variant="outline" onClick={function () { return setShowTemplateDialog(false); }}>
                    Cancel
                  </ui_1.Button>
                  <ui_1.Button onClick={createTemplate}>
                    Create Template
                  </ui_1.Button>
                </ui_1.DialogFooter>
              </ui_1.DialogContent>
            </ui_1.Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTemplates.map(function (template) { return (<card_1.Card key={template.id} className="hover:shadow-md transition-shadow">
                <card_1.CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <card_1.CardTitle className="text-base">{template.name}</card_1.CardTitle>
                      <card_1.CardDescription className="text-sm">
                        {template.description}
                      </card_1.CardDescription>
                    </div>
                    <dropdown_menu_1.DropdownMenu>
                      <dropdown_menu_1.DropdownMenuTrigger asChild>
                        <ui_1.Button variant="ghost" size="sm">
                          <lucide_react_1.Settings className="h-4 w-4"/>
                        </ui_1.Button>
                      </dropdown_menu_1.DropdownMenuTrigger>
                      <dropdown_menu_1.DropdownMenuContent align="end">
                        <dropdown_menu_1.DropdownMenuItem>
                          <lucide_react_1.Eye className="mr-2 h-4 w-4"/>
                          Preview
                        </dropdown_menu_1.DropdownMenuItem>
                        <dropdown_menu_1.DropdownMenuItem>
                          <lucide_react_1.Copy className="mr-2 h-4 w-4"/>
                          Duplicate
                        </dropdown_menu_1.DropdownMenuItem>
                        {template.isCustom && (<>
                            <dropdown_menu_1.DropdownMenuItem>
                              <lucide_react_1.Edit className="mr-2 h-4 w-4"/>
                              Edit
                            </dropdown_menu_1.DropdownMenuItem>
                            <dropdown_menu_1.DropdownMenuSeparator />
                            <dropdown_menu_1.DropdownMenuItem className="text-red-600">
                              <lucide_react_1.Trash2 className="mr-2 h-4 w-4"/>
                              Delete
                            </dropdown_menu_1.DropdownMenuItem>
                          </>)}
                      </dropdown_menu_1.DropdownMenuContent>
                    </dropdown_menu_1.DropdownMenu>
                  </div>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Category:</span>
                      <ui_1.Badge variant="outline">
                        {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                      </ui_1.Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Sections:</span>
                      <span>{template.sections.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Default Format:</span>
                      <span className="uppercase">{template.defaultFormat}</span>
                    </div>
                    {template.isCustom && (<ui_1.Badge className="w-full justify-center">
                        Custom Template
                      </ui_1.Badge>)}
                  </div>
                </card_1.CardContent>
              </card_1.Card>); })}
          </div>
        </ui_1.TabsContent>

        {/* Schedules Tab */}
        <ui_1.TabsContent value="schedules" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Report Schedules</h3>
              <p className="text-sm text-muted-foreground">
                Automate report generation and delivery with scheduled reports.
              </p>
            </div>
            <ui_1.Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
              <ui_1.DialogTrigger asChild>
                <ui_1.Button>
                  <lucide_react_1.Plus className="mr-2 h-4 w-4"/>
                  Create Schedule
                </ui_1.Button>
              </ui_1.DialogTrigger>
              <ui_1.DialogContent>
                <ui_1.DialogHeader>
                  <ui_1.DialogTitle>Create Report Schedule</ui_1.DialogTitle>
                  <ui_1.DialogDescription>
                    Set up automated report generation and delivery.
                  </ui_1.DialogDescription>
                </ui_1.DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <ui_1.Label>Schedule Name</ui_1.Label>
                    <ui_1.Input placeholder="Enter schedule name" value={scheduleForm.name || ''} onChange={function (e) {
            return setScheduleForm(function (prev) { return (__assign(__assign({}, prev), { name: e.target.value })); });
        }}/>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <ui_1.Label>Template</ui_1.Label>
                      <ui_1.Select value={scheduleForm.template || ''} onValueChange={function (value) {
            return setScheduleForm(function (prev) { return (__assign(__assign({}, prev), { template: value })); });
        }}>
                        <ui_1.SelectTrigger>
                          <ui_1.SelectValue placeholder="Select template"/>
                        </ui_1.SelectTrigger>
                        <ui_1.SelectContent>
                          {reportTemplates.map(function (template) { return (<ui_1.SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </ui_1.SelectItem>); })}
                        </ui_1.SelectContent>
                      </ui_1.Select>
                    </div>
                    <div className="space-y-2">
                      <ui_1.Label>Frequency</ui_1.Label>
                      <ui_1.Select value={scheduleForm.frequency || ''} onValueChange={function (value) {
            return setScheduleForm(function (prev) { return (__assign(__assign({}, prev), { frequency: value })); });
        }}>
                        <ui_1.SelectTrigger>
                          <ui_1.SelectValue placeholder="Select frequency"/>
                        </ui_1.SelectTrigger>
                        <ui_1.SelectContent>
                          <ui_1.SelectItem value="daily">Daily</ui_1.SelectItem>
                          <ui_1.SelectItem value="weekly">Weekly</ui_1.SelectItem>
                          <ui_1.SelectItem value="monthly">Monthly</ui_1.SelectItem>
                          <ui_1.SelectItem value="quarterly">Quarterly</ui_1.SelectItem>
                        </ui_1.SelectContent>
                      </ui_1.Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <ui_1.Label>Recipients</ui_1.Label>
                    <ui_1.Textarea placeholder="Enter email addresses separated by commas" value={((_c = scheduleForm.recipients) === null || _c === void 0 ? void 0 : _c.join(', ')) || ''} onChange={function (e) {
            var emails = e.target.value
                .split(',')
                .map(function (email) { return email.trim(); })
                .filter(function (email) { return email.length > 0; });
            setScheduleForm(function (prev) { return (__assign(__assign({}, prev), { recipients: emails })); });
        }} rows={2}/>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ui_1.Switch id="schedule-enabled" checked={scheduleForm.enabled !== false} onCheckedChange={function (checked) {
            return setScheduleForm(function (prev) { return (__assign(__assign({}, prev), { enabled: checked })); });
        }}/>
                    <ui_1.Label htmlFor="schedule-enabled">Enable schedule</ui_1.Label>
                  </div>
                </div>
                <ui_1.DialogFooter>
                  <ui_1.Button variant="outline" onClick={function () { return setShowScheduleDialog(false); }}>
                    Cancel
                  </ui_1.Button>
                  <ui_1.Button onClick={createSchedule}>
                    Create Schedule
                  </ui_1.Button>
                </ui_1.DialogFooter>
              </ui_1.DialogContent>
            </ui_1.Dialog>
          </div>

          <div className="space-y-4">
            {reportSchedules.map(function (schedule) {
            var _a;
            return (<card_1.Card key={schedule.id}>
                <card_1.CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold">{schedule.name}</h4>
                        {getFrequencyBadge(schedule.frequency)}
                        <ui_1.Badge variant={schedule.enabled ? "default" : "secondary"} className={schedule.enabled ? "bg-green-100 text-green-800" : ""}>
                          {schedule.enabled ? 'Active' : 'Inactive'}
                        </ui_1.Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Template: {(_a = reportTemplates.find(function (t) { return t.id === schedule.template; })) === null || _a === void 0 ? void 0 : _a.name}</span>
                        <span>Recipients: {schedule.recipients.length}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ui_1.Button variant="outline" size="sm" onClick={function () { return toggleSchedule(schedule.id); }}>
                        {schedule.enabled ? (<>
                            <lucide_react_1.Pause className="mr-2 h-4 w-4"/>
                            Pause
                          </>) : (<>
                            <lucide_react_1.Play className="mr-2 h-4 w-4"/>
                            Resume
                          </>)}
                      </ui_1.Button>
                      <dropdown_menu_1.DropdownMenu>
                        <dropdown_menu_1.DropdownMenuTrigger asChild>
                          <ui_1.Button variant="ghost" size="sm">
                            <lucide_react_1.Settings className="h-4 w-4"/>
                          </ui_1.Button>
                        </dropdown_menu_1.DropdownMenuTrigger>
                        <dropdown_menu_1.DropdownMenuContent align="end">
                          <dropdown_menu_1.DropdownMenuItem>
                            <lucide_react_1.Edit className="mr-2 h-4 w-4"/>
                            Edit
                          </dropdown_menu_1.DropdownMenuItem>
                          <dropdown_menu_1.DropdownMenuItem>
                            <lucide_react_1.Copy className="mr-2 h-4 w-4"/>
                            Duplicate
                          </dropdown_menu_1.DropdownMenuItem>
                          <dropdown_menu_1.DropdownMenuSeparator />
                          <dropdown_menu_1.DropdownMenuItem className="text-red-600">
                            <lucide_react_1.Trash2 className="mr-2 h-4 w-4"/>
                            Delete
                          </dropdown_menu_1.DropdownMenuItem>
                        </dropdown_menu_1.DropdownMenuContent>
                      </dropdown_menu_1.DropdownMenu>
                    </div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>);
        })}
          </div>
        </ui_1.TabsContent>

        {/* History Tab */}
        <ui_1.TabsContent value="history" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Report History</h3>
              <p className="text-sm text-muted-foreground">
                View and download previously generated reports.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <ui_1.Button variant="outline" size="sm">
                <lucide_react_1.Filter className="mr-2 h-4 w-4"/>
                Filter
              </ui_1.Button>
              <ui_1.Button variant="outline" size="sm">
                <lucide_react_1.Search className="mr-2 h-4 w-4"/>
                Search
              </ui_1.Button>
            </div>
          </div>

          <div className="space-y-4">
            {generatedReports.map(function (report) { return (<card_1.Card key={report.id}>
                <card_1.CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(report.status)}
                        <h4 className="font-semibold">{report.name}</h4>
                        <ui_1.Badge variant="outline">
                          {report.format.toUpperCase()}
                        </ui_1.Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Generated: {utils_1.formatters.dateTime(report.generatedAt)}</span>
                        <span>Size: {formatFileSize(report.size)}</span>
                        <span>Template: {report.template.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ui_1.Button variant="outline" size="sm">
                        <lucide_react_1.Eye className="mr-2 h-4 w-4"/>
                        Preview
                      </ui_1.Button>
                      <ui_1.Button variant="outline" size="sm">
                        <lucide_react_1.Download className="mr-2 h-4 w-4"/>
                        Download
                      </ui_1.Button>
                      <ui_1.Button variant="outline" size="sm">
                        <lucide_react_1.Send className="mr-2 h-4 w-4"/>
                        Share
                      </ui_1.Button>
                      <dropdown_menu_1.DropdownMenu>
                        <dropdown_menu_1.DropdownMenuTrigger asChild>
                          <ui_1.Button variant="ghost" size="sm">
                            <lucide_react_1.Settings className="h-4 w-4"/>
                          </ui_1.Button>
                        </dropdown_menu_1.DropdownMenuTrigger>
                        <dropdown_menu_1.DropdownMenuContent align="end">
                          <dropdown_menu_1.DropdownMenuItem>
                            <lucide_react_1.Copy className="mr-2 h-4 w-4"/>
                            Duplicate
                          </dropdown_menu_1.DropdownMenuItem>
                          <dropdown_menu_1.DropdownMenuSeparator />
                          <dropdown_menu_1.DropdownMenuItem className="text-red-600">
                            <lucide_react_1.Trash2 className="mr-2 h-4 w-4"/>
                            Delete
                          </dropdown_menu_1.DropdownMenuItem>
                        </dropdown_menu_1.DropdownMenuContent>
                      </dropdown_menu_1.DropdownMenu>
                    </div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>); })}
          </div>
        </ui_1.TabsContent>
      </ui_1.Tabs>
    </div>);
};
exports.ExecutiveReportGenerator = ExecutiveReportGenerator;
exports.default = exports.ExecutiveReportGenerator;
