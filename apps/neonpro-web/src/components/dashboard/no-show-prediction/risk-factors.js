// Story 11.2: Risk Factors Management Component
// Analyze and configure patient risk factors
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
exports.default = RiskFactorsManagement;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var select_1 = require("@/components/ui/select");
var progress_1 = require("@/components/ui/progress");
var icons_1 = require("@/components/ui/icons");
var use_toast_1 = require("@/hooks/use-toast");
function RiskFactorsManagement() {
  var _a = (0, react_1.useState)([]),
    riskFactors = _a[0],
    setRiskFactors = _a[1];
  var _b = (0, react_1.useState)({}),
    summary = _b[0],
    setSummary = _b[1];
  var _c = (0, react_1.useState)(true),
    loading = _c[0],
    setLoading = _c[1];
  var _d = (0, react_1.useState)("all"),
    filter = _d[0],
    setFilter = _d[1];
  var toast = (0, use_toast_1.useToast)().toast;
  (0, react_1.useEffect)(() => {
    fetchRiskFactors();
  }, [filter]);
  var fetchRiskFactors = () =>
    __awaiter(this, void 0, void 0, function () {
      var params, response, data, error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, 4, 5]);
            setLoading(true);
            params = new URLSearchParams();
            if (filter !== "all") {
              params.append("factor_type", filter);
            }
            return [4 /*yield*/, fetch("/api/no-show-prediction/risk-factors?".concat(params))];
          case 1:
            response = _a.sent();
            if (!response.ok) {
              throw new Error("Failed to fetch risk factors");
            }
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setRiskFactors(data.risk_factors || []);
            setSummary(data.summary || {});
            return [3 /*break*/, 5];
          case 3:
            error_1 = _a.sent();
            console.error("Error fetching risk factors:", error_1);
            toast({
              title: "Error",
              description: "Failed to load risk factors",
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
  var getImpactColor = (impact) => {
    if (impact >= 0.8) return "text-red-600";
    if (impact >= 0.6) return "text-orange-600";
    if (impact >= 0.4) return "text-yellow-600";
    return "text-green-600";
  };
  var getRiskBadgeVariant = (impact) => {
    if (impact >= 0.8) return "destructive";
    if (impact >= 0.6) return "secondary";
    return "outline";
  };
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Object.entries(summary).map((_a) => {
          var factorType = _a[0],
            data = _a[1];
          return (
            <card_1.Card key={factorType}>
              <card_1.CardHeader className="pb-2">
                <card_1.CardTitle className="text-sm font-medium capitalize">
                  {factorType.replace("_", " ")}
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold">{data.count}</div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">Avg Impact</span>
                  <span
                    className={"text-sm font-medium ".concat(getImpactColor(data.average_impact))}
                  >
                    {(data.average_impact * 100).toFixed(0)}%
                  </span>
                </div>
                <progress_1.Progress value={data.average_impact * 100} className="mt-2 h-1" />
              </card_1.CardContent>
            </card_1.Card>
          );
        })}
      </div>
      {/* Filters and Controls */}
      <card_1.Card>
        <card_1.CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <select_1.Select value={filter} onValueChange={setFilter}>
                <select_1.SelectTrigger className="w-[200px]">
                  <select_1.SelectValue />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">All Risk Factors</select_1.SelectItem>
                  <select_1.SelectItem value="appointment_history">
                    Appointment History
                  </select_1.SelectItem>
                  <select_1.SelectItem value="demographic">Demographics</select_1.SelectItem>
                  <select_1.SelectItem value="communication">Communication</select_1.SelectItem>
                  <select_1.SelectItem value="scheduling">Scheduling Patterns</select_1.SelectItem>
                  <select_1.SelectItem value="financial">Financial Status</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
              <button_1.Button onClick={fetchRiskFactors} variant="outline">
                <icons_1.Icons.refresh className="mr-2 h-4 w-4" />
                Refresh
              </button_1.Button>
            </div>
            <button_1.Button variant="outline">
              <icons_1.Icons.download className="mr-2 h-4 w-4" />
              Export Analysis
            </button_1.Button>
          </div>
        </card_1.CardContent>
      </card_1.Card>{" "}
      {/* Risk Factors List */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Risk Factor Analysis</card_1.CardTitle>
          <card_1.CardDescription>
            Detailed breakdown of patient risk factors and their impact
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          {loading
            ? <div className="space-y-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                ))}
              </div>
            : <div className="space-y-4">
                {riskFactors.map((factor) => (
                  <div
                    key={factor.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={"w-3 h-3 rounded-full ".concat(
                          factor.impact_weight >= 0.8
                            ? "bg-red-500"
                            : factor.impact_weight >= 0.6
                              ? "bg-orange-500"
                              : factor.impact_weight >= 0.4
                                ? "bg-yellow-500"
                                : "bg-green-500",
                        )}
                      />
                      <div>
                        <p className="font-medium">{factor.patient.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {factor.factor_type.replace("_", " ")} • {factor.factor_value}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p
                          className={"text-sm font-medium ".concat(
                            getImpactColor(factor.impact_weight),
                          )}
                        >
                          {(factor.impact_weight * 100).toFixed(0)}% impact
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(factor.confidence_score * 100).toFixed(0)}% confidence
                        </p>
                      </div>
                      <badge_1.Badge variant={getRiskBadgeVariant(factor.impact_weight)}>
                        {factor.impact_weight >= 0.8
                          ? "High Risk"
                          : factor.impact_weight >= 0.6
                            ? "Medium Risk"
                            : "Low Risk"}
                      </badge_1.Badge>
                    </div>
                  </div>
                ))}

                {riskFactors.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No risk factors found for the selected criteria
                  </div>
                )}
              </div>}
        </card_1.CardContent>
      </card_1.Card>
      {/* Risk Factor Configuration */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Risk Factor Configuration</card_1.CardTitle>
          <card_1.CardDescription>
            Adjust weights and thresholds for risk factor analysis
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <h4 className="font-medium">Factor Weights</h4>
              {Object.entries(summary).map((_a) => {
                var factorType = _a[0],
                  data = _a[1];
                return (
                  <div key={factorType} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{factorType.replace("_", " ")}</span>
                    <div className="flex items-center space-x-2">
                      <progress_1.Progress value={data.average_impact * 100} className="w-20 h-2" />
                      <span className="text-xs font-medium w-10">
                        {(data.average_impact * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Threshold Settings</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>High Risk Threshold:</span>
                  <span className="text-red-600 font-medium">≥80%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Medium Risk Threshold:</span>
                  <span className="text-orange-600 font-medium">60-79%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Low Risk Threshold:</span>
                  <span className="text-green-600 font-medium">&lt;60%</span>
                </div>
              </div>
              <button_1.Button variant="outline" className="w-full">
                <icons_1.Icons.settings className="mr-2 h-4 w-4" />
                Configure Thresholds
              </button_1.Button>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>
  );
}
