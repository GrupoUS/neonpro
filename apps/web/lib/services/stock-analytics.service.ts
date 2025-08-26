import { createClient } from "@/lib/supabase/client";
import type {
  CustomStockReport,
  StockDashboardData,
  StockPerformanceMetrics,
} from "@/lib/types/stock-alerts";

/**
 * Stock Analytics Service - Performance metrics, trends analysis, and reporting
 */
export class StockAnalyticsService {
  private readonly supabase = createClient();

  /**
   * Get user's clinic context
   */
  private async getUserClinicId(userId: string): Promise<string> {
    const { data, error } = await this.supabase
      .from("healthcare_professionals")
      .select("clinic_id")
      .eq("user_id", userId)
      .single();

    if (error || !data?.clinic_id) {
      throw new Error("User clinic context not found");
    }

    return data.clinic_id;
  }

  /**
   * Calculate comprehensive stock performance metrics for a period
   */
  async calculatePerformanceMetrics(
    userId: string,
    period: { start: Date; end: Date },
    productId?: string,
    categoryId?: string,
  ): Promise<StockPerformanceMetrics> {
    const clinicId = await this.getUserClinicId(userId);

    // Base queries for the period
    let inventoryQuery = this.supabase
      .from("inventory_items")
      .select("*")
      .eq("clinic_id", clinicId);

    let transactionQuery = this.supabase
      .from("stock_transactions")
      .select("*")
      .eq("clinic_id", clinicId)
      .gte("created_at", period.start.toISOString())
      .lte("created_at", period.end.toISOString());

    let alertQuery = this.supabase
      .from("stock_alerts")
      .select("*")
      .eq("clinic_id", clinicId)
      .gte("created_at", period.start.toISOString())
      .lte("created_at", period.end.toISOString());

    // Apply filters
    if (productId) {
      inventoryQuery = inventoryQuery.eq("product_id", productId);
      transactionQuery = transactionQuery.eq("product_id", productId);
      alertQuery = alertQuery.eq("product_id", productId);
    }
    if (categoryId) {
      inventoryQuery = inventoryQuery.eq("category_id", categoryId);
      transactionQuery = transactionQuery.eq("category_id", categoryId);
      alertQuery = alertQuery.eq("category_id", categoryId);
    }

    // Execute queries
    const [{ data: inventory }, { data: transactions }, { data: alerts }] =
      await Promise.all([inventoryQuery, transactionQuery, alertQuery]);

    // Calculate metrics
    const metrics = await this.computeMetrics(
      inventory || [],
      transactions || [],
      alerts || [],
      period,
    );

    // Analyze trends
    const trends = await this.analyzeTrends(
      clinicId,
      period,
      productId,
      categoryId,
    );

    return {
      clinicId,
      productId,
      categoryId,
      period,
      metrics,
      trends,
      calculatedAt: new Date(),
    };
  }

  /**
   * Compute core performance metrics
   */
  private async computeMetrics(
    inventory: any[],
    transactions: any[],
    alerts: any[],
    period: { start: Date; end: Date },
  ): Promise<StockPerformanceMetrics["metrics"]> {
    // Total value and quantity
    const totalValue = inventory.reduce(
      (sum, item) => sum + (item.current_quantity * item.unit_cost || 0),
      0,
    );
    const totalQuantity = inventory.reduce(
      (sum, item) => sum + (item.current_quantity || 0),
      0,
    );

    // Stock movements for turnover calculation
    const outboundTransactions = transactions.filter(
      (t) => t.transaction_type === "outbound",
    );
    const totalOutbound = outboundTransactions.reduce(
      (sum, t) => sum + Math.abs(t.quantity_change || 0),
      0,
    );

    // Average stock level (simplified calculation)
    const averageStockLevel = totalQuantity / Math.max(inventory.length, 1);

    // Turnover rate (annual equivalent)
    const daysInPeriod = Math.ceil(
      (period.end.getTime() - period.start.getTime()) / (1000 * 60 * 60 * 24),
    );
    const annualizedOutbound = (totalOutbound * 365) / daysInPeriod;
    const turnoverRate =
      averageStockLevel > 0
        ? Math.min((annualizedOutbound / averageStockLevel) * 100, 100)
        : 0;

    // Alert-based metrics
    const stockoutEvents = alerts.filter(
      (a) => a.alert_type === "out_of_stock",
    ).length;
    const lowStockAlerts = alerts.filter(
      (a) => a.alert_type === "low_stock",
    ).length;

    // Expiration metrics
    const expiredItems = inventory.filter(
      (item) => new Date(item.expiry_date) < new Date(),
    );
    const totalItems = inventory.length;
    const expirationRate =
      totalItems > 0 ? (expiredItems.length / totalItems) * 100 : 0;

    // Waste calculation (estimated from expired items)
    const wasteAmount = expiredItems.reduce(
      (sum, item) => sum + (item.current_quantity * item.unit_cost || 0),
      0,
    );

    // Supplier performance (simplified - based on delivery timeliness)
    const supplierPerformance = await this.calculateSupplierPerformance(
      transactions,
      period,
    );

    return {
      totalValue,
      totalQuantity,
      turnoverRate,
      averageStockLevel,
      stockoutEvents,
      lowStockAlerts,
      expirationRate,
      wasteAmount,
      supplierPerformance,
    };
  }

