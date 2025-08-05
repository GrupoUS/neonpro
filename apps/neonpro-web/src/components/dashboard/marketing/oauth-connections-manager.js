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
exports.OAuthConnectionsManager = OAuthConnectionsManager;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var switch_1 = require("@/components/ui/switch");
var separator_1 = require("@/components/ui/separator");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var dialog_1 = require("@/components/ui/dialog");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var PLATFORM_CONFIGS = [
  {
    platform: "instagram",
    name: "Instagram Business",
    icon: lucide_react_1.Instagram,
    color: "bg-gradient-to-r from-purple-500 to-pink-500",
    description: "Connect your Instagram Business account for posts and analytics",
    features: ["Post Publishing", "Stories", "Analytics", "Comments Management"],
    requiredScopes: ["instagram_basic", "instagram_content_publish", "pages_show_list"],
  },
  {
    platform: "facebook",
    name: "Facebook Pages",
    icon: lucide_react_1.Facebook,
    color: "bg-blue-600",
    description: "Manage your Facebook business pages and engagement",
    features: ["Page Management", "Post Publishing", "Messages", "Insights"],
    requiredScopes: ["pages_manage_posts", "pages_read_engagement", "pages_messaging"],
  },
  {
    platform: "whatsapp",
    name: "WhatsApp Business",
    icon: lucide_react_1.MessageCircle,
    color: "bg-green-600",
    description: "Customer communication through WhatsApp Business API",
    features: ["Message Automation", "Customer Support", "Broadcast Lists", "Templates"],
    requiredScopes: ["whatsapp_business_management", "whatsapp_business_messaging"],
  },
  {
    platform: "hubspot",
    name: "HubSpot CRM",
    icon: lucide_react_1.Building2,
    color: "bg-orange-600",
    description: "Integrate with HubSpot for complete CRM synchronization",
    features: ["Contact Sync", "Deal Tracking", "Email Marketing", "Analytics"],
    requiredScopes: ["contacts", "content", "timeline", "automation"],
  },
];
function OAuthConnectionsManager() {
  var _a = (0, react_1.useState)([]),
    connections = _a[0],
    setConnections = _a[1];
  var _b = (0, react_1.useState)(null),
    stats = _b[0],
    setStats = _b[1];
  var _c = (0, react_1.useState)(true),
    loading = _c[0],
    setLoading = _c[1];
  var _d = (0, react_1.useState)(null),
    refreshing = _d[0],
    setRefreshing = _d[1];
  var _e = (0, react_1.useState)(null),
    selectedConnection = _e[0],
    setSelectedConnection = _e[1];
  var _f = (0, react_1.useState)(false),
    showDeleteDialog = _f[0],
    setShowDeleteDialog = _f[1];
  var _g = (0, react_1.useState)(null),
    connectingPlatform = _g[0],
    setConnectingPlatform = _g[1];
  (0, react_1.useEffect)(() => {
    loadConnections();
    loadStats();
  }, []);
  var loadConnections = () =>
    __awaiter(this, void 0, void 0, function () {
      var response, data, error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, 5, 6]);
            return [4 /*yield*/, fetch("/api/social-media/accounts")];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setConnections(data.accounts || []);
            _a.label = 3;
          case 3:
            return [3 /*break*/, 6];
          case 4:
            error_1 = _a.sent();
            console.error("Failed to load connections:", error_1);
            sonner_1.toast.error("Failed to load connection data");
            return [3 /*break*/, 6];
          case 5:
            setLoading(false);
            return [7 /*endfinally*/];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  var loadStats = () =>
    __awaiter(this, void 0, void 0, function () {
      var response, data, error_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, fetch("/api/social-media/accounts?stats=true")];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setStats(data.stats);
            _a.label = 3;
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_2 = _a.sent();
            console.error("Failed to load stats:", error_2);
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var initiateOAuthFlow = (platform) =>
    __awaiter(this, void 0, void 0, function () {
      var response, data, error_3;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            setConnectingPlatform(platform);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 6, 7, 8]);
            return [
              4 /*yield*/,
              fetch("/api/oauth/".concat(platform, "/auth"), {
                method: "POST",
              }),
            ];
          case 2:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 4];
            return [4 /*yield*/, response.json()];
          case 3:
            data = _a.sent();
            window.location.href = data.authUrl;
            return [3 /*break*/, 5];
          case 4:
            throw new Error("Failed to initiate OAuth flow");
          case 5:
            return [3 /*break*/, 8];
          case 6:
            error_3 = _a.sent();
            console.error("OAuth initiation failed:", error_3);
            sonner_1.toast.error("Failed to connect to ".concat(platform));
            return [3 /*break*/, 8];
          case 7:
            setConnectingPlatform(null);
            return [7 /*endfinally*/];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  var refreshConnection = (connectionId, platform) =>
    __awaiter(this, void 0, void 0, function () {
      var response, error_4;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            setRefreshing(connectionId);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            return [
              4 /*yield*/,
              fetch("/api/oauth/".concat(platform, "/refresh"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ connectionId: connectionId }),
              }),
            ];
          case 2:
            response = _a.sent();
            if (response.ok) {
              sonner_1.toast.success("Connection refreshed successfully");
              loadConnections();
            } else {
              throw new Error("Failed to refresh connection");
            }
            return [3 /*break*/, 5];
          case 3:
            error_4 = _a.sent();
            console.error("Connection refresh failed:", error_4);
            sonner_1.toast.error("Failed to refresh connection");
            return [3 /*break*/, 5];
          case 4:
            setRefreshing(null);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var toggleSync = (connectionId, enabled) =>
    __awaiter(this, void 0, void 0, function () {
      var response, error_5;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              fetch("/api/social-media/accounts/".concat(connectionId), {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sync_enabled: enabled }),
              }),
            ];
          case 1:
            response = _a.sent();
            if (response.ok) {
              setConnections((prev) =>
                prev.map((conn) =>
                  conn.id === connectionId
                    ? __assign(__assign({}, conn), { sync_enabled: enabled })
                    : conn,
                ),
              );
              sonner_1.toast.success(
                "Sync ".concat(enabled ? "enabled" : "disabled", " successfully"),
              );
            } else {
              throw new Error("Failed to update sync setting");
            }
            return [3 /*break*/, 3];
          case 2:
            error_5 = _a.sent();
            console.error("Toggle sync failed:", error_5);
            sonner_1.toast.error("Failed to update sync setting");
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  var deleteConnection = () =>
    __awaiter(this, void 0, void 0, function () {
      var response, error_6;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            if (!selectedConnection) return [2 /*return*/];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            return [
              4 /*yield*/,
              fetch(
                "/api/oauth/"
                  .concat(selectedConnection.platform, "/")
                  .concat(selectedConnection.id),
                {
                  method: "DELETE",
                },
              ),
            ];
          case 2:
            response = _a.sent();
            if (response.ok) {
              sonner_1.toast.success("Connection removed successfully");
              loadConnections();
              loadStats();
            } else {
              throw new Error("Failed to delete connection");
            }
            return [3 /*break*/, 5];
          case 3:
            error_6 = _a.sent();
            console.error("Delete connection failed:", error_6);
            sonner_1.toast.error("Failed to remove connection");
            return [3 /*break*/, 5];
          case 4:
            setShowDeleteDialog(false);
            setSelectedConnection(null);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <badge_1.Badge variant="default" className="bg-green-100 text-green-800">
            <lucide_react_1.CheckCircle className="w-3 h-3 mr-1" />
            Active
          </badge_1.Badge>
        );
      case "needs_reauth":
        return (
          <badge_1.Badge variant="destructive" className="bg-yellow-100 text-yellow-800">
            <lucide_react_1.AlertTriangle className="w-3 h-3 mr-1" />
            Needs Reauth
          </badge_1.Badge>
        );
      case "error":
        return (
          <badge_1.Badge variant="destructive">
            <lucide_react_1.XCircle className="w-3 h-3 mr-1" />
            Error
          </badge_1.Badge>
        );
      default:
        return <badge_1.Badge variant="secondary">Inactive</badge_1.Badge>;
    }
  };
  var getTokenExpirationStatus = (expiresAt) => {
    if (!expiresAt) return null;
    var now = new Date();
    var expiration = new Date(expiresAt);
    var hoursUntilExpiration = (expiration.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursUntilExpiration < 24) {
      return (
        <div className="text-sm text-yellow-600">
          <lucide_react_1.AlertTriangle className="w-4 h-4 inline mr-1" />
          Expires in {Math.round(hoursUntilExpiration)} hours
        </div>
      );
    }
    var daysUntilExpiration = Math.round(hoursUntilExpiration / 24);
    return <div className="text-sm text-gray-500">Expires in {daysUntilExpiration} days</div>;
  };
  var getPlatformConfig = (platform) =>
    PLATFORM_CONFIGS.find((config) => config.platform === platform);
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {__spreadArray([], Array(4), true).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <card_1.Card>
            <card_1.CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Connections</p>
                  <p className="text-2xl font-bold">{stats.total_connections}</p>
                </div>
                <lucide_react_1.Settings className="w-8 h-8 text-gray-400" />
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active_connections}</p>
                </div>
                <lucide_react_1.CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Needs Attention</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.needs_attention}</p>
                </div>
                <lucide_react_1.AlertTriangle className="w-8 h-8 text-yellow-400" />
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Recent Errors</p>
                  <p className="text-2xl font-bold text-red-600">{stats.last_sync_errors}</p>
                </div>
                <lucide_react_1.XCircle className="w-8 h-8 text-red-400" />
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </div>
      )}

      {/* Available Platforms */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Connect New Platform</card_1.CardTitle>
          <card_1.CardDescription>
            Add social media and marketing platforms to expand your reach
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLATFORM_CONFIGS.map((config) => {
              var isConnected = connections.some((conn) => conn.platform === config.platform);
              var Icon = config.icon;
              return (
                <card_1.Card
                  key={config.platform}
                  className={"relative overflow-hidden ".concat(
                    isConnected ? "opacity-50" : "hover:shadow-md",
                  )}
                >
                  <card_1.CardContent className="p-4">
                    <div
                      className={"w-12 h-12 rounded-lg ".concat(
                        config.color,
                        " flex items-center justify-center mb-3",
                      )}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{config.name}</h3>
                    <p className="text-xs text-gray-600 mb-3">{config.description}</p>

                    {isConnected
                      ? <badge_1.Badge variant="secondary" className="text-xs">
                          Connected
                        </badge_1.Badge>
                      : <button_1.Button
                          size="sm"
                          onClick={() => initiateOAuthFlow(config.platform)}
                          disabled={connectingPlatform === config.platform}
                          className="w-full"
                        >
                          {connectingPlatform === config.platform
                            ? <lucide_react_1.RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            : <lucide_react_1.ExternalLink className="w-4 h-4 mr-2" />}
                          Connect
                        </button_1.Button>}
                  </card_1.CardContent>
                </card_1.Card>
              );
            })}
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Connected Accounts */}
      {connections.length > 0 && (
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Connected Accounts</card_1.CardTitle>
            <card_1.CardDescription>
              Manage your connected social media and marketing accounts
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="space-y-4">
              {connections.map((connection) => {
                var config = getPlatformConfig(connection.platform);
                if (!config) return null;
                var Icon = config.icon;
                return (
                  <div
                    key={connection.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={"w-10 h-10 rounded-lg ".concat(
                          config.color,
                          " flex items-center justify-center",
                        )}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{connection.account_name}</h3>
                          {getStatusBadge(connection.status)}
                        </div>

                        {connection.account_username && (
                          <p className="text-sm text-gray-600">@{connection.account_username}</p>
                        )}

                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          {connection.last_sync_at && (
                            <span className="flex items-center">
                              <lucide_react_1.Calendar className="w-3 h-3 mr-1" />
                              Last sync: {new Date(connection.last_sync_at).toLocaleDateString()}
                            </span>
                          )}

                          {getTokenExpirationStatus(connection.token_expires_at)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Sync</span>
                        <switch_1.Switch
                          checked={connection.sync_enabled}
                          onCheckedChange={(enabled) => toggleSync(connection.id, enabled)}
                        />
                      </div>

                      <dropdown_menu_1.DropdownMenu>
                        <dropdown_menu_1.DropdownMenuTrigger asChild>
                          <button_1.Button variant="ghost" size="sm">
                            <lucide_react_1.MoreVertical className="w-4 h-4" />
                          </button_1.Button>
                        </dropdown_menu_1.DropdownMenuTrigger>
                        <dropdown_menu_1.DropdownMenuContent align="end">
                          <dropdown_menu_1.DropdownMenuItem
                            onClick={() => refreshConnection(connection.id, connection.platform)}
                            disabled={refreshing === connection.id}
                          >
                            <lucide_react_1.RefreshCw
                              className={"w-4 h-4 mr-2 ".concat(
                                refreshing === connection.id ? "animate-spin" : "",
                              )}
                            />
                            Refresh Token
                          </dropdown_menu_1.DropdownMenuItem>
                          <dropdown_menu_1.DropdownMenuItem>
                            <lucide_react_1.BarChart3 className="w-4 h-4 mr-2" />
                            View Analytics
                          </dropdown_menu_1.DropdownMenuItem>
                          <dropdown_menu_1.DropdownMenuItem>
                            <lucide_react_1.Settings className="w-4 h-4 mr-2" />
                            Settings
                          </dropdown_menu_1.DropdownMenuItem>
                          <separator_1.Separator />
                          <dropdown_menu_1.DropdownMenuItem
                            onClick={() => {
                              setSelectedConnection(connection);
                              setShowDeleteDialog(true);
                            }}
                            className="text-red-600"
                          >
                            <lucide_react_1.Trash2 className="w-4 h-4 mr-2" />
                            Remove Connection
                          </dropdown_menu_1.DropdownMenuItem>
                        </dropdown_menu_1.DropdownMenuContent>
                      </dropdown_menu_1.DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          </card_1.CardContent>
        </card_1.Card>
      )}

      {/* Delete Confirmation Dialog */}
      <dialog_1.Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <dialog_1.DialogContent>
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>Remove Connection</dialog_1.DialogTitle>
            <dialog_1.DialogDescription>
              Are you sure you want to remove the connection to{" "}
              <strong>
                {selectedConnection === null || selectedConnection === void 0
                  ? void 0
                  : selectedConnection.account_name}
              </strong>
              ? This action cannot be undone.
            </dialog_1.DialogDescription>
          </dialog_1.DialogHeader>
          <dialog_1.DialogFooter>
            <button_1.Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </button_1.Button>
            <button_1.Button variant="destructive" onClick={deleteConnection}>
              Remove Connection
            </button_1.Button>
          </dialog_1.DialogFooter>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
    </div>
  );
}
