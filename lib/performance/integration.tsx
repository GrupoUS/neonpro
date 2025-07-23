/**
 * Performance Integration Hook
 * Seamlessly integrate performance monitor into NeonPro layout
 */

'use client'

import { useEffect } from 'react'
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

interface PerformanceMetrics {
  lcp: number
  fid: number
  cls: number
  fcp: number
  ttfb: number
}

/**
 * Custom hook for automatic performance monitoring
 */
export function usePerformanceMonitoring() {
  useEffect(() => {
    // Only run in production or when explicitly enabled
    if (process.env.NODE_ENV !== 'production' && !process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_TRACKING) {
      return
    }

    const metrics: Partial<PerformanceMetrics> = {}
    let reportingTimeout: NodeJS.Timeout

    /**
     * Send metrics to API when all are collected
     */
    const sendMetrics = async () => {
      // Calculate performance score based on Google's guidelines
      const score = calculatePerformanceScore(metrics as PerformanceMetrics)
      
      const performanceData = {
        ...metrics,
        score,
        page: window.location.pathname,
        userAgent: navigator.userAgent,
        connection: (navigator as any).connection?.effectiveType || 'unknown',
        deviceType: getDeviceType(),
        timestamp: new Date().toISOString()
      }

      try {
        await fetch('/api/analytics/performance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(performanceData)
        })

        console.log('✅ Performance metrics sent:', performanceData)
      } catch (error) {
        console.error('❌ Failed to send performance metrics:', error)
      }
    }

    /**
     * Collect metrics with debounced reporting
     */
    const collectMetric = (name: keyof PerformanceMetrics, value: number) => {
      metrics[name] = value
      
      // Clear existing timeout
      if (reportingTimeout) {
        clearTimeout(reportingTimeout)
      }
      
      // Report metrics after 2 seconds of inactivity or when all metrics are collected
      const hasAllMetrics = Object.keys(metrics).length >= 5
      const delay = hasAllMetrics ? 100 : 2000
      
      reportingTimeout = setTimeout(sendMetrics, delay)
    }

    // Collect Core Web Vitals
    getCLS((metric) => collectMetric('cls', metric.value))
    getFID((metric) => collectMetric('fid', metric.value))
    getFCP((metric) => collectMetric('fcp', metric.value / 1000)) // Convert to seconds
    getLCP((metric) => collectMetric('lcp', metric.value / 1000)) // Convert to seconds
    getTTFB((metric) => collectMetric('ttfb', metric.value))

    // Cleanup on unmount
    return () => {
      if (reportingTimeout) {
        clearTimeout(reportingTimeout)
      }
    }
  }, [])
}

/**
 * Calculate performance score based on Core Web Vitals
 * Uses Google's performance scoring methodology
 */
function calculatePerformanceScore(metrics: PerformanceMetrics): number {
  if (!metrics.lcp || !metrics.fid || !metrics.cls) {
    return 0
  }

  // Weight factors based on Google's Core Web Vitals importance
  const weights = {
    lcp: 0.25, // Largest Contentful Paint
    fid: 0.25, // First Input Delay
    cls: 0.25, // Cumulative Layout Shift
    fcp: 0.15, // First Contentful Paint
    ttfb: 0.10  // Time to First Byte
  }

  // Score thresholds (good/needs improvement/poor)
  const thresholds = {
    lcp: { good: 2.5, poor: 4.0 },
    fid: { good: 100, poor: 300 },
    cls: { good: 0.1, poor: 0.25 },
    fcp: { good: 1.8, poor: 3.0 },
    ttfb: { good: 800, poor: 1800 }
  }

  let totalScore = 0

  // Calculate score for each metric
  Object.entries(metrics).forEach(([key, value]) => {
    const threshold = thresholds[key as keyof typeof thresholds]
    const weight = weights[key as keyof typeof weights]
    
    if (!threshold || !weight) return

    let score = 100
    
    if (value <= threshold.good) {
      score = 100 // Perfect score
    } else if (value <= threshold.poor) {
      // Linear interpolation between good and poor
      const range = threshold.poor - threshold.good
      const position = value - threshold.good
      score = 100 - ((position / range) * 50)
    } else {
      score = 50 // Poor performance
    }
    
    totalScore += score * weight
  })

  return Math.round(totalScore)
}

/**
 * Detect device type based on user agent and screen size
 */
function getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
  const userAgent = navigator.userAgent.toLowerCase()
  const screenWidth = window.screen.width

  if (/mobile|android|iphone/.test(userAgent) || screenWidth < 768) {
    return 'mobile'
  }
  
  if (/tablet|ipad/.test(userAgent) || (screenWidth >= 768 && screenWidth < 1024)) {
    return 'tablet'
  }
  
  return 'desktop'
}

/**
 * Performance monitoring component for layout integration
 */
export function PerformanceMonitor({ children }: { children: React.ReactNode }) {
  // Initialize performance monitoring
  usePerformanceMonitoring()
  
  // Return children without additional wrapper to avoid layout impact
  return <>{children}</>
}