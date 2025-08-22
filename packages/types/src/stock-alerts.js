/**
 * Stock Alerts Types for NeonPro Healthcare System
 * Defines types and validation for stock alert management
 */
/**
 * Validate stock alert configuration
 */
export function validateStockAlertConfig(config) {
    return (typeof config === 'object' &&
        typeof config.id === 'string' &&
        typeof config.productId === 'string' &&
        typeof config.minimumThreshold === 'number' &&
        typeof config.criticalThreshold === 'number' &&
        typeof config.notificationEnabled === 'boolean' &&
        Array.isArray(config.notificationEmails));
}
/**
 * Validate resolve alert request
 */
export function validateResolveAlert(request) {
    return (typeof request === 'object' &&
        typeof request.alertId === 'string' &&
        typeof request.resolvedBy === 'string' &&
        ['restocked', 'threshold_adjusted', 'product_discontinued'].includes(request.action));
}
