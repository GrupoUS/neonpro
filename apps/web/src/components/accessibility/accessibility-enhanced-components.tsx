/**
 * Accessibility-Enhanced Healthcare Components
 *
 * WCAG 2.1 AA+ compliant components designed specifically for healthcare applications
 * with enhanced accessibility features and Brazilian healthcare compliance.
 */

import { cn } from '@neonpro/ui/lib/utils';
import * as React from 'react';

// Enhanced accessible form components
export const AccessibleForm = React.forwardRef<
  HTMLFormElement,
  React.FormHTMLAttributes<HTMLFormElement> & {
    'aria-label'?: string;
    'aria-describedby'?: string;
    'data-medical'?: boolean;
  }
>(({
      className,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      'data-medical': isMedical, ...props
    },ref,
  ) => {
    const accessibilityProps = {
      'aria-label': ariaLabel
        || (isMedical ? 'Medical information form' : 'Information form'),
      'aria-describedby': ariaDescribedBy,
      _role: 'form',
    };

    return (
      <form
        ref={ref}
        className={cn(
          'space-y-6',
          isMedical && 'medical-form border-2 border-blue-200 p-4 rounded-lg',
          className,
        )}
        {...accessibilityProps}
        {...props}
      />
    );
  },
);
AccessibleForm.displayName = 'AccessibleForm';

// Enhanced accessible input with healthcare-specific features
export const AccessibleInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    error?: string;
    description?: string;
    required?: boolean;
    'data-sensitive'?: boolean;
    'data-medical'?: boolean;
  }
>(({
      className,label, error,description, required = false,
      'data-sensitive': isSensitive,
      'data-medical': isMedical,
      id: propId, ...props
    },ref,
  ) => {
    const inputId = propId || React.useId();
    const errorId = error ? `${inputId}-error` : undefined;
    const descriptionId = description ? `${inputId}-description` : undefined;

    const accessibilityProps = {
      'aria-label': props['aria-label'] || label,
      'aria-describedby': [descriptionId, errorId].filter(Boolean).join(' ') || undefined,
      'aria-required': required ? 'true' : undefined,
      'aria-invalid': error ? 'true' : undefined,
      'aria-errormessage': errorId,
    };

    return (
      <div className='space-y-2'>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
              isSensitive && 'text-red-600 font-semibold',
              isMedical && 'text-blue-600 font-semibold',
            )}
          >
            {label}
            {required && (
              <span className='text-red-500 ml-1' aria-label='required'>
                *
              </span>
            )}
          </label>
        )}

        <input
          id={inputId}
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus-visible:ring-red-500',
            isSensitive && 'border-orange-300 bg-orange-50',
            isMedical && 'border-blue-300 bg-blue-50',
            className,
          )}
          {...accessibilityProps}
          {...props}
        />

        {description && (
          <p id={descriptionId} className='text-xs text-muted-foreground'>
            {description}
          </p>
        )}

        {error && (
          <p
            id={errorId}
            className='text-xs text-red-600 font-medium'
            role='alert'
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);
AccessibleInput.displayName = 'AccessibleInput';

// Enhanced accessible select with healthcare-specific features
export const AccessibleSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & {
    label?: string;
    options: Array<{ value: string; label: string; disabled?: boolean }>;
    error?: string;
    description?: string;
    required?: boolean;
    'data-medical'?: boolean;
  }
>(({
      className,label, options,error, description, required = false,
      'data-medical': isMedical,
      id: propId, ...props
    },ref,
  ) => {
    const selectId = propId || React.useId();
    const errorId = error ? `${selectId}-error` : undefined;
    const descriptionId = description ? `${selectId}-description` : undefined;

    const accessibilityProps = {
      'aria-label': props['aria-label'] || label,
      'aria-describedby': [descriptionId, errorId].filter(Boolean).join(' ') || undefined,
      'aria-required': required ? 'true' : undefined,
      'aria-invalid': error ? 'true' : undefined,
      'aria-errormessage': errorId,
    };

    return (
      <div className='space-y-2'>
        {label && (
          <label
            htmlFor={selectId}
            className={cn(
              'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
              isMedical && 'text-blue-600 font-semibold',
            )}
          >
            {label}
            {required && (
              <span className='text-red-500 ml-1' aria-label='required'>
                *
              </span>
            )}
          </label>
        )}

        <select
          id={selectId}
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus-visible:ring-red-500',
            isMedical && 'border-blue-300 bg-blue-50',
            className,
          )}
          {...accessibilityProps}
          {...props}
        >
          {options.map(option => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        {description && (
          <p id={descriptionId} className='text-xs text-muted-foreground'>
            {description}
          </p>
        )}

        {error && (
          <p
            id={errorId}
            className='text-xs text-red-600 font-medium'
            role='alert'
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);
AccessibleSelect.displayName = 'AccessibleSelect';

// Enhanced accessible button with healthcare-specific features
export const AccessibleButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?:
      | 'default'
      | 'destructive'
      | 'outline'
      | 'secondary'
      | 'ghost'
      | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    loading?: boolean;
    'data-emergency'?: boolean;
    'data-medical'?: boolean;
    icon?: React.ReactNode;
  }
>(({
      className, variant = 'default', size = 'default', loading = false,
      'data-emergency': isEmergency,
      'data-medical': isMedical,icon, children,disabled, ...props
    },ref,
  ) => {
    const accessibilityProps = {
      'aria-label': props['aria-label'] || props.title,
      'aria-describedby': props['aria-describedby'],
      'aria-busy': loading ? 'true' : undefined,
      _role: props.role || (variant === 'link' ? 'link' : 'button'),
    };

    const variants = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'text-primary underline-offset-4 hover:underline',
    };

    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-md px-8',
      icon: 'h-10 w-10',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          isEmergency
            && 'bg-red-600 hover:bg-red-700 text-white font-bold animate-pulse',
          isMedical && 'border-2 border-blue-300',
          loading && 'cursor-not-allowed opacity-70',
          className,
        )}
        disabled={disabled || loading}
        {...accessibilityProps}
        {...props}
      >
        {loading && (
          <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
        )}
        {icon && <span className='mr-2'>{icon}</span>}
        {children}
      </button>
    );
  },
);
AccessibleButton.displayName = 'AccessibleButton';

