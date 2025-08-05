/**
 * Revenue Metrics Card Component
 *
 * Displays key revenue metrics and performance indicators
 */
"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevenueMetricsCard = RevenueMetricsCard;
var card_1 = require("@/components/ui/card");
var progress_1 = require("@/components/ui/progress");
var lucide_react_1 = require("lucide-react");
function RevenueMetricsCard(_a) {
  var metrics = _a.metrics;
  var growthPercentage =
    ((metrics.projectedRevenue - metrics.currentRevenue) / metrics.currentRevenue) * 100;
  var isGrowthPositive = growthPercentage > 0;
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Current Revenue */}
      <card_1.Card>
        <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <card_1.CardTitle className="text-sm font-medium">Current Revenue</card_1.CardTitle>
          <lucide_react_1.DollarSign className="h-4 w-4 text-muted-foreground" />
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="text-2xl font-bold">
            R$ {metrics.currentRevenue.toLocaleString("pt-BR")}
          </div>
          <p className="text-xs text-muted-foreground">Monthly recurring revenue</p>
        </card_1.CardContent>
      </card_1.Card>

      {/* Projected Revenue */}
      <card_1.Card>
        <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <card_1.CardTitle className="text-sm font-medium">Projected Revenue</card_1.CardTitle>
          <lucide_react_1.Target className="h-4 w-4 text-muted-foreground" />
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="text-2xl font-bold text-green-600">
            R$ {metrics.projectedRevenue.toLocaleString("pt-BR")}
          </div>
          <div className="flex items-center gap-1 text-xs">
            {isGrowthPositive
              ? <lucide_react_1.TrendingUp className="h-3 w-3 text-green-500" />
              : <lucide_react_1.TrendingDown className="h-3 w-3 text-red-500" />}
            <span className={isGrowthPositive ? "text-green-600" : "text-red-600"}>
              {growthPercentage > 0 ? "+" : ""}
              {growthPercentage.toFixed(1)}%
            </span>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Growth Rate */}
      <card_1.Card>
        <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <card_1.CardTitle className="text-sm font-medium">Growth Rate</card_1.CardTitle>
          <lucide_react_1.BarChart3 className="h-4 w-4 text-muted-foreground" />
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="text-2xl font-bold text-blue-600">{metrics.growthRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">Month over month</p>
        </card_1.CardContent>
      </card_1.Card>

      {/* Active Optimizations */}
      <card_1.Card>
        <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <card_1.CardTitle className="text-sm font-medium">Active Optimizations</card_1.CardTitle>
          <lucide_react_1.Users className="h-4 w-4 text-muted-foreground" />
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="text-2xl font-bold">{metrics.optimizationCount}</div>
          <p className="text-xs text-muted-foreground">Running initiatives</p>
        </card_1.CardContent>
      </card_1.Card>

      {/* Success Rate */}
      <card_1.Card>
        <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <card_1.CardTitle className="text-sm font-medium">Success Rate</card_1.CardTitle>
          <lucide_react_1.Target className="h-4 w-4 text-muted-foreground" />
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="text-2xl font-bold text-green-600">
            {(metrics.successRate * 100).toFixed(1)}%
          </div>
          <progress_1.Progress value={metrics.successRate * 100} className="mt-2 h-2" />
        </card_1.CardContent>
      </card_1.Card>

      {/* Average ROI */}
      <card_1.Card>
        <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <card_1.CardTitle className="text-sm font-medium">Average ROI</card_1.CardTitle>
          <lucide_react_1.TrendingUp className="h-4 w-4 text-muted-foreground" />
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {(metrics.averageROI * 100).toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">Return on investment</p>
        </card_1.CardContent>
      </card_1.Card>
    </div>
  );
}
