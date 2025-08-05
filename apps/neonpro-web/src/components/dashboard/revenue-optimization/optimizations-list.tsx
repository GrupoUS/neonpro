/**
 * Optimizations List Component
 *
 * Displays current optimization initiatives with status tracking
 */

"use client";

import type {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  MoreHorizontal,
  Pause,
  Target,
  TrendingUp,
} from "lucide-react";
import type { useEffect, useState } from "react";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Progress } from "@/components/ui/progress";

interface Optimization {
  id: string;
  title: string;
  description: string;
  optimization_type: string;
  status: "draft" | "active" | "completed" | "paused";
  priority: "low" | "medium" | "high" | "critical";
  improvement_percentage: number;
  expected_roi: number;
  actual_roi?: number;
  start_date: string;
  target_date: string;
  completion_date?: string;
}

interface OptimizationsListProps {
  clinicId: string;
}

const statusConfig = {
  draft: { color: "bg-gray-100 text-gray-800", icon: Clock },
  active: { color: "bg-blue-100 text-blue-800", icon: TrendingUp },
  completed: { color: "bg-green-100 text-green-800", icon: CheckCircle },
  paused: { color: "bg-yellow-100 text-yellow-800", icon: Pause },
};

const priorityConfig = {
  low: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-red-100 text-red-800 border-red-200",
  critical: "bg-purple-100 text-purple-800 border-purple-200",
};

export function OptimizationsList({ clinicId }: OptimizationsListProps) {
  const [optimizations, setOptimizations] = useState<Optimization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOptimizations();
  }, [clinicId]);

  const fetchOptimizations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/revenue-optimization?clinicId=${clinicId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch optimizations");
      }

      const data = await response.json();
      // Mock data for demonstration since the API doesn't return individual optimizations
      const mockOptimizations: Optimization[] = [
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
    } catch (error) {
      console.error("Error fetching optimizations:", error);
      setError("Failed to load optimizations");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const calculateProgress = (startDate: string, targetDate: string, completionDate?: string) => {
    const start = new Date(startDate).getTime();
    const target = new Date(targetDate).getTime();
    const now = completionDate ? new Date(completionDate).getTime() : Date.now();

    const progress = Math.min(((now - start) / (target - start)) * 100, 100);
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
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchOptimizations} className="mt-2">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {optimizations.map((optimization) => {
        const StatusIcon = statusConfig[optimization.status].icon;
        const progress = calculateProgress(
          optimization.start_date,
          optimization.target_date,
          optimization.completion_date,
        );

        return (
          <Card key={optimization.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-4">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">{optimization.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {optimization.description}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>

                {/* Badges and Metrics */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={statusConfig[optimization.status].color}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {optimization.status}
                  </Badge>

                  <Badge variant="outline" className={priorityConfig[optimization.priority]}>
                    {optimization.priority}
                  </Badge>

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
                  <Progress value={progress} className="h-2" />

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
                          ? `${optimization.actual_roi}%`
                          : `${optimization.expected_roi}% (target)`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Started: {formatDate(optimization.start_date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      <span>
                        {optimization.completion_date
                          ? `Completed: ${formatDate(optimization.completion_date)}`
                          : `Target: ${formatDate(optimization.target_date)}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {optimizations.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No active optimizations</p>
              <Button variant="outline" size="sm" className="mt-2">
                Create Optimization
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
