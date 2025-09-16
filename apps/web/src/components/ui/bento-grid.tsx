'use client';

import { cn } from '@neonpro/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@neonpro/ui';
import { motion, useReducedMotion } from 'framer-motion';
import React from 'react';

// Enhanced interfaces for Kokonut UI integration
interface BentoGridProps {
  className?: string;
  children: React.ReactNode;
  /** Enable feature flag for Kokonut UI rendering */
  useKokonutUI?: boolean;
  /** Density variant for spacing control */
  density?: 'comfortable' | 'compact';
}

interface BentoGridItemProps {
  className?: string;
  title?: string;
  description?: string;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Enable Kokonut UI enhanced animations */
  enhanced?: boolean;
  /** Motion control */
  motion?: 'on' | 'off' | 'reduced';
  /** Elevation level */
  elevation?: 'none' | 'sm' | 'md';
  /** Content emphasis */
  emphasis?: 'subtle' | 'default' | 'brand';
  /** Custom content for Kokonut UI patterns */
  kokonutContent?: React.ReactNode;
}

// Feature flag for Kokonut UI (default enabled for gradual migration)
const NEONPRO_FEATURE_BENTO_KOKONUT =
  ((import.meta as any).env?.VITE_NEONPRO_FEATURE_BENTO_KOKONUT ?? 'true') !== 'false';

/**
 * Enhanced NeonPro Bento Grid Container with Kokonut UI integration
 * Responsive grid layout with advanced animations and accessibility features
 */
export function BentoGrid({
  className,
  children,
  useKokonutUI = NEONPRO_FEATURE_BENTO_KOKONUT,
  density = 'comfortable',
}: BentoGridProps) {
  const shouldReduceMotion = useReducedMotion();

  const densityStyles = {
    comfortable: 'gap-6',
    compact: 'gap-4',
  };

  const gridAnimation = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.1,
        delayChildren: shouldReduceMotion ? 0 : 0.05,
      },
    },
  };

  if (useKokonutUI && !shouldReduceMotion) {
    return (
      <motion.div
        className={cn(
          'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-7xl mx-auto',
          densityStyles[density],
          // Motion-safe animations
          'motion-reduce:transition-none',
          className,
        )}
        variants={gridAnimation}
        initial='initial'
        animate='animate'
        role='grid'
        aria-label='NeonPro feature showcase grid'
      >
        {children}
      </motion.div>
    );
  }

  // Fallback to standard implementation
  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-7xl mx-auto',
        densityStyles[density],
        className,
      )}
      role='grid'
      aria-label='NeonPro feature showcase grid'
    >
      {children}
    </div>
  );
}

/**
 * Enhanced NeonPro Bento Grid Item with Kokonut UI integration
 * Individual card with advanced animations, accessibility, and NeonPro branding
 */
