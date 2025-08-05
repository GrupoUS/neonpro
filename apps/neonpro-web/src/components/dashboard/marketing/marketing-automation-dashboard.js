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
exports.MarketingAutomationDashboard = MarketingAutomationDashboard;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var badge_1 = require("@/components/ui/badge");
var alert_1 = require("@/components/ui/alert");
var select_1 = require("@/components/ui/select");
var dialog_1 = require("@/components/ui/dialog");
var table_1 = require("@/components/ui/table");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var CAMPAIGN_TYPES = [
  {
    value: "email",
    label: "Email Campaign",
    description: "Send targeted email campaigns to your audience",
    icon: lucide_react_1.Send,
  },
  {
    value: "social_post",
    label: "Social Media Post",
    description: "Schedule and publish content across social platforms",
    icon: lucide_react_1.Target,
  },
  {
    value: "whatsapp_broadcast",
    label: "WhatsApp Broadcast",
    description: "Send bulk messages via WhatsApp Business",
    icon: lucide_react_1.Send,
  },
  {
    value: "lead_nurture",
    label: "Lead Nurturing",
    description: "Automated sequence to convert leads to customers",
    icon: lucide_react_1.Users,
  },
  {
    value: "abandoned_cart",
    label: "Abandoned Cart Recovery",
    description: "Re-engage customers who left items in their cart",
    icon: lucide_react_1.AlertTriangle,
  },
];
function MarketingAutomationDashboard() {
  var _a;
  var _b = (0, react_1.useState)([]),
    campaigns = _b[0],
    setCampaigns = _b[1];
  var _c = (0, react_1.useState)([]),
    templates = _c[0],
    setTemplates = _c[1];
  var _d = (0, react_1.useState)([]),
    triggers = _d[0],
    setTriggers = _d[1];
  var _e = (0, react_1.useState)(true),
    loading = _e[0],
    setLoading = _e[1];
  var _f = (0, react_1.useState)(false),
    showCreateDialog = _f[0],
    setShowCreateDialog = _f[1];
  var _g = (0, react_1.useState)(null),
    selectedCampaign = _g[0],
    setSelectedCampaign = _g[1];
  var _h = (0, react_1.useState)({}),
    editingCampaign = _h[0],
    setEditingCampaign = _h[1];
  (0, react_1.useEffect)(() => {
    loadCampaigns();
    loadTemplates();
    loadTriggers();
  }, []);
  var loadCampaigns = () =>
    __awaiter(this, void 0, void 0, function () {
      var response, data, error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, 5, 6]);
            return [4 /*yield*/, fetch("/api/marketing/campaigns")];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setCampaigns(data.campaigns || []);
            _a.label = 3;
          case 3:
            return [3 /*break*/, 6];
          case 4:
            error_1 = _a.sent();
            console.error("Failed to load campaigns:", error_1);
            sonner_1.toast.error("Failed to load campaign data");
            return [3 /*break*/, 6];
          case 5:
            setLoading(false);
            return [7 /*endfinally*/];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  var loadTemplates = () =>
    __awaiter(this, void 0, void 0, function () {
      var response, data, error_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, fetch("/api/marketing/campaigns/templates")];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setTemplates(data.templates || []);
            _a.label = 3;
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_2 = _a.sent();
            console.error("Failed to load templates:", error_2);
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var loadTriggers = () =>
    __awaiter(this, void 0, void 0, function () {
      var response, data, error_3;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, fetch("/api/marketing/automation/triggers")];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setTriggers(data.triggers || []);
            _a.label = 3;
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_3 = _a.sent();
            console.error("Failed to load triggers:", error_3);
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var createCampaign = () =>
    __awaiter(this, void 0, void 0, function () {
      var response, error_4;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              fetch("/api/marketing/campaigns", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editingCampaign),
              }),
            ];
          case 1:
            response = _a.sent();
            if (response.ok) {
              sonner_1.toast.success("Campaign created successfully");
              loadCampaigns();
              setShowCreateDialog(false);
              setEditingCampaign({});
            } else {
              throw new Error("Failed to create campaign");
            }
            return [3 /*break*/, 3];
          case 2:
            error_4 = _a.sent();
            console.error("Create campaign failed:", error_4);
            sonner_1.toast.error("Failed to create campaign");
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  var updateCampaign = (campaignId, updates) =>
    __awaiter(this, void 0, void 0, function () {
      var response, error_5;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              fetch("/api/marketing/campaigns/".concat(campaignId), {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
              }),
            ];
          case 1:
            response = _a.sent();
            if (response.ok) {
              sonner_1.toast.success("Campaign updated successfully");
              loadCampaigns();
            } else {
              throw new Error("Failed to update campaign");
            }
            return [3 /*break*/, 3];
          case 2:
            error_5 = _a.sent();
            console.error("Update campaign failed:", error_5);
            sonner_1.toast.error("Failed to update campaign");
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  var deleteCampaign = (campaignId) =>
    __awaiter(this, void 0, void 0, function () {
      var response, error_6;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              fetch("/api/marketing/campaigns/".concat(campaignId), {
                method: "DELETE",
              }),
            ];
          case 1:
            response = _a.sent();
            if (response.ok) {
              sonner_1.toast.success("Campaign deleted successfully");
              loadCampaigns();
            } else {
              throw new Error("Failed to delete campaign");
            }
            return [3 /*break*/, 3];
          case 2:
            error_6 = _a.sent();
            console.error("Delete campaign failed:", error_6);
            sonner_1.toast.error("Failed to delete campaign");
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  var runCampaign = (campaignId) =>
    __awaiter(this, void 0, void 0, function () {
      var response, error_7;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              fetch("/api/marketing/campaigns/".concat(campaignId, "/run"), {
                method: "POST",
              }),
            ];
          case 1:
            response = _a.sent();
            if (response.ok) {
              sonner_1.toast.success("Campaign started successfully");
              loadCampaigns();
            } else {
              throw new Error("Failed to start campaign");
            }
            return [3 /*break*/, 3];
          case 2:
            error_7 = _a.sent();
            console.error("Run campaign failed:", error_7);
            sonner_1.toast.error("Failed to start campaign");
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  var pauseCampaign = (campaignId) =>
    __awaiter(this, void 0, void 0, function () {
      var response, error_8;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              fetch("/api/marketing/campaigns/".concat(campaignId, "/pause"), {
                method: "POST",
              }),
            ];
          case 1:
            response = _a.sent();
            if (response.ok) {
              sonner_1.toast.success("Campaign paused successfully");
              loadCampaigns();
            } else {
              throw new Error("Failed to pause campaign");
            }
            return [3 /*break*/, 3];
          case 2:
            error_8 = _a.sent();
            console.error("Pause campaign failed:", error_8);
            sonner_1.toast.error("Failed to pause campaign");
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  var getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <badge_1.Badge className="bg-green-100 text-green-800">
            <lucide_react_1.Play className="w-3 h-3 mr-1" />
            Active
          </badge_1.Badge>
        );
      case "paused":
        return (
          <badge_1.Badge className="bg-yellow-100 text-yellow-800">
            <lucide_react_1.Pause className="w-3 h-3 mr-1" />
            Paused
          </badge_1.Badge>
        );
      case "completed":
        return (
          <badge_1.Badge className="bg-blue-100 text-blue-800">
            <lucide_react_1.CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </badge_1.Badge>
        );
      case "archived":
        return <badge_1.Badge variant="secondary">Archived</badge_1.Badge>;
      default:
        return <badge_1.Badge variant="outline">Draft</badge_1.Badge>;
    }
  };
  var getCampaignTypeIcon = (type) => {
    var campaignType = CAMPAIGN_TYPES.find((t) => t.value === type);
    if (campaignType) {
      var Icon = campaignType.icon;
      return <Icon className="w-4 h-4" />;
    }
    return <lucide_react_1.Target className="w-4 h-4" />;
  };
  var getCampaignTypeName = (type) => {
    var campaignType = CAMPAIGN_TYPES.find((t) => t.value === type);
    return (campaignType === null || campaignType === void 0 ? void 0 : campaignType.label) || type;
  };
  var formatMetrics = (metrics) => {
    if (!metrics) return "No data";
    var openRate =
      metrics.total_sent > 0 ? ((metrics.opened / metrics.total_sent) * 100).toFixed(1) : "0";
    var clickRate =
      metrics.opened > 0 ? ((metrics.clicked / metrics.opened) * 100).toFixed(1) : "0";
    var conversionRate =
      metrics.total_sent > 0 ? ((metrics.converted / metrics.total_sent) * 100).toFixed(1) : "0";
    return ""
      .concat(openRate, "% open, ")
      .concat(clickRate, "% click, ")
      .concat(conversionRate, "% conversion");
  };
  var formatRevenue = (revenue) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(revenue);
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {__spreadArray([], Array(3), true).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Campaign Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                <p className="text-2xl font-bold">{campaigns.length}</p>
              </div>
              <lucide_react_1.Target className="w-8 h-8 text-gray-400" />
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {campaigns.filter((c) => c.status === "active").length}
                </p>
              </div>
              <lucide_react_1.Play className="w-8 h-8 text-green-400" />
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month Revenue</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatRevenue(
                    campaigns.reduce((sum, c) => {
                      var _a;
                      return (
                        sum +
                        (((_a = c.performance_metrics) === null || _a === void 0
                          ? void 0
                          : _a.revenue) || 0)
                      );
                    }, 0),
                  )}
                </p>
              </div>
              <lucide_react_1.BarChart3 className="w-8 h-8 text-blue-400" />
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Conversion</p>
                <p className="text-2xl font-bold">
                  {campaigns.length > 0
                    ? (
                        campaigns.reduce((sum, c) => {
                          var metrics = c.performance_metrics;
                          if (!metrics || metrics.total_sent === 0) return sum;
                          return sum + (metrics.converted / metrics.total_sent) * 100;
                        }, 0) /
                        campaigns.filter((c) => {
                          var _a;
                          return (_a = c.performance_metrics) === null || _a === void 0
                            ? void 0
                            : _a.total_sent;
                        }).length
                      ).toFixed(1)
                    : "0"}
                  %
                </p>
              </div>
              <lucide_react_1.Users className="w-8 h-8 text-purple-400" />
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Campaigns Table */}
      <card_1.Card>
        <card_1.CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <card_1.CardTitle>Marketing Campaigns</card_1.CardTitle>
              <card_1.CardDescription>
                Create and manage automated marketing campaigns
              </card_1.CardDescription>
            </div>

            <dialog_1.Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <dialog_1.DialogTrigger asChild>
                <button_1.Button>
                  <lucide_react_1.Plus className="w-4 h-4 mr-2" />
                  Create Campaign
                </button_1.Button>
              </dialog_1.DialogTrigger>
              <dialog_1.DialogContent className="max-w-2xl">
                <dialog_1.DialogHeader>
                  <dialog_1.DialogTitle>Create New Campaign</dialog_1.DialogTitle>
                  <dialog_1.DialogDescription>
                    Set up a new automated marketing campaign
                  </dialog_1.DialogDescription>
                </dialog_1.DialogHeader>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label_1.Label htmlFor="name">Campaign Name</label_1.Label>
                      <input_1.Input
                        id="name"
                        value={editingCampaign.name || ""}
                        onChange={(e) =>
                          setEditingCampaign((prev) =>
                            __assign(__assign({}, prev), { name: e.target.value }),
                          )
                        }
                        placeholder="Enter campaign name"
                      />
                    </div>

                    <div>
                      <label_1.Label htmlFor="type">Campaign Type</label_1.Label>
                      <select_1.Select
                        value={editingCampaign.type || ""}
                        onValueChange={(value) =>
                          setEditingCampaign((prev) =>
                            __assign(__assign({}, prev), { type: value }),
                          )
                        }
                      >
                        <select_1.SelectTrigger>
                          <select_1.SelectValue placeholder="Select campaign type" />
                        </select_1.SelectTrigger>
                        <select_1.SelectContent>
                          {CAMPAIGN_TYPES.map((type) => (
                            <select_1.SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center space-x-2">
                                <type.icon className="w-4 h-4" />
                                <span>{type.label}</span>
                              </div>
                            </select_1.SelectItem>
                          ))}
                        </select_1.SelectContent>
                      </select_1.Select>
                    </div>
                  </div>

                  <div>
                    <label_1.Label htmlFor="description">Description</label_1.Label>
                    <textarea_1.Textarea
                      id="description"
                      value={editingCampaign.description || ""}
                      onChange={(e) =>
                        setEditingCampaign((prev) =>
                          __assign(__assign({}, prev), { description: e.target.value }),
                        )
                      }
                      placeholder="Describe the campaign goals and strategy"
                      rows={3}
                    />
                  </div>

                  {editingCampaign.type && (
                    <alert_1.Alert>
                      <lucide_react_1.AlertTriangle className="w-4 h-4" />
                      <alert_1.AlertDescription>
                        {(_a = CAMPAIGN_TYPES.find((t) => t.value === editingCampaign.type)) ===
                          null || _a === void 0
                          ? void 0
                          : _a.description}
                      </alert_1.AlertDescription>
                    </alert_1.Alert>
                  )}
                </div>

                <dialog_1.DialogFooter>
                  <button_1.Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </button_1.Button>
                  <button_1.Button
                    onClick={createCampaign}
                    disabled={!editingCampaign.name || !editingCampaign.type}
                  >
                    Create Campaign
                  </button_1.Button>
                </dialog_1.DialogFooter>
              </dialog_1.DialogContent>
            </dialog_1.Dialog>
          </div>
        </card_1.CardHeader>

        <card_1.CardContent>
          <table_1.Table>
            <table_1.TableHeader>
              <table_1.TableRow>
                <table_1.TableHead>Campaign</table_1.TableHead>
                <table_1.TableHead>Type</table_1.TableHead>
                <table_1.TableHead>Status</table_1.TableHead>
                <table_1.TableHead>Performance</table_1.TableHead>
                <table_1.TableHead>Revenue</table_1.TableHead>
                <table_1.TableHead>Last Run</table_1.TableHead>
                <table_1.TableHead>Actions</table_1.TableHead>
              </table_1.TableRow>
            </table_1.TableHeader>
            <table_1.TableBody>
              {campaigns.map((campaign) => {
                var _a;
                return (
                  <table_1.TableRow key={campaign.id}>
                    <table_1.TableCell>
                      <div>
                        <p className="font-medium">{campaign.name}</p>
                        {campaign.description && (
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {campaign.description}
                          </p>
                        )}
                      </div>
                    </table_1.TableCell>

                    <table_1.TableCell>
                      <div className="flex items-center space-x-2">
                        {getCampaignTypeIcon(campaign.type)}
                        <span className="text-sm">{getCampaignTypeName(campaign.type)}</span>
                      </div>
                    </table_1.TableCell>

                    <table_1.TableCell>{getStatusBadge(campaign.status)}</table_1.TableCell>

                    <table_1.TableCell className="text-sm">
                      {formatMetrics(campaign.performance_metrics)}
                    </table_1.TableCell>

                    <table_1.TableCell className="text-sm font-medium">
                      {(
                        (_a = campaign.performance_metrics) === null || _a === void 0
                          ? void 0
                          : _a.revenue
                      )
                        ? formatRevenue(campaign.performance_metrics.revenue)
                        : "-"}
                    </table_1.TableCell>

                    <table_1.TableCell className="text-sm">
                      {campaign.last_run_at
                        ? new Date(campaign.last_run_at).toLocaleDateString()
                        : "Never"}
                    </table_1.TableCell>

                    <table_1.TableCell>
                      <div className="flex items-center space-x-2">
                        {campaign.status === "draft" || campaign.status === "paused"
                          ? <button_1.Button
                              variant="ghost"
                              size="sm"
                              onClick={() => runCampaign(campaign.id)}
                            >
                              <lucide_react_1.Play className="w-4 h-4" />
                            </button_1.Button>
                          : campaign.status === "active"
                            ? <button_1.Button
                                variant="ghost"
                                size="sm"
                                onClick={() => pauseCampaign(campaign.id)}
                              >
                                <lucide_react_1.Pause className="w-4 h-4" />
                              </button_1.Button>
                            : null}

                        <dropdown_menu_1.DropdownMenu>
                          <dropdown_menu_1.DropdownMenuTrigger asChild>
                            <button_1.Button variant="ghost" size="sm">
                              <lucide_react_1.MoreVertical className="w-4 h-4" />
                            </button_1.Button>
                          </dropdown_menu_1.DropdownMenuTrigger>
                          <dropdown_menu_1.DropdownMenuContent align="end">
                            <dropdown_menu_1.DropdownMenuItem>
                              <lucide_react_1.Edit className="w-4 h-4 mr-2" />
                              Edit Campaign
                            </dropdown_menu_1.DropdownMenuItem>
                            <dropdown_menu_1.DropdownMenuItem>
                              <lucide_react_1.BarChart3 className="w-4 h-4 mr-2" />
                              View Analytics
                            </dropdown_menu_1.DropdownMenuItem>
                            <dropdown_menu_1.DropdownMenuItem>
                              <lucide_react_1.Settings className="w-4 h-4 mr-2" />
                              Campaign Settings
                            </dropdown_menu_1.DropdownMenuItem>
                            <dropdown_menu_1.DropdownMenuItem
                              onClick={() => deleteCampaign(campaign.id)}
                              className="text-red-600"
                            >
                              <lucide_react_1.Trash2 className="w-4 h-4 mr-2" />
                              Delete Campaign
                            </dropdown_menu_1.DropdownMenuItem>
                          </dropdown_menu_1.DropdownMenuContent>
                        </dropdown_menu_1.DropdownMenu>
                      </div>
                    </table_1.TableCell>
                  </table_1.TableRow>
                );
              })}
            </table_1.TableBody>
          </table_1.Table>

          {campaigns.length === 0 && (
            <div className="text-center py-8">
              <lucide_react_1.Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No campaigns created yet</p>
              <p className="text-sm text-gray-500">
                Create your first marketing campaign to get started
              </p>
              <button_1.Button className="mt-4" onClick={() => setShowCreateDialog(true)}>
                <lucide_react_1.Plus className="w-4 h-4 mr-2" />
                Create Your First Campaign
              </button_1.Button>
            </div>
          )}
        </card_1.CardContent>
      </card_1.Card>
    </div>
  );
}
