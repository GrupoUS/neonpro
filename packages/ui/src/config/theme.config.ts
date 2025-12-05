/**
 * NEONPRO Theme Configuration Management System
 * Centralized configuration for theme customization and clinic branding
 */

import { z } from 'zod'

/**
 * Theme Configuration Schema with Constitutional Compliance
 */
export const ThemeConfigSchema = z.object({
  // Core Theme Settings
  id: z.string().min(1),
  name: z.string().min(1),
  version: z.string().default('1.0.0'),

  // Color Scheme Configuration (OKLCH format for better accessibility)
  colors: z.object({
    primary: z.string().regex(/^oklch\([\d\s.%/]+\)$|^#[0-9A-Fa-f]{6}$/),
    accent: z.string().regex(/^oklch\([\d\s.%/]+\)$|^#[0-9A-Fa-f]{6}$/),
    deepBlue: z.string().regex(/^oklch\([\d\s.%/]+\)$|^#[0-9A-Fa-f]{6}$/),
    neutral: z.string().regex(/^oklch\([\d\s.%/]+\)$|^#[0-9A-Fa-f]{6}$/),
    background: z.string().regex(/^oklch\([\d\s.%/]+\)$|^#[0-9A-Fa-f]{6}$/),
    // Dark mode variants
    darkPrimary: z.string().regex(/^oklch\([\d\s.%/]+\)$|^#[0-9A-Fa-f]{6}$/).optional(),
    darkAccent: z.string().regex(/^oklch\([\d\s.%/]+\)$|^#[0-9A-Fa-f]{6}$/).optional(),
    darkBackground: z.string().regex(/^oklch\([\d\s.%/]+\)$|^#[0-9A-Fa-f]{6}$/).optional(),
  }),

  // Typography Configuration
  typography: z.object({
    headingFont: z.enum(['Inter', 'Lora', 'Libre Baskerville']).default('Inter'),
    bodyFont: z.enum(['Inter', 'Lora', 'Libre Baskerville']).default('Inter'),
    scaleRatio: z.number().min(1.1).max(1.6).default(1.25),
    baseSize: z.number().min(14).max(20).default(16),
  }),

  // Accessibility & Compliance
  accessibility: z.object({
    level: z.enum(['aa', 'aaa']).default('aa'),
    contrastRatio: z.number().min(3).max(21).default(4.5),
    focusVisible: z.boolean().default(true),
    reducedMotion: z.boolean().default(false),
  }),

  // Constitutional Compliance (Brazil Healthcare)
  compliance: z.object({
    lgpdEnabled: z.boolean().default(true),
    healthcareOptimized: z.boolean().default(true),
    anvisaCompliant: z.boolean().default(true),
    cfmStandards: z.boolean().default(true),
    brazilianLocalization: z.boolean().default(true),
  }),

  // Clinic Branding
  branding: z.object({
    clinicName: z.string().optional(),
    logo: z.string().url().optional(),
    customColors: z.record(z.string(), z.string()).optional(),
    brandGradients: z.array(z.string()).optional(),
  }),

  // Performance Settings
  performance: z.object({
    animationDuration: z.number().min(100).max(1000).default(300),
    enableTransitions: z.boolean().default(true),
    lazyLoading: z.boolean().default(true),
    prefersReducedMotion: z.boolean().default(false),
  }),

  // Layout & Spacing
  layout: z.object({
    borderRadius: z.number().min(0).max(20).default(8),
    spacing: z.enum(['compact', 'normal', 'spacious']).default('normal'),
    containerWidth: z.enum(['sm', 'md', 'lg', 'xl', 'full']).default('lg'),
  }),
})

export type ThemeConfig = z.infer<typeof ThemeConfigSchema>

/**
 * Default NEONPRO Theme Configuration
 */
export const defaultNeonproTheme: ThemeConfig = {
  id: 'neonpro-default',
  name: 'NEONPRO Default',
  version: '1.0.0',

  colors: {
    primary: 'oklch(0.437 0.368 66.8)',     // #AC9469 - Golden Primary
    accent: 'oklch(0.564 0.286 90.8)',      // #E8D5B7 - Premium Services
    deepBlue: 'oklch(0.243 0.489 12.2)',    // #112031 - Professional Trust
    neutral: 'oklch(0.619 0.013 66.8)',     // #9B9B9B - Neutral Balance
    background: 'oklch(0.976 0.006 66.8)',  // #FAFAF9 - Clean Background

    // Dark mode variants
    darkPrimary: 'oklch(0.537 0.368 66.8)',
    darkAccent: 'oklch(0.464 0.286 90.8)',
    darkBackground: 'oklch(0.143 0.489 12.2)',
  },

  typography: {
    headingFont: 'Inter',
    bodyFont: 'Inter',
    scaleRatio: 1.25,
    baseSize: 16,
  },

  accessibility: {
    level: 'aa',
    contrastRatio: 4.5,
    focusVisible: true,
    reducedMotion: false,
  },

  compliance: {
    lgpdEnabled: true,
    healthcareOptimized: true,
    anvisaCompliant: true,
    cfmStandards: true,
    brazilianLocalization: true,
  },

  branding: {},

  performance: {
    animationDuration: 300,
    enableTransitions: true,
    lazyLoading: true,
    prefersReducedMotion: false,
  },

  layout: {
    borderRadius: 8,
    spacing: 'normal',
    containerWidth: 'lg',
  },
}

/**
 * Theme Configuration Manager Class
 */
export class ThemeConfigManager {
  private config: ThemeConfig
  private subscribers: Array<(config: ThemeConfig) => void> = []

  constructor(initialConfig?: ThemeConfig) {
    this.config = ThemeConfigSchema.parse(initialConfig || defaultNeonproTheme)
  }

  /**
   * Get current theme configuration
   */
  getConfig(): ThemeConfig {
    return this.config
  }

  /**
   * Update theme configuration with validation
   */
  updateConfig(updates: Partial<ThemeConfig>): void {
    const newConfig = { ...this.config, ...updates }
    this.config = ThemeConfigSchema.parse(newConfig)
    this.notifySubscribers()
  }

  /**
   * Subscribe to theme configuration changes
   */
  subscribe(callback: (config: ThemeConfig) => void): () => void {
    this.subscribers.push(callback)
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback)
    }
  }

  /**
   * Generate CSS variables from theme configuration
   */
  generateCSSVariables(): Record<string, string> {
    const { colors, typography, layout, performance } = this.config

    return {
      // Colors
      '--neonpro-primary': colors.primary,
      '--neonpro-accent': colors.accent,
      '--neonpro-deep-blue': colors.deepBlue,
      '--neonpro-neutral': colors.neutral,
      '--neonpro-background': colors.background,

      // Dark mode colors
      '--neonpro-dark-primary': colors.darkPrimary || colors.primary,
      '--neonpro-dark-accent': colors.darkAccent || colors.accent,
      '--neonpro-dark-background': colors.darkBackground || colors.deepBlue,

      // Typography
      '--neonpro-heading-font': typography.headingFont,
      '--neonpro-body-font': typography.bodyFont,
      '--neonpro-font-scale': typography.scaleRatio.toString(),
      '--neonpro-font-base': `${typography.baseSize}px`,

      // Layout
      '--neonpro-border-radius': `${layout.borderRadius}px`,
      '--neonpro-spacing-scale': layout.spacing,

      // Performance
      '--neonpro-animation-duration': `${performance.animationDuration}ms`,
      '--neonpro-transitions': performance.enableTransitions ? 'all' : 'none',
    }
  }

  /**
   * Apply theme to document
   */
  applyToDocument(): void {
    const variables = this.generateCSSVariables()
    const root = document.documentElement

    Object.entries(variables).forEach(([property, value]) => {
      root.style.setProperty(property, value)
    })

    // Apply compliance attributes
    root.setAttribute('data-lgpd-compliant', this.config.compliance.lgpdEnabled.toString())
    root.setAttribute('data-healthcare-optimized', this.config.compliance.healthcareOptimized.toString())
    root.setAttribute('data-accessibility-level', this.config.accessibility.level)
    root.setAttribute('data-brazilian-optimized', this.config.compliance.brazilianLocalization.toString())
  }

  /**
   * Validate WCAG compliance
   */
  validateAccessibility(): { isCompliant: boolean; issues: string[] } {
    const issues: string[] = []
    const { accessibility, colors } = this.config

    // Basic contrast validation (simplified)
    if (accessibility.contrastRatio < 3) {
      issues.push('Contrast ratio below WCAG minimum (3:1)')
    }

    if (accessibility.level === 'aaa' && accessibility.contrastRatio < 7) {
      issues.push('Contrast ratio below WCAG AAA standard (7:1)')
    }

    // Color format validation
    const colorValues = Object.values(colors).filter((color): color is string => typeof color === 'string')
    const invalidColors = colorValues.filter(color => {
      if (!color) return false
      return !color.match(/^oklch\([\d\s.%/]+\)$/) && !color.match(/^#[0-9A-Fa-f]{6}$/)
    })

    if (invalidColors.length > 0) {
      issues.push('Invalid color format detected. Use OKLCH or HEX format.')
    }

    return {
      isCompliant: issues.length === 0,
      issues
    }
  }

  /**
   * Export configuration for backup/sharing
   */
  exportConfig(): string {
    return JSON.stringify(this.config, null, 2)
  }

  /**
   * Import configuration from JSON
   */
  importConfig(configJson: string): void {
    try {
      const imported = JSON.parse(configJson)
      this.config = ThemeConfigSchema.parse(imported)
      this.notifySubscribers()
    } catch (error) {
      throw new Error(`Invalid theme configuration: ${error}`)
    }
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.config))
  }
}

/**
 * Global theme configuration manager instance
 */
export const themeConfigManager = new ThemeConfigManager()

/**
 * React hook for theme configuration
 */
export function useThemeConfig() {
  const [config, setConfig] = React.useState(themeConfigManager.getConfig())

  React.useEffect(() => {
    const unsubscribe = themeConfigManager.subscribe(setConfig)
    return unsubscribe
  }, [])

  return {
    config,
    updateConfig: themeConfigManager.updateConfig.bind(themeConfigManager),
    applyToDocument: themeConfigManager.applyToDocument.bind(themeConfigManager),
    validateAccessibility: themeConfigManager.validateAccessibility.bind(themeConfigManager),
  }
}

// React import (needed for the hook)
import React from 'react'
