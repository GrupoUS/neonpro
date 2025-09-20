import { cn } from '@neonpro/ui';
import { Slot } from '@radix-ui/react-slot';
import * as React from 'react';

/**
 * MagicCard — unified Magic UI "Magic Card" + "Shine Border" behavior
 *
 * Matches https://magicui.design/docs/components/magic-card.md and
 * integrates the animated gradient border from Shine Border
 * https://magicui.design/docs/components/shine-border.md
 *
 * Props align with Magic UI docs:
 * - gradientSize (default 200)
 * - gradientColor (default '#262626')
 * - gradientOpacity (default 0.8)
 * - gradientFrom (default '#AC9469') - NeonPro golden color
 * - gradientTo (default '#D4AF37') - Complementary gold
 * - borderWidth (default 2)
 * - duration (default 3 — seconds, shine animation speed)
 * - radius (default 'var(--radius)')
 * - asChild (Radix Slot)
 */
export interface MagicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  /** Radius in px of the spotlight (mouse-follow) */
  gradientSize?: number; // default 200
  /** Spotlight color */
  gradientColor?: string; // default '#262626'
  /** Spotlight opacity 0..1 */
  gradientOpacity?: number; // default 0.8
  /** Shine border gradient start */
  gradientFrom?: string; // default '#AC9469'
  /** Shine border gradient end */
  gradientTo?: string; // default '#D4AF37'
  /** Border width in px */
  borderWidth?: number; // default 2
  /** Shine animation duration in seconds */
  duration?: number; // default 3
  /** Border radius */
  radius?: string; // default 'var(--radius)'
}

export const MagicCard = React.forwardRef<HTMLDivElement, MagicCardProps>(
  (
    {
      className,
      asChild,
      children,
      gradientSize = 200,
      gradientColor = '#262626',
      gradientOpacity = 0.8,
      gradientFrom = '#AC9469', // NeonPro golden color
      gradientTo = '#D4AF37', // Complementary gold
      borderWidth = 2,
      duration = 3,
      radius = 'var(--radius)',
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'div';
    const containerRef = React.useRef<HTMLDivElement | null>(null);

    React.useImperativeHandle(
      ref,
      () => containerRef.current as HTMLDivElement,
    );

    const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      el.style.setProperty('--magic-x', `${x}px`);
      el.style.setProperty('--magic-y', `${y}px`);
    };

    const onMouseLeave = () => {
      const el = containerRef.current;
      if (!el) return;
      el.style.removeProperty('--magic-x');
      el.style.removeProperty('--magic-y');
    };

    const cssVars: React.CSSProperties = {
      // Spotlight variables
      ['--magic-size' as any]: `${gradientSize}px`,
      ['--magic-color' as any]: gradientColor,
      ['--magic-opacity' as any]: gradientOpacity.toString(),
      // Border variables
      ['--magic-radius' as any]: radius,
      ['--magic-border-width' as any]: `${borderWidth}px`,
      ['--magic-gradient-from' as any]: gradientFrom,
      ['--magic-gradient-to' as any]: gradientTo,
      ['--magic-duration' as any]: `${duration}s`,
      // Safe defaults for SSR
      ['--magic-x' as any]: '50%',
      ['--magic-y' as any]: '50%',
    };

    return (
      <div
        ref={(node: any) => (containerRef.current = node)}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className={cn(
          'relative rounded-[var(--magic-radius)] overflow-hidden',
          // CSS containment to isolate animations
          'contain-layout contain-style',
          className,
        )}
        style={cssVars}
      >
        {/* Animated border layer - completely isolated */}
        <div
          className='absolute inset-0 rounded-[var(--magic-radius)] pointer-events-none'
          style={{
            zIndex: -2,
            contain: 'layout style paint',
            willChange: 'transform',
            transform: 'translateZ(0)', // Force hardware acceleration
          }}
        >
          <div
            className='w-full h-full rounded-[var(--magic-radius)]'
            style={{
              background:
                `conic-gradient(from 0deg, var(--magic-gradient-from), var(--magic-gradient-to), var(--magic-gradient-from))`,
              animation: `spin var(--magic-duration) linear infinite`,
              mask: `linear-gradient(#000 0 0) padding-box, linear-gradient(#000 0 0)`,
              maskComposite: 'exclude',
              WebkitMask: `linear-gradient(#000 0 0) padding-box, linear-gradient(#000 0 0)`,
              WebkitMaskComposite: 'xor',
              padding: `var(--magic-border-width)`,
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Spotlight layer that follows mouse */}
        <div
          className='absolute inset-0 rounded-[var(--magic-radius)] pointer-events-none opacity-0 transition-opacity duration-200 hover:opacity-100'
          style={{
            zIndex: -1,
            background:
              `radial-gradient(var(--magic-size) circle at var(--magic-x, 50%) var(--magic-y, 50%), var(--magic-color)/var(--magic-opacity), transparent 60%)`,
            contain: 'layout style paint',
          }}
        />

        {/* Content layer - completely isolated from animations */}
        <Comp
          className='relative bg-background rounded-[var(--magic-radius)]'
          style={{
            zIndex: 1,
            contain: 'layout style',
            transform: 'translateZ(0)', // Create new stacking context
            isolation: 'isolate', // Isolate from parent transforms
          }}
          {...props}
        >
          {children}
        </Comp>
      </div>
    );
  },
);

MagicCard.displayName = 'MagicCard';
