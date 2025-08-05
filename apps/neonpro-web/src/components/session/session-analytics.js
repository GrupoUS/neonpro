"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var alert_1 = require("@/components/ui/alert");
var select_1 = require("@/components/ui/select");
var use_session_1 = require("@/hooks/use-session");
var recharts_1 = require("recharts");
var lucide_react_1 = require("lucide-react");
var SessionAnalyticsComponent = function (_a) {
  var _b, _c, _d;
  var userId = _a.userId,
    _e = _a.className,
    className = _e === void 0 ? "" : _e;
  var _f = (0, react_1.useState)("7d"),
    timeframe = _f[0],
    setTimeframe = _f[1];
  var _g = (0, react_1.useState)(0),
    refreshKey = _g[0],
    setRefreshKey = _g[1];
  var _h = (0, use_session_1.useSessionAnalytics)(userId, timeframe),
    analytics = _h.analytics,
    loading = _h.loading,
    error = _h.error,
    refreshAnalytics = _h.refreshAnalytics;
  var handleRefresh = function () {
    setRefreshKey(function (prev) {
      return prev + 1;
    });
    refreshAnalytics();
  };
  var getTimeframeLabel = function (tf) {
    switch (tf) {
      case "24h":
        return "Last 24 Hours";
      case "7d":
        return "Last 7 Days";
      case "30d":
        return "Last 30 Days";
      case "90d":
        return "Last 90 Days";
      default:
        return "Last 7 Days";
    }
  };
  var formatDuration = function (minutes) {
    var hours = Math.floor(minutes / 60);
    var mins = minutes % 60;
    if (hours > 0) {
      return "".concat(hours, "h ").concat(mins, "m");
    }
    return "".concat(mins, "m");
  };
  var getHealthScoreColor = function (score) {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };
  var getHealthScoreBadge = function (score) {
    if (score >= 80)
      return { variant: "default", label: "Excellent", color: "bg-green-100 text-green-800" };
    if (score >= 60)
      return { variant: "secondary", label: "Good", color: "bg-yellow-100 text-yellow-800" };
    return { variant: "destructive", label: "Poor", color: "bg-red-100 text-red-800" };
  };
  // Chart colors
  var COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];
  if (loading) {
    return (
      <div className={"space-y-6 ".concat(className)}>
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.BarChart3 className="h-5 w-5" />
              Session Analytics
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="animate-pulse space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(function (i) {
                  return <div key={i} className="h-24 bg-muted rounded" />;
                })}
              </div>
              <div className="h-64 bg-muted rounded" />
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>
    );
  }
  if (error) {
    return (
      <card_1.Card className={className}>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.BarChart3 className="h-5 w-5" />
            Session Analytics
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <alert_1.Alert variant="destructive">
            <lucide_react_1.AlertTriangle className="h-4 w-4" />
            <alert_1.AlertDescription>Failed to load analytics: {error}</alert_1.AlertDescription>
          </alert_1.Alert>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  if (!analytics) {
    return (
      <card_1.Card className={className}>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.BarChart3 className="h-5 w-5" />
            Session Analytics
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <lucide_react_1.BarChart3 className="h-12 w-12 mx-auto mb-4" />
            <p>No analytics data available</p>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  var deviceData = analytics.deviceBreakdown
    ? Object.entries(analytics.deviceBreakdown).map(function (_a) {
        var type = _a[0],
          count = _a[1];
        return {
          name: type,
          value: count,
        };
      })
    : [];
  var securityData = analytics.securityEvents
    ? Object.entries(analytics.securityEvents).map(function (_a) {
        var type = _a[0],
          count = _a[1];
        return {
          name: type.replace("_", " "),
          value: count,
        };
      })
    : [];
  var healthBadge = getHealthScoreBadge(analytics.healthScore || 0);
  return (
    <div className={"space-y-6 ".concat(className)}>
      {/* Header with Controls */}
      <card_1.Card>
        <card_1.CardHeader>
          <div className="flex items-center justify-between">
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.BarChart3 className="h-5 w-5" />
              Session Analytics
            </card_1.CardTitle>
            <div className="flex items-center gap-3">
              <select_1.Select
                value={timeframe}
                onValueChange={function (value) {
                  return setTimeframe(value);
                }}
              >
                <select_1.SelectTrigger className="w-40">
                  <select_1.SelectValue />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="24h">Last 24 Hours</select_1.SelectItem>
                  <select_1.SelectItem value="7d">Last 7 Days</select_1.SelectItem>
                  <select_1.SelectItem value="30d">Last 30 Days</select_1.SelectItem>
                  <select_1.SelectItem value="90d">Last 90 Days</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
              <button_1.Button variant="outline" size="sm" onClick={handleRefresh}>
                <lucide_react_1.RefreshCw className="h-4 w-4" />
              </button_1.Button>
            </div>
          </div>
        </card_1.CardHeader>
      </card_1.Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <card_1.Card>
          <card_1.CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                <p className="text-2xl font-bold">{analytics.totalSessions}</p>
              </div>
              <lucide_react_1.Activity className="h-8 w-8 text-blue-600" />
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
                <p className="text-2xl font-bold">{analytics.activeSessions}</p>
              </div>
              <lucide_react_1.Users className="h-8 w-8 text-green-600" />
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Duration</p>
                <p className="text-2xl font-bold">
                  {formatDuration(analytics.averageDuration || 0)}
                </p>
              </div>
              <lucide_react_1.Clock className="h-8 w-8 text-purple-600" />
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Health Score</p>
                <div className="flex items-center gap-2">
                  <p
                    className={"text-2xl font-bold ".concat(
                      getHealthScoreColor(analytics.healthScore || 0),
                    )}
                  >
                    {analytics.healthScore || 0}%
                  </p>
                  <badge_1.Badge className={healthBadge.color} variant="secondary">
                    {healthBadge.label}
                  </badge_1.Badge>
                </div>
              </div>
              <lucide_react_1.Shield className="h-8 w-8 text-orange-600" />
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Breakdown */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.PieChart className="h-5 w-5" />
              Device Breakdown
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            {deviceData.length > 0
              ? <recharts_1.ResponsiveContainer width="100%" height={300}>
                  <recharts_1.PieChart>
                    <recharts_1.Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={function (_a) {
                        var name = _a.name,
                          percent = _a.percent;
                        return "".concat(name, " ").concat((percent * 100).toFixed(0), "%");
                      }}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {deviceData.map(function (entry, index) {
                        return (
                          <recharts_1.Cell
                            key={"cell-".concat(index)}
                            fill={COLORS[index % COLORS.length]}
                          />
                        );
                      })}
                    </recharts_1.Pie>
                    <recharts_1.Tooltip />
                  </recharts_1.PieChart>
                </recharts_1.ResponsiveContainer>
              : <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No device data available
                </div>}
          </card_1.CardContent>
        </card_1.Card>

        {/* Security Events */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Shield className="h-5 w-5" />
              Security Events
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            {securityData.length > 0
              ? <recharts_1.ResponsiveContainer width="100%" height={300}>
                  <recharts_1.BarChart data={securityData}>
                    <recharts_1.CartesianGrid strokeDasharray="3 3" />
                    <recharts_1.XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <recharts_1.YAxis />
                    <recharts_1.Tooltip />
                    <recharts_1.Bar dataKey="value" fill="#8884d8" />
                  </recharts_1.BarChart>
                </recharts_1.ResponsiveContainer>
              : <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No security events
                </div>}
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="text-lg">Security Summary</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Failed Logins</span>
                <badge_1.Badge variant="destructive">
                  {((_b = analytics.securityEvents) === null || _b === void 0
                    ? void 0
                    : _b.FAILED_LOGIN) || 0}
                </badge_1.Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Suspicious Activity</span>
                <badge_1.Badge variant="secondary">
                  {((_c = analytics.securityEvents) === null || _c === void 0
                    ? void 0
                    : _c.SUSPICIOUS_ACTIVITY) || 0}
                </badge_1.Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">IP Changes</span>
                <badge_1.Badge variant="outline">
                  {((_d = analytics.securityEvents) === null || _d === void 0
                    ? void 0
                    : _d.IP_CHANGE) || 0}
                </badge_1.Badge>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="text-lg">Session Quality</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Expired Sessions</span>
                <span className="font-medium">{analytics.expiredSessions || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Force Terminated</span>
                <span className="font-medium">{analytics.terminatedSessions || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Success Rate</span>
                <span className="font-medium text-green-600">
                  {analytics.successRate ? "".concat(analytics.successRate.toFixed(1), "%") : "N/A"}
                </span>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="text-lg">Performance</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Peak Concurrent</span>
                <span className="font-medium">{analytics.peakConcurrentSessions || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Unique Devices</span>
                <span className="font-medium">{analytics.uniqueDevices || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Data Period</span>
                <span className="font-medium">{getTimeframeLabel(timeframe)}</span>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>
    </div>
  );
};
exports.default = SessionAnalyticsComponent;
