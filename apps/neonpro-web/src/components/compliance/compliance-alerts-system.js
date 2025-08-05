"use client";
"use strict";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
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
exports.default = ComplianceAlertsSystem;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var alert_1 = require("@/components/ui/alert");
var table_1 = require("@/components/ui/table");
var dialog_1 = require("@/components/ui/dialog");
var switch_1 = require("@/components/ui/switch");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
var auth_helpers_nextjs_1 = require("@supabase/auth-helpers-nextjs");
var use_toast_1 = require("@/hooks/use-toast");
function ComplianceAlertsSystem(_a) {
  var _this = this;
  var clinicId = _a.clinicId,
    userId = _a.userId;
  var _b = (0, react_1.useState)([]),
    alerts = _b[0],
    setAlerts = _b[1];
  var _c = (0, react_1.useState)({
      email_enabled: true,
      push_enabled: true,
      sms_enabled: false,
      real_time_enabled: true,
      severity_threshold: "medium",
      alert_types: ["consent_expiring", "consent_pending", "audit_required"],
    }),
    settings = _c[0],
    setSettings = _c[1];
  var _d = (0, react_1.useState)(true),
    loading = _d[0],
    setLoading = _d[1];
  var _e = (0, react_1.useState)("all"),
    selectedSeverity = _e[0],
    setSelectedSeverity = _e[1];
  var _f = (0, react_1.useState)("all"),
    selectedType = _f[0],
    setSelectedType = _f[1];
  var _g = (0, react_1.useState)(false),
    showResolved = _g[0],
    setShowResolved = _g[1];
  var supabase = (0, auth_helpers_nextjs_1.createClientComponentClient)();
  var toast = (0, use_toast_1.useToast)().toast;
  (0, react_1.useEffect)(
    function () {
      fetchAlerts();
      loadSettings();
      // Set up real-time subscription for new alerts
      var channel = supabase
        .channel("compliance_alerts")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "compliance_alerts",
            filter: "clinic_id=eq.".concat(clinicId),
          },
          function (payload) {
            var newAlert = payload.new;
            setAlerts(function (prev) {
              return __spreadArray([newAlert], prev, true);
            });
            // Show toast notification for high/critical alerts
            if (newAlert.severity === "high" || newAlert.severity === "critical") {
              toast({
                title: "🚨 Critical Compliance Alert",
                description: newAlert.title,
                variant: "destructive",
              });
            }
          },
        )
        .subscribe();
      return function () {
        supabase.removeChannel(channel);
      };
    },
    [clinicId, selectedSeverity, selectedType, showResolved],
  );
  var fetchAlerts = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var query, _a, data, error, error_1;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, 3, 4]);
            setLoading(true);
            query = supabase
              .from("compliance_alerts")
              .select("*")
              .eq("clinic_id", clinicId)
              .order("created_at", { ascending: false });
            if (!showResolved) {
              query = query.is("resolved_at", null);
            }
            if (selectedSeverity !== "all") {
              query = query.eq("severity", selectedSeverity);
            }
            if (selectedType !== "all") {
              query = query.eq("alert_type", selectedType);
            }
            return [4 /*yield*/, query.limit(100)];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Error fetching alerts:", error);
              toast({
                title: "Error",
                description: "Failed to fetch compliance alerts",
                variant: "destructive",
              });
              return [2 /*return*/];
            }
            setAlerts(data || []);
            return [3 /*break*/, 4];
          case 2:
            error_1 = _b.sent();
            console.error("Error:", error_1);
            toast({
              title: "Error",
              description: "An unexpected error occurred",
              variant: "destructive",
            });
            return [3 /*break*/, 4];
          case 3:
            setLoading(false);
            return [7 /*endfinally*/];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  var loadSettings = function () {
    // Load from localStorage or API
    var saved = localStorage.getItem("compliance_notifications_".concat(clinicId));
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  };
  var saveSettings = function (newSettings) {
    setSettings(newSettings);
    localStorage.setItem("compliance_notifications_".concat(clinicId), JSON.stringify(newSettings));
    toast({
      title: "Settings Saved",
      description: "Notification preferences updated successfully",
      variant: "default",
    });
  };
  var markAsRead = function (alertId) {
    return __awaiter(_this, void 0, void 0, function () {
      var error, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              supabase.from("compliance_alerts").update({ is_read: true }).eq("id", alertId),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              console.error("Error marking alert as read:", error);
              return [2 /*return*/];
            }
            setAlerts(function (prev) {
              return prev.map(function (alert) {
                return alert.id === alertId
                  ? __assign(__assign({}, alert), { is_read: true })
                  : alert;
              });
            });
            return [3 /*break*/, 3];
          case 2:
            error_2 = _a.sent();
            console.error("Error:", error_2);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  var resolveAlert = function (alertId) {
    return __awaiter(_this, void 0, void 0, function () {
      var error, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              supabase
                .from("compliance_alerts")
                .update({
                  resolved_at: new Date().toISOString(),
                  resolved_by: userId,
                })
                .eq("id", alertId),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              console.error("Error resolving alert:", error);
              toast({
                title: "Error",
                description: "Failed to resolve alert",
                variant: "destructive",
              });
              return [2 /*return*/];
            }
            setAlerts(function (prev) {
              return prev.filter(function (alert) {
                return alert.id !== alertId;
              });
            });
            toast({
              title: "Alert Resolved",
              description: "The alert has been marked as resolved",
              variant: "default",
            });
            return [3 /*break*/, 3];
          case 2:
            error_3 = _a.sent();
            console.error("Error:", error_3);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  var deleteAlert = function (alertId) {
    return __awaiter(_this, void 0, void 0, function () {
      var error, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, supabase.from("compliance_alerts").delete().eq("id", alertId)];
          case 1:
            error = _a.sent().error;
            if (error) {
              console.error("Error deleting alert:", error);
              toast({
                title: "Error",
                description: "Failed to delete alert",
                variant: "destructive",
              });
              return [2 /*return*/];
            }
            setAlerts(function (prev) {
              return prev.filter(function (alert) {
                return alert.id !== alertId;
              });
            });
            toast({
              title: "Alert Deleted",
              description: "The alert has been permanently deleted",
              variant: "default",
            });
            return [3 /*break*/, 3];
          case 2:
            error_4 = _a.sent();
            console.error("Error:", error_4);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  var getSeverityBadge = function (severity) {
    var variants = {
      low: "default",
      medium: "secondary",
      high: "destructive",
      critical: "destructive",
    };
    var colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800",
    };
    return (
      <badge_1.Badge variant={variants[severity]} className={colors[severity]}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </badge_1.Badge>
    );
  };
  var getAlertIcon = function (alertType) {
    switch (alertType) {
      case "consent_expiring":
      case "consent_pending":
        return <lucide_react_1.FileText className="h-4 w-4" />;
      case "audit_required":
        return <lucide_react_1.Shield className="h-4 w-4" />;
      case "regulatory_deadline":
        return <lucide_react_1.Calendar className="h-4 w-4" />;
      case "privacy_breach":
        return <lucide_react_1.AlertTriangle className="h-4 w-4" />;
      case "system_security":
        return <lucide_react_1.Shield className="h-4 w-4" />;
      default:
        return <lucide_react_1.Bell className="h-4 w-4" />;
    }
  };
  var formatDate = function (dateString) {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  var unreadCount = alerts.filter(function (alert) {
    return !alert.is_read;
  }).length;
  var criticalCount = alerts.filter(function (alert) {
    return alert.severity === "critical" && !alert.resolved_at;
  }).length;
  if (loading) {
    return (
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Compliance Alerts & Notifications</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  return (
    <div className="space-y-6">
      {/* Alert Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Unread Alerts</card_1.CardTitle>
            <lucide_react_1.BellRing className="h-4 w-4 text-blue-500" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{unreadCount}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Critical Alerts</card_1.CardTitle>
            <lucide_react_1.AlertTriangle
              className={"h-4 w-4 ".concat(criticalCount > 0 ? "text-red-500" : "text-green-500")}
            />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{criticalCount}</div>
            <p className="text-xs text-muted-foreground">Need immediate action</p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Total Alerts</card_1.CardTitle>
            <lucide_react_1.Bell className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
            <p className="text-xs text-muted-foreground">In current filter</p>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Controls */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Bell className="h-5 w-5" />
            Compliance Alerts & Notifications
          </card_1.CardTitle>
          <card_1.CardDescription>
            Monitor compliance issues, regulatory deadlines, and system alerts in real-time
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="flex gap-4 items-end mb-4">
            <div className="flex-1">
              <label_1.Label htmlFor="severity">Severity</label_1.Label>
              <select_1.Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                <select_1.SelectTrigger>
                  <select_1.SelectValue placeholder="Select severity" />
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
            <div className="flex-1">
              <label_1.Label htmlFor="type">Alert Type</label_1.Label>
              <select_1.Select value={selectedType} onValueChange={setSelectedType}>
                <select_1.SelectTrigger>
                  <select_1.SelectValue placeholder="Select type" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">All Types</select_1.SelectItem>
                  <select_1.SelectItem value="consent_expiring">
                    Consent Expiring
                  </select_1.SelectItem>
                  <select_1.SelectItem value="consent_pending">Consent Pending</select_1.SelectItem>
                  <select_1.SelectItem value="audit_required">Audit Required</select_1.SelectItem>
                  <select_1.SelectItem value="regulatory_deadline">
                    Regulatory Deadline
                  </select_1.SelectItem>
                  <select_1.SelectItem value="privacy_breach">Privacy Breach</select_1.SelectItem>
                  <select_1.SelectItem value="system_security">System Security</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>
            <div className="flex items-center space-x-2">
              <switch_1.Switch
                id="show-resolved"
                checked={showResolved}
                onCheckedChange={setShowResolved}
              />
              <label_1.Label htmlFor="show-resolved">Show Resolved</label_1.Label>
            </div>

            {/* Settings Dialog */}
            <dialog_1.Dialog>
              <dialog_1.DialogTrigger asChild>
                <button_1.Button variant="outline">
                  <lucide_react_1.Settings className="h-4 w-4 mr-2" />
                  Settings
                </button_1.Button>
              </dialog_1.DialogTrigger>
              <dialog_1.DialogContent>
                <dialog_1.DialogHeader>
                  <dialog_1.DialogTitle>Notification Settings</dialog_1.DialogTitle>
                  <dialog_1.DialogDescription>
                    Configure how you want to receive compliance alerts and notifications
                  </dialog_1.DialogDescription>
                </dialog_1.DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label_1.Label htmlFor="email-notifications">
                        Email Notifications
                      </label_1.Label>
                      <switch_1.Switch
                        id="email-notifications"
                        checked={settings.email_enabled}
                        onCheckedChange={function (checked) {
                          return saveSettings(
                            __assign(__assign({}, settings), { email_enabled: checked }),
                          );
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label_1.Label htmlFor="push-notifications">Push Notifications</label_1.Label>
                      <switch_1.Switch
                        id="push-notifications"
                        checked={settings.push_enabled}
                        onCheckedChange={function (checked) {
                          return saveSettings(
                            __assign(__assign({}, settings), { push_enabled: checked }),
                          );
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label_1.Label htmlFor="sms-notifications">SMS Notifications</label_1.Label>
                      <switch_1.Switch
                        id="sms-notifications"
                        checked={settings.sms_enabled}
                        onCheckedChange={function (checked) {
                          return saveSettings(
                            __assign(__assign({}, settings), { sms_enabled: checked }),
                          );
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label_1.Label htmlFor="real-time">Real-time Updates</label_1.Label>
                      <switch_1.Switch
                        id="real-time"
                        checked={settings.real_time_enabled}
                        onCheckedChange={function (checked) {
                          return saveSettings(
                            __assign(__assign({}, settings), { real_time_enabled: checked }),
                          );
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label_1.Label htmlFor="severity-threshold">Minimum Severity</label_1.Label>
                    <select_1.Select
                      value={settings.severity_threshold}
                      onValueChange={function (value) {
                        return saveSettings(
                          __assign(__assign({}, settings), { severity_threshold: value }),
                        );
                      }}
                    >
                      <select_1.SelectTrigger>
                        <select_1.SelectValue />
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        <select_1.SelectItem value="low">Low and above</select_1.SelectItem>
                        <select_1.SelectItem value="medium">Medium and above</select_1.SelectItem>
                        <select_1.SelectItem value="high">High and above</select_1.SelectItem>
                        <select_1.SelectItem value="critical">Critical only</select_1.SelectItem>
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>
                </div>
                <dialog_1.DialogFooter>
                  <button_1.Button onClick={function () {}}>Save Settings</button_1.Button>
                </dialog_1.DialogFooter>
              </dialog_1.DialogContent>
            </dialog_1.Dialog>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Alerts List */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Filter className="h-4 w-4" />
            Active Alerts
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          {alerts.length === 0
            ? <alert_1.Alert>
                <lucide_react_1.CheckCircle className="h-4 w-4" />
                <alert_1.AlertDescription>
                  No compliance alerts found. Your system is up to date!
                </alert_1.AlertDescription>
              </alert_1.Alert>
            : <table_1.Table>
                <table_1.TableHeader>
                  <table_1.TableRow>
                    <table_1.TableHead>Alert</table_1.TableHead>
                    <table_1.TableHead>Type</table_1.TableHead>
                    <table_1.TableHead>Severity</table_1.TableHead>
                    <table_1.TableHead>Created</table_1.TableHead>
                    <table_1.TableHead>Status</table_1.TableHead>
                    <table_1.TableHead>Actions</table_1.TableHead>
                  </table_1.TableRow>
                </table_1.TableHeader>
                <table_1.TableBody>
                  {alerts.map(function (alert) {
                    return (
                      <table_1.TableRow
                        key={alert.id}
                        className={!alert.is_read ? "bg-blue-50 dark:bg-blue-950/20" : ""}
                      >
                        <table_1.TableCell>
                          <div className="flex items-start gap-3">
                            {getAlertIcon(alert.alert_type)}
                            <div>
                              <div className="font-medium">{alert.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {alert.description}
                              </div>
                            </div>
                          </div>
                        </table_1.TableCell>
                        <table_1.TableCell>
                          <badge_1.Badge variant="outline" className="capitalize">
                            {alert.alert_type.replace("_", " ")}
                          </badge_1.Badge>
                        </table_1.TableCell>
                        <table_1.TableCell>{getSeverityBadge(alert.severity)}</table_1.TableCell>
                        <table_1.TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <lucide_react_1.Clock className="h-3 w-3" />
                            {formatDate(alert.created_at)}
                          </div>
                        </table_1.TableCell>
                        <table_1.TableCell>
                          <div className="flex items-center gap-2">
                            {!alert.is_read && (
                              <badge_1.Badge variant="default" className="text-xs">
                                Unread
                              </badge_1.Badge>
                            )}
                            {alert.resolved_at && (
                              <badge_1.Badge variant="outline" className="text-xs">
                                Resolved
                              </badge_1.Badge>
                            )}
                          </div>
                        </table_1.TableCell>
                        <table_1.TableCell>
                          <div className="flex items-center gap-2">
                            {!alert.is_read && (
                              <button_1.Button
                                variant="ghost"
                                size="sm"
                                onClick={function () {
                                  return markAsRead(alert.id);
                                }}
                              >
                                <lucide_react_1.Eye className="h-4 w-4" />
                              </button_1.Button>
                            )}
                            {!alert.resolved_at && (
                              <button_1.Button
                                variant="ghost"
                                size="sm"
                                onClick={function () {
                                  return resolveAlert(alert.id);
                                }}
                              >
                                <lucide_react_1.CheckCircle className="h-4 w-4" />
                              </button_1.Button>
                            )}
                            <button_1.Button
                              variant="ghost"
                              size="sm"
                              onClick={function () {
                                return deleteAlert(alert.id);
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <lucide_react_1.Trash2 className="h-4 w-4" />
                            </button_1.Button>
                          </div>
                        </table_1.TableCell>
                      </table_1.TableRow>
                    );
                  })}
                </table_1.TableBody>
              </table_1.Table>}
        </card_1.CardContent>
      </card_1.Card>
    </div>
  );
}
