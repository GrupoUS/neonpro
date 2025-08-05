// Story 11.2: No-Show Prediction Interventions Component
// Manage and track intervention strategies
"use client";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NoShowPredictionInterventions;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var select_1 = require("@/components/ui/select");
var icons_1 = require("@/components/ui/icons");
var use_toast_1 = require("@/hooks/use-toast");
var dialog_1 = require("@/components/ui/dialog");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
function NoShowPredictionInterventions() {
  var _a = (0, react_1.useState)([]),
    interventions = _a[0],
    setInterventions = _a[1];
  var _b = (0, react_1.useState)(true),
    loading = _b[0],
    setLoading = _b[1];
  var _c = (0, react_1.useState)("all"),
    filter = _c[0],
    setFilter = _c[1];
  var _d = (0, react_1.useState)(false),
    showCreateDialog = _d[0],
    setShowCreateDialog = _d[1];
  var toast = (0, use_toast_1.useToast)().toast;
  (0, react_1.useEffect)(() => {
    fetchInterventions();
  }, [filter]);
  var fetchInterventions = () =>
    __awaiter(this, void 0, void 0, function () {
      var params, response, data, error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, 4, 5]);
            setLoading(true);
            params = new URLSearchParams();
            if (filter !== "all") {
              params.append("status", filter);
            }
            return [4 /*yield*/, fetch("/api/no-show-prediction/interventions?".concat(params))];
          case 1:
            response = _a.sent();
            if (!response.ok) {
              throw new Error("Failed to fetch interventions");
            }
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setInterventions(data.interventions || []);
            return [3 /*break*/, 5];
          case 3:
            error_1 = _a.sent();
            console.error("Error fetching interventions:", error_1);
            toast({
              title: "Error",
              description: "Failed to load interventions",
              variant: "destructive",
            });
            return [3 /*break*/, 5];
          case 4:
            setLoading(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var getStatusBadgeVariant = (status) => {
    switch (status) {
      case "completed":
        return "default";
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };
  var getOutcomeBadgeVariant = (outcome) => {
    switch (outcome) {
      case "successful":
        return "default";
      case "partially_successful":
        return "secondary";
      case "unsuccessful":
        return "destructive";
      default:
        return "outline";
    }
  };
  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Interventions</h2>
          <p className="text-muted-foreground">Manage proactive intervention strategies</p>
        </div>
        <dialog_1.Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <dialog_1.DialogTrigger asChild>
            <button_1.Button>
              <icons_1.Icons.plus className="mr-2 h-4 w-4" />
              New Intervention
            </button_1.Button>
          </dialog_1.DialogTrigger>
          <dialog_1.DialogContent>
            <dialog_1.DialogHeader>
              <dialog_1.DialogTitle>Create New Intervention</dialog_1.DialogTitle>
              <dialog_1.DialogDescription>
                Create a proactive intervention for a high-risk patient
              </dialog_1.DialogDescription>
            </dialog_1.DialogHeader>
            <div className="space-y-4">
              <div>
                <label_1.Label htmlFor="intervention-type">Intervention Type</label_1.Label>
                <select_1.Select>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Select intervention type" />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="phone_call">Phone Call</select_1.SelectItem>
                    <select_1.SelectItem value="sms_reminder">SMS Reminder</select_1.SelectItem>
                    <select_1.SelectItem value="email_reminder">Email Reminder</select_1.SelectItem>
                    <select_1.SelectItem value="whatsapp_message">
                      WhatsApp Message
                    </select_1.SelectItem>
                    <select_1.SelectItem value="appointment_reschedule">
                      Reschedule Offer
                    </select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
              <div>
                <label_1.Label htmlFor="message">Message</label_1.Label>
                <textarea_1.Textarea
                  id="message"
                  placeholder="Enter intervention message..."
                  className="h-24"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button_1.Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </button_1.Button>
                <button_1.Button>Create Intervention</button_1.Button>
              </div>
            </div>
          </dialog_1.DialogContent>
        </dialog_1.Dialog>
      </div>{" "}
      {/* Filters */}
      <card_1.Card>
        <card_1.CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <select_1.Select value={filter} onValueChange={setFilter}>
                <select_1.SelectTrigger className="w-[200px]">
                  <select_1.SelectValue />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">All Interventions</select_1.SelectItem>
                  <select_1.SelectItem value="pending">Pending</select_1.SelectItem>
                  <select_1.SelectItem value="completed">Completed</select_1.SelectItem>
                  <select_1.SelectItem value="failed">Failed</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>
            <button_1.Button onClick={fetchInterventions} variant="outline">
              <icons_1.Icons.refresh className="mr-2 h-4 w-4" />
              Refresh
            </button_1.Button>
          </div>
        </card_1.CardContent>
      </card_1.Card>
      {/* Interventions List */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Recent Interventions</card_1.CardTitle>
          <card_1.CardDescription>
            Track the effectiveness of intervention strategies
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          {loading
            ? <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                ))}
              </div>
            : <div className="space-y-4">
                {interventions.map((intervention) => (
                  <div
                    key={intervention.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <div>
                        <p className="font-medium">{intervention.patient.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {intervention.intervention_type.replace("_", " ")} •
                          {new Date(intervention.scheduled_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <badge_1.Badge variant={getStatusBadgeVariant(intervention.status)}>
                        {intervention.status}
                      </badge_1.Badge>
                      {intervention.outcome && (
                        <badge_1.Badge variant={getOutcomeBadgeVariant(intervention.outcome)}>
                          {intervention.outcome.replace("_", " ")}
                        </badge_1.Badge>
                      )}
                      {intervention.effectiveness_score && (
                        <span className="text-sm font-medium">
                          {(intervention.effectiveness_score * 100).toFixed(0)}% effective
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {interventions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No interventions found
                  </div>
                )}
              </div>}
        </card_1.CardContent>
      </card_1.Card>
    </div>
  );
}
