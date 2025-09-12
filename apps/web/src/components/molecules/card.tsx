import * as React from 'react';
import { cn } from '@/lib/utils';
import { useHoverBorderGradient, useShineBorderAnimation, useAnimationPerformance } from '@neonpro/ui/hooks';
import '@neonpro/ui/styles/hover-border-gradient.css';
import '@neonpro/ui/styles/enhanced-shine-border.css';

// Advanced animation props interface (same as Button)
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

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  // Advanced animation props
  animations?: AdvancedAnimationProps;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, animations, onMouseEnter, onMouseLeave, onMouseMove, ...props }, ref) => {
    // Performance optimization hook
    const { isReducedMotion, deviceCapability } = useAnimationPerformance();
    
    // Determine if animations should be enabled based on performance and user preferences
    const shouldEnableAnimations = !isReducedMotion && deviceCapability !== 'low';
    
    // Advanced hover border gradient animation
    const hoverBorderGradientConfig = animations?.hoverBorderGradient;
    const hoverBorderGradientEnabled = shouldEnableAnimations && hoverBorderGradientConfig?.enabled;
    
    const {
      elementRef: hoverBorderRef,
      mousePosition,
      isHovered: isHoverBorderHovered,
      cssClasses: hoverBorderClasses,
      handleMouseEnter: handleHoverBorderMouseEnter,
      handleMouseLeave: handleHoverBorderMouseLeave,
      handleMouseMove: handleHoverBorderMouseMove,
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
      isAnimating,
      cssClasses: shineBorderClasses,
      start: startShine,
      stop: stopShine,
      restart: restartShine,
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
    const cardClasses = cn(
      'rounded-lg border bg-card text-card-foreground shadow-sm relative overflow-hidden',
      {
        // Animation classes
        ...hoverBorderClasses,
        ...shineBorderClasses,
      },
      className,
    );

    // Combined event handlers
    const handleMouseEnterCombined = (e: React.MouseEvent<HTMLDivElement>) => {
      if (hoverBorderGradientEnabled) {
        handleHoverBorderMouseEnter(e);
      }
      
      if (shineBorderEnabled && shineBorderConfig?.hoverOnly) {
        startShine();
      }
      
      onMouseEnter?.(e);
    };

    const handleMouseLeaveCombined = (e: React.MouseEvent<HTMLDivElement>) => {
      if (hoverBorderGradientEnabled) {
        handleHoverBorderMouseLeave(e);
      }
      
      if (shineBorderEnabled && shineBorderConfig?.hoverOnly) {
        stopShine();
      }
      
      onMouseLeave?.(e);
    };

    const handleMouseMoveCombined = (e: React.MouseEvent<HTMLDivElement>) => {
      if (hoverBorderGradientEnabled) {
        handleHoverBorderMouseMove(e);
      }
      
      onMouseMove?.(e);
    };

    // Apply ref to the appropriate element
    const combinedRef = (element: HTMLDivElement | null) => {
      if (hoverBorderRef.current !== element) {
        hoverBorderRef.current = element;
      }
      if (shineBorderRef.current !== element) {
        shineBorderRef.current = element;
      }
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
    };

    // Style object for CSS custom properties
    const cardStyle: React.CSSProperties = {
      ...props.style,
      ...(hoverBorderGradientEnabled && mousePosition && {
        '--mouse-x': `${mousePosition.x}px`,
        '--mouse-y': `${mousePosition.y}px`,
      }),
    };

    return (
      <div
        ref={combinedRef}
        className={cardClasses}
        style={cardStyle}
        onMouseEnter={handleMouseEnterCombined}
        onMouseLeave={handleMouseLeaveCombined}
        onMouseMove={handleMouseMoveCombined}
        {...props}
      />
    );
  }
);
Card.displayName = 'Card';
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-2xl font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
export type { AdvancedAnimationProps as CardAnimationProps };