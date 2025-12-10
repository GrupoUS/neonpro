// import { Slot } from '@radix-ui/react-slot'; // kept for compatibility, not used when cloning
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import React from 'react';
import { forwardRef } from 'react';
import {
  useAnimationPerformance,
  useHoverBorderGradient,
  useShineBorderAnimation,
} from '../../hooks';
import { cn } from '../../utils';
import './universal-button.css';
import '../../styles/hover-border-gradient.css';
import '../../styles/enhanced-shine-border.css';

// Base button variants matching shadcn/ui structure
const universalButtonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 relative overflow-hidden',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2 rounded-md',
        sm: 'h-9 px-3 py-2 text-xs rounded-md',
        lg: 'h-11 px-8 py-3 text-base rounded-md',
        icon: 'h-10 w-10 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

// Advanced animation props interface
interface AdvancedAnimationProps {
  // Hover Border Gradient Animation (AceternityUI style)
  hoverBorderGradient?: {
    enabled?: boolean;
    intensity?: 'subtle' | 'normal' | 'vibrant';
    direction?: 'left-right' | 'top-bottom' | 'diagonal-tl-br' | 'diagonal-tr-bl' | 'radial';
    theme?: 'gold' | 'silver' | 'copper' | 'blue' | 'purple' | 'green' | 'red';
    speed?: 'slow' | 'normal' | 'fast';
    borderWidth?: number;
    colors?: string[];
  };

  // Enhanced Shine Border Animation (MagicUI style)
  shineBorder?: {
    enabled?: boolean;
    pattern?: 'linear' | 'orbital' | 'pulse' | 'wave' | 'spiral';
    intensity?: 'subtle' | 'normal' | 'vibrant';
    theme?: 'gold' | 'silver' | 'copper' | 'blue' | 'purple' | 'green' | 'red';
    speed?: 'slow' | 'normal' | 'fast';
    borderWidth?: number;
    color?: string;
    duration?: number;
    autoStart?: boolean;
    hoverOnly?: boolean;
  };
}

export interface UniversalButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof universalButtonVariants>
{
  children: React.ReactNode;
  loading?: boolean;
  asChild?: boolean;

  // Legacy effect control props (backward compatibility)
  enableGradient?: boolean;
  enableNeumorph?: boolean;
  enableBorderGradient?: boolean;

  // Legacy customization props (backward compatibility)
  duration?: number;
  clockwise?: boolean;
  gradientColors?: { from?: string; via?: string; to?: string };

  // Advanced animation props
  animations?: AdvancedAnimationProps;
}

