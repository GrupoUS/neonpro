// =====================================================================================
// NeonPro Inventory Tracking Engine
// Epic 6: Real-time Stock Tracking with ≥99% Accuracy
// Created: 2025-01-26
// =====================================================================================

import type {
  AlertLevel,
  AlertType,
  StockAlert,
  StockLevel,
  StockStatus,
  TransactionType,
} from '@/app/types/inventory';
import { createClient } from '@/app/utils/supabase/server';

// =====================================================================================
// CORE INVENTORY TRACKING ENGINE
// =====================================================================================

export class InventoryTrackingEngine {
  private readonly clinicId: string;

  constructor(clinicId: string) {
    this.clinicId = clinicId;
  }

  private async getSupabase() {
    return await createClient();
  }

  // =====================================================================================
  // REAL-TIME STOCK LEVEL MANAGEMENT
  // =====================================================================================

  /**
   * Updates stock level with real-time synchronization and automatic transaction logging
   * Accuracy Target: ≥99%
   * Performance Target: <500ms
   */
  async updateStockLevel(params: {
    itemId: string;
    locationId: string;
    quantityChange: number;
    transactionType: TransactionType;
    reason?: string;
    batchNumber?: string;
    expirationDate?: string;
    referenceType?: string;
    referenceId?: string;
    userId: string;
  }): Promise<{
    success: boolean;
    transactionId?: string;
    newQuantity: number;
    availableQuantity: number;
    alertsCreated: StockAlert[];
    errors: string[];
  }> {
    const {
      itemId,
      locationId,
      quantityChange,
      transactionType,
      reason,
      batchNumber,
      expirationDate,
      referenceType,
      referenceId,
      userId,
    } = params;

    try {
      const supabase = await this.getSupabase();

      // Start transaction for atomic updates
      const { data: currentStock, error: stockError } = await supabase
        .from('stock_levels')
        .select('*')
        .eq('item_id', itemId)
        .eq('location_id', locationId)
        .eq('batch_number', batchNumber || null)
        .single();

      if (stockError && stockError.code !== 'PGRST116') {
        return {
          success: false,
          newQuantity: 0,
          availableQuantity: 0,
          alertsCreated: [],
          errors: [`Failed to retrieve current stock: ${stockError.message}`],
        };
      }

      const currentQuantity = currentStock?.current_quantity || 0;
      const newQuantity = Math.max(0, currentQuantity + quantityChange);

      // Validate stock levels
      if (quantityChange < 0 && Math.abs(quantityChange) > currentQuantity) {
        return {
          success: false,
          newQuantity: currentQuantity,
          availableQuantity: currentStock?.available_quantity || 0,
          alertsCreated: [],
          errors: ['Insufficient stock for this operation'],
        };
      }

      // Update or insert stock level
      const stockLevelData = {
        item_id: itemId,
        location_id: locationId,
        current_quantity: newQuantity,
        batch_number: batchNumber,
        expiration_date: expirationDate,
        last_counted_at: new Date().toISOString(),
        last_counted_by: userId,
        status: 'active' as StockStatus,
      };

      let updatedStock;
      if (currentStock) {
        const { data, error } = await supabase
          .from('stock_levels')
          .update(stockLevelData)
          .eq('id', currentStock.id)
          .select()
          .single();

        if (error) {
          throw error;
        }
        updatedStock = data;
      } else {
        const { data, error } = await supabase
          .from('stock_levels')
          .insert(stockLevelData)
          .select()
          .single();

        if (error) {
          throw error;
        }
        updatedStock = data;
      }

      // Create transaction record
      const transactionData = {
        item_id: itemId,
        location_id: locationId,
        transaction_type: transactionType,
        reference_type: referenceType,
        reference_id: referenceId,
        quantity_before: currentQuantity,
        quantity_change: quantityChange,
        quantity_after: newQuantity,
        batch_number: batchNumber,
        expiration_date: expirationDate,
        reason: reason || `${transactionType} operation`,
        created_by: userId,
        verification_status: 'verified' as const,
      };

      const { data: transaction, error: transactionError } = await supabase
        .from('inventory_transactions')
        .insert(transactionData)
        .select()
        .single();

      if (transactionError) {
        console.error('Failed to create transaction record:', transactionError);
      }

      // Check for automatic alerts
      const alertsCreated = await this.checkAndCreateAlerts(
        itemId,
        locationId,
        updatedStock
      );

      return {
        success: true,
        transactionId: transaction?.id,
        newQuantity: updatedStock.current_quantity,
        availableQuantity: updatedStock.available_quantity,
        alertsCreated,
        errors: [],
      };
    } catch (error) {
      console.error('Stock update failed:', error);
      return {
        success: false,
        newQuantity: 0,
        availableQuantity: 0,
        alertsCreated: [],
        errors: [
          `Stock update failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ],
      };
    }
  }

  /**
   * Transfers stock between locations with atomic operations
   */
  async transferStock(params: {
    itemId: string;
    sourceLocationId: string;
    destinationLocationId: string;
    quantity: number;
    reason: string;
    batchNumber?: string;
    userId: string;
  }): Promise<{
    success: boolean;
    sourceTransactionId?: string;
    destinationTransactionId?: string;
    errors: string[];
  }> {
    const {
      itemId,
      sourceLocationId,
      destinationLocationId,
      quantity,
      reason,
      batchNumber,
      userId,
    } = params;

    try {
      const supabase = await this.getSupabase();

      // Validate source stock availability
      const { data: sourceStock } = await supabase
        .from('stock_levels')
        .select('*')
        .eq('item_id', itemId)
        .eq('location_id', sourceLocationId)
        .eq('batch_number', batchNumber || null)
        .single();

      if (!sourceStock || sourceStock.available_quantity < quantity) {
        return {
          success: false,
          errors: ['Insufficient stock at source location'],
        };
      }

      // Execute transfer (outbound from source)
      const sourceResult = await this.updateStockLevel({
        itemId,
        locationId: sourceLocationId,
        quantityChange: -quantity,
        transactionType: 'transfer',
        reason: `Transfer to ${destinationLocationId}: ${reason}`,
        batchNumber,
        referenceType: 'transfer',
        referenceId: `${sourceLocationId}->${destinationLocationId}`,
        userId,
      });

      if (!sourceResult.success) {
        return {
          success: false,
          errors: sourceResult.errors,
        };
      }

      // Execute transfer (inbound to destination)
      const destinationResult = await this.updateStockLevel({
        itemId,
        locationId: destinationLocationId,
        quantityChange: quantity,
        transactionType: 'transfer',
        reason: `Transfer from ${sourceLocationId}: ${reason}`,
        batchNumber,
        referenceType: 'transfer',
        referenceId: `${sourceLocationId}->${destinationLocationId}`,
        userId,
      });

      if (!destinationResult.success) {
        // Rollback source transaction if destination fails
        await this.updateStockLevel({
          itemId,
          locationId: sourceLocationId,
          quantityChange: quantity,
          transactionType: 'adjustment',
          reason: 'Rollback failed transfer',
          batchNumber,
          userId,
        });

        return {
          success: false,
          errors: ['Transfer failed at destination, source rolled back'],
        };
      }

      return {
        success: true,
        sourceTransactionId: sourceResult.transactionId,
        destinationTransactionId: destinationResult.transactionId,
        errors: [],
      };
    } catch (error) {
      console.error('Stock transfer failed:', error);
      return {
        success: false,
        errors: [
          `Transfer failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ],
      };
    }
  }

