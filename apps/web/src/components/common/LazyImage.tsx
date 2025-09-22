/**
 * Lazy Loading Image Component
 * T078 - Frontend Performance Optimization
 */

import { cn } from '@/lib/utils';
import { createIntersectionObserver } from '@/utils/performance';
import React, { useEffect, useRef, useState } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  fallback?: string;
  className?: string;
  containerClassName?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  sizes?: string;
  srcSet?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,alt,
  placeholder =
    'data:image/svg+xml;base64, PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PC9zdmc+', fallback = '/images/placeholder.svg',className, containerClassName, loading = 'lazy', priority = false,sizes, srcSet,onLoad, onError, ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority || loading === 'eager') {
      setIsInView(true);
      return;
    }

    const observer = createIntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer?.disconnect();
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      },
    );

    if (observer && containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer?.disconnect();
    };
  }, [priority, loading]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const imageSrc = hasError ? fallback : isInView ? src : placeholder;

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden bg-gray-100 dark:bg-gray-800',
        containerClassName,
      )}
    >
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          hasError && 'opacity-50',
          className,
        )}
        sizes={sizes}
        srcSet={isInView ? srcSet : undefined}
        onLoad={handleLoad}
        onError={handleError}
        loading={loading}
        decoding='async'
        {...props}
      />

      {!isLoaded && !hasError && (
        <div className='absolute inset-0 flex items-center justify-center'>
          <div className='animate-pulse bg-gray-200 dark:bg-gray-700 rounded w-8 h-8' />
        </div>
      )}

      {hasError && (
        <div className='absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-600'>
          <svg
            className='w-8 h-8'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
            />
          </svg>
        </div>
      )}
    </div>
  );
};

// Responsive image component with WebP support
interface ResponsiveImageProps extends LazyImageProps {
  webpSrc?: string;
  avifSrc?: string;
  breakpoints?: {
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,webpSrc, avifSrc,breakpoints, ...props
}) => {
  // Generate srcSet for different formats and sizes
  const generateSrcSet = (_baseSrc: any) => {
    if (!breakpoints) return undefined;

    return Object.entries(breakpoints)
      .map(([size, width]) => `${baseSrc}?w=${width} ${width}w`)
      .join(', ');
  };

  const generateSizes = () => {
    if (!breakpoints) return undefined;

    const sizeMap = {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    };

    return Object.entries(breakpoints)
      .map(([size, width]) => `(max-width: ${sizeMap[size as keyof typeof sizeMap]}) ${width}px`,
      )
      .join(', ');
  };

  if (webpSrc || avifSrc) {
    return (
      <picture>
        {avifSrc && (
          <source
            srcSet={generateSrcSet(avifSrc)}
            sizes={generateSizes()}
            type='image/avif'
          />
        )}
        {webpSrc && (
          <source
            srcSet={generateSrcSet(webpSrc)}
            sizes={generateSizes()}
            type='image/webp'
          />
        )}
        <LazyImage
          src={src}
          srcSet={generateSrcSet(src)}
          sizes={generateSizes()}
          {...props}
        />
      </picture>
    );
  }

  return (
    <LazyImage
      src={src}
      srcSet={generateSrcSet(src)}
      sizes={generateSizes()}
      {...props}
    />
  );
};

export default LazyImage;
