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
  if (typeof config !== "object" || config === null) {
    return false;
  }

  const obj = config as Record<string, unknown>;
  return (
    typeof obj.id === "string"
    && typeof obj.productId === "string"
    && typeof obj.minimumThreshold === "number"
    && typeof obj.criticalThreshold === "number"
    && typeof obj.notificationEnabled === "boolean"
    && Array.isArray(obj.notificationEmails)
  );
}

/**
 * Validate resolve alert request
 */
export function validateResolveAlert(
  request: unknown,
): request is ResolveAlert {
  if (typeof request !== "object" || request === null) {
    return false;
  }

  const obj = request as Record<string, unknown>;
  return (
    typeof obj.alertId === "string"
    && typeof obj.resolvedBy === "string"
    && ["restocked", "threshold_adjusted", "product_discontinued"].includes(
      obj.action as string,
    )
  );
}
