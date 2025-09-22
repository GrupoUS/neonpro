'use client';

import { useKeyboardNavigation } from '@/hooks/accessibility/use-focus-management';
import { useMobileOptimization } from '@/hooks/accessibility/use-mobile-optimization';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

// Healthcare-specific button variants with accessibility focus
const healthcareButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=\'size-\'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
  {
    variants: {
      // Healthcare-specific variants
      variant: {
        // Primary action (save, confirm, proceed)
        primary:
          'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40',

        // Secondary action (cancel, back)
        secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',

        // Destructive action (delete, remove)
        destructive:
          'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',

        // Emergency actions (emergency contact, urgent care)
        emergency:
          'bg-red-600 text-white shadow-xs hover:bg-red-700 focus-visible:ring-red-500/20 dark:focus-visible:ring-red-500/40 animate-pulse',

        // Medical actions (prescribe, order test)
        medical:
          'bg-blue-600 text-white shadow-xs hover:bg-blue-700 focus-visible:ring-blue-500/20 dark:focus-visible:ring-blue-500/40',

        // Neutral actions (view, info)
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',

        // Subtle actions (edit, settings)
        ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',

        // Navigation actions (links)
        link: 'text-primary underline-offset-4 hover:underline',

        // Success actions (completed, verified)
        success:
          'bg-green-600 text-white shadow-xs hover:bg-green-700 focus-visible:ring-green-500/20 dark:focus-visible:ring-green-500/40',

        // Warning actions (attention required)
        warning:
          'bg-yellow-500 text-white shadow-xs hover:bg-yellow-600 focus-visible:ring-yellow-400/20 dark:focus-visible:ring-yellow-400/40',
      },
      // Healthcare-optimized sizes with touch targets
      size: {
        // Extra small for dense interfaces
        xs: 'h-7 px-2 py-1 text-xs has-[>svg]:px-1.5 min-h-[32px]', // 32px min touch target

        // Small for forms and secondary actions
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 min-h-[36px]', // 36px min touch target

        // Standard for most actions (WCAG compliant)
        default: 'h-9 px-4 py-2 has-[>svg]:px-3 min-h-[44px]', // 44px min touch target

        // Large for primary actions and mobile
        lg: 'h-10 rounded-md px-5 has-[>svg]:px-4 min-h-[48px]', // 48px for better mobile experience

        // Extra large for emergency actions and accessibility
        xl: 'h-12 rounded-lg px-6 has-[>svg]:px-5 min-h-[56px]', // 56px for emergency and accessibility

        // Icon-only buttons with proper sizing
        icon: 'size-9 min-h-[44px]', // 44px minimum for icon buttons
        iconLg: 'size-12 min-h-[48px]', // 48px for larger icons
      },
      // Mobile optimization states
      mobileOptimized: {
        true: 'touch-manipulation active:scale-[0.98] transition-transform duration-150',
        false: '',
      },
      // Loading state
      loading: {
        true: 'cursor-not-allowed opacity-70',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
      mobileOptimized: true,
      loading: false,
    },
  },
);

export interface HealthcareButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof healthcareButtonVariants>
{
  /** Loading state */
  isLoading?: boolean;
  /** Mobile optimization */
  mobileOptimized?: boolean;
  /** Emergency action (requires confirmation) */
  isEmergency?: boolean;
  /** Medical action (requires special handling) */
  isMedical?: boolean;
  /** Show confirmation dialog */
  requiresConfirmation?: boolean;
  /** Confirmation message */
  confirmationMessage?: string;
  /** Accessibility label */
  ariaLabel?: string;
  /** Accessibility description */
  ariaDescription?: string;
  /** Button action for screen readers */
  accessibilityAction?: 'press' | 'activate' | 'select';
  /** Keyboard shortcut */
  keyboardShortcut?: string;
  /** Touch target size override */
  touchTargetSize?: 'small' | 'medium' | 'large';
  /** Healthcare context */
  healthcareContext?: string;
}

