import { cva, type VariantProps } from 'class-variance-authority';
import { type HTMLMotionProps, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import type React from 'react';

const buttonVariants = cva(
  // Base styles
  'justify-center px-4 text-sm font-medium items-center transition-[box-shadow,background-color] disabled:cursor-not-allowed disabled:opacity-50 flex active:transition-none',
  {
    variants: {
      intent: {
        default: [
          'bg-[#AC9469]', // NeonPro Gold
          'text-[#fff]',
          'hover:enabled:bg-[#B8A076]',
          'disabled:bg-[#D4C8B4]',
          '[box-shadow:inset_0px_-2px_0px_0px_#8B7A56,_0px_1px_6px_0px_rgba(172,_148,_105,_58%)]',
          'hover:enabled:[box-shadow:inset_0px_-2.5px_0px_0px_#8B7A56,_0px_1.5px_7px_0px_rgba(172,_148,_105,_64%)]',
          'disabled:shadow-none',
          'active:bg-[#9A8459]',
          'active:[box-shadow:inset_0px_-1.5px_0px_0px_#8B7A56,_0px_0.5px_2px_0px_rgba(172,_148,_105,_70%)]',
        ],
        primary: [
          'bg-[#112031]', // NeonPro Deep Blue
          'text-[#fff]',
          'hover:enabled:bg-[#1A2F47]',
          'disabled:bg-[#7A8A9A]',
          '[box-shadow:inset_0px_-2px_0px_0px_#0A1520,_0px_1px_6px_0px_rgba(17,_32,_49,_58%)]',
          'hover:enabled:[box-shadow:inset_0px_-2.5px_0px_0px_#0A1520,_0px_1.5px_7px_0px_rgba(17,_32,_49,_64%)]',
          'disabled:shadow-none',
          'active:bg-[#0F1B28]',
          'active:[box-shadow:inset_0px_-1.5px_0px_0px_#0A1520,_0px_0.5px_2px_0px_rgba(17,_32,_49,_70%)]',
        ],
        secondary: [
          'bg-[#FFFFFF]',
          'text-[#36322F]',
          'hover:enabled:bg-[#F8F8F8]',
          'disabled:bg-[#F0F0F0]',
          '[box-shadow:inset_0px_-2.108433723449707px_0px_0px_#E0E0E0,_0px_1.2048193216323853px_6.325301647186279px_0px_rgba(0,_0,_0,_10%)]',
          'hover:enabled:[box-shadow:inset_0px_-2.53012px_0px_0px_#E8E8E8,_0px_1.44578px_7.59036px_0px_rgba(0,_0,_0,_12%)]',
          'disabled:shadow-none',
          'border',
          'border-[#E0E0E0]',
          'active:bg-[#F0F0F0]',
          'active:[box-shadow:inset_0px_-1.5px_0px_0px_#D8D8D8,_0px_0.5px_2px_0px_rgba(0,_0,_0,_15%)]',
        ],
        danger: [
          'bg-[#E6492D]',
          'text-[#fff]',
          'hover:enabled:bg-[#F05B41]',
          'disabled:bg-[#F5A799]',
          '[box-shadow:inset_0px_-2.108433723449707px_0px_0px_#D63A1F,_0px_1.2048193216323853px_6.325301647186279px_0px_rgba(214,_58,_31,_58%)]',
          'hover:enabled:[box-shadow:inset_0px_-2.53012px_0px_0px_#E6492D,_0px_1.44578px_7.59036px_0px_rgba(214,_58,_31,_64%)]',
          'disabled:shadow-none',
          'active:bg-[#D63A1F]',
          'active:[box-shadow:inset_0px_-1.5px_0px_0px_#B22E17,_0px_0.5px_2px_0px_rgba(214,_58,_31,_70%)]',
        ],
      },
      size: {
        small: ['text-xs', 'py-1', 'px-2', 'h-9', 'rounded-[6px]'],
        medium: ['text-base', 'py-2', 'px-4', 'h-11', 'rounded-[7px]'],
        large: ['text-lg', 'py-3', 'px-6', 'h-14', 'rounded-[8px]'],
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    compoundVariants: [
      {
        intent: ['default', 'primary', 'secondary', 'danger'],
        size: 'medium',
        className: 'uppercase',
      },
    ],
    defaultVariants: {
      intent: 'default',
      size: 'medium',
    },
  },
);

export interface NeumorphButtonProps
  extends HTMLMotionProps<'button'>, VariantProps<typeof buttonVariants>
{
  children: React.ReactNode;
  loading?: boolean;
}

const NeumorphButton: React.FC<NeumorphButtonProps> = ({
  className,
  intent,
  size,
  fullWidth,
  children,
  loading = false,
  disabled,
  ...props
}) => {
  return (
    <motion.button
      className={buttonVariants({ intent, size, fullWidth, className })}
      disabled={disabled || loading}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      {...props}
    >
      {loading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
      <span>{children}</span>
    </motion.button>
  );
};

// Backward compatibility interface for existing shadcn Button API
export interface ButtonProps extends Omit<NeumorphButtonProps, 'intent' | 'size'> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

// Backward compatibility wrapper
const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'default',
  asChild: _asChild, // Ignored for neumorph button
  ...props
}) => {
  // Map old variant names to new intent names
  const intentMap = {
    default: 'default' as const,
    destructive: 'danger' as const,
    outline: 'secondary' as const,
    secondary: 'secondary' as const,
    ghost: 'secondary' as const,
    link: 'secondary' as const,
  };

  // Map old size names to new size names
  const sizeMap = {
    default: 'medium' as const,
    sm: 'small' as const,
    lg: 'large' as const,
    icon: 'small' as const,
  };

  return (
    <NeumorphButton
      intent={intentMap[variant]}
      size={sizeMap[size]}
      {...props}
    />
  );
};

Button.displayName = 'Button';

export { Button, buttonVariants, NeumorphButton };
