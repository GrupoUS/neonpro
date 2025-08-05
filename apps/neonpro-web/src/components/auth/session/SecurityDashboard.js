// =====================================================
// SecurityDashboard Component - Security Monitoring
// Story 1.4: Session Management & Security
// =====================================================
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
exports.SecurityDashboard = SecurityDashboard;
var react_1 = require("react");
var auth_1 = require("@/hooks/auth");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var progress_1 = require("@/components/ui/progress");
var tabs_1 = require("@/components/ui/tabs");
var alert_1 = require("@/components/ui/alert");
var separator_1 = require("@/components/ui/separator");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
// =====================================================
// MAIN COMPONENT
// =====================================================
function SecurityDashboard(_a) {
    var _this = this;
    var className = _a.className, _b = _a.showDetailedEvents, showDetailedEvents = _b === void 0 ? true : _b, _c = _a.maxEvents, maxEvents = _c === void 0 ? 10 : _c, _d = _a.autoRefresh, autoRefresh = _d === void 0 ? true : _d, _e = _a.refreshInterval, refreshInterval = _e === void 0 ? 30 : _e;
    var _f = (0, auth_1.useSecurityMonitoring)(), securityScore = _f.securityScore, securityStatus = _f.securityStatus, deviceRiskLevel = _f.deviceRiskLevel, isDeviceTrusted = _f.isDeviceTrusted, securityEvents = _f.securityEvents, refreshSecurityData = _f.refreshSecurityData;
    var _g = (0, react_1.useState)(false), isRefreshing = _g[0], setIsRefreshing = _g[1];
    var _h = (0, react_1.useState)('overview'), selectedTab = _h[0], setSelectedTab = _h[1];
    // Mock security metrics (in real implementation, this would come from the hook)
    var metrics = (0, react_1.useState)({
        totalEvents: (securityEvents === null || securityEvents === void 0 ? void 0 : securityEvents.length) || 0,
        criticalEvents: (securityEvents === null || securityEvents === void 0 ? void 0 : securityEvents.filter(function (e) { return e.severity === 'critical'; }).length) || 0,
        resolvedEvents: (securityEvents === null || securityEvents === void 0 ? void 0 : securityEvents.filter(function (e) { return e.resolved; }).length) || 0,
        activeThreats: (securityEvents === null || securityEvents === void 0 ? void 0 : securityEvents.filter(function (e) { return !e.resolved && e.severity === 'high'; }).length) || 0,
        securityScore: securityScore || 85,
        riskTrend: 'stable'
    })[0];
    // Auto-refresh logic
    (0, react_1.useEffect)(function () {
        if (!autoRefresh)
            return;
        var interval = setInterval(function () {
            refreshSecurityData();
        }, refreshInterval * 1000);
        return function () { return clearInterval(interval); };
    }, [autoRefresh, refreshInterval, refreshSecurityData]);
    // Manual refresh
    var handleRefresh = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsRefreshing(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    return [4 /*yield*/, refreshSecurityData()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    setIsRefreshing(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Get security status color
    var getSecurityColor = function (status) {
        switch (status) {
            case 'secure': return 'text-green-600';
            case 'moderate': return 'text-yellow-600';
            case 'warning': return 'text-orange-600';
            case 'critical': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };
    // Get security badge variant
    var getSecurityBadgeVariant = function (status) {
        switch (status) {
            case 'secure': return 'default';
            case 'moderate': return 'secondary';
            case 'warning': return 'outline';
            case 'critical': return 'destructive';
            default: return 'secondary';
        }
    };
    // Get severity color
    var getSeverityColor = function (severity) {
        switch (severity) {
            case 'low': return 'text-blue-600';
            case 'medium': return 'text-yellow-600';
            case 'high': return 'text-orange-600';
            case 'critical': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };
    // Get severity badge variant
    var getSeverityBadgeVariant = function (severity) {
        switch (severity) {
            case 'low': return 'outline';
            case 'medium': return 'secondary';
            case 'high': return 'outline';
            case 'critical': return 'destructive';
            default: return 'outline';
        }
    };
    // Get trend icon
    var getTrendIcon = function (trend) {
        switch (trend) {
            case 'up': return lucide_react_1.TrendingUp;
            case 'down': return lucide_react_1.TrendingDown;
            default: return lucide_react_1.Minus;
        }
    };
    // Get trend color
    var getTrendColor = function (trend) {
        switch (trend) {
            case 'up': return 'text-red-600';
            case 'down': return 'text-green-600';
            default: return 'text-gray-600';
        }
    };
    return (<div className={(0, utils_1.cn)('w-full space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <lucide_react_1.Shield className="h-6 w-6"/>
          <h2 className="text-2xl font-bold">Security Dashboard</h2>
        </div>
        <button_1.Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
          <lucide_react_1.RefreshCw className={(0, utils_1.cn)('h-4 w-4 mr-2', isRefreshing && 'animate-spin')}/>
          Refresh
        </button_1.Button>
      </div>

      {/* Security Status Alert */}
      {securityStatus !== 'secure' && (<alert_1.Alert variant={securityStatus === 'critical' ? 'destructive' : 'default'}>
          <lucide_react_1.AlertTriangle className="h-4 w-4"/>
          <alert_1.AlertTitle>Security Alert</alert_1.AlertTitle>
          <alert_1.AlertDescription>
            Your security status is currently <strong>{securityStatus}</strong>. 
            {securityStatus === 'critical' && 'Immediate attention required.'}
            {securityStatus === 'warning' && 'Please review security recommendations.'}
            {securityStatus === 'moderate' && 'Consider improving your security settings.'}
          </alert_1.AlertDescription>
        </alert_1.Alert>)}

      <tabs_1.Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <tabs_1.TabsList className="grid w-full grid-cols-3">
          <tabs_1.TabsTrigger value="overview">Overview</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="events">Security Events</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="metrics">Metrics</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        {/* Overview Tab */}
        <tabs_1.TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Security Score */}
            <card_1.Card>
              <card_1.CardHeader className="pb-2">
                <card_1.CardTitle className="text-sm font-medium flex items-center gap-2">
                  <lucide_react_1.ShieldCheck className="h-4 w-4"/>
                  Security Score
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{securityScore}%</div>
                  <progress_1.Progress value={securityScore} className="h-2"/>
                  <badge_1.Badge variant={getSecurityBadgeVariant(securityStatus)} className="text-xs">
                    {securityStatus.toUpperCase()}
                  </badge_1.Badge>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            {/* Active Threats */}
            <card_1.Card>
              <card_1.CardHeader className="pb-2">
                <card_1.CardTitle className="text-sm font-medium flex items-center gap-2">
                  <lucide_react_1.ShieldAlert className="h-4 w-4"/>
                  Active Threats
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-red-600">
                    {metrics.activeThreats}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {react_1.default.createElement(getTrendIcon(metrics.riskTrend), {
            className: (0, utils_1.cn)('h-3 w-3', getTrendColor(metrics.riskTrend))
        })}
                    <span>Risk trend</span>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            {/* Device Status */}
            <card_1.Card>
              <card_1.CardHeader className="pb-2">
                <card_1.CardTitle className="text-sm font-medium flex items-center gap-2">
                  <lucide_react_1.Smartphone className="h-4 w-4"/>
                  Device Status
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {isDeviceTrusted ? (<lucide_react_1.ShieldCheck className="h-4 w-4 text-green-600"/>) : (<lucide_react_1.ShieldAlert className="h-4 w-4 text-orange-600"/>)}
                    <span className="text-sm font-medium">
                      {isDeviceTrusted ? 'Trusted' : 'Untrusted'}
                    </span>
                  </div>
                  <badge_1.Badge variant={deviceRiskLevel === 'low' ? 'default' : 'destructive'} className="text-xs">
                    {deviceRiskLevel.toUpperCase()} RISK
                  </badge_1.Badge>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            {/* Total Events */}
            <card_1.Card>
              <card_1.CardHeader className="pb-2">
                <card_1.CardTitle className="text-sm font-medium flex items-center gap-2">
                  <lucide_react_1.Activity className="h-4 w-4"/>
                  Total Events
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{metrics.totalEvents}</div>
                  <div className="text-xs text-muted-foreground">
                    {metrics.resolvedEvents} resolved
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>

          {/* Recent Events Summary */}
          {securityEvents && securityEvents.length > 0 && (<card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="text-lg">Recent Security Events</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-3">
                  {securityEvents.slice(0, 3).map(function (event) { return (<div key={event.id} className="flex items-start gap-3 p-3 rounded-lg border">
                      <lucide_react_1.AlertTriangle className={(0, utils_1.cn)('h-4 w-4 mt-0.5', getSeverityColor(event.severity))}/>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{event.type}</span>
                          <badge_1.Badge variant={getSeverityBadgeVariant(event.severity)} className="text-xs">
                            {event.severity.toUpperCase()}
                          </badge_1.Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {event.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <lucide_react_1.Clock className="h-3 w-3"/>
                            <span>{new Date(event.timestamp).toLocaleString()}</span>
                          </div>
                          {event.location && (<div className="flex items-center gap-1">
                              <lucide_react_1.MapPin className="h-3 w-3"/>
                              <span>{event.location}</span>
                            </div>)}
                        </div>
                      </div>
                    </div>); })}
                </div>
              </card_1.CardContent>
            </card_1.Card>)}
        </tabs_1.TabsContent>

        {/* Security Events Tab */}
        <tabs_1.TabsContent value="events" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center justify-between">
                <span>Security Events</span>
                <badge_1.Badge variant="outline">
                  {(securityEvents === null || securityEvents === void 0 ? void 0 : securityEvents.length) || 0} events
                </badge_1.Badge>
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              {securityEvents && securityEvents.length > 0 ? (<div className="space-y-3">
                  {securityEvents.slice(0, maxEvents).map(function (event) { return (<div key={event.id} className={(0, utils_1.cn)('p-4 rounded-lg border transition-colors', event.resolved ? 'bg-muted/30' : 'bg-card')}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <lucide_react_1.AlertTriangle className={(0, utils_1.cn)('h-4 w-4 mt-0.5', getSeverityColor(event.severity))}/>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{event.type}</span>
                              {event.resolved && (<badge_1.Badge variant="outline" className="text-xs">
                                  Resolved
                                </badge_1.Badge>)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {event.description}
                            </p>
                            {showDetailedEvents && (<div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                                <div className="flex items-center gap-1">
                                  <lucide_react_1.Clock className="h-3 w-3"/>
                                  <span>{new Date(event.timestamp).toLocaleString()}</span>
                                </div>
                                {event.ipAddress && (<span>IP: {event.ipAddress}</span>)}
                                {event.location && (<div className="flex items-center gap-1">
                                    <lucide_react_1.MapPin className="h-3 w-3"/>
                                    <span>{event.location}</span>
                                  </div>)}
                                {event.deviceInfo && (<span>Device: {event.deviceInfo}</span>)}
                              </div>)}
                          </div>
                        </div>
                        <badge_1.Badge variant={getSeverityBadgeVariant(event.severity)} className="text-xs">
                          {event.severity.toUpperCase()}
                        </badge_1.Badge>
                      </div>
                    </div>); })}
                </div>) : (<div className="text-center py-8 text-muted-foreground">
                  <lucide_react_1.Eye className="h-12 w-12 mx-auto mb-4 opacity-50"/>
                  <p>No security events recorded</p>
                  <p className="text-sm">Your account security is being monitored</p>
                </div>)}
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Metrics Tab */}
        <tabs_1.TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Security Metrics</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Events</span>
                  <span className="text-sm">{metrics.totalEvents}</span>
                </div>
                <separator_1.Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Critical Events</span>
                  <span className="text-sm text-red-600">{metrics.criticalEvents}</span>
                </div>
                <separator_1.Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Resolved Events</span>
                  <span className="text-sm text-green-600">{metrics.resolvedEvents}</span>
                </div>
                <separator_1.Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Active Threats</span>
                  <span className="text-sm text-orange-600">{metrics.activeThreats}</span>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Security Score Breakdown</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Device Trust</span>
                    <span>{isDeviceTrusted ? '100%' : '60%'}</span>
                  </div>
                  <progress_1.Progress value={isDeviceTrusted ? 100 : 60} className="h-2"/>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Session Security</span>
                    <span>85%</span>
                  </div>
                  <progress_1.Progress value={85} className="h-2"/>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Activity Patterns</span>
                    <span>90%</span>
                  </div>
                  <progress_1.Progress value={90} className="h-2"/>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Risk Assessment</span>
                    <span>{deviceRiskLevel === 'low' ? '95%' : deviceRiskLevel === 'medium' ? '70%' : '40%'}</span>
                  </div>
                  <progress_1.Progress value={deviceRiskLevel === 'low' ? 95 : deviceRiskLevel === 'medium' ? 70 : 40} className="h-2"/>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>);
}
// =====================================================
// EXPORT DEFAULT
// =====================================================
exports.default = SecurityDashboard;
