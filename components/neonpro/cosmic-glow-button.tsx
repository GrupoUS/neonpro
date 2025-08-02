/**
 * NEONPROV1 Design System - CosmicGlowButton Component
 * Advanced button with cosmic glow animations and reduced motion support
 */
import React from 'react';
import { cn } from '@/lib/utils';
import { Button, ButtonProps } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface CosmicGlowButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost' | 'outline';
  loading?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  glowEffect?: boolean;
  cosmicAnimation?: boolean;
}

export const CosmicGlowButton = React.forwardRef<HTMLButtonElement, CosmicGlowButtonProps>(({
  children,
  className,
  variant = 'primary',
  loading = false,
  disabled,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  glowEffect = true,
  cosmicAnimation = true,
  ...props
}, ref) => {
  const getVariantStyles = () => {
    const baseStyles = 'relative overflow-hidden transition-all duration-300 ease-out';
    
    const variants = {
      primary: cn(
        baseStyles,
        'bg-gradient-to-r from-neon-primary to-neon-secondary',
        'hover:from-neon-secondary hover:to-neon-accent',
        'text-white font-semibold shadow-lg',
        'hover:shadow-xl hover:shadow-neon-primary/25',
        glowEffect && 'hover:shadow-neon-primary/40',
        'focus:ring-2 focus:ring-neon-accent focus:ring-offset-2',
        'disabled:from-slate-300 disabled:to-slate-400 disabled:text-slate-500',
        'disabled:shadow-none disabled:hover:shadow-none'
      ),
      secondary: cn(
        baseStyles,
        'bg-gradient-to-r from-neon-secondary to-neon-accent',
        'hover:from-neon-accent hover:to-blue-400',
        'text-white font-semibold shadow-lg',
        'hover:shadow-xl hover:shadow-neon-secondary/25',
        glowEffect && 'hover:shadow-neon-secondary/40',
        'focus:ring-2 focus:ring-neon-accent focus:ring-offset-2',
        'disabled:from-slate-300 disabled:to-slate-400 disabled:text-slate-500'
      ),
      success: cn(
        baseStyles,
        'bg-gradient-to-r from-neon-success to-emerald-400',
        'hover:from-emerald-400 hover:to-emerald-300',
        'text-white font-semibold shadow-lg',
        'hover:shadow-xl hover:shadow-neon-success/25',
        glowEffect && 'hover:shadow-neon-success/40',
        'focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2'
      ),
      warning: cn(
        baseStyles,
        'bg-gradient-to-r from-neon-warning to-amber-400',
        'hover:from-amber-400 hover:to-amber-300',
        'text-white font-semibold shadow-lg',
        'hover:shadow-xl hover:shadow-neon-warning/25',
        glowEffect && 'hover:shadow-neon-warning/40',
        'focus:ring-2 focus:ring-amber-400 focus:ring-offset-2'
      ),
      danger: cn(
        baseStyles,
        'bg-gradient-to-r from-neon-danger to-red-400',
        'hover:from-red-400 hover:to-red-300',
        'text-white font-semibold shadow-lg',
        'hover:shadow-xl hover:shadow-neon-danger/25',
        glowEffect && 'hover:shadow-neon-danger/40',
        'focus:ring-2 focus:ring-red-400 focus:ring-offset-2'
      ),
      ghost: cn(
        baseStyles,
        'bg-transparent hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100',
        'dark:hover:from-slate-800 dark:hover:to-slate-700',
        'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100',
        'border border-slate-200 dark:border-slate-700',
        'focus:ring-2 focus:ring-neon-accent focus:ring-offset-2',
        'disabled:text-slate-400 disabled:hover:bg-transparent'
      ),
      outline: cn(
        baseStyles,
        'bg-transparent hover:bg-gradient-to-r hover:from-neon-primary hover:to-neon-secondary',
        'text-neon-primary hover:text-white border-2 border-neon-primary',
        'hover:border-transparent font-semibold',
        glowEffect && 'hover:shadow-lg hover:shadow-neon-primary/25',
        'focus:ring-2 focus:ring-neon-accent focus:ring-offset-2',
        'disabled:text-slate-400 disabled:border-slate-300 disabled:hover:bg-transparent disabled:hover:text-slate-400'
      ),
    };
    
    return variants[variant];
  };

  const isDisabled = disabled || loading;

  return (
    <Button
      ref={ref}
      className={cn(
        'group relative',
        'px-6 py-3 rounded-lg font-medium',
        'focus:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-60',
        'transform hover:scale-105 active:scale-95',
        // Reduced motion support
        'motion-reduce:transform-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100',
        'motion-reduce:transition-none',
        getVariantStyles(),
        {
          'w-full': fullWidth,
        },
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {/* Cosmic background animation */}
      {cosmicAnimation && !isDisabled && (
        <>
          <div 
            className={cn(
              'absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500',
              'bg-gradient-to-r from-transparent via-white/10 to-transparent',
              'animate-[glow-slide_2s_ease-in-out_infinite]',
              // Reduced motion support
              'motion-reduce:opacity-0 motion-reduce:animate-none'
            )}
            style={{
              background: `linear-gradient(90deg, 
                transparent 0%, 
                rgba(255,255,255,0.1) 25%, 
                rgba(255,255,255,0.2) 50%, 
                rgba(255,255,255,0.1) 75%, 
                transparent 100%)`,
              backgroundSize: '200% 100%',
              animation: cosmicAnimation ? 'background-position-spin 3s linear infinite' : 'none',
            }}
          />
          <div 
            className={cn(
              'absolute inset-0 rounded-lg opacity-0 group-hover:opacity-75 transition-opacity duration-300',
              'bg-gradient-to-br from-transparent via-white/5 to-transparent',
              // Reduced motion support
              'motion-reduce:opacity-0'
            )}
          />
        </>
      )}

      {/* Button content */}
      <div className="relative z-10 flex items-center justify-center gap-2">
        {loading && (
          <Loader2 className="w-5 h-5 animate-spin" />
        )}
        
        {Icon && !loading && iconPosition === 'left' && (
          <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110 motion-reduce:group-hover:scale-100" />
        )}
        
        {children && (
          <span className={cn(
            'truncate font-semibold tracking-wide',
            'transition-all duration-200',
            {
              'sr-only': loading && !children,
            }
          )}>
            {children}
          </span>
        )}
        
        {Icon && !loading && iconPosition === 'right' && (
          <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110 motion-reduce:group-hover:scale-100" />
        )}
      </div>

      {/* Glow effect overlay */}
      {glowEffect && !isDisabled && (
        <div 
          className={cn(
            'absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300',
            'bg-gradient-to-r from-transparent via-current to-transparent blur-sm',
            // Reduced motion support
            'motion-reduce:opacity-0'
          )}
          style={{
            background: variant === 'primary' ? 
              'radial-gradient(circle at center, rgba(30, 64, 175, 0.3) 0%, transparent 70%)' :
            variant === 'success' ? 
              'radial-gradient(circle at center, rgba(16, 185, 129, 0.3) 0%, transparent 70%)' :
            variant === 'warning' ? 
              'radial-gradient(circle at center, rgba(245, 158, 11, 0.3) 0%, transparent 70%)' :
            variant === 'danger' ? 
              'radial-gradient(circle at center, rgba(239, 68, 68, 0.3) 0%, transparent 70%)' :
              'radial-gradient(circle at center, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
          }}
        />
      )}
    </Button>
  );
});

CosmicGlowButton.displayName = 'CosmicGlowButton';