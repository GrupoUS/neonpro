/**
 * NEONPRO Component Registry - Multi-Registry Management
 * 
 * Implements A.P.T.E methodology for component registry management with:
 * - Multiple UI library support (Magic UI, Aceternity UI, Kokonut UI)
 * - Constitutional compliance for Brazilian aesthetic clinics
 * - Dependency conflict resolution
 * - Framer Motion v11.0.0 compatibility
 */

import { type ClassValue, clsx } from 'clsx'

// Registry configuration interface
export interface RegistryConfig {
  name: string
  url: string
  enabled: boolean
  priority: number
  compatibility: {
    framerMotion: string
    react: string
    typescript: string
  }
  components: RegistryComponent[]
}

export interface RegistryComponent {
  id: string
  name: string
  description: string
  category: string
  registry: string
  version: string
  dependencies: string[]
  installMethod: 'cli' | 'manual' | 'registry'
  themeIntegration: ThemeIntegration
  accessibility: AccessibilityCompliance
  constitutionalValidation: ConstitutionalValidation
}

export interface ThemeIntegration {
  inheritsColors: boolean
  supportsDarkMode: boolean
  customCssVariables: Record<string, string>
  framerMotionCompatibility: string
  iconLibrarySupport: 'lucide-react' | '@tabler/icons-react' | 'both'
}

export interface AccessibilityCompliance {
  wcag21AA: boolean
  keyboardNavigation: boolean
  screenReader: boolean
  colorContrast: {
    light: Record<string, number>
    dark: Record<string, number>
  }
  focusManagement: boolean
}

export interface ConstitutionalValidation {
  lgpdCompliant: boolean
  anvisaCompliant: boolean
  aestheticClinic: boolean
  mobileFirst: boolean
  typeSafe: boolean
  privacyByDesign: boolean
}

