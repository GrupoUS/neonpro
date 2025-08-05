Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AutomatedProtocolOptimization;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var progress_1 = require("@/components/ui/progress");
var tabs_1 = require("@/components/ui/tabs");
var lucide_react_1 = require("lucide-react");
var defaultData = {
  currentVersion: "v2.1.3",
  optimizationScore: 87,
  activeExperiments: 3,
  completedAnalyses: 12,
  improvementRate: 15.2,
  nextRecommendation: "Increase treatment frequency for improved outcomes",
  status: "active",
};
function AutomatedProtocolOptimization(_a) {
  var _b = _a.data,
    data = _b === void 0 ? defaultData : _b;
  var statusColor = {
    active: "bg-green-500",
    pending: "bg-yellow-500",
    completed: "bg-blue-500",
  };
  var statusIcon = {
    active: <lucide_react_1.Activity className="h-4 w-4" />,
    pending: <lucide_react_1.Clock className="h-4 w-4" />,
    completed: <lucide_react_1.CheckCircle className="h-4 w-4" />,
  };
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Protocol Optimization</h2>
          <p className="text-muted-foreground">
            AI-powered protocol analysis and automated improvements
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <badge_1.Badge
            variant="outline"
            className={"".concat(statusColor[data.status], " text-white border-0")}
          >
            {statusIcon[data.status]}
            <span className="ml-1 capitalize">{data.status}</span>
          </badge_1.Badge>
          <button_1.Button size="sm">
            <lucide_react_1.Settings className="h-4 w-4 mr-2" />
            Configure
          </button_1.Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Current Version</card_1.CardTitle>
            <lucide_react_1.Target className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{data.currentVersion}</div>
            <p className="text-xs text-muted-foreground">Latest protocol version</p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Optimization Score</card_1.CardTitle>
            <lucide_react_1.TrendingUp className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{data.optimizationScore}%</div>
            <progress_1.Progress value={data.optimizationScore} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              +{data.improvementRate}% from last month
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Active Experiments</card_1.CardTitle>
            <lucide_react_1.BarChart3 className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{data.activeExperiments}</div>
            <p className="text-xs text-muted-foreground">Running optimization tests</p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Completed Analyses</card_1.CardTitle>
            <lucide_react_1.CheckCircle className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{data.completedAnalyses}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Main Content Tabs */}
      <tabs_1.Tabs defaultValue="overview" className="space-y-4">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="overview">Overview</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="experiments">Experiments</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="analytics">Analytics</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="recommendations">Recommendations</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <card_1.Card className="col-span-4">
              <card_1.CardHeader>
                <card_1.CardTitle>Protocol Performance</card_1.CardTitle>
                <card_1.CardDescription>
                  Real-time analysis of protocol effectiveness
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="h-[300px] flex items-center justify-center bg-muted/10 rounded-lg">
                  <p className="text-muted-foreground">Performance Chart Placeholder</p>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card className="col-span-3">
              <card_1.CardHeader>
                <card_1.CardTitle>Next Recommendation</card_1.CardTitle>
                <card_1.CardDescription>AI-suggested optimization</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <lucide_react_1.AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Priority Action</p>
                    <p className="text-sm text-muted-foreground">{data.nextRecommendation}</p>
                  </div>
                </div>
                <button_1.Button className="w-full">Implement Recommendation</button_1.Button>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="experiments" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Active Experiments</card_1.CardTitle>
              <card_1.CardDescription>
                Currently running protocol optimization experiments
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="h-[400px] flex items-center justify-center bg-muted/10 rounded-lg">
                <p className="text-muted-foreground">Experiments List Placeholder</p>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="analytics" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Protocol Analytics</card_1.CardTitle>
              <card_1.CardDescription>
                Detailed analytics and performance metrics
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="h-[400px] flex items-center justify-center bg-muted/10 rounded-lg">
                <p className="text-muted-foreground">Analytics Dashboard Placeholder</p>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="recommendations" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>AI Recommendations</card_1.CardTitle>
              <card_1.CardDescription>
                Machine learning-powered protocol improvements
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="h-[400px] flex items-center justify-center bg-muted/10 rounded-lg">
                <p className="text-muted-foreground">Recommendations Engine Placeholder</p>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
}
