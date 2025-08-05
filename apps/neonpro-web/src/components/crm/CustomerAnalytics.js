/**
 * Customer Analytics Component
 * Advanced analytics and insights for customer relationship management
 * Created: January 24, 2025
 */
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerAnalytics = CustomerAnalytics;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var progress_1 = require("@/components/ui/progress");
var tabs_1 = require("@/components/ui/tabs");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("./utils");
function CustomerAnalytics(_a) {
  var _b = _a.customers,
    customers = _b === void 0 ? [] : _b,
    _c = _a.appointments,
    appointments = _c === void 0 ? [] : _c,
    _d = _a.className,
    className = _d === void 0 ? "" : _d;
  // Calculate comprehensive analytics
  var analytics = (0, react_1.useMemo)(() => {
    var totalCustomers = customers.length;
    if (totalCustomers === 0) {
      return {
        overview: {
          totalCustomers: 0,
          activeCustomers: 0,
          newCustomers: 0,
          atRiskCustomers: 0,
          churnedCustomers: 0,
          averageLifetimeValue: 0,
          totalRevenue: 0,
          averageSatisfaction: 0,
          retentionRate: 0,
        },
        lifecycle: {
          new: 0,
          active: 0,
          atRisk: 0,
          churned: 0,
        },
        segments: [],
        topCustomers: [],
        retention: {
          totalCustomers: 0,
          activeCustomers: 0,
          churnedCustomers: 0,
          retentionRate: 0,
          averageLifetimeValue: 0,
          riskCustomers: [],
        },
      };
    }
    // Overview metrics
    var activeCustomers = customers.filter((c) => c.status === "active").length;
    var newCustomers = customers.filter((c) => {
      var registrationDate = new Date(c.registrationDate);
      var thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return registrationDate >= thirtyDaysAgo;
    }).length;
    var customerLifecycles = customers.map((c) => ({
      customer: c,
      lifecycle: (0, utils_1.determineCustomerLifecycle)(c),
      churnRisk: (0, utils_1.predictChurnRisk)(c),
    }));
    var atRiskCustomers = customerLifecycles.filter((cl) => cl.lifecycle === "at-risk").length;
    var churnedCustomers = customerLifecycles.filter((cl) => cl.lifecycle === "churned").length;
    var totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    var averageLifetimeValue = totalRevenue / totalCustomers;
    var customersWithSatisfaction = customers.filter((c) => c.satisfactionRating);
    var averageSatisfaction =
      customersWithSatisfaction.length > 0
        ? customersWithSatisfaction.reduce((sum, c) => sum + (c.satisfactionRating || 0), 0) /
          customersWithSatisfaction.length
        : 0;
    // Lifecycle distribution
    var lifecycleDistribution = {
      new: customerLifecycles.filter((cl) => cl.lifecycle === "new").length,
      active: customerLifecycles.filter((cl) => cl.lifecycle === "active").length,
      atRisk: customerLifecycles.filter((cl) => cl.lifecycle === "at-risk").length,
      churned: customerLifecycles.filter((cl) => cl.lifecycle === "churned").length,
    };
    // Customer segmentation
    var segmentCriteria = {
      minTotalSpent: 1000, // High value customers
      minAppointments: 5, // Frequent customers
      daysSinceLastVisit: 90, // At-risk customers
      satisfactionThreshold: 4, // Satisfied customers
    };
    var segments = (0, utils_1.segmentCustomers)(customers, segmentCriteria);
    // Top customers by value
    var topCustomers = (0, utils_1.rankCustomersByValue)(customers).slice(0, 10);
    // Retention analysis
    var retention = (0, utils_1.calculateRetentionRate)(customers, 12); // 12 months
    return {
      overview: {
        totalCustomers: totalCustomers,
        activeCustomers: activeCustomers,
        newCustomers: newCustomers,
        atRiskCustomers: atRiskCustomers,
        churnedCustomers: churnedCustomers,
        averageLifetimeValue: averageLifetimeValue,
        totalRevenue: totalRevenue,
        averageSatisfaction: averageSatisfaction,
        retentionRate: retention.retentionRate,
      },
      lifecycle: lifecycleDistribution,
      segments: segments,
      topCustomers: topCustomers,
      retention: retention,
    };
  }, [customers, appointments]);
  // Calculate monthly trends (mock data for demonstration)
  var monthlyTrends = (0, react_1.useMemo)(() => {
    // In a real application, this would calculate actual monthly trends
    // For demo purposes, we'll generate sample trend data
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return {
      customerGrowth: [10, 15, 25, 30, 45, 52],
      revenue: [15000, 18000, 22000, 26000, 32000, 38000],
      satisfaction: [4.2, 4.3, 4.1, 4.4, 4.5, 4.6],
      retention: [85, 87, 84, 89, 91, 88],
    };
  }, []);
  // Format currency
  var formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  // Format percentage
  var formatPercentage = (value) => "".concat(value.toFixed(1), "%");
  // Get trend indicator
  var getTrendIndicator = (current, previous) => {
    if (current > previous) {
      return { icon: lucide_react_1.TrendingUp, color: "text-green-600", direction: "up" };
    } else if (current < previous) {
      return { icon: lucide_react_1.TrendingDown, color: "text-red-600", direction: "down" };
    }
    return { icon: lucide_react_1.Activity, color: "text-gray-600", direction: "stable" };
  };
  return (
    <div className={"space-y-6 ".concat(className)}>
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <card_1.Card>
          <card_1.CardHeader className="pb-2">
            <card_1.CardTitle className="text-sm flex items-center">
              <lucide_react_1.Users className="h-4 w-4 mr-2" />
              Total Customers
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalCustomers}</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <lucide_react_1.TrendingUp className="h-3 w-3 mr-1" />
              {analytics.overview.newCustomers} new this month
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="pb-2">
            <card_1.CardTitle className="text-sm flex items-center">
              <lucide_react_1.DollarSign className="h-4 w-4 mr-2" />
              Total Revenue
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analytics.overview.totalRevenue)}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Avg LTV: {formatCurrency(analytics.overview.averageLifetimeValue)}
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="pb-2">
            <card_1.CardTitle className="text-sm flex items-center">
              <lucide_react_1.Heart className="h-4 w-4 mr-2" />
              Customer Satisfaction
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {analytics.overview.averageSatisfaction.toFixed(1)}/5
            </div>
            <div className="flex items-center mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <lucide_react_1.Heart
                  key={star}
                  className={"h-3 w-3 ".concat(
                    star <= Math.round(analytics.overview.averageSatisfaction)
                      ? "text-red-400 fill-current"
                      : "text-gray-300",
                  )}
                />
              ))}
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="pb-2">
            <card_1.CardTitle className="text-sm flex items-center">
              <lucide_react_1.Target className="h-4 w-4 mr-2" />
              Retention Rate
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(analytics.overview.retentionRate)}
            </div>
            <progress_1.Progress value={analytics.overview.retentionRate} className="mt-2 h-2" />
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Warning Cards */}
      {analytics.overview.atRiskCustomers > 0 && (
        <card_1.Card className="border-yellow-200 bg-yellow-50">
          <card_1.CardHeader>
            <card_1.CardTitle className="text-yellow-800 flex items-center">
              <lucide_react_1.AlertTriangle className="h-5 w-5 mr-2" />
              Attention Required
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-yellow-800">
                  {analytics.overview.atRiskCustomers}
                </div>
                <p className="text-yellow-700">Customers at risk of churning</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-800">
                  {analytics.retention.riskCustomers.length}
                </div>
                <p className="text-red-700">High-value customers at risk</p>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      )}

      <tabs_1.Tabs defaultValue="overview" className="space-y-4">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="overview">Overview</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="lifecycle">Lifecycle</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="segments">Segments</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="performance">Performance</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Lifecycle Distribution */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center">
                  <lucide_react_1.PieChart className="h-5 w-5 mr-2" />
                  Customer Lifecycle Distribution
                </card_1.CardTitle>
                <card_1.CardDescription>
                  Distribution of customers across lifecycle stages
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      <span className="text-sm">New Customers</span>
                    </div>
                    <span className="text-sm font-medium">{analytics.lifecycle.new}</span>
                  </div>
                  <progress_1.Progress
                    value={(analytics.lifecycle.new / analytics.overview.totalCustomers) * 100}
                    className="h-2"
                  />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span className="text-sm">Active Customers</span>
                    </div>
                    <span className="text-sm font-medium">{analytics.lifecycle.active}</span>
                  </div>
                  <progress_1.Progress
                    value={(analytics.lifecycle.active / analytics.overview.totalCustomers) * 100}
                    className="h-2"
                  />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                      <span className="text-sm">At-Risk Customers</span>
                    </div>
                    <span className="text-sm font-medium">{analytics.lifecycle.atRisk}</span>
                  </div>
                  <progress_1.Progress
                    value={(analytics.lifecycle.atRisk / analytics.overview.totalCustomers) * 100}
                    className="h-2"
                  />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      <span className="text-sm">Churned Customers</span>
                    </div>
                    <span className="text-sm font-medium">{analytics.lifecycle.churned}</span>
                  </div>
                  <progress_1.Progress
                    value={(analytics.lifecycle.churned / analytics.overview.totalCustomers) * 100}
                    className="h-2"
                  />
                </div>
              </card_1.CardContent>
            </card_1.Card>

            {/* Top Customers */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center">
                  <lucide_react_1.Award className="h-5 w-5 mr-2" />
                  Top Customers by Value
                </card_1.CardTitle>
                <card_1.CardDescription>Highest lifetime value customers</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-3">
                  {analytics.topCustomers.slice(0, 5).map((customer, index) => (
                    <div
                      key={customer.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded"
                    >
                      <div className="flex items-center space-x-3">
                        <badge_1.Badge variant="outline">{index + 1}</badge_1.Badge>
                        <div>
                          <div className="font-medium text-sm">{customer.name}</div>
                          <div className="text-xs text-gray-500">
                            {customer.appointmentCount} visits
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm">
                          {formatCurrency(customer.totalSpent)}
                        </div>
                        {customer.satisfactionRating && (
                          <div className="text-xs text-gray-500">
                            {customer.satisfactionRating}/5 ⭐
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="lifecycle" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <card_1.Card className="border-blue-200">
              <card_1.CardHeader className="pb-2">
                <card_1.CardTitle className="text-sm text-blue-700">New Customers</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-3xl font-bold text-blue-600">{analytics.lifecycle.new}</div>
                <p className="text-xs text-blue-600 mt-1">
                  {((analytics.lifecycle.new / analytics.overview.totalCustomers) * 100).toFixed(1)}
                  % of total
                </p>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card className="border-green-200">
              <card_1.CardHeader className="pb-2">
                <card_1.CardTitle className="text-sm text-green-700">
                  Active Customers
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {analytics.lifecycle.active}
                </div>
                <p className="text-xs text-green-600 mt-1">
                  {((analytics.lifecycle.active / analytics.overview.totalCustomers) * 100).toFixed(
                    1,
                  )}
                  % of total
                </p>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card className="border-yellow-200">
              <card_1.CardHeader className="pb-2">
                <card_1.CardTitle className="text-sm text-yellow-700">
                  At-Risk Customers
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-3xl font-bold text-yellow-600">
                  {analytics.lifecycle.atRisk}
                </div>
                <p className="text-xs text-yellow-600 mt-1">
                  {((analytics.lifecycle.atRisk / analytics.overview.totalCustomers) * 100).toFixed(
                    1,
                  )}
                  % of total
                </p>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card className="border-red-200">
              <card_1.CardHeader className="pb-2">
                <card_1.CardTitle className="text-sm text-red-700">
                  Churned Customers
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-3xl font-bold text-red-600">{analytics.lifecycle.churned}</div>
                <p className="text-xs text-red-600 mt-1">
                  {(
                    (analytics.lifecycle.churned / analytics.overview.totalCustomers) *
                    100
                  ).toFixed(1)}
                  % of total
                </p>
              </card_1.CardContent>
            </card_1.Card>
          </div>

          {/* Lifecycle Management Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="text-green-700">Growth Opportunities</card_1.CardTitle>
                <card_1.CardDescription>Actions to drive customer growth</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-3">
                <div className="p-3 bg-green-50 rounded">
                  <div className="font-medium text-green-800">New Customer Onboarding</div>
                  <div className="text-sm text-green-700">
                    {analytics.lifecycle.new} customers need welcome sequence
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded">
                  <div className="font-medium text-blue-800">Active Customer Upselling</div>
                  <div className="text-sm text-blue-700">
                    {analytics.lifecycle.active} customers ready for additional services
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="text-red-700">Retention Priorities</card_1.CardTitle>
                <card_1.CardDescription>Urgent actions to prevent churn</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-3">
                <div className="p-3 bg-yellow-50 rounded">
                  <div className="font-medium text-yellow-800">At-Risk Customer Outreach</div>
                  <div className="text-sm text-yellow-700">
                    {analytics.lifecycle.atRisk} customers need immediate attention
                  </div>
                </div>
                <div className="p-3 bg-red-50 rounded">
                  <div className="font-medium text-red-800">Win-Back Campaigns</div>
                  <div className="text-sm text-red-700">
                    {analytics.lifecycle.churned} customers eligible for win-back
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="segments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analytics.segments.map((segment, index) => (
              <card_1.Card key={index}>
                <card_1.CardHeader>
                  <card_1.CardTitle>{segment.name}</card_1.CardTitle>
                  <card_1.CardDescription>{segment.criteria}</card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="text-3xl font-bold mb-2">{segment.size}</div>
                  <div className="text-sm text-gray-600 mb-4">
                    {((segment.size / analytics.overview.totalCustomers) * 100).toFixed(1)}% of
                    total customers
                  </div>
                  <progress_1.Progress
                    value={(segment.size / analytics.overview.totalCustomers) * 100}
                    className="h-2"
                  />

                  {segment.customers.slice(0, 3).map((customer) => (
                    <div
                      key={customer.id}
                      className="flex items-center justify-between mt-3 p-2 bg-gray-50 rounded text-sm"
                    >
                      <span>{customer.name}</span>
                      <span className="font-medium">{formatCurrency(customer.totalSpent)}</span>
                    </div>
                  ))}

                  {segment.customers.length > 3 && (
                    <div className="text-xs text-gray-500 mt-2 text-center">
                      +{segment.customers.length - 3} more customers
                    </div>
                  )}
                </card_1.CardContent>
              </card_1.Card>
            ))}
          </div>

          {analytics.segments.length === 0 && (
            <card_1.Card>
              <card_1.CardContent className="text-center py-8">
                <lucide_react_1.BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No segments available</h3>
                <p className="text-gray-500">Add more customers to generate meaningful segments.</p>
              </card_1.CardContent>
            </card_1.Card>
          )}
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="performance" className="space-y-4">
          {/* Retention Analysis */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center">
                <lucide_react_1.Activity className="h-5 w-5 mr-2" />
                Retention Analysis (12 Months)
              </card_1.CardTitle>
              <card_1.CardDescription>Customer retention metrics and trends</card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{analytics.retention.totalCustomers}</div>
                  <div className="text-sm text-gray-600">Total Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {analytics.retention.activeCustomers}
                  </div>
                  <div className="text-sm text-gray-600">Active</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {analytics.retention.churnedCustomers}
                  </div>
                  <div className="text-sm text-gray-600">Churned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {formatPercentage(analytics.retention.retentionRate)}
                  </div>
                  <div className="text-sm text-gray-600">Retention Rate</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Retention Rate</span>
                  <span>{formatPercentage(analytics.retention.retentionRate)}</span>
                </div>
                <progress_1.Progress value={analytics.retention.retentionRate} className="h-3" />
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <card_1.Card>
              <card_1.CardHeader className="pb-2">
                <card_1.CardTitle className="text-sm">Average Customer Value</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(analytics.retention.averageLifetimeValue)}
                </div>
                <p className="text-xs text-gray-600 mt-1">Per customer lifetime</p>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader className="pb-2">
                <card_1.CardTitle className="text-sm">Customer Health Score</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold">
                  {analytics.overview.averageSatisfaction > 0
                    ? "".concat((analytics.overview.averageSatisfaction * 20).toFixed(0), "/100")
                    : "N/A"}
                </div>
                <p className="text-xs text-gray-600 mt-1">Based on satisfaction</p>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader className="pb-2">
                <card_1.CardTitle className="text-sm">Growth Rate</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold text-green-600">
                  +{analytics.overview.newCustomers}
                </div>
                <p className="text-xs text-gray-600 mt-1">New customers this month</p>
              </card_1.CardContent>
            </card_1.Card>
          </div>

          {/* Risk Customers */}
          {analytics.retention.riskCustomers.length > 0 && (
            <card_1.Card className="border-orange-200">
              <card_1.CardHeader>
                <card_1.CardTitle className="text-orange-700 flex items-center">
                  <lucide_react_1.Clock className="h-5 w-5 mr-2" />
                  High-Risk Customers ({analytics.retention.riskCustomers.length})
                </card_1.CardTitle>
                <card_1.CardDescription>
                  Customers who need immediate attention
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-2">
                  {analytics.retention.riskCustomers.slice(0, 5).map((customer) => (
                    <div
                      key={customer.id}
                      className="flex items-center justify-between p-3 bg-orange-50 rounded"
                    >
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-gray-600">{customer.email}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(customer.totalSpent)}</div>
                        <badge_1.Badge variant="destructive">High Risk</badge_1.Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </card_1.CardContent>
            </card_1.Card>
          )}
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
}
