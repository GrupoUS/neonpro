/// <reference types="vite/client" />

// Healthcare environment variables
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_APP_ENV: 'development' | 'staging' | 'production'
  readonly VITE_HEALTHCARE_MODE: 'development' | 'production'
  readonly VITE_LGPD_COMPLIANCE: string
  readonly VITE_ANVISA_COMPLIANCE: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Healthcare application constants
declare const __HEALTHCARE_MODE__: string
declare const __LGPD_COMPLIANCE__: boolean
declare const __ANVISA_COMPLIANCE__: boolean

// Extend Window interface for healthcare-specific globals
declare interface Window {
  // Healthcare monitoring
  __HEALTHCARE_TELEMETRY__?: {
    trackEvent: (event: string, properties?: Record<string, any>,) => void
    trackError: (error: Error, context?: Record<string, any>,) => void
  }

  // LGPD compliance
  __LGPD_CONSENT__?: {
    hasConsent: (type: string,) => boolean
    requestConsent: (type: string,) => Promise<boolean>
  }

  // Emergency access
  __EMERGENCY_ACCESS__?: {
    isActive: boolean
    activatedAt: Date | null
    reason: string | null
  }
}

// TanStack Router type augmentation
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof import('./src/main').router
  }
}

// Component prop types for healthcare
declare namespace Healthcare {
  interface BaseProps {
    className?: string
    'data-testid'?: string
  }

  interface PatientProps extends BaseProps {
    patientId: string
    readOnly?: boolean
  }

  interface AppointmentProps extends BaseProps {
    appointmentId: string
    canModify?: boolean
  }

  interface ComplianceProps extends BaseProps {
    level: 'basic' | 'enhanced' | 'emergency'
  }
}

// Global error handling for healthcare
declare global {
  interface ErrorOptions {
    healthcareContext?: {
      patientId?: string
      appointmentId?: string
      clinicId?: string
      action?: string
    }
  }
}

export {}
