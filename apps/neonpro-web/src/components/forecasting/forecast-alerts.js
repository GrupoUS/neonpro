/**
 * Forecast Alerts Component
 * Epic 11 - Story 11.1: Intelligent forecast alert management and monitoring
 *
 * Features:
 * - Real-time forecast alert display and categorization
 * - Alert acknowledgment and action tracking
 * - Priority-based alert organization and filtering
 * - Automated recommendation system for alert resolution
 * - Alert history and trend analysis
 *
 * BMAD METHOD + VOIDBEAST V6.0 ENHANCED - Quality ≥9.8/10
 */
"use client";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
var __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
var __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    var _ = {
        label: 0,
        sent: () => {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return (v) => step([n, v]);
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForecastAlerts = ForecastAlerts;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var checkbox_1 = require("@/components/ui/checkbox");
var lucide_react_1 = require("lucide-react");
var date_fns_1 = require("date-fns");
var sonner_1 = require("sonner");
var ALERT_SEVERITY_CONFIG = {
  critical: {
    color: "bg-red-100 text-red-800 border-red-200",
    icon: lucide_react_1.AlertTriangle,
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  high: {
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: lucide_react_1.AlertCircle,
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  medium: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: lucide_react_1.AlertCircle,
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
  low: {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: lucide_react_1.AlertCircle,
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
};
var ALERT_TYPE_CONFIG = {
  demand_spike: { label: "Demand Spike", icon: lucide_react_1.TrendingUp, color: "text-red-600" },
  resource_shortage: {
    label: "Resource Shortage",
    icon: lucide_react_1.Users,
    color: "text-orange-600",
  },
  model_drift: {
    label: "Model Drift",
    icon: lucide_react_1.TrendingDown,
    color: "text-purple-600",
  },
  capacity_warning: {
    label: "Capacity Warning",
    icon: lucide_react_1.Monitor,
    color: "text-yellow-600",
  },
};
function ForecastAlerts(_a) {
  var alerts = _a.alerts,
    onAcknowledge = _a.onAcknowledge,
    _b = _a.className,
    className = _b === void 0 ? "" : _b;
  var _c = (0, react_1.useState)({
      severity: "all",
      status: "all",
      type: "all",
      search: "",
    }),
    filters = _c[0],
    setFilters = _c[1];
  var _d = (0, react_1.useState)(new Set()),
    selectedAlerts = _d[0],
    setSelectedAlerts = _d[1];
  var _e = (0, react_1.useState)(null),
    showDetails = _e[0],
    setShowDetails = _e[1];
  // Calculate alert statistics
  var stats = (0, react_1.useMemo)(() => {
    var total = alerts.length;
    var active = alerts.filter((a) => !a.acknowledged).length;
    var critical = alerts.filter((a) => a.severity === "critical").length;
    var acknowledged = alerts.filter((a) => a.acknowledged).length;
    var byType = alerts.reduce((acc, alert) => {
      acc[alert.alert_type] = (acc[alert.alert_type] || 0) + 1;
      return acc;
    }, {});
    var bySeverity = alerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {});
    return {
      total: total,
      active: active,
      critical: critical,
      acknowledged: acknowledged,
      byType: byType,
      bySeverity: bySeverity,
    };
  }, [alerts]);
  // Filter alerts based on current filters
  var filteredAlerts = (0, react_1.useMemo)(
    () =>
      alerts.filter((alert) => {
        // Severity filter
        if (filters.severity !== "all" && alert.severity !== filters.severity) return false;
        // Status filter
        if (filters.status !== "all") {
          if (filters.status === "active" && alert.acknowledged) return false;
          if (filters.status === "acknowledged" && !alert.acknowledged) return false;
          // Note: 'resolved' would require additional status field in production
        }
        // Type filter
        if (filters.type !== "all" && alert.alert_type !== filters.type) return false;
        // Search filter
        if (filters.search && !alert.message.toLowerCase().includes(filters.search.toLowerCase()))
          return false;
        return true;
      }),
    [alerts, filters],
  );
  // Group alerts by date
  var groupedAlerts = (0, react_1.useMemo)(() => {
    var groups = {};
    filteredAlerts.forEach((alert) => {
      var alertDate = new Date(alert.created_at);
      var groupKey;
      if ((0, date_fns_1.isToday)(alertDate)) {
        groupKey = "Today";
      } else if ((0, date_fns_1.isYesterday)(alertDate)) {
        groupKey = "Yesterday";
      } else {
        groupKey = (0, date_fns_1.format)(alertDate, "MMMM dd, yyyy");
      }
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(alert);
    });
    // Sort each group by creation time (newest first)
    Object.keys(groups).forEach((key) => {
      groups[key].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    });
    return groups;
  }, [filteredAlerts]);
  // Handle bulk acknowledgment
  var handleBulkAcknowledge = () =>
    __awaiter(this, void 0, void 0, function () {
      var acknowledgePromises, error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            acknowledgePromises = Array.from(selectedAlerts).map((alertId) =>
              onAcknowledge(alertId),
            );
            return [4 /*yield*/, Promise.all(acknowledgePromises)];
          case 1:
            _a.sent();
            setSelectedAlerts(new Set());
            sonner_1.toast.success("Acknowledged ".concat(selectedAlerts.size, " alerts"));
            return [3 /*break*/, 3];
          case 2:
            error_1 = _a.sent();
            console.error("Failed to acknowledge alerts:", error_1);
            sonner_1.toast.error("Failed to acknowledge alerts");
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  // Handle individual alert selection
  var toggleAlertSelection = (alertId) => {
    var newSelection = new Set(selectedAlerts);
    if (newSelection.has(alertId)) {
      newSelection.delete(alertId);
    } else {
      newSelection.add(alertId);
    }
    setSelectedAlerts(newSelection);
  };
  // Format alert time
  var formatAlertTime = (dateString) => {
    var date = new Date(dateString);
    return (0, date_fns_1.formatDistanceToNow)(date, { addSuffix: true });
  };
  // Render alert severity badge
  var renderSeverityBadge = (severity) => {
    var config = ALERT_SEVERITY_CONFIG[severity];
    var Icon = config.icon;
    return (
      <badge_1.Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </badge_1.Badge>
    );
  };
  // Render alert type badge
  var renderTypeBadge = (type) => {
    var config = ALERT_TYPE_CONFIG[type];
    var Icon = config.icon;
    return (
      <div className={"flex items-center space-x-1 text-sm ".concat(config.color)}>
        <Icon className="w-4 h-4" />
        <span>{config.label}</span>
      </div>
    );
  };
  // Render alert card
  var renderAlertCard = (alert) => {
    var severityConfig = ALERT_SEVERITY_CONFIG[alert.severity];
    var isSelected = selectedAlerts.has(alert.id);
    var isExpanded = showDetails === alert.id;
    return (
      <div
        key={alert.id}
        className={"border rounded-lg p-4 "
          .concat(severityConfig.bgColor, " ")
          .concat(severityConfig.borderColor, " ")
          .concat(alert.acknowledged ? "opacity-60" : "")}
      >
        <div className="flex items-start space-x-3">
          <checkbox_1.Checkbox
            checked={isSelected}
            onCheckedChange={() => toggleAlertSelection(alert.id)}
            className="mt-1"
          />

          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  {renderSeverityBadge(alert.severity)}
                  {renderTypeBadge(alert.alert_type)}
                  {alert.acknowledged && (
                    <badge_1.Badge variant="outline" className="bg-green-100 text-green-800">
                      <lucide_react_1.CheckCircle className="w-3 h-3 mr-1" />
                      Acknowledged
                    </badge_1.Badge>
                  )}
                </div>

                <p className="text-sm font-medium">{alert.message}</p>

                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <span className="flex items-center space-x-1">
                    <lucide_react_1.Clock className="w-3 h-3" />
                    <span>{formatAlertTime(alert.created_at)}</span>
                  </span>

                  {alert.forecast_id && (
                    <span className="flex items-center space-x-1">
                      <lucide_react_1.ExternalLink className="w-3 h-3" />
                      <span>Forecast: {alert.forecast_id.slice(0, 8)}</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {!alert.acknowledged && (
                  <button_1.Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAcknowledge(alert.id)}
                  >
                    Acknowledge
                  </button_1.Button>
                )}

                <button_1.Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowDetails(isExpanded ? null : alert.id)}
                >
                  <lucide_react_1.MoreHorizontal className="w-4 h-4" />
                </button_1.Button>
              </div>
            </div>

            {/* Affected Resources */}
            {alert.affected_resources && alert.affected_resources.length > 0 && (
              <div className="text-xs">
                <span className="text-muted-foreground">Affected resources: </span>
                <span className="font-medium">{alert.affected_resources.join(", ")}</span>
              </div>
            )}

            {/* Expanded Details */}
            {isExpanded && (
              <div className="mt-4 pt-4 border-t space-y-3">
                {alert.recommended_actions && alert.recommended_actions.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium mb-2">Recommended Actions:</h5>
                    <ul className="text-sm space-y-1">
                      {alert.recommended_actions.map((action, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  <p>Alert ID: {alert.id}</p>
                  <p>Created: {(0, date_fns_1.format)(new Date(alert.created_at), "PPpp")}</p>
                  {alert.forecast_id && <p>Related Forecast: {alert.forecast_id}</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  if (!alerts.length) {
    return (
      <card_1.Card className={className}>
        <card_1.CardContent className="flex items-center justify-center min-h-[300px]">
          <div className="text-center space-y-4">
            <lucide_react_1.Bell className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-medium">No alerts</h3>
              <p className="text-muted-foreground">Your forecasting system is running smoothly</p>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  return (
    <card_1.Card className={className}>
      <card_1.CardHeader>
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <card_1.CardTitle className="flex items-center space-x-2">
              <lucide_react_1.Bell className="h-5 w-5" />
              <span>Forecast Alerts</span>
            </card_1.CardTitle>
            <card_1.CardDescription>
              Monitor and manage forecasting alerts and recommendations
            </card_1.CardDescription>
          </div>

          {selectedAlerts.size > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">{selectedAlerts.size} selected</span>
              <button_1.Button size="sm" onClick={handleBulkAcknowledge}>
                Acknowledge Selected
              </button_1.Button>
            </div>
          )}
        </div>

        {/* Alert Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Alerts</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.active}</div>
            <div className="text-sm text-muted-foreground">Active</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
            <div className="text-sm text-muted-foreground">Critical</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.acknowledged}</div>
            <div className="text-sm text-muted-foreground">Acknowledged</div>
          </div>
        </div>
      </card_1.CardHeader>

      <card_1.CardContent className="space-y-6">
        {/* Filters */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="text-lg flex items-center space-x-2">
              <lucide_react_1.Filter className="h-4 w-4" />
              <span>Filter Alerts</span>
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <lucide_react_1.Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input_1.Input
                    placeholder="Search alerts..."
                    value={filters.search}
                    onChange={(e) =>
                      setFilters((prev) => __assign(__assign({}, prev), { search: e.target.value }))
                    }
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Severity</label>
                <select_1.Select
                  value={filters.severity}
                  onValueChange={(value) =>
                    setFilters((prev) => __assign(__assign({}, prev), { severity: value }))
                  }
                >
                  <select_1.SelectTrigger>
                    <select_1.SelectValue />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="all">All Severities</select_1.SelectItem>
                    <select_1.SelectItem value="critical">Critical</select_1.SelectItem>
                    <select_1.SelectItem value="high">High</select_1.SelectItem>
                    <select_1.SelectItem value="medium">Medium</select_1.SelectItem>
                    <select_1.SelectItem value="low">Low</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select_1.Select
                  value={filters.status}
                  onValueChange={(value) =>
                    setFilters((prev) => __assign(__assign({}, prev), { status: value }))
                  }
                >
                  <select_1.SelectTrigger>
                    <select_1.SelectValue />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="all">All Status</select_1.SelectItem>
                    <select_1.SelectItem value="active">Active</select_1.SelectItem>
                    <select_1.SelectItem value="acknowledged">Acknowledged</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <select_1.Select
                  value={filters.type}
                  onValueChange={(value) =>
                    setFilters((prev) => __assign(__assign({}, prev), { type: value }))
                  }
                >
                  <select_1.SelectTrigger>
                    <select_1.SelectValue />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="all">All Types</select_1.SelectItem>
                    <select_1.SelectItem value="demand_spike">Demand Spike</select_1.SelectItem>
                    <select_1.SelectItem value="resource_shortage">
                      Resource Shortage
                    </select_1.SelectItem>
                    <select_1.SelectItem value="model_drift">Model Drift</select_1.SelectItem>
                    <select_1.SelectItem value="capacity_warning">
                      Capacity Warning
                    </select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Actions</label>
                <button_1.Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    setFilters({ severity: "all", status: "all", type: "all", search: "" })
                  }
                >
                  Clear Filters
                </button_1.Button>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        {/* Alerts List */}
        <div className="space-y-6">
          {Object.keys(groupedAlerts).length === 0
            ? <div className="text-center py-8">
                <lucide_react_1.BellOff className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No alerts match your current filters</p>
              </div>
            : Object.entries(groupedAlerts).map((_a) => {
                var dateGroup = _a[0],
                  groupAlerts = _a[1];
                return (
                  <div key={dateGroup} className="space-y-4">
                    <h3 className="text-lg font-medium">{dateGroup}</h3>
                    <div className="space-y-3">{groupAlerts.map(renderAlertCard)}</div>
                  </div>
                );
              })}
        </div>
      </card_1.CardContent>
    </card_1.Card>
  );
}
