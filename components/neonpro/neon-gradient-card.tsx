/**
 * NEONPROV1 Design System - NeonGradientCard Component
 * Advanced card with gradient backgrounds and cosmic animations
 */
import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface NeonGradientCardProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'cosmic';
  priority?: 'normal' | 'urgent' | 'critical';
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  loading?: boolean;
  onClick?: () => void;
  glowEffect?: boolean;
  animateOnHover?: boolean;
  backgroundAnimation?: boolean;
}

export const NeonGradientCard = React.forwardRef<HTMLDivElement, NeonGradientCardProps>(({
  children,
  className,
  variant = 'default',
  priority = 'normal',
  title,
  description,
  footer,
  loading = false,
  onClick,
  glowEffect = true,
  animateOnHover = true,
  backgroundAnimation = true,
  ...props
}, ref) => {
  const isInteractive = !!onClick;
  
  const getVariantStyles = () => {
    const baseStyles = 'relative overflow-hidden transition-all duration-300 ease-out';
    
    const variants = {
      default: cn(
        baseStyles,
        'bg-gradient-to-br from-white to-slate-50',
        'dark:from-slate-900 dark:to-slate-800',
        'border border-slate-200 dark:border-slate-700',
        'shadow-lg hover:shadow-xl',
        glowEffect && 'hover:shadow-slate-200/50 dark:hover:shadow-slate-700/50'
      ),
      primary: cn(
        baseStyles,
        'bg-gradient-to-br from-neon-primary/5 to-neon-secondary/10',
        'dark:from-neon-primary/10 dark:to-neon-secondary/20',
        'border border-neon-primary/20 dark:border-neon-primary/30',
        'shadow-lg hover:shadow-xl',
        glowEffect && 'hover:shadow-neon-primary/25'
      ),
      success: cn(
        baseStyles,
        'bg-gradient-to-br from-neon-success/5 to-emerald-400/10',
        'dark:from-neon-success/10 dark:to-emerald-400/20',
        'border border-neon-success/20 dark:border-neon-success/30',
        'shadow-lg hover:shadow-xl',
        glowEffect && 'hover:shadow-neon-success/25'
      ),
      warning: cn(
        baseStyles,
        'bg-gradient-to-br from-neon-warning/5 to-amber-400/10',
        'dark:from-neon-warning/10 dark:to-amber-400/20',
        'border border-neon-warning/20 dark:border-neon-warning/30',
        'shadow-lg hover:shadow-xl',
        glowEffect && 'hover:shadow-neon-warning/25'
      ),
      danger: cn(
        baseStyles,
        'bg-gradient-to-br from-neon-danger/5 to-red-400/10',
        'dark:from-neon-danger/10 dark:to-red-400/20',
        'border border-neon-danger/20 dark:border-neon-danger/30',
        'shadow-lg hover:shadow-xl',
        glowEffect && 'hover:shadow-neon-danger/25'
      ),
      cosmic: cn(
        baseStyles,
        'bg-gradient-to-br from-neon-primary/10 via-neon-accent/5 to-neon-secondary/10',
        'dark:from-neon-primary/20 dark:via-neon-accent/10 dark:to-neon-secondary/20',
        'border border-transparent bg-clip-padding',
        'shadow-xl hover:shadow-2xl',
        glowEffect && 'hover:shadow-neon-primary/30'
      ),
    };
    
    return variants[variant];
  };

  const getPriorityAccent = () => {
    if (variant !== 'default') return '';
    
    const accents = {
      normal: 'border-l-4 border-l-neon-success',
      urgent: 'border-l-4 border-l-neon-warning',
      critical: 'border-l-4 border-l-neon-danger',
    };
    
    return accents[priority];
  };

  const cardClassName = cn(
    'group relative',
    'rounded-xl',
    getVariantStyles(),
    getPriorityAccent(),
    {
      // Interactive styles
      'cursor-pointer': isInteractive,
      'hover:scale-105 active:scale-100': isInteractive && animateOnHover,
      'motion-reduce:hover:scale-100 motion-reduce:active:scale-100': isInteractive,
      
      // Loading state
      'animate-pulse': loading,
      'pointer-events-none': loading,
    },
    className
  );

  return (
    <Card
      ref={ref}
      className={cardClassName}
      onClick={onClick}
      {...props}
    >
      {/* Cosmic background animation */}
      {backgroundAnimation && variant === 'cosmic' && !loading && (
        <>
          <div 
            className={cn(
              'absolute inset-0 rounded-xl opacity-30',
              'bg-gradient-to-r from-transparent via-neon-primary/10 to-transparent',
              'motion-reduce:opacity-0'
            )}
            style={{
              backgroundSize: '200% 100%',
              animation: 'background-position-spin 8s linear infinite',
            }}
          />
          <div 
            className={cn(
              'absolute inset-0 rounded-xl opacity-20',
              'bg-gradient-to-br from-neon-accent/20 via-transparent to-neon-secondary/20',
              'animate-pulse',
              'motion-reduce:animate-none motion-reduce:opacity-0'
            )}
          />
        </>
      )}

      {/* Glow effect for primary variants */}
      {glowEffect && variant !== 'default' && !loading && (
        <div 
          className={cn(
            'absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500',
            'motion-reduce:opacity-0'
          )}
          style={{
            background: variant === 'primary' ? 
              'radial-gradient(circle at 50% 50%, rgba(30, 64, 175, 0.1) 0%, transparent 70%)' :
            variant === 'success' ? 
              'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 70%)' :
            variant === 'warning' ? 
              'radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.1) 0%, transparent 70%)' :
            variant === 'danger' ? 
              'radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.1) 0%, transparent 70%)' :
            variant === 'cosmic' ?
              'radial-gradient(circle at 50% 50%, rgba(30, 64, 175, 0.15) 0%, rgba(59, 130, 246, 0.1) 40%, transparent 70%)' :
              'none',
          }}
        />
      )}

      {/* Card content */}
      <div className="relative z-10">
        {(title || description) && (
          <CardHeader className="pb-4">
            {title && (
              <CardTitle className={cn(
                'text-xl font-bold transition-colors duration-200',
                {
                  'text-healthcare-critical': priority === 'critical',
                  'text-healthcare-urgent': priority === 'urgent',
                  'text-neon-primary': priority === 'normal' || variant === 'primary',
                  'text-neon-success': variant === 'success',
                  'text-neon-warning': variant === 'warning',
                  'text-neon-danger': variant === 'danger',
                  'text-gradient-neon': variant === 'cosmic',
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
              <CardDescription className="text-slate-600 dark:text-slate-400 mt-2">
                {loading ? (
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                ) : (
                  description
                )}
              </CardDescription>
            )}
          </CardHeader>
        )}
        
        <CardContent className={cn(
          'relative',
          !title && !description && 'pt-6'
        )}>
          {loading ? (
            <div className="space-y-4">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/2" />
            </div>
          ) : (
            children
          )}
        </CardContent>
        
        {footer && (
          <CardFooter className="pt-4 border-t border-slate-100 dark:border-slate-800">
            {loading ? (
              <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-full" />
            ) : (
              footer
            )}
          </CardFooter>
        )}
      </div>
    </Card>
  );
});

NeonGradientCard.displayName = 'NeonGradientCard';