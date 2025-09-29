/**
 * NEONPRO Font Provider - Constitutional Compliance & Brazilian Optimization
 * 
 * Implements A.P.T.E methodology for font loading with:
 * - LGPD compliance for font loading analytics
 * - WCAG 2.1 AA+ accessibility compliance
 * - Brazilian network optimization
 * - Healthcare workflow optimization
 */

'use client'

import React, { useEffect, useState } from 'react'
import { 
  generateNEONPROFontCSS, 
  validateFontLoading, 
  useFontOptimization,
  type FontValidationResult 
} from '../../lib/fonts'

interface FontProviderProps {
  children: React.ReactNode
  enableAnalytics?: boolean
  enableValidation?: boolean
  constitutionalCompliance?: {
    lgpdMode?: boolean
    emergencyMode?: boolean
    accessibilityMode?: boolean
  }
}

export function FontProvider({
  children,
  enableAnalytics = false,
  enableValidation = true,
  constitutionalCompliance = {
    lgpdMode: true,
    emergencyMode: false,
    accessibilityMode: true
  }
}: FontProviderProps) {
  const [fontStatus, setFontStatus] = useState<FontValidationResult>({
    valid: false,
    loaded: false,
    errors: [],
    warnings: []
  })
  
  const [loadingProgress, setLoadingProgress] = useState(0)
  const { optimization, shouldPreload } = useFontOptimization()

  // Inject CSS font-face rules
  useEffect(() => {
    if (typeof document === 'undefined') return

    const css = generateNEONPROFontCSS()
    
    // Check if font styles already exist
    const existingStyle = document.getElementById('neonpro-font-styles')
    if (existingStyle) return

    const style = document.createElement('style')
    style.id = 'neonpro-font-styles'
    style.textContent = css
    document.head.appendChild(style)

    // Add constitutional compliance classes
    if (constitutionalCompliance.lgpdMode) {
      document.documentElement.classList.add('lgpd-compliant')
    }
    
    if (constitutionalCompliance.emergencyMode) {
      document.documentElement.classList.add('emergency-mode')
    }
    
    if (constitutionalCompliance.accessibilityMode) {
      document.documentElement.classList.add('accessibility-mode')
    }

    return () => {
      document.head.removeChild(style)
    }
  }, [constitutionalCompliance])

  // Validate font loading
  useEffect(() => {
    if (!enableValidation || typeof document === 'undefined') return

    const validateFonts = async () => {
      try {
        const result = await validateFontLoading()
        setFontStatus(result)
        
        // Log compliance status
        if (enableAnalytics && constitutionalCompliance.lgpdMode) {
          console.log('Font loading validation:', {
            valid: result.valid,
            loaded: result.loaded,
            errors: result.errors.length,
            warnings: result.warnings.length,
            timestamp: new Date().toISOString()
          })
        }
      } catch (error) {
        console.error('Font validation failed:', error)
        setFontStatus(prev => ({
          ...prev,
          valid: false,
          errors: [...prev.errors, `Validation error: ${error}`]
        }))
      }
    }

    const timeoutId = setTimeout(validateFonts, optimization.timeout)
    return () => clearTimeout(timeoutId)
  }, [enableValidation, enableAnalytics, optimization.timeout, constitutionalCompliance.lgpdMode])

  // Monitor loading progress
  useEffect(() => {
    if (typeof document === 'undefined') return

    const checkProgress = () => {
      const loadedFonts = document.fonts.size
      const totalFonts = 12 // Inter (6 weights × 2 styles) + Lora (4 weights × 2 styles) + Libre Baskerville (2 weights)
      const progress = Math.min((loadedFonts / totalFonts) * 100, 100)
      setLoadingProgress(progress)
    }

    const intervalId = setInterval(checkProgress, 100)
    return () => clearInterval(intervalId)
  }, [])

  // Handle font loading errors gracefully
  const handleFontError = (error: Error) => {
    console.error('Font loading error:', error)
    
    // Apply fallback strategies
    document.documentElement.classList.add('font-fallback')
    
    // Log error for debugging (without PII)
    if (enableAnalytics && constitutionalCompliance.lgpdMode) {
      console.log('Font fallback activated', {
        errorType: error.name,
        timestamp: new Date().toISOString()
      })
    }
  }

  // Get loading strategy for current network conditions
  const getLoadingStrategy = () => {
    switch (optimization.strategy) {
      case 'aggressive':
        return { preload: true, timeout: 3000, retry: 5 }
      case 'balanced':
        return { preload: true, timeout: 5000, retry: 3 }
      case 'conservative':
        return { preload: false, timeout: 8000, retry: 2 }
      default:
        return { preload: true, timeout: 5000, retry: 3 }
    }
  }

  const loadingStrategy = getLoadingStrategy()

  return (
    <div className="font-provider" data-font-status={fontStatus.valid ? 'loaded' : 'loading'}>
      {/* Font loading state for debugging */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 z-50 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-xs">
          <div className="font-semibold mb-2">Font Loading Status</div>
          <div>Progress: {Math.round(loadingProgress)}%</div>
          <div>Strategy: {optimization.strategy}</div>
          <div>Valid: {fontStatus.valid ? '✓' : '✗'}</div>
          <div>Loaded: {fontStatus.loaded ? '✓' : '✗'}</div>
          {fontStatus.errors.length > 0 && (
            <div className="text-red-500 mt-1">
              Errors: {fontStatus.errors.length}
            </div>
          )}
          {fontStatus.warnings.length > 0 && (
            <div className="text-yellow-500 mt-1">
              Warnings: {fontStatus.warnings.length}
            </div>
          )}
        </div>
      )}

      {/* Apply constitutional compliance classes */}
      {constitutionalCompliance.emergencyMode && (
        <div className="emergency-font-optimization">
          {/* High contrast fonts for emergency situations */}
          <style jsx>{`
            .emergency-font-optimization * {
              font-weight: 600 !important;
              letter-spacing: 0.02em !important;
            }
          `}</style>
        </div>
      )}

      {/* Main content */}
      {children}

      {/* Fallback handling */}
      {!fontStatus.valid && fontStatus.errors.length > 0 && (
        <div className="font-fallback-notice">
          <style jsx>{`
            .font-fallback-notice {
              position: fixed;
              top: 20px;
              right: 20px;
              background: #fef3c7;
              border: 1px solid #f59e0b;
              border-radius: 8px;
              padding: 12px;
              font-size: 14px;
              z-index: 9999;
              max-width: 300px;
            }
            
            .font-fallback-notice h4 {
              margin: 0 0 8px 0;
              color: #92400e;
            }
            
            .font-fallback-notice p {
              margin: 0;
              color: #78350f;
            }
          `}</style>
          
          <h4>Font Loading Issue</h4>
          <p>
            Some fonts failed to load. The system is using fallback fonts. 
            This may affect display quality but maintains functionality.
          </p>
        </div>
      )}
    </div>
  )
}

// Export hook for accessing font status
export function useFontStatus() {
  const [fontStatus, setFontStatus] = useState<FontValidationResult>({
    valid: false,
    loaded: false,
    errors: [],
    warnings: []
  })

  // This would typically be connected to context or state management
  // For now, it's a placeholder for future enhancement
  return { fontStatus, setFontStatus }
}