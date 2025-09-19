/**
 * Layout Components Export
 * 
 * Exports all layout-related components for the NeonPro healthcare platform
 * 
 * Components:
 * - AppShellWithSidebar: Original app shell with basic sidebar
 * - EnhancedSidebar: Enhanced sidebar with states, breadcrumbs, keyboard shortcuts, and accessibility
 * - EnhancedAppShell: Complete application shell with all enhanced features
 * - BreadcrumbNavigation: Standalone breadcrumb navigation component
 * - SidebarIntegrationGuide: Migration guide and examples
 */

// Core Components
export { AppShellWithSidebar } from './AppShellWithSidebar';
export { EnhancedSidebar } from './EnhancedSidebar';
export { EnhancedAppShell } from './EnhancedAppShell';
export { BreadcrumbNavigation } from './BreadcrumbNavigation';

// Enhanced Sidebar Exports
export {
  EnhancedSidebarProvider,
  useEnhancedSidebar,
  useEnhancedSidebarManagement,
} from './EnhancedSidebar';

// Breadcrumb Exports
export {
  useBreadcrumbs,
  BreadcrumbItem,
  BreadcrumbSeparator,
} from './BreadcrumbNavigation';

// Integration Guide
export { SidebarIntegrationGuide } from './SidebarIntegrationGuide';

// Types
export type {
  SidebarSection,
  SidebarItem,
  EnhancedSidebarContextProps,
  UserPreferences,
  BreadcrumbItem as BreadcrumbItemType,
} from './EnhancedSidebar';
export type { BreadcrumbNavigationProps } from './BreadcrumbNavigation';

// App Shell Types
export type { EnhancedAppShellProps } from './EnhancedAppShell';