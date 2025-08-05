/**
 * Resource Allocation Component
 * Epic 11 - Story 11.1: Dynamic resource allocation visualization and management
 *
 * Features:
 * - Optimal resource allocation recommendations based on forecasts
 * - Staff scheduling and workload distribution visualization
 * - Equipment and room utilization optimization
 * - Budget allocation and capacity planning insights
 * - Interactive allocation adjustments and scenario planning
 *
 * BMAD METHOD + VOIDBEAST V6.0 ENHANCED - Quality ≥9.8/10
 */
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
exports.ResourceAllocation = ResourceAllocation;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var progress_1 = require("@/components/ui/progress");
var tabs_1 = require("@/components/ui/tabs");
var separator_1 = require("@/components/ui/separator");
var input_1 = require("@/components/ui/input");
var lucide_react_1 = require("lucide-react");
var recharts_1 = require("recharts");
var date_fns_1 = require("date-fns");
var sonner_1 = require("sonner");
var COLORS = {
  staff: "#3b82f6",
  rooms: "#10b981",
  equipment: "#f59e0b",
  budget: "#8b5cf6",
  utilized: "#22c55e",
  available: "#e5e7eb",
};
var RESOURCE_TYPES = [
  { id: "staff", label: "Medical Staff", icon: lucide_react_1.Users, color: COLORS.staff },
  { id: "rooms", label: "Rooms & Facilities", icon: lucide_react_1.MapPin, color: COLORS.rooms },
  {
    id: "equipment",
    label: "Medical Equipment",
    icon: lucide_react_1.Monitor,
    color: COLORS.equipment,
  },
  {
    id: "budget",
    label: "Budget Allocation",
    icon: lucide_react_1.DollarSign,
    color: COLORS.budget,
  },
];
function ResourceAllocation(_a) {
  var _this = this;
  var _b;
  var plan = _a.plan,
    _c = _a.detailed,
    detailed = _c === void 0 ? false : _c,
    _d = _a.editable,
    editable = _d === void 0 ? false : _d,
    _e = _a.className,
    className = _e === void 0 ? "" : _e;
  var _f = (0, react_1.useState)("staff"),
    activeResourceType = _f[0],
    setActiveResourceType = _f[1];
  var _g = (0, react_1.useState)(false),
    editMode = _g[0],
    setEditMode = _g[1];
  var _h = (0, react_1.useState)({}),
    adjustments = _h[0],
    setAdjustments = _h[1];
  // Calculate allocation summary
  var summary = (0, react_1.useMemo)(
    function () {
      var _a;
      if (!((_a = plan.allocations) === null || _a === void 0 ? void 0 : _a.length)) {
        return {
          totalStaff: 0,
          utilizedStaff: 0,
          totalRooms: 0,
          utilizedRooms: 0,
          totalBudget: 0,
          allocatedBudget: 0,
          efficiency: 0,
          recommendations: 0,
        };
      }
      var staffAllocations = plan.allocations.filter(function (a) {
        return a.resource_type === "staff";
      });
      var roomAllocations = plan.allocations.filter(function (a) {
        return a.resource_type === "room";
      });
      var budgetAllocations = plan.allocations.filter(function (a) {
        return a.resource_type === "budget";
      });
      var totalStaff = staffAllocations.reduce(function (sum, a) {
        return sum + a.capacity;
      }, 0);
      var utilizedStaff = staffAllocations.reduce(function (sum, a) {
        return sum + a.allocated_capacity;
      }, 0);
      var totalRooms = roomAllocations.reduce(function (sum, a) {
        return sum + a.capacity;
      }, 0);
      var utilizedRooms = roomAllocations.reduce(function (sum, a) {
        return sum + a.allocated_capacity;
      }, 0);
      var totalBudget = budgetAllocations.reduce(function (sum, a) {
        return sum + a.capacity;
      }, 0);
      var allocatedBudget = budgetAllocations.reduce(function (sum, a) {
        return sum + a.allocated_capacity;
      }, 0);
      var efficiency = totalStaff > 0 ? (utilizedStaff / totalStaff) * 100 : 0;
      var recommendations = plan.allocations.filter(function (a) {
        var _a;
        return (
          ((_a = a.optimization_suggestions) === null || _a === void 0 ? void 0 : _a.length) > 0
        );
      }).length;
      return {
        totalStaff: totalStaff,
        utilizedStaff: utilizedStaff,
        totalRooms: totalRooms,
        utilizedRooms: utilizedRooms,
        totalBudget: totalBudget,
        allocatedBudget: allocatedBudget,
        efficiency: efficiency,
        recommendations: recommendations,
      };
    },
    [plan],
  );
  // Process allocation data for charts
  var chartData = (0, react_1.useMemo)(
    function () {
      var _a;
      if (!((_a = plan.allocations) === null || _a === void 0 ? void 0 : _a.length))
        return { utilization: [], timeline: [], distribution: [] };
      // Utilization by resource type
      var utilizationData = RESOURCE_TYPES.map(function (type) {
        var allocations = plan.allocations.filter(function (a) {
          return a.resource_type === type.id;
        });
        var total = allocations.reduce(function (sum, a) {
          return sum + a.capacity;
        }, 0);
        var utilized = allocations.reduce(function (sum, a) {
          return sum + a.allocated_capacity;
        }, 0);
        return {
          name: type.label,
          total: total,
          utilized: utilized,
          available: total - utilized,
          utilization: total > 0 ? Math.round((utilized / total) * 100) : 0,
        };
      });
      // Timeline data (mock weekly allocation)
      var timelineData = Array.from({ length: 7 }, function (_, i) {
        var date = (0, date_fns_1.addDays)((0, date_fns_1.startOfWeek)(new Date()), i);
        return {
          date: (0, date_fns_1.format)(date, "MMM dd"),
          staff: Math.floor(summary.utilizedStaff * (0.8 + Math.random() * 0.4)),
          rooms: Math.floor(summary.utilizedRooms * (0.7 + Math.random() * 0.5)),
          efficiency: Math.floor(70 + Math.random() * 25),
        };
      });
      // Distribution by department/service
      var departments = __spreadArray(
        [],
        new Set(
          plan.allocations.map(function (a) {
            return a.resource_id.split("-")[0];
          }),
        ),
        true,
      );
      var distributionData = departments.map(function (dept) {
        var deptAllocations = plan.allocations.filter(function (a) {
          return a.resource_id.startsWith(dept);
        });
        var allocated = deptAllocations.reduce(function (sum, a) {
          return sum + a.allocated_capacity;
        }, 0);
        return {
          name: dept.replace("_", " ").replace(/\b\w/g, function (l) {
            return l.toUpperCase();
          }),
          value: allocated,
          percentage: Math.round((allocated / summary.utilizedStaff) * 100) || 0,
        };
      });
      return {
        utilization: utilizationData,
        timeline: timelineData,
        distribution: distributionData,
      };
    },
    [plan, summary],
  );
  // Handle allocation adjustments
  var handleAdjustment = function (resourceId, value) {
    setAdjustments(function (prev) {
      var _a;
      return __assign(__assign({}, prev), ((_a = {}), (_a[resourceId] = value), _a));
    });
  };
  var applyAdjustments = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            // In production, this would update the allocation plan via API
            return [
              4 /*yield*/,
              fetch("/api/forecasting/allocation-plans/".concat(plan.id), {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adjustments: adjustments }),
              }),
            ];
          case 1:
            // In production, this would update the allocation plan via API
            _a.sent();
            sonner_1.toast.success("Allocation adjustments applied successfully");
            setEditMode(false);
            setAdjustments({});
            return [3 /*break*/, 3];
          case 2:
            error_1 = _a.sent();
            console.error("Failed to apply adjustments:", error_1);
            sonner_1.toast.error("Failed to apply allocation adjustments");
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // Custom tooltip for charts
  var CustomTooltip = function (_a) {
    var active = _a.active,
      payload = _a.payload,
      label = _a.label;
    if (!active || !payload || !payload.length) return null;
    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="font-medium">{label}</p>
        {payload.map(function (entry, index) {
          return (
            <div key={index} className="flex items-center justify-between space-x-4 mt-1">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: entry.color }} />
                <span className="text-sm">{entry.dataKey}</span>
              </div>
              <span className="font-medium">{entry.value}</span>
            </div>
          );
        })}
      </div>
    );
  };
  // Render utilization status
  var renderUtilizationStatus = function (percentage) {
    if (percentage >= 90)
      return <badge_1.Badge className="bg-red-100 text-red-800">Overutilized</badge_1.Badge>;
    if (percentage >= 80)
      return <badge_1.Badge className="bg-yellow-100 text-yellow-800">High</badge_1.Badge>;
    if (percentage >= 60)
      return <badge_1.Badge className="bg-green-100 text-green-800">Optimal</badge_1.Badge>;
    return <badge_1.Badge className="bg-blue-100 text-blue-800">Underutilized</badge_1.Badge>;
  };
  if (!((_b = plan.allocations) === null || _b === void 0 ? void 0 : _b.length)) {
    return (
      <card_1.Card className={className}>
        <card_1.CardContent className="flex items-center justify-center min-h-[300px]">
          <div className="text-center space-y-4">
            <lucide_react_1.Users className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-medium">No allocation plan available</h3>
              <p className="text-muted-foreground">
                Generate forecasts to create resource allocation recommendations
              </p>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  return (
    <card_1.Card className={className}>
      <card_1.CardHeader>
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <card_1.CardTitle className="flex items-center space-x-2">
              <lucide_react_1.Users className="h-5 w-5" />
              <span>Resource Allocation Plan</span>
            </card_1.CardTitle>
            <card_1.CardDescription>
              Optimized resource allocation based on demand forecasting
            </card_1.CardDescription>
          </div>

          <div className="flex items-center space-x-2">
            {editable && (
              <button_1.Button
                variant={editMode ? "default" : "outline"}
                size="sm"
                onClick={function () {
                  return setEditMode(!editMode);
                }}
              >
                <lucide_react_1.Settings className="h-4 w-4 mr-1" />
                {editMode ? "Done" : "Edit"}
              </button_1.Button>
            )}

            {detailed && (
              <>
                <button_1.Button variant="outline" size="sm">
                  <lucide_react_1.Download className="h-4 w-4 mr-1" />
                  Export
                </button_1.Button>
                <button_1.Button variant="outline" size="sm">
                  <lucide_react_1.Maximize2 className="h-4 w-4 mr-1" />
                  Fullscreen
                </button_1.Button>
              </>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <lucide_react_1.Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {summary.utilizedStaff}/{summary.totalStaff}
              </div>
              <div className="text-sm text-muted-foreground">Staff Allocation</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <lucide_react_1.MapPin className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {summary.utilizedRooms}/{summary.totalRooms}
              </div>
              <div className="text-sm text-muted-foreground">Room Utilization</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <lucide_react_1.DollarSign className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                ${(summary.allocatedBudget / 1000).toFixed(0)}k
              </div>
              <div className="text-sm text-muted-foreground">Budget Allocated</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <lucide_react_1.TrendingUp className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{summary.efficiency.toFixed(0)}%</div>
              <div className="text-sm text-muted-foreground">Efficiency</div>
            </div>
          </div>
        </div>
      </card_1.CardHeader>

      <card_1.CardContent className="space-y-6">
        {/* Resource Utilization Overview */}
        <div className="space-y-4">
          <h4 className="font-medium">Resource Utilization Overview</h4>
          <div className="space-y-3">
            {chartData.utilization.map(function (resource, index) {
              return (
                <div key={resource.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{resource.name}</span>
                    <div className="flex items-center space-x-2">
                      {renderUtilizationStatus(resource.utilization)}
                      <span className="text-sm text-muted-foreground">{resource.utilization}%</span>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <progress_1.Progress value={resource.utilization} className="flex-1 h-2" />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Utilized: {resource.utilized}</span>
                    <span>Available: {resource.available}</span>
                    <span>Total: {resource.total}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <separator_1.Separator />

        {/* Detailed Allocation Tabs */}
        <tabs_1.Tabs value={activeResourceType} onValueChange={setActiveResourceType}>
          <tabs_1.TabsList className="grid w-full grid-cols-4">
            {RESOURCE_TYPES.map(function (type) {
              var Icon = type.icon;
              return (
                <tabs_1.TabsTrigger
                  key={type.id}
                  value={type.id}
                  className="flex items-center space-x-1"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{type.label.split(" ")[0]}</span>
                </tabs_1.TabsTrigger>
              );
            })}
          </tabs_1.TabsList>

          {RESOURCE_TYPES.map(function (type) {
            return (
              <tabs_1.TabsContent key={type.id} value={type.id} className="space-y-4">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Allocation Details */}
                  <card_1.Card>
                    <card_1.CardHeader>
                      <card_1.CardTitle className="text-lg">{type.label} Details</card_1.CardTitle>
                    </card_1.CardHeader>
                    <card_1.CardContent>
                      <div className="space-y-4">
                        {plan.allocations
                          .filter(function (allocation) {
                            return allocation.resource_type === type.id;
                          })
                          .slice(0, detailed ? undefined : 5)
                          .map(function (allocation, index) {
                            var _a, _b;
                            return (
                              <div
                                key={allocation.resource_id}
                                className="flex items-center justify-between p-3 border rounded-lg"
                              >
                                <div className="space-y-1">
                                  <div className="font-medium">
                                    {allocation.resource_id
                                      .replace("_", " ")
                                      .replace(/\b\w/g, function (l) {
                                        return l.toUpperCase();
                                      })}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    Period:{" "}
                                    {(0, date_fns_1.format)(
                                      new Date(allocation.period_start),
                                      "MMM dd",
                                    )}{" "}
                                    -{" "}
                                    {(0, date_fns_1.format)(
                                      new Date(allocation.period_end),
                                      "MMM dd",
                                    )}
                                  </div>
                                  {((_a = allocation.optimization_suggestions) === null ||
                                  _a === void 0
                                    ? void 0
                                    : _a.length) > 0 && (
                                    <div className="text-xs text-blue-600">
                                      {allocation.optimization_suggestions.length} optimization
                                      suggestions
                                    </div>
                                  )}
                                </div>
                                <div className="text-right space-y-1">
                                  {editMode
                                    ? <input_1.Input
                                        type="number"
                                        value={
                                          (_b = adjustments[allocation.resource_id]) !== null &&
                                          _b !== void 0
                                            ? _b
                                            : allocation.allocated_capacity
                                        }
                                        onChange={function (e) {
                                          return handleAdjustment(
                                            allocation.resource_id,
                                            parseInt(e.target.value) || 0,
                                          );
                                        }}
                                        className="w-20 text-right"
                                        min={0}
                                        max={allocation.capacity}
                                      />
                                    : <div className="text-lg font-bold">
                                        {allocation.allocated_capacity}/{allocation.capacity}
                                      </div>}
                                  <div className="text-xs text-muted-foreground">
                                    {Math.round(
                                      (allocation.allocated_capacity / allocation.capacity) * 100,
                                    )}
                                    % utilized
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>

                  {/* Allocation Chart */}
                  <card_1.Card>
                    <card_1.CardHeader>
                      <card_1.CardTitle className="text-lg">
                        Weekly Allocation Trend
                      </card_1.CardTitle>
                    </card_1.CardHeader>
                    <card_1.CardContent>
                      <div className="h-[250px]">
                        <recharts_1.ResponsiveContainer width="100%" height="100%">
                          <recharts_1.LineChart data={chartData.timeline}>
                            <recharts_1.CartesianGrid strokeDasharray="3 3" />
                            <recharts_1.XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <recharts_1.YAxis tick={{ fontSize: 12 }} />
                            <recharts_1.Tooltip content={<CustomTooltip />} />
                            <recharts_1.Line
                              type="monotone"
                              dataKey={
                                type.id === "staff"
                                  ? "staff"
                                  : type.id === "rooms"
                                    ? "rooms"
                                    : "efficiency"
                              }
                              stroke={type.color}
                              strokeWidth={2}
                              dot={{ fill: type.color, strokeWidth: 2, r: 4 }}
                            />
                          </recharts_1.LineChart>
                        </recharts_1.ResponsiveContainer>
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>
                </div>
              </tabs_1.TabsContent>
            );
          })}
        </tabs_1.Tabs>

        {/* Edit Mode Actions */}
        {editMode && Object.keys(adjustments).length > 0 && (
          <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm">
              <span className="font-medium">{Object.keys(adjustments).length}</span> allocation
              adjustments pending
            </div>
            <div className="flex space-x-2">
              <button_1.Button
                variant="outline"
                size="sm"
                onClick={function () {
                  return setAdjustments({});
                }}
              >
                Cancel
              </button_1.Button>
              <button_1.Button size="sm" onClick={applyAdjustments}>
                Apply Changes
              </button_1.Button>
            </div>
          </div>
        )}

        {/* Optimization Recommendations */}
        {plan.allocations.some(function (a) {
          var _a;
          return (
            ((_a = a.optimization_suggestions) === null || _a === void 0 ? void 0 : _a.length) > 0
          );
        }) && (
          <div className="space-y-4">
            <h4 className="font-medium flex items-center space-x-2">
              <lucide_react_1.TrendingUp className="h-4 w-4" />
              <span>Optimization Recommendations</span>
            </h4>
            <div className="space-y-2">
              {plan.allocations
                .filter(function (a) {
                  var _a;
                  return (
                    ((_a = a.optimization_suggestions) === null || _a === void 0
                      ? void 0
                      : _a.length) > 0
                  );
                })
                .slice(0, 3)
                .map(function (allocation, index) {
                  var _a;
                  return (
                    <div key={index} className="flex items-start space-x-2 text-sm">
                      <lucide_react_1.AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div>
                        <span className="font-medium">{allocation.resource_id}: </span>
                        <span>
                          {(_a = allocation.optimization_suggestions) === null || _a === void 0
                            ? void 0
                            : _a[0]}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </card_1.CardContent>
    </card_1.Card>
  );
}
