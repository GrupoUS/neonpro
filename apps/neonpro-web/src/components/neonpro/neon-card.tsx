/**
 * NEONPROV1 Design System - NeonCard Component
 * Healthcare-optimized card component with NEONPROV1 styling
 */
import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface NeonCardProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'interactive' | 'metric' | 'status';
  priority?: 'normal' | 'urgent' | 'critical';
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  loading?: boolean;
  onClick?: () => void;
}

export const NeonCard = React.forwardRef<HTMLDivElement, NeonCardProps>(({
  children,
  className,
  variant = 'default',
  priority = 'normal',
  title,
  description,
  footer,
  loading = false,
  onClick,
  ...props
}, ref) => {
  const isInteractive = variant === 'interactive' || !!onClick;
  
  const cardClassName = cn(
    'neon-card neon-transition',
    {
      // Interactive variants
      'neon-card-interactive hover:neon-shadow-primary': isInteractive,
      'cursor-pointer': isInteractive,
      
      // Metric card styling
      'border-l-4 border-l-neon-primary bg-gradient-to-r from-blue-50 to-white dark:from-slate-800 dark:to-slate-900': 
        variant === 'metric',
      
      // Status card styling with priority
      'border-l-4': variant === 'status',
      'border-l-healthcare-normal': variant === 'status' && priority === 'normal',
      'border-l-healthcare-urgent': variant === 'status' && priority === 'urgent',
      'border-l-healthcare-critical': variant === 'status' && priority === 'critical',
      
      // Loading state
      'animate-pulse': loading,
      'pointer-events-none': loading,
    },
    className
  );

  const cardContent = (
    <>
      {(title || description) && (
        <CardHeader className="pb-3">
          {title && (
            <CardTitle className={cn(
              'text-lg font-semibold',
              {
                'text-healthcare-critical': priority === 'critical',
                'text-healthcare-urgent': priority === 'urgent',
                'text-neon-primary': priority === 'normal',
              }
            )}>
              {loading ? (
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              ) : (
                title
              )}
            </CardTitle>
          )}
          {description && (
            <CardDescription className="text-slate-600 dark:text-slate-400">
              {loading ? (
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-2" />
              ) : (
                description
              )}
            </CardDescription>
          )}
        </CardHeader>
      )}
      
      <CardContent className={cn(
        'pt-0',
        !title && !description && 'pt-6'
      )}>
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/2" />
          </div>
        ) : (
          children
        )}
      </CardContent>
      
      {footer && (
        <CardFooter className="pt-0">
          {loading ? (
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-full" />
          ) : (
            footer
          )}
        </CardFooter>
      )}
    </>
  );

  return (
    <Card
      ref={ref}
      className={cardClassName}
      onClick={onClick}
      {...props}
    >
      {cardContent}
    </Card>
  );
});

NeonCard.displayName = 'NeonCard';
