import * as React from 'react';

import { cn } from '@neonpro/ui/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    // Enhanced accessibility for healthcare applications
    const accessibilityProps = {
      'aria-label': props['aria-label'] || props.placeholder,
      'aria-describedby': props['aria-describedby'],
      'aria-required': props.required ? 'true' : undefined,
      'aria-invalid': props['aria-invalid'] || (props.required && !props.value ? 'true' : undefined),
    };

    // Remove undefined props to avoid HTML validation warnings
    const cleanProps = Object.fromEntries(
      Object.entries(accessibilityProps).filter(([_, value]) => value !== undefined)
    );

    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        ref={ref}
        {...cleanProps}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
