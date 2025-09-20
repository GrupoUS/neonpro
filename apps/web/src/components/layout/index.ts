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
export { BreadcrumbNavigation } from './BreadcrumbNavigation';
export { EnhancedAppShell } from './EnhancedAppShell';
export { EnhancedSidebar } from './EnhancedSidebar';

// Enhanced Sidebar Exports
export {
  EnhancedSidebarProvider,
  useEnhancedSidebar,
  useEnhancedSidebarManagement,
} from './EnhancedSidebar';

// Breadcrumb Exports
export { BreadcrumbItem, BreadcrumbSeparator, useBreadcrumbs } from './BreadcrumbNavigation';

// Integration Guide
export { SidebarIntegrationGuide } from './SidebarIntegrationGuide';

// Types
export type { BreadcrumbNavigationProps } from './BreadcrumbNavigation';
export type {
  BreadcrumbItem as BreadcrumbItemType,
  EnhancedSidebarContextProps,
  SidebarItem,
  SidebarSection,
  UserPreferences,
} from './EnhancedSidebar';

// App Shell Types
export type { EnhancedAppShellProps } from './EnhancedAppShell';
