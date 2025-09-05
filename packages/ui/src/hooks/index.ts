/**
 * @fileoverview NeonPro UI Hooks
 * User interface React hooks for UI components and interactions
 */

export * from "./use-debounce";
export * from "./use-mobile";
// UI Utility hooks
export * from "./use-toast";
export * from "./use-translation";
// Domain-facing alias for healthcare permissions
export { usePermissions as useHealthcarePermissions } from "./use-permissions";
// Layout hooks
export * from "./useLayout";