  /**
   * Calculate supplier performance score
   */
  private async calculateSupplierPerformance(
    transactions: any[],
    _period: { start: Date; end: Date },
  ): Promise<number> {
    const inboundTransactions = transactions.filter(
      (t) => t.transaction_type === "inbound" && t.supplier_id,
    );

    if (inboundTransactions.length === 0) {
      return 0;
    }

    // Simplified calculation based on transaction success rate
    const successfulDeliveries = inboundTransactions.filter(
      (t) => t.status === "completed",
    ).length;

    return (successfulDeliveries / inboundTransactions.length) * 100;
  }

  /**
   * Analyze trends over time
   */
  private async analyzeTrends(
    clinicId: string,
    period: { start: Date; end: Date },
    productId?: string,
    categoryId?: string,
  ): Promise<StockPerformanceMetrics["trends"]> {
    // Calculate previous period for comparison
    const periodLength = period.end.getTime() - period.start.getTime();
    const previousPeriod = {
      start: new Date(period.start.getTime() - periodLength),
      end: period.start,
    };

    // Get metrics for both periods
    const [currentMetrics, previousMetrics] = await Promise.all([
      this.getBasicMetricsForPeriod(clinicId, period, productId, categoryId),
      this.getBasicMetricsForPeriod(
        clinicId,
        previousPeriod,
        productId,
        categoryId,
      ),
    ]);

    return {
      stockLevelTrend: this.compareTrend(
        currentMetrics.averageStockLevel,
        previousMetrics.averageStockLevel,
      ),
      alertFrequencyTrend: this.compareTrend(
        currentMetrics.alertCount,
        previousMetrics.alertCount,
        true, // Reverse logic - fewer alerts is better
      ),
      turnoverTrend:
        this.compareTrend(
          currentMetrics.turnoverRate,
          previousMetrics.turnoverRate,
        ) === "increasing"
          ? "improving"
          : this.compareTrend(
                currentMetrics.turnoverRate,
                previousMetrics.turnoverRate,
              ) === "decreasing"
            ? "declining"
            : "stable",
    };
  }

  /**
   * Get basic metrics for a period (for trend analysis)
   */
  private async getBasicMetricsForPeriod(
    clinicId: string,
    period: { start: Date; end: Date },
    productId?: string,
    categoryId?: string,
  ): Promise<{
    averageStockLevel: number;
    alertCount: number;
    turnoverRate: number;
  }> {
    let inventoryQuery = this.supabase
      .from("inventory_items")
      .select("current_quantity")
      .eq("clinic_id", clinicId);

    let alertQuery = this.supabase
      .from("stock_alerts")
      .select("id")
      .eq("clinic_id", clinicId)
      .gte("created_at", period.start.toISOString())
      .lte("created_at", period.end.toISOString());

    if (productId) {
      inventoryQuery = inventoryQuery.eq("product_id", productId);
      alertQuery = alertQuery.eq("product_id", productId);
    }
    if (categoryId) {
      inventoryQuery = inventoryQuery.eq("category_id", categoryId);
      alertQuery = alertQuery.eq("category_id", categoryId);
    }

    const [{ data: inventory }, { data: alerts }] = await Promise.all([
      inventoryQuery,
      alertQuery,
    ]);

    const averageStockLevel =
      inventory && inventory.length > 0
        ? inventory.reduce(
            (sum, item) => sum + (item.current_quantity || 0),
            0,
          ) / inventory.length
        : 0;

    return {
      averageStockLevel,
      alertCount: alerts?.length || 0,
      turnoverRate: 0, // Simplified for trend analysis
    };
  }

