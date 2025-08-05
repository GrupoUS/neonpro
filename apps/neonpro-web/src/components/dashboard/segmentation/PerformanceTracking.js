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
exports.default = PerformanceTracking;
var alert_1 = require("@/components/ui/alert");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var progress_1 = require("@/components/ui/progress");
var table_1 = require("@/components/ui/table");
var tabs_1 = require("@/components/ui/tabs");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
function PerformanceTracking() {
  var _a, _b, _c;
  var _d = (0, react_1.useState)([]),
    performanceData = _d[0],
    setPerformanceData = _d[1];
  var _e = (0, react_1.useState)(null),
    comparisonData = _e[0],
    setComparisonData = _e[1];
  var _f = (0, react_1.useState)(""),
    selectedSegment = _f[0],
    setSelectedSegment = _f[1];
  var _g = (0, react_1.useState)(true),
    isLoading = _g[0],
    setIsLoading = _g[1];
  (0, react_1.useEffect)(() => {
    loadPerformanceData();
  }, []);
  var loadPerformanceData = () =>
    __awaiter(this, void 0, void 0, function () {
      var mockData, error_1;
      var _a;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            setIsLoading(true);
            _b.label = 1;
          case 1:
            _b.trys.push([1, 3, 4, 5]);
            // Mock data - replace with actual API call
            return [4 /*yield*/, new Promise((resolve) => setTimeout(resolve, 1000))];
          case 2:
            // Mock data - replace with actual API call
            _b.sent();
            mockData = [
              {
                id: "1",
                name: "High-Value Customers",
                metrics: {
                  size: 245,
                  engagementRate: 78.5,
                  conversionRate: 34.2,
                  averageRevenue: 1250.0,
                  retentionRate: 89.3,
                  growthRate: 12.5,
                },
                campaigns: {
                  active: 3,
                  completed: 12,
                  totalROI: 285.4,
                },
                trends: [
                  { period: "Jan", engagement: 75, conversion: 30, revenue: 1180 },
                  { period: "Feb", engagement: 77, conversion: 32, revenue: 1220 },
                  { period: "Mar", engagement: 79, conversion: 34, revenue: 1250 },
                ],
                alerts: [
                  {
                    type: "success",
                    message: "Engagement rate increased by 5% this month",
                    metric: "engagement",
                  },
                ],
              },
              {
                id: "2",
                name: "New Patients",
                metrics: {
                  size: 156,
                  engagementRate: 45.8,
                  conversionRate: 18.7,
                  averageRevenue: 420.0,
                  retentionRate: 34.6,
                  growthRate: 45.2,
                },
                campaigns: {
                  active: 2,
                  completed: 8,
                  totalROI: 145.8,
                },
                trends: [
                  { period: "Jan", engagement: 38, conversion: 15, revenue: 380 },
                  { period: "Feb", engagement: 42, conversion: 17, revenue: 400 },
                  { period: "Mar", engagement: 46, conversion: 19, revenue: 420 },
                ],
                alerts: [
                  {
                    type: "warning",
                    message: "Retention rate below target (35%)",
                    metric: "retention",
                  },
                ],
              },
              {
                id: "3",
                name: "Aesthetic Enthusiasts",
                metrics: {
                  size: 189,
                  engagementRate: 65.2,
                  conversionRate: 28.9,
                  averageRevenue: 890.0,
                  retentionRate: 72.1,
                  growthRate: 8.7,
                },
                campaigns: {
                  active: 4,
                  completed: 15,
                  totalROI: 220.3,
                },
                trends: [
                  { period: "Jan", engagement: 62, conversion: 26, revenue: 850 },
                  { period: "Feb", engagement: 64, conversion: 28, revenue: 870 },
                  { period: "Mar", engagement: 65, conversion: 29, revenue: 890 },
                ],
                alerts: [
                  {
                    type: "info",
                    message: "Steady growth in conversion rates",
                    metric: "conversion",
                  },
                ],
              },
            ];
            setPerformanceData(mockData);
            setSelectedSegment(
              ((_a = mockData[0]) === null || _a === void 0 ? void 0 : _a.id) || "",
            );
            // Mock comparison data
            setComparisonData({
              segments: mockData.map((segment, index) => ({
                name: segment.name,
                engagementRate: segment.metrics.engagementRate,
                conversionRate: segment.metrics.conversionRate,
                averageRevenue: segment.metrics.averageRevenue,
                color: ["#8884d8", "#82ca9d", "#ffc658"][index % 3],
              })),
            });
            return [3 /*break*/, 5];
          case 3:
            error_1 = _b.sent();
            console.error("Failed to load performance data:", error_1);
            return [3 /*break*/, 5];
          case 4:
            setIsLoading(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var selectedSegmentData = performanceData.find((s) => s.id === selectedSegment);
  var formatCurrency = (value) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  var formatPercentage = (value) => "".concat(value.toFixed(1), "%");
  var getMetricTrend = (current, previous) => {
    var change = ((current - previous) / previous) * 100;
    return {
      direction: change >= 0 ? "up" : "down",
      value: Math.abs(change),
      color: change >= 0 ? "text-green-600" : "text-red-600",
    };
  };
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <card_1.Card key={i}>
              <card_1.CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <card_1.Card>
          <card_1.CardContent className="p-6">
            <div className="flex items-center">
              <lucide_react_1.Users className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Segments</p>
                <div className="flex items-center">
                  <div className="text-2xl font-bold">{performanceData.length}</div>
                </div>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-6">
            <div className="flex items-center">
              <lucide_react_1.Target className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Avg Engagement</p>
                <div className="flex items-center">
                  <div className="text-2xl font-bold">
                    {formatPercentage(
                      performanceData.reduce((acc, s) => acc + s.metrics.engagementRate, 0) /
                        performanceData.length,
                    )}
                  </div>
                </div>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-6">
            <div className="flex items-center">
              <lucide_react_1.Activity className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Avg Conversion</p>
                <div className="flex items-center">
                  <div className="text-2xl font-bold">
                    {formatPercentage(
                      performanceData.reduce((acc, s) => acc + s.metrics.conversionRate, 0) /
                        performanceData.length,
                    )}
                  </div>
                </div>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-6">
            <div className="flex items-center">
              <lucide_react_1.BarChart3 className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total ROI</p>
                <div className="flex items-center">
                  <div className="text-2xl font-bold">
                    {formatPercentage(
                      performanceData.reduce((acc, s) => acc + s.campaigns.totalROI, 0) /
                        performanceData.length,
                    )}
                  </div>
                </div>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Main Content Tabs */}
      <tabs_1.Tabs defaultValue="performance" className="space-y-4">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="performance">Performance Overview</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="comparison">Segment Comparison</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="analytics">Advanced Analytics</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="ab-testing">A/B Testing</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="performance" className="space-y-4">
          {/* Segment Selector */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Segment Performance</card_1.CardTitle>
              <card_1.CardDescription>
                Detailed performance metrics for individual segments
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="flex flex-wrap gap-2 mb-6">
                {performanceData.map((segment) => (
                  <button_1.Button
                    key={segment.id}
                    variant={selectedSegment === segment.id ? "default" : "outline"}
                    onClick={() => setSelectedSegment(segment.id)}
                  >
                    {segment.name}
                  </button_1.Button>
                ))}
              </div>

              {selectedSegmentData && (
                <div className="space-y-6">
                  {/* Alerts */}
                  {selectedSegmentData.alerts.length > 0 && (
                    <div className="space-y-2">
                      {selectedSegmentData.alerts.map((alert, index) => (
                        <alert_1.Alert
                          key={index}
                          variant={alert.type === "warning" ? "destructive" : "default"}
                        >
                          <lucide_react_1.AlertTriangle className="h-4 w-4" />
                          <alert_1.AlertDescription>{alert.message}</alert_1.AlertDescription>
                        </alert_1.Alert>
                      ))}
                    </div>
                  )}

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <card_1.Card>
                      <card_1.CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Segment Size
                            </p>
                            <div className="text-2xl font-bold">
                              {selectedSegmentData.metrics.size}
                            </div>
                            <div className="flex items-center text-sm">
                              <lucide_react_1.TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                              <span className="text-green-600">
                                +{formatPercentage(selectedSegmentData.metrics.growthRate)}
                              </span>
                            </div>
                          </div>
                          <lucide_react_1.Users className="h-8 w-8 text-muted-foreground" />
                        </div>
                      </card_1.CardContent>
                    </card_1.Card>

                    <card_1.Card>
                      <card_1.CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Engagement Rate
                            </p>
                            <div className="text-2xl font-bold">
                              {formatPercentage(selectedSegmentData.metrics.engagementRate)}
                            </div>
                            <progress_1.Progress
                              value={selectedSegmentData.metrics.engagementRate}
                              className="mt-2"
                            />
                          </div>
                          <lucide_react_1.Activity className="h-8 w-8 text-muted-foreground" />
                        </div>
                      </card_1.CardContent>
                    </card_1.Card>

                    <card_1.Card>
                      <card_1.CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Conversion Rate
                            </p>
                            <div className="text-2xl font-bold">
                              {formatPercentage(selectedSegmentData.metrics.conversionRate)}
                            </div>
                            <progress_1.Progress
                              value={selectedSegmentData.metrics.conversionRate}
                              className="mt-2"
                            />
                          </div>
                          <lucide_react_1.Target className="h-8 w-8 text-muted-foreground" />
                        </div>
                      </card_1.CardContent>
                    </card_1.Card>

                    <card_1.Card>
                      <card_1.CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Average Revenue
                            </p>
                            <div className="text-2xl font-bold">
                              {formatCurrency(selectedSegmentData.metrics.averageRevenue)}
                            </div>
                          </div>
                          <lucide_react_1.BarChart3 className="h-8 w-8 text-muted-foreground" />
                        </div>
                      </card_1.CardContent>
                    </card_1.Card>

                    <card_1.Card>
                      <card_1.CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Retention Rate
                            </p>
                            <div className="text-2xl font-bold">
                              {formatPercentage(selectedSegmentData.metrics.retentionRate)}
                            </div>
                            <progress_1.Progress
                              value={selectedSegmentData.metrics.retentionRate}
                              className="mt-2"
                            />
                          </div>
                          <lucide_react_1.PieChart className="h-8 w-8 text-muted-foreground" />
                        </div>
                      </card_1.CardContent>
                    </card_1.Card>

                    <card_1.Card>
                      <card_1.CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Campaign ROI
                            </p>
                            <div className="text-2xl font-bold">
                              {formatPercentage(selectedSegmentData.campaigns.totalROI)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {selectedSegmentData.campaigns.active} active,{" "}
                              {selectedSegmentData.campaigns.completed} completed
                            </div>
                          </div>
                          <lucide_react_1.TrendingUp className="h-8 w-8 text-muted-foreground" />
                        </div>
                      </card_1.CardContent>
                    </card_1.Card>
                  </div>

                  {/* Trends Chart */}
                  <card_1.Card>
                    <card_1.CardHeader>
                      <card_1.CardTitle>Performance Trends</card_1.CardTitle>
                    </card_1.CardHeader>
                    <card_1.CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-sm font-medium">Engagement</div>
                            <div className="text-lg font-bold">
                              {formatPercentage(
                                ((_a =
                                  selectedSegmentData.trends[
                                    selectedSegmentData.trends.length - 1
                                  ]) === null || _a === void 0
                                  ? void 0
                                  : _a.engagement) || 0,
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium">Conversion</div>
                            <div className="text-lg font-bold">
                              {formatPercentage(
                                ((_b =
                                  selectedSegmentData.trends[
                                    selectedSegmentData.trends.length - 1
                                  ]) === null || _b === void 0
                                  ? void 0
                                  : _b.conversion) || 0,
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium">Revenue</div>
                            <div className="text-lg font-bold">
                              {formatCurrency(
                                ((_c =
                                  selectedSegmentData.trends[
                                    selectedSegmentData.trends.length - 1
                                  ]) === null || _c === void 0
                                  ? void 0
                                  : _c.revenue) || 0,
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>
                </div>
              )}
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="comparison" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Segment Comparison</card_1.CardTitle>
              <card_1.CardDescription>
                Compare performance metrics across different segments
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <table_1.Table>
                <table_1.TableHeader>
                  <table_1.TableRow>
                    <table_1.TableHead>Segment</table_1.TableHead>
                    <table_1.TableHead>Size</table_1.TableHead>
                    <table_1.TableHead>Engagement</table_1.TableHead>
                    <table_1.TableHead>Conversion</table_1.TableHead>
                    <table_1.TableHead>Avg Revenue</table_1.TableHead>
                    <table_1.TableHead>ROI</table_1.TableHead>
                  </table_1.TableRow>
                </table_1.TableHeader>
                <table_1.TableBody>
                  {performanceData.map((segment) => (
                    <table_1.TableRow key={segment.id}>
                      <table_1.TableCell className="font-medium">{segment.name}</table_1.TableCell>
                      <table_1.TableCell>{segment.metrics.size}</table_1.TableCell>
                      <table_1.TableCell>
                        {formatPercentage(segment.metrics.engagementRate)}
                      </table_1.TableCell>
                      <table_1.TableCell>
                        {formatPercentage(segment.metrics.conversionRate)}
                      </table_1.TableCell>
                      <table_1.TableCell>
                        {formatCurrency(segment.metrics.averageRevenue)}
                      </table_1.TableCell>
                      <table_1.TableCell>
                        {formatPercentage(segment.campaigns.totalROI)}
                      </table_1.TableCell>
                    </table_1.TableRow>
                  ))}
                </table_1.TableBody>
              </table_1.Table>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="analytics" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Advanced Analytics</card_1.CardTitle>
              <card_1.CardDescription>
                Deep insights and predictive analytics for segment performance
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-center py-8">
                <lucide_react_1.BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Advanced Analytics Dashboard</h3>
                <p className="text-muted-foreground">
                  Detailed analytics and predictions will be displayed here
                </p>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="ab-testing" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>A/B Testing</card_1.CardTitle>
              <card_1.CardDescription>
                Set up and monitor A/B tests for segment-based campaigns
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-center py-8">
                <lucide_react_1.Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">A/B Testing Platform</h3>
                <p className="text-muted-foreground">
                  Create and manage A/B tests for different segments
                </p>
                <button_1.Button className="mt-4">Create New Test</button_1.Button>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
}
