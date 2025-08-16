'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils';

const spinnerVariants = cva(
  'animate-spin rounded-full border-solid border-current border-r-transparent',
  {
    variants: {
      size: {
        sm: 'h-4 w-4 border-2',
        md: 'h-6 w-6 border-2',
        lg: 'h-8 w-8 border-[3px]',
        xl: 'h-12 w-12 border-4',
      },
      variant: {
        default: 'text-primary',
        secondary: 'text-secondary',
        muted: 'text-muted-foreground',
        destructive: 'text-destructive',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  },
);

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  label?: string;
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size, variant, label, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-center', className)}
        {...props}
      >
        <div
          className={cn(spinnerVariants({ size, variant }))}
          role="status"
          aria-label={label || 'Loading'}
        >
          <span className="sr-only">{label || 'Loading...'}</span>
        </div>
      </div>
    );
  },
);
LoadingSpinner.displayName = 'LoadingSpinner';

export { LoadingSpinner, spinnerVariants };
