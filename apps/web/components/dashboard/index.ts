'use client'

/**
 * Dashboard Components Index
 * FASE 4: Frontend Components
 * Compliance: LGPD/ANVISA/CFM
 */

// AI-Powered Dashboards
export {
  AIAnalyticsDashboard,
  ComplianceStatusDashboard,
  DASHBOARD_REGISTRY,
  type DashboardType,
  HealthMonitoringDashboard,
  PerformanceMetricsDashboard,
  RealTimeActivityDashboard,
} from './ai-powered'
// Main Dashboard Layout
export { DashboardLayout, } from './DashboardLayout'

// Dashboard utilities and types
export type DashboardView = 'grid' | 'tabs' | 'single'

export interface DashboardConfig {
  component: string
  title: string
  description: string
  icon: string
  category: string
  compliance: string[]
}

// Default dashboard configurations for common healthcare use cases
export const HEALTHCARE_DASHBOARD_CONFIGS = {
  // Clinic Management
  clinic: {
    title: 'Gestão Clínica',
    description: 'Dashboard para gestão completa de clínicas',
    dashboards: ['analytics', 'health', 'compliance', 'activity',],
    defaultView: 'tabs' as DashboardView,
  },

  // Medical Practice
  medical: {
    title: 'Prática Médica',
    description: 'Foco em atendimento e compliance médico',
    dashboards: ['compliance', 'activity', 'analytics',],
    defaultView: 'single' as DashboardView,
  },

  // Administrative
  admin: {
    title: 'Administrativo',
    description: 'Métricas administrativas e performance',
    dashboards: ['performance', 'analytics', 'health',],
    defaultView: 'grid' as DashboardView,
  },

  // Compliance Officer
  compliance: {
    title: 'Conformidade',
    description: 'Monitoramento de compliance e auditoria',
    dashboards: ['compliance', 'activity', 'health',],
    defaultView: 'tabs' as DashboardView,
  },
} as const

export type HealthcareDashboardType = keyof typeof HEALTHCARE_DASHBOARD_CONFIGS
