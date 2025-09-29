/**
 * NEONPRO Font Loader - Brazilian Aesthetic Clinic Optimization
 * 
 * Implements A.P.T.E methodology for font loading with:
 * - WCAG 2.1 AA+ accessibility compliance
 * - Brazilian mobile-first optimization
 * - Healthcare workflow optimization
 * - Constitutional compliance for aesthetic clinics
 */

'use client'

import React, { useEffect, useState } from 'react'

interface FontLoaderProps {
  children: React.ReactNode
  showProgress?: boolean
  enablePreloading?: boolean
  optimization?: {
    mobileFirst?: boolean
    lowBandwidth?: boolean
    accessibility?: boolean
  }
}

interface FontLoadingState {
  inter: boolean
  lora: boolean
  libreBaskerville: boolean
  allLoaded: boolean
  progress: number
  errors: string[]
}

export function FontLoader({
  children,
  showProgress = false,
  enablePreloading = true,
  optimization = {
    mobileFirst: true,
    lowBandwidth: false,
    accessibility: true
  }
}: FontLoaderProps) {
  const [fontState, setFontState] = useState<FontLoadingState>({
    inter: false,
    lora: false,
    libreBaskerville: false,
    allLoaded: false,
    progress: 0,
    errors: []
  })

  // Font loading optimization for Brazilian networks
  useEffect(() => {
    if (typeof document === 'undefined') return

    const loadFonts = async () => {
      const fonts = [
        { name: 'Inter', key: 'inter' as const, weights: [300, 400, 500, 600, 700, 800] },
        { name: 'Lora', key: 'lora' as const, weights: [400, 500, 600, 700] },
        { name: 'Libre Baskerville', key: 'libreBaskerville' as const, weights: [400, 700] }
      ]

      let loadedCount = 0
      const totalFonts = fonts.length
      const errors: string[] = []

      // Load fonts progressively
      for (const font of fonts) {
        try {
          // Load all weights for this font family
          const fontPromises = font.weights.map(weight => {
            const fontFace = new FontFace(
              font.name,
              `url('/fonts/${font.name.toLowerCase().replace(' ', '-')}-${weight}.woff2') format('woff2')`,
              { weight: weight.toString(), style: 'normal' }
            )
            return fontFace.load()
          })

          await Promise.all(fontPromises)
          
          // Add loaded fonts to document
          fontPromises.forEach(async (promise, index) => {
            try {
              const fontFace = await promise
              document.fonts.add(fontFace)
            } catch (error) {
              errors.push(`Failed to load ${font.name} weight ${font.weights[index]}`)
            }
          })

          // Update state
          loadedCount++
          setFontState(prev => ({
            ...prev,
            [font.key]: true,
            progress: (loadedCount / totalFonts) * 100,
            errors
          }))

          console.log(`✅ ${font.name} loaded successfully`)
          
        } catch (error) {
          errors.push(`Failed to load ${font.name}: ${error}`)
          setFontState(prev => ({
            ...prev,
            errors: [...prev.errors, `Failed to load ${font.name}`]
          }))
        }
      }

      // Final state update
      const allLoaded = loadedCount === totalFonts && errors.length === 0
      setFontState(prev => ({
        ...prev,
        allLoaded,
        progress: 100
      }))

      // Apply constitutional compliance classes
      if (allLoaded) {
        document.documentElement.classList.add('fonts-loaded')
        
        if (optimization.accessibility) {
          document.documentElement.classList.add('accessibility-optimized')
        }
        
        if (optimization.mobileFirst) {
          document.documentElement.classList.add('mobile-optimized')
        }
      }
    }

    // Start font loading with appropriate delay based on optimization
    const delay = optimization.lowBandwidth ? 2000 : 0
    const timeoutId = setTimeout(loadFonts, delay)
    
    return () => clearTimeout(timeoutId)
  }, [enablePreloading, optimization])

  // Handle font loading fallback
  useEffect(() => {
    if (typeof document === 'undefined') return

    // Apply fallback classes if fonts take too long to load
    const fallbackTimeout = setTimeout(() => {
      if (!fontState.allLoaded) {
        document.documentElement.classList.add('font-fallback')
        console.log('⚠️ Font fallback activated - some fonts may not be available')
      }
    }, 8000) // 8 second timeout

    return () => clearTimeout(fallbackTimeout)
  }, [fontState.allLoaded])

  // Brazilian mobile optimization
  useEffect(() => {
    if (typeof document === 'undefined' || !optimization.mobileFirst) return

    // Add mobile-specific font optimizations
    const isMobile = window.innerWidth < 768
    if (isMobile) {
      document.documentElement.classList.add('mobile-fonts')
      
      // Optimize font rendering for mobile
      const style = document.createElement('style')
      style.textContent = `
        .mobile-fonts {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }
        
        .mobile-fonts body {
          font-size: 16px; /* Better readability on mobile */
          line-height: 1.6;
        }
        
        /* Portuguese text optimization */
        .mobile-fonts [lang="pt-BR"] {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }
      `
      document.head.appendChild(style)
      
      return () => {
        document.head.removeChild(style)
      }
    }
  }, [optimization.mobileFirst])

  // Progress indicator
  if (showProgress && !fontState.allLoaded) {
    return (
      <div className="font-loading-container">
        <style jsx>{`
          .font-loading-container {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.95);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            font-family: system-ui, -apple-system, sans-serif;
          }
          
          .font-loading-content {
            text-align: center;
            max-width: 400px;
            padding: 2rem;
          }
          
          .font-loading-progress {
            width: 200px;
            height: 4px;
            background: #e5e7eb;
            border-radius: 2px;
            overflow: hidden;
            margin: 1rem auto;
          }
          
          .font-loading-bar {
            height: 100%;
            background: linear-gradient(90deg, #AC9469 0%, #112031 100%);
            border-radius: 2px;
            transition: width 0.3s ease;
          }
          
          .font-loading-text {
            color: #112031;
            font-size: 14px;
            margin-bottom: 0.5rem;
          }
          
          .font-loading-error {
            color: #dc2626;
            font-size: 12px;
            margin-top: 1rem;
          }
          
          @media (prefers-color-scheme: dark) {
            .font-loading-container {
              background: rgba(17, 32, 49, 0.95);
            }
            
            .font-loading-text {
              color: #f5f5f5;
            }
          }
        `}</style>
        
        <div className="font-loading-content">
          <div className="font-loading-text">
            Carregando fontes NEONPRO...
          </div>
          <div className="font-loading-progress">
            <div 
              className="font-loading-bar"
              style={{ width: `${fontState.progress}%` }}
            />
          </div>
          <div className="font-loading-text">
            {Math.round(fontState.progress)}% completo
          </div>
          
          {fontState.errors.length > 0 && (
            <div className="font-loading-error">
              Alguns fonts não puderam ser carregadas. Usando fontes alternativas.
            </div>
          )}
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Export hook for accessing font state
export function useFontLoader() {
  const [fontState, setFontState] = useState<FontLoadingState>({
    inter: false,
    lora: false,
    libreBaskerville: false,
    allLoaded: false,
    progress: 0,
    errors: []
  })

  // This would typically be connected to context or state management
  return { fontState, setFontState }
}