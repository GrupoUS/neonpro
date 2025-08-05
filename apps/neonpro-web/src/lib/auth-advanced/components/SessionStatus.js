// Session Status Component
// Story 1.4: Session Management & Security Implementation
"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionStatus = SessionStatus;
var react_1 = require("react");
var context_1 = require("../context");
var utils_1 = require("../utils");
var lucide_react_1 = require("lucide-react");
function SessionStatus(_a) {
  var _b = _a.className,
    className = _b === void 0 ? "" : _b,
    _c = _a.showDetails,
    showDetails = _c === void 0 ? true : _c,
    _d = _a.showRiskScore,
    showRiskScore = _d === void 0 ? true : _d,
    _e = _a.showDeviceInfo,
    showDeviceInfo = _e === void 0 ? true : _e,
    _f = _a.compact,
    compact = _f === void 0 ? false : _f;
  var _g = (0, context_1.useSessionContext)(),
    currentSession = _g.currentSession,
    currentDevice = _g.currentDevice,
    riskScore = _g.riskScore,
    isConnected = _g.isConnected,
    lastActivity = _g.lastActivity,
    getTimeUntilExpiry = _g.getTimeUntilExpiry,
    formatSessionDuration = _g.formatSessionDuration,
    isSessionValid = _g.isSessionValid;
  var _h = (0, react_1.useState)(0),
    timeUntilExpiry = _h[0],
    setTimeUntilExpiry = _h[1];
  var _j = (0, react_1.useState)(new Date()),
    currentTime = _j[0],
    setCurrentTime = _j[1];
  // Update time every second
  (0, react_1.useEffect)(
    function () {
      var interval = setInterval(function () {
        setCurrentTime(new Date());
        setTimeUntilExpiry(getTimeUntilExpiry());
      }, 1000);
      return function () {
        return clearInterval(interval);
      };
    },
    [getTimeUntilExpiry],
  );
  // Get session status
  var sessionValid = isSessionValid();
  var riskLevel = utils_1.AuthUtils.Format.formatRiskScore(riskScore);
  // Get device icon
  var getDeviceIcon = function () {
    if (!currentDevice) return <lucide_react_1.Monitor className="w-4 h-4" />;
    var deviceType = utils_1.AuthUtils.Device.detectDeviceType(currentDevice.user_agent);
    switch (deviceType) {
      case "mobile":
        return <lucide_react_1.Smartphone className="w-4 h-4" />;
      case "tablet":
        return <lucide_react_1.Tablet className="w-4 h-4" />;
      default:
        return <lucide_react_1.Monitor className="w-4 h-4" />;
    }
  };
  // Format time until expiry
  var formatTimeUntilExpiry = function (ms) {
    if (ms <= 0) return "Expired";
    var minutes = Math.floor(ms / (1000 * 60));
    var hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return "".concat(hours, "h ").concat(minutes % 60, "m");
    } else {
      return "".concat(minutes, "m");
    }
  };
  if (!currentSession) {
    return (
      <div className={"flex items-center space-x-2 text-gray-500 ".concat(className)}>
        <lucide_react_1.XCircle className="w-4 h-4" />
        <span className="text-sm">No active session</span>
      </div>
    );
  }
  if (compact) {
    return (
      <div className={"flex items-center space-x-3 ".concat(className)}>
        {/* Session Status */}
        <div className="flex items-center space-x-1">
          {sessionValid
            ? <lucide_react_1.CheckCircle className="w-4 h-4 text-green-500" />
            : <lucide_react_1.XCircle className="w-4 h-4 text-red-500" />}
          <span className="text-sm font-medium">{sessionValid ? "Active" : "Invalid"}</span>
        </div>

        {/* Time Until Expiry */}
        <div className="flex items-center space-x-1">
          <lucide_react_1.Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{formatTimeUntilExpiry(timeUntilExpiry)}</span>
        </div>

        {/* Risk Score */}
        {showRiskScore && (
          <div className="flex items-center space-x-1">
            <lucide_react_1.Shield className="w-4 h-4" style={{ color: riskLevel.color }} />
            <span className="text-sm" style={{ color: riskLevel.color }}>
              {riskScore}%
            </span>
          </div>
        )}

        {/* Connection Status */}
        <div
          className={"w-2 h-2 rounded-full ".concat(isConnected ? "bg-green-500" : "bg-gray-400")}
          title={isConnected ? "Connected" : "Disconnected"}
        />
      </div>
    );
  }
  return (
    <div className={"bg-white rounded-lg border shadow-sm p-4 ".concat(className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Session Status</h3>
        <div className="flex items-center space-x-2">
          {sessionValid
            ? <lucide_react_1.CheckCircle className="w-5 h-5 text-green-500" />
            : <lucide_react_1.XCircle className="w-5 h-5 text-red-500" />}
          <span
            className={"text-sm font-medium ".concat(
              sessionValid ? "text-green-700" : "text-red-700",
            )}
          >
            {sessionValid ? "Active" : "Invalid"}
          </span>
        </div>
      </div>

      {/* Session Details */}
      {showDetails && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Session Duration */}
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <lucide_react_1.Activity className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Duration</p>
              <p className="text-sm text-gray-600">{formatSessionDuration()}</p>
            </div>
          </div>

          {/* Time Until Expiry */}
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <lucide_react_1.Clock className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Expires In</p>
              <p
                className={"text-sm ".concat(
                  timeUntilExpiry < 15 * 60 * 1000 ? "text-red-600" : "text-gray-600",
                )}
              >
                {formatTimeUntilExpiry(timeUntilExpiry)}
              </p>
            </div>
          </div>

          {/* Last Activity */}
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <lucide_react_1.Activity className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Last Activity</p>
              <p className="text-sm text-gray-600">
                {lastActivity
                  ? utils_1.AuthUtils.Format.formatRelativeTime(lastActivity)
                  : "Unknown"}
              </p>
            </div>
          </div>

          {/* Connection Status */}
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div
                className={"w-3 h-3 rounded-full ".concat(
                  isConnected ? "bg-green-500" : "bg-gray-400",
                )}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Connection</p>
              <p className="text-sm text-gray-600">{isConnected ? "Connected" : "Disconnected"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Risk Score */}
      {showRiskScore && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <lucide_react_1.Shield className="w-5 h-5" style={{ color: riskLevel.color }} />
              <span className="text-sm font-medium text-gray-900">Security Risk</span>
            </div>
            <span className="text-sm font-semibold" style={{ color: riskLevel.color }}>
              {riskLevel.description}
            </span>
          </div>

          {/* Risk Score Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: "".concat(riskScore, "%"),
                backgroundColor: riskLevel.color,
              }}
            />
          </div>

          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
            <span>Critical</span>
          </div>
        </div>
      )}

      {/* Device Information */}
      {showDeviceInfo && currentDevice && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Current Device</h4>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">{getDeviceIcon()}</div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {utils_1.AuthUtils.Format.formatDeviceName({
                  userAgent: currentDevice.user_agent,
                  platform: currentDevice.platform,
                  screenWidth: currentDevice.screen_width,
                  screenHeight: currentDevice.screen_height,
                  timezone: currentDevice.timezone,
                  language: currentDevice.language,
                })}
              </p>

              <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                {currentDevice.location && (
                  <div className="flex items-center space-x-1">
                    <lucide_react_1.MapPin className="w-3 h-3" />
                    <span>
                      {currentDevice.location.city}, {currentDevice.location.country}
                    </span>
                  </div>
                )}

                <div className="flex items-center space-x-1">
                  <span
                    className={"w-2 h-2 rounded-full ".concat(
                      currentDevice.is_trusted ? "bg-green-500" : "bg-yellow-500",
                    )}
                  />
                  <span>{currentDevice.is_trusted ? "Trusted" : "Untrusted"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warning for expiring session */}
      {timeUntilExpiry < 15 * 60 * 1000 && timeUntilExpiry > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center space-x-2">
            <lucide_react_1.AlertTriangle className="w-4 h-4 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              Your session will expire in {formatTimeUntilExpiry(timeUntilExpiry)}. Activity will
              extend your session automatically.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
exports.default = SessionStatus;
