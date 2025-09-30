/**
 * Architecture Configuration Model
 * Hybrid Architecture: Bun + Vercel Edge + Supabase Functions
 * Healthcare Compliance: LGPD, ANVISA, CFM
 */

import { z } from 'zod'

// Performance Metrics Schema
export const PerformanceMetricsSchema = z.object({
  edgeTTFB: z.number().max(150, 'Edge TTFB must be ≤ 150ms'),
  realtimeUIPatch: z.number().max(1.5, 'Realtime UI patch must be ≤ 1.5s'),
  copilotToolRoundtrip: z.number().max(2, 'Copilot tool roundtrip must be ≤ 2s'),
  buildTime: z.number().min(0, 'Build time must be positive'),
  bundleSize: z.object({
    main: z.number().min(0, 'Main bundle size must be positive'),
    vendor: z.number().min(0, 'Vendor bundle size must be positive'),
    total: z.number().min(0, 'Total bundle size must be positive'),
  }),
  uptime: z.number().min(99.9, 'Uptime must be ≥ 99.9%'),
  timestamp: z.date(),
})

// Compliance Framework Schema
export const ComplianceFrameworkSchema = z.object({
  compliant: z.boolean(),
  lastAudit: z.date(),
  nextAudit: z.date(),
  issues: z.array(z.object({
    id: z.string().uuid(),
    regulation: z.enum(['LGPD', 'ANVISA', 'CFM']),
    requirement: z.string(),
    description: z.string(),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    status: z.enum(['open', 'in-progress', 'resolved', 'closed']),
    createdAt: z.date(),
    resolvedAt: z.date().optional(),
  })),
})

// WCAG Compliance Schema
export const WCAGComplianceSchema = z.object({
  level: z.enum(['2.1 AA+', '2.1 AAA']),
  compliant: z.boolean(),
  lastAudit: z.date(),
  issues: z.array(z.object({
    id: z.string().uuid(),
    guideline: z.string(),
    description: z.string(),
    severity: z.enum(['minor', 'moderate', 'serious', 'critical']),
    status: z.enum(['open', 'in-progress', 'resolved', 'closed']),
    createdAt: z.date(),
    resolvedAt: z.date().optional(),
  })),
})

// Compliance Status Schema
export const ComplianceStatusSchema = z.object({
  lgpd: ComplianceFrameworkSchema,
  anvisa: ComplianceFrameworkSchema,
  cfm: ComplianceFrameworkSchema,
  wcag: WCAGComplianceSchema,
  timestamp: z.date(),
})

// Architecture Configuration Schema
export const ArchitectureConfigSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  environment: z.enum(['development', 'staging', 'production']),
  edgeEnabled: z.boolean(),
  supabaseFunctionsEnabled: z.boolean(),
  bunEnabled: z.boolean(),
  performanceMetrics: PerformanceMetricsSchema,
  complianceStatus: ComplianceStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Architecture Configuration Update Schema
export const ArchitectureConfigUpdateSchema = z.object({
  edgeEnabled: z.boolean().optional(),
  supabaseFunctionsEnabled: z.boolean().optional(),
  bunEnabled: z.boolean().optional(),
})

// Types
export type PerformanceMetrics = z.infer<typeof PerformanceMetricsSchema>
export type ComplianceFramework = z.infer<typeof ComplianceFrameworkSchema>
export type WCAGCompliance = z.infer<typeof WCAGComplianceSchema>
export type ComplianceStatus = z.infer<typeof ComplianceStatusSchema>
export type ArchitectureConfig = z.infer<typeof ArchitectureConfigSchema>
export type ArchitectureConfigUpdate = z.infer<typeof ArchitectureConfigUpdateSchema>

// Default values
export const defaultPerformanceMetrics: PerformanceMetrics = {
  edgeTTFB: 150,
  realtimeUIPatch: 1.5,
  copilotToolRoundtrip: 2,
  buildTime: 0,
  bundleSize: {
    main: 0,
    vendor: 0,
    total: 0,
  },
  uptime: 99.9,
  timestamp: new Date(),
}

