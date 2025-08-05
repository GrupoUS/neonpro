// Session Metrics Component
// Story 1.4: Session Management & Security Implementation
"use client";
"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
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
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
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
      return function (v) {
        return step([n, v]);
      };
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
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionMetrics = SessionMetrics;
var react_1 = require("react");
var context_1 = require("../context");
var utils_1 = require("../utils");
var lucide_react_1 = require("lucide-react");
function SessionMetrics(_a) {
  var _this = this;
  var _b, _c, _d, _e;
  var _f = _a.className,
    className = _f === void 0 ? "" : _f,
    _g = _a.timeRange,
    timeRange = _g === void 0 ? "24h" : _g,
    _h = _a.showExport,
    showExport = _h === void 0 ? true : _h,
    _j = _a.compact,
    compact = _j === void 0 ? false : _j;
  var _k = (0, context_1.useSessionContext)(),
    sessionMetrics = _k.sessionMetrics,
    exportSessionData = _k.exportSessionData;
  var _l = (0, react_1.useState)(timeRange),
    selectedTimeRange = _l[0],
    setSelectedTimeRange = _l[1];
  var _m = (0, react_1.useState)(false),
    isLoading = _m[0],
    setIsLoading = _m[1];
  var _o = (0, react_1.useState)(false),
    isExporting = _o[0],
    setIsExporting = _o[1];
  // Mock metrics data (in real implementation, this would come from the API)
  var _p = (0, react_1.useState)(null),
    metrics = _p[0],
    setMetrics = _p[1];
  (0, react_1.useEffect)(
    function () {
      // Simulate loading metrics
      setIsLoading(true);
      var timer = setTimeout(function () {
        setMetrics({
          totalSessions: 156,
          activeSessions: 12,
          averageSessionDuration: 1800000, // 30 minutes in ms
          securityEvents: 3,
          deviceCount: 8,
          locationCount: 4,
          sessionsByHour: Array.from({ length: 24 }, function (_, i) {
            return {
              hour: i,
              count: Math.floor(Math.random() * 20) + 1,
            };
          }),
          securityEventsByType: [
            { type: "suspicious_login", count: 2 },
            { type: "unusual_location", count: 1 },
            { type: "device_change", count: 0 },
          ],
          topLocations: [
            { city: "São Paulo", country: "Brazil", count: 45 },
            { city: "Rio de Janeiro", country: "Brazil", count: 32 },
            { city: "Brasília", country: "Brazil", count: 18 },
          ],
          topDevices: [
            { type: "desktop", count: 89 },
            { type: "mobile", count: 45 },
            { type: "tablet", count: 22 },
          ],
        });
        setIsLoading(false);
      }, 1000);
      return function () {
        return clearTimeout(timer);
      };
    },
    [selectedTimeRange],
  );
  // Handle export
  var handleExport = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            setIsExporting(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            return [
              4 /*yield*/,
              exportSessionData({
                format: "csv",
                timeRange: selectedTimeRange,
                includeSecurityEvents: true,
                includeDeviceInfo: true,
              }),
            ];
          case 2:
            _a.sent();
            return [3 /*break*/, 5];
          case 3:
            error_1 = _a.sent();
            console.error("Failed to export session data:", error_1);
            return [3 /*break*/, 5];
          case 4:
            setIsExporting(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  // Get trend indicator
  var getTrendIndicator = function (current, previous) {
    if (current > previous) {
      return <lucide_react_1.TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (current < previous) {
      return <lucide_react_1.TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return <lucide_react_1.Activity className="w-4 h-4 text-gray-500" />;
  };
  // Get security status color
  var getSecurityStatusColor = function (eventCount) {
    if (eventCount === 0) return "text-green-600";
    if (eventCount <= 2) return "text-yellow-600";
    return "text-red-600";
  };
  // Get security status icon
  var getSecurityStatusIcon = function (eventCount) {
    if (eventCount === 0) return <lucide_react_1.CheckCircle className="w-4 h-4 text-green-500" />;
    if (eventCount <= 2)
      return <lucide_react_1.AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return <lucide_react_1.XCircle className="w-4 h-4 text-red-500" />;
  };
  if (compact) {
    return (
      <div className={"space-y-4 ".concat(className)}>
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Sessions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(metrics === null || metrics === void 0 ? void 0 : metrics.activeSessions) || 0}
                </p>
              </div>
              <lucide_react_1.Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Security Events</p>
                <p
                  className={"text-2xl font-bold ".concat(
                    getSecurityStatusColor(
                      (metrics === null || metrics === void 0 ? void 0 : metrics.securityEvents) ||
                        0,
                    ),
                  )}
                >
                  {(metrics === null || metrics === void 0 ? void 0 : metrics.securityEvents) || 0}
                </p>
              </div>
              {getSecurityStatusIcon(
                (metrics === null || metrics === void 0 ? void 0 : metrics.securityEvents) || 0,
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900">Quick Stats</h4>
            <lucide_react_1.BarChart3 className="w-4 h-4 text-gray-500" />
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Avg. Session Duration</span>
              <span className="font-medium">
                {utils_1.AuthUtils.Format.formatDuration(
                  (metrics === null || metrics === void 0
                    ? void 0
                    : metrics.averageSessionDuration) || 0,
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Registered Devices</span>
              <span className="font-medium">
                {(metrics === null || metrics === void 0 ? void 0 : metrics.deviceCount) || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Locations</span>
              <span className="font-medium">
                {(metrics === null || metrics === void 0 ? void 0 : metrics.locationCount) || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={"bg-white rounded-lg border shadow-sm ".concat(className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <lucide_react_1.BarChart3 className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Session Metrics</h3>
        </div>

        <div className="flex items-center space-x-2">
          {/* Time Range Selector */}
          <select
            value={selectedTimeRange}
            onChange={function (e) {
              return setSelectedTimeRange(e.target.value);
            }}
            className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={function () {
              return window.location.reload();
            }}
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-gray-600 rounded disabled:opacity-50"
          >
            <lucide_react_1.RefreshCw
              className={"w-4 h-4 ".concat(isLoading ? "animate-spin" : "")}
            />
          </button>

          {/* Export Button */}
          {showExport && (
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <lucide_react_1.Download className="w-4 h-4 mr-1" />
              Export
            </button>
          )}
        </div>
      </div>

      {isLoading
        ? <div className="p-8 text-center">
            <lucide_react_1.RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
            <p className="text-sm text-gray-500">Loading metrics...</p>
          </div>
        : <div className="p-4 space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Sessions */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Total Sessions</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {(metrics === null || metrics === void 0 ? void 0 : metrics.totalSessions) ||
                        0}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {selectedTimeRange === "1h"
                        ? "This hour"
                        : selectedTimeRange === "24h"
                          ? "Today"
                          : selectedTimeRange === "7d"
                            ? "This week"
                            : "This month"}
                    </p>
                  </div>
                  <lucide_react_1.Users className="w-8 h-8 text-blue-500" />
                </div>
              </div>

              {/* Active Sessions */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Active Sessions</p>
                    <p className="text-2xl font-bold text-green-900">
                      {(metrics === null || metrics === void 0 ? void 0 : metrics.activeSessions) ||
                        0}
                    </p>
                    <p className="text-xs text-green-600 mt-1">Currently online</p>
                  </div>
                  <lucide_react_1.Activity className="w-8 h-8 text-green-500" />
                </div>
              </div>

              {/* Average Duration */}
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Avg. Duration</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {utils_1.AuthUtils.Format.formatDuration(
                        (metrics === null || metrics === void 0
                          ? void 0
                          : metrics.averageSessionDuration) || 0,
                        true,
                      )}
                    </p>
                    <p className="text-xs text-purple-600 mt-1">Per session</p>
                  </div>
                  <lucide_react_1.Clock className="w-8 h-8 text-purple-500" />
                </div>
              </div>

              {/* Security Events */}
              <div
                className={"bg-gradient-to-r p-4 rounded-lg ".concat(
                  ((metrics === null || metrics === void 0 ? void 0 : metrics.securityEvents) ||
                    0) === 0
                    ? "from-green-50 to-green-100"
                    : ((metrics === null || metrics === void 0 ? void 0 : metrics.securityEvents) ||
                          0) <= 2
                      ? "from-yellow-50 to-yellow-100"
                      : "from-red-50 to-red-100",
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={"text-sm font-medium ".concat(
                        ((metrics === null || metrics === void 0
                          ? void 0
                          : metrics.securityEvents) || 0) === 0
                          ? "text-green-600"
                          : ((metrics === null || metrics === void 0
                                ? void 0
                                : metrics.securityEvents) || 0) <= 2
                            ? "text-yellow-600"
                            : "text-red-600",
                      )}
                    >
                      Security Events
                    </p>
                    <p
                      className={"text-2xl font-bold ".concat(
                        ((metrics === null || metrics === void 0
                          ? void 0
                          : metrics.securityEvents) || 0) === 0
                          ? "text-green-900"
                          : ((metrics === null || metrics === void 0
                                ? void 0
                                : metrics.securityEvents) || 0) <= 2
                            ? "text-yellow-900"
                            : "text-red-900",
                      )}
                    >
                      {(metrics === null || metrics === void 0 ? void 0 : metrics.securityEvents) ||
                        0}
                    </p>
                    <p
                      className={"text-xs mt-1 ".concat(
                        ((metrics === null || metrics === void 0
                          ? void 0
                          : metrics.securityEvents) || 0) === 0
                          ? "text-green-600"
                          : ((metrics === null || metrics === void 0
                                ? void 0
                                : metrics.securityEvents) || 0) <= 2
                            ? "text-yellow-600"
                            : "text-red-600",
                      )}
                    >
                      {((metrics === null || metrics === void 0
                        ? void 0
                        : metrics.securityEvents) || 0) === 0
                        ? "All secure"
                        : "Needs attention"}
                    </p>
                  </div>
                  {getSecurityStatusIcon(
                    (metrics === null || metrics === void 0 ? void 0 : metrics.securityEvents) || 0,
                  )}
                </div>
              </div>
            </div>

            {/* Charts and Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sessions by Hour */}
              <div className="border rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                  <lucide_react_1.Calendar className="w-4 h-4 mr-2" />
                  Sessions by Hour
                </h4>

                <div className="space-y-2">
                  {(_b =
                    metrics === null || metrics === void 0 ? void 0 : metrics.sessionsByHour) ===
                    null || _b === void 0
                    ? void 0
                    : _b.slice(0, 8).map(function (item) {
                        var _a;
                        return (
                          <div key={item.hour} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              {String(item.hour).padStart(2, "0")}:00
                            </span>
                            <div className="flex items-center space-x-2 flex-1 mx-4">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{
                                    width: "".concat(
                                      (item.count /
                                        Math.max.apply(
                                          Math,
                                          ((_a =
                                            metrics === null || metrics === void 0
                                              ? void 0
                                              : metrics.sessionsByHour) === null || _a === void 0
                                            ? void 0
                                            : _a.map(function (s) {
                                                return s.count;
                                              })) || [1],
                                        )) *
                                        100,
                                      "%",
                                    ),
                                  }}
                                />
                              </div>
                            </div>
                            <span className="text-sm font-medium text-gray-900 w-8 text-right">
                              {item.count}
                            </span>
                          </div>
                        );
                      })}
                </div>
              </div>

              {/* Security Events by Type */}
              <div className="border rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                  <lucide_react_1.Shield className="w-4 h-4 mr-2" />
                  Security Events by Type
                </h4>

                <div className="space-y-3">
                  {(_c =
                    metrics === null || metrics === void 0
                      ? void 0
                      : metrics.securityEventsByType) === null || _c === void 0
                    ? void 0
                    : _c.map(function (event) {
                        return (
                          <div key={event.type} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 capitalize">
                              {event.type.replace("_", " ")}
                            </span>
                            <div className="flex items-center space-x-2">
                              <div
                                className={"w-2 h-2 rounded-full ".concat(
                                  event.count === 0
                                    ? "bg-green-500"
                                    : event.count <= 2
                                      ? "bg-yellow-500"
                                      : "bg-red-500",
                                )}
                              />
                              <span className="text-sm font-medium text-gray-900">
                                {event.count}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                </div>
              </div>

              {/* Top Locations */}
              <div className="border rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                  <lucide_react_1.MapPin className="w-4 h-4 mr-2" />
                  Top Locations
                </h4>

                <div className="space-y-3">
                  {(_d = metrics === null || metrics === void 0 ? void 0 : metrics.topLocations) ===
                    null || _d === void 0
                    ? void 0
                    : _d.map(function (location, index) {
                        return (
                          <div
                            key={"".concat(location.city, "-").concat(location.country)}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-medium text-gray-500 w-4">
                                #{index + 1}
                              </span>
                              <span className="text-sm text-gray-900">
                                {location.city}, {location.country}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {location.count}
                            </span>
                          </div>
                        );
                      })}
                </div>
              </div>

              {/* Top Devices */}
              <div className="border rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                  <lucide_react_1.Monitor className="w-4 h-4 mr-2" />
                  Device Types
                </h4>

                <div className="space-y-3">
                  {(_e = metrics === null || metrics === void 0 ? void 0 : metrics.topDevices) ===
                    null || _e === void 0
                    ? void 0
                    : _e.map(function (device) {
                        var _a;
                        return (
                          <div key={device.type} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 capitalize">{device.type}</span>
                            <div className="flex items-center space-x-2 flex-1 mx-4">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-indigo-500 h-2 rounded-full"
                                  style={{
                                    width: "".concat(
                                      (device.count /
                                        Math.max.apply(
                                          Math,
                                          ((_a =
                                            metrics === null || metrics === void 0
                                              ? void 0
                                              : metrics.topDevices) === null || _a === void 0
                                            ? void 0
                                            : _a.map(function (d) {
                                                return d.count;
                                              })) || [1],
                                        )) *
                                        100,
                                      "%",
                                    ),
                                  }}
                                />
                              </div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {device.count}
                            </span>
                          </div>
                        );
                      })}
                </div>
              </div>
            </div>
          </div>}
    </div>
  );
}
exports.default = SessionMetrics;
