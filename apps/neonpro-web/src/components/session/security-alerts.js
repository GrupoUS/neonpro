'use client';
"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var alert_1 = require("@/components/ui/alert");
var use_session_1 = require("@/hooks/use-session");
var lucide_react_1 = require("lucide-react");
var SecurityAlerts = function (_a) {
    var userId = _a.userId, _b = _a.className, className = _b === void 0 ? '' : _b;
    var _c = (0, use_session_1.useSessionSecurity)(userId), securityEvents = _c.securityEvents, suspiciousActivities = _c.suspiciousActivities, loading = _c.loading, error = _c.error, refreshSecurityData = _c.refreshSecurityData;
    var _d = (0, react_1.useState)(new Set()), dismissedAlerts = _d[0], setDismissedAlerts = _d[1];
    var _e = (0, react_1.useState)(false), showResolved = _e[0], setShowResolved = _e[1];
    // Filter active alerts
    var activeAlerts = __spreadArray(__spreadArray([], securityEvents.filter(function (event) {
        return !dismissedAlerts.has(event.id) &&
            (showResolved || !event.resolved) &&
            event.severity !== 'LOW';
    }), true), suspiciousActivities.filter(function (activity) {
        return !dismissedAlerts.has(activity.id) &&
            (showResolved || activity.status === 'PENDING');
    }), true).sort(function (a, b) {
        var aTime = new Date('created_at' in a ? a.created_at : a.detected_at).getTime();
        var bTime = new Date('created_at' in b ? b.created_at : b.detected_at).getTime();
        return bTime - aTime;
    });
    var getSeverityColor = function (severity) {
        switch (severity) {
            case 'CRITICAL': return 'destructive';
            case 'HIGH': return 'destructive';
            case 'MEDIUM': return 'default';
            case 'LOW': return 'secondary';
            default: return 'secondary';
        }
    };
    var getSeverityIcon = function (severity) {
        switch (severity) {
            case 'CRITICAL':
            case 'HIGH':
                return <lucide_react_1.AlertTriangle className="h-4 w-4"/>;
            case 'MEDIUM':
                return <lucide_react_1.Shield className="h-4 w-4"/>;
            default:
                return <lucide_react_1.Eye className="h-4 w-4"/>;
        }
    };
    var getEventIcon = function (eventType) {
        switch (eventType) {
            case 'DEVICE_REGISTERED':
            case 'DEVICE_TRUSTED':
            case 'DEVICE_UNTRUSTED':
                return <lucide_react_1.Smartphone className="h-4 w-4"/>;
            case 'IP_ADDRESS_CHANGED':
                return <lucide_react_1.MapPin className="h-4 w-4"/>;
            case 'SESSION_VALIDATION_FAILED':
            case 'SUSPICIOUS_ACTIVITY_DETECTED':
                return <lucide_react_1.AlertTriangle className="h-4 w-4"/>;
            default:
                return <lucide_react_1.Monitor className="h-4 w-4"/>;
        }
    };
    var dismissAlert = function (alertId) {
        setDismissedAlerts(function (prev) { return new Set(__spreadArray(__spreadArray([], prev, true), [alertId], false)); });
    };
    var formatTimeAgo = function (timestamp) {
        var now = new Date();
        var time = new Date(timestamp);
        var diffMs = now.getTime() - time.getTime();
        var diffMins = Math.floor(diffMs / 60000);
        var diffHours = Math.floor(diffMins / 60);
        var diffDays = Math.floor(diffHours / 24);
        if (diffMins < 1)
            return 'Just now';
        if (diffMins < 60)
            return "".concat(diffMins, "m ago");
        if (diffHours < 24)
            return "".concat(diffHours, "h ago");
        return "".concat(diffDays, "d ago");
    };
    if (loading) {
        return (<card_1.Card className={className}>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Shield className="h-5 w-5"/>
            Security Alerts
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(function (i) { return (<div key={i} className="h-16 bg-muted rounded"/>); })}
          </div>
        </card_1.CardContent>
      </card_1.Card>);
    }
    if (error) {
        return (<card_1.Card className={className}>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Shield className="h-5 w-5"/>
            Security Alerts
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <alert_1.Alert variant="destructive">
            <lucide_react_1.AlertTriangle className="h-4 w-4"/>
            <alert_1.AlertDescription>
              Failed to load security alerts: {error}
            </alert_1.AlertDescription>
          </alert_1.Alert>
        </card_1.CardContent>
      </card_1.Card>);
    }
    return (<card_1.Card className={className}>
      <card_1.CardHeader>
        <div className="flex items-center justify-between">
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Shield className="h-5 w-5"/>
            Security Alerts
            {activeAlerts.length > 0 && (<badge_1.Badge variant="destructive" className="ml-2">
                {activeAlerts.length}
              </badge_1.Badge>)}
          </card_1.CardTitle>
          <div className="flex items-center gap-2">
            <button_1.Button variant="outline" size="sm" onClick={function () { return setShowResolved(!showResolved); }}>
              {showResolved ? 'Hide Resolved' : 'Show Resolved'}
            </button_1.Button>
            <button_1.Button variant="outline" size="sm" onClick={refreshSecurityData}>
              Refresh
            </button_1.Button>
          </div>
        </div>
      </card_1.CardHeader>
      <card_1.CardContent>
        {activeAlerts.length === 0 ? (<div className="text-center py-8 text-muted-foreground">
            <lucide_react_1.CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500"/>
            <p className="text-lg font-medium">All Clear!</p>
            <p className="text-sm">No security alerts at this time.</p>
          </div>) : (<div className="space-y-3 max-h-96 overflow-y-auto">
            {activeAlerts.map(function (alert) {
                var isSecurityEvent = 'event_type' in alert;
                var severity = isSecurityEvent
                    ? alert.severity
                    : alert.risk_score > 70 ? 'HIGH' : alert.risk_score > 40 ? 'MEDIUM' : 'LOW';
                var timestamp = isSecurityEvent ? alert.created_at : alert.detected_at;
                var description = alert.description;
                var eventType = isSecurityEvent ? alert.event_type : alert.activity_type;
                return (<div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-shrink-0 mt-1">
                    {getSeverityIcon(severity)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <badge_1.Badge variant={getSeverityColor(severity)} className="text-xs">
                        {severity}
                      </badge_1.Badge>
                      {getEventIcon(eventType)}
                      <span className="text-sm font-medium truncate">
                        {eventType.replace(/_/g, ' ')}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <lucide_react_1.Clock className="h-3 w-3"/>
                        {formatTimeAgo(timestamp)}
                      </div>
                      
                      {alert.ip_address && (<div className="flex items-center gap-1">
                          <lucide_react_1.MapPin className="h-3 w-3"/>
                          {alert.ip_address}
                        </div>)}
                      
                      {!isSecurityEvent && 'risk_score' in alert && (<div className="flex items-center gap-1">
                          <lucide_react_1.Shield className="h-3 w-3"/>
                          Risk: {alert.risk_score}%
                        </div>)}
                    </div>
                  </div>
                  
                  <button_1.Button variant="ghost" size="sm" onClick={function () { return dismissAlert(alert.id); }} className="flex-shrink-0">
                    <lucide_react_1.X className="h-4 w-4"/>
                  </button_1.Button>
                </div>);
            })}
          </div>)}
      </card_1.CardContent>
    </card_1.Card>);
};
exports.default = SecurityAlerts;