const UniversalButton = forwardRef<HTMLButtonElement, UniversalButtonProps>(
  (
    {
      className,
      variant,
      size,
      children,
      loading = false,
      asChild = false,

      // Legacy props (backward compatibility)
      enableGradient = false,
      enableNeumorph = false,
      enableBorderGradient = false,
      duration = 3000,
      clockwise = true,

      // Advanced animation props
      animations,

      // Legacy customization props should not reach DOM
      gradientColors: _gradientColors,

      disabled,
      onMouseEnter,
      onMouseLeave,
      onMouseMove,
      onClick,
      ...props
    },
    ref,
  ) => {
    // Performance optimization hook
    const { capabilities } = useAnimationPerformance();

    // Determine if animations should be enabled based on performance and user preferences
    const deviceCapability = capabilities.isLowEnd
      ? 'low'
      : capabilities.isMobile
      ? 'medium'
      : 'high';
    // We still apply classes even with reduced motion; CSS will disable animations via media query
    const shouldEnableAnimations = deviceCapability !== 'low';

    // Legacy border gradient support (backward compatibility)
    const legacyBorderGradientEnabled = enableBorderGradient;

    // Advanced hover border gradient animation
    const hoverBorderGradientConfig = animations?.hoverBorderGradient;
    const hoverBorderGradientEnabled = shouldEnableAnimations
      && (hoverBorderGradientConfig?.enabled || legacyBorderGradientEnabled);

    const {
      elementRef: hoverBorderRef,
      mousePosition,
      classNames: hoverBorderClasses,
      style: hoverBorderStyle,
      handlers: {
        onMouseEnter: handleHoverBorderMouseEnter,
        onMouseLeave: handleHoverBorderMouseLeave,
        onMouseMove: handleHoverBorderMouseMove,
      },
    } = useHoverBorderGradient({
      enabled: hoverBorderGradientEnabled,
      intensity: hoverBorderGradientConfig?.intensity || 'normal',
      direction: hoverBorderGradientConfig?.direction || 'radial',
      theme: hoverBorderGradientConfig?.theme || 'blue',
      speed: hoverBorderGradientConfig?.speed || 'normal',
      borderWidth: hoverBorderGradientConfig?.borderWidth || 2,
      colors: hoverBorderGradientConfig?.colors,
    });

    // Enhanced shine border animation
    const shineBorderConfig = animations?.shineBorder;
    const shineBorderEnabled = shouldEnableAnimations && shineBorderConfig?.enabled;

    const {
      elementRef: shineBorderRef,
      classNames: shineBorderClasses,
      start: startShine,
      stop: stopShine,
    } = useShineBorderAnimation({
      enabled: shineBorderEnabled,
      pattern: shineBorderConfig?.pattern || 'linear',
      intensity: shineBorderConfig?.intensity || 'normal',
      theme: shineBorderConfig?.theme || 'blue',
      speed: shineBorderConfig?.speed || 'normal',
      borderWidth: shineBorderConfig?.borderWidth || 2,
      color: shineBorderConfig?.color,
      duration: shineBorderConfig?.duration || 2000,
      autoStart: shineBorderConfig?.autoStart ?? true,
      hoverOnly: shineBorderConfig?.hoverOnly ?? false,
    });

    // Combine all CSS classes
    const buttonClasses = cn(
      universalButtonVariants({ variant, size, className }),
      {
        // Legacy gradient effects (backward compatibility)
        'bg-gradient-to-r animate-gradient-x from-blue-600 via-blue-500 to-cyan-500':
          enableGradient,
        // Variant-specific gradient overrides
        ...(enableGradient && variant === 'destructive'
          ? { 'from-red-600 via-rose-500 to-orange-500': true }
          : {}),
        'neumorph-hover universal-button-neumorph shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] bg-[#e0e5ec]':
          enableNeumorph,
        'border-2 border-transparent before:animate-spin': legacyBorderGradientEnabled,
        ...(legacyBorderGradientEnabled && duration !== undefined
          ? { '--animation-duration': `${duration}s` } as any
          : {}),
        ...(legacyBorderGradientEnabled && clockwise === false
          ? { 'before:animate-reverse-spin': true }
          : {}),
      },
      // Animation classes (strings)
      hoverBorderClasses,
      shineBorderClasses,
      className,
    );

    // Combined event handlers
    const handleMouseEnterCombined = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (hoverBorderGradientEnabled) {
        handleHoverBorderMouseEnter(e);
      }

      if (shineBorderEnabled && shineBorderConfig?.hoverOnly) {
        startShine();
      }

      onMouseEnter?.(e);
    };

    const handleMouseLeaveCombined = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (hoverBorderGradientEnabled) {
        handleHoverBorderMouseLeave(e);
      }

      if (shineBorderEnabled && shineBorderConfig?.hoverOnly) {
        stopShine();
      }

      onMouseLeave?.(e);
    };

    const handleMouseMoveCombined = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (hoverBorderGradientEnabled) {
        handleHoverBorderMouseMove(e);
      }

      onMouseMove?.(e);
    };

    // Apply ref to the appropriate element
    const combinedRef = (element: HTMLButtonElement | null) => {
      if (hoverBorderRef.current !== element) {
        hoverBorderRef.current = element as HTMLElement | null;
      }
      if (shineBorderRef.current !== element) {
        shineBorderRef.current = element as HTMLElement | null;
      }
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
    };

    // Style object for CSS custom properties
    const buttonStyle: any = {
      ...props.style,
      ...hoverBorderStyle,
      ...(hoverBorderGradientEnabled && mousePosition && {
        '--mouse-x': `${mousePosition.x}px`,
        '--mouse-y': `${mousePosition.y}px`,
      }),
      ...(legacyBorderGradientEnabled && duration !== undefined
        ? { ['--animation-duration' as any]: `${duration}s` }
        : {}),
    };

    // If asChild, we need to clone the only valid React element child and inject button props
    if (asChild) {
      const arr = React.Children.toArray(children).filter(Boolean);
      if (arr.length !== 1 || !React.isValidElement(arr[0])) {
        throw new Error(
          'UniversalButton with asChild requires a single valid React element as child',
        );
      }
      const child = arr[0] as React.ReactElement<any>;
      const mergedProps = {
        className: cn(child.props.className, buttonClasses),
        ref: combinedRef,
        disabled: disabled || loading,
        style: buttonStyle,
        onMouseEnter: (e: React.MouseEvent<any>) => {
          child.props?.onMouseEnter?.(e);
          handleMouseEnterCombined(e as any);
        },
        onMouseLeave: (e: React.MouseEvent<any>) => {
          child.props?.onMouseLeave?.(e);
          handleMouseLeaveCombined(e as any);
        },
        onMouseMove: (e: React.MouseEvent<any>) => {
          child.props?.onMouseMove?.(e);
          handleMouseMoveCombined(e as any);
        },
        onClick: (e: React.MouseEvent<any>) => {
          child.props?.onClick?.(e);
          onClick?.(e as any);
        },
        ...props,
      };
      return React.cloneElement(child, mergedProps);
    }

    // Default render path: regular button
    return (
      <button
        className={buttonClasses}
        ref={combinedRef as any}
        disabled={disabled || loading}
        style={buttonStyle}
        onMouseEnter={handleMouseEnterCombined}
        onMouseLeave={handleMouseLeaveCombined}
        onMouseMove={handleMouseMoveCombined}
        onClick={onClick}
        {...props}
      >
        {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
        {children}
      </button>
    );
  },
);

UniversalButton.displayName = 'UniversalButton';

export { UniversalButton, universalButtonVariants };
export type { AdvancedAnimationProps };
