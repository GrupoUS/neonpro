"use client";

import { useEffect, useState } from "react";

export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  threshold?: number;
  status: "normal" | "warning" | "critical";
  timestamp: Date;
}

export interface PerformanceKPI {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: "up" | "down" | "stable";
  change: number;
}

export interface PerformanceReport {
  id: string;
  title: string;
  summary: string;
  metrics: PerformanceMetric[];
  generatedAt: Date;
}

export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [kpis, setKpis] = useState<PerformanceKPI[]>([]);
  const [reports, setReports] = useState<PerformanceReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data for now
    setMetrics([
      {
        id: "1",
        name: "Response Time",
        value: 250,
        unit: "ms",
        threshold: 500,
        status: "normal",
        timestamp: new Date(),
      },
      {
        id: "2",
        name: "Memory Usage",
        value: 85,
        unit: "%",
        threshold: 90,
        status: "warning",
        timestamp: new Date(),
      },
    ]);

    setKpis([
      {
        id: "1",
        name: "API Uptime",
        value: 99.8,
        target: 99.9,
        unit: "%",
        trend: "down",
        change: -0.1,
      },
    ]);

    setReports([
      {
        id: "1",
        title: "Daily Performance Report",
        summary: "System performance is within normal parameters",
        metrics: [],
        generatedAt: new Date(),
      },
    ]);

    setIsLoading(false);
  }, []);

  const refreshMetrics = async () => {
    setIsLoading(true);
    // Mock refresh
    setTimeout(() => setIsLoading(false), 1000);
  };

  return {
    metrics,
    kpis,
    reports,
    isLoading,
    refreshMetrics,
  };
}
