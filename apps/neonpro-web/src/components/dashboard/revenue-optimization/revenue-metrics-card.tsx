/**
 * Revenue Metrics Card Component
 *
 * Displays key revenue metrics and performance indicators
 */

"use client";

import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Badge } from "@/components/ui/badge";
import type { Progress } from "@/components/ui/progress";
import type { TrendingUp, TrendingDown, DollarSign, Target, Users, BarChart3 } from "lucide-react";

interface RevenueMetricsCardProps {
  metrics: {
    currentRevenue: number;
    projectedRevenue: number;
    growthRate: number;
    optimizationCount: number;
    successRate: number;
    averageROI: number;
  };
}

export function RevenueMetricsCard({ metrics }: RevenueMetricsCardProps) {
  const growthPercentage =
    ((metrics.projectedRevenue - metrics.currentRevenue) / metrics.currentRevenue) * 100;
  const isGrowthPositive = growthPercentage > 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Current Revenue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            R$ {metrics.currentRevenue.toLocaleString("pt-BR")}
          </div>
          <p className="text-xs text-muted-foreground">Monthly recurring revenue</p>
        </CardContent>
      </Card>

      {/* Projected Revenue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Projected Revenue</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            R$ {metrics.projectedRevenue.toLocaleString("pt-BR")}
          </div>
          <div className="flex items-center gap-1 text-xs">
            {isGrowthPositive ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            <span className={isGrowthPositive ? "text-green-600" : "text-red-600"}>
              {growthPercentage > 0 ? "+" : ""}
              {growthPercentage.toFixed(1)}%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Growth Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{metrics.growthRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">Month over month</p>
        </CardContent>
      </Card>

      {/* Active Optimizations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Optimizations</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.optimizationCount}</div>
          <p className="text-xs text-muted-foreground">Running initiatives</p>
        </CardContent>
      </Card>

      {/* Success Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {(metrics.successRate * 100).toFixed(1)}%
          </div>
          <Progress value={metrics.successRate * 100} className="mt-2 h-2" />
        </CardContent>
      </Card>

      {/* Average ROI */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average ROI</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {(metrics.averageROI * 100).toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">Return on investment</p>
        </CardContent>
      </Card>
    </div>
  );
}
