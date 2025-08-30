'use client';

/**
 * Optimized Image Component for NeonPro
 * Production-ready image optimization with Next.js Image
 */

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
  fill?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoadingComplete?: () => void;
  style?: React.CSSProperties;
}

/**
 * Default blur data URL for placeholder
 * Low quality, minimal base64 image
 */
const DEFAULT_BLUR_DATA_URL = 
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==";

/**
 * Optimized Image Component
 * 
 * Features:
 * - Next.js Image optimization
 * - Automatic WebP/AVIF conversion
 * - Lazy loading with blur placeholder
 * - Responsive sizes
 * - Error handling with fallback
 * - Loading state management
 */
export function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height, 
  priority = false,
  className,
  fill = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  quality = 85,
  placeholder = "blur",
  blurDataURL = DEFAULT_BLUR_DATA_URL,
  onLoadingComplete,
  style,
  ...props
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleLoad = () => {
    setIsLoading(false);
    onLoadingComplete?.();
  };

  const handleError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  // Fallback image for errors
  if (imageError) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-gray-100 text-gray-400 text-sm",
          className
        )}
        style={{ width, height, ...style }}
      >
        <div className="text-center">
          <div className="text-2xl mb-1">📷</div>
          <div>Imagem não encontrada</div>
        </div>
      </div>
    );
  }

  const imageProps = {
    src,
    alt,
    quality,
    priority,
    placeholder,
    blurDataURL: placeholder === 'blur' ? blurDataURL : undefined,
    onLoad: handleLoad,
    onError: handleError,
    className: cn(
      "transition-opacity duration-300",
      isLoading ? "opacity-0" : "opacity-100",
      className
    ),
    style: {
      objectFit: 'cover' as const,
      ...style,
    },
    ...props,
  };

  if (fill) {
    return (
      <Image
        {...imageProps}
        fill
        sizes={sizes}
      />
    );
  }

  return (
    <Image
      {...imageProps}
      width={width}
      height={height}
      sizes={sizes}
    />
  );
}

/**
 * Avatar Image Component
 * Specialized for user avatars with circular styling
 */
export function AvatarImage({
  src,
  alt,
  size = 40,
  className,
  ...props
}: Omit<OptimizedImageProps, 'width' | 'height'> & { size?: number }) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn("rounded-full", className)}
      sizes="(max-width: 768px) 100px, 200px"
      {...props}
    />
  );
}

/**
 * Logo Image Component
 * Specialized for logos with optimized loading
 */
export function LogoImage({
  src,
  alt = "Logo",
  width = 120,
  height = 40,
  priority = true,
  className,
  ...props
}: Omit<OptimizedImageProps, 'placeholder'>) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      placeholder="empty"
      className={cn("object-contain", className)}
      {...props}
    />
  );
}

/**
 * Healthcare Image Component
 * Specialized for medical images with compliance features
 */
export function MedicalImage({
  src,
  alt,
  width,
  height,
  patientId,
  clinicId,
  className,
  ...props
}: OptimizedImageProps & {
  patientId?: string;
  clinicId?: string;
}) {
  // Add compliance tracking
  const handleLoad = () => {
    if (process.env.NODE_ENV === 'production' && patientId && clinicId) {
      // Log medical image access for LGPD compliance
      console.log('Medical image accessed:', {
        patientId,
        clinicId,
        timestamp: new Date().toISOString(),
        imageAlt: alt
      });
    }
    props.onLoadingComplete?.();
  };

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn("border border-gray-200 rounded", className)}
      onLoadingComplete={handleLoad}
      {...props}
    />
  );
}