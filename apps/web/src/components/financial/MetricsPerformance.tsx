import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, Zap } from "lucide-react";

export interface MetricsPerformanceProps {
  onPerformanceUpdate?: (metrics: any) => void;
  className?: string;
  "data-testid"?: string;
}

export const MetricsPerformance: React.FC<MetricsPerformanceProps> = ({
  onPerformanceUpdate,
  className,
  "data-testid": testId,
}) => {
  const [performance, setPerformance] = useState({
    loadTime: 0,
    queryTime: 0,
    cacheHitRate: 0,
    throughput: 0,
    errorRate: 0,
    status: 'good' as 'good' | 'warning' | 'critical'
  });

  useEffect(() => {
    // Mock performance data
    const mockPerformance = {
      loadTime: 1.2,
      queryTime: 0.8,
      cacheHitRate: 85,
      throughput: 150,
      errorRate: 2.1,
      status: 'good' as const
    };

    setPerformance(mockPerformance);

    if (onPerformanceUpdate) {
      onPerformanceUpdate(mockPerformance);
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getProgressColor = (value: number, threshold: number) => {
    if (value >= threshold) return 'bg-red-500';
    if (value >= threshold * 0.8) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card className={className} data-testid={testId}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Metrics Performance
          </div>
          <Badge 
            className={`${getStatusColor(performance.status)} text-white`}
          >
            {performance.status.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Load Time</span>
              </div>
              <span className="text-sm text-gray-500">{performance.loadTime}s</span>
            </div>
            <Progress 
              value={(performance.loadTime / 3) * 100} 
              className="h-2"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span className="text-sm font-medium">Query Time</span>
              </div>
              <span className="text-sm text-gray-500">{performance.queryTime}s</span>
            </div>
            <Progress 
              value={(performance.queryTime / 2) * 100}
              className="h-2"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Cache Hit Rate</span>
              <span className="text-sm text-gray-500">{performance.cacheHitRate}%</span>
            </div>
            <Progress 
              value={performance.cacheHitRate}
              className="h-2"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Throughput</span>
              <span className="text-sm text-gray-500">{performance.throughput} req/min</span>
            </div>
            <Progress 
              value={(performance.throughput / 200) * 100}
              className="h-2"
            />
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Error Rate</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{performance.errorRate}%</span>
              <div 
                className={`h-2 w-16 rounded-full ${getProgressColor(performance.errorRate, 5)}`}
                style={{width: `${Math.min(performance.errorRate * 2, 16)}px`}}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricsPerformance;