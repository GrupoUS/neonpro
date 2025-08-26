import type React from 'react';

// Placeholder import for @neonpro/utils
const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

interface AlertProps {
  variant?: 'default' | 'destructive';
  className?: string;
  children?: React.ReactNode;
}

export function Alert({
  variant = 'default',
  className,
  children,
  ...props
}: AlertProps) {
  return (
    <div
      className={cn(
        'relative w-full rounded-lg border p-4',
        variant === 'destructive'
          ? 'border-red-200 text-red-800'
          : 'border-gray-200',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function AlertDescription({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn('text-sm', className)} {...props}>
      {children}
    </div>
  );
}

export function AlertTitle({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <h5
      className={cn('mb-1 font-medium leading-none tracking-tight', className)}
      {...props}
    >
      {children}
    </h5>
  );
}
