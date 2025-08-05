/**
 * Optimizations List Component
 *
 * Displays current optimization initiatives with status tracking
 */
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
exports.OptimizationsList = OptimizationsList;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var progress_1 = require("@/components/ui/progress");
var lucide_react_1 = require("lucide-react");
var statusConfig = {
  draft: { color: "bg-gray-100 text-gray-800", icon: lucide_react_1.Clock },
  active: { color: "bg-blue-100 text-blue-800", icon: lucide_react_1.TrendingUp },
  completed: { color: "bg-green-100 text-green-800", icon: lucide_react_1.CheckCircle },
  paused: { color: "bg-yellow-100 text-yellow-800", icon: lucide_react_1.Pause },
};
var priorityConfig = {
  low: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-red-100 text-red-800 border-red-200",
  critical: "bg-purple-100 text-purple-800 border-purple-200",
};
function OptimizationsList(_a) {
  var clinicId = _a.clinicId;
  var _b = (0, react_1.useState)([]),
    optimizations = _b[0],
    setOptimizations = _b[1];
  var _c = (0, react_1.useState)(true),
    loading = _c[0],
    setLoading = _c[1];
  var _d = (0, react_1.useState)(null),
    error = _d[0],
    setError = _d[1];
  (0, react_1.useEffect)(() => {
    fetchOptimizations();
  }, [clinicId]);
  var fetchOptimizations = () =>
    __awaiter(this, void 0, void 0, function () {
      var response, data, mockOptimizations, error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, 4, 5]);
            setLoading(true);
            return [4 /*yield*/, fetch("/api/revenue-optimization?clinicId=".concat(clinicId))];
          case 1:
            response = _a.sent();
            if (!response.ok) {
              throw new Error("Failed to fetch optimizations");
            }
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            mockOptimizations = [
              {
                id: "1",
                title: "Dynamic Pricing for Peak Hours",
                description: "Implement time-based pricing for high-demand periods",
                optimization_type: "pricing",
                status: "active",
                priority: "high",
                improvement_percentage: 8.5,
                expected_roi: 12,
                actual_roi: 9.2,
                start_date: "2024-01-15T00:00:00Z",
                target_date: "2024-02-15T00:00:00Z",
              },
              {
                id: "2",
                title: "Service Bundle Optimization",
                description: "Create packages for complementary procedures",
                optimization_type: "service_mix",
                status: "active",
                priority: "medium",
                improvement_percentage: 12.3,
                expected_roi: 18,
                start_date: "2024-01-20T00:00:00Z",
                target_date: "2024-03-01T00:00:00Z",
              },
              {
                id: "3",
                title: "VIP Customer Retention Program",
                description: "Launch retention program for high-value customers",
                optimization_type: "clv",
                status: "completed",
                priority: "high",
                improvement_percentage: 15.7,
                expected_roi: 25,
                actual_roi: 28.3,
                start_date: "2023-12-01T00:00:00Z",
                target_date: "2024-01-15T00:00:00Z",
                completion_date: "2024-01-12T00:00:00Z",
              },
            ];
            setOptimizations(mockOptimizations);
            return [3 /*break*/, 5];
          case 3:
            error_1 = _a.sent();
            console.error("Error fetching optimizations:", error_1);
            setError("Failed to load optimizations");
            return [3 /*break*/, 5];
          case 4:
            setLoading(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  var calculateProgress = (startDate, targetDate, completionDate) => {
    var start = new Date(startDate).getTime();
    var target = new Date(targetDate).getTime();
    var now = completionDate ? new Date(completionDate).getTime() : Date.now();
    var progress = Math.min(((now - start) / (target - start)) * 100, 100);
    return Math.max(progress, 0);
  };
  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-lg" />
        ))}
      </div>
    );
  }
  if (error) {
    return (
      <card_1.Card>
        <card_1.CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <lucide_react_1.AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <button_1.Button
              variant="outline"
              size="sm"
              onClick={fetchOptimizations}
              className="mt-2"
            >
              Try Again
            </button_1.Button>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  return (
    <div className="space-y-3">
      {optimizations.map((optimization) => {
        var StatusIcon = statusConfig[optimization.status].icon;
        var progress = calculateProgress(
          optimization.start_date,
          optimization.target_date,
          optimization.completion_date,
        );
        return (
          <card_1.Card key={optimization.id} className="hover:shadow-md transition-shadow">
            <card_1.CardContent className="pt-4">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">{optimization.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {optimization.description}
                    </p>
                  </div>
                  <button_1.Button variant="ghost" size="sm">
                    <lucide_react_1.MoreHorizontal className="h-4 w-4" />
                  </button_1.Button>
                </div>

                {/* Badges and Metrics */}
                <div className="flex items-center gap-2 flex-wrap">
                  <badge_1.Badge
                    variant="outline"
                    className={statusConfig[optimization.status].color}
                  >
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {optimization.status}
                  </badge_1.Badge>

                  <badge_1.Badge
                    variant="outline"
                    className={priorityConfig[optimization.priority]}
                  >
                    {optimization.priority}
                  </badge_1.Badge>

                  <span className="text-xs text-muted-foreground">
                    {optimization.optimization_type.replace("_", " ")}
                  </span>
                </div>

                {/* Progress and Metrics */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>Progress</span>
                    <span>{progress.toFixed(0)}%</span>
                  </div>
                  <progress_1.Progress value={progress} className="h-2" />

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground">Expected Impact:</span>
                      <span className="ml-1 font-medium text-green-600">
                        +{optimization.improvement_percentage}%
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">ROI:</span>
                      <span className="ml-1 font-medium">
                        {optimization.actual_roi
                          ? "".concat(optimization.actual_roi, "%")
                          : "".concat(optimization.expected_roi, "% (target)")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <lucide_react_1.Calendar className="h-3 w-3" />
                      <span>Started: {formatDate(optimization.start_date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <lucide_react_1.Target className="h-3 w-3" />
                      <span>
                        {optimization.completion_date
                          ? "Completed: ".concat(formatDate(optimization.completion_date))
                          : "Target: ".concat(formatDate(optimization.target_date))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        );
      })}

      {optimizations.length === 0 && (
        <card_1.Card>
          <card_1.CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <lucide_react_1.Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No active optimizations</p>
              <button_1.Button variant="outline" size="sm" className="mt-2">
                Create Optimization
              </button_1.Button>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      )}
    </div>
  );
}
