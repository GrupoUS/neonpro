// =====================================================
// SessionStatus Component - Session Information Display
// Story 1.4: Session Management & Security
// =====================================================
"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionStatus = SessionStatus;
var react_1 = require("react");
var auth_1 = require("@/hooks/auth");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var progress_1 = require("@/components/ui/progress");
var separator_1 = require("@/components/ui/separator");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
// =====================================================
// MAIN COMPONENT
// =====================================================
function SessionStatus(_a) {
  var className = _a.className,
    _b = _a.showExtendButton,
    showExtendButton = _b === void 0 ? true : _b,
    _c = _a.showLogoutButton,
    showLogoutButton = _c === void 0 ? true : _c,
    _d = _a.showSecurityScore,
    showSecurityScore = _d === void 0 ? true : _d,
    _e = _a.showTimeRemaining,
    showTimeRemaining = _e === void 0 ? true : _e,
    _f = _a.compact,
    compact = _f === void 0 ? false : _f;
  var _g = (0, auth_1.useSession)(),
    isAuthenticated = _g.isAuthenticated,
    user = _g.user,
    session = _g.session,
    isExpiringSoon = _g.isExpiringSoon,
    extendSession = _g.extendSession,
    logout = _g.logout;
  var timeRemainingFormatted = (0, auth_1.useSessionTimeout)().timeRemainingFormatted;
  var _h = (0, auth_1.useSecurityMonitoring)(),
    securityScore = _h.securityScore,
    securityStatus = _h.securityStatus,
    deviceRiskLevel = _h.deviceRiskLevel,
    isDeviceTrusted = _h.isDeviceTrusted;
  if (!isAuthenticated || !session) {
    return (
      <card_1.Card className={(0, utils_1.cn)("w-full", className)}>
        <card_1.CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <lucide_react_1.XCircle className="h-4 w-4" />
            <span className="text-sm">Not authenticated</span>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  var getSecurityColor = function (status) {
    switch (status) {
      case "secure":
        return "text-green-600";
      case "moderate":
        return "text-yellow-600";
      case "warning":
        return "text-orange-600";
      case "critical":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };
  var getSecurityBadgeVariant = function (status) {
    switch (status) {
      case "secure":
        return "default";
      case "moderate":
        return "secondary";
      case "warning":
        return "outline";
      case "critical":
        return "destructive";
      default:
        return "secondary";
    }
  };
  var getRiskColor = function (level) {
    switch (level) {
      case "low":
        return "text-green-600";
      case "medium":
        return "text-yellow-600";
      case "high":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };
  if (compact) {
    return (
      <div
        className={(0, utils_1.cn)(
          "flex items-center gap-4 p-2 rounded-lg border bg-card",
          className,
        )}
      >
        {/* User Info */}
        <div className="flex items-center gap-2">
          <div
            className={(0, utils_1.cn)(
              "h-2 w-2 rounded-full",
              isAuthenticated ? "bg-green-500" : "bg-red-500",
            )}
          />
          <span className="text-sm font-medium">
            {user === null || user === void 0 ? void 0 : user.email}
          </span>
        </div>

        {/* Time Remaining */}
        {showTimeRemaining && timeRemainingFormatted && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <lucide_react_1.Clock className="h-3 w-3" />
            <span>
              {timeRemainingFormatted.minutes}m {timeRemainingFormatted.seconds}s
            </span>
          </div>
        )}

        {/* Security Score */}
        {showSecurityScore && (
          <badge_1.Badge variant={getSecurityBadgeVariant(securityStatus)} className="text-xs">
            {securityScore}%
          </badge_1.Badge>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 ml-auto">
          {showExtendButton && isExpiringSoon && (
            <button_1.Button
              size="sm"
              variant="outline"
              onClick={extendSession}
              className="h-6 px-2 text-xs"
            >
              <lucide_react_1.RefreshCw className="h-3 w-3" />
            </button_1.Button>
          )}
          {showLogoutButton && (
            <button_1.Button
              size="sm"
              variant="ghost"
              onClick={logout}
              className="h-6 px-2 text-xs"
            >
              <lucide_react_1.LogOut className="h-3 w-3" />
            </button_1.Button>
          )}
        </div>
      </div>
    );
  }
  return (
    <card_1.Card className={(0, utils_1.cn)("w-full", className)}>
      <card_1.CardHeader className="pb-3">
        <card_1.CardTitle className="flex items-center gap-2 text-lg">
          <lucide_react_1.Shield className="h-5 w-5" />
          Session Status
          <badge_1.Badge variant={getSecurityBadgeVariant(securityStatus)} className="ml-auto">
            {securityStatus.toUpperCase()}
          </badge_1.Badge>
        </card_1.CardTitle>
      </card_1.CardHeader>

      <card_1.CardContent className="space-y-4">
        {/* User Information */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">User</span>
            <span className="text-sm text-muted-foreground">
              {user === null || user === void 0 ? void 0 : user.email}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Session ID</span>
            <span className="text-xs text-muted-foreground font-mono">
              {session.sessionId.slice(0, 8)}...
            </span>
          </div>
        </div>

        <separator_1.Separator />

        {/* Time Information */}
        {showTimeRemaining && timeRemainingFormatted && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <lucide_react_1.Clock className="h-4 w-4" />
                Time Remaining
              </span>
              <span
                className={(0, utils_1.cn)(
                  "text-sm font-mono",
                  isExpiringSoon ? "text-orange-600" : "text-muted-foreground",
                )}
              >
                {timeRemainingFormatted.minutes}m {timeRemainingFormatted.seconds}s
              </span>
            </div>

            {isExpiringSoon && (
              <div className="flex items-center gap-2 p-2 rounded-md bg-orange-50 border border-orange-200">
                <lucide_react_1.AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-orange-800">Session expiring soon</span>
              </div>
            )}
          </div>
        )}

        {/* Security Information */}
        {showSecurityScore && (
          <div className="space-y-3">
            <separator_1.Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Security Score</span>
                <span
                  className={(0, utils_1.cn)(
                    "text-sm font-semibold",
                    getSecurityColor(securityStatus),
                  )}
                >
                  {securityScore}%
                </span>
              </div>

              <progress_1.Progress value={securityScore} className="h-2" />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Device Trust</span>
              <div className="flex items-center gap-2">
                {isDeviceTrusted
                  ? <lucide_react_1.CheckCircle className="h-4 w-4 text-green-600" />
                  : <lucide_react_1.XCircle className="h-4 w-4 text-red-600" />}
                <span
                  className={(0, utils_1.cn)(
                    "text-sm",
                    isDeviceTrusted ? "text-green-600" : "text-red-600",
                  )}
                >
                  {isDeviceTrusted ? "Trusted" : "Untrusted"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Risk Level</span>
              <span
                className={(0, utils_1.cn)("text-sm font-medium", getRiskColor(deviceRiskLevel))}
              >
                {deviceRiskLevel.toUpperCase()}
              </span>
            </div>
          </div>
        )}

        {/* Session Activity */}
        <div className="space-y-2">
          <separator_1.Separator />

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-2">
              <lucide_react_1.Activity className="h-4 w-4" />
              Last Activity
            </span>
            <span className="text-sm text-muted-foreground">
              {session.lastActivity
                ? new Date(session.lastActivity).toLocaleTimeString()
                : "No activity"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Activities Count</span>
            <span className="text-sm text-muted-foreground">{session.activitiesCount || 0}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {showExtendButton && (
            <button_1.Button variant="outline" size="sm" onClick={extendSession} className="flex-1">
              <lucide_react_1.RefreshCw className="h-4 w-4 mr-2" />
              Extend Session
            </button_1.Button>
          )}

          {showLogoutButton && (
            <button_1.Button variant="outline" size="sm" onClick={logout} className="flex-1">
              <lucide_react_1.LogOut className="h-4 w-4 mr-2" />
              Logout
            </button_1.Button>
          )}
        </div>
      </card_1.CardContent>
    </card_1.Card>
  );
}
// =====================================================
// EXPORT DEFAULT
// =====================================================
exports.default = SessionStatus;
