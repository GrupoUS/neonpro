'use client'

import { cn, } from '@/lib/utils'
import Image from 'next/image'
import { useCallback, useState, } from 'react'

// Base props shared by both fill and sized variants
interface BaseOptimizedImageProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
  quality?: number
  sizes?: string
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoadingComplete?: () => void
  onError?: () => void
  // Healthcare-specific props
  medicalImageType?: 'patient-photo' | 'chart' | 'xray' | 'scan' | 'document' | 'general'
  loadingStrategy?: 'eager' | 'lazy' | 'auto'
  fallbackSrc?: string
  showSkeleton?: boolean
}

// Discriminated union to prevent width/height with fill=true
type OptimizedImageProps =
  & BaseOptimizedImageProps
  & (
    | {
      fill: true
      width?: never
      height?: never
    }
    | {
      fill?: false
      width?: number
      height?: number
    }
  )

// Healthcare image configurations
const HealthcareImageConfig = {
  'patient-photo': {
    quality: 85,
    sizes: '(max-width: 768px) 150px, (max-width: 1200px) 200px, 250px',
    placeholder: 'blur' as const,
  },
  'chart': {
    quality: 95,
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px',
    placeholder: 'empty' as const,
  },
  'xray': {
    quality: 100,
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1400px',
    placeholder: 'empty' as const,
  },
  'scan': {
    quality: 100,
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1400px',
    placeholder: 'empty' as const,
  },
  'document': {
    quality: 90,
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 800px',
    placeholder: 'empty' as const,
  },
  'general': {
    quality: 80,
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px',
    placeholder: 'blur' as const,
  },
} as const

// Generate blur placeholder for better LCP
function generateBlurPlaceholder(width: number, height: number,): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e5e7eb;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
    </svg>
  `

  // Browser-safe base64 encoding with Unicode support
  const base64 = typeof window !== 'undefined'
    ? window.btoa(unescape(encodeURIComponent(svg,),),)
    : ''
  return `data:image/svg+xml;base64,${base64}`
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality,
  sizes,
  fill = false,
  placeholder,
  blurDataURL,
  onLoadingComplete,
  onError,
  medicalImageType = 'general',
  loadingStrategy = 'auto',
  fallbackSrc,
  showSkeleton = true,
  ...props
}: OptimizedImageProps,) {
  const [imageError, setImageError,] = useState(false,)
  const [isLoading, setIsLoading,] = useState(true,)

  // Get healthcare-specific config
  const config = HealthcareImageConfig[medicalImageType]

  // Determine if image should be loaded eagerly
  const shouldLoadEager = useCallback(() => {
    if (loadingStrategy === 'eager') return true
    if (loadingStrategy === 'lazy') return false

    // Auto strategy: load eagerly for critical medical images
    return medicalImageType === 'xray' || medicalImageType === 'scan' || priority
  }, [loadingStrategy, medicalImageType, priority,],)

  // Handle image load completion
  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false,)
    onLoadingComplete?.()
  }, [onLoadingComplete,],)

  // Handle image error
  const handleError = useCallback(() => {
    setImageError(true,)
    setIsLoading(false,)
    onError?.()
  }, [onError,],)

  // Generate blur placeholder if not provided
  const finalBlurDataURL = blurDataURL
    || (placeholder === 'blur' && width && height
      ? generateBlurPlaceholder(width, height,)
      : undefined)

  // Use fallback image if error occurred
  const finalSrc = imageError && fallbackSrc ? fallbackSrc : src

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div
      className={cn(
        'animate-pulse bg-gradient-to-br from-gray-200 to-gray-300 rounded',
        className,
      )}
      style={{ width, height, }}
    />
  )

  // Error fallback
  if (imageError && !fallbackSrc) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gray-100 text-gray-400 rounded border-2 border-dashed border-gray-300',
          className,
        )}
        style={{ width, height, }}
      >
        <div className="text-center p-4">
          <svg
            className="w-8 h-8 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm">Imagem não disponível</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('relative', className,)}>
      {/* Loading skeleton */}
      {isLoading && showSkeleton && <LoadingSkeleton />}

      {/* Optimized Image */}
      <Image
        src={finalSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority || shouldLoadEager()}
        quality={quality || config.quality}
        sizes={sizes || config.sizes}
        placeholder={placeholder || config.placeholder}
        blurDataURL={finalBlurDataURL}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          imageError && fallbackSrc ? 'opacity-75' : '',
          className,
        )}
        onLoad={handleLoadingComplete}
        onError={handleError}
        // Performance optimizations
        loading={shouldLoadEager() ? 'eager' : 'lazy'}
        decoding="async"
        {...props}
      />

      {/* Medical image overlay indicators */}
      {(medicalImageType === 'xray' || medicalImageType === 'scan') && (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
          Imagem Médica
        </div>
      )}
    </div>
  )
}

// Specialized components for healthcare
export function PatientPhoto(props: Omit<OptimizedImageProps, 'medicalImageType'>,) {
  return (
    <OptimizedImage
      {...(props as any)}
      medicalImageType="patient-photo"
      className={cn('rounded-full', props.className,)}
    />
  )
}

export function MedicalChart(props: Omit<OptimizedImageProps, 'medicalImageType'>,) {
  return (
    <OptimizedImage
      {...(props as any)}
      medicalImageType="chart"
      priority
      className={cn('rounded-lg shadow-sm', props.className,)}
    />
  )
}

export function XRayImage(props: Omit<OptimizedImageProps, 'medicalImageType'>,) {
  return (
    <OptimizedImage
      {...(props as any)}
      medicalImageType="xray"
      priority
      quality={100}
      className={cn('rounded-lg border', props.className,)}
    />
  )
}

export function ScanImage(props: Omit<OptimizedImageProps, 'medicalImageType'>,) {
  return (
    <OptimizedImage
      {...(props as any)}
      medicalImageType="scan"
      priority
      quality={100}
      className={cn('rounded-lg border', props.className,)}
    />
  )
}

export function DocumentImage(props: Omit<OptimizedImageProps, 'medicalImageType'>,) {
  return (
    <OptimizedImage
      {...(props as any)}
      medicalImageType="document"
      className={cn('rounded border shadow-sm', props.className,)}
    />
  )
}
