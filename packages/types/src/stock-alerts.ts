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
    && typeof (config as any).id === "string"
    && typeof (config as any).productId === "string"
    && typeof (config as any).minimumThreshold === "number"
    && typeof (config as any).criticalThreshold === "number"
    && typeof (config as any).notificationEnabled === "boolean"
    && Array.isArray((config as any).notificationEmails)
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
    && typeof (request as any).alertId === "string"
    && typeof (request as any).resolvedBy === "string"
    && ["restocked", "threshold_adjusted", "product_discontinued"].includes(
      (request as any).action,
    )
  );
}
