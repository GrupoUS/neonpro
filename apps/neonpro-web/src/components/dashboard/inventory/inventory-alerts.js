// =====================================================================================
// NeonPro Inventory Alerts Component
// Epic 6: Real-time Stock Tracking System
// Created: 2025-01-26
// =====================================================================================
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
var __spreadArray =
  (this && this.__spreadArray) ||
  ((to, from, pack) => {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = InventoryAlerts;
var alert_1 = require("@/components/ui/alert");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
// =====================================================================================
// COMPONENT CONFIGURATION
// =====================================================================================
var ALERT_CONFIG = {
  low_stock: {
    icon: lucide_react_1.TrendingDown,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
  out_of_stock: {
    icon: lucide_react_1.Package,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  expired: {
    icon: lucide_react_1.X,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  expiring_soon: {
    icon: lucide_react_1.Clock,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  overstock: {
    icon: lucide_react_1.AlertTriangle,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
};
var SEVERITY_CONFIG = {
  low: { label: "Baixa", color: "bg-gray-100 text-gray-800" },
  medium: { label: "Média", color: "bg-yellow-100 text-yellow-800" },
  high: { label: "Alta", color: "bg-orange-100 text-orange-800" },
  critical: { label: "Crítica", color: "bg-red-100 text-red-800" },
};
// =====================================================================================
// MAIN COMPONENT
// =====================================================================================
function InventoryAlerts() {
  var _a = (0, react_1.useState)([]),
    alerts = _a[0],
    setAlerts = _a[1];
  var _b = (0, react_1.useState)(true),
    loading = _b[0],
    setLoading = _b[1];
  var _c = (0, react_1.useState)("all"),
    filter = _c[0],
    setFilter = _c[1];
  var _d = (0, react_1.useState)(null),
    error = _d[0],
    setError = _d[1];
  // =====================================================================================
  // DATA FETCHING
  // =====================================================================================
  (0, react_1.useEffect)(() => {
    loadAlerts();
  }, []);
  var loadAlerts = () =>
    __awaiter(this, void 0, void 0, function () {
      var response, data, err_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, 4, 5]);
            setLoading(true);
            return [4 /*yield*/, fetch("/api/inventory/alerts")];
          case 1:
            response = _a.sent();
            if (!response.ok) {
              throw new Error("Failed to load alerts");
            }
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setAlerts(data);
            return [3 /*break*/, 5];
          case 3:
            err_1 = _a.sent();
            console.error("Error loading alerts:", err_1);
            setError("Failed to load inventory alerts");
            return [3 /*break*/, 5];
          case 4:
            setLoading(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  // =====================================================================================
  // EVENT HANDLERS
  // =====================================================================================
  var markAsRead = (alertId) =>
    __awaiter(this, void 0, void 0, function () {
      var response, err_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              fetch("/api/inventory/alerts/".concat(alertId, "/read"), {
                method: "PATCH",
              }),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) {
              throw new Error("Failed to mark alert as read");
            }
            setAlerts((prev) =>
              prev.map((alert) =>
                alert.id === alertId ? __assign(__assign({}, alert), { is_read: true }) : alert,
              ),
            );
            return [3 /*break*/, 3];
          case 2:
            err_2 = _a.sent();
            console.error("Error marking alert as read:", err_2);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  var dismissAlert = (alertId) =>
    __awaiter(this, void 0, void 0, function () {
      var response, err_3;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              fetch("/api/inventory/alerts/".concat(alertId), {
                method: "DELETE",
              }),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) {
              throw new Error("Failed to dismiss alert");
            }
            setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
            return [3 /*break*/, 3];
          case 2:
            err_3 = _a.sent();
            console.error("Error dismissing alert:", err_3);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  var markAllAsRead = () =>
    __awaiter(this, void 0, void 0, function () {
      var response, err_4;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              fetch("/api/inventory/alerts/mark-all-read", {
                method: "PATCH",
              }),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) {
              throw new Error("Failed to mark all alerts as read");
            }
            setAlerts((prev) =>
              prev.map((alert) => __assign(__assign({}, alert), { is_read: true })),
            );
            return [3 /*break*/, 3];
          case 2:
            err_4 = _a.sent();
            console.error("Error marking all alerts as read:", err_4);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  // =====================================================================================
  // FILTERING & SORTING
  // =====================================================================================
  var filteredAlerts = alerts
    .filter((alert) => {
      switch (filter) {
        case "unread":
          return !alert.is_read;
        case "critical":
          return alert.severity === "critical" || alert.severity === "high";
        default:
          return true;
      }
    })
    .sort((a, b) => {
      // Sort by severity first, then by date
      var severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      var severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  var unreadCount = alerts.filter((alert) => !alert.is_read).length;
  var criticalCount = alerts.filter(
    (alert) => alert.severity === "critical" || alert.severity === "high",
  ).length;
  // =====================================================================================
  // LOADING STATE
  // =====================================================================================
  if (loading) {
    return (
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Bell className="h-5 w-5" />
            Inventory Alerts
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-3">
            {__spreadArray([], Array(3), true).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-gray-200 rounded" />
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-48" />
                      <div className="h-3 bg-gray-200 rounded w-64" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-5 bg-gray-200 rounded" />
                    <div className="w-8 h-8 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  // =====================================================================================
  // ERROR STATE
  // =====================================================================================
  if (error) {
    return (
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2 text-red-600">
            <lucide_react_1.AlertTriangle className="h-5 w-5" />
            Error Loading Alerts
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <alert_1.Alert variant="destructive">
            <alert_1.AlertDescription>{error}</alert_1.AlertDescription>
          </alert_1.Alert>
          <button_1.Button onClick={loadAlerts} className="mt-4">
            Try Again
          </button_1.Button>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  // =====================================================================================
  // MAIN RENDER
  // =====================================================================================
  return (
    <card_1.Card>
      <card_1.CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <card_1.CardTitle className="flex items-center gap-2">
              {unreadCount > 0
                ? <lucide_react_1.Bell className="h-5 w-5 text-orange-500" />
                : <lucide_react_1.BellOff className="h-5 w-5 text-gray-400" />}
              Inventory Alerts
              {unreadCount > 0 && (
                <badge_1.Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </badge_1.Badge>
              )}
            </card_1.CardTitle>
            <card_1.CardDescription>
              Monitor stock levels, expiration dates, and inventory issues
            </card_1.CardDescription>
          </div>

          {unreadCount > 0 && (
            <button_1.Button variant="outline" size="sm" onClick={markAllAsRead}>
              <lucide_react_1.CheckCircle className="h-4 w-4 mr-2" />
              Mark All Read
            </button_1.Button>
          )}
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center space-x-2 pt-4">
          <button_1.Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All ({alerts.length})
          </button_1.Button>
          <button_1.Button
            variant={filter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unread")}
          >
            Unread ({unreadCount})
          </button_1.Button>
          <button_1.Button
            variant={filter === "critical" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("critical")}
          >
            Critical ({criticalCount})
          </button_1.Button>
        </div>
      </card_1.CardHeader>

      <card_1.CardContent>
        {filteredAlerts.length === 0
          ? <div className="text-center py-8">
              <lucide_react_1.CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === "all" ? "No alerts" : "No ".concat(filter, " alerts")}
              </h3>
              <p className="text-gray-500">
                {filter === "all"
                  ? "Your inventory is running smoothly!"
                  : "All ".concat(filter, " alerts have been addressed.")}
              </p>
            </div>
          : <div className="space-y-3">
              {filteredAlerts.map((alert) => {
                var config = ALERT_CONFIG[alert.type];
                var Icon = config.icon;
                var severityConfig = SEVERITY_CONFIG[alert.severity];
                return (
                  <div
                    key={alert.id}
                    className={"\n                    p-4 border rounded-lg transition-all duration-200 hover:shadow-sm\n                    "
                      .concat(config.bgColor, " ")
                      .concat(config.borderColor, "\n                    ")
                      .concat(!alert.is_read ? "border-l-4" : "", "\n                  ")}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <Icon className={"h-5 w-5 mt-0.5 ".concat(config.color)} />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-900">{alert.title}</h4>
                            <badge_1.Badge variant="outline" className={severityConfig.color}>
                              {severityConfig.label}
                            </badge_1.Badge>
                            {!alert.is_read && (
                              <badge_1.Badge
                                variant="default"
                                className="bg-blue-100 text-blue-800"
                              >
                                New
                              </badge_1.Badge>
                            )}
                          </div>

                          <p className="text-sm text-gray-600 mb-2">{alert.message}</p>

                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Item: {alert.item_name}</span>
                            {alert.location_name && <span>Location: {alert.location_name}</span>}
                            {alert.current_quantity !== undefined && (
                              <span>Current: {alert.current_quantity}</span>
                            )}
                            {alert.expiry_date && (
                              <span>
                                Expires: {new Date(alert.expiry_date).toLocaleDateString()}
                              </span>
                            )}
                            <span>{new Date(alert.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {!alert.is_read && (
                          <button_1.Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(alert.id)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <lucide_react_1.CheckCircle className="h-4 w-4" />
                          </button_1.Button>
                        )}
                        <button_1.Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dismissAlert(alert.id)}
                          className="text-gray-500 hover:text-red-600"
                        >
                          <lucide_react_1.X className="h-4 w-4" />
                        </button_1.Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>}
      </card_1.CardContent>
    </card_1.Card>
  );
}
