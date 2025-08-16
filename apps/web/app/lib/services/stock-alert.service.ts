// Stock Alert Service - Core Business Logic
// Implementation of Story 11.4: Alert System with QA Best Practices
// Following TDD approach and Senior Developer patterns

import type { SupabaseClient } from '@supabase/supabase-js';
import {
  type AcknowledgeAlertRequest,
  type CreateAlertConfigRequest,
  type ResolveAlertRequest,
  type StockAlert,
  type StockAlertConfig,
  StockAlertConfigSchema,
  StockAlertError,
  type StockEvent,
} from '@/app/lib/types/stock';
import { createClient } from '@/app/utils/supabase/server';

// ============================================================================
// CORE STOCK ALERT SERVICE (Business Logic Layer)
// ============================================================================

export class StockAlertService {
  private readonly supabase: SupabaseClient;
  private readonly clinicId: string;

  constructor(supabase: SupabaseClient, clinicId: string) {
    this.supabase = supabase;
    this.clinicId = clinicId;
  }

  // ========================================================================
  // ALERT CONFIGURATION MANAGEMENT
  // ========================================================================

  /**
   * Creates a new alert configuration with validation
   * @param request Alert configuration request
   * @returns Created alert configuration
   */
  async createAlertConfig(
    request: CreateAlertConfigRequest,
    userId: string,
  ): Promise<StockAlertConfig> {
    try {
      // Validate request using Zod schema
      const validatedData = StockAlertConfigSchema.parse({
        ...request,
        clinicId: this.clinicId,
      });

      // Check for duplicate configurations
      await this.validateUniqueAlertConfig(validatedData);

      // Insert into database
      const { data, error } = await this.supabase
        .from('stock_alert_configs')
        .insert([
          {
            clinic_id: this.clinicId,
            product_id: validatedData.productId,
            category_id: validatedData.categoryId,
            alert_type: validatedData.alertType,
            threshold_value: validatedData.thresholdValue,
            threshold_unit: validatedData.thresholdUnit,
            severity_level: validatedData.severityLevel,
            is_active: validatedData.isActive,
            notification_channels: validatedData.notificationChannels,
          },
        ])
        .select()
        .single();

      if (error) {
        throw new StockAlertError(
          'Failed to create alert configuration',
          'CREATE_CONFIG_FAILED',
          { error: error.message, request },
        );
      }

      // Log event for audit trail
      await this.logStockEvent({
        type: 'THRESHOLD_CHANGED',
        aggregateId: data.id,
        aggregateType: 'stock_alert',
        payload: { action: 'created', config: validatedData },
        userId,
      });

      return this.mapDbToAlertConfig(data);
    } catch (error) {
      if (error instanceof StockAlertError) {
        throw error;
      }
      throw new StockAlertError(
        'Unexpected error creating alert configuration',
        'INTERNAL_ERROR',
        { error: error instanceof Error ? error.message : 'Unknown error' },
      );
    }
  }

  /**
   * Updates an existing alert configuration
   */
  async updateAlertConfig(
    configId: string,
    updates: Partial<CreateAlertConfigRequest>,
    userId: string,
  ): Promise<StockAlertConfig> {
    const { data, error } = await this.supabase
      .from('stock_alert_configs')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', configId)
      .eq('clinic_id', this.clinicId)
      .select()
      .single();

    if (error) {
      throw new StockAlertError(
        'Failed to update alert configuration',
        'UPDATE_CONFIG_FAILED',
        { configId, error: error.message },
      );
    }

    await this.logStockEvent({
      type: 'THRESHOLD_CHANGED',
      aggregateId: configId,
      aggregateType: 'stock_alert',
      payload: { action: 'updated', updates },
      userId,
    });

    return this.mapDbToAlertConfig(data);
  }

  /**
   * Deletes an alert configuration (soft delete)
   */
  async deleteAlertConfig(configId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('stock_alert_configs')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', configId)
      .eq('clinic_id', this.clinicId);

    if (error) {
      throw new StockAlertError(
        'Failed to delete alert configuration',
        'DELETE_CONFIG_FAILED',
        { configId, error: error.message },
      );
    }

    await this.logStockEvent({
      type: 'THRESHOLD_CHANGED',
      aggregateId: configId,
      aggregateType: 'stock_alert',
      payload: { action: 'deleted' },
      userId,
    });
  }

  // ========================================================================
  // ALERT GENERATION AND EVALUATION
  // ========================================================================

  /**
   * Evaluates all products and generates alerts based on configurations
   * This method should be called by background jobs
   */
  async evaluateAndGenerateAlerts(): Promise<StockAlert[]> {
    const configs = await this.getActiveAlertConfigs();
    const generatedAlerts: StockAlert[] = [];

    for (const config of configs) {
      try {
        const alerts = await this.evaluateConfigAndGenerateAlerts(config);
        generatedAlerts.push(...alerts);
      } catch (_error) {
        // Continue with other configurations
      }
    }

    return generatedAlerts;
  }

