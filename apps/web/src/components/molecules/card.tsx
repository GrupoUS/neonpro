import * as React from 'react';

import { cn } from '@/lib/utils';

import { MagicCard } from '@/components/ui/magic-card';
import { ShineBorder } from '@/components/ui/shine-border';

type BaseCardProps = React.ComponentProps<'div'> & {
  /**
   * Opt-in MagicUI effects. Disabled by default to avoid page-wide application.
   * Set `magic` to true only where you want the ShineBorder/MagicCard visuals.
   */
  magic?: boolean;
  /**
   * Legacy: Explicitly disable effects when `magic` might be true via composition.
   */
  magicDisabled?: boolean;
};

function Card({ className, magic = false, magicDisabled, ...props }: BaseCardProps) {
  const inner = (
    <div
      data-slot='card'
      className={cn(
        'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm',
        className,
      )}
      {...props}
    />
  );

  // Avoid introducing animation/DOM wrappers in unit tests to keep them deterministic
  const isTest = typeof import.meta !== 'undefined' && (import.meta as any).env?.MODE === 'test';

  const enableMagic = !!magic && !magicDisabled && !isTest;
  if (!enableMagic) return inner;

  // Apply ShineBorder + MagicCard wrappers only when opted in
  return (
    <ShineBorder>
      <MagicCard>{inner}</MagicCard>
    </ShineBorder>
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='card-header'
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='card-title'
      className={cn('leading-none font-semibold', className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='card-description'
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='card-content'
      className={cn('px-6', className)}
      {...props}
    />
  );
}

export { Card, CardContent, CardDescription, CardHeader, CardTitle };
