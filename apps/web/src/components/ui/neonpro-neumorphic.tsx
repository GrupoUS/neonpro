/**
 * NeonPro Neumorphic Design System
 * Healthcare-focused neumorphic components with brand integration
 *
 * Features:
 * - NeonPro brand color palette integration
 * - Healthcare-specific neumorphic patterns
 * - Accessibility-compliant design (WCAG 2.1 AA+)
 * - Mobile-first responsive design
 * - Clinical workflow optimization
 * - Calming aesthetic for healthcare environments
 */

'use client';

import { cn } from '@neonpro/ui';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';

// NeonPro Brand Color System
const neonProColors = {
  primary: '#AC9469', // Golden Primary - Aesthetic Luxury
  deepBlue: '#112031', // Healthcare Professional - Trust & Reliability
  accent: '#d2aa60ff', // Gold Accent - Premium Services
  neutral: '#B4AC9C', // Calming Light Beige
  background: '#D2D0C8', // Soft Gray Background
  light: '#F6F5F2', // Light background for cards
  white: '#FFFFFF',
  text: {
    primary: '#112031',
    secondary: '#B4AC9C',
    muted: '#8B8B8B',
  },
} as const;

// Neumorphic Shadow System for Healthcare
const neumorphicShadows = {
  // Raised elements (buttons, cards)
  raised: {
    light: '6px 6px 12px #beb9b1, -6px -6px 12px #e6e1df',
    dark: '6px 6px 12px #0a0d11, -6px -6px 12px #182b51',
  },
  // Inset elements (inputs, pressed buttons)
  inset: {
    light: 'inset 4px 4px 8px #beb9b1, inset -4px -4px 8px #e6e1df',
    dark: 'inset 4px 4px 8px #0a0d11, inset -4px -4px 8px #182b51',
  },
  // Subtle elevation for content areas
  subtle: {
    light: '2px 2px 4px #c5c0b8, -2px -2px 4px #dfd9d8',
    dark: '2px 2px 4px #0c0f14, -2px -2px 4px #16294e',
  },
  // Strong elevation for modals and popups
  strong: {
    light: '10px 10px 20px #a8a398, -10px -10px 20px #fcf7f8',
    dark: '10px 10px 20px #08090c, -10px -10px 20px #1e3556',
  },
} as const;