export function BentoGridItem({
  className,
  title,
  description,
  header,
  icon,
  children,
  variant = 'default',
  size = 'md',
  enhanced = NEONPRO_FEATURE_BENTO_KOKONUT,
  motion: motionProp = 'on',
  elevation = 'sm',
  emphasis = 'default',
  kokonutContent,
}: BentoGridItemProps) {
  const shouldReduceMotion = useReducedMotion();
  const enableMotion = motionProp !== 'off' && !shouldReduceMotion;
  const variantStyles = {
    default: 'bg-card hover:bg-card/80 border-border',
    primary:
      'bg-gradient-to-br from-[#112031] to-[#294359] text-white border-[#294359]/20 hover:from-[#294359] hover:to-[#112031]',
    secondary:
      'bg-gradient-to-br from-[#AC9469] to-[#B4AC9C] text-white border-[#AC9469]/20 hover:from-[#B4AC9C] hover:to-[#AC9469]',
    accent:
      'bg-gradient-to-br from-[#294359] to-[#AC9469] text-white border-[#AC9469]/20 hover:from-[#AC9469] hover:to-[#294359]',
  } as const;

  const sizeStyles = {
    sm: 'col-span-1 row-span-1 min-h-[200px]',
    md: 'col-span-1 md:col-span-2 row-span-1 min-h-[250px]',
    lg: 'col-span-1 md:col-span-2 lg:col-span-3 row-span-1 min-h-[300px]',
    xl: 'col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 row-span-2 min-h-[400px]',
  } as const;

  const elevationStyles = {
    none: '',
    sm: 'hover:shadow-lg hover:shadow-black/10',
    md: 'hover:shadow-xl hover:shadow-black/20',
  } as const;

  const emphasisStyles = {
    subtle: '',
    default: '',
    brand: 'ring-1 ring-[#AC9469]/30',
  } as const;

  const MotionWrapper = enableMotion && enhanced ? motion.div : 'div';
  const cardProps = enableMotion && enhanced
    ? { whileHover: { y: -2 }, transition: { type: 'spring', stiffness: 300, damping: 25 } }
    : {};

  return (
    <MotionWrapper {...(cardProps as any)}>
      <Card
        className={cn(
          // Base styles
          'group relative overflow-hidden cursor-pointer',
          'transition-all duration-300 ease-in-out',
          elevationStyles[elevation],
          emphasisStyles[emphasis],
          'focus-within:ring-2 focus-within:ring-[#AC9469]/50 focus-within:ring-offset-2',
          // Variant styles
          variantStyles[variant],
          // Size styles
          sizeStyles[size],
          className,
        )}
        tabIndex={0}
        role='article'
        aria-label={title ? `${title} card` : 'Bento grid item'}
      >
        {/* Header/Image Section */}
        {header && (
          <div className='relative overflow-hidden rounded-t-xl'>
            <div className='transition-transform duration-300 group-hover:scale-105'>
              {header}
            </div>
            {/* Gradient overlay for better text readability */}
            <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
          </div>
        )}

        {/* Content Section */}
        <CardHeader className='relative z-10'>
          <div className='flex items-start gap-3'>
            {/* Icon */}
            {icon && (
              <div className='flex-shrink-0 p-2 rounded-lg bg-white/10 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110'>
                {icon}
              </div>
            )}

            {/* Title and Description */}
            <div className='flex-1 min-w-0'>
              {title && (
                <CardTitle
                  className={cn(
                    'text-lg font-semibold leading-tight mb-2',
                    'transition-colors duration-300',
                    variant === 'default'
                      ? 'text-foreground group-hover:text-[#294359]'
                      : 'text-white',
                  )}
                >
                  {title}
                </CardTitle>
              )}

              {description && (
                <CardDescription
                  className={cn(
                    'text-sm leading-relaxed',
                    'transition-colors duration-300',
                    variant === 'default' ? 'text-muted-foreground' : 'text-white/80',
                  )}
                >
                  {description}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Custom Content */}
        {children && (
          <CardContent className='relative z-10 flex-1'>
            {children}
          </CardContent>
        )}

        {/* Kokonut UI enhanced content */}
        {kokonutContent && enhanced && (
          <CardContent className='relative z-10 flex-1'>
            {kokonutContent}
          </CardContent>
        )}

        {/* Enhanced animated border effect */}
        <div className='absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
          <div className='absolute inset-0 rounded-xl bg-gradient-to-r from-[#294359] via-[#AC9469] to-[#294359] p-[1px]'>
            <div className='w-full h-full rounded-xl bg-card' />
          </div>
        </div>

        {/* Enhanced glow effect */}
        <div className='absolute -inset-1 rounded-xl bg-gradient-to-r from-[#294359]/20 via-[#AC9469]/20 to-[#294359]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10' />
      </Card>
    </MotionWrapper>
  );
}

/**
 * Pre-configured Bento Grid layouts for common use cases
 */
export const BentoGridLayouts = {
  // Dashboard layout: 1 large + 3 medium cards
  dashboard: (
    <>
      <BentoGridItem size='lg' variant='primary' className='lg:col-span-2 lg:row-span-2' />
      <BentoGridItem size='md' variant='secondary' />
      <BentoGridItem size='md' variant='accent' />
      <BentoGridItem size='md' variant='default' />
    </>
  ),

  // Features layout: 4 equal cards
  features: (
    <>
      <BentoGridItem size='sm' variant='default' />
      <BentoGridItem size='sm' variant='primary' />
      <BentoGridItem size='sm' variant='secondary' />
      <BentoGridItem size='sm' variant='accent' />
    </>
  ),

  // Hero layout: 1 extra large + 2 small cards
  hero: (
    <>
      <BentoGridItem size='xl' variant='primary' />
      <BentoGridItem size='sm' variant='secondary' />
      <BentoGridItem size='sm' variant='accent' />
    </>
  ),
};

/**
 * Accessibility and performance optimized Bento Grid
 * Includes proper ARIA labels, keyboard navigation, and reduced motion support
 */
export function AccessibleBentoGrid({ className, children, ...props }: BentoGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-7xl mx-auto',
        // Reduced motion support
        'motion-reduce:transition-none motion-reduce:hover:scale-100',
        className,
      )}
      role='grid'
      aria-label='Feature showcase grid'
      {...props}
    >
      {children}
    </div>
  );
}
