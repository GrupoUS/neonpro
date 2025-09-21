'use client';

import { cn } from '@neonpro/ui';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { AnimatePresence, motion } from 'motion/react';
import * as React from 'react';
import { HoverBorderGradient } from './hover-border-gradient';

// Base button variants from shadcn/ui v4
const universalButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=\'size-\'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive relative overflow-hidden',
  {
    variants: {
      variant: {
        // Gradient variants (KokonutUI style) - NeonPro Colors
        'gradient-primary':
          'bg-gradient-to-r from-[#112031] to-[#294359] text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300',
        'gradient-secondary':
          'bg-gradient-to-r from-[#294359] to-[#B4AC9C] text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300',
        'gradient-gold':
          'bg-gradient-to-r from-[#AC9469] to-[#B4AC9C] text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300',
        'gradient-neon':
          'bg-gradient-to-r from-[#AC9469] to-[#294359] text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300',

        // Neumorph variants (Cult-UI style) - NeonPro Colors with smaller radius
        neumorph:
          'bg-[#D2D0C8] text-[#112031] rounded-lg shadow-[4px_4px_8px_#b8b6b0,-4px_-4px_8px_#ecebe6] hover:shadow-[inset_4px_4px_8px_#b8b6b0,inset_-4px_-4px_8px_#ecebe6] dark:bg-[#112031] dark:text-[#D2D0C8] dark:shadow-[4px_4px_8px_#0a0f15,-4px_-4px_8px_#18314d] transition-all duration-200',
        'neumorph-primary':
          'bg-[#B4AC9C] text-[#112031] rounded-lg shadow-[4px_4px_8px_#969085,-4px_-4px_8px_#d2c8b3] hover:shadow-[inset_4px_4px_8px_#969085,inset_-4px_-4px_8px_#d2c8b3] transition-all duration-200',
        'neumorph-gold':
          'bg-[#AC9469] text-white rounded-lg shadow-[4px_4px_8px_#8d7854,-4px_-4px_8px_#cbb07e] hover:shadow-[inset_4px_4px_8px_#8d7854,inset_-4px_-4px_8px_#cbb07e] transition-all duration-200',

        // Standard variants - NeonPro Colors
        default:
          'bg-[#112031] text-white shadow-xs hover:bg-[#294359] transition-colors duration-200',
        destructive: 'bg-destructive text-white shadow-xs hover:bg-destructive/90',
        outline:
          'border border-[#AC9469] bg-background text-[#112031] shadow-xs hover:bg-[#AC9469]/10 hover:text-[#112031] transition-colors duration-200',
        secondary:
          'bg-[#B4AC9C] text-[#112031] shadow-xs hover:bg-[#AC9469] hover:text-white transition-colors duration-200',
        ghost:
          'text-[#112031] hover:bg-[#D2D0C8] hover:text-[#112031] transition-colors duration-200',
        link:
          'text-[#AC9469] underline-offset-4 hover:underline hover:text-[#294359] transition-colors duration-200',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
      },
      effect: {
        none: '',
        hover: 'transition-all duration-300 hover:scale-105',
        pulse: 'animate-pulse',
        bounce: 'transition-transform hover:scale-105 active:scale-95',
        shine: '',
        border: '',
        neumorph: 'transition-all duration-200',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      effect: 'none',
    },
  },
);

export interface UniversalButtonProps
  extends React.ComponentProps<'button'>, VariantProps<typeof universalButtonVariants>
{
  asChild?: boolean;

  // Shine border animation (MagicUI style)
  enableShineBorder?: boolean;
  shineBorderWidth?: number;
  shineDuration?: number;
  shineColor?: string | string[];

  // Hover border gradient (Aceternity style)
  enableHoverBorder?: boolean;
  hoverBorderDuration?: number;
  hoverClockwise?: boolean;

  // Loading state
  loading?: boolean;
  loadingText?: string;

  // Custom gradient colors (KokonutUI style)
  gradientFrom?: string;
  gradientTo?: string;

  // Neumorph intensity
  neumorphIntensity?: 'light' | 'medium' | 'strong';
}

