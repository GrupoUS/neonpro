import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

export interface MagicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  intensity?: number; // 0-1 for hover highlight
}

// Pointer-reactive subtle highlight card wrapper.
// Uses CSS variables updated on mouse move to create a radial gradient that follows the pointer.
export const MagicCard = React.forwardRef<HTMLDivElement, MagicCardProps>(
  ({ className, asChild, intensity = 0.15, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div';
    const containerRef = React.useRef<HTMLDivElement | null>(null);

    React.useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

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

    return (
      <Comp
        ref={(node: any) => (containerRef.current = node)}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className={cn(
          // Base: inherits rounding and clipping from child when used with asChild
          'relative isolate rounded-[inherit]',
          // Subtle interactive highlight surface
          "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:opacity-0 before:transition-opacity before:duration-200 hover:before:opacity-100",
          // Radial gradient follows pointer using CSS vars; fallbacks ensure SSR safety
          "before:bg-[radial-gradient(300px_circle_at_var(--magic-x,50%)_var(--magic-y,50%),hsl(var(--ring)/20%),transparent_60%)] dark:before:bg-[radial-gradient(300px_circle_at_var(--magic-x,50%)_var(--magic-y,50%),hsl(var(--ring)/25%),transparent_60%)]",
          className,
        )}
        style={{
          // Provide a tiny default so SSR doesn't render NaN positions
          ['--magic-x' as any]: '50%',
          ['--magic-y' as any]: '50%',
          ['--magic-intensity' as any]: intensity,
        }}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);

MagicCard.displayName = 'MagicCard';