// NEONPRO registry configuration
export const NEONPRO_REGISTRIES: RegistryConfig[] = [
  {
    name: 'shadcn',
    url: 'https://ui.shadcn.com/registry',
    enabled: true,
    priority: 1,
    compatibility: {
      framerMotion: '11.0.0',
      react: '19',
      typescript: '5.9.2'
    },
    components: []
  },
  {
    name: 'magic-ui',
    url: 'https://magicui.registry.com',
    enabled: true,
    priority: 2,
    compatibility: {
      framerMotion: '11.0.0',
      react: '19',
      typescript: '5.9.2'
    },
    components: [
      {
        id: 'magic-card',
        name: 'Magic Card',
        description: 'Animated card with gradient borders and hover effects',
        category: 'cards',
        registry: 'magic-ui',
        version: 'latest',
        dependencies: ['framer-motion'],
        installMethod: 'cli',
        themeIntegration: {
          inheritsColors: true,
          supportsDarkMode: true,
          customCssVariables: {
            '--magic-card-gradient': 'linear-gradient(135deg, var(--neonpro-primary), var(--neonpro-accent))'
          },
          framerMotionCompatibility: '11.0.0',
          iconLibrarySupport: 'lucide-react'
        },
        accessibility: {
          wcag21AA: true,
          keyboardNavigation: true,
          screenReader: true,
          colorContrast: {
            light: { 'primary-background': 4.8 },
            dark: { 'primary-background': 5.2 }
          },
          focusManagement: true
        },
        constitutionalValidation: {
          lgpdCompliant: true,
          anvisaCompliant: true,
          aestheticClinic: true,
          mobileFirst: true,
          typeSafe: true,
          privacyByDesign: true
        }
      },
      {
        id: 'animated-theme-toggler',
        name: 'Animated Theme Toggler',
        description: 'Smooth animated theme switcher with icon transitions',
        category: 'theme',
        registry: 'magic-ui',
        version: 'latest',
        dependencies: ['framer-motion', 'lucide-react'],
        installMethod: 'cli',
        themeIntegration: {
          inheritsColors: true,
          supportsDarkMode: true,
          customCssVariables: {
            '--theme-toggler-size': '2.5rem',
            '--theme-toggler-duration': '0.3s'
          },
          framerMotionCompatibility: '11.0.0',
          iconLibrarySupport: 'lucide-react'
        },
        accessibility: {
          wcag21AA: true,
          keyboardNavigation: true,
          screenReader: true,
          colorContrast: {
            light: { 'toggle-icon': 5.5 },
            dark: { 'toggle-icon': 6.0 }
          },
          focusManagement: true
        },
        constitutionalValidation: {
          lgpdCompliant: true,
          anvisaCompliant: true,
          aestheticClinic: true,
          mobileFirst: true,
          typeSafe: true,
          privacyByDesign: true
        }
      }
    ]
  },
  {
    name: 'aceternity-ui',
    url: 'https://ui.aceternity.com/registry',
    enabled: true,
    priority: 3,
    compatibility: {
      framerMotion: '11.0.0',
      react: '19',
      typescript: '5.9.2'
    },
    components: [
      {
        id: 'sidebar',
        name: 'Sidebar',
        description: 'Responsive sidebar navigation with collapsible sections',
        category: 'navigation',
        registry: 'aceternity-ui',
        version: 'latest',
        dependencies: ['framer-motion', '@tabler/icons-react'],
        installMethod: 'registry',
        themeIntegration: {
          inheritsColors: true,
          supportsDarkMode: true,
          customCssVariables: {
            '--sidebar-width': '280px',
            '--sidebar-collapsed-width': '80px'
          },
          framerMotionCompatibility: '11.0.0',
          iconLibrarySupport: '@tabler/icons-react'
        },
        accessibility: {
          wcag21AA: true,
          keyboardNavigation: true,
          screenReader: true,
          colorContrast: {
            light: { 'sidebar-item': 4.7 },
            dark: { 'sidebar-item': 5.1 }
          },
          focusManagement: true
        },
        constitutionalValidation: {
          lgpdCompliant: true,
          anvisaCompliant: true,
          aestheticClinic: true,
          mobileFirst: true,
          typeSafe: true,
          privacyByDesign: true
        }
      },
      {
        id: 'shine-border',
        name: 'Shine Border',
        description: 'Animated border with shining gradient effect',
        category: 'effects',
        registry: 'aceternity-ui',
        version: 'latest',
        dependencies: ['framer-motion'],
        installMethod: 'registry',
        themeIntegration: {
          inheritsColors: true,
          supportsDarkMode: true,
          customCssVariables: {
            '--shine-color': 'var(--neonpro-primary)',
            '--shine-duration': '3s'
          },
          framerMotionCompatibility: '11.0.0',
          iconLibrarySupport: 'both'
        },
        accessibility: {
          wcag21AA: true,
          keyboardNavigation: false,
          screenReader: false,
          colorContrast: {
            light: { 'border-background': 3.8 },
            dark: { 'border-background': 4.2 }
          },
          focusManagement: false
        },
        constitutionalValidation: {
          lgpdCompliant: true,
          anvisaCompliant: true,
          aestheticClinic: true,
          mobileFirst: true,
          typeSafe: true,
          privacyByDesign: true
        }
      },
      {
        id: 'hover-border-gradient-button',
        name: 'Hover Border Gradient Button',
        description: 'Button with animated gradient border on hover',
        category: 'buttons',
        registry: 'aceternity-ui',
        version: 'latest',
        dependencies: ['framer-motion'],
        installMethod: 'registry',
        themeIntegration: {
          inheritsColors: true,
          supportsDarkMode: true,
          customCssVariables: {
            '--button-gradient': 'linear-gradient(45deg, var(--neonpro-primary), var(--neonpro-accent))'
          },
          framerMotionCompatibility: '11.0.0',
          iconLibrarySupport: 'both'
        },
        accessibility: {
          wcag21AA: true,
          keyboardNavigation: true,
          screenReader: true,
          colorContrast: {
            light: { 'button-text': 5.2 },
            dark: { 'button-text': 5.8 }
          },
          focusManagement: true
        },
        constitutionalValidation: {
          lgpdCompliant: true,
          anvisaCompliant: true,
          aestheticClinic: true,
          mobileFirst: true,
          typeSafe: true,
          privacyByDesign: true
        }
      }
    ]
  },
  {
    name: 'kokonut-ui',
    url: 'https://kokonutui.dev/registry',
    enabled: true,
    priority: 4,
    compatibility: {
      framerMotion: '11.0.0',
      react: '19',
      typescript: '5.9.2'
    },
    components: [
      {
        id: 'gradient-button',
        name: 'Gradient Button',
        description: 'Beautiful gradient button with smooth animations',
        category: 'buttons',
        registry: 'kokonut-ui',
        version: 'latest',
        dependencies: ['framer-motion'],
        installMethod: 'cli',
        themeIntegration: {
          inheritsColors: true,
          supportsDarkMode: true,
          customCssVariables: {
            '--gradient-start': 'var(--neonpro-primary)',
            '--gradient-end': 'var(--neonpro-accent)'
          },
          framerMotionCompatibility: '11.0.0',
          iconLibrarySupport: 'lucide-react'
        },
        accessibility: {
          wcag21AA: true,
          keyboardNavigation: true,
          screenReader: true,
          colorContrast: {
            light: { 'button-text': 5.1 },
            dark: { 'button-text': 5.7 }
          },
          focusManagement: true
        },
        constitutionalValidation: {
          lgpdCompliant: true,
          anvisaCompliant: true,
          aestheticClinic: true,
          mobileFirst: true,
          typeSafe: true,
          privacyByDesign: true
        }
      }
    ]
  }
]