// Neumorphic Button Variants
const neumorphicButtonVariants = cva(
  [
    'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
    'active:scale-95 hover:scale-[1.02]',
  ],
  {
    variants: {
      variant: {
        // Primary healthcare button
        primary: [
          'bg-gradient-to-br from-[#AC9469] to-[#d2aa60ff] text-white',
          'shadow-[6px_6px_12px_#8d7854, -6px_-6px_12px_#cbb07e]',
          'hover:shadow-[4px_4px_8px_#8d7854, -4px_-4px_8px_#cbb07e]',
          'active:shadow-[inset_4px_4px_8px_#8d7854, inset_-4px_-4px_8px_#cbb07e]',
          'focus:ring-[#AC9469]/50',
        ],
        // Professional healthcare button
        professional: [
          'bg-gradient-to-br from-[#112031] to-[#294359] text-white',
          'shadow-[6px_6px_12px_#0a0d11, -6px_-6px_12px_#182b51]',
          'hover:shadow-[4px_4px_8px_#0a0d11, -4px_-4px_8px_#182b51]',
          'active:shadow-[inset_4px_4px_8px_#0a0d11, inset_-4px_-4px_8px_#182b51]',
          'focus:ring-[#112031]/50',
        ],
        // Neutral/secondary button
        neutral: [
          'bg-[#D2D0C8] text-[#112031]',
          'shadow-[6px_6px_12px_#beb9b1, -6px_-6px_12px_#e6e1df]',
          'hover:shadow-[4px_4px_8px_#beb9b1, -4px_-4px_8px_#e6e1df]',
          'active:shadow-[inset_4px_4px_8px_#beb9b1, inset_-4px_-4px_8px_#e6e1df]',
          'focus:ring-[#B4AC9C]/50',
        ],
        // Soft button for subtle actions
        soft: [
          'bg-[#F6F5F2] text-[#112031]',
          'shadow-[2px_2px_4px_#e1dfdc, -2px_-2px_4px_#ffffff]',
          'hover:shadow-[1px_1px_2px_#e1dfdc, -1px_-1px_2px_#ffffff]',
          'active:shadow-[inset_2px_2px_4px_#e1dfdc, inset_-2px_-2px_4px_#ffffff]',
          'focus:ring-[#AC9469]/30',
        ],
        // Alert/danger button for critical actions
        alert: [
          'bg-gradient-to-br from-[#dc2626] to-[#b91c1c] text-white',
          'shadow-[6px_6px_12px_#991b1b, -6px_-6px_12px_#ef4444]',
          'hover:shadow-[4px_4px_8px_#991b1b, -4px_-4px_8px_#ef4444]',
          'active:shadow-[inset_4px_4px_8px_#991b1b, inset_-4px_-4px_8px_#ef4444]',
          'focus:ring-red-500/50',
        ],
      },
      size: {
        sm: 'h-9 px-3 text-xs',
        default: 'h-12 px-6 text-sm',
        lg: 'h-14 px-8 text-base',
        xl: 'h-16 px-10 text-lg',
        // Healthcare-specific sizes for clinical environments
        clinical: 'h-16 px-8 text-base', // Larger touch targets for clinical use
        emergency: 'h-20 px-12 text-xl font-bold', // Emergency situations
      },
    },
    defaultVariants: {
      variant: 'neutral',
      size: 'default',
    },
  },
);

// Neumorphic Card Variants
const neumorphicCardVariants = cva(
  [
    'rounded-2xl transition-all duration-300',
    'border-0', // Remove default borders for neumorphic effect
  ],
  {
    variants: {
      variant: {
        // Raised card for main content
        raised: [
          'bg-[#D2D0C8]',
          'shadow-[8px_8px_16px_#beb9b1, -8px_-8px_16px_#e6e1df]',
          'hover:shadow-[6px_6px_12px_#beb9b1, -6px_-6px_12px_#e6e1df]',
        ],
        // Inset card for content wells
        inset: [
          'bg-[#D2D0C8]',
          'shadow-[inset_6px_6px_12px_#beb9b1, inset_-6px_-6px_12px_#e6e1df]',
        ],
        // Floating card for modals and overlays
        floating: [
          'bg-[#F6F5F2]',
          'shadow-[12px_12px_24px_#a8a398, -12px_-12px_24px_#fcf7f8]',
          'hover:shadow-[8px_8px_16px_#a8a398, -8px_-8px_16px_#fcf7f8]',
        ],
        // Patient card with healthcare-specific styling
        patient: [
          'bg-gradient-to-br from-[#F6F5F2] to-[#D2D0C8]',
          'shadow-[6px_6px_12px_#beb9b1, -6px_-6px_12px_#e6e1df]',
          'hover:shadow-[4px_4px_8px_#beb9b1, -4px_-4px_8px_#e6e1df]',
          'border-l-4 border-l-[#AC9469]', // Accent border for identification
        ],
        // Alert card for important information
        alert: [
          'bg-gradient-to-br from-[#fef2f2] to-[#fee2e2]',
          'shadow-[6px_6px_12px_#f3c7c7, -6px_-6px_12px_#ffffff]',
          'border-l-4 border-l-red-500',
        ],
        // Success card for positive feedback
        success: [
          'bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7]',
          'shadow-[6px_6px_12px_#c7e7c7, -6px_-6px_12px_#ffffff]',
          'border-l-4 border-l-green-500',
        ],
      },
      size: {
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
      },
    },
    defaultVariants: {
      variant: 'raised',
      size: 'default',
    },
  },
);

