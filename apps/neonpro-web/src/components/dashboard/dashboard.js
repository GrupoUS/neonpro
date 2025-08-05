// Main Dashboard Layout - STORY-SUB-002 Task 4
// Integrates analytics overview, conversion charts, and trial management
// Based on research: SaaS dashboard best practices + shadcn/ui patterns
// Created: 2025-01-22
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dashboard = Dashboard;
var react_1 = require("react");
var tabs_1 = require("@/components/ui/tabs");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var analytics_overview_1 = require("./analytics/analytics-overview");
var conversion_charts_1 = require("./analytics/conversion-charts");
var trial_management_1 = require("./trial-management/trial-management");
function Dashboard(_a) {
  var className = _a.className;
  var _b = (0, react_1.useState)("overview"),
    activeTab = _b[0],
    setActiveTab = _b[1];
  return (
    <div className={(0, utils_1.cn)("flex-1 space-y-4 p-4 md:p-8 pt-6", className)}>
      {/* Dashboard Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time insights and trial management for your SaaS platform
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button_1.Button variant="outline" size="sm">
            <lucide_react_1.Download className="mr-2 h-4 w-4" />
            Export
          </button_1.Button>
          <button_1.Button variant="outline" size="sm">
            <lucide_react_1.Filter className="mr-2 h-4 w-4" />
            Filters
          </button_1.Button>
          <button_1.Button variant="outline" size="sm">
            <lucide_react_1.Bell className="mr-2 h-4 w-4" />
            Alerts
          </button_1.Button>
          <button_1.Button variant="outline" size="sm">
            <lucide_react_1.Settings className="mr-2 h-4 w-4" />
            Settings
          </button_1.Button>
        </div>
      </div>{" "}
      {/* Main Dashboard Tabs */}
      <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <tabs_1.TabsList className="grid w-full grid-cols-3">
          <tabs_1.TabsTrigger value="overview" className="flex items-center space-x-2">
            <lucide_react_1.BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="analytics" className="flex items-center space-x-2">
            <lucide_react_1.TrendingUp className="h-4 w-4" />
            <span>Analytics</span>
          </tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="trials" className="flex items-center space-x-2">
            <lucide_react_1.Users className="h-4 w-4" />
            <span>Trial Management</span>
          </tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        {/* Overview Tab - Analytics Overview */}
        <tabs_1.TabsContent value="overview" className="space-y-4">
          <analytics_overview_1.AnalyticsOverview />
        </tabs_1.TabsContent>

        {/* Analytics Tab - Conversion Charts */}
        <tabs_1.TabsContent value="analytics" className="space-y-4">
          <conversion_charts_1.ConversionCharts />
        </tabs_1.TabsContent>

        {/* Trial Management Tab */}
        <tabs_1.TabsContent value="trials" className="space-y-4">
          <trial_management_1.TrialManagement />
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
      {/* Quick Stats Cards - Always Visible */}
      <div className="grid gap-4 md:grid-cols-4">
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Active Trials</card_1.CardTitle>
            <lucide_react_1.Users className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">124</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Conversion Rate</card_1.CardTitle>
            <lucide_react_1.TrendingUp className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">26.8%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5.3%</span> from last month
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">High Risk Trials</card_1.CardTitle>
            <lucide_react_1.RefreshCw className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">-2</span> from yesterday
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Revenue This Month</card_1.CardTitle>
            <lucide_react_1.BarChart3 className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">$18,420</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+15.7%</span> from last month
            </p>
          </card_1.CardContent>
        </card_1.Card>
      </div>
    </div>
  );
}
