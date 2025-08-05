"use client";

import type { useBudgetApproval } from "@/app/hooks/useBudgetApproval";
import type { InventoryBudget } from "@/app/types/budget-approval";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Dialog, DialogTrigger } from "@/components/ui/dialog";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type { Progress } from "@/components/ui/progress";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  Eye,
  Plus,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react";
import type { useState } from "react";

// =====================================================================================
// TYPES & INTERFACES
// =====================================================================================

interface BudgetApprovalWorkflowProps {
  clinicId?: string;
  onBudgetCreated?: () => void;
  onApprovalActioned?: () => void;
}

export function BudgetApprovalWorkflow({
  clinicId = "default-clinic",
  onBudgetCreated,
  onApprovalActioned,
}: BudgetApprovalWorkflowProps) {
  const {
    budgets,
    budgetLoading,
    approvals,
    pendingApprovals,
    approvalLoading,
    recommendations,
    forecasts,
    validationResult,
    createBudget,
    updateBudget,
    deleteBudget,
    createApproval,
    processApproval,
    generateOptimizationRecommendations,
    generateForecast,
    validateBudget,
    refreshBudgets,
    refreshApprovals,
  } = useBudgetApproval();

  const [showCreateBudget, setShowCreateBudget] = useState(false);
  const [showCreateApproval, setShowCreateApproval] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<InventoryBudget | null>(null);

  const getStatusColor = (status: string) => {
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

  const getApprovalStatusColor = (status: string) => {
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

  const getApprovalIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "changes_requested":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const BudgetCard = ({ budget }: { budget: InventoryBudget }) => {
    const utilizationPercentage =
      budget.total_amount > 0 ? ((budget.spent_amount || 0) / budget.total_amount) * 100 : 0;

    const remainingAmount = budget.total_amount - (budget.spent_amount || 0);

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{budget.name}</CardTitle>
              <CardDescription>
                {budget.category} • {budget.budget_type}
              </CardDescription>
            </div>
            <Badge className={getStatusColor(budget.status || "active")}>
              {budget.status || "active"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Total Budget</Label>
                <p className="text-2xl font-bold text-green-600">
                  ${budget.total_amount.toLocaleString()}
                </p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Spent</Label>
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
              <Progress value={utilizationPercentage} className="h-2" />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Remaining:</span>
              <span
                className={`font-medium ${remainingAmount > 0 ? "text-green-600" : "text-red-600"}`}
              >
                ${remainingAmount.toLocaleString()}
              </span>
            </div>

            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => setSelectedBudget(budget)}>
                <Eye className="h-4 w-4 mr-1" />
                View Details
              </Button>
              <Button variant="outline" size="sm" onClick={() => generateForecast(budget.id)}>
                <TrendingUp className="h-4 w-4 mr-1" />
                Forecast
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ApprovalCard = ({ approval }: { approval: any }) => {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{approval.request_type}</CardTitle>
              <CardDescription>Amount: ${approval.amount?.toLocaleString()}</CardDescription>
            </div>
            <Badge className={getApprovalStatusColor(approval.status)}>
              <div className="flex items-center gap-1">
                {getApprovalIcon(approval.status)}
                {approval.status}
              </div>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {approval.description && (
              <p className="text-sm text-muted-foreground">{approval.description}</p>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Priority</Label>
                <p className="font-medium">{approval.priority}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Urgency</Label>
                <p className="font-medium">{approval.urgency}</p>
              </div>
            </div>

            {approval.status === "pending" && (
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  onClick={() => processApproval(approval.id, "approve")}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => processApproval(approval.id, "reject")}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => processApproval(approval.id, "request_changes")}
                >
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Request Changes
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
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
          <Button onClick={refreshBudgets} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={showCreateBudget} onOpenChange={setShowCreateBudget}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Budget
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budgets</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{budgets.length}</div>
            <p className="text-xs text-muted-foreground">Active budget allocations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Allocated</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${budgets.reduce((sum, b) => sum + b.total_amount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Across all budgets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${budgets.reduce((sum, b) => sum + (b.spent_amount || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Year to date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApprovals.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="budgets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="budgets" className="space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <Input placeholder="Search budgets..." className="max-w-sm" />
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="exhausted">Exhausted</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {budgetLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {budgets.map((budget) => (
                <BudgetCard key={budget.id} budget={budget} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approvals" className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Input placeholder="Search approvals..." className="max-w-sm" />
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="changes_requested">Changes Requested</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog open={showCreateApproval} onOpenChange={setShowCreateApproval}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Request Approval
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>

          {approvalLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {approvals.map((approval: any) => (
                <ApprovalCard key={approval.id} approval={approval} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget Forecasting</CardTitle>
              <CardDescription>AI-powered budget forecasting and trend analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {forecasts.length > 0 ? (
                  <div className="grid gap-4">
                    {forecasts.map((forecast, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">
                            Forecast Period: {forecast.forecast_period} days
                          </h4>
                          <Badge variant="outline">{forecast.forecast_accuracy}% accuracy</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <Label>Predicted Spend</Label>
                            <p className="font-medium">
                              ${forecast.predicted_spend.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <Label>Projected Variance</Label>
                            <p className="font-medium">
                              ${forecast.projected_variance.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {forecast.recommendations.length > 0 && (
                          <div className="mt-3">
                            <Label>Recommendations</Label>
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
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No forecasts available. Select a budget to generate forecasts.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget Optimization</CardTitle>
              <CardDescription>
                AI-driven budget optimization recommendations and analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  onClick={() => generateOptimizationRecommendations(budgets.map((b) => b.id))}
                  disabled={budgets.length === 0}
                >
                  Generate Optimization Recommendations
                </Button>

                {recommendations.length > 0 ? (
                  <div className="grid gap-4">
                    {recommendations.map((rec, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">{rec.type}</h4>
                          <Badge
                            variant={
                              rec.priority === "high"
                                ? "destructive"
                                : rec.priority === "medium"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {rec.priority} priority
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{rec.reasoning}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <Label>Potential Savings</Label>
                            <p className="font-medium text-green-600">
                              ${rec.potential_savings.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <Label>Implementation Effort</Label>
                            <p className="font-medium">{rec.implementation_effort}</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <Label>Impact Analysis</Label>
                          <p className="text-sm text-muted-foreground">{rec.impact_analysis}</p>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <Label>Current Allocation</Label>
                            <p className="font-medium">
                              ${rec.current_allocation.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <Label>Recommended Allocation</Label>
                            <p className="font-medium">
                              ${rec.recommended_allocation.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No optimization recommendations available. Generate recommendations to see
                      insights.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
