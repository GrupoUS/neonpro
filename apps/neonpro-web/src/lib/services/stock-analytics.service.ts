// Stock Analytics Service
// Analytics and metrics system for stock alert resolution tracking
// Story 11.4: Enhanced Stock Alerts System
// Created: 2025-01-21 (Claude Code Implementation)

import type { createClient } from "@/lib/supabase/server";

export interface AlertResolutionMetrics {
  id: string;
  clinic_id: string;
  metric_date: Date;
  alert_type: "low_stock" | "expiring" | "expired" | "overstock" | "critical_shortage" | "all";
  severity_level: "low" | "medium" | "high" | "critical" | "all";
  total_alerts_created: number;
  total_alerts_resolved: number;
  total_alerts_dismissed: number;
  avg_resolution_time_hours?: number;
  avg_acknowledgment_time_hours?: number;
  fastest_resolution_time_hours?: number;
  slowest_resolution_time_hours?: number;
  resolution_rate_percentage?: number;
  recurrence_count: number;
  automation_triggered_count: number;
  notification_sent_count: number;
  notification_success_rate?: number;
}

export interface AnalyticsQuery {
  clinicId: string;
  startDate: Date;
  endDate: Date;
  alertType?: string;
  severityLevel?: string;
  groupBy?: "day" | "week" | "month";
}

export interface ResolutionTimeAnalysis {
  alert_id: string;
  created_at: Date;
  acknowledged_at?: Date;
  resolved_at?: Date;
  acknowledgment_time_hours?: number;
  resolution_time_hours?: number;
  total_time_hours?: number;
}

export interface RecurrencePattern {
  product_id: string;
  product_name: string;
  alert_type: string;
  frequency_count: number;
  avg_days_between: number;
  last_occurrence: Date;
  trend: "increasing" | "decreasing" | "stable";
}

class StockAnalyticsService {
  private async getSupabaseClient() {
    return await createClient();
  }

  // ==========================================
  // METRICS CALCULATION
  // ==========================================

  async calculateDailyMetrics(
    clinicId: string,
    date: Date,
    alertType?: string,
    severityLevel?: string,
  ): Promise<AlertResolutionMetrics | null> {
    try {
      const supabase = await this.getSupabaseClient();
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Base query conditions
      let query = supabase
        .from("stock_alerts_history")
        .select("*")
        .eq("clinic_id", clinicId)
        .gte("created_at", startOfDay.toISOString())
        .lte("created_at", endOfDay.toISOString());

      // Apply filters if specified
      if (alertType && alertType !== "all") {
        query = query.eq("alert_type", alertType);
      }

      if (severityLevel && severityLevel !== "all") {
        query = query.eq("severity_level", severityLevel);
      }

      const { data: alerts, error } = await query;

      if (error) {
        console.error("Error fetching alerts for metrics:", error);
        return null;
      }

      // Calculate metrics
      const totalAlertsCreated = alerts.length;
      const resolvedAlerts = alerts.filter((a) => a.status === "resolved");
      const dismissedAlerts = alerts.filter((a) => a.status === "dismissed");
      const totalAlertsResolved = resolvedAlerts.length;
      const totalAlertsDismissed = dismissedAlerts.length;

      // Calculate resolution times
      const resolutionTimes = resolvedAlerts
        .filter((a) => a.resolved_at)
        .map((a) => {
          const created = new Date(a.created_at);
          const resolved = new Date(a.resolved_at);
          return (resolved.getTime() - created.getTime()) / (1000 * 60 * 60); // hours
        });

      // Calculate acknowledgment times
      const acknowledgmentTimes = alerts
        .filter((a) => a.acknowledged_at)
        .map((a) => {
          const created = new Date(a.created_at);
          const acknowledged = new Date(a.acknowledged_at);
          return (acknowledged.getTime() - created.getTime()) / (1000 * 60 * 60); // hours
        });

      const avgResolutionTime =
        resolutionTimes.length > 0
          ? resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length
          : undefined;

      const avgAcknowledgmentTime =
        acknowledgmentTimes.length > 0
          ? acknowledgmentTimes.reduce((sum, time) => sum + time, 0) / acknowledgmentTimes.length
          : undefined;

      const fastestResolutionTime =
        resolutionTimes.length > 0 ? Math.min(...resolutionTimes) : undefined;
      const slowestResolutionTime =
        resolutionTimes.length > 0 ? Math.max(...resolutionTimes) : undefined;

      const resolutionRate =
        totalAlertsCreated > 0 ? (totalAlertsResolved / totalAlertsCreated) * 100 : 0;

      // Calculate recurrence count (alerts for same product in last 30 days)
      const thirtyDaysAgo = new Date(date.getTime() - 30 * 24 * 60 * 60 * 1000);
      const recurrenceCount = await this.calculateRecurrenceCount(
        clinicId,
        thirtyDaysAgo,
        date,
        alertType,
        severityLevel,
      );

      // Get notification metrics
      const notificationMetrics = await this.calculateNotificationMetrics(
        clinicId,
        date,
        alertType,
        severityLevel,
      );

      return {
        id: "", // Will be set when saving to database
        clinic_id: clinicId,
        metric_date: date,
        alert_type: (alertType || "all") as any,
        severity_level: (severityLevel || "all") as any,
        total_alerts_created: totalAlertsCreated,
        total_alerts_resolved: totalAlertsResolved,
        total_alerts_dismissed: totalAlertsDismissed,
        avg_resolution_time_hours: avgResolutionTime,
        avg_acknowledgment_time_hours: avgAcknowledgmentTime,
        fastest_resolution_time_hours: fastestResolutionTime,
        slowest_resolution_time_hours: slowestResolutionTime,
        resolution_rate_percentage: resolutionRate,
        recurrence_count: recurrenceCount,
        automation_triggered_count: notificationMetrics.automationTriggered,
        notification_sent_count: notificationMetrics.notificationsSent,
        notification_success_rate: notificationMetrics.successRate,
      };
    } catch (error) {
      console.error("Error calculating daily metrics:", error);
      return null;
    }
  }

