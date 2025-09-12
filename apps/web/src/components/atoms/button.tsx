'use client';

import { cn } from '@/lib/utils';
import {
  type AdvancedAnimationProps,
  UniversalButton,
  type UniversalButtonProps,
  universalButtonVariants,
} from '@neonpro/ui';

// Complete Button interface that extends UniversalButton with backward compatibility
/**
 * @deprecated This Button wrapper is deprecated. Use Button from @neonpro/ui directly instead.
 * This wrapper will be removed in a future version.
 *
 * Migration:
 * - Replace: import { Button } from '@/components/atoms/button';
 * - With: import { Button } from '@neonpro/ui';
 */
export interface ButtonProps extends UniversalButtonProps {
  // Backward compatibility props (keeping all the old props)
  enableHoverBorder?: boolean;
  borderAnimation?: 'hover' | 'always' | 'none';
  borderDuration?: number;
  clockwise?: boolean;

  // Direct UniversalButton hover border props support
  hoverBorderDuration?: number;
  hoverClockwise?: boolean;

  // Additional legacy props for backward compatibility
  effect?: string;
  loadingText?: string;
  gradientFrom?: string;
  gradientTo?: string;
  enableShineBorder?: boolean;
  shineBorderWidth?: number;
  shineDuration?: number;
  shineColor?: string;
  neumorphIntensity?: number;
}

function Button({
  // Map old props to new UniversalButton props
  enableHoverBorder,
  borderAnimation,
  borderDuration = 2,
  clockwise = true,

  // Pass through all other props
  className,
  variant = 'default',
  size = 'default',
  effect = 'hover',
  children,
  disabled,
  loading,
  loadingText,
  // Gradient props from UniversalButton
  gradientFrom,
  gradientTo,
  // Shine border props from UniversalButton
  enableShineBorder,
  shineBorderWidth,
  shineDuration,
  shineColor,
  // Hover border props from UniversalButton
  hoverBorderDuration,
  hoverClockwise,
  ...props
}: ButtonProps) {
  // Runtime deprecation warning (development only)
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      '⚠️ DEPRECATED: Button from @/components/atoms/button is deprecated. '
        + 'Use Button from @neonpro/ui directly instead. '
        + 'This wrapper will be removed in a future version.',
    );
  }

  // Map legacy props to UniversalButton props
  const shouldEnableHoverBorder = enableHoverBorder || borderAnimation === 'hover';

  // Use direct hover border props if provided, otherwise fall back to legacy props
  const finalHoverBorderDuration = hoverBorderDuration ?? borderDuration;
  const finalHoverClockwise = hoverClockwise ?? clockwise;

  // Convert speed from duration (in seconds) to speed category
  const getSpeedFromDuration = (duration: number): 'slow' | 'normal' | 'fast' => {
    if (duration > 3) return 'slow';
    if (duration < 1.5) return 'fast';
    return 'normal';
  };

  // Build animations config for UniversalButton
  const animationsConfig: AdvancedAnimationProps = {
    hoverBorderGradient: shouldEnableHoverBorder
      ? {
        enabled: true,
        intensity: 'normal' as const,
        direction: finalHoverClockwise ? 'radial' as const : 'left-right' as const,
        theme: 'blue' as const,
        speed: getSpeedFromDuration(finalHoverBorderDuration),
        borderWidth: 2,
      }
      : undefined,
    shineBorder: enableShineBorder
      ? {
        enabled: true,
        pattern: 'linear' as const,
        intensity: 'normal' as const,
        theme: 'blue' as const,
        speed: 'normal' as const,
        borderWidth: shineBorderWidth || 2,
        color: shineColor,
        duration: shineDuration || 2000,
        autoStart: true,
        hoverOnly: false,
      }
      : undefined,
  };

  return (
    <UniversalButton
      variant={variant}
      size={size}
      disabled={disabled}
      loading={loading}
      // Use the animations config object
      animations={animationsConfig}
      className={cn('', className)}
      {...props}
    >
      {children}
    </UniversalButton>
  );
}

// Re-export the button variants from UniversalButton
export { universalButtonVariants as buttonVariants };

export { Button };
