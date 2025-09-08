'use client'

import type {
  PerformanceKPI,
  PerformanceMetric,
  PerformanceReport,
} from 'apps/web/types/performance-monitoring'
import { useEffect, useState, } from 'react'

export function usePerformanceMonitoring() {
  const [metrics, setMetrics,] = useState<PerformanceMetric[]>([],)
  const [kpis, setKpis,] = useState<PerformanceKPI[]>([],)
  const [reports, setReports,] = useState<PerformanceReport[]>([],)
  const [isLoading, setIsLoading,] = useState(true,)

  useEffect(() => {
    // Mock data for now
    setMetrics([
      {
        id: '1',
        name: 'Response Time',
        value: 250,
        unit: 'ms',
        threshold: 500,
        status: 'normal',
        timestamp: new Date(),
      },
      {
        id: '2',
        name: 'Memory Usage',
        value: 85,
        unit: '%',
        threshold: 90,
        status: 'warning',
        timestamp: new Date(),
      },
    ],)

    setKpis([
      {
        id: '1',
        name: 'API Uptime',
        value: 99.8,
        target: 99.9,
        unit: '%',
        trend: 'down',
        change: -0.1,
      },
    ],)

    setReports([
      {
        id: '1',
        title: 'Daily Performance Report',
        summary: 'System performance is within normal parameters',
        metrics: [],
        generatedAt: new Date(),
      },
    ],)

    setIsLoading(false,)
  }, [],)

  const refreshMetrics = async () => {
    setIsLoading(true,)
    // Mock refresh
    setTimeout(() => setIsLoading(false,), 1000,)
  }

  return {
    metrics,
    kpis,
    reports,
    isLoading,
    refreshMetrics,
  }
}