  /**
   * Evaluates a specific configuration and generates alerts if needed
   */
  private async evaluateConfigAndGenerateAlerts(
    config: StockAlertConfig,
  ): Promise<StockAlert[]> {
    const products = await this.getProductsForConfig(config);
    const alerts: StockAlert[] = [];

    for (const product of products) {
      const shouldAlert = await this.shouldGenerateAlert(config, product);
      if (shouldAlert.generate) {
        const alert = await this.generateAlert(
          config,
          product,
          shouldAlert.message,
        );
        alerts.push(alert);
      }
    }

    return alerts;
  }

  /**
   * Determines if an alert should be generated for a product
   */
  private async shouldGenerateAlert(
    config: StockAlertConfig,
    product: any,
  ): Promise<{ generate: boolean; message: string }> {
    switch (config.alertType) {
      case 'low_stock':
        return this.evaluateLowStockAlert(config, product);
      case 'expiring':
        return this.evaluateExpiringAlert(config, product);
      case 'expired':
        return this.evaluateExpiredAlert(config, product);
      case 'overstock':
        return this.evaluateOverstockAlert(config, product);
      default:
        return { generate: false, message: '' };
    }
  }

  /**
   * Evaluates low stock condition
   */
  private async evaluateLowStockAlert(
    config: StockAlertConfig,
    product: any,
  ): Promise<{ generate: boolean; message: string }> {
    const currentStock = product.current_stock || 0;
    const threshold = config.thresholdValue;

    let shouldAlert = false;
    let message = '';

    switch (config.thresholdUnit) {
      case 'quantity':
        shouldAlert = currentStock <= threshold;
        message = `Estoque baixo: ${currentStock} unidades (mínimo: ${threshold})`;
        break;
      case 'percentage': {
        const maxStock = product.max_stock || product.min_stock * 10; // fallback
        const percentageLeft = (currentStock / maxStock) * 100;
        shouldAlert = percentageLeft <= threshold;
        message = `Estoque baixo: ${percentageLeft.toFixed(1)}% restante (mínimo: ${threshold}%)`;
        break;
      }
      case 'days': {
        const daysCoverage = await this.calculateDaysCoverage(product.id);
        shouldAlert = daysCoverage <= threshold;
        message = `Estoque baixo: ${daysCoverage} dias de cobertura (mínimo: ${threshold} dias)`;
        break;
      }
    }

    // Check if alert already exists and is active
    if (shouldAlert) {
      const existingAlert = await this.getActiveAlertForProduct(
        product.id,
        config.alertType,
      );
      if (existingAlert) {
        return { generate: false, message: '' }; // Don't duplicate active alerts
      }
    }

    return { generate: shouldAlert, message };
  }