  private async calculateRecurrenceCount(
    clinicId: string,
    startDate: Date,
    endDate: Date,
    alertType?: string,
    severityLevel?: string,
  ): Promise<number> {
    try {
      const supabase = await this.getSupabaseClient();
      let query = supabase
        .from("stock_alerts_history")
        .select("product_id")
        .eq("clinic_id", clinicId)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      if (alertType && alertType !== "all") {
        query = query.eq("alert_type", alertType);
      }

      if (severityLevel && severityLevel !== "all") {
        query = query.eq("severity_level", severityLevel);
      }

      const { data: alerts, error } = await query;

      if (error) {
        console.error("Error calculating recurrence count:", error);
        return 0;
      }

      // Count products with more than 1 alert
      const productCounts = alerts.reduce(
        (acc, alert) => {
          acc[alert.product_id] = (acc[alert.product_id] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      return Object.values(productCounts).filter((count) => count > 1).length;
    } catch (error) {
      console.error("Error in calculateRecurrenceCount:", error);
      return 0;
    }
  }

  private async calculateNotificationMetrics(
    clinicId: string,
    date: Date,
    alertType?: string,
    severityLevel?: string,
  ): Promise<{
    automationTriggered: number;
    notificationsSent: number;
    successRate: number;
  }> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Get notification deliveries for the day
      const supabase = await this.getSupabaseClient();
      const { data: notifications, error } = await supabase
        .from("notification_deliveries")
        .select(`
          *,
          stock_alerts_history!inner(
            alert_type,
            severity_level
          )
        `)
        .eq("clinic_id", clinicId)
        .gte("created_at", startOfDay.toISOString())
        .lte("created_at", endOfDay.toISOString());

      if (error) {
        console.error("Error fetching notification metrics:", error);
        return { automationTriggered: 0, notificationsSent: 0, successRate: 0 };
      }

      // Filter notifications based on alert type and severity
      const filteredNotifications = notifications?.filter((notif: any) => {
        const alert = notif.stock_alerts_history;
        if (alertType && alertType !== "all" && alert.alert_type !== alertType) return false;
        if (severityLevel && severityLevel !== "all" && alert.severity_level !== severityLevel)
          return false;
        return true;
      });

      const totalNotifications = filteredNotifications.length;
      const successfulNotifications = filteredNotifications.filter(
        (n) => n.status === "sent" || n.status === "delivered",
      ).length;

      const successRate =
        totalNotifications > 0 ? (successfulNotifications / totalNotifications) * 100 : 0;

      // Count automation triggers (purchase orders created, config updates, etc.)
      const automationTriggered = await this.countAutomationTriggers(
        clinicId,
        date,
        alertType,
        severityLevel,
      );

      return {
        automationTriggered,
        notificationsSent: totalNotifications,
        successRate,
      };
    } catch (error) {
      console.error("Error in calculateNotificationMetrics:", error);
      return { automationTriggered: 0, notificationsSent: 0, successRate: 0 };
    }
  }

  private async countAutomationTriggers(
    clinicId: string,
    date: Date,
    alertType?: string,
    severityLevel?: string,
  ): Promise<number> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const supabase = await this.getSupabaseClient();

      // Count purchase orders created from alerts
      const purchaseOrderQuery = supabase
        .from("purchase_order_items")
        .select("alert_trigger_id")
        .not("alert_trigger_id", "is", null)
        .gte("created_at", startOfDay.toISOString())
        .lte("created_at", endOfDay.toISOString());

      const { data: purchaseItems, error: purchaseError } = await purchaseOrderQuery;
      const purchaseOrderTriggers = purchaseItems?.length || 0;

      // Count config updates triggered by alerts
      const configUpdateQuery = supabase
        .from("alert_config_updates_log")
        .select("trigger_alert_id")
        .not("trigger_alert_id", "is", null)
        .gte("created_at", startOfDay.toISOString())
        .lte("created_at", endOfDay.toISOString());

      const { data: configUpdates, error: configError } = await configUpdateQuery;
      const configUpdateTriggers = configUpdates?.length || 0;

      // Count reorder suggestions created
      const reorderQuery = supabase
        .from("reorder_suggestions")
        .select("trigger_alert_id")
        .eq("clinic_id", clinicId)
        .not("trigger_alert_id", "is", null)
        .gte("created_at", startOfDay.toISOString())
        .lte("created_at", endOfDay.toISOString());

      const { data: reorderSuggestions, error: reorderError } = await reorderQuery;
      const reorderTriggers = reorderSuggestions?.length || 0;

      return purchaseOrderTriggers + configUpdateTriggers + reorderTriggers;
    } catch (error) {
      console.error("Error counting automation triggers:", error);
      return 0;
    }
  }

  // ==========================================
  // METRICS STORAGE
  // ==========================================

  async saveMetrics(metrics: AlertResolutionMetrics): Promise<boolean> {
    try {
      const supabase = await this.getSupabaseClient();
      const { error } = await supabase.from("alert_resolution_analytics").upsert({
        clinic_id: metrics.clinic_id,
        metric_date: metrics.metric_date.toISOString().split("T")[0], // Date only
        alert_type: metrics.alert_type,
        severity_level: metrics.severity_level,
        total_alerts_created: metrics.total_alerts_created,
        total_alerts_resolved: metrics.total_alerts_resolved,
        total_alerts_dismissed: metrics.total_alerts_dismissed,
        avg_resolution_time_hours: metrics.avg_resolution_time_hours,
        avg_acknowledgment_time_hours: metrics.avg_acknowledgment_time_hours,
        fastest_resolution_time_hours: metrics.fastest_resolution_time_hours,
        slowest_resolution_time_hours: metrics.slowest_resolution_time_hours,
        resolution_rate_percentage: metrics.resolution_rate_percentage,
        recurrence_count: metrics.recurrence_count,
        automation_triggered_count: metrics.automation_triggered_count,
        notification_sent_count: metrics.notification_sent_count,
        notification_success_rate: metrics.notification_success_rate,
      });

      if (error) {
        console.error("Error saving metrics:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in saveMetrics:", error);
      return false;
    }
  }

  // ==========================================
  // ANALYTICS QUERIES
  // ==========================================

  async getMetrics(query: AnalyticsQuery): Promise<AlertResolutionMetrics[]> {
    try {
      const supabase = await this.getSupabaseClient();
      let dbQuery = supabase
        .from("alert_resolution_analytics")
        .select("*")
        .eq("clinic_id", query.clinicId)
        .gte("metric_date", query.startDate.toISOString().split("T")[0])
        .lte("metric_date", query.endDate.toISOString().split("T")[0]);

      if (query.alertType) {
        dbQuery = dbQuery.eq("alert_type", query.alertType);
      }

      if (query.severityLevel) {
        dbQuery = dbQuery.eq("severity_level", query.severityLevel);
      }

      const { data, error } = await dbQuery.order("metric_date", { ascending: true });

      if (error) {
        console.error("Error fetching metrics:", error);
        return [];
      }

      return data.map((row) => ({
        ...row,
        metric_date: new Date(row.metric_date),
      }));
    } catch (error) {
      console.error("Error in getMetrics:", error);
      return [];
    }
  }

  async getResolutionTimeAnalysis(
    clinicId: string,
    startDate: Date,
    endDate: Date,
    alertType?: string,
  ): Promise<ResolutionTimeAnalysis[]> {
    try {
      const supabase = await this.getSupabaseClient();
      let query = supabase
        .from("stock_alerts_history")
        .select("id, created_at, acknowledged_at, resolved_at, alert_type")
        .eq("clinic_id", clinicId)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .not("resolved_at", "is", null);

      if (alertType) {
        query = query.eq("alert_type", alertType);
      }

      const { data: alerts, error } = await query;

      if (error) {
        console.error("Error fetching resolution time analysis:", error);
        return [];
      }

      return alerts.map((alert) => {
        const created = new Date(alert.created_at);
        const acknowledged = alert.acknowledged_at ? new Date(alert.acknowledged_at) : undefined;
        const resolved = new Date(alert.resolved_at);

        const acknowledgmentTime = acknowledged
          ? (acknowledged.getTime() - created.getTime()) / (1000 * 60 * 60)
          : undefined;

        const resolutionTime = (resolved.getTime() - created.getTime()) / (1000 * 60 * 60);

        return {
          alert_id: alert.id,
          created_at: created,
          acknowledged_at: acknowledged,
          resolved_at: resolved,
          acknowledgment_time_hours: acknowledgmentTime,
          resolution_time_hours: resolutionTime,
          total_time_hours: resolutionTime,
        };
      });
    } catch (error) {
      console.error("Error in getResolutionTimeAnalysis:", error);
      return [];
    }
  }

  async getRecurrencePatterns(
    clinicId: string,
    lookbackDays: number = 90,
  ): Promise<RecurrencePattern[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - lookbackDays);

      const supabase = await this.getSupabaseClient();
      const { data: alerts, error } = await supabase
        .from("stock_alerts_history")
        .select(`
          product_id,
          alert_type,
          created_at,
          products!inner(name)
        `)
        .eq("clinic_id", clinicId)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching recurrence patterns:", error);
        return [];
      }

      // Group by product and alert type
      const patterns = new Map<
        string,
        {
          product_id: string;
          product_name: string;
          alert_type: string;
          dates: Date[];
        }
      >();

      alerts.forEach((alert) => {
        const key = `${alert.product_id}_${alert.alert_type}`;
        if (!patterns.has(key)) {
          patterns.set(key, {
            product_id: alert.product_id,
            product_name: alert.products.name,
            alert_type: alert.alert_type,
            dates: [],
          });
        }
        patterns.get(key)!.dates.push(new Date(alert.created_at));
      });

      // Calculate patterns for products with multiple alerts
      return Array.from(patterns.values())
        .filter((pattern) => pattern.dates.length > 1)
        .map((pattern) => {
          const sortedDates = pattern.dates.sort((a, b) => a.getTime() - b.getTime());
          const intervals = [];

          for (let i = 1; i < sortedDates.length; i++) {
            const days =
              (sortedDates[i].getTime() - sortedDates[i - 1].getTime()) / (1000 * 60 * 60 * 24);
            intervals.push(days);
          }

          const avgDaysBetween = intervals.reduce((sum, days) => sum + days, 0) / intervals.length;

          // Determine trend (simplified - compare first half to second half)
          const mid = Math.floor(intervals.length / 2);
          const firstHalfAvg = intervals.slice(0, mid).reduce((sum, days) => sum + days, 0) / mid;
          const secondHalfAvg =
            intervals.slice(mid).reduce((sum, days) => sum + days, 0) / (intervals.length - mid);

          let trend: "increasing" | "decreasing" | "stable" = "stable";
          if (secondHalfAvg < firstHalfAvg * 0.8) {
            trend = "increasing"; // Shorter intervals = increasing frequency
          } else if (secondHalfAvg > firstHalfAvg * 1.2) {
            trend = "decreasing"; // Longer intervals = decreasing frequency
          }

          return {
            product_id: pattern.product_id,
            product_name: pattern.product_name,
            alert_type: pattern.alert_type,
            frequency_count: pattern.dates.length,
            avg_days_between: Math.round(avgDaysBetween * 100) / 100,
            last_occurrence: sortedDates[sortedDates.length - 1],
            trend,
          };
        })
        .sort((a, b) => b.frequency_count - a.frequency_count);
    } catch (error) {
      console.error("Error in getRecurrencePatterns:", error);
      return [];
    }
  }

  // ==========================================
  // DASHBOARD METRICS
  // ==========================================

  async getDashboardSummary(
    clinicId: string,
    days: number = 30,
  ): Promise<{
    totalAlerts: number;
    resolvedAlerts: number;
    resolutionRate: number;
    avgResolutionTime: number;
    criticalAlertsCount: number;
    recurringIssuesCount: number;
    notificationSuccessRate: number;
    topAlertTypes: Array<{ type: string; count: number }>;
    resolutionTrend: Array<{ date: string; resolved: number; created: number }>;
  }> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get metrics for the period
      const metrics = await this.getMetrics({
        clinicId,
        startDate,
        endDate,
        groupBy: "day",
      });

      // Aggregate totals
      const totalAlerts = metrics.reduce((sum, m) => sum + m.total_alerts_created, 0);
      const resolvedAlerts = metrics.reduce((sum, m) => sum + m.total_alerts_resolved, 0);
      const resolutionRate = totalAlerts > 0 ? (resolvedAlerts / totalAlerts) * 100 : 0;

      const avgResolutionTime =
        metrics
          .filter((m) => m.avg_resolution_time_hours)
          .reduce((sum, m) => sum + (m.avg_resolution_time_hours || 0), 0) /
          metrics.filter((m) => m.avg_resolution_time_hours).length || 0;

      const criticalAlertsCount = metrics
        .filter((m) => m.severity_level === "critical")
        .reduce((sum, m) => sum + m.total_alerts_created, 0);

      const recurringIssuesCount = metrics.reduce((sum, m) => sum + m.recurrence_count, 0);

      const notificationSuccessRate =
        metrics
          .filter((m) => m.notification_success_rate)
          .reduce((sum, m) => sum + (m.notification_success_rate || 0), 0) /
          metrics.filter((m) => m.notification_success_rate).length || 0;

      // Get top alert types
      const supabase = await this.getSupabaseClient();
      const { data: alertTypes, error: alertTypesError } = await supabase
        .from("stock_alerts_history")
        .select("alert_type")
        .eq("clinic_id", clinicId)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      const topAlertTypes = alertTypes
        ? Object.entries(
            alertTypes.reduce(
              (acc, alert) => {
                acc[alert.alert_type] = (acc[alert.alert_type] || 0) + 1;
                return acc;
              },
              {} as Record<string, number>,
            ),
          )
            .map(([type, count]) => ({ type, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
        : [];

      // Get resolution trend (daily)
      const resolutionTrend = metrics
        .filter((m) => m.alert_type === "all" && m.severity_level === "all")
        .map((m) => ({
          date: m.metric_date.toISOString().split("T")[0],
          resolved: m.total_alerts_resolved,
          created: m.total_alerts_created,
        }));

      return {
        totalAlerts,
        resolvedAlerts,
        resolutionRate: Math.round(resolutionRate * 100) / 100,
        avgResolutionTime: Math.round(avgResolutionTime * 100) / 100,
        criticalAlertsCount,
        recurringIssuesCount,
        notificationSuccessRate: Math.round(notificationSuccessRate * 100) / 100,
        topAlertTypes,
        resolutionTrend,
      };
    } catch (error) {
      console.error("Error in getDashboardSummary:", error);
      return {
        totalAlerts: 0,
        resolvedAlerts: 0,
        resolutionRate: 0,
        avgResolutionTime: 0,
        criticalAlertsCount: 0,
        recurringIssuesCount: 0,
        notificationSuccessRate: 0,
        topAlertTypes: [],
        resolutionTrend: [],
      };
    }
  }

  // ==========================================
  // AUTOMATED METRICS CALCULATION
  // ==========================================

  async processMetricsForDate(
    clinicId: string,
    date: Date,
  ): Promise<{
    processed: number;
    success: number;
    failed: number;
    errors: string[];
  }> {
    const results = {
      processed: 0,
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    const alertTypes = [
      "low_stock",
      "expiring",
      "expired",
      "overstock",
      "critical_shortage",
      "all",
    ];
    const severityLevels = ["low", "medium", "high", "critical", "all"];

    try {
      // Calculate metrics for each combination of alert type and severity
      for (const alertType of alertTypes) {
        for (const severityLevel of severityLevels) {
          results.processed++;

          const metrics = await this.calculateDailyMetrics(
            clinicId,
            date,
            alertType,
            severityLevel,
          );
          if (metrics) {
            const saved = await this.saveMetrics(metrics);
            if (saved) {
              results.success++;
            } else {
              results.failed++;
              results.errors.push(`Failed to save metrics for ${alertType}/${severityLevel}`);
            }
          } else {
            results.failed++;
            results.errors.push(`Failed to calculate metrics for ${alertType}/${severityLevel}`);
          }
        }
      }

      return results;
    } catch (error) {
      console.error("Error in processMetricsForDate:", error);
      results.errors.push(error instanceof Error ? error.message : "Unknown error");
      return results;
    }
  }
}

// Singleton instance
const stockAnalyticsService = new StockAnalyticsService();
export default stockAnalyticsService;
