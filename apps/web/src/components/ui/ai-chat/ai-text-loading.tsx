'use client';

import { cn } from '@neonpro/ui';
import { useEffect, useState } from 'react';
import type { AITextLoadingProps } from './types';

/**
 * AI Text Loading Component for NeonPro Aesthetic Clinic
 * Animated dots with aesthetic clinic styling for text generation
 */
export default function AITextLoading({
  message = 'IA está pensando',
  dotColor = '#294359',
  speed = 600,
  className,
}: AITextLoadingProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, speed);

    return () => clearInterval(interval);
  }, [speed]);

  return (
    <div className={cn('flex items-center space-x-2 py-2', className)}>
      <span className='text-[#B4AC9C] text-sm'>{message}</span>
      <span
        className='text-sm font-mono'
        style={{ color: dotColor }}
        aria-hidden='true'
      >
        {dots}
        <span className='invisible'>...</span> {/* Reserve space */}
      </span>

      {/* Screen Reader Text */}
      <span className='sr-only'>
        Inteligência artificial gerando resposta para clínica estética
      </span>
    </div>
  );
}