  /**
   * Compare values to determine trend
   */
  private compareTrend(
    current: number,
    previous: number,
    reverse = false,
  ): "increasing" | "decreasing" | "stable" {
    const threshold = 0.05; // 5% threshold for "stable"
    const change = (current - previous) / Math.max(previous, 1);

    if (Math.abs(change) < threshold) {
      return "stable";
    }

    if (reverse) {
      return change > 0 ? "decreasing" : "increasing";
    }

    return change > 0 ? "increasing" : "decreasing";
  }

  /**
   * Generate comprehensive dashboard data
   */
  async generateDashboardData(userId: string): Promise<StockDashboardData> {
    const clinicId = await this.getUserClinicId(userId);

    // Get summary statistics
    const { data: inventory } = await this.supabase
      .from("inventory_items")
      .select("*")
      .eq("clinic_id", clinicId);

    const { data: alerts } = await this.supabase
      .from("stock_alerts")
      .select("*")
      .eq("clinic_id", clinicId)
      .eq("status", "active");

    // Calculate summary
    const summary = this.calculateSummary(inventory || [], alerts || []);

    // Get recent alerts (limited)
    const recentAlerts = (alerts || [])
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .slice(0, 100)
      .map((alert) => ({
        id: alert.id,
        productId: alert.product_id,
        alertType: alert.alert_type,
        severityLevel: alert.severity_level,
        message: alert.message,
        createdAt: new Date(alert.created_at),
      }));

    // Get top products by value and alert count
    const topProducts = await this.getTopProducts(clinicId);

    // Get recent activity
    const recentActivity = await this.getRecentActivity(clinicId);

    return {
      clinicId,
      summary,
      alerts: recentAlerts,
      topProducts,
      recentActivity,
      lastUpdated: new Date(),
    };
  }

  /**
   * Calculate dashboard summary statistics
   */
  private calculateSummary(
    inventory: any[],
    alerts: any[],
  ): StockDashboardData["summary"] {
    const lowStockThreshold = 10; // Configurable threshold

    const lowStockItems = inventory.filter(
      (item) => (item.current_quantity || 0) <= lowStockThreshold,
    ).length;

    const expiredItems = inventory.filter(
      (item) => new Date(item.expiry_date) < new Date(),
    ).length;

    const expiringItems = inventory.filter((item) => {
      const expiryDate = new Date(item.expiry_date);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return expiryDate <= thirtyDaysFromNow && expiryDate > new Date();
    }).length;

    const totalValue = inventory.reduce(
      (sum, item) => sum + (item.current_quantity || 0) * (item.unit_cost || 0),
      0,
    );

    return {
      totalProducts: inventory.length,
      lowStockItems,
      expiredItems,
      expiringItems,
      totalValue,
      activeAlerts: alerts.length,
    };
  }

