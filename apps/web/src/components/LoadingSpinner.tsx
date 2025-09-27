import { Loader2 } from 'lucide-react'

/**
 * Props for the LoadingSpinner component
 * @interface LoadingSpinnerProps
 */
interface LoadingSpinnerProps {
  /** Size variant of the spinner */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'mobile'
  /** Optional text to display alongside the spinner */
  text?: string
  /** Additional CSS classes for styling */
  className?: string
  /** Accessibility label for screen readers */
  ariaLabel?: string
  /** Healthcare context for proper styling */
  healthcareContext?: 'medical' | 'administrative' | 'emergency'
  /** Whether to reduce motion for accessibility */
  reduceMotion?: boolean
}

/**
 * LoadingSpinner Component
 * 
 * A configurable loading spinner component for displaying loading states
 * throughout the healthcare application. Supports multiple sizes and optional text.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <LoadingSpinner />
 * 
 * // With custom size and text
 * <LoadingSpinner size="lg" text="Carregando dados do paciente..." />
 * 
 * // With custom styling
 * <LoadingSpinner className="mt-4" text="Processando LGPD consent" />
 * ```
 * 
 * @param {LoadingSpinnerProps} props - Component props
 * @returns {JSX.Element} Rendered loading spinner component
 */
export function LoadingSpinner({
  size = 'md',
  text,
  className = '',
  ariaLabel,
  healthcareContext,
  reduceMotion = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',           // 16px - minimum touch target
    md: 'h-8 w-8',           // 32px - standard
    lg: 'h-12 w-12',         // 48px - large
    xl: 'h-16 w-16',         // 64px - extra large
    mobile: 'h-14 w-14',      // 56px - mobile optimized (WCAG 2.1 AA+)
  }

  // Healthcare context colors
  const contextColors = {
    medical: 'text-red-600',
    administrative: 'text-blue-600',
    emergency: 'text-orange-600 animate-pulse',
  }

  const colorClass = healthcareContext && contextColors[healthcareContext] 
    ? contextColors[healthcareContext] 
    : 'text-blue-600'
  const animationClass = reduceMotion ? '' : 'animate-spin'

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      role='status'
      aria-live='polite'
      aria-label={ariaLabel || text || 'Carregando'}
    >
      <Loader2
        className={`${animationClass} ${sizeClasses[size]} ${colorClass}`}
        aria-hidden='true'
      />
      {text && (
        <span className='ml-2 text-gray-600' aria-hidden='true'>
          {text}
        </span>
      )}
      {/* Screen reader only text if different from visual text */}
      {text && ariaLabel && text !== ariaLabel && (
        <span className='sr-only'>{ariaLabel}</span>
      )}
    </div>
  )
}

/**
 * Props for the LoadingPage component
 * @interface LoadingPageProps
 */
interface LoadingPageProps {
  /** Optional custom loading text (defaults to 'Carregando...') */
  text?: string
}

/**
 * LoadingPage Component
 * 
 * A full-page loading component that displays a centered loading spinner
 * with optional text. Used for full-page loading states in the healthcare application.
 * 
 * @example
 * ```tsx
 * // Default usage
 * <LoadingPage />
 * 
 * // With custom text
 * <LoadingPage text="Carregando sistema de saúde..." />
 * ```
 * 
 * @param {LoadingPageProps} props - Component props
 * @returns {JSX.Element} Rendered full-page loading component
 */
export function LoadingPage({ text = 'Carregando...' }: LoadingPageProps) {
  return (
    <div
      className='min-h-screen flex items-center justify-center bg-gray-50'
      role='main'
      aria-label='Página de carregamento'
    >
      <div className='text-center max-w-md mx-4'>
        <LoadingSpinner
          size='xl'
          text={text}
          ariaLabel='Sistema carregando'
          className='mb-4'
        />
        <p className='text-sm text-gray-500 mt-2'>
          Por favor, aguarde enquanto processamos sua solicitação
        </p>
      </div>
    </div>
  )
}

/**
 * Props for the LoadingCard component
 * @interface LoadingCardProps
 */
interface LoadingCardProps {
  /** Optional custom loading text (defaults to 'Carregando...') */
  text?: string
  /** Additional CSS classes for card styling */
  className?: string
}

/**
 * LoadingCard Component
 * 
 * A card-based loading component that displays a loading spinner within
 * a styled card container. Used for content-specific loading states in
 * the healthcare application interface.
 * 
 * @example
 * ```tsx
 * // Default usage
 * <LoadingCard />
 * 
 * // With custom text and styling
 * <LoadingCard text="Atualizando prontuário..." className="mt-4" />
 * ```
 * 
 * LGPD Compliance Note: This component does not handle sensitive patient data
 * and is safe to use in all healthcare contexts.
 * 
 * @param {LoadingCardProps} props - Component props
 * @returns {JSX.Element} Rendered loading card component
 */
export function LoadingCard({
  text = 'Carregando...',
  className = '',
}: LoadingCardProps) {
  return (
    <div
      className={`bg-white rounded-lg shadow p-6 ${className}`}
      role='status'
      aria-live='polite'
      aria-label='Carregando conteúdo'
    >
      <LoadingSpinner
        size='lg'
        text={text}
        ariaLabel='Carregando dados'
        healthcareContext='administrative'
      />
    </div>
  )
}
