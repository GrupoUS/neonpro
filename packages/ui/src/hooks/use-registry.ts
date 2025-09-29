/**
 * NEONPRO Registry Hook - React Integration for Multi-Registry Management
 * 
 * Implements A.P.T.E methodology for React hooks with:
 * - Constitutional compliance for Brazilian aesthetic clinics
 * - Component installation tracking
 * - Dependency conflict resolution
 * - WCAG 2.1 AA+ accessibility compliance
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { neonproRegistry, type RegistryComponent, type ValidationResult } from '../registry'
import type { InstallationResult, InstallationOptions } from '../lib/registry-utils'

interface UseRegistryOptions {
  autoValidate?: boolean
  constitutionalMode?: boolean
  verbose?: boolean
}

interface RegistryState {
  components: RegistryComponent[]
  installing: string[]
  installed: string[]
  failed: string[]
  validationResults: Map<string, ValidationResult>
  conflicts: Map<string, string[]>
  isReady: boolean
}

export function useRegistry(options: UseRegistryOptions = {}) {
  const {
    autoValidate = true,
    constitutionalMode = false,
    verbose = false
  } = options

  const [state, setState] = useState<RegistryState>({
    components: [],
    installing: [],
    installed: [],
    failed: [],
    validationResults: new Map(),
    conflicts: new Map(),
    isReady: false
  })

  // Initialize registry
  useEffect(() => {
    const components = neonproRegistry.getAllComponents()
    const validationResults = new Map<string, ValidationResult>()
    
    if (autoValidate) {
      components.forEach(component => {
        validationResults.set(component.id, neonproRegistry.validateInstallation(component))
      })
    }

    setState(prev => ({
      ...prev,
      components,
      validationResults,
      isReady: true
    }))
  }, [autoValidate])

  // Install component
  const installComponent = useCallback(async (
    componentName: string, 
    installOptions: InstallationOptions = {}
  ): Promise<InstallationResult> => {
    setState(prev => ({
      ...prev,
      installing: [...prev.installing, componentName]
    }))

    try {
      // Simulate installation (in real implementation, this would call registry utilities)
      const result: InstallationResult = {
        success: true,
        installed: [componentName],
        failed: [],
        conflicts: [],
        warnings: [],
        totalSize: 0
      }

      // Find component
      const component = state.components.find(c => 
        c.id === componentName || 
        c.name.toLowerCase().includes(componentName.toLowerCase())
      )

      if (!component) {
        result.failed.push(componentName)
        result.success = false
        result.warnings.push(`Component "${componentName}" not found`)
      } else {
        // Validate constitutional compliance if enabled
        if (constitutionalMode || installOptions.constitutionalMode) {
          const validation = neonproRegistry.validateInstallation(component)
          
          setState(prev => {
            const newValidationResults = new Map(prev.validationResults)
            newValidationResults.set(component.id, validation)
            
            return {
              ...prev,
              validationResults: newValidationResults
            }
          })

          if (!validation.valid) {
            result.failed.push(componentName)
            result.success = false
            result.warnings.push(`Component "${componentName}" failed constitutional validation`)
          }
        }

        if (result.success) {
          setState(prev => ({
            ...prev,
            installed: [...prev.installed, componentName],
            failed: prev.failed.filter(name => name !== componentName)
          }))
        } else {
          setState(prev => ({
            ...prev,
            failed: [...prev.failed, componentName]
          }))
        }
      }

      if (verbose) {
        console.log(`Installation result for ${componentName}:`, result)
      }

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      setState(prev => ({
        ...prev,
        failed: [...prev.failed, componentName],
        installing: prev.installing.filter(name => name !== componentName)
      }))

      const result: InstallationResult = {
        success: false,
        installed: [],
        failed: [componentName],
        conflicts: [],
        warnings: [errorMessage],
        totalSize: 0
      }

      return result
    }
  }, [state.components, constitutionalMode, verbose])

  // Install multiple components
  const installComponents = useCallback(async (
    componentNames: string[],
    installOptions: InstallationOptions = {}
  ): Promise<InstallationResult[]> => {
    const results: InstallationResult[] = []
    
    // Get installation order based on dependencies
    const components = componentNames.map(name => 
      state.components.find(c => 
        c.id === name || 
        c.name.toLowerCase().includes(name.toLowerCase())
      )
    ).filter(Boolean) as RegistryComponent[]
    
    const installOrder = neonproRegistry.getInstallationOrder(components)

    // Install components in order
    for (const component of installOrder) {
      const result = await installComponent(component.id, installOptions)
      results.push(result)
    }

    return results
  }, [state.components, installComponent])

  // Validate component
  const validateComponent = useCallback((componentId: string): ValidationResult | undefined => {
    return state.validationResults.get(componentId)
  }, [state.validationResults])

  // Check conflicts for component
  const checkConflicts = useCallback((componentId: string): string[] => {
    const component = state.components.find(c => c.id === componentId)
    if (!component) return []

    const conflicts = neonproRegistry.checkDependencyConflicts([component])
    return conflicts.map(conflict => 
      `${conflict.dependency}: ${conflict.conflictingVersions.join(' vs ')}`
    )
  }, [state.components])

  // Get components by category
  const getComponentsByCategory = useCallback((category: string): RegistryComponent[] => {
    return state.components.filter(component => component.category === category)
  }, [state.components])

  // Get available components (not installed)
  const getAvailableComponents = useCallback((): RegistryComponent[] => {
    return state.components.filter(component => 
      !state.installed.includes(component.id)
    )
  }, [state.components, state.installed])

  // Get installed components
  const getInstalledComponents = useCallback((): RegistryComponent[] => {
    return state.components.filter(component => 
      state.installed.includes(component.id)
    )
  }, [state.components, state.installed])

  // Get constitutional compliance score
  const getConstitutionalScore = useCallback((): number => {
    if (state.validationResults.size === 0) return 0
    
    const scores = Array.from(state.validationResults.values())
      .map(result => result.constitutionalScore)
    
    return scores.reduce((sum, score) => sum + score, 0) / scores.length
  }, [state.validationResults])

  // Reset installation state
  const resetInstallation = useCallback(() => {
    setState(prev => ({
      ...prev,
      installing: [],
      installed: [],
      failed: []
    }))
  }, [])

  // Check if component is installed
  const isComponentInstalled = useCallback((componentId: string): boolean => {
    return state.installed.includes(componentId)
  }, [state.installed])

  // Check if component is installing
  const isComponentInstalling = useCallback((componentId: string): boolean => {
    return state.installing.includes(componentId)
  }, [state.installing])

  // Get installation status
  const getInstallationStatus = useCallback((componentId: string): 'installed' | 'installing' | 'failed' | 'available' => {
    if (state.installed.includes(componentId)) return 'installed'
    if (state.installing.includes(componentId)) return 'installing'
    if (state.failed.includes(componentId)) return 'failed'
    return 'available'
  }, [state.installed, state.installing, state.failed])

  // Get component categories
  const getCategories = useCallback((): string[] => {
    const categories = new Set(state.components.map(component => component.category))
    return Array.from(categories).sort()
  }, [state.components])

  // Get components by registry
  const getComponentsByRegistry = useCallback((registryName: string): RegistryComponent[] => {
    return state.components.filter(component => component.registry === registryName)
  }, [state.components])

  // Get available registries
  const getAvailableRegistries = useCallback((): string[] => {
    const registries = new Set(state.components.map(component => component.registry))
    return Array.from(registries).sort()
  }, [state.components])

  return {
    // State
    components: state.components,
    installing: state.installing,
    installed: state.installed,
    failed: state.failed,
    validationResults: state.validationResults,
    isReady: state.isReady,
    
    // Actions
    installComponent,
    installComponents,
    validateComponent,
    checkConflicts,
    resetInstallation,
    
    // Queries
    getComponentsByCategory,
    getAvailableComponents,
    getInstalledComponents,
    getConstitutionalScore,
    isComponentInstalled,
    isComponentInstalling,
    getInstallationStatus,
    getCategories,
    getComponentsByRegistry,
    getAvailableRegistries,
    
    // Constitutional compliance
    constitutionalMode
  }
}

// Export type for TypeScript users
export type UseRegistryReturn = ReturnType<typeof useRegistry>

// Export convenience hooks for specific use cases
export function useComponentInstallation(componentId: string) {
  const registry = useRegistry()
  
  return {
    install: () => registry.installComponent(componentId),
    status: registry.getInstallationStatus(componentId),
    isInstalled: registry.isComponentInstalled(componentId),
    isInstalling: registry.isComponentInstalling(componentId),
    validation: registry.validateComponent(componentId),
    conflicts: registry.checkConflicts(componentId)
  }
}

export function useConstitutionalCompliance() {
  const registry = useRegistry({ constitutionalMode: true })
  
  return {
    score: registry.getConstitutionalScore(),
    validations: Array.from(registry.validationResults.values()),
    isCompliant: registry.getConstitutionalScore() >= 100,
    issues: Array.from(registry.validationResults.values())
      .flatMap(result => result.issues)
  }
}

export function useRegistryCategories() {
  const registry = useRegistry()
  
  return {
    categories: registry.getCategories(),
    getComponents: registry.getComponentsByCategory,
    availableComponents: registry.getAvailableComponents()
  }
}