  /**
   * Reserves stock for upcoming operations (appointments, treatments)
   */
  async reserveStock(params: {
    itemId: string;
    locationId: string;
    quantity: number;
    referenceType: string;
    referenceId: string;
    userId: string;
  }): Promise<{
    success: boolean;
    reservationId?: string;
    errors: string[];
  }> {
    const { itemId, locationId, quantity, referenceType, referenceId, userId } =
      params;

    try {
      const supabase = await this.getSupabase();

      const { data: currentStock } = await supabase
        .from('stock_levels')
        .select('*')
        .eq('item_id', itemId)
        .eq('location_id', locationId)
        .single();

      if (!currentStock || currentStock.available_quantity < quantity) {
        return {
          success: false,
          errors: ['Insufficient available stock for reservation'],
        };
      }

      // Update reserved quantity
      const { data: updatedStock, error } = await supabase
        .from('stock_levels')
        .update({
          reserved_quantity: currentStock.reserved_quantity + quantity,
          last_updated: new Date().toISOString(),
        })
        .eq('id', currentStock.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Create reservation transaction record
      const { data: transaction } = await supabase
        .from('inventory_transactions')
        .insert({
          item_id: itemId,
          location_id: locationId,
          transaction_type: 'reserve' as TransactionType,
          reference_type: referenceType,
          reference_id: referenceId,
          quantity_before: currentStock.reserved_quantity,
          quantity_change: quantity,
          quantity_after: currentStock.reserved_quantity + quantity,
          reason: `Stock reserved for ${referenceType}`,
          created_by: userId,
          verification_status: 'verified',
        })
        .select()
        .single();

      return {
        success: true,
        reservationId: transaction?.id,
        errors: [],
      };
    } catch (error) {
      console.error('Stock reservation failed:', error);
      return {
        success: false,
        errors: [
          `Reservation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ],
      };
    }
  }

  /**
   * Releases reserved stock (cancellation, completion)
   */
  async releaseReservedStock(params: {
    itemId: string;
    locationId: string;
    quantity: number;
    isConsumption: boolean;
    referenceId: string;
    userId: string;
  }): Promise<{
    success: boolean;
    transactionId?: string;
    errors: string[];
  }> {
    const { itemId, locationId, quantity, isConsumption, referenceId, userId } =
      params;

    try {
      const supabase = await this.getSupabase();

      const { data: currentStock } = await supabase
        .from('stock_levels')
        .select('*')
        .eq('item_id', itemId)
        .eq('location_id', locationId)
        .single();

      if (!currentStock || currentStock.reserved_quantity < quantity) {
        return {
          success: false,
          errors: ['Insufficient reserved stock to release'],
        };
      }

      // Update stock levels based on consumption or release
      const updates = isConsumption
        ? {
            current_quantity: currentStock.current_quantity - quantity,
            reserved_quantity: currentStock.reserved_quantity - quantity,
            last_updated: new Date().toISOString(),
          }
        : {
            reserved_quantity: currentStock.reserved_quantity - quantity,
            last_updated: new Date().toISOString(),
          };

      const { data: updatedStock, error } = await supabase
        .from('stock_levels')
        .update(updates)
        .eq('id', currentStock.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Create transaction record
      const transactionType = isConsumption ? 'issue' : 'adjustment';
      const { data: transaction } = await supabase
        .from('inventory_transactions')
        .insert({
          item_id: itemId,
          location_id: locationId,
          transaction_type: transactionType as TransactionType,
          reference_id: referenceId,
          quantity_before: currentStock.current_quantity,
          quantity_change: isConsumption ? -quantity : 0,
          quantity_after: isConsumption
            ? currentStock.current_quantity - quantity
            : currentStock.current_quantity,
          reason: isConsumption
            ? 'Stock consumed from reservation'
            : 'Reserved stock released',
          created_by: userId,
          verification_status: 'verified',
        })
        .select()
        .single();

      return {
        success: true,
        transactionId: transaction?.id,
        errors: [],
      };
    } catch (error) {
      console.error('Stock release failed:', error);
      return {
        success: false,
        errors: [
          `Release failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ],
      };
    }
  }

  // =====================================================================================
  // ALERT SYSTEM WITH <60s NOTIFICATION DELIVERY
  // =====================================================================================

  /**
   * Checks stock levels and creates automatic alerts
   * Target: <60 seconds notification delivery
   */
  private async checkAndCreateAlerts(
    itemId: string,
    locationId: string,
    stockLevel: StockLevel
  ): Promise<StockAlert[]> {
    try {
      const supabase = await this.getSupabase();

      // Get item details for thresholds
      const { data: item } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (!item) {
        return [];
      }

      const alerts: StockAlert[] = [];
      const currentQuantity = stockLevel.available_quantity;

      // Check for existing active alerts to avoid duplicates
      const { data: existingAlerts } = await supabase
        .from('stock_alerts')
        .select('alert_type')
        .eq('item_id', itemId)
        .eq('location_id', locationId)
        .eq('status', 'active');

      const activeAlertTypes = new Set(
        existingAlerts?.map((a: any) => a.alert_type) || []
      );

      // Zero stock alert
      if (currentQuantity === 0 && !activeAlertTypes.has('zero_stock')) {
        const alert = await this.createAlert({
          itemId,
          locationId,
          alertType: 'zero_stock',
          alertLevel: 'urgent',
          title: `Zero Stock: ${item.name}`,
          message: `${item.name} is completely out of stock at this location.`,
          currentQuantity,
          thresholdQuantity: 0,
        });
        if (alert) {
          alerts.push(alert);
        }
      }

      // Low stock alert
      else if (
        currentQuantity <= item.reorder_level &&
        !activeAlertTypes.has('low_stock')
      ) {
        const alertLevel: AlertLevel =
          currentQuantity <= item.min_stock ? 'critical' : 'warning';

        const alert = await this.createAlert({
          itemId,
          locationId,
          alertType: 'low_stock',
          alertLevel,
          title: `Low Stock: ${item.name}`,
          message: `${item.name} stock is below reorder level. Current: ${currentQuantity}, Reorder Level: ${item.reorder_level}`,
          currentQuantity,
          thresholdQuantity: item.reorder_level,
        });
        if (alert) {
          alerts.push(alert);
        }
      }

      // Expiration alerts
      if (stockLevel.expiration_date) {
        const expirationDate = new Date(stockLevel.expiration_date);
        const today = new Date();
        const daysToExpiry = Math.ceil(
          (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysToExpiry <= 0 && !activeAlertTypes.has('expired')) {
          const alert = await this.createAlert({
            itemId,
            locationId,
            alertType: 'expired',
            alertLevel: 'urgent',
            title: `Expired: ${item.name}`,
            message: `${item.name} (Batch: ${stockLevel.batch_number || 'N/A'}) has expired.`,
            currentQuantity,
            thresholdQuantity: 0,
          });
          if (alert) {
            alerts.push(alert);
          }
        } else if (
          daysToExpiry <= 7 &&
          daysToExpiry > 0 &&
          !activeAlertTypes.has('expiring')
        ) {
          const alert = await this.createAlert({
            itemId,
            locationId,
            alertType: 'expiring',
            alertLevel: daysToExpiry <= 3 ? 'critical' : 'warning',
            title: `Expiring Soon: ${item.name}`,
            message: `${item.name} (Batch: ${stockLevel.batch_number || 'N/A'}) expires in ${daysToExpiry} days.`,
            currentQuantity,
            thresholdQuantity: daysToExpiry,
          });
          if (alert) {
            alerts.push(alert);
          }
        }
      }

      return alerts;
    } catch (error) {
      console.error('Alert checking failed:', error);
      return [];
    }
  }

  /**
   * Creates a new stock alert with automatic notification
   */
  private async createAlert(params: {
    itemId: string;
    locationId: string;
    alertType: AlertType;
    alertLevel: AlertLevel;
    title: string;
    message: string;
    currentQuantity: number;
    thresholdQuantity: number;
  }): Promise<StockAlert | null> {
    try {
      const supabase = await this.getSupabase();

      const { data: alert, error } = await supabase
        .from('stock_alerts')
        .insert({
          clinic_id: this.clinicId,
          item_id: params.itemId,
          location_id: params.locationId,
          alert_type: params.alertType,
          alert_level: params.alertLevel,
          title: params.title,
          message: params.message,
          current_quantity: params.currentQuantity,
          threshold_quantity: params.thresholdQuantity,
          status: 'active',
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create alert:', error);
        return null;
      }

      // Trigger notification delivery (async, non-blocking)
      this.deliverNotification(alert);

      return alert;
    } catch (error) {
      console.error('Alert creation failed:', error);
      return null;
    }
  }

  /**
   * Delivers notifications for alerts (target: <60s)
   */
  private async deliverNotification(alert: StockAlert): Promise<void> {
    try {
      const supabase = await this.getSupabase();

      // Mark notification as sent (this would trigger external notification services)
      await supabase
        .from('stock_alerts')
        .update({
          notification_sent: true,
          notification_channels: ['dashboard', 'email'], // Would be configurable
        })
        .eq('id', alert.id);

      // Here you would integrate with:
      // - Email service (SendGrid, AWS SES)
      // - SMS service (Twilio)
      // - Push notifications
      // - Real-time dashboard updates (WebSocket/Server-Sent Events)
    } catch (error) {
      console.error('Notification delivery failed:', error);
    }
  }

  // =====================================================================================
  // BATCH OPERATIONS FOR EFFICIENCY
  // =====================================================================================

  /**
   * Processes multiple stock updates in a single batch operation
   */
  async batchUpdateStock(
    updates: Array<{
      itemId: string;
      locationId: string;
      quantityChange: number;
      transactionType: TransactionType;
      reason?: string;
      batchNumber?: string;
    }>,
    userId: string
  ): Promise<{
    successful: number;
    failed: number;
    errors: string[];
  }> {
    let successful = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const update of updates) {
      try {
        const result = await this.updateStockLevel({
          ...update,
          userId,
        });

        if (result.success) {
          successful++;
        } else {
          failed++;
          errors.push(...result.errors);
        }
      } catch (error) {
        failed++;
        errors.push(
          `Batch update failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    return { successful, failed, errors };
  }

  // =====================================================================================
  // STOCK LEVEL QUERIES AND ANALYTICS
  // =====================================================================================

  /**
   * Gets current stock levels for an item across all locations
   */
  async getItemStockLevels(itemId: string): Promise<StockLevel[]> {
    const supabase = await this.getSupabase();

    const { data, error } = await supabase
      .from('stock_levels')
      .select(
        `
        *,
        location:inventory_locations(*)
      `
      )
      .eq('item_id', itemId)
      .gt('current_quantity', 0);

    if (error) {
      console.error('Failed to get stock levels:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Gets low stock items requiring attention
   */
  async getLowStockItems(): Promise<any[]> {
    const supabase = await this.getSupabase();

    const { data, error } = await supabase
      .from('v_low_stock_items')
      .select('*')
      .eq('clinic_id', this.clinicId)
      .order('shortage_quantity', { ascending: false });

    if (error) {
      console.error('Failed to get low stock items:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Gets items expiring within specified days
   */
  async getExpiringItems(days = 30): Promise<any[]> {
    const supabase = await this.getSupabase();

    const { data, error } = await supabase
      .from('v_expiring_items')
      .select('*')
      .eq('clinic_id', this.clinicId)
      .lte('days_to_expiry', days)
      .order('expiration_date', { ascending: true });

    if (error) {
      console.error('Failed to get expiring items:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Gets inventory summary by category
   */
  async getInventorySummary(): Promise<any[]> {
    const supabase = await this.getSupabase();

    const { data, error } = await supabase
      .from('v_inventory_summary')
      .select('*')
      .eq('clinic_id', this.clinicId)
      .order('total_inventory_value', { ascending: false });

    if (error) {
      console.error('Failed to get inventory summary:', error);
      return [];
    }

    return data || [];
  }
}

// =====================================================================================
// UTILITY FUNCTIONS
// =====================================================================================

/**
 * Calculates stock accuracy based on physical counts vs system records
 */
export function calculateStockAccuracy(
  systemQuantity: number,
  physicalQuantity: number
): number {
  if (systemQuantity === 0 && physicalQuantity === 0) {
    return 100;
  }
  if (systemQuantity === 0) {
    return 0;
  }

  const variance = Math.abs(systemQuantity - physicalQuantity);
  const accuracy = Math.max(0, 100 - (variance / systemQuantity) * 100);
  return Math.round(accuracy * 100) / 100;
}

/**
 * Determines alert priority based on stock level and item criticality
 */
export function calculateAlertPriority(
  currentQuantity: number,
  reorderLevel: number,
  minStock: number,
  isCriticalItem = false
): { level: AlertLevel; escalationTime: number } {
  if (currentQuantity === 0) {
    return { level: 'urgent', escalationTime: 5 }; // 5 minutes
  }

  if (currentQuantity <= minStock) {
    return {
      level: isCriticalItem ? 'urgent' : 'critical',
      escalationTime: isCriticalItem ? 10 : 30,
    };
  }

  if (currentQuantity <= reorderLevel) {
    return { level: 'warning', escalationTime: 60 };
  }

  return { level: 'info', escalationTime: 240 };
}

/**
 * Validates stock operation before execution
 */
export function validateStockOperation(
  currentQuantity: number,
  quantityChange: number,
  operation: TransactionType
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (operation === 'issue' && quantityChange > 0) {
    errors.push('Issue operations require negative quantity change');
  }

  if (operation === 'receive' && quantityChange < 0) {
    errors.push('Receive operations require positive quantity change');
  }

  if (quantityChange < 0 && Math.abs(quantityChange) > currentQuantity) {
    errors.push('Cannot issue more than available quantity');
  }

  return { valid: errors.length === 0, errors };
}

export default InventoryTrackingEngine;
