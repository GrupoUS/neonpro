'use client'

/**
 * Main Components Index
 * FASE 4: Frontend Components - Complete Export
 * Compliance: LGPD/ANVISA/CFM + WCAG 2.1 AA
 */

// Accessibility Components
export * from './accessibility'
// Dashboard Components
export * from './dashboard'
// Layout Components
export * from './layout'
// Mobile Components
export * from './mobile'
export * from './ui/avatar'
export * from './ui/badge'
// UI Components (re-export from shadcn/ui)
export * from './ui/button'
export * from './ui/card'
export * from './ui/input'
export * from './ui/label'
export * from './ui/popover'
export * from './ui/progress'
export * from './ui/scroll-area'
export * from './ui/select'
export * from './ui/sheet'
export * from './ui/slider'
export * from './ui/switch'
export * from './ui/tabs'
export * from './ui/textarea'
export * from './ui/toaster'

// FASE 4 Component Categories
export const COMPONENT_CATEGORIES = {
  'AI-Powered Dashboards': [
    'AIAnalyticsDashboard',
    'HealthMonitoringDashboard',
    'ComplianceStatusDashboard',
    'PerformanceMetricsDashboard',
    'RealTimeActivityDashboard',
  ],

  'Mobile Components': [
    'MobileNavigation',
    'MobileBottomNavigation',
    'MobileDashboardCard',
    'MobileQuickActions',
  ],

  Accessibility: [
    'AccessibilityPanel',
    'SkipToContentLink',
    'ScreenReaderOnly',
    'LiveRegion',
    'FocusTrap',
    'KeyboardHelper',
  ],

  'Layout System': [
    'MainLayout',
    'DashboardPageLayout',
    'AuthLayout',
    'ErrorLayout',
    'PrintLayout',
  ],

  'Healthcare Specific': [
    'PatientCard',
    'AppointmentCard',
    'MedicalRecordViewer',
    'ComplianceIndicator',
    'TelemedicineInterface',
  ],
} as const

// Component status tracking for FASE 4
export const COMPONENT_STATUS = {
  completed: [
    // AI-Powered Dashboards
    'AIAnalyticsDashboard',
    'HealthMonitoringDashboard',
    'ComplianceStatusDashboard',
    'PerformanceMetricsDashboard',
    'RealTimeActivityDashboard',
    'DashboardLayout',

    // Mobile Components
    'MobileNavigation',
    'MobileBottomNavigation',
    'MobileDashboardCard',
    'MobileQuickActions',

    // Accessibility
    'AccessibilityPanel',
    'SkipToContentLink',
    'ScreenReaderOnly',
    'LiveRegion',
    'FocusTrap',
    'KeyboardHelper',

    // Layout System
    'MainLayout',
    'DashboardPageLayout',
    'AuthLayout',
    'ErrorLayout',
    'PrintLayout',
  ],

  inProgress: [
    // Healthcare specific components (next phase)
    'PatientCard',
    'AppointmentCard',
    'MedicalRecordViewer',
  ],

  planned: [
    // Advanced features
    'TelemedicineInterface',
    'ARVisualization',
    'VoiceInterface',
    'BiometricAuth',
  ],
} as const

// Export component registry for dynamic loading
export const FASE4_COMPONENT_REGISTRY = {
  ...COMPONENT_CATEGORIES,
  status: COMPONENT_STATUS,
  compliance: {
    LGPD: 'Todas as funcionalidades em compliance com LGPD',
    ANVISA: 'Componentes médicos seguem normas ANVISA',
    CFM: 'Interface médica em conformidade com CFM',
    WCAG: 'Acessibilidade WCAG 2.1 AA implementada',
  },
  version: '4.0.0',
  lastUpdated: new Date().toISOString(),
} as const
// =============================================================================
// 🤖 HEALTHCARE AI AGENT CHAT COMPONENT EXPORT
// =============================================================================

export { AgentChat, } from './AgentChat'
