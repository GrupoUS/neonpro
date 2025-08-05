"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BudgetApprovalWorkflow = BudgetApprovalWorkflow;
var useBudgetApproval_1 = require("@/app/hooks/useBudgetApproval");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var dialog_1 = require("@/components/ui/dialog");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var progress_1 = require("@/components/ui/progress");
var select_1 = require("@/components/ui/select");
var tabs_1 = require("@/components/ui/tabs");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
function BudgetApprovalWorkflow(_a) {
  var _b = _a.clinicId,
    clinicId = _b === void 0 ? "default-clinic" : _b,
    onBudgetCreated = _a.onBudgetCreated,
    onApprovalActioned = _a.onApprovalActioned;
  var _c = (0, useBudgetApproval_1.useBudgetApproval)(),
    budgets = _c.budgets,
    budgetLoading = _c.budgetLoading,
    approvals = _c.approvals,
    pendingApprovals = _c.pendingApprovals,
    approvalLoading = _c.approvalLoading,
    recommendations = _c.recommendations,
    forecasts = _c.forecasts,
    validationResult = _c.validationResult,
    createBudget = _c.createBudget,
    updateBudget = _c.updateBudget,
    deleteBudget = _c.deleteBudget,
    createApproval = _c.createApproval,
    processApproval = _c.processApproval,
    generateOptimizationRecommendations = _c.generateOptimizationRecommendations,
    generateForecast = _c.generateForecast,
    validateBudget = _c.validateBudget,
    refreshBudgets = _c.refreshBudgets,
    refreshApprovals = _c.refreshApprovals;
  var _d = (0, react_1.useState)(false),
    showCreateBudget = _d[0],
    setShowCreateBudget = _d[1];
  var _e = (0, react_1.useState)(false),
    showCreateApproval = _e[0],
    setShowCreateApproval = _e[1];
  var _f = (0, react_1.useState)(null),
    selectedBudget = _f[0],
    setSelectedBudget = _f[1];
  var getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "exhausted":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };
  var getApprovalStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "changes_requested":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };
  var getApprovalIcon = (status) => {
    switch (status) {
      case "approved":
        return <lucide_react_1.CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <lucide_react_1.XCircle className="h-4 w-4" />;
      case "pending":
        return <lucide_react_1.Clock className="h-4 w-4" />;
      case "changes_requested":
        return <lucide_react_1.AlertTriangle className="h-4 w-4" />;
      default:
        return <lucide_react_1.Clock className="h-4 w-4" />;
    }
  };
  var BudgetCard = (_a) => {
    var budget = _a.budget;
    var utilizationPercentage =
      budget.total_amount > 0 ? ((budget.spent_amount || 0) / budget.total_amount) * 100 : 0;
    var remainingAmount = budget.total_amount - (budget.spent_amount || 0);
    return (
      <card_1.Card className="hover:shadow-md transition-shadow">
        <card_1.CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <card_1.CardTitle className="text-lg">{budget.name}</card_1.CardTitle>
              <card_1.CardDescription>
                {budget.category} • {budget.budget_type}
              </card_1.CardDescription>
            </div>
            <badge_1.Badge className={getStatusColor(budget.status || "active")}>
              {budget.status || "active"}
            </badge_1.Badge>
          </div>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label_1.Label className="text-sm text-muted-foreground">
                  Total Budget
                </label_1.Label>
                <p className="text-2xl font-bold text-green-600">
                  ${budget.total_amount.toLocaleString()}
                </p>
              </div>
              <div>
                <label_1.Label className="text-sm text-muted-foreground">Spent</label_1.Label>
                <p className="text-xl font-semibold text-red-600">
                  ${(budget.spent_amount || 0).toLocaleString()}
                </p>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Budget Utilization</span>
                <span>{utilizationPercentage.toFixed(1)}%</span>
              </div>
              <progress_1.Progress value={utilizationPercentage} className="h-2" />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Remaining:</span>
              <span
                className={"font-medium ".concat(
                  remainingAmount > 0 ? "text-green-600" : "text-red-600",
                )}
              >
                ${remainingAmount.toLocaleString()}
              </span>
            </div>

            <div className="flex gap-2 mt-4">
              <button_1.Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedBudget(budget)}
              >
                <lucide_react_1.Eye className="h-4 w-4 mr-1" />
                View Details
              </button_1.Button>
              <button_1.Button
                variant="outline"
                size="sm"
                onClick={() => generateForecast(budget.id)}
              >
                <lucide_react_1.TrendingUp className="h-4 w-4 mr-1" />
                Forecast
              </button_1.Button>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  };
  var ApprovalCard = (_a) => {
    var _b;
    var approval = _a.approval;
    return (
      <card_1.Card className="hover:shadow-md transition-shadow">
        <card_1.CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <card_1.CardTitle className="text-lg">{approval.request_type}</card_1.CardTitle>
              <card_1.CardDescription>
                Amount: $
                {(_b = approval.amount) === null || _b === void 0 ? void 0 : _b.toLocaleString()}
              </card_1.CardDescription>
            </div>
            <badge_1.Badge className={getApprovalStatusColor(approval.status)}>
              <div className="flex items-center gap-1">
                {getApprovalIcon(approval.status)}
                {approval.status}
              </div>
            </badge_1.Badge>
          </div>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-3">
            {approval.description && (
              <p className="text-sm text-muted-foreground">{approval.description}</p>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label_1.Label className="text-muted-foreground">Priority</label_1.Label>
                <p className="font-medium">{approval.priority}</p>
              </div>
              <div>
                <label_1.Label className="text-muted-foreground">Urgency</label_1.Label>
                <p className="font-medium">{approval.urgency}</p>
              </div>
            </div>

            {approval.status === "pending" && (
              <div className="flex gap-2 mt-4">
                <button_1.Button
                  size="sm"
                  onClick={() => processApproval(approval.id, "approve")}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <lucide_react_1.CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </button_1.Button>
                <button_1.Button
                  size="sm"
                  variant="outline"
                  onClick={() => processApproval(approval.id, "reject")}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <lucide_react_1.XCircle className="h-4 w-4 mr-1" />
                  Reject
                </button_1.Button>
                <button_1.Button
                  size="sm"
                  variant="outline"
                  onClick={() => processApproval(approval.id, "request_changes")}
                >
                  <lucide_react_1.AlertTriangle className="h-4 w-4 mr-1" />
                  Request Changes
                </button_1.Button>
              </div>
            )}
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Budget & Approval Workflow</h2>
          <p className="text-muted-foreground">
            Manage inventory budgets, track spending, and handle approval workflows
          </p>
        </div>
        <div className="flex gap-3">
          <button_1.Button onClick={refreshBudgets} variant="outline">
            <lucide_react_1.Download className="h-4 w-4 mr-2" />
            Refresh
          </button_1.Button>
          <dialog_1.Dialog open={showCreateBudget} onOpenChange={setShowCreateBudget}>
            <dialog_1.DialogTrigger asChild>
              <button_1.Button>
                <lucide_react_1.Plus className="h-4 w-4 mr-2" />
                Create Budget
              </button_1.Button>
            </dialog_1.DialogTrigger>
          </dialog_1.Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Total Budgets</card_1.CardTitle>
            <lucide_react_1.DollarSign className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{budgets.length}</div>
            <p className="text-xs text-muted-foreground">Active budget allocations</p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Total Allocated</card_1.CardTitle>
            <lucide_react_1.TrendingUp className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              ${budgets.reduce((sum, b) => sum + b.total_amount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Across all budgets</p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Total Spent</card_1.CardTitle>
            <lucide_react_1.TrendingDown className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              ${budgets.reduce((sum, b) => sum + (b.spent_amount || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Year to date</p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Pending Approvals</card_1.CardTitle>
            <lucide_react_1.Clock className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{pendingApprovals.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Main Content */}
      <tabs_1.Tabs defaultValue="budgets" className="space-y-4">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="budgets">Budgets</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="approvals">Approvals</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="forecasting">Forecasting</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="optimization">Optimization</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="budgets" className="space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <input_1.Input placeholder="Search budgets..." className="max-w-sm" />
            <select_1.Select>
              <select_1.SelectTrigger className="w-[180px]">
                <select_1.SelectValue placeholder="Filter by status" />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="all">All Statuses</select_1.SelectItem>
                <select_1.SelectItem value="active">Active</select_1.SelectItem>
                <select_1.SelectItem value="paused">Paused</select_1.SelectItem>
                <select_1.SelectItem value="exhausted">Exhausted</select_1.SelectItem>
                <select_1.SelectItem value="expired">Expired</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>
          </div>

          {budgetLoading
            ? <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {budgets.map((budget) => (
                  <BudgetCard key={budget.id} budget={budget} />
                ))}
              </div>}
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="approvals" className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <input_1.Input placeholder="Search approvals..." className="max-w-sm" />
              <select_1.Select>
                <select_1.SelectTrigger className="w-[180px]">
                  <select_1.SelectValue placeholder="Filter by status" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">All Statuses</select_1.SelectItem>
                  <select_1.SelectItem value="pending">Pending</select_1.SelectItem>
                  <select_1.SelectItem value="approved">Approved</select_1.SelectItem>
                  <select_1.SelectItem value="rejected">Rejected</select_1.SelectItem>
                  <select_1.SelectItem value="changes_requested">
                    Changes Requested
                  </select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>
            <dialog_1.Dialog open={showCreateApproval} onOpenChange={setShowCreateApproval}>
              <dialog_1.DialogTrigger asChild>
                <button_1.Button>
                  <lucide_react_1.Plus className="h-4 w-4 mr-2" />
                  Request Approval
                </button_1.Button>
              </dialog_1.DialogTrigger>
            </dialog_1.Dialog>
          </div>

          {approvalLoading
            ? <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {approvals.map((approval) => (
                  <ApprovalCard key={approval.id} approval={approval} />
                ))}
              </div>}
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="forecasting" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Budget Forecasting</card_1.CardTitle>
              <card_1.CardDescription>
                AI-powered budget forecasting and trend analysis
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {forecasts.length > 0
                  ? <div className="grid gap-4">
                      {forecasts.map((forecast, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">
                              Forecast Period: {forecast.forecast_period} days
                            </h4>
                            <badge_1.Badge variant="outline">
                              {forecast.forecast_accuracy}% accuracy
                            </badge_1.Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <label_1.Label>Predicted Spend</label_1.Label>
                              <p className="font-medium">
                                ${forecast.predicted_spend.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <label_1.Label>Projected Variance</label_1.Label>
                              <p className="font-medium">
                                ${forecast.projected_variance.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          {forecast.recommendations.length > 0 && (
                            <div className="mt-3">
                              <label_1.Label>Recommendations</label_1.Label>
                              <ul className="list-disc list-inside text-sm text-muted-foreground">
                                {forecast.recommendations.map((rec, i) => (
                                  <li key={i}>{rec}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  : <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No forecasts available. Select a budget to generate forecasts.
                      </p>
                    </div>}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="optimization" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Budget Optimization</card_1.CardTitle>
              <card_1.CardDescription>
                AI-driven budget optimization recommendations and analysis
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                <button_1.Button
                  onClick={() => generateOptimizationRecommendations(budgets.map((b) => b.id))}
                  disabled={budgets.length === 0}
                >
                  Generate Optimization Recommendations
                </button_1.Button>

                {recommendations.length > 0
                  ? <div className="grid gap-4">
                      {recommendations.map((rec, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">{rec.type}</h4>
                            <badge_1.Badge
                              variant={
                                rec.priority === "high"
                                  ? "destructive"
                                  : rec.priority === "medium"
                                    ? "default"
                                    : "secondary"
                              }
                            >
                              {rec.priority} priority
                            </badge_1.Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{rec.reasoning}</p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <label_1.Label>Potential Savings</label_1.Label>
                              <p className="font-medium text-green-600">
                                ${rec.potential_savings.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <label_1.Label>Implementation Effort</label_1.Label>
                              <p className="font-medium">{rec.implementation_effort}</p>
                            </div>
                          </div>
                          <div className="mt-3">
                            <label_1.Label>Impact Analysis</label_1.Label>
                            <p className="text-sm text-muted-foreground">{rec.impact_analysis}</p>
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <label_1.Label>Current Allocation</label_1.Label>
                              <p className="font-medium">
                                ${rec.current_allocation.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <label_1.Label>Recommended Allocation</label_1.Label>
                              <p className="font-medium">
                                ${rec.recommended_allocation.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  : <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No optimization recommendations available. Generate recommendations to see
                        insights.
                      </p>
                    </div>}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
}
