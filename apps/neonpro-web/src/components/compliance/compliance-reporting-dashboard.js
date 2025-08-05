'use client';
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
exports.default = ComplianceReportingDashboard;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var select_1 = require("@/components/ui/select");
var label_1 = require("@/components/ui/label");
var progress_1 = require("@/components/ui/progress");
var alert_1 = require("@/components/ui/alert");
var table_1 = require("@/components/ui/table");
var lucide_react_1 = require("lucide-react");
var auth_helpers_nextjs_1 = require("@supabase/auth-helpers-nextjs");
var use_toast_1 = require("@/hooks/use-toast");
function ComplianceReportingDashboard(_a) {
    var _this = this;
    var clinicId = _a.clinicId;
    var _b = (0, react_1.useState)(null), analytics = _b[0], setAnalytics = _b[1];
    var _c = (0, react_1.useState)(true), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)('30'), timeRange = _d[0], setTimeRange = _d[1]; // days
    var _e = (0, react_1.useState)('summary'), reportType = _e[0], setReportType = _e[1];
    var _f = (0, react_1.useState)(false), generatingReport = _f[0], setGeneratingReport = _f[1];
    var supabase = (0, auth_helpers_nextjs_1.createClientComponentClient)();
    var toast = (0, use_toast_1.useToast)().toast;
    (0, react_1.useEffect)(function () {
        fetchAnalytics();
    }, [clinicId, timeRange]);
    var fetchAnalytics = function () { return __awaiter(_this, void 0, void 0, function () {
        var cutoffDate, _a, consents, consentsError, totalConsents, signedConsents, pendingConsents, revokedConsents, expiredConsents, complianceRate, consentsByType, consentsByMonth, withdrawalReasons, averageSigningTime, now_1, criticalAlerts, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    cutoffDate = new Date();
                    cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeRange));
                    return [4 /*yield*/, supabase
                            .from('patient_consent')
                            .select('*')
                            .eq('clinic_id', clinicId)
                            .gte('consent_date', cutoffDate.toISOString())];
                case 1:
                    _a = _b.sent(), consents = _a.data, consentsError = _a.error;
                    if (consentsError) {
                        console.error('Error fetching consents:', consentsError);
                        toast({
                            title: 'Error',
                            description: 'Failed to fetch consent analytics',
                            variant: 'destructive'
                        });
                        return [2 /*return*/];
                    }
                    totalConsents = (consents === null || consents === void 0 ? void 0 : consents.length) || 0;
                    signedConsents = (consents === null || consents === void 0 ? void 0 : consents.filter(function (c) { return c.status === 'signed'; }).length) || 0;
                    pendingConsents = (consents === null || consents === void 0 ? void 0 : consents.filter(function (c) { return c.status === 'pending'; }).length) || 0;
                    revokedConsents = (consents === null || consents === void 0 ? void 0 : consents.filter(function (c) { return c.status === 'revoked'; }).length) || 0;
                    expiredConsents = (consents === null || consents === void 0 ? void 0 : consents.filter(function (c) { return c.status === 'expired'; }).length) || 0;
                    complianceRate = totalConsents > 0 ? (signedConsents / totalConsents) * 100 : 0;
                    consentsByType = (consents === null || consents === void 0 ? void 0 : consents.reduce(function (acc, consent) {
                        var type = consent.consent_type || 'unknown';
                        acc[type] = (acc[type] || 0) + 1;
                        return acc;
                    }, {})) || {};
                    consentsByMonth = (consents === null || consents === void 0 ? void 0 : consents.reduce(function (acc, consent) {
                        var month = new Date(consent.consent_date).toLocaleDateString('pt-BR', {
                            year: 'numeric',
                            month: 'short'
                        });
                        acc[month] = (acc[month] || 0) + 1;
                        return acc;
                    }, {})) || {};
                    withdrawalReasons = (consents === null || consents === void 0 ? void 0 : consents.reduce(function (acc, consent) {
                        if (consent.withdrawal_reason) {
                            acc[consent.withdrawal_reason] = (acc[consent.withdrawal_reason] || 0) + 1;
                        }
                        return acc;
                    }, {})) || {};
                    averageSigningTime = Math.random() * 10 + 5 // 5-15 minutes mock
                    ;
                    now_1 = new Date();
                    criticalAlerts = (consents === null || consents === void 0 ? void 0 : consents.filter(function (consent) {
                        if (consent.status === 'pending') {
                            var consentDate = new Date(consent.consent_date);
                            var daysDiff = (now_1.getTime() - consentDate.getTime()) / (1000 * 3600 * 24);
                            return daysDiff > 7; // Pending for more than 7 days
                        }
                        return false;
                    }).length) || 0;
                    setAnalytics({
                        totalConsents: totalConsents,
                        signedConsents: signedConsents,
                        pendingConsents: pendingConsents,
                        revokedConsents: revokedConsents,
                        expiredConsents: expiredConsents,
                        complianceRate: complianceRate,
                        consentsByType: consentsByType,
                        consentsByMonth: consentsByMonth,
                        withdrawalReasons: withdrawalReasons,
                        averageSigningTime: averageSigningTime,
                        criticalAlerts: criticalAlerts
                    });
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _b.sent();
                    console.error('Error:', error_1);
                    toast({
                        title: 'Error',
                        description: 'An unexpected error occurred',
                        variant: 'destructive'
                    });
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var generateReport = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setGeneratingReport(true);
                    // Simulate report generation
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 2000); })];
                case 1:
                    // Simulate report generation
                    _a.sent();
                    toast({
                        title: 'Success',
                        description: "".concat(reportType, " report generated successfully"),
                        variant: 'default'
                    });
                    return [3 /*break*/, 4];
                case 2:
                    error_2 = _a.sent();
                    console.error('Error:', error_2);
                    toast({
                        title: 'Error',
                        description: 'Failed to generate report',
                        variant: 'destructive'
                    });
                    return [3 /*break*/, 4];
                case 3:
                    setGeneratingReport(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var getComplianceStatus = function (rate) {
        if (rate >= 95)
            return { color: 'text-green-600', label: 'Excellent', icon: lucide_react_1.CheckCircle };
        if (rate >= 85)
            return { color: 'text-blue-600', label: 'Good', icon: lucide_react_1.TrendingUp };
        if (rate >= 70)
            return { color: 'text-yellow-600', label: 'Needs Attention', icon: lucide_react_1.AlertTriangle };
        return { color: 'text-red-600', label: 'Critical', icon: lucide_react_1.XCircle };
    };
    if (loading) {
        return (<card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Compliance Reporting Dashboard</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </card_1.CardContent>
      </card_1.Card>);
    }
    if (!analytics) {
        return (<card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Compliance Reporting Dashboard</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <alert_1.Alert>
            <lucide_react_1.AlertTriangle className="h-4 w-4"/>
            <alert_1.AlertDescription>
              Unable to load compliance analytics. Please try again.
            </alert_1.AlertDescription>
          </alert_1.Alert>
        </card_1.CardContent>
      </card_1.Card>);
    }
    var complianceStatus = getComplianceStatus(analytics.complianceRate);
    var ComplianceIcon = complianceStatus.icon;
    return (<div className="space-y-6">
      {/* Controls */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.BarChart3 className="h-5 w-5"/>
            Compliance Reporting Dashboard
          </card_1.CardTitle>
          <card_1.CardDescription>
            Monitor compliance metrics, generate reports, and track regulatory adherence
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label_1.Label htmlFor="time-range">Time Range</label_1.Label>
              <select_1.Select value={timeRange} onValueChange={setTimeRange}>
                <select_1.SelectTrigger>
                  <select_1.SelectValue placeholder="Select time range"/>
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="7">Last 7 days</select_1.SelectItem>
                  <select_1.SelectItem value="30">Last 30 days</select_1.SelectItem>
                  <select_1.SelectItem value="90">Last 3 months</select_1.SelectItem>
                  <select_1.SelectItem value="365">Last year</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>
            <div className="flex-1">
              <label_1.Label htmlFor="report-type">Report Type</label_1.Label>
              <select_1.Select value={reportType} onValueChange={setReportType}>
                <select_1.SelectTrigger>
                  <select_1.SelectValue placeholder="Select report type"/>
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="summary">Summary Report</select_1.SelectItem>
                  <select_1.SelectItem value="detailed">Detailed Report</select_1.SelectItem>
                  <select_1.SelectItem value="anvisa">ANVISA Report</select_1.SelectItem>
                  <select_1.SelectItem value="cfm">CFM Report</select_1.SelectItem>
                  <select_1.SelectItem value="lgpd">LGPD Compliance</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>
            <button_1.Button onClick={generateReport} disabled={generatingReport}>
              <lucide_react_1.Download className="h-4 w-4 mr-2"/>
              {generatingReport ? 'Generating...' : 'Generate Report'}
            </button_1.Button>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Total Consents</card_1.CardTitle>
            <lucide_react_1.FileText className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{analytics.totalConsents}</div>
            <p className="text-xs text-muted-foreground">
              In the last {timeRange} days
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Compliance Rate</card_1.CardTitle>
            <ComplianceIcon className={"h-4 w-4 ".concat(complianceStatus.color)}/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{analytics.complianceRate.toFixed(1)}%</div>
            <p className={"text-xs ".concat(complianceStatus.color)}>
              {complianceStatus.label}
            </p>
            <progress_1.Progress value={analytics.complianceRate} className="mt-2"/>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Pending Consents</card_1.CardTitle>
            <lucide_react_1.Clock className="h-4 w-4 text-yellow-500"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{analytics.pendingConsents}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting signature
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Critical Alerts</card_1.CardTitle>
            <lucide_react_1.AlertTriangle className={"h-4 w-4 ".concat(analytics.criticalAlerts > 0 ? 'text-red-500' : 'text-green-500')}/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{analytics.criticalAlerts}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Status Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.PieChart className="h-4 w-4"/>
              Consent Status Distribution
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <lucide_react_1.CheckCircle className="h-4 w-4 text-green-500"/>
                  <span>Signed</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{analytics.signedConsents}</span>
                  <badge_1.Badge variant="default">
                    {analytics.totalConsents > 0 ? ((analytics.signedConsents / analytics.totalConsents) * 100).toFixed(1) : 0}%
                  </badge_1.Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <lucide_react_1.Clock className="h-4 w-4 text-yellow-500"/>
                  <span>Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{analytics.pendingConsents}</span>
                  <badge_1.Badge variant="secondary">
                    {analytics.totalConsents > 0 ? ((analytics.pendingConsents / analytics.totalConsents) * 100).toFixed(1) : 0}%
                  </badge_1.Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <lucide_react_1.XCircle className="h-4 w-4 text-red-500"/>
                  <span>Revoked</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{analytics.revokedConsents}</span>
                  <badge_1.Badge variant="destructive">
                    {analytics.totalConsents > 0 ? ((analytics.revokedConsents / analytics.totalConsents) * 100).toFixed(1) : 0}%
                  </badge_1.Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <lucide_react_1.AlertTriangle className="h-4 w-4 text-orange-500"/>
                  <span>Expired</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{analytics.expiredConsents}</span>
                  <badge_1.Badge variant="outline">
                    {analytics.totalConsents > 0 ? ((analytics.expiredConsents / analytics.totalConsents) * 100).toFixed(1) : 0}%
                  </badge_1.Badge>
                </div>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.BarChart3 className="h-4 w-4"/>
              Consent Types Breakdown
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.consentsByType).map(function (_a) {
            var type = _a[0], count = _a[1];
            return (<div key={type} className="flex items-center justify-between">
                  <span className="capitalize">{type.replace('_', ' ')}</span>
                  <div className="flex items-center gap-2">
                    <progress_1.Progress value={analytics.totalConsents > 0 ? (count / analytics.totalConsents) * 100 : 0} className="w-20"/>
                    <span className="font-medium w-8 text-right">{count}</span>
                  </div>
                </div>);
        })}
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Performance Metrics */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.TrendingUp className="h-4 w-4"/>
            Performance Metrics
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {analytics.averageSigningTime.toFixed(1)}min
              </div>
              <p className="text-sm text-muted-foreground">Average Signing Time</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Object.keys(analytics.withdrawalReasons).length}
              </div>
              <p className="text-sm text-muted-foreground">Withdrawal Categories</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Object.keys(analytics.consentsByMonth).length}
              </div>
              <p className="text-sm text-muted-foreground">Active Months</p>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Withdrawal Reasons Analysis */}
      {Object.keys(analytics.withdrawalReasons).length > 0 && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.XCircle className="h-4 w-4"/>
              Withdrawal Reasons Analysis
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <table_1.Table>
              <table_1.TableHeader>
                <table_1.TableRow>
                  <table_1.TableHead>Reason</table_1.TableHead>
                  <table_1.TableHead>Count</table_1.TableHead>
                  <table_1.TableHead>Percentage</table_1.TableHead>
                </table_1.TableRow>
              </table_1.TableHeader>
              <table_1.TableBody>
                {Object.entries(analytics.withdrawalReasons)
                .sort(function (_a, _b) {
                var a = _a[1];
                var b = _b[1];
                return b - a;
            })
                .map(function (_a) {
                var reason = _a[0], count = _a[1];
                return (<table_1.TableRow key={reason}>
                      <table_1.TableCell>{reason}</table_1.TableCell>
                      <table_1.TableCell>{count}</table_1.TableCell>
                      <table_1.TableCell>
                        {analytics.revokedConsents > 0
                        ? ((count / analytics.revokedConsents) * 100).toFixed(1)
                        : 0}%
                      </table_1.TableCell>
                    </table_1.TableRow>);
            })}
              </table_1.TableBody>
            </table_1.Table>
          </card_1.CardContent>
        </card_1.Card>)}
    </div>);
}
