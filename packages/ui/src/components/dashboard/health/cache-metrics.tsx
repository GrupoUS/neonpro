"use client";

import { useEffect, useState } from "react";
import { MetricWidget } from "./metric-widgets";

interface CacheLayerStats {
  layer: string;
  hitRate: number;
  responseTime: number;
  totalRequests: number;
  hits: number;
  misses: number;
}

interface CacheMetricsProps {
  cacheManager?: { getAllStats: () => Promise<Record<string, any>>; };
  refreshInterval?: number;
}

export function CacheMetrics({
  cacheManager,
  refreshInterval = 30_000,
}: CacheMetricsProps) {
  const [layerStats, setLayerStats] = useState<CacheLayerStats[]>([]);
  const [overallStats, setOverallStats] = useState({
    hitRate: 0,
    responseTime: 0,
    totalRequests: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!cacheManager) {
      return;
    }

    const fetchCacheStats = async () => {
      try {
        const allStats = await cacheManager.getAllStats();
        const stats: CacheLayerStats[] = [];
        let totalHits = 0;
        let totalRequests = 0;
        let totalResponseTime = 0;

        for (const [layer, layerData] of Object.entries(allStats)) {
          const data = layerData as any;
          stats.push({
            layer,
            hitRate: data.hitRate,
            responseTime: data.averageResponseTime,
            totalRequests: data.totalRequests,
            hits: data.hits,
            misses: data.misses,
          });

          totalHits += data.hits;
          totalRequests += data.totalRequests;
          totalResponseTime += data.averageResponseTime;
        }

        setLayerStats(stats);
        setOverallStats({
          hitRate: totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0,
          responseTime: stats.length > 0 ? totalResponseTime / stats.length : 0,
          totalRequests,
        });
        setIsLoading(false);
      } catch {
        setIsLoading(false);
      }
    };

    fetchCacheStats();
    const interval = setInterval(fetchCacheStats, refreshInterval);
    return () => clearInterval(interval);
  }, [cacheManager, refreshInterval]);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="mb-4 h-32 rounded bg-gray-200" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 rounded bg-gray-200" />
          <div className="h-24 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 font-semibold text-gray-900 text-xl">
          Cache Performance
        </h2>

        {/* Overall Performance */}
        <MetricWidget
          color={overallStats.hitRate >= 85
            ? "green"
            : overallStats.hitRate >= 70
            ? "yellow"
            : "red"}
          description="Target: 85% hit rate across all cache layers"
          title="Overall Cache Hit Rate"
          value={{
            current: overallStats.hitRate,
            target: 85, // 85% target
            unit: "%",
            trend: overallStats.hitRate >= 85
              ? "up"
              : overallStats.hitRate >= 70
              ? "stable"
              : "down",
          }}
        />
      </div>

      {/* Layer-specific metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {layerStats.map((layer) => (
          <div className="rounded-lg bg-white p-4 shadow" key={layer.layer}>
            <h3 className="mb-3 font-medium text-gray-900 capitalize">
              {layer.layer} Cache
            </h3>

            <div className="space-y-3">
              <div>
                <div className="font-bold text-blue-600 text-lg">
                  {layer.hitRate.toFixed(1)}%
                </div>
                <div className="text-gray-600 text-xs">Hit Rate</div>
              </div>

              <div>
                <div className="font-bold text-green-600 text-lg">
                  {layer.responseTime.toFixed(0)}ms
                </div>
                <div className="text-gray-600 text-xs">Avg Response</div>
              </div>

              <div className="border-t pt-2">
                <div className="flex justify-between text-gray-600 text-xs">
                  <span>Hits: {layer.hits.toLocaleString()}</span>
                  <span>Total: {layer.totalRequests.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