  /**
   * Evaluates expiring products
   */
  private async evaluateExpiringAlert(
    config: StockAlertConfig,
    product: any,
  ): Promise<{ generate: boolean; message: string }> {
    if (!product.expiration_date) {
      return { generate: false, message: '' };
    }

    const expirationDate = new Date(product.expiration_date);
    const now = new Date();
    const daysUntilExpiration = Math.ceil(
      (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    const shouldAlert =
      daysUntilExpiration <= config.thresholdValue && daysUntilExpiration > 0;
    const message = shouldAlert
      ? `Produto vencendo em ${daysUntilExpiration} dias (alerta: ${config.thresholdValue} dias)`
      : '';

    return { generate: shouldAlert, message };
  }

  /**
   * Evaluates expired products
   */
  private async evaluateExpiredAlert(
    _config: StockAlertConfig,
    product: any,
  ): Promise<{ generate: boolean; message: string }> {
    if (!product.expiration_date) {
      return { generate: false, message: '' };
    }

    const expirationDate = new Date(product.expiration_date);
    const now = new Date();
    const isExpired = expirationDate < now;

    const message = isExpired
      ? `Produto vencido desde ${expirationDate.toLocaleDateString()}`
      : '';

    return { generate: isExpired, message };
  }

  /**
   * Evaluates overstock condition
   */
  private async evaluateOverstockAlert(
    config: StockAlertConfig,
    product: any,
  ): Promise<{ generate: boolean; message: string }> {
    const currentStock = product.current_stock || 0;
    const maxStock = product.max_stock || product.min_stock * 10;
    const threshold = config.thresholdValue;

    let shouldAlert = false;
    let message = '';

    switch (config.thresholdUnit) {
      case 'quantity':
        shouldAlert = currentStock >= threshold;
        message = `Excesso de estoque: ${currentStock} unidades (máximo: ${threshold})`;
        break;
      case 'percentage': {
        const percentageUsed = (currentStock / maxStock) * 100;
        shouldAlert = percentageUsed >= threshold;
        message = `Excesso de estoque: ${percentageUsed.toFixed(1)}% da capacidade (máximo: ${threshold}%)`;
        break;
      }
    }

    return { generate: shouldAlert, message };
  }

  // ========================================================================
  // ALERT MANAGEMENT (Acknowledge, Resolve)
  // ========================================================================

  /**
   * Acknowledges an alert
   */
  async acknowledgeAlert(
    request: AcknowledgeAlertRequest,
    userId: string,
  ): Promise<StockAlert> {
    const { data, error } = await this.supabase
      .from('stock_alerts_history')
      .update({
        status: 'acknowledged',
        acknowledged_by: userId,
        acknowledged_at: new Date().toISOString(),
      })
      .eq('id', request.alertId)
      .eq('clinic_id', this.clinicId)
      .select()
      .single();

    if (error) {
      throw new StockAlertError(
        'Failed to acknowledge alert',
        'ACKNOWLEDGE_FAILED',
        { alertId: request.alertId, error: error.message },
      );
    }

    await this.logStockEvent({
      type: 'ALERT_ACKNOWLEDGED',
      aggregateId: request.alertId,
      aggregateType: 'stock_alert',
      payload: { note: request.note },
      userId,
    });

    return this.mapDbToAlert(data);
  }

  /**
   * Resolves an alert
   */
  async resolveAlert(
    request: ResolveAlertRequest,
    userId: string,
  ): Promise<StockAlert> {
    const { data, error } = await this.supabase
      .from('stock_alerts_history')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
      })
      .eq('id', request.alertId)
      .eq('clinic_id', this.clinicId)
      .select()
      .single();

    if (error) {
      throw new StockAlertError('Failed to resolve alert', 'RESOLVE_FAILED', {
        alertId: request.alertId,
        error: error.message,
      });
    }

    await this.logStockEvent({
      type: 'ALERT_RESOLVED',
      aggregateId: request.alertId,
      aggregateType: 'stock_alert',
      payload: {
        resolutionNote: request.resolutionNote,
        resolutionAction: request.resolutionAction,
      },
      userId,
    });

    return this.mapDbToAlert(data);
  }

  // ========================================================================
  // HELPER METHODS
  // ========================================================================

  /**
   * Generates a new alert and saves to database
   */
  private async generateAlert(
    config: StockAlertConfig,
    product: any,
    message: string,
  ): Promise<StockAlert> {
    const alertData = {
      clinic_id: this.clinicId,
      alert_config_id: config.id,
      product_id: product.id,
      alert_type: config.alertType,
      severity_level: config.severityLevel,
      current_value: this.getCurrentValueForAlert(config, product),
      threshold_value: config.thresholdValue,
      message,
      status: 'active' as const,
    };

    const { data, error } = await this.supabase
      .from('stock_alerts_history')
      .insert([alertData])
      .select()
      .single();

    if (error) {
      throw new StockAlertError(
        'Failed to generate alert',
        'GENERATE_ALERT_FAILED',
        { config: config.id, product: product.id, error: error.message },
      );
    }

    await this.logStockEvent({
      type: 'ALERT_GENERATED',
      aggregateId: data.id,
      aggregateType: 'stock_alert',
      payload: { alertData, productName: product.name },
      userId: 'system',
    });

    return this.mapDbToAlert(data);
  }