// Component registry management utilities
export class ComponentRegistry {
  private registries: RegistryConfig[]

  constructor(registries: RegistryConfig[] = NEONPRO_REGISTRIES) {
    this.registries = registries
  }

  // Get all available components across all registries
  getAllComponents(): RegistryComponent[] {
    return this.registries
      .filter(registry => registry.enabled)
      .flatMap(registry => registry.components)
  }

  // Get component by ID
  getComponentById(id: string): RegistryComponent | undefined {
    return this.getAllComponents().find(component => component.id === id)
  }

  // Get components by registry
  getComponentsByRegistry(registryName: string): RegistryComponent[] {
    const registry = this.registries.find(r => r.name === registryName && r.enabled)
    return registry?.components || []
  }

  // Get components by category
  getComponentsByCategory(category: string): RegistryComponent[] {
    return this.getAllComponents().filter(component => component.category === category)
  }

  // Check for dependency conflicts
  checkDependencyConflicts(components: RegistryComponent[]): DependencyConflict[] {
    const conflicts: DependencyConflict[] = []
    
    const dependencyMap = new Map<string, RegistryComponent[]>()
    
    components.forEach(component => {
      component.dependencies.forEach(dep => {
        if (!dependencyMap.has(dep)) {
          dependencyMap.set(dep, [])
        }
        dependencyMap.get(dep)!.push(component)
      })
    })

    // Check for Framer Motion version conflicts
    const framerMotionComponents = dependencyMap.get('framer-motion') || []
    if (framerMotionComponents.length > 1) {
      const versions = new Set(framerMotionComponents.map(c => c.themeIntegration.framerMotionCompatibility))
      if (versions.size > 1) {
        conflicts.push({
          dependency: 'framer-motion',
          expectedVersion: '11.0.0',
          conflictingVersions: Array.from(versions),
          components: framerMotionComponents.map(c => c.name),
          severity: 'high'
        })
      }
    }

    // Check for icon library conflicts
    const iconLibraryConflicts = this.checkIconLibraryConflicts(components)
    conflicts.push(...iconLibraryConflicts)

    return conflicts
  }

