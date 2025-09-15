'use client';

import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react'; // no title prop support on Lucide icons
import { useState } from 'react'; // React import not needed for JSX (react-jsx)

interface AIBrandIconProps {
  size?: number;
  className?: string;
  alt?: string;
  title?: string; // only applied to <img>, not Lucide icon
}

/**
 * AIBrandIcon — NeonPro AI icon with graceful fallback
 * - Uses `/brand/iconeneonpro.png` if available
 * - Falls back to a Sparkles icon if the PNG is missing or fails to load
 */
export function AIBrandIcon({
  size = 24,
  className,
  alt = 'NeonPro AI',
  title = 'NeonPro AI',
}: AIBrandIconProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <Sparkles
        width={size}
        height={size}
        className={cn('text-[#AC9469]', className)}
        aria-hidden
        // no title prop on Lucide icon
      />
    );
  }

  return (
    <img
      src='/brand/iconeneonpro.png'
      width={size}
      height={size}
      alt={alt}
      title={title}
      className={cn('inline-block', className)}
      onError={e => {
        // First fallback to SVG version, then to Sparkles icon
        if ((e.currentTarget as HTMLImageElement).src.includes('.png')) {
          (e.currentTarget as HTMLImageElement).src = '/brand/iconeneonpro.svg';
        } else {
          setFailed(true);
        }
      }}
    />
  );
}
