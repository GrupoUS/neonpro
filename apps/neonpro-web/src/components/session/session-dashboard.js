/**
 * Session Dashboard Component
 * Comprehensive session management interface with security monitoring
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
exports.SessionDashboard = SessionDashboard;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var alert_1 = require("@/components/ui/alert");
var tabs_1 = require("@/components/ui/tabs");
var progress_1 = require("@/components/ui/progress");
var separator_1 = require("@/components/ui/separator");
var dialog_1 = require("@/components/ui/dialog");
var table_1 = require("@/components/ui/table");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var lucide_react_1 = require("lucide-react");
var use_session_1 = require("@/hooks/use-session");
var session_1 = require("@/types/session");
var date_fns_1 = require("date-fns");
var sonner_1 = require("sonner");
function SessionDashboard(_a) {
    var _this = this;
    var className = _a.className;
    var _b = (0, use_session_1.useSession)(), session = _b.session, isLoading = _b.isLoading, error = _b.error, refresh = _b.refresh, terminate = _b.terminate, extend = _b.extend, getActiveSessions = _b.getActiveSessions, terminateSession = _b.terminateSession;
    var securityEvents = (0, use_session_1.useSessionSecurity)().securityEvents;
    var _c = (0, use_session_1.useDeviceManagement)(), devices = _c.devices, trustDevice = _c.trustDevice, revokeDevice = _c.revokeDevice;
    var _d = (0, react_1.useState)([]), activeSessions = _d[0], setActiveSessions = _d[1];
    var _e = (0, react_1.useState)(false), showSecurityDetails = _e[0], setShowSecurityDetails = _e[1];
    var _f = (0, react_1.useState)(null), selectedSession = _f[0], setSelectedSession = _f[1];
    var _g = (0, react_1.useState)(false), isRefreshing = _g[0], setIsRefreshing = _g[1];
    // Load active sessions
    var loadActiveSessions = function () { return __awaiter(_this, void 0, void 0, function () {
        var sessions, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setIsRefreshing(true);
                    return [4 /*yield*/, getActiveSessions()];
                case 1:
                    sessions = _a.sent();
                    setActiveSessions(sessions);
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _a.sent();
                    sonner_1.toast.error('Failed to load active sessions');
                    return [3 /*break*/, 4];
                case 3:
                    setIsRefreshing(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    (0, react_1.useEffect)(function () {
        if (session) {
            loadActiveSessions();
        }
    }, [session]);
    // Calculate session health score
    var calculateHealthScore = function (sessionData) {
        var score = 100;
        // Deduct points for security issues
        var recentEvents = securityEvents.filter(function (event) { return event.session_id === sessionData.id &&
            new Date(event.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000); });
        score -= recentEvents.length * 10;
        // Deduct points for old sessions
        var sessionAge = Date.now() - new Date(sessionData.created_at).getTime();
        var hoursOld = sessionAge / (1000 * 60 * 60);
        if (hoursOld > 24)
            score -= 20;
        if (hoursOld > 48)
            score -= 30;
        // Deduct points for suspicious activity
        if (sessionData.security_flags && sessionData.security_flags.length > 0) {
            score -= sessionData.security_flags.length * 15;
        }
        return Math.max(0, Math.min(100, score));
    };
    // Get device icon
    var getDeviceIcon = function (deviceType) {
        switch (deviceType) {
            case session_1.DeviceType.MOBILE:
                return <lucide_react_1.Smartphone className="h-4 w-4"/>;
            case session_1.DeviceType.TABLET:
                return <lucide_react_1.Smartphone className="h-4 w-4"/>;
            case session_1.DeviceType.DESKTOP:
                return <lucide_react_1.Monitor className="h-4 w-4"/>;
            default:
                return <lucide_react_1.Monitor className="h-4 w-4"/>;
        }
    };
    // Get security severity color
    var getSeverityColor = function (severity) {
        switch (severity) {
            case session_1.SecuritySeverity.LOW:
                return 'text-green-600 bg-green-100';
            case session_1.SecuritySeverity.MEDIUM:
                return 'text-yellow-600 bg-yellow-100';
            case session_1.SecuritySeverity.HIGH:
                return 'text-red-600 bg-red-100';
            case session_1.SecuritySeverity.CRITICAL:
                return 'text-red-800 bg-red-200';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };
    if (isLoading) {
        return (<div className="flex items-center justify-center p-8">
        <lucide_react_1.RefreshCw className="h-8 w-8 animate-spin"/>
        <span className="ml-2">Loading session data...</span>
      </div>);
    }
    if (error) {
        return (<alert_1.Alert className="m-4">
        <lucide_react_1.AlertTriangle className="h-4 w-4"/>
        <alert_1.AlertDescription>
          Failed to load session data: {error.message}
        </alert_1.AlertDescription>
      </alert_1.Alert>);
    }
    if (!session) {
        return (<alert_1.Alert className="m-4">
        <lucide_react_1.XCircle className="h-4 w-4"/>
        <alert_1.AlertDescription>
          No active session found. Please log in to continue.
        </alert_1.AlertDescription>
      </alert_1.Alert>);
    }
    var healthScore = calculateHealthScore(session);
    var timeUntilExpiry = new Date(session.expires_at).getTime() - Date.now();
    var minutesUntilExpiry = Math.floor(timeUntilExpiry / (1000 * 60));
    return (<div className={"space-y-6 ".concat(className)}>
      {/* Current Session Overview */}
      <card_1.Card>
        <card_1.CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Shield className="h-5 w-5"/>
                Current Session
              </card_1.CardTitle>
              <card_1.CardDescription>
                Session ID: {session.id}
              </card_1.CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <badge_1.Badge variant={healthScore >= 80 ? 'default' : healthScore >= 60 ? 'secondary' : 'destructive'}>
                Health: {healthScore}%
              </badge_1.Badge>
              <button_1.Button variant="outline" size="sm" onClick={refresh} disabled={isRefreshing}>
                <lucide_react_1.RefreshCw className={"h-4 w-4 ".concat(isRefreshing ? 'animate-spin' : '')}/>
              </button_1.Button>
            </div>
          </div>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Session Status */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <lucide_react_1.CheckCircle className="h-4 w-4 text-green-600"/>
                <span className="text-sm font-medium">Active</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Started {(0, date_fns_1.formatDistanceToNow)(new Date(session.created_at))} ago
              </p>
            </div>

            {/* Time Until Expiry */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <lucide_react_1.Clock className="h-4 w-4"/>
                <span className="text-sm font-medium">
                  {minutesUntilExpiry > 0 ? "".concat(minutesUntilExpiry, "m remaining") : 'Expired'}
                </span>
              </div>
              <progress_1.Progress value={Math.max(0, (minutesUntilExpiry / (session.timeout_minutes || 30)) * 100)} className="h-2"/>
            </div>

            {/* Device Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {getDeviceIcon(session.device_type)}
                <span className="text-sm font-medium">{session.device_name}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <lucide_react_1.MapPin className="h-3 w-3"/>
                {session.ip_address}
              </div>
            </div>
          </div>

          <separator_1.Separator />

          {/* Session Actions */}
          <div className="flex items-center gap-2">
            <button_1.Button variant="outline" size="sm" onClick={function () { return extend(30); }}>
              <lucide_react_1.Plus className="h-4 w-4 mr-1"/>
              Extend 30min
            </button_1.Button>
            <button_1.Button variant="outline" size="sm" onClick={function () { return extend(60); }}>
              <lucide_react_1.Plus className="h-4 w-4 mr-1"/>
              Extend 1hr
            </button_1.Button>
            <button_1.Button variant="destructive" size="sm" onClick={terminate}>
              <lucide_react_1.LogOut className="h-4 w-4 mr-1"/>
              End Session
            </button_1.Button>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Tabs for different views */}
      <tabs_1.Tabs defaultValue="sessions" className="space-y-4">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="sessions">Active Sessions</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="security">Security Events</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="devices">Trusted Devices</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        {/* Active Sessions Tab */}
        <tabs_1.TabsContent value="sessions" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <div className="flex items-center justify-between">
                <card_1.CardTitle>All Active Sessions</card_1.CardTitle>
                <button_1.Button variant="outline" size="sm" onClick={loadActiveSessions} disabled={isRefreshing}>
                  <lucide_react_1.RefreshCw className={"h-4 w-4 ".concat(isRefreshing ? 'animate-spin' : '')}/>
                </button_1.Button>
              </div>
            </card_1.CardHeader>
            <card_1.CardContent>
              <table_1.Table>
                <table_1.TableHeader>
                  <table_1.TableRow>
                    <table_1.TableHead>Device</table_1.TableHead>
                    <table_1.TableHead>Location</table_1.TableHead>
                    <table_1.TableHead>Started</table_1.TableHead>
                    <table_1.TableHead>Status</table_1.TableHead>
                    <table_1.TableHead>Actions</table_1.TableHead>
                  </table_1.TableRow>
                </table_1.TableHeader>
                <table_1.TableBody>
                  {activeSessions.map(function (activeSession) {
            var _a;
            return (<table_1.TableRow key={activeSession.id}>
                      <table_1.TableCell>
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(activeSession.device_type)}
                          <div>
                            <p className="font-medium">{activeSession.device_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(_a = activeSession.user_agent) === null || _a === void 0 ? void 0 : _a.split(' ')[0]}
                            </p>
                          </div>
                        </div>
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <div className="flex items-center gap-1">
                          <lucide_react_1.MapPin className="h-3 w-3"/>
                          <span className="text-sm">{activeSession.ip_address}</span>
                        </div>
                        {activeSession.location && (<p className="text-xs text-muted-foreground">
                            {activeSession.location}
                          </p>)}
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <div>
                          <p className="text-sm">
                            {(0, date_fns_1.format)(new Date(activeSession.created_at), 'MMM dd, HH:mm')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(0, date_fns_1.formatDistanceToNow)(new Date(activeSession.created_at))} ago
                          </p>
                        </div>
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <div className="flex items-center gap-2">
                          {activeSession.id === session.id ? (<badge_1.Badge variant="default">Current</badge_1.Badge>) : (<badge_1.Badge variant="secondary">Active</badge_1.Badge>)}
                          {activeSession.is_trusted && (<lucide_react_1.CheckCircle className="h-4 w-4 text-green-600"/>)}
                        </div>
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <dropdown_menu_1.DropdownMenu>
                          <dropdown_menu_1.DropdownMenuTrigger asChild>
                            <button_1.Button variant="ghost" size="sm">
                              <lucide_react_1.MoreVertical className="h-4 w-4"/>
                            </button_1.Button>
                          </dropdown_menu_1.DropdownMenuTrigger>
                          <dropdown_menu_1.DropdownMenuContent>
                            <dropdown_menu_1.DropdownMenuItem onClick={function () { return setSelectedSession(activeSession); }}>
                              <lucide_react_1.Eye className="h-4 w-4 mr-2"/>
                              View Details
                            </dropdown_menu_1.DropdownMenuItem>
                            {activeSession.id !== session.id && (<dropdown_menu_1.DropdownMenuItem onClick={function () { return terminateSession(activeSession.id); }} className="text-red-600">
                                <lucide_react_1.LogOut className="h-4 w-4 mr-2"/>
                                Terminate
                              </dropdown_menu_1.DropdownMenuItem>)}
                          </dropdown_menu_1.DropdownMenuContent>
                        </dropdown_menu_1.DropdownMenu>
                      </table_1.TableCell>
                    </table_1.TableRow>);
        })}
                </table_1.TableBody>
              </table_1.Table>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Security Events Tab */}
        <tabs_1.TabsContent value="security" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Recent Security Events</card_1.CardTitle>
              <card_1.CardDescription>
                Security events from the last 30 days
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-3">
                {securityEvents.slice(0, 10).map(function (event) { return (<div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <lucide_react_1.AlertTriangle className={"h-4 w-4 mt-0.5 ".concat(event.severity === session_1.SecuritySeverity.HIGH || event.severity === session_1.SecuritySeverity.CRITICAL
                ? 'text-red-600'
                : event.severity === session_1.SecuritySeverity.MEDIUM
                    ? 'text-yellow-600'
                    : 'text-blue-600')}/>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{event.event_type}</p>
                        <badge_1.Badge className={getSeverityColor(event.severity)}>
                          {event.severity}
                        </badge_1.Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {(0, date_fns_1.format)(new Date(event.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                      </p>
                    </div>
                  </div>); })}
                {securityEvents.length === 0 && (<div className="text-center py-8 text-muted-foreground">
                    <lucide_react_1.Shield className="h-8 w-8 mx-auto mb-2"/>
                    <p>No security events recorded</p>
                  </div>)}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Trusted Devices Tab */}
        <tabs_1.TabsContent value="devices" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Trusted Devices</card_1.CardTitle>
              <card_1.CardDescription>
                Manage devices that can access your account
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-3">
                {devices.map(function (device) { return (<div key={device.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getDeviceIcon(device.device_type)}
                      <div>
                        <p className="font-medium">{device.device_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Last seen: {(0, date_fns_1.formatDistanceToNow)(new Date(device.last_seen))} ago
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {device.is_trusted ? (<badge_1.Badge variant="default">Trusted</badge_1.Badge>) : (<badge_1.Badge variant="secondary">Pending</badge_1.Badge>)}
                      <dropdown_menu_1.DropdownMenu>
                        <dropdown_menu_1.DropdownMenuTrigger asChild>
                          <button_1.Button variant="ghost" size="sm">
                            <lucide_react_1.MoreVertical className="h-4 w-4"/>
                          </button_1.Button>
                        </dropdown_menu_1.DropdownMenuTrigger>
                        <dropdown_menu_1.DropdownMenuContent>
                          {!device.is_trusted && (<dropdown_menu_1.DropdownMenuItem onClick={function () { return trustDevice(device.id); }}>
                              <lucide_react_1.CheckCircle className="h-4 w-4 mr-2"/>
                              Trust Device
                            </dropdown_menu_1.DropdownMenuItem>)}
                          <dropdown_menu_1.DropdownMenuItem onClick={function () { return revokeDevice(device.id); }} className="text-red-600">
                            <lucide_react_1.XCircle className="h-4 w-4 mr-2"/>
                            Revoke Access
                          </dropdown_menu_1.DropdownMenuItem>
                        </dropdown_menu_1.DropdownMenuContent>
                      </dropdown_menu_1.DropdownMenu>
                    </div>
                  </div>); })}
                {devices.length === 0 && (<div className="text-center py-8 text-muted-foreground">
                    <lucide_react_1.Smartphone className="h-8 w-8 mx-auto mb-2"/>
                    <p>No trusted devices found</p>
                  </div>)}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>

      {/* Session Details Dialog */}
      {selectedSession && (<dialog_1.Dialog open={!!selectedSession} onOpenChange={function () { return setSelectedSession(null); }}>
          <dialog_1.DialogContent className="max-w-2xl">
            <dialog_1.DialogHeader>
              <dialog_1.DialogTitle>Session Details</dialog_1.DialogTitle>
              <dialog_1.DialogDescription>
                Detailed information about session {selectedSession.id}
              </dialog_1.DialogDescription>
            </dialog_1.DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Session ID</label>
                  <p className="text-sm text-muted-foreground">{selectedSession.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">User ID</label>
                  <p className="text-sm text-muted-foreground">{selectedSession.user_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Device</label>
                  <p className="text-sm text-muted-foreground">{selectedSession.device_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">IP Address</label>
                  <p className="text-sm text-muted-foreground">{selectedSession.ip_address}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Created</label>
                  <p className="text-sm text-muted-foreground">
                    {(0, date_fns_1.format)(new Date(selectedSession.created_at), 'MMM dd, yyyy HH:mm:ss')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Expires</label>
                  <p className="text-sm text-muted-foreground">
                    {(0, date_fns_1.format)(new Date(selectedSession.expires_at), 'MMM dd, yyyy HH:mm:ss')}
                  </p>
                </div>
              </div>
              {selectedSession.user_agent && (<div>
                  <label className="text-sm font-medium">User Agent</label>
                  <p className="text-sm text-muted-foreground break-all">
                    {selectedSession.user_agent}
                  </p>
                </div>)}
            </div>
          </dialog_1.DialogContent>
        </dialog_1.Dialog>)}
    </div>);
}
