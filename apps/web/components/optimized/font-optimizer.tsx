'use client'

import { Inter, JetBrains_Mono, Lora, } from 'next/font/google'
import localFont from 'next/font/local'
import { useEffect, useRef, useState, } from 'react'

// Optimized Google Fonts with display swap and preload
const inter = Inter({
  subsets: ['latin',],
  display: 'swap',
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700',],
  preload: true,
  fallback: [
    'ui-sans-serif',
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Arial',
    'sans-serif',
  ],
},)

const lora = Lora({
  subsets: ['latin',],
  display: 'swap',
  variable: '--font-lora',
  weight: ['400', '500', '600', '700',],
  preload: false, // Secondary font - não precisa preload
  fallback: [
    'ui-serif',
    'Georgia',
    'Cambria',
    'Times New Roman',
    'Times',
    'serif',
  ],
},)

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin',],
  display: 'swap',
  variable: '--font-jetbrains-mono',
  weight: ['400', '500', '600',],
  preload: false, // Usado apenas em códigos
  fallback: [
    'ui-monospace',
    'SFMono-Regular',
    'Monaco',
    'Consolas',
    'Liberation Mono',
    'Courier New',
    'monospace',
  ],
},)

// Local fonts para healthcare (caso necessário)
const healthcareFont = localFont({
  src: [
    {
      path: '../fonts/healthcare-regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/healthcare-medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../fonts/healthcare-bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-healthcare',
  display: 'swap',
  fallback: ['Inter', 'system-ui', 'sans-serif',],
},)

// Font loading optimization utilities
export const FontOptimizer = {
  // Get all font class names for HTML
  getClassNames: () => {
    return `${inter.className} ${inter.variable} ${lora.variable} ${jetbrainsMono.variable}`
  },

  // Get font variables for Tailwind CSS
  getVariables: () => {
    return {
      '--font-inter': inter.style.fontFamily,
      '--font-lora': lora.style.fontFamily,
      '--font-jetbrains-mono': jetbrainsMono.style.fontFamily,
    }
  },

  // Generate critical font CSS for inline
  getCriticalCSS: () => {
    return `
      /* Critical font loading - prevents FOUT/FOIT */
      @font-face {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: url('https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeMZhrib2Bg-4.woff2') format('woff2');
        unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
      }
      
      /* Fallback system fonts */
      .font-loading {
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      }
    `
  },

  // Generate font preload links
  getPreloadLinks: () => {
    return [
      // Preload critical Inter weights
      {
        rel: 'preload',
        href:
          'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeMZhrib2Bg-4.woff2',
        as: 'font',
        type: 'font/woff2',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'preload',
        href:
          'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fMZhrib2Bg-4.woff2',
        as: 'font',
        type: 'font/woff2',
        crossOrigin: 'anonymous',
      },
    ]
  },

  // Check if fonts are loaded
  checkFontLoading: async () => {
    if (typeof window === 'undefined' || !('fonts' in document)) {
      return false
    }

    try {
      await document.fonts.ready
      return document.fonts.check('16px Inter',)
    } catch {
      return false
    }
  },
}

// Healthcare-specific font configurations
export const HealthcareFontConfig = {
  // Font sizes para different contexts
  sizes: {
    // Emergency context - larger, more readable
    emergency: {
      base: '18px',
      heading: '32px',
      body: '18px',
      caption: '16px',
    },

    // Standard healthcare interface
    standard: {
      base: '16px',
      heading: '24px',
      body: '16px',
      caption: '14px',
    },

    // Compact for tablets/mobile
    compact: {
      base: '14px',
      heading: '20px',
      body: '14px',
      caption: '12px',
    },
  },

  // Line heights para readability
  lineHeights: {
    tight: 1.4,
    normal: 1.65, // Otimizado para português
    relaxed: 1.8,
  },

  // Letter spacing para medical terminology
  letterSpacing: {
    tight: '-0.01em',
    normal: '0.01em', // Melhor para termos médicos
    wide: '0.02em',
  },

  // Font weights
  weights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const

// Font loading performance component
interface FontLoadingProviderProps {
  children: React.ReactNode
}

export function FontLoadingProvider({ children, }: FontLoadingProviderProps,) {
  return (
    <div className={FontOptimizer.getClassNames()}>
      <style jsx global>
        {`
        /* Prevent FOUT during font loading */
        .font-loading {
          visibility: hidden;
        }
        
        .fonts-loaded {
          visibility: visible;
        }
        
        /* Optimize CLS prevention */
        html {
          font-family: ${inter.style.fontFamily}, ui-sans-serif, system-ui, sans-serif;
          font-display: swap;
        }
        
        /* Healthcare-specific font optimizations */
        .medical-text {
          font-variant-numeric: tabular-nums;
          letter-spacing: 0.01em;
          line-height: 1.65;
        }
        
        .emergency-text {
          font-size: 18px;
          font-weight: 600;
          line-height: 1.4;
          letter-spacing: 0.02em;
        }
        
        .patient-data {
          font-variant-numeric: tabular-nums;
          font-feature-settings: "tnum" 1;
        }
      `}
      </style>
      {children}
    </div>
  )
}

// Hook para font optimization
export function useFontOptimization() {
  const [fontsLoaded, setFontsLoaded,] = useState(false,)
  const [fontLoadTime, setFontLoadTime,] = useState<number | null>(null,)
  const fontsLoadedRef = useRef(false,)

  // Keep ref in sync with state
  useEffect(() => {
    fontsLoadedRef.current = fontsLoaded
  }, [fontsLoaded,],)

  useEffect(() => {
    const startTime = performance.now()

    const checkFonts = async () => {
      const loaded = await FontOptimizer.checkFontLoading()
      if (loaded) {
        const loadTime = performance.now() - startTime
        setFontLoadTime(loadTime,)
        setFontsLoaded(true,)

        // Add loaded class to prevent FOUT
        document.documentElement.classList.add('fonts-loaded',)
        document.documentElement.classList.remove('font-loading',)
      }
    }

    // Check immediately and then periodically
    checkFonts()
    const interval = setInterval(checkFonts, 100,)

    // Cleanup after 5 seconds (fallback)
    const timeout = setTimeout(() => {
      clearInterval(interval,)
      if (!fontsLoadedRef.current) {
        setFontsLoaded(true,)
        document.documentElement.classList.add('fonts-loaded',)
      }
    }, 5000,)

    return () => {
      clearInterval(interval,)
      clearTimeout(timeout,)
    }
  }, [],) // Remove fontsLoaded from dependency array since we use ref now

  return {
    fontsLoaded,
    fontLoadTime,
  }
}

// Export font instances
export { healthcareFont, inter, jetbrainsMono, lora, }

// Export CSS classes for Tailwind config
export const fontClasses = {
  sans: ['var(--font-inter)', ...inter.style.fontFamily.split(',',),],
  serif: ['var(--font-lora)', ...lora.style.fontFamily.split(',',),],
  mono: ['var(--font-jetbrains-mono)', ...jetbrainsMono.style.fontFamily.split(',',),],
} as const
