import React from 'react';
import { cn } from '@/lib/utils';

interface MetricCardSkeletonProps {
  variant?: 'compact' | 'detailed' | 'chart';
  className?: string;
}

export default function MetricCardSkeleton({ 
  variant = 'compact',
  className 
}: MetricCardSkeletonProps) {
  return (
    <div className={cn(
      "glass-card p-6 animate-pulse",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 bg-gray-300/50 dark:bg-gray-700/50 rounded w-24"></div>
        <div className="h-8 w-8 bg-gray-300/50 dark:bg-gray-700/50 rounded-full"></div>
      </div>
      
      {/* Value */}
      <div className="h-8 bg-gray-300/50 dark:bg-gray-700/50 rounded w-32 mb-2"></div>
      
      {/* Change */}
      <div className="flex items-center gap-2">
        <div className="h-4 bg-gray-300/50 dark:bg-gray-700/50 rounded w-20"></div>
      </div>

      {/* Chart for detailed/chart variants */}
      {variant === 'detailed' && (
        <div className="mt-4 h-12 bg-gray-300/50 dark:bg-gray-700/50 rounded"></div>
      )}
      
      {variant === 'chart' && (
        <div className="mt-6 h-24 bg-gray-300/50 dark:bg-gray-700/50 rounded"></div>
      )}
    </div>
  );
}