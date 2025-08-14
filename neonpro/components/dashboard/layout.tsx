'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

export default function DashboardLayout({
  children,
  className,
  title,
  description,
}: DashboardLayoutProps) {
  return (
    <div className={cn('flex flex-col space-y-6', className)}>
      {(title || description) && (
        <div className="space-y-2">
          {title && (
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          )}
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div className="flex-1">{children}</div>
    </div>
  );
}