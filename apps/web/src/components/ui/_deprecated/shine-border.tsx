import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

export interface ShineBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  radius?: string; // e.g. '1rem' | 'var(--radius)'
  borderWidth?: number; // px
  glow?: boolean; // add outer glow
  gradient?: string; // custom gradient stops
}

// Lightweight ShineBorder inspired by MagicUI's shine-border.
// Renders an animated conic-gradient border using masked pseudo-element.
export const ShineBorder = React.forwardRef<HTMLDivElement, ShineBorderProps>(
  (
    {
      className,
      asChild,
      radius = 'var(--radius)',
      borderWidth = 1,
      glow = true,
      gradient,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'div';

    const cssVars: React.CSSProperties = {
      ['--shine-radius' as any]: radius,
      ['--shine-border-width' as any]: `${borderWidth}px`,
      ['--shine-gradient' as any]:
        gradient ??
        'conic-gradient(from 0deg, hsl(var(--ring)/40%), transparent 10%, transparent 40%, hsl(var(--ring)/40%) 60%, transparent 90%, transparent 100%)',
    };

    return (
      <Comp
        ref={ref}
        className={cn(
          'relative isolate rounded-[var(--shine-radius)]',
          // Masked border layer
          "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-[var(--shine-radius)] before:p-[var(--shine-border-width)] before:[mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)] before:[mask-composite:exclude] before:bg-[image:var(--shine-gradient)] before:animate-[spin_3s_linear_infinite]",
          // Subtle outer glow
          glow && 'after:pointer-events-none after:absolute after:inset-0 after:-z-20 after:rounded-[var(--shine-radius)] after:blur-[6px] after:opacity-30 after:bg-[radial-gradient(120px_circle_at_20%_20%,hsl(var(--ring)/12%),transparent_60%)]',
          'dark:after:bg-[radial-gradient(120px_circle_at_20%_20%,hsl(var(--ring)/20%),transparent_60%)]',
          className,
        )}
        style={cssVars}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);

ShineBorder.displayName = 'ShineBorder';
