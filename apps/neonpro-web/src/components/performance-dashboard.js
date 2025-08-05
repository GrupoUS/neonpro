'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceDashboard = PerformanceDashboard;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var progress_1 = require("@/components/ui/progress");
var tabs_1 = require("@/components/ui/tabs");
var lucide_react_1 = require("lucide-react");
var performance_monitor_1 = require("@/utils/performance-monitor");
var utils_1 = require("@/lib/utils");
// =====================================================================================
// PERFORMANCE DASHBOARD
// Real-time performance monitoring and visualization
// =====================================================================================
function PerformanceDashboard() {
    var _a = (0, performance_monitor_1.usePerformanceMonitor)(), report = _a.report, isMonitoring = _a.isMonitoring, startMonitoring = _a.startMonitoring, stopMonitoring = _a.stopMonitoring;
    var _b = (0, react_1.useState)('overview'), selectedTab = _b[0], setSelectedTab = _b[1];
    var handleToggleMonitoring = function () {
        if (isMonitoring) {
            stopMonitoring();
        }
        else {
            startMonitoring();
        }
    };
    var getGradeColor = function (grade) {
        switch (grade) {
            case 'A': return 'text-green-600 bg-green-100';
            case 'B': return 'text-blue-600 bg-blue-100';
            case 'C': return 'text-yellow-600 bg-yellow-100';
            case 'D': return 'text-orange-600 bg-orange-100';
            case 'F': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };
    var getScoreColor = function (score) {
        if (score >= 90)
            return 'text-green-600';
        if (score >= 80)
            return 'text-blue-600';
        if (score >= 70)
            return 'text-yellow-600';
        if (score >= 60)
            return 'text-orange-600';
        return 'text-red-600';
    };
    return (<div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance Monitor</h1>
          <p className="text-muted-foreground">
            Monitor real-time performance metrics and get optimization suggestions
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={(0, utils_1.cn)('h-2 w-2 rounded-full', isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400')}/>
            <span className="text-sm text-muted-foreground">
              {isMonitoring ? 'Monitoring' : 'Stopped'}
            </span>
          </div>
          
          <button_1.Button onClick={handleToggleMonitoring} variant={isMonitoring ? 'destructive' : 'default'} size="sm">
            {isMonitoring ? (<>
                <lucide_react_1.Square className="h-4 w-4 mr-2"/>
                Stop
              </>) : (<>
                <lucide_react_1.Play className="h-4 w-4 mr-2"/>
                Start
              </>)}
          </button_1.Button>
        </div>
      </div>

      {/* Overall Score */}
      {report && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.TrendingUp className="h-5 w-5"/>
              Overall Performance
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className={(0, utils_1.cn)('text-4xl font-bold', getScoreColor(report.overall.score))}>
                    {report.overall.score}
                  </div>
                  <div className="text-sm text-muted-foreground">Score</div>
                </div>
                
                <badge_1.Badge className={(0, utils_1.cn)('text-lg px-3 py-1', getGradeColor(report.overall.grade))}>
                  Grade {report.overall.grade}
                </badge_1.Badge>
              </div>
              
              <div className="flex-1 max-w-md">
                <progress_1.Progress value={report.overall.score} className="h-3"/>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>)}

      {/* Alerts */}
      {report && report.alerts.length > 0 && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.AlertTriangle className="h-5 w-5 text-yellow-500"/>
              Performance Alerts
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="space-y-3">
              {report.alerts.map(function (alert) { return (<div key={alert.id} className={(0, utils_1.cn)('p-3 rounded-lg border', alert.type === 'critical'
                    ? 'border-red-200 bg-red-50'
                    : 'border-yellow-200 bg-yellow-50')}>
                  <div className="flex items-start gap-3">
                    <lucide_react_1.AlertTriangle className={(0, utils_1.cn)('h-5 w-5 mt-0.5', alert.type === 'critical' ? 'text-red-500' : 'text-yellow-500')}/>
                    <div className="flex-1">
                      <div className="font-medium">{alert.message}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {alert.suggestion}
                      </div>
                    </div>
                    <badge_1.Badge variant={alert.type === 'critical' ? 'destructive' : 'secondary'}>
                      {alert.type}
                    </badge_1.Badge>
                  </div>
                </div>); })}
            </div>
          </card_1.CardContent>
        </card_1.Card>)}

      {/* Detailed Metrics */}
      <tabs_1.Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <tabs_1.TabsList className="grid w-full grid-cols-4">
          <tabs_1.TabsTrigger value="overview">Overview</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="components">Components</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="metrics">Metrics</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="recommendations">Tips</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard title="Memory Usage" value={getLatestMetric(report === null || report === void 0 ? void 0 : report.metrics, 'heap-used')} unit="MB" icon={<lucide_react_1.HardDrive className="h-4 w-4"/>} threshold={100}/>
            
            <MetricCard title="FPS" value={getLatestMetric(report === null || report === void 0 ? void 0 : report.metrics, 'fps')} unit="fps" icon={<lucide_react_1.Monitor className="h-4 w-4"/>} threshold={30} reverse/>
            
            <MetricCard title="DOM Nodes" value={getLatestMetric(report === null || report === void 0 ? void 0 : report.metrics, 'node-count')} unit="nodes" icon={<lucide_react_1.Activity className="h-4 w-4"/>} threshold={1500}/>
            
            <MetricCard title="Event Listeners" value={getLatestMetric(report === null || report === void 0 ? void 0 : report.metrics, 'listener-count')} unit="listeners" icon={<lucide_react_1.Zap className="h-4 w-4"/>} threshold={100}/>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="components" className="space-y-4">
          {report && report.components.length > 0 ? (<div className="grid gap-4">
              {report.components.map(function (component) { return (<card_1.Card key={component.componentName}>
                  <card_1.CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{component.componentName}</h3>
                        <div className="text-sm text-muted-foreground">
                          Renders: {component.renderCount} | 
                          Avg: {component.averageRenderTime.toFixed(2)}ms
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={(0, utils_1.cn)('text-lg font-semibold', component.averageRenderTime > 16
                    ? component.averageRenderTime > 50
                        ? 'text-red-600'
                        : 'text-yellow-600'
                    : 'text-green-600')}>
                          {component.averageRenderTime.toFixed(2)}ms
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Last: {new Date(component.lastRender).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    
                    <progress_1.Progress value={Math.min(100, (component.averageRenderTime / 50) * 100)} className="mt-2 h-2"/>
                  </card_1.CardContent>
                </card_1.Card>); })}
            </div>) : (<card_1.Card>
              <card_1.CardContent className="p-8 text-center">
                <lucide_react_1.Cpu className="h-12 w-12 mx-auto text-muted-foreground mb-4"/>
                <h3 className="text-lg font-medium mb-2">No Component Data</h3>
                <p className="text-muted-foreground">
                  Start monitoring to see component performance metrics
                </p>
              </card_1.CardContent>
            </card_1.Card>)}
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="metrics" className="space-y-4">
          {report && report.metrics.length > 0 ? (<div className="space-y-4">
              {report.metrics.slice(0, 20).map(function (metric, index) { return (<card_1.Card key={"".concat(metric.name, "-").concat(index)}>
                  <card_1.CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{metric.name}</h3>
                        <div className="text-sm text-muted-foreground">
                          {new Date(metric.timestamp).toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={(0, utils_1.cn)('text-lg font-semibold', metric.threshold && metric.value > metric.threshold
                    ? 'text-red-600'
                    : 'text-green-600')}>
                          {metric.value.toFixed(2)}{metric.unit}
                        </div>
                        {metric.threshold && (<div className="text-xs text-muted-foreground">
                            Threshold: {metric.threshold}{metric.unit}
                          </div>)}
                      </div>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>); })}
            </div>) : (<card_1.Card>
              <card_1.CardContent className="p-8 text-center">
                <lucide_react_1.Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4"/>
                <h3 className="text-lg font-medium mb-2">No Metrics Data</h3>
                <p className="text-muted-foreground">
                  Start monitoring to see performance metrics
                </p>
              </card_1.CardContent>
            </card_1.Card>)}
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="recommendations" className="space-y-4">
          {report && report.recommendations.length > 0 ? (<div className="space-y-4">
              {report.recommendations.map(function (recommendation, index) { return (<card_1.Card key={index}>
                  <card_1.CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <lucide_react_1.CheckCircle className="h-5 w-5 text-green-500 mt-0.5"/>
                      <div>
                        <p className="font-medium">{recommendation}</p>
                      </div>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>); })}
            </div>) : (<card_1.Card>
              <card_1.CardContent className="p-8 text-center">
                <lucide_react_1.CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4"/>
                <h3 className="text-lg font-medium mb-2">No Recommendations</h3>
                <p className="text-muted-foreground">
                  Your application is performing well! Keep monitoring for insights.
                </p>
              </card_1.CardContent>
            </card_1.Card>)}
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>);
}
function MetricCard(_a) {
    var title = _a.title, value = _a.value, unit = _a.unit, icon = _a.icon, threshold = _a.threshold, _b = _a.reverse, reverse = _b === void 0 ? false : _b;
    var getStatusColor = function () {
        if (value === null || threshold === undefined)
            return 'text-gray-600';
        if (reverse) {
            return value >= threshold ? 'text-green-600' : 'text-red-600';
        }
        else {
            return value <= threshold ? 'text-green-600' : 'text-red-600';
        }
    };
    var getProgressValue = function () {
        if (value === null || threshold === undefined)
            return 0;
        if (reverse) {
            return Math.min(100, (value / threshold) * 100);
        }
        else {
            return Math.min(100, (value / threshold) * 100);
        }
    };
    return (<card_1.Card>
      <card_1.CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm font-medium">{title}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className={(0, utils_1.cn)('text-2xl font-bold', getStatusColor())}>
            {value !== null ? "".concat(value.toFixed(1)).concat(unit) : 'N/A'}
          </div>
          
          {threshold && value !== null && (<>
              <progress_1.Progress value={getProgressValue()} className="h-2"/>
              <div className="text-xs text-muted-foreground">
                Threshold: {threshold}{unit}
              </div>
            </>)}
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
// =====================================================================================
// UTILITY FUNCTIONS
// =====================================================================================
function getLatestMetric(metrics, name) {
    if (!metrics)
        return null;
    var filtered = metrics.filter(function (m) { return m.name === name; });
    if (filtered.length === 0)
        return null;
    return filtered[filtered.length - 1].value;
}
exports.default = PerformanceDashboard;
