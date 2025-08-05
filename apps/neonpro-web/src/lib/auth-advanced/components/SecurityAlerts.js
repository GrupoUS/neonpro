// Security Alerts Component
// Story 1.4: Session Management & Security Implementation
"use client";
"use strict";
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityAlerts = SecurityAlerts;
var react_1 = require("react");
var context_1 = require("../context");
var utils_1 = require("../utils");
var lucide_react_1 = require("lucide-react");
function SecurityAlerts(_a) {
  var _b = _a.className,
    className = _b === void 0 ? "" : _b,
    _c = _a.maxAlerts,
    maxAlerts = _c === void 0 ? 10 : _c,
    _d = _a.showDismissed,
    showDismissed = _d === void 0 ? false : _d,
    _e = _a.autoHide,
    autoHide = _e === void 0 ? true : _e,
    _f = _a.compact,
    compact = _f === void 0 ? false : _f;
  var _g = (0, context_1.useSessionContext)(),
    securityAlerts = _g.securityAlerts,
    securityEvents = _g.securityEvents,
    clearSecurityAlerts = _g.clearSecurityAlerts;
  var _h = (0, react_1.useState)(new Set()),
    dismissedAlerts = _h[0],
    setDismissedAlerts = _h[1];
  var _j = (0, react_1.useState)(false),
    showAll = _j[0],
    setShowAll = _j[1];
  // Filter alerts based on settings
  var filteredAlerts = securityAlerts
    .filter(function (alert) {
      return showDismissed || !dismissedAlerts.has(alert.id);
    })
    .slice(0, showAll ? undefined : maxAlerts);
  // Get icon for security event type
  var getEventIcon = function (eventType) {
    var iconMap = {
      login_success: <lucide_react_1.User className="w-4 h-4 text-green-500" />,
      login_failure: <lucide_react_1.User className="w-4 h-4 text-red-500" />,
      logout: <lucide_react_1.User className="w-4 h-4 text-gray-500" />,
      session_timeout: <lucide_react_1.Clock className="w-4 h-4 text-orange-500" />,
      session_extended: <lucide_react_1.Clock className="w-4 h-4 text-blue-500" />,
      password_change: <lucide_react_1.Lock className="w-4 h-4 text-blue-500" />,
      mfa_enabled: <lucide_react_1.Shield className="w-4 h-4 text-green-500" />,
      mfa_disabled: <lucide_react_1.Shield className="w-4 h-4 text-red-500" />,
      suspicious_location: <lucide_react_1.MapPin className="w-4 h-4 text-red-500" />,
      suspicious_device: <lucide_react_1.Monitor className="w-4 h-4 text-red-500" />,
      brute_force_attempt: <lucide_react_1.AlertTriangle className="w-4 h-4 text-red-600" />,
      privilege_escalation_attempt: <lucide_react_1.Unlock className="w-4 h-4 text-red-600" />,
      session_hijack_attempt: <lucide_react_1.AlertTriangle className="w-4 h-4 text-red-600" />,
      unusual_activity: <lucide_react_1.Activity className="w-4 h-4 text-yellow-500" />,
      concurrent_session_limit: <lucide_react_1.User className="w-4 h-4 text-orange-500" />,
      device_blocked: <lucide_react_1.Monitor className="w-4 h-4 text-red-500" />,
      user_blocked: <lucide_react_1.User className="w-4 h-4 text-red-600" />,
    };
    return iconMap[eventType] || <lucide_react_1.AlertTriangle className="w-4 h-4 text-gray-500" />;
  };
  // Get alert priority color
  var getAlertColor = function (event) {
    var severity = utils_1.AuthUtils.SecurityEvent.classifyEventSeverity(event.event_type);
    var colorMap = {
      low: "border-blue-200 bg-blue-50",
      medium: "border-yellow-200 bg-yellow-50",
      high: "border-orange-200 bg-orange-50",
      critical: "border-red-200 bg-red-50",
    };
    return colorMap[severity];
  };
  // Get text color for severity
  var getTextColor = function (event) {
    var severity = utils_1.AuthUtils.SecurityEvent.classifyEventSeverity(event.event_type);
    var colorMap = {
      low: "text-blue-800",
      medium: "text-yellow-800",
      high: "text-orange-800",
      critical: "text-red-800",
    };
    return colorMap[severity];
  };
  // Dismiss alert
  var dismissAlert = function (alertId) {
    setDismissedAlerts(function (prev) {
      return new Set(__spreadArray(__spreadArray([], prev, true), [alertId], false));
    });
  };
  // Clear all alerts
  var handleClearAll = function () {
    clearSecurityAlerts();
    setDismissedAlerts(new Set());
  };
  // Format event metadata
  var formatMetadata = function (metadata) {
    var items = [];
    if (metadata.ip_address) {
      items.push("IP: ".concat(metadata.ip_address));
    }
    if (metadata.location) {
      items.push("".concat(metadata.location.city, ", ").concat(metadata.location.country));
    }
    if (metadata.device) {
      items.push("Device: ".concat(metadata.device));
    }
    if (metadata.failed_attempts) {
      items.push("".concat(metadata.failed_attempts, " attempts"));
    }
    return items.join(" • ");
  };
  if (filteredAlerts.length === 0) {
    if (autoHide) {
      return null;
    }
    return (
      <div className={"bg-green-50 border border-green-200 rounded-lg p-4 ".concat(className)}>
        <div className="flex items-center space-x-2">
          <lucide_react_1.Shield className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-green-800">No security alerts</span>
        </div>
      </div>
    );
  }
  if (compact) {
    return (
      <div className={"space-y-2 ".concat(className)}>
        {filteredAlerts.slice(0, 3).map(function (alert) {
          var severity = utils_1.AuthUtils.SecurityEvent.classifyEventSeverity(alert.event_type);
          var isDismissed = dismissedAlerts.has(alert.id);
          return (
            <div
              key={alert.id}
              className={"flex items-center justify-between p-2 rounded border "
                .concat(getAlertColor(alert), " ")
                .concat(isDismissed ? "opacity-50" : "")}
            >
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                {getEventIcon(alert.event_type)}
                <span className={"text-sm font-medium truncate ".concat(getTextColor(alert))}>
                  {utils_1.AuthUtils.SecurityEvent.generateEventDescription(
                    alert.event_type,
                    alert.metadata,
                  )}
                </span>
              </div>

              <button
                onClick={function () {
                  return dismissAlert(alert.id);
                }}
                className="flex-shrink-0 p-1 hover:bg-white/50 rounded"
                title="Dismiss alert"
              >
                <lucide_react_1.X className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        {filteredAlerts.length > 3 && (
          <button
            onClick={function () {
              return setShowAll(!showAll);
            }}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            {showAll ? "Show less" : "Show ".concat(filteredAlerts.length - 3, " more alerts")}
          </button>
        )}
      </div>
    );
  }
  return (
    <div className={"bg-white rounded-lg border shadow-sm ".concat(className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <lucide_react_1.AlertTriangle className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-900">Security Alerts</h3>
          {filteredAlerts.length > 0 && (
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
              {filteredAlerts.length}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={function () {
              return setShowDismissed(!showDismissed);
            }}
            className="p-2 text-gray-400 hover:text-gray-600 rounded"
            title={showDismissed ? "Hide dismissed" : "Show dismissed"}
          >
            {showDismissed
              ? <lucide_react_1.EyeOff className="w-4 h-4" />
              : <lucide_react_1.Eye className="w-4 h-4" />}
          </button>

          {filteredAlerts.length > 0 && (
            <button
              onClick={handleClearAll}
              className="p-2 text-gray-400 hover:text-gray-600 rounded"
              title="Clear all alerts"
            >
              <lucide_react_1.BellOff className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Alerts List */}
      <div className="divide-y">
        {filteredAlerts.map(function (alert) {
          var severity = utils_1.AuthUtils.SecurityEvent.classifyEventSeverity(alert.event_type);
          var riskScore = utils_1.AuthUtils.SecurityEvent.calculateEventRiskScore(
            alert.event_type,
            alert.metadata,
          );
          var isDismissed = dismissedAlerts.has(alert.id);
          return (
            <div
              key={alert.id}
              className={"p-4 hover:bg-gray-50 transition-colors ".concat(
                isDismissed ? "opacity-50" : "",
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="flex-shrink-0 mt-1">{getEventIcon(alert.event_type)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {utils_1.AuthUtils.SecurityEvent.generateEventDescription(
                          alert.event_type,
                          alert.metadata,
                        )}
                      </h4>

                      <span
                        className={"inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ".concat(
                          severity === "critical"
                            ? "bg-red-100 text-red-800"
                            : severity === "high"
                              ? "bg-orange-100 text-orange-800"
                              : severity === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800",
                        )}
                      >
                        {severity}
                      </span>

                      {riskScore > 50 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Risk: {riskScore}%
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-2">{alert.description}</p>

                    {alert.metadata && Object.keys(alert.metadata).length > 0 && (
                      <p className="text-xs text-gray-500">{formatMetadata(alert.metadata)}</p>
                    )}

                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <lucide_react_1.Clock className="w-3 h-3" />
                        <span>
                          {utils_1.AuthUtils.Format.formatRelativeTime(new Date(alert.created_at))}
                        </span>
                      </div>

                      {alert.ip_address && (
                        <div className="flex items-center space-x-1">
                          <span>IP: {alert.ip_address}</span>
                        </div>
                      )}

                      {alert.session_id && (
                        <div className="flex items-center space-x-1">
                          <span>Session: {alert.session_id.slice(-8)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={function () {
                      return dismissAlert(alert.id);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    title="Dismiss alert"
                  >
                    <lucide_react_1.X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      {securityAlerts.length > maxAlerts && !showAll && (
        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={function () {
              return setShowAll(true);
            }}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Show {securityAlerts.length - maxAlerts} more alerts
          </button>
        </div>
      )}

      {showAll && securityAlerts.length > maxAlerts && (
        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={function () {
              return setShowAll(false);
            }}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Show less
          </button>
        </div>
      )}
    </div>
  );
}
exports.default = SecurityAlerts;
