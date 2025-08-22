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
export declare function validateStockAlertConfig(config: any): config is StockAlertConfig;
/**
 * Validate resolve alert request
 */
export declare function validateResolveAlert(request: any): request is ResolveAlert;
