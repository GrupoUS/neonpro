/**
 * TASK-001: Foundation Setup & Baseline
 * System Health Widget Component
 *
 * Real-time system health monitoring widget with uptime tracking,
 * error rates, and resource monitoring for all epic functionality.
 */
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
exports.SystemHealthWidget = SystemHealthWidget;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var progress_1 = require("@/components/ui/progress");
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
function SystemHealthWidget() {
    var _this = this;
    var _a = (0, react_1.useState)(null), healthData = _a[0], setHealthData = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(new Date()), lastRefresh = _c[0], setLastRefresh = _c[1];
    (0, react_1.useEffect)(function () {
        loadHealthData();
        // Auto-refresh every 30 seconds
        var interval = setInterval(loadHealthData, 30000);
        return function () { return clearInterval(interval); };
    }, []);
    var loadHealthData = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, 6, 7]);
                    return [4 /*yield*/, fetch('/api/monitoring/health')];
                case 1:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    setHealthData(data.health);
                    setLastRefresh(new Date());
                    return [3 /*break*/, 4];
                case 3: throw new Error('Failed to fetch health data');
                case 4: return [3 /*break*/, 7];
                case 5:
                    error_1 = _a.sent();
                    console.error('Error loading health data:', error_1);
                    sonner_1.toast.error('Failed to load system health data');
                    return [3 /*break*/, 7];
                case 6:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var refreshHealth = function () {
        setLoading(true);
        loadHealthData();
    };
    var getStatusIcon = function (status) {
        switch (status) {
            case 'healthy':
                return <lucide_react_1.CheckCircle className="h-4 w-4 text-green-500"/>;
            case 'degraded':
                return <lucide_react_1.AlertTriangle className="h-4 w-4 text-yellow-500"/>;
            case 'unhealthy':
                return <lucide_react_1.XCircle className="h-4 w-4 text-red-500"/>;
            default:
                return <lucide_react_1.AlertTriangle className="h-4 w-4 text-gray-500"/>;
        }
    };
    var getStatusBadge = function (status) {
        var variants = {
            healthy: { variant: "default", text: "Healthy", color: "text-green-500" },
            degraded: { variant: "secondary", text: "Degraded", color: "text-yellow-500" },
            unhealthy: { variant: "destructive", text: "Unhealthy", color: "text-red-500" },
        };
        var config = variants[status] || variants.unhealthy;
        return (<badge_1.Badge variant={config.variant} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {config.text}
      </badge_1.Badge>);
    };
    if (loading && !healthData) {
        return (<card_1.Card>
        <card_1.CardContent className="p-6">
          <div className="flex items-center justify-center">
            <lucide_react_1.RefreshCw className="h-4 w-4 animate-spin mr-2"/>
            Loading system health...
          </div>
        </card_1.CardContent>
      </card_1.Card>);
    }
    if (!healthData) {
        return (<card_1.Card>
        <card_1.CardContent className="p-6">
          <div className="text-center">
            <lucide_react_1.XCircle className="h-8 w-8 mx-auto text-red-500 mb-2"/>
            <p className="text-sm text-muted-foreground">Unable to load health data</p>
            <button_1.Button size="sm" onClick={refreshHealth} className="mt-2">
              Retry
            </button_1.Button>
          </div>
        </card_1.CardContent>
      </card_1.Card>);
    }
    return (<card_1.Card>
      <card_1.CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <card_1.CardTitle className="text-lg flex items-center">
              <lucide_react_1.Activity className="h-5 w-5 mr-2"/>
              System Health
            </card_1.CardTitle>
            <card_1.CardDescription>
              Real-time monitoring • Last updated: {lastRefresh.toLocaleTimeString()}
            </card_1.CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(healthData.overall_status)}
            <button_1.Button size="sm" variant="outline" onClick={refreshHealth} disabled={loading}>
              <lucide_react_1.RefreshCw className={"h-4 w-4 ".concat(loading ? 'animate-spin' : '')}/>
            </button_1.Button>
          </div>
        </div>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {healthData.uptime_percentage.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {healthData.response_time_avg}ms
            </div>
            <div className="text-xs text-muted-foreground">Avg Response</div>
          </div>
          <div className="text-center">
            <div className={"text-2xl font-bold ".concat(healthData.error_rate > 1 ? 'text-red-600' : 'text-green-600')}>
              {healthData.error_rate.toFixed(2)}%
            </div>
            <div className="text-xs text-muted-foreground">Error Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {Math.round((healthData.resource_usage.cpu_percentage +
            healthData.resource_usage.memory_percentage +
            healthData.resource_usage.storage_percentage) / 3)}%
            </div>
            <div className="text-xs text-muted-foreground">Resources</div>
          </div>
        </div>

        {/* Component Status */}
        <div>
          <h4 className="text-sm font-medium mb-3">Component Status</h4>
          <div className="space-y-3">
            {Object.entries(healthData.components).map(function (_a) {
            var name = _a[0], component = _a[1];
            return (<div key={name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {name === 'database' && <lucide_react_1.Database className="h-4 w-4"/>}
                  {name === 'api' && <lucide_react_1.Server className="h-4 w-4"/>}
                  {name === 'frontend' && <lucide_react_1.Wifi className="h-4 w-4"/>}
                  {name === 'authentication' && <lucide_react_1.Zap className="h-4 w-4"/>}
                  {name === 'monitoring' && <lucide_react_1.Activity className="h-4 w-4"/>}
                  <span className="text-sm capitalize">{name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {component.response_time}ms
                  </span>
                  {getStatusIcon(component.status)}
                </div>
              </div>);
        })}
          </div>
        </div>

        {/* Resource Usage */}
        <div>
          <h4 className="text-sm font-medium mb-3">Resource Usage</h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>CPU</span>
                <span>{healthData.resource_usage.cpu_percentage}%</span>
              </div>
              <progress_1.Progress value={healthData.resource_usage.cpu_percentage}/>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Memory</span>
                <span>{healthData.resource_usage.memory_percentage}%</span>
              </div>
              <progress_1.Progress value={healthData.resource_usage.memory_percentage}/>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Storage</span>
                <span>{healthData.resource_usage.storage_percentage}%</span>
              </div>
              <progress_1.Progress value={healthData.resource_usage.storage_percentage}/>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <button_1.Button size="sm" variant="outline" onClick={function () { return window.open('/dashboard/monitoring', '_blank'); }}>
            Full Dashboard
          </button_1.Button>
          <button_1.Button size="sm" variant="outline" onClick={function () { return window.open('/api/monitoring/logs', '_blank'); }}>
            View Logs
          </button_1.Button>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