  /**
   * Gets current value for alert based on alert type and unit
   */
  private getCurrentValueForAlert(
    config: StockAlertConfig,
    product: any,
  ): number {
    switch (config.alertType) {
      case 'low_stock':
      case 'overstock':
        return product.current_stock || 0;
      case 'expiring':
      case 'expired': {
        if (!product.expiration_date) {
          return 0;
        }
        const expirationDate = new Date(product.expiration_date);
        const now = new Date();
        return Math.ceil(
          (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );
      }
      default:
        return 0;
    }
  }

  /**
   * Calculates days of coverage based on consumption history
   */
  private async calculateDaysCoverage(productId: string): Promise<number> {
    // Get average daily consumption from the last 30 days
    const { data, error } = await this.supabase
      .from('stock_movements')
      .select('quantity, created_at')
      .eq('product_id', productId)
      .eq('movement_type', 'out')
      .gte(
        'created_at',
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      );

    if (error || !data || data.length === 0) {
      return 999; // No consumption data, assume high coverage
    }

    const totalConsumption = data.reduce(
      (sum, movement) => sum + Math.abs(movement.quantity),
      0,
    );
    const averageDailyConsumption = totalConsumption / 30;

    if (averageDailyConsumption === 0) {
      return 999; // No consumption, assume high coverage
    }

    // Get current stock
    const { data: productData } = await this.supabase
      .from('products')
      .select('current_stock')
      .eq('id', productId)
      .single();

    const currentStock = productData?.current_stock || 0;
    return Math.floor(currentStock / averageDailyConsumption);
  }

  // ========================================================================
  // DATABASE HELPERS
  // ========================================================================

  private async getActiveAlertConfigs(): Promise<StockAlertConfig[]> {
    const { data, error } = await this.supabase
      .from('stock_alert_configs')
      .select('*')
      .eq('clinic_id', this.clinicId)
      .eq('is_active', true);

    if (error) {
      throw new StockAlertError(
        'Failed to fetch alert configurations',
        'FETCH_CONFIGS_FAILED',
        { error: error.message },
      );
    }

    return data.map(this.mapDbToAlertConfig);
  }

  private async getProductsForConfig(config: StockAlertConfig): Promise<any[]> {
    let query = this.supabase
      .from('products')
      .select('*')
      .eq('clinic_id', this.clinicId)
      .is('deleted_at', null);

    if (config.productId) {
      query = query.eq('id', config.productId);
    } else if (config.categoryId) {
      query = query.eq('category_id', config.categoryId);
    }

    const { data, error } = await query;

    if (error) {
      throw new StockAlertError(
        'Failed to fetch products for alert evaluation',
        'FETCH_PRODUCTS_FAILED',
        { configId: config.id, error: error.message },
      );
    }

    return data || [];
  }

  private async getActiveAlertForProduct(
    productId: string,
    alertType: string,
  ): Promise<StockAlert | null> {
    const { data, error } = await this.supabase
      .from('stock_alerts_history')
      .select('*')
      .eq('clinic_id', this.clinicId)
      .eq('product_id', productId)
      .eq('alert_type', alertType)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return null;
    }

    return data ? this.mapDbToAlert(data) : null;
  }

  private async validateUniqueAlertConfig(
    config: StockAlertConfig,
  ): Promise<void> {
    let query = this.supabase
      .from('stock_alert_configs')
      .select('id')
      .eq('clinic_id', this.clinicId)
      .eq('alert_type', config.alertType)
      .eq('is_active', true);

    if (config.productId) {
      query = query.eq('product_id', config.productId);
    } else if (config.categoryId) {
      query = query.eq('category_id', config.categoryId);
    }

    const { data, error } = await query;

    if (error) {
      throw new StockAlertError(
        'Failed to validate alert configuration',
        'VALIDATION_FAILED',
        { error: error.message },
      );
    }

    if (data && data.length > 0) {
      throw new StockAlertError(
        'Alert configuration already exists for this product/category and type',
        'DUPLICATE_CONFIG',
        { existingId: data[0].id },
      );
    }
  }

  private async logStockEvent(
    event: Omit<StockEvent, 'id' | 'timestamp' | 'clinicId'>,
  ): Promise<void> {
    try {
      await this.supabase.from('stock_events').insert([
        {
          type: event.type,
          aggregate_id: event.aggregateId,
          aggregate_type: event.aggregateType,
          payload: event.payload,
          user_id: event.userId,
          clinic_id: this.clinicId,
          metadata: event.metadata,
        },
      ]);
    } catch (_error) {}
  }

  // ========================================================================
  // MAPPING HELPERS
  // ========================================================================

  private mapDbToAlertConfig(dbData: any): StockAlertConfig {
    return {
      id: dbData.id,
      clinicId: dbData.clinic_id,
      productId: dbData.product_id,
      categoryId: dbData.category_id,
      alertType: dbData.alert_type,
      thresholdValue: dbData.threshold_value,
      thresholdUnit: dbData.threshold_unit,
      severityLevel: dbData.severity_level,
      isActive: dbData.is_active,
      notificationChannels: dbData.notification_channels,
      createdAt: new Date(dbData.created_at),
      updatedAt: new Date(dbData.updated_at),
    };
  }

  private mapDbToAlert(dbData: any): StockAlert {
    return {
      id: dbData.id,
      clinicId: dbData.clinic_id,
      alertConfigId: dbData.alert_config_id,
      productId: dbData.product_id,
      alertType: dbData.alert_type,
      severityLevel: dbData.severity_level,
      currentValue: dbData.current_value,
      thresholdValue: dbData.threshold_value,
      message: dbData.message,
      status: dbData.status,
      acknowledgedBy: dbData.acknowledged_by,
      acknowledgedAt: dbData.acknowledged_at
        ? new Date(dbData.acknowledged_at)
        : undefined,
      resolvedAt: dbData.resolved_at ? new Date(dbData.resolved_at) : undefined,
      createdAt: new Date(dbData.created_at),
    };
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Creates a StockAlertService instance with proper Supabase client
 */
export async function createStockAlertService(
  clinicId: string,
): Promise<StockAlertService> {
  const supabase = await createClient();
  return new StockAlertService(supabase, clinicId);
}
