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
exports.KPIDashboard = void 0;
// Financial KPI Dashboard Component
// Description: Real-time financial KPI dashboard with drill-down capabilities
// Author: Dev Agent
// Date: 2025-01-26
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var tabs_1 = require("@/components/ui/tabs");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var dialog_1 = require("@/components/ui/dialog");
var lucide_react_1 = require("lucide-react");
var KPICard = (_a) => {
  var kpi = _a.kpi,
    isEditing = _a.isEditing,
    onDrillDown = _a.onDrillDown,
    onEdit = _a.onEdit,
    onRemove = _a.onRemove;
  var formatValue = (value, category) => {
    if (category === "revenue" || category === "profitability") {
      if (kpi.kpi_name.includes("Margin") || kpi.kpi_name.includes("Rate")) {
        return "".concat(value.toFixed(1), "%");
      }
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value);
    }
    if (kpi.kpi_name.includes("Rate") || kpi.kpi_name.includes("Utilization")) {
      return "".concat(value.toFixed(1), "%");
    }
    return value.toLocaleString("pt-BR");
  };
  var getTrendIcon = (direction) => {
    switch (direction) {
      case "increasing":
        return <lucide_react_1.TrendingUp className="h-4 w-4 text-green-500" />;
      case "decreasing":
        return <lucide_react_1.TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4" />;
    }
  };
  var getTrendColor = (direction) => {
    switch (direction) {
      case "increasing":
        return "text-green-500";
      case "decreasing":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };
  var getVarianceDisplay = (variance) => {
    if (variance === undefined || variance === null) return null;
    var sign = variance >= 0 ? "+" : "";
    return "".concat(sign).concat(variance.toFixed(1), "%");
  };
  return (
    <card_1.Card className="relative hover:shadow-md transition-shadow">
      {isEditing && (
        <div className="absolute top-2 right-2 flex gap-1 z-10">
          <button_1.Button size="sm" variant="ghost" onClick={onEdit}>
            <lucide_react_1.Edit className="h-3 w-3" />
          </button_1.Button>
          <button_1.Button size="sm" variant="ghost" onClick={onRemove}>
            <lucide_react_1.Trash2 className="h-3 w-3" />
          </button_1.Button>
        </div>
      )}

      <card_1.CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <card_1.CardTitle className="text-sm font-medium text-gray-600">
            {kpi.kpi_name}
          </card_1.CardTitle>
          <badge_1.Badge variant="outline" className="text-xs">
            {kpi.kpi_category}
          </badge_1.Badge>
        </div>
      </card_1.CardHeader>

      <card_1.CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">
              {formatValue(kpi.current_value, kpi.kpi_category)}
            </div>
            {kpi.target_value && (
              <div className="text-sm text-gray-500">
                Target: {formatValue(kpi.target_value, kpi.kpi_category)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {getTrendIcon(kpi.trend_direction)}
            {kpi.variance_percent !== undefined && (
              <span className={"text-sm font-medium ".concat(getTrendColor(kpi.trend_direction))}>
                {getVarianceDisplay(kpi.variance_percent)}
              </span>
            )}
          </div>
        </div>

        {!isEditing && onDrillDown && (
          <div className="mt-3 flex gap-1">
            <button_1.Button
              size="sm"
              variant="outline"
              onClick={() => onDrillDown(kpi.id, "time")}
              className="text-xs"
            >
              <lucide_react_1.BarChart3 className="h-3 w-3 mr-1" />
              Trend
            </button_1.Button>
            <button_1.Button
              size="sm"
              variant="outline"
              onClick={() => onDrillDown(kpi.id, "service_type")}
              className="text-xs"
            >
              <lucide_react_1.PieChart className="h-3 w-3 mr-1" />
              Breakdown
            </button_1.Button>
          </div>
        )}

        <div className="mt-2 text-xs text-gray-400">
          Updated: {new Date(kpi.last_updated).toLocaleString("pt-BR")}
        </div>
      </card_1.CardContent>
    </card_1.Card>
  );
};
var AlertsPanel = (_a) => {
  var alerts = _a.alerts,
    onAcknowledge = _a.onAcknowledge,
    onViewDetails = _a.onViewDetails;
  var getAlertIcon = (type) => {
    switch (type) {
      case "critical":
        return <lucide_react_1.AlertTriangle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <lucide_react_1.AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <lucide_react_1.AlertTriangle className="h-4 w-4 text-blue-500" />;
    }
  };
  var getAlertColor = (type) => {
    switch (type) {
      case "critical":
        return "border-red-200 bg-red-50";
      case "warning":
        return "border-yellow-200 bg-yellow-50";
      default:
        return "border-blue-200 bg-blue-50";
    }
  };
  if (!alerts.length) {
    return (
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="text-sm">Alerts</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="text-center text-gray-500 py-4">
            <lucide_react_1.AlertTriangle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>No active alerts</p>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  return (
    <card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle className="text-sm flex items-center justify-between">
          Alerts
          <badge_1.Badge variant="destructive">{alerts.length}</badge_1.Badge>
        </card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-2">
        {alerts.slice(0, 5).map((alert) => (
          <div
            key={alert.id}
            className={"p-3 rounded-lg border ".concat(getAlertColor(alert.alert_type))}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {getAlertIcon(alert.alert_type)}
                <div>
                  <div className="text-sm font-medium">{alert.alert_message}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(alert.created_at).toLocaleString("pt-BR")}
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <button_1.Button size="sm" variant="ghost" onClick={() => onViewDetails(alert)}>
                  <lucide_react_1.Eye className="h-3 w-3" />
                </button_1.Button>
                {!alert.is_acknowledged && (
                  <button_1.Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAcknowledge(alert.id)}
                  >
                    Acknowledge
                  </button_1.Button>
                )}
              </div>
            </div>
          </div>
        ))}
        {alerts.length > 5 && (
          <button_1.Button variant="ghost" size="sm" className="w-full">
            View {alerts.length - 5} more alerts
          </button_1.Button>
        )}
      </card_1.CardContent>
    </card_1.Card>
  );
};
var DrillDownModal = (_a) => {
  var kpi = _a.kpi,
    dimension = _a.dimension,
    results = _a.results,
    isOpen = _a.isOpen,
    onClose = _a.onClose,
    onDrillDeeper = _a.onDrillDeeper;
  if (!kpi) return null;
  var formatValue = (value) => {
    if (kpi.kpi_category === "revenue" || kpi.kpi_category === "profitability") {
      if (kpi.kpi_name.includes("Margin") || kpi.kpi_name.includes("Rate")) {
        return "".concat(value.toFixed(1), "%");
      }
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value);
    }
    if (kpi.kpi_name.includes("Rate") || kpi.kpi_name.includes("Utilization")) {
      return "".concat(value.toFixed(1), "%");
    }
    return value.toLocaleString("pt-BR");
  };
  return (
    <dialog_1.Dialog open={isOpen} onOpenChange={onClose}>
      <dialog_1.DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle>
            {kpi.kpi_name} - {dimension.replace("_", " ").toUpperCase()} Analysis
          </dialog_1.DialogTitle>
          <dialog_1.DialogDescription>
            Detailed breakdown of {kpi.kpi_name} by {dimension.replace("_", " ")}
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>

        <div className="space-y-4">
          {results.length === 0
            ? <div className="text-center py-8 text-gray-500">
                No data available for this breakdown
              </div>
            : <div className="space-y-2">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{result.dimension_value}</div>
                      <div className="text-sm text-gray-500">
                        {result.percentage_of_total.toFixed(1)}% of total
                        {result.transaction_count && (
                          <span className="ml-2">({result.transaction_count} transactions)</span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold">{formatValue(result.value)}</div>
                      {result.variance_from_previous !== undefined && (
                        <div
                          className={"text-sm ".concat(
                            result.variance_from_previous >= 0 ? "text-green-600" : "text-red-600",
                          )}
                        >
                          {result.variance_from_previous >= 0 ? "+" : ""}
                          {result.variance_from_previous.toFixed(1)}%
                        </div>
                      )}
                    </div>

                    {onDrillDeeper && (
                      <button_1.Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDrillDeeper("service_type", result.dimension_value)}
                        className="ml-2"
                      >
                        <lucide_react_1.BarChart3 className="h-3 w-3" />
                      </button_1.Button>
                    )}
                  </div>
                ))}
              </div>}
        </div>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>
  );
};
var KPIDashboard = (_a) => {
  var _b, _c, _d;
  var userId = _a.userId,
    dashboardId = _a.dashboardId,
    _e = _a.isEditable,
    isEditable = _e === void 0 ? false : _e,
    _f = _a.refreshInterval,
    refreshInterval = _f === void 0 ? 30000 : _f;
  var _g = (0, react_1.useState)([]),
    kpis = _g[0],
    setKpis = _g[1];
  var _h = (0, react_1.useState)([]),
    alerts = _h[0],
    setAlerts = _h[1];
  var _j = (0, react_1.useState)(null),
    dashboard = _j[0],
    setDashboard = _j[1];
  var _k = (0, react_1.useState)(true),
    loading = _k[0],
    setLoading = _k[1];
  var _l = (0, react_1.useState)(false),
    isEditing = _l[0],
    setIsEditing = _l[1];
  var _m = (0, react_1.useState)(null),
    selectedKpi = _m[0],
    setSelectedKpi = _m[1];
  var _o = (0, react_1.useState)([]),
    drillDownResults = _o[0],
    setDrillDownResults = _o[1];
  var _p = (0, react_1.useState)(""),
    drillDownDimension = _p[0],
    setDrillDownDimension = _p[1];
  var _q = (0, react_1.useState)(false),
    showDrillDown = _q[0],
    setShowDrillDown = _q[1];
  var _r = (0, react_1.useState)({
      time_period: {
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        end_date: new Date().toISOString().split("T")[0],
        preset: "month",
      },
    }),
    filters = _r[0],
    setFilters = _r[1];
  // Load initial data
  (0, react_1.useEffect)(() => {
    loadDashboardData();
  }, [dashboardId]);
  // Auto-refresh
  (0, react_1.useEffect)(() => {
    if (refreshInterval <= 0) return;
    var interval = setInterval(() => {
      loadKPIData();
      loadAlerts();
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval, filters]);
  var loadDashboardData = () =>
    __awaiter(void 0, void 0, void 0, function () {
      var error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            setLoading(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            return [
              4 /*yield*/,
              Promise.all([
                loadKPIData(),
                loadAlerts(),
                dashboardId ? loadDashboard() : Promise.resolve(),
              ]),
            ];
          case 2:
            _a.sent();
            return [3 /*break*/, 5];
          case 3:
            error_1 = _a.sent();
            console.error("Error loading dashboard data:", error_1);
            return [3 /*break*/, 5];
          case 4:
            setLoading(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var loadKPIData = () =>
    __awaiter(void 0, void 0, void 0, function () {
      var response, data, error_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              fetch("/api/analytics/kpis", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  time_period: filters.time_period,
                  filters: filters,
                  include_variance: true,
                }),
              }),
            ];
          case 1:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            if (data.success) {
              setKpis(data.data);
            }
            return [3 /*break*/, 4];
          case 3:
            error_2 = _a.sent();
            console.error("Error loading KPIs:", error_2);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  var loadAlerts = () =>
    __awaiter(void 0, void 0, void 0, function () {
      var response, data, error_3;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, fetch("/api/analytics/alerts?is_acknowledged=false")];
          case 1:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            if (data.success) {
              setAlerts(data.data);
            }
            return [3 /*break*/, 4];
          case 3:
            error_3 = _a.sent();
            console.error("Error loading alerts:", error_3);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  var loadDashboard = () =>
    __awaiter(void 0, void 0, void 0, function () {
      var response, data, error_4;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            if (!dashboardId) return [2 /*return*/];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 4, , 5]);
            return [4 /*yield*/, fetch("/api/analytics/dashboards/".concat(dashboardId))];
          case 2:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 3:
            data = _a.sent();
            if (data.success) {
              setDashboard(data.data);
              setFilters(data.data.filters);
            }
            return [3 /*break*/, 5];
          case 4:
            error_4 = _a.sent();
            console.error("Error loading dashboard:", error_4);
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var handleDrillDown = (kpiId, dimension) =>
    __awaiter(void 0, void 0, void 0, function () {
      var kpi, response, data, error_5;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            kpi = kpis.find((k) => k.id === kpiId);
            if (!kpi) return [2 /*return*/];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 4, , 5]);
            return [
              4 /*yield*/,
              fetch("/api/analytics/drill-down", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  kpi_id: kpiId,
                  dimension: dimension,
                  filters: filters,
                  aggregation_level: dimension === "time" ? "month" : undefined,
                  limit: 20,
                }),
              }),
            ];
          case 2:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 3:
            data = _a.sent();
            if (data.success) {
              setSelectedKpi(kpi);
              setDrillDownDimension(dimension);
              setDrillDownResults(data.data.results || []);
              setShowDrillDown(true);
            }
            return [3 /*break*/, 5];
          case 4:
            error_5 = _a.sent();
            console.error("Error performing drill-down:", error_5);
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var handleAcknowledgeAlert = (alertId) =>
    __awaiter(void 0, void 0, void 0, function () {
      var response, error_6;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              fetch("/api/analytics/alerts/".concat(alertId, "/acknowledge"), {
                method: "PATCH",
              }),
            ];
          case 1:
            response = _a.sent();
            if (response.ok) {
              setAlerts(alerts.filter((alert) => alert.id !== alertId));
            }
            return [3 /*break*/, 3];
          case 2:
            error_6 = _a.sent();
            console.error("Error acknowledging alert:", error_6);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  var handleFilterChange = (newFilters) => {
    setFilters(__assign(__assign({}, filters), newFilters));
  };
  var groupedKpis = (0, react_1.useMemo)(
    () =>
      kpis.reduce((groups, kpi) => {
        var category = kpi.kpi_category;
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(kpi);
        return groups;
      }, {}),
    [kpis],
  );
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <lucide_react_1.RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Financial KPI Dashboard</h1>
          <p className="text-gray-600">Real-time financial metrics and performance indicators</p>
        </div>

        <div className="flex items-center gap-2">
          <button_1.Button variant="outline" onClick={loadDashboardData}>
            <lucide_react_1.RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button_1.Button>
          {isEditable && (
            <button_1.Button
              variant={isEditing ? "default" : "outline"}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Done" : "Edit"}
            </button_1.Button>
          )}
          <button_1.Button variant="outline">
            <lucide_react_1.Settings className="h-4 w-4 mr-2" />
            Settings
          </button_1.Button>
        </div>
      </div>

      {/* Filters */}
      <card_1.Card>
        <card_1.CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <select_1.Select
              value={
                ((_b = filters.time_period) === null || _b === void 0 ? void 0 : _b.preset) ||
                "custom"
              }
              onValueChange={(value) => {
                if (value !== "custom") {
                  var now = new Date();
                  var startDate = void 0;
                  switch (value) {
                    case "today":
                      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                      break;
                    case "week":
                      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                      break;
                    case "month":
                      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                      break;
                    case "quarter":
                      startDate = new Date(
                        now.getFullYear(),
                        Math.floor(now.getMonth() / 3) * 3,
                        1,
                      );
                      break;
                    case "year":
                      startDate = new Date(now.getFullYear(), 0, 1);
                      break;
                    default:
                      return;
                  }
                  handleFilterChange({
                    time_period: {
                      start_date: startDate.toISOString().split("T")[0],
                      end_date: now.toISOString().split("T")[0],
                      preset: value,
                    },
                  });
                }
              }}
            >
              <select_1.SelectTrigger className="w-40">
                <select_1.SelectValue placeholder="Time Period" />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="today">Today</select_1.SelectItem>
                <select_1.SelectItem value="week">Last 7 days</select_1.SelectItem>
                <select_1.SelectItem value="month">This month</select_1.SelectItem>
                <select_1.SelectItem value="quarter">This quarter</select_1.SelectItem>
                <select_1.SelectItem value="year">This year</select_1.SelectItem>
                <select_1.SelectItem value="custom">Custom</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>

            <input_1.Input
              type="date"
              value={
                ((_c = filters.time_period) === null || _c === void 0 ? void 0 : _c.start_date) ||
                ""
              }
              onChange={(e) =>
                handleFilterChange({
                  time_period: __assign(__assign({}, filters.time_period), {
                    start_date: e.target.value,
                    preset: "custom",
                  }),
                })
              }
              className="w-40"
            />

            <input_1.Input
              type="date"
              value={
                ((_d = filters.time_period) === null || _d === void 0 ? void 0 : _d.end_date) || ""
              }
              onChange={(e) =>
                handleFilterChange({
                  time_period: __assign(__assign({}, filters.time_period), {
                    end_date: e.target.value,
                    preset: "custom",
                  }),
                })
              }
              className="w-40"
            />
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* KPI Cards */}
        <div className="lg:col-span-3">
          <tabs_1.Tabs defaultValue="overview" className="space-y-4">
            <tabs_1.TabsList>
              <tabs_1.TabsTrigger value="overview">Overview</tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="revenue">Revenue</tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="profitability">Profitability</tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="operational">Operational</tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="financial_health">Financial Health</tabs_1.TabsTrigger>
            </tabs_1.TabsList>

            <tabs_1.TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {kpis.slice(0, 6).map((kpi) => (
                  <KPICard
                    key={kpi.id}
                    kpi={kpi}
                    isEditing={isEditing}
                    onDrillDown={handleDrillDown}
                  />
                ))}
              </div>
            </tabs_1.TabsContent>

            {Object.entries(groupedKpis).map((_a) => {
              var category = _a[0],
                categoryKpis = _a[1];
              return (
                <tabs_1.TabsContent key={category} value={category} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryKpis.map((kpi) => (
                      <KPICard
                        key={kpi.id}
                        kpi={kpi}
                        isEditing={isEditing}
                        onDrillDown={handleDrillDown}
                      />
                    ))}
                  </div>
                </tabs_1.TabsContent>
              );
            })}
          </tabs_1.Tabs>
        </div>

        {/* Alerts Panel */}
        <div className="lg:col-span-1">
          <AlertsPanel
            alerts={alerts}
            onAcknowledge={handleAcknowledgeAlert}
            onViewDetails={(alert) => console.log("View alert details:", alert)}
          />
        </div>
      </div>

      {/* Drill-down Modal */}
      <DrillDownModal
        kpi={selectedKpi}
        dimension={drillDownDimension}
        results={drillDownResults}
        isOpen={showDrillDown}
        onClose={() => setShowDrillDown(false)}
        onDrillDeeper={(dimension, value) => {
          console.log("Drill deeper:", dimension, value);
        }}
      />
    </div>
  );
};
exports.KPIDashboard = KPIDashboard;
exports.default = exports.KPIDashboard;