/**
 * HealthcareButton - WCAG 2.1 AA+ compliant button component
 * Designed for healthcare applications with accessibility focus
 */
const HealthcareButton = React.forwardRef<HTMLButtonElement, HealthcareButtonProps>(({
    className,variant, size, isLoading = false, mobileOptimized = true, isEmergency = false, isMedical = false, requiresConfirmation = false,confirmationMessage, ariaLabel,ariaDescription, accessibilityAction = 'press',keyboardShortcut, touchTargetSize,healthcareContext, children,disabled, onClick, ...props
  }, ref) => {
    const { isMobile, touchSupported } = useMobileOptimization();

    // Handle keyboard navigation
    const handleKeyDown = useKeyboardNavigation(() => handleClick(new Event('click') as any),
      () => handleClick(new Event('click') as any), // Space key
      undefined, // Escape handled by parent
    );

    // Handle click with confirmation
    const handleClick = React.useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled || isLoading) {
          e.preventDefault();
          return;
        }

        if (requiresConfirmation) {
          const message = confirmationMessage
            || (isEmergency
              ? 'Esta é uma ação de emergência. Deseja continuar?'
              : 'Confirmar esta ação?');

          if (confirm(message)) {
            onClick?.(e);
          }
        } else {
          onClick?.(e);
        }
      },
      [disabled, isLoading, requiresConfirmation, confirmationMessage, isEmergency, onClick],
    );

    // Determine variant based on props
    const buttonVariant = React.useMemo(() => {
      if (isEmergency) return 'emergency';
      if (isMedical) return 'medical';
      return variant;
    }, [isEmergency, isMedical, variant]);

    // Adjust size for mobile and accessibility
    const buttonSize = React.useMemo(() => {
      if (touchTargetSize === 'large') return 'xl';
      if (touchTargetSize === 'small') return 'sm';

      // Auto-adjust based on device and context
      if (isMobile || isEmergency) {
        return size === 'icon' || size === 'iconLg' ? 'lg' : 'lg';
      }

      return size;
    }, [touchTargetSize, isMobile, isEmergency, size]);

    // Generate accessibility attributes
    const accessibilityProps = React.useMemo(() => {
      const props: Record<string, string> = {};

      if (ariaLabel) {
        props['aria-label'] = ariaLabel;
      }

      if (ariaDescription) {
        props['aria-describedby'] = ariaDescription;
      }

      if (healthcareContext) {
        props['data-healthcare-context'] = healthcareContext;
      }

      if (keyboardShortcut) {
        props['data-keyboard-shortcut'] = keyboardShortcut;
        props['title'] = `${ariaLabel || 'Botão'} (${keyboardShortcut})`;
      }

      if (accessibilityAction) {
        props['role'] = 'button';
        props['data-action'] = accessibilityAction;
      }

      return props;
    }, [ariaLabel, ariaDescription, healthcareContext, keyboardShortcut, accessibilityAction]);

    // Loading state content
    const loadingContent = React.useMemo(() => {
      if (!isLoading) return null;

      return (
        <>
          <svg
            className='animate-spin h-4 w-4'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            aria-hidden='true'
          >
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
            />
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            />
          </svg>
          <span className='sr-only'>Carregando...</span>
        </>
      );
    }, [isLoading]);

    return (
      <button
        ref={ref}
        className={cn(
          healthcareButtonVariants({
            variant: buttonVariant,
            size: buttonSize,
            mobileOptimized: mobileOptimized && touchSupported,
            loading: isLoading,
          }),
          // Emergency animations
          isEmergency && 'animate-pulse',
          // Disabled states
          (disabled || isLoading) && 'cursor-not-allowed',
          className,
        )}
        disabled={disabled || isLoading}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...accessibilityProps}
        {...props}
      >
        {isLoading ? loadingContent : children}
      </button>
    );
  },
);

HealthcareButton.displayName = 'HealthcareButton';

export { HealthcareButton, healthcareButtonVariants };