function UniversalButton({
  className,
  variant,
  size,
  effect,
  asChild = false,

  // Shine border props
  enableShineBorder = false,
  shineBorderWidth = 1,
  shineDuration = 6,
  shineColor = '#AC9469',

  // Hover border props
  enableHoverBorder = false,
  hoverBorderDuration = 2,
  hoverClockwise = true,

  // Loading props
  loading = false,
  loadingText = 'Loading...',

  // Gradient props
  gradientFrom,
  gradientTo,

  // Neumorph props
  neumorphIntensity = 'medium',

  style,
  disabled,
  children,
  ...props
}: UniversalButtonProps) {
  const Comp = asChild ? Slot : 'button';
  const [isPressed, setIsPressed] = React.useState(false);

  // Custom gradient style
  const customGradientStyle = gradientFrom && gradientTo
    ? {
      background: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})`,
    }
    : {};

  // Neumorph shadow intensity - Adjusted for smaller radius
  const neumorphShadows = {
    light:
      'shadow-[2px_2px_4px_#b8b6b0,-2px_-2px_4px_#ecebe6] hover:shadow-[inset_2px_2px_4px_#b8b6b0,inset_-2px_-2px_4px_#ecebe6] dark:shadow-[2px_2px_4px_#0a0f15,-2px_-2px_4px_#18314d]',
    medium:
      'shadow-[4px_4px_8px_#b8b6b0,-4px_-4px_8px_#ecebe6] hover:shadow-[inset_4px_4px_8px_#b8b6b0,inset_-4px_-4px_8px_#ecebe6] dark:shadow-[4px_4px_8px_#0a0f15,-4px_-4px_8px_#18314d]',
    strong:
      'shadow-[6px_6px_12px_#b8b6b0,-6px_-6px_12px_#ecebe6] hover:shadow-[inset_6px_6px_12px_#b8b6b0,inset_-6px_-6px_12px_#ecebe6] dark:shadow-[6px_6px_12px_#0a0f15,-6px_-6px_12px_#18314d]',
  };

  const combinedClassName = cn(
    universalButtonVariants({ variant, size, effect }),
    variant?.includes('neumorph') && neumorphShadows[neumorphIntensity],
    enableShineBorder && 'relative overflow-hidden',
    enableHoverBorder && 'relative',
    // Add animation classes for gradient hover effects
    gradientFrom
      && gradientTo
      && 'transform hover:scale-[1.02] transition-all duration-300',
    className,
  );

  const combinedStyle = {
    ...customGradientStyle,
    ...(enableHoverBorder && {
      '--border-duration': `${hoverBorderDuration}s`,
      '--border-direction': hoverClockwise ? 'normal' : 'reverse',
    }),
    ...style,
  };

  const isDisabled = disabled || loading;

  // If hover border gradient is enabled, wrap with HoverBorderGradient
  if (enableHoverBorder && !isDisabled) {
    return (
      <HoverBorderGradient
        as={asChild ? Slot : 'button'}
        duration={hoverBorderDuration}
        clockwise={hoverClockwise}
        containerClassName={combinedClassName}
        className='bg-transparent text-inherit px-0 py-0'
        {...props}
      >
        {/* Shine Border Effect (MagicUI style) */}
        {enableShineBorder && (
          <div
            className='pointer-events-none absolute inset-0 size-full rounded-[inherit] will-change-transform motion-safe:animate-shine-rotate'
            style={{
              backgroundImage: `conic-gradient(
                from 0deg,
                transparent 0deg,
                ${Array.isArray(shineColor) ? shineColor[0] : shineColor} 90deg,
                transparent 180deg,
                transparent 270deg,
                ${Array.isArray(shineColor) ? shineColor[0] : shineColor} 360deg
              )`,
              mask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
              WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              padding: `${shineBorderWidth}px`,
              animationDuration: `${shineDuration}s`,
            }}
          />
        )}

        {/* Button Content */}
        <div className='relative z-10 flex items-center gap-2'>
          {loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className='size-4 animate-spin rounded-full border-2 border-current border-t-transparent'
            />
          )}

          <AnimatePresence mode='wait'>
            {loading
              ? (
                <motion.span
                  key='loading'
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {loadingText}
                </motion.span>
              )
              : (
                <motion.span
                  key='content'
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {children}
                </motion.span>
              )}
          </AnimatePresence>
        </div>

        {/* Neumorph Press Effect */}
        {variant?.includes('neumorph') && isPressed && (
          <div className='absolute inset-0 rounded-[inherit] bg-black/5 dark:bg-white/5' />
        )}
      </HoverBorderGradient>
    );
  }

  return (_<Comp
      data-slot='universal-button'
      className={combinedClassName}
      style={combinedStyle}
      disabled={isDisabled}
      onMouseEnter={() => setIsPressed(true)}
      onMouseLeave={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      {...props}
    >
      {/* Shine Border Effect (MagicUI style) */}
      {enableShineBorder && !isDisabled && (
        <div
          className='pointer-events-none absolute inset-0 size-full rounded-[inherit] will-change-transform motion-safe:animate-shine-rotate'
          style={{
            backgroundImage: `conic-gradient(
              from 0deg,
              transparent 0deg,
              ${Array.isArray(shineColor) ? shineColor[0] : shineColor} 90deg,
              transparent 180deg,
              transparent 270deg,
              ${Array.isArray(shineColor) ? shineColor[0] : shineColor} 360deg
            )`,
            mask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
            WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            padding: `${shineBorderWidth}px`,
            animationDuration: `${shineDuration}s`,
          }}
        />
      )}

      {/* Hover Border Gradient Effect - Now handled by HoverBorderGradient component */}

      {/* Button Content */}
      <div className='relative z-10 flex items-center gap-2'>
        {loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className='size-4 animate-spin rounded-full border-2 border-current border-t-transparent'
          />
        )}

        <AnimatePresence mode='wait'>
          {loading
            ? (
              <motion.span
                key='loading'
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {loadingText}
              </motion.span>
            )
            : (
              <motion.span
                key='content'
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {children}
              </motion.span>
            )}
        </AnimatePresence>
      </div>

      {/* Neumorph Press Effect */}
      {variant?.includes('neumorph') && isPressed && (
        <div className='absolute inset-0 rounded-[inherit] bg-black/5 dark:bg-white/5' />
      )}
    </Comp>
  );
}

export { UniversalButton as AdvancedButton, universalButtonVariants as advancedButtonVariants };
