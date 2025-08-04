/**
 * Healthcare Analytics - LGPD Compliant
 * Anonymous usage tracking for healthcare platform
 */

import { Analytics } from '@vercel/analytics/react';

// Healthcare-specific events for analytics
export type HealthcareEvent = 
  | 'patient_created'
  | 'appointment_scheduled'
  | 'report_generated'
  | 'dashboard_viewed'
  | 'search_performed'
  | 'export_requested'
  | 'system_login'
  | 'feature_used';

interface HealthcareEventData {
  module: string;
  action: string;
  department?: string;
  user_role?: string;
  duration_ms?: number;
  success?: boolean;
}

// LGPD-compliant analytics tracking
export function trackHealthcareEvent(
  event: HealthcareEvent, 
  data: HealthcareEventData
) {
  // Only track in production and if analytics is enabled
  if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL_ANALYTICS_ID) {
    return;
  }

  // Remove any PII before tracking
  const sanitizedData = {
    module: data.module,
    action: data.action,
    department: data.department,
    user_role: data.user_role,
    duration_ms: data.duration_ms,
    success: data.success,
    timestamp: new Date().toISOString(),
    // Don't include user IDs, names, or patient data
  };

  // Use Vercel Analytics for tracking
  if (typeof window !== 'undefined' && window.va) {
    window.va('track', event, sanitizedData);
  }
}

// Performance monitoring for healthcare critical paths
export function trackPerformance(
  operation: string,
  startTime: number,
  metadata?: Record<string, any>
) {
  const duration = Date.now() - startTime;
  
  // Track slow operations that affect patient care
  if (duration > 2000) { // 2+ seconds is concerning for healthcare
    trackHealthcareEvent('feature_used', {
      module: 'performance',
      action: operation,
      duration_ms: duration,
      success: true,
      ...metadata,
    });
  }
}

// Healthcare dashboard usage analytics
export function trackDashboardUsage(
  dashboard: string,
  user_role: string,
  department: string
) {
  trackHealthcareEvent('dashboard_viewed', {
    module: 'dashboard',
    action: dashboard,
    user_role,
    department,
  });
}

// Track search patterns (anonymized)
export function trackSearch(
  search_type: 'patient' | 'appointment' | 'doctor' | 'report',
  result_count: number,
  user_role: string
) {
  trackHealthcareEvent('search_performed', {
    module: 'search',
    action: search_type,
    user_role,
    success: result_count > 0,
  });
}

// Track system health metrics
export function trackSystemHealth(
  metric: 'login_success' | 'login_failure' | 'api_error' | 'database_slow',
  value: number
) {
  trackHealthcareEvent('system_login', {
    module: 'system',
    action: metric,
    duration_ms: value,
    success: !metric.includes('failure') && !metric.includes('error'),
  });
}