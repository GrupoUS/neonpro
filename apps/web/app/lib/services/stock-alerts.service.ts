import { createClient } from "@/lib/supabase/client";
import {
  validateAcknowledgeAlert,
  validateCreateStockAlertConfig,
  validateResolveAlert,
} from "@/lib/types/stock-alerts";
import type {
  AcknowledgeAlert,
  AlertsQuery,
  CreateStockAlertConfig,
  ResolveAlert,
  StockAlert,
  StockAlertConfig,
} from "@/lib/types/stock-alerts";

/**
 * Stock Alerts Service - Core business logic for managing stock alerts
 */
export class StockAlertsService {
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
   * Create stock alert configuration
   */
  async createAlertConfig(
    configData: CreateStockAlertConfig,
    userId: string,
  ): Promise<StockAlertConfig> {
    const validatedData = validateCreateStockAlertConfig(configData);
    const clinicId = await this.getUserClinicId(userId);

    // Check for existing configuration
    let duplicateQuery = this.supabase
      .from("stock_alert_configs")
      .select("id")
      .eq("alert_type", validatedData.alertType)
      .eq("clinic_id", clinicId);

    if (validatedData.productId) {
      duplicateQuery = duplicateQuery.eq("product_id", validatedData.productId);
    }
    if (validatedData.categoryId) {
      duplicateQuery = duplicateQuery.eq(
        "category_id",
        validatedData.categoryId,
      );
    }

    const { data: existing } = await duplicateQuery;
    if (existing && existing.length > 0) {
      throw new Error("Alert configuration already exists");
    }

    // Insert new configuration
    const { data, error } = await this.supabase
      .from("stock_alert_configs")
      .insert({
        clinic_id: clinicId,
        product_id: validatedData.productId,
        category_id: validatedData.categoryId,
        alert_type: validatedData.alertType,
        threshold_value: validatedData.thresholdValue,
        threshold_unit: validatedData.thresholdUnit,
        severity_level: validatedData.severityLevel,
        is_active: validatedData.isActive,
        notification_channels: validatedData.notificationChannels,
        created_by: validatedData.createdBy,
        created_at: validatedData.createdAt,
        updated_at: validatedData.createdAt,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create alert configuration: ${error.message}`);
    }

    return data;
  }

  /**
   * Get alert configurations for a clinic
   */
  async getAlertConfigs(userId: string): Promise<StockAlertConfig[]> {
    const clinicId = await this.getUserClinicId(userId);

    const { data, error } = await this.supabase
      .from("stock_alert_configs")
      .select("*")
      .eq("clinic_id", clinicId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to get alert configurations: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get active stock alerts with filtering and pagination
   */
  async getAlerts(
    query: AlertsQuery,
    userId: string,
  ): Promise<{
    alerts: StockAlert[];
    total: number;
  }> {
    const clinicId = await this.getUserClinicId(userId);

    let dbQuery = this.supabase
      .from("stock_alerts")
      .select("*", { count: "exact" })
      .eq("clinic_id", clinicId);

    // Apply filters
    if (query.productId) {
      dbQuery = dbQuery.eq("product_id", query.productId);
    }
    if (query.categoryId) {
      dbQuery = dbQuery.eq("category_id", query.categoryId);
    }
    if (query.alertType) {
      dbQuery = dbQuery.eq("alert_type", query.alertType);
    }
    if (query.severity) {
      dbQuery = dbQuery.eq("severity_level", query.severity);
    }
    if (query.status) {
      dbQuery = dbQuery.eq("status", query.status);
    }
    if (query.dateRange) {
      dbQuery = dbQuery
        .gte("created_at", query.dateRange.start.toISOString())
        .lte("created_at", query.dateRange.end.toISOString());
    }

    // Apply sorting and pagination
    dbQuery = dbQuery
      .order(query.sortBy, { ascending: query.sortOrder === "asc" })
      .range(query.offset, query.offset + query.limit - 1);

    const { data, error, count } = await dbQuery;

    if (error) {
      throw new Error(`Failed to get alerts: ${error.message}`);
    }

    return {
      alerts: data || [],
      total: count || 0,
    };
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(
    acknowledgeData: AcknowledgeAlert,
  ): Promise<StockAlert> {
    const validatedData = validateAcknowledgeAlert(acknowledgeData);

    // First, check if alert exists and is active
    const { data: existingAlert, error: fetchError } = await this.supabase
      .from("stock_alerts")
      .select("id, status")
      .eq("id", validatedData.alertId)
      .single();

    if (fetchError || !existingAlert) {
      throw new Error("Alert not found");
    }

    if (existingAlert.status !== "active") {
      throw new Error("Alert is not in active status");
    }

    // Update alert status
    const { data, error } = await this.supabase
      .from("stock_alerts")
      .update({
        status: "acknowledged",
        acknowledged_by: validatedData.acknowledgedBy,
        acknowledged_at: new Date(),
        metadata: validatedData.note ? { note: validatedData.note } : undefined,
      })
      .eq("id", validatedData.alertId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to acknowledge alert: ${error.message}`);
    }

    return data;
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(resolveData: ResolveAlert): Promise<StockAlert> {
    const validatedData = validateResolveAlert(resolveData);

    // First, check if alert exists
    const { data: existingAlert, error: fetchError } = await this.supabase
      .from("stock_alerts")
      .select("id, status")
      .eq("id", validatedData.alertId)
      .single();

    if (fetchError || !existingAlert) {
      throw new Error("Alert not found");
    }

    if (existingAlert.status === "resolved") {
      throw new Error("Alert is already resolved");
    }

    // Update alert status
    const { data, error } = await this.supabase
      .from("stock_alerts")
      .update({
        status: "resolved",
        resolved_by: validatedData.resolvedBy,
        resolved_at: new Date(),
        metadata: {
          resolution: validatedData.resolution,
          actions_taken: validatedData.actionsTaken || [],
        },
      })
      .eq("id", validatedData.alertId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to resolve alert: ${error.message}`);
    }

    return data;
  }

  /**
   * Check stock levels and trigger alerts based on configurations
   */
  async checkStockLevels(userId: string): Promise<StockAlert[]> {
    const clinicId = await this.getUserClinicId(userId);
    const newAlerts: StockAlert[] = [];

    // Get active alert configurations
    const configs = await this.getAlertConfigs(userId);

    for (const config of configs) {
      const triggeredAlerts = await this.evaluateStockConfig(config, clinicId);
      newAlerts.push(...triggeredAlerts);
    }

    return newAlerts;
  }

  /**
   * Evaluate a single stock configuration and create alerts if needed
   */
  private async evaluateStockConfig(
    config: StockAlertConfig,
    clinicId: string,
  ): Promise<StockAlert[]> {
    const alerts: StockAlert[] = [];

    // Build query based on configuration
    let stockQuery = this.supabase
      .from("inventory_items")
      .select("*")
      .eq("clinic_id", clinicId);

    if (config.productId) {
      stockQuery = stockQuery.eq("product_id", config.productId);
    }
    if (config.categoryId) {
      stockQuery = stockQuery.eq("category_id", config.categoryId);
    }

    const { data: items, error } = await stockQuery;
    if (error || !items) {
      return alerts;
    }

    for (const item of items) {
      const alertNeeded = this.shouldTriggerAlert(item, config);

      if (alertNeeded.trigger) {
        // Check if we already have an active alert for this item
        const { data: existingAlerts } = await this.supabase
          .from("stock_alerts")
          .select("id")
          .eq("product_id", item.product_id)
          .eq("alert_type", config.alertType)
          .eq("status", "active");

        if (!existingAlerts || existingAlerts.length === 0) {
          const newAlert = await this.createAlert(
            item,
            config,
            alertNeeded.message,
          );
          if (newAlert) {
            alerts.push(newAlert);
          }
        }
      }
    }

    return alerts;
  }

  /**
   * Determine if an alert should be triggered
   */
  private shouldTriggerAlert(
    item: any,
    config: StockAlertConfig,
  ): { trigger: boolean; message: string } {
    const currentStock = item.current_quantity || 0;
    const threshold = config.thresholdValue;

    switch (config.alertType) {
      case "low_stock": {
        if (currentStock <= threshold) {
          return {
            trigger: true,
            message: `Low stock alert: ${item.product_name} has ${currentStock} units (threshold: ${threshold})`,
          };
        }
        break;
      }

      case "out_of_stock": {
        if (currentStock === 0) {
          return {
            trigger: true,
            message: `Out of stock: ${item.product_name} is completely out of stock`,
          };
        }
        break;
      }

      case "expiring": {
        const expiryDate = new Date(item.expiry_date);
        const daysUntilExpiry = Math.ceil(
          (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        );

        if (daysUntilExpiry <= threshold && daysUntilExpiry > 0) {
          return {
            trigger: true,
            message: `Expiring soon: ${item.product_name} expires in ${daysUntilExpiry} days`,
          };
        }
        break;
      }

      case "expired": {
        const expiredDate = new Date(item.expiry_date);
        if (expiredDate < new Date()) {
          return {
            trigger: true,
            message: `Expired: ${item.product_name} expired on ${expiredDate.toLocaleDateString()}`,
          };
        }
        break;
      }
    }

    return { trigger: false, message: "" };
  }

  /**
   * Create a new stock alert
   */
  private async createAlert(
    item: any,
    config: StockAlertConfig,
    message: string,
  ): Promise<StockAlert | null> {
    const { data, error } = await this.supabase
      .from("stock_alerts")
      .insert({
        clinic_id: config.clinicId,
        product_id: item.product_id,
        category_id: item.category_id,
        alert_type: config.alertType,
        severity_level: config.severityLevel,
        current_value: item.current_quantity || 0,
        threshold_value: config.thresholdValue,
        message,
        status: "active",
        created_at: new Date(),
      })
      .select()
      .single();

    if (error) {
      return;
    }

    return data;
  }
}

// Export singleton instance
export const stockAlertsService = new StockAlertsService();
export default stockAlertsService;