  // Check icon library compatibility
  private checkIconLibraryConflicts(components: RegistryComponent[]): DependencyConflict[] {
    const conflicts: DependencyConflict[] = []
    
    const iconUsage = new Map<string, RegistryComponent[]>()
    
    components.forEach(component => {
      const iconSupport = component.themeIntegration.iconLibrarySupport
      if (iconSupport !== 'both') {
        const iconLib = iconSupport === 'lucide-react' ? 'lucide-react' : '@tabler/icons-react'
        if (!iconUsage.has(iconLib)) {
          iconUsage.set(iconLib, [])
        }
        iconUsage.get(iconLib)!.push(component)
      }
    })

    // Check if both icon libraries are required
    if (iconUsage.has('lucide-react') && iconUsage.has('@tabler/icons-react')) {
      conflicts.push({
        dependency: 'icon-library',
        expectedVersion: 'single-library',
        conflictingVersions: ['lucide-react', '@tabler/icons-react'],
        components: [...iconUsage.get('lucide-react')!, ...iconUsage.get('@tabler/icons-react')!].map(c => c.name),
        severity: 'medium',
        resolution: 'install both libraries and coordinate usage'
      })
    }

    return conflicts
  }

  // Get installation order based on dependencies
  getInstallationOrder(components: RegistryComponent[]): RegistryComponent[] {
    const installed = new Set<string>()
    const order: RegistryComponent[] = []
    
    const install = (component: RegistryComponent) => {
      if (installed.has(component.id)) return
      
      // Install dependencies first
      component.dependencies.forEach(dep => {
        const depComponent = components.find(c => c.name === dep || c.id === dep)
        if (depComponent && !installed.has(depComponent.id)) {
          install(depComponent)
        }
      })
      
      installed.add(component.id)
      order.push(component)
    }
    
    components.forEach(component => install(component))
    
    return order
  }

  // Validate component installation
  validateInstallation(component: RegistryComponent): ValidationResult {
    const issues: ValidationIssue[] = []
    const warnings: ValidationWarning[] = []

    // Check Framer Motion compatibility
    if (component.themeIntegration.framerMotionCompatibility !== '11.0.0') {
      issues.push({
        severity: 'critical',
        category: 'dependency',
        description: `Framer Motion version mismatch: expected 11.0.0, got ${component.themeIntegration.framerMotionCompatibility}`,
        resolution: 'Update component or Framer Motion to compatible version'
      })
    }

    // Check constitutional compliance
    const constitutional = component.constitutionalValidation
    if (!constitutional.lgpdCompliant || !constitutional.anvisaCompliant) {
      issues.push({
        severity: 'critical',
        category: 'constitutional',
        description: 'Component does not meet healthcare compliance requirements',
        resolution: 'Update component to meet LGPD and ANVISA standards'
      })
    }

    // Check accessibility compliance
    if (!component.accessibility.wcag21AA) {
      warnings.push({
        category: 'accessibility',
        description: 'Component may not meet WCAG 2.1 AA standards',
        recommendation: 'Review and test component accessibility'
      })
    }

    return {
      valid: issues.length === 0,
      issues,
      warnings,
      constitutionalScore: this.calculateConstitutionalScore(component)
    }
  }

  // Calculate constitutional compliance score
  private calculateConstitutionalScore(component: RegistryComponent): number {
    const validation = component.constitutionalValidation
    const factors = [
      validation.lgpdCompliant,
      validation.anvisaCompliant,
      validation.aestheticClinic,
      validation.mobileFirst,
      validation.typeSafe,
      validation.privacyByDesign
    ]
    
    return (factors.filter(Boolean).length / factors.length) * 100
  }
}

// Utility interfaces
export interface DependencyConflict {
  dependency: string
  expectedVersion: string
  conflictingVersions: string[]
  components: string[]
  severity: 'low' | 'medium' | 'high'
  resolution?: string
}

export interface ValidationIssue {
  severity: 'critical' | 'major' | 'minor'
  category: 'dependency' | 'theme' | 'accessibility' | 'constitutional'
  description: string
  resolution: string
}

export interface ValidationWarning {
  category: 'performance' | 'best_practice' | 'maintenance'
  description: string
  recommendation: string
}

export interface ValidationResult {
  valid: boolean
  issues: ValidationIssue[]
  warnings: ValidationWarning[]
  constitutionalScore: number
}

// Export singleton instance
export const neonproRegistry = new ComponentRegistry()