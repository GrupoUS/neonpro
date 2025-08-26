import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '../utils/cn';

const avatarVariants = cva(
  'relative flex shrink-0 overflow-hidden rounded-full',
  {
    variants: {
      size: {
        sm: 'h-8 w-8',
        default: 'h-10 w-10',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16',
        '2xl': 'h-20 w-20',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

export interface AvatarProps
  extends
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants>
{
  /**
   * Image source URL
   */
  src?: string;
  /**
   * Alternative text for the image
   */
  alt?: string;
  /**
   * Size variant
   */
  size?: 'sm' | 'default' | 'lg' | 'xl' | '2xl';
  /**
   * Fallback content (usually initials)
   */
  fallback?: string;
  /**
   * Whether to show an online indicator
   */
  online?: boolean;
  /**
   * Custom status indicator color
   */
  statusColor?: 'green' | 'yellow' | 'red' | 'gray';
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(
  (
    { className, size, src, alt, fallback, online, statusColor, ...props },
    ref,
  ) => {
    return (
      <div className="relative">
        <AvatarPrimitive.Root
          className={cn(avatarVariants({ size }), className)}
          ref={ref}
          {...props}
        >
          <AvatarImage alt={alt} src={src} />
          <AvatarFallback>{fallback}</AvatarFallback>
        </AvatarPrimitive.Root>

        {(online !== undefined || statusColor) && (
          <span
            className={cn(
              'absolute right-0 bottom-0 block rounded-full ring-2 ring-white',
              size === 'sm' && 'h-2 w-2',
              size === 'default' && 'h-2.5 w-2.5',
              size === 'lg' && 'h-3 w-3',
              size === 'xl' && 'h-3.5 w-3.5',
              size === '2xl' && 'h-4 w-4',
              statusColor === 'green' && 'bg-green-400',
              statusColor === 'yellow' && 'bg-yellow-400',
              statusColor === 'red' && 'bg-red-400',
              statusColor === 'gray' && 'bg-gray-400',
              !statusColor && online && 'bg-green-400',
              !statusColor && online === false && 'bg-gray-400',
            )}
          />
        )}
      </div>
    );
  },
);
Avatar.displayName = AvatarPrimitive.Root.displayName;
const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    className={cn('aspect-square h-full w-full', className)}
    ref={ref}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-muted font-medium text-muted-foreground text-sm',
      className,
    )}
    ref={ref}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarFallback, AvatarImage };
