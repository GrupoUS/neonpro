import { cn } from '@/lib/utils';
import * as React from 'react';

interface ShineBorderProps {
  borderRadius?: number;
  borderWidth?: number;
  duration?: number;
  color?: string | string[];
  className?: string;
  children?: React.ReactNode;
}

const ShineBorder = React.forwardRef<HTMLDivElement, ShineBorderProps>(
  ({
    borderRadius = 8,
    borderWidth = 1,
    duration = 14,
    color = '#000000',
    className,
    children,
  }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          '--border-radius': `${borderRadius}px`,
        } as React.CSSProperties}
        className={cn(
          'relative grid min-h-[60px] w-fit min-w-[300px] place-items-center rounded-[--border-radius] bg-white p-3 text-black dark:bg-black dark:text-white',
          className,
        )}
      >
        <div
          style={{
            '--border-width': `${borderWidth}px`,
            '--border-radius': `${borderRadius}px`,
            '--duration': `${duration}s`,
            '--mask-linear-gradient':
              `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
            '--background-radial-gradient': `radial-gradient(transparent,transparent, ${
              color instanceof Array ? color.join(',') : color
            },transparent,transparent)`,
          } as React.CSSProperties}
          className={`before:bg-shine-size before:absolute before:inset-0 before:aspect-square before:h-full before:w-full before:rounded-[--border-radius] before:p-[--border-width] before:will-change-[background-position] before:content-[""] before:![-webkit-mask-composite:xor] before:![mask-composite:exclude] before:[background-image:--background-radial-gradient] before:[background-size:300%_300%] before:[mask:--mask-linear-gradient] before:animate-[shine_var(--duration)_infinite_linear]`}
        />
        {children}
      </div>
    );
  },
);
ShineBorder.displayName = 'ShineBorder';

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    // Backward compatibility with older API
    magic?: boolean;
    disableShine?: boolean;
    // New explicit flag (optional)
    enableShineBorder?: boolean;
    // Effect tuning
    shineDuration?: number;
    shineColor?: string | string[];
    borderWidth?: number;
  }
>(({
  className,
  magic = false,
  disableShine = false,
  enableShineBorder,
  shineDuration = 14,
  shineColor = 'hsl(var(--primary))',
  borderWidth = 1,
  children,
  ...props
}, ref) => {
  const shouldShowShine = enableShineBorder ?? (magic || !disableShine);
  if (shouldShowShine) {
    const duration = Math.max(0.1, shineDuration ?? 14);
    const colorValue = Array.isArray(shineColor)
      ? (shineColor[0] ?? '#AC9469')
      : (shineColor ?? '#AC9469');
    const borderPx = `${borderWidth ?? 1}px`;

    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-lg border bg-card text-card-foreground shadow-sm',
          className,
        )}
        {...props}
      >
        {/* Self-contained shine border effect */}
        <style>
          {`
          @keyframes np-travel-x { 0%{opacity:0;background-position:-150% 0}5%{opacity:1}25%{background-position:150% 0;opacity:1}30%{opacity:0}100%{opacity:0} }
          @keyframes np-travel-y { 0%{opacity:0;background-position:0 -150%}5%{opacity:1}25%{background-position:0 150%;opacity:1}30%{opacity:0}100%{opacity:0} }
        `}
        </style>

        {/* Animated border layers */}
        <div className='pointer-events-none absolute inset-0 rounded-lg' aria-hidden='true'>
          <span
            className='absolute top-0 left-0 w-full h-[2px] opacity-0'
            style={{
              height: borderPx,
              background:
                `linear-gradient(90deg, transparent 0%, ${colorValue} 50%, transparent 100%)`,
              backgroundSize: '200% 100%',
              animation: `np-travel-x ${duration}s linear infinite`,
              animationDelay: `0s`,
            }}
          />
          <span
            className='absolute top-0 right-0 w-[2px] h-full opacity-0'
            style={{
              width: borderPx,
              background:
                `linear-gradient(180deg, transparent 0%, ${colorValue} 50%, transparent 100%)`,
              backgroundSize: '100% 200%',
              animation: `np-travel-y ${duration}s linear infinite`,
              animationDelay: `${duration * 0.25}s`,
            }}
          />
          <span
            className='absolute bottom-0 right-0 w-full h-[2px] opacity-0'
            style={{
              height: borderPx,
              background:
                `linear-gradient(270deg, transparent 0%, ${colorValue} 50%, transparent 100%)`,
              backgroundSize: '200% 100%',
              animation: `np-travel-x ${duration}s linear infinite`,
              animationDelay: `${duration * 0.5}s`,
            }}
          />
          <span
            className='absolute bottom-0 left-0 w-[2px] h-full opacity-0'
            style={{
              width: borderPx,
              background:
                `linear-gradient(0deg, transparent 0%, ${colorValue} 50%, transparent 100%)`,
              backgroundSize: '100% 200%',
              animation: `np-travel-y ${duration}s linear infinite`,
              animationDelay: `${duration * 0.75}s`,
            }}
          />
        </div>

        {/* Content */}
        {children}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});
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
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'text-2xl font-semibold leading-none tracking-tight',
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
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

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
