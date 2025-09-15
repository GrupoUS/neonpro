'use client';

import { motion } from 'framer-motion';
import React from 'react';
import { TiltedCard } from './tilted-card';

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
  enableTilt?: boolean;
}

export function DashboardCard({
  children,
  className = '',
  enableTilt = true,
}: DashboardCardProps) {
  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.1}
      whileDrag={{
        scale: 1.05,
        rotate: 2,
        zIndex: 10,
      }}
      className={`cursor-grab active:cursor-grabbing ${className}`}
    >
      {enableTilt
        ? (
          <TiltedCard className='h-full w-full'>
            {children}
          </TiltedCard>
        )
        : (
          <div className='h-full w-full'>
            {children}
          </div>
        )}
    </motion.div>
  );
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardLayout({ children, className = '' }: DashboardLayoutProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Dashboard Content - Always draggable */}
      <div className='grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'>
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              key: child.key || `dashboard-card-${index}`,
            });
          }
          return child;
        })}
      </div>

      {/* Helpful hint */}
      <div className='mt-4 text-xs text-muted-foreground text-center'>
        💡 Arraste e solte os cards para reorganizar o layout do seu dashboard
      </div>
    </div>
  );
}
