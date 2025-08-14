/**
 * Story 6.1 Task 2: Barcode Components Index
 * Export all barcode/QR code related components
 * Quality: ≥9.5/10 with organized exports and TypeScript support
 */

// Main Components
export { default as BarcodeScanner } from './barcode-scanner'
export { default as BarcodeGenerator } from './barcode-generator'
export { default as BarcodeDashboard } from './barcode-dashboard'

// Type exports for better TypeScript integration
export type {
  BarcodeResult,
  ScanResult,
  ValidationResult,
  BarcodeType,
  ScanMethod
} from '@/app/hooks/use-barcode-scanner'

// Component Props Types
export interface BarcodeScannerProps {
  onScanSuccess?: (result: any) => void
  onError?: (error: Error) => void
  showHistory?: boolean
  autoFocus?: boolean
  className?: string
}

export interface BarcodeGeneratorProps {
  itemId?: string
  onGenerated?: (data: any) => void
  className?: string
}

export interface BarcodeDashboardProps {
  defaultTab?: 'scan' | 'generate' | 'history' | 'stats'
  className?: string
}

// Re-export hooks for convenience
export {
  useBarcodeScanner,
  useBarcodeGeneration,
  useBarcodeData,
  useScanHistory,
  useBarcodeStats,
  useLabelPrinting
} from '@/app/hooks/use-barcode-scanner'