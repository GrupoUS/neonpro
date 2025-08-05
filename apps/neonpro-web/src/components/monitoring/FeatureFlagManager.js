/**
 * TASK-001: Foundation Setup & Baseline
 * Feature Flag Management Component
 *
 * Provides UI for managing feature flags, gradual rollouts, and A/B testing
 * for safe enhancement implementation with rollback capability.
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureFlagManager = FeatureFlagManager;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var label_1 = require("@/components/ui/label");
var switch_1 = require("@/components/ui/switch");
var badge_1 = require("@/components/ui/badge");
var tabs_1 = require("@/components/ui/tabs");
var progress_1 = require("@/components/ui/progress");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
function FeatureFlagManager() {
  var _a = (0, react_1.useState)([]),
    flags = _a[0],
    setFlags = _a[1];
  var _b = (0, react_1.useState)([]),
    rolloutPlans = _b[0],
    setRolloutPlans = _b[1];
  var _c = (0, react_1.useState)(true),
    loading = _c[0],
    setLoading = _c[1];
  var _d = (0, react_1.useState)(null),
    selectedFlag = _d[0],
    setSelectedFlag = _d[1];
  var _e = (0, react_1.useState)(false),
    isCreating = _e[0],
    setIsCreating = _e[1];
  // Load feature flags on component mount
  (0, react_1.useEffect)(() => {
    loadFeatureFlags();
    loadRolloutPlans();
  }, []);
  var loadFeatureFlags = () =>
    __awaiter(this, void 0, void 0, function () {
      var response, data, error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, 5, 6]);
            return [4 /*yield*/, fetch("/api/monitoring/feature-flags")];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setFlags(data.flags || []);
            _a.label = 3;
          case 3:
            return [3 /*break*/, 6];
          case 4:
            error_1 = _a.sent();
            console.error("Error loading feature flags:", error_1);
            sonner_1.toast.error("Failed to load feature flags");
            return [3 /*break*/, 6];
          case 5:
            setLoading(false);
            return [7 /*endfinally*/];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  var loadRolloutPlans = () =>
    __awaiter(this, void 0, void 0, function () {
      var response, data, error_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, fetch("/api/monitoring/rollout-plans")];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setRolloutPlans(data.plans || []);
            _a.label = 3;
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_2 = _a.sent();
            console.error("Error loading rollout plans:", error_2);
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var toggleFlag = (flagId, enabled) =>
    __awaiter(this, void 0, void 0, function () {
      var response, error_3;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              fetch("/api/monitoring/feature-flags/".concat(flagId), {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ enabled: enabled }),
              }),
            ];
          case 1:
            response = _a.sent();
            if (response.ok) {
              setFlags((prev) =>
                prev.map((flag) =>
                  flag.id === flagId ? __assign(__assign({}, flag), { enabled: enabled }) : flag,
                ),
              );
              sonner_1.toast.success("Feature flag ".concat(enabled ? "enabled" : "disabled"));
            } else {
              throw new Error("Failed to update feature flag");
            }
            return [3 /*break*/, 3];
          case 2:
            error_3 = _a.sent();
            console.error("Error toggling feature flag:", error_3);
            sonner_1.toast.error("Failed to update feature flag");
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  var updateRolloutPercentage = (flagId, percentage) =>
    __awaiter(this, void 0, void 0, function () {
      var response, error_4;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              fetch("/api/monitoring/feature-flags/".concat(flagId), {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rollout_percentage: percentage }),
              }),
            ];
          case 1:
            response = _a.sent();
            if (response.ok) {
              setFlags((prev) =>
                prev.map((flag) =>
                  flag.id === flagId
                    ? __assign(__assign({}, flag), { rollout_percentage: percentage })
                    : flag,
                ),
              );
              sonner_1.toast.success("Rollout updated to ".concat(percentage, "%"));
            } else {
              throw new Error("Failed to update rollout percentage");
            }
            return [3 /*break*/, 3];
          case 2:
            error_4 = _a.sent();
            console.error("Error updating rollout:", error_4);
            sonner_1.toast.error("Failed to update rollout percentage");
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  var quickRollout = (flagId, percentage) => {
    updateRolloutPercentage(flagId, percentage);
  };
  var getStatusBadge = (flag) => {
    if (!flag.enabled) {
      return <badge_1.Badge variant="secondary">Disabled</badge_1.Badge>;
    }
    if (flag.rollout_percentage === 0) {
      return <badge_1.Badge variant="outline">Ready</badge_1.Badge>;
    }
    if (flag.rollout_percentage === 100) {
      return <badge_1.Badge variant="default">Full Rollout</badge_1.Badge>;
    }
    return <badge_1.Badge variant="secondary">Gradual ({flag.rollout_percentage}%)</badge_1.Badge>;
  };
  var getEnvironmentBadge = (environment) => {
    var variants = {
      development: "outline",
      staging: "secondary",
      production: "default",
    };
    return <badge_1.Badge variant={variants[environment]}>{environment}</badge_1.Badge>;
  };
  if (loading) {
    return (
      <card_1.Card>
        <card_1.CardContent className="p-6">
          <div className="flex items-center justify-center">
            <lucide_react_1.RefreshCw className="h-4 w-4 animate-spin mr-2" />
            Loading feature flags...
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <lucide_react_1.Flag className="h-6 w-6 mr-2" />
            Feature Flag Manager
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage feature flags, gradual rollouts, and A/B testing for safe enhancement deployment
          </p>
        </div>
        <button_1.Button onClick={() => setIsCreating(true)}>
          <lucide_react_1.Flag className="h-4 w-4 mr-2" />
          Create Flag
        </button_1.Button>
      </div>

      <tabs_1.Tabs defaultValue="flags" className="space-y-4">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="flags">Feature Flags</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="rollouts">Rollout Plans</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="analytics">Analytics</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="flags" className="space-y-4">
          {flags.length === 0
            ? <card_1.Card>
                <card_1.CardContent className="p-6 text-center">
                  <lucide_react_1.Flag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Feature Flags</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first feature flag to start managing gradual rollouts
                  </p>
                  <button_1.Button onClick={() => setIsCreating(true)}>
                    Create First Flag
                  </button_1.Button>
                </card_1.CardContent>
              </card_1.Card>
            : <div className="grid gap-4">
                {flags.map((flag) => (
                  <card_1.Card key={flag.id}>
                    <card_1.CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <card_1.CardTitle className="text-lg">{flag.name}</card_1.CardTitle>
                          <card_1.CardDescription>{flag.description}</card_1.CardDescription>
                          <div className="flex gap-2">
                            {getEnvironmentBadge(flag.environment)}
                            {getStatusBadge(flag)}
                            {flag.epic_id && (
                              <badge_1.Badge variant="outline">Epic {flag.epic_id}</badge_1.Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <label_1.Label htmlFor={"toggle-".concat(flag.id)} className="text-sm">
                            {flag.enabled ? "Enabled" : "Disabled"}
                          </label_1.Label>
                          <switch_1.Switch
                            id={"toggle-".concat(flag.id)}
                            checked={flag.enabled}
                            onCheckedChange={(enabled) => toggleFlag(flag.id, enabled)}
                          />
                        </div>
                      </div>
                    </card_1.CardHeader>
                    <card_1.CardContent>
                      {flag.enabled && (
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <label_1.Label className="text-sm font-medium">
                                Rollout Percentage
                              </label_1.Label>
                              <span className="text-sm text-muted-foreground">
                                {flag.rollout_percentage}%
                              </span>
                            </div>
                            <progress_1.Progress value={flag.rollout_percentage} className="mb-2" />
                            <div className="flex gap-2">
                              <button_1.Button
                                size="sm"
                                variant="outline"
                                onClick={() => quickRollout(flag.id, 0)}
                                disabled={flag.rollout_percentage === 0}
                              >
                                0%
                              </button_1.Button>
                              <button_1.Button
                                size="sm"
                                variant="outline"
                                onClick={() => quickRollout(flag.id, 10)}
                                disabled={flag.rollout_percentage === 10}
                              >
                                10%
                              </button_1.Button>
                              <button_1.Button
                                size="sm"
                                variant="outline"
                                onClick={() => quickRollout(flag.id, 50)}
                                disabled={flag.rollout_percentage === 50}
                              >
                                50%
                              </button_1.Button>
                              <button_1.Button
                                size="sm"
                                variant="outline"
                                onClick={() => quickRollout(flag.id, 100)}
                                disabled={flag.rollout_percentage === 100}
                              >
                                100%
                              </button_1.Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </card_1.CardContent>
                  </card_1.Card>
                ))}
              </div>}
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="rollouts" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Rollout Plans</card_1.CardTitle>
              <card_1.CardDescription>
                Manage scheduled rollouts and gradual deployment strategies
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              {rolloutPlans.length === 0
                ? <div className="text-center py-6">
                    <lucide_react_1.TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Active Rollout Plans</h3>
                    <p className="text-muted-foreground">
                      Rollout plans will appear here when you schedule gradual deployments
                    </p>
                  </div>
                : <div className="space-y-4">
                    {rolloutPlans.map((plan) => (
                      <div key={plan.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">Target: {plan.target_percentage}%</h4>
                            <p className="text-sm text-muted-foreground">
                              Started: {new Date(plan.start_date).toLocaleDateString()}
                            </p>
                          </div>
                          <badge_1.Badge>{plan.status}</badge_1.Badge>
                        </div>
                      </div>
                    ))}
                  </div>}
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="analytics" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Feature Flag Analytics</card_1.CardTitle>
              <card_1.CardDescription>
                Monitor feature flag performance and user adoption metrics
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-center py-6">
                <lucide_react_1.Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Analytics Coming Soon</h3>
                <p className="text-muted-foreground">
                  Feature flag analytics and A/B testing results will be displayed here
                </p>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
}
