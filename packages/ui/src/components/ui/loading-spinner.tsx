import * as React from 'react';
import { cn } from '../../lib/utils';

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size = 'md', ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
    };

    return (
      <div
        ref={ref}
        className={cn('animate-spin rounded-full border-2 border-gray-300 border-t-blue-600', sizeClasses[size], className)}
        {...props}
      />
    );
  }
);

LoadingSpinner.displayName = 'LoadingSpinner';

export { LoadingSpinner };