  /**
   * Get top products by value and alert frequency
   */
  private async getTopProducts(
    clinicId: string,
  ): Promise<StockDashboardData["topProducts"]> {
    const { data: inventory } = await this.supabase
      .from("inventory_items")
      .select(
        `
        product_id,
        product_name,
        current_quantity,
        unit_cost,
        stock_alerts (count)
      `,
      )
      .eq("clinic_id", clinicId);

    if (!inventory) {
      return [];
    }

    return inventory
      .map((item) => ({
        productId: item.product_id,
        name: item.product_name,
        currentStock: item.current_quantity || 0,
        value: (item.current_quantity || 0) * (item.unit_cost || 0),
        alertCount: item.stock_alerts?.length || 0,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }

  /**
   * Get recent activity feed
   */
  private async getRecentActivity(
    clinicId: string,
  ): Promise<StockDashboardData["recentActivity"]> {
    // Combine different activity sources
    const activities: StockDashboardData["recentActivity"] = [];

    // Recent alerts
    const { data: recentAlerts } = await this.supabase
      .from("stock_alerts")
      .select("id, alert_type, message, created_at")
      .eq("clinic_id", clinicId)
      .order("created_at", { ascending: false })
      .limit(10);

    // Recent stock transactions
    const { data: recentTransactions } = await this.supabase
      .from("stock_transactions")
      .select(
        "id, transaction_type, quantity_change, product_id, created_at, user_id",
      )
      .eq("clinic_id", clinicId)
      .order("created_at", { ascending: false })
      .limit(10);

    // Add alerts to activity feed
    if (recentAlerts) {
      activities.push(
        ...recentAlerts.map((alert) => ({
          id: alert.id,
          type: "alert_created" as const,
          description: `${alert.alert_type.replace("_", " ").toUpperCase()}: ${alert.message}`,
          timestamp: new Date(alert.created_at),
        })),
      );
    }

    // Add transactions to activity feed
    if (recentTransactions) {
      activities.push(
        ...recentTransactions.map((transaction) => ({
          id: transaction.id,
          type: "stock_updated" as const,
          description: `Stock ${transaction.transaction_type}: ${Math.abs(
            transaction.quantity_change || 0,
          )} units`,
          timestamp: new Date(transaction.created_at),
          userId: transaction.user_id,
        })),
      );
    }

    // Sort by timestamp and limit to 20 most recent
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 20);
  }

  /**
   * Generate custom stock report
   */
  async generateCustomReport(
    reportConfig: Omit<CustomStockReport, "id" | "createdAt" | "updatedAt">,
    userId: string,
  ): Promise<CustomStockReport> {
    const clinicId = await this.getUserClinicId(userId);

    // Validate user access to this clinic
    if (reportConfig.clinicId !== clinicId) {
      throw new Error("Access denied to this clinic");
    }

    const reportId = crypto.randomUUID();
    const now = new Date();

    const report: CustomStockReport = {
      ...reportConfig,
      id: reportId,
      createdAt: now,
      updatedAt: now,
    };

    // Generate report data based on type and filters
    const _reportData = await this.generateReportData(report);

    // Store report configuration for future reference
    await this.supabase.from("custom_reports").insert({
      id: reportId,
      clinic_id: clinicId,
      user_id: userId,
      report_name: report.reportName,
      report_type: report.reportType,
      filters: report.filters,
      format: report.format,
      schedule: report.schedule,
      created_at: now,
      updated_at: now,
    });

    return report;
  }

  /**
   * Generate actual report data based on configuration
   */
  private async generateReportData(report: CustomStockReport): Promise<any> {
    switch (report.reportType) {
      case "stock_levels": {
        return await this.generateStockLevelsReport(report);
      }
      case "alerts_summary": {
        return await this.generateAlertsSummaryReport(report);
      }
      case "performance_metrics": {
        return await this.generatePerformanceReport(report);
      }
      case "consumption": {
        return await this.generateConsumptionReport(report);
      }
      default: {
        throw new Error(`Unsupported report type: ${report.reportType}`);
      }
    }
  }

  /**
   * Generate stock levels report
   */
  private async generateStockLevelsReport(
    report: CustomStockReport,
  ): Promise<any> {
    let query = this.supabase
      .from("inventory_items")
      .select("*")
      .eq("clinic_id", report.clinicId);

    if (report.filters?.productIds?.length) {
      query = query.in("product_id", report.filters.productIds);
    }
    if (report.filters?.categoryIds?.length) {
      query = query.in("category_id", report.filters.categoryIds);
    }

    const { data } = await query;
    return data || [];
  }

  /**
   * Generate alerts summary report
   */
  private async generateAlertsSummaryReport(
    report: CustomStockReport,
  ): Promise<any> {
    let query = this.supabase
      .from("stock_alerts")
      .select("*")
      .eq("clinic_id", report.clinicId);

    if (report.filters?.alertTypes?.length) {
      query = query.in("alert_type", report.filters.alertTypes);
    }
    if (report.filters?.severityLevels?.length) {
      query = query.in("severity_level", report.filters.severityLevels);
    }
    if (report.filters?.dateRange) {
      query = query
        .gte("created_at", report.filters.dateRange.start.toISOString())
        .lte("created_at", report.filters.dateRange.end.toISOString());
    }

    const { data } = await query;
    return data || [];
  }

  /**
   * Generate performance metrics report
   */
  private async generatePerformanceReport(
    report: CustomStockReport,
  ): Promise<any> {
    const dateRange = report.filters?.dateRange || {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      end: new Date(),
    };

    return await this.calculatePerformanceMetrics(
      report.userId,
      dateRange,
      report.filters?.productIds?.[0],
      report.filters?.categoryIds?.[0],
    );
  }

  /**
   * Generate consumption report
   */
  private async generateConsumptionReport(
    report: CustomStockReport,
  ): Promise<any> {
    let query = this.supabase
      .from("stock_transactions")
      .select("*")
      .eq("clinic_id", report.clinicId)
      .eq("transaction_type", "outbound");

    if (report.filters?.productIds?.length) {
      query = query.in("product_id", report.filters.productIds);
    }
    if (report.filters?.dateRange) {
      query = query
        .gte("created_at", report.filters.dateRange.start.toISOString())
        .lte("created_at", report.filters.dateRange.end.toISOString());
    }

    const { data } = await query;
    return data || [];
  }
}

// Export singleton instance
export const stockAnalyticsService = new StockAnalyticsService();
export default stockAnalyticsService;