// Enhanced accessible alert component for healthcare
export const AccessibleAlert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'info' | 'success' | 'warning' | 'error' | 'emergency';
    title?: string;
    dismissible?: boolean;
    onDismiss?: () => void;
  }
>(({
      className, variant = 'info',title, dismissible = false,onDismiss, children, ...props
    },ref,
  ) => {
    const alertId = React.useId();

    const variants = {
      info: 'bg-blue-50 border-blue-200 text-blue-800',
      success: 'bg-green-50 border-green-200 text-green-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      emergency: 'bg-red-100 border-red-300 text-red-900 border-2 animate-pulse',
    };

    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      emergency: '🚨',
    };

    const accessibilityProps = {
      _role: variant === 'emergency' ? 'alert' : 'alertdialog',
      'aria-live': variant === 'emergency' ? 'assertive' : 'polite',
      'aria-atomic': 'true',
      'aria-labelledby': title ? `${alertId}-title` : undefined,
      'aria-describedby': children ? `${alertId}-description` : undefined,
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative p-4 rounded-md border',
          variants[variant],
          className,
        )}
        {...accessibilityProps}
        {...props}
      >
        {dismissible && (
          <button
            onClick={onDismiss}
            className='absolute top-2 right-2 text-gray-500 hover:text-gray-700'
            aria-label='Close alert'
          >
            ✕
          </button>
        )}

        <div className='flex items-start space-x-3'>
          <span className='text-lg' aria-hidden='true'>
            {icons[variant]}
          </span>

          <div className='flex-1 space-y-2'>
            {title && (
              <h4
                id={`${alertId}-title`}
                className={cn(
                  'font-medium',
                  variant === 'emergency' && 'font-bold text-lg',
                )}
              >
                {title}
              </h4>
            )}

            {children && (
              <div id={`${alertId}-description`} className='text-sm'>
                {children}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);
AccessibleAlert.displayName = 'AccessibleAlert';

// Enhanced accessible modal component for healthcare
export const AccessibleModal = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    'data-medical'?: boolean;
  }