// Neumorphic Input Variants
const neumorphicInputVariants = cva(
  [
    'w-full rounded-xl border-0 bg-transparent transition-all duration-200',
    'placeholder:text-[#B4AC9C] text-[#112031]',
    'focus:outline-none focus:ring-2 focus:ring-[#AC9469]/50 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ],
  {
    variants: {
      variant: {
        // Standard inset input
        inset: [
          'bg-[#D2D0C8]',
          'shadow-[inset_4px_4px_8px_#beb9b1, inset_-4px_-4px_8px_#e6e1df]',
          'focus:shadow-[inset_2px_2px_4px_#beb9b1, inset_-2px_-2px_4px_#e6e1df]',
        ],
        // Light input for better contrast
        light: [
          'bg-[#F6F5F2]',
          'shadow-[inset_2px_2px_4px_#e1dfdc, inset_-2px_-2px_4px_#ffffff]',
          'focus:shadow-[inset_1px_1px_2px_#e1dfdc, inset_-1px_-1px_2px_#ffffff]',
        ],
        // Medical input with enhanced accessibility
        medical: [
          'bg-[#F6F5F2]',
          'shadow-[inset_3px_3px_6px_#e1dfdc, inset_-3px_-3px_6px_#ffffff]',
          'focus:shadow-[inset_1px_1px_2px_#e1dfdc, inset_-1px_-1px_2px_#ffffff]',
          'border-2 border-transparent focus:border-[#AC9469]',
        ],
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        default: 'h-12 px-4 text-sm',
        lg: 'h-14 px-6 text-base',
        // Healthcare-specific sizes
        clinical: 'h-16 px-6 text-base', // Larger for clinical environments
      },
    },
    defaultVariants: {
      variant: 'inset',
      size: 'default',
    },
  },
);

// Neumorphic Button Component
export interface NeumorphicButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof neumorphicButtonVariants>
{
  // asChild removed - not used in implementation
}

const NeumorphicButton = forwardRef<HTMLButtonElement, NeumorphicButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(neumorphicButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
NeumorphicButton.displayName = 'NeumorphicButton';

// Neumorphic Card Component
export interface NeumorphicCardProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof neumorphicCardVariants>
{
  // asChild removed - not used in implementation
}

const NeumorphicCard = forwardRef<HTMLDivElement, NeumorphicCardProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        className={cn(neumorphicCardVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
NeumorphicCard.displayName = 'NeumorphicCard';

// Neumorphic Input Component
export interface NeumorphicInputProps
  extends React.InputHTMLAttributes<HTMLInputElement>, VariantProps<typeof neumorphicInputVariants>
{}

const NeumorphicInput = forwardRef<HTMLInputElement, NeumorphicInputProps>(
  ({ className, variant, size, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(neumorphicInputVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
NeumorphicInput.displayName = 'NeumorphicInput';

// Neumorphic Textarea Component
export interface NeumorphicTextareaProps
  extends
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof neumorphicInputVariants>
{}

const NeumorphicTextarea = forwardRef<HTMLTextAreaElement, NeumorphicTextareaProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          neumorphicInputVariants({ variant, size }),
          'min-h-[80px] resize-none',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
NeumorphicTextarea.displayName = 'NeumorphicTextarea';

// Healthcare-specific components

// Patient Status Badge
export interface PatientStatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'urgent' | 'completed';
  className?: string;
}

const PatientStatusBadge = forwardRef<HTMLSpanElement, PatientStatusBadgeProps>(
  ({ status, className, ...props }, ref) => {
    const statusStyles = {
      active:
        'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-[2px_2px_4px_#22c55e80, -2px_-2px_4px_#4ade8080]',
      inactive:
        'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-[2px_2px_4px_#6b728080, -2px_-2px_4px_#9ca3af80]',
      pending:
        'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-[2px_2px_4px_#eab30880, -2px_-2px_4px_#f59e0b80]',
      urgent:
        'bg-gradient-to-r from-red-400 to-red-500 text-white shadow-[2px_2px_4px_#ef444480, -2px_-2px_4px_#f8717180]',
      completed:
        'bg-gradient-to-r from-[#AC9469] to-[#d2aa60ff] text-white shadow-[2px_2px_4px_#AC946980, -2px_-2px_4px_#d2aa6080]',
    };

    return (
      <span
        className={cn(
          'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-200',
          statusStyles[status],
          className,
        )}
        ref={ref}
        {...props}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  },
);
PatientStatusBadge.displayName = 'PatientStatusBadge';

// Medical Alert Card
export interface MedicalAlertCardProps extends React.HTMLAttributes<HTMLDivElement> {
  alertType: 'info' | 'warning' | 'error' | 'success';
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

const MedicalAlertCard = forwardRef<HTMLDivElement, MedicalAlertCardProps>(
  ({ alertType, title, description, icon, className, children, ...props }, ref) => {
    const alertStyles = {
      info:
        'from-blue-50 to-blue-100 border-l-blue-500 shadow-[6px_6px_12px_#c7d2fe, -6px_-6px_12px_#ffffff]',
      warning:
        'from-yellow-50 to-yellow-100 border-l-yellow-500 shadow-[6px_6px_12px_#fde68a, -6px_-6px_12px_#ffffff]',
      error:
        'from-red-50 to-red-100 border-l-red-500 shadow-[6px_6px_12px_#fecaca, -6px_-6px_12px_#ffffff]',
      success:
        'from-green-50 to-green-100 border-l-green-500 shadow-[6px_6px_12px_#bbf7d0, -6px_-6px_12px_#ffffff]',
    };

    return (
      <div
        className={cn(
          'rounded-2xl p-6 bg-gradient-to-br border-l-4 transition-all duration-300',
          alertStyles[alertType],
          className,
        )}
        ref={ref}
        role='alert'
        aria-live='polite'
        {...props}
      >
        <div className='flex items-start gap-4'>
          {icon && (
            <div className='flex-shrink-0 mt-1'>
              {icon}
            </div>
          )}
          <div className='flex-1'>
            <h3 className='font-semibold text-[#112031] mb-2'>{title}</h3>
            {description && <p className='text-sm text-[#112031]/70 mb-3'>{description}</p>}
            {children}
          </div>
        </div>
      </div>
    );
  },
);
MedicalAlertCard.displayName = 'MedicalAlertCard';

// Clinical Action Panel
export interface ClinicalActionPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const ClinicalActionPanel = forwardRef<HTMLDivElement, ClinicalActionPanelProps>(
  ({ title, subtitle, actions, className, children, ...props }, ref) => {
    return (
      <div
        className={cn(
          'rounded-2xl bg-[#F6F5F2] p-6',
          'shadow-[8px_8px_16px_#e1dfdc, -8px_-8px_16px_#ffffff]',
          'hover:shadow-[6px_6px_12px_#e1dfdc, -6px_-6px_12px_#ffffff]',
          'transition-all duration-300',
          className,
        )}
        ref={ref}
        {...props}
      >
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h2 className='text-lg font-semibold text-[#112031]'>{title}</h2>
            {subtitle && <p className='text-sm text-[#B4AC9C] mt-1'>{subtitle}</p>}
          </div>
          {actions && (
            <div className='flex items-center gap-2'>
              {actions}
            </div>
          )}
        </div>
        {children}
      </div>
    );
  },
);
ClinicalActionPanel.displayName = 'ClinicalActionPanel';

export {
  ClinicalActionPanel,
  MedicalAlertCard,
  neonProColors,
  NeumorphicButton,
  NeumorphicCard,
  NeumorphicInput,
  neumorphicShadows,
  NeumorphicTextarea,
  PatientStatusBadge,
};

export type {
  ClinicalActionPanelProps,
  MedicalAlertCardProps,
  NeumorphicButtonProps,
  NeumorphicCardProps,
  NeumorphicInputProps,
  NeumorphicTextareaProps,
  PatientStatusBadgeProps,
};
