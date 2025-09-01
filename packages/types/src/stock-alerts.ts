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
  status: "low" | "critical" | "resolved";
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
  action: "restocked" | "threshold_adjusted" | "product_discontinued";
}

/**
 * Validate stock alert configuration
 */
export function validateStockAlertConfig(
  config: unknown,
): config is StockAlertConfig {
  return (
    typeof config === "object"
    && config !== null
    && typeof (config as unknown).id === "string"
    && typeof (config as unknown).productId === "string"
    && typeof (config as unknown).minimumThreshold === "number"
    && typeof (config as unknown).criticalThreshold === "number"
    && typeof (config as unknown).notificationEnabled === "boolean"
    && Array.isArray((config as unknown).notificationEmails)
  );
}

/**
 * Validate resolve alert request
 */
export function validateResolveAlert(
  request: unknown,
): request is ResolveAlert {
  return (
    typeof request === "object"
    && request !== null
    && typeof (request as unknown).alertId === "string"
    && typeof (request as unknown).resolvedBy === "string"
    && ["restocked", "threshold_adjusted", "product_discontinued"].includes(
      (request as unknown).action,
    )
  );
}