>(({
      className,isOpen, onClose,title, description, size = 'md',
      'data-medical': isMedical,children, ...props
    },ref,
  ) => {
    const modalId = React.useId();
    const titleId = title ? `${modalId}-title` : undefined;
    const descriptionId = description ? `${modalId}-description` : undefined;

    const sizes = {
      sm: 'max-w-md',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
    };

    if (!isOpen) return null;

    const accessibilityProps = {
      _role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': titleId,
      'aria-describedby': descriptionId,
    };

    return (
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
        <div
          ref={ref}
          className={cn(
            'bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto',
            sizes[size],
            isMedical && 'border-4 border-blue-300',
            className,
          )}
          {...accessibilityProps}
          {...props}
        >
          <div className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              {title && (
                <h2
                  id={titleId}
                  className={cn(
                    'text-xl font-semibold',
                    isMedical && 'text-blue-800',
                  )}
                >
                  {title}
                </h2>
              )}
              <button
                onClick={onClose}
                className='text-gray-500 hover:text-gray-700 text-2xl leading-none'
                aria-label='Close modal'
              >
                ×
              </button>
            </div>

            {description && (
              <p id={descriptionId} className='text-gray-600 mb-4'>
                {description}
              </p>
            )}

            {children}
          </div>
        </div>
      </div>
    );
  },
);
AccessibleModal.displayName = 'AccessibleModal';

// Enhanced accessible table component for healthcare
export const AccessibleTable = React.forwardRef<
  HTMLTableElement,
  React.TableHTMLAttributes<HTMLTableElement> & {
    caption?: string;
    'data-medical'?: boolean;
    columns: Array<{
      key: string;
      label: string;
      sortable?: boolean;
      align?: 'left' | 'center' | 'right';
    }>;
  }
>(({
      className,caption,
      'data-medical': isMedical,columns, children, ...props
    },ref,
  ) => {
    const tableId = React.useId();
    const captionId = caption ? `${tableId}-caption` : undefined;

    const accessibilityProps = {
      'aria-describedby': captionId,
      'aria-label': props['aria-label'] || caption,
      _role: 'table',
    };

    return (
      <div className='overflow-x-auto'>
        <table
          ref={ref}
          className={cn(
            'w-full border-collapse border border-gray-300',
            isMedical && 'border-blue-200',
            className,
          )}
          {...accessibilityProps}
          {...props}
        >
          {caption && (
            <caption
              id={captionId}
              className='text-sm font-medium text-gray-700 mb-2'
            >
              {caption}
            </caption>
          )}

          <thead>
            <tr className={cn('bg-gray-50', isMedical && 'bg-blue-50')}>
              {columns.map(column => (
                <th
                  key={column.key}
                  scope='col'
                  className={cn(
                    'border border-gray-300 px-4 py-2 text-left font-medium text-gray-700',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.sortable && 'cursor-pointer hover:bg-gray-100',
                    isMedical && 'border-blue-200 text-blue-800',
                  )}
                  aria-sort={column.sortable ? 'none' : undefined}
                >
                  {column.label}
                  {column.sortable && (
                    <span className='ml-1' aria-hidden='true'>
                      ↕
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>{children}</tbody>
        </table>
      </div>
    );
  },
);
AccessibleTable.displayName = 'AccessibleTable';

// Export all enhanced components
export {
  AccessibleAlert,
  AccessibleButton,
  AccessibleForm,
  AccessibleInput,
  AccessibleModal,
  AccessibleSelect,
  AccessibleTable,
};
