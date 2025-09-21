'use client';

import { useScreenReaderAnnouncer } from '@/hooks/accessibility/use-focus-management';
import { useI18n } from '@/i18n/i18n';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

// Healthcare loading variants
const healthcareLoadingVariants = cva(
  'flex items-center justify-center gap-2',
  {
    variants: {
      size: {
        sm: 'text-sm',
        default: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
      },
      variant: {
        spinner: 'gap-2',
        dots: 'gap-1',
        pulse: 'gap-2',
        skeleton: 'gap-2',
        progress: 'gap-2 flex-col',
      },
      color: {
        primary: 'text-primary',
        secondary: 'text-secondary-foreground',
        medical: 'text-blue-600',
        emergency: 'text-red-600',
        success: 'text-green-600',
        warning: 'text-yellow-600',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'spinner',
      color: 'primary',
    },
  },
);

export interface HealthcareLoadingProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof healthcareLoadingVariants>
{
  /** Loading message */
  message?: string;
  /** Progress percentage (for progress variant) */
  progress?: number;
  /** Accessibility label */
  ariaLabel?: string;
  /** Healthcare context */
  healthcareContext?: string;
  /** Show accessibility announcements */
  announceChanges?: boolean;
  /** Minimum display time in ms */
  minDisplayTime?: number;
  /** Custom loading indicator */
  customIndicator?: React.ReactNode;
}

/**
 * HealthcareLoading - WCAG 2.1 AA+ compliant loading component
 * Designed for healthcare applications with accessibility focus
 */
const HealthcareLoading = React.forwardRef<HTMLDivElement, HealthcareLoadingProps>(
  ({
    className,
    size,
    variant,
    color,
    message,
    progress,
    ariaLabel,
    healthcareContext,
    announceChanges = true,
    minDisplayTime = 1000,
    customIndicator,
    ...props
  }, ref) => {
    const { t } = useI18n();
    const { announcePolite } = useScreenReaderAnnouncer();
    const [startTime] = React.useState(Date.now());
    const [shouldShow, setShouldShow] = React.useState(false);

    // Announce loading state changes
    React.useEffect(() => {
      if (announceChanges) {
        const loadingMessage = message || t('common.loading');
        announcePolite(loadingMessage);
      }
    }, [message, announceChanges, announcePolite, t]);

    // Handle minimum display time
    React.useEffect(() => {
      const timer = setTimeout(() => {
        setShouldShow(true);
      }, minDisplayTime);

      return () => clearTimeout(timer);
    }, [minDisplayTime]);

    if (!shouldShow) {
      return (
        <div
          ref={ref}
          className={cn(healthcareLoadingVariants({ size, variant, color }), className)}
          aria-hidden='true'
          {...props}
        >
          <span className='sr-only'>{t('common.loading')}</span>
        </div>
      );
    }

    // Loading message
    const loadingMessage = message || t('common.loading');

    // Generate accessibility attributes
    const accessibilityProps = React.useMemo(() => {
      const props: Record<string, string> = {};

      if (ariaLabel) {
        props['aria-label'] = ariaLabel;
      } else {
        props['aria-label'] = loadingMessage;
      }

      props['aria-live'] = 'polite';
      props['aria-busy'] = 'true';

      if (healthcareContext) {
        props['data-healthcare-context'] = healthcareContext;
      }

      return props;
    }, [ariaLabel, loadingMessage, healthcareContext]);

    // Render loading indicator
    const renderIndicator = () => {
      if (customIndicator) {
        return customIndicator;
      }

      switch (variant) {
        case 'spinner':
          return (
            <svg
              className={cn(
                'animate-spin',
                size === 'sm' && 'h-4 w-4',
                size === 'default' && 'h-5 w-5',
                size === 'lg' && 'h-6 w-6',
                size === 'xl' && 'h-8 w-8',
                color === 'primary' && 'text-primary',
                color === 'secondary' && 'text-secondary-foreground',
                color === 'medical' && 'text-blue-600',
                color === 'emergency' && 'text-red-600',
                color === 'success' && 'text-green-600',
                color === 'warning' && 'text-yellow-600',
              )}
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
          );

        case 'dots':
          return (
            <div className='flex space-x-1'>
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className={cn(
                    'animate-bounce rounded-full',
                    size === 'sm' && 'h-2 w-2',
                    size === 'default' && 'h-2.5 w-2.5',
                    size === 'lg' && 'h-3 w-3',
                    size === 'xl' && 'h-4 w-4',
                    color === 'primary' && 'bg-primary',
                    color === 'secondary' && 'bg-secondary-foreground',
                    color === 'medical' && 'bg-blue-600',
                    color === 'emergency' && 'bg-red-600',
                    color === 'success' && 'bg-green-600',
                    color === 'warning' && 'bg-yellow-600',
                  )}
                  style={{
                    animationDelay: `${i * 0.1}s`,
                  }}
                  aria-hidden='true'
                />
              ))}
            </div>
          );

        case 'pulse':
          return (
            <div
              className={cn(
                'animate-pulse rounded-full',
                size === 'sm' && 'h-4 w-4',
                size === 'default' && 'h-5 w-5',
                size === 'lg' && 'h-6 w-6',
                size === 'xl' && 'h-8 w-8',
                color === 'primary' && 'bg-primary',
                color === 'secondary' && 'bg-secondary-foreground',
                color === 'medical' && 'bg-blue-600',
                color === 'emergency' && 'bg-red-600',
                color === 'success' && 'bg-green-600',
                color === 'warning' && 'bg-yellow-600',
              )}
              aria-hidden='true'
            />
          );

        case 'skeleton':
          return (
            <div className='space-y-2 w-full'>
              <div
                className={cn(
                  'animate-pulse rounded',
                  size === 'sm' && 'h-2',
                  size === 'default' && 'h-2.5',
                  size === 'lg' && 'h-3',
                  size === 'xl' && 'h-4',
                  color === 'primary' && 'bg-primary/20',
                  color === 'secondary' && 'bg-secondary-foreground/20',
                  color === 'medical' && 'bg-blue-600/20',
                  color === 'emergency' && 'bg-red-600/20',
                  color === 'success' && 'bg-green-600/20',
                  color === 'warning' && 'bg-yellow-600/20',
                )}
                aria-hidden='true'
              />
              <div
                className={cn(
                  'animate-pulse rounded w-3/4',
                  size === 'sm' && 'h-2',
                  size === 'default' && 'h-2.5',
                  size === 'lg' && 'h-3',
                  size === 'xl' && 'h-4',
                  color === 'primary' && 'bg-primary/20',
                  color === 'secondary' && 'bg-secondary-foreground/20',
                  color === 'medical' && 'bg-blue-600/20',
                  color === 'emergency' && 'bg-red-600/20',
                  color === 'success' && 'bg-green-600/20',
                  color === 'warning' && 'bg-yellow-600/20',
                )}
                aria-hidden='true'
              />
            </div>
          );

        case 'progress':
          return (
            <div className='w-full space-y-2'>
              <div className='w-full bg-gray-200 rounded-full h-2.5'>
                <div
                  className={cn(
                    'h-2.5 rounded-full transition-all duration-300',
                    color === 'primary' && 'bg-primary',
                    color === 'secondary' && 'bg-secondary-foreground',
                    color === 'medical' && 'bg-blue-600',
                    color === 'emergency' && 'bg-red-600',
                    color === 'success' && 'bg-green-600',
                    color === 'warning' && 'bg-yellow-600',
                  )}
                  style={{ width: `${progress || 0}%` }}
                  role='progressbar'
                  aria-valuenow={progress || 0}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label='Progresso'
                />
              </div>
              {progress !== undefined && (
                <span className='text-sm text-muted-foreground'>
                  {progress}%
                </span>
              )}
            </div>
          );

        default:
          return null;
      }
    };

    return (
      <div
        ref={ref}
        className={cn(healthcareLoadingVariants({ size, variant, color }), className)}
        role='status'
        {...accessibilityProps}
        {...props}
      >
        {renderIndicator()}
        {loadingMessage && (
          <span
            className={cn(
              variant === 'skeleton' && 'invisible', // Hide text for skeleton
              variant === 'progress' && 'text-sm', // Smaller text for progress
            )}
          >
            {loadingMessage}
          </span>
        )}
      </div>
    );
  },
);

