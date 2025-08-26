/**
 * Stock Alerts Types for NeonPro Healthcare System
 * Defines types and validation for stock alert management
 */

export interface StockAlert {
  id: string;
  productId: string;
  productName: string;
  currentStock: number;
  minimumThreshold: number;
  status: 'low' | 'critical' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  notes?: string;
}

export interface StockAlertConfig {
  id: string;
  productId: string;
  minimumThreshold: number;
  criticalThreshold: number;
  notificationEnabled: boolean;
  notificationEmails: string[];
  autoReorder: boolean;
  reorderQuantity?: number;
}

export interface ResolveAlert {
  alertId: string;
  resolvedBy: string;
  notes?: string;
  action: 'restocked' | 'threshold_adjusted' | 'product_discontinued';
}

/**
 * Validate stock alert configuration
 */
export function validateStockAlertConfig(
  config: any,
): config is StockAlertConfig {
  return (
    typeof config === 'object'
    && typeof config.id === 'string'
    && typeof config.productId === 'string'
    && typeof config.minimumThreshold === 'number'
    && typeof config.criticalThreshold === 'number'
    && typeof config.notificationEnabled === 'boolean'
    && Array.isArray(config.notificationEmails)
  );
}

/**
 * Validate resolve alert request
 */
export function validateResolveAlert(request: any): request is ResolveAlert {
  return (
    typeof request === 'object'
    && typeof request.alertId === 'string'
    && typeof request.resolvedBy === 'string'
    && ['restocked', 'threshold_adjusted', 'product_discontinued'].includes(
      request.action,
    )
  );
}
