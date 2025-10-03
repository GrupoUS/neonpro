/**
 * Font type definitions for NeonPro
 */

export interface FontMetrics {
  ascent: number
  descent: number
  lineGap: number
  unitsPerEm: number
}

export interface FontVariation {
  weight: number
  style: 'normal' | 'italic'
  width?: number
  slant?: number
  opticalSize?: number
}

export interface FontFamily {
  name: string
  category: 'serif' | 'sans-serif' | 'monospace' | 'display' | 'handwriting'
  variations: FontVariation[]
  metrics?: FontMetrics
  fallbacks: string[]
}

export type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
export type FontStyle = 'normal' | 'italic' | 'oblique'

export interface FontLoadOptions {
  display: 'auto' | 'block' | 'swap' | 'fallback' | 'optional'
  timeout?: number
  retryAttempts?: number
}

export interface FontLoadingState {
  family: string
  weight: FontWeight
  style: FontStyle
  status: 'loading' | 'loaded' | 'error'
  error?: Error
}

export type FontLoadingCallback = (state: FontLoadingState) => void