export const defaultComplianceFramework: ComplianceFramework = {
  compliant: true,
  lastAudit: new Date(),
  nextAudit: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
  issues: [],
}

export const defaultWCAGCompliance: WCAGCompliance = {
  level: '2.1 AA+',
  compliant: true,
  lastAudit: new Date(),
  issues: [],
}

export const defaultComplianceStatus: ComplianceStatus = {
  lgpd: defaultComplianceFramework,
  anvisa: defaultComplianceFramework,
  cfm: defaultComplianceFramework,
  wcag: defaultWCAGCompliance,
  timestamp: new Date(),
}

export const defaultArchitectureConfig: Omit<ArchitectureConfig, 'id' | 'name' | 'environment' | 'createdAt' | 'updatedAt'> = {
  edgeEnabled: true,
  supabaseFunctionsEnabled: true,
  bunEnabled: true,
  performanceMetrics: defaultPerformanceMetrics,
  complianceStatus: defaultComplianceStatus,
}

// Validation functions
export const validateArchitectureConfig = (config: unknown): ArchitectureConfig => {
  return ArchitectureConfigSchema.parse(config)
}

export const validateArchitectureConfigUpdate = (update: unknown): ArchitectureConfigUpdate => {
  return ArchitectureConfigUpdateSchema.parse(update)
}

export const validatePerformanceMetrics = (metrics: unknown): PerformanceMetrics => {
  return PerformanceMetricsSchema.parse(metrics)
}

export const validateComplianceStatus = (status: unknown): ComplianceStatus => {
  return ComplianceStatusSchema.parse(status)
}

// Healthcare compliance validation
export const validateHealthcareCompliance = (config: ArchitectureConfig): boolean => {
  return (
    config.complianceStatus.lgpd.compliant &&
    config.complianceStatus.anvisa.compliant &&
    config.complianceStatus.cfm.compliant &&
    config.complianceStatus.wcag.compliant
  )
}

// Performance validation
export const validatePerformanceTargets = (metrics: PerformanceMetrics): boolean => {
  return (
    metrics.edgeTTFB <= 150 &&
    metrics.realtimeUIPatch <= 1.5 &&
    metrics.copilotToolRoundtrip <= 2 &&
    metrics.uptime >= 99.9
  )
}

// Bun compatibility validation
export const validateBunCompatibility = (config: ArchitectureConfig): boolean => {
  // Bun requires Edge or Functions to be enabled
  if (config.bunEnabled && !config.edgeEnabled && !config.supabaseFunctionsEnabled) {
    return false
  }

  return true
}

// Database operations
export const createArchitectureConfig = async (
  supabase: any,
  config: Omit<ArchitectureConfig, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ArchitectureConfig> => {
  const now = new Date()
  const newConfig = {
    ...config,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  }

  const { data, error } = await supabase
    .from('architecture_configs')
    .insert(newConfig)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create architecture config: ${error.message}`)
  }

  return validateArchitectureConfig(data)
}

export const getArchitectureConfig = async (
  supabase: any,
  environment: string
): Promise<ArchitectureConfig | null> => {
  const { data, error } = await supabase
    .from('architecture_configs')
    .select('*')
    .eq('environment', environment)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    throw new Error(`Failed to get architecture config: ${error.message}`)
  }

  return validateArchitectureConfig(data)
}

export const updateArchitectureConfig = async (
  supabase: any,
  id: string,
  update: ArchitectureConfigUpdate
): Promise<ArchitectureConfig> => {
  const now = new Date()
  const updatedConfig = {
    ...update,
    updatedAt: now,
  }

  const { data, error } = await supabase
    .from('architecture_configs')
    .update(updatedConfig)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update architecture config: ${error.message}`)
  }

  return validateArchitectureConfig(data)
}

export const deleteArchitectureConfig = async (
  supabase: any,
  id: string
): Promise<void> => {
  const { error } = await supabase
    .from('architecture_configs')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete architecture config: ${error.message}`)
  }
}