HealthcareLoading.displayName = 'HealthcareLoading';

// Healthcare Error component
export interface HealthcareErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Error message */
  error: string | Error;
  /** Error details */
  details?: string;
  /** Error type */
  type?: 'network' | 'validation' | 'permission' | 'server' | 'timeout' | 'general';
  /** Retry action */
  onRetry?: () => void;
  /** Dismiss action */
  onDismiss?: () => void;
  /** Healthcare context */
  healthcareContext?: string;
  /** Show accessibility announcements */
  announceChanges?: boolean;
}

/**
 * HealthcareError - WCAG 2.1 AA+ compliant error component
 * Designed for healthcare applications with accessibility focus
 */
const HealthcareError = React.forwardRef<HTMLDivElement, HealthcareErrorProps>(
  ({
    className,
    error,
    details,
    type = 'general',
    onRetry,
    onDismiss,
    healthcareContext,
    announceChanges = true,
    ...props
  }, ref) => {
    const { t } = useI18n();
    const { announceAssertive } = useScreenReaderAnnouncer();

    // Error message
    const errorMessage = React.useMemo(() => {
      if (typeof error === 'string') return error;
      return error.message || t('common.error');
    }, [error, t]);

    // Error icon based on type
    const ErrorIcon = React.useMemo(() => {
      switch (type) {
        case 'network':
          return (
            <svg
              className='h-5 w-5 text-orange-600'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          );
        case 'validation':
          return (
            <svg
              className='h-5 w-5 text-yellow-600'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z'
              />
            </svg>
          );
        case 'permission':
          return (
            <svg
              className='h-5 w-5 text-red-600'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
              />
            </svg>
          );
        case 'server':
          return (
            <svg
              className='h-5 w-5 text-red-600'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z'
              />
            </svg>
          );
        case 'timeout':
          return (
            <svg
              className='h-5 w-5 text-orange-600'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          );
        default:
          return (
            <svg
              className='h-5 w-5 text-red-600'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          );
      }
    }, [type]);

    // Announce error changes
    React.useEffect(() => {
      if (announceChanges) {
        announceAssertive(`Erro: ${errorMessage}`);
      }
    }, [errorMessage, announceChanges, announceAssertive]);

    // Generate accessibility attributes
    const accessibilityProps = React.useMemo(() => {
      const props: Record<string, string> = {};

      props['aria-live'] = 'assertive';
      props['role'] = 'alert';

      if (healthcareContext) {
        props['data-healthcare-context'] = healthcareContext;
      }

      return props;
    }, [healthcareContext]);

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border border-red-200 bg-red-50 p-4 text-red-900 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200',
          className,
        )}
        {...accessibilityProps}
        {...props}
      >
        <div className='flex items-start gap-3'>
          <div className='flex-shrink-0'>
            {ErrorIcon}
          </div>
          <div className='flex-1 space-y-1'>
            <h3 className='font-medium text-red-900 dark:text-red-100'>
              {t('common.error')}
            </h3>
            <p className='text-sm text-red-700 dark:text-red-300'>
              {errorMessage}
            </p>
            {details && (
              <p className='text-xs text-red-600 dark:text-red-400'>
                {details}
              </p>
            )}
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className='flex-shrink-0 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-sm p-1'
              aria-label='Fechar mensagem de erro'
            >
              <svg className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          )}
        </div>
        {onRetry && (
          <div className='mt-3'>
            <button
              onClick={onRetry}
              className='inline-flex items-center gap-2 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500'
            >
              <svg className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                />
              </svg>
              {t('common.retry')}
            </button>
          </div>
        )}
      </div>
    );
  },
);

HealthcareError.displayName = 'HealthcareError';

export { HealthcareError, HealthcareLoading, healthcareLoadingVariants };
