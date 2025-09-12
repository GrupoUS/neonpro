"use client";

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AILoadingProps } from './types';

/**
 * AI Loading Component for NeonPro Aesthetic Clinic
 * Elegant loading state with aesthetic clinic branding
 */
export default function AILoading({
  size = 'default',
  message = "Processando...",
  showMessage = true,
  className,
}: AILoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6', 
    lg: 'h-8 w-8',
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center space-y-2",
      className
    )}>
      {/* Spinning Icon */}
      <Loader2 
        className={cn(
          "animate-spin text-[#294359]",
          sizeClasses[size]
        )}
        aria-hidden="true"
      />
      
      {/* Loading Message */}
      {showMessage && (
        <p className="text-sm text-[#B4AC9C] text-center">
          {message}
        </p>
      )}
      
      {/* Screen Reader Text */}
      <span className="sr-only">
        Carregando resposta da IA para clínica estética
      </span>
    </div>
  